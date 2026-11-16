// Generates the original project "field sketches" in public/assets/covers:
// ink line drawings on a transparent ground, one vermilion accent each.
// Run: node scripts/generate-covers.mjs   (deterministic — same output every run)
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const out = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'assets', 'covers');
mkdirSync(out, { recursive: true });

const W = 1600, H = 1000, INK = '#15150f', ACC = '#d9486f';
const rng = (seed) => () => {
  seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const f = (n) => Number(n.toFixed(1));
const frame = (id, body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${id} field sketch" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
${body}
</svg>
`;
const ticks = () => {
  let s = '';
  for (let x = 100; x <= 1500; x += 100) s += `<path d="M${x} 60v${x % 500 ? 12 : 24}M${x} 940v-${x % 500 ? 12 : 24}" stroke-opacity=".45"/>`;
  for (let y = 100; y <= 900; y += 100) s += `<path d="M60 ${y}h${y % 500 ? 12 : 24}M1540 ${y}h-${y % 500 ? 12 : 24}" stroke-opacity=".45"/>`;
  return s + `<rect x="60" y="60" width="1480" height="880" stroke-opacity=".35"/>`;
};

/* Sentinel-X — privilege rings around a syscall table with one hooked entry */
function sentinel() {
  const r = rng(11); let s = ticks();
  const cx = 800, cy = 500;
  [400, 310, 225].forEach((rad, i) => {
    s += `<circle cx="${cx}" cy="${cy}" r="${rad}" stroke-opacity="${0.3 + i * 0.2}"${i === 1 ? ' stroke-dasharray="3 12"' : ''}/>`;
    for (let k = 0; k < 9 + i * 3; k++) {
      const a = r() * Math.PI * 2;
      s += `<circle cx="${f(cx + Math.cos(a) * rad)}" cy="${f(cy + Math.sin(a) * rad)}" r="4" fill="${INK}" stroke="none"/>`;
    }
  });
  const n = 9, cell = 28, gap = 8, g0x = cx - (n * (cell + gap) - gap) / 2, g0y = cy - (n * (cell + gap) - gap) / 2, hook = [6, 2];
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    const hk = x === hook[0] && y === hook[1];
    s += `<rect x="${f(g0x + x * (cell + gap))}" y="${f(g0y + y * (cell + gap))}" width="${cell}" height="${cell}" ${hk ? `fill="${ACC}" stroke="${ACC}"` : r() > 0.72 ? `fill="${INK}" fill-opacity=".85"` : 'stroke-opacity=".6"'}/>`;
  }
  const hx = g0x + hook[0] * (cell + gap) + cell / 2, hy = g0y + hook[1] * (cell + gap) + cell / 2;
  s += `<path d="M${f(hx)} ${f(hy)}C${f(hx + 190)} ${f(hy - 150)} ${f(hx + 250)} ${f(hy - 60)} ${f(hx + 420)} ${f(hy - 190)}" stroke="${ACC}" stroke-width="3" stroke-dasharray="8 10"/>`;
  s += `<circle cx="${f(hx + 420)}" cy="${f(hy - 190)}" r="12" stroke="${ACC}" stroke-width="3"/>`;
  return frame('Sentinel-X', s);
}

/* SecureSplit — two noise shares that only resolve where they overlap */
function securesplit() {
  const r = rng(23); let s = ticks();
  const px = 24, n = 24;
  const share = (ox, oy, flip) => {
    let g = `<rect x="${ox - 16}" y="${oy - 16}" width="${n * px + 32}" height="${n * px + 32}" stroke-opacity=".5"/>`;
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++)
      if ((r() > 0.5) !== flip) g += `<rect x="${ox + x * px + 4}" y="${oy + y * px + 4}" width="${px - 8}" height="${px - 8}" fill="${INK}" stroke="none" fill-opacity="${flip ? 0.9 : 0.5}"/>`;
    return g;
  };
  s += share(250, 212, false) + share(774, 212, true);
  s += `<circle cx="800" cy="500" r="190" fill="#efe9dc" stroke="${ACC}" stroke-width="3"/>`;
  s += `<path d="M800 400l86 50v100l-86 50l-86-50v-100z" stroke="${ACC}" stroke-width="4"/>`;
  s += `<path d="M800 500v100M800 500l86-50M800 500l-86-50" stroke="${ACC}" stroke-width="3"/>`;
  return frame('SecureSplit', s);
}

/* MatCare — two live vitals traces, mother and newborn */
function matcare() {
  let s = ticks();
  const trace = (y0, amp, period) => {
    let d = `M100 ${y0}`;
    for (let x = 100; x <= 1500; x += 8) {
      const p = (x % period) / period; let y = y0;
      if (p > 0.42 && p < 0.46) y -= amp * 0.25; else if (p >= 0.46 && p < 0.49) y += amp * 0.35;
      else if (p >= 0.49 && p < 0.52) y -= amp; else if (p >= 0.52 && p < 0.56) y += amp * 0.45;
      else if (p > 0.66 && p < 0.76) y -= amp * 0.18 * Math.sin(((p - 0.66) / 0.1) * Math.PI);
      d += `L${x} ${f(y)}`;
    }
    return d;
  };
  for (let y = 200; y <= 800; y += 100) s += `<path d="M100 ${y}h1400" stroke-opacity=".14"/>`;
  s += `<circle cx="1080" cy="470" r="250" stroke-opacity=".5"/><circle cx="1170" cy="560" r="105" stroke-opacity=".8"/>`;
  s += `<path d="${trace(420, 200, 480)}" stroke="${ACC}" stroke-width="5"/>`;
  s += `<path d="${trace(700, 90, 280)}" stroke-width="4"/>`;
  return frame('MatCare', s);
}

/* Log platform — raw log lines resolving into telemetry */
function logs() {
  const r = rng(51); let s = ticks();
  for (let i = 0; i < 26; i++) {
    const y = 150 + i * 28; let x = 130; const hot = i === 7 || i === 18;
    for (let k = 0; k < 6 && x < 700; k++) {
      const w = 30 + r() * 140;
      s += `<path d="M${f(x)} ${y}h${f(w)}" stroke="${hot && k > 0 ? ACC : INK}" stroke-width="7" stroke-opacity="${hot ? 1 : f(0.25 + r() * 0.5)}"/>`;
      x += w + 22;
    }
  }
  const bx = 850, base = 850;
  for (let i = 0; i < 26; i++) {
    const spike = i === 8 || i === 19;
    const h = 60 + Math.abs(Math.sin(i / 3.1)) * 330 + r() * 120 + (spike ? 130 : 0);
    s += `<path d="M${bx + i * 24} ${base}v-${f(h)}" stroke="${spike ? ACC : INK}" stroke-width="10" stroke-opacity="${spike ? 1 : 0.8}"/>`;
  }
  s += `<path d="M${bx - 20} ${base + 16}h640"/><path d="M745 500h60m-16-14l16 14l-16 14" stroke-width="3"/>`;
  return frame('Log analysis platform', s);
}

for (const [name, draw] of Object.entries({ sentinel, securesplit, matcare, logs })) {
  writeFileSync(join(out, `${name}.svg`), draw());
  console.log('wrote', `${name}.svg`);
}
