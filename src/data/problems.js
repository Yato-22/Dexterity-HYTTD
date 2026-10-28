// ============================================================================
// 12 ORIGINAL VIKING BATTLE CODING CHALLENGES (CLIENT BUNDLE: SAMPLES ONLY)
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
    "starterCode": {
      "c": "#include <stdio.h>\n\nint main() {\n    int n;\n    long long target;\n    if (scanf(\"%d %lld\", &n, &target) != 2) return 0;\n    long long a[n];\n    for (int i = 0; i < n; i++) {\n        scanf(\"%lld\", &a[i]);\n    }\n    // Write your solution here\n    return 0;\n}",
      "cpp": "#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    int n;\n    long long target;\n    if (!(cin >> n >> target)) return 0;\n    vector<long long> a(n);\n    for (int i = 0; i < n; i++) cin >> a[i];\n    // Write your solution here\n    return 0;\n}",
      "java": "import java.io.*;\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) throws Exception {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        String line = br.readLine();\n        if (line == null) return;\n        StringTokenizer st = new StringTokenizer(line);\n        int n = Integer.parseInt(st.nextToken());\n        long target = Long.parseLong(st.nextToken());\n        long[] a = new long[n];\n        st = new StringTokenizer(br.readLine());\n        for (int i = 0; i < n; i++) a[i] = Long.parseLong(st.nextToken());\n        // Write your solution here\n    }\n}",
      "python": "import sys\n\ndef main():\n    data = sys.stdin.read().split()\n    if not data:\n        return\n    n, target = int(data[0]), int(data[1])\n    arr = [int(x) for x in data[2:2 + n]]\n    # Write your solution here\n\nif __name__ == \"__main__\":\n    main()"
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
    "starterCode": {
      "c": "#include <stdio.h>\n#include <string.h>\n\nint main() {\n    char s[100005];\n    if (scanf(\"%s\", s) != 1) return 0;\n    // Write your solution here\n    return 0;\n}",
      "cpp": "#include <iostream>\n#include <string>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    string s;\n    if (!(cin >> s)) return 0;\n    // Write your solution here\n    return 0;\n}",
      "java": "import java.io.*;\n\npublic class Main {\n    public static void main(String[] args) throws Exception {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        String s = br.readLine();\n        if (s == null) return;\n        s = s.trim();\n        // Write your solution here\n    }\n}",
      "python": "import sys\n\ndef main():\n    s = sys.stdin.read().strip()\n    if not s:\n        print(\"YES\")\n        return\n    # Write your solution here\n\nif __name__ == \"__main__\":\n    main()"
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
    "starterCode": {
      "c": "#include <stdio.h>\n\nint main() {\n    long long x;\n    if (scanf(\"%lld\", &x) != 1) return 0;\n    // Write your solution here\n    return 0;\n}",
      "cpp": "#include <iostream>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    long long x;\n    if (!(cin >> x)) return 0;\n    // Write your solution here\n    return 0;\n}",
      "java": "import java.io.*;\n\npublic class Main {\n    public static void main(String[] args) throws Exception {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        String line = br.readLine();\n        if (line == null) return;\n        long x = Long.parseLong(line.trim());\n        // Write your solution here\n    }\n}",
      "python": "import sys\n\ndef main():\n    line = sys.stdin.read().strip()\n    if not line:\n        return\n    x = int(line)\n    # Write your solution here\n\nif __name__ == \"__main__\":\n    main()"
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
    "starterCode": {
      "c": "#include <stdio.h>\n#include <string.h>\n\nint main() {\n    char s[100005];\n    if (scanf(\"%s\", s) != 1) {\n        printf(\"0\\n\");\n        return 0;\n    }\n    // Write your solution here\n    return 0;\n}",
      "cpp": "#include <iostream>\n#include <string>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    string s;\n    if (!(cin >> s)) {\n        cout << 0 << \"\\n\";\n        return 0;\n    }\n    // Write your solution here\n    return 0;\n}",
      "java": "import java.io.*;\n\npublic class Main {\n    public static void main(String[] args) throws Exception {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        String s = br.readLine();\n        if (s == null) {\n            System.out.println(0);\n            return;\n        }\n        // Write your solution here\n    }\n}",
      "python": "import sys\n\ndef main():\n    s = sys.stdin.read().strip()\n    if not s:\n        print(0)\n        return\n    # Write your solution here\n\nif __name__ == \"__main__\":\n    main()"
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
    "starterCode": {
      "c": "#include <stdio.h>\n\nint main() {\n    int n;\n    if (scanf(\"%d\", &n) != 1) return 0;\n    // Read N intervals (L, R) and print merged intervals\n    // Write your solution here\n    return 0;\n}",
      "cpp": "#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    int n;\n    if (!(cin >> n)) return 0;\n    vector<pair<long long, long long>> intervals(n);\n    for (int i = 0; i < n; i++) cin >> intervals[i].first >> intervals[i].second;\n    // Write your solution here\n    return 0;\n}",
      "java": "import java.io.*;\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) throws Exception {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        String line = br.readLine();\n        if (line == null) return;\n        int n = Integer.parseInt(line.trim());\n        // Read N intervals and solve\n        // Write your solution here\n    }\n}",
      "python": "import sys\n\ndef main():\n    data = sys.stdin.read().split()\n    if not data:\n        return\n    n = int(data[0])\n    intervals = []\n    idx = 1\n    for _ in range(n):\n        intervals.append((int(data[idx]), int(data[idx + 1])))\n        idx += 2\n    # Write your solution here\n\nif __name__ == \"__main__\":\n    main()"
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
    "starterCode": {
      "c": "#include <stdio.h>\n\nint main() {\n    int r, c;\n    if (scanf(\"%d %d\", &r, &c) != 2) return 0;\n    // Read grid and count islands\n    // Write your solution here\n    return 0;\n}",
      "cpp": "#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    int r, c;\n    if (!(cin >> r >> c)) return 0;\n    vector<vector<int>> grid(r, vector<int>(c));\n    for (int i = 0; i < r; i++) {\n        for (int j = 0; j < c; j++) cin >> grid[i][j];\n    }\n    // Write your solution here\n    return 0;\n}",
      "java": "import java.io.*;\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) throws Exception {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        String line = br.readLine();\n        if (line == null) return;\n        StringTokenizer st = new StringTokenizer(line);\n        int r = Integer.parseInt(st.nextToken());\n        int c = Integer.parseInt(st.nextToken());\n        int[][] grid = new int[r][c];\n        // Read grid and count islands\n        // Write your solution here\n    }\n}",
      "python": "import sys\n\ndef main():\n    data = sys.stdin.read().split()\n    if not data:\n        return\n    r, c = int(data[0]), int(data[1])\n    grid = []\n    idx = 2\n    for _ in range(r):\n        grid.append([int(x) for x in data[idx:idx + c]])\n        idx += c\n    # Write your solution here\n\nif __name__ == \"__main__\":\n    main()"
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
    "starterCode": {
      "c": "#include <stdio.h>\n\nint main() {\n    int n;\n    if (scanf(\"%d\", &n) != 1) return 0;\n    int height[n];\n    for (int i = 0; i < n; i++) scanf(\"%d\", &height[i]);\n    // Write your solution here\n    return 0;\n}",
      "cpp": "#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    int n;\n    if (!(cin >> n)) return 0;\n    vector<int> height(n);\n    for (int i = 0; i < n; i++) cin >> height[i];\n    // Write your solution here\n    return 0;\n}",
      "java": "import java.io.*;\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) throws Exception {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        String line = br.readLine();\n        if (line == null) return;\n        int n = Integer.parseInt(line.trim());\n        int[] height = new int[n];\n        StringTokenizer st = new StringTokenizer(br.readLine());\n        for (int i = 0; i < n; i++) height[i] = Integer.parseInt(st.nextToken());\n        // Write your solution here\n    }\n}",
      "python": "import sys\n\ndef main():\n    data = sys.stdin.read().split()\n    if not data:\n        return\n    n = int(data[0])\n    height = [int(x) for x in data[1:1 + n]]\n    # Write your solution here\n\nif __name__ == \"__main__\":\n    main()"
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
    "starterCode": {
      "c": "#include <stdio.h>\n#include <string.h>\n\nint main() {\n    char w1[1005], w2[1005];\n    if (scanf(\"%s %s\", w1, w2) < 1) return 0;\n    // Write your solution here\n    return 0;\n}",
      "cpp": "#include <iostream>\n#include <string>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    string w1, w2;\n    if (!(cin >> w1)) return 0;\n    if (!(cin >> w2)) w2 = \"\";\n    // Write your solution here\n    return 0;\n}",
      "java": "import java.io.*;\n\npublic class Main {\n    public static void main(String[] args) throws Exception {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        String w1 = br.readLine();\n        String w2 = br.readLine();\n        if (w1 == null) w1 = \"\";\n        if (w2 == null) w2 = \"\";\n        // Write your solution here\n    }\n}",
      "python": "import sys\n\ndef main():\n    lines = sys.stdin.read().splitlines()\n    w1 = lines[0] if len(lines) > 0 else \"\"\n    w2 = lines[1] if len(lines) > 1 else \"\"\n    # Write your solution here\n\nif __name__ == \"__main__\":\n    main()"
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
    "starterCode": {
      "c": "#include <stdio.h>\n#include <string.h>\n\nint main() {\n    char s[100005];\n    if (scanf(\"%s\", s) != 1) {\n        printf(\"0\\n\");\n        return 0;\n    }\n    // Write your solution here\n    return 0;\n}",
      "cpp": "#include <iostream>\n#include <string>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    string s;\n    if (!(cin >> s)) {\n        cout << 0 << \"\\n\";\n        return 0;\n    }\n    // Write your solution here\n    return 0;\n}",
      "java": "import java.io.*;\n\npublic class Main {\n    public static void main(String[] args) throws Exception {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        String s = br.readLine();\n        if (s == null) {\n            System.out.println(0);\n            return;\n        }\n        // Write your solution here\n    }\n}",
      "python": "import sys\n\ndef main():\n    s = sys.stdin.read().strip()\n    if not s:\n        print(0)\n        return\n    # Write your solution here\n\nif __name__ == \"__main__\":\n    main()"
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
    "starterCode": {
      "c": "#include <stdio.h>\n\nint main() {\n    int n;\n    if (scanf(\"%d\", &n) != 1) return 0;\n    int nums[n];\n    for (int i = 0; i < n; i++) scanf(\"%d\", &nums[i]);\n    // Write your solution here\n    return 0;\n}",
      "cpp": "#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    int n;\n    if (!(cin >> n)) return 0;\n    vector<int> nums(n);\n    for (int i = 0; i < n; i++) cin >> nums[i];\n    // Write your solution here\n    return 0;\n}",
      "java": "import java.io.*;\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) throws Exception {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        String line = br.readLine();\n        if (line == null) return;\n        int n = Integer.parseInt(line.trim());\n        int[] nums = new int[n];\n        StringTokenizer st = new StringTokenizer(br.readLine());\n        for (int i = 0; i < n; i++) nums[i] = Integer.parseInt(st.nextToken());\n        // Write your solution here\n    }\n}",
      "python": "import sys\n\ndef main():\n    data = sys.stdin.read().split()\n    if not data:\n        return\n    n = int(data[0])\n    nums = [int(x) for x in data[1:1 + n]]\n    # Write your solution here\n\nif __name__ == \"__main__\":\n    main()"
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
    "starterCode": {
      "c": "#include <stdio.h>\n\nint main() {\n    int n, m, k;\n    if (scanf(\"%d %d %d\", &n, &m, &k) != 3) return 0;\n    // Read M flight corridors (u, v, w) and solve\n    // Write your solution here\n    return 0;\n}",
      "cpp": "#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    int n, m, k;\n    if (!(cin >> n >> m >> k)) return 0;\n    // Read M flight corridors (u, v, w) and solve\n    // Write your solution here\n    return 0;\n}",
      "java": "import java.io.*;\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) throws Exception {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        String line = br.readLine();\n        if (line == null) return;\n        StringTokenizer st = new StringTokenizer(line);\n        int n = Integer.parseInt(st.nextToken());\n        int m = Integer.parseInt(st.nextToken());\n        int k = Integer.parseInt(st.nextToken());\n        // Read M flight corridors (u, v, w) and solve\n        // Write your solution here\n    }\n}",
      "python": "import sys\n\ndef main():\n    data = sys.stdin.read().split()\n    if not data:\n        return\n    n, m, k = int(data[0]), int(data[1]), int(data[2])\n    # Read M flight corridors (u, v, w) and solve\n    # Write your solution here\n\nif __name__ == \"__main__\":\n    main()"
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
    "starterCode": {
      "c": "#include <stdio.h>\n\nint main() {\n    int n;\n    long long lower, upper;\n    if (scanf(\"%d %lld %lld\", &n, &lower, &upper) != 3) return 0;\n    long long nums[n];\n    for (int i = 0; i < n; i++) scanf(\"%lld\", &nums[i]);\n    // Write your solution here\n    return 0;\n}",
      "cpp": "#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    int n;\n    long long lower, upper;\n    if (!(cin >> n >> lower >> upper)) return 0;\n    vector<long long> nums(n);\n    for (int i = 0; i < n; i++) cin >> nums[i];\n    // Write your solution here\n    return 0;\n}",
      "java": "import java.io.*;\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) throws Exception {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        String line = br.readLine();\n        if (line == null) return;\n        StringTokenizer st = new StringTokenizer(line);\n        int n = Integer.parseInt(st.nextToken());\n        long lower = Long.parseLong(st.nextToken());\n        long upper = Long.parseLong(st.nextToken());\n        long[] nums = new long[n];\n        StringTokenizer st2 = new StringTokenizer(br.readLine());\n        for (int i = 0; i < n; i++) nums[i] = Long.parseLong(st2.nextToken());\n        // Write your solution here\n    }\n}",
      "python": "import sys\n\ndef main():\n    data = sys.stdin.read().split()\n    if not data:\n        return\n    n = int(data[0])\n    lower, upper = int(data[1]), int(data[2])\n    nums = [int(x) for x in data[3:3 + n]]\n    # Write your solution here\n\nif __name__ == \"__main__\":\n    main()"
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
