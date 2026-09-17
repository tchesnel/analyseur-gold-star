import test from 'node:test';
import assert from 'node:assert/strict';
import { generateMockHistory } from '../api/_lib/mock.js';

test('mock history is chronological and valid OHLC', () => {
  const bars=generateMockHistory('M5',120,1_800_000_000_000);
  assert.equal(bars.length,120);
  for(let i=0;i<bars.length;i++){
    const b=bars[i]; assert.ok(b.high>=Math.max(b.open,b.close)); assert.ok(b.low<=Math.min(b.open,b.close)); if(i) assert.ok(b.time>bars[i-1].time);
  }
});
