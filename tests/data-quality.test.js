import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { generateMockHistory } from '../api/_lib/mock.js';
import { advancedMetrics, depthDataQuality, macroDataQuality } from '../engine/advanced-context.js';
import { parseFredCsv } from '../api/_lib/macro.js';

const bars=generateMockHistory('M5',320,Date.UTC(2026,8,16,0,30));

test('missing optional DOM values remain missing and are never coerced to zero',()=>{
  const depth={available:true,bidLevels:[],askLevels:[],imbalance:null,ratio:null,bidWall:null,askWall:null};
  const q=depthDataQuality(depth);
  assert.equal(q.state,'collecting');
  const m=advancedMetrics({bars,depth,macro:null});
  assert.equal(m.depthImbalance,null);
  assert.equal(m.depthRatio,null);
  assert.equal(m.depthQuality,'collecting');
});

test('balanced valid DOM is classified neutral-capable with a real zero imbalance',()=>{
  const depth={available:true,bidLevels:[1,2,3].map((_,i)=>({price:4280-i,size:100})),askLevels:[1,2,3].map((_,i)=>({price:4281+i,size:100})),imbalance:0,ratio:1};
  assert.equal(depthDataQuality(depth).state,'ok');
  const m=advancedMetrics({bars,depth});
  assert.equal(m.depthImbalance,0);
  assert.equal(m.depthQuality,'ok');
});

test('macro quality distinguishes calendar-only from real yield data',()=>{
  const calendarOnly={available:true,nextEvent:{type:'FOMC',time:Date.now()+3600000},events:[],dxy:null,us10y:null,real10y:null};
  assert.equal(macroDataQuality(calendarOnly).state,'calendar-only');
  const m=advancedMetrics({bars,macro:calendarOnly});
  assert.equal(m.us10y,null); assert.equal(m.real10y,null); assert.equal(m.dxy,null);
  assert.equal(m.macroQuality,'calendar-only');
});

test('FRED parser never turns an empty observation into 0',()=>{
  const rows=parseFredCsv('DATE,DGS10\n2026-09-14,4.12\n2026-09-15,\n2026-09-16,.\n');
  assert.deepEqual(rows,[{date:'2026-09-14',value:4.12}]);
});

test('frontend explicitly renders N/A for missing macro and NEUTRE for balanced DOM',()=>{
  const app=fs.readFileSync(new URL('../assets/app.js',import.meta.url),'utf8');
  assert.match(app,/macroUs10y[^\n]+hasNumber\(m\.us10y\)[^\n]+:'N\/A'/);
  assert.match(app,/NEUTRE \$\{pct\}%/);
  assert.match(app,/DOM EN COLLECTE|EN COLLECTE/);
});

test('Treasury XML fallback parser extracts official nominal and real 10Y series without null coercion',async()=>{
  const { parseTreasuryXmlSeries }=await import('../api/_lib/macro.js');
  const nominal='<feed><entry><content><m:properties><d:NEW_DATE>2026-09-14T00:00:00</d:NEW_DATE><d:BC_10YEAR>4.18</d:BC_10YEAR></m:properties></content></entry><entry><content><m:properties><d:NEW_DATE>2026-09-15T00:00:00</d:NEW_DATE><d:BC_10YEAR>4.12</d:BC_10YEAR></m:properties></content></entry></feed>';
  const real='<feed><entry><content><m:properties><d:NEW_DATE>2026-09-15T00:00:00</d:NEW_DATE><d:TC_10YEAR>1.78</d:TC_10YEAR></m:properties></content></entry><entry><content><m:properties><d:NEW_DATE>2026-09-16T00:00:00</d:NEW_DATE></m:properties></content></entry></feed>';
  assert.deepEqual(parseTreasuryXmlSeries(nominal,'BC_10YEAR').map(x=>x.value),[4.18,4.12]);
  assert.deepEqual(parseTreasuryXmlSeries(real,'TC_10YEAR').map(x=>x.value),[1.78]);
  const attributed='<feed><entry><content><m:properties><d:NEW_DATE m:type="Edm.DateTime">2026-09-16T00:00:00</d:NEW_DATE><d:BC_10YEAR m:type="Edm.Double">4.07</d:BC_10YEAR></m:properties></content></entry></feed>';
  assert.deepEqual(parseTreasuryXmlSeries(attributed,'BC_10YEAR'),[{date:'2026-09-16',value:4.07}]);
});
