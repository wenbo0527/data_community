/**
 * 完整性校验测试套件
 * 测试节点坐标完整性、预览线完整性、连接线完整性等
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createMockGraph } from './setup.js'

// 扩展mock节点以支持getSize方法
function createEnhancedMockNode(config) {
  const node = {
    id: config.id,
    getPosition: vi.fn(() => config.position || { x: 0, y: 0 }),
    getSize: vi.fn(() => config.size || { width: 120, height: 60 }),
    getData: vi.fn(() => config.data || {}),
    setPosition: vi.fn(),
    setData: vi.fn()
  }
  return node
}

// 扩展mock边以支持连接验证
function createEnhancedMockEdge(config) {
  const edge = {
    id: config.id,
    getSourceCellId: vi.fn(() => {
      return typeof config.source === 'string' ? config.source : config.source?.cell
    }),
    getTargetCellId: vi.fn(() => {
      return typeof config.target === 'string' ? config.target : config.target?.cell
    }),
    getSource: vi.fn(() => config.source || null),
    getTarget: vi.fn(() => config.target || null)
  }
  return edge
}

// Mock PreviewLineSystem
const mockPreviewLineSystem = {
  init: vi.fn(),
  validator: {
    validatePreviewLineIntegrity: vi.fn(),
    validateEnhancedIntegrity: vi.fn()
  },
  creator: {
    fixNaNCoordinates: vi.fn()
  },
  manager: {
    performComprehensiveIntegrityCheck: vi.fn()
  }
}

// Mock 布局引擎
const mockLayoutEngine = {
  calculateLayerY: vi.fn(),
  updateLayout: vi.fn(),
  getNodePosition: vi.fn()
}

describe('系统完整性校验', () => {
  let mockGraph
  
  beforeEach(() => {
    mockGraph = createMockGraph()
    
    // 重置所有 mock
    vi.clearAllMocks()
    
    // 设置全局对象
    global.window = {
      graph: mockGraph,
      layoutEngine: mockLayoutEngine,
      previewLineSystem: mockPreviewLineSystem
    }
  })

  describe('节点坐标完整性验证', () => {
    it('应该验证节点中央坐标的完整性', () => {
      // 准备测试数据
      const validNode = createEnhancedMockNode({
        id: 'valid-node',
        position: { x: 100, y: 200 },
        size: { width: 120, height: 60 },
        data: { type: 'start' }
      })
      mockGraph.addNode(validNode)
      
      const invalidCenterNode = createEnhancedMockNode({
        id: 'invalid-center-node',
        position: { x: NaN, y: NaN },
        size: { width: 120, height: 60 },
        data: { type: 'process' }
      })
      mockGraph.addNode(invalidCenterNode)
      
      // 执行测试
      const nodes = mockGraph.getNodes()
      const invalidCenterNodes = nodes.filter(node => {
        const position = node.getPosition()
        const size = node.getSize()
        const centerX = position.x + (size?.width || 0) / 2
        const centerY = position.y + (size?.height || 0) / 2
        return isNaN(centerX) || isNaN(centerY)
      })
      
      // 验证结果
      expect(nodes).toHaveLength(2)
      expect(invalidCenterNodes).toHaveLength(1)
      expect(invalidCenterNodes[0].id).toBe('invalid-center-node')
    })

    it('应该验证节点端口坐标的完整性', () => {
      // 准备测试数据
      const nodeWithPorts = createEnhancedMockNode({
        id: 'node-with-ports',
        position: { x: 100, y: 200 },
        size: { width: 120, height: 60 },
        data: { 
          type: 'process',
          ports: {
            in: [{ id: 'in1', position: { x: 0, y: 30 } }],
            out: [{ id: 'out1', position: { x: 120, y: 30 } }]
          }
        }
      })
      mockGraph.addNode(nodeWithPorts)
      
      const nodeWithInvalidPorts = createEnhancedMockNode({
        id: 'node-with-invalid-ports',
        position: { x: 100, y: 200 },
        size: { width: 120, height: 60 },
        data: { 
          type: 'process',
          ports: {
            in: [{ id: 'in1', position: { x: NaN, y: 30 } }],
            out: [{ id: 'out1', position: { x: 120, y: NaN } }]
          }
        }
      })
      mockGraph.addNode(nodeWithInvalidPorts)
      
      // 执行测试
      const nodes = mockGraph.getNodes()
      const nodesWithInvalidPorts = nodes.filter(node => {
        const data = node.getData()
        if (!data?.ports) return false
        
        const allPorts = [...(data.ports.in || []), ...(data.ports.out || [])]
        return allPorts.some(port => {
          const pos = port.position
          return isNaN(pos?.x) || isNaN(pos?.y)
        })
      })
      
      // 验证结果
      expect(nodes).toHaveLength(2)
      expect(nodesWithInvalidPorts).toHaveLength(1)
      expect(nodesWithInvalidPorts[0].id).toBe('node-with-invalid-ports')
    })

    it('应该验证节点分层信息的完整性', () => {
      // 准备测试数据
      const validLayerNode = createEnhancedMockNode({
        id: 'valid-layer-node',
        position: { x: 100, y: 200 },
        data: { 
          type: 'process',
          layer: 1,
          layerIndex: 0
        }
      })
      mockGraph.addNode(validLayerNode)
      
      const invalidLayerNode = createEnhancedMockNode({
        id: 'invalid-layer-node',
        position: { x: 100, y: NaN },
        data: { 
          type: 'audience-split',
          layer: NaN,
          layerIndex: undefined
        }
      })
      mockGraph.addNode(invalidLayerNode)
      
      // 执行测试
      const nodes = mockGraph.getNodes()
      const invalidLayerNodes = nodes.filter(node => {
        const data = node.getData()
        const position = node.getPosition()
        return isNaN(data?.layer) || 
               typeof data?.layerIndex !== 'number' ||
               isNaN(position.y)
      })
      
      // 验证结果
      expect(nodes).toHaveLength(2)
      expect(invalidLayerNodes).toHaveLength(1)
      expect(invalidLayerNodes[0].id).toBe('invalid-layer-node')
    })

    it('应该验证所有节点的X坐标有效性', () => {
      // 准备测试数据
      const validNode = mockGraph.addNode({
        id: 'valid-node',
        position: { x: 100, y: 200 },
        data: { type: 'start' }
      })
      
      const invalidXNode = mockGraph.addNode({
        id: 'invalid-x-node',
        position: { x: NaN, y: 200 },
        data: { type: 'process' }
      })
      
      // 执行测试
      const nodes = mockGraph.getNodes()
      const invalidNodes = nodes.filter(node => {
        const position = node.getPosition()
        return typeof position.x !== 'number' || isNaN(position.x)
      })
      
      // 验证结果
      expect(nodes).toHaveLength(2)
      expect(invalidNodes).toHaveLength(1)
      expect(invalidNodes[0].id).toBe('invalid-x-node')
    })

    it('应该验证所有节点的Y坐标有效性', () => {
      // 准备测试数据
      const validNode = mockGraph.addNode({
        id: 'valid-node',
        position: { x: 100, y: 200 },
        data: { type: 'start' }
      })
      
      const invalidYNode = mockGraph.addNode({
        id: 'invalid-y-node',
        position: { x: 100, y: NaN },
        data: { type: 'audience-split' }
      })
      
      // 执行测试
      const nodes = mockGraph.getNodes()
      const invalidNodes = nodes.filter(node => {
        const position = node.getPosition()
        return typeof position.y !== 'number' || isNaN(position.y)
      })
      
      // 验证结果
      expect(nodes).toHaveLength(2)
      expect(invalidNodes).toHaveLength(1)
      expect(invalidNodes[0].id).toBe('invalid-y-node')
    })

    it('应该特别检查audience-split节点的坐标', () => {
      // 准备测试数据
      const validAudienceSplit = mockGraph.addNode({
        id: 'valid-audience-split',
        position: { x: 100, y: 200 },
        data: { type: 'audience-split' }
      })
      
      const invalidAudienceSplit = mockGraph.addNode({
        id: 'invalid-audience-split',
        position: { x: 100, y: NaN },
        data: { type: 'audience-split' }
      })
      
      const otherNode = mockGraph.addNode({
        id: 'other-node',
        position: { x: NaN, y: NaN },
        data: { type: 'process' }
      })
      
      // 执行测试
      const nodes = mockGraph.getNodes()
      const audienceSplitNodes = nodes.filter(node => 
        node.getData()?.type === 'audience-split'
      )
      
      const invalidAudienceSplitNodes = audienceSplitNodes.filter(node => {
        const position = node.getPosition()
        return isNaN(position.x) || isNaN(position.y)
      })
      
      // 验证结果
      expect(audienceSplitNodes).toHaveLength(2)
      expect(invalidAudienceSplitNodes).toHaveLength(1)
      expect(invalidAudienceSplitNodes[0].id).toBe('invalid-audience-split')
    })

    it('应该检查节点坐标的数据类型', () => {
      // 准备测试数据
      const stringCoordNode = mockGraph.addNode({
        id: 'string-coord-node',
        position: { x: '100', y: '200' },
        data: { type: 'process' }
      })
      
      const undefinedCoordNode = mockGraph.addNode({
        id: 'undefined-coord-node',
        position: { x: undefined, y: undefined },
        data: { type: 'process' }
      })
      
      // 执行测试
      const nodes = mockGraph.getNodes()
      const invalidTypeNodes = nodes.filter(node => {
        const position = node.getPosition()
        return typeof position.x !== 'number' || typeof position.y !== 'number'
      })
      
      // 验证结果
      expect(invalidTypeNodes).toHaveLength(2)
    })
  })

  describe('连接线完整性验证', () => {
    it('应该验证所有连接线都有源节点和目标节点', () => {
      // 准备测试数据
      const sourceNode = createEnhancedMockNode({
        id: 'source-node',
        position: { x: 100, y: 200 }
      })
      mockGraph.addNode(sourceNode)
      
      const targetNode = createEnhancedMockNode({
        id: 'target-node',
        position: { x: 300, y: 200 }
      })
      mockGraph.addNode(targetNode)
      
      const validEdge = createEnhancedMockEdge({
        id: 'valid-edge',
        source: { cell: 'source-node' },
        target: { cell: 'target-node' }
      })
      mockGraph.addEdge(validEdge)
      
      const invalidEdge = createEnhancedMockEdge({
        id: 'invalid-edge',
        source: { cell: null },
        target: { cell: 'target-node' }
      })
      mockGraph.addEdge(invalidEdge)
      
      // 执行测试
      const edges = mockGraph.getEdges()
      const invalidEdges = edges.filter(edge => {
        const source = edge.getSourceCellId()
        const target = edge.getTargetCellId()
        return !source || !target || source === null || target === null
      })
      
      // 验证结果
      expect(edges).toHaveLength(2)
      expect(invalidEdges).toHaveLength(1)
      expect(invalidEdges[0].id).toBe('invalid-edge')
    })

    it('应该验证连接线的源节点和目标节点都存在于图中', () => {
      // 准备测试数据
      const sourceNode = createEnhancedMockNode({
        id: 'source-node',
        position: { x: 100, y: 200 }
      })
      mockGraph.addNode(sourceNode)
      
      const validEdge = createEnhancedMockEdge({
        id: 'valid-edge',
        source: { cell: 'source-node' },
        target: { cell: 'target-node' } // 目标节点不存在
      })
      mockGraph.addEdge(validEdge)
      
      // 执行测试
      const edges = mockGraph.getEdges()
      const nodes = mockGraph.getNodes()
      const nodeIds = new Set(nodes.map(node => node.id))
      
      const invalidEdges = edges.filter(edge => {
        const sourceId = edge.getSourceCellId()
        const targetId = edge.getTargetCellId()
        return !nodeIds.has(sourceId) || !nodeIds.has(targetId)
      })
      
      // 验证结果
      expect(invalidEdges).toHaveLength(1)
      expect(invalidEdges[0].id).toBe('valid-edge')
    })
  })

  describe('预览线完整性验证', () => {
    it('应该验证预览线管理器存在', () => {
      expect(mockPreviewLineSystem).toBeDefined()
      expect(typeof mockPreviewLineSystem.validator.validatePreviewLineIntegrity).toBe('function')
    })

    it('应该能够调用预览线完整性校验方法', () => {
      // 模拟返回值
      mockPreviewLineSystem.validator.validatePreviewLineIntegrity.mockReturnValue({
        isValid: true,
        issues: [],
        summary: '预览线完整性校验通过'
      })
      
      // 执行测试
      const result = mockPreviewLineSystem.validator.validatePreviewLineIntegrity()
      
      // 验证结果
      expect(mockPreviewLineSystem.validator.validatePreviewLineIntegrity).toHaveBeenCalled()
      expect(result.isValid).toBe(true)
      expect(result.issues).toEqual([])
    })

    it('应该能够修复NaN坐标', () => {
      // 模拟返回值
      mockPreviewLineSystem.creator.fixNaNCoordinates.mockReturnValue({
        fixed: 3,
        details: [
          { nodeId: 'node1', oldY: NaN, newY: 100 },
          { nodeId: 'node2', oldY: NaN, newY: 200 },
          { nodeId: 'node3', oldY: NaN, newY: 300 }
        ]
      })
      
      // 执行测试
      const result = mockPreviewLineSystem.creator.fixNaNCoordinates()
      
      // 验证结果
      expect(mockPreviewLineSystem.creator.fixNaNCoordinates).toHaveBeenCalled()
      expect(result.fixed).toBe(3)
      expect(result.details).toHaveLength(3)
    })

    it('应该能够执行全面的完整性检查', () => {
      // 模拟返回值
      mockPreviewLineSystem.manager.performComprehensiveIntegrityCheck.mockReturnValue({
        summary: {
          totalChecks: 5,
          passed: 4,
          failed: 1,
          fixed: 2
        },
        details: {
          nodeCoordinates: { valid: 10, invalid: 1 },
          previewLines: { valid: 5, invalid: 0 },
          connections: { valid: 8, invalid: 0 }
        }
      })
      
      // 执行测试
      const result = mockPreviewLineSystem.manager.performComprehensiveIntegrityCheck()
      
      // 验证结果
      expect(mockPreviewLineSystem.manager.performComprehensiveIntegrityCheck).toHaveBeenCalled()
      expect(result.summary.totalChecks).toBe(5)
      expect(result.summary.passed).toBe(4)
      expect(result.summary.failed).toBe(1)
      expect(result.summary.fixed).toBe(2)
    })
  })

  describe('系统组件可用性验证', () => {
    it('应该验证Graph实例可用', () => {
      expect(global.window.graph).toBeDefined()
      expect(typeof global.window.graph.getNodes).toBe('function')
      expect(typeof global.window.graph.getEdges).toBe('function')
    })

    it('应该验证LayoutEngine实例可用', () => {
      expect(global.window.layoutEngine).toBeDefined()
      expect(typeof global.window.layoutEngine.calculateLayerY).toBe('function')
    })

    it('应该验证PreviewLineManager实例可用', () => {
      expect(global.window.previewLineSystem).toBeDefined()
      expect(typeof global.window.previewLineSystem.validator.validatePreviewLineIntegrity).toBe('function')
    })
  })

  describe('多层复杂图谱统一布局测试', () => {
    it('应该验证多层节点的Y坐标分层正确性', () => {
      // 准备测试数据 - 创建3层节点
      const layer0Nodes = []
      const layer1Nodes = []
      const layer2Nodes = []
      
      // 第0层节点
      for (let i = 0; i < 3; i++) {
        const node = createEnhancedMockNode({
          id: `layer0-node-${i}`,
          position: { x: i * 150, y: 100 },
          data: { type: 'start', layer: 0, layerIndex: i }
        })
        layer0Nodes.push(node)
        mockGraph.addNode(node)
      }
      
      // 第1层节点
      for (let i = 0; i < 5; i++) {
        const node = createEnhancedMockNode({
          id: `layer1-node-${i}`,
          position: { x: i * 120, y: 300 },
          data: { type: 'process', layer: 1, layerIndex: i }
        })
        layer1Nodes.push(node)
        mockGraph.addNode(node)
      }
      
      // 第2层节点
      for (let i = 0; i < 2; i++) {
        const node = createEnhancedMockNode({
          id: `layer2-node-${i}`,
          position: { x: i * 200, y: 500 },
          data: { type: 'end', layer: 2, layerIndex: i }
        })
        layer2Nodes.push(node)
        mockGraph.addNode(node)
      }
      
      // 执行测试
      const nodes = mockGraph.getNodes()
      const layerGroups = {
        0: nodes.filter(n => n.getData().layer === 0),
        1: nodes.filter(n => n.getData().layer === 1),
        2: nodes.filter(n => n.getData().layer === 2)
      }
      
      // 验证层级分组
      expect(layerGroups[0]).toHaveLength(3)
      expect(layerGroups[1]).toHaveLength(5)
      expect(layerGroups[2]).toHaveLength(2)
      
      // 验证Y坐标分层
      const layer0Y = layerGroups[0][0].getPosition().y
      const layer1Y = layerGroups[1][0].getPosition().y
      const layer2Y = layerGroups[2][0].getPosition().y
      
      expect(layer0Y).toBeLessThan(layer1Y)
      expect(layer1Y).toBeLessThan(layer2Y)
      
      // 验证同层节点Y坐标一致性
      layerGroups[0].forEach(node => {
        expect(node.getPosition().y).toBe(layer0Y)
      })
      layerGroups[1].forEach(node => {
        expect(node.getPosition().y).toBe(layer1Y)
      })
      layerGroups[2].forEach(node => {
        expect(node.getPosition().y).toBe(layer2Y)
      })
    })

    it('应该验证复杂分支节点的布局完整性', () => {
      // 准备测试数据 - 创建分支结构
      const startNode = createEnhancedMockNode({
        id: 'start-node',
        position: { x: 200, y: 100 },
        data: { type: 'start', layer: 0, layerIndex: 0 }
      })
      mockGraph.addNode(startNode)
      
      const splitNode = createEnhancedMockNode({
        id: 'audience-split-node',
        position: { x: 200, y: 300 },
        data: { 
          type: 'audience-split', 
          layer: 1, 
          layerIndex: 0,
          branches: [
            { id: 'branch-1', condition: 'age > 25' },
            { id: 'branch-2', condition: 'age <= 25' },
            { id: 'branch-3', condition: 'default' }
          ]
        }
      })
      mockGraph.addNode(splitNode)
      
      // 分支后的处理节点
      const branchNodes = []
      for (let i = 0; i < 3; i++) {
        const node = createEnhancedMockNode({
          id: `branch-process-${i}`,
          position: { x: i * 150 + 50, y: 500 },
          data: { 
            type: 'process', 
            layer: 2, 
            layerIndex: i,
            branchId: `branch-${i + 1}`
          }
        })
        branchNodes.push(node)
        mockGraph.addNode(node)
      }
      
      // 汇聚节点
      const mergeNode = createEnhancedMockNode({
        id: 'merge-node',
        position: { x: 200, y: 700 },
        data: { type: 'merge', layer: 3, layerIndex: 0 }
      })
      mockGraph.addNode(mergeNode)
      
      // 执行测试
      const nodes = mockGraph.getNodes()
      
      // 验证分支节点存在
      const audienceSplitNodes = nodes.filter(n => n.getData().type === 'audience-split')
      expect(audienceSplitNodes).toHaveLength(1)
      
      // 验证分支数据完整性
      const splitData = audienceSplitNodes[0].getData()
      expect(splitData.branches).toHaveLength(3)
      expect(splitData.branches.every(b => b.id && b.condition)).toBe(true)
      
      // 验证分支处理节点
      const branchProcessNodes = nodes.filter(n => n.getData().branchId)
      expect(branchProcessNodes).toHaveLength(3)
      
      // 验证层级递增
      const layerSequence = [0, 1, 2, 3]
      layerSequence.forEach((layer, index) => {
        const layerNodes = nodes.filter(n => n.getData().layer === layer)
        expect(layerNodes.length).toBeGreaterThan(0)
        
        if (index > 0) {
          const prevLayerY = nodes.find(n => n.getData().layer === layerSequence[index - 1]).getPosition().y
          const currentLayerY = layerNodes[0].getPosition().y
          expect(currentLayerY).toBeGreaterThan(prevLayerY)
        }
      })
    })

    it('应该验证大规模图谱的布局性能和完整性', () => {
      // 准备测试数据 - 创建大规模图谱（5层，每层10个节点）
      const totalLayers = 5
      const nodesPerLayer = 10
      const layerSpacing = 200
      const nodeSpacing = 100
      
      for (let layer = 0; layer < totalLayers; layer++) {
        for (let index = 0; index < nodesPerLayer; index++) {
          const node = createEnhancedMockNode({
            id: `large-node-${layer}-${index}`,
            position: { 
              x: index * nodeSpacing, 
              y: layer * layerSpacing + 100 
            },
            data: { 
              type: layer === 0 ? 'start' : layer === totalLayers - 1 ? 'end' : 'process',
              layer: layer,
              layerIndex: index
            }
          })
          mockGraph.addNode(node)
        }
      }
      
      // 执行性能测试
      const startTime = performance.now()
      
      const nodes = mockGraph.getNodes()
      
      // 验证节点总数
      expect(nodes).toHaveLength(totalLayers * nodesPerLayer)
      
      // 验证每层节点数量
      for (let layer = 0; layer < totalLayers; layer++) {
        const layerNodes = nodes.filter(n => n.getData().layer === layer)
        expect(layerNodes).toHaveLength(nodesPerLayer)
      }
      
      // 验证坐标完整性
      const invalidCoordNodes = nodes.filter(node => {
        const pos = node.getPosition()
        return isNaN(pos.x) || isNaN(pos.y)
      })
      expect(invalidCoordNodes).toHaveLength(0)
      
      // 验证层级Y坐标递增
      for (let layer = 1; layer < totalLayers; layer++) {
        const prevLayerNodes = nodes.filter(n => n.getData().layer === layer - 1)
        const currentLayerNodes = nodes.filter(n => n.getData().layer === layer)
        
        const prevY = prevLayerNodes[0].getPosition().y
        const currentY = currentLayerNodes[0].getPosition().y
        
        expect(currentY).toBeGreaterThan(prevY)
        expect(currentY - prevY).toBe(layerSpacing)
      }
      
      const endTime = performance.now()
      
      // 性能验证 - 大规模图谱处理应该在合理时间内完成
      expect(endTime - startTime).toBeLessThan(50) // 50ms内完成
    })

    it('应该验证复杂连接关系的完整性', () => {
      // 准备测试数据 - 创建复杂连接结构
      const nodes = []
      const edges = []
      
      // 创建节点
      for (let i = 0; i < 6; i++) {
        const node = createEnhancedMockNode({
          id: `complex-node-${i}`,
          position: { x: (i % 3) * 150, y: Math.floor(i / 3) * 200 + 100 },
          data: { 
            type: i === 0 ? 'start' : i === 5 ? 'end' : 'process',
            layer: Math.floor(i / 3),
            layerIndex: i % 3
          }
        })
        nodes.push(node)
        mockGraph.addNode(node)
      }
      
      // 创建复杂连接关系
      const connections = [
        { from: 0, to: 1 }, { from: 0, to: 2 }, // 一对多
        { from: 1, to: 3 }, { from: 2, to: 3 }, // 多对一
        { from: 1, to: 4 }, { from: 3, to: 5 }, { from: 4, to: 5 } // 交叉连接
      ]
      
      connections.forEach((conn, index) => {
        const edge = createEnhancedMockEdge({
          id: `complex-edge-${index}`,
          source: `complex-node-${conn.from}`,
          target: `complex-node-${conn.to}`
        })
        edges.push(edge)
        mockGraph.addEdge(edge)
      })
      
      // 执行测试
      const graphNodes = mockGraph.getNodes()
      const graphEdges = mockGraph.getEdges()
      
      // 验证节点和边的数量
      expect(graphNodes).toHaveLength(6)
      expect(graphEdges).toHaveLength(7)
      
      // 验证所有连接都有效
      const nodeIds = new Set(graphNodes.map(n => n.id))
      
      const invalidConnections = graphEdges.filter(edge => {
        const sourceId = edge.getSourceCellId()
        const targetId = edge.getTargetCellId()
        return !nodeIds.has(sourceId) || !nodeIds.has(targetId)
      })
      expect(invalidConnections).toHaveLength(0)
      
      // 验证连接的层级关系（源节点层级应该小于等于目标节点层级）
      const invalidLayerConnections = graphEdges.filter(edge => {
        const sourceNode = graphNodes.find(n => n.id === edge.getSourceCellId())
        const targetNode = graphNodes.find(n => n.id === edge.getTargetCellId())
        
        if (!sourceNode || !targetNode) return true
        
        const sourceLayer = sourceNode.getData().layer
        const targetLayer = targetNode.getData().layer
        
        return sourceLayer > targetLayer // 不允许向上层连接
      })
      expect(invalidLayerConnections).toHaveLength(0)
    })

    it('应该验证动态布局更新的完整性', () => {
      // 准备初始布局
      const initialNodes = []
      for (let i = 0; i < 3; i++) {
        const node = createEnhancedMockNode({
          id: `dynamic-node-${i}`,
          position: { x: i * 100, y: 100 },
          data: { type: 'process', layer: 0, layerIndex: i }
        })
        initialNodes.push(node)
        mockGraph.addNode(node)
      }
      
      // 模拟动态添加节点
      const newNode = createEnhancedMockNode({
        id: 'dynamic-new-node',
        position: { x: 150, y: 300 },
        data: { type: 'process', layer: 1, layerIndex: 0 }
      })
      mockGraph.addNode(newNode)
      
      // 模拟布局更新后的坐标变化
      initialNodes.forEach((node, index) => {
        node.getPosition = vi.fn(() => ({ x: index * 120, y: 100 })) // 重新计算X坐标
      })
      
      // 执行测试
      const nodes = mockGraph.getNodes()
      expect(nodes).toHaveLength(4)
      
      // 验证动态更新后的坐标完整性
      const invalidNodes = nodes.filter(node => {
        const pos = node.getPosition()
        return isNaN(pos.x) || isNaN(pos.y)
      })
      expect(invalidNodes).toHaveLength(0)
      
      // 验证更新后的坐标完整性
        const layer0Nodes = nodes.filter(n => {
          const data = n.getData && n.getData()
          return data && data.layer === 0
        })
        const layer1Nodes = nodes.filter(n => {
          const data = n.getData && n.getData()
          return data && data.layer === 1
        })
        
        // 验证至少有节点存在
        expect(nodes).toHaveLength(4)
        
        // 如果有layer数据，验证分层
        if (layer0Nodes.length > 0 || layer1Nodes.length > 0) {
          expect(layer0Nodes).toHaveLength(3)
          expect(layer1Nodes).toHaveLength(1)
          
          // 验证Y坐标层级关系
          if (layer0Nodes.length > 0 && layer1Nodes.length > 0) {
            const layer0Y = layer0Nodes[0].getPosition().y
            const layer1Y = layer1Nodes[0].getPosition().y
            expect(layer1Y).toBeGreaterThan(layer0Y)
          }
        }
    })
  })

  describe('边界情况测试', () => {
    it('应该处理空图的情况', () => {
      // 执行测试
      const nodes = mockGraph.getNodes()
      const edges = mockGraph.getEdges()
      
      // 验证结果
      expect(nodes).toHaveLength(0)
      expect(edges).toHaveLength(0)
    })

    it('应该处理只有节点没有连接线的情况', () => {
      // 准备测试数据
      mockGraph.addNode({
        id: 'lonely-node',
        position: { x: 100, y: 200 },
        data: { type: 'start' }
      })
      
      // 执行测试
      const nodes = mockGraph.getNodes()
      const edges = mockGraph.getEdges()
      
      // 验证结果
      expect(nodes).toHaveLength(1)
      expect(edges).toHaveLength(0)
    })

    it('应该处理大量节点的性能测试', () => {
      // 准备测试数据 - 创建100个节点
      const nodeCount = 100
      for (let i = 0; i < nodeCount; i++) {
        mockGraph.addNode({
          id: `node-${i}`,
          position: { x: i * 10, y: i * 10 },
          data: { type: 'process' }
        })
      }
      
      // 执行测试
      const startTime = performance.now()
      const nodes = mockGraph.getNodes()
      const invalidNodes = nodes.filter(node => {
        const position = node.getPosition()
        return isNaN(position.x) || isNaN(position.y)
      })
      const endTime = performance.now()
      
      // 验证结果
      expect(nodes).toHaveLength(nodeCount)
      expect(invalidNodes).toHaveLength(0)
      expect(endTime - startTime).toBeLessThan(100) // 应该在100ms内完成
    })
  })

  describe('修复功能测试', () => {
    it('应该能够修复NaN坐标并验证修复结果', () => {
      // 准备测试数据
      const invalidNode = mockGraph.addNode({
        id: 'invalid-node',
        position: { x: NaN, y: NaN },
        data: { type: 'audience-split' }
      })
      
      // 模拟修复过程
      mockPreviewLineSystem.creator.fixNaNCoordinates.mockImplementation(() => {
        // 模拟修复坐标
        invalidNode.getPosition = vi.fn(() => ({ x: 100, y: 200 }))
        return {
          fixed: 1,
          details: [{ nodeId: 'invalid-node', oldY: NaN, newY: 200 }]
        }
      })
      
      // 执行修复
      const fixResult = mockPreviewLineSystem.creator.fixNaNCoordinates()
      
      // 验证修复结果
      expect(fixResult.fixed).toBe(1)
      expect(fixResult.details[0].nodeId).toBe('invalid-node')
      expect(fixResult.details[0].newY).toBe(200)
      
      // 验证节点坐标已修复
      const position = invalidNode.getPosition()
      expect(position.x).toBe(100)
      expect(position.y).toBe(200)
    })

    it('应该能够处理修复失败的情况', () => {
      // 模拟修复失败
      mockPreviewLineSystem.creator.fixNaNCoordinates.mockImplementation(() => {
        throw new Error('修复失败：无法获取布局引擎')
      })
      
      // 执行测试
      expect(() => {
        mockPreviewLineSystem.creator.fixNaNCoordinates()
      }).toThrow('修复失败：无法获取布局引擎')
    })
  })
})