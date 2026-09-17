import { atrSeries, emaSeries } from '../engine/visual-analysis.js';
import { adxDmiSeries } from '../engine/advanced-context.js';

export const R02_CONFIG = Object.freeze({
  id:'R02',
  name:'Balance Breakout / Acceptance',
  balanceTimeframe:'H1',
  triggerTimeframe:'M1',
  allowDirections:Object.freeze(['buy']),
  balanceHours:60,
  minBalanceWidthAtrH1:4.0,
  maxBalanceWidthAtrH1:12.0,
  maxBalanceEfficiency:0.32,
  edgePressureLookbackH1:6,
  edgeZoneFraction:0.35,
  minEdgePressureCloses:5,
  minBreakPenetrationAtrM5:0.10,
  minBreakRangeAtrM5:1.30,
  minBreakVolumeRatio:1.20,
  adxPeriod:14,
  adxRiseBarsM5:5,
  minAdxRiseM5:1.0,
  acceptanceBufferAtrM5:0.08,
  acceptanceConsecutiveCloses:2,
  acceptanceMaxBars:4,
  reentryInvalidationAtrM5:0.10,
  retestMaxBars:12,
  retestBandAtrM5:0.35,
  resumeMaxMinutes:20,
  minM1ResumeDisplacementAtr:1.10,
  m1ResumeBreakBufferAtr:0.02,
  stopBufferAtrM5:0.12,
  minRiskAtrM5:0.50,
  maxRiskAtrM5:3.0,
  minRewardRisk:2.25,
  maxSpreadAtrM1:0.30,
  eventLookbackBarsM5:30,
  rearmInsideBars:6,
  blockMacroRisks:Object.freeze(['high','critical'])
});

const TF_MS=Object.freeze({M1:60_000,M5:300_000,H1:3_600_000,H4:14_400_000});
const finite=n=>n!==null&&n!==undefined&&n!==''&&Number.isFinite(Number(n));
const condition=(id,label,passed,{required=true,value=null,note=null}={})=>({id,label,passed:Boolean(passed),required,value,note});

function completedBars(bars,tfMs,atTime){
  const t=Number(atTime??Date.now());
  return (bars??[]).filter(b=>Number(b.time)+tfMs<=t);
}
function atrAt(bars,time,period=14){
  const xs=atrSeries(bars,period);let out=null;
  for(const x of xs){if(Number(x.time)<=Number(time))out=Number(x.value);else break;}return out;
}
function atrFromCompletedBefore(bars,tfMs,time,period=14){
  const done=completedBars(bars,tfMs,time);return atrSeries(done,period).at(-1)?.value??null;
}
function rollingMedian(values){const a=values.filter(finite).map(Number).sort((a,b)=>a-b);if(!a.length)return null;const m=Math.floor(a.length/2);return a.length%2?a[m]:(a[m-1]+a[m])/2;}
function efficiencyRatio(bars){
  if(!bars?.length||bars.length<2)return null;
  const net=Math.abs(Number(bars.at(-1).close)-Number(bars[0].close));let path=0;
  for(let i=1;i<bars.length;i++)path+=Math.abs(Number(bars[i].close)-Number(bars[i-1].close));
  return path>0?net/path:0;
}
function marketNowOf(snapshot){
  const q=snapshot?.quote??{};
  if(finite(q.timestamp))return Number(q.timestamp);
  let out=0;for(const [tf,ms] of Object.entries(TF_MS)){const b=snapshot?.bars?.[tf]?.at?.(-1);if(b)out=Math.max(out,Number(b.time)+ms);}return out||Date.now();
}

