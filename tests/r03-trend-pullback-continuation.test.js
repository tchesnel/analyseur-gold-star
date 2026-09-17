import test from 'node:test';
import assert from 'node:assert/strict';
import {R03_CONFIG,r03TrendBias,r03VolumeHealth,findR03Pullback,findR03M1Confirmation,evaluateR03} from '../strategies/r03-trend-pullback-continuation.js';
import {buildR03BuySnapshot,buildR03SellSnapshot} from './helpers/r03-fixture.js';

test('R03 research parameters are explicit and stop is capped structurally',()=>{
  assert.deepEqual(R03_CONFIG.allowDirections,['buy','sell']);
  assert.equal(R03_CONFIG.maxPullbackVolumeRatio,.88);assert.equal(R03_CONFIG.maxPullbackEnergyRatio,.90);
  assert.equal(R03_CONFIG.maxRiskAtrM5,2);assert.equal(R03_CONFIG.stopBufferAtrM5,.15);assert.equal(R03_CONFIG.tp2RewardRisk,2);assert.equal(R03_CONFIG.entryFreshMinutes,5);
  assert.deepEqual(R03_CONFIG.blockMacroRisks,['high','critical']);
});

test('R03 requires H4/H1/M15 directional alignment and trend strength',()=>{
  const s=buildR03BuySnapshot(),b=r03TrendBias(s,s.quote.timestamp);assert.equal(b.direction,'buy');assert.equal(b.ready,true);assert.ok(b.adxM15>=R03_CONFIG.minContextAdxM15);
});

test('R03 detects a lower-volume lower-energy pullback into a useful zone',()=>{
  const s=buildR03BuySnapshot(),p=findR03Pullback(s);assert.ok(p);assert.equal(p.direction,'buy');assert.ok(p.volumeRatio<=R03_CONFIG.maxPullbackVolumeRatio);assert.ok(p.energyRatio<=R03_CONFIG.maxPullbackEnergyRatio);assert.ok(p.touchedZones.length>=1);assert.equal(p.structureBroken,false);
});

test('R03 rejects a countertrend leg that behaves like an adverse impulse',()=>{
  const p=findR03Pullback(buildR03BuySnapshot({strongPullback:true}));assert.equal(p,null);
  const broken=findR03Pullback(buildR03BuySnapshot({breakStructure:true}));assert.equal(broken,null);
});

test('R03 preserves invalidation state instead of falling silently back to DETECTED',()=>{
  for(const make of [buildR03BuySnapshot,buildR03SellSnapshot]){
    const strong=evaluateR03(make({strongPullback:true}));
    assert.equal(strong.stage,'INVALIDATED');
    assert.equal(strong.status,'rejected');
    assert.equal(strong.invalidation?.reason,'PULLBACK_NOT_WEAK');
    assert.match(strong.reason,/pullback n’est plus faible/i);
    assert.equal(strong.conditions.find(c=>c.id==='pullback_weak').passed,false);
    assert.equal(strong.conditions.find(c=>c.id==='pullback_depth').passed,true);
    assert.equal(strong.conditions.find(c=>c.id==='structure_intact').passed,true);
    assert.match(strong.overlays.markers.find(m=>m.kind==='r03_pullback')?.label??'',/INVALIDÉ/);
    assert.equal(strong.plan,null);

    const broken=evaluateR03(make({breakStructure:true}));
    assert.equal(broken.stage,'INVALIDATED');
    assert.equal(broken.invalidation?.reason,'STRUCTURE_BROKEN');
    assert.match(broken.reason,/cassé l’origine structurelle/i);
    assert.equal(broken.conditions.find(c=>c.id==='structure_intact').passed,false);
    assert.match(broken.overlays.markers.find(m=>m.kind==='r03_pullback')?.label??'',/STRUCTURE_BROKEN/);
    assert.equal(broken.plan,null);
  }
});

test('R03 does not invent an invalidation when the pullback simply has not reached a useful zone',()=>{
  for(const make of [buildR03BuySnapshot,buildR03SellSnapshot]){
    const r=evaluateR03(make({noZone:true}));
    assert.equal(r.stage,'DETECTED');
    assert.equal(r.invalidation,null);
    assert.notEqual(r.status,'rejected');
  }
});

