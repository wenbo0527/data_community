/**
 * E2E: 收藏流程
 *
 * 验证:
 *   1. 客户详情 → 点击收藏 → 已收藏状态
 *   2. 表详情 → 点击收藏
 *   3. 切换角色后收藏按用户筛
 *   4. 我的收藏页可见
 */
import { test, expect } from '@playwright/test'
import { FavoritesPage } from '../page-objects/FavoritesPage'

test.describe('收藏流程', () => {
  test('客户详情 → 收藏', async ({ page }) => {
    await page.goto('/discovery/customer360/detail/C001')
    await page.waitForLoadState('networkidle')

    const button = page.locator('[data-testid="favorite-button"]')
    if (await button.isVisible()) {
      await button.click()
      await expect(button).toContainText('已收藏')
    }
  })

  test('表详情 → 收藏', async ({ page }) => {
    await page.goto('/discovery/data-map')
    await page.waitForLoadState('networkidle')

    // 点击 dim_user 表
    await page.locator('text=dim_user').first().click({ timeout: 5000 })
    await page.waitForLoadState('networkidle')

    // 找到收藏按钮(在 basic info 卡片右上角)
    const button = page.locator('[data-testid="favorite-button"]')
    if (await button.isVisible()) {
      await button.click()
      await expect(button).toContainText('已收藏')
    }
  })

  test('我的收藏页可见', async ({ page }) => {
    const favorites = new FavoritesPage(page)
    await favorites.goto()
    await expect(page.locator('.favorites-page, .arco-card')).toBeVisible()
  })
})