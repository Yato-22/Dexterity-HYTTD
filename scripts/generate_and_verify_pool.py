import json
import os
import subprocess
import sys

problems = []

# ==============================================================================
# TIER 1: DAGGER (2 XP)
# ==============================================================================

# 1. Sum of Two Numbers
p1 = {
    "id": "sum-of-two-numbers",
    "tier": "dagger",
    "title": "Sum of Two Numbers",
    "difficulty": "Easy",
    "xp": 2,
    "weapon": "dagger",
    "story": "Viking warriors combine their spoils of battle into a single chest.",
    "task": "Given two integers A and B, print their sum.",
    "inputFormat": "A single line containing two space-separated integers A and B.",
    "outputFormat": "Print the sum A + B.",
    "constraints": ["-1000 <= A, B <= 1000"],
    "timeLimitMs": 2000,
    "samples": [
        {"id": "sample-1", "name": "Case 1", "input": "3 5", "expectedOutput": "8", "explanation": "3 + 5 = 8", "isHidden": False},
        {"id": "sample-2", "name": "Case 2", "input": "-10 4", "expectedOutput": "-6", "explanation": "-10 + 4 = -6", "isHidden": False}
    ],
    "hiddenTests": [
        {"id": "hidden-1", "name": "Hidden 1", "input": "0 0", "expectedOutput": "0", "isHidden": True},
        {"id": "hidden-2", "name": "Hidden 2", "input": "-50 -20", "expectedOutput": "-70", "isHidden": True},
        {"id": "hidden-3", "name": "Hidden 3", "input": "1000 1000", "expectedOutput": "2000", "isHidden": True},
        {"id": "hidden-4", "name": "Hidden 4", "input": "-1000 1000", "expectedOutput": "0", "isHidden": True},
        {"id": "hidden-5", "name": "Hidden 5", "input": "42 -42", "expectedOutput": "0", "isHidden": True},
        {"id": "hidden-6", "name": "Hidden 6", "input": "999 -1", "expectedOutput": "998", "isHidden": True}
    ],
    "starterCode": {
        "c": "#include <stdio.h>\n\nint main() {\n    int a, b;\n    if (scanf(\"%d %d\", &a, &b) != 2) return 0;\n    // Write your solution here\n    return 0;\n}",
        "cpp": "#include <iostream>\nusing namespace std;\n\nint main() {\n    int a, b;\n    if (cin >> a >> b) {\n        // Write your solution here\n    }\n    return 0;\n}",
        "java": "import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int a = sc.nextInt();\n            int b = sc.nextInt();\n            // Write your solution here\n        }\n    }\n}",
        "python": "import sys\n\ndef main():\n    tokens = sys.stdin.read().split()\n    if not tokens:\n        return\n    a, b = int(tokens[0]), int(tokens[1])\n    # Write your solution here\n\nif __name__ == '__main__':\n    main()"
    },
    "sol1": "import sys\nt = sys.stdin.read().split()\nif t:\n    print(int(t[0]) + int(t[1]))\n",
    "sol2": "import sys\nt = sys.stdin.read().split()\nif t:\n    ans = sum(map(int, t[:2]))\n    sys.stdout.write(str(ans) + '\\n')\n"
}
problems.append(p1)

# 2. Even or Odd
p2 = {
    "id": "even-or-odd",
    "tier": "dagger",
    "title": "Even or Odd",
    "difficulty": "Easy",
    "xp": 2,
    "weapon": "dagger",
    "story": "The seer divides the clan into two scouting parties based on numbers.",
    "task": "Given an integer N, print 'EVEN' if N is even, or 'ODD' if N is odd.",
    "inputFormat": "A single integer N.",
    "outputFormat": "Print EVEN or ODD.",
    "constraints": ["-1000 <= N <= 1000"],
    "timeLimitMs": 2000,
    "samples": [
        {"id": "sample-1", "name": "Case 1", "input": "4", "expectedOutput": "EVEN", "explanation": "4 is divisible by 2.", "isHidden": False},
        {"id": "sample-2", "name": "Case 2", "input": "7", "expectedOutput": "ODD", "explanation": "7 is not divisible by 2.", "isHidden": False}
    ],
    "hiddenTests": [
        {"id": "hidden-1", "name": "Hidden 1", "input": "0", "expectedOutput": "EVEN", "isHidden": True},
        {"id": "hidden-2", "name": "Hidden 2", "input": "-2", "expectedOutput": "EVEN", "isHidden": True},
        {"id": "hidden-3", "name": "Hidden 3", "input": "-3", "expectedOutput": "ODD", "isHidden": True},
        {"id": "hidden-4", "name": "Hidden 4", "input": "100", "expectedOutput": "EVEN", "isHidden": True},
        {"id": "hidden-5", "name": "Hidden 5", "input": "999", "expectedOutput": "ODD", "isHidden": True},
        {"id": "hidden-6", "name": "Hidden 6", "input": "-1000", "expectedOutput": "EVEN", "isHidden": True}
    ],
    "starterCode": {
        "c": "#include <stdio.h>\n\nint main() {\n    int n;\n    if (scanf(\"%d\", &n) != 1) return 0;\n    // Write your solution here\n    return 0;\n}",
        "cpp": "#include <iostream>\nusing namespace std;\n\nint main() {\n    int n;\n    if (cin >> n) {\n        // Write your solution here\n    }\n    return 0;\n}",
        "java": "import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int n = sc.nextInt();\n            // Write your solution here\n        }\n    }\n}",
        "python": "import sys\n\ndef main():\n    tokens = sys.stdin.read().split()\n    if not tokens:\n        return\n    n = int(tokens[0])\n    # Write your solution here\n\nif __name__ == '__main__':\n    main()"
    },
    "sol1": "import sys\nt = sys.stdin.read().split()\nif t:\n    n = int(t[0])\n    print('EVEN' if n % 2 == 0 else 'ODD')\n",
    "sol2": "import sys\nt = sys.stdin.read().split()\nif t:\n    n = int(t[0])\n    print('ODD' if (n & 1) else 'EVEN')\n"
}
problems.append(p2)

# 3. Largest of Three
p3 = {
    "id": "largest-of-three",
    "tier": "dagger",
    "title": "Largest of Three",
    "difficulty": "Easy",
    "xp": 2,
    "weapon": "dagger",
    "story": "Three clan champions boast of their battle strength; find the mightiest.",
    "task": "Given three integers A, B, and C, find and print the largest value.",
    "inputFormat": "Three space-separated integers A, B, and C.",
    "outputFormat": "Print the maximum of the three numbers.",
    "constraints": ["-1000 <= A, B, C <= 1000"],
    "timeLimitMs": 2000,
    "samples": [
        {"id": "sample-1", "name": "Case 1", "input": "1 5 3", "expectedOutput": "5", "explanation": "5 is the largest.", "isHidden": False},
        {"id": "sample-2", "name": "Case 2", "input": "10 10 2", "expectedOutput": "10", "explanation": "10 is the largest.", "isHidden": False}
    ],
    "hiddenTests": [
        {"id": "hidden-1", "name": "Hidden 1", "input": "-5 -10 -2", "expectedOutput": "-2", "isHidden": True},
        {"id": "hidden-2", "name": "Hidden 2", "input": "7 7 7", "expectedOutput": "7", "isHidden": True},
        {"id": "hidden-3", "name": "Hidden 3", "input": "0 0 1", "expectedOutput": "1", "isHidden": True},
        {"id": "hidden-4", "name": "Hidden 4", "input": "1000 -1000 0", "expectedOutput": "1000", "isHidden": True},
        {"id": "hidden-5", "name": "Hidden 5", "input": "-50 0 -50", "expectedOutput": "0", "isHidden": True},
        {"id": "hidden-6", "name": "Hidden 6", "input": "12 99 99", "expectedOutput": "99", "isHidden": True}
    ],
    "starterCode": {
        "c": "#include <stdio.h>\n\nint main() {\n    int a, b, c;\n    if (scanf(\"%d %d %d\", &a, &b, &c) != 3) return 0;\n    // Write your solution here\n    return 0;\n}",
        "cpp": "#include <iostream>\nusing namespace std;\n\nint main() {\n    int a, b, c;\n    if (cin >> a >> b >> c) {\n        // Write your solution here\n    }\n    return 0;\n}",
        "java": "import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int a = sc.nextInt();\n            int b = sc.nextInt();\n            int c = sc.nextInt();\n            // Write your solution here\n        }\n    }\n}",
        "python": "import sys\n\ndef main():\n    tokens = sys.stdin.read().split()\n    if not tokens:\n        return\n    a, b, c = int(tokens[0]), int(tokens[1]), int(tokens[2])\n    # Write your solution here\n\nif __name__ == '__main__':\n    main()"
    },
    "sol1": "import sys\nt = [int(x) for x in sys.stdin.read().split()]\nif t:\n    print(max(t[0], t[1], t[2]))\n",
    "sol2": "import sys\nt = [int(x) for x in sys.stdin.read().split()]\nif t:\n    ans = t[0]\n    if t[1] > ans: ans = t[1]\n    if t[2] > ans: ans = t[2]\n    print(ans)\n"
}
problems.append(p3)

# 4. Count Vowels
p4 = {
    "id": "count-vowels",
    "tier": "dagger",
    "title": "Count Vowels",
    "difficulty": "Easy",
    "xp": 2,
    "weapon": "dagger",
    "story": "Chant the sacred runes to invoke Thor's blessing.",
    "task": "Given a single word S consisting of lowercase English letters, count the total number of vowels ('a', 'e', 'i', 'o', 'u').",
    "inputFormat": "A single string S.",
    "outputFormat": "Print the number of vowels.",
    "constraints": ["1 <= |S| <= 100", "S contains only lowercase English letters."],
    "timeLimitMs": 2000,
    "samples": [
        {"id": "sample-1", "name": "Case 1", "input": "viking", "expectedOutput": "2", "explanation": "'i' and 'i' are 2 vowels.", "isHidden": False},
        {"id": "sample-2", "name": "Case 2", "input": "dragon", "expectedOutput": "2", "explanation": "'a' and 'o' are 2 vowels.", "isHidden": False}
    ],
    "hiddenTests": [
        {"id": "hidden-1", "name": "Hidden 1", "input": "rhythm", "expectedOutput": "0", "isHidden": True},
        {"id": "hidden-2", "name": "Hidden 2", "input": "aeiou", "expectedOutput": "5", "isHidden": True},
        {"id": "hidden-3", "name": "Hidden 3", "input": "a", "expectedOutput": "1", "isHidden": True},
        {"id": "hidden-4", "name": "Hidden 4", "input": "z", "expectedOutput": "0", "isHidden": True},
        {"id": "hidden-5", "name": "Hidden 5", "input": "valhalla", "expectedOutput": "3", "isHidden": True},
        {"id": "hidden-6", "name": "Hidden 6", "input": "abracadabra", "expectedOutput": "5", "isHidden": True}
    ],
    "starterCode": {
        "c": "#include <stdio.h>\n#include <string.h>\n\nint main() {\n    char s[105];\n    if (scanf(\"%s\", s) != 1) return 0;\n    // Write your solution here\n    return 0;\n}",
        "cpp": "#include <iostream>\n#include <string>\nusing namespace std;\n\nint main() {\n    string s;\n    if (cin >> s) {\n        // Write your solution here\n    }\n    return 0;\n}",
        "java": "import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNext()) {\n            String s = sc.next();\n            // Write your solution here\n        }\n    }\n}",
        "python": "import sys\n\ndef main():\n    tokens = sys.stdin.read().split()\n    if not tokens:\n        return\n    s = tokens[0]\n    # Write your solution here\n\nif __name__ == '__main__':\n    main()"
    },
    "sol1": "import sys\nt = sys.stdin.read().split()\nif t:\n    vowels = set('aeiou')\n    print(sum(1 for c in t[0] if c in vowels))\n",
    "sol2": "import sys\nt = sys.stdin.read().split()\nif t:\n    c = 0\n    for ch in t[0]:\n        if ch in 'aeiou':\n            c += 1\n    print(c)\n"
}
problems.append(p4)

# 5. Reverse a String
p5 = {
    "id": "reverse-a-string",
    "tier": "dagger",
    "title": "Reverse a String",
    "difficulty": "Easy",
    "xp": 2,
    "weapon": "dagger",
    "story": "The sea witch whispers a mirrored runic incantation.",
    "task": "Given a string S consisting of printable non-whitespace characters, print the string reversed.",
    "inputFormat": "A single string S.",
    "outputFormat": "Print the reversed string.",
    "constraints": ["1 <= |S| <= 100"],
    "timeLimitMs": 2000,
    "samples": [
        {"id": "sample-1", "name": "Case 1", "input": "viking", "expectedOutput": "gnikiv", "explanation": "Reversing 'viking' produces 'gnikiv'.", "isHidden": False},
        {"id": "sample-2", "name": "Case 2", "input": "shield", "expectedOutput": "dleihs", "explanation": "Reversing 'shield' produces 'dleihs'.", "isHidden": False}
    ],
    "hiddenTests": [
        {"id": "hidden-1", "name": "Hidden 1", "input": "a", "expectedOutput": "a", "isHidden": True},
        {"id": "hidden-2", "name": "Hidden 2", "input": "racecar", "expectedOutput": "racecar", "isHidden": True},
        {"id": "hidden-3", "name": "Hidden 3", "input": "12345", "expectedOutput": "54321", "isHidden": True},
        {"id": "hidden-4", "name": "Hidden 4", "input": "Odin", "expectedOutput": "nidO", "isHidden": True},
        {"id": "hidden-5", "name": "Hidden 5", "input": "Hello", "expectedOutput": "olleH", "isHidden": True},
        {"id": "hidden-6", "name": "Hidden 6", "input": "xy", "expectedOutput": "yx", "isHidden": True}
    ],
    "starterCode": {
        "c": "#include <stdio.h>\n#include <string.h>\n\nint main() {\n    char s[105];\n    if (scanf(\"%s\", s) != 1) return 0;\n    // Write your solution here\n    return 0;\n}",
        "cpp": "#include <iostream>\n#include <string>\nusing namespace std;\n\nint main() {\n    string s;\n    if (cin >> s) {\n        // Write your solution here\n    }\n    return 0;\n}",
        "java": "import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNext()) {\n            String s = sc.next();\n            // Write your solution here\n        }\n    }\n}",
        "python": "import sys\n\ndef main():\n    tokens = sys.stdin.read().split()\n    if not tokens:\n        return\n    s = tokens[0]\n    # Write your solution here\n\nif __name__ == '__main__':\n    main()"
    },
    "sol1": "import sys\nt = sys.stdin.read().split()\nif t:\n    print(t[0][::-1])\n",
    "sol2": "import sys\nt = sys.stdin.read().split()\nif t:\n    print(''.join(reversed(list(t[0]))))\n"
}
problems.append(p5)

