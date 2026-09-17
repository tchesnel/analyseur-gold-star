import test from 'node:test';
import assert from 'node:assert/strict';
import { detectPivots, detectMarketStructure, buildStructureOverlays, buildVisualAnalysis } from '../engine/visual-analysis.js';

function fromCloses(values,start=Date.UTC(2026,8,15,8)){return values.map((c,i)=>({time:start+i*300_000,open:i?values[i-1]:c,high:c+0.6,low:c-0.6,close:c,volume:100}));}

test('pivot detector confirms local highs and lows only after right bars',()=>{const b=fromCloses([10,11,13,11,10,9,8,10,11]);const p=detectPivots(b,2,2);assert.ok(p.some(x=>x.type==='high'&&x.index===2&&x.confirmIndex===4));assert.ok(p.some(x=>x.type==='low'&&x.index===6&&x.confirmIndex===8));});

test('structure detector produces a bullish structural break on close above confirmed swing',()=>{const b=fromCloses([10,11,13,11,9,10,11,12,14,15,16,15,14,13,12,11,12,13,14,17]);const s=detectMarketStructure(b,{left:2,right:2});assert.ok(s.events.some(e=>e.direction==='bullish'&&['BOS','CHOCH','MSS'].includes(e.type)));});

test('liquidity sweep requires wick through level and close back inside',()=>{const b=fromCloses([10,11,13,11,9,10,11,12,12.5,12.8,12.7,12.6,12.5,12.4,12.3,12.2,12.1,12.0,11.9,11.8]); b[8].high=13.8; b[8].close=12.4; const s=detectMarketStructure(b,{left:2,right:2});assert.ok(s.sweeps.some(x=>x.side==='buy-side'));});

test('structure overlay exposes BOS/CHOCH markers and liquidity lines without trade plan',()=>{const b=fromCloses([10,11,13,11,9,10,11,12,14,13,12,11,10,9,8,9,10,11,12,15,16,17]);const o=buildStructureOverlays(b);assert.ok(Array.isArray(o.markers));assert.ok(Array.isArray(o.lines));assert.equal('plan' in o,false);});

test('full visual analysis keeps structure contextual and execution-free',()=>{const b=fromCloses(Array.from({length:260},(_,i)=>2000+i*0.2+Math.sin(i/4)*3));const snapshot={bars:{M1:b,M5:b,M15:b,M30:b,H1:b,H4:b}};const v=buildVisualAnalysis(snapshot,'M5');assert.ok(v.metrics.structureBias);assert.ok(v.overlays.markers.every(m=>m.family==='structure'||m.family==='liquidity'));assert.equal(v.execution,null);});
