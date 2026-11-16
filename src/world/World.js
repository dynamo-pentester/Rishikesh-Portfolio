import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { heightAt, SEA } from './noise';
import { store } from './store';

const SIZE = 420;

// Where each project's shrine stone stands (x, z), plus the gate and the signal fire.
export const WAYPOINTS = {
  sentinel: [-30, -4], securesplit: [-9, -24], matcare: [15, -10], 'ale-logs': [34, -30],
  spawn: [0, 62], campfire: [6, -64],
};

// One camera stop per page section: position, altitude, look-at, fog density. The camera rests at a stop
// for the whole act and only travels in the gap between two acts.
const STOPS = [
  { p: [0, 104], alt: 6.5, l: [0, -60], fog: 0.0085 },            // the gate
  { p: [5, 50], alt: 4.4, l: [-30, -8], fog: 0.012 },             // the warrior: through the gate, at grass height
  { p: [-4, 34], alt: 15, l: [2, -14], fog: 0.011 },              // the scrolls: over the shrine stones
  { p: [46, 6], alt: 11, l: [78, -52], fog: 0.012 },              // the arsenal
  { p: [80, -62], alt: 14, l: [34, -112], fog: 0.012 },           // war record
  { p: [13.5, -56.5], alt: 2.5, l: [6, -64], ly: 1.9, fog: 0.012 }, // the resting place
];
const GRAB = 0.467, HOME = 1.133;   // seconds into the draw / sheathe clips where the hand meets the hilt

// nothing tall may stand between a project stone and the spot the camera views it from
const nearStoneView = (x, z, r) => Object.entries(WAYPOINTS).some(([id, [wx, wz]]) => id !== 'spawn' && id !== 'campfire' && Math.hypot(x - wx - 1.3, z - wz - 6) < r);
const smooth = (t) => t * t * (3 - 2 * t);
const mix = (a, b, t) => a + (b - a) * t;
const clamp = (v, a = 0, b = 1) => Math.min(Math.max(v, a), b);
const seeded = (seed) => () => {
  seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

/* ---------- procedural surface maps (tileable value noise drawn to data textures) ---------- */
function tileNoise(size, period, octaves, seed) {
  const r = seeded(seed), out = new Float32Array(size * size);
  let amp = 1, total = 0;
  for (let o = 0; o < octaves; o++) {
    const p = period * 2 ** o, lattice = new Float32Array(p * p);
    for (let i = 0; i < lattice.length; i++) lattice[i] = r();
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
      const fx = (x / size) * p, fy = (y / size) * p, ix = Math.floor(fx), iy = Math.floor(fy);
      const tx = smooth(fx - ix), ty = smooth(fy - iy), x1 = (ix + 1) % p, y1 = (iy + 1) % p;
      const a = lattice[iy * p + ix], b = lattice[iy * p + x1], c = lattice[y1 * p + ix], d = lattice[y1 * p + x1];
      out[y * size + x] += (a + (b - a) * tx + (c - a) * ty + (a - b - c + d) * tx * ty) * amp;
    }
    total += amp; amp *= 0.5;
  }
  for (let i = 0; i < out.length; i++) out[i] /= total;
  return out;
}
function dataTexture(size, fill, repeat, srgb = false) {
  const data = new Uint8Array(size * size * 4);
  for (let i = 0; i < size * size; i++) { const [r, g, b] = fill(i % size, Math.floor(i / size), i); data.set([r, g, b, 255], i * 4); }
  const t = new THREE.DataTexture(data, size, size);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat, repeat);
  t.magFilter = THREE.LinearFilter; t.minFilter = THREE.LinearMipmapLinearFilter; t.generateMipmaps = true;
  t.anisotropy = 4; if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.needsUpdate = true;
  return t;
}
function normalMap(height, size, strength, repeat) {
  return dataTexture(size, (x, y) => {
    const h = (dx, dy) => height[((y + dy + size) % size) * size + ((x + dx + size) % size)];
    const nx = (h(-1, 0) - h(1, 0)) * strength, ny = (h(0, -1) - h(0, 1)) * strength, l = Math.hypot(nx, ny, 1);
    return [(nx / l * 0.5 + 0.5) * 255, (ny / l * 0.5 + 0.5) * 255, (1 / l * 0.5 + 0.5) * 255];
  }, repeat);
}

/* ---------- shaders ---------- */
const noiseGlsl = /* glsl */ `
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float vn(vec2 p) {
    vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
  }`;

const skyVert = /* glsl */ `varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 1.0, 1.0); }`;
const skyFrag = /* glsl */ `
  uniform float uTime; uniform float uAspect; varying vec2 vUv;
  ${noiseGlsl}
  void main() {
    vec3 c = mix(vec3(0.075, 0.006, 0.012), vec3(0.004, 0.001, 0.003), smoothstep(0.2, 0.95, vUv.y));
    vec2 g = floor(vUv * vec2(uAspect, 1.0) * 190.0);
    c += step(0.9935, hash(g)) * smoothstep(0.4, 0.9, vUv.y) * (0.5 + 0.5 * sin(uTime * 2.0 + hash(g + 1.0) * 6.28)) * 0.5;
    vec2 p = vec2(vUv.x * uAspect * 1.6 + uTime * 0.008, vUv.y * 6.0);
    float n = vn(p) * 0.55 + vn(p * 2.1 + 7.0) * 0.3 + vn(p * 4.3 + 3.0) * 0.15;
    c = mix(c, vec3(0.035, 0.004, 0.008), smoothstep(0.5, 0.82, n) * smoothstep(0.3, 0.7, vUv.y) * 0.8);
    gl_FragColor = vec4(c, 1.0);
  }`;

// The moon is a real sphere: cratered highlands and dark seas from 3D noise, a darkened limb, HDR so it blooms.
const moonVert = /* glsl */ `
  varying vec3 vP; varying vec3 vN; varying vec3 vV;
  void main() { vP = position; vN = normalize(normalMatrix * normal); vec4 mv = modelViewMatrix * vec4(position, 1.0); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`;
