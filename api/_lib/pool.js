import fs from 'fs';
import path from 'path';
import { db } from './firebaseAdmin.js';

let cachedPool = null;
let cachedPoolById = null;
let cachedPoolByTier = null;

export async function loadPool() {
  if (cachedPool && cachedPoolById && cachedPoolByTier) {
    return { pool: cachedPool, byId: cachedPoolById, byTier: cachedPoolByTier };
  }

  const localPoolPath = path.resolve(process.cwd(), 'data/problems_pool.json');
  let problems = [];

  if (fs.existsSync(localPoolPath)) {
    try {
      problems = JSON.parse(fs.readFileSync(localPoolPath, 'utf8'));
    } catch (e) {
      console.warn('Failed to parse local problems_pool.json:', e.message);
    }
  }

  if (!problems || problems.length === 0) {
    const snapshot = await db.collection('pool').get();
    problems = snapshot.docs.map((doc) => doc.data());
  }

  cachedPool = problems;
  cachedPoolById = {};
  cachedPoolByTier = {
    dagger: [],
    axe: [],
    catapult: [],
    ballista: [],
  };

  for (const p of problems) {
    cachedPoolById[p.id] = p;
    const tier = (p.tier || p.weapon || 'dagger').toLowerCase();
    if (cachedPoolByTier[tier]) {
      cachedPoolByTier[tier].push(p);
    }
  }

  return { pool: cachedPool, byId: cachedPoolById, byTier: cachedPoolByTier };
}

/**
 * Draw 5 problems per tier for a member board, avoiding teammate's board where possible.
 */
export async function drawMemberBoard(existingTeammateBoard = null, solvedIds = []) {
  const { byTier } = await loadPool();
  const board = {
    dagger: [],
    axe: [],
    catapult: [],
    ballista: [],
  };
  const seenIds = [];
  const solvedSet = new Set(solvedIds || []);

  const tiers = ['dagger', 'axe', 'catapult', 'ballista'];

  for (const tier of tiers) {
    const allInTier = (byTier[tier] || []).filter((p) => !solvedSet.has(p.id));
    const teammateIds = new Set(existingTeammateBoard?.[tier] || []);

    // 1. Prioritize problems NOT on teammate's board
    const nonTeammate = allInTier.filter((p) => !teammateIds.has(p.id)).sort(() => Math.random() - 0.5);
    const teammateOverlap = allInTier.filter((p) => teammateIds.has(p.id)).sort(() => Math.random() - 0.5);

    const chosen = [];
    // Draw up to 5 avoiding teammate
    for (const p of nonTeammate) {
      if (chosen.length >= 5) break;
      chosen.push(p.id);
    }
    // If not enough (e.g. pool shrinking), share as few as possible
    if (chosen.length < 5) {
      for (const p of teammateOverlap) {
        if (chosen.length >= 5) break;
        chosen.push(p.id);
      }
    }

    board[tier] = chosen;
    seenIds.push(...chosen);
  }

  return { board, seenIds };
}

// Legacy initial board fallback (draws 5 per tier)
export async function drawInitialBoard() {
  return drawMemberBoard(null, []);
}

/**
 * Replace a solved problem on a member's board.
 */
export async function getReplacementForProblem(
  tier,
  currentMemberTierIds = [],
  teammateTierIds = [],
  memberSeenIds = [],
  solvedIds = []
) {
  const { byTier } = await loadPool();
  const allInTier = byTier[tier] || [];

  const solvedSet = new Set(solvedIds || []);
  const currentSet = new Set(currentMemberTierIds || []);
  const teammateSet = new Set(teammateTierIds || []);
  const seenSet = new Set(memberSeenIds || []);

  // Filter out solved and currently on board
  const available = allInTier.filter((p) => !solvedSet.has(p.id) && !currentSet.has(p.id));
  if (available.length === 0) return null;

  // 1. Unseen by this member AND not on teammate's board
  let candidates = available.filter((p) => !seenSet.has(p.id) && !teammateSet.has(p.id));

  // 2. Unseen by this member (even if on teammate's board)
  if (candidates.length === 0) {
    candidates = available.filter((p) => !seenSet.has(p.id));
  }

  // 3. Not on teammate's board (even if seen before)
  if (candidates.length === 0) {
    candidates = available.filter((p) => !teammateSet.has(p.id));
  }

  // 4. Any remaining available unsolved in tier
  if (candidates.length === 0) {
    candidates = available;
  }

  const picked = candidates[Math.floor(Math.random() * candidates.length)];
  return picked ? picked.id : null;
}

/**
 * Redraw 5 problems for a tier during member refresh.
 */
export async function refreshMemberTier(
  tier,
  currentMemberTierIds = [],
  teammateTierIds = [],
  memberSeenIds = [],
  solvedIds = []
) {
  const { byTier } = await loadPool();
  const allInTier = byTier[tier] || [];

  const solvedSet = new Set(solvedIds || []);
  const teammateSet = new Set(teammateTierIds || []);
  const seenSet = new Set(memberSeenIds || []);

  const available = allInTier.filter((p) => !solvedSet.has(p.id));
  if (available.length === 0) return [];

  // Prioritize unseen by member and not on teammate's board
  const tierNonTeammateUnseen = available
    .filter((p) => !seenSet.has(p.id) && !teammateSet.has(p.id))
    .sort(() => Math.random() - 0.5);

  const tierUnseen = available
    .filter((p) => !seenSet.has(p.id) && teammateSet.has(p.id))
    .sort(() => Math.random() - 0.5);

  const tierBackup = available
    .filter((p) => seenSet.has(p.id))
    .sort(() => Math.random() - 0.5);

  const picked = [];
  for (const p of tierNonTeammateUnseen) {
    if (picked.length >= 5) break;
    picked.push(p.id);
  }
  if (picked.length < 5) {
    for (const p of tierUnseen) {
      if (picked.length >= 5) break;
      picked.push(p.id);
    }
  }
  if (picked.length < 5) {
    for (const p of tierBackup) {
      if (picked.length >= 5) break;
      if (!picked.includes(p.id)) picked.push(p.id);
    }
  }

  return picked;
}
