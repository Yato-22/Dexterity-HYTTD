// ============================================================================
// GAME DATA & CONSTANTS (Easily swappable with Firebase / WebSocket backend)
// ============================================================================

export const USER_TEAM_ID = "team-3"; // The user's team (e.g. "Viking Byte" or "Team Alpha")

export const ASSET_PATHS = {
  arenaBackground: '/field.png',
  codingBackground: '/field.png',
  dragonHalf: '/dragon.png',
};

export const DRAGON_CONFIG = {
  name: "THE RED DEATH",
  title: "Gargantuan Sovereign of Dragon Mountain",
  maxHp: 200,
  initialHp: 200,
  roarThresholds: [150, 100, 50],
};

// 4 adjustable hit zones as percent-based rectangles over the dragon image
export const DRAGON_HIT_ZONES = {
  head: {
    id: 'head',
    name: 'Head',
    x: 43, // percent left
    y: 16, // percent top
    width: 18, // percent width
    height: 22, // percent height
  },
  chest: {
    id: 'chest',
    name: 'Chest',
    x: 44,
    y: 38,
    width: 20,
    height: 28,
  },
  leftWing: {
    id: 'leftWing',
    name: 'Left Wing',
    x: 4,
    y: 6,
    width: 36,
    height: 48,
  },
  rightWing: {
    id: 'rightWing',
    name: 'Right Wing',
    x: 62,
    y: 6,
    width: 36,
    height: 48,
  },
};

// Weapon to hit-zone mapping
export const WEAPON_ZONE_MAPPING = {
  dagger: ['chest'],
  axe: ['chest'],
  catapult: ['leftWing', 'rightWing'],
  ballista: ['head'],
};

// Animation timings and projectile queue settings
export const ANIMATION_TIMINGS = {
  daggerFlightMs: 450,
  axeFlightMs: 650,
  catapultFlightMs: 900,
  ballistaFlightMs: 380,
  queueStaggerMs: 220,
  maxActiveProjectiles: 6,
  hitFlinchMs: 520,
  zoneFlashMs: 400,
  stuckBoltDurationMs: 4000,
  roarDurationMs: 2400,
  defeatSinkMs: 2500,
};

// Dragon eye coordinates (% of dragon image) for glowing eyes reaction
export const DRAGON_EYES = [
  { x: 53.0, y: 23.5, r: 1.4 },
];

export const WEAPONS = {
  dagger: {
    id: 'dagger',
    name: 'Dagger',
    tier: 'Easy',
    xp: 2,
    damage: 2,
    soundName: 'slash',
    verb: 'sliced',
    critRate: 0.1,
    desc: 'Swift precision strikes on unarmored scales',
  },
  axe: {
    id: 'axe',
    name: 'Battleaxe',
    tier: 'Medium',
    xp: 5,
    damage: 5,
    soundName: 'cleave',
    verb: 'cleaved',
    critRate: 0.15,
    desc: 'Heavy iron blow shattering thick dragon hide',
  },
  catapult: {
    id: 'catapult',
    name: 'Catapult',
    tier: 'Hard',
    xp: 7,
    damage: 7,
    soundName: 'smash',
    verb: 'bombarded',
    critRate: 0.2,
    desc: 'Brimstone boulders targeting dragon wings',
  },
  ballista: {
    id: 'ballista',
    name: 'Ballista',
    tier: 'Extreme',
    xp: 10,
    damage: 10,
    soundName: 'pierce',
    verb: 'impaled',
    critRate: 0.25,
    desc: 'Black iron bolt aimed straight at the heart',
  },
};

export const DRAGON_BODY_PARTS = [
  "the left wing",
  "the armored horn",
  "the fiery maw",
  "the barbed tail",
  "the chest crest",
  "the underbelly scales",
  "the right talons",
  "the neck spine",
];

export const INITIAL_TEAMS = [
  { id: "team-1", name: "Night Raiders", score: 68, hits: 14, avatar: "🐉" },
  { id: "team-2", name: "Ragnarok Devs", score: 55, hits: 11, avatar: "⚡" },
  { id: "team-3", name: "Team Alpha", score: 48, hits: 10, isUserTeam: true, avatar: "⚔️" }, // User team
  { id: "team-4", name: "Viking Byte", score: 44, hits: 9, avatar: "🛡️" },
  { id: "team-5", name: "Iron Forgers", score: 39, hits: 8, avatar: "🔨" },
  { id: "team-6", name: "Storm Chasers", score: 34, hits: 7, avatar: "🌪️" },
  { id: "team-7", name: "Valhalla Knights", score: 30, hits: 6, avatar: "👑" },
  { id: "team-8", name: "Code Slayers", score: 27, hits: 6, avatar: "🔥" },
  { id: "team-9", name: "Glitch Hunters", score: 23, hits: 5, avatar: "🏹" },
  { id: "team-10", name: "Rune Wardens", score: 19, hits: 4, avatar: "📜" },
  { id: "team-11", name: "Binary Berserks", score: 16, hits: 3, avatar: "🪓" },
  { id: "team-12", name: "Drakkar Coders", score: 14, hits: 3, avatar: "⛵" },
  { id: "team-13", name: "Frost Giants", score: 10, hits: 2, avatar: "❄️" },
  { id: "team-14", name: "Asgard Scripters", score: 7, hits: 2, avatar: "✨" },
  { id: "team-15", name: "Odin's Ravens", score: 4, hits: 1, avatar: "🦅" },
];

