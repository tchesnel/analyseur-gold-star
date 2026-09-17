import test from 'node:test';
import assert from 'node:assert/strict';
import { R01_CONFIG, buildR01AuctionLiquidityBefore, buildR01KeyLiquidity, buildR01SessionLiquidityBefore, classifyFailedAcceptance, evaluateR01, findMicroStructureShift, findR01Sweep, r01EffortResultProxy } from '../strategies/r01-liquidity-sweep-reversal.js';
import { bar, buildR01SellSnapshot, mirrorSnapshot } from './helpers/r01-fixture.js';

const FLOW_TEST_CONFIG={...R01_CONFIG,maxAdxM5:101};

test('R01 identifies previous-day high as qualified external liquidity and detects the stop-run',()=>{
  const s=buildR01SellSnapshot(); const levels=buildR01KeyLiquidity(s,{barsM5:s.bars.M5});
  assert.ok(levels.some(x=>x.label==='PDH'&&x.side==='high'&&Math.abs(x.price-110)<1e-9));
  const sweep=findR01Sweep(s.bars.M5,levels); assert.ok(sweep); assert.equal(sweep.direction,'sell'); assert.equal(sweep.level.label,'PDH'); assert.ok(sweep.penetrationAtr>=0.05);
});

test('R01 failed auction requires reclaim and rejects two consecutive closes accepted beyond the swept level',()=>{
  const good=buildR01SellSnapshot(); const levels=buildR01KeyLiquidity(good,{barsM5:good.bars.M5}); const sweep=findR01Sweep(good.bars.M5,levels); const a=classifyFailedAcceptance(good.bars.M5,sweep);
  assert.equal(a.reclaimed,true); assert.equal(a.acceptedBeyond,false);
  const bad=buildR01SellSnapshot({acceptance:true}); const levels2=buildR01KeyLiquidity(bad,{barsM5:bad.bars.M5}); const sweep2=findR01Sweep(bad.bars.M5,levels2); const a2=classifyFailedAcceptance(bad.bars.M5,sweep2);
  assert.equal(a2.acceptedBeyond,true);
});

test('R01 requires a post-sweep micro structure shift; absorption proxy alone is never enough',()=>{
  const s=buildR01SellSnapshot(); const sweep=findR01Sweep(s.bars.M5,buildR01KeyLiquidity(s,{barsM5:s.bars.M5}));
  const shift=findMicroStructureShift(s.bars.M1,sweep); assert.ok(shift); assert.equal(shift.direction,'bearish');
  const effort=r01EffortResultProxy(s.bars.M5,sweep,s.depth); assert.equal(effort.passed,true);
});

test('R01 SELL reaches ENTRY_READY only after sweep → failed acceptance → M1 shift → momentum → retest',()=>{
  const r=evaluateR01(buildR01SellSnapshot(),{config:FLOW_TEST_CONFIG}); assert.equal(r.status,'validated'); assert.equal(r.stage,'ENTRY_READY'); assert.equal(r.direction,'sell');
  assert.ok(r.conditions.filter(c=>c.required!==false).every(c=>c.passed)); assert.equal(r.plan.execution,null); assert.ok(Math.max(r.plan.rr1??-Infinity,r.plan.rr2??-Infinity)>=1.5); assert.ok(r.plan.stop>r.plan.entry);
});

test('R01 BUY is symmetric and also reaches ENTRY_READY on mirrored market structure',()=>{
  const s=mirrorSnapshot(buildR01SellSnapshot()); const r=evaluateR01(s,{config:FLOW_TEST_CONFIG}); assert.equal(r.status,'validated'); assert.equal(r.stage,'ENTRY_READY'); assert.equal(r.direction,'buy');
  assert.ok(r.plan.stop<r.plan.entry);
  const upsideTargets=[r.plan.tp1?.price,r.plan.tp2?.price].filter(Number.isFinite);
  assert.ok(upsideTargets.length>=1);
  assert.ok(upsideTargets.some(price=>price>r.plan.entry));
});

