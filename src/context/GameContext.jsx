import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import {
  DRAGON_CONFIG,
  WEAPONS,
  DRAGON_BODY_PARTS,
  WEAPON_ZONE_MAPPING,
  ANIMATION_TIMINGS,
} from '../data/gameData';
import { computeRankings } from '../utils/rankings';

const GameContext = createContext(null);

const STORAGE_KEY_TOKEN = 'techflix_v3_token';
const STORAGE_KEY_TEAM = 'techflix_v3_team';
const STORAGE_KEY_CODE_PREFIX = 'techflix_v3_code';
const STORAGE_KEY_INVENTORY = 'techflix_v3_inventory';

export function GameProvider({ children }) {
  // Authentication State
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_TOKEN) || null;
    } catch {
      return null;
    }
  });

  const [userTeam, setUserTeam] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TEAM);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Dragon State (Live from single doc: public/state)
  const [hp, setHp] = useState(DRAGON_CONFIG.maxHp);
  const [maxHp, setMaxHp] = useState(DRAGON_CONFIG.maxHp);
  const [dragonStatus, setDragonStatus] = useState('waiting'); // 'waiting' | 'live' | 'defeated' | 'paused'
  const [winnerTeamId, setWinnerTeamId] = useState(null);
  const [winnerTeamName, setWinnerTeamName] = useState(null);

  // Teams & Leaderboard State (Live from public/state.teams)
  const [teams, setTeams] = useState([]);

  // Feed State (Live from public/state.feed, latest 4)
  const [feed, setFeed] = useState([]);

  // Runner Health & Pause State
  const [runnerOk, setRunnerOk] = useState(true);
  const [isReconnecting, setIsReconnecting] = useState(false);

  // Team Board & Problem statements (server-only problem pool)
  const [board, setBoard] = useState({
    dagger: [],
    axe: [],
    catapult: [],
    ballista: [],
  });
  const [boardProblems, setBoardProblems] = useState({});
  const [refreshToken, setRefreshToken] = useState(true);
  const [solvedProblems, setSolvedProblems] = useState([]);

  // Weapon Inventory
  const [inventory, setInventory] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_INVENTORY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return { dagger: 2, axe: 1, catapult: 0, ballista: 0 };
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_INVENTORY, JSON.stringify(inventory));
    } catch {}
  }, [inventory]);

  // Visual effects state
  const [soundMuted, setSoundMuted] = useState(false);
  const [isHit, setIsHit] = useState(false);
  const [floatingDamages, setFloatingDamages] = useState([]);
  const [sparks, setSparks] = useState([]);
  const [isScreenShaking, setIsScreenShaking] = useState(false);
  const [isRoaring, setIsRoaring] = useState(false);

  // Weapon firing & animation state
  const [pendingFireEvents, setPendingFireEvents] = useState([]);
  const [activeFlashZone, setActiveFlashZone] = useState(null);
  const [stuckBolts, setStuckBolts] = useState([]);
  const [recoilingStation, setRecoilingStation] = useState(null);

  const triggeredRoarsRef = useRef(new Set());
  const knownFeedIdsRef = useRef(new Set());
  const initialFeedLoadedRef = useRef(false);

  // Recoil station trigger
  const triggerStationRecoil = useCallback((weaponKey) => {
    setRecoilingStation(weaponKey);
    setTimeout(() => {
      setRecoilingStation((current) => (current === weaponKey ? null : current));
    }, 450);
  }, []);

  // Spawn floating damage text (exact damage, no crit text)
  const spawnFloatingDamage = useCallback((damage, x = 50, y = 45) => {
    const id = Date.now() + Math.random();
    setFloatingDamages((prev) => [
      ...prev.slice(-6),
      { id, damage, x, y },
    ]);
    setTimeout(() => {
      setFloatingDamages((prev) => prev.filter((d) => d.id !== id));
    }, 900);
  }, []);

  // Spawn spark burst
  const spawnSparkBurst = useCallback((x = 50, y = 45) => {
    const count = 9;
    const newSparks = Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * 2 * Math.PI + Math.random() * 0.5;
      const speed = Math.random() * 40 + 20;
      return {
        id: Date.now() + i + Math.random(),
        x,
        y,
        dx: Math.cos(angle) * speed,
        dy: Math.sin(angle) * speed,
      };
    });
    setSparks((prev) => [...prev.slice(-12), ...newSparks]);
    setTimeout(() => {
      setSparks((prev) => prev.filter((s) => !newSparks.some((ns) => ns.id === s.id)));
    }, 600);
  }, []);

  // Projectile impact
  const onProjectileImpact = useCallback(
    (event, coords = null) => {
      if (!event) return;

      setIsHit(true);
      setTimeout(() => setIsHit(false), ANIMATION_TIMINGS.hitFlinchMs || 520);

      setActiveFlashZone({ zone: event.targetZone, id: Date.now() });
      setTimeout(() => setActiveFlashZone(null), ANIMATION_TIMINGS.zoneFlashMs || 400);

      if (event.weaponKey === 'ballista' && event.targetZone === 'head') {
        const boltId = 'bolt-' + Date.now() + Math.random();
        const boltX = coords?.x ? Math.max(46, Math.min(58, coords.x)) : 52;
        const boltY = coords?.y ? Math.max(22, Math.min(32, coords.y)) : 27;
        const boltAngle = Math.floor(Math.random() * 24 - 12) + 25;

        setStuckBolts((prev) => [
          ...prev.slice(-3),
          { id: boltId, x: boltX, y: boltY, angle: boltAngle },
        ]);
        setTimeout(() => {
          setStuckBolts((prev) => prev.filter((b) => b.id !== boltId));
        }, ANIMATION_TIMINGS.stuckBoltDurationMs || 4000);
      }

      const impactX = coords?.x || 50;
      const impactY = coords?.y || 45;

      spawnFloatingDamage(event.actualDamage, impactX, impactY);
      spawnSparkBurst(impactX, impactY);
    },
    [spawnFloatingDamage, spawnSparkBurst]
  );

  // Online / offline reconnect detection
  useEffect(() => {
    const handleOnline = () => setIsReconnecting(false);
    const handleOffline = () => setIsReconnecting(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // =========================================================================
  // 1. SINGLE FIRESTORE LISTENER: public/state
  // =========================================================================
  useEffect(() => {
    if (!db) return;

    const unsub = onSnapshot(
      doc(db, 'public', 'state'),
      (snapshot) => {
        setIsReconnecting(false);
        if (!snapshot.exists()) return;

        const data = snapshot.data();
        const dragonData = data.dragon || {};
        const newHp = typeof dragonData.hp === 'number' ? dragonData.hp : 100;
        const newMaxHp = typeof dragonData.maxHp === 'number' ? dragonData.maxHp : 100;

        setHp((prevHp) => {
          const roarThresholds = [
            Math.floor(newMaxHp * 0.75),
            Math.floor(newMaxHp * 0.5),
            Math.floor(newMaxHp * 0.25),
          ];
          roarThresholds.forEach((th) => {
            if (prevHp > th && newHp <= th && !triggeredRoarsRef.current.has(th)) {
              triggeredRoarsRef.current.add(th);
              setIsScreenShaking(true);
              setTimeout(() => setIsScreenShaking(false), 700);
              setIsRoaring(true);
              setTimeout(() => setIsRoaring(false), 2400);
            }
          });
          return newHp;
        });

        setMaxHp(newMaxHp);
        setDragonStatus(dragonData.status || 'waiting');
        if (dragonData.winnerTeamId) setWinnerTeamId(dragonData.winnerTeamId);
        if (dragonData.winnerTeamName) setWinnerTeamName(dragonData.winnerTeamName);

        // Compact teams list
        if (Array.isArray(data.teams)) {
          setTeams(data.teams);
        }

        // Runner health status
        if (typeof data.runnerOk === 'boolean') {
          setRunnerOk(data.runnerOk);
        }

        // Live Feed (latest 4)
        const rawFeed = Array.isArray(data.feed) ? data.feed : [];
        const formattedFeed = rawFeed.map((item) => ({
          id: item.id || `feed_${Date.now()}`,
          teamName: item.teamName || 'Viking Clan',
          weapon: item.weapon || 'axe',
          verb: WEAPONS[item.weapon]?.verb || 'struck',
          part: 'hide',
          damage: item.damage || 5,
          timestamp: item.createdAt ? new Date(item.createdAt).getTime() : Date.now(),
        }));
        setFeed(formattedFeed);

        // Trigger projectile animations on new feed entries
        if (initialFeedLoadedRef.current) {
          rawFeed.forEach((item) => {
            if (item.id && !knownFeedIdsRef.current.has(item.id)) {
              knownFeedIdsRef.current.add(item.id);
              const weaponKey = item.weapon || 'axe';
              triggerStationRecoil(weaponKey);

              const candidateZones = WEAPON_ZONE_MAPPING[weaponKey] || ['chest'];
              const targetZone = candidateZones[Math.floor(Math.random() * candidateZones.length)];
              const fireEvent = {
                id: 'fire-feed-' + item.id + '-' + Date.now(),
                weaponKey,
                targetZone,
                actualDamage: item.damage || WEAPONS[weaponKey]?.damage || 5,
                actingTeam: { name: item.teamName || 'Viking' },
                teamId: 'live',
                weaponVerb: WEAPONS[weaponKey]?.verb || 'struck',
                targetPart: 'hide',
                customFeedText: null,
                timestamp: Date.now(),
              };
              setPendingFireEvents((prev) => [...prev.slice(-10), fireEvent]);
            }
          });
        } else {
          rawFeed.forEach((item) => {
            if (item.id) knownFeedIdsRef.current.add(item.id);
          });
          initialFeedLoadedRef.current = true;
        }
      },
      (err) => {
        console.error('Firestore public/state listener error:', err);
        setIsReconnecting(true);
      }
    );

    return () => unsub();
  }, [triggerStationRecoil]);

  // =========================================================================
  // 2. PLAYER'S OWN TEAM DOCUMENT LISTENER: teams/{teamId}
  // =========================================================================
  useEffect(() => {
    if (!db || !userTeam?.id) return;

    const unsub = onSnapshot(
      doc(db, 'teams', userTeam.id),
      (snapshot) => {
        if (!snapshot.exists()) return;
        const data = snapshot.data();

        if (data.board) {
          setBoard(data.board);
        }
        if (data.refreshToken !== undefined) {
          setRefreshToken(data.refreshToken);
        }
        if (Array.isArray(data.solvedProblemIds)) {
          setSolvedProblems(data.solvedProblemIds);
        }

        // Sync userTeam properties
        setUserTeam((prev) => ({
          ...prev,
          name: data.name || prev?.name,
          totalDamage: data.totalDamage || 0,
          solvedProblemIds: data.solvedProblemIds || [],
          refreshToken: data.refreshToken ?? true,
          board: data.board || prev?.board,
        }));
      },
      (err) => {
        console.error('Firestore team listener error:', err);
      }
    );

    return () => unsub();
  }, [userTeam?.id]);

  // =========================================================================
  // 3. FETCH FULL PROBLEM STATEMENTS FOR ACTIVE BOARD
  // =========================================================================
  const fetchBoardDetails = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/board', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.board) {
          const dict = {};
          for (const list of Object.values(data.board)) {
            list.forEach((p) => {
              dict[p.id] = p;
            });
          }
          setBoardProblems(dict);
        }
        if (data.rawBoard) {
          setBoard(data.rawBoard);
        }
        if (data.refreshToken !== undefined) {
          setRefreshToken(data.refreshToken);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch board details:', err.message);
    }
  }, [token]);

  useEffect(() => {
    fetchBoardDetails();
  }, [fetchBoardDetails, board.dagger?.join(',')]);

  // =========================================================================
  // 4. REFRESH A TIER (POST /api/refresh)
  // =========================================================================
  const refreshTier = useCallback(
    async (tier) => {
      if (!token) throw new Error('You must be logged in to refresh.');
      const res = await fetch('/api/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ tier }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Refresh failed');
      }

      setRefreshToken(false);
      if (data.board) {
        setBoard(data.board);
      }
      await fetchBoardDetails();
      return data;
    },
    [token, fetchBoardDetails]
  );

  // =========================================================================
  // 5. LOGIN & LOGOUT
  // =========================================================================
  const login = useCallback(async (loginPayload) => {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginPayload),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Login failed');
    }

    setToken(data.token);
    setUserTeam(data.team);
    localStorage.setItem(STORAGE_KEY_TOKEN, data.token);
    localStorage.setItem(STORAGE_KEY_TEAM, JSON.stringify(data.team));
    return data;
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUserTeam(null);
    localStorage.removeItem(STORAGE_KEY_TOKEN);
    localStorage.removeItem(STORAGE_KEY_TEAM);
  }, []);

  // =========================================================================
  // 6. CODE PERSISTENCE: Keyed by team + member + problem + language
  // =========================================================================
  const getStorageKey = useCallback(
    (problemId, language) => {
      const tId = userTeam?.id || 'anon';
      const mName = userTeam?.memberName ? userTeam.memberName.toLowerCase().replace(/\s+/g, '_') : 'guest';
      return `${STORAGE_KEY_CODE_PREFIX}_${tId}_${mName}_${problemId}_${language}`;
    },
    [userTeam?.id, userTeam?.memberName]
  );

  const saveUserCode = useCallback(
    (problemId, language, code) => {
      try {
        const key = getStorageKey(problemId, language);
        localStorage.setItem(key, code);
      } catch {}
    },
    [getStorageKey]
  );

  const getUserCode = useCallback(
    (problemId, language, defaultStarter = '') => {
      try {
        const key = getStorageKey(problemId, language);
        const saved = localStorage.getItem(key);
        if (saved !== null) return saved;
      } catch {}
      return defaultStarter;
    },
    [getStorageKey]
  );

  // Inventory firing
  const dealDamage = useCallback(
    (teamId, weaponKey = 'axe') => {
      if (hp <= 0) return { success: false, reason: 'Dragon defeated' };

      const available = inventory[weaponKey] || 0;
      if (available <= 0) {
        return { success: false, reason: 'Out of ammo' };
      }

      setInventory((prev) => ({
        ...prev,
        [weaponKey]: Math.max(0, (prev[weaponKey] || 0) - 1),
      }));

      const weapon = WEAPONS[weaponKey] || WEAPONS.axe;
      const actualDamage = weapon.damage;
      const targetPart = DRAGON_BODY_PARTS[Math.floor(Math.random() * DRAGON_BODY_PARTS.length)];
      const actingTeam = userTeam || { name: 'Viking' };

      const candidateZones = WEAPON_ZONE_MAPPING[weaponKey] || ['chest'];
      const targetZone = candidateZones[Math.floor(Math.random() * candidateZones.length)];

      const fireEvent = {
        id: 'fire-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
        weaponKey,
        targetZone,
        actualDamage,
        actingTeam,
        teamId: userTeam?.id || teamId,
        weaponVerb: weapon.verb,
        targetPart,
        customFeedText: null,
        timestamp: Date.now(),
      };

      setPendingFireEvents((prev) => [...prev.slice(-10), fireEvent]);
      return { success: true };
    },
    [hp, inventory, userTeam]
  );

  // Rankings derived via computeRankings
  const rankedTeams = computeRankings(teams, dragonStatus, winnerTeamId);
  const userTeamRankObj = rankedTeams.find((t) => t.id === userTeam?.id);
  const userTeamRank = userTeamRankObj ? userTeamRankObj.rank : 1;
  const isDefeated = hp <= 0 || dragonStatus === 'defeated';
  const winnerTeam = winnerTeamName || (winnerTeamId && rankedTeams.find((t) => t.id === winnerTeamId)?.name) || null;

  // Active board problems mapped to tiers for ChallengeScroll
  const problemsByWeapon = {
    dagger: (board.dagger || []).map((id) => boardProblems[id] || { id, title: id, xp: 2, weapon: 'dagger', task: '' }),
    axe: (board.axe || []).map((id) => boardProblems[id] || { id, title: id, xp: 5, weapon: 'axe', task: '' }),
    catapult: (board.catapult || []).map((id) => boardProblems[id] || { id, title: id, xp: 7, weapon: 'catapult', task: '' }),
    ballista: (board.ballista || []).map((id) => boardProblems[id] || { id, title: id, xp: 10, weapon: 'ballista', task: '' }),
  };

  const value = {
    // Session & User
    token,
    userTeam: userTeam || { id: 'viking', name: 'Viking Clan', memberName: 'Warrior' },
    userTeamRank,
    isLoggedIn: Boolean(token && userTeam),
    login,
    logout,

    // Dragon
    hp,
    maxHp,
    dragonStatus,
    dragonName: 'THE RED DEATH',
    isDefeated,
    winnerTeam,
    isPaused: dragonStatus === 'paused',

    // Reliability
    runnerOk,
    isReconnecting,

    // Board & Refresh
    board,
    boardProblems,
    problemsByWeapon,
    refreshToken,
    refreshTier,
    solvedProblems,

    // Battlefield
    teams: rankedTeams,
    sortedTeams: rankedTeams,
    feed,
    inventory,
    setInventory,
    dealDamage,

    // Audio & Visual
    soundMuted,
    setSoundMuted,
    isHit,
    floatingDamages,
    sparks,
    isScreenShaking,
    isRoaring,

    // Animation State
    activeFlashZone,
    stuckBolts,
    pendingFireEvents,
    recoilingStation,
    triggerStationRecoil,
    onProjectileImpact,

    // Code
    saveUserCode,
    getUserCode,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within a GameProvider');
  return context;
}
