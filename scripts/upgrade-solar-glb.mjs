// FeelEd XR Lab — V1.1 S2 Commit 2 (Track A)
// One-off asset tool: injects into public/models/solar-system.glb
//   1. Asteroid belt  — ~350 small rocks, single merged mesh (Mars–Jupiter ring)
//   2. Earth's moon   — small grey sphere near Earth
//   3. Pluto          — small brown dwarf-planet sphere beyond Neptune
//
// SAFE: writes to a NEW file (solar-system-v2.glb). Original untouched.
// Idempotent: aborts if FeelEd_* nodes already exist in the input.
//
// Setup (one time):   npm i -D @gltf-transform/core
// Run from repo root: node scripts/upgrade-solar-glb.mjs
//
// Ring/position calibration is derived from xrTopics.ts hotspot coordinates:
//   Earth ≈ r6.0 · Mars ≈ r7.4 · Jupiter ≈ r9.6 · Neptune ≈ r16.6
// Tweak the CONFIG block below after phone verification if sizes look off.

import { NodeIO } from '@gltf-transform/core';
import path from 'node:path';

// ───────────────────────── CONFIG ─────────────────────────
const INPUT  = 'public/models/solar-system.glb';
const OUTPUT = 'public/models/solar-system-v2.glb';

const BELT = {
  count: 350,
  innerRadius: 8.0,   // just outside Mars (~7.4)
  outerRadius: 9.2,   // just inside Jupiter (~9.6)
  y: 0.9,             // planet plane (labels sit ~0.7–1.5)
  ySpread: 0.35,      // vertical scatter
  rockMin: 0.03,
  rockMax: 0.08,
  color: [0.45, 0.42, 0.38, 1.0], // dusty grey-brown
};

const MOON = {
  // Earth hotspot: (1.55, 0.87, -5.80) → offset outward
  position: [2.05, 1.05, -6.15],
  radius: 0.12,
  color: [0.75, 0.75, 0.78, 1.0], // pale grey
};

const PLUTO = {
  // Beyond Neptune (~16.6), different bearing + slight tilt off the plane
  position: [12.8, 1.6, 12.8],   // r ≈ 18.1
  radius: 0.14,
  color: [0.72, 0.58, 0.45, 1.0], // icy brown
};
// ──────────────────────────────────────────────────────────

