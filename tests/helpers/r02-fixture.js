export function bar(time,open,high,low,close,volume=100){return{time:Number(time),open:Number(open),high:Number(high),low:Number(low),close:Number(close),volume:Number(volume)};}

export function buildR02BuySnapshot({macroRisk='normal',reenter=false,weakVolume=false,weakRange=false,lowPressure=false,bearishH4=false}={}){
  const event=Date.parse('2026-09-15T14:00:00Z');
  const H1=3_600_000,H4=14_400_000,M5=300_000,M1=60_000;
  const h1=[];
  for(let i=0;i<70;i++){
    const t=event-(70-i)*H1;
    const phase=i%18;
    const center=105+Math.sin(i/2)*2.4;
    let o=center-.3,c=center+.3,hi=Math.min(111.8,center+1.0),lo=Math.max(98.2,center-1.0);
    if(phase===1)hi=112;if(phase===10)lo=98;
    if(i>=64){
      const k=i-64;
      if(lowPressure){o=104.0+Math.sin(k)*0.25;c=104.2+Math.cos(k)*0.20;hi=Math.max(o,c)+0.65;lo=Math.min(o,c)-0.65;}
      else{o=109.45+(k%2)*0.35;c=109.85+(k%3)*0.28;hi=Math.min(111.75,Math.max(o,c)+0.65);lo=Math.max(108.35,Math.min(o,c)-0.65);}
    }
    h1.push(bar(t,o,hi,lo,c,900+i%5*30));
  }
  const h4=[];
  for(let i=0;i<65;i++){
    const t=event-(65-i)*H4,base=bearishH4?122-i*0.40:82+i*0.40;
    h4.push(bar(t,base-.15,base+.9,base-.7,base+(bearishH4?-.35:.35),3000));
  }
  const m5=[];const m5Start=event-120*M5;
  for(let i=0;i<120;i++){
    const t=m5Start+i*M5,base=109.2+Math.sin(i/4)*.55;
    m5.push(bar(t,base-.10,base+.28,base-.28,base+.08,100+(i%7)*3));
  }
  const b0=weakRange?bar(event,111.85,112.18,111.70,112.10,weakVolume?1:140):bar(event,111.55,113.20,111.35,112.82,weakVolume?1:145);
  m5.push(b0);
  m5.push(bar(event+M5,112.75,113.25,112.55,112.95,135));
  if(reenter){m5.push(bar(event+2*M5,112.90,113.00,111.40,111.55,130));}
  else{
    m5.push(bar(event+2*M5,112.92,113.05,112.08,112.42,120)); // retest held
    m5.push(bar(event+3*M5,112.40,113.28,112.30,113.12,128));
  }
  // a few bars after the event so it remains inside the detector lookback
  m5.push(bar(event+4*M5,113.10,113.55,112.92,113.35,115));
  m5.push(bar(event+5*M5,113.34,113.65,113.05,113.45,110));

  const m1=[];const m1Start=event-130*M1;
  for(let i=0;i<130;i++){
    const t=m1Start+i*M1,base=111.2+Math.sin(i/5)*.12;
    m1.push(bar(t,base-.03,base+.10,base-.09,base+.02,25));
  }
  const rt=event+2*M5;
  const seq=[
    [112.38,112.52,112.26,112.40],[112.40,112.55,112.30,112.42],[112.42,112.58,112.34,112.46],
    [112.45,112.60,112.35,112.48],[112.48,112.62,112.40,112.50],[112.50,113.18,112.46,113.12],
    [113.12,113.32,113.02,113.24],[113.24,113.46,113.16,113.36]
  ];
  seq.forEach((x,i)=>m1.push(bar(rt+i*M1,...x,30+i*2)));
  const last=m1.at(-1).close;
  return{now:event+10*M5,symbol:'XAUUSD',quote:{bid:last,ask:last+.08,spread:.08,timestamp:event+10*M5},bars:{M1:m1,M5:m5,M15:[],M30:[],H1:h1,H4:h4},macro:{risk:macroRisk},depth:null,meta:{digits:2}};
}

function mapPriceBar(b,k){return{...b,open:k-Number(b.open),high:k-Number(b.low),low:k-Number(b.high),close:k-Number(b.close)};}
export function buildR02SellSnapshot(options={}){
  const s=buildR02BuySnapshot(options),k=250;
  const bars={};
  for(const [tf,list] of Object.entries(s.bars)) bars[tf]=(list??[]).map(b=>mapPriceBar(b,k));
  const bid=k-Number(s.quote.ask),ask=k-Number(s.quote.bid);
  return{...s,quote:{...s.quote,bid,ask,spread:ask-bid},bars};
}

export function shiftR02Snapshot(snapshot,deltaMs){
  const bars={};
  for(const [tf,list] of Object.entries(snapshot.bars??{})) bars[tf]=(list??[]).map(b=>({...b,time:Number(b.time)+Number(deltaMs)}));
  return{...snapshot,now:Number(snapshot.now)+Number(deltaMs),quote:{...snapshot.quote,timestamp:Number(snapshot.quote?.timestamp??snapshot.now)+Number(deltaMs)},bars};
}
