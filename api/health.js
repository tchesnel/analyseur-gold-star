import { credentialsConfigured } from './_lib/oauth.js';
import { STRATEGIES } from '../strategies/index.js';

export default function handler(_req, res) {
  const mockMode = process.env.DATA_MODE === 'mock';
  res.status(200).json({
    ok: true,
    service: 'gold-live-analyzer',
    version: '0.8.2-decision-ux-signal-hold',
    mode: mockMode ? 'mock' : 'live',
    ctrader: {
      environment: 'live',
      credentialsConfigured: credentialsConfigured(),
      authentication: 'integrated-oauth',
      accountForced: Boolean(process.env.CTRADER_ACCOUNT_ID),
      symbolForced: Boolean(process.env.CTRADER_GOLD_SYMBOL)
    },
    strategies: STRATEGIES.length,
    executionEnabled: false,
    timestamp: new Date().toISOString()
  });
}
