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

function dashboardPortalPlugin({ apiUrl = '', useDevProxy = false } = {}) {
  const publicDir = path.resolve(__dirname, 'public');
  const publicIndexPath = path.resolve(publicDir, 'index.html');
  const distDir = path.resolve(__dirname, 'dist');

  const serveDashboard = (runtimeApiUrl, isDevProxy) => (req, res, next) => {
    if (!req.url || (req.method !== 'GET' && req.method !== 'HEAD')) {
      return next();
    }

    const pathname = req.url.split('?')[0];
    if (pathname === '/dashboard' || pathname === '/dashboard/') {
      if (fs.existsSync(publicIndexPath)) {
        const rawHtml = fs.readFileSync(publicIndexPath, 'utf-8');
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.end(injectPortalEnv(rawHtml, runtimeApiUrl, isDevProxy));
        return;
      }
    }
    next();
  };

  return {
    name: 'dashboard-portal',
    configureServer(server) {
      server.middlewares.use(serveDashboard(useDevProxy ? '' : apiUrl, useDevProxy));
    },
    configurePreviewServer(server) {
      server.middlewares.use(serveDashboard(apiUrl, false));
    },
    closeBundle() {
      if (!fs.existsSync(publicDir) || !fs.existsSync(distDir)) return;

      fs.cpSync(publicDir, distDir, {
        recursive: true,
        force: true,
        filter(source) {
          return path.resolve(source) !== path.resolve(publicDir, 'index.html');
        },
      });

      if (fs.existsSync(publicIndexPath)) {
        const dashboardDir = path.resolve(distDir, 'dashboard');
        fs.mkdirSync(dashboardDir, { recursive: true });
        const rawHtml = fs.readFileSync(publicIndexPath, 'utf-8');
        fs.writeFileSync(
          path.resolve(dashboardDir, 'index.html'),
          injectPortalEnv(rawHtml, apiUrl || DEFAULT_PRODUCTION_API_URL, false),
          'utf-8',
        );
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
    publicDir: command === 'build' ? false : 'public',
    plugins: [
      dashboardPortalPlugin({ apiUrl: apiTarget, useDevProxy }),
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
