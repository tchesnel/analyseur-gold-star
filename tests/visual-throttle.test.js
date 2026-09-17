import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const source=await readFile(new URL('../api/stream.js',import.meta.url),'utf8');
test('visual engine follows live quotes without recalculating more than about once per second',()=>{
  assert.match(source,/VISUAL_MIN_INTERVAL_MS = 900/);
  assert.match(source,/event === 'quote'/);
  assert.match(source,/data\.timeframe === timeframe/);
  assert.match(source,/now - lastVisualAt >= VISUAL_MIN_INTERVAL_MS/);
});
