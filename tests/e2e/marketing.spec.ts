/**
 * DCA 营销域 E2E 渲染测试 (7 页面)
 */
import { test, expect, type Page } from '@playwright/test'

test.use({ baseURL: 'http://localhost:5177' })

const PAGES = [
  { name: '预警中心', path: '/marketing/alert', expectedContent: ['预警'] },
  { name: '权益管理', path: '/marketing/benefit/management', expectedContent: ['权益'] },
  { name: '权益包', path: '/marketing/benefit/package', expectedContent: ['权益'] },
  { name: '权益模板', path: '/marketing/benefit/template', expectedContent: ['权益'] },
  { name: '券规则', path: '/marketing/coupon/rules', expectedContent: ['券'] },
  { name: '券模板详情', path: '/marketing/coupon/template/detail', expectedContent: ['券'] },
  { name: '权益首页', path: '/marketing/dashboard', expectedContent: ['权益'] }
]

async function verifyPage(page: Page, expectedContent: string[]) {
  try { await page.waitForLoadState('networkidle', { timeout: 15000 }) } catch {}
  await page.waitForTimeout(2000)
  const body = (await page.locator('body').first().textContent()) || ''
  for (const text of expectedContent) {
    expect(body, `期望包含 "${text}"`).toContain(text)
  }
}

test.beforeEach(async ({ page }) => {
  await page.context().addInitScript(() => {
    localStorage.setItem('user-token', 'mock-test-token')
    localStorage.setItem('userInfo', JSON.stringify({
      id: 'test-user', name: 'Test User', token: 'mock-test-token', roles: ['admin']
    }))
  })
})

for (const p of PAGES) {
  test(`营销域-${p.name} (${p.path})`, async ({ page }) => {
    const response = await page.goto(p.path, { waitUntil: 'domcontentloaded' })
    expect(response?.status()).toBe(200)
    await verifyPage(page, p.expectedContent)

    const appRoot = await page.locator('#app').count()
    expect(appRoot).toBeGreaterThan(0)

    const appHtml = await page.locator('#app').innerHTML().catch(() => '')
    expect(appHtml.length).toBeGreaterThan(100)
  })
}

test(`营销域 汇总: ${PAGES.length} 个页面`, () => {
  expect(PAGES.length).toBe(7)
})