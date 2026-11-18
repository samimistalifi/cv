// Tiny deterministic synth: renders a dark, driving PLACEHOLDER beat whose hits
// line up exactly with the frames in src/config.ts. Replace with a licensed track.
const SR = 44100;

let seed = 1337;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296) * 2 - 1;

const biquad = (type, f, q) => {
  const w = (2 * Math.PI * f) / SR, cos = Math.cos(w), alpha = Math.sin(w) / (2 * q);
  let b0, b1, b2;
  if (type === 'lp') { b0 = (1 - cos) / 2; b1 = 1 - cos; b2 = b0; }
  else if (type === 'hp') { b0 = (1 + cos) / 2; b1 = -(1 + cos); b2 = b0; }
  else { b0 = alpha; b1 = 0; b2 = -alpha; } // band-pass
  const a0 = 1 + alpha, a1 = -2 * cos, a2 = 1 - alpha;
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  return (x) => {
    const y = (b0 * x + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2) / a0;
    x2 = x1; x1 = x; y2 = y1; y1 = y;
    return y;
  };
};

export function renderBeat({hits, scenes, fps, framesPerBeat, durationInFrames, fadeOutFrames}) {
  const dur = durationInFrames / fps;
  const N = Math.ceil(dur * SR);
  const L = new Float32Array(N), R = new Float32Array(N);
  const duck = new Float32Array(N).fill(1); // sidechain envelope for pad/bass
  const sec = (f) => f / fps;
  const beat = framesPerBeat / fps;

  const add = (t0, len, fn, gain = 1, pan = 0) => {
    const s0 = Math.round(t0 * SR), n = Math.round(len * SR);
    const gl = gain * Math.min(1, 1 - pan), gr = gain * Math.min(1, 1 + pan);
    for (let i = 0; i < n && s0 + i < N; i++) {
      if (s0 + i < 0) continue;
      const v = fn(i / SR, i);
      L[s0 + i] += v * gl; R[s0 + i] += v * gr;
    }
  };
  const sidechain = (t0, depth = 0.7, len = 0.22) => {
    const s0 = Math.round(t0 * SR), n = Math.round(len * SR);
    for (let i = 0; i < n && s0 + i < N; i++) duck[s0 + i] = Math.min(duck[s0 + i], 1 - depth * (1 - i / n) ** 2);
  };

  const kick = (t0, g = 1) => {
    let ph = 0;
    add(t0, 0.5, (t) => {
      ph += (2 * Math.PI * (44 + 110 * Math.exp(-t * 28))) / SR;
      return Math.tanh(Math.sin(ph) * 2.2) * Math.exp(-t * 6.5) + (t < 0.004 ? rnd() * 0.4 : 0);
    }, 0.9 * g);
    sidechain(t0);
  };
  const heartbeat = (t0, g) => {
    const lp = biquad('lp', 140, 0.9);
    let ph = 0;
    add(t0, 0.35, (t) => { ph += (2 * Math.PI * (52 + 30 * Math.exp(-t * 25))) / SR; return lp(Math.sin(ph) * 3) * Math.exp(-t * 11); }, g);
  };
  const clap = (t0, g = 1) => {
    const bp = biquad('bp', 1400, 0.8), hp = biquad('hp', 600, 0.7);
    add(t0, 0.25, (t) => {
      const env = Math.max(Math.exp(-t * 18), t < 0.03 ? Math.exp(-((t % 0.01) * 300)) : 0);
      return hp(bp(rnd())) * env * 2.2;
    }, 0.45 * g, 0.05);
  };
  const hat = (t0, g = 1, open = false) => {
    const hp = biquad('hp', 7500, 0.7);
    add(t0, open ? 0.18 : 0.05, (t) => hp(rnd()) * Math.exp(-t * (open ? 18 : 70)), 0.22 * g, (Math.round(t0 / beat * 4) % 2 ? 0.25 : -0.25));
  };
  const impact = (t0, size = 1) => {
    // sub boom
    let ph = 0;
    add(t0, 2.2 * size, (t) => { ph += (2 * Math.PI * (34 + 70 * Math.exp(-t * 9))) / SR; return Math.tanh(Math.sin(ph) * 2.5) * Math.exp(-t * (2.2 / size)); }, 0.8 * size);
    // noise crack + tail
    const lp = biquad('lp', 2500, 0.7), lp2 = biquad('lp', 900, 0.7);
    add(t0, 1.4 * size, (t) => lp(rnd()) * Math.exp(-t * 14) + lp2(rnd()) * 0.5 * Math.exp(-t * 3), 0.6 * size, -0.1);
    add(t0, 1.4 * size, (t) => lp2(rnd()) * 0.5 * Math.exp(-t * 3.2), 0.6 * size, 0.1);
    // metallic plate clang (iron plates)
    add(t0, 1.6, (t) => [143, 381, 677, 1043].reduce((s, f, k) => s + Math.sin(2 * Math.PI * f * t) * Math.exp(-t * (3 + k * 2)) / (k + 1), 0), 0.12 * size);
    sidechain(t0, 0.9, 0.6 * size);
  };
  const riser = (t0, len, g = 1) => {
    const bp = biquad('bp', 400, 2);
    let ph = 0, f = 400;
    const filt = [];
    add(t0, len, (t, i) => {
      const p = t / len;
      if (i % 64 === 0) { f = 300 + 6000 * p * p; filt[0] = biquad('bp', f, 3); }
      ph += (2 * Math.PI * (80 + 500 * p * p)) / SR;
      return ((filt[0] ?? bp)(rnd()) * 1.5 + Math.sin(ph) * 0.25) * p * p;
    }, 0.5 * g);
  };

  // ------------------------------------------------------------ arrangement
  hits.heartbeat.forEach((f, i) => heartbeat(sec(f), i === 0 ? 1.1 : 0.8));
  impact(sec(hits.hookSlam), 1.1);
  riser(sec(hits.hookSlam) + 0.5, sec(scenes.tease.from) - sec(hits.hookSlam) - 0.5, 0.7);

  const groove = (fromF, toF, {hats16 = false, claps = true} = {}) => {
    for (let t = sec(fromF); t < sec(toF) - 1e-6; t += beat) {
      const k = Math.round(t / beat);
      kick(t);
      if (claps && k % 2 === 1) clap(t);
      hat(t + beat / 2, 1, k % 4 === 3);
      if (hats16) { hat(t + beat / 4, 0.6); hat(t + (3 * beat) / 4, 0.6); }
    }
  };
  const energyEnd = scenes.energy.from + scenes.energy.duration;
  groove(scenes.tease.from, scenes.tease.from + scenes.tease.duration);
  groove(scenes.energy.from, energyEnd - framesPerBeat * 2, {hats16: true}); // drop out before the logo
  riser(sec(scenes.energy.from) + 2.2, sec(energyEnd) - sec(scenes.energy.from) - 2.2, 1.2);
  groove(scenes.logo.from + framesPerBeat * 2, scenes.endCard.from);
  groove(scenes.endCard.from, durationInFrames);

  hits.teaseLines.forEach((f) => impact(sec(f), 0.7));
  hits.energyCuts.forEach((f) => impact(sec(f), 0.55));
  impact(sec(hits.logoSlam), 1.5);
  impact(sec(hits.logoTitle), 0.5);
  impact(sec(hits.logoTagline), 0.4);
  impact(sec(hits.endSlam), 1.1);

  // dark pad (D minor) + off-beat sub bass, both side-chained
  const padNotes = [36.71, 55.0, 73.42, 87.31, 110.0];
  const padLp = [biquad('lp', 700, 0.6), biquad('lp', 700, 0.6)];
  const bassLp = biquad('lp', 180, 0.8);
  const grooveStart = sec(scenes.tease.from);
  for (let i = 0; i < N; i++) {
    const t = i / SR;
    let saw = 0;
    padNotes.forEach((f, k) => { saw += ((t * f * (1 + 0.003 * k)) % 1) * 2 - 1; saw += ((t * f * 1.006) % 1) * 2 - 1; });
    const swell = Math.min(1, t / 1.5);
    const pad = saw * 0.035 * swell * duck[i];
    L[i] += padLp[0](pad); R[i] += padLp[1](pad * 0.97);
    if (t >= grooveStart) {
      const pos = (t - grooveStart) % beat;
      const on = pos > beat / 2 ? Math.exp(-(pos - beat / 2) * 9) : 0;
      const b = bassLp(Math.tanh(Math.sin(2 * Math.PI * 36.71 * t) * 3)) * on * 0.35 * duck[i];
      L[i] += b; R[i] += b;
    }
  }

  // master: normalise, soft clip, fade-out
  let peak = 0;
  for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
  const fadeStart = N - Math.round((fadeOutFrames / fps) * SR);
  const buf = Buffer.alloc(44 + N * 4);
  for (let i = 0; i < N; i++) {
    const fade = i > fadeStart ? 1 - (i - fadeStart) / (N - fadeStart) : 1;
    const l = Math.tanh((L[i] / peak) * 1.3) * 0.9 * fade, r = Math.tanh((R[i] / peak) * 1.3) * 0.9 * fade;
    buf.writeInt16LE(Math.round(l * 32767), 44 + i * 4);
    buf.writeInt16LE(Math.round(r * 32767), 46 + i * 4);
  }
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + N * 4, 4); buf.write('WAVE', 8);
  buf.write('fmt ', 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22);
  buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34);
  buf.write('data', 36); buf.writeUInt32LE(N * 4, 40);
  return buf;
}
