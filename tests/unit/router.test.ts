import { describe, it, expect } from 'vitest'
import { createRouter, createWebHistory } from 'vue-router'
import { routes } from '@/router'

describe('Router Configuration', () => {
  it('should have all required routes', () => {
    const requiredRoutes = [
      '/',
      '/login',
      '/risk',
      '/risk/model-offline-analysis',
      '/risk/model-offline-analysis/feature-center',
      '/risk/model-offline-analysis/model-register',
      '/risk/model-offline-analysis/model-backtrack',
      '/risk/model-offline-analysis/task-management',
      '/risk/model-offline-analysis/model-evaluation'
    ]

    const router = createRouter({
      history: createWebHistory(),
      routes
    })

    requiredRoutes.forEach(path => {
      const route = router.resolve(path)
      expect(route).toBeDefined()
      expect(route.path).toBe(path)
    })
  })

  it('should have correct route metadata', () => {
    const router = createRouter({
      history: createWebHistory(),
      routes
    })

    // 检查模型离线分析路由
    const modelRoute = router.resolve('/risk/model-offline-analysis')
    expect(modelRoute.meta?.title).toBe('模型离线分析')
    expect(modelRoute.meta?.permission).toBe('user')
  })

  it('should handle dynamic routes correctly', () => {
    const router = createRouter({
      history: createWebHistory(),
      routes
    })

    // 测试动态路由参数
    const detailRoute = router.resolve('/risk/model-offline-analysis/feature-center/detail/123')
    expect(detailRoute).toBeDefined()
  })
})