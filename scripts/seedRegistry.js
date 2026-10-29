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

async function initFirebase() {
  const { db } = await import('../api/_lib/firebaseAdmin.js');
  return db;
}

const DEFAULT_TEAMS = [
  {
    teamId: 'team-team-alpha',
    teamName: 'Team Alpha',
    leaderPhone: '9876543210',
    leaderName: 'Hiccup',
    member2Name: 'Astrid',
  },
  {
    teamId: 'team-team-bravo',
    teamName: 'Team Bravo',
    leaderPhone: '9876543211',
    leaderName: 'Snotlout',
    member2Name: 'Fishlegs',
  },
  {
    teamId: 'team-team-berserker',
    teamName: 'Team Berserker',
    leaderPhone: '9876543212',
    leaderName: 'Dagur',
    member2Name: 'Mala',
  },
  {
    teamId: 'team-team-night-fury',
    teamName: 'Team Night Fury',
    leaderPhone: '9876543213',
    leaderName: 'Hiccup',
    member2Name: 'Toothless',
  },
  {
    teamId: 'team-berk-vikings',
    teamName: 'Berk Vikings',
    leaderPhone: '1234567890',
    leaderName: 'Hiccup',
    member2Name: 'Astrid',
  },
  {
    teamId: 'team-dragon-riders',
    teamName: 'Dragon Riders',
    leaderPhone: '9999999999',
    leaderName: 'Rider One',
    member2Name: 'Rider Two',
  },
];

async function seedRegistry() {
  console.log('--- Seeding Firestore registry collection ---');
  const db = await initFirebase();
  const { drawInitialBoard } = await import('../api/_lib/pool.js');

  const batch = db.batch();

  for (const t of DEFAULT_TEAMS) {
    const regRef = db.collection('registry').doc(t.teamId);
    batch.set(
      regRef,
      {
        teamId: t.teamId,
        teamName: t.teamName,
        teamNameLower: t.teamName.trim().replace(/\s+/g, ' ').toLowerCase(),
        leaderPhone: t.leaderPhone.replace(/\D/g, ''),
        leaderName: t.leaderName,
        member2Name: t.member2Name,
        registeredMembers: [t.leaderName, t.member2Name],
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    // Also ensure team doc in 'teams' collection has a valid board
    const teamRef = db.collection('teams').doc(t.teamId);
    const teamSnap = await teamRef.get();
    if (!teamSnap.exists || !teamSnap.data()?.board?.dagger?.length) {
      const { board, seenIds } = await drawInitialBoard();
      batch.set(
        teamRef,
        {
          name: t.teamName,
          totalDamage: teamSnap.exists ? (teamSnap.data().totalDamage || 0) : 0,
          solvedProblemIds: teamSnap.exists ? (teamSnap.data().solvedProblemIds || []) : [],
          lastSolveAt: teamSnap.exists ? (teamSnap.data().lastSolveAt || null) : null,
          board,
          seenIds,
          refreshToken: true,
          members: [t.leaderName, t.member2Name],
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
    }
    console.log(`Prepared registry for: ${t.teamName} (${t.leaderPhone}) - members: ${t.leaderName}, ${t.member2Name}`);
  }

  await batch.commit();
  console.log('✓ Successfully seeded registry collection and verified team boards!');
  process.exit(0);
}

seedRegistry().catch((err) => {
  console.error('Failed to seed registry:', err);
  process.exit(1);
});
