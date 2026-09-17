import test from 'node:test';
import assert from 'node:assert/strict';
import {resolveR03Bar,rMultiple} from '../backtests/r03-execution-model.mjs';
import {classifySymbol,inspectCsvSymbol} from '../scripts/r03-dataset-guard.mjs';

test('R03 replay fills a gap-through-stop at the actual open, not at the stop',()=>{
  const x=resolveR03Bar({side:'buy',bar:{open:98,high:101,low:97},stop:100,target:110,slippage:.1});
  assert.deepEqual(x,{hit:true,reason:'SL_GAP',price:97.9});
  assert.ok(rMultiple({side:'buy',entry:105,exit:x.price,stop:100})<-1);
});

test('R03 replay is stop-first when SL and target are both touchable in one bar',()=>{
  const a=resolveR03Bar({side:'buy',bar:{open:105,high:112,low:99},stop:100,target:110});
  const b=resolveR03Bar({side:'sell',bar:{open:105,high:111,low:98},stop:110,target:100});
  assert.equal(a.reason,'SL_SAME_BAR');assert.equal(a.price,100);
  assert.equal(b.reason,'SL_SAME_BAR');assert.equal(b.price,110);
});

test('dataset guard distinguishes XAUUSD calibration from ES external falsification',()=>{
  assert.equal(classifySymbol('XAUUSD'),'XAUUSD');assert.equal(classifySymbol('ES.v.0'),'ES');
  const info=inspectCsvSymbol('/mnt/data/ES_v_0_OHLCV_1m_2020-01-01_2026-08-15(2).csv');
  assert.deepEqual(info.classes,['ES']);
});
