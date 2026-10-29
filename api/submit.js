import { db, admin } from './_lib/firebaseAdmin.js';
import { verifyToken, checkRateLimit } from './_lib/auth.js';
import { executePiston } from './_lib/runner.js';
import { loadPool } from './_lib/pool.js';
import { getPublicState, processAcceptedSubmission } from './_lib/gameState.js';

function normalizeOutput(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.trimEnd())
    .join('\n')
    .trim();
}

// In-flight active submission lock per team
const activeTeamSubmissions = new Set();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // 1. Authenticate team
  const session = verifyToken(req);
  if (!session || !session.teamId) {
    return res.status(401).json({ error: 'Unauthorized: Valid team session token required.' });
  }

  const { teamId, memberName = 'Unknown Member' } = session;
  const normMemberKey = String(memberName || '').trim().replace(/\s+/g, ' ').toLowerCase();

  // 2. Check if contest is paused (never counted as a submit)
  try {
    const state = await getPublicState();
    if (state.dragon?.status === 'paused') {
      return res.status(403).json({ error: 'The battle is currently paused. Please wait for the chieftain to resume.' });
    }
  } catch (err) {
    console.warn('Could not check pause state:', err.message);
  }

  // 3. Single active submission at a time per team on the server
  if (activeTeamSubmissions.has(teamId)) {
    return res.status(429).json({ error: 'A submission is currently being evaluated for your team. Please wait.' });
  }

  // 4. 5 second cooldown per team (never counted as a submit)
  if (!checkRateLimit(`submit-${teamId}`, 5000)) {
    return res.status(429).json({ error: 'Please wait 5 seconds between submissions.' });
  }

  const { language, code, problemId } = req.body || {};

  if (!language || !code || !problemId) {
    return res.status(400).json({ error: 'language, code, and problemId are all required.' });
  }

  // 5. Load problem from memory cache
  const { byId } = await loadPool();
  const problem = byId[problemId];
  if (!problem) {
    return res.status(404).json({ error: 'Unknown problem: ' + problemId });
  }

  // 6. Check that the problem is on the member's active board
  const teamDoc = await db.collection('teams').doc(teamId).get();
  if (!teamDoc.exists) {
    return res.status(404).json({ error: 'Team record not found.' });
  }

  const teamData = teamDoc.data();
  const memberBoard = teamData.members?.[normMemberKey]?.board || teamData.board || {};
  const allBoardIds = [
    ...(memberBoard.dagger || []),
    ...(memberBoard.axe || []),
    ...(memberBoard.catapult || []),
    ...(memberBoard.ballista || []),
  ];

  if (!allBoardIds.includes(problemId)) {
    return res.status(403).json({ error: 'This problem is not on your active battle board.' });
  }

  const solvedList = teamData.solvedProblemIds || [];
  const isAlreadySolved = solvedList.includes(problemId);

  activeTeamSubmissions.add(teamId);

  try {
    // 7. Load private hidden tests from Firestore
    let hiddenTests = [];
    let rawTimeLimit = problem.timeLimitMs || 2000;

    try {
      const privDoc = await db.collection('problems_private').doc(problemId).get();
      if (privDoc.exists) {
        const pData = privDoc.data();
        hiddenTests = pData.hiddenTests || [];
        if (pData.timeLimitMs) rawTimeLimit = pData.timeLimitMs;
      }
    } catch (err) {
      console.error('Failed to load private tests for', problemId, err.message);
    }

    const sampleTests = (problem.samples || []).map((s) => ({
      ...s,
      isHidden: false,
    }));

    const allTests = [...sampleTests, ...hiddenTests];
    const totalCount = allTests.length;
    let passedCount = 0;
    let verdict = 'ACCEPTED';
    let failureDetails = null;

    // 8. Run test cases with concurrency 3, stopping at first failure
    const CONCURRENCY = 3;
    for (let i = 0; i < allTests.length; i += CONCURRENCY) {
      const batch = allTests.slice(i, i + CONCURRENCY);
      const batchPromises = batch.map((tc, batchOffset) => {
        const caseIdx = i + batchOffset;
        return executePiston({
          language,
          code,
          stdin: tc.input || '',
          timeLimitMs: rawTimeLimit,
        })
          .then((runRes) => ({
            caseIdx,
            tc,
            runRes,
            error: null,
          }))
          .catch((err) => ({
            caseIdx,
            tc,
            runRes: null,
            error: err,
          }));
      });

      const batchResults = await Promise.all(batchPromises);

      // Evaluate batch in strict sequential order
      let batchFailed = false;
      for (const resItem of batchResults) {
        const { caseIdx, tc, runRes, error } = resItem;

        if (error) {
          // If runner itself failed (5xx, network error, timeout of runner infra), do not count as submit
          if (error.status && error.status >= 500) {
            throw error;
          }
          verdict = 'RUNTIME_ERROR';
          failureDetails = {
            caseNumber: caseIdx + 1,
            caseName: tc.isHidden ? `Hidden Case #${caseIdx + 1}` : tc.name || `Sample Case #${caseIdx + 1}`,
            error: error.message || 'Execution error',
            isHidden: tc.isHidden,
          };
          batchFailed = true;
          break;
        }

        if (runRes.compileError) {
          verdict = 'COMPILATION_ERROR';
          failureDetails = {
            caseNumber: caseIdx + 1,
            caseName: tc.isHidden ? `Hidden Case #${caseIdx + 1}` : tc.name || `Sample Case #${caseIdx + 1}`,
            compileError: runRes.compileError,
            stderr: runRes.stderr,
            isHidden: tc.isHidden,
          };
          batchFailed = true;
          break;
        }

        if (runRes.isTimeout) {
          verdict = 'TIME_LIMIT_EXCEEDED';
          failureDetails = {
            caseNumber: caseIdx + 1,
            caseName: tc.isHidden ? `Hidden Case #${caseIdx + 1}` : tc.name || `Sample Case #${caseIdx + 1}`,
            timeMs: runRes.timeMs,
            timeLimitMs: rawTimeLimit,
            isHidden: tc.isHidden,
          };
          batchFailed = true;
          break;
        }

        if (runRes.exitCode !== 0) {
          verdict = 'RUNTIME_ERROR';
          failureDetails = {
            caseNumber: caseIdx + 1,
            caseName: tc.isHidden ? `Hidden Case #${caseIdx + 1}` : tc.name || `Sample Case #${caseIdx + 1}`,
            stderr: tc.isHidden ? 'Runtime error occurred during hidden execution.' : (runRes.stderr || 'Runtime error'),
            exitCode: runRes.exitCode,
            isHidden: tc.isHidden,
          };
          batchFailed = true;
          break;
        }

        const actualOut = normalizeOutput(runRes.stdout);
        const expectedOut = normalizeOutput(tc.expectedOutput);

        if (actualOut !== expectedOut) {
          verdict = 'WRONG_ANSWER';
          failureDetails = {
            caseNumber: caseIdx + 1,
            caseName: tc.isHidden ? `Hidden Case #${caseIdx + 1}` : tc.name || `Sample Case #${caseIdx + 1}`,
            input: tc.isHidden ? undefined : tc.input,
            expected: tc.isHidden ? undefined : tc.expectedOutput,
            got: tc.isHidden ? undefined : runRes.stdout,
            isHidden: tc.isHidden,
          };
          batchFailed = true;
          break;
        }

        passedCount++;
      }

      if (batchFailed) {
        break; // Stop evaluation at first failure
      }
    }

    // 9. Format display verdict
    const displayVerdicts = {
      ACCEPTED: 'Accepted',
      WRONG_ANSWER: 'Wrong Answer',
      TIME_LIMIT_EXCEEDED: 'Time Limit Exceeded',
      COMPILATION_ERROR: 'Compilation Error',
      RUNTIME_ERROR: 'Runtime Error',
    };
    const humanVerdict = displayVerdicts[verdict] || verdict;

    // 10. Record submission in submissions collection
    try {
      await db.collection('submissions').add({
        teamId,
        teamName: teamData.name,
        submittingMember: memberName,
        problemId,
        language,
        verdict: humanVerdict,
        passed: passedCount,
        total: totalCount,
        createdAt: new Date().toISOString(),
      });
    } catch (subErr) {
      console.warn('Failed to log submission record:', subErr.message);
    }

    // 11. Counted Submit evaluation & Stats updating
    // A counted submit = a Submit on a problem the team has not yet solved.
    // Re-submitting a solved problem never counts.
    let solveResult = null;

    if (!isAlreadySolved) {
      if (verdict === 'ACCEPTED') {
        // Accepted solve transaction: increments acceptedSolves, totalSubmits, awards XP, replaces boards
        try {
          solveResult = await processAcceptedSubmission({
            teamId,
            memberName,
            problem,
            language,
            code,
          });
        } catch (transErr) {
          console.error('Solve transaction error:', transErr);
        }
      } else {
        // Failed attempt: increment totalSubmits, and increment penalties
        // Check compilationPenalty setting from config/settings (default ON)
        let compilationPenaltyOn = true;
        try {
          const settingsSnap = await db.collection('config').doc('settings').get();
          if (settingsSnap.exists) {
            const sData = settingsSnap.data();
            if (sData.compilationPenalty === false) {
              compilationPenaltyOn = false;
            }
          }
        } catch (err) {
          console.warn('Failed to read config/settings:', err.message);
        }

        const isCompileError = verdict === 'COMPILATION_ERROR';
        const addPenalty = !(isCompileError && !compilationPenaltyOn);

        try {
          const teamRef = db.collection('teams').doc(teamId);
          await teamRef.update({
            totalSubmits: admin.firestore.FieldValue.increment(1),
            ...(addPenalty ? { penalties: admin.firestore.FieldValue.increment(1) } : {}),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        } catch (updateErr) {
          console.warn('Failed to update team penalties/submits:', updateErr.message);
        }
      }
    }

    return res.status(200).json({
      verdict: humanVerdict,
      passed: passedCount,
      total: totalCount,
      passedSummary: `Passed ${passedCount} / ${totalCount}`,
      allPassed: verdict === 'ACCEPTED',
      failureDetails,
      solveResult,
      tier: (problem.tier || 'dagger').toLowerCase(),
    });
  } catch (err) {
    console.error('Submit evaluation error:', err);
    return res.status(500).json({ error: 'Evaluation failed: ' + err.message });
  } finally {
    activeTeamSubmissions.delete(teamId);
  }
}