test('R03 explicitly invalidates an over-deep retracement while keeping structure semantics truthful',()=>{
  const buy=buildR03BuySnapshot();
  buy.bars.M5.at(-1).low=101.8;buy.bars.M5.at(-1).close=102.2;
  const rb=evaluateR03(buy);
  assert.equal(rb.stage,'INVALIDATED');
  assert.equal(rb.invalidation?.reason,'RETRACE_TOO_DEEP');
  assert.equal(rb.conditions.find(c=>c.id==='pullback_depth').passed,false);
  assert.equal(rb.conditions.find(c=>c.id==='structure_intact').passed,true);

  const sell=buildR03SellSnapshot();
  sell.bars.M5.at(-1).high=118.2;sell.bars.M5.at(-1).close=117.8;
  const rs=evaluateR03(sell);
  assert.equal(rs.stage,'INVALIDATED');
  assert.equal(rs.invalidation?.reason,'RETRACE_TOO_DEEP');
  assert.equal(rs.conditions.find(c=>c.id==='pullback_depth').passed,false);
  assert.equal(rs.conditions.find(c=>c.id==='structure_intact').passed,true);
});

test('R03 does not arm without AVWAP/FVG/OB/breakout interaction',()=>{assert.equal(findR03Pullback(buildR03BuySnapshot({noZone:true})),null);});

test('R03 requires completed M1 micro BOS + displacement + renewed volume',()=>{
  const s=buildR03BuySnapshot(),p=findR03Pullback(s),c=findR03M1Confirmation(s.bars.M1,p);assert.ok(c);assert.match(c.type,/BOS/);assert.ok(c.displacement>=R03_CONFIG.minM1DisplacementAtr);assert.ok(c.volumeRatio>=R03_CONFIG.minM1VolumeRatio);
  const n=buildR03BuySnapshot({noConfirm:true}),pn=findR03Pullback(n);assert.equal(findR03M1Confirmation(n.bars.M1,pn),null);
});

test('R03 BUY uses ASK entry, BID stop trigger and never executes automatically',()=>{
  const s=buildR03BuySnapshot(),r=evaluateR03(s);assert.equal(r.stage,'ENTRY_READY');assert.equal(r.status,'watching');assert.equal(r.direction,'buy');assert.equal(r.plan.entry,s.quote.ask);assert.equal(r.plan.stopMeta.triggerSide,'BID');assert.equal(r.plan.execution,null);assert.ok(r.plan.stop<r.plan.entry);assert.ok(r.plan.tp1.price>r.plan.entry);assert.ok(r.plan.tp2.price>r.plan.entry);assert.equal(r.researchContract.execution,'READ_ONLY');
});

test('R03 SELL uses BID entry and ASK-aware structural stop with spread buffer',()=>{
  const s=buildR03SellSnapshot(),r=evaluateR03(s);assert.equal(r.stage,'ENTRY_READY');assert.equal(r.status,'watching');assert.equal(r.direction,'sell');assert.equal(r.plan.entry,s.quote.bid);assert.equal(r.plan.stopMeta.triggerSide,'ASK');assert.ok(r.plan.stopMeta.spreadBuffer>0);assert.ok(r.plan.stop>r.plan.entry);assert.equal(r.plan.execution,null);
});

test('R03 blocks broker readiness on unsafe spread or macro event without inventing a trade',()=>{
  const spread=evaluateR03(buildR03BuySnapshot({wideSpread:true}));assert.notEqual(spread.stage,'ENTRY_READY');assert.equal(spread.conditions.find(c=>c.id==='spread_safe').passed,false);
  const macro=evaluateR03(buildR03BuySnapshot({macroRisk:'critical'}));assert.notEqual(macro.stage,'ENTRY_READY');assert.equal(macro.conditions.find(c=>c.id==='macro_safe').passed,false);
});

test('R03 cannot show 100% without real BID/ASK',()=>{
  const s=buildR03BuySnapshot();delete s.quote.ask;delete s.quote.spread;const r=evaluateR03(s);assert.equal(r.conditions.find(c=>c.id==='broker_quote').passed,false);assert.ok(r.readiness.percent<100);assert.equal(r.readiness.allGreen,false);
});

test('R03 DOM is bonus only, never a mandatory trigger',()=>{
  const r=evaluateR03(buildR03BuySnapshot());const c=r.conditions.find(x=>x.id==='dom_bonus');assert.ok(c);assert.equal(c.required,false);assert.equal(c.passed,false);assert.equal(r.readiness.allGreen,true);
});

test('R03 is truthfully marked research until canonical historical replay is rerun',()=>{
  const r=evaluateR03(buildR03BuySnapshot());assert.equal(r.researchContract.status,'RESEARCH_SHADOW_GOLD_REPLAY_REQUIRED');assert.match(r.researchContract.calibration,/research candidates/i);
});


test('R03 data readiness does not double-count broker quote availability',()=>{
  const s=buildR03BuySnapshot();delete s.quote.ask;delete s.quote.spread;const r=evaluateR03(s);
  assert.equal(r.conditions.find(c=>c.id==='data_ready').passed,true);
  assert.equal(r.conditions.find(c=>c.id==='broker_quote').passed,false);
});

