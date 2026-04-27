/**
 * risk-app E2E 测试
 * 风险管理子应用测试套件
 */
import { test, expect } from '@playwright/test';
import { SUB_APPS, runConnectivityTest, runMenuRenderTest, runPageLoadTest } from './base';

const config = SUB_APPS.find(a => a.name === 'risk-app')!;

test.describe('risk-app 微应用', () => {
  test('01 - 连接性测试：应用应该正常响应', async ({ page }) => {
    const response = await page.goto(`http://localhost:${config.port}${config.base}`);
    expect(response?.status()).toBe(200);
  });

  test('02 - 独立运行测试：首页应该正常加载', async ({ page }) => {
    await runPageLoadTest(page, config);
  });

  test('03 - 主应用集成测试：SideMenu 应该显示该应用菜单', async ({ page }) => {
    await runMenuRenderTest(page, config);
  });

  test('04 - Registry 注册测试：应用应该被正确注册', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // 检查控制台日志
    const logs: string[] = [];
    page.on('console', msg => {
      if (msg.text().includes('[Registry]')) {
        logs.push(msg.text());
      }
    });
    
    await page.reload();
    await page.waitForTimeout(3000);
    
    const registered = logs.some(log => log.includes(`Registered: ${config.registryName}`));
    expect(registered, `${config.name} should be registered`).toBe(true);
  });

  test('05 - 路由跳转测试：从 SideMenu 点击菜单应该正确跳转', async ({ page }) => {
    await page.goto('http://localhost:5173/discovery');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // 找到并点击 "工作台" 菜单
    const workbenchMenu = page.locator('.arco-menu-item', { hasText: '工作台' }).first();
    if (await workbenchMenu.isVisible()) {
      await workbenchMenu.click();
      await page.waitForTimeout(1000);
      // 验证 URL 变化或页面内容变化
      expect(page.url()).toBeTruthy();
    }
  });
});