export function buildR02Balance(snapshot,atTime,{config=R02_CONFIG}={}){
  const h1=completedBars(snapshot?.bars?.H1??[],TF_MS.H1,atTime);
  if(h1.length<Math.max(config.balanceHours,16))return null;
  const window=h1.slice(-config.balanceHours);
  const upper=Math.max(...window.map(b=>Number(b.high))),lower=Math.min(...window.map(b=>Number(b.low)));
  const a=atrAt(h1,window.at(-1).time,14);
  if(!finite(a)||Number(a)<=0)return null;
  const width=upper-lower,widthAtr=width/Number(a),eff=efficiencyRatio(window);
  const pressureBars=window.slice(-config.edgePressureLookbackH1);
  const buyThreshold=upper-width*config.edgeZoneFraction;
  const sellThreshold=lower+width*config.edgeZoneFraction;
  const buyPressureCloses=pressureBars.filter(b=>Number(b.close)>=buyThreshold).length;
  const sellPressureCloses=pressureBars.filter(b=>Number(b.close)<=sellThreshold).length;
  return{
    upper,lower,width,widthAtr,efficiency:eff,
    startTime:Number(window[0].time),endTime:Number(window.at(-1).time)+TF_MS.H1,
    atrH1:Number(a),bars:window.length,
    buyPressureCloses,sellPressureCloses,pressureBars:pressureBars.length,buyThreshold,sellThreshold,
    qualified:widthAtr>=config.minBalanceWidthAtrH1&&widthAtr<=config.maxBalanceWidthAtrH1&&Number(eff)<=config.maxBalanceEfficiency
  };
}

export function r02H4Bias(snapshot,atTime){
  const bars=completedBars(snapshot?.bars?.H4??[],TF_MS.H4,atTime);
  if(bars.length<55)return{direction:null,ema20:null,ema50:null,close:null};
  const e20=emaSeries(bars,20).at(-1)?.value,e50=emaSeries(bars,50).at(-1)?.value,close=Number(bars.at(-1).close);
  let direction=null;
  if(finite(e20)&&finite(e50)&&close>Number(e20)&&Number(e20)>Number(e50))direction='buy';
  if(finite(e20)&&finite(e50)&&close<Number(e20)&&Number(e20)<Number(e50))direction='sell';
  return{direction,ema20:e20,ema50:e50,close};
}

function m5AtrMap(bars){return new Map(atrSeries(bars,14).map(x=>[Number(x.time),Number(x.value)]));}
function m5AtrAt(map,time,fallback){return Math.max(Number(map.get(Number(time)))||Number(fallback)||0.01,0.01);}
function adxMap(bars,period){return new Map(adxDmiSeries(bars,period).map(x=>[Number(x.time),x]));}

export function findR02Breakout(snapshot,{config=R02_CONFIG}={}){
  const marketNow=marketNowOf(snapshot);
  const m5=completedBars(snapshot?.bars?.M5??[],TF_MS.M5,marketNow);
  if(m5.length<120)return null;
  const aMap=m5AtrMap(m5),fallback=atrSeries(m5,14).at(-1)?.value??0.01,dxMap=adxMap(m5,config.adxPeriod);
  const start=Math.max(22,m5.length-config.eventLookbackBarsM5);
  const candidates=[];
  for(let i=start;i<m5.length;i++){
    const b=m5[i],prev=m5[i-1],a=m5AtrAt(aMap,b.time,fallback),balance=buildR02Balance(snapshot,b.time,{config});
    if(!balance?.qualified)continue;
    const bias=r02H4Bias(snapshot,b.time);if(!bias.direction)continue;
    const tr=Math.max(Number(b.high)-Number(b.low),Math.abs(Number(b.high)-Number(prev.close)),Math.abs(Number(b.low)-Number(prev.close)));
    const priorVolumes=m5.slice(Math.max(0,i-20),i).map(x=>Number(x.volume)||0),volMedian=rollingMedian(priorVolumes),volumeRatio=finite(volMedian)&&Number(volMedian)>0?(Number(b.volume)||0)/Number(volMedian):null;
    const rangeRatio=tr/a;
    const priorInside=m5.slice(Math.max(0,i-config.rearmInsideBars),i);
    const rearmed=priorInside.length>=config.rearmInsideBars&&priorInside.every(x=>Number(x.close)<=balance.upper+0.05*a&&Number(x.close)>=balance.lower-0.05*a);
    if(!rearmed)continue;
    const longBreak=Number(b.close)>=balance.upper+config.minBreakPenetrationAtrM5*a&&Number(prev.close)<=balance.upper+0.05*a;
    const shortBreak=Number(b.close)<=balance.lower-config.minBreakPenetrationAtrM5*a&&Number(prev.close)>=balance.lower-0.05*a;
    const direction=longBreak?'buy':shortBreak?'sell':null;
    if(!direction||!config.allowDirections.includes(direction)||bias.direction!==direction)continue;
    const pressureCloses=direction==='buy'?balance.buyPressureCloses:balance.sellPressureCloses;
    const pressureOk=pressureCloses>=config.minEdgePressureCloses;
    const adxNow=dxMap.get(Number(b.time))?.adx;
    const prevAdxTime=m5[i-config.adxRiseBarsM5]?.time;
    const adxPrev=prevAdxTime!==undefined?dxMap.get(Number(prevAdxTime))?.adx:null;
    const adxRise=finite(adxNow)&&finite(adxPrev)?Number(adxNow)-Number(adxPrev):null;
    const characterOk=rangeRatio>=config.minBreakRangeAtrM5&&finite(volumeRatio)&&Number(volumeRatio)>=config.minBreakVolumeRatio&&finite(adxRise)&&Number(adxRise)>=config.minAdxRiseM5;
    if(!pressureOk||!characterOk)continue;
    candidates.push({direction,index:i,time:Number(b.time),boundary:direction==='buy'?balance.upper:balance.lower,balance,bias,atrAtBreak:a,rangeRatio,volumeRatio,adx:Number(adxNow),adxRise:Number(adxRise),pressureCloses,bar:b,marketNow});
  }
  return candidates.sort((a,b)=>b.time-a.time)[0]??null;
}

