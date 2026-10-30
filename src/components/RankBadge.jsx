import React from 'react';
import BrokenPlankPanel from './BrokenPlankPanel';
import { RopeKnot } from './RopeGraphic';
import { User } from 'lucide-react';

export default function RankBadge({
  rank = 1,
  teamName = "Viking Clan",
  memberName = null,
  memberSolvedCount = 0,
  teamSolvedCount = null,
  score = 0,
  isHit = false,
}) {
  return (
    <div className="relative w-full">
      {/* Knots above the two drilled holes */}
      <div className="absolute -top-2 left-[16px] z-30 pointer-events-none">
        <RopeKnot size="md" />
      </div>
      <div className="absolute -top-2 right-[16px] z-30 pointer-events-none">
        <RopeKnot size="md" />
      </div>

      <BrokenPlankPanel
        clipVariant={1}
        plankCount={2}
        hasDualRopeHoles={true}
        ropeHoles={[{ top: "8px", left: "22px" }, { top: "8px", right: "22px" }]}
        isHit={isHit}
        rotation={-0.6}
        className="w-full"
      >
        <div className="flex items-center gap-3 pl-6 pr-6 py-2">
          {/* Rank Number in Cinzel with subtle label */}
          <div className="flex-shrink-0 flex flex-col items-center justify-center">
            <span className="font-heading text-[10px] 2xl:text-[11px] font-bold text-[#D8C39F] uppercase tracking-wider leading-none">
              RANK
            </span>
            <span className="font-heading text-[32px] md:text-[36px] 2xl:text-[42px] font-bold text-[#FFB347] heading-shadow leading-none select-none mt-0.5">
              #{rank}
            </span>
          </div>

          {/* Right Area: Top Team name & XP + Bottom Prominent Solved Counts */}
          <div className="flex-1 min-w-0 flex flex-col justify-center gap-1.5">
            {/* Top row: Team Name + XP badge */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-[15px] 2xl:text-[18px] font-bold text-[#FFF8ED] truncate font-sans">
                {teamName}
              </span>
              <span className="font-heading text-xs 2xl:text-sm font-bold text-[#FF7A1A] bg-[#140E0A] px-2 py-0.5 rounded border border-[#5A4A3C] shadow-solid-ticket flex-shrink-0">
                {score} XP
              </span>
            </div>

            {/* Bottom row: Clean, clearly legible Solved Count Badges */}
            {memberName && (
              <div className="flex items-center gap-2 whitespace-nowrap">
                <span className="text-[#FFB347] font-sans font-bold text-[13px] 2xl:text-[14.5px] flex items-center gap-1.5 bg-[#140E0A]/95 px-2 py-0.5 rounded border border-[#5A4331] shadow-sm">
                  <User className="w-3.5 h-3.5 text-[#FF9D43] flex-shrink-0" />
                  <span>{memberName} - <span className="text-[#FFF8ED] font-extrabold">{memberSolvedCount}</span> solved</span>
                </span>
                {teamSolvedCount !== null && (
                  <span className="text-[#86EFAC] font-sans font-bold text-[13px] 2xl:text-[14.5px] bg-[#140E0A]/95 px-2 py-0.5 rounded border border-[#2D5A2D] shadow-sm">
                    Team: <span className="text-[#FFF8ED] font-extrabold">{teamSolvedCount}</span>
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </BrokenPlankPanel>

      {/* Knots below the two drilled holes */}
      <div className="absolute -bottom-2 left-[16px] z-30 pointer-events-none">
        <RopeKnot size="md" />
      </div>
      <div className="absolute -bottom-2 right-[16px] z-30 pointer-events-none">
        <RopeKnot size="md" />
      </div>
    </div>
  );
}
