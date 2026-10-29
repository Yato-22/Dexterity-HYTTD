import fs from 'fs';
import path from 'path';
import { db, admin } from '../api/_lib/firebaseAdmin.js';

async function seedPool() {
  console.log('--- Seeding Problem Pool into Firestore ---');

  const poolPath = path.resolve(process.cwd(), 'data/problems_pool.json');
  const hiddenPath = path.resolve(process.cwd(), 'data/hidden_tests.json');

  if (!fs.existsSync(poolPath) || !fs.existsSync(hiddenPath)) {
    throw new Error('data/problems_pool.json or data/hidden_tests.json not found!');
  }

  const pool = JSON.parse(fs.readFileSync(poolPath, 'utf8'));
  const hiddenData = JSON.parse(fs.readFileSync(hiddenPath, 'utf8'));

  console.log(`Seeding ${pool.length} problems into 'pool' collection (server-only)...`);
  const batch1 = db.batch();
  for (const prob of pool) {
    const docRef = db.collection('pool').doc(prob.id);
    batch1.set(docRef, {
      ...prob,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }
  await batch1.commit();
  console.log('✓ Successfully seeded pool collection.');

  console.log(`Seeding hidden test cases for ${Object.keys(hiddenData).length} problems into 'problems_private'...`);
  const batch2 = db.batch();
  for (const [pId, data] of Object.entries(hiddenData)) {
    const docRef = db.collection('problems_private').doc(pId);
    batch2.set(docRef, {
      hiddenTests: data.hiddenTests || [],
      timeLimitMs: data.timeLimitMs || 2000,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }
  await batch2.commit();
  console.log('✓ Successfully seeded problems_private collection.');

  // Initialize public/state if it does not exist
  const stateRef = db.collection('public').doc('state');
  const stateDoc = await stateRef.get();
  if (!stateDoc.exists) {
    await stateRef.set({
      dragon: {
        hp: 100,
        maxHp: 100,
        status: 'waiting', // 'waiting' | 'live' | 'defeated' | 'paused'
        winnerTeamId: null,
        winnerTeamName: null,
      },
      feed: [],
      teams: [],
      runnerOk: true,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log('✓ Initialized public/state document.');
  } else {
    console.log('✓ public/state document exists.');
  }

  // Ensure config/runner exists
  const runnerRef = db.collection('config').doc('runner');
  const runnerDoc = await runnerRef.get();
  if (!runnerDoc.exists) {
    await runnerRef.set({
      url: '',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log('✓ Initialized config/runner document.');
  }

  console.log('=== SeedPool complete! ===');
  process.exit(0);
}

seedPool().catch((err) => {
  console.error('SeedPool failed:', err.message);
  process.exit(1);
});

