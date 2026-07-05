// FeelEd XR Lab — V1.1 S2, upgrade script v3
// v2 + planet self-rotation (axial spin):
//   • Re-centers each planet mesh (vertices → local origin, node translation = centroid)
//     so node rotation spins the planet about ITS OWN axis, not around the Sun.
//   • One merged animation "FeelEd_Spin" (model-viewer plays a single animation):
//       - All planets spin prograde… except வெள்ளி (Venus): RETROGRADE + slowest
//         (scientifically: 243-day rotation, Sun rises in the west)
//       - யுரேனஸ் (Uranus): spin axis tilted ~98° (rolls on its side)
//       - Relative speeds correct: Jupiter fastest, Venus slowest
//   • Moons (Earth 1, Mars 2, Jupiter 4, Saturn 1, Uranus 1, Neptune 1) + Pluto
//
// Requires in XRLessonPage.tsx: `autoplay` attribute on <model-viewer>.
//
// SAFE: reads ORIGINAL solar-system.glb, overwrites solar-system-v2.glb.
// Run from repo root:  node scripts/upgrade-solar-glb.mjs

import { NodeIO } from '@gltf-transform/core';

// ───────────────────────── CONFIG ─────────────────────────
const INPUT  = 'public/models/solar-system.glb';
const OUTPUT = 'public/models/solar-system-v2.glb';

const INCLUDE_PLUTO = true;
const SPIN_DURATION = 60; // seconds per animation loop

// turns per loop (negative = retrograde) · tiltDeg = spin-axis tilt
// Relative speeds ≈ real ranking: Jupiter fastest, Venus slowest & backward.
const SPINS = {
  sun:     { turns: 1,  tiltDeg: 0 },
  mercury: { turns: 2,  tiltDeg: 0 },
  venus:   { turns: -1, tiltDeg: 0 },   // RETROGRADE — students will spot this 🙂
  earth:   { turns: 5,  tiltDeg: 23.5 },
  mars:    { turns: 5,  tiltDeg: 25 },
  jupiter: { turns: 10, tiltDeg: 3 },
  saturn:  { turns: 9,  tiltDeg: 0 },   // tilt 0: ring is a separate static mesh; tilting body would misalign
  uranus:  { turns: 7,  tiltDeg: 98 },  // rolls on its side
  neptune: { turns: 7,  tiltDeg: 28 },
};
// 'saturn-ring' intentionally NOT spun (tilted ring wobbles if rotated about Y).

const MOONS = {
  earth:   [{ name: 'Moon',     distF: 2.4, sizeF: 0.27, angle: 40,  color: [0.78, 0.78, 0.80, 1] }],
  mars:    [{ name: 'Phobos',   distF: 2.0, sizeF: 0.14, angle: 10,  color: [0.55, 0.48, 0.42, 1] },
            { name: 'Deimos',   distF: 2.8, sizeF: 0.11, angle: 200, color: [0.60, 0.53, 0.46, 1] }],
  jupiter: [{ name: 'Io',       distF: 1.7, sizeF: 0.10, angle: 0,   color: [0.85, 0.75, 0.40, 1] },
            { name: 'Europa',   distF: 2.0, sizeF: 0.09, angle: 90,  color: [0.80, 0.78, 0.72, 1] },
            { name: 'Ganymede', distF: 2.3, sizeF: 0.12, angle: 180, color: [0.62, 0.58, 0.52, 1] },
            { name: 'Callisto', distF: 2.6, sizeF: 0.11, angle: 270, color: [0.48, 0.44, 0.40, 1] }],
  saturn:  [{ name: 'Titan',    distF: 2.6, sizeF: 0.12, angle: 130, color: [0.82, 0.68, 0.42, 1] }],
  uranus:  [{ name: 'Titania',  distF: 2.2, sizeF: 0.14, angle: 60,  color: [0.70, 0.72, 0.75, 1] }],
  neptune: [{ name: 'Triton',   distF: 2.2, sizeF: 0.15, angle: 300, color: [0.72, 0.76, 0.80, 1] }],
};

const PLUTO_CFG = { orbitFactor: 1.10, angleDeg: 135, sizeVsEarthMoon: 0.85, color: [0.72, 0.58, 0.45, 1] };
// ──────────────────────────────────────────────────────────

