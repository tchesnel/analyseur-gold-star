import {
  atrSeries,
  buildHtfLevels,
  buildSessionOverlays,
  detectFvgs,
  detectInternalLiquidity,
  detectMarketStructure,
  detectPivots
} from '../engine/visual-analysis.js';
import { adxDmiSeries, buildVolumeProfile, depthDataQuality, tickVolumeMetrics } from '../engine/advanced-context.js';

export const R01_CONFIG = Object.freeze({
  id: 'R01',
  name: 'Liquidity Sweep / Failed Auction Reversal',
  locationTimeframe: 'M5',
  triggerTimeframe: 'M1',
  sweepLookbackBars: 12,
  reclaimMaxBars: 3,
  minSweepPenetrationAtr: 0.05,
  acceptanceBufferAtr: 0.08,
  acceptanceConsecutiveCloses: 2,
  microShiftMaxMinutes: 30,
  entryTimeoutMinutes: 45,
  reclaimBandAtr: 0.15,
  stopBufferAtr: 0.12,
  sellStopSpreadFactor: 1.00,
  minRewardRisk: 1.5,
  maxSpreadAtrM1: 0.30,
  maxAdxM5: 24,
  minRiskAtrM5: 0.75,
  nyWindowStartMinutes: 8*60+20,
  nyWindowEndMinutes: 16*60,
  blockMacroRisks: Object.freeze(['high', 'critical'])
});

const TF_MS = Object.freeze({ M1: 60_000, M5: 300_000, M15: 900_000, M30: 1_800_000, H1: 3_600_000, H4: 14_400_000 });
const finite = (n) => n !== null && n !== undefined && n !== '' && Number.isFinite(Number(n));
const avg = (xs) => { const a=(xs??[]).filter(finite).map(Number); return a.length ? a.reduce((s,x)=>s+x,0)/a.length : null; };

function atrNow(bars, period=14){ return atrSeries(bars,period).at(-1)?.value ?? null; }
function atrMap(bars,period=14){ return new Map(atrSeries(bars,period).map(x=>[Number(x.time),Number(x.value)])); }
function causalAtr(map,time,fallback=.01){ const v=map.get(Number(time)); return Math.max(Number.isFinite(v)?v:Number(fallback)||.01,.01); }
function isInsideAfterSweep(direction, close, level, buffer=0){ return direction==='buy' ? close >= level+buffer : close <= level-buffer; }
function isBeyondLevel(direction, close, level, buffer=0){ return direction==='buy' ? close < level-buffer : close > level+buffer; }
function barsSince(bars,time){ const i=bars.findIndex(b=>Number(b.time)>=Number(time)); return i<0?Infinity:Math.max(0,bars.length-1-i); }
function condition(id,label,passed,{required=true,value=null,note=null}={}){ return {id,label,passed:Boolean(passed),required,value,note}; }

const nyClock=new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',hour:'2-digit',minute:'2-digit',hourCycle:'h23'});
function nyMinutes(time){
  if(!finite(time)) return null;
  const parts=Object.fromEntries(nyClock.formatToParts(new Date(Number(time))).map(p=>[p.type,p.value]));
  const h=Number(parts.hour),m=Number(parts.minute); return Number.isFinite(h)&&Number.isFinite(m)?h*60+m:null;
}
function inR01NyWindow(time,config=R01_CONFIG){
  const mins=nyMinutes(time);
  return Number.isFinite(mins)&&mins>=Number(config.nyWindowStartMinutes)&&mins<Number(config.nyWindowEndMinutes);
}
function adxAtOrBefore(bars,time){
  const xs=adxDmiSeries(bars,14);
  for(let i=xs.length-1;i>=0;i--) if(Number(xs[i].time)<=Number(time)) return Number(xs[i].adx);
  return null;
}

function dedupeLevels(levels,tolerance){
  const sorted=[...levels].filter(l=>finite(l.price)&&['high','low'].includes(l.side)).sort((a,b)=>Number(b.strength??0)-Number(a.strength??0)||Number(b.time??0)-Number(a.time??0));
  const out=[];
  for(const l of sorted){
    const duplicate=out.find(x=>x.side===l.side&&Math.abs(Number(x.price)-Number(l.price))<=tolerance);
    if(!duplicate) out.push(l);
  }
  return out;
}

