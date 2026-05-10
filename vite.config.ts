import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      injectRegister: false,
      manifest: false,
      registerType: 'autoUpdate',
      scope: '/m/',
      filename: 'mobile-sw.js',
      workbox: {
        skipWaiting: true,
        clientsClaim: true,
        globPatterns: ['**/*.{js,css,html,svg,png,webmanifest}'],
        navigateFallback: '/m/index.html',
        navigateFallbackAllowlist: [/^\/m(?:\/.*)?$/],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/api/'),
            handler: 'NetworkOnly',
            method: 'GET',
          },
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/socket.io/'),
            handler: 'NetworkOnly',
            method: 'GET',
          },
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/assets/'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'home-mobile-static-assets',
              expiration: {
                maxEntries: 80,
                maxAgeSeconds: 30 * 24 * 60 * 60,
              },
            },
          },
        ],
      },
    }),
    {
      name: 'mobile-entry-redirect',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const [pathname, query = ''] = req.url?.split('?') ?? [];
          if (pathname === '/m') {
            res.statusCode = 302;
            res.setHeader('Location', query ? `/m/?${query}` : '/m/');
            res.end();
            return;
          }

          const isMobileSpaRoute =
            (req.method === 'GET' || req.method === 'HEAD') &&
            pathname?.startsWith('/m/') &&
            pathname !== '/m/' &&
            !path.posix.extname(pathname);

          if (isMobileSpaRoute) {
            req.url = query ? `/m/?${query}` : '/m/';
          }

          next();
        });
      },
    },
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3001,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        ws: true,
      },
    },
  },
  build: {
    rollupOptions: {
      input: {
        admin: path.resolve(__dirname, 'index.html'),
        mobile: path.resolve(__dirname, 'm/index.html'),
      },
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-utils': ['axios', 'dayjs'],
        },
      },
    },
  },
});
