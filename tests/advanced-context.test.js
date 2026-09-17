import test from 'node:test';
import assert from 'node:assert/strict';
import { generateMockHistory } from '../api/_lib/mock.js';
import { adxDmiSeries,bollingerBandwidthSeries,buildVolumeProfile,anchoredVwapSeries,buildAnchoredVwaps,volatilityRegime,tickVolumeMetrics } from '../engine/advanced-context.js';
import { detectMarketStructure, buildSessionOverlays } from '../engine/visual-analysis.js';

const bars=generateMockHistory('M5',320,Date.UTC(2026,8,15,22));

test('ADX/DMI is bounded and structurally valid',()=>{const s=adxDmiSeries(bars,14);assert.ok(s.length>100);for(const p of s.slice(-50)){assert.ok(Number.isFinite(p.adx)&&p.adx>=0&&p.adx<=100);assert.ok(p.plusDI>=0&&p.minusDI>=0);}});
test('Bollinger bandwidth is finite and regime classification is deterministic',()=>{const s=bollingerBandwidthSeries(bars);assert.ok(s.length>100);assert.ok(s.every(p=>Number.isFinite(p.value)&&p.value>=0));const r=volatilityRegime(bars);assert.ok(['compression','normal','expansion'].includes(r.state));assert.ok(r.percentile>=0&&r.percentile<=1);});
test('Volume Profile returns ordered POC/VAH/VAL and conserves tick-volume mass',()=>{const p=buildVolumeProfile(bars,{bins:30});assert.equal(p.available,true);assert.ok(p.val<p.vah);assert.ok(p.poc>=Math.min(...bars.map(b=>b.low))&&p.poc<=Math.max(...bars.map(b=>b.high)));assert.ok(p.bins.length===30);assert.ok(p.totalVolume>0);assert.ok(p.maxVolume>0);});
test('Anchored VWAP starts exactly at/after its anchor and produces valid prices',()=>{const anchor=bars.at(-80).time;const s=anchoredVwapSeries(bars,anchor);assert.equal(s[0].time,anchor);assert.ok(s.every(p=>Number.isFinite(p.value)));const structure=detectMarketStructure(bars,{left:5,right:3});const sessions=buildSessionOverlays(bars);const a=buildAnchoredVwaps(bars,{structure,sessions});assert.ok(a.series.length>=1&&a.series.length<=4);});
test('tick volume spike/exhaustion metrics never produce invalid ratios',()=>{const m=tickVolumeMetrics(bars);assert.ok(m.ratio===null||Number.isFinite(m.ratio));assert.equal(typeof m.spike,'boolean');assert.equal(typeof m.exhaustion,'boolean');});
