// FeelEd XR Lab — V1.1 S2 Commit 1
// Inserts the "model-scope" fact as the FIRST entry of SOLAR_KNOWLEDGE.facts
// so the AI knows exactly what the 3D model shows (and what it doesn't).
// Idempotent: running twice does nothing.
//
// Run from repo root:  node patch-commit1.mjs

import fs from 'node:fs';

const FILE = 'src/data/xrTopics.ts';

// The anchor line — first existing fact (must match exactly)
const ANCHOR =
  "'சூரிய குடும்பத்தில் 8 கோள்கள்: புதன், வெள்ளி, பூமி, செவ்வாய், வியாழன், சனி, யுரேனஸ், நெப்டியூன்.',";

// The new fact to insert BEFORE the anchor
const NEW_FACT =
  "'இந்த 3D மாதிரியில் சூரியன் மற்றும் 8 கோள்கள் மட்டுமே உள்ளன; குள்ளக்கோள்கள் (புளூட்டோ), துணைக்கோள்கள் (நிலா), சிறுகோள் பட்டை மாதிரியில் இல்லை — அவற்றைப் பற்றி விளக்கும்போது \"மாதிரியில் காட்டப்படவில்லை, ஆனால்…\" என்று தெளிவாகக் கூறவும்.',";

let src = fs.readFileSync(FILE, 'utf8');

if (src.includes('இந்த 3D மாதிரியில்')) {
  console.log('✅ Already patched — nothing to do.');
  process.exit(0);
}

const idx = src.indexOf(ANCHOR);
if (idx === -1) {
  console.error('❌ Anchor line not found in ' + FILE + ' — file may have changed. Aborting, no edits made.');
  process.exit(1);
}

// Preserve the indentation of the anchor line
const lineStart = src.lastIndexOf('\n', idx) + 1;
const indent = src.slice(lineStart, idx); // whitespace before anchor

src = src.slice(0, lineStart) + indent + NEW_FACT + '\n' + src.slice(lineStart);

fs.writeFileSync(FILE, src, 'utf8');
console.log('✅ Patched: model-scope fact inserted as facts[0] in ' + FILE);
console.log('   Next: npx tsc --noEmit 2>&1 | grep -c "error TS"   (expect 63)');
