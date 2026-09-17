import { PERIOD_MS } from './ctrader.js';

function seededNoise(seed) {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

export function generateMockHistory(timeframe = 'M5', count = 180, now = Date.now()) {
  const period = PERIOD_MS[timeframe] ?? PERIOD_MS.M5;
  const end = Math.floor(now / period) * period;
  const bars = [];
  let price = 3640;
  for (let i = count - 1; i >= 0; i--) {
    const time = end - i * period;
    const seed = Math.floor(time / period);
    const wave = Math.sin(seed / 8) * 1.6 + Math.sin(seed / 27) * 3.4;
    const drift = (seededNoise(seed) - 0.5) * 3.2;
    const open = price;
    const close = Math.max(3200, open + wave * 0.2 + drift);
    const high = Math.max(open, close) + 0.7 + seededNoise(seed + 1) * 2.2;
    const low = Math.min(open, close) - 0.7 - seededNoise(seed + 2) * 2.2;
    price = close;
    bars.push({ time, open: round(open), high: round(high), low: round(low), close: round(close), volume: Math.floor(500 + seededNoise(seed + 3) * 1200) });
  }
  return bars;
}

function round(n) { return Number(n.toFixed(2)); }

export async function streamMock({ timeframe = 'M5', timeframes = [timeframe], emit, signal }) {
  const wanted = [...new Set(timeframes)];
  const histories = Object.fromEntries(wanted.map((tf) => [tf, generateMockHistory(tf)]));
  const currents = Object.fromEntries(wanted.map((tf) => [tf, { ...histories[tf].at(-1) }]));
  emit('status', { stage: 'mock_ready', message: 'Mode simulation actif — aucune donnée cTrader utilisée' });
  emit('macro', { available:true, bias:'neutral', risk:'normal', dxy:{value:104.2,change:-0.15,proxy:'mock DXY'}, us10y:{value:4.12,change:-0.03}, real10y:{value:1.78,change:-0.02}, nextEvent:{type:'CPI',title:'Mock CPI',time:Date.now()+6*3600_000,impact:'critical',source:'mock'}, events:[], source:'mock' });
  for (const tf of wanted) emit('history', { bars: histories[tf], symbolName: 'XAUUSD', digits: 2, timeframe: tf, source: 'mock' });
  let bid = currents[timeframe]?.close ?? Object.values(currents)[0]?.close ?? 3640;

  return await new Promise((resolve) => {
    const timer = setInterval(() => {
      if (signal?.aborted) {
        clearInterval(timer);
        resolve();
        return;
      }
      const change = (Math.random() - 0.5) * 1.1;
      bid = round(Math.max(1, bid + change));
      const ask = round(bid + 0.24);
      emit('quote', { bid, ask, spread: round(ask - bid), timestamp: Date.now(), source: 'mock' });
      const levels=Array.from({length:8},(_,i)=>({price:round(bid-(i+1)*0.12),size:100+(8-i)*25})); const asks=Array.from({length:8},(_,i)=>({price:round(ask+(i+1)*0.12),size:90+(8-i)*20})); const bidSize=levels.reduce((a,x)=>a+x.size,0),askSize=asks.reduce((a,x)=>a+x.size,0),total=bidSize+askSize; emit('depth',{available:true,bidLevels:levels,askLevels:asks,bidSize,askSize,ratio:bidSize/askSize,imbalance:(bidSize-askSize)/total,bidWall:levels[0],askWall:asks[0],bestBid:levels[0].price,bestAsk:asks[0].price,timestamp:Date.now(),source:'mock'});
      for (const tf of wanted) {
        const step = PERIOD_MS[tf] ?? PERIOD_MS.M5;
        const bucket = Math.floor(Date.now() / step) * step;
        let current = currents[tf];
        if (!current || bucket !== current.time) current = currents[tf] = { time: bucket, open: bid, high: bid, low: bid, close: bid, volume: 0 };
        current.high = Math.max(current.high, bid);
        current.low = Math.min(current.low, bid);
        current.close = bid;
        current.volume += 1;
        emit('bar', { bar: { ...current }, timeframe: tf, source: 'mock' });
      }
    }, 850);

    signal?.addEventListener('abort', () => {
      clearInterval(timer);
      resolve();
    }, { once: true });
  });
}
