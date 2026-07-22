import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig(async () => {
  let logPlugin: any = null
  try {
    const mod = await import('../../vite-plugins/logServerPlugin.js')
    logPlugin = (mod as any)?.logServerPlugin?.()
  } catch {
    logPlugin = null
  }

  const plugins = [vue()]
  if (logPlugin) plugins.unshift(logPlugin)

  return {
    plugins,
    server: { host: '0.0.0.0', port: 5185, strictPort: true },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
        // 修正 (R3): 原来 '../../src/mock/shared' 解析到 apps/data_community/src/mock/shared (上层, 错)
        // 实际 dfd-app 自己的 mock 在 apps/dfd-app/src/mock/shared/
        '@shared': path.resolve(__dirname, 'src/mock/shared')
      }
    },
    base: '/dfd/',
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            vue: ['vue', 'vue-router', 'pinia', '@vueuse/core'],
            arco: ['@arco-design/web-vue'],
            api: ['axios', '@app/shared-api'],
          },
        },
      },
      chunkSizeWarning: 600,
    },
  }
})
