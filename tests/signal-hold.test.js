import test from 'node:test';
import assert from 'node:assert/strict';
import { createSignalHold, formatSignalCountdown, isSignalHoldActive, remainingSignalHoldMs, shouldCaptureSignal } from '../assets/signal-hold.js';

const r01 = { direction:'sell', plan:{ direction:'sell', sweep:{time:123456}, entry:4300, stop:4310, tp1:{price:4285}, tp2:{price:4270} } };
const r02 = { direction:'buy', plan:{ direction:'buy', breakout:{time:999000}, entry:4300, stop:4290, tp1:{price:4310}, tp2:{price:4322.5} } };
const r03 = { direction:'sell', plan:{ direction:'sell', setup:{zoneTouchTime:777000}, confirmation:{time:778000}, entry:4300, stop:4310, tp1:{price:4288}, tp2:{price:4280} } };

test('validated signal can be held for a fixed window without extending on every tick',()=>{
  const now=1_000_000, hold=createSignalHold('R01',r01,now,900_000);
  assert.equal(hold.setupId,'R01:123456:sell');
  assert.equal(isSignalHoldActive(hold,now+899_999),true);
  assert.equal(isSignalHoldActive(hold,now+900_000),false);
  assert.equal(shouldCaptureSignal('R01',r01,hold,now+10_000),false);
  assert.equal(remainingSignalHoldMs(hold,now+300_000),600_000);
  assert.equal(formatSignalCountdown(600_000),'10:00');
});

test('a genuinely new setup replaces the previous held signal',()=>{
  const now=2_000_000, hold=createSignalHold('R02',r02,now,900_000);
  const next={...r02,plan:{...r02.plan,breakout:{time:1_001_000}}};
  assert.equal(shouldCaptureSignal('R02',next,hold,now+1000),true);
});


test('R03 shadow signal uses a stable setup identity and the same 15 minute hold contract',()=>{
  const now=3_000_000,hold=createSignalHold('R03',r03,now);
  assert.equal(hold.setupId,'R03:777000:sell');
  assert.equal(hold.expiresAt-now,900_000);
  assert.equal(shouldCaptureSignal('R03',r03,hold,now+30_000),false);
});
