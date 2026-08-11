/**
 * DCA 发现域 E2E 渲染测试 (20 页面)
 */
import { test, expect, type Page } from '@playwright/test'

test.use({ baseURL: 'http://localhost:5177' })

const PAGES = [
  { name: '资产总览', path: '/discovery/asset-overview', expectedContent: ['资产'] },
  { name: '客户360', path: '/discovery/customer360', expectedContent: ['客户'] },
  { name: '外数', path: '/discovery/external', expectedContent: ['外数'] },
  { name: '征信变量', path: '/discovery/credit', expectedContent: ['征信'] },
  { name: '指标地图', path: '/discovery/metrics-map', expectedContent: ['指标'] },
  { name: '特征地图', path: '/discovery/feature-map', expectedContent: ['特征'] },
  { name: 'API 市场', path: '/discovery/api-market', expectedContent: ['API'] },
  { name: '统一指标', path: '/discovery/unified-metrics', expectedContent: ['指标'] },
  { name: '数据消费地图', path: '/discovery/data-map', expectedContent: ['数据'] },
  { name: '常用表管理', path: '/discovery/data-map/collections', expectedContent: ['表'] },
  { name: '血缘分析', path: '/discovery/lineage', expectedContent: ['血缘'] },
  { name: '业务系统资源', path: '/discovery/data-resources/business-system', expectedContent: ['业务系统'] },
  { name: '外部数据资源', path: '/discovery/data-resources/external-data', expectedContent: ['外部'] },
  { name: '文件导入资源', path: '/discovery/data-resources/file-import', expectedContent: ['文件'] },
  { name: '日志数据资源', path: '/discovery/data-resources/log-data', expectedContent: ['日志'] },
  { name: '实时数据资源', path: '/discovery/data-resources/real-time-data', expectedContent: ['实时'] },
  { name: '统一搜索', path: '/discovery/search', expectedContent: ['搜索'] },
  { name: '资产批量管理', path: '/discovery/asset-management/batch-asset-management', expectedContent: ['资产'] },
  { name: '外数采购登记', path: '/discovery/asset-management/external-purchase-register', expectedContent: ['外数'] },
  { name: '我的关注', path: '/discovery/favorites', expectedContent: ['关注'] }
]

async function verifyPage(page: Page, expectedContent: string[]) {
  try { await page.waitForLoadState('networkidle', { timeout: 30000 }) } catch {}
  await page.waitForTimeout(3000)
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
  test(`发现域-${p.name} (${p.path})`, async ({ page }) => {
    const response = await page.goto(p.path, { waitUntil: 'domcontentloaded' })
    expect(response?.status()).toBe(200)
    await verifyPage(page, p.expectedContent)

    const appRoot = await page.locator('#app').count()
    expect(appRoot).toBeGreaterThan(0)

    const appHtml = await page.locator('#app').innerHTML().catch(() => '')
    expect(appHtml.length).toBeGreaterThan(100)
  })
}

test(`发现域 汇总: ${PAGES.length} 个页面`, () => {
  expect(PAGES.length).toBe(20)
})