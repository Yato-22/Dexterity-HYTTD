import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Skull, Crown } from 'lucide-react';
import {
  ASSET_PATHS,
  DRAGON_HIT_ZONES,
  DRAGON_EYES,
} from '../data/gameData';

export default function Dragon({
  hp,
  maxHp = 100,
  isHit = false,
  floatingDamages = [],
  sparks = [],
  isRoaring = false,
  roarText = "THE RED DEATH ROARS!",
  isDefeated = false,
  winnerTeam = "Team Alpha",
  zoneHits = { head: 0, chest: 0, leftWing: 0, rightWing: 0 },
  activeFlashZone = null, // { zone: 'head'|'chest'|'leftWing'|'rightWing', id }
  stuckBolts = [], // [{ id, x, y, angle }]
  onDragonClick,
}) {
  const hpPercent = Math.max(0, Math.min(100, (hp / maxHp) * 100));

  // Determine dragon eye glow color & intensity based on HP thresholds & roar
  let eyeGlowColor = '#FF9D43';
  let eyeGlowRadius = 6;
  let eyeOpacity = 0.7;

  if (hpPercent <= 25) {
    eyeGlowColor = '#FF1A1A';
    eyeGlowRadius = 16;
    eyeOpacity = 1.0;
  } else if (hpPercent <= 50) {
    eyeGlowColor = '#FF4500';
    eyeGlowRadius = 12;
    eyeOpacity = 0.9;
  } else if (hpPercent <= 75) {
    eyeGlowColor = '#FF7A1A';
    eyeGlowRadius = 9;
    eyeOpacity = 0.8;
  }

  if (isRoaring) {
    eyeGlowRadius = 22;
    eyeOpacity = 1.0;
    eyeGlowColor = '#FF0000';
  }

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-end select-none overflow-visible pb-12 sm:pb-16 2xl:pb-20">
      
      {/* Roar Announcement Banner on threshold hit (75%, 50%, 25%) */}
      <AnimatePresence>
        {isRoaring && (
          <motion.div
            initial={{ scale: 0.6, opacity: 0, y: -25 }}
            animate={{ scale: 1.05, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: -15 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className="absolute top-2 2xl:top-6 z-50 text-center pointer-events-none"
          >
            <div className="px-6 py-2 bg-[#7F1D1D] border-[3px] border-[#EF4444] rounded-lg shadow-solid-board flex items-center gap-2.5">
              <Flame className="w-6 h-6 2xl:w-8 2xl:h-8 text-[#FF4D4D] animate-bounce" />
              <span className="font-heading text-lg 2xl:text-2xl font-bold tracking-wider text-[#FFF] heading-shadow uppercase">
                {roarText}
              </span>
              <Flame className="w-6 h-6 2xl:w-8 2xl:h-8 text-[#FF4D4D] animate-bounce" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Half-Body Dragon Container */}
      <motion.div
        onClick={onDragonClick}
        animate={
          isDefeated
            ? {
                y: 220,
                rotate: 6,
                scale: 0.85,
                opacity: 0.15,
                filter: "grayscale(80%) brightness(0.4)",
              }
            : isRoaring
            ? {
                y: -24,
                scale: 1.04,
                rotate: [-0.5, 0.5, -0.5],
              }
            : isHit
            ? {
                x: [-10, 12, -8, 6, -3, 0],
                y: [4, -6, 5, -2, 1, 0],
                scale: 0.98,
              }
            : {
                scale: [1, 1.018, 1],
                y: [0, -6, 0],
                rotate: [-0.5, 0.5, -0.5],
              }
        }
        transition={
          isDefeated
            ? { duration: 2.5, ease: "easeInOut" }
            : isRoaring
            ? { duration: 0.6, ease: "easeOut" }
            : isHit
            ? { duration: 0.35, ease: "easeInOut" }
            : {
                repeat: Infinity,
                duration: 5.2,
                ease: "easeInOut",
              }
        }
        className="relative z-10 w-full flex items-end justify-center sword-cursor"
        style={{ transformOrigin: "bottom center" }}
      >
        {/* Dragon Graphic Wrapper with 4 Hit Zones and Overlays */}
        <div className="relative w-auto max-w-full flex items-end justify-center">
          {/* Dragon Image (about 55% of screen height) - turns red on hit */}
          <img
            src={ASSET_PATHS.dragonHalf || '/dragon.png'}
            alt="The Dreaded Red Death"
            style={{
              maskImage: 'linear-gradient(to bottom, black 92%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, black 92%, transparent 100%)',
            }}
            className={`h-[48vh] sm:h-[52vh] 2xl:h-[56vh] max-h-[580px] w-auto object-contain transition-all duration-150 pointer-events-none drop-shadow-[0_8px_24px_rgba(0,0,0,0.85)] ${
              isHit
                ? 'filter brightness-110 contrast-125 sepia hue-rotate-[315deg] saturate-[800%] drop-shadow-[0_0_35px_rgba(239,68,68,0.95)]'
                : hpPercent <= 25
                ? 'drop-shadow-[0_0_24px_rgba(217,48,37,0.7)]'
                : ''
            }`}
          />

          {/* =============================================================== */}
          {/* 1. IMPACT SPARKS BURST                                           */}
          {/* =============================================================== */}
          <AnimatePresence>
            {sparks.map((spark) => (
              <motion.div
                key={spark.id}
                initial={{ opacity: 1, scale: 0.3, x: 0, y: 0 }}
                animate={{ opacity: 0, scale: 1.8, x: spark.dx, y: spark.dy }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.55, ease: "easeOut" }}
                style={{
                  position: 'absolute',
                  left: `${spark.x}%`,
                  top: `${spark.y}%`,
                  pointerEvents: 'none',
                  zIndex: 45,
                }}
                className="w-3.5 h-3.5 rounded-full bg-gradient-to-r from-amber-200 via-orange-400 to-red-600 shadow-[0_0_10px_#ff7a1a]"
              />
            ))}
          </AnimatePresence>

          {/* =============================================================== */}
          {/* 2. FLOATING DAMAGE NUMBERS                                      */}
          {/* =============================================================== */}
          <AnimatePresence>
            {floatingDamages.map((dmg) => (
              <motion.div
                key={dmg.id}
                initial={{ opacity: 0, y: 0, scale: 0.6 }}
                animate={{ opacity: 1, y: -65, scale: dmg.crit ? 1.5 : 1.25 }}
                exit={{ opacity: 0, y: -95, scale: 0.9 }}
                transition={{ duration: 0.85, ease: "easeOut" }}
                style={{
                  position: 'absolute',
                  left: `${dmg.x}%`,
                  top: `${dmg.y}%`,
                  pointerEvents: 'none',
                  zIndex: 50,
                }}
                className="font-heading font-extrabold flex items-center gap-1 select-none whitespace-nowrap"
              >
                <span
                  className={`heading-shadow ${
                    dmg.crit
                      ? 'text-[#FFD700] text-2xl 2xl:text-3xl'
                      : dmg.damage >= 7
                      ? 'text-[#FF6B6B] text-xl 2xl:text-2xl'
                      : 'text-[#FFB347] text-lg 2xl:text-xl'
                  }`}
                >
                  -{dmg.damage}
                  {dmg.crit && " CRIT!"}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* =================================================================== */}
      {/* 6. 0 HP DEFEAT OVERLAY (Preserved victory screen)                   */}
      {/* =================================================================== */}
      <AnimatePresence>
        {isDefeated && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 25 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="absolute z-50 p-5 2xl:p-6 max-w-md w-full text-center compact-wood-board border-[3px] border-[#8B1C1C] shadow-solid-board"
          >
            <div className="compact-nail top-1.5 left-1.5" />
            <div className="compact-nail top-1.5 right-1.5" />
            <div className="compact-nail bottom-1.5 left-1.5" />
            <div className="compact-nail bottom-1.5 right-1.5" />

            <div className="flex items-center justify-center gap-2 mb-1.5">
              <Crown className="w-6 h-6 text-[#FFD700] animate-bounce" />
              <Skull className="w-6 h-6 text-[#EF4444]" />
              <Crown className="w-6 h-6 text-[#FFD700] animate-bounce" />
            </div>

            <h2 className="font-heading text-xl 2xl:text-2xl font-bold text-[#FFF8ED] tracking-wide mb-1.5 heading-shadow">
              THE RED DEATH IS SLAIN!
            </h2>

            <div className="my-2.5 py-2 px-3 bg-[#140E0A] border-2 border-[#FF7A1A] rounded-lg shadow-solid-ticket">
              <div className="text-[10px] 2xl:text-xs font-bold uppercase tracking-wider text-[#FFB347] mb-0.5">
                IMMORTAL CHAMPIONS
              </div>
              <div className="font-heading text-2xl 2xl:text-3xl font-bold text-[#FFD700] heading-shadow">
                {winnerTeam}
              </div>
            </div>

            <p className="text-sm 2xl:text-base font-bold text-[#EBD4B7] font-sans">
              Victory claimed by bravery and code!
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
