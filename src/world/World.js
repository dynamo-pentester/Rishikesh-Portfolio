import * as THREE from 'three';
import { heightAt, SEA } from './noise';
import { sigils } from './sigils';
import { store } from './store';

const SIZE = 420;

// Where each project lives on the map (x, z).
export const WAYPOINTS = {
  sentinel: [-30, -4], securesplit: [-9, -24], matcare: [15, -10], 'ale-logs': [34, -30],
  spawn: [0, 62], campfire: [6, -64],
};

// One camera stop per page section: position, altitude above ground, look-at, fog range.
const STOPS = [
  { p: [0, 104], alt: 30, l: [0, 40], fog: [70, 230] },
  { p: [-6, 46], alt: 20, l: [2, -14], fog: [60, 190] },
  { p: [46, 6], alt: 15, l: [78, -52], fog: [50, 170] },
  { p: [80, -62], alt: 19, l: [34, -112], fog: [50, 180] },
  { p: [24, -108], alt: 24, l: [-44, -84], fog: [60, 200] },
  { p: [4, -20], alt: 175, l: [4, -20.5], fog: [260, 520] },
];

const smooth = (t) => t * t * (3 - 2 * t);
const mix = (a, b, t) => a + (b - a) * t;

const terrainVert = /* glsl */ `
  varying float vH; varying float vDist; varying vec2 vXZ;
  void main() {
    vH = position.y; vXZ = position.xz;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vDist = length(mv.xyz);
    gl_Position = projectionMatrix * mv;
  }`;

const noiseGlsl = /* glsl */ `
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float vn(vec2 p) {
    vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
  }`;

// Watercolour ground: spring meadow by height, a sand line at the shore, still water with a light shimmer.
const terrainFrag = /* glsl */ `
  uniform vec3 uLandLo; uniform vec3 uLandHi; uniform vec3 uSand; uniform vec3 uWater; uniform vec3 uInk; uniform vec3 uSkyLow;
  uniform vec2 uFog; uniform float uSea; uniform float uTime;
  varying float vH; varying float vDist; varying vec2 vXZ;
  ${noiseGlsl}
  float lineAt(float v) {
    float fw = fwidth(v);
    float d = abs(fract(v - 0.5) - 0.5) / max(fw, 1e-5);
    return (1.0 - smoothstep(0.0, 1.3, d)) * clamp(1.5 - fw * 2.6, 0.0, 1.0);
  }
  void main() {
    float blot = vn(vXZ * 0.05) * 0.6 + vn(vXZ * 0.19) * 0.4;
    vec3 land = mix(uLandLo, uLandHi, clamp(smoothstep(uSea, 15.0, vH) * 0.9 + (blot - 0.5) * 0.55, 0.0, 1.0));
    land = mix(uSand, land, smoothstep(uSea + 0.05, uSea + 1.2, vH));
    land = mix(land, uInk, max(lineAt(vH / 1.6) * 0.13, lineAt(vH / 8.0) * 0.34));
    float ripple = sin(vXZ.x * 0.9 + uTime * 0.8 + sin(vXZ.y * 0.7) * 2.0) * sin(vXZ.y * 1.7 - uTime * 0.5);
    vec3 water = mix(uWater, uSkyLow, 0.3 * blot) + smoothstep(0.72, 1.0, ripple) * 0.14;
    vec3 col = mix(land, water, 1.0 - step(uSea + 0.02, vH));
    gl_FragColor = vec4(mix(col, uSkyLow, smoothstep(uFog.x, uFog.y, vDist)), 1.0);
  }`;

