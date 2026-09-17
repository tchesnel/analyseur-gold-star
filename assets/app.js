import { GoldChart } from './chart.js';
import { CLEAN_PRESET, allFamilies } from './layer-state.js';
import { createSignalHold, formatSignalCountdown, isSignalHoldActive, remainingSignalHoldMs, shouldCaptureSignal } from './signal-hold.js';

const $=s=>document.querySelector(s);
const state={timeframe:'M5',source:null,mode:'live',reconnects:0,quote:null,symbol:'XAUUSD',authConnected:false,credentialsConfigured:false,reconnectTimer:null,fatalStreamError:false,autoLayers:true,lastAutoDisplay:null,manualFamilies:{...CLEAN_PRESET},appView:'strategies',r01Timeframe:'M5',r01Bars:{M1:[],M5:[]},r01Visuals:{M1:null,M5:null},r01StrategyOverlays:{zones:[],lines:[],markers:[]},r01AdvancedLayers:false,r02Timeframe:'M5',r02Bars:{M1:[],M5:[],H1:[]},r02Visuals:{M1:null,M5:null,H1:null},r02StrategyOverlays:{zones:[],lines:[],markers:[]},r02AdvancedLayers:false,r03Timeframe:'M5',r03Bars:{M1:[],M5:[],M15:[],H1:[],H4:[]},r03Visuals:{M1:null,M5:null,M15:null,H1:null,H4:null},r03StrategyOverlays:{zones:[],lines:[],markers:[]},r03AdvancedLayers:false,signalHolds:{R01:null,R02:null,R03:null},lastResults:{R01:null,R02:null,R03:null}};
const TF_MS={M1:60000,M5:300000,M15:900000,M30:1800000,H1:3600000,H4:14400000};
const chart=new GoldChart($('#chart'));
const r01Chart=new GoldChart($('#r01Chart'));
const r02Chart=new GoldChart($('#r02Chart'));
const r03Chart=new GoldChart($('#r03Chart'));
const R01_SIMPLE_FAMILIES=Object.freeze({...allFamilies(false),structure:true,liquidity:true,fvg:true,adx:true,atr:true});
const R01_ADVANCED_FAMILIES=Object.freeze({...allFamilies(false),structure:true,liquidity:true,internalLiquidity:true,fvg:true,htf:true,sessions:true,volumeProfile:true,adx:true,atr:true});
const R02_SIMPLE_FAMILIES=Object.freeze({...allFamilies(false),structure:true,adx:true,atr:true});
const R02_ADVANCED_FAMILIES=Object.freeze({...allFamilies(false),structure:true,trend:true,htf:true,volumeProfile:true,adx:true,atr:true});
const R03_SIMPLE_FAMILIES=Object.freeze({...allFamilies(false),structure:true,trend:true,fvg:true,orderBlocks:true,vwap:true,avwap:true,adx:true,atr:true});
const R03_ADVANCED_FAMILIES=Object.freeze({...allFamilies(false),structure:true,liquidity:true,internalLiquidity:true,orderBlocks:true,fvg:true,poi:true,htf:true,sessions:true,trend:true,vwap:true,avwap:true,volumeProfile:true,orderFlow:true,adx:true,volatilityRegime:true,atr:true});
r01Chart.setFamilies(R01_SIMPLE_FAMILIES);r01Chart.visibleBars=78;r02Chart.setFamilies(R02_SIMPLE_FAMILIES);r02Chart.visibleBars=86;r03Chart.setFamilies(R03_SIMPLE_FAMILIES);r03Chart.visibleBars=92;
const els={
  badge:$('#connectionBadge'),mode:$('#modeLabel'),symbol:$('#symbolLabel'),bid:$('#bid'),ask:$('#ask'),spread:$('#spread'),stage:$('#stage'),logs:$('#logs'),strategies:$('#strategiesCount'),exec:$('#executionStatus'),health:$('#healthText'),auth:$('#authText'),chartHint:$('#chartHint'),connect:$('#ctraderConnect'),disconnect:$('#ctraderDisconnect'),oauthNote:$('#oauthNote'),
  r01Stage:$('#r01Stage'),r01Direction:$('#r01Direction'),r01Level:$('#r01Level'),r01Entry:$('#r01Entry'),r01RR:$('#r01RR'),r01Reason:$('#r01Reason'),r01Conditions:$('#r01Conditions'),r01Plan:$('#r01Plan'),r02Stage:$('#r02Stage'),r02Direction:$('#r02Direction'),r02Balance:$('#r02Balance'),r02Entry:$('#r02Entry'),r02RR:$('#r02RR'),r02Reason:$('#r02Reason'),r02Conditions:$('#r02Conditions'),r02Plan:$('#r02Plan'),r03Stage:$('#r03Stage'),r03Direction:$('#r03Direction'),r03Trend:$('#r03Trend'),r03Zone:$('#r03Zone'),r03Entry:$('#r03Entry'),r03RR:$('#r03RR'),r03Reason:$('#r03Reason'),r03Conditions:$('#r03Conditions'),r03Plan:$('#r03Plan'),
  trend:$('#trendMetric'),structure:$('#structureMetric'),rsi:$('#rsiMetric'),atr:$('#atrMetric'),vwap:$('#vwapMetric'),adr:$('#adrMetric'),fvg:$('#fvgMetric'),ob:$('#obMetric'),buyZone:$('#buyZoneMetric'),sellZone:$('#sellZoneMetric'),adx:$('#adxMetric'),dom:$('#domMetric'),profile:$('#profileMetric'),macroRisk:$('#macroRiskMetric'),autoFocusMetric:$('#autoFocusMetric'),poiStatus:$('#poiLayerStatus'),structureStatus:$('#structureLayerStatus'),liquidityStatus:$('#liquidityLayerStatus'),internalLiquidityStatus:$('#internalLiquidityLayerStatus'),fibStatus:$('#fibLayerStatus'),obStatus:$('#obLayerStatus'),fvgStatus:$('#fvgLayerStatus'),pdStatus:$('#pdLayerStatus'),htfStatus:$('#htfLayerStatus'),sessionsStatus:$('#sessionsLayerStatus'),trendStatus:$('#trendLayerStatus'),vwapStatus:$('#vwapLayerStatus'),avwapStatus:$('#avwapLayerStatus'),profileStatus:$('#volumeProfileLayerStatus'),orderFlowStatus:$('#orderFlowLayerStatus'),adxStatus:$('#adxLayerStatus'),volatilityStatus:$('#volatilityLayerStatus'),macroStatus:$('#macroLayerStatus'),rsiStatus:$('#rsiLayerStatus'),atrStatus:$('#atrLayerStatus'),macroDxy:$('#macroDxy'),macroUs10y:$('#macroUs10y'),macroReal10y:$('#macroReal10y'),macroNext:$('#macroNext'),macroBias:$('#macroBias'),autoMode:$('#autoMode'),manualMode:$('#manualMode'),autoFocus:$('#autoFocus'),autoReasons:$('#autoReasons'),autoCount:$('#autoCount')
};
Object.assign(els,{
  r01Score:$('#r01Score'),r01ScoreLabel:$('#r01ScoreLabel'),r01TabScore:$('#r01TabScore'),r01ProgressBar:$('#r01ProgressBar'),r01ProgressText:$('#r01ProgressText'),r01Decision:$('#r01Decision'),r01DecisionText:$('#r01DecisionText'),r01NextStep:$('#r01NextStep'),r01Timeline:$('#r01Timeline'),r01ConditionSummary:$('#r01ConditionSummary'),r01OverviewState:$('#r01OverviewState'),r01OverviewBias:$('#r01OverviewBias'),r01OverviewNext:$('#r01OverviewNext'),r01SignalStatus:$('#r01SignalStatus'),r01Ticket:$('#r01Ticket'),r01TicketSide:$('#r01TicketSide'),r01TicketEntry:$('#r01TicketEntry'),r01TicketSL:$('#r01TicketSL'),r01TicketTP1:$('#r01TicketTP1'),r01TicketTP2:$('#r01TicketTP2'),r01TicketRR1:$('#r01TicketRR1'),r01TicketRR2:$('#r01TicketRR2'),r01StopLogic:$('#r01StopLogic'),r01ChartTitle:$('#r01ChartTitle'),r01ChartHint:$('#r01ChartHint'),r01IndicatorTags:$('#r01IndicatorTags'),
  r02Score:$('#r02Score'),r02TabScore:$('#r02TabScore'),r02ProgressBar:$('#r02ProgressBar'),r02ProgressText:$('#r02ProgressText'),r02Decision:$('#r02Decision'),r02DecisionText:$('#r02DecisionText'),r02NextStep:$('#r02NextStep'),r02Timeline:$('#r02Timeline'),r02ConditionSummary:$('#r02ConditionSummary'),r02OverviewState:$('#r02OverviewState'),r02OverviewBias:$('#r02OverviewBias'),r02OverviewNext:$('#r02OverviewNext'),r02SignalStatus:$('#r02SignalStatus'),r02Ticket:$('#r02Ticket'),r02TicketSide:$('#r02TicketSide'),r02TicketEntry:$('#r02TicketEntry'),r02TicketSL:$('#r02TicketSL'),r02TicketTP1:$('#r02TicketTP1'),r02TicketTP2:$('#r02TicketTP2'),r02TicketRisk:$('#r02TicketRisk'),r02TicketSignal:$('#r02TicketSignal'),r02StopLogic:$('#r02StopLogic'),r02ChartTitle:$('#r02ChartTitle'),r02ChartHint:$('#r02ChartHint'),r02IndicatorTags:$('#r02IndicatorTags'),
  r03Score:$('#r03Score'),r03TabScore:$('#r03TabScore'),r03ProgressBar:$('#r03ProgressBar'),r03ProgressText:$('#r03ProgressText'),r03Decision:$('#r03Decision'),r03DecisionText:$('#r03DecisionText'),r03NextStep:$('#r03NextStep'),r03Timeline:$('#r03Timeline'),r03ConditionSummary:$('#r03ConditionSummary'),r03OverviewState:$('#r03OverviewState'),r03OverviewBias:$('#r03OverviewBias'),r03OverviewNext:$('#r03OverviewNext'),r03SignalStatus:$('#r03SignalStatus'),r03Ticket:$('#r03Ticket'),r03TicketSide:$('#r03TicketSide'),r03TicketEntry:$('#r03TicketEntry'),r03TicketSL:$('#r03TicketSL'),r03TicketTP1:$('#r03TicketTP1'),r03TicketTP2:$('#r03TicketTP2'),r03TicketRisk:$('#r03TicketRisk'),r03TicketSignal:$('#r03TicketSignal'),r03StopLogic:$('#r03StopLogic'),r03ChartTitle:$('#r03ChartTitle'),r03ChartHint:$('#r03ChartHint'),r03IndicatorTags:$('#r03IndicatorTags')
});

