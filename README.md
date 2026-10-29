# 🐉 TechFlix: How to Train Your Dragon (Backend & Full-Stack Battle Arena)

An interactive competitive coding platform and live multiplayer dragon battle built for hackathons, college tech events, and arena coding showdowns. Teams authenticate using Viking team codes, solve algorithmic challenges in C, C++, Java, or Python, and deal real-time damage to slay **The Red Death**.

The platform is designed desktop-first for **1920×1080 projectors** and team laptops, featuring real-time Firestore synchronization, serverless execution via Vercel and Piston, an automated admin control suite, and a dedicated spectator/projector display view.

---

## 🚀 Quick Links & Current URLs

- **Viking Team Login:** [http://localhost:3000/login](http://localhost:3000/login)
- **Main Battle Arena:** [http://localhost:3000/](http://localhost:3000/)
- **Spectator / Projector Display:** [http://localhost:3000/display](http://localhost:3000/display)
- **Organizer Admin Console:** [http://localhost:3000/admin](http://localhost:3000/admin)
- **Interactive Coding Screen:** [http://localhost:3000/problem/two-sum](http://localhost:3000/problem/two-sum)

---

## 🏗️ Architecture Overview

```
                         ┌───────────────────────────────────────────┐
                         │              Client Browser               │
                         │   (React 18 + Vite + Tailwind + Monaco)   │
                         └──────┬──────────────────────┬─────────────┘
                                │                      │
                Read-Only Live  │                      │ REST API Calls
             Firestore Listeners│                      │ (/api/login, /api/run,
                  (onSnapshot)  │                      │  /api/submit, /api/admin/*)
                                ▼                      ▼
             ┌────────────────────────┐      ┌───────────────────────────┐
             │   Firebase Firestore   │      │ Vercel Serverless /api    │
             │                        │      │ (Node.js + Firebase Admin │
             │  • dragon/main         │◄─────┤  + JWT Auth Verification) │
             │  • teams/{teamId}      │      └─────────────┬─────────────┘
             │  • feed/{id}           │                    │
             │  • teamCodes/{code}    │                    │ POST /api/v2/execute
             │  • submissions/{id}    │                    ▼
             │  • problems_private/*  │      ┌───────────────────────────┐
             │  • config/runner       │      │   Piston Code Runner      │
             └────────────────────────┘      │ (C, C++, Java, Python 3)  │
                                             └───────────────────────────┘
```

---

## 🔐 Environment Variables Configuration

Create a `.env.local` file in the project root (`/home/yato/Yato/Dexterity-HYTTD/.env.local`).

> [!CAUTION]
> **Security Rule:** Never commit `.env.local` or include backend secret keys (`FIREBASE_SERVICE_ACCOUNT`, `JWT_SECRET`, `ADMIN_PASSWORD`) in client-side code (`src/` or `public/`).

```env
# ==============================================================================
# SERVER-ONLY SECRETS (Used exclusively by /api serverless functions)
# ==============================================================================
# Complete JSON string of your Firebase Service Account Private Key
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"your-project","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"firebase-adminsdk-...@your-project.iam.gserviceaccount.com"}

# Secret string used to sign and verify team JWT session tokens
JWT_SECRET=super_secret_jwt_passphrase_for_viking_teams_2026

# Password to authenticate organizers accessing /admin and /api/admin/*
ADMIN_PASSWORD=your_viking_admin_password

# ==============================================================================
# CLIENT-SAFE FIREBASE CONFIG (Prefixed with VITE_ for browser read listeners)
# ==============================================================================
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=1234567890
VITE_FIREBASE_APP_ID=1:1234567890:web:abcdef123456
```

---

## 🗄️ Database Schema (Cloud Firestore)

| Collection / Path | Purpose & Access Level | Schema |
| :--- | :--- | :--- |
| `public/state` | **Single source of live contest truth** (Client Read, Server Write) | `{ dragon: { hp, maxHp, status: 'waiting'\|'live'\|'defeated'\|'paused', winnerTeamId, winnerTeamName }, feed: Array(4), teams: Array<{ id, name, totalDamage, lastSolveAt, solvedCount }>, runnerOk: boolean, updatedAt }` |
| `pool/{id}` | Full 32-problem pool statements & starter templates (**Server-Only**) | `{ id, tier, title, difficulty, xp, weapon, story, task, inputFormat, outputFormat, constraints, timeLimitMs, samples, starterCode }` |
| `problems_private/{id}` | Hidden test suite (6 per problem) & time limits (**Server-Only**) | `{ hiddenTests: [{ input: string, expectedOutput: string }], timeLimitMs: number }` |
| `registry/{teamId}` | Clan registry with leader phone & claimed members (**Server-Only**) | `{ teamId, teamName, teamNameLower, leaderPhone, leaderName, member2Name, registeredMembers: string[], createdAt }` |
| `teams/{teamId}` | Active team document (Client Read, Server Write) | `{ name, totalDamage, solvedProblemIds: string[], lastSolveAt, board: { dagger: string[3], axe: string[3], catapult: string[3], ballista: string[3] }, seenIds: string[], refreshToken: boolean, members: string[] }` |
| `acceptedCode/{id}` | Archive of all accepted solutions for dispute review (**Server-Only**) | `{ teamId, teamName, submittingMember, problemId, language, code, firstSolve: boolean, createdAt }` |
| `submissions/{id}` | Audit log of all submission attempts (**Server-Only**) | `{ teamId, teamName, submittingMember, problemId, language, verdict, passed, total, createdAt }` |
| `config/runner` | Dynamic Piston runner configuration (**Server-Only**) | `{ url: string, updatedAt: Timestamp }` |
| `dragon/main` | Legacy compatibility mirror document (Client Read, Server Write) | `{ hp: number, maxHp: number, status, winnerTeamId, winnerTeamName }` |

---

## 🛠️ Verification, Seeding & Load Testing Scripts

| Script | Command | Purpose |
| :--- | :--- | :--- |
| `scripts/verifyPool.js` | `node scripts/verifyPool.js` | Runs both independent reference Python solutions on all 8 test cases across all 32 problems (256 executions total) and verifies 100% agreement. |
| `scripts/seedPool.js` | `node scripts/seedPool.js` | Seeds Firestore `pool` with all 32 public problems, `problems_private` with hidden test cases, and initializes `public/state`. |
| `scripts/system_test.js` | `node scripts/system_test.js` | Automated end-to-end test verifying: 2-member login limit, board stability across reloads, single-use refresh token, isolated team solve state, and tie-break rankings. |
| `scripts/loadtest.js` | `node scripts/loadtest.js` | Simulates 40 concurrent fake teams (`TEST_`) submitting Python, C++, and Java solutions to live `/api/submit` and prints min/avg/p95/max latency stats. |
| `scripts/cleanupTestTeams.js` | `node scripts/cleanupTestTeams.js` | Purges all `TEST_` teams from `registry`, `teams`, `submissions`, and `acceptedCode`, and resets dragon HP to 100. |

---

## ⚙️ Initial Database Seeding

Before running the battle arena for the first time, populate the 32-problem pool and initialize `public/state`:

```bash
# Seed pool (32 problems), problems_private (hidden tests), and public/state
node scripts/seedPool.js

# Verify all 32 problems against dual Python reference solutions
node scripts/verifyPool.js

# Run comprehensive system verification
node scripts/system_test.js
```
```

What `scripts/seed.js` does:
1. Strips hidden test cases from the client bundle (preventing participants from inspecting browser sources).
2. Uploads all 12 problem hidden test suites into Firestore `problems_private/{problemId}` with a `2000ms` (2-second) time limit.
3. Initializes `dragon/main` with `{ hp: 100, maxHp: 100, status: 'waiting', winnerTeamId: null }`.
4. Initializes `config/runner` with `{ url: '' }`.

---

## 💻 Local Development & Testing

### Option A: Standard Development Server (with API Middleware)
The project includes a built-in development middleware in `vite.config.js` that directly mounts and executes `/api/*.js` routes alongside Vite:

```bash
# Start Vite development server on port 3000
npm run dev
```

### Option B: Vercel Local CLI (`vercel dev`)
To test serverless functions identically to the Vercel production edge runtime:

1. Install the Vercel CLI globally (if not already installed):
   ```bash
   npm i -g vercel
   ```
2. Run `vercel dev` inside the project root:
   ```bash
   vercel dev --listen 3000
   ```
   *Follow the one-time interactive prompt to link your Vercel project, or hit enter for local defaults.*

---

## 🏃 Configuring the Code Runner (Piston)

The code execution engine forwards student code to a **Piston server** running standard compiler sandboxes:
- **Languages Supported:**
  - **Python 3:** `language: "python"`, standard execution
  - **C:** `language: "c"`, standard GCC compile & execute
  - **C++:** `language: "c++"`, standard G++ compile & execute
  - **Java:** `language: "java"`, filename `Main.java`, class `Main`
- **Sandbox Limits:** 2 seconds per test, 256 MB memory.

### Setting the Runner URL via the Admin Panel:
1. Open [http://localhost:3000/admin](http://localhost:3000/admin).
2. Enter the `ADMIN_PASSWORD` defined in `.env.local`.
3. In the **Piston Code Runner Engine** card, paste your Piston server URL (e.g., `https://emkc.org/api/v2/piston` or your internal server `http://192.168.1.100:2000`).
4. Click **Test Runner** to execute a live Python ping test.
5. Click **Save Runner URL**. The backend automatically updates `config/runner` in Firestore and caches it for 30 seconds.

---

## 🛡️ Admin Dashboard Features (`/admin`)

- **Battle Control:**
  - **Start Battle:** Transitions `dragon/main` status to `live`. Unlocks submissions for teams.
  - **Pause Battle:** Sets dragon status to `waiting`. Temporarily blocks code submissions with an arena pause message.
  - **Reset Battle:** Customizes max HP (e.g. 100, 200, 500), resets dragon HP to `maxHp`, clears the live battle feed, and sets status back to `waiting`.
- **Import Teams (CSV):**
  - Upload or paste a CSV list with headers:
    ```csv
    teamName,teamCode,members
    Night Furies,VIK-8812,Hiccup & Astrid
    Gronckle Guard,VIK-4421,Fishlegs
    Deadly Nadders,VIK-9904,Snotlout
    ```
  - Automatically provisions team accounts in `teams/{teamId}` and assigns authorization tokens in `teamCodes/{teamCode}`.
- **Export Results (CSV):**
  - One-click export downloading final team standings, total damage dealt, count of solved problems, solved problem IDs, last solve timestamp, and the slain dragon victory attribution.
- **Live Teams & Standings Table:**
  - Real-time Firestore sync displaying all teams, damage dealt, and solved problems.

---

## 📽️ Spectator & Projector Display (`/display`)

Navigate to [http://localhost:3000/display](http://localhost:3000/display) to display the live battle on auditorium screens and projectors:
- **Full Viewport Battle Stage:** Features the animated dragon, breathing flame aura, and live dynamic HP bar.
- **Projector Optimized:** No navigation headers, code editors, or interactive submit buttons.
- **Live Event Effects:** Automatically plays hit recoils, projectile launches, and screen-shake roar alerts when any team scores an accepted solution.
- **Side Panels:** Displays the hanging broken-wood Top 10 Leaderboard and the live sliding combat feed.

---

## 📡 API Reference

All requests and responses use JSON. Authenticated endpoints require the header `Authorization: Bearer <TOKEN>`.

### 1. Team Authentication
- `POST /api/login`
  - **Body:** `{ "code": "VIK-8812" }`
  - **Response:** `{ "token": "JWT_STRING", "team": { "id": "...", "name": "Night Furies", ... } }`

### 2. Code Runner & Test Execution
- `POST /api/run`
  - **Headers:** `Authorization: Bearer <TOKEN>`
  - **Body:** `{ "language": "python", "code": "print(input())", "stdin": "42" }`
  - **Response:** `{ "stdout": "42\n", "stderr": "", "code": 0, "timeMs": 85 }`

### 3. Submission & Attack Transaction
- `POST /api/submit`
  - **Headers:** `Authorization: Bearer <TOKEN>`
  - **Body:** `{ "language": "python", "code": "...", "problemId": "two-sum" }`
  - **Logic:**
    1. Runs all sample and hidden test cases sequentially through the Piston runner.
    2. Stops immediately at the first failing case (`Wrong Answer`, `Time Limit Exceeded`, `Runtime Error`).
    3. If all tests pass and dragon is `live` and the team hasn't solved the problem yet:
       - Runs an **atomic Firestore transaction** reducing dragon HP, adding damage to the team, adding `problemId` to `solvedProblemIds`, logging to `feed`, and checking if HP reaches 0 to declare the winning team.
  - **Response:** `{ "verdict": "Accepted", "passed": 10, "total": 10, "damage": 2 }`

### 4. Admin Management (Protected by `x-admin-password: <ADMIN_PASSWORD>`)
- `POST /api/admin/start` $\rightarrow$ `{ "success": true, "status": "live" }`
- `POST /api/admin/pause` $\rightarrow$ `{ "success": true, "status": "waiting" }`
- `POST /api/admin/reset` $\rightarrow$ `{ "hp": 100 }` (clears feed, resets dragon)
- `GET /api/admin/runner` $\rightarrow$ `{ "url": "https://..." }`
- `POST /api/admin/runner` $\rightarrow$ `{ "action": "save" | "test", "url": "..." }`
- `POST /api/admin/import-teams` $\rightarrow$ `{ "csv": "teamName,teamCode,members\n..." }`
- `GET /api/admin/export` $\rightarrow$ Returns downloadable CSV string.

---

## 🛠️ Management & Seeding Scripts

- `node scripts/seedPool.js`: Seeds the 32 problem statements and hidden test suites into Firestore `pool` and `problems_private`.
- `node scripts/seedRegistry.js`: Seeds default contest teams into `registry` with login phone numbers and member names, ensuring initial 12-problem boards exist.
- `node scripts/deployRules.js`: Deploys Firestore Security Rules via Firebase Rules API, granting read-only access to `public/*`, `dragon/*`, `teams/*`, `feed/*` while blocking access to sensitive collections.
- `node scripts/verifyPool.js`: Runs dual independent Python reference solutions across all 256 test cases to verify problem correctness.
- `node scripts/system_test.js`: Runs end-to-end integration tests (login, board retrieval, runner, submissions, refresh).

---

## 🎮 Arena Controls & Submissions

| Action | Target | Description |
| :--- | :--- | :--- |
| **Solve Challenges** | Tome of Trials Cards | Opens the coding workspace for the selected trial. |
| **Accepted Submissions** | Coding Workspace | Deals deterministic damage equal to the problem XP directly to the dragon. |
| **Inventory Weapon Stations** | Weapon Stations / Stage | Fires crafted weapons unlocked by your warband. |
| **Toggle Audio** | Event Plaque Horn | Mutes or unmutes arena combat audio effects. |

---

## 🛡️ Production Verification Checklist

- [x] All hidden tests stripped from the client bundle (`src/data/problems.js`).
- [x] 12 problem hidden suites securely hosted in Firestore `problems_private`.
- [x] Single atomic Firestore transaction for HP damage, team scores, and winner check.
- [x] Rate limiting on submission and code runner endpoints.
- [x] Piston execution runner dynamically configurable via `/admin` with 30s cache.
- [x] Live Firebase listeners (`onSnapshot`) replace all fake timers on both Arena and Display screens.
- [x] Full build verification (`npm run build`) passing cleanly.

---

**Live Arena Website:** [http://localhost:3000/](http://localhost:3000/)
