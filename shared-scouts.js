// Shared scout helpers
export function validateScoutData(s) {
  try {
    if (!s || typeof s !== 'object') return false;
    if (![s.x, s.y, s.speed, s.health, s.range].every(n => typeof n === 'number' && isFinite(n))) return false;
    if (s.speed <= 0 || s.range <= 0) return false;
    if (Math.abs(s.x) > 1e6 || Math.abs(s.y) > 1e6) return false;
    if (s.speed > 1000 || s.health > 10000 || s.range > 1000) return false;
    return true;
  } catch { return false; }
}

export function dispatchScout(game, x, y, limits = { min: 10, max: 2000 }) {
  if (!game.scouts || game.scouts.length === 0) {
    game.spawnInitialScout?.();
    game.showNotification?.('No scouts available - created new scout', 'warning');
    return false;
  }
  const s = game.scouts[0];
  if (!validateScoutData(s)) {
    game.scouts.splice(0, 1);
    game.spawnInitialScout?.();
    game.showNotification?.('Scout invalid - replaced with a new one', 'warning');
    return false;
  }
  const dx = x - s.x, dy = y - s.y, d = Math.hypot(dx, dy);
  if (d < limits.min) { game.showNotification?.('Target too close', 'warning'); return false; }
  if (d > limits.max) { game.showNotification?.('Target too far', 'warning'); return false; }
  s.target = { x, y }; s.exploring = true;
  game.showNotification?.('Scout dispatched!', 'success');
  return true;
}

export function sanitizeScoutsList(scouts, spawnFallback) {
  const out = [];
  scouts?.forEach(s => { if (validateScoutData(s)) { const dup = out.some(u => Math.abs(u.x - s.x) < 1 && Math.abs(u.y - s.y) < 1); if (!dup) out.push(s); } });
  if (!out.length && typeof spawnFallback === 'function') spawnFallback();
  return out.length ? out : scouts;
}