test('R03 old M1 trigger cannot resurrect an ENTRY_READY signal',()=>{
  const s=buildR03BuySnapshot();s.quote.timestamp+=8*60_000;s.now=s.quote.timestamp;const r=evaluateR03(s);
  assert.equal(r.stage,'EXPIRED');
  assert.match(r.reason,/trigger M1/i);
  assert.equal(r.conditions.find(c=>c.id==='entry_fresh').passed,false);
  assert.equal(r.readiness.allGreen,false);
});


test('R03 fails closed when recent M1/M5 volume feed is missing instead of coercing missing volume to zero',()=>{
  const s=buildR03BuySnapshot();
  for(const tf of ['M1','M5']) for(const b of s.bars[tf].slice(tf==='M1'?-40:-30)) delete b.volume;
  const vh=r03VolumeHealth(s,s.quote.timestamp),r=evaluateR03(s);
  assert.equal(vh.usable,false);
  assert.equal(r.conditions.find(c=>c.id==='volume_feed').passed,false);
  assert.equal(r.conditions.find(c=>c.id==='volume_feed').value,'VOLUME_FEED_MISSING');
  assert.equal(r.plan,null);
  assert.notEqual(r.stage,'ENTRY_READY');
  assert.match(r.reason,/VOLUME_FEED_MISSING/);
});

test('R03 ignores incomplete future M1/M5 bars and cannot look ahead',()=>{
  const a=buildR03BuySnapshot(),base=evaluateR03(a);
  const b=structuredClone(a),t=b.quote.timestamp;
  b.bars.M1.push({time:t,open:9999,high:12000,low:1,close:2,volume:999999});
  b.bars.M5.push({time:t,open:9999,high:12000,low:1,close:2,volume:999999});
  const mutated=evaluateR03(b);
  assert.equal(mutated.stage,base.stage);
  assert.equal(mutated.direction,base.direction);
  assert.equal(mutated.plan?.entry,base.plan?.entry);
  assert.equal(mutated.plan?.stop,base.plan?.stop);
  assert.equal(mutated.plan?.tp1?.price,base.plan?.tp1?.price);
  assert.equal(mutated.plan?.tp2?.price,base.plan?.tp2?.price);
});

test('R03 never widens a structural stop to force risk geometry through',()=>{
  const s=buildR03BuySnapshot();
  s.quote.bid+=50;s.quote.ask+=50;
  const r=evaluateR03(s);
  assert.equal(r.plan,null);
  assert.equal(r.conditions.find(c=>c.id==='risk_geometry').passed,false);
  assert.notEqual(r.stage,'ENTRY_READY');
});

test('R03 SELL invalidation follows ASK, not chart-side BID',()=>{
  const s=buildR03SellSnapshot(),base=evaluateR03(s);assert.ok(base.plan);
  const spread=s.quote.ask-s.quote.bid;
  s.quote.ask=base.plan.stop+.01;s.quote.bid=s.quote.ask-spread;
  const r=evaluateR03(s);
  assert.equal(r.stage,'INVALIDATED');
});

test('R03 BUY invalidation follows BID',()=>{
  const s=buildR03BuySnapshot(),base=evaluateR03(s);assert.ok(base.plan);
  const spread=s.quote.ask-s.quote.bid;
  s.quote.bid=base.plan.stop-.01;s.quote.ask=s.quote.bid+spread;
  const r=evaluateR03(s);
  assert.equal(r.stage,'INVALIDATED');
});

test('R03 target chronology is always TP1 then TP2 even when structural extreme is beyond 2R',()=>{
  const buy=buildR03BuySnapshot(),baseBuy=evaluateR03(buy);assert.ok(baseBuy.plan);
  const farBuy=structuredClone(buy);
  // Move the prior trend extreme much farther without changing the stop thesis.
  // buildR03Plan is exercised indirectly by adjusting the detected impulse pivot via price history.
  for(const b of farBuy.bars.M5.slice(-14,-10)){b.high+=20;b.close+=Math.min(10,20);}
  const rb=evaluateR03(farBuy);
  if(rb.plan){assert.ok(rb.plan.tp1.price<rb.plan.tp2.price);assert.ok(rb.plan.rr1<=rb.plan.rr2);}
  assert.ok(baseBuy.plan.tp1.price<baseBuy.plan.tp2.price);

  const sell=buildR03SellSnapshot(),rs=evaluateR03(sell);assert.ok(rs.plan);
  assert.ok(rs.plan.tp1.price>rs.plan.tp2.price);assert.ok(rs.plan.rr1<=rs.plan.rr2);
});
