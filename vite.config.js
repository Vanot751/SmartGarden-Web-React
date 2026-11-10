import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DEFAULT_PRODUCTION_API_URL = 'https://smart-garden-api-django.vercel.app';

function injectPortalEnv(html, apiUrl, useDevProxy = false) {
  const envScript = `<script>window.__VITE_API_URL__ = ${JSON.stringify(apiUrl || '')}; window.__USE_DEV_PROXY__ = ${JSON.stringify(Boolean(useDevProxy))};</script>`;
  if (html.includes('</head>')) {
    return html.replace('</head>', `  ${envScript}\n</head>`);
  }
  return `${envScript}\n${html}`;
}

function servePublicPortalPlugin({ apiUrl = '', useDevProxy = false } = {}) {
  const publicIndexPath = path.resolve(__dirname, 'public/index.html');
  const distIndexPath = path.resolve(__dirname, 'dist/index.html');

  const createPortalMiddleware = (runtimeApiUrl, isDevProxy) => (req, res, next) => {
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
        const rawHtml = fs.readFileSync(publicIndexPath, 'utf-8');
        const html = injectPortalEnv(rawHtml, runtimeApiUrl, isDevProxy);
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
      const devRuntimeUrl = useDevProxy ? '' : apiUrl;
      server.middlewares.use(createPortalMiddleware(devRuntimeUrl, useDevProxy));
    },
    configurePreviewServer(server) {
      server.middlewares.use(createPortalMiddleware(apiUrl, false));
    },
    closeBundle() {
      if (fs.existsSync(publicIndexPath) && fs.existsSync(path.dirname(distIndexPath))) {
        const rawHtml = fs.readFileSync(publicIndexPath, 'utf-8');
        const html = injectPortalEnv(rawHtml, apiUrl || DEFAULT_PRODUCTION_API_URL, false);
        fs.writeFileSync(distIndexPath, html, 'utf-8');
      }
    },
  };
}

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiTarget = (env.VITE_API_URL || '').trim().replace(/\/+$/, '').replace(/\/api$/i, '');
  const useDevProxy = command === 'serve' && Boolean(apiTarget);

  const proxyConfig = apiTarget
    ? {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
        },
      }
    : undefined;

  return {
    plugins: [
      servePublicPortalPlugin({ apiUrl: apiTarget, useDevProxy }),
      react(),
    ],
    server: {
      proxy: proxyConfig,
    },
    preview: {
      proxy: proxyConfig,
    },
  };
});
