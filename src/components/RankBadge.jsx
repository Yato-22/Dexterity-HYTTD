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
        <div className="flex items-center gap-3 pl-6 pr-6 py-1">
          {/* Rank Number in Cinzel */}
          <div className="flex-shrink-0 flex items-center justify-center">
            <span className="font-heading text-[34px] md:text-[38px] 2xl:text-[44px] font-bold text-[#FFB347] heading-shadow leading-none select-none">
              #{rank}
            </span>
          </div>

          {/* Right Area: Top stats bar + Bottom Team name & XP */}
          <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
            {/* Top row: Title + Clean Solved Count Badges */}
            <div className="flex items-center justify-between gap-2 leading-none">
              <span className="font-heading text-[10px] 2xl:text-[11.5px] font-bold text-[#D8C39F] uppercase tracking-wider">
                WARBAND STANDING
              </span>
              {memberName && (
                <div className="flex items-center gap-2 whitespace-nowrap">
                  <span className="text-[#FFB347] font-sans font-bold text-xs 2xl:text-sm flex items-center gap-1 bg-[#140E0A]/90 px-1.5 py-0.5 rounded border border-[#5A4331]">
                    <User className="w-3 h-3 text-[#FF9D43] flex-shrink-0" />
                    <span>{memberName} - <span className="text-[#FFF8ED]">{memberSolvedCount}</span> solved</span>
                  </span>
                  {teamSolvedCount !== null && (
                    <span className="text-[#86EFAC] font-sans font-bold text-xs 2xl:text-sm bg-[#140E0A]/90 px-1.5 py-0.5 rounded border border-[#2D5A2D]">
                      Team: <span className="text-[#FFF8ED]">{teamSolvedCount}</span>
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Bottom row: Team Name + XP badge */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-[15px] 2xl:text-[18px] font-bold text-[#FFF8ED] truncate font-sans">
                {teamName}
              </span>
              <span className="font-heading text-xs 2xl:text-sm font-bold text-[#FF7A1A] bg-[#140E0A] px-2 py-0.5 rounded border border-[#5A4A3C] shadow-solid-ticket flex-shrink-0">
                {score} XP
              </span>
            </div>
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