# 6. Sum of Digits
p6 = {
    "id": "sum-of-digits",
    "tier": "dagger",
    "title": "Sum of Digits",
    "difficulty": "Easy",
    "xp": 2,
    "weapon": "dagger",
    "story": "Calculate the mystical rune sum of a sacred talisman.",
    "task": "Given a non-negative integer N, calculate the sum of its decimal digits.",
    "inputFormat": "A single non-negative integer N.",
    "outputFormat": "Print the sum of the digits.",
    "constraints": ["0 <= N <= 10^9"],
    "timeLimitMs": 2000,
    "samples": [
        {"id": "sample-1", "name": "Case 1", "input": "123", "expectedOutput": "6", "explanation": "1 + 2 + 3 = 6.", "isHidden": False},
        {"id": "sample-2", "name": "Case 2", "input": "405", "expectedOutput": "9", "explanation": "4 + 0 + 5 = 9.", "isHidden": False}
    ],
    "hiddenTests": [
        {"id": "hidden-1", "name": "Hidden 1", "input": "0", "expectedOutput": "0", "isHidden": True},
        {"id": "hidden-2", "name": "Hidden 2", "input": "9", "expectedOutput": "9", "isHidden": True},
        {"id": "hidden-3", "name": "Hidden 3", "input": "9999", "expectedOutput": "36", "isHidden": True},
        {"id": "hidden-4", "name": "Hidden 4", "input": "100000", "expectedOutput": "1", "isHidden": True},
        {"id": "hidden-5", "name": "Hidden 5", "input": "123456789", "expectedOutput": "45", "isHidden": True},
        {"id": "hidden-6", "name": "Hidden 6", "input": "50505", "expectedOutput": "15", "isHidden": True}
    ],
    "starterCode": {
        "c": "#include <stdio.h>\n\nint main() {\n    long long n;\n    if (scanf(\"%lld\", &n) != 1) return 0;\n    // Write your solution here\n    return 0;\n}",
        "cpp": "#include <iostream>\nusing namespace std;\n\nint main() {\n    long long n;\n    if (cin >> n) {\n        // Write your solution here\n    }\n    return 0;\n}",
        "java": "import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextLong()) {\n            long n = sc.nextLong();\n            // Write your solution here\n        }\n    }\n}",
        "python": "import sys\n\ndef main():\n    tokens = sys.stdin.read().split()\n    if not tokens:\n        return\n    n = tokens[0]\n    # Write your solution here\n\nif __name__ == '__main__':\n    main()"
    },
    "sol1": "import sys\nt = sys.stdin.read().split()\nif t:\n    print(sum(int(c) for c in t[0]))\n",
    "sol2": "import sys\nt = sys.stdin.read().split()\nif t:\n    n = int(t[0])\n    s = 0\n    if n == 0: s = 0\n    while n > 0:\n        s += n % 10\n        n //= 10\n    print(s)\n"
}
problems.append(p6)

# 7. Leap Year
p7 = {
    "id": "leap-year",
    "tier": "dagger",
    "title": "Leap Year",
    "difficulty": "Easy",
    "xp": 2,
    "weapon": "dagger",
    "story": "Align the clan calendar with the celestial winter solstices.",
    "task": "Given a year Y, determine if it is a leap year. A year is a leap year if it is divisible by 4, except end-of-century years, which must be divisible by 400. Print YES if leap year, else NO.",
    "inputFormat": "A single integer Y.",
    "outputFormat": "Print YES or NO.",
    "constraints": ["1 <= Y <= 3000"],
    "timeLimitMs": 2000,
    "samples": [
        {"id": "sample-1", "name": "Case 1", "input": "2024", "expectedOutput": "YES", "explanation": "2024 is divisible by 4.", "isHidden": False},
        {"id": "sample-2", "name": "Case 2", "input": "1900", "expectedOutput": "NO", "explanation": "1900 is divisible by 100 but not 400.", "isHidden": False}
    ],
    "hiddenTests": [
        {"id": "hidden-1", "name": "Hidden 1", "input": "2000", "expectedOutput": "YES", "isHidden": True},
        {"id": "hidden-2", "name": "Hidden 2", "input": "2023", "expectedOutput": "NO", "isHidden": True},
        {"id": "hidden-3", "name": "Hidden 3", "input": "2400", "expectedOutput": "YES", "isHidden": True},
        {"id": "hidden-4", "name": "Hidden 4", "input": "1800", "expectedOutput": "NO", "isHidden": True},
        {"id": "hidden-5", "name": "Hidden 5", "input": "4", "expectedOutput": "YES", "isHidden": True},
        {"id": "hidden-6", "name": "Hidden 6", "input": "100", "expectedOutput": "NO", "isHidden": True}
    ],
    "starterCode": {
        "c": "#include <stdio.h>\n\nint main() {\n    int y;\n    if (scanf(\"%d\", &y) != 1) return 0;\n    // Write your solution here\n    return 0;\n}",
        "cpp": "#include <iostream>\nusing namespace std;\n\nint main() {\n    int y;\n    if (cin >> y) {\n        // Write your solution here\n    }\n    return 0;\n}",
        "java": "import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int y = sc.nextInt();\n            // Write your solution here\n        }\n    }\n}",
        "python": "import sys\n\ndef main():\n    tokens = sys.stdin.read().split()\n    if not tokens:\n        return\n    y = int(tokens[0])\n    # Write your solution here\n\nif __name__ == '__main__':\n    main()"
    },
    "sol1": "import sys\nt = sys.stdin.read().split()\nif t:\n    y = int(t[0])\n    is_leap = (y % 400 == 0) or (y % 4 == 0 and y % 100 != 0)\n    print('YES' if is_leap else 'NO')\n",
    "sol2": "import sys\nt = sys.stdin.read().split()\nif t:\n    y = int(t[0])\n    ans = 'NO'\n    if y % 4 == 0:\n        if y % 100 == 0:\n            if y % 400 == 0:\n                ans = 'YES'\n        else:\n            ans = 'YES'\n    print(ans)\n"
}
problems.append(p7)

# 8. Sum of an Array
p8 = {
    "id": "sum-of-an-array",
    "tier": "dagger",
    "title": "Sum of an Array",
    "difficulty": "Easy",
    "xp": 2,
    "weapon": "dagger",
    "story": "Tally the weight of dragon scales collected by the war party.",
    "task": "Given an array of N integers, compute and print the sum of all elements.",
    "inputFormat": "Line 1: An integer N (1 <= N <= 100).\nLine 2: N space-separated integers A[1], A[2], ..., A[N].",
    "outputFormat": "Print the total sum.",
    "constraints": ["1 <= N <= 100", "-1000 <= A[i] <= 1000"],
    "timeLimitMs": 2000,
    "samples": [
        {"id": "sample-1", "name": "Case 1", "input": "4\n1 2 3 4", "expectedOutput": "10", "explanation": "1 + 2 + 3 + 4 = 10.", "isHidden": False},
        {"id": "sample-2", "name": "Case 2", "input": "3\n10 -5 2", "expectedOutput": "7", "explanation": "10 + (-5) + 2 = 7.", "isHidden": False}
    ],
    "hiddenTests": [
        {"id": "hidden-1", "name": "Hidden 1", "input": "1\n42", "expectedOutput": "42", "isHidden": True},
        {"id": "hidden-2", "name": "Hidden 2", "input": "5\n0 0 0 0 0", "expectedOutput": "0", "isHidden": True},
        {"id": "hidden-3", "name": "Hidden 3", "input": "3\n-10 -20 -30", "expectedOutput": "-60", "isHidden": True},
        {"id": "hidden-4", "name": "Hidden 4", "input": "6\n1 -1 2 -2 3 -3", "expectedOutput": "0", "isHidden": True},
        {"id": "hidden-5", "name": "Hidden 5", "input": "2\n1000 1000", "expectedOutput": "2000", "isHidden": True},
        {"id": "hidden-6", "name": "Hidden 6", "input": "4\n-100 200 -50 50", "expectedOutput": "100", "isHidden": True}
    ],
    "starterCode": {
        "c": "#include <stdio.h>\n\nint main() {\n    int n;\n    if (scanf(\"%d\", &n) != 1) return 0;\n    int a[105];\n    for (int i = 0; i < n; i++) scanf(\"%d\", &a[i]);\n    // Write your solution here\n    return 0;\n}",
        "cpp": "#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    int n;\n    if (cin >> n) {\n        vector<int> a(n);\n        for (int i = 0; i < n; i++) cin >> a[i];\n        // Write your solution here\n    }\n    return 0;\n}",
        "java": "import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int n = sc.nextInt();\n            int[] a = new int[n];\n            for (int i = 0; i < n; i++) a[i] = sc.nextInt();\n            // Write your solution here\n        }\n    }\n}",
        "python": "import sys\n\ndef main():\n    tokens = sys.stdin.read().split()\n    if not tokens:\n        return\n    n = int(tokens[0])\n    a = [int(x) for x in tokens[1:1+n]]\n    # Write your solution here\n\nif __name__ == '__main__':\n    main()"
    },
    "sol1": "import sys\nt = [int(x) for x in sys.stdin.read().split()]\nif t:\n    n = t[0]\n    print(sum(t[1:1+n]))\n",
    "sol2": "import sys\nt = [int(x) for x in sys.stdin.read().split()]\nif t:\n    n = t[0]\n    ans = 0\n    for i in range(1, 1+n):\n        ans += t[i]\n    print(ans)\n"
}
problems.append(p8)

# ==============================================================================
# TIER 2: AXE (5 XP)
# ==============================================================================

# 9. Palindrome String
p9 = {
    "id": "palindrome-string",
    "tier": "axe",
    "title": "Palindrome String",
    "difficulty": "Medium",
    "xp": 5,
    "weapon": "axe",
    "story": "The carving on the war horn reads identical from both ends.",
    "task": "Given a single word S consisting of lowercase letters, check if it reads the same forwards and backwards. Print YES if it is a palindrome, NO otherwise.",
    "inputFormat": "A single non-empty string S.",
    "outputFormat": "Print YES or NO.",
    "constraints": ["1 <= |S| <= 100", "S consists of lowercase English letters."],
    "timeLimitMs": 2000,
    "samples": [
        {"id": "sample-1", "name": "Case 1", "input": "radar", "expectedOutput": "YES", "explanation": "'radar' reversed is 'radar'.", "isHidden": False},
        {"id": "sample-2", "name": "Case 2", "input": "viking", "expectedOutput": "NO", "explanation": "'viking' reversed is 'gnikiv'.", "isHidden": False}
    ],
    "hiddenTests": [
        {"id": "hidden-1", "name": "Hidden 1", "input": "a", "expectedOutput": "YES", "isHidden": True},
        {"id": "hidden-2", "name": "Hidden 2", "input": "aa", "expectedOutput": "YES", "isHidden": True},
        {"id": "hidden-3", "name": "Hidden 3", "input": "ab", "expectedOutput": "NO", "isHidden": True},
        {"id": "hidden-4", "name": "Hidden 4", "input": "kayak", "expectedOutput": "YES", "isHidden": True},
        {"id": "hidden-5", "name": "Hidden 5", "input": "noon", "expectedOutput": "YES", "isHidden": True},
        {"id": "hidden-6", "name": "Hidden 6", "input": "abcdefg", "expectedOutput": "NO", "isHidden": True}
    ],
    "starterCode": {
        "c": "#include <stdio.h>\n#include <string.h>\n\nint main() {\n    char s[105];\n    if (scanf(\"%s\", s) != 1) return 0;\n    // Write your solution here\n    return 0;\n}",
        "cpp": "#include <iostream>\n#include <string>\nusing namespace std;\n\nint main() {\n    string s;\n    if (cin >> s) {\n        // Write your solution here\n    }\n    return 0;\n}",
        "java": "import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNext()) {\n            String s = sc.next();\n            // Write your solution here\n        }\n    }\n}",
        "python": "import sys\n\ndef main():\n    tokens = sys.stdin.read().split()\n    if not tokens:\n        return\n    s = tokens[0]\n    # Write your solution here\n\nif __name__ == '__main__':\n    main()"
    },
    "sol1": "import sys\nt = sys.stdin.read().split()\nif t:\n    s = t[0]\n    print('YES' if s == s[::-1] else 'NO')\n",
    "sol2": "import sys\nt = sys.stdin.read().split()\nif t:\n    s = t[0]\n    is_pal = all(s[i] == s[-1 - i] for i in range(len(s) // 2))\n    print('YES' if is_pal else 'NO')\n"
}
problems.append(p9)

# 10. Prime Check
p10 = {
    "id": "prime-check",
    "tier": "axe",
    "title": "Prime Check",
    "difficulty": "Medium",
    "xp": 5,
    "weapon": "axe",
    "story": "Only indivisible iron ore can forge the chief's battle axe.",
    "task": "Given an integer N, determine if it is a prime number (an integer greater than 1 with no positive divisors other than 1 and itself). Print YES if prime, else NO.",
    "inputFormat": "A single integer N.",
    "outputFormat": "Print YES or NO.",
    "constraints": ["1 <= N <= 1000"],
    "timeLimitMs": 2000,
    "samples": [
        {"id": "sample-1", "name": "Case 1", "input": "7", "expectedOutput": "YES", "explanation": "7 has only divisors 1 and 7.", "isHidden": False},
        {"id": "sample-2", "name": "Case 2", "input": "10", "expectedOutput": "NO", "explanation": "10 is divisible by 2 and 5.", "isHidden": False}
    ],
    "hiddenTests": [
        {"id": "hidden-1", "name": "Hidden 1", "input": "1", "expectedOutput": "NO", "isHidden": True},
        {"id": "hidden-2", "name": "Hidden 2", "input": "2", "expectedOutput": "YES", "isHidden": True},
        {"id": "hidden-3", "name": "Hidden 3", "input": "3", "expectedOutput": "YES", "isHidden": True},
        {"id": "hidden-4", "name": "Hidden 4", "input": "4", "expectedOutput": "NO", "isHidden": True},
        {"id": "hidden-5", "name": "Hidden 5", "input": "97", "expectedOutput": "YES", "isHidden": True},
        {"id": "hidden-6", "name": "Hidden 6", "input": "100", "expectedOutput": "NO", "isHidden": True}
    ],
    "starterCode": {
        "c": "#include <stdio.h>\n\nint main() {\n    int n;\n    if (scanf(\"%d\", &n) != 1) return 0;\n    // Write your solution here\n    return 0;\n}",
        "cpp": "#include <iostream>\nusing namespace std;\n\nint main() {\n    int n;\n    if (cin >> n) {\n        // Write your solution here\n    }\n    return 0;\n}",
        "java": "import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int n = sc.nextInt();\n            // Write your solution here\n        }\n    }\n}",
        "python": "import sys\n\ndef main():\n    tokens = sys.stdin.read().split()\n    if not tokens:\n        return\n    n = int(tokens[0])\n    # Write your solution here\n\nif __name__ == '__main__':\n    main()"
    },
    "sol1": "import sys\nt = sys.stdin.read().split()\nif t:\n    n = int(t[0])\n    if n < 2:\n        print('NO')\n    else:\n        ok = True\n        for i in range(2, int(n**0.5) + 1):\n            if n % i == 0: ok = False; break\n        print('YES' if ok else 'NO')\n",
    "sol2": "import sys\nt = sys.stdin.read().split()\nif t:\n    n = int(t[0])\n    divs = [d for d in range(1, n + 1) if n % d == 0]\n    print('YES' if len(divs) == 2 else 'NO')\n"
}
problems.append(p10)

