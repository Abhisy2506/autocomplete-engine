import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  // Point to root directory where .env actually lives
  const rootEnvDir = path.resolve(__dirname, '../../');
  const env = loadEnv(mode, rootEnvDir, '');

  return {
    plugins: [react()],
    envDir: rootEnvDir,
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: `http://localhost:${env.PORT || 8000}`,
          changeOrigin: true,
        },
      },
    },
  };
});