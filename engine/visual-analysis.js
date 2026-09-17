import { adxDmiSeries, buildAdvancedOscillators, buildAnchoredVwaps, buildOrderFlowOverlays, buildProfileOverlays, buildVolumeProfile, advancedMetrics, tickVolumeMetrics, volatilityRegime } from './advanced-context.js';
// Moteur visuel déterministe XAUUSD.
// Il produit du contexte de marché, jamais un ordre de trading.

const TF_MS = Object.freeze({ M1:60_000, M5:300_000, M15:900_000, M30:1_800_000, H1:3_600_000, H4:14_400_000 });

function finite(n) { return n !== null && n !== undefined && n !== '' && Number.isFinite(Number(n)); }
function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }
function average(values) { const xs=values.filter(finite).map(Number); return xs.length ? xs.reduce((a,b)=>a+b,0)/xs.length : null; }
function utcDayKey(time) { const d=new Date(time); return `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}-${String(d.getUTCDate()).padStart(2,'0')}`; }
function utcWeekStart(time) { const d=new Date(time); const day=(d.getUTCDay()+6)%7; return Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate()-day); }

export function emaSeries(bars, period) {
  if (!Number.isInteger(period) || period < 1 || bars.length < period) return [];
  const closes=bars.map(b=>Number(b.close));
  const seed=average(closes.slice(0,period));
  if (!finite(seed)) return [];
  const k=2/(period+1); let value=seed;
  const out=[{time:bars[period-1].time,value}];
  for(let i=period;i<bars.length;i++) { value=closes[i]*k+value*(1-k); out.push({time:bars[i].time,value}); }
  return out;
}

export function atrSeries(bars, period=14) {
  if (!Number.isInteger(period)||period<1||bars.length<period+1) return [];
  const trs=[];
  for(let i=1;i<bars.length;i++) {
    const b=bars[i], p=bars[i-1];
    trs.push(Math.max(b.high-b.low,Math.abs(b.high-p.close),Math.abs(b.low-p.close)));
  }
  if(trs.length<period) return [];
  let value=average(trs.slice(0,period));
  const out=[{time:bars[period].time,value}];
  for(let i=period;i<trs.length;i++) { value=((value*(period-1))+trs[i])/period; out.push({time:bars[i+1].time,value}); }
  return out;
}

export function rsiSeries(bars, period=14) {
  if (!Number.isInteger(period)||period<1||bars.length<period+1) return [];
  const diffs=[]; for(let i=1;i<bars.length;i++) diffs.push(bars[i].close-bars[i-1].close);
  let gain=average(diffs.slice(0,period).map(d=>Math.max(0,d)));
  let loss=average(diffs.slice(0,period).map(d=>Math.max(0,-d)));
  const valueOf=()=>loss===0?100:100-(100/(1+(gain/loss)));
  const out=[{time:bars[period].time,value:valueOf()}];
  for(let i=period;i<diffs.length;i++) {
    gain=((gain*(period-1))+Math.max(0,diffs[i]))/period;
    loss=((loss*(period-1))+Math.max(0,-diffs[i]))/period;
    out.push({time:bars[i+1].time,value:valueOf()});
  }
  return out;
}

export function dailyVwapSeries(bars) {
  const out=[]; let day=null, pv=0, vol=0;
  for(const b of bars) {
    const key=utcDayKey(b.time); if(key!==day){day=key;pv=0;vol=0;}
    const volume=Math.max(0,Number(b.volume)||0);
    const typical=(Number(b.high)+Number(b.low)+Number(b.close))/3;
    // Si le broker ne fournit pas de tick-volume utilisable, chaque barre reçoit un poids 1.
    const weight=volume>0?volume:1; pv+=typical*weight; vol+=weight;
    out.push({time:b.time,value:pv/vol});
  }
  return out;
}

function groupBars(bars,keyFn) {
  const map=new Map();
  for(const b of bars) {
    const key=keyFn(b.time); if(!map.has(key)) map.set(key,[]); map.get(key).push(b);
  }
  return [...map.entries()].sort((a,b)=>String(a[0]).localeCompare(String(b[0])));
}

export function aggregatePeriod(bars,keyFn) {
  return groupBars(bars,keyFn).map(([key,xs])=>({
    key, startTime:xs[0].time, endTime:xs.at(-1).time, open:xs[0].open,
    high:Math.max(...xs.map(b=>b.high)), low:Math.min(...xs.map(b=>b.low)), close:xs.at(-1).close,
    volume:xs.reduce((s,b)=>s+(Number(b.volume)||0),0)
  }));
}

export function trendMetrics(bars, htfBars=[]) {
  const ema20=emaSeries(bars,20), ema50=emaSeries(bars,50), ema200=emaSeries(bars,200);
  const atr14=atrSeries(bars,14); const rsi14=rsiSeries(bars,14); const vwap=dailyVwapSeries(bars);
  const close=Number(bars.at(-1)?.close);
  const e20=ema20.at(-1)?.value??null, e50=ema50.at(-1)?.value??null, e200=ema200.at(-1)?.value??null;
  let trend='neutral';
  if([close,e20,e50,e200].every(finite)) {
    if(close>e20&&e20>e50&&e50>e200) trend='bullish';
    else if(close<e20&&e20<e50&&e50<e200) trend='bearish';
  }
  const daily=aggregatePeriod(htfBars.length?htfBars:bars,utcDayKey);
  const ranges=daily.slice(-15,-1).map(d=>d.high-d.low).filter(finite);
  const adr14=average(ranges.slice(-14));
  const today=daily.at(-1); const dayRange=today?today.high-today.low:null;
  return {
    trend, close, ema20:e20, ema50:e50, ema200:e200,
    rsi14:rsi14.at(-1)?.value??null, atr14:atr14.at(-1)?.value??null,
    vwap:vwap.at(-1)?.value??null, adr14,
    adrUsed:finite(adr14)&&adr14>0&&finite(dayRange)?clamp((dayRange/adr14)*100,0,999):null
  };
}

export function buildTrendOverlays(bars) {
  return {
    series:[
      {family:'trend',kind:'ema20',label:'EMA 20',points:emaSeries(bars,20),width:1.2},
      {family:'trend',kind:'ema50',label:'EMA 50',points:emaSeries(bars,50),width:1.35},
      {family:'trend',kind:'ema200',label:'EMA 200',points:emaSeries(bars,200),width:1.6},
      {family:'vwap',kind:'vwap',label:'VWAP',points:dailyVwapSeries(bars),width:1.3,dashed:true}
    ].filter(s=>s.points.length)
  };
}

