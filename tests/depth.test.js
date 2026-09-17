import test from 'node:test';
import assert from 'node:assert/strict';
import { applyDepthEvent,summarizeDepthBook,selectDollarIndexSymbol } from '../api/_lib/ctrader.js';

test('cTrader depth book applies add/update/delete and computes Level II imbalance',()=>{const book=new Map();applyDepthEvent(book,{newQuotes:[{id:1,size:50000,bid:428600000},{id:2,size:20000,ask:428610000}]},2);let d=summarizeDepthBook(book);assert.equal(d.available,true);assert.ok(d.bidSize>d.askSize);assert.ok(d.imbalance>0);assert.equal(d.bidWall.price,4286);applyDepthEvent(book,{deletedQuotes:[1],newQuotes:[{id:3,size:80000,ask:428620000}]},2);d=summarizeDepthBook(book);assert.equal(d.bidLevels.length,0);assert.ok(d.askSize>0);});
test('dollar index symbol discovery prefers exact DXY/USDX style symbols',()=>{const s=selectDollarIndexSymbol([{symbolId:1,symbolName:'USDJPY'},{symbolId:2,symbolName:'USDX'},{symbolId:3,symbolName:'EURUSD'}]);assert.equal(s.symbolId,2);});

test('DXY live reference uses the mid when both sides exist and degrades safely to one side',async()=>{
  const { spotReferenceValue } = await import('../api/_lib/ctrader.js');
  assert.equal(spotReferenceValue({bid:101.4,ask:101.6}),101.5);
  assert.equal(spotReferenceValue({bid:101.4,ask:null}),101.4);
  assert.equal(spotReferenceValue({bid:null,ask:101.6}),101.6);
  assert.equal(spotReferenceValue({}),null);
});