function log(message,kind='info'){const row=document.createElement('div');row.className=`log-row ${kind}`;row.textContent=`${new Date().toLocaleTimeString()} — ${message}`;els.logs.prepend(row);while(els.logs.children.length>50)els.logs.lastChild.remove();}
function setConnection(status,label){els.badge.dataset.status=status;els.badge.textContent=label;}
function setAuthUi(connected){state.authConnected=connected;els.connect.hidden=connected;els.disconnect.hidden=!connected;els.auth.textContent=connected?'cTrader connecté':'Non connectée';if(!connected){setConnection('error','CTRADER NON CONNECTÉ');els.stage.textContent=state.credentialsConfigured?'Connecte ton compte cTrader':'Configure ID + Secret cTrader sur Vercel';}}
function hasNumber(n){return n!==null&&n!==undefined&&n!==''&&Number.isFinite(Number(n));}
function fmt(n,d=2){return hasNumber(n)?Number(n).toFixed(d):'—';}
function signed(n,d=2){if(!hasNumber(n))return'—';const x=Number(n);return`${x>=0?'+':''}${x.toFixed(d)}`;}
function readinessOf(result){const required=(result?.conditions??[]).filter(c=>c.required!==false),passed=required.filter(c=>c.passed).length,total=required.length,percent=total?Math.round(passed/total*100):0;return result?.readiness?{...result.readiness,requiredPassed:result.readiness.requiredPassed??passed,totalRequired:result.readiness.totalRequired??total,percent:result.readiness.percent??percent}:{requiredPassed:passed,totalRequired:total,percent,allGreen:percent===100&&String(result?.stage??'')==='ENTRY_READY',missing:required.filter(c=>!c.passed).map(c=>c.id)};}
function setProgress(prefix,r){const score=els[`${prefix}Score`],tab=els[`${prefix}TabScore`],bar=els[`${prefix}ProgressBar`],text=els[`${prefix}ProgressText`],remaining=Math.max(0,Number(r.totalRequired)-Number(r.requiredPassed));if(score)score.textContent=`${r.requiredPassed} / ${r.totalRequired}`;if(tab)tab.textContent=`${r.requiredPassed} / ${r.totalRequired}`;if(bar)bar.style.width=`${Math.max(0,Math.min(100,Number(r.percent)||0))}%`;if(text)text.textContent=remaining?`${remaining} encore requise${remaining>1?'s':''}`:'TOUT EST AU VERT';}
function upsertLocalBar(list,bar,max=420){if(!bar)return list;const out=[...(list??[])],last=out.at(-1);if(!last||bar.time>last.time)out.push(bar);else if(bar.time===last.time)out[out.length-1]=bar;else{const i=out.findIndex(x=>x.time===bar.time);if(i>=0)out[i]=bar;}return out.slice(-max);}
function applyR01View(tf=state.r01Timeframe){const next=['M1','M5'].includes(tf)?tf:'M5';state.r01Timeframe=next;document.querySelectorAll('[data-r01-tf]').forEach(b=>b.classList.toggle('active',b.dataset.r01Tf===next));if(els.r01ChartTitle)els.r01ChartTitle.textContent=next==='M5'?'M5 — contexte, liquidité, ATR & ADX':'M1 — shift, displacement/FVG & retest';r01Chart.setBars(state.r01Bars[next]??[]);r01Chart.setOverlays(state.r01Visuals[next]?.overlays??{});r01Chart.setStrategyOverlays(state.r01StrategyOverlays);if(state.quote)r01Chart.setQuote(state.quote);if(els.r01ChartHint)els.r01ChartHint.textContent=next==='M5'?'Contexte R01 autonome : niveaux de liquidité, sweep, zone d’entrée, SL/TP, ATR et ADX.':'Trigger R01 autonome : structure M1, shift, momentum/FVG, retest et niveaux du plan.';}
function updateR01IndicatorTags(result){if(!els.r01IndicatorTags)return;const map=new Map((result?.conditions??[]).map(c=>[c.id,c]));for(const tag of els.r01IndicatorTags.querySelectorAll('[data-condition]')){const c=map.get(tag.dataset.condition);tag.removeAttribute('data-pass');if(c?.passed)tag.dataset.pass='true';tag.title=c?`${c.label}${c.value?` — ${c.value}`:''}`:'En attente de données';}}
function applyR02View(tf=state.r02Timeframe){const next=['H1','M5','M1'].includes(tf)?tf:'M5';state.r02Timeframe=next;document.querySelectorAll('[data-r02-tf]').forEach(b=>b.classList.toggle('active',b.dataset.r02Tf===next));if(els.r02ChartTitle)els.r02ChartTitle.textContent=next==='H1'?'H1 — balance mature, pression de bord & biais':next==='M5'?'M5 — breakout, acceptation, retest, ATR & ADX':'M1 — reprise directionnelle & prix d’exécution';r02Chart.setBars(state.r02Bars[next]??[]);r02Chart.setOverlays(state.r02Visuals[next]?.overlays??{});r02Chart.setStrategyOverlays(state.r02StrategyOverlays);if(state.quote)r02Chart.setQuote(state.quote);if(els.r02ChartHint)els.r02ChartHint.textContent=next==='H1'?'Contexte R02 autonome : balance 60 H1 et pression proche du bord haut.':next==='M5'?'Setup R02 autonome : cassure, character change, acceptation, retest, SL/TP, ATR et ADX.':'Trigger R02 autonome : reprise M1 puis entrée BUY au prix ASK réellement exécutable.';}
function updateR02IndicatorTags(result){if(!els.r02IndicatorTags)return;const map=new Map((result?.conditions??[]).map(c=>[c.id,c]));for(const tag of els.r02IndicatorTags.querySelectorAll('[data-condition]')){const c=map.get(tag.dataset.condition);tag.removeAttribute('data-pass');if(c?.passed)tag.dataset.pass='true';tag.title=c?`${c.label}${c.value?` — ${c.value}`:''}`:'En attente de données';}}
function applyR03View(tf=state.r03Timeframe){const next=['H4','H1','M15','M5','M1'].includes(tf)?tf:'M5';state.r03Timeframe=next;document.querySelectorAll('[data-r03-tf]').forEach(b=>b.classList.toggle('active',b.dataset.r03Tf===next));const titles={H4:'H4 — tendance primaire & EMA20/50',H1:'H1 — tendance intermédiaire & structure',M15:'M15 — alignement, ADX & régime',M5:'M5 — impulsion, pullback, zones utiles & risque',M1:'M1 — micro-BOS/MSS, displacement & prix exécutable'};if(els.r03ChartTitle)els.r03ChartTitle.textContent=titles[next];r03Chart.setBars(state.r03Bars[next]??[]);r03Chart.setOverlays(state.r03Visuals[next]?.overlays??{});r03Chart.setStrategyOverlays(state.r03StrategyOverlays);if(state.quote)r03Chart.setQuote(state.quote);const hints={H4:'Contexte R03 : direction primaire et séparation EMA.',H1:'Contexte R03 : tendance H1 et structure à préserver.',M15:'Contexte R03 : alignement M15 et force directionnelle ADX.',M5:'Setup R03 : jambe impulsive, pullback faible, AVWAP/FVG/OB/breakout zone, SL/TP.',M1:'Trigger R03 : micro-BOS/MSS + displacement + retour du volume, puis entrée ASK/BID réellement exécutable.'};if(els.r03ChartHint)els.r03ChartHint.textContent=`${hints[next]} • RESEARCH SHADOW tant que le backtest canonique n’est pas figé.`;}
function updateR03IndicatorTags(result){if(!els.r03IndicatorTags)return;const map=new Map((result?.conditions??[]).map(c=>[c.id,c]));for(const tag of els.r03IndicatorTags.querySelectorAll('[data-condition]')){const c=map.get(tag.dataset.condition);tag.removeAttribute('data-pass');if(c?.passed)tag.dataset.pass='true';tag.title=c?`${c.label}${c.value?` — ${c.value}`:''}`:'En attente de données';}}

const SIGNAL_STORAGE_KEY='gold-live-analyzer-held-signals-v082';
const ROUTE_GROUPS=Object.freeze({
  R01:[
    {title:'STRUCTURE',ids:['key_liquidity','sweep_reclaim','failed_acceptance','entry_retest']},
    {title:'CONFIRMATION',ids:['micro_shift','momentum_flip','regime_adx','rr_min']},
    {title:'EXÉCUTION',ids:['data_ready','ny_window','risk_geometry','broker_quote','spread_safe','macro_safe']}
  ],
  R02:[
    {title:'STRUCTURE',ids:['balance','edge_pressure','h4_bias','character_change','acceptance','retest']},
    {title:'CONFIRMATION',ids:['m1_resume','direction_calibrated']},
    {title:'EXÉCUTION',ids:['data_ready','risk_geometry','broker_quote','spread_safe','macro_safe']}
  ],
  R03:[
    {title:'STRUCTURE',ids:['htf_trend','impulse','useful_zone','structure_intact']},
    {title:'CONFIRMATION',ids:['pullback_weak','pullback_depth','m1_resume']},
    {title:'EXÉCUTION',ids:['data_ready','entry_fresh','risk_geometry','broker_quote','spread_safe','macro_safe']}
  ]
});
const SHORT_LABELS=Object.freeze({
  data_ready:'Données suffisantes',key_liquidity:'Liquidité qualifiée',sweep_reclaim:'Sweep + reclaim',failed_acceptance:'Failed acceptance',micro_shift:'Shift M1',momentum_flip:'Displacement / FVG',regime_adx:'ADX compatible',ny_window:'Fenêtre NY',risk_geometry:'Risque SL valide',entry_retest:'Retest zone',broker_quote:'BID / ASK',spread_safe:'Spread',macro_safe:'Macro',rr_min:'R:R minimum',
  direction_calibrated:'BUY calibré',balance:'Balance H1',edge_pressure:'Pression bord haut',h4_bias:'Biais H4',character_change:'Breakout / character change',acceptance:'Acceptation M5',retest:'Retest frontière',m1_resume:'Reprise M1',entry_fresh:'Trigger M1 frais',
  htf_trend:'Tendance H4/H1/M15',impulse:'Impulsion M5',pullback_weak:'Pullback faible',pullback_depth:'Retracement',useful_zone:'Zone utile',structure_intact:'Structure intacte'
});
const ROUTE_TIMELINES=Object.freeze({
  R01:[
    {label:'Liquidité',ids:['key_liquidity'],hint:'niveau externe'},
    {label:'Sweep',ids:['sweep_reclaim','failed_acceptance'],hint:'reclaim propre'},
    {label:'Shift M1',ids:['micro_shift'],hint:'structure inverse'},
    {label:'Momentum',ids:['momentum_flip'],hint:'FVG / displacement'},
    {label:'Retest',ids:['entry_retest'],hint:'zone d’entrée'},
    {label:'Risque',ids:['risk_geometry','rr_min','spread_safe','macro_safe'],hint:'plan exécutable'},
    {label:'Trade',ids:[],hint:'100 % validé'}
  ],
  R02:[
    {label:'Balance H1',ids:['balance'],hint:'mature'},
    {label:'Pression',ids:['edge_pressure','h4_bias'],hint:'bord haut + H4'},
    {label:'Breakout',ids:['character_change','direction_calibrated'],hint:'BUY impulsif'},
    {label:'Acceptation',ids:['acceptance'],hint:'2 closes M5'},
    {label:'Retest',ids:['retest'],hint:'frontière tenue'},
    {label:'Reprise M1',ids:['m1_resume'],hint:'trigger'},
    {label:'Trade',ids:[],hint:'ASK exécutable'}
  ],
  R03:[
    {label:'Tendance HTF',ids:['htf_trend'],hint:'H4/H1/M15 alignés'},
    {label:'Impulsion',ids:['impulse'],hint:'jambe M5 qualifiée'},
    {label:'Pullback',ids:['pullback_weak','pullback_depth','structure_intact'],hint:'faible + profondeur valide + structure intacte'},
    {label:'Zone utile',ids:['useful_zone'],hint:'AVWAP / FVG / OB / breakout'},
    {label:'Reprise M1',ids:['m1_resume'],hint:'micro-BOS/MSS + énergie'},
    {label:'Risque',ids:['entry_fresh','risk_geometry','spread_safe','macro_safe'],hint:'trigger frais + plan viable'},
    {label:'Signal',ids:[],hint:'SHADOW ready'}
  ]
});