export function detectPivots(bars,left=3,right=3) {
  const pivots=[];
  for(let i=left;i<bars.length-right;i++) {
    const b=bars[i]; let isHigh=true,isLow=true;
    for(let j=i-left;j<=i+right;j++) if(j!==i) {
      if(b.high<=bars[j].high) isHigh=false;
      if(b.low>=bars[j].low) isLow=false;
    }
    if(isHigh) pivots.push({type:'high',index:i,confirmIndex:i+right,time:b.time,price:b.high});
    if(isLow) pivots.push({type:'low',index:i,confirmIndex:i+right,time:b.time,price:b.low});
  }
  return pivots.sort((a,b)=>a.index-b.index||a.type.localeCompare(b.type));
}

export function detectMarketStructure(bars,{left=3,right=3}={}) {
  if(bars.length<20) return {pivots:[],events:[],sweeps:[],equalLevels:[],bias:'neutral'};
  const pivots=detectPivots(bars,left,right); const byConfirm=new Map();
  for(const p of pivots){if(!byConfirm.has(p.confirmIndex))byConfirm.set(p.confirmIndex,[]);byConfirm.get(p.confirmIndex).push(p);}
  const atr=atrSeries(bars,14); const atrByTime=new Map(atr.map(x=>[x.time,x.value]));
  let high=null,low=null,trend=null; const events=[],sweeps=[],equalLevels=[]; const recentHigh=[],recentLow=[];
  const swept=new Set();
  for(let i=0;i<bars.length;i++) {
    for(const p of byConfirm.get(i)??[]) {
      const list=p.type==='high'?recentHigh:recentLow; const prev=list.at(-1); const a=atrByTime.get(bars[i].time)??average(atr.slice(-20).map(x=>x.value))??0;
      if(prev && Math.abs(prev.price-p.price)<=Math.max(a*0.18,p.price*0.00025)) {
        equalLevels.push({type:p.type,price:(prev.price+p.price)/2,startTime:prev.time,endTime:p.time});
      }
      list.push(p); if(list.length>8)list.shift(); if(p.type==='high')high={...p,broken:false}; else low={...p,broken:false};
    }
    const b=bars[i]; const a=atrByTime.get(b.time)??0; const buffer=Math.max(a*0.03,0.01);
    if(high && i>high.confirmIndex) {
      const key=`h${high.time}`;
      if(!swept.has(key)&&b.high>high.price+buffer&&b.close<high.price) {sweeps.push({side:'buy-side',time:b.time,price:b.high,level:high.price});swept.add(key);}
      if(!high.broken&&b.close>high.price+buffer) {
        const body=Math.abs(b.close-b.open); const displacement=a>0&&body>=a*1.35;
        const type=trend==='bearish'?(displacement?'MSS':'CHOCH'):'BOS'; events.push({direction:'bullish',type,time:b.time,price:high.price,index:i,displacement}); high.broken=true; trend='bullish';
      }
    }
    if(low && i>low.confirmIndex) {
      const key=`l${low.time}`;
      if(!swept.has(key)&&b.low<low.price-buffer&&b.close>low.price) {sweeps.push({side:'sell-side',time:b.time,price:b.low,level:low.price});swept.add(key);}
      if(!low.broken&&b.close<low.price-buffer) {
        const body=Math.abs(b.close-b.open); const displacement=a>0&&body>=a*1.35;
        const type=trend==='bullish'?(displacement?'MSS':'CHOCH'):'BOS'; events.push({direction:'bearish',type,time:b.time,price:low.price,index:i,displacement}); low.broken=true; trend='bearish';
      }
    }
  }
  return {pivots,events,sweeps,equalLevels,bias:trend??'neutral'};
}

export function buildStructureOverlays(bars) {
  const s=detectMarketStructure(bars); const end=bars.at(-1)?.time;
  const lines=s.equalLevels.slice(-4).map(l=>({family:'liquidity',kind:l.type==='high'?'eqh':'eql',price:l.price,startTime:l.startTime,endTime:end,dashed:true,label:l.type==='high'?'EQH / BSL':'EQL / SSL'}));
  const events=s.events.slice(-10); const sweeps=s.sweeps.slice(-6);
  const eventMarkers=events.map((e,i)=>({family:'structure',kind:e.type.toLowerCase(),time:e.time,price:e.price,label:`${e.type} ${e.direction==='bullish'?'↑':'↓'}`,direction:e.direction,labelVisible:e.type!=='BOS'||i>=events.length-4,priority:e.type==='BOS'?2:3}));
  const sweepMarkers=sweeps.map((e,i)=>({family:'liquidity',kind:'sweep',time:e.time,price:e.price,label:e.side==='buy-side'?'BSL SWEEP':'SSL SWEEP',direction:e.side==='buy-side'?'bearish':'bullish',labelVisible:i>=sweeps.length-4,priority:3}));
  const markers=[...eventMarkers,...sweepMarkers].sort((a,b)=>a.time-b.time).slice(-12);
  return {lines,markers,structure:s};
}

export function detectFvgs(bars,{minAtr=0.12,max=20}={}) {
  const atr=atrSeries(bars,14); const atrByTime=new Map(atr.map(x=>[x.time,x.value])); const zones=[];
  for(let i=2;i<bars.length;i++) {
    const a=atrByTime.get(bars[i].time)??0; const c1=bars[i-2],c3=bars[i];
    let zone=null;
    if(c3.low>c1.high && c3.low-c1.high>=a*minAtr) zone={side:'buy',low:c1.high,high:c3.low,startTime:c3.time,index:i,kind:'fvg'};
    else if(c3.high<c1.low && c1.low-c3.high>=a*minAtr) zone={side:'sell',low:c3.high,high:c1.low,startTime:c3.time,index:i,kind:'fvg'};
    if(!zone) continue;
    let state='active',endTime=null,flipTime=null;
    for(let j=i+1;j<bars.length;j++) {
      const b=bars[j];
      if(zone.side==='buy') {
        if(b.close<zone.low){state='invalidated';flipTime=b.time;break;}
        if(b.low<=zone.low){state='filled';endTime=b.time;break;}
        if(b.low<zone.high)state='partial';
      } else {
        if(b.close>zone.high){state='invalidated';flipTime=b.time;break;}
        if(b.high>=zone.high){state='filled';endTime=b.time;break;}
        if(b.high>zone.low)state='partial';
      }
    }
    zones.push({...zone,state,endTime,flipTime,mid:(zone.high+zone.low)/2});
  }
  return zones.slice(-Math.max(max,1));
}

export function detectInverseFvgs(bars,fvgs=detectFvgs(bars,{max:80})) {
  const out=[]; const lastTime=bars.at(-1)?.time;
  for(const f of fvgs.filter(x=>x.state==='invalidated'&&x.flipTime)) {
    const start=bars.findIndex(b=>b.time>=f.flipTime); if(start<0)continue;
    const side=f.side==='buy'?'sell':'buy'; let endTime=null,active=true;
    for(let j=start+1;j<bars.length;j++) {
      const b=bars[j]; if(side==='sell'&&b.close>f.high){active=false;endTime=b.time;break;} if(side==='buy'&&b.close<f.low){active=false;endTime=b.time;break;}
    }
    if(active||endTime===lastTime) out.push({family:'fvg',kind:'ifvg',side,low:f.low,high:f.high,startTime:f.flipTime,endTime:active?null:endTime,active});
  }
  return out.slice(-8);
}

