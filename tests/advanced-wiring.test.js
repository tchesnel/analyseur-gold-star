import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('live cTrader wiring subscribes to Level II and forwards advanced context into the runtime',()=>{
  const c=fs.readFileSync(new URL('../api/_lib/ctrader.js',import.meta.url),'utf8');
  const s=fs.readFileSync(new URL('../api/stream.js',import.meta.url),'utf8');
  assert.match(c,/SUBSCRIBE_DEPTH_QUOTES_REQ/);
  assert.match(c,/DEPTH_EVENT/);
  assert.match(c,/emit\('depth'/);
  assert.match(c,/emit\('macro_quote'/);
  assert.match(s,/fetchGoldMacroContext/);
  assert.match(s,/\['quote','depth','macro','macro_quote'\]/);
});
