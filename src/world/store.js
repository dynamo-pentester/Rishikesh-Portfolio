// Tiny shared state between the DOM and the 3D world (read every frame, no re-renders).
export const store = {
  focus: null,        // project id the visitor is hovering / has open
  pointer: { x: 0, y: 0 },
  heading: 0,         // camera heading in degrees, for the compass
  coords: { x: 0, y: 0, alt: 0 },
  region: 0,
  labels: [],         // [{ id, x, y, visible }] projected marker positions
  ready: false,
};

export const REGIONS = ['Spawn point', 'Quest log', 'Character', 'Disciplines', 'Trophies', 'Campfire'];
