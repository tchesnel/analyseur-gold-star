import test from 'node:test';
import assert from 'node:assert/strict';
import { detectFvgs, detectInverseFvgs, detectOrderBlocks, detectMarketStructure, buildSmcOverlays } from '../engine/visual-analysis.js';

const t0=Date.UTC(2026,8,15,12);
function b(i,o,h,l,c,v=100){return{time:t0+i*300_000,open:o,high:h,low:l,close:c,volume:v};}

test('bullish FVG uses canonical 3-candle wick imbalance and tracks midpoint',()=>{
  const bars=[b(0,100,101,99,100),b(1,100,105,100,104),b(2,104,108,102,107),b(3,107,109,106,108),b(4,108,110,107,109),b(5,109,111,108,110),b(6,110,112,109,111),b(7,111,113,110,112),b(8,112,114,111,113),b(9,113,115,112,114),b(10,114,116,113,115),b(11,115,117,114,116),b(12,116,118,115,117),b(13,117,119,116,118),b(14,118,120,117,119),b(15,119,121,118,120),b(16,120,122,119,121)];
  // force un gap net entre candle 14 high=120 et candle 16 low=123
  bars[16]={...bars[16],low:123,high:126,open:124,close:125};
  const fvgs=detectFvgs(bars,{minAtr:0,max:50}); const f=fvgs.find(x=>x.index===16&&x.side==='buy');
  assert.ok(f); assert.equal(f.low,120); assert.equal(f.high,123); assert.equal(f.mid,121.5);
});

test('invalidated bullish FVG flips to bearish iFVG',()=>{
  const bars=[]; let p=100; for(let i=0;i<20;i++){bars.push(b(i,p,p+1,p-1,p+.2));p+=.2;}
  bars[2]=b(2,101,102,100.5,101.5); bars[4]=b(4,105,106,104.5,105.5); // FVG 102 -> 104.5
  bars[5]=b(5,105,105.5,100,101); // close sous 102 = invalidation
  const fvgs=detectFvgs(bars,{minAtr:0,max:50}); const inv=fvgs.find(x=>x.side==='buy'&&x.flipTime===bars[5].time);
  assert.ok(inv); const ifvgs=detectInverseFvgs(bars,fvgs); assert.ok(ifvgs.some(x=>x.side==='sell'&&x.low===inv.low&&x.high===inv.high));
});

test('order block is anchored to last opposite candle before valid structural displacement',()=>{
  const closes=[100,101,103,101,99,100,101,102,104,106,108,107,106,105,104,103,104,105,106,110,113,115,116,117,118,119,120,121,122,123];
  const bars=closes.map((c,i)=>b(i,i?closes[i-1]:c,c+.7,c-.7,c));
  // dernière bougie rouge avant le break bullish final
  bars[18]=b(18,107,108,104,105);
  bars[19]=b(19,105,112,104.8,111.5);
  const s=detectMarketStructure(bars,{left:2,right:2}); const obs=detectOrderBlocks(bars,s);
  assert.ok(obs.every(o=>o.low<o.high)); assert.ok(obs.some(o=>o.side==='buy'));
});

test('SMC overlay keeps confirmed confluence zones distinct from fallback candidates',()=>{
  const bars=[]; let p=2000; for(let i=0;i<100;i++){const wave=Math.sin(i/3)*3;const c=p+wave*.2+(i%17===0?4:0);bars.push(b(i,p,Math.max(p,c)+1,Math.min(p,c)-1,c,200));p=c;}
  const o=buildSmcOverlays(bars,{price:bars.at(-1).close}); const pois=o.zones.filter(z=>z.family==='poi');
  assert.ok(pois.filter(z=>z.confirmed===true).every(z=>z.label.includes('ZONE')&&z.kind==='confluence'));
  assert.ok(pois.filter(z=>z.confirmed===false).every(z=>z.label.includes('CANDIDATE')&&z.kind==='candidate'));
  assert.ok(o.zones.filter(z=>z.family==='fvg').every(z=>z.low<z.high));
});
