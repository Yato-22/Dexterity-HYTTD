import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';

// Quietly load .env.local into process.env in local dev if not already present
try {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        let val = trimmed.slice(eqIdx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
} catch {}

const JWT_SECRET = process.env.JWT_SECRET || 'techflix-dev-secret-change-in-env';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin';

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '48h' });
}

export function verifyToken(req) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.substring(7).trim();
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

export function verifyAdmin(req) {
  const pass =
    req.headers['x-admin-password'] ||
    req.headers['admin-password'] ||
    (req.body && req.body.adminPassword) ||
    (req.query && req.query.adminPassword);

  if (!pass) return false;
  return pass === ADMIN_PASSWORD;
}

// In-memory rate limiting map: { [key: string]: timestamp }
const rateLimitMap = new Map();

export function checkRateLimit(key, minIntervalMs = 1500) {
  const now = Date.now();
  const lastTime = rateLimitMap.get(key) || 0;
  if (now - lastTime < minIntervalMs) {
    return false; // rate limited
  }
  rateLimitMap.set(key, now);
  // cleanup old keys
  if (rateLimitMap.size > 2000) {
    for (const [k, t] of rateLimitMap.entries()) {
      if (now - t > 60000) rateLimitMap.delete(k);
    }
  }
  return true;
}
