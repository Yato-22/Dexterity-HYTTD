import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const problems = JSON.parse(fs.readFileSync(path.join(rootDir, 'data/problems_pool.json'), 'utf8'));

// Problem shape definitions
const SPECS = {
  'sum-of-two-numbers': {
    shape: 'two_ints',
    vars: ['a', 'b'],
    prompt: 'Print the sum A + B'
  },
  'even-or-odd': {
    shape: 'single_int',
    vars: ['n'],
    prompt: 'Print EVEN or ODD'
  },
  'largest-of-three': {
    shape: 'three_ints',
    vars: ['a', 'b', 'c'],
    prompt: 'Print the largest number'
  },
  'count-vowels': {
    shape: 'single_string',
    vars: ['s'],
    prompt: 'Print the number of vowels in s'
  },
  'reverse-a-string': {
    shape: 'single_string',
    vars: ['s'],
    prompt: 'Print the reversed string'
  },
  'sum-of-digits': {
    shape: 'single_string',
    vars: ['n_str'],
    prompt: 'Print the sum of the digits'
  },
  'leap-year': {
    shape: 'single_int',
    vars: ['y'],
    prompt: 'Print YES or NO'
  },
  'sum-of-an-array': {
    shape: 'array',
    vars: ['n', 'arr'],
    prompt: 'Print the sum of the array elements'
  },
  'print-a-number-pattern': {
    shape: 'single_int',
    vars: ['n'],
    prompt: 'Print N lines representing the pattern'
  },
  'find-the-smallest-number': {
    shape: 'array',
    vars: ['n', 'arr'],
    prompt: 'Print the smallest element in the array'
  },
  'count-digits': {
    shape: 'single_string',
    vars: ['n_str'],
    prompt: 'Print the count of digits'
  },
  'multiplication-table': {
    shape: 'single_int',
    vars: ['n'],
    prompt: 'Print the 10 products space-separated on one line'
  },
  'palindrome-string': {
    shape: 'single_string',
    vars: ['s'],
    prompt: 'Print YES or NO'
  },
  'prime-check': {
    shape: 'single_int',
    vars: ['n'],
    prompt: 'Print YES or NO'
  },
  'second-largest-number': {
    shape: 'array',
    vars: ['n', 'arr'],
    prompt: 'Print the second largest number'
  },
  'most-frequent-character': {
    shape: 'single_string',
    vars: ['s'],
    prompt: 'Print the most frequent character'
  },
  'two-sum': {
    shape: 'n_k_array',
    vars: ['n', 'target', 'arr'],
    prompt: 'Print the two 1-based indices separated by a space'
  },
  'valid-anagram': {
    shape: 'two_strings',
    vars: ['s', 't'],
    prompt: 'Print YES or NO'
  },
  'remove-duplicates': {
    shape: 'array',
    vars: ['n', 'arr'],
    prompt: 'Print the unique elements space-separated on a single line'
  },
  'gcd-and-lcm': {
    shape: 'two_ints',
    vars: ['a', 'b'],
    prompt: 'Print GCD and LCM separated by a space'
  },
  'missing-number': {
    shape: 'missing_num',
    vars: ['n', 'arr'],
    prompt: 'Print the missing integer'
  },
  'move-zeros': {
    shape: 'array',
    vars: ['n', 'arr'],
    prompt: 'Print the elements space-separated on a single line'
  },
  'character-frequency': {
    shape: 'string_char',
    vars: ['s', 'c'],
    prompt: 'Print the integer count of occurrences of c in s'
  },
  'pair-with-given-difference': {
    shape: 'n_k_array',
    vars: ['n', 'k', 'arr'],
    prompt: 'Print YES or NO'
  },
  'valid-parentheses': {
    shape: 'single_string',
    vars: ['s'],
    prompt: 'Print YES or NO'
  },
  'binary-search': {
    shape: 'n_k_array',
    vars: ['n', 'k', 'arr'],
    prompt: 'Print the 1-based index of k, or -1 if absent'
  },
  'longest-substring-without-repeating-characters': {
    shape: 'single_string',
    vars: ['s'],
    prompt: 'Print the length as an integer'
  },
  'maximum-subarray-sum': {
    shape: 'array',
    vars: ['n', 'arr'],
    prompt: 'Print the maximum subarray sum'
  },
  'merge-intervals': {
    shape: 'intervals',
    vars: ['n', 'intervals'],
    prompt: 'Print each merged interval on a new line (start end)'
  },
  'rotate-array-by-k': {
    shape: 'n_k_array',
    vars: ['n', 'k', 'arr'],
    prompt: 'Print the rotated array elements space-separated on a single line'
  },
  'number-of-islands': {
    shape: 'grid',
    vars: ['r', 'c', 'grid'],
    prompt: 'Print the number of islands'
  },
  'subarray-sum-equals-k': {
    shape: 'n_k_array',
    vars: ['n', 'k', 'arr'],
    prompt: 'Print the total count of contiguous subarrays summing to k'
  },
  'product-of-array-except-self': {
    shape: 'array',
    vars: ['n', 'arr'],
    prompt: 'Print the N product values space-separated on a single line'
  },
  'longest-consecutive-sequence': {
    shape: 'array',
    vars: ['n', 'arr'],
    prompt: 'Print the length of the longest consecutive sequence'
  },
  'search-in-a-rotated-sorted-array': {
    shape: 'n_k_array',
    vars: ['n', 'k', 'arr'],
    prompt: 'Print the 1-based index of k, or -1 if not found'
  },
  'majority-element': {
    shape: 'array',
    vars: ['n', 'arr'],
    prompt: 'Print the majority element, or -1 if none exists'
  },
  'count-coins': {
    shape: 'n_k_array',
    vars: ['n', 'amount', 'coins'],
    prompt: 'Print the minimum number of coins, or -1 if impossible'
  },
  'longest-increasing-sequence': {
    shape: 'array',
    vars: ['n', 'arr'],
    prompt: 'Print the length of the longest strictly increasing contiguous subarray'
  },
  'compare-strings': {
    shape: 'two_strings',
    vars: ['s', 't'],
    prompt: 'Print YES or NO'
  },
  'maximum-array-sum': {
    shape: 'n_k_array',
    vars: ['n', 'w', 'arr'],
    prompt: 'Print the maximum possible sum <= w'
  },
  'common-characters': {
    shape: 'two_strings',
    vars: ['s', 't'],
    prompt: 'Print the number of distinct characters shared by both strings'
  },
  'count-positive-numbers': {
    shape: 'array',
    vars: ['n', 'arr'],
    prompt: 'Print the count of positive numbers'
  },
  'longest-palindromic-substring': {
    shape: 'single_string',
    vars: ['s'],
    prompt: 'Print the longest palindromic substring'
  },
  'second-smallest-number': {
    shape: 'array',
    vars: ['n', 'arr'],
    prompt: 'Print the second smallest number'
  },
  'maximum-difference': {
    shape: 'array',
    vars: ['n', 'arr'],
    prompt: 'Print the maximum difference, or -1 if no positive difference is possible'
  },
  'sort-by-frequency': {
    shape: 'array',
    vars: ['n', 'arr'],
    prompt: 'Print the sorted array space-separated on a single line'
  },
  'longest-common-prefix': {
    shape: 'array_strings',
    vars: ['n', 'words'],
    prompt: 'Print the longest common prefix on a single line'
  },
  'minimum-jumps': {
    shape: 'array',
    vars: ['n', 'arr'],
    prompt: 'Print the minimum number of jumps, or -1 if unreachable'
  }
};