export function detectOrderBlocks(bars,structure=detectMarketStructure(bars)) {
  const atr=atrSeries(bars,14); const atrByTime=new Map(atr.map(x=>[x.time,x.value])); const zones=[];
  for(const event of structure.events) {
    const breakBar=bars[event.index]; const a=atrByTime.get(breakBar.time)??0; const body=Math.abs(breakBar.close-breakBar.open);
    if(a>0&&body<a*1.1) continue;
    let origin=null;
    for(let j=event.index-1;j>=Math.max(0,event.index-8);j--) {
      const b=bars[j]; const opposite=event.direction==='bullish'?b.close<b.open:b.close>b.open; if(opposite){origin={...b,index:j};break;}
    }
    if(!origin)continue;
    const side=event.direction==='bullish'?'buy':'sell'; const low=side==='buy'?origin.low:Math.min(origin.open,origin.close); const high=side==='buy'?Math.max(origin.open,origin.close):origin.high;
    let active=true,mitigated=false,endTime=null;
    for(let j=event.index+1;j<bars.length;j++) {
      const b=bars[j]; const touched=b.low<=high&&b.high>=low; if(touched)mitigated=true;
      if(side==='buy'&&b.close<low){active=false;endTime=b.time;break;} if(side==='sell'&&b.close>high){active=false;endTime=b.time;break;}
    }
    zones.push({family:'orderBlocks',kind:'order_block',side,low,high,startTime:origin.time,endTime:active?null:endTime,active,mitigated,sourceEvent:event.type});
  }
  return zones.slice(-16);
}


export function selectNearestZones(zones, price, {perSide=2,total=4,preferUnmitigated=false}={}) {
  const target=Number(price); if(!finite(target)) return zones.slice(-Math.max(0,total));
  const ranked=[...zones].map(z=>({...z,_distance:Math.abs(((Number(z.low)+Number(z.high))/2)-target)})).sort((a,b)=>{
    if(preferUnmitigated&&Boolean(a.mitigated)!==Boolean(b.mitigated)) return a.mitigated?1:-1;
    return a._distance-b._distance || Number(b.startTime??0)-Number(a.startTime??0);
  });
  const sideCount=new Map(),out=[];
  for(const z of ranked){const side=z.side??'neutral',n=sideCount.get(side)??0;if(n>=perSide)continue;out.push(z);sideCount.set(side,n+1);if(out.length>=total)break;}
  return out.map(({_distance,...z})=>z);
}

export function selectBalancedConfluenceZones(zones, price, {perSide=2,total=4}={}){
  const target=Number(price); const cleaned=[];
  const ranked=[...zones].map(z=>({...z,_distance:Number.isFinite(target)?Math.abs(((Number(z.low)+Number(z.high))/2)-target):0})).sort((a,b)=>{
    const scoreDelta=Number(b.score??0)-Number(a.score??0); if(scoreDelta) return scoreDelta;
    return a._distance-b._distance||Number(b.startTime??0)-Number(a.startTime??0);
  });
  // Dédoublonnage par côté : deux POI qui se recouvrent fortement représentent la même zone de marché.
  for(const z of ranked){
    const duplicate=cleaned.some(x=>{
      if(x.side!==z.side)return false;
      const overlap=Math.max(0,Math.min(x.high,z.high)-Math.max(x.low,z.low));
      const smaller=Math.max(1e-9,Math.min(x.high-x.low,z.high-z.low));
      return overlap/smaller>=0.45;
    });
    if(!duplicate)cleaned.push(z);
  }
  const out=[]; const count=new Map();
  // Un côté valide ne peut jamais disparaître uniquement parce que l'autre côté est plus proche du prix.
  for(const side of ['buy','sell']){
    const first=cleaned.find(z=>z.side===side); if(first){out.push(first);count.set(side,1);}
  }
  for(const z of cleaned){
    if(out.includes(z)||out.length>=total)continue;
    const n=count.get(z.side)??0; if(n>=perSide)continue;
    out.push(z);count.set(z.side,n+1);
  }
  return out.slice(0,total).map(({_distance,...z})=>z);
}

function overlapRange(a,b){
  const low=Math.max(Number(a.low),Number(b.low));
  const high=Math.min(Number(a.high),Number(b.high));
  return Number.isFinite(low)&&Number.isFinite(high)&&low<high?{low,high}:null;
}

function liveZoneState(zone, price, atr){
  const p=Number(price),a=Math.max(Number(atr)||0,Math.max(0.01,(Number(zone.high)-Number(zone.low))*2));
  if(!Number.isFinite(p))return{state:'waiting',distance:null,distanceAtr:null};
  if(p>=zone.low&&p<=zone.high)return{state:'inside',distance:0,distanceAtr:0};
  let breached=false,distance=0;
  if(zone.side==='buy'){
    breached=p<zone.low; distance=breached?zone.low-p:p-zone.high;
  }else{
    breached=p>zone.high; distance=breached?p-zone.high:zone.low-p;
  }
  if(breached)return{state:'breached',distance,distanceAtr:a>0?distance/a:null};
  return{state:distance<=a*0.65?'near':'waiting',distance,distanceAtr:a>0?distance/a:null};
}

function scoreConfluence(ob,f,price,atr,bars){
  const mid=(Math.max(ob.low,f.low)+Math.min(ob.high,f.high))/2;
  const a=Math.max(Number(atr)||0,0.01);
  const distancePenalty=Number.isFinite(Number(price))?Math.min(28,Math.abs(mid-Number(price))/a*3.2):0;
  const sourceBonus=ob.sourceEvent==='MSS'?12:ob.sourceEvent==='CHOCH'?8:4;
  const fvgBonus=f.kind==='ifvg'?10:6;
  const mitigationBonus=ob.mitigated?-5:14;
  const ageBars=Math.max(0,bars.length-1-Math.max(0,bars.findIndex(b=>b.time>=Math.max(ob.startTime??0,f.startTime??0))));
  const freshness=Math.max(0,16-Math.min(16,ageBars*0.35));
  return Math.round((100+sourceBonus+fvgBonus+mitigationBonus+freshness-distancePenalty)*10)/10;
}

