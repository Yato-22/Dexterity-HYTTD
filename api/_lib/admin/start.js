import { db, admin } from '../firebaseAdmin.js';
import { verifyAdmin } from '../auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
  if (!verifyAdmin(req)) return res.status(401).json({ error: 'Unauthorized: Invalid admin credentials' });

  try {
    const timestamp = admin.firestore.FieldValue.serverTimestamp();

    await Promise.all([
      db.collection('public').doc('state').set(
        {
          dragon: { status: 'live' },
          updatedAt: timestamp,
        },
        { merge: true }
      ),
      db.collection('dragon').doc('main').set(
        {
          status: 'live',
          updatedAt: timestamp,
        },
        { merge: true }
      ),
    ]);

    return res.status(200).json({ success: true, status: 'live' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
