import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { logServerPlugin } from './vite-plugins/logServerPlugin.js'
import { viteMockServe } from 'vite-plugin-mock'

// https://vite.dev/config/
export default defineConfig({
  optimizeDeps: {
    exclude: ['arco-design-vue/packages/arco-vue-docs', '@web-vue']
  },
  server: {
    host: '0.0.0.0',
    port: 5174,
    hmr: {
      host: 'localhost',
      // 添加更精确的文件监听配置
      overlay: true
    },
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
        target: 'http://localhost:5174',
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

    }
  },
  plugins: [
    vue(), 
    logServerPlugin(),
    viteMockServe({
      mockPath: 'src/mock',
      enable: true,
    })
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
});
