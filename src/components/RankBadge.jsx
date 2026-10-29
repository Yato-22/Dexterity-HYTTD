import React from 'react';
import BrokenPlankPanel from './BrokenPlankPanel';
import { RopeKnot } from './RopeGraphic';
import { User } from 'lucide-react';

export default function RankBadge({
  rank = 1,
  teamName = "Viking Clan",
  memberName = null,
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
        <div className="flex items-center gap-2 pl-7 pr-7">
          {/* Rank Number in Cinzel */}
          <div className="flex-shrink-0 flex items-center justify-center">
            <span className="font-heading text-[32px] md:text-[36px] 2xl:text-[42px] font-bold text-[#FFB347] heading-shadow leading-none select-none">
              #{rank}
            </span>
          </div>

          {/* Team Name and XP Beside It */}
          <div className="flex-1 min-w-0">
            <div className="font-heading text-[9.5px] 2xl:text-[10.5px] font-bold text-[#D8C39F] uppercase tracking-wider leading-none mb-0.5 flex items-center justify-between">
              <span>WARBAND STANDING</span>
              {memberName && (
                <span className="text-[#FFB347] flex items-center gap-0.5 normal-case font-sans font-semibold">
                  <User className="w-2.5 h-2.5 inline" /> {memberName}
                </span>
              )}
            </div>

            <div className="flex items-center justify-between gap-1">
              <span className="text-[13px] 2xl:text-[16px] font-bold text-[#FFF8ED] truncate leading-tight font-sans">
                {teamName}
              </span>
              <span className="font-heading text-[10.5px] 2xl:text-[12px] font-bold text-[#FF7A1A] bg-[#140E0A] px-1.5 py-0.2 rounded border border-[#5A4A3C] shadow-solid-ticket flex-shrink-0">
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
