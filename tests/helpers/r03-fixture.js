export function bar(time,open,high,low,close,volume=100){return{time:Number(time),open:Number(open),high:Number(high),low:Number(low),close:Number(close),volume:Number(volume)};}

function trendBars({start,count,step,baseStart,drift,volume=400,range=.8}){
  const out=[];let prev=baseStart;
  for(let i=0;i<count;i++){
    const t=start+i*step,center=baseStart+i*drift;
    const open=prev,close=center+drift*.65,high=Math.max(open,close)+range*.45,low=Math.min(open,close)-range*.45;
    out.push(bar(t,open,high,low,close,volume+(i%5)*7));prev=close;
  }
  return out;
}

export function buildR03BuySnapshot({macroRisk='normal',strongPullback=false,breakStructure=false,noZone=false,noConfirm=false,wideSpread=false}={}){
  const pivotTime=Date.parse('2026-09-15T14:00:00Z');
  const H4=14_400_000,H1=3_600_000,M15=900_000,M5=300_000,M1=60_000;
  const h4=trendBars({start:pivotTime-70*H4,count:70,step:H4,baseStart:72,drift:.48,volume:3200,range:1.6});
  const h1=trendBars({start:pivotTime-80*H1,count:80,step:H1,baseStart:88,drift:.20,volume:1200,range:1.0});
  const m15=trendBars({start:pivotTime-120*M15,count:120,step:M15,baseStart:94,drift:.055,volume:500,range:.55});

  const m5=[];
  const baseStart=pivotTime-130*M5;
  for(let i=0;i<124;i++){
    const t=baseStart+i*M5,base=98+i*.018+Math.sin(i/7)*.12;
    m5.push(bar(t,base-.08,base+.28,base-.23,base+.12,105+(i%6)*4));
  }
  // A clear with-trend impulse, high participation.
  const imp=[
    [100.00,100.95,99.80,100.82,205],
    [100.82,102.15,100.66,102.02,225],
    [102.02,103.42,101.90,103.28,235],
    [103.28,104.65,103.14,104.48,245],
    [104.48,106.30,104.34,106.08,260]
  ];
  imp.forEach((x,i)=>m5.push(bar(pivotTime-(4-i)*M5,...x)));
  const pv=strongPullback?230:72;
  const low3=breakStructure?99.45:(noZone?105.05:103.70);
  const pb=[
    [106.05,106.16,105.20,105.42,pv],
    [105.42,105.54,104.42,104.65,pv-4],
    [104.65,104.82,low3,104.05,pv-8]
  ];
  pb.forEach((x,i)=>m5.push(bar(pivotTime+(i+1)*M5,...x)));

  const m1=[];const m1Start=pivotTime-135*M1;
  for(let i=0;i<135;i++){
    const t=m1Start+i*M1,base=102.2+Math.sin(i/6)*.08;
    m1.push(bar(t,base-.03,base+.10,base-.09,base+.02,24+(i%4)));
  }
  const touch=pivotTime+3*M5;
  const seq=[
    [104.08,104.16,103.92,104.01,22],
    [104.01,104.10,103.88,103.96,21],
    [103.96,104.06,103.86,103.99,20],
    [103.99,104.12,103.93,104.03,21],
    [104.03,104.18,103.98,104.08,22],
    noConfirm?[104.08,104.16,104.00,104.10,23]:[104.08,104.92,104.04,104.82,38],
    noConfirm?[104.10,104.18,104.02,104.12,22]:[104.82,105.02,104.70,104.91,31]
  ];
  seq.forEach((x,i)=>m1.push(bar(touch+i*M1,...x)));
  const bid=noConfirm?104.12:104.82,spread=wideSpread?1.2:.08,ask=bid+spread,now=touch+8*M1;
  return{now,symbol:'XAUUSD',quote:{bid,ask,spread,timestamp:now},bars:{M1:m1,M5:m5,M15:m15,M30:[],H1:h1,H4:h4},macro:{risk:macroRisk},depth:null,meta:{digits:2}};
}

function mirrorBar(b,k){return{...b,open:k-Number(b.open),high:k-Number(b.low),low:k-Number(b.high),close:k-Number(b.close)};}
export function buildR03SellSnapshot(options={}){
  const s=buildR03BuySnapshot(options),k=220,bars={};
  for(const [tf,list] of Object.entries(s.bars))bars[tf]=(list??[]).map(b=>mirrorBar(b,k));
  const baseBid=k-Number(s.quote.ask),baseAsk=k-Number(s.quote.bid),offset=.08;
  const bid=baseBid+offset,ask=baseAsk+offset;
  return{...s,quote:{...s.quote,bid,ask,spread:ask-bid},bars};
}
