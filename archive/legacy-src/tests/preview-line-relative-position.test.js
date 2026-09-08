import { describe, it, expect, beforeEach, vi } from 'vitest'
import PreviewLineSystem from '../utils/preview-line/PreviewLineSystem.js'

describe('预览线相对位置测试', () => {
  let previewManager
  let mockGraph
  let mockNode

  beforeEach(async () => {
    // 创建模拟的图实例
    mockGraph = {
      getCellById: vi.fn((id) => {
        if (id === 'test-node-1') {
          return mockNode
        }
        return null
      }),
      getOutgoingEdges: vi.fn(() => []),
      getEdges: vi.fn(() => []), // 🔧 添加缺失的getEdges方法
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
        setTarget: vi.fn(),
        getData: vi.fn(() => ({ type: 'unified-preview-line' })), // 🔧 添加getData方法
        getSourcePoint: vi.fn(() => ({ x: 90, y: 90 })), // 🔧 添加getSourcePoint方法
        prop: vi.fn() // 🔧 添加prop方法
      })),
      removeEdge: vi.fn(),
      getNodes: vi.fn(() => [mockNode]),
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
      clientToGraph: vi.fn((x, y) => ({ x, y })),
      getCells: vi.fn(() => [mockNode]),
      findView: vi.fn(() => null)
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
      isRemoved: vi.fn(() => false),
      isNode: vi.fn(() => true), // 🔧 添加缺失的isNode方法
      getPortProp: vi.fn((port, prop) => {
        if (port === 'out' && prop === 'position') {
          return { x: 0.5, y: 1 } // 底部中心位置
        }
        return null
      }) // 🔧 添加缺失的getPortProp方法
    }

    // 创建预览线系统实例
    previewManager = new PreviewLineSystem({
      graph: mockGraph,
      system: {
        enableDebug: true,
        autoInit: true
      }
    })

    // 初始化系统
    await previewManager.init()

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
      const result = previewManager.createPreviewLine(mockNode)

      // 验证预览线创建成功
      expect(result).toBeTruthy()
      expect(mockGraph.addEdge).toHaveBeenCalled()

      // 获取addEdge的调用参数
      const edgeConfig = mockGraph.addEdge.mock.calls[0][0]
      
      // 验证预览线使用了正确的源节点连接
      expect(edgeConfig.source).toEqual({
        cell: mockNode.id,
        port: 'out'
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
      const actualCenter = previewManager.positionCalculator.getActualNodeCenter(mockNode)

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
      const actualCenter = previewManager.positionCalculator.getActualNodeCenter(mockNode)

      // 验证降级到逻辑坐标
      expect(actualCenter).toEqual({
        x: 160, // 100 + 120/2 = 160
        y: 120  // 100 + 40/2 = 120
      })
    })

    it('应该在节点移动时同步更新预览线位置', () => {
      // 先创建预览线
      const result = previewManager.createPreviewLine(mockNode)
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
      previewManager.syncPreviewLinePositions([mockNode.id])

      // 验证预览线的prop方法被调用来设置source
      const mockEdge = mockGraph.addEdge.mock.results[0].value
      expect(mockEdge.prop).toHaveBeenCalledWith('source', {
        cell: 'test-node-1',
        port: 'out'
      })
    })

    it('应该验证并修正预览线坐标偏差', () => {
      // 创建预览线
      const result = previewManager.createPreviewLine(mockNode)
      expect(result).toBeTruthy()

      // 模拟预览线当前位置与期望位置有偏差
      const mockEdge = mockGraph.addEdge.mock.results[0].value
      mockEdge.getSource.mockReturnValue({ x: 90, y: 90 }) // 偏差较大的位置

      // 调用坐标验证方法
      previewManager.positionCalculator.validateAndCorrectPreviewLineCoordinates(mockNode.id)

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

      previewManager.previewLineManager.validator.isBranchNode = vi.fn(() => true)
      previewManager.branchAnalyzer.getNodeBranches = vi.fn(() => [
        { id: 'branch-1', label: '分支1' },
        { id: 'branch-2', label: '分支2' }
      ])
      previewManager.connectionValidator.checkBranchHasRealConnection = vi.fn(() => false)
      previewManager.positionCalculator.calculateBranchPreviewPosition = vi.fn((node, branches, index) => ({
        x: 200 + index * 50,
        y: 200
      }))
    })

    it('应该为每个分支创建相对于源节点的预览线', () => {
      // 确保节点存在于图中
      mockGraph.getCellById = vi.fn(() => ({
        ...mockNode,
        isNode: vi.fn(() => true)
      }))
      
      // 创建分支预览线
      const result = previewManager.createPreviewLine(mockNode)

      // 验证创建了分支预览线数组
      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBe(2)

      // 验证每个分支预览线都使用了正确的源节点
      expect(mockGraph.addEdge).toHaveBeenCalledTimes(2)
      
      const firstBranchConfig = mockGraph.addEdge.mock.calls[0][0]
      const secondBranchConfig = mockGraph.addEdge.mock.calls[1][0]

      expect(firstBranchConfig.source).toEqual({
        cell: mockNode.id,
        port: 'out'
      })
      expect(secondBranchConfig.source).toEqual({
        cell: mockNode.id,
        port: 'out'
      })

      // 验证分支数据
      expect(firstBranchConfig.data.branchId).toBe('branch-1')
      expect(secondBranchConfig.data.branchId).toBe('branch-2')
    })

    it('应该为分支预览线计算正确的偏移位置', () => {
      // 确保节点存在于图中
      mockGraph.getCellById = vi.fn(() => ({
        ...mockNode,
        isNode: vi.fn(() => true)
      }))
      
      // 模拟多线偏移计算
      previewManager.positionCalculator.calculateMultiLineOffset = vi.fn((sourceNode, endPosition, branchIndex, totalBranches) => ({
        offset: branchIndex * 20, // 每个分支偏移20像素
        strokeColor: branchIndex === 0 ? '#1890ff' : '#fa8c16',
        strokeWidth: 2,
        dashArray: '5,5',
        excludeEnds: []
      }))

      // 创建分支预览线
      const result = previewManager.createPreviewLine(mockNode)

      // 验证偏移计算被正确调用
      expect(previewManager.positionCalculator.calculateMultiLineOffset).toHaveBeenCalledTimes(2)
      
      // 验证第一个分支的偏移
      expect(previewManager.positionCalculator.calculateMultiLineOffset).toHaveBeenNthCalledWith(
        1,
        mockNode,
        { x: 200, y: 200 },
        0,
        2
      )

      // 验证第二个分支的偏移
      expect(previewManager.positionCalculator.calculateMultiLineOffset).toHaveBeenNthCalledWith(
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
      const result = previewManager.createPreviewLine(null)
      expect(result).toBeNull()
    })

    it('应该在节点不在图中时返回null', () => {
      // 设置节点不在图中
      mockGraph.hasCell.mockReturnValue(false)

      const result = previewManager.createPreviewLine(mockNode)
      expect(result).toBeNull()
    })

    it('应该在节点已被移除时返回null', () => {
      // 设置节点已被移除
      mockNode.removed = true

      const result = previewManager.createPreviewLine(mockNode)
      expect(result).toBeNull()
    })

    it('应该在shouldCreatePreviewLine返回false时返回null', () => {
      // 设置不应创建预览线
      previewManager.validator.shouldCreatePreviewLine.mockReturnValue(false)

      const result = previewManager.createPreviewLine(mockNode)
      expect(result).toBeNull()
    })

    it('应该在布局引擎未就绪时将任务加入队列', () => {
      // 设置布局引擎未就绪
      previewManager.layoutEngineReady = false
      previewManager.addToPendingCalculations = vi.fn(() => true)
      
      // 确保节点存在于图中
      mockGraph.getCellById = vi.fn(() => ({
        ...mockNode,
        isNode: vi.fn(() => true)
      }))

      const result = previewManager.createPreviewLine(mockNode)

      expect(result).toBeNull()
      expect(previewManager.addToPendingCalculations).toHaveBeenCalledWith(
        mockNode.id,
        'createPreviewLine',
        expect.objectContaining({
          node: mockNode,
          initialState: 'interactive',
          options: {}
        })
      )
    })
  })


})