function buildCandidate(side,{obs,fvgs,ifvgs,price,atr,lastTime}){
  const p=Number(price),a=Math.max(Number(atr)||0,0.01);
  const rank=z=>Math.abs(((z.low+z.high)/2)-p)/a;
  const ob=[...obs].filter(z=>z.side===side&&z.active!==false).sort((x,y)=>{
    if(Boolean(x.mitigated)!==Boolean(y.mitigated))return x.mitigated?1:-1;
    return rank(x)-rank(y)||Number(y.startTime??0)-Number(x.startTime??0);
  })[0];
  const gaps=[...ifvgs,...fvgs].filter(z=>z.side===side&&(z.active!==false)&&!['filled','invalidated'].includes(z.state)).sort((x,y)=>rank(x)-rank(y)||Number(y.startTime??0)-Number(x.startTime??0));
  const gap=gaps[0];
  const src=ob??gap; if(!src)return null;
  const source=ob?'OB':(gap?.kind==='ifvg'?'iFVG':'FVG');
  const live=liveZoneState(src,p,a);
  return{
    family:'poi',kind:'candidate',side,low:src.low,high:src.high,startTime:src.startTime,endTime:lastTime,
    label:`${side==='buy'?'BUY':'SELL'} CANDIDATE · ${source}${live.state==='inside'?' · LIVE':live.state==='near'?' · NEAR':''}`,
    labelVisible:true,priority:live.state==='inside'?6:4,confirmed:false,source,liveState:live.state,distanceAtr:live.distanceAtr,
    score:Math.max(1,Math.round((65-(Number.isFinite(live.distanceAtr)?Math.min(25,live.distanceAtr*4):0)+(ob&&!ob.mitigated?10:0))*10)/10)
  };
}

export function buildAdaptivePois({obs=[],fvgs=[],ifvgs=[],price=null,atr=0,bars=[],lastTime=null}={}){
  const rawPois=[];
  for(const ob of obs){
    for(const f of [...fvgs,...ifvgs]){
      if(ob.side!==f.side)continue;
      const overlap=overlapRange(ob,f); if(!overlap)continue;
      const live=liveZoneState({...overlap,side:ob.side},price,atr);
      rawPois.push({
        family:'poi',kind:'confluence',side:ob.side,low:overlap.low,high:overlap.high,
        startTime:Math.max(ob.startTime??0,f.startTime??0),endTime:lastTime,labelVisible:true,confirmed:true,
        source:`OB+${f.kind==='ifvg'?'iFVG':'FVG'}`,sourceEvent:ob.sourceEvent,mitigated:Boolean(ob.mitigated),
        liveState:live.state,distanceAtr:live.distanceAtr,score:scoreConfluence(ob,f,price,atr,bars)
      });
    }
  }
  const selected=selectBalancedConfluenceZones(rawPois,price,{perSide:2,total:4});
  const sideRank={buy:0,sell:0};
  const confirmed=selected.map(z=>{
    sideRank[z.side]=(sideRank[z.side]??0)+1; const rank=String.fromCharCode(64+sideRank[z.side]);
    const state=z.liveState==='inside'?' · LIVE':z.liveState==='near'?' · NEAR':z.liveState==='breached'?' · TEST':'';
    return{...z,label:`${z.side==='buy'?'BUY':'SELL'} ZONE ${rank}${state}`,priority:z.liveState==='inside'?7:z.liveState==='near'?6:5};
  });
  const candidates=[];
  for(const side of ['buy','sell']) if(!rawPois.some(z=>z.side===side)){
    const c=buildCandidate(side,{obs,fvgs,ifvgs,price,atr,lastTime}); if(c)candidates.push(c);
  }
  return{rawPois,confirmed,candidates};
}

export function buildSmcOverlays(bars,{price=null}={}) {
  const structure=detectMarketStructure(bars); const fvgs=detectFvgs(bars,{max:80});
  const close=Number.isFinite(Number(price))?Number(price):Number(bars.at(-1)?.close); const lastTime=bars.at(-1)?.time;
  const atrNow=atrSeries(bars,14).at(-1)?.value??Math.max(0.01,Math.abs(Number(bars.at(-1)?.high)-Number(bars.at(-1)?.low)));
  const activeFvgsAll=fvgs.filter(f=>['active','partial'].includes(f.state));
  const ifvgsAll=detectInverseFvgs(bars,fvgs).filter(f=>f.active);
  const allObs=detectOrderBlocks(bars,structure).filter(o=>o.active);

  // Calcul des POI AVANT le filtre visuel : aucun SELL/BUY valide ne peut disparaître parce qu'il était plus loin du prix.
  const adaptive=buildAdaptivePois({obs:allObs,fvgs:activeFvgsAll,ifvgs:ifvgsAll,price:close,atr:atrNow,bars,lastTime});
  const rawPois=adaptive.rawPois, confirmedPois=adaptive.confirmed, candidates=adaptive.candidates;

  // Les briques secondaires sont ensuite limitées pour garder le graphique lisible.
  const activeFvgs=selectNearestZones(activeFvgsAll,close,{perSide:2,total:4});
  const ifvgs=selectNearestZones(ifvgsAll,close,{perSide:1,total:2});
  const obs=selectNearestZones(allObs,close,{perSide:2,total:4,preferUnmitigated:true});
  const zones=[
    ...activeFvgs.map((f,i)=>({family:'fvg',kind:'fvg',side:f.side,low:f.low,high:f.high,startTime:f.startTime,endTime:lastTime,label:`${f.side==='buy'?'BULL':'BEAR'} FVG${f.state==='partial'?' · PARTIAL':''}`,labelVisible:i<2})),
    ...ifvgs.map(f=>({...f,endTime:lastTime,label:`${f.side==='buy'?'BULL':'BEAR'} iFVG`,labelVisible:true})),
    ...obs.map((o,i)=>({...o,endTime:lastTime,label:`${o.side==='buy'?'BUY':'SELL'} OB${o.mitigated?' · MITIGATED':''}`,labelVisible:i<2})),
    ...confirmedPois,
    ...candidates
  ];
  return {zones,structure,fvgs,orderBlocks:allObs,displayedOrderBlocks:obs,displayedFvgs:activeFvgs,displayedIfvgs:ifvgs,pois:confirmedPois,candidates,rawPois,atrNow};
}

function previousPeriodLevels(bars,keyFn,prefix) {
  const periods=aggregatePeriod(bars,keyFn); if(periods.length<2)return[]; const current=periods.at(-1),prev=periods.at(-2);
  return [
    {family:'htf',kind:`${prefix.toLowerCase()}h`,price:prev.high,label:`P${prefix}H`,dashed:true},
    {family:'htf',kind:`${prefix.toLowerCase()}l`,price:prev.low,label:`P${prefix}L`,dashed:true},
    {family:'htf',kind:`${prefix.toLowerCase()}open`,price:current.open,label:`${prefix} OPEN`,dashed:false}
  ];
}

export function buildHtfLevels(snapshot) {
  const h1=snapshot?.bars?.H1??[]; const h4=snapshot?.bars?.H4??[]; const source=h1.length>=48?h1:h4;
  return { lines:[...previousPeriodLevels(source,utcDayKey,'D'),...previousPeriodLevels(h4.length?h4:source,utcWeekStart,'W')] };
}

