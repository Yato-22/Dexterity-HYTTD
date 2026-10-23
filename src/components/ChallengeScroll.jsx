import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sword, Axe, Target, Crosshair } from 'lucide-react';
import { CHALLENGES, WEAPONS } from '../data/gameData';

export default function ChallengeScroll({ onAttempt }) {
  const [activeTab, setActiveTab] = useState('dagger');

  const tabList = [
    {
      key: 'dagger',
      name: 'Dagger',
      xp: '2 XP',
      icon: Sword,
      accentColor: '#4CAF50',
      difficulty: 'Easy',
    },
    {
      key: 'axe',
      name: 'Axe',
      xp: '5 XP',
      icon: Axe,
      accentColor: '#2563EB',
      difficulty: 'Medium',
    },
    {
      key: 'catapult',
      name: 'Catapult',
      xp: '7 XP',
      icon: Target,
      accentColor: '#FF7A1A',
      difficulty: 'Hard',
    },
    {
      key: 'ballista',
      name: 'Ballista',
      xp: '10 XP',
      icon: Crosshair,
      accentColor: '#D93025',
      difficulty: 'Extreme',
    },
  ];

  const currentChallenges = CHALLENGES[activeTab] || [];
  const activeWeaponInfo = WEAPONS[activeTab];
  const activeTabMeta = tabList.find((t) => t.key === activeTab);

  return (
    <div
      className="relative w-full z-20 flex flex-col justify-center"
      style={{ rotate: '0.5deg' }}
    >
      {/* Wall Pins */}
      <div className="compact-nail -top-1.5 left-5 z-30" />
      <div className="compact-nail -top-1.5 right-5 z-30" />

      {/* Main Compact Parchment Scroll */}
      <div className="compact-parchment-scroll p-2.5 2xl:p-3.5 relative flex flex-col justify-between">
        <div>
          {/* Header (20px-24px in Cinzel) */}
          <div className="text-center pb-1 mb-2 border-b-2 border-[#4A3A2C]/25">
            <h3 className="font-heading text-[18px] 2xl:text-[23px] font-bold tracking-wider uppercase text-[#22160E] heading-parchment-shadow leading-tight">
              TOME OF TRIALS
            </h3>
          </div>

          {/* 4 Compact Weapon Tabs */}
          <div className="grid grid-cols-4 gap-1 2xl:gap-1.5 mb-2.5">
            {tabList.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;

              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`compact-tab py-1 px-0.5 flex flex-col items-center relative sword-cursor transition-all ${
                    isActive
                      ? 'bg-[#3A2A1E] text-[#FFF8ED]'
                      : 'bg-[#DECAAC] hover:bg-[#D4BC9B] text-[#22160E]'
                  }`}
                >
                  <Icon
                    className={`w-3.5 h-3.5 2xl:w-4 2xl:h-4 mb-0.5 ${
                      isActive ? 'text-[#FFB347]' : 'text-[#3D2817]'
                    }`}
                  />
                  <span className="font-heading text-[10px] 2xl:text-[12px] leading-none font-bold">
                    {tab.name}
                  </span>
                  <span
                    className={`font-heading text-[9px] 2xl:text-[11px] font-bold mt-0.5 ${
                      isActive ? 'text-[#FFB347]' : 'text-[#3D2817]'
                    }`}
                  >
                    {tab.xp}
                  </span>

                  {/* Difficulty Accent Underline */}
                  <div
                    className="absolute -bottom-[2px] left-1 right-1 h-[2px] rounded-full"
                    style={{ backgroundColor: tab.accentColor }}
                  />
                </button>
              );
            })}
          </div>

          {/* 3 Challenges List */}
          <div className="space-y-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.15 }}
                className="space-y-2"
              >
                {currentChallenges.map((challenge) => (
                  <div
                    key={challenge.id}
                    className="bg-[#FFF8ED] p-2 2xl:p-2.5 rounded-lg border-2 border-[#3A2E24] shadow-solid-ticket flex flex-col justify-between gap-1.5"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1.5">
                        {/* Challenge Title: 20px at 1920x1080 (never below 13px) */}
                        <h4 className="font-heading text-[15px] 2xl:text-[19px] font-bold text-[#22160E] leading-tight truncate">
                          {challenge.title}
                        </h4>

                        {/* Difficulty Accent Tag */}
                        <span
                          className="font-heading text-[9px] 2xl:text-[10px] px-1.5 py-0.2 rounded text-[#FFF] uppercase tracking-wider flex-shrink-0"
                          style={{ backgroundColor: activeTabMeta?.accentColor || '#FF7A1A' }}
                        >
                          {activeTabMeta?.difficulty}
                        </span>
                      </div>

                      {/* One short description line: 15px at 1920x1080 (never below 13px) */}
                      <p className="text-[13px] 2xl:text-[15px] font-bold text-[#3D2817] leading-snug mt-0.5 truncate font-sans">
                        {challenge.desc}
                      </p>
                    </div>

                    {/* Compact Ticket-Style "Attempt" Button */}
                    <div className="flex justify-end pt-0.5">
                      <button
                        onClick={() => onAttempt && onAttempt(activeTab, challenge)}
                        className="compact-ticket-btn px-2.5 py-1 flex items-center gap-1.5 sword-cursor"
                      >
                        <div className="ticket-notch-left" />
                        <div className="ticket-notch-right" />

                        <span className="font-heading text-[11px] 2xl:text-[13px] font-bold tracking-wider uppercase text-[#14100D] leading-none">
                          ATTEMPT +{activeWeaponInfo?.damage} XP
                        </span>
                      </button>
                    </div>
                  </div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Bottom Accent */}
        <div className="mt-2 pt-1 border-t border-[#4A3A2C]/20 text-center">
          <span className="font-heading text-[9px] 2xl:text-[11px] font-bold text-[#5A4A3C] uppercase tracking-wider">
            HIGH CHIEFTAIN'S CODEX
          </span>
        </div>
      </div>
    </div>
  );
}
