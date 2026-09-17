import test from 'node:test';
import assert from 'node:assert/strict';
import login from '../api/auth/login.js';
import status from '../api/auth/status.js';
import logout from '../api/auth/logout.js';

function makeRes(){
  return {
    statusCode:200, headers:{}, body:null, ended:false,
    status(c){this.statusCode=c;return this;},
    setHeader(k,v){this.headers[String(k).toLowerCase()]=v;},
    json(v){this.body=v;this.ended=true;return this;},
    end(v=''){this.body=v;this.ended=true;return this;}
  };
}

function setCreds(){ process.env.CTRADER_CLIENT_ID='id-test'; process.env.CTRADER_CLIENT_SECRET='secret-test'; }

test('login handler redirects to official cTrader authorization portal',()=>{
  setCreds();
  const req={headers:{host:'gold.example.com','x-forwarded-proto':'https'}};
  const res=makeRes();
  login(req,res);
  assert.equal(res.statusCode,302);
  assert.ok(String(res.headers.location).startsWith('https://id.ctrader.com/'));
  assert.match(String(res.headers['set-cookie']),/ctrader_oauth_pending=/);
  const u=new URL(res.headers.location);
  assert.equal(u.searchParams.get('scope'),'accounts');
});

test('status says configured but disconnected before user authorizes',async()=>{
  setCreds();
  const req={headers:{host:'gold.example.com','x-forwarded-proto':'https'}};
  const res=makeRes();
  await status(req,res);
  assert.equal(res.statusCode,200);
  assert.equal(res.body.configured,true);
  assert.equal(res.body.connected,false);
  assert.equal(res.body.redirectUri,'https://gold.example.com/api/auth/callback');
});

test('logout clears OAuth cookies',()=>{
  const res=makeRes();
  logout({headers:{}},res);
  assert.equal(res.statusCode,200);
  assert.equal(res.body.connected,false);
  assert.ok(Array.isArray(res.headers['set-cookie']));
  assert.equal(res.headers['set-cookie'].length,2);
});

test('callback exchanges code server-side and stores encrypted OAuth session cookie',async()=>{
  setCreds();
  const previousFetch=global.fetch;
  global.fetch=async(url)=>{
    const u=new URL(String(url));
    assert.equal(u.hostname,'openapi.ctrader.com');
    assert.equal(u.searchParams.get('grant_type'),'authorization_code');
    assert.equal(u.searchParams.get('code'),'one-minute-code');
    return new Response(JSON.stringify({accessToken:'access-x',refreshToken:'refresh-y',expiresIn:2628000,tokenType:'bearer',errorCode:null,description:null}),{status:200,headers:{'Content-Type':'application/json'}});
  };
  try {
    const { default: callback } = await import('../api/auth/callback.js');
    const req={query:{code:'one-minute-code'},headers:{host:'gold.example.com','x-forwarded-proto':'https',cookie:'ctrader_oauth_pending=abc'}};
    const res=makeRes();
    await callback(req,res);
    assert.equal(res.statusCode,302);
    assert.equal(res.headers.location,'https://gold.example.com/?ctrader=connected');
    assert.ok(Array.isArray(res.headers['set-cookie']));
    const sessionCookie=String(res.headers['set-cookie'][0]);
    assert.match(sessionCookie,/ctrader_oauth_session=/);
    assert.ok(!sessionCookie.includes('access-x'));
    assert.match(sessionCookie,/HttpOnly/);
  } finally { global.fetch=previousFetch; }
});
