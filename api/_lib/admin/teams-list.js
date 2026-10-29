import { db } from '../firebaseAdmin.js';
import { verifyAdmin } from '../auth.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });
  if (!verifyAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const [regSnap, teamsSnap] = await Promise.all([
      db.collection('registry').get(),
      db.collection('teams').get(),
    ]);

    const teamsMap = {};
    teamsSnap.docs.forEach((doc) => {
      teamsMap[doc.id] = doc.data();
    });

    const result = regSnap.docs.map((doc) => {
      const reg = doc.data();
      const teamId = doc.id;
      const team = teamsMap[teamId] || {};

      const membersObj = team.members || {};
      const loggedInMembers = Object.values(membersObj).map((m) => m.name || m);
      const isOnline = loggedInMembers.length > 0;

      const registeredMembers = [
        reg.leaderName,
        reg.member2Name,
        ...(reg.claimedMembers || []),
        ...(reg.registeredMembers || []),
      ].filter(Boolean);

      const uniqueRegistered = Array.from(new Set(registeredMembers));

      const memberNamesWithSolves = uniqueRegistered.map((name) => {
        const normKey = String(name).trim().replace(/\s+/g, ' ').toLowerCase();
        const memObj = membersObj[normKey] || Object.values(membersObj).find(m => (m.name || '').toLowerCase() === name.toLowerCase());
        const solved = memObj?.solvedCount || 0;
        return `${name} (${solved} solved)`;
      });

      const memberDetails = Object.values(membersObj).map((m) => {
        const name = m.name || 'Member';
        const solved = m.solvedCount || 0;
        return `${name} (${solved} solved)`;
      });

      const displayMemberNames = memberNamesWithSolves.length > 0
        ? memberNamesWithSolves.join(', ')
        : (memberDetails.length > 0 ? memberDetails.join(', ') : 'None assigned');

      const totalSubmits = team.totalSubmits || 0;
      const acceptedSolves = team.acceptedSolves || 0;
      const accuracy = totalSubmits > 0 ? Math.round((acceptedSolves / totalSubmits) * 1000) / 10 : 0;

      return {
        id: teamId,
        teamName: reg.teamName || team.name || teamId,
        memberNames: displayMemberNames,
        isLoggedIn: isOnline,
        loggedInMembers: loggedInMembers.join(', ') || 'None',
        totalDamage: team.totalDamage || 0,
        acceptedSolves,
        totalSubmits,
        penalties: team.penalties || 0,
        accuracy,
      };
    });

    return res.status(200).json({ teams: result });
  } catch (err) {
    console.error('Fetch teams list error:', err);
    return res.status(500).json({ error: err.message });
  }
}

