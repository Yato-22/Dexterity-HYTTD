import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DRAGON_CONFIG,
  WEAPONS,
  DRAGON_BODY_PARTS,
  INITIAL_TEAMS,
  INITIAL_FEED,
  USER_TEAM_ID,
} from './data/gameData';
import HPBar from './components/HPBar';
import Dragon from './components/Dragon';
import Leaderboard from './components/Leaderboard';
import ChallengeScroll from './components/ChallengeScroll';
import LiveFeed from './components/LiveFeed';
import RankBadge from './components/RankBadge';
import Embers from './components/Embers';
import TorchGlow from './components/TorchGlow';
import { playWeaponSound, playDragonRoar } from './utils/audio';
import { Volume2, VolumeX, Flame } from 'lucide-react';

export default function App() {
  // Game State
  const [hp, setHp] = useState(DRAGON_CONFIG.initialHp);
  const [teams, setTeams] = useState(INITIAL_TEAMS);
  const [feed, setFeed] = useState(INITIAL_FEED);
  const [autoSimulate, setAutoSimulate] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Dragon Hit & Visual FX State
  const [isHit, setIsHit] = useState(false);
  const [floatingDamages, setFloatingDamages] = useState([]);
  const [sparks, setSparks] = useState([]);
  const [isScreenShaking, setIsScreenShaking] = useState(false);
  const [isRoaring, setIsRoaring] = useState(false);
  const [lastFeedId, setLastFeedId] = useState(null);
  const [lastLeaderboardUpdate, setLastLeaderboardUpdate] = useState(null);

  // Track which roar thresholds have triggered
  const triggeredRoarsRef = useRef(new Set());

  // Current User's Team & Dynamic Rank
  const sortedTeams = [...teams].sort((a, b) => b.score - a.score);
  const userTeamIndex = sortedTeams.findIndex((t) => t.id === USER_TEAM_ID || t.isUserTeam);
  const userTeamRank = userTeamIndex !== -1 ? userTeamIndex + 1 : 3;
  const userTeam = teams.find((t) => t.id === USER_TEAM_ID || t.isUserTeam) || teams[2];

  const isDefeated = hp <= 0;
  const winnerTeam = sortedTeams[0]?.name || "Team Alpha";

  // Trigger floating damage number
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

  // Trigger spark burst
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

  // Deal damage to dragon
  const dealDamage = useCallback(
    (teamId, weaponKey, isUserAction = false) => {
      if (hp <= 0) return;

      const weapon = WEAPONS[weaponKey] || WEAPONS.axe;
      const isCrit = Math.random() < weapon.critRate;
      const actualDamage = isCrit ? weapon.damage + 3 : weapon.damage;
      const targetPart = DRAGON_BODY_PARTS[Math.floor(Math.random() * DRAGON_BODY_PARTS.length)];

      const actingTeam = teams.find((t) => t.id === teamId) || teams[0];

      // Audio
      if (soundEnabled) {
        playWeaponSound(weaponKey);
      }

      // Visual hit recoil
      setIsHit(true);
      setTimeout(() => setIsHit(false), 240);

      // Hit Coordinates (center of dragon roughly)
      const hitX = Math.floor(Math.random() * 22 + 39);
      const hitY = Math.floor(Math.random() * 22 + 36);
      spawnFloatingDamage(actualDamage, isCrit, hitX, hitY);
      spawnSparkBurst(hitX, hitY);

      // Calculate new HP
      setHp((prevHp) => {
        const nextHp = Math.max(0, prevHp - actualDamage);

        // Check 75%, 50%, 25% thresholds
        DRAGON_CONFIG.roarThresholds.forEach((threshold) => {
          if (prevHp > threshold && nextHp <= threshold && !triggeredRoarsRef.current.has(threshold)) {
            triggeredRoarsRef.current.add(threshold);

            // Screen shake
            setIsScreenShaking(true);
            setTimeout(() => setIsScreenShaking(false), 600);

            // Roar announcement
            setIsRoaring(true);
            if (soundEnabled) playDragonRoar();
            setTimeout(() => setIsRoaring(false), 2400);
          }
        });

        return nextHp;
      });

      // Update Team Score
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

      // Update Live Feed (latest 4 entries)
      const feedItemId = "feed-" + Date.now() + Math.random();
      const newFeedItem = {
        id: feedItemId,
        teamName: actingTeam.name,
        weapon: weaponKey,
        verb: weapon.verb,
        part: targetPart,
        damage: actualDamage,
        crit: isCrit,
        time: "Just now",
      };

      setFeed((prevFeed) => [newFeedItem, ...prevFeed.slice(0, 3)]);
      setLastFeedId(feedItemId);
    },
    [hp, soundEnabled, teams, spawnFloatingDamage, spawnSparkBurst]
  );

  // Reset Dragon & Battle State
  const resetDragon = useCallback(() => {
    setHp(DRAGON_CONFIG.maxHp);
    triggeredRoarsRef.current.clear();
    setIsRoaring(false);
    setIsScreenShaking(false);
    setTeams(INITIAL_TEAMS);
    setFeed(INITIAL_FEED);
  }, []);

  // Hidden Keyboard Shortcuts (S = simulate hit, R = reset dragon, P = pause auto-battle)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      if (e.key === 's' || e.key === 'S') {
        dealDamage(userTeam.id, 'axe', true);
      } else if (e.key === 'r' || e.key === 'R') {
        resetDragon();
      } else if (e.key === 'p' || e.key === 'P') {
        setAutoSimulate((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dealDamage, resetDragon, userTeam.id]);

  // Auto-simulation timer (every 2-4 seconds)
  useEffect(() => {
    if (!autoSimulate || isDefeated) return;

    let timeoutId;
    const triggerNextHit = () => {
      const delay = Math.floor(Math.random() * 2000 + 2000);
      timeoutId = setTimeout(() => {
        if (hp > 0) {
          const randomTeam = teams[Math.floor(Math.random() * teams.length)];
          const weightedKeys = ['dagger', 'dagger', 'axe', 'axe', 'catapult', 'ballista'];
          const randomWeapon = weightedKeys[Math.floor(Math.random() * weightedKeys.length)];

          dealDamage(randomTeam.id, randomWeapon, false);
          triggerNextHit();
        }
      }, delay);
    };

    triggerNextHit();
    return () => clearTimeout(timeoutId);
  }, [autoSimulate, hp, isDefeated, teams, dealDamage]);

  // Handle Manual Attempt on Challenge Scroll
  const handleAttemptChallenge = (weaponKey, challenge) => {
    dealDamage(userTeam.id, weaponKey, true);
  };

  return (
    <div
      className={`h-screen max-h-screen w-screen overflow-hidden hall-bg relative select-none ${
        isScreenShaking ? 'screen-shake' : ''
      }`}
    >
      {/* Procedural Wood Grain Filter Overlay */}
      <div className="absolute inset-0 wood-grain-overlay pointer-events-none z-0" />

      {/* Screen Edge Vignette */}
      <div className="fixed inset-0 vignette pointer-events-none z-40" />

      {/* Corner Torch Glows & Sconces */}
      <TorchGlow />

      {/* Floating Ember Particles */}
      <Embers />

      {/* Top Header Plaque (Top Right, Smaller) */}
      <div className="absolute top-2 right-2.5 2xl:top-3.5 2xl:right-4 z-40">
        <div
          className="compact-wood-board px-2.5 py-1 2xl:px-3 2xl:py-1.5 flex items-center gap-2"
          style={{ rotate: '0.6deg' }}
        >
          <div className="text-right">
            <div className="flex items-center justify-end gap-1 text-[10px] 2xl:text-[11px] font-bold uppercase text-[#FFB347]">
              <span>TECHFLIX</span>
              <Flame className="w-3 h-3 text-[#FF7A1A]" />
            </div>
            <div className="font-heading text-[12px] 2xl:text-[14px] font-bold text-[#FFF8ED] leading-none heading-shadow">
              HOW TO TRAIN YOUR DRAGON
            </div>
          </div>

          {/* Sound Mute Toggle Button */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="compact-iron-btn p-1 2xl:p-1.5 sword-cursor"
            title={soundEnabled ? "Mute War Horns" : "Enable War Horns"}
          >
            {soundEnabled ? (
              <Volume2 className="w-3.5 h-3.5 2xl:w-4 2xl:h-4 text-[#FFB347]" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 2xl:w-4 2xl:h-4 text-[#A89078]" />
            )}
          </button>
        </div>
      </div>

      {/* Main Single-Screen Responsive Layout (No Page Scrolling) */}
      <div className="relative z-20 h-full w-full max-w-[1920px] mx-auto p-2 md:p-2.5 2xl:p-3.5 flex flex-col justify-between">
        
        {/* Top Center: Dragon HP Bar (About 20% less tall) */}
        <header className="w-full flex justify-center mb-1 flex-shrink-0">
          <HPBar
            currentHp={hp}
            maxHp={DRAGON_CONFIG.maxHp}
            dragonName={DRAGON_CONFIG.name}
            isDefeated={isDefeated}
          />
        </header>

        {/* 3-Column Arena Layout */}
        <main className="flex-1 min-h-0 w-full flex items-stretch gap-2.5 2xl:gap-5 my-auto">
          
          {/* LEFT COLUMN (about 20% width): Rank Badge, Top 10 Leaderboard, Live Feed */}
          <section className="w-[20%] min-w-[270px] max-w-[340px] h-full flex flex-col justify-between gap-1.5 2xl:gap-2 flex-shrink-0">
            {/* 1. Rank Badge, Compact */}
            <div className="flex-shrink-0">
              <RankBadge
                rank={userTeamRank}
                teamName={userTeam.name}
                score={userTeam.score}
              />
            </div>

            {/* 2. Leaderboard: Top 10 Teams (Single line rows ~34px) */}
            <div className="flex-1 min-h-0 flex flex-col justify-center">
              <Leaderboard
                teams={teams}
                userTeamId={userTeam.id}
                lastUpdated={lastLeaderboardUpdate}
              />
            </div>

            {/* 3. Live Feed: Battle Log (Latest 4 entries, single line) */}
            <div className="flex-shrink-0">
              <LiveFeed
                feed={feed}
                lastFeedId={lastFeedId}
              />
            </div>
          </section>

          {/* CENTER COLUMN: Dragon Clean & Completely Unobstructed */}
          <section className="flex-1 min-w-0 h-full flex items-center justify-center relative px-2 overflow-visible">
            <Dragon
              hp={hp}
              maxHp={DRAGON_CONFIG.maxHp}
              isHit={isHit}
              floatingDamages={floatingDamages}
              sparks={sparks}
              isRoaring={isRoaring}
              isDefeated={isDefeated}
              winnerTeam={winnerTeam}
              onDragonClick={() => dealDamage(userTeam.id, 'axe', true)}
            />
          </section>

          {/* RIGHT COLUMN (about 24% width): Tome of Trials (Shorter, compact) */}
          <section className="w-[24%] min-w-[320px] max-w-[400px] h-full flex flex-col justify-center flex-shrink-0">
            <ChallengeScroll
              onAttempt={handleAttemptChallenge}
            />
          </section>
        </main>

        {/* Screen Bottom Minimal Status Line */}
        <footer className="w-full flex-shrink-0 pt-0.5 flex items-center justify-between text-[11px] 2xl:text-[13px] font-bold text-[#A89078] px-2 font-sans">
          <span>TechFlix Battle Arena</span>
          <span className="font-heading tracking-wider text-[#FFB347] text-[10px] 2xl:text-[12px]">
            [S] Strike • [R] Reset • [P] Pause
          </span>
          <span>Click dragon or attempt trials to deal damage</span>
        </footer>
      </div>
    </div>
  );
}
