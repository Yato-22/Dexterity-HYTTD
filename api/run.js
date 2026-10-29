import { db } from './_lib/firebaseAdmin.js';
import { verifyToken, checkRateLimit } from './_lib/auth.js';
import { executePiston } from './_lib/runner.js';
import { getPublicState } from './_lib/gameState.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // 1. Authenticate team session
  const session = verifyToken(req);
  if (!session || !session.teamId) {
    return res.status(401).json({ error: 'Unauthorized: Valid session required.' });
  }

  const { teamId } = session;

  // 2. Check if contest is paused
  try {
    const state = await getPublicState();
    if (state.dragon?.status === 'paused') {
      return res.status(403).json({ error: 'The battle is currently paused. Please wait for the chieftain to resume.' });
    }
  } catch (err) {
    console.warn('Could not check pause state:', err.message);
  }

  // 3. Rate limiting (cooldown per team)
  if (!checkRateLimit(`run-${teamId}`, 1500)) {
    return res.status(429).json({ error: 'Please wait a moment between code runs.' });
  }

  const { language, code, stdin = '', timeLimitMs = 2000, problemId } = req.body || {};

  if (!language || typeof language !== 'string') {
    return res.status(400).json({ error: 'Language is required.' });
  }

  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'Code is required.' });
  }

  if (code.length > 65536) {
    return res.status(400).json({ error: 'Code size exceeds maximum 64KB.' });
  }

  // 4. If problemId is provided, verify it is on the team's active board
  if (problemId) {
    try {
      const teamDoc = await db.collection('teams').doc(teamId).get();
      if (teamDoc.exists) {
        const board = teamDoc.data()?.board || {};
        const allBoardIds = [
          ...(board.dagger || []),
          ...(board.axe || []),
          ...(board.catapult || []),
          ...(board.ballista || []),
        ];
        if (!allBoardIds.includes(problemId)) {
          return res.status(403).json({ error: 'This problem is not on your team board.' });
        }
      }
    } catch (e) {
      console.warn('Could not verify board problem:', e.message);
    }
  }

  const effectiveTimeLimit = Math.min(Number(timeLimitMs) || 2000, 3000);

  try {
    const result = await executePiston({
      language,
      code,
      stdin,
      timeLimitMs: effectiveTimeLimit,
    });

    return res.status(200).json(result);
  } catch (err) {
    console.error('Run execution error:', err.message);
    const statusCode = err.status === 400 ? 400 : (err.status || 500);
    return res.status(statusCode).json({
      error: err.message,
      stdout: '',
      stderr: err.message,
      exitCode: 1,
    });
  }
}