function generateC(spec) {
  let inputCode = '';
  if (spec.shape === 'single_int') {
    const v = spec.vars[0];
    inputCode = `    int ${v};\n    if (scanf("%d", &${v}) != 1) return 0;`;
  } else if (spec.shape === 'two_ints') {
    const [v1, v2] = spec.vars;
    inputCode = `    int ${v1}, ${v2};\n    if (scanf("%d %d", &${v1}, &${v2}) != 2) return 0;`;
  } else if (spec.shape === 'three_ints') {
    const [v1, v2, v3] = spec.vars;
    inputCode = `    int ${v1}, ${v2}, ${v3};\n    if (scanf("%d %d %d", &${v1}, &${v2}, &${v3}) != 3) return 0;`;
  } else if (spec.shape === 'single_string') {
    const v = spec.vars[0];
    inputCode = `    char ${v}[1005];\n    if (scanf("%1004s", ${v}) != 1) return 0;`;
  } else if (spec.shape === 'two_strings') {
    const [v1, v2] = spec.vars;
    inputCode = `    char ${v1}[1005], ${v2}[1005];\n    if (scanf("%1004s %1004s", ${v1}, ${v2}) != 2) return 0;`;
  } else if (spec.shape === 'string_char') {
    const [v1, v2] = spec.vars;
    inputCode = `    char ${v1}[1005];\n    char ${v2};\n    if (scanf("%1004s %c", ${v1}, &${v2}) != 2) return 0;`;
  } else if (spec.shape === 'array') {
    const [vn, varr] = spec.vars;
    inputCode = `    int ${vn};\n    if (scanf("%d", &${vn}) != 1) return 0;\n    int ${varr}[1005];\n    for (int i = 0; i < ${vn}; i++) {\n        scanf("%d", &${varr}[i]);\n    }`;
  } else if (spec.shape === 'missing_num') {
    const [vn, varr] = spec.vars;
    inputCode = `    int ${vn};\n    if (scanf("%d", &${vn}) != 1) return 0;\n    int ${varr}[1005];\n    for (int i = 0; i < ${vn} - 1; i++) {\n        scanf("%d", &${varr}[i]);\n    }`;
  } else if (spec.shape === 'n_k_array') {
    const [vn, vk, varr] = spec.vars;
    inputCode = `    int ${vn}, ${vk};\n    if (scanf("%d %d", &${vn}, &${vk}) != 2) return 0;\n    int ${varr}[1005];\n    for (int i = 0; i < ${vn}; i++) {\n        scanf("%d", &${varr}[i]);\n    }`;
  } else if (spec.shape === 'intervals') {
    const [vn, varr] = spec.vars;
    inputCode = `    int ${vn};\n    if (scanf("%d", &${vn}) != 1) return 0;\n    int ${varr}[1005][2];\n    for (int i = 0; i < ${vn}; i++) {\n        scanf("%d %d", &${varr}[i][0], &${varr}[i][1]);\n    }`;
  } else if (spec.shape === 'grid') {
    const [vr, vc, vgrid] = spec.vars;
    inputCode = `    int ${vr}, ${vc};\n    if (scanf("%d %d", &${vr}, &${vc}) != 2) return 0;\n    int ${vgrid}[105][105];\n    for (int i = 0; i < ${vr}; i++) {\n        for (int j = 0; j < ${vc}; j++) {\n            scanf("%d", &${vgrid}[i][j]);\n        }\n    }`;
  } else if (spec.shape === 'array_strings') {
    const [vn, varr] = spec.vars;
    inputCode = `    int ${vn};\n    if (scanf("%d", &${vn}) != 1) return 0;\n    char ${varr}[1005][105];\n    for (int i = 0; i < ${vn}; i++) {\n        scanf("%104s", ${varr}[i]);\n    }`;
  }

  return `#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int main() {
    // ===== INPUT (do not change) =====
${inputCode}
    // ===== END INPUT =====

    // ===== WRITE YOUR CODE BELOW =====


    // ${spec.prompt}
    return 0;
}
`;
}

