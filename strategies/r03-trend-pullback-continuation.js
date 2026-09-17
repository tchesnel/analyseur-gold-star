import { atrSeries, emaSeries } from '../engine/visual-analysis.js';
import { adxDmiSeries } from '../engine/advanced-context.js';

// R03 is deliberately tagged RESEARCH until the canonical 375,985-bar M5 dataset
// is replayed. The sequencing is production-grade; numeric gates are candidate
// values and must not be presented as historically calibrated yet.
export const R03_CONFIG = Object.freeze({
  id:'R03',
  name:'Trend Pullback Continuation',
  allowDirections:Object.freeze(['buy','sell']),
  emaFast:20,
  emaSlow:50,
  adxPeriod:14,
  minContextAdxM15:18,
  impulseLookbackBarsM5:12,
  minImpulseBarsM5:3,
  minImpulseMoveAtrM5:1.50,
  minPullbackBarsM5:2,
  maxPullbackBarsM5:12,
  minRetraceFraction:0.18,
  maxRetraceFraction:0.68,
  maxPullbackVolumeRatio:0.88,
  maxPullbackEnergyRatio:0.90,
  maxAdverseVolumeRatio:1.10,
  maxAdverseEnergyRatio:1.10,
  zoneToleranceAtrM5:0.18,
  fvgMinAtrM5:0.04,
  m1ConfirmLookback:5,
  m1ConfirmMaxMinutes:20,
  entryFreshMinutes:5,
  minM1DisplacementAtr:0.85,
  minM1VolumeRatio:1.05,
  maxEntryExtensionAtrM5:0.90,
  stopBufferAtrM5:0.15,
  minRiskAtrM5:0.50,
  maxRiskAtrM5:2.00,
  minTp1RewardRisk:1.00,
  tp2RewardRisk:2.00,
  maxSpreadAtrM1:0.30,
  blockMacroRisks:Object.freeze(['high','critical']),
  searchLookbackBarsM5:36
});

const TF_MS=Object.freeze({M1:60_000,M5:300_000,M15:900_000,H1:3_600_000,H4:14_400_000});
const finite=n=>n!==null&&n!==undefined&&n!==''&&Number.isFinite(Number(n));
const condition=(id,label,passed,{required=true,value=null,note=null,status=null}={})=>({id,label,passed:Boolean(passed),required,value,note,status});

function completedBars(bars,tfMs,atTime){
  const t=Number(atTime??Date.now());
  return (bars??[]).filter(b=>Number(b.time)+tfMs<=t);
}
function marketNowOf(snapshot){
  const q=snapshot?.quote??{};
  if(finite(q.timestamp))return Number(q.timestamp);
  let out=0;
  for(const [tf,ms] of Object.entries(TF_MS)){
    const b=snapshot?.bars?.[tf]?.at?.(-1);
    if(b)out=Math.max(out,Number(b.time)+ms);
  }
  return out||Date.now();
}
function median(values){
  const xs=(values??[]).filter(finite).map(Number).sort((a,b)=>a-b);
  if(!xs.length)return null;const m=Math.floor(xs.length/2);return xs.length%2?xs[m]:(xs[m-1]+xs[m])/2;
}
function avg(values){const xs=(values??[]).filter(finite).map(Number);return xs.length?xs.reduce((a,b)=>a+b,0)/xs.length:null;}
function volumeHealthOf(bars,lookback){
  const xs=(bars??[]).slice(-lookback);
  if(xs.length<Math.min(lookback,12))return{usable:false,total:xs.length,valid:0,positive:0,median:null};
  const vals=xs.map(b=>b?.volume).filter(finite).map(Number);
  const positive=vals.filter(v=>v>0);
  const minValid=Math.ceil(xs.length*0.80),minPositive=Math.ceil(xs.length*0.50),med=median(positive);
  return{usable:vals.length>=minValid&&positive.length>=minPositive&&finite(med)&&Number(med)>0,total:xs.length,valid:vals.length,positive:positive.length,median:med};
}
export function r03VolumeHealth(snapshot,atTime=marketNowOf(snapshot)){
  const m1=completedBars(snapshot?.bars?.M1??[],TF_MS.M1,atTime),m5=completedBars(snapshot?.bars?.M5??[],TF_MS.M5,atTime);
  const M1=volumeHealthOf(m1,30),M5=volumeHealthOf(m5,24);
  return{usable:M1.usable&&M5.usable,M1,M5};
}
function trAt(bar,prevClose){return Math.max(Number(bar.high)-Number(bar.low),Math.abs(Number(bar.high)-Number(prevClose)),Math.abs(Number(bar.low)-Number(prevClose)));}
function atrAt(bars,time,period=14){let out=null;for(const x of atrSeries(bars,period)){if(Number(x.time)<=Number(time))out=Number(x.value);else break;}return out;}
function emaAt(bars,time,period){let out=null;for(const x of emaSeries(bars,period)){if(Number(x.time)<=Number(time))out=Number(x.value);else break;}return out;}
function volumePerBar(bars){return avg((bars??[]).map(b=>finite(b?.volume)?Number(b.volume):null));}
function energyPerBar(bars,previousClose=null){
  if(!bars?.length)return null;let prev=finite(previousClose)?Number(previousClose):Number(bars[0].open);const trs=[];
  for(const b of bars){trs.push(trAt(b,prev));prev=Number(b.close);}return avg(trs);
}
function anchoredVwap(bars){
  let pv=0,v=0;for(const b of bars??[]){if(!finite(b?.volume)||Number(b.volume)<=0)continue;const vol=Number(b.volume),tp=(Number(b.high)+Number(b.low)+Number(b.close))/3;pv+=tp*vol;v+=vol;}return v>0?pv/v:null;
}
function latestAdx(bars,period){return adxDmiSeries(bars,period).at(-1)?.adx??null;}

