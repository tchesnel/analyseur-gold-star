// Primitives déterministes communes. Les stratégies décideront lesquelles utiliser.
export function sma(values, period) {
  if (!Number.isInteger(period) || period < 1 || values.length < period) return null;
  const slice = values.slice(-period);
  return slice.reduce((a,b)=>a+b,0) / period;
}

export function ema(values, period) {
  if (!Number.isInteger(period) || period < 1 || values.length < period) return null;
  const k = 2 / (period + 1);
  let out = values.slice(0, period).reduce((a,b)=>a+b,0) / period;
  for (const v of values.slice(period)) out = v * k + out * (1-k);
  return out;
}

export function trueRange(current, previous) {
  if (!current) return null;
  if (!previous) return current.high - current.low;
  return Math.max(current.high-current.low, Math.abs(current.high-previous.close), Math.abs(current.low-previous.close));
}

export function atr(bars, period = 14) {
  if (bars.length < period + 1) return null;
  const ranges = bars.slice(-(period+1)).map((b,i,arr)=> i===0 ? null : trueRange(b,arr[i-1])).filter(Number.isFinite);
  return ranges.reduce((a,b)=>a+b,0) / ranges.length;
}

export function rsi(values, period = 14) {
  if (values.length < period + 1) return null;
  const slice = values.slice(-(period+1));
  let gains=0, losses=0;
  for(let i=1;i<slice.length;i++){const d=slice[i]-slice[i-1]; if(d>=0)gains+=d; else losses-=d;}
  if (losses === 0) return 100;
  const rs=(gains/period)/(losses/period);
  return 100-(100/(1+rs));
}
