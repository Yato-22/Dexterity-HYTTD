import fetch from 'node-fetch';
import { db } from '../api/_lib/firebaseAdmin.js';

const BASE_URL = process.env.TARGET_URL || 'http://localhost:3000';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'coffee4ever';

async function runStep2Test() {
  console.log('===============================================================');
  console.log('🧪 STEP 2 EXACT SPECIFICATION VERIFICATION TEST');
  console.log('===============================================================');

  const csvContent = [
    'teamName,leaderPhone,leaderName,member2Name',
    'TEST_TwoMembers,9876543210,Hiccup,Astrid',
    'TEST_SoloTeam,9876543211,Fishlegs,',
    'TEST_NoNames,9876543212,,',
    'TEST_Plus91Team,"+91 98765 43213",Snotlout,Ruffnut',
    'TEST_TwoMembers,9876543210,Hiccup,Astrid', // duplicate row
    'TEST_BadRow,12345,,',                      // bad row (<10 digits)
  ].join('\n');

  console.log('\n[1] Importing CSV with 2-member, solo, no-names, +91 phone, duplicate, and bad row...');
  const importRes = await fetch(`${BASE_URL}/api/admin/import-teams`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-password': ADMIN_PASSWORD,
    },
    body: JSON.stringify({ csv: csvContent }),
  });

  const importData = await importRes.json();
  console.log('Import summary:', JSON.stringify(importData.summary));
  if (importData.summary.imported !== 4 || importData.summary.skippedCount !== 2) {
    throw new Error(`Expected 4 imported, 2 skipped, got ${importData.summary.imported} and ${importData.summary.skippedCount}`);
  }
  console.log('✓ Import correctly processed valid rows and skipped duplicate and bad rows.');

  // Helper login
  async function login(teamName, phone, yourName) {
    await new Promise((r) => setTimeout(r, 200));
    const res = await fetch(`${BASE_URL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teamName, leaderPhone: phone, yourName }),
    });
    return { status: res.status, data: await res.json() };
  }

  console.log('\n[2] Testing logins:');

  // Case A: Two-member team
  const resA1 = await login('TEST_TwoMembers', '9876543210', 'Hiccup');
  if (resA1.status !== 200 || !resA1.data.token) throw new Error('Hiccup login failed: ' + JSON.stringify(resA1));
  console.log('✓ Two-member team: Member 1 (Hiccup) logged in');

  const resA2 = await login('TEST_TwoMembers', '9876543210', 'Astrid');
  if (resA2.status !== 200 || !resA2.data.token) throw new Error('Astrid login failed: ' + JSON.stringify(resA2));
  console.log('✓ Two-member team: Member 2 (Astrid) logged in');

  const resA3 = await login('TEST_TwoMembers', '9876543210', 'Gobber');
  if (resA3.status !== 403 || resA3.data.error !== 'Name not recognised') throw new Error('Expected 403 Name not recognised, got: ' + JSON.stringify(resA3));
  console.log('✓ Two-member team: Unrecognized name rejected with 403 "Name not recognised"');

  // Case B: Solo team
  const resB1 = await login('TEST_SoloTeam', '9876543211', 'Fishlegs');
  if (resB1.status !== 200 || !resB1.data.token) throw new Error('Fishlegs login failed: ' + JSON.stringify(resB1));
  console.log('✓ Solo team: Member 1 (Fishlegs) logged in');

  const resB2 = await login('TEST_SoloTeam', '9876543211', 'Tuffnut');
  if (resB2.status !== 403 || resB2.data.error !== 'Name not recognised') throw new Error('Expected 403 Name not recognised for solo team, got: ' + JSON.stringify(resB2));
  console.log('✓ Solo team: Second member rejected with 403 "Name not recognised"');

  // Case C: Team with no names (open claiming up to 2)
  const resC1 = await login('TEST_NoNames', '9876543212', 'Viking Alpha');
  if (resC1.status !== 200 || !resC1.data.token) throw new Error('Viking Alpha claim failed: ' + JSON.stringify(resC1));
  console.log('✓ No-names team: Slot 1 claimed by Viking Alpha');

  const resC2 = await login('TEST_NoNames', '9876543212', 'Viking Beta');
  if (resC2.status !== 200 || !resC2.data.token) throw new Error('Viking Beta claim failed: ' + JSON.stringify(resC2));
  console.log('✓ No-names team: Slot 2 claimed by Viking Beta');

  const resC3 = await login('TEST_NoNames', '9876543212', 'Viking Gamma');
  if (resC3.status !== 403 || resC3.data.error !== 'This team already has 2 members.') throw new Error('Expected 403 This team already has 2 members., got: ' + JSON.stringify(resC3));
  console.log('✓ No-names team: Slot 3 rejected with 403 "This team already has 2 members."');

  // Case D: +91 phone formatting
  const resD1 = await login('TEST_Plus91Team', '9876543213', 'Snotlout'); // standard digits
  if (resD1.status !== 200 || !resD1.data.token) throw new Error('Snotlout login with standard digits failed: ' + JSON.stringify(resD1));

  const resD2 = await login('TEST_Plus91Team', '+91 98765 43213', 'Ruffnut'); // formatted digits
  if (resD2.status !== 200 || !resD2.data.token) throw new Error('Ruffnut login with formatted digits failed: ' + JSON.stringify(resD2));
  console.log('✓ Phone matching works interchangeably with "+91 98765 43213" and "9876543213"');

  // Clean up test data
  const testIds = ['test_twomembers', 'test_soloteam', 'test_nonames', 'test_plus91team'];
  for (const id of testIds) {
    await db.collection('registry').doc(id).delete();
    await db.collection('teams').doc(id).delete();
  }
  console.log('\n✓ Cleaned up all Step 2 test documents.');
  console.log('===============================================================');
  console.log('🎉 ALL STEP 2 SPECIFICATION CHECKS PASSED!');
  console.log('===============================================================');
}

runStep2Test().then(() => process.exit(0)).catch((e) => {
  console.error('Test failed:', e);
  process.exit(1);
});