// The sky is one screen-filling sheet: a soft gradient, slow clouds, and stars after dark.
const skyVert = /* glsl */ `varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 1.0, 1.0); }`;
const skyFrag = /* glsl */ `
  uniform vec3 uSkyTop; uniform vec3 uSkyLow; uniform vec3 uCloud; uniform float uTime; uniform float uAspect; uniform float uStars;
  varying vec2 vUv;
  ${noiseGlsl}
  void main() {
    vec3 c = mix(uSkyLow, uSkyTop, smoothstep(0.3, 1.0, vUv.y));
    vec2 p = vec2(vUv.x * uAspect * 2.4 + uTime * 0.01, vUv.y * 6.0);
    float n = vn(p) * 0.55 + vn(p * 2.1 + 7.0) * 0.3 + vn(p * 4.3 + 3.0) * 0.15;
    c = mix(c, uCloud, smoothstep(0.5, 0.74, n) * smoothstep(0.4, 0.75, vUv.y) * 0.9);
    vec2 g = floor(vUv * vec2(uAspect, 1.0) * 150.0);
    c += step(0.993, hash(g)) * uStars * smoothstep(0.45, 0.9, vUv.y) * (0.55 + 0.45 * sin(uTime * 2.0 + hash(g + 1.0) * 6.28));
    gl_FragColor = vec4(c, 1.0);
  }`;

const fogLineVert = /* glsl */ `
  varying float vDist;
  void main() { vec4 mv = modelViewMatrix * vec4(position, 1.0); vDist = length(mv.xyz); gl_Position = projectionMatrix * mv; }`;
const fogLineFrag = /* glsl */ `
  uniform vec3 uPaper; uniform vec3 uInk; uniform vec2 uFog; varying float vDist;
  void main() { gl_FragColor = vec4(mix(uInk, uPaper, smoothstep(uFog.x, uFog.y, vDist) * 0.94), 1.0); }`;

const blossomVert = /* glsl */ `
  attribute float aSize; attribute float aTone; uniform float uScale; varying float vDist; varying float vTone;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vDist = length(mv.xyz); vTone = aTone;
    gl_PointSize = aSize * uScale / -mv.z;
    gl_Position = projectionMatrix * mv;
  }`;
const blossomFrag = /* glsl */ `
  uniform vec3 uPaper; uniform vec3 uSkyLow; uniform vec3 uAccent; uniform vec2 uFog; varying float vDist; varying float vTone;
  void main() {
    if (length(gl_PointCoord - 0.5) > 0.5) discard;
    vec3 c = mix(uAccent, uPaper, vTone * 0.7);
    gl_FragColor = vec4(mix(c, uSkyLow, smoothstep(uFog.x, uFog.y, vDist) * 0.9), 1.0);
  }`;

// Petals live entirely on the GPU: a box of points that drifts with the wind and wraps around the camera.
const petalVert = /* glsl */ `
  attribute float aSeed; uniform float uTime; uniform float uScale; uniform vec3 uCam; varying float vSeed;
  void main() {
    vec3 p = position;
    p.x = mod(p.x + uTime * (2.2 + aSeed) - uCam.x + 70.0, 140.0) - 70.0 + uCam.x + sin(uTime * 0.7 + aSeed * 40.0) * 1.5;
    p.z = mod(p.z + uTime * 0.8 - uCam.z + 70.0, 140.0) - 70.0 + uCam.z;
    p.y = mod(p.y - uTime * (1.1 + aSeed * 0.8), 46.0) + uCam.y - 30.0;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vSeed = aSeed;
    gl_PointSize = min((0.3 + aSeed * 0.3) * uScale / -mv.z, uScale * 0.016);
    gl_Position = projectionMatrix * mv;
  }`;
const petalFrag = /* glsl */ `
  uniform vec3 uAccent; uniform vec3 uPaper; uniform float uTime; varying float vSeed;
  void main() {
    float a = uTime * (0.6 + vSeed) + vSeed * 30.0;
    vec2 q = mat2(cos(a), -sin(a), sin(a), cos(a)) * (gl_PointCoord - 0.5);
    q.y *= 1.0 + 0.6 * sin(a * 1.3);                       // tumble
    float lens = max(length(q - vec2(0.0, 0.26)), length(q + vec2(0.0, 0.26)));
    if (lens > 0.5 || length(q - vec2(0.36, 0.0)) < 0.09) discard; // almond with a notch
    gl_FragColor = vec4(mix(uAccent, uPaper, vSeed * 0.45), 1.0);
  }`;