function loadSignalHolds(){
  try{const raw=localStorage.getItem(SIGNAL_STORAGE_KEY);if(!raw)return;const parsed=JSON.parse(raw);for(const id of ['R01','R02','R03'])if(isSignalHoldActive(parsed?.[id]))state.signalHolds[id]=parsed[id];}catch{}
}
function saveSignalHolds(){try{localStorage.setItem(SIGNAL_STORAGE_KEY,JSON.stringify(state.signalHolds));}catch{}}
function clearSignalHold(routeId){if(state.signalHolds[routeId]){state.signalHolds[routeId]=null;saveSignalHolds();}}
function terminalHeldSignal(hold,quote){
  if(!hold?.plan||!quote)return false;const p=hold.plan,d=String(hold.direction??'').toLowerCase();
  if(d==='buy'){const bid=Number(quote.bid);return Number.isFinite(bid)&&((hasNumber(p.stop)&&bid<=Number(p.stop))||(hasNumber(p.tp2?.price)&&bid>=Number(p.tp2.price)));}
  if(d==='sell'){const ask=Number(quote.ask);return Number.isFinite(ask)&&((hasNumber(p.stop)&&ask>=Number(p.stop))||(hasNumber(p.tp2?.price)&&ask<=Number(p.tp2.price)));}
  return false;
}
function currentSignalHold(routeId){const h=state.signalHolds[routeId];if(!isSignalHoldActive(h)||terminalHeldSignal(h,state.quote)){clearSignalHold(routeId);return null;}return h;}
function captureSignalIfNeeded(routeId,result,tradeReady){
  if(String(result?.stage??'').toUpperCase()==='INVALIDATED'){clearSignalHold(routeId);return null;}
  let hold=currentSignalHold(routeId);
  if(tradeReady&&shouldCaptureSignal(routeId,result,hold)){hold=createSignalHold(routeId,result);state.signalHolds[routeId]=hold;saveSignalHolds();log(routeId==='R03'?`${routeId} SHADOW mécaniquement prête : signal mémorisé 15 minutes.`:`${routeId} validée : signal mémorisé 15 minutes.`);}
  return hold;
}
function signalStatusText(hold,tradeReady){
  if(!hold)return'Aucun signal validé pour le moment.';
  const left=formatSignalCountdown(remainingSignalHoldMs(hold));
  return tradeReady?`✅ Signal validé • verrouillé encore ${left}`:`🔒 Signal mémorisé • fenêtre restante ${left} • plan original conservé`;
}
function stageUiState(stage,hold){
  if(hold)return heldState(stage,hold);
  const s=String(stage??'SEARCHING').toUpperCase();if(s==='ENTRY_READY')return{key:'ready',label:'TRADE VALIDÉ'};if(s==='INVALIDATED')return{key:'invalid',label:'SETUP INVALIDÉ'};if(s==='EXPIRED')return{key:'expired',label:'SETUP EXPIRÉ'};if(s==='SEARCHING')return{key:'searching',label:'RECHERCHE'};return{key:'building',label:'SETUP EN CONSTRUCTION'};
}
function heldState(stage,hold){return String(stage??'').toUpperCase()==='ENTRY_READY'?{key:'ready',label:'TRADE VALIDÉ'}:{key:'held',label:'SIGNAL MÉMORISÉ'};}
function conditionUiState(routeId,c,result){
  if(c?.required===false)return'info';if(c?.passed)return'passed';const stage=String(result?.stage??'SEARCHING').toUpperCase();
  if(stage==='INVALIDATED')return'pending';
  const hardByRoute={R01:['regime_adx','ny_window','risk_geometry','broker_quote','spread_safe','macro_safe','rr_min'],R02:['risk_geometry','broker_quote','spread_safe','macro_safe'],R03:['entry_fresh','risk_geometry','broker_quote','spread_safe','macro_safe']};
  const late=['CONFIRMED','ENTRY_READY'];
  if(late.includes(stage)&&(hardByRoute[routeId]??[]).includes(c?.id))return'blocked';
  return'pending';
}
function renderTechnicalConditions(container,result,routeId){
  if(!container)return;container.textContent='';for(const c of result?.conditions??[]){const ui=conditionUiState(routeId,c,result),row=document.createElement('div');row.className='strategy-condition';row.dataset.pass=String(Boolean(c.passed));row.dataset.required=String(c.required!==false);row.dataset.uiState=ui;row.dataset.condition=c.id;const icon=document.createElement('i');icon.textContent=ui==='passed'?'✓':ui==='blocked'?'×':ui==='info'?'i':'·';const body=document.createElement('div');const b=document.createElement('b');b.textContent=c.label??c.id;const small=document.createElement('small');small.textContent=c.value??c.note??'';body.append(b,small);row.append(icon,body);container.append(row);}
}
function renderConditionGroups(routeId,result,container){
  if(!container)return;container.textContent='';const map=new Map((result?.conditions??[]).map(c=>[c.id,c]));for(const g of ROUTE_GROUPS[routeId]??[]){const box=document.createElement('div');box.className='condition-group';const title=document.createElement('strong');title.textContent=g.title;const list=document.createElement('div');list.className='condition-group-list';for(const id of g.ids){const c=map.get(id);if(!c)continue;const ui=conditionUiState(routeId,c,result),row=document.createElement('div');row.className='quick-condition';row.dataset.state=ui;row.title=`${c.label}${c.value?` — ${c.value}`:''}`;const icon=document.createElement('i');icon.textContent=ui==='passed'?'✓':ui==='blocked'?'×':ui==='info'?'i':'·';const label=document.createElement('b');label.textContent=SHORT_LABELS[id]??c.label??id;row.append(icon,label);list.append(row);}box.append(title,list);container.append(box);}
}
function renderTimeline(routeId,result,container,tradeReady,hold){
  if(!container)return;container.textContent='';const map=new Map((result?.conditions??[]).map(c=>[c.id,c])),steps=ROUTE_TIMELINES[routeId]??[];let currentFound=false;
  for(let i=0;i<steps.length;i++){const step=steps[i],isTrade=i===steps.length-1;let passed=isTrade?Boolean(tradeReady||hold):step.ids.every(id=>Boolean(map.get(id)?.passed)),ui='pending';if(passed)ui='passed';else if(!currentFound){ui=String(result?.stage??'').toUpperCase()==='INVALIDATED'?'blocked':'current';currentFound=true;}const el=document.createElement('div');el.className='timeline-step';el.dataset.state=ui;const icon=document.createElement('i');icon.textContent=ui==='passed'?'✓':ui==='blocked'?'×':ui==='current'?'•':'·';const b=document.createElement('b');b.textContent=step.label;const small=document.createElement('small');small.textContent=step.hint;el.append(icon,b,small);container.append(el);}
}
function nextStepFor(routeId,result,tradeReady,hold){
  if(tradeReady)return'Plan validé : entrée / SL / TP disponibles ci-dessous.';if(hold)return`Signal mémorisé encore ${formatSignalCountdown(remainingSignalHoldMs(hold))} : vérifie le prix live avant prise.`;
  const map=new Map((result?.conditions??[]).map(c=>[c.id,c]));for(const step of ROUTE_TIMELINES[routeId]??[]){if(!step.ids.length)continue;if(!step.ids.every(id=>Boolean(map.get(id)?.passed)))return`${step.label} → ${step.hint}`;}return result?.reason??'Attente du prochain déclencheur.';
}
function renderOverview(routeId,result,ready,tradeReady,hold,nextStep){
  const prefix=routeId.toLowerCase(),ui=stageUiState(result?.stage,hold),stateEl=els[`${prefix}OverviewState`],biasEl=els[`${prefix}OverviewBias`],nextEl=els[`${prefix}OverviewNext`];
  if(stateEl){stateEl.textContent=ui.label;stateEl.dataset.state=ui.key;}
  const rawDir=String(result?.direction??'').toUpperCase();if(biasEl)biasEl.textContent=tradeReady||hold?`${String((hold?.direction??result?.direction)??'').toUpperCase()} ${routeId==='R03'?'shadow':'validé'}`:rawDir?`${rawDir} potentiel`:(routeId==='R02'?'BUY uniquement':'—');if(nextEl)nextEl.textContent=nextStep;
}
function applyRouteLayerMode(routeId){if(routeId==='R01')r01Chart.setFamilies(state.r01AdvancedLayers?R01_ADVANCED_FAMILIES:R01_SIMPLE_FAMILIES);else if(routeId==='R02')r02Chart.setFamilies(state.r02AdvancedLayers?R02_ADVANCED_FAMILIES:R02_SIMPLE_FAMILIES);else if(routeId==='R03')r03Chart.setFamilies(state.r03AdvancedLayers?R03_ADVANCED_FAMILIES:R03_SIMPLE_FAMILIES);}
function setAppView(view){state.appView=['strategies','market','diagnostic'].includes(view)?view:'strategies';document.body.dataset.appView=state.appView;document.querySelectorAll('[data-app-target]').forEach(b=>b.classList.toggle('active',b.dataset.appTarget===state.appView));requestAnimationFrame(()=>{if(state.appView==='market')chart.resize();if(state.appView==='strategies'){r01Chart.resize();r02Chart.resize();r03Chart.resize();}});}

