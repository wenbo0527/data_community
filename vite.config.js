import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import legacy from '@vitejs/plugin-legacy'
import { resolve } from 'path'
import { logServerPlugin } from './vite-plugins/logServerPlugin.js'
import { viteMockServe } from 'vite-plugin-mock'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern',
        silenceDeprecations: ['legacy-js-api']
      },
      sass: {
        api: 'modern',
        silenceDeprecations: ['legacy-js-api']
      }
    }
  },
  optimizeDeps: {
    exclude: ['arco-design-vue/packages/arco-vue-docs', '@web-vue', 'fsevents']
  },
  build: {
    target: 'es2015',
    rollupOptions: {
      external: ['fsevents'],
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('@antv/x6')) return 'antv-x6'
            if (id.includes('@antv/g2')) return 'antv-g2'
            if (id.includes('@antv')) return 'antv-others'
            if (id.includes('echarts')) return 'echarts'
            if (id.includes('@arco-design/web-vue/es/icon')) return 'arco-icons'
            if (id.includes('@arco-design')) return 'arco'
            if (id.includes('lodash') || id.includes('lodash-es')) return 'lodash'
            if (id.includes('moment') || id.includes('dayjs')) return 'date-lib'
            if (id.includes('vue') || id.includes('vue-router') || id.includes('vuex') || id.includes('pinia')) return 'vue-core'
            return 'vendor'
          }
        }
      }
    },
    chunkSizeWarningLimit: 2000
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    // 让 Vite 自动选择 HMR 客户端端口与主机，避免端口变更后 ping 失败
    watch: {
      // 排除可能导致无限重载的文件
      ignored: [
        '**/node_modules/**',
        '**/dist/**',
        '**/.git/**',
        '**/docs/key-project-docs/技术方案/实时控制台日志.log',
        '**/test-*.html'
      ]
    },
    proxy: {
      '/api/crowds': {
        target: 'http://localhost:5173',
        bypass: (req, res) => {
          if (process.env.NODE_ENV === 'development' && req.method === 'GET') {
            // 移除调试日志语句
            const mockData = [
              {
                id: 'dev_' + Date.now(),
                name: '动态生成用户',
                count: Math.floor(Math.random() * 5000),
                updateTime: new Date().toISOString(),
                _isMock: true
              },
              {
                id: 'dev_1',
                name: '开发环境用户',
                count: 2000,
                updateTime: new Date().toISOString()
              },
              { 
                id: 1, 
                name: '高净值客户', 
                count: 1500,
                updateTime: new Date().toISOString()
              },
              { 
                id: 2, 
                name: '新注册用户',
                count: 4500,
                updateTime: new Date().toISOString()
              }
            ];

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(mockData));
             return;
          }
        }
      },
      // 移除 /api/alert 的 bypass 代理，由 src/mock/alert.js 接管
    }
  },
  plugins: [
    vue(),
    legacy({
      targets: ['chrome >= 49']
    }),
    viteMockServe({
      localEnabled: true,
      prodEnabled: false,
      mockPath: 'src/mock'
    }),
    logServerPlugin()
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
}));
