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

  // Fallback to local Piston runner if no URL configured
  if (!cachedRunnerUrl) {
    cachedRunnerUrl = 'http://localhost:2000';
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
 * Executes code on Piston with single retry on 5xx / 429 / connection drop.
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

  runnerUrl = runnerUrl.replace(/\/+$/, '').replace(/\/api\/v2\/execute\/?$/, '');

  const { payload, allowed } = buildPistonPayload({
    language,
    code,
    stdin,
    timeLimitMs,
  });

  const httpTimeoutMs = 25000;

  async function performAttempt() {
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
          timeoutResult: {
            stdout: '',
            stderr: `Time Limit Exceeded (> ${allowed}ms)`,
            exitCode: 124,
            compileError: null,
            isTimeout: true,
            timeMs: allowed,
          },
        };
      }
      throw err;
    } finally {
      clearTimeout(timeoutTimer);
    }

    return { response };
  }

  let attemptResult;
  let lastError;

  // Attempt 1
  try {
    attemptResult = await performAttempt();
  } catch (err) {
    lastError = err;
  }

  // If failed with retryable status or network error, retry once after short backoff
  const isRetryable =
    lastError ||
    (attemptResult?.response &&
      (attemptResult.response.status === 429 ||
        attemptResult.response.status >= 500));

  if (isRetryable) {
    await new Promise((r) => setTimeout(r, 400));
    try {
      attemptResult = await performAttempt();
      lastError = null;
    } catch (retryErr) {
      lastError = retryErr;
    }
  }

  if (lastError) {
    throw new Error(`Runner connection error (${runnerUrl}): ${lastError.message}`);
  }

  if (attemptResult.timeoutResult) {
    return attemptResult.timeoutResult;
  }

  const response = attemptResult.response;

  // Surface Piston error message if not ok
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

  // Check compile phase
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
  let rawRunTime = runResult.wall_time ?? runResult.cpu_time ?? 0;
  let runTimeMs = 0;
  if (typeof rawRunTime === 'number' && rawRunTime > 0) {
    runTimeMs = (rawRunTime < 20 && !Number.isInteger(rawRunTime))
      ? Math.round(rawRunTime * 1000)
      : Math.round(rawRunTime);
  }

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

/**
 * Health check Piston runner by pinging /api/v2/runtimes
 */
export async function checkRunnerHealth(runnerUrlOverride = null) {
  let runnerUrl = runnerUrlOverride || (await getRunnerUrl());
  if (!runnerUrl) return false;
  runnerUrl = runnerUrl.replace(/\/+$/, '').replace(/\/api\/v2\/execute\/?$/, '');

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 6000);

  try {
    const res = await fetch(`${runnerUrl}/api/v2/runtimes`, {
      method: 'GET',
      signal: controller.signal,
    });
    if (res.ok) return true;
  } catch (err) {
    if (runnerUrl !== 'http://localhost:2000') {
      try {
        const localRes = await fetch('http://localhost:2000/api/v2/runtimes', {
          method: 'GET',
          signal: controller.signal,
        });
        if (localRes.ok) {
          cachedRunnerUrl = 'http://localhost:2000';
          return true;
        }
      } catch (_) {}
    }
    return false;
  } finally {
    clearTimeout(timer);
  }
  return false;
}
