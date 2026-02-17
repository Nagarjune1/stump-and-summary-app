
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: '/stump-and-summary-app/',
  server: {
    host: "::",
    port: 8080,
    watch: {
      ignored: ['**/node_modules/**', '**/dist/**', '**/.git/**', '**/coverage/**'],
      usePolling: false,
      depth: 3,
    },
    hmr: {
      overlay: true,
    }
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'pwa-icons/*.png'],
      manifest: {
        name: 'Wickets - Cricket Scoring App',
        short_name: 'Wickets',
        description: 'Professional cricket scoring and match management platform',
        theme_color: '#1e40af',
        background_color: '#0f172a',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/stump-and-summary-app/',
        start_url: '/stump-and-summary-app/',
        icons: [
          {
            src: 'pwa-icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'pwa-icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24
              }
            }
          }
        ]
      }
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  optimizeDeps: {
    include: [
      'react', 
      'react-dom',
      '@supabase/supabase-js',
      '@supabase/postgrest-js',
      '@supabase/realtime-js',
      '@supabase/gotrue-js'
    ],
    exclude: [],
    esbuildOptions: {
      target: 'es2020'
    }
  },
  define: {
    global: 'globalThis',
  },
}));