const seeded = (seed) => () => {
  seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

export class World {
  constructor(canvas) {
    this.canvas = canvas;
    this.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(50, 1, 0.5, 900);
    this.cam = { pos: new THREE.Vector3(0, 60, 104), look: new THREE.Vector3(0, 0, 40), fog: new THREE.Vector2(70, 230) };
    this.clock = new THREE.Clock();
    this.markers = [];
    this.tmp = new THREE.Vector3();

    this.small = Math.min(innerWidth, innerHeight) < 700;
    this.buildTerrain();
    this.buildSky();
    this.buildGrove();
    this.buildPetals();
    this.buildMarkers();
    this.setTheme();
    this.resize();

    this.onResize = () => this.resize();
    this.onPointer = (e) => { store.pointer.x = (e.clientX / innerWidth) * 2 - 1; store.pointer.y = (e.clientY / innerHeight) * 2 - 1; };
    this.onVis = () => { if (!document.hidden) { this.clock.getDelta(); this.loop(); } };
    window.addEventListener('resize', this.onResize);
    window.addEventListener('pointermove', this.onPointer, { passive: true });
    document.addEventListener('visibilitychange', this.onVis);

    this.sections = [...document.querySelectorAll('[data-region]')];
    this.first = true;
    this.loop = this.loop.bind(this);
    this.loop();
  }

  buildTerrain() {
    const seg = this.small ? 170 : 260;
    const geo = new THREE.PlaneGeometry(SIZE, SIZE, seg, seg);
    geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) pos.setY(i, heightAt(pos.getX(i), pos.getZ(i)));
    this.terrainMat = new THREE.ShaderMaterial({
      vertexShader: terrainVert, fragmentShader: terrainFrag,
      uniforms: {
        uPaper: { value: new THREE.Color() }, uInk: { value: new THREE.Color() },
        uLandLo: { value: new THREE.Color() }, uLandHi: { value: new THREE.Color() }, uSand: { value: new THREE.Color() },
        uWater: { value: new THREE.Color() }, uSkyLow: { value: new THREE.Color() },
        uFog: { value: this.cam.fog }, uSea: { value: SEA }, uTime: { value: 0 },
      },
    });
    this.scene.add(new THREE.Mesh(geo, this.terrainMat));
  }

  // The sun (or moon) — a flat disc traced from points, hung far to the north.
  buildSky() {
    this.skyMat = new THREE.ShaderMaterial({
      vertexShader: skyVert, fragmentShader: skyFrag, depthTest: false, depthWrite: false,
      uniforms: { uSkyTop: { value: new THREE.Color() }, uSkyLow: this.terrainMat.uniforms.uSkyLow, uCloud: { value: new THREE.Color() }, uTime: { value: 0 }, uAspect: { value: 1 }, uStars: { value: 0 } },
    });
    const sky = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.skyMat);
    sky.frustumCulled = false; sky.renderOrder = -10;
    this.scene.add(sky);
    const shape = new THREE.Shape(Array.from({ length: 72 }, (_, i) => new THREE.Vector2(Math.cos((i / 72) * 6.2832) * 46, Math.sin((i / 72) * 6.2832) * 46)));
    this.sunMat = new THREE.MeshBasicMaterial();
    this.sun = new THREE.Mesh(new THREE.ShapeGeometry(shape, 1), this.sunMat);
    this.sun.position.set(-28, 58, -470);
    this.scene.add(this.sun);
  }

  // Cherry trees grown branch by branch from a seeded rule — every one is different.
  buildGrove() {
    const r = seeded(7), segs = [], dots = [], sizes = [], tones = [];
    const grow = (x, y, z, dx, dy, dz, len, depth) => {
      const ex = x + dx * len, ey = y + dy * len, ez = z + dz * len;
      segs.push(x, y, z, ex, ey, ez);
      if (depth === 0) {
        for (let i = 0; i < 9; i++) {
          dots.push(ex + (r() - 0.5) * len * 2.6, ey + (r() - 0.3) * len * 1.8, ez + (r() - 0.5) * len * 2.6);
          sizes.push(0.4 + r() * 0.6); tones.push(r());
        }
        return;
      }
      const kids = depth > 2 ? 3 : 2;
      for (let k = 0; k < kids; k++) {
        let nx = dx + (r() - 0.5) * 1.3, ny = dy * 0.75 + 0.25 + (r() - 0.5) * 0.4, nz = dz + (r() - 0.5) * 1.3;
        const l = Math.hypot(nx, ny, nz); nx /= l; ny /= l; nz /= l;
        grow(ex, ey, ez, nx, ny, nz, len * (0.66 + r() * 0.12), depth - 1);
      }
    };
    const anchors = [...Object.values(WAYPOINTS), ...STOPS.map((s) => s.l)];
    // Keep the flight path clear so no tree ever fills the screen.
    const flight = [];
    for (let i = 0; i < 4; i++) for (let k = 0; k <= 6; k++) flight.push([mix(STOPS[i].p[0], STOPS[i + 1].p[0], k / 6), mix(STOPS[i].p[1], STOPS[i + 1].p[1], k / 6)]);
    const want = this.small ? 34 : 60;
    let placed = 0, tries = 0;
    while (placed < want && tries++ < 900) {
      const a = anchors[Math.floor(r() * anchors.length)];
      const ang = r() * 6.2832, d = 9 + r() * 50;
      const x = a[0] + Math.cos(ang) * d, z = a[1] + Math.sin(ang) * d;
      const y = heightAt(x, z);
      if (y <= SEA + 0.6) continue;
      if (flight.some(([fx, fz]) => Math.hypot(fx - x, fz - z) < 24)) continue;
      grow(x, y, z, (r() - 0.5) * 0.25, 1, (r() - 0.5) * 0.25, 2.6 + r() * 1.4, 4);
      placed++;
    }
    const lg = new THREE.BufferGeometry();
    lg.setAttribute('position', new THREE.Float32BufferAttribute(segs, 3));
    this.treeMat = new THREE.ShaderMaterial({ vertexShader: fogLineVert, fragmentShader: fogLineFrag, uniforms: { uPaper: this.terrainMat.uniforms.uSkyLow, uInk: { value: new THREE.Color() }, uFog: { value: this.cam.fog } } });
    this.scene.add(new THREE.LineSegments(lg, this.treeMat));
    const pg = new THREE.BufferGeometry();
    pg.setAttribute('position', new THREE.Float32BufferAttribute(dots, 3));
    pg.setAttribute('aSize', new THREE.Float32BufferAttribute(sizes, 1));
    pg.setAttribute('aTone', new THREE.Float32BufferAttribute(tones, 1));
    this.blossomMat = new THREE.ShaderMaterial({ vertexShader: blossomVert, fragmentShader: blossomFrag, uniforms: { uPaper: this.terrainMat.uniforms.uPaper, uSkyLow: this.terrainMat.uniforms.uSkyLow, uAccent: { value: new THREE.Color() }, uFog: { value: this.cam.fog }, uScale: { value: 600 } } });
    this.scene.add(new THREE.Points(pg, this.blossomMat));
  }

  buildPetals() {
    const n = this.small ? 260 : 520, r = seeded(99), pos = [], seed = [];
    for (let i = 0; i < n; i++) { pos.push(r() * 140, r() * 46, r() * 140); seed.push(r()); }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('aSeed', new THREE.Float32BufferAttribute(seed, 1));
    this.petalMat = new THREE.ShaderMaterial({ vertexShader: petalVert, fragmentShader: petalFrag, uniforms: { uTime: { value: 0 }, uScale: { value: 600 }, uCam: { value: new THREE.Vector3() }, uAccent: this.blossomMat.uniforms.uAccent, uPaper: this.terrainMat.uniforms.uPaper } });
    const pts = new THREE.Points(g, this.petalMat);
    pts.frustumCulled = false;
    this.scene.add(pts);
  }

  // The gate at the spawn point — drawn line by line, facing the arriving camera.
  buildGate(g) {
    const P = (pts) => new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts.map(([x, y, z = 0]) => new THREE.Vector3(x, y, z))), this.sunMatLine);
    const lintel = (y, half, sag, z) => Array.from({ length: 21 }, (_, i) => { const u = (i / 20) * 2 - 1; return [u * half, y + u * u * sag, z]; });
    for (const z of [-0.45, 0.45]) {
      for (const x of [-3.4, 3.4]) g.add(P([[x * 1.06, 0, z], [x, 9, z]]));
      g.add(P(lintel(9.6, 5.6, 0.9, z))); g.add(P(lintel(10.3, 5.9, 1.0, z)));
      g.add(P([[-4.3, 7.2, z], [4.3, 7.2, z]])); g.add(P([[-4.3, 7.8, z], [4.3, 7.8, z]]));
      g.add(P([[0, 7.8, z], [0, 9.6, z]]));
    }
    for (const x of [-5.6, 5.6]) g.add(P([[x, 10.5, -0.45], [x, 10.5, 0.45]]));
  }

  // A marker = a thin survey pole + the project's sigil drawn twice at right angles, so it reads from any side.
  buildMarkers() {
    this.inkMat = new THREE.LineBasicMaterial();
    this.accentMat = new THREE.LineBasicMaterial();
    this.sunMatLine = new THREE.LineBasicMaterial();
    for (const [id, [x, z]] of Object.entries(WAYPOINTS)) {
      const g = new THREE.Group();
      g.position.set(x, heightAt(x, z), z);
      if (id === 'spawn') { this.buildGate(g); this.scene.add(g); this.markers.push({ id, group: g, sigil: new THREE.Group(), scale: 1 }); continue; }
      const pole = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 7, 0)]);
      g.add(new THREE.Line(pole, this.inkMat));
      const foot = new THREE.BufferGeometry().setFromPoints(
        Array.from({ length: 41 }, (_, i) => new THREE.Vector3(Math.cos((i / 40) * 6.2832) * 2.6, 0.15, Math.sin((i / 40) * 6.2832) * 2.6)));
      g.add(new THREE.Line(foot, this.inkMat));
      const sigil = new THREE.Group();
      sigil.position.y = 9.4;
      for (const rot of [0, Math.PI / 2]) {
        for (const line of sigils[id]) {
          const geo = new THREE.BufferGeometry().setFromPoints(line.map(([px, py]) => new THREE.Vector3(px * 2.1, py * 2.1, 0)));
          const l = new THREE.Line(geo, this.accentMat);
          l.rotation.y = rot;
          sigil.add(l);
        }
      }
      g.add(sigil);
      this.scene.add(g);
      this.markers.push({ id, group: g, sigil, scale: 1 });
    }
  }

  setTheme() {
    const css = getComputedStyle(document.documentElement);
    const c = (name) => new THREE.Color(css.getPropertyValue(name).trim());
    const paper = c('--paper');
    this.terrainMat.uniforms.uPaper.value.copy(paper);
    this.terrainMat.uniforms.uInk.value.copy(c('--ink'));
    this.inkMat.color.copy(c('--ink'));
    this.accentMat.color.copy(c('--accent'));
    this.blossomMat.uniforms.uAccent.value.copy(c('--accent'));
    this.sunMat.color.copy(c('--sun'));
    this.sunMatLine.color.copy(c('--sun'));
    const u = this.terrainMat.uniforms;
    u.uLandLo.value.copy(c('--land-lo')); u.uLandHi.value.copy(c('--land-hi')); u.uSand.value.copy(c('--sand'));
    u.uWater.value.copy(c('--water')); u.uSkyLow.value.copy(c('--sky-low'));
    this.skyMat.uniforms.uSkyTop.value.copy(c('--sky-top')); this.skyMat.uniforms.uCloud.value.copy(c('--cloud'));
    this.skyMat.uniforms.uStars.value = document.documentElement.dataset.theme === 'night' ? 1 : 0;
    this.treeMat.uniforms.uInk.value.copy(c('--bark'));
    this.renderer.setClearColor(paper, 1);
  }

  resize() {
    const w = innerWidth, h = innerHeight;
    this.renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.75));
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.fov = w < h ? 64 : 50;
    // On wide screens the text sits left, so the world is framed to the right of centre.
    if (w > 900) this.camera.setViewOffset(w, h, -w * 0.13, 0, w, h); else this.camera.clearViewOffset();
    this.camera.updateProjectionMatrix();
    const scale = this.renderer.domElement.height / (2 * Math.tan((this.camera.fov * Math.PI) / 360));
    this.skyMat.uniforms.uAspect.value = w / h;
    this.blossomMat.uniforms.uScale.value = scale;
    this.petalMat.uniforms.uScale.value = scale;
  }

  // Scroll position → a fractional index into STOPS.
  progress() {
    const mid = innerHeight * 0.5;
    let p = 0;
    this.sections.forEach((s, i) => {
      const r = s.getBoundingClientRect();
      if (r.top <= mid) p = i + Math.min(Math.max((mid - r.top) / Math.max(r.height, 1), 0), 1) - 0.5;
    });
    return Math.min(Math.max(p, 0), STOPS.length - 1);
  }

  loop() {
    if (this.disposed || document.hidden) return;
    this.raf = requestAnimationFrame(this.loop);
    const dt = Math.min(this.clock.getDelta(), 0.05);
    const t = this.clock.elapsedTime;

    const p = this.progress();
    const i = Math.min(Math.floor(p), STOPS.length - 2);
    const f = smooth(Math.min(Math.max(p - i, 0), 1));
    const a = STOPS[i], b = STOPS[i + 1];
    const px = mix(a.p[0], b.p[0], f), pz = mix(a.p[1], b.p[1], f);
    let lx = mix(a.l[0], b.l[0], f), lz = mix(a.l[1], b.l[1], f);
    const alt = mix(a.alt, b.alt, f);

    // Hovering a quest turns the camera towards its waypoint.
    const fw = store.focus && WAYPOINTS[store.focus];
    if (fw && p < 2) { lx = mix(lx, fw[0], 0.7); lz = mix(lz, fw[1], 0.7); }
    lx += store.pointer.x * 5;

    const k = this.first || this.reduced ? 1 : 1 - Math.exp(-dt * 3.2);
    this.first = false;
    this.cam.pos.lerp(this.tmp.set(px, Math.max(heightAt(px, pz), 0) + alt, pz), k);
    this.cam.look.lerp(this.tmp.set(lx, heightAt(lx, lz) + 3, lz), k);
    this.cam.fog.x = mix(this.cam.fog.x, mix(a.fog[0], b.fog[0], f), k);
    this.cam.fog.y = mix(this.cam.fog.y, mix(a.fog[1], b.fog[1], f), k);

    const bob = this.reduced ? 0 : Math.sin(t * 0.6) * 0.25;
    this.camera.position.copy(this.cam.pos).setY(this.cam.pos.y + bob);
    this.camera.lookAt(this.cam.look);

    const dx = this.cam.look.x - this.cam.pos.x, dz = this.cam.look.z - this.cam.pos.z;
    store.heading = ((Math.atan2(dx, -dz) * 180) / Math.PI + 360) % 360;
    store.coords.x = this.cam.pos.x; store.coords.y = -this.cam.pos.z; store.coords.alt = this.cam.pos.y;
    store.region = Math.round(p);

    const labels = [];
    for (const m of this.markers) {
      const on = store.focus === m.id;
      m.scale = mix(m.scale, on ? 1.7 : 1, 0.12);
      m.sigil.scale.setScalar(m.scale);
      if (!this.reduced) m.sigil.rotation.y = t * (on ? 1.4 : 0.45);
      this.tmp.copy(m.group.position).setY(m.group.position.y + 13.5);
      const dist = this.tmp.distanceTo(this.camera.position);
      this.tmp.project(this.camera);
      labels.push({
        id: m.id, x: (this.tmp.x * 0.5 + 0.5) * innerWidth, y: (-this.tmp.y * 0.5 + 0.5) * innerHeight,
        visible: this.tmp.z < 1 && Math.abs(this.tmp.x) < 1 && Math.abs(this.tmp.y) < 1 && dist < this.cam.fog.y * 0.85,
      });
    }
    store.labels = labels;
    this.petalMat.uniforms.uTime.value = this.reduced ? 0 : t;
    this.terrainMat.uniforms.uTime.value = this.reduced ? 0 : t;
    this.skyMat.uniforms.uTime.value = this.reduced ? 0 : t;
    this.petalMat.uniforms.uCam.value.copy(this.camera.position);
    store.ready = true;
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('pointermove', this.onPointer);
    document.removeEventListener('visibilitychange', this.onVis);
    this.scene.traverse((o) => { o.geometry?.dispose(); });
    [this.terrainMat, this.inkMat, this.accentMat, this.sunMat, this.sunMatLine, this.treeMat, this.blossomMat, this.petalMat, this.skyMat].forEach((m) => m.dispose());
    this.renderer.dispose();
  }
}
