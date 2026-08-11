/**
 * UnifiedWorkbench Page Object(E2E)
 */
import { type Page, expect } from '@playwright/test'

export class UnifiedWorkbenchPage {
  constructor(private page: Page) {}

  // === 导航 ===
  async goto(landing: '/discovery' | '/management' | '/exploration' = '/discovery') {
    await this.page.goto(landing)
  }

  // === 角色切换器(数据驱动) ===
  async switchToRole(roleLabel: string) {
    // 点击角色切换器触发按钮
    await this.page.locator('[data-testid="role-switcher-trigger"]').click()
    // 等待弹层显示
    await this.page.waitForSelector('.role-switcher', { state: 'visible' })
    // 点击目标角色(从弹层查找)
    await this.page.locator('.role-item', { hasText: roleLabel }).click()
    // 等待跳转
    await this.page.waitForLoadState('networkidle')
  }

  // === 验证 ===
  async expectRoleGreeting(roleLabel: string) {
    const greeting = await this.page.locator('[data-testid="hero-greeting"]').textContent()
    expect(greeting).toContain(roleLabel)
  }

  async expectShortcuts(expectedShortcuts: string[]) {
    const cards = await this.page.locator('[data-testid="shortcut-card"]').allTextContents()
    for (const expected of expectedShortcuts) {
      expect(
        cards.some(c => c.includes(expected)),
        `Expected to find shortcut "${expected}" but got: ${JSON.stringify(cards)}`
      ).toBe(true)
    }
  }

  async expectFavoritesVisible(max = 4) {
    const cards = await this.page.locator('[data-testid="favorite-card"]').count()
    expect(cards).toBeLessThanOrEqual(max)
    expect(cards).toBeGreaterThanOrEqual(0)
  }

  async expectGovernanceVisible() {
    await expect(
      this.page.locator('[data-testid="governance-overview"]')
    ).toBeVisible()
  }

  async expectArtifactsVisible() {
    await expect(
      this.page.locator('[data-testid="my-artifacts-panel"]')
    ).toBeVisible()
  }

  async expectConceptsVisible() {
    await expect(
      this.page.locator('[data-testid="business-concepts"]')
    ).toBeVisible()
  }

  // === 操作 ===
  async clickShortcut(name: string) {
    await this.page.locator('[data-testid="shortcut-card"]', { hasText: name }).click()
    await this.page.waitForLoadState('networkidle')
  }

  async getCurrentUrl(): Promise<string> {
    return this.page.url()
  }
}