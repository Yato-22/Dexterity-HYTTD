import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  DRAGON_CONFIG,
  WEAPONS,
  DRAGON_BODY_PARTS,
  INITIAL_TEAMS,
  INITIAL_FEED,
  USER_TEAM_ID,
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

  const triggeredRoarsRef = useRef(new Set());

  // Save game state changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY_STATE,
        JSON.stringify({ hp, teams, feed, solvedProblems })
      );
    } catch (e) {
      console.warn("Could not save game state to localStorage:", e);
    }
  }, [hp, teams, feed, solvedProblems]);

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
  const spawnFloatingDamage = useCallback((damage, crit = false, x = 48, y = 42) => {
    const id = Date.now() + Math.random();
    setFloatingDamages((prev) => [
      ...prev.slice(-3),
      { id, damage, crit, x: x + (Math.random() * 14 - 7), y: y + (Math.random() * 8 - 4) },
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

  // Core damage calculation and phase checking
  const applyDamage = useCallback(
    (actualDamage, isCrit, teamName, teamId, weaponVerb, targetPart, customFeedText = null) => {
      setIsHit(true);
      setTimeout(() => setIsHit(false), 260);

      const hitX = Math.floor(Math.random() * 22 + 39);
      const hitY = Math.floor(Math.random() * 22 + 36);
      spawnFloatingDamage(actualDamage, isCrit, hitX, hitY);
      spawnSparkBurst(hitX, hitY);

      setHp((prevHp) => {
        const nextHp = Math.max(0, prevHp - actualDamage);
        DRAGON_CONFIG.roarThresholds.forEach((threshold) => {
          if (prevHp > threshold && nextHp <= threshold && !triggeredRoarsRef.current.has(threshold)) {
            triggeredRoarsRef.current.add(threshold);
            setIsScreenShaking(true);
            setTimeout(() => setIsScreenShaking(false), 600);
            setIsRoaring(true);
            setTimeout(() => setIsRoaring(false), 2400);
          }
        });
        return nextHp;
      });

      setTeams((prevTeams) =>
        prevTeams.map((team) => {
          if (team.id === teamId) {
            return {
              ...team,
              score: team.score + actualDamage,
              hits: (team.hits || 0) + 1,
            };
          }
          return team;
        })
      );
      setLastLeaderboardUpdate(Date.now());

      const feedItemId = "feed-" + Date.now() + Math.random();
      const newFeedItem = {
        id: feedItemId,
        teamName,
        weapon: "axe",
        verb: weaponVerb,
        part: targetPart,
        damage: actualDamage,
        crit: isCrit,
        time: "Just now",
        customText: customFeedText,
      };

      setFeed((prevFeed) => [newFeedItem, ...prevFeed.slice(0, 3)]);
      setLastFeedId(feedItemId);
    },
    [spawnFloatingDamage, spawnSparkBurst]
  );

  // Manual or simulated hit
  const dealDamage = useCallback(
    (teamId = USER_TEAM_ID, weaponKey = 'axe') => {
      if (hp <= 0) return;
      const weapon = WEAPONS[weaponKey] || WEAPONS.axe;
      const isCrit = Math.random() < weapon.critRate;
      const actualDamage = isCrit ? weapon.damage + 3 : weapon.damage;
      const targetPart = DRAGON_BODY_PARTS[Math.floor(Math.random() * DRAGON_BODY_PARTS.length)];
      const actingTeam = teams.find((t) => t.id === teamId) || teams[0];

      applyDamage(actualDamage, isCrit, actingTeam.name, teamId, weapon.verb, targetPart);
    },
    [hp, teams, applyDamage]
  );

  // Solved problem by team
  const recordAcceptedSubmission = useCallback(
    (problemId) => {
      const problem = PROBLEMS_BY_ID[problemId];
      if (!problem) return false;

      // Check if already solved
      if (solvedProblems.includes(problemId)) {
        return false; // Repeat solve gives no additional dragon damage or points
      }

      // Mark solved
      setSolvedProblems((prev) => [...prev, problemId]);

      // Apply problem XP as damage
      const userTeam = teams.find((t) => t.id === USER_TEAM_ID || t.isUserTeam) || teams[2];
      const targetPart = DRAGON_BODY_PARTS[Math.floor(Math.random() * DRAGON_BODY_PARTS.length)];
      const customFeed = `${userTeam.name} solved "${problem.title}" for ${problem.xp} XP!`;

      applyDamage(
        problem.xp,
        true, // Crit highlight
        userTeam.name,
        userTeam.id,
        "pierced",
        targetPart,
        customFeed
      );

      return true;
    },
    [solvedProblems, teams, applyDamage]
  );

  // Reset dragon and battle
  const resetDragon = useCallback(() => {
    setHp(DRAGON_CONFIG.maxHp);
    triggeredRoarsRef.current.clear();
    setIsRoaring(false);
    setIsScreenShaking(false);
    setTeams(INITIAL_TEAMS);
    setFeed(INITIAL_FEED);
    setSolvedProblems([]);
  }, []);

  // Slower background fake-data timer (every 8-12 seconds)
  useEffect(() => {
    if (!autoSimulate || hp <= 0) return;

    let timeoutId;
    const triggerNext = () => {
      const delay = Math.floor(Math.random() * 4000 + 8000); // 8,000ms - 12,000ms
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
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) throw new Error("useGame must be used within a GameProvider");
  return context;
}

