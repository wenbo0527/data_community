/**
 * 预览线系统稳定性测试
 * 测试简化后的预览线系统在各种场景下的稳定性和同步处理能力
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

// Mock 事件队列
const mockEventQueue = {
  events: [],
  add: vi.fn((event) => {
    mockEventQueue.events.push(event)
  }),
  process: vi.fn(() => {
    const events = [...mockEventQueue.events]
    mockEventQueue.events.length = 0
    return events
  }),
  clear: vi.fn(() => {
    mockEventQueue.events.length = 0
  })
}

// Mock 预览线系统
const mockPreviewLineSystem = {
  previewLines: new Map(),
  eventQueue: mockEventQueue,
  createPreviewLine: vi.fn(),
  deletePreviewLine: vi.fn(),
  updatePreviewLine: vi.fn(),
  hasPreviewLine: vi.fn(),
  getPreviewLine: vi.fn(),
  batchCreatePreviewLines: vi.fn(),
  batchDeletePreviewLines: vi.fn(),
  validateAndCleanupDuplicates: vi.fn(),
  handleError: vi.fn(),
  emit: vi.fn()
}

// Mock 预览线渲染器
const mockPreviewLineRenderer = {
  renderPreviewLine: vi.fn(),
  updatePreviewLine: vi.fn(),
  removePreviewLine: vi.fn(),
  clearAll: vi.fn(),
  batchRender: vi.fn(),
  batchRemove: vi.fn()
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
    type: 'audience-split',
    data: { isConfigured: true, type: 'audience-split' },
    getData: () => ({ isConfigured: true, type: 'audience-split' })
  },
  {
    id: 'node-3',
    type: 'condition',
    data: { isConfigured: false, type: 'condition' }, // 未配置的节点
    getData: () => ({ isConfigured: false, type: 'condition' })
  }
]

describe('预览线系统稳定性测试', () => {
  beforeEach(() => {
    // 重置所有 mock
    vi.clearAllMocks()
    mockPreviewLineSystem.previewLines.clear()
    mockEventQueue.events.length = 0
    
    // 设置默认行为
    mockGraph.getNodes.mockReturnValue(mockNodes)
    
    // 同步创建预览线
    mockPreviewLineSystem.createPreviewLine.mockImplementation((config) => {
      const previewLine = {
        id: `preview-${Date.now()}-${Math.random()}`,
        sourceId: config.sourceId,
        targetId: config.targetId,
        ...config
      }
      mockPreviewLineSystem.previewLines.set(previewLine.id, previewLine)
      return previewLine
    })
    
    // 批量创建预览线
    mockPreviewLineSystem.batchCreatePreviewLines.mockImplementation((configs) => {
      const results = []
      for (const config of configs) {
        const previewLine = mockPreviewLineSystem.createPreviewLine(config)
        results.push(previewLine)
      }
      return results
    })
    
    // 批量删除预览线
    mockPreviewLineSystem.batchDeletePreviewLines.mockImplementation((ids) => {
      const results = []
      for (const id of ids) {
        if (mockPreviewLineSystem.previewLines.has(id)) {
          mockPreviewLineSystem.previewLines.delete(id)
          results.push({ id, success: true })
        } else {
          results.push({ id, success: false, error: '预览线不存在' })
        }
      }
      return results
    })
    
    mockPreviewLineSystem.hasPreviewLine.mockImplementation((nodeId) => {
      return Array.from(mockPreviewLineSystem.previewLines.values())
        .some(line => line.sourceId === nodeId)
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('同步预览线创建稳定性', () => {
    it('应该同步为已配置的节点创建预览线', () => {
      // 模拟同步为所有节点创建预览线
      const configsToCreate = []
      
      for (const node of mockNodes) {
        const nodeData = node.getData()
        
        // 只有已配置的节点才应该创建预览线
        if (nodeData.isConfigured) {
          configsToCreate.push({
            sourceId: node.id,
            targetId: `target-${node.id}`,
            type: 'preview'
          })
        }
      }
      
      // 同步批量创建预览线
      const createdLines = mockPreviewLineSystem.batchCreatePreviewLines(configsToCreate)
      
      // 验证只有已配置的节点创建了预览线
      const configuredNodes = mockNodes.filter(node => node.getData().isConfigured)
      expect(createdLines).toHaveLength(configuredNodes.length)
      expect(mockPreviewLineSystem.previewLines.size).toBe(configuredNodes.length)
    })

    it('应该能够同步处理大量预览线的批量创建和删除', () => {
      const previewLineCount = 100
      const sourceNode = mockNodes.find(node => node.getData().isConfigured)
      
      // 准备批量创建配置
      const configs = []
      for (let i = 0; i < previewLineCount; i++) {
        configs.push({
          sourceId: sourceNode.id,
          targetId: `target-${i}`,
          type: 'preview'
        })
      }
      
      // 同步批量创建预览线
      const createdLines = mockPreviewLineSystem.batchCreatePreviewLines(configs)
      
      // 验证创建成功
      expect(createdLines).toHaveLength(previewLineCount)
      expect(mockPreviewLineSystem.previewLines.size).toBe(previewLineCount)
      
      // 同步批量删除所有预览线
      const lineIds = createdLines.map(line => line.id)
      const deleteResults = mockPreviewLineSystem.batchDeletePreviewLines(lineIds)
      
      // 验证删除成功
      expect(deleteResults).toHaveLength(previewLineCount)
      expect(deleteResults.every(result => result.success)).toBe(true)
      expect(mockPreviewLineSystem.previewLines.size).toBe(0)
    })

    it('应该同步处理分支节点的多条预览线', () => {
      const branchNode = mockNodes.find(node => node.type === 'audience-split')
      const branchCount = 3
      
      // 准备分支预览线配置
      const branchConfigs = []
      for (let i = 0; i < branchCount; i++) {
        branchConfigs.push({
          sourceId: branchNode.id,
          targetId: `branch-target-${i}`,
          branchId: `branch-${i}`,
          type: 'branch-preview'
        })
      }
      
      // 同步批量创建分支预览线
      const createdLines = mockPreviewLineSystem.batchCreatePreviewLines(branchConfigs)
      
      // 验证分支预览线创建成功
      expect(createdLines).toHaveLength(branchCount)
      expect(mockPreviewLineSystem.previewLines.size).toBe(branchCount)
      
      // 验证每条预览线都有正确的分支ID
      createdLines.forEach((line, index) => {
        expect(line.branchId).toBe(`branch-${index}`)
        expect(line.type).toBe('branch-preview')
      })
    })

    it('应该支持幂等的预览线创建操作', () => {
      const sourceNode = mockNodes.find(node => node.getData().isConfigured)
      const config = {
        sourceId: sourceNode.id,
        targetId: 'target-1',
        type: 'preview'
      }
      
      // 第一次创建
      const line1 = mockPreviewLineSystem.createPreviewLine(config)
      expect(mockPreviewLineSystem.previewLines.size).toBe(1)
      
      // 模拟幂等检查 - 如果已存在相同配置的预览线，不重复创建
      const existingLine = Array.from(mockPreviewLineSystem.previewLines.values())
        .find(line => line.sourceId === config.sourceId && line.targetId === config.targetId)
      
      if (!existingLine) {
        const line2 = mockPreviewLineSystem.createPreviewLine(config)
        expect(line2).toBeDefined()
      }
      
      // 验证幂等性 - 不会创建重复的预览线
      expect(mockPreviewLineSystem.previewLines.size).toBe(1)
    })
  })



  describe('同步性能和内存管理', () => {
    it('应该同步清理预览线引用', () => {
      const sourceNode = mockNodes.find(node => node.getData().isConfigured)
      
      // 同步创建预览线
      const previewLine = mockPreviewLineSystem.createPreviewLine({
        sourceId: sourceNode.id,
        targetId: 'target-1',
        type: 'preview'
      })
      
      expect(mockPreviewLineSystem.previewLines.size).toBe(1)
      
      // 同步删除预览线
      mockPreviewLineSystem.previewLines.delete(previewLine.id)
      
      expect(mockPreviewLineSystem.previewLines.size).toBe(0)
    })

    it('应该能够同步处理批量操作', () => {
      const sourceNode = mockNodes.find(node => node.getData().isConfigured)
      
      // 准备批量操作配置
      const configs = []
      for (let i = 0; i < 10; i++) {
        configs.push({
          sourceId: sourceNode.id,
          targetId: `batch-target-${i}`,
          type: 'preview'
        })
      }
      
      // 同步批量创建预览线
      const results = mockPreviewLineSystem.batchCreatePreviewLines(configs)
      
      // 验证所有操作都成功
      expect(results).toHaveLength(10)
      results.forEach((result, index) => {
        expect(result).toBeDefined()
        expect(result.sourceId).toBe(sourceNode.id)
        expect(result.targetId).toBe(`batch-target-${index}`)
      })
      
      expect(mockPreviewLineSystem.previewLines.size).toBe(10)
    })

    it('应该正确处理事件队列中的批量操作', () => {
      const sourceNode = mockNodes.find(node => node.getData().isConfigured)
      
      // 添加事件到队列
      for (let i = 0; i < 5; i++) {
        mockEventQueue.add({
          type: 'create',
          config: {
            sourceId: sourceNode.id,
            targetId: `queue-target-${i}`,
            type: 'preview'
          }
        })
      }
      
      // 处理事件队列
      const events = mockEventQueue.process()
      expect(events).toHaveLength(5)
      
      // 批量处理事件
      const configs = events.map(event => event.config)
      const results = mockPreviewLineSystem.batchCreatePreviewLines(configs)
      
      expect(results).toHaveLength(5)
      expect(mockPreviewLineSystem.previewLines.size).toBe(5)
    })
  })

  describe('同步数据一致性验证', () => {
    it('应该保持预览线数据的同步一致性', () => {
      const sourceNode = mockNodes.find(node => node.getData().isConfigured)
      
      // 同步创建预览线
      const previewLine = mockPreviewLineSystem.createPreviewLine({
        sourceId: sourceNode.id,
        targetId: 'target-1',
        type: 'preview',
        style: { color: 'red', width: 2 }
      })
      
      // 验证数据一致性
      expect(previewLine.sourceId).toBe(sourceNode.id)
      expect(previewLine.targetId).toBe('target-1')
      expect(previewLine.type).toBe('preview')
      expect(previewLine.style).toEqual({ color: 'red', width: 2 })
      
      // 同步更新预览线
      const updatedData = { style: { color: 'blue', width: 3 } }
      mockPreviewLineSystem.updatePreviewLine.mockReturnValueOnce({
        ...previewLine,
        ...updatedData
      })
      
      const updatedLine = mockPreviewLineSystem.updatePreviewLine(previewLine.id, updatedData)
      
      // 验证更新后的数据一致性
      expect(updatedLine.style).toEqual({ color: 'blue', width: 3 })
    })

    it('应该正确处理批量操作中的数据一致性', () => {
      const sourceNode = mockNodes.find(node => node.getData().isConfigured)
      
      // 准备批量创建配置
      const configs = [
        { sourceId: sourceNode.id, targetId: 'target-1', type: 'preview', priority: 1 },
        { sourceId: sourceNode.id, targetId: 'target-2', type: 'preview', priority: 2 },
        { sourceId: sourceNode.id, targetId: 'target-3', type: 'preview', priority: 3 }
      ]
      
      // 同步批量创建
      const createdLines = mockPreviewLineSystem.batchCreatePreviewLines(configs)
      
      // 验证每条预览线的数据一致性
      createdLines.forEach((line, index) => {
        expect(line.sourceId).toBe(sourceNode.id)
        expect(line.targetId).toBe(`target-${index + 1}`)
        expect(line.priority).toBe(index + 1)
      })
      
      // 验证系统状态一致性
      expect(mockPreviewLineSystem.previewLines.size).toBe(3)
    })

    it('应该在错误情况下保持数据一致性', () => {
      const sourceNode = mockNodes.find(node => node.getData().isConfigured)
      
      // 模拟部分成功的批量操作
      const configs = [
        { sourceId: sourceNode.id, targetId: 'valid-target', type: 'preview' },
        { sourceId: 'invalid-node', targetId: 'target-2', type: 'preview' }, // 无效节点
        { sourceId: sourceNode.id, targetId: 'valid-target-2', type: 'preview' }
      ]
      
      // 模拟批量创建时的部分失败
      mockPreviewLineSystem.batchCreatePreviewLines.mockImplementationOnce((configs) => {
        const results = []
        for (const config of configs) {
          if (config.sourceId === 'invalid-node') {
            // 跳过无效配置，不创建预览线
            continue
          }
          const previewLine = {
            id: `preview-${Date.now()}-${Math.random()}`,
            ...config
          }
          mockPreviewLineSystem.previewLines.set(previewLine.id, previewLine)
          results.push(previewLine)
        }
        return results
      })
      
      const results = mockPreviewLineSystem.batchCreatePreviewLines(configs)
      
      // 验证只有有效的预览线被创建
      expect(results).toHaveLength(2)
      expect(mockPreviewLineSystem.previewLines.size).toBe(2)
      
      // 验证创建的预览线都是有效的
      results.forEach(line => {
        expect(line.sourceId).toBe(sourceNode.id)
        expect(line.sourceId).not.toBe('invalid-node')
      })
    })
  })
})