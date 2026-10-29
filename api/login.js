import { db, admin } from './_lib/firebaseAdmin.js';
import { signToken, checkRateLimit } from './_lib/auth.js';
import { drawInitialBoard } from './_lib/pool.js';

// Normalization & matching utilities
function normStr(str) {
  return String(str || '').trim().replace(/\s+/g, ' ').toLowerCase();
}

function cleanAlphaNumeric(str) {
  return String(str || '').replace(/[^a-z0-9]/gi, '').toLowerCase();
}

function teamNameMatches(dbName, inputName) {
  if (!dbName || !inputName) return false;
  if (normStr(dbName) === normStr(inputName)) return true;
  if (cleanAlphaNumeric(dbName) === cleanAlphaNumeric(inputName)) return true;
  return false;
}

function getSignificantDigits(raw) {
  const digits = String(raw || '').replace(/\D/g, '').replace(/^0+/, '');
  return digits.length > 10 ? digits.slice(-10) : digits;
}

function checkPhoneMatch(docData, inputPhone) {
  const inDigits = String(inputPhone || '').replace(/\D/g, '');
  const inSig = getSignificantDigits(inDigits);
  if (!inDigits) return false;

  const candidatePhones = [
    docData?.leaderPhone,
    ...(docData?.allowedPhones || []),
    docData?.phone,
  ].filter(Boolean);

  return candidatePhones.some((p) => {
    const dbDigits = String(p).replace(/\D/g, '');
    const dbSig = getSignificantDigits(dbDigits);
    if (!dbDigits) return false;

    // 1. Exact digit match
    if (dbDigits === inDigits) return true;
    // 2. Significant 10-digit match (strips country codes or leading 0s)
    if (dbSig && inSig && dbSig === inSig) return true;
    // 3. Suffix tolerance (for at least 7 digits)
    if (dbDigits.length >= 7 && inDigits.length >= 7) {
      if (dbDigits.endsWith(inDigits) || inDigits.endsWith(dbDigits)) return true;
    }
    return false;
  });
}

function memberNameMatches(regName, inputName) {
  if (!regName || !inputName) return false;
  const nReg = normStr(regName);
  const nIn = normStr(inputName);

  if (nReg === nIn) return true;
  if (cleanAlphaNumeric(nReg) === cleanAlphaNumeric(nIn)) return true;

  const regWords = nReg.split(/\s+/).filter(Boolean);
  const inWords = nIn.split(/\s+/).filter(Boolean);

  if (inWords.length === 1 && regWords.includes(inWords[0])) return true;
  if (regWords.length === 1 && inWords.includes(regWords[0])) return true;
  if (regWords.length > 0 && inWords.length > 0 && regWords[0] === inWords[0]) return true;

  return false;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const clientIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'ip';
  const cleanTeamName = (req.body?.teamName || '').trim();
  const cleanYourName = (req.body?.yourName || '').trim();
  const leaderPhone = req.body?.leaderPhone;

  // Rate limit per team per IP (ensures entire college/venue WiFi isn't throttled simultaneously)
  const rateLimitKey = `login-${clientIp}-${normStr(cleanTeamName)}`;
  if (!checkRateLimit(rateLimitKey, 150)) {
    return res.status(429).json({ error: 'Too many rapid login attempts for this team. Please wait a moment.' });
  }

  if (!cleanTeamName || typeof cleanTeamName !== 'string') {
    return res.status(400).json({ error: 'Team Name is required.' });
  }
  if (!leaderPhone || (typeof leaderPhone !== 'string' && typeof leaderPhone !== 'number')) {
    return res.status(400).json({ error: 'Team Leader Phone Number is required.' });
  }
  if (!cleanYourName || typeof cleanYourName !== 'string') {
    return res.status(400).json({ error: 'Your Name is required.' });
  }

  try {
    // 1. Search registry
    const allRegSnap = await db.collection('registry').get();
    let matchedDoc = null;
    let partialTeamMatchDoc = null;
    let partialPhoneMatchDoc = null;

    for (const doc of allRegSnap.docs) {
      const data = doc.data();
      const tMatch = teamNameMatches(data.teamName || data.teamNameLower, cleanTeamName);
      const pMatch = checkPhoneMatch(data, leaderPhone);

      if (tMatch && pMatch) {
        matchedDoc = doc;
        break;
      }
      if (tMatch && !partialTeamMatchDoc) partialTeamMatchDoc = doc;
      if (pMatch && !partialPhoneMatchDoc) partialPhoneMatchDoc = doc;
    }

    // If team exists in registry but phone didn't match, reject immediately with precise error
    if (!matchedDoc && partialTeamMatchDoc) {
      return res.status(401).json({
        error: `Found team '${partialTeamMatchDoc.data().teamName}', but the leader phone number entered does not match our records.`,
      });
    }

    // Fallback: If not found in registry at all, check if legacy doc exists in teams collection
    if (!matchedDoc) {
      const allTeamsSnap = await db.collection('teams').get();
      for (const doc of allTeamsSnap.docs) {
        const data = doc.data();
        if (teamNameMatches(data.name, cleanTeamName)) {
          // Double check registry doc doesn't exist under this ID
          const existingReg = allRegSnap.docs.find((d) => d.id === doc.id);
          if (!existingReg) {
            const newTeamId = doc.id;
            const phoneDigits = String(leaderPhone).replace(/\D/g, '');
            const regRef = db.collection('registry').doc(newTeamId);
            await regRef.set(
              {
                teamId: newTeamId,
                teamName: data.name,
                teamNameLower: normStr(data.name),
                leaderPhone: phoneDigits,
                allowedPhones: [phoneDigits, getSignificantDigits(phoneDigits)],
                registeredMembers: Array.isArray(data.members)
                  ? data.members
                  : typeof data.members === 'string'
                  ? data.members.split(/[&,]+/).map((s) => s.trim())
                  : [],
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
              },
              { merge: true }
            );

            matchedDoc = await regRef.get();
            break;
          }
        }
      }
    }

    // Precise feedback if still not matched
    if (!matchedDoc) {
      if (partialPhoneMatchDoc) {
        return res.status(401).json({
          error: `Phone number is registered to team '${partialPhoneMatchDoc.data().teamName}'. Please check the team name entered.`,
        });
      }
      return res.status(401).json({
        error: 'Invalid Team Name or Leader Phone Number. Please check your credentials.',
      });
    }

    const regData = matchedDoc.data();
    const teamId = regData.teamId || matchedDoc.id;

    // 2. Member validation
    const registeredPool = [
      regData.leaderName,
      regData.member2Name,
      ...(regData.registeredMembers || []),
    ].filter(Boolean);

    const uniquePool = [];
    registeredPool.forEach((p) => {
      if (!uniquePool.some((u) => normStr(u) === normStr(p))) {
        uniquePool.push(p);
      }
    });

    let matchedMemberName = cleanYourName;

    if (uniquePool.length > 0) {
      const existing = uniquePool.find((m) => memberNameMatches(m, cleanYourName));
      if (existing) {
        matchedMemberName = existing;
      } else {
        // If team has fewer than 2 members claimed, allow this person to join
        if (uniquePool.length < 2) {
          uniquePool.push(cleanYourName);
          await matchedDoc.ref.update({
            registeredMembers: uniquePool,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
          matchedMemberName = cleanYourName;
        } else {
          return res.status(403).json({
            error: `The name '${cleanYourName}' does not match registered members (${uniquePool.join(', ')}).`,
          });
        }
      }
    } else {
      // Open claiming (up to 2 members)
      const claimed = regData.claimedMembers || [];
      const existing = claimed.find((m) => memberNameMatches(m, cleanYourName));
      if (existing) {
        matchedMemberName = existing;
      } else {
        if (claimed.length >= 2) {
          return res.status(403).json({
            error: `This team already has 2 registered members (${claimed.join(', ')}).`,
          });
        }
        claimed.push(cleanYourName);
        await matchedDoc.ref.update({
          claimedMembers: claimed,
          registeredMembers: claimed,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        matchedMemberName = cleanYourName;
      }
    }

    // 3. Team Document and Board
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
        : typeof currentData.members === 'string'
        ? currentData.members.split(/[&,]+/).map((s) => s.trim())
        : [];
      const needsMemberAdd = !currentMembers.some((m) => memberNameMatches(m, cleanYourName));
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
