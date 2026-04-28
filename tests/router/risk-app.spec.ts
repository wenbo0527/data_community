/**
 * risk-app 路由测试
 * 
 * vue-router 4.x 要求所有 route path 必须以 / 开头。
 * tokenizePath 在 createRouter 初始化时校验，不符合会抛出:
 *   Route paths should start with a "/": "xxx" should be "/xxx"
 * 
 * 本测试验证所有路由配置的 path 格式正确，防止运行时错误。
 */
import { describe, it, expect } from 'vitest'

/**
 * 递归验证 routes 数组中所有 path 格式
 */
function validateRoutePaths(routes: any[], parentPath = ''): string[] {
  const errors: string[] = []
  for (const route of routes) {
    if (route.path !== undefined) {
      if (route.path !== '' && !route.path.startsWith('/')) {
        errors.push(
          `path "${route.path}" (parent: "${parentPath}") 必须以 / 开头。` +
          `正确写法: { path: "/${route.path}" }`
        )
      }
    }
    if (route.children) {
      const childBase = route.path === '' ? parentPath : route.path
      errors.push(...validateRoutePaths(route.children, childBase))
    }
  }
  return errors
}

describe('risk-app router path 格式校验', () => {
  // offline-model 和 accompany 导出的是 routes 数组
  it('offline-model 子模块 - 所有 path 以 / 开头', async () => {
    const { default: routes } = await import('../../apps/risk-app/src/modules/offline-model/router/index.ts')
    const errors = validateRoutePaths(routes)
    expect(errors, `offline-model 路由 path 错误:\n${errors.join('\n')}`).toHaveLength(0)
  })

  it('accompany 子模块 - 所有 path 以 / 开头', async () => {
    const { default: routes } = await import('../../apps/risk-app/src/modules/accompany/router/index.ts')
    const errors = validateRoutePaths(routes)
    expect(errors, `accompany 路由 path 错误:\n${errors.join('\n')}`).toHaveLength(0)
  })

  // main router.ts 导出 router 实例（而非 routes 数组），直接 import 会触发 createRouter
  // 其 path 格式由 ESLint 规则静态检查（见 apps/risk-app/.eslintrc.json）
})
