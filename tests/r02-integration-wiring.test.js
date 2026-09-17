import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { STRATEGIES } from '../strategies/index.js';
import { StrategyRuntime } from '../engine/strategy-runtime.js';
import { buildR02BuySnapshot } from './helpers/r02-fixture.js';

function ingestSnapshot(runtime,s){
  for(const tf of ['M1','M5','M15','M30','H1','H4']) runtime.ingest('history',{timeframe:tf,bars:s.bars[tf]??[]});
  runtime.ingest('quote',s.quote);
  if(s.depth) runtime.ingest('depth',s.depth);
  if(s.macro) runtime.ingest('macro',s.macro);
}

test('R02 is registered after R01, evaluates independently, and stays execution-free',()=>{
  assert.deepEqual(STRATEGIES.map(x=>x.id),['R01','R02','R03']);
  const runtime=new StrategyRuntime(STRATEGIES),s=buildR02BuySnapshot();
  ingestSnapshot(runtime,s);
  const out=runtime.evaluate('tick');
  const r02=out.find(x=>x.strategyId==='R02');
  assert.ok(r02,'R02 output must exist');
  assert.equal(r02.stage,'ENTRY_READY');
  assert.equal(r02.status,'validated');
  assert.equal(r02.direction,'buy');
  assert.equal(r02.plan.execution,null);
  const r01=out.find(x=>x.strategyId==='R01');
  assert.ok(r01,'R01 output must still exist');
  if(r01.plan) assert.equal(r01.plan.execution,null);
});

test('R02 frontend panel and overlay merge wiring are present',()=>{
  const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
  const app=fs.readFileSync(new URL('../assets/app.js',import.meta.url),'utf8');
  const chart=fs.readFileSync(new URL('../assets/chart.js',import.meta.url),'utf8');
  const stream=fs.readFileSync(new URL('../api/stream.js',import.meta.url),'utf8');
  for(const id of ['r02Stage','r02Direction','r02Conditions','r02Plan','r02Decision','r02Ticket','r02TicketEntry','r02TicketSL','r02TicketTP1','r02TicketTP2','r02Chart','r02IndicatorTags']) assert.match(html,new RegExp(`id=["']${id}["']`));
  assert.match(app,/updateR02\(/);
  assert.match(app,/updateStrategyOverlays\(/);
  assert.match(app,/setStrategyOverlays\(/);
  assert.match(chart,/setStrategyOverlays\(/);
  assert.match(app,/new GoldChart\(\$\('#r02Chart'\)\)/);
  assert.match(app,/applyR02View\(/);
  assert.match(app,/data-r02-tf/);
  assert.match(stream,/strategyId: 'R02'/);
  assert.match(stream,/\['M1','M5','H1'\]/);
});
