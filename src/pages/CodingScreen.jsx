import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { useGame } from '../context/GameContext';
import { PROBLEMS_BY_ID } from '../data/problems';
import { runCode, compareOutputs } from '../services/judge';
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
} from 'lucide-react';

export default function CodingScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const problem = PROBLEMS_BY_ID[id] || PROBLEMS_BY_ID['two-sum'];

  const {
    hp,
    maxHp,
    dragonName,
    isDefeated,
    winnerTeam,
    sortedTeams,
    userTeam,
    userTeamRank,
    soundMuted,
    setSoundMuted,
    solvedProblems,
    recordAcceptedSubmission,
    saveUserCode,
    getUserCode,
  } = useGame();

  // State
  const [language, setLanguage] = useState('python'); // 'c', 'cpp', 'java', 'python'
  const [code, setCode] = useState(() =>
    getUserCode(problem.id, 'python', problem.starterCode?.python || '')
  );
  const [fontSize, setFontSize] = useState(15);
  const [activeBottomTab, setActiveBottomTab] = useState('testcase'); // 'testcase', 'custom', 'result'
  const [selectedCaseIdx, setSelectedCaseIdx] = useState(0);
  const [customInput, setCustomInput] = useState(problem.samples[0]?.input || '');

  // Execution state
  const [isRunning, setIsRunning] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [verdict, setVerdict] = useState(null); // 'ACCEPTED', 'WRONG_ANSWER', 'RUNTIME_ERROR', 'TIME_LIMIT_EXCEEDED', 'COMPILATION_ERROR'
  const [resultData, setResultData] = useState(null);
  const [acceptedBanner, setAcceptedBanner] = useState(false);

  // Synchronize code when problem or language changes
  useEffect(() => {
    const starter = problem.starterCode?.[language] || '';
    setCode(getUserCode(problem.id, language, starter));
    setCustomInput(problem.samples[0]?.input || '');
    setVerdict(null);
    setResultData(null);
  }, [problem.id, language, getUserCode]);

  // Handle code change and persist
  const handleEditorChange = (newVal) => {
    setCode(newVal || '');
    saveUserCode(problem.id, language, newVal || '');
  };

  // Reset code to starter template
  const handleResetCode = () => {
    const starter = problem.starterCode?.[language] || '';
    setCode(starter);
    saveUserCode(problem.id, language, starter);
  };

  // Cooldown timer
  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const interval = setInterval(() => {
      setCooldownSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldownSeconds]);

  const startCooldown = () => setCooldownSeconds(5);

  // Monaco theme registration
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
        'editor.lineHighlightBackground': '#2A231D',
        'editor.selectionBackground': '#4A3A2A',
        'editorCursor.foreground': '#FFB347',
        'editorWhitespace.foreground': '#382b20',
      },
    });
  };

  // =========================================================================
  // RUN (Sample Cases)
  // =========================================================================
  const handleRun = async () => {
    if (isRunning || cooldownSeconds > 0) return;
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
      const res = await runCode({ language, code, stdin: tc.input });

      if (res.compileError) {
        fatalError = { type: 'COMPILATION_ERROR', message: res.compileError };
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
        timeMs: res.timeMs,
      });
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
  // TEST (Custom Input)
  // =========================================================================
  const handleTest = async () => {
    if (isRunning || cooldownSeconds > 0) return;
    setIsRunning(true);
    startCooldown();
    setActiveBottomTab('result');
    setVerdict('RUNNING');

    const res = await runCode({ language, code, stdin: customInput });
    setIsRunning(false);

    if (res.compileError) {
      setVerdict('COMPILATION_ERROR');
      setResultData({ mode: 'test', error: res.compileError, timeMs: res.timeMs });
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
  };

  // =========================================================================
  // SUBMIT (All Cases: Sample + Hidden)
  // =========================================================================
  const handleSubmit = async () => {
    if (isRunning || cooldownSeconds > 0) return;
    setIsRunning(true);
    startCooldown();
    setActiveBottomTab('result');
    setVerdict('EVALUATING');
    setResultData({ mode: 'submit', passedCount: 0, totalCount: 0 });

    const allCases = [...problem.samples, ...problem.hidden];
    const totalCount = allCases.length;
    let passedCount = 0;
    let failingCase = null;
    let fatalError = null;

    for (let i = 0; i < allCases.length; i++) {
      const tc = allCases[i];
      const res = await runCode({ language, code, stdin: tc.input });

      if (res.compileError) {
        fatalError = { type: 'COMPILATION_ERROR', message: res.compileError };
        break;
      }
      if (res.exitCode !== 0 && res.stderr) {
        fatalError = { type: 'RUNTIME_ERROR', message: res.stderr, caseNum: i + 1 };
        break;
      }

      const passed = compareOutputs(res.stdout, tc.expectedOutput);
      if (passed) {
        passedCount++;
        setResultData({ mode: 'submit', passedCount, totalCount });
      } else {
        failingCase = {
          caseNum: i + 1,
          isHidden: tc.isHidden,
          input: tc.isHidden ? '[Hidden Test Case Data]' : tc.input,
          expected: tc.isHidden ? '[Hidden Output]' : tc.expectedOutput,
          actual: tc.isHidden ? '[Wrong Output]' : res.stdout,
          timeMs: res.timeMs,
        };
        break;
      }
    }

    setIsRunning(false);

    if (fatalError) {
      setVerdict(fatalError.type);
      setResultData({ mode: 'submit', error: fatalError.message, passedCount, totalCount });
    } else if (passedCount === totalCount) {
      setVerdict('ACCEPTED');
      setResultData({ mode: 'submit', passedCount, totalCount });

      // Record first-time solve and damage the dragon!
      const isFirstSolve = recordAcceptedSubmission(problem.id);
      if (isFirstSolve) {
        setAcceptedBanner(true);
        setTimeout(() => setAcceptedBanner(false), 5000);
      }
    } else {
      setVerdict('WRONG_ANSWER');
      setResultData({ mode: 'submit', passedCount, totalCount, failingCase });
    }
  };

  const isSolved = solvedProblems.includes(problem.id);

  return (
    <div
      className="h-screen max-h-screen w-screen overflow-hidden relative select-none flex flex-col justify-between font-sans bg-cover bg-center"
      style={{
        backgroundImage: "url('/field.png'), linear-gradient(to bottom, #1c152b 0%, #4a2835 30%, #a85834 50%, #4a5c2d 65%, #1e2e14 100%)",
      }}
    >
      {/* 55% dark overlay + 6px blur so editor stays easy to read */}
      <div className="absolute inset-0 bg-black/55 backdrop-blur-[6px] pointer-events-none z-0" />

      {/* ===================================================================== */}
      {/* 1. TOP BAR (Full Width, Thin) */}
      {/* ===================================================================== */}
      <header className="relative z-30 w-full px-3 py-1.5 bg-[#140E0A]/95 border-b-2 border-[#4A3A2C] flex items-center justify-between shadow-solid-ticket flex-shrink-0">
        {/* Left: Back to Arena Button */}
        <button
          onClick={() => navigate('/')}
          className="compact-iron-btn px-2.5 py-1 flex items-center gap-1.5 font-heading text-[12px] 2xl:text-[13px] font-bold text-[#FFF8ED] sword-cursor"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#FFB347]" />
          <span>ARENA</span>
        </button>

        {/* Center: Dragon HP Bar */}
        <div className="w-[420px] 2xl:w-[520px]">
          <HPBar
            currentHp={hp}
            maxHp={maxHp}
            dragonName={dragonName}
            isDefeated={isDefeated}
          />
        </div>

        {/* Right Corner: Event Text + Mute Toggle */}
        <div className="flex items-center gap-2">
          <div className="text-right hidden sm:block">
            <span className="font-heading text-[11px] 2xl:text-[12px] font-bold text-[#FFB347] block leading-none">
              TECHFLIX
            </span>
            <span className="text-[10px] 2xl:text-[11px] font-bold text-[#D8C39F] leading-none">
              How to Train Your Dragon
            </span>
          </div>

          <button
            onClick={() => setSoundMuted(!soundMuted)}
            className="compact-iron-btn p-1.5 sword-cursor"
            title={soundMuted ? "Sound Muted" : "Sound Enabled"}
          >
            {soundMuted ? (
              <VolumeX className="w-3.5 h-3.5 text-[#8F745B]" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 text-[#FFB347]" />
            )}
          </button>
        </div>
      </header>

      {/* Accepted First-Time Solve Flash Banner */}
      {acceptedBanner && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-50 px-6 py-2 bg-[#14532D] border-2 border-[#4ADE80] rounded-lg shadow-solid-board flex items-center gap-2 animate-bounce">
          <Sparkles className="w-5 h-5 text-[#4ADE80]" />
          <span className="font-heading text-[14px] 2xl:text-[16px] font-bold text-[#FFF]">
            ACCEPTED! -{problem.xp} HP DEALT TO THE RED DEATH!
          </span>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MAIN CODING INTERFACE (58% Left Editor, 42% Right Problem/Leaderboard) */}
      {/* ===================================================================== */}
      <main className="flex-1 min-h-0 w-full flex items-stretch p-2 2xl:p-3 gap-2.5 2xl:gap-3.5">
        
        {/* =================================================================== */}
        {/* LEFT COLUMN (~58% Width): Coding Toolbar + Monaco Editor + Test Panel */}
        {/* =================================================================== */}
        <section className="w-[58%] h-full flex flex-col justify-between rounded-lg border-2 border-[#4A3A2C] bg-[#181410] shadow-solid-panel overflow-hidden relative">
          
          {/* Toolbar Above Editor */}
          <div className="h-10 px-2.5 bg-[#221A14] border-b-2 border-[#4A3A2C] flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              {/* Language Dropdown */}
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-[#140E0A] text-[#FFF8ED] text-xs font-bold font-sans px-2 py-1 rounded border border-[#5A4A3C] sword-cursor outline-none"
              >
                <option value="python">Python 3</option>
                <option value="cpp">C++ (g++)</option>
                <option value="c">C (gcc)</option>
                <option value="java">Java (Main.java)</option>
              </select>

              {/* Font Size - / + */}
              <div className="flex items-center gap-1 bg-[#140E0A] px-1.5 py-0.5 rounded border border-[#5A4A3C] text-[11px] font-bold text-[#D8C39F]">
                <button
                  onClick={() => setFontSize((f) => Math.max(12, f - 1))}
                  className="px-1 hover:text-white"
                  title="Decrease Font Size"
                >
                  -
                </button>
                <span>{fontSize}px</span>
                <button
                  onClick={() => setFontSize((f) => Math.min(22, f + 1))}
                  className="px-1 hover:text-white"
                  title="Increase Font Size"
                >
                  +
                </button>
              </div>

              {/* Reset Code Button */}
              <button
                onClick={handleResetCode}
                className="compact-iron-btn px-2 py-1 flex items-center gap-1 text-[11px] font-bold text-[#D8C39F] sword-cursor"
                title="Reset to starter code"
              >
                <RotateCcw className="w-3 h-3 text-[#A89078]" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            </div>

            {/* Action Buttons: Run, Test, Submit */}
            <div className="flex items-center gap-2">
              {/* Run Sample Cases */}
              <button
                onClick={handleRun}
                disabled={isRunning || cooldownSeconds > 0}
                className="compact-iron-btn px-2.5 py-1 flex items-center gap-1 font-heading text-[11px] 2xl:text-[12px] font-bold text-[#FFF8ED] disabled:opacity-40 sword-cursor"
              >
                <Play className="w-3 h-3 text-[#81C784]" />
                <span>RUN</span>
              </button>

              {/* Test Custom Input */}
              <button
                onClick={handleTest}
                disabled={isRunning || cooldownSeconds > 0}
                className="compact-iron-btn px-2.5 py-1 flex items-center gap-1 font-heading text-[11px] 2xl:text-[12px] font-bold text-[#FFF8ED] disabled:opacity-40 sword-cursor"
              >
                <FlaskConical className="w-3 h-3 text-[#64B5F6]" />
                <span>TEST</span>
              </button>

              {/* Submit Button (Big Orange Ticket Button) */}
              <button
                onClick={handleSubmit}
                disabled={isRunning || cooldownSeconds > 0}
                className="compact-ticket-btn px-3 py-1 flex items-center gap-1.5 font-heading text-[11.5px] 2xl:text-[13px] font-bold text-[#14100D] disabled:opacity-40 sword-cursor"
              >
                <div className="ticket-notch-left" />
                <div className="ticket-notch-right" />
                <Send className="w-3 h-3" />
                <span>
                  {cooldownSeconds > 0 ? `WAIT ${cooldownSeconds}s` : 'SUBMIT'}
                </span>
              </button>
            </div>
          </div>

          {/* Monaco Editor Container */}
          <div className="flex-1 min-h-0 w-full relative">
            <Editor
              height="100%"
              language={
                language === 'python'
                  ? 'python'
                  : language === 'cpp'
                  ? 'cpp'
                  : language === 'c'
                  ? 'c'
                  : 'java'
              }
              value={code}
              theme="vikingTheme"
              beforeMount={handleEditorWillMount}
              onChange={handleEditorChange}
              options={{
                fontSize: fontSize,
                fontFamily: '"JetBrains Mono", monospace',
                lineHeight: 1.6,
                fontLigatures: false,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                bracketPairColorization: { enabled: true },
                autoIndent: 'full',
                tabSize: 4,
                padding: { top: 8, bottom: 8 },
              }}
            />
          </div>

          {/* ================================================================= */}
          {/* BOTTOM TEST PANEL (~30% Height): Testcase, Custom Input, Result */}
          {/* ================================================================= */}
          <div className="h-[28%] min-h-[140px] max-h-[220px] bg-[#140E0A] border-t-2 border-[#4A3A2C] flex flex-col justify-between flex-shrink-0">
            {/* Tab Header Row */}
            <div className="flex items-center justify-between px-2 pt-1 border-b border-[#332214] bg-[#1C150F]">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setActiveBottomTab('testcase')}
                  className={`px-2.5 py-1 text-[11px] font-heading font-bold rounded-t transition-all sword-cursor ${
                    activeBottomTab === 'testcase'
                      ? 'bg-[#140E0A] text-[#FFB347] border-t-2 border-x border-[#4A3A2C]'
                      : 'text-[#8F745B] hover:text-[#FFF8ED]'
                  }`}
                >
                  TESTCASE
                </button>
                <button
                  onClick={() => setActiveBottomTab('custom')}
                  className={`px-2.5 py-1 text-[11px] font-heading font-bold rounded-t transition-all sword-cursor ${
                    activeBottomTab === 'custom'
                      ? 'bg-[#140E0A] text-[#FFB347] border-t-2 border-x border-[#4A3A2C]'
                      : 'text-[#8F745B] hover:text-[#FFF8ED]'
                  }`}
                >
                  CUSTOM INPUT
                </button>
                <button
                  onClick={() => setActiveBottomTab('result')}
                  className={`px-2.5 py-1 text-[11px] font-heading font-bold rounded-t transition-all sword-cursor flex items-center gap-1 ${
                    activeBottomTab === 'result'
                      ? 'bg-[#140E0A] text-[#FFB347] border-t-2 border-x border-[#4A3A2C]'
                      : 'text-[#8F745B] hover:text-[#FFF8ED]'
                  }`}
                >
                  <span>RESULT</span>
                  {verdict === 'ACCEPTED' && <CheckCircle2 className="w-3 h-3 text-[#4CAF50]" />}
                  {verdict === 'WRONG_ANSWER' && <XCircle className="w-3 h-3 text-[#EF4444]" />}
                </button>
              </div>

              {cooldownSeconds > 0 && (
                <span className="text-[10px] text-[#A89078] font-bold flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Cooldown: {cooldownSeconds}s
                </span>
              )}
            </div>

            {/* Tab Contents */}
            <div className="flex-1 min-h-0 p-2 overflow-y-auto font-sans">
              {/* 1. TESTCASE TAB */}
              {activeBottomTab === 'testcase' && (
                <div className="h-full flex flex-col justify-between gap-1.5 text-xs">
                  {/* Case 1 / Case 2 Buttons */}
                  <div className="flex items-center gap-1.5">
                    {problem.samples.map((c, idx) => (
                      <button
                        key={c.id}
                        onClick={() => setSelectedCaseIdx(idx)}
                        className={`px-2 py-0.5 rounded text-[11px] font-bold font-heading sword-cursor ${
                          selectedCaseIdx === idx
                            ? 'bg-[#332214] text-[#FFB347] border border-[#FF7A1A]'
                            : 'bg-[#1E1611] text-[#A89078] border border-[#3E2C1F]'
                        }`}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>

                  {/* Input / Expected Output for Selected Case */}
                  <div className="grid grid-cols-2 gap-2 flex-1 min-h-0 text-[11px]">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-[#A89078] uppercase mb-0.5">Input</span>
                      <pre className="flex-1 p-1.5 rounded bg-[#1C1611] border border-[#3A2A1E] font-mono text-[#FFF8ED] overflow-auto select-text">
                        {problem.samples[selectedCaseIdx]?.input}
                      </pre>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-[#A89078] uppercase mb-0.5">Expected Output</span>
                      <pre className="flex-1 p-1.5 rounded bg-[#1C1611] border border-[#3A2A1E] font-mono text-[#9CCB7E] overflow-auto select-text">
                        {problem.samples[selectedCaseIdx]?.expectedOutput}
                      </pre>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. CUSTOM INPUT TAB */}
              {activeBottomTab === 'custom' && (
                <div className="h-full flex flex-col">
                  <span className="text-[10px] font-bold text-[#A89078] uppercase mb-1">
                    Custom Stdin Input (passed to code when clicking "Test")
                  </span>
                  <textarea
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    placeholder="Enter custom input here..."
                    className="flex-1 w-full p-1.5 rounded bg-[#1C1611] border border-[#3A2A1E] font-mono text-xs text-[#FFF8ED] resize-none outline-none focus:border-[#FF7A1A]"
                  />
                </div>
              )}

              {/* 3. RESULT TAB */}
              {activeBottomTab === 'result' && (
                <div className="h-full text-xs flex flex-col justify-between">
                  {/* Verdict Badge */}
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      {verdict === 'RUNNING' || verdict === 'EVALUATING' ? (
                        <div className="flex items-center gap-1 text-[#FFB347] font-bold font-heading">
                          <Flame className="w-4 h-4 animate-spin" />
                          <span>{verdict}...</span>
                        </div>
                      ) : verdict === 'ACCEPTED' ? (
                        <span className="font-heading font-bold text-[#4ADE80] text-sm flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> ACCEPTED
                        </span>
                      ) : verdict === 'WRONG_ANSWER' ? (
                        <span className="font-heading font-bold text-[#EF4444] text-sm flex items-center gap-1">
                          <XCircle className="w-4 h-4" /> WRONG ANSWER
                        </span>
                      ) : verdict === 'COMPILATION_ERROR' ? (
                        <span className="font-heading font-bold text-[#EF4444] text-sm flex items-center gap-1">
                          <AlertTriangle className="w-4 h-4" /> COMPILATION ERROR
                        </span>
                      ) : verdict === 'RUNTIME_ERROR' ? (
                        <span className="font-heading font-bold text-[#F97316] text-sm flex items-center gap-1">
                          <AlertTriangle className="w-4 h-4" /> RUNTIME ERROR
                        </span>
                      ) : verdict === 'FINISHED' ? (
                        <span className="font-heading font-bold text-[#81C784] text-sm">
                          EXECUTION FINISHED
                        </span>
                      ) : (
                        <span className="text-[#A89078]">Run or Submit to see verdict.</span>
                      )}
                    </div>

                    {resultData?.mode === 'submit' && (
                      <span className="font-heading text-xs font-bold text-[#FFB347]">
                        Passed {resultData.passedCount} / {resultData.totalCount} test cases
                      </span>
                    )}
                  </div>

                  {/* Body Content of Result */}
                  <div className="flex-1 min-h-0 overflow-y-auto">
                    {resultData?.error && (
                      <pre className="p-2 rounded bg-[#331111] border border-[#7F1D1D] font-mono text-[11px] text-[#FCA5A5] whitespace-pre-wrap select-text">
                        {resultData.error}
                      </pre>
                    )}

                    {resultData?.mode === 'test' && !resultData.error && (
                      <div className="space-y-1">
                        <div className="text-[10px] text-[#A89078] font-bold">Standard Output:</div>
                        <pre className="p-1.5 rounded bg-[#1C1611] border border-[#3A2A1E] font-mono text-xs text-[#FFF8ED] select-text">
                          {resultData.stdout || '(no output)'}
                        </pre>
                        {resultData.timeMs !== undefined && (
                          <div className="text-[10px] text-[#8F745B]">Runtime: {resultData.timeMs}ms</div>
                        )}
                      </div>
                    )}

                    {resultData?.mode === 'run' && resultData.cases && (
                      <div className="space-y-1.5">
                        {resultData.cases.map((c) => (
                          <div
                            key={c.caseNum}
                            className={`p-1.5 rounded border text-[11px] ${
                              c.passed
                                ? 'bg-[#142A1B] border-[#166534] text-[#86EFAC]'
                                : 'bg-[#2A1414] border-[#7F1D1D] text-[#FCA5A5]'
                            }`}
                          >
                            <div className="font-heading font-bold flex items-center justify-between mb-0.5">
                              <span>Case {c.caseNum}: {c.passed ? 'PASSED' : 'FAILED'}</span>
                              <span className="text-[10px] text-[#A89078]">{c.timeMs}ms</span>
                            </div>
                            {!c.passed && (
                              <div className="grid grid-cols-2 gap-1 font-mono text-[10.5px] mt-1">
                                <div>Your: {c.actual}</div>
                                <div>Expected: {c.expected}</div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {resultData?.mode === 'submit' && resultData.failingCase && (
                      <div className="p-2 rounded bg-[#2A1414] border border-[#7F1D1D] text-[11px] space-y-1">
                        <div className="font-heading font-bold text-[#EF4444]">
                          First failing test case: #{resultData.failingCase.caseNum}
                        </div>
                        <div className="grid grid-cols-2 gap-1 font-mono text-[11px]">
                          <div>Your Output: <span className="text-white">{resultData.failingCase.actual}</span></div>
                          <div>Expected: <span className="text-[#86EFAC]">{resultData.failingCase.expected}</span></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* =================================================================== */}
        {/* RIGHT COLUMN (~42% Width): Problem Statement + Compact Leaderboard  */}
        {/* =================================================================== */}
        <section className="w-[42%] h-full flex flex-col justify-between gap-2.5 2xl:gap-3 flex-shrink-0 relative">
          
          {/* Two Ropes Hanging From Above Top Edge into Problem Panel */}
          <div className="absolute -top-12 left-10 z-0 pointer-events-none flex flex-col items-center">
            <RopeSegment height="48px" width={11} />
            <div className="-mt-2">
              <RopeKnot size="sm" />
            </div>
          </div>
          <div className="absolute -top-12 right-10 z-0 pointer-events-none flex flex-col items-center">
            <RopeSegment height="48px" width={11} />
            <div className="-mt-2">
              <RopeKnot size="sm" />
            </div>
          </div>

          {/* 1. PROBLEM STATEMENT (Warm Tan #E8D8BC Panel, Inter Font 16px) */}
          <div className="flex-1 min-h-0 w-full relative z-10 flex flex-col rounded-lg border-[3px] border-[#3E2D1E] bg-[#E8D8BC] text-[#2B1B10] shadow-solid-board overflow-hidden font-inter">
            {/* Drilled rope holes at top */}
            <div className="drilled-hole absolute top-2 left-9 pointer-events-none z-20" />
            <div className="drilled-hole absolute top-2 right-9 pointer-events-none z-20" />

            {/* Header: Title + Difficulty Tag + Solved Pill */}
            <div className="p-3 2xl:p-4 border-b-2 border-[#C9B390] bg-[#DECCA8] flex items-center justify-between px-14 flex-shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-heading text-[18px] 2xl:text-[22px] font-bold text-[#2B1B10] leading-none">
                    {problem.title}
                  </h2>
                  <span
                    className="font-heading text-[10px] 2xl:text-[11px] px-2 py-0.5 rounded text-[#FFF] uppercase tracking-wider font-bold"
                    style={{
                      backgroundColor:
                        problem.difficulty === 'Easy'
                          ? '#16A34A'
                          : problem.difficulty === 'Medium'
                          ? '#2563EB'
                          : problem.difficulty === 'Hard'
                          ? '#EA580C'
                          : '#DC2626',
                    }}
                  >
                    {problem.difficulty} · {problem.xp} XP
                  </span>
                </div>
              </div>

              {isSolved && (
                <div className="flex items-center gap-1 bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC] px-2 py-0.5 rounded font-heading text-[10px] font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />
                  <span>SOLVED</span>
                </div>
              )}
            </div>

            {/* Scrollable Problem Body */}
            <div className="flex-1 min-h-0 p-3 2xl:p-4 overflow-y-auto space-y-3 text-[14px] 2xl:text-[16px] leading-[1.6] select-text">
              {/* Viking Lore Story */}
              <div className="italic text-[#523A25] font-medium border-l-2 border-[#947754] pl-2.5">
                "{problem.story}"
              </div>

              {/* Task Statement */}
              <div>
                <h4 className="font-bold text-[13px] 2xl:text-[14px] uppercase tracking-wider text-[#63482E] mb-1 font-heading">
                  TASK
                </h4>
                <p className="font-medium text-[#2B1B10]">{problem.task}</p>
              </div>

              {/* Input Format */}
              <div>
                <h4 className="font-bold text-[13px] 2xl:text-[14px] uppercase tracking-wider text-[#63482E] mb-1 font-heading">
                  INPUT FORMAT
                </h4>
                <pre className="p-2 rounded bg-[#D9C6A5] text-[#1F140C] font-mono text-[13px] 2xl:text-[14px] whitespace-pre-wrap">
                  {problem.inputFormat}
                </pre>
              </div>

              {/* Output Format */}
              <div>
                <h4 className="font-bold text-[13px] 2xl:text-[14px] uppercase tracking-wider text-[#63482E] mb-1 font-heading">
                  OUTPUT FORMAT
                </h4>
                <pre className="p-2 rounded bg-[#D9C6A5] text-[#1F140C] font-mono text-[13px] 2xl:text-[14px] whitespace-pre-wrap">
                  {problem.outputFormat}
                </pre>
              </div>

              {/* Constraints */}
              <div>
                <h4 className="font-bold text-[13px] 2xl:text-[14px] uppercase tracking-wider text-[#63482E] mb-1 font-heading">
                  CONSTRAINTS
                </h4>
                <ul className="list-disc list-inside space-y-0.5 text-[13px] 2xl:text-[14px] font-mono text-[#422C1A]">
                  {problem.constraints.map((c, idx) => (
                    <li key={idx}>{c}</li>
                  ))}
                </ul>
              </div>

              {/* 2 Worked Examples */}
              <div className="space-y-2">
                <h4 className="font-bold text-[13px] 2xl:text-[14px] uppercase tracking-wider text-[#63482E] font-heading">
                  EXAMPLES
                </h4>
                {problem.samples.map((ex, idx) => (
                  <div key={ex.id} className="p-2.5 rounded bg-[#D9C6A5] border border-[#BFA885] space-y-1">
                    <div className="font-heading font-bold text-[12px] text-[#47301B]">
                      Example {idx + 1}:
                    </div>
                    <div>
                      <span className="font-bold text-[11px] uppercase text-[#6E4F31]">Input: </span>
                      <pre className="font-mono text-[13px] text-[#1F140C] inline">{ex.input}</pre>
                    </div>
                    <div>
                      <span className="font-bold text-[11px] uppercase text-[#6E4F31]">Output: </span>
                      <pre className="font-mono text-[13px] text-[#15803D] inline font-bold">{ex.expectedOutput}</pre>
                    </div>
                    {ex.explanation && (
                      <div className="text-[12px] italic text-[#5E4228]">
                        Explanation: {ex.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 2. COMPACT LEADERBOARD (Top 5 Teams + User Team Highlight) */}
          <div className="h-[150px] 2xl:h-[180px] w-full rounded-lg border-2 border-[#4A3A2C] bg-[#221A14] shadow-solid-ticket p-2 flex flex-col justify-between flex-shrink-0">
            <div className="flex items-center justify-between border-b border-[#3E2F23] pb-1 px-1">
              <div className="flex items-center gap-1 text-[#FFB347]">
                <Trophy className="w-3.5 h-3.5" />
                <h4 className="font-heading text-[12px] 2xl:text-[14px] font-bold uppercase tracking-wider text-[#FFF8ED]">
                  HALL OF VALOR
                </h4>
              </div>
              <span className="text-[10px] font-bold text-[#A89078]">Top 5 Warbands</span>
            </div>

            <div className="space-y-0.5 overflow-hidden flex-1 min-h-0 pt-1">
              {sortedTeams.slice(0, 5).map((team, idx) => {
                const isUser = team.id === userTeam.id;
                return (
                  <div
                    key={team.id}
                    className={`h-[20px] 2xl:h-[22px] flex items-center justify-between px-2 rounded text-[11px] 2xl:text-[12px] font-bold ${
                      isUser
                        ? 'user-team-highlight text-[#FFF8ED]'
                        : 'bg-[#18110B] text-[#D8C39F]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="font-heading text-[10px] w-3 text-right">#{idx + 1}</span>
                      <span className="truncate">{team.name}</span>
                      {isUser && (
                        <span className="text-[7.5px] bg-[#FF7A1A] text-black px-1 rounded font-heading font-extrabold">
                          YOU
                        </span>
                      )}
                    </div>
                    <span className="font-heading text-[10.5px] text-[#FFB347]">{team.score} XP</span>
                  </div>
                );
              })}

              {/* Show user team if outside top 5 */}
              {userTeamRank > 5 && (
                <div className="h-[20px] 2xl:h-[22px] flex items-center justify-between px-2 rounded text-[11px] 2xl:text-[12px] font-bold user-team-highlight text-[#FFF8ED] mt-0.5">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="font-heading text-[10px] w-3 text-right text-[#FF7A1A]">#{userTeamRank}</span>
                    <span className="truncate">{userTeam.name}</span>
                    <span className="text-[7.5px] bg-[#FF7A1A] text-black px-1 rounded font-heading font-extrabold">YOU</span>
                  </div>
                  <span className="font-heading text-[10.5px] text-[#FFB347]">{userTeam.score} XP</span>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

