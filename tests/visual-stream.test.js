import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import streamHandler from '../api/stream.js';

class Req extends EventEmitter{constructor(){super();this.query={tf:'M5'};this.headers={};}}
class Res extends EventEmitter{constructor(){super();this.statusCode=0;this.headers={};this.writableEnded=false;this.chunks=[];}status(c){this.statusCode=c;return this;}json(x){this.chunks.push(JSON.stringify(x));this.writableEnded=true;return this;}setHeader(k,v){this.headers[k]=v;}flushHeaders(){}write(v){this.chunks.push(String(v));return true;}end(){if(this.writableEnded)return;this.writableEnded=true;}}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function waitFor(fn,{timeout=3000,step=25}={}){const end=Date.now()+timeout;while(Date.now()<end){if(fn())return true;await sleep(step);}return false;}

test('stream mock emits visual overlays plus R01/R02/R03 analysis without strategy execution',async()=>{
  const prev=process.env.DATA_MODE;process.env.DATA_MODE='mock';
  const req=new Req(),res=new Res();const running=streamHandler(req,res);
  try{
    const ready=await waitFor(()=>{const t=res.chunks.join('');return t.includes('event: visual')&&t.includes('event: analysis')&&t.includes('\"strategyId\":\"R01\"')&&t.includes('\"strategyId\":\"R02\"')&&t.includes('\"strategyId\":\"R03\"');});
    assert.equal(ready,true,'visual + analysis R01 doivent arriver avant le timeout de test');
    const text=res.chunks.join('');
    assert.match(text,/event: visual/);
    assert.match(text,/"series"/);
    assert.match(text,/"structureBias"/);
    assert.match(text,/"execution":null/);
    assert.match(text,/event: analysis/);
    assert.match(text,/"strategyId":"R01"/);
    assert.match(text,/"strategyId":"R02"/);
    assert.match(text,/"strategyId":"R03"/);
    assert.match(text,/"stage":"(?:SEARCHING|DETECTED|ARMED|CONFIRMED|ENTRY_READY|EXPIRED|INVALIDATED)"/);
  } finally {
    // Toujours fermer le SSE même si une assertion échoue : sinon un test raté laisse
    // un flux mock/timer vivant et masque le vrai résultat sous un timeout global.
    res.emit('close');
    await Promise.race([running,sleep(1500)]);
    if(prev===undefined)delete process.env.DATA_MODE;else process.env.DATA_MODE=prev;
  }
});
