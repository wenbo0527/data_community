import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { viteMockServe } from 'vite-plugin-mock'
import path from 'path'

export default defineConfig({
  plugins: [
    vue(),
    viteMockServe({
      mockPath: path.resolve(__dirname, 'src/mock'),
      enable: true,
    })
  ],
  server: {
    host: '0.0.0.0',
    port: 5185,
    strictPort: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vue: ['vue', 'vue-router', 'pinia'],
          arco: ['@arco-design/web-vue']
        }
      }
    },
    chunkSizeWarning: 600
  },
  base: '/dca/'
})