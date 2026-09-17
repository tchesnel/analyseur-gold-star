import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { STRATEGIES } from '../strategies/index.js';
import { StrategyRuntime } from '../engine/strategy-runtime.js';
import { buildR01SellSnapshot } from './helpers/r01-fixture.js';

test('R01, R02 and R03 are isolated registered strategies and runtime remains execution-free',()=>{
  assert.equal(STRATEGIES.length,3); assert.deepEqual(STRATEGIES.map(x=>x.id),['R01','R02','R03']);
  const s=buildR01SellSnapshot(); const r=new StrategyRuntime(STRATEGIES);
  for(const tf of ['M1','M5','M15','M30','H1','H4'])r.ingest('history',{timeframe:tf,bars:s.bars[tf]}); r.ingest('quote',s.quote); r.ingest('depth',s.depth); r.ingest('macro',s.macro);
  const out=r.evaluate('tick')[0]; assert.equal(out.stage,'CONFIRMED'); assert.equal(out.direction,'sell'); assert.equal(out.conditions.find(c=>c.id==='regime_adx').passed,false); assert.equal(out.plan.execution,null);
});

test('frontend exposes the R01 decision cockpit before the generic chart and keeps an autonomous M1/M5 strategy chart',()=>{
  const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
  const app=fs.readFileSync(new URL('../assets/app.js',import.meta.url),'utf8');
  const stream=fs.readFileSync(new URL('../api/stream.js',import.meta.url),'utf8');
  const chart=fs.readFileSync(new URL('../assets/chart.js',import.meta.url),'utf8');
  for(const id of ['r01Score','r01Decision','r01Ticket','r01Stage','r01Direction','r01Conditions','r01Plan','r01Chart','r01IndicatorTags'])assert.match(html,new RegExp(`id=["']${id}["']`));
  assert.ok(html.indexOf('class="strategy-workspace"')<html.indexOf('class="grid"'),'le cockpit stratégies doit apparaître avant le dashboard général');
  assert.match(app,/addEventListener\('analysis'/);
  assert.match(app,/addEventListener\('strategy_history'/);
  assert.match(app,/addEventListener\('strategy_visual'/);
  assert.match(app,/tradeReady=Boolean\(ready\.allGreen&&stage==='ENTRY_READY'&&plan\)/);
  assert.match(app,/new GoldChart\(\$\('#r01Chart'\)\)/);
  assert.match(stream,/emit\('strategy_history'/);
  assert.match(stream,/emit\('strategy_visual'/);
  assert.match(chart,/setStrategyOverlays\(/); assert.match(chart,/baseOverlays/);
});
