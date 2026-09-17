import { STRATEGIES } from '../strategies/index.js';

export const REQUIRED_TIMEFRAMES = Object.freeze(['M1','M5','M15','M30','H1','H4']);

function upsert(list, bar, max = 1200) {
  const bars = list ?? [];
  const last = bars.at(-1);
  if (!last || bar.time > last.time) bars.push(bar);
  else if (bar.time === last.time) bars[bars.length - 1] = bar;
  else {
    const idx = bars.findIndex((b) => b.time === bar.time);
    if (idx >= 0) bars[idx] = bar;
  }
  if (bars.length > max) bars.splice(0, bars.length - max);
  return bars;
}

function validateResult(strategyId, result, strategyMeta = {}) {
  if (!result || typeof result !== 'object') throw new Error(`${strategyId}: résultat invalide`);
  if (!['idle','watching','validated','rejected'].includes(result.status)) throw new Error(`${strategyId}: status invalide`);
  const conditions = Array.isArray(result.conditions) ? result.conditions : [];
  for (const c of conditions) {
    if (typeof c?.id !== 'string' || typeof c?.passed !== 'boolean') throw new Error(`${strategyId}: condition invalide`);
  }
  if (result.status === 'validated' && conditions.some((c) => c.required !== false && !c.passed)) {
    throw new Error(`${strategyId}: un setup VALIDATED ne peut pas contenir une condition obligatoire FAIL`);
  }
  return {
    strategyId,
    status: result.status,
    stage: result.stage ?? null,
    direction: result.direction ?? null,
    conditions,
    overlays: result.overlays ?? { zones: [], lines: [], markers: [] },
    plan: result.plan ?? null,
    reason: result.reason ?? null,
    readiness: result.readiness ?? null,
    researchContract: result.researchContract ?? null,
    mode: strategyMeta.mode ?? 'active',
    promotionGate: strategyMeta.promotionGate ?? null,
    actionable: (strategyMeta.mode ?? 'active') === 'active' && result.status === 'validated',
    evaluatedAt: Date.now()
  };
}

export class StrategyRuntime {
  constructor(strategies = STRATEGIES) {
    this.strategies = [...strategies];
    this.bars = Object.fromEntries(REQUIRED_TIMEFRAMES.map((tf) => [tf, []]));
    this.quote = null;
    this.symbol = null;
    this.meta = {};
    this.depth = null;
    this.macro = null;
  }

  ingest(event, data) {
    if (event === 'history' && REQUIRED_TIMEFRAMES.includes(data.timeframe)) this.bars[data.timeframe] = [...(data.bars ?? [])].slice(-1200);
    if (event === 'bar' && REQUIRED_TIMEFRAMES.includes(data.timeframe) && data.bar) upsert(this.bars[data.timeframe], data.bar);
    if (event === 'quote') this.quote = data;
    if (event === 'depth') this.depth = data ? { ...data } : null;
    if (event === 'macro' && data) {
      const previous = this.macro ?? {};
      const brokerDxy = previous?.dxy?.source === 'ctrader' ? previous.dxy : null;
      this.macro = { ...previous, ...data, dxy: brokerDxy ?? data.dxy ?? previous.dxy ?? null };
    }
    if (event === 'macro_quote' && data?.dxy) {
      this.macro = { ...(this.macro ?? {}), dxy: { ...(this.macro?.dxy ?? {}), ...data.dxy, source: 'ctrader' }, available: true };
    }
    if (data?.symbolName) this.symbol = data.symbolName;
    if (data?.digits !== undefined) this.meta.digits = data.digits;
  }

  snapshot() {
    return Object.freeze({
      now: Date.now(),
      symbol: this.symbol ?? 'XAUUSD',
      quote: this.quote ? { ...this.quote } : null,
      bars: Object.fromEntries(REQUIRED_TIMEFRAMES.map((tf) => [tf, [...this.bars[tf]]])),
      meta: { ...this.meta },
      depth: this.depth ? structuredClone(this.depth) : null,
      macro: this.macro ? structuredClone(this.macro) : null
    });
  }

  evaluate(trigger = 'tick') {
    if (!this.strategies.length) return [];
    const snapshot = this.snapshot();
    return this.strategies.map((strategy) => {
      if (!strategy?.id || typeof strategy.evaluate !== 'function') throw new Error('Stratégie enregistrée sans id/evaluate');
      return validateResult(strategy.id, strategy.evaluate(snapshot, { trigger }), strategy);
    });
  }

  readiness() {
    return Object.fromEntries(REQUIRED_TIMEFRAMES.map((tf) => [tf, this.bars[tf].length > 0]));
  }
}

export { validateResult };
