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

  const problemId = req.query?.id;
  if (!problemId || typeof problemId !== 'string') {
    return res.status(400).json({ error: 'Problem ID is required (?id=...)' });
  }

  try {
    const teamDoc = await db.collection('teams').doc(session.teamId).get();
    if (!teamDoc.exists) {
      return res.status(404).json({ error: 'Team not found' });
    }

    const teamData = teamDoc.data();
    const board = teamData.board || {};
    const allBoardIds = [
      ...(board.dagger || []),
      ...(board.axe || []),
      ...(board.catapult || []),
      ...(board.ballista || []),
    ];

    if (!allBoardIds.includes(problemId)) {
      return res.status(403).json({
        error: 'Problem statement is not available: this problem is not on your team board.',
      });
    }

    const { byId } = await loadPool();
    const problem = byId[problemId];

    if (!problem) {
      return res.status(404).json({ error: 'Problem definition not found in pool' });
    }

    const { hiddenTests, ...publicProblem } = problem;
    return res.status(200).json(publicProblem);
  } catch (err) {
    console.error('Problem statement fetch error:', err);
    return res.status(500).json({ error: 'Failed to fetch problem statement: ' + err.message });
  }
}

