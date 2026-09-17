import { clearPendingCookie, exchangeAuthorizationCode, getAppOrigin, getRedirectUri, hasPendingOAuth, sessionCookie } from '../_lib/oauth.js';

export default async function handler(req, res) {
  const code = String(req.query?.code ?? '');
  if (!code) {
    res.statusCode = 302;
    res.setHeader('Location', `${getAppOrigin(req)}/?ctrader=error&reason=missing_code`);
    res.end();
    return;
  }

  if (!hasPendingOAuth(req)) {
    res.statusCode = 302;
    res.setHeader('Location', `${getAppOrigin(req)}/?ctrader=error&reason=session_expired`);
    res.end();
    return;
  }

  try {
    const session = await exchangeAuthorizationCode(code, getRedirectUri(req));
    res.statusCode = 302;
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Set-Cookie', [sessionCookie(session), clearPendingCookie()]);
    res.setHeader('Location', `${getAppOrigin(req)}/?ctrader=connected`);
    res.end();
  } catch (error) {
    const reason = encodeURIComponent(error instanceof Error ? error.message : String(error));
    res.statusCode = 302;
    res.setHeader('Set-Cookie', clearPendingCookie());
    res.setHeader('Location', `${getAppOrigin(req)}/?ctrader=error&reason=${reason}`);
    res.end();
  }
}
