// Every 3D mark in the world is drawn here from plain point lists — no stock
// models and no primitive shapes. Each sigil is a set of polylines in a 2×2 box.
const arc = (cx, cy, rx, ry, a0, a1, n = 28) =>
  Array.from({ length: n + 1 }, (_, i) => {
    const a = a0 + ((a1 - a0) * i) / n;
    return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry];
  });

// Heart curve — the cursor, and the mark on the spawn point.
export const heart = (n = 64) =>
  Array.from({ length: n + 1 }, (_, i) => {
    const t = (i / n) * Math.PI * 2;
    const x = 16 * Math.sin(t) ** 3;
    const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
    return [x / 17, (y + 2.5) / 17];
  });

export const sigils = {
  // Sentinel-X — a watching eye
  sentinel: [arc(0, 0, 1, 0.62, 0, Math.PI), arc(0, 0, 1, 0.62, Math.PI, Math.PI * 2), arc(0, 0, 0.3, 0.3, 0, Math.PI * 2, 20)],
  // SecureSplit — two halves that only make a whole together
  securesplit: [
    [[-0.9, 0.9], [0.15, 0.9], [0.15, 0.3], [-0.3, 0.3], [-0.3, -0.45], [-0.9, -0.45], [-0.9, 0.9]],
    [[0.9, -0.9], [-0.15, -0.9], [-0.15, -0.3], [0.3, -0.3], [0.3, 0.45], [0.9, 0.45], [0.9, -0.9]],
  ],
  // MatCare — a pulse
  matcare: [[[-1, 0], [-0.5, 0], [-0.35, 0.25], [-0.2, -0.35], [0, 0.95], [0.2, -0.7], [0.35, 0.15], [0.5, 0], [1, 0]]],
  // Log platform — lines resolving into a signal
  'ale-logs': [
    [[-0.9, 0.7], [0.5, 0.7]], [[-0.9, 0.25], [0.9, 0.25]], [[-0.9, -0.2], [0.1, -0.2]],
    [[-0.9, -0.65], [-0.4, -0.65], [-0.15, -0.3], [0.2, -0.85], [0.5, -0.5], [0.9, -0.65]],
  ],
  spawn: [heart(48)],
  campfire: [[[-0.8, -0.8], [0, 0.9], [0.8, -0.8]], [[-0.45, -0.1], [0.45, -0.1]], [[-1, -0.8], [1, -0.8]]],
};
