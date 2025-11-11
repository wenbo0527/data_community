/**
 * 人工搭建画布场景测试
 * 
 * 针对用户手动搭建画布的实际使用场景进行测试
 * 重点测试单个操作的响应速度和准确性
 * 
 * 测试覆盖：
 * - 单个预览线的创建和删除
 * - 预览线到连接线的转换
 * - 节点配置后的预览线自动创建
 * - 错误处理和边界情况
 * - 人工操作的性能优化
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import UnifiedEdgeManager from '../../pages/marketing/tasks/composables/canvas/unified/UnifiedEdgeManager.js'

describe('人工搭建画布场景测试', () => {
  let mockGraph
  let unifiedEdgeManager
  let mockNodes

  beforeEach(() => {
    // 创建模拟图实例
    mockGraph = {
      addEdge: vi.fn().mockReturnValue({ id: 'edge_123' }),
      removeEdge: vi.fn(),
      getEdges: vi.fn(() => []),
      getNodes: vi.fn(() => mockNodes),
      getNode: vi.fn((id) => mockNodes.find(n => n.id === id)),
      getCellById: vi.fn(),
      on: vi.fn(),
      off: vi.fn(),
      trigger: vi.fn(),
      toJSON: vi.fn(() => ({ cells: [] })),
      fromJSON: vi.fn(),
      clearCells: vi.fn(),
      addNode: vi.fn(),
      removeNode: vi.fn()
    }

    // 创建模拟节点
    mockNodes = [
      {
        id: 'start-node',
        shape: 'start-node',
        getPosition: () => ({ x: 100, y: 100 }),
        getSize: () => ({ width: 120, height: 80 }),
        getPorts: () => [{ id: 'out', group: 'out' }],
        getPort: (id) => ({ id, group: id === 'out' ? 'out' : 'in' })
      },
      {
        id: 'condition-node',
        shape: 'condition-node',
        getPosition: () => ({ x: 300, y: 100 }),
        getSize: () => ({ width: 120, height: 80 }),
        getPorts: () => [
          { id: 'in', group: 'in' },
          { id: 'out-yes', group: 'out' },
          { id: 'out-no', group: 'out' }
        ],
        getPort: (id) => ({ id, group: id === 'in' ? 'in' : 'out' })
      },
      {
        id: 'action-node',
        shape: 'action-node',
        getPosition: () => ({ x: 500, y: 100 }),
        getSize: () => ({ width: 120, height: 80 }),
        getPorts: () => [
          { id: 'in', group: 'in' },
          { id: 'out', group: 'out' }
        ],
        getPort: (id) => ({ id, group: id === 'in' ? 'in' : 'out' })
      }
    ]

    // 创建UnifiedEdgeManager实例
    unifiedEdgeManager = new UnifiedEdgeManager(mockGraph, {
      autoCleanup: true,
      performanceOptimization: true,
      problemDiagnosis: true,
      enableConnectionValidation: true,
      enableInPortSnap: true,
      enableBatchOperations: false // 人工搭建场景不需要批量操作
    })
  })

  afterEach(() => {
    if (unifiedEdgeManager) {
      unifiedEdgeManager.destroy()
      unifiedEdgeManager = null
    }
  })

  describe('单个预览线操作', () => {
    it('应该能够创建单个预览线', async () => {
      await unifiedEdgeManager.initialize()
      
      const result = await unifiedEdgeManager.createPreviewLine('start-node', {
        sourcePort: 'out',
        branchId: null
      })
      
      expect(result.success).toBe(true)
      expect(result.previewLineId).toBeDefined()
      
      // 验证预览线已被正确存储
      const previewLines = unifiedEdgeManager.getNodePreviewLines('start-node')
      expect(previewLines).toHaveLength(1)
    })

    it('应该能够删除单个预览线', async () => {
      await unifiedEdgeManager.initialize()
      
      // 先创建预览线
      const createResult = await unifiedEdgeManager.createPreviewLine('start-node')
      expect(createResult.success).toBe(true)
      
      // 删除预览线
      const deleteResult = await unifiedEdgeManager.removePreviewLine(createResult.previewLineId)
      expect(deleteResult.success).toBe(true)
      
      // 验证预览线已被删除
      const previewLines = unifiedEdgeManager.getNodePreviewLines('start-node')
      expect(previewLines).toHaveLength(0)
    })

    it('应该在单个操作中保持高性能', async () => {
      await unifiedEdgeManager.initialize()
      
      const startTime = performance.now()
      
      // 执行单个预览线创建操作
      const result = await unifiedEdgeManager.createPreviewLine('start-node')
      
      const endTime = performance.now()
      const duration = endTime - startTime
      
      // 单个操作应该在50ms内完成
      expect(duration).toBeLessThan(50)
      expect(result.success).toBe(true)
    })
  })

  describe('预览线到连接线转换', () => {
    it('应该能够将预览线转换为连接线', async () => {
      await unifiedEdgeManager.initialize()
      
      // 创建预览线
      const previewResult = await unifiedEdgeManager.createPreviewLine('start-node')
      expect(previewResult.success).toBe(true)
      
      // 转换为连接线
      const convertResult = await unifiedEdgeManager.convertPreviewToConnection(
        previewResult.previewLineId,
        'condition-node',
        { targetPort: 'in' }
      )
      
      expect(convertResult.success).toBe(true)
      
      // 验证预览线已被删除，连接线已创建
      const previewLines = unifiedEdgeManager.getNodePreviewLines('start-node')
      expect(previewLines).toHaveLength(0)
      
      const connections = unifiedEdgeManager.getNodeConnections('start-node')
      expect(connections).toHaveLength(1)
    })

    it('应该在转换过程中保持数据一致性', async () => {
      await unifiedEdgeManager.initialize()
      
      const previewResult = await unifiedEdgeManager.createPreviewLine('start-node')
      const originalStats = unifiedEdgeManager.getStats()
      
      const convertResult = await unifiedEdgeManager.convertPreviewToConnection(
        previewResult.previewLineId,
        'condition-node'
      )
      
      expect(convertResult.success).toBe(true)
      
      const newStats = unifiedEdgeManager.getStats()
      expect(newStats.totalPreviewLines).toBe(originalStats.totalPreviewLines - 1)
      expect(newStats.totalConnections).toBe(originalStats.totalConnections + 1)
    })
  })

  describe('节点配置后预览线自动创建', () => {
    it('应该在节点配置后自动创建预览线', async () => {
      await unifiedEdgeManager.initialize()
      
      // 模拟节点配置
      const nodeConfig = {
        nodeType: 'condition-node',
        branches: [
          { id: 'yes', label: '是', condition: 'value > 0' },
          { id: 'no', label: '否', condition: 'value <= 0' }
        ]
      }
      
      await unifiedEdgeManager.onNodeConfigured('condition-node', nodeConfig)
      
      // 验证预览线已自动创建
      const previewLines = unifiedEdgeManager.getNodePreviewLines('condition-node')
      expect(previewLines.length).toBeGreaterThan(0)
    })

    it('应该根据节点类型创建正确数量的预览线', async () => {
      await unifiedEdgeManager.initialize()
      
      // 测试分支节点配置
      const branchConfig = {
        nodeType: 'audience-split',
        branches: [
          { id: 'branch1', label: '分支1' },
          { id: 'branch2', label: '分支2' },
          { id: 'branch3', label: '分支3' }
        ]
      }
      
      await unifiedEdgeManager.onNodeConfigured('condition-node', branchConfig)
      
      const previewLines = unifiedEdgeManager.getNodePreviewLines('condition-node')
      expect(previewLines).toHaveLength(3) // 应该创建3条预览线
    })
  })

  describe('错误处理和边界情况', () => {
    it('应该正确处理无效节点ID', async () => {
      await unifiedEdgeManager.initialize()
      
      const result = await unifiedEdgeManager.createPreviewLine('invalid-node-id')
      
      expect(result.success).toBe(false)
      expect(result.error).toContain('节点不存在')
    })

    it('应该正确处理重复的预览线创建', async () => {
      await unifiedEdgeManager.initialize()
      
      // 创建第一条预览线
      const result1 = await unifiedEdgeManager.createPreviewLine('start-node')
      expect(result1.success).toBe(true)
      
      // 尝试创建重复的预览线
      const result2 = await unifiedEdgeManager.createPreviewLine('start-node')
      
      // 应该返回现有预览线或创建新的分支预览线
      expect(result2.success).toBe(true)
    })

    it('应该正确处理删除不存在的预览线', async () => {
      await unifiedEdgeManager.initialize()
      
      const result = await unifiedEdgeManager.removePreviewLine('non-existent-id')
      
      expect(result.success).toBe(false)
      expect(result.error).toContain('预览线不存在')
    })

    it('应该在图实例异常时优雅降级', async () => {
      // 模拟图实例异常
      mockGraph.addEdge = vi.fn().mockImplementation(() => {
        throw new Error('Graph instance error')
      })
      
      await unifiedEdgeManager.initialize()
      
      const result = await unifiedEdgeManager.createPreviewLine('start-node')
      
      expect(result.success).toBe(false)
      expect(result.error).toContain('Graph instance error')
    })
  })

  describe('人工操作性能优化', () => {
    it('应该优化单个操作的内存使用', async () => {
      await unifiedEdgeManager.initialize()
      
      const initialMemory = process.memoryUsage().heapUsed
      
      // 执行多个单个操作
      for (let i = 0; i < 10; i++) {
        const result = await unifiedEdgeManager.createPreviewLine(`node-${i}`)
        if (result.success) {
          await unifiedEdgeManager.removePreviewLine(result.previewLineId)
        }
      }
      
      // 强制垃圾回收（如果可用）
      if (global.gc) {
        global.gc()
      }
      
      const finalMemory = process.memoryUsage().heapUsed
      const memoryIncrease = finalMemory - initialMemory
      
      // 内存增长应该控制在合理范围内（1MB）
      expect(memoryIncrease).toBeLessThan(1024 * 1024)
    })

    it('应该优化缓存机制以提高响应速度', async () => {
      await unifiedEdgeManager.initialize()
      
      // 第一次操作（冷启动）
      const startTime1 = performance.now()
      await unifiedEdgeManager.createPreviewLine('start-node')
      const duration1 = performance.now() - startTime1
      
      // 清理
      await unifiedEdgeManager.clearAllPreviewLines()
      
      // 第二次操作（应该利用缓存）
      const startTime2 = performance.now()
      await unifiedEdgeManager.createPreviewLine('start-node')
      const duration2 = performance.now() - startTime2
      
      // 第二次操作应该更快（利用缓存）
      expect(duration2).toBeLessThanOrEqual(duration1)
    })

    it('应该在连续操作中保持稳定性能', async () => {
      await unifiedEdgeManager.initialize()
      
      const durations = []
      
      // 执行连续操作
      for (let i = 0; i < 5; i++) {
        const startTime = performance.now()
        const result = await unifiedEdgeManager.createPreviewLine(`node-${i}`)
        const duration = performance.now() - startTime
        
        durations.push(duration)
        
        if (result.success) {
          await unifiedEdgeManager.removePreviewLine(result.previewLineId)
        }
      }
      
      // 计算性能稳定性（标准差应该较小）
      const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length
      const variance = durations.reduce((acc, duration) => {
        return acc + Math.pow(duration - avgDuration, 2)
      }, 0) / durations.length
      const standardDeviation = Math.sqrt(variance)
      
      // 标准差应该小于平均值的50%，表示性能稳定
      expect(standardDeviation).toBeLessThan(avgDuration * 0.5)
    })
  })

  describe('实际使用场景模拟', () => {
    it('应该支持典型的工作流搭建场景', async () => {
      await unifiedEdgeManager.initialize()
      
      // 场景：用户创建一个简单的工作流
      // 1. 从开始节点创建预览线
      const preview1 = await unifiedEdgeManager.createPreviewLine('start-node')
      expect(preview1.success).toBe(true)
      
      // 2. 将预览线连接到条件节点
      const connection1 = await unifiedEdgeManager.convertPreviewToConnection(
        preview1.previewLineId,
        'condition-node'
      )
      expect(connection1.success).toBe(true)
      
      // 3. 配置条件节点，自动创建分支预览线
      await unifiedEdgeManager.onNodeConfigured('condition-node', {
        nodeType: 'condition-node',
        branches: [{ id: 'yes' }, { id: 'no' }]
      })
      
      // 4. 将一个分支连接到动作节点
      const conditionPreviewLines = unifiedEdgeManager.getNodePreviewLines('condition-node')
      expect(conditionPreviewLines.length).toBeGreaterThan(0)
      
      if (conditionPreviewLines.length > 0) {
        const connection2 = await unifiedEdgeManager.convertPreviewToConnection(
          conditionPreviewLines[0].id,
          'action-node'
        )
        expect(connection2.success).toBe(true)
      }
      
      // 验证最终状态
      const finalStats = unifiedEdgeManager.getStats()
      expect(finalStats.totalConnections).toBeGreaterThanOrEqual(2)
    })
  })
})