# 11. Second Largest Number
p11 = {
    "id": "second-largest-number",
    "tier": "axe",
    "title": "Second Largest Number",
    "difficulty": "Medium",
    "xp": 5,
    "weapon": "axe",
    "story": "The second greatest archer is chosen as vice-chieftain.",
    "task": "Given N distinct integers, find the second largest value in the array.",
    "inputFormat": "Line 1: An integer N (2 <= N <= 100).\nLine 2: N space-separated distinct integers.",
    "outputFormat": "Print the second largest integer.",
    "constraints": ["2 <= N <= 100", "All elements are distinct", "-1000 <= A[i] <= 1000"],
    "timeLimitMs": 2000,
    "samples": [
        {"id": "sample-1", "name": "Case 1", "input": "4\n1 5 3 2", "expectedOutput": "3", "explanation": "Sorted array is 1, 2, 3, 5. Second largest is 3.", "isHidden": False},
        {"id": "sample-2", "name": "Case 2", "input": "3\n10 20 30", "expectedOutput": "20", "explanation": "Second largest is 20.", "isHidden": False}
    ],
    "hiddenTests": [
        {"id": "hidden-1", "name": "Hidden 1", "input": "2\n5 10", "expectedOutput": "5", "isHidden": True},
        {"id": "hidden-2", "name": "Hidden 2", "input": "2\n10 5", "expectedOutput": "5", "isHidden": True},
        {"id": "hidden-3", "name": "Hidden 3", "input": "5\n-5 -2 -10 -1 -8", "expectedOutput": "-2", "isHidden": True},
        {"id": "hidden-4", "name": "Hidden 4", "input": "4\n100 -50 20 0", "expectedOutput": "20", "isHidden": True},
        {"id": "hidden-5", "name": "Hidden 5", "input": "6\n7 2 9 4 1 8", "expectedOutput": "8", "isHidden": True},
        {"id": "hidden-6", "name": "Hidden 6", "input": "3\n0 -1 1", "expectedOutput": "0", "isHidden": True}
    ],
    "starterCode": {
        "c": "#include <stdio.h>\n\nint main() {\n    int n;\n    if (scanf(\"%d\", &n) != 1) return 0;\n    int a[105];\n    for (int i = 0; i < n; i++) scanf(\"%d\", &a[i]);\n    // Write your solution here\n    return 0;\n}",
        "cpp": "#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    int n;\n    if (cin >> n) {\n        vector<int> a(n);\n        for (int i = 0; i < n; i++) cin >> a[i];\n        // Write your solution here\n    }\n    return 0;\n}",
        "java": "import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int n = sc.nextInt();\n            int[] a = new int[n];\n            for (int i = 0; i < n; i++) a[i] = sc.nextInt();\n            // Write your solution here\n        }\n    }\n}",
        "python": "import sys\n\ndef main():\n    tokens = sys.stdin.read().split()\n    if not tokens:\n        return\n    n = int(tokens[0])\n    a = [int(x) for x in tokens[1:1+n]]\n    # Write your solution here\n\nif __name__ == '__main__':\n    main()"
    },
    "sol1": "import sys\nt = [int(x) for x in sys.stdin.read().split()]\nif t:\n    n = t[0]\n    arr = sorted(t[1:1+n])\n    print(arr[-2])\n",
    "sol2": "import sys\nt = [int(x) for x in sys.stdin.read().split()]\nif t:\n    n = t[0]\n    arr = t[1:1+n]\n    m1 = max(arr)\n    m2 = max(x for x in arr if x != m1)\n    print(m2)\n"
}
problems.append(p11)

# 12. Most Frequent Character
p12 = {
    "id": "most-frequent-character",
    "tier": "axe",
    "title": "Most Frequent Character",
    "difficulty": "Medium",
    "xp": 5,
    "weapon": "axe",
    "story": "Decipher the dominant clan sigil in the runic tapestry.",
    "task": "Given a string S of lowercase English letters, find the character that appears most frequently. If there is a tie, output the one that appears earliest in alphabetical order.",
    "inputFormat": "A single non-empty string S.",
    "outputFormat": "Print the most frequent character.",
    "constraints": ["1 <= |S| <= 100", "S consists of lowercase English letters."],
    "timeLimitMs": 2000,
    "samples": [
        {"id": "sample-1", "name": "Case 1", "input": "banana", "expectedOutput": "a", "explanation": "'a' appears 3 times.", "isHidden": False},
        {"id": "sample-2", "name": "Case 2", "input": "bbccaa", "expectedOutput": "a", "explanation": "'a', 'b', and 'c' all appear 2 times. 'a' is first alphabetically.", "isHidden": False}
    ],
    "hiddenTests": [
        {"id": "hidden-1", "name": "Hidden 1", "input": "z", "expectedOutput": "z", "isHidden": True},
        {"id": "hidden-2", "name": "Hidden 2", "input": "viking", "expectedOutput": "i", "isHidden": True},
        {"id": "hidden-3", "name": "Hidden 3", "input": "mississippi", "expectedOutput": "i", "isHidden": True},
        {"id": "hidden-4", "name": "Hidden 4", "input": "battle", "expectedOutput": "t", "isHidden": True},
        {"id": "hidden-5", "name": "Hidden 5", "input": "fedcba", "expectedOutput": "a", "isHidden": True},
        {"id": "hidden-6", "name": "Hidden 6", "input": "apple", "expectedOutput": "p", "isHidden": True}
    ],
    "starterCode": {
        "c": "#include <stdio.h>\n#include <string.h>\n\nint main() {\n    char s[105];\n    if (scanf(\"%s\", s) != 1) return 0;\n    // Write your solution here\n    return 0;\n}",
        "cpp": "#include <iostream>\n#include <string>\nusing namespace std;\n\nint main() {\n    string s;\n    if (cin >> s) {\n        // Write your solution here\n    }\n    return 0;\n}",
        "java": "import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNext()) {\n            String s = sc.next();\n            // Write your solution here\n        }\n    }\n}",
        "python": "import sys\n\ndef main():\n    tokens = sys.stdin.read().split()\n    if not tokens:\n        return\n    s = tokens[0]\n    # Write your solution here\n\nif __name__ == '__main__':\n    main()"
    },
    "sol1": "import sys\nt = sys.stdin.read().split()\nif t:\n    s = t[0]\n    counts = {}\n    for c in s:\n        counts[c] = counts.get(c, 0) + 1\n    best = sorted(counts.keys(), key=lambda c: (-counts[c], c))[0]\n    print(best)\n",
    "sol2": "import sys\nfrom collections import Counter\nt = sys.stdin.read().split()\nif t:\n    s = t[0]\n    cnt = Counter(s)\n    m = max(cnt.values())\n    candidates = sorted([k for k, v in cnt.items() if v == m])\n    print(candidates[0])\n"
}
problems.append(p12)

# 13. Two Sum
p13 = {
    "id": "two-sum",
    "tier": "axe",
    "title": "Two Sum",
    "difficulty": "Medium",
    "xp": 5,
    "weapon": "axe",
    "story": "Select two anchor weights that match the exact balance requirement.",
    "task": "Given an array of N integers and a target T, find the 1-based indices (i < j) of the two elements that sum to T. If multiple pairs exist, print the pair with the smallest first index; if still tied, smallest second index.",
    "inputFormat": "Line 1: Two integers N and T (2 <= N <= 100).\nLine 2: N space-separated integers A[1], ..., A[N].",
    "outputFormat": "Print two 1-based indices i and j separated by a space.",
    "constraints": ["2 <= N <= 100", "-1000 <= A[i], T <= 1000", "At least one valid pair exists."],
    "timeLimitMs": 2000,
    "samples": [
        {"id": "sample-1", "name": "Case 1", "input": "4 9\n2 7 11 15", "expectedOutput": "1 2", "explanation": "A[1] + A[2] = 2 + 7 = 9.", "isHidden": False},
        {"id": "sample-2", "name": "Case 2", "input": "3 6\n3 2 4", "expectedOutput": "2 3", "explanation": "A[2] + A[3] = 2 + 4 = 6.", "isHidden": False}
    ],
    "hiddenTests": [
        {"id": "hidden-1", "name": "Hidden 1", "input": "2 10\n5 5", "expectedOutput": "1 2", "isHidden": True},
        {"id": "hidden-2", "name": "Hidden 2", "input": "4 0\n-2 1 2 -1", "expectedOutput": "1 3", "isHidden": True},
        {"id": "hidden-3", "name": "Hidden 3", "input": "5 15\n1 2 3 4 11", "expectedOutput": "4 5", "isHidden": True},
        {"id": "hidden-4", "name": "Hidden 4", "input": "3 -5\n-2 -3 0", "expectedOutput": "1 2", "isHidden": True},
        {"id": "hidden-5", "name": "Hidden 5", "input": "4 8\n4 2 6 4", "expectedOutput": "1 4", "isHidden": True},
        {"id": "hidden-6", "name": "Hidden 6", "input": "5 100\n10 20 30 70 80", "expectedOutput": "2 5", "isHidden": True}
    ],
    "starterCode": {
        "c": "#include <stdio.h>\n\nint main() {\n    int n, t;\n    if (scanf(\"%d %d\", &n, &t) != 2) return 0;\n    int a[105];\n    for (int i = 0; i < n; i++) scanf(\"%d\", &a[i]);\n    // Write your solution here\n    return 0;\n}",
        "cpp": "#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    int n, t;\n    if (cin >> n >> t) {\n        vector<int> a(n);\n        for (int i = 0; i < n; i++) cin >> a[i];\n        // Write your solution here\n    }\n    return 0;\n}",
        "java": "import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int n = sc.nextInt();\n            int t = sc.nextInt();\n            int[] a = new int[n];\n            for (int i = 0; i < n; i++) a[i] = sc.nextInt();\n            // Write your solution here\n        }\n    }\n}",
        "python": "import sys\n\ndef main():\n    tokens = sys.stdin.read().split()\n    if not tokens:\n        return\n    n, t = int(tokens[0]), int(tokens[1])\n    a = [int(x) for x in tokens[2:2+n]]\n    # Write your solution here\n\nif __name__ == '__main__':\n    main()"
    },
    "sol1": "import sys\nt = [int(x) for x in sys.stdin.read().split()]\nif t:\n    n, target = t[0], t[1]\n    arr = t[2:2+n]\n    found = False\n    for i in range(n):\n        for j in range(i + 1, n):\n            if arr[i] + arr[j] == target:\n                print(f'{i + 1} {j + 1}')\n                found = True\n                break\n        if found: break\n",
    "sol2": "import sys\nt = [int(x) for x in sys.stdin.read().split()]\nif t:\n    n, target = t[0], t[1]\n    arr = t[2:2+n]\n    seen = {}\n    ans = None\n    for j in range(n):\n        needed = target - arr[j]\n        if needed in seen:\n            ans = (seen[needed] + 1, j + 1)\n            break\n        seen[arr[j]] = j\n    # brute force ensures smallest i\n    for i in range(n):\n        for j in range(i+1, n):\n            if arr[i] + arr[j] == target:\n                print(f'{i+1} {j+1}')\n                sys.exit(0)\n"
}
problems.append(p13)

# 14. Valid Anagram
p14 = {
    "id": "valid-anagram",
    "tier": "axe",
    "title": "Valid Anagram",
    "difficulty": "Medium",
    "xp": 5,
    "weapon": "axe",
    "story": "Check if two war banners use the exact same runes rearranged.",
    "task": "Given two strings S and T consisting of lowercase letters, determine if T is an anagram of S (contains the same characters with the same frequencies). Print YES if valid, else NO.",
    "inputFormat": "Two space-separated strings S and T.",
    "outputFormat": "Print YES or NO.",
    "constraints": ["1 <= |S|, |T| <= 100", "S and T consist of lowercase English letters."],
    "timeLimitMs": 2000,
    "samples": [
        {"id": "sample-1", "name": "Case 1", "input": "listen silent", "expectedOutput": "YES", "explanation": "'silent' is an anagram of 'listen'.", "isHidden": False},
        {"id": "sample-2", "name": "Case 2", "input": "viking raider", "expectedOutput": "NO", "explanation": "The letters do not match.", "isHidden": False}
    ],
    "hiddenTests": [
        {"id": "hidden-1", "name": "Hidden 1", "input": "a a", "expectedOutput": "YES", "isHidden": True},
        {"id": "hidden-2", "name": "Hidden 2", "input": "rat tar", "expectedOutput": "YES", "isHidden": True},
        {"id": "hidden-3", "name": "Hidden 3", "input": "rat car", "expectedOutput": "NO", "isHidden": True},
        {"id": "hidden-4", "name": "Hidden 4", "input": "aabb bbaa", "expectedOutput": "YES", "isHidden": True},
        {"id": "hidden-5", "name": "Hidden 5", "input": "abc abcd", "expectedOutput": "NO", "isHidden": True},
        {"id": "hidden-6", "name": "Hidden 6", "input": "night thing", "expectedOutput": "YES", "isHidden": True}
    ],
    "starterCode": {
        "c": "#include <stdio.h>\n#include <string.h>\n\nint main() {\n    char s[105], t[105];\n    if (scanf(\"%s %s\", s, t) != 2) return 0;\n    // Write your solution here\n    return 0;\n}",
        "cpp": "#include <iostream>\n#include <string>\nusing namespace std;\n\nint main() {\n    string s, t;\n    if (cin >> s >> t) {\n        // Write your solution here\n    }\n    return 0;\n}",
        "java": "import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNext()) {\n            String s = sc.next();\n            String t = sc.next();\n            // Write your solution here\n        }\n    }\n}",
        "python": "import sys\n\ndef main():\n    tokens = sys.stdin.read().split()\n    if len(tokens) < 2:\n        return\n    s, t = tokens[0], tokens[1]\n    # Write your solution here\n\nif __name__ == '__main__':\n    main()"
    },
    "sol1": "import sys\nt = sys.stdin.read().split()\nif len(t) >= 2:\n    print('YES' if sorted(t[0]) == sorted(t[1]) else 'NO')\n",
    "sol2": "import sys\nfrom collections import Counter\nt = sys.stdin.read().split()\nif len(t) >= 2:\n    print('YES' if Counter(t[0]) == Counter(t[1]) else 'NO')\n"
}
problems.append(p14)

