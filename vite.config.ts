import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    base: './',   // ✅ keep this for Netlify
    plugins: [react()],
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      sourcemap: false
    },
    server: {
      port: 3000,
      host: "127.0.0.1"
    },
    preview: {
      port: 3000,
      host: "127.0.0.1"
    }
  };
});

