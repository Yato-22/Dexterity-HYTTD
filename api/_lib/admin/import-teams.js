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
      if (char === '"' || char === "'") {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        cols.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    cols.push(current.trim());
    rows.push(cols);
  }

  return rows;
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

  // Check if first line is a header
  let startIdx = 0;
  const firstRow = rows[0].map((c) => c.toLowerCase());
  if (firstRow.some((c) => c.includes('name') || c.includes('phone') || c.includes('team') || c.includes('leader'))) {
    startIdx = 1;
  }

  let importedCount = 0;
  const importedTeams = [];
  const batch = db.batch();

  for (let i = startIdx; i < rows.length; i++) {
    const row = rows[i];
    if (row.length < 2) continue;

    // Columns: teamName, leaderPhone, [leaderName], [member2Name]
    const teamName = row[0].replace(/^["']|["']$/g, '').trim();
    const leaderPhoneRaw = row[1].replace(/^["']|["']$/g, '').trim();
    const leaderPhone = leaderPhoneRaw.replace(/\D/g, ''); // digits only

    const leaderName = row[2] ? row[2].replace(/^["']|["']$/g, '').trim() : '';
    const member2Name = row[3] ? row[3].replace(/^["']|["']$/g, '').trim() : '';

    if (!teamName || !leaderPhone) continue;

    // Generate safe deterministic teamId
    const teamId =
      'team-' +
      teamName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') || 'team-' + Date.now() + '-' + i;

    // 1. Store in server-only collection 'registry'
    const regRef = db.collection('registry').doc(teamId);
    batch.set(
      regRef,
      {
        teamId,
        teamName,
        teamNameLower: teamName.trim().replace(/\s+/g, ' ').toLowerCase(),
        leaderPhone, // digits only, server-only
        leaderName: leaderName || null,
        member2Name: member2Name || null,
        registeredMembers: leaderName ? [leaderName, ...(member2Name ? [member2Name] : [])] : [],
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    // 2. Also prepare initial team document in 'teams'
    const teamRef = db.collection('teams').doc(teamId);
    const { board, seenIds } = await drawInitialBoard();
    batch.set(
      teamRef,
      {
        name: teamName,
        totalDamage: 0,
        solvedProblemIds: [],
        lastSolveAt: null,
        board,
        seenIds,
        refreshToken: true,
        members: leaderName ? [leaderName, ...(member2Name ? [member2Name] : [])] : [],
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    importedTeams.push({ teamName, teamId });
    importedCount++;
  }

  await batch.commit();

  return res.status(200).json({
    success: true,
    importedCount,
    teams: importedTeams,
  });
}
