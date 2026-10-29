#!/usr/bin/env python3
"""
generate_and_verify_48.py
Generates all 48 questions (12 per tier) matching data/question_list.md.
Includes:
- 2 independent Python reference solutions per question
- 2 sample cases + 6 hidden cases (edge cases, small constraints)
- Full verification: runs both solutions on all 384 test cases
- Generates data/problems_pool.json, data/hidden_tests.json, data/reference_solutions.json, src/data/problems.js
"""

import json
import math
import sys
from collections import Counter, deque

problems = []
solutions_1 = {}
solutions_2 = {}
tests_by_id = {}

def register(p, sol1, sol2, tests):
    problems.append(p)
    solutions_1[p["id"]] = sol1
    solutions_2[p["id"]] = sol2
    tests_by_id[p["id"]] = tests

# ==============================================================================
# 1. DAGGER — Easy (1–12, 2 XP)
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
}
def s1_p1(inp):
    a, b = map(int, inp.split())
    return str(a + b)
def s2_p1(inp):
    toks = [int(x) for x in inp.split()]
    return str(sum(toks))
t_p1 = [
    {"input": "3 5", "expectedOutput": "8", "explanation": "3 + 5 = 8", "isHidden": False},
    {"input": "-10 4", "expectedOutput": "-6", "explanation": "-10 + 4 = -6", "isHidden": False},
    {"input": "0 0", "expectedOutput": "0", "isHidden": True},
    {"input": "-50 -20", "expectedOutput": "-70", "isHidden": True},
    {"input": "1000 1000", "expectedOutput": "2000", "isHidden": True},
    {"input": "-1000 1000", "expectedOutput": "0", "isHidden": True},
    {"input": "42 -42", "expectedOutput": "0", "isHidden": True},
    {"input": "999 -1", "expectedOutput": "998", "isHidden": True},
]
register(p1, s1_p1, s2_p1, t_p1)

# 2. Even or Odd
p2 = {
    "id": "even-or-odd",
    "tier": "dagger",
    "title": "Even or Odd",
    "difficulty": "Easy",
    "xp": 2,
    "weapon": "dagger",
    "story": "The seer divides the clan into two scouting parties based on numbers.",
    "task": "Given an integer N, print 'EVEN' if N is even, otherwise print 'ODD'.",
    "inputFormat": "A single integer N.",
    "outputFormat": "Print EVEN or ODD.",
    "constraints": ["-1000 <= N <= 1000"],
    "timeLimitMs": 2000,
}
def s1_p2(inp):
    n = int(inp.strip())
    return "EVEN" if n % 2 == 0 else "ODD"
def s2_p2(inp):
    n = int(inp.strip())
    return "ODD" if (n & 1) else "EVEN"
t_p2 = [
    {"input": "4", "expectedOutput": "EVEN", "explanation": "4 is divisible by 2.", "isHidden": False},
    {"input": "7", "expectedOutput": "ODD", "explanation": "7 is not divisible by 2.", "isHidden": False},
    {"input": "0", "expectedOutput": "EVEN", "isHidden": True},
    {"input": "-2", "expectedOutput": "EVEN", "isHidden": True},
    {"input": "-5", "expectedOutput": "ODD", "isHidden": True},
    {"input": "1000", "expectedOutput": "EVEN", "isHidden": True},
    {"input": "-999", "expectedOutput": "ODD", "isHidden": True},
    {"input": "1", "expectedOutput": "ODD", "isHidden": True},
]
register(p2, s1_p2, s2_p2, t_p2)

# 3. Largest of Three
p3 = {
    "id": "largest-of-three",
    "tier": "dagger",
    "title": "Largest of Three",
    "difficulty": "Easy",
    "xp": 2,
    "weapon": "dagger",
    "story": "Three chieftains bring their trophies; only the largest claims the high seat.",
    "task": "Given three integers A, B, and C, find and print the largest number.",
    "inputFormat": "A single line containing three space-separated integers A, B, and C.",
    "outputFormat": "Print the largest number among A, B, and C.",
    "constraints": ["-1000 <= A, B, C <= 1000"],
    "timeLimitMs": 2000,
}
def s1_p3(inp):
    a, b, c = map(int, inp.split())
    return str(max(a, b, c))
def s2_p3(inp):
    nums = [int(x) for x in inp.split()]
    nums.sort()
    return str(nums[-1])
t_p3 = [
    {"input": "10 45 23", "expectedOutput": "45", "explanation": "45 is greater than 10 and 23.", "isHidden": False},
    {"input": "-5 -15 -2", "expectedOutput": "-2", "explanation": "-2 is greater than -5 and -15.", "isHidden": False},
    {"input": "7 7 7", "expectedOutput": "7", "isHidden": True},
    {"input": "0 0 10", "expectedOutput": "10", "isHidden": True},
    {"input": "-100 0 100", "expectedOutput": "100", "isHidden": True},
    {"input": "50 50 10", "expectedOutput": "50", "isHidden": True},
    {"input": "-1 -2 -3", "expectedOutput": "-1", "isHidden": True},
    {"input": "1000 -1000 500", "expectedOutput": "1000", "isHidden": True},
]
register(p3, s1_p3, s2_p3, t_p3)

# 4. Count Vowels
p4 = {
    "id": "count-vowels",
    "tier": "dagger",
    "title": "Count Vowels",
    "difficulty": "Easy",
    "xp": 2,
    "weapon": "dagger",
    "story": "A runic scribe counts the sacred breath marks (vowels) in an ancient chant.",
    "task": "Given a lowercase string S, count the vowels (a, e, i, o, u) in it.",
    "inputFormat": "A single line containing a lowercase string S.",
    "outputFormat": "Print the number of vowels in S.",
    "constraints": ["1 <= length of S <= 100", "S contains only lowercase English letters."],
    "timeLimitMs": 2000,
}
def s1_p4(inp):
    s = inp.strip()
    return str(sum(1 for ch in s if ch in 'aeiou'))
def s2_p4(inp):
    s = inp.strip()
    c = 0
    for ch in s:
        if ch == 'a' or ch == 'e' or ch == 'i' or ch == 'o' or ch == 'u':
            c += 1
    return str(c)
t_p4 = [
    {"input": "viking", "expectedOutput": "2", "explanation": "'i' and 'i' are vowels.", "isHidden": False},
    {"input": "dragon", "expectedOutput": "2", "explanation": "'a' and 'o' are vowels.", "isHidden": False},
    {"input": "rhythm", "expectedOutput": "0", "isHidden": True},
    {"input": "aeiou", "expectedOutput": "5", "isHidden": True},
    {"input": "a", "expectedOutput": "1", "isHidden": True},
    {"input": "bcdfg", "expectedOutput": "0", "isHidden": True},
    {"input": "berkwarriorclan", "expectedOutput": "5", "isHidden": True},
    {"input": "queueing", "expectedOutput": "5", "isHidden": True},
]
register(p4, s1_p4, s2_p4, t_p4)

# 5. Reverse a String
p5 = {
    "id": "reverse-a-string",
    "tier": "dagger",
    "title": "Reverse a String",
    "difficulty": "Easy",
    "xp": 2,
    "weapon": "dagger",
    "story": "To decipher the dragon scroll, the text must be mirrored backwards.",
    "task": "Given a string S, print the string in reverse order.",
    "inputFormat": "A single line containing string S.",
    "outputFormat": "Print the reversed string.",
    "constraints": ["1 <= length of S <= 100"],
    "timeLimitMs": 2000,
}
def s1_p5(inp):
    s = inp.strip()
    return s[::-1]
def s2_p5(inp):
    s = inp.strip()
    return "".join(reversed(list(s)))
t_p5 = [
    {"input": "shield", "expectedOutput": "dleihs", "explanation": "'shield' reversed is 'dleihs'.", "isHidden": False},
    {"input": "axe", "expectedOutput": "exa", "explanation": "'axe' reversed is 'exa'.", "isHidden": False},
    {"input": "a", "expectedOutput": "a", "isHidden": True},
    {"input": "racecar", "expectedOutput": "racecar", "isHidden": True},
    {"input": "12345", "expectedOutput": "54321", "isHidden": True},
    {"input": "RedDeath", "expectedOutput": "htaeDdeR", "isHidden": True},
    {"input": "ab", "expectedOutput": "ba", "isHidden": True},
    {"input": "nightfury", "expectedOutput": "yrufthgin", "isHidden": True},
]
register(p5, s1_p5, s2_p5, t_p5)

# 6. Sum of Digits
p6 = {
    "id": "sum-of-digits",
    "tier": "dagger",
    "title": "Sum of Digits",
    "difficulty": "Easy",
    "xp": 2,
    "weapon": "dagger",
    "story": "Count the tally notches carved along the handle of a hunting spear.",
    "task": "Given a non-negative integer N, calculate and print the sum of its digits.",
    "inputFormat": "A single non-negative integer N.",
    "outputFormat": "Print the sum of the digits of N.",
    "constraints": ["0 <= N <= 10^9"],
    "timeLimitMs": 2000,
}
def s1_p6(inp):
    s = inp.strip()
    return str(sum(int(ch) for ch in s))
def s2_p6(inp):
    n = int(inp.strip())
    if n == 0:
        return "0"
    total = 0
    while n > 0:
        total += n % 10
        n //= 10
    return str(total)
t_p6 = [
    {"input": "1234", "expectedOutput": "10", "explanation": "1 + 2 + 3 + 4 = 10", "isHidden": False},
    {"input": "905", "expectedOutput": "14", "explanation": "9 + 0 + 5 = 14", "isHidden": False},
    {"input": "0", "expectedOutput": "0", "isHidden": True},
    {"input": "7", "expectedOutput": "7", "isHidden": True},
    {"input": "99999", "expectedOutput": "45", "isHidden": True},
    {"input": "1000000", "expectedOutput": "1", "isHidden": True},
    {"input": "555", "expectedOutput": "15", "isHidden": True},
    {"input": "123456789", "expectedOutput": "45", "isHidden": True},
]
register(p6, s1_p6, s2_p6, t_p6)

# 7. Leap Year
p7 = {
    "id": "leap-year",
    "tier": "dagger",
    "title": "Leap Year",
    "difficulty": "Easy",
    "xp": 2,
    "weapon": "dagger",
    "story": "The elder determines if an extra solstice day must be celebrated this winter.",
    "task": "Given a year Y, print 'YES' if it is a leap year, otherwise print 'NO'. A year is a leap year if it is divisible by 4, except end-of-century years which must be divisible by 400.",
    "inputFormat": "A single integer Y.",
    "outputFormat": "Print YES or NO.",
    "constraints": ["1 <= Y <= 9999"],
    "timeLimitMs": 2000,
}
def s1_p7(inp):
    y = int(inp.strip())
    is_leap = (y % 4 == 0 and y % 100 != 0) or (y % 400 == 0)
    return "YES" if is_leap else "NO"
def s2_p7(inp):
    y = int(inp.strip())
    if y % 400 == 0:
        return "YES"
    if y % 100 == 0:
        return "NO"
    if y % 4 == 0:
        return "YES"
    return "NO"
t_p7 = [
    {"input": "2024", "expectedOutput": "YES", "explanation": "2024 is divisible by 4 and not by 100.", "isHidden": False},
    {"input": "1900", "expectedOutput": "NO", "explanation": "1900 is divisible by 100 but not by 400.", "isHidden": False},
    {"input": "2000", "expectedOutput": "YES", "isHidden": True},
    {"input": "2023", "expectedOutput": "NO", "isHidden": True},
    {"input": "1600", "expectedOutput": "YES", "isHidden": True},
    {"input": "1700", "expectedOutput": "NO", "isHidden": True},
    {"input": "4", "expectedOutput": "YES", "isHidden": True},
    {"input": "2028", "expectedOutput": "YES", "isHidden": True},
]
register(p7, s1_p7, s2_p7, t_p7)

# 8. Sum of an Array
p8 = {
    "id": "sum-of-an-array",
    "tier": "dagger",
    "title": "Sum of an Array",
    "difficulty": "Easy",
    "xp": 2,
    "weapon": "dagger",
    "story": "Gather the weight of all fish caught during the Great Hunt.",
    "task": "Given an array of N integers, calculate and print their sum.",
    "inputFormat": "The first line contains integer N. The second line contains N space-separated integers.",
    "outputFormat": "Print the sum of the array elements.",
    "constraints": ["1 <= N <= 100", "-1000 <= each element <= 1000"],
    "timeLimitMs": 2000,
}
def s1_p8(inp):
    toks = [int(x) for x in inp.split()]
    n = toks[0]
    arr = toks[1:1+n]
    return str(sum(arr))
def s2_p8(inp):
    lines = inp.strip().splitlines()
    toks = [int(x) for line in lines for x in line.split()]
    n = toks[0]
    total = 0
    for v in toks[1:1+n]:
        total += v
    return str(total)
t_p8 = [
    {"input": "4\n1 2 3 4", "expectedOutput": "10", "explanation": "1 + 2 + 3 + 4 = 10", "isHidden": False},
    {"input": "3\n10 -5 2", "expectedOutput": "7", "explanation": "10 + (-5) + 2 = 7", "isHidden": False},
    {"input": "1\n50", "expectedOutput": "50", "isHidden": True},
    {"input": "5\n0 0 0 0 0", "expectedOutput": "0", "isHidden": True},
    {"input": "5\n-1 -2 -3 -4 -5", "expectedOutput": "-15", "isHidden": True},
    {"input": "6\n100 -50 25 -25 10 -10", "expectedOutput": "50", "isHidden": True},
    {"input": "2\n1000 -1000", "expectedOutput": "0", "isHidden": True},
    {"input": "4\n5 5 5 5", "expectedOutput": "20", "isHidden": True},
]
register(p8, s1_p8, s2_p8, t_p8)

