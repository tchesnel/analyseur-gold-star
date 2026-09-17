import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { generateMockHistory } from '../api/_lib/mock.js';
import { detectInternalLiquidity, buildFibonacciOverlay, detectMarketStructure, buildVisualAnalysis } from '../engine/visual-analysis.js';

const NOW=Date.UTC(2026,8,15,22,0,0);
function fixture(){return generateMockHistory('M5',320,NOW);}

test('internal liquidity finds only unswept micro pivots inside the active major dealing range',()=>{
  const bars=fixture();
  const result=detectInternalLiquidity(bars);
  assert.ok(result.range && result.range.high>result.range.low);
  assert.ok(result.levels.length>0);
  assert.ok(result.levels.length<=8);
  assert.ok(result.levels.every(l=>l.price>result.range.low&&l.price<result.range.high&&!l.sweptAt));
  assert.ok(result.lines.every(l=>l.family==='internalLiquidity'&&['internal_bsl','internal_ssl'].includes(l.kind)));
});

test('automatic Fibonacci anchors on a confirmed swing and exposes canonical retracement levels',()=>{
  const bars=fixture();
  const structure=detectMarketStructure(bars,{left:5,right:3});
  const fib=buildFibonacciOverlay(bars,structure,bars.at(-1).close);
  assert.equal(fib.available,true);
  assert.ok(['bullish','bearish'].includes(fib.direction));
  assert.ok(fib.anchors?.start&&fib.anchors?.end);
  const labels=fib.lines.map(x=>x.label);
  for(const level of ['FIB 23.6%','FIB 38.2%','FIB 50%','FIB 61.8%','FIB 78.6%']) assert.ok(labels.includes(level));
  assert.ok(fib.zones.some(z=>z.kind==='fib_ote'&&z.low<z.high));
});

test('AUTO display selects only contextually relevant families and includes internal liquidity/Fibonacci when useful',()=>{
  const bars=fixture();
  const snapshot={bars:{M1:bars,M5:bars,M15:bars,M30:bars,H1:bars,H4:bars},quote:{bid:bars.at(-1).close,ask:bars.at(-1).close+0.1}};
  const visual=buildVisualAnalysis(snapshot,'M5');
  assert.equal(visual.display.mode,'auto');
  assert.equal(visual.execution,null);
  assert.equal(visual.display.families.structure,true);
  assert.equal(visual.display.families.internalLiquidity,true);
  assert.equal(visual.display.families.fibonacci,true);
  assert.ok(visual.display.visibleCount<=9);
  assert.ok(visual.display.reasons.length>0);
  assert.ok(visual.metrics.internalLiquidityLevels>0);
  assert.equal(visual.metrics.fibonacciAvailable,true);
});

test('AUTO mode is the default UI and manual layer buttons cannot override it until MANUEL is selected',()=>{
  const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
  const app=fs.readFileSync(new URL('../assets/app.js',import.meta.url),'utf8');
  assert.match(html,/id="autoMode"/);
  assert.match(html,/id="manualMode"/);
  assert.match(html,/data-family="internalLiquidity"/);
  assert.match(html,/data-family="fibonacci"/);
  assert.match(app,/autoLayers:true/);
  assert.match(app,/input\.disabled=state\.autoLayers/);
  assert.match(app,/if\(!state\.autoLayers\)applyFamilies\(allFamilies\(true\)\)/);
  assert.match(app,/if\(state\.autoLayers&&d\.display\?\.families\)applyFamilies\(d\.display\.families/);
});
