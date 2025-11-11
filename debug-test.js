import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

describe('Debug Test', () => {
  it('should import UnifiedEdgeManager', async () => {
    const module = await import('./src/pages/marketing/tasks/composables/canvas/unified/UnifiedEdgeManager.js')
    expect(module.default).toBeDefined()
    expect(typeof module.default).toBe('function')
  })
})