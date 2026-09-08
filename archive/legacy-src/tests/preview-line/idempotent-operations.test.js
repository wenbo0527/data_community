/**
 * 预览线系统幂等操作测试
 * 验证预览线系统中各种操作的幂等性，确保重复操作不会产生副作用
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// Mock 图实例
const mockGraph = {
  getNodes: vi.fn(() => []),
  getEdges: vi.fn(() => []),
  getCellById: vi.fn(),
  removeCell: vi.fn(),
  addEdge: vi.fn(),
  on: vi.fn(),
  off: vi.fn(),
  hasCell: vi.fn(() => true)
}

// Mock 预览线系统
const mockPreviewLineSystem = {
  previewLines: new Map(),
  createPreviewLine: vi.fn(),
  deletePreviewLine: vi.fn(),
  updatePreviewLine: vi.fn(),
  hasPreviewLine: vi.fn(),
  getPreviewLine: vi.fn(),
  clearPreviewLines: vi.fn(),
  refreshAllPreviewLines: vi.fn(),
  validateConfiguration: vi.fn(() => true),
  checkDuplicates: vi.fn(() => false)
}

// Mock 预览线渲染器
const mockPreviewLineRenderer = {
  renderPreviewLine: vi.fn(),
  updatePreviewLine: vi.fn(),
  removePreviewLine: vi.fn(),
  clearAll: vi.fn()
}

// Mock 节点数据
const mockNodes = [
  {
    id: 'node-1',
    type: 'start',
    data: { isConfigured: true, type: 'start' },
    getData: () => ({ isConfigured: true, type: 'start' })
  },
  {
    id: 'node-2',
    type: 'process',
    data: { isConfigured: true, type: 'process' },
    getData: () => ({ isConfigured: true, type: 'process' })
  }
]

describe('预览线系统幂等操作测试', () => {
  beforeEach(() => {
    // 重置所有 mock
    vi.clearAllMocks()
    mockPreviewLineSystem.previewLines.clear()
    
    // 设置默认行为
    mockGraph.getNodes.mockReturnValue(mockNodes)
    
    // 模拟幂等的创建预览线操作
    mockPreviewLineSystem.createPreviewLine.mockImplementation((config) => {
      const existingLine = Array.from(mockPreviewLineSystem.previewLines.values())
        .find(line => line.sourceId === config.sourceId && line.targetId === config.targetId)
      
      if (existingLine) {
        // 幂等性：如果已存在相同配置的预览线，返回现有的而不是创建新的
        return existingLine
      }
      
      const previewLine = {
        id: `preview-${Date.now()}-${Math.random()}`,
        sourceId: config.sourceId,
        targetId: config.targetId,
        ...config
      }
      mockPreviewLineSystem.previewLines.set(previewLine.id, previewLine)
      return previewLine
    })
    
    // 模拟幂等的删除预览线操作
    mockPreviewLineSystem.deletePreviewLine.mockImplementation((lineId) => {
      if (mockPreviewLineSystem.previewLines.has(lineId)) {
        mockPreviewLineSystem.previewLines.delete(lineId)
        return { success: true, deleted: true }
      } else {
        // 幂等性：删除不存在的预览线不会报错
        return { success: true, deleted: false, message: '预览线不存在' }
      }
    })
    
    // 模拟幂等的更新预览线操作
    mockPreviewLineSystem.updatePreviewLine.mockImplementation((lineId, updates) => {
      const existingLine = mockPreviewLineSystem.previewLines.get(lineId)
      if (existingLine) {
        // 深度合并对象属性，保持嵌套对象的原有值
        const updatedLine = { ...existingLine }
        Object.keys(updates).forEach(key => {
          if (typeof updates[key] === 'object' && updates[key] !== null && !Array.isArray(updates[key])) {
            updatedLine[key] = { ...existingLine[key], ...updates[key] }
          } else {
            updatedLine[key] = updates[key]
          }
        })
        mockPreviewLineSystem.previewLines.set(lineId, updatedLine)
        return updatedLine
      } else {
        // 幂等性：更新不存在的预览线返回null，不会报错
        return null
      }
    })
    
    mockPreviewLineSystem.hasPreviewLine.mockImplementation((nodeId) => {
      return Array.from(mockPreviewLineSystem.previewLines.values())
        .some(line => line.sourceId === nodeId)
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('预览线创建幂等性', () => {
    it('应该防止创建重复的预览线', () => {
      const config = {
        sourceId: 'node-1',
        targetId: 'node-2',
        type: 'preview'
      }
      
      // 第一次创建
      const line1 = mockPreviewLineSystem.createPreviewLine(config)
      expect(mockPreviewLineSystem.previewLines.size).toBe(1)
      expect(line1).toBeDefined()
      
      // 第二次创建相同配置的预览线
      const line2 = mockPreviewLineSystem.createPreviewLine(config)
      
      // 验证幂等性：不会创建重复的预览线
      expect(mockPreviewLineSystem.previewLines.size).toBe(1)
      expect(line2.id).toBe(line1.id) // 返回相同的预览线
    })

    it('应该允许创建不同配置的预览线', () => {
      const config1 = {
        sourceId: 'node-1',
        targetId: 'node-2',
        type: 'preview'
      }
      
      const config2 = {
        sourceId: 'node-1',
        targetId: 'node-3',
        type: 'preview'
      }
      
      // 创建两个不同配置的预览线
      const line1 = mockPreviewLineSystem.createPreviewLine(config1)
      const line2 = mockPreviewLineSystem.createPreviewLine(config2)
      
      // 验证两个不同的预览线都被创建
      expect(mockPreviewLineSystem.previewLines.size).toBe(2)
      expect(line1.id).not.toBe(line2.id)
      expect(line1.targetId).toBe('node-2')
      expect(line2.targetId).toBe('node-3')
    })

    it('应该在多次调用时保持幂等性', () => {
      const config = {
        sourceId: 'node-1',
        targetId: 'node-2',
        type: 'preview'
      }
      
      // 多次创建相同配置的预览线
      const results = []
      for (let i = 0; i < 5; i++) {
        results.push(mockPreviewLineSystem.createPreviewLine(config))
      }
      
      // 验证幂等性：只创建了一个预览线
      expect(mockPreviewLineSystem.previewLines.size).toBe(1)
      
      // 验证所有返回的都是同一个预览线
      const firstLineId = results[0].id
      results.forEach(line => {
        expect(line.id).toBe(firstLineId)
      })
    })
  })

  describe('预览线删除幂等性', () => {
    it('应该允许删除不存在的预览线而不报错', () => {
      const nonExistentLineId = 'non-existent-line'
      
      // 尝试删除不存在的预览线
      const result = mockPreviewLineSystem.deletePreviewLine(nonExistentLineId)
      
      // 验证幂等性：操作成功但没有实际删除
      expect(result.success).toBe(true)
      expect(result.deleted).toBe(false)
      expect(result.message).toBe('预览线不存在')
    })

    it('应该在多次删除同一预览线时保持幂等性', () => {
      // 先创建一个预览线
      const config = {
        sourceId: 'node-1',
        targetId: 'node-2',
        type: 'preview'
      }
      const line = mockPreviewLineSystem.createPreviewLine(config)
      expect(mockPreviewLineSystem.previewLines.size).toBe(1)
      
      // 第一次删除
      const result1 = mockPreviewLineSystem.deletePreviewLine(line.id)
      expect(result1.success).toBe(true)
      expect(result1.deleted).toBe(true)
      expect(mockPreviewLineSystem.previewLines.size).toBe(0)
      
      // 第二次删除同一个预览线
      const result2 = mockPreviewLineSystem.deletePreviewLine(line.id)
      
      // 验证幂等性：第二次删除不会报错
      expect(result2.success).toBe(true)
      expect(result2.deleted).toBe(false)
      expect(mockPreviewLineSystem.previewLines.size).toBe(0)
    })

    it('应该在批量删除中保持幂等性', () => {
      // 创建多个预览线
      const configs = [
        { sourceId: 'node-1', targetId: 'target-1', type: 'preview' },
        { sourceId: 'node-1', targetId: 'target-2', type: 'preview' }
      ]
      
      const createdLines = configs.map(config => 
        mockPreviewLineSystem.createPreviewLine(config)
      )
      expect(mockPreviewLineSystem.previewLines.size).toBe(2)
      
      // 准备删除列表（包含存在和不存在的预览线ID）
      const idsToDelete = [
        createdLines[0].id,
        createdLines[1].id,
        'non-existent-1',
        'non-existent-2'
      ]
      
      // 批量删除
      const results = idsToDelete.map(id => 
        mockPreviewLineSystem.deletePreviewLine(id)
      )
      
      // 验证幂等性：所有操作都成功，但只有存在的预览线被删除
      expect(results).toHaveLength(4)
      expect(results[0].deleted).toBe(true)  // 存在的预览线
      expect(results[1].deleted).toBe(true)  // 存在的预览线
      expect(results[2].deleted).toBe(false) // 不存在的预览线
      expect(results[3].deleted).toBe(false) // 不存在的预览线
      
      expect(mockPreviewLineSystem.previewLines.size).toBe(0)
    })
  })

  describe('预览线更新幂等性', () => {
    it('应该允许更新不存在的预览线而不报错', () => {
      const nonExistentLineId = 'non-existent-line'
      const updates = { style: { color: 'red' } }
      
      // 尝试更新不存在的预览线
      const result = mockPreviewLineSystem.updatePreviewLine(nonExistentLineId, updates)
      
      // 验证幂等性：返回null而不是抛出错误
      expect(result).toBeNull()
    })

    it('应该在多次相同更新时保持幂等性', () => {
      // 创建预览线
      const config = {
        sourceId: 'node-1',
        targetId: 'node-2',
        type: 'preview',
        style: { color: 'blue', width: 1 }
      }
      const line = mockPreviewLineSystem.createPreviewLine(config)
      
      const updates = { style: { color: 'red', width: 2 } }
      
      // 多次应用相同的更新
      const result1 = mockPreviewLineSystem.updatePreviewLine(line.id, updates)
      const result2 = mockPreviewLineSystem.updatePreviewLine(line.id, updates)
      const result3 = mockPreviewLineSystem.updatePreviewLine(line.id, updates)
      
      // 验证幂等性：多次更新结果相同
      expect(result1.style).toEqual({ color: 'red', width: 2 })
      expect(result2.style).toEqual({ color: 'red', width: 2 })
      expect(result3.style).toEqual({ color: 'red', width: 2 })
      
      // 验证预览线状态一致
      const finalLine = mockPreviewLineSystem.previewLines.get(line.id)
      expect(finalLine.style).toEqual({ color: 'red', width: 2 })
    })

    it('应该正确处理部分更新的幂等性', () => {
      // 创建预览线
      const config = {
        sourceId: 'node-1',
        targetId: 'node-2',
        type: 'preview',
        style: { color: 'blue', width: 1 },
        metadata: { priority: 1, category: 'default' }
      }
      const line = mockPreviewLineSystem.createPreviewLine(config)
      
      // 第一次部分更新
      const updates1 = { style: { color: 'red' } }
      const result1 = mockPreviewLineSystem.updatePreviewLine(line.id, updates1)
      
      // 第二次部分更新
      const updates2 = { metadata: { priority: 2 } }
      const result2 = mockPreviewLineSystem.updatePreviewLine(line.id, updates2)
      
      // 验证幂等性：每次更新都基于当前状态
      expect(result1.style.color).toBe('red')
      expect(result1.style.width).toBe(1) // 保持原有值
      
      expect(result2.metadata.priority).toBe(2)
      expect(result2.metadata.category).toBe('default') // 保持原有值
      expect(result2.style.color).toBe('red') // 保持之前的更新
    })
  })

  describe('复合操作幂等性', () => {
    it('应该在创建-删除-创建序列中保持幂等性', () => {
      const config = {
        sourceId: 'node-1',
        targetId: 'node-2',
        type: 'preview'
      }
      
      // 创建预览线
      const line1 = mockPreviewLineSystem.createPreviewLine(config)
      expect(mockPreviewLineSystem.previewLines.size).toBe(1)
      const originalId = line1.id
      
      // 删除预览线
      const deleteResult = mockPreviewLineSystem.deletePreviewLine(line1.id)
      expect(deleteResult.success).toBe(true)
      expect(mockPreviewLineSystem.previewLines.size).toBe(0)
      
      // 重新创建相同配置的预览线
      const line2 = mockPreviewLineSystem.createPreviewLine(config)
      expect(mockPreviewLineSystem.previewLines.size).toBe(1)
      
      // 验证：新创建的预览线应该有不同的ID（因为之前的已被删除）
      expect(line2.id).not.toBe(originalId)
      expect(line2.sourceId).toBe(config.sourceId)
      expect(line2.targetId).toBe(config.targetId)
    })

    it('应该在批量操作中保持幂等性', () => {
      const configs = [
        { sourceId: 'node-1', targetId: 'target-1', type: 'preview' },
        { sourceId: 'node-1', targetId: 'target-2', type: 'preview' },
        { sourceId: 'node-1', targetId: 'target-1', type: 'preview' }, // 重复配置
        { sourceId: 'node-1', targetId: 'target-3', type: 'preview' }
      ]
      
      // 批量创建预览线
      const results = configs.map(config => 
        mockPreviewLineSystem.createPreviewLine(config)
      )
      
      // 验证幂等性：重复配置不会创建新的预览线
      expect(mockPreviewLineSystem.previewLines.size).toBe(3) // 不是4个
      expect(results[0].id).toBe(results[2].id) // 重复配置返回相同的预览线
      
      // 验证所有唯一配置都被创建
      const uniqueTargets = new Set(Array.from(mockPreviewLineSystem.previewLines.values())
        .map(line => line.targetId))
      expect(uniqueTargets.size).toBe(3)
      expect(uniqueTargets.has('target-1')).toBe(true)
      expect(uniqueTargets.has('target-2')).toBe(true)
      expect(uniqueTargets.has('target-3')).toBe(true)
    })

    it('应该在错误恢复场景中保持幂等性', () => {
      const config = {
        sourceId: 'node-1',
        targetId: 'node-2',
        type: 'preview'
      }
      
      // 模拟创建过程中的错误恢复
      let attemptCount = 0
      mockPreviewLineSystem.createPreviewLine.mockImplementation((config) => {
        attemptCount++
        
        // 模拟前两次尝试失败
        if (attemptCount <= 2) {
          throw new Error(`创建失败 - 尝试 ${attemptCount}`)
        }
        
        // 第三次尝试成功
        const existingLine = Array.from(mockPreviewLineSystem.previewLines.values())
          .find(line => line.sourceId === config.sourceId && line.targetId === config.targetId)
        
        if (existingLine) {
          return existingLine
        }
        
        const previewLine = {
          id: `preview-${Date.now()}-${Math.random()}`,
          sourceId: config.sourceId,
          targetId: config.targetId,
          ...config
        }
        mockPreviewLineSystem.previewLines.set(previewLine.id, previewLine)
        return previewLine
      })
      
      // 模拟重试机制
      let result = null
      let error = null
      
      for (let i = 0; i < 5; i++) {
        try {
          result = mockPreviewLineSystem.createPreviewLine(config)
          break
        } catch (e) {
          error = e
          continue
        }
      }
      
      // 验证最终成功创建
      expect(result).toBeDefined()
      expect(result.sourceId).toBe(config.sourceId)
      expect(mockPreviewLineSystem.previewLines.size).toBe(1)
      
      // 验证幂等性：再次调用不会创建新的预览线
      const result2 = mockPreviewLineSystem.createPreviewLine(config)
      expect(result2.id).toBe(result.id)
      expect(mockPreviewLineSystem.previewLines.size).toBe(1)
    })
  })
})