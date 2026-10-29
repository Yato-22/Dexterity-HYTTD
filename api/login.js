import { db, admin } from './_lib/firebaseAdmin.js';
import { signToken, checkRateLimit } from './_lib/auth.js';
import { drawInitialBoard } from './_lib/pool.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const clientIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'ip';
  if (!checkRateLimit(`login-${clientIp}`, 300)) {
    return res.status(429).json({ error: 'Too many login attempts. Please wait.' });
  }

  const { teamName, leaderPhone, yourName } = req.body || {};

  if (!teamName || typeof teamName !== 'string' || !teamName.trim()) {
    return res.status(400).json({ error: 'Team Name is required.' });
  }
  if (!leaderPhone || (typeof leaderPhone !== 'string' && typeof leaderPhone !== 'number')) {
    return res.status(400).json({ error: 'Team Leader Phone Number is required.' });
  }
  if (!yourName || typeof yourName !== 'string' || !yourName.trim()) {
    return res.status(400).json({ error: 'Your Name is required.' });
  }

  const normStr = (s) => String(s || '').trim().replace(/\s+/g, ' ').toLowerCase();
  const checkPhoneMatch = (docData, inputPhone) => {
    const inPhone = String(inputPhone || '').replace(/\D/g, '');
    if (!inPhone) return false;
    const candidatePhones = [docData?.leaderPhone, ...(docData?.allowedPhones || [])].filter(Boolean);
    return candidatePhones.some((p) => {
      const dbPhone = String(p).replace(/\D/g, '');
      if (dbPhone === inPhone) return true;
      if (dbPhone.length >= 7 && inPhone.length >= 7 && (dbPhone.endsWith(inPhone) || inPhone.endsWith(dbPhone))) return true;
      return false;
    });
  };

  const cleanTeamName = teamName.trim();
  const cleanYourName = yourName.trim();
  const targetTeamLower = normStr(teamName);
  const targetYourLower = normStr(yourName);
  const targetPhoneDigits = String(leaderPhone).replace(/\D/g, '');

  try {
    // 1. Look up registry entry by normalized teamName and phone number
    // Query registry by teamNameLower first
    const nameQuery = await db
      .collection('registry')
      .where('teamNameLower', '==', targetTeamLower)
      .get();

    let regDoc = null;
    for (const doc of nameQuery.docs) {
      const data = doc.data();
      if (checkPhoneMatch(data, leaderPhone)) {
        regDoc = doc;
        break;
      }
    }

    // Fallback: search by phone query if teamName had slight spacing differences
    if (!regDoc && targetPhoneDigits) {
      const phoneQuery = await db
        .collection('registry')
        .where('leaderPhone', '==', targetPhoneDigits)
        .get();
      for (const doc of phoneQuery.docs) {
        const data = doc.data();
        if (normStr(data.teamName) === targetTeamLower || normStr(data.teamNameLower) === targetTeamLower) {
          regDoc = doc;
          break;
        }
      }
    }

    // Comprehensive in-memory fallback across registry (guarantees case-insensitivity & formatting tolerance)
    if (!regDoc) {
      const allReg = await db.collection('registry').get();
      for (const doc of allReg.docs) {
        const data = doc.data();
        const docTeam = normStr(data.teamName || data.teamNameLower);
        if (docTeam === targetTeamLower && checkPhoneMatch(data, leaderPhone)) {
          regDoc = doc;
          break;
        }
      }
    }

    if (!regDoc) {
      return res.status(401).json({
        error: 'Invalid Team Name or Leader Phone Number. Please check your credentials.',
      });
    }

    const regData = regDoc.data();
    const teamId = regData.teamId || regDoc.id;

    // 2. Member Slot Validation (strictly case-insensitive)
    const hasFixedNames = Boolean(regData.leaderName || regData.member2Name);
    let matchedMemberName = cleanYourName;

    if (hasFixedNames) {
      const isLeader = regData.leaderName && normStr(regData.leaderName) === targetYourLower;
      const isMember2 = regData.member2Name && normStr(regData.member2Name) === targetYourLower;

      if (!isLeader && !isMember2) {
        return res.status(403).json({
          error: `The name '${cleanYourName}' does not match the registered members for this team.`,
        });
      }
      // Use the canonical casing registered in the system (or fallback to entered name)
      matchedMemberName = isLeader ? regData.leaderName.trim() : regData.member2Name.trim();
    } else {
      // Open claiming (up to 2 members)
      const claimed = regData.registeredMembers || [];
      const existingMatch = claimed.find((m) => normStr(m) === targetYourLower);

      if (existingMatch) {
        matchedMemberName = existingMatch;
      } else {
        if (claimed.length >= 2) {
          return res.status(403).json({
            error: 'This team already has 2 registered members.',
          });
        }
        // Claim slot
        const updatedClaimed = [...claimed, cleanYourName];
        await regDoc.ref.update({
          registeredMembers: updatedClaimed,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        matchedMemberName = cleanYourName;
      }
    }

    // 3. Team Document and Board (draw board once on first login, NEVER re-roll on reloads)
    const teamRef = db.collection('teams').doc(teamId);
    let teamDoc = await teamRef.get();

    if (!teamDoc.exists) {
      const { board, seenIds } = await drawInitialBoard();
      const initialTeamData = {
        name: regData.teamName || cleanTeamName,
        totalDamage: 0,
        solvedProblemIds: [],
        lastSolveAt: null,
        board,
        seenIds,
        refreshToken: true,
        members: [matchedMemberName],
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };
      await teamRef.set(initialTeamData);
      teamDoc = await teamRef.get();
    } else {
      const currentData = teamDoc.data();
      const currentMembers = Array.isArray(currentData.members)
        ? currentData.members
        : (typeof currentData.members === 'string' ? currentData.members.split(/[&,]+/).map(s => s.trim()) : []);
      const needsMemberAdd = !currentMembers.some((m) => normStr(m) === targetYourLower);
      const needsBoardInit = !currentData.board || !currentData.board.dagger || currentData.board.dagger.length === 0;

      let updates = null;
      if (needsMemberAdd || needsBoardInit) {
        updates = { updatedAt: admin.firestore.FieldValue.serverTimestamp() };
        if (needsMemberAdd) {
          updates.members = [...currentMembers, matchedMemberName];
        }
        if (needsBoardInit) {
          const { board, seenIds } = await drawInitialBoard();
          updates.board = board;
          updates.seenIds = seenIds;
          if (currentData.refreshToken === undefined) {
            updates.refreshToken = true;
          }
        }
        await teamRef.update(updates);
        teamDoc = await teamRef.get();
      }
    }

    const teamData = teamDoc.data();

    // 4. Sign JWT session token tied to (team, member)
    const token = signToken({
      teamId,
      teamName: teamData.name || cleanTeamName,
      memberName: matchedMemberName,
    });

    return res.status(200).json({
      token,
      team: {
        id: teamId,
        name: teamData.name || cleanTeamName,
        memberName: matchedMemberName,
        board: teamData.board,
        refreshToken: teamData.refreshToken ?? true,
        solvedProblemIds: teamData.solvedProblemIds || [],
        totalDamage: teamData.totalDamage || 0,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Login failed: ' + err.message });
  }
}
