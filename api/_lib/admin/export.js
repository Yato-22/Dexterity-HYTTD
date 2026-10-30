import { db } from '../firebaseAdmin.js';
import { verifyAdmin } from '../auth.js';
import { computeRankings } from '../gameState.js';

export function resolveTeamMembersAndPhone(teamData = {}, regData = {}) {
  // 1. Phone number resolution
  const rawPhone = teamData.leaderPhone || regData.leaderPhone || regData.phone || '';
  const phoneNumber = String(rawPhone || '').trim();

  // 2. Pre-assigned members from registry or team doc
  const regLeader = (regData.leaderName || teamData.leaderName || '').trim();
  const regMember2 = (regData.member2Name || teamData.member2Name || '').trim();

  // 3. Logged in members and claimed members
  const loggedMembers = Object.values(teamData.members || {})
    .map((m) => (m && m.name ? m.name : String(m || '')))
    .filter(Boolean);
  const claimed = (regData.claimedMembers || []).filter(Boolean);

  let member1Name = regLeader;
  let member2Name = regMember2;

  if (!member1Name) {
    if (claimed.length > 0) {
      member1Name = claimed[0];
    } else if (loggedMembers.length > 0) {
      member1Name = loggedMembers[0];
    }
  }

  if (!member2Name) {
    if (claimed.length > 1) {
      member2Name = claimed.find((c) => c.toLowerCase() !== member1Name.toLowerCase()) || claimed[1] || '';
    } else if (loggedMembers.length > 1) {
      member2Name = loggedMembers.find((m) => m.toLowerCase() !== member1Name.toLowerCase()) || loggedMembers[1] || '';
    }
  }

  return {
    phoneNumber,
    member1Name: member1Name || '',
    member2Name: member2Name || '',
  };
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });
  if (!verifyAdmin(req)) return res.status(401).json({ error: 'Unauthorized: Invalid admin credentials' });

  try {
    const [dragonDoc, teamsSnap, registrySnap] = await Promise.all([
      db.collection('dragon').doc('main').get(),
      db.collection('teams').get(),
      db.collection('registry').get(),
    ]);

    const dragonData = dragonDoc.data() || {};
    const winnerTeamId = dragonData.winnerTeamId || null;
    const dragonStatus = dragonData.status || 'waiting';

    const registryMap = new Map();
    registrySnap.forEach((doc) => {
      const data = doc.data() || {};
      if (doc.id) registryMap.set(doc.id.toLowerCase(), data);
      if (data.teamKey) registryMap.set(data.teamKey.toLowerCase(), data);
      if (data.teamName) registryMap.set(data.teamName.toLowerCase(), data);
    });

    const rawTeams = teamsSnap.docs.map((doc) => {
      const data = doc.data() || {};
      const reg = registryMap.get(doc.id.toLowerCase()) ||
                  registryMap.get((data.teamKey || '').toLowerCase()) ||
                  registryMap.get((data.name || '').toLowerCase()) || {};

      const { phoneNumber, member1Name, member2Name } = resolveTeamMembersAndPhone(data, reg);

      return {
        id: doc.id,
        name: data.name || doc.id,
        phoneNumber,
        member1Name,
        member2Name,
        totalDamage: data.totalDamage || 0,
        acceptedSolves: data.acceptedSolves || 0,
        totalSubmits: data.totalSubmits || 0,
        penalties: data.penalties || 0,
        solvedProblemIds: Array.isArray(data.solvedProblemIds) ? data.solvedProblemIds : [],
        lastSolveAt: data.lastSolveAt,
      };
    });

    const rankedTeams = computeRankings(rawTeams, dragonStatus, winnerTeamId);

    const rows = [
      [
        'Rank',
        'Team Name',
        'Phone Number',
        'Member 1 Name',
        'Member 2 Name',
        'Team ID',
        'XP (Total Damage)',
        'Accuracy (%)',
        'Penalties',
        'Accepted Solves',
        'Total Submissions',
        'Last Solve Time',
        'Badge',
      ],
    ];

    rankedTeams.forEach((t) => {
      let lastSolve = '';
      if (t.lastSolveAt) {
        try {
          const date = t.lastSolveAt.toDate ? t.lastSolveAt.toDate() : new Date(t.lastSolveAt);
          lastSolve = date.toISOString();
        } catch {
          lastSolve = String(t.lastSolveAt);
        }
      }

      const badge = t.isDragonSlayer ? 'DRAGON SLAYER (COSMETIC)' : '';

      rows.push([
        t.rank,
        `"${(t.name || '').replace(/"/g, '""')}"`,
        `"${(t.phoneNumber || '').replace(/"/g, '""')}"`,
        `"${(t.member1Name || '').replace(/"/g, '""')}"`,
        `"${(t.member2Name || '').replace(/"/g, '""')}"`,
        `"${(t.id || '').replace(/"/g, '""')}"`,
        t.totalDamage,
        `${t.accuracy}%`,
        t.penalties || 0,
        t.acceptedSolves || 0,
        t.totalSubmits || 0,
        `"${lastSolve}"`,
        `"${badge}"`,
      ]);
    });

    const csvOutput = rows.map((r) => r.join(',')).join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="dexterity-standings.csv"');
    return res.status(200).send(csvOutput);
  } catch (err) {
    console.error('Export CSV error:', err);
    return res.status(500).json({ error: err.message });
  }
}
