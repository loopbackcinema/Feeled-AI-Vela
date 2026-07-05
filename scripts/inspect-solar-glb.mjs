// FeelEd XR Lab — GLB inspector
// Lists every node (name, translation, mesh, children) + animations
// so we can parent moons to the real planet nodes.
//
// Run from repo root:  node scripts/inspect-solar-glb.mjs

import { NodeIO } from '@gltf-transform/core';

const INPUT = 'public/models/solar-system.glb'; // ORIGINAL (not v2)

const io = new NodeIO();
const doc = await io.read(INPUT);
const root = doc.getRoot();

console.log('═══ SCENES ═══');
for (const scene of root.listScenes()) {
  console.log('Scene:', scene.getName() || '(unnamed)');
}

console.log('\n═══ NODE TREE ═══');
function walk(node, depth) {
  const t = node.getTranslation();
  const s = node.getScale();
  const mesh = node.getMesh();
  const r = Math.sqrt(t[0] * t[0] + t[2] * t[2]).toFixed(2);
  console.log(
    '  '.repeat(depth) +
    `• ${node.getName() || '(unnamed)'}` +
    ` | pos [${t.map(v => v.toFixed(2)).join(', ')}] r=${r}` +
    ` | scale [${s.map(v => v.toFixed(2)).join(', ')}]` +
    (mesh ? ` | mesh: ${mesh.getName() || 'yes'}` : '')
  );
  for (const child of node.listChildren()) walk(child, depth + 1);
}
const scene = root.getDefaultScene() ?? root.listScenes()[0];
for (const child of scene.listChildren()) walk(child, 0);

console.log('\n═══ ANIMATIONS ═══');
const anims = root.listAnimations();
if (!anims.length) {
  console.log('(none — planets are static, fixed moon positions OK)');
} else {
  for (const anim of anims) {
    console.log(`Animation: ${anim.getName() || '(unnamed)'}`);
    for (const ch of anim.listChannels()) {
      const target = ch.getTargetNode();
      console.log(`  → targets node "${target?.getName() || '?'}" path: ${ch.getTargetPath()}`);
    }
  }
}
