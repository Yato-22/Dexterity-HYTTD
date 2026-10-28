import { db, admin } from '../_lib/firebaseAdmin.js';
import { verifyAdmin } from '../_lib/auth.js';

function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const rows = [];

  for (const line of lines) {
    // Simple CSV parser handling quotes
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
  if (firstRow.some((c) => c.includes('name') || c.includes('code') || c.includes('team'))) {
    startIdx = 1;
  }

  let importedCount = 0;
  const importedTeams = [];
  const batch = db.batch();

  for (let i = startIdx; i < rows.length; i++) {
    const row = rows[i];
    if (row.length < 2) continue;

    const teamName = row[0].replace(/^["']|["']$/g, '').trim();
    const teamCode = row[1].replace(/^["']|["']$/g, '').trim().toUpperCase();
    const members = row[2] ? row[2].replace(/^["']|["']$/g, '').trim() : '';

    if (!teamName || !teamCode) continue;

    // Generate safe deterministic teamId
    const teamId =
      'team-' +
      teamName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') || 'team-' + Date.now() + '-' + i;

    const teamRef = db.collection('teams').doc(teamId);
    batch.set(
      teamRef,
      {
        name: teamName,
        members,
        totalDamage: 0,
        solvedProblemIds: [],
        lastSolveAt: null,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    const codeRef = db.collection('teamCodes').doc(teamCode);
    batch.set(codeRef, {
      teamId,
      teamName,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    importedCount++;
    importedTeams.push({ teamId, teamName, teamCode, members });
  }

  try {
    await batch.commit();
    return res.status(200).json({
      success: true,
      count: importedCount,
      teams: importedTeams,
    });
  } catch (err) {
    console.error('Import teams failed:', err);
    return res.status(500).json({ error: err.message });
  }
}
