import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function injectPortalEnv(html, apiUrl) {
  const envScript = `<script>window.__VITE_API_URL__ = ${JSON.stringify(apiUrl || '')};</script>`;
  if (html.includes('</head>')) {
    return html.replace('</head>', `  ${envScript}\n</head>`);
  }
  return `${envScript}\n${html}`;
}

function servePublicPortalPlugin({ apiUrl = '', useDevProxy = false } = {}) {
  const publicIndexPath = path.resolve(__dirname, 'public/index.html');
  const distIndexPath = path.resolve(__dirname, 'dist/index.html');

  const createPortalMiddleware = (runtimeApiUrl) => (req, res, next) => {
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
        const html = injectPortalEnv(rawHtml, runtimeApiUrl);
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
      // En desarrollo local, si hay proxy de Vite activo, usamos rutas relativas (/api)
      // para evitar bloqueos CORS locales; de lo contrario inyectamos VITE_API_URL.
      const devRuntimeUrl = useDevProxy ? '' : apiUrl;
      server.middlewares.use(createPortalMiddleware(devRuntimeUrl));
    },
    configurePreviewServer(server) {
      server.middlewares.use(createPortalMiddleware(apiUrl));
    },
    closeBundle() {
      if (fs.existsSync(publicIndexPath) && fs.existsSync(path.dirname(distIndexPath))) {
        const rawHtml = fs.readFileSync(publicIndexPath, 'utf-8');
        const html = injectPortalEnv(rawHtml, apiUrl);
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