function generateCpp(spec) {
  let inputCode = '';
  if (spec.shape === 'single_int') {
    const v = spec.vars[0];
    inputCode = `    int ${v};\n    if (!(cin >> ${v})) return 0;`;
  } else if (spec.shape === 'two_ints') {
    const [v1, v2] = spec.vars;
    inputCode = `    int ${v1}, ${v2};\n    if (!(cin >> ${v1} >> ${v2})) return 0;`;
  } else if (spec.shape === 'three_ints') {
    const [v1, v2, v3] = spec.vars;
    inputCode = `    int ${v1}, ${v2}, ${v3};\n    if (!(cin >> ${v1} >> ${v2} >> ${v3})) return 0;`;
  } else if (spec.shape === 'single_string') {
    const v = spec.vars[0];
    inputCode = `    string ${v};\n    if (!(cin >> ${v})) return 0;`;
  } else if (spec.shape === 'two_strings') {
    const [v1, v2] = spec.vars;
    inputCode = `    string ${v1}, ${v2};\n    if (!(cin >> ${v1} >> ${v2})) return 0;`;
  } else if (spec.shape === 'string_char') {
    const [v1, v2] = spec.vars;
    inputCode = `    string ${v1};\n    char ${v2};\n    if (!(cin >> ${v1} >> ${v2})) return 0;`;
  } else if (spec.shape === 'array') {
    const [vn, varr] = spec.vars;
    inputCode = `    int ${vn};\n    if (!(cin >> ${vn})) return 0;\n    vector<int> ${varr}(${vn});\n    for (int i = 0; i < ${vn}; i++) cin >> ${varr}[i];`;
  } else if (spec.shape === 'missing_num') {
    const [vn, varr] = spec.vars;
    inputCode = `    int ${vn};\n    if (!(cin >> ${vn})) return 0;\n    vector<int> ${varr}(${vn} - 1);\n    for (int i = 0; i < ${vn} - 1; i++) cin >> ${varr}[i];`;
  } else if (spec.shape === 'n_k_array') {
    const [vn, vk, varr] = spec.vars;
    inputCode = `    int ${vn}, ${vk};\n    if (!(cin >> ${vn} >> ${vk})) return 0;\n    vector<int> ${varr}(${vn});\n    for (int i = 0; i < ${vn}; i++) cin >> ${varr}[i];`;
  } else if (spec.shape === 'intervals') {
    const [vn, varr] = spec.vars;
    inputCode = `    int ${vn};\n    if (!(cin >> ${vn})) return 0;\n    vector<pair<int, int>> ${varr}(${vn});\n    for (int i = 0; i < ${vn}; i++) cin >> ${varr}[i].first >> ${varr}[i].second;`;
  } else if (spec.shape === 'grid') {
    const [vr, vc, vgrid] = spec.vars;
    inputCode = `    int ${vr}, ${vc};\n    if (!(cin >> ${vr} >> ${vc})) return 0;\n    vector<vector<int>> ${vgrid}(${vr}, vector<int>(${vc}));\n    for (int i = 0; i < ${vr}; i++) {\n        for (int j = 0; j < ${vc}; j++) {\n            cin >> ${vgrid}[i][j];\n        }\n    }`;
  } else if (spec.shape === 'array_strings') {
    const [vn, varr] = spec.vars;
    inputCode = `    int ${vn};\n    if (!(cin >> ${vn})) return 0;\n    vector<string> ${varr}(${vn});\n    for (int i = 0; i < ${vn}; i++) cin >> ${varr}[i];`;
  }

  return `#include <iostream>
#include <vector>
#include <string>
#include <algorithm>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    // ===== INPUT (do not change) =====
${inputCode}
    // ===== END INPUT =====

    // ===== WRITE YOUR CODE BELOW =====


    // ${spec.prompt}
    return 0;
}
`;
}

