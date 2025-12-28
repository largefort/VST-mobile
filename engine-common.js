export function seededNoise(seed, x, y, octaves = 3) {
  let value = 0, amplitude = 1, frequency = 1;
  for (let i = 0; i < octaves; i++) {
    const px = x * frequency, py = y * frequency;
    const n = Math.sin(px * 2.3 + py * 1.7 + seed) * Math.cos(px * 1.9 + py * 2.1 + seed) * Math.sin(px * 3.1 + py * 2.9 + seed * 2);
    value += n * amplitude; amplitude *= 0.5; frequency *= 2;
  }
  return Math.max(-1, Math.min(1, value * 0.5));
}

export function getDayNightInfo(gameTime, dayLength, profile = 'pc') {
  const cycleProgress = (gameTime % dayLength) / dayLength;
  const sunAngle = cycleProgress * Math.PI * 2;
  const sunAltitude = Math.sin(sunAngle - Math.PI / 2);
  const daylight = Math.max(0, sunAltitude);
  const baseline = profile === 'mobile' ? 0.25 : 0.2;
  const lightLevel = baseline + (1 - baseline) * daylight;
  let phase = daylight === 0 ? 'night' : (daylight < 0.25 ? 'dawn' : (daylight > 0.75 ? 'dusk' : 'day'));
  const sunX = Math.cos(sunAngle), sunY = sunAltitude;
  const ambientColor = phase === 'dawn' ? `rgba(255,180,120,${lightLevel * (profile === 'mobile' ? 0.06 : 0.08)})` :
                      phase === 'day'  ? `rgba(255,255,220,${lightLevel * (profile === 'mobile' ? 0.03 : 0.04)})` :
                      phase === 'dusk' ? `rgba(255,120,80,${lightLevel * (profile === 'mobile' ? 0.10 : 0.12)})` :
                                          `rgba(60,60,120,${(profile === 'mobile' ? 0.28 : 0.35) - lightLevel * (profile === 'mobile' ? 0.20 : 0.25)})`;
  const sunColor = phase === 'dawn' ? `rgba(255,200,100,${lightLevel * (profile === 'mobile' ? 0.2 : 0.25)})` :
                   phase === 'day'  ? `rgba(255,255,200,${lightLevel * (profile === 'mobile' ? 0.12 : 0.15)})` :
                   phase === 'dusk' ? `rgba(255,150,80,${lightLevel * (profile === 'mobile' ? 0.28 : 0.35)})` :
                                      `rgba(180,180,255,${profile === 'mobile' ? 0.06 : 0.08})`;
  return { phase, lightLevel, cycleProgress, sunAngle, sunX, sunY, ambientColor, sunColor };
}

