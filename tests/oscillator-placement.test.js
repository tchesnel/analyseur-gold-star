import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { buildOscillatorOverlays, buildVisualAnalysis } from '../engine/visual-analysis.js';

function bars(n=260){let p=4300;const out=[];for(let i=0;i<n;i++){const open=p,close=open+Math.sin(i/7)*.5+.08,high=Math.max(open,close)+.4,low=Math.min(open,close)-.35;out.push({time:Date.UTC(2026,8,10)+i*300000,open,high,low,close,volume:800+i});p=close;}return out;}

test('RSI and ATR are explicit visual families with dedicated point series',()=>{
  const o=buildOscillatorOverlays(bars());
  assert.equal(o.rsi.family,'rsi'); assert.equal(o.atr.family,'atr');
  assert.ok(o.rsi.points.length>100); assert.ok(o.atr.points.length>100);
  assert.ok(o.rsi.points.every(x=>x.value>=0&&x.value<=100));
  assert.ok(o.atr.points.every(x=>x.value>=0));
});

test('full visual payload carries RSI/ATR panels and detector status metrics',()=>{
  const b=bars(); const snap={bars:{M5:b,H1:b,H4:b}}; const v=buildVisualAnalysis(snap,'M5');
  assert.equal(v.overlays.oscillators.rsi.family,'rsi');
  assert.equal(v.overlays.oscillators.atr.family,'atr');
  assert.ok(v.metrics.rsiSeries>0); assert.ok(v.metrics.atrSeries>0);
  for(const key of ['structureEvents','equalLevels','sweeps','displayedFvgs','displayedIfvgs','displayedOrderBlocks','htfLevels','sessionRanges']) assert.equal(typeof v.metrics[key],'number');
});

test('UI exposes dedicated RSI and ATR toggles and detector status labels',()=>{
  const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
  const app=fs.readFileSync(new URL('../assets/app.js',import.meta.url),'utf8');
  assert.match(html,/data-family="rsi"/); assert.match(html,/data-family="atr"/);
  assert.match(html,/id="rsiLayerStatus"/); assert.match(html,/id="atrLayerStatus"/);
  assert.match(app,/rsiSeries/); assert.match(app,/atrSeries/);
});