function generateJava(spec) {
  let inputCode = '';
  if (spec.shape === 'single_int') {
    const v = spec.vars[0];
    inputCode = `        if (!sc.hasNextInt()) return;\n        int ${v} = sc.nextInt();`;
  } else if (spec.shape === 'two_ints') {
    const [v1, v2] = spec.vars;
    inputCode = `        if (!sc.hasNextInt()) return;\n        int ${v1} = sc.nextInt();\n        int ${v2} = sc.nextInt();`;
  } else if (spec.shape === 'three_ints') {
    const [v1, v2, v3] = spec.vars;
    inputCode = `        if (!sc.hasNextInt()) return;\n        int ${v1} = sc.nextInt();\n        int ${v2} = sc.nextInt();\n        int ${v3} = sc.nextInt();`;
  } else if (spec.shape === 'single_string') {
    const v = spec.vars[0];
    inputCode = `        if (!sc.hasNext()) return;\n        String ${v} = sc.next();`;
  } else if (spec.shape === 'two_strings') {
    const [v1, v2] = spec.vars;
    inputCode = `        if (!sc.hasNext()) return;\n        String ${v1} = sc.next();\n        String ${v2} = sc.next();`;
  } else if (spec.shape === 'string_char') {
    const [v1, v2] = spec.vars;
    inputCode = `        if (!sc.hasNext()) return;\n        String ${v1} = sc.next();\n        char ${v2} = sc.next().charAt(0);`;
  } else if (spec.shape === 'array') {
    const [vn, varr] = spec.vars;
    inputCode = `        if (!sc.hasNextInt()) return;\n        int ${vn} = sc.nextInt();\n        int[] ${varr} = new int[${vn}];\n        for (int i = 0; i < ${vn}; i++) ${varr}[i] = sc.nextInt();`;
  } else if (spec.shape === 'missing_num') {
    const [vn, varr] = spec.vars;
    inputCode = `        if (!sc.hasNextInt()) return;\n        int ${vn} = sc.nextInt();\n        int[] ${varr} = new int[${vn} - 1];\n        for (int i = 0; i < ${vn} - 1; i++) ${varr}[i] = sc.nextInt();`;
  } else if (spec.shape === 'n_k_array') {
    const [vn, vk, varr] = spec.vars;
    inputCode = `        if (!sc.hasNextInt()) return;\n        int ${vn} = sc.nextInt();\n        int ${vk} = sc.nextInt();\n        int[] ${varr} = new int[${vn}];\n        for (int i = 0; i < ${vn}; i++) ${varr}[i] = sc.nextInt();`;
  } else if (spec.shape === 'intervals') {
    const [vn, varr] = spec.vars;
    inputCode = `        if (!sc.hasNextInt()) return;\n        int ${vn} = sc.nextInt();\n        int[][] ${varr} = new int[${vn}][2];\n        for (int i = 0; i < ${vn}; i++) {\n            ${varr}[i][0] = sc.nextInt();\n            ${varr}[i][1] = sc.nextInt();\n        }`;
  } else if (spec.shape === 'grid') {
    const [vr, vc, vgrid] = spec.vars;
    inputCode = `        if (!sc.hasNextInt()) return;\n        int ${vr} = sc.nextInt();\n        int ${vc} = sc.nextInt();\n        int[][] ${vgrid} = new int[${vr}][${vc}];\n        for (int i = 0; i < ${vr}; i++) {\n            for (int j = 0; j < ${vc}; j++) {\n                ${vgrid}[i][j] = sc.nextInt();\n            }\n        }`;
  } else if (spec.shape === 'array_strings') {
    const [vn, varr] = spec.vars;
    inputCode = `        if (!sc.hasNextInt()) return;\n        int ${vn} = sc.nextInt();\n        String[] ${varr} = new String[${vn}];\n        for (int i = 0; i < ${vn}; i++) ${varr}[i] = sc.next();`;
  }

  return `import java.util.*;
import java.io.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        // ===== INPUT (do not change) =====
${inputCode}
        // ===== END INPUT =====

        // ===== WRITE YOUR CODE BELOW =====


        // ${spec.prompt}
    }
}
`;
}

