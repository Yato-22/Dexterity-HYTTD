import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../context/GameContext';
import HPBar from '../components/HPBar';
import Dragon from '../components/Dragon';
import Leaderboard from '../components/Leaderboard';
import ChallengeScroll from '../components/ChallengeScroll';
import LiveFeed from '../components/LiveFeed';
import RankBadge from '../components/RankBadge';
import Embers from '../components/Embers';
import TorchGlow from '../components/TorchGlow';
import { RopeSegment, RopeKnot } from '../components/RopeGraphic';
import { Volume2, VolumeX, Flame } from 'lucide-react';

export default function ArenaScreen() {
  const {
    hp,
    maxHp,
    dragonName,
    teams,
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
    setAutoSimulate,
    dealDamage,
    resetDragon,
  } = useGame();

  // Hidden Keyboard Shortcuts (S = simulate hit, R = reset dragon, P = pause auto-battle)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      if (e.key === 's' || e.key === 'S') {
        dealDamage(userTeam.id, 'axe');
      } else if (e.key === 'r' || e.key === 'R') {
        resetDragon();
      } else if (e.key === 'p' || e.key === 'P') {
        setAutoSimulate((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dealDamage, resetDragon, setAutoSimulate, userTeam.id]);

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

      {/* ===================================================================== */}
      {/* TOP-RIGHT EVENT PLAQUE (Hanging from two short ropes off top edge)     */}
      {/* ===================================================================== */}
      <div className="absolute top-2 right-2.5 2xl:top-3.5 2xl:right-4 z-40">
        {/* Two Short Hanging Ropes Going Up and Off Top Edge */}
        <div className="absolute -top-10 left-3 z-0 pointer-events-none flex flex-col items-center">
          <RopeSegment height="42px" width={10} />
          <div className="-mt-1.5">
            <RopeKnot size="sm" />
          </div>
        </div>
        <div className="absolute -top-10 right-3 z-0 pointer-events-none flex flex-col items-center">
          <RopeSegment height="42px" width={10} />
          <div className="-mt-1.5">
            <RopeKnot size="sm" />
          </div>
        </div>

        {/* Broken Wooden Plaque Housing */}
        <div
          className={`relative broken-plank-shadow transition-transform duration-300 ${
            isHit ? 'plank-hit-shake' : ''
          }`}
          style={{ rotate: '0.6deg' }}
        >
          <div className="relative clip-broken-plank-1 border-[3px] border-[#4A3A2C] px-2.5 py-1 2xl:px-3 2xl:py-1.5 bg-[#2A211B] flex items-center gap-2 overflow-hidden">
            <div className="absolute inset-0 flex flex-col pointer-events-none z-0">
              <div className="h-[48%] plank-row-top w-full" />
              <div className="h-[52%] plank-row-bottom w-full" />
            </div>

            <div className="compact-nail top-1 left-1 pointer-events-none z-20" />
            <div className="compact-nail top-1 right-1 pointer-events-none z-20" />

            <div className="relative z-10 text-right">
              <div className="flex items-center justify-end gap-1 text-[10px] 2xl:text-[11px] font-bold uppercase text-[#FFB347]">
                <span>TECHFLIX</span>
                <Flame className="w-3 h-3 text-[#FF7A1A]" />
              </div>
              <div className="font-heading text-[12px] 2xl:text-[14px] font-bold text-[#FFF8ED] leading-none heading-shadow">
                HOW TO TRAIN YOUR DRAGON
              </div>
            </div>

            {/* Sound Mute Toggle (visual icon toggle only, no sound effects) */}
            <button
              onClick={() => setSoundMuted(!soundMuted)}
              className="relative z-10 compact-iron-btn p-1 2xl:p-1.5 sword-cursor"
              title={soundMuted ? "Unmute War Horns" : "Mute War Horns"}
            >
              {!soundMuted ? (
                <Volume2 className="w-3.5 h-3.5 2xl:w-4 2xl:h-4 text-[#FFB347]" />
              ) : (
                <VolumeX className="w-3.5 h-3.5 2xl:w-4 2xl:h-4 text-[#A89078]" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* MAIN SINGLE-SCREEN BATTLE ARENA (No Page Scrolling)                  */}
      {/* ===================================================================== */}
      <div className="relative z-20 h-full w-full max-w-[1920px] mx-auto p-2 md:p-2.5 2xl:p-3.5 flex flex-col justify-between">
        
        {/* TOP CENTER: Dragon HP Bar (Hanging from two short ropes) */}
        <header className="w-full flex justify-center mb-1 flex-shrink-0">
          <HPBar
            currentHp={hp}
            maxHp={maxHp}
            dragonName={dragonName}
            isDefeated={isDefeated}
            isHit={isHit}
          />
        </header>

        {/* 3-COLUMN ARENA LAYOUT */}
        <main className="flex-1 min-h-0 w-full flex items-stretch gap-2.5 2xl:gap-5 my-auto">
          
          {/* ================================================================= */}
          {/* LEFT COLUMN: TWO PARALLEL ROPES PASSING THROUGH ALL 3 PANELS      */}
          {/* ================================================================= */}
          <motion.section
            animate={{ rotate: [-0.5, 0.5, -0.5] }}
            transition={{ repeat: Infinity, duration: 8.5, ease: "easeInOut" }}
            style={{ transformOrigin: "top center" }}
            className="w-[20%] min-w-[270px] max-w-[340px] h-full flex flex-col justify-between gap-1.5 2xl:gap-2 flex-shrink-0 relative"
          >
            {/* TWO CONTINUOUS PARALLEL ROPES RUNNING FROM ABOVE SCREEN TO BOTTOM */}
            {/* Left Strand */}
            <div
              className="absolute pointer-events-none z-0"
              style={{
                top: "-50px", // Starts above screen edge
                bottom: "22px",
                left: "22px",
              }}
            >
              <RopeSegment height="100%" width={12} />
            </div>

            {/* Right Strand */}
            <div
              className="absolute pointer-events-none z-0"
              style={{
                top: "-50px", // Starts above screen edge
                bottom: "22px",
                right: "22px",
              }}
            >
              <RopeSegment height="100%" width={12} />
            </div>

            {/* 1. Rank Badge, Compact Broken Planks */}
            <div className="flex-shrink-0 relative z-10">
              <RankBadge
                rank={userTeamRank}
                teamName={userTeam.name}
                score={userTeam.score}
                isHit={isHit}
              />
            </div>

            {/* 2. Top 10 Leaderboard Broken Planks */}
            <div className="flex-1 min-h-0 flex flex-col justify-center relative z-10">
              <Leaderboard
                teams={teams}
                userTeamId={userTeam.id}
                lastUpdated={lastLeaderboardUpdate}
                isHit={isHit}
              />
            </div>

            {/* 3. Live Feed Broken Planks */}
            <div className="flex-shrink-0 relative z-10">
              <LiveFeed
                feed={feed}
                lastFeedId={lastFeedId}
                isHit={isHit}
              />
            </div>
          </motion.section>

          {/* ================================================================= */}
          {/* CENTER COLUMN: Dragon Clean & Completely Unobstructed             */}
          {/* ================================================================= */}
          <section className="flex-1 min-w-0 h-full flex items-center justify-center relative px-2 overflow-visible">
            <Dragon
              hp={hp}
              maxHp={maxHp}
              isHit={isHit}
              floatingDamages={floatingDamages}
              sparks={sparks}
              isRoaring={isRoaring}
              roarText="THE RED DEATH ROARS!"
              isDefeated={isDefeated}
              winnerTeam={winnerTeam}
              onDragonClick={() => dealDamage(userTeam.id, 'axe')}
            />
          </section>

          {/* ================================================================= */}
          {/* RIGHT COLUMN: ONE CONTINUOUS ROPE DOWN THROUGH TOME OF TRIALS     */}
          {/* ================================================================= */}
          <motion.section
            animate={{ rotate: [0.5, -0.5, 0.5] }}
            transition={{ repeat: Infinity, duration: 9.2, delay: 0.8, ease: "easeInOut" }}
            style={{ transformOrigin: "top center" }}
            className="w-[24%] min-w-[320px] max-w-[400px] h-full flex flex-col justify-center flex-shrink-0 relative"
          >
            {/* CONTINUOUS ROPE RUNNING FROM ABOVE SCREEN DOWN THROUGH RIGHT PANEL */}
            <div
              className="absolute pointer-events-none z-0"
              style={{
                top: "-50px", // Starts above screen edge
                bottom: "22px",
                right: "30px",
              }}
            >
              <RopeSegment height="100%" width={12} />
            </div>

            <div className="relative z-10">
              <ChallengeScroll
                solvedProblems={solvedProblems}
                isHit={isHit}
              />
            </div>
          </motion.section>
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