function domPresentation(m={}){
  if(!m.depthAvailable)return{text:'—',status:'Market Depth indisponible',bias:'neutral'};
  const q=String(m.depthQuality??'collecting').toLowerCase();
  const counts=`BID ${Number(m.depthBidLevels??0)} / ASK ${Number(m.depthAskLevels??0)}`;
  if(!hasNumber(m.depthImbalance))return{text:'COLLECTE',status:`DOM ${q==='partial'?'PARTIEL':'EN COLLECTE'} • ${counts}`,bias:'neutral'};
  const x=Number(m.depthImbalance),pct=Math.abs(x*100).toFixed(0);
  if(Math.abs(x)<0.12)return{text:`NEUTRE ${pct}%`,status:`DOM NEUTRE ${pct}% • ${counts} • ${Number(m.orderFlowWalls??0)} walls`,bias:'neutral'};
  const side=x>0?'BID':'ASK';return{text:`${side} ${pct}%`,status:`DOM ${side} ${pct}% • ${counts} • ${Number(m.orderFlowWalls??0)} walls`,bias:x>0?'bullish':'bearish'};
}
function macroQualityLabel(q){return({'ok':'OK','partial':'PARTIEL','calendar-only':'CALENDRIER','unavailable':'INDISPONIBLE'})[String(q??'unavailable')]??String(q??'').toUpperCase();}
function resetMetrics(){for(const el of [els.trend,els.structure,els.rsi,els.atr,els.vwap,els.adr,els.fvg,els.ob,els.buyZone,els.sellZone,els.adx,els.dom,els.profile,els.macroRisk,els.autoFocusMetric])if(el)el.textContent='—';if(els.poiStatus)els.poiStatus.textContent='confluence OB + FVG • BUY — • SELL —';if(els.internalLiquidityStatus)els.internalLiquidityStatus.textContent='micro-swings non pris • —';if(els.fibStatus)els.fibStatus.textContent='swing confirmé • 23.6/38.2/50/61.8/78.6 • —';for(const el of [els.structureStatus,els.liquidityStatus,els.obStatus,els.fvgStatus,els.pdStatus,els.htfStatus,els.sessionsStatus,els.trendStatus,els.vwapStatus,els.avwapStatus,els.profileStatus,els.orderFlowStatus,els.adxStatus,els.volatilityStatus,els.macroStatus,els.rsiStatus,els.atrStatus])if(el)el.textContent=el.dataset.base??el.textContent.replace(/ • .*/, ' • —');}
function updateMetrics(m={}){
  els.trend.textContent=(m.trend??'neutral').toUpperCase(); els.trend.dataset.bias=m.trend??'neutral';
  els.structure.textContent=(m.structureBias??'neutral').toUpperCase(); els.structure.dataset.bias=m.structureBias??'neutral';
  els.rsi.textContent=fmt(m.rsi14,1); els.atr.textContent=fmt(m.atr14,2);
  els.vwap.textContent=Number.isFinite(m.close)&&Number.isFinite(m.vwap)?signed(m.close-m.vwap,2):'—';
  els.adr.textContent=Number.isFinite(m.adrUsed)?`${Math.round(m.adrUsed)}%`:'—';
  if(els.adx)els.adx.textContent=hasNumber(m.adx14)?`${Number(m.adx14).toFixed(1)} ${String(m.trendStrength??'').toUpperCase()}`:'—'; if(els.dom){const d=domPresentation(m);els.dom.textContent=d.text;els.dom.dataset.bias=d.bias;} if(els.profile)els.profile.textContent=hasNumber(m.profilePoc)?`POC ${Number(m.profilePoc).toFixed(2)}`:'—'; if(els.macroRisk){els.macroRisk.textContent=String(m.macroRisk??'—').toUpperCase();els.macroRisk.dataset.bias=['critical','high','elevated','watch'].includes(m.macroRisk)?'bearish':'neutral';}
  els.fvg.textContent=String(Number(m.activeFvgs??0)); els.ob.textContent=String(Number(m.activeOrderBlocks??0)); const buyZones=Number(m.activeBuyZones??0),sellZones=Number(m.activeSellZones??0); els.buyZone.textContent=String(buyZones); els.sellZone.textContent=String(sellZones); els.buyZone.dataset.bias=buyZones?'bullish':'neutral'; els.sellZone.dataset.bias=sellZones?'bearish':'neutral'; const buyCandidates=Number(m.buyCandidates??0),sellCandidates=Number(m.sellCandidates??0); if(els.poiStatus)els.poiStatus.textContent=`confirmées • BUY ${buyZones} • SELL ${sellZones}${buyCandidates||sellCandidates?` • candidates B${buyCandidates}/S${sellCandidates}`:''}`;
  if(els.structureStatus)els.structureStatus.textContent=`BOS / CHOCH / MSS • ${Number(m.structureEvents??0)} événements`; if(els.liquidityStatus)els.liquidityStatus.textContent=`EQ ${Number(m.equalLevels??0)} • sweeps ${Number(m.sweeps??0)}`; if(els.internalLiquidityStatus)els.internalLiquidityStatus.textContent=`micro-swings non pris • ${Number(m.internalLiquidityLevels??0)} niveaux`; if(els.fibStatus)els.fibStatus.textContent=m.fibonacciAvailable?`${String(m.fibonacciDirection??'neutral').toUpperCase()} • retracement ${hasNumber(m.fibonacciRetracement)?(Number(m.fibonacciRetracement)*100).toFixed(0)+'%':'—'}${m.fibonacciInsideOte?' • OTE':''}`:'aucun swing assez propre'; if(els.obStatus)els.obStatus.textContent=`${Number(m.displayedOrderBlocks??0)} affichés • ${Number(m.activeOrderBlocks??0)} actifs`; if(els.fvgStatus)els.fvgStatus.textContent=`FVG ${Number(m.displayedFvgs??0)} • iFVG ${Number(m.displayedIfvgs??0)}`; if(els.pdStatus)els.pdStatus.textContent=m.premiumDiscountAvailable?'EQ 50 % • actif':'EQ 50 % • non détecté'; if(els.htfStatus)els.htfStatus.textContent=`PDH/PDL/PWH/PWL + opens • ${Number(m.htfLevels??0)} niveaux`; if(els.sessionsStatus)els.sessionsStatus.textContent=`Asie / Londres / New York • ${Number(m.sessionRanges??0)} ranges`; if(els.trendStatus)els.trendStatus.textContent=`tendance • ${Number(m.emaSeries??0)}/3 EMA`; if(els.vwapStatus)els.vwapStatus.textContent=`pondéré volume broker • ${Number(m.vwapSeries??0)?'OK':'indisponible'}`; if(els.avwapStatus)els.avwapStatus.textContent=`ancrages dynamiques • ${Number(m.avwapSeries??0)} actifs`; if(els.profileStatus)els.profileStatus.textContent=m.profileAvailable?`POC ${fmt(m.profilePoc,2)} • VAH ${fmt(m.profileVah,2)} • VAL ${fmt(m.profileVal,2)}${hasNumber(m.volumeRatio)?` • vol ×${Number(m.volumeRatio).toFixed(2)}`:''}`:'tick-volume insuffisant'; if(els.orderFlowStatus)els.orderFlowStatus.textContent=domPresentation(m).status; if(els.adxStatus)els.adxStatus.textContent=hasNumber(m.adx14)?`ADX ${Number(m.adx14).toFixed(1)} • +DI ${fmt(m.plusDI,1)} / -DI ${fmt(m.minusDI,1)}`:'indisponible'; if(els.volatilityStatus)els.volatilityStatus.textContent=hasNumber(m.bandwidth)?`${String(m.volatilityState??'normal').toUpperCase()} • BBW ${Number(m.bandwidth).toFixed(3)} • p${Math.round((Number(m.bandwidthPercentile)||0)*100)}`:'indisponible'; if(els.macroStatus)els.macroStatus.textContent=m.macroAvailable?`${String(m.macroRisk??'normal').toUpperCase()} • ${String(m.macroBias??'neutral')} • DATA ${macroQualityLabel(m.macroQuality)}`:'sources macro indisponibles'; if(els.rsiStatus)els.rsiStatus.textContent=`oscillateur 30 / 50 / 70 • ${Number(m.rsiSeries??0)?'OK':'indisponible'}`; if(els.atrStatus)els.atrStatus.textContent=`volatilité • ${Number(m.atrSeries??0)?'OK':'indisponible'}`; if(els.macroDxy)els.macroDxy.textContent=hasNumber(m.dxy)?Number(m.dxy).toFixed(2):'N/A'; if(els.macroUs10y)els.macroUs10y.textContent=hasNumber(m.us10y)?`${Number(m.us10y).toFixed(2)}%`:'N/A'; if(els.macroReal10y)els.macroReal10y.textContent=hasNumber(m.real10y)?`${Number(m.real10y).toFixed(2)}%`:'N/A'; if(els.macroBias)els.macroBias.textContent=String(m.macroBias??'neutral').toUpperCase(); if(els.macroNext){const e=m.nextMacroEvent;els.macroNext.textContent=e?.type?`${e.type} • ${new Date(e.time).toLocaleString([], {day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})}`:'—';} if(els.autoFocusMetric)els.autoFocusMetric.textContent=m.autoFocus??'—';
}