const SESSION_DEFS=Object.freeze([
  {id:'asia',label:'ASIA',timeZone:'Asia/Singapore',start:8,end:16},
  {id:'london',label:'LONDON',timeZone:'Europe/London',start:8,end:16},
  {id:'newyork',label:'NEW YORK',timeZone:'America/New_York',start:8,end:16}
]);
const dtfCache=new Map();
function zonedParts(time,timeZone){
  if(!dtfCache.has(timeZone))dtfCache.set(timeZone,new Intl.DateTimeFormat('en-CA',{timeZone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}));
  const parts=Object.fromEntries(dtfCache.get(timeZone).formatToParts(new Date(time)).map(p=>[p.type,p.value])); return {date:`${parts.year}-${parts.month}-${parts.day}`,hour:Number(parts.hour),minute:Number(parts.minute)};
}

export function buildSessionOverlays(bars) {
  const zones=[];
  for(const s of SESSION_DEFS) {
    const groups=new Map();
    for(const b of bars) { const p=zonedParts(b.time,s.timeZone); const mins=p.hour*60+p.minute; if(mins<s.start*60||mins>=s.end*60)continue; if(!groups.has(p.date))groups.set(p.date,[]); groups.get(p.date).push(b); }
    const latest=[...groups.entries()].at(-1); if(!latest)continue; const xs=latest[1]; zones.push({family:'sessions',kind:'session',side:'neutral',low:Math.min(...xs.map(b=>b.low)),high:Math.max(...xs.map(b=>b.high)),startTime:xs[0].time,endTime:xs.at(-1).time,label:`${s.label} RANGE`});
  }
  return {zones};
}

export function buildPremiumDiscount(bars,structure=detectMarketStructure(bars,{left:5,right:3})) {
  const pivots=structure.pivots.slice(-10); const high=[...pivots].reverse().find(p=>p.type==='high'); const low=[...pivots].reverse().find(p=>p.type==='low'); if(!high||!low)return{zones:[],lines:[]};
  const hi=high.price,lo=low.price;if(!(hi>lo))return{zones:[],lines:[]};const eq=(hi+lo)/2;const start=Math.min(high.time,low.time),end=bars.at(-1)?.time;
  return {zones:[{family:'premiumDiscount',kind:'premium',side:'sell',low:eq,high:hi,startTime:start,endTime:end,label:'PREMIUM'},{family:'premiumDiscount',kind:'discount',side:'buy',low:lo,high:eq,startTime:start,endTime:end,label:'DISCOUNT'}],lines:[{family:'premiumDiscount',kind:'equilibrium',price:eq,startTime:start,endTime:end,label:'EQ 50%',dashed:true}]};
}


function distanceToZoneAtr(zone,price,atr){
  const p=Number(price),a=Math.max(Number(atr)||0,0.01); if(!finite(p)||!zone)return Infinity;
  if(p>=Number(zone.low)&&p<=Number(zone.high))return 0;
  return Math.min(Math.abs(p-Number(zone.low)),Math.abs(p-Number(zone.high)))/a;
}

function distanceToLineAtr(line,price,atr){
  const p=Number(price),a=Math.max(Number(atr)||0,0.01); return line&&finite(line.price)&&finite(p)?Math.abs(Number(line.price)-p)/a:Infinity;
}

export function detectInternalLiquidity(bars,{majorLeft=5,majorRight=3,minorLeft=1,minorRight=1,maxLevels=8}={}) {
  if(!Array.isArray(bars)||bars.length<30)return{lines:[],markers:[],levels:[],range:null};
  const major=detectPivots(bars,majorLeft,majorRight),minor=detectPivots(bars,minorLeft,minorRight);
  const lastHigh=[...major].reverse().find(p=>p.type==='high'),lastLow=[...major].reverse().find(p=>p.type==='low');
  if(!lastHigh||!lastLow)return{lines:[],markers:[],levels:[],range:null};
  const high=Math.max(lastHigh.price,lastLow.price),low=Math.min(lastHigh.price,lastLow.price),startTime=Math.min(lastHigh.time,lastLow.time),endTime=bars.at(-1)?.time;
  if(!(high>low))return{lines:[],markers:[],levels:[],range:null};
  const atrNow=atrSeries(bars,14).at(-1)?.value??(high-low)/20; const boundary=Math.max(atrNow*0.18,(high-low)*0.015); const consumeBuffer=Math.max(atrNow*0.015,0.01);
  const active=[]; const consumed=[];
  for(const p of minor){
    if(p.time<startTime||p.price<=low+boundary||p.price>=high-boundary)continue;
    const isMajor=major.some(m=>m.type===p.type&&Math.abs(m.price-p.price)<=consumeBuffer*2&&Math.abs(m.index-p.index)<=2); if(isMajor)continue;
    let sweptAt=null;
    for(let j=Math.max(p.confirmIndex+1,p.index+1);j<bars.length;j++){
      const b=bars[j]; const hit=p.type==='high'?b.high>=p.price+consumeBuffer:b.low<=p.price-consumeBuffer;
      if(hit){sweptAt=b.time;break;}
    }
    const level={type:p.type,price:p.price,time:p.time,confirmIndex:p.confirmIndex,sweptAt};
    (sweptAt?consumed:active).push(level);
  }
  // Regroupe les micro-swings très proches : plusieurs pivots au même prix représentent la même poche de liquidité interne.
  const clustered=[]; const tolerance=Math.max(atrNow*0.10,(high-low)*0.004);
  for(const level of [...active].sort((a,b)=>b.time-a.time)){
    const same=clustered.find(x=>x.type===level.type&&Math.abs(x.price-level.price)<=tolerance);
    if(same){same.touches=(same.touches??1)+1;same.time=Math.max(same.time,level.time);same.price=(same.price+level.price)/2;}
    else clustered.push({...level,touches:1});
  }
  const price=Number(bars.at(-1)?.close);
  const levels=clustered.sort((a,b)=>Math.abs(a.price-price)-Math.abs(b.price-price)||b.time-a.time).slice(0,Math.max(1,maxLevels));
  const lines=levels.map((l,i)=>({family:'internalLiquidity',kind:l.type==='high'?'internal_bsl':'internal_ssl',price:l.price,startTime:l.time,endTime,label:`INT ${l.type==='high'?'BSL':'SSL'}${l.touches>1?` ×${l.touches}`:''}`,dashed:true,priority:3,labelVisible:i<4}));
  const markers=consumed.slice(-4).map(l=>({family:'internalLiquidity',kind:'internal_sweep',time:l.sweptAt,price:l.price,label:`INT ${l.type==='high'?'BSL':'SSL'} SWEEP`,direction:l.type==='high'?'bearish':'bullish',labelVisible:true,priority:3}));
  return{lines,markers,levels,range:{low,high,startTime,endTime}};
}

