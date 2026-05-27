import { test, expect } from '@playwright/test'

const BASE_URL = 'http://localhost:5176'

test.describe('risk-app Qiankun 清理验证', () => {
  test('01 - 连接性测试：应用应该正常响应', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/risk/`)
    expect(response?.status()).toBe(200)
  })

  test('02 - 独立运行测试：首页应该正常加载', async ({ page }) => {
    await page.goto(`${BASE_URL}/risk/`)
    await page.waitForLoadState('networkidle')
    // 检查页面标题
    const title = await page.title()
    expect(title).toContain('数字风险')
  })

  test('03 - 验证无 Qiankun 代码残留', async ({ page }) => {
    await page.goto(`${BASE_URL}/risk/`)
    await page.waitForLoadState('networkidle')
    // 在控制台检查是否有 qiankun 相关日志
    const logs: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        logs.push(msg.text())
      }
    })
    await page.reload()
    await page.waitForTimeout(1000)
    // 不应该有 qiankun 相关的错误
    const qiankunErrors = logs.filter(log => 
      log.toLowerCase().includes('qiankun') || 
      log.toLowerCase().includes('__POWERED_BY_QIANKUN__')
    )
    expect(qiankunErrors).toHaveLength(0)
  })

  test('04 - 验证控制台启动日志', async ({ page }) => {
    const logs: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'log') {
        logs.push(msg.text())
      }
    })
    await page.goto(`${BASE_URL}/risk/`)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)
    // 应该有独立模式启动日志
    const hasStandaloneLog = logs.some(log => log.includes('[Risk] 独立模式启动'))
    expect(hasStandaloneLog).toBe(true)
  })
})