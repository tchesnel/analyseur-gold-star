// Macro Gold sans clé API : FRED public + calendriers officiels BLS/BEA/Fed.
// Les erreurs réseau n'interrompent jamais le flux cTrader.

const CACHE_MS=5*60_000;let cache={at:0,value:null};
function finite(n){return n!==null&&n!==undefined&&n!==''&&Number.isFinite(Number(n));}
async function text(url,timeout=5000){const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),timeout);try{const r=await fetch(url,{headers:{'user-agent':'GoldLiveAnalyzer/0.5 (+read-only market context)'},signal:controller.signal});if(!r.ok)throw new Error(`${r.status} ${url}`);return await r.text();}finally{clearTimeout(timer);}}
export function parseFredCsv(csv){const lines=String(csv).trim().split(/\r?\n/);if(lines.length<2)return[];const out=[];for(const line of lines.slice(1)){const [date,valRaw]=line.split(',');const val=String(valRaw??'').trim();if(!date||!val||val==='.')continue;const value=Number(val);if(finite(value))out.push({date,value});}return out;}
async function fred(id){const rows=parseFredCsv(await text(`https://fred.stlouisfed.org/graph/fredgraph.csv?id=${encodeURIComponent(id)}`));const last=rows.at(-1),prev=rows.at(-2);return last?{value:last.value,date:last.date,change:prev?last.value-prev.value:null,source:'FRED'}:null;}
export function parseTreasuryXmlSeries(xml,tag){
  const entries=String(xml).split(/<entry[\s>]/i).slice(1),out=[];const esc=String(tag).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  const valueRe=new RegExp(`<d:${esc}(?:\\s[^>]*)?>([^<]+)</d:${esc}>`,'i');
  for(const entry of entries){const date=(entry.match(/<d:NEW_DATE(?:\s[^>]*)?>([^<]+)<\/d:NEW_DATE>/i)||[])[1];const raw=(entry.match(valueRe)||[])[1];if(!date||raw===undefined)continue;const value=Number(String(raw).trim());if(finite(value))out.push({date:String(date).slice(0,10),value});}
  return out.sort((a,b)=>a.date.localeCompare(b.date));
}
async function treasury10y({real=false,now=Date.now()}={}){
  const year=new Date(now).getUTCFullYear();const data=real?'daily_treasury_real_yield_curve':'daily_treasury_yield_curve';const tag=real?'TC_10YEAR':'BC_10YEAR';
  const xml=await text(`https://home.treasury.gov/resource-center/data-chart-center/interest-rates/pages/xml?data=${data}&field_tdr_date_value=${year}`,7000);
  const rows=parseTreasuryXmlSeries(xml,tag),last=rows.at(-1),prev=rows.at(-2);return last?{value:last.value,date:last.date,change:prev?last.value-prev.value:null,source:'US Treasury'}:null;
}
async function rateWithTreasuryFallback(fredId,{real=false,now=Date.now()}={}){
  try{const primary=await fred(fredId);if(primary&&finite(primary.value))return primary;}catch{}
  return await treasury10y({real,now});
}
function unescapeIcs(s=''){return String(s).replace(/\\,/g,',').replace(/\\n/g,' ').trim();}

function newYorkToUtc(y,m,d,h,minute=0){
  const target=Date.UTC(y,m,d,h,minute);let ts=target;
  const fmt=new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'});
  for(let i=0;i<3;i++){const parts=Object.fromEntries(fmt.formatToParts(new Date(ts)).map(x=>[x.type,x.value]));const rendered=Date.UTC(Number(parts.year),Number(parts.month)-1,Number(parts.day),Number(parts.hour),Number(parts.minute));ts+=target-rendered;}
  return ts;
}

