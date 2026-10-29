import { db, admin } from './firebaseAdmin.js';
import { getReplacementForProblem } from './pool.js';

/**
 * Shared ranking function used by leaderboard, /display and CSV export:
 * 1st = team that lands final blow ("Dragon Slayer")
 * Remaining sorted by totalDamage descending, then lastSolveAt ascending.
 * If dragon not defeated (or admin ends), all sorted by totalDamage desc, lastSolveAt asc.
 */
export function computeRankings(teams = [], dragonStatus = 'waiting', winnerTeamId = null) {
  const sorted = [...teams].sort((a, b) => {
    if (dragonStatus === 'defeated' && winnerTeamId) {
      if (a.id === winnerTeamId) return -1;
      if (b.id === winnerTeamId) return 1;
    }

    const dmgDiff = (b.totalDamage || 0) - (a.totalDamage || 0);
    if (dmgDiff !== 0) return dmgDiff;

    const parseTime = (t) => {
      if (!t) return Infinity;
      if (typeof t.toMillis === 'function') return t.toMillis();
      if (typeof t === 'number') return t;
      const parsed = new Date(t).getTime();
      return isNaN(parsed) ? Infinity : parsed;
    };

    return parseTime(a.lastSolveAt) - parseTime(b.lastSolveAt);
  });

  return sorted.map((t, idx) => ({
    ...t,
    rank: idx + 1,
    isDragonSlayer: Boolean(winnerTeamId && t.id === winnerTeamId),
  }));
}

/**
 * Helper to get the current public state document
 */
export async function getPublicState() {
  const stateDoc = await db.collection('public').doc('state').get();
  if (!stateDoc.exists) {
    const defaultState = {
      dragon: {
        hp: 100,
        maxHp: 100,
        status: 'waiting',
        winnerTeamId: null,
        winnerTeamName: null,
      },
      feed: [],
      teams: [],
      runnerOk: true,
      updatedAt: new Date().toISOString(),
    };
    await db.collection('public').doc('state').set(defaultState);
    return defaultState;
  }
  return stateDoc.data();
}

/**
 * Executes accepted solve transaction in ONE atomic Firestore transaction.
 */
