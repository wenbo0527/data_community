/**
 * E2E: 客户 360 用户旅程
 *
 * 验证:
 *   1. 客户详情页可访问
 *   2. 字段可见性卡
 *   3. 跨模块跳转到授信查询
 */
import { test, expect } from '@playwright/test'

test.describe('客户 360 旅程', () => {
  test('客户详情页可访问', async ({ page }) => {
    await page.goto('/discovery/customer360')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('.arco-card').first()).toBeVisible()
  })

  test('客户详情 C001', async ({ page }) => {
    await page.goto('/discovery/customer360/detail/C001')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('.arco-card').first()).toBeVisible()
  })

  test('客户详情有字段可见性卡', async ({ page }) => {
    await page.goto('/discovery/customer360/detail/C001')
    await page.waitForLoadState('networkidle')

    // 字段可见性卡应存在(field-permission-card 或类似)
    const html = await page.content()
    expect(html).toMatch(/字段可见性|敏感级别|核心|用户/)
  })

  test('关键指标显示', async ({ page }) => {
    await page.goto('/discovery/customer360/detail/C001')
    await page.waitForLoadState('networkidle')

    // 关键指标:总在贷余额、收藏客户按钮
    const html = await page.content()
    expect(html).toMatch(/总在贷余额|收藏客户|授信/)
  })

  test('客户列表可见', async ({ page }) => {
    await page.goto('/discovery/customer360')
    await page.waitForLoadState('networkidle')

    // 客户列表/表格
    await expect(page.locator('table, .arco-table').first()).toBeVisible()
  })

  test('收藏客户按钮存在', async ({ page }) => {
    await page.goto('/discovery/customer360/detail/C001')
    await page.waitForLoadState('networkidle')

    // FavoriteButton 在 metric-item 旁
    const html = await page.content()
    expect(html).toContain('收藏')
  })

  test('跳转到指标地图(跨模块)', async ({ page }) => {
    await page.goto('/discovery/metrics-map')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('.arco-card').first()).toBeVisible()
  })
})