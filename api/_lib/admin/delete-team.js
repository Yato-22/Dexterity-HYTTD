import { db, admin } from '../firebaseAdmin.js';
import { verifyAdmin } from '../auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
  if (!verifyAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });

  const { teamId } = req.body || {};
  if (!teamId) return res.status(400).json({ error: 'teamId is required' });

  try {
    const regRef = db.collection('registry').doc(teamId);
    const teamRef = db.collection('teams').doc(teamId);

    await Promise.all([regRef.delete(), teamRef.delete()]);

    // Update public/state
    const teamsSnap = await db.collection('teams').get();
    const allTeamsSummary = teamsSnap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        name: data.name || d.id,
        totalDamage: data.totalDamage || 0,
        acceptedSolves: data.acceptedSolves || 0,
        totalSubmits: data.totalSubmits || 0,
        penalties: data.penalties || 0,
        lastSolveAt: data.lastSolveAt || null,
        solvedCount: (data.solvedProblemIds || []).length,
      };
    });

    await db.collection('public').doc('state').set(
      {
        teams: allTeamsSummary,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    return res.status(200).json({ success: true, deletedTeamId: teamId });
  } catch (err) {
    console.error('Delete team error:', err);
    return res.status(500).json({ error: 'Failed to delete team: ' + err.message });
  }
}
