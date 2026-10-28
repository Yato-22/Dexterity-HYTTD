import { db, admin } from '../_lib/firebaseAdmin.js';
import { verifyAdmin } from '../_lib/auth.js';
import { getRunnerUrl, invalidateRunnerUrlCache, executePiston } from '../_lib/runner.js';

export default async function handler(req, res) {
  if (!verifyAdmin(req)) {
    return res.status(401).json({ error: 'Unauthorized: Invalid admin credentials' });
  }

  // GET: return current runner URL
  if (req.method === 'GET') {
    try {
      const url = await getRunnerUrl();
      return res.status(200).json({ url });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { action, url } = req.body || {};

  // Action: Test runner with a small Python script
  if (action === 'test') {
    let testUrl = (url || (await getRunnerUrl())).trim().replace(/\/+$/, '').replace(/\/api\/v2\/execute\/?$/, '');
    if (!testUrl) {
      return res.status(400).json({ error: 'No runner URL provided to test.' });
    }

    try {
      const testPythonCode = 'import sys\nprint("Piston Runner Online! Python", sys.version.split()[0])';
      const result = await executePiston({
        language: 'python',
        code: testPythonCode,
        stdin: '',
        timeLimitMs: 2000,
        runnerUrl: testUrl,
      });

      if (result.compileError) {
        return res.status(200).json({
          success: false,
          status: 200,
          error: result.compileError,
          output: `Compilation Error: ${result.compileError}`,
        });
      }

      const isSuccess = result.exitCode === 0;
      const output = (result.stdout || result.stderr || '').trim();

      return res.status(200).json({
        success: isSuccess,
        status: 200,
        output: output || (isSuccess ? 'Piston Runner Online!' : 'Execution failed'),
      });
    } catch (testErr) {
      return res.status(200).json({
        success: false,
        status: testErr.status || 400,
        error: testErr.message,
        output: `Runner Error (${testErr.status || 400}): ${testErr.message}`,
      });
    }
  }

  // Action: Save runner URL to config/runner
  if (action === 'save' || !action) {
    if (typeof url !== 'string') {
      return res.status(400).json({ error: 'url must be a string' });
    }

    const cleanUrl = url.trim().replace(/\/+$/, '');
    try {
      await db.collection('config').doc('runner').set({
        url: cleanUrl,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      invalidateRunnerUrlCache();

      return res.status(200).json({
        success: true,
        url: cleanUrl,
        message: 'Runner URL updated successfully.',
      });
    } catch (saveErr) {
      return res.status(500).json({ error: saveErr.message });
    }
  }

  return res.status(400).json({ error: 'Invalid action. Supported: test, save.' });
}