export function r03TrendBias(snapshot,atTime,{config=R03_CONFIG}={}){
  const required=[['H4',55],['H1',55],['M15',60]];
  const frames={};
  for(const [tf,min] of required){
    const bars=completedBars(snapshot?.bars?.[tf]??[],TF_MS[tf],atTime);
    if(bars.length<min)return{direction:null,frames:{},adxM15:null,ready:false};
    const close=Number(bars.at(-1).close),e20=emaSeries(bars,config.emaFast).at(-1)?.value,e50=emaSeries(bars,config.emaSlow).at(-1)?.value;
    const direction=finite(e20)&&finite(e50)?(close>Number(e20)&&Number(e20)>Number(e50)?'buy':close<Number(e20)&&Number(e20)<Number(e50)?'sell':null):null;
    frames[tf]={close,ema20:e20,ema50:e50,direction};
  }
  const dirs=Object.values(frames).map(x=>x.direction);const aligned=dirs.every(Boolean)&&new Set(dirs).size===1;
  const m15=completedBars(snapshot?.bars?.M15??[],TF_MS.M15,atTime),adxM15=latestAdx(m15,config.adxPeriod);
  return{direction:aligned?dirs[0]:null,frames,adxM15,ready:aligned&&finite(adxM15)&&Number(adxM15)>=config.minContextAdxM15};
}

function impulseFvg(impulse,direction,atr,config){
  // Prefer the freshest imbalance created nearest the impulse extreme.
  for(let i=impulse.length-1;i>=2;i--){
    const a=impulse[i-2],c=impulse[i];
    if(direction==='buy'){
      const low=Number(a.high),high=Number(c.low);if(high-low>=config.fvgMinAtrM5*atr)return{kind:'FVG',low,high,time:Number(c.time)};
    }else{
      const low=Number(c.high),high=Number(a.low);if(high-low>=config.fvgMinAtrM5*atr)return{kind:'FVG',low,high,time:Number(c.time)};
    }
  }
  return null;
}
function impulseOrderBlock(impulse,direction){
  for(let i=impulse.length-2;i>=0;i--){const b=impulse[i];const bearish=Number(b.close)<Number(b.open),bullish=Number(b.close)>Number(b.open);if((direction==='buy'&&bearish)||(direction==='sell'&&bullish))return{kind:'OB',low:Number(b.low),high:Number(b.high),time:Number(b.time)};}return null;
}
function breakoutZone(preImpulse,impulse,direction,atr,config){
  if(preImpulse.length<4)return null;
  const level=direction==='buy'?Math.max(...preImpulse.map(b=>Number(b.high))):Math.min(...preImpulse.map(b=>Number(b.low)));
  const extreme=direction==='buy'?Math.max(...impulse.map(b=>Number(b.high))):Math.min(...impulse.map(b=>Number(b.low)));
  const broke=direction==='buy'?extreme>level+0.10*atr:extreme<level-0.10*atr;
  return broke?{kind:'BREAKOUT',low:level-config.zoneToleranceAtrM5*atr,high:level+config.zoneToleranceAtrM5*atr,price:level}:null;
}
function zoneTouched(zone,pullback){return Boolean(zone&&pullback?.some(b=>Number(b.low)<=Number(zone.high)&&Number(b.high)>=Number(zone.low)));}