const moonFrag = /* glsl */ `
  varying vec3 vP; varying vec3 vN; varying vec3 vV;
  float h3(vec3 p) { return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
  float n3(vec3 p) {
    vec3 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
    return mix(mix(mix(h3(i), h3(i + vec3(1, 0, 0)), f.x), mix(h3(i + vec3(0, 1, 0)), h3(i + vec3(1, 1, 0)), f.x), f.y),
               mix(mix(h3(i + vec3(0, 0, 1)), h3(i + vec3(1, 0, 1)), f.x), mix(h3(i + vec3(0, 1, 1)), h3(i + vec3(1, 1, 1)), f.x), f.y), f.z);
  }
  float fbm(vec3 p) { float a = 0.5, s = 0.0; for (int i = 0; i < 5; i++) { s += a * n3(p); p *= 2.07; a *= 0.5; } return s; }
  float craters(vec3 p) {
    float c = 0.0;
    for (int o = 0; o < 3; o++) {
      float sc = 4.0 * pow(2.2, float(o));
      vec3 q = p * sc, cell = floor(q), f = fract(q) - 0.5;
      float r = 0.18 + 0.22 * h3(cell);
      float d = length(f + (vec3(h3(cell + 3.1), h3(cell + 5.7), h3(cell + 9.2)) - 0.5) * 0.4);
      c += (smoothstep(r, r * 0.82, d) * -0.5 + smoothstep(r * 1.12, r, d) * smoothstep(r * 0.8, r, d) * 0.9) / float(o + 1);
    }
    return c;
  }
  void main() {
    float seas = smoothstep(0.42, 0.62, fbm(vP * 1.7 + 4.0));
    float rough = fbm(vP * 9.0);
    float relief = craters(vP) * 0.35 + (rough - 0.5) * 0.5;
    vec3 col = mix(vec3(1.0, 0.085, 0.07), vec3(0.34, 0.012, 0.02), seas) * (0.72 + relief);
    float limb = pow(max(dot(normalize(vN), normalize(vV)), 0.0), 0.55);
    gl_FragColor = vec4(col * limb * 1.35, 1.0);
  }`;
const coronaFrag = /* glsl */ `
  varying vec2 vUv;
  void main() {
    float d = length(vUv - 0.5) * 2.0;
    float a = exp(-max(d - 0.43, 0.0) * 9.0) * 0.32 + exp(-max(d - 0.43, 0.0) * 2.6) * 0.1;
    gl_FragColor = vec4(vec3(1.0, 0.06, 0.07) * a * smoothstep(1.0, 0.75, d), 1.0);
  }`;
const uvVert = /* glsl */ `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;

// Petals in the air and embers over the shrine stones are GPU point systems.
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
  uniform float uTime; varying float vSeed;
  void main() {
    float a = uTime * (0.6 + vSeed) + vSeed * 30.0;
    vec2 q = mat2(cos(a), -sin(a), sin(a), cos(a)) * (gl_PointCoord - 0.5);
    q.y *= 1.0 + 0.6 * sin(a * 1.3);
    if (max(length(q - vec2(0.0, 0.26)), length(q + vec2(0.0, 0.26))) > 0.5 || length(q - vec2(0.36, 0.0)) < 0.09) discard;
    gl_FragColor = vec4(mix(vec3(0.95, 0.3, 0.42), vec3(0.45, 0.05, 0.1), vSeed * 0.7) * (0.35 + 0.4 * abs(sin(a))), 1.0);
  }`;
const emberVert = /* glsl */ `
  attribute float aSeed; uniform float uTime; uniform float uScale; uniform float uBoost; varying float vLife;
  void main() {
    float life = fract(aSeed * 7.0 + uTime * (0.12 + aSeed * 0.1));
    vec3 p = position + vec3(sin(uTime * 0.9 + aSeed * 50.0) * 0.5 * life, life * (6.0 + uBoost * 4.0), cos(uTime * 0.7 + aSeed * 30.0) * 0.5 * life);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vLife = life;
    gl_PointSize = (0.12 + 0.1 * aSeed) * (1.0 - life * 0.6) * uScale / -mv.z;
    gl_Position = projectionMatrix * mv;
  }`;
const emberFrag = /* glsl */ `
  uniform float uBoost; varying float vLife;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    gl_FragColor = vec4(vec3(1.0, 0.22, 0.05) * (1.0 - vLife) * (2.2 + uBoost * 3.0) * smoothstep(0.5, 0.0, d), 1.0);
  }`;

// Shared wind for grass and blossom: sways the top of each card.
const windPatch = (material, strength, uniforms) => {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = uniforms.uTime;
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nuniform float uTime;')
      .replace('#include <begin_vertex>', `#include <begin_vertex>
        #ifdef USE_INSTANCING
          vec3 wp = (instanceMatrix * vec4(position, 1.0)).xyz;
        #else
          vec3 wp = position;
        #endif
        float sway = sin(uTime * 1.3 + wp.x * 0.35 + wp.z * 0.27) + 0.5 * sin(uTime * 2.9 + wp.x * 1.3);
        transformed.x += sway * ${strength.toFixed(3)} * uv.y;
        transformed.z += sway * ${(strength * 0.5).toFixed(3)} * uv.y;`);
  };
  return material;
};

