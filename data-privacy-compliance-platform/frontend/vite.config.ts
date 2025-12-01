import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/data-privacy-compliance/',
  server: {
    port: 3005,
    proxy: {
      '/api': {
        target: 'http://localhost:3025',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
});

