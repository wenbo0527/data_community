import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

/**
 * Vitest 配置(单元测试)
 *
 * 覆盖 src/composables 和 src/mock/shared 两个核心目录
 * jsdom 环境支持 Vue 组件测试
 */
export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: [
        'src/composables/**/*.ts',
        'src/mock/shared/**/*.ts'
      ],
      exclude: [
        'src/mock/shared/index.ts',
        '**/*.d.ts'
      ],
      thresholds: {
        statements: 70,
        branches: 60,
        functions: 70,
        lines: 70
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
})