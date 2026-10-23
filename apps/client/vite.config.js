// apps/client/vite.config.js
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { fileURLToPath } from 'url';

export default defineConfig(({ mode }) => {
  const rootEnvDir = fileURLToPath(new URL('../../', import.meta.url));
  const env = loadEnv(mode, rootEnvDir, '');

  return {
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: [],
        manifest: {
          name: 'VeloCity - High-Performance Global Cities Autocomplete',
          short_name: 'VeloCity',
          description: 'Sub-millisecond global cities autocomplete engine powered by C++ Radix & BK-Trees',
          theme_color: '#0e1117',
          background_color: '#0e1117',
          display: 'standalone',
          icons: [
            {
              src: '/assets/logo.svg',
              sizes: '192x192 512x512',
              type: 'image/svg+xml',
              purpose: 'any maskable'
            }
          ]
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
          navigateFallbackDenylist: [/^\/api\//]
        }
      })
    ],
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