export async function processAcceptedSubmission({
  teamId,
  memberName,
  problem,
  language,
  code,
}) {
  const stateRef = db.collection('public').doc('state');
  const teamRef = db.collection('teams').doc(teamId);
  const dragonRef = db.collection('dragon').doc('main');

  let result = null;

  await db.runTransaction(async (transaction) => {
    const [stateSnap, teamSnap, dragonSnap] = await Promise.all([
      transaction.get(stateRef),
      transaction.get(teamRef),
      transaction.get(dragonRef),
    ]);

    if (!teamSnap.exists) {
      throw new Error(`Team ${teamId} not found`);
    }

    const teamData = teamSnap.data();
    const stateData = stateSnap.exists
      ? stateSnap.data()
      : {
          dragon: { hp: 100, maxHp: 100, status: 'waiting', winnerTeamId: null },
          feed: [],
          teams: [],
          runnerOk: true,
        };

    const dragonData = dragonSnap.exists
      ? dragonSnap.data()
      : stateData.dragon || { hp: 100, maxHp: 100, status: 'waiting', winnerTeamId: null };

    const tier = (problem.tier || problem.weapon || 'dagger').toLowerCase();
    const board = teamData.board || { dagger: [], axe: [], catapult: [], ballista: [] };
    const tierIds = board[tier] || [];

    // Verify problem was on team's board
    if (!tierIds.includes(problem.id)) {
      throw new Error(`Problem ${problem.id} is not on team ${teamId}'s active board`);
    }

    const solvedList = teamData.solvedProblemIds || [];
    const isFirstSolve = !solvedList.includes(problem.id);
    const dragonStatus = stateData.dragon?.status || dragonData.status || 'waiting';
    const isDragonLive = dragonStatus === 'live';

    let damage = 0;
    let newHp = stateData.dragon?.hp ?? dragonData.hp ?? 100;
    let newStatus = dragonStatus;
    let winnerTeamId = stateData.dragon?.winnerTeamId ?? dragonData.winnerTeamId ?? null;
    let winnerTeamName = stateData.dragon?.winnerTeamName ?? null;
    let isFinalBlow = false;

    const nowIso = new Date().toISOString();
    const serverTimestamp = admin.firestore.FieldValue.serverTimestamp();

    let newBoard = { ...board };
    let seenIds = [...(teamData.seenIds || [])];

    if (isFirstSolve) {
      damage = problem.xp || 2;

      if (isDragonLive && newHp > 0) {
        newHp = Math.max(0, newHp - damage);
        if (newHp === 0 && !winnerTeamId) {
          isFinalBlow = true;
          newStatus = 'defeated';
          winnerTeamId = teamId;
          winnerTeamName = teamData.name;
        }
      }

      // Restore refresh token on solve!
      const updatedSolved = [...solvedList, problem.id];
      const newTotalDamage = (teamData.totalDamage || 0) + damage;

      // Find replacement for solved problem from that tier
      const replacementId = await getReplacementForProblem(tier, tierIds, seenIds, updatedSolved);
      if (replacementId) {
        newBoard[tier] = tierIds.map((id) => (id === problem.id ? replacementId : id));
        if (!seenIds.includes(replacementId)) {
          seenIds.push(replacementId);
        }
      }

      // Update team document
      transaction.update(teamRef, {
        totalDamage: newTotalDamage,
        solvedProblemIds: updatedSolved,
        lastSolveAt: serverTimestamp,
        refreshToken: true,
        board: newBoard,
        seenIds: seenIds,
        updatedAt: serverTimestamp,
      });

      // Feed entry (latest 4 kept)
      const newFeedEntry = {
        id: `feed_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        teamName: teamData.name,
        problemId: problem.id,
        weapon: tier,
        damage,
        createdAt: nowIso,
      };
      const updatedFeed = [newFeedEntry, ...(stateData.feed || [])].slice(0, 4);

      // Compact teams list in state
      const existingTeams = stateData.teams || [];
      const teamIdx = existingTeams.findIndex((t) => t.id === teamId);
      const teamSummary = {
        id: teamId,
        name: teamData.name,
        totalDamage: newTotalDamage,
        lastSolveAt: nowIso,
        solvedCount: updatedSolved.length,
      };

      let updatedTeams;
      if (teamIdx >= 0) {
        updatedTeams = [...existingTeams];
        updatedTeams[teamIdx] = teamSummary;
      } else {
        updatedTeams = [...existingTeams, teamSummary];
      }

      const updatedDragon = {
        hp: newHp,
        maxHp: stateData.dragon?.maxHp ?? dragonData.maxHp ?? 100,
        status: newStatus,
        winnerTeamId,
        winnerTeamName,
      };

      // Update public/state
      transaction.set(
        stateRef,
        {
          dragon: updatedDragon,
          feed: updatedFeed,
          teams: updatedTeams,
          runnerOk: stateData.runnerOk ?? true,
          updatedAt: serverTimestamp,
        },
        { merge: true }
      );

      // Keep dragon/main in sync for backward compatibility
      transaction.set(
        dragonRef,
        {
          hp: newHp,
          maxHp: updatedDragon.maxHp,
          status: newStatus,
          winnerTeamId,
          winnerTeamName,
          updatedAt: serverTimestamp,
        },
        { merge: true }
      );

      result = {
        isFirstSolve: true,
        damage,
        newHp,
        isFinalBlow,
        board: newBoard,
        refreshToken: true,
        totalDamage: newTotalDamage,
      };
    } else {
      // Not first solve: no damage, no score increase
      result = {
        isFirstSolve: false,
        damage: 0,
        newHp,
        isFinalBlow: false,
        board,
        refreshToken: teamData.refreshToken,
        totalDamage: teamData.totalDamage || 0,
      };
    }
  });

  // Server-only: Save accepted submission's code for dispute review
  try {
    await db.collection('acceptedCode').add({
      teamId,
      teamName: teamId, // or name
      submittingMember: memberName,
      problemId: problem.id,
      language,
      code,
      firstSolve: result?.isFirstSolve ?? false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  } catch (err) {
    console.warn('Failed to save to acceptedCode collection:', err.message);
  }

  return result;
}

