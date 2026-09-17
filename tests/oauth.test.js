import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildAuthorizationUrl,
  clearSessionCookie,
  credentialsConfigured,
  getRedirectUri,
  getSessionFromRequest,
  parseCookies,
  resolveOAuthSession,
  sealSession,
  sessionCookie,
  unsealSession
} from '../api/_lib/oauth.js';

function withEnv(values, fn) {
  const keys = Object.keys(values);
  const previous = Object.fromEntries(keys.map((k) => [k, process.env[k]]));
  for (const [k,v] of Object.entries(values)) {
    if (v === undefined) delete process.env[k]; else process.env[k] = v;
  }
  try { return fn(); }
  finally {
    for (const [k,v] of Object.entries(previous)) {
      if (v === undefined) delete process.env[k]; else process.env[k] = v;
    }
  }
}

const req = { headers: { host: 'gold.example.com', 'x-forwarded-proto': 'https' } };

test('OAuth requires only client id + secret as app credentials', () => withEnv({CTRADER_CLIENT_ID:'id1',CTRADER_CLIENT_SECRET:'secret1'}, () => {
  assert.equal(credentialsConfigured(), true);
}));

test('authorization URL uses official cTrader portal and accounts read-only scope', () => withEnv({CTRADER_CLIENT_ID:'id1',CTRADER_CLIENT_SECRET:'secret1'}, () => {
  const url = new URL(buildAuthorizationUrl(req));
  assert.equal(url.origin, 'https://id.ctrader.com');
  assert.equal(url.searchParams.get('client_id'), 'id1');
  assert.equal(url.searchParams.get('scope'), 'accounts');
  assert.equal(url.searchParams.get('product'), 'web');
  assert.equal(url.searchParams.get('redirect_uri'), 'https://gold.example.com/api/auth/callback');
}));

test('redirect URI can be explicitly pinned', () => withEnv({CTRADER_CLIENT_ID:'id1',CTRADER_CLIENT_SECRET:'secret1',CTRADER_REDIRECT_URI:'https://app.example/api/auth/callback'}, () => {
  assert.equal(getRedirectUri(req), 'https://app.example/api/auth/callback');
}));

test('OAuth session is encrypted and decrypts server-side', () => withEnv({CTRADER_CLIENT_ID:'id1',CTRADER_CLIENT_SECRET:'secret1'}, () => {
  const session = { accessToken:'access-abc', refreshToken:'refresh-def', expiresAt:Date.now()+60_000, tokenType:'bearer' };
  const sealed = sealSession(session);
  assert.ok(!sealed.includes('access-abc'));
  assert.deepEqual(unsealSession(sealed), session);
}));

test('session cookie is HttpOnly Secure SameSite Lax', () => withEnv({CTRADER_CLIENT_ID:'id1',CTRADER_CLIENT_SECRET:'secret1'}, () => {
  const cookie = sessionCookie({ accessToken:'a', refreshToken:'r', expiresAt:Date.now()+60_000 });
  assert.match(cookie,/HttpOnly/);
  assert.match(cookie,/Secure/);
  assert.match(cookie,/SameSite=Lax/);
  assert.match(clearSessionCookie(),/Max-Age=0/);
}));

test('server resolves access token from encrypted OAuth cookie without env token', async () => {
  await withEnv({CTRADER_CLIENT_ID:'id1',CTRADER_CLIENT_SECRET:'secret1',CTRADER_ACCESS_TOKEN:undefined}, async () => {
    const session = { accessToken:'oauth-access', refreshToken:'oauth-refresh', expiresAt:Date.now()+60*60_000, tokenType:'bearer' };
    const cookie = sessionCookie(session).split(';')[0];
    const request = { headers:{ cookie } };
    assert.equal(getSessionFromRequest(request)?.accessToken,'oauth-access');
    const resolved = await resolveOAuthSession(request,{refresh:false});
    assert.equal(resolved.connected,true);
    assert.equal(resolved.source,'oauth');
    assert.equal(resolved.accessToken,'oauth-access');
  });
});

test('no OAuth cookie means disconnected even if no token variable exists', async () => {
  await withEnv({CTRADER_CLIENT_ID:'id1',CTRADER_CLIENT_SECRET:'secret1',CTRADER_ACCESS_TOKEN:undefined}, async () => {
    const resolved = await resolveOAuthSession({headers:{}},{refresh:false});
    assert.equal(resolved.connected,false);
    assert.equal(resolved.accessToken,null);
  });
});

test('cookie parser handles multiple cookies', () => {
  assert.deepEqual(parseCookies({headers:{cookie:'a=1; b=hello%20world'}}),{a:'1',b:'hello world'});
});
