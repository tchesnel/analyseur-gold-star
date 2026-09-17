import test from 'node:test';
import assert from 'node:assert/strict';
import { StrategyRuntime } from '../engine/strategy-runtime.js';
import { R03_TREND_PULLBACK_CONTINUATION } from '../strategies/r03-trend-pullback-continuation.js';
import { buildR03BuySnapshot } from './helpers/r03-fixture.js';

function ingest(runtime,s){
  for(const tf of ['M1','M5','M15','M30','H1','H4']) runtime.ingest('history',{timeframe:tf,bars:s.bars[tf]??[]});
  runtime.ingest('quote',s.quote); if(s.macro)runtime.ingest('macro',s.macro); if(s.depth)runtime.ingest('depth',s.depth);
}

test('R03 promotion firewall remains SHADOW even on mechanically complete ENTRY_READY setup',()=>{
  const runtime=new StrategyRuntime([R03_TREND_PULLBACK_CONTINUATION]),s=buildR03BuySnapshot();ingest(runtime,s);
  const r=runtime.evaluate('tick')[0];
  assert.equal(r.stage,'ENTRY_READY');
  assert.equal(r.mode,'shadow');
  assert.equal(r.actionable,false);
  assert.equal(r.promotionGate,'XAUUSD_REPLAY_REQUIRED');
  assert.equal(r.plan.execution,null);
});
