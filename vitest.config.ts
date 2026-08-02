import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

/**
 * Vitest config (unit + component tests for this branch only)
 *
 * include: 仅本分支新增的测试
 * coverage: 仅本分支新增的核心模块(13 个 store + composable)
 */
export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'jsdom',
    include: [
      'src/mock/shared/__tests__/**/*.test.ts',
      'src/types/__tests__/**/*.test.ts',
      'src/composables/__tests__/**/*.test.ts',
      'tests/components/**/*.spec.ts'
    ],
    exclude: [
      'node_modules/**',
      'dist/**',
      '.{idea,git,cache,output,temp}/**'
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary', 'json', 'html'],
      include: [
        // 本分支新增的核心模块
        'src/composables/useSensitiveMasker.ts',
        'src/composables/useGlossary.ts',
        'src/composables/useFieldPermission.ts',
        'src/composables/useCrossNav.ts',
        'src/composables/useColumnLineage.ts',
        'src/composables/useAssetClassification.ts',
        'src/composables/usePersonalizedWorkbench.ts',
        'src/mock/shared/lineage.ts',
        'src/mock/shared/column-lineage.ts',
        'src/mock/shared/lineage-graph.ts',
        'src/mock/shared/comment-store.ts',
        'src/mock/shared/asset-tags.ts',
        'src/mock/shared/favorite-directory.ts',
        'src/mock/shared/search-extras.ts',
        'src/mock/shared/standard-classify-matrix.ts',
        'src/mock/shared/classification-taxonomy.ts',
        'src/types/roles.ts'
      ],
      exclude: [
        '**/*.d.ts',
        '**/*.test.ts',
        '**/*.spec.ts'
      ],
      thresholds: {
        statements: 85,
        branches: 75,
        functions: 65,
        lines: 85
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
})