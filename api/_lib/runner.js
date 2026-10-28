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

export async function executePiston({
  language,
  code,
  stdin = '',
  timeLimitMs = 2000,
  runnerUrl: runnerUrlOverride = null,
}) {
  let runnerUrl = runnerUrlOverride || (await getRunnerUrl());
  if (!runnerUrl) {
    throw new Error('Piston runner URL is not configured. Please set it in /admin.');
  }

  // Normalize URL in case user pasted with /api/v2/execute or trailing slashes
  runnerUrl = runnerUrl.replace(/\/+$/, '').replace(/\/api\/v2\/execute\/?$/, '');

  const langConfig = LANGUAGE_MAP[language?.toLowerCase()] || LANGUAGE_MAP.python;

  // Enforce run_timeout = min(problem.timeLimitMs, 3000). Keep 2000ms target for normal problems.
  const targetTimeLimit = Number(timeLimitMs) > 0 ? Number(timeLimitMs) : 2000;
  const runTimeout = Math.min(targetTimeLimit, 3000);

  // Maximum HTTP request timeout: compile timeout (up to 10s) + run timeout (up to 3s) + network buffer
  const httpTimeoutMs = (langConfig.pistonLang === 'python' ? runTimeout : runTimeout + 10000) + 3000;
  const controller = new AbortController();
  const timeoutTimer = setTimeout(() => controller.abort(), httpTimeoutMs);

  const startTime = Date.now();
  let response;
  try {
    // Piston POST /api/v2/execute
    // - run_timeout <= 3000
    // - compile_timeout <= 10000
    // - run_memory_limit and compile_memory_limit omitted
    const requestBody = {
      language: langConfig.pistonLang,
      version: '*',
      files: [{ name: langConfig.fileName, content: code }],
      stdin: stdin || '',
      run_timeout: runTimeout,
      compile_timeout: 10000,
    };

    response = await fetch(`${runnerUrl}/api/v2/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify(requestBody),
    });
  } catch (err) {
    clearTimeout(timeoutTimer);
    if (err.name === 'AbortError') {
      return {
        stdout: '',
        stderr: `Time Limit Exceeded (> ${runTimeout}ms)`,
        exitCode: 124,
        compileError: null,
        isTimeout: true,
        timeMs: runTimeout,
      };
    }
    throw new Error(`Runner connection error (${runnerUrl}): ${err.message}`);
  } finally {
    clearTimeout(timeoutTimer);
  }

  const elapsedMs = Date.now() - startTime;

  // If Piston returns non-2xx (especially HTTP 400), extract its exact error message
  if (!response.ok) {
    let errorDetail = `Piston HTTP ${response.status}`;
    try {
      const errJson = await response.json();
      if (errJson && typeof errJson.message === 'string') {
        errorDetail = errJson.message;
      } else if (errJson && typeof errJson.error === 'string') {
        errorDetail = errJson.error;
      } else if (errJson) {
        errorDetail = JSON.stringify(errJson);
      }
    } catch (_) {
      const text = await response.text().catch(() => '');
      if (text) errorDetail = text.trim();
    }
    const err = new Error(errorDetail);
    err.status = response.status;
    err.isPistonError = true;
    throw err;
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