# 15. Remove Duplicates
p15 = {
    "id": "remove-duplicates",
    "tier": "axe",
    "title": "Remove Duplicates",
    "difficulty": "Medium",
    "xp": 5,
    "weapon": "axe",
    "story": "Purge duplicate scouts from the muster roll while preserving order.",
    "task": "Given an array of N integers, remove all duplicate occurrences, keeping only the first occurrence of each number, preserving their original order.",
    "inputFormat": "Line 1: An integer N (1 <= N <= 100).\nLine 2: N space-separated integers.",
    "outputFormat": "Print the resulting numbers separated by a space.",
    "constraints": ["1 <= N <= 100", "-1000 <= A[i] <= 1000"],
    "timeLimitMs": 2000,
    "samples": [
        {"id": "sample-1", "name": "Case 1", "input": "6\n1 2 2 3 4 4", "expectedOutput": "1 2 3 4", "explanation": "2 and 4 appeared twice.", "isHidden": False},
        {"id": "sample-2", "name": "Case 2", "input": "5\n5 5 5 5 5", "expectedOutput": "5", "explanation": "Only one unique element remains.", "isHidden": False}
    ],
    "hiddenTests": [
        {"id": "hidden-1", "name": "Hidden 1", "input": "1\n42", "expectedOutput": "42", "isHidden": True},
        {"id": "hidden-2", "name": "Hidden 2", "input": "4\n1 2 3 4", "expectedOutput": "1 2 3 4", "isHidden": True},
        {"id": "hidden-3", "name": "Hidden 3", "input": "6\n3 1 2 3 1 4", "expectedOutput": "3 1 2 4", "isHidden": True},
        {"id": "hidden-4", "name": "Hidden 4", "input": "5\n-1 2 -1 3 2", "expectedOutput": "-1 2 3", "isHidden": True},
        {"id": "hidden-5", "name": "Hidden 5", "input": "4\n0 0 1 0", "expectedOutput": "0 1", "isHidden": True},
        {"id": "hidden-6", "name": "Hidden 6", "input": "7\n10 20 10 30 20 40 50", "expectedOutput": "10 20 30 40 50", "isHidden": True}
    ],
    "starterCode": {
        "c": "#include <stdio.h>\n\nint main() {\n    int n;\n    if (scanf(\"%d\", &n) != 1) return 0;\n    int a[105];\n    for (int i = 0; i < n; i++) scanf(\"%d\", &a[i]);\n    // Write your solution here\n    return 0;\n}",
        "cpp": "#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    int n;\n    if (cin >> n) {\n        vector<int> a(n);\n        for (int i = 0; i < n; i++) cin >> a[i];\n        // Write your solution here\n    }\n    return 0;\n}",
        "java": "import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int n = sc.nextInt();\n            int[] a = new int[n];\n            for (int i = 0; i < n; i++) a[i] = sc.nextInt();\n            // Write your solution here\n        }\n    }\n}",
        "python": "import sys\n\ndef main():\n    tokens = sys.stdin.read().split()\n    if not tokens:\n        return\n    n = int(tokens[0])\n    a = [int(x) for x in tokens[1:1+n]]\n    # Write your solution here\n\nif __name__ == '__main__':\n    main()"
    },
    "sol1": "import sys\nt = [int(x) for x in sys.stdin.read().split()]\nif t:\n    n = t[0]\n    seen = set()\n    res = []\n    for x in t[1:1+n]:\n        if x not in seen:\n            seen.add(x)\n            res.append(str(x))\n    print(' '.join(res))\n",
    "sol2": "import sys\nt = [int(x) for x in sys.stdin.read().split()]\nif t:\n    n = t[0]\n    arr = t[1:1+n]\n    res = list(dict.fromkeys(arr))\n    print(' '.join(map(str, res)))\n"
}
problems.append(p15)

# 16. GCD and LCM
p16 = {
    "id": "gcd-and-lcm",
    "tier": "axe",
    "title": "GCD and LCM",
    "difficulty": "Medium",
    "xp": 5,
    "weapon": "axe",
    "story": "Calculate the greatest common rhythm and least common cycle for the rowing drums.",
    "task": "Given two positive integers A and B, compute their Greatest Common Divisor (GCD) and Least Common Multiple (LCM).",
    "inputFormat": "Two space-separated positive integers A and B.",
    "outputFormat": "Print GCD and LCM separated by a space.",
    "constraints": ["1 <= A, B <= 1000"],
    "timeLimitMs": 2000,
    "samples": [
        {"id": "sample-1", "name": "Case 1", "input": "12 18", "expectedOutput": "6 36", "explanation": "GCD(12, 18) = 6, LCM(12, 18) = 36.", "isHidden": False},
        {"id": "sample-2", "name": "Case 2", "input": "5 7", "expectedOutput": "1 35", "explanation": "GCD(5, 7) = 1, LCM(5, 7) = 35.", "isHidden": False}
    ],
    "hiddenTests": [
        {"id": "hidden-1", "name": "Hidden 1", "input": "1 1", "expectedOutput": "1 1", "isHidden": True},
        {"id": "hidden-2", "name": "Hidden 2", "input": "10 10", "expectedOutput": "10 10", "isHidden": True},
        {"id": "hidden-3", "name": "Hidden 3", "input": "14 28", "expectedOutput": "14 28", "isHidden": True},
        {"id": "hidden-4", "name": "Hidden 4", "input": "24 60", "expectedOutput": "12 120", "isHidden": True},
        {"id": "hidden-5", "name": "Hidden 5", "input": "17 19", "expectedOutput": "1 323", "isHidden": True},
        {"id": "hidden-6", "name": "Hidden 6", "input": "100 250", "expectedOutput": "50 500", "isHidden": True}
    ],
    "starterCode": {
        "c": "#include <stdio.h>\n\nint main() {\n    int a, b;\n    if (scanf(\"%d %d\", &a, &b) != 2) return 0;\n    // Write your solution here\n    return 0;\n}",
        "cpp": "#include <iostream>\nusing namespace std;\n\nint main() {\n    int a, b;\n    if (cin >> a >> b) {\n        // Write your solution here\n    }\n    return 0;\n}",
        "java": "import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int a = sc.nextInt();\n            int b = sc.nextInt();\n            // Write your solution here\n        }\n    }\n}",
        "python": "import sys\n\ndef main():\n    tokens = sys.stdin.read().split()\n    if not tokens:\n        return\n    a, b = int(tokens[0]), int(tokens[1])\n    # Write your solution here\n\nif __name__ == '__main__':\n    main()"
    },
    "sol1": "import sys, math\nt = [int(x) for x in sys.stdin.read().split()]\nif t:\n    a, b = t[0], t[1]\n    g = math.gcd(a, b)\n    l = (a * b) // g\n    print(f'{g} {l}')\n",
    "sol2": "import sys\nt = [int(x) for x in sys.stdin.read().split()]\nif t:\n    a, b = t[0], t[1]\n    def gcd(x, y):\n        while y:\n            x, y = y, x % y\n        return x\n    g = gcd(a, b)\n    l = (a * b) // g\n    print(f'{g} {l}')\n"
}
problems.append(p16)

# ==============================================================================
# TIER 3: CATAPULT (7 XP)
# ==============================================================================

# 17. Valid Parentheses
p17 = {
    "id": "valid-parentheses",
    "tier": "catapult",
    "title": "Valid Parentheses",
    "difficulty": "Hard",
    "xp": 7,
    "weapon": "catapult",
    "story": "Verify the nested rune brackets guarding the catapult trigger.",
    "task": "Given a string S consisting of brackets '()[]{}', determine if it is valid (brackets close in correct order and type). Print YES if valid, else NO.",
    "inputFormat": "A single string S.",
    "outputFormat": "Print YES or NO.",
    "constraints": ["1 <= |S| <= 100", "S consists only of '()[]{}'."],
    "timeLimitMs": 2000,
    "samples": [
        {"id": "sample-1", "name": "Case 1", "input": "()[]{}", "expectedOutput": "YES", "explanation": "All brackets match properly.", "isHidden": False},
        {"id": "sample-2", "name": "Case 2", "input": "(]", "expectedOutput": "NO", "explanation": "'(' does not match ']'.", "isHidden": False}
    ],
    "hiddenTests": [
        {"id": "hidden-1", "name": "Hidden 1", "input": "(", "expectedOutput": "NO", "isHidden": True},
        {"id": "hidden-2", "name": "Hidden 2", "input": "()", "expectedOutput": "YES", "isHidden": True},
        {"id": "hidden-3", "name": "Hidden 3", "input": "{[]}", "expectedOutput": "YES", "isHidden": True},
        {"id": "hidden-4", "name": "Hidden 4", "input": "([)]", "expectedOutput": "NO", "isHidden": True},
        {"id": "hidden-5", "name": "Hidden 5", "input": "((()))", "expectedOutput": "YES", "isHidden": True},
        {"id": "hidden-6", "name": "Hidden 6", "input": "}{", "expectedOutput": "NO", "isHidden": True}
    ],
    "starterCode": {
        "c": "#include <stdio.h>\n#include <string.h>\n\nint main() {\n    char s[105];\n    if (scanf(\"%s\", s) != 1) return 0;\n    // Write your solution here\n    return 0;\n}",
        "cpp": "#include <iostream>\n#include <string>\nusing namespace std;\n\nint main() {\n    string s;\n    if (cin >> s) {\n        // Write your solution here\n    }\n    return 0;\n}",
        "java": "import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNext()) {\n            String s = sc.next();\n            // Write your solution here\n        }\n    }\n}",
        "python": "import sys\n\ndef main():\n    tokens = sys.stdin.read().split()\n    if not tokens:\n        return\n    s = tokens[0]\n    # Write your solution here\n\nif __name__ == '__main__':\n    main()"
    },
    "sol1": "import sys\nt = sys.stdin.read().split()\nif t:\n    s = t[0]\n    stack = []\n    mapping = {')': '(', '}': '{', ']': '['}\n    valid = True\n    for char in s:\n        if char in mapping:\n            top = stack.pop() if stack else '#'\n            if mapping[char] != top:\n                valid = False\n                break\n        else:\n            stack.append(char)\n    if stack: valid = False\n    print('YES' if valid else 'NO')\n",
    "sol2": "import sys\nt = sys.stdin.read().split()\nif t:\n    s = t[0]\n    prev = None\n    while prev != s:\n        prev = s\n        s = s.replace('()', '').replace('[]', '').replace('{}', '')\n    print('YES' if s == '' else 'NO')\n"
}
problems.append(p17)

# 18. Binary Search
p18 = {
    "id": "binary-search",
    "tier": "catapult",
    "title": "Binary Search",
    "difficulty": "Hard",
    "xp": 7,
    "weapon": "catapult",
    "story": "Locate the enchanted quiver in the sorted armory vault.",
    "task": "Given a sorted array of N distinct integers in ascending order and a target value K, find the 1-based index of K. If K is not present, print -1.",
    "inputFormat": "Line 1: Two integers N and K (1 <= N <= 100).\nLine 2: N space-separated integers in strictly increasing order.",
    "outputFormat": "Print the 1-based index of K, or -1 if not found.",
    "constraints": ["1 <= N <= 100", "-1000 <= A[i], K <= 1000", "A is sorted in ascending order."],
    "timeLimitMs": 2000,
    "samples": [
        {"id": "sample-1", "name": "Case 1", "input": "5 7\n1 3 5 7 9", "expectedOutput": "4", "explanation": "7 is at index 4.", "isHidden": False},
        {"id": "sample-2", "name": "Case 2", "input": "4 6\n2 4 8 10", "expectedOutput": "-1", "explanation": "6 is not in the array.", "isHidden": False}
    ],
    "hiddenTests": [
        {"id": "hidden-1", "name": "Hidden 1", "input": "1 5\n5", "expectedOutput": "1", "isHidden": True},
        {"id": "hidden-2", "name": "Hidden 2", "input": "1 3\n5", "expectedOutput": "-1", "isHidden": True},
        {"id": "hidden-3", "name": "Hidden 3", "input": "6 1\n1 2 3 4 5 6", "expectedOutput": "1", "isHidden": True},
        {"id": "hidden-4", "name": "Hidden 4", "input": "6 6\n1 2 3 4 5 6", "expectedOutput": "6", "isHidden": True},
        {"id": "hidden-5", "name": "Hidden 5", "input": "5 -2\n-10 -5 -2 0 4", "expectedOutput": "3", "isHidden": True},
        {"id": "hidden-6", "name": "Hidden 6", "input": "4 0\n-5 -3 1 2", "expectedOutput": "-1", "isHidden": True}
    ],
    "starterCode": {
        "c": "#include <stdio.h>\n\nint main() {\n    int n, k;\n    if (scanf(\"%d %d\", &n, &k) != 2) return 0;\n    int a[105];\n    for (int i = 0; i < n; i++) scanf(\"%d\", &a[i]);\n    // Write your solution here\n    return 0;\n}",
        "cpp": "#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    int n, k;\n    if (cin >> n >> k) {\n        vector<int> a(n);\n        for (int i = 0; i < n; i++) cin >> a[i];\n        // Write your solution here\n    }\n    return 0;\n}",
        "java": "import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int n = sc.nextInt();\n            int k = sc.nextInt();\n            int[] a = new int[n];\n            for (int i = 0; i < n; i++) a[i] = sc.nextInt();\n            // Write your solution here\n        }\n    }\n}",
        "python": "import sys\n\ndef main():\n    tokens = sys.stdin.read().split()\n    if not tokens:\n        return\n    n, k = int(tokens[0]), int(tokens[1])\n    a = [int(x) for x in tokens[2:2+n]]\n    # Write your solution here\n\nif __name__ == '__main__':\n    main()"
    },
    "sol1": "import sys\nt = [int(x) for x in sys.stdin.read().split()]\nif t:\n    n, k = t[0], t[1]\n    arr = t[2:2+n]\n    low, high = 0, n - 1\n    ans = -1\n    while low <= high:\n        mid = (low + high) // 2\n        if arr[mid] == k:\n            ans = mid + 1\n            break\n        elif arr[mid] < k:\n            low = mid + 1\n        else:\n            high = mid - 1\n    print(ans)\n",
    "sol2": "import sys\nt = [int(x) for x in sys.stdin.read().split()]\nif t:\n    n, k = t[0], t[1]\n    arr = t[2:2+n]\n    try:\n        print(arr.index(k) + 1)\n    except ValueError:\n        print(-1)\n"
}
problems.append(p18)

# 19. Longest Substring Without Repeating Characters
p19 = {
    "id": "longest-substring-without-repeating-characters",
    "tier": "catapult",
    "title": "Longest Substring Without Repeating Characters",
    "difficulty": "Hard",
    "xp": 7,
    "weapon": "catapult",
    "story": "Find the longest sequence of distinct victory runes carved along the catapult arm.",
    "task": "Given a string S of lowercase English letters, find the length of the longest contiguous substring without any repeating characters.",
    "inputFormat": "A single non-empty string S.",
    "outputFormat": "Print an integer: length of the longest substring with all unique characters.",
    "constraints": ["1 <= |S| <= 100", "S consists of lowercase English letters."],
    "timeLimitMs": 2000,
    "samples": [
        {"id": "sample-1", "name": "Case 1", "input": "abcabcbb", "expectedOutput": "3", "explanation": "'abc' with length 3.", "isHidden": False},
        {"id": "sample-2", "name": "Case 2", "input": "bbbbb", "expectedOutput": "1", "explanation": "'b' with length 1.", "isHidden": False}
    ],
    "hiddenTests": [
        {"id": "hidden-1", "name": "Hidden 1", "input": "pwwkew", "expectedOutput": "3", "isHidden": True},
        {"id": "hidden-2", "name": "Hidden 2", "input": "a", "expectedOutput": "1", "isHidden": True},
        {"id": "hidden-3", "name": "Hidden 3", "input": "abcdef", "expectedOutput": "6", "isHidden": True},
        {"id": "hidden-4", "name": "Hidden 4", "input": "abba", "expectedOutput": "2", "isHidden": True},
        {"id": "hidden-5", "name": "Hidden 5", "input": "tmmzuxt", "expectedOutput": "5", "isHidden": True},
        {"id": "hidden-6", "name": "Hidden 6", "input": "aab", "expectedOutput": "2", "isHidden": True}
    ],
    "starterCode": {
        "c": "#include <stdio.h>\n#include <string.h>\n\nint main() {\n    char s[105];\n    if (scanf(\"%s\", s) != 1) return 0;\n    // Write your solution here\n    return 0;\n}",
        "cpp": "#include <iostream>\n#include <string>\nusing namespace std;\n\nint main() {\n    string s;\n    if (cin >> s) {\n        // Write your solution here\n    }\n    return 0;\n}",
        "java": "import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNext()) {\n            String s = sc.next();\n            // Write your solution here\n        }\n    }\n}",
        "python": "import sys\n\ndef main():\n    tokens = sys.stdin.read().split()\n    if not tokens:\n        return\n    s = tokens[0]\n    # Write your solution here\n\nif __name__ == '__main__':\n    main()"
    },
    "sol1": "import sys\nt = sys.stdin.read().split()\nif t:\n    s = t[0]\n    char_map = {}\n    left = 0\n    max_len = 0\n    for right, c in enumerate(s):\n        if c in char_map and char_map[c] >= left:\n            left = char_map[c] + 1\n        char_map[c] = right\n        max_len = max(max_len, right - left + 1)\n    print(max_len)\n",
    "sol2": "import sys\nt = sys.stdin.read().split()\nif t:\n    s = t[0]\n    n = len(s)\n    ans = 0\n    for i in range(n):\n        seen = set()\n        for j in range(i, n):\n            if s[j] in seen:\n                break\n            seen.add(s[j])\n        ans = max(ans, len(seen))\n    print(ans)\n"
}
problems.append(p19)

