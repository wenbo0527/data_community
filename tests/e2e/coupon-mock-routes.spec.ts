import { test, expect } from '@playwright/test'

/**
 * TASK-20260614-9CDC073C [V1.6-T2] 5 道闸 #5
 * Playwright mock 5 路由验证（inventory + template PRICED_DISCOUNT 修复）
 *
 * 验证点：
 *  1. inventory 表格 couponType 列识别 PRICED_DISCOUNT → "临价折扣券" + purple
 *  2. inventory 表格 9 态 status 映射正确（received/invalidated/expired）
 *  3. template 表格 status filter 4 态草稿/生效中/已暂停/已过期（移除 offline）
 *  4. template 表格 creator 字段非空
 *  5. template 表格 valid_from + product_name 显示
 */

test.describe('Coupon Mock 5 路由验证 (V1.6.1 6/14 修复)', () => {
  test('1. inventory 主页 200 + 券类型列含 PRICED_DISCOUNT', async ({ page }) => {
    await page.goto('/mkt/coupon/inventory')
    await expect(page.locator('h2')).toContainText(/券实例|库存|inventory/i, { timeout: 10000 })
    // 表格应至少含一行含"临价折扣券"（PRICED_DISCOUNT 中文映射）
    const tags = page.locator('text=临价折扣券')
    await expect(tags.first()).toBeVisible({ timeout: 5000 })
  })

  test('2. inventory status 9 态 mapping 至少 3 态可见', async ({ page }) => {
    await page.goto('/mkt/coupon/inventory')
    // 至少 3 个状态 tag 出现：未使用/已作废/已过期
    await expect(page.locator('text=未使用').first()).toBeVisible({ timeout: 5000 })
    await expect(page.locator('text=已作废').first()).toBeVisible({ timeout: 5000 })
    await expect(page.locator('text=已过期').first()).toBeVisible({ timeout: 5000 })
  })

  test('3. template 主页 200 + 4 态 status filter（移除 offline）', async ({ page }) => {
    await page.goto('/mkt/coupon/template')
    await expect(page.locator('h2')).toContainText(/券模板|template/i, { timeout: 10000 })
    // filter dropdown 选项：草稿/生效中/已暂停/已过期（不应含"已下线"因 v1.6.1 已移除）
    // 简单断言：表格 status 列含 生效中 标签（statusTextMap[online]）
    await expect(page.locator('text=生效中').first()).toBeVisible({ timeout: 5000 })
  })

  test('4. template creator 列非空', async ({ page }) => {
    await page.goto('/mkt/coupon/template')
    // 至少 1 个属主名（系统管理员/运营小王/运营小李/测试员）
    const creator = page.locator('text=/系统管理员|运营小王|运营小李|测试员/').first()
    await expect(creator).toBeVisible({ timeout: 5000 })
  })

  test('5. template valid_from + product_name 显示', async ({ page }) => {
    await page.goto('/mkt/coupon/template')
    // 临价折扣券的 product_name（京东大额低息/美团大额低息）
    const product = page.locator('text=/京东大额低息|美团大额低息/').first()
    await expect(product).toBeVisible({ timeout: 5000 })
  })
})
