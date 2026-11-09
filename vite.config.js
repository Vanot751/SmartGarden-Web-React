import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function servePublicPortalPlugin() {
  const publicIndexPath = path.resolve(__dirname, 'public/index.html');

  const servePortalMiddleware = (req, res, next) => {
    if (!req.url || (req.method !== 'GET' && req.method !== 'HEAD')) {
      return next();
    }

    const pathname = req.url.split('?')[0];
    if (
      pathname === '/' ||
      pathname === '/index.html' ||
      pathname === '/dashboard' ||
      pathname === '/login'
    ) {
      if (fs.existsSync(publicIndexPath)) {
        const html = fs.readFileSync(publicIndexPath, 'utf-8');
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.end(html);
        return;
      }
    }

    next();
  };

  return {
    name: 'serve-public-portal',
    configureServer(server) {
      server.middlewares.use(servePortalMiddleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(servePortalMiddleware);
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiTarget = env.VITE_API_URL || 'http://127.0.0.1:8000';

  return {
    plugins: [servePublicPortalPlugin(), react()],
    server: {
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
        },
      },
    },
  };
});