export function classifyR02Acceptance(m5Input,brk,{config=R02_CONFIG}={}){
  if(!brk)return{accepted:false,invalidated:false,acceptIndex:null,consecutive:0};
  const m5=completedBars(m5Input,TF_MS.M5,brk.marketNow??Number.MAX_SAFE_INTEGER);
  const aMap=m5AtrMap(m5);let consecutive=0,acceptIndex=null,invalidated=false;
  for(let j=brk.index;j<Math.min(m5.length,brk.index+config.acceptanceMaxBars+1);j++){
    const b=m5[j],a=m5AtrAt(aMap,b.time,brk.atrAtBreak);
    if(brk.direction==='buy'){
      if(Number(b.close)<brk.boundary-config.reentryInvalidationAtrM5*a){invalidated=true;break;}
      consecutive=Number(b.close)>=brk.boundary+config.acceptanceBufferAtrM5*a?consecutive+1:0;
    }else{
      if(Number(b.close)>brk.boundary+config.reentryInvalidationAtrM5*a){invalidated=true;break;}
      consecutive=Number(b.close)<=brk.boundary-config.acceptanceBufferAtrM5*a?consecutive+1:0;
    }
    if(consecutive>=config.acceptanceConsecutiveCloses){acceptIndex=j;break;}
  }
  return{accepted:acceptIndex!==null,invalidated,acceptIndex,consecutive};
}

export function findR02Retest(m5Input,brk,acceptance,{config=R02_CONFIG}={}){
  if(!brk||!acceptance?.accepted)return null;
  const m5=completedBars(m5Input,TF_MS.M5,brk.marketNow??Number.MAX_SAFE_INTEGER),aMap=m5AtrMap(m5);
  for(let j=acceptance.acceptIndex+1;j<Math.min(m5.length,acceptance.acceptIndex+config.retestMaxBars+1);j++){
    const b=m5[j],a=m5AtrAt(aMap,b.time,brk.atrAtBreak);
    if(brk.direction==='buy'){
      if(Number(b.close)<brk.boundary-config.reentryInvalidationAtrM5*a)return{invalidated:true,index:j,time:Number(b.time),bar:b,marketNow:brk.marketNow};
      if(Number(b.low)<=brk.boundary+config.retestBandAtrM5*a&&Number(b.close)>=brk.boundary-config.reentryInvalidationAtrM5*a)return{invalidated:false,index:j,time:Number(b.time),bar:b,atr:a,marketNow:brk.marketNow};
    }else{
      if(Number(b.close)>brk.boundary+config.reentryInvalidationAtrM5*a)return{invalidated:true,index:j,time:Number(b.time),bar:b,marketNow:brk.marketNow};
      if(Number(b.high)>=brk.boundary-config.retestBandAtrM5*a&&Number(b.close)<=brk.boundary+config.reentryInvalidationAtrM5*a)return{invalidated:false,index:j,time:Number(b.time),bar:b,atr:a,marketNow:brk.marketNow};
    }
  }
  return null;
}

