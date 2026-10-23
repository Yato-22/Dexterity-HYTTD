import React from 'react';
import { motion } from 'framer-motion';

export default function Leaderboard({ teams = [], userTeamId = "team-3", lastUpdated = null }) {
  // Sort teams descending by score
  const sortedTeams = [...teams].sort((a, b) => b.score - a.score);

  // Check if user is within top 10
  const userTeamIndex = sortedTeams.findIndex((t) => t.id === userTeamId || t.isUserTeam);
  const isUserOutsideTop10 = userTeamIndex >= 10;
  const userTeam = userTeamIndex !== -1 ? sortedTeams[userTeamIndex] : null;

  // Teams to display (Top 10, or Top 9 + user team replacing 10th row)
  const displayTeams = isUserOutsideTop10
    ? sortedTeams.slice(0, 9)
    : sortedTeams.slice(0, 10);

  return (
    <div className="relative flex flex-col items-center z-20 w-full">
      {/* Hanging Ropes and Iron Rings */}
      <div className="w-full flex justify-between px-6 2xl:px-8 -mb-1.5 z-10 pointer-events-none">
        {/* Left Rope & Ring */}
        <motion.div
          animate={lastUpdated ? { rotate: [0, -1.5, 1.5, -0.8, 0] } : {}}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center"
        >
          <div className="w-4 h-4 rounded-full border-2 border-[#685341] bg-[#140E0A] shadow-solid-ticket -mb-0.5" />
          <div
            className="w-2.5 h-5 2xl:h-6 bg-gradient-to-b from-[#8f6a43] to-[#593d22] border-x border-[#46301a]"
            style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)' }}
          />
        </motion.div>

        {/* Right Rope & Ring */}
        <motion.div
          animate={lastUpdated ? { rotate: [0, 1.5, -1.5, 0.8, 0] } : {}}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center"
        >
          <div className="w-4 h-4 rounded-full border-2 border-[#685341] bg-[#140E0A] shadow-solid-ticket -mb-0.5" />
          <div
            className="w-2.5 h-5 2xl:h-6 bg-gradient-to-b from-[#8f6a43] to-[#593d22] border-x border-[#46301a]"
            style={{ backgroundImage: 'repeating-linear-gradient(-45deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)' }}
          />
        </motion.div>
      </div>

      {/* Main Hanging Compact Board */}
      <motion.div
        animate={lastUpdated ? { rotate: [-0.6, 0, -0.8, -0.6] } : {}}
        transition={{ duration: 0.9, ease: "easeOut" }}
        style={{ rotate: '-0.6deg' }}
        className="w-full compact-wood-board p-2.5 2xl:p-3 relative"
      >
        {/* Compact Corner Nails */}
        <div className="compact-nail top-1.5 left-1.5" />
        <div className="compact-nail top-1.5 right-1.5" />
        <div className="compact-nail bottom-1.5 left-1.5" />
        <div className="compact-nail bottom-1.5 right-1.5" />

        {/* Board Heading in Cinzel (24px at 1920x1080) */}
        <div className="border-b-2 border-[#4A3A2C] pb-1 mb-1.5 text-center">
          <h3 className="font-heading text-[18px] 2xl:text-[24px] tracking-wider text-[#FFF8ED] uppercase heading-shadow leading-tight">
            TOP 10 WARBANDS
          </h3>
        </div>

        {/* Single Line Rows (~34px tall) */}
        <div className="space-y-1">
          {displayTeams.map((team, index) => {
            const isUser = team.id === userTeamId || team.isUserTeam;
            const rank = index + 1;

            return (
              <motion.div
                key={team.id}
                layout
                transition={{ type: "spring", stiffness: 350, damping: 28 }}
                className={`h-[28px] md:h-[30px] 2xl:h-[34px] flex items-center justify-between px-2 2xl:px-2.5 rounded border transition-all ${
                  isUser
                    ? 'user-team-highlight text-[#FFF8ED]'
                    : 'bg-[#1e1611]/90 border-[#382b20] text-[#FFF8ED]'
                }`}
              >
                {/* Format: "#rank  name" */}
                <div className="flex items-center gap-1.5 2xl:gap-2 min-w-0">
                  <span
                    className={`font-heading text-[13px] 2xl:text-[15px] font-bold w-6 text-right leading-none ${
                      rank === 1 ? 'text-[#FFD700]' : rank === 2 ? 'text-[#E0E0E0]' : rank === 3 ? 'text-[#CD7F32]' : 'text-[#D8C39F]'
                    }`}
                  >
                    #{rank}
                  </span>
                  <span className="text-[14px] 2xl:text-[18px] font-bold truncate text-[#FFF8ED] leading-none font-sans">
                    {team.name}
                  </span>
                  {isUser && (
                    <span className="font-heading text-[9px] 2xl:text-[10px] uppercase tracking-wide text-[#14100D] bg-[#FF7A1A] px-1 py-0.2 rounded font-extrabold flex-shrink-0">
                      YOU
                    </span>
                  )}
                </div>

                {/* Score: "XP" */}
                <div className="flex items-center gap-1 flex-shrink-0 pl-1.5">
                  <span className="font-heading text-[14px] 2xl:text-[17px] font-bold text-[#FFB347] leading-none heading-shadow">
                    {team.score}
                  </span>
                  <span className="text-[10px] 2xl:text-[12px] font-bold text-[#D8C39F] uppercase font-sans">
                    XP
                  </span>
                </div>
              </motion.div>
            );
          })}

          {/* If user team is outside Top 10, show "..." divider and replace 10th row with user team */}
          {isUserOutsideTop10 && userTeam && (
            <>
              <div className="text-center text-[10px] leading-none font-bold text-[#8F745B] py-0.5">
                • • •
              </div>
              <motion.div
                key={userTeam.id}
                layout
                className="h-[28px] md:h-[30px] 2xl:h-[34px] flex items-center justify-between px-2 2xl:px-2.5 rounded border user-team-highlight text-[#FFF8ED]"
              >
                <div className="flex items-center gap-1.5 2xl:gap-2 min-w-0">
                  <span className="font-heading text-[13px] 2xl:text-[15px] font-bold text-[#FF7A1A] w-6 text-right leading-none">
                    #{userTeamIndex + 1}
                  </span>
                  <span className="text-[14px] 2xl:text-[18px] font-bold truncate text-[#FFF8ED] leading-none font-sans">
                    {userTeam.name}
                  </span>
                  <span className="font-heading text-[9px] 2xl:text-[10px] uppercase tracking-wide text-[#14100D] bg-[#FF7A1A] px-1 py-0.2 rounded font-extrabold flex-shrink-0">
                    YOU
                  </span>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0 pl-1.5">
                  <span className="font-heading text-[14px] 2xl:text-[17px] font-bold text-[#FFB347] leading-none heading-shadow">
                    {userTeam.score}
                  </span>
                  <span className="text-[10px] 2xl:text-[12px] font-bold text-[#D8C39F] uppercase font-sans">
                    XP
                  </span>
                </div>
              </motion.div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
