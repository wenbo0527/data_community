/**
 * DataPermission Page Object(E2E)
 */
import { type Page, expect } from '@playwright/test'

export class DataPermissionPage {
  constructor(private page: Page) {}

  async gotoApply() {
    await this.page.goto('/management/permission/data-permission/apply')
  }

  async gotoAdmin() {
    await this.page.goto('/management/permission/data-permission')
  }

  async expectStepsVisible() {
    await expect(
      this.page.locator('[data-testid="apply-steps"]')
    ).toBeVisible()
  }
}