test('R01 SELL stop uses M5 sweep ATR and adds one live spread because cTrader SELL SL triggers on ASK',()=>{
  const s=buildR01SellSnapshot();
  const r=evaluateR01(s,{config:FLOW_TEST_CONFIG});
  assert.equal(r.stage,'ENTRY_READY');
  assert.equal(r.plan.stopMeta.atrBasis,'M5_AT_SWEEP');
  assert.equal(r.plan.stopMeta.triggerSide,'ASK');
  assert.equal(r.plan.stopMeta.executableEntrySide,'BID');
  assert.ok(r.plan.stopMeta.atr>0);
  assert.ok(Math.abs(r.plan.stopMeta.spreadBuffer-s.quote.spread)<1e-12);
  const expected=r.plan.sweep.extreme+r.plan.stopMeta.structuralBuffer+r.plan.stopMeta.spreadBuffer;
  assert.ok(Math.abs(r.plan.stop-expected)<1e-9);
});

test('R01 SELL invalidation mirrors the broker trigger: ASK can hit SL while BID is still below it',()=>{
  const base=buildR01SellSnapshot();
  const first=evaluateR01(base,{config:FLOW_TEST_CONFIG});
  assert.equal(first.stage,'ENTRY_READY');
  const stop=first.plan.stop;
  const spread=base.quote.spread;
  const s={...base,quote:{...base.quote,bid:stop-spread/2,ask:stop+spread/2,spread}};
  const r=evaluateR01(s,{config:FLOW_TEST_CONFIG});
  assert.ok(s.quote.bid<stop,'le BID reste sous le SL affiché');
  assert.ok(s.quote.ask>=stop,'l ASK atteint le SL');
  assert.equal(r.stage,'INVALIDATED');
  assert.equal(r.status,'rejected');
});


test('R01 requires real cTrader BID/ASK and known spread before 100% readiness',()=>{
  const s=buildR01SellSnapshot();delete s.quote.ask;delete s.quote.spread;const r=evaluateR01(s,{config:FLOW_TEST_CONFIG});
  assert.notEqual(r.stage,'ENTRY_READY');assert.equal(r.conditions.find(x=>x.id==='broker_quote').passed,false);assert.equal(r.conditions.find(x=>x.id==='spread_safe').passed,false);assert.ok(r.readiness.percent<100);assert.equal(r.readiness.allGreen,false);
});
test('R01 readiness is 100% only when every mandatory condition is green and ENTRY_READY',()=>{
  const ready=evaluateR01(buildR01SellSnapshot(),{config:FLOW_TEST_CONFIG});
  assert.equal(ready.readiness.percent,100);
  assert.equal(ready.readiness.allGreen,true);
  assert.equal(ready.readiness.missing.length,0);
  const blocked=evaluateR01(buildR01SellSnapshot({macroRisk:'critical'}),{config:FLOW_TEST_CONFIG});
  assert.ok(blocked.readiness.percent<100);
  assert.equal(blocked.readiness.allGreen,false);
  assert.ok(blocked.readiness.missing.includes('macro_safe'));
});

test('R01 blocks new entry during HIGH/CRITICAL macro risk without invalidating the market pattern',()=>{
  const r=evaluateR01(buildR01SellSnapshot({macroRisk:'critical'}),{config:FLOW_TEST_CONFIG}); assert.equal(r.status,'watching'); assert.equal(r.stage,'CONFIRMED');
  assert.equal(r.conditions.find(c=>c.id==='macro_safe').passed,false); assert.equal(r.plan.execution,null);
});

test('R01 rejects the setup if auction accepts beyond the swept level',()=>{
  const r=evaluateR01(buildR01SellSnapshot({acceptance:true}),{config:FLOW_TEST_CONFIG}); assert.equal(r.status,'rejected'); assert.equal(r.stage,'INVALIDATED');
  assert.match(r.reason,/accepté les prix/i);
});

