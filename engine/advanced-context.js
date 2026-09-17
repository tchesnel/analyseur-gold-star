// Contexte avancé XAUUSD : force de tendance, régime de volatilité,
// volume/tick-volume, AVWAP et synthèse d'order-flow. Aucun signal d'exécution.

function finite(n){return n!==null&&n!==undefined&&n!==''&&Number.isFinite(Number(n));}
function avg(xs){const a=xs.filter(finite).map(Number);return a.length?a.reduce((s,x)=>s+x,0)/a.length:null;}
function clamp(n,lo,hi){return Math.max(lo,Math.min(hi,n));}
function stddev(xs){const a=xs.filter(finite).map(Number);if(!a.length)return null;const m=avg(a);return Math.sqrt(avg(a.map(x=>(x-m)**2))||0);}

export function adxDmiSeries(bars,period=14){
  if(!Array.isArray(bars)||bars.length<period*2+2)return[];
  const tr=[],pdm=[],mdm=[];
  for(let i=1;i<bars.length;i++){
    const b=bars[i],p=bars[i-1];
    const up=Number(b.high)-Number(p.high),down=Number(p.low)-Number(b.low);
    tr.push(Math.max(Number(b.high)-Number(b.low),Math.abs(Number(b.high)-Number(p.close)),Math.abs(Number(b.low)-Number(p.close))));
    pdm.push(up>down&&up>0?up:0); mdm.push(down>up&&down>0?down:0);
  }
  let atr=tr.slice(0,period).reduce((s,x)=>s+x,0);
  let ps=pdm.slice(0,period).reduce((s,x)=>s+x,0);
  let ms=mdm.slice(0,period).reduce((s,x)=>s+x,0);
  const dx=[],raw=[];
  const push=(idx)=>{
    const plus=atr>0?100*(ps/atr):0,minus=atr>0?100*(ms/atr):0;
    const denom=plus+minus,dxv=denom>0?100*Math.abs(plus-minus)/denom:0;
    dx.push(dxv); raw.push({time:bars[idx+1].time,plusDI:plus,minusDI:minus,dx:dxv});
  };
  push(period-1);
  for(let i=period;i<tr.length;i++){
    atr=atr-(atr/period)+tr[i]; ps=ps-(ps/period)+pdm[i]; ms=ms-(ms/period)+mdm[i]; push(i);
  }
  if(dx.length<period)return[];
  let adx=avg(dx.slice(0,period))??0; const out=[];
  const first=raw[period-1]; out.push({...first,adx});
  for(let i=period;i<dx.length;i++){adx=((adx*(period-1))+dx[i])/period;out.push({...raw[i],adx});}
  return out;
}

export function bollingerBandwidthSeries(bars,period=20,mult=2){
  if(!Array.isArray(bars)||bars.length<period)return[];
  const out=[];
  for(let i=period-1;i<bars.length;i++){
    const closes=bars.slice(i-period+1,i+1).map(b=>Number(b.close)); const mid=avg(closes); const sd=stddev(closes);
    if(!finite(mid)||!finite(sd)||Math.abs(mid)<1e-12)continue;
    const upper=mid+mult*sd,lower=mid-mult*sd,bandwidth=((upper-lower)/Math.abs(mid))*100;
    out.push({time:bars[i].time,value:bandwidth,mid,upper,lower});
  }
  return out;
}

export function volatilityRegime(bars){
  const bw=bollingerBandwidthSeries(bars,20,2); if(!bw.length)return{state:'unknown',bandwidth:null,percentile:null,series:bw};
  const recent=bw.slice(-100).map(x=>x.value).filter(finite).sort((a,b)=>a-b); const current=bw.at(-1).value;
  const rank=recent.filter(x=>x<=current).length/Math.max(1,recent.length);
  let state='normal'; if(rank<=0.2)state='compression'; else if(rank>=0.8)state='expansion';
  return{state,bandwidth:current,percentile:rank,series:bw};
}

