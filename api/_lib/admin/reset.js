import { db, admin } from '../firebaseAdmin.js';
import { verifyAdmin } from '../auth.js';
import { drawInitialBoard } from '../pool.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
  if (!verifyAdmin(req)) return res.status(401).json({ error: 'Unauthorized: Invalid admin credentials' });

  const maxHp = Math.max(10, Math.min(10000, Number(req.body?.maxHp) || 100));

  try {
    const timestamp = admin.firestore.FieldValue.serverTimestamp();

    // 1. Reset dragon/main
    await db.collection('dragon').doc('main').set({
      hp: maxHp,
      maxHp,
      status: 'waiting',
      winnerTeamId: null,
      winnerTeamName: null,
      updatedAt: timestamp,
    });

    // 2. Clear feed collection
    const feedSnapshot = await db.collection('feed').get();
    if (!feedSnapshot.empty) {
      const batch = db.batch();
      feedSnapshot.docs.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();
    }

    let compactTeams = [];

    // 3. Reset team solvedProblemIds and totalDamage if resetTeams requested
    if (req.body?.resetTeams) {
      const teamsSnapshot = await db.collection('teams').get();
      if (!teamsSnapshot.empty) {
        const teamBatch = db.batch();
        for (const doc of teamsSnapshot.docs) {
          const { board, seenIds } = await drawInitialBoard();
          teamBatch.update(doc.ref, {
            totalDamage: 0,
            solvedProblemIds: [],
            lastSolveAt: null,
            refreshToken: true,
            board,
            seenIds,
            updatedAt: timestamp,
          });
          compactTeams.push({
            id: doc.id,
            name: doc.data().name,
            totalDamage: 0,
            lastSolveAt: null,
            solvedCount: 0,
          });
        }
        await teamBatch.commit();
      }
    } else {
      // Preserve existing teams summary in public/state
      const stateSnap = await db.collection('public').doc('state').get();
      if (stateSnap.exists) {
        compactTeams = stateSnap.data().teams || [];
      }
    }

    // 4. Update public/state
    await db.collection('public').doc('state').set(
      {
        dragon: {
          hp: maxHp,
          maxHp,
          status: 'waiting',
          winnerTeamId: null,
          winnerTeamName: null,
        },
        feed: [],
        teams: compactTeams,
        updatedAt: timestamp,
      },
      { merge: true }
    );

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