export function buildFibonacciOverlay(bars,structure=detectMarketStructure(bars,{left:5,right:3}),price=null) {
  if(!Array.isArray(bars)||bars.length<30)return{lines:[],zones:[],available:false,direction:'neutral',anchors:null,retracement:null};
  const pivots=structure?.pivots??[]; const atrNow=atrSeries(bars,14).at(-1)?.value??0; let pair=null;
  outer: for(let i=pivots.length-1;i>0;i--){
    const b=pivots[i];
    for(let j=i-1;j>=Math.max(0,i-8);j--){
      const a=pivots[j]; if(a.type===b.type)continue;
      const direction=a.type==='low'&&b.type==='high'?'bullish':a.type==='high'&&b.type==='low'?'bearish':null;
      if(!direction)continue; const range=Math.abs(b.price-a.price); if(range<Math.max(atrNow*1.5,0.01))continue;
      pair={a,b,direction,range}; break outer;
    }
  }
  if(!pair)return{lines:[],zones:[],available:false,direction:'neutral',anchors:null,retracement:null};
  const {a,b,direction,range}=pair; const startTime=a.time,endTime=bars.at(-1)?.time; const ratios=[0.236,0.382,0.5,0.618,0.786];
  const levelPrice=r=>direction==='bullish'?b.price-range*r:b.price+range*r;
  const lines=ratios.map(r=>({family:'fibonacci',kind:`fib_${String(r).replace('.','')}`,price:levelPrice(r),startTime,endTime,label:`FIB ${(r*100).toFixed(r===0.5?0:1)}%`,dashed:r!==0.5,color:r===0.618||r===0.786?'#f59e0b':'#94a3b8',priority:r===0.618||r===0.786?4:2}));
  const oteA=levelPrice(0.618),oteB=levelPrice(0.786); const zones=[{family:'fibonacci',kind:'fib_ote',side:direction==='bullish'?'buy':'sell',low:Math.min(oteA,oteB),high:Math.max(oteA,oteB),startTime:b.time,endTime,label:'FIB 61.8–78.6',labelVisible:true,priority:4}];
  const p=finite(price)?Number(price):Number(bars.at(-1)?.close); const retracement=direction==='bullish'?(b.price-p)/range:(p-b.price)/range;
  const brokeImpulse=direction==='bullish'?p>b.price:p<b.price;
  if(brokeImpulse){
    for(const r of [1.272,1.618]){
      const extension=direction==='bullish'?a.price+range*r:a.price-range*r;
      lines.push({family:'fibonacci',kind:`fib_ext_${String(r).replace('.','')}`,price:extension,startTime:b.time,endTime,label:`FIB EXT ${(r*100).toFixed(1)}%`,dashed:true,color:'#c084fc',priority:3});
    }
  }
  return{lines,zones,available:true,direction,anchors:{start:{time:a.time,price:a.price,type:a.type},end:{time:b.time,price:b.price,type:b.type}},range,retracement,insideOte:p>=Math.min(oteA,oteB)&&p<=Math.max(oteA,oteB),extensionActive:brokeImpulse};
}

const AUTO_FAMILY_KEYS=Object.freeze(['structure','liquidity','internalLiquidity','orderBlocks','fvg','poi','fibonacci','premiumDiscount','htf','sessions','trend','vwap','avwap','volumeProfile','orderFlow','adx','volatilityRegime','macro','rsi','atr']);