function updateR01(result){
  if(!result){state.r01StrategyOverlays={zones:[],lines:[],markers:[]};r01Chart.setStrategyOverlays(state.r01StrategyOverlays);return;}
  state.lastResults.R01=result;
  const stage=String(result.stage??'SEARCHING').toUpperCase(),ready=readinessOf(result),plan=result.plan??null,level=plan?.keyLevel;
  setProgress('r01',ready);updateR01IndicatorTags(result);
  if(els.r01Stage){els.r01Stage.textContent=stage;els.r01Stage.dataset.stage=stage;}
  const tradeReady=Boolean(ready.allGreen&&stage==='ENTRY_READY'&&plan);
  const hold=captureSignalIfNeeded('R01',result,tradeReady),held=Boolean(hold&&!tradeReady),shownPlan=hold?.plan??(tradeReady?plan:null),ui=stageUiState(stage,hold);
  const dir=String(shownPlan?.direction??result.direction??'').toUpperCase();
  if(els.r01Direction){els.r01Direction.textContent=tradeReady||hold?(dir?`${dir} VALIDÉ`:'—'):(result.direction?`${String(result.direction).toUpperCase()} POTENTIEL`:'—');els.r01Direction.dataset.bias=(shownPlan?.direction??result.direction)==='buy'?'bullish':(shownPlan?.direction??result.direction)==='sell'?'bearish':'neutral';}
  if(els.r01Level)els.r01Level.textContent=(shownPlan?.keyLevel??level)?.price?`${(shownPlan?.keyLevel??level).label??'LEVEL'} ${Number((shownPlan?.keyLevel??level).price).toFixed(2)}`:'—';
  if(els.r01Entry)els.r01Entry.textContent=shownPlan?.entryZone?`${Number(shownPlan.entryZone.low).toFixed(2)}–${Number(shownPlan.entryZone.high).toFixed(2)}`:'—';
  if(els.r01RR)els.r01RR.textContent=hasNumber(shownPlan?.rr2)?Number(shownPlan.rr2).toFixed(2):'—';
  if(els.r01Reason)els.r01Reason.textContent=tradeReady?'Toutes les confirmations obligatoires sont validées.':held?'Le signal original reste affiché pendant sa fenêtre de prise.':(result.reason??'—');
  if(els.r01ScoreLabel)els.r01ScoreLabel.textContent='validations obligatoires';
  if(els.r01Decision){els.r01Decision.dataset.state=ui.key;const strong=els.r01Decision.querySelector('.decision-status strong')??els.r01Decision.querySelector('strong');if(strong)strong.textContent=ui.key==='ready'?`✅ TRADE VALIDÉ · ${dir}`:ui.key==='held'?`🔒 SIGNAL MÉMORISÉ · ${dir}`:ui.key==='invalid'?'⛔ SETUP INVALIDÉ':ui.key==='building'?'⏳ SETUP EN CONSTRUCTION':'○ RECHERCHE';}
  if(els.r01DecisionText){const missing=(result.conditions??[]).filter(c=>c.required!==false&&!c.passed).slice(0,3).map(c=>SHORT_LABELS[c.id]??c.label);els.r01DecisionText.textContent=tradeReady?'Plan R01 complet disponible ci-dessous.':held?`Le moteur a quitté le 100 %, mais le signal validé reste visible encore ${formatSignalCountdown(remainingSignalHoldMs(hold))}.`:stage==='INVALIDATED'||stage==='EXPIRED'?(result.reason??'Le setup n’est plus valide.'):(missing.length?`En attente : ${missing.join(' • ')}`:(result.reason??'Le moteur attend les confirmations R01.'));}
  const next=nextStepFor('R01',result,tradeReady,hold);if(els.r01NextStep)els.r01NextStep.textContent=next;
  renderOverview('R01',result,ready,tradeReady,hold,next);renderTimeline('R01',result,els.r01Timeline,tradeReady,hold);renderConditionGroups('R01',result,els.r01ConditionSummary);renderTechnicalConditions(els.r01Conditions,result,'R01');
  if(els.r01Ticket){els.r01Ticket.hidden=false;els.r01Ticket.dataset.ready=String(tradeReady);els.r01Ticket.dataset.held=String(held);}
  if(els.r01SignalStatus)els.r01SignalStatus.textContent=signalStatusText(hold,tradeReady);
  if(els.r01TicketSide)els.r01TicketSide.textContent=shownPlan?String(shownPlan.direction??'').toUpperCase():'—';
  if(els.r01TicketEntry)els.r01TicketEntry.textContent=shownPlan?fmt(shownPlan.entry,2):'—';
  if(els.r01TicketSL)els.r01TicketSL.textContent=shownPlan?fmt(shownPlan.stop,2):'—';
  if(els.r01TicketTP1)els.r01TicketTP1.textContent=shownPlan?fmt(shownPlan.tp1?.price,2):'—';
  if(els.r01TicketTP2)els.r01TicketTP2.textContent=shownPlan?fmt(shownPlan.tp2?.price,2):'—';
  if(els.r01TicketRR1)els.r01TicketRR1.textContent=shownPlan?fmt(shownPlan.rr1,2):'—';
  if(els.r01TicketRR2)els.r01TicketRR2.textContent=shownPlan?fmt(shownPlan.rr2,2):'—';
  if(els.r01StopLogic){const m=shownPlan?.stopMeta;els.r01StopLogic.textContent=m?`SL = extrême du sweep + buffer ${fmt(m.structuralBuffer,2)} (${m.atrBasis})${Number(m.spreadBuffer)>0?` + protection spread ${fmt(m.spreadBuffer,2)}`:''} • déclenchement broker ${m.triggerSide}.`:'Le plan apparaît uniquement après validation complète. Un signal validé est conservé 15 minutes.';}
  if(els.r01Plan){if(plan){els.r01Plan.hidden=false;const tp1=plan.tp1?.price?`${Number(plan.tp1.price).toFixed(2)} (${plan.tp1.label??''})`:'—',tp2=plan.tp2?.price?`${Number(plan.tp2.price).toFixed(2)} (${plan.tp2.label??''})`:'—',stop=hasNumber(plan.stop)?Number(plan.stop).toFixed(2):'—';els.r01Plan.innerHTML=`<b>${String(plan.direction??'').toUpperCase()} · ${stage}</b><br>Entrée ${fmt(plan.entry,2)} · SL ${stop} · TP1 ${tp1} · TP2 ${tp2}<br>${plan.invalidation??''}`;}else{els.r01Plan.hidden=true;els.r01Plan.textContent='';}}
  state.r01StrategyOverlays=hold?.overlays??result.overlays??{zones:[],lines:[],markers:[]};r01Chart.setStrategyOverlays(state.r01StrategyOverlays);
}

function updateR02(result){
  if(!result){state.r02StrategyOverlays={zones:[],lines:[],markers:[]};r02Chart.setStrategyOverlays(state.r02StrategyOverlays);return;}
  state.lastResults.R02=result;
  const stage=String(result.stage??'SEARCHING').toUpperCase(),plan=result.plan??null,ready=readinessOf(result);setProgress('r02',ready);updateR02IndicatorTags(result);
  if(els.r02Stage){els.r02Stage.textContent=stage;els.r02Stage.dataset.stage=stage;}
  const tradeReady=Boolean(ready.allGreen&&stage==='ENTRY_READY'&&plan);
  const hold=captureSignalIfNeeded('R02',result,tradeReady),held=Boolean(hold&&!tradeReady),shownPlan=hold?.plan??(tradeReady?plan:null),ui=stageUiState(stage,hold);
  const dir=String(shownPlan?.direction??result.direction??'buy').toUpperCase();
  if(els.r02Direction){els.r02Direction.textContent=tradeReady||hold?`${dir} VALIDÉ`:(result.direction?`${String(result.direction).toUpperCase()} POTENTIEL`:'BUY UNIQUEMENT');els.r02Direction.dataset.bias=(shownPlan?.direction??result.direction)==='buy'?'bullish':(shownPlan?.direction??result.direction)==='sell'?'bearish':'neutral';}
  if(els.r02Balance)els.r02Balance.textContent=shownPlan?.balance?`${Number(shownPlan.balance.lower).toFixed(2)}–${Number(shownPlan.balance.upper).toFixed(2)}`:'—';
  if(els.r02Entry)els.r02Entry.textContent=hasNumber(shownPlan?.entry)?`${Number(shownPlan.entry).toFixed(2)} ASK`:'—';
  if(els.r02RR)els.r02RR.textContent=hasNumber(shownPlan?.rr2)?`${Number(shownPlan.rr2).toFixed(2)}R`:'—';
  if(els.r02Reason)els.r02Reason.textContent=tradeReady?'Toutes les confirmations obligatoires sont validées.':held?'Le signal original reste affiché pendant sa fenêtre de prise.':(result.reason??'—');
  if(els.r02Decision){els.r02Decision.dataset.state=ui.key;const strong=els.r02Decision.querySelector('.decision-status strong')??els.r02Decision.querySelector('strong');if(strong)strong.textContent=ui.key==='ready'?`✅ TRADE VALIDÉ · ${dir}`:ui.key==='held'?`🔒 SIGNAL MÉMORISÉ · ${dir}`:ui.key==='invalid'?'⛔ SETUP INVALIDÉ':ui.key==='building'?'⏳ SETUP EN CONSTRUCTION':'○ RECHERCHE';}
  if(els.r02DecisionText){const missing=(result.conditions??[]).filter(c=>c.required!==false&&!c.passed).slice(0,3).map(c=>SHORT_LABELS[c.id]??c.label);els.r02DecisionText.textContent=tradeReady?'Plan R02 complet disponible ci-dessous.':held?`Le moteur a quitté le 100 %, mais le signal validé reste visible encore ${formatSignalCountdown(remainingSignalHoldMs(hold))}.`:stage==='INVALIDATED'||stage==='EXPIRED'?(result.reason??'Le setup n’est plus valide.'):(missing.length?`En attente : ${missing.join(' • ')}`:(result.reason??'Le moteur attend les confirmations R02.'));}
  const next=nextStepFor('R02',result,tradeReady,hold);if(els.r02NextStep)els.r02NextStep.textContent=next;
  renderOverview('R02',result,ready,tradeReady,hold,next);renderTimeline('R02',result,els.r02Timeline,tradeReady,hold);renderConditionGroups('R02',result,els.r02ConditionSummary);renderTechnicalConditions(els.r02Conditions,result,'R02');
  if(els.r02Ticket){els.r02Ticket.hidden=false;els.r02Ticket.dataset.ready=String(tradeReady);els.r02Ticket.dataset.held=String(held);}
  if(els.r02SignalStatus)els.r02SignalStatus.textContent=signalStatusText(hold,tradeReady);
  if(els.r02TicketSide)els.r02TicketSide.textContent=shownPlan?String(shownPlan.direction??'buy').toUpperCase():'—';
  if(els.r02TicketEntry)els.r02TicketEntry.textContent=shownPlan?fmt(shownPlan.entry,2):'—';
  if(els.r02TicketSL)els.r02TicketSL.textContent=shownPlan?fmt(shownPlan.stop,2):'—';
  if(els.r02TicketTP1)els.r02TicketTP1.textContent=shownPlan?fmt(shownPlan.tp1?.price,2):'—';
  if(els.r02TicketTP2)els.r02TicketTP2.textContent=shownPlan?fmt(shownPlan.tp2?.price,2):'—';
  if(els.r02TicketRisk)els.r02TicketRisk.textContent=shownPlan?`${fmt(shownPlan.riskAtr,2)} ATR`:'—';
  if(els.r02TicketSignal)els.r02TicketSignal.textContent=shownPlan?fmt(shownPlan.signalEntry,2):'—';
  if(els.r02StopLogic){const m=shownPlan?.entryMeta;els.r02StopLogic.textContent=m?`Signal M1 ${fmt(shownPlan.signalEntry,2)} • entrée ${m.executableSide} ${fmt(shownPlan.entry,2)} • SL déclenché par ${m.stopTriggerSide} • spread ${fmt(m.spread,2)}.`:'BUY : entrée sur ASK ; SL structurel déclenché sur BID. Un signal validé est conservé 15 minutes.';}
  if(els.r02Plan){if(plan){els.r02Plan.hidden=false;els.r02Plan.innerHTML=`<b>BUY · ${stage}</b><br>Signal M1 ${fmt(plan.signalEntry,2)} → ASK live ${fmt(plan.entry,2)} · SL ${fmt(plan.stop,2)}<br>TP1 ${fmt(plan.tp1?.price,2)} · TP2 ${fmt(plan.tp2?.price,2)} (${fmt(plan.rr2,2)}R) · measured ${fmt(plan.measuredMove,2)}${hasNumber(plan.measuredMoveR)?` (${fmt(plan.measuredMoveR,2)}R)`:''}`;}else{els.r02Plan.hidden=true;els.r02Plan.textContent='';}}
  state.r02StrategyOverlays=hold?.overlays??result.overlays??{zones:[],lines:[],markers:[]};r02Chart.setStrategyOverlays(state.r02StrategyOverlays);
}


