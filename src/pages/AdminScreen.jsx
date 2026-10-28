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
} from 'lucide-react';
import { db } from '../services/firebase';
import { collection, onSnapshot, query, orderBy, doc } from 'firebase/firestore';

export default function AdminScreen() {
  const [adminPassword, setAdminPassword] = useState(() => {
    return sessionStorage.getItem('techflix_admin_pass') || '';
  });
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return Boolean(sessionStorage.getItem('techflix_admin_pass'));
  });
  const [loginInput, setLoginInput] = useState('');
  const [loginError, setLoginError] = useState(null);

  // Dragon state
  const [dragon, setDragon] = useState({ hp: 100, maxHp: 100, status: 'waiting' });
  const [maxHpInput, setMaxHpInput] = useState('100');

  // Runner state
  const [runnerUrl, setRunnerUrl] = useState('');
  const [runnerTestResult, setRunnerTestResult] = useState(null);
  const [isTestingRunner, setIsTestingRunner] = useState(false);
  const [isSavingRunner, setIsSavingRunner] = useState(false);

  // Teams live table
  const [teams, setTeams] = useState([]);
  const [csvText, setCsvText] = useState(
    'teamName,teamCode,members\nTeam Alpha,ALPHA-123,Hiccup & Astrid\nTeam Bravo,BRAVO-456,Snotlout & Fishlegs\nTeam Berserker,BERSERK-789,Dagur the Deranged'
  );
  const [importStatus, setImportStatus] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);
  const [isLoadingAction, setIsLoadingAction] = useState(false);

  // Live listener for dragon state
  useEffect(() => {
    if (!db) return;
    const unsub = onSnapshot(doc(db, 'dragon', 'main'), (snap) => {
      if (snap.exists()) {
        const d = snap.data();
        setDragon({
          hp: d.hp ?? 100,
          maxHp: d.maxHp ?? 100,
          status: d.status || 'waiting',
          winnerTeamId: d.winnerTeamId || null,
        });
        setMaxHpInput(String(d.maxHp || 100));
      }
    });
    return () => unsub();
  }, []);

  // Live listener for all teams
  useEffect(() => {
    if (!db) return;
    const q = query(collection(db, 'teams'), orderBy('totalDamage', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((d, idx) => ({
        id: d.id,
        rank: idx + 1,
        ...d.data(),
      }));
      setTeams(list);
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
    // Verify password by testing a lightweight request
    fetch('/api/admin/runner', {
      headers: { 'x-admin-password': loginInput.trim() },
    }).then((res) => {
      if (res.status === 401) {
        setLoginError('Incorrect admin password');
      } else {
        setAdminPassword(loginInput.trim());
        sessionStorage.setItem('techflix_admin_pass', loginInput.trim());
        setIsAuthenticated(true);
        setLoginError(null);
      }
    }).catch((err) => {
      setLoginError('Error connecting to admin API: ' + err.message);
    });
  };

  const handleStart = async () => {
    setIsLoadingAction(true);
    setActionMessage(null);
    try {
      const res = await fetch('/api/admin/start', {
        method: 'POST',
        headers: { 'x-admin-password': adminPassword },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to start battle');
      setActionMessage({ type: 'success', text: 'Battle started! Dragon is now LIVE.' });
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
        headers: { 'x-admin-password': adminPassword },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to pause battle');
      setActionMessage({ type: 'success', text: 'Battle paused! Status set to WAITING.' });
    } catch (err) {
      setActionMessage({ type: 'error', text: err.message });
    } finally {
      setIsLoadingAction(false);
    }
  };

  const handleReset = async () => {
    const confirmReset = window.confirm(
      'Are you sure you want to reset the battle? This will reset Dragon HP and clear the live feed!'
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
        text: `Battle reset successfully! HP set to ${data.hp}, live feed cleared.`,
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
        message: `✓ Successfully imported ${data.count} team(s)!`,
      });
    } catch (err) {
      setImportStatus({ type: 'error', message: err.message });
    } finally {
      setIsLoadingAction(false);
    }
  };

  const handleExportCSV = () => {
    // Direct fetch with password header and trigger download
    fetch('/api/admin/export', {
      headers: { 'x-admin-password': adminPassword },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to export CSV');
        return res.blob();
      })
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `techflix-teams-export-${Date.now()}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      })
      .catch((err) => alert(err.message));
  };

  // Password gate screen
  if (!isAuthenticated) {
    return (
      <div
        className="h-screen max-h-screen w-screen overflow-hidden relative flex items-center justify-center p-4 bg-cover bg-center font-sans select-none"
        style={{
          backgroundImage: "url('/field.png'), linear-gradient(to bottom, #1c152b 0%, #4a2835 30%, #a85834 50%, #4a5c2d 65%, #1e2e14 100%)",
        }}
      >
        <div className="absolute inset-0 bg-[#0C0806]/75 backdrop-blur-[8px]" />
        <div className="relative z-10 w-full max-w-sm compact-wood-board border-[3px] border-[#684C35] rounded-xl shadow-solid-board p-6 text-center">
          <div className="p-3 w-14 h-14 rounded-full bg-[#1A110B] border-2 border-[#FF7A1A] mx-auto mb-3 flex items-center justify-center shadow-solid-ticket">
            <Lock className="w-7 h-7 text-[#FFB347]" />
          </div>
          <h1 className="font-heading text-2xl font-extrabold text-[#FFF8ED] tracking-wider mb-1">
            WAR COMMAND
          </h1>
          <p className="text-xs text-[#FFB347] font-bold uppercase tracking-widest mb-5">
            ORGANIZER ADMIN GATE
          </p>

          {loginError && (
            <div className="mb-4 px-3 py-2 bg-[#7F1D1D] border border-[#EF4444] rounded text-xs text-[#FEE2E2] font-bold">
              {loginError}
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-3">
            <input
              type="password"
              placeholder="Admin Password"
              value={loginInput}
              onChange={(e) => setLoginInput(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#140E0A] border-2 border-[#5A4331] focus:border-[#FF7A1A] focus:outline-none rounded-lg text-sm text-[#FFF] placeholder-[#66503E] text-center"
              autoFocus
            />
            <button
              type="submit"
              className="w-full py-2.5 bg-[#C2410C] hover:bg-[#EA580C] text-[#FFF] font-heading font-bold uppercase tracking-wider rounded-lg border-2 border-[#FFB347] shadow-solid-ticket text-sm"
            >
              UNLOCK WAR CONSOLE
            </button>
          </form>

          <div className="mt-5 pt-3 border-t border-[#4A3423] text-left">
            <Link to="/" className="text-xs text-[#D8C39F] hover:text-[#FFF] flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Arena
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Admin Dashboard
  return (
    <div
      className="min-h-screen w-screen overflow-y-auto bg-cover bg-center p-4 sm:p-6 font-sans select-none text-[#FFF8ED]"
      style={{
        backgroundImage: "url('/field.png'), linear-gradient(to bottom, #1c152b 0%, #4a2835 30%, #a85834 50%, #4a5c2d 65%, #1e2e14 100%)",
      }}
    >
      <div className="fixed inset-0 bg-[#0C0806]/85 backdrop-blur-[6px] pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto space-y-6">
        {/* Top Header */}
        <header className="flex flex-wrap items-center justify-between gap-4 p-4 compact-wood-board border-[2px] border-[#684C35] rounded-xl shadow-solid-board">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#1A110B] border-2 border-[#FF7A1A] rounded-lg">
              <Shield className="w-6 h-6 text-[#FFB347]" />
            </div>
            <div>
              <h1 className="font-heading text-xl sm:text-2xl font-extrabold text-[#FFF8ED] tracking-wider leading-none">
                TECHFLIX WAR CONSOLE
              </h1>
              <span className="text-[11px] font-bold text-[#FFB347] uppercase tracking-widest">
                REAL-TIME TOURNAMENT OPERATIONS
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/display"
              target="_blank"
              className="px-3 py-1.5 bg-[#1E293B] hover:bg-[#334155] border border-[#64748B] rounded text-xs font-bold text-[#94A3B8] hover:text-[#FFF] flex items-center gap-1.5 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Projector View
            </Link>
            <Link
              to="/"
              className="px-3 py-1.5 bg-[#2E2017] hover:bg-[#443022] border border-[#7A5A41] rounded text-xs font-bold text-[#D8C39F] hover:text-[#FFF] flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Arena
            </Link>
            <button
              onClick={() => {
                sessionStorage.removeItem('techflix_admin_pass');
                setIsAuthenticated(false);
              }}
              className="px-3 py-1.5 bg-[#7F1D1D] hover:bg-[#991B1B] border border-[#EF4444] rounded text-xs font-bold text-[#FEE2E2]"
            >
              Lock
            </button>
          </div>
        </header>

        {actionMessage && (
          <div
            className={`p-3 rounded-lg border text-xs font-bold flex items-center gap-2 ${
              actionMessage.type === 'success'
                ? 'bg-[#14532D] border-[#22C55E] text-[#DCFCE7]'
                : 'bg-[#7F1D1D] border-[#EF4444] text-[#FEE2E2]'
            }`}
          >
            {actionMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-[#4ADE80]" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-[#F87171]" />
            )}
            <span>{actionMessage.text}</span>
          </div>
        )}

        {/* Top 2 Columns: Battle Controls & Piston Runner */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Panel 1: Battle Controls */}
          <div className="compact-wood-board border-[2px] border-[#684C35] rounded-xl p-5 shadow-solid-board space-y-4">
            <div className="flex items-center justify-between border-b border-[#4A3423] pb-2.5">
              <div className="flex items-center gap-2 font-heading font-bold text-base text-[#FFD700]">
                <Server className="w-5 h-5 text-[#FF7A1A]" />
                <span>DRAGON BATTLE CONTROLS</span>
              </div>
              <span
                className={`text-[10px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider ${
                  dragon.status === 'live'
                    ? 'bg-[#15803D] text-[#DCFCE7]'
                    : dragon.status === 'defeated'
                    ? 'bg-[#B91C1C] text-[#FEE2E2]'
                    : 'bg-[#B45309] text-[#FEF3C7]'
                }`}
              >
                Status: {dragon.status}
              </span>
            </div>

            {/* Live HP Status */}
            <div className="p-3 bg-[#140E0A] border border-[#443022] rounded-lg flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#A68F74] block">Current Health</span>
                <span className="font-heading text-2xl font-extrabold text-[#EF4444]">
                  {dragon.hp} <span className="text-sm text-[#A68F74]">/ {dragon.maxHp} HP</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-[11px] font-bold text-[#D8C39F]">Set Max HP:</label>
                <input
                  type="number"
                  value={maxHpInput}
                  onChange={(e) => setMaxHpInput(e.target.value)}
                  min="10"
                  max="10000"
                  className="w-20 px-2 py-1 bg-[#1F150E] border border-[#5A402E] rounded text-sm text-[#FFF] text-center"
                />
              </div>
            </div>

            {/* Control Buttons */}
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={handleStart}
                disabled={isLoadingAction || dragon.status === 'live'}
                className="py-2.5 px-3 bg-[#15803D] hover:bg-[#16A34A] disabled:opacity-40 text-[#FFF] font-heading font-bold text-xs uppercase tracking-wider rounded border border-[#4ADE80] shadow flex items-center justify-center gap-1.5"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>START</span>
              </button>

              <button
                onClick={handlePause}
                disabled={isLoadingAction || dragon.status === 'waiting'}
                className="py-2.5 px-3 bg-[#B45309] hover:bg-[#D97706] disabled:opacity-40 text-[#FFF] font-heading font-bold text-xs uppercase tracking-wider rounded border border-[#FBBF24] shadow flex items-center justify-center gap-1.5"
              >
                <Pause className="w-4 h-4 fill-current" />
                <span>PAUSE</span>
              </button>

              <button
                onClick={handleReset}
                disabled={isLoadingAction}
                className="py-2.5 px-3 bg-[#991B1B] hover:bg-[#DC2626] disabled:opacity-40 text-[#FFF] font-heading font-bold text-xs uppercase tracking-wider rounded border border-[#F87171] shadow flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span>RESET</span>
              </button>
            </div>
          </div>

          {/* Panel 2: Piston Code Execution Runner */}
          <div className="compact-wood-board border-[2px] border-[#684C35] rounded-xl p-5 shadow-solid-board space-y-4">
            <div className="flex items-center justify-between border-b border-[#4A3423] pb-2.5">
              <div className="flex items-center gap-2 font-heading font-bold text-base text-[#FFD700]">
                <Terminal className="w-5 h-5 text-[#FF7A1A]" />
                <span>PISTON CODE RUNNER URL</span>
              </div>
              <span className="text-[10px] text-[#A68F74] font-bold">Stored in config/runner</span>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#D8C39F]">
                Runner Server Address:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="https://piston.yourdomain.com or http://localhost:2000"
                  value={runnerUrl}
                  onChange={(e) => setRunnerUrl(e.target.value)}
                  className="flex-1 px-3 py-2 bg-[#140E0A] border border-[#5A402E] focus:border-[#FF7A1A] focus:outline-none rounded text-xs text-[#FFF] font-mono"
                />
                <button
                  onClick={handleSaveRunner}
                  disabled={isSavingRunner}
                  className="px-4 py-2 bg-[#C2410C] hover:bg-[#EA580C] disabled:opacity-50 text-[#FFF] text-xs font-bold uppercase rounded border border-[#FFB347]"
                >
                  {isSavingRunner ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={handleTestRunner}
                  disabled={isTestingRunner}
                  className="px-4 py-2 bg-[#1E293B] hover:bg-[#334155] border border-[#64748B] text-xs font-bold uppercase rounded text-[#E2E8F0] flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTestingRunner ? 'animate-spin' : ''}`} />
                  <span>Test</span>
                </button>
              </div>
              <p className="text-[10px] text-[#8C745E]">
                Must implement Piston v2 API: <code className="text-[#FFB347]">POST /api/v2/execute</code>. Supports Python, C, C++, and Java.
              </p>
            </div>

            {runnerTestResult && (
              <div
                className={`p-3 rounded border font-mono text-xs whitespace-pre-wrap ${
                  runnerTestResult.type === 'success'
                    ? 'bg-[#052E16] border-[#22C55E] text-[#86EFAC]'
                    : 'bg-[#450A0A] border-[#EF4444] text-[#FCA5A5]'
                }`}
              >
                {runnerTestResult.message}
              </div>
            )}
          </div>
        </div>

        {/* Panel 3: Team Management & CSV Import / Export */}
        <div className="compact-wood-board border-[2px] border-[#684C35] rounded-xl p-5 shadow-solid-board space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#4A3423] pb-2.5">
            <div className="flex items-center gap-2 font-heading font-bold text-base text-[#FFD700]">
              <Users className="w-5 h-5 text-[#FF7A1A]" />
              <span>TEAM MANAGEMENT &amp; CSV IMPORT/EXPORT</span>
            </div>
            <button
              onClick={handleExportCSV}
              className="py-1.5 px-3 bg-[#047857] hover:bg-[#059669] text-[#FFF] text-xs font-bold uppercase tracking-wider rounded border border-[#34D399] flex items-center gap-1.5 shadow"
            >
              <Download className="w-4 h-4" />
              <span>EXPORT RESULTS (CSV)</span>
            </button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-[#D8C39F] uppercase">
                Import Teams CSV (Format: <code className="text-[#FFB347]">teamName, teamCode, members</code>):
              </label>
            </div>
            <textarea
              rows={4}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              className="w-full p-2.5 bg-[#140E0A] border border-[#5A402E] focus:border-[#FF7A1A] focus:outline-none rounded text-xs font-mono text-[#E2E8F0]"
            />
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-[#8C745E]">
                Codes are stored in <code className="text-[#FFB347]">teamCodes/&#123;code&#125;</code> and never exposed to client browsers.
              </p>
              <button
                onClick={handleImportTeams}
                disabled={isLoadingAction}
                className="py-1.5 px-4 bg-[#C2410C] hover:bg-[#EA580C] text-[#FFF] text-xs font-bold uppercase tracking-wider rounded border border-[#FFB347] flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>IMPORT TEAMS</span>
              </button>
            </div>
          </div>

          {importStatus && (
            <div
              className={`p-2.5 rounded border text-xs font-bold ${
                importStatus.type === 'success'
                  ? 'bg-[#14532D] border-[#22C55E] text-[#DCFCE7]'
                  : 'bg-[#7F1D1D] border-[#EF4444] text-[#FEE2E2]'
              }`}
            >
              {importStatus.message}
            </div>
          )}
        </div>

        {/* Panel 4: Live Teams & Solves Table */}
        <div className="compact-wood-board border-[2px] border-[#684C35] rounded-xl p-5 shadow-solid-board space-y-3">
          <div className="flex items-center justify-between border-b border-[#4A3423] pb-2.5">
            <div className="flex items-center gap-2 font-heading font-bold text-base text-[#FFD700]">
              <Shield className="w-5 h-5 text-[#FF7A1A]" />
              <span>LIVE TOURNAMENT STANDINGS ({teams.length} TEAMS)</span>
            </div>
            <span className="text-[10px] text-[#A68F74] font-bold">Auto-updates from Firestore</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#4A3423] text-[#A68F74] uppercase text-[10px] font-heading font-bold">
                  <th className="py-2 px-3">Rank</th>
                  <th className="py-2 px-3">Team Name</th>
                  <th className="py-2 px-3">Members</th>
                  <th className="py-2 px-3 text-center">Damage Dealt</th>
                  <th className="py-2 px-3 text-center">Solves Count</th>
                  <th className="py-2 px-3">Solved Problem IDs</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2B1D14]">
                {teams.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-[#8C745E] italic">
                      No teams registered yet. Use the CSV import tool above to register teams.
                    </td>
                  </tr>
                ) : (
                  teams.map((t) => (
                    <tr key={t.id} className="hover:bg-[#1E150F] transition-colors">
                      <td className="py-2 px-3 font-heading font-bold text-[#FFB347]">#{t.rank}</td>
                      <td className="py-2 px-3 font-bold text-[#FFF8ED]">{t.name}</td>
                      <td className="py-2 px-3 text-[#A68F74]">{t.members || '—'}</td>
                      <td className="py-2 px-3 text-center font-heading font-bold text-[#EF4444]">
                        {t.totalDamage || 0} HP
                      </td>
                      <td className="py-2 px-3 text-center font-bold text-[#FFD700]">
                        {t.solvedProblemIds?.length || 0}
                      </td>
                      <td className="py-2 px-3 text-[#A68F74] font-mono text-[11px]">
                        {t.solvedProblemIds && t.solvedProblemIds.length > 0
                          ? t.solvedProblemIds.join(', ')
                          : 'None yet'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
