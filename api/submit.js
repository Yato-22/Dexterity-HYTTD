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

  const { teamId } = session;

  // Single active submission at a time per team on the server
  if (activeTeamSubmissions.has(teamId)) {
    return res.status(429).json({ error: 'A submission is currently being evaluated for your team. Please wait.' });
  }

  // 5 second cooldown per team
  if (!checkRateLimit(`submit-${teamId}`, 5000)) {
    return res.status(429).json({ error: 'Please wait 5 seconds between submissions.' });
  }

  const { language, code, problemId } = req.body || {};

  if (!language || !code || !problemId) {
    return res.status(400).json({ error: 'language, code, and problemId are all required.' });
  }

  const problem = PROBLEMS_BY_ID[problemId];
  if (!problem) {
    return res.status(404).json({ error: 'Unknown problem: ' + problemId });
  }

  activeTeamSubmissions.add(teamId);

  try {
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

    const sampleTests = (problem.samples || []).map((s) => ({
      ...s,
      isHidden: false,
    }));

    const allTests = [...sampleTests, ...hiddenTests];
    const totalCount = allTests.length;
    let passedCount = 0;
    let verdict = 'ACCEPTED';
    let failureDetails = null;

    // 3. Run test cases with limited concurrency (3 at a time), stop at first failure
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

      let batchFailed = false;
      for (const resItem of batchResults) {
        const { caseIdx, tc, runRes, error } = resItem;

        if (error) {
          verdict = 'RUNTIME_ERROR';
          failureDetails = {
            caseNum: caseIdx + 1,
            message: error.message || 'Execution error',
          };
          batchFailed = true;
          break;
        }

        if (runRes.compileError) {
          verdict = 'COMPILATION_ERROR';
          failureDetails = {
            caseNum: caseIdx + 1,
            message: runRes.compileError,
          };
          batchFailed = true;
          break;
        }

        if (runRes.isTimeout) {
          verdict = 'TIME_LIMIT_EXCEEDED';
          failureDetails = {
            caseNum: caseIdx + 1,
            timeMs: runRes.timeMs,
            message: `Time limit exceeded (> ${rawTimeLimit}ms)`,
          };
          batchFailed = true;
          break;
        }

        if (runRes.exitCode !== 0 && runRes.stderr) {
          verdict = 'RUNTIME_ERROR';
          failureDetails = {
            caseNum: caseIdx + 1,
            message: runRes.stderr,
            exitCode: runRes.exitCode,
          };
          batchFailed = true;
          break;
        }

        const actualNorm = normalizeOutput(runRes.stdout);
        const expectedNorm = normalizeOutput(tc.expectedOutput);

        if (actualNorm === expectedNorm) {
          passedCount++;
        } else {
          verdict = 'WRONG_ANSWER';
          failureDetails = {
            caseNum: caseIdx + 1,
            isHidden: Boolean(tc.isHidden),
            input: tc.isHidden ? '[Hidden Test Case]' : tc.input,
            expected: tc.isHidden ? '[Hidden Output]' : tc.expectedOutput,
            actual: tc.isHidden ? '[Wrong Output]' : runRes.stdout,
            timeMs: runRes.timeMs,
          };
          batchFailed = true;
          break;
        }
      }

      if (batchFailed) {
        break;
      }
    }

    const passedSummary = `Passed ${passedCount} / ${totalCount}`;

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

    // 5. If not fully accepted, return verdict and "Passed X / Y" immediately
    if (verdict !== 'ACCEPTED') {
      return res.status(200).json({
        verdict,
        passedCount,
        totalCount,
        passedSummary,
        message: passedSummary,
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
        passedSummary,
        message: passedSummary,
        xp: problem.xp,
        isFirstSolve: txResult.isFirstSolve,
        damageDealt: txResult.damageDealt,
        dragonStatus: txResult.dragonStatus,
      });
    } catch (txErr) {
      console.error('Transaction failed during submit:', txErr);
      return res.status(200).json({
        verdict: 'ACCEPTED',
        passedCount,
        totalCount,
        passedSummary,
        message: passedSummary,
        xp: problem.xp,
        isFirstSolve: false,
        txError: txErr.message,
      });
    }
  } finally {
    activeTeamSubmissions.delete(teamId);
  }
}
