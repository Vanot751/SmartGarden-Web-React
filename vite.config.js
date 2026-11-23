import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function copyPublicAssetsPlugin() {
  return {
    name: 'copy-public-assets',
    closeBundle() {
      const publicDir = path.resolve(__dirname, 'public');
      const distDir = path.resolve(__dirname, 'dist');
      if (!fs.existsSync(publicDir) || !fs.existsSync(distDir)) return;

      fs.cpSync(publicDir, distDir, {
        recursive: true,
        force: true,
        filter(source) {
          return path.resolve(source) !== path.resolve(publicDir, 'index.html');
        },
      });
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
      copyPublicAssetsPlugin(),
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