export function buildR01KeyLiquidity(snapshot,{barsM5=snapshot?.bars?.M5??[]}={}){
  if(!barsM5.length) return [];
  const a=Math.max(Number(atrNow(barsM5))||0.01,0.01);
  const levels=[];
  const push=(side,price,label,source,strength=1,time=null)=>{ if(finite(price)) levels.push({side,price:Number(price),label,source,strength,time}); };

  // Previous day/week references are established before the current session and are safe external-liquidity anchors.
  for(const l of buildHtfLevels(snapshot).lines??[]){
    if(['dh','wh','pdh','pwh'].includes(l.kind)||['PDH','PWH'].includes(l.label)) push('high',l.price,l.label,'HTF',String(l.label).startsWith('PW')?9:10,l.startTime??null);
    if(['dl','wl','pdl','pwl'].includes(l.kind)||['PDL','PWL'].includes(l.label)) push('low',l.price,l.label,'HTF',String(l.label).startsWith('PW')?9:10,l.startTime??null);
  }

  // Confirmed M15/H1 swing points and equal highs/lows.
  // IMPORTANT: the level becomes eligible only at its CONFIRMATION time, never at the pivot timestamp itself.
  // This prevents look-ahead when replaying/backtesting a sweep that occurred before the right-side pivot bars existed.
  for(const [tf,strength] of [['M15',7],['H1',8]]){
    const bars=snapshot?.bars?.[tf]??[]; if(bars.length<20) continue;
    const s=detectMarketStructure(bars,{left:3,right:3});
    // Calibration 2021-2026: an isolated M15 pivot is too noisy for R01.
    // Keep H1 swings, while M15/H1 equal highs/lows remain valid liquidity pools.
    if(tf==='H1') for(const p of s.pivots.slice(-14)){
      const confirmedAt=bars[p.confirmIndex]?.time ?? p.time;
      push(p.type,p.price,`${tf} SWING ${p.type==='high'?'H':'L'}`,`${tf}_PIVOT`,strength,confirmedAt);
    }
    for(const e of s.equalLevels.slice(-6)){
      const matching=[...(s.pivots??[])].reverse().find(p=>p.type===e.type&&Number(p.time)===Number(e.endTime));
      const confirmedAt=matching ? (bars[matching.confirmIndex]?.time ?? e.endTime) : e.endTime;
      push(e.type,e.price,`${tf} ${e.type==='high'?'EQH':'EQL'}`,`${tf}_EQ`,strength+1,confirmedAt);
    }
  }

  // Volume Profile references are deliberately NOT added here. Their VAH/VAL must be built from
  // bars that existed BEFORE the tested sweep. They are injected per candidate by auctionLevelsBefore().
  return dedupeLevels(levels,a*0.12);
}

export function buildR01AuctionLiquidityBefore(barsM5,index,atr){
  if(!Array.isArray(barsM5)||index<20)return [];
  const pre=barsM5.slice(0,index);
  const profile=buildVolumeProfile(pre,{bins:36,valueArea:0.70,maxBars:220});
  if(!profile?.available)return [];
  const t=Number(pre.at(-1)?.time??0);
  return dedupeLevels([
    {side:'high',price:Number(profile.vah),label:'VP VAH',source:'VOLUME_PROFILE_PRE',strength:6,time:t},
    {side:'low',price:Number(profile.val),label:'VP VAL',source:'VOLUME_PROFILE_PRE',strength:6,time:t}
  ],Math.max(Number(atr)||0.01,0.01)*0.12);
}

export function buildR01SessionLiquidityBefore(barsM5,index,atr){
  if(!Array.isArray(barsM5)||index<6)return [];
  const pre=barsM5.slice(0,index);
  const sessions=buildSessionOverlays(pre).zones??[];
  const levels=[];
  for(const z of sessions){
    const base=String(z.label??'SESSION RANGE').replace(/\s+RANGE$/i,'');
    const knownAt=Number(z.endTime??pre.at(-1)?.time??0);
    if(finite(z.high))levels.push({side:'high',price:Number(z.high),label:`${base} H`,source:'SESSION_PRE',strength:7,time:knownAt});
    if(finite(z.low))levels.push({side:'low',price:Number(z.low),label:`${base} L`,source:'SESSION_PRE',strength:7,time:knownAt});
  }
  return dedupeLevels(levels,Math.max(Number(atr)||0.01,0.01)*0.12);
}

function levelsForCandidateBar(barsM5,index,keyLevels,atr){
  const candidateTime=Number(barsM5?.[index]?.time??Infinity);
  const eligible=(keyLevels??[]).filter(l=>!finite(l.time)||Number(l.time)<=candidateTime);
  return dedupeLevels([
    ...eligible,
    ...buildR01AuctionLiquidityBefore(barsM5,index,atr),
    ...buildR01SessionLiquidityBefore(barsM5,index,atr)
  ],Math.max(Number(atr)||0.01,0.01)*0.12);
}

export function findR01Probe(barsM5,keyLevels,{config=R01_CONFIG}={}){
  if(!Array.isArray(barsM5)||barsM5.length<30)return null;
  const fallbackAtr=Math.max(Number(atrNow(barsM5))||0.01,0.01),aMap=atrMap(barsM5);
  const start=Math.max(1,barsM5.length-config.sweepLookbackBars-1),candidates=[];
  for(let i=start;i<barsM5.length;i++){
    const b=barsM5[i],prev=barsM5[i-1],a=causalAtr(aMap,b.time,fallbackAtr),minPen=a*config.minSweepPenetrationAtr,priorBuffer=a*config.acceptanceBufferAtr;
    const candidateLevels=levelsForCandidateBar(barsM5,i,keyLevels,a);
    for(const l of candidateLevels){
      if(finite(l.time)&&Number(l.time)>Number(b.time))continue;
      if(l.side==='high'&&Number(b.high)>=Number(l.price)+minPen&&Number(prev?.close)<=Number(l.price)+priorBuffer)candidates.push({direction:'sell',sweepSide:'buy-side',index:i,time:b.time,level:l,levelPrice:l.price,extreme:b.high,close:b.close,penetration:Number(b.high)-Number(l.price),penetrationAtr:(Number(b.high)-Number(l.price))/a,atrAtSweep:a,bar:b,probeOnly:true});
      if(l.side==='low'&&Number(b.low)<=Number(l.price)-minPen&&Number(prev?.close)>=Number(l.price)-priorBuffer)candidates.push({direction:'buy',sweepSide:'sell-side',index:i,time:b.time,level:l,levelPrice:l.price,extreme:b.low,close:b.close,penetration:Number(l.price)-Number(b.low),penetrationAtr:(Number(l.price)-Number(b.low))/a,atrAtSweep:a,bar:b,probeOnly:true});
    }
  }
  return candidates.sort((x,y)=>Number(y.time)-Number(x.time)||Number(y.level.strength??0)-Number(x.level.strength??0))[0]??null;
}

