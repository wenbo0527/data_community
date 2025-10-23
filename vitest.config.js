import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  test: {
    // 测试环境配置
    environment: 'jsdom',
    
    // 全局设置
    globals: true,
    
    // 设置文件 - 添加新的真实环境设置
    setupFiles: [
      './src/tests/setup.js',
      './src/tests/setup/real-environment.js'
    ],
    
    // 配置真实的浏览器环境
    environmentOptions: {
      jsdom: {
        resources: 'usable',
        runScripts: 'dangerously',
        pretendToBeVisual: true,
        url: 'http://localhost:5173'
      }
    },
    
    // 包含的测试文件
    include: [
      'src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      'src/tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'
    ],
    
    // 排除的文件
    exclude: [
      'node_modules',
      'dist',
      '.idea',
      '.git',
      '.cache'
    ],
    
    // 覆盖率配置 - 优化以支持85%覆盖率要求
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/',
        'src/tests/',
        'src/**/*.test.{js,ts,vue}',
        'src/**/*.spec.{js,ts,vue}',
        '**/*.d.ts',
        '**/*.config.{js,ts}',
        '**/mock/**',
        '**/types/**',
        '**/constants/**',
        '**/utils/index.{js,ts}',
        'src/main.{js,ts}',
        'src/App.vue'
      ],
      include: [
        'src/**/*.{js,ts,vue}',
        'src/pages/marketing/tasks/**/*.{js,ts,vue}'
      ],
      thresholds: {
        global: {
          branches: 85,
          functions: 85,
          lines: 85,
          statements: 85
        },
        // 为营销画布模块设置更高的覆盖率要求
        'src/pages/marketing/tasks/**': {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90
        }
      },
      // 启用所有文件覆盖率报告
      all: true,
      // 跳过完全覆盖的文件
      skipFull: false,
      // 清理之前的覆盖率报告
      clean: true
    },
    
    // 测试超时设置
    testTimeout: 10000,
    hookTimeout: 10000,
    
    // 并发设置
    threads: true,
    maxThreads: 4,
    minThreads: 1,
    
    // 监听模式配置
    watch: {
      ignore: ['node_modules/**', 'dist/**']
    },
    
    // 报告器配置
    reporter: ['verbose', 'json'],
    outputFile: {
      json: './test-results.json'
    }
  },
  
  // 解析配置 - 使用 fileURLToPath 解决 ES 模块环境下的 __dirname 问题
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '~': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  
  // 定义全局变量
  define: {
    __VUE_OPTIONS_API__: true,
    __VUE_PROD_DEVTOOLS__: false
  }
})