export function buildAutoDisplay({bars=[],timeframe='M5',metrics={},smc={},structure={},internal={},fibonacci={},htf={lines:[]},sessions={zones:[]},pd={zones:[],lines:[]}}={}){
  const price=Number(metrics.close),atr=Math.max(Number(metrics.atr14)||0,0.01),lastTime=Number(bars.at(-1)?.time)||0;
  const score=Object.fromEntries(AUTO_FAMILY_KEYS.map(k=>[k,0])); const why={};
  const set=(key,value,reason)=>{score[key]=Math.max(score[key]??0,value);if(reason)why[key]=reason;};
  const structureObj=structure?.structure??structure??{}; const lastEvent=structureObj.events?.at?.(-1); const lastSweep=structureObj.sweeps?.at?.(-1);
  const recentBars=(time)=>time?Math.max(0,Math.round((lastTime-time)/(TF_MS[timeframe]??300000))):999;
  set('structure',98,lastEvent?`Structure ${structureObj.bias??'neutral'} • ${lastEvent.type} récent`:`Structure ${structureObj.bias??'neutral'}`);
  if((structureObj.equalLevels?.length??0)>0||(structureObj.sweeps?.length??0)>0)set('liquidity',94,lastSweep&&recentBars(lastSweep.time)<=18?'Sweep de liquidité récent':'Pools EQH/EQL / BSL/SSL actifs');
  const internalNearest=Math.min(...(internal?.levels??[]).map(l=>Math.abs(Number(l.price)-price)/atr),Infinity);
  if((internal?.levels?.length??0)>0&&internalNearest<=3)set('internalLiquidity',88,`Liquidité interne à ${internalNearest.toFixed(1)} ATR`);
  const zoneDistance=z=>distanceToZoneAtr(z,price,atr);
  const nearestOb=Math.min(...(smc?.orderBlocks??[]).filter(x=>x.active).map(zoneDistance),Infinity);
  const nearestFvg=Math.min(...(smc?.fvgs??[]).filter(x=>['active','partial'].includes(x.state)).map(zoneDistance),Infinity);
  const confirmedNear=Math.min(...(smc?.pois??[]).map(zoneDistance),Infinity),candidateNear=Math.min(...(smc?.candidates??[]).map(zoneDistance),Infinity);
  if(nearestOb<=3)set('orderBlocks',Math.max(70,92-nearestOb*7),`Order Block à ${nearestOb.toFixed(1)} ATR`);
  if(nearestFvg<=3)set('fvg',Math.max(68,90-nearestFvg*7),`FVG/iFVG à ${nearestFvg.toFixed(1)} ATR`);
  if(confirmedNear<=3)set('poi',confirmedNear===0?100:96-confirmedNear*5,confirmedNear===0?'Zone BUY/SELL en test LIVE':`Zone confirmée à ${confirmedNear.toFixed(1)} ATR`);
  else if(candidateNear<=2.5)set('poi',82-candidateNear*4,`Candidate technique à ${candidateNear.toFixed(1)} ATR`);
  if(fibonacci?.available){
    const r=Number(fibonacci.retracement); const meaningful=Number.isFinite(r)&&r>=0.18&&r<=0.9;
    if(fibonacci.insideOte)set('fibonacci',95,'Prix dans la zone Fibonacci 61.8–78.6%');
    else if(meaningful)set('fibonacci',78,`Retracement Fibonacci ${(r*100).toFixed(0)}%`);
    else if(fibonacci.extensionActive)set('fibonacci',74,'Extension Fibonacci active après cassure de l’impulsion');
  }
  if(pd?.zones?.length===2){const eq=pd.lines?.[0];const d=distanceToLineAtr(eq,price,atr);if(d<=1.25)set('premiumDiscount',68,`Équilibre 50% à ${d.toFixed(1)} ATR`);}
  const htfNear=Math.min(...(htf?.lines??[]).map(l=>distanceToLineAtr(l,price,atr)),Infinity); if(htfNear<=3)set('htf',84-htfNear*5,`Niveau HTF à ${htfNear.toFixed(1)} ATR`);
  const sessionNear=Math.min(...(sessions?.zones??[]).map(zoneDistance),Infinity); const sessionCurrent=(sessions?.zones??[]).some(z=>lastTime>=Number(z.startTime)&&lastTime<=Number(z.endTime)+(TF_MS[timeframe]??300000));
  if(sessionCurrent)set('sessions',76,'Session active'); else if(sessionNear<=0.7)set('sessions',64,'Bord de session proche');
  const emaDistances=[metrics.ema20,metrics.ema50,metrics.ema200].filter(finite).map(v=>Math.abs(Number(v)-price)/atr); const emaNear=Math.min(...emaDistances,Infinity);
  if(metrics.trend!=='neutral')set('trend',82,`Tendance EMA ${metrics.trend}`); else if(emaNear<=0.55)set('trend',66,'EMA dynamique proche du prix');
  const vwapDist=finite(metrics.vwap)?Math.abs(Number(metrics.vwap)-price)/atr:Infinity; if(vwapDist<=1.15)set('vwap',72-vwapDist*7,`VWAP à ${vwapDist.toFixed(1)} ATR`);
  const rsi=Number(metrics.rsi14); if(Number.isFinite(rsi)&&(rsi<=35||rsi>=65))set('rsi',88,`RSI ${rsi.toFixed(1)} en zone extrême`); else if(Number.isFinite(rsi)&&(rsi<=42||rsi>=58)&&lastEvent&&recentBars(lastEvent.time)<=12)set('rsi',64,'RSI utile pour confirmer le momentum du break');
  const atrPts=atrSeries(bars,14).slice(-50); const atrBase=average(atrPts.slice(0,-1).map(x=>x.value)); const atrRatio=finite(atrBase)&&atrBase>0?atr/atrBase:1;
  if(atrRatio>=1.25)set('atr',76,`Volatilité élevée ×${atrRatio.toFixed(2)}`); else if(atrRatio<=0.72)set('atr',70,`Compression de volatilité ×${atrRatio.toFixed(2)}`);
  const adx=Number(metrics.adx14); if(Number.isFinite(adx)){if(adx>=25)set('adx',86,`ADX ${adx.toFixed(1)} : tendance forte`);else if(adx<18)set('adx',72,`ADX ${adx.toFixed(1)} : marché peu directionnel`);}
  if(metrics.volatilityState==='compression')set('volatilityRegime',84,`Compression BB Width • percentile ${Math.round((metrics.bandwidthPercentile??0)*100)}%`);else if(metrics.volatilityState==='expansion')set('volatilityRegime',88,`Expansion BB Width • percentile ${Math.round((metrics.bandwidthPercentile??0)*100)}%`);
  const vpDistances=[metrics.profilePoc,metrics.profileVah,metrics.profileVal].filter(finite).map(v=>Math.abs(Number(v)-price)/atr);const vpNear=Math.min(...vpDistances,Infinity);if(metrics.profileAvailable&&(vpNear<=1.6||metrics.volumeSpike))set('volumeProfile',metrics.volumeSpike?90:82,metrics.volumeSpike?`Tick-volume spike ×${Number(metrics.volumeRatio??0).toFixed(2)} • profil actif`:`POC/VA à ${vpNear.toFixed(1)} ATR`);
  const imb=finite(metrics.depthImbalance)?Number(metrics.depthImbalance):null;if(metrics.depthAvailable&&finite(imb)&&Math.abs(imb)>=0.12)set('orderFlow',Math.min(96,76+Math.abs(imb)*50),`DOM ${imb>0?'BID':'ASK'} imbalance ${(Math.abs(imb)*100).toFixed(0)}%`);
  if(metrics.avwapNearest?.value&&finite(metrics.avwapNearest.value)){const d=Math.abs(Number(metrics.avwapNearest.value)-price)/atr;if(d<=1.25)set('avwap',80-d*6,`${metrics.avwapNearest.label} à ${d.toFixed(1)} ATR`);}
  const macroRisk=String(metrics.macroRisk??'normal');if(metrics.macroAvailable){if(macroRisk==='critical')set('macro',100,`Macro critique imminente${metrics.nextMacroEvent?.type?` • ${metrics.nextMacroEvent.type}`:''}`);else if(macroRisk==='high')set('macro',96,`Événement macro < 60 min${metrics.nextMacroEvent?.type?` • ${metrics.nextMacroEvent.type}`:''}`);else if(macroRisk==='elevated')set('macro',82,`Événement macro proche${metrics.nextMacroEvent?.type?` • ${metrics.nextMacroEvent.type}`:''}`);else if(macroRisk==='watch')set('macro',74,`Événement macro critique aujourd'hui${metrics.nextMacroEvent?.type?` • ${metrics.nextMacroEvent.type}`:''}`);else if(metrics.macroBias&&metrics.macroBias!=='neutral')set('macro',66,`Macro Gold ${metrics.macroBias}`);}

  // Le mode AUTO garde un noyau de lecture, puis sélectionne seulement les contextes les mieux scorés.
  const mandatory=new Set(['structure']); if(score.liquidity>0)mandatory.add('liquidity'); if(score.poi>=90)mandatory.add('poi'); if(score.macro>=96)mandatory.add('macro');
  const ranked=AUTO_FAMILY_KEYS.filter(k=>score[k]>0&&!mandatory.has(k)).sort((a,b)=>score[b]-score[a]);
  const selected=new Set([...mandatory,...ranked.slice(0,Math.max(0,9-mandatory.size))]);
  const families=Object.fromEntries(AUTO_FAMILY_KEYS.map(k=>[k,selected.has(k)]));
  let focus='LECTURE NEUTRE';
  const livePoi=(smc?.pois??[]).find(z=>z.liveState==='inside'); const nearPoi=(smc?.pois??[]).filter(z=>z.liveState==='near').sort((a,b)=>(a.distanceAtr??99)-(b.distanceAtr??99))[0];
  const structureBias=String(structureObj.bias??'neutral').toUpperCase();
  const withStructure=(label,side)=>structureBias!=='NEUTRAL'&&structureBias!==side?`${label} • STRUCTURE ${structureBias}`:label;
  if(score.macro>=96)focus=`MACRO RISK — ${String(metrics.nextMacroEvent?.type??'HIGH IMPACT')}`;
  else if(livePoi){const side=livePoi.side==='buy'?'BUY':'SELL';focus=withStructure(`${side} ZONE LIVE`,side);}
  else if(nearPoi){const side=nearPoi.side==='buy'?'BUY':'SELL';focus=withStructure(`${side} ZONE PROCHE`,side);}
  else if(lastSweep&&recentBars(lastSweep.time)<=8){
    const reaction=lastSweep.side==='buy-side'?'SELL':'BUY';
    focus=withStructure(`SWEEP ${lastSweep.side==='buy-side'?'BSL':'SSL'} — RÉACTION ${reaction}`,reaction);
  }
  else if(structureObj.bias==='bullish')focus='STRUCTURE BULLISH'; else if(structureObj.bias==='bearish')focus='STRUCTURE BEARISH';
  const reasons=[...selected].sort((a,b)=>score[b]-score[a]).slice(0,5).map(k=>why[k]).filter(Boolean);
  return{mode:'auto',families,scores:score,reasons,focus,visibleCount:[...selected].length,atrRatio};
}

