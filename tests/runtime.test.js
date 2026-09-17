import test from 'node:test';
import assert from 'node:assert/strict';
import { StrategyRuntime, validateResult } from '../engine/strategy-runtime.js';

test('runtime stores histories independently per timeframe',()=>{
  const r=new StrategyRuntime([]); r.ingest('history',{timeframe:'M5',bars:[{time:1,close:1}]}); r.ingest('history',{timeframe:'H1',bars:[{time:2,close:2}]});
  assert.equal(r.snapshot().bars.M5.length,1); assert.equal(r.snapshot().bars.H1.length,1); assert.equal(r.snapshot().bars.M15.length,0);
});

test('runtime upserts current bars',()=>{
  const r=new StrategyRuntime([]); r.ingest('bar',{timeframe:'M5',bar:{time:1,close:1}}); r.ingest('bar',{timeframe:'M5',bar:{time:1,close:2}}); assert.equal(r.snapshot().bars.M5.length,1); assert.equal(r.snapshot().bars.M5[0].close,2);
});

test('validated setup cannot contain mandatory failed condition',()=>{
  assert.throws(()=>validateResult('R01',{status:'validated',conditions:[{id:'c1',passed:false,required:true}]}));
});
