import fs from 'fs';
import path from 'path';

// Load .env.local if present
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
        if (!process.env[key]) process.env[key] = val;
      }
    }
  }
} catch {}

const TARGET_URL = (process.env.TARGET_URL || 'http://localhost:3000').replace(/\/+$/, '');
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin';
const NUM_TEAMS = 40;

console.log('====================================================');
console.log(` TechFlix Dragon Battle Load Test (40 Fake Teams)`);
console.log(` Target Site: ${TARGET_URL}`);
console.log('====================================================');

// Sample test codes for Dagger problems
const CODE_SAMPLES = [
  // Correct Python (sum-of-two-numbers)
  {
    problemId: 'sum-of-two-numbers',
    language: 'python',
    code: 'import sys\nt = sys.stdin.read().split()\nif t: print(int(t[0]) + int(t[1]))',
    expectPass: true,
  },
  // Wrong Python (sum-of-two-numbers)
  {
    problemId: 'sum-of-two-numbers',
    language: 'python',
    code: 'print(42)',
    expectPass: false,
  },
  // Correct C++ (even-or-odd)
  {
    problemId: 'even-or-odd',
    language: 'cpp',
    code: '#include <iostream>\nusing namespace std;\nint main() { int n; if (cin >> n) cout << (n % 2 == 0 ? "EVEN" : "ODD") << endl; return 0; }',
    expectPass: true,
  },
  // Correct Java (largest-of-three)
  {
    problemId: 'largest-of-three',
    language: 'java',
    code: 'import java.util.Scanner;\npublic class Main {\n  public static void main(String[] args) {\n    Scanner sc = new Scanner(System.in);\n    if (sc.hasNextInt()) {\n      int a = sc.nextInt(), b = sc.nextInt(), c = sc.nextInt();\n      System.out.println(Math.max(a, Math.max(b, c)));\n    }\n  }\n}',
    expectPass: true,
  },
  // Compilation Error C++
  {
    problemId: 'sum-of-two-numbers',
    language: 'cpp',
    code: '#include <iostream>\nint main() { syntax error here }',
    expectPass: false,
  },
];

