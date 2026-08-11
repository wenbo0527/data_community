/**
 * Favorites Page Object(E2E)
 */
import { type Page, expect } from '@playwright/test'

export class FavoritesPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/management/favorites')
  }

  async expectFavoritesCardVisible() {
    await expect(
      this.page.locator('.favorites-card, .favorite-card')
    ).toBeVisible()
  }

  async expectFavoritesCount(count: number) {
    const cards = await this.page.locator('.favorite-card').count()
    expect(cards).toBeGreaterThanOrEqual(count)
  }
}