/**
 * UnifiedEdgeManager 节点位置自动同步功能测试
 * 测试节点位置变化时预览线和连接线的自动同步更新
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { UnifiedEdgeManager } from '../pages/marketing/tasks/composables/canvas/unified/UnifiedEdgeManager.js'

describe('UnifiedEdgeManager 节点位置自动同步测试', () => {
  let edgeManager
  let mockGraph
  let mockNode
  let mockPreviewLine
  let mockConnection

  beforeEach(() => {
    // 创建模拟图形对象
    mockGraph = {
      on: vi.fn(),
      off: vi.fn(),
      getCellById: vi.fn(),
      getEdges: vi.fn(() => []),
      trigger: vi.fn()
    }

    // 创建模拟节点
    mockNode = {
      id: 'test-node-1',
      getPosition: vi.fn(() => ({ x: 100, y: 100 })),
      getSize: vi.fn(() => ({ width: 120, height: 80 })),
      getPort: vi.fn()
    }

    // 创建模拟预览线
    mockPreviewLine = {
      id: 'preview-1',
      source: { nodeId: 'test-node-1', port: 'out-port' },
      graphInstance: {
        getSourcePoint: vi.fn(() => ({ x: 160, y: 140 })),
        setSource: vi.fn()
      }
    }

    // 创建模拟连接线
    mockConnection = {
      id: 'connection-1',
      source: { nodeId: 'test-node-1', port: 'out-port' },
      target: { nodeId: 'test-node-2', port: 'in-port' },
      graphInstance: {
        getSourcePoint: vi.fn(() => ({ x: 160, y: 140 })),
        getTargetPoint: vi.fn(() => ({ x: 300, y: 200 })),
        setSource: vi.fn(),
        setTarget: vi.fn()
      }
    }

    // 创建UnifiedEdgeManager实例
    edgeManager = new UnifiedEdgeManager(mockGraph, {
      debug: true,
      enableAutoSync: true
    })

    // 模拟初始化
    edgeManager.isInitialized.value = true
    
    // 添加测试数据
    edgeManager.previewLines.set('preview-1', mockPreviewLine)
    edgeManager.connections.set('connection-1', mockConnection)
  })

  afterEach(() => {
    if (edgeManager) {
      edgeManager.destroy()
    }
  })

  describe('事件监听器设置', () => {
    it('应该正确设置节点位置变化监听器', () => {
      edgeManager.setupNodePositionListeners()
      
      expect(mockGraph.on).toHaveBeenCalledWith('node:moved', expect.any(Function))
      expect(mockGraph.on).toHaveBeenCalledWith('node:change:position', expect.any(Function))
    })

    it('应该在destroy时正确清理监听器', () => {
      edgeManager.setupNodePositionListeners()
      edgeManager.destroy()
      
      expect(mockGraph.off).toHaveBeenCalledWith('node:moved', expect.any(Function))
      expect(mockGraph.off).toHaveBeenCalledWith('node:change:position', expect.any(Function))
    })
  })

  describe('节点移动事件处理', () => {
    beforeEach(() => {
      mockGraph.getCellById.mockReturnValue(mockNode)
      vi.spyOn(edgeManager, 'getNodePreviewLines').mockReturnValue([mockPreviewLine])
      vi.spyOn(edgeManager, 'getNodeConnections').mockReturnValue([mockConnection])
    })

    it('应该处理node:moved事件', async () => {
      const event = {
        node: {
          id: 'test-node-1',
          getPosition: () => ({ x: 200, y: 150 })
        }
      }

      vi.spyOn(edgeManager, 'syncNodeEdgesPosition').mockResolvedValue()

      await edgeManager.handleNodeMoved(event)

      expect(edgeManager.syncNodeEdgesPosition).toHaveBeenCalledWith(
        'test-node-1',
        { x: 200, y: 150 }
      )
    })

    it('应该处理node:change:position事件', async () => {
      const event = {
        node: {
          id: 'test-node-1',
          getPosition: () => ({ x: 200, y: 150 })
        }
      }

      vi.spyOn(edgeManager, 'syncNodeEdgesPosition').mockResolvedValue()

      await edgeManager.handleNodePositionChanged(event)

      expect(edgeManager.syncNodeEdgesPosition).toHaveBeenCalledWith(
        'test-node-1',
        { x: 200, y: 150 }
      )
    })
  })

  describe('边位置同步', () => {
    beforeEach(() => {
      mockGraph.getCellById.mockReturnValue(mockNode)
      vi.spyOn(edgeManager, 'getNodePreviewLines').mockReturnValue([mockPreviewLine])
      vi.spyOn(edgeManager, 'getNodeConnections').mockReturnValue([mockConnection])
      vi.spyOn(edgeManager, 'calculateEdgeSourcePosition').mockReturnValue({ x: 220, y: 190 })
      vi.spyOn(edgeManager, 'calculateEdgeTargetPosition').mockReturnValue({ x: 320, y: 250 })
      vi.spyOn(edgeManager, 'hasPositionChanged').mockReturnValue(true)
      vi.spyOn(edgeManager, 'emit')
    })

    it('应该同步预览线位置', async () => {
      await edgeManager.syncNodeEdgesPosition('test-node-1', { x: 200, y: 150 })

      expect(mockPreviewLine.graphInstance.setSource).toHaveBeenCalledWith({
        cell: 'test-node-1',
        x: 220,
        y: 190
      })
    })

    it('应该同步连接线源点位置', async () => {
      await edgeManager.syncNodeEdgesPosition('test-node-1', { x: 200, y: 150 })

      expect(mockConnection.graphInstance.setSource).toHaveBeenCalledWith({
        cell: 'test-node-1',
        x: 220,
        y: 190
      })
    })

    it('应该触发边位置同步完成事件', async () => {
      await edgeManager.syncNodeEdgesPosition('test-node-1', { x: 200, y: 150 })

      expect(edgeManager.emit).toHaveBeenCalledWith('edges:position:synced', {
        nodeId: 'test-node-1',
        updatedCount: expect.any(Number),
        duration: expect.any(Number)
      })
    })

    it('位置未变化时不应该更新', async () => {
      edgeManager.hasPositionChanged.mockReturnValue(false)

      await edgeManager.syncNodeEdgesPosition('test-node-1', { x: 200, y: 150 })

      expect(mockPreviewLine.graphInstance.setSource).not.toHaveBeenCalled()
      expect(mockConnection.graphInstance.setSource).not.toHaveBeenCalled()
    })
  })

  describe('位置计算', () => {
    beforeEach(() => {
      mockGraph.getCellById.mockReturnValue(mockNode)
    })

    it('应该正确计算源点位置', () => {
      const mockPortConfig = {
        position: {
          name: 'bottom',
          args: { x: '50%', y: '100%', dx: 0, dy: 0 }
        }
      }
      
      mockNode.getPort.mockReturnValue(mockPortConfig)

      const result = edgeManager.calculateEdgeSourcePosition(
        'test-node-1',
        { x: 100, y: 100 },
        { source: { port: 'out-port' } }
      )

      expect(result).toEqual({
        x: 160, // 100 + 120 * 0.5 + 0
        y: 180  // 100 + 80 * 1.0 + 0
      })
    })

    it('应该正确计算目标点位置', () => {
      const mockPortConfig = {
        position: {
          name: 'top',
          args: { x: '50%', y: '0%', dx: 0, dy: 0 }
        }
      }
      
      mockNode.getPort.mockReturnValue(mockPortConfig)

      const result = edgeManager.calculateEdgeTargetPosition(
        'test-node-1',
        { x: 100, y: 100 },
        { target: { port: 'in-port' } }
      )

      expect(result).toEqual({
        x: 160, // 100 + 120 * 0.5 + 0
        y: 100  // 100 + 80 * 0.0 + 0
      })
    })

    it('节点不存在时应该返回默认位置', () => {
      mockGraph.getCellById.mockReturnValue(null)

      const result = edgeManager.calculateEdgeSourcePosition(
        'non-existent-node',
        { x: 100, y: 100 },
        { source: { port: 'out-port' } }
      )

      expect(result).toEqual({ x: 100, y: 100 })
    })
  })

  describe('位置变化检测', () => {
    it('应该检测到位置变化', () => {
      const oldPos = { x: 100, y: 100 }
      const newPos = { x: 105, y: 110 }

      const result = edgeManager.hasPositionChanged(oldPos, newPos)

      expect(result).toBe(true)
    })

    it('微小变化不应该触发更新', () => {
      const oldPos = { x: 100, y: 100 }
      const newPos = { x: 100.5, y: 100.5 }

      const result = edgeManager.hasPositionChanged(oldPos, newPos)

      expect(result).toBe(false)
    })

    it('相同位置不应该触发更新', () => {
      const oldPos = { x: 100, y: 100 }
      const newPos = { x: 100, y: 100 }

      const result = edgeManager.hasPositionChanged(oldPos, newPos)

      expect(result).toBe(false)
    })
  })

  describe('错误处理', () => {
    it('应该处理同步过程中的错误', async () => {
      mockPreviewLine.graphInstance.setSource.mockImplementation(() => {
        throw new Error('设置源点失败')
      })

      vi.spyOn(console, 'warn').mockImplementation(() => {})
      vi.spyOn(edgeManager, 'getNodePreviewLines').mockReturnValue([mockPreviewLine])
      vi.spyOn(edgeManager, 'getNodeConnections').mockReturnValue([])

      await expect(
        edgeManager.syncNodeEdgesPosition('test-node-1', { x: 200, y: 150 })
      ).resolves.not.toThrow()

      expect(console.warn).toHaveBeenCalled()
    })

    it('图实例不存在时应该跳过监听器设置', () => {
      const edgeManagerWithoutGraph = new UnifiedEdgeManager(null)
      
      vi.spyOn(console, 'warn').mockImplementation(() => {})
      
      edgeManagerWithoutGraph.setupNodePositionListeners()
      
      expect(console.warn).toHaveBeenCalledWith(
        '⚠️ [统一边管理器] 图实例不存在，跳过节点位置监听器设置'
      )
    })
  })
})