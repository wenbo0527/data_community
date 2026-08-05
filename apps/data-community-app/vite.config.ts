import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { viteMockServe } from 'vite-plugin-mock'
import path from 'path'

const ROOT = path.resolve(__dirname, '../..')
const DFD = path.resolve(ROOT, 'apps/dfd-app/src')
const MONOREPO = path.resolve(ROOT, 'src')

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
    fs: {
      allow: [
        path.resolve(__dirname),
        path.resolve(ROOT),
        path.resolve(DFD),
        path.resolve(ROOT, 'apps/dfd-app'),
        path.resolve(ROOT, 'apps/data-community-app'),
        path.resolve(ROOT, 'apps/dmt-app'),
        path.resolve(ROOT, 'apps/dex-app'),
        path.resolve(ROOT, 'apps/mkt-app'),
        path.resolve(ROOT, 'apps/touch'),
        path.resolve(ROOT, 'src'),
        path.resolve(ROOT, 'packages'),
      ]
    }
  },
  resolve: {
    // 用数组,长前缀优先
    alias: [
      // 最长前缀(最具体)放最前
      { find: '@/components-dca', replacement: path.resolve(__dirname, 'src/components-dca') },
      { find: '@/types-dca', replacement: path.resolve(__dirname, 'src/types-dca') },
      { find: '@/stores-dca', replacement: path.resolve(__dirname, 'src/stores-dca') },
      { find: '@/utils-dca', replacement: path.resolve(__dirname, 'src/utils-dca') },
      { find: '@/mock-dca', replacement: path.resolve(__dirname, 'src/mock') },
      { find: '@/mock-shared', replacement: path.resolve(__dirname, 'src/mock/shared') },
      { find: '@/composables', replacement: path.resolve(__dirname, 'src/composables') },
      { find: '@/dfd-pages', replacement: path.resolve(DFD, 'pages') },
      { find: '@/shared', replacement: MONOREPO },

      // dfd 子目录(中等长度)
      { find: '@/components', replacement: path.resolve(DFD, 'components') },
      { find: '@/mock', replacement: path.resolve(DFD, 'mock') },
      { find: '@/mock-dca', replacement: path.resolve(__dirname, 'src/mock') },
      { find: '@/api', replacement: path.resolve(DFD, 'api') },
      { find: '@/types', replacement: path.resolve(DFD, 'types') },
      { find: '@/utils', replacement: path.resolve(DFD, 'utils') },
      { find: '@/store', replacement: path.resolve(DFD, 'store') },
      { find: '@/stores', replacement: path.resolve(DFD, 'stores') },
      { find: '@/constants', replacement: path.resolve(DFD, 'constants') },
      { find: '@/composables', replacement: path.resolve(DFD, 'composables') },
      { find: '@/config', replacement: path.resolve(DFD, 'config') },
      { find: '@/styles', replacement: path.resolve(DFD, 'styles') },
      { find: '@/pages', replacement: path.resolve(DFD, 'pages') },
      { find: '@/router', replacement: path.resolve(DFD, 'router') },
      { find: '@/modules', replacement: path.resolve(DFD, 'modules') },

      // 最后才是 @ 本身(最不具体)
      { find: '@', replacement: path.resolve(__dirname, 'src') },
    ]
  },
  optimizeDeps: {
    include: [
      'vue',
      'vue-router',
      'pinia',
      '@arco-design/web-vue',
      'echarts',
      'dayjs',
      'axios',
      'xlsx',
      '@vueuse/core',
      'marked',
      '@antv/x6',
      '@antv/x6-vue-shape',
      'file-saver',
      'mockjs',
      'nanoid',
      'uuid',
    ]
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vue: ['vue', 'vue-router', 'pinia'],
          arco: ['@arco-design/web-vue'],
          echarts: ['echarts'],
          antv: ['@antv/x6', '@antv/x6-vue-shape'],
        }
      }
    },
    chunkSizeWarning: 1500
  },
  base: '/dca/'
})
