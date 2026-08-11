import { test } from '@playwright/test'
test.use({ baseURL: 'http://localhost:5177' })

test('debug favorites', async ({ page }) => {
  await page.context().addInitScript(() => {
    localStorage.setItem('user-token', 'mock-test-token')
    localStorage.setItem('userInfo', JSON.stringify({
      id: 'test-user', name: 'Test User', token: 'mock-test-token', roles: ['admin']
    }))
  })
  await page.goto('/discovery/favorites', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(5000)
  console.log('TITLE:', await page.title())
  console.log('URL:', page.url())
})