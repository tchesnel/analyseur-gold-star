const H=3_600_000,M5=300_000,M1=60_000;
const day=Date.UTC(2026,8,14,0,0);
export function bar(time,o,h,l,c,v=100){return{time,open:o,high:h,low:l,close:c,volume:v};}

export function buildR01SellSnapshot({macroRisk='normal',depth=true,entry=true,acceptance=false,orderFlow=true}={}){
  const h1=[];let p=105;
  for(let i=0;i<24;i++){const c=105+Math.sin(i/3)*2;h1.push(bar(day+i*H,p,Math.max(p,c)+0.5,Math.min(p,c)-0.5,c,100));p=c;}
  h1[8]={...h1[8],high:110};h1[15]={...h1[15],low:100};
  const day2=day+24*H;
  for(let i=0;i<24;i++){const c=108+Math.sin(i/4)*0.5;h1.push(bar(day2+i*H,p,Math.max(p,c)+0.3,Math.min(p,c)-0.3,c,100));p=c;}
  const h4=[];for(let i=0;i<h1.length;i+=4){const xs=h1.slice(i,i+4);h4.push(bar(xs[0].time,xs[0].open,Math.max(...xs.map(x=>x.high)),Math.min(...xs.map(x=>x.low)),xs.at(-1).close,xs.reduce((s,x)=>s+x.volume,0)));}
  const m15=[];p=107;for(let i=0;i<96;i++){const c=107.5+Math.sin(i/5)*0.7;m15.push(bar(day2+i*15*M1,p,Math.max(p,c)+0.25,Math.min(p,c)-0.25,c,120));p=c;}
  const m30=[];for(let i=0;i<m15.length;i+=2){const xs=m15.slice(i,i+2);m30.push(bar(xs[0].time,xs[0].open,Math.max(...xs.map(x=>x.high)),Math.min(...xs.map(x=>x.low)),xs.at(-1).close,xs.reduce((s,x)=>s+x.volume,0)));}
  const triggerStart=day2+3*H; // 08:20 NY at sweep index 112 during EDT
  const m5=[];p=109.72;for(let i=0;i<120;i++){const c=109.72+(i%2===0?-0.18:0.18);m5.push(bar(triggerStart+i*M5,p,Math.max(p,c)+0.12,Math.min(p,c)-0.12,c,100));p=c;}
  const si=112;m5[si]=bar(m5[si].time,109.82,110.55,109.55,109.72,orderFlow?240:100);p=109.72;
  for(let i=si+1;i<120;i++){let c=109.70-(i-si)*0.02;if(acceptance&&i<=si+2)c=110.25+(i-si)*0.05;m5[i]=bar(m5[i].time,p,Math.max(p,c)+0.04,Math.min(p,c)-0.04,c,130);p=c;}
  const m1=[];p=109.2;for(let i=0;i<600;i++){const c=109.2+Math.sin(i/12)*0.25;m1.push(bar(triggerStart+i*M1,p,Math.max(p,c)+0.08,Math.min(p,c)-0.08,c,40));p=c;}
  const idx=Math.round((m5[si].time-triggerStart)/M1);const seq=[109.2,109.5,109.35,109.7,109.45,109.85,109.6,109.9,109.55,109.95];p=109.0;
  for(let k=-10;k<0;k++){const c=seq[k+10];m1[idx+k]=bar(m1[idx+k].time,p,Math.max(p,c)+.08,Math.min(p,c)-.08,c,55);p=c;}
  m1[idx]=bar(m1[idx].time,109.95,110.55,109.7,109.75,orderFlow?160:45);p=109.75;
  const post=[109.82,109.72,109.88,109.68,109.78,109.55,109.62,109.20,108.65,107.95,108.30,108.80,109.25,109.65,entry?109.98:109.60];
  for(let k=1;k<=post.length;k++){const c=post[k-1];const extra=k===10?0.15:0.07;m1[idx+k]=bar(m1[idx+k].time,p,Math.max(p,c)+extra,Math.min(p,c)-extra,c,k===10&&orderFlow?180:70);p=c;}
  m1.length=idx+post.length+1;
  const bid=entry?109.98:109.60;
  return{now:m1.at(-1).time+M1,quote:{bid,ask:bid+.05,spread:.05},bars:{M1:m1,M5:m5,M15:m15,M30:m30,H1:h1,H4:h4},depth:depth?{available:true,bidLevels:[{price:109.9,size:120},{price:109.8,size:100},{price:109.7,size:90}],askLevels:[{price:110.0,size:180},{price:110.1,size:170},{price:110.2,size:160}],imbalance:orderFlow?-.25:0,bidWall:{price:109.9,size:120},askWall:{price:110,size:180}}:null,macro:{available:true,risk:macroRisk,bias:'neutral'}};
}

export function mirrorSnapshot(snapshot,center=210){
  const flipBar=b=>({time:b.time,open:center-b.open,high:center-b.low,low:center-b.high,close:center-b.close,volume:b.volume});
  const bars=Object.fromEntries(Object.entries(snapshot.bars).map(([tf,xs])=>[tf,xs.map(flipBar)]));
  const q=snapshot.quote;const bid=center-q.ask,ask=center-q.bid;
  const depth=snapshot.depth?{...snapshot.depth,bidLevels:snapshot.depth.askLevels?.map(x=>({price:center-x.price,size:x.size})),askLevels:snapshot.depth.bidLevels?.map(x=>({price:center-x.price,size:x.size})),imbalance:-(snapshot.depth.imbalance??0),bidWall:snapshot.depth.askWall?{price:center-snapshot.depth.askWall.price,size:snapshot.depth.askWall.size}:null,askWall:snapshot.depth.bidWall?{price:center-snapshot.depth.bidWall.price,size:snapshot.depth.bidWall.size}:null}:null;
  return{...snapshot,quote:{bid,ask,spread:ask-bid},bars,depth};
}
