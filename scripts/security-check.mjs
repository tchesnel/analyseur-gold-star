import fs from 'node:fs';

const frontend=fs.readFileSync('assets/app.js','utf8')+fs.readFileSync('assets/chart.js','utf8')+fs.readFileSync('index.html','utf8');
for(const forbidden of ['CTRADER_CLIENT_SECRET','CTRADER_ACCESS_TOKEN']) {
  if(frontend.includes(forbidden)) throw new Error(`Sensitive env reference leaked into frontend: ${forbidden}`);
}

const backend=fs.readFileSync('api/_lib/ctrader.js','utf8');
for(const forbidden of ['PROTO_OA_NEW_ORDER_REQ','NEW_ORDER_REQ: 2106','CLOSE_POSITION_REQ','AMEND_POSITION','CANCEL_ORDER']) {
  if(backend.includes(forbidden)) throw new Error(`Trading execution primitive found: ${forbidden}`);
}
if(!backend.includes('HEARTBEAT: 51')) throw new Error('cTrader heartbeat missing');
if(!backend.includes('setInterval(() => send(CTRADER_PAYLOAD.HEARTBEAT')) throw new Error('10s heartbeat scheduler missing');
if(!backend.includes("const host = 'live.ctraderapi.com'")) throw new Error('cTrader transport is not locked to LIVE host');


const strategy=fs.readFileSync('strategies/r01-liquidity-sweep-reversal.js','utf8');
for(const forbidden of ['PROTO_OA_NEW_ORDER_REQ','NEW_ORDER_REQ','CLOSE_POSITION_REQ','AMEND_POSITION','CANCEL_ORDER','executeMarketOrder','placeOrder']) {
  if(strategy.includes(forbidden)) throw new Error(`Trading execution primitive found in R01: ${forbidden}`);
}
if(!strategy.includes('execution:null')) throw new Error('R01 must explicitly remain execution-free');

const oauth=fs.readFileSync('api/_lib/oauth.js','utf8');
if(!oauth.includes("url.searchParams.set('scope', 'accounts')")) throw new Error('OAuth scope is not locked to read-only accounts');
if(oauth.includes("url.searchParams.set('scope', 'trading')")) throw new Error('Trading OAuth scope detected');
for(const required of ["'HttpOnly'","'Secure'","'SameSite=Lax'",'aes-256-gcm']) {
  if(!oauth.includes(required)) throw new Error(`OAuth session protection missing: ${required}`);
}

console.log('SECURITY CHECK OK — OAuth lecture seule, session chiffrée/HttpOnly, aucun secret client, aucune primitive d’exécution, transport LIVE.');