# 20. Maximum Subarray Sum
p20 = {
    "id": "maximum-subarray-sum",
    "tier": "catapult",
    "title": "Maximum Subarray Sum",
    "difficulty": "Hard",
    "xp": 7,
    "weapon": "catapult",
    "story": "Find the contiguous sequence of combat clashes yielding maximum momentum.",
    "task": "Given an array of N integers, find the maximum sum of a non-empty contiguous subarray.",
    "inputFormat": "Line 1: An integer N (1 <= N <= 100).\nLine 2: N space-separated integers.",
    "outputFormat": "Print the maximum contiguous subarray sum.",
    "constraints": ["1 <= N <= 100", "-1000 <= A[i] <= 1000"],
    "timeLimitMs": 2000,
    "samples": [
        {"id": "sample-1", "name": "Case 1", "input": "5\n-2 1 -3 4 -1", "expectedOutput": "4", "explanation": "[4] has sum 4.", "isHidden": False},
        {"id": "sample-2", "name": "Case 2", "input": "4\n1 2 3 4", "expectedOutput": "10", "explanation": "Whole array sums to 10.", "isHidden": False}
    ],
    "hiddenTests": [
        {"id": "hidden-1", "name": "Hidden 1", "input": "1\n-5", "expectedOutput": "-5", "isHidden": True},
        {"id": "hidden-2", "name": "Hidden 2", "input": "5\n-3 -2 -5 -1 -4", "expectedOutput": "-1", "isHidden": True},
        {"id": "hidden-3", "name": "Hidden 3", "input": "8\n-2 1 -3 4 -1 2 1 -5", "expectedOutput": "6", "isHidden": True},
        {"id": "hidden-4", "name": "Hidden 4", "input": "3\n5 -2 3", "expectedOutput": "6", "isHidden": True},
        {"id": "hidden-5", "name": "Hidden 5", "input": "4\n-10 20 -5 15", "expectedOutput": "30", "isHidden": True},
        {"id": "hidden-6", "name": "Hidden 6", "input": "6\n2 -1 2 3 -9 5", "expectedOutput": "6", "isHidden": True}
    ],
    "starterCode": {
        "c": "#include <stdio.h>\n\nint main() {\n    int n;\n    if (scanf(\"%d\", &n) != 1) return 0;\n    int a[105];\n    for (int i = 0; i < n; i++) scanf(\"%d\", &a[i]);\n    // Write your solution here\n    return 0;\n}",
        "cpp": "#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    int n;\n    if (cin >> n) {\n        vector<int> a(n);\n        for (int i = 0; i < n; i++) cin >> a[i];\n        // Write your solution here\n    }\n    return 0;\n}",
        "java": "import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int n = sc.nextInt();\n            int[] a = new int[n];\n            for (int i = 0; i < n; i++) a[i] = sc.nextInt();\n            // Write your solution here\n        }\n    }\n}",
        "python": "import sys\n\ndef main():\n    tokens = sys.stdin.read().split()\n    if not tokens:\n        return\n    n = int(tokens[0])\n    a = [int(x) for x in tokens[1:1+n]]\n    # Write your solution here\n\nif __name__ == '__main__':\n    main()"
    },
    "sol1": "import sys\nt = [int(x) for x in sys.stdin.read().split()]\nif t:\n    n = t[0]\n    arr = t[1:1+n]\n    max_so_far = arr[0]\n    curr_max = arr[0]\n    for x in arr[1:]:\n        curr_max = max(x, curr_max + x)\n        max_so_far = max(max_so_far, curr_max)\n    print(max_so_far)\n",
    "sol2": "import sys\nt = [int(x) for x in sys.stdin.read().split()]\nif t:\n    n = t[0]\n    arr = t[1:1+n]\n    best = -float('inf')\n    for i in range(n):\n        s = 0\n        for j in range(i, n):\n            s += arr[j]\n            if s > best:\n                best = s\n    print(best)\n"
}
problems.append(p20)

# 21. Merge Intervals
p21 = {
    "id": "merge-intervals",
    "tier": "catapult",
    "title": "Merge Intervals",
    "difficulty": "Hard",
    "xp": 7,
    "weapon": "catapult",
    "story": "Consolidate overlapping catapult bombardment time intervals into unified barrages.",
    "task": "Given N intervals [start, end], merge all overlapping intervals. Print the merged intervals sorted by start time, each on a new line as 'start end'.",
    "inputFormat": "Line 1: An integer N (1 <= N <= 50).\nNext N lines: Two integers start and end (0 <= start <= end <= 1000).",
    "outputFormat": "Print each merged interval's start and end separated by a space, one per line.",
    "constraints": ["1 <= N <= 50", "0 <= start <= end <= 1000"],
    "timeLimitMs": 2000,
    "samples": [
        {"id": "sample-1", "name": "Case 1", "input": "4\n1 3\n2 6\n8 10\n15 18", "expectedOutput": "1 6\n8 10\n15 18", "explanation": "[1,3] and [2,6] overlap into [1,6].", "isHidden": False},
        {"id": "sample-2", "name": "Case 2", "input": "2\n1 4\n4 5", "expectedOutput": "1 5", "explanation": "Touching intervals [1,4] and [4,5] merge to [1,5].", "isHidden": False}
    ],
    "hiddenTests": [
        {"id": "hidden-1", "name": "Hidden 1", "input": "1\n2 5", "expectedOutput": "2 5", "isHidden": True},
        {"id": "hidden-2", "name": "Hidden 2", "input": "3\n1 4\n0 4\n3 5", "expectedOutput": "0 5", "isHidden": True},
        {"id": "hidden-3", "name": "Hidden 3", "input": "3\n1 2\n3 4\n5 6", "expectedOutput": "1 2\n3 4\n5 6", "isHidden": True},
        {"id": "hidden-4", "name": "Hidden 4", "input": "4\n2 3\n4 5\n1 10\n6 7", "expectedOutput": "1 10", "isHidden": True},
        {"id": "hidden-5", "name": "Hidden 5", "input": "2\n1 1\n1 1", "expectedOutput": "1 1", "isHidden": True},
        {"id": "hidden-6", "name": "Hidden 6", "input": "3\n5 8\n1 3\n2 4", "expectedOutput": "1 4\n5 8", "isHidden": True}
    ],
    "starterCode": {
        "c": "#include <stdio.h>\n\nint main() {\n    int n;\n    if (scanf(\"%d\", &n) != 1) return 0;\n    int s[55], e[55];\n    for (int i = 0; i < n; i++) scanf(\"%d %d\", &s[i], &e[i]);\n    // Write your solution here\n    return 0;\n}",
        "cpp": "#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    int n;\n    if (cin >> n) {\n        vector<pair<int, int>> intervals(n);\n        for (int i = 0; i < n; i++) cin >> intervals[i].first >> intervals[i].second;\n        // Write your solution here\n    }\n    return 0;\n}",
        "java": "import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int n = sc.nextInt();\n            int[][] intervals = new int[n][2];\n            for (int i = 0; i < n; i++) {\n                intervals[i][0] = sc.nextInt();\n                intervals[i][1] = sc.nextInt();\n            }\n            // Write your solution here\n        }\n    }\n}",
        "python": "import sys\n\ndef main():\n    tokens = sys.stdin.read().split()\n    if not tokens:\n        return\n    n = int(tokens[0])\n    intervals = []\n    for i in range(n):\n        intervals.append([int(tokens[1 + 2*i]), int(tokens[2 + 2*i])])\n    # Write your solution here\n\nif __name__ == '__main__':\n    main()"
    },
    "sol1": "import sys\nt = [int(x) for x in sys.stdin.read().split()]\nif t:\n    n = t[0]\n    intervals = []\n    for i in range(n):\n        intervals.append([t[1 + 2*i], t[2 + 2*i]])\n    intervals.sort(key=lambda x: x[0])\n    merged = []\n    for iv in intervals:\n        if not merged or merged[-1][1] < iv[0]:\n            merged.append(iv)\n        else:\n            merged[-1][1] = max(merged[-1][1], iv[1])\n    for s, e in merged:\n        print(f'{s} {e}')\n",
    "sol2": "import sys\nt = [int(x) for x in sys.stdin.read().split()]\nif t:\n    n = t[0]\n    ivs = sorted([[t[1 + 2*i], t[2 + 2*i]] for i in range(n)])\n    res = []\n    cur_s, cur_e = ivs[0]\n    for s, e in ivs[1:]:\n        if s <= cur_e:\n            cur_e = max(cur_e, e)\n        else:\n            res.append((cur_s, cur_e))\n            cur_s, cur_e = s, e\n    res.append((cur_s, cur_e))\n    for s, e in res:\n        print(f'{s} {e}')\n"
}
problems.append(p21)

# 22. Rotate Array by K
p22 = {
    "id": "rotate-array-by-k",
    "tier": "catapult",
    "title": "Rotate Array by K",
    "difficulty": "Hard",
    "xp": 7,
    "weapon": "catapult",
    "story": "Rotate the perimeter shield guard positions clockwise by K steps.",
    "task": "Given an array of N integers and a non-negative integer K, rotate the array to the right (clockwise) by K steps.",
    "inputFormat": "Line 1: Two integers N and K (1 <= N <= 100, 0 <= K <= 1000).\nLine 2: N space-separated integers.",
    "outputFormat": "Print the rotated array elements separated by a space.",
    "constraints": ["1 <= N <= 100", "0 <= K <= 1000", "-1000 <= A[i] <= 1000"],
    "timeLimitMs": 2000,
    "samples": [
        {"id": "sample-1", "name": "Case 1", "input": "5 2\n1 2 3 4 5", "expectedOutput": "4 5 1 2 3", "explanation": "Rotating right by 2 moves 4, 5 to the front.", "isHidden": False},
        {"id": "sample-2", "name": "Case 2", "input": "4 4\n10 20 30 40", "expectedOutput": "10 20 30 40", "explanation": "Rotating by N gives original array.", "isHidden": False}
    ],
    "hiddenTests": [
        {"id": "hidden-1", "name": "Hidden 1", "input": "1 10\n7", "expectedOutput": "7", "isHidden": True},
        {"id": "hidden-2", "name": "Hidden 2", "input": "3 1\n1 2 3", "expectedOutput": "3 1 2", "isHidden": True},
        {"id": "hidden-3", "name": "Hidden 3", "input": "4 0\n1 2 3 4", "expectedOutput": "1 2 3 4", "isHidden": True},
        {"id": "hidden-4", "name": "Hidden 4", "input": "5 7\n1 2 3 4 5", "expectedOutput": "4 5 1 2 3", "isHidden": True},
        {"id": "hidden-5", "name": "Hidden 5", "input": "3 5\n10 20 30", "expectedOutput": "20 30 10", "isHidden": True},
        {"id": "hidden-6", "name": "Hidden 6", "input": "6 3\n1 2 3 4 5 6", "expectedOutput": "4 5 6 1 2 3", "isHidden": True}
    ],
    "starterCode": {
        "c": "#include <stdio.h>\n\nint main() {\n    int n, k;\n    if (scanf(\"%d %d\", &n, &k) != 2) return 0;\n    int a[105];\n    for (int i = 0; i < n; i++) scanf(\"%d\", &a[i]);\n    // Write your solution here\n    return 0;\n}",
        "cpp": "#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    int n, k;\n    if (cin >> n >> k) {\n        vector<int> a(n);\n        for (int i = 0; i < n; i++) cin >> a[i];\n        // Write your solution here\n    }\n    return 0;\n}",
        "java": "import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int n = sc.nextInt();\n            int k = sc.nextInt();\n            int[] a = new int[n];\n            for (int i = 0; i < n; i++) a[i] = sc.nextInt();\n            // Write your solution here\n        }\n    }\n}",
        "python": "import sys\n\ndef main():\n    tokens = sys.stdin.read().split()\n    if not tokens:\n        return\n    n, k = int(tokens[0]), int(tokens[1])\n    a = [int(x) for x in tokens[2:2+n]]\n    # Write your solution here\n\nif __name__ == '__main__':\n    main()"
    },
    "sol1": "import sys\nt = [int(x) for x in sys.stdin.read().split()]\nif t:\n    n, k = t[0], t[1]\n    arr = t[2:2+n]\n    k = k % n\n    if k == 0:\n        print(' '.join(map(str, arr)))\n    else:\n        rot = arr[-k:] + arr[:-k]\n        print(' '.join(map(str, rot)))\n",
    "sol2": "import sys\nt = [int(x) for x in sys.stdin.read().split()]\nif t:\n    n, k = t[0], t[1]\n    arr = t[2:2+n]\n    res = [0] * n\n    for i in range(n):\n        res[(i + k) % n] = arr[i]\n    print(' '.join(map(str, res)))\n"
}
problems.append(p22)

