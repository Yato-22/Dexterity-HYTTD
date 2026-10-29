import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../context/GameContext';
import HPBar from '../components/HPBar';
import Dragon from '../components/Dragon';
import Leaderboard from '../components/Leaderboard';
import ChallengeScroll from '../components/ChallengeScroll';
import LiveFeed from '../components/LiveFeed';
import RankBadge from '../components/RankBadge';
import Embers from '../components/Embers';
import FlyingProjectiles from '../components/FlyingProjectiles';
import { RopeSegment, RopeKnot, TerminalRopeKnot } from '../components/RopeGraphic';
import { Volume2, VolumeX, Flame, LogOut, PauseCircle, AlertTriangle, WifiOff } from 'lucide-react';

export default function ArenaScreen() {
  const {
    logout,
    hp,
    maxHp,
    dragonName,
    dragonStatus,
    isPaused,
    runnerOk,
    isReconnecting,
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
    dealDamage,
    triggerWeaponAttack,
    zoneHits,
    activeFlashZone,
    stuckBolts,
    pendingFireEvents,
    recoilingStation,
    triggerStationRecoil,
    onProjectileImpact,
  } = useGame();

  const leftColRef = useRef(null);
  const plaqueRef = useRef(null);
  const [leftTopOffset, setLeftTopOffset] = useState(100);
  const [plaqueTopOffset, setPlaqueTopOffset] = useState(14);

  // Delayed damage after returning from solve (~1.5s delay, consumed once)
  useEffect(() => {
    const rawPending = sessionStorage.getItem('techflix_pending_attack');
    if (rawPending) {
      sessionStorage.removeItem('techflix_pending_attack');
      try {
        const attack = JSON.parse(rawPending);
        const timer = setTimeout(() => {
          if (triggerWeaponAttack) {
            triggerWeaponAttack(attack.tier || 'dagger');
          }
        }, 1500);
        return () => clearTimeout(timer);
      } catch {}
    }
  }, [triggerWeaponAttack]);

  useEffect(() => {
    const updateMeasurements = () => {
      if (leftColRef.current) {
        const rect = leftColRef.current.getBoundingClientRect();
        setLeftTopOffset(rect.top);
      }
      if (plaqueRef.current) {
        const rect = plaqueRef.current.getBoundingClientRect();
        setPlaqueTopOffset(rect.top);
      }
    };

    updateMeasurements();
    window.addEventListener('resize', updateMeasurements);
    return () => window.removeEventListener('resize', updateMeasurements);
  }, []);

  return (
    <div
      className={`h-screen max-h-screen w-screen overflow-hidden relative select-none bg-cover bg-center ${
        isScreenShaking ? 'screen-shake' : ''
      }`}
      style={{
        backgroundImage: "url('/field.png'), linear-gradient(to bottom, #1c152b 0%, #4a2835 30%, #a85834 50%, #4a5c2d 65%, #1e2e14 100%)",
      }}
    >
      {/* 15% dark overlay so panels stand out */}
      <div className="absolute inset-0 bg-black/15 pointer-events-none z-0" />

      {/* Floating Ember Particles */}
      <Embers />

      {/* Reconnecting Banner */}
      {isReconnecting && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-50 bg-[#7F1D1D]/90 border border-[#EF4444] px-4 py-1.5 rounded-full shadow-lg flex items-center gap-2 text-xs font-bold text-[#FEE2E2] animate-pulse">
          <WifiOff className="w-3.5 h-3.5 text-[#FCA5A5]" />
          <span>Reconnecting to the Viking battle network...</span>
        </div>
      )}

      {/* Runner Outage Warning Banner */}
      {!runnerOk && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-50 bg-[#9A3412]/95 border-2 border-[#F97316] px-5 py-2 rounded-lg shadow-2xl flex items-center gap-2 text-xs font-bold text-[#FFF8ED]">
          <AlertTriangle className="w-4 h-4 text-[#FDE047] animate-bounce" />
          <span>The forge is down, please wait for repairs...</span>
        </div>
      )}

      {/* Full-Screen Viking Pause Overlay */}
      {isPaused && (
        <div className="absolute inset-0 z-50 bg-[#0C0806]/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center select-none">
          <div className="compact-wood-board border-[4px] border-[#8C6F54] rounded-2xl p-8 max-w-lg shadow-[0_0_50px_rgba(0,0,0,0.9)] relative">
            <div className="compact-nail top-3 left-3" />
            <div className="compact-nail top-3 right-3" />
            <div className="compact-nail bottom-3 left-3" />
            <div className="compact-nail bottom-3 right-3" />

            <PauseCircle className="w-16 h-16 text-[#FF7A1A] mx-auto mb-4 animate-pulse" />
            <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-[#FFF8ED] tracking-widest uppercase heading-shadow mb-2">
              BATTLE PAUSED
            </h2>
            <p className="font-sans text-base text-[#D8C39F] font-semibold mb-4">
              The chieftain has halted the siege. The battle will resume shortly.
            </p>
            <div className="inline-block px-4 py-1.5 bg-[#140E0A] border border-[#5A4331] rounded-lg text-xs font-heading font-bold text-[#FFB347] tracking-wider uppercase">
              All clan progress and code are preserved
            </div>
          </div>
        </div>
      )}

      {/* Top-Right Event Plaque */}
      <div
        ref={plaqueRef}
        className="absolute top-2 right-2.5 2xl:top-3.5 2xl:right-4 z-40"
      >
        <div
          className="absolute left-3 z-0 pointer-events-none flex flex-col items-center"
          style={{
            top: `${-plaqueTopOffset - 6}px`,
            height: `${plaqueTopOffset + 12}px`,
          }}
        >
          <RopeSegment height="100%" width={10} />
          <div className="-mt-1.5">
            <RopeKnot size="sm" />
          </div>
        </div>
        <div
          className="absolute right-3 z-0 pointer-events-none flex flex-col items-center"
          style={{
            top: `${-plaqueTopOffset - 6}px`,
            height: `${plaqueTopOffset + 12}px`,
          }}
        >
          <RopeSegment height="100%" width={10} />
          <div className="-mt-1.5">
            <RopeKnot size="sm" />
          </div>
        </div>

        {/* Plaque Housing */}
        <div
          className={`relative broken-plank-shadow transition-transform duration-300 ${
            isHit ? 'plank-hit-shake' : ''
          }`}
          style={{ rotate: '0deg' }}
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

            {/* Sound Mute Toggle */}
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

            {/* Logout Button */}
            <button
              onClick={logout}
              className="relative z-10 compact-iron-btn p-1 2xl:p-1.5 sword-cursor hover:text-[#EF4444]"
              title={`Logged in as ${userTeam?.name || 'Viking'} (${userTeam?.memberName || 'Warrior'}) - Logout`}
            >
              <LogOut className="w-3.5 h-3.5 2xl:w-4 2xl:h-4 text-[#FFB347]" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Single-Screen Battle Arena */}
      <div className="relative z-20 h-full w-full max-w-[1920px] mx-auto p-2 md:p-2.5 2xl:p-3.5 flex flex-col justify-between">
        
        {/* Dragon HP Bar */}
        <header className="w-full flex justify-center mb-1 flex-shrink-0">
          <HPBar
            currentHp={hp}
            maxHp={maxHp}
            dragonName={dragonName}
            isDefeated={isDefeated}
            isHit={isHit}
          />
        </header>

        {/* 3-Column Arena Layout */}
        <main className="flex-1 min-h-0 w-full flex items-stretch gap-2.5 2xl:gap-5 my-auto">
          
          {/* Left Column: Rank, Leaderboard, Feed */}
          <motion.section
            ref={leftColRef}
            animate={{ rotate: [-0.35, 0.35, -0.35] }}
            transition={{ repeat: Infinity, duration: 8.5, ease: "easeInOut" }}
            style={{ transformOrigin: "top center" }}
            className="w-[20%] min-w-[270px] max-w-[340px] h-full flex flex-col justify-between gap-1.5 2xl:gap-2 flex-shrink-0 relative"
          >
            {/* Left Strand */}
            <div
              className="absolute pointer-events-none z-0"
              style={{
                top: `${-leftTopOffset - 6}px`,
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
                top: `${-leftTopOffset - 6}px`,
                bottom: "22px",
                right: "22px",
              }}
            >
              <RopeSegment height="100%" width={12} />
            </div>

            <div className="absolute -bottom-6 left-[16px] pointer-events-none z-10">
              <TerminalRopeKnot />
            </div>
            <div className="absolute -bottom-6 right-[16px] pointer-events-none z-10">
              <TerminalRopeKnot />
            </div>

            {/* 1. Rank Badge */}
            <div className="flex-shrink-0 relative z-10">
              <RankBadge
                rank={userTeamRank}
                teamName={userTeam?.name || "Viking Clan"}
                memberName={userTeam?.memberName}
                score={userTeam?.totalDamage ?? userTeam?.score ?? 0}
                isHit={isHit}
              />
            </div>

            {/* 2. Top 10 Leaderboard */}
            <div className="flex-1 min-h-0 flex flex-col justify-center relative z-10">
              <Leaderboard
                teams={teams}
                userTeamId={userTeam?.id}
                lastUpdated={lastLeaderboardUpdate}
                isHit={isHit}
              />
            </div>

            {/* 3. Live Feed */}
            <div className="flex-shrink-0 relative z-10">
              <LiveFeed
                feed={feed}
                lastFeedId={lastFeedId}
                isHit={isHit}
              />
            </div>
          </motion.section>

          {/* Center Column: Dragon & Weapons */}
          <section className="flex-1 min-w-0 h-full flex flex-col items-center justify-between relative px-2 overflow-visible">
            <FlyingProjectiles
              pendingFireEvents={pendingFireEvents}
              onProjectileImpact={onProjectileImpact}
              onStationRecoil={triggerStationRecoil}
            />

            <div className="flex-1 w-full flex items-end justify-center relative min-h-0 pb-4">
              <div className="translate-y-6 2xl:translate-y-10 w-full flex justify-center">
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
                  zoneHits={zoneHits}
                  activeFlashZone={activeFlashZone}
                  stuckBolts={stuckBolts}
                />
              </div>
            </div>
          </section>

          {/* Right Column: Tome of Trials */}
          <motion.section
            animate={{ rotate: [-0.15, 0.15, -0.15] }}
            transition={{ repeat: Infinity, duration: 9.2, delay: 0.8, ease: "easeInOut" }}
            style={{ transformOrigin: "top center" }}
            className="w-[24%] min-w-[320px] max-w-[400px] h-full flex flex-col justify-center flex-shrink-0 relative"
          >
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
          <span>Dexterity Battle Arena • Viking Coding Clash</span>
          <span className="font-heading tracking-wider text-[#FFB347] text-[10px] 2xl:text-[12px]">
            {userTeam?.name ? `Clan: ${userTeam.name} | Warrior: ${userTeam.memberName || 'Leader'}` : 'Viking Warband'}
          </span>
          <span>Click dragon or attempt trials to deal damage</span>
        </footer>
      </div>
    </div>
  );
}