# 9. Print a Number Pattern
p9 = {
    "id": "print-a-number-pattern",
    "tier": "dagger",
    "title": "Print a Number Pattern",
    "difficulty": "Easy",
    "xp": 2,
    "weapon": "dagger",
    "story": "Carve the sacred stepped pyramid pattern on the Great Hall wall.",
    "task": "Given an integer N, print a pattern where the i-th row (from 1 to N) contains the digit i, repeated i times.",
    "inputFormat": "A single integer N.",
    "outputFormat": "Print N lines representing the pattern.",
    "constraints": ["1 <= N <= 9"],
    "timeLimitMs": 2000,
}
def s1_p9(inp):
    n = int(inp.strip())
    lines = [str(i) * i for i in range(1, n + 1)]
    return "\n".join(lines)
def s2_p9(inp):
    n = int(inp.strip())
    out = []
    for i in range(1, n + 1):
        row = ""
        for _ in range(i):
            row += str(i)
        out.append(row)
    return "\n".join(out)
t_p9 = [
    {"input": "3", "expectedOutput": "1\n22\n333", "explanation": "Row 1: 1 once, Row 2: 2 twice, Row 3: 3 three times.", "isHidden": False},
    {"input": "5", "expectedOutput": "1\n22\n333\n4444\n55555", "explanation": "Pattern for N = 5.", "isHidden": False},
    {"input": "1", "expectedOutput": "1", "isHidden": True},
    {"input": "2", "expectedOutput": "1\n22", "isHidden": True},
    {"input": "4", "expectedOutput": "1\n22\n333\n4444", "isHidden": True},
    {"input": "6", "expectedOutput": "1\n22\n333\n4444\n55555\n666666", "isHidden": True},
    {"input": "7", "expectedOutput": "1\n22\n333\n4444\n55555\n666666\n7777777", "isHidden": True},
    {"input": "9", "expectedOutput": "1\n22\n333\n4444\n55555\n666666\n7777777\n88888888\n999999999", "isHidden": True},
]
register(p9, s1_p9, s2_p9, t_p9)

# 10. Find the Smallest Number
p10 = {
    "id": "find-the-smallest-number",
    "tier": "dagger",
    "title": "Find the Smallest Number",
    "difficulty": "Easy",
    "xp": 2,
    "weapon": "dagger",
    "story": "Find the lightest arrow in the quiver for long-distance signals.",
    "task": "Given an array of N integers, find and print the smallest element.",
    "inputFormat": "The first line contains integer N. The second line contains N space-separated integers.",
    "outputFormat": "Print the smallest element in the array.",
    "constraints": ["1 <= N <= 100", "-1000 <= each element <= 1000"],
    "timeLimitMs": 2000,
}
def s1_p10(inp):
    toks = [int(x) for x in inp.split()]
    arr = toks[1:1+toks[0]]
    return str(min(arr))
def s2_p10(inp):
    toks = [int(x) for x in inp.split()]
    arr = toks[1:1+toks[0]]
    arr.sort()
    return str(arr[0])
t_p10 = [
    {"input": "5\n4 2 9 1 7", "expectedOutput": "1", "explanation": "1 is the smallest number.", "isHidden": False},
    {"input": "3\n-5 -2 -10", "expectedOutput": "-10", "explanation": "-10 is the smallest.", "isHidden": False},
    {"input": "1\n42", "expectedOutput": "42", "isHidden": True},
    {"input": "4\n0 0 0 0", "expectedOutput": "0", "isHidden": True},
    {"input": "6\n10 20 5 -1 0 100", "expectedOutput": "-1", "isHidden": True},
    {"input": "2\n1000 -1000", "expectedOutput": "-1000", "isHidden": True},
    {"input": "5\n5 4 3 2 1", "expectedOutput": "1", "isHidden": True},
    {"input": "5\n1 2 3 4 5", "expectedOutput": "1", "isHidden": True},
]
register(p10, s1_p10, s2_p10, t_p10)

# 11. Count Digits
p11 = {
    "id": "count-digits",
    "tier": "dagger",
    "title": "Count Digits",
    "difficulty": "Easy",
    "xp": 2,
    "weapon": "dagger",
    "story": "Count how many digits make up the royal dragon seal code.",
    "task": "Given a non-negative integer N, count and print the number of digits in it.",
    "inputFormat": "A single non-negative integer N.",
    "outputFormat": "Print the count of digits in N.",
    "constraints": ["0 <= N <= 10^9"],
    "timeLimitMs": 2000,
}
def s1_p11(inp):
    s = inp.strip()
    return str(len(s))
def s2_p11(inp):
    n = int(inp.strip())
    if n == 0:
        return "1"
    cnt = 0
    while n > 0:
        cnt += 1
        n //= 10
    return str(cnt)
t_p11 = [
    {"input": "42", "expectedOutput": "2", "explanation": "42 has 2 digits.", "isHidden": False},
    {"input": "1000", "expectedOutput": "4", "explanation": "1000 has 4 digits.", "isHidden": False},
    {"input": "0", "expectedOutput": "1", "isHidden": True},
    {"input": "7", "expectedOutput": "1", "isHidden": True},
    {"input": "999999", "expectedOutput": "6", "isHidden": True},
    {"input": "1234567890", "expectedOutput": "10", "isHidden": True},
    {"input": "10", "expectedOutput": "2", "isHidden": True},
    {"input": "505", "expectedOutput": "3", "isHidden": True},
]
register(p11, s1_p11, s2_p11, t_p11)

# 12. Multiplication Table
p12 = {
    "id": "multiplication-table",
    "tier": "dagger",
    "title": "Multiplication Table",
    "difficulty": "Easy",
    "xp": 2,
    "weapon": "dagger",
    "story": "The Viking quartermaster tabulates supply rations for 1 to 10 boat crews.",
    "task": "Given an integer N, print its multiplication table from 1 to 10 as 10 space-separated integers on a single line (N*1 N*2 ... N*10).",
    "inputFormat": "A single integer N.",
    "outputFormat": "Print the 10 products space-separated on one line.",
    "constraints": ["1 <= N <= 100"],
    "timeLimitMs": 2000,
}
def s1_p12(inp):
    n = int(inp.strip())
    return " ".join(str(n * i) for i in range(1, 11))
def s2_p12(inp):
    n = int(inp.strip())
    res = []
    cur = 0
    for _ in range(10):
        cur += n
        res.append(str(cur))
    return " ".join(res)
t_p12 = [
    {"input": "5", "expectedOutput": "5 10 15 20 25 30 35 40 45 50", "explanation": "Multiples of 5 from 1 to 10.", "isHidden": False},
    {"input": "2", "expectedOutput": "2 4 6 8 10 12 14 16 18 20", "explanation": "Multiples of 2 from 1 to 10.", "isHidden": False},
    {"input": "1", "expectedOutput": "1 2 3 4 5 6 7 8 9 10", "isHidden": True},
    {"input": "10", "expectedOutput": "10 20 30 40 50 60 70 80 90 100", "isHidden": True},
    {"input": "7", "expectedOutput": "7 14 21 28 35 42 49 56 63 70", "isHidden": True},
    {"input": "12", "expectedOutput": "12 24 36 48 60 72 84 96 108 120", "isHidden": True},
    {"input": "25", "expectedOutput": "25 50 75 100 125 150 175 200 225 250", "isHidden": True},
    {"input": "100", "expectedOutput": "100 200 300 400 500 600 700 800 900 1000", "isHidden": True},
]
register(p12, s1_p12, s2_p12, t_p12)

# ==============================================================================
# 2. AXE — Medium (13–24, 5 XP)
# ==============================================================================

# 13. Palindrome String
p13 = {
    "id": "palindrome-string",
    "tier": "axe",
    "title": "Palindrome String",
    "difficulty": "Medium",
    "xp": 5,
    "weapon": "axe",
    "story": "Symmetrical runes carved on a battle axe grant magical balance.",
    "task": "Given a lowercase string S, print 'YES' if it reads the same forwards and backwards, otherwise print 'NO'.",
    "inputFormat": "A single lowercase string S.",
    "outputFormat": "Print YES or NO.",
    "constraints": ["1 <= length of S <= 100"],
    "timeLimitMs": 2000,
}
def s1_p13(inp):
    s = inp.strip()
    return "YES" if s == s[::-1] else "NO"
def s2_p13(inp):
    s = inp.strip()
    i, j = 0, len(s) - 1
    while i < j:
        if s[i] != s[j]:
            return "NO"
        i += 1
        j -= 1
    return "YES"
t_p13 = [
    {"input": "racecar", "expectedOutput": "YES", "explanation": "'racecar' reads the same forwards and backwards.", "isHidden": False},
    {"input": "dragon", "expectedOutput": "NO", "explanation": "'dragon' backwards is 'nogard'.", "isHidden": False},
    {"input": "a", "expectedOutput": "YES", "isHidden": True},
    {"input": "aa", "expectedOutput": "YES", "isHidden": True},
    {"input": "ab", "expectedOutput": "NO", "isHidden": True},
    {"input": "level", "expectedOutput": "YES", "isHidden": True},
    {"input": "noon", "expectedOutput": "YES", "isHidden": True},
    {"input": "vikingwarrior", "expectedOutput": "NO", "isHidden": True},
]
register(p13, s1_p13, s2_p13, t_p13)

# 14. Prime Check
p14 = {
    "id": "prime-check",
    "tier": "axe",
    "title": "Prime Check",
    "difficulty": "Medium",
    "xp": 5,
    "weapon": "axe",
    "story": "Only weapons tempered with a prime number of strikes withstand dragon fire.",
    "task": "Given an integer N, print 'YES' if it is prime, otherwise print 'NO'. A prime number is greater than 1 and has no positive divisors other than 1 and itself.",
    "inputFormat": "A single integer N.",
    "outputFormat": "Print YES or NO.",
    "constraints": ["1 <= N <= 10000"],
    "timeLimitMs": 2000,
}
def s1_p14(inp):
    n = int(inp.strip())
    if n <= 1:
        return "NO"
    for i in range(2, int(math.isqrt(n)) + 1):
        if n % i == 0:
            return "NO"
    return "YES"
def s2_p14(inp):
    n = int(inp.strip())
    if n < 2:
        return "NO"
    if n in (2, 3):
        return "YES"
    if n % 2 == 0 or n % 3 == 0:
        return "NO"
    i = 5
    while i * i <= n:
        if n % i == 0 or n % (i + 2) == 0:
            return "NO"
        i += 6
    return "YES"
t_p14 = [
    {"input": "7", "expectedOutput": "YES", "explanation": "7 is only divisible by 1 and 7.", "isHidden": False},
    {"input": "12", "expectedOutput": "NO", "explanation": "12 is divisible by 2, 3, 4, 6.", "isHidden": False},
    {"input": "1", "expectedOutput": "NO", "isHidden": True},
    {"input": "2", "expectedOutput": "YES", "isHidden": True},
    {"input": "97", "expectedOutput": "YES", "isHidden": True},
    {"input": "100", "expectedOutput": "NO", "isHidden": True},
    {"input": "541", "expectedOutput": "YES", "isHidden": True},
    {"input": "9999", "expectedOutput": "NO", "isHidden": True},
]
register(p14, s1_p14, s2_p14, t_p14)

# 15. Second Largest Number
p15 = {
    "id": "second-largest-number",
    "tier": "axe",
    "title": "Second Largest Number",
    "difficulty": "Medium",
    "xp": 5,
    "weapon": "axe",
    "story": "The second strongest warrior takes command of the flank vanguard.",
    "task": "Given an array of N distinct integers, find and print the second largest number.",
    "inputFormat": "The first line contains integer N. The second line contains N space-separated distinct integers.",
    "outputFormat": "Print the second largest number.",
    "constraints": ["2 <= N <= 100", "-1000 <= each element <= 1000", "All elements are distinct."],
    "timeLimitMs": 2000,
}
def s1_p15(inp):
    toks = [int(x) for x in inp.split()]
    arr = toks[1:1+toks[0]]
    arr.sort()
    return str(arr[-2])
def s2_p15(inp):
    toks = [int(x) for x in inp.split()]
    arr = toks[1:1+toks[0]]
    first = second = -float('inf')
    for x in arr:
        if x > first:
            second = first
            first = x
        elif x > second:
            second = x
    return str(second)
t_p15 = [
    {"input": "5\n10 20 4 45 99", "expectedOutput": "45", "explanation": "Sorted: [4, 10, 20, 45, 99]. Second largest is 45.", "isHidden": False},
    {"input": "3\n-1 -5 -3", "expectedOutput": "-3", "explanation": "Sorted: [-5, -3, -1]. Second largest is -3.", "isHidden": False},
    {"input": "2\n10 20", "expectedOutput": "10", "isHidden": True},
    {"input": "2\n50 1", "expectedOutput": "1", "isHidden": True},
    {"input": "4\n100 0 -100 50", "expectedOutput": "50", "isHidden": True},
    {"input": "6\n5 8 1 9 3 7", "expectedOutput": "8", "isHidden": True},
    {"input": "5\n-10 -20 -30 -40 -50", "expectedOutput": "-20", "isHidden": True},
    {"input": "5\n1000 500 250 125 60", "expectedOutput": "500", "isHidden": True},
]
register(p15, s1_p15, s2_p15, t_p15)

# 16. Most Frequent Character
p16 = {
    "id": "most-frequent-character",
    "tier": "axe",
    "title": "Most Frequent Character",
    "difficulty": "Medium",
    "xp": 5,
    "weapon": "axe",
    "story": "Discover the most repeated war horn battle signal.",
    "task": "Given a lowercase string S, find the character that appears most frequently. If multiple characters have the same highest frequency, choose the alphabetically smallest one.",
    "inputFormat": "A single lowercase string S.",
    "outputFormat": "Print the most frequent character.",
    "constraints": ["1 <= length of S <= 100"],
    "timeLimitMs": 2000,
}
def s1_p16(inp):
    s = inp.strip()
    counts = Counter(s)
    max_c = max(counts.values())
    candidates = [ch for ch, c in counts.items() if c == max_c]
    candidates.sort()
    return candidates[0]
def s2_p16(inp):
    s = inp.strip()
    freq = [0] * 26
    for ch in s:
        freq[ord(ch) - ord('a')] += 1
    best_c = max(freq)
    for i in range(26):
        if freq[i] == best_c:
            return chr(ord('a') + i)
    return 'a'
t_p16 = [
    {"input": "battle", "expectedOutput": "t", "explanation": "'t' appears 2 times, more than any other.", "isHidden": False},
    {"input": "dragon", "expectedOutput": "a", "explanation": "All letters appear once; 'a' is alphabetically first.", "isHidden": False},
    {"input": "z", "expectedOutput": "z", "isHidden": True},
    {"input": "aabbcc", "expectedOutput": "a", "isHidden": True},
    {"input": "mississippi", "expectedOutput": "i", "explanation": "'i' and 's' both appear 4 times; 'i' < 's'.", "isHidden": True},
    {"input": "vikings", "expectedOutput": "i", "explanation": "'i' appears twice.", "isHidden": True},
    {"input": "zzzaaa", "expectedOutput": "a", "isHidden": True},
    {"input": "cba", "expectedOutput": "a", "isHidden": True},
]
register(p16, s1_p16, s2_p16, t_p16)

# 17. Two Sum
p17 = {
    "id": "two-sum",
    "tier": "axe",
    "title": "Two Sum",
    "difficulty": "Medium",
    "xp": 5,
    "weapon": "axe",
    "story": "Pair two warrior shields whose combined crest weights hit the target balance.",
    "task": "Given an array of N integers and a target T, find the 1-based indices of two elements whose sum equals T. If multiple pairs exist, choose the pair with the smallest first index, then the smallest second index. Guaranteed to have an answer.",
    "inputFormat": "The first line contains N and T. The second line contains N space-separated integers.",
    "outputFormat": "Print the two 1-based indices separated by a space.",
    "constraints": ["2 <= N <= 100", "-1000 <= each element, T <= 1000"],
    "timeLimitMs": 2000,
}
def s1_p17(inp):
    toks = [int(x) for x in inp.split()]
    n, t = toks[0], toks[1]
    arr = toks[2:2+n]
    for i in range(n):
        for j in range(i + 1, n):
            if arr[i] + arr[j] == t:
                return f"{i + 1} {j + 1}"
    return "0 0"
def s2_p17(inp):
    toks = [int(x) for x in inp.split()]
    n, t = toks[0], toks[1]
    arr = toks[2:2+n]
    seen = {}
    best = None
    for j in range(n):
        comp = t - arr[j]
        if comp in seen:
            i = seen[comp]
            pair = (i + 1, j + 1)
            if best is None or pair < best:
                best = pair
        if arr[j] not in seen:
            seen[arr[j]] = j
    # fallback to brute force for earliest pair if hash map didn't capture all
    for i in range(n):
        for j in range(i + 1, n):
            if arr[i] + arr[j] == t:
                return f"{i + 1} {j + 1}"
    return f"{best[0]} {best[1]}"
t_p17 = [
    {"input": "4 9\n2 7 11 15", "expectedOutput": "1 2", "explanation": "arr[1] + arr[2] = 2 + 7 = 9.", "isHidden": False},
    {"input": "3 6\n3 2 4", "expectedOutput": "2 3", "explanation": "arr[2] + arr[3] = 2 + 4 = 6.", "isHidden": False},
    {"input": "2 10\n5 5", "expectedOutput": "1 2", "isHidden": True},
    {"input": "4 0\n-5 2 5 -2", "expectedOutput": "1 3", "isHidden": True},
    {"input": "5 100\n10 20 30 80 90", "expectedOutput": "1 5", "explanation": "10 + 90 = 100 (earliest first index).", "isHidden": True},
    {"input": "4 -8\n-2 -3 -5 -6", "expectedOutput": "1 4", "explanation": "-2 + -6 = -8.", "isHidden": True},
    {"input": "3 0\n0 4 0", "expectedOutput": "1 3", "isHidden": True},
    {"input": "6 7\n1 2 3 4 5 6", "expectedOutput": "1 6", "isHidden": True},
]
register(p17, s1_p17, s2_p17, t_p17)

# 18. Valid Anagram
p18 = {
    "id": "valid-anagram",
    "tier": "axe",
    "title": "Valid Anagram",
    "difficulty": "Medium",
    "xp": 5,
    "weapon": "axe",
    "story": "Check if two war banners rearrange the exact same set of runic letters.",
    "task": "Given two lowercase strings S and T, print 'YES' if they contain the exact same characters with the same frequencies, otherwise print 'NO'.",
    "inputFormat": "Two space-separated or line-separated lowercase strings S and T.",
    "outputFormat": "Print YES or NO.",
    "constraints": ["1 <= length of S, T <= 100"],
    "timeLimitMs": 2000,
}
def s1_p18(inp):
    toks = inp.split()
    s, t = toks[0], toks[1]
    return "YES" if sorted(s) == sorted(t) else "NO"
def s2_p18(inp):
    toks = inp.split()
    s, t = toks[0], toks[1]
    return "YES" if Counter(s) == Counter(t) else "NO"
t_p18 = [
    {"input": "anagram nagaram", "expectedOutput": "YES", "explanation": "Both contain three 'a's, one 'g', 'm', 'n', 'r'.", "isHidden": False},
    {"input": "rat car", "expectedOutput": "NO", "explanation": "'rat' and 'car' have different letters.", "isHidden": False},
    {"input": "a a", "expectedOutput": "YES", "isHidden": True},
    {"input": "ab ba", "expectedOutput": "YES", "isHidden": True},
    {"input": "ab a", "expectedOutput": "NO", "isHidden": True},
    {"input": "listen silent", "expectedOutput": "YES", "isHidden": True},
    {"input": "dragon lizard", "expectedOutput": "NO", "isHidden": True},
    {"input": "aabbcc abcabc", "expectedOutput": "YES", "isHidden": True},
]
register(p18, s1_p18, s2_p18, t_p18)

# 19. Remove Duplicates
p19 = {
    "id": "remove-duplicates",
    "tier": "axe",
    "title": "Remove Duplicates",
    "difficulty": "Medium",
    "xp": 5,
    "weapon": "axe",
    "story": "Purge duplicate supplies from the longship manifest while keeping order.",
    "task": "Given an array of N integers, remove duplicate elements while preserving the order of their first occurrences. Print the resulting elements space-separated on one line.",
    "inputFormat": "The first line contains integer N. The second line contains N space-separated integers.",
    "outputFormat": "Print the unique elements space-separated on a single line.",
    "constraints": ["1 <= N <= 100", "-1000 <= each element <= 1000"],
    "timeLimitMs": 2000,
}
def s1_p19(inp):
    toks = [int(x) for x in inp.split()]
    arr = toks[1:1+toks[0]]
    seen = set()
    res = []
    for x in arr:
        if x not in seen:
            seen.add(x)
            res.append(str(x))
    return " ".join(res)
def s2_p19(inp):
    toks = [int(x) for x in inp.split()]
    arr = toks[1:1+toks[0]]
    res = []
    for x in arr:
        if x not in res:
            res.append(x)
    return " ".join(str(x) for x in res)
t_p19 = [
    {"input": "6\n1 2 2 3 4 4", "expectedOutput": "1 2 3 4", "explanation": "Duplicates of 2 and 4 removed.", "isHidden": False},
    {"input": "5\n5 5 5 5 5", "expectedOutput": "5", "explanation": "All duplicate 5s collapsed to one.", "isHidden": False},
    {"input": "1\n10", "expectedOutput": "10", "isHidden": True},
    {"input": "4\n1 2 3 4", "expectedOutput": "1 2 3 4", "isHidden": True},
    {"input": "7\n4 5 4 6 5 7 4", "expectedOutput": "4 5 6 7", "isHidden": True},
    {"input": "5\n-1 -2 -1 -3 -2", "expectedOutput": "-1 -2 -3", "isHidden": True},
    {"input": "6\n0 0 1 0 2 0", "expectedOutput": "0 1 2", "isHidden": True},
    {"input": "3\n10 -10 10", "expectedOutput": "10 -10", "isHidden": True},
]
register(p19, s1_p19, s2_p19, t_p19)

# 20. GCD and LCM
p20 = {
    "id": "gcd-and-lcm",
    "tier": "axe",
    "title": "GCD and LCM",
    "difficulty": "Medium",
    "xp": 5,
    "weapon": "axe",
    "story": "Synchronize the firing rates and shared gear ratios of the coastal catapults.",
    "task": "Given two positive integers A and B, calculate and print their greatest common divisor (GCD) and least common multiple (LCM) space-separated on one line.",
    "inputFormat": "A single line containing two space-separated integers A and B.",
    "outputFormat": "Print GCD and LCM separated by a space.",
    "constraints": ["1 <= A, B <= 10000"],
    "timeLimitMs": 2000,
}
def s1_p20(inp):
    a, b = map(int, inp.split())
    g = math.gcd(a, b)
    l = (a * b) // g
    return f"{g} {l}"
