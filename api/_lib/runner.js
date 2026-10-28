import { db } from './firebaseAdmin.js';

let cachedRunnerUrl = null;
let lastRunnerUrlFetch = 0;
const CACHE_TTL_MS = 30000; // 30 seconds

export async function getRunnerUrl() {
  const now = Date.now();
  if (cachedRunnerUrl !== null && now - lastRunnerUrlFetch < CACHE_TTL_MS) {
    return cachedRunnerUrl;
  }

  try {
    const doc = await db.collection('config').doc('runner').get();
    if (doc.exists && doc.data()?.url) {
      cachedRunnerUrl = doc.data().url.trim().replace(/\/+$/, '');
    } else {
      cachedRunnerUrl = '';
    }
  } catch (err) {
    console.error('Failed to fetch runner URL from config/runner:', err.message);
    if (!cachedRunnerUrl) cachedRunnerUrl = '';
  }

  lastRunnerUrlFetch = now;
  return cachedRunnerUrl;
}

export function invalidateRunnerUrlCache() {
  cachedRunnerUrl = null;
  lastRunnerUrlFetch = 0;
}

const LANGUAGE_MAP = {
  python: { pistonLang: 'python', fileName: 'main.py' },
  py: { pistonLang: 'python', fileName: 'main.py' },
  c: { pistonLang: 'c', fileName: 'main.c' },
  cpp: { pistonLang: 'c++', fileName: 'main.cpp' },
  'c++': { pistonLang: 'c++', fileName: 'main.cpp' },
  java: { pistonLang: 'java', fileName: 'Main.java' },
};

export async function executePiston({ language, code, stdin = '', timeLimitMs = 2000 }) {
  let runnerUrl = await getRunnerUrl();
  if (!runnerUrl) {
    throw new Error('Piston runner URL is not configured. Please set it in /admin.');
  }

  // Normalize URL in case user pasted with /api/v2/execute or trailing slashes
  runnerUrl = runnerUrl.replace(/\/+$/, '').replace(/\/api\/v2\/execute\/?$/, '');

  const langConfig = LANGUAGE_MAP[language?.toLowerCase()] || LANGUAGE_MAP.python;
  const timeoutMs = Math.max(1000, Math.min(10000, timeLimitMs + 1500));

  const controller = new AbortController();
  const timeoutTimer = setTimeout(() => controller.abort(), timeoutMs + 2000);

  const startTime = Date.now();
  let response;
  try {
    response = await fetch(`${runnerUrl}/api/v2/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        language: langConfig.pistonLang,
        version: '*',
        files: [{ name: langConfig.fileName, content: code }],
        stdin: stdin || '',
        run_timeout: timeoutMs,
      }),
    });
  } catch (err) {
    clearTimeout(timeoutTimer);
    if (err.name === 'AbortError') {
      return {
        stdout: '',
        stderr: 'Time Limit Exceeded (> ' + timeLimitMs + 'ms)',
        exitCode: 124,
        compileError: null,
        isTimeout: true,
        timeMs: timeLimitMs,
      };
    }
    throw new Error(`Runner connection error (${runnerUrl}): ${err.message}`);
  } finally {
    clearTimeout(timeoutTimer);
  }

  const elapsedMs = Date.now() - startTime;

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Piston runner error HTTP ${response.status}: ${errorText}`);
  }

  const data = await response.json();

  // Check compile phase (C/C++/Java)
  if (data.compile && data.compile.code !== 0) {
    return {
      stdout: data.compile.stdout || '',
      stderr: data.compile.stderr || data.compile.output || 'Compilation failed',
      exitCode: data.compile.code || 1,
      compileError: data.compile.stderr || data.compile.output || 'Compilation error',
      isTimeout: false,
      timeMs: elapsedMs,
    };
  }

  const runResult = data.run || {};
  const isTimeout =
    runResult.signal === 'SIGKILL' ||
    runResult.signal === 'SIGTERM' ||
    elapsedMs > timeLimitMs + 500;

  return {
    stdout: runResult.stdout || '',
    stderr: runResult.stderr || '',
    exitCode: runResult.code !== undefined ? runResult.code : 0,
    compileError: null,
    isTimeout,
    timeMs: elapsedMs,
  };
}
