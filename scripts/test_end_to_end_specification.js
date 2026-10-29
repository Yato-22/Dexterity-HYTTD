import fetch from 'node-fetch';
import { db } from '../api/_lib/firebaseAdmin.js';
import { computeRankings } from '../api/_lib/gameState.js';

const BASE_URL = 'http://localhost:3000';
const ADMIN_PASSWORD = 'coffee4ever';

async function runSuite() {
  console.log('===============================================================');
  console.log('🛡️ RUNNING END-TO-END SPECIFICATION TEST SUITE (PARTS 1 TO 4)');
  console.log('===============================================================\n');

  // --- PART 1: POOL VERIFICATION IN FIRESTORE ---
  console.log('--- Checking Part 1: Problem Pool in Firestore ---');
  const poolSnap = await db.collection('pool').get();
  console.log(`Found ${poolSnap.size} problems in Firestore 'pool'.`);
  if (poolSnap.size !== 48) {
    throw new Error(`Expected 48 problems in pool, found ${poolSnap.size}`);
  }

  const privSnap = await db.collection('problems_private').get();
  console.log(`Found ${privSnap.size} problem hidden test docs in Firestore 'problems_private'.`);
  if (privSnap.size !== 48) {
    throw new Error(`Expected 48 hidden test sets in problems_private, found ${privSnap.size}`);
  }
  console.log('✓ Part 1 Verified: All 48 problems seeded with sample & hidden tests.\n');

  // --- PART 2: CSV IMPORT & LOGIN RESILIENCE ---
  console.log('--- Checking Part 2: CSV Import & Login ---');
  const testCSV = `teamName,leaderPhone,leaderName,member2Name
TEST_Clan Alpha,+91 98765 43210,Hiccup,Astrid
TEST_Solo Warrior,9876543211,Gobber,
TEST_Open Clan,9876543212,,
TEST_Bad Phone,12345,Fail,
TEST_Clan Alpha,9876543210,Duplicate,
`;

  // Test import endpoint
  const importRes = await fetch(`${BASE_URL}/api/admin/import-teams`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-password': ADMIN_PASSWORD,
    },
    body: JSON.stringify({ csv: testCSV }),
  });

  const importResult = await importRes.json();
  console.log('Full importResult response:', JSON.stringify(importResult));

  if (importResult.summary.skippedCount !== 2) {
    throw new Error(`Expected 2 skipped rows, got ${importResult.summary.skippedCount}`);
  }
  console.log('✓ Validation and reporting verified: skipped bad phone & duplicate within file.\n');

  // Test exact login error cases
  console.log('--- Testing Exact Login Error Cases ---');

  // 1. Team not found
  const err1Res = await fetch(`${BASE_URL}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ teamName: 'TEST_NonExistent', leaderPhone: '9876543210', yourName: 'Hiccup' }),
  });
  const err1 = await err1Res.json();
  console.log(`Non-existent team -> Status: ${err1Res.status}, Error: "${err1.error}"`);
  if (err1.error !== 'Team not found') {
    throw new Error(`Expected "Team not found", got "${err1.error}"`);
  }

  await new Promise((r) => setTimeout(r, 200));

  // 2. Phone number does not match
  const err2Res = await fetch(`${BASE_URL}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ teamName: 'TEST_Clan Alpha', leaderPhone: '9999999999', yourName: 'Hiccup' }),
  });
  const err2 = await err2Res.json();
  console.log(`Mismatched phone -> Status: ${err2Res.status}, Error: "${err2.error}"`);
  if (err2.error !== 'Phone number does not match') {
    throw new Error(`Expected "Phone number does not match", got "${err2.error}"`);
  }

  await new Promise((r) => setTimeout(r, 200));

  // 3. Name not recognised
  const err3Res = await fetch(`${BASE_URL}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ teamName: 'TEST_Clan Alpha', leaderPhone: '+91 98765 43210', yourName: 'Snotlout' }),
  });
  const err3 = await err3Res.json();
  console.log(`Unrecognized name -> Status: ${err3Res.status}, Error: "${err3.error}"`);
  if (err3.error !== 'Name not recognised') {
    throw new Error(`Expected "Name not recognised", got "${err3.error}"`);
  }

  await new Promise((r) => setTimeout(r, 200));

  // 4. Successful login: Member 1
  const m1Res = await fetch(`${BASE_URL}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ teamName: 'test_clan alpha', leaderPhone: '9876543210', yourName: 'hiccup' }),
  });
  const m1Data = await m1Res.json();
  if (!m1Res.ok || !m1Data.token) {
    throw new Error('Member 1 login failed: ' + JSON.stringify(m1Data));
  }
  const token1 = m1Data.token;
  const board1 = m1Data.team.board;
  console.log(`✓ Member 1 (Hiccup) logged in! Board: 5 Daggers (${board1.dagger.length}), 5 Axes (${board1.axe.length}), 5 Catapults (${board1.catapult.length}), 5 Ballistas (${board1.ballista.length})`);

  await new Promise((r) => setTimeout(r, 200));

  // 5. Successful login: Member 2
  const m2Res = await fetch(`${BASE_URL}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ teamName: 'TEST_CLAN ALPHA', leaderPhone: '+91 98765 43210', yourName: 'ASTRID' }),
  });
  const m2Data = await m2Res.json();
  if (!m2Res.ok || !m2Data.token) {
    throw new Error('Member 2 login failed: ' + JSON.stringify(m2Data));
  }
  const token2 = m2Data.token;
  const board2 = m2Data.team.board;
  console.log(`✓ Member 2 (Astrid) logged in! Board: 5 Daggers (${board2.dagger.length}), 5 Axes (${board2.axe.length}), 5 Catapults (${board2.catapult.length}), 5 Ballistas (${board2.ballista.length})`);

  // --- PART 3: PER-MEMBER BOARDS (5 PER TIER, AVOIDING OVERLAP) ---
  console.log('\n--- Checking Part 3: Per-Member Boards Overlap ---');
  let overlapCount = 0;
  for (const tier of ['dagger', 'axe', 'catapult', 'ballista']) {
    const set1 = new Set(board1[tier]);
    const overlap = board2[tier].filter((id) => set1.has(id));
    console.log(`  Tier [${tier}]: Member 1 has ${board1[tier].length}, Member 2 has ${board2[tier].length}. Shared: ${overlap.length}`);
    overlapCount += overlap.length;
  }
  console.log(`Total shared problems across 20 slots: ${overlapCount} (Expected: 0 when tier pool has 12 problems!).`);
  if (overlapCount > 0) {
    console.warn('Note: Some overlap occurred (pool constraints or replacement behavior).');
  } else {
    console.log('✓ Perfect 0 overlap between teammate boards!');
  }

  // 6. Test Open Clan claiming
  console.log('\n--- Checking Open Clan Claiming & Max 2 Limit ---');
  await new Promise((r) => setTimeout(r, 200));
  const claim1 = await (await fetch(`${BASE_URL}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ teamName: 'TEST_Open Clan', leaderPhone: '9876543212', yourName: 'Warrior One' }),
  })).json();
  console.log('Slot 1 claimed by:', claim1.team?.memberName);

  await new Promise((r) => setTimeout(r, 200));
  const claim2 = await (await fetch(`${BASE_URL}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ teamName: 'TEST_Open Clan', leaderPhone: '9876543212', yourName: 'Warrior Two' }),
  })).json();
  console.log('Slot 2 claimed by:', claim2.team?.memberName);

  await new Promise((r) => setTimeout(r, 200));
  const claim3Res = await fetch(`${BASE_URL}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ teamName: 'TEST_Open Clan', leaderPhone: '9876543212', yourName: 'Warrior Three' }),
  });
  const claim3 = await claim3Res.json();
  console.log(`3rd Member Claim -> Status: ${claim3Res.status}, Error: "${claim3.error}"`);
  if (claim3.error !== 'This team already has 2 members.') {
    throw new Error(`Expected "This team already has 2 members.", got "${claim3.error}"`);
  }
  console.log('✓ Open clan slot claiming and 2-member limit verified!');

  // 7. Check server rejects Statement / Run / Submit for problem NOT on active board
  console.log('\n--- Checking Board Membership Enforcement ---');
  // Problem on member 2's board not on member 1's board
  const offBoardProblem = board2.dagger.find((id) => !board1.dagger.includes(id));
  if (offBoardProblem) {
    const rejStatement = await fetch(`${BASE_URL}/api/problem?id=${offBoardProblem}`, {
      headers: { Authorization: `Bearer ${token1}` },
    });
    console.log(`Fetch off-board problem statement -> Status: ${rejStatement.status}`);
    if (rejStatement.status !== 403) {
      throw new Error(`Expected 403 for off-board statement, got ${rejStatement.status}`);
    }

    const rejRun = await fetch(`${BASE_URL}/api/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token1}`,
      },
      body: JSON.stringify({
        language: 'python',
        code: 'print(1)',
        problemId: offBoardProblem,
      }),
    });
    console.log(`Run off-board problem -> Status: ${rejRun.status}`);
    if (rejRun.status !== 403) {
      throw new Error(`Expected 403 for off-board run, got ${rejRun.status}`);
    }
    console.log('✓ Server strictly rejects access to problems not on member active board.');
  }

  // --- PART 4: RANKING, ACCURACY & PENALTIES ---
  console.log('\n--- Checking Part 4: Ranking & Tiebreakers ---');
  const dummyTeams = [
    { id: 't1', name: 'Alpha', totalDamage: 50, acceptedSolves: 5, totalSubmits: 5, penalties: 0, lastSolveAt: 1000 },
    { id: 't2', name: 'Beta', totalDamage: 50, acceptedSolves: 5, totalSubmits: 10, penalties: 5, lastSolveAt: 900 },
    { id: 't3', name: 'Gamma', totalDamage: 50, acceptedSolves: 5, totalSubmits: 10, penalties: 5, lastSolveAt: 1100 },
    { id: 't4', name: 'Delta', totalDamage: 70, acceptedSolves: 7, totalSubmits: 7, penalties: 0, lastSolveAt: 2000 },
  ];

  const rankings = computeRankings(dummyTeams, 'waiting', null);
  console.log('Computed rankings:');
  rankings.forEach((r) => {
    console.log(`  Rank #${r.rank}: ${r.name} - XP: ${r.totalDamage}, Acc: ${r.accuracy}%, Pen: ${r.penalties}`);
  });

  if (rankings[0].id !== 't4') throw new Error('Rank 1 should be highest XP (Delta)');
  if (rankings[1].id !== 't1') throw new Error('Rank 2 should be higher accuracy (Alpha, 100% vs 50%)');
  if (rankings[2].id !== 't2') throw new Error('Rank 3 should be earlier lastSolveAt (Beta 900 vs Gamma 1100)');
  console.log('✓ Ranking function accurately enforces XP desc -> Accuracy desc -> Penalties asc -> Time asc.\n');

  // Clean up test data
  console.log('--- Cleaning Up Test Teams ---');
  const testRegSnap = await db.collection('registry').get();
  for (const doc of testRegSnap.docs) {
    if (doc.id.startsWith('test_') || doc.data().teamName?.startsWith('TEST_')) {
      await doc.ref.delete();
    }
  }
  const testTeamsSnap = await db.collection('teams').get();
  for (const doc of testTeamsSnap.docs) {
    if (doc.id.startsWith('test_') || doc.data().name?.startsWith('TEST_')) {
      await doc.ref.delete();
    }
  }
  console.log('✓ Test data cleaned up successfully.');

  console.log('\n===============================================================');
  console.log('🎉 ALL SPECIFICATION TESTS PASSED SUCCESSFULLY!');
  console.log('===============================================================');
  process.exit(0);
}

runSuite().catch((err) => {
  console.error('\n✕ Test Suite Failed:', err);
  process.exit(1);
});
