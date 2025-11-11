/**
 * PreviewLineSystem基础功能测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'

describe('PreviewLineSystem基础功能测试', () => {
  it('应该能够导入PreviewLineSystem', async () => {
    try {
      const PreviewLineSystem = await import('../utils/preview-line/PreviewLineSystem.js')
      expect(PreviewLineSystem).toBeDefined()
      expect(PreviewLineSystem.default).toBeDefined()
    } catch (error) {
      console.error('导入PreviewLineSystem失败:', error)
      throw error
    }
  })

  it('应该能够创建PreviewLineSystem实例', async () => {
    try {
      const { default: PreviewLineSystem } = await import('../utils/preview-line/PreviewLineSystem.js')
      
      const mockGraph = {
        addNode: vi.fn(),
        addEdge: vi.fn(),
        removeEdge: vi.fn(),
        getNodes: vi.fn().mockReturnValue([]),
        getEdges: vi.fn().mockReturnValue([]),
        getOutgoingEdges: vi.fn().mockReturnValue([]),
        getCellById: vi.fn(),
        on: vi.fn(),
        off: vi.fn(),
        hasCell: vi.fn().mockReturnValue(false),
        findViewByCell: vi.fn()
      }

      const system = new PreviewLineSystem({
        graph: mockGraph,
        skipInitialization: true
      })
      
      expect(system).toBeDefined()
      expect(system.isInitialized()).toBe(false)
    } catch (error) {
      console.error('创建PreviewLineSystem实例失败:', error)
      throw error
    }
  })
})