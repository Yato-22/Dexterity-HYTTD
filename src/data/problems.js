// ============================================================================
// 12 ORIGINAL VIKING BATTLE CODING CHALLENGES WITH VERIFIED REFERENCE OUTPUTS
// ============================================================================

export const PROBLEMS = [
  {
    "id": "two-sum",
    "title": "Dual Anchor Forge",
    "difficulty": "Easy",
    "xp": 2,
    "weapon": "dagger",
    "story": "Gobber the blacksmith is forging a dual-anchor mooring line for the Berk fleet. He must select exactly two runic iron ingots from the armory whose weights sum up to the precise target anchor weight.",
    "task": "Given an array of N integers and a target sum T, find the 1-based indices of the two elements that sum up to T. Print the smaller index first. Exactly one valid solution exists.",
    "inputFormat": "Line 1: Two integers N and T (2 <= N <= 10^5, -10^9 <= T <= 10^9).\nLine 2: N space-separated integers A[1], A[2], ..., A[N].",
    "outputFormat": "Print two 1-based indices i and j (1 <= i < j <= N) separated by a space.",
    "constraints": [
      "2 <= N <= 100,000",
      "-10^9 <= A[i], T <= 10^9",
      "Exactly one valid pair exists."
    ],
    "timeLimitMs": 2000,
    "samples": [
      {
        "id": "sample-1",
        "name": "Case 1",
        "input": "4 9\n2 7 11 15",
        "expectedOutput": "1 2",
        "explanation": "Indices 1 and 2 correspond to values 2 + 7 = 9.",
        "isHidden": false
      },
      {
        "id": "sample-2",
        "name": "Case 2",
        "input": "3 6\n3 2 4",
        "expectedOutput": "2 3",
        "explanation": "Indices 2 and 3 correspond to values 2 + 4 = 6.",
        "isHidden": false
      }
    ],
    "hidden": [
      {
        "id": "hidden-1",
        "name": "Test #3",
        "input": "2 10\n5 5",
        "expectedOutput": "1 2",
        "explanation": "",
        "isHidden": true
      },
      {
        "id": "hidden-2",
        "name": "Test #4",
        "input": "5 0\n-3 4 3 90 10",
        "expectedOutput": "1 3",
        "explanation": "",
        "isHidden": true
      },
      {
        "id": "hidden-3",
        "name": "Test #5",
        "input": "6 100\n10 20 30 40 70 90",
        "expectedOutput": "3 5",
        "explanation": "",
        "isHidden": true
      },
      {
        "id": "hidden-4",
        "name": "Test #6",
        "input": "4 -8\n-1 -2 -3 -5",
        "expectedOutput": "3 4",
        "explanation": "",
        "isHidden": true
      },
      {
        "id": "hidden-5",
        "name": "Test #7",
        "input": "5 17\n1 2 3 9 8",
        "expectedOutput": "4 5",
        "explanation": "",
        "isHidden": true
      },
      {
        "id": "hidden-6",
        "name": "Test #8",
        "input": "6 50\n5 15 25 35 45 5",
        "expectedOutput": "2 4",
        "explanation": "",
        "isHidden": true
      },
      {
        "id": "hidden-7",
        "name": "Test #9",
        "input": "7 1000000000\n500000000 1 2 3 4 5 500000000",
        "expectedOutput": "1 7",
        "explanation": "",
        "isHidden": true
      },
      {
        "id": "hidden-8",
        "name": "Test #10",
        "input": "8 14\n1 3 5 7 9 11 13 1",
        "expectedOutput": "3 5",
        "explanation": "",
        "isHidden": true
      }
    ],
    "starterCode": {
      "c": "#include <stdio.h>\n\nint main() {\n    int n; long long target;\n    if (scanf(\"%d %lld\", &n, &target) != 2) return 0;\n    // Read input and solve\n    return 0;\n}",
      "cpp": "#include <iostream>\n#include <vector>\n#include <unordered_map>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    int n; long long target;\n    if (!(cin >> n >> target)) return 0;\n    vector<long long> a(n);\n    for (int i = 0; i < n; i++) cin >> a[i];\n    unordered_map<long long, int> seen;\n    for (int i = 0; i < n; i++) {\n        if (seen.count(target - a[i])) {\n            cout << seen[target - a[i]] << \" \" << (i + 1) << \"\\n\";\n            return 0;\n        }\n        seen[a[i]] = i + 1;\n    }\n    return 0;\n}",
      "java": "import java.io.*;\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) throws Exception {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        StringTokenizer st = new StringTokenizer(br.readLine());\n        int n = Integer.parseInt(st.nextToken());\n        long target = Long.parseLong(st.nextToken());\n        // Complete solution\n    }\n}",
      "python": "import sys\n\ndef main():\n    data = sys.stdin.read().split()\n    if not data: return\n    n, target = int(data[0]), int(data[1])\n    arr = [int(x) for x in data[2:2+n]]\n    seen = {}\n    for i, x in enumerate(arr, 1):\n        if target - x in seen:\n            print(f\"{seen[target - x]} {i}\")\n            return\n        seen[x] = i\n\nif __name__ == \"__main__\":\n    main()"
    }
  },
  {
    "id": "valid-parentheses",
    "title": "Dragon Ward Rune",
    "difficulty": "Easy",
    "xp": 2,
    "weapon": "dagger",
    "story": "Elder Gothi carves mystical dragon binding runes comprising bracket symbols: (), [], and {}. A runic shield is fortified only when every opening rune is properly matched and nested.",
    "task": "Given a string S containing only characters '(', ')', '{', '}', '[', ']', determine if the input string is valid. Print YES if valid, otherwise NO.",
    "inputFormat": "A single non-empty string S (1 <= length <= 10^5).",
    "outputFormat": "Print YES if valid, otherwise NO.",
    "constraints": [
      "1 <= |S| <= 100,000",
      "S consists only of '()[]{}'."
    ],
    "timeLimitMs": 2000,
    "samples": [
      {
        "id": "sample-1",
        "name": "Case 1",
        "input": "()[]{}",
        "expectedOutput": "YES",
        "explanation": "All three types of brackets open and close properly.",
        "isHidden": false
      },
      {
        "id": "sample-2",
        "name": "Case 2",
        "input": "(]",
        "expectedOutput": "NO",
        "explanation": "Opening parenthesis is closed by a bracket, which is mismatched.",
        "isHidden": false
      }
    ],
    "hidden": [
      {
        "id": "hidden-1",
        "name": "Test #3",
        "input": "([{}])",
        "expectedOutput": "YES",
        "explanation": "",
        "isHidden": true
      },
      {
        "id": "hidden-2",
        "name": "Test #4",
        "input": "(((",
        "expectedOutput": "NO",
        "explanation": "",
        "isHidden": true
      },
      {
        "id": "hidden-3",
        "name": "Test #5",
        "input": ")))",
        "expectedOutput": "NO",
        "explanation": "",
        "isHidden": true
      },
      {
        "id": "hidden-4",
        "name": "Test #6",
        "input": "({[)]}",
        "expectedOutput": "NO",
        "explanation": "",
        "isHidden": true
      },
      {
        "id": "hidden-5",
        "name": "Test #7",
        "input": "{[()()]}",
        "expectedOutput": "YES",
        "explanation": "",
        "isHidden": true
      },
      {
        "id": "hidden-6",
        "name": "Test #8",
        "input": "()()()()()()()()",
        "expectedOutput": "YES",
        "explanation": "",
        "isHidden": true
      },
      {
        "id": "hidden-7",
        "name": "Test #9",
        "input": "(((((((((((())))))))))))",
        "expectedOutput": "YES",
        "explanation": "",
        "isHidden": true
      },
      {
        "id": "hidden-8",
        "name": "Test #10",
        "input": "[[[[]]]]",
        "expectedOutput": "YES",
        "explanation": "",
        "isHidden": true
      }
    ],
    "starterCode": {
      "c": "#include <stdio.h>\n#include <string.h>\n\nint main() {\n    char s[100005];\n    if (scanf(\"%s\", s) != 1) return 0;\n    // Solve using stack\n    return 0;\n}",
      "cpp": "#include <iostream>\n#include <string>\n#include <vector>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    string s; if (!(cin >> s)) return 0;\n    vector<char> st;\n    for (char c : s) {\n        if (c == '(' || c == '[' || c == '{') st.push_back(c);\n        else {\n            if (st.empty()) { cout << \"NO\\n\"; return 0; }\n            char top = st.back(); st.pop_back();\n            if (c == ')' && top != '(') { cout << \"NO\\n\"; return 0; }\n            if (c == ']' && top != '[') { cout << \"NO\\n\"; return 0; }\n            if (c == '}' && top != '{') { cout << \"NO\\n\"; return 0; }\n        }\n    }\n    cout << (st.empty() ? \"YES\" : \"NO\") << \"\\n\";\n    return 0;\n}",
      "java": "import java.io.*;\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) throws Exception {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        String s = br.readLine();\n        if (s == null) return;\n        // Solve\n    }\n}",
      "python": "import sys\n\ndef main():\n    s = sys.stdin.read().strip()\n    if not s:\n        print(\"YES\")\n        return\n    st = []\n    pairs = {\")\": \"(\", \"]\": \"[\", \"}\": \"{\"}\n    for ch in s:\n        if ch in \"([{\":\n            st.append(ch)\n        elif ch in pairs:\n            if not st or st[-1] != pairs[ch]:\n                print(\"NO\")\n                return\n            st.pop()\n    print(\"YES\" if not st else \"NO\")\n\nif __name__ == \"__main__\":\n    main()"
    }
  },
  {
    "id": "palindrome-number",
    "title": "Sundial Symmetry",
    "difficulty": "Easy",
    "xp": 2,
    "weapon": "dagger",
    "story": "The sundial in the Great Hall marks warrior timestamps. An hour mark is auspicious if its numerical value reads identically forwards and backwards.",
    "task": "Given an integer X, print YES if X is a palindrome integer, and NO otherwise. Negative numbers are never palindromes.",
    "inputFormat": "A single integer X (-2^31 <= X <= 2^31 - 1).",
    "outputFormat": "Print YES or NO.",
    "constraints": [
      "-2^31 <= X <= 2^31 - 1"
    ],
    "timeLimitMs": 2000,
    "samples": [
      {
        "id": "sample-1",
        "name": "Case 1",
        "input": "121",
        "expectedOutput": "YES",
        "explanation": "121 reads as 121 from left to right and from right to left.",
        "isHidden": false
      },
      {
        "id": "sample-2",
        "name": "Case 2",
        "input": "-121",
        "expectedOutput": "NO",
        "explanation": "From left to right it reads -121. From right to left it becomes 121-, which is not a palindrome.",
        "isHidden": false
      }
    ],
    "hidden": [
      {
        "id": "hidden-1",
        "name": "Test #3",
        "input": "10",
        "expectedOutput": "NO",
        "explanation": "",
        "isHidden": true
      },
      {
        "id": "hidden-2",
        "name": "Test #4",
        "input": "0",
        "expectedOutput": "YES",
        "explanation": "",
        "isHidden": true
      },
      {
        "id": "hidden-3",
        "name": "Test #5",
        "input": "7",
        "expectedOutput": "YES",
        "explanation": "",
        "isHidden": true
      },
      {
        "id": "hidden-4",
        "name": "Test #6",
        "input": "1001",
        "expectedOutput": "YES",
        "explanation": "",
        "isHidden": true
      },
      {
        "id": "hidden-5",
        "name": "Test #7",
        "input": "12321",
        "expectedOutput": "YES",
        "explanation": "",
        "isHidden": true
      },
      {
        "id": "hidden-6",
        "name": "Test #8",
        "input": "123321",
        "expectedOutput": "YES",
        "explanation": "",
        "isHidden": true
      },
      {
        "id": "hidden-7",
        "name": "Test #9",
        "input": "-101",
        "expectedOutput": "NO",
        "explanation": "",
        "isHidden": true
      },
      {
        "id": "hidden-8",
        "name": "Test #10",
        "input": "1000000001",
        "expectedOutput": "YES",
        "explanation": "",
        "isHidden": true
      }
    ],
    "starterCode": {
      "c": "#include <stdio.h>\n\nint main() {\n    long long x;\n    if (scanf(\"%lld\", &x) != 1) return 0;\n    if (x < 0) { printf(\"NO\\n\"); return 0; }\n    long long rev = 0, orig = x;\n    while (x > 0) {\n        rev = rev * 10 + (x % 10);\n        x /= 10;\n    }\n    printf(\"%s\\n\", (orig == rev) ? \"YES\" : \"NO\");\n    return 0;\n}",
      "cpp": "#include <iostream>\n#include <string>\nusing namespace std;\n\nint main() {\n    string s;\n    if (!(cin >> s)) return 0;\n    if (s[0] == '-') { cout << \"NO\\n\"; return 0; }\n    string rev(s.rbegin(), s.rend());\n    cout << (s == rev ? \"YES\" : \"NO\") << \"\\n\";\n    return 0;\n}",
      "java": "import java.io.*;\n\npublic class Main {\n    public static void main(String[] args) throws Exception {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        String s = br.readLine();\n        if (s == null) return;\n        s = s.trim();\n        if (s.startsWith(\"-\")) { System.out.println(\"NO\"); return; }\n        String rev = new StringBuilder(s).reverse().toString();\n        System.out.println(s.equals(rev) ? \"YES\" : \"NO\");\n    }\n}",
      "python": "import sys\n\ndef main():\n    s = sys.stdin.read().strip()\n    if not s or s.startswith(\"-\"):\n        print(\"NO\")\n        return\n    print(\"YES\" if s == s[::-1] else \"NO\")\n\nif __name__ == \"__main__\":\n    main()"
    }
  },
  {
    "id": "longest-unique-substring",
    "title": "War Horn Chants",
    "difficulty": "Medium",
    "xp": 5,
    "weapon": "axe",
    "story": "Chieftain Stoick is transcribing a dragon battle horn signal. He needs to identify the length of the longest phrase in the horn sequence that contains no repeated sound runes.",
    "task": "Given a string S, find the length of the longest substring without repeating characters.",
    "inputFormat": "A single string S (0 <= |S| <= 10^5).",
    "outputFormat": "Print a single integer: the length of the longest unique substring.",
    "constraints": [
      "0 <= |S| <= 100,000",
      "S consists of English letters, digits, symbols and spaces."
    ],
    "timeLimitMs": 2000,
    "samples": [
      {
        "id": "sample-1",
        "name": "Case 1",
        "input": "abcabcbb",
        "expectedOutput": "3",
        "explanation": "The answer is 'abc', with the length of 3.",
        "isHidden": false
      },
      {
        "id": "sample-2",
        "name": "Case 2",
        "input": "bbbbb",
        "expectedOutput": "1",
        "explanation": "The answer is 'b', with the length of 1.",
        "isHidden": false
      }
    ],
    "hidden": [
      {
        "id": "hidden-1",
        "name": "Test #3",
        "input": "pwwkew",
        "expectedOutput": "3",
        "explanation": "",
        "isHidden": true
      },
      {
        "id": "hidden-2",
        "name": "Test #4",
        "input": "",
        "expectedOutput": "0",
        "explanation": "",
        "isHidden": true
      },
      {
        "id": "hidden-3",
        "name": "Test #5",
        "input": "abcdefghijklmnopqrstuvwxyz",
        "expectedOutput": "26",
        "explanation": "",
        "isHidden": true
      },
      {
        "id": "hidden-4",
        "name": "Test #6",
        "input": "aab",
        "expectedOutput": "2",
        "explanation": "",
        "isHidden": true
      },
      {
        "id": "hidden-5",
        "name": "Test #7",
        "input": "dvdf",
        "expectedOutput": "3",
        "explanation": "",
        "isHidden": true
      },
      {
        "id": "hidden-6",
        "name": "Test #8",
        "input": "tmmzuxt",
        "expectedOutput": "5",
        "explanation": "",
        "isHidden": true
      },
      {
        "id": "hidden-7",
        "name": "Test #9",
        "input": "anviaj",
        "expectedOutput": "5",
        "explanation": "",
        "isHidden": true
      },
      {
        "id": "hidden-8",
        "name": "Test #10",
        "input": "abacaba",
        "expectedOutput": "3",
        "explanation": "",
        "isHidden": true
      }
    ],
    "starterCode": {
      "c": "#include <stdio.h>\n#include <string.h>\n\nint main() {\n    char s[100005];\n    if (fgets(s, sizeof(s), stdin) == NULL) { printf(\"0\\n\"); return 0; }\n    // Solve\n    return 0;\n}",
      "cpp": "#include <iostream>\n#include <string>\n#include <vector>\n#include <algorithm>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    string s;\n    getline(cin, s);\n    vector<int> last(256, -1);\n    int max_len = 0, start = 0;\n    for (int i = 0; i < (int)s.size(); i++) {\n        unsigned char c = s[i];\n        if (last[c] >= start) start = last[c] + 1;\n        last[c] = i;\n        max_len = max(max_len, i - start + 1);\n    }\n    cout << max_len << \"\\n\";\n    return 0;\n}",
      "java": "import java.io.*;\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) throws Exception {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        String s = br.readLine();\n        if (s == null) { System.out.println(0); return; }\n        // Solve\n    }\n}",
      "python": "import sys\n\ndef main():\n    s = sys.stdin.read().strip(\"\\r\\n\")\n    used = {}\n    start = 0\n    ans = 0\n    for i, ch in enumerate(s):\n        if ch in used and used[ch] >= start:\n            start = used[ch] + 1\n        used[ch] = i\n        ans = max(ans, i - start + 1)\n    print(ans)\n\nif __name__ == \"__main__\":\n    main()"
    }
  },
  {
    "id": "merge-intervals",
    "title": "Watchtower Patrol Shifts",
    "difficulty": "Medium",
    "xp": 5,
    "weapon": "axe",
    "story": "Dragon watchtower guards operate in overlapping shift windows. Astrid must consolidate all overlapping time intervals to generate a streamlined patrol schedule.",
    "task": "Given an array of intervals [L, R], merge all overlapping intervals and print the resulting non-overlapping intervals in ascending order of their start times.",
    "inputFormat": "Line 1: An integer N (1 <= N <= 10^5).\nNext N lines: Two integers L and R (0 <= L <= R <= 10^9).",
    "outputFormat": "Print each merged interval on a new line as 'L R'.",
    "constraints": [
      "1 <= N <= 100,000",
      "0 <= L <= R <= 10^9"
    ],
    "timeLimitMs": 2000,
    "samples": [
      {
        "id": "sample-1",
        "name": "Case 1",
        "input": "4\n1 3\n2 6\n8 10\n15 18",
        "expectedOutput": "1 6\n8 10\n15 18",
        "explanation": "Intervals [1,3] and [2,6] overlap, merging into [1,6].",
        "isHidden": false
      },
      {
        "id": "sample-2",
        "name": "Case 2",
        "input": "2\n1 4\n4 5",
        "expectedOutput": "1 5",
        "explanation": "Intervals [1,4] and [4,5] touch at 4, merging into [1,5].",
        "isHidden": false
      }
    ],
    "hidden": [
      {
        "id": "hidden-1",
        "name": "Test #3",
        "input": "1\n5 10",
        "expectedOutput": "5 10",
        "explanation": "",
        "isHidden": true
      },
      {
        "id": "hidden-2",
        "name": "Test #4",
        "input": "3\n1 10\n2 5\n3 7",
        "expectedOutput": "1 10",
        "explanation": "",
        "isHidden": true
      },
      {
        "id": "hidden-3",
        "name": "Test #5",
        "input": "4\n1 4\n0 2\n3 5\n6 8",
        "expectedOutput": "0 5\n6 8",
        "explanation": "",
        "isHidden": true
      },
      {
        "id": "hidden-4",
        "name": "Test #6",
        "input": "5\n2 3\n4 5\n6 7\n8 9\n1 10",
        "expectedOutput": "1 10",
        "explanation": "",
        "isHidden": true
      },
      {
        "id": "hidden-5",
        "name": "Test #7",
        "input": "3\n1 4\n5 6\n7 8",
        "expectedOutput": "1 4\n5 6\n7 8",
        "explanation": "",
        "isHidden": true
      },
      {
        "id": "hidden-6",
        "name": "Test #8",
        "input": "4\n1 4\n2 3\n4 5\n5 6",
        "expectedOutput": "1 6",
        "explanation": "",
        "isHidden": true
      },
      {
        "id": "hidden-7",
        "name": "Test #9",
        "input": "3\n10 20\n0 5\n3 8",
        "expectedOutput": "0 8\n10 20",
        "explanation": "",
        "isHidden": true
      },
      {
        "id": "hidden-8",
        "name": "Test #10",
        "input": "5\n1 2\n3 4\n5 6\n7 8\n9 10",
        "expectedOutput": "1 2\n3 4\n5 6\n7 8\n9 10",
        "explanation": "",
        "isHidden": true
      }
    ],
    "starterCode": {
      "c": "#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    int n;\n    if (scanf(\"%d\", &n) != 1) return 0;\n    // Read intervals and merge\n    return 0;\n}",
      "cpp": "#include <iostream>\n#include <vector>\n#include <algorithm>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    int n; if (!(cin >> n)) return 0;\n    vector<pair<long long, long long>> a(n);\n    for (int i = 0; i < n; i++) cin >> a[i].first >> a[i].second;\n    sort(a.begin(), a.end());\n    vector<pair<long long, long long>> merged;\n    for (auto& iv : a) {\n        if (merged.empty() || merged.back().second < iv.first) {\n            merged.push_back(iv);\n        } else {\n            merged.back().second = max(merged.back().second, iv.second);\n        }\n    }\n    for (auto& iv : merged) cout << iv.first << \" \" << iv.second << \"\\n\";\n    return 0;\n}",
      "java": "import java.io.*;\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) throws Exception {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        String line = br.readLine();\n        if (line == null) return;\n        int n = Integer.parseInt(line.trim());\n        // Solve\n    }\n}",
      "python": "import sys\n\ndef main():\n    lines = sys.stdin.read().strip().split(\"\\n\")\n    if not lines or not lines[0]: return\n    n = int(lines[0].split()[0])\n    intervals = []\n    for i in range(1, n + 1):\n        p = lines[i].split()\n        intervals.append([int(p[0]), int(p[1])])\n    intervals.sort(key=lambda x: x[0])\n    merged = []\n    for iv in intervals:\n        if not merged or merged[-1][1] < iv[0]:\n            merged.append(iv)\n        else:\n            merged[-1][1] = max(merged[-1][1], iv[1])\n    for m in merged:\n        print(f\"{m[0]} {m[1]}\")\n\nif __name__ == \"__main__\":\n    main()"
    }
  },
  {
    "id": "number-of-islands",
    "title": "Archipelago Scout",
    "difficulty": "Medium",
    "xp": 5,
    "weapon": "axe",
    "story": "Toothless and Hiccup are charting uncharted sea-stacks in the archipelago. A grid map represents land with 1s and open ocean with 0s. Islands are formed by connecting adjacent lands horizontally or vertically.",
    "task": "Given an R x C 2D binary grid, return the number of islands. An island is surrounded by water and is formed by connecting adjacent lands 4-directionally.",
    "inputFormat": "Line 1: Two integers R and C (1 <= R, C <= 300).\nNext R lines: C space-separated digits (0 or 1).",
    "outputFormat": "Print a single integer: the number of islands.",
    "constraints": [
      "1 <= R, C <= 300",
      "Grid elements are either 0 or 1."
    ],
    "timeLimitMs": 2000,
    "samples": [
      {
        "id": "sample-1",
        "name": "Case 1",
        "input": "4 5\n1 1 1 1 0\n1 1 0 1 0\n1 1 0 0 0\n0 0 0 0 0",
        "expectedOutput": "1",
        "explanation": "All connected 1s form a single large island.",
        "isHidden": false
      },
      {
        "id": "sample-2",
        "name": "Case 2",
        "input": "4 5\n1 1 0 0 0\n1 1 0 0 0\n0 0 1 0 0\n0 0 0 1 1",
        "expectedOutput": "3",
        "explanation": "There are 3 isolated islands.",
        "isHidden": false
      }
    ],
    "hidden": [
      {
        "id": "hidden-1",
        "name": "Test #3",
        "input": "1 1\n1",
        "expectedOutput": "1",
        "explanation": "",
        "isHidden": true
      },
      {
        "id": "hidden-2",
        "name": "Test #4",
        "input": "1 1\n0",
        "expectedOutput": "0",
        "explanation": "",
        "isHidden": true
      },
      {
        "id": "hidden-3",
        "name": "Test #5",
        "input": "3 3\n1 0 1\n0 1 0\n1 0 1",
        "expectedOutput": "5",
        "explanation": "",
        "isHidden": true
      },
      {
        "id": "hidden-4",
        "name": "Test #6",
        "input": "2 4\n1 1 1 1\n1 1 1 1",
        "expectedOutput": "1",
        "explanation": "",
        "isHidden": true
      },
      {
        "id": "hidden-5",
        "name": "Test #7",
        "input": "4 4\n0 0 0 0\n0 0 0 0\n0 0 0 0\n0 0 0 0",
        "expectedOutput": "0",
        "explanation": "",
        "isHidden": true
      },
      {
        "id": "hidden-6",
        "name": "Test #8",
        "input": "3 4\n1 0 0 1\n0 1 1 0\n1 0 0 1",
        "expectedOutput": "5",
        "explanation": "",
        "isHidden": true
      },
      {
        "id": "hidden-7",
        "name": "Test #9",
        "input": "5 1\n1\n0\n1\n0\n1",
        "expectedOutput": "3",
        "explanation": "",
        "isHidden": true
      },
      {
        "id": "hidden-8",
        "name": "Test #10",
        "input": "4 6\n1 1 0 1 1 0\n1 0 0 0 1 0\n0 0 1 0 0 0\n1 1 0 0 1 1",
        "expectedOutput": "5",
        "explanation": "",
        "isHidden": true
      }
    ],
    "starterCode": {
      "c": "#include <stdio.h>\n\nint main() {\n    int r, c;\n    if (scanf(\"%d %d\", &r, &c) != 2) return 0;\n    // Read grid and count connected components\n    return 0;\n}",
      "cpp": "#include <iostream>\n#include <vector>\nusing namespace std;\n\nint R, C;\nvector<vector<int>> g;\n\nvoid dfs(int i, int j) {\n    if (i < 0 || i >= R || j < 0 || j >= C || g[i][j] != 1) return;\n    g[i][j] = 0;\n    dfs(i + 1, j);\n    dfs(i - 1, j);\n    dfs(i, j + 1);\n    dfs(i, j - 1);\n}\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    if (!(cin >> R >> C)) return 0;\n    g.assign(R, vector<int>(C));\n    for (int i = 0; i < R; i++)\n        for (int j = 0; j < C; j++)\n            cin >> g[i][j];\n    int ans = 0;\n    for (int i = 0; i < R; i++)\n        for (int j = 0; j < C; j++)\n            if (g[i][j] == 1) {\n                ans++;\n                dfs(i, j);\n            }\n    cout << ans << \"\\n\";\n    return 0;\n}",
      "java": "import java.io.*;\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) throws Exception {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        String line = br.readLine();\n        if (line == null) return;\n        StringTokenizer st = new StringTokenizer(line);\n        int r = Integer.parseInt(st.nextToken());\n        int c = Integer.parseInt(st.nextToken());\n        // Solve\n    }\n}",
      "python": "import sys\nsys.setrecursionlimit(200000)\n\ndef main():\n    t = sys.stdin.read().split()\n    if not t: return\n    r, c = int(t[0]), int(t[1])\n    grid = []\n    pos = 2\n    for _ in range(r):\n        grid.append([int(x) for x in t[pos:pos+c]])\n        pos += c\n    ans = 0\n    def dfs(i, j):\n        if i < 0 or i >= r or j < 0 or j >= c or grid[i][j] != 1: return\n        grid[i][j] = 0\n        dfs(i+1, j); dfs(i-1, j); dfs(i, j+1); dfs(i, j-1)\n    for i in range(r):\n        for j in range(c):\n            if grid[i][j] == 1:\n                ans += 1\n                dfs(i, j)\n    print(ans)\n\nif __name__ == \"__main__\":\n    main()"
    }
  },
  {
    "id": "trapping-rain-water",
    "title": "Basalt Pool Basin",
    "difficulty": "Hard",
    "xp": 7,
    "weapon": "catapult",
    "story": "Rain lashes against the jagged basalt cliffs of Dragon Island. Given an elevation map where the width of each cliff pillar is 1, compute how much water is trapped between the pillars after torrential downpour.",
    "task": "Given N non-negative integers representing an elevation map where each bar has width 1, compute how much water it can trap after raining.",
    "inputFormat": "Line 1: An integer N (1 <= N <= 10^5).\nLine 2: N space-separated integers height[0], ..., height[N-1] (0 <= height[i] <= 10^5).",
    "outputFormat": "Print a single integer: total units of trapped rain water.",
    "constraints": [
      "1 <= N <= 100,000",
      "0 <= height[i] <= 10^5"
    ],
    "timeLimitMs": 2000,
    "samples": [
      {
        "id": "sample-1",
        "name": "Case 1",
        "input": "12\n0 1 0 2 1 0 1 3 2 1 2 1",
        "expectedOutput": "6",
        "explanation": "The cliffs trap 6 units of rain water.",
        "isHidden": false
      },
      {
        "id": "sample-2",
        "name": "Case 2",
        "input": "6\n4 2 0 3 2 5",
        "expectedOutput": "9",
        "explanation": "The cliffs trap 9 units of rain water.",
        "isHidden": false
      }
    ],
    "hidden": [
      {
        "id": "hidden-1",
        "name": "Test #3",
        "input": "3\n2 0 2",
        "expectedOutput": "2",
        "explanation": "",
        "isHidden": true
      },
      {
        "id": "hidden-2",
        "name": "Test #4",
        "input": "5\n3 0 0 0 3",
        "expectedOutput": "9",
        "explanation": "",
        "isHidden": true
      },
      {
        "id": "hidden-3",
        "name": "Test #5",
        "input": "5\n1 2 3 4 5",
        "expectedOutput": "0",
        "explanation": "",
        "isHidden": true
      },
      {
        "id": "hidden-4",
        "name": "Test #6",
        "input": "5\n5 4 3 2 1",
        "expectedOutput": "0",
        "explanation": "",
        "isHidden": true
      },
      {
        "id": "hidden-5",
        "name": "Test #7",
        "input": "6\n0 0 0 0 0 0",
        "expectedOutput": "0",
        "explanation": "",
        "isHidden": true
      },
      {
        "id": "hidden-6",
        "name": "Test #8",
        "input": "7\n5 1 2 1 2 1 5",
        "expectedOutput": "18",
        "explanation": "",
        "isHidden": true
      },
      {
        "id": "hidden-7",
        "name": "Test #9",
        "input": "8\n2 1 5 3 1 0 4 2",
        "expectedOutput": "9",
        "explanation": "",
        "isHidden": true
      },
      {
        "id": "hidden-8",
        "name": "Test #10",
        "input": "10\n1 0 2 0 3 0 4 0 5 0",
        "expectedOutput": "10",
        "explanation": "",
        "isHidden": true
      }
    ],
    "starterCode": {
      "c": "#include <stdio.h>\n\nint main() {\n    int n;\n    if (scanf(\"%d\", &n) != 1) return 0;\n    // Read heights and solve with two pointers\n    return 0;\n}",
      "cpp": "#include <iostream>\n#include <vector>\n#include <algorithm>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    int n; if (!(cin >> n)) return 0;\n    vector<long long> h(n);\n    for (int i = 0; i < n; i++) cin >> h[i];\n    int l = 0, r = n - 1;\n    long long max_l = 0, max_r = 0, ans = 0;\n    while (l < r) {\n        if (h[l] <= h[r]) {\n            if (h[l] >= max_l) max_l = h[l];\n            else ans += max_l - h[l];\n            l++;\n        } else {\n            if (h[r] >= max_r) max_r = h[r];\n            else ans += max_r - h[r];\n            r--;\n        }\n    }\n    cout << ans << \"\\n\";\n    return 0;\n}",
      "java": "import java.io.*;\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) throws Exception {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        String line = br.readLine();\n        if (line == null) return;\n        int n = Integer.parseInt(line.trim());\n        // Solve\n    }\n}",
      "python": "import sys\n\ndef main():\n    t = sys.stdin.read().split()\n    if not t: return\n    n = int(t[0])\n    h = [int(x) for x in t[1:1+n]]\n    l, r = 0, n - 1\n    max_l = max_r = ans = 0\n    while l < r:\n        if h[l] <= h[r]:\n            if h[l] >= max_l: max_l = h[l]\n            else: ans += max_l - h[l]\n            l += 1\n        else:\n            if h[r] >= max_r: max_r = h[r]\n            else: ans += max_r - h[r]\n            r -= 1\n    print(ans)\n\nif __name__ == \"__main__\":\n    main()"
    }
  },
  {
    "id": "edit-distance",
    "title": "Ancient Rune Transcription",
    "difficulty": "Hard",
    "xp": 7,
    "weapon": "catapult",
    "story": "Fishlegs is translating ancient dragon scrolls. To correct a damaged inscription into the intended sacred text, he may perform three operations: insert a rune, delete a rune, or replace a rune.",
    "task": "Given two words word1 and word2, find the minimum number of operations required to convert word1 to word2.",
    "inputFormat": "Line 1: String word1 (0 <= |word1| <= 1000).\nLine 2: String word2 (0 <= |word2| <= 1000).",
    "outputFormat": "Print a single integer: the minimum edit distance.",
    "constraints": [
      "0 <= |word1|, |word2| <= 1,000",
      "Strings contain only lowercase English letters."
    ],
    "timeLimitMs": 2000,
    "samples": [
      {
        "id": "sample-1",
        "name": "Case 1",
        "input": "horse\nros",
        "expectedOutput": "3",
        "explanation": "horse -> rorse (replace 'h' with 'r') -> rose (remove 'r') -> ros (remove 'e'). Total: 3.",
        "isHidden": false
      },
      {
        "id": "sample-2",
        "name": "Case 2",
        "input": "intention\nexecution",
        "expectedOutput": "5",
        "explanation": "Convert intention to execution in 5 operations.",
        "isHidden": false
      }
    ],
    "hidden": [
      {
        "id": "hidden-1",
        "name": "Test #3",
        "input": "a\nb",
        "expectedOutput": "1",
        "explanation": "",
        "isHidden": true
      },
      {
        "id": "hidden-2",
        "name": "Test #4",
        "input": "dragon\ndragon",
        "expectedOutput": "0",
        "explanation": "",
        "isHidden": true
      },
      {
        "id": "hidden-3",
        "name": "Test #5",
        "input": "viking\nking",
        "expectedOutput": "2",
        "explanation": "",
        "isHidden": true
      },
      {
        "id": "hidden-4",
        "name": "Test #6",
        "input": "stoick\n",
        "expectedOutput": "6",
        "explanation": "",
        "isHidden": true
      },
      {
        "id": "hidden-5",
        "name": "Test #7",
        "input": "\nberk",
        "expectedOutput": "4",
        "explanation": "",
        "isHidden": true
      },
      {
        "id": "hidden-6",
        "name": "Test #8",
        "input": "zoologico\nzoologico",
        "expectedOutput": "0",
        "explanation": "",
        "isHidden": true
      },
      {
        "id": "hidden-7",
        "name": "Test #9",
        "input": "sitting\nkitten",
        "expectedOutput": "3",
        "explanation": "",
        "isHidden": true
      },
      {
        "id": "hidden-8",
        "name": "Test #10",
        "input": "algorithm\naltitude",
        "expectedOutput": "6",
        "explanation": "",
        "isHidden": true
      }
    ],
    "starterCode": {
      "c": "#include <stdio.h>\n#include <string.h>\n\nint main() {\n    char w1[1005] = {0}, w2[1005] = {0};\n    if (fgets(w1, sizeof(w1), stdin)) {}\n    if (fgets(w2, sizeof(w2), stdin)) {}\n    // Solve using DP\n    return 0;\n}",
      "cpp": "#include <iostream>\n#include <string>\n#include <vector>\n#include <algorithm>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    string w1, w2;\n    getline(cin, w1);\n    getline(cin, w2);\n    int m = w1.size(), n = w2.size();\n    vector<vector<int>> dp(m + 1, vector<int>(n + 1));\n    for (int i = 0; i <= m; i++) dp[i][0] = i;\n    for (int j = 0; j <= n; j++) dp[0][j] = j;\n    for (int i = 1; i <= m; i++) {\n        for (int j = 1; j <= n; j++) {\n            if (w1[i-1] == w2[j-1]) dp[i][j] = dp[i-1][j-1];\n            else dp[i][j] = 1 + min({dp[i-1][j], dp[i][j-1], dp[i-1][j-1]});\n        }\n    }\n    cout << dp[m][n] << \"\\n\";\n    return 0;\n}",
      "java": "import java.io.*;\n\npublic class Main {\n    public static void main(String[] args) throws Exception {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        String w1 = br.readLine();\n        String w2 = br.readLine();\n        if (w1 == null) w1 = \"\";\n        if (w2 == null) w2 = \"\";\n        // Solve\n    }\n}",
      "python": "import sys\n\ndef main():\n    lines = sys.stdin.read().split(\"\\n\")\n    w1 = lines[0].strip() if len(lines) > 0 else \"\"\n    w2 = lines[1].strip() if len(lines) > 1 else \"\"\n    m, n = len(w1), len(w2)\n    dp = [[0]*(n+1) for _ in range(m+1)]\n    for i in range(m+1): dp[i][0] = i\n    for j in range(n+1): dp[0][j] = j\n    for i in range(1, m+1):\n        for j in range(1, n+1):\n            if w1[i-1] == w2[j-1]: dp[i][j] = dp[i-1][j-1]\n            else: dp[i][j] = 1 + min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1])\n    print(dp[m][n])\n\nif __name__ == \"__main__\":\n    main()"
    }
  },
  {
    "id": "longest-valid-parentheses",
    "title": "Fire Breath Enchantment",
    "difficulty": "Hard",
    "xp": 7,
    "weapon": "catapult",
    "story": "The dragon's flame gullet is warded by continuous arcs of opening and closing fire brackets. Determine the length of the longest contiguous sub-arc that forms a well-matched parentheses sequence.",
    "task": "Given a string S containing just the characters '(' and ')', return the length of the longest valid (well-formed) parentheses substring.",
    "inputFormat": "A single string S (0 <= |S| <= 10^5).",
    "outputFormat": "Print a single integer: length of the longest valid substring.",
    "constraints": [
      "0 <= |S| <= 100,000",
      "S consists of only '(' and ')'."
    ],
    "timeLimitMs": 2000,
    "samples": [
      {
        "id": "sample-1",
        "name": "Case 1",
        "input": "(()",
        "expectedOutput": "2",
        "explanation": "The longest valid parentheses substring is '()', which has length = 2.",
        "isHidden": false
      },
      {
        "id": "sample-2",
        "name": "Case 2",
        "input": ")()())",
        "expectedOutput": "4",
        "explanation": "The longest valid parentheses substring is '()()', which has length = 4.",
        "isHidden": false
      }
    ],
    "hidden": [
      {
        "id": "hidden-1",
        "name": "Test #3",
        "input": "",
        "expectedOutput": "0",
        "explanation": "",
        "isHidden": true
      },
      {
        "id": "hidden-2",
        "name": "Test #4",
        "input": "()",
        "expectedOutput": "2",
        "explanation": "",
        "isHidden": true
      },
      {
        "id": "hidden-3",
        "name": "Test #5",
        "input": ")(",
        "expectedOutput": "0",
        "explanation": "",
        "isHidden": true
      },
      {
        "id": "hidden-4",
        "name": "Test #6",
        "input": "((()))",
        "expectedOutput": "6",
        "explanation": "",
        "isHidden": true
      },
      {
        "id": "hidden-5",
        "name": "Test #7",
        "input": "()(())",
        "expectedOutput": "6",
        "explanation": "",
        "isHidden": true
      },
      {
        "id": "hidden-6",
        "name": "Test #8",
        "input": "((((((((",
        "expectedOutput": "0",
        "explanation": "",
        "isHidden": true
      },
      {
        "id": "hidden-7",
        "name": "Test #9",
        "input": "))))))))",
        "expectedOutput": "0",
        "explanation": "",
        "isHidden": true
      },
      {
        "id": "hidden-8",
        "name": "Test #10",
        "input": "())(())",
        "expectedOutput": "4",
        "explanation": "",
        "isHidden": true
      }
    ],
    "starterCode": {
      "c": "#include <stdio.h>\n#include <string.h>\n\nint main() {\n    char s[100005];\n    if (scanf(\"%s\", s) != 1) { printf(\"0\\n\"); return 0; }\n    // Solve using stack or DP\n    return 0;\n}",
      "cpp": "#include <iostream>\n#include <string>\n#include <vector>\n#include <algorithm>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    string s;\n    if (!(cin >> s)) { cout << \"0\\n\"; return 0; }\n    vector<int> st = {-1};\n    int ans = 0;\n    for (int i = 0; i < (int)s.size(); i++) {\n        if (s[i] == '(') st.push_back(i);\n        else {\n            st.pop_back();\n            if (st.empty()) st.push_back(i);\n            else ans = max(ans, i - st.back());\n        }\n    }\n    cout << ans << \"\\n\";\n    return 0;\n}",
      "java": "import java.io.*;\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) throws Exception {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        String s = br.readLine();\n        if (s == null) { System.out.println(0); return; }\n        // Solve\n    }\n}",
      "python": "import sys\n\ndef main():\n    s = sys.stdin.read().strip()\n    st = [-1]\n    ans = 0\n    for i, ch in enumerate(s):\n        if ch == \"(\":\n            st.append(i)\n        else:\n            st.pop()\n            if not st:\n                st.append(i)\n            else:\n                ans = max(ans, i - st[-1])\n    print(ans)\n\nif __name__ == \"__main__\":\n    main()"
    }
  },
  {
    "id": "burst-balloons",
    "title": "Fiery Plasma Orbs",
    "difficulty": "Extreme",
    "xp": 10,
    "weapon": "ballista",
    "story": "Toothless encounters N hovering plasma spheres guarding the Dragon's Nest. Bursting sphere i yields coins equal to nums[left] * nums[i] * nums[right], where left and right are the adjacent unburst spheres. Out-of-bounds neighbors are treated as having value 1.",
    "task": "Given N numbers representing coins on each balloon, return the maximum coins you can collect by bursting all balloons wisely.",
    "inputFormat": "Line 1: An integer N (1 <= N <= 300).\nLine 2: N space-separated integers nums[0], ..., nums[N-1] (0 <= nums[i] <= 100).",
    "outputFormat": "Print a single integer: the maximum coin yield.",
    "constraints": [
      "1 <= N <= 300",
      "0 <= nums[i] <= 100"
    ],
    "timeLimitMs": 2000,
    "samples": [
      {
        "id": "sample-1",
        "name": "Case 1",
        "input": "4\n3 1 5 8",
        "expectedOutput": "167",
        "explanation": "Optimal order: burst 1 -> 5 -> 3 -> 8 yields 3*1*5 + 3*5*8 + 1*3*8 + 1*8*1 = 15 + 120 + 24 + 8 = 167.",
        "isHidden": false
      },
      {
        "id": "sample-2",
        "name": "Case 2",
        "input": "2\n1 5",
        "expectedOutput": "10",
        "explanation": "Burst 1 first (1*1*5) + burst 5 (1*5*1) = 5 + 5 = 10.",
        "isHidden": false
      }
    ],
    "hidden": [
      {
        "id": "hidden-1",
        "name": "Test #3",
        "input": "1\n7",
        "expectedOutput": "7",
        "explanation": "",
        "isHidden": true
      },
      {
        "id": "hidden-2",
        "name": "Test #4",
        "input": "3\n1 2 3",
        "expectedOutput": "12",
        "explanation": "",
        "isHidden": true
      },
      {
        "id": "hidden-3",
        "name": "Test #5",
        "input": "4\n2 3 7 9",
        "expectedOutput": "270",
        "explanation": "",
        "isHidden": true
      },
      {
        "id": "hidden-4",
        "name": "Test #6",
        "input": "5\n8 2 6 4 1",
        "expectedOutput": "336",
        "explanation": "",
        "isHidden": true
      },
      {
        "id": "hidden-5",
        "name": "Test #7",
        "input": "6\n3 1 5 8 2 4",
        "expectedOutput": "315",
        "explanation": "",
        "isHidden": true
      },
      {
        "id": "hidden-6",
        "name": "Test #8",
        "input": "5\n9 9 9 9 9",
        "expectedOutput": "2277",
        "explanation": "",
        "isHidden": true
      },
      {
        "id": "hidden-7",
        "name": "Test #9",
        "input": "4\n0 5 0 2",
        "expectedOutput": "15",
        "explanation": "",
        "isHidden": true
      },
      {
        "id": "hidden-8",
        "name": "Test #10",
        "input": "6\n1 1 1 1 1 1",
        "expectedOutput": "6",
        "explanation": "",
        "isHidden": true
      }
    ],
    "starterCode": {
      "c": "#include <stdio.h>\n\nint main() {\n    int n;\n    if (scanf(\"%d\", &n) != 1) return 0;\n    // Solve using interval DP\n    return 0;\n}",
      "cpp": "#include <iostream>\n#include <vector>\n#include <algorithm>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    int n; if (!(cin >> n)) return 0;\n    vector<int> nums(n + 2, 1);\n    for (int i = 1; i <= n; i++) cin >> nums[i];\n    vector<vector<int>> dp(n + 2, vector<int>(n + 2, 0));\n    for (int len = 1; len <= n; len++) {\n        for (int l = 1; l <= n - len + 1; l++) {\n            int r = l + len - 1;\n            for (int k = l; k <= r; k++) {\n                int coins = nums[l-1] * nums[k] * nums[r+1] + dp[l][k-1] + dp[k+1][r];\n                dp[l][r] = max(dp[l][r], coins);\n            }\n        }\n    }\n    cout << dp[1][n] << \"\\n\";\n    return 0;\n}",
      "java": "import java.io.*;\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) throws Exception {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        String line = br.readLine();\n        if (line == null) return;\n        int n = Integer.parseInt(line.trim());\n        // Solve\n    }\n}",
      "python": "import sys\n\ndef main():\n    t = sys.stdin.read().split()\n    if not t: return\n    n = int(t[0])\n    nums = [1] + [int(x) for x in t[1:1+n]] + [1]\n    dp = [[0]*(n+2) for _ in range(n+2)]\n    for length in range(1, n+1):\n        for l in range(1, n - length + 2):\n            r = l + length - 1\n            for k in range(l, r + 1):\n                coins = nums[l-1]*nums[k]*nums[r+1] + dp[l][k-1] + dp[k+1][r]\n                if coins > dp[l][r]: dp[l][r] = coins\n    print(dp[1][n])\n\nif __name__ == \"__main__\":\n    main()"
    }
  },
  {
    "id": "shortest-path-k-free",
    "title": "Dragon Flight Corridors",
    "difficulty": "Extreme",
    "xp": 10,
    "weapon": "ballista",
    "story": "To reach the Dragon's Nest (island N) from Berk (island 1), dragon riders must navigate M wind corridors with travel energy costs. Toothless can activate supersonic dives up to K times, reducing the cost of up to K traversed corridors to 0.",
    "task": "Given a weighted undirected graph with N vertices and M edges, find the minimum cost to travel from vertex 1 to vertex N, given that you can set the weight of up to K edges on your path to 0.",
    "inputFormat": "Line 1: Three integers N, M, K (1 <= N <= 10^4, 0 <= M <= 5*10^4, 0 <= K <= 10).\nNext M lines: Three integers u, v, w (1 <= u, v <= N, 0 <= w <= 10^6).",
    "outputFormat": "Print a single integer: the minimum total flight cost, or -1 if unreachable.",
    "constraints": [
      "1 <= N <= 10,000",
      "0 <= M <= 50,000",
      "0 <= K <= 10",
      "0 <= w <= 1,000,000"
    ],
    "timeLimitMs": 2000,
    "samples": [
      {
        "id": "sample-1",
        "name": "Case 1",
        "input": "4 4 1\n1 2 10\n2 4 10\n1 3 5\n3 4 20",
        "expectedOutput": "5",
        "explanation": "Path 1 -> 3 -> 4 has cost 5 + 20. Using 1 free pass on edge 3-4 (cost 20) yields minimum total cost 5 + 0 = 5.",
        "isHidden": false
      },
      {
        "id": "sample-2",
        "name": "Case 2",
        "input": "3 2 0\n1 2 7\n2 3 8",
        "expectedOutput": "15",
        "explanation": "Path 1 -> 2 -> 3 with 0 free edges has total cost 7 + 8 = 15.",
        "isHidden": false
      }
    ],
    "hidden": [
      {
        "id": "hidden-1",
        "name": "Test #3",
        "input": "2 1 1\n1 2 50",
        "expectedOutput": "0",
        "explanation": "",
        "isHidden": true
      },
      {
        "id": "hidden-2",
        "name": "Test #4",
        "input": "3 1 1\n1 2 10",
        "expectedOutput": "-1",
        "explanation": "",
        "isHidden": true
      },
      {
        "id": "hidden-3",
        "name": "Test #5",
        "input": "4 3 2\n1 2 100\n2 3 200\n3 4 300",
        "expectedOutput": "100",
        "explanation": "",
        "isHidden": true
      },
      {
        "id": "hidden-4",
        "name": "Test #6",
        "input": "5 6 1\n1 2 10\n2 5 20\n1 3 5\n3 4 5\n4 5 100\n1 5 50",
        "expectedOutput": "0",
        "explanation": "",
        "isHidden": true
      },
      {
        "id": "hidden-5",
        "name": "Test #7",
        "input": "3 3 2\n1 2 10\n2 3 10\n1 3 25",
        "expectedOutput": "0",
        "explanation": "",
        "isHidden": true
      },
      {
        "id": "hidden-6",
        "name": "Test #8",
        "input": "4 4 0\n1 2 1\n2 3 2\n3 4 3\n1 4 10",
        "expectedOutput": "6",
        "explanation": "",
        "isHidden": true
      },
      {
        "id": "hidden-7",
        "name": "Test #9",
        "input": "5 4 2\n1 2 5\n2 3 5\n3 4 5\n4 5 5",
        "expectedOutput": "10",
        "explanation": "",
        "isHidden": true
      },
      {
        "id": "hidden-8",
        "name": "Test #10",
        "input": "1 0 0",
        "expectedOutput": "0",
        "explanation": "",
        "isHidden": true
      }
    ],
    "starterCode": {
      "c": "#include <stdio.h>\n\nint main() {\n    int n, m, k;\n    if (scanf(\"%d %d %d\", &n, &m, &k) != 3) return 0;\n    // Solve with Dijkstra on layered state graph\n    return 0;\n}",
      "cpp": "#include <iostream>\n#include <vector>\n#include <queue>\nusing namespace std;\n\nstruct Edge { int to; long long w; };\nstruct State {\n    long long d; int u, used;\n    bool operator>(const State& o) const { return d > o.d; }\n};\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    int n, m, k;\n    if (!(cin >> n >> m >> k)) return 0;\n    vector<vector<Edge>> adj(n + 1);\n    for (int i = 0; i < m; i++) {\n        int u, v; long long w;\n        cin >> u >> v >> w;\n        adj[u].push_back({v, w});\n        adj[v].push_back({u, w});\n    }\n    const long long INF = 1e18;\n    vector<vector<long long>> dist(n + 1, vector<long long>(k + 1, INF));\n    dist[1][0] = 0;\n    priority_queue<State, vector<State>, greater<State>> pq;\n    pq.push({0, 1, 0});\n    while (!pq.empty()) {\n        auto [d, u, used] = pq.top(); pq.pop();\n        if (d > dist[u][used]) continue;\n        if (u == n) { cout << d << \"\\n\"; return 0; }\n        for (auto& e : adj[u]) {\n            if (d + e.w < dist[e.to][used]) {\n                dist[e.to][used] = d + e.w;\n                pq.push({d + e.w, e.to, used});\n            }\n            if (used < k && d < dist[e.to][used + 1]) {\n                dist[e.to][used + 1] = d;\n                pq.push({d, e.to, used + 1});\n            }\n        }\n    }\n    long long ans = INF;\n    for (int i = 0; i <= k; i++) ans = min(ans, dist[n][i]);\n    cout << (ans == INF ? -1 : ans) << \"\\n\";\n    return 0;\n}",
      "java": "import java.io.*;\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) throws Exception {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        String line = br.readLine();\n        if (line == null) return;\n        StringTokenizer st = new StringTokenizer(line);\n        int n = Integer.parseInt(st.nextToken());\n        int m = Integer.parseInt(st.nextToken());\n        int k = Integer.parseInt(st.nextToken());\n        // Solve\n    }\n}",
      "python": "import sys, heapq\n\ndef main():\n    t = sys.stdin.read().split()\n    if not t: return\n    n, m, k = int(t[0]), int(t[1]), int(t[2])\n    adj = [[] for _ in range(n + 1)]\n    idx = 3\n    for _ in range(m):\n        u, v, w = int(t[idx]), int(t[idx+1]), int(t[idx+2])\n        adj[u].append((v, w))\n        adj[v].append((u, w))\n        idx += 3\n    dist = [[float(\"inf\")] * (k + 1) for _ in range(n + 1)]\n    dist[1][0] = 0\n    pq = [(0, 1, 0)]\n    while pq:\n        d, u, used = heapq.heappop(pq)\n        if d > dist[u][used]: continue\n        if u == n:\n            print(d)\n            return\n        for v, w in adj[u]:\n            if d + w < dist[v][used]:\n                dist[v][used] = d + w\n                heapq.heappush(pq, (d + w, v, used))\n            if used < k and d < dist[v][used + 1]:\n                dist[v][used + 1] = d\n                heapq.heappush(pq, (d, v, used + 1))\n    ans = min(dist[n])\n    print(ans if ans != float(\"inf\") else -1)\n\nif __name__ == \"__main__\":\n    main()"
    }
  },
  {
    "id": "count-of-range-sum",
    "title": "Resonance Crystal Array",
    "difficulty": "Extreme",
    "xp": 10,
    "weapon": "ballista",
    "story": "Viking mystics arrange N dragon energy crystals in an altar row. Each crystal possesses a resonance charge. Find how many contiguous subarrays of crystals create a combined resonance sum that falls within the safe threshold [lo, hi].",
    "task": "Given an integer array nums and two integers lower and upper, return the number of range sums that lie in [lower, upper] inclusive. A range sum S(i, j) is the sum of elements between indices i and j (i <= j).",
    "inputFormat": "Line 1: Three integers N, lower, and upper (1 <= N <= 10^5, -10^9 <= lower <= upper <= 10^9).\nLine 2: N space-separated integers nums[0], ..., nums[N-1] (-10^5 <= nums[i] <= 10^5).",
    "outputFormat": "Print a single integer: the count of valid subarrays.",
    "constraints": [
      "1 <= N <= 100,000",
      "-10^9 <= lower <= upper <= 10^9",
      "-10^5 <= nums[i] <= 10^5"
    ],
    "timeLimitMs": 2000,
    "samples": [
      {
        "id": "sample-1",
        "name": "Case 1",
        "input": "3 -2 2\n-2 5 -1",
        "expectedOutput": "3",
        "explanation": "The three ranges are [0,0] -> -2, [2,2] -> -1, and [0,2] -> 2. All have sums in [-2, 2].",
        "isHidden": false
      },
      {
        "id": "sample-2",
        "name": "Case 2",
        "input": "1 0 0\n0",
        "expectedOutput": "1",
        "explanation": "The single element [0] has sum 0, which lies in [0, 0].",
        "isHidden": false
      }
    ],
    "hidden": [
      {
        "id": "hidden-1",
        "name": "Test #3",
        "input": "4 -1 1\n0 0 0 0",
        "expectedOutput": "10",
        "explanation": "",
        "isHidden": true
      },
      {
        "id": "hidden-2",
        "name": "Test #4",
        "input": "5 1 5\n1 2 3 4 5",
        "expectedOutput": "7",
        "explanation": "",
        "isHidden": true
      },
      {
        "id": "hidden-3",
        "name": "Test #5",
        "input": "5 -5 -1\n-1 -2 -3 -4 -5",
        "expectedOutput": "7",
        "explanation": "",
        "isHidden": true
      },
      {
        "id": "hidden-4",
        "name": "Test #6",
        "input": "4 0 2\n-1 1 -1 1",
        "expectedOutput": "7",
        "explanation": "",
        "isHidden": true
      },
      {
        "id": "hidden-5",
        "name": "Test #7",
        "input": "6 -10 10\n100 -100 50 -50 20 -20",
        "expectedOutput": "6",
        "explanation": "",
        "isHidden": true
      },
      {
        "id": "hidden-6",
        "name": "Test #8",
        "input": "3 10 20\n1 2 3",
        "expectedOutput": "0",
        "explanation": "",
        "isHidden": true
      },
      {
        "id": "hidden-7",
        "name": "Test #9",
        "input": "5 -3 3\n2 -2 2 -2 2",
        "expectedOutput": "15",
        "explanation": "",
        "isHidden": true
      },
      {
        "id": "hidden-8",
        "name": "Test #10",
        "input": "6 -2 4\n-1 2 -3 4 -5 6",
        "expectedOutput": "15",
        "explanation": "",
        "isHidden": true
      }
    ],
    "starterCode": {
      "c": "#include <stdio.h>\n\nint main() {\n    int n; long long lo, hi;\n    if (scanf(\"%d %lld %lld\", &n, &lo, &hi) != 3) return 0;\n    // Solve using merge-sort or Fenwick tree\n    return 0;\n}",
      "cpp": "#include <iostream>\n#include <vector>\nusing namespace std;\n\nlong long lo, hi, ans = 0;\nvector<long long> p;\n\nvoid countSort(int l, int r) {\n    if (l >= r) return;\n    int mid = (l + r) / 2;\n    countSort(l, mid);\n    countSort(mid + 1, r);\n    int j1 = mid + 1, j2 = mid + 1;\n    for (int i = l; i <= mid; i++) {\n        while (j1 <= r && p[j1] - p[i] < lo) j1++;\n        while (j2 <= r && p[j2] - p[i] <= hi) j2++;\n        ans += (j2 - j1);\n    }\n    vector<long long> temp;\n    int i = l, j = mid + 1;\n    while (i <= mid && j <= r) {\n        if (p[i] <= p[j]) temp.push_back(p[i++]);\n        else temp.push_back(p[j++]);\n    }\n    while (i <= mid) temp.push_back(p[i++]);\n    while (j <= r) temp.push_back(p[j++]);\n    for (int k = 0; k < (int)temp.size(); k++) p[l + k] = temp[k];\n}\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    int n;\n    if (!(cin >> n >> lo >> hi)) return 0;\n    p.assign(n + 1, 0);\n    for (int i = 1; i <= n; i++) {\n        long long x; cin >> x;\n        p[i] = p[i - 1] + x;\n    }\n    countSort(0, n);\n    cout << ans << \"\\n\";\n    return 0;\n}",
      "java": "import java.io.*;\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) throws Exception {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        String line = br.readLine();\n        if (line == null) return;\n        StringTokenizer st = new StringTokenizer(line);\n        int n = Integer.parseInt(st.nextToken());\n        long lo = Long.parseLong(st.nextToken());\n        long hi = Long.parseLong(st.nextToken());\n        // Solve\n    }\n}",
      "python": "import sys\n\ndef main():\n    t = sys.stdin.read().split()\n    if not t: return\n    n, lo, hi = int(t[0]), int(t[1]), int(t[2])\n    nums = [int(x) for x in t[3:3+n]]\n    prefix = [0]\n    for x in nums: prefix.append(prefix[-1] + x)\n    ans = 0\n    def count_sort(l, r):\n        nonlocal ans\n        if l >= r: return [prefix[l]]\n        mid = (l + r) // 2\n        left = count_sort(l, mid)\n        right = count_sort(mid + 1, r)\n        j1 = j2 = 0\n        for x in left:\n            while j1 < len(right) and right[j1] - x < lo: j1 += 1\n            while j2 < len(right) and right[j2] - x <= hi: j2 += 1\n            ans += (j2 - j1)\n        res = []\n        i = j = 0\n        while i < len(left) and j < len(right):\n            if left[i] <= right[j]:\n                res.append(left[i]); i += 1\n            else:\n                res.append(right[j]); j += 1\n        res.extend(left[i:])\n        res.extend(right[j:])\n        return res\n    count_sort(0, len(prefix) - 1)\n    print(ans)\n\nif __name__ == \"__main__\":\n    main()"
    }
  }
];

export const PROBLEMS_BY_ID = Object.fromEntries(PROBLEMS.map(p => [p.id, p]));

export const PROBLEMS_BY_WEAPON = {
  dagger: PROBLEMS.filter(p => p.weapon === 'dagger'),
  axe: PROBLEMS.filter(p => p.weapon === 'axe'),
  catapult: PROBLEMS.filter(p => p.weapon === 'catapult'),
  ballista: PROBLEMS.filter(p => p.weapon === 'ballista'),
};
