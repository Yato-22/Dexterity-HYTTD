import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame } from 'lucide-react';
import BrokenPlankPanel from './BrokenPlankPanel';
import { RopeKnot, TerminalRopeKnot } from './RopeGraphic';

export default function LiveFeed({ feed = [], lastFeedId = null, isHit = false }) {
  const displayFeed = feed.slice(0, 4);

  return (
    <div className="relative w-full">
      {/* Knots above the two panel holes */}
      <div className="absolute -top-2 left-[16px] z-30 pointer-events-none">
        <RopeKnot size="md" />
      </div>
      <div className="absolute -top-2 right-[16px] z-30 pointer-events-none">
        <RopeKnot size="md" />
      </div>

      <BrokenPlankPanel
        clipVariant={3}
        plankCount={2}
        hasDualRopeHoles={true}
        ropeHoles={[{ top: "8px", left: "22px" }, { top: "8px", right: "22px" }]}
        isHit={isHit}
        rotation={-0.5}
        className="w-full"
      >
        {/* Title Header */}
        <div className="flex items-center justify-between border-b-2 border-[#4A3A2C] pb-1 mb-1 px-0.5 px-6">
          <div className="flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 2xl:w-4 2xl:h-4 text-[#FF7A1A]" />
            <h3 className="font-heading text-[15px] 2xl:text-[18px] tracking-wider uppercase text-[#FFF8ED] heading-shadow leading-tight">
              BATTLE LOG
            </h3>
          </div>
          <span className="font-heading text-[8px] 2xl:text-[9px] font-bold text-[#FFB347] bg-[#140E0A] px-1.5 py-0.2 rounded border border-[#5A4A3C]">
            LIVE
          </span>
        </div>

        {/* Feed List */}
        <div className="space-y-1 overflow-hidden">
          <AnimatePresence initial={false}>
            {displayFeed.map((item, idx) => {
              const isFirst = idx === 0;

              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, x: -15, scale: 0.97 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 15, scale: 0.94 }}
                  transition={{ type: "spring", stiffness: 350, damping: 26 }}
                  className={`h-[24px] 2xl:h-[28px] flex items-center justify-between px-2 rounded border text-[12px] 2xl:text-[14px] font-bold transition-all ${
                    isFirst
                      ? 'bg-[#332114] border-[#FF7A1A] shadow-solid-ticket text-[#FFF8ED]'
                      : 'bg-[#18110b]/90 border-[#382b20] text-[#EBD4B7]'
                  }`}
                >
                  <div className="flex items-center gap-1.5 min-w-0 font-sans">
                    <span className="text-xs flex-shrink-0">⚔️</span>
                    <span className="truncate text-[#FFF8ED]">
                      {item.customText ? (
                        <span>{item.customText}</span>
                      ) : (
                        <>
                          <span className="text-[#FFB347] font-extrabold">{item.teamName}</span>{' '}
                          <span>hit for</span>{' '}
                          <span className="text-[#FF7A1A] font-extrabold">{item.damage}</span>!
                        </>
                      )}
                    </span>
                  </div>

                  <span className="font-heading text-[9px] 2xl:text-[11px] font-bold text-[#FF7A1A] bg-[#140E0A] px-1.5 py-0.2 rounded border border-[#4A3A2C] flex-shrink-0 ml-1">
                    -{item.damage}
                  </span>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </BrokenPlankPanel>

      {/* Two Terminal Knots with Tassels below the left and right strands */}
      <div className="absolute -bottom-7 left-[12px] z-30 pointer-events-none">
        <TerminalRopeKnot />
      </div>
      <div className="absolute -bottom-7 right-[12px] z-30 pointer-events-none">
        <TerminalRopeKnot />
      </div>
    </div>
  );
}