export function anchoredVwapSeries(bars,anchorTime){
  if(!Array.isArray(bars)||!bars.length||!finite(anchorTime))return[];
  let pv=0,vol=0;const out=[];
  for(const b of bars){if(Number(b.time)<Number(anchorTime))continue;const typical=(Number(b.high)+Number(b.low)+Number(b.close))/3;const w=Math.max(1,Number(b.volume)||0);pv+=typical*w;vol+=w;out.push({time:b.time,value:pv/vol});}
  return out;
}

function uniqueAnchors(items){const seen=new Set();return items.filter(x=>{const key=`${x.time}`;if(!finite(x.time)||seen.has(key))return false;seen.add(key);return true;});}

export function buildAnchoredVwaps(bars,{structure=null,sessions=null}={}){
  if(!Array.isArray(bars)||bars.length<20)return{series:[],anchors:[]};
  const last=bars.at(-1);const d=new Date(last.time);const dayStart=Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate());
  const anchors=[{kind:'avwap_day',label:'AVWAP D OPEN',time:bars.find(b=>b.time>=dayStart)?.time??dayStart,priority:3}];
  const pivots=structure?.pivots??[];const swing=pivots.at(-1);if(swing)anchors.push({kind:'avwap_swing',label:'AVWAP SWING',time:swing.time,priority:4});
  const ev=structure?.events?.at?.(-1);if(ev)anchors.push({kind:'avwap_structure',label:`AVWAP ${ev.type}`,time:ev.time,priority:5});
  const ny=[...(sessions?.zones??[])].reverse().find(z=>z.label==='NEW YORK RANGE'&&Number(z.startTime)<=last.time);if(ny)anchors.push({kind:'avwap_ny',label:'AVWAP NY',time:ny.startTime,priority:4});
  const uniq=uniqueAnchors(anchors).slice(-4); const series=uniq.map((a,i)=>({family:'avwap',kind:a.kind,label:a.label,points:anchoredVwapSeries(bars,a.time),width:1.25,dashed:i!==0,priority:a.priority})).filter(s=>s.points.length>1);
  return{series,anchors:uniq};
}

export function buildVolumeProfile(bars,{bins=36,valueArea=0.70,maxBars=220}={}){
  const src=(bars??[]).slice(-Math.max(30,maxBars));if(src.length<10)return{available:false,bins:[],poc:null,vah:null,val:null,hvn:[],lvn:[],totalVolume:0};
  const low=Math.min(...src.map(b=>Number(b.low))),high=Math.max(...src.map(b=>Number(b.high)));if(!(high>low))return{available:false,bins:[],poc:null,vah:null,val:null,hvn:[],lvn:[],totalVolume:0};
  const n=Math.max(12,Math.min(80,Math.round(bins))),step=(high-low)/n,volumes=Array(n).fill(0);
  for(const b of src){const blo=Number(b.low),bhi=Number(b.high),v=Math.max(1,Number(b.volume)||0);let a=clamp(Math.floor((blo-low)/step),0,n-1),z=clamp(Math.floor((bhi-low)/step),0,n-1);if(z<a)[a,z]=[z,a];const count=z-a+1,share=v/count;for(let i=a;i<=z;i++)volumes[i]+=share;}
  const rows=volumes.map((volume,i)=>({index:i,low:low+i*step,high:low+(i+1)*step,mid:low+(i+.5)*step,volume}));const total=rows.reduce((s,r)=>s+r.volume,0);if(!(total>0))return{available:false,bins:rows,poc:null,vah:null,val:null,hvn:[],lvn:[],totalVolume:0};
  const pocRow=rows.reduce((a,b)=>b.volume>a.volume?b:a,rows[0]);let included=new Set([pocRow.index]),acc=pocRow.volume,left=pocRow.index-1,right=pocRow.index+1;while(acc/total<valueArea&&(left>=0||right<n)){const lv=left>=0?rows[left].volume:-1,rv=right<n?rows[right].volume:-1;if(rv>lv){included.add(right);acc+=rv;right++;}else{included.add(left);acc+=lv;left--;}}
  const idx=[...included].sort((a,b)=>a-b),val=rows[idx[0]].low,vah=rows[idx.at(-1)].high;
  const localMax=rows.filter((r,i)=>i>0&&i<n-1&&r.volume>=rows[i-1].volume&&r.volume>=rows[i+1].volume).sort((a,b)=>b.volume-a.volume).slice(0,3);
  const localMin=rows.filter((r,i)=>i>0&&i<n-1&&r.volume<=rows[i-1].volume&&r.volume<=rows[i+1].volume).sort((a,b)=>a.volume-b.volume).slice(0,3);
  return{available:true,bins:rows,poc:pocRow.mid,vah,val,hvn:localMax.map(r=>r.mid),lvn:localMin.map(r=>r.mid),totalVolume:total,maxVolume:pocRow.volume,startTime:src[0].time,endTime:src.at(-1).time,valueArea:Number(valueArea)};
}

