// Hand-rolled value noise → the terrain. No libraries, no height maps.
const hash = (x, y) => {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
};
const fade = (t) => t * t * (3 - 2 * t);

function vnoise(x, y) {
  const ix = Math.floor(x), iy = Math.floor(y);
  const fx = fade(x - ix), fy = fade(y - iy);
  const a = hash(ix, iy), b = hash(ix + 1, iy), c = hash(ix, iy + 1), d = hash(ix + 1, iy + 1);
  return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
}

export const SEA = -6;

export function heightAt(x, z) {
  const s = 0.013;
  let h = 0, amp = 1, freq = 1, norm = 0;
  for (let o = 0; o < 4; o++) {
    h += amp * vnoise(x * s * freq + 11.3, z * s * freq + 4.7);
    norm += amp; amp *= 0.5; freq *= 2.03;
  }
  h = (h / norm - 0.5) * 2;
  const ridge = 1 - Math.abs(vnoise(x * 0.006 + 40, z * 0.006 + 9) - 0.5) * 2;
  return Math.max(h * 17 + ridge * 6 - 3, SEA);
}
