// An original ink figure for the character sheet: a lone wanderer under a cherry branch,
// seen from behind. Drawn by hand as paths; it follows the day/night palette.
const petals = [[92, 96], [128, 150], [70, 210], [318, 236], [340, 150], [286, 330], [108, 318], [352, 360]];
const blossoms = [
  [236, 62, 15], [262, 50, 12], [286, 70, 16], [312, 58, 13], [336, 82, 15], [300, 96, 12], [258, 88, 11],
  [352, 112, 12], [326, 120, 10], [214, 84, 10], [372, 92, 11], [280, 118, 9],
];

export default function Wanderer() {
  return (
    <svg className="wanderer" viewBox="0 0 400 440" role="img" aria-label="Ink drawing of a lone wanderer standing under a cherry branch">
      {/* far hills and ground */}
      <path d="M0 330 Q70 290 140 318 T290 300 T400 322 V440 H0Z" fill="var(--land-hi)" opacity="0.55" />
      <path d="M0 384 Q110 356 210 378 T400 366 V440 H0Z" fill="var(--land-lo)" />
      <path d="M0 384 Q110 356 210 378 T400 366" fill="none" stroke="var(--ink)" strokeWidth="1.5" opacity="0.5" />

      {/* cherry branch */}
      <path d="M400 20 C340 26 300 44 262 74 C244 88 226 96 204 96 M318 46 C330 70 346 86 372 96 M286 60 C284 84 290 100 304 112"
        fill="none" stroke="var(--bark)" strokeWidth="5" strokeLinecap="round" />
      {blossoms.map(([x, y, r], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill="var(--accent)" opacity={0.55 + (i % 4) * 0.12} />
      ))}
      {petals.map(([x, y], i) => (
        <ellipse key={i} cx={x} cy={y} rx="6" ry="3" fill="var(--accent)" transform={`rotate(${i * 47} ${x} ${y})`} opacity="0.85" />
      ))}

      {/* the wanderer */}
      <g fill="var(--figure)" stroke="var(--figure-edge)" strokeWidth="1.2" strokeLinejoin="round">
        <path d="M118 366 L266 300" stroke="var(--figure-blade)" strokeWidth="5" strokeLinecap="round" fill="none" />
        <path d="M250 300 l14 -6 l4 9 l-14 6z" />
        <path d="M172 388 L164 432 H196 L200 398 L206 432 H238 L228 388Z" />
        <path d="M168 250 Q200 238 232 250 L246 302 Q262 352 284 392 Q244 382 216 396 Q190 386 154 398 Q160 342 162 302Z" />
        <rect x="191" y="236" width="18" height="16" rx="4" />
        <path d="M142 236 L200 196 L258 236 Q200 250 142 236Z" />
      </g>
      <path d="M176 262 Q200 254 224 262 M214 300 Q232 344 250 378" fill="none" stroke="var(--paper)" strokeWidth="1.5" opacity="0.35" strokeLinecap="round" />
      <path d="M150 432 H252" stroke="var(--ink)" strokeWidth="2" opacity="0.35" strokeLinecap="round" />
    </svg>
  );
}