function sphereGeometry(radius, widthSeg = 14, heightSeg = 10) {
  const positions = [], normals = [], indices = [];
  for (let iy = 0; iy <= heightSeg; iy++) {
    const phi = (iy / heightSeg) * Math.PI;
    for (let ix = 0; ix <= widthSeg; ix++) {
      const theta = (ix / widthSeg) * Math.PI * 2;
      const nx = Math.sin(phi) * Math.cos(theta);
      const ny = Math.cos(phi);
      const nz = Math.sin(phi) * Math.sin(theta);
      positions.push(nx * radius, ny * radius, nz * radius);
      normals.push(nx, ny, nz);
    }
  }
  const row = widthSeg + 1;
  for (let iy = 0; iy < heightSeg; iy++) {
    for (let ix = 0; ix < widthSeg; ix++) {
      const a = iy * row + ix, b = a + row;
      indices.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }
  return { positions, normals, indices };
}

function meshBounds(mesh) {
  let min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
  for (const prim of mesh.listPrimitives()) {
    const acc = prim.getAttribute('POSITION');
    if (!acc) continue;
    const arr = acc.getArray();
    for (let i = 0; i < arr.length; i += 3) {
      for (let k = 0; k < 3; k++) {
        if (arr[i + k] < min[k]) min[k] = arr[i + k];
        if (arr[i + k] > max[k]) max[k] = arr[i + k];
      }
    }
  }
  const center = [(min[0] + max[0]) / 2, (min[1] + max[1]) / 2, (min[2] + max[2]) / 2];
  const radius = Math.max(max[0] - min[0], max[1] - min[1], max[2] - min[2]) / 2;
  return { center, radius };
}

// Subtract centroid from every POSITION vertex; return new centered accessor arrays applied in place.
function recenterMesh(mesh, center) {
  const seen = new Set();
  for (const prim of mesh.listPrimitives()) {
    const acc = prim.getAttribute('POSITION');
    if (!acc || seen.has(acc)) continue;
    seen.add(acc);
    const arr = acc.getArray().slice(); // copy
    for (let i = 0; i < arr.length; i += 3) {
      arr[i] -= center[0];
      arr[i + 1] -= center[1];
      arr[i + 2] -= center[2];
    }
    acc.setArray(arr);
  }
}

// Quaternion helpers
const quatAxisAngle = (ax, ay, az, angle) => {
  const s = Math.sin(angle / 2);
  return [ax * s, ay * s, az * s, Math.cos(angle / 2)];
};
const quatMul = (a, b) => [
  a[3] * b[0] + a[0] * b[3] + a[1] * b[2] - a[2] * b[1],
  a[3] * b[1] - a[0] * b[2] + a[1] * b[3] + a[2] * b[0],
  a[3] * b[2] + a[0] * b[1] - a[1] * b[0] + a[2] * b[3],
  a[3] * b[3] - a[0] * b[0] - a[1] * b[1] - a[2] * b[2],
];

function addSphereNode(doc, buffer, scene, name, center, radius, rgba) {
  const g = sphereGeometry(radius);
  const pos = doc.createAccessor().setType('VEC3').setArray(new Float32Array(g.positions)).setBuffer(buffer);
  const nrm = doc.createAccessor().setType('VEC3').setArray(new Float32Array(g.normals)).setBuffer(buffer);
  const idx = doc.createAccessor().setType('SCALAR').setArray(new Uint32Array(g.indices)).setBuffer(buffer);
  const mat = doc.createMaterial('FeelEd_' + name + 'Mat')
    .setBaseColorFactor(rgba).setMetallicFactor(0).setRoughnessFactor(0.9);
  const prim = doc.createPrimitive()
    .setAttribute('POSITION', pos).setAttribute('NORMAL', nrm)
    .setIndices(idx).setMaterial(mat);
  const mesh = doc.createMesh('FeelEd_' + name + 'Mesh').addPrimitive(prim);
  const node = doc.createNode('FeelEd_' + name).setMesh(mesh).setTranslation(center);
  scene.addChild(node);
  return node;
}

async function main() {
  const io = new NodeIO();
  const doc = await io.read(INPUT);
  const root = doc.getRoot();
  const scene = root.getDefaultScene() ?? root.listScenes()[0];
  if (!scene) throw new Error('No scene found.');

  for (const n of root.listNodes()) {
    if ((n.getName() || '').startsWith('FeelEd_')) {
      console.log('✅ Input already upgraded — nothing to do.');
      return;
    }
  }

  const buffer = root.listBuffers()[0] ?? doc.createBuffer();

  // Map name → node (planet nodes carry same-named meshes)
  const nodesByName = {};
  for (const n of root.listNodes()) nodesByName[(n.getName() || '').toLowerCase()] = n;

  // Bounds BEFORE recentering (world positions)
  const planets = {};
  for (const name of Object.keys(SPINS).concat(['saturn-ring'])) {
    const node = nodesByName[name];
    const mesh = node?.getMesh();
    if (!mesh) { console.warn(`⚠️ ${name}: node/mesh not found`); continue; }
    planets[name] = { node, mesh, ...meshBounds(mesh) };
    const b = planets[name];
    console.log(`🌍 ${name}: center [${b.center.map(v => v.toFixed(2)).join(', ')}], radius ${b.radius.toFixed(2)}`);
  }
  if (!planets.earth) throw new Error('earth not found.');
  const earthR = planets.earth.radius;
  const moonSizeClamp = (s) => Math.min(Math.max(s, 0.18 * earthR), 0.6 * earthR);

  // ── Re-center spinning bodies so node rotation = axial spin ──
  for (const [name, spin] of Object.entries(SPINS)) {
    const p = planets[name];
    if (!p) continue;
    recenterMesh(p.mesh, p.center);
    p.node.setTranslation(p.center);
  }
  console.log('🔧 Planet meshes re-centered (world positions unchanged)');

  // ── Spin animation (single merged animation for model-viewer) ──
  const anim = doc.createAnimation('FeelEd_Spin');
  for (const [name, spin] of Object.entries(SPINS)) {
    const p = planets[name];
    if (!p || spin.turns === 0) continue;
    const tiltQ = quatAxisAngle(0, 0, 1, (spin.tiltDeg * Math.PI) / 180);
    const steps = Math.max(4 * Math.abs(spin.turns), 4); // quarter-turn keys
    const times = new Float32Array(steps + 1);
    const quats = new Float32Array((steps + 1) * 4);
    for (let i = 0; i <= steps; i++) {
      times[i] = (i / steps) * SPIN_DURATION;
      const angle = (i / steps) * spin.turns * Math.PI * 2;
      const q = quatMul(tiltQ, quatAxisAngle(0, 1, 0, angle));
      quats.set(q, i * 4);
    }
    const input = doc.createAccessor().setType('SCALAR').setArray(times).setBuffer(buffer);
    const output = doc.createAccessor().setType('VEC4').setArray(quats).setBuffer(buffer);
    const sampler = doc.createAnimationSampler().setInput(input).setOutput(output).setInterpolation('LINEAR');
    const channel = doc.createAnimationChannel().setTargetNode(p.node).setTargetPath('rotation').setSampler(sampler);
    anim.addSampler(sampler).addChannel(channel);
    console.log(`🔄 ${name}: ${spin.turns} turn(s)/${SPIN_DURATION}s${spin.tiltDeg ? `, tilt ${spin.tiltDeg}°` : ''}${spin.turns < 0 ? ' (RETROGRADE)' : ''}`);
  }

  // ── Moons (positions from pre-recenter world centroids) ──
  let moonCount = 0;
  for (const [planet, moons] of Object.entries(MOONS)) {
    const p = planets[planet];
    if (!p) continue;
    for (const m of moons) {
      const size = moonSizeClamp(p.radius * m.sizeF * 2);
      const dist = p.radius * m.distF + size;
      const a = (m.angle * Math.PI) / 180;
      addSphereNode(doc, buffer, scene, m.name, [
        p.center[0] + Math.cos(a) * dist,
        p.center[1] + size * 0.4,
        p.center[2] + Math.sin(a) * dist,
      ], size, m.color);
      moonCount++;
    }
  }
  console.log(`🌑 ${moonCount} moons added`);

  // ── Pluto ──
  if (INCLUDE_PLUTO && planets.neptune) {
    const n = planets.neptune;
    const orbitR = Math.sqrt(n.center[0] ** 2 + n.center[2] ** 2) * PLUTO_CFG.orbitFactor;
    const a = (PLUTO_CFG.angleDeg * Math.PI) / 180;
    const size = moonSizeClamp(earthR * 0.27 * 2) * PLUTO_CFG.sizeVsEarthMoon;
    addSphereNode(doc, buffer, scene, 'Pluto',
      [Math.cos(a) * orbitR, n.center[1] + earthR * 0.5, Math.sin(a) * orbitR],
      size, PLUTO_CFG.color);
    console.log(`🟤 Pluto at orbit r=${orbitR.toFixed(2)}`);
  }

  await io.write(OUTPUT, doc);
  console.log(`\n✅ Written: ${OUTPUT}`);
  console.log('   Reminder: <model-viewer> needs the `autoplay` attribute for the spin to play.');
}

main().catch((e) => { console.error('❌ ' + e.message); process.exit(1); });
