import health from '../api/health.js';
import authStatus from '../api/auth/status.js';
import { buildAuthorizationUrl } from '../api/_lib/oauth.js';
import { generateMockHistory } from '../api/_lib/mock.js';

function makeRes(){return{code:0,body:null,headers:{},status(c){this.code=c;return this;},setHeader(k,v){this.headers[k]=v;},json(v){this.body=v;return this;},end(){return this;}};}
process.env.CTRADER_CLIENT_ID ||= 'smoke-id';
process.env.CTRADER_CLIENT_SECRET ||= 'smoke-secret';
const req={headers:{host:'localhost:4311','x-forwarded-proto':'https'}};

const res=makeRes(); health(req,res); if(res.code!==200||!res.body?.ok||res.body.mode!=='live') throw new Error('health live handler failed');
const authRes=makeRes(); await authStatus(req,authRes); if(authRes.code!==200||!authRes.body?.configured||authRes.body?.connected) throw new Error('OAuth pre-login status failed');
const grant=new URL(buildAuthorizationUrl(req)); if(grant.hostname!=='id.ctrader.com'||grant.searchParams.get('scope')!=='accounts') throw new Error('OAuth grant URL invalid');
const bars=generateMockHistory('M5',50); if(bars.length!==50) throw new Error('mock history helper failed');
console.log('SMOKE OK — live par défaut, OAuth intégré prêt avant login, portail cTrader officiel, scope accounts, moteur données OK.');