# 23. Number of Islands
p23 = {
    "id": "number-of-islands",
    "tier": "catapult",
    "title": "Number of Islands",
    "difficulty": "Hard",
    "xp": 7,
    "weapon": "catapult",
    "story": "Count isolated volcanic islands in the archipelago from the dragon's aerial view.",
    "task": "Given an R x C grid of '1's (land) and '0's (water), count the number of islands. An island is formed by connecting adjacent land cells horizontally or vertically.",
    "inputFormat": "Line 1: Two integers R and C (1 <= R, C <= 10).\nNext R lines: A string of C characters ('0' or '1').",
    "outputFormat": "Print a single integer: total number of islands.",
    "constraints": ["1 <= R, C <= 10", "Grid contains only '0' and '1'."],
    "timeLimitMs": 2000,
    "samples": [
        {"id": "sample-1", "name": "Case 1", "input": "3 3\n110\n010\n001", "expectedOutput": "2", "explanation": "One island at top-center and another at bottom-right.", "isHidden": False},
        {"id": "sample-2", "name": "Case 2", "input": "2 2\n00\n00", "expectedOutput": "0", "explanation": "No land cells.", "isHidden": False}
    ],
    "hiddenTests": [
        {"id": "hidden-1", "name": "Hidden 1", "input": "1 1\n1", "expectedOutput": "1", "isHidden": True},
        {"id": "hidden-2", "name": "Hidden 2", "input": "1 4\n1010", "expectedOutput": "2", "isHidden": True},
        {"id": "hidden-3", "name": "Hidden 3", "input": "3 3\n111\n010\n111", "expectedOutput": "1", "isHidden": True},
        {"id": "hidden-4", "name": "Hidden 4", "input": "4 4\n1001\n0110\n0110\n1001", "expectedOutput": "5", "isHidden": True},
        {"id": "hidden-5", "name": "Hidden 5", "input": "2 3\n101\n101", "expectedOutput": "2", "isHidden": True},
        {"id": "hidden-6", "name": "Hidden 6", "input": "3 3\n101\n010\n101", "expectedOutput": "5", "isHidden": True}
    ],
    "starterCode": {
        "c": "#include <stdio.h>\n\nint main() {\n    int r, c;\n    if (scanf(\"%d %d\", &r, &c) != 2) return 0;\n    char grid[15][15];\n    for (int i = 0; i < r; i++) scanf(\"%s\", grid[i]);\n    // Write your solution here\n    return 0;\n}",
        "cpp": "#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nint main() {\n    int r, c;\n    if (cin >> r >> c) {\n        vector<string> grid(r);\n        for (int i = 0; i < r; i++) cin >> grid[i];\n        // Write your solution here\n    }\n    return 0;\n}",
        "java": "import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int r = sc.nextInt();\n            int c = sc.nextInt();\n            String[] grid = new String[r];\n            for (int i = 0; i < r; i++) grid[i] = sc.next();\n            // Write your solution here\n        }\n    }\n}",
        "python": "import sys\n\ndef main():\n    tokens = sys.stdin.read().split()\n    if not tokens:\n        return\n    r, c = int(tokens[0]), int(tokens[1])\n    grid = tokens[2:2+r]\n    # Write your solution here\n\nif __name__ == '__main__':\n    main()"
    },
    "sol1": "import sys\nt = sys.stdin.read().split()\nif t:\n    r, c = int(t[0]), int(t[1])\n    grid = [list(row) for row in t[2:2+r]]\n    def dfs(i, j):\n        if i < 0 or i >= r or j < 0 or j >= c or grid[i][j] != '1':\n            return\n        grid[i][j] = '0'\n        dfs(i+1, j)\n        dfs(i-1, j)\n        dfs(i, j+1)\n        dfs(i, j-1)\n    islands = 0\n    for i in range(r):\n        for j in range(c):\n            if grid[i][j] == '1':\n                islands += 1\n                dfs(i, j)\n    print(islands)\n",
    "sol2": "import sys\nfrom collections import deque\nt = sys.stdin.read().split()\nif t:\n    r, c = int(t[0]), int(t[1])\n    grid = [list(row) for row in t[2:2+r]]\n    visited = [[False]*c for _ in range(r)]\n    ans = 0\n    for i in range(r):\n        for j in range(c):\n            if grid[i][j] == '1' and not visited[i][j]:\n                ans += 1\n                q = deque([(i, j)])\n                visited[i][j] = True\n                while q:\n                    ci, cj = q.popleft()\n                    for di, dj in [(-1,0), (1,0), (0,-1), (0,1)]:\n                        ni, nj = ci + di, cj + dj\n                        if 0 <= ni < r and 0 <= nj < c and grid[ni][nj] == '1' and not visited[ni][nj]:\n                            visited[ni][nj] = True\n                            q.append((ni, nj))\n    print(ans)\n"
}
problems.append(p23)

# 24. Subarray Sum Equals K
p24 = {
    "id": "subarray-sum-equals-k",
    "tier": "catapult",
    "title": "Subarray Sum Equals K",
    "difficulty": "Hard",
    "xp": 7,
    "weapon": "catapult",
    "story": "Count how many contiguous patrols achieve target tactical power K.",
    "task": "Given an array of N integers and an integer K, find the total number of continuous subarrays whose sum equals K.",
    "inputFormat": "Line 1: Two integers N and K (1 <= N <= 100, -10^5 <= K <= 10^5).\nLine 2: N space-separated integers A[1], ..., A[N].",
    "outputFormat": "Print the number of subarrays summing to K.",
    "constraints": ["1 <= N <= 100", "-1000 <= A[i] <= 1000", "-10^5 <= K <= 10^5"],
    "timeLimitMs": 2000,
    "samples": [
        {"id": "sample-1", "name": "Case 1", "input": "3 2\n1 1 1", "expectedOutput": "2", "explanation": "[1,1] at indices 1-2 and 2-3 both sum to 2.", "isHidden": False},
        {"id": "sample-2", "name": "Case 2", "input": "3 3\n1 2 3", "expectedOutput": "2", "explanation": "[1,2] and [3] both sum to 3.", "isHidden": False}
    ],
    "hiddenTests": [
        {"id": "hidden-1", "name": "Hidden 1", "input": "1 0\n0", "expectedOutput": "1", "isHidden": True},
        {"id": "hidden-2", "name": "Hidden 2", "input": "4 0\n1 -1 1 -1", "expectedOutput": "4", "isHidden": True},
        {"id": "hidden-3", "name": "Hidden 3", "input": "5 5\n2 3 5 -5 5", "expectedOutput": "5", "isHidden": True},
        {"id": "hidden-4", "name": "Hidden 4", "input": "3 10\n1 2 3", "expectedOutput": "0", "isHidden": True},
        {"id": "hidden-5", "name": "Hidden 5", "input": "4 -2\n-1 -1 2 -2", "expectedOutput": "3", "isHidden": True},
        {"id": "hidden-6", "name": "Hidden 6", "input": "5 1\n1 0 0 0 1", "expectedOutput": "8", "isHidden": True}
    ],
    "starterCode": {
        "c": "#include <stdio.h>\n\nint main() {\n    int n, k;\n    if (scanf(\"%d %d\", &n, &k) != 2) return 0;\n    int a[105];\n    for (int i = 0; i < n; i++) scanf(\"%d\", &a[i]);\n    // Write your solution here\n    return 0;\n}",
        "cpp": "#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    int n, k;\n    if (cin >> n >> k) {\n        vector<int> a(n);\n        for (int i = 0; i < n; i++) cin >> a[i];\n        // Write your solution here\n    }\n    return 0;\n}",
        "java": "import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int n = sc.nextInt();\n            int k = sc.nextInt();\n            int[] a = new int[n];\n            for (int i = 0; i < n; i++) a[i] = sc.nextInt();\n            // Write your solution here\n        }\n    }\n}",
        "python": "import sys\n\ndef main():\n    tokens = sys.stdin.read().split()\n    if not tokens:\n        return\n    n, k = int(tokens[0]), int(tokens[1])\n    a = [int(x) for x in tokens[2:2+n]]\n    # Write your solution here\n\nif __name__ == '__main__':\n    main()"
    },
    "sol1": "import sys\nt = [int(x) for x in sys.stdin.read().split()]\nif t:\n    n, k = t[0], t[1]\n    arr = t[2:2+n]\n    count = 0\n    for i in range(n):\n        s = 0\n        for j in range(i, n):\n            s += arr[j]\n            if s == k:\n                count += 1\n    print(count)\n",
    "sol2": "import sys\nt = [int(x) for x in sys.stdin.read().split()]\nif t:\n    n, k = t[0], t[1]\n    arr = t[2:2+n]\n    prefix_counts = {0: 1}\n    cur = 0\n    ans = 0\n    for x in arr:\n        cur += x\n        ans += prefix_counts.get(cur - k, 0)\n        prefix_counts[cur] = prefix_counts.get(cur, 0) + 1\n    print(ans)\n"
}
problems.append(p24)

# ==============================================================================
# TIER 4: BALLISTA (10 XP)
# ==============================================================================

# 25. Coin Change (min coins)
p25 = {
    "id": "coin-change",
    "tier": "ballista",
    "title": "Coin Change",
    "difficulty": "Extreme",
    "xp": 10,
    "weapon": "ballista",
    "story": "Melt down the fewest silver coins to pay the dragon tribute amount A.",
    "task": "Given N distinct coin denominations and an amount A, find the minimum number of coins needed to make up amount A. You may use each coin infinitely many times. If amount cannot be made up, print -1.",
    "inputFormat": "Line 1: Two integers N and A (1 <= N <= 10, 0 <= A <= 1000).\nLine 2: N space-separated positive integers (coin values).",
    "outputFormat": "Print the minimum coins, or -1.",
    "constraints": ["1 <= N <= 10", "0 <= A <= 1000", "1 <= coin[i] <= 1000"],
    "timeLimitMs": 2000,
    "samples": [
        {"id": "sample-1", "name": "Case 1", "input": "3 11\n1 2 5", "expectedOutput": "3", "explanation": "5 + 5 + 1 = 11 (3 coins).", "isHidden": False},
        {"id": "sample-2", "name": "Case 2", "input": "1 3\n2", "expectedOutput": "-1", "explanation": "Cannot make 3 using only 2s.", "isHidden": False}
    ],
    "hiddenTests": [
        {"id": "hidden-1", "name": "Hidden 1", "input": "2 0\n1 2", "expectedOutput": "0", "isHidden": True},
        {"id": "hidden-2", "name": "Hidden 2", "input": "1 7\n7", "expectedOutput": "1", "isHidden": True},
        {"id": "hidden-3", "name": "Hidden 3", "input": "3 7\n2 4 6", "expectedOutput": "-1", "isHidden": True},
        {"id": "hidden-4", "name": "Hidden 4", "input": "4 15\n1 5 10 25", "expectedOutput": "2", "isHidden": True},
        {"id": "hidden-5", "name": "Hidden 5", "input": "3 30\n10 15 25", "expectedOutput": "2", "isHidden": True},
        {"id": "hidden-6", "name": "Hidden 6", "input": "3 8\n3 5 7", "expectedOutput": "2", "isHidden": True}
    ],
    "starterCode": {
        "c": "#include <stdio.h>\n\nint main() {\n    int n, a;\n    if (scanf(\"%d %d\", &n, &a) != 2) return 0;\n    int coins[15];\n    for (int i = 0; i < n; i++) scanf(\"%d\", &coins[i]);\n    // Write your solution here\n    return 0;\n}",
        "cpp": "#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    int n, a;\n    if (cin >> n >> a) {\n        vector<int> coins(n);\n        for (int i = 0; i < n; i++) cin >> coins[i];\n        // Write your solution here\n    }\n    return 0;\n}",
        "java": "import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int n = sc.nextInt();\n            int a = sc.nextInt();\n            int[] coins = new int[n];\n            for (int i = 0; i < n; i++) coins[i] = sc.nextInt();\n            // Write your solution here\n        }\n    }\n}",
        "python": "import sys\n\ndef main():\n    tokens = sys.stdin.read().split()\n    if not tokens:\n        return\n    n, a = int(tokens[0]), int(tokens[1])\n    coins = [int(x) for x in tokens[2:2+n]]\n    # Write your solution here\n\nif __name__ == '__main__':\n    main()"
    },
    "sol1": "import sys\nt = [int(x) for x in sys.stdin.read().split()]\nif t:\n    n, amount = t[0], t[1]\n    coins = t[2:2+n]\n    dp = [float('inf')] * (amount + 1)\n    dp[0] = 0\n    for i in range(1, amount + 1):\n        for c in coins:\n            if i >= c:\n                dp[i] = min(dp[i], dp[i - c] + 1)\n    print(-1 if dp[amount] == float('inf') else dp[amount])\n",
    "sol2": "import sys\nfrom collections import deque\nt = [int(x) for x in sys.stdin.read().split()]\nif t:\n    n, amount = t[0], t[1]\n    coins = t[2:2+n]\n    if amount == 0: print(0); sys.exit(0)\n    visited = {0}\n    q = deque([(0, 0)])\n    ans = -1\n    while q:\n        cur, steps = q.popleft()\n        if cur == amount:\n            ans = steps\n            break\n        for c in coins:\n            nxt = cur + c\n            if nxt <= amount and nxt not in visited:\n                visited.add(nxt)\n                q.append((nxt, steps + 1))\n    print(ans)\n"
}
problems.append(p25)

# 26. Longest Increasing Subsequence
p26 = {
    "id": "longest-increasing-subsequence",
    "tier": "ballista",
    "title": "Longest Increasing Subsequence",
    "difficulty": "Extreme",
    "xp": 10,
    "weapon": "ballista",
    "story": "Find the longest ascending sequence of ballista bolt calibers.",
    "task": "Given an array of N integers, find the length of the longest strictly increasing subsequence.",
    "inputFormat": "Line 1: An integer N (1 <= N <= 100).\nLine 2: N space-separated integers.",
    "outputFormat": "Print the length of the longest strictly increasing subsequence.",
    "constraints": ["1 <= N <= 100", "-1000 <= A[i] <= 1000"],
    "timeLimitMs": 2000,
    "samples": [
        {"id": "sample-1", "name": "Case 1", "input": "6\n10 9 2 5 3 7", "expectedOutput": "3", "explanation": "[2, 5, 7] or [2, 3, 7] has length 3.", "isHidden": False},
        {"id": "sample-2", "name": "Case 2", "input": "4\n0 1 0 3", "expectedOutput": "3", "explanation": "[0, 1, 3] has length 3.", "isHidden": False}
    ],
    "hiddenTests": [
        {"id": "hidden-1", "name": "Hidden 1", "input": "1\n5", "expectedOutput": "1", "isHidden": True},
        {"id": "hidden-2", "name": "Hidden 2", "input": "5\n7 7 7 7 7", "expectedOutput": "1", "isHidden": True},
        {"id": "hidden-3", "name": "Hidden 3", "input": "5\n1 2 3 4 5", "expectedOutput": "5", "isHidden": True},
        {"id": "hidden-4", "name": "Hidden 4", "input": "5\n5 4 3 2 1", "expectedOutput": "1", "isHidden": True},
        {"id": "hidden-5", "name": "Hidden 5", "input": "8\n10 22 9 33 21 50 41 60", "expectedOutput": "5", "isHidden": True},
        {"id": "hidden-6", "name": "Hidden 6", "input": "6\n3 10 2 1 20 4", "expectedOutput": "3", "isHidden": True}
    ],
    "starterCode": {
        "c": "#include <stdio.h>\n\nint main() {\n    int n;\n    if (scanf(\"%d\", &n) != 1) return 0;\n    int a[105];\n    for (int i = 0; i < n; i++) scanf(\"%d\", &a[i]);\n    // Write your solution here\n    return 0;\n}",
        "cpp": "#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    int n;\n    if (cin >> n) {\n        vector<int> a(n);\n        for (int i = 0; i < n; i++) cin >> a[i];\n        // Write your solution here\n    }\n    return 0;\n}",
        "java": "import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int n = sc.nextInt();\n            int[] a = new int[n];\n            for (int i = 0; i < n; i++) a[i] = sc.nextInt();\n            // Write your solution here\n        }\n    }\n}",
        "python": "import sys\n\ndef main():\n    tokens = sys.stdin.read().split()\n    if not tokens:\n        return\n    n = int(tokens[0])\n    a = [int(x) for x in tokens[1:1+n]]\n    # Write your solution here\n\nif __name__ == '__main__':\n    main()"
    },
    "sol1": "import sys\nt = [int(x) for x in sys.stdin.read().split()]\nif t:\n    n = t[0]\n    arr = t[1:1+n]\n    dp = [1] * n\n    for i in range(n):\n        for j in range(i):\n            if arr[j] < arr[i]:\n                dp[i] = max(dp[i], dp[j] + 1)\n    print(max(dp))\n",
    "sol2": "import sys, bisect\nt = [int(x) for x in sys.stdin.read().split()]\nif t:\n    n = t[0]\n    arr = t[1:1+n]\n    tails = []\n    for x in arr:\n        idx = bisect.bisect_left(tails, x)\n        if idx == len(tails):\n            tails.append(x)\n        else:\n            tails[idx] = x\n    print(len(tails))\n"
}
problems.append(p26)

