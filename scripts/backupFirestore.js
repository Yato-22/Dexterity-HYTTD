import fs from 'fs';
import path from 'path';
import { db } from '../api/_lib/firebaseAdmin.js';

async function backup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.resolve(process.cwd(), 'backups', timestamp);
  fs.mkdirSync(backupDir, { recursive: true });

  const collections = ['teams', 'registry', 'public', 'dragon', 'feed', 'pool'];
  const summary = [];

  for (const colName of collections) {
    const snap = await db.collection(colName).get();
    const docs = {};
    snap.forEach((doc) => {
      docs[doc.id] = doc.data();
    });

    const filePath = path.join(backupDir, `${colName}.json`);
    const jsonStr = JSON.stringify(docs, null, 2);
    fs.writeFileSync(filePath, jsonStr, 'utf8');

    const stats = fs.statSync(filePath);
    summary.push({
      collection: colName,
      docCount: snap.size,
      path: filePath,
      sizeBytes: stats.size,
    });
  }

  // Copy current hidden tests file
  const hiddenTestsSrc = path.resolve(process.cwd(), 'data', 'hidden_tests.json');
  const hiddenTestsDest = path.join(backupDir, 'hidden_tests.json');
  if (fs.existsSync(hiddenTestsSrc)) {
    fs.copyFileSync(hiddenTestsSrc, hiddenTestsDest);
    const stats = fs.statSync(hiddenTestsDest);
    summary.push({
      collection: 'hidden_tests_file',
      docCount: 1,
      path: hiddenTestsDest,
      sizeBytes: stats.size,
    });
  }

  console.log('=== FIREBASE BACKUP COMPLETED ===');
  console.log(`Directory: ${backupDir}`);
  console.table(summary);

  return { backupDir, summary };
}

backup().then(() => process.exit(0)).catch((err) => {
  console.error('Backup failed:', err);
  process.exit(1);
});

