// Shared AudioManager with ambient helpers
export class AudioManager {
  constructor(profile = 'pc', volumes = { master: 0.7, music: 0.4, sfx: 0.8 }) {
    this.profile = profile;
    this.enabled = true;
    this.master = volumes.master; this.music = volumes.music; this.sfx = volumes.sfx;
    this.sounds = {}; this.musicTracks = {}; this.currentAmbient = null;
    try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch { this.enabled = false; }
  }

  load(key, file, opts = { instances: 3, ambient: false }) {
    if (!this.enabled) return;
    const baseVol = opts.ambient ? this.music * this.master : this.sfx * this.master;
    const a = new Audio(file); a.preload = this.profile === 'mobile' ? (opts.ambient ? 'metadata' : 'metadata') : 'auto'; a.volume = baseVol;
    const data = { audio: a, instances: [a], currentInstance: 0 }; this.sounds[key] = data;
    if (!opts.ambient && this.profile !== 'mobile') for (let i = 1; i < (opts.instances || 1); i++) { const iA = new Audio(file); iA.preload = a.preload; iA.volume = baseVol; data.instances.push(iA); }
    if (opts.ambient) { a.loop = true; this.musicTracks[key] = a; }
  }

  play(key, volume = 1.0, pitch = 1.0) {
    if (!this.enabled) return;
    const d = this.sounds[key]; if (!d) return;
    const inst = d.instances[d.currentInstance]; d.currentInstance = (d.currentInstance + 1) % d.instances.length;
    inst.currentTime = 0; inst.volume = Math.max(0, Math.min(1, volume * (key.startsWith('ambient_') ? this.music : this.sfx) * this.master));
    if (inst.playbackRate !== undefined && pitch !== 1.0) inst.playbackRate = Math.max(0.25, Math.min(4.0, pitch));
    const p = inst.play(); if (p) p.catch(() => {});
  }

  startAmbient(key) {
    if (!this.enabled) return; const t = this.musicTracks[key]; if (!t) return;
    try { t.volume = this.music * this.master; t.currentTime = 0; const pr = t.play(); if (pr) pr.then(() => { this.currentAmbient = key; }).catch(() => {}); } catch {}
  }

  fadeToAmbient(nextKey) {
    if (!this.enabled || this.currentAmbient === nextKey) return;
    const cur = this.musicTracks[this.currentAmbient], nxt = this.musicTracks[nextKey]; if (!nxt) return;
    if (cur && !cur.paused) {
      const start = cur.volume, step = start / (2000 / 50);
      const iv = setInterval(() => { if (cur.volume > step) { cur.volume -= step; } else { cur.volume = 0; cur.pause(); clearInterval(iv); } }, 50);
    }
    setTimeout(() => this.startAmbient(nextKey), 1000);
  }
}