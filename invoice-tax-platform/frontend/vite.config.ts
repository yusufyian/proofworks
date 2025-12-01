import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/invoice-tax/',
  server: {
    port: 3006,
    proxy: {
      '/api': {
        target: 'http://localhost:3026',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
});