function updateR03(result){
  if(!result){state.r03StrategyOverlays={zones:[],lines:[],markers:[]};r03Chart.setStrategyOverlays(state.r03StrategyOverlays);return;}
  state.lastResults.R03=result;
  const stage=String(result.stage??'SEARCHING').toUpperCase(),plan=result.plan??null,ready=readinessOf(result);setProgress('r03',ready);updateR03IndicatorTags(result);
  if(els.r03Stage){els.r03Stage.textContent=stage;els.r03Stage.dataset.stage=stage;}
  const mechanicallyReady=Boolean(ready.allGreen&&stage==='ENTRY_READY'&&plan);
  const hold=captureSignalIfNeeded('R03',result,mechanicallyReady),held=Boolean(hold&&!mechanicallyReady),shownPlan=hold?.plan??(mechanicallyReady?plan:null);
  const dir=String(shownPlan?.direction??result.direction??'').toUpperCase();
  if(els.r03Direction){els.r03Direction.textContent=mechanicallyReady||hold?(dir?`${dir} SHADOW`:'—'):(result.direction?`${String(result.direction).toUpperCase()} POTENTIEL`:'—');els.r03Direction.dataset.bias=(shownPlan?.direction??result.direction)==='buy'?'bullish':(shownPlan?.direction??result.direction)==='sell'?'bearish':'neutral';}
  const cMap=new Map((result.conditions??[]).map(c=>[c.id,c]));
  if(els.r03Trend)els.r03Trend.textContent=cMap.get('htf_trend')?.value??'—';
  if(els.r03Zone)els.r03Zone.textContent=shownPlan?.setup?.zones?.join(' + ')??cMap.get('useful_zone')?.value??'—';
  if(els.r03Entry)els.r03Entry.textContent=hasNumber(shownPlan?.entry)?`${fmt(shownPlan.entry,2)} ${String(shownPlan.direction).toLowerCase()==='buy'?'ASK':'BID'}`:'—';
  if(els.r03RR)els.r03RR.textContent=hasNumber(shownPlan?.rr2)?`${fmt(shownPlan.rr2,2)}R`:'—';
  if(els.r03Reason)els.r03Reason.textContent=mechanicallyReady?'Séquence complète mécaniquement validée. Signal conservé en SHADOW tant que le backtest canonique R03 n’est pas figé.':held?'Le signal SHADOW original reste affiché pendant sa fenêtre d’observation.':(result.reason??'—');
  if(els.r03Decision){let key='searching',label='○ RECHERCHE';if(stage==='INVALIDATED'){key='invalid';label='⛔ SETUP INVALIDÉ';}else if(stage==='EXPIRED'){key='expired';label='⌛ SETUP EXPIRÉ';}else if(mechanicallyReady){key='ready';label=`🧪 SIGNAL SHADOW · ${dir}`;}else if(hold){key='held';label=`🔒 SIGNAL SHADOW MÉMORISÉ · ${dir}`;}else if(stage!=='SEARCHING'){key='building';label='⏳ SETUP EN CONSTRUCTION';}els.r03Decision.dataset.state=key;const strong=els.r03Decision.querySelector('.decision-status strong')??els.r03Decision.querySelector('strong');if(strong)strong.textContent=label;}
  if(els.r03DecisionText){const missing=(result.conditions??[]).filter(c=>c.required!==false&&!c.passed).slice(0,3).map(c=>SHORT_LABELS[c.id]??c.label);els.r03DecisionText.textContent=mechanicallyReady?'Plan R03 complet détecté en SHADOW. Il n’est pas encore présenté comme stratégie historiquement calibrée.':held?`Le moteur a quitté le 100 %, mais le signal SHADOW reste visible encore ${formatSignalCountdown(remainingSignalHoldMs(hold))}.`:stage==='INVALIDATED'||stage==='EXPIRED'?(result.reason??'Le setup n’est plus valide.'):(missing.length?`En attente : ${missing.join(' • ')}`:(result.reason??'Le moteur attend les confirmations R03.'));}
  const next=nextStepFor('R03',result,mechanicallyReady,hold);if(els.r03NextStep)els.r03NextStep.textContent=mechanicallyReady?'SHADOW READY : observer le plan et le journaliser ; promotion live après calibration historique.':next;
  renderOverview('R03',result,ready,mechanicallyReady,hold,mechanicallyReady?'SHADOW READY · backtest canonique requis avant promotion':next);renderTimeline('R03',result,els.r03Timeline,mechanicallyReady,hold);renderConditionGroups('R03',result,els.r03ConditionSummary);renderTechnicalConditions(els.r03Conditions,result,'R03');
  if(els.r03OverviewState&&(mechanicallyReady||hold)){els.r03OverviewState.textContent=mechanicallyReady?'SHADOW READY':'SHADOW MÉMORISÉ';els.r03OverviewState.dataset.state=mechanicallyReady?'ready':'held';}
  if(els.r03Ticket){els.r03Ticket.hidden=false;els.r03Ticket.dataset.ready=String(mechanicallyReady);els.r03Ticket.dataset.held=String(held);}
  if(els.r03SignalStatus)els.r03SignalStatus.textContent=hold?`${mechanicallyReady?'🧪 Signal SHADOW détecté':'🔒 Signal SHADOW mémorisé'} • ${formatSignalCountdown(remainingSignalHoldMs(hold))} restantes`:'Aucun signal SHADOW complet pour le moment.';
  if(els.r03TicketSide)els.r03TicketSide.textContent=shownPlan?String(shownPlan.direction??'').toUpperCase():'—';
  if(els.r03TicketEntry)els.r03TicketEntry.textContent=shownPlan?fmt(shownPlan.entry,2):'—';
  if(els.r03TicketSL)els.r03TicketSL.textContent=shownPlan?fmt(shownPlan.stop,2):'—';
  if(els.r03TicketTP1)els.r03TicketTP1.textContent=shownPlan?fmt(shownPlan.tp1?.price,2):'—';
  if(els.r03TicketTP2)els.r03TicketTP2.textContent=shownPlan?fmt(shownPlan.tp2?.price,2):'—';
  if(els.r03TicketRisk)els.r03TicketRisk.textContent=shownPlan?`${fmt(shownPlan.riskAtr,2)} ATR`:'—';
  if(els.r03TicketSignal)els.r03TicketSignal.textContent=shownPlan?fmt(shownPlan.signalEntry,2):'—';
  if(els.r03StopLogic){const m=shownPlan?.stopMeta;const side=String(shownPlan?.direction??'').toLowerCase();els.r03StopLogic.textContent=m?`Entrée ${side==='buy'?'ASK':'BID'} ${fmt(shownPlan.entry,2)} • SL derrière l’extrême pullback ${fmt(m.structureExtreme,2)} + buffer ${fmt(m.structureBuffer,2)} M5${Number(m.spreadBuffer)>0?` + spread ${fmt(m.spreadBuffer,2)}`:''} • déclenchement ${m.triggerSide}. Stop jamais élargi pour sauver le setup.`:'SL derrière l’extrême réel du pullback + buffer ATR. Jamais élargi pour faire passer le filtre.';}
  if(els.r03Plan){if(plan){els.r03Plan.hidden=false;els.r03Plan.innerHTML=`<b>${String(plan.direction??'').toUpperCase()} · ${stage} · RESEARCH SHADOW</b><br>Signal M1 ${fmt(plan.signalEntry,2)} → ${String(plan.direction).toLowerCase()==='buy'?'ASK':'BID'} live ${fmt(plan.entry,2)} · SL ${fmt(plan.stop,2)} (${fmt(plan.riskAtr,2)} ATR)<br>TP1 ${fmt(plan.tp1?.price,2)} (${fmt(plan.rr1,2)}R · ${plan.tp1?.type==='PRIOR_TREND_EXTREME'?'structure':'continuation'}) · TP2 ${fmt(plan.tp2?.price,2)} (${fmt(plan.rr2,2)}R · ${plan.tp2?.type==='PRIOR_TREND_EXTREME'?'structure':'continuation'})<br>Pullback : vol ×${fmt(plan.setup?.volumeRatio,2)} • énergie ×${fmt(plan.setup?.energyRatio,2)} • zones ${plan.setup?.zones?.join(' + ')??'—'}`;}else{els.r03Plan.hidden=true;els.r03Plan.textContent='';}}
  state.r03StrategyOverlays=hold?.overlays??result.overlays??{zones:[],lines:[],markers:[]};r03Chart.setStrategyOverlays(state.r03StrategyOverlays);
}

