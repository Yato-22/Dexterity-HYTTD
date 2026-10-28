import { db, admin } from './_lib/firebaseAdmin.js';
import { verifyToken, checkRateLimit } from './_lib/auth.js';
import { executePiston } from './_lib/runner.js';
import { PROBLEMS_BY_ID } from '../src/data/problems.js';

function normalizeOutput(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.trimEnd())
    .join('\n')
    .trim();
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // 1. Authenticate team
  const session = verifyToken(req);
  if (!session || !session.teamId) {
    return res.status(401).json({ error: 'Unauthorized: Valid team session token required.' });
  }

  const { teamId } = session;

  // Rate limiting per team: 1 submission per 2 seconds
  if (!checkRateLimit(`submit-${teamId}`, 2000)) {
    return res.status(429).json({ error: 'Submission rate limit reached. Please wait 2 seconds.' });
  }

  const { language, code, problemId } = req.body || {};

  if (!language || !code || !problemId) {
    return res.status(400).json({ error: 'language, code, and problemId are all required.' });
  }

  const problem = PROBLEMS_BY_ID[problemId];
  if (!problem) {
    return res.status(404).json({ error: 'Unknown problem: ' + problemId });
  }

  // 2. Fetch private hidden tests from Firestore
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

  // Use run_timeout = min(problem.timeLimitMs, 3000). Keep 2s target for normal problems.
  const timeLimitMs = Math.min(Number(rawTimeLimit) || 2000, 3000);

  const sampleTests = (problem.samples || []).map((s) => ({
    ...s,
    isHidden: false,
  }));

  const allTests = [...sampleTests, ...hiddenTests];
  const totalCount = allTests.length;
  let passedCount = 0;
  let verdict = 'ACCEPTED';
  let failureDetails = null;

  // 3. Run all sample and hidden tests sequentially through Piston
  for (let i = 0; i < allTests.length; i++) {
    const tc = allTests[i];

    try {
      const runRes = await executePiston({
        language,
        code,
        stdin: tc.input || '',
        timeLimitMs,
      });

      // Compilation error check
      if (runRes.compileError) {
        verdict = 'COMPILATION_ERROR';
        failureDetails = {
          caseNum: i + 1,
          message: runRes.compileError,
        };
        break;
      }

      // Time limit check
      if (runRes.isTimeout) {
        verdict = 'TIME_LIMIT_EXCEEDED';
        failureDetails = {
          caseNum: i + 1,
          timeMs: runRes.timeMs,
          message: `Time limit exceeded (> ${timeLimitMs}ms)`,
        };
        break;
      }

      // Runtime error check
      if (runRes.exitCode !== 0 && runRes.stderr) {
        verdict = 'RUNTIME_ERROR';
        failureDetails = {
          caseNum: i + 1,
          message: runRes.stderr,
          exitCode: runRes.exitCode,
        };
        break;
      }

      // Compare output
      const actualNorm = normalizeOutput(runRes.stdout);
      const expectedNorm = normalizeOutput(tc.expectedOutput);

      if (actualNorm === expectedNorm) {
        passedCount++;
      } else {
        verdict = 'WRONG_ANSWER';
        failureDetails = {
          caseNum: i + 1,
          isHidden: Boolean(tc.isHidden),
          input: tc.isHidden ? '[Hidden Test Case]' : tc.input,
          expected: tc.isHidden ? '[Hidden Output]' : tc.expectedOutput,
          actual: tc.isHidden ? '[Wrong Output]' : runRes.stdout,
          timeMs: runRes.timeMs,
        };
        break;
      }
    } catch (testErr) {
      console.error('Error executing test case', i, testErr);
      verdict = 'RUNTIME_ERROR';
      failureDetails = {
        caseNum: i + 1,
        message: testErr.message,
      };
      break;
    }
  }

  // 4. Log submission record in submissions collection
  try {
    await db.collection('submissions').add({
      teamId,
      problemId,
      language,
      verdict,
      passedCount,
      totalCount,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  } catch (subErr) {
    console.error('Failed to log submission record:', subErr.message);
  }

  // 5. If not fully accepted, return verdict immediately
  if (verdict !== 'ACCEPTED') {
    return res.status(200).json({
      verdict,
      passedCount,
      totalCount,
      failingCase: failureDetails,
      error: failureDetails?.message,
    });
  }

  // 6. ALL TESTS PASSED: Execute single Firestore transaction
  let isFirstSolve = false;
  let damageDealt = 0;
  let dragonStatusAfter = 'live';

  try {
    const txResult = await db.runTransaction(async (transaction) => {
      const dragonRef = db.collection('dragon').doc('main');
      const teamRef = db.collection('teams').doc(teamId);

      const dragonDoc = await transaction.get(dragonRef);
      const teamDoc = await transaction.get(teamRef);

      if (!dragonDoc.exists) {
        throw new Error('dragon/main document does not exist');
      }
      if (!teamDoc.exists) {
        throw new Error(`teams/${teamId} document does not exist`);
      }

      const dragonData = dragonDoc.data() || {};
      const teamData = teamDoc.data() || {};

      const solvedProblemIds = teamData.solvedProblemIds || [];
      const alreadySolved = solvedProblemIds.includes(problemId);
      const isDragonLive = dragonData.status === 'live';

      if (!alreadySolved && isDragonLive) {
        isFirstSolve = true;
        damageDealt = problem.xp;

        const currentHp = typeof dragonData.hp === 'number' ? dragonData.hp : 100;
        const newHp = Math.max(0, currentHp - damageDealt);

        // Update dragon
        const dragonUpdates = {
          hp: newHp,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        if (newHp === 0 && currentHp > 0) {
          dragonUpdates.status = 'defeated';
          dragonUpdates.winnerTeamId = teamId;
          dragonStatusAfter = 'defeated';
        } else {
          dragonStatusAfter = dragonData.status;
        }

        transaction.update(dragonRef, dragonUpdates);

        // Update team
        transaction.update(teamRef, {
          totalDamage: (teamData.totalDamage || 0) + damageDealt,
          solvedProblemIds: [...solvedProblemIds, problemId],
          lastSolveAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Write feed entry
        const feedRef = db.collection('feed').doc();
        transaction.set(feedRef, {
          teamName: teamData.name || teamId,
          problemId,
          weapon: problem.weapon || 'axe',
          damage: damageDealt,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }

      return {
        isFirstSolve,
        damageDealt,
        dragonStatus: dragonStatusAfter,
      };
    });

    return res.status(200).json({
      verdict: 'ACCEPTED',
      passedCount,
      totalCount,
      xp: problem.xp,
      isFirstSolve: txResult.isFirstSolve,
      damageDealt: txResult.damageDealt,
    });
  } catch (txErr) {
    console.error('Transaction failed during submit:', txErr);
    // Even if transaction failed, the code passed all tests
    return res.status(200).json({
      verdict: 'ACCEPTED',
      passedCount,
      totalCount,
      xp: problem.xp,
      isFirstSolve: false,
      txError: txErr.message,
    });
  }
}

