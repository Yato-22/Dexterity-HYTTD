import fs from 'fs';
import path from 'path';
import admin from 'firebase-admin';

// Load .env.local if not already in process.env
function loadEnvLocal() {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        let val = trimmed.slice(eqIdx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

loadEnvLocal();

// Initialize Firebase Admin
function initFirebase() {
  if (admin.apps.length > 0) return admin.firestore();

  const saRaw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!saRaw) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT environment variable is missing.');
  }

  let credObj;
  try {
    if (saRaw.trim().startsWith('{')) {
      credObj = JSON.parse(saRaw);
    } else {
      const decoded = Buffer.from(saRaw, 'base64').toString('utf8');
      if (decoded.trim().startsWith('{')) {
        credObj = JSON.parse(decoded);
      } else {
        credObj = JSON.parse(fs.readFileSync(saRaw, 'utf8'));
      }
    }
  } catch (err) {
    throw new Error('Failed to parse FIREBASE_SERVICE_ACCOUNT: ' + err.message);
  }

  admin.initializeApp({
    credential: admin.credential.cert(credObj),
  });

  return admin.firestore();
}

async function seed() {
  console.log('--- TechFlix Dragon Battle Seeder ---');
  const db = initFirebase();

  // 1. Seed hidden tests into problems_private
  const hiddenJsonPath = path.resolve(process.cwd(), 'scripts/hidden_tests.json');
  if (!fs.existsSync(hiddenJsonPath)) {
    throw new Error('scripts/hidden_tests.json not found!');
  }
  const privateProblems = JSON.parse(fs.readFileSync(hiddenJsonPath, 'utf8'));

  console.log(`Seeding hidden test cases for ${Object.keys(privateProblems).length} problems...`);
  const batch = db.batch();
  for (const [problemId, data] of Object.entries(privateProblems)) {
    const docRef = db.collection('problems_private').doc(problemId);
    batch.set(docRef, {
      hiddenTests: data.hiddenTests || [],
      timeLimitMs: data.timeLimitMs || 2000,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }
  await batch.commit();
  console.log('✓ Successfully seeded problems_private collection.');

  // 2. Seed dragon/main document
  const dragonRef = db.collection('dragon').doc('main');
  await dragonRef.set({
    hp: 100,
    maxHp: 100,
    status: 'waiting', // 'waiting' | 'live' | 'defeated'
    winnerTeamId: null,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  console.log('✓ Initialized dragon/main (hp: 100, maxHp: 100, status: waiting).');

  // 3. Ensure config/runner exists
  const runnerRef = db.collection('config').doc('runner');
  const runnerDoc = await runnerRef.get();
  if (!runnerDoc.exists) {
    await runnerRef.set({
      url: '',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log('✓ Initialized config/runner document.');
  } else {
    console.log('✓ config/runner document already exists.');
  }

  console.log('Seeding completed successfully!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seeding failed:', err.message);
  process.exit(1);
});

