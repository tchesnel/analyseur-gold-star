export const CTRADER_PAYLOAD = Object.freeze({
  HEARTBEAT: 51,
  APP_AUTH_REQ: 2100,
  APP_AUTH_RES: 2101,
  ACCOUNT_AUTH_REQ: 2102,
  ACCOUNT_AUTH_RES: 2103,
  SYMBOLS_LIST_REQ: 2114,
  SYMBOLS_LIST_RES: 2115,
  SYMBOL_BY_ID_REQ: 2116,
  SYMBOL_BY_ID_RES: 2117,
  SUBSCRIBE_SPOTS_REQ: 2127,
  SUBSCRIBE_SPOTS_RES: 2128,
  SPOT_EVENT: 2131,
  SUBSCRIBE_LIVE_TRENDBAR_REQ: 2135,
  GET_TRENDBARS_REQ: 2137,
  GET_TRENDBARS_RES: 2138,
  ERROR_RES: 2142,
  GET_ACCOUNTS_REQ: 2149,
  GET_ACCOUNTS_RES: 2150,
  CLIENT_DISCONNECT_EVENT: 2148,
  ACCOUNT_DISCONNECT_EVENT: 2164,
  SUBSCRIBE_LIVE_TRENDBAR_RES: 2165,
  DEPTH_EVENT: 2155,
  SUBSCRIBE_DEPTH_QUOTES_REQ: 2156,
  SUBSCRIBE_DEPTH_QUOTES_RES: 2157
});

export const TREND_PERIOD = Object.freeze({
  M1: 1,
  M5: 5,
  M15: 7,
  M30: 8,
  H1: 9,
  H4: 10
});

export const PERIOD_TO_NAME = Object.freeze(Object.fromEntries(Object.entries(TREND_PERIOD).map(([k,v]) => [v,k])));

export const PERIOD_MS = Object.freeze({
  M1: 60_000,
  M5: 300_000,
  M15: 900_000,
  M30: 1_800_000,
  H1: 3_600_000,
  H4: 14_400_000
});

export function buildMessage(payloadType, payload = {}, clientMsgId = crypto.randomUUID()) {
  return JSON.stringify({ clientMsgId, payloadType, payload });
}

export function normalizeSymbolName(value = '') {
  return String(value).toUpperCase().replace(/[^A-Z0-9]/g, '');
}

export function selectGoldSymbol(symbols = [], forcedName = '') {
  if (!Array.isArray(symbols) || symbols.length === 0) return null;
  const forced = normalizeSymbolName(forcedName);
  if (forced) {
    const exact = symbols.find((s) => normalizeSymbolName(s.symbolName ?? s.name) === forced);
    if (exact) return exact;
  }

  const scored = symbols.map((symbol) => {
    const name = normalizeSymbolName(symbol.symbolName ?? symbol.name);
    const description = String(symbol.description ?? '').toLowerCase();
    let score = 0;
    if (name === 'XAUUSD') score += 100;
    if (name.startsWith('XAUUSD')) score += 70;
    if (name.includes('XAU') && name.includes('USD')) score += 50;
    if (name === 'GOLD') score += 45;
    if (name.includes('GOLD')) score += 25;
    if (description.includes('gold')) score += 15;
    if (symbol.enabled !== false) score += 5;
    return { symbol, score };
  }).sort((a, b) => b.score - a.score);

  return scored[0]?.score > 0 ? scored[0].symbol : null;
}


export function selectDollarIndexSymbol(symbols = []) {
  if (!Array.isArray(symbols) || symbols.length === 0) return null;
  const scored = symbols.map((symbol) => {
    const name = normalizeSymbolName(symbol.symbolName ?? symbol.name);
    const description = String(symbol.description ?? '').toLowerCase();
    let score = 0;
    if (['DXY','USDX','USDINDEX','DOLLARINDEX'].includes(name)) score += 100;
    if (name.includes('DXY') || name.includes('USDX')) score += 70;
    if (name.includes('USD') && name.includes('INDEX')) score += 45;
    if (description.includes('dollar') && description.includes('index')) score += 35;
    if (symbol.enabled !== false) score += 5;
    return { symbol, score };
  }).sort((a,b) => b.score - a.score);
  return scored[0]?.score >= 40 ? scored[0].symbol : null;
}

