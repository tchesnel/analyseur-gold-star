import test from 'node:test';
import assert from 'node:assert/strict';
import {R01_CONFIG,buildR01KeyLiquidity} from '../strategies/r01-liquidity-sweep-reversal.js';

test('R01 production calibration is pinned to the reviewed parameter set',()=>{
  assert.equal(R01_CONFIG.minSweepPenetrationAtr,0.05);
  assert.equal(R01_CONFIG.reclaimMaxBars,3);
  assert.equal(R01_CONFIG.acceptanceBufferAtr,0.08);
  assert.equal(R01_CONFIG.acceptanceConsecutiveCloses,2);
  assert.equal(R01_CONFIG.maxAdxM5,24);
  assert.equal(R01_CONFIG.minRiskAtrM5,0.75);
  assert.equal(R01_CONFIG.nyWindowStartMinutes,500);
  assert.equal(R01_CONFIG.nyWindowEndMinutes,960);
  assert.equal(R01_CONFIG.minRewardRisk,1.5);
  assert.equal(R01_CONFIG.stopBufferAtr,0.12);
  assert.equal(R01_CONFIG.sellStopSpreadFactor,1.00);
  assert.deepEqual(R01_CONFIG.blockMacroRisks,['high','critical']);
});

test('R01 calibrated liquidity universe excludes isolated M15 swings but keeps M15 equal levels eligible',()=>{
  const M15=900_000,M5=300_000,t=Date.UTC(2026,8,15);
  const b=(time,o,h,l,c)=>({time,open:o,high:h,low:l,close:c,volume:100});
  const m15=[];
  for(let i=0;i<40;i++)m15.push(b(t+i*M15,100,i===10?105:(i===20||i===24?104:100.3),99.7,100));
  const m5=Array.from({length:100},(_,i)=>b(t+i*M5,100,100.2,99.8,100));
  const levels=buildR01KeyLiquidity({bars:{M15:m15,H1:[],H4:[],M5:m5}},{barsM5:m5});
  assert.equal(levels.some(x=>x.source==='M15_PIVOT'),false);
});
