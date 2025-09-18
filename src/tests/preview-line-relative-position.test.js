import { describe, it, expect, beforeEach, vi } from 'vitest'
import UnifiedPreviewLineManager from '../utils/UnifiedPreviewLineManager.js'

describe('预览线相对位置测试', () => {
  let previewManager
  let mockGraph
  let mockNode

  beforeEach(() => {
    // 创建模拟的图实例
    mockGraph = {
      getCellById: vi.fn(),
      getOutgoingEdges: vi.fn(() => []),
      addEdge: vi.fn(() => ({
        id: 'mock-edge-id',
        attr: vi.fn(),
        setRouter: vi.fn(),
        setAttrs: vi.fn(),
        getLabels: vi.fn(() => []),
        setLabelAt: vi.fn(),
        getSource: vi.fn(() => ({ x: 100, y: 100 })),
        getTarget: vi.fn(() => ({ x: 200, y: 200 })),
        setSource: vi.fn(),
        setTarget: vi.fn()
      })),
      removeEdge: vi.fn(),
      getNodes: vi.fn(() => []),
      on: vi.fn(),
      off: vi.fn(),
      hasCell: vi.fn(() => true),
      findViewByCell: vi.fn(() => ({
        el: {
          getBoundingClientRect: () => ({
            left: 100,
            top: 100,
            width: 120,
            height: 40
          })
        }
      })),
      container: {
        getBoundingClientRect: () => ({
          left: 0,
          top: 0
        })
      },
      clientToGraph: vi.fn((x, y) => ({ x, y }))
    }

    // 创建模拟节点
    mockNode = {
      id: 'test-node-1',
      getData: vi.fn(() => ({
        type: 'start',
        isConfigured: true
      })),
      getPosition: vi.fn(() => ({ x: 100, y: 100 })),
      getSize: vi.fn(() => ({ width: 120, height: 40 })),
      removed: false,
      isRemoved: vi.fn(() => false)
    }

    // 创建预览线管理器实例
    previewManager = new UnifiedPreviewLineManager(
      mockGraph,
      null,
      {},
      null
    )

    // 设置布局引擎就绪状态
    previewManager.layoutEngineReady = true

    // 模拟必要的方法
    previewManager.shouldCreatePreviewLine = vi.fn(() => true)
    previewManager.isBranchNode = vi.fn(() => false)
    previewManager.calculateSinglePreviewPosition = vi.fn(() => ({ x: 200, y: 200 }))
    previewManager.calculateMultiLineOffset = vi.fn(() => ({
      offset: 0,
      strokeColor: '#1890ff',
      strokeWidth: 2,
      dashArray: '5,5',
      excludeEnds: []
    }))
    previewManager.getDynamicDirectionConfig = vi.fn(() => ({}))
  })

  describe('预览线与源节点相对位置测试', () => {
    it('应该使用源节点的实际DOM位置创建预览线', () => {
      // 设置节点位置
      const nodePosition = { x: 100, y: 100 }
      const nodeSize = { width: 120, height: 40 }
      mockNode.getPosition.mockReturnValue(nodePosition)
      mockNode.getSize.mockReturnValue(nodeSize)

      // 创建预览线
      const result = previewManager.createUnifiedPreviewLine(mockNode)

      // 验证预览线创建成功
      expect(result).toBeTruthy()
      expect(mockGraph.addEdge).toHaveBeenCalled()

      // 获取addEdge的调用参数
      const edgeConfig = mockGraph.addEdge.mock.calls[0][0]
      
      // 验证预览线使用了正确的源节点连接
      expect(edgeConfig.source).toEqual({
        cell: mockNode.id,
        port: 'bottom'
      })

      // 验证预览线数据包含源节点ID
      expect(edgeConfig.data.sourceNodeId).toBe(mockNode.id)
    })

    it('应该正确计算节点的实际DOM中心位置', () => {
      // 设置DOM元素的位置信息
      const mockRect = {
        left: 150,
        top: 120,
        width: 120,
        height: 40
      }
      
      mockGraph.findViewByCell.mockReturnValue({
        el: {
          getBoundingClientRect: () => mockRect
        }
      })

      // 调用getActualNodeCenter方法
      const actualCenter = previewManager.getActualNodeCenter(mockNode)

      // 验证计算结果
      expect(actualCenter).toEqual({
        x: 210, // 150 + 120/2 = 210
        y: 140  // 120 + 40/2 = 140
      })
    })

    it('应该在DOM位置获取失败时降级到逻辑坐标', () => {
      // 模拟DOM获取失败
      mockGraph.findViewByCell.mockReturnValue(null)

      const nodePosition = { x: 100, y: 100 }
      const nodeSize = { width: 120, height: 40 }
      mockNode.getPosition.mockReturnValue(nodePosition)
      mockNode.getSize.mockReturnValue(nodeSize)

      // 调用getActualNodeCenter方法
      const actualCenter = previewManager.getActualNodeCenter(mockNode)

      // 验证降级到逻辑坐标
      expect(actualCenter).toEqual({
        x: 160, // 100 + 120/2 = 160
        y: 120  // 100 + 40/2 = 120
      })
    })

    it('应该在节点移动时同步更新预览线位置', () => {
      // 先创建预览线
      const result = previewManager.createUnifiedPreviewLine(mockNode)
      expect(result).toBeTruthy()

      // 模拟节点移动到新位置
      const newPosition = { x: 200, y: 150 }
      mockNode.getPosition.mockReturnValue(newPosition)

      // 更新DOM位置信息
      mockGraph.findViewByCell.mockReturnValue({
        el: {
          getBoundingClientRect: () => ({
            left: 200,
            top: 150,
            width: 120,
            height: 40
          })
        }
      })

      // 调用同步方法
      previewManager.syncPreviewLinePosition(mockNode.id)

      // 验证预览线的setSource方法被调用
      const mockEdge = mockGraph.addEdge.mock.results[0].value
      expect(mockEdge.setSource).toHaveBeenCalledWith({
        x: 260, // 200 + 120/2 = 260
        y: 190  // 150 + 40/2 + 40/2 = 190 (节点底部中心)
      })
    })

    it('应该验证并修正预览线坐标偏差', () => {
      // 创建预览线
      const result = previewManager.createUnifiedPreviewLine(mockNode)
      expect(result).toBeTruthy()

      // 模拟预览线当前位置与期望位置有偏差
      const mockEdge = mockGraph.addEdge.mock.results[0].value
      mockEdge.getSource.mockReturnValue({ x: 90, y: 90 }) // 偏差较大的位置

      // 调用坐标验证方法
      previewManager.validateAndCorrectPreviewLineCoordinates(mockNode.id)

      // 验证坐标修正被触发
      expect(mockEdge.setSource).toHaveBeenCalled()
    })
  })

  describe('分支节点相对位置测试', () => {
    beforeEach(() => {
      // 设置为分支节点
      mockNode.getData.mockReturnValue({
        type: 'audience-split',
        isConfigured: true,
        config: {
          branches: [
            { id: 'branch-1', label: '分支1' },
            { id: 'branch-2', label: '分支2' }
          ]
        }
      })

      previewManager.isBranchNode = vi.fn(() => true)
      previewManager.getNodeBranches = vi.fn(() => [
        { id: 'branch-1', label: '分支1' },
        { id: 'branch-2', label: '分支2' }
      ])
      previewManager.checkBranchHasRealConnection = vi.fn(() => false)
      previewManager.calculateBranchPreviewPosition = vi.fn((node, branches, index) => ({
        x: 200 + index * 50,
        y: 200
      }))
    })

    it('应该为每个分支创建相对于源节点的预览线', () => {
      // 确保节点存在于图中
      mockGraph.getCellById = vi.fn(() => ({
        ...mockNode,
        isNode: () => true
      }))
      
      // 创建分支预览线
      const result = previewManager.createUnifiedPreviewLine(mockNode)

      // 验证创建了分支预览线数组
      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBe(2)

      // 验证每个分支预览线都使用了正确的源节点
      expect(mockGraph.addEdge).toHaveBeenCalledTimes(2)
      
      const firstBranchConfig = mockGraph.addEdge.mock.calls[0][0]
      const secondBranchConfig = mockGraph.addEdge.mock.calls[1][0]

      expect(firstBranchConfig.source).toEqual({
        cell: mockNode.id,
        port: 'bottom'
      })
      expect(secondBranchConfig.source).toEqual({
        cell: mockNode.id,
        port: 'bottom'
      })

      // 验证分支数据
      expect(firstBranchConfig.data.branchId).toBe('branch-1')
      expect(secondBranchConfig.data.branchId).toBe('branch-2')
    })

    it('应该为分支预览线计算正确的偏移位置', () => {
      // 确保节点存在于图中
      mockGraph.getCellById = vi.fn(() => ({
        ...mockNode,
        isNode: () => true
      }))
      
      // 模拟多线偏移计算
      previewManager.calculateMultiLineOffset = vi.fn((sourceNode, endPosition, branchIndex, totalBranches) => ({
        offset: branchIndex * 20, // 每个分支偏移20像素
        strokeColor: branchIndex === 0 ? '#1890ff' : '#fa8c16',
        strokeWidth: 2,
        dashArray: '5,5',
        excludeEnds: []
      }))

      // 创建分支预览线
      const result = previewManager.createUnifiedPreviewLine(mockNode)

      // 验证偏移计算被正确调用
      expect(previewManager.calculateMultiLineOffset).toHaveBeenCalledTimes(2)
      
      // 验证第一个分支的偏移
      expect(previewManager.calculateMultiLineOffset).toHaveBeenNthCalledWith(
        1,
        mockNode,
        { x: 200, y: 200 },
        0,
        2
      )

      // 验证第二个分支的偏移
      expect(previewManager.calculateMultiLineOffset).toHaveBeenNthCalledWith(
        2,
        mockNode,
        { x: 250, y: 200 },
        1,
        2
      )
    })
  })

  describe('预览线创建失败场景测试', () => {
    it('应该在节点不存在时返回null', () => {
      // 设置节点为null
      const result = previewManager.createUnifiedPreviewLine(null)
      expect(result).toBeNull()
    })

    it('应该在节点不在图中时返回null', () => {
      // 设置节点不在图中
      mockGraph.hasCell.mockReturnValue(false)

      const result = previewManager.createUnifiedPreviewLine(mockNode)
      expect(result).toBeNull()
    })

    it('应该在节点已被移除时返回null', () => {
      // 设置节点已被移除
      mockNode.removed = true

      const result = previewManager.createUnifiedPreviewLine(mockNode)
      expect(result).toBeNull()
    })

    it('应该在shouldCreatePreviewLine返回false时返回null', () => {
      // 设置不应创建预览线
      previewManager.shouldCreatePreviewLine.mockReturnValue(false)

      const result = previewManager.createUnifiedPreviewLine(mockNode)
      expect(result).toBeNull()
    })

    it('应该在布局引擎未就绪时将任务加入队列', () => {
      // 设置布局引擎未就绪
      previewManager.layoutEngineReady = false
      previewManager.addToPendingCalculations = vi.fn(() => true)
      
      // 确保节点存在于图中
      mockGraph.getCellById = vi.fn(() => ({
        ...mockNode,
        isNode: () => true
      }))

      const result = previewManager.createUnifiedPreviewLine(mockNode)

      expect(result).toBeNull()
      expect(previewManager.addToPendingCalculations).toHaveBeenCalledWith(
        mockNode.id,
        mockNode,
        'create'
      )
    })
  })

  describe('预览线重试机制测试', () => {
    it('应该在预览线创建失败时进行重试', async () => {
      // 确保节点存在于图中
      mockGraph.getCellById = vi.fn(() => ({
        ...mockNode,
        isNode: vi.fn(() => true)
      }))
      
      // 模拟第一次创建失败，第二次成功
      let callCount = 0
      const originalMethod = previewManager.createUnifiedPreviewLine.bind(previewManager)
      previewManager.createUnifiedPreviewLine = vi.fn(() => {
        callCount++
        return callCount === 1 ? null : { line: { id: 'success' } }
      })

      const result = await previewManager.createUnifiedPreviewLineWithRetry(
        mockNode,
        'interactive',
        {},
        2
      )

      expect(result).toBeTruthy()
      expect(previewManager.createUnifiedPreviewLine).toHaveBeenCalledTimes(2)
      
      // 恢复原方法
      previewManager.createUnifiedPreviewLine = originalMethod
    })

    it('应该在所有重试失败后返回null', async () => {
      // 确保节点存在于图中
      mockGraph.getCellById = vi.fn(() => ({
        ...mockNode,
        isNode: vi.fn(() => true)
      }))
      
      // 直接模拟createUnifiedPreviewLine方法返回null
      const originalCreateMethod = previewManager.createUnifiedPreviewLine
      previewManager.createUnifiedPreviewLine = vi.fn(() => null)

      const result = await previewManager.createUnifiedPreviewLineWithRetry(
        mockNode,
        'interactive',
        {},
        3
      )

      expect(result).toBeNull()
      expect(previewManager.createUnifiedPreviewLine).toHaveBeenCalledTimes(3)
      
      // 恢复原方法
      previewManager.createUnifiedPreviewLine = originalCreateMethod
    })

    it('应该在节点不存在时返回null', async () => {
      // 模拟节点不存在于图中
      mockGraph.getCellById = vi.fn(() => null)

      const result = await previewManager.createUnifiedPreviewLineWithRetry(
        mockNode,
        'interactive',
        {},
        2
      )

      expect(result).toBeNull()
      expect(mockGraph.getCellById).toHaveBeenCalledWith(mockNode.id)
    })
  })
})