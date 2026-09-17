export const DEFAULT_SIGNAL_HOLD_MS = Object.freeze({ R01: 15 * 60_000, R02: 15 * 60_000, R03: 15 * 60_000 });

const finite = n => n !== null && n !== undefined && n !== '' && Number.isFinite(Number(n));

export function setupIdentity(routeId, result) {
  const plan = result?.plan;
  if (!plan) return null;
  if (routeId === 'R01') {
    const t = plan?.sweep?.time;
    return finite(t) ? `R01:${Number(t)}:${String(plan.direction ?? result?.direction ?? '')}` : null;
  }
  if (routeId === 'R02') {
    const t = plan?.breakout?.time;
    return finite(t) ? `R02:${Number(t)}:${String(plan.direction ?? result?.direction ?? 'buy')}` : null;
  }
  if (routeId === 'R03') {
    const t = plan?.setup?.zoneTouchTime ?? plan?.confirmation?.time;
    return finite(t) ? `R03:${Number(t)}:${String(plan.direction ?? result?.direction ?? '')}` : null;
  }
  return null;
}

export function createSignalHold(routeId, result, now = Date.now(), ttlMs = DEFAULT_SIGNAL_HOLD_MS[routeId] ?? 15 * 60_000) {
  if (!result?.plan) return null;
  const id = setupIdentity(routeId, result);
  if (!id) return null;
  return {
    routeId,
    setupId: id,
    lockedAt: Number(now),
    expiresAt: Number(now) + Number(ttlMs),
    direction: String(result.plan.direction ?? result.direction ?? '').toLowerCase(),
    plan: JSON.parse(JSON.stringify(result.plan)),
    overlays: JSON.parse(JSON.stringify(result.overlays ?? { zones: [], lines: [], markers: [] }))
  };
}

export function isSignalHoldActive(hold, now = Date.now()) {
  return Boolean(hold && finite(hold.expiresAt) && Number(now) < Number(hold.expiresAt));
}

export function remainingSignalHoldMs(hold, now = Date.now()) {
  if (!isSignalHoldActive(hold, now)) return 0;
  return Math.max(0, Number(hold.expiresAt) - Number(now));
}

export function shouldCaptureSignal(routeId, result, currentHold, now = Date.now()) {
  const nextId = setupIdentity(routeId, result);
  if (!nextId) return false;
  if (!isSignalHoldActive(currentHold, now)) return true;
  return currentHold.setupId !== nextId;
}

export function formatSignalCountdown(ms) {
  const total = Math.max(0, Math.ceil(Number(ms || 0) / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
