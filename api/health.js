import { db, admin } from './_lib/firebaseAdmin.js';
import { checkRunnerHealth } from './_lib/runner.js';

let lastHealthCheckTime = 0;
let lastRunnerOk = true;

export default async function handler(req, res) {
  const now = Date.now();
  // Throttle health check pings to at most once per 10 seconds
  if (now - lastHealthCheckTime > 10000) {
    const isOk = await checkRunnerHealth();
    lastRunnerOk = isOk;
    lastHealthCheckTime = now;

    try {
      await db.collection('public').doc('state').set(
        {
          runnerOk: isOk,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
    } catch (e) {
      console.warn('Failed to update runnerOk in public/state:', e.message);
    }
  }

  return res.status(200).json({
    runnerOk: lastRunnerOk,
    timestamp: now,
  });
}

