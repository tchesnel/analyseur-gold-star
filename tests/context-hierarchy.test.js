import test from 'node:test';
import assert from 'node:assert/strict';
import {macroEventRisk} from '../api/_lib/macro.js';
import {buildVisualAnalysis} from '../engine/visual-analysis.js';
import {generateMockHistory} from '../api/_lib/mock.js';

test('critical macro event same day is WATCH instead of NORMAL',()=>{
  const e={impact:'critical'};
  assert.equal(macroEventRisk(e,18*60),'watch');
  assert.equal(macroEventRisk(e,241),'watch');
  assert.equal(macroEventRisk(e,240),'elevated');
  assert.equal(macroEventRisk(e,60),'high');
  assert.equal(macroEventRisk(e,15),'critical');
  assert.equal(macroEventRisk(e,1441),'normal');
});

test('high-impact macro event within 12h is WATCH',()=>{
  const e={impact:'high'};
  assert.equal(macroEventRisk(e,600),'watch');
  assert.equal(macroEventRisk(e,121),'watch');
  assert.equal(macroEventRisk(e,120),'elevated');
  assert.equal(macroEventRisk(e,30),'high');
});

test('AUTO focus describes sweep as reaction, not a trade-direction context',()=>{
  const now=Date.UTC(2026,8,16,0,0);
  const bars=generateMockHistory('M5',320,now);
  // Build a normal snapshot; this contract test only forbids old ambiguous wording if a sweep becomes focus.
  const snap={bars:{M1:bars,M5:bars,M15:bars,M30:bars,H1:bars,H4:bars},quote:{bid:bars.at(-1).close,ask:bars.at(-1).close+.1},depth:null,macro:null};
  const v=buildVisualAnalysis(snap,'M5');
  assert.ok(!String(v.display.focus).includes('CONTEXTE BUY'));
  assert.ok(!String(v.display.focus).includes('CONTEXTE SELL'));
});
