/**
 * P0/P1 页面 E2E 渲染验证
 */
import { test, expect, type Page } from '@playwright/test'

test.use({ baseURL: 'http://localhost:5177' })

const P0_PAGES = [
  { name: 'P0-我的关注', path: '/discovery/favorites', expectedContent: ['关注'] },
  { name: 'P0-影响分析', path: '/discovery/impact-analysis', expectedContent: ['分析'] },
  { name: 'P1-要素字典', path: '/discovery/elements-dictionary', expectedContent: ['要素'] },
  { name: 'P1-智能分级分类', path: '/discovery/classification', expectedContent: ['分类'] },
  { name: 'P1-资产详情', path: '/discovery/asset-detail/dim_user', expectedContent: ['详情'] },
  { name: 'P1-批量注册', path: '/discovery/batch-registration', expectedContent: ['指标'] },
  { name: 'P1-监管报表', path: '/discovery/regulatory-config', expectedContent: ['配置'] },
  { name: 'P1-资产导览', path: '/discovery/asset-guide', expectedContent: ['资产'] }
]

async function verifyPage(page: Page, expectedContent: string[]) {
  // 等待 networkidle (vite optimize 完成后)
  try {
    await page.waitForLoadState('networkidle', { timeout: 30000 })
  } catch {}
  await page.waitForTimeout(3000)
  const body = (await page.locator('body').first().textContent()) || ''
  for (const text of expectedContent) {
    expect(body, `期望包含 "${text}"`).toContain(text)
  }
}

test.beforeEach(async ({ page }) => {
  // 注入 mock token 绕过路由守卫
  await page.context().addInitScript(() => {
    localStorage.setItem('user-token', 'mock-test-token')
    localStorage.setItem('userInfo', JSON.stringify({
      id: 'test-user', name: 'Test User', token: 'mock-test-token', roles: ['admin']
    }))
  })
})

for (const p of P0_PAGES) {
  test(`P0/P1-${p.name} (${p.path})`, async ({ page }) => {
    const response = await page.goto(p.path, { waitUntil: 'domcontentloaded' })
    expect(response?.status()).toBe(200)
    await verifyPage(page, p.expectedContent)

    const appRoot = await page.locator('#app').count()
    expect(appRoot).toBeGreaterThan(0)

    const appHtml = await page.locator('#app').innerHTML().catch(() => '')
    expect(appHtml.length).toBeGreaterThan(100)
  })
}

test(`P0/P1 汇总: ${P0_PAGES.length} 个页面`, () => {
  expect(P0_PAGES.length).toBe(8)
})