export function applyDepthEvent(book = new Map(), payload = {}, digits = 2) {
  for (const id of payload?.deletedQuotes ?? []) book.delete(String(id));
  for (const q of payload?.newQuotes ?? []) {
    const id = String(q?.id ?? ''); if (!id) continue;
    const bid = relativePrice(q?.bid, digits), ask = relativePrice(q?.ask, digits);
    const size = Number(q?.size) / 100;
    if (!Number.isFinite(size) || size < 0 || (!Number.isFinite(bid) && !Number.isFinite(ask))) continue;
    book.set(id, { id, bid, ask, size });
  }
  return book;
}

export function summarizeDepthBook(book = new Map(), { levels = 10 } = {}) {
  const bids = new Map(), asks = new Map();
  for (const q of book.values()) {
    if (Number.isFinite(q.bid)) bids.set(q.bid, (bids.get(q.bid) ?? 0) + q.size);
    if (Number.isFinite(q.ask)) asks.set(q.ask, (asks.get(q.ask) ?? 0) + q.size);
  }
  const bidLevels = [...bids.entries()].map(([price,size])=>({price,size})).sort((a,b)=>b.price-a.price).slice(0,levels);
  const askLevels = [...asks.entries()].map(([price,size])=>({price,size})).sort((a,b)=>a.price-b.price).slice(0,levels);
  const bidSize = bidLevels.reduce((s,x)=>s+x.size,0), askSize = askLevels.reduce((s,x)=>s+x.size,0), total=bidSize+askSize;
  const ratio = askSize > 0 ? bidSize / askSize : bidSize > 0 ? Infinity : null;
  const imbalance = total > 0 ? (bidSize-askSize)/total : null;
  const bidWall = bidLevels.reduce((a,b)=>!a||b.size>a.size?b:a,null);
  const askWall = askLevels.reduce((a,b)=>!a||b.size>a.size?b:a,null);
  const bestBid=bidLevels[0]?.price??null,bestAsk=askLevels[0]?.price??null;
  return { available: bidLevels.length>0 || askLevels.length>0, bidLevels, askLevels, bidSize, askSize, ratio, imbalance, bidWall, askWall, bestBid, bestAsk, timestamp: Date.now() };
}

export function selectAccount(accounts = [], env = 'live', forcedId = '') {
  const wanted = String(forcedId || '');
  if (wanted) {
    const exact = accounts.find((a) => String(a.ctidTraderAccountId) === wanted);
    if (exact) return exact;
  }
  const isLive = env !== 'demo';
  return accounts.find((a) => typeof a.isLive === 'boolean' ? a.isLive === isLive : true) ?? accounts[0] ?? null;
}

export function relativePrice(value, digits = 2) {
  if (value === undefined || value === null || value === '') return null;
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return Number((n / 100000).toFixed(Math.max(0, Math.min(8, Number(digits) || 0))));
}


export function spotReferenceValue(quote = {}) {
  const bid = quote?.bid === null || quote?.bid === undefined || quote?.bid === '' ? null : Number(quote.bid);
  const ask = quote?.ask === null || quote?.ask === undefined || quote?.ask === '' ? null : Number(quote.ask);
  if (Number.isFinite(bid) && Number.isFinite(ask)) return (bid + ask) / 2;
  if (Number.isFinite(bid)) return bid;
  if (Number.isFinite(ask)) return ask;
  return null;
}

export function mergeSpotQuote(previous = {}, payload = {}, digits = 2) {
  const incomingBid = relativePrice(payload?.bid, digits);
  const incomingAsk = relativePrice(payload?.ask, digits);
  const bid = Number.isFinite(incomingBid) ? incomingBid : (Number.isFinite(previous?.bid) ? Number(previous.bid) : null);
  const ask = Number.isFinite(incomingAsk) ? incomingAsk : (Number.isFinite(previous?.ask) ? Number(previous.ask) : null);
  const spread = Number.isFinite(bid) && Number.isFinite(ask) && ask >= bid ? Number((ask - bid).toFixed(Math.max(0, Math.min(8, Number(digits) || 0)))) : null;
  return { bid, ask, spread, timestamp: Number(payload?.timestamp ?? previous?.timestamp ?? Date.now()) };
}

