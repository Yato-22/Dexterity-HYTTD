import { spawnSync } from 'child_process';
import path from 'path';

console.log('=== Dexterity 48-Problem Pool Verification (Dual Reference Solutions) ===');

const res = spawnSync('python3', [path.resolve(process.cwd(), 'scripts/generate_and_verify_48.py')], {
  stdio: 'inherit',
  encoding: 'utf8',
});

if (res.status !== 0) {
  console.error('\n✕ Pool verification FAILED: independent solutions disagreed or test case failed.');
  process.exit(1);
} else {
  console.log('\n✓ ALL 48 PROBLEMS VERIFIED! 384 test cases passed with 100% agreement between both independent Python solutions.');
  process.exit(0);
}
