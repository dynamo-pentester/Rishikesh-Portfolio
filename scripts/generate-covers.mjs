// Generates the original, procedurally drawn project covers in public/assets/covers.
// Run: node scripts/generate-covers.mjs   (deterministic — same output every run)
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const out = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'assets', 'covers');
mkdirSync(out, { recursive: true });

const W = 1600, H = 1000;
const rng = (seed) => () => {
  seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const f = (n) => Number(n.toFixed(1));

const frame = ({ id, bg0, bg1, glowA, glowB, body }) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${id} cover artwork">
<defs>
<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${bg0}"/><stop offset="1" stop-color="${bg1}"/></linearGradient>
<radialGradient id="ga" cx="0.28" cy="0.3" r="0.6"><stop offset="0" stop-color="${glowA}" stop-opacity="0.75"/><stop offset="1" stop-color="${glowA}" stop-opacity="0"/></radialGradient>
<radialGradient id="gb" cx="0.8" cy="0.75" r="0.55"><stop offset="0" stop-color="${glowB}" stop-opacity="0.6"/><stop offset="1" stop-color="${glowB}" stop-opacity="0"/></radialGradient>
<filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7"/><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.09 0"/></filter>
<filter id="soft"><feGaussianBlur stdDeviation="18"/></filter>
<filter id="glow"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
</defs>
<rect width="${W}" height="${H}" fill="url(#bg)"/>
<rect width="${W}" height="${H}" fill="url(#ga)"/>
<rect width="${W}" height="${H}" fill="url(#gb)"/>
${body}
<rect width="${W}" height="${H}" filter="url(#grain)"/>
</svg>
`;

/* 01 — Sentinel-X: privilege rings around a syscall table with one hooked entry */
function sentinel() {
  const r = rng(11); let s = '';
  const cx = 1010, cy = 500;
  [430, 330, 235, 145].forEach((rad, i) => {
    s += `<circle cx="${cx}" cy="${cy}" r="${rad}" fill="none" stroke="#b9ffe6" stroke-opacity="${0.12 + i * 0.07}" stroke-width="${i === 3 ? 2 : 1}" stroke-dasharray="${i % 2 ? '2 10' : 'none'}"/>`;
    for (let k = 0; k < 10 + i * 4; k++) {
      const a = r() * Math.PI * 2;
      s += `<circle cx="${f(cx + Math.cos(a) * rad)}" cy="${f(cy + Math.sin(a) * rad)}" r="${f(1.5 + r() * 2.5)}" fill="#d9fff1" fill-opacity="${f(0.3 + r() * 0.6)}"/>`;
    }
  });
  // syscall table grid
  const cols = 9, rows = 9, cell = 26, gap = 6, gx = cx - (cols * (cell + gap)) / 2, gy = cy - (rows * (cell + gap)) / 2;
  const hook = [6, 3];
  for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
    const hooked = x === hook[0] && y === hook[1];
    s += `<rect x="${f(gx + x * (cell + gap))}" y="${f(gy + y * (cell + gap))}" width="${cell}" height="${cell}" rx="5" fill="${hooked ? '#ff5d5d' : '#9ff5d2'}" fill-opacity="${hooked ? 1 : f(0.08 + r() * 0.3)}"${hooked ? ' filter="url(#glow)"' : ''}/>`;
  }
  const hx = gx + hook[0] * (cell + gap) + cell / 2, hy = gy + hook[1] * (cell + gap) + cell / 2;
  s += `<path d="M${f(hx)} ${f(hy)} C ${f(hx + 180)} ${f(hy - 220)}, ${f(hx + 60)} ${f(hy - 380)}, ${f(hx + 330)} ${f(hy - 410)}" fill="none" stroke="#ff7b7b" stroke-width="2" stroke-dasharray="6 8" stroke-opacity="0.85"/>`;
  s += `<circle cx="${f(hx + 330)}" cy="${f(hy - 410)}" r="9" fill="none" stroke="#ff7b7b" stroke-width="2"/>`;
  // scan beam
  s += `<path d="M${cx} ${cy} L${cx + 430} ${cy - 120} A430 430 0 0 1 ${cx + 380} ${cy + 200} Z" fill="#7dffd0" fill-opacity="0.07"/>`;
  // left hairlines
  for (let i = 0; i < 26; i++) s += `<rect x="90" y="${150 + i * 28}" width="${f(40 + r() * 260)}" height="2" fill="#c8ffee" fill-opacity="${f(0.08 + r() * 0.25)}"/>`;
  return frame({ id: 'Sentinel-X', bg0: '#03130f', bg1: '#061f24', glowA: '#0f6b55', glowB: '#0b4a6b', body: s });
}

/* 02 — SecureSplit: two noise shares that only resolve where they overlap */
function securesplit() {
  const r = rng(23); let s = '';
  const px = 22, cols = 26, rows = 26;
  const share = (ox, oy, color, flip) => {
    let g = `<g transform="translate(${ox} ${oy})">`;
    g += `<rect x="-14" y="-14" width="${cols * px + 28}" height="${rows * px + 28}" rx="26" fill="#ffffff" fill-opacity="0.04" stroke="#ffffff" stroke-opacity="0.18"/>`;
    for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
      const bit = r() > 0.5;
      if (bit !== flip) g += `<rect x="${x * px}" y="${y * px}" width="${px - 3}" height="${px - 3}" rx="3" fill="${color}" fill-opacity="${f(0.35 + r() * 0.5)}"/>`;
    }
    return g + '</g>';
  };
  s += share(250, 215, '#c9a2ff', false);
  s += share(780, 215, '#ff9ad5', true);
  // resolved lens in the middle
  s += `<circle cx="800" cy="500" r="205" fill="#120a24" fill-opacity="0.86" stroke="#ffffff" stroke-opacity="0.35"/>`;
  s += `<circle cx="800" cy="500" r="205" fill="none" stroke="#e6c8ff" stroke-opacity="0.5" stroke-width="10" filter="url(#soft)"/>`;
  for (let i = 0; i < 7; i++) s += `<circle cx="800" cy="500" r="${30 + i * 25}" fill="none" stroke="#f3e3ff" stroke-opacity="${f(0.55 - i * 0.065)}" stroke-width="1.5"/>`;
  s += `<path d="M800 420 l70 40 v80 l-70 40 l-70 -40 v-80 z" fill="none" stroke="#ffffff" stroke-width="3" stroke-linejoin="round" filter="url(#glow)"/>`;
  s += `<path d="M800 500 v80 M800 500 l70 -40 M800 500 l-70 -40" stroke="#ffffff" stroke-width="2" stroke-opacity="0.7"/>`;
  s += `<text x="800" y="775" text-anchor="middle" font-family="monospace" font-size="22" letter-spacing="10" fill="#ffffff" fill-opacity="0.45">A ⊕ B</text>`;
  return frame({ id: 'SecureSplit', bg0: '#0d0718', bg1: '#1b0b2a', glowA: '#5b2aa8', glowB: '#a82a78', body: s });
}

/* 03 — MatCare: two live vitals traces, mother and newborn */
function matcare() {
  const r = rng(37); let s = '';
  const trace = (y0, amp, period, color, w, op) => {
    let d = `M0 ${y0}`;
    for (let x = 0; x <= W; x += 8) {
      const p = (x % period) / period; let y = y0 + Math.sin(x / 90) * 6;
      if (p > 0.42 && p < 0.46) y -= amp * 0.25;
      else if (p >= 0.46 && p < 0.49) y += amp * 0.35;
      else if (p >= 0.49 && p < 0.52) y -= amp;
      else if (p >= 0.52 && p < 0.56) y += amp * 0.45;
      else if (p > 0.66 && p < 0.76) y -= amp * 0.18 * Math.sin(((p - 0.66) / 0.1) * Math.PI);
      d += ` L${x} ${f(y)}`;
    }
    return `<path d="${d}" fill="none" stroke="${color}" stroke-width="${w}" stroke-opacity="${op}" stroke-linejoin="round" filter="url(#glow)"/>`;
  };
  for (let x = 0; x <= W; x += 80) s += `<rect x="${x}" y="0" width="1" height="${H}" fill="#fff" fill-opacity="0.045"/>`;
  for (let y = 0; y <= H; y += 80) s += `<rect x="0" y="${y}" width="${W}" height="1" fill="#fff" fill-opacity="0.045"/>`;
  s += `<circle cx="1130" cy="470" r="300" fill="#ff8f7a" fill-opacity="0.16" filter="url(#soft)"/>`;
  s += `<circle cx="1130" cy="470" r="230" fill="none" stroke="#ffd2c4" stroke-opacity="0.35"/>`;
  s += `<circle cx="1210" cy="540" r="105" fill="#ffd9a8" fill-opacity="0.14" stroke="#ffe7c9" stroke-opacity="0.5"/>`;
  s += trace(420, 190, 520, '#ffb199', 4, 0.95);
  s += trace(680, 95, 300, '#ffe0a3', 3, 0.85);
  for (let i = 0; i < 5; i++) {
    const x = 110 + i * 150, h = 40 + r() * 90;
    s += `<rect x="${x}" y="${f(900 - h)}" width="96" height="${f(h)}" rx="14" fill="#fff" fill-opacity="0.07" stroke="#fff" stroke-opacity="0.16"/>`;
  }
  return frame({ id: 'MatCare', bg0: '#1c0a0d', bg1: '#2a1009', glowA: '#a8402a', glowB: '#a86a1c', body: s });
}

/* 04 — Log platform: stacked log lines resolving into telemetry bars */
function logs() {
  const r = rng(51); let s = '';
  for (let i = 0; i < 30; i++) {
    const y = 110 + i * 27; let x = 90;
    const hot = i === 8 || i === 19;
    for (let k = 0; k < 6; k++) {
      const w = 30 + r() * 150;
      s += `<rect x="${f(x)}" y="${y}" width="${f(w)}" height="9" rx="4.5" fill="${hot && k > 1 ? '#ff7a59' : '#ffe2a8'}" fill-opacity="${hot ? 0.9 : f(0.1 + r() * 0.32)}"/>`;
      x += w + 14; if (x > 760) break;
    }
  }
  const bx = 880, base = 860;
  for (let i = 0; i < 28; i++) {
    const h = 60 + Math.abs(Math.sin(i / 3.1)) * 360 + r() * 140;
    const spike = i === 9 || i === 21;
    s += `<rect x="${bx + i * 23}" y="${f(base - (spike ? h + 130 : h))}" width="14" height="${f(spike ? h + 130 : h)}" rx="7" fill="${spike ? '#ff7a59' : '#ffc46b'}" fill-opacity="${spike ? 1 : f(0.3 + (i / 28) * 0.5)}"${spike ? ' filter="url(#glow)"' : ''}/>`;
  }
  let d = '';
  for (let i = 0; i < 28; i++) d += `${i ? 'L' : 'M'}${bx + i * 23 + 7} ${f(300 + Math.sin(i / 2.2) * 70 + r() * 30)} `;
  s += `<path d="${d}" fill="none" stroke="#fff3d6" stroke-width="2.5" stroke-opacity="0.8" filter="url(#glow)"/>`;
  s += `<rect x="${bx - 20}" y="${base + 12}" width="680" height="1.5" fill="#fff" fill-opacity="0.3"/>`;
  s += `<path d="M770 500 h70 m-16 -14 l16 14 l-16 14" fill="none" stroke="#ffe2a8" stroke-width="2.5" stroke-opacity="0.7"/>`;
  return frame({ id: 'Log analysis platform', bg0: '#140d03', bg1: '#221304', glowA: '#8a5a12', glowB: '#8a2f12', body: s });
}

const covers = { sentinel, securesplit, matcare, logs };
for (const [name, draw] of Object.entries(covers)) {
  writeFileSync(join(out, `${name}.svg`), draw());
  console.log('wrote', `${name}.svg`);
}
