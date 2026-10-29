import { db, admin } from '../firebaseAdmin.js';
import { verifyAdmin } from '../auth.js';

export default async function handler(req, res) {
  if (!verifyAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });

  const settingsRef = db.collection('config').doc('settings');

  if (req.method === 'GET') {
    try {
      const snap = await settingsRef.get();
      const data = snap.exists ? snap.data() : { compilationPenalty: true };
      return res.status(200).json(data);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === 'POST') {
    const { compilationPenalty } = req.body || {};
    try {
      await settingsRef.set(
        {
          compilationPenalty: compilationPenalty ?? true,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
      return res.status(200).json({ success: true, compilationPenalty: compilationPenalty ?? true });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
