import { db, admin } from '../_lib/firebaseAdmin.js';
import { verifyAdmin } from '../_lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
  if (!verifyAdmin(req)) return res.status(401).json({ error: 'Unauthorized: Invalid admin credentials' });

  const maxHp = Math.max(10, Math.min(10000, Number(req.body?.maxHp) || 100));

  try {
    // 1. Reset dragon/main
    await db.collection('dragon').doc('main').set({
      hp: maxHp,
      maxHp,
      status: 'waiting',
      winnerTeamId: null,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // 2. Clear feed collection
    const feedSnapshot = await db.collection('feed').get();
    if (!feedSnapshot.empty) {
      const batch = db.batch();
      feedSnapshot.docs.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();
    }

    // 3. Optional: Reset team solvedProblemIds and totalDamage if resetTeams requested
    if (req.body?.resetTeams) {
      const teamsSnapshot = await db.collection('teams').get();
      if (!teamsSnapshot.empty) {
        const teamBatch = db.batch();
        teamsSnapshot.docs.forEach((doc) => {
          teamBatch.update(doc.ref, {
            totalDamage: 0,
            solvedProblemIds: [],
            lastSolveAt: null,
          });
        });
        await teamBatch.commit();
      }
    }

    return res.status(200).json({
      success: true,
      hp: maxHp,
      maxHp,
      status: 'waiting',
      clearedFeedCount: feedSnapshot.size,
    });
  } catch (err) {
    console.error('Reset error:', err);
    return res.status(500).json({ error: err.message });
  }
}

