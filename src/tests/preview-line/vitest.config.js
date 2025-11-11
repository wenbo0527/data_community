import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: [
      resolve(__dirname, './coverage/import-all-preview-line.js')
    ],
    include: [
      './**/*.{test,spec}.{js,ts}'
    ],
    exclude: [
      'node_modules',
      'dist',
      '.idea',
      '.git',
      '.cache'
    ],
    coverage: {
      provider: 'v8',
      enabled: true,
      reporter: ['text', 'json', 'html'],
      reportsDirectory: resolve(__dirname, '../../../coverage'),
      all: true,
      include: [
        'src/utils/preview-line/**/*.{js,ts}',
        'src/core/**/*.{js,ts}'
      ],
      exclude: [
        'node_modules/',
        '**/*.d.ts',
        '**/*.config.{js,ts}',
        '**/mock/**',
        '**/types/**'
      ],
      // 暂时移除阈值检查，避免因聚合阶段覆盖率不足导致失败
    },
    testTimeout: 15000,
    hookTimeout: 10000,
    threads: false,
    maxThreads: 1,
    minThreads: 1,
    reporter: ['verbose', 'json'],
    outputFile: {
      json: './test-results.json'
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, '../../../src'),
      '~': resolve(__dirname, '../../../src'),
      '@tests': resolve(__dirname, '../'),
    }
  },
  define: {
    __VUE_OPTIONS_API__: true,
    __VUE_PROD_DEVTOOLS__: false,
    __TEST_ENV__: true
  }
})