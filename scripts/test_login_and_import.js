import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';
const ADMIN_PASSWORD = 'coffee4ever';

async function runTests() {
  console.log('========================================================');
  console.log('🧪 COMPREHENSIVE CSV IMPORT & LOGIN RESILIENCE TEST SUITE');
  console.log('========================================================\n');

  // Sample CSV representing all messy real-world organizer formats:
  const sampleCSV = `Team Name, Phone Number, Member 1, Member 2
"Thor's Hammer", +91 98111-22233, "Thor Odinson", "Loki Laufeyson"
"Valkyrie Flight", 9.82223E+09, "Brunnhilde", ""
"Iron Wolves", 09833344455, "Fenrir Greyback & Remus Lupin", ""
"Dragon Slayers", 9844455566, "Stoick The Vast", "Gobber The Belch"
"Mystic Seers", 9855566677, "", ""
`;

  // 1. Test CSV Import
  console.log('--- Step 1: Testing CSV Import on /api/admin/import-teams ---');
  const importRes = await fetch(`${BASE_URL}/api/admin/import-teams`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-password': ADMIN_PASSWORD,
    },
    body: JSON.stringify({ csv: sampleCSV }),
  });

  const importData = await importRes.json();
  if (!importRes.ok || !importData.success) {
    throw new Error(`CSV import failed: ${JSON.stringify(importData)}`);
  }
  console.log(`✓ Imported ${importData.importedCount} teams successfully!\n`);

  // 2. Test logins across scenarios
  const testCases = [
    {
      desc: 'All-caps team, no-prefix phone, first name only',
      body: { teamName: "THOR'S HAMMER", leaderPhone: '9811122233', yourName: 'Thor' },
      expectStatus: 200,
    },
    {
      desc: 'Mixed case team, dashed phone with +91, full name',
      body: { teamName: "Thor's hammer", leaderPhone: '+91 98111-22233', yourName: 'Loki Laufeyson' },
      expectStatus: 200,
    },
    {
      desc: 'Scientific notation phone in CSV (9.82223E+09) logged in with standard phone',
      body: { teamName: 'Valkyrie Flight', leaderPhone: '9822230000', yourName: 'Brunnhilde' },
      expectStatus: 200,
    },
    {
      desc: 'Second slot claiming on single-member team',
      body: { teamName: 'Valkyrie Flight', leaderPhone: '9822230000', yourName: 'Eir The Healer' },
      expectStatus: 200,
    },
    {
      desc: 'Combined members in one column ("Fenrir Greyback & Remus Lupin") - member 1 by first name',
      body: { teamName: 'Iron Wolves', leaderPhone: '9833344455', yourName: 'fenrir' },
      expectStatus: 200,
    },
    {
      desc: 'Combined members in one column - member 2 by first name',
      body: { teamName: 'Iron Wolves', leaderPhone: '09833344455', yourName: 'remus' },
      expectStatus: 200,
    },
    {
      desc: 'Open team with no pre-registered members - Member 1 claim',
      body: { teamName: 'Mystic Seers', leaderPhone: '9855566677', yourName: 'Gothi' },
      expectStatus: 200,
    },
    {
      desc: 'Open team with no pre-registered members - Member 2 claim',
      body: { teamName: 'Mystic Seers', leaderPhone: '9855566677', yourName: 'Fishlegs' },
      expectStatus: 200,
    },
    {
      desc: 'Open team - 3rd member rejected',
      body: { teamName: 'Mystic Seers', leaderPhone: '9855566677', yourName: 'Snotlout' },
      expectStatus: 403,
    },
    {
      desc: 'Phone mismatch gives helpful specific feedback',
      body: { teamName: 'Dragon Slayers', leaderPhone: '1111111111', yourName: 'Stoick' },
      expectStatus: 401,
      expectedErrorIncludes: 'leader phone number entered does not match',
    },
  ];

  console.log('--- Step 2: Testing Participant Logins Across All Edge Cases ---');
  let passed = 0;
  for (const tc of testCases) {
    await new Promise((r) => setTimeout(r, 250));
    const res = await fetch(`${BASE_URL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tc.body),
    });

    const data = await res.json();
    if (res.status === tc.expectStatus) {
      if (tc.expectedErrorIncludes && !data.error?.includes(tc.expectedErrorIncludes)) {
        console.error(`✗ ${tc.desc}: Expected error containing "${tc.expectedErrorIncludes}", got "${data.error}"`);
      } else {
        console.log(`✓ [${res.status}] ${tc.desc}`);
        passed++;
      }
    } else {
      console.error(`✗ [${res.status} vs ${tc.expectStatus}] ${tc.desc}:`, data.error || data);
    }
  }

  console.log(`\n========================================================`);
  console.log(`Results: ${passed} / ${testCases.length} tests passed!`);
  console.log(`========================================================`);
  if (passed !== testCases.length) process.exit(1);
}

runTests().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
