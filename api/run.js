import { executePiston } from './_lib/runner.js';
import { checkRateLimit } from './_lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const clientIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'ip';
  if (!checkRateLimit(`run-${clientIp}`, 1000)) {
    return res.status(429).json({ error: 'Please wait a moment between code runs.' });
  }

  const { language, code, stdin = '', timeLimitMs = 2000 } = req.body || {};

  if (!language || typeof language !== 'string') {
    return res.status(400).json({ error: 'Language is required.' });
  }

  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'Code is required.' });
  }

  if (code.length > 65536) {
    return res.status(400).json({ error: 'Code size exceeds maximum 64KB.' });
  }

  try {
    const result = await executePiston({
      language,
      code,
      stdin,
      timeLimitMs: Math.min(5000, Number(timeLimitMs) || 2000),
    });

    return res.status(200).json(result);
  } catch (err) {
    console.error('Run execution error:', err);
    return res.status(500).json({
      error: err.message,
      stdout: '',
      stderr: err.message,
      exitCode: 1,
    });
  }
}