async function runLoadTest() {
  // 1. Generate CSV for 40 TEST_ teams
  console.log(`\n[Step 1] Preparing CSV for ${NUM_TEAMS} TEST_ teams...`);
  const csvLines = ['teamName,leaderPhone,leaderName,member2Name'];
  const testTeamsMeta = [];

  for (let i = 1; i <= NUM_TEAMS; i++) {
    const pad = String(i).padStart(2, '0');
    const teamName = `TEST_Warband_${pad}`;
    const phone = `99900000${pad}`;
    const leaderName = `Leader_${pad}`;
    const member2 = `Scout_${pad}`;
    csvLines.push(`${teamName},${phone},${leaderName},${member2}`);
    testTeamsMeta.push({ teamName, phone, leaderName, member2 });
  }

  // Import into registry via /api/admin/import-teams
  console.log('[Step 2] Importing 40 test teams into server registry...');
  const importRes = await fetch(`${TARGET_URL}/api/admin/import-teams`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-password': ADMIN_PASSWORD,
    },
    body: JSON.stringify({ csv: csvLines.join('\n') }),
  });

  if (!importRes.ok) {
    const errText = await importRes.text();
    throw new Error(`Failed to import test teams (HTTP ${importRes.status}): ${errText}`);
  }
  console.log('✓ Successfully registered 40 TEST_ teams in server registry.');

  // Ensure battle is started / live
  await fetch(`${TARGET_URL}/api/admin/start`, {
    method: 'POST',
    headers: { 'x-admin-password': ADMIN_PASSWORD },
  }).catch(() => {});

  // 2. Log in all 40 fake teams in parallel
  console.log('\n[Step 3] Logging in 40 fake teams in parallel...');
  const loginPromises = testTeamsMeta.map(async (meta, idx) => {
    const res = await fetch(`${TARGET_URL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        teamName: meta.teamName,
        leaderPhone: meta.phone,
        yourName: meta.leaderName,
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Login failed for ${meta.teamName}: ${err}`);
    }
    const data = await res.json();
    return {
      meta,
      token: data.token,
      team: data.team,
    };
  });

  const loggedInTeams = await Promise.all(loginPromises);
  console.log(`✓ All ${loggedInTeams.length} teams logged in successfully with valid session tokens.`);

  // 3. Fire 40 parallel submits
  console.log('\n[Step 4] Firing 40 PARALLEL submissions through live site API (/api/submit)...');
  console.log('Testing concurrency, runner response, rate limits, and transactions...');

  const startTime = Date.now();
  const submitPromises = loggedInTeams.map(async (teamInfo, idx) => {
    const sample = CODE_SAMPLES[idx % CODE_SAMPLES.length];
    const teamBoard = teamInfo.team.board || {};

    // Select problem from team's board, or fallback to sample
    let targetProblemId = sample.problemId;
    const allBoardIds = [
      ...(teamBoard.dagger || []),
      ...(teamBoard.axe || []),
      ...(teamBoard.catapult || []),
      ...(teamBoard.ballista || []),
    ];
    if (allBoardIds.length > 0 && !allBoardIds.includes(targetProblemId)) {
      targetProblemId = allBoardIds[0];
    }

    const reqStart = Date.now();
    try {
      const res = await fetch(`${TARGET_URL}/api/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${teamInfo.token}`,
        },
        body: JSON.stringify({
          language: sample.language,
          code: sample.code,
          problemId: targetProblemId,
        }),
      });

      const reqDuration = Date.now() - reqStart;
      const data = await res.json().catch(() => ({}));

      return {
        team: teamInfo.meta.teamName,
        problemId: targetProblemId,
        language: sample.language,
        status: res.status,
        verdict: data.verdict || (res.ok ? 'OK' : 'ERROR'),
        durationMs: reqDuration,
        ok: res.ok,
        data,
      };
    } catch (err) {
      const reqDuration = Date.now() - reqStart;
      return {
        team: teamInfo.meta.teamName,
        problemId: targetProblemId,
        language: sample.language,
        status: 0,
        verdict: 'NETWORK_ERROR',
        durationMs: reqDuration,
        ok: false,
        error: err.message,
      };
    }
  });

  const results = await Promise.all(submitPromises);
  const totalElapsed = Date.now() - startTime;

  // 4. Compute statistics
  const durations = results.map((r) => r.durationMs).sort((a, b) => a - b);
  const minTime = durations[0];
  const maxTime = durations[durations.length - 1];
  const avgTime = Math.round(durations.reduce((a, b) => a + b, 0) / durations.length);
  const p95Index = Math.min(Math.floor(durations.length * 0.95), durations.length - 1);
  const p95Time = durations[p95Index];

  const successfulResponses = results.filter((r) => r.ok).length;
  const errorResponses = results.filter((r) => !r.ok).length;

  console.log('\n====================================================');
  console.log('              LOAD TEST RESULTS (40 Submits)');
  console.log('====================================================');
  console.log(` Total Wall Time:   ${totalElapsed} ms`);
  console.log(` Successful (2xx):  ${successfulResponses} / ${results.length}`);
  console.log(` Errors (4xx/5xx):  ${errorResponses}`);
  console.log('----------------------------------------------------');
  console.log(` Min Latency:       ${minTime} ms`);
  console.log(` Avg Latency:       ${avgTime} ms`);
  console.log(` p95 Latency:       ${p95Time} ms`);
  console.log(` Max Latency:       ${maxTime} ms`);
  console.log('====================================================');

  console.log('\nSample Verdict Distribution:');
  const verdictCounts = {};
  results.forEach((r) => {
    verdictCounts[r.verdict] = (verdictCounts[r.verdict] || 0) + 1;
  });
  console.table(verdictCounts);

  console.log('\nRun `node scripts/cleanupTestTeams.js` to purge test data and reset.');
  process.exit(0);
}

runLoadTest().catch((err) => {
  console.error('\nLoad test failed:', err.message);
  process.exit(1);
});

