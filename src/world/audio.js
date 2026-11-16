// All sound is synthesised in the browser — no audio files. Off until the visitor turns it on.
let ctx = null, wind = null, enabled = false, cutBuffer = null;

const noise = (seconds) => {
  const buf = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return buf;
};

export const sound = {
  get on() { return enabled; },

  async toggle() {
    enabled = !enabled;
    if (enabled) {
      ctx ||= new (window.AudioContext || window.webkitAudioContext)();
      await ctx.resume();
      if (!cutBuffer) fetch('/assets/audio/cut.mp3').then((r) => r.arrayBuffer()).then((b) => ctx.decodeAudioData(b)).then((b) => { cutBuffer = b; }).catch(() => {});
      this.startWind();
      this.slash(0.4);
    } else if (wind) { wind.gain.gain.setTargetAtTime(0, ctx.currentTime, 0.3); }
    return enabled;
  },

  // Low night wind: looped noise through a slowly wandering low-pass.
  startWind() {
    if (!wind) {
      const src = ctx.createBufferSource(); src.buffer = noise(4); src.loop = true;
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 320; lp.Q.value = 0.6;
      const lfo = ctx.createOscillator(); lfo.frequency.value = 0.07;
      const depth = ctx.createGain(); depth.gain.value = 160;
      lfo.connect(depth).connect(lp.frequency);
      const gain = ctx.createGain(); gain.gain.value = 0;
      src.connect(lp).connect(gain).connect(ctx.destination);
      src.start(); lfo.start();
      wind = { gain };
    }
    wind.gain.gain.setTargetAtTime(0.05, ctx.currentTime, 1.5);
  },

  // The cut itself: the recorded katana sample, falling back to the synthesised blade if it has not loaded.
  cut() {
    if (!enabled || !ctx) return;
    if (!cutBuffer) return this.slash(1);
    const src = ctx.createBufferSource(); src.buffer = cutBuffer;
    const g = ctx.createGain(); g.gain.value = 0.9;
    src.connect(g).connect(ctx.destination); src.start();
  },

  // A blade through air: a swept noise "whoosh" plus a short metallic ring.
  slash(volume = 1) {
    if (!enabled || !ctx) return;
    const t = ctx.currentTime;
    const src = ctx.createBufferSource(); src.buffer = noise(0.5);
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 1.4;
    bp.frequency.setValueAtTime(900, t); bp.frequency.exponentialRampToValueAtTime(7500, t + 0.16);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.5 * volume, t + 0.05); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.42);
    src.connect(bp).connect(g).connect(ctx.destination); src.start(t); src.stop(t + 0.5);
    for (const [f, v] of [[3120, 0.07], [4710, 0.05], [6280, 0.03]]) {
      const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = f;
      const og = ctx.createGain();
      og.gain.setValueAtTime(0.0001, t + 0.05); og.gain.exponentialRampToValueAtTime(v * volume, t + 0.09); og.gain.exponentialRampToValueAtTime(0.0001, t + 1.1);
      o.connect(og).connect(ctx.destination); o.start(t + 0.05); o.stop(t + 1.2);
    }
  },
};
