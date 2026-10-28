import { db } from '../_lib/firebaseAdmin.js';
import { verifyAdmin } from '../_lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });
  if (!verifyAdmin(req)) return res.status(401).json({ error: 'Unauthorized: Invalid admin credentials' });

  try {
    const [dragonDoc, teamsSnap] = await Promise.all([
      db.collection('dragon').doc('main').get(),
      db.collection('teams').orderBy('totalDamage', 'desc').get(),
    ]);

    const dragonData = dragonDoc.data() || {};
    const winnerTeamId = dragonData.winnerTeamId || null;

    const rows = [
      ['Rank', 'Team Name', 'Team ID', 'Total Damage', 'Solved Problems Count', 'Solved Problem IDs', 'Last Solve Time', 'Is Winner']
    ];

    let rank = 1;
    teamsSnap.docs.forEach((doc) => {
      const data = doc.data() || {};
      const teamId = doc.id;
      const teamName = data.name || teamId;
      const totalDamage = data.totalDamage || 0;
      const solvedList = Array.isArray(data.solvedProblemIds) ? data.solvedProblemIds : [];
      let lastSolve = '';
      if (data.lastSolveAt) {
        try {
          const date = data.lastSolveAt.toDate ? data.lastSolveAt.toDate() : new Date(data.lastSolveAt);
          lastSolve = date.toISOString();
        } catch {
          lastSolve = String(data.lastSolveAt);
        }
      }
      const isWinner = winnerTeamId && winnerTeamId === teamId ? 'YES (CHAMPION)' : 'NO';

      rows.push([
        rank++,
        `"${teamName.replace(/"/g, '""')}"`,
        `"${teamId}"`,
        totalDamage,
        solvedList.length,
        `"${solvedList.join('; ')}"`,
        `"${lastSolve}"`,
        isWinner
      ]);
    });

    const csvOutput = rows.map((r) => r.join(',')).join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="techflix-teams-export.csv"');
    return res.status(200).send(csvOutput);
  } catch (err) {
    console.error('Export CSV error:', err);
    return res.status(500).json({ error: err.message });
  }
}

