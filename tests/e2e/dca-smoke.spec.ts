import { test } from '@playwright/test'
test.use({ baseURL: 'http://localhost:5185' })

test('debug asset-tags final2', async ({ page }) => {
  let n = 0
  page.on('pageerror', (err) => { n++; if (n < 3) console.log(`[pageerror ${n}]`, err.message.slice(0, 200)) })
  await page.context().addInitScript(() => {
    localStorage.setItem('user-token', 'mock-test-token')
    localStorage.setItem('userInfo', JSON.stringify({
      id: 'test-user', name: 'Test User', token: 'mock-test-token', roles: ['admin']
    }))
  })
  await page.goto('/dca/management/asset-management/asset-tags', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(3000)
  const body = (await page.locator('body').first().textContent()) || ''
  console.log('asset-tags LEN:', body.length, 'HAS 标签:', body.includes('标签'), 'pageerrors:', n)
})