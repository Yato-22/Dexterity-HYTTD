import { db, admin } from '../_lib/firebaseAdmin.js';
import { verifyAdmin } from '../_lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
  if (!verifyAdmin(req)) return res.status(401).json({ error: 'Unauthorized: Invalid admin credentials' });

  try {
    await db.collection('dragon').doc('main').set(
      {
        status: 'waiting',
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    return res.status(200).json({ success: true, status: 'waiting' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