export function findR02M1Resume(m1Input,retest,direction,{config=R02_CONFIG}={}){
  if(!retest||retest.invalidated||!m1Input?.length||!config.allowDirections.includes(direction))return null;
  const m1=completedBars(m1Input,TF_MS.M1,retest.marketNow??Number.MAX_SAFE_INTEGER);
  const after=m1.filter(b=>Number(b.time)>=Number(retest.time)&&Number(b.time)<=Number(retest.time)+config.resumeMaxMinutes*60_000);
  if(after.length<6)return null;const aMap=m5AtrMap(m1);
  for(let i=5;i<after.length;i++){
    const b=after[i],prev=after.slice(i-5,i),a=m5AtrAt(aMap,b.time,Math.max(Number(retest.atr)||0.01,0.01)/5);
    const priorHigh=Math.max(...prev.map(x=>Number(x.high))),priorLow=Math.min(...prev.map(x=>Number(x.low)));
    const tr=Math.max(Number(b.high)-Number(b.low),Math.abs(Number(b.high)-Number(after[i-1].close)),Math.abs(Number(b.low)-Number(after[i-1].close)));
    const displacement=tr>=config.minM1ResumeDisplacementAtr*a;
    if(direction==='buy'&&Number(b.close)>priorHigh+config.m1ResumeBreakBufferAtr*a&&Number(b.close)>Number(b.open)&&displacement)return{time:Number(b.time),price:Number(b.close),bar:b,atr:a,type:'M1_RESUME_BUY'};
    if(direction==='sell'&&Number(b.close)<priorLow-config.m1ResumeBreakBufferAtr*a&&Number(b.close)<Number(b.open)&&displacement)return{time:Number(b.time),price:Number(b.close),bar:b,atr:a,type:'M1_RESUME_SELL'};
  }
  return null;
}

function buildPlan(snapshot,brk,retest,resume,{config=R02_CONFIG,entryPrice=null,spread=null}={}){
  if(!brk||!retest||!resume||!finite(resume.price)||!finite(entryPrice))return null;
  const m5=snapshot?.bars?.M5??[];
  const a5=Math.max(Number(atrFromCompletedBefore(m5,TF_MS.M5,Number(resume.time)+TF_MS.M1,14))||Number(retest.atr)||Number(brk.atrAtBreak)||0.01,0.01);
  const signalEntry=Number(resume.price),entry=Number(entryPrice);
  const stop=brk.direction==='buy'?Math.min(Number(retest.bar.low)-config.stopBufferAtrM5*a5,brk.boundary-config.stopBufferAtrM5*a5):Math.max(Number(retest.bar.high)+config.stopBufferAtrM5*a5,brk.boundary+config.stopBufferAtrM5*a5);
  const risk=Math.abs(entry-stop),riskAtr=risk/a5;
  const tp1=brk.direction==='buy'?entry+risk:entry-risk;
  const tp2=brk.direction==='buy'?entry+config.minRewardRisk*risk:entry-config.minRewardRisk*risk;
  const measured=brk.direction==='buy'?brk.boundary+brk.balance.width:brk.boundary-brk.balance.width;
  const measuredMoveR=risk>0?(brk.direction==='buy'?(measured-entry)/risk:(entry-measured)/risk):null;
  return{direction:brk.direction,signalEntry,entry,stop,risk,riskAtr,atrM5AtEntry:a5,tp1:{price:tp1,label:'1R'},tp2:{price:tp2,label:`${config.minRewardRisk.toFixed(2)}R`},measuredMove:measured,measuredMoveR,rr1:1,rr2:config.minRewardRisk,entryMeta:{signalSide:'M1_CLOSE',executableSide:brk.direction==='buy'?'ASK':'BID',stopTriggerSide:brk.direction==='buy'?'BID':'ASK',spread:finite(spread)?Number(spread):null},execution:null};
}

