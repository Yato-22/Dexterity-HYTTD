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
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 8000);

      // run_timeout <= 3000, compile_timeout <= 10000, memory limits omitted
      const response = await fetch(`${testUrl}/api/v2/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          language: 'python',
          version: '*',
          files: [{ name: 'main.py', content: testPythonCode }],
          stdin: '',
          run_timeout: 2000,
          compile_timeout: 10000,
        }),
      });

      clearTimeout(timer);

      // If Piston returns 400 or other non-2xx, extract its exact message instead of failing silently
      if (!response.ok) {
        let errorMsg = `HTTP ${response.status}`;
        try {
          const errData = await response.json();
          errorMsg = errData.message || errData.error || JSON.stringify(errData);
        } catch (_) {
          const txt = await response.text().catch(() => '');
          if (txt) errorMsg = txt.trim();
        }
        return res.status(200).json({
          success: false,
          status: response.status,
          error: errorMsg,
          output: `Piston Error (${response.status}): ${errorMsg}`,
        });
      }

      const data = await response.json();
      const output = data.run?.stdout || data.run?.output || data.run?.stderr || JSON.stringify(data);

      return res.status(200).json({
        success: data.run?.code === 0,
        status: response.status,
        output: output.trim(),
        version: data.version,
      });
    } catch (testErr) {
      return res.status(200).json({
        success: false,
        error: testErr.message,
        output: `Connection Error: ${testErr.message}`,
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
