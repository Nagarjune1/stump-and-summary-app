
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: '/stump-and-summary-app/',
  server: {
    host: "::",
    port: 8080,
    watch: {
      // Reduce the number of files being watched
      ignored: ['**/node_modules/**', '**/dist/**', '**/.git/**', '**/coverage/**'],
      // Use polling instead of native file watching to reduce file descriptor usage
      usePolling: false,
      // Reduce file watcher depth
      depth: 3,
    },
    hmr: {
      // Limit HMR connections
      overlay: true,
    }
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
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
    // Optimize build performance
    chunkSizeWarningLimit: 1000,
  },
  // Optimize dependency scanning and fix Supabase module issues
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
