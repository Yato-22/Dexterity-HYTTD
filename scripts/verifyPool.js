import { execSync, spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('=== TechFlix Problem Pool Verification ===');

const poolPath = path.resolve(process.cwd(), 'data/problems_pool.json');
const hiddenPath = path.resolve(process.cwd(), 'data/hidden_tests.json');
const solutionsPath = path.resolve(process.cwd(), 'data/reference_solutions.json');

if (!fs.existsSync(poolPath) || !fs.existsSync(hiddenPath) || !fs.existsSync(solutionsPath)) {
  console.error('Error: Data files missing. Please generate pool data first.');
  process.exit(1);
}

const pool = JSON.parse(fs.readFileSync(poolPath, 'utf8'));
const hiddenData = JSON.parse(fs.readFileSync(hiddenPath, 'utf8'));
const solutions = JSON.parse(fs.readFileSync(solutionsPath, 'utf8'));

let totalRuns = 0;
let failedRuns = 0;

function runPython(code, input) {
  const res = spawnSync('python3', ['-c', code], {
    input: input,
    encoding: 'utf8',
    timeout: 5000,
  });
  if (res.error) throw res.error;
  if (res.status !== 0) throw new Error(res.stderr || 'Non-zero exit code');
  return res.stdout.trim();
}

console.log(`Verifying 32 problems (${pool.length} total) across all sample and hidden test cases...`);

for (const prob of pool) {
  const pId = prob.id;
  const solData = solutions[pId];
  if (!solData) {
    console.error(`Missing reference solutions for problem ${pId}`);
    process.exit(1);
  }
  const samples = prob.samples || [];
  const hidden = hiddenData[pId]?.hiddenTests || [];
  const allTests = [...samples, ...hidden];

  process.stdout.write(`- [${prob.tier.toUpperCase()}] ${prob.title} (${pId}): `);

  let pFailures = 0;
  for (let i = 0; i < allTests.length; i++) {
    totalRuns++;
    const test = allTests[i];
    const expected = test.expectedOutput.trim();

    try {
      const out1 = runPython(solData.sol1, test.input);
      const out2 = runPython(solData.sol2, test.input);

      if (out1 !== expected || out2 !== expected || out1 !== out2) {
        console.log(`\n  FAILED on test ${i + 1} (${test.name || 'Test'}):`);
        console.log(`    Expected: ${JSON.stringify(expected)}`);
        console.log(`    Sol 1:    ${JSON.stringify(out1)}`);
        console.log(`    Sol 2:    ${JSON.stringify(out2)}`);
        pFailures++;
        failedRuns++;
      }
    } catch (err) {
      console.log(`\n  ERROR executing test ${i + 1}: ${err.message}`);
      pFailures++;
      failedRuns++;
    }
  }

  if (pFailures === 0) {
    console.log(`PASSED (${allTests.length}/${allTests.length} tests)`);
  }
}

console.log('\n==========================================');
if (failedRuns === 0) {
  console.log(`✓ ALL ${totalRuns} TEST EXECUTIONS PASSED!`);
  console.log('✓ Both reference solutions produce 100% identical outputs for all 32 problems.');
  process.exit(0);
} else {
  console.error(`✕ FAILED: ${failedRuns} test failures out of ${totalRuns} executions.`);
  process.exit(1);
}

