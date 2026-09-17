import test from 'node:test';
import assert from 'node:assert/strict';
import {R02_CONFIG,buildR02Balance,r02H4Bias,findR02Breakout,classifyR02Acceptance,findR02Retest,findR02M1Resume,evaluateR02} from '../strategies/r02-balance-breakout-acceptance.js';
import {buildR02BuySnapshot,buildR02SellSnapshot} from './helpers/r02-fixture.js';

const EVENT=Date.parse('2026-09-15T14:00:00Z');
const M1=60_000;

test('R02 final BUY-only calibrated parameters are pinned',()=>{
  assert.deepEqual(R02_CONFIG.allowDirections,['buy']);
  assert.equal(R02_CONFIG.balanceHours,60);assert.equal(R02_CONFIG.maxBalanceEfficiency,.32);assert.equal(R02_CONFIG.minBalanceWidthAtrH1,4);assert.equal(R02_CONFIG.maxBalanceWidthAtrH1,12);
  assert.equal(R02_CONFIG.edgePressureLookbackH1,6);assert.equal(R02_CONFIG.minEdgePressureCloses,5);assert.equal(R02_CONFIG.edgeZoneFraction,.35);
  assert.equal(R02_CONFIG.minBreakPenetrationAtrM5,.10);assert.equal(R02_CONFIG.minBreakRangeAtrM5,1.30);assert.equal(R02_CONFIG.minBreakVolumeRatio,1.20);
  assert.equal(R02_CONFIG.adxRiseBarsM5,5);assert.equal(R02_CONFIG.minAdxRiseM5,1.0);
  assert.equal(R02_CONFIG.acceptanceBufferAtrM5,.08);assert.equal(R02_CONFIG.acceptanceConsecutiveCloses,2);assert.equal(R02_CONFIG.acceptanceMaxBars,4);
  assert.equal(R02_CONFIG.retestMaxBars,12);assert.equal(R02_CONFIG.retestBandAtrM5,.35);assert.equal(R02_CONFIG.rearmInsideBars,6);
  assert.equal(R02_CONFIG.minRiskAtrM5,.5);assert.equal(R02_CONFIG.maxRiskAtrM5,3);assert.equal(R02_CONFIG.minRewardRisk,2.25);
  assert.equal(R02_CONFIG.minM1ResumeDisplacementAtr,1.10);assert.equal(R02_CONFIG.resumeMaxMinutes,20);
  assert.equal('breakoutSessionStartMinute' in R02_CONFIG,false);
  assert.deepEqual(R02_CONFIG.blockMacroRisks,['high','critical']);
});

test('R02 builds a completed 60h H1 balance with >=5/6 BUY edge pressure and bullish H4 bias',()=>{
  const s=buildR02BuySnapshot(),b=buildR02Balance(s,EVENT),bias=r02H4Bias(s,EVENT);
  assert.ok(b?.qualified);assert.equal(b.bars,60);assert.ok(b.widthAtr>=4&&b.widthAtr<=12);assert.ok(b.efficiency<=.32);assert.ok(b.buyPressureCloses>=5);assert.equal(b.pressureBars,6);assert.equal(bias.direction,'buy');
});

test('R02 rejects balance without sufficient BUY edge pressure',()=>{
  const s=buildR02BuySnapshot({lowPressure:true});const b=buildR02Balance(s,EVENT);assert.ok(b?.qualified);assert.ok(b.buyPressureCloses<5);assert.equal(findR02Breakout(s),null);
});

test('R02 rejects BUY breakout against H4 bias',()=>{assert.equal(findR02Breakout(buildR02BuySnapshot({bearishH4:true})),null);});

test('R02 requires character change: range, volume and ADX acceleration',()=>{
  const s=buildR02BuySnapshot(),brk=findR02Breakout(s);assert.ok(brk);assert.equal(brk.direction,'buy');assert.ok(brk.rangeRatio>=1.3);assert.ok(brk.volumeRatio>=1.2);assert.ok(brk.adxRise>=1);assert.ok(brk.pressureCloses>=5);
  assert.equal(findR02Breakout(buildR02BuySnapshot({weakVolume:true})),null);
  assert.equal(findR02Breakout(s,{config:{...R02_CONFIG,minAdxRiseM5:99}}),null);
  assert.equal(findR02Breakout(s,{config:{...R02_CONFIG,minBreakRangeAtrM5:99}}),null);
});

test('R02 never uses an unclosed M5 breakout candle',()=>{
  const s=buildR02BuySnapshot();s.quote.timestamp=EVENT+2*M1;s.now=s.quote.timestamp;assert.equal(findR02Breakout(s),null);
});

test('R02 requires two-close acceptance then the first held retest',()=>{
  const s=buildR02BuySnapshot(),brk=findR02Breakout(s),a=classifyR02Acceptance(s.bars.M5,brk),r=findR02Retest(s.bars.M5,brk,a);
  assert.equal(a.accepted,true);assert.equal(a.invalidated,false);assert.ok(r&&!r.invalidated);assert.equal(r.time,EVENT+10*60_000);
});

