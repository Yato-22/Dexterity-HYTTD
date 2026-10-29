import { db, admin } from './firebaseAdmin.js';
import { getReplacementForProblem } from './pool.js';

/**
 * Shared ranking function used by leaderboard, /display, arena rank display, and CSV export.
 * Position is decided strictly by team XP (total damage from accepted first-solves).
 * The final blow gives NO ranking advantage (Dragon Slayer is cosmetic only).
 * Tiebreakers in order:
 * 1. Higher accuracy (acceptedSolves / totalSubmits)
 * 2. Fewer penalties
 * 3. Earlier lastSolveAt
 * 4. Same position if still tied
 */
export function computeRankings(teams = [], dragonStatus = 'waiting', winnerTeamId = null) {
  const parseTime = (t) => {
    if (!t) return Infinity;
    if (typeof t.toMillis === 'function') return t.toMillis();
    if (typeof t === 'number') return t;
    const parsed = new Date(t).getTime();
    return isNaN(parsed) ? Infinity : parsed;
  };

  const getAccuracy = (t) => {
    const submits = t.totalSubmits || 0;
    const solves = t.acceptedSolves || 0;
    return submits > 0 ? solves / submits : 0;
  };

  const sorted = [...teams].sort((a, b) => {
    // 1. XP (totalDamage) descending
    const dmgA = a.totalDamage ?? a.score ?? 0;
    const dmgB = b.totalDamage ?? b.score ?? 0;
    if (dmgB !== dmgA) return dmgB - dmgA;

    // 2. Accuracy descending
    const accA = getAccuracy(a);
    const accB = getAccuracy(b);
    if (accB !== accA) return accB - accA;

    // 3. Penalties ascending
    const penA = a.penalties || 0;
    const penB = b.penalties || 0;
    if (penA !== penB) return penA - penB;

    // 4. Earlier lastSolveAt ascending
    return parseTime(a.lastSolveAt) - parseTime(b.lastSolveAt);
  });

  // Assign ranks with tie handling
  let currentRank = 1;
  return sorted.map((t, idx) => {
    if (idx > 0) {
      const prev = sorted[idx - 1];
      const sameXP = (t.totalDamage ?? t.score ?? 0) === (prev.totalDamage ?? prev.score ?? 0);
      const sameAcc = getAccuracy(t) === getAccuracy(prev);
      const samePen = (t.penalties || 0) === (prev.penalties || 0);
      const sameTime = parseTime(t.lastSolveAt) === parseTime(prev.lastSolveAt);

      if (!sameXP || !sameAcc || !samePen || !sameTime) {
        currentRank = idx + 1;
      }
    }

    const submits = t.totalSubmits || 0;
    const solves = t.acceptedSolves || 0;
    const accPercent = submits > 0 ? Math.round((solves / submits) * 1000) / 10 : 0;

    return {
      ...t,
      rank: currentRank,
      accuracy: accPercent,
      isDragonSlayer: Boolean(winnerTeamId && t.id === winnerTeamId),
    };
  });
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
 * Executes accepted solve transaction atomically.
 * Updates both members' boards, tracks team stats, and syncs public/state.
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
    const normMemberKey = String(memberName || '').trim().replace(/\s+/g, ' ').toLowerCase();

    // Ensure member boards object structure
    const members = { ...(teamData.members || {}) };
    const solverMember = members[normMemberKey] || {
      name: memberName,
      board: teamData.board || { dagger: [], axe: [], catapult: [], ballista: [] },
      seenIds: teamData.seenIds || [],
      refreshToken: true,
    };

    const solverBoard = solverMember.board || { dagger: [], axe: [], catapult: [], ballista: [] };
    const solverTierIds = solverBoard[tier] || [];

    // Verify problem was on solver's active board
    if (!solverTierIds.includes(problem.id)) {
      throw new Error(`Problem ${problem.id} is not on ${memberName}'s active board`);
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

      const updatedSolved = [...solvedList, problem.id];
      const newTotalDamage = (teamData.totalDamage || 0) + damage;
      const newAcceptedSolves = (teamData.acceptedSolves || 0) + 1;
      const newTotalSubmits = (teamData.totalSubmits || 0) + 1;

      // Update boards for ALL members on this team (remove solved problem and draw replacement)
      const memberKeys = Object.keys(members);
      if (memberKeys.length === 0) {
        // Fallback for single member if members map is empty
        members[normMemberKey] = solverMember;
        memberKeys.push(normMemberKey);
      }

      for (const mKey of memberKeys) {
        const mem = { ...members[mKey] };
        const mBoard = { ...(mem.board || {}) };
        const mTierIds = [...(mBoard[tier] || [])];
        const mSeenIds = [...(mem.seenIds || [])];

        if (mTierIds.includes(problem.id)) {
          // Teammate's board IDs in tier to minimize overlap
          const otherKey = memberKeys.find((k) => k !== mKey);
          const teammateTierIds = otherKey ? members[otherKey]?.board?.[tier] || [] : [];

          const replacementId = await getReplacementForProblem(
            tier,
            mTierIds,
            teammateTierIds,
            mSeenIds,
            updatedSolved
          );

          if (replacementId) {
            mBoard[tier] = mTierIds.map((id) => (id === problem.id ? replacementId : id));
            if (!mSeenIds.includes(replacementId)) {
              mSeenIds.push(replacementId);
            }
          } else {
            // Pool shrunk: remove problem and let tier box shrink
            mBoard[tier] = mTierIds.filter((id) => id !== problem.id);
          }
        }

        // Restore refresh token for the member who solved it
        if (mKey === normMemberKey) {
          mem.refreshToken = true;
        }

        mem.board = mBoard;
        mem.seenIds = mSeenIds;
        members[mKey] = mem;
      }

      // Legacy fallback board on team doc
      const legacyBoard = members[normMemberKey]?.board || solverBoard;

      // Update team document
      transaction.update(teamRef, {
        totalDamage: newTotalDamage,
        acceptedSolves: newAcceptedSolves,
        totalSubmits: newTotalSubmits,
        solvedProblemIds: updatedSolved,
        lastSolveAt: nowIso,
        members: members,
        board: legacyBoard,
        refreshToken: true,
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

      // Compact teams list in state for leaderboard
      const existingTeams = stateData.teams || [];
      const teamIdx = existingTeams.findIndex((t) => t.id === teamId);
      const teamSummary = {
        id: teamId,
        name: teamData.name,
        totalDamage: newTotalDamage,
        acceptedSolves: newAcceptedSolves,
        totalSubmits: newTotalSubmits,
        penalties: teamData.penalties || 0,
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

      // Keep dragon/main in sync
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
        board: members[normMemberKey]?.board || legacyBoard,
        refreshToken: true,
        totalDamage: newTotalDamage,
        acceptedSolves: newAcceptedSolves,
        totalSubmits: newTotalSubmits,
        penalties: teamData.penalties || 0,
        tier,
      };
    } else {
      // Not first solve: no damage, no score increase
      result = {
        isFirstSolve: false,
        damage: 0,
        newHp,
        isFinalBlow: false,
        board: members[normMemberKey]?.board || solverBoard,
        refreshToken: members[normMemberKey]?.refreshToken ?? true,
        totalDamage: teamData.totalDamage || 0,
        acceptedSolves: teamData.acceptedSolves || 0,
        totalSubmits: teamData.totalSubmits || 0,
        penalties: teamData.penalties || 0,
        tier,
      };
    }
  });

  // Server-only: Save accepted submission's code for dispute review
  try {
    await db.collection('acceptedCode').add({
      teamId,
      teamName: teamId,
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
