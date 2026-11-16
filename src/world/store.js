// Tiny shared state between the DOM and the 3D world (read every frame, no re-renders).
export const store = {
  focus: null,        // project id the visitor is hovering / has open
  pointer: { x: 0, y: 0 },
  heading: 0,         // camera heading in degrees, for the compass
  coords: { x: 0, y: 0, alt: 0 },
  region: 0,
  labels: [],         // [{ id, x, y, visible }] projected marker positions
  hero: { p: 0, q: 0, onCut: null }, // opening shot: scroll through the pin, how far the halves have parted, and the world's call when the blade lands
  ready: false,
};

export const REGIONS = ['The gate', 'The warrior', 'The scrolls', 'The arsenal', 'War record', 'The resting place'];
