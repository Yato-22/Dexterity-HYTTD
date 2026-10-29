import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { Shield, Flame, User, Phone, Users, AlertCircle, ArrowRight, Monitor, Settings } from 'lucide-react';

export default function LoginScreen() {
  const [teamName, setTeamName] = useState('');
  const [leaderPhone, setLeaderPhone] = useState('');
  const [yourName, setYourName] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useGame();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!teamName.trim()) {
      setError('Please enter your Team Name.');
      return;
    }
    if (!leaderPhone.trim()) {
      setError('Please enter Team Leader Phone Number.');
      return;
    }
    if (!yourName.trim()) {
      setError('Please enter Your Name.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await login({
        teamName: teamName.trim(),
        leaderPhone: leaderPhone.trim(),
        yourName: yourName.trim(),
      });
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="h-screen max-h-screen w-screen overflow-hidden relative select-none flex items-center justify-center p-4 bg-cover bg-center font-sans"
      style={{
        backgroundImage: "url('/field.png'), linear-gradient(to bottom, #1c152b 0%, #4a2835 30%, #a85834 50%, #4a5c2d 65%, #1e2e14 100%)",
      }}
    >
      {/* 65% Dark overlay + blur */}
      <div className="absolute inset-0 bg-[#0C0806]/65 backdrop-blur-[6px] pointer-events-none" />

      {/* Main Viking Login Board */}
      <div className="relative z-10 w-full max-w-md compact-wood-board border-[3px] border-[#684C35] rounded-xl shadow-solid-board p-6 sm:p-7 text-center">
        {/* Corner Nails */}
        <div className="compact-nail top-2 left-2" />
        <div className="compact-nail top-2 right-2" />
        <div className="compact-nail bottom-2 left-2" />
        <div className="compact-nail bottom-2 right-2" />

        {/* Dragon Crest */}
        <div className="flex items-center justify-center gap-2 mb-2">
          <Flame className="w-6 h-6 text-[#FF7A1A] animate-pulse" />
          <div className="p-2.5 rounded-full bg-[#1A110B] border-2 border-[#FF7A1A] shadow-solid-ticket">
            <Shield className="w-7 h-7 text-[#FFB347]" />
          </div>
          <Flame className="w-6 h-6 text-[#FF7A1A] animate-pulse" />
        </div>

        <h1 className="font-heading text-xl sm:text-2xl font-extrabold text-[#FFF8ED] tracking-wider heading-shadow uppercase mb-0.5">
          TECHFLIX ARENA
        </h1>
        <p className="font-heading text-xs text-[#FFB347] font-bold uppercase tracking-widest mb-4">
          BATTLE OF THE RED DEATH
        </p>

        {error && (
          <div className="mb-3 px-3 py-2 bg-[#7F1D1D]/90 border border-[#EF4444] rounded-lg text-xs font-bold text-[#FEE2E2] flex items-center gap-2 text-left">
            <AlertCircle className="w-4 h-4 text-[#F87171] flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-3">
          {/* Field 1: Team Name */}
          <div className="text-left">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#D8C39F] mb-1 font-heading flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[#FFB347]" />
              <span>TEAM NAME</span>
            </label>
            <input
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="e.g. Clan of Berk"
              maxLength={40}
              autoFocus
              className="w-full px-3.5 py-2.5 bg-[#140E0A] border-2 border-[#5A4331] focus:border-[#FF7A1A] focus:outline-none rounded-lg text-base font-inter font-medium text-[#FFF8ED] placeholder-[#786450] shadow-inner transition-colors"
            />
          </div>

          {/* Field 2: Team Leader Phone Number */}
          <div className="text-left">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#D8C39F] mb-1 font-heading flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[#FFB347]" />
              <span>TEAM LEADER PHONE NUMBER</span>
            </label>
            <input
              type="tel"
              value={leaderPhone}
              onChange={(e) => setLeaderPhone(e.target.value)}
              placeholder="e.g. 9876543210"
              maxLength={20}
              className="w-full px-3.5 py-2.5 bg-[#140E0A] border-2 border-[#5A4331] focus:border-[#FF7A1A] focus:outline-none rounded-lg text-base font-inter font-medium text-[#FFF8ED] placeholder-[#786450] shadow-inner transition-colors"
            />
          </div>

          {/* Field 3: Your Name */}
          <div className="text-left">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#D8C39F] mb-1 font-heading flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#FFB347]" />
              <span>YOUR NAME</span>
            </label>
            <input
              type="text"
              value={yourName}
              onChange={(e) => setYourName(e.target.value)}
              placeholder="e.g. Hiccup"
              maxLength={30}
              className="w-full px-3.5 py-2.5 bg-[#140E0A] border-2 border-[#5A4331] focus:border-[#FF7A1A] focus:outline-none rounded-lg text-base font-inter font-medium text-[#FFF8ED] placeholder-[#786450] shadow-inner transition-colors"
            />
            <p className="text-[11px] text-[#A68F74] mt-1.5 font-inter">
              Casing does not matter (uppercase or lowercase). Max 2 members per team share the board.
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 px-6 bg-gradient-to-r from-[#9A3412] via-[#C2410C] to-[#EA580C] hover:from-[#C2410C] hover:to-[#F97316] text-[#FFF8ED] font-heading text-sm font-bold uppercase tracking-wider rounded-lg border-2 border-[#FFB347] shadow-solid-ticket flex items-center justify-center gap-2 transition-all disabled:opacity-50 sword-cursor"
          >
            <span>{isLoading ? 'VERIFYING WITH THE SEER...' : 'ENTER THE ARENA'}</span>
            <ArrowRight className="w-4 h-4 text-[#FFF8ED]" />
          </button>
        </form>

        {/* Footer shortcuts */}
        <div className="mt-5 pt-3 border-t border-[#4A3423] flex items-center justify-between text-[11px] text-[#A68F74] font-bold">
          <Link
            to="/display"
            className="flex items-center gap-1.5 hover:text-[#FFB347] transition-colors"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Projector Display</span>
          </Link>
          <Link
            to="/admin"
            className="flex items-center gap-1.5 hover:text-[#FFB347] transition-colors"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Admin Gate</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
