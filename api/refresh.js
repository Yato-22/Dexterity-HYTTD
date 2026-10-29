import { db, admin } from './_lib/firebaseAdmin.js';
import { verifyToken, checkRateLimit } from './_lib/auth.js';
import { refreshMemberTier } from './_lib/pool.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const session = verifyToken(req);
  if (!session || !session.teamId) {
    return res.status(401).json({ error: 'Unauthorized: Valid session required' });
  }

  const { teamId, memberName } = session;
  const normMemberKey = String(memberName || '').trim().replace(/\s+/g, ' ').toLowerCase();

  if (!checkRateLimit(`refresh-${teamId}-${normMemberKey}`, 1000)) {
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
      const members = { ...(teamData.members || {}) };
      const member = members[normMemberKey] || {
        name: memberName,
        board: teamData.board || { dagger: [], axe: [], catapult: [], ballista: [] },
        seenIds: teamData.seenIds || [],
        refreshToken: true,
      };

      if (member.refreshToken === false) {
        throw new Error('No refresh token available. Solve a problem to earn another refresh token.');
      }

      const currentBoard = member.board || { dagger: [], axe: [], catapult: [], ballista: [] };
      const currentTierIds = currentBoard[tier] || [];
      const memberSeenIds = member.seenIds || [];
      const solvedIds = teamData.solvedProblemIds || [];

      // Find teammate's tier IDs to minimize overlap
      const otherKey = Object.keys(members).find((k) => k !== normMemberKey);
      const teammateTierIds = otherKey ? members[otherKey]?.board?.[tier] || [] : [];

      const newTierIds = await refreshMemberTier(tier, currentTierIds, teammateTierIds, memberSeenIds, solvedIds);

      const updatedSeen = Array.from(new Set([...memberSeenIds, ...newTierIds]));
      updatedBoard = {
        ...currentBoard,
        [tier]: newTierIds,
      };

      member.board = updatedBoard;
      member.seenIds = updatedSeen;
      member.refreshToken = false;
      members[normMemberKey] = member;

      transaction.update(teamRef, {
        members,
        board: updatedBoard, // legacy fallback
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
