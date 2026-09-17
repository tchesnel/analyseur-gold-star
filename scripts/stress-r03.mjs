import assert from 'node:assert/strict';
import { evaluateR03 } from '../strategies/r03-trend-pullback-continuation.js';
import { buildR03BuySnapshot, buildR03SellSnapshot } from '../tests/helpers/r03-fixture.js';

const finite=n=>n===null||n===undefined||Number.isFinite(Number(n));
function shiftSnapshot(s,delta=0){
  const cp=structuredClone(s);
  for(const tf of Object.keys(cp.bars??{})) for(const b of cp.bars[tf]??[]) for(const k of ['open','high','low','close']) b[k]+=delta;
  for(const k of ['bid','ask']) if(Number.isFinite(cp.quote?.[k])) cp.quote[k]+=delta;
  return cp;
}
function dropRecentVolume(s){
  const cp=structuredClone(s);
  for(const tf of ['M1','M5']) for(const b of (cp.bars?.[tf]??[]).slice(tf==='M1'?-40:-30)) delete b.volume;
  return cp;
}
function inspect(r){
  assert.ok(['SEARCHING','DETECTED','ARMED','CONFIRMED','ENTRY_READY','EXPIRED','INVALIDATED'].includes(r.stage),r.stage);
  assert.ok(['idle','watching','rejected'].includes(r.status),r.status);
  assert.equal(r.researchContract?.status,'RESEARCH_SHADOW_GOLD_REPLAY_REQUIRED');
  assert.equal(r.researchContract?.execution,'READ_ONLY');
  if(r.stage==='ENTRY_READY') assert.ok(r.conditions.filter(c=>c.required!==false).every(c=>c.passed),'ENTRY_READY requires every mandatory condition');
  if(r.plan){
    assert.equal(r.plan.execution,null);
    for(const k of ['entry','stop','risk','riskAtr','entryExtensionAtr']) assert.ok(Number.isFinite(Number(r.plan[k])),`${k} finite`);
    assert.ok(r.plan.risk>0);assert.ok(r.plan.riskAtr>=.5&&r.plan.riskAtr<=2.0);
    if(r.direction==='buy'){assert.ok(r.plan.stop<r.plan.entry);assert.ok(r.plan.tp1.price>r.plan.entry);assert.ok(r.plan.tp2.price>r.plan.tp1.price);assert.ok(r.plan.rr1<=r.plan.rr2);assert.equal(r.plan.stopMeta.triggerSide,'BID');}
    if(r.direction==='sell'){assert.ok(r.plan.stop>r.plan.entry);assert.ok(r.plan.tp1.price<r.plan.entry);assert.ok(r.plan.tp2.price<r.plan.tp1.price);assert.ok(r.plan.rr1<=r.plan.rr2);assert.equal(r.plan.stopMeta.triggerSide,'ASK');assert.ok(r.plan.stopMeta.spreadBuffer>=0);}
  }
  for(const group of ['zones','lines','markers']) for(const x of r.overlays?.[group]??[]){
    for(const [k,v] of Object.entries(x)) if(['low','high','price','startTime','endTime','time'].includes(k)) assert.ok(finite(v),`${group}.${k} finite/null`);
    if(Number.isFinite(x.low)&&Number.isFinite(x.high)) assert.ok(x.low<=x.high,'zone never inverted');
  }
}

const scenarios=[
  ()=>buildR03BuySnapshot(),()=>buildR03SellSnapshot(),
  ()=>buildR03BuySnapshot({macroRisk:'critical'}),()=>buildR03SellSnapshot({macroRisk:'critical'}),
  ()=>buildR03BuySnapshot({wideSpread:true}),()=>buildR03SellSnapshot({wideSpread:true}),
  ()=>buildR03BuySnapshot({strongPullback:true}),()=>buildR03SellSnapshot({strongPullback:true}),
  ()=>buildR03BuySnapshot({noZone:true}),()=>buildR03SellSnapshot({noZone:true}),
  ()=>buildR03BuySnapshot({noConfirm:true}),()=>buildR03SellSnapshot({noConfirm:true}),
  ()=>buildR03BuySnapshot({breakStructure:true}),()=>buildR03SellSnapshot({breakStructure:true}),
  ()=>dropRecentVolume(buildR03BuySnapshot()),()=>dropRecentVolume(buildR03SellSnapshot())
];
let count=0;
for(let k=0;k<20;k++){
  const delta=(k-10)*43.25;
  for(const make of scenarios){inspect(evaluateR03(shiftSnapshot(make(),delta)));count++;}
}
console.log(`R03_STRESS_OK — ${count} évaluations BUY/SELL/scénarios, invariants, broker-side stops, research-shadow et execution=null.`);
