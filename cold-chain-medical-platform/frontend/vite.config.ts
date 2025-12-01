import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/cold-chain-medical/',
  server: {
    port: 3003,
    proxy: {
      '/api': {
        target: 'http://localhost:3023',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
})
