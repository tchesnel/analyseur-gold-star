import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import streamHandler from '../api/stream.js';

class FakeReq extends EventEmitter {
  constructor(){ super(); this.query={ tf:'M5' }; this.headers={}; }
}

class FakeRes extends EventEmitter {
  constructor(){
    super(); this.statusCode=0; this.headers={}; this.writableEnded=false; this.chunks=[];
  }
  status(code){ this.statusCode=code; return this; }
  json(obj){ this.chunks.push(JSON.stringify(obj)); this.writableEnded=true; this.emit('close'); return this; }
  setHeader(k,v){ this.headers[k]=v; }
  flushHeaders(){}
  write(v){ this.chunks.push(String(v)); return true; }
  end(){ if(this.writableEnded) return; this.writableEnded=true; this.emit('close'); }
}

const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));

test('un req.close ne tue pas le flux SSE, res.close oui', async () => {
  const previous=process.env.DATA_MODE;
  process.env.DATA_MODE='mock';
  const req=new FakeReq();
  const res=new FakeRes();
  const running=streamHandler(req,res);
  await sleep(50);
  assert.equal(res.writableEnded,false);
  req.emit('close');
  await sleep(120);
  assert.equal(res.writableEnded,false,'req.close a coupé le SSE alors qu’il devait rester ouvert');
  res.emit('close');
  await Promise.race([running,sleep(1000)]);
  assert.equal(res.writableEnded,true);
  if(previous===undefined) delete process.env.DATA_MODE; else process.env.DATA_MODE=previous;
});
