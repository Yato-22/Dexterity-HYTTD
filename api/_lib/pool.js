import fs from 'fs';
import path from 'path';
import { db } from './firebaseAdmin.js';

// In-memory cache for problem pool
let cachedPool = null;
let cachedPoolById = null;
let cachedPoolByTier = null;

export async function loadPool() {
  if (cachedPool && cachedPoolById && cachedPoolByTier) {
    return { pool: cachedPool, byId: cachedPoolById, byTier: cachedPoolByTier };
  }

  // Check if data/problems_pool.json exists locally (pre-bundled on server)
  const localPoolPath = path.resolve(process.cwd(), 'data/problems_pool.json');
  let problems = [];

  if (fs.existsSync(localPoolPath)) {
    try {
      problems = JSON.parse(fs.readFileSync(localPoolPath, 'utf8'));
    } catch (e) {
      console.warn('Failed to parse local problems_pool.json:', e.message);
    }
  }

  // If local file not present or empty, fetch from Firestore 'pool' collection
  if (!problems || problems.length === 0) {
    const snapshot = await db.collection('pool').get();
    problems = snapshot.docs.map(doc => doc.data());
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

// Draw initial 3 problems per tier
export async function drawInitialBoard() {
  const { byTier } = await loadPool();
  const board = {
    dagger: [],
    axe: [],
    catapult: [],
    ballista: [],
  };
  const seenIds = [];

  const tiers = ['dagger', 'axe', 'catapult', 'ballista'];
  for (const tier of tiers) {
    const tierProblems = [...(byTier[tier] || [])];
    // Shuffle
    tierProblems.sort(() => Math.random() - 0.5);
    const chosen = tierProblems.slice(0, 3).map(p => p.id);
    board[tier] = chosen;
    seenIds.push(...chosen);
  }

  return { board, seenIds };
}

// Replace a single problem when solved
export async function getReplacementForProblem(tier, currentTierIds, seenIds = [], solvedIds = []) {
  const { byTier } = await loadPool();
  const allInTier = byTier[tier] || [];

  const seenSet = new Set(seenIds);
  const solvedSet = new Set(solvedIds);
  const currentSet = new Set(currentTierIds);

  // 1. Prefer problems neither seen nor solved nor currently on board
  let candidates = allInTier.filter(p => !seenSet.has(p.id) && !solvedSet.has(p.id) && !currentSet.has(p.id));

  // 2. If pool runs out, allow seen but unsolved and not currently on board
  if (candidates.length === 0) {
    candidates = allInTier.filter(p => !solvedSet.has(p.id) && !currentSet.has(p.id));
  }

  // 3. Fallback (if team solved everything in tier)
  if (candidates.length === 0) {
    candidates = allInTier.filter(p => !currentSet.has(p.id));
  }

  if (candidates.length === 0) return null;

  // Pick random candidate
  const picked = candidates[Math.floor(Math.random() * candidates.length)];
  return picked.id;
}

// Refresh 3 problems for a selected tier
export async function refreshTierProblems(tier, currentTierIds, seenIds = [], solvedIds = []) {
  const { byTier } = await loadPool();
  const allInTier = byTier[tier] || [];

  const seenSet = new Set(seenIds);
  const solvedSet = new Set(solvedIds);
  const currentSet = new Set(currentTierIds);

  // 1. Unseen, unsolved, and not currently on board
  let pool = allInTier.filter(p => !seenSet.has(p.id) && !solvedSet.has(p.id) && !currentSet.has(p.id));

  // 2. If not enough to pick 3, allow seen but unsolved
  if (pool.length < 3) {
    const backup = allInTier.filter(p => !solvedSet.has(p.id) && !currentSet.has(p.id));
    for (const b of backup) {
      if (!pool.some(p => p.id === b.id)) {
        pool.push(b);
      }
    }
  }

  // 3. If still not enough, allow anything not on current board
  if (pool.length < 3) {
    const backup = allInTier.filter(p => !currentSet.has(p.id));
    for (const b of backup) {
      if (!pool.some(p => p.id === b.id)) {
        pool.push(b);
      }
    }
  }

  // Shuffle and pick 3 (or as many as available)
  pool.sort(() => Math.random() - 0.5);
  const newIds = pool.slice(0, 3).map(p => p.id);

  // If pool was smaller than 3, keep some current to fill 3
  if (newIds.length < 3) {
    for (const id of currentTierIds) {
      if (!newIds.includes(id)) {
        newIds.push(id);
        if (newIds.length === 3) break;
      }
    }
  }

  return newIds;
}