export class World {
  constructor(canvas) {
    this.canvas = canvas;
    this.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.small = Math.min(innerWidth, innerHeight) < 700;
    const renderer = (this.renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' }));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x060101, STOPS[0].fog);
    this.camera = new THREE.PerspectiveCamera(50, 1, 0.5, 1800);
    this.cam = { pos: new THREE.Vector3(0, 12, 104), look: new THREE.Vector3(0, 3, -60) };
    this.clock = new THREE.Clock();
    this.time = { uTime: { value: 0 } };
    this.markers = [];
    this.lanterns = [];
    this.tmp = new THREE.Vector3();
    this.dummy = new THREE.Object3D();

    this.buildMaps();
    this.buildEnvironment();
    this.buildSky();
    this.buildGround();
    this.buildScatter();
    this.buildGrass();
    this.buildGraves();
    this.buildPetals();
    this.buildMarkers();
    this.buildGuardian();
    this.loadModels();
    this.buildComposer();
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

  setTheme() {}

  buildMaps() {
    const S = 256;
    const fine = tileNoise(S, 8, 5, 3), pools = tileNoise(S, 3, 4, 9), ripple = tileNoise(S, 6, 3, 21);
    this.maps = {
      stoneNormal: normalMap(fine, S, 6, 40),
      // wet stone: standing water (very smooth) pools in the low-frequency dips
      wet: dataTexture(S, (x, y, i) => { const v = smooth(Math.min(Math.max((pools[i] - 0.44) * 6, 0), 1)); const g = (0.74 - v * 0.42 + fine[i] * 0.1) * 255; return [255, g, 20]; }, 9),
      rockNormal: normalMap(fine, S, 7, 2),
      ripple: normalMap(ripple, S, 5, 46),
    };
  }

  // Reflections come from a dim studio plus one hot crimson source standing in for the moon.
  buildEnvironment() {
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    const room = new RoomEnvironment();
    const glow = new THREE.Mesh(new THREE.SphereGeometry(2.6, 24, 16), new THREE.MeshBasicMaterial({ color: new THREE.Color(26, 0.9, 1.3) }));
    glow.position.set(1.5, 3.2, -7.5);
    room.add(glow);
    this.envMap = pmrem.fromScene(room, 0.03).texture;
    this.scene.environment = this.envMap;
    this.scene.environmentIntensity = 0.3;
    pmrem.dispose();
  }

  buildSky() {
    this.skyMat = new THREE.ShaderMaterial({ vertexShader: skyVert, fragmentShader: skyFrag, depthTest: false, depthWrite: false, fog: false, uniforms: { uTime: this.time.uTime, uAspect: { value: 1 } } });
    const sky = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.skyMat);
    sky.frustumCulled = false; sky.renderOrder = -10;
    this.scene.add(sky);

    this.moon = new THREE.Mesh(new THREE.SphereGeometry(1, 96, 64), new THREE.ShaderMaterial({ vertexShader: moonVert, fragmentShader: moonFrag, fog: false }));
    this.corona = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.ShaderMaterial({ vertexShader: uvVert, fragmentShader: coronaFrag, fog: false, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
    this.moon.renderOrder = -8; this.corona.renderOrder = -9;
    this.scene.add(this.corona, this.moon);

    // Moonlight: one hard crimson key from behind the gate, a faint bounce so the ground is never pure black.
    this.moonLight = new THREE.DirectionalLight(0xff1a1a, 3.2);
    this.scene.add(this.moonLight, this.moonLight.target, new THREE.HemisphereLight(0x6a1a22, 0x050203, 0.7));
  }

  buildGround() {
    const seg = this.small ? 190 : 300;
    const geo = new THREE.PlaneGeometry(SIZE, SIZE, seg, seg);
    geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) pos.setY(i, heightAt(pos.getX(i), pos.getZ(i)));
    geo.computeVertexNormals();
    this.groundMat = new THREE.MeshStandardMaterial({ color: 0x120c0b, roughness: 1, metalness: 0, roughnessMap: this.maps.wet, normalMap: this.maps.stoneNormal, normalScale: new THREE.Vector2(0.45, 0.45), envMapIntensity: 0.6 });
    this.scene.add(new THREE.Mesh(geo, this.groundMat));

    this.waterMat = new THREE.MeshStandardMaterial({ color: 0x0a0204, roughness: 0.5, metalness: 0, normalMap: this.maps.ripple, normalScale: new THREE.Vector2(0.5, 0.5), envMapIntensity: 0.45 });
    // two layers of ripples sliding across each other, so the surface reads as a current
    this.waterMat.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = this.time.uTime;
      shader.fragmentShader = shader.fragmentShader.replace('#include <common>', '#include <common>\nuniform float uTime;')
        .replace('#include <normal_fragment_maps>', `
          vec3 mapA = texture2D(normalMap, vNormalMapUv + uTime * vec2(0.035, 0.11)).xyz * 2.0 - 1.0;
          vec3 mapB = texture2D(normalMap, vNormalMapUv * 0.61 + uTime * vec2(-0.05, 0.07)).xyz * 2.0 - 1.0;
          vec3 mapN = normalize(vec3(mapA.xy + mapB.xy, mapA.z * mapB.z));
          mapN.xy *= normalScale;
          normal = normalize(tbn * mapN);`);
    };
    const water = new THREE.Mesh(new THREE.PlaneGeometry(SIZE, SIZE), this.waterMat);
    water.rotation.x = -Math.PI / 2; water.position.y = SEA + 0.06;
    this.scene.add(water);
  }

  place(mesh, count, seed, spread, fit) {
    const r = seeded(seed), anchors = [...Object.values(WAYPOINTS), ...STOPS.map((s) => s.l), ...STOPS.slice(0, 5).map((s) => s.p)];
    let n = 0, tries = 0;
    while (n < count && tries++ < count * 12) {
      const a = anchors[Math.floor(r() * anchors.length)], ang = r() * 6.2832, d = r() * spread;
      const x = a[0] + Math.cos(ang) * d, z = a[1] + Math.sin(ang) * d, y = heightAt(x, z);
      if (fit(this.dummy, x, y, z, r) === false) continue;
      this.dummy.updateMatrix(); mesh.setMatrixAt(n++, this.dummy.matrix);
    }
    mesh.count = n; mesh.instanceMatrix.needsUpdate = true;
    this.scene.add(mesh);
    return mesh;
  }

  // Jagged rocks, grass tufts and fallen petals, all instanced.
  buildScatter() {
    const rockGeo = new THREE.IcosahedronGeometry(1, 1).toNonIndexed();
    const rp = rockGeo.attributes.position, rr = seeded(5), seen = new Map();
    for (let i = 0; i < rp.count; i++) {
      const key = `${rp.getX(i).toFixed(3)},${rp.getY(i).toFixed(3)},${rp.getZ(i).toFixed(3)}`;
      if (!seen.has(key)) seen.set(key, 0.62 + rr() * 0.7);
      const k = seen.get(key); rp.setXYZ(i, rp.getX(i) * k, rp.getY(i) * k * 0.72, rp.getZ(i) * k);
    }
    rockGeo.computeVertexNormals();
    const rockMat = new THREE.MeshStandardMaterial({ color: 0x1b1718, roughness: 0.92, metalness: 0, normalMap: this.maps.rockNormal });
    this.place(new THREE.InstancedMesh(rockGeo, rockMat, 70), 70, 31, 80, (d, x, y, z, r) => {
      if (y <= SEA + 0.1) return false;
      const s = 1.3 + r() * 2.6;
      if ((Math.abs(x) < 7 && z > 36) || Math.hypot(x - 11, z + 59) < 13 || nearStoneView(x, z, 10)) return false;
      d.position.set(x, y - s * 0.12, z); d.rotation.set(r() * 6, r() * 6, r() * 6); d.scale.set(s, s * 0.7, s);
    });

    const petalMat = new THREE.MeshStandardMaterial({ color: 0xd9627f, roughness: 0.6, side: THREE.DoubleSide, emissive: 0x2a0810 });
    this.place(new THREE.InstancedMesh(new THREE.PlaneGeometry(0.26, 0.15), petalMat, 500), 500, 63, 55, (d, x, y, z, r) => {
      d.position.set(x, Math.max(y, SEA + 0.06) + 0.04, z); d.rotation.set(-Math.PI / 2 + (r() - 0.5) * 0.3, 0, r() * 6.28); d.scale.setScalar(0.7 + r() * 0.9);
    });
  }

  // Susuki — pampas grass. Every instance is a tuft of real curved blades with two pale plumes above it,
  // lit matte, and bent after instancing so one gust rolls across the whole field.
  buildGrass() {
    const r = seeded(8), pos = [], col = [], bend = [], idx = [];
    const strip = (bx, bz, height, lean, dir, w, plume) => {
      const segs = plume ? 6 : 4, base = pos.length / 3, cx = Math.cos(dir), cz = Math.sin(dir), tone = 0.75 + r() * 0.5;
      for (let s = 0; s <= segs; s++) {
        const t = s / segs, off = lean * t * t;
        const ww = plume ? 0.012 + w * Math.sin(Math.PI * clamp((t - 0.5) / 0.5)) ** 0.7 : w * (1 - t * 0.9);
        const k = plume ? smooth(clamp((t - 0.45) / 0.2)) : t;
        for (const side of [-1, 1]) {
          pos.push(bx + cx * off - cz * ww * side, height * t, bz + cz * off + cx * ww * side);
          if (plume) col.push(mix(0.08, 0.42, k) * tone, mix(0.05, 0.27, k) * tone, mix(0.04, 0.22, k) * tone);
          else col.push(mix(0.02, 0.17, k) * tone, mix(0.012, 0.09, k) * tone, mix(0.012, 0.065, k) * tone);
          bend.push((height * t) / 2);
        }
        if (s < segs) { const a = base + s * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
      }
    };
    for (let i = 0; i < 20; i++) { const a = r() * 6.283, d = Math.sqrt(r()) * 0.85; strip(Math.cos(a) * d, Math.sin(a) * d, 0.8 + r() * 0.8, 0.25 + r() * 0.5, r() * 6.283, 0.022 + r() * 0.02, false); }
    for (let i = 0; i < 3; i++) { const a = r() * 6.283, d = r() * 0.5; strip(Math.cos(a) * d, Math.sin(a) * d, 1.6 + r() * 0.6, 0.2 + r() * 0.3, r() * 6.283, 0.03 + r() * 0.018, true); }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    geo.setAttribute('aBend', new THREE.Float32BufferAttribute(bend, 1));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(new Float32Array(pos.length).map((_, i) => (i % 3 === 1 ? 1 : 0)), 3));
    geo.setIndex(idx);
    this.grassGeo = geo;
    this.grassMat = () => {
    const mat = new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide });
    mat.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = this.time.uTime;
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', '#include <common>\nuniform float uTime; attribute float aBend;')
        .replace('#include <project_vertex>', `
          vec4 gp = instanceMatrix * vec4(transformed, 1.0);
          float gust = sin(uTime * 0.8 - gp.x * 0.09 - gp.z * 0.05) * 0.55 + sin(uTime * 0.31 - gp.x * 0.027 + gp.z * 0.036) * 0.75;
          float flutter = sin(uTime * 2.7 + gp.x * 1.3 + gp.z * 1.7) * 0.1;
          float b = aBend * aBend * instanceMatrix[1][1];
          gp.x += (0.45 + gust * 0.5 + flutter) * b * 0.55;
          gp.z += (0.2 + gust * 0.24 - flutter) * b * 0.55;
          gp.y -= (0.3 + gust * 0.3) * b * 0.16;
          vec4 mvPosition = modelViewMatrix * gp;
          gl_Position = projectionMatrix * mvPosition;`);
    };
    return mat;
    };
    const mat = this.grassMat();
    // the field: thick around every place the camera rests, with the approach to the gate kept clear as a path
    const fields = [[0, 74, 40, 0.24], [-14, 22, 46, 0.24], [2, -14, 40, 0.14], [62, -22, 44, 0.14], [56, -88, 44, 0.12], [8, -62, 30, 0.12]];
    const keep = Object.values(WAYPOINTS), count = this.small ? 4200 : 12000;
    const mesh = new THREE.InstancedMesh(geo, mat, count), rr = seeded(47);
    let n = 0, tries = 0;
    while (n < count && tries++ < count * 6) {
      let pick = rr(), f = fields[0];
      for (const c of fields) { if (pick < c[3]) { f = c; break; } pick -= c[3]; }
      const a = rr() * 6.2832, d = Math.sqrt(rr()) * f[2], x = f[0] + Math.cos(a) * d, z = f[1] + Math.sin(a) * d, y = heightAt(x, z);
      if (y <= SEA + 0.3 || (Math.abs(x) < 2.4 && z > 38) || keep.some(([kx, kz]) => Math.hypot(kx - x, kz - z) < 3.2)) continue;
      if (Math.hypot(x - 10.5, z + 59.5) < 6.5) continue;                         // the clearing before the grave
      const s = 0.85 + rr() * 0.6;
      this.dummy.position.set(x, y - 0.06, z); this.dummy.rotation.set(0, 0, 0); this.dummy.scale.set(s * (0.8 + rr() * 0.6), s, s * (0.8 + rr() * 0.6));
      this.dummy.updateMatrix(); mesh.setMatrixAt(n++, this.dummy.matrix);
    }
    mesh.count = n; mesh.instanceMatrix.needsUpdate = true; mesh.frustumCulled = false;
    this.scene.add(mesh);
  }

  // Old graves along the approach: three stacked stones each, leaning with age, and wooden sotoba boards behind some.
  buildGraves() {
    const box = (w, h, d, y, rad) => new RoundedBoxGeometry(w, h, d, 2, rad).translate(0, y + h / 2, 0);
    const geo = mergeGeometries([box(1.15, 0.24, 1.15, 0, 0.05), box(0.82, 0.3, 0.82, 0.24, 0.05), box(0.46, 1.25, 0.46, 0.54, 0.06), box(0.56, 0.1, 0.56, 1.79, 0.04)]);
    const stone = new THREE.MeshStandardMaterial({ color: 0x4a4443, roughness: 0.95, metalness: 0, normalMap: this.maps.rockNormal, normalScale: new THREE.Vector2(0.8, 0.8) });
    const wood = new THREE.MeshStandardMaterial({ color: 0x2a1a14, roughness: 0.9 });
    const r = seeded(77), spots = [];
    for (let z = 96; z > 12; z -= 5.5 + r() * 5) for (const side of [-1, 1]) if (r() < 0.8) spots.push([side * (4.2 + r() * 7), z + r() * 3]);
    for (let i = 0; i < 9; i++) spots.push([-30 + (r() - 0.5) * 26, -8 + (r() - 0.5) * 24]);
    const graves = new THREE.InstancedMesh(geo, stone, spots.length), boards = new THREE.InstancedMesh(new THREE.BoxGeometry(0.11, 2.5, 0.025).translate(0, 1.25, 0), wood, spots.length * 2);
    let b = 0;
    spots.forEach(([x, z], i) => {
      const y = heightAt(x, z), s = 0.85 + r() * 0.5, rot = Math.atan2(-x, 6) + (r() - 0.5) * 0.5;
      this.dummy.position.set(x, y - 0.08, z); this.dummy.rotation.set((r() - 0.5) * 0.12, rot, (r() - 0.5) * 0.12); this.dummy.scale.setScalar(s);
      this.dummy.updateMatrix(); graves.setMatrixAt(i, this.dummy.matrix);
      for (let k = 0; k < 2; k++) if (r() < 0.6) {
        this.dummy.position.set(x - Math.sin(rot) * 0.5 + (k - 0.5) * 0.4, y - 0.1, z - Math.cos(rot) * 0.5); this.dummy.rotation.set((r() - 0.5) * 0.2, rot, (r() - 0.5) * 0.14); this.dummy.scale.setScalar(0.8 + r() * 0.35);
        this.dummy.updateMatrix(); boards.setMatrixAt(b++, this.dummy.matrix);
      }
    });
    boards.count = b; graves.frustumCulled = boards.frustumCulled = false;
    this.scene.add(graves, boards);
  }

  buildPetals() {
    const n = this.small ? 240 : 480, r = seeded(99), pos = [], seed = [];
    for (let i = 0; i < n; i++) { pos.push(r() * 140, r() * 46, r() * 140); seed.push(r()); }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('aSeed', new THREE.Float32BufferAttribute(seed, 1));
    this.petalMat = new THREE.ShaderMaterial({ vertexShader: petalVert, fragmentShader: petalFrag, uniforms: { uTime: this.time.uTime, uScale: { value: 600 }, uCam: { value: new THREE.Vector3() } } });
    const pts = new THREE.Points(g, this.petalMat); pts.frustumCulled = false;
    this.scene.add(pts);
  }

  // Each project is marked by an obsidian shrine stone with embers rising off it.
  buildMarkers() {
    const stone = new THREE.MeshPhysicalMaterial({ color: 0x060507, roughness: 0.14, metalness: 0.35, clearcoat: 0.7, clearcoatRoughness: 0.2, envMapIntensity: 2.2 });
    const body = new THREE.CylinderGeometry(0.5, 0.85, 4.4, 5), cap = new THREE.ConeGeometry(0.62, 0.9, 5), foot = new THREE.CylinderGeometry(1.25, 1.5, 0.4, 6);
    this.emberScale = { value: 600 };
    for (const [id, [x, z]] of Object.entries(WAYPOINTS)) {
      const g = new THREE.Group();
      g.position.set(x, heightAt(x, z), z);
      let boost = { value: 0 };
      if (id !== 'spawn' && id !== 'campfire') {
        const a = new THREE.Mesh(body, stone); a.position.y = 2.5;
        const b = new THREE.Mesh(cap, stone); b.position.y = 5.15;
        const c = new THREE.Mesh(foot, stone); c.position.y = 0.2;
        g.add(a, b, c); g.rotation.y = x * 0.37;
        const r = seeded(x * 13 + z), pos = [], seed = [];
        for (let i = 0; i < 46; i++) { pos.push((r() - 0.5) * 1.6, 0.4 + r() * 4, (r() - 0.5) * 1.6); seed.push(r()); }
        const eg = new THREE.BufferGeometry();
        eg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
        eg.setAttribute('aSeed', new THREE.Float32BufferAttribute(seed, 1));
        const em = new THREE.ShaderMaterial({ vertexShader: emberVert, fragmentShader: emberFrag, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, uniforms: { uTime: this.time.uTime, uScale: this.emberScale, uBoost: boost } });
        const pts = new THREE.Points(eg, em); pts.frustumCulled = false; g.add(pts);
      }
      this.scene.add(g);
      this.markers.push({ id, group: g, boost, top: id === 'spawn' ? 13 : 7 });
    }
  }

  // The gate, its lanterns and the cherry trees are Blender-built GLB files in /public/models.
  // Drop in a replacement with the same file name and node names and it is used as-is.
  loadModels() {
    const loader = (this.loader = new GLTFLoader());
    const draco = new DRACOLoader(); draco.setDecoderPath('/draco/'); loader.setDRACOLoader(draco);

    loader.load('/models/torii_gate.glb', (gltf) => {
      if (this.disposed) return;
      const gate = gltf.scene, [x, z] = WAYPOINTS.spawn;
      gate.position.set(x, heightAt(x, z) - 0.2, z); gate.scale.setScalar(1.25);
      gate.traverse((o) => { if (o.isMesh && o.material.name === 'Brass') { o.material.color.set(0x3a2317); o.material.metalness = 0.1; o.material.roughness = 0.8; } });
      this.scene.add(gate); gate.updateMatrixWorld(true);
      for (const name of ['LanternL', 'LanternR']) {
        const node = gate.getObjectByName(name);
        if (!node) continue;
        const light = new THREE.PointLight(0xff5500, 8, 22, 2);
        node.getWorldPosition(light.position);
        this.scene.add(light); this.lanterns.push(light);
      }
    });

    // Lanterns light the approach and the grave.
    loader.load('/models/lantern.glb', (gltf) => {
      if (this.disposed) return;
      gltf.scene.traverse((o) => { if (o.isMesh && o.material.emissiveMap) { o.material.emissive.set(0xff6a1e); o.material.emissiveIntensity = 0.75; } });
      for (const [x, z, lit] of [[-3.6, 90, 1], [3.6, 90, 0], [-3.6, 76, 0], [3.6, 76, 1], [-3.4, 47, 1], [3.4, 47, 0], [1.6, -61.2, 1]]) {
        const l = gltf.scene.clone(); l.position.set(x, heightAt(x, z) - 0.05, z); l.scale.setScalar(2.1); l.rotation.y = x * 0.4;
        this.scene.add(l);
        if (!lit && this.small) continue;
        const light = new THREE.PointLight(0xff5a14, 6, 18, 2); light.position.set(x, l.position.y + 2.7, z);
        this.scene.add(light); this.lanterns.push(light);
      }
    });

    // The resting place: grave, paper umbrella and old tree; his sword and helmet are set down in front of it once he is loaded.
    loader.load('/models/finale.glb', (gltf) => {
      if (this.disposed) return;
      const [x, z] = WAYPOINTS.campfire, rest = (this.rest = new THREE.Group());
      rest.position.set(x, heightAt(x, z) + 0.15, z); rest.rotation.y = Math.PI / 4;
      gltf.scene.scale.setScalar(20); rest.add(gltf.scene);
      const candle = new THREE.PointLight(0xff8a3c, 16, 16, 1.8); candle.position.set(0.2, 1.3, 2.6); rest.add(candle);
      this.scene.add(rest); rest.updateMatrixWorld(true);
      // the loose blossoms around the tree keep falling
      this.blossoms = [];
      gltf.scene.traverse((o) => {
        if (!o.name.startsWith('Blossom_Petal')) return;
        const q = o.parent.getWorldQuaternion(new THREE.Quaternion()).invert(), sc = o.parent.getWorldScale(new THREE.Vector3()).x;
        this.blossoms.push({ o, base: o.position.clone(), q, sc, ph: this.blossoms.length * 1.618 });
      });
      this.restGround = (lx, lz) => {
        const from = rest.localToWorld(new THREE.Vector3(lx, 30, lz));
        const hit = new THREE.Raycaster(from, new THREE.Vector3(0, -1, 0)).intersectObject(gltf.scene, true)[0];
        return hit ? rest.worldToLocal(hit.point).y : 0;
      };
      this.dressGrave();
    });
    loader.load('/models/kabuto.glb', (gltf) => { if (this.disposed) return; this.kabuto = gltf.scene; this.dressGrave(); });

    loader.load('/models/sakura_tree.glb', (gltf) => {
      if (this.disposed) return;
      const r = seeded(7), spots = [];
      const flight = [];
      for (let i = 0; i < 4; i++) for (let k = 0; k <= 6; k++) flight.push([mix(STOPS[i].p[0], STOPS[i + 1].p[0], k / 6), mix(STOPS[i].p[1], STOPS[i + 1].p[1], k / 6)]);
      const anchors = [...Object.values(WAYPOINTS), ...STOPS.map((s) => s.l)];
      const want = this.small ? 30 : 56;
      let tries = 0;
      while (spots.length < want && tries++ < 900) {
        const a = anchors[Math.floor(r() * anchors.length)], ang = r() * 6.2832, d = 9 + r() * 50;
        const x = a[0] + Math.cos(ang) * d, z = a[1] + Math.sin(ang) * d, y = heightAt(x, z);
        if (y <= SEA + 0.6 || flight.some(([fx, fz]) => Math.hypot(fx - x, fz - z) < 22)) continue;
        if (Math.hypot(x - WAYPOINTS.spawn[0], z - WAYPOINTS.spawn[1]) < 13 || Math.hypot(x - 12, z + 58) < 17 || Math.hypot(x - 5, z - 50) < 12 || nearStoneView(x, z, 13)) continue;
        spots.push({ x, y, z, rot: r() * 6.28, s: 1.5 + r() * 0.9, v: r() < 0.5 ? 'TreeA' : 'TreeB' });
      }
      for (const v of ['TreeA', 'TreeB']) {
        const mine = spots.filter((s) => s.v === v);
        for (const part of ['trunk', 'blossom']) {
          const src = gltf.scene.getObjectByName(`${v}_${part}`);
          if (!src) continue;
          const mat = src.material;
          if (part === 'blossom') { mat.alphaTest = 0.5; mat.transparent = false; mat.side = THREE.DoubleSide; mat.emissive = new THREE.Color(0x3a0c18); mat.roughness = 0.75; windPatch(mat, 0.09, this.time); }
          const inst = new THREE.InstancedMesh(src.geometry, mat, mine.length);
          mine.forEach((s, i) => { this.dummy.position.set(s.x, s.y, s.z); this.dummy.rotation.set(0, s.rot, 0); this.dummy.scale.setScalar(s.s); this.dummy.updateMatrix(); inst.setMatrixAt(i, this.dummy.matrix); });
          inst.frustumCulled = false;
          this.scene.add(inst);
        }
      }
    });
  }

  // The guardian stands in his own scene so he stays framed against the moon whatever the world camera does.
  buildGuardian() {
    const scene = (this.heroScene = new THREE.Scene());
    scene.environment = this.envMap; scene.environmentIntensity = 0.3;
    const key = new THREE.DirectionalLight(0xff1a1a, 7.5); key.position.set(-2.6, 3.4, -4.4);
    key.castShadow = true; key.shadow.mapSize.set(1024, 1024); key.shadow.bias = -0.0006;
    Object.assign(key.shadow.camera, { left: -3, right: 3, top: 3.4, bottom: -1, near: 0.5, far: 14 });
    const rim = new THREE.DirectionalLight(0xff3020, 5.5); rim.position.set(3.4, 2.8, -3.4);
    const fill = new THREE.DirectionalLight(0x8494c4, 0.22); fill.position.set(-1.6, 1.8, 5);
    this.glint = new THREE.PointLight(0xffe2d2, 1.4, 5, 2);
    scene.add(key, rim, fill, this.glint);
    // he stands in the same grass as the field: dark earth that fades out at the edge, and tufts moving in the same wind
    const fade = document.createElement('canvas'); fade.width = fade.height = 128;
    const fc = fade.getContext('2d'), grad = fc.createRadialGradient(64, 64, 6, 64, 64, 64);
    grad.addColorStop(0, '#fff'); grad.addColorStop(0.45, '#fff'); grad.addColorStop(1, '#000');
    fc.fillStyle = grad; fc.fillRect(0, 0, 128, 128);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x0c0706, roughness: 1, metalness: 0, alphaMap: new THREE.CanvasTexture(fade), transparent: true });
    const floor = new THREE.Mesh(new THREE.CircleGeometry(5, 48), floorMat);
    floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true;
    const tuftMat = this.grassMat(), r = seeded(12), tufts = new THREE.InstancedMesh(this.grassGeo, tuftMat, 150);
    tuftMat.color.setScalar(0.2);
    for (let i = 0; i < 150; i++) {
      const x = (r() - 0.5) * 9, z = 0.7 - r() * 4.8, front = z > -0.2, s = front ? 0.11 + r() * 0.06 : 0.2 + r() * 0.13;
      if (Math.hypot(x, z) < 0.6) { this.dummy.scale.setScalar(0); this.dummy.updateMatrix(); tufts.setMatrixAt(i, this.dummy.matrix); continue; }
      this.dummy.position.set(x, -0.03, z); this.dummy.rotation.set(0, 0, 0); this.dummy.scale.set(s * 1.4, s, s * 1.4);
      this.dummy.updateMatrix(); tufts.setMatrixAt(i, this.dummy.matrix);
    }
    tufts.frustumCulled = false;
    scene.add(floor, tufts);
    this.heroFloor = [floorMat, tuftMat];
    this.heroCam = new THREE.PerspectiveCamera(26, 1, 0.1, 60);
    this.hero = { model: null, mats: [floorMat, tuftMat], alpha: 1, draw: 0, idle: 0, slash: 0, sheathe: 0, struck: false };
  }

  // His katana planted in the earth and his helmet set down beside it.
  dressGrave() {
    if (!this.rest || !this.kabuto || !this.hero.model || this.dressed) return;
    this.dressed = true;
    const src = this.hero.model.getObjectByName('KatanaHand'), blade = src.clone();
    src.getWorldScale(blade.scale); blade.scale.multiplyScalar(1.25); blade.visible = true;
    blade.traverse((o) => { if (o.isMesh) { o.material = o.material.clone(); o.material.opacity = 1; o.material.transparent = false; } });
    blade.position.set(1.0, this.restGround(1.0, 1.5) + 0.85, 1.5); blade.rotation.set(-Math.PI / 2 + 0.1, 0, 0.14);
    this.kabuto.position.set(-0.85, this.restGround(-0.85, 1.45) + 0.16, 1.45); this.kabuto.rotation.set(-0.1, 0.35, 0.04); this.kabuto.scale.setScalar(1.6);
    this.rest.add(blade, this.kabuto);
  }

  loadGuardian() {
    this.loader.load('/models/guardian.glb', (gltf) => {
      if (this.disposed) return;
      const model = gltf.scene, h = this.hero;
      model.traverse((o) => {
        if (!o.isMesh) return;
        o.castShadow = o.receiveShadow = true; o.frustumCulled = false;
        (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => { if (!h.mats.includes(m)) h.mats.push(m); });
      });
      h.mixer = new THREE.AnimationMixer(model);
      h.act = {};
      for (const clip of gltf.animations) { const a = h.mixer.clipAction(clip); a.play(); a.setEffectiveWeight(0); h.act[clip.name] = a; }
      h.w = { Stand: 1, Draw: 0, Idle: 0, Slash: 0, Sheathe: 0 };
      h.inHand = model.getObjectByName('KatanaHand'); h.atHip = model.getObjectByName('KatanaSheathed');
      h.model = model;
      this.heroScene.add(model);
      this.dressGrave();
    });
  }

  buildComposer() {
    this.loadGuardian();
    const target = new THREE.WebGLRenderTarget(4, 4, { type: THREE.HalfFloatType, samples: this.small ? 0 : 4 });
    const composer = (this.composer = new EffectComposer(this.renderer, target));
    composer.addPass(new RenderPass(this.scene, this.camera));
    this.heroPass = new RenderPass(this.heroScene, this.heroCam);
    this.heroPass.clear = false; this.heroPass.clearDepth = true;
    composer.addPass(this.heroPass);
    this.bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.45, 0.6, 0.85);
    composer.addPass(this.bloom);
    composer.addPass(new OutputPass());
  }

  // Pose the camera exactly as it sits at the gate, then hang the moon where the guardian will stand in frame.
  placeMoon(w) {
    const s = STOPS[0], cam = this.camera;
    cam.position.set(s.p[0], Math.max(heightAt(s.p[0], s.p[1]), 0) + s.alt, s.p[1]);
    cam.lookAt(s.l[0], heightAt(s.l[0], s.l[1]) + 3, s.l[1]);
    cam.updateMatrixWorld(true);
    const wide = w > 900;
    const dir = this.tmp.set(wide ? 0.47 : 0, wide ? 0.3 : 0.5, 0.5).unproject(cam).sub(cam.position).normalize();
    this.moon.position.copy(cam.position).addScaledVector(dir, 900);
    this.moon.scale.setScalar(wide ? 210 : 120);
    this.moon.rotation.set(0.4, 2.1, 0);
    this.corona.position.copy(this.moon.position);
    this.corona.scale.setScalar(this.moon.scale.x * 4.6);
    this.moonLight.position.copy(dir).multiplyScalar(300);
  }

  resize() {
    const w = innerWidth, h = innerHeight;
    this.renderer.setPixelRatio(Math.min(devicePixelRatio || 1, this.small ? 1.25 : 1.5));
    this.renderer.setSize(w, h, false);
    this.composer.setPixelRatio(this.renderer.getPixelRatio());
    this.composer.setSize(w, h);
    this.camera.aspect = w / h;
    this.camera.fov = w < h ? 64 : 50;
    if (w > 900) this.camera.setViewOffset(w, h, -w * 0.13, 0, w, h); else this.camera.clearViewOffset();
    this.camera.updateProjectionMatrix();
    this.placeMoon(w);
    this.heroCam.aspect = w / h;
    if (w > 900) this.heroCam.setViewOffset(w, h, -w * 0.235, -h * 0.02, w, h); else this.heroCam.setViewOffset(w, h, 0, h * 0.2, w, h);
    this.heroCam.updateProjectionMatrix();
    this.skyMat.uniforms.uAspect.value = w / h;
    const scale = this.renderer.domElement.height / (2 * Math.tan((this.camera.fov * Math.PI) / 360));
    this.petalMat.uniforms.uScale.value = scale;
    this.emberScale.value = scale;
    this.first = true;
  }

  progress() {
    const mid = innerHeight * 0.5;
    let p = 0;
    this.sections.forEach((s, i) => {
      const r = s.getBoundingClientRect();
      if (r.top <= mid) p = i + Math.min(Math.max((mid - r.top) / Math.max(r.height, 1), 0), 1) - 0.5;
    });
    return Math.min(Math.max(p, 0), STOPS.length - 1);
  }

  // The whole opening is one take driven by the scroll: he stands with a hand on the hilt, draws as you start to move,
  // settles into his guard, and strikes. The strike itself always plays at full speed, and the page splits on its impact.
  // He returns once, before the last act, to put the sword away.
  updateGuardian(t, dt, p) {
    const h = this.hero, hp = store.hero.p, q = store.hero.q;
    const ending = smooth(clamp((p - 4.34) / 0.06)) * (1 - smooth(clamp((p - 4.66) / 0.08)));
    const alpha = p < 2 ? 1 - smooth(clamp(q * 1.5)) : ending;
    this.heroPass.enabled = !!h.model && alpha > 0.01;
    if (!this.heroPass.enabled) return;
    const ease = (rate) => (this.reduced ? 1 : 1 - Math.exp(-dt * rate));
    let want = 'Draw', hand = false;
    if (p >= 2) {
      want = p > 4.585 ? 'Stand' : 'Sheathe';                                // sword home, he straightens up
      h.sheathe += (clamp((p - 4.4) / 0.17) * h.act.Sheathe.getClip().duration - h.sheathe) * ease(5);
      hand = h.sheathe < HOME; h.struck = false; h.slash = 0;
    } else {
      h.draw += (clamp((hp - 0.06) / 0.26) * h.act.Draw.getClip().duration - h.draw) * ease(7);
      const strike = hp > 0.4;
      if (strike && !h.striking && !h.struck) { h.striking = true; h.slash = 0.42; }
      if (!strike && hp < 0.34) { h.striking = false; h.slash = 0; if (h.struck) { h.struck = false; store.hero.onCut?.(false); } }
      if (h.striking || h.struck) {
        want = 'Slash';
        h.slash = Math.min(h.slash + dt * 1.25, h.act.Slash.getClip().duration - 0.02);
        if (!h.struck && h.slash > 1.05) { h.struck = true; h.striking = false; store.hero.onCut?.(true); }
      } else if (hp > 0.33) want = 'Idle';
      else if (hp < 0.045) want = 'Stand';                                  // at rest he simply stands, a hand near the hilt
      hand = want === 'Idle' || want === 'Slash' || (want === 'Draw' && h.draw > GRAB);
    }
    h.idle = (h.idle + dt) % h.act.Idle.getClip().duration;
    const times = { Stand: 0, Draw: h.draw, Idle: h.idle, Slash: h.slash, Sheathe: h.sheathe };
    let total = 0;
    for (const k in h.w) { h.w[k] += ((k === want ? 1 : 0) - h.w[k]) * ease(k === 'Slash' || want === 'Slash' ? 16 : 5); total += h.w[k]; }
    for (const k in h.w) { h.act[k].time = times[k]; h.act[k].setEffectiveWeight(h.w[k] / total); }
    h.mixer.update(0);
    h.inHand.visible = hand; h.atHip.visible = !hand;
    if (alpha !== h.alpha) { h.alpha = alpha; h.mats.forEach((m) => { m.transparent = m.alphaMap ? true : alpha < 0.999; m.opacity = alpha; }); }
    h.model.rotation.y = -0.22 + (this.reduced ? 0 : Math.sin(t * 0.7) * 0.02) + store.pointer.x * 0.08;
    this.glint.position.set(Math.sin(t * 0.55) * 2.2 - 0.4, 2.2 + Math.cos(t * 0.4) * 0.5, 1.6);   // a slow travelling highlight on the steel
    const wide = innerWidth > 900;
    this.heroCam.position.set(0, 1.08, (wide ? 6.3 : 10.2) - (p < 2 ? q * 2.2 : 0));
    this.heroCam.lookAt(0, 1.08, 0);
  }

  loop() {
    if (this.disposed || document.hidden) return;
    this.raf = requestAnimationFrame(this.loop);
    const dt = Math.min(this.clock.getDelta(), 0.05);
    const t = this.clock.elapsedTime;
    this.time.uTime.value = this.reduced ? 0 : t;

    const p = this.progress();
    const i = Math.min(Math.floor(p), STOPS.length - 2);
    const f = smooth(clamp((p - i - 0.16) / 0.28));   // hold through the act, travel only in the gap between acts
    const a = STOPS[i], b = STOPS[i + 1];
    let px = mix(a.p[0], b.p[0], f), pz = mix(a.p[1], b.p[1], f), alt = mix(a.alt, b.alt, f), ly = mix(a.ly ?? 3, b.ly ?? 3, f);
    let lx = mix(a.l[0], b.l[0], f), lz = mix(a.l[1], b.l[1], f);
    const fw = store.focus && WAYPOINTS[store.focus];
    if (fw && p > 1.55 && p < 2.42) { lx = fw[0]; lz = fw[1]; px = fw[0] + 2.5; pz = fw[1] + 10.5; alt = 3.6; ly = 3.2; }   // walk up to the stone whose file is open
    lx += store.pointer.x * 1.2;

    const k = this.first || this.reduced ? 1 : 1 - Math.exp(-dt * 1.7);
    this.first = false;
    this.cam.pos.lerp(this.tmp.set(px, Math.max(heightAt(px, pz), 0) + alt, pz), k);
    this.cam.look.lerp(this.tmp.set(lx, heightAt(lx, lz) + ly, lz), k);
    this.scene.fog.density = mix(this.scene.fog.density, mix(a.fog, b.fog, f), k);
    this.camera.position.copy(this.cam.pos).setY(this.cam.pos.y + (this.reduced ? 0 : Math.sin(t * 0.45) * 0.08));
    this.camera.lookAt(this.cam.look);

    const dx = this.cam.look.x - this.cam.pos.x, dz = this.cam.look.z - this.cam.pos.z;
    store.heading = ((Math.atan2(dx, -dz) * 180) / Math.PI + 360) % 360;
    store.coords.x = this.cam.pos.x; store.coords.y = -this.cam.pos.z; store.coords.alt = this.cam.pos.y;
    store.region = Math.round(p);

    this.corona.quaternion.copy(this.camera.quaternion);
    this.petalMat.uniforms.uCam.value.copy(this.camera.position);
    this.lanterns.forEach((l, n) => { l.intensity = (n < 2 ? 8 : 6) * (0.82 + 0.12 * Math.sin(t * 9 + n * 2.1) + 0.06 * Math.sin(t * 23 + n)); });

    if (this.blossoms && p > 4.2) for (const b of this.blossoms) {
      const fall = ((t * 0.32 + b.ph) % 3) - 1.5;
      this.tmp.set(Math.sin(t * 0.7 + b.ph) * 0.35 - fall * 0.25, -fall, Math.cos(t * 0.5 + b.ph * 2) * 0.3).applyQuaternion(b.q).divideScalar(b.sc);
      b.o.position.copy(b.base).add(this.tmp);
      b.o.rotation.x = t * 0.9 + b.ph; b.o.rotation.z = t * 0.6 + b.ph;
    }

    const labels = [];
    for (const m of this.markers) {
      m.boost.value = mix(m.boost.value, store.focus === m.id ? 1 : 0, 0.1);
      this.tmp.copy(m.group.position).setY(m.group.position.y + m.top);
      const dist = this.tmp.distanceTo(this.camera.position);
      this.tmp.project(this.camera);
      labels.push({ id: m.id, x: (this.tmp.x * 0.5 + 0.5) * innerWidth, y: (-this.tmp.y * 0.5 + 0.5) * innerHeight, visible: this.tmp.z < 1 && Math.abs(this.tmp.x) < 1 && Math.abs(this.tmp.y) < 1 && dist < 1.6 / this.scene.fog.density });
    }
    store.labels = labels;
    store.ready = true;

    this.updateGuardian(t, dt, p);
    this.composer.render(dt);
  }

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('pointermove', this.onPointer);
    document.removeEventListener('visibilitychange', this.onVis);
    for (const s of [this.scene, this.heroScene]) s.traverse((o) => { o.geometry?.dispose(); (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m?.dispose?.()); });
    Object.values(this.maps).forEach((m) => m.dispose());
    this.envMap.dispose(); this.composer.dispose(); this.renderer.dispose();
  }
}
