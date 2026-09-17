import { credentialsConfigured, getRedirectUri, resolveOAuthSession } from '../_lib/oauth.js';

export default async function handler(req, res) {
  try {
    const auth = credentialsConfigured() ? await resolveOAuthSession(req) : { connected: false, source: null, setCookie: null, session: null };
    if (auth.setCookie) res.setHeader('Set-Cookie', auth.setCookie);
    res.status(200).json({
      ok: true,
      configured: credentialsConfigured(),
      connected: Boolean(auth.connected),
      source: auth.source,
      environment: 'live',
      scope: 'accounts',
      expiresAt: auth.session?.expiresAt ?? null,
      redirectUri: getRedirectUri(req)
    });
  } catch (error) {
    res.status(200).json({
      ok: false,
      configured: credentialsConfigured(),
      connected: false,
      environment: 'live',
      scope: 'accounts',
      redirectUri: getRedirectUri(req),
      error: error instanceof Error ? error.message : String(error)
    });
  }
}
