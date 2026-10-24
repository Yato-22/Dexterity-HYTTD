import React from 'react';
import BrokenPlankPanel from './BrokenPlankPanel';
import { RopeKnot } from './RopeGraphic';

export default function RankBadge({ rank = 3, teamName = "Team Alpha", score = 48, isHit = false }) {
  return (
    <div className="relative w-full">
      {/* Knots above the two drilled holes */}
      <div className="absolute -top-2 left-[16px] z-30 pointer-events-none">
        <RopeKnot size="md" />
      </div>
      <div className="absolute -top-2 right-[16px] z-30 pointer-events-none">
        <RopeKnot size="md" />
      </div>

      {/* Knots below the two drilled holes */}
      <div className="absolute -bottom-2 left-[16px] z-30 pointer-events-none">
        <RopeKnot size="md" />
      </div>
      <div className="absolute -bottom-2 right-[16px] z-30 pointer-events-none">
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
            <span className="font-heading text-[36px] md:text-[40px] 2xl:text-[46px] font-bold text-[#FFB347] heading-shadow leading-none select-none">
              #{rank}
            </span>
          </div>

          {/* Team Name and XP Beside It */}
          <div className="flex-1 min-w-0">
            <div className="font-heading text-[10px] 2xl:text-[11px] font-bold text-[#D8C39F] uppercase tracking-wider leading-none mb-0.5">
              WARBAND STANDING
            </div>

            <div className="flex items-center justify-between gap-1">
              <span className="text-[14px] 2xl:text-[17px] font-bold text-[#FFF8ED] truncate leading-tight font-sans">
                {teamName}
              </span>
              <span className="font-heading text-[11px] 2xl:text-[13px] font-bold text-[#FF7A1A] bg-[#140E0A] px-1.5 py-0.2 rounded border border-[#5A4A3C] shadow-solid-ticket flex-shrink-0">
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