function updateStrategyOverlays(results=[]){const out={zones:[],lines:[],markers:[]};for(const r of results){for(const k of ['zones','lines','markers'])out[k].push(...(r?.overlays?.[k]??[]));}chart.setStrategyOverlays(out);}

async function loadHealth(){try{const r=await fetch('/api/health',{cache:'no-store'}),data=await r.json();state.mode=data.mode;state.credentialsConfigured=Boolean(data.ctrader?.credentialsConfigured);chart.setMode(data.mode);els.mode.textContent=data.mode==='live'?'cTrader LIVE':'Simulation';els.strategies.textContent=String(data.strategies);els.exec.textContent=data.executionEnabled?'ACTIVÉ':'DÉSACTIVÉ';els.health.textContent=state.credentialsConfigured?'ID + Secret configurés':'ID / Secret manquants';}catch{els.health.textContent='Health check indisponible';log('Impossible de lire /api/health','error');}}
async function loadAuthStatus(){try{const r=await fetch('/api/auth/status',{cache:'no-store',credentials:'same-origin'}),data=await r.json();state.credentialsConfigured=Boolean(data.configured);setAuthUi(Boolean(data.connected));if(data.connected){els.oauthNote.textContent='Session OAuth cTrader active • lecture seule • renouvellement automatique.';log('Session cTrader OAuth détectée.');}else if(!data.configured)els.oauthNote.textContent='Configure l’ID et le Secret cTrader dans Vercel puis connecte le compte.';else els.oauthNote.textContent=`OAuth prêt. Redirect URI : ${data.redirectUri??'/api/auth/callback'}`;if(data.error)log(`OAuth: ${data.error}`,'error');return Boolean(data.connected);}catch{setAuthUi(false);log('Impossible de vérifier la session cTrader.','error');return false;}}

function buildLiveCandleFromQuote(q){if(!Number.isFinite(q?.bid))return;const step=TF_MS[state.timeframe]??TF_MS.M5,time=Math.floor(Number(q.timestamp??Date.now())/step)*step,last=chart.bars.at(-1);if(!last||time>last.time){const open=Number.isFinite(last?.close)?last.close:q.bid;chart.upsertBar({time,open,high:Math.max(open,q.bid),low:Math.min(open,q.bid),close:q.bid,volume:1});return;}if(time===last.time)chart.upsertBar({...last,high:Math.max(last.high,q.bid),low:Math.min(last.low,q.bid),close:q.bid,volume:Number(last.volume??0)+1});}
function buildR01LiveCandleFromQuote(q){if(!Number.isFinite(q?.bid))return;const tf=state.r01Timeframe,step=TF_MS[tf]??TF_MS.M5,time=Math.floor(Number(q.timestamp??Date.now())/step)*step,list=state.r01Bars[tf]??[],last=list.at(-1);let bar=null;if(!last||time>last.time){const open=Number.isFinite(last?.close)?last.close:q.bid;bar={time,open,high:Math.max(open,q.bid),low:Math.min(open,q.bid),close:q.bid,volume:1};}else if(time===last.time)bar={...last,high:Math.max(last.high,q.bid),low:Math.min(last.low,q.bid),close:q.bid,volume:Number(last.volume??0)+1};if(bar){state.r01Bars[tf]=upsertLocalBar(list,bar);r01Chart.upsertBar(bar);}}
function buildR02LiveCandleFromQuote(q){if(!Number.isFinite(q?.bid))return;const tf=state.r02Timeframe,step=TF_MS[tf]??TF_MS.M5,time=Math.floor(Number(q.timestamp??Date.now())/step)*step,list=state.r02Bars[tf]??[],last=list.at(-1);let bar=null;if(!last||time>last.time){const open=Number.isFinite(last?.close)?last.close:q.bid;bar={time,open,high:Math.max(open,q.bid),low:Math.min(open,q.bid),close:q.bid,volume:1};}else if(time===last.time)bar={...last,high:Math.max(last.high,q.bid),low:Math.min(last.low,q.bid),close:q.bid,volume:Number(last.volume??0)+1};if(bar){state.r02Bars[tf]=upsertLocalBar(list,bar);r02Chart.upsertBar(bar);}}
function buildR03LiveCandleFromQuote(q){if(!Number.isFinite(q?.bid))return;const tf=state.r03Timeframe,step=TF_MS[tf]??TF_MS.M5,time=Math.floor(Number(q.timestamp??Date.now())/step)*step,list=state.r03Bars[tf]??[],last=list.at(-1);let bar=null;if(!last||time>last.time){const open=Number.isFinite(last?.close)?last.close:q.bid;bar={time,open,high:Math.max(open,q.bid),low:Math.min(open,q.bid),close:q.bid,volume:1};}else if(time===last.time)bar={...last,high:Math.max(last.high,q.bid),low:Math.min(last.low,q.bid),close:q.bid,volume:Number(last.volume??0)+1};if(bar){state.r03Bars[tf]=upsertLocalBar(list,bar);r03Chart.upsertBar(bar);}}
function disconnectStream(){if(state.source)state.source.close();state.source=null;if(state.reconnectTimer)clearTimeout(state.reconnectTimer);state.reconnectTimer=null;}

function connect(){
  disconnectStream();state.fatalStreamError=false;if(state.mode!=='mock'&&!state.authConnected){setConnection('error','CTRADER NON CONNECTÉ');return;}
  setConnection('connecting','CONNEXION…');els.stage.textContent='Initialisation du flux';const es=new EventSource(`/api/stream?tf=${encodeURIComponent(state.timeframe)}`);state.source=es;
  es.addEventListener('open',()=>{state.reconnects=0;setConnection('live',state.mode==='live'?'CTRADER LIVE':'SIMULATION LIVE');});
  es.addEventListener('status',e=>{const d=JSON.parse(e.data);els.stage.textContent=d.message??d.stage;log(d.message??d.stage);if(d.symbolName){state.symbol=d.symbolName;els.symbol.textContent=d.symbolName;}});
  es.addEventListener('history',e=>{const d=JSON.parse(e.data);chart.setDigits(d.digits??2);chart.setBars(d.bars??[]);state.symbol=d.symbolName??state.symbol;els.symbol.textContent=state.symbol;els.chartHint.textContent=`${d.bars?.length??0} bougies • ${state.timeframe} • moteur visuel LIVE`;log(`Historique ${state.timeframe}: ${d.bars?.length??0} bougies reçues`);});
  es.addEventListener('visual',e=>{const d=JSON.parse(e.data);if(d.timeframe!==state.timeframe)return;chart.setOverlays(d.overlays??{});updateMetrics(d.metrics??{});state.lastAutoDisplay=d.display??null;if(state.autoLayers&&d.display?.families)applyFamilies(d.display.families,{auto:true});updateAutoUi(d.display??null);});
  es.addEventListener('strategy_history',e=>{try{const d=JSON.parse(e.data);if(d.strategyId==='R01'&&['M1','M5'].includes(d.timeframe)){state.r01Bars[d.timeframe]=[...(d.bars??[])].slice(-420);if(hasNumber(d.digits))r01Chart.setDigits(Number(d.digits));if(d.timeframe===state.r01Timeframe)r01Chart.setBars(state.r01Bars[d.timeframe]);}else if(d.strategyId==='R02'&&['M1','M5','H1'].includes(d.timeframe)){state.r02Bars[d.timeframe]=[...(d.bars??[])].slice(-420);if(hasNumber(d.digits))r02Chart.setDigits(Number(d.digits));if(d.timeframe===state.r02Timeframe)r02Chart.setBars(state.r02Bars[d.timeframe]);}else if(d.strategyId==='R03'&&['M1','M5','M15','H1','H4'].includes(d.timeframe)){state.r03Bars[d.timeframe]=[...(d.bars??[])].slice(-420);if(hasNumber(d.digits))r03Chart.setDigits(Number(d.digits));if(d.timeframe===state.r03Timeframe)r03Chart.setBars(state.r03Bars[d.timeframe]);}}catch(err){log(`Strategy history UI: ${err instanceof Error?err.message:String(err)}`,'error');}});
  es.addEventListener('strategy_bar',e=>{try{const d=JSON.parse(e.data);if(!d.bar)return;if(d.strategyId==='R01'&&['M1','M5'].includes(d.timeframe)){state.r01Bars[d.timeframe]=upsertLocalBar(state.r01Bars[d.timeframe],d.bar);if(d.timeframe===state.r01Timeframe)r01Chart.upsertBar(d.bar);}else if(d.strategyId==='R02'&&['M1','M5','H1'].includes(d.timeframe)){state.r02Bars[d.timeframe]=upsertLocalBar(state.r02Bars[d.timeframe],d.bar);if(d.timeframe===state.r02Timeframe)r02Chart.upsertBar(d.bar);}else if(d.strategyId==='R03'&&['M1','M5','M15','H1','H4'].includes(d.timeframe)){state.r03Bars[d.timeframe]=upsertLocalBar(state.r03Bars[d.timeframe],d.bar);if(d.timeframe===state.r03Timeframe)r03Chart.upsertBar(d.bar);}}catch(err){log(`Strategy bar UI: ${err instanceof Error?err.message:String(err)}`,'error');}});
  es.addEventListener('strategy_visual',e=>{try{const d=JSON.parse(e.data);if(d.strategyId==='R01'&&['M1','M5'].includes(d.timeframe)){state.r01Visuals[d.timeframe]={overlays:d.overlays??{},metrics:d.metrics??{}};if(d.timeframe===state.r01Timeframe)r01Chart.setOverlays(d.overlays??{});}else if(d.strategyId==='R02'&&['M1','M5','H1'].includes(d.timeframe)){state.r02Visuals[d.timeframe]={overlays:d.overlays??{},metrics:d.metrics??{}};if(d.timeframe===state.r02Timeframe)r02Chart.setOverlays(d.overlays??{});}else if(d.strategyId==='R03'&&['M1','M5','M15','H1','H4'].includes(d.timeframe)){state.r03Visuals[d.timeframe]={overlays:d.overlays??{},metrics:d.metrics??{}};if(d.timeframe===state.r03Timeframe)r03Chart.setOverlays(d.overlays??{});}}catch(err){log(`Strategy visual UI: ${err instanceof Error?err.message:String(err)}`,'error');}});
  es.addEventListener('analysis',e=>{try{const d=JSON.parse(e.data),results=d.results??[];const r1=results.find(x=>x.strategyId==='R01'),r2=results.find(x=>x.strategyId==='R02'),r3=results.find(x=>x.strategyId==='R03');if(r1)updateR01(r1);if(r2)updateR02(r2);if(r3)updateR03(r3);updateStrategyOverlays(results);}catch(err){log(`Strategies UI: ${err instanceof Error?err.message:String(err)}`,'error');}});
  es.addEventListener('depth',e=>{try{const d=JSON.parse(e.data);if(d?.available&&Math.abs(Number(d.imbalance)||0)>=0.35)log(`DOM ${Number(d.imbalance)>0?'BID':'ASK'} imbalance ${(Math.abs(Number(d.imbalance))*100).toFixed(0)}%`);}catch{}});
  es.addEventListener('macro',e=>{try{const d=JSON.parse(e.data);if(d?.nextEvent&&['critical','high'].includes(d.risk))log(`Macro ${d.risk.toUpperCase()} : ${d.nextEvent.type}`);}catch{}});
  es.addEventListener('quote',e=>{const d=JSON.parse(e.data);state.quote=d;chart.setQuote(d);r01Chart.setQuote(d);r02Chart.setQuote(d);r03Chart.setQuote(d);buildLiveCandleFromQuote(d);buildR01LiveCandleFromQuote(d);buildR02LiveCandleFromQuote(d);buildR03LiveCandleFromQuote(d);els.bid.textContent=fmt(d.bid,2);els.ask.textContent=fmt(d.ask,2);els.spread.textContent=fmt(d.spread,2);});
  es.addEventListener('bar',e=>{const d=JSON.parse(e.data);if(d.bar)chart.upsertBar(d.bar);});
  es.addEventListener('fatal',e=>{try{const d=JSON.parse(e.data);state.fatalStreamError=true;log(`${d.code}: ${d.description}`,'error');els.stage.textContent=d.description;setConnection('error','ERREUR CTRADER');es.close();state.source=null;}catch{}});
  es.onerror=()=>{if(state.fatalStreamError||(!state.authConnected&&state.mode!=='mock'))return;es.close();if(state.source===es)state.source=null;state.reconnects++;const delay=Math.min(10000,1500*Math.max(1,state.reconnects));setConnection('connecting','RECONNEXION…');els.stage.textContent=`Flux interrompu — nouvel essai dans ${Math.round(delay/1000)} s`;if(state.reconnectTimer)clearTimeout(state.reconnectTimer);state.reconnectTimer=setTimeout(()=>{state.reconnectTimer=null;if(state.authConnected||state.mode==='mock')connect();},delay);};
}

