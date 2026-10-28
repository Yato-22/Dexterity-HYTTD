import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../context/GameContext';
import HPBar from '../components/HPBar';
import Dragon from '../components/Dragon';
import Leaderboard from '../components/Leaderboard';
import LiveFeed from '../components/LiveFeed';
import Embers from '../components/Embers';
import WeaponStations from '../components/WeaponStations';
import FlyingProjectiles from '../components/FlyingProjectiles';
import { RopeSegment, RopeKnot, TerminalRopeKnot } from '../components/RopeGraphic';
import { Volume2, VolumeX, Flame, Monitor } from 'lucide-react';

export default function DisplayScreen() {
  const {
    hp,
    maxHp,
    dragonName,
    dragonStatus,
    teams,
    feed,
    isDefeated,
    winnerTeam,
    soundMuted,
    setSoundMuted,
    isHit,
    floatingDamages,
    sparks,
    isScreenShaking,
    isRoaring,
    activeFlashZone,
    stuckBolts,
    pendingFireEvents,
    recoilingStation,
    triggerStationRecoil,
    onProjectileImpact,
  } = useGame();

  const leftColRef = useRef(null);
  const [leftTopOffset, setLeftTopOffset] = useState(70);

  useEffect(() => {
    const updateMeasurements = () => {
      if (leftColRef.current) {
        const rect = leftColRef.current.getBoundingClientRect();
        setLeftTopOffset(rect.top);
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
      {/* Light 15% dark overlay only if needed */}
      <div className="absolute inset-0 bg-[#0C0806]/15 pointer-events-none" />

      {/* Floating Fiery Embers */}
      <Embers count={14} />

      {/* Top Banner: Spectator Bar */}
      <div className="absolute top-2 left-4 z-40 flex items-center gap-2 px-3 py-1 bg-[#140E0A]/85 border border-[#5A4331] rounded-lg shadow-md pointer-events-auto">
        <Monitor className="w-4 h-4 text-[#FFB347]" />
        <span className="font-heading text-xs font-bold uppercase tracking-wider text-[#FFD700]">
          PROJECTOR SPECTATOR VIEW
        </span>
        <span
          className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider ${
            dragonStatus === 'live'
              ? 'bg-[#15803D] text-[#DCFCE7]'
              : dragonStatus === 'defeated'
              ? 'bg-[#B91C1C] text-[#FEE2E2]'
              : 'bg-[#B45309] text-[#FEF3C7]'
          }`}
        >
          {dragonStatus}
        </span>
      </div>

      {/* Audio Mute Button */}
      <div className="absolute top-2 right-4 z-40">
        <button
          onClick={() => setSoundMuted(!soundMuted)}
          className="p-1.5 2xl:p-2 bg-[#1C140E]/80 hover:bg-[#2E1F16] border border-[#5C4028] rounded-md text-[#FFB347] transition-all"
          title={soundMuted ? 'Unmute' : 'Mute'}
        >
          {soundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
      </div>

      {/* TOP CENTER: Dragon HP Bar (Anchored seamlessly from screen top) */}
      <header className="w-full flex justify-center pt-2 2xl:pt-3 z-30 pointer-events-none">
        <div className="w-[480px] sm:w-[560px] 2xl:w-[680px] pointer-events-auto">
          <HPBar
            currentHp={hp}
            maxHp={maxHp}
            dragonName={dragonName}
            isDefeated={isDefeated}
            isHit={isHit}
          />
        </div>
      </header>

      {/* ===================================================================== */}
      {/* MAIN BATTLEFIELD GRID: Left Column (Feed/Board) + Center (Dragon)    */}
      {/* ===================================================================== */}
      <div className="h-[calc(100vh-84px)] 2xl:h-[calc(100vh-96px)] w-full flex items-stretch px-4 2xl:px-8 pb-3 gap-6 relative">
        {/* LEFT COLUMN: Parallel Continuous Ropes holding Leaderboard & Feed */}
        <motion.section
          ref={leftColRef}
          animate={{ rotate: [-0.18, 0.18, -0.18] }}
          transition={{ repeat: Infinity, duration: 8.5, ease: 'easeInOut' }}
          style={{ transformOrigin: 'top center' }}
          className="w-[30%] min-w-[340px] max-w-[420px] h-full flex flex-col justify-between flex-shrink-0 relative z-20 pt-4"
        >
          {/* Continuous Left Rope starting at viewport top edge */}
          <div className="absolute left-6 pointer-events-none z-30" style={{ top: `-${leftTopOffset + 6}px` }}>
            <RopeSegment length={leftTopOffset + 18} />
            <RopeKnot style={{ top: `${leftTopOffset + 6}px` }} />
          </div>

          {/* Continuous Right Rope starting at viewport top edge */}
          <div className="absolute right-6 pointer-events-none z-30" style={{ top: `-${leftTopOffset + 6}px` }}>
            <RopeSegment length={leftTopOffset + 18} />
            <RopeKnot style={{ top: `${leftTopOffset + 6}px` }} />
          </div>

          {/* Leaderboard Panel */}
          <div className="w-full flex-1 max-h-[50%] min-h-0 relative mb-3">
            <Leaderboard teams={teams} lastUpdated={Date.now()} />
          </div>

          {/* Live Feed Panel */}
          <div className="w-full flex-1 max-h-[46%] min-h-0 relative">
            <LiveFeed feed={feed} />
            {/* Terminal bottom knots */}
            <TerminalRopeKnot style={{ bottom: '-14px', left: '20px' }} />
            <TerminalRopeKnot style={{ bottom: '-14px', right: '20px' }} />
          </div>
        </motion.section>

        {/* CENTER COLUMN: Dragon Clean & Completely Unobstructed */}
        <section className="flex-1 min-w-0 h-full flex flex-col items-center justify-between relative px-2 overflow-visible">
          {/* Flying Projectiles Layer */}
          <FlyingProjectiles
            pendingFireEvents={pendingFireEvents}
            onProjectileImpact={onProjectileImpact}
            onStationRecoil={triggerStationRecoil}
          />

          {/* Dragon Half-Body blended into the field */}
          <div className="flex-1 w-full flex items-center justify-center relative min-h-0">
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
              zoneHits={{ head: 0, chest: 0, leftWing: 0, rightWing: 0 }}
              activeFlashZone={activeFlashZone}
              stuckBolts={stuckBolts}
            />
          </div>

          {/* Four Weapon Stations in open bottom-center */}
          <div className="w-full flex-shrink-0 z-30 pb-0.5">
            <WeaponStations
              recoilingStation={recoilingStation}
              isDefeated={isDefeated}
              inventory={{ dagger: 0, axe: 0, catapult: 0, ballista: 0 }}
            />
          </div>
        </section>
      </div>
    </div>
  );
}