test('R01 can validate without broker DOM confirmation; order flow remains optional, never the trigger',()=>{
  const r=evaluateR01(buildR01SellSnapshot({depth:false,orderFlow:false}),{config:FLOW_TEST_CONFIG}); assert.equal(r.status,'validated');
  const c=r.conditions.find(x=>x.id==='effort_result_proxy'); assert.equal(c.required,false);
});

test('R01 excludes isolated M15 pivots after calibration and keeps H1 pivots causal',()=>{
  const H1=3_600_000,M15=900_000,M5=300_000,t=Date.UTC(2026,8,15);
  const b=(time,o,h,l,c,v=100)=>({time,open:o,high:h,low:l,close:c,volume:v});
  const m15=[]; for(let i=0;i<40;i++)m15.push(b(t+i*M15,100,i===10?105:100.3,99.7,100));
  const h1=[]; for(let i=0;i<30;i++)h1.push(b(t+i*H1,100,i===10?106:100.4,99.6,100));
  const filler=Array.from({length:220},(_,i)=>b(t+i*M5,100,100.2,99.8,100));
  const snapshot={bars:{M15:m15,H1:h1,M5:filler,H4:[]}};
  const levels=buildR01KeyLiquidity(snapshot,{barsM5:filler});
  assert.equal(levels.some(x=>x.source==='M15_PIVOT'),false,'un pivot M15 isolé ne doit plus être une liquidité R01');
  const pivot=levels.find(x=>x.source==='H1_PIVOT'&&Math.abs(x.price-106)<1e-9);
  assert.ok(pivot);
  assert.equal(pivot.time,t+13*H1);
  const before=filler.map(x=>({...x}));
  before[120]=b(t+120*M5,105.8,106.5,105.7,105.9,200);
  const early=findR01Sweep(before,[pivot]);
  assert.notEqual(early?.level?.source,'H1_PIVOT');
  const after=filler.map(x=>({...x}));
  after[214]=b(t+214*M5,105.8,106.5,105.7,105.9,200);
  const valid=findR01Sweep(after,[pivot]);
  assert.equal(valid?.level?.source,'H1_PIVOT');
});

test('R01 Volume Profile liquidity is snapshotted strictly before the sweep bar',()=>{
  const M5=300_000,t=Date.UTC(2026,8,15); const bars=[];let p=100;
  for(let i=0;i<80;i++){const c=100+Math.sin(i/3)*0.03;bars.push({time:t+i*M5,open:p,high:Math.max(p,c)+0.08,low:Math.min(p,c)-0.08,close:c,volume:100});p=c;}
  bars[79]={time:t+79*M5,open:100,high:100.55,low:99.85,close:99.95,volume:250};
  const levels=buildR01AuctionLiquidityBefore(bars,79,0.2);
  assert.equal(levels.length,2);
  assert.ok(levels.every(x=>x.source==='VOLUME_PROFILE_PRE'));
  assert.ok(levels.every(x=>Number(x.time)<Number(bars[79].time)));
  const sweep=findR01Sweep(bars,[]);
  assert.ok(sweep);
  assert.ok(Number(sweep.level.time)<Number(sweep.time));
});


test('R01 snapshots session highs/lows strictly before the candidate bar and can use them as external liquidity',()=>{
  const M5=300_000,t=Date.UTC(2026,8,15,0,0); // 08:00 Singapore = Asia session open
  const bars=[];
  for(let i=0;i<46;i++)bars.push(bar(t+i*M5,100,100.20,99.80,100,100));
  bars[45]=bar(t+45*M5,100.05,100.48,100.02,100.10,240);
  const levels=buildR01SessionLiquidityBefore(bars,45,0.40);
  const asiaH=levels.find(x=>x.label==='ASIA H');
  const asiaL=levels.find(x=>x.label==='ASIA L');
  assert.ok(asiaH); assert.ok(asiaL);
  assert.equal(asiaH.price,100.20); assert.equal(asiaL.price,99.80);
  assert.ok(Number(asiaH.time)<Number(bars[45].time));
  const sweep=findR01Sweep(bars,[]);
  assert.ok(sweep);
  assert.equal(sweep.direction,'sell');
  assert.equal(sweep.level.source,'SESSION_PRE');
  assert.equal(sweep.level.label,'ASIA H');
});

