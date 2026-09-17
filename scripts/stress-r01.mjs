import { R01_CONFIG, evaluateR01 } from '../strategies/r01-liquidity-sweep-reversal.js';
import { buildR01SellSnapshot, mirrorSnapshot } from '../tests/helpers/r01-fixture.js';

let seed=0xC0FFEE;
function rnd(){seed=(1664525*seed+1013904223)>>>0;return seed/2**32;}
function transformSnapshot(snapshot,scale,shift){
  const px=x=>Number.isFinite(Number(x))?Number(x)*scale+shift:x;
  const bar=b=>({...b,open:px(b.open),high:px(b.high),low:px(b.low),close:px(b.close),volume:b.volume*(0.85+rnd()*0.3)});
  const bars=Object.fromEntries(Object.entries(snapshot.bars).map(([tf,xs])=>[tf,xs.map(bar)]));
  const quote={...snapshot.quote,bid:px(snapshot.quote.bid),ask:px(snapshot.quote.ask),spread:Number(snapshot.quote.spread)*scale};
  const depth=snapshot.depth?{...snapshot.depth,bidLevels:snapshot.depth.bidLevels?.map(x=>({...x,price:px(x.price)})),askLevels:snapshot.depth.askLevels?.map(x=>({...x,price:px(x.price)})),bidWall:snapshot.depth.bidWall?{...snapshot.depth.bidWall,price:px(snapshot.depth.bidWall.price)}:null,askWall:snapshot.depth.askWall?{...snapshot.depth.askWall,price:px(snapshot.depth.askWall.price)}:null}:null;
  return{...snapshot,bars,quote,depth};
}
function finiteDeep(value){
  if(typeof value==='number')return Number.isFinite(value);
  if(!value||typeof value!=='object')return true;
  if(Array.isArray(value))return value.every(finiteDeep);
  return Object.values(value).every(finiteDeep);
}
function assert(cond,msg){if(!cond)throw new Error(msg);}

const FLOW_STRESS_CONFIG={...R01_CONFIG,maxAdxM5:101};
const scenarios=[
  {name:'sell-entry-ready',make:()=>buildR01SellSnapshot(),expect:'validated',stage:'ENTRY_READY'},
  {name:'buy-entry-ready',make:()=>mirrorSnapshot(buildR01SellSnapshot()),expect:'validated',stage:'ENTRY_READY'},
  {name:'delayed-reclaim',make:()=>{const s=buildR01SellSnapshot();s.bars.M5[112]={...s.bars.M5[112],close:110.18};return s;},expect:'validated',stage:'ENTRY_READY'},
  {name:'accepted-before-reclaim',make:()=>{const s=buildR01SellSnapshot();s.bars.M5[112]={...s.bars.M5[112],close:110.18};s.bars.M5[113]={...s.bars.M5[113],open:110.18,high:110.35,low:110.05,close:110.24};s.bars.M5[114]={...s.bars.M5[114],open:110.24,high:110.28,low:109.60,close:109.70};return s;},expect:'rejected',stage:'INVALIDATED'},
  {name:'accepted-beyond',make:()=>buildR01SellSnapshot({acceptance:true}),expect:'rejected',stage:'INVALIDATED'},
  {name:'macro-block',make:()=>buildR01SellSnapshot({macroRisk:'critical'}),expect:'watching',stage:'CONFIRMED'},
  {name:'no-dom',make:()=>buildR01SellSnapshot({depth:false,orderFlow:false}),expect:'validated',stage:'ENTRY_READY'},
  {name:'waiting-retest',make:()=>buildR01SellSnapshot({entry:false}),expect:'watching',stage:'CONFIRMED'}
];
const iterations=Math.max(1,Number(process.env.R01_STRESS_ITERATIONS)||100);
let total=0;
for(const sc of scenarios){
  for(let i=0;i<iterations;i++){
    const scale=0.65+rnd()*1.55,shift=-250+rnd()*500;
    const snap=transformSnapshot(sc.make(),scale,shift);
    const r=evaluateR01(snap,{trigger:'stress',config:FLOW_STRESS_CONFIG}); total++;
    assert(r.status===sc.expect,`${sc.name}: status ${r.status}`); assert(r.stage===sc.stage,`${sc.name}: stage ${r.stage}`);
    assert(finiteDeep(r),`${sc.name}: NaN/Infinity`); assert(r.plan?.execution!==true,`${sc.name}: execution primitive`);
    if(r.status==='validated'){
      assert(r.conditions.filter(c=>c.required!==false).every(c=>c.passed),`${sc.name}: validated with failed required condition`);
      assert(r.plan&&r.plan.execution===null,`${sc.name}: validated plan must be execution-null`);
      assert(Math.max(Number(r.plan.rr1??-Infinity),Number(r.plan.rr2??-Infinity))>=1.5,`${sc.name}: RR too low`);
      if(r.direction==='buy')assert(r.plan.stop<r.plan.entry,`${sc.name}: buy stop invalid`);else assert(r.plan.stop>r.plan.entry,`${sc.name}: sell stop invalid`);
    }
    if(sc.name==='accepted-beyond')assert(r.conditions.find(c=>c.id==='failed_acceptance')?.passed===false,`${sc.name}: acceptance condition incorrect`);
    if(sc.name==='accepted-before-reclaim')assert(/accepté les prix/i.test(String(r.reason)),`${sc.name}: wrong rejection reason`);
    if(sc.name==='macro-block')assert(r.conditions.find(c=>c.id==='macro_safe')?.passed===false,`${sc.name}: macro condition incorrect`);
  }
}
const production=evaluateR01(buildR01SellSnapshot(),{trigger:'stress-production'});
assert(production.stage==='CONFIRMED','production ADX guard should block ENTRY_READY on the high-ADX fixture');
assert(production.conditions.find(c=>c.id==='regime_adx')?.passed===false,'production ADX guard missing');
console.log(`R01_STRESS_OK — ${total+1} evaluations, ${scenarios.length} flow classes × ${iterations} + production calibration guard, 0 invariant failure.`);