export function findR01Sweep(barsM5,keyLevels,{config=R01_CONFIG}={}){
  if(!Array.isArray(barsM5)||barsM5.length<30) return null;
  const fallbackAtr=Math.max(Number(atrNow(barsM5))||0.01,0.01),aMap=atrMap(barsM5);
  const start=Math.max(1,barsM5.length-config.sweepLookbackBars-1);
  const candidates=[];

  for(let i=start;i<barsM5.length;i++){
    const b=barsM5[i],prev=barsM5[i-1],a=causalAtr(aMap,b.time,fallbackAtr);
    const priorBuffer=a*config.acceptanceBufferAtr,minPen=a*config.minSweepPenetrationAtr;
    const candidateLevels=levelsForCandidateBar(barsM5,i,keyLevels,a);
    for(const l of candidateLevels){
      // Do not let a pivot that was confirmed after the sweep become a retrospective key level.
      if(finite(l.time)&&Number(l.time)>Number(b.time)) continue;
      if(l.side==='high'){
        const penetration=Number(b.high)-Number(l.price);
        if(penetration<minPen) continue;
        if(Number(prev?.close)>Number(l.price)+priorBuffer) continue;

        // A failed auction does not have to reclaim inside the very same M5 candle.
        // Gold often stops through a level first, then re-enters/holds back below over
        // the next few bars. We therefore allow a short, strictly causal reclaim window.
        let reclaimIndex=null,reclaimBar=null,consecutiveBeyond=0;
        const acceptanceBuffer=a*config.acceptanceBufferAtr;
        const last=Math.min(barsM5.length-1,i+Math.max(0,config.reclaimMaxBars));
        for(let j=i;j<=last;j++){
          const x=barsM5[j];
          if(Number(x.close)>Number(l.price)+acceptanceBuffer){
            consecutiveBeyond++;
            if(consecutiveBeyond>=config.acceptanceConsecutiveCloses) break;
          }else{
            consecutiveBeyond=0;
            if(Number(x.close)<Number(l.price)){reclaimIndex=j;reclaimBar=x;break;}
          }
        }
        if(reclaimIndex===null) continue;
        candidates.push({direction:'sell',sweepSide:'buy-side',index:i,time:b.time,reclaimIndex,reclaimTime:reclaimBar.time,level:l,levelPrice:l.price,extreme:Math.max(...barsM5.slice(i,reclaimIndex+1).map(x=>Number(x.high))),close:reclaimBar.close,penetration,penetrationAtr:penetration/a,atrAtSweep:a,bar:b,reclaimBar});
      }else{
        const penetration=Number(l.price)-Number(b.low);
        if(penetration<minPen) continue;
        if(Number(prev?.close)<Number(l.price)-priorBuffer) continue;

        let reclaimIndex=null,reclaimBar=null,consecutiveBeyond=0;
        const acceptanceBuffer=a*config.acceptanceBufferAtr;
        const last=Math.min(barsM5.length-1,i+Math.max(0,config.reclaimMaxBars));
        for(let j=i;j<=last;j++){
          const x=barsM5[j];
          if(Number(x.close)<Number(l.price)-acceptanceBuffer){
            consecutiveBeyond++;
            if(consecutiveBeyond>=config.acceptanceConsecutiveCloses) break;
          }else{
            consecutiveBeyond=0;
            if(Number(x.close)>Number(l.price)){reclaimIndex=j;reclaimBar=x;break;}
          }
        }
        if(reclaimIndex===null) continue;
        candidates.push({direction:'buy',sweepSide:'sell-side',index:i,time:b.time,reclaimIndex,reclaimTime:reclaimBar.time,level:l,levelPrice:l.price,extreme:Math.min(...barsM5.slice(i,reclaimIndex+1).map(x=>Number(x.low))),close:reclaimBar.close,penetration,penetrationAtr:penetration/a,atrAtSweep:a,bar:b,reclaimBar});
      }
    }
  }

  // Most recent first; when several references overlap, prefer the strongest one.
  return candidates.sort((x,y)=>Number(y.time)-Number(x.time)||Number(y.level.strength??0)-Number(x.level.strength??0)||Math.abs(Number(x.levelPrice)-Number(x.close))-Math.abs(Number(y.levelPrice)-Number(y.close)))[0]??null;
}

export function refineR01SweepTime(barsM1,sweep,{config=R01_CONFIG}={}){
  if(!sweep||!Array.isArray(barsM1)||!barsM1.length)return sweep;
  const start=Number(sweep.time),end=start+TF_MS.M5,aMap=atrMap(barsM1),fallback=Math.max(Number(atrNow(barsM1))||0.01,0.01);
  for(const b of barsM1){
    if(Number(b.time)<start||Number(b.time)>=end)continue;
    const a1=causalAtr(aMap,b.time,fallback),minPen=Math.max(a1*config.minSweepPenetrationAtr,0.001);
    if(sweep.direction==='sell'&&Number(b.high)>=Number(sweep.levelPrice)+minPen&&Number(b.close)<Number(sweep.levelPrice)){
      return {...sweep,time:b.time,extreme:Math.max(Number(sweep.extreme),Number(b.high)),atrAtMicroSweep:a1,microSweepBar:b};
    }
    if(sweep.direction==='buy'&&Number(b.low)<=Number(sweep.levelPrice)-minPen&&Number(b.close)>Number(sweep.levelPrice)){
      return {...sweep,time:b.time,extreme:Math.min(Number(sweep.extreme),Number(b.low)),atrAtMicroSweep:a1,microSweepBar:b};
    }
  }
  return sweep;
}

export function classifyFailedAcceptance(barsM5,sweep,{config=R01_CONFIG}={}){
  if(!sweep) return {reclaimed:false,acceptedBeyond:false,insideCloses:0,consecutiveBeyond:0};
  const aSeries=atrMap(barsM5),sweepBar=barsM5[sweep.index],a=causalAtr(aSeries,sweepBar?.time,Number(sweep.atrAtSweep)||atrNow(barsM5)||0.01),buffer=a*config.acceptanceBufferAtr;
  const post=barsM5.slice(sweep.index);
  let maxConsecutive=0,run=0,insideCloses=0;
  for(const b of post){
    if(isBeyondLevel(sweep.direction,Number(b.close),Number(sweep.levelPrice),buffer)){run++;maxConsecutive=Math.max(maxConsecutive,run);}else{run=0;if(isInsideAfterSweep(sweep.direction,Number(b.close),Number(sweep.levelPrice),0))insideCloses++;}
  }
  const last=post.at(-1); const reclaimed=Boolean(last)&&isInsideAfterSweep(sweep.direction,Number(last.close),Number(sweep.levelPrice),0);
  return {reclaimed,acceptedBeyond:maxConsecutive>=config.acceptanceConsecutiveCloses,insideCloses,consecutiveBeyond:maxConsecutive,buffer};
}

export function classifyR01ProbeOutcome(barsM5,probe,{config=R01_CONFIG}={}){
  if(!probe||!Array.isArray(barsM5)||!barsM5.length) return {acceptedBeyond:false,reclaimed:false,consecutiveBeyond:0};
  const a=Math.max(Number(probe.atrAtSweep)||Number(atrNow(barsM5))||0.01,0.01);
  const buffer=a*config.acceptanceBufferAtr;
  const last=Math.min(barsM5.length-1,Number(probe.index)+Math.max(config.reclaimMaxBars,config.acceptanceConsecutiveCloses));
  let run=0,maxConsecutive=0,reclaimed=false;
  for(let i=Number(probe.index);i<=last;i++){
    const b=barsM5[i];
    if(isBeyondLevel(probe.direction,Number(b.close),Number(probe.levelPrice),buffer)){
      run++;maxConsecutive=Math.max(maxConsecutive,run);
      if(maxConsecutive>=config.acceptanceConsecutiveCloses) break;
    }else{
      run=0;
      if(isInsideAfterSweep(probe.direction,Number(b.close),Number(probe.levelPrice),0)){reclaimed=true;break;}
    }
  }
  return {acceptedBeyond:maxConsecutive>=config.acceptanceConsecutiveCloses,reclaimed,consecutiveBeyond:maxConsecutive,buffer};
}

export function findMicroStructureShift(barsM1,sweep,{config=R01_CONFIG}={}){
  if(!sweep||!Array.isArray(barsM1)||barsM1.length<30) return null;
  const confirmationStart=Number(sweep.reclaimTime??sweep.time);
  const deadline=confirmationStart+config.microShiftMaxMinutes*60_000;
  const direction=sweep.direction==='buy'?'bullish':'bearish';
  const structure=detectMarketStructure(barsM1,{left:2,right:2});
  const eligible=(structure.events??[]).filter(e=>Number(e.time)>=confirmationStart&&Number(e.time)<=deadline&&e.direction===direction&&(e.type==='MSS'||e.type==='CHOCH'||(e.type==='BOS'&&e.displacement)));
  if(eligible[0]) return eligible[0];

  // Fallback explicite : break du dernier micro-pivot opposé, confirmé AVANT le sweep.
  // Cela évite de dépendre du label interne BOS/CHOCH tout en conservant la mécanique professionnelle :
  // le marché doit reprendre une structure locale après le failed auction.
  const sweepIndex=barsM1.findIndex(b=>Number(b.time)>=confirmationStart); if(sweepIndex<4)return null;
  const pivots=detectPivots(barsM1.slice(0,Math.min(barsM1.length,sweepIndex+1)),2,2);
  const referenceType=sweep.direction==='buy'?'high':'low';
  const ref=[...pivots].reverse().find(p=>p.type===referenceType&&p.confirmIndex<=sweepIndex);
  if(!ref)return null;
  const aMap=atrMap(barsM1),fallback=Math.max(Number(atrNow(barsM1))||0.01,0.01);
  for(let i=sweepIndex+1;i<barsM1.length;i++){
    const b=barsM1[i]; if(Number(b.time)>deadline)break;
    const a=causalAtr(aMap,b.time,fallback),buffer=a*0.03;
    const broke=sweep.direction==='buy'?Number(b.close)>Number(ref.price)+buffer:Number(b.close)<Number(ref.price)-buffer;
    if(!broke)continue;
    const body=Math.abs(Number(b.close)-Number(b.open));
    return{direction,type:'MICRO_BREAK',time:b.time,price:ref.price,index:i,displacement:body>=a*0.9,atrAtShift:a,reference:ref};
  }
  return null;
}

export function findPostShiftMomentum(barsM1,sweep,shift){
  if(!sweep||!shift) return {passed:false,fvg:null,displacement:false};
  const side=sweep.direction==='buy'?'buy':'sell';
  const fvg=detectFvgs(barsM1,{minAtr:0.10,max:80}).filter(f=>f.side===side&&Number(f.startTime)>=Number(shift.time)&&['active','partial'].includes(f.state)).sort((a,b)=>Number(a.startTime)-Number(b.startTime))[0]??null;
  return {passed:Boolean(shift.displacement||fvg),fvg,displacement:Boolean(shift.displacement)};
}

export function r01EffortResultProxy(barsM5,sweep,depth){
  if(!sweep) return {passed:false,volumeRatio:null,wickRejection:false,dom:false,quality:'none'};
  const prior=barsM5.slice(Math.max(0,sweep.index-20),sweep.index); const base=avg(prior.map(b=>Number(b.volume)||0)); const volume=Number(sweep.bar?.volume)||0; const ratio=finite(base)&&base>0?volume/base:null;
  const range=Math.max(1e-9,Number(sweep.bar.high)-Number(sweep.bar.low));
  const rejection=sweep.direction==='buy'?(Number(sweep.bar.close)-Number(sweep.bar.low))/range:(Number(sweep.bar.high)-Number(sweep.bar.close))/range;
  const wickRejection=rejection>=0.55;
  const q=depthDataQuality(depth); const imbalance=q.state==='ok'&&finite(depth?.imbalance)?Number(depth.imbalance):null;
  const dom=finite(imbalance)&&(sweep.direction==='buy'?imbalance>=0.12:imbalance<=-0.12);
  const volumeEvidence=finite(ratio)&&ratio>=1.20&&wickRejection;
  return {passed:Boolean(volumeEvidence||dom),volumeRatio:ratio,wickRejection,dom,quality:dom&&volumeEvidence?'strong':dom||volumeEvidence?'supportive':'none'};
}

function pickEntryZone(barsM1,sweep,shift,momentum,atrM1){
  // Freeze the reclaim band from information known at confirmation time.
  // It must not breathe wider/narrower on every later tick as ATR changes.
  const a=Math.max(Number(shift?.atrAtShift)||Number(sweep?.atrAtMicroSweep)||Number(atrM1)||0.01,0.01);
  if(momentum?.fvg){
    return {kind:'fvg-retest',low:Number(momentum.fvg.low),high:Number(momentum.fvg.high),label:'R01 RETEST FVG',sourceTime:momentum.fvg.startTime};
  }
  const level=Number(sweep.levelPrice),half=a*R01_CONFIG.reclaimBandAtr;
  return {kind:'reclaim-retest',low:level-half,high:level+half,label:'R01 RECLAIM RETEST',sourceTime:shift?.time??sweep.time};
}

function targetPlan(snapshot,barsM5,sweep,entry,stop){
  const direction=sweep.direction,price=Number(entry),risk=Math.abs(price-Number(stop)); if(!(risk>0))return{tp1:null,tp2:null,rr1:null,rr2:null};
  const internal=detectInternalLiquidity(barsM5).levels??[];
  const key=buildR01KeyLiquidity(snapshot,{barsM5});
  const profile=buildVolumeProfile(barsM5,{bins:36,valueArea:0.70,maxBars:220});
  const candidates=[];
  const add=(p,label,rank=1)=>{if(!finite(p))return;const x=Number(p);if(direction==='buy'&&x>price)candidates.push({price:x,label,rank});if(direction==='sell'&&x<price)candidates.push({price:x,label,rank});};
  for(const l of internal){if(direction==='buy'&&l.type==='high')add(l.price,'INT BSL',4);if(direction==='sell'&&l.type==='low')add(l.price,'INT SSL',4);}
  for(const l of key){if(direction==='buy'&&l.side==='high')add(l.price,l.label,5);if(direction==='sell'&&l.side==='low')add(l.price,l.label,5);}
  if(profile?.available){add(profile.poc,'VP POC',3);add(direction==='buy'?profile.vah:profile.val,direction==='buy'?'VP VAH':'VP VAL',4);}
  candidates.sort((a,b)=>Math.abs(a.price-price)-Math.abs(b.price-price)||b.rank-a.rank);
  const unique=[];for(const c of candidates){if(!unique.some(x=>Math.abs(x.price-c.price)<=risk*0.15))unique.push(c);}
  const tp1=unique.find(x=>Math.abs(x.price-price)>=risk*0.8)??null;
  const tp2=unique.find(x=>Math.abs(x.price-price)>=risk*R01_CONFIG.minRewardRisk&&(!tp1||Math.abs(x.price-price)>Math.abs(tp1.price-price)+risk*0.15))??null;
  return{tp1,tp2,rr1:tp1?Math.abs(tp1.price-price)/risk:null,rr2:tp2?Math.abs(tp2.price-price)/risk:null};
}

function planOverlays(sweep,entryZone,plan,stage,marketNow){
  const end=Number(marketNow??plan?.marketNow??sweep?.time??Date.now()); const zones=[]; const lines=[]; const markers=[];
  if(sweep){
    lines.push({kind:'r01_liquidity',price:Number(sweep.levelPrice),startTime:Number(sweep.time)-6*TF_MS.M5,endTime:end,label:`R01 ${sweep.level.label}`,dashed:true,color:'#fbbf24',priority:7});
    markers.push({kind:'r01_sweep',time:Number(sweep.time),price:Number(sweep.extreme),label:`R01 ${sweep.direction==='buy'?'SSL':'BSL'} SWEEP`,direction:sweep.direction==='buy'?'bullish':'bearish',priority:7});
  }
  if(entryZone&&['CONFIRMED','ENTRY_READY'].includes(stage)) zones.push({kind:'r01_entry',side:sweep.direction,low:entryZone.low,high:entryZone.high,startTime:entryZone.sourceTime??sweep.time,endTime:end,label:entryZone.label,priority:8});
  const shift=plan?.confirmation?.shift;
  if(shift&&finite(shift.time)&&finite(shift.price)) markers.push({kind:'r01_m1_shift',time:Number(shift.time),price:Number(shift.price),label:`R01 M1 ${shift.type??'SHIFT'}`,direction:sweep.direction==='buy'?'bullish':'bearish',priority:8});
  if(plan?.stop)lines.push({kind:'r01_stop',price:plan.stop,startTime:sweep.time,endTime:end,label:`R01 SL${plan?.stopMeta?.triggerSide?` (${plan.stopMeta.triggerSide})`:''}`,dashed:true,color:'#fb7185',priority:8});
  if(plan?.tp1?.price)lines.push({kind:'r01_tp1',price:plan.tp1.price,startTime:sweep.time,endTime:end,label:`R01 TP1 ${plan.tp1.label}`,dashed:true,color:'#2dd4bf',priority:7});
  if(plan?.tp2?.price)lines.push({kind:'r01_tp2',price:plan.tp2.price,startTime:sweep.time,endTime:end,label:`R01 TP2 ${plan.tp2.label}`,dashed:true,color:'#34d399',priority:7});
  return{zones,lines,markers};
}

