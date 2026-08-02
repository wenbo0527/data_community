/**
 * E2E: 角色切换用户旅程
 *
 * 验证:
 *   1. 角色切换器能切换 10 个角色
 *   2. 切换后自动跳转到该角色的 defaultLanding
 *   3. localStorage 持久化
 */
import { test, expect } from '@playwright/test'
import { ROLE_FIXTURES } from '../fixtures/roles'

test.describe('角色切换', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies()
    await page.goto('/discovery')
    await page.evaluate(() => localStorage.clear())
  })

  for (const role of ROLE_FIXTURES) {
    test(`${role.label} 切换 → 自动跳转`, async ({ page }) => {
      // 打开角色切换器
      await page.locator('[data-testid="role-switcher-trigger"]').click()
      await expect(page.locator('.role-switcher')).toBeVisible()

      // 选择角色
      await page.locator(`[data-testid="role-${role.key}"]`).click()
      await page.waitForLoadState('networkidle')

      // 验证跳转到 defaultLanding
      const url = page.url()
      const expectedPath = role.defaultLanding.split('/').slice(1, 3).join('/')
      expect(url).toContain(expectedPath)
    })
  }

  test('localStorage 持久化', async ({ page }) => {
    // 切换到运营主管
    await page.locator('[data-testid="role-switcher-trigger"]').click()
    await page.locator('[data-testid="role-operation_lead"]').click()
    await page.waitForLoadState('networkidle')

    // 刷新页面
    await page.reload()
    await page.waitForLoadState('networkidle')

    // 应仍然是运营主管
    const url = page.url()
    expect(url).toContain('audience-system')
  })
})