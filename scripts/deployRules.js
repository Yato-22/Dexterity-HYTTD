import fs from 'fs';
import path from 'path';
import { GoogleAuth } from 'google-auth-library';

// Load .env.local if not already in process.env
function loadEnvLocal() {
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
}

loadEnvLocal();

const RULES_CONTENT = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Client read-only collections
    match /public/{doc} {
      allow read: if true;
      allow write: if false;
    }
    match /dragon/{doc} {
      allow read: if true;
      allow write: if false;
    }
    match /teams/{doc} {
      allow read: if true;
      allow write: if false;
    }
    match /feed/{doc} {
      allow read: if true;
      allow write: if false;
    }

    // Block client access to server-only collections (registry, pool, problems_private, config, etc.)
    match /{document=**} {
      allow read, write: if false;
    }
  }
}`;

async function deployRules() {
  console.log('--- Deploying updated Firestore Security Rules ---');
  const saRaw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!saRaw) throw new Error('Missing FIREBASE_SERVICE_ACCOUNT');
  const creds = JSON.parse(saRaw);

  const auth = new GoogleAuth({
    credentials: creds,
    scopes: ['https://www.googleapis.com/auth/cloud-platform', 'https://www.googleapis.com/auth/firebase'],
  });
  const client = await auth.getClient();
  const token = await client.getAccessToken();

  // 1. Create new ruleset
  console.log('Creating new ruleset on Firebase Rules API...');
  const createRes = await fetch(
    `https://firebaserules.googleapis.com/v1/projects/${creds.project_id}/rulesets`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        source: {
          files: [
            {
              name: 'firestore.rules',
              content: RULES_CONTENT,
            },
          ],
        },
      }),
    }
  );

  if (!createRes.ok) {
    const errText = await createRes.text();
    throw new Error(`Failed to create ruleset: ${createRes.status} ${errText}`);
  }

  const ruleset = await createRes.json();
  console.log('Created ruleset:', ruleset.name);

  // 2. Release the new ruleset for cloud.firestore
  console.log('Releasing ruleset for cloud.firestore...');
  const releaseRes = await fetch(
    `https://firebaserules.googleapis.com/v1/projects/${creds.project_id}/releases/cloud.firestore`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        release: {
          name: `projects/${creds.project_id}/releases/cloud.firestore`,
          rulesetName: ruleset.name,
        },
      }),
    }
  );

  if (!releaseRes.ok) {
    const errText = await releaseRes.text();
    throw new Error(`Failed to release ruleset: ${releaseRes.status} ${errText}`);
  }

  const release = await releaseRes.json();
  console.log('✓ Successfully released new Firestore security rules:', release.rulesetName);

  // Write firestore.rules to disk for tracking
  fs.writeFileSync(path.resolve(process.cwd(), 'firestore.rules'), RULES_CONTENT, 'utf8');
  console.log('✓ Saved firestore.rules locally.');
  process.exit(0);
}

deployRules().catch((err) => {
  console.error('Error deploying rules:', err);
  process.exit(1);
});

