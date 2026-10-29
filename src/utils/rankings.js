/**
 * Shared ranking function used by leaderboard, /display and CSV export:
 * 1st = team that lands final blow ("Dragon Slayer")
 * Remaining sorted by totalDamage descending, then lastSolveAt ascending.
 * If dragon not defeated, all sorted by totalDamage desc, lastSolveAt asc.
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

