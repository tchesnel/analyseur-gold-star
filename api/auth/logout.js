import { clearPendingCookie, clearSessionCookie } from '../_lib/oauth.js';

export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Set-Cookie', [clearSessionCookie(), clearPendingCookie()]);
  res.status(200).json({ ok: true, connected: false });
}
