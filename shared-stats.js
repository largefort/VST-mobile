// Shared stats persistence helpers
export function loadPersistentStats(key) {
  try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : null; } catch { return null; }
}
export function savePersistentStats(key, status) {
  try { localStorage.setItem(key, JSON.stringify(status)); } catch {}
}
export function mergeBestStats(current, incoming) {
  const cur = current || { happiness: 0, defense: 0, prosperity: 0 };
  const inc = incoming || { happiness: 0, defense: 0, prosperity: 0 };
  return {
    happiness: Math.max(cur.happiness || 0, inc.happiness || 0),
    defense: Math.max(cur.defense || 0, inc.defense || 0),
    prosperity: Math.max(cur.prosperity || 0, inc.prosperity || 0)
  };
}

