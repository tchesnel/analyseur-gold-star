import test from 'node:test';
import assert from 'node:assert/strict';
import { buildMessage, mergeSpotQuote, normalizeSymbolName, relativePrice, selectAccount, selectGoldSymbol, timeframeRangeMs, trendbarToCandle } from '../api/_lib/ctrader.js';

test('buildMessage creates valid cTrader JSON envelope', () => {
  const parsed = JSON.parse(buildMessage(2100, { clientId:'a', clientSecret:'b' }, 'id-1'));
  assert.deepEqual(parsed, { clientMsgId:'id-1', payloadType:2100, payload:{clientId:'a',clientSecret:'b'} });
});

test('normalizes broker symbol names safely', () => {
  assert.equal(normalizeSymbolName('XAU/USD.'), 'XAUUSD');
});

test('selectGoldSymbol prioritizes exact XAUUSD', () => {
  const symbols=[{symbolId:1,symbolName:'GOLD'},{symbolId:2,symbolName:'XAU/USD'},{symbolId:3,symbolName:'XAUUSD.m'}];
  assert.equal(selectGoldSymbol(symbols).symbolId, 2);
});

test('forced symbol name has priority', () => {
  const symbols=[{symbolId:1,symbolName:'XAUUSD'},{symbolId:2,symbolName:'GOLD.pro'}];
  assert.equal(selectGoldSymbol(symbols,'GOLD.pro').symbolId,2);
});

test('selectAccount honors env and explicit id', () => {
  const accounts=[{ctidTraderAccountId:'1',isLive:false},{ctidTraderAccountId:'2',isLive:true}];
  assert.equal(String(selectAccount(accounts,'live').ctidTraderAccountId),'2');
  assert.equal(String(selectAccount(accounts,'live','1').ctidTraderAccountId),'1');
});

test('converts cTrader relative price', () => assert.equal(relativePrice(365012345,2),3650.12));

test('converts trendbar deltas into OHLC', () => {
  const c=trendbarToCandle({low:365000000,deltaOpen:10000,deltaClose:20000,deltaHigh:40000,utcTimestampInMinutes:100,volume:10},2);
  assert.deepEqual(c,{time:6000000,open:3650.1,high:3650.4,low:3650,close:3650.2,volume:10});
});

test('historical window is bounded', () => {
  assert.ok(timeframeRangeMs('M5',320) > 320*300000);
  assert.ok(timeframeRangeMs('M5',5000) <= 1020*300000);
});


test('one-sided cTrader spot events preserve the last BID/ASK instead of turning the other side into 0.00', () => {
  let q=mergeSpotQuote({}, {bid:429327000,timestamp:1}, 2);
  assert.equal(q.bid,4293.27); assert.equal(q.ask,null); assert.equal(q.spread,null);
  q=mergeSpotQuote(q, {ask:429337000,timestamp:2}, 2);
  assert.equal(q.bid,4293.27); assert.equal(q.ask,4293.37); assert.equal(q.spread,0.10);
  q=mergeSpotQuote(q, {bid:429330000,timestamp:3}, 2);
  assert.equal(q.bid,4293.30); assert.equal(q.ask,4293.37); assert.equal(q.spread,0.07);
});
