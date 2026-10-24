import React from 'react';
import { motion } from 'framer-motion';
import BrokenPlankPanel from './BrokenPlankPanel';
import { RopeKnot } from './RopeGraphic';

export default function Leaderboard({
  teams = [],
  userTeamId = "team-3",
  lastUpdated = null,
  isHit = false,
}) {
  const sortedTeams = [...teams].sort((a, b) => b.score - a.score);
  const userTeamIndex = sortedTeams.findIndex((t) => t.id === userTeamId || t.isUserTeam);
  const isUserOutsideTop10 = userTeamIndex >= 10;
  const userTeam = userTeamIndex !== -1 ? sortedTeams[userTeamIndex] : null;

  const displayTeams = isUserOutsideTop10
    ? sortedTeams.slice(0, 9)
    : sortedTeams.slice(0, 10);

  return (
    <div className="relative w-full">
      {/* Knots above the two panel holes */}
      <div className="absolute -top-2 left-[16px] z-30 pointer-events-none">
        <RopeKnot size="md" />
      </div>
      <div className="absolute -top-2 right-[16px] z-30 pointer-events-none">
        <RopeKnot size="md" />
      </div>

      {/* Knots below the two panel holes */}
      <div className="absolute -bottom-2 left-[16px] z-30 pointer-events-none">
        <RopeKnot size="md" />
      </div>
      <div className="absolute -bottom-2 right-[16px] z-30 pointer-events-none">
        <RopeKnot size="md" />
      </div>

      <BrokenPlankPanel
        clipVariant={2}
        plankCount={3}
        hasDualRopeHoles={true}
        ropeHoles={[{ top: "8px", left: "22px" }, { top: "8px", right: "22px" }]}
        isHit={isHit}
        rotation={0.4}
        className="w-full"
      >
        {/* Title Header */}
        <div className="border-b-2 border-[#4A3A2C] pb-1 mb-1 text-center px-6">
          <h3 className="font-heading text-[16px] 2xl:text-[20px] tracking-wider text-[#FFF8ED] uppercase heading-shadow leading-tight">
            TOP 10 WARBANDS
          </h3>
        </div>

        {/* Rows */}
        <div className="space-y-0.5">
          {displayTeams.map((team, index) => {
            const isUser = team.id === userTeamId || team.isUserTeam;
            const rank = index + 1;

            return (
              <motion.div
                key={team.id}
                layout
                transition={{ type: "spring", stiffness: 350, damping: 28 }}
                className={`h-[26px] md:h-[28px] 2xl:h-[32px] flex items-center justify-between px-2 rounded border transition-all ${
                  isUser
                    ? 'user-team-highlight text-[#FFF8ED]'
                    : 'bg-[#18110b]/90 border-[#382b20] text-[#FFF8ED]'
                }`}
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <span
                    className={`font-heading text-[11px] 2xl:text-[13px] font-bold w-4 text-right leading-none ${
                      rank === 1 ? 'text-[#FFD700]' : rank === 2 ? 'text-[#E0E0E0]' : rank === 3 ? 'text-[#CD7F32]' : 'text-[#D8C39F]'
                    }`}
                  >
                    #{rank}
                  </span>
                  <span className="text-[12px] 2xl:text-[15px] font-bold truncate text-[#FFF8ED] leading-none font-sans">
                    {team.name}
                  </span>
                  {isUser && (
                    <span className="font-heading text-[8px] uppercase tracking-wide text-[#14100D] bg-[#FF7A1A] px-1 py-0.2 rounded font-extrabold flex-shrink-0">
                      YOU
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 flex-shrink-0 pl-1">
                  <span className="font-heading text-[12px] 2xl:text-[14px] font-bold text-[#FFB347] leading-none heading-shadow">
                    {team.score}
                  </span>
                  <span className="text-[9px] 2xl:text-[10px] font-bold text-[#D8C39F] uppercase font-sans">
                    XP
                  </span>
                </div>
              </motion.div>
            );
          })}

          {isUserOutsideTop10 && userTeam && (
            <>
              <div className="text-center text-[9px] leading-none font-bold text-[#8F745B] py-0.2">
                • • •
              </div>
              <motion.div
                key={userTeam.id}
                layout
                className="h-[26px] md:h-[28px] 2xl:h-[32px] flex items-center justify-between px-2 rounded border user-team-highlight text-[#FFF8ED]"
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="font-heading text-[11px] 2xl:text-[13px] font-bold text-[#FF7A1A] w-4 text-right leading-none">
                    #{userTeamIndex + 1}
                  </span>
                  <span className="text-[12px] 2xl:text-[15px] font-bold truncate text-[#FFF8ED] leading-none font-sans">
                    {userTeam.name}
                  </span>
                  <span className="font-heading text-[8px] uppercase tracking-wide text-[#14100D] bg-[#FF7A1A] px-1 py-0.2 rounded font-extrabold flex-shrink-0">
                    YOU
                  </span>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0 pl-1">
                  <span className="font-heading text-[12px] 2xl:text-[14px] font-bold text-[#FFB347] leading-none heading-shadow">
                    {userTeam.score}
                  </span>
                  <span className="text-[9px] 2xl:text-[10px] font-bold text-[#D8C39F] uppercase font-sans">
                    XP
                  </span>
                </div>
              </motion.div>
            </>
          )}
        </div>
      </BrokenPlankPanel>

      {/* Knots below the two panel holes */}
      <div className="absolute -bottom-2 left-[16px] z-30 pointer-events-none">
        <RopeKnot size="md" />
      </div>
      <div className="absolute -bottom-2 right-[16px] z-30 pointer-events-none">
        <RopeKnot size="md" />
      </div>
    </div>
  );
}
