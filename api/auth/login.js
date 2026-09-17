import { buildAuthorizationUrl, createPendingCookie, credentialsConfigured } from '../_lib/oauth.js';

export default function handler(req, res) {
  if (!credentialsConfigured()) {
    res.status(500).json({ error: 'CTRADER_CLIENT_ID et CTRADER_CLIENT_SECRET doivent être configurés sur Vercel.' });
    return;
  }

  try {
    const target = buildAuthorizationUrl(req);
    res.statusCode = 302;
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Set-Cookie', createPendingCookie());
    res.setHeader('Location', target);
    res.end();
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
  }
}
