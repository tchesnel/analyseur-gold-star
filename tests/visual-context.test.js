import test from 'node:test';
import assert from 'node:assert/strict';
import { buildHtfLevels, buildSessionOverlays, buildPremiumDiscount, aggregatePeriod } from '../engine/visual-analysis.js';

function hourly(days=10){const out=[];let p=2000;const start=Date.UTC(2026,8,1,0);for(let i=0;i<days*24;i++){const o=p,c=p+Math.sin(i/5)*.8+.15;out.push({time:start+i*3600000,open:o,high:Math.max(o,c)+1,low:Math.min(o,c)-1,close:c,volume:100});p=c;}return out;}

test('HTF levels expose previous day/week extremes and current opens',()=>{const h1=hourly(12),h4=h1.filter((_,i)=>i%4===0);const o=buildHtfLevels({bars:{H1:h1,H4:h4}});const labels=o.lines.map(x=>x.label);for(const label of ['PDH','PDL','D OPEN','PWH','PWL','W OPEN'])assert.ok(labels.includes(label));});

test('session overlay returns at most one latest range per Asia/London/New York',()=>{const o=buildSessionOverlays(hourly(3));assert.ok(o.zones.length<=3);assert.ok(o.zones.length>=2);assert.ok(o.zones.every(z=>z.kind==='session'&&z.low<z.high&&z.endTime>=z.startTime));});

test('premium/discount split shares exact equilibrium and never inverts range',()=>{const bars=hourly(12);const o=buildPremiumDiscount(bars);if(o.zones.length){const premium=o.zones.find(z=>z.kind==='premium'),discount=o.zones.find(z=>z.kind==='discount'),eq=o.lines.find(l=>l.kind==='equilibrium');assert.ok(premium&&discount&&eq);assert.equal(premium.low,eq.price);assert.equal(discount.high,eq.price);assert.ok(premium.high>premium.low);assert.ok(discount.high>discount.low);}});

test('period aggregation preserves OHLC ordering',()=>{const d=aggregatePeriod(hourly(2),t=>new Date(t).toISOString().slice(0,10));assert.equal(d.length,2);assert.ok(d.every(x=>x.high>=Math.max(x.open,x.close)&&x.low<=Math.min(x.open,x.close)));});
