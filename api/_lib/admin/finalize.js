import { db, admin } from '../firebaseAdmin.js';
import { verifyAdmin } from '../auth.js';
import { computeRankings } from '../gameState.js';
import { resolveTeamMembersAndPhone } from './export.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
  if (!verifyAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });

  try {
    // 1. Fetch all raw team documents and registry documents from Firestore
    const [dragonDoc, teamsSnap, registrySnap] = await Promise.all([
      db.collection('dragon').doc('main').get(),
      db.collection('teams').get(),
      db.collection('registry').get(),
    ]);

    const registryMap = new Map();
    registrySnap.forEach((doc) => {
      const data = doc.data() || {};
      if (doc.id) registryMap.set(doc.id.toLowerCase(), data);
      if (data.teamKey) registryMap.set(data.teamKey.toLowerCase(), data);
      if (data.teamName) registryMap.set(data.teamName.toLowerCase(), data);
    });

    const rawTeams = teamsSnap.docs.map((d) => {
      const data = d.data() || {};
      const reg = registryMap.get(d.id.toLowerCase()) ||
                  registryMap.get((data.teamKey || '').toLowerCase()) ||
                  registryMap.get((data.name || '').toLowerCase()) || {};

      const { phoneNumber, member1Name, member2Name } = resolveTeamMembersAndPhone(data, reg);

      return {
        id: d.id,
        name: data.name || d.id,
        phoneNumber,
        member1Name,
        member2Name,
        totalDamage: data.totalDamage || 0,
        acceptedSolves: data.acceptedSolves || 0,
        totalSubmits: data.totalSubmits || 0,
        penalties: data.penalties || 0,
        lastSolveAt: data.lastSolveAt || null,
        solvedCount: (data.solvedProblemIds || []).length,
      };
    });

    const dragonData = dragonDoc.exists ? dragonDoc.data() : {};
    const dragonStatus = dragonData.status || 'waiting';
    const winnerTeamId = dragonData.winnerTeamId || null;

    // 2. Compute final authoritative rankings from teams docs
    const finalRankings = computeRankings(rawTeams, dragonStatus, winnerTeamId);

    // 3. Store full authoritative results in server-only collection 'results'
    const resultsTimestamp = new Date().toISOString();
    await Promise.all([
      db.collection('results').doc('final').set({
        finalizedAt: resultsTimestamp,
        dragonStatus: 'defeated',
        winnerTeamId,
        teams: finalRankings,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      }),
      db.collection('results').doc(resultsTimestamp.replace(/[:.]/g, '-')).set({
        finalizedAt: resultsTimestamp,
        dragonStatus: 'defeated',
        winnerTeamId,
        teams: finalRankings,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      }),
      // 4. Freeze state: set dragon status to 'defeated' and update public state
      db.collection('public').doc('state').set(
        {
          dragon: {
            ...dragonData,
            status: 'defeated',
          },
          teams: finalRankings.map((t) => ({
            id: t.id,
            name: t.name,
            rank: t.rank,
            member1Name: t.member1Name,
            member2Name: t.member2Name,
            totalDamage: t.totalDamage,
            accuracy: t.accuracy,
            penalties: t.penalties,
            acceptedSolves: t.acceptedSolves,
            totalSubmits: t.totalSubmits,
            solvedCount: t.solvedCount,
            lastSolveAt: t.lastSolveAt,
            isDragonSlayer: t.isDragonSlayer,
          })),
          finalizedAt: resultsTimestamp,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      ),
    ]);

    return res.status(200).json({
      success: true,
      finalRankings,
    });
  } catch (err) {
    console.error('Finalize event error:', err);
    return res.status(500).json({ error: 'Failed to finalize event: ' + err.message });
  }
}
