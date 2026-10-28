import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { Shield, Flame, Sword, AlertCircle, ArrowRight, Monitor, Settings } from 'lucide-react';

export default function LoginScreen() {
  const [teamCode, setTeamCode] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useGame();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!teamCode.trim()) {
      setError('Please enter your team code.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await login(teamCode.trim());
      navigate('/');
    } catch (err) {
      setError(err.message || 'Invalid team code');
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
      {/* 55% Dark overlay + blur to match coding theme */}
      <div className="absolute inset-0 bg-[#0C0806]/65 backdrop-blur-[6px] pointer-events-none" />

      {/* Main Viking Login Board */}
      <div className="relative z-10 w-full max-w-md compact-wood-board border-[3px] border-[#684C35] rounded-xl shadow-solid-board p-6 sm:p-8 text-center">
        {/* Corner Nails */}
        <div className="compact-nail top-2 left-2" />
        <div className="compact-nail top-2 right-2" />
        <div className="compact-nail bottom-2 left-2" />
        <div className="compact-nail bottom-2 right-2" />

        {/* Dragon Crest */}
        <div className="flex items-center justify-center gap-2 mb-3">
          <Flame className="w-7 h-7 text-[#FF7A1A] animate-pulse" />
          <div className="p-3 rounded-full bg-[#1A110B] border-2 border-[#FF7A1A] shadow-solid-ticket">
            <Shield className="w-8 h-8 text-[#FFB347]" />
          </div>
          <Flame className="w-7 h-7 text-[#FF7A1A] animate-pulse" />
        </div>

        <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-[#FFF8ED] tracking-wider heading-shadow uppercase mb-1">
          TECHFLIX ARENA
        </h1>
        <p className="font-heading text-xs sm:text-sm text-[#FFB347] font-bold uppercase tracking-widest mb-6">
          BATTLE OF THE RED DEATH
        </p>

        {error && (
          <div className="mb-4 px-3 py-2 bg-[#7F1D1D]/90 border border-[#EF4444] rounded-lg text-xs font-bold text-[#FEE2E2] flex items-center gap-2 text-left">
            <AlertCircle className="w-4 h-4 text-[#F87171] flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="text-left">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#D8C39F] mb-1.5 font-heading">
              ENTER TEAM CODE
            </label>
            <div className="relative">
              <input
                type="text"
                value={teamCode}
                onChange={(e) => setTeamCode(e.target.value.toUpperCase())}
                placeholder="e.g. VIKING-ALPHA"
                maxLength={24}
                autoFocus
                className="w-full px-4 py-3 bg-[#140E0A] border-2 border-[#5A4331] focus:border-[#FF7A1A] focus:outline-none rounded-lg text-lg font-heading font-extrabold text-[#FFF8ED] placeholder-[#66503E] tracking-wider uppercase text-center shadow-inner transition-colors"
              />
              <Sword className="w-5 h-5 text-[#8C6F54] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            <p className="text-[10px] text-[#A68F74] mt-1 font-sans">
              Enter the unique secret code given to your team.
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-6 bg-gradient-to-r from-[#9A3412] via-[#C2410C] to-[#EA580C] hover:from-[#C2410C] hover:to-[#F97316] text-[#FFF8ED] font-heading text-base font-bold uppercase tracking-wider rounded-lg border-2 border-[#FFB347] shadow-solid-ticket flex items-center justify-center gap-2 transition-all disabled:opacity-50 sword-cursor"
          >
            <span>{isLoading ? 'VERIFYING...' : 'ENTER THE ARENA'}</span>
            <ArrowRight className="w-5 h-5 text-[#FFF8ED]" />
          </button>
        </form>

        {/* Footer shortcuts */}
        <div className="mt-8 pt-4 border-t border-[#4A3423] flex items-center justify-between text-[11px] text-[#A68F74] font-bold">
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