export function buildOscillatorOverlays(bars) {
  return {
    rsi:{family:'rsi',kind:'rsi14',label:'RSI 14',points:rsiSeries(bars,14)},
    atr:{family:'atr',kind:'atr14',label:'ATR 14',points:atrSeries(bars,14)}
  };
}

export function buildVisualAnalysis(snapshot,timeframe='M5') {
  const bars=snapshot?.bars?.[timeframe]??[]; if(!bars.length)return{timeframe,overlays:{zones:[],lines:[],markers:[],series:[],bands:[],oscillators:{rsi:{family:'rsi',kind:'rsi14',label:'RSI 14',points:[]},atr:{family:'atr',kind:'atr14',label:'ATR 14',points:[]}}},metrics:{},display:{mode:'auto',families:{},scores:{},reasons:[],focus:'EN ATTENTE',visibleCount:0}};
  const livePrice=Number(snapshot?.quote?.bid); const price=Number.isFinite(livePrice)?livePrice:Number(bars.at(-1)?.close);
  const trend=buildTrendOverlays(bars), oscillators=buildOscillatorOverlays(bars), structure=buildStructureOverlays(bars), smc=buildSmcOverlays(bars,{price}), htf=buildHtfLevels(snapshot), sessions=buildSessionOverlays(bars), pd=buildPremiumDiscount(bars,structure.structure), internal=detectInternalLiquidity(bars), fibonacci=buildFibonacciOverlay(bars,detectMarketStructure(bars,{left:5,right:3}),price);
  const profile=buildVolumeProfile(bars,{bins:36,valueArea:0.70,maxBars:220}), profileOverlays=buildProfileOverlays(profile), orderFlow=buildOrderFlowOverlays(snapshot?.depth,bars), avwap=buildAnchoredVwaps(bars,{structure:structure.structure,sessions}), advancedOscillators=buildAdvancedOscillators(bars);
  const metrics=trendMetrics(bars,snapshot?.bars?.H4??snapshot?.bars?.H1??[]);
  Object.assign(metrics,advancedMetrics({bars,profile,depth:snapshot?.depth,macro:snapshot?.macro,structure:structure.structure,sessions}));
  metrics.structureBias=structure.structure.bias; metrics.activeFvgs=smc.fvgs.filter(f=>['active','partial'].includes(f.state)).length; metrics.activeOrderBlocks=smc.orderBlocks.length; metrics.activeBuyZones=smc.pois.filter(z=>z.side==='buy').length; metrics.activeSellZones=smc.pois.filter(z=>z.side==='sell').length; metrics.buyCandidates=smc.candidates.filter(z=>z.side==='buy').length; metrics.sellCandidates=smc.candidates.filter(z=>z.side==='sell').length; metrics.availableBuyZones=smc.rawPois.some(z=>z.side==='buy'); metrics.availableSellZones=smc.rawPois.some(z=>z.side==='sell'); metrics.nearestBuyZone=smc.pois.filter(z=>z.side==='buy').sort((a,b)=>(a.distanceAtr??999)-(b.distanceAtr??999))[0]??null; metrics.nearestSellZone=smc.pois.filter(z=>z.side==='sell').sort((a,b)=>(a.distanceAtr??999)-(b.distanceAtr??999))[0]??null; metrics.lastStructureEvent=structure.structure.events.at(-1)??null; metrics.lastSweep=structure.structure.sweeps.at(-1)??null;
  metrics.structureEvents=structure.structure.events.length; metrics.equalLevels=structure.structure.equalLevels.length; metrics.sweeps=structure.structure.sweeps.length; metrics.internalLiquidityLevels=internal.levels.length; metrics.displayedFvgs=smc.displayedFvgs.length; metrics.displayedIfvgs=smc.displayedIfvgs.length; metrics.displayedOrderBlocks=smc.displayedOrderBlocks.length; metrics.htfLevels=htf.lines.length; metrics.sessionRanges=sessions.zones.length; metrics.premiumDiscountAvailable=pd.zones.length===2&&pd.lines.length===1; metrics.fibonacciAvailable=fibonacci.available; metrics.fibonacciDirection=fibonacci.direction; metrics.fibonacciRetracement=fibonacci.retracement; metrics.fibonacciInsideOte=Boolean(fibonacci.insideOte); metrics.emaSeries=trend.series.filter(x=>x.family==='trend').length; metrics.vwapSeries=trend.series.filter(x=>x.family==='vwap').length; metrics.avwapSeries=avwap.series.length; metrics.rsiSeries=oscillators.rsi.points.length; metrics.atrSeries=oscillators.atr.points.length; metrics.adxSeries=advancedOscillators.adx.points.length; metrics.bandwidthSeries=advancedOscillators.bandwidth.points.length; metrics.profileBins=profile.bins?.length??0; metrics.orderFlowWalls=orderFlow.lines.length;
  const display=buildAutoDisplay({bars,timeframe,metrics,smc,structure,internal,fibonacci,htf,sessions,pd}); metrics.autoFocus=display.focus; metrics.autoVisibleCount=display.visibleCount; metrics.atrRegimeRatio=display.atrRatio;
  return {
    timeframe,
    execution:null,
    overlays:{zones:[...smc.zones,...fibonacci.zones,...sessions.zones,...pd.zones],lines:[...structure.lines,...internal.lines,...fibonacci.lines,...htf.lines,...pd.lines,...profileOverlays.lines,...orderFlow.lines],markers:[...structure.markers,...internal.markers],series:[...trend.series,...avwap.series],profiles:profileOverlays.profiles,bands:[],oscillators:{...oscillators,...advancedOscillators}},
    metrics,
    display
  };
}
