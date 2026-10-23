import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Skull } from 'lucide-react';

export default function HPBar({ currentHp, maxHp = 100, dragonName = "THE RED DEATH", isDefeated = false }) {
  const hpPercent = Math.max(0, Math.min(100, (currentHp / maxHp) * 100));

  // Determine bar fill based on HP brackets
  let fillGradient = "";
  let glowColor = "";
  let textColor = "";

  if (hpPercent > 50) {
    fillGradient = "from-[#2e7d32] via-[#4CAF50] to-[#81c784]";
    glowColor = "rgba(76, 175, 80, 0.4)";
    textColor = "#81C784";
  } else if (hpPercent > 25) {
    fillGradient = "from-[#d48806] via-[#F2C230] to-[#ffd666]";
    glowColor = "rgba(242, 194, 48, 0.5)";
    textColor = "#F2C230";
  } else {
    fillGradient = "from-[#991b1b] via-[#D93025] to-[#ff6b6b]";
    glowColor = "rgba(217, 48, 37, 0.65)";
    textColor = "#FF6B6B";
  }

  return (
    <div className="relative z-30 max-w-xl 2xl:max-w-2xl w-full mx-auto" style={{ rotate: '0.3deg' }}>
      {/* Compact Wooden Beam Housing (20% less tall) */}
      <div className="compact-wooden-beam px-3.5 py-1.5 2xl:px-4 2xl:py-2 relative">
        {/* Compact Corner Nails */}
        <div className="compact-nail top-1.5 left-2" />
        <div className="compact-nail top-1.5 right-2" />
        <div className="compact-nail bottom-1.5 left-2" />
        <div className="compact-nail bottom-1.5 right-2" />

        {/* Dragon Title & HP Numbers */}
        <div className="flex items-center justify-between mb-1 px-1.5">
          <div className="flex items-center gap-1.5">
            <Flame className={`w-4 h-4 2xl:w-5 2xl:h-5 ${hpPercent <= 25 ? 'text-[#D93025] animate-bounce' : 'text-[#FF7A1A]'}`} />
            <h2 className="font-heading text-[16px] 2xl:text-[21px] font-bold tracking-wider text-[#FFF8ED] heading-shadow leading-tight">
              {dragonName}
            </h2>
            {hpPercent <= 25 && !isDefeated && (
              <span className="font-heading text-[9px] 2xl:text-[11px] font-bold bg-[#8B1C1C] text-[#FFF] px-1.5 py-0.2 rounded border border-[#EF4444] animate-pulse">
                FRENZIED
              </span>
            )}
            {isDefeated && (
              <span className="font-heading text-[9px] 2xl:text-[11px] font-bold bg-[#1F2937] text-[#FFF] px-1.5 py-0.2 rounded border border-[#4B5563]">
                FALLEN
              </span>
            )}
          </div>

          {/* High Contrast HP Numbers */}
          <div className="font-heading text-[15px] 2xl:text-[19px] font-bold tracking-wide text-[#FFF8ED] heading-shadow">
            <span style={{ color: textColor }}>HP {currentHp}</span>
            <span className="text-[#A89078] mx-1">/</span>
            <span className="text-[#FFF8ED]">{maxHp}</span>
          </div>
        </div>

        {/* Bar Track Container (Reduced Height) */}
        <div className="relative h-5 2xl:h-6 bg-[#100C09] rounded-md p-0.5 border-2 border-[#4A3A2C] shadow-inner overflow-hidden">
          {/* Threshold markers */}
          <div className="absolute top-0 bottom-0 left-[25%] w-[1.5px] bg-[#3A2C20] z-20 pointer-events-none" />
          <div className="absolute top-0 bottom-0 left-[50%] w-[1.5px] bg-[#3A2C20] z-20 pointer-events-none" />
          <div className="absolute top-0 bottom-0 left-[75%] w-[1.5px] bg-[#3A2C20] z-20 pointer-events-none" />

          {/* Animated Lava Health Bar Fill */}
          <motion.div
            initial={false}
            animate={{ width: `${hpPercent}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 18 }}
            className={`relative h-full rounded-sm bg-gradient-to-r ${fillGradient} hp-fill-lava overflow-hidden`}
            style={{
              boxShadow: `0 0 12px ${glowColor}, inset 0 1.5px 2px rgba(255,255,255,0.4)`,
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[pulse_2s_infinite]" />
          </motion.div>
        </div>

        {/* Phase Markers */}
        <div className="flex justify-between items-center text-[10px] 2xl:text-[12px] font-bold text-[#D8C39F] mt-0.5 px-1 font-sans">
          <span className="flex items-center gap-0.5 text-[#EF4444]">
            <Skull className="w-2.5 h-2.5" /> 0% SLAIN
          </span>
          <span>25% ROAR</span>
          <span>50% ROAR</span>
          <span>75% ROAR</span>
          <span className="text-[#81C784]">100% HEALTH</span>
        </div>
      </div>
    </div>
  );
}