def s2_p20(inp):
    a, b = map(int, inp.split())
    x, y = a, b
    while y:
        x, y = y, x % y
    g = x
    l = (a // g) * b
    return f"{g} {l}"
t_p20 = [
    {"input": "12 18", "expectedOutput": "6 36", "explanation": "GCD(12, 18) = 6, LCM(12, 18) = 36.", "isHidden": False},
    {"input": "5 7", "expectedOutput": "1 35", "explanation": "Coprime numbers: GCD = 1, LCM = 35.", "isHidden": False},
    {"input": "1 1", "expectedOutput": "1 1", "isHidden": True},
    {"input": "10 10", "expectedOutput": "10 10", "isHidden": True},
    {"input": "20 4", "expectedOutput": "4 20", "isHidden": True},
    {"input": "100 25", "expectedOutput": "25 100", "isHidden": True},
    {"input": "17 19", "expectedOutput": "1 323", "isHidden": True},
    {"input": "54 24", "expectedOutput": "6 216", "isHidden": True},
]
register(p20, s1_p20, s2_p20, t_p20)

# 21. Missing Number
p21 = {
    "id": "missing-number",
    "tier": "axe",
    "title": "Missing Number",
    "difficulty": "Medium",
    "xp": 5,
    "weapon": "axe",
    "story": "A longship crew roll call from 1 to N is missing exactly one warrior.",
    "task": "Given an array containing N-1 distinct integers from 1 to N, find and print the missing number.",
    "inputFormat": "The first line contains integer N. The second line contains N-1 space-separated integers.",
    "outputFormat": "Print the missing integer.",
    "constraints": ["2 <= N <= 100"],
    "timeLimitMs": 2000,
}
def s1_p21(inp):
    toks = [int(x) for x in inp.split()]
    n = toks[0]
    arr = toks[1:n]
    expected = n * (n + 1) // 2
    return str(expected - sum(arr))
def s2_p21(inp):
    toks = [int(x) for x in inp.split()]
    n = toks[0]
    arr = set(toks[1:n])
    for i in range(1, n + 1):
        if i not in arr:
            return str(i)
    return str(n)
t_p21 = [
    {"input": "5\n1 2 4 5", "expectedOutput": "3", "explanation": "3 is missing from 1..5.", "isHidden": False},
    {"input": "4\n2 3 4", "expectedOutput": "1", "explanation": "1 is missing.", "isHidden": False},
    {"input": "2\n1", "expectedOutput": "2", "isHidden": True},
    {"input": "2\n2", "expectedOutput": "1", "isHidden": True},
    {"input": "6\n1 2 3 5 6", "expectedOutput": "4", "isHidden": True},
    {"input": "7\n7 6 5 4 3 2", "expectedOutput": "1", "isHidden": True},
    {"input": "7\n1 2 3 4 5 6", "expectedOutput": "7", "isHidden": True},
    {"input": "10\n1 2 3 4 5 6 7 9 10", "expectedOutput": "8", "isHidden": True},
]
register(p21, s1_p21, s2_p21, t_p21)

# 22. Move Zeros
p22 = {
    "id": "move-zeros",
    "tier": "axe",
    "title": "Move Zeros",
    "difficulty": "Medium",
    "xp": 5,
    "weapon": "axe",
    "story": "Consolidate depleted powder kegs (zeros) to the rear of the siege line.",
    "task": "Given an array of N integers, move all zeros to the end of the array while maintaining the relative order of the non-zero elements. Print the resulting array space-separated on one line.",
    "inputFormat": "The first line contains integer N. The second line contains N space-separated integers.",
    "outputFormat": "Print the elements space-separated on a single line.",
    "constraints": ["1 <= N <= 100", "-1000 <= each element <= 1000"],
    "timeLimitMs": 2000,
}
def s1_p22(inp):
    toks = [int(x) for x in inp.split()]
    arr = toks[1:1+toks[0]]
    non_zeros = [x for x in arr if x != 0]
    zeros = [0] * (len(arr) - len(non_zeros))
    return " ".join(str(x) for x in (non_zeros + zeros))
def s2_p22(inp):
    toks = [int(x) for x in inp.split()]
    arr = list(toks[1:1+toks[0]])
    pos = 0
    for i in range(len(arr)):
        if arr[i] != 0:
            arr[pos], arr[i] = arr[i], arr[pos]
            pos += 1
    return " ".join(str(x) for x in arr)
t_p22 = [
    {"input": "5\n0 1 0 3 12", "expectedOutput": "1 3 12 0 0", "explanation": "Non-zeros 1, 3, 12 kept in order, zeros shifted to end.", "isHidden": False},
    {"input": "3\n0 0 1", "expectedOutput": "1 0 0", "explanation": "1 moves to front, zeros to end.", "isHidden": False},
    {"input": "1\n0", "expectedOutput": "0", "isHidden": True},
    {"input": "1\n5", "expectedOutput": "5", "isHidden": True},
    {"input": "4\n1 2 3 4", "expectedOutput": "1 2 3 4", "isHidden": True},
    {"input": "4\n0 0 0 0", "expectedOutput": "0 0 0 0", "isHidden": True},
    {"input": "6\n-1 0 -2 0 -3 0", "expectedOutput": "-1 -2 -3 0 0 0", "isHidden": True},
    {"input": "5\n4 0 5 0 6", "expectedOutput": "4 5 6 0 0", "isHidden": True},
]
register(p22, s1_p22, s2_p22, t_p22)

# 23. Character Frequency
p23 = {
    "id": "character-frequency",
    "tier": "axe",
    "title": "Character Frequency",
    "difficulty": "Medium",
    "xp": 5,
    "weapon": "axe",
    "story": "Count how many times a target runic mark appears on an inscription.",
    "task": "Given a lowercase string S and a character C, count and print how many times C appears in S.",
    "inputFormat": "The first line contains string S. The second line contains a single character C (or space-separated on one line).",
    "outputFormat": "Print the integer count of occurrences of C in S.",
    "constraints": ["1 <= length of S <= 100", "C is a lowercase letter."],
    "timeLimitMs": 2000,
}
def s1_p23(inp):
    toks = inp.split()
    s, c = toks[0], toks[1]
    return str(s.count(c))
def s2_p23(inp):
    toks = inp.split()
    s, c = toks[0], toks[1]
    cnt = 0
    for ch in s:
        if ch == c:
            cnt += 1
    return str(cnt)
t_p23 = [
    {"input": "dragon d", "expectedOutput": "1", "explanation": "'d' appears once in 'dragon'.", "isHidden": False},
    {"input": "vikingwarrior i", "expectedOutput": "3", "explanation": "'i' appears 3 times.", "isHidden": False},
    {"input": "hello z", "expectedOutput": "0", "isHidden": True},
    {"input": "aaaaa a", "expectedOutput": "5", "isHidden": True},
    {"input": "b b", "expectedOutput": "1", "isHidden": True},
    {"input": "banana a", "expectedOutput": "3", "isHidden": True},
    {"input": "mississippi s", "expectedOutput": "4", "isHidden": True},
    {"input": "shield x", "expectedOutput": "0", "isHidden": True},
]
register(p23, s1_p23, s2_p23, t_p23)

# 24. Pair with Given Difference
p24 = {
    "id": "pair-with-given-difference",
    "tier": "axe",
    "title": "Pair with Given Difference",
    "difficulty": "Medium",
    "xp": 5,
    "weapon": "axe",
    "story": "Find if any two scout towers have an elevation difference of exactly K meters.",
    "task": "Given an array of N integers and an integer K, determine whether any two distinct elements (different indices) have an absolute difference equal to K (|arr[i] - arr[j]| == K with i != j). Print 'YES' or 'NO'.",
    "inputFormat": "The first line contains N and K. The second line contains N space-separated integers.",
    "outputFormat": "Print YES or NO.",
    "constraints": ["2 <= N <= 100", "0 <= K <= 1000", "-1000 <= each element <= 1000"],
    "timeLimitMs": 2000,
}
def s1_p24(inp):
    toks = [int(x) for x in inp.split()]
    n, k = toks[0], toks[1]
    arr = toks[2:2+n]
    for i in range(n):
        for j in range(i + 1, n):
            if abs(arr[i] - arr[j]) == k:
                return "YES"
    return "NO"
def s2_p24(inp):
    toks = [int(x) for x in inp.split()]
    n, k = toks[0], toks[1]
    arr = toks[2:2+n]
    counts = Counter(arr)
    if k == 0:
        return "YES" if any(c > 1 for c in counts.values()) else "NO"
    for x in counts:
        if x + k in counts:
            return "YES"
    return "NO"
t_p24 = [
    {"input": "5 45\n10 20 55 80 90", "expectedOutput": "YES", "explanation": "|10 - 55| = 45.", "isHidden": False},
    {"input": "4 10\n1 2 3 4", "expectedOutput": "NO", "explanation": "No two elements have difference 10.", "isHidden": False},
    {"input": "3 0\n5 2 5", "expectedOutput": "YES", "explanation": "|5 - 5| = 0.", "isHidden": True},
    {"input": "3 0\n1 2 3", "expectedOutput": "NO", "isHidden": True},
    {"input": "2 5\n-5 0", "expectedOutput": "YES", "isHidden": True},
    {"input": "5 7\n1 8 3 4 5", "expectedOutput": "YES", "isHidden": True},
    {"input": "4 100\n10 20 30 40", "expectedOutput": "NO", "isHidden": True},
    {"input": "2 20\n-10 10", "expectedOutput": "YES", "isHidden": True},
]
register(p24, s1_p24, s2_p24, t_p24)

# ==============================================================================
# 3. CATAPULT — Hard (25–36, 7 XP)
# ==============================================================================

# 25. Valid Parentheses
p25 = {
    "id": "valid-parentheses",
    "tier": "catapult",
    "title": "Valid Parentheses",
    "difficulty": "Hard",
    "xp": 7,
    "weapon": "catapult",
    "story": "Ensure all locking brackets on the siege engine mechanisms are correctly paired.",
    "task": "Given a string containing brackets '()', '[]', and '{}', determine whether all brackets are correctly matched and closed in the proper order. Print 'YES' if valid, otherwise print 'NO'.",
    "inputFormat": "A single string containing only characters '(', ')', '[', ']', '{', '}'.",
    "outputFormat": "Print YES or NO.",
    "constraints": ["1 <= length of string <= 100"],
    "timeLimitMs": 2000,
}
def s1_p25(inp):
    s = inp.strip()
    stack = []
    pairs = {')': '(', ']': '[', '}': '{'}
    for ch in s:
        if ch in '([{':
            stack.append(ch)
        elif ch in pairs:
            if not stack or stack[-1] != pairs[ch]:
                return "NO"
            stack.pop()
    return "YES" if not stack else "NO"
def s2_p25(inp):
    s = inp.strip()
    prev = None
    while prev != s:
        prev = s
        s = s.replace("()", "").replace("[]", "").replace("{}", "")
    return "YES" if len(s) == 0 else "NO"
t_p25 = [
    {"input": "()[]{}", "expectedOutput": "YES", "explanation": "All brackets matched.", "isHidden": False},
    {"input": "(]", "expectedOutput": "NO", "explanation": "Mismatched bracket types.", "isHidden": False},
    {"input": "([{}])", "expectedOutput": "YES", "isHidden": True},
    {"input": "([)]", "expectedOutput": "NO", "isHidden": True},
    {"input": "(", "expectedOutput": "NO", "isHidden": True},
    {"input": "}", "expectedOutput": "NO", "isHidden": True},
    {"input": "{[()()]}", "expectedOutput": "YES", "isHidden": True},
    {"input": "((()))", "expectedOutput": "YES", "isHidden": True},
]
register(p25, s1_p25, s2_p25, t_p25)

# 26. Binary Search
p26 = {
    "id": "binary-search",
    "tier": "catapult",
    "title": "Binary Search",
    "difficulty": "Hard",
    "xp": 7,
    "weapon": "catapult",
    "story": "Direct the ballista sights along a sorted range to acquire the dragon target.",
    "task": "Given a sorted array of N distinct integers and a target K, find and print the 1-based index of K. If K is absent, print -1.",
    "inputFormat": "The first line contains N and K. The second line contains N space-separated sorted distinct integers.",
    "outputFormat": "Print the 1-based index of K, or -1 if absent.",
    "constraints": ["1 <= N <= 100", "-1000 <= each element, K <= 1000", "Array is strictly sorted in ascending order."],
    "timeLimitMs": 2000,
}
def s1_p26(inp):
    toks = [int(x) for x in inp.split()]
    n, k = toks[0], toks[1]
    arr = toks[2:2+n]
    low, high = 0, n - 1
    while low <= high:
        mid = (low + high) // 2
        if arr[mid] == k:
            return str(mid + 1)
        elif arr[mid] < k:
            low = mid + 1
        else:
            high = mid - 1
    return "-1"
def s2_p26(inp):
    toks = [int(x) for x in inp.split()]
    n, k = toks[0], toks[1]
    arr = toks[2:2+n]
    for i, v in enumerate(arr):
        if v == k:
            return str(i + 1)
    return "-1"
t_p26 = [
    {"input": "6 7\n1 3 5 7 9 11", "expectedOutput": "4", "explanation": "7 is at 1-based index 4.", "isHidden": False},
    {"input": "5 4\n2 3 5 8 10", "expectedOutput": "-1", "explanation": "4 is not in the array.", "isHidden": False},
    {"input": "1 10\n10", "expectedOutput": "1", "isHidden": True},
    {"input": "1 5\n10", "expectedOutput": "-1", "isHidden": True},
    {"input": "4 -2\n-10 -5 -2 0", "expectedOutput": "3", "isHidden": True},
    {"input": "5 100\n10 20 30 40 50", "expectedOutput": "-1", "isHidden": True},
    {"input": "5 10\n10 20 30 40 50", "expectedOutput": "1", "isHidden": True},
    {"input": "5 50\n10 20 30 40 50", "expectedOutput": "5", "isHidden": True},
]
register(p26, s1_p26, s2_p26, t_p26)

# 27. Longest Substring Without Repeating Characters
p27 = {
    "id": "longest-substring-without-repeating-characters",
    "tier": "catapult",
    "title": "Longest Substring Without Repeating Characters",
    "difficulty": "Hard",
    "xp": 7,
    "weapon": "catapult",
    "story": "Find the longest uninterrupted streak of unique signal runes in the battle banner.",
    "task": "Given a lowercase string S, find and print the length of the longest contiguous substring without repeating characters.",
    "inputFormat": "A single lowercase string S.",
    "outputFormat": "Print the length as an integer.",
    "constraints": ["1 <= length of S <= 100"],
    "timeLimitMs": 2000,
}
def s1_p27(inp):
    s = inp.strip()
    seen = {}
    left = 0
    max_len = 0
    for right, ch in enumerate(s):
        if ch in seen and seen[ch] >= left:
            left = seen[ch] + 1
        seen[ch] = right
        max_len = max(max_len, right - left + 1)
    return str(max_len)
def s2_p27(inp):
    s = inp.strip()
    n = len(s)
    best = 0
    for i in range(n):
        cur = set()
        for j in range(i, n):
            if s[j] in cur:
                break
            cur.add(s[j])
            best = max(best, j - i + 1)
    return str(best)
t_p27 = [
    {"input": "abcabcbb", "expectedOutput": "3", "explanation": "'abc' has length 3.", "isHidden": False},
    {"input": "bbbbb", "expectedOutput": "1", "explanation": "'b' has length 1.", "isHidden": False},
    {"input": "pwwkew", "expectedOutput": "3", "explanation": "'wke' has length 3.", "isHidden": True},
    {"input": "a", "expectedOutput": "1", "isHidden": True},
    {"input": "abcdef", "expectedOutput": "6", "isHidden": True},
    {"input": "aab", "expectedOutput": "2", "isHidden": True},
    {"input": "dvdf", "expectedOutput": "3", "explanation": "'vdf' has length 3.", "isHidden": True},
    {"input": "tmmzuxt", "expectedOutput": "5", "explanation": "'mzuxt' has length 5.", "isHidden": True},
]
register(p27, s1_p27, s2_p27, t_p27)

# 28. Maximum Subarray Sum
p28 = {
    "id": "maximum-subarray-sum",
    "tier": "catapult",
    "title": "Maximum Subarray Sum",
    "difficulty": "Hard",
    "xp": 7,
    "weapon": "catapult",
    "story": "Find the strongest consecutive surge of momentum in the Viking battle line.",
    "task": "Given an array of N integers, find the maximum sum of any non-empty contiguous subarray.",
    "inputFormat": "The first line contains integer N. The second line contains N space-separated integers.",
    "outputFormat": "Print the maximum subarray sum.",
    "constraints": ["1 <= N <= 100", "-1000 <= each element <= 1000"],
    "timeLimitMs": 2000,
}
def s1_p28(inp):
    toks = [int(x) for x in inp.split()]
    arr = toks[1:1+toks[0]]
    max_so_far = arr[0]
    curr = arr[0]
    for x in arr[1:]:
        curr = max(x, curr + x)
        max_so_far = max(max_so_far, curr)
    return str(max_so_far)
def s2_p28(inp):
    toks = [int(x) for x in inp.split()]
    arr = toks[1:1+toks[0]]
    n = len(arr)
    best = -float('inf')
    for i in range(n):
        s = 0
        for j in range(i, n):
            s += arr[j]
            if s > best:
                best = s
    return str(best)
t_p28 = [
    {"input": "9\n-2 1 -3 4 -1 2 1 -5 4", "expectedOutput": "6", "explanation": "[4, -1, 2, 1] sums to 6.", "isHidden": False},
    {"input": "5\n5 4 -1 7 8", "expectedOutput": "23", "explanation": "Entire array sums to 23.", "isHidden": False},
    {"input": "1\n-5", "expectedOutput": "-5", "isHidden": True},
    {"input": "4\n-3 -2 -1 -4", "expectedOutput": "-1", "isHidden": True},
    {"input": "3\n1 2 3", "expectedOutput": "6", "isHidden": True},
    {"input": "5\n-10 20 -10 30 -5", "expectedOutput": "40", "explanation": "[20, -10, 30] = 40.", "isHidden": True},
    {"input": "2\n-100 50", "expectedOutput": "50", "isHidden": True},
    {"input": "6\n2 -1 3 4 -1 2", "expectedOutput": "9", "isHidden": True},
]
register(p28, s1_p28, s2_p28, t_p28)

# 29. Merge Intervals
p29 = {
    "id": "merge-intervals",
    "tier": "catapult",
    "title": "Merge Intervals",
    "difficulty": "Hard",
    "xp": 7,
    "weapon": "catapult",
    "story": "Merge overlapping watch shifts of the Viking defense patrols.",
    "task": "Given N intervals, merge all overlapping intervals and print the resulting intervals in ascending order of their start values, each interval on its own line as 'start end'.",
    "inputFormat": "The first line contains integer N. The next N lines each contain two integers: start and end.",
    "outputFormat": "Print each merged interval on a new line with start and end separated by a space.",
    "constraints": ["1 <= N <= 100", "0 <= start <= end <= 10000"],
    "timeLimitMs": 2000,
}
def s1_p29(inp):
    toks = [int(x) for x in inp.split()]
    n = toks[0]
    intervals = []
    idx = 1
    for _ in range(n):
        intervals.append([toks[idx], toks[idx+1]])
        idx += 2
    intervals.sort(key=lambda x: x[0])
    merged = []
    for cur in intervals:
        if not merged or merged[-1][1] < cur[0]:
            merged.append(cur)
        else:
            merged[-1][1] = max(merged[-1][1], cur[1])
    return "\n".join(f"{s} {e}" for s, e in merged)
def s2_p29(inp):
    toks = [int(x) for x in inp.split()]
    n = toks[0]
    intervals = [[toks[i], toks[i+1]] for i in range(1, 1 + 2*n, 2)]
    intervals.sort(key=lambda x: (x[0], x[1]))
    res = []
    i = 0
    while i < len(intervals):
        cur_s, cur_e = intervals[i]
        j = i + 1
        while j < len(intervals) and intervals[j][0] <= cur_e:
            cur_e = max(cur_e, intervals[j][1])
            j += 1
        res.append((cur_s, cur_e))
        i = j
    return "\n".join(f"{s} {e}" for s, e in res)
t_p29 = [
    {"input": "4\n1 3\n2 6\n8 10\n15 18", "expectedOutput": "1 6\n8 10\n15 18", "explanation": "[1, 3] and [2, 6] merge to [1, 6].", "isHidden": False},
    {"input": "2\n1 4\n4 5", "expectedOutput": "1 5", "explanation": "[1, 4] and [4, 5] overlap at 4, merging to [1, 5].", "isHidden": False},
    {"input": "1\n5 10", "expectedOutput": "5 10", "isHidden": True},
    {"input": "3\n1 4\n0 2\n3 5", "expectedOutput": "0 5", "isHidden": True},
    {"input": "3\n1 2\n3 4\n5 6", "expectedOutput": "1 2\n3 4\n5 6", "isHidden": True},
    {"input": "3\n1 10\n2 3\n4 5", "expectedOutput": "1 10", "isHidden": True},
    {"input": "4\n1 4\n2 3\n5 8\n7 9", "expectedOutput": "1 4\n5 9", "isHidden": True},
    {"input": "2\n0 0\n0 0", "expectedOutput": "0 0", "isHidden": True},
]
register(p29, s1_p29, s2_p29, t_p29)

# 30. Rotate Array by K
p30 = {
    "id": "rotate-array-by-k",
    "tier": "catapult",
    "title": "Rotate Array by K",
    "difficulty": "Hard",
    "xp": 7,
    "weapon": "catapult",
    "story": "Rotate the circular shield wall defense formation clockwise by K guards.",
    "task": "Given an array of N integers and a non-negative integer K, rotate the array to the right by K positions. Print the resulting array space-separated on one line.",
    "inputFormat": "The first line contains N and K. The second line contains N space-separated integers.",
    "outputFormat": "Print the rotated array elements space-separated on a single line.",
    "constraints": ["1 <= N <= 100", "0 <= K <= 1000", "-1000 <= each element <= 1000"],
    "timeLimitMs": 2000,
}
def s1_p30(inp):
    toks = [int(x) for x in inp.split()]
    n, k = toks[0], toks[1]
    arr = toks[2:2+n]
    k = k % n
    rotated = arr[-k:] + arr[:-k] if k > 0 else arr
    return " ".join(str(x) for x in rotated)
def s2_p30(inp):
    toks = [int(x) for x in inp.split()]
    n, k = toks[0], toks[1]
    arr = deque(toks[2:2+n])
    arr.rotate(k)
    return " ".join(str(x) for x in arr)
t_p30 = [
    {"input": "7 3\n1 2 3 4 5 6 7", "expectedOutput": "5 6 7 1 2 3 4", "explanation": "Rotate right by 3 brings [5, 6, 7] to front.", "isHidden": False},
    {"input": "4 2\n-1 -100 3 99", "expectedOutput": "3 99 -1 -100", "explanation": "Rotate right by 2.", "isHidden": False},
    {"input": "3 0\n1 2 3", "expectedOutput": "1 2 3", "isHidden": True},
    {"input": "3 3\n1 2 3", "expectedOutput": "1 2 3", "isHidden": True},
    {"input": "1 5\n42", "expectedOutput": "42", "isHidden": True},
    {"input": "5 7\n1 2 3 4 5", "expectedOutput": "4 5 1 2 3", "explanation": "K = 7 % 5 = 2.", "isHidden": True},
    {"input": "4 1\n10 20 30 40", "expectedOutput": "40 10 20 30", "isHidden": True},
    {"input": "6 4\n1 2 3 4 5 6", "expectedOutput": "3 4 5 6 1 2", "isHidden": True},
]
register(p30, s1_p30, s2_p30, t_p30)

# 31. Number of Islands
p31 = {
    "id": "number-of-islands",
    "tier": "catapult",
    "title": "Number of Islands",
    "difficulty": "Hard",
    "xp": 7,
    "weapon": "catapult",
    "story": "Survey the archipelago from a scouting dragon and count the distinct island clusters.",
    "task": "Given a grid where 1 represents land and 0 represents water, count the number of islands. Land cells are connected horizontally or vertically.",
    "inputFormat": "The first line contains R and C (rows and columns). The next R lines each contain C space-separated binary values (0 or 1).",
    "outputFormat": "Print the number of islands.",
    "constraints": ["1 <= R, C <= 10", "Grid values are 0 or 1."],
    "timeLimitMs": 2000,
}
def s1_p31(inp):
    toks = [int(x) for x in inp.split()]
    r, c = toks[0], toks[1]
    grid = []
    idx = 2
    for _ in range(r):
        grid.append(toks[idx:idx+c])
        idx += c
    visited = [[False]*c for _ in range(r)]
    islands = 0
    def dfs(i, j):
        visited[i][j] = True
        for di, dj in ((-1,0),(1,0),(0,-1),(0,1)):
            ni, nj = i + di, j + dj
            if 0 <= ni < r and 0 <= nj < c and not visited[ni][nj] and grid[ni][nj] == 1:
                dfs(ni, nj)
    for i in range(r):
        for j in range(c):
            if grid[i][j] == 1 and not visited[i][j]:
                islands += 1
                dfs(i, j)
    return str(islands)
def s2_p31(inp):
    toks = [int(x) for x in inp.split()]
    r, c = toks[0], toks[1]
    grid = [toks[2 + i*c : 2 + (i+1)*c] for i in range(r)]
    visited = set()
    islands = 0
    for i in range(r):
        for j in range(c):
            if grid[i][j] == 1 and (i, j) not in visited:
                islands += 1
                q = deque([(i, j)])
                visited.add((i, j))
                while q:
                    ci, cj = q.popleft()
                    for di, dj in ((-1,0),(1,0),(0,-1),(0,1)):
                        ni, nj = ci + di, cj + dj
                        if 0 <= ni < r and 0 <= nj < c and (ni, nj) not in visited and grid[ni][nj] == 1:
                            visited.add((ni, nj))
                            q.append((ni, nj))
    return str(islands)
t_p31 = [
    {"input": "3 3\n1 1 0\n0 1 0\n0 0 1", "expectedOutput": "2", "explanation": "One island at top-left, one single-cell island at bottom-right.", "isHidden": False},
    {"input": "3 3\n1 0 1\n0 1 0\n1 0 1", "expectedOutput": "5", "explanation": "Five disconnected 1s.", "isHidden": False},
    {"input": "1 1\n1", "expectedOutput": "1", "isHidden": True},
    {"input": "1 1\n0", "expectedOutput": "0", "isHidden": True},
    {"input": "2 3\n1 1 1\n1 1 1", "expectedOutput": "1", "isHidden": True},
    {"input": "3 3\n0 0 0\n0 0 0\n0 0 0", "expectedOutput": "0", "isHidden": True},
    {"input": "4 4\n1 0 0 1\n0 0 0 0\n0 0 0 0\n1 0 0 1", "expectedOutput": "4", "isHidden": True},
    {"input": "3 4\n1 1 0 0\n0 0 1 1\n1 0 0 1", "expectedOutput": "3", "isHidden": True},
]
register(p31, s1_p31, s2_p31, t_p31)

# 32. Subarray Sum Equals K
p32 = {
    "id": "subarray-sum-equals-k",
    "tier": "catapult",
    "title": "Subarray Sum Equals K",
    "difficulty": "Hard",
    "xp": 7,
    "weapon": "catapult",
    "story": "Count how many tactical sub-units deliver an exact impact damage of K.",
    "task": "Given an array of N integers and a target K, count the number of contiguous subarrays whose sum equals K.",
    "inputFormat": "The first line contains N and K. The second line contains N space-separated integers.",
    "outputFormat": "Print the total count of contiguous subarrays summing to K.",
    "constraints": ["1 <= N <= 100", "-1000 <= each element, K <= 1000"],
    "timeLimitMs": 2000,
}
def s1_p32(inp):
    toks = [int(x) for x in inp.split()]
    n, k = toks[0], toks[1]
    arr = toks[2:2+n]
    count = 0
    pref = {0: 1}
    cur = 0
    for x in arr:
        cur += x
        count += pref.get(cur - k, 0)
        pref[cur] = pref.get(cur, 0) + 1
    return str(count)
def s2_p32(inp):
    toks = [int(x) for x in inp.split()]
    n, k = toks[0], toks[1]
    arr = toks[2:2+n]
    count = 0
    for i in range(n):
        s = 0
        for j in range(i, n):
            s += arr[j]
            if s == k:
                count += 1
    return str(count)
t_p32 = [
    {"input": "3 2\n1 1 1", "expectedOutput": "2", "explanation": "[1, 1] at index 0-1 and 1-2 both sum to 2.", "isHidden": False},
    {"input": "3 3\n1 2 3", "expectedOutput": "2", "explanation": "[1, 2] and [3] sum to 3.", "isHidden": False},
    {"input": "1 0\n0", "expectedOutput": "1", "isHidden": True},
    {"input": "4 0\n1 -1 1 -1", "expectedOutput": "4", "explanation": "[1,-1] twice, and [-1,1], and [1,-1,1,-1].", "isHidden": True},
    {"input": "5 5\n1 2 3 -1 1", "expectedOutput": "3", "isHidden": True},
    {"input": "3 10\n1 2 3", "expectedOutput": "0", "isHidden": True},
    {"input": "4 7\n3 4 7 0", "expectedOutput": "3", "explanation": "[3,4], [7], and [7,0].", "isHidden": True},
    {"input": "5 -2\n-1 -1 0 2 -4", "expectedOutput": "4", "isHidden": True},
]
register(p32, s1_p32, s2_p32, t_p32)

# 33. Product of Array Except Self
p33 = {
    "id": "product-of-array-except-self",
    "tier": "catapult",
    "title": "Product of Array Except Self",
    "difficulty": "Hard",
    "xp": 7,
    "weapon": "catapult",
    "story": "Each catapult calculates fire coordinates by combining the multipliers of all other stations.",
    "task": "Given an array of N integers, create an output array where each element is the product of all the other elements in the array, without using division. Print the result space-separated on one line.",
    "inputFormat": "The first line contains integer N. The second line contains N space-separated integers.",
    "outputFormat": "Print the N product values space-separated on a single line.",
    "constraints": ["2 <= N <= 20", "-10 <= each element <= 10"],
    "timeLimitMs": 2000,
}
def s1_p33(inp):
    toks = [int(x) for x in inp.split()]
    arr = toks[1:1+toks[0]]
    n = len(arr)
    res = [1] * n
    prefix = 1
    for i in range(n):
        res[i] = prefix
        prefix *= arr[i]
    postfix = 1
    for i in range(n - 1, -1, -1):
        res[i] *= postfix
        postfix *= arr[i]
    return " ".join(str(x) for x in res)
def s2_p33(inp):
    toks = [int(x) for x in inp.split()]
    arr = toks[1:1+toks[0]]
    n = len(arr)
    out = []
    for i in range(n):
        p = 1
        for j in range(n):
            if i != j:
                p *= arr[j]
        out.append(p)
    return " ".join(str(x) for x in out)
t_p33 = [
    {"input": "4\n1 2 3 4", "expectedOutput": "24 12 8 6", "explanation": "2*3*4=24, 1*3*4=12, 1*2*4=8, 1*2*3=6.", "isHidden": False},
    {"input": "5\n-1 1 0 -3 3", "expectedOutput": "0 0 9 0 0", "explanation": "Only index 2 excludes the zero.", "isHidden": False},
    {"input": "2\n5 10", "expectedOutput": "10 5", "isHidden": True},
    {"input": "3\n0 0 2", "expectedOutput": "0 0 0", "isHidden": True},
    {"input": "4\n2 2 2 2", "expectedOutput": "8 8 8 8", "isHidden": True},
    {"input": "3\n-2 -3 -4", "expectedOutput": "12 8 6", "isHidden": True},
    {"input": "4\n1 -1 1 -1", "expectedOutput": "1 -1 1 -1", "isHidden": True},
    {"input": "5\n1 2 0 4 5", "expectedOutput": "0 0 40 0 0", "isHidden": True},
]
register(p33, s1_p33, s2_p33, t_p33)

# 34. Longest Consecutive Sequence
p34 = {
    "id": "longest-consecutive-sequence",
    "tier": "catapult",
    "title": "Longest Consecutive Sequence",
    "difficulty": "Hard",
    "xp": 7,
    "weapon": "catapult",
    "story": "Find the longest chain of consecutive dragon scales regardless of how they are scattered.",
    "task": "Given an unsorted array of N integers, find the length of the longest sequence of consecutive integer values, regardless of their positions in the array.",
    "inputFormat": "The first line contains integer N. The second line contains N space-separated integers.",
    "outputFormat": "Print the length of the longest consecutive sequence.",
    "constraints": ["1 <= N <= 100", "-1000 <= each element <= 1000"],
    "timeLimitMs": 2000,
}
def s1_p34(inp):
    toks = [int(x) for x in inp.split()]
    arr = toks[1:1+toks[0]]
    num_set = set(arr)
    longest = 0
    for num in num_set:
        if num - 1 not in num_set:
            cur = num
            streak = 1
            while cur + 1 in num_set:
                cur += 1
                streak += 1
            longest = max(longest, streak)
    return str(longest)
def s2_p34(inp):
    toks = [int(x) for x in inp.split()]
    arr = sorted(list(set(toks[1:1+toks[0]])))
    if not arr:
        return "0"
    longest = 1
    cur = 1
    for i in range(1, len(arr)):
        if arr[i] == arr[i - 1] + 1:
            cur += 1
            longest = max(longest, cur)
        else:
            cur = 1
    return str(longest)
t_p34 = [
    {"input": "6\n100 4 200 1 3 2", "expectedOutput": "4", "explanation": "[1, 2, 3, 4] has length 4.", "isHidden": False},
    {"input": "10\n0 3 7 2 5 8 4 6 0 1", "expectedOutput": "9", "explanation": "0 through 8 has length 9.", "isHidden": False},
    {"input": "1\n50", "expectedOutput": "1", "isHidden": True},
    {"input": "4\n10 20 30 40", "expectedOutput": "1", "isHidden": True},
    {"input": "5\n5 4 3 2 1", "expectedOutput": "5", "isHidden": True},
    {"input": "5\n-3 -2 -1 0 1", "expectedOutput": "5", "isHidden": True},
    {"input": "6\n9 1 4 7 3 -1", "expectedOutput": "2", "isHidden": True},
    {"input": "7\n1 2 2 3 4 10 11", "expectedOutput": "4", "explanation": "[1, 2, 3, 4] length 4.", "isHidden": True},
]
register(p34, s1_p34, s2_p34, t_p34)

# 35. Search in a Rotated Sorted Array
p35 = {
    "id": "search-in-a-rotated-sorted-array",
    "tier": "catapult",
    "title": "Search in a Rotated Sorted Array",
    "difficulty": "Hard",
    "xp": 7,
    "weapon": "catapult",
    "story": "Locate an enemy warship on a circular radar array that has been rotated by patrol movement.",
    "task": "Given a sorted array of N distinct integers that has been rotated at an unknown position and a target K, find and print the 1-based index of K. If K is absent, print -1.",
    "inputFormat": "The first line contains N and K. The second line contains N space-separated integers.",
    "outputFormat": "Print the 1-based index of K, or -1 if not found.",
    "constraints": ["1 <= N <= 100", "-1000 <= each element, K <= 1000", "All elements are distinct."],
    "timeLimitMs": 2000,
}
def s1_p35(inp):
    toks = [int(x) for x in inp.split()]
    n, k = toks[0], toks[1]
    arr = toks[2:2+n]
    low, high = 0, n - 1
    while low <= high:
        mid = (low + high) // 2
        if arr[mid] == k:
            return str(mid + 1)
        if arr[low] <= arr[mid]:
            if arr[low] <= k < arr[mid]:
                high = mid - 1
            else:
                low = mid + 1
        else:
            if arr[mid] < k <= arr[high]:
                low = mid + 1
            else:
                high = mid - 1
    return "-1"
def s2_p35(inp):
    toks = [int(x) for x in inp.split()]
    n, k = toks[0], toks[1]
    arr = toks[2:2+n]
    for i, x in enumerate(arr):
        if x == k:
            return str(i + 1)
    return "-1"
t_p35 = [
    {"input": "7 0\n4 5 6 7 0 1 2", "expectedOutput": "5", "explanation": "0 is at 1-based index 5.", "isHidden": False},
    {"input": "7 3\n4 5 6 7 0 1 2", "expectedOutput": "-1", "explanation": "3 is not in the array.", "isHidden": False},
    {"input": "1 0\n0", "expectedOutput": "1", "isHidden": True},
    {"input": "1 3\n1", "expectedOutput": "-1", "isHidden": True},
    {"input": "5 1\n3 4 5 1 2", "expectedOutput": "4", "isHidden": True},
    {"input": "4 2\n2 3 4 1", "expectedOutput": "1", "isHidden": True},
    {"input": "4 1\n2 3 4 1", "expectedOutput": "4", "isHidden": True},
    {"input": "6 -1\n2 4 6 -3 -2 -1", "expectedOutput": "6", "isHidden": True},
]
register(p35, s1_p35, s2_p35, t_p35)

# 36. Majority Element
p36 = {
    "id": "majority-element",
    "tier": "catapult",
    "title": "Majority Element",
    "difficulty": "Hard",
    "xp": 7,
    "weapon": "catapult",
    "story": "Determine the dominant dragon species clan inhabiting the northern cliffs.",
    "task": "Given an array of N integers, find the element that appears more than N/2 times. If no such element exists, print -1.",
    "inputFormat": "The first line contains integer N. The second line contains N space-separated integers.",
    "outputFormat": "Print the majority element, or -1 if none exists.",
    "constraints": ["1 <= N <= 100", "-1000 <= each element <= 1000"],
    "timeLimitMs": 2000,
}
def s1_p36(inp):
    toks = [int(x) for x in inp.split()]
    arr = toks[1:1+toks[0]]
    n = len(arr)
    counts = Counter(arr)
    for x, c in counts.items():
        if c > n // 2:
            return str(x)
    return "-1"
def s2_p36(inp):
    toks = [int(x) for x in inp.split()]
    arr = toks[1:1+toks[0]]
    # Boyer-Moore Voting
    cand = None
    count = 0
    for x in arr:
        if count == 0:
            cand = x
            count = 1
        elif x == cand:
            count += 1
        else:
            count -= 1
    if arr.count(cand) > len(arr) // 2:
        return str(cand)
    return "-1"
t_p36 = [
    {"input": "3\n3 2 3", "expectedOutput": "3", "explanation": "3 appears 2 times (> 3/2 = 1).", "isHidden": False},
    {"input": "7\n2 2 1 1 1 2 2", "expectedOutput": "2", "explanation": "2 appears 4 times (> 7/2 = 3).", "isHidden": False},
    {"input": "4\n1 2 3 4", "expectedOutput": "-1", "isHidden": True},
    {"input": "1\n42", "expectedOutput": "42", "isHidden": True},
    {"input": "2\n1 2", "expectedOutput": "-1", "isHidden": True},
    {"input": "2\n5 5", "expectedOutput": "5", "isHidden": True},
    {"input": "6\n-1 -1 -1 2 3 -1", "expectedOutput": "-1", "explanation": "-1 appears 4 times (> 3).", "isHidden": True},
    {"input": "6\n1 1 1 2 2 2", "expectedOutput": "-1", "explanation": "Neither appears > 3 times.", "isHidden": True},
]
register(p36, s1_p36, s2_p36, t_p36)

# ==============================================================================
# 4. BALLISTA — Extreme (37–48, 10 XP)
# ==============================================================================

# 37. Count Coins
p37 = {
    "id": "count-coins",
    "tier": "ballista",
    "title": "Count Coins",
    "difficulty": "Extreme",
    "xp": 10,
    "weapon": "ballista",
    "story": "Tribute to the Red Death requires exact gold weight with minimum coin pieces.",
    "task": "Given an array of coin denominations and an amount A, find the minimum number of coins needed to make exactly amount A. Each denomination can be used unlimited times. If impossible, print -1.",
    "inputFormat": "The first line contains N (number of denominations) and A (target amount). The second line contains N space-separated coin values.",
    "outputFormat": "Print the minimum number of coins, or -1 if impossible.",
    "constraints": ["1 <= N <= 10", "0 <= A <= 500", "1 <= coin value <= 100"],
    "timeLimitMs": 2000,
}
def s1_p37(inp):
    toks = [int(x) for x in inp.split()]
    n, a = toks[0], toks[1]
    coins = toks[2:2+n]
    dp = [float('inf')] * (a + 1)
    dp[0] = 0
    for coin in coins:
        for x in range(coin, a + 1):
            dp[x] = min(dp[x], dp[x - coin] + 1)
    return str(dp[a]) if dp[a] != float('inf') else "-1"
def s2_p37(inp):
    toks = [int(x) for x in inp.split()]
    n, a = toks[0], toks[1]
    coins = sorted(toks[2:2+n])
    if a == 0:
        return "0"
    q = deque([(0, 0)]) # (current sum, count)
    visited = {0}
    while q:
        curr, cnt = q.popleft()
        for c in coins:
            nxt = curr + c
            if nxt == a:
                return str(cnt + 1)
            if nxt < a and nxt not in visited:
                visited.add(nxt)
                q.append((nxt, cnt + 1))
    return "-1"
t_p37 = [
    {"input": "3 11\n1 2 5", "expectedOutput": "3", "explanation": "5 + 5 + 1 = 11 (3 coins).", "isHidden": False},
    {"input": "1 3\n2", "expectedOutput": "-1", "explanation": "Cannot make 3 using only 2s.", "isHidden": False},
    {"input": "1 0\n1", "expectedOutput": "0", "isHidden": True},
    {"input": "3 6\n1 3 4", "expectedOutput": "2", "explanation": "3 + 3 = 6 (2 coins).", "isHidden": True},
    {"input": "2 7\n2 4", "expectedOutput": "-1", "isHidden": True},
    {"input": "4 30\n1 5 10 25", "expectedOutput": "2", "explanation": "25 + 5 = 30.", "isHidden": True},
    {"input": "2 14\n3 7", "expectedOutput": "2", "explanation": "7 + 7 = 14.", "isHidden": True},
    {"input": "3 100\n1 20 50", "expectedOutput": "2", "explanation": "50 + 50 = 100.", "isHidden": True},
]
register(p37, s1_p37, s2_p37, t_p37)

# 38. Longest Increasing Sequence
p38 = {
    "id": "longest-increasing-sequence",
    "tier": "ballista",
    "title": "Longest Increasing Sequence",
    "difficulty": "Extreme",
    "xp": 10,
    "weapon": "ballista",
    "story": "Track the longest strictly rising terrain altitude encountered by the dragon.",
    "task": "Given an array of N integers, find the length of the longest strictly increasing sequence of consecutive elements (contiguous subarray).",
    "inputFormat": "The first line contains integer N. The second line contains N space-separated integers.",
    "outputFormat": "Print the length of the longest strictly increasing contiguous subarray.",
    "constraints": ["1 <= N <= 100", "-1000 <= each element <= 1000"],
    "timeLimitMs": 2000,
}
def s1_p38(inp):
    toks = [int(x) for x in inp.split()]
    arr = toks[1:1+toks[0]]
    if not arr:
        return "0"
    max_len = 1
    cur_len = 1
    for i in range(1, len(arr)):
        if arr[i] > arr[i - 1]:
            cur_len += 1
            max_len = max(max_len, cur_len)
        else:
            cur_len = 1
    return str(max_len)
def s2_p38(inp):
    toks = [int(x) for x in inp.split()]
    arr = toks[1:1+toks[0]]
    n = len(arr)
    if n == 0:
        return "0"
    dp = [1] * n
    for i in range(1, n):
        if arr[i] > arr[i - 1]:
            dp[i] = dp[i - 1] + 1
    return str(max(dp))
t_p38 = [
    {"input": "5\n1 3 5 4 7", "expectedOutput": "3", "explanation": "[1, 3, 5] has length 3.", "isHidden": False},
    {"input": "5\n2 2 2 2 2", "expectedOutput": "1", "explanation": "Strictly increasing requires arr[i] > arr[i-1].", "isHidden": False},
    {"input": "1\n10", "expectedOutput": "1", "isHidden": True},
    {"input": "4\n4 3 2 1", "expectedOutput": "1", "isHidden": True},
    {"input": "5\n1 2 3 4 5", "expectedOutput": "5", "isHidden": True},
    {"input": "6\n1 2 1 2 3 1", "expectedOutput": "3", "isHidden": True},
    {"input": "6\n-5 -2 0 4 -1 10", "expectedOutput": "4", "explanation": "[-5, -2, 0, 4] length 4.", "isHidden": True},
    {"input": "4\n1 2 2 3", "expectedOutput": "2", "isHidden": True},
]
register(p38, s1_p38, s2_p38, t_p38)

# 39. Compare Strings
p39 = {
    "id": "compare-strings",
    "tier": "ballista",
    "title": "Compare Strings",
    "difficulty": "Extreme",
    "xp": 10,
    "weapon": "ballista",
    "story": "Verify if the secret Viking recognition passphrase matches the chieftain's decree.",
    "task": "Given two strings S and T, determine whether they are identical. Print 'YES' if they are identical, otherwise print 'NO'.",
    "inputFormat": "Two space-separated or line-separated strings S and T.",
    "outputFormat": "Print YES or NO.",
    "constraints": ["1 <= length of S, T <= 100"],
    "timeLimitMs": 2000,
}
def s1_p39(inp):
    toks = inp.split()
    return "YES" if toks[0] == toks[1] else "NO"
def s2_p39(inp):
    toks = inp.split()
    s1, s2 = toks[0], toks[1]
    if len(s1) != len(s2):
        return "NO"
    for a, b in zip(s1, s2):
        if a != b:
            return "NO"
    return "YES"
t_p39 = [
    {"input": "viking viking", "expectedOutput": "YES", "explanation": "Both strings match.", "isHidden": False},
    {"input": "dragon Dragon", "expectedOutput": "NO", "explanation": "Case sensitive comparison ('d' vs 'D').", "isHidden": False},
    {"input": "a a", "expectedOutput": "YES", "isHidden": True},
    {"input": "abc abcd", "expectedOutput": "NO", "isHidden": True},
    {"input": "reddeath reddeath", "expectedOutput": "YES", "isHidden": True},
    {"input": "berserk berserkers", "expectedOutput": "NO", "isHidden": True},
    {"input": "12345 12345", "expectedOutput": "YES", "isHidden": True},
    {"input": "nightfury toothless", "expectedOutput": "NO", "isHidden": True},
]
register(p39, s1_p39, s2_p39, t_p39)

# 40. Maximum Array Sum (Subset Sum with Capacity W)
p40 = {
    "id": "maximum-array-sum",
    "tier": "ballista",
    "title": "Maximum Array Sum",
    "difficulty": "Extreme",
    "xp": 10,
    "weapon": "ballista",
    "story": "Load the dragon siege wagon with maximum weight without exceeding its structural limit W.",
    "task": "Given an array of N positive integers and a maximum allowed sum W, find the maximum sum obtainable by selecting elements without exceeding W. Each element can be selected at most once.",
    "inputFormat": "The first line contains N and W. The second line contains N space-separated positive integers.",
    "outputFormat": "Print the maximum possible sum <= W.",
    "constraints": ["1 <= N <= 20", "1 <= W <= 500", "1 <= each element <= 100"],
    "timeLimitMs": 2000,
}
def s1_p40(inp):
    toks = [int(x) for x in inp.split()]
    n, w = toks[0], toks[1]
    arr = toks[2:2+n]
    dp = [0] * (w + 1)
    for x in arr:
        for j in range(w, x - 1, -1):
            dp[j] = max(dp[j], dp[j - x] + x)
    return str(dp[w])
def s2_p40(inp):
    toks = [int(x) for x in inp.split()]
    n, w = toks[0], toks[1]
    arr = toks[2:2+n]
    reachable = {0}
    for x in arr:
        new_r = set(reachable)
        for val in reachable:
            if val + x <= w:
                new_r.add(val + x)
        reachable = new_r
    return str(max(reachable))
t_p40 = [
    {"input": "4 10\n3 4 5 6", "expectedOutput": "10", "explanation": "4 + 6 = 10.", "isHidden": False},
    {"input": "3 8\n5 5 5", "expectedOutput": "5", "explanation": "5 <= 8; 5 + 5 = 10 exceeds 8.", "isHidden": False},
    {"input": "1 10\n15", "expectedOutput": "0", "isHidden": True},
    {"input": "1 10\n10", "expectedOutput": "10", "isHidden": True},
    {"input": "5 15\n1 2 3 4 5", "expectedOutput": "15", "explanation": "1 + 2 + 3 + 4 + 5 = 15.", "isHidden": True},
    {"input": "4 20\n8 7 6 5", "expectedOutput": "20", "explanation": "8 + 7 + 5 = 20.", "isHidden": True},
    {"input": "3 100\n40 50 60", "expectedOutput": "100", "explanation": "40 + 60 = 100.", "isHidden": True},
    {"input": "5 25\n10 12 15 8 9", "expectedOutput": "25", "explanation": "10 + 15 = 25.", "isHidden": True},
]
register(p40, s1_p40, s2_p40, t_p40)

# 41. Common Characters
p41 = {
    "id": "common-characters",
    "tier": "ballista",
    "title": "Common Characters",
    "difficulty": "Extreme",
    "xp": 10,
    "weapon": "ballista",
    "story": "Count matching runic glyphs carved into twin communication stones.",
    "task": "Given two lowercase strings S and T, print the number of distinct characters that appear in both strings.",
    "inputFormat": "Two space-separated or line-separated lowercase strings S and T.",
    "outputFormat": "Print the number of distinct characters shared by both strings.",
    "constraints": ["1 <= length of S, T <= 100"],
    "timeLimitMs": 2000,
}
def s1_p41(inp):
    toks = inp.split()
    s1, s2 = set(toks[0]), set(toks[1])
    return str(len(s1.intersection(s2)))
def s2_p41(inp):
    toks = inp.split()
    s1, s2 = toks[0], toks[1]
    count = 0
    for ch in set(s1):
        if ch in s2:
            count += 1
    return str(count)
t_p41 = [
    {"input": "viking dragon", "expectedOutput": "2", "explanation": "'g' and 'n' appear in both.", "isHidden": False},
    {"input": "shield axe", "expectedOutput": "1", "explanation": "'e' appears in both.", "isHidden": False},
    {"input": "abc def", "expectedOutput": "0", "isHidden": True},
    {"input": "hello hello", "expectedOutput": "4", "explanation": "'h','e','l','o' distinct common.", "isHidden": True},
    {"input": "aaaa bbbb", "expectedOutput": "0", "isHidden": True},
    {"input": "mississippi ship", "expectedOutput": "3", "explanation": "'s','i','p' in both.", "isHidden": True},
    {"input": "berk berk", "expectedOutput": "4", "isHidden": True},
    {"input": "red death", "expectedOutput": "2", "explanation": "'e' and 'd'.", "isHidden": True},
]
register(p41, s1_p41, s2_p41, t_p41)

# 42. Count Positive Numbers
p42 = {
    "id": "count-positive-numbers",
    "tier": "ballista",
    "title": "Count Positive Numbers",
    "difficulty": "Extreme",
    "xp": 10,
    "weapon": "ballista",
    "story": "Count how many tactical wind gauges indicate forward-favorable tailwinds (> 0).",
    "task": "Given an array of N integers, count how many numbers are strictly greater than zero.",
    "inputFormat": "The first line contains integer N. The second line contains N space-separated integers.",
    "outputFormat": "Print the count of positive numbers.",
    "constraints": ["1 <= N <= 100", "-1000 <= each element <= 1000"],
    "timeLimitMs": 2000,
}
def s1_p42(inp):
    toks = [int(x) for x in inp.split()]
    arr = toks[1:1+toks[0]]
    return str(sum(1 for x in arr if x > 0))
def s2_p42(inp):
    toks = [int(x) for x in inp.split()]
    arr = toks[1:1+toks[0]]
    c = 0
    for x in arr:
        if x > 0:
            c += 1
    return str(c)
t_p42 = [
    {"input": "5\n-1 2 0 -3 4", "expectedOutput": "2", "explanation": "2 and 4 are strictly greater than zero.", "isHidden": False},
    {"input": "4\n-5 -2 -1 0", "expectedOutput": "0", "explanation": "No numbers strictly > 0.", "isHidden": False},
    {"input": "1\n10", "expectedOutput": "1", "isHidden": True},
    {"input": "1\n0", "expectedOutput": "0", "isHidden": True},
    {"input": "4\n1 2 3 4", "expectedOutput": "4", "isHidden": True},
    {"input": "5\n0 0 0 0 0", "expectedOutput": "0", "isHidden": True},
    {"input": "6\n-10 10 -20 20 -30 30", "expectedOutput": "3", "isHidden": True},
    {"input": "3\n100 200 -50", "expectedOutput": "2", "isHidden": True},
]
register(p42, s1_p42, s2_p42, t_p42)

# 43. Longest Palindromic Substring
p43 = {
    "id": "longest-palindromic-substring",
    "tier": "ballista",
    "title": "Longest Palindromic Substring",
    "difficulty": "Extreme",
    "xp": 10,
    "weapon": "ballista",
    "story": "Find the longest symmetrical runic incantation carved on the dragon altar.",
    "task": "Given a lowercase string S, find the longest contiguous substring that is a palindrome. If multiple answers have the same length, choose the earliest occurrence.",
    "inputFormat": "A single lowercase string S.",
    "outputFormat": "Print the longest palindromic substring.",
    "constraints": ["1 <= length of S <= 100"],
    "timeLimitMs": 2000,
}
def s1_p43(inp):
    s = inp.strip()
    n = len(s)
    if n <= 1:
        return s
    best = s[0]
    for i in range(n):
        # odd
        l, r = i, i
        while l >= 0 and r < n and s[l] == s[r]:
            if (r - l + 1) > len(best):
                best = s[l:r+1]
            l -= 1
            r += 1
        # even
        l, r = i, i + 1
        while l >= 0 and r < n and s[l] == s[r]:
            if (r - l + 1) > len(best):
                best = s[l:r+1]
            l -= 1
            r += 1
    return best
def s2_p43(inp):
    s = inp.strip()
    n = len(s)
    best = s[0:1]
    for length in range(n, 0, -1):
        for i in range(n - length + 1):
            sub = s[i:i+length]
            if sub == sub[::-1]:
                return sub
    return best
t_p43 = [
    {"input": "babad", "expectedOutput": "bab", "explanation": "'bab' is a palindrome of length 3 (earliest occurrence).", "isHidden": False},
    {"input": "cbbd", "expectedOutput": "bb", "explanation": "'bb' has length 2.", "isHidden": False},
    {"input": "a", "expectedOutput": "a", "isHidden": True},
    {"input": "racecar", "expectedOutput": "racecar", "isHidden": True},
    {"input": "forge", "expectedOutput": "f", "isHidden": True},
    {"input": "abacdfgdcaba", "expectedOutput": "aba", "isHidden": True},
    {"input": "noon", "expectedOutput": "noon", "isHidden": True},
    {"input": "bananas", "expectedOutput": "anana", "isHidden": True},
]
register(p43, s1_p43, s2_p43, t_p43)

# 44. Second Smallest Number
p44 = {
    "id": "second-smallest-number",
    "tier": "ballista",
    "title": "Second Smallest Number",
    "difficulty": "Extreme",
    "xp": 10,
    "weapon": "ballista",
    "story": "The second smallest dragon egg is selected for incubation in the hatchery.",
    "task": "Given an array of N distinct integers, find and print the second smallest number.",
    "inputFormat": "The first line contains integer N. The second line contains N space-separated distinct integers.",
    "outputFormat": "Print the second smallest number.",
    "constraints": ["2 <= N <= 100", "-1000 <= each element <= 1000", "All elements are distinct."],
    "timeLimitMs": 2000,
}
def s1_p44(inp):
    toks = [int(x) for x in inp.split()]
    arr = toks[1:1+toks[0]]
    arr.sort()
    return str(arr[1])
def s2_p44(inp):
    toks = [int(x) for x in inp.split()]
    arr = toks[1:1+toks[0]]
    first = second = float('inf')
    for x in arr:
        if x < first:
            second = first
            first = x
        elif x < second:
            second = x
    return str(second)
t_p44 = [
    {"input": "5\n12 1 35 10 34", "expectedOutput": "10", "explanation": "Sorted: [1, 10, 12, 34, 35]. Second smallest is 10.", "isHidden": False},
    {"input": "3\n-1 -5 -3", "expectedOutput": "-3", "explanation": "Sorted: [-5, -3, -1]. Second smallest is -3.", "isHidden": False},
    {"input": "2\n10 20", "expectedOutput": "20", "isHidden": True},
    {"input": "2\n5 1", "expectedOutput": "5", "isHidden": True},
    {"input": "4\n0 5 -5 10", "expectedOutput": "0", "isHidden": True},
    {"input": "6\n9 4 7 1 8 2", "expectedOutput": "2", "isHidden": True},
    {"input": "5\n100 200 50 300 400", "expectedOutput": "100", "isHidden": True},
    {"input": "4\n-10 -20 -5 0", "expectedOutput": "-10", "isHidden": True},
]
register(p44, s1_p44, s2_p44, t_p44)

# 45. Maximum Difference
p45 = {
    "id": "maximum-difference",
    "tier": "ballista",
    "title": "Maximum Difference",
    "difficulty": "Extreme",
    "xp": 10,
    "weapon": "ballista",
    "story": "Calculate the highest profit margin buying dragon ore on day i and selling on day j (j > i).",
    "task": "Given an array of N integers, find the maximum value of arr[j] - arr[i] where j > i. If no positive difference exists, print -1.",
    "inputFormat": "The first line contains integer N. The second line contains N space-separated integers.",
    "outputFormat": "Print the maximum difference, or -1 if no positive difference is possible.",
    "constraints": ["2 <= N <= 100", "-1000 <= each element <= 1000"],
    "timeLimitMs": 2000,
}
def s1_p45(inp):
    toks = [int(x) for x in inp.split()]
    arr = toks[1:1+toks[0]]
    min_val = arr[0]
    max_diff = -1
    for x in arr[1:]:
        if x - min_val > max_diff:
            max_diff = x - min_val
        if x < min_val:
            min_val = x
    return str(max_diff if max_diff > 0 else -1)
def s2_p45(inp):
    toks = [int(x) for x in inp.split()]
    arr = toks[1:1+toks[0]]
    n = len(arr)
    best = -1
    for i in range(n):
        for j in range(i + 1, n):
            diff = arr[j] - arr[i]
            if diff > best and diff > 0:
                best = diff
    return str(best)
t_p45 = [
    {"input": "6\n7 1 5 3 6 4", "expectedOutput": "5", "explanation": "Buy at 1, sell at 6: 6 - 1 = 5.", "isHidden": False},
    {"input": "5\n7 6 4 3 1", "expectedOutput": "-1", "explanation": "Decreasing array; no positive profit possible.", "isHidden": False},
    {"input": "2\n1 10", "expectedOutput": "9", "isHidden": True},
    {"input": "2\n10 10", "expectedOutput": "-1", "isHidden": True},
    {"input": "5\n2 4 1 10 7", "expectedOutput": "9", "explanation": "10 - 1 = 9.", "isHidden": True},
    {"input": "4\n-5 -2 -1 3", "expectedOutput": "8", "explanation": "3 - (-5) = 8.", "isHidden": True},
    {"input": "5\n10 20 30 40 50", "expectedOutput": "40", "isHidden": True},
    {"input": "4\n100 50 10 5", "expectedOutput": "-1", "isHidden": True},
]
register(p45, s1_p45, s2_p45, t_p45)

# 46. Sort by Frequency
p46 = {
    "id": "sort-by-frequency",
    "tier": "ballista",
    "title": "Sort by Frequency",
    "difficulty": "Extreme",
    "xp": 10,
    "weapon": "ballista",
    "story": "Group and organize arrow types by decreasing usage count, smaller types first in ties.",
    "task": "Given an array of N integers, sort its elements by decreasing frequency. If two elements have the same frequency, place the smaller element first. Print the sorted array space-separated on one line.",
    "inputFormat": "The first line contains integer N. The second line contains N space-separated integers.",
    "outputFormat": "Print the sorted array space-separated on a single line.",
    "constraints": ["1 <= N <= 100", "-1000 <= each element <= 1000"],
    "timeLimitMs": 2000,
}
def s1_p46(inp):
    toks = [int(x) for x in inp.split()]
    arr = toks[1:1+toks[0]]
    counts = Counter(arr)
    # sort key: (-frequency, value)
    sorted_arr = sorted(arr, key=lambda x: (-counts[x], x))
    return " ".join(str(x) for x in sorted_arr)
def s2_p46(inp):
    toks = [int(x) for x in inp.split()]
    arr = toks[1:1+toks[0]]
    counts = {}
    for x in arr:
        counts[x] = counts.get(x, 0) + 1
    unique = sorted(list(counts.keys()), key=lambda x: (-counts[x], x))
    res = []
    for u in unique:
        res.extend([u] * counts[u])
    return " ".join(str(x) for x in res)
t_p46 = [
    {"input": "6\n1 1 2 2 2 3", "expectedOutput": "2 2 2 1 1 3", "explanation": "2 appears 3 times, 1 appears 2 times, 3 appears 1 time.", "isHidden": False},
    {"input": "6\n2 3 1 3 2 1", "expectedOutput": "1 1 2 2 3 3", "explanation": "All appear twice; tied elements sorted ascending (1, then 2, then 3).", "isHidden": False},
    {"input": "1\n5", "expectedOutput": "5", "isHidden": True},
    {"input": "4\n-1 -1 2 2", "expectedOutput": "-1 -1 2 2", "isHidden": True},
    {"input": "5\n4 5 6 5 4", "expectedOutput": "4 4 5 5 6", "isHidden": True},
    {"input": "6\n10 10 10 20 20 30", "expectedOutput": "10 10 10 20 20 30", "isHidden": True},
    {"input": "5\n5 4 3 2 1", "expectedOutput": "1 2 3 4 5", "isHidden": True},
    {"input": "7\n0 0 1 1 1 2 2", "expectedOutput": "1 1 1 0 0 2 2", "isHidden": True},
]
register(p46, s1_p46, s2_p46, t_p46)

# 47. Longest Common Prefix
p47 = {
    "id": "longest-common-prefix",
    "tier": "ballista",
    "title": "Longest Common Prefix",
    "difficulty": "Extreme",
    "xp": 10,
    "weapon": "ballista",
    "story": "Find the shared ancestral root prefix among N Viking clan house names.",
    "task": "Given N lowercase strings, find and print the longest prefix shared by all strings. If no common prefix exists, print an empty string (or empty line).",
    "inputFormat": "The first line contains integer N. The next N lines (or space-separated tokens) contain the strings.",
    "outputFormat": "Print the longest common prefix on a single line.",
    "constraints": ["1 <= N <= 100", "1 <= length of each string <= 100"],
    "timeLimitMs": 2000,
}
def s1_p47(inp):
    toks = inp.split()
    n = int(toks[0])
    strs = toks[1:1+n]
    if not strs:
        return ""
    prefix = strs[0]
    for s in strs[1:]:
        while not s.startswith(prefix):
            prefix = prefix[:-1]
            if not prefix:
                return ""
    return prefix
def s2_p47(inp):
    toks = inp.split()
    n = int(toks[0])
    strs = toks[1:1+n]
    if not strs:
        return ""
    res = []
    for chars in zip(*strs):
        if len(set(chars)) == 1:
            res.append(chars[0])
        else:
            break
    return "".join(res)
t_p47 = [
    {"input": "3\nflower flow flight", "expectedOutput": "fl", "explanation": "'fl' is shared by all three words.", "isHidden": False},
    {"input": "3\ndog racecar car", "expectedOutput": "", "explanation": "No common prefix among all words.", "isHidden": False},
    {"input": "1\nviking", "expectedOutput": "viking", "isHidden": True},
    {"input": "2\nshield shield", "expectedOutput": "shield", "isHidden": True},
    {"input": "3\nabc ab a", "expectedOutput": "a", "isHidden": True},
    {"input": "4\ninterspace internet internal interview", "expectedOutput": "inter", "isHidden": True},
    {"input": "3\nthunder th thor", "expectedOutput": "th", "isHidden": True},
    {"input": "2\na b", "expectedOutput": "", "isHidden": True},
]
register(p47, s1_p47, s2_p47, t_p47)

# 48. Minimum Jumps
p48 = {
    "id": "minimum-jumps",
    "tier": "ballista",
    "title": "Minimum Jumps",
    "difficulty": "Extreme",
    "xp": 10,
    "weapon": "ballista",
    "story": "Guide a dragon leaping across rocky sea sea-stacks to reach the final island with minimum jumps.",
    "task": "Given an array of N non-negative integers where each element represents the maximum number of positions you can jump forward from that index, find the minimum number of jumps needed to reach the last index (N-1). If it is impossible to reach the last index, print -1.",
    "inputFormat": "The first line contains integer N. The second line contains N space-separated integers.",
    "outputFormat": "Print the minimum number of jumps, or -1 if unreachable.",
    "constraints": ["1 <= N <= 100", "0 <= each element <= 100"],
    "timeLimitMs": 2000,
}
def s1_p48(inp):
    toks = [int(x) for x in inp.split()]
    arr = toks[1:1+toks[0]]
    n = len(arr)
    if n <= 1:
        return "0"
    if arr[0] == 0:
        return "-1"
    jumps = 0
    cur_end = 0
    farthest = 0
    for i in range(n - 1):
        farthest = max(farthest, i + arr[i])
        if i == cur_end:
            jumps += 1
            cur_end = farthest
            if cur_end >= n - 1:
                return str(jumps)
    return str(jumps) if cur_end >= n - 1 else "-1"
def s2_p48(inp):
    toks = [int(x) for x in inp.split()]
    arr = toks[1:1+toks[0]]
    n = len(arr)
    if n <= 1:
        return "0"
    dp = [float('inf')] * n
    dp[0] = 0
    for i in range(n):
        if dp[i] == float('inf'):
            continue
        max_jump = arr[i]
        for j in range(i + 1, min(i + max_jump + 1, n)):
            dp[j] = min(dp[j], dp[i] + 1)
    return str(dp[-1]) if dp[-1] != float('inf') else "-1"
t_p48 = [
    {"input": "5\n2 3 1 1 4", "expectedOutput": "2", "explanation": "Jump from index 0 to 1 (step 1), then from 1 to 4 (step 2). Total 2 jumps.", "isHidden": False},
    {"input": "5\n3 2 1 0 4", "expectedOutput": "-1", "explanation": "Always lands at index 3 with 0 jump length, impossible to reach last index.", "isHidden": False},
    {"input": "1\n0", "expectedOutput": "0", "isHidden": True},
    {"input": "2\n1 0", "expectedOutput": "1", "isHidden": True},
    {"input": "4\n1 1 1 1", "expectedOutput": "3", "isHidden": True},
    {"input": "6\n2 1 1 1 1 1", "expectedOutput": "4", "isHidden": True},
    {"input": "5\n1 0 2 0 1", "expectedOutput": "-1", "isHidden": True},
    {"input": "4\n10 0 0 0", "expectedOutput": "1", "isHidden": True},
]
register(p48, s1_p48, s2_p48, t_p48)

# ==============================================================================
# VERIFICATION & GENERATION
# ==============================================================================

def normalize_output(s):
    if s is None:
        return ""
    return "\n".join(line.rstrip() for line in str(s).strip().splitlines())

def verify_all():
    print(f"Verifying {len(problems)} problems (target: 48)...")
    assert len(problems) == 48, f"Expected 48 problems, found {len(problems)}"
    
    total_tests = 0
    for p in problems:
        pid = p["id"]
        sol1 = solutions_1[pid]
        sol2 = solutions_2[pid]
        tests = tests_by_id[pid]
        assert len(tests) == 8, f"{pid} has {len(tests)} tests, expected 8 (2 sample + 6 hidden)"
        
        for idx, t in enumerate(tests):
            inp = t["input"]
            exp = normalize_output(t["expectedOutput"])
            out1 = normalize_output(sol1(inp))
            out2 = normalize_output(sol2(inp))
            
            if out1 != exp:
                raise ValueError(f"[{pid}] Solution 1 mismatch on test {idx+1}!\nInput:\n{inp}\nExpected:\n{exp}\nGot:\n{out1}")
            if out2 != exp:
                raise ValueError(f"[{pid}] Solution 2 mismatch on test {idx+1}!\nInput:\n{inp}\nExpected:\n{exp}\nGot:\n{out2}")
            if out1 != out2:
                raise ValueError(f"[{pid}] Independent solutions disagree on test {idx+1}!\nSol 1: {out1}\nSol 2: {out2}")
            total_tests += 1

    print(f"✓ All {len(problems)} problems verified successfully!")
    print(f"✓ Both Python solutions passed all {total_tests} test cases (100% agreement)!")

def generate_files():
    # 1. Starter code generator per problem
    for p in problems:
        samples = tests_by_id[p["id"]][:2]
        p["samples"] = [
            {
                "id": f"sample-{i+1}",
                "name": f"Case {i+1}",
                "input": s["input"],
                "expectedOutput": s["expectedOutput"],
                "explanation": s.get("explanation", ""),
                "isHidden": False,
            }
            for i, s in enumerate(samples)
        ]
        
        # Standard templates with C as default
        p["starterCode"] = {
            "c": """#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int main() {
    // Write your Viking battle code in C here
    
    return 0;
}""",
            "cpp": """#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    // Write your solution in C++ here
    
    return 0;
}""",
            "java": """import java.util.*;
import java.io.*;

public class Main {
    public static void main(String[] args) throws Exception {
        Scanner sc = new Scanner(System.in);
        // Write your solution in Java here
        
    }
}""",
            "python": """import sys

def main():
    input_data = sys.stdin.read().split()
    if not input_data:
        return
    # Write your solution in Python here
    

if __name__ == '__main__':
    main()"""
        }

    # 2. Save data/problems_pool.json
    with open("data/problems_pool.json", "w", encoding="utf-8") as f:
        json.dump(problems, f, indent=2)
    print("✓ Wrote data/problems_pool.json")

    # 3. Save data/hidden_tests.json (hidden tests only)
    hidden_data = {}
    for p in problems:
        pid = p["id"]
        hidden_cases = tests_by_id[pid][2:] # 6 hidden tests
        hidden_data[pid] = {
            "timeLimitMs": p.get("timeLimitMs", 2000),
            "hiddenTests": [
                {
                    "id": f"hidden-{i+1}",
                    "name": f"Hidden Test {i+1}",
                    "input": h["input"],
                    "expectedOutput": h["expectedOutput"],
                    "isHidden": True
                }
                for i, h in enumerate(hidden_cases)
            ]
        }
    with open("data/hidden_tests.json", "w", encoding="utf-8") as f:
        json.dump(hidden_data, f, indent=2)
    print("✓ Wrote data/hidden_tests.json")

    # 4. Save src/data/problems.js (for frontend bundle: NO hidden tests, statements only)
    problems_js = f"""// AUTO-GENERATED 48-PROBLEM POOL (NO HIDDEN TESTS)
export const PROBLEMS = {json.dumps(problems, indent=2)};

export const PROBLEMS_BY_ID = Object.fromEntries(
  PROBLEMS.map((p) => [p.id, p])
);

export const PROBLEMS_BY_WEAPON = {{
  dagger: PROBLEMS.filter((p) => p.tier === 'dagger'),
  axe: PROBLEMS.filter((p) => p.tier === 'axe'),
  catapult: PROBLEMS.filter((p) => p.tier === 'catapult'),
  ballista: PROBLEMS.filter((p) => p.tier === 'ballista'),
}};
"""
    with open("src/data/problems.js", "w", encoding="utf-8") as f:
        f.write(problems_js)
    print("✓ Wrote src/data/problems.js")

if __name__ == "__main__":
    verify_all()
    generate_files()
