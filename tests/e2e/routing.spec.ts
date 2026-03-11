import { test, expect } from '@playwright/test'

test.describe('Routing Tests', () => {
  test('should navigate to home page', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/数据社区平台/)
  })

  test('should navigate to model offline analysis', async ({ page }) => {
    await page.goto('/risk/model-offline-analysis')
    
    // Check if the page contains expected content
    await expect(page.locator('h2')).toContainText('模型离线分析')
  })

  test('should navigate to feature center', async ({ page }) => {
    await page.goto('/risk/model-offline-analysis/feature-center')
    
    // Check if the page contains expected content
    await expect(page.locator('h2')).toContainText('特征中心')
  })

  test('should navigate to model register', async ({ page }) => {
    await page.goto('/risk/model-offline-analysis/model-register')
    
    // Check if the page contains expected content
    await expect(page.locator('h2')).toContainText('模型注册')
  })

  test('should navigate to model backtrack', async ({ page }) => {
    await page.goto('/risk/model-offline-analysis/model-backtrack')
    
    // Check if the page contains expected content
    await expect(page.locator('h2')).toContainText('模型回溯')
  })

  test('should navigate to task management', async ({ page }) => {
    await page.goto('/risk/model-offline-analysis/task-management')
    
    // Check if the page contains expected content
    await expect(page.locator('h2')).toContainText('任务管理')
  })

  test('should navigate to model evaluation', async ({ page }) => {
    await page.goto('/risk/model-offline-analysis/model-evaluation')
    
    // Check if the page contains expected content
    await expect(page.locator('h2')).toContainText('模型评估')
  })

  test('should handle 404 pages', async ({ page }) => {
    await page.goto('/non-existent-page')
    
    // Check if 404 page is displayed
    await expect(page.locator('body')).toContainText('404')
  })
})

test.describe('Feature Center Functionality', () => {
  test('should display feature list', async ({ page }) => {
    await page.goto('/risk/model-offline-analysis/feature-center')
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle')
    
    // Check if feature table is present
    const table = page.locator('table')
    await expect(table).toBeVisible()
    
    // Check if at least one feature is displayed
    const rows = table.locator('tbody tr')
    await expect(rows.first()).toBeVisible()
  })

  test('should filter features by name', async ({ page }) => {
    await page.goto('/risk/model-offline-analysis/feature-center')
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle')
    
    // Find and fill the name filter input
    const nameInput = page.locator('input[placeholder="请输入特征名称"]')
    await nameInput.fill('test')
    
    // Click search button
    const searchButton = page.locator('button:has-text("搜索")')
    await searchButton.click()
    
    // Wait for results to update
    await page.waitForTimeout(1000)
    
    // Check if filtered results are displayed
    const table = page.locator('table')
    await expect(table).toBeVisible()
  })

  test('should open feature registration modal', async ({ page }) => {
    await page.goto('/risk/model-offline-analysis/feature-center')
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle')
    
    // Find and click the create button
    const createButton = page.locator('button:has-text("新建")')
    await createButton.click()
    
    // Check if modal is opened
    const modal = page.locator('.arco-modal')
    await expect(modal).toBeVisible()
  })
})

test.describe('Responsive Design', () => {
  test('should be mobile responsive', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/risk/model-offline-analysis/feature-center')
    
    // Check if content is still accessible on mobile
    const content = page.locator('.risk-feature-center')
    await expect(content).toBeVisible()
    
    // Check if table is scrollable on mobile
    const table = page.locator('table')
    await expect(table).toBeVisible()
  })

  test('should be tablet responsive', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/risk/model-offline-analysis/feature-center')
    
    // Check if content is properly displayed on tablet
    const content = page.locator('.risk-feature-center')
    await expect(content).toBeVisible()
    
    // Check if sidebar is visible on tablet
    const sidebar = page.locator('.sidebar')
    await expect(sidebar).toBeVisible()
  })
})