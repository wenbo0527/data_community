import { test } from '@playwright/test'
test.use({ baseURL: 'http://localhost:5177' })

test('debug alert', async ({ page }) => {
  await page.context().addInitScript(() => {
    localStorage.setItem('user-token', 'mock-test-token')
    localStorage.setItem('userInfo', JSON.stringify({
      id: 'test-user', name: 'Test User', token: 'mock-test-token', roles: ['admin']
    }))
  })
  await page.goto('/marketing/alert', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(3000)
  console.log('TITLE:', await page.title())
  // 看 router 实际匹配的 meta
  const r = await page.evaluate(() => {
    const Router = window.__VUE_ROUTER__ || null
    return { hasRouter: !!Router, title: document.title }
  })
  console.log('R:', JSON.stringify(r))
})