# 27. Edit Distance
p27 = {
    "id": "edit-distance",
    "tier": "ballista",
    "title": "Edit Distance",
    "difficulty": "Extreme",
    "xp": 10,
    "weapon": "ballista",
    "story": "Find minimum rune scribing operations (insert, delete, replace) to convert word A into word B.",
    "task": "Given two strings word1 and word2 consisting of lowercase English letters, compute the minimum number of operations required to convert word1 to word2.",
    "inputFormat": "Two space-separated strings word1 and word2.",
    "outputFormat": "Print the minimum edit distance.",
    "constraints": ["1 <= |word1|, |word2| <= 50", "Strings consist of lowercase English letters."],
    "timeLimitMs": 2000,
    "samples": [
        {"id": "sample-1", "name": "Case 1", "input": "horse ros", "expectedOutput": "3", "explanation": "horse -> rorse -> rose -> ros (3 operations).", "isHidden": False},
        {"id": "sample-2", "name": "Case 2", "input": "intention execution", "expectedOutput": "5", "explanation": "5 operations required.", "isHidden": False}
    ],
    "hiddenTests": [
        {"id": "hidden-1", "name": "Hidden 1", "input": "abc abc", "expectedOutput": "0", "isHidden": True},
        {"id": "hidden-2", "name": "Hidden 2", "input": "a b", "expectedOutput": "1", "isHidden": True},
        {"id": "hidden-3", "name": "Hidden 3", "input": "viking king", "expectedOutput": "2", "isHidden": True},
        {"id": "hidden-4", "name": "Hidden 4", "input": "fast faster", "expectedOutput": "2", "isHidden": True},
        {"id": "hidden-5", "name": "Hidden 5", "input": "dragon dragon", "expectedOutput": "0", "isHidden": True},
        {"id": "hidden-6", "name": "Hidden 6", "input": "kitten sitting", "expectedOutput": "3", "isHidden": True}
    ],
    "starterCode": {
        "c": "#include <stdio.h>\n#include <string.h>\n\nint main() {\n    char w1[60], w2[60];\n    if (scanf(\"%s %s\", w1, w2) != 2) return 0;\n    // Write your solution here\n    return 0;\n}",
        "cpp": "#include <iostream>\n#include <string>\nusing namespace std;\n\nint main() {\n    string w1, w2;\n    if (cin >> w1 >> w2) {\n        // Write your solution here\n    }\n    return 0;\n}",
        "java": "import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNext()) {\n            String w1 = sc.next();\n            String w2 = sc.next();\n            // Write your solution here\n        }\n    }\n}",
        "python": "import sys\n\ndef main():\n    tokens = sys.stdin.read().split()\n    if len(tokens) < 2:\n        return\n    w1, w2 = tokens[0], tokens[1]\n    # Write your solution here\n\nif __name__ == '__main__':\n    main()"
    },
    "sol1": "import sys\nt = sys.stdin.read().split()\nif len(t) >= 2:\n    w1, w2 = t[0], t[1]\n    m, n = len(w1), len(w2)\n    dp = [[0]*(n+1) for _ in range(m+1)]\n    for i in range(m+1): dp[i][0] = i\n    for j in range(n+1): dp[0][j] = j\n    for i in range(1, m+1):\n        for j in range(1, n+1):\n            if w1[i-1] == w2[j-1]:\n                dp[i][j] = dp[i-1][j-1]\n            else:\n                dp[i][j] = 1 + min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1])\n    print(dp[m][n])\n",
    "sol2": "import sys\nt = sys.stdin.read().split()\nif len(t) >= 2:\n    w1, w2 = t[0], t[1]\n    memo = {}\n    def dist(i, j):\n        if i == len(w1): return len(w2) - j\n        if j == len(w2): return len(w1) - i\n        if (i, j) in memo: return memo[(i, j)]\n        if w1[i] == w2[j]:\n            res = dist(i+1, j+1)\n        else:\n            res = 1 + min(dist(i+1, j), dist(i, j+1), dist(i+1, j+1))\n        memo[(i, j)] = res\n        return res\n    print(dist(0, 0))\n"
}
problems.append(p27)

# 28. Shortest Path in a Grid
p28 = {
    "id": "shortest-path-in-a-grid",
    "tier": "ballista",
    "title": "Shortest Path in a Grid",
    "difficulty": "Extreme",
    "xp": 10,
    "weapon": "ballista",
    "story": "Navigate the dragon cavern grid from top-left (0,0) to bottom-right (R-1, C-1) avoiding fiery obstacles.",
    "task": "Given an R x C grid where 0 is walkable and 1 is blocked, find the shortest path length (number of cells visited including start and end) from (0,0) to (R-1, C-1) moving up/down/left/right. If blocked at start/end or no path exists, print -1.",
    "inputFormat": "Line 1: Two integers R and C (1 <= R, C <= 10).\nNext R lines: C space-separated integers (0 or 1).",
    "outputFormat": "Print the shortest path length, or -1.",
    "constraints": ["1 <= R, C <= 10", "Grid cells are 0 or 1."],
    "timeLimitMs": 2000,
    "samples": [
        {"id": "sample-1", "name": "Case 1", "input": "3 3\n0 0 0\n1 1 0\n0 0 0", "expectedOutput": "5", "explanation": "(0,0)->(0,1)->(0,2)->(1,2)->(2,2) takes 5 cells.", "isHidden": False},
        {"id": "sample-2", "name": "Case 2", "input": "2 2\n0 1\n1 0", "expectedOutput": "-1", "explanation": "Path is completely blocked.", "isHidden": False}
    ],
    "hiddenTests": [
        {"id": "hidden-1", "name": "Hidden 1", "input": "1 1\n0", "expectedOutput": "1", "isHidden": True},
        {"id": "hidden-2", "name": "Hidden 2", "input": "1 1\n1", "expectedOutput": "-1", "isHidden": True},
        {"id": "hidden-3", "name": "Hidden 3", "input": "3 3\n0 0 0\n0 0 0\n0 0 0", "expectedOutput": "5", "isHidden": True},
        {"id": "hidden-4", "name": "Hidden 4", "input": "3 3\n0 1 0\n0 1 0\n0 1 0", "expectedOutput": "-1", "isHidden": True},
        {"id": "hidden-5", "name": "Hidden 5", "input": "2 3\n0 0 0\n1 1 0", "expectedOutput": "4", "isHidden": True},
        {"id": "hidden-6", "name": "Hidden 6", "input": "4 4\n0 0 0 0\n1 1 1 0\n0 0 0 0\n0 1 1 0", "expectedOutput": "7", "isHidden": True}
    ],
    "starterCode": {
        "c": "#include <stdio.h>\n\nint main() {\n    int r, c;\n    if (scanf(\"%d %d\", &r, &c) != 2) return 0;\n    int grid[15][15];\n    for (int i = 0; i < r; i++) {\n        for (int j = 0; j < c; j++) scanf(\"%d\", &grid[i][j]);\n    }\n    // Write your solution here\n    return 0;\n}",
        "cpp": "#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    int r, c;\n    if (cin >> r >> c) {\n        vector<vector<int>> grid(r, vector<int>(c));\n        for (int i = 0; i < r; i++) {\n            for (int j = 0; j < c; j++) cin >> grid[i][j];\n        }\n        // Write your solution here\n    }\n    return 0;\n}",
        "java": "import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int r = sc.nextInt();\n            int c = sc.nextInt();\n            int[][] grid = new int[r][c];\n            for (int i = 0; i < r; i++) {\n                for (int j = 0; j < c; j++) grid[i][j] = sc.nextInt();\n            }\n            // Write your solution here\n        }\n    }\n}",
        "python": "import sys\n\ndef main():\n    tokens = sys.stdin.read().split()\n    if not tokens:\n        return\n    r, c = int(tokens[0]), int(tokens[1])\n    grid = []\n    idx = 2\n    for i in range(r):\n        grid.append([int(x) for x in tokens[idx:idx+c]])\n        idx += c\n    # Write your solution here\n\nif __name__ == '__main__':\n    main()"
    },
    "sol1": "import sys\nfrom collections import deque\nt = [int(x) for x in sys.stdin.read().split()]\nif t:\n    r, c = t[0], t[1]\n    grid = []\n    idx = 2\n    for i in range(r):\n        grid.append(t[idx:idx+c])\n        idx += c\n    if grid[0][0] == 1 or grid[r-1][c-1] == 1:\n        print(-1); sys.exit(0)\n    q = deque([(0, 0, 1)])\n    visited = {(0, 0)}\n    ans = -1\n    while q:\n        ci, cj, dist = q.popleft()\n        if ci == r - 1 and cj == c - 1:\n            ans = dist\n            break\n        for di, dj in [(-1,0), (1,0), (0,-1), (0,1)]:\n            ni, nj = ci + di, cj + dj\n            if 0 <= ni < r and 0 <= nj < c and grid[ni][nj] == 0 and (ni, nj) not in visited:\n                visited.add((ni, nj))\n                q.append((ni, nj, dist + 1))\n    print(ans)\n",
    "sol2": "import sys\nt = [int(x) for x in sys.stdin.read().split()]\nif t:\n    r, c = t[0], t[1]\n    grid = []\n    idx = 2\n    for i in range(r):\n        grid.append(t[idx:idx+c])\n        idx += c\n    if grid[0][0] == 1 or grid[r-1][c-1] == 1:\n        print(-1); sys.exit(0)\n    dist = [[-1]*c for _ in range(r)]\n    dist[0][0] = 1\n    frontier = [(0, 0)]\n    while frontier:\n        nxt = []\n        for ci, cj in frontier:\n            for di, dj in [(-1,0), (1,0), (0,-1), (0,1)]:\n                ni, nj = ci + di, cj + dj\n                if 0 <= ni < r and 0 <= nj < c and grid[ni][nj] == 0 and dist[ni][nj] == -1:\n                    dist[ni][nj] = dist[ci][cj] + 1\n                    nxt.append((ni, nj))\n        frontier = nxt\n    print(dist[r-1][c-1])\n"
}
problems.append(p28)

# 29. 0/1 Knapsack
p29 = {
    "id": "knapsack-01",
    "tier": "ballista",
    "title": "0/1 Knapsack",
    "difficulty": "Extreme",
    "xp": 10,
    "weapon": "ballista",
    "story": "Pack the most valuable dragon relics into your longship cargo hold without exceeding weight capacity W.",
    "task": "Given N items with weights and values, and a maximum weight capacity W, find the maximum total value possible without exceeding W. Each item can be chosen at most once.",
    "inputFormat": "Line 1: Two integers N and W (1 <= N <= 50, 1 <= W <= 500).\nLine 2: N space-separated weights wt[i].\nLine 3: N space-separated values val[i].",
    "outputFormat": "Print the maximum total value.",
    "constraints": ["1 <= N <= 50", "1 <= W <= 500", "1 <= wt[i], val[i] <= 500"],
    "timeLimitMs": 2000,
    "samples": [
        {"id": "sample-1", "name": "Case 1", "input": "3 4\n1 2 3\n10 15 40", "expectedOutput": "55", "explanation": "Pick items 1 and 3: wt = 1+3=4, val = 10+40 = 50? Wait, wt=1(10), wt=3(40) -> 50; or wt=1+2=3(25); wt=1(10)+wt=3(40)=50. Wait! Can we pick item 1 (10) and item 3 (40)? Total weight 4, total value 50? Wait, item 2 is wt=2, val=15! 15+40=55 with weight 2+3=5 > 4! Wait, for W=4: item 1 (wt 1, val 10) + item 3 (wt 3, val 40) gives wt 4, val 50. Let's check: items wt 1 val 10, wt 2 val 15, wt 3 val 40. Max val for W=4 is 10 + 40 = 50. Let's make sample 1 expectedOutput 50 or sample input wt 1 2 3 val 10 20 40 -> 20 + 40? No wt 2+3=5.", "isHidden": False},
        {"id": "sample-2", "name": "Case 2", "input": "3 3\n4 5 6\n1 2 3", "expectedOutput": "0", "explanation": "All items exceed capacity 3.", "isHidden": False}
    ],
    "hiddenTests": [
        {"id": "hidden-1", "name": "Hidden 1", "input": "1 10\n5\n10", "expectedOutput": "10", "isHidden": True},
        {"id": "hidden-2", "name": "Hidden 2", "input": "1 5\n10\n10", "expectedOutput": "0", "isHidden": True},
        {"id": "hidden-3", "name": "Hidden 3", "input": "4 5\n2 1 3 2\n12 10 20 15", "expectedOutput": "37", "isHidden": True},
        {"id": "hidden-4", "name": "Hidden 4", "input": "4 7\n1 3 4 5\n1 4 5 7", "expectedOutput": "9", "isHidden": True},
        {"id": "hidden-5", "name": "Hidden 5", "input": "3 50\n10 20 30\n60 100 120", "expectedOutput": "220", "isHidden": True},
        {"id": "hidden-6", "name": "Hidden 6", "input": "2 10\n5 5\n10 10", "expectedOutput": "20", "isHidden": True}
    ],
    "starterCode": {
        "c": "#include <stdio.h>\n\nint main() {\n    int n, w;\n    if (scanf(\"%d %d\", &n, &w) != 2) return 0;\n    int wt[55], val[55];\n    for (int i = 0; i < n; i++) scanf(\"%d\", &wt[i]);\n    for (int i = 0; i < n; i++) scanf(\"%d\", &val[i]);\n    // Write your solution here\n    return 0;\n}",
        "cpp": "#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    int n, w;\n    if (cin >> n >> w) {\n        vector<int> wt(n), val(n);\n        for (int i = 0; i < n; i++) cin >> wt[i];\n        for (int i = 0; i < n; i++) cin >> val[i];\n        // Write your solution here\n    }\n    return 0;\n}",
        "java": "import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int n = sc.nextInt();\n            int w = sc.nextInt();\n            int[] wt = new int[n];\n            int[] val = new int[n];\n            for (int i = 0; i < n; i++) wt[i] = sc.nextInt();\n            for (int i = 0; i < n; i++) val[i] = sc.nextInt();\n            // Write your solution here\n        }\n    }\n}",
        "python": "import sys\n\ndef main():\n    tokens = sys.stdin.read().split()\n    if not tokens:\n        return\n    n, w = int(tokens[0]), int(tokens[1])\n    wt = [int(x) for x in tokens[2:2+n]]\n    val = [int(x) for x in tokens[2+n:2+2*n]]\n    # Write your solution here\n\nif __name__ == '__main__':\n    main()"
    },
    "sol1": "import sys\nt = [int(x) for x in sys.stdin.read().split()]\nif t:\n    n, w = t[0], t[1]\n    wt = t[2:2+n]\n    val = t[2+n:2+2*n]\n    dp = [0] * (w + 1)\n    for i in range(n):\n        for c in range(w, wt[i] - 1, -1):\n            dp[c] = max(dp[c], dp[c - wt[i]] + val[i])\n    print(dp[w])\n",
    "sol2": "import sys\nt = [int(x) for x in sys.stdin.read().split()]\nif t:\n    n, w = t[0], t[1]\n    wt = t[2:2+n]\n    val = t[2+n:2+2*n]\n    memo = {}\n    def solve(i, cap):\n        if i == n or cap == 0: return 0\n        if (i, cap) in memo: return memo[(i, cap)]\n        res = solve(i+1, cap)\n        if wt[i] <= cap:\n            res = max(res, val[i] + solve(i+1, cap - wt[i]))\n        memo[(i, cap)] = res\n        return res\n    print(solve(0, w))\n"
}
# Fix sample 1 explanation and expectedOutput for knapsack:
# If N=3, W=4, wt=[1, 2, 3], val=[10, 15, 40]
# Item 1 (wt 1, val 10) + Item 3 (wt 3, val 40) => total weight 4 <= 4, total value 50.
p29["samples"][0]["expectedOutput"] = "50"
p29["samples"][0]["explanation"] = "Pick item 1 and item 3 for weight 1+3=4 and value 10+40=50."
problems.append(p29)

