import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const streamSource = await readFile(new URL('../api/stream.js', import.meta.url), 'utf8');
const ctraderSource = await readFile(new URL('../api/_lib/ctrader.js', import.meta.url), 'utf8');

test('SSE ne se coupe jamais sur req.close', () => {
  assert.equal(streamSource.includes("req.on?.('close', abort)"), false);
  assert.equal(streamSource.includes("res.on?.('close', abort)"), true);
  assert.equal(streamSource.includes("req.on?.('aborted', abort)"), true);
});

test('les 6 historiques sont cadencés sous la limite cTrader', () => {
  assert.equal(ctraderSource.includes('setTimeout(resolve, 260)'), true);
  assert.equal(ctraderSource.includes('startHistoryQueue'), true);
});

test('les trendbars live attendent la souscription spot', () => {
  assert.equal(ctraderSource.includes('case CTRADER_PAYLOAD.SUBSCRIBE_SPOTS_RES'), true);
  assert.equal(ctraderSource.includes('startLiveTrendbarSubscriptions()'), true);
});
