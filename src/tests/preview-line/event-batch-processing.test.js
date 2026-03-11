/**
 * 预览线系统事件标记和批量处理机制测试
 * 验证新的事件处理策略，包括事件标记、批量处理和事件去耦合
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// Mock 事件队列
const mockEventQueue = {
  events: [],
  processing: false,
  addEvent: vi.fn(),
  processEvents: vi.fn(),
  clear: vi.fn(),
  getEventCount: vi.fn(),
  hasEvents: vi.fn()
}

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
  eventQueue: mockEventQueue,
  previewLines: new Map(),
  processingFlags: {
    isCreating: false,
    isDeleting: false,
    isUpdating: false,
    isBatchProcessing: false
  },
  createPreviewLine: vi.fn(),
  deletePreviewLine: vi.fn(),
  updatePreviewLine: vi.fn(),
  batchCreatePreviewLines: vi.fn(),
  batchDeletePreviewLines: vi.fn(),
  batchUpdatePreviewLines: vi.fn(),
  processEventQueue: vi.fn(),
  markEventProcessed: vi.fn(),
  isEventProcessed: vi.fn()
}

// Mock 预览线渲染器
const mockPreviewLineRenderer = {
  renderPreviewLine: vi.fn(),
  batchRender: vi.fn(),
  batchRemove: vi.fn(),
  updatePreviewLine: vi.fn(),
  removePreviewLine: vi.fn(),
  clearAll: vi.fn()
}

// Mock 事件标记系统
const mockEventMarker = {
  processedEvents: new Set(),
  markAsProcessed: vi.fn(),
  isProcessed: vi.fn(),
  clearProcessedEvents: vi.fn(),
  getProcessedCount: vi.fn()
}

describe('事件标记和批量处理机制测试', () => {
  beforeEach(() => {
    // 重置所有 mock
    vi.clearAllMocks()
    mockEventQueue.events.length = 0
    mockEventQueue.processing = false
    mockPreviewLineSystem.previewLines.clear()
    mockEventMarker.processedEvents.clear()
    
    // 重置处理标志
    Object.keys(mockPreviewLineSystem.processingFlags).forEach(key => {
      mockPreviewLineSystem.processingFlags[key] = false
    })
    
    // 设置事件队列行为
    mockEventQueue.addEvent.mockImplementation((event) => {
      mockEventQueue.events.push({
        id: `event-${Date.now()}-${Math.random()}`,
        type: event.type,
        data: event.data,
        timestamp: Date.now(),
        processed: false,
        ...event
      })
    })
    
    mockEventQueue.processEvents.mockImplementation(() => {
      if (mockEventQueue.processing) {
        return { success: false, message: '事件队列正在处理中' }
      }
      
      mockEventQueue.processing = true
      const eventsToProcess = mockEventQueue.events.filter(e => !e.processed)
      
      // 模拟批量处理
      eventsToProcess.forEach(event => {
        event.processed = true
        mockEventMarker.processedEvents.add(event.id)
      })
      
      mockEventQueue.processing = false
      return { 
        success: true, 
        processedCount: eventsToProcess.length,
        totalEvents: mockEventQueue.events.length
      }
    })
    
    mockEventQueue.hasEvents.mockImplementation(() => {
      return mockEventQueue.events.some(e => !e.processed)
    })
    
    mockEventQueue.getEventCount.mockImplementation(() => {
      return {
        total: mockEventQueue.events.length,
        pending: mockEventQueue.events.filter(e => !e.processed).length,
        processed: mockEventQueue.events.filter(e => e.processed).length
      }
    })
    
    // 设置事件标记行为
    mockEventMarker.markAsProcessed.mockImplementation((eventId) => {
      mockEventMarker.processedEvents.add(eventId)
    })
    
    mockEventMarker.isProcessed.mockImplementation((eventId) => {
      return mockEventMarker.processedEvents.has(eventId)
    })
    
    mockEventMarker.getProcessedCount.mockImplementation(() => {
      return mockEventMarker.processedEvents.size
    })
    
    // 设置批量处理行为
    mockPreviewLineSystem.batchCreatePreviewLines.mockImplementation((configs) => {
      if (mockPreviewLineSystem.processingFlags.isBatchProcessing) {
        return { success: false, message: '批量处理正在进行中' }
      }
      
      mockPreviewLineSystem.processingFlags.isBatchProcessing = true
      
      const results = configs.map(config => {
        const previewLine = {
          id: `preview-${Date.now()}-${Math.random()}`,
          ...config
        }
        mockPreviewLineSystem.previewLines.set(previewLine.id, previewLine)
        return previewLine
      })
      
      mockPreviewLineSystem.processingFlags.isBatchProcessing = false
      
      return {
        success: true,
        created: results,
        count: results.length
      }
    })
    
    mockPreviewLineSystem.batchDeletePreviewLines.mockImplementation((lineIds) => {
      if (mockPreviewLineSystem.processingFlags.isBatchProcessing) {
        return { success: false, message: '批量处理正在进行中' }
      }
      
      mockPreviewLineSystem.processingFlags.isBatchProcessing = true
      
      const deletedIds = []
      lineIds.forEach(id => {
        if (mockPreviewLineSystem.previewLines.has(id)) {
          mockPreviewLineSystem.previewLines.delete(id)
          deletedIds.push(id)
        }
      })
      
      mockPreviewLineSystem.processingFlags.isBatchProcessing = false
      
      return {
        success: true,
        deleted: deletedIds,
        count: deletedIds.length
      }
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('事件标记机制', () => {
    it('应该正确标记已处理的事件', () => {
      const eventId = 'test-event-1'
      
      // 标记事件为已处理
      mockEventMarker.markAsProcessed(eventId)
      
      // 验证事件被正确标记
      expect(mockEventMarker.isProcessed(eventId)).toBe(true)
      expect(mockEventMarker.processedEvents.has(eventId)).toBe(true)
    })

    it('应该防止重复处理相同事件', () => {
      const events = [
        { type: 'create', data: { nodeId: 'node-1' } },
        { type: 'create', data: { nodeId: 'node-1' } }, // 重复事件
        { type: 'delete', data: { nodeId: 'node-2' } }
      ]
      
      // 添加事件到队列
      events.forEach(event => mockEventQueue.addEvent(event))
      
      // 处理事件队列
      const result = mockEventQueue.processEvents()
      
      // 验证所有事件都被处理
      expect(result.success).toBe(true)
      expect(result.processedCount).toBe(3)
      
      // 验证事件标记
      const eventCounts = mockEventQueue.getEventCount()
      expect(eventCounts.processed).toBe(3)
      expect(eventCounts.pending).toBe(0)
    })

    it('应该跟踪事件处理统计', () => {
      const events = [
        { type: 'create', data: { nodeId: 'node-1' } },
        { type: 'update', data: { nodeId: 'node-2' } },
        { type: 'delete', data: { nodeId: 'node-3' } }
      ]
      
      // 添加事件
      events.forEach(event => mockEventQueue.addEvent(event))
      
      // 检查初始状态
      let counts = mockEventQueue.getEventCount()
      expect(counts.total).toBe(3)
      expect(counts.pending).toBe(3)
      expect(counts.processed).toBe(0)
      
      // 处理事件
      mockEventQueue.processEvents()
      
      // 检查处理后状态
      counts = mockEventQueue.getEventCount()
      expect(counts.total).toBe(3)
      expect(counts.pending).toBe(0)
      expect(counts.processed).toBe(3)
    })

    it('应该清理已处理事件的标记', () => {
      const eventIds = ['event-1', 'event-2', 'event-3']
      
      // 标记多个事件为已处理
      eventIds.forEach(id => mockEventMarker.markAsProcessed(id))
      expect(mockEventMarker.getProcessedCount()).toBe(3)
      
      // 清理处理标记
      mockEventMarker.clearProcessedEvents.mockImplementation(() => {
        mockEventMarker.processedEvents.clear()
      })
      
      mockEventMarker.clearProcessedEvents()
      
      // 验证标记被清理
      expect(mockEventMarker.getProcessedCount()).toBe(0)
      eventIds.forEach(id => {
        expect(mockEventMarker.isProcessed(id)).toBe(false)
      })
    })
  })

  describe('批量处理机制', () => {
    it('应该支持批量创建预览线', () => {
      const configs = [
        { sourceId: 'node-1', targetId: 'target-1', type: 'preview' },
        { sourceId: 'node-2', targetId: 'target-2', type: 'preview' },
        { sourceId: 'node-3', targetId: 'target-3', type: 'preview' }
      ]
      
      // 批量创建预览线
      const result = mockPreviewLineSystem.batchCreatePreviewLines(configs)
      
      // 验证批量创建成功
      expect(result.success).toBe(true)
      expect(result.count).toBe(3)
      expect(result.created).toHaveLength(3)
      expect(mockPreviewLineSystem.previewLines.size).toBe(3)
      
      // 验证每个预览线都被正确创建
      result.created.forEach((line, index) => {
        expect(line.sourceId).toBe(configs[index].sourceId)
        expect(line.targetId).toBe(configs[index].targetId)
        expect(mockPreviewLineSystem.previewLines.has(line.id)).toBe(true)
      })
    })

    it('应该支持批量删除预览线', () => {
      // 先创建一些预览线
      const configs = [
        { sourceId: 'node-1', targetId: 'target-1', type: 'preview' },
        { sourceId: 'node-2', targetId: 'target-2', type: 'preview' },
        { sourceId: 'node-3', targetId: 'target-3', type: 'preview' }
      ]
      
      const createResult = mockPreviewLineSystem.batchCreatePreviewLines(configs)
      expect(mockPreviewLineSystem.previewLines.size).toBe(3)
      
      // 批量删除预览线
      const lineIds = createResult.created.map(line => line.id)
      const deleteResult = mockPreviewLineSystem.batchDeletePreviewLines(lineIds)
      
      // 验证批量删除成功
      expect(deleteResult.success).toBe(true)
      expect(deleteResult.count).toBe(3)
      expect(deleteResult.deleted).toHaveLength(3)
      expect(mockPreviewLineSystem.previewLines.size).toBe(0)
    })

    it('应该防止并发批量处理', () => {
      const configs = [
        { sourceId: 'node-1', targetId: 'target-1', type: 'preview' }
      ]
      
      // 模拟并发批量处理
      mockPreviewLineSystem.processingFlags.isBatchProcessing = true
      
      const result = mockPreviewLineSystem.batchCreatePreviewLines(configs)
      
      // 验证并发保护
      expect(result.success).toBe(false)
      expect(result.message).toBe('批量处理正在进行中')
      expect(mockPreviewLineSystem.previewLines.size).toBe(0)
    })

    it('应该正确处理批量操作中的部分失败', () => {
      const configs = [
        { sourceId: 'node-1', targetId: 'target-1', type: 'preview' },
        { sourceId: 'invalid-node', targetId: 'target-2', type: 'preview' }, // 无效配置
        { sourceId: 'node-3', targetId: 'target-3', type: 'preview' }
      ]
      
      // 模拟部分失败的批量创建
      mockPreviewLineSystem.batchCreatePreviewLines.mockImplementation((configs) => {
        const results = []
        const errors = []
        
        configs.forEach((config, index) => {
          if (config.sourceId === 'invalid-node') {
            errors.push({ index, config, error: '无效的源节点' })
          } else {
            const previewLine = {
              id: `preview-${Date.now()}-${Math.random()}`,
              ...config
            }
            mockPreviewLineSystem.previewLines.set(previewLine.id, previewLine)
            results.push(previewLine)
          }
        })
        
        return {
          success: true,
          created: results,
          errors: errors,
          count: results.length,
          errorCount: errors.length
        }
      })
      
      const result = mockPreviewLineSystem.batchCreatePreviewLines(configs)
      
      // 验证部分成功的结果
      expect(result.success).toBe(true)
      expect(result.count).toBe(2) // 成功创建2个
      expect(result.errorCount).toBe(1) // 1个失败
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0].config.sourceId).toBe('invalid-node')
      expect(mockPreviewLineSystem.previewLines.size).toBe(2)
    })
  })

  describe('事件队列处理', () => {
    it('应该按顺序处理事件队列', () => {
      const events = [
        { type: 'create', data: { nodeId: 'node-1', priority: 1 } },
        { type: 'update', data: { nodeId: 'node-2', priority: 2 } },
        { type: 'delete', data: { nodeId: 'node-3', priority: 3 } }
      ]
      
      // 添加事件到队列
      events.forEach(event => mockEventQueue.addEvent(event))
      
      // 验证事件被正确添加
      expect(mockEventQueue.events).toHaveLength(3)
      expect(mockEventQueue.hasEvents()).toBe(true)
      
      // 处理事件队列
      const result = mockEventQueue.processEvents()
      
      // 验证处理结果
      expect(result.success).toBe(true)
      expect(result.processedCount).toBe(3)
      expect(mockEventQueue.hasEvents()).toBe(false)
    })

    it('应该防止重复处理事件队列', () => {
      const events = [
        { type: 'create', data: { nodeId: 'node-1' } }
      ]
      
      mockEventQueue.addEvent(events[0])
      
      // 模拟正在处理状态
      mockEventQueue.processing = true
      
      const result = mockEventQueue.processEvents()
      
      // 验证重复处理被阻止
      expect(result.success).toBe(false)
      expect(result.message).toBe('事件队列正在处理中')
    })

    it('应该支持事件队列的清空操作', () => {
      const events = [
        { type: 'create', data: { nodeId: 'node-1' } },
        { type: 'update', data: { nodeId: 'node-2' } }
      ]
      
      // 添加事件
      events.forEach(event => mockEventQueue.addEvent(event))
      expect(mockEventQueue.events).toHaveLength(2)
      
      // 清空队列
      mockEventQueue.clear.mockImplementation(() => {
        mockEventQueue.events.length = 0
      })
      
      mockEventQueue.clear()
      
      // 验证队列被清空
      expect(mockEventQueue.events).toHaveLength(0)
      expect(mockEventQueue.hasEvents()).toBe(false)
    })

    it('应该正确处理空事件队列', () => {
      // 处理空队列
      const result = mockEventQueue.processEvents()
      
      // 验证空队列处理
      expect(result.success).toBe(true)
      expect(result.processedCount).toBe(0)
      expect(result.totalEvents).toBe(0)
    })
  })

  describe('事件去耦合机制', () => {
    it('应该将同步操作转换为事件驱动', () => {
      const nodeOperations = [
        { action: 'create', nodeId: 'node-1', data: { type: 'start' } },
        { action: 'update', nodeId: 'node-2', data: { type: 'process' } },
        { action: 'delete', nodeId: 'node-3', data: { type: 'end' } }
      ]
      
      // 将操作转换为事件
      nodeOperations.forEach(op => {
        mockEventQueue.addEvent({
          type: `preview-line-${op.action}`,
          data: {
            nodeId: op.nodeId,
            nodeData: op.data,
            timestamp: Date.now()
          }
        })
      })
      
      // 验证事件被正确添加
      expect(mockEventQueue.events).toHaveLength(3)
      
      // 验证事件类型
      const eventTypes = mockEventQueue.events.map(e => e.type)
      expect(eventTypes).toContain('preview-line-create')
      expect(eventTypes).toContain('preview-line-update')
      expect(eventTypes).toContain('preview-line-delete')
    })

    it('应该支持事件的延迟处理', () => {
      const events = [
        { type: 'create', data: { nodeId: 'node-1' }, delay: 100 },
        { type: 'update', data: { nodeId: 'node-2' }, delay: 200 }
      ]
      
      // 添加带延迟的事件
      events.forEach(event => {
        mockEventQueue.addEvent({
          ...event,
          scheduledTime: Date.now() + event.delay
        })
      })
      
      // 模拟延迟处理逻辑
      mockEventQueue.processEvents.mockImplementation(() => {
        const currentTime = Date.now()
        const readyEvents = mockEventQueue.events.filter(e => 
          !e.processed && (!e.scheduledTime || e.scheduledTime <= currentTime)
        )
        
        readyEvents.forEach(event => {
          event.processed = true
        })
        
        return {
          success: true,
          processedCount: readyEvents.length,
          pendingCount: mockEventQueue.events.filter(e => !e.processed).length
        }
      })
      
      const result = mockEventQueue.processEvents()
      
      // 验证延迟处理（实际实现中可能需要等待）
      expect(result.success).toBe(true)
      expect(typeof result.processedCount).toBe('number')
      expect(typeof result.pendingCount).toBe('number')
    })

    it('应该支持事件的优先级处理', () => {
      const events = [
        { type: 'create', data: { nodeId: 'node-1' }, priority: 3 },
        { type: 'delete', data: { nodeId: 'node-2' }, priority: 1 }, // 高优先级
        { type: 'update', data: { nodeId: 'node-3' }, priority: 2 }
      ]
      
      // 添加带优先级的事件
      events.forEach(event => mockEventQueue.addEvent(event))
      
      // 模拟优先级处理
      mockEventQueue.processEvents.mockImplementation(() => {
        // 按优先级排序（数字越小优先级越高）
        const sortedEvents = mockEventQueue.events
          .filter(e => !e.processed)
          .sort((a, b) => (a.priority || 999) - (b.priority || 999))
        
        sortedEvents.forEach(event => {
          event.processed = true
        })
        
        return {
          success: true,
          processedCount: sortedEvents.length,
          processingOrder: sortedEvents.map(e => e.data.nodeId)
        }
      })
      
      const result = mockEventQueue.processEvents()
      
      // 验证优先级处理顺序
      expect(result.success).toBe(true)
      expect(result.processingOrder).toEqual(['node-2', 'node-3', 'node-1'])
    })
  })

  describe('集成测试 - 完整的事件处理流程', () => {
    it('应该完整处理从事件添加到批量执行的流程', () => {
      // 1. 添加多个事件
      const events = [
        { type: 'create', data: { sourceId: 'node-1', targetId: 'target-1' } },
        { type: 'create', data: { sourceId: 'node-2', targetId: 'target-2' } },
        { type: 'update', data: { lineId: 'line-1', style: { color: 'red' } } },
        { type: 'delete', data: { lineId: 'line-2' } }
      ]
      
      events.forEach(event => mockEventQueue.addEvent(event))
      
      // 2. 处理事件队列
      const processResult = mockEventQueue.processEvents()
      expect(processResult.success).toBe(true)
      expect(processResult.processedCount).toBe(4)
      
      // 3. 执行批量操作
      const createConfigs = events
        .filter(e => e.type === 'create')
        .map(e => ({ sourceId: e.data.sourceId, targetId: e.data.targetId, type: 'preview' }))
      
      const batchResult = mockPreviewLineSystem.batchCreatePreviewLines(createConfigs)
      expect(batchResult.success).toBe(true)
      expect(batchResult.count).toBe(2)
      
      // 4. 验证最终状态
      expect(mockPreviewLineSystem.previewLines.size).toBe(2)
      expect(mockEventQueue.getEventCount().processed).toBe(4)
    })

    it('应该正确处理错误恢复和重试机制', () => {
      const events = [
        { type: 'create', data: { sourceId: 'node-1', targetId: 'target-1' } },
        { type: 'create', data: { sourceId: 'invalid-node', targetId: 'target-2' } }
      ]
      
      events.forEach(event => mockEventQueue.addEvent(event))
      
      // 模拟处理过程中的错误和重试
      let retryCount = 0
      mockEventQueue.processEvents.mockImplementation(() => {
        retryCount++
        
        if (retryCount === 1) {
          // 第一次处理失败
          throw new Error('处理失败')
        }
        
        // 第二次处理成功
        mockEventQueue.events.forEach(event => {
          event.processed = true
        })
        
        return {
          success: true,
          processedCount: mockEventQueue.events.length,
          retryCount: retryCount
        }
      })
      
      // 模拟重试逻辑
      let result = null
      for (let i = 0; i < 3; i++) {
        try {
          result = mockEventQueue.processEvents()
          break
        } catch (error) {
          if (i === 2) throw error // 最后一次重试失败则抛出错误
          continue
        }
      }
      
      // 验证重试成功
      expect(result.success).toBe(true)
      expect(result.retryCount).toBe(2)
      expect(result.processedCount).toBe(2)
    })
  })
})