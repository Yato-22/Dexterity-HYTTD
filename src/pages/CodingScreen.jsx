import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { useGame } from '../context/GameContext';
import { compareOutputs } from '../services/judge';
import HPBar from '../components/HPBar';
import { RopeSegment, RopeKnot } from '../components/RopeGraphic';
import {
  ArrowLeft,
  Play,
  FlaskConical,
  Send,
  RotateCcw,
  Volume2,
  VolumeX,
  Flame,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Sparkles,
  Trophy,
  PauseCircle,
  WifiOff,
} from 'lucide-react';

export default function CodingScreen() {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    token,
    hp,
    maxHp,
    dragonName,
    dragonStatus,
    isPaused,
    runnerOk,
    isReconnecting,
    isDefeated,
    winnerTeam,
    sortedTeams,
    userTeam,
    userTeamRank,
    soundMuted,
    setSoundMuted,
    solvedProblems,
    boardProblems,
    saveUserCode,
    getUserCode,
  } = useGame();

  const [problem, setProblem] = useState(() => boardProblems?.[id] || null);
  const [loadingProblem, setLoadingProblem] = useState(!boardProblems?.[id]);
  const [problemError, setProblemError] = useState(null);

  // Language & Code State
  const [language, setLanguage] = useState('c'); // 'c', 'cpp', 'java', 'python'
  const [code, setCode] = useState('');
  const [fontSize, setFontSize] = useState(15);
  const [activeBottomTab, setActiveBottomTab] = useState('testcase'); // 'testcase', 'custom', 'result'
  const [selectedCaseIdx, setSelectedCaseIdx] = useState(0);
  const [customInput, setCustomInput] = useState('');

  // Execution state
  const [isRunning, setIsRunning] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [verdict, setVerdict] = useState(null);
  const [resultData, setResultData] = useState(null);
  const [acceptedBanner, setAcceptedBanner] = useState(false);
  const [craftedWeapon, setCraftedWeapon] = useState(null);

  // Fetch problem statement if not in memory
  useEffect(() => {
    if (boardProblems?.[id]) {
      setProblem(boardProblems[id]);
      setLoadingProblem(false);
      setProblemError(null);
      return;
    }

    async function fetchStatement() {
      setLoadingProblem(true);
      try {
        const res = await fetch(`/api/problem?id=${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const data = await res.json();
          setProblem(data);
          setProblemError(null);
        } else {
          const errData = await res.json().catch(() => ({}));
          setProblemError(errData.error || 'This problem is not on your team board.');
        }
      } catch (err) {
        setProblemError('Failed to load problem statement.');
      } finally {
        setLoadingProblem(false);
      }
    }

    fetchStatement();
  }, [id, boardProblems, token]);

  // Synchronize code when problem or language changes
  useEffect(() => {
    if (!problem) return;
    const starter = problem.starterCode?.[language] || '';
    setCode(getUserCode(problem.id, language, starter));
    setCustomInput(problem.samples?.[0]?.input || '');
    setVerdict(null);
    setResultData(null);
  }, [problem?.id, language, getUserCode]);

  const handleEditorChange = (newVal) => {
    setCode(newVal || '');
    if (problem) {
      saveUserCode(problem.id, language, newVal || '');
    }
  };

  const handleResetCode = () => {
    if (!problem) return;
    const starter = problem.starterCode?.[language] || '';
    setCode(starter);
    saveUserCode(problem.id, language, starter);
  };

  // 5-second cooldown timer
  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const interval = setInterval(() => {
      setCooldownSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldownSeconds]);

  const startCooldown = () => setCooldownSeconds(5);

  const handleEditorWillMount = (monaco) => {
    monaco.editor.defineTheme('vikingTheme', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'string', foreground: '9CCB7E' },
        { token: 'keyword', foreground: 'E8A15A', fontStyle: 'bold' },
        { token: 'number', foreground: 'D9B26F' },
        { token: 'comment', foreground: '8A7B6A', fontStyle: 'italic' },
        { token: 'identifier.function', foreground: '8FC1E3' },
        { token: 'type', foreground: 'D4A373' },
      ],
      colors: {
        'editor.background': '#1E1A17',
        'editorLineNumber.foreground': '#665343',
        'editorGutter.background': '#181410',
        'editorLineHighlightBackground': '#2A231D',
        'editor.selectionBackground': '#4A3A2A',
        'editorCursor.foreground': '#FFB347',
        'editorWhitespace.foreground': '#382b20',
      },
    });
  };

  // =========================================================================
  // RUN (Sample Cases via /api/run)
  // =========================================================================
  const handleRun = async () => {
    if (isRunning || cooldownSeconds > 0 || isPaused || !problem) return;
    setIsRunning(true);
    startCooldown();
    setActiveBottomTab('result');
    setVerdict('RUNNING');
    setResultData({ mode: 'run', cases: [] });

    const cases = problem.samples || [];
    const runResults = [];
    let allPassed = true;
    let fatalError = null;

    for (let i = 0; i < cases.length; i++) {
      const tc = cases[i];
      try {
        const response = await fetch('/api/run', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            language,
            code,
            stdin: tc.input || '',
            timeLimitMs: Math.min(problem.timeLimitMs || 2000, 3000),
            problemId: problem.id,
          }),
        });

        const res = await response.json();

        if (!response.ok || res.error) {
          fatalError = { type: 'RUNTIME_ERROR', message: res.error || res.stderr || 'Execution failed' };
          break;
        }

        if (res.compileError) {
          fatalError = { type: 'COMPILATION_ERROR', message: res.compileError };
          break;
        }
        if (res.isTimeout) {
          fatalError = { type: 'TIME_LIMIT_EXCEEDED', message: 'Time limit exceeded (> 2000ms)' };
          break;
        }
        if (res.exitCode !== 0 && res.stderr) {
          fatalError = { type: 'RUNTIME_ERROR', message: res.stderr };
          break;
        }

        const passed = compareOutputs(res.stdout, tc.expectedOutput);
        if (!passed) allPassed = false;

        runResults.push({
          caseNum: i + 1,
          input: tc.input,
          expected: tc.expectedOutput,
          actual: res.stdout,
          passed,
          timeMs: res.timeMs || 50,
        });
      } catch (err) {
        fatalError = { type: 'RUNTIME_ERROR', message: 'Failed to reach runner: ' + err.message };
        break;
      }
    }

    setIsRunning(false);

    if (fatalError) {
      setVerdict(fatalError.type);
      setResultData({ mode: 'run', error: fatalError.message });
    } else if (allPassed) {
      setVerdict('ACCEPTED');
      setResultData({ mode: 'run', cases: runResults, summary: 'All sample cases passed!' });
    } else {
      setVerdict('WRONG_ANSWER');
      setResultData({ mode: 'run', cases: runResults });
    }
  };

  // =========================================================================
  // TEST (Custom Input via /api/run)
  // =========================================================================
  const handleTest = async () => {
    if (isRunning || cooldownSeconds > 0 || isPaused || !problem) return;
    setIsRunning(true);
    startCooldown();
    setActiveBottomTab('result');
    setVerdict('RUNNING');

    try {
      const response = await fetch('/api/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          language,
          code,
          stdin: customInput || '',
          timeLimitMs: 2000,
          problemId: problem.id,
        }),
      });

      const res = await response.json();
      setIsRunning(false);

      if (!response.ok || res.error) {
        setVerdict('RUNTIME_ERROR');
        setResultData({ mode: 'test', error: res.error || res.stderr || 'Execution failed', timeMs: res.timeMs });
        return;
      }

      if (res.compileError) {
        setVerdict('COMPILATION_ERROR');
        setResultData({ mode: 'test', error: res.compileError, timeMs: res.timeMs });
      } else if (res.isTimeout) {
        setVerdict('TIME_LIMIT_EXCEEDED');
        setResultData({ mode: 'test', error: 'Time limit exceeded (> 2000ms)', timeMs: res.timeMs });
      } else if (res.exitCode !== 0 && res.stderr) {
        setVerdict('RUNTIME_ERROR');
        setResultData({ mode: 'test', error: res.stderr, timeMs: res.timeMs });
      } else {
        setVerdict('FINISHED');
        setResultData({
          mode: 'test',
          stdout: res.stdout,
          stderr: res.stderr,
          timeMs: res.timeMs,
        });
      }
    } catch (err) {
      setIsRunning(false);
      setVerdict('RUNTIME_ERROR');
      setResultData({ mode: 'test', error: 'Runner connection error: ' + err.message });
    }
  };

  // =========================================================================
  // SUBMIT (Full Hidden & Sample Tests via /api/submit)
  // =========================================================================
  const handleSubmit = async () => {
    if (isRunning || cooldownSeconds > 0 || isPaused || !problem) return;
    setIsRunning(true);
    startCooldown();
    setActiveBottomTab('result');
    setVerdict('EVALUATING');
    setResultData({ mode: 'submit', passedCount: 0, totalCount: 8 });

    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          language,
          code,
          problemId: problem.id,
        }),
      });

      const data = await response.json();
      setIsRunning(false);

      if (!response.ok) {
        setVerdict('RUNTIME_ERROR');
        setResultData({
          mode: 'submit',
          error: data.error || 'Submission failed',
          passedCount: 0,
          totalCount: 8,
        });
        return;
      }

      setVerdict(data.verdict);
      setResultData({
        mode: 'submit',
        passedCount: data.passed,
        totalCount: data.total,
        passedSummary: data.passedSummary,
        failureDetails: data.failureDetails,
        error: data.failureDetails?.error || data.failureDetails?.compileError || data.failureDetails?.stderr,
      });

      if (data.allPassed) {
        setCraftedWeapon(problem.tier || problem.weapon || 'weapon');
        setAcceptedBanner(true);

        try {
          sessionStorage.setItem(
            'techflix_pending_attack',
            JSON.stringify({
              tier: data.tier || problem.tier || problem.weapon || 'dagger',
              xp: problem.xp || 2,
              problemId: problem.id,
              timestamp: Date.now(),
            })
          );
        } catch {}

        setTimeout(() => {
          navigate('/');
        }, 1200);
      }
    } catch (err) {
      setIsRunning(false);
      setVerdict('RUNTIME_ERROR');
      setResultData({ mode: 'submit', error: 'Server connection error: ' + err.message });
    }
  };

  // If problem is not found or error
  if (loadingProblem) {
    return (
      <div className="h-screen w-screen bg-[#140E0A] flex flex-col items-center justify-center font-heading text-[#FFF8ED]">
        <Flame className="w-10 h-10 text-[#FF7A1A] animate-pulse mb-3" />
        <h2 className="text-xl font-bold uppercase tracking-widest">LOADING SCROLL...</h2>
      </div>
    );
  }

  if (problemError || !problem) {
    return (
      <div className="h-screen w-screen bg-[#140E0A] flex flex-col items-center justify-center font-heading text-[#FFF8ED] p-6 text-center">
        <AlertTriangle className="w-12 h-12 text-[#EF4444] mb-3" />
        <h2 className="text-2xl font-bold uppercase tracking-widest text-[#F87171] mb-2">TRIAL NOT AVAILABLE</h2>
        <p className="font-sans text-sm text-[#D8C39F] max-w-md mb-6">
          {problemError || 'This trial is not on your warband’s active board.'}
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2.5 bg-[#9A3412] hover:bg-[#C2410C] text-[#FFF8ED] font-heading font-bold rounded-lg border border-[#FFB347] flex items-center gap-2 sword-cursor"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>RETURN TO THE ARENA</span>
        </button>
      </div>
    );
  }

  const isSolved = solvedProblems.includes(problem.id);

  return (
    <div
      className="h-screen max-h-screen w-screen overflow-hidden relative select-none bg-cover bg-center flex flex-col justify-between"
      style={{
        backgroundImage: "url('/field.png'), linear-gradient(to bottom, #1c152b 0%, #4a2835 30%, #a85834 50%, #4a5c2d 65%, #1e2e14 100%)",
      }}
    >
      <div className="absolute inset-0 bg-[#0C0806]/40 pointer-events-none z-0" />

      {/* Reconnecting Banner */}
      {isReconnecting && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-50 bg-[#7F1D1D]/90 border border-[#EF4444] px-4 py-1 rounded-full shadow-lg flex items-center gap-2 text-xs font-bold text-[#FEE2E2] animate-pulse">
          <WifiOff className="w-3.5 h-3.5 text-[#FCA5A5]" />
          <span>Reconnecting... Code is saved locally.</span>
        </div>
      )}

      {/* Runner Outage Warning Banner */}
      {!runnerOk && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-50 bg-[#9A3412]/95 border-2 border-[#F97316] px-5 py-1.5 rounded-lg shadow-2xl flex items-center gap-2 text-xs font-bold text-[#FFF8ED]">
          <AlertTriangle className="w-4 h-4 text-[#FDE047] animate-bounce" />
          <span>The forge is down, please wait...</span>
        </div>
      )}

      {/* Full-Screen Viking Pause Overlay */}
      {isPaused && (
        <div className="absolute inset-0 z-50 bg-[#0C0806]/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center select-none">
          <div className="compact-wood-board border-[4px] border-[#8C6F54] rounded-2xl p-8 max-w-lg shadow-[0_0_50px_rgba(0,0,0,0.9)] relative">
            <div className="compact-nail top-3 left-3" />
            <div className="compact-nail top-3 right-3" />
            <div className="compact-nail bottom-3 left-3" />
            <div className="compact-nail bottom-3 right-3" />

            <PauseCircle className="w-16 h-16 text-[#FF7A1A] mx-auto mb-4 animate-pulse" />
            <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-[#FFF8ED] tracking-widest uppercase heading-shadow mb-2">
              BATTLE PAUSED
            </h2>
            <p className="font-sans text-base text-[#D8C39F] font-semibold mb-4">
              The battle is halted by the chieftain. Your code is safe and intact.
            </p>
            <div className="inline-block px-4 py-1.5 bg-[#140E0A] border border-[#5A4331] rounded-lg text-xs font-heading font-bold text-[#FFB347] tracking-wider uppercase">
              Submissions will resume instantly when unpaused
            </div>
          </div>
        </div>
      )}

      {/* Accepted Celebration Banner */}
      {acceptedBanner && (
        <div className="absolute inset-0 z-50 bg-[#0C0806]/80 backdrop-blur-sm flex items-center justify-center p-4 select-none">
          <div className="compact-wood-board border-[3px] border-[#22C55E] rounded-xl p-6 max-w-md text-center shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <Sparkles className="w-12 h-12 text-[#4ADE80] mx-auto mb-2 animate-bounce" />
            <h2 className="font-heading text-2xl font-extrabold text-[#F0FDF4] uppercase tracking-wider mb-1">
              TRIAL ACCEPTED!
            </h2>
            <p className="font-sans text-sm text-[#BBF7D0] mb-3">
              You forged a <span className="font-bold text-[#FFD700] uppercase">{craftedWeapon}</span> (+{problem.xp} XP)!
            </p>
            <div className="text-xs font-bold text-[#86EFAC] font-heading uppercase tracking-widest animate-pulse">
              Returning to arena to strike...
            </div>
          </div>
        </div>
      )}

      {/* TOP HEADER BAR */}
      <header className="w-full flex-shrink-0 z-30 px-3 py-1.5 flex items-center justify-between border-b-2 border-[#4A3A2C] bg-[#140E0A]/90">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-xs font-heading font-bold uppercase tracking-wider text-[#D8C39F] hover:text-[#FFF8ED] transition-colors sword-cursor"
        >
          <ArrowLeft className="w-4 h-4 text-[#FF7A1A]" />
          <span>ARENA</span>
        </button>

        {/* Center: Dragon HP Status */}
        <div className="w-[320px] sm:w-[420px]">
          <HPBar
            currentHp={hp}
            maxHp={maxHp}
            dragonName={dragonName}
            isDefeated={isDefeated}
            isHit={false}
          />
        </div>

        {/* User Info & Sound Toggle */}
        <div className="flex items-center gap-3 text-xs font-bold text-[#D8C39F]">
          <span className="font-heading tracking-wider hidden sm:inline text-[#FFB347]">
            {userTeam?.name} ({userTeam?.memberName || 'Warrior'})
          </span>
          <button
            onClick={() => setSoundMuted(!soundMuted)}
            className="p-1 hover:text-[#FFB347] transition-colors"
          >
            {soundMuted ? <VolumeX className="w-4 h-4 text-[#8A7B6A]" /> : <Volume2 className="w-4 h-4 text-[#FFB347]" />}
          </button>
        </div>
      </header>

      {/* MAIN 2-COLUMN CODING WORKSPACE */}
      <main className="flex-1 min-h-0 w-full flex items-stretch gap-2 p-2 2xl:p-3 relative z-10">
        
        {/* LEFT COLUMN: Code Editor + Bottom Test Panel */}
        <section className="flex-1 min-w-0 h-full flex flex-col justify-between gap-1.5">
          
          {/* Top Bar above Editor */}
          <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-[#1E1A17] border-2 border-[#4A3A2C] shadow-sm">
            <div className="flex items-center gap-2">
              <span className="font-heading text-xs font-bold uppercase tracking-wider text-[#D8C39F]">
                Language:
              </span>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="px-2.5 py-1 bg-[#140E0A] border border-[#5A4331] rounded text-xs font-heading font-bold text-[#FFF8ED] uppercase focus:outline-none focus:border-[#FF7A1A]"
              >
                <option value="c">C (GCC)</option>
                <option value="cpp">C++ (GCC)</option>
                <option value="python">Python 3</option>
                <option value="java">Java (OpenJDK)</option>
              </select>
            </div>

            {/* Separate Font-Size Buttons and Reset Button (Keep separate per Part 8) */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 border-r border-[#4A3A2C] pr-2">
                <button
                  onClick={() => setFontSize((s) => Math.max(12, s - 1))}
                  className="px-2 py-0.5 rounded bg-[#140E0A] border border-[#5A4331] text-xs font-bold text-[#D8C39F] hover:text-[#FFF8ED]"
                  title="Decrease font size"
                >
                  A-
                </button>
                <span className="text-[11px] font-mono text-[#A89078] w-5 text-center">{fontSize}</span>
                <button
                  onClick={() => setFontSize((s) => Math.min(22, s + 1))}
                  className="px-2 py-0.5 rounded bg-[#140E0A] border border-[#5A4331] text-xs font-bold text-[#D8C39F] hover:text-[#FFF8ED]"
                  title="Increase font size"
                >
                  A+
                </button>
              </div>

              <button
                onClick={handleResetCode}
                className="flex items-center gap-1 px-2.5 py-1 bg-[#140E0A] hover:bg-[#2A211B] border border-[#5A4331] rounded text-xs font-heading font-bold text-[#D8C39F] hover:text-[#FF7A1A] transition-colors sword-cursor"
                title="Reset code to starter boilerplate"
              >
                <RotateCcw className="w-3 h-3" />
                <span>RESET TEMPLATE</span>
              </button>
            </div>
          </div>

          {/* Monaco Editor Container */}
          <div className="flex-1 min-h-0 w-full rounded-lg border-2 border-[#4A3A2C] bg-[#1E1A17] overflow-hidden shadow-inner relative">
            <Editor
              height="100%"
              language={language === 'cpp' ? 'cpp' : language === 'c' ? 'c' : language === 'java' ? 'java' : 'python'}
              value={code}
              theme="vikingTheme"
              beforeMount={handleEditorWillMount}
              onChange={handleEditorChange}
              options={{
                fontSize,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                fontFamily: "'Fira Code', 'JetBrains Mono', Consolas, monospace",
                lineNumbers: 'on',
                tabSize: 4,
                automaticLayout: true,
              }}
            />
          </div>

          {/* Bottom Tabs & Controls */}
          <div className="h-[180px] 2xl:h-[220px] w-full rounded-lg border-2 border-[#4A3A2C] bg-[#181410] flex flex-col justify-between overflow-hidden shadow-solid-ticket flex-shrink-0">
            {/* Tab Headers & Run/Submit Buttons */}
            <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-[#3A2D22] bg-[#1E1914]">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setActiveBottomTab('testcase')}
                  className={`px-3 py-1 rounded text-xs font-heading font-bold uppercase tracking-wider transition-colors ${
                    activeBottomTab === 'testcase'
                      ? 'bg-[#2E241C] text-[#FFB347] border border-[#5A4331]'
                      : 'text-[#A89078] hover:text-[#FFF8ED]'
                  }`}
                >
                  Sample Cases
                </button>
                <button
                  onClick={() => setActiveBottomTab('custom')}
                  className={`px-3 py-1 rounded text-xs font-heading font-bold uppercase tracking-wider transition-colors ${
                    activeBottomTab === 'custom'
                      ? 'bg-[#2E241C] text-[#FFB347] border border-[#5A4331]'
                      : 'text-[#A89078] hover:text-[#FFF8ED]'
                  }`}
                >
                  Custom Test
                </button>
                <button
                  onClick={() => setActiveBottomTab('result')}
                  className={`px-3 py-1 rounded text-xs font-heading font-bold uppercase tracking-wider transition-colors ${
                    activeBottomTab === 'result'
                      ? 'bg-[#2E241C] text-[#FFB347] border border-[#5A4331]'
                      : 'text-[#A89078] hover:text-[#FFF8ED]'
                  }`}
                >
                  Verdict / Output
                </button>
              </div>

              {/* Action Buttons: Run, Test, Submit */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRun}
                  disabled={isRunning || cooldownSeconds > 0 || isPaused}
                  className="px-3 py-1 bg-[#2E241C] hover:bg-[#3E3126] border border-[#5A4331] rounded text-xs font-heading font-bold text-[#FFF8ED] uppercase tracking-wider flex items-center gap-1.5 transition-all disabled:opacity-50 sword-cursor"
                >
                  <Play className="w-3.5 h-3.5 text-[#16A34A]" />
                  <span>RUN (SAMPLES)</span>
                </button>

                <button
                  onClick={handleTest}
                  disabled={isRunning || cooldownSeconds > 0 || isPaused}
                  className="px-3 py-1 bg-[#2E241C] hover:bg-[#3E3126] border border-[#5A4331] rounded text-xs font-heading font-bold text-[#FFF8ED] uppercase tracking-wider flex items-center gap-1.5 transition-all disabled:opacity-50 sword-cursor"
                >
                  <FlaskConical className="w-3.5 h-3.5 text-[#2563EB]" />
                  <span>TEST CUSTOM</span>
                </button>

                <button
                  onClick={handleSubmit}
                  disabled={isRunning || cooldownSeconds > 0 || isPaused}
                  className="px-4 py-1 bg-gradient-to-r from-[#9A3412] to-[#C2410C] hover:from-[#C2410C] hover:to-[#EA580C] border border-[#FFB347] rounded text-xs font-heading font-extrabold text-[#FFF8ED] uppercase tracking-wider flex items-center gap-1.5 shadow-md transition-all disabled:opacity-50 sword-cursor"
                >
                  <Send className="w-3.5 h-3.5 text-[#FFD700]" />
                  <span>{cooldownSeconds > 0 ? `WAIT (${cooldownSeconds}s)` : 'SUBMIT TRIAL'}</span>
                </button>
              </div>
            </div>

            {/* Tab Contents */}
            <div className="flex-1 p-2.5 overflow-y-auto text-xs font-mono text-[#D8C39F]">
              {activeBottomTab === 'testcase' && (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    {(problem.samples || []).map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedCaseIdx(idx)}
                        className={`px-2.5 py-1 rounded text-xs font-bold uppercase font-heading ${
                          selectedCaseIdx === idx
                            ? 'bg-[#2E241C] text-[#FFB347] border border-[#FF7A1A]'
                            : 'bg-[#140E0A] text-[#8A7B6A] border border-[#3A2D22]'
                        }`}
                      >
                        Case {idx + 1}
                      </button>
                    ))}
                  </div>
                  {problem.samples?.[selectedCaseIdx] && (
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <div className="text-[10px] font-bold text-[#8A7B6A] uppercase mb-1 font-heading">Input</div>
                        <pre className="p-2 bg-[#120D09] rounded border border-[#3A2D22] text-[#FFF8ED] whitespace-pre-wrap">
                          {problem.samples[selectedCaseIdx].input}
                        </pre>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-[#8A7B6A] uppercase mb-1 font-heading">Expected Output</div>
                        <pre className="p-2 bg-[#120D09] rounded border border-[#3A2D22] text-[#16A34A] font-bold whitespace-pre-wrap">
                          {problem.samples[selectedCaseIdx].expectedOutput}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeBottomTab === 'custom' && (
                <div className="h-full flex flex-col">
                  <div className="text-[10px] font-bold text-[#8A7B6A] uppercase mb-1 font-heading">
                    Type Custom Stdin Input:
                  </div>
                  <textarea
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    rows={4}
                    placeholder="Enter custom test input..."
                    className="flex-1 w-full p-2 bg-[#120D09] border border-[#3A2D22] rounded text-[#FFF8ED] focus:outline-none focus:border-[#FF7A1A] font-mono resize-none"
                  />
                </div>
              )}

              {activeBottomTab === 'result' && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 font-heading font-bold text-sm">
                    <span>Verdict:</span>
                    <span
                      className={`px-2 py-0.5 rounded text-xs uppercase tracking-wider ${
                        verdict === 'ACCEPTED' || verdict === 'Accepted'
                          ? 'bg-[#15803D] text-[#DCFCE7]'
                          : verdict === 'RUNNING' || verdict === 'EVALUATING'
                          ? 'bg-[#B45309] text-[#FEF3C7] animate-pulse'
                          : 'bg-[#B91C1C] text-[#FEE2E2]'
                      }`}
                    >
                      {verdict || 'Awaiting execution'}
                    </span>
                    {resultData?.passedSummary && (
                      <span className="text-xs text-[#FFB347]">
                        ({resultData.passedSummary})
                      </span>
                    )}
                  </div>

                  {resultData?.error && (
                    <div className="p-2 bg-[#7F1D1D]/50 border border-[#EF4444] rounded text-xs text-[#FCA5A5] whitespace-pre-wrap font-mono">
                      {resultData.error}
                    </div>
                  )}

                  {resultData?.mode === 'run' && resultData.cases && (
                    <div className="space-y-1.5">
                      {resultData.cases.map((c, i) => (
                        <div key={i} className="flex items-center justify-between p-1.5 bg-[#140E0A] rounded border border-[#3A2D22] text-xs">
                          <span className="font-bold">Case {c.caseNum}:</span>
                          <span className={c.passed ? 'text-[#16A34A] font-bold' : 'text-[#EF4444] font-bold'}>
                            {c.passed ? 'PASSED' : 'FAILED'}
                          </span>
                          <span className="text-[#8A7B6A]">{c.timeMs}ms</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {resultData?.mode === 'test' && resultData.stdout && (
                    <div>
                      <div className="text-[10px] text-[#8A7B6A] uppercase font-bold mb-1">Standard Output:</div>
                      <pre className="p-2 bg-[#120D09] rounded border border-[#3A2D22] text-[#FFF8ED] whitespace-pre-wrap">
                        {resultData.stdout}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* RIGHT COLUMN: Problem Statement & Hall of Valor */}
        <section className="w-[32%] min-w-[340px] max-w-[440px] h-full flex flex-col justify-between gap-1.5 flex-shrink-0">
          
          {/* Problem Statement Card */}
          <div className="flex-1 min-h-0 w-full rounded-lg border-2 border-[#4A3A2C] bg-[#ECE0C8] shadow-solid-ticket p-3.5 overflow-y-auto text-[#1F140C] font-sans">
            <div className="border-b-2 border-[#C9B596] pb-2 mb-2 flex items-center justify-between">
              <div>
                <span className="font-heading text-[10px] uppercase font-bold text-[#8A633F] tracking-widest block">
                  {problem.tier || problem.weapon} • {problem.xp} XP
                </span>
                <h3 className="font-heading text-lg font-extrabold uppercase text-[#2B1B10] leading-tight">
                  {problem.title}
                </h3>
              </div>
              {isSolved && (
                <span className="px-2 py-0.5 rounded bg-[#DCFCE7] border border-[#86EFAC] text-[#15803D] font-heading text-[10px] font-bold uppercase tracking-wider">
                  SOLVED
                </span>
              )}
            </div>

            <div className="space-y-3 text-xs leading-relaxed">
              {/* Lore / Story */}
              {problem.story && (
                <p className="italic text-[#6B5037] border-l-2 border-[#BFA885] pl-2">
                  "{problem.story}"
                </p>
              )}

              {/* Task Statement */}
              <div>
                <h4 className="font-bold text-[12px] uppercase tracking-wider text-[#63482E] mb-0.5 font-heading">
                  TASK
                </h4>
                <p className="font-medium text-[#2B1B10]">{problem.task}</p>
              </div>

              {/* Input Format */}
              <div>
                <h4 className="font-bold text-[12px] uppercase tracking-wider text-[#63482E] mb-0.5 font-heading">
                  INPUT FORMAT
                </h4>
                <pre className="p-2 rounded bg-[#D9C6A5] text-[#1F140C] font-mono text-[12px] whitespace-pre-wrap">
                  {problem.inputFormat}
                </pre>
              </div>

              {/* Output Format */}
              <div>
                <h4 className="font-bold text-[12px] uppercase tracking-wider text-[#63482E] mb-0.5 font-heading">
                  OUTPUT FORMAT
                </h4>
                <pre className="p-2 rounded bg-[#D9C6A5] text-[#1F140C] font-mono text-[12px] whitespace-pre-wrap">
                  {problem.outputFormat}
                </pre>
              </div>

              {/* Constraints */}
              <div>
                <h4 className="font-bold text-[12px] uppercase tracking-wider text-[#63482E] mb-0.5 font-heading">
                  CONSTRAINTS
                </h4>
                <ul className="list-disc list-inside space-y-0.5 text-[12px] font-mono text-[#422C1A]">
                  {(problem.constraints || []).map((c, idx) => (
                    <li key={idx}>{c}</li>
                  ))}
                </ul>
              </div>

              {/* Samples */}
              <div className="space-y-2">
                <h4 className="font-bold text-[12px] uppercase tracking-wider text-[#63482E] font-heading">
                  SAMPLE CASES
                </h4>
                {(problem.samples || []).map((ex, idx) => (
                  <div key={idx} className="p-2 rounded bg-[#D9C6A5] border border-[#BFA885] space-y-1">
                    <div className="font-heading font-bold text-[11px] text-[#47301B]">
                      Sample Case {idx + 1}:
                    </div>
                    <div>
                      <span className="font-bold text-[10px] uppercase text-[#6E4F31]">Input: </span>
                      <pre className="font-mono text-[12px] text-[#1F140C] inline">{ex.input}</pre>
                    </div>
                    <div>
                      <span className="font-bold text-[10px] uppercase text-[#6E4F31]">Output: </span>
                      <pre className="font-mono text-[12px] text-[#15803D] inline font-bold">{ex.expectedOutput}</pre>
                    </div>
                    {ex.explanation && (
                      <div className="text-[11px] italic text-[#5E4228]">
                        Explanation: {ex.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Hall of Valor Compact Board */}
          <div className="h-[140px] 2xl:h-[160px] w-full rounded-lg border-2 border-[#4A3A2C] bg-[#221A14] shadow-solid-ticket p-2 flex flex-col justify-between flex-shrink-0">
            <div className="flex items-center justify-between border-b border-[#3E2F23] pb-1 px-1">
              <div className="flex items-center gap-1 text-[#FFB347]">
                <Trophy className="w-3.5 h-3.5" />
                <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-[#FFF8ED]">
                  HALL OF VALOR
                </h4>
              </div>
              <span className="text-[10px] font-bold text-[#A89078]">Top Warbands</span>
            </div>

            <div className="space-y-0.5 overflow-hidden flex-1 min-h-0 pt-1">
              {sortedTeams.slice(0, 4).map((team) => {
                const isUser = team.id === userTeam?.id;
                return (
                  <div
                    key={team.id}
                    className={`h-[20px] flex items-center justify-between px-2 rounded text-[11px] font-bold ${
                      isUser ? 'user-team-highlight text-[#FFF8ED]' : 'bg-[#18110B] text-[#D8C39F]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="font-heading text-[10px] w-3 text-right">#{team.rank || 1}</span>
                      <span className="truncate">{team.name}</span>
                      {isUser && (
                        <span className="text-[7.5px] bg-[#FF7A1A] text-black px-1 rounded font-heading font-extrabold">
                          YOU
                        </span>
                      )}
                    </div>
                    <span className="font-heading text-[10.5px] text-[#FFB347]">
                      {team.totalDamage ?? team.score ?? 0} XP
                    </span>
                  </div>
                );
              })}

              {userTeamRank > 4 && (
                <div className="h-[20px] flex items-center justify-between px-2 rounded text-[11px] font-bold user-team-highlight text-[#FFF8ED] mt-0.5">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="font-heading text-[10px] w-3 text-right text-[#FF7A1A]">#{userTeamRank}</span>
                    <span className="truncate">{userTeam?.name}</span>
                    <span className="text-[7.5px] bg-[#FF7A1A] text-black px-1 rounded font-heading font-extrabold">YOU</span>
                  </div>
                  <span className="font-heading text-[10.5px] text-[#FFB347]">
                    {userTeam?.totalDamage ?? userTeam?.score ?? 0} XP
                  </span>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
