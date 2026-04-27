/**
 * 微应用 E2E 测试基类
 * 为每个子应用提供统一的测试模板
 */
import { test, expect, type Page } from '@playwright/test';

// 子应用配置
export interface SubAppConfig {
  name: string;
  port: number;
  base: string;
  registryName: string;
  mainMenuItems: string[];
  childMenuItems?: string[];
}

export const SUB_APPS: SubAppConfig[] = [
  {
    name: 'risk-app',
    port: 5176,
    base: '/risk/',
    registryName: 'risk-app',
    mainMenuItems: ['工作台', '外数生命周期', '预算管理'],
  },
  {
    name: 'touch',
    port: 5181,
    base: '/touch/',
    registryName: 'touch',
    mainMenuItems: ['触达首页', '渠道管理', '手动短信'],
  },
  {
    name: 'mkt-app',
    port: 5177,
    base: '/mkt/',
    registryName: 'mkt-app',
    mainMenuItems: ['营销首页', '权益中心', '客群中心'],
  },
  {
    name: 'dex-app',
    port: 5180,
    base: '/dex/',
    registryName: 'dex-app',
    mainMenuItems: ['探索首页', '客户360', '客群中心'],
  },
  {
    name: 'dmt-app',
    port: 5184,
    base: '/dmt/',
    registryName: 'dmt-app',
    mainMenuItems: ['管理首页', '元数据', '数据标准'],
  },
  {
    name: 'admin-app',
    port: 5182,
    base: '/admin/',
    registryName: 'admin-app',
    mainMenuItems: ['管理首页', '权限管理', '门户管理'],
  },
];

/**
 * 基础连接测试
 */
export async function runConnectivityTest(page: Page, config: SubAppConfig) {
  const response = await page.goto(`http://localhost:${config.port}${config.base}`);
  expect(response?.status()).toBe(200);
}

/**
 * Registry 注册测试
 */
export async function runRegistryTest(page: Page, config: SubAppConfig) {
  // 在主应用中检查 registry 日志
  await page.goto('http://localhost:5173/');
  await page.waitForLoadState('networkidle');
  
  // 等待 registry 初始化
  await page.waitForTimeout(2000);
  
  // 检查控制台是否有该应用的注册日志
  const logs: string[] = [];
  page.on('console', msg => {
    if (msg.text().includes(`[Registry]`)) {
      logs.push(msg.text());
    }
  });
  
  await page.reload();
  await page.waitForTimeout(3000);
  
  const registered = logs.some(log => log.includes(`Registered: ${config.registryName}`));
  expect(registered, `${config.name} should be registered`).toBe(true);
}

/**
 * 菜单渲染测试
 */
export async function runMenuRenderTest(page: Page, config: SubAppConfig) {
  await page.goto('http://localhost:5173/discovery');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  
  // 检查菜单项是否渲染
  const menuItems = await page.locator('.arco-menu-item, .arco-menu-inline-menu').allTextContents();
  
  // 至少有一些菜单项
  expect(menuItems.length).toBeGreaterThan(0);
  
  // 检查主应用菜单项
  const hasRiskMenu = menuItems.some(item => item.includes('工作台'));
  const hasTouchMenu = menuItems.some(item => item.includes('触达首页'));
  
  // 至少一个主应用的菜单可见
  expect(hasRiskMenu || hasTouchMenu).toBe(true);
}

/**
 * 页面加载测试
 */
export async function runPageLoadTest(page: Page, config: SubAppConfig) {
  await page.goto(`http://localhost:${config.port}${config.base}`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  
  // 检查页面标题或主要内容
  const body = await page.textContent('body');
  expect(body).toBeTruthy();
  expect(body!.length).toBeGreaterThan(10);
}
