import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Skull, Crown } from 'lucide-react';

export default function Dragon({
  hp,
  maxHp = 100,
  isHit,
  floatingDamages = [],
  sparks = [],
  isRoaring = false,
  roarText = "THE DRAGON ROARS!",
  isDefeated = false,
  winnerTeam = "Team Alpha",
  onDragonClick,
}) {
  const hpPercent = Math.max(0, Math.min(100, (hp / maxHp) * 100));

  // Determine back glow aura intensity and anger color
  let auraGradient = "radial-gradient(circle, rgba(255, 122, 26, 0.42) 0%, rgba(255, 80, 0, 0.18) 40%, transparent 70%)";
  let pulseSpeed = 4.2;

  if (hpPercent <= 25) {
    auraGradient = "radial-gradient(circle, rgba(217, 48, 37, 0.72) 0%, rgba(255, 40, 20, 0.4) 40%, rgba(139, 0, 0, 0.18) 65%, transparent 80%)";
    pulseSpeed = 2.0;
  } else if (hpPercent <= 50) {
    auraGradient = "radial-gradient(circle, rgba(255, 100, 0, 0.55) 0%, rgba(255, 140, 20, 0.3) 45%, transparent 75%)";
    pulseSpeed = 3.0;
  } else if (hpPercent <= 75) {
    auraGradient = "radial-gradient(circle, rgba(255, 140, 30, 0.45) 0%, rgba(255, 100, 10, 0.22) 45%, transparent 72%)";
    pulseSpeed = 3.6;
  }

  return (
    <div className="relative flex-1 w-full h-full flex flex-col items-center justify-center select-none overflow-visible">
      {/* Background Fire Glow Aura behind the dragon */}
      <motion.div
        animate={isDefeated ? { opacity: 0.1, scale: 0.8 } : {
          scale: [1, 1.15, 1],
          opacity: [0.75, 1, 0.75],
        }}
        transition={{
          repeat: Infinity,
          duration: pulseSpeed,
          ease: "easeInOut",
        }}
        className="absolute w-[400px] 2xl:w-[580px] h-[400px] 2xl:h-[580px] rounded-full pointer-events-none z-0"
        style={{ background: auraGradient }}
      />

      {/* Roar Announcement Banner on threshold hit */}
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

      {/* Main Dragon Container with Breathing Animation */}
      <motion.div
        onClick={onDragonClick}
        animate={
          isDefeated
            ? { y: 50, opacity: 0.25, filter: "grayscale(100%) brightness(0.4)", rotate: 4 }
            : isHit
            ? {
                x: [-10, 12, -8, 6, -3, 0],
                y: [3, -5, 4, -2, 1, 0],
                scale: 0.97,
              }
            : {
                scale: [1, 1.025, 1],
                y: [0, -7, 0],
              }
        }
        transition={
          isDefeated
            ? { duration: 1.5, ease: "easeOut" }
            : isHit
            ? { duration: 0.35, ease: "easeInOut" }
            : {
                repeat: Infinity,
                duration: pulseSpeed,
                ease: "easeInOut",
              }
        }
        className="relative z-10 w-full max-w-xl 2xl:max-w-2xl flex items-center justify-center sword-cursor"
      >
        <div className="relative">
          <img
            src="/dragon.png"
            alt="The Dreaded Red Death Dragon"
            className={`w-full max-h-[340px] 2xl:max-h-[460px] object-contain transition-all duration-150 ${
              isHit
                ? 'filter brightness-150 contrast-125 drop-shadow-[0_0_30px_rgba(239,68,68,0.95)]'
                : hpPercent <= 25
                ? 'drop-shadow-[0_0_28px_rgba(217,48,37,0.7)]'
                : 'drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]'
            }`}
          />

          {/* Hit Red Flash Overlay */}
          <AnimatePresence>
            {isHit && (
              <motion.div
                initial={{ opacity: 0.8 }}
                animate={{ opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 bg-red-600/30 rounded-full mix-blend-color-dodge pointer-events-none"
              />
            )}
          </AnimatePresence>

          {/* Spark Burst at Impact Spot */}
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
                }}
                className="w-3.5 h-3.5 rounded-full bg-gradient-to-r from-amber-200 via-orange-400 to-red-600 shadow-[0_0_10px_#ff7a1a] z-30"
              />
            ))}
          </AnimatePresence>

          {/* Floating Damage Numbers */}
          <AnimatePresence>
            {floatingDamages.map((dmg) => (
              <motion.div
                key={dmg.id}
                initial={{ opacity: 0, y: 0, scale: 0.6 }}
                animate={{ opacity: 1, y: -60, scale: dmg.crit ? 1.5 : 1.25 }}
                exit={{ opacity: 0, y: -90, scale: 0.9 }}
                transition={{ duration: 0.85, ease: "easeOut" }}
                style={{
                  position: 'absolute',
                  left: `${dmg.x}%`,
                  top: `${dmg.y}%`,
                  pointerEvents: 'none',
                }}
                className="z-40 font-heading font-extrabold flex items-center gap-1 select-none whitespace-nowrap"
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

      {/* 0 HP Defeat Overlay */}
      <AnimatePresence>
        {isDefeated && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 25 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
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
              THE DRAGON IS SLAIN!
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
