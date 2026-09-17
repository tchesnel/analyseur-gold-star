import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';

const SESSION_COOKIE = 'ctrader_oauth_session';
const PENDING_COOKIE = 'ctrader_oauth_pending';
const TOKEN_ENDPOINT = 'https://openapi.ctrader.com/apps/token';
const AUTHORIZE_ENDPOINT = 'https://id.ctrader.com/my/settings/openapi/grantingaccess/';
const REFRESH_SKEW_MS = 5 * 60_000;

function env(name) {
  const value = process.env[name];
  return value === undefined || value === null ? '' : String(value).trim();
}

export function getCTraderCredentials() {
  return {
    clientId: env('CTRADER_CLIENT_ID'),
    clientSecret: env('CTRADER_CLIENT_SECRET')
  };
}

export function credentialsConfigured() {
  const { clientId, clientSecret } = getCTraderCredentials();
  return Boolean(clientId && clientSecret);
}

function firstHeader(value) {
  return Array.isArray(value) ? value[0] : String(value ?? '').split(',')[0].trim();
}

export function getAppOrigin(req) {
  const configured = env('CTRADER_APP_URL');
  if (configured) return configured.replace(/\/+$/, '');

  const forwardedProto = firstHeader(req?.headers?.['x-forwarded-proto']);
  const host = firstHeader(req?.headers?.['x-forwarded-host']) || firstHeader(req?.headers?.host);
  const localHost = /^(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/i.test(host);
  const proto = forwardedProto || (localHost ? 'http' : 'https');
  if (!host) throw new Error('Impossible de déterminer le domaine public de l’application. Configure CTRADER_APP_URL sur Vercel.');
  return `${proto}://${host}`;
}

export function getRedirectUri(req) {
  return env('CTRADER_REDIRECT_URI') || `${getAppOrigin(req)}/api/auth/callback`;
}

export function buildAuthorizationUrl(req) {
  const { clientId } = getCTraderCredentials();
  if (!clientId) throw new Error('CTRADER_CLIENT_ID est manquant.');
  const url = new URL(AUTHORIZE_ENDPOINT);
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('redirect_uri', getRedirectUri(req));
  url.searchParams.set('scope', 'accounts');
  url.searchParams.set('product', 'web');
  return url.toString();
}

function cookieOptions({ maxAge, httpOnly = true } = {}) {
  const parts = ['Path=/', 'SameSite=Lax', 'Secure'];
  if (httpOnly) parts.push('HttpOnly');
  if (Number.isFinite(maxAge)) parts.push(`Max-Age=${Math.max(0, Math.floor(maxAge))}`);
  return parts.join('; ');
}

export function serializeCookie(name, value, options = {}) {
  return `${name}=${encodeURIComponent(value)}; ${cookieOptions(options)}`;
}

export function clearCookie(name) {
  return serializeCookie(name, '', { maxAge: 0 });
}

export function parseCookies(req) {
  const raw = req?.headers?.cookie;
  if (!raw) return {};
  return String(raw).split(';').reduce((acc, item) => {
    const idx = item.indexOf('=');
    if (idx === -1) return acc;
    const key = item.slice(0, idx).trim();
    const value = item.slice(idx + 1).trim();
    try { acc[key] = decodeURIComponent(value); } catch { acc[key] = value; }
    return acc;
  }, {});
}

function encryptionKey() {
  const { clientSecret } = getCTraderCredentials();
  const material = env('AUTH_COOKIE_SECRET') || clientSecret;
  if (!material) throw new Error('CTRADER_CLIENT_SECRET est requis pour sécuriser la session cTrader.');
  return createHash('sha256').update(material).digest();
}

export function sealSession(session) {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', encryptionKey(), iv);
  const plaintext = Buffer.from(JSON.stringify(session), 'utf8');
  const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString('base64url');
}

export function unsealSession(value) {
  if (!value) return null;
  try {
    const raw = Buffer.from(String(value), 'base64url');
    if (raw.length < 29) return null;
    const iv = raw.subarray(0, 12);
    const tag = raw.subarray(12, 28);
    const encrypted = raw.subarray(28);
    const decipher = createDecipheriv('aes-256-gcm', encryptionKey(), iv);
    decipher.setAuthTag(tag);
    const plaintext = Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8');
    const parsed = JSON.parse(plaintext);
    if (!parsed?.accessToken || !parsed?.refreshToken) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function getSessionFromRequest(req) {
  const cookies = parseCookies(req);
  return unsealSession(cookies[SESSION_COOKIE]);
}

export function hasPendingOAuth(req) {
  const cookies = parseCookies(req);
  return Boolean(cookies[PENDING_COOKIE]);
}

export function createPendingCookie() {
  return serializeCookie(PENDING_COOKIE, randomBytes(24).toString('base64url'), { maxAge: 10 * 60 });
}

export function clearPendingCookie() {
  return clearCookie(PENDING_COOKIE);
}

export function sessionCookie(session) {
  return serializeCookie(SESSION_COOKIE, sealSession(session), { maxAge: 365 * 24 * 60 * 60 });
}

export function clearSessionCookie() {
  return clearCookie(SESSION_COOKIE);
}

function normalizeTokenPayload(payload) {
  if (!payload || payload.errorCode) {
    throw new Error(payload?.description || payload?.errorCode || 'Réponse OAuth cTrader invalide.');
  }
  const accessToken = payload.accessToken;
  const refreshToken = payload.refreshToken;
  const expiresIn = Number(payload.expiresIn ?? 2_628_000);
  if (!accessToken || !refreshToken || !Number.isFinite(expiresIn)) {
    throw new Error('cTrader n’a pas renvoyé les tokens attendus.');
  }
  return {
    accessToken,
    refreshToken,
    expiresAt: Date.now() + expiresIn * 1000,
    tokenType: payload.tokenType || 'bearer'
  };
}

async function requestToken(url, method = 'GET') {
  const response = await fetch(url, {
    method,
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    cache: 'no-store'
  });
  let payload;
  try { payload = await response.json(); } catch { payload = null; }
  if (!response.ok) {
    throw new Error(payload?.description || `cTrader OAuth HTTP ${response.status}`);
  }
  return normalizeTokenPayload(payload);
}

export async function exchangeAuthorizationCode(code, redirectUri) {
  const { clientId, clientSecret } = getCTraderCredentials();
  if (!clientId || !clientSecret) throw new Error('CTRADER_CLIENT_ID / CTRADER_CLIENT_SECRET manquants.');
  if (!code) throw new Error('Code OAuth cTrader manquant.');

  const url = new URL(TOKEN_ENDPOINT);
  url.searchParams.set('grant_type', 'authorization_code');
  url.searchParams.set('code', code);
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('client_secret', clientSecret);
  return requestToken(url, 'GET');
}

export async function refreshOAuthSession(refreshToken) {
  const { clientId, clientSecret } = getCTraderCredentials();
  if (!clientId || !clientSecret) throw new Error('CTRADER_CLIENT_ID / CTRADER_CLIENT_SECRET manquants.');
  if (!refreshToken) throw new Error('Refresh token cTrader manquant.');

  const url = new URL(TOKEN_ENDPOINT);
  url.searchParams.set('grant_type', 'refresh_token');
  url.searchParams.set('refresh_token', refreshToken);
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('client_secret', clientSecret);
  return requestToken(url, 'POST');
}

export async function resolveOAuthSession(req, { refresh = true } = {}) {
  const session = getSessionFromRequest(req);
  if (!session) {
    return { connected: false, accessToken: null, source: null, session: null, setCookie: null };
  }

  if (!refresh || Number(session.expiresAt ?? 0) > Date.now() + REFRESH_SKEW_MS) {
    return { connected: true, accessToken: session.accessToken, source: 'oauth', session, setCookie: null };
  }

  const renewed = await refreshOAuthSession(session.refreshToken);
  return {
    connected: true,
    accessToken: renewed.accessToken,
    source: 'oauth',
    session: renewed,
    setCookie: sessionCookie(renewed)
  };
}

export const OAUTH_COOKIE_NAMES = Object.freeze({ SESSION_COOKIE, PENDING_COOKIE });
