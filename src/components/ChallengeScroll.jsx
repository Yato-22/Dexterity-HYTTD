import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sword, Axe, Target, Crosshair, CheckCircle2, RotateCcw } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { RopeSegment, RopeKnot, TerminalRopeKnot } from './RopeGraphic';

export default function ChallengeScroll({ solvedProblems = [], isHit = false }) {
  const [activeTab, setActiveTab] = useState('dagger');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState(null);
  const navigate = useNavigate();
  const panelRef = useRef(null);
  const [topOffset, setTopOffset] = useState(120);

  const { problemsByWeapon, refreshToken, refreshTier } = useGame();

  useEffect(() => {
    const update = () => {
      if (panelRef.current) {
        const rect = panelRef.current.getBoundingClientRect();
        setTopOffset(rect.top);
      }
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const tabList = [
    { key: 'dagger', name: 'Dagger', xp: '2 XP', icon: Sword, accentColor: '#16A34A', difficulty: 'Easy' },
    { key: 'axe', name: 'Axe', xp: '5 XP', icon: Axe, accentColor: '#2563EB', difficulty: 'Medium' },
    { key: 'catapult', name: 'Catapult', xp: '7 XP', icon: Target, accentColor: '#EA580C', difficulty: 'Hard' },
    { key: 'ballista', name: 'Ballista', xp: '10 XP', icon: Crosshair, accentColor: '#DC2626', difficulty: 'Extreme' },
  ];

  const currentProblems = problemsByWeapon?.[activeTab] || [];
  const activeTabMeta = tabList.find((t) => t.key === activeTab);

  const handleRefreshClick = async () => {
    if (!refreshToken || isRefreshing) return;
    setIsRefreshing(true);
    setRefreshError(null);
    try {
      await refreshTier(activeTab);
    } catch (err) {
      setRefreshError(err.message || 'Refresh failed');
      setTimeout(() => setRefreshError(null), 3500);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div
      ref={panelRef}
      className="relative w-full z-20 flex flex-col justify-center"
      style={{ rotate: '0deg' }}
    >
      {/* 1. Left Rope (holding left corner) */}
      <div
        className="absolute left-[24px] z-0 pointer-events-none flex flex-col items-center"
        style={{
          top: `${-topOffset - 6}px`,
          height: `${topOffset + 14}px`,
        }}
      >
        <RopeSegment height="100%" width={11} />
      </div>
      <div className="absolute -top-2 left-[18px] z-30 pointer-events-none">
        <RopeKnot size="md" />
      </div>

      {/* 2. Right Rope (holding right corner) */}
      <div
        className="absolute right-[24px] z-0 pointer-events-none flex flex-col items-center"
        style={{
          top: `${-topOffset - 6}px`,
          height: `${topOffset + 14}px`,
        }}
      >
        <RopeSegment height="100%" width={11} />
      </div>
      <div className="absolute -top-2 right-[18px] z-30 pointer-events-none">
        <RopeKnot size="md" />
      </div>

      {/* Main Plain White Surface Panel (#FFFFFF) with dark text (#1F1F1F) */}
      <div
        className={`relative bg-[#FFFFFF] text-[#1F1F1F] rounded-lg border-2 border-[#1F1F1F] shadow-[4px_4px_0px_#100C09] p-3 2xl:p-3.5 transition-transform duration-300 ${
          isHit ? 'plank-hit-shake' : ''
        }`}
      >
        {/* Two Drilled Rope Holes: Left corner & Right corner */}
        <div className="drilled-hole absolute top-2 left-6 pointer-events-none z-20" />
        <div className="drilled-hole absolute top-2 right-6 pointer-events-none z-20" />

        {/* Header */}
        <div className="text-center pb-1.5 mb-2 border-b-2 border-[#E5E7EB] px-8">
          <h3 className="font-heading text-[17px] 2xl:text-[21px] font-bold tracking-wider uppercase text-[#1F1F1F] leading-tight">
            TOME OF TRIALS
          </h3>
          <p className="text-[11px] 2xl:text-[12px] font-bold text-[#6B7280] font-sans">
            Solve trials to strike the Red Death
          </p>
        </div>

        {/* 4 Weapon Tabs */}
        <div className="grid grid-cols-4 gap-1 2xl:gap-1.5 mb-2">
          {tabList.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;

            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`compact-tab py-1 px-0.5 flex flex-col items-center relative sword-cursor transition-all ${
                  isActive
                    ? 'bg-[#1F1F1F] text-[#FFFFFF] shadow-sm'
                    : 'bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#374151]'
                }`}
              >
                <Icon
                  className={`w-3.5 h-3.5 2xl:w-4 2xl:h-4 mb-0.5 ${
                    isActive ? 'text-[#FFB347]' : 'text-[#4B5563]'
                  }`}
                />
                <span className="font-heading text-[10px] 2xl:text-[11.5px] leading-none font-bold">
                  {tab.name}
                </span>
                <span
                  className={`font-heading text-[9px] 2xl:text-[10.5px] font-bold mt-0.5 ${
                    isActive ? 'text-[#FFB347]' : 'text-[#6B7280]'
                  }`}
                >
                  {tab.xp}
                </span>

                <div
                  className="absolute -bottom-[2px] left-1 right-1 h-[2px] rounded-full"
                  style={{ backgroundColor: tab.accentColor }}
                />
              </button>
            );
          })}
        </div>

        {/* Tier Refresh Bar */}
        <div className="flex items-center justify-between bg-[#F9FAFB] border border-[#E5E7EB] rounded-md px-2 py-1 mb-2">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-heading font-bold text-[#374151] uppercase">
              {activeTabMeta?.name} Tier
            </span>
            <span
              className={`text-[9.5px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider ${
                refreshToken
                  ? 'bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC]'
                  : 'bg-[#F3F4F6] text-[#9CA3AF] border border-[#E5E7EB]'
              }`}
            >
              {refreshToken ? '1 Token Ready' : '0 Tokens'}
            </span>
          </div>

          <button
            onClick={handleRefreshClick}
            disabled={!refreshToken || isRefreshing}
            title={
              refreshToken
                ? `Redraw 3 new unsolved ${activeTabMeta?.name} trials`
                : 'Solve any trial to earn your next tier refresh token'
            }
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10.5px] font-heading font-bold uppercase tracking-wider transition-all ${
              refreshToken && !isRefreshing
                ? 'bg-[#1F1F1F] text-[#FFF8ED] hover:bg-[#374151] sword-cursor shadow-sm'
                : 'bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed opacity-60'
            }`}
          >
            <RotateCcw className={`w-3 h-3 ${isRefreshing ? 'animate-spin text-[#FFB347]' : ''}`} />
            <span>{isRefreshing ? 'REDRAWING...' : 'REFRESH TIER'}</span>
          </button>
        </div>

        {refreshError && (
          <div className="mb-2 p-1.5 bg-[#FEE2E2] border border-[#F87171] rounded text-[10.5px] font-bold text-[#991B1B] text-center">
            {refreshError}
          </div>
        )}

        {/* 3 Problems List */}
        <div className="space-y-1.5">
          {currentProblems.map((problem) => {
            const isSolved = solvedProblems.includes(problem.id);

            return (
              <div
                key={problem.id}
                onClick={() => navigate(`/problem/${problem.id}`)}
                className={`p-2 rounded-lg border-2 transition-all cursor-pointer sword-cursor flex flex-col justify-between gap-1 ${
                  isSolved
                    ? 'bg-[#F0FDF4] border-[#86EFAC] shadow-sm'
                    : 'bg-[#FAFAFA] hover:bg-[#F4F4F5] border-[#E5E7EB] hover:border-[#1F1F1F] shadow-sm'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      {isSolved && (
                        <CheckCircle2 className="w-4 h-4 text-[#16A34A] flex-shrink-0" />
                      )}
                      <h4 className="font-heading text-[13px] 2xl:text-[15px] font-bold text-[#1F1F1F] leading-tight truncate">
                        {problem.title}
                      </h4>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      {isSolved && (
                        <span className="font-heading text-[9px] bg-[#DCFCE7] text-[#15803D] px-1.5 py-0.2 rounded font-bold border border-[#86EFAC]">
                          SOLVED
                        </span>
                      )}
                      <span
                        className="font-heading text-[9px] 2xl:text-[10px] px-1.5 py-0.2 rounded text-[#FFF] uppercase tracking-wider font-bold"
                        style={{ backgroundColor: activeTabMeta?.accentColor || '#FF7A1A' }}
                      >
                        {problem.xp} XP
                      </span>
                    </div>
                  </div>

                  <p className="text-[11.5px] 2xl:text-[12.5px] font-bold text-[#4B5563] leading-snug mt-0.5 line-clamp-1 font-sans">
                    {problem.task || problem.story}
                  </p>
                </div>

                {/* Attempt / Enter Button */}
                <div className="flex items-center justify-between pt-0.5">
                  <span className="text-[10px] 2xl:text-[10.5px] font-bold text-[#6B7280]">
                    C • C++ • Java • Python
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/problem/${problem.id}`);
                    }}
                    className="compact-ticket-btn px-2.5 py-0.5 flex items-center gap-1 sword-cursor flex-shrink-0"
                  >
                    <div className="ticket-notch-left" />
                    <div className="ticket-notch-right" />
                    <span className="font-heading text-[10px] 2xl:text-[11px] font-bold tracking-wider uppercase text-[#14100D] leading-none">
                      {isSolved ? 'REVIEW' : `ATTEMPT +${problem.xp} XP`}
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Status */}
        <div className="mt-2 pt-1 border-t border-[#E5E7EB] text-center flex items-center justify-between px-1">
          <span className="font-heading text-[9px] 2xl:text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">
            {solvedProblems.length} TRIALS CONQUERED
          </span>
          <span className="text-[9px] font-bold text-[#9CA3AF]">
            Board shared with clan
          </span>
        </div>
      </div>

      {/* Bottom Terminal Knots for Corner Ropes */}
      <div className="absolute -bottom-7 left-[18px] z-30 pointer-events-none">
        <TerminalRopeKnot />
      </div>
      <div className="absolute -bottom-7 right-[18px] z-30 pointer-events-none">
        <TerminalRopeKnot />
      </div>
    </div>
  );
}
