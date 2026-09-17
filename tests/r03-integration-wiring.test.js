import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { STRATEGIES } from '../strategies/index.js';
import { StrategyRuntime } from '../engine/strategy-runtime.js';
import { buildR03BuySnapshot } from './helpers/r03-fixture.js';

function ingestSnapshot(runtime,s){
  for(const tf of ['M1','M5','M15','M30','H1','H4']) runtime.ingest('history',{timeframe:tf,bars:s.bars[tf]??[]});
  runtime.ingest('quote',s.quote);
  if(s.depth) runtime.ingest('depth',s.depth);
  if(s.macro) runtime.ingest('macro',s.macro);
}

test('R03 is third, independent, research-shadow and execution-free in StrategyRuntime',()=>{
  assert.deepEqual(STRATEGIES.map(x=>x.id),['R01','R02','R03']);
  const runtime=new StrategyRuntime(STRATEGIES),s=buildR03BuySnapshot();
  ingestSnapshot(runtime,s);
  const out=runtime.evaluate('tick'),r03=out.find(x=>x.strategyId==='R03');
  assert.ok(r03);assert.equal(r03.stage,'ENTRY_READY');assert.equal(r03.status,'watching');
  assert.equal(r03.researchContract.status,'RESEARCH_SHADOW_GOLD_REPLAY_REQUIRED');
  assert.equal(r03.mode,'shadow');
  assert.equal(r03.promotionGate,'XAUUSD_REPLAY_REQUIRED');
  assert.equal(r03.actionable,false);
  assert.equal(r03.plan.execution,null);
  for(const route of out) if(route.plan) assert.equal(route.plan.execution,null);
});

test('R03 cockpit, five autonomous timeframes and shadow signal hold are wired',()=>{
  const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
  const app=fs.readFileSync(new URL('../assets/app.js',import.meta.url),'utf8');
  const stream=fs.readFileSync(new URL('../api/stream.js',import.meta.url),'utf8');
  const hold=fs.readFileSync(new URL('../assets/signal-hold.js',import.meta.url),'utf8');
  for(const id of ['strategyPanelR03','r03Decision','r03Ticket','r03Timeline','r03ConditionSummary','r03Chart','r03Conditions','r03Plan']) assert.match(html,new RegExp(`id=["']${id}["']`));
  for(const tf of ['H4','H1','M15','M5','M1']) assert.match(html,new RegExp(`data-r03-tf=["']${tf}["']`));
  assert.match(html,/RESEARCH SHADOW/);
  assert.match(app,/new GoldChart\(\$\('#r03Chart'\)\)/);
  assert.match(app,/updateR03\(/);assert.match(app,/applyR03View\(/);assert.match(app,/captureSignalIfNeeded\('R03'/);
  assert.match(stream,/strategyId: 'R03'/);assert.match(stream,/\['M1','M5','M15','H1','H4'\]/);
  assert.match(hold,/routeId === 'R03'/);assert.match(hold,/R03:/);
  assert.match(app,/stage\?\?''\)\.toUpperCase\(\)===['"]INVALIDATED['"]\)\{clearSignalHold\(routeId\)/);
});
