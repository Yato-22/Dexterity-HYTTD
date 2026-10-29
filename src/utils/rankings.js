/**
 * Shared ranking function used by leaderboard, /display, the arena rank display and CSV export:
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
