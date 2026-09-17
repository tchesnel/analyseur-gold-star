import test from 'node:test';
import assert from 'node:assert/strict';
import { selectNearestZones, buildStructureOverlays } from '../engine/visual-analysis.js';
import { resolveVerticalLabels } from '../assets/chart.js';

function bars(count=140){
  const out=[]; let p=4300;
  for(let i=0;i<count;i++){
    const wave=Math.sin(i/4)*3+Math.sin(i/11)*5, close=4300+wave+i*.015, open=p;
    out.push({time:1_800_000_000_000+i*300_000,open,high:Math.max(open,close)+1.2,low:Math.min(open,close)-1.2,close,volume:100+i}); p=close;
  }
  return out;
}

test('nearest-zone selector caps clutter per side and total',()=>{
  const zones=[
    {side:'buy',low:4290,high:4291,startTime:1},{side:'buy',low:4298,high:4299,startTime:2},{side:'buy',low:4280,high:4281,startTime:3},
    {side:'sell',low:4301,high:4302,startTime:4},{side:'sell',low:4310,high:4311,startTime:5},{side:'sell',low:4320,high:4321,startTime:6}
  ];
  const chosen=selectNearestZones(zones,4300,{perSide:2,total:4});
  assert.equal(chosen.length,4);
  assert.equal(chosen.filter(z=>z.side==='buy').length,2);
  assert.equal(chosen.filter(z=>z.side==='sell').length,2);
  assert.ok(chosen.some(z=>z.low===4298));
  assert.ok(chosen.some(z=>z.low===4301));
});

test('structure overlay has a hard visual cap',()=>{
  const o=buildStructureOverlays(bars());
  assert.ok(o.lines.length<=4);
  assert.ok(o.markers.length<=12);
});

test('vertical label layout separates close labels',()=>{
  const out=resolveVerticalLabels([{y:100},{y:103},{y:106}],80,160,14);
  assert.ok(out[1].resolvedY-out[0].resolvedY>=14);
  assert.ok(out[2].resolvedY-out[1].resolvedY>=14);
  assert.ok(out.every(x=>x.resolvedY>=80&&x.resolvedY<=160));
});
