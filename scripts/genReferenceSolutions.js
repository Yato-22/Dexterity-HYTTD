import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const LOGIC = {
  'sum-of-two-numbers': {
    c: '    printf("%d\\n", a + b);',
    cpp: '    cout << a + b << "\\n";',
    java: '        System.out.println(a + b);',
    py: '    print(a + b)'
  },
  'even-or-odd': {
    c: '    printf("%s\\n", (n % 2 == 0) ? "EVEN" : "ODD");',
    cpp: '    cout << ((n % 2 == 0) ? "EVEN" : "ODD") << "\\n";',
    java: '        System.out.println((n % 2 == 0) ? "EVEN" : "ODD");',
    py: '    print("EVEN" if n % 2 == 0 else "ODD")'
  },
  'largest-of-three': {
    c: '    int m = a; if (b > m) m = b; if (c > m) m = c;\n    printf("%d\\n", m);',
    cpp: '    cout << max({a, b, c}) << "\\n";',
    java: '        System.out.println(Math.max(a, Math.max(b, c)));',
    py: '    print(max(a, b, c))'
  },
  'count-vowels': {
    c: `    int cnt = 0;
    for (int i = 0; s[i]; i++) {
        char ch = s[i];
        if (ch=='a'||ch=='e'||ch=='i'||ch=='o'||ch=='u') cnt++;
    }
    printf("%d\\n", cnt);`,
    cpp: `    int cnt = 0;
    for (char ch : s) {
        if (ch=='a'||ch=='e'||ch=='i'||ch=='o'||ch=='u') cnt++;
    }
    cout << cnt << "\\n";`,
    java: `        int cnt = 0;
        for (char ch : s.toCharArray()) {
            if (ch=='a'||ch=='e'||ch=='i'||ch=='o'||ch=='u') cnt++;
        }
        System.out.println(cnt);`,
    py: `    print(sum(1 for ch in s if ch in 'aeiou'))`
  },
  'reverse-a-string': {
    c: `    int len = strlen(s);
    for (int i = 0; i < len / 2; i++) {
        char tmp = s[i];
        s[i] = s[len - 1 - i];
        s[len - 1 - i] = tmp;
    }
    printf("%s\\n", s);`,
    cpp: `    reverse(s.begin(), s.end());
    cout << s << "\\n";`,
    java: `        System.out.println(new StringBuilder(s).reverse().toString());`,
    py: `    print(s[::-1])`
  },
  'sum-of-digits': {
    c: `    int sum = 0;
    for (int i = 0; n_str[i]; i++) {
        if (n_str[i] >= '0' && n_str[i] <= '9') sum += n_str[i] - '0';
    }
    printf("%d\\n", sum);`,
    cpp: `    int sum = 0;
    for (char c : n_str) {
        if (c >= '0' && c <= '9') sum += c - '0';
    }
    cout << sum << "\\n";`,
    java: `        int sum = 0;
        for (char c : n_str.toCharArray()) {
            if (c >= '0' && c <= '9') sum += c - '0';
        }
        System.out.println(sum);`,
    py: `    print(sum(int(c) for c in n_str if c.isdigit()))`
  },
  'leap-year': {
    c: `    if ((y % 4 == 0 && y % 100 != 0) || (y % 400 == 0)) printf("YES\\n");
    else printf("NO\\n");`,
    cpp: `    if ((y % 4 == 0 && y % 100 != 0) || (y % 400 == 0)) cout << "YES\\n";
    else cout << "NO\\n";`,
    java: `        if ((y % 4 == 0 && y % 100 != 0) || (y % 400 == 0)) System.out.println("YES");
        else System.out.println("NO");`,
    py: `    print("YES" if (y % 4 == 0 and y % 100 != 0) or (y % 400 == 0) else "NO")`
  },
  'sum-of-an-array': {
    c: `    long long sum = 0;
    for (int i = 0; i < n; i++) sum += arr[i];
    printf("%lld\\n", sum);`,
    cpp: `    long long sum = 0;
    for (int x : arr) sum += x;
    cout << sum << "\\n";`,
    java: `        long sum = 0;
        for (int x : arr) sum += x;
        System.out.println(sum);`,
    py: `    print(sum(arr))`
  },
  'print-a-number-pattern': {
    c: `    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= i; j++) {
            printf("%d", i);
        }
        printf("\\n");
    }`,
    cpp: `    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= i; j++) {
            cout << i;
        }
        cout << "\\n";
    }`,
    java: `        for (int i = 1; i <= n; i++) {
            StringBuilder sb = new StringBuilder();
            for (int j = 1; j <= i; j++) {
                sb.append(i);
            }
            System.out.println(sb.toString());
        }`,
    py: `    for i in range(1, n + 1):
        print(str(i) * i)`
  },
  'find-the-smallest-number': {
    c: `    int min_val = arr[0];
    for (int i = 1; i < n; i++) {
        if (arr[i] < min_val) min_val = arr[i];
    }
    printf("%d\\n", min_val);`,
    cpp: `    int min_val = *min_element(arr.begin(), arr.end());
    cout << min_val << "\\n";`,
    java: `        int minVal = arr[0];
        for (int i = 1; i < n; i++) {
            if (arr[i] < minVal) minVal = arr[i];
        }
        System.out.println(minVal);`,
    py: `    print(min(arr))`
  },
  'count-digits': {
    c: `    int len = 0;
    for (int i = 0; n_str[i]; i++) {
        if (n_str[i] >= '0' && n_str[i] <= '9') len++;
    }
    printf("%d\\n", len);`,
    cpp: `    int len = 0;
    for (char c : n_str) if (c >= '0' && c <= '9') len++;
    cout << len << "\\n";`,
    java: `        int len = 0;
        for (char c : n_str.toCharArray()) if (c >= '0' && c <= '9') len++;
        System.out.println(len);`,
    py: `    print(len([c for c in n_str if c.isdigit()]))`
  },
  'multiplication-table': {
    c: `    for (int i = 1; i <= 10; i++) {
        printf("%d%s", n * i, (i == 10 ? "" : " "));
    }
    printf("\\n");`,
    cpp: `    for (int i = 1; i <= 10; i++) {
        cout << n * i << (i == 10 ? "" : " ");
    }
    cout << "\\n";`,
    java: `        StringBuilder sb = new StringBuilder();
        for (int i = 1; i <= 10; i++) {
            if (i > 1) sb.append(" ");
            sb.append(n * i);
        }
        System.out.println(sb.toString());`,
    py: `    print(" ".join(str(n * i) for i in range(1, 11)))`
  },
  'palindrome-string': {
    c: `    int len = strlen(s);
    int is_pal = 1;
    for (int i = 0; i < len / 2; i++) {
        if (s[i] != s[len - 1 - i]) { is_pal = 0; break; }
    }
    printf("%s\\n", is_pal ? "YES" : "NO");`,
    cpp: `    string r = s;
    reverse(r.begin(), r.end());
    cout << (s == r ? "YES" : "NO") << "\\n";`,
    java: `        String r = new StringBuilder(s).reverse().toString();
        System.out.println(s.equals(r) ? "YES" : "NO");`,
    py: `    print("YES" if s == s[::-1] else "NO")`
  },
  'prime-check': {
    c: `    int is_prime = (n >= 2);
    for (int i = 2; i * i <= n; i++) {
        if (n % i == 0) { is_prime = 0; break; }
    }
    printf("%s\\n", is_prime ? "YES" : "NO");`,
    cpp: `    bool ok = (n >= 2);
    for (int i = 2; i * i <= n; i++) {
        if (n % i == 0) { ok = false; break; }
    }
    cout << (ok ? "YES" : "NO") << "\\n";`,
    java: `        boolean ok = (n >= 2);
        for (int i = 2; i * i <= n; i++) {
            if (n % i == 0) { ok = false; break; }
        }
        System.out.println(ok ? "YES" : "NO");`,
    py: `    if n < 2:
        print("NO")
    else:
        ok = True
        for i in range(2, int(n**0.5) + 1):
            if n % i == 0:
                ok = False
                break
        print("YES" if ok else "NO")`
  },
  'second-largest-number': {
    c: `    int max1 = -2000000000, max2 = -2000000000;
    for (int i = 0; i < n; i++) {
        if (arr[i] > max1) {
            max2 = max1;
            max1 = arr[i];
        } else if (arr[i] > max2 && arr[i] != max1) {
            max2 = arr[i];
        }
    }
    printf("%d\\n", max2);`,
    cpp: `    sort(arr.begin(), arr.end());
    cout << arr[n - 2] << "\\n";`,
    java: `        Arrays.sort(arr);
        System.out.println(arr[n - 2]);`,
    py: `    arr.sort()
    print(arr[-2])`
  },
  'most-frequent-character': {
    c: `    int freq[26] = {0};
    for (int i = 0; s[i]; i++) freq[s[i] - 'a']++;
    int best_f = 0;
    char best_c = 'a';
    for (int i = 0; i < 26; i++) {
        if (freq[i] > best_f) {
            best_f = freq[i];
            best_c = 'a' + i;
        }
    }
    printf("%c\\n", best_c);`,
    cpp: `    vector<int> freq(26, 0);
    for (char c : s) freq[c - 'a']++;
    int best_f = 0;
    char best_c = 'a';
    for (int i = 0; i < 26; i++) {
        if (freq[i] > best_f) {
            best_f = freq[i];
            best_c = 'a' + i;
        }
    }
    cout << best_c << "\\n";`,
    java: `        int[] freq = new int[26];
        for (char c : s.toCharArray()) freq[c - 'a']++;
        int bestF = 0;
        char bestC = 'a';
        for (int i = 0; i < 26; i++) {
            if (freq[i] > bestF) {
                bestF = freq[i];
                bestC = (char) ('a' + i);
            }
        }
        System.out.println(bestC);`,
    py: `    freq = [0] * 26
    for c in s:
        freq[ord(c) - ord('a')] += 1
    best_f = 0
    best_c = 'a'
    for i in range(26):
        if freq[i] > best_f:
            best_f = freq[i]
            best_c = chr(ord('a') + i)
    print(best_c)`
  },
  'two-sum': {
    c: `    for (int i = 0; i < n; i++) {
        for (int j = i + 1; j < n; j++) {
            if (arr[i] + arr[j] == target) {
                printf("%d %d\\n", i + 1, j + 1);
                return 0;
            }
        }
    }`,
    cpp: `    for (int i = 0; i < n; i++) {
        for (int j = i + 1; j < n; j++) {
            if (arr[i] + arr[j] == target) {
                cout << (i + 1) << " " << (j + 1) << "\\n";
                return 0;
            }
        }
    }`,
    java: `        for (int i = 0; i < n; i++) {
            for (int j = i + 1; j < n; j++) {
                if (arr[i] + arr[j] == target) {
                    System.out.println((i + 1) + " " + (j + 1));
                    return;
                }
            }
        }`,
    py: `    for i in range(n):
        for j in range(i + 1, n):
            if arr[i] + arr[j] == target:
                print(f"{i + 1} {j + 1}")
                return`
  },
  'valid-anagram': {
    c: `    int c1[256] = {0}, c2[256] = {0};
    for (int i = 0; s[i]; i++) c1[(unsigned char)s[i]]++;
    for (int i = 0; t[i]; i++) c2[(unsigned char)t[i]]++;
    int ok = 1;
    for (int i = 0; i < 256; i++) {
        if (c1[i] != c2[i]) { ok = 0; break; }
    }
    printf("%s\\n", ok ? "YES" : "NO");`,
    cpp: `    string s1 = s, s2 = t;
    sort(s1.begin(), s1.end());
    sort(s2.begin(), s2.end());
    cout << (s1 == s2 ? "YES" : "NO") << "\\n";`,
    java: `        char[] a1 = s.toCharArray();
        char[] a2 = t.toCharArray();
        Arrays.sort(a1);
        Arrays.sort(a2);
        System.out.println(Arrays.equals(a1, a2) ? "YES" : "NO");`,
    py: `    print("YES" if sorted(s) == sorted(t) else "NO")`
  },
  'remove-duplicates': {
    c: `    int printed = 0;
    for (int i = 0; i < n; i++) {
        int seen = 0;
        for (int j = 0; j < i; j++) {
            if (arr[j] == arr[i]) { seen = 1; break; }
        }
        if (!seen) {
            if (printed > 0) printf(" ");
            printf("%d", arr[i]);
            printed++;
        }
    }
    printf("\\n");`,
    cpp: `    vector<int> res;
    for (int i = 0; i < n; i++) {
        bool seen = false;
        for (int j = 0; j < i; j++) {
            if (arr[j] == arr[i]) { seen = true; break; }
        }
        if (!seen) res.push_back(arr[i]);
    }
    for (size_t i = 0; i < res.size(); i++) {
        cout << res[i] << (i + 1 == res.size() ? "" : " ");
    }
    cout << "\\n";`,
    java: `        List<Integer> res = new ArrayList<>();
        for (int i = 0; i < n; i++) {
            boolean seen = false;
            for (int j = 0; j < i; j++) {
                if (arr[j] == arr[i]) { seen = true; break; }
            }
            if (!seen) res.add(arr[i]);
        }
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < res.size(); i++) {
            if (i > 0) sb.append(" ");
            sb.append(res.get(i));
        }
        System.out.println(sb.toString());`,
    py: `    seen = set()
    res = []
    for x in arr:
        if x not in seen:
            seen.add(x)
            res.append(str(x))
    print(" ".join(res))`
  },
  'gcd-and-lcm': {
    c: `    long long x = a, y = b;
    while (y != 0) {
        long long tmp = y;
        y = x % y;
        x = tmp;
    }
    long long g = x;
    long long l = ((long long)a * b) / g;
    printf("%lld %lld\\n", g, l);`,
    cpp: `    auto gcd_fn = [](long long x, long long y) {
        while (y) { long long t = y; y = x % y; x = t; }
        return x;
    };
    long long g = gcd_fn(a, b);
    long long l = ((long long)a * b) / g;
    cout << g << " " << l << "\\n";`,
    java: `        long x = a, y = b;
        while (y != 0) {
            long tmp = y;
            y = x % y;
            x = tmp;
        }
        long g = x;
        long l = ((long)a * b) / g;
        System.out.println(g + " " + l);`,
    py: `    import math
    g = math.gcd(a, b)
    l = (a * b) // g
    print(f"{g} {l}")`
  },
  'missing-number': {
    c: `    long long total = (long long)n * (n + 1) / 2;
    for (int i = 0; i < n - 1; i++) total -= arr[i];
    printf("%lld\\n", total);`,
    cpp: `    long long total = (long long)n * (n + 1) / 2;
    for (int x : arr) total -= x;
    cout << total << "\\n";`,
    java: `        long total = (long)n * (n + 1) / 2;
        for (int x : arr) total -= x;
        System.out.println(total);`,
    py: `    total = n * (n + 1) // 2
    print(total - sum(arr))`
  },
  'move-zeros': {
    c: `    int res[1005];
    int idx = 0;
    for (int i = 0; i < n; i++) {
        if (arr[i] != 0) res[idx++] = arr[i];
    }
    while (idx < n) res[idx++] = 0;
    for (int i = 0; i < n; i++) {
        printf("%d%s", res[i], (i + 1 == n ? "" : " "));
    }
    printf("\\n");`,
    cpp: `    vector<int> res;
    int zeros = 0;
    for (int x : arr) {
        if (x != 0) res.push_back(x);
        else zeros++;
    }
    while (zeros--) res.push_back(0);
    for (int i = 0; i < n; i++) {
        cout << res[i] << (i + 1 == n ? "" : " ");
    }
    cout << "\\n";`,
    java: `        int[] res = new int[n];
        int idx = 0;
        for (int x : arr) {
            if (x != 0) res[idx++] = x;
        }
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < n; i++) {
            if (i > 0) sb.append(" ");
            sb.append(res[i]);
        }
        System.out.println(sb.toString());`,
    py: `    nonzeros = [str(x) for x in arr if x != 0]
    zeros = ['0'] * (len(arr) - len(nonzeros))
    print(" ".join(nonzeros + zeros))`
  },
  'character-frequency': {
    c: `    int cnt = 0;
    for (int i = 0; s[i]; i++) {
        if (s[i] == c) cnt++;
    }
    printf("%d\\n", cnt);`,
    cpp: `    int cnt = 0;
    for (char ch : s) if (ch == c) cnt++;
    cout << cnt << "\\n";`,
    java: `        int cnt = 0;
        for (char ch : s.toCharArray()) if (ch == c) cnt++;
        System.out.println(cnt);`,
    py: `    print(s.count(c))`
  },
  'pair-with-given-difference': {
    c: `    int ok = 0;
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n; j++) {
            if (i != j && abs(arr[i] - arr[j]) == k) {
                ok = 1;
                break;
            }
        }
        if (ok) break;
    }
    printf("%s\\n", ok ? "YES" : "NO");`,
    cpp: `    bool ok = false;
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n; j++) {
            if (i != j && abs(arr[i] - arr[j]) == k) {
                ok = true;
                break;
            }
        }
        if (ok) break;
    }
    cout << (ok ? "YES" : "NO") << "\\n";`,
    java: `        boolean ok = false;
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) {
                if (i != j && Math.abs(arr[i] - arr[j]) == k) {
                    ok = true;
                    break;
                }
            }
            if (ok) break;
        }
        System.out.println(ok ? "YES" : "NO");`,
    py: `    ok = False
    for i in range(n):
        for j in range(n):
            if i != j and abs(arr[i] - arr[j]) == k:
                ok = True
                break
        if ok:
            break
    print("YES" if ok else "NO")`
  },
  'valid-parentheses': {
    c: `    char stack[1005];
    int top = 0;
    int valid = 1;
    for (int i = 0; s[i]; i++) {
        char ch = s[i];
        if (ch == '(' || ch == '[' || ch == '{') {
            stack[top++] = ch;
        } else {
            if (top == 0) { valid = 0; break; }
            char open = stack[--top];
            if ((ch == ')' && open != '(') ||
                (ch == ']' && open != '[') ||
                (ch == '}' && open != '{')) {
                valid = 0;
                break;
            }
        }
    }
    if (top != 0) valid = 0;
    printf("%s\\n", valid ? "YES" : "NO");`,
    cpp: `    vector<char> st;
    bool ok = true;
    for (char ch : s) {
        if (ch == '(' || ch == '[' || ch == '{') st.push_back(ch);
        else {
            if (st.empty()) { ok = false; break; }
            char o = st.back(); st.pop_back();
            if ((ch == ')' && o != '(') || (ch == ']' && o != '[') || (ch == '}' && o != '{')) {
                ok = false; break;
            }
        }
    }
    if (!st.empty()) ok = false;
    cout << (ok ? "YES" : "NO") << "\\n";`,
    java: `        Stack<Character> st = new Stack<>();
        boolean ok = true;
        for (char ch : s.toCharArray()) {
            if (ch == '(' || ch == '[' || ch == '{') st.push(ch);
            else {
                if (st.isEmpty()) { ok = false; break; }
                char o = st.pop();
                if ((ch == ')' && o != '(') || (ch == ']' && o != '[') || (ch == '}' && o != '{')) {
                    ok = false; break;
                }
            }
        }
        if (!st.isEmpty()) ok = false;
        System.out.println(ok ? "YES" : "NO");`,
    py: `    st = []
    pairs = {')': '(', ']': '[', '}': '{'}
    ok = True
    for ch in s:
        if ch in pairs.values():
            st.append(ch)
        elif ch in pairs:
            if not st or st[-1] != pairs[ch]:
                ok = False
                break
            st.pop()
    if st:
        ok = False
    print("YES" if ok else "NO")`
  },
  'binary-search': {
    c: `    int ans = -1;
    int low = 0, high = n - 1;
    while (low <= high) {
        int mid = low + (high - low) / 2;
        if (arr[mid] == k) { ans = mid + 1; break; }
        else if (arr[mid] < k) low = mid + 1;
        else high = mid - 1;
    }
    printf("%d\\n", ans);`,
    cpp: `    int ans = -1;
    int low = 0, high = n - 1;
    while (low <= high) {
        int mid = low + (high - low) / 2;
        if (arr[mid] == k) { ans = mid + 1; break; }
        else if (arr[mid] < k) low = mid + 1;
        else high = mid - 1;
    }
    cout << ans << "\\n";`,
    java: `        int ans = -1;
        int low = 0, high = n - 1;
        while (low <= high) {
            int mid = low + (high - low) / 2;
            if (arr[mid] == k) { ans = mid + 1; break; }
            else if (arr[mid] < k) low = mid + 1;
            else high = mid - 1;
        }
        System.out.println(ans);`,
    py: `    try:
        print(arr.index(k) + 1)
    except ValueError:
        print(-1)`
  },
  'longest-substring-without-repeating-characters': {
    c: `    int max_len = 0;
    int len = strlen(s);
    for (int i = 0; i < len; i++) {
        int seen[256] = {0};
        for (int j = i; j < len; j++) {
            if (seen[(unsigned char)s[j]]) break;
            seen[(unsigned char)s[j]] = 1;
            if (j - i + 1 > max_len) max_len = j - i + 1;
        }
    }
    printf("%d\\n", max_len);`,
    cpp: `    int max_len = 0;
    int n = s.size();
    for (int i = 0; i < n; i++) {
        int seen[256] = {0};
        for (int j = i; j < n; j++) {
            if (seen[(unsigned char)s[j]]) break;
            seen[(unsigned char)s[j]] = 1;
            max_len = max(max_len, j - i + 1);
        }
    }
    cout << max_len << "\\n";`,
    java: `        int maxLen = 0;
        int n = s.length();
        for (int i = 0; i < n; i++) {
            boolean[] seen = new boolean[256];
            for (int j = i; j < n; j++) {
                char ch = s.charAt(j);
                if (seen[ch]) break;
                seen[ch] = true;
                maxLen = Math.max(maxLen, j - i + 1);
            }
        }
        System.out.println(maxLen);`,
    py: `    max_len = 0
    for i in range(len(s)):
        seen = set()
        for j in range(i, len(s)):
            if s[j] in seen:
                break
            seen.add(s[j])
            max_len = max(max_len, j - i + 1)
    print(max_len)`
  },
  'maximum-subarray-sum': {
    c: `    long long max_sum = arr[0], cur_sum = arr[0];
    for (int i = 1; i < n; i++) {
        cur_sum = (arr[i] > cur_sum + arr[i]) ? arr[i] : (cur_sum + arr[i]);
        if (cur_sum > max_sum) max_sum = cur_sum;
    }
    printf("%lld\\n", max_sum);`,
    cpp: `    long long max_sum = arr[0], cur_sum = arr[0];
    for (int i = 1; i < n; i++) {
        cur_sum = max((long long)arr[i], cur_sum + arr[i]);
        max_sum = max(max_sum, cur_sum);
    }
    cout << max_sum << "\\n";`,
    java: `        long maxSum = arr[0], curSum = arr[0];
        for (int i = 1; i < n; i++) {
            curSum = Math.max((long)arr[i], curSum + arr[i]);
            maxSum = Math.max(maxSum, curSum);
        }
        System.out.println(maxSum);`,
    py: `    max_sum = cur_sum = arr[0]
    for x in arr[1:]:
        cur_sum = max(x, cur_sum + x)
        max_sum = max(max_sum, cur_sum)
    print(max_sum)`
  },
  'merge-intervals': {
    c: `    for (int i = 0; i < n; i++) {
        for (int j = i + 1; j < n; j++) {
            if (intervals[i][0] > intervals[j][0] || (intervals[i][0] == intervals[j][0] && intervals[i][1] > intervals[j][1])) {
                int t0 = intervals[i][0], t1 = intervals[i][1];
                intervals[i][0] = intervals[j][0]; intervals[i][1] = intervals[j][1];
                intervals[j][0] = t0; intervals[j][1] = t1;
            }
        }
    }
    int cur_s = intervals[0][0], cur_e = intervals[0][1];
    for (int i = 1; i < n; i++) {
        if (intervals[i][0] <= cur_e) {
            if (intervals[i][1] > cur_e) cur_e = intervals[i][1];
        } else {
            printf("%d %d\\n", cur_s, cur_e);
            cur_s = intervals[i][0];
            cur_e = intervals[i][1];
        }
    }
    printf("%d %d\\n", cur_s, cur_e);`,
    cpp: `    sort(intervals.begin(), intervals.end());
    int cur_s = intervals[0].first, cur_e = intervals[0].second;
    for (int i = 1; i < n; i++) {
        if (intervals[i].first <= cur_e) {
            cur_e = max(cur_e, intervals[i].second);
        } else {
            cout << cur_s << " " << cur_e << "\\n";
            cur_s = intervals[i].first;
            cur_e = intervals[i].second;
        }
    }
    cout << cur_s << " " << cur_e << "\\n";`,
    java: `        Arrays.sort(intervals, (a, b) -> a[0] != b[0] ? Integer.compare(a[0], b[0]) : Integer.compare(a[1], b[1]));
        int curS = intervals[0][0], curE = intervals[0][1];
        for (int i = 1; i < n; i++) {
            if (intervals[i][0] <= curE) {
                curE = Math.max(curE, intervals[i][1]);
            } else {
                System.out.println(curS + " " + curE);
                curS = intervals[i][0];
                curE = intervals[i][1];
            }
        }
        System.out.println(curS + " " + curE);`,
    py: `    intervals.sort()
    res = [intervals[0]]
    for s, e in intervals[1:]:
        if s <= res[-1][1]:
            res[-1][1] = max(res[-1][1], e)
        else:
            res.append([s, e])
    for s, e in res:
        print(f"{s} {e}")`
  },
  'rotate-array-by-k': {
    c: `    k = k % n;
    int res[1005];
    for (int i = 0; i < n; i++) res[(i + k) % n] = arr[i];
    for (int i = 0; i < n; i++) printf("%d%s", res[i], (i + 1 == n ? "" : " "));
    printf("\\n");`,
    cpp: `    k = k % n;
    vector<int> res(n);
    for (int i = 0; i < n; i++) res[(i + k) % n] = arr[i];
    for (int i = 0; i < n; i++) cout << res[i] << (i + 1 == n ? "" : " ");
    cout << "\\n";`,
    java: `        k = k % n;
        int[] res = new int[n];
        for (int i = 0; i < n; i++) res[(i + k) % n] = arr[i];
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < n; i++) {
            if (i > 0) sb.append(" ");
            sb.append(res[i]);
        }
        System.out.println(sb.toString());`,
    py: `    k = k % n
    res = arr[-k:] + arr[:-k] if k > 0 else arr
    print(" ".join(str(x) for x in res))`
  },
  'number-of-islands': {
    c: `    int cnt = 0;
    int vis[105][105] = {0};
    for (int i = 0; i < r; i++) {
        for (int j = 0; j < c; j++) {
            if (grid[i][j] == 1 && !vis[i][j]) {
                cnt++;
                int qx[10000], qy[10000];
                int qh = 0, qt = 0;
                qx[qt] = i; qy[qt] = j; qt++;
                vis[i][j] = 1;
                while (qh < qt) {
                    int cx = qx[qh], cy = qy[qh]; qh++;
                    int dx[4] = {-1, 1, 0, 0};
                    int dy[4] = {0, 0, -1, 1};
                    for (int d = 0; d < 4; d++) {
                        int nx = cx + dx[d], ny = cy + dy[d];
                        if (nx >= 0 && nx < r && ny >= 0 && ny < c && grid[nx][ny] == 1 && !vis[nx][ny]) {
                            vis[nx][ny] = 1;
                            qx[qt] = nx; qy[qt] = ny; qt++;
                        }
                    }
                }
            }
        }
    }
    printf("%d\\n", cnt);`,
    cpp: `    int cnt = 0;
    vector<vector<int>> vis(r, vector<int>(c, 0));
    for (int i = 0; i < r; i++) {
        for (int j = 0; j < c; j++) {
            if (grid[i][j] == 1 && !vis[i][j]) {
                cnt++;
                vector<pair<int, int>> q;
                q.push_back({i, j});
                vis[i][j] = 1;
                size_t head = 0;
                while (head < q.size()) {
                    auto [cx, cy] = q[head++];
                    int dx[4] = {-1, 1, 0, 0};
                    int dy[4] = {0, 0, -1, 1};
                    for (int d = 0; d < 4; d++) {
                        int nx = cx + dx[d], ny = cy + dy[d];
                        if (nx >= 0 && nx < r && ny >= 0 && ny < c && grid[nx][ny] == 1 && !vis[nx][ny]) {
                            vis[nx][ny] = 1;
                            q.push_back({nx, ny});
                        }
                    }
                }
            }
        }
    }
    cout << cnt << "\\n";`,
    java: `        int cnt = 0;
        boolean[][] vis = new boolean[r][c];
        for (int i = 0; i < r; i++) {
            for (int j = 0; j < c; j++) {
                if (grid[i][j] == 1 && !vis[i][j]) {
                    cnt++;
                    Queue<int[]> q = new LinkedList<>();
                    q.add(new int[]{i, j});
                    vis[i][j] = true;
                    int[] dx = {-1, 1, 0, 0};
                    int[] dy = {0, 0, -1, 1};
                    while (!q.isEmpty()) {
                        int[] cur = q.poll();
                        for (int d = 0; d < 4; d++) {
                            int nx = cur[0] + dx[d], ny = cur[1] + dy[d];
                            if (nx >= 0 && nx < r && ny >= 0 && ny < c && grid[nx][ny] == 1 && !vis[nx][ny]) {
                                vis[nx][ny] = true;
                                q.add(new int[]{nx, ny});
                            }
                        }
                    }
                }
            }
        }
        System.out.println(cnt);`,
    py: `    vis = [[False] * c for _ in range(r)]
    cnt = 0
    from collections import deque
    for i in range(r):
        for j in range(c):
            if grid[i][j] == 1 and not vis[i][j]:
                cnt += 1
                q = deque([(i, j)])
                vis[i][j] = True
                while q:
                    cx, cy = q.popleft()
                    for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                        nx, ny = cx + dx, cy + dy
                        if 0 <= nx < r and 0 <= ny < c and grid[nx][ny] == 1 and not vis[nx][ny]:
                            vis[nx][ny] = True
                            q.append((nx, ny))
    print(cnt)`
  },
  'subarray-sum-equals-k': {
    c: `    int cnt = 0;
    for (int i = 0; i < n; i++) {
        long long sum = 0;
        for (int j = i; j < n; j++) {
            sum += arr[j];
            if (sum == k) cnt++;
        }
    }
    printf("%d\\n", cnt);`,
    cpp: `    int cnt = 0;
    for (int i = 0; i < n; i++) {
        long long sum = 0;
        for (int j = i; j < n; j++) {
            sum += arr[j];
            if (sum == k) cnt++;
        }
    }
    cout << cnt << "\\n";`,
    java: `        int cnt = 0;
        for (int i = 0; i < n; i++) {
            long sum = 0;
            for (int j = i; j < n; j++) {
                sum += arr[j];
                if (sum == k) cnt++;
            }
        }
        System.out.println(cnt);`,
    py: `    cnt = 0
    for i in range(n):
        s = 0
        for j in range(i, n):
            s += arr[j]
            if s == k:
                cnt += 1
    print(cnt)`
  },
  'product-of-array-except-self': {
    c: `    for (int i = 0; i < n; i++) {
        long long prod = 1;
        for (int j = 0; j < n; j++) {
            if (i != j) prod *= arr[j];
        }
        printf("%lld%s", prod, (i + 1 == n ? "" : " "));
    }
    printf("\\n");`,
    cpp: `    for (int i = 0; i < n; i++) {
        long long prod = 1;
        for (int j = 0; j < n; j++) {
            if (i != j) prod *= arr[j];
        }
        cout << prod << (i + 1 == n ? "" : " ");
    }
    cout << "\\n";`,
    java: `        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < n; i++) {
            long prod = 1;
            for (int j = 0; j < n; j++) {
                if (i != j) prod *= arr[j];
            }
            if (i > 0) sb.append(" ");
            sb.append(prod);
        }
        System.out.println(sb.toString());`,
    py: `    res = []
    for i in range(n):
        p = 1
        for j in range(n):
            if i != j:
                p *= arr[j]
        res.append(str(p))
    print(" ".join(res))`
  },
  'longest-consecutive-sequence': {
    c: `    int max_len = 0;
    for (int i = 0; i < n; i++) {
        int val = arr[i];
        int has_prev = 0;
        for (int j = 0; j < n; j++) {
            if (arr[j] == val - 1) { has_prev = 1; break; }
        }
        if (!has_prev) {
            int cur = val;
            int cur_len = 1;
            while (1) {
                int has_next = 0;
                for (int j = 0; j < n; j++) {
                    if (arr[j] == cur + 1) { has_next = 1; break; }
                }
                if (has_next) { cur++; cur_len++; }
                else break;
            }
            if (cur_len > max_len) max_len = cur_len;
        }
    }
    printf("%d\\n", max_len);`,
    cpp: `    sort(arr.begin(), arr.end());
    arr.erase(unique(arr.begin(), arr.end()), arr.end());
    int max_len = (arr.empty() ? 0 : 1), cur = 1;
    for (size_t i = 1; i < arr.size(); i++) {
        if (arr[i] == arr[i - 1] + 1) cur++;
        else cur = 1;
        max_len = max(max_len, cur);
    }
    cout << max_len << "\\n";`,
    java: `        Set<Integer> set = new HashSet<>();
        for (int x : arr) set.add(x);
        int maxLen = 0;
        for (int x : set) {
            if (!set.contains(x - 1)) {
                int cur = x;
                int curLen = 1;
                while (set.contains(cur + 1)) { cur++; curLen++; }
                maxLen = Math.max(maxLen, curLen);
            }
        }
        System.out.println(maxLen);`,
    py: `    s = set(arr)
    max_len = 0
    for x in s:
        if x - 1 not in s:
            cur = x
            cur_len = 1
            while cur + 1 in s:
                cur += 1
                cur_len += 1
            max_len = max(max_len, cur_len)
    print(max_len)`
  },
  'search-in-a-rotated-sorted-array': {
    c: `    int ans = -1;
    for (int i = 0; i < n; i++) {
        if (arr[i] == k) { ans = i + 1; break; }
    }
    printf("%d\\n", ans);`,
    cpp: `    int ans = -1;
    for (int i = 0; i < n; i++) {
        if (arr[i] == k) { ans = i + 1; break; }
    }
    cout << ans << "\\n";`,
    java: `        int ans = -1;
        for (int i = 0; i < n; i++) {
            if (arr[i] == k) { ans = i + 1; break; }
        }
        System.out.println(ans);`,
    py: `    try:
        print(arr.index(k) + 1)
    except ValueError:
        print(-1)`
  },
  'majority-element': {
    c: `    int ans = -1;
    for (int i = 0; i < n; i++) {
        int cnt = 0;
        for (int j = 0; j < n; j++) {
            if (arr[j] == arr[i]) cnt++;
        }
        if (cnt > n / 2) { ans = arr[i]; break; }
    }
    printf("%d\\n", ans);`,
    cpp: `    int ans = -1;
    for (int i = 0; i < n; i++) {
        int cnt = 0;
        for (int j = 0; j < n; j++) {
            if (arr[j] == arr[i]) cnt++;
        }
        if (cnt > n / 2) { ans = arr[i]; break; }
    }
    cout << ans << "\\n";`,
    java: `        int ans = -1;
        for (int i = 0; i < n; i++) {
            int cnt = 0;
            for (int j = 0; j < n; j++) {
                if (arr[j] == arr[i]) cnt++;
            }
            if (cnt > n / 2) { ans = arr[i]; break; }
        }
        System.out.println(ans);`,
    py: `    from collections import Counter
    c = Counter(arr)
    ans = -1
    for k, v in c.items():
        if v > n // 2:
            ans = k
            break
    print(ans)`
  },
  'count-coins': {
    c: `    int dp[10005];
    for (int i = 1; i <= amount; i++) dp[i] = 100000000;
    dp[0] = 0;
    for (int i = 0; i < n; i++) {
        for (int j = coins[i]; j <= amount; j++) {
            if (dp[j - coins[i]] + 1 < dp[j]) dp[j] = dp[j - coins[i]] + 1;
        }
    }
    printf("%d\\n", dp[amount] >= 100000000 ? -1 : dp[amount]);`,
    cpp: `    vector<int> dp(amount + 1, 1e9);
    dp[0] = 0;
    for (int c : coins) {
        for (int j = c; j <= amount; j++) {
            dp[j] = min(dp[j], dp[j - c] + 1);
        }
    }
    cout << (dp[amount] >= 1e9 ? -1 : dp[amount]) << "\\n";`,
    java: `        int[] dp = new int[amount + 1];
        Arrays.fill(dp, 100000000);
        dp[0] = 0;
        for (int c : coins) {
            for (int j = c; j <= amount; j++) {
                dp[j] = Math.min(dp[j], dp[j - c] + 1);
            }
        }
        System.out.println(dp[amount] >= 100000000 ? -1 : dp[amount]);`,
    py: `    dp = [float('inf')] * (amount + 1)
    dp[0] = 0
    for c in coins:
        for j in range(c, amount + 1):
            dp[j] = min(dp[j], dp[j - c] + 1)
    print(dp[amount] if dp[amount] != float('inf') else -1)`
  },
  'longest-increasing-sequence': {
    c: `    int max_len = 1, cur_len = 1;
    for (int i = 1; i < n; i++) {
        if (arr[i] > arr[i - 1]) cur_len++;
        else cur_len = 1;
        if (cur_len > max_len) max_len = cur_len;
    }
    printf("%d\\n", max_len);`,
    cpp: `    int max_len = 1, cur_len = 1;
    for (int i = 1; i < n; i++) {
        if (arr[i] > arr[i - 1]) cur_len++;
        else cur_len = 1;
        max_len = max(max_len, cur_len);
    }
    cout << max_len << "\\n";`,
    java: `        int maxLen = 1, curLen = 1;
        for (int i = 1; i < n; i++) {
            if (arr[i] > arr[i - 1]) curLen++;
            else curLen = 1;
            maxLen = Math.max(maxLen, curLen);
        }
        System.out.println(maxLen);`,
    py: `    max_len = cur = 1
    for i in range(1, n):
        if arr[i] > arr[i - 1]:
            cur += 1
        else:
            cur = 1
        max_len = max(max_len, cur)
    print(max_len)`
  },
  'compare-strings': {
    c: '    printf("%s\\n", strcmp(s, t) == 0 ? "YES" : "NO");',
    cpp: '    cout << (s == t ? "YES" : "NO") << "\\n";',
    java: '        System.out.println(s.equals(t) ? "YES" : "NO");',
    py: '    print("YES" if s == t else "NO")'
  },
  'maximum-array-sum': {
    c: `    int dp[10005] = {0};
    dp[0] = 1;
    for (int i = 0; i < n; i++) {
        for (int j = w; j >= arr[i]; j--) {
            if (dp[j - arr[i]]) dp[j] = 1;
        }
    }
    for (int j = w; j >= 0; j--) {
        if (dp[j]) { printf("%d\\n", j); break; }
    }`,
    cpp: `    vector<int> dp(w + 1, 0);
    dp[0] = 1;
    for (int x : arr) {
        for (int j = w; j >= x; j--) {
            if (dp[j - x]) dp[j] = 1;
        }
    }
    for (int j = w; j >= 0; j--) {
        if (dp[j]) { cout << j << "\\n"; break; }
    }`,
    java: `        boolean[] dp = new boolean[w + 1];
        dp[0] = true;
        for (int x : arr) {
            for (int j = w; j >= x; j--) {
                if (dp[j - x]) dp[j] = true;
            }
        }
        for (int j = w; j >= 0; j--) {
            if (dp[j]) { System.out.println(j); break; }
        }`,
    py: `    dp = [False] * (w + 1)
    dp[0] = True
    for x in arr:
        for j in range(w, x - 1, -1):
            if dp[j - x]:
                dp[j] = True
    for j in range(w, -1, -1):
        if dp[j]:
            print(j)
            break`
  },
  'common-characters': {
    c: `    int s1[256] = {0}, s2[256] = {0};
    for (int i = 0; s[i]; i++) s1[(unsigned char)s[i]] = 1;
    for (int i = 0; t[i]; i++) s2[(unsigned char)t[i]] = 1;
    int common = 0;
    for (int i = 0; i < 256; i++) {
        if (s1[i] && s2[i]) common++;
    }
    printf("%d\\n", common);`,
    cpp: `    int s1[256] = {0}, s2[256] = {0};
    for (char ch : s) s1[(unsigned char)ch] = 1;
    for (char ch : t) s2[(unsigned char)ch] = 1;
    int common = 0;
    for (int i = 0; i < 256; i++) if (s1[i] && s2[i]) common++;
    cout << common << "\\n";`,
    java: `        Set<Character> set1 = new HashSet<>();
        Set<Character> set2 = new HashSet<>();
        for (char ch : s.toCharArray()) set1.add(ch);
        for (char ch : t.toCharArray()) set2.add(ch);
        set1.retainAll(set2);
        System.out.println(set1.size());`,
    py: `    print(len(set(s) & set(t)))`
  },
  'count-positive-numbers': {
    c: `    int cnt = 0;
    for (int i = 0; i < n; i++) if (arr[i] > 0) cnt++;
    printf("%d\\n", cnt);`,
    cpp: `    int cnt = 0;
    for (int x : arr) if (x > 0) cnt++;
    cout << cnt << "\\n";`,
    java: `        int cnt = 0;
        for (int x : arr) if (x > 0) cnt++;
        System.out.println(cnt);`,
    py: `    print(sum(1 for x in arr if x > 0))`
  },
  'longest-palindromic-substring': {
    c: `    int len = strlen(s);
    int best_start = 0, best_len = 1;
    for (int i = 0; i < len; i++) {
        for (int j = i; j < len; j++) {
            int cur_len = j - i + 1;
            int is_pal = 1;
            for (int k = 0; k < cur_len / 2; k++) {
                if (s[i + k] != s[j - k]) { is_pal = 0; break; }
            }
            if (is_pal && cur_len > best_len) {
                best_len = cur_len;
                best_start = i;
            }
        }
    }
    for (int i = 0; i < best_len; i++) putchar(s[best_start + i]);
    putchar('\\n');`,
    cpp: `    int n = s.size();
    string best = s.substr(0, 1);
    for (int i = 0; i < n; i++) {
        for (int j = i; j < n; j++) {
            int len = j - i + 1;
            bool ok = true;
            for (int k = 0; k < len / 2; k++) {
                if (s[i + k] != s[j - k]) { ok = false; break; }
            }
            if (ok && len > (int)best.size()) {
                best = s.substr(i, len);
            }
        }
    }
    cout << best << "\\n";`,
    java: `        int n = s.length();
        String best = s.substring(0, 1);
        for (int i = 0; i < n; i++) {
            for (int j = i; j < n; j++) {
                int len = j - i + 1;
                boolean ok = true;
                for (int k = 0; k < len / 2; k++) {
                    if (s.charAt(i + k) != s.charAt(j - k)) { ok = false; break; }
                }
                if (ok && len > best.length()) {
                    best = s.substring(i, j + 1);
                }
            }
        }
        System.out.println(best);`,
    py: `    best = s[0]
    for i in range(len(s)):
        for j in range(i, len(s)):
            sub = s[i:j+1]
            if sub == sub[::-1] and len(sub) > len(best):
                best = sub
    print(best)`
  },
  'second-smallest-number': {
    c: `    int min1 = 2000000000, min2 = 2000000000;
    for (int i = 0; i < n; i++) {
        if (arr[i] < min1) {
            min2 = min1;
            min1 = arr[i];
        } else if (arr[i] < min2 && arr[i] != min1) {
            min2 = arr[i];
        }
    }
    printf("%d\\n", min2);`,
    cpp: `    sort(arr.begin(), arr.end());
    cout << arr[1] << "\\n";`,
    java: `        Arrays.sort(arr);
        System.out.println(arr[1]);`,
    py: `    arr.sort()
    print(arr[1])`
  },
  'maximum-difference': {
    c: `    int max_diff = -1;
    int min_so_far = arr[0];
    for (int i = 1; i < n; i++) {
        int diff = arr[i] - min_so_far;
        if (diff > max_diff && diff > 0) max_diff = diff;
        if (arr[i] < min_so_far) min_so_far = arr[i];
    }
    printf("%d\\n", max_diff);`,
    cpp: `    int max_diff = -1;
    int min_so_far = arr[0];
    for (int i = 1; i < n; i++) {
        int diff = arr[i] - min_so_far;
        if (diff > max_diff && diff > 0) max_diff = diff;
        min_so_far = min(min_so_far, arr[i]);
    }
    cout << max_diff << "\\n";`,
    java: `        int maxDiff = -1;
        int minSoFar = arr[0];
        for (int i = 1; i < n; i++) {
            int diff = arr[i] - minSoFar;
            if (diff > maxDiff && diff > 0) maxDiff = diff;
            minSoFar = Math.min(minSoFar, arr[i]);
        }
        System.out.println(maxDiff);`,
    py: `    max_diff = -1
    min_so_far = arr[0]
    for x in arr[1:]:
        diff = x - min_so_far
        if diff > max_diff and diff > 0:
            max_diff = diff
        min_so_far = min(min_so_far, x)
    print(max_diff)`
  },
  'sort-by-frequency': {
    c: `    int freq[1005];
    for (int i = 0; i < n; i++) {
        int cnt = 0;
        for (int j = 0; j < n; j++) {
            if (arr[j] == arr[i]) cnt++;
        }
        freq[i] = cnt;
    }
    for (int i = 0; i < n; i++) {
        for (int j = i + 1; j < n; j++) {
            if (freq[i] < freq[j] || (freq[i] == freq[j] && arr[i] > arr[j])) {
                int tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
                tmp = freq[i]; freq[i] = freq[j]; freq[j] = tmp;
            }
        }
    }
    for (int i = 0; i < n; i++) {
        printf("%d%s", arr[i], (i + 1 == n ? "" : " "));
    }
    printf("\\n");`,
    cpp: `    vector<int> freq(n);
    for (int i = 0; i < n; i++) {
        freq[i] = count(arr.begin(), arr.end(), arr[i]);
    }
    vector<pair<int, int>> items(n);
    for (int i = 0; i < n; i++) items[i] = {freq[i], arr[i]};
    sort(items.begin(), items.end(), [](const pair<int, int>& a, const pair<int, int>& b) {
        if (a.first != b.first) return a.first > b.first;
        return a.second < b.second;
    });
    for (int i = 0; i < n; i++) {
        cout << items[i].second << (i + 1 == n ? "" : " ");
    }
    cout << "\\n";`,
    java: `        Map<Integer, Integer> freq = new HashMap<>();
        for (int x : arr) freq.put(x, freq.getOrDefault(x, 0) + 1);
        List<Integer> list = new ArrayList<>();
        for (int x : arr) list.add(x);
        list.sort((a, b) -> {
            int fa = freq.get(a), fb = freq.get(b);
            if (fa != fb) return Integer.compare(fb, fa);
            return Integer.compare(a, b);
        });
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < n; i++) {
            if (i > 0) sb.append(" ");
            sb.append(list.get(i));
        }
        System.out.println(sb.toString());`,
    py: `    from collections import Counter
    c = Counter(arr)
    arr.sort(key=lambda x: (-c[x], x))
    print(" ".join(str(x) for x in arr))`
  },
  'longest-common-prefix': {
    c: `    char prefix[105];
    strcpy(prefix, words[0]);
    for (int i = 1; i < n; i++) {
        int j = 0;
        while (prefix[j] && words[i][j] && prefix[j] == words[i][j]) {
            j++;
        }
        prefix[j] = '\\0';
    }
    printf("%s\\n", prefix);`,
    cpp: `    string prefix = words[0];
    for (int i = 1; i < n; i++) {
        int j = 0;
        while (j < (int)prefix.size() && j < (int)words[i].size() && prefix[j] == words[i][j]) {
            j++;
        }
        prefix = prefix.substr(0, j);
    }
    cout << prefix << "\\n";`,
    java: `        String prefix = words[0];
        for (int i = 1; i < n; i++) {
            while (!words[i].startsWith(prefix)) {
                prefix = prefix.substring(0, prefix.length() - 1);
                if (prefix.isEmpty()) break;
            }
        }
        System.out.println(prefix);`,
    py: `    prefix = words[0]
    for w in words[1:]:
        while not w.startswith(prefix):
            prefix = prefix[:-1]
            if not prefix:
                break
    print(prefix)`
  },
  'minimum-jumps': {
    c: `    if (n <= 1) { printf("0\\n"); return 0; }
    if (arr[0] == 0) { printf("-1\\n"); return 0; }
    int max_reach = arr[0], steps = arr[0], jumps = 1;
    for (int i = 1; i < n; i++) {
        if (i == n - 1) { printf("%d\\n", jumps); return 0; }
        if (i + arr[i] > max_reach) max_reach = i + arr[i];
        steps--;
        if (steps == 0) {
            jumps++;
            if (i >= max_reach) { printf("-1\\n"); return 0; }
            steps = max_reach - i;
        }
    }
    printf("-1\\n");`,
    cpp: `    if (n <= 1) { cout << "0\\n"; return 0; }
    if (arr[0] == 0) { cout << "-1\\n"; return 0; }
    int max_reach = arr[0], steps = arr[0], jumps = 1;
    for (int i = 1; i < n; i++) {
        if (i == n - 1) { cout << jumps << "\\n"; return 0; }
        max_reach = max(max_reach, i + arr[i]);
        steps--;
        if (steps == 0) {
            jumps++;
            if (i >= max_reach) { cout << "-1\\n"; return 0; }
            steps = max_reach - i;
        }
    }
    cout << "-1\\n";`,
    java: `        if (n <= 1) { System.out.println(0); return; }
        if (arr[0] == 0) { System.out.println(-1); return; }
        int maxReach = arr[0], steps = arr[0], jumps = 1;
        for (int i = 1; i < n; i++) {
            if (i == n - 1) { System.out.println(jumps); return; }
            maxReach = Math.max(maxReach, i + arr[i]);
            steps--;
            if (steps == 0) {
                jumps++;
                if (i >= maxReach) { System.out.println(-1); return; }
                steps = maxReach - i;
            }
        }
        System.out.println(-1);`,
    py: `    if n <= 1:
        print(0)
        return
    if arr[0] == 0:
        print(-1)
        return
    max_reach = arr[0]
    steps = arr[0]
    jumps = 1
    for i in range(1, n):
        if i == n - 1:
            print(jumps)
            return
        max_reach = max(max_reach, i + arr[i])
        steps -= 1
        if steps == 0:
            jumps += 1
            if i >= max_reach:
                print(-1)
                return
            steps = max_reach - i
    print(-1)`
  }
};

export function generateAllReferenceSolutions() {
  const refDir = path.join(rootDir, 'data/reference');
  if (!fs.existsSync(refDir)) {
    fs.mkdirSync(refDir, { recursive: true });
  }

  const pool = JSON.parse(fs.readFileSync(path.join(rootDir, 'data/problems_pool.json'), 'utf8'));

  for (const p of pool) {
    const id = p.id;
    const itemLogic = LOGIC[id];
    if (!itemLogic) {
      throw new Error(`Missing logic for problem ${id}`);
    }

    const tplDir = path.join(rootDir, 'data/templates', id);
    const pRefDir = path.join(refDir, id);
    if (!fs.existsSync(pRefDir)) {
      fs.mkdirSync(pRefDir, { recursive: true });
    }

    for (const [lang, file] of [['c', 'c.txt'], ['cpp', 'cpp.txt'], ['java', 'java.txt'], ['py', 'py.txt']]) {
      const template = fs.readFileSync(path.join(tplDir, file), 'utf8');
      const logicSnippet = itemLogic[lang];

      let solutionCode = '';
      if (lang === 'py') {
        const marker = '# ===== WRITE YOUR CODE BELOW =====';
        solutionCode = template.replace(marker, `${marker}\n${logicSnippet}`);
      } else {
        const marker = '// ===== WRITE YOUR CODE BELOW =====';
        solutionCode = template.replace(marker, `${marker}\n${logicSnippet}`);
      }

      fs.writeFileSync(path.join(pRefDir, file), solutionCode);
    }
  }

  console.log(`Successfully generated reference solutions for ${pool.length} problems across 4 languages in data/reference/`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  generateAllReferenceSolutions();
}