export function tickVolumeMetrics(bars,period=20){
  if(!Array.isArray(bars)||bars.length<period+1)return{current:null,average:null,ratio:null,spike:false,exhaustion:false};
  const current=Number(bars.at(-1).volume)||0,base=avg(bars.slice(-period-1,-1).map(b=>Number(b.volume)||0));const ratio=finite(base)&&base>0?current/base:null;const b=bars.at(-1),range=Math.max(1e-9,Number(b.high)-Number(b.low)),body=Math.abs(Number(b.close)-Number(b.open)),bodyPct=body/range;
  return{current,average:base,ratio,spike:finite(ratio)&&ratio>=1.7,exhaustion:finite(ratio)&&ratio>=1.7&&bodyPct<=0.28,bodyPct};
}

export function buildProfileOverlays(profile){
  if(!profile?.available)return{profiles:[],lines:[]};
  const lines=[
    {family:'volumeProfile',kind:'vp_poc',price:profile.poc,startTime:profile.startTime,endTime:profile.endTime,label:'VP POC',dashed:false,priority:5,color:'#fbbf24'},
    {family:'volumeProfile',kind:'vp_vah',price:profile.vah,startTime:profile.startTime,endTime:profile.endTime,label:'VP VAH',dashed:true,priority:4,color:'#93c5fd'},
    {family:'volumeProfile',kind:'vp_val',price:profile.val,startTime:profile.startTime,endTime:profile.endTime,label:'VP VAL',dashed:true,priority:4,color:'#93c5fd'}
  ];
  for(const p of profile.hvn??[])lines.push({family:'volumeProfile',kind:'vp_hvn',price:p,startTime:profile.startTime,endTime:profile.endTime,label:'HVN',dashed:true,priority:2,color:'#64748b',labelVisible:false});
  for(const p of profile.lvn??[])lines.push({family:'volumeProfile',kind:'vp_lvn',price:p,startTime:profile.startTime,endTime:profile.endTime,label:'LVN',dashed:true,priority:2,color:'#475569',labelVisible:false});
  return{profiles:[{family:'volumeProfile',kind:'volume_profile',bins:profile.bins,maxVolume:profile.maxVolume,poc:profile.poc,vah:profile.vah,val:profile.val,startTime:profile.startTime,endTime:profile.endTime}],lines};
}

export function buildOrderFlowOverlays(depth,bars=[]){
  if(!depth||depth.available===false)return{lines:[],summary:{available:false}};
  const end=bars.at(-1)?.time??Date.now(),start=bars[Math.max(0,bars.length-30)]?.time??end-30*300000;const lines=[];
  const add=(wall,side)=>{if(!wall||!finite(wall.price)||!finite(wall.size))return;lines.push({family:'orderFlow',kind:side==='bid'?'dom_bid_wall':'dom_ask_wall',price:Number(wall.price),startTime:start,endTime:end,label:`DOM ${side==='bid'?'BID':'ASK'} WALL ${Math.round(Number(wall.size))}`,dashed:true,priority:4,color:side==='bid'?'#2dd4bf':'#fb7185'});};
  add(depth.bidWall,'bid');add(depth.askWall,'ask');return{lines,summary:depth};
}


