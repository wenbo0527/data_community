/**
 * 营销画布节点功能测试专用配置
 * 继承项目主配置并添加特定设置
 */

import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  test: {
    // 测试环境配置
    environment: 'jsdom',
    
    // 全局设置
    globals: true,
    
    // 设置文件
    setupFiles: [
        './testSetup.js'
      ],
    
    // 包含的测试文件 - 仅包含当前目录的测试
    include: [
      './**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'
    ],
    
    // 排除的文件
    exclude: [
      'node_modules',
      'dist',
      '.idea',
      '.git',
      '.cache',
      'testRunner.js',
      'package.json',
      'README.md'
    ],
    
    // 覆盖率配置
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      include: [
        '../../../pages/marketing/tasks/components/canvas/**/*.{js,vue}',
        '../../../components/marketing/**/*.{js,vue}'
      ],
      exclude: [
        'node_modules/',
        '**/*.d.ts',
        '**/*.config.{js,ts}',
        '**/mock/**',
        '**/types/**',
        'testRunner.js',
        'nodeTestConfig.js'
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 85,
          lines: 85,
          statements: 85
        }
      }
    },
    
    // 测试超时设置
    testTimeout: 15000,
    hookTimeout: 10000,
    
    // 并发设置
    threads: true,
    maxThreads: 2,
    minThreads: 1,
    
    // 监听模式配置
    watch: {
      ignore: [
        'node_modules/**', 
        'dist/**',
        'coverage/**',
        'test-reports/**'
      ]
    },
    
    // 报告器配置
    reporter: ['verbose', 'json', 'html'],
    outputFile: {
      json: './test-results.json',
      html: './test-report.html'
    },
    
    // 测试序列化
    sequence: {
      shuffle: false,
      concurrent: true
    },
    
    // 重试配置
    retry: 2,
    
    // 日志级别
    logLevel: 'info'
  },
  
  // 解析配置
  resolve: {
    alias: {
      '@': resolve(__dirname, '../../../'),
      '~': resolve(__dirname, '../../../'),
      '@tests': resolve(__dirname, '../../'),
      '@canvas': resolve(__dirname, '../../../pages/marketing/tasks/components/canvas'),
      '@components': resolve(__dirname, '../../../components'),
      '@utils': resolve(__dirname, '../../utils')
    }
  },
  
  // 定义全局变量
  define: {
    __VUE_OPTIONS_API__: true,
    __VUE_PROD_DEVTOOLS__: false,
    __TEST_ENV__: true
  },
  
  // 服务器配置（用于测试时的资源加载）
  server: {
    fs: {
      allow: ['..']
    }
  }
})