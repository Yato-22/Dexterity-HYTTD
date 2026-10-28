import { db } from './_lib/firebaseAdmin.js';
import { signToken, checkRateLimit } from './_lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const clientIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'ip';
  if (!checkRateLimit(`login-${clientIp}`, 500)) {
    return res.status(429).json({ error: 'Too many login attempts. Please wait.' });
  }

  let code = req.body?.code;
  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'Team code is required.' });
  }

  code = code.trim().toUpperCase();

  try {
    const codeDoc = await db.collection('teamCodes').doc(code).get();
    if (!codeDoc.exists) {
      return res.status(401).json({ error: 'Invalid team code. Please check with the arena organizers.' });
    }

    const { teamId } = codeDoc.data();
    if (!teamId) {
      return res.status(500).json({ error: 'Team code is not linked to any team.' });
    }

    const teamDoc = await db.collection('teams').doc(teamId).get();
    if (!teamDoc.exists) {
      return res.status(404).json({ error: 'Team record not found.' });
    }

    const teamData = teamDoc.data();
    const token = signToken({
      teamId,
      teamName: teamData.name || teamId,
    });

    return res.status(200).json({
      token,
      team: {
        id: teamId,
        name: teamData.name || teamId,
        totalDamage: teamData.totalDamage || 0,
        solvedProblemIds: teamData.solvedProblemIds || [],
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Login failed: ' + err.message });
  }
}

