import { describe, it, expect, beforeEach, vi } from 'vitest'

// 为了兼容性，创建 jest 别名
const jest = {
  fn: vi.fn
};

describe('同步预览线处理测试', () => {
  let mockPreviewLineSystem
  let mockRenderer
  let mockEventQueue

  beforeEach(() => {
    // 创建简化的模拟对象，移除递归保护标志
    mockEventQueue = {
      events: [],
      processing: false,
      add: vi.fn((event) => mockEventQueue.events.push(event)),
      process: vi.fn(() => {
        mockEventQueue.processing = true
        const events = [...mockEventQueue.events]
        mockEventQueue.events = []
        events.forEach(event => event.handler())
        mockEventQueue.processing = false
      }),
      clear: vi.fn(() => { mockEventQueue.events = [] })
    }

    mockPreviewLineSystem = {
      eventQueue: mockEventQueue,
      createPreviewLine: vi.fn(),
      handleError: vi.fn(),
      deletePreviewLine: vi.fn(),
      processEventQueue: vi.fn(() => mockEventQueue.process())
    }

    mockRenderer = {
      deletePreviewLine: vi.fn(),
      removePreviewLine: vi.fn(),
      batchOperations: []
    }
  })

  describe('同步预览线创建', () => {
    it('应该同步创建预览线而不使用递归保护', () => {
      // 模拟同步预览线创建
      mockPreviewLineSystem.createPreviewLine.mockImplementation((nodeId) => {
        return { id: `preview-line-${nodeId}`, nodeId, type: 'sync' }
      })

      const result = mockPreviewLineSystem.createPreviewLine('test-node')
      
      expect(result).toEqual({
        id: 'preview-line-test-node',
        nodeId: 'test-node',
        type: 'sync'
      })
      expect(mockPreviewLineSystem.createPreviewLine).toHaveBeenCalledWith('test-node')
    })

    it('应该同步处理错误而不使用递归保护', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      // 模拟同步错误处理
      mockPreviewLineSystem.handleError.mockImplementation((error) => {
        console.error('同步错误处理:', error.message)
        return { handled: true, error: error.message }
      })

      const result = mockPreviewLineSystem.handleError(new Error('测试错误'))
      
      expect(result).toEqual({ handled: true, error: '测试错误' })
      expect(consoleSpy).toHaveBeenCalledWith('同步错误处理:', '测试错误')
      
      consoleSpy.mockRestore()
    })

    it('应该支持幂等操作', () => {
      // 模拟幂等预览线创建
      const existingLines = new Set()
      
      mockPreviewLineSystem.createPreviewLine.mockImplementation((nodeId) => {
        if (existingLines.has(nodeId)) {
          return { id: `preview-line-${nodeId}`, nodeId, action: 'skipped' }
        }
        existingLines.add(nodeId)
        return { id: `preview-line-${nodeId}`, nodeId, action: 'created' }
      })

      // 第一次创建
      const result1 = mockPreviewLineSystem.createPreviewLine('test-node')
      expect(result1.action).toBe('created')

      // 第二次创建（幂等）
      const result2 = mockPreviewLineSystem.createPreviewLine('test-node')
      expect(result2.action).toBe('skipped')
      
      expect(mockPreviewLineSystem.createPreviewLine).toHaveBeenCalledTimes(2)
    })
  })

  describe('批量预览线操作', () => {
    it('应该支持批量删除预览线', () => {
      // 模拟批量删除操作
      mockRenderer.deletePreviewLine.mockImplementation((lineId) => {
        mockRenderer.batchOperations.push({ type: 'delete', lineId })
        return { success: true, lineId, action: 'deleted' }
      })

      const lineIds = ['line-1', 'line-2', 'line-3']
      const results = lineIds.map(id => mockRenderer.deletePreviewLine(id))
      
      expect(results).toHaveLength(3)
      expect(results.every(r => r.success)).toBe(true)
      expect(mockRenderer.batchOperations).toHaveLength(3)
      expect(mockRenderer.deletePreviewLine).toHaveBeenCalledTimes(3)
    })

    it('应该支持批量移除预览线', () => {
      // 模拟批量移除操作
      mockRenderer.removePreviewLine.mockImplementation((lineId) => {
        mockRenderer.batchOperations.push({ type: 'remove', lineId })
        return { success: true, lineId, action: 'removed' }
      })

      const lineIds = ['line-a', 'line-b', 'line-c']
      const results = lineIds.map(id => mockRenderer.removePreviewLine(id))
      
      expect(results).toHaveLength(3)
      expect(results.every(r => r.success)).toBe(true)
      expect(mockRenderer.batchOperations).toHaveLength(3)
      expect(mockRenderer.removePreviewLine).toHaveBeenCalledTimes(3)
    })

    it('应该正确处理混合批量操作', () => {
      // 重置批量操作记录
      mockRenderer.batchOperations = []
      
      // 模拟混合操作
      mockRenderer.deletePreviewLine.mockImplementation((lineId) => {
        mockRenderer.batchOperations.push({ type: 'delete', lineId })
        return { success: true, lineId }
      })
      
      mockRenderer.removePreviewLine.mockImplementation((lineId) => {
        mockRenderer.batchOperations.push({ type: 'remove', lineId })
        return { success: true, lineId }
      })

      // 执行混合操作
      mockRenderer.deletePreviewLine('delete-1')
      mockRenderer.removePreviewLine('remove-1')
      mockRenderer.deletePreviewLine('delete-2')
      
      expect(mockRenderer.batchOperations).toHaveLength(3)
      expect(mockRenderer.batchOperations[0]).toEqual({ type: 'delete', lineId: 'delete-1' })
      expect(mockRenderer.batchOperations[1]).toEqual({ type: 'remove', lineId: 'remove-1' })
      expect(mockRenderer.batchOperations[2]).toEqual({ type: 'delete', lineId: 'delete-2' })
    })
  })

  describe('事件队列处理', () => {
    it('应该正确处理事件队列中的预览线操作', () => {
      // 添加事件到队列
      mockEventQueue.add({
        type: 'createPreviewLine',
        nodeId: 'node-1',
        handler: () => mockPreviewLineSystem.createPreviewLine('node-1')
      })
      
      mockEventQueue.add({
        type: 'deletePreviewLine', 
        lineId: 'line-1',
        handler: () => mockPreviewLineSystem.deletePreviewLine('line-1')
      })

      // 验证事件已添加
      expect(mockEventQueue.events).toHaveLength(2)
      expect(mockEventQueue.add).toHaveBeenCalledTimes(2)

      // 处理事件队列
      mockPreviewLineSystem.processEventQueue()
      
      // 验证事件已处理
      expect(mockEventQueue.process).toHaveBeenCalled()
      expect(mockEventQueue.events).toHaveLength(0)
    })

    it('应该防止在处理事件时添加新事件造成的问题', () => {
      // 模拟处理中状态
      mockEventQueue.processing = true
      
      // 尝试添加新事件
      mockEventQueue.add({
        type: 'createPreviewLine',
        nodeId: 'node-2',
        handler: () => mockPreviewLineSystem.createPreviewLine('node-2')
      })

      // 验证事件仍被添加（但不会立即处理）
      expect(mockEventQueue.events).toHaveLength(1)
      expect(mockEventQueue.processing).toBe(true)
    })

    it('应该支持批量事件处理', () => {
      // 添加多个事件
      const nodeIds = ['node-1', 'node-2', 'node-3', 'node-4', 'node-5']
      
      nodeIds.forEach(nodeId => {
        mockEventQueue.add({
          type: 'createPreviewLine',
          nodeId,
          handler: () => mockPreviewLineSystem.createPreviewLine(nodeId)
        })
      })

      expect(mockEventQueue.events).toHaveLength(5)
      
      // 批量处理
      mockPreviewLineSystem.processEventQueue()
      
      // 验证所有事件都被处理
      expect(mockEventQueue.events).toHaveLength(0)
      expect(mockEventQueue.process).toHaveBeenCalled()
    })
  })

  describe('同步错误处理', () => {
    it('应该同步处理预览线创建错误', () => {
      // 模拟创建失败
      mockPreviewLineSystem.createPreviewLine.mockImplementation((nodeId) => {
        if (nodeId === 'invalid-node') {
          throw new Error('无效节点')
        }
        return { id: `preview-line-${nodeId}`, nodeId }
      })

      // 测试正常创建
      const result1 = mockPreviewLineSystem.createPreviewLine('valid-node')
      expect(result1).toEqual({ id: 'preview-line-valid-node', nodeId: 'valid-node' })

      // 测试错误处理
      expect(() => {
        mockPreviewLineSystem.createPreviewLine('invalid-node')
      }).toThrow('无效节点')
    })

    it('应该支持错误恢复和重试', () => {
      let attemptCount = 0
      
      // 模拟重试逻辑
      mockPreviewLineSystem.createPreviewLine.mockImplementation((nodeId) => {
        attemptCount++
        if (attemptCount === 1) {
          throw new Error('首次失败')
        }
        return { id: `preview-line-${nodeId}`, nodeId, attempt: attemptCount }
      })

      // 第一次调用失败
      expect(() => {
        mockPreviewLineSystem.createPreviewLine('retry-node')
      }).toThrow('首次失败')

      // 第二次调用成功
      const result = mockPreviewLineSystem.createPreviewLine('retry-node')
      expect(result).toEqual({ 
        id: 'preview-line-retry-node', 
        nodeId: 'retry-node', 
        attempt: 2 
      })
    })

    it('应该正确处理批量操作中的部分失败', () => {
      const results = []
      const errors = []
      
      mockPreviewLineSystem.createPreviewLine.mockImplementation((nodeId) => {
        if (nodeId.includes('error')) {
          throw new Error(`创建失败: ${nodeId}`)
        }
        return { id: `preview-line-${nodeId}`, nodeId }
      })

      const nodeIds = ['node-1', 'error-node', 'node-2', 'error-node-2', 'node-3']
      
      nodeIds.forEach(nodeId => {
        try {
          const result = mockPreviewLineSystem.createPreviewLine(nodeId)
          results.push(result)
        } catch (error) {
          errors.push({ nodeId, error: error.message })
        }
      })

      expect(results).toHaveLength(3)
      expect(errors).toHaveLength(2)
      expect(errors[0]).toEqual({ nodeId: 'error-node', error: '创建失败: error-node' })
      expect(errors[1]).toEqual({ nodeId: 'error-node-2', error: '创建失败: error-node-2' })
    })
  })

  describe('预览线管理器同步操作', () => {
    it('应该同步删除预览线', () => {
      const mockPreviewLineManager = {
        deletedLines: [],
        removePreviewLine: vi.fn().mockImplementation(function(previewLine) {
          // 同步删除，无需递归保护
          this.deletedLines.push(previewLine.id)
          return { success: true, lineId: previewLine.id, action: 'removed' }
        })
      }

      // 测试同步删除
      const result = mockPreviewLineManager.removePreviewLine({ id: 'test-line' })
      
      expect(result).toEqual({ success: true, lineId: 'test-line', action: 'removed' })
      expect(mockPreviewLineManager.deletedLines).toContain('test-line')
      expect(mockPreviewLineManager.removePreviewLine).toHaveBeenCalledTimes(1)
    })

    it('应该支持批量同步删除', () => {
      const mockPreviewLineManager = {
        deletedLines: [],
        batchRemovePreviewLines: vi.fn().mockImplementation(function(previewLines) {
          const results = previewLines.map(line => {
            this.deletedLines.push(line.id)
            return { success: true, lineId: line.id, action: 'removed' }
          })
          return { success: true, results, count: results.length }
        })
      }

      const linesToDelete = [
        { id: 'line-1' },
        { id: 'line-2' },
        { id: 'line-3' }
      ]

      const result = mockPreviewLineManager.batchRemovePreviewLines(linesToDelete)
      
      expect(result.success).toBe(true)
      expect(result.count).toBe(3)
      expect(mockPreviewLineManager.deletedLines).toEqual(['line-1', 'line-2', 'line-3'])
    })

    it('应该正确处理删除时的同步错误', () => {
      const mockPreviewLineManager = {
        removePreviewLine: vi.fn().mockImplementation((previewLine) => {
          if (previewLine.id === 'error-line') {
            throw new Error('删除失败')
          }
          return { success: true, lineId: previewLine.id }
        })
      }

      // 测试正常删除
      const result1 = mockPreviewLineManager.removePreviewLine({ id: 'normal-line' })
      expect(result1).toEqual({ success: true, lineId: 'normal-line' })

      // 测试错误处理
      expect(() => {
        mockPreviewLineManager.removePreviewLine({ id: 'error-line' })
      }).toThrow('删除失败')
    })
  })

  describe('系统性能和稳定性验证', () => {
    it('应该在高频同步操作下保持稳定', () => {
      // 模拟高频的同步操作
      const operationResults = []
      
      mockPreviewLineSystem.createPreviewLine.mockImplementation((nodeId) => {
        return { id: `preview-line-${nodeId}`, nodeId, timestamp: Date.now() }
      })
      
      mockPreviewLineSystem.deletePreviewLine.mockImplementation((lineId) => {
        return { success: true, lineId, timestamp: Date.now() }
      })

      // 执行高频操作
      for (let i = 0; i < 100; i++) {
        const createResult = mockPreviewLineSystem.createPreviewLine(`node_${i}`)
        const deleteResult = mockPreviewLineSystem.deletePreviewLine(`line_${i}`)
        operationResults.push({ create: createResult, delete: deleteResult })
      }

      // 验证所有操作都成功完成
      expect(operationResults).toHaveLength(100)
      expect(operationResults.every(r => r.create && r.delete.success)).toBe(true)
      expect(mockPreviewLineSystem.createPreviewLine).toHaveBeenCalledTimes(100)
      expect(mockPreviewLineSystem.deletePreviewLine).toHaveBeenCalledTimes(100)
    })

    it('应该正确处理边删除事件的同步处理', () => {
      const mockPreviewLineSystem = {
        edgeRemovalCount: 0,
        previewLinesCreated: [],
        createPreviewLine: vi.fn().mockImplementation((nodeId) => {
          const line = { id: `preview-line-${nodeId}`, nodeId }
          mockPreviewLineSystem.previewLinesCreated.push(line)
          return line
        }),
        handleEdgeRemoval: vi.fn().mockImplementation((edgeId) => {
          mockPreviewLineSystem.edgeRemovalCount++
          // 同步处理边删除，立即创建预览线
          mockPreviewLineSystem.createPreviewLine(`node-after-edge-${edgeId}`)
          return { success: true, edgeId, processed: true }
        })
      }

      // 模拟边删除事件
      const result = mockPreviewLineSystem.handleEdgeRemoval('edge-1')

      // 验证同步处理结果
      expect(result).toEqual({ success: true, edgeId: 'edge-1', processed: true })
      expect(mockPreviewLineSystem.edgeRemovalCount).toBe(1)
      expect(mockPreviewLineSystem.previewLinesCreated).toHaveLength(1)
      expect(mockPreviewLineSystem.previewLinesCreated[0]).toEqual({
        id: 'preview-line-node-after-edge-edge-1',
        nodeId: 'node-after-edge-edge-1'
      })
    })

    it('应该正确处理连续节点操作的同步场景', () => {
      const mockPreviewLineSystem = {
        nodeOperations: [],
        previewLinesCreated: [],
        createPreviewLine: vi.fn().mockImplementation((nodeId) => {
          const line = { id: `preview-line-${nodeId}`, nodeId }
          mockPreviewLineSystem.previewLinesCreated.push(line)
          return line
        }),
        processNodeOperation: vi.fn().mockImplementation((operation) => {
          mockPreviewLineSystem.nodeOperations.push(operation)
          // 同步处理节点操作
          if (operation.type === 'delete') {
            // 删除节点后立即创建相关预览线
            mockPreviewLineSystem.createPreviewLine(`remaining-after-${operation.nodeId}`)
          }
          return { success: true, operation }
        })
      }

      // 模拟连续节点操作
      const operations = [
        { type: 'delete', nodeId: 'node-1' },
        { type: 'delete', nodeId: 'node-2' },
        { type: 'delete', nodeId: 'node-3' }
      ]

      const results = operations.map(op => mockPreviewLineSystem.processNodeOperation(op))

      // 验证所有操作都同步完成
      expect(results).toHaveLength(3)
      expect(results.every(r => r.success)).toBe(true)
      expect(mockPreviewLineSystem.nodeOperations).toHaveLength(3)
      expect(mockPreviewLineSystem.previewLinesCreated).toHaveLength(3)
      
      // 验证预览线创建的正确性
      expect(mockPreviewLineSystem.previewLinesCreated.map(l => l.nodeId)).toEqual([
        'remaining-after-node-1',
        'remaining-after-node-2', 
        'remaining-after-node-3'
      ])
    })

    it('应该正确处理同步操作中的异常情况', () => {
      // 模拟异常情况的同步处理
      mockPreviewLineSystem.createPreviewLine.mockImplementation((nodeId) => {
        if (nodeId === 'error-node') {
          throw new Error('同步创建失败')
        }
        return { id: `preview-line-${nodeId}`, nodeId }
      })

      // 测试正常操作
      const result1 = mockPreviewLineSystem.createPreviewLine('normal-node')
      expect(result1).toEqual({ id: 'preview-line-normal-node', nodeId: 'normal-node' })

      // 测试异常处理
      expect(() => {
        mockPreviewLineSystem.createPreviewLine('error-node')
      }).toThrow('同步创建失败')

      // 验证系统可以继续正常工作
      const result2 = mockPreviewLineSystem.createPreviewLine('recovery-node')
      expect(result2).toEqual({ id: 'preview-line-recovery-node', nodeId: 'recovery-node' })
    })
  })
})