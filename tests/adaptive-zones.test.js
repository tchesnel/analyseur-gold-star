import test from 'node:test';
import assert from 'node:assert/strict';
import { buildAdaptivePois, selectBalancedConfluenceZones } from '../engine/visual-analysis.js';

const bars=Array.from({length:40},(_,i)=>({time:i*300000,open:100,high:101,low:99,close:100,volume:1}));

test('confirmed BUY and SELL zones are calculated from all active sources before visual filtering',()=>{
  const obs=[
    {side:'buy',low:98,high:100,startTime:10,active:true,mitigated:false,sourceEvent:'BOS'},
    {side:'sell',low:110,high:112,startTime:20,active:true,mitigated:false,sourceEvent:'MSS'}
  ];
  const fvgs=[
    {side:'buy',low:99,high:101,startTime:11,kind:'fvg',state:'active'},
    {side:'sell',low:109,high:111,startTime:21,kind:'fvg',state:'active'}
  ];
  const out=buildAdaptivePois({obs,fvgs,price:104,atr:2,bars,lastTime:999});
  assert.ok(out.confirmed.some(z=>z.side==='buy'&&z.low===99&&z.high===100));
  assert.ok(out.confirmed.some(z=>z.side==='sell'&&z.low===110&&z.high===111));
  assert.equal(out.candidates.length,0);
});

test('a missing confirmed side gets a clearly marked candidate, never a fake confirmed zone',()=>{
  const obs=[{side:'sell',low:110,high:112,startTime:20,active:true,mitigated:false,sourceEvent:'BOS'}];
  const fvgs=[{side:'buy',low:99,high:101,startTime:11,kind:'fvg',state:'active'}];
  const out=buildAdaptivePois({obs,fvgs,price:104,atr:2,bars,lastTime:999});
  assert.equal(out.confirmed.length,0);
  assert.ok(out.candidates.some(z=>z.side==='sell'&&z.kind==='candidate'&&z.label.includes('SELL CANDIDATE')));
  assert.ok(out.candidates.some(z=>z.side==='buy'&&z.kind==='candidate'&&z.label.includes('BUY CANDIDATE')));
  assert.ok(out.candidates.every(z=>z.confirmed===false));
});

test('live price state marks a confirmed zone LIVE/NEAR and scoring cannot remove the opposite side',()=>{
  const obs=[
    {side:'buy',low:98,high:100,startTime:10,active:true,mitigated:false,sourceEvent:'BOS'},
    {side:'sell',low:110,high:112,startTime:20,active:true,mitigated:false,sourceEvent:'MSS'}
  ];
  const fvgs=[
    {side:'buy',low:99,high:101,startTime:11,kind:'fvg',state:'active'},
    {side:'sell',low:109,high:111,startTime:21,kind:'fvg',state:'active'}
  ];
  const out=buildAdaptivePois({obs,fvgs,price:110.5,atr:2,bars,lastTime:999});
  const sell=out.confirmed.find(z=>z.side==='sell');
  assert.equal(sell.liveState,'inside'); assert.match(sell.label,/SELL ZONE A · LIVE/);
  assert.ok(out.confirmed.some(z=>z.side==='buy'));
});

test('higher score wins among overlapping duplicate POIs while preserving both market sides',()=>{
  const zones=[
    {side:'buy',low:99,high:100,score:80,startTime:1},
    {side:'buy',low:99.2,high:100.1,score:120,startTime:2},
    {side:'sell',low:110,high:111,score:70,startTime:3}
  ];
  const out=selectBalancedConfluenceZones(zones,100,{perSide:2,total:4});
  const buy=out.find(z=>z.side==='buy');
  assert.equal(buy.score,120);
  assert.ok(out.some(z=>z.side==='sell'));
});
