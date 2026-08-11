/**
 * DCA 数据探索域 E2E 渲染测试
 */
import { test, expect, type Page } from '@playwright/test'

test.use({ baseURL: 'http://localhost:5177' })

const PAGES = [
  // 探索域首页
  { name: '探索域首页', path: '/exploration/index', kw: ['探索'] },
  { name: '客群中心首页', path: '/exploration/customer-center', kw: ['客群'] },
  // 外数分析
  { name: '外数分析首页', path: '/exploration/external-data-analysis', kw: ['外数'] },
  { name: '外数跟踪总览', path: '/exploration/external-data-analysis/external-data-tracking-overview', kw: ['外数'] },
  { name: '外数监控', path: '/exploration/external-data-analysis/external-data-monitor', kw: ['外数'] },
  // 外数评估
  { name: '外数评估', path: '/exploration/external-data-evaluation', kw: ['评估'] },
  { name: '外数评估列表', path: '/exploration/external-data-evaluation/list', kw: ['评估'] },
  { name: '外数评估创建', path: '/exploration/external-data-evaluation/create', kw: ['评估'] },
  // 客户中心 - 事件
  { name: '事件中心', path: '/exploration/customer-center/event-center', kw: ['事件'] },
  { name: '事件管理', path: '/exploration/customer-center/event-center/event-management', kw: ['事件'] },
  { name: '事件创建', path: '/exploration/customer-center/event-center/event-create', kw: ['事件'] },
  { name: '样本统计', path: '/exploration/customer-center/event-center/sample-stats', kw: ['样本'] },
  // 客户中心 - 标签
  { name: '标签系统', path: '/exploration/customer-center/tag-system', kw: ['标签'] },
  { name: '标签管理', path: '/exploration/customer-center/tag-system/tag-management', kw: ['标签'] },
  { name: '标签创建', path: '/exploration/customer-center/tag-system/tag-create', kw: ['标签'] },
  { name: '表管理', path: '/exploration/customer-center/tag-system/table-management', kw: ['表'] },
  { name: '属性管理', path: '/exploration/customer-center/tag-system/attribute-management', kw: ['属性'] },
  { name: '标签中心', path: '/exploration/customer-center/tag-system/tag-center', kw: ['标签'] },
  // 客户中心 - 人群
  { name: '人群系统', path: '/exploration/customer-center/audience-system', kw: ['人群'] },
  { name: '人群管理', path: '/exploration/customer-center/audience-system/audience-management', kw: ['人群'] },
  { name: '人群创建', path: '/exploration/customer-center/audience-system/audience-create', kw: ['人群'] },
  // 工作流
  { name: '工作流管理', path: '/exploration/workflows', kw: ['工作流'] },
  { name: '工作流创建', path: '/exploration/workflows/create', kw: ['工作流'] },
  { name: '数据源配置', path: '/exploration/workflows/datasources', kw: ['数据'] },
  // 指标看板
  { name: '指标看板', path: '/exploration/indicator-dashboard', kw: ['指标'] }
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
  test(`探索域-${p.name} (${p.path})`, async ({ page }) => {
    const response = await page.goto(p.path, { waitUntil: 'domcontentloaded' })
    expect(response?.status()).toBe(200)
    await verifyPage(page, p.kw)

    const appRoot = await page.locator('#app').count()
    expect(appRoot).toBeGreaterThan(0)

    const appHtml = await page.locator('#app').innerHTML().catch(() => '')
    expect(appHtml.length).toBeGreaterThan(100)
  })
}

test(`探索域 汇总: ${PAGES.length} 个页面`, () => {
  expect(PAGES.length).toBe(24)
})