export function trendbarToCandle(trendbar, digits = 2) {
  const lowRaw = Number(trendbar?.low);
  if (!Number.isFinite(lowRaw)) return null;
  const low = relativePrice(lowRaw, digits);
  const open = relativePrice(lowRaw + Number(trendbar.deltaOpen ?? 0), digits);
  const close = relativePrice(lowRaw + Number(trendbar.deltaClose ?? 0), digits);
  const high = relativePrice(lowRaw + Number(trendbar.deltaHigh ?? 0), digits);
  const minute = Number(trendbar.utcTimestampInMinutes);
  if (![low, open, close, high].every(Number.isFinite) || !Number.isFinite(minute)) return null;
  return {
    time: minute * 60_000,
    open,
    high,
    low,
    close,
    volume: Number(trendbar.volume ?? 0)
  };
}

export function timeframeRangeMs(timeframe, bars = 320) {
  const step = PERIOD_MS[timeframe] ?? PERIOD_MS.M5;
  return step * Math.max(50, Math.min(1000, bars + 20));
}

async function eventDataToText(data) {
  if (typeof data === 'string') return data;
  if (data instanceof ArrayBuffer) return new TextDecoder().decode(data);
  if (ArrayBuffer.isView(data)) return new TextDecoder().decode(data);
  if (data && typeof data.text === 'function') return data.text();
  return String(data ?? '');
}

