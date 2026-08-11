/**
 * DCA 子应用 (apps/data-community-app, 端口 5185) E2E 渲染测试
 * 覆盖三大核心域: 数据发现 + 数据管理 + 数据探索
 */
import { test, expect, type Page } from '@playwright/test'

test.use({ baseURL: 'http://localhost:5185' })

const PAGES = [
  // 工作台
  { name: '工作台', path: '/dca/workbench', kw: ['工作台'] },
  // 数据发现 (24)
  { name: '数据发现首页', path: '/dca/discovery', kw: ['发现'] },
  { name: '数据地图', path: '/dca/discovery/data-map', kw: ['数据'] },
  { name: '资产目录', path: '/dca/discovery/asset-catalog', kw: ['资产'] },
  { name: '资产概览', path: '/dca/discovery/asset-overview', kw: ['资产'] },
  { name: '资产指南', path: '/dca/discovery/asset-guide', kw: ['资产'] },
  { name: '征信查询', path: '/dca/discovery/credit', kw: ['征信'] },
  { name: '外部数据', path: '/dca/discovery/external', kw: ['外部'] },
  { name: '指标地图', path: '/dca/discovery/metrics-map', kw: ['指标'] },
  { name: '指标字典', path: '/dca/discovery/indicator-dict', kw: ['指标'] },
  { name: '统一指标', path: '/dca/discovery/unified-metrics', kw: ['指标'] },
  { name: '指标看板', path: '/dca/discovery/indicator-dashboard', kw: ['指标'] },
  { name: '指标地铁图', path: '/dca/discovery/subway-map', kw: ['地铁'] },
  { name: '变量地图', path: '/dca/discovery/variable-map', kw: ['变量'] },
  { name: '变量字典', path: '/dca/discovery/variable-dict', kw: ['变量'] },
  { name: '特征地图', path: '/dca/discovery/feature-map', kw: ['特征'] },
  { name: '特征字典', path: '/dca/discovery/feature-dict', kw: ['特征'] },
  { name: 'API 市场', path: '/dca/discovery/api-market', kw: ['API'] },
  { name: '血缘构建', path: '/dca/discovery/lineage', kw: ['血缘'] },
  { name: '影响分析', path: '/dca/discovery/impact-analysis', kw: ['影响'] },
  { name: '数据资源目录', path: '/dca/discovery/data-resources', kw: ['数据'] },
  { name: '数据总览', path: '/dca/discovery/overview', kw: ['数据资源'] },
  { name: '我的关注', path: '/dca/discovery/favorites', kw: ['关注'] },
  { name: '文件导入', path: '/dca/discovery/data-resources/files', kw: ['文件'] },
  { name: '日志数据', path: '/dca/discovery/data-resources/logs', kw: ['日志'] },
  { name: '实时数据', path: '/dca/discovery/data-resources/realtime', kw: ['实时'] },
  { name: '批量注册', path: '/dca/discovery/batch-registration', kw: ['指标'] },
  { name: '监管报表配置', path: '/dca/discovery/regulatory-config', kw: ['监管'] },
  { name: '全局搜索', path: '/dca/discovery/search', kw: ['搜索'] },
  // 数据管理 (16)
  { name: '数据管理首页', path: '/dca/management', kw: ['管理'] },
  { name: '通知中心', path: '/dca/management/notifications', kw: ['通知'] },
  { name: '业务概念', path: '/dca/management/business-concept', kw: ['业务'] },
  { name: '数据标准', path: '/dca/management/data-standard/standards', kw: ['标准'] },
  { name: '数据模型', path: '/dca/management/data-models', kw: ['模型'] },
  { name: '用户组管理', path: '/dca/management/user-groups', kw: ['用户'] },
  { name: '元数据建模', path: '/dca/management/metadata/modeling', kw: ['元数据'] },
  { name: '数据服务', path: '/dca/management/service', kw: ['服务'] },
  { name: 'API 上架向导', path: '/dca/management/service/api-wizard', kw: ['API'] },
  { name: '资产标签管理', path: '/dca/management/asset-management/asset-tags', kw: ['标签'] },
  { name: '标签分组管理', path: '/dca/management/asset-management/tag-group', kw: ['标签'] },
  { name: '字段权限申请', path: '/dca/management/permission/data-permission/apply', kw: ['权限'] },
  { name: '我的审批', path: '/dca/management/permission/data-permission/approval', kw: ['审批'] },
  { name: '申请管理', path: '/dca/management/permission/data-permission/management', kw: ['申请'] },
  { name: '我的进度', path: '/dca/management/permission/data-permission/progress', kw: ['进度'] },
  { name: '资源上下架', path: '/dca/management/shelf/resource-shelf', kw: ['资源'] },
  { name: '资产上下架', path: '/dca/management/shelf/asset-shelf', kw: ['资产'] },
  { name: '要素上下架', path: '/dca/management/shelf/element-shelf', kw: ['要素'] },
  { name: '批量上下架', path: '/dca/management/shelf/batch-shelf', kw: ['批量'] },
  { name: '数据分级分类', path: '/dca/management/classification', kw: ['分类'] },
  // 数据探索 (4)
  { name: '数据探索首页', path: '/dca/exploration', kw: ['探索'] },
  { name: '客户 360', path: '/dca/exploration/customer360', kw: ['客户'] },
  { name: '分析工作流', path: '/dca/exploration/workflows', kw: ['工作流'] },
  { name: '业务指标看板', path: '/dca/exploration/indicator-dashboard', kw: ['看板'] }
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
  test(`DCA-${p.name} (${p.path})`, async ({ page }) => {
    const response = await page.goto(p.path, { waitUntil: 'domcontentloaded' })
    expect(response?.status()).toBe(200)
    await verifyPage(page, p.kw)

    const appRoot = await page.locator('#app').count()
    expect(appRoot).toBeGreaterThan(0)

    const appHtml = await page.locator('#app').innerHTML().catch(() => '')
    expect(appHtml.length).toBeGreaterThan(100)
  })
}

test(`DCA 汇总: ${PAGES.length} 个页面`, () => {
  expect(PAGES.length).toBeGreaterThanOrEqual(46)
})