function overlays(brk,retest,plan,stage,marketNow){
  const zones=[],lines=[],markers=[];if(!brk)return{zones,lines,markers};const end=Number(marketNow??Date.now());
  zones.push({kind:'r02_balance',side:'neutral',low:brk.balance.lower,high:brk.balance.upper,startTime:brk.balance.startTime,endTime:brk.time,label:'R02 BALANCE',priority:7});
  lines.push({kind:'r02_boundary',price:brk.boundary,startTime:brk.balance.startTime,endTime:end,label:`R02 RANGE ${brk.direction==='buy'?'H':'L'}`,dashed:true,color:'#60a5fa',priority:8});
  markers.push({kind:'r02_breakout',time:brk.time,price:brk.direction==='buy'?Number(brk.bar.high):Number(brk.bar.low),label:`R02 BREAK ${brk.direction==='buy'?'BUY':'SELL'}`,direction:brk.direction==='buy'?'bullish':'bearish',priority:8});
  if(retest&&!retest.invalidated)markers.push({kind:'r02_retest',time:retest.time,price:brk.boundary,label:'R02 RETEST',direction:brk.direction==='buy'?'bullish':'bearish',priority:8});
  if(plan){
    lines.push({kind:'r02_entry',price:plan.entry,startTime:plan.entry?brk.time:brk.time,endTime:end,label:'R02 ENTRY',dashed:false,color:'#f8fafc',priority:9});
    lines.push({kind:'r02_stop',price:plan.stop,startTime:brk.time,endTime:end,label:'R02 SL',dashed:true,color:'#fb7185',priority:8});
    lines.push({kind:'r02_tp1',price:plan.tp1.price,startTime:brk.time,endTime:end,label:'R02 TP1 1R',dashed:true,color:'#22c55e',priority:7});
    lines.push({kind:'r02_tp2',price:plan.tp2.price,startTime:brk.time,endTime:end,label:`R02 TP2 ${plan.rr2.toFixed(2)}R`,dashed:true,color:'#34d399',priority:8});
    lines.push({kind:'r02_measured',price:plan.measuredMove,startTime:brk.time,endTime:end,label:'R02 MEASURED MOVE',dashed:true,color:'#a78bfa',priority:6});
  }
  return{zones,lines,markers};
}

