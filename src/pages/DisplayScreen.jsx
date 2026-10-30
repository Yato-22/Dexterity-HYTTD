import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../context/GameContext';
import HPBar from '../components/HPBar';
import Dragon from '../components/Dragon';
import Leaderboard from '../components/Leaderboard';
import LiveFeed from '../components/LiveFeed';
import Embers from '../components/Embers';
import FlyingProjectiles from '../components/FlyingProjectiles';
import { RopeSegment, RopeKnot, TerminalRopeKnot } from '../components/RopeGraphic';
import { Volume2, VolumeX, Flame, Monitor, PauseCircle } from 'lucide-react';

export default function DisplayScreen() {
  const {
    hp,
    maxHp,
    dragonName,
    dragonStatus,
    isPaused,
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
              All clan progress and scores are frozen in place
            </div>
          </div>
        </div>
      )}

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
              : dragonStatus === 'paused'
              ? 'bg-[#9A3412] text-[#FFEDD5]'
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

      {/* Dragon HP Bar */}
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

      {/* Main Battlefield Grid */}
      <div className="h-[calc(100vh-84px)] 2xl:h-[calc(100vh-96px)] w-full flex items-stretch px-4 2xl:px-8 pb-3 gap-6 relative">
        <motion.section
          ref={leftColRef}
          animate={{ rotate: [-0.18, 0.18, -0.18] }}
          transition={{ repeat: Infinity, duration: 8.5, ease: 'easeInOut' }}
          style={{ transformOrigin: 'top center' }}
          className="w-[30%] min-w-[340px] max-w-[420px] h-full flex flex-col justify-between flex-shrink-0 relative z-20 pt-4"
        >
          <div className="absolute left-6 pointer-events-none z-30" style={{ top: `-${leftTopOffset + 6}px` }}>
            <RopeSegment length={leftTopOffset + 18} />
            <RopeKnot style={{ top: `${leftTopOffset + 6}px` }} />
          </div>

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
            <TerminalRopeKnot style={{ bottom: '-14px', left: '20px' }} />
            <TerminalRopeKnot style={{ bottom: '-14px', right: '20px' }} />
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
            <div className="translate-y-8 2xl:translate-y-14 w-full flex justify-center">
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
          </div>
        </section>
      </div>
    </div>
  );
}