function generatePython(spec) {
  let inputCode = '';
  if (spec.shape === 'single_int') {
    const v = spec.vars[0];
    inputCode = `    ${v} = int(tokens[0])`;
  } else if (spec.shape === 'two_ints') {
    const [v1, v2] = spec.vars;
    inputCode = `    ${v1} = int(tokens[0])\n    ${v2} = int(tokens[1])`;
  } else if (spec.shape === 'three_ints') {
    const [v1, v2, v3] = spec.vars;
    inputCode = `    ${v1} = int(tokens[0])\n    ${v2} = int(tokens[1])\n    ${v3} = int(tokens[2])`;
  } else if (spec.shape === 'single_string') {
    const v = spec.vars[0];
    inputCode = `    ${v} = tokens[0]`;
  } else if (spec.shape === 'two_strings') {
    const [v1, v2] = spec.vars;
    inputCode = `    ${v1} = tokens[0]\n    ${v2} = tokens[1]`;
  } else if (spec.shape === 'string_char') {
    const [v1, v2] = spec.vars;
    inputCode = `    ${v1} = tokens[0]\n    ${v2} = tokens[1]`;
  } else if (spec.shape === 'array') {
    const [vn, varr] = spec.vars;
    inputCode = `    ${vn} = int(tokens[0])\n    ${varr} = [int(x) for x in tokens[1:1+${vn}]]`;
  } else if (spec.shape === 'missing_num') {
    const [vn, varr] = spec.vars;
    inputCode = `    ${vn} = int(tokens[0])\n    ${varr} = [int(x) for x in tokens[1:${vn}]]`;
  } else if (spec.shape === 'n_k_array') {
    const [vn, vk, varr] = spec.vars;
    inputCode = `    ${vn} = int(tokens[0])\n    ${vk} = int(tokens[1])\n    ${varr} = [int(x) for x in tokens[2:2+${vn}]]`;
  } else if (spec.shape === 'intervals') {
    const [vn, varr] = spec.vars;
    inputCode = `    ${vn} = int(tokens[0])\n    ${varr} = []\n    idx = 1\n    for _ in range(${vn}):\n        ${varr}.append([int(tokens[idx]), int(tokens[idx+1])])\n        idx += 2`;
  } else if (spec.shape === 'grid') {
    const [vr, vc, vgrid] = spec.vars;
    inputCode = `    ${vr} = int(tokens[0])\n    ${vc} = int(tokens[1])\n    ${vgrid} = []\n    idx = 2\n    for _ in range(${vr}):\n        ${vgrid}.append([int(x) for x in tokens[idx:idx+${vc}]])\n        idx += ${vc}`;
  } else if (spec.shape === 'array_strings') {
    const [vn, varr] = spec.vars;
    inputCode = `    ${vn} = int(tokens[0])\n    ${varr} = tokens[1:1+${vn}]`;
  }

  return `import sys

def main():
    # ===== INPUT (do not change) =====
    tokens = sys.stdin.read().split()
    if not tokens:
        return
${inputCode}
    # ===== END INPUT =====

    # ===== WRITE YOUR CODE BELOW =====


    # ${spec.prompt}

if __name__ == '__main__':
    main()
`;
}

