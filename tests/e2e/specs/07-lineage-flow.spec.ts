/**
 * E2E: 血缘流程
 *
 * 验证:
 *   1. 表级血缘图渲染
 *   2. 字段级血缘 tab 可见
 *   3. 资源→要素完整链路
 */
import { test, expect } from '@playwright/test'

test.describe('血缘流程', () => {
  test('血缘页可访问', async ({ page }) => {
    await page.goto('/discovery/lineage')
    await page.waitForLoadState('networkidle')
    // 血缘图渲染区
    await expect(page.locator('.arco-card').first()).toBeVisible()
  })

  test('表详情 → 完整血缘 tab', async ({ page }) => {
    await page.goto('/discovery/data-map?table=dim_user')
    await page.waitForLoadState('networkidle')

    await page.locator('text=完整血缘').first().click()
    await page.waitForTimeout(500)

    const html = await page.content()
    // 完整血缘 tab 应展示字段级血缘 + 链路摘要
    expect(html).toContain('字段级血缘')
  })

  test('字段级血缘选择表+字段', async ({ page }) => {
    await page.goto('/discovery/data-map?table=dim_user')
    await page.waitForLoadState('networkidle')

    await page.locator('text=完整血缘').first().click()
    await page.waitForTimeout(500)

    // 表选择器应可见
    await expect(page.locator('.arco-select').first()).toBeVisible()
  })

  test('资源→要素完整链路', async ({ page }) => {
    await page.goto('/discovery/data-map?table=dim_user')
    await page.waitForLoadState('networkidle')

    await page.locator('text=完整血缘').first().click()
    await page.waitForTimeout(500)

    // 应显示完整链路卡片
    const html = await page.content()
    expect(html).toContain('资源 → 要素')
  })

  test('业务域节点显示', async ({ page }) => {
    await page.goto('/discovery/data-map?table=dim_user')
    await page.waitForLoadState('networkidle')
    await page.locator('text=完整血缘').first().click()
    await page.waitForTimeout(500)

    const html = await page.content()
    expect(html).toMatch(/业务域|业务实体|业务要素/)
  })
})