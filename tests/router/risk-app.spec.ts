/**
 * risk-app 路由测试
 *
 * vue-router 4.x 对 path 格式的要求：
 * - 根级 route path：必须以 / 开头（如 { path: '/external-data' }）
 * - children 内的 route path：应使用相对路径，不以 / 开头（如 { path: 'lifecycle' }）
 *
 * tokenizePath 在 createRouter 初始化时校验，不符合会抛出:
 *   Route paths should start with a "/": "xxx" should be "/xxx"
 *
 * 本测试验证路由配置格式正确，防止运行时错误。
 */
import { describe, it, expect } from 'vitest'

/**
 * 递归验证 routes 数组中所有 path 格式
 *
 * @param routes - 路由数组
 * @param isRootLevel - 当前数组是否在根级 routes 中（不在任何 children 内）
 */
function validateRoutePaths(routes: any[], isRootLevel: boolean): string[] {
  const errors: string[] = []
  for (const route of routes) {
    if (route.path !== undefined) {
      const path = route.path
      if (isRootLevel) {
        // 根级路由 path 必须以 / 开头（空字符串 '' 是索引路由，允许）
        if (path !== '' && !path.startsWith('/')) {
          errors.push(
            `根级 path "${path}" 必须以 / 开头。正确写法: { path: "/${path}" }`
          )
        }
      } else {
        // children 内的 path 应使用相对路径（不以 / 开头）
        if (path.startsWith('/')) {
          errors.push(
            `children 内 path "${path}" 不应以 / 开头（应使用相对路径）。正确写法: { path: "${path.substring(1)}" }`
          )
        }
      }
    }
    if (route.children) {
      // children 数组内的路由不是根级
      errors.push(...validateRoutePaths(route.children, false))
    }
  }
  return errors
}

describe('risk-app router path 格式校验', () => {
  // offline-model 和 accompany 导出的是 routes 数组（顶层，无 children 包裹）
  // 所以 isRootLevel = true，父路由 path 必须以 / 开头，子路由 path 不能有 / 开头

  it('offline-model 子模块 - 根级 path 以 / 开头，children path 使用相对路径', async () => {
    const { default: routes } = await import('../../apps/risk-app/src/modules/offline-model/router/index.ts')
    const errors = validateRoutePaths(routes, true)
    expect(errors, `offline-model 路由 path 错误:\n${errors.join('\n')}`).toHaveLength(0)
  })

  it('accompany 子模块 - 根级 path 以 / 开头，children path 使用相对路径', async () => {
    const { default: routes } = await import('../../apps/risk-app/src/modules/accompany/router/index.ts')
    const errors = validateRoutePaths(routes, true)
    expect(errors, `accompany 路由 path 错误:\n${errors.join('\n')}`).toHaveLength(0)
  })

  // main router.ts 导出 router 实例（而非 routes 数组），直接 import 会触发 createRouter
  // 其 path 格式由 ESLint 规则静态检查（见 apps/risk-app/.eslintrc.json）
})