els.disconnect.addEventListener('click',async()=>{disconnectStream();try{await fetch('/api/auth/logout',{method:'POST',credentials:'same-origin'});}catch{}chart.setBars([]);chart.setOverlays({});chart.setStrategyOverlays({});state.r01Bars={M1:[],M5:[]};state.r01Visuals={M1:null,M5:null};r01Chart.setBars([]);r01Chart.setOverlays({});r01Chart.setStrategyOverlays({});state.r02Bars={M1:[],M5:[],H1:[]};state.r02Visuals={M1:null,M5:null,H1:null};r02Chart.setBars([]);r02Chart.setOverlays({});r02Chart.setStrategyOverlays({});state.r03Bars={M1:[],M5:[],M15:[],H1:[],H4:[]};state.r03Visuals={M1:null,M5:null,M15:null,H1:null,H4:null};r03Chart.setBars([]);r03Chart.setOverlays({});r03Chart.setStrategyOverlays({});resetMetrics();els.bid.textContent=els.ask.textContent=els.spread.textContent='—';setAuthUi(false);log('Session cTrader déconnectée.');});
document.querySelectorAll('[data-tf]').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('[data-tf]').forEach(b=>b.classList.remove('active'));btn.classList.add('active');state.timeframe=btn.dataset.tf;chart.setBars([]);chart.setOverlays({});chart.setStrategyOverlays({});resetMetrics();if(state.authConnected||state.mode==='mock')connect();}));
const familyInputs=[...document.querySelectorAll('[data-family]')];
const manualButtons=[$('#showAllLayers'),$('#hideAllLayers'),$('#cleanLayers')];
function syncFamilyInputs(){const current=chart.getFamilies();for(const input of familyInputs)input.checked=Boolean(current[input.dataset.family]);}
function applyFamilies(next,{auto=false}={}){chart.setFamilies(next);syncFamilyInputs();if(!auto&&!state.autoLayers)state.manualFamilies={...chart.getFamilies()};}
function updateAutoUi(display){
  const d=display??state.lastAutoDisplay; if(!d){els.autoFocus.textContent='Analyse du contexte…';els.autoReasons.textContent='Le moteur attend suffisamment de données.';els.autoCount.textContent='—';return;}
  els.autoFocus.textContent=d.focus??'LECTURE NEUTRE'; els.autoReasons.textContent=(d.reasons??[]).join(' • ')||'Aucun contexte secondaire suffisamment pertinent.'; els.autoCount.textContent=`${Number(d.visibleCount??0)} calques actifs`;
}
function setAutoMode(enabled){
  const next=Boolean(enabled),wasAuto=state.autoLayers; if(wasAuto&&!next)state.manualFamilies={...chart.getFamilies()}; state.autoLayers=next; els.autoMode.classList.toggle('active',state.autoLayers); els.manualMode.classList.toggle('active',!state.autoLayers);
  for(const input of familyInputs)input.disabled=state.autoLayers; for(const btn of manualButtons)btn.disabled=state.autoLayers;
  if(state.autoLayers){if(state.lastAutoDisplay?.families)applyFamilies(state.lastAutoDisplay.families,{auto:true});updateAutoUi(state.lastAutoDisplay);log('Mode visuel AUTO activé : les calques suivent le marché.');}
  else{applyFamilies(state.manualFamilies);els.autoCount.textContent='MANUEL';els.autoFocus.textContent='Affichage manuel';els.autoReasons.textContent='Les détecteurs continuent de tourner, mais les cases ne changent plus automatiquement.';log('Mode visuel MANUEL activé.');}
}
familyInputs.forEach(input=>input.addEventListener('change',()=>{if(state.autoLayers)return;applyFamilies({...chart.getFamilies(),[input.dataset.family]:input.checked});}));
els.autoMode.addEventListener('click',()=>setAutoMode(true)); els.manualMode.addEventListener('click',()=>setAutoMode(false));
$('#showAllLayers').addEventListener('click',e=>{e.preventDefault();if(!state.autoLayers)applyFamilies(allFamilies(true));});
$('#hideAllLayers').addEventListener('click',e=>{e.preventDefault();if(!state.autoLayers)applyFamilies(allFamilies(false));});
$('#cleanLayers').addEventListener('click',e=>{e.preventDefault();if(!state.autoLayers)applyFamilies(CLEAN_PRESET);});
applyFamilies(CLEAN_PRESET,{auto:true});setAutoMode(true);
$('#zoomIn').addEventListener('click',()=>chart.zoom(-10));$('#zoomOut').addEventListener('click',()=>chart.zoom(10));$('#resetView').addEventListener('click',()=>chart.resetView());
document.querySelectorAll('[data-r01-tf]').forEach(btn=>btn.addEventListener('click',()=>applyR01View(btn.dataset.r01Tf)));
document.querySelectorAll('[data-r02-tf]').forEach(btn=>btn.addEventListener('click',()=>applyR02View(btn.dataset.r02Tf)));
document.querySelectorAll('[data-r03-tf]').forEach(btn=>btn.addEventListener('click',()=>applyR03View(btn.dataset.r03Tf)));
document.querySelectorAll('[data-strategy-target]').forEach(btn=>btn.addEventListener('click',()=>{const target=btn.dataset.strategyTarget;document.querySelectorAll('[data-strategy-target]').forEach(x=>{const active=x===btn;x.classList.toggle('active',active);x.setAttribute('aria-selected',String(active));});document.querySelectorAll('[data-strategy-view]').forEach(panel=>{const active=panel.id===target;panel.hidden=!active;panel.classList.toggle('active',active);});if(target==='strategyPanel')requestAnimationFrame(()=>{r01Chart.resize();applyR01View(state.r01Timeframe);});if(target==='strategyPanelR02')requestAnimationFrame(()=>{r02Chart.resize();applyR02View(state.r02Timeframe);});if(target==='strategyPanelR03')requestAnimationFrame(()=>{r03Chart.resize();applyR03View(state.r03Timeframe);});}));
document.querySelectorAll('[data-app-target]').forEach(btn=>btn.addEventListener('click',()=>setAppView(btn.dataset.appTarget)));
document.querySelectorAll('[data-route-layers]').forEach(btn=>btn.addEventListener('click',()=>{const id=btn.dataset.routeLayers;if(id==='R01')state.r01AdvancedLayers=!state.r01AdvancedLayers;else if(id==='R02')state.r02AdvancedLayers=!state.r02AdvancedLayers;else if(id==='R03')state.r03AdvancedLayers=!state.r03AdvancedLayers;const active=id==='R01'?state.r01AdvancedLayers:id==='R02'?state.r02AdvancedLayers:state.r03AdvancedLayers;btn.setAttribute('aria-pressed',String(active));btn.textContent=active?'VUE SIMPLE':'CALQUES AVANCÉS';applyRouteLayerMode(id);if(id==='R01')applyR01View(state.r01Timeframe);else if(id==='R02')applyR02View(state.r02Timeframe);else if(id==='R03')applyR03View(state.r03Timeframe);}));
loadSignalHolds();setAppView('strategies');applyRouteLayerMode('R01');applyRouteLayerMode('R02');applyRouteLayerMode('R03');applyR01View('M5');applyR02View('M5');applyR03View('M5');
setInterval(()=>{for(const id of ['R01','R02','R03']){if(!state.signalHolds[id])continue;const was=state.signalHolds[id],active=currentSignalHold(id);if(state.lastResults[id]&&(active||was)){if(id==='R01')updateR01(state.lastResults[id]);else if(id==='R02')updateR02(state.lastResults[id]);else updateR03(state.lastResults[id]);}}},1000);

const params=new URLSearchParams(location.search),callbackState=params.get('ctrader'),callbackReason=params.get('reason');if(callbackState==='connected')log('Connexion cTrader autorisée avec succès.');if(callbackState==='error')log(`Échec connexion cTrader${callbackReason?` : ${callbackReason}`:''}`,'error');if(callbackState)history.replaceState({},'',location.pathname);
await loadHealth();const connected=await loadAuthStatus();if(connected||state.mode==='mock')connect();