export function evaluateR02(snapshot,{trigger='tick',config=R02_CONFIG}={}){
  const rawM5=snapshot?.bars?.M5??[],rawM1=snapshot?.bars?.M1??[],quote=snapshot?.quote??{},marketNow=marketNowOf(snapshot);
  const m5=completedBars(rawM5,TF_MS.M5,marketNow),m1=completedBars(rawM1,TF_MS.M1,marketNow);
  const quoteReady=finite(quote.bid)&&finite(quote.ask)&&Number(quote.ask)>=Number(quote.bid);
  const bid=quoteReady?Number(quote.bid):null,ask=quoteReady?Number(quote.ask):null;
  const spread=finite(quote.spread)?Number(quote.spread):(quoteReady?Number(ask)-Number(bid):null),spreadKnown=finite(spread)&&Number(spread)>=0;
  const dataReady=m5.length>=120&&m1.length>=120&&completedBars(snapshot?.bars?.H1??[],TF_MS.H1,marketNow).length>=config.balanceHours&&completedBars(snapshot?.bars?.H4??[],TF_MS.H4,marketNow).length>=55&&quoteReady;
  const brk=dataReady?findR02Breakout(snapshot,{config}):null;
  const acceptance=brk?classifyR02Acceptance(rawM5,brk,{config}):{accepted:false,invalidated:false};
  const retest=brk&&acceptance.accepted?findR02Retest(rawM5,brk,acceptance,{config}):null;
  const resume=retest&&!retest.invalidated?findR02M1Resume(rawM1,retest,brk.direction,{config}):null;
  const a1=Math.max(atrSeries(m1,14).at(-1)?.value??0.01,0.01),spreadSafe=spreadKnown&&Number(spread)<=a1*config.maxSpreadAtrM1;
  const macroRisk=String(snapshot?.macro?.risk??'normal').toLowerCase(),macroSafe=!config.blockMacroRisks.includes(macroRisk);
  const executableEntry=brk?.direction==='buy'?ask:brk?.direction==='sell'?bid:null;
  const plan=resume&&quoteReady?buildPlan(snapshot,brk,retest,resume,{config,entryPrice:executableEntry,spread}):null;
  const riskOk=Boolean(plan&&plan.riskAtr>=config.minRiskAtrM5&&plan.riskAtr<=config.maxRiskAtrM5);
  const expired=Boolean(brk)&&marketNow>Number(brk.time)+(config.acceptanceMaxBars+config.retestMaxBars)*TF_MS.M5+config.resumeMaxMinutes*60_000;
  const stopTriggered=Boolean(plan&&((brk?.direction==='buy'&&finite(bid)&&Number(bid)<=Number(plan.stop))||(brk?.direction==='sell'&&finite(ask)&&Number(ask)>=Number(plan.stop))));
  const invalidated=Boolean(acceptance.invalidated||retest?.invalidated||expired||stopTriggered);
  let stage='SEARCHING';if(brk)stage='DETECTED';if(brk&&acceptance.accepted&&!invalidated)stage='ACCEPTED';if(retest&&!retest.invalidated&&!invalidated)stage='RETEST';if(resume&&!invalidated)stage='CONFIRMED';if(resume&&!invalidated&&quoteReady&&spreadSafe&&macroSafe&&riskOk)stage='ENTRY_READY';if(invalidated)stage='INVALIDATED';
  const conditions=[
    condition('data_ready','M1/M5/H1/H4 clôturés suffisamment chargés',dataReady,{value:`M1 ${m1.length} / M5 ${m5.length}`}),
    condition('direction_calibrated','Direction calibrée R02 : BUY uniquement',Boolean(brk?.direction==='buy'),{value:brk?.direction?.toUpperCase()??'BUY recherché',note:'SELL désactivé après performance hors échantillon négative 2024–2026.'}),
    condition('balance','Balance H1 mature 60 h + faible efficacité',Boolean(brk?.balance?.qualified),{value:brk?`${brk.balance.widthAtr.toFixed(2)} ATR H1 • ER ${brk.balance.efficiency.toFixed(2)}`:'en attente'}),
    condition('edge_pressure','Pression ≥ 5/6 clôtures H1 près du bord de cassure',Boolean(brk?.pressureCloses>=config.minEdgePressureCloses),{value:brk?`${brk.pressureCloses}/${brk.balance.pressureBars}`:'en attente'}),
    condition('h4_bias','Cassure alignée avec la tendance H4',Boolean(brk&&brk?.bias?.direction===brk?.direction),{value:brk?.bias?.direction?.toUpperCase()??'en attente'}),
    condition('character_change','Character change : TR ≥ 1,3 ATR + volume ≥ 1,2× + ADX Δ5 ≥ +1',Boolean(brk),{value:brk?`TR ×${brk.rangeRatio.toFixed(2)} • vol ×${brk.volumeRatio.toFixed(2)} • ADX Δ ${brk.adxRise.toFixed(2)}`:'en attente'}),
    condition('acceptance','2 clôtures M5 acceptées hors balance',Boolean(acceptance.accepted&&!acceptance.invalidated),{value:acceptance.accepted?'ACCEPTÉ':'en attente'}),
    condition('retest','Premier retest de la frontière tenu',Boolean(retest&&!retest.invalidated),{value:retest&&!retest.invalidated?`@ ${brk.boundary.toFixed(2)}`:'en attente'}),
    condition('m1_resume','Reprise directionnelle M1 après retest',Boolean(resume),{value:resume?resume.type:'en attente'}),
    condition('broker_quote','BID + ASK cTrader disponibles',quoteReady,{value:quoteReady?`BID ${Number(bid).toFixed(2)} • ASK ${Number(ask).toFixed(2)}`:'INDISPONIBLE'}),
    condition('risk_geometry',`Risque live ${config.minRiskAtrM5.toFixed(2)}–${config.maxRiskAtrM5.toFixed(1)} ATR M5`,riskOk,{value:plan?`${plan.riskAtr.toFixed(2)} ATR • ASK ${plan.entry.toFixed(2)}`:'en attente'}),
    condition('spread_safe','Spread connu et compatible avec M1',spreadSafe,{value:spreadKnown?`${Number(spread).toFixed(2)} / max ${(a1*config.maxSpreadAtrM1).toFixed(2)}`:'INCONNU'}),
    condition('macro_safe','Pas de risque macro HIGH/CRITICAL immédiat',macroSafe,{value:macroRisk.toUpperCase()}),
    condition('target_calibration',`TP2 calibré fixe ${config.minRewardRisk.toFixed(2)}R`,Boolean(plan),{required:false,value:plan?`${plan.rr2.toFixed(2)}R • measured ${finite(plan.measuredMoveR)?Number(plan.measuredMoveR).toFixed(2)+'R':'—'}`:'en attente',note:'Information de sortie calibrée, pas un filtre indépendant.'})
  ];
  const requiredConditions=conditions.filter(c=>c.required!==false),requiredPassed=requiredConditions.filter(c=>c.passed).length;
  const readinessPercent=requiredConditions.length?Math.round(requiredPassed/requiredConditions.length*100):0,missingConditions=requiredConditions.filter(c=>!c.passed).map(c=>c.id);
  const side='BUY';
  let status='idle',reason='Recherche d’une balance H1 mature avec pression acheteuse au bord haut.';
  if(stage==='INVALIDATED'){status='rejected';reason=`Cassure ${side} rejetée : réintégration de la balance ou expiration du retest.`;}
  else if(stage==='DETECTED'){status='watching';reason=`Breakout ${side} avec character change détecté : attente de 2 clôtures d’acceptation hors balance.`;}
  else if(stage==='ACCEPTED'){status='watching';reason='Nouveaux prix acceptés : attente du premier retest de la frontière.';}
  else if(stage==='RETEST'){status='watching';reason='Retest tenu : attente de la reprise M1 haussière.';}
  else if(stage==='CONFIRMED'){status='watching';const blockers=[];if(!spreadSafe)blockers.push('spread');if(!macroSafe)blockers.push('macro');if(!riskOk)blockers.push('risque');if(!quoteReady)blockers.push('BID/ASK');reason=blockers.length?`Breakout ${side} confirmé, entrée bloquée : ${blockers.join(', ')}.`:`Breakout ${side} confirmé, préparation de l’entrée.`;}
  else if(stage==='ENTRY_READY'){status='validated';reason=`Balance breakout ${side} accepté + retest tenu + reprise M1 : entrée R02 prête, sans exécution automatique.`;}
  return{status,stage,direction:brk?.direction??null,conditions,overlays:overlays(brk,retest,plan,stage,marketNow),plan:plan?{...plan,stage,balance:brk.balance,boundary:brk.boundary,breakout:{time:brk.time,rangeRatio:brk.rangeRatio,volumeRatio:brk.volumeRatio,adx:brk.adx,adxRise:brk.adxRise,pressureCloses:brk.pressureCloses},acceptance,retest:{time:retest?.time??null},resume,execution:null}:null,reason,readiness:{requiredPassed,totalRequired:requiredConditions.length,percent:readinessPercent,allGreen:readinessPercent===100&&stage==='ENTRY_READY',missing:missingConditions},trigger,researchContract:{core:'mature 60 h H1 balance → ≥5/6 H1 closes pressure near upper edge → H4 bullish bias → range/volume/ADX character-change BUY breakout → 2-close acceptance → first retest holds → M1 bullish resume',calibration:'BUY-only after 2021–2026 M5 proxy. SELL branch disabled after negative 2024–2026 out-of-sample performance. No mandatory session filter: all-day formulation was more robust than US-only subsets.',note:'Immediate re-entry converts the event into a failed breakout candidate, not R02. M5 backtest uses a causal resume proxy; LIVE requires true M1 resume. LIVE entry uses executable ASK for BUY while resume.price is retained as the M1 signal reference.'}};
}

export const R02_BALANCE_BREAKOUT_ACCEPTANCE=Object.freeze({id:R02_CONFIG.id,name:R02_CONFIG.name,evaluate:(snapshot,ctx)=>evaluateR02(snapshot,ctx)});
