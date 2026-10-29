import { db } from './_lib/firebaseAdmin.js';
import { verifyToken } from './_lib/auth.js';
import { loadPool } from './_lib/pool.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const session = verifyToken(req);
  if (!session || !session.teamId) {
    return res.status(401).json({ error: 'Unauthorized: Session required' });
  }

  try {
    const teamDoc = await db.collection('teams').doc(session.teamId).get();
    if (!teamDoc.exists) {
      return res.status(404).json({ error: 'Team not found' });
    }

    const teamData = teamDoc.data();
    const board = teamData.board || { dagger: [], axe: [], catapult: [], ballista: [] };
    const { byId } = await loadPool();

    // Map board IDs to full problem statements (without any hidden tests!)
    const enrichedBoard = {};
    for (const [tier, ids] of Object.entries(board)) {
      enrichedBoard[tier] = ids
        .map((id) => byId[id])
        .filter(Boolean)
        .map((p) => {
          // Explicitly omit hidden tests or server-only fields
          const { hiddenTests, ...publicFields } = p;
          return publicFields;
        });
    }

    return res.status(200).json({
      board: enrichedBoard,
      rawBoard: board,
      refreshToken: teamData.refreshToken ?? true,
      solvedProblemIds: teamData.solvedProblemIds || [],
    });
  } catch (err) {
    console.error('Board fetch error:', err);
    return res.status(500).json({ error: 'Failed to fetch team board: ' + err.message });
  }
}

