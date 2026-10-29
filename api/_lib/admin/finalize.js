import { db, admin } from '../firebaseAdmin.js';
import { verifyAdmin } from '../auth.js';
import { computeRankings } from '../gameState.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
  if (!verifyAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });

  try {
    // 1. Fetch all raw team documents from Firestore 'teams' collection
    const teamsSnap = await db.collection('teams').get();
    const rawTeams = teamsSnap.docs.map((d) => {
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

    // 2. Fetch state to check dragon status
    const stateDoc = await db.collection('public').doc('state').get();
    const stateData = stateDoc.exists ? stateDoc.data() : {};
    const dragon = stateData.dragon || {};

    // 3. Compute final authoritative rankings from teams docs
    const finalRankings = computeRankings(rawTeams, dragon.status, dragon.winnerTeamId);

    // 4. Freeze state: set dragon status to 'defeated' or 'paused' to freeze standings
    await db.collection('public').doc('state').set(
      {
        dragon: {
          ...dragon,
          status: 'defeated',
        },
        teams: finalRankings,
        finalizedAt: new Date().toISOString(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    return res.status(200).json({
      success: true,
      finalRankings,
    });
  } catch (err) {
    console.error('Finalize event error:', err);
    return res.status(500).json({ error: 'Failed to finalize event: ' + err.message });
  }
}