test('R01 allows a short causal reclaim window instead of requiring the sweep and reclaim in the same M5 candle',()=>{
  const s=buildR01SellSnapshot();
  // First M5 closes beyond PDH after triggering stops; the next M5 reclaims it.
  s.bars.M5[112]={...s.bars.M5[112],close:110.18};
  const levels=buildR01KeyLiquidity(s,{barsM5:s.bars.M5});
  const sweep=findR01Sweep(s.bars.M5,levels);
  assert.ok(sweep);
  assert.equal(sweep.level.label,'PDH');
  assert.equal(sweep.index,112);
  assert.equal(sweep.reclaimIndex,113);
  assert.ok(Number(sweep.reclaimTime)>Number(sweep.time));
  const shift=findMicroStructureShift(s.bars.M1,sweep);
  assert.ok(shift);
  assert.ok(Number(shift.time)>=Number(sweep.reclaimTime),'le shift ne doit jamais précéder le reclaim confirmé');
  const r=evaluateR01(s,{config:FLOW_TEST_CONFIG});
  assert.equal(r.stage,'ENTRY_READY');
  assert.equal(r.status,'validated');
});

test('R01 UI condition always reports the liquidity level of the active sweep, not an unrelated newer probe',()=>{
  const s=buildR01SellSnapshot();
  s.bars.M5[112]={...s.bars.M5[112],close:110.18};
  const r=evaluateR01(s,{config:FLOW_TEST_CONFIG});
  const key=r.conditions.find(c=>c.id==='key_liquidity');
  assert.match(String(key.value),/^PDH @ 110\.00$/);
  assert.equal(r.plan.keyLevel.label,'PDH');
});

test('R01 calibrated ADX guard blocks a high-trend fixture under the production threshold',()=>{
  const r=evaluateR01(buildR01SellSnapshot());
  assert.equal(r.conditions.find(c=>c.id==='regime_adx').passed,false);
  assert.notEqual(r.stage,'ENTRY_READY');
});

test('R01 calibrated NY window blocks an otherwise valid setup outside 08:20–16:00 New York',()=>{
  const s=buildR01SellSnapshot();
  const cfg={...FLOW_TEST_CONFIG,nyWindowStartMinutes:9*60,nyWindowEndMinutes:16*60};
  const r=evaluateR01(s,{config:cfg});
  assert.equal(r.conditions.find(c=>c.id==='ny_window').passed,false);
  assert.notEqual(r.stage,'ENTRY_READY');
});

test('R01 calibrated risk geometry rejects stops tighter than the configured ATR floor',()=>{
  const s=buildR01SellSnapshot();
  const cfg={...FLOW_TEST_CONFIG,minRiskAtrM5:1.20};
  const r=evaluateR01(s,{config:cfg});
  assert.equal(r.conditions.find(c=>c.id==='risk_geometry').passed,false);
  assert.notEqual(r.stage,'ENTRY_READY');
});

test('R01 rejects a breakout that achieves two accepted M5 closes beyond liquidity before any reclaim',()=>{
  const s=buildR01SellSnapshot();
  s.bars.M5[112]={...s.bars.M5[112],close:110.18};
  s.bars.M5[113]={...s.bars.M5[113],open:110.18,high:110.35,low:110.05,close:110.24};
  s.bars.M5[114]={...s.bars.M5[114],open:110.24,high:110.28,low:109.60,close:109.70};
  const r=evaluateR01(s,{config:FLOW_TEST_CONFIG});
  assert.equal(r.stage,'INVALIDATED');
  assert.equal(r.status,'rejected');
  assert.match(r.reason,/accepté les prix/i);
  assert.equal(r.plan,null);
});
