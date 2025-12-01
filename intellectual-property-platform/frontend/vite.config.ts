import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/intellectual-property/',
  server: {
    port: 3008,
    proxy: {
      '/api': {
        target: 'http://localhost:3028',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
})

