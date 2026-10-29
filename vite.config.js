import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import url from 'url';

// Vite middleware to execute /api serverless functions during local 'vite' dev
function vercelApiDevPlugin() {
  return {
    name: 'vercel-api-dev',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url || !req.url.startsWith('/api/')) {
          return next();
        }

        const parsedUrl = new URL(req.url, 'http://localhost:3000');
        const pathname = parsedUrl.pathname; // e.g. /api/login

        // Route mapping
        const routePath = pathname.replace(/^\/api\//, '');
        let handlerFile = path.resolve(process.cwd(), 'api', routePath + '.js');
        if (!fs.existsSync(handlerFile) && (routePath.startsWith('admin/') || routePath === 'admin')) {
          handlerFile = path.resolve(process.cwd(), 'api', 'admin.js');
        }

        // Parse query
        req.query = Object.fromEntries(parsedUrl.searchParams.entries());

        // Parse JSON or text body
        let rawBody = '';
        req.on('data', (chunk) => {
          rawBody += chunk;
        });

        req.on('end', async () => {
          if (rawBody) {
            try {
              req.body = JSON.parse(rawBody);
            } catch {
              req.body = rawBody;
            }
          } else {
            req.body = {};
          }

          // Vercel-like helper methods on res
          res.status = function (code) {
            res.statusCode = code;
            return res;
          };

          res.json = function (data) {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(data));
            return res;
          };

          res.send = function (data) {
            res.end(data);
            return res;
          };

          try {
            // Dynamic import with cache busting for fast local iteration
            const moduleUrl = url.pathToFileURL(handlerFile).href + '?t=' + Date.now();
            const handlerModule = await import(moduleUrl);
            if (handlerModule.default) {
              await handlerModule.default(req, res);
            } else {
              res.status(500).json({ error: 'Handler default export not found for ' + pathname });
            }
          } catch (err) {
            console.error('API handler error on ' + pathname + ':', err);
            res.status(500).json({ error: err.message });
          }
        });
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), vercelApiDevPlugin()],
  server: {
    port: 3000,
    host: true,
  },
});