export function generateAllTemplates() {
  const templatesDir = path.join(rootDir, 'data/templates');
  if (!fs.existsSync(templatesDir)) {
    fs.mkdirSync(templatesDir, { recursive: true });
  }

  const updatedProblems = problems.map((problem) => {
    const spec = SPECS[problem.id];
    if (!spec) {
      throw new Error(`Missing spec for problem id: ${problem.id}`);
    }

    const cCode = generateC(spec);
    const cppCode = generateCpp(spec);
    const javaCode = generateJava(spec);
    const pyCode = generatePython(spec);

    const pDir = path.join(templatesDir, problem.id);
    if (!fs.existsSync(pDir)) {
      fs.mkdirSync(pDir, { recursive: true });
    }

    fs.writeFileSync(path.join(pDir, 'c.txt'), cCode);
    fs.writeFileSync(path.join(pDir, 'cpp.txt'), cppCode);
    fs.writeFileSync(path.join(pDir, 'java.txt'), javaCode);
    fs.writeFileSync(path.join(pDir, 'py.txt'), pyCode);

    return {
      ...problem,
      starterCode: {
        c: cCode,
        cpp: cppCode,
        java: javaCode,
        python: pyCode,
      },
    };
  });

  // Write updated problems_pool.json
  fs.writeFileSync(path.join(rootDir, 'data/problems_pool.json'), JSON.stringify(updatedProblems, null, 2));

  // Write updated src/data/problems.js
  const jsContent = `// Auto-generated 48 Viking-themed coding problems with beginner-friendly starter templates\nexport const VIKING_PROBLEMS = ${JSON.stringify(updatedProblems, null, 2)};\n\nexport const PROBLEM_MAP = VIKING_PROBLEMS.reduce((acc, p) => {\n  acc[p.id] = p;\n  return acc;\n}, {});\n`;
  fs.writeFileSync(path.join(rootDir, 'src/data/problems.js'), jsContent);

  console.log(`Successfully generated templates for ${updatedProblems.length} problems in data/templates/, updated data/problems_pool.json and src/data/problems.js`);
  return updatedProblems;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  generateAllTemplates();
}

