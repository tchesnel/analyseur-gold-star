import test from 'node:test';
import assert from 'node:assert/strict';
import { emaSeries, atrSeries, rsiSeries, dailyVwapSeries, trendMetrics } from '../engine/visual-analysis.js';

function bars(count=240){const out=[];let p=2000;for(let i=0;i<count;i++){const open=p;const close=p+1;out.push({time:Date.UTC(2026,0,1)+i*60_000,open,high:close+.5,low:open-.5,close,volume:100+i});p=close;}return out;}

test('EMA series has deterministic seed and length',()=>{const b=bars(50);const s=emaSeries(b,20);assert.equal(s.length,31);assert.equal(s[0].time,b[19].time);assert.ok(s.at(-1).value>s[0].value);});
test('ATR Wilder is positive on moving bars',()=>{const s=atrSeries(bars(40),14);assert.equal(s.length,26);assert.ok(s.every(x=>x.value>0));});
test('RSI reaches 100 on uninterrupted rise',()=>{const s=rsiSeries(bars(40),14);assert.equal(s.at(-1).value,100);});
test('daily VWAP resets when UTC day changes',()=>{const b=[{time:Date.UTC(2026,0,1,23),high:11,low:9,close:10,volume:2},{time:Date.UTC(2026,0,2,0),high:21,low:19,close:20,volume:2}];const s=dailyVwapSeries(b);assert.equal(s[0].value,10);assert.equal(s[1].value,20);});
test('trend metrics identifies aligned bullish EMA stack',()=>{const m=trendMetrics(bars(260),bars(260));assert.equal(m.trend,'bullish');assert.ok(m.rsi14>=99);assert.ok(m.atr14>0);});
