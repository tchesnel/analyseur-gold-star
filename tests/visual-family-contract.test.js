import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { FAMILY_KEYS } from '../assets/layer-state.js';

test('every declared visual family has an engine producer and a renderer path',()=>{
  const engine=fs.readFileSync(new URL('../engine/visual-analysis.js',import.meta.url),'utf8')+fs.readFileSync(new URL('../engine/advanced-context.js',import.meta.url),'utf8');
  const chart=fs.readFileSync(new URL('../assets/chart.js',import.meta.url),'utf8');
  const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
  const expected=['structure','liquidity','internalLiquidity','orderBlocks','fvg','poi','fibonacci','premiumDiscount','htf','sessions','trend','vwap','avwap','volumeProfile','orderFlow','adx','volatilityRegime','macro','rsi','atr'];
  assert.deepEqual([...FAMILY_KEYS],expected);
  for(const family of expected){
    assert.match(html,new RegExp(`data-family="${family}"`));
    if(family==='macro') assert.match(engine,/macroRisk|macroBias/); else assert.match(engine,new RegExp(`family:'${family}'`));
  }
  assert.match(chart,/familyOn\(item\)/);
  assert.match(chart,/drawZones/);
  assert.match(chart,/drawLines/);
  assert.match(chart,/drawMarkers/);
  assert.match(chart,/drawSeries/);
  assert.match(chart,/drawOscillators/);
  assert.match(chart,/drawVolumeProfiles/);
});
