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
  Trash2,
  ToggleLeft,
  ToggleRight,
  Flag,
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

  // Settings
  const [compilationPenalty, setCompilationPenalty] = useState(true);

  // Runner state
  const [runnerUrl, setRunnerUrl] = useState('');
  const [runnerTestResult, setRunnerTestResult] = useState(null);
  const [isTestingRunner, setIsTestingRunner] = useState(false);
  const [isSavingRunner, setIsSavingRunner] = useState(false);

  // Teams live summary (from public/state.teams)
  const [teams, setTeams] = useState([]);
  const [registeredTeams, setRegisteredTeams] = useState([]);
  const [isLoadingTeams, setIsLoadingTeams] = useState(false);

  // CSV Import State
  const defaultTemplateCSV =
    'teamName,leaderPhone,leaderName,member2Name\nBerk Vikings,9876543210,Hiccup,Astrid\nDragon Riders,9876543211,Fishlegs,Snotlout\nThor Clan,9876543212,Ragnar,Lagertha\nSolo Berserker,9876543213,Gobber,\nOpen Clan,9876543214,,';

  const [csvText, setCsvText] = useState(defaultTemplateCSV);
  const [previewData, setPreviewData] = useState(null);
  const [replaceAll, setReplaceAll] = useState(false);
  const [importStatus, setImportStatus] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);
  const [isLoadingAction, setIsLoadingAction] = useState(false);

  // Finalized standings modal state
  const [finalRankings, setFinalRankings] = useState(null);

  // Listen to public/state
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

  // Fetch initial data when authenticated
  const fetchRegisteredTeams = () => {
    if (!isAuthenticated) return;
    setIsLoadingTeams(true);
    fetch('/api/admin/teams', {
      headers: { 'x-admin-password': adminPassword },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.teams) setRegisteredTeams(data.teams);
      })
      .catch((err) => console.error('Failed to load registered teams:', err))
      .finally(() => setIsLoadingTeams(false));
  };

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

    fetch('/api/admin/settings', {
      headers: { 'x-admin-password': adminPassword },
    })
      .then((res) => res.json())
      .then((data) => {
        if (typeof data.compilationPenalty === 'boolean') {
          setCompilationPenalty(data.compilationPenalty);
        }
      })
      .catch((err) => console.error('Failed to get settings:', err));

    fetchRegisteredTeams();
  }, [isAuthenticated, adminPassword]);

  // Client-side quick CSV parser for live preview
  useEffect(() => {
    if (!csvText.trim()) {
      setPreviewData(null);
      return;
    }
    const lines = csvText.replace(/^\uFEFF/, '').split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length === 0) {
      setPreviewData(null);
      return;
    }

    const rows = [];
    for (const line of lines) {
      const cols = [];
      let cur = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const c = line[i];
        if (c === '"') inQuotes = !inQuotes;
        else if (c === ',' && !inQuotes) {
          cols.push(cur.trim().replace(/^["']|["']$/g, ''));
          cur = '';
        } else {
          cur += c;
        }
      }
      cols.push(cur.trim().replace(/^["']|["']$/g, ''));
      rows.push(cols);
    }

    if (rows.length === 0) return;

    let start = 0;
    const header = rows[0].map((c) => c.toLowerCase());
    const isHead = header.some((c) => c.includes('team') || c.includes('phone') || c.includes('member'));
    if (isHead) start = 1;

    let tCol = 0, pCol = 1, lCol = 2, mCol = 3;
    if (isHead) {
      header.forEach((c, idx) => {
        if (c.includes('team') || c.includes('clan')) tCol = idx;
        else if (c.includes('phone') || c.includes('mobile') || c.includes('contact')) pCol = idx;
        else if (c.includes('member 2') || c.includes('member2') || c.includes('partner')) mCol = idx;
        else if (c.includes('leader') || c.includes('member 1') || c.includes('member1')) lCol = idx;
      });
    }

    const seenNames = new Set();
    const parsed = [];
    const skipped = [];

    for (let i = start; i < rows.length; i++) {
      const r = rows[i];
      const tName = r[tCol] ? r[tCol].trim() : '';
      const phone = r[pCol] ? r[pCol].trim().replace(/\D/g, '') : '';
      const lName = r[lCol] ? r[lCol].trim() : '';
      const m2Name = r[mCol] ? r[mCol].trim() : '';
      const rowNum = i + 1;

      if (!tName || !phone) {
        skipped.push({ row: rowNum, teamName: tName || '(Blank)', reason: 'Missing name or phone' });
        continue;
      }

      const key = tName.toLowerCase();
      if (phone.length < 10) {
        skipped.push({ row: rowNum, teamName: tName, reason: `Phone < 10 digits (${phone})` });
        continue;
      }
      if (seenNames.has(key)) {
        skipped.push({ row: rowNum, teamName: tName, reason: 'Duplicate in file' });
        continue;
      }

      seenNames.add(key);
      parsed.push({
        row: rowNum,
        teamName: tName,
        phonePreview: phone.slice(-10),
        leaderName: lName || '-',
        member2Name: m2Name || '-',
      });
    }

    setPreviewData({ valid: parsed, skipped });
  }, [csvText]);

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
      setActionMessage({ type: 'success', text: '✓ Battle is now LIVE!' });
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
      setActionMessage({ type: 'success', text: '✓ Battle PAUSED successfully.' });
    } catch (err) {
      setActionMessage({ type: 'error', text: err.message });
    } finally {
      setIsLoadingAction(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm('Reset Dragon to full HP? Scores and warband submissions remain intact.')) return;
    setIsLoadingAction(true);
    setActionMessage(null);
    try {
      const res = await fetch('/api/admin/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': adminPassword,
        },
        body: JSON.stringify({ maxHp: parseInt(maxHpInput, 10) || 100 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reset battle');
      setActionMessage({ type: 'success', text: '✓ Dragon reset successfully to ' + maxHpInput + ' HP!' });
    } catch (err) {
      setActionMessage({ type: 'error', text: err.message });
    } finally {
      setIsLoadingAction(false);
    }
  };

  const handleFinalize = async () => {
    if (!window.confirm('End event and finalize standings? This will freeze standings and recompute final rankings from team documents.')) return;
    setIsLoadingAction(true);
    setActionMessage(null);
    try {
      const res = await fetch('/api/admin/finalize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': adminPassword,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to finalize event');
      setFinalRankings(data.finalRankings || []);
      setActionMessage({ type: 'success', text: '✓ Event successfully finalized! Standings are frozen.' });
    } catch (err) {
      setActionMessage({ type: 'error', text: err.message });
    } finally {
      setIsLoadingAction(false);
    }
  };

  const handleToggleCompilationPenalty = async () => {
    const newVal = !compilationPenalty;
    setCompilationPenalty(newVal);
    try {
      await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': adminPassword,
        },
        body: JSON.stringify({ compilationPenalty: newVal }),
      });
      setActionMessage({
        type: 'success',
        text: `✓ Compilation Error Penalty is now ${newVal ? 'ON' : 'OFF'}`,
      });
    } catch (err) {
      setCompilationPenalty(!newVal);
      setActionMessage({ type: 'error', text: 'Failed to update setting: ' + err.message });
    }
  };

  const handleSaveRunner = async () => {
    setIsSavingRunner(true);
    setActionMessage(null);
    try {
      const res = await fetch('/api/admin/runner', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': adminPassword,
        },
        body: JSON.stringify({ url: runnerUrl.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save runner URL');
      setActionMessage({ type: 'success', text: '✓ Runner URL saved to config/runner.' });
    } catch (err) {
      setActionMessage({ type: 'error', text: err.message });
    } finally {
      setIsSavingRunner(false);
    }
  };

  const handleTestRunner = async () => {
    setIsTestingRunner(true);
    setRunnerTestResult(null);
    try {
      const res = await fetch('/api/admin/runner?test=true', {
        headers: { 'x-admin-password': adminPassword },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setRunnerTestResult({
          type: 'success',
          message: `✓ Runner Online! Test output: "${data.output?.trim()}"`,
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

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result;
      if (typeof content === 'string') {
        setCsvText(content);
      }
    };
    reader.readAsText(file);
  };

  const handleDownloadTemplate = () => {
    const blob = new Blob([defaultTemplateCSV], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dexterity_teams_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportTeams = async () => {
    if (!csvText.trim()) return;
    if (replaceAll && !window.confirm('WARNING: "Replace all teams" is selected! This will clear all existing teams, registry documents, and scores before importing! Proceed?')) {
      return;
    }

    setIsLoadingAction(true);
    setImportStatus(null);
    try {
      const res = await fetch('/api/admin/import-teams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': adminPassword,
        },
        body: JSON.stringify({ csv: csvText, replaceAll }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to import teams');
      setImportStatus({
        type: 'success',
        summary: data.summary,
      });
      fetchRegisteredTeams();
    } catch (err) {
      setImportStatus({ type: 'error', message: err.message });
    } finally {
      setIsLoadingAction(false);
    }
  };

  const handleDeleteTeam = async (teamId, teamName) => {
    if (!window.confirm(`Are you sure you want to delete team "${teamName}"? This action cannot be undone.`)) {
      return;
    }
    setIsLoadingAction(true);
    try {
      const res = await fetch('/api/admin/delete-team', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': adminPassword,
        },
        body: JSON.stringify({ teamId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete team');
      setActionMessage({ type: 'success', text: `✓ Team "${teamName}" deleted.` });
      fetchRegisteredTeams();
    } catch (err) {
      setActionMessage({ type: 'error', text: err.message });
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
            <div className="mb-3 p-2 bg-[#7F1D1D] border border-[#EF4444] rounded text-xs font-bold text-[#FEE2E2]">
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
              className="w-full py-2.5 bg-[#9A3412] hover:bg-[#C2410C] text-[#FFF8ED] font-heading font-bold rounded-lg border border-[#FFB347] transition-all uppercase"
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
              Battle State Engine & Rules
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
              className="py-3 px-4 bg-[#15803D] hover:bg-[#16A34A] border-2 border-[#86EFAC] rounded-lg font-heading font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
            >
              <Play className="w-4 h-4" />
              <span>START / RESUME BATTLE</span>
            </button>

            {/* Pause Button */}
            <button
              onClick={handlePause}
              disabled={isLoadingAction}
              className="py-3 px-4 bg-[#C2410C] hover:bg-[#EA580C] border-2 border-[#FDBA74] rounded-lg font-heading font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
            >
              <Pause className="w-4 h-4" />
              <span>PAUSE BATTLE</span>
            </button>

            {/* End Event and Finalize */}
            <button
              onClick={handleFinalize}
              disabled={isLoadingAction}
              className="py-3 px-4 bg-[#6B21A8] hover:bg-[#7E22CE] border-2 border-[#D8B4FE] rounded-lg font-heading font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
              title="Freeze standings and recompute final rankings from team documents"
            >
              <Flag className="w-4 h-4 text-[#FDE047]" />
              <span>END EVENT & FINALIZE</span>
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
                className="flex-1 py-2.5 px-3 bg-[#3F3F46] hover:bg-[#52525B] border border-[#71717A] rounded-lg font-heading font-bold text-xs uppercase flex items-center justify-center gap-1.5 shadow-md disabled:opacity-50"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>RESET DRAGON</span>
              </button>
            </div>
          </div>

          {/* Compilation Error Penalty Toggle Switch */}
          <div className="pt-2 border-t border-[#3A2D22] flex items-center justify-between">
            <div>
              <span className="text-xs font-heading font-bold uppercase text-[#FFF8ED]">
                Compilation Error counts as penalty
              </span>
              <p className="text-[11px] text-[#A89078]">
                When enabled, submissions resulting in Compilation Error increment the team's penalties count.
              </p>
            </div>
            <button
              onClick={handleToggleCompilationPenalty}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#5A4331] bg-[#140E0A] hover:border-[#FF7A1A] transition-all"
            >
              {compilationPenalty ? (
                <>
                  <ToggleRight className="w-5 h-5 text-[#22C55E]" />
                  <span className="text-xs font-bold text-[#22C55E] uppercase">ENABLED (ON)</span>
                </>
              ) : (
                <>
                  <ToggleLeft className="w-5 h-5 text-[#9CA3AF]" />
                  <span className="text-xs font-bold text-[#9CA3AF] uppercase">DISABLED (OFF)</span>
                </>
              )}
            </button>
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
            <code className="text-[#FFB347]">config/runner</code>.
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
              className="px-4 py-2 bg-[#9A3412] hover:bg-[#C2410C] border border-[#FFB347] rounded-lg text-xs font-heading font-bold uppercase tracking-wider disabled:opacity-50"
            >
              {isSavingRunner ? 'Saving...' : 'Save URL'}
            </button>
            <button
              onClick={handleTestRunner}
              disabled={isTestingRunner}
              className="px-4 py-2 bg-[#2E241C] hover:bg-[#3E3126] border border-[#5A4331] rounded-lg text-xs font-heading font-bold uppercase tracking-wider flex items-center gap-1.5 disabled:opacity-50"
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
              Import Teams & CSV Manager
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadTemplate}
                className="px-3 py-1.5 bg-[#2E241C] hover:bg-[#3E3126] border border-[#5A4331] rounded-lg text-xs font-heading font-bold text-[#FFB347] flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download CSV Template</span>
              </button>
              <button
                onClick={handleExportCSV}
                className="px-3 py-1.5 bg-[#2E241C] hover:bg-[#3E3126] border border-[#5A4331] rounded-lg text-xs font-heading font-bold text-[#FFB347] flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Standings CSV</span>
              </button>
            </div>
          </div>

          {/* File Picker & Replace All Option */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#140E0A] p-3 rounded-lg border border-[#3A2D22]">
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="text-xs text-[#A89078] file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-bold file:bg-[#9A3412] file:text-white hover:file:bg-[#C2410C] cursor-pointer"
                />
              </div>

              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 text-xs font-bold text-[#F87171] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={replaceAll}
                    onChange={(e) => setReplaceAll(e.target.checked)}
                    className="rounded border-[#EF4444] text-[#EF4444] focus:ring-0"
                  />
                  <span>Replace all teams (wipes old warbands & progress)</span>
                </label>
              </div>
            </div>

            <textarea
              rows={4}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder="Paste CSV rows here: teamName,leaderPhone,leaderName,member2Name"
              className="w-full p-2.5 bg-[#140E0A] border-2 border-[#5A4331] rounded-lg text-xs font-mono text-[#FFF8ED] focus:border-[#FF7A1A] focus:outline-none"
            />

            {/* Live Preview Table */}
            {previewData && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-[#D8C39F]">
                    CSV Preview: {previewData.valid.length} Valid Warbands • {previewData.skipped.length} Skipped
                  </span>
                </div>

                <div className="max-h-40 overflow-y-auto rounded-lg border border-[#3A2D22] bg-[#140E0A]">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-[#1E1914] text-[#D8C39F] text-[10px] uppercase sticky top-0 border-b border-[#3A2D22]">
                      <tr>
                        <th className="p-1.5">Row</th>
                        <th className="p-1.5">Team Name</th>
                        <th className="p-1.5">Phone Preview</th>
                        <th className="p-1.5">Leader</th>
                        <th className="p-1.5">Member 2</th>
                        <th className="p-1.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2A2018]">
                      {previewData.valid.map((r) => (
                        <tr key={r.row} className="hover:bg-[#1E140E]">
                          <td className="p-1.5 text-[#A89078]">#{r.row}</td>
                          <td className="p-1.5 font-bold text-[#FFF8ED]">{r.teamName}</td>
                          <td className="p-1.5 text-[#38BDF8]">***{r.phonePreview}</td>
                          <td className="p-1.5 text-[#E0E0E0]">{r.leaderName}</td>
                          <td className="p-1.5 text-[#E0E0E0]">{r.member2Name}</td>
                          <td className="p-1.5 text-[#4ADE80] font-bold">Valid</td>
                        </tr>
                      ))}
                      {previewData.skipped.map((s, idx) => (
                        <tr key={'skip-' + idx} className="bg-[#450A0A]/40 text-[#FCA5A5]">
                          <td className="p-1.5">#{s.row}</td>
                          <td className="p-1.5 font-bold">{s.teamName}</td>
                          <td className="p-1.5">-</td>
                          <td className="p-1.5">-</td>
                          <td className="p-1.5">-</td>
                          <td className="p-1.5 font-bold text-[#F87171]">{s.reason}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-[#A89078]">
                Server collection <code>registry</code>. Phone numbers are strictly server-only and never exposed to clients.
              </span>
              <button
                onClick={handleImportTeams}
                disabled={isLoadingAction || !previewData?.valid.length}
                className="px-5 py-2.5 bg-[#9A3412] hover:bg-[#C2410C] border-2 border-[#FFB347] rounded-lg text-xs font-heading font-bold uppercase tracking-wider flex items-center gap-1.5 disabled:opacity-50"
              >
                <Upload className="w-4 h-4" />
                <span>Confirm & Import Teams</span>
              </button>
            </div>
          </div>

          {/* Import Result Summary */}
          {importStatus && importStatus.type === 'success' && (
            <div className="p-4 rounded-lg border border-[#22C55E] bg-[#14532D]/80 text-xs font-sans space-y-2">
              <div className="font-heading font-bold text-sm text-[#DCFCE7] flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#86EFAC]" />
                <span>Import Finished Successfully!</span>
              </div>
              <div className="grid grid-cols-3 gap-2 font-mono text-center">
                <div className="p-2 bg-[#052E16] rounded border border-[#16A34A]">
                  <span className="text-lg font-bold text-[#4ADE80]">{importStatus.summary.imported}</span>
                  <div className="text-[10px] text-[#A7F3D0]">NEW TEAMS</div>
                </div>
                <div className="p-2 bg-[#052E16] rounded border border-[#16A34A]">
                  <span className="text-lg font-bold text-[#38BDF8]">{importStatus.summary.updated}</span>
                  <div className="text-[10px] text-[#BAE6FD]">UPDATED (KEPT PROGRESS)</div>
                </div>
                <div className="p-2 bg-[#052E16] rounded border border-[#16A34A]">
                  <span className="text-lg font-bold text-[#F87171]">{importStatus.summary.skippedCount}</span>
                  <div className="text-[10px] text-[#FECACA]">SKIPPED ROWS</div>
                </div>
              </div>

              {importStatus.summary.skipped?.length > 0 && (
                <div className="mt-2 pt-2 border-t border-[#16A34A]">
                  <span className="font-bold text-[#FEE2E2]">Skipped Details:</span>
                  <ul className="list-disc list-inside mt-1 space-y-0.5 text-[11px] text-[#FECACA]">
                    {importStatus.summary.skipped.map((s, idx) => (
                      <li key={idx}>
                        Row {s.row} ({s.teamName}): {s.reason}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {importStatus && importStatus.type === 'error' && (
            <div className="p-3 rounded-lg border border-[#EF4444] bg-[#7F1D1D]/90 text-xs font-bold text-[#FEE2E2] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#FCA5A5] flex-shrink-0" />
              <span>{importStatus.message}</span>
            </div>
          )}

          {/* 4. REGISTERED TEAMS TABLE */}
          <div className="pt-4 border-t border-[#3A2D22]">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-[#D8C39F] flex items-center gap-2">
                <span>Registered Warbands ({registeredTeams.length} Teams)</span>
                <button
                  onClick={fetchRegisteredTeams}
                  className="p-1 hover:text-[#FFB347] transition-colors"
                  title="Refresh registered teams"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingTeams ? 'animate-spin' : ''}`} />
                </button>
              </h3>
            </div>

            <div className="max-h-72 overflow-y-auto rounded-lg border border-[#3A2D22] bg-[#140E0A]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#1E1914] text-[#D8C39F] font-heading uppercase text-[10px] tracking-wider sticky top-0 border-b border-[#3A2D22]">
                  <tr>
                    <th className="p-2">Team Name</th>
                    <th className="p-2">Registered Members</th>
                    <th className="p-2">Login Status</th>
                    <th className="p-2">XP</th>
                    <th className="p-2">Accuracy</th>
                    <th className="p-2">Penalties</th>
                    <th className="p-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2A2018] font-sans">
                  {registeredTeams.map((t) => (
                    <tr key={t.id} className="hover:bg-[#1E140E]/60">
                      <td className="p-2 font-bold text-[#FFF8ED]">{t.teamName}</td>
                      <td className="p-2 text-[#D8C39F]">{t.memberNames}</td>
                      <td className="p-2">
                        {t.isLoggedIn ? (
                          <span className="px-1.5 py-0.5 rounded bg-[#14532D] text-[#86EFAC] text-[9.5px] font-bold uppercase">
                            Logged In ({t.loggedInMembers})
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded bg-[#27272A] text-[#A1A1AA] text-[9.5px] font-bold uppercase">
                            Waiting
                          </span>
                        )}
                      </td>
                      <td className="p-2 font-mono text-[#4ADE80] font-bold">{t.totalDamage} XP</td>
                      <td className="p-2 font-mono text-[#86EFAC]">{t.accuracy}%</td>
                      <td className="p-2 font-mono text-[#FCA5A5]">{t.penalties}</td>
                      <td className="p-2 text-right">
                        <button
                          onClick={() => handleDeleteTeam(t.id, t.teamName)}
                          className="p-1 px-2 bg-[#7F1D1D]/70 hover:bg-[#991B1B] text-[#FCA5A5] hover:text-white rounded border border-[#EF4444]/40 text-[10px] font-bold flex items-center gap-1 ml-auto"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {registeredTeams.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-4 text-center text-[#8A7B6A]">
                        No teams registered. Use the CSV import section above to add teams.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Finalized Event Results Modal / Box */}
        {finalRankings && (
          <section className="bg-[#2E1065]/90 border-2 border-[#A855F7] rounded-xl p-5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-[#6B21A8] pb-2">
              <h2 className="font-heading text-lg font-bold uppercase text-[#F3E8FF] flex items-center gap-2">
                <Flag className="w-5 h-5 text-[#FDE047]" />
                Official Finalized Standings
              </h2>
              <button
                onClick={() => setFinalRankings(null)}
                className="text-xs text-[#D8B4FE] hover:text-white"
              >
                Dismiss
              </button>
            </div>

            <div className="max-h-60 overflow-y-auto rounded-lg border border-[#6B21A8] bg-[#1E0B38]">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-[#3B0764] text-[#E9D5FF] font-heading uppercase text-[10px] sticky top-0">
                  <tr>
                    <th className="p-2">Rank</th>
                    <th className="p-2">Warband Name</th>
                    <th className="p-2">Final XP</th>
                    <th className="p-2">Accuracy (%)</th>
                    <th className="p-2">Penalties</th>
                    <th className="p-2">Solves</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#4C1D95]">
                  {finalRankings.map((r) => (
                    <tr key={r.id}>
                      <td className="p-2 font-heading font-bold text-[#FDE047]">#{r.rank}</td>
                      <td className="p-2 font-bold text-white">{r.name}</td>
                      <td className="p-2 font-mono text-[#4ADE80] font-bold">{r.totalDamage} XP</td>
                      <td className="p-2 font-mono text-[#86EFAC]">{r.accuracy}%</td>
                      <td className="p-2 font-mono text-[#FCA5A5]">{r.penalties || 0}</td>
                      <td className="p-2 text-[#E9D5FF]">{r.acceptedSolves || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
