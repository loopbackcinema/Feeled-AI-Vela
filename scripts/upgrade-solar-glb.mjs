// FeelEd XR Lab — V1.1 S2, upgrade script v2
// Planet positions are BAKED into mesh vertices (node transforms are identity),
// so this script computes each planet's centroid + radius from its POSITION
// accessor, then places moons precisely relative to the real geometry.
//
// Adds:
//   • Moons  — Earth 1 (நிலா), Mars 2 (Phobos/Deimos), Jupiter 4 (Galilean),
//              Saturn 1 (Titan), Uranus 1 (Titania), Neptune 1 (Triton)
//   • Pluto  — beyond Neptune's orbit          (INCLUDE_PLUTO)
//   • Belt   — OFF by default per review; if enabled, placed between the
//              REAL Mars/Jupiter orbit radii   (INCLUDE_BELT)
//
// SAFE: reads ORIGINAL solar-system.glb, overwrites solar-system-v2.glb.
//
// Run from repo root:  node scripts/upgrade-solar-glb.mjs
// (replace the old scripts/upgrade-solar-glb.mjs with this file)

import { NodeIO } from '@gltf-transform/core';

// ───────────────────────── CONFIG ─────────────────────────
const INPUT  = 'public/models/solar-system.glb';
const OUTPUT = 'public/models/solar-system-v2.glb';

const INCLUDE_PLUTO = true;
const INCLUDE_BELT  = false;   // user review: skip unless properly placed

// Moons per planet: dist = planetRadius × distFactor, size = clamped fraction
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

const BELT_CFG = { count: 400, rockMinF: 0.06, rockMaxF: 0.16, ySpreadF: 0.5, color: [0.45, 0.42, 0.38, 1] };
// (rock sizes/spread are fractions of Earth's radius)
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

// Centroid + radius of a mesh from its baked vertex positions
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

  // Map planet name → { center, radius } from baked mesh geometry
  const planets = {};
  for (const mesh of root.listMeshes()) {
    const name = (mesh.getName() || '').toLowerCase();
    if (name in MOONS || name === 'mercury' || name === 'venus') {
      planets[name] = meshBounds(mesh);
      const b = planets[name];
      console.log(`🌍 ${name}: center [${b.center.map(v => v.toFixed(2)).join(', ')}], radius ${b.radius.toFixed(2)}`);
    }
  }
  if (!planets.earth) throw new Error('earth mesh not found — check mesh names.');
  const earthR = planets.earth.radius;
  const moonSizeClamp = (s) => Math.min(Math.max(s, 0.18 * earthR), 0.6 * earthR);

  // ── Moons ──
  let moonCount = 0;
  for (const [planet, moons] of Object.entries(MOONS)) {
    const p = planets[planet];
    if (!p) { console.warn(`⚠️ ${planet} mesh not found — skipping its moons.`); continue; }
    for (const m of moons) {
      const size = moonSizeClamp(p.radius * m.sizeF * 2); // ×2: visibility over realism
      const dist = p.radius * m.distF + size;
      const a = (m.angle * Math.PI) / 180;
      const center = [
        p.center[0] + Math.cos(a) * dist,
        p.center[1] + size * 0.4,          // slight lift so labels/planet don't occlude
        p.center[2] + Math.sin(a) * dist,
      ];
      addSphereNode(doc, buffer, scene, m.name, center, size, m.color);
      moonCount++;
    }
  }
  console.log(`🌑 ${moonCount} moons added`);

  // ── Pluto ──
  if (INCLUDE_PLUTO) {
    const n = planets.neptune;
    if (n) {
      const orbitR = Math.sqrt(n.center[0] ** 2 + n.center[2] ** 2) * PLUTO_CFG.orbitFactor;
      const a = (PLUTO_CFG.angleDeg * Math.PI) / 180;
      const size = moonSizeClamp(earthR * 0.27 * 2) * PLUTO_CFG.sizeVsEarthMoon;
      addSphereNode(doc, buffer, scene, 'Pluto',
        [Math.cos(a) * orbitR, n.center[1] + earthR * 0.5, Math.sin(a) * orbitR],
        size, PLUTO_CFG.color);
      console.log(`🟤 Pluto at orbit r=${orbitR.toFixed(2)}`);
    }
  }

  // ── Belt (optional, real orbit radii) ──
  if (INCLUDE_BELT && planets.mars && planets.jupiter) {
    const rMars = Math.sqrt(planets.mars.center[0] ** 2 + planets.mars.center[2] ** 2);
    const rJup  = Math.sqrt(planets.jupiter.center[0] ** 2 + planets.jupiter.center[2] ** 2);
    const inner = rMars + (rJup - rMars) * 0.30;
    const outer = rMars + (rJup - rMars) * 0.70;
    const yBase = (planets.mars.center[1] + planets.jupiter.center[1]) / 2;

    const positions = [], normals = [], indices = [];
    const rock = sphereGeometry(1, 6, 4);
    let vertOffset = 0;
    let seed = 20260705;
    const rand = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };

    for (let i = 0; i < BELT_CFG.count; i++) {
      const angle = rand() * Math.PI * 2;
      const r = inner + rand() * (outer - inner);
      const s = (BELT_CFG.rockMinF + rand() * (BELT_CFG.rockMaxF - BELT_CFG.rockMinF)) * earthR;
      const cx = Math.cos(angle) * r, cz = Math.sin(angle) * r;
      const cy = yBase + (rand() - 0.5) * 2 * BELT_CFG.ySpreadF * earthR;
      for (let v = 0; v < rock.positions.length; v += 3) {
        positions.push(rock.positions[v] * s + cx, rock.positions[v + 1] * s + cy, rock.positions[v + 2] * s + cz);
        normals.push(rock.normals[v], rock.normals[v + 1], rock.normals[v + 2]);
      }
      for (const ix of rock.indices) indices.push(ix + vertOffset);
      vertOffset += rock.positions.length / 3;
    }
    const pos = doc.createAccessor().setType('VEC3').setArray(new Float32Array(positions)).setBuffer(buffer);
    const nrm = doc.createAccessor().setType('VEC3').setArray(new Float32Array(normals)).setBuffer(buffer);
    const idx = doc.createAccessor().setType('SCALAR').setArray(new Uint32Array(indices)).setBuffer(buffer);
    const mat = doc.createMaterial('FeelEd_AsteroidMat')
      .setBaseColorFactor(BELT_CFG.color).setMetallicFactor(0).setRoughnessFactor(0.95);
    const prim = doc.createPrimitive()
      .setAttribute('POSITION', pos).setAttribute('NORMAL', nrm).setIndices(idx).setMaterial(mat);
    const mesh = doc.createMesh('FeelEd_AsteroidBeltMesh').addPrimitive(prim);
    scene.addChild(doc.createNode('FeelEd_AsteroidBelt').setMesh(mesh));
    console.log(`🪨 Belt: ${BELT_CFG.count} rocks between r=${inner.toFixed(2)} and r=${outer.toFixed(2)}`);
  } else if (INCLUDE_BELT) {
    console.warn('⚠️ Belt skipped — mars/jupiter mesh not found.');
  }

  await io.write(OUTPUT, doc);
  console.log(`\n✅ Written: ${OUTPUT}`);
  console.log('   Local verify → phone verify → then switch glbUrl in xrTopics.ts.');
}

main().catch((e) => { console.error('❌ ' + e.message); process.exit(1); });
