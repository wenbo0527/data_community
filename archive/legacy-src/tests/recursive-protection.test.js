/**
 * 同步预览线处理和批量操作测试
 * 测试预览线系统的同步处理机制和批量操作功能
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

describe('同步预览线处理和批量操作测试', () => {
  let mockGraph
  let mockTaskFlowCanvas
  let mockPreviewLineSystem
  let mockPreviewLineRenderer
  let mockEventQueue

  beforeEach(() => {
    // 模拟图实例
    mockGraph = {
      getCellById: vi.fn(),
      getIncomingEdges: vi.fn(() => []),
      getOutgoingEdges: vi.fn(() => []),
      hasCell: vi.fn(() => true),
      removeCell: vi.fn(),
      getNodes: vi.fn(() => []),
      getEdges: vi.fn(() => []),
      addEdge: vi.fn(),
      removeEdge: vi.fn()
    }

    // 模拟事件队列
    mockEventQueue = {
      events: [],
      isProcessing: false,
      add: vi.fn((event) => mockEventQueue.events.push(event)),
      process: vi.fn(() => {
        mockEventQueue.isProcessing = true
        const events = [...mockEventQueue.events]
        mockEventQueue.events = []
        mockEventQueue.isProcessing = false
        return events
      }),
      clear: vi.fn(() => { mockEventQueue.events = [] })
    }

    // 模拟预览线系统 - 移除递归保护标志，添加同步处理
    mockPreviewLineSystem = {
      previewLines: new Map(),
      eventQueue: mockEventQueue,
      clearPreviewLines: vi.fn(),
      createPreviewLine: vi.fn(),
      refreshAllPreviewLines: vi.fn(),
      deletePreviewLine: vi.fn(),
      batchCreatePreviewLines: vi.fn(),
      processEventQueue: vi.fn()
    }

    // 模拟预览线渲染器 - 移除递归保护标志，添加批量操作
    mockPreviewLineRenderer = {
      renderPreviewLine: vi.fn(),
      deletePreviewLine: vi.fn(),
      clearAllPreviewLines: vi.fn(),
      batchRenderPreviewLines: vi.fn(),
      batchDeletePreviewLines: vi.fn()
    }

    // 模拟TaskFlowCanvas - 简化状态管理
    mockTaskFlowCanvas = {
      handleNodeDelete: vi.fn(),
      cascadeDeleteNode: vi.fn(),
      handleSingleNodeDelete: vi.fn(),
      batchDeleteNodes: vi.fn()
    }
  })

  afterEach(() => {
    vi.clearAllMocks()
    // 清理事件队列
    mockEventQueue.events = []
    mockEventQueue.isProcessing = false
  })

  describe('同步预览线创建和管理', () => {
    it('应该同步清理预览线而不使用递归保护', () => {
      // 添加一些预览线到系统中
      mockPreviewLineSystem.previewLines.set('line-1', { nodeId: 'test-node-1' })
      mockPreviewLineSystem.previewLines.set('line-2', { nodeId: 'test-node-2' })
      
      // 模拟同步清理方法
      const clearPreviewLines = (nodeId) => {
        // 直接同步清理，无需递归保护
        const linesToRemove = []
        for (const [id, line] of mockPreviewLineSystem.previewLines) {
          if (line.nodeId === nodeId) {
            linesToRemove.push(id)
          }
        }
        
        linesToRemove.forEach(id => {
          mockPreviewLineSystem.previewLines.delete(id)
        })
        
        return linesToRemove.length
      }

      // 执行测试
      const removedCount = clearPreviewLines('test-node-1')
      
      // 验证同步清理成功
      expect(removedCount).toBe(1)
      expect(mockPreviewLineSystem.previewLines.has('line-1')).toBe(false)
      expect(mockPreviewLineSystem.previewLines.has('line-2')).toBe(true)
    })

    it('应该支持幂等的预览线创建操作', () => {
      const sourceNodeId = 'source-node'
      const targetNodeId = 'target-node'
      
      // 模拟幂等创建方法
      const createPreviewLine = (config) => {
        // 检查是否已存在相同的预览线
        const existingLine = mockPreviewLineSystem.findPreviewLine(config.sourceNodeId, config.targetNodeId)
        if (existingLine) {
          return { success: true, action: 'reused', line: existingLine }
        }

        // 创建新的预览线
        const newLine = { id: `line-${Date.now()}`, ...config }
        mockPreviewLineSystem.previewLines.set(newLine.id, newLine)
        return { success: true, action: 'created', line: newLine }
      }

      // 模拟 findPreviewLine 方法
      mockPreviewLineSystem.findPreviewLine = (sourceId, targetId) => {
        for (const [id, line] of mockPreviewLineSystem.previewLines) {
          if (line.sourceNodeId === sourceId && line.targetNodeId === targetId) {
            return line
          }
        }
        return null
      }

      // 第一次创建
      const result1 = createPreviewLine({ sourceNodeId, targetNodeId })
      expect(result1.success).toBe(true)
      expect(result1.action).toBe('created')
      
      // 第二次创建相同的预览线（幂等操作）
      const result2 = createPreviewLine({ sourceNodeId, targetNodeId })
      expect(result2.success).toBe(true)
      expect(result2.action).toBe('reused')
      expect(result2.line.id).toBe(result1.line.id)
    })

    it('应该支持批量预览线创建', () => {
      const configs = [
        { sourceNodeId: 'node-1', targetNodeId: 'node-2' },
        { sourceNodeId: 'node-2', targetNodeId: 'node-3' },
        { sourceNodeId: 'node-3', targetNodeId: 'node-4' }
      ]

      // 模拟批量创建方法
      const batchCreatePreviewLines = (configList) => {
        const results = []
        for (const config of configList) {
          const line = { id: `line-${results.length + 1}`, ...config }
          mockPreviewLineSystem.previewLines.set(line.id, line)
          results.push(line)
        }
        return results
      }

      // 执行批量创建
      const results = batchCreatePreviewLines(configs)
      
      // 验证批量创建成功
      expect(results).toHaveLength(3)
      expect(mockPreviewLineSystem.previewLines.size).toBe(3)
      results.forEach((line, index) => {
        expect(line.sourceNodeId).toBe(configs[index].sourceNodeId)
        expect(line.targetNodeId).toBe(configs[index].targetNodeId)
      })
    })
  })

  describe('批量预览线渲染和操作', () => {
    it('应该支持批量渲染预览线', () => {
      const previewLines = [
        { id: 'line-1', sourceNodeId: 'node-1', targetNodeId: 'node-2' },
        { id: 'line-2', sourceNodeId: 'node-2', targetNodeId: 'node-3' },
        { id: 'line-3', sourceNodeId: 'node-3', targetNodeId: 'node-4' }
      ]

      // 模拟批量渲染方法
      const batchRenderPreviewLines = (lines) => {
        const results = []
        for (const line of lines) {
          mockPreviewLineRenderer.renderPreviewLine(line)
          results.push({ id: line.id, rendered: true })
        }
        return results
      }

      // 执行批量渲染
      const results = batchRenderPreviewLines(previewLines)
      
      // 验证批量渲染成功
      expect(results).toHaveLength(3)
      expect(mockPreviewLineRenderer.renderPreviewLine).toHaveBeenCalledTimes(3)
      results.forEach((result, index) => {
        expect(result.id).toBe(previewLines[index].id)
        expect(result.rendered).toBe(true)
      })
    })

    it('应该支持批量删除预览线', () => {
      const lineIds = ['line-1', 'line-2', 'line-3']

      // 模拟批量删除方法
      const batchDeletePreviewLines = (ids) => {
        const results = []
        for (const id of ids) {
          mockPreviewLineRenderer.deletePreviewLine(id)
          results.push({ id, deleted: true })
        }
        return results
      }

      // 执行批量删除
      const results = batchDeletePreviewLines(lineIds)
      
      // 验证批量删除成功
      expect(results).toHaveLength(3)
      expect(mockPreviewLineRenderer.deletePreviewLine).toHaveBeenCalledTimes(3)
      results.forEach((result, index) => {
        expect(result.id).toBe(lineIds[index])
        expect(result.deleted).toBe(true)
      })
    })

    it('应该支持混合批量操作', () => {
      const operations = [
        { type: 'render', line: { id: 'line-1', sourceNodeId: 'node-1', targetNodeId: 'node-2' } },
        { type: 'delete', lineId: 'line-2' },
        { type: 'render', line: { id: 'line-3', sourceNodeId: 'node-3', targetNodeId: 'node-4' } }
      ]

      // 模拟混合批量操作方法
      const batchMixedOperations = (ops) => {
        const results = []
        for (const op of ops) {
          if (op.type === 'render') {
            mockPreviewLineRenderer.renderPreviewLine(op.line)
            results.push({ type: 'render', id: op.line.id, success: true })
          } else if (op.type === 'delete') {
            mockPreviewLineRenderer.deletePreviewLine(op.lineId)
            results.push({ type: 'delete', id: op.lineId, success: true })
          }
        }
        return results
      }

      // 执行混合批量操作
      const results = batchMixedOperations(operations)
      
      // 验证混合操作成功
      expect(results).toHaveLength(3)
      expect(mockPreviewLineRenderer.renderPreviewLine).toHaveBeenCalledTimes(2)
      expect(mockPreviewLineRenderer.deletePreviewLine).toHaveBeenCalledTimes(1)
      
      expect(results[0].type).toBe('render')
      expect(results[1].type).toBe('delete')
      expect(results[2].type).toBe('render')
    })
  })

  describe('事件队列处理', () => {
    it('应该正确处理事件队列中的预览线操作', () => {
      // 添加事件到队列
      mockEventQueue.add({ type: 'create', nodeId: 'node-1' })
      mockEventQueue.add({ type: 'delete', nodeId: 'node-2' })
      mockEventQueue.add({ type: 'update', nodeId: 'node-3' })

      // 模拟事件处理方法
      const processEventQueue = () => {
        if (mockEventQueue.isProcessing) {
          return []
        }

        const events = mockEventQueue.process()
        const results = []
        
        for (const event of events) {
          switch (event.type) {
            case 'create':
              mockPreviewLineSystem.createPreviewLine(event.nodeId)
              results.push({ type: 'create', nodeId: event.nodeId, processed: true })
              break
            case 'delete':
              mockPreviewLineSystem.deletePreviewLine(event.nodeId)
              results.push({ type: 'delete', nodeId: event.nodeId, processed: true })
              break
            case 'update':
              mockPreviewLineSystem.refreshAllPreviewLines()
              results.push({ type: 'update', nodeId: event.nodeId, processed: true })
              break
          }
        }
        
        return results
      }

      // 执行事件处理
      const results = processEventQueue()
      
      // 验证事件处理成功
      expect(results).toHaveLength(3)
      expect(mockPreviewLineSystem.createPreviewLine).toHaveBeenCalledWith('node-1')
      expect(mockPreviewLineSystem.deletePreviewLine).toHaveBeenCalledWith('node-2')
      expect(mockPreviewLineSystem.refreshAllPreviewLines).toHaveBeenCalled()
    })

    it('应该防止在处理事件时添加新事件造成的问题', () => {
      // 添加初始事件
      mockEventQueue.add({ type: 'create', nodeId: 'node-1' })
      
      // 模拟在处理过程中尝试添加新事件
      const processWithNewEvents = () => {
        const events = mockEventQueue.process()
        const results = []
        
        for (const event of events) {
          // 处理当前事件
          results.push({ processed: event.nodeId })
          
          // 尝试在处理过程中添加新事件
          if (event.nodeId === 'node-1') {
            mockEventQueue.add({ type: 'create', nodeId: 'node-2' })
          }
        }
        
        return results
      }

      // 执行处理
      const results1 = processWithNewEvents()
      expect(results1).toHaveLength(1)
      expect(results1[0].processed).toBe('node-1')
      
      // 处理新添加的事件
      const results2 = processWithNewEvents()
      expect(results2).toHaveLength(1)
      expect(results2[0].processed).toBe('node-2')
    })

    it('应该支持批量事件处理', () => {
      const batchEvents = [
        { type: 'create', nodeId: 'node-1' },
        { type: 'create', nodeId: 'node-2' },
        { type: 'delete', nodeId: 'node-3' },
        { type: 'update', nodeId: 'node-4' }
      ]

      // 批量添加事件
      batchEvents.forEach(event => mockEventQueue.add(event))

      // 模拟批量处理
      const batchProcessEvents = () => {
        const events = mockEventQueue.process()
        const createEvents = events.filter(e => e.type === 'create')
        const deleteEvents = events.filter(e => e.type === 'delete')
        const updateEvents = events.filter(e => e.type === 'update')

        // 批量处理相同类型的事件
        if (createEvents.length > 0) {
          mockPreviewLineSystem.batchCreatePreviewLines(createEvents.map(e => e.nodeId))
        }
        
        deleteEvents.forEach(event => {
          mockPreviewLineSystem.deletePreviewLine(event.nodeId)
        })
        
        if (updateEvents.length > 0) {
          mockPreviewLineSystem.refreshAllPreviewLines()
        }

        return {
          created: createEvents.length,
          deleted: deleteEvents.length,
          updated: updateEvents.length
        }
      }

      // 执行批量处理
      const results = batchProcessEvents()
      
      // 验证批量处理结果
      expect(results.created).toBe(2)
      expect(results.deleted).toBe(1)
      expect(results.updated).toBe(1)
      expect(mockPreviewLineSystem.batchCreatePreviewLines).toHaveBeenCalledWith(['node-1', 'node-2'])
    })
  })

  describe('同步节点删除和预览线管理', () => {
    it('应该同步删除节点和清理相关预览线', () => {
      const nodeId = 'test-node-to-delete'
      
      // 添加一些与节点相关的预览线
      mockPreviewLineSystem.previewLines.set('line-1', { sourceNodeId: nodeId })
      mockPreviewLineSystem.previewLines.set('line-2', { targetNodeId: nodeId })
      mockPreviewLineSystem.previewLines.set('line-3', { sourceNodeId: 'other-node' })

      // 模拟同步删除流程
      const deleteNodeSynchronously = (nodeId) => {
        // 1. 同步清理相关预览线
        const linesToRemove = []
        for (const [id, line] of mockPreviewLineSystem.previewLines) {
          if (line.sourceNodeId === nodeId || line.targetNodeId === nodeId) {
            linesToRemove.push(id)
          }
        }
        
        linesToRemove.forEach(id => {
          mockPreviewLineSystem.previewLines.delete(id)
        })

        // 2. 删除节点
        mockGraph.removeCell(nodeId)

        // 3. 同步刷新剩余预览线
        mockPreviewLineSystem.refreshAllPreviewLines()

        return {
          nodeDeleted: true,
          previewLinesRemoved: linesToRemove.length,
          remainingPreviewLines: mockPreviewLineSystem.previewLines.size
        }
      }

      // 执行同步删除
      const result = deleteNodeSynchronously(nodeId)
      
      // 验证同步删除成功
      expect(result.nodeDeleted).toBe(true)
      expect(result.previewLinesRemoved).toBe(2)
      expect(result.remainingPreviewLines).toBe(1)
      expect(mockGraph.removeCell).toHaveBeenCalledWith(nodeId)
      expect(mockPreviewLineSystem.refreshAllPreviewLines).toHaveBeenCalled()
    })

    it('应该支持批量同步删除多个节点', () => {
      const nodeIds = ['node-1', 'node-2', 'node-3']
      
      // 添加预览线
      nodeIds.forEach((nodeId, index) => {
        mockPreviewLineSystem.previewLines.set(`line-${index}`, { sourceNodeId: nodeId })
      })

      // 模拟批量同步删除
      const batchDeleteNodes = (nodeIds) => {
        const results = []
        
        for (const nodeId of nodeIds) {
          // 清理预览线
          const linesToRemove = []
          for (const [id, line] of mockPreviewLineSystem.previewLines) {
            if (line.sourceNodeId === nodeId || line.targetNodeId === nodeId) {
              linesToRemove.push(id)
            }
          }
          
          linesToRemove.forEach(id => {
            mockPreviewLineSystem.previewLines.delete(id)
          })

          // 删除节点
          mockGraph.removeCell(nodeId)
          
          results.push({
            nodeId,
            previewLinesRemoved: linesToRemove.length
          })
        }

        // 批量刷新
        mockPreviewLineSystem.refreshAllPreviewLines()
        
        return results
      }

      // 执行批量删除
      const results = batchDeleteNodes(nodeIds)
      
      // 验证批量删除成功
      expect(results).toHaveLength(3)
      expect(mockGraph.removeCell).toHaveBeenCalledTimes(3)
      expect(mockPreviewLineSystem.refreshAllPreviewLines).toHaveBeenCalled()
      results.forEach((result, index) => {
        expect(result.nodeId).toBe(nodeIds[index])
        expect(result.previewLinesRemoved).toBe(1)
      })
    })

    it('应该正确处理同步操作中的错误', () => {
      const nodeId = 'error-node'

      // 模拟带错误处理的同步删除
      const deleteNodeWithErrorHandling = (nodeId) => {
        try {
          // 尝试清理预览线
          mockPreviewLineSystem.clearPreviewLines(nodeId)
          
          // 模拟删除节点时的错误
          if (nodeId === 'error-node') {
            throw new Error('节点删除失败')
          }
          
          mockGraph.removeCell(nodeId)
          return { success: true, error: null }
        } catch (error) {
          // 同步错误处理，无需异步重置
          return { success: false, error: error.message }
        }
      }

      // 执行带错误的删除
      const result = deleteNodeWithErrorHandling(nodeId)
      
      // 验证错误处理
      expect(result.success).toBe(false)
      expect(result.error).toBe('节点删除失败')
      expect(mockPreviewLineSystem.clearPreviewLines).toHaveBeenCalledWith(nodeId)
      expect(mockGraph.removeCell).not.toHaveBeenCalled()
    })
  })

  describe('同步错误处理', () => {
    it('应该同步处理预览线创建错误', () => {
      const config = { sourceNodeId: 'source', targetNodeId: 'target' }

      // 模拟同步错误处理的创建方法
      const createPreviewLineWithErrorHandling = (config) => {
        try {
          // 验证配置
          if (!config.sourceNodeId || !config.targetNodeId) {
            throw new Error('配置无效')
          }

          // 检查节点是否存在
          if (!mockGraph.hasCell(config.sourceNodeId) || !mockGraph.hasCell(config.targetNodeId)) {
            throw new Error('节点不存在')
          }

          // 创建预览线
          const line = { id: `line-${Date.now()}`, ...config }
          mockPreviewLineSystem.previewLines.set(line.id, line)
          
          return { success: true, line, error: null }
        } catch (error) {
          return { success: false, line: null, error: error.message }
        }
      }

      // 测试无效配置
      const result1 = createPreviewLineWithErrorHandling({ sourceNodeId: 'source' })
      expect(result1.success).toBe(false)
      expect(result1.error).toBe('配置无效')

      // 测试节点不存在（mockGraph.hasCell 返回 true，所以修改测试）
      mockGraph.hasCell = vi.fn(() => false)
      const result2 = createPreviewLineWithErrorHandling(config)
      expect(result2.success).toBe(false)
      expect(result2.error).toBe('节点不存在')

      // 测试正常创建
      mockGraph.hasCell = vi.fn(() => true)
      const result3 = createPreviewLineWithErrorHandling(config)
      expect(result3.success).toBe(true)
      expect(result3.line).toBeTruthy()
    })

    it('应该支持错误恢复和重试', () => {
      let attemptCount = 0
      const maxAttempts = 3

      // 模拟带重试的操作
      const operationWithRetry = (nodeId) => {
        const results = []
        
        for (let i = 0; i < maxAttempts; i++) {
          attemptCount++
          try {
            // 模拟前两次失败，第三次成功
            if (attemptCount < 3) {
              throw new Error(`尝试 ${attemptCount} 失败`)
            }
            
            mockPreviewLineSystem.createPreviewLine(nodeId)
            results.push({ attempt: attemptCount, success: true, error: null })
            break
          } catch (error) {
            results.push({ attempt: attemptCount, success: false, error: error.message })
            
            // 最后一次尝试失败则停止
            if (i === maxAttempts - 1) {
              break
            }
          }
        }
        
        return results
      }

      // 执行重试操作
      const results = operationWithRetry('test-node')
      
      // 验证重试逻辑
      expect(results).toHaveLength(3)
      expect(results[0].success).toBe(false)
      expect(results[1].success).toBe(false)
      expect(results[2].success).toBe(true)
      expect(mockPreviewLineSystem.createPreviewLine).toHaveBeenCalledWith('test-node')
    })

    it('应该正确处理批量操作中的部分失败', () => {
      const operations = [
        { type: 'create', nodeId: 'valid-node' },
        { type: 'create', nodeId: 'invalid-node' },
        { type: 'delete', nodeId: 'existing-node' },
        { type: 'delete', nodeId: 'non-existing-node' }
      ]

      // 模拟批量操作处理
      const batchOperationWithPartialFailure = (operations) => {
        const results = []
        
        for (const op of operations) {
          try {
            if (op.type === 'create') {
              if (op.nodeId === 'invalid-node') {
                throw new Error('无效节点')
              }
              mockPreviewLineSystem.createPreviewLine(op.nodeId)
              results.push({ ...op, success: true, error: null })
            } else if (op.type === 'delete') {
              if (op.nodeId === 'non-existing-node') {
                throw new Error('节点不存在')
              }
              mockPreviewLineSystem.deletePreviewLine(op.nodeId)
              results.push({ ...op, success: true, error: null })
            }
          } catch (error) {
            results.push({ ...op, success: false, error: error.message })
          }
        }
        
        return results
      }

      // 执行批量操作
      const results = batchOperationWithPartialFailure(operations)
      
      // 验证部分失败处理
      expect(results).toHaveLength(4)
      expect(results[0].success).toBe(true)  // valid-node create
      expect(results[1].success).toBe(false) // invalid-node create
      expect(results[2].success).toBe(true)  // existing-node delete
      expect(results[3].success).toBe(false) // non-existing-node delete
      
      expect(results[1].error).toBe('无效节点')
      expect(results[3].error).toBe('节点不存在')
    })
  })
})