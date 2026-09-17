import test from 'node:test';
import assert from 'node:assert/strict';
import health from '../api/health.js';

function runHealth(env = {}) {
  const previous = { ...process.env };
  for (const key of ['DATA_MODE','CTRADER_ENV','CTRADER_CLIENT_ID','CTRADER_CLIENT_SECRET','CTRADER_ACCESS_TOKEN']) delete process.env[key];
  Object.assign(process.env, env);
  let body; let code;
  const res = { status(c){ code=c; return this; }, json(v){ body=v; return this; } };
  health({},res);
  process.env = previous;
  return { code, body };
}

test('live is the default runtime mode',()=>{
  const {code,body}=runHealth();
  assert.equal(code,200);
  assert.equal(body.mode,'live');
  assert.equal(body.ctrader.environment,'live');
});

test('mock is only enabled explicitly',()=>{
  const {body}=runHealth({DATA_MODE:'mock'});
  assert.equal(body.mode,'mock');
});
