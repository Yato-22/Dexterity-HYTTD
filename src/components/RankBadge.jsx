import React from 'react';
import { motion } from 'framer-motion';

export default function RankBadge({ rank = 3, teamName = "Team Alpha", score = 48 }) {
  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.4 }}
      style={{ rotate: '-0.7deg' }}
      className="relative z-20 w-full"
    >
      <div className="compact-wood-board px-3 py-2 relative overflow-hidden">
        {/* Compact Corner Nails */}
        <div className="compact-nail top-1.5 left-1.5" />
        <div className="compact-nail top-1.5 right-1.5" />
        <div className="compact-nail bottom-1.5 left-1.5" />
        <div className="compact-nail bottom-1.5 right-1.5" />

        <div className="flex items-center gap-3 pl-1">
          {/* Rank Number about 48px in Cinzel */}
          <div className="flex-shrink-0 flex items-center justify-center">
            <span className="font-heading text-[40px] md:text-[44px] 2xl:text-[48px] font-bold text-[#FFB347] heading-shadow leading-none select-none">
              #{rank}
            </span>
          </div>

          {/* Team Name and XP Beside It */}
          <div className="flex-1 min-w-0">
            <div className="font-heading text-[11px] 2xl:text-[13px] font-bold text-[#D8C39F] uppercase tracking-wider leading-none mb-1">
              WARBAND STANDING
            </div>

            <div className="flex items-center justify-between gap-1.5">
              <span className="text-[16px] 2xl:text-[18px] font-bold text-[#FFF8ED] truncate leading-tight font-sans">
                {teamName}
              </span>
              <span className="font-heading text-[13px] 2xl:text-[15px] font-bold text-[#FF7A1A] bg-[#140E0A] px-2 py-0.5 rounded border border-[#5A4A3C] shadow-solid-ticket flex-shrink-0">
                {score} XP
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
