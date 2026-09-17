import { streamCTrader, TREND_PERIOD } from './_lib/ctrader.js';
import { streamMock } from './_lib/mock.js';
import { resolveOAuthSession } from './_lib/oauth.js';
import { REQUIRED_TIMEFRAMES, StrategyRuntime } from '../engine/strategy-runtime.js';
import { buildVisualAnalysis } from '../engine/visual-analysis.js';
import { fetchGoldMacroContext } from './_lib/macro.js';

export const config = { maxDuration: 300 };

function sse(res, event, data) {
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

export default async function handler(req, res) {
  const timeframe = String(req.query?.tf ?? 'M5').toUpperCase();
  if (!TREND_PERIOD[timeframe]) {
    res.status(400).json({ error: 'Unsupported timeframe', allowed: Object.keys(TREND_PERIOD) });
    return;
  }

  const mockMode = process.env.DATA_MODE === 'mock';
  let auth = { connected: false, accessToken: null, setCookie: null };

  if (!mockMode) {
    try {
      auth = await resolveOAuthSession(req);
    } catch (error) {
      res.status(401).json({ code: 'CTRADER_AUTH_REFRESH_FAILED', error: error instanceof Error ? error.message : String(error) });
      return;
    }

    if (!auth.connected || !auth.accessToken) {
      res.status(401).json({ code: 'CTRADER_NOT_CONNECTED', error: 'Connecte ton compte cTrader depuis le bouton intégré de l’analyseur.' });
      return;
    }
    if (auth.setCookie) res.setHeader('Set-Cookie', auth.setCookie);
  }

  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders?.();

  const controller = new AbortController();
  const abort = () => controller.abort();
  // IMPORTANT: ne jamais écouter req.close pour un flux SSE.
  // Sur Node/Vercel, req.close peut survenir dès que la requête entrante est
  // complètement lue, alors que la réponse SSE doit rester ouverte.
  // On coupe uniquement si le client abandonne la requête ou si la réponse ferme.
  req.on?.('aborted', abort);
  res.on?.('close', abort);
  const runtime = new StrategyRuntime();
  let lastVisualAt = 0;
  const VISUAL_MIN_INTERVAL_MS = 900;
  let macroTimer = null;

  const emit = (event, data) => {
    if (!controller.signal.aborted && !res.writableEnded) sse(res, event, data);
  };

  const ingestAndForward = (event, data) => {
    runtime.ingest(event, data);

    // Cockpits autonomes : R01 (M5/M1), R02 (H1/M5/M1) et R03 (H4/H1/M15/M5/M1).
    // Ils restent indépendants de l'unité de temps choisie sur le graphique principal.
    if ((event === 'history' || event === 'bar') && ['M1','M5','M15','H1','H4'].includes(data.timeframe)) {
      const strategyVisual = buildVisualAnalysis(runtime.snapshot(), data.timeframe);
      if (['M1','M5'].includes(data.timeframe)) {
        if (event === 'history') emit('strategy_history', { strategyId: 'R01', timeframe: data.timeframe, bars: [...(data.bars ?? [])].slice(-420), digits: data.digits, symbolName: data.symbolName });
        else if (data.bar) emit('strategy_bar', { strategyId: 'R01', timeframe: data.timeframe, bar: data.bar });
        if (strategyVisual?.overlays) emit('strategy_visual', { strategyId: 'R01', timeframe: data.timeframe, overlays: strategyVisual.overlays, metrics: strategyVisual.metrics ?? {} });
      }
      if (['M1','M5','H1'].includes(data.timeframe)) {
        if (event === 'history') emit('strategy_history', { strategyId: 'R02', timeframe: data.timeframe, bars: [...(data.bars ?? [])].slice(-420), digits: data.digits, symbolName: data.symbolName });
        else if (data.bar) emit('strategy_bar', { strategyId: 'R02', timeframe: data.timeframe, bar: data.bar });
        if (strategyVisual?.overlays) emit('strategy_visual', { strategyId: 'R02', timeframe: data.timeframe, overlays: strategyVisual.overlays, metrics: strategyVisual.metrics ?? {} });
      }
      if (['M1','M5','M15','H1','H4'].includes(data.timeframe)) {
        if (event === 'history') emit('strategy_history', { strategyId: 'R03', timeframe: data.timeframe, bars: [...(data.bars ?? [])].slice(-420), digits: data.digits, symbolName: data.symbolName });
        else if (data.bar) emit('strategy_bar', { strategyId: 'R03', timeframe: data.timeframe, bar: data.bar });
        if (strategyVisual?.overlays) emit('strategy_visual', { strategyId: 'R03', timeframe: data.timeframe, overlays: strategyVisual.overlays, metrics: strategyVisual.metrics ?? {} });
      }
    }

    // Le moteur visuel utilise les 6 timeframes, même si un seul est affiché.
    // Historique : recalcul immédiat pour enrichir progressivement le contexte HTF.
    // Live : recalcul sur barre OU quote afin que le classement/état des zones suive réellement le prix, avec throttle à 0,9 s.
    const now = Date.now();
    const visualDue = event === 'history' || ((event === 'bar' && data.timeframe === timeframe) || ['quote','depth','macro','macro_quote'].includes(event)) && now - lastVisualAt >= VISUAL_MIN_INTERVAL_MS;
    if (visualDue) {
      const visual = buildVisualAnalysis(runtime.snapshot(), timeframe);
      if (visual?.overlays) emit('visual', visual);
      lastVisualAt = now;
    }

    if (!((event === 'history' || event === 'bar') && data.timeframe !== timeframe)) emit(event, data);

    if (event === 'quote' || event === 'bar') {
      const results = runtime.evaluate(event === 'quote' ? 'tick' : `bar:${data.timeframe}`);
      if (results.length) emit('analysis', { results, readiness: runtime.readiness() });
    }
  };

  const refreshMacro = async () => {
    if (mockMode || controller.signal.aborted) return;
    try {
      const macro = await fetchGoldMacroContext();
      ingestAndForward('macro', { ...macro, source: 'official-public' });
    } catch (error) {
      emit('status', { stage: 'macro_unavailable', message: `Contexte macro temporairement indisponible: ${error instanceof Error ? error.message : String(error)}` });
    }
  };
  if (!mockMode) {
    void refreshMacro();
    macroTimer = setInterval(() => void refreshMacro(), 5 * 60_000);
  }

  emit('status', {
    stage: 'stream_started',
    timeframe,
    analysisTimeframes: REQUIRED_TIMEFRAMES,
    mode: mockMode ? 'mock' : 'live',
    authSource: mockMode ? 'mock' : auth.source,
    message: mockMode ? 'Flux de simulation initialisé' : 'Flux cTrader LIVE initialisé'
  });

  try {
    const args = {
      timeframe,
      timeframes: REQUIRED_TIMEFRAMES,
      emit: ingestAndForward,
      signal: controller.signal,
      accessToken: auth.accessToken
    };
    if (mockMode) await streamMock(args);
    else await streamCTrader(args);
  } catch (error) {
    emit('fatal', { code: 'STREAM_FAILURE', description: error instanceof Error ? error.message : String(error) });
  } finally {
    if (macroTimer) clearInterval(macroTimer);
    if (!res.writableEnded) res.end();
  }
}
