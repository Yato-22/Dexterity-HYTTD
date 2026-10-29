import { db, admin } from '../firebaseAdmin.js';
import { verifyAdmin } from '../auth.js';
import { drawInitialBoard } from '../pool.js';

function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const rows = [];

  for (const line of lines) {
    const cols = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        cols.push(current.trim().replace(/^["']|["']$/g, ''));
        current = '';
      } else {
        current += char;
      }
    }
    cols.push(current.trim().replace(/^["']|["']$/g, ''));
    rows.push(cols);
  }

  return rows;
}

// Clean phone string (handles Excel scientific notation like 9.87654E+09)
function cleanPhoneNumber(raw) {
  if (!raw) return '';
  let str = String(raw).trim().replace(/^["']|["']$/g, '');
  if (/^\d+(\.\d+)?[eE]\+\d+$/.test(str)) {
    try {
      str = String(Math.round(Number(str)));
    } catch (_) {}
  }
  return str.replace(/\D/g, '');
}

// Extract last 10 significant digits
function getSignificantDigits(digits) {
  const s = String(digits || '').replace(/^0+/, '');
  return s.length > 10 ? s.slice(-10) : s;
}

// Intelligently parse member names (e.g. "Hiccup & Astrid", "Hiccup, Astrid")
function splitMemberNames(str) {
  if (!str) return [];
  const clean = str.replace(/^["']|["']$/g, '').trim();
  if (!clean) return [];
  // Split on '&', 'and', ',', '/', '+'
  const parts = clean
    .split(/\s*(&|\band\b|,|\/|\+)\s*/i)
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !/^(&|\band\b|,|\/|\+)$/i.test(s));
  return parts.length > 0 ? parts : [clean];
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
  if (!verifyAdmin(req)) return res.status(401).json({ error: 'Unauthorized: Invalid admin credentials' });

  const csvContent = req.body?.csv || (typeof req.body === 'string' ? req.body : null);
  if (!csvContent) {
    return res.status(400).json({ error: 'CSV data is required (field: csv).' });
  }

  const rows = parseCSV(csvContent);
  if (rows.length === 0) {
    return res.status(400).json({ error: 'CSV is empty.' });
  }

  // Detect header and map columns
  let startIdx = 0;
  let teamColIdx = 0;
  let phoneColIdx = 1;
  let leaderColIdx = 2;
  let member2ColIdx = 3;

  const headerRow = rows[0].map((c) => c.toLowerCase().trim());
  const isHeader = headerRow.some((c) =>
    c.includes('name') || c.includes('phone') || c.includes('team') || c.includes('leader') || c.includes('member')
  );

  if (isHeader) {
    startIdx = 1;
    headerRow.forEach((col, idx) => {
      if (col.includes('team') || col.includes('clan') || col.includes('group')) {
        teamColIdx = idx;
      } else if (col.includes('phone') || col.includes('mobile') || col.includes('contact') || col.includes('tel') || col.includes('number')) {
        phoneColIdx = idx;
      } else if (col.includes('member 2') || col.includes('member2') || col.includes('partner') || col.includes('name 2')) {
        member2ColIdx = idx;
      } else if (col.includes('leader') || col.includes('member 1') || col.includes('member1') || col.includes('name 1') || col.includes('members')) {
        leaderColIdx = idx;
      }
    });
  }

  const importedTeams = [];
  const operations = [];

  for (let i = startIdx; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length < 2) continue;

    const rawTeamName = row[teamColIdx] ? row[teamColIdx].replace(/^["']|["']$/g, '').trim() : '';
    const rawPhone = row[phoneColIdx] ? row[phoneColIdx].replace(/^["']|["']$/g, '').trim() : '';

    if (!rawTeamName || !rawPhone) continue;

    const teamName = rawTeamName.replace(/\s+/g, ' ');
    const phoneDigits = cleanPhoneNumber(rawPhone);
    const sigDigits = getSignificantDigits(phoneDigits);

    if (!phoneDigits) continue;

    // Allowed phone numbers list (handles both full digits and last 10 digits)
    const allowedPhones = Array.from(new Set([phoneDigits, sigDigits])).filter(Boolean);

    // Parse member names
    let leaderName = '';
    let member2Name = '';

    const rawLeader = row[leaderColIdx] ? row[leaderColIdx].replace(/^["']|["']$/g, '').trim() : '';
    const rawMember2 = row[member2ColIdx] ? row[member2ColIdx].replace(/^["']|["']$/g, '').trim() : '';

    if (rawLeader) {
      const split = splitMemberNames(rawLeader);
      if (split.length >= 2) {
        leaderName = split[0];
        member2Name = split[1];
      } else {
        leaderName = split[0] || '';
      }
    }

    if (!member2Name && rawMember2) {
      const split2 = splitMemberNames(rawMember2);
      member2Name = split2[0] || '';
    }

    const registeredMembers = [leaderName, member2Name].filter(Boolean);

    // Deterministic safe team ID
    const teamId =
      'team-' +
      teamName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') || `team-${Date.now()}-${i}`;

    const { board, seenIds } = await drawInitialBoard();

    operations.push({
      teamId,
      teamName,
      teamNameLower: teamName.toLowerCase(),
      leaderPhone: phoneDigits,
      allowedPhones,
      leaderName: leaderName || null,
      member2Name: member2Name || null,
      registeredMembers,
      board,
      seenIds,
    });
  }

  if (operations.length === 0) {
    return res.status(400).json({ error: 'No valid teams found in CSV. Please verify column formatting.' });
  }

  // Commit in chunks of 200 (Firestore batch max is 500 operations, 2 writes per team = 400 writes max per chunk)
  const CHUNK_SIZE = 200;
  for (let i = 0; i < operations.length; i += CHUNK_SIZE) {
    const chunk = operations.slice(i, i + CHUNK_SIZE);
    const batch = db.batch();

    for (const item of chunk) {
      // 1. Registry document (server-only)
      const regRef = db.collection('registry').doc(item.teamId);
      batch.set(
        regRef,
        {
          teamId: item.teamId,
          teamName: item.teamName,
          teamNameLower: item.teamNameLower,
          leaderPhone: item.leaderPhone,
          allowedPhones: item.allowedPhones,
          leaderName: item.leaderName,
          member2Name: item.member2Name,
          registeredMembers: item.registeredMembers,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      // 2. Team document (game state)
      const teamRef = db.collection('teams').doc(item.teamId);
      batch.set(
        teamRef,
        {
          name: item.teamName,
          totalDamage: 0,
          solvedProblemIds: [],
          lastSolveAt: null,
          board: item.board,
          seenIds: item.seenIds,
          refreshToken: true,
          members: item.registeredMembers,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      importedTeams.push({ teamName: item.teamName, teamId: item.teamId });
    }

    await batch.commit();
  }

  // Sync public/state with all teams summary so arena and leaderboard update immediately
  try {
    const teamsSnap = await db.collection('teams').get();
    const allTeamsSummary = teamsSnap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        name: data.name || d.id,
        totalDamage: data.totalDamage || 0,
        lastSolveAt: data.lastSolveAt || null,
        solvedCount: (data.solvedProblemIds || []).length,
      };
    });

    await db.collection('public').doc('state').set(
      {
        teams: allTeamsSummary,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
  } catch (syncErr) {
    console.warn('Failed to sync public/state teams after import:', syncErr.message);
  }

  return res.status(200).json({
    success: true,
    importedCount: importedTeams.length,
    teams: importedTeams,
  });
}
