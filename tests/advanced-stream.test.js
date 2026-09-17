import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import streamHandler from '../api/stream.js';

class Req extends EventEmitter{constructor(){super();this.query={tf:'M5'};this.headers={};}}
class Res extends EventEmitter{constructor(){super();this.statusCode=0;this.headers={};this.writableEnded=false;this.chunks=[];}status(c){this.statusCode=c;return this;}json(x){this.chunks.push(JSON.stringify(x));this.writableEnded=true;return this;}setHeader(k,v){this.headers[k]=v;}flushHeaders(){}write(v){this.chunks.push(String(v));return true;}end(){if(this.writableEnded)return;this.writableEnded=true;}}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

test('mock SSE carries autonomous advanced Gold context after depth arrives',async()=>{
  const prev=process.env.DATA_MODE;process.env.DATA_MODE='mock';
  const req=new Req(),res=new Res();const running=streamHandler(req,res);
  try {
    // 2 ticks: the first stores depth, the next throttled visual consumes it.
    await sleep(1900);
    const body=res.chunks.join('');
    assert.match(body,/event: depth/);
    assert.match(body,/event: macro/);
    assert.match(body,/"depthAvailable":true/);
    assert.match(body,/"profileAvailable":true/);
    assert.match(body,/"adx14":/);
    assert.match(body,/"volatilityState":/);
    assert.match(body,/"profiles":\[/);
    assert.match(body,/"mode":"auto"/);
    assert.match(body,/"execution":null/);
  } finally {
    res.emit('close');await Promise.race([running,sleep(1000)]);
    if(prev===undefined)delete process.env.DATA_MODE;else process.env.DATA_MODE=prev;
  }
});
