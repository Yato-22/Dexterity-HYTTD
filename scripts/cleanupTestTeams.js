import { db, admin } from '../api/_lib/firebaseAdmin.js';

async function cleanupTestTeams() {
  console.log('=== Cleaning Up TEST_ Teams and Resetting Dragon ===');

  let deletedRegistry = 0;
  let deletedTeams = 0;
  let deletedSubmissions = 0;
  let deletedAccepted = 0;

  // 1. Purge from 'registry'
  const regSnap = await db.collection('registry').get();
  const regBatch = db.batch();
  for (const doc of regSnap.docs) {
    const data = doc.data();
    if (doc.id.toLowerCase().includes('test') || data.teamName?.startsWith('TEST_')) {
      regBatch.delete(doc.ref);
      deletedRegistry++;
    }
  }
  if (deletedRegistry > 0) await regBatch.commit();
  console.log(`✓ Deleted ${deletedRegistry} TEST_ records from registry.`);

  // 2. Purge from 'teams'
  const teamsSnap = await db.collection('teams').get();
  const teamsBatch = db.batch();
  for (const doc of teamsSnap.docs) {
    const data = doc.data();
    if (doc.id.toLowerCase().includes('test') || data.name?.startsWith('TEST_')) {
      teamsBatch.delete(doc.ref);
      deletedTeams++;
    }
  }
  if (deletedTeams > 0) await teamsBatch.commit();
  console.log(`✓ Deleted ${deletedTeams} TEST_ records from teams.`);

  // 3. Purge TEST_ records from 'submissions'
  const subSnap = await db.collection('submissions').get();
  if (!subSnap.empty) {
    const subBatch = db.batch();
    for (const doc of subSnap.docs) {
      const data = doc.data();
      if (data.teamName?.startsWith('TEST_') || data.teamId?.includes('test')) {
        subBatch.delete(doc.ref);
        deletedSubmissions++;
      }
    }
    if (deletedSubmissions > 0) await subBatch.commit();
    console.log(`✓ Deleted ${deletedSubmissions} TEST_ records from submissions.`);
  }

  // 4. Purge TEST_ records from 'acceptedCode'
  const codeSnap = await db.collection('acceptedCode').get();
  if (!codeSnap.empty) {
    const codeBatch = db.batch();
    for (const doc of codeSnap.docs) {
      const data = doc.data();
      if (data.teamName?.startsWith('TEST_') || data.teamId?.includes('test')) {
        codeBatch.delete(doc.ref);
        deletedAccepted++;
      }
    }
    if (deletedAccepted > 0) await codeBatch.commit();
    console.log(`✓ Deleted ${deletedAccepted} TEST_ records from acceptedCode.`);
  }

  // 5. Reset dragon/main
  const timestamp = admin.firestore.FieldValue.serverTimestamp();
  await db.collection('dragon').doc('main').set({
    hp: 100,
    maxHp: 100,
    status: 'waiting',
    winnerTeamId: null,
    winnerTeamName: null,
    updatedAt: timestamp,
  });
  console.log('✓ Reset dragon/main to HP: 100, Status: waiting.');

  // 6. Reset public/state
  const stateSnap = await db.collection('public').doc('state').get();
  let remainingTeams = [];
  if (stateSnap.exists) {
    const existing = stateSnap.data().teams || [];
    remainingTeams = existing.filter((t) => !t.name?.startsWith('TEST_') && !t.id?.includes('test'));
  }

  await db.collection('public').doc('state').set({
    dragon: {
      hp: 100,
      maxHp: 100,
      status: 'waiting',
      winnerTeamId: null,
      winnerTeamName: null,
    },
    feed: [],
    teams: remainingTeams,
    runnerOk: true,
    updatedAt: timestamp,
  });
  console.log(`✓ Reset public/state with ${remainingTeams.length} non-test teams preserved.`);

  console.log('=== Cleanup complete! ===');
  process.exit(0);
}

cleanupTestTeams().catch((err) => {
  console.error('Cleanup failed:', err.message);
  process.exit(1);
});

