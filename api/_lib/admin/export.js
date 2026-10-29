import { db } from '../firebaseAdmin.js';
import { verifyAdmin } from '../auth.js';
import { computeRankings } from '../gameState.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });
  if (!verifyAdmin(req)) return res.status(401).json({ error: 'Unauthorized: Invalid admin credentials' });

  try {
    const [dragonDoc, teamsSnap] = await Promise.all([
      db.collection('dragon').doc('main').get(),
      db.collection('teams').get(),
    ]);

    const dragonData = dragonDoc.data() || {};
    const winnerTeamId = dragonData.winnerTeamId || null;
    const dragonStatus = dragonData.status || 'waiting';

    const rawTeams = teamsSnap.docs.map((doc) => {
      const data = doc.data() || {};
      return {
        id: doc.id,
        name: data.name || doc.id,
        totalDamage: data.totalDamage || 0,
        solvedProblemIds: Array.isArray(data.solvedProblemIds) ? data.solvedProblemIds : [],
        lastSolveAt: data.lastSolveAt,
      };
    });

    const rankedTeams = computeRankings(rawTeams, dragonStatus, winnerTeamId);

    const rows = [
      ['Rank', 'Team Name', 'Team ID', 'Total Damage', 'Solved Problems Count', 'Solved Problem IDs', 'Last Solve Time', 'Badge'],
    ];

    rankedTeams.forEach((t) => {
      let lastSolve = '';
      if (t.lastSolveAt) {
        try {
          const date = t.lastSolveAt.toDate ? t.lastSolveAt.toDate() : new Date(t.lastSolveAt);
          lastSolve = date.toISOString();
        } catch {
          lastSolve = String(t.lastSolveAt);
        }
      }

      const badge = t.isDragonSlayer ? 'DRAGON SLAYER (CHAMPION)' : '';

      rows.push([
        t.rank,
        `"${t.name.replace(/"/g, '""')}"`,
        `"${t.id}"`,
        t.totalDamage,
        t.solvedProblemIds.length,
        `"${t.solvedProblemIds.join('; ')}"`,
        `"${lastSolve}"`,
        `"${badge}"`,
      ]);
    });

    const csvOutput = rows.map((r) => r.join(',')).join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="dexterity-teams-export.csv"');
    return res.status(200).send(csvOutput);
  } catch (err) {
    console.error('Export CSV error:', err);
    return res.status(500).json({ error: err.message });
  }
}
