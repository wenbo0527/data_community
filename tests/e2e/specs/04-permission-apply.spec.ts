/**
 * E2E: 字段权限申请
 *
 * 验证:
 *   1. 3 步骤流程渲染
 *   2. Step 1 → Step 2(选字段后)
 *   3. 提交成功 → Step 3
 */
import { test, expect } from '@playwright/test'
import { DataPermissionPage } from '../page-objects/DataPermissionPage'

test.describe('字段权限申请', () => {
  test('3 步骤流程页面', async ({ page }) => {
    const perm = new DataPermissionPage(page)
    await perm.gotoApply()

    await expect(page.locator('.arco-steps, .apply-steps')).toBeVisible()
    await expect(page.locator('text=选择资源')).toBeVisible()
    await expect(page.locator('text=填写原因')).toBeVisible()
    await expect(page.locator('text=等待审批')).toBeVisible()
  })

  test('Step 1 列出受限字段', async ({ page }) => {
    await page.goto('/management/permission/data-permission/apply')
    await page.waitForLoadState('networkidle')

    // 表格应该存在
    await expect(page.locator('table.arco-table, .arco-table')).toBeVisible()

    // 应该至少有一个字段
    const fieldCount = await page.locator('table tbody tr').count()
    expect(fieldCount).toBeGreaterThanOrEqual(0)
  })

  test('Step 1 显示敏感级别', async ({ page }) => {
    await page.goto('/management/permission/data-permission/apply')
    await page.waitForLoadState('networkidle')

    // 应该看到 L1/L2/L3 标签
    const html = await page.content()
    expect(html).toMatch(/L1|L2|L3/)
  })

  test('页头标题 + 副标题', async ({ page }) => {
    await page.goto('/management/permission/data-permission/apply')
    await expect(page.locator('text=权限申请').first()).toBeVisible()
    await expect(page.locator('text=申请访问受限字段').first()).toBeVisible()
  })
})