export function assessR03Pullback(snapshot,{config=R03_CONFIG}={}){
  const marketNow=marketNowOf(snapshot),m5=completedBars(snapshot?.bars?.M5??[],TF_MS.M5,marketNow);
  if(m5.length<120||!r03VolumeHealth(snapshot,marketNow).usable)return{setup:null,invalidated:null,latest:null,candidates:[]};
  const bias=r03TrendBias(snapshot,marketNow,{config});if(!bias.ready||!config.allowDirections.includes(bias.direction))return{setup:null,invalidated:null,latest:null,candidates:[]};
  const direction=bias.direction,start=Math.max(config.impulseLookbackBarsM5+3,m5.length-config.searchLookbackBarsM5);
  const candidates=[];
  for(let pivotIndex=m5.length-config.minPullbackBarsM5-1;pivotIndex>=start;pivotIndex--){
    const pivotBar=m5[pivotIndex],prevPivot=m5[pivotIndex-1],nextPivot=m5[pivotIndex+1];
    if(!prevPivot||!nextPivot)continue;
    const isPivot=direction==='buy'
      ? Number(pivotBar.high)>=Number(prevPivot.high)&&Number(pivotBar.high)>Number(nextPivot.high)
      : Number(pivotBar.low)<=Number(prevPivot.low)&&Number(pivotBar.low)<Number(nextPivot.low);
    if(!isPivot)continue;
    const pullback=m5.slice(pivotIndex+1);
    if(pullback.length<config.minPullbackBarsM5||pullback.length>config.maxPullbackBarsM5)continue;
    const lookStart=Math.max(1,pivotIndex-config.impulseLookbackBarsM5+1),window=m5.slice(lookStart,pivotIndex+1);
    // Use the most recent genuine swing extreme before the impulse. A global minimum/maximum
    // tends to absorb quiet pre-impulse bars and understates the impulse energy.
    let impulseStart=null;
    for(let j=pivotIndex-config.minImpulseBarsM5+1;j>=lookStart+1;j--){
      const b=m5[j],prev=m5[j-1],next=m5[j+1];if(!next)continue;
      const localExtreme=direction==='buy'
        ? Number(b.low)<=Number(prev.low)&&Number(b.low)<Number(next.low)
        : Number(b.high)>=Number(prev.high)&&Number(b.high)>Number(next.high);
      if(localExtreme){impulseStart=j;break;}
    }
    if(impulseStart===null){
      let localStartRel=0;
      if(direction==='buy')for(let k=1;k<window.length;k++){if(Number(window[k].low)<Number(window[localStartRel].low))localStartRel=k;}
      else for(let k=1;k<window.length;k++){if(Number(window[k].high)>Number(window[localStartRel].high))localStartRel=k;}
      impulseStart=lookStart+localStartRel;
    }
    if(pivotIndex-impulseStart+1<config.minImpulseBarsM5)continue;
    const impulse=m5.slice(impulseStart,pivotIndex+1),preImpulse=m5.slice(Math.max(0,impulseStart-8),impulseStart);
    const pivot=m5[pivotIndex],atr=Math.max(atrAt(m5,pivot.time,14)??0.01,0.01);
    const startPrice=direction==='buy'?Number(m5[impulseStart].low):Number(m5[impulseStart].high),pivotPrice=direction==='buy'?Number(pivot.high):Number(pivot.low),impulseMove=Math.abs(pivotPrice-startPrice);
    if(impulseMove<config.minImpulseMoveAtrM5*atr)continue;
    const pullExtreme=direction==='buy'?Math.min(...pullback.map(b=>Number(b.low))):Math.max(...pullback.map(b=>Number(b.high)));
    const retrace=direction==='buy'?(pivotPrice-pullExtreme)/impulseMove:(pullExtreme-pivotPrice)/impulseMove;
    const structureBroken=direction==='buy'?pullExtreme<=startPrice:pullExtreme>=startPrice;

    const iv=volumePerBar(impulse),pv=volumePerBar(pullback),ie=energyPerBar(impulse,m5[impulseStart-1]?.close),pe=energyPerBar(pullback,pivot.close);
    const volumeRatio=finite(iv)&&Number(iv)>0?Number(pv)/Number(iv):null,energyRatio=finite(ie)&&Number(ie)>0?Number(pe)/Number(ie):null;
    if(!finite(volumeRatio)||!finite(energyRatio))continue;

    const fvg=impulseFvg(impulse,direction,atr,config),ob=impulseOrderBlock(impulse,direction),breakout=breakoutZone(preImpulse,impulse,direction,atr,config);
    const avwap=anchoredVwap(impulse),avwapZone=finite(avwap)?{kind:'AVWAP',low:Number(avwap)-config.zoneToleranceAtrM5*atr,high:Number(avwap)+config.zoneToleranceAtrM5*atr,price:Number(avwap)}:null;
    const zones=[fvg,ob,breakout,avwapZone].filter(Boolean),touched=zones.filter(z=>zoneTouched(z,pullback));
    const touchedBars=touched.length?pullback.filter(b=>touched.some(z=>Number(b.low)<=Number(z.high)&&Number(b.high)>=Number(z.low))):[];
    const zoneTouchTime=touchedBars.length?Math.min(...touchedBars.map(b=>Number(b.time))):null;

    const weakPullback=volumeRatio<=config.maxPullbackVolumeRatio&&energyRatio<=config.maxPullbackEnergyRatio;
    const adverseImpulse=(volumeRatio>=config.maxAdverseVolumeRatio&&energyRatio>=config.maxAdverseEnergyRatio)||structureBroken;
    let invalidReason=null;
    // A too-shallow pullback is simply not mature yet. A pullback that reaches a useful
    // zone and then becomes too deep/energetic is a genuine thesis invalidation and must
    // not disappear back to DETECTED, otherwise a 15-minute held signal can remain visible
    // after the market has already disproved it.
    if(structureBroken)invalidReason='STRUCTURE_BROKEN';
    else if(retrace>config.maxRetraceFraction&&touched.length)invalidReason='RETRACE_TOO_DEEP';
    else if(touched.length&&adverseImpulse)invalidReason='ADVERSE_IMPULSE';
    else if(touched.length&&retrace>=config.minRetraceFraction&&!weakPullback)invalidReason='PULLBACK_NOT_WEAK';

    if(retrace<config.minRetraceFraction)continue;
    if(!touched.length&&!structureBroken)continue;
    const eventTime=finite(zoneTouchTime)?Number(zoneTouchTime):Number(pullback.at(-1)?.time??pivot.time);
    const candidate={direction,bias,marketNow,pivotIndex,impulseStart,impulse,pullback,pivot,pivotPrice,startPrice,pullbackExtreme:pullExtreme,retrace,atrM5:atr,volumeRatio,energyRatio,zones,touchedZones:touched,zoneTouchTime:eventTime,impulseMove,structureBroken,adverseImpulse,invalidReason,valid:!invalidReason&&retrace<=config.maxRetraceFraction&&weakPullback&&!adverseImpulse&&touched.length>0};
    if(candidate.valid||candidate.invalidReason)candidates.push(candidate);
  }
  const latest=candidates.sort((a,b)=>Number(b.zoneTouchTime)-Number(a.zoneTouchTime))[0]??null;
  return{setup:latest?.valid?latest:null,invalidated:latest&&!latest.valid?latest:null,latest,candidates};
}

export function findR03Pullback(snapshot,{config=R03_CONFIG}={}){
  return assessR03Pullback(snapshot,{config}).setup;
}

export function findR03M1Confirmation(m1Input,setup,{config=R03_CONFIG}={}){
  if(!setup||!m1Input?.length)return null;
  const m1=completedBars(m1Input,TF_MS.M1,setup.marketNow),startTime=Number(setup.zoneTouchTime),endTime=startTime+config.m1ConfirmMaxMinutes*60_000;
  const startIndex=m1.findIndex(b=>Number(b.time)>=startTime);if(startIndex<0)return null;
  const atrMap=new Map(atrSeries(m1,14).map(x=>[Number(x.time),Number(x.value)]));
  for(let i=Math.max(startIndex,config.m1ConfirmLookback);i<m1.length;i++){
    const b=m1[i];if(Number(b.time)>endTime)break;
    const prev=m1.slice(i-config.m1ConfirmLookback,i),atr=Math.max(Number(atrMap.get(Number(b.time)))||0.01,0.01),prevClose=Number(m1[i-1].close),tr=trAt(b,prevClose),displacement=tr/atr;
    const broken=setup.direction==='buy'?Number(b.close)>Math.max(...prev.map(x=>Number(x.high))):Number(b.close)<Math.min(...prev.map(x=>Number(x.low)));
    const pullbackVolumes=m1.slice(Math.max(startIndex,i-10),i).map(x=>x?.volume).filter(finite).map(Number).filter(v=>v>0),baseVol=median(pullbackVolumes),signalVol=finite(b?.volume)?Number(b.volume):null,volumeRatio=finite(baseVol)&&Number(baseVol)>0&&finite(signalVol)&&Number(signalVol)>0?Number(signalVol)/Number(baseVol):null;
    const directional=setup.direction==='buy'?Number(b.close)>Number(b.open):Number(b.close)<Number(b.open);
    if(broken&&directional&&displacement>=config.minM1DisplacementAtr&&finite(volumeRatio)&&Number(volumeRatio)>=config.minM1VolumeRatio)return{time:Number(b.time),price:Number(b.close),bar:b,displacement,volumeRatio,atrM1:atr,type:`M1 ${setup.direction==='buy'?'BOS↑':'BOS↓'} + displacement`};
  }
  return null;
}

export function r03StructuralStop(setup,{config=R03_CONFIG,spread=null}={}){
  if(!setup||!finite(setup.atrM5)||!finite(setup.pullbackExtreme))return null;
  const a=Number(setup.atrM5),buffer=config.stopBufferAtrM5*a,spreadN=finite(spread)?Math.max(Number(spread),0):0;
  return setup.direction==='buy'?Number(setup.pullbackExtreme)-buffer:Number(setup.pullbackExtreme)+buffer+spreadN;
}

export function buildR03Plan(snapshot,setup,confirmation,{config=R03_CONFIG,entryPrice=null,spread=null}={}){
  if(!setup||!confirmation||!finite(entryPrice))return null;
  const entry=Number(entryPrice),spreadN=finite(spread)?Math.max(Number(spread),0):0,a=Number(setup.atrM5),buffer=config.stopBufferAtrM5*a;
  const stop=r03StructuralStop(setup,{config,spread});
  if(!finite(stop))return null;
  const risk=Math.abs(entry-stop),riskAtr=risk/a,extension=Math.abs(entry-Number(confirmation.price))/a;
  if(risk<=0||riskAtr<config.minRiskAtrM5||riskAtr>config.maxRiskAtrM5||extension>config.maxEntryExtensionAtrM5)return null;
  const structuralPrice=Number(setup.pivotPrice),structuralR=setup.direction==='buy'?(structuralPrice-entry)/risk:(entry-structuralPrice)/risk;
  if(!finite(structuralR)||structuralR<config.minTp1RewardRisk)return null;
  const fixedContinuationPrice=setup.direction==='buy'?entry+config.tp2RewardRisk*risk:entry-config.tp2RewardRisk*risk;
  // Keep target chronology coherent. The prior trend extreme is structurally meaningful,
  // but it can occasionally sit farther away than the fixed continuation objective.
  // In that case 2R becomes TP1 and the structural extreme becomes TP2 rather than
  // displaying/executing TP2 before TP1.
  const structuralFirst=structuralR<=config.tp2RewardRisk;
  const tp1=structuralFirst
    ? {price:structuralPrice,rr:structuralR,type:'PRIOR_TREND_EXTREME'}
    : {price:fixedContinuationPrice,rr:config.tp2RewardRisk,type:'FIXED_R_CONTINUATION'};
  const tp2=structuralFirst
    ? {price:fixedContinuationPrice,rr:config.tp2RewardRisk,type:'FIXED_R_CONTINUATION'}
    : {price:structuralPrice,rr:structuralR,type:'PRIOR_TREND_EXTREME'};
  return{direction:setup.direction,entry,signalEntry:Number(confirmation.price),stop,risk,riskAtr,entryExtensionAtr:extension,tp1,tp2,rr1:tp1.rr,rr2:tp2.rr,structuralTarget:{price:structuralPrice,rr:structuralR},fixedContinuationTarget:{price:fixedContinuationPrice,rr:config.tp2RewardRisk},stopMeta:{triggerSide:setup.direction==='buy'?'BID':'ASK',atrTimeframe:'M5',structureExtreme:Number(setup.pullbackExtreme),structureBuffer:buffer,spreadBuffer:setup.direction==='sell'?spreadN:0},execution:null};
}

function overlays(setup,confirmation,plan,marketNow){
  const zones=[],lines=[],markers=[];if(!setup)return{zones,lines,markers};const end=Number(marketNow??Date.now());
  for(const z of setup.touchedZones??[])zones.push({kind:`r03_${String(z.kind).toLowerCase()}`,side:setup.direction,low:Number(z.low),high:Number(z.high),startTime:Number(setup.impulse[0].time),endTime:end,label:`R03 ${z.kind}`,priority:7});
  markers.push({kind:'r03_impulse',time:Number(setup.pivot.time),price:Number(setup.pivotPrice),label:`R03 IMPULSE ${setup.direction==='buy'?'↑':'↓'}`,direction:setup.direction==='buy'?'bullish':'bearish',priority:7});
  const pullbackInvalid=Boolean(setup.invalidReason);
  markers.push({kind:'r03_pullback',time:Number(setup.zoneTouchTime),price:Number(setup.pullbackExtreme),label:pullbackInvalid?`R03 PULLBACK INVALIDÉ · ${setup.invalidReason}`:'R03 PULLBACK FAIBLE',direction:pullbackInvalid?(setup.direction==='buy'?'bearish':'bullish'):(setup.direction==='buy'?'bullish':'bearish'),priority:8});
  if(confirmation)markers.push({kind:'r03_confirm',time:Number(confirmation.time),price:Number(confirmation.price),label:`R03 ${confirmation.type}`,direction:setup.direction==='buy'?'bullish':'bearish',priority:9});
  if(plan){
    lines.push({kind:'r03_entry',price:plan.entry,startTime:Number(confirmation.time),endTime:end,label:'R03 ENTRY',color:'#f8fafc',priority:9});
    lines.push({kind:'r03_stop',price:plan.stop,startTime:Number(confirmation.time),endTime:end,label:'R03 SL',dashed:true,color:'#fb7185',priority:9});
    lines.push({kind:'r03_tp1',price:plan.tp1.price,startTime:Number(confirmation.time),endTime:end,label:`R03 TP1 ${plan.rr1.toFixed(2)}R`,dashed:true,color:'#22c55e',priority:8});
    lines.push({kind:'r03_tp2',price:plan.tp2.price,startTime:Number(confirmation.time),endTime:end,label:`R03 TP2 ${plan.rr2.toFixed(2)}R`,dashed:true,color:'#34d399',priority:8});
  }
  return{zones,lines,markers};
}

export function evaluateR03(snapshot,{trigger='tick',config=R03_CONFIG}={}){
  const marketNow=marketNowOf(snapshot),m1=completedBars(snapshot?.bars?.M1??[],TF_MS.M1,marketNow),m5=completedBars(snapshot?.bars?.M5??[],TF_MS.M5,marketNow),q=snapshot?.quote??{};
  const quoteReady=finite(q.bid)&&finite(q.ask)&&Number(q.ask)>=Number(q.bid),bid=quoteReady?Number(q.bid):null,ask=quoteReady?Number(q.ask):null;
  const spread=finite(q.spread)?Number(q.spread):(quoteReady?ask-bid:null),spreadKnown=finite(spread)&&Number(spread)>=0;
  const bias=r03TrendBias(snapshot,marketNow,{config}),dataReady=Boolean(m1.length>=120&&m5.length>=120&&bias.frames?.H4&&bias.frames?.H1&&bias.frames?.M15);
  const volumeHealth=r03VolumeHealth(snapshot,marketNow),volumeReady=volumeHealth.usable;
  const pullbackAssessment=dataReady&&volumeReady?assessR03Pullback(snapshot,{config}):{setup:null,invalidated:null,latest:null,candidates:[]};
  const setup=pullbackAssessment.setup,invalidPullback=pullbackAssessment.invalidated,confirmation=setup?findR03M1Confirmation(snapshot?.bars?.M1??[],setup,{config}):null;
  const confirmationFresh=Boolean(confirmation&&marketNow<=Number(confirmation.time)+config.entryFreshMinutes*60_000);
  const a1=Math.max(atrSeries(m1,14).at(-1)?.value??0.01,0.01),spreadSafe=spreadKnown&&Number(spread)<=a1*config.maxSpreadAtrM1;
  const macroRisk=String(snapshot?.macro?.risk??'normal').toLowerCase(),macroSafe=!config.blockMacroRisks.includes(macroRisk);
  const executableEntry=setup?.direction==='buy'?ask:setup?.direction==='sell'?bid:null,plan=confirmation&&quoteReady?buildR03Plan(snapshot,setup,confirmation,{config,entryPrice:executableEntry,spread}):null;
  const riskOk=Boolean(plan),setupExpired=Boolean(setup)&&marketNow>Number(setup.zoneTouchTime)+config.m1ConfirmMaxMinutes*60_000;
  const triggerStale=Boolean(confirmation&&!confirmationFresh);
  const structureInvalid=Boolean((setup&&setup.structureBroken)||(invalidPullback&&invalidPullback.structureBroken)),structuralStop=r03StructuralStop(setup,{config,spread});
  const stopTriggered=Boolean(setup&&finite(structuralStop)&&((setup.direction==='buy'&&finite(bid)&&bid<=Number(structuralStop))||(setup.direction==='sell'&&finite(ask)&&ask>=Number(structuralStop))));
  const pullbackInvalidated=Boolean(invalidPullback),invalidated=Boolean(pullbackInvalidated||structureInvalid||stopTriggered);
  const timedOut=Boolean(!invalidated&&((setupExpired&&!confirmation)||triggerStale));
  let stage='SEARCHING';if(bias.ready)stage='DETECTED';if(setup)stage='ARMED';if(confirmation&&!invalidated&&!timedOut)stage='CONFIRMED';if(confirmationFresh&&!invalidated&&!timedOut&&quoteReady&&spreadSafe&&macroSafe&&riskOk)stage='ENTRY_READY';if(timedOut)stage='EXPIRED';if(invalidated)stage='INVALIDATED';
  const conditions=[
    condition('data_ready','M1/M5/M15/H1/H4 suffisamment chargés',dataReady,{value:`M1 ${m1.length} • M5 ${m5.length}`}),
    condition('volume_feed','Flux volume M1/M5 exploitable (fail-closed)',volumeReady,{value:volumeReady?`M1 ${volumeHealth.M1.positive}/${volumeHealth.M1.total} • M5 ${volumeHealth.M5.positive}/${volumeHealth.M5.total}`:'VOLUME_FEED_MISSING',note:'Un volume absent ou majoritairement nul bloque R03 au lieu de devenir silencieusement 0.'}),
    condition('htf_trend','H4/H1/M15 alignés dans une structure directionnelle',Boolean(bias.ready),{value:bias.direction?`${bias.direction.toUpperCase()} • ADX M15 ${finite(bias.adxM15)?Number(bias.adxM15).toFixed(1):'—'}`:'en attente'}),
    condition('impulse','Impulsion M5 avec tendance ≥ 1,50 ATR',Boolean(setup||invalidPullback),{value:(setup||invalidPullback)?`${((setup||invalidPullback).impulseMove/(setup||invalidPullback).atrM5).toFixed(2)} ATR`:'en attente'}),
    condition('pullback_weak','Pullback contre-tendance moins volumineux et moins énergétique',Boolean((setup||invalidPullback)&&((setup||invalidPullback).volumeRatio<=config.maxPullbackVolumeRatio)&&((setup||invalidPullback).energyRatio<=config.maxPullbackEnergyRatio)),{value:(setup||invalidPullback)?`volume ×${(setup||invalidPullback).volumeRatio.toFixed(2)} • énergie ×${(setup||invalidPullback).energyRatio.toFixed(2)}`:'en attente',note:invalidPullback?.invalidReason==='PULLBACK_NOT_WEAK'?invalidPullback.invalidReason:null}),
    condition('pullback_depth',`Retracement ${Math.round(config.minRetraceFraction*100)}–${Math.round(config.maxRetraceFraction*100)} % de l’impulsion`,Boolean((setup||invalidPullback)&&((setup||invalidPullback).retrace>=config.minRetraceFraction)&&((setup||invalidPullback).retrace<=config.maxRetraceFraction)),{value:(setup||invalidPullback)?`${((setup||invalidPullback).retrace*100).toFixed(1)} %`:'en attente',note:invalidPullback?.invalidReason==='RETRACE_TOO_DEEP'?invalidPullback.invalidReason:null}),
    condition('useful_zone','Retour dans une zone utile AVWAP/FVG/OB/ancienne cassure',Boolean(setup?.touchedZones?.length||invalidPullback?.touchedZones?.length),{value:(setup||invalidPullback)?.touchedZones?.map(z=>z.kind).join(' + ')??'en attente'}),
    condition('structure_intact','Structure de tendance non cassée par le pullback',Boolean((setup||invalidPullback)&&!(setup||invalidPullback).structureBroken&&!(setup||invalidPullback).adverseImpulse),{value:(setup||invalidPullback)?(((setup||invalidPullback).structureBroken||(setup||invalidPullback).adverseImpulse)?(invalidPullback?.invalidReason??'INVALIDÉ'):'INTACTE'):'en attente'}),
    condition('m1_resume','Micro-BOS/MSS M1 + displacement + retour de volume dans le sens tendance',Boolean(confirmation),{value:confirmation?`${confirmation.type} • disp ×${confirmation.displacement.toFixed(2)} • vol ×${confirmation.volumeRatio.toFixed(2)}`:'en attente'}),
    condition('entry_fresh',`Trigger M1 frais ≤ ${config.entryFreshMinutes} min`,confirmationFresh,{value:confirmation?`${Math.max(0,(marketNow-Number(confirmation.time))/60_000).toFixed(1)} min`:'en attente'}),
    condition('broker_quote','BID + ASK cTrader disponibles',quoteReady,{value:quoteReady?`BID ${bid.toFixed(2)} • ASK ${ask.toFixed(2)}`:'INDISPONIBLE'}),
    condition('risk_geometry',`SL structurel ${config.minRiskAtrM5.toFixed(2)}–${config.maxRiskAtrM5.toFixed(2)} ATR + entrée non étendue`,riskOk,{value:plan?`${plan.riskAtr.toFixed(2)} ATR • ext ${plan.entryExtensionAtr.toFixed(2)} ATR`:'en attente'}),
    condition('spread_safe','Spread connu et compatible avec M1',spreadSafe,{value:spreadKnown?`${Number(spread).toFixed(2)} / max ${(a1*config.maxSpreadAtrM1).toFixed(2)}`:'INCONNU'}),
    condition('macro_safe','Pas de risque macro HIGH/CRITICAL immédiat',macroSafe,{value:macroRisk.toUpperCase()}),
    condition('dom_bonus','DOM / absorption cTrader favorable',false,{required:false,value:'bonus — non requis',note:'Level II broker uniquement; ne déclenche jamais R03 seul.'})
  ];
  const required=conditions.filter(c=>c.required!==false),requiredPassed=required.filter(c=>c.passed).length,percent=required.length?Math.round(requiredPassed/required.length*100):0;
  const tradeReady=stage==='ENTRY_READY'&&percent===100;
  let status='idle',reason='Recherche d’une tendance H4/H1/M15 propre puis d’une impulsion M5 qualifiée.';
  if(dataReady&&!volumeReady){status='rejected';reason='R03 bloquée : VOLUME_FEED_MISSING sur M1/M5. Aucun setup n’est inféré depuis des zéros artificiels.';}
  else if(stage==='DETECTED'){status='watching';reason=`Tendance ${bias.direction?.toUpperCase()??''} détectée : attente d’un pullback faible vers une zone utile.`;}
  else if(stage==='ARMED'){status='watching';reason=`Pullback ${setup.direction.toUpperCase()} qualifié : volume/énergie adverses faibles, zone utile touchée. Attente du micro-BOS/MSS M1.`;}
  else if(stage==='CONFIRMED'){status='watching';const blockers=[];if(!plan)blockers.push('géométrie entrée/SL/TP1');if(!spreadSafe)blockers.push('spread');if(!macroSafe)blockers.push('macro');reason=blockers.length?`Reprise ${setup.direction.toUpperCase()} confirmée mais entrée bloquée : ${blockers.join(', ')}.`:'Reprise confirmée : préparation du prix exécutable.';}
  else if(stage==='ENTRY_READY'){status='watching';reason=`Trend Pullback ${setup.direction.toUpperCase()} mécaniquement prêt en SHADOW : reprise M1 + plan broker exécutable. Promotion live uniquement après replay historique R03.`;}
  else if(stage==='EXPIRED'){status='rejected';reason=triggerStale?'R03 expirée : le trigger M1 a dépassé sa fenêtre de fraîcheur. Attendre un nouveau cycle pullback → reprise.':'R03 expirée : aucune reprise M1 valide dans la fenêtre de 20 minutes après le retour en zone.';}
  else if(stage==='INVALIDATED'){status='rejected';const why=invalidPullback?.invalidReason;const detail=why==='STRUCTURE_BROKEN'?'le pullback a cassé l’origine structurelle de l’impulsion':why==='RETRACE_TOO_DEEP'?'le retracement a dépassé la profondeur maximale après retour en zone':why==='ADVERSE_IMPULSE'?'la jambe adverse est devenue une impulsion':why==='PULLBACK_NOT_WEAK'?'le pullback n’est plus faible en volume/énergie':stopTriggered?'le stop structurel broker-side a été atteint':'la structure adverse a invalidé le scénario';reason=`R03 invalidée : ${detail}.`;}
  const displaySetup=setup??invalidPullback;
  return{status,stage,direction:displaySetup?.direction??bias.direction??null,conditions,overlays:overlays(displaySetup,confirmation,plan,marketNow),plan:plan?{...plan,stage,setup:{zoneTouchTime:setup.zoneTouchTime,retrace:setup.retrace,volumeRatio:setup.volumeRatio,energyRatio:setup.energyRatio,zones:setup.touchedZones.map(z=>z.kind)},confirmation,execution:null}:null,invalidation:invalidPullback?{reason:invalidPullback.invalidReason,time:invalidPullback.zoneTouchTime,retrace:invalidPullback.retrace,volumeRatio:invalidPullback.volumeRatio,energyRatio:invalidPullback.energyRatio}:null,reason,readiness:{requiredPassed,totalRequired:required.length,percent,allGreen:tradeReady,missing:required.filter(c=>!c.passed).map(c=>c.id)},trigger,researchContract:{status:'RESEARCH_SHADOW_GOLD_REPLAY_REQUIRED',core:'H4/H1/M15 directional alignment → qualified M5 impulse → lower-volume/lower-energy countertrend pullback → AVWAP/FVG/OB/breakout zone → M1 BOS/MSS + displacement + renewed volume → broker-executable entry',calibration:'Numeric gates remain research candidates. External ES M1 falsification did not validate this generic parameterization; canonical XAUUSD replay is still required before promotion.',execution:'READ_ONLY',note:'DOM/Level II remains bonus only. Structural stop is never widened to pass risk filters; SELL stop accounts for ASK trigger through spread buffer.'}};
}

export const R03_TREND_PULLBACK_CONTINUATION=Object.freeze({id:R03_CONFIG.id,name:R03_CONFIG.name,mode:'shadow',promotionGate:'XAUUSD_REPLAY_REQUIRED',evaluate:(snapshot,ctx)=>evaluateR03(snapshot,ctx)});
