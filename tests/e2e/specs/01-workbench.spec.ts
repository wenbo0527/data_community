/**
 * E2E: 工作台 — 8 角色 × 6 个核心场景
 *
 * 数据驱动测试:
 *   加载 ROLE_FIXTURES,对每个角色跑同一套验证
 *
 * 验证项:
 *   1. 角色切换 + 自动跳转
 *   2. 快捷作业按角色显示
 *   3. 收藏 Top 4 显示
 *   4. 治理全景 + 业务概念显示
 *   5. 我的产出按用户筛
 */
import { test, expect } from '@playwright/test'
import { UnifiedWorkbenchPage } from '../page-objects/UnifiedWorkbenchPage'
import { ROLE_FIXTURES } from '../fixtures/roles'

test.describe('UnifiedWorkbench — 8 角色 × 工作台', () => {
  for (const role of ROLE_FIXTURES) {
    test(`${role.label} · 工作台 ${role.expectedShortcuts.length} 个快捷作业`, async ({ page }) => {
      const workbench = new UnifiedWorkbenchPage(page)

      // 1. 进入工作台
      await workbench.goto('/discovery')

      // 2. 切换到目标角色
      await workbench.switchToRole(role.label)

      // 3. 验证问候语
      await workbench.expectRoleGreeting(role.label)

      // 4. 验证快捷作业(admin 跳过,只看其他)
      if (role.key !== 'admin') {
        await workbench.expectShortcuts(role.expectedShortcuts)
      }

      // 5. 治理全景(所有角色都可见)
      await workbench.expectGovernanceVisible()

      // 6. 跳转是否到 defaultLanding
      const url = await workbench.getCurrentUrl()
      const expectedPath = role.defaultLanding.split('/').slice(1, 3).join('/')
      expect(url).toContain(expectedPath)
    })
  }
})

test.describe('UnifiedWorkbench — 收藏 + 概念 + 产出', () => {
  test('数据工程师能看到收藏 Top 4 + 我的产出 + 业务概念', async ({ page }) => {
    const workbench = new UnifiedWorkbenchPage(page)

    await workbench.goto('/discovery')
    await workbench.switchToRole('数据工程师')

    // 验证收藏区显示(张三有 4 个收藏)
    await workbench.expectFavoritesVisible(4)

    // 验证业务概念显示
    await workbench.expectConceptsVisible()

    // 验证我的产出面板
    await workbench.expectArtifactsVisible()
  })
})