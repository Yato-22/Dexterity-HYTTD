import { db, admin } from './_lib/firebaseAdmin.js';
import { verifyToken, checkRateLimit } from './_lib/auth.js';
import { refreshTierProblems } from './_lib/pool.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const session = verifyToken(req);
  if (!session || !session.teamId) {
    return res.status(401).json({ error: 'Unauthorized: Valid session required' });
  }

  const teamId = session.teamId;

  if (!checkRateLimit(`refresh-${teamId}`, 1000)) {
    return res.status(429).json({ error: 'Please wait before refreshing again.' });
  }

  let tier = req.body?.tier;
  if (!tier || typeof tier !== 'string') {
    return res.status(400).json({ error: 'Tier is required (dagger, axe, catapult, ballista).' });
  }

  tier = tier.toLowerCase().trim();
  const validTiers = ['dagger', 'axe', 'catapult', 'ballista'];
  if (!validTiers.includes(tier)) {
    return res.status(400).json({ error: `Invalid tier. Must be one of: ${validTiers.join(', ')}` });
  }

  const teamRef = db.collection('teams').doc(teamId);

  try {
    let updatedBoard = null;

    await db.runTransaction(async (transaction) => {
      const doc = await transaction.get(teamRef);
      if (!doc.exists) {
        throw new Error('Team not found');
      }

      const teamData = doc.data();
      const hasToken = teamData.refreshToken !== false;

      if (!hasToken) {
        throw new Error('No refresh token available. Solve a problem to earn a refresh token.');
      }

      const currentBoard = teamData.board || { dagger: [], axe: [], catapult: [], ballista: [] };
      const currentTierIds = currentBoard[tier] || [];
      const seenIds = teamData.seenIds || [];
      const solvedIds = teamData.solvedProblemIds || [];

      const newTierIds = await refreshTierProblems(tier, currentTierIds, seenIds, solvedIds);

      // Merge newly seen IDs
      const updatedSeen = Array.from(new Set([...seenIds, ...newTierIds]));
      updatedBoard = {
        ...currentBoard,
        [tier]: newTierIds,
      };

      transaction.update(teamRef, {
        board: updatedBoard,
        seenIds: updatedSeen,
        refreshToken: false,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });

    return res.status(200).json({
      success: true,
      tier,
      board: updatedBoard,
      refreshToken: false,
    });
  } catch (err) {
    console.error('Refresh error:', err);
    return res.status(400).json({ error: err.message || 'Refresh failed' });
  }
}

