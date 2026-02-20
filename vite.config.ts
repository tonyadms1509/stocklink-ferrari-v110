import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// Vite config with source maps enabled for debugging
export default defineConfig(({ mode }) => {
  // Load environment variables based on current mode
  const env = loadEnv(mode, process.cwd(), '');

  return {
    base: './',   // ✅ keep this for Netlify SPA routing
    plugins: [react()],
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      sourcemap: true   // ✅ enable source maps so DevTools maps errors back to .tsx files
    },
    server: {
      port: 3000,
      host: "127.0.0.1" // ✅ local dev server
    },
    preview: {
      port: 3000,
      host: "127.0.0.1" // ✅ preview server after build
    }
  };
});