export function parseBlsIcs(ics,now=Date.now()){
  const blocks=String(ics).split('BEGIN:VEVENT').slice(1);const events=[];for(const b of blocks){const summary=unescapeIcs((b.match(/\nSUMMARY:(.+)/)||[])[1]);const dt=(b.match(/\nDTSTART(?:;[^:]*)?:(\d{8}T?\d{0,6})/)||[])[1];if(!summary||!dt)continue;const y=+dt.slice(0,4),m=+dt.slice(4,6)-1,d=+dt.slice(6,8),hh=dt.includes('T')?+dt.slice(9,11):8,mm=dt.includes('T')?+dt.slice(11,13):30;const time=newYorkToUtc(y,m,d,hh,mm);
    if(time<now-60_000)continue;const low=summary.toLowerCase();let type=null;if(low.includes('consumer price index'))type='CPI';else if(low.includes('employment situation'))type='NFP';else if(low.includes('producer price index'))type='PPI';else if(low.includes('job openings'))type='JOLTS';else if(low.includes('employment cost index'))type='ECI';if(type)events.push({type,title:summary,time,impact:type==='CPI'||type==='NFP'?'critical':'high',source:'BLS'});}
  return events.sort((a,b)=>a.time-b.time);
}
function stripHtml(html){return String(html).replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/\s+/g,' ');}
export function parseBeaSchedule(html,now=Date.now()){
  const s=stripHtml(html),events=[];const months={January:0,February:1,March:2,April:3,May:4,June:5,July:6,August:7,September:8,October:9,November:10,December:11};const re=/(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2})\s+(\d{1,2}:\d{2})\s+(AM|PM)[\s\S]{0,180}?Personal Income and Outlays/gi;let m;while((m=re.exec(s))){const mon=months[m[1]],day=+m[2],[hh0,mi]=m[3].split(':').map(Number),hh=(hh0%12)+(m[4].toUpperCase()==='PM'?12:0),year=new Date(now).getUTCFullYear(),time=newYorkToUtc(year,mon,day,hh,mi);if(time>=now-60_000)events.push({type:'PCE',title:'Personal Income and Outlays (PCE)',time,impact:'critical',source:'BEA'});}return events.sort((a,b)=>a.time-b.time);
}
export function parseFomcCalendar(html,now=Date.now()){
  const s=stripHtml(html),year=new Date(now).getUTCFullYear(),events=[];const months={January:0,February:1,March:2,April:3,May:4,June:5,July:6,August:7,September:8,October:9,November:10,December:11};for(const [name,mon] of Object.entries(months)){const re=new RegExp(`${name}\\s+(\\d{1,2})(?:-(\\d{1,2}))?\\*?`,'i'),m=s.match(re);if(!m)continue;const day=Number(m[2]||m[1]);const time=newYorkToUtc(year,mon,day,14,0);if(time>=now-60_000)events.push({type:'FOMC',title:'FOMC decision / press conference',time,impact:'critical',source:'Federal Reserve'});}return events.sort((a,b)=>a.time-b.time);
}

const FED_MONTH_NAMES=['january','february','march','april','may','june','july','august','september','october','november','december'];
function fedMonthUrl(ts){const d=new Date(ts);return `https://www.federalreserve.gov/newsevents/${d.getUTCFullYear()}-${FED_MONTH_NAMES[d.getUTCMonth()]}.htm`;}
export function parseFedSpeakerCalendar(html,now=Date.now(),year=new Date(now).getUTCFullYear(),month=new Date(now).getUTCMonth()){
  const s=stripHtml(html),events=[];
  const sections=[];
  const speech=(s.match(/Speeches\s+Time:\s+Release Date\(s\):\s+([\s\S]*?)(?=Testimony|FOMC Meetings|Beige Book|Statistical Releases|Other|$)/i)||[])[1];
  const testimony=(s.match(/Testimony\s+Time:\s+Release Date\(s\):\s+([\s\S]*?)(?=FOMC Meetings|Beige Book|Statistical Releases|Other|$)/i)||[])[1];
  if(speech)sections.push({text:speech,kind:'FED_SPEECH'});if(testimony)sections.push({text:testimony,kind:'FED_TESTIMONY'});
  for(const section of sections){
    const re=/(\d{1,2}:\d{2})\s+(a\.m\.|p\.m\.)\s+([\s\S]*?)(?=(?:\d{1,2}:\d{2}\s+(?:a\.m\.|p\.m\.))|$)/gi;let m;
    while((m=re.exec(section.text))){
      const chunk=String(m[3]).replace(/\s+/g,' ').trim();const dayM=chunk.match(/\b(\d{1,2})\s*$/);if(!dayM)continue;const day=Number(dayM[1]);
      const eventText=chunk.replace(/\b\d{1,2}\s*$/,'').replace(/Watch Live/gi,'').trim();
      const relevant=/economic outlook|monetary policy|inflation|labor market|employment|interest rate|rates\b|u\.s\. dollar|international role of the.*dollar|financial stability|semiannual monetary policy/i.test(eventText);
      const senior=/Chairman|\bChair\b|Vice Chair|Governor/i.test(eventText);if(!relevant||!senior)continue;
      const [h0,mi]=m[1].split(':').map(Number);const pm=m[2].toLowerCase().startsWith('p');const h=(h0%12)+(pm?12:0);const time=newYorkToUtc(year,month,day,h,mi);if(time<now-60_000)continue;
      const title=(eventText.match(/(?:Speech|Discussion|Testimony)\s*-\s*[^\n]{1,140}/i)?.[0]??eventText.slice(0,160)).trim();
      events.push({type:section.kind,title,time,impact:'high',source:'Federal Reserve'});
    }
  }
  return events.sort((a,b)=>a.time-b.time);
}
export function macroEventRisk(nextEvent,minutes){
  if(!nextEvent||!Number.isFinite(minutes))return'normal';
  if(nextEvent.impact==='critical'){
    if(minutes<=15)return'critical';
    if(minutes<=60)return'high';
    if(minutes<=240)return'elevated';
    if(minutes<=1440)return'watch';
  }
  if(nextEvent.impact==='high'){
    if(minutes<=30)return'high';
    if(minutes<=120)return'elevated';
    if(minutes<=720)return'watch';
  }
  return'normal';
}
function macroBias({dxy,us10y,real10y}){let score=0;if(finite(dxy?.change))score+=dxy.change>0?-1:dxy.change<0?1:0;if(finite(us10y?.change))score+=us10y.change>0?-1:us10y.change<0?1:0;if(finite(real10y?.change))score+=real10y.change>0?-2:real10y.change<0?2:0;return score>=2?'gold-supportive':score<=-2?'gold-negative':'neutral';}
export async function fetchGoldMacroContext({now=Date.now()}={}){
  if(cache.value&&now-cache.at<CACHE_MS)return cache.value;
  const currentMonth=fedMonthUrl(now);const dNext=new Date(now);dNext.setUTCMonth(dNext.getUTCMonth()+1);const nextMonth=fedMonthUrl(dNext.getTime());
  const [us10yR,realR,dollarR,blsR,beaR,fomcR,fedMonthR,fedNextR]=await Promise.allSettled([
    rateWithTreasuryFallback('DGS10',{real:false,now}),rateWithTreasuryFallback('DFII10',{real:true,now}),fred('DTWEXBGS'),text('https://www.bls.gov/schedule/news_release/bls.ics'),text('https://www.bea.gov/news/schedule'),text('https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm'),text(currentMonth),text(nextMonth)
  ]);
  const us10y=us10yR.status==='fulfilled'?us10yR.value:null,real10y=realR.status==='fulfilled'?realR.value:null,dxy=dollarR.status==='fulfilled'?{...dollarR.value,proxy:'FRED broad dollar index'}:null;let events=[];
  if(blsR.status==='fulfilled')events.push(...parseBlsIcs(blsR.value,now));if(beaR.status==='fulfilled')events.push(...parseBeaSchedule(beaR.value,now));if(fomcR.status==='fulfilled')events.push(...parseFomcCalendar(fomcR.value,now));
  const dn=new Date(now);if(fedMonthR.status==='fulfilled')events.push(...parseFedSpeakerCalendar(fedMonthR.value,now,dn.getUTCFullYear(),dn.getUTCMonth()));const nn=new Date(dNext);if(fedNextR.status==='fulfilled')events.push(...parseFedSpeakerCalendar(fedNextR.value,now,nn.getUTCFullYear(),nn.getUTCMonth()));
  events=events.filter((e,i,a)=>a.findIndex(x=>x.type===e.type&&x.title===e.title&&Math.abs(x.time-e.time)<6*3600_000)===i).sort((a,b)=>a.time-b.time).slice(0,16);
  const nextEvent=events[0]??null,minutes=nextEvent?Math.round((nextEvent.time-now)/60000):null;const risk=macroEventRisk(nextEvent,minutes);
  const value={available:Boolean(us10y||real10y||dxy||events.length),updatedAt:now,us10y,real10y,dxy,events,nextEvent,risk,bias:macroBias({dxy,us10y,real10y}),sources:{fred:Boolean([us10y,real10y,dxy].some(x=>x?.source==='FRED'||x?.proxy)),treasury:Boolean([us10y,real10y].some(x=>x?.source==='US Treasury')),bls:blsR.status==='fulfilled',bea:beaR.status==='fulfilled',fed:fomcR.status==='fulfilled'||fedMonthR.status==='fulfilled'||fedNextR.status==='fulfilled'}};cache={at:now,value};return value;
}
