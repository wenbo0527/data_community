import { test } from '@playwright/test'
test.use({ baseURL: 'http://localhost:5177' })

test('debug data-map', async ({ page }) => {
  page.on('console', (msg) => {
    if (msg.type() === 'error' || msg.type() === 'warning')
      console.log(`[console.${msg.type()}]`, msg.text().slice(0, 250))
  })
  page.on('pageerror', (err) => console.log(`[pageerror]`, err.message.slice(0, 350)))
  await page.context().addInitScript(() => {
    localStorage.setItem('user-token', 'mock-test-token')
    localStorage.setItem('userInfo', JSON.stringify({
      id: 'test-user', name: 'Test User', token: 'mock-test-token', roles: ['admin']
    }))
  })
  await page.goto('/discovery/data-map', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(5000)
  console.log('TITLE:', await page.title())
  const body = (await page.locator('body').first().textContent()) || ''
  console.log('BODY (first 200):', body.slice(0, 200))
})