import { db, admin } from './_lib/firebaseAdmin.js';
import { signToken, checkRateLimit } from './_lib/auth.js';
import { drawMemberBoard } from './_lib/pool.js';

function normStr(str) {
  return String(str || '').trim().replace(/\s+/g, ' ').toLowerCase();
}

function cleanDigits(raw) {
  return String(raw || '').replace(/\D/g, '');
}

function getLast10Digits(raw) {
  const digits = cleanDigits(raw);
  return digits.length > 10 ? digits.slice(-10) : digits;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const clientIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'ip';
  const cleanTeamName = (req.body?.teamName || '').trim();
  const cleanYourName = (req.body?.yourName || '').trim();
  const leaderPhone = req.body?.leaderPhone;

  if (!cleanTeamName) {
    return res.status(400).json({ error: 'Team Name is required.' });
  }
  if (!leaderPhone) {
    return res.status(400).json({ error: 'Team Leader Phone Number is required.' });
  }
  if (!cleanYourName) {
    return res.status(400).json({ error: 'Your Name is required.' });
  }

  const normTeam = normStr(cleanTeamName);
  const rateLimitKey = `login-${clientIp}-${normTeam}`;
  if (!checkRateLimit(rateLimitKey, 150)) {
    return res.status(429).json({ error: 'Too many rapid login attempts. Please wait a moment.' });
  }

  try {
    const inputLast10 = getLast10Digits(leaderPhone);

    // 1. Search registry for matching team (exact doc id first, then scan)
    const exactDoc = await db.collection('registry').doc(normTeam).get();
    let matchedDoc = exactDoc.exists ? exactDoc : null;

    if (!matchedDoc) {
      const allRegSnap = await db.collection('registry').get();
      for (const doc of allRegSnap.docs) {
        const data = doc.data();
        const docTeamKey = data.teamKey || normStr(data.teamName);
        if (docTeamKey === normTeam) {
          matchedDoc = doc;
          break;
        }
      }
    }

    if (!matchedDoc) {
      return res.status(404).json({ error: 'Team not found' });
    }

    const regData = matchedDoc.data();
    const teamId = regData.teamId || regData.teamKey || matchedDoc.id;

    // 2. Validate phone number (last 10 digits comparison)
    const dbLast10 = getLast10Digits(regData.leaderPhone);
    if (!inputLast10 || inputLast10.length < 10 || dbLast10 !== inputLast10) {
      return res.status(401).json({ error: 'Phone number does not match' });
    }

    // 3. Member name validation
    const hasPreassigned = Boolean(regData.leaderName || regData.member2Name);
    let actualMemberName = cleanYourName;
    const cleanMemberKey = normStr(cleanYourName);

    if (hasPreassigned) {
      const assigned = [regData.leaderName, regData.member2Name].filter(Boolean);
      const matched = assigned.find((a) => normStr(a) === cleanMemberKey);
      if (!matched) {
        return res.status(403).json({ error: 'Name not recognised' });
      }
      actualMemberName = matched;
    } else {
      // Open claiming (up to 2 members)
      const claimed = regData.claimedMembers || [];
      const existingClaim = claimed.find((c) => normStr(c) === cleanMemberKey);
      if (existingClaim) {
        actualMemberName = existingClaim;
      } else {
        if (claimed.length >= 2) {
          return res.status(403).json({ error: 'This team already has 2 members.' });
        }
        actualMemberName = cleanYourName;
        claimed.push(actualMemberName);
        await matchedDoc.ref.update({
          claimedMembers: claimed,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
    }

    // 4. Team document and per-member board
    const teamRef = db.collection('teams').doc(teamId);
    let teamDoc = await teamRef.get();

    if (!teamDoc.exists) {
      // First member draws initial 5 problems per tier
      const { board, seenIds } = await drawMemberBoard(null, []);
      const membersMap = {
        [cleanMemberKey]: {
          name: actualMemberName,
          board,
          seenIds,
          refreshToken: true,
        },
      };

      const initialTeamData = {
        name: regData.teamName || cleanTeamName,
        teamKey: normTeam,
        totalDamage: 0,
        acceptedSolves: 0,
        totalSubmits: 0,
        penalties: 0,
        lastSolveAt: null,
        solvedProblemIds: [],
        members: membersMap,
        board, // legacy fallback
        seenIds,
        refreshToken: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };
      await teamRef.set(initialTeamData);
      teamDoc = await teamRef.get();
    } else {
      const currentData = teamDoc.data();
      const members = { ...(currentData.members || {}) };

      if (!members[cleanMemberKey] || !members[cleanMemberKey].board) {
        // Draw board for this member avoiding teammate's board where possible
        const teammateKey = Object.keys(members).find((k) => k !== cleanMemberKey);
        const teammateBoard = teammateKey ? members[teammateKey]?.board : null;

        const { board, seenIds } = await drawMemberBoard(teammateBoard, currentData.solvedProblemIds || []);

        members[cleanMemberKey] = {
          name: actualMemberName,
          board,
          seenIds,
          refreshToken: true,
        };

        await teamRef.update({
          members,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        teamDoc = await teamRef.get();
      }
    }

    const teamData = teamDoc.data();
    const memberData = teamData.members?.[cleanMemberKey] || {
      name: actualMemberName,
      board: teamData.board || { dagger: [], axe: [], catapult: [], ballista: [] },
      refreshToken: true,
    };

    // 5. Sign session token tied to (team, member)
    const token = signToken({
      teamId,
      teamName: teamData.name || regData.teamName || cleanTeamName,
      memberName: actualMemberName,
      memberKey: cleanMemberKey,
    });

    return res.status(200).json({
      token,
      team: {
        id: teamId,
        name: teamData.name || regData.teamName || cleanTeamName,
        memberName: actualMemberName,
        board: memberData.board,
        refreshToken: memberData.refreshToken ?? true,
        solvedProblemIds: teamData.solvedProblemIds || [],
        totalDamage: teamData.totalDamage || 0,
        acceptedSolves: teamData.acceptedSolves || 0,
        totalSubmits: teamData.totalSubmits || 0,
        penalties: teamData.penalties || 0,
        memberSolvedCount: memberData.solvedCount || 0,
        teamSolvedCount: (teamData.solvedProblemIds || []).length,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Login failed: ' + err.message });
  }
}
