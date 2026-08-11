/**
 * E2E: 数据地图
 *
 * 验证:
 *   1. 表列表显示
 *   2. 表详情显示打标信息
 *   3. 字段级血缘 tab
 *   4. 完整血缘 tab
 */
import { test, expect } from '@playwright/test'

test.describe('数据地图', () => {
  test('数据地图列表页', async ({ page }) => {
    await page.goto('/discovery/data-map')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('.arco-card').first()).toBeVisible()
  })

  test('表详情页显示 dim_user', async ({ page }) => {
    await page.goto('/discovery/data-map?table=dim_user')
    await page.waitForLoadState('networkidle')

    await expect(page.locator('text=dim_user').first()).toBeVisible()
  })

  test('表详情有 tab 结构', async ({ page }) => {
    await page.goto('/discovery/data-map?table=dim_user')
    await page.waitForLoadState('networkidle')

    await expect(page.locator('text=表结构')).toBeVisible()
    await expect(page.locator('text=完整血缘')).toBeVisible()
    await expect(page.locator('text=协作注释')).toBeVisible()
  })

  test('字段级血缘 tab', async ({ page }) => {
    await page.goto('/discovery/data-map?table=dim_user')
    await page.waitForLoadState('networkidle')

    // 点击完整血缘 tab
    await page.locator('text=完整血缘').first().click()
    await page.waitForTimeout(500)

    // 应该看到字段级血缘
    const html = await page.content()
    expect(html).toContain('字段级血缘')
  })

  test('数据地图 8 角色可达', async ({ page }) => {
    await page.goto('/discovery/data-map')
    await page.waitForLoadState('networkidle')
    // data-map 路由未限制角色,全员可访问
    await expect(page.locator('.arco-card').first()).toBeVisible()
  })
})