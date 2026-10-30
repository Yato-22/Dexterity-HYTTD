import fs from 'fs';
import path from 'path';
import { db } from '../api/_lib/firebaseAdmin.js';

async function restore(backupTimestamp) {
  if (!backupTimestamp) {
    console.error('Usage: node scripts/restoreFirestore.js <backupTimestamp>');
    process.exit(1);
  }

  const backupDir = path.resolve(process.cwd(), 'backups', backupTimestamp);
  if (!fs.existsSync(backupDir)) {
    console.error(`Backup directory not found: ${backupDir}`);
    process.exit(1);
  }

  const collections = ['teams', 'registry', 'public', 'dragon', 'feed', 'pool'];

  for (const colName of collections) {
    const filePath = path.join(backupDir, `${colName}.json`);
    if (!fs.existsSync(filePath)) continue;

    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    console.log(`Restoring collection '${colName}' (${Object.keys(data).length} documents)...`);

    // Optional: write in batches
    for (const [docId, docData] of Object.entries(data)) {
      await db.collection(colName).doc(docId).set(docData);
    }
  }

  // Restore hidden tests file
  const hiddenSrc = path.join(backupDir, 'hidden_tests.json');
  const hiddenDest = path.resolve(process.cwd(), 'data', 'hidden_tests.json');
  if (fs.existsSync(hiddenSrc)) {
    fs.copyFileSync(hiddenSrc, hiddenDest);
    console.log('Restored data/hidden_tests.json');
  }

  console.log('✓ Firestore restore completed successfully.');
}

const targetTimestamp = process.argv[2];
restore(targetTimestamp).then(() => process.exit(0)).catch((err) => {
  console.error('Restore failed:', err);
  process.exit(1);
});