export async function streamCTrader({ timeframe = 'M5', timeframes = [timeframe], emit, signal, accessToken }) {
  const env = 'live';
  const clientId = process.env.CTRADER_CLIENT_ID;
  const clientSecret = process.env.CTRADER_CLIENT_SECRET;

  if (!clientId || !clientSecret || !accessToken) {
    throw new Error('Connexion cTrader incomplète : configure l’ID et le Secret puis connecte ton compte via le portail intégré.');
  }
  const wantedTimeframes = [...new Set(timeframes)].filter((tf) => TREND_PERIOD[tf]);
  if (!wantedTimeframes.length) throw new Error(`Aucun timeframe supporté: ${timeframes.join(',')}`);

  const host = 'live.ctraderapi.com';
  const ws = new WebSocket(`wss://${host}:5036`);
  let accountId = null;
  let symbolId = null;
  let symbolName = null;
  let digits = 2;
  let dollarSymbolId = null;
  let dollarSymbolName = null;
  let dollarDigits = 3;
  let lastDollarQuote = { bid: null, ask: null, spread: null, timestamp: null };
  const depthBook = new Map();
  let lastDepthEmit = 0;
  let heartbeat = null;
  let liveTrendbarSubscriptionsStarted = false;
  let historyQueueStarted = false;
  let closed = false;
  let lastSpotQuote = { bid: null, ask: null, spread: null, timestamp: null };

  const send = (type, payload = {}) => {
    if (ws.readyState === WebSocket.OPEN) ws.send(buildMessage(type, payload));
  };

  const cleanup = () => {
    if (closed) return;
    closed = true;
    if (heartbeat) clearInterval(heartbeat);
    try { ws.close(1000, 'client-close'); } catch {}
  };

  const startHistoryQueue = async () => {
    if (historyQueueStarted) return;
    historyQueueStarted = true;
    const now = Date.now();
    // cTrader limite les requêtes historiques à 5/s par connexion.
    // On reste volontairement sous la limite (4/s).
    for (const tf of wantedTimeframes) {
      if (closed || signal?.aborted) return;
      send(CTRADER_PAYLOAD.GET_TRENDBARS_REQ, {
        ctidTraderAccountId: accountId,
        fromTimestamp: now - timeframeRangeMs(tf),
        toTimestamp: now,
        period: TREND_PERIOD[tf],
        symbolId,
        count: 320
      });
      await new Promise((resolve) => setTimeout(resolve, 260));
    }
  };

  const startLiveTrendbarSubscriptions = () => {
    if (liveTrendbarSubscriptionsStarted) return;
    liveTrendbarSubscriptionsStarted = true;
    for (const tf of wantedTimeframes) {
      send(CTRADER_PAYLOAD.SUBSCRIBE_LIVE_TRENDBAR_REQ, {
        ctidTraderAccountId: accountId,
        period: TREND_PERIOD[tf],
        symbolId
      });
    }
    emit('status', { stage: 'live_trendbars_subscribed', symbolId, symbolName, timeframes: wantedTimeframes, message: `Trendbars LIVE demandées sur ${wantedTimeframes.join('/')}` });
  };

  return await new Promise((resolve, reject) => {
    const abortHandler = () => { cleanup(); resolve(); };
    if (signal?.aborted) { abortHandler(); return; }
    signal?.addEventListener('abort', abortHandler, { once: true });
    const fail = (error) => {
      signal?.removeEventListener('abort', abortHandler);
      cleanup();
      reject(error instanceof Error ? error : new Error(String(error)));
    };

    ws.addEventListener('open', () => {
      emit('status', { stage: 'ctrader_connected', env, message: 'Connexion WebSocket cTrader établie' });
      send(CTRADER_PAYLOAD.APP_AUTH_REQ, { clientId, clientSecret });
      heartbeat = setInterval(() => send(CTRADER_PAYLOAD.HEARTBEAT, {}), 10_000);
    });

    ws.addEventListener('error', () => fail(new Error('Erreur de connexion WebSocket cTrader')));
    ws.addEventListener('close', (event) => {
      if (!closed && !signal?.aborted) {
        emit('status', { stage: 'ctrader_closed', code: event.code, reason: event.reason || '', message: 'Connexion cTrader fermée' });
      }
      signal?.removeEventListener('abort', abortHandler);
      cleanup();
      resolve();
    });

    ws.addEventListener('message', async (event) => {
      try {
        const text = await eventDataToText(event.data);
        const message = JSON.parse(text);
        const payload = message.payload ?? {};

        switch (message.payloadType) {
          case CTRADER_PAYLOAD.HEARTBEAT:
            break;
          case CTRADER_PAYLOAD.APP_AUTH_RES:
            emit('status', { stage: 'app_authorized', message: 'Application cTrader autorisée' });
            send(CTRADER_PAYLOAD.GET_ACCOUNTS_REQ, { accessToken });
            break;
          case CTRADER_PAYLOAD.GET_ACCOUNTS_RES: {
            const accounts = payload.ctidTraderAccount ?? [];
            const account = selectAccount(accounts, env, process.env.CTRADER_ACCOUNT_ID);
            if (!account) throw new Error('Aucun compte cTrader autorisé trouvé pour ce token.');
            accountId = Number(account.ctidTraderAccountId);
            if (!Number.isSafeInteger(accountId)) throw new Error('Identifiant de compte cTrader invalide.');
            emit('status', { stage: 'account_selected', accountId, isLive: account.isLive, message: 'Compte cTrader sélectionné' });
            send(CTRADER_PAYLOAD.ACCOUNT_AUTH_REQ, { ctidTraderAccountId: accountId, accessToken });
            break;
          }
          case CTRADER_PAYLOAD.ACCOUNT_AUTH_RES:
            emit('status', { stage: 'account_authorized', accountId, message: 'Compte cTrader autorisé' });
            send(CTRADER_PAYLOAD.SYMBOLS_LIST_REQ, { ctidTraderAccountId: accountId, includeArchivedSymbols: false });
            break;
          case CTRADER_PAYLOAD.SYMBOLS_LIST_RES: {
            const gold = selectGoldSymbol(payload.symbol ?? [], process.env.CTRADER_GOLD_SYMBOL);
            if (!gold) throw new Error('Impossible de trouver un symbole Gold/XAUUSD sur ce compte. Utilise CTRADER_GOLD_SYMBOL pour forcer le nom exact.');
            symbolId = Number(gold.symbolId);
            if (!Number.isSafeInteger(symbolId)) throw new Error('Identifiant du symbole Gold invalide.');
            symbolName = gold.symbolName ?? gold.name ?? 'XAUUSD';
            const dollar = selectDollarIndexSymbol(payload.symbol ?? []);
            dollarSymbolId = dollar ? Number(dollar.symbolId) : null;
            dollarSymbolName = dollar?.symbolName ?? dollar?.name ?? null;
            if (!Number.isSafeInteger(dollarSymbolId) || dollarSymbolId === symbolId) dollarSymbolId = null;
            emit('status', { stage: 'symbol_selected', symbolId, symbolName, dollarSymbolId, dollarSymbolName, message: `Symbole ${symbolName} sélectionné${dollarSymbolName ? ` • ${dollarSymbolName} suivi` : ''}` });
            send(CTRADER_PAYLOAD.SYMBOL_BY_ID_REQ, { ctidTraderAccountId: accountId, symbolId: [symbolId, ...(dollarSymbolId ? [dollarSymbolId] : [])] });
            break;
          }
          case CTRADER_PAYLOAD.SYMBOL_BY_ID_RES: {
            const full = (payload.symbol ?? []).find(x => Number(x.symbolId) === symbolId) ?? payload.symbol?.[0];
            if (full) digits = Number(full.digits ?? 2);
            const dollarFull = dollarSymbolId ? (payload.symbol ?? []).find(x => Number(x.symbolId) === dollarSymbolId) : null;
            if (dollarFull) dollarDigits = Number(dollarFull.digits ?? 3);
            void startHistoryQueue().catch(fail);
            send(CTRADER_PAYLOAD.SUBSCRIBE_SPOTS_REQ, {
              ctidTraderAccountId: accountId,
              symbolId: [symbolId, ...(dollarSymbolId ? [dollarSymbolId] : [])],
              subscribeToSpotTimestamp: true
            });
            emit('status', { stage: 'subscriptions_requested', symbolId, symbolName, digits, timeframes: wantedTimeframes, message: `Historique + spot LIVE demandés sur ${wantedTimeframes.join('/')}` });
            break;
          }
          case CTRADER_PAYLOAD.SUBSCRIBE_SPOTS_RES:
            emit('status', { stage: 'spots_subscribed', symbolId, symbolName, message: 'Flux spot XAUUSD LIVE confirmé' });
            startLiveTrendbarSubscriptions();
            send(CTRADER_PAYLOAD.SUBSCRIBE_DEPTH_QUOTES_REQ, { ctidTraderAccountId: accountId, symbolId: [symbolId] });
            break;
          case CTRADER_PAYLOAD.SUBSCRIBE_DEPTH_QUOTES_RES:
            emit('status', { stage: 'depth_subscribed', symbolId, symbolName, message: 'Market Depth / Level II XAUUSD actif' });
            break;
          case CTRADER_PAYLOAD.DEPTH_EVENT: {
            if (Number(payload.symbolId) !== symbolId) break;
            applyDepthEvent(depthBook, payload, digits);
            const now = Date.now();
            if (now - lastDepthEmit >= 500) { emit('depth', { ...summarizeDepthBook(depthBook), source: 'ctrader' }); lastDepthEmit = now; }
            break;
          }
          case CTRADER_PAYLOAD.GET_TRENDBARS_RES: {
            const bars = (payload.trendbar ?? []).map((bar) => trendbarToCandle(bar, digits)).filter(Boolean).sort((a, b) => a.time - b.time);
            const tf = PERIOD_TO_NAME[Number(payload.period)] ?? timeframe;
            emit('history', { bars, symbolId, symbolName, digits, timeframe: tf, source: 'ctrader' });
            break;
          }
          case CTRADER_PAYLOAD.SPOT_EVENT: {
            const eventSymbolId = Number(payload.symbolId);
            if (dollarSymbolId && eventSymbolId === dollarSymbolId) {
              lastDollarQuote = mergeSpotQuote(lastDollarQuote, payload, dollarDigits);
              emit('macro_quote', { dxy: { ...lastDollarQuote, value: spotReferenceValue(lastDollarQuote), symbolName: dollarSymbolName, source: 'ctrader' }, source: 'ctrader' });
              break;
            }
            if (eventSymbolId && eventSymbolId !== symbolId) break;
            startLiveTrendbarSubscriptions();
            lastSpotQuote = mergeSpotQuote(lastSpotQuote, payload, digits);
            if (Number.isFinite(lastSpotQuote.bid) || Number.isFinite(lastSpotQuote.ask)) {
              emit('quote', { ...lastSpotQuote, source: 'ctrader' });
            }
            for (const bar of payload.trendbar ?? []) {
              const candle = trendbarToCandle(bar, digits);
              const tf = PERIOD_TO_NAME[Number(bar.period)] ?? timeframe;
              if (candle) emit('bar', { bar: candle, timeframe: tf, source: 'ctrader' });
            }
            break;
          }
          case CTRADER_PAYLOAD.ACCOUNT_DISCONNECT_EVENT:
            throw new Error(payload.description || 'cTrader a déconnecté le compte LIVE.');
          case CTRADER_PAYLOAD.CLIENT_DISCONNECT_EVENT:
            throw new Error(payload.description || 'cTrader a fermé la session cliente.');
          case CTRADER_PAYLOAD.ERROR_RES:
          case 50:
            emit('error', { code: payload.errorCode ?? 'CTRADER_ERROR', description: payload.description ?? 'Erreur cTrader' });
            break;
          default:
            break;
        }
      } catch (error) {
        fail(error);
      }
    });
  });
}