export function depthDataQuality(depth){
  if(!depth||depth.available===false)return{state:'unavailable',bidLevels:0,askLevels:0,hasImbalance:false};
  const bidLevels=Array.isArray(depth.bidLevels)?depth.bidLevels.length:0;
  const askLevels=Array.isArray(depth.askLevels)?depth.askLevels.length:0;
  const hasImbalance=finite(depth.imbalance);
  if(bidLevels>=3&&askLevels>=3&&hasImbalance)return{state:'ok',bidLevels,askLevels,hasImbalance};
  if(bidLevels>0||askLevels>0)return{state:hasImbalance?'partial':'collecting',bidLevels,askLevels,hasImbalance};
  return{state:'collecting',bidLevels,askLevels,hasImbalance};
}

export function macroDataQuality(macro){
  if(!macro||macro.available===false)return{state:'unavailable',dxy:false,us10y:false,real10y:false,calendar:false};
  const dxy=finite(macro?.dxy?.value),us10y=finite(macro?.us10y?.value),real10y=finite(macro?.real10y?.value);
  const calendar=Boolean(macro?.nextEvent||((macro?.events?.length??0)>0));
  const count=[dxy,us10y,real10y].filter(Boolean).length;
  const state=count===3?'ok':count>0?'partial':calendar?'calendar-only':'unavailable';
  return{state,dxy,us10y,real10y,calendar};
}

export function advancedMetrics({bars=[],profile=null,depth=null,macro=null,structure=null,sessions=null}={}){
  const adx=adxDmiSeries(bars,14),lastAdx=adx.at(-1)??{};const vol=volatilityRegime(bars),tick=tickVolumeMetrics(bars);const avwap=buildAnchoredVwaps(bars,{structure,sessions});const price=Number(bars.at(-1)?.close),avwapNearest=avwap.series.map(s=>({label:s.label,value:s.points.at(-1)?.value})).filter(x=>finite(x.value)).sort((a,b)=>Math.abs(a.value-price)-Math.abs(b.value-price))[0]??null;
  const dq=depthDataQuality(depth),mq=macroDataQuality(macro);
  return{adx14:lastAdx.adx??null,plusDI:lastAdx.plusDI??null,minusDI:lastAdx.minusDI??null,trendStrength:finite(lastAdx.adx)?(lastAdx.adx>=25?'strong':lastAdx.adx<18?'weak':'developing'):'unknown',bandwidth:vol.bandwidth,bandwidthPercentile:vol.percentile,volatilityState:vol.state,volumeRatio:tick.ratio,volumeSpike:tick.spike,volumeExhaustion:tick.exhaustion,profilePoc:profile?.poc??null,profileVah:profile?.vah??null,profileVal:profile?.val??null,profileAvailable:Boolean(profile?.available),depthAvailable:Boolean(depth?.available),depthQuality:dq.state,depthBidLevels:dq.bidLevels,depthAskLevels:dq.askLevels,depthImbalance:finite(depth?.imbalance)?Number(depth.imbalance):null,depthRatio:finite(depth?.ratio)?Number(depth.ratio):null,bidWall:depth?.bidWall??null,askWall:depth?.askWall??null,macroAvailable:Boolean(macro?.available),macroQuality:mq.state,macroHasDxy:mq.dxy,macroHasUs10y:mq.us10y,macroHasReal10y:mq.real10y,macroUpdatedAt:finite(macro?.updatedAt)?Number(macro.updatedAt):null,macroRisk:macro?.risk??'unknown',macroBias:macro?.bias??'neutral',dxy:finite(macro?.dxy?.value)?Number(macro.dxy.value):null,us10y:finite(macro?.us10y?.value)?Number(macro.us10y.value):null,real10y:finite(macro?.real10y?.value)?Number(macro.real10y.value):null,nextMacroEvent:macro?.nextEvent??null,avwapCount:avwap.series.length,avwapNearest};
}

export function buildAdvancedOscillators(bars){
  const adx=adxDmiSeries(bars,14);const bw=bollingerBandwidthSeries(bars,20,2);
  return{adx:{family:'adx',kind:'adx14',label:'ADX 14',points:adx.map(x=>({time:x.time,value:x.adx,plusDI:x.plusDI,minusDI:x.minusDI}))},bandwidth:{family:'volatilityRegime',kind:'bandwidth',label:'BB WIDTH',points:bw.map(x=>({time:x.time,value:x.value}))}};
}