# 30. Longest Common Subsequence
p30 = {
    "id": "longest-common-subsequence",
    "tier": "ballista",
    "title": "Longest Common Subsequence",
    "difficulty": "Extreme",
    "xp": 10,
    "weapon": "ballista",
    "story": "Find the longest matching battle command sequence shared between two elder skalds.",
    "task": "Given two strings S1 and S2 of lowercase English letters, find the length of their longest common subsequence.",
    "inputFormat": "Two space-separated strings S1 and S2.",
    "outputFormat": "Print the length of their longest common subsequence.",
    "constraints": ["1 <= |S1|, |S2| <= 100", "Strings contain lowercase English letters."],
    "timeLimitMs": 2000,
    "samples": [
        {"id": "sample-1", "name": "Case 1", "input": "abcde ace", "expectedOutput": "3", "explanation": "'ace' is a common subsequence of length 3.", "isHidden": False},
        {"id": "sample-2", "name": "Case 2", "input": "abc def", "expectedOutput": "0", "explanation": "No common characters.", "isHidden": False}
    ],
    "hiddenTests": [
        {"id": "hidden-1", "name": "Hidden 1", "input": "abc abc", "expectedOutput": "3", "isHidden": True},
        {"id": "hidden-2", "name": "Hidden 2", "input": "ezupkr rkpuze", "expectedOutput": "1", "isHidden": True},
        {"id": "hidden-3", "name": "Hidden 3", "input": "oxcpqrsvwf shmtflrx", "expectedOutput": "2", "isHidden": True},
        {"id": "hidden-4", "name": "Hidden 4", "input": "vikings vikings", "expectedOutput": "7", "isHidden": True},
        {"id": "hidden-5", "name": "Hidden 5", "input": "a b", "expectedOutput": "0", "isHidden": True},
        {"id": "hidden-6", "name": "Hidden 6", "input": "a a", "expectedOutput": "1", "isHidden": True}
    ],
    "starterCode": {
        "c": "#include <stdio.h>\n#include <string.h>\n\nint main() {\n    char s1[105], s2[105];\n    if (scanf(\"%s %s\", s1, s2) != 2) return 0;\n    // Write your solution here\n    return 0;\n}",
        "cpp": "#include <iostream>\n#include <string>\nusing namespace std;\n\nint main() {\n    string s1, s2;\n    if (cin >> s1 >> s2) {\n        // Write your solution here\n    }\n    return 0;\n}",
        "java": "import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNext()) {\n            String s1 = sc.next();\n            String s2 = sc.next();\n            // Write your solution here\n        }\n    }\n}",
        "python": "import sys\n\ndef main():\n    tokens = sys.stdin.read().split()\n    if len(tokens) < 2:\n        return\n    s1, s2 = tokens[0], tokens[1]\n    # Write your solution here\n\nif __name__ == '__main__':\n    main()"
    },
    "sol1": "import sys\nt = sys.stdin.read().split()\nif len(t) >= 2:\n    s1, s2 = t[0], t[1]\n    m, n = len(s1), len(s2)\n    dp = [[0]*(n+1) for _ in range(m+1)]\n    for i in range(1, m+1):\n        for j in range(1, n+1):\n            if s1[i-1] == s2[j-1]:\n                dp[i][j] = dp[i-1][j-1] + 1\n            else:\n                dp[i][j] = max(dp[i-1][j], dp[i][j-1])\n    print(dp[m][n])\n",
    "sol2": "import sys\nt = sys.stdin.read().split()\nif len(t) >= 2:\n    s1, s2 = t[0], t[1]\n    prev = [0] * (len(s2) + 1)\n    for c1 in s1:\n        cur = [0] * (len(s2) + 1)\n        for j, c2 in enumerate(s2, 1):\n            if c1 == c2:\n                cur[j] = prev[j-1] + 1\n            else:\n                cur[j] = max(prev[j], cur[j-1])\n        prev = cur\n    print(prev[len(s2)])\n"
}
problems.append(p30)

# 31. Grid Paths with Obstacles
p31 = {
    "id": "grid-paths-with-obstacles",
    "tier": "ballista",
    "title": "Grid Paths with Obstacles",
    "difficulty": "Extreme",
    "xp": 10,
    "weapon": "ballista",
    "story": "Count all valid tactical advance routes from top-left (0,0) to bottom-right (R-1, C-1) moving only right and down.",
    "task": "Given an R x C grid where 0 indicates an empty space and 1 indicates an obstacle, count the number of unique paths from (0,0) to (R-1, C-1). At each cell you can only move right or down.",
    "inputFormat": "Line 1: Two integers R and C (1 <= R, C <= 10).\nNext R lines: C space-separated integers (0 or 1).",
    "outputFormat": "Print the number of unique paths.",
    "constraints": ["1 <= R, C <= 10", "Grid cells are 0 or 1."],
    "timeLimitMs": 2000,
    "samples": [
        {"id": "sample-1", "name": "Case 1", "input": "3 3\n0 0 0\n0 1 0\n0 0 0", "expectedOutput": "2", "explanation": "Only 2 paths avoid the obstacle at (1,1).", "isHidden": False},
        {"id": "sample-2", "name": "Case 2", "input": "2 2\n0 1\n0 0", "expectedOutput": "1", "explanation": "Only down-then-right is possible.", "isHidden": False}
    ],
    "hiddenTests": [
        {"id": "hidden-1", "name": "Hidden 1", "input": "1 1\n0", "expectedOutput": "1", "isHidden": True},
        {"id": "hidden-2", "name": "Hidden 2", "input": "1 1\n1", "expectedOutput": "0", "isHidden": True},
        {"id": "hidden-3", "name": "Hidden 3", "input": "2 2\n1 0\n0 0", "expectedOutput": "0", "isHidden": True},
        {"id": "hidden-4", "name": "Hidden 4", "input": "3 3\n0 0 0\n0 0 0\n0 0 0", "expectedOutput": "6", "isHidden": True},
        {"id": "hidden-5", "name": "Hidden 5", "input": "4 4\n0 0 0 0\n0 1 0 0\n0 0 1 0\n0 0 0 0", "expectedOutput": "4", "isHidden": True},
        {"id": "hidden-6", "name": "Hidden 6", "input": "1 3\n0 1 0", "expectedOutput": "0", "isHidden": True}
    ],
    "starterCode": {
        "c": "#include <stdio.h>\n\nint main() {\n    int r, c;\n    if (scanf(\"%d %d\", &r, &c) != 2) return 0;\n    int grid[15][15];\n    for (int i = 0; i < r; i++) {\n        for (int j = 0; j < c; j++) scanf(\"%d\", &grid[i][j]);\n    }\n    // Write your solution here\n    return 0;\n}",
        "cpp": "#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    int r, c;\n    if (cin >> r >> c) {\n        vector<vector<int>> grid(r, vector<int>(c));\n        for (int i = 0; i < r; i++) {\n            for (int j = 0; j < c; j++) cin >> grid[i][j];\n        }\n        // Write your solution here\n    }\n    return 0;\n}",
        "java": "import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int r = sc.nextInt();\n            int c = sc.nextInt();\n            int[][] grid = new int[r][c];\n            for (int i = 0; i < r; i++) {\n                for (int j = 0; j < c; j++) grid[i][j] = sc.nextInt();\n            }\n            // Write your solution here\n        }\n    }\n}",
        "python": "import sys\n\ndef main():\n    tokens = sys.stdin.read().split()\n    if not tokens:\n        return\n    r, c = int(tokens[0]), int(tokens[1])\n    grid = []\n    idx = 2\n    for i in range(r):\n        grid.append([int(x) for x in tokens[idx:idx+c]])\n        idx += c\n    # Write your solution here\n\nif __name__ == '__main__':\n    main()"
    },
    "sol1": "import sys\nt = [int(x) for x in sys.stdin.read().split()]\nif t:\n    r, c = t[0], t[1]\n    grid = []\n    idx = 2\n    for i in range(r):\n        grid.append(t[idx:idx+c])\n        idx += c\n    if grid[0][0] == 1 or grid[r-1][c-1] == 1:\n        print(0); sys.exit(0)\n    dp = [[0]*c for _ in range(r)]\n    dp[0][0] = 1\n    for i in range(r):\n        for j in range(c):\n            if grid[i][j] == 1:\n                dp[i][j] = 0\n                continue\n            if i > 0: dp[i][j] += dp[i-1][j]\n            if j > 0: dp[i][j] += dp[i][j-1]\n    print(dp[r-1][c-1])\n",
    "sol2": "import sys\nt = [int(x) for x in sys.stdin.read().split()]\nif t:\n    r, c = t[0], t[1]\n    grid = []\n    idx = 2\n    for i in range(r):\n        grid.append(t[idx:idx+c])\n        idx += c\n    memo = {}\n    def count(i, j):\n        if i >= r or j >= c or grid[i][j] == 1: return 0\n        if i == r - 1 and j == c - 1: return 1\n        if (i, j) in memo: return memo[(i, j)]\n        memo[(i, j)] = count(i+1, j) + count(i, j+1)\n        return memo[(i, j)]\n    print(count(0, 0))\n"
}
problems.append(p31)

# 32. Longest Palindromic Substring
p32 = {
    "id": "longest-palindromic-substring",
    "tier": "ballista",
    "title": "Longest Palindromic Substring",
    "difficulty": "Extreme",
    "xp": 10,
    "weapon": "ballista",
    "story": "Find the longest symmetrical runic inscription on the ballista chassis.",
    "task": "Given a string S of lowercase English letters, find the longest palindromic substring. If multiple palindromic substrings have the same maximum length, output the one that occurs earliest in S.",
    "inputFormat": "A single non-empty string S.",
    "outputFormat": "Print the longest palindromic substring.",
    "constraints": ["1 <= |S| <= 100", "S consists of lowercase English letters."],
    "timeLimitMs": 2000,
    "samples": [
        {"id": "sample-1", "name": "Case 1", "input": "babad", "expectedOutput": "bab", "explanation": "'bab' is the earliest longest palindrome of length 3.", "isHidden": False},
        {"id": "sample-2", "name": "Case 2", "input": "cbbd", "expectedOutput": "bb", "explanation": "'bb' has length 2.", "isHidden": False}
    ],
    "hiddenTests": [
        {"id": "hidden-1", "name": "Hidden 1", "input": "a", "expectedOutput": "a", "isHidden": True},
        {"id": "hidden-2", "name": "Hidden 2", "input": "ac", "expectedOutput": "a", "isHidden": True},
        {"id": "hidden-3", "name": "Hidden 3", "input": "racecar", "expectedOutput": "racecar", "isHidden": True},
        {"id": "hidden-4", "name": "Hidden 4", "input": "noon", "expectedOutput": "noon", "isHidden": True},
        {"id": "hidden-5", "name": "Hidden 5", "input": "abacdfgdcaba", "expectedOutput": "aba", "isHidden": True},
        {"id": "hidden-6", "name": "Hidden 6", "input": "forge", "expectedOutput": "f", "isHidden": True}
    ],
    "starterCode": {
        "c": "#include <stdio.h>\n#include <string.h>\n\nint main() {\n    char s[105];\n    if (scanf(\"%s\", s) != 1) return 0;\n    // Write your solution here\n    return 0;\n}",
        "cpp": "#include <iostream>\n#include <string>\nusing namespace std;\n\nint main() {\n    string s;\n    if (cin >> s) {\n        // Write your solution here\n    }\n    return 0;\n}",
        "java": "import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNext()) {\n            String s = sc.next();\n            // Write your solution here\n        }\n    }\n}",
        "python": "import sys\n\ndef main():\n    tokens = sys.stdin.read().split()\n    if not tokens:\n        return\n    s = tokens[0]\n    # Write your solution here\n\nif __name__ == '__main__':\n    main()"
    },
    "sol1": "import sys\nt = sys.stdin.read().split()\nif t:\n    s = t[0]\n    best = ''\n    for i in range(len(s)):\n        for j in range(i + 1, len(s) + 1):\n            sub = s[i:j]\n            if sub == sub[::-1]:\n                if len(sub) > len(best):\n                    best = sub\n    print(best)\n",
    "sol2": "import sys\nt = sys.stdin.read().split()\nif t:\n    s = t[0]\n    n = len(s)\n    start, max_len = 0, 1\n    for i in range(n):\n        # odd length\n        l, r = i, i\n        while l >= 0 and r < n and s[l] == s[r]:\n            if r - l + 1 > max_len:\n                start, max_len = l, r - l + 1\n            l -= 1; r += 1\n        # even length\n        l, r = i, i + 1\n        while l >= 0 and r < n and s[l] == s[r]:\n            if r - l + 1 > max_len:\n                start, max_len = l, r - l + 1\n            l -= 1; r += 1\n    print(s[start:start+max_len])\n"
}
problems.append(p32)

print(f"Total problems defined: {len(problems)}")

# Self-verification of all problems and their 2 solutions against all tests
def run_python(code, test_input):
    proc = subprocess.run(
        [sys.executable, "-c", code],
        input=test_input,
        capture_output=True,
        text=True,
        timeout=5
    )
    if proc.returncode != 0:
        raise RuntimeError(f"Execution error: {proc.stderr}")
    return proc.stdout.strip()

print("--- Running Verification of Reference Solutions ---")
failures = 0
total_tests = 0

for p in problems:
    p_id = p["id"]
    tests = p["samples"] + p["hiddenTests"]
    for idx, test in enumerate(tests):
        total_tests += 1
        inp = test["input"]
        expected = test["expectedOutput"].strip()

        # Run sol1
        out1 = run_python(p["sol1"], inp)
        # Run sol2
        out2 = run_python(p["sol2"], inp)

        if out1 != expected or out2 != expected or out1 != out2:
            print(f"FAILED on problem '{p_id}' test {idx+1}:")
            print(f"  Input: {inp!r}")
            print(f"  Expected: {expected!r}")
            print(f"  Sol 1:    {out1!r}")
            print(f"  Sol 2:    {out2!r}")
            failures += 1

if failures > 0:
    print(f"Verification FAILED with {failures} mismatches out of {total_tests} test runs.")
    sys.exit(1)
else:
    print(f"SUCCESS: All {total_tests} test runs passed! Both reference solutions match 100%!")

# Write data files
# 1. data/hidden_tests.json (server-only, gitignored)
hidden_dict = {}
for p in problems:
    hidden_dict[p["id"]] = {
        "hiddenTests": p["hiddenTests"],
        "timeLimitMs": p["timeLimitMs"]
    }

os.makedirs("data", exist_ok=True)
with open("data/hidden_tests.json", "w") as f:
    json.dump(hidden_dict, f, indent=2)
print("Wrote data/hidden_tests.json")

# 2. data/problems_pool.json (public info only: no hidden tests, no solutions)
pool_data = []
for p in problems:
    p_copy = {k: v for k, v in p.items() if k not in ("hiddenTests", "sol1", "sol2")}
    pool_data.append(p_copy)

with open("data/problems_pool.json", "w") as f:
    json.dump(pool_data, f, indent=2)
print("Wrote data/problems_pool.json")

# 3. data/reference_solutions.json (used by scripts/verifyPool.js)
solutions_dict = {}
for p in problems:
    solutions_dict[p["id"]] = {
        "sol1": p["sol1"],
        "sol2": p["sol2"],
        "samples": p["samples"]
    }
with open("data/reference_solutions.json", "w") as f:
    json.dump(solutions_dict, f, indent=2)
print("Wrote data/reference_solutions.json")
