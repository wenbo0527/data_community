/**
 * Customer360 Page Object(E2E)
 */
import { type Page, expect } from '@playwright/test'

export class Customer360Page {
  constructor(private page: Page) {}

  async goto(userId = 'C001') {
    await this.page.goto(`/discovery/customer360/detail/${userId}`)
  }

  // === 字段可见性 ===
  async expectVisibleFields(fields: string[]) {
    const list = await this.page.locator(
      '[data-testid="field-permission-card"] .field-tag'
    ).allTextContents()
    for (const f of fields) {
      expect(list.some(t => t.includes(f)), `Field "${f}" should be visible`).toBe(true)
    }
  }

  async expectHiddenField(field: string) {
    const list = await this.page.locator(
      '[data-testid="field-permission-card"] .field-tag'
    ).allTextContents()
    expect(
      list.some(t => t.includes(field)),
      `Field "${field}" should NOT be visible`
    ).toBe(false)
  }

  // === 收藏 ===
  async favoriteCurrent() {
    await this.page.locator('[data-testid="favorite-button"]').click()
    await expect(
      this.page.locator('[data-testid="favorite-button"]')
    ).toContainText('已收藏')
  }

  async unfavoriteCurrent() {
    await this.page.locator('[data-testid="favorite-button"]').click()
    await expect(
      this.page.locator('[data-testid="favorite-button"]')
    ).toContainText('收藏')
  }
}