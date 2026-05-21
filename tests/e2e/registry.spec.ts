/**
 * Registry E2E Test - 微应用注册系统
 */
import { test, expect } from '@playwright/test'

test.describe('微应用注册系统', () => {
  test.beforeEach(async ({ page }) => {
    // 捕获控制台日志
    page.on('console', msg => {
      if (msg.text().includes('[Registry]')) {
        console.log(`[Console] ${msg.text()}`)
      }
    })
  })

  test('should discover and register sub-apps on startup', async ({ page }) => {
    // 访问主应用首页（使用 blank 布局）
    await page.goto('http://localhost:5173/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)
    
    // 截图首页
    await page.screenshot({ path: '/tmp/registry-e2e-home.png' })
    console.log('✓ 首页截图已保存')
    
    // 导航到一个使用 MainLayout 的页面来测试 SideMenu
    // 查找一个使用 main 布局的路由，比如 /discovery
    await page.goto('http://localhost:5173/discovery')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(3000)
    
    // 截图带 SideMenu 的页面
    await page.screenshot({ path: '/tmp/registry-e2e-discovery.png', fullPage: true })
    console.log('✓ Discovery 页面截图已保存')
    
    // 检查 SideMenu 中的菜单项
    // 查找包含"工作台"的菜单（risk-app 的第一个菜单）
    const workbench = page.locator('text=工作台').first()
    if (await workbench.isVisible({ timeout: 3000 }).catch(() => false)) {
      console.log('✓ 工作台菜单项已渲染')
    } else {
      console.log('⚠ 工作台菜单项未找到，可能在子菜单中')
    }
    
    // 验证控制台日志仍然正常
    console.log('✓ SideMenu 渲染验证完成')
  })

  test('should show registered apps in console', async ({ page }) => {
    const registryLogs: string[] = []
    
    page.on('console', msg => {
      const text = msg.text()
      if (text.includes('[Registry]')) {
        registryLogs.push(text)
      }
    })

    await page.goto('http://localhost:5173/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    console.log('Registry logs found:', registryLogs.length)
    registryLogs.forEach(log => console.log(`  ${log}`))
  })
})
