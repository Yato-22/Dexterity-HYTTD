import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { executePiston } from '../api/_lib/runner.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const RUNNER_URL = 'http://localhost:2000';

function normalizeOutput(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.trimEnd())
    .join('\n')
    .trim();
}

async function runWithConcurrency(items, limit, fn) {
  const results = [];
  let index = 0;
  const workers = Array.from({ length: limit }, async () => {
    while (index < items.length) {
      const i = index++;
      results[i] = await fn(items[i], i);
    }
  });
  await Promise.all(workers);
  return results;
}

async function runTest() {
  console.log('====================================================');
  console.log('       STEP 7: COMPREHENSIVE AUTOMATED VERIFICATION  ');
  console.log('====================================================\n');

  const pool = JSON.parse(fs.readFileSync(path.join(rootDir, 'data/problems_pool.json'), 'utf8'));
  const hiddenTests = JSON.parse(fs.readFileSync(path.join(rootDir, 'data/hidden_tests.json'), 'utf8'));

  const languages = ['c', 'cpp', 'java', 'py'];
  const langNames = { c: 'c', cpp: 'cpp', java: 'java', py: 'python' };

  // --------------------------------------------------------------------------
  // PART A: STARTER PROGRAM VERIFICATION (192 RUNS)
  // --------------------------------------------------------------------------
  console.log('--- PART A: Verifying 192 Starter Templates (Unchanged Starters -> Wrong Answer) ---');
  
  const starterTasks = [];
  for (const p of pool) {
    for (const lang of languages) {
      starterTasks.push({ p, lang, sample: p.samples[0] });
    }
  }

  let starterPassed = 0;
  let starterCompileErrors = 0;

  await runWithConcurrency(starterTasks, 6, async (task) => {
    const { p, lang, sample } = task;
    const tplPath = path.join(rootDir, 'data/templates', p.id, `${lang}.txt`);
    const code = fs.readFileSync(tplPath, 'utf8');

    const res = await executePiston({
      language: langNames[lang],
      code,
      stdin: sample.input,
      timeLimitMs: 3000,
      runnerUrl: RUNNER_URL,
    });

    if (res.compileError) {
      starterCompileErrors++;
      console.error(`\n[FAIL] Starter compile error: ${p.id} [${lang}]:`, res.compileError);
    } else {
      const normOut = normalizeOutput(res.stdout);
      const expected = normalizeOutput(sample.expectedOutput);
      if (normOut !== expected) {
        starterPassed++;
      } else {
        console.error(`\n[UNEXPECTED] Starter actually passed for ${p.id} [${lang}]!`);
      }
    }
  });

  console.log(`✓ Part A Result: ${starterPassed}/192 starters produced Wrong Answer (0 compile errors, ${starterCompileErrors} failures).\n`);

  if (starterCompileErrors > 0 || starterPassed !== 192) {
    throw new Error(`Part A failed: expected 192 Wrong Answer starters with 0 compile errors, got ${starterPassed} and ${starterCompileErrors}`);
  }

  // --------------------------------------------------------------------------
  // PART B: REFERENCE SOLUTIONS VERIFICATION (192 RUNS ON SAMPLE + HIDDEN TESTS)
  // --------------------------------------------------------------------------
  console.log('--- PART B: Verifying 192 Reference Solutions (100% Accepted on All 384 Test Cases) ---');

  const nativeTasks = [];
  const javaTasks = [];

  for (const p of pool) {
    const pTests = [
      ...p.samples,
      ...(hiddenTests[p.id]?.hiddenTests || [])
    ];
    for (const lang of languages) {
      if (lang === 'java') {
        javaTasks.push({ p, lang, tests: pTests });
      } else {
        nativeTasks.push({ p, lang, tests: pTests });
      }
    }
  }

  let refPassed = 0;
  let refFailed = 0;

  async function evaluateTask(task) {
    const { p, lang, tests } = task;
    const refPath = path.join(rootDir, 'data/reference', p.id, `${lang}.txt`);
    const code = fs.readFileSync(refPath, 'utf8');

    let allCasesPassed = true;
    let failureDetail = '';

    for (let tIdx = 0; tIdx < tests.length; tIdx++) {
      const tc = tests[tIdx];
      const res = await executePiston({
        language: langNames[lang],
        code,
        stdin: tc.input,
        timeLimitMs: 4000,
        runnerUrl: RUNNER_URL,
      });

      if (res.compileError) {
        allCasesPassed = false;
        failureDetail = `Compile error: ${res.compileError}`;
        break;
      }

      if (res.exitCode !== 0) {
        allCasesPassed = false;
        failureDetail = `Runtime error exit ${res.exitCode}: ${res.stderr}`;
        break;
      }

      const normOut = normalizeOutput(res.stdout);
      const normExpected = normalizeOutput(tc.expectedOutput);

      if (normOut !== normExpected) {
        allCasesPassed = false;
        failureDetail = `Wrong Answer on case ${tIdx + 1}: expected "${normExpected}", got "${normOut}"`;
        break;
      }
    }

    if (allCasesPassed) {
      refPassed++;
    } else {
      refFailed++;
      console.error(`\n[FAIL] Reference solution ${p.id} [${lang}]: ${failureDetail}`);
    }
  }

  // Run C, C++, Python tasks with concurrency 6
  console.log('Running C, C++, and Python solutions (144 runs)...');
  await runWithConcurrency(nativeTasks, 6, evaluateTask);
  console.log(`Completed native tasks. Progress: ${refPassed}/144 passed.`);

  // Run Java tasks with concurrency 2
  console.log('Running Java solutions (48 runs)...');
  await runWithConcurrency(javaTasks, 2, evaluateTask);
  console.log(`Completed Java tasks.`);

  console.log(`\n✓ Part B Result: ${refPassed}/192 reference solutions fully Accepted (${refFailed} failures).\n`);

  if (refFailed > 0 || refPassed !== 192) {
    throw new Error(`Part B failed: ${refFailed} reference solutions failed.`);
  }

  // --------------------------------------------------------------------------
  // PART C: NEGATIVE TESTS ON A SAMPLE OF 8 PROBLEMS
  // --------------------------------------------------------------------------
  console.log('--- PART C: Negative Tests on 8 Sample Problems (CE, RE, TLE) ---');
  const sample8 = pool.slice(0, 8);
  let negativeTestsPassed = 0;

  for (const p of sample8) {
    // 1. Syntax Error -> Compilation Error
    const syntaxErrCode = '#include <stdio.h>\nint main() { syntax_broken;;;';
    const ceRes = await executePiston({
      language: 'c',
      code: syntaxErrCode,
      stdin: '1 2',
      runnerUrl: RUNNER_URL,
    });
    if (ceRes.compileError || ceRes.exitCode !== 0) {
      negativeTestsPassed++;
    } else {
      console.error(`[FAIL] Expected compile error on syntax error for ${p.id}`);
    }

    // 2. Runtime Error (Division by Zero or crash) -> Runtime Error
    const reCode = '#include <stdio.h>\nint main() { volatile int z = 0; int x = 42 / z; printf("%d", x); return 0; }';
    const reRes = await executePiston({
      language: 'c',
      code: reCode,
      stdin: '1 2',
      runnerUrl: RUNNER_URL,
    });
    if (reRes.exitCode !== 0 || reRes.stderr.length > 0) {
      negativeTestsPassed++;
    } else {
      console.error(`[FAIL] Expected runtime error on divide by zero for ${p.id}`);
    }

    // 3. Time Limit Exceeded -> TLE
    const tleCode = '#include <stdio.h>\nint main() { while(1); return 0; }';
    const tleRes = await executePiston({
      language: 'c',
      code: tleCode,
      stdin: '1 2',
      timeLimitMs: 500,
      runnerUrl: RUNNER_URL,
    });
    if (tleRes.isTimeout || tleRes.exitCode === 124 || tleRes.stderr.includes('Time Limit Exceeded')) {
      negativeTestsPassed++;
    } else {
      console.error(`[FAIL] Expected timeout for ${p.id}, got:`, tleRes);
    }
  }

  console.log(`✓ Part C Result: ${negativeTestsPassed}/24 negative tests passed (8 CE, 8 RE, 8 TLE).\n`);
  if (negativeTestsPassed !== 24) {
    throw new Error(`Part C failed: expected 24 negative tests passed, got ${negativeTestsPassed}`);
  }

  console.log('====================================================');
  console.log('       ALL VERIFICATION TESTS COMPLETED SUCCESSFULLY! ');
  console.log('====================================================\n');
}

runTest().catch((err) => {
  console.error('\nVerification failed:', err);
  process.exit(1);
});
