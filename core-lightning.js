// Shared LightningManager for PC and Mobile
export class LightningManager {
  constructor(profile = 'pc', game) {
    this.profile = profile;
    this.game = game;
    this.enabled = true;
    this.strikes = [];
    this.nextStrike = 0;
    this.minInterval = profile === 'mobile' ? 8000 : 5000;
    this.maxInterval = profile === 'mobile' ? 45000 : 30000;
    this.stormChance = profile === 'mobile' ? 0.25 : 0.3;
    this.normalChance = profile === 'mobile' ? 0.015 : 0.02;
  }

  update(deltaTime, dayNightInfo) {
    const now = Date.now();
    let chance = this.normalChance;
    if (dayNightInfo.phase === 'night' || dayNightInfo.phase === 'dusk') chance *= (this.profile === 'mobile' ? 1.5 : 2);
    const weatherNoise = this.game.seededNoise(now * 0.0001, this.game.seed);
    const isStormy = weatherNoise > (this.profile === 'mobile' ? 0.4 : 0.3);
    if (isStormy) chance = this.stormChance;
    if (now > this.nextStrike && Math.random() < chance) {
      this._createStrike();
      const interval = this.minInterval + Math.random() * (this.maxInterval - this.minInterval);
      this.nextStrike = now + interval;
    }
    this.strikes = this.strikes.filter(s => { s.age += deltaTime; s.alpha = Math.max(0, 1 - (s.age / s.duration)); return s.age < s.duration; });
  }

  render(ctx, camera, canvasW, canvasH) {
    if (!this.enabled || this.strikes.length === 0) return;
    ctx.save();
    this.strikes.forEach(l => {
      ctx.globalAlpha = l.alpha; ctx.strokeStyle = l.color; ctx.lineWidth = l.width; ctx.lineCap = 'round'; ctx.shadowColor = l.color; ctx.shadowBlur = this.profile === 'mobile' ? 6 : 10;
      ctx.beginPath(); l.segments.forEach((seg, i) => { if (i === 0) ctx.moveTo(seg.startX, seg.startY); ctx.lineTo(seg.endX, seg.endY); }); ctx.stroke();
      l.branches.forEach(b => {
        ctx.globalAlpha = l.alpha * b.alpha; ctx.lineWidth = l.width * (this.profile === 'mobile' ? 0.5 : 0.6);
        ctx.beginPath(); b.segments.forEach((seg, i) => { if (i === 0) ctx.moveTo(seg.startX, seg.startY); ctx.lineTo(seg.endX, seg.endY); }); ctx.stroke();
      });
      if (l.flash.age < l.flash.duration) {
        const flashAlpha = (1 - (l.flash.age / l.flash.duration)) * l.flash.intensity * (this.profile === 'mobile' ? 0.2 : 0.3);
        ctx.save(); ctx.setTransform(1,0,0,1,0,0); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = flashAlpha; ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, canvasW, canvasH); ctx.restore();
        l.flash.age += 16;
      }
    });
    ctx.restore();
  }

  _createStrike() {
    const bounds = { l: this.game.camera.x, r: this.game.camera.x + this.game.canvas.width / this.game.camera.scale, t: this.game.camera.y, b: this.game.camera.y + this.game.canvas.height / this.game.camera.scale };
    const startX = bounds.l + Math.random() * (bounds.r - bounds.l);
    const startY = bounds.t - (this.profile === 'mobile' ? 150 : 200);
    const endX = startX + (Math.random() - 0.5) * (this.profile === 'mobile' ? 200 : 300);
    const endY = bounds.b + (this.profile === 'mobile' ? 50 : 100);
    const segments = this._genPath(startX, startY, endX, endY);
    const branches = this._genBranches(startX, startY, endX, endY);
    const l = {
      segments,
      branches,
      color: `hsl(${200 + Math.random() * 60}, 100%, ${80 + Math.random() * 20}%)`,
      width: (this.profile === 'mobile' ? 2 : 3) + Math.random() * (this.profile === 'mobile' ? 3 : 5),
      alpha: 1, age: 0, duration: (this.profile === 'mobile' ? 150 : 200) + Math.random() * (this.profile === 'mobile' ? 200 : 300),
      flash: { intensity: (this.profile === 'mobile' ? 0.6 : 0.8) + Math.random() * 0.3, duration: (this.profile === 'mobile' ? 80 : 100) + Math.random() * (this.profile === 'mobile' ? 80 : 100), age: 0 }
    };
    this.strikes.push(l);
    const play = this.profile === 'mobile' ? this.game.playMobileSound?.bind(this.game) : this.game.playSound?.bind(this.game);
    if (Math.random() < (this.profile === 'mobile' ? 0.5 : 0.7)) setTimeout(() => { try { play && play('thunder_distant', this.profile === 'mobile' ? 0.4 : 0.6); } catch {} }, 300 + Math.random() * (this.profile === 'mobile' ? 1500 : 2000));
  }

  _genPath(sx, sy, ex, ey) {
    const segs = []; const n = (this.profile === 'mobile' ? 12 : 20) + Math.floor(Math.random() * (this.profile === 'mobile' ? 10 : 20));
    let cx = sx, cy = sy;
    for (let i = 0; i < n; i++) {
      const p = i / n; const tx = sx + (ex - sx) * p, ty = sy + (ey - sy) * p;
      const jx = (Math.random() - 0.5) * (this.profile === 'mobile' ? 30 : 50) * (1 - p * 0.5);
      const jy = (Math.random() - 0.5) * (this.profile === 'mobile' ? 20 : 30);
      const nx = tx + jx, ny = ty + jy; segs.push({ startX: cx, startY: cy, endX: nx, endY: ny }); cx = nx; cy = ny;
    }
    return segs;
  }

  _genBranches(sx, sy, ex, ey) {
    const arr = []; const n = (this.profile === 'mobile' ? 1 : 2) + Math.floor(Math.random() * (this.profile === 'mobile' ? 2 : 4));
    for (let i = 0; i < n; i++) {
      const bp = (this.profile === 'mobile' ? 0.3 : 0.2) + Math.random() * (this.profile === 'mobile' ? 0.4 : 0.6);
      const bx = sx + (ex - sx) * bp, by = sy + (ey - sy) * bp;
      const ang = (Math.random() - 0.5) * Math.PI * (this.profile === 'mobile' ? 0.6 : 0.8);
      const len = (this.profile === 'mobile' ? 60 : 100) + Math.random() * (this.profile === 'mobile' ? 120 : 200);
      const ex2 = bx + Math.cos(ang) * len, ey2 = by + Math.sin(ang) * len;
      const segs = this._genPath(bx, by, ex2, ey2);
      arr.push({ segments: segs.slice(0, segs.length / (this.profile === 'mobile' ? 3 : 2)), alpha: (this.profile === 'mobile' ? 0.5 : 0.6) + Math.random() * (this.profile === 'mobile' ? 0.3 : 0.3) });
    }
    return arr;
  }
}