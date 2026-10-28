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

/**
 * Builds the Piston request payload with enforced timeouts:
 * - allowed = timeLimitMs, Java gets timeLimitMs * 2 (JVM startup)
 * - run_timeout = min(allowed, 3000)
 * - compile_timeout = 10000
 * - memory limit fields omitted
 */
export function buildPistonPayload({ language, code, stdin = '', timeLimitMs = 2000 }) {
  const langConfig = LANGUAGE_MAP[language?.toLowerCase()] || LANGUAGE_MAP.python;
  const isJava = langConfig.pistonLang === 'java';
  const baseTimeLimit = Number(timeLimitMs) > 0 ? Number(timeLimitMs) : 2000;
  const allowed = isJava ? baseTimeLimit * 2 : baseTimeLimit;
  const runTimeout = Math.min(allowed, 3000);

  return {
    payload: {
      language: langConfig.pistonLang,
      version: '*',
      files: [{ name: langConfig.fileName, content: code }],
      stdin: stdin || '',
      run_timeout: runTimeout,
      compile_timeout: 10000,
    },
    allowed,
    runTimeout,
  };
}

/**
 * Executes code on Piston using Piston's own run measurements.
 * All Piston requests (/api/run, /api/submit, admin Test runner) must use this helper.
 */
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

  const { payload, allowed, runTimeout } = buildPistonPayload({
    language,
    code,
    stdin,
    timeLimitMs,
  });

  // Generous HTTP timeout for compile (up to 10s) + run (up to 3s) + network tunnel latency
  const httpTimeoutMs = 25000;
  const controller = new AbortController();
  const timeoutTimer = setTimeout(() => controller.abort(), httpTimeoutMs);

  let response;
  try {
    response = await fetch(`${runnerUrl}/api/v2/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify(payload),
    });
  } catch (err) {
    clearTimeout(timeoutTimer);
    if (err.name === 'AbortError') {
      return {
        stdout: '',
        stderr: `Time Limit Exceeded (> ${allowed}ms)`,
        exitCode: 124,
        compileError: null,
        isTimeout: true,
        timeMs: allowed,
      };
    }
    throw new Error(`Runner connection error (${runnerUrl}): ${err.message}`);
  } finally {
    clearTimeout(timeoutTimer);
  }

  // If Piston returns non-2xx (e.g. HTTP 400), surface its message directly
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
      timeMs: 0,
    };
  }

  const runResult = data.run || {};

  // Extract Piston's own run measurement: runResult.wall_time (fall back to cpu_time)
  let rawRunTime = runResult.wall_time ?? runResult.cpu_time ?? 0;
  // If reported in seconds (e.g. 0.045s), convert to integer milliseconds
  let runTimeMs = 0;
  if (typeof rawRunTime === 'number' && rawRunTime > 0) {
    runTimeMs = (rawRunTime < 20 && !Number.isInteger(rawRunTime))
      ? Math.round(rawRunTime * 1000)
      : Math.round(rawRunTime);
  }

  // Mark Time Limit Exceeded only if the signal is SIGKILL or SIGTERM,
  // or run wall_time > allowed + 200 ms
  const isTimeout =
    runResult.signal === 'SIGKILL' ||
    runResult.signal === 'SIGTERM' ||
    (runTimeMs > 0 && runTimeMs > allowed + 200);

  return {
    stdout: runResult.stdout || '',
    stderr: runResult.stderr || '',
    exitCode: runResult.code !== undefined ? runResult.code : 0,
    compileError: null,
    isTimeout,
    timeMs: runTimeMs || (isTimeout ? allowed : 0),
  };
}
