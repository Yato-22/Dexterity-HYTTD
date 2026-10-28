import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

// Quietly load .env.local into process.env in local dev if not already present
function loadEnvLocal() {
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
}

loadEnvLocal();

// Initialize Firebase Admin once
if (!admin.apps.length) {
  let credential;
  const sa = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (sa) {
    try {
      if (sa.trim().startsWith('{')) {
        credential = admin.credential.cert(JSON.parse(sa));
      } else {
        const decoded = Buffer.from(sa, 'base64').toString('utf8');
        if (decoded.trim().startsWith('{')) {
          credential = admin.credential.cert(JSON.parse(decoded));
        } else {
          // If a file path was provided
          credential = admin.credential.cert(sa);
        }
      }
    } catch (e) {
      console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT:', e.message);
    }
  }

  if (!credential) {
    credential = admin.credential.applicationDefault();
  }

  admin.initializeApp({ credential });
}

export const db = admin.firestore();
export { admin };
