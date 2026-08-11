import { test } from '@playwright/test'
test.use({ baseURL: 'http://localhost:5177' })

test('debug full', async ({ page }) => {
  page.on('console', (msg) => console.log(`[console.${msg.type()}]`, msg.text().slice(0, 200)))
  page.on('pageerror', (err) => console.log(`[pageerror]`, err.message.slice(0, 300)))
  await page.context().addInitScript(() => {
    localStorage.setItem('user-token', 'mock-test-token')
    localStorage.setItem('userInfo', JSON.stringify({
      id: 'test-user', name: 'Test User', token: 'mock-test-token', roles: ['admin']
    }))
  })
  await page.goto('/discovery/favorites', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(5000)
  console.log('TITLE:', await page.title())
})