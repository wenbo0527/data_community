/**
 * 预览线拖拽吸附功能完整测试
 * 测试节点靠近预览线吸附和预览线末端拖拽吸附功能
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { PreviewLineSystem } from '../utils/preview-line/PreviewLineSystem.js'
import { SnapCoordinateSystem } from '../utils/canvas/SnapCoordinateSystem.js'

describe('预览线拖拽吸附功能完整测试', () => {
  let mockGraph
  let previewLineSystem
  let snapSystem
  let sourceNode
  let targetNode
  let previewLine

  beforeEach(() => {
    mockGraph = {
      addNode: vi.fn(),
      addEdge: vi.fn().mockReturnValue({
        id: 'test-edge',
        prop: vi.fn(),
        getData: vi.fn(),
        setData: vi.fn(),
        getSourceCellId: vi.fn(() => 'source-node'),
        getTargetCellId: vi.fn(() => null)
      }),
      removeEdge: vi.fn(),
      getNodes: vi.fn(() => []),
      getEdges: vi.fn(() => []),
      getCellById: vi.fn(),
      on: vi.fn(),
      off: vi.fn()
    }

    previewLineSystem = new PreviewLineSystem({
      graph: mockGraph,
      layoutEngine: { isReady: true }
    })

    snapSystem = new SnapCoordinateSystem({
      graph: mockGraph,
      previewLineSystem
    })

    sourceNode = {
      id: 'source-node',
      getData: () => ({ type: 'start', isConfigured: true }),
      getPosition: () => ({ x: 100, y: 100 }),
      getSize: () => ({ width: 120, height: 60 }),
      getBBox: () => ({ x: 100, y: 100, width: 120, height: 60 })
    }

    targetNode = {
      id: 'target-node',
      getData: () => ({ type: 'sms', isConfigured: true }),
      getPosition: () => ({ x: 300, y: 100 }),
      getSize: () => ({ width: 120, height: 60 }),
      getBBox: () => ({ x: 300, y: 100, width: 120, height: 60 }),
      setPosition: vi.fn()
    }

    previewLine = {
      id: 'preview-line-1',
      source: { cell: 'source-node', port: 'out' },
      target: null,
      getData: () => ({ type: 'preview-line', isPreview: true }),
      getSourcePoint: () => ({ x: 220, y: 130 }), // 源节点右侧out端口
      getTargetPoint: () => ({ x: 350, y: 130 })  // 预览线末端
    }
  })

  describe('节点靠近预览线自动吸附测试', () => {
    it('拖动节点靠近预览线时应该检测到吸附机会', () => {
      mockGraph.getEdges.mockReturnValue([previewLine])
      mockGraph.getCellById.mockImplementation(id => {
        if (id === 'source-node') return sourceNode
        if (id === 'target-node') return targetNode
        return null
      })

      // 模拟目标节点移动到预览线附近
      const nodePosition = { x: 340, y: 120 } // 靠近预览线末端
      
      const snapResult = snapSystem.checkPreviewLineSnap(targetNode, nodePosition)
      
      expect(snapResult.canSnap).toBe(true)
      expect(snapResult.nearestPreviewLine).toBeDefined()
      expect(snapResult.nearestPreviewLine.id).toBe('preview-line-1')
      expect(snapResult.snapDistance).toBeLessThan(50) // 在吸附阈值内
    })

    it('节点吸附到预览线后应该自动转换为连接线', async () => {
      mockGraph.getEdges.mockReturnValue([previewLine])
      mockGraph.getCellById.mockImplementation(id => {
        if (id === 'source-node') return sourceNode
        if (id === 'target-node') return targetNode
        return null
      })

      // 执行吸附操作
      const snapResult = await snapSystem.executePreviewLineSnap(
        targetNode,
        'preview-line-1'
      )

      expect(snapResult.success).toBe(true)
      expect(snapResult.connectionCreated).toBe(true)
      
      // 验证预览线被转换为连接线
      expect(previewLine.setData).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'connection',
          isPreview: false,
          target: expect.objectContaining({
            nodeId: 'target-node',
            port: 'in'
          })
        })
      )
    })

    it('应该选择距离最近的预览线进行吸附', () => {
      const previewLine2 = {
        id: 'preview-line-2',
        source: { cell: 'source-node-2', port: 'out' },
        target: null,
        getData: () => ({ type: 'preview-line', isPreview: true }),
        getSourcePoint: () => ({ x: 120, y: 200 }),
        getTargetPoint: () => ({ x: 250, y: 200 })
      }

      mockGraph.getEdges.mockReturnValue([previewLine, previewLine2])
      
      // 目标节点更靠近第二条预览线
      const nodePosition = { x: 240, y: 190 }
      
      const snapResult = snapSystem.checkPreviewLineSnap(targetNode, nodePosition)
      
      expect(snapResult.canSnap).toBe(true)
      expect(snapResult.nearestPreviewLine.id).toBe('preview-line-2')
    })

    it('距离超出阈值时不应该触发吸附', () => {
      mockGraph.getEdges.mockReturnValue([previewLine])
      
      // 目标节点距离预览线很远
      const nodePosition = { x: 500, y: 300 }
      
      const snapResult = snapSystem.checkPreviewLineSnap(targetNode, nodePosition)
      
      expect(snapResult.canSnap).toBe(false)
      expect(snapResult.nearestPreviewLine).toBeNull()
    })
  })

  describe('预览线末端拖拽吸附测试', () => {
    it('拖拽预览线末端靠近节点时应该检测到吸附机会', () => {
      mockGraph.getNodes.mockReturnValue([sourceNode, targetNode])
      mockGraph.getCellById.mockImplementation(id => {
        if (id === 'source-node') return sourceNode
        if (id === 'target-node') return targetNode
        return null
      })

      // 模拟预览线末端拖拽到目标节点附近
      const endPosition = { x: 310, y: 120 } // 靠近目标节点的in端口
      
      const snapResult = snapSystem.checkNodePortSnap(endPosition, 'in')
      
      expect(snapResult.canSnap).toBe(true)
      expect(snapResult.targetNode).toBeDefined()
      expect(snapResult.targetNode.id).toBe('target-node')
      expect(snapResult.targetPort).toBe('in')
    })

    it('预览线末端吸附到节点后应该创建连接', async () => {
      mockGraph.getCellById.mockImplementation(id => {
        if (id === 'target-node') return targetNode
        return null
      })

      // 执行预览线末端吸附
      const snapResult = await snapSystem.executePreviewLineEndSnap(
        'preview-line-1',
        'target-node',
        'in'
      )

      expect(snapResult.success).toBe(true)
      expect(snapResult.connectionCreated).toBe(true)
      
      // 验证连接线属性
      expect(previewLine.prop).toHaveBeenCalledWith('target', {
        cell: 'target-node',
        port: 'in'
      })
    })

    it('应该只对in端口进行吸附检测', () => {
      mockGraph.getNodes.mockReturnValue([targetNode])
      
      // 测试out端口不应该被吸附
      const endPosition = { x: 180, y: 130 } // 靠近源节点的out端口位置
      
      const snapResult = snapSystem.checkNodePortSnap(endPosition, 'out')
      
      expect(snapResult.canSnap).toBe(false)
      expect(snapResult.reason).toContain('只能吸附到in端口')
    })

    it('已有连接的节点仍然可以被吸附（支持多连接）', () => {
      // 模拟目标节点已有连接
      const existingConnection = {
        id: 'existing-conn',
        target: { cell: 'target-node', port: 'in' }
      }
      
      mockGraph.getEdges.mockReturnValue([existingConnection])
      mockGraph.getNodes.mockReturnValue([targetNode])
      
      const endPosition = { x: 310, y: 120 }
      
      const snapResult = snapSystem.checkNodePortSnap(endPosition, 'in')
      
      // 应该仍然可以吸附，因为支持多连接
      expect(snapResult.canSnap).toBe(true)
      expect(snapResult.allowMultipleConnections).toBe(true)
    })
  })

  describe('吸附视觉反馈测试', () => {
    it('检测到吸附机会时应该显示视觉提示', () => {
      const mockHighlight = vi.fn()
      snapSystem.setHighlightCallback(mockHighlight)
      
      mockGraph.getEdges.mockReturnValue([previewLine])
      
      const nodePosition = { x: 340, y: 120 }
      snapSystem.checkPreviewLineSnap(targetNode, nodePosition)
      
      expect(mockHighlight).toHaveBeenCalledWith({
        type: 'preview-line-snap',
        targetId: 'preview-line-1',
        snapPoint: expect.any(Object)
      })
    })

    it('吸附完成后应该清除视觉提示', async () => {
      const mockClearHighlight = vi.fn()
      snapSystem.setClearHighlightCallback(mockClearHighlight)
      
      await snapSystem.executePreviewLineSnap(targetNode, 'preview-line-1')
      
      expect(mockClearHighlight).toHaveBeenCalledWith({
        type: 'preview-line-snap'
      })
    })
  })

  describe('边界情况测试', () => {
    it('预览线不存在时不应该触发吸附', () => {
      mockGraph.getEdges.mockReturnValue([])
      
      const nodePosition = { x: 340, y: 120 }
      const snapResult = snapSystem.checkPreviewLineSnap(targetNode, nodePosition)
      
      expect(snapResult.canSnap).toBe(false)
      expect(snapResult.reason).toContain('没有可吸附的预览线')
    })

    it('节点类型不支持连接时不应该吸附', () => {
      const unsupportedNode = {
        ...targetNode,
        getData: () => ({ type: 'end', isConfigured: true }) // 结束节点不支持入连接
      }
      
      mockGraph.getEdges.mockReturnValue([previewLine])
      
      const nodePosition = { x: 340, y: 120 }
      const snapResult = snapSystem.checkPreviewLineSnap(unsupportedNode, nodePosition)
      
      expect(snapResult.canSnap).toBe(false)
      expect(snapResult.reason).toContain('节点类型不支持连接')
    })

    it('自连接应该被阻止', () => {
      // 尝试将预览线连接回源节点
      const endPosition = { x: 110, y: 120 } // 源节点位置
      
      const snapResult = snapSystem.checkNodePortSnap(endPosition, 'in')
      
      if (snapResult.targetNode && snapResult.targetNode.id === 'source-node') {
        expect(snapResult.canSnap).toBe(false)
        expect(snapResult.reason).toContain('不能自连接')
      }
    })
  })
})