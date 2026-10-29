import { db, admin } from '../firebaseAdmin.js';
import { verifyAdmin } from '../auth.js';
import { drawInitialBoard } from '../pool.js';

export function parseCSV(text) {
  if (!text) return [];
  // Strip UTF-8 BOM
  const cleanText = text.replace(/^\uFEFF/, '');
  const lines = cleanText.split(/\r?\n/).filter((l) => l.trim().length > 0);
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

export function cleanDigits(raw) {
  if (!raw) return '';
  let str = String(raw).trim().replace(/^["']|["']$/g, '');
  // Handles Excel scientific notation e.g. 9.87654E+09
  if (/^\d+(\.\d+)?[eE]\+\d+$/.test(str)) {
    try {
      str = String(Math.round(Number(str)));
    } catch (_) {}
  }
  return str.replace(/\D/g, '');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
  if (!verifyAdmin(req)) return res.status(401).json({ error: 'Unauthorized: Invalid admin credentials' });

  const { csv, replaceAll = false, previewOnly = false } = req.body || {};
  if (!csv || typeof csv !== 'string') {
    return res.status(400).json({ error: 'CSV data is required (field: csv).' });
  }

  const rows = parseCSV(csv);
  if (rows.length === 0) {
    return res.status(400).json({ error: 'CSV is empty.' });
  }

  // Detect header row
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

  const validRows = [];
  const skipped = [];
  const seenFileTeamKeys = new Set();

  for (let i = startIdx; i < rows.length; i++) {
    const rowNum = i + 1;
    const row = rows[i];
    if (!row || row.length === 0 || row.every((c) => !c.trim())) continue;

    const rawTeamName = row[teamColIdx] ? row[teamColIdx].replace(/^["']|["']$/g, '').trim() : '';
    const rawPhone = row[phoneColIdx] ? row[phoneColIdx].replace(/^["']|["']$/g, '').trim() : '';
    const leaderName = row[leaderColIdx] ? row[leaderColIdx].replace(/^["']|["']$/g, '').trim() : '';
    const member2Name = row[member2ColIdx] ? row[member2ColIdx].replace(/^["']|["']$/g, '').trim() : '';

    if (!rawTeamName || !rawPhone) {
      skipped.push({
        row: rowNum,
        teamName: rawTeamName || '(Empty)',
        reason: 'Missing team name or phone number',
      });
      continue;
    }

    const teamKey = rawTeamName.replace(/\s+/g, ' ').toLowerCase();
    const phoneDigits = cleanDigits(rawPhone);

    if (phoneDigits.length < 10) {
      skipped.push({
        row: rowNum,
        teamName: rawTeamName,
        reason: `Invalid phone: ${rawPhone} (fewer than 10 digits)`,
      });
      continue;
    }

    if (seenFileTeamKeys.has(teamKey)) {
      skipped.push({
        row: rowNum,
        teamName: rawTeamName,
        reason: 'Duplicate team name within file',
      });
      continue;
    }

    seenFileTeamKeys.add(teamKey);

    validRows.push({
      row: rowNum,
      teamName: rawTeamName.replace(/\s+/g, ' '),
      teamKey,
      leaderPhone: phoneDigits,
      leaderName: leaderName || null,
      member2Name: member2Name || null,
    });
  }

  // If preview only, return parsed valid rows and skips without saving
  if (previewOnly) {
    return res.status(200).json({
      preview: true,
      totalRows: rows.length - (isHeader ? 1 : 0),
      validCount: validRows.length,
      validRows: validRows.map((r) => ({
        teamName: r.teamName,
        teamKey: r.teamKey,
        phonePreview: r.leaderPhone.slice(-10),
        leaderName: r.leaderName,
        member2Name: r.member2Name,
      })),
      skippedCount: skipped.length,
      skipped,
    });
  }

  // If replaceAll requested, delete existing registry and teams documents first
  if (replaceAll) {
    const regSnap = await db.collection('registry').get();
    const regBatch = db.batch();
    regSnap.docs.forEach((doc) => regBatch.delete(doc.ref));
    await regBatch.commit();

    const teamSnap = await db.collection('teams').get();
    const teamBatch = db.batch();
    teamSnap.docs.forEach((doc) => teamBatch.delete(doc.ref));
    await teamBatch.commit();
  }

  let importedCount = 0;
  let updatedCount = 0;

  // Process rows
  for (const item of validRows) {
    const teamDocRef = db.collection('teams').doc(item.teamKey);
    const regDocRef = db.collection('registry').doc(item.teamKey);

    const [existingTeamSnap, existingRegSnap] = await Promise.all([
      teamDocRef.get(),
      regDocRef.get(),
    ]);

    const teamExists = existingTeamSnap.exists;

    // 1. Registry Write
    await regDocRef.set(
      {
        teamName: item.teamName,
        teamKey: item.teamKey,
        leaderPhone: item.leaderPhone,
        leaderName: item.leaderName,
        member2Name: item.member2Name,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        createdAt: existingRegSnap.exists
          ? existingRegSnap.data().createdAt || admin.firestore.FieldValue.serverTimestamp()
          : admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    // 2. Team Document Write (keep progress if team already exists)
    if (teamExists) {
      updatedCount++;
      await teamDocRef.update({
        name: item.teamName,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    } else {
      importedCount++;
      const { board, seenIds } = await drawInitialBoard();
      await teamDocRef.set({
        name: item.teamName,
        teamKey: item.teamKey,
        totalDamage: 0,
        acceptedSolves: 0,
        totalSubmits: 0,
        penalties: 0,
        lastSolveAt: null,
        solvedProblemIds: [],
        members: {},
        board,
        seenIds,
        refreshToken: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
  }

  // Sync public/state with all teams summary
  try {
    const teamsSnap = await db.collection('teams').get();
    const allTeamsSummary = teamsSnap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        name: data.name || d.id,
        totalDamage: data.totalDamage || 0,
        acceptedSolves: data.acceptedSolves || 0,
        totalSubmits: data.totalSubmits || 0,
        penalties: data.penalties || 0,
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
    console.warn('Failed to sync public/state teams:', syncErr.message);
  }

  return res.status(200).json({
    success: true,
    summary: {
      imported: importedCount,
      updated: updatedCount,
      skippedCount: skipped.length,
      skipped,
    },
  });
}
