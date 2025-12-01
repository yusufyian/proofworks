import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/food-traceability/',
  server: {
    port: 3002,
    proxy: {
      '/api': {
        target: 'http://localhost:3022',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
})

