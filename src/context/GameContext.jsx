import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
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

const STORAGE_KEY_STATE = 'techflix_hyttd_game_state_v1';
const STORAGE_KEY_CODE = 'techflix_hyttd_user_code_v1';

export function GameProvider({ children }) {
  // Load saved state or default
  const [hp, setHp] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_STATE);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.hp === 'number') return parsed.hp;
      }
    } catch {}
    return DRAGON_CONFIG.initialHp;
  });

  const [teams, setTeams] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_STATE);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.teams)) return parsed.teams;
      }
    } catch {}
    return INITIAL_TEAMS;
  });

  const [feed, setFeed] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_STATE);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.feed)) return parsed.feed;
      }
    } catch {}
    return INITIAL_FEED;
  });

  const [solvedProblems, setSolvedProblems] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_STATE);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.solvedProblems)) return parsed.solvedProblems;
      }
    } catch {}
    return [];
  });

  // Persistent hit counts per dragon body zone (head, chest, leftWing, rightWing)
  const [zoneHits, setZoneHits] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_STATE);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.zoneHits && typeof parsed.zoneHits === 'object') return parsed.zoneHits;
      }
    } catch {}
    return { head: 0, chest: 0, leftWing: 0, rightWing: 0 };
  });

  // User code storage: { [problemId_language]: string }
  const [userCode, setUserCode] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CODE);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {};
  });

  // Visual effects state
  const [soundMuted, setSoundMuted] = useState(false);
  const [isHit, setIsHit] = useState(false);
  const [floatingDamages, setFloatingDamages] = useState([]);
  const [sparks, setSparks] = useState([]);
  const [isScreenShaking, setIsScreenShaking] = useState(false);
  const [isRoaring, setIsRoaring] = useState(false);
  const [lastFeedId, setLastFeedId] = useState(null);
  const [lastLeaderboardUpdate, setLastLeaderboardUpdate] = useState(null);
  const [autoSimulate, setAutoSimulate] = useState(true);

  // Weapon firing & dragon damage reaction state
  const [pendingFireEvents, setPendingFireEvents] = useState([]);
  const [activeFlashZone, setActiveFlashZone] = useState(null);
  const [stuckBolts, setStuckBolts] = useState([]);
  const [recoilingStation, setRecoilingStation] = useState(null);

  const triggeredRoarsRef = useRef(new Set());

  // Save game state changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY_STATE,
        JSON.stringify({ hp, teams, feed, solvedProblems, zoneHits })
      );
    } catch (e) {
      console.warn("Could not save game state to localStorage:", e);
    }
  }, [hp, teams, feed, solvedProblems, zoneHits]);

  // Save code changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CODE, JSON.stringify(userCode));
    } catch (e) {
      console.warn("Could not save code to localStorage:", e);
    }
  }, [userCode]);

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

  // Spawn floating damage text
  const spawnFloatingDamage = useCallback((damage, crit = false, x = 50, y = 45) => {
    const id = Date.now() + Math.random();
    setFloatingDamages((prev) => [
      ...prev.slice(-3),
      { id, damage, crit, x: x + (Math.random() * 10 - 5), y: y + (Math.random() * 6 - 3) },
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

  // Recoil station trigger with auto-reset
  const triggerStationRecoil = useCallback((weaponKey) => {
    setRecoilingStation(weaponKey);
    setTimeout(() => {
      setRecoilingStation((current) => (current === weaponKey ? null : current));
    }, 450);
  }, []);

  // Triggered on projectile arrival / impact at the dragon
  const onProjectileImpact = useCallback(
    (event, coords = null) => {
      if (!event) return;

      // 1. Dragon flinch recoil
      setIsHit(true);
      setTimeout(() => setIsHit(false), ANIMATION_TIMINGS.hitFlinchMs || 350);

      // 2. Target hit zone flashes white then red
      setActiveFlashZone({ zone: event.targetZone, id: Date.now() });
      setTimeout(() => setActiveFlashZone(null), ANIMATION_TIMINGS.zoneFlashMs || 400);

      // 3. Persistent damage increment per zone (scales up to 3 levels)
      setZoneHits((prev) => ({
        ...prev,
        [event.targetZone]: (prev[event.targetZone] || 0) + 1,
      }));

      // 4. Stuck ballista bolt on head
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

      // 5. Floating damage and sparks at impact point
      const impactX =
        coords?.x ||
        (event.targetZone === 'head'
          ? 52
          : event.targetZone === 'leftWing'
          ? 28
          : event.targetZone === 'rightWing'
          ? 72
          : 50);
      const impactY =
        coords?.y ||
        (event.targetZone === 'head'
          ? 28
          : event.targetZone === 'leftWing'
          ? 32
          : event.targetZone === 'rightWing'
          ? 32
          : 46);

      spawnFloatingDamage(event.actualDamage, event.isCrit, impactX, impactY);
      spawnSparkBurst(impactX, impactY);

      // 6. Deduct HP & check roar thresholds (75%, 50%, 25%)
      setHp((prevHp) => {
        const nextHp = Math.max(0, prevHp - event.actualDamage);
        DRAGON_CONFIG.roarThresholds.forEach((threshold) => {
          if (
            prevHp > threshold &&
            nextHp <= threshold &&
            !triggeredRoarsRef.current.has(threshold)
          ) {
            triggeredRoarsRef.current.add(threshold);
            setIsScreenShaking(true);
            setTimeout(() => setIsScreenShaking(false), 700);
            setIsRoaring(true);
            setTimeout(
              () => setIsRoaring(false),
              ANIMATION_TIMINGS.roarDurationMs || 2400
            );
          }
        });
        return nextHp;
      });

      // 7. Update acting team scores & leaderboard
      setTeams((prevTeams) =>
        prevTeams.map((team) => {
          if (team.id === event.teamId) {
            return {
              ...team,
              score: team.score + event.actualDamage,
              hits: (team.hits || 0) + 1,
            };
          }
          return team;
        })
      );
      setLastLeaderboardUpdate(Date.now());

      // 8. Update live battle log feed
      const feedItemId = "feed-" + Date.now() + Math.random();
      const newFeedItem = {
        id: feedItemId,
        teamName: event.actingTeam.name,
        weapon: event.weaponKey,
        verb: event.weaponVerb,
        part: event.targetPart,
        damage: event.actualDamage,
        crit: event.isCrit,
        time: "Just now",
        customText: event.customFeedText,
      };

      setFeed((prevFeed) => [newFeedItem, ...prevFeed.slice(0, 3)]);
      setLastFeedId(feedItemId);

      // Clean up from pendingFireEvents
      setPendingFireEvents((prev) => prev.filter((e) => e.id !== event.id));
    },
    [spawnFloatingDamage, spawnSparkBurst]
  );

  // Manual or simulated hit: queues projectile launch from weapon station
  const dealDamage = useCallback(
    (teamId = USER_TEAM_ID, weaponKey = 'axe') => {
      if (hp <= 0) return;
      const weapon = WEAPONS[weaponKey] || WEAPONS.axe;
      const isCrit = Math.random() < weapon.critRate;
      const actualDamage = isCrit ? weapon.damage + 3 : weapon.damage;
      const targetPart =
        DRAGON_BODY_PARTS[Math.floor(Math.random() * DRAGON_BODY_PARTS.length)];
      const actingTeam = teams.find((t) => t.id === teamId) || teams[0];

      // Map weapon to hit zone
      const candidateZones = WEAPON_ZONE_MAPPING[weaponKey] || ['chest'];
      const targetZone =
        candidateZones[Math.floor(Math.random() * candidateZones.length)];

      const fireEvent = {
        id: "fire-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7),
        weaponKey,
        targetZone,
        actualDamage,
        isCrit,
        actingTeam,
        teamId,
        weaponVerb: weapon.verb,
        targetPart,
        customFeedText: null,
        timestamp: Date.now(),
      };

      setPendingFireEvents((prev) => [...prev.slice(-10), fireEvent]);
    },
    [hp, teams]
  );

  // Solved problem by team: maps problem difficulty to weapon and deals damage
  const recordAcceptedSubmission = useCallback(
    (problemId) => {
      const problem = PROBLEMS_BY_ID[problemId];
      if (!problem) return false;

      // Check if already solved
      if (solvedProblems.includes(problemId)) {
        return false;
      }

      // Mark solved
      setSolvedProblems((prev) => [...prev, problemId]);

      // Weapon chosen from problem difficulty
      const diffToWeapon = {
        Easy: 'dagger',
        Medium: 'axe',
        Hard: 'catapult',
        Extreme: 'ballista',
      };
      const weaponKey = diffToWeapon[problem.difficulty] || 'axe';
      const weapon = WEAPONS[weaponKey] || WEAPONS.axe;

      const userTeam =
        teams.find((t) => t.id === USER_TEAM_ID || t.isUserTeam) || teams[2];
      const targetPart =
        DRAGON_BODY_PARTS[Math.floor(Math.random() * DRAGON_BODY_PARTS.length)];
      const customFeed = `${userTeam.name} solved "${problem.title}" with ${weapon.name} for ${problem.xp} XP!`;

      const candidateZones = WEAPON_ZONE_MAPPING[weaponKey] || ['chest'];
      const targetZone =
        candidateZones[Math.floor(Math.random() * candidateZones.length)];

      const fireEvent = {
        id: "fire-solve-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7),
        weaponKey,
        targetZone,
        actualDamage: problem.xp,
        isCrit: true, // Solve critical highlight
        actingTeam: userTeam,
        teamId: userTeam.id,
        weaponVerb: weapon.verb,
        targetPart,
        customFeedText: customFeed,
        timestamp: Date.now(),
      };

      // Queue event for arena animation while also registering impact
      onProjectileImpact(fireEvent);
      return true;
    },
    [solvedProblems, teams, onProjectileImpact]
  );

  // Reset dragon, battle, and persistent damage overlays
  const resetDragon = useCallback(() => {
    setHp(DRAGON_CONFIG.maxHp);
    triggeredRoarsRef.current.clear();
    setIsRoaring(false);
    setIsScreenShaking(false);
    setTeams(INITIAL_TEAMS);
    setFeed(INITIAL_FEED);
    setSolvedProblems([]);
    setZoneHits({ head: 0, chest: 0, leftWing: 0, rightWing: 0 });
    setStuckBolts([]);
    setPendingFireEvents([]);
    setActiveFlashZone(null);
    setRecoilingStation(null);
  }, []);

  // Background fake-data timer: generates weapon hits
  useEffect(() => {
    if (!autoSimulate || hp <= 0) return;

    let timeoutId;
    const triggerNext = () => {
      const delay = Math.floor(Math.random() * 4000 + 7500); // 7.5s - 11.5s
      timeoutId = setTimeout(() => {
        if (hp > 0) {
          const randomTeam = teams[Math.floor(Math.random() * teams.length)];
          const weightedKeys = ['dagger', 'dagger', 'axe', 'axe', 'catapult', 'ballista'];
          const randomWeapon = weightedKeys[Math.floor(Math.random() * weightedKeys.length)];
          dealDamage(randomTeam.id, randomWeapon);
          triggerNext();
        }
      }, delay);
    };

    triggerNext();
    return () => clearTimeout(timeoutId);
  }, [autoSimulate, hp, teams, dealDamage]);

  // Derived user team stats
  const sortedTeams = [...teams].sort((a, b) => b.score - a.score);
  const userTeamIndex = sortedTeams.findIndex((t) => t.id === USER_TEAM_ID || t.isUserTeam);
  const userTeamRank = userTeamIndex !== -1 ? userTeamIndex + 1 : 3;
  const userTeam = teams.find((t) => t.id === USER_TEAM_ID || t.isUserTeam) || teams[2];
  const isDefeated = hp <= 0;
  const winnerTeam = sortedTeams[0]?.name || "Team Alpha";

  const value = {
    hp,
    maxHp: DRAGON_CONFIG.maxHp,
    dragonName: "THE RED DEATH",
    teams,
    sortedTeams,
    feed,
    solvedProblems,
    userTeam,
    userTeamRank,
    isDefeated,
    winnerTeam,
    soundMuted,
    setSoundMuted,
    isHit,
    floatingDamages,
    sparks,
    isScreenShaking,
    isRoaring,
    lastFeedId,
    lastLeaderboardUpdate,
    autoSimulate,
    setAutoSimulate,
    dealDamage,
    resetDragon,
    recordAcceptedSubmission,
    saveUserCode,
    getUserCode,
    // Firing and persistent reaction states
    zoneHits,
    activeFlashZone,
    stuckBolts,
    pendingFireEvents,
    recoilingStation,
    triggerStationRecoil,
    onProjectileImpact,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) throw new Error("useGame must be used within a GameProvider");
  return context;
}

