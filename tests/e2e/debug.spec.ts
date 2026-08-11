import { test } from '@playwright/test'

test('debug favorites', async ({ page }) => {
  page.on('console', (msg) => console.log(`[console.${msg.type()}]`, msg.text()))
  page.on('pageerror', (err) => console.log('[pageerror]', err.message))
  page.on('requestfailed', (req) => console.log('[requestfailed]', req.url(), req.failure()?.errorText))

  await page.goto('http://localhost:5177/home/discovery/favorites', { waitUntil: 'networkidle' })
  await page.waitForTimeout(3000)
  console.log('---HTML---')
  console.log((await page.content()).slice(0, 3000))
})