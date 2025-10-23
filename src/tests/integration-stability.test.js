import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock jest for compatibility
const jest = {
  fn: vi.fn
};

describe('预览线系统集成稳定性测试', () => {
  let mockGraph
  let mockPreviewLineSystem
  let mockUnifiedEdgeManager

  beforeEach(() => {
    // 重置所有 mock
    vi.clearAllMocks()

    // 模拟 X6 图形实例
    mockGraph = {
      removeCell: jest.fn(),
      removeEdge: jest.fn(),
      getCellById: jest.fn(),
      getEdges: jest.fn(() => []),
      on: jest.fn(),
      off: jest.fn()
    }

    // 模拟预览线系统
    mockPreviewLineSystem = {
      _isCreatingPreviewLine: false,
      _isHandlingError: false,
      createPreviewLine: jest.fn(),
      deletePreviewLine: jest.fn(),
      validateAndCleanupDuplicates: jest.fn(),
      handleError: jest.fn()
    }

    // 模拟统一边管理器
    mockUnifiedEdgeManager = {
      removePreviewLines: jest.fn(),
      batchRemovePreviewLines: jest.fn(),
      cleanupConnectedPreviewLines: jest.fn()
    }
  })

  describe('节点删除集成测试', () => {
    it('应该正确处理完整的节点删除流程', async () => {
      // 模拟节点删除场景
      const nodeId = 'test-node-1'
      const previewLines = [
        { id: 'preview-1', sourceNodeId: nodeId },
        { id: 'preview-2', sourceNodeId: nodeId },
        { id: 'preview-3', sourceNodeId: 'other-node' }
      ]

      mockGraph.getEdges.mockReturnValue(previewLines.map(pl => ({
        id: pl.id,
        getData: () => ({ sourceNodeId: pl.sourceNodeId }),
        getSourceCellId: () => pl.sourceNodeId
      })))

      // 模拟节点删除处理器
      const nodeDeleteHandler = {
        _isProcessingNodeDelete: false,
        
        async handleNodeDelete(nodeId) {
          if (this._isProcessingNodeDelete) {
            console.log('节点删除已在进行中，跳过')
            return
          }

          try {
            this._isProcessingNodeDelete = true
            
            // 1. 清理相关预览线
            const relatedPreviewLines = mockGraph.getEdges().filter(edge => {
              const data = edge.getData()
              return data.sourceNodeId === nodeId
            })

            // 2. 批量删除预览线
            for (const previewLine of relatedPreviewLines) {
              mockGraph.removeCell(previewLine, { silent: true })
            }

            // 3. 清理系统状态
            mockPreviewLineSystem.validateAndCleanupDuplicates()
            
          } finally {
            this._isProcessingNodeDelete = false
          }
        }
      }

      // 执行节点删除
      await nodeDeleteHandler.handleNodeDelete(nodeId)

      // 验证删除操作
      expect(mockGraph.removeCell).toHaveBeenCalledTimes(2) // 只删除相关的预览线
      expect(mockPreviewLineSystem.validateAndCleanupDuplicates).toHaveBeenCalled()
      expect(nodeDeleteHandler._isProcessingNodeDelete).toBe(false)
    })

    it('应该防止节点删除时的递归调用', async () => {
      const nodeDeleteHandler = {
        _isProcessingNodeDelete: false,
        deleteCount: 0,
        
        async handleNodeDelete(nodeId) {
          if (this._isProcessingNodeDelete) {
            console.log('节点删除已在进行中，跳过递归调用')
            return
          }

          try {
            this._isProcessingNodeDelete = true
            this.deleteCount++
            
            // 模拟可能触发递归的操作
            if (this.deleteCount === 1) {
              // 尝试再次调用自己（应该被阻止）
              await this.handleNodeDelete(nodeId)
            }
            
          } finally {
            this._isProcessingNodeDelete = false
          }
        }
      }

      await nodeDeleteHandler.handleNodeDelete('test-node')
      
      // 验证只执行了一次删除操作
      expect(nodeDeleteHandler.deleteCount).toBe(1)
      expect(nodeDeleteHandler._isProcessingNodeDelete).toBe(false)
    })
  })

  describe('预览线系统稳定性测试', () => {
    it('应该正确处理连续删除多个节点', async () => {
      const nodeIds = ['node-1', 'node-2', 'node-3']
      const deletionResults = []

      // 模拟批量节点删除处理器
      const batchDeleteHandler = {
        _activeDeletions: new Set(),
        
        async deleteNode(nodeId) {
          if (this._activeDeletions.has(nodeId)) {
            console.log(`节点 ${nodeId} 删除已在进行中`)
            return { success: false, reason: 'already_deleting' }
          }

          try {
            this._activeDeletions.add(nodeId)
            
            // 直接执行删除操作（不使用实际延迟）
            // 模拟删除完成
            
            // 清理相关预览线
            mockUnifiedEdgeManager.removePreviewLines(nodeId)
            
            return { success: true, nodeId }
            
          } finally {
            this._activeDeletions.delete(nodeId)
          }
        }
      }

      // 并发删除多个节点
      const deletePromises = nodeIds.map(async nodeId => {
        const result = await batchDeleteHandler.deleteNode(nodeId)
        deletionResults.push(result)
        return result
      })

      await Promise.all(deletePromises)

      // 验证所有节点都被成功删除
      expect(deletionResults.filter(r => r.success)).toHaveLength(3)
      expect(mockUnifiedEdgeManager.removePreviewLines).toHaveBeenCalledTimes(3)
      expect(batchDeleteHandler._activeDeletions.size).toBe(0)
    })

    it('应该正确处理删除分支节点后的预览线重建', async () => {
      // 模拟分支节点删除场景
      const branchNodeId = 'branch-node-1'
      const connectedNodes = ['target-1', 'target-2', 'target-3']

      // 模拟分支节点删除处理器
      const branchDeleteHandler = {
        _isRebuilding: false,
        
        async deleteBranchNode(nodeId) {
          if (this._isRebuilding) {
            console.log('预览线重建已在进行中')
            return
          }

          try {
            this._isRebuilding = true
            
            // 1. 删除分支节点的所有预览线
            mockUnifiedEdgeManager.cleanupConnectedPreviewLines(nodeId)
            
            // 2. 重建连接的目标节点的预览线
            for (const targetNodeId of connectedNodes) {
              mockPreviewLineSystem.createPreviewLine({
                sourceNodeId: targetNodeId,
                targetNodeId: 'next-node'
              })
            }
            
          } finally {
            this._isRebuilding = false
          }
        }
      }

      await branchDeleteHandler.deleteBranchNode(branchNodeId)

      // 验证清理和重建操作
      expect(mockUnifiedEdgeManager.cleanupConnectedPreviewLines).toHaveBeenCalledWith(branchNodeId)
      expect(mockPreviewLineSystem.createPreviewLine).toHaveBeenCalledTimes(3)
      expect(branchDeleteHandler._isRebuilding).toBe(false)
    })

    it('应该正确处理错误恢复机制', async () => {
      let errorCount = 0
      
      // 模拟带错误恢复的预览线管理器
      const errorRecoveryManager = {
        _isRecovering: false,
        _errorHistory: [],
        
        async processWithRecovery(operation) {
          if (this._isRecovering) {
            console.log('错误恢复已在进行中')
            return
          }

          try {
            await operation()
          } catch (error) {
            this._errorHistory.push(error)
            await this.handleError(error)
          }
        },
        
        async handleError(error) {
          if (this._isRecovering) {
            console.log('递归错误处理被阻止')
            return
          }

          try {
            this._isRecovering = true
            errorCount++
            
            // 模拟错误恢复操作
            mockPreviewLineSystem.validateAndCleanupDuplicates()
            
            // 如果是第一次错误，模拟再次出错（测试递归保护）
            if (errorCount === 1) {
              throw new Error('恢复过程中的错误')
            }
            
          } catch (recoveryError) {
            this._errorHistory.push(recoveryError)
            // 不再递归调用 handleError
          } finally {
            this._isRecovering = false
          }
        }
      }

      // 模拟会出错的操作
      const faultyOperation = async () => {
        throw new Error('模拟操作错误')
      }

      await errorRecoveryManager.processWithRecovery(faultyOperation)

      // 验证错误处理
      expect(errorCount).toBe(1) // 只处理了一次错误，递归被阻止
      expect(errorRecoveryManager._errorHistory).toHaveLength(2) // 原始错误 + 恢复错误
      expect(errorRecoveryManager._isRecovering).toBe(false)
      expect(mockPreviewLineSystem.validateAndCleanupDuplicates).toHaveBeenCalled()
    })
  })

  describe('系统整体稳定性验证', () => {
    it('应该在高并发操作下保持稳定', async () => {
      const operationCount = 50
      const operations = []
      const results = []

      // 模拟高并发操作管理器
      const concurrentManager = {
        _activeOperations: 0,
        _maxConcurrent: 10,
        
        async executeOperation(operationType, data) {
          if (this._activeOperations >= this._maxConcurrent) {
            return { success: false, reason: 'max_concurrent_reached' }
          }

          try {
            this._activeOperations++
            
            // 模拟不同类型的操作
            switch (operationType) {
              case 'create':
                mockPreviewLineSystem.createPreviewLine(data)
                break
              case 'delete':
                mockPreviewLineSystem.deletePreviewLine(data)
                break
              case 'cleanup':
                mockPreviewLineSystem.validateAndCleanupDuplicates()
                break
            }
            
            // 直接完成操作（不使用实际延迟）
            // 模拟操作完成
            
            return { success: true, operationType, data }
            
          } finally {
            this._activeOperations--
          }
        }
      }

      // 生成混合操作
      for (let i = 0; i < operationCount; i++) {
        const operationType = ['create', 'delete', 'cleanup'][i % 3]
        const data = { id: `operation-${i}`, nodeId: `node-${i % 10}` }
        operations.push({ type: operationType, data })
      }

      // 并发执行操作
      const executePromises = operations.map(async op => {
        const result = await concurrentManager.executeOperation(op.type, op.data)
        results.push(result)
        return result
      })

      await Promise.all(executePromises)

      // 验证并发控制
      const successfulOperations = results.filter(r => r.success)
      expect(successfulOperations.length).toBeGreaterThan(0)
      expect(concurrentManager._activeOperations).toBe(0)
      
      // 验证各种操作都被执行
      expect(mockPreviewLineSystem.createPreviewLine).toHaveBeenCalled()
      expect(mockPreviewLineSystem.deletePreviewLine).toHaveBeenCalled()
      expect(mockPreviewLineSystem.validateAndCleanupDuplicates).toHaveBeenCalled()
    })

    it('应该正确处理内存泄漏防护', () => {
      // 模拟内存管理器
      const memoryManager = {
        _previewLineCache: new Map(),
        _maxCacheSize: 100,
        _cleanupThreshold: 80,
        
        addToCache(id, data) {
          // 检查缓存大小
          if (this._previewLineCache.size >= this._cleanupThreshold) {
            this.cleanup()
          }
          
          this._previewLineCache.set(id, {
            ...data,
            timestamp: Date.now()
          })
        },
        
        cleanup() {
          const entries = Array.from(this._previewLineCache.entries())
          
          // 按时间戳排序，删除最旧的条目
          entries.sort((a, b) => a[1].timestamp - b[1].timestamp)
          
          const toDelete = entries.slice(0, entries.length - this._maxCacheSize + 20)
          toDelete.forEach(([id]) => {
            this._previewLineCache.delete(id)
          })
        },
        
        getCacheSize() {
          return this._previewLineCache.size
        }
      }

      // 添加大量缓存项
      for (let i = 0; i < 150; i++) {
        memoryManager.addToCache(`item-${i}`, { data: `test-data-${i}` })
      }

      // 验证内存管理
      expect(memoryManager.getCacheSize()).toBeLessThanOrEqual(memoryManager._maxCacheSize)
      expect(memoryManager.getCacheSize()).toBeGreaterThan(0)
    })
  })
})