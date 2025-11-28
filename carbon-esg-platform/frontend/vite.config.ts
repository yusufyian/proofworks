import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/carbon-esg/',  // 生产环境子目录路径
  server: {
    port: 3007,
    proxy: {
      '/api': {
        target: 'http://localhost:3027',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
})

