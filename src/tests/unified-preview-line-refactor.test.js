import { describe, it, expect, beforeEach, vi } from 'vitest'
import UnifiedPreviewLineManager from '../utils/UnifiedPreviewLineManager.js'

describe('统一预览线管理器 - 重构后的分支逻辑测试', () => {
  let previewManager
  let mockGraph

  beforeEach(() => {
    // 创建模拟的图实例
    mockGraph = {
      getCellById: vi.fn(),
      getOutgoingEdges: vi.fn(),
      addEdge: vi.fn(() => ({
        id: 'mock-edge-id',
        attr: vi.fn(),
        setRouter: vi.fn(),
        setAttrs: vi.fn(),
        getLabels: vi.fn(() => [])
      })),
      removeEdge: vi.fn(),
      getNodes: vi.fn(() => []),
      on: vi.fn(),
      off: vi.fn()
    }

    // 创建预览线管理器实例
    previewManager = new UnifiedPreviewLineManager(mockGraph)
    
    // 模拟 getNodeBranches 方法
    previewManager.getNodeBranches = vi.fn((node) => {
      const nodeData = node.getData() || {}
      const nodeType = nodeData.type || nodeData.nodeType
      
      if (nodeType === 'audience-split') {
        const config = nodeData.config || {}
        if (config.branches) {
          return config.branches
        }
        return [
          { id: 'branch-1', label: '分支1' },
          { id: 'branch-2', label: '分支2' }
        ]
      }
      
      if (nodeType === 'event-split') {
        return [
          { id: 'yes', label: '是' },
          { id: 'no', label: '否' }
        ]
      }
      
      if (nodeType === 'ab-test') {
        return [
          { id: 'version-a', label: '版本A' },
          { id: 'version-b', label: '版本B' }
        ]
      }
      
      return [{ id: 'default', label: '默认' }]
    })
  })

  describe('checkNodeFullConnections - 统一连接检查逻辑', () => {
    it('无分支节点 - 无连接时返回false', () => {
      const mockNode = {
        id: 'start-node-1',
        getData: () => ({ type: 'start', isConfigured: true }),
        getPosition: () => ({ x: 100, y: 100 }),
        getSize: () => ({ width: 80, height: 40 })
      }

      // 模拟无出向边
      mockGraph.getOutgoingEdges.mockReturnValue([])

      const result = previewManager.checkNodeFullConnections(mockNode, false)
      expect(result).toBe(false)
    })

    it('无分支节点 - 有真实连接时返回true', () => {
      const mockNode = {
        id: 'start-node-1',
        getData: () => ({ type: 'start', isConfigured: true }),
        getPosition: () => ({ x: 100, y: 100 }),
        getSize: () => ({ width: 80, height: 40 })
      }

      // 模拟有真实连接
      const mockEdge = {
        id: 'real-edge-1',
        getData: () => ({ type: 'real-connection' }),
        getTargetCellId: () => 'target-node-1'
      }
      mockGraph.getOutgoingEdges.mockReturnValue([mockEdge])

      const result = previewManager.checkNodeFullConnections(mockNode, false)
      expect(result).toBe(true)
    })

    it('无分支节点 - 只有预览线连接时返回false', () => {
      const mockNode = {
        id: 'start-node-1',
        getData: () => ({ type: 'start', isConfigured: true }),
        getPosition: () => ({ x: 100, y: 100 }),
        getSize: () => ({ width: 80, height: 40 })
      }

      // 模拟只有预览线连接
      const mockPreviewEdge = {
        id: 'preview-edge-1',
        getData: () => ({ type: 'unified-preview-line', isUnifiedPreview: true }),
        getTargetCellId: () => 'preview-target-1'
      }
      mockGraph.getOutgoingEdges.mockReturnValue([mockPreviewEdge])

      const result = previewManager.checkNodeFullConnections(mockNode, false)
      expect(result).toBe(false)
    })

    it('分支节点 - 部分分支连接时返回false', () => {
      const mockNode = {
        id: 'audience-split-1',
        getData: () => ({ 
          type: 'audience-split', 
          isConfigured: true,
          config: {
            branches: [
              { id: 'branch-1', label: '分支1' },
              { id: 'branch-2', label: '分支2' }
            ]
          }
        }),
        getPosition: () => ({ x: 100, y: 100 }),
        getSize: () => ({ width: 120, height: 60 })
      }

      // 模拟只有一个分支连接
      const mockEdge = {
        id: 'real-edge-1',
        getData: () => ({ type: 'real-connection', branchId: 'branch-1' }),
        getTargetCellId: () => 'target-node-1'
      }
      mockGraph.getOutgoingEdges.mockReturnValue([mockEdge])

      const result = previewManager.checkNodeFullConnections(mockNode, true)
      expect(result).toBe(false)
    })

    it('分支节点 - 所有分支都连接时返回true', () => {
      const mockNode = {
        id: 'audience-split-1',
        getData: () => ({ 
          type: 'audience-split', 
          isConfigured: true,
          config: {
            branches: [
              { id: 'branch-1', label: '分支1' },
              { id: 'branch-2', label: '分支2' }
            ]
          }
        }),
        getPosition: () => ({ x: 100, y: 100 }),
        getSize: () => ({ width: 120, height: 60 })
      }

      // 模拟所有分支都连接
      const mockEdges = [
        {
          id: 'real-edge-1',
          getData: () => ({ type: 'real-connection', branchId: 'branch-1' }),
          getTargetCellId: () => 'target-node-1'
        },
        {
          id: 'real-edge-2',
          getData: () => ({ type: 'real-connection', branchId: 'branch-2' }),
          getTargetCellId: () => 'target-node-2'
        }
      ]
      mockGraph.getOutgoingEdges.mockReturnValue(mockEdges)

      const result = previewManager.checkNodeFullConnections(mockNode, true)
      expect(result).toBe(true)
    })
  })

  describe('shouldCreatePreviewLine - 重构后的逻辑测试', () => {
    it('开始节点 - 无连接且已配置时应创建预览线', () => {
      const mockStartNode = {
        id: 'start-node-1',
        getData: () => ({ type: 'start', isConfigured: true }),
        getPosition: () => ({ x: 100, y: 100 }),
        getSize: () => ({ width: 80, height: 40 })
      }

      // 模拟无连接
      mockGraph.getOutgoingEdges.mockReturnValue([])

      const shouldCreate = previewManager.shouldCreatePreviewLine(mockStartNode)
      expect(shouldCreate).toBe(true)
    })

    it('开始节点 - 有连接时不应创建预览线', () => {
      const mockStartNode = {
        id: 'start-node-1',
        getData: () => ({ type: 'start', isConfigured: true }),
        getPosition: () => ({ x: 100, y: 100 }),
        getSize: () => ({ width: 80, height: 40 })
      }

      // 模拟有真实连接
      const mockEdge = {
        id: 'real-edge-1',
        getData: () => ({ type: 'real-connection' }),
        getTargetCellId: () => 'target-node-1'
      }
      mockGraph.getOutgoingEdges.mockReturnValue([mockEdge])

      const shouldCreate = previewManager.shouldCreatePreviewLine(mockStartNode)
      expect(shouldCreate).toBe(false)
    })

    it('分支节点 - 部分分支连接时应创建预览线', () => {
      const mockBranchNode = {
        id: 'audience-split-1',
        getData: () => ({ 
          type: 'audience-split', 
          isConfigured: true,
          config: {
            branches: [
              { id: 'branch-1', label: '分支1' },
              { id: 'branch-2', label: '分支2' }
            ]
          }
        }),
        getPosition: () => ({ x: 100, y: 100 }),
        getSize: () => ({ width: 120, height: 60 })
      }

      // 模拟只有一个分支连接
      const mockEdge = {
        id: 'real-edge-1',
        getData: () => ({ type: 'real-connection', branchId: 'branch-1' }),
        getTargetCellId: () => 'target-node-1'
      }
      mockGraph.getOutgoingEdges.mockReturnValue([mockEdge])

      const shouldCreate = previewManager.shouldCreatePreviewLine(mockBranchNode)
      expect(shouldCreate).toBe(true)
    })

    it('分支节点 - 所有分支都连接时不应创建预览线', () => {
      const mockBranchNode = {
        id: 'audience-split-1',
        getData: () => ({ 
          type: 'audience-split', 
          isConfigured: true,
          config: {
            branches: [
              { id: 'branch-1', label: '分支1' },
              { id: 'branch-2', label: '分支2' }
            ]
          }
        }),
        getPosition: () => ({ x: 100, y: 100 }),
        getSize: () => ({ width: 120, height: 60 })
      }

      // 模拟所有分支都连接
      const mockEdges = [
        {
          id: 'real-edge-1',
          getData: () => ({ type: 'real-connection', branchId: 'branch-1' }),
          getTargetCellId: () => 'target-node-1'
        },
        {
          id: 'real-edge-2',
          getData: () => ({ type: 'real-connection', branchId: 'branch-2' }),
          getTargetCellId: () => 'target-node-2'
        }
      ]
      mockGraph.getOutgoingEdges.mockReturnValue(mockEdges)

      const shouldCreate = previewManager.shouldCreatePreviewLine(mockBranchNode)
      expect(shouldCreate).toBe(false)
    })

    it('未配置节点不应创建预览线', () => {
      const mockNode = {
        id: 'unconfigured-node-1',
        getData: () => ({ type: 'start', isConfigured: false }),
        getPosition: () => ({ x: 100, y: 100 }),
        getSize: () => ({ width: 80, height: 40 })
      }

      mockGraph.getOutgoingEdges.mockReturnValue([])

      const shouldCreate = previewManager.shouldCreatePreviewLine(mockNode)
      expect(shouldCreate).toBe(false)
    })

    it('结束节点不应创建预览线', () => {
      const mockEndNode = {
        id: 'end-node-1',
        getData: () => ({ type: 'end', isConfigured: true }),
        getPosition: () => ({ x: 100, y: 100 }),
        getSize: () => ({ width: 80, height: 40 })
      }

      const shouldCreate = previewManager.shouldCreatePreviewLine(mockEndNode)
      expect(shouldCreate).toBe(false)
    })
  })

  describe('统一分类逻辑验证', () => {
    it('验证不同节点类型的分支判断', () => {
      // 开始节点 - 无分支
      const startNode = {
        id: 'start-1',
        getData: () => ({ type: 'start' })
      }
      expect(previewManager.isBranchNode(startNode)).toBe(false)

      // 人群分流节点 - 有分支
      const audienceSplitNode = {
        id: 'audience-split-1',
        getData: () => ({ type: 'audience-split' })
      }
      expect(previewManager.isBranchNode(audienceSplitNode)).toBe(true)

      // 事件分流节点 - 有分支
      const eventSplitNode = {
        id: 'event-split-1',
        getData: () => ({ type: 'event-split' })
      }
      expect(previewManager.isBranchNode(eventSplitNode)).toBe(true)

      // AB测试节点 - 有分支
      const abTestNode = {
        id: 'ab-test-1',
        getData: () => ({ type: 'ab-test' })
      }
      expect(previewManager.isBranchNode(abTestNode)).toBe(true)

      // 普通节点 - 无分支
      const normalNode = {
        id: 'normal-1',
        getData: () => ({ type: 'normal' })
      }
      expect(previewManager.isBranchNode(normalNode)).toBe(false)
    })

    it('验证分支数量计算的一致性', () => {
      // 开始节点 - 单一输出
      const startNode = {
        getData: () => ({ type: 'start' })
      }
      expect(previewManager.calculateBranchCount(startNode)).toBe(1)

      // 人群分流节点 - 根据配置
      const audienceSplitNode = {
        getData: () => ({ type: 'audience-split' })
      }
      const config = {
        crowdLayers: [
          { id: 'layer-1', name: '层级1' },
          { id: 'layer-2', name: '层级2' }
        ]
      }
      expect(previewManager.calculateBranchCount(audienceSplitNode, config)).toBe(3) // 2个层级 + 1个未命中

      // 事件分流节点 - 固定2个分支
      const eventSplitNode = {
        getData: () => ({ type: 'event-split' })
      }
      expect(previewManager.calculateBranchCount(eventSplitNode)).toBe(2)
    })
  })
})