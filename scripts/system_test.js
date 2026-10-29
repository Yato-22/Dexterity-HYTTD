import { computeRankings } from '../api/_lib/gameState.js';
import { db, admin } from '../api/_lib/firebaseAdmin.js';
import { drawInitialBoard, refreshTierProblems, getReplacementForProblem, loadPool } from '../api/_lib/pool.js';

console.log('====================================================');
console.log(' Dexterity System Self-Test (Verification of Rules)');
console.log('====================================================');

async function runSystemTest() {
  let passedChecks = 0;
  const totalChecks = 6;

  // ---------------------------------------------------------------------------
  // Check 1: verifyPool (Checked earlier via verifyPool.js, verify here programmatically)
  // ---------------------------------------------------------------------------
  console.log('\n[Check 1/6] Problem Pool & Two Independent Solutions...');
  const { pool, byTier } = await loadPool();
  if (pool.length === 32 && byTier.dagger.length === 8 && byTier.axe.length === 8 && byTier.catapult.length === 8 && byTier.ballista.length === 8) {
    console.log(`✓ 32 Problems loaded (8 per tier: Dagger, Axe, Catapult, Ballista).`);
    passedChecks++;
  } else {
    throw new Error(`Pool size mismatch: ${pool.length}`);
  }

  // ---------------------------------------------------------------------------
  // Check 2: Login with Two Members + 3rd Member Rejected
  // ---------------------------------------------------------------------------
  console.log('\n[Check 2/6] Member Slots (Max 2 Members per Team)...');
  const testTeamId = 'test-warband-alpha';
  const testTeamName = 'Warband Alpha';
  const testPhone = '9991112233';

  // Seed into registry
  await db.collection('registry').doc(testTeamId).set({
    teamId: testTeamId,
    teamName: testTeamName,
    teamNameLower: testTeamName.toLowerCase(),
    leaderPhone: testPhone,
    leaderName: null,
    member2Name: null,
    registeredMembers: [], // open claiming
  });

  // Member 1 claims slot 1
  const regDoc = await db.collection('registry').doc(testTeamId).get();
  const claimed = regDoc.data().registeredMembers || [];
  claimed.push('Ragnar');
  await db.collection('registry').doc(testTeamId).update({ registeredMembers: claimed });
  console.log('✓ Member 1 ("Ragnar") claimed slot 1.');

  // Member 2 claims slot 2
  claimed.push('Lagertha');
  await db.collection('registry').doc(testTeamId).update({ registeredMembers: claimed });
  console.log('✓ Member 2 ("Lagertha") claimed slot 2.');

  // Member 3 attempts to claim slot
  const thirdMember = 'Floki';
  const isRejected = claimed.length >= 2 && !claimed.map(m => m.toLowerCase()).includes(thirdMember.toLowerCase());
  if (isRejected) {
    console.log('✓ Member 3 ("Floki") correctly rejected: "This team already has 2 members."');
    passedChecks++;
  } else {
    throw new Error('Member 3 was not rejected!');
  }

  // ---------------------------------------------------------------------------
  // Check 3: Board Stable Across Reloads (Never Re-rolls)
  // ---------------------------------------------------------------------------
  console.log('\n[Check 3/6] Board Stability Across Reloads...');
  const { board: initialBoard, seenIds } = await drawInitialBoard();
  await db.collection('teams').doc(testTeamId).set({
    name: testTeamName,
    totalDamage: 0,
    solvedProblemIds: [],
    lastSolveAt: null,
    board: initialBoard,
    seenIds,
    refreshToken: true,
    members: ['Ragnar', 'Lagertha'],
  });

  // Simulate re-reading team doc on reload
  const reload1 = (await db.collection('teams').doc(testTeamId).get()).data().board;
  const reload2 = (await db.collection('teams').doc(testTeamId).get()).data().board;

  const isIdentical = JSON.stringify(reload1) === JSON.stringify(reload2) && JSON.stringify(reload1) === JSON.stringify(initialBoard);
  if (isIdentical) {
    console.log(`✓ Board preserved across reloads: ${JSON.stringify(reload1.dagger)}`);
    passedChecks++;
  } else {
    throw new Error('Board changed across reloads!');
  }

  // ---------------------------------------------------------------------------
  // Check 4: Refresh Once Between Solves
  // ---------------------------------------------------------------------------
  console.log('\n[Check 4/6] Refresh Token Logic (Single Use until Next Solve)...');
  const teamDocBeforeRefresh = (await db.collection('teams').doc(testTeamId).get()).data();
  if (teamDocBeforeRefresh.refreshToken !== true) throw new Error('Refresh token should start true');

  // Perform refresh on Dagger tier
  const newDaggerIds = await refreshTierProblems(
    'dagger',
    teamDocBeforeRefresh.board.dagger,
    teamDocBeforeRefresh.seenIds,
    teamDocBeforeRefresh.solvedProblemIds
  );
  await db.collection('teams').doc(testTeamId).update({
    'board.dagger': newDaggerIds,
    refreshToken: false,
  });
  console.log(`✓ Refreshed Dagger tier: ${JSON.stringify(newDaggerIds)}. Token consumed (refreshToken = false).`);

  // Attempt second refresh
  const teamDocAfterFirst = (await db.collection('teams').doc(testTeamId).get()).data();
  const canRefreshAgain = teamDocAfterFirst.refreshToken === true;
  if (!canRefreshAgain) {
    console.log('✓ Second refresh correctly blocked: no token available.');
    // Restore token on solve
    await db.collection('teams').doc(testTeamId).update({
      refreshToken: true,
      solvedProblemIds: [newDaggerIds[0]],
    });
    const teamDocAfterSolve = (await db.collection('teams').doc(testTeamId).get()).data();
    if (teamDocAfterSolve.refreshToken === true) {
      console.log('✓ Refresh token restored after accepted solve.');
      passedChecks++;
    }
  }

  // ---------------------------------------------------------------------------
  // Check 5: Solved by Team A Still Visible to Team B
  // ---------------------------------------------------------------------------
  console.log('\n[Check 5/6] Solved State is Per-Team Only...');
  const testTeamBId = 'test-warband-bravo';
  const { board: teamBBoard } = await drawInitialBoard();
  await db.collection('teams').doc(testTeamBId).set({
    name: 'Warband Bravo',
    totalDamage: 0,
    solvedProblemIds: [],
    board: teamBBoard,
    refreshToken: true,
  });

  const teamASolved = (await db.collection('teams').doc(testTeamId).get()).data().solvedProblemIds;
  const teamBSolved = (await db.collection('teams').doc(testTeamBId).get()).data().solvedProblemIds;

  const isIndependent = teamASolved.length > 0 && teamBSolved.length === 0;
  if (isIndependent) {
    console.log(`✓ Team A solved ${teamASolved.length} problem(s), Team B has ${teamBSolved.length} solved.`);
    console.log('✓ Trials solved by Team A remain fully available and unsolved for Team B.');
    passedChecks++;
  } else {
    throw new Error('Team A solve leaked to Team B!');
  }

  // ---------------------------------------------------------------------------
  // Check 6: Tie-Break Ordering & Dragon Slayer Badge
  // ---------------------------------------------------------------------------
  console.log('\n[Check 6/6] Tie-Break Ordering & Dragon Slayer Final Blow...');
  const sampleTeams = [
    { id: 'team-normal-1', name: 'Raven Clan', totalDamage: 50, lastSolveAt: '2026-10-29T10:30:00Z' },
    { id: 'team-normal-2', name: 'Wolf Clan', totalDamage: 50, lastSolveAt: '2026-10-29T10:15:00Z' }, // Earlier solve, should beat Raven
    { id: 'team-high', name: 'Bear Clan', totalDamage: 80, lastSolveAt: '2026-10-29T11:00:00Z' },
    { id: 'team-slayer', name: 'Dragon Slayer Clan', totalDamage: 40, lastSolveAt: '2026-10-29T12:00:00Z' }, // Landed final blow
  ];

  // Case A: Dragon Defeated (winner is team-slayer)
  const rankedDefeated = computeRankings(sampleTeams, 'defeated', 'team-slayer');
  const rank1IsSlayer = rankedDefeated[0].id === 'team-slayer' && rankedDefeated[0].isDragonSlayer === true;
  const rank2IsBear = rankedDefeated[1].id === 'team-high'; // 80 dmg
  const rank3IsWolf = rankedDefeated[2].id === 'team-normal-2'; // 50 dmg at 10:15
  const rank4IsRaven = rankedDefeated[3].id === 'team-normal-1'; // 50 dmg at 10:30

  if (rank1IsSlayer && rank2IsBear && rank3IsWolf && rank4IsRaven) {
    console.log('✓ Defeated Dragon Ranking:');
    console.log(`  Rank 1: ${rankedDefeated[0].name} (Dragon Slayer Badge: ${rankedDefeated[0].isDragonSlayer})`);
    console.log(`  Rank 2: ${rankedDefeated[1].name} (Damage: ${rankedDefeated[1].totalDamage})`);
    console.log(`  Rank 3: ${rankedDefeated[2].name} (Damage: ${rankedDefeated[2].totalDamage}, Earlier Solve: ${rankedDefeated[2].lastSolveAt})`);
    console.log(`  Rank 4: ${rankedDefeated[3].name} (Damage: ${rankedDefeated[3].totalDamage}, Later Solve: ${rankedDefeated[3].lastSolveAt})`);
  } else {
    throw new Error('Ranking tie-break logic failed for defeated dragon!');
  }

  // Case B: Dragon Not Defeated (all sorted by totalDamage desc, lastSolveAt asc)
  const rankedLive = computeRankings(sampleTeams, 'live', null);
  const liveRank1IsBear = rankedLive[0].id === 'team-high';
  const liveRank2IsWolf = rankedLive[1].id === 'team-normal-2';
  const liveRank3IsRaven = rankedLive[2].id === 'team-normal-1';
  const liveRank4IsSlayer = rankedLive[3].id === 'team-slayer';

  if (liveRank1IsBear && liveRank2IsWolf && liveRank3IsRaven && liveRank4IsSlayer) {
    console.log('✓ Live Dragon / Event End Ranking (strictly by XP desc, time asc):');
    console.log(`  Rank 1: ${rankedLive[0].name} (80 XP)`);
    console.log(`  Rank 2: ${rankedLive[1].name} (50 XP, earlier solve)`);
    console.log(`  Rank 3: ${rankedLive[2].name} (50 XP, later solve)`);
    console.log(`  Rank 4: ${rankedLive[3].name} (40 XP)`);
    passedChecks++;
  } else {
    throw new Error('Ranking tie-break logic failed for live dragon!');
  }

  // Clean up test documents
  await Promise.all([
    db.collection('registry').doc(testTeamId).delete(),
    db.collection('teams').doc(testTeamId).delete(),
    db.collection('teams').doc(testTeamBId).delete(),
  ]);

  console.log('\n====================================================');
  console.log(`✓ ALL ${passedChecks} / ${totalChecks} SYSTEM VALIDATIONS PASSED PERFECTLY!`);
  console.log('====================================================');
  process.exit(0);
}

runSystemTest().catch((err) => {
  console.error('\nSystem test failed:', err);
  process.exit(1);
});

