import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { selectBalancedConfluenceZones } from '../engine/visual-analysis.js';

test('BUY and SELL confluence are both preserved when both exist',()=>{
  const zones=[
    {side:'buy',low:4298,high:4299,startTime:3,label:'BUY ZONE'},
    {side:'buy',low:4297,high:4297.5,startTime:2,label:'BUY ZONE'},
    {side:'sell',low:4310,high:4311,startTime:1,label:'SELL ZONE'}
  ];
  const out=selectBalancedConfluenceZones(zones,4298.5,{perSide:2,total:4});
  assert.ok(out.some(z=>z.side==='buy'));
  assert.ok(out.some(z=>z.side==='sell'));
});

test('chart exposes offscreen POI hints instead of silently hiding a valid zone',()=>{
  const chart=fs.readFileSync(new URL('../assets/chart.js',import.meta.url),'utf8');
  assert.match(chart,/drawOffscreenHints/);
  assert.match(chart,/zonePriority=\{poi:6,orderBlocks:5,fvg:4\}/);
  assert.match(chart,/direction==='above'\?'↑':'↓'/);
  assert.match(chart,/drawOffscreenPoiHints/);
});

test('UI exposes BUY and SELL zone counts so checked does not imply a zone exists',()=>{
  const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
  const app=fs.readFileSync(new URL('../assets/app.js',import.meta.url),'utf8');
  assert.match(html,/id="buyZoneMetric"/);
  assert.match(html,/id="sellZoneMetric"/);
  assert.match(html,/id="poiLayerStatus"/);
  assert.match(app,/activeBuyZones/);
  assert.match(app,/activeSellZones/);
});
