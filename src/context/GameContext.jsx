import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import {
  doc,
  onSnapshot,
  collection,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from '../services/firebase';
import {
  DRAGON_CONFIG,
  WEAPONS,
  DRAGON_BODY_PARTS,
  INITIAL_TEAMS,
  INITIAL_FEED,
  USER_TEAM_ID,
  WEAPON_ZONE_MAPPING,
  ANIMATION_TIMINGS,
} from '../data/gameData';
import { PROBLEMS_BY_ID } from '../data/problems';

const GameContext = createContext(null);

const STORAGE_KEY_TOKEN = 'techflix_token';
const STORAGE_KEY_TEAM = 'techflix_team';
const STORAGE_KEY_CODE = 'techflix_hyttd_user_code_v2';
const STORAGE_KEY_INVENTORY = 'techflix_hyttd_inventory_v1';

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

  // Dragon State (Live from Firestore: dragon/main)
  const [hp, setHp] = useState(DRAGON_CONFIG.maxHp);
  const [maxHp, setMaxHp] = useState(DRAGON_CONFIG.maxHp);
  const [dragonStatus, setDragonStatus] = useState('waiting'); // 'waiting' | 'live' | 'defeated'
  const [winnerTeamId, setWinnerTeamId] = useState(null);

  // Teams State (Live from Firestore: teams query)
  const [teams, setTeams] = useState(INITIAL_TEAMS);

  // Feed State (Live from Firestore: feed query)
  const [feed, setFeed] = useState(INITIAL_FEED);

  // Solved problems by current user team
  const solvedProblems = userTeam?.solvedProblemIds || [];

  // Weapon Inventory (User team weapons ready to fire)
  const [inventory, setInventory] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_INVENTORY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return { dagger: 2, axe: 1, catapult: 0, ballista: 0 };
  });

  // Save inventory to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_INVENTORY, JSON.stringify(inventory));
    } catch {}
  }, [inventory]);

  // User code storage: { [problemId_language]: string }
  const [userCode, setUserCode] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CODE);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {};
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CODE, JSON.stringify(userCode));
    } catch {}
  }, [userCode]);

  // Visual effects state
  const [soundMuted, setSoundMuted] = useState(false);
  const [isHit, setIsHit] = useState(false);
  const [floatingDamages, setFloatingDamages] = useState([]);
  const [sparks, setSparks] = useState([]);
  const [isScreenShaking, setIsScreenShaking] = useState(false);
  const [isRoaring, setIsRoaring] = useState(false);

  // Weapon firing state
  const [pendingFireEvents, setPendingFireEvents] = useState([]);
  const [activeFlashZone, setActiveFlashZone] = useState(null);
  const [stuckBolts, setStuckBolts] = useState([]);
  const [recoilingStation, setRecoilingStation] = useState(null);

  const triggeredRoarsRef = useRef(new Set());
  const initialFeedLoadedRef = useRef(false);
  const knownFeedIdsRef = useRef(new Set());

  // Recoil station trigger with auto-reset
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

  // Triggered on projectile arrival / impact at the dragon
  const onProjectileImpact = useCallback(
    (event, coords = null) => {
      if (!event) return;

      // 1. Dragon flinch recoil & red flash
      setIsHit(true);
      setTimeout(() => setIsHit(false), ANIMATION_TIMINGS.hitFlinchMs || 520);

      // 2. Target hit zone flashes
      setActiveFlashZone({ zone: event.targetZone, id: Date.now() });
      setTimeout(() => setActiveFlashZone(null), ANIMATION_TIMINGS.zoneFlashMs || 400);

      // 3. Stuck ballista bolt on head
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

      // 4. Floating damage and sparks at impact point
      const impactX = coords?.x || 50;
      const impactY = coords?.y || 45;

      spawnFloatingDamage(event.actualDamage, impactX, impactY);
      spawnSparkBurst(impactX, impactY);
    },
    [spawnFloatingDamage, spawnSparkBurst]
  );

  // =========================================================================
  // 1. LIVE FIRESTORE LISTENER: dragon/main
  // =========================================================================
  useEffect(() => {
    if (!db) return;

    const unsub = onSnapshot(
      doc(db, 'dragon', 'main'),
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          const newHp = typeof data.hp === 'number' ? data.hp : 100;
          const newMaxHp = typeof data.maxHp === 'number' ? data.maxHp : 100;

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
          setDragonStatus(data.status || 'waiting');
          if (data.winnerTeamId) setWinnerTeamId(data.winnerTeamId);
        }
      },
      (err) => {
        console.error('Firestore dragon/main listener error:', err);
      }
    );

    return () => unsub();
  }, []);

  // =========================================================================
  // 2. LIVE FIRESTORE LISTENER: teams (top 10 ordered by totalDamage)
  // =========================================================================
  useEffect(() => {
    if (!db) return;

    const q = query(collection(db, 'teams'), orderBy('totalDamage', 'desc'), limit(10));
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const loadedTeams = snapshot.docs.map((d, index) => {
          const val = d.data();
          return {
            id: d.id,
            name: val.name || d.id,
            score: val.totalDamage || 0,
            hits: val.solvedProblemIds?.length || 0,
            solvedProblems: val.solvedProblemIds || [],
            members: val.members || '',
            rank: index + 1,
            isUserTeam: userTeam && userTeam.id === d.id,
          };
        });

        if (loadedTeams.length > 0) {
          setTeams(loadedTeams);

          // Update user team live if logged in
          if (userTeam) {
            const liveMatch = loadedTeams.find((t) => t.id === userTeam.id);
            if (liveMatch) {
              setUserTeam((prev) => ({
                ...prev,
                totalDamage: liveMatch.score,
                solvedProblemIds: liveMatch.solvedProblems,
              }));
            }
          }
        }
      },
      (err) => {
        console.error('Firestore teams listener error:', err);
      }
    );

    return () => unsub();
  }, [userTeam?.id]);

  // =========================================================================
  // 3. LIVE FIRESTORE LISTENER: feed (trigger weapon/hit animations on new entry)
  // =========================================================================
  useEffect(() => {
    if (!db) return;

    const q = query(collection(db, 'feed'), orderBy('createdAt', 'desc'), limit(10));
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const entries = snapshot.docs.map((d) => {
          const val = d.data();
          return {
            id: d.id,
            teamName: val.teamName || 'Viking Clan',
            weapon: val.weapon || 'axe',
            verb: WEAPONS[val.weapon]?.verb || 'struck',
            part: 'hide',
            damage: val.damage || 5,
            customText: val.customText || null,
            timestamp: val.createdAt?.toDate ? val.createdAt.toDate().getTime() : Date.now(),
          };
        });

        if (entries.length > 0) {
          setFeed(entries);
        }

        // Detect new entries and trigger live projectile firing animation!
        if (initialFeedLoadedRef.current) {
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
              const newDoc = change.doc;
              if (!knownFeedIdsRef.current.has(newDoc.id)) {
                knownFeedIdsRef.current.add(newDoc.id);
                const data = newDoc.data();
                const weaponKey = data.weapon || 'axe';

                // Recoil station
                triggerStationRecoil(weaponKey);

                // Queue projectile flight
                const candidateZones = WEAPON_ZONE_MAPPING[weaponKey] || ['chest'];
                const targetZone = candidateZones[Math.floor(Math.random() * candidateZones.length)];
                const fireEvent = {
                  id: 'fire-feed-' + newDoc.id + '-' + Date.now(),
                  weaponKey,
                  targetZone,
                  actualDamage: data.damage || WEAPONS[weaponKey]?.damage || 5,
                  actingTeam: { name: data.teamName || 'Viking' },
                  teamId: 'live',
                  weaponVerb: WEAPONS[weaponKey]?.verb || 'struck',
                  targetPart: 'hide',
                  customFeedText: null,
                  timestamp: Date.now(),
                };

                setPendingFireEvents((prev) => [...prev.slice(-10), fireEvent]);
              }
            }
          });
        } else {
          snapshot.docs.forEach((d) => knownFeedIdsRef.current.add(d.id));
          initialFeedLoadedRef.current = true;
        }
      },
      (err) => {
        console.error('Firestore feed listener error:', err);
      }
    );

    return () => unsub();
  }, [triggerStationRecoil]);

  // Login handler
  const login = useCallback(async (code) => {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
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

  // Logout handler
  const logout = useCallback(() => {
    setToken(null);
    setUserTeam(null);
    localStorage.removeItem(STORAGE_KEY_TOKEN);
    localStorage.removeItem(STORAGE_KEY_TEAM);
  }, []);

  // User Code handlers
  const saveUserCode = useCallback((problemId, language, code) => {
    setUserCode((prev) => ({
      ...prev,
      [`${problemId}_${language}`]: code,
    }));
  }, []);

  const getUserCode = useCallback(
    (problemId, language, defaultStarter = '') => {
      const key = `${problemId}_${language}`;
      if (userCode[key] !== undefined) return userCode[key];
      return defaultStarter;
    },
    [userCode]
  );

  // Inventory firing
  const dealDamage = useCallback(
    (teamId = USER_TEAM_ID, weaponKey = 'axe') => {
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
      const actualDamage = weapon.damage; // Damage equals exact weapon/problem damage
      const targetPart =
        DRAGON_BODY_PARTS[Math.floor(Math.random() * DRAGON_BODY_PARTS.length)];
      const actingTeam = userTeam || teams[0];

      const candidateZones = WEAPON_ZONE_MAPPING[weaponKey] || ['chest'];
      const targetZone =
        candidateZones[Math.floor(Math.random() * candidateZones.length)];

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
    [hp, inventory, teams, userTeam]
  );

  // Derived user team stats
  const sortedTeams = [...teams].sort((a, b) => b.score - a.score);
  const userTeamIndex = sortedTeams.findIndex((t) => t.id === userTeam?.id);
  const userTeamRank = userTeamIndex !== -1 ? userTeamIndex + 1 : 1;
  const isDefeated = hp <= 0 || dragonStatus === 'defeated';
  const winnerTeam =
    sortedTeams.find((t) => t.id === winnerTeamId)?.name ||
    sortedTeams[0]?.name ||
    'Team Alpha';

  const value = {
    // Session
    token,
    userTeam: userTeam || teams[0] || { id: USER_TEAM_ID, name: 'Dragon Rider' },
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

    // Battlefield
    teams,
    sortedTeams,
    feed,
    solvedProblems,
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

    // Projectile Animation State
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
