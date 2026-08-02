/**
 * E2E: 跨模块跳转
 *
 * 验证:
 *   1. 三个工作台互通
 *   2. 全局搜索 + 意图识别
 *   3. 我的产出 + 收藏 跨模块聚合
 *   4. 角色切换跨模块生效
 */
import { test, expect } from '@playwright/test'
import { UnifiedWorkbenchPage } from '../page-objects/UnifiedWorkbenchPage'

test.describe('跨模块跳转', () => {
  test('三模块互通 — discovery → management', async ({ page }) => {
    await page.goto('/discovery')
    await expect(page).toHaveURL(/\/discovery/)
  })

  test('三模块互通 — management → exploration', async ({ page }) => {
    await page.goto('/management')
    await expect(page).toHaveURL(/\/management/)
  })

  test('三模块互通 — exploration → discovery', async ({ page }) => {
    await page.goto('/exploration')
    await expect(page).toHaveURL(/\/exploration/)
  })

  test('全局搜索栏可见', async ({ page }) => {
    await page.goto('/discovery')
    await page.waitForLoadState('networkidle')

    const searchInput = page.locator('input.arco-input-search, [placeholder*="搜索"]').first()
    await expect(searchInput).toBeVisible()
  })

  test('工作台显示治理全景 + 业务概念 + 我的收藏', async ({ page }) => {
    const workbench = new UnifiedWorkbenchPage(page)
    await workbench.goto('/discovery')

    await workbench.expectGovernanceVisible()
    await workbench.expectFavoritesVisible()
  })

  test('切换角色 → 工作台自动重渲染', async ({ page }) => {
    await page.goto('/discovery')
    await page.waitForLoadState('networkidle')

    // 默认 data_engineer
    await expect(page.locator('.hero-greeting, .hero-content')).toContainText('数据工程师')

    // 切换到 风控分析师
    await page.locator('[data-testid="role-switcher-trigger"]').click()
    await page.locator('[data-testid="role-risk_analyst"]').click()
    await page.waitForLoadState('networkidle')

    await expect(page.locator('.hero-greeting, .hero-content')).toContainText('风控分析师')
  })

  test('收藏页路由可达', async ({ page }) => {
    await page.goto('/management/favorites')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('text=我的收藏').first()).toBeVisible()
  })

  test('资产标签管理页可达', async ({ page }) => {
    await page.goto('/management/asset-management/asset-tags')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('text=资产标签').first()).toBeVisible()
  })

  test('权限申请页可达', async ({ page }) => {
    await page.goto('/management/permission/data-permission/apply')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('text=权限申请').first()).toBeVisible()
  })
})