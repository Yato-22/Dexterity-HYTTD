import handleStart from './_lib/admin/start.js';
import handlePause from './_lib/admin/pause.js';
import handleReset from './_lib/admin/reset.js';
import handleRunner from './_lib/admin/runner.js';
import handleImportTeams from './_lib/admin/import-teams.js';
import handleExport from './_lib/admin/export.js';

export default async function handler(req, res) {
  // Extract action from query param or from request URL path
  const urlPath = req.url || '';
  const cleanPath = urlPath.split('?')[0];
  const pathParts = cleanPath.split('/').filter(Boolean);
  const actionFromPath = pathParts[pathParts.length - 1];
  const action = req.query?.action || actionFromPath;

  switch (action) {
    case 'start':
      return handleStart(req, res);
    case 'pause':
      return handlePause(req, res);
    case 'reset':
      return handleReset(req, res);
    case 'runner':
      return handleRunner(req, res);
    case 'import-teams':
      return handleImportTeams(req, res);
    case 'export':
      return handleExport(req, res);
    default:
      return res.status(404).json({ error: `Unknown admin action: '${action}'` });
  }
}

