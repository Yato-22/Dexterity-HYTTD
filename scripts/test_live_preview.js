import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from '../api/_lib/firebaseAdmin.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const PREVIEW_URL = 'https://dexterity-hyttd-l9lj6w0ro-core-0b60.vercel.app';

async function runWithConcurrency(items, limit, fn) {
  const results = [];
  let index = 0;
  const workers = Array.from({ length: limit }, async () => {
    while (index < items.length) {
      const i = index++;
      results[i] = await fn(items[i], i);
    }
  });
  await Promise.all(workers);
  return results;
}

async function testLive() {
  console.log('====================================================');
  console.log('       RUNNING LIVE VERIFICATION ON PREVIEW URL     ');
  console.log(`URL: ${PREVIEW_URL}`);
  console.log('====================================================\n');

  const pool = JSON.parse(fs.readFileSync(path.join(rootDir, 'data/problems_pool.json'), 'utf8'));

  console.log('--- Setting up 48 TEST_ teams (1 per problem) to verify all 48 problems ---');

  const teams = [];
  for (let i = 0; i < pool.length; i++) {
    const p = pool[i];
    const teamNum = i + 1;
    const teamName = `TEST_Live_${teamNum}`;
    const normTeam = teamName.toLowerCase();
    const phone = `98765432${teamNum < 10 ? '0' + teamNum : teamNum}`;
    const memberName = `Viking_${teamNum}`;

    const board = {
      dagger: p.tier === 'dagger' ? [p.id] : [],
      axe: p.tier === 'axe' ? [p.id] : [],
      catapult: p.tier === 'catapult' ? [p.id] : [],
      ballista: p.tier === 'ballista' ? [p.id] : [],
    };

    teams.push({
      p,
      teamName,
      normTeam,
      phone,
      memberName,
      board,
    });
  }

  // Batch create registry and teams in Firestore
  const batch = db.batch();
  for (const t of teams) {
    const regRef = db.collection('registry').doc(t.normTeam);
    batch.set(regRef, {
      teamName: t.teamName,
      teamKey: t.normTeam,
      teamId: t.teamName,
      leaderPhone: t.phone,
      createdAt: new Date().toISOString(),
    });

    const normMember = t.memberName.toLowerCase();
    const teamRef = db.collection('teams').doc(t.teamName);
    batch.set(teamRef, {
      teamName: t.teamName,
      leaderPhone: t.phone,
      members: {
        [normMember]: {
          name: t.memberName,
          role: 'leader',
          board: t.board,
          seenIds: [t.p.id],
          refreshToken: true,
          solvedCount: 0,
        }
      },
      memberList: [t.memberName],
      board: t.board,
      seenIds: [t.p.id],
      xp: 0,
      totalDamage: 0,
      acceptedSolves: 0,
      totalSubmits: 0,
      penalties: 0,
      solvedProblemIds: [],
      lastSolveAt: null,
      createdAt: new Date().toISOString(),
    });
  }
  await batch.commit();
  console.log(`✓ Seeded ${teams.length} TEST_ teams into Firestore.`);

  // Test Login, Board, and Submit for each team concurrently
  console.log('\n--- Running Live Login, Board Fetch, and Submission for All 48 Problems ---');

  let acceptedCount = 0;
  let failures = [];

  await runWithConcurrency(teams, 6, async (t, idx) => {
    try {
      // 1. Login
      const loginRes = await fetch(`${PREVIEW_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamName: t.teamName,
          leaderPhone: t.phone,
          yourName: t.memberName,
        }),
      });

      if (!loginRes.ok) {
        throw new Error(`Login failed with status ${loginRes.status}`);
      }
      const loginData = await loginRes.json();
      const token = loginData.token;

      // 2. Board
      const boardRes = await fetch(`${PREVIEW_URL}/api/board`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!boardRes.ok) {
        throw new Error(`Board fetch failed with status ${boardRes.status}`);
      }

      // 3. Submit
      const refCode = fs.readFileSync(path.join(rootDir, 'data/reference', t.p.id, 'c.txt'), 'utf8');
      const submitRes = await fetch(`${PREVIEW_URL}/api/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          problemId: t.p.id,
          language: 'c',
          code: refCode,
        }),
      });

      if (!submitRes.ok) {
        const text = await submitRes.text();
        throw new Error(`Submit failed with status ${submitRes.status}: ${text}`);
      }

      const subData = await submitRes.json();
      if (subData.status === 'Accepted' || subData.verdict === 'Accepted') {
        acceptedCount++;
        process.stdout.write(`Problem ${idx + 1}/48 [${t.p.id}] -> ACCEPTED\r`);
      } else {
        failures.push(`${t.p.id}: ${subData.status || subData.verdict} - ${subData.error || ''}`);
      }
    } catch (err) {
      failures.push(`${t.p.id}: ${err.message}`);
    }
  });

  console.log(`\n\n✓ Live Submit Result: ${acceptedCount}/48 problems Accepted on preview deployment!`);

  if (failures.length > 0) {
    console.error('Failures:', failures);
    throw new Error(`Live test encountered ${failures.length} failures.`);
  }

  // 4. Verify Leaderboard & Scoring on one of the teams
  const sampleTeam = await db.collection('teams').doc('TEST_Live_1').get();
  console.log('\nSample Team (TEST_Live_1) post-solve status:');
  console.log(`- XP: ${sampleTeam.data().xp}`);
  console.log(`- Solved: ${sampleTeam.data().solvedProblemIds}`);
  console.log(`- Accepted Solves: ${sampleTeam.data().acceptedSolves}`);

  console.log('\n====================================================');
  console.log('       LIVE PREVIEW VALIDATION COMPLETED SUCCESSFULLY!');
  console.log('====================================================\n');
}

testLive().catch((err) => {
  console.error('\nLive test failed:', err);
  process.exit(1);
});
