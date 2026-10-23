import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame } from 'lucide-react';

export default function LiveFeed({ feed = [], lastFeedId = null }) {
  // Only latest 4 entries, each strictly one single line
  const displayFeed = feed.slice(0, 4);

  return (
    <div className="relative flex flex-col items-center z-20 w-full" style={{ rotate: '0.4deg' }}>
      {/* Hanging Rope */}
      <div className="w-full flex justify-center -mb-1.5 z-10 pointer-events-none">
        <motion.div
          animate={lastFeedId ? { rotate: [0, -1.5, 1.5, -0.8, 0] } : {}}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center"
        >
          <div className="w-3.5 h-3.5 rounded-full border-2 border-[#685341] bg-[#140E0A] shadow-solid-ticket -mb-0.5" />
          <div
            className="w-2 h-4 2xl:h-5 bg-gradient-to-b from-[#8f6a43] to-[#593d22] border-x border-[#46301a]"
            style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)' }}
          />
        </motion.div>
      </div>

      {/* Hanging Compact Wooden Sign */}
      <div className="w-full compact-wood-board p-2.5 2xl:p-3 relative">
        {/* Compact Corner Nails */}
        <div className="compact-nail top-1.5 left-1.5" />
        <div className="compact-nail top-1.5 right-1.5" />
        <div className="compact-nail bottom-1.5 left-1.5" />
        <div className="compact-nail bottom-1.5 right-1.5" />

        {/* Title Header (20px-24px in Cinzel) */}
        <div className="flex items-center justify-between border-b-2 border-[#4A3A2C] pb-1 mb-1.5 px-0.5">
          <div className="flex items-center gap-1.5">
            <Flame className="w-4 h-4 2xl:w-5 2xl:h-5 text-[#FF7A1A]" />
            <h3 className="font-heading text-[17px] 2xl:text-[22px] tracking-wider uppercase text-[#FFF8ED] heading-shadow leading-tight">
              BATTLE LOG
            </h3>
          </div>
          <span className="font-heading text-[10px] 2xl:text-[11px] font-bold text-[#FFB347] bg-[#140E0A] px-1.5 py-0.2 rounded border border-[#5A4A3C]">
            LIVE
          </span>
        </div>

        {/* Feed List: Each single line, 16px at 1920x1080 (never below 13px) */}
        <div className="space-y-1 overflow-hidden">
          <AnimatePresence initial={false}>
            {displayFeed.map((item, idx) => {
              const isFirst = idx === 0;

              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, x: -18, scale: 0.97 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 18, scale: 0.94 }}
                  transition={{ type: "spring", stiffness: 350, damping: 26 }}
                  className={`h-[26px] 2xl:h-[30px] flex items-center justify-between px-2 rounded border text-[13px] 2xl:text-[16px] font-bold transition-all ${
                    isFirst
                      ? 'bg-[#332114] border-[#FF7A1A] shadow-solid-ticket text-[#FFF8ED]'
                      : 'bg-[#1e1611]/90 border-[#382b20] text-[#EBD4B7]'
                  }`}
                >
                  {/* Single Line Content */}
                  <div className="flex items-center gap-1.5 min-w-0 font-sans">
                    <span className="text-xs 2xl:text-sm flex-shrink-0">{item.crit ? '💥' : '⚔️'}</span>
                    <span className="truncate text-[#FFF8ED]">
                      <span className="text-[#FFB347] font-extrabold">{item.teamName}</span>{' '}
                      <span>hit for</span>{' '}
                      <span className="text-[#FF7A1A] font-extrabold">{item.damage}</span>!
                    </span>
                  </div>

                  <span className="font-heading text-[11px] 2xl:text-[13px] font-bold text-[#FF7A1A] bg-[#140E0A] px-1.5 py-0.2 rounded border border-[#4A3A2C] flex-shrink-0 ml-1">
                    -{item.damage}
                  </span>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
