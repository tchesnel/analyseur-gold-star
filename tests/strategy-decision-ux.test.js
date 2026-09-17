import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { evaluateR01 } from '../strategies/r01-liquidity-sweep-reversal.js';
import { evaluateR02 } from '../strategies/r02-balance-breakout-acceptance.js';
import { buildR02BuySnapshot } from './helpers/r02-fixture.js';

test('R01 pre-sweep conditions that are not yet evaluable are not falsely counted green',()=>{
  const r=evaluateR01({bars:{M1:[],M5:[],M15:[],M30:[],H1:[],H4:[]},quote:{bid:4300,ask:4300.1,spread:.1,timestamp:Date.now()},macro:{risk:'normal'}});
  for(const id of ['regime_adx','ny_window','risk_geometry']) assert.equal(r.conditions.find(c=>c.id===id)?.passed,false,id);
});

test('R02 H4 alignment cannot pass just because both optional directions are undefined',()=>{
  const s=buildR02BuySnapshot();
  s.bars.M5=s.bars.M5.slice(0,120);
  const r=evaluateR02(s);
  if(!r.plan && !r.direction) assert.equal(r.conditions.find(c=>c.id==='h4_bias')?.passed,false);
});

test('decision-first UI, three app views, advanced details and held-signal UX are wired',()=>{
  const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
  const app=fs.readFileSync(new URL('../assets/app.js',import.meta.url),'utf8');
  for(const text of ['Décider vite. Vérifier ensuite.','PARCOURS DU SETUP','LECTURE RAPIDE','Afficher le détail technique R01','Afficher le détail technique R02','Afficher le détail technique R03','RESEARCH SHADOW']) assert.match(html,new RegExp(text));
  for(const view of ['strategies','market','diagnostic']) assert.match(html,new RegExp(`data-app-target=["']${view}["']`));
  for(const id of ['r01SignalStatus','r02SignalStatus','r03SignalStatus','r01Timeline','r02Timeline','r03Timeline','r01ConditionSummary','r02ConditionSummary','r03ConditionSummary']) assert.match(html,new RegExp(`id=["']${id}["']`));
  assert.match(app,/createSignalHold/);
  assert.match(app,/SIGNAL_STORAGE_KEY/);
  assert.match(app,/signal mémorisé 15 minutes/i);
  assert.match(app,/data-route-layers/);
});
