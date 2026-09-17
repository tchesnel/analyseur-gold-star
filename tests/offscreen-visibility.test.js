import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('critical offscreen zones, HTF levels and markers use explicit arrow hints',()=>{
  const chart=fs.readFileSync(new URL('../assets/chart.js',import.meta.url),'utf8');
  assert.match(chart,/drawOffscreenHints/);
  assert.match(chart,/family==='htf'/);
  assert.match(chart,/m\.family==='liquidity'/);
  assert.match(chart,/direction==='above'\?'↑':'↓'/);
  assert.match(chart,/if\(y<c\.top\|\|y>c\.bottom\)continue/);
});

test('offscreen hint stack is capped to avoid recreating label clutter',()=>{
  const chart=fs.readFileSync(new URL('../assets/chart.js',import.meta.url),'utf8');
  assert.match(chart,/slice\(0,2\)/);
});