export function evaluateR01(snapshot,{trigger='tick',config=R01_CONFIG}={}){
  const m5=snapshot?.bars?.M5??[],m1=snapshot?.bars?.M1??[];
  const quote=snapshot?.quote??{};
  const quoteReady=finite(quote.bid)&&finite(quote.ask)&&Number(quote.ask)>=Number(quote.bid);
  const bid=quoteReady?Number(quote.bid):null,ask=quoteReady?Number(quote.ask):null;
  const spread=finite(quote.spread)?Number(quote.spread):(quoteReady?Number(ask)-Number(bid):null);
  const spreadKnown=finite(spread)&&Number(spread)>=0;
  const dataReady=m5.length>=80&&m1.length>=120&&quoteReady;
  const a5=Math.max(Number(atrNow(m5))||0.01,0.01),a1=Math.max(Number(atrNow(m1))||0.01,0.01);
  const keyLevels=dataReady?buildR01KeyLiquidity(snapshot,{barsM5:m5}):[];
  const probe=dataReady?findR01Probe(m5,keyLevels,{config}):null;
  const probeOutcome=probe?classifyR01ProbeOutcome(m5,probe,{config}):{acceptedBeyond:false,reclaimed:false,consecutiveBeyond:0};
  const latestQualifiedSweep=dataReady?findR01Sweep(m5,keyLevels,{config}):null;
  // One strategy instance follows the most recent liquidity episode. A newer
  // unresolved/accepted probe must not be masked by an older valid sweep.
  const rawSweep=probe&&(!latestQualifiedSweep||Number(probe.time)>Number(latestQualifiedSweep.time))?null:latestQualifiedSweep;
  const sweep=rawSweep?refineR01SweepTime(m1,rawSweep,{config}):null;
  const activeLiquidity=sweep??probe;
  const ageBars=sweep?barsSince(m5,sweep.time):Infinity;
  const auction=sweep?classifyFailedAcceptance(m5,sweep,{config}):{reclaimed:false,acceptedBeyond:false,insideCloses:0,consecutiveBeyond:0};
  const shift=sweep&&!auction.acceptedBeyond?findMicroStructureShift(m1,sweep,{config}):null;
  const momentum=findPostShiftMomentum(m1,sweep,shift);
  const effort=r01EffortResultProxy(m5,sweep,snapshot?.depth);
  const entryZone=sweep&&shift&&momentum.passed?pickEntryZone(m1,sweep,shift,momentum,a1):null;
  // Use the executable side of the market for the retest/entry: BUY at Ask, SELL at Bid.
  const executablePrice=sweep?.direction==='buy'?ask:bid;
  const inEntry=entryZone&&finite(executablePrice)&&executablePrice>=entryZone.low&&executablePrice<=entryZone.high;
  // R01 stop protection must be built on the M5 volatility of the liquidity sweep.
  // The previous implementation preferred the much smaller M1 ATR, which could leave the
  // protection only a few ticks beyond the sweep. On cTrader's default Trade-side trigger,
  // a SELL stop-loss is triggered by ASK, so the displayed BID-chart extreme also needs a
  // spread allowance. The structural ATR buffer itself remains unchanged (0.12 ATR M5).
  const stopAtr=sweep?Math.max(Number(sweep.atrAtSweep)||a5,0.01):a5;
  const structuralStopBuffer=sweep?stopAtr*config.stopBufferAtr:null;
  const sellSpreadBuffer=sweep?.direction==='sell'&&finite(spread)?Math.max(0,Number(spread))*Number(config.sellStopSpreadFactor??1):0;
  const stop=sweep?(sweep.direction==='buy'?Number(sweep.extreme)-structuralStopBuffer:Number(sweep.extreme)+structuralStopBuffer+sellSpreadBuffer):null;
  const entryReference=inEntry?executablePrice:(entryZone?(entryZone.low+entryZone.high)/2:null);
  const targets=entryReference&&stop?targetPlan(snapshot,m5,sweep,entryReference,stop):{tp1:null,tp2:null,rr1:null,rr2:null};
  const bestRr=[targets.rr1,targets.rr2].filter(finite).map(Number).reduce((m,x)=>Math.max(m,x),-Infinity);
  const rrOk=Number.isFinite(bestRr)&&bestRr>=config.minRewardRisk;
  const spreadSafe=spreadKnown&&spread<=a1*config.maxSpreadAtrM1;
  const sweepAdx=sweep?adxAtOrBefore(m5,sweep.time):null;
  const regimeSafe=Boolean(sweep&&finite(sweepAdx)&&Number(sweepAdx)<config.maxAdxM5);
  const marketNow=finite(snapshot?.quote?.timestamp)?Number(snapshot.quote.timestamp):Math.max(Number(m1.at(-1)?.time??0)+TF_MS.M1,Number(m5.at(-1)?.time??0)+TF_MS.M5);
  const sweepWindowSafe=!sweep||inR01NyWindow(sweep.time,config);
  const entryWindowSafe=inR01NyWindow(marketNow,config);
  const sessionSafe=Boolean(sweep&&sweepWindowSafe&&entryWindowSafe);
  const riskDistance=entryReference&&stop?Math.abs(Number(entryReference)-Number(stop)):null;
  const riskAtrM5=finite(riskDistance)&&sweep?Number(riskDistance)/Math.max(Number(sweep.atrAtSweep)||a5,0.01):null;
  const riskGeometrySafe=Boolean(sweep&&entryReference&&finite(riskAtrM5)&&Number(riskAtrM5)>=config.minRiskAtrM5);
  const macroRisk=String(snapshot?.macro?.risk??'normal').toLowerCase();
  const macroSafe=!config.blockMacroRisks.includes(macroRisk);
  const timedOut=Boolean(sweep)&&(marketNow-Number(sweep.time)>config.entryTimeoutMinutes*60_000||ageBars>config.sweepLookbackBars);
  const stopTriggered=Boolean(sweep&&finite(stop)&&((sweep.direction==='buy'&&bid<=Number(stop))||(sweep.direction==='sell'&&ask>=Number(stop))));
  const invalidated=Boolean((sweep&&auction.acceptedBeyond)||(!sweep&&probe&&probeOutcome.acceptedBeyond)||(sweep&&timedOut)||stopTriggered);

  let stage='SEARCHING';
  if(probe) stage='DETECTED';
  if(sweep&&auction.reclaimed&&!auction.acceptedBeyond&&!timedOut) stage='ARMED';
  if(stage==='ARMED'&&shift&&momentum.passed) stage='CONFIRMED';
  if(stage==='CONFIRMED'&&inEntry&&spreadSafe&&macroSafe&&rrOk&&regimeSafe&&sessionSafe&&riskGeometrySafe) stage='ENTRY_READY';
  if(invalidated) stage='INVALIDATED';

  const conditions=[
    condition('data_ready','M1/M5 suffisamment chargés',dataReady,{value:`M1 ${m1.length} / M5 ${m5.length}`}),
    condition('key_liquidity','Test d’une liquidité externe qualifiée',Boolean(activeLiquidity),{value:activeLiquidity?`${activeLiquidity.level.label} @ ${Number(activeLiquidity.levelPrice).toFixed(2)}`:'aucun niveau testé'}),
    condition('sweep_reclaim','Stop-run + clôture/reclaim du niveau',Boolean(sweep&&auction.reclaimed),{value:sweep?`${(Number(sweep.penetrationAtr)||0).toFixed(2)} ATR`:'—'}),
    condition('failed_acceptance','Pas d’acceptation au-delà du niveau',Boolean(sweep&&!auction.acceptedBeyond),{value:sweep?`max ${auction.consecutiveBeyond} clôture(s) au-delà`:'—'}),
    condition('micro_shift','Shift M1 opposé au sweep',Boolean(shift),{value:shift?`${shift.type} ${shift.direction}`:'en attente'}),
    condition('momentum_flip','Displacement ou FVG M1 dans le sens du reversal',Boolean(momentum.passed),{value:momentum.displacement?'displacement':momentum.fvg?'FVG post-shift':'en attente'}),
    condition('regime_adx',`Régime M5 ADX < ${config.maxAdxM5}`,regimeSafe,{value:finite(sweepAdx)?Number(sweepAdx).toFixed(1):'N/A'}),
    condition('ny_window','Fenêtre Gold 08:20–16:00 New York',sessionSafe,{value:sweep?`${String(Math.floor((nyMinutes(sweep.time)??0)/60)).padStart(2,'0')}:${String((nyMinutes(sweep.time)??0)%60).padStart(2,'0')} NY`:'en attente'}),
    condition('risk_geometry',`Distance entrée→SL ≥ ${config.minRiskAtrM5.toFixed(2)} ATR M5`,riskGeometrySafe,{value:finite(riskAtrM5)?`${Number(riskAtrM5).toFixed(2)} ATR`:'en attente',note:sweep?`SL buffer ${Number(structuralStopBuffer??0).toFixed(2)} (${config.stopBufferAtr.toFixed(2)} ATR M5)${sweep.direction==='sell'?` + spread ${Number(sellSpreadBuffer??0).toFixed(2)} ASK`:''}`:null}),
    condition('entry_retest','Retest de la zone d’entrée',Boolean(inEntry),{value:entryZone?`${entryZone.low.toFixed(2)}–${entryZone.high.toFixed(2)}`:'en attente'}),
    condition('broker_quote','BID + ASK cTrader disponibles',quoteReady,{value:quoteReady?`BID ${Number(bid).toFixed(2)} • ASK ${Number(ask).toFixed(2)}`:'INDISPONIBLE'}),
    condition('spread_safe','Spread connu et compatible avec le M1',spreadSafe,{value:spreadKnown?`${Number(spread).toFixed(2)} / max ${(a1*config.maxSpreadAtrM1).toFixed(2)}`:'INCONNU'}),
    condition('macro_safe','Pas de risque macro HIGH/CRITICAL immédiat',macroSafe,{value:macroRisk.toUpperCase()}),
    condition('rr_min',`R:R potentiel ≥ ${config.minRewardRisk.toFixed(1)}`,rrOk,{value:Number.isFinite(bestRr)?bestRr.toFixed(2):'en attente'}),
    condition('effort_result_proxy','Confirmation order-flow/tick-volume disponible',effort.passed,{required:false,value:`${effort.quality}${finite(effort.volumeRatio)?` • vol ×${Number(effort.volumeRatio).toFixed(2)}`:''}`})
  ];

  const requiredConditions=conditions.filter(c=>c.required!==false);
  const requiredPassed=requiredConditions.filter(c=>c.passed).length;
  const readinessPercent=requiredConditions.length?Math.round(requiredPassed/requiredConditions.length*100):0;
  const missingConditions=requiredConditions.filter(c=>!c.passed).map(c=>c.id);

  let status='idle',reason='Recherche d’un sweep qualifié sur liquidité externe.';
  if(stage==='INVALIDATED'){status='rejected';reason=(auction.acceptedBeyond||probeOutcome.acceptedBeyond)?'Le marché a accepté les prix au-delà du niveau sweepé.':'Le setup a expiré ou l’extrême du sweep a été invalidé.';}
  else if(stage==='DETECTED'){status='watching';reason='Liquidité externe traversée : attente du reclaim pour qualifier le sweep/failed auction.';}
  else if(stage==='ARMED'){status='watching';reason='Failed auction armée, attente du shift M1 et du momentum opposé.';}
  else if(stage==='CONFIRMED'){
    status='watching';
    const blockers=[];
    if(!inEntry) blockers.push('retest');
    if(!regimeSafe) blockers.push(`ADX M5 ≥ ${config.maxAdxM5}`);
    if(!sessionSafe) blockers.push('hors fenêtre 08:20–16:00 NY');
    if(!riskGeometrySafe) blockers.push(`stop < ${config.minRiskAtrM5.toFixed(2)} ATR M5`);
    if(!spreadSafe) blockers.push('spread');
    if(!macroSafe) blockers.push('macro');
    if(!rrOk) blockers.push(`R:R < ${config.minRewardRisk.toFixed(1)}`);
    reason=blockers.length?`Reversal confirmé, entrée bloquée/attente : ${blockers.join(', ')}.`:'Reversal confirmé, attente du retest d’entrée.';
  }
  else if(stage==='ENTRY_READY'){status='validated';reason='Toutes les conditions obligatoires calibrées sont validées : entrée R01 prête, sans exécution automatique.';}

  const plan=sweep&&entryZone?{
    direction:sweep.direction,
    stage,
    entryZone:{low:entryZone.low,high:entryZone.high,kind:entryZone.kind},
    entry:entryReference,
    stop,
    tp1:targets.tp1,
    tp2:targets.tp2,
    rr1:targets.rr1,
    rr2:targets.rr2,
    invalidation:`${sweep.direction==='buy'?'Clôture/acceptation sous':'Clôture/acceptation au-dessus de'} ${Number(sweep.levelPrice).toFixed(2)} ou rupture de l’extrême ${Number(sweep.extreme).toFixed(2)}`,
    keyLevel:{...sweep.level,price:sweep.levelPrice},
    sweep:{time:sweep.time,extreme:sweep.extreme,penetrationAtr:sweep.penetrationAtr},
    confirmation:{shift,effortResultProxy:effort},
    calibration:{adxM5:sweepAdx,nyWindowSafe:sessionSafe,riskAtrM5},
    stopMeta:{
      atrBasis:'M5_AT_SWEEP',
      atr:Number(stopAtr),
      structuralBuffer:Number(structuralStopBuffer??0),
      spreadBuffer:Number(sellSpreadBuffer??0),
      triggerSide:sweep.direction==='sell'?'ASK':'BID',
      executableEntrySide:sweep.direction==='buy'?'ASK':'BID'
    },
    marketNow,
    execution:null
  }:null;

  return {
    status,
    stage,
    direction:sweep?.direction??probe?.direction??null,
    conditions,
    overlays:planOverlays(sweep,entryZone,plan,stage,marketNow),
    plan,
    reason,
    readiness:{requiredPassed,totalRequired:requiredConditions.length,percent:readinessPercent,allGreen:readinessPercent===100&&stage==='ENTRY_READY',missing:missingConditions},
    trigger,
    researchContract:{
      core:'qualified liquidity → sweep → reclaim / failed acceptance → M1 structure shift → momentum/displacement → NY-window retest with ADX/risk filters',
      note:'DOM/tick-volume = confirmation broker/proxy, never a standalone trigger.'
    }
  };
}

export const R01_LIQUIDITY_SWEEP_REVERSAL = Object.freeze({
  id:R01_CONFIG.id,
  name:R01_CONFIG.name,
  evaluate:(snapshot,ctx)=>evaluateR01(snapshot,ctx)
});
