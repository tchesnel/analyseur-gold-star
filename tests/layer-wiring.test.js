import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('layer action buttons are wired to atomic all-on/all-off states',()=>{
  const app=fs.readFileSync(new URL('../assets/app.js',import.meta.url),'utf8');
  assert.match(app,/showAllLayers[\s\S]*?allFamilies\(true\)/);
  assert.match(app,/hideAllLayers[\s\S]*?allFamilies\(false\)/);
  assert.match(app,/cleanLayers[\s\S]*?CLEAN_PRESET/);
});