test('R02 rejects immediate re-entry inside the old balance',()=>{
  const r=evaluateR02(buildR02BuySnapshot({reenter:true}));assert.equal(r.status,'rejected');assert.equal(r.stage,'INVALIDATED');
});

test('R02 M1 resume uses only completed M1 bars',()=>{
  const s=buildR02BuySnapshot(),brk=findR02Breakout(s),a=classifyR02Acceptance(s.bars.M5,brk),r=findR02Retest(s.bars.M5,brk,a);
  const before=structuredClone(s);before.quote.timestamp=EVENT+15*60_000+30_000;before.now=before.quote.timestamp;
  assert.equal(findR02M1Resume(before.bars.M1,{...r,marketNow:before.quote.timestamp},'buy'),null);
  const full=findR02M1Resume(s.bars.M1,r,'buy');assert.ok(full);assert.equal(full.type,'M1_RESUME_BUY');
});

test('R02 reaches ENTRY_READY with fixed 2.25R plan and execution=null',()=>{
  const r=evaluateR02(buildR02BuySnapshot());assert.equal(r.status,'validated');assert.equal(r.stage,'ENTRY_READY');assert.equal(r.direction,'buy');assert.equal(r.plan.execution,null);assert.equal(r.plan.rr2,2.25);assert.equal(r.plan.tp2.label,'2.25R');assert.ok(r.plan.stop<r.plan.entry&&r.plan.tp2.price>r.plan.entry);
  assert.ok(r.conditions.filter(x=>x.required!==false).every(x=>x.passed));
});

test('R02 LIVE entry uses executable ASK while keeping the M1 resume close as audit reference',()=>{
  const s=buildR02BuySnapshot(),r=evaluateR02(s);
  assert.equal(r.stage,'ENTRY_READY');assert.equal(r.plan.entry,s.quote.ask);
  assert.equal(r.plan.entryMeta.executableSide,'ASK');assert.equal(r.plan.entryMeta.stopTriggerSide,'BID');
  assert.equal(r.plan.signalEntry,r.plan.resume.price);assert.ok(r.plan.entry>r.plan.signalEntry);
  assert.ok(r.plan.stop<r.plan.entry);assert.equal(r.plan.rr2,2.25);
});

test('R02 does not chase a breakout when the live ASK makes risk exceed the calibrated 3 ATR ceiling',()=>{
  const s=buildR02BuySnapshot(),a=evaluateR02(s);const shifted=structuredClone(s);shifted.quote.bid+=7;shifted.quote.ask+=7;const b=evaluateR02(shifted);
  assert.equal(a.stage,'ENTRY_READY');assert.equal(b.stage,'CONFIRMED');
  assert.equal(b.conditions.find(x=>x.id==='risk_geometry').passed,false);
  assert.ok(b.plan.riskAtr>R02_CONFIG.maxRiskAtrM5);
  assert.equal(b.plan.entry,shifted.quote.ask);assert.equal(b.plan.stop,a.plan.stop);
});

test('R02 target 2.25R is calibration metadata, not a fake mandatory readiness filter',()=>{
  const r=evaluateR02(buildR02BuySnapshot());const c=r.conditions.find(x=>x.id==='target_calibration');
  assert.ok(c);assert.equal(c.required,false);assert.equal(r.readiness.percent,100);assert.equal(r.readiness.allGreen,true);
});

test('R02 requires a real cTrader BID/ASK and a known spread before 100% readiness',()=>{
  const s=buildR02BuySnapshot();delete s.quote.ask;delete s.quote.spread;const r=evaluateR02(s);
  assert.notEqual(r.stage,'ENTRY_READY');assert.equal(r.conditions.find(x=>x.id==='broker_quote').passed,false);assert.equal(r.conditions.find(x=>x.id==='spread_safe').passed,false);assert.ok(r.readiness.percent<100);assert.equal(r.readiness.allGreen,false);
});

test('R02 BUY invalidation uses broker trade-side stop trigger: BID <= SL',()=>{
  const base=buildR02BuySnapshot(),ready=evaluateR02(base);assert.equal(ready.stage,'ENTRY_READY');
  const spread=base.quote.spread,stop=ready.plan.stop;const s=structuredClone(base);s.quote.bid=stop;s.quote.ask=stop+spread;s.quote.spread=spread;
  const r=evaluateR02(s);assert.equal(r.stage,'INVALIDATED');assert.equal(r.status,'rejected');
});

test('R02 SELL branch is intentionally disabled after negative out-of-sample calibration',()=>{
  const sell=buildR02SellSnapshot();const brk=findR02Breakout(sell);const r=evaluateR02(sell);
  assert.equal(brk,null);assert.notEqual(r.status,'validated');assert.notEqual(r.stage,'ENTRY_READY');assert.equal(r.plan,null);assert.match(r.researchContract.calibration,/SELL branch disabled/);
});

test('R02 macro HIGH/CRITICAL blocks new entry without fabricating invalidation',()=>{
  const r=evaluateR02(buildR02BuySnapshot({macroRisk:'critical'}));assert.equal(r.status,'watching');assert.equal(r.stage,'CONFIRMED');assert.equal(r.conditions.find(x=>x.id==='macro_safe').passed,false);assert.equal(r.plan.execution,null);
});
