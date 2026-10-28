import path from 'path';
import fs from 'fs';
import { executePiston, getRunnerUrl } from '../api/_lib/runner.js';
import { normalizeOutput, compareOutputs } from '../src/services/judge.js';

// Load .env.local if present
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

// Test cases for Easy problem: two-sum (Dual Anchor Forge)
const SAMPLE_TESTS = [
  {
    input: "4 9\n2 7 11 15",
    expectedOutput: "1 2"
  },
  {
    input: "3 6\n3 2 4",
    expectedOutput: "2 3"
  }
];

const SOLUTIONS = {
  python: {
    correct: `import sys

def main():
    data = sys.stdin.read().split()
    if not data: return
    n, target = int(data[0]), int(data[1])
    arr = [int(x) for x in data[2:2+n]]
    seen = {}
    for i, x in enumerate(arr, 1):
        if target - x in seen:
            print(f"{seen[target - x]} {i}")
            return
        seen[x] = i

if __name__ == "__main__":
    main()`,
    wrong: `print("999 999")`
  },
  c: {
    correct: `#include <stdio.h>

int main() {
    int n; long long target;
    if (scanf("%d %lld", &n, &target) != 2) return 0;
    long long a[n];
    for (int i = 0; i < n; i++) scanf("%lld", &a[i]);
    for (int i = 0; i < n; i++) {
        for (int j = i + 1; j < n; j++) {
            if (a[i] + a[j] == target) {
                printf("%d %d\\n", i + 1, j + 1);
                return 0;
            }
        }
    }
    return 0;
}`,
    wrong: `#include <stdio.h>
int main() {
    printf("0 0\\n");
    return 0;
}`
  },
  cpp: {
    correct: `#include <iostream>
#include <vector>
#include <unordered_map>
using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    int n; long long target;
    if (!(cin >> n >> target)) return 0;
    vector<long long> a(n);
    for (int i = 0; i < n; i++) cin >> a[i];
    unordered_map<long long, int> seen;
    for (int i = 0; i < n; i++) {
        if (seen.count(target - a[i])) {
            cout << seen[target - a[i]] << " " << (i + 1) << "\\n";
            return 0;
        }
        seen[a[i]] = i + 1;
    }
    return 0;
}`,
    wrong: `#include <iostream>
using namespace std;
int main() {
    cout << "999 999\\n";
    return 0;
}`
  },
  java: {
    correct: `import java.io.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws Exception {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String line = br.readLine();
        if (line == null) return;
        StringTokenizer st = new StringTokenizer(line);
        int n = Integer.parseInt(st.nextToken());
        long target = Long.parseLong(st.nextToken());
        st = new StringTokenizer(br.readLine());
        Map<Long, Integer> seen = new HashMap<>();
        for (int i = 1; i <= n; i++) {
            long val = Long.parseLong(st.nextToken());
            if (seen.containsKey(target - val)) {
                System.out.println(seen.get(target - val) + " " + i);
                return;
            }
            seen.put(val, i);
        }
    }
}`,
    wrong: `public class Main {
    public static void main(String[] args) {
        System.out.println("0 0");
    }
}`
  }
};

async function evaluateSolution(language, code) {
  let passedCount = 0;
  let totalTime = 0;

  for (let i = 0; i < SAMPLE_TESTS.length; i++) {
    const tc = SAMPLE_TESTS[i];
    const res = await executePiston({
      language,
      code,
      stdin: tc.input,
      timeLimitMs: 2000,
    });

    if (res.compileError) {
      return { verdict: 'COMPILATION_ERROR', error: res.compileError };
    }
    if (res.isTimeout) {
      return { verdict: 'TIME_LIMIT_EXCEEDED', timeMs: res.timeMs };
    }
    if (res.exitCode !== 0 && res.stderr) {
      return { verdict: 'RUNTIME_ERROR', error: res.stderr };
    }

    totalTime += res.timeMs || 0;
    if (compareOutputs(res.stdout, tc.expectedOutput)) {
      passedCount++;
    } else {
      return {
        verdict: 'WRONG_ANSWER',
        failingCase: i + 1,
        expected: tc.expectedOutput,
        actual: res.stdout.trim(),
      };
    }
  }

  return {
    verdict: 'ACCEPTED',
    passedCount,
    totalCount: SAMPLE_TESTS.length,
    avgTimeMs: Math.round(totalTime / SAMPLE_TESTS.length),
  };
}

async function runSelfTest() {
  console.log('====================================================');
  console.log('🐉 TECHFLIX RUNNER SELF-TEST (ALL 4 LANGUAGES)');
  console.log('Testing Easy Problem: two-sum (Dual Anchor Forge)');
  console.log('Does NOT touch or modify any real team data.');
  console.log('====================================================\n');

  const runnerUrl = await getRunnerUrl();
  console.log(`Configured Runner Address: ${runnerUrl || '(None - please set in config/runner)'}\n`);

  if (!runnerUrl) {
    console.error('❌ Cannot run self-test: Runner URL is not set in Firestore config/runner.');
    console.error('Please configure the runner URL in /admin first.');
    process.exit(1);
  }

  const languages = ['python', 'c', 'cpp', 'java'];
  let allPassed = true;

  for (const lang of languages) {
    console.log(`Testing Language: [${lang.toUpperCase()}]`);

    // 1. Correct Solution
    try {
      const correctRes = await evaluateSolution(lang, SOLUTIONS[lang].correct);
      const isAccepted = correctRes.verdict === 'ACCEPTED';
      const mark = isAccepted ? '✓' : '✗';
      console.log(`  ${mark} Correct Solution: ${correctRes.verdict} (Wall Time: ${correctRes.avgTimeMs || 0}ms)`);
      if (!isAccepted) {
        console.log('    Details:', correctRes);
        allPassed = false;
      }
    } catch (err) {
      console.log(`  ✗ Correct Solution Error: ${err.message}`);
      allPassed = false;
    }

    // 2. Wrong Solution
    try {
      const wrongRes = await evaluateSolution(lang, SOLUTIONS[lang].wrong);
      const isWrongAnswer = wrongRes.verdict === 'WRONG_ANSWER';
      const mark = isWrongAnswer ? '✓' : '✗';
      console.log(`  ${mark} Wrong Solution:   ${wrongRes.verdict} (Expected: WRONG_ANSWER)`);
      if (!isWrongAnswer) {
        console.log('    Details:', wrongRes);
        allPassed = false;
      }
    } catch (err) {
      console.log(`  ✗ Wrong Solution Error: ${err.message}`);
      allPassed = false;
    }

    console.log('');
  }

  console.log('====================================================');
  if (allPassed) {
    console.log('🎉 ALL FOUR LANGUAGES (Python, C, C++, Java) VERIFIED!');
  } else {
    console.log('⚠️ Some tests failed. Check runner connection or compiler support.');
  }
  console.log('====================================================');
}

runSelfTest().catch(console.error);

