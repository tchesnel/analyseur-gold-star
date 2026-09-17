import test from 'node:test';
import assert from 'node:assert/strict';
import { FAMILY_KEYS, CLEAN_PRESET, allFamilies, normalizeFamilyState } from '../assets/layer-state.js';

test('allFamilies(false) really disables every visual family',()=>{
  const state=allFamilies(false);
  assert.equal(Object.keys(state).length,FAMILY_KEYS.length);
  assert.ok(FAMILY_KEYS.every(key=>state[key]===false));
});

test('allFamilies(true) really enables every visual family',()=>{
  const state=allFamilies(true);
  assert.ok(FAMILY_KEYS.every(key=>state[key]===true));
});

test('normalizeFamilyState preserves explicit false values',()=>{
  const state=normalizeFamilyState({fvg:false,structure:false},CLEAN_PRESET);
  assert.equal(state.fvg,false);
  assert.equal(state.structure,false);
  assert.equal(state.poi,CLEAN_PRESET.poi);
});

test('clean preset keeps sessions and premium/discount off by default',()=>{
  assert.equal(CLEAN_PRESET.sessions,false);
  assert.equal(CLEAN_PRESET.premiumDiscount,false);
});