export const CHALLENGES = {
  dagger: [
    {
      id: "c-dag-1",
      title: "Rune Spell Check",
      desc: "Implement a string anagram validator for Viking elder inscriptions.",
      xp: 2,
      difficulty: "Easy",
      tag: "Strings",
      solvedCount: 18,
    },
    {
      id: "c-dag-2",
      title: "Viking Potion Ratios",
      desc: "Find the two herbs in an array whose potencies sum to the alchemy target.",
      xp: 2,
      difficulty: "Easy",
      tag: "Two-Pointer",
      solvedCount: 14,
    },
    {
      id: "c-dag-3",
      title: "Shield Wall Array",
      desc: "Remove duplicate warrior IDs from a sorted shield formation.",
      xp: 2,
      difficulty: "Easy",
      tag: "Arrays",
      solvedCount: 22,
    },
  ],
  axe: [
    {
      id: "c-axe-1",
      title: "Dragon Flight Trajectory",
      desc: "Compute the max height curve using binary search on rotated wind data.",
      xp: 5,
      difficulty: "Medium",
      tag: "Binary Search",
      solvedCount: 9,
    },
    {
      id: "c-axe-2",
      title: "Armor Plate Optimization",
      desc: "Dynamic programming to select maximum defense gear without exceeding weight.",
      xp: 5,
      difficulty: "Medium",
      tag: "DP / Knapsack",
      solvedCount: 7,
    },
    {
      id: "c-axe-3",
      title: "Catacomb Maze Path",
      desc: "Find the shortest escape tunnel through a 2D dungeon matrix before fire spreads.",
      xp: 5,
      difficulty: "Medium",
      tag: "BFS / Matrix",
      solvedCount: 11,
    },
  ],
  catapult: [
    {
      id: "c-cat-1",
      title: "Brimstone Ballistics",
      desc: "Interval scheduling algorithm to launch maximum boulders without weapon overheating.",
      xp: 7,
      difficulty: "Hard",
      tag: "Greedy Intervals",
      solvedCount: 5,
    },
    {
      id: "c-cat-2",
      title: "Dragon Bone Tree Balance",
      desc: "Rebalance an ancient Red-Black Tree keeping runes within height limits.",
      xp: 7,
      difficulty: "Hard",
      tag: "Balanced BST",
      solvedCount: 3,
    },
    {
      id: "c-cat-3",
      title: "War Horn Broadcast",
      desc: "Find minimum spanning tree connecting all 12 fjord watchtowers with fiber-ropes.",
      xp: 7,
      difficulty: "Hard",
      tag: "Graph / MST",
      solvedCount: 4,
    },
  ],
  ballista: [
    {
      id: "c-bal-1",
      title: "Heart-Seeker Trajectory",
      desc: "Solve maximum network flow through wind vortexes to deliver the piercing bolt.",
      xp: 10,
      difficulty: "Extreme",
      tag: "Max Flow",
      solvedCount: 1,
    },
    {
      id: "c-bal-2",
      title: "Ancient Cipher of Berk",
      desc: "Crack a simulated RSA-Viking modular arithmetic key in polynomial time constraints.",
      xp: 10,
      difficulty: "Extreme",
      tag: "Cryptography",
      solvedCount: 0,
    },
    {
      id: "c-bal-3",
      title: "Temporal Firestorm Concurrency",
      desc: "Resolve race conditions in a distributed multi-threaded ballista auto-loader.",
      xp: 10,
      difficulty: "Extreme",
      tag: "Concurrency",
      solvedCount: 2,
    },
  ],
};

export const INITIAL_FEED = [
  {
    id: "f-1",
    teamName: "Night Raiders",
    weapon: "axe",
    part: "the left wing",
    damage: 5,
    text: "Night Raiders's battleaxe cleaved the left wing for 5!",
    time: "32s ago",
    crit: false,
  },
  {
    id: "f-2",
    teamName: "Team Alpha",
    weapon: "catapult",
    part: "the fiery maw",
    damage: 7,
    text: "Team Alpha's catapult bombarded the fiery maw for 7!",
    time: "24s ago",
    crit: false,
  },
  {
    id: "f-3",
    teamName: "Ragnarok Devs",
    weapon: "dagger",
    part: "the chest crest",
    damage: 2,
    text: "Ragnarok Devs's dagger sliced the chest crest for 2!",
    time: "18s ago",
    crit: false,
  },
  {
    id: "f-4",
    teamName: "Viking Byte",
    weapon: "ballista",
    part: "the neck spine",
    damage: 10,
    text: "Viking Byte's ballista impaled the neck spine for 10! CRITICAL STRIKE!",
    time: "11s ago",
    crit: true,
  },
  {
    id: "f-5",
    teamName: "Night Raiders",
    weapon: "dagger",
    part: "the barbed tail",
    damage: 2,
    text: "Night Raiders's dagger sliced the barbed tail for 2!",
    time: "6s ago",
    crit: false,
  },
  {
    id: "f-6",
    teamName: "Iron Forgers",
    weapon: "axe",
    part: "the underbelly scales",
    damage: 5,
    text: "Iron Forgers's battleaxe cleaved the underbelly scales for 5!",
    time: "Just now",
    crit: false,
  },
];

