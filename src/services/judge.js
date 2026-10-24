// ============================================================================
// JUDGE SERVICE - PISTON RUNNER + LOCAL PYTHON PYODIDE FALLBACK
// ============================================================================

const RUNNER_URL = import.meta.env.VITE_RUNNER_URL || "";

// Normalize output: trim trailing whitespace per line and overall string
export function normalizeOutput(s) {
  if (typeof s !== 'string') return '';
  return s
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.trimEnd())
    .join('\n')
    .trim();
}

export function compareOutputs(actual, expected) {
  return normalizeOutput(actual) === normalizeOutput(expected);
}

// In-browser Python worker manager
let pyodideWorker = null;
let pyodideWorkerPending = null;

function getPyodideWorker() {
  if (pyodideWorker) return pyodideWorker;

  const workerCode = `
    let pyodide = null;
    let pyodideLoading = null;

    async function initPyodide() {
      if (pyodide) return pyodide;
      if (!pyodideLoading) {
        pyodideLoading = (async () => {
          importScripts("https://cdn.jsdelivr.net/pyodide/v0.26.2/full/pyodide.js");
          const py = await loadPyodide();
          return py;
        })();
      }
      pyodide = await pyodideLoading;
      return pyodide;
    }

    self.onmessage = async (e) => {
      const { id, code, stdin } = e.data;
      const startTime = performance.now();
      try {
        const py = await initPyodide();

        // Setup stdin / stdout interception in Python
        py.globals.set("__user_stdin_data__", stdin || "");
        py.runPython(\`
import sys, io
sys.stdin = io.StringIO(__user_stdin_data__)
sys.stdout = io.StringIO()
sys.stderr = io.StringIO()
\`);

        let compileError = null;
        let exitCode = 0;

        try {
          py.runPython(code);
        } catch (err) {
          exitCode = 1;
          const stderrText = String(err);
          self.postMessage({
            id,
            stdout: "",
            stderr: stderrText,
            exitCode: 1,
            timeMs: Math.round(performance.now() - startTime),
            compileError: stderrText.includes("SyntaxError") ? stderrText : null,
          });
          return;
        }

        const stdout = py.runPython("sys.stdout.getvalue()");
        const stderr = py.runPython("sys.stderr.getvalue()");

        self.postMessage({
          id,
          stdout: stdout || "",
          stderr: stderr || "",
          exitCode: 0,
          timeMs: Math.round(performance.now() - startTime),
          compileError: null,
        });
      } catch (fatalErr) {
        self.postMessage({
          id,
          stdout: "",
          stderr: String(fatalErr),
          exitCode: 1,
          timeMs: Math.round(performance.now() - startTime),
          compileError: "Failed to initialize Python runner: " + String(fatalErr),
        });
      }
    };
  `;

  try {
    const blob = new Blob([workerCode], { type: "application/javascript" });
    pyodideWorker = new Worker(URL.createObjectURL(blob));
    return pyodideWorker;
  } catch (err) {
    console.warn("Could not create Pyodide worker:", err);
    return null;
  }
}

// Fallback Python execution using Pyodide Web Worker (with 3-second safety timeout)
function runPythonOffline({ code, stdin }) {
  return new Promise((resolve) => {
    const worker = getPyodideWorker();
    if (!worker) {
      resolve({
        stdout: "",
        stderr: "Offline Python runner unavailable. Set VITE_RUNNER_URL to use Piston API.",
        exitCode: 1,
        timeMs: 0,
        compileError: "Runner not configured - set VITE_RUNNER_URL",
      });
      return;
    }

    const id = Date.now() + Math.random();
    let isDone = false;

    const timeout = setTimeout(() => {
      if (!isDone) {
        isDone = true;
        resolve({
          stdout: "",
          stderr: "Time Limit Exceeded (> 2.5s)",
          exitCode: 124,
          timeMs: 2500,
          compileError: null,
        });
      }
    }, 4500);

    const onMessage = (e) => {
      if (e.data && e.data.id === id) {
        if (!isDone) {
          isDone = true;
          clearTimeout(timeout);
          worker.removeEventListener("message", onMessage);
          resolve(e.data);
        }
      }
    };

    worker.addEventListener("message", onMessage);
    worker.postMessage({ id, code, stdin });
  });
}

/**
 * Main judge execution entry point:
 * runCode({ language, code, stdin }) -> { stdout, stderr, exitCode, timeMs, compileError }
 */
export async function runCode({ language, code, stdin }) {
  const normLang = (language || "").toLowerCase().trim();

  // 1. If VITE_RUNNER_URL is specified, use Piston API
  if (RUNNER_URL) {
    try {
      const endpoint = `${RUNNER_URL.replace(/\/+$/, "")}/api/v2/execute`;

      let pistonLang = "python3";
      let fileName = "main.py";

      if (normLang === "c") {
        pistonLang = "c";
        fileName = "main.c";
      } else if (normLang === "cpp" || normLang === "c++") {
        pistonLang = "c++";
        fileName = "main.cpp";
      } else if (normLang === "java") {
        pistonLang = "java";
        fileName = "Main.java";
      } else {
        pistonLang = "python3";
        fileName = "main.py";
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const startTime = performance.now();
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          language: pistonLang,
          version: "*",
          files: [{ name: fileName, content: code }],
          stdin: stdin || "",
          run_timeout: 2000,
          run_memory_limit: 256 * 1024 * 1024,
        }),
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Runner returned HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const timeMs = Math.round(performance.now() - startTime);

      // Check compile phase
      if (data.compile && data.compile.code !== 0) {
        return {
          stdout: "",
          stderr: data.compile.stderr || data.compile.output || "",
          exitCode: data.compile.code || 1,
          timeMs,
          compileError: data.compile.output || data.compile.stderr || "Compilation failed",
        };
      }

      const run = data.run || {};
      const stdout = run.stdout || run.output || "";
      const stderr = run.stderr || "";
      const exitCode = run.code !== undefined ? run.code : 0;

      return {
        stdout,
        stderr,
        exitCode,
        timeMs,
        compileError: null,
      };
    } catch (err) {
      console.warn("Piston runner error, falling back:", err);
      // Fall through to fallback
    }
  }

  // 2. Fallback when VITE_RUNNER_URL is not set or unreachable
  if (normLang === "python" || normLang === "py" || normLang === "python3") {
    return await runPythonOffline({ code, stdin });
  }

  // Non-Python languages without configured remote runner
  return {
    stdout: "",
    stderr: `Runner not configured - set VITE_RUNNER_URL to compile and execute ${language.toUpperCase()}.`,
    exitCode: 1,
    timeMs: 0,
    compileError: `Runner not configured - set VITE_RUNNER_URL (e.g. https://emkc.org/api/v2/piston) to run ${language.toUpperCase()}.`,
  };
}
