import assert from 'node:assert/strict';
import { evaluateR02 } from '../strategies/r02-balance-breakout-acceptance.js';
import { buildR02BuySnapshot } from '../tests/helpers/r02-fixture.js';

const finite=n=>n===null||n===undefined||Number.isFinite(Number(n));
function shiftSnapshot(s,delta=0){
  const cp=structuredClone(s);
  for(const tf of Object.keys(cp.bars)) for(const b of cp.bars[tf]) for(const k of ['open','high','low','close']) b[k]+=delta;
  for(const k of ['bid','ask']) if(Number.isFinite(cp.quote?.[k])) cp.quote[k]+=delta;
  return cp;
}
function mirrorSnapshot(s,pivot=250){
  const cp=structuredClone(s);
  for(const tf of Object.keys(cp.bars)) for(const b of cp.bars[tf]){
    const {open,high,low,close}=b;
    b.open=2*pivot-open; b.close=2*pivot-close; b.high=2*pivot-low; b.low=2*pivot-high;
  }
  if(Number.isFinite(cp.quote?.bid)&&Number.isFinite(cp.quote?.ask)){
    const bid=cp.quote.bid,ask=cp.quote.ask;
    cp.quote.bid=2*pivot-ask; cp.quote.ask=2*pivot-bid; cp.quote.spread=cp.quote.ask-cp.quote.bid;
  }
  return cp;
}
function inspectResult(r){
  assert.ok(['SEARCHING','DETECTED','ACCEPTED','RETEST','CONFIRMED','ENTRY_READY','INVALIDATED'].includes(r.stage));
  assert.ok(['idle','watching','validated','rejected'].includes(r.status));
  if(r.status==='validated') assert.ok(r.conditions.filter(c=>c.required!==false).every(c=>c.passed));
  if(r.plan){
    assert.equal(r.plan.execution,null);
    for(const k of ['entry','stop','risk','riskAtr']) assert.ok(Number.isFinite(Number(r.plan[k])),`${k} finite`);
    assert.ok(r.plan.risk>0);
    if(r.direction==='buy'){assert.ok(r.plan.stop<r.plan.entry);assert.ok(r.plan.tp2.price>r.plan.entry);}
    if(r.direction==='sell'){assert.ok(r.plan.stop>r.plan.entry);assert.ok(r.plan.tp2.price<r.plan.entry);}
  }
  for(const group of ['zones','lines','markers']) for(const x of r.overlays?.[group]??[]){
    for(const [k,v] of Object.entries(x)) if(['low','high','price','startTime','endTime','time'].includes(k)) assert.ok(finite(v),`${group}.${k} finite/null`);
    if(Number.isFinite(x.low)&&Number.isFinite(x.high)) assert.ok(x.low<=x.high,'zone never inverted');
  }
}

const classes=[
  ()=>buildR02BuySnapshot(),
  ()=>buildR02BuySnapshot({macroRisk:'critical'}),
  ()=>buildR02BuySnapshot({reenter:true}),
  ()=>buildR02BuySnapshot({weakVolume:true}),
];
let count=0;
for(let k=0;k<25;k++){
  const delta=(k-12)*37.5;
  for(const make of classes){
    const buy=shiftSnapshot(make(),delta); inspectResult(evaluateR02(buy));count++;
    const sell=mirrorSnapshot(buy,250+delta); inspectResult(evaluateR02(sell));count++;
  }
}
console.log(`R02_STRESS_OK — ${count} évaluations ciblées BUY/SELL, invariants, overlays et execution=null.`);
