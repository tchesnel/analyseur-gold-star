import test from 'node:test';
import assert from 'node:assert/strict';
import { StrategyRuntime } from '../engine/strategy-runtime.js';

test('broker cTrader dollar quote has priority over the slower FRED proxy refresh',()=>{
  const r=new StrategyRuntime([]);
  r.ingest('macro_quote',{dxy:{value:101.42,bid:101.41,ask:101.43,symbolName:'USDX',source:'ctrader'}});
  r.ingest('macro',{available:true,dxy:{value:119.8,change:-0.2,proxy:'FRED broad dollar index'},us10y:{value:4.12},risk:'normal',bias:'neutral'});
  const m=r.snapshot().macro;
  assert.equal(m.dxy.source,'ctrader');
  assert.equal(m.dxy.value,101.42);
  assert.equal(m.us10y.value,4.12);
});

test('FRED dollar proxy remains available when broker exposes no DXY/USDX symbol',()=>{
  const r=new StrategyRuntime([]);
  r.ingest('macro',{available:true,dxy:{value:119.8,change:-0.2,proxy:'FRED broad dollar index'},risk:'normal'});
  assert.equal(r.snapshot().macro.dxy.value,119.8);
});
