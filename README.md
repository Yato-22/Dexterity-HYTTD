# 🐉 TechFlix: How to Train Your Dragon

An interactive Viking battle and competitive coding platform built for college tech events and hackathons. Teams compete in real time to defeat **The Red Death** by solving algorithmic coding challenges across various weapon tiers.

Designed desktop-first for **1920×1080 projectors** and laptops with a compact layout that fits on a single screen with **no page scrolling**, plus an integrated LeetCode-style code execution environment.

---

## 🚀 How to Open and Run the Website

### 1. View Right Now (Already Running)
The development server is currently live. Open your browser and navigate to:
- **Battle Arena:** [http://localhost:3000](http://localhost:3000)
- **Sample Coding Screen:** [http://localhost:3000/problem/two-sum](http://localhost:3000/problem/two-sum)

---

### 2. Running from Terminal

Open your terminal in the project directory (`/home/yato/Yato/Dexterity-HYTTD`):

#### Method A: If Node.js / npm is installed in your system PATH
```bash
# Start the development server
npm run dev
```

#### Method B: Using the bundled project Node binary
If `node` or `npm` is not in your global system PATH:
```bash
# Run with bundled Node environment
export PATH=$PWD/.node/bin:$PATH
npm run dev
```

The terminal will display:
```
  VITE v5.4.21  ready in ~300 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: http://<your-ip>:3000/
```
Open **[http://localhost:3000](http://localhost:3000)** in any modern browser (Chrome, Brave, Firefox, Edge).

---

## 🧭 Application Structure & Routing

The app features full client-side routing via **React Router** with synchronized global state and local storage persistence:

| Route | View | Description |
| :--- | :--- | :--- |
| `/` | **Battle Arena** | Live battle against **The Red Death** with HP bar, Top 10 leaderboard, battle log, and the Tome of Trials. |
| `/problem/:id` | **Coding Screen** | Full-fledged coding workspace with Monaco Editor, test cases, custom input, output comparisons, problem statements, and live dragon HP bar. |

---

## 🎮 Interactive Controls & Hotkeys (Arena)

| Control / Action | How to Trigger | Description |
| :--- | :--- | :--- |
| **Simulate Hit** | Press <kbd>S</kbd> | Deals battleaxe damage (-5 HP), triggers red flash recoil and spark burst. |
| **Reset Dragon** | Press <kbd>R</kbd> | Resets dragon HP to 100, clears roar phases, and resets team scores. |
| **Pause / Resume** | Press <kbd>P</kbd> | Toggles the automatic 8–12 second battle simulation timer. |
| **Manual Strike** | Click on the Dragon | Deals instant damage from your warband (`Team Alpha`). |
| **Solve Trials** | Click on any problem card | Navigates to `/problem/:id` to solve the trial in code. |
| **Toggle Audio** | Click the Horn icon (Top Right) | Visual toggle between muted and unmuted icons. |

---

## ⚔️ Page Layout & Screens

### 1. The Battle Arena (`/`)
1. **Top Center (HP Bar):**
   - Carved wooden beam with iron frame showing `"THE RED DEATH"` and dynamic HP.
   - Molten fire/lava fill that smoothly shifts color as HP drops:
     - **Green (`#4CAF50`)** $\rightarrow$ Healthy (> 50%)
     - **Yellow (`#F2C230`)** $\rightarrow$ Wounded (25% – 50%)
     - **Red (`#D93025`)** $\rightarrow$ Frenzied (≤ 25%)
2. **Left Column (~20% screen width):**
   - **Two Parallel Ropes:** Two continuous thick rope strands run from above the screen down through all three panels, with knots above and below each plank, and terminal tassels at the bottom.
   - **Warband Rank Badge:** Displays your team's live standing (`#3`), team name, and XP.
   - **Top 10 Leaderboard:** Hanging broken wooden board showing live standings. Your team is highlighted with a glowing ember mark.
   - **Battle Log (Live Feed):** Hanging wooden plaque displaying the 4 most recent combat actions sliding in as single-line updates.
3. **Center Stage:**
   - Giant dragon (**The Red Death**) with breathing animation and pulsing fiery aura.
   - **Hit Effects:** Red flash filter, directional recoil shake, floating `-DMG` numbers, and particle spark bursts.
   - **Roar Phases:** Screen shake and `"THE RED DEATH ROARS!"` banner trigger at **75%**, **50%**, and **25%** HP.
   - **0 HP Defeat Screen:** Victory plaque celebrating the winning team (`"THE RED DEATH IS SLAIN!"`).
4. **Right Column (Tome of Trials, ~24% screen width):**
   - Clean white `#FFFFFF` surface with dark `#1F1F1F` text, offset shadow, and drilled rope hole.
   - 4 weapon tiers:
     - 🗡️ **Dagger** (Easy, 2 XP)
     - 🪓 **Battleaxe** (Medium, 5 XP)
     - 🎯 **Catapult** (Hard, 7 XP)
     - 🏹 **Ballista** (Extreme, 10 XP)
   - 3 coding problems per weapon tier with difficulty chips, solve status badges (`✓ Solved`), and direct links to the coding screen.

---

### 2. The Coding Screen (`/problem/:id`)
- **Top Bar:** Back button to Arena, live-updating compact Red Death HP bar, event plaque, and mute toggle.
- **Left Column (~58% screen width):**
  - **Header Controls:** Language selector (C, C++, Java, Python 3), Run (sample case 1), Test (all samples), Submit (all hidden cases), Reset Code, and font size adjustment (-/+).
  - **Monaco Code Editor:** Customized Viking charcoal theme (`#1E1A17` background, `#2A231D` line highlight, `#4A3A2A` selection, JetBrains Mono 15px font).
  - **Bottom Test Panel (~30% height):**
    - **Testcase Tab:** Interactive testcase switcher with inputs and expected outputs.
    - **Custom Input Tab:** Freeform `stdin` textarea.
    - **Result Tab:** LeetCode-style verdict display (`Accepted`, `Wrong Answer`, `Runtime Error`, `Compilation Error`, `Time Limit Exceeded`) with diff view and execution time.
  - **Cooldown System:** 5-second cooldown and single in-flight lock on Run/Test/Submit to prevent spam.
- **Right Column (~42% screen width):**
  - **Problem Statement Scroll:** Hanging parchment panel in warm tan `#E8D8BC` with high-contrast text `#2B1B10`, rendered in **Inter 16px**, with constraints, sample cases, and code blocks in **JetBrains Mono 14px**.
  - **Live Standings Board:** Compact Top 5 leaderboard + your team's row pinned below it.

---

## ⚡ Code Execution & Judge Engine

The judge engine (`src/services/judge.js`) provides dual-tier execution:
1. **Remote Execution (Piston API):**
   - Provide an optional Piston instance via `VITE_RUNNER_URL` in `.env` (e.g. `VITE_RUNNER_URL=https://emkc.org/api/v2/piston`).
   - Executes C (GCC), C++ (GCC), Java (OpenJDK), and Python 3.
2. **Zero-Backend In-Browser Fallback (Pyodide):**
   - For Python solutions, if no runner URL is configured, code executes directly inside an isolated browser Web Worker using Pyodide (WebAssembly Python 3).
3. **Output Normalization:**
   - Trims trailing whitespace per line and overall output, normalizes CRLF/LF line endings, and ignores empty trailing lines.
4. **Scoring & Dragon Damage:**
   - When a team's submission achieves **Accepted** on all hidden test cases for the first time, the problem's XP is applied directly as critical damage to The Red Death, logged to the battle feed, and saved to `localStorage`.

---

## 🛠️ Tech Stack & Typography

- **Framework:** React 18 + Vite + React Router DOM v6
- **Editor:** `@monaco-editor/react`
- **State & Persistence:** Shared React Context + `localStorage`
- **Styling:** Tailwind CSS + Procedural CSS/SVG wood and parchment filters
- **Typography:**
  - **Headings & Badges:** [Cinzel](https://fonts.google.com/specimen/Cinzel) (Norse/medieval serif)
  - **Arena Body & Feed:** [Alegreya Sans](https://fonts.google.com/specimen/Alegreya+Sans)
  - **Problem Statement:** [Inter](https://fonts.google.com/specimen/Inter) (16px)
  - **Code & Testcases:** [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono)
