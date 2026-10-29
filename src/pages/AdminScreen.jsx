import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  Lock,
  Play,
  Pause,
  RotateCcw,
  Upload,
  Download,
  Terminal,
  Server,
  Users,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  RefreshCw,
  ExternalLink,
  Flame,
  PauseCircle,
} from 'lucide-react';
import { db } from '../services/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { computeRankings } from '../utils/rankings';

export default function AdminScreen() {
  const [adminPassword, setAdminPassword] = useState(() => {
    return sessionStorage.getItem('techflix_admin_pass') || '';
  });
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return Boolean(sessionStorage.getItem('techflix_admin_pass'));
  });
  const [loginInput, setLoginInput] = useState('');
  const [loginError, setLoginError] = useState(null);

  // Dragon state (from public/state)
  const [dragon, setDragon] = useState({ hp: 100, maxHp: 100, status: 'waiting' });
  const [maxHpInput, setMaxHpInput] = useState('100');
  const [runnerOk, setRunnerOk] = useState(true);

  // Runner state
  const [runnerUrl, setRunnerUrl] = useState('');
  const [runnerTestResult, setRunnerTestResult] = useState(null);
  const [isTestingRunner, setIsTestingRunner] = useState(false);
  const [isSavingRunner, setIsSavingRunner] = useState(false);

  // Teams live summary (from public/state.teams)
  const [teams, setTeams] = useState([]);
  const [csvText, setCsvText] = useState(
    'teamName,leaderPhone,leaderName,member2Name\nBerk Vikings,9876543210,Hiccup,Astrid\nDragon Riders,9876543211,Fishlegs,Snotlout\nThor Clan,9876543212,Ragnar,Lagertha'
  );
  const [importStatus, setImportStatus] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);
  const [isLoadingAction, setIsLoadingAction] = useState(false);

  // Part 5: Listen ONLY to public/state
  useEffect(() => {
    if (!db) return;
    const unsub = onSnapshot(doc(db, 'public', 'state'), (snap) => {
      if (snap.exists()) {
        const d = snap.data();
        const dragonData = d.dragon || {};
        setDragon({
          hp: dragonData.hp ?? 100,
          maxHp: dragonData.maxHp ?? 100,
          status: dragonData.status || 'waiting',
          winnerTeamId: dragonData.winnerTeamId || null,
          winnerTeamName: dragonData.winnerTeamName || null,
        });
        if (dragonData.maxHp) setMaxHpInput(String(dragonData.maxHp));
        if (typeof d.runnerOk === 'boolean') setRunnerOk(d.runnerOk);

        const rawTeams = Array.isArray(d.teams) ? d.teams : [];
        const ranked = computeRankings(rawTeams, dragonData.status, dragonData.winnerTeamId);
        setTeams(ranked);
      }
    });
    return () => unsub();
  }, []);

  // Fetch runner URL when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;
    fetch('/api/admin/runner', {
      headers: { 'x-admin-password': adminPassword },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.url !== undefined) setRunnerUrl(data.url);
      })
      .catch((err) => console.error('Failed to get runner url:', err));
  }, [isAuthenticated, adminPassword]);

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (!loginInput.trim()) {
      setLoginError('Password is required');
      return;
    }
    sessionStorage.setItem('techflix_admin_pass', loginInput.trim());
    setAdminPassword(loginInput.trim());
    setIsAuthenticated(true);
    setLoginError(null);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('techflix_admin_pass');
    setAdminPassword('');
    setIsAuthenticated(false);
  };

  const handleStart = async () => {
    setIsLoadingAction(true);
    setActionMessage(null);
    try {
      const res = await fetch('/api/admin/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': adminPassword,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to start battle');
      setActionMessage({ type: 'success', text: 'Battle is now LIVE! Dragonslayer submissions open.' });
    } catch (err) {
      setActionMessage({ type: 'error', text: err.message });
    } finally {
      setIsLoadingAction(false);
    }
  };

  const handlePause = async () => {
    setIsLoadingAction(true);
    setActionMessage(null);
    try {
      const res = await fetch('/api/admin/pause', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': adminPassword,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to pause battle');
      setActionMessage({ type: 'success', text: 'Battle is now PAUSED! Full-screen pause overlay active.' });
    } catch (err) {
      setActionMessage({ type: 'error', text: err.message });
    } finally {
      setIsLoadingAction(false);
    }
  };

  const handleReset = async () => {
    const confirmReset = window.confirm(
      'Are you sure you want to reset the battle? This will reset Dragon HP, clear the live feed, and refresh team boards!'
    );
    if (!confirmReset) return;

    setIsLoadingAction(true);
    setActionMessage(null);
    try {
      const res = await fetch('/api/admin/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': adminPassword,
        },
        body: JSON.stringify({
          maxHp: Number(maxHpInput) || 100,
          resetTeams: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reset battle');
      setActionMessage({
        type: 'success',
        text: `Battle reset successfully! HP set to ${data.hp}, live feed cleared, team boards rerolled.`,
      });
    } catch (err) {
      setActionMessage({ type: 'error', text: err.message });
    } finally {
      setIsLoadingAction(false);
    }
  };

  const handleSaveRunner = async () => {
    setIsSavingRunner(true);
    try {
      const res = await fetch('/api/admin/runner', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': adminPassword,
        },
        body: JSON.stringify({ action: 'save', url: runnerUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save runner URL');
      setRunnerTestResult({
        type: 'success',
        message: '✓ Runner URL saved to Firestore config/runner successfully!',
      });
    } catch (err) {
      setRunnerTestResult({ type: 'error', message: err.message });
    } finally {
      setIsSavingRunner(false);
    }
  };

  const handleTestRunner = async () => {
    setIsTestingRunner(true);
    setRunnerTestResult(null);
    try {
      const res = await fetch('/api/admin/runner', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': adminPassword,
        },
        body: JSON.stringify({ action: 'test', url: runnerUrl }),
      });
      const data = await res.json();
      if (data.success) {
        setRunnerTestResult({
          type: 'success',
          message: `✓ Runner Response (HTTP ${data.status}):\n${data.output}`,
        });
      } else {
        setRunnerTestResult({
          type: 'error',
          message: `✗ Runner Error: ${data.error || data.output || 'Failed to connect'}`,
        });
      }
    } catch (err) {
      setRunnerTestResult({
        type: 'error',
        message: '✗ Failed to contact runner: ' + err.message,
      });
    } finally {
      setIsTestingRunner(false);
    }
  };

  const handleImportTeams = async () => {
    if (!csvText.trim()) return;
    setIsLoadingAction(true);
    setImportStatus(null);
    try {
      const res = await fetch('/api/admin/import-teams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': adminPassword,
        },
        body: JSON.stringify({ csv: csvText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to import teams');
      setImportStatus({
        type: 'success',
        message: `✓ Successfully imported ${data.importedCount} teams into registry!`,
      });
    } catch (err) {
      setImportStatus({ type: 'error', message: err.message });
    } finally {
      setIsLoadingAction(false);
    }
  };

  const handleExportCSV = () => {
    window.open(`/api/admin/export?adminPassword=${encodeURIComponent(adminPassword)}`, '_blank');
  };

  if (!isAuthenticated) {
    return (
      <div
        className="min-h-screen w-screen flex items-center justify-center p-4 bg-cover bg-center font-sans"
        style={{
          backgroundImage: "url('/field.png'), linear-gradient(to bottom, #1c152b 0%, #4a2835 30%, #a85834 50%, #4a5c2d 65%, #1e2e14 100%)",
        }}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        <div className="relative z-10 w-full max-w-sm compact-wood-board border-[3px] border-[#684C35] rounded-xl p-6 text-center shadow-2xl">
          <div className="compact-nail top-2 left-2" />
          <div className="compact-nail top-2 right-2" />
          <div className="compact-nail bottom-2 left-2" />
          <div className="compact-nail bottom-2 right-2" />

          <div className="p-3 bg-[#1A110B] rounded-full w-14 h-14 mx-auto mb-3 flex items-center justify-center border-2 border-[#FF7A1A]">
            <Lock className="w-7 h-7 text-[#FFB347]" />
          </div>
          <h2 className="font-heading text-xl font-bold uppercase text-[#FFF8ED] mb-1">CHIEFTAIN GATE</h2>
          <p className="text-xs text-[#A89078] mb-4">Enter master password to access battle controls</p>

          {loginError && (
            <div className="mb-3 p-2 bg-[#7F1D1D] border border-[#EF4444] rounded text-xs text-[#FEE2E2] font-bold">
              {loginError}
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-3">
            <input
              type="password"
              value={loginInput}
              onChange={(e) => setLoginInput(e.target.value)}
              placeholder="Admin Password"
              autoFocus
              className="w-full px-3 py-2 bg-[#140E0A] border-2 border-[#5A4331] rounded-lg text-sm font-bold text-[#FFF8ED] text-center focus:border-[#FF7A1A] focus:outline-none"
            />
            <button
              type="submit"
              className="w-full py-2.5 bg-[#9A3412] hover:bg-[#C2410C] text-[#FFF8ED] font-heading font-bold rounded-lg border border-[#FFB347] transition-all sword-cursor uppercase"
            >
              Enter Sanctum
            </button>
          </form>

          <div className="mt-4 pt-3 border-t border-[#4A3423]">
            <Link to="/" className="text-xs text-[#A89078] hover:text-[#FFB347] flex items-center justify-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Return to Arena
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen w-screen bg-cover bg-center overflow-y-auto text-[#FFF8ED] p-4 sm:p-6 font-sans select-none"
      style={{
        backgroundImage: "url('/field.png'), linear-gradient(to bottom, #1c152b 0%, #4a2835 30%, #a85834 50%, #4a5c2d 65%, #1e2e14 100%)",
      }}
    >
      <div className="max-w-6xl mx-auto space-y-6 pb-12">
        {/* Header */}
        <header className="flex items-center justify-between bg-[#140E0A]/90 border-2 border-[#5A4331] rounded-xl p-4 shadow-xl">
          <div className="flex items-center gap-3">
            <Link to="/" className="p-2 bg-[#2E241C] border border-[#5A4331] rounded-lg hover:border-[#FF7A1A] transition-colors">
              <ArrowLeft className="w-5 h-5 text-[#FFB347]" />
            </Link>
            <div>
              <h1 className="font-heading text-xl sm:text-2xl font-extrabold uppercase text-[#FFF8ED] flex items-center gap-2">
                <Shield className="w-6 h-6 text-[#FF7A1A]" />
                CHIEFTAIN CONTROL SANCTUM
              </h1>
              <p className="text-xs text-[#A89078]">Battle Orchestration, Piston Runner & Warband Registry</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/display"
              target="_blank"
              className="px-3 py-1.5 bg-[#2E241C] border border-[#5A4331] rounded-lg text-xs font-heading font-bold text-[#FFB347] flex items-center gap-1.5 hover:border-[#FF7A1A]"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Spectator Display
            </Link>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 bg-[#7F1D1D] hover:bg-[#991B1B] border border-[#EF4444] rounded-lg text-xs font-heading font-bold text-[#FEE2E2]"
            >
              Lock Sanctum
            </button>
          </div>
        </header>

        {actionMessage && (
          <div
            className={`p-3 rounded-lg border text-xs font-bold flex items-center gap-2 ${
              actionMessage.type === 'success'
                ? 'bg-[#14532D]/90 border-[#22C55E] text-[#DCFCE7]'
                : 'bg-[#7F1D1D]/90 border-[#EF4444] text-[#FEE2E2]'
            }`}
          >
            {actionMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <AlertTriangle className="w-4 h-4 flex-shrink-0" />}
            <span>{actionMessage.text}</span>
          </div>
        )}

        {/* 1. BATTLE ENGINE CONTROLS */}
        <section className="bg-[#18110B]/95 border-2 border-[#5A4331] rounded-xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-[#3A2D22] pb-3">
            <h2 className="font-heading text-lg font-bold uppercase text-[#FFB347] flex items-center gap-2">
              <Play className="w-5 h-5 text-[#FF7A1A]" />
              Battle State Engine
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#A89078]">Current Status:</span>
              <span
                className={`px-2.5 py-0.5 rounded text-xs font-heading font-extrabold uppercase tracking-wider ${
                  dragon.status === 'live'
                    ? 'bg-[#15803D] text-[#DCFCE7] animate-pulse'
                    : dragon.status === 'defeated'
                    ? 'bg-[#B91C1C] text-[#FEE2E2]'
                    : dragon.status === 'paused'
                    ? 'bg-[#9A3412] text-[#FFEDD5] border border-[#F97316]'
                    : 'bg-[#B45309] text-[#FEF3C7]'
                }`}
              >
                {dragon.status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            {/* Start / Live Button */}
            <button
              onClick={handleStart}
              disabled={isLoadingAction}
              className="py-3 px-4 bg-[#15803D] hover:bg-[#16A34A] border-2 border-[#86EFAC] rounded-lg font-heading font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 sword-cursor"
            >
              <Play className="w-4 h-4" />
              <span>START / RESUME BATTLE</span>
            </button>

            {/* Pause Button */}
            <button
              onClick={handlePause}
              disabled={isLoadingAction}
              className="py-3 px-4 bg-[#C2410C] hover:bg-[#EA580C] border-2 border-[#FDBA74] rounded-lg font-heading font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 sword-cursor"
            >
              <Pause className="w-4 h-4" />
              <span>PAUSE BATTLE</span>
            </button>

            {/* Emergency Runner Down: Pause Everyone Button */}
            <button
              onClick={handlePause}
              disabled={isLoadingAction}
              className="py-3 px-4 bg-[#7F1D1D] hover:bg-[#991B1B] border-2 border-[#FCA5A5] rounded-lg font-heading font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 sword-cursor"
              title="Click if runner goes down to freeze countdown and submissions"
            >
              <AlertTriangle className="w-4 h-4 text-[#FDE047]" />
              <span>RUNNER DOWN: PAUSE EVERYONE</span>
            </button>

            {/* Reset Form */}
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={maxHpInput}
                onChange={(e) => setMaxHpInput(e.target.value)}
                placeholder="Max HP"
                className="w-20 px-2 py-2.5 bg-[#140E0A] border border-[#5A4331] rounded-lg text-sm text-center font-bold text-[#FFF8ED]"
              />
              <button
                onClick={handleReset}
                disabled={isLoadingAction}
                className="flex-1 py-2.5 px-3 bg-[#3F3F46] hover:bg-[#52525B] border border-[#71717A] rounded-lg font-heading font-bold text-xs uppercase flex items-center justify-center gap-1.5 shadow-md disabled:opacity-50 sword-cursor"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>RESET DRAGON</span>
              </button>
            </div>
          </div>
        </section>

        {/* 2. PISTON RUNNER CONFIGURATION */}
        <section className="bg-[#18110B]/95 border-2 border-[#5A4331] rounded-xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-[#3A2D22] pb-3">
            <h2 className="font-heading text-lg font-bold uppercase text-[#FFB347] flex items-center gap-2">
              <Server className="w-5 h-5 text-[#FF7A1A]" />
              Piston Runner Endpoint
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#A89078]">Runner Health:</span>
              <span
                className={`px-2.5 py-0.5 rounded text-xs font-heading font-extrabold uppercase tracking-wider ${
                  runnerOk ? 'bg-[#15803D] text-[#DCFCE7]' : 'bg-[#B91C1C] text-[#FEE2E2] animate-pulse'
                }`}
              >
                {runnerOk ? 'Online' : 'Unreachable'}
              </span>
            </div>
          </div>

          <p className="text-xs text-[#A89078]">
            Paste Cloudflare tunnel or self-hosted Piston server URL. Stored in Firestore document{' '}
            <code className="text-[#FFB347]">config/runner</code> and cached in memory.
          </p>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={runnerUrl}
              onChange={(e) => setRunnerUrl(e.target.value)}
              placeholder="e.g. https://my-piston-tunnel.trycloudflare.com"
              className="flex-1 px-3 py-2 bg-[#140E0A] border-2 border-[#5A4331] focus:border-[#FF7A1A] focus:outline-none rounded-lg text-sm font-mono text-[#FFF8ED]"
            />
            <button
              onClick={handleSaveRunner}
              disabled={isSavingRunner}
              className="px-4 py-2 bg-[#9A3412] hover:bg-[#C2410C] border border-[#FFB347] rounded-lg text-xs font-heading font-bold uppercase tracking-wider disabled:opacity-50 sword-cursor"
            >
              {isSavingRunner ? 'Saving...' : 'Save URL'}
            </button>
            <button
              onClick={handleTestRunner}
              disabled={isTestingRunner}
              className="px-4 py-2 bg-[#2E241C] hover:bg-[#3E3126] border border-[#5A4331] rounded-lg text-xs font-heading font-bold uppercase tracking-wider flex items-center gap-1.5 disabled:opacity-50 sword-cursor"
            >
              <Terminal className="w-3.5 h-3.5 text-[#FFB347]" />
              <span>{isTestingRunner ? 'Testing...' : 'Test Runner'}</span>
            </button>
          </div>

          {runnerTestResult && (
            <div
              className={`p-3 rounded-lg border text-xs font-mono whitespace-pre-wrap ${
                runnerTestResult.type === 'success'
                  ? 'bg-[#14532D]/70 border-[#22C55E] text-[#DCFCE7]'
                  : 'bg-[#7F1D1D]/70 border-[#EF4444] text-[#FEE2E2]'
              }`}
            >
              {runnerTestResult.message}
            </div>
          )}
        </section>

        {/* 3. CSV IMPORT & EXPORT */}
        <section className="bg-[#18110B]/95 border-2 border-[#5A4331] rounded-xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-[#3A2D22] pb-3">
            <h2 className="font-heading text-lg font-bold uppercase text-[#FFB347] flex items-center gap-2">
              <Users className="w-5 h-5 text-[#FF7A1A]" />
              Warband Registry & CSV Manager
            </h2>
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-1.5 bg-[#2E241C] hover:bg-[#3E3126] border border-[#5A4331] rounded-lg text-xs font-heading font-bold text-[#FFB347] flex items-center gap-1.5 sword-cursor"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Standings CSV</span>
            </button>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#D8C39F] font-heading">
              Import Teams CSV (Columns: teamName, leaderPhone, leaderName, member2Name)
            </label>
            <textarea
              rows={4}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              className="w-full p-2.5 bg-[#140E0A] border-2 border-[#5A4331] rounded-lg text-xs font-mono text-[#FFF8ED] focus:border-[#FF7A1A] focus:outline-none"
            />
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-[#A89078]">
                Stores in server-only collection <code>registry</code>. Phone numbers are never exposed to clients.
              </span>
              <button
                onClick={handleImportTeams}
                disabled={isLoadingAction}
                className="px-4 py-2 bg-[#9A3412] hover:bg-[#C2410C] border border-[#FFB347] rounded-lg text-xs font-heading font-bold uppercase tracking-wider flex items-center gap-1.5 disabled:opacity-50 sword-cursor"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Import Registry</span>
              </button>
            </div>
          </div>

          {importStatus && (
            <div
              className={`p-3 rounded-lg border text-xs font-bold ${
                importStatus.type === 'success'
                  ? 'bg-[#14532D]/80 border-[#22C55E] text-[#DCFCE7]'
                  : 'bg-[#7F1D1D]/80 border-[#EF4444] text-[#FEE2E2]'
              }`}
            >
              {importStatus.message}
            </div>
          )}

          {/* Active Teams Table */}
          <div className="pt-2">
            <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-[#D8C39F] mb-2">
              Registered Teams Overview ({teams.length} Warbands)
            </h3>
            <div className="max-h-60 overflow-y-auto rounded-lg border border-[#3A2D22] bg-[#140E0A]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#1E1914] text-[#D8C39F] font-heading uppercase text-[10px] tracking-wider sticky top-0 border-b border-[#3A2D22]">
                  <tr>
                    <th className="p-2">Rank</th>
                    <th className="p-2">Team Name</th>
                    <th className="p-2">Total Damage</th>
                    <th className="p-2">Trials Solved</th>
                    <th className="p-2">Badge</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2A2018] font-sans">
                  {teams.map((t) => (
                    <tr key={t.id} className="hover:bg-[#1E140E]/60">
                      <td className="p-2 font-heading font-bold text-[#FFB347]">#{t.rank}</td>
                      <td className="p-2 font-bold text-[#FFF8ED]">{t.name}</td>
                      <td className="p-2 font-mono text-[#4ADE80] font-bold">{t.totalDamage ?? t.score ?? 0} XP</td>
                      <td className="p-2 text-[#A89078]">{t.solvedCount ?? (t.solvedProblemIds?.length || 0)}</td>
                      <td className="p-2">
                        {t.isDragonSlayer && (
                          <span className="px-1.5 py-0.5 rounded bg-[#451A03] border border-[#F59E0B] text-[#FFD700] text-[9px] font-heading font-bold flex items-center gap-1 w-max">
                            <Flame className="w-2.5 h-2.5 text-[#F59E0B]" />
                            DRAGON SLAYER
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {teams.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-[#8A7B6A]">
                        No teams recorded in state.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