// UV-sphere geometry generator (positions, normals, indices)
function sphereGeometry(radius, widthSeg = 12, heightSeg = 8) {
  const positions = [];
  const normals = [];
  const indices = [];
  for (let iy = 0; iy <= heightSeg; iy++) {
    const v = iy / heightSeg;
    const phi = v * Math.PI;
    for (let ix = 0; ix <= widthSeg; ix++) {
      const u = ix / widthSeg;
      const theta = u * Math.PI * 2;
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
      const a = iy * row + ix;
      const b = a + row;
      indices.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }
  return { positions, normals, indices };
}

function makeAccessors(doc, buffer, positions, normals, indices) {
  const pos = doc.createAccessor().setType('VEC3')
    .setArray(new Float32Array(positions)).setBuffer(buffer);
  const nrm = doc.createAccessor().setType('VEC3')
    .setArray(new Float32Array(normals)).setBuffer(buffer);
  const idx = doc.createAccessor().setType('SCALAR')
    .setArray(new Uint32Array(indices)).setBuffer(buffer);
  return { pos, nrm, idx };
}

function makeMaterial(doc, name, rgba, roughness = 0.9) {
  return doc.createMaterial(name)
    .setBaseColorFactor(rgba)
    .setMetallicFactor(0.0)
    .setRoughnessFactor(roughness);
}

async function main() {
  const io = new NodeIO();
  const doc = await io.read(INPUT);
  const root = doc.getRoot();
  const scene = root.getDefaultScene() ?? root.listScenes()[0];
  if (!scene) throw new Error('No scene found in GLB.');

  // Idempotency guard
  for (const n of root.listNodes()) {
    if ((n.getName() || '').startsWith('FeelEd_')) {
      console.log('✅ FeelEd_* nodes already present — input is already upgraded. Nothing to do.');
      return;
    }
  }

  const buffer = root.listBuffers()[0] ?? doc.createBuffer();

  // ── 1. Asteroid belt — one merged primitive (phone-GPU friendly: 1 draw call) ──
  {
    const positions = [];
    const normals = [];
    const indices = [];
    const rock = sphereGeometry(1, 6, 4); // low-poly unit sphere, scaled per rock
    let vertOffset = 0;

    // Deterministic PRNG so re-runs produce the same belt
    let seed = 20260705;
    const rand = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    };

    for (let i = 0; i < BELT.count; i++) {
      const angle = rand() * Math.PI * 2;
      const r = BELT.innerRadius + rand() * (BELT.outerRadius - BELT.innerRadius);
      const cx = Math.cos(angle) * r;
      const cz = Math.sin(angle) * r;
      const cy = BELT.y + (rand() - 0.5) * 2 * BELT.ySpread;
      const s = BELT.rockMin + rand() * (BELT.rockMax - BELT.rockMin);

      for (let v = 0; v < rock.positions.length; v += 3) {
        positions.push(
          rock.positions[v] * s + cx,
          rock.positions[v + 1] * s + cy,
          rock.positions[v + 2] * s + cz
        );
        normals.push(rock.normals[v], rock.normals[v + 1], rock.normals[v + 2]);
      }
      for (const idx of rock.indices) indices.push(idx + vertOffset);
      vertOffset += rock.positions.length / 3;
    }

    const { pos, nrm, idx } = makeAccessors(doc, buffer, positions, normals, indices);
    const mat = makeMaterial(doc, 'FeelEd_AsteroidMat', BELT.color, 0.95);
    const prim = doc.createPrimitive()
      .setAttribute('POSITION', pos)
      .setAttribute('NORMAL', nrm)
      .setIndices(idx)
      .setMaterial(mat);
    const mesh = doc.createMesh('FeelEd_AsteroidBeltMesh').addPrimitive(prim);
    const node = doc.createNode('FeelEd_AsteroidBelt').setMesh(mesh);
    scene.addChild(node);
    console.log(`🪨 Asteroid belt: ${BELT.count} rocks, ${vertOffset} verts, 1 draw call`);
  }

  // ── 2 & 3. Moon + Pluto — simple spheres ──
  const bodies = [
    { name: 'FeelEd_Moon',  cfg: MOON,  segs: [16, 12] },
    { name: 'FeelEd_Pluto', cfg: PLUTO, segs: [16, 12] },
  ];
  for (const { name, cfg, segs } of bodies) {
    const g = sphereGeometry(cfg.radius, segs[0], segs[1]);
    const { pos, nrm, idx } = makeAccessors(doc, buffer, g.positions, g.normals, g.indices);
    const mat = makeMaterial(doc, name + 'Mat', cfg.color, 0.85);
    const prim = doc.createPrimitive()
      .setAttribute('POSITION', pos)
      .setAttribute('NORMAL', nrm)
      .setIndices(idx)
      .setMaterial(mat);
    const mesh = doc.createMesh(name + 'Mesh').addPrimitive(prim);
    const node = doc.createNode(name).setMesh(mesh).setTranslation(cfg.position);
    scene.addChild(node);
    console.log(`🌑 ${name} at [${cfg.position.join(', ')}] r=${cfg.radius}`);
  }

  await io.write(OUTPUT, doc);
  console.log(`\n✅ Written: ${OUTPUT}`);
  console.log('   Verify on phone first, then swap:');
  console.log('   - Option 1: update glbUrl in xrTopics.ts to /models/solar-system-v2.glb');
  console.log('   - Option 2: replace the original file after verification');
}

main().catch((e) => {
  console.error('❌ ' + e.message);
  process.exit(1);
});
