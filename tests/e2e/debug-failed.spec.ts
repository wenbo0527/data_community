import { test } from '@playwright/test'
test.use({ baseURL: 'http://localhost:5177' })

const pages = [
  { path: '/discovery/classification', name: 'P1-智能分级分类' },
  { path: '/discovery/asset-detail/dim_user', name: 'P1-资产详情' },
  { path: '/discovery/regulatory-config', name: 'P1-监管报表' }
]

for (const p of pages) {
  test(`debug ${p.name}`, async ({ page }) => {
    await page.context().addInitScript(() => {
      localStorage.setItem('user-token', 'mock-test-token')
      localStorage.setItem('userInfo', JSON.stringify({
        id: 'test-user', name: 'Test User', token: 'mock-test-token', roles: ['admin']
      }))
    })
    await page.goto(p.path, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(3000)
    console.log(`\n=== ${p.name} (${p.path}) ===`)
    console.log('TITLE:', await page.title())
    const text = (await page.locator('body').first().textContent()) || ''
    console.log('TEXT (first 500):', text.slice(0, 500))
  })
}