import test from 'node:test';
import assert from 'node:assert/strict';
import { sma, ema, atr, rsi } from '../engine/indicators.js';

test('indicator primitives return deterministic values',()=>{
  assert.equal(sma([1,2,3,4],2),3.5);
  assert.ok(Math.abs(ema([1,2,3,4,5],3)-4)<1e-9);
  const bars=[1,2,3,4,5,6].map((n)=>({high:n+1,low:n-1,close:n})); assert.equal(atr(bars,3),2);
  assert.equal(rsi([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15],14),100);
});
