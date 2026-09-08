import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  createNode,
  createEdge,
  createDownstreamNode,
  getDownstreamNodePosition,
  createNodes,
  createEdges
} from '../utils/workflowNodeCreator.js'
import { NodeType } from '../utils/workflowNodeTypes.js'
import { createMockGraph, createMockNode } from './setup.js'

describe('workflowNodeCreator.js - 节点创建器测试', () => {
  let mockGraph
  let mockNode

  beforeEach(() => {
    mockGraph = createMockGraph()
    mockNode = createMockNode('source-1', NodeType.INPUT, { x: 100, y: 100 })
  })

  describe('getDownstreamNodePosition 函数测试', () => {
    it('应该返回基本的下游位置', () => {
      const position = getDownstreamNodePosition(mockNode, mockGraph)
      
      expect(position).toHaveProperty('x')
      expect(position).toHaveProperty('y')
      expect(typeof position.x).toBe('number')
      expect(typeof position.y).toBe('number')
    })

    it('应该使用默认偏移量计算位置', () => {
      const position = getDownstreamNodePosition(mockNode, mockGraph)
      
      // 默认偏移量 dx=250, dy=100
      expect(position.x).toBe(350) // 100 + 250
      expect(position.y).toBe(100) // 没有下游节点时保持y坐标
    })

    it('应该使用自定义偏移量', () => {
      const position = getDownstreamNodePosition(mockNode, mockGraph, 300, 150)
      
      expect(position.x).toBe(400) // 100 + 300
      expect(position.y).toBe(100) // 没有下游节点时保持y坐标
    })

    it('应该考虑现有下游节点的位置', () => {
      // 添加一个下游节点
      const downstreamNode = createMockNode('downstream-1', NodeType.FILTER, { x: 200, y: 150 })
      mockGraph.addNode({
        id: 'downstream-1',
        position: { x: 200, y: 150 },
        data: { type: NodeType.FILTER }
      })
      
      // 添加连接边
      mockGraph.addEdge({
        id: 'edge-1',
        source: { cell: 'source-1' },
        target: { cell: 'downstream-1' }
      })
      
      const position = getDownstreamNodePosition(mockNode, mockGraph)
      
      // 应该在现有下游节点下方
      expect(position.y).toBe(250) // 150 + 100
    })

    it('应该处理多个下游节点', () => {
      // 添加多个下游节点
      mockGraph.addNode({
        id: 'downstream-1',
        position: { x: 200, y: 150 },
        data: { type: NodeType.FILTER }
      })
      mockGraph.addNode({
        id: 'downstream-2', 
        position: { x: 180, y: 200 },
        data: { type: NodeType.JOIN }
      })
      
      // 添加连接边
      mockGraph.addEdge({
        id: 'edge-1',
        source: { cell: 'source-1' },
        target: { cell: 'downstream-1' }
      })
      mockGraph.addEdge({
        id: 'edge-2',
        source: { cell: 'source-1' },
        target: { cell: 'downstream-2' }
      })
      
      const position = getDownstreamNodePosition(mockNode, mockGraph)
      
      // 应该使用最左侧节点的x坐标和最下方节点的y坐标
      expect(position.x).toBe(180) // 最左侧
      expect(position.y).toBe(300) // 200 + 100
    })

    it('应该处理无效参数', () => {
      expect(getDownstreamNodePosition(null, mockGraph)).toEqual({ x: 100, y: 100 })
      expect(getDownstreamNodePosition(mockNode, null)).toEqual({ x: 100, y: 100 })
      expect(getDownstreamNodePosition(null, null)).toEqual({ x: 100, y: 100 })
    })
  })

  describe('createNode 函数测试', () => {
    it('应该创建有效的节点', () => {
      const node = createNode(NodeType.FILTER, mockGraph, { x: 200, y: 200 })
      
      expect(node).toBeDefined()
      expect(node.id).toBeDefined()
      expect(mockGraph.addNode).toHaveBeenCalled()
    })

    it('应该使用正确的节点配置', () => {
      const position = { x: 200, y: 200 }
      const data = { name: '自定义节点', config: { test: true } }
      
      createNode(NodeType.FILTER, mockGraph, position, data)
      
      const addNodeCall = mockGraph.addNode.mock.calls[0][0]
      expect(addNodeCall.x).toBe(200)
      expect(addNodeCall.y).toBe(200)
      expect(addNodeCall.width).toBe(120)
      expect(addNodeCall.height).toBe(60)
      expect(addNodeCall.shape).toBe('workflow-node')
      expect(addNodeCall.data.type).toBe(NodeType.FILTER)
      expect(addNodeCall.data.name).toBe('自定义节点')
      expect(addNodeCall.data.config.test).toBe(true)
    })

    it('应该生成唯一的节点ID', () => {
      const node1 = createNode(NodeType.FILTER, mockGraph)
      const node2 = createNode(NodeType.FILTER, mockGraph)
      
      expect(node1.id).not.toBe(node2.id)
    })

    it('应该使用提供的节点ID', () => {
      const customId = 'custom-node-id'
      createNode(NodeType.FILTER, mockGraph, { x: 0, y: 0 }, { id: customId })
      
      const addNodeCall = mockGraph.addNode.mock.calls[0][0]
      expect(addNodeCall.id).toBe(customId)
    })

    it('应该根据节点类型生成正确的名称', () => {
      const result = createNode('INPUT', mockGraph, { x: 100, y: 100 })
      
      expect(result).toBeTruthy()
      expect(mockGraph.addNode).toHaveBeenCalledTimes(1)
      
      const nodeConfig = mockGraph.addNode.mock.calls[0][0]
      expect(nodeConfig).toBeDefined()
      expect(nodeConfig.data.name).toMatch(/^数据输入_\d+$/)
    })

    it('应该设置正确的端口配置', () => {
      createNode(NodeType.INPUT, mockGraph)
      
      const addNodeCall = mockGraph.addNode.mock.calls[0][0]
      expect(addNodeCall.ports).toHaveLength(1)
      expect(addNodeCall.ports[0].group).toBe('out')
    })

    it('应该处理无效参数', () => {
      expect(createNode(null, mockGraph)).toBeNull()
      expect(createNode(NodeType.FILTER, null)).toBeNull()
      expect(createNode(null, null)).toBeNull()
    })

    it('应该处理创建错误', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      // 模拟 addNode 抛出错误
      mockGraph.addNode.mockImplementationOnce(() => {
        throw new Error('Mock error')
      })
      
      const result = createNode('INPUT', mockGraph)
      
      expect(result).toBeNull()
      expect(consoleSpy).toHaveBeenCalledWith('Error creating node:', expect.any(Error))
      
      consoleSpy.mockRestore()
    })
  })

  describe('createEdge 函数测试', () => {
    it('应该创建有效的连接边', () => {
      const edge = createEdge('source-1', 'target-1', mockGraph)
      
      expect(edge).toBeDefined()
      expect(mockGraph.addEdge).toHaveBeenCalled()
    })

    it('应该使用正确的边配置', () => {
      createEdge('source-1', 'target-1', mockGraph)
      
      const addEdgeCall = mockGraph.addEdge.mock.calls[0][0]
      expect(addEdgeCall.shape).toBe('workflow-edge')
      expect(addEdgeCall.source.cell).toBe('source-1')
      expect(addEdgeCall.source.port).toBe('source-1-out')
      expect(addEdgeCall.target.cell).toBe('target-1')
      expect(addEdgeCall.target.port).toBe('target-1-in')
      expect(addEdgeCall.zIndex).toBe(-1)
    })

    it('应该设置正确的边样式', () => {
      createEdge('source-1', 'target-1', mockGraph)
      
      const addEdgeCall = mockGraph.addEdge.mock.calls[0][0]
      expect(addEdgeCall.attrs.line.stroke).toBe('#A2B1C3')
      expect(addEdgeCall.attrs.line.strokeWidth).toBe(2)
      expect(addEdgeCall.attrs.line.targetMarker.name).toBe('block')
    })

    it('应该生成唯一的边ID', () => {
      createEdge('source-1', 'target-1', mockGraph)
      createEdge('source-2', 'target-2', mockGraph)
      
      const firstCall = mockGraph.addEdge.mock.calls[0][0]
      const secondCall = mockGraph.addEdge.mock.calls[1][0]
      
      expect(firstCall.id).not.toBe(secondCall.id)
      expect(firstCall.id).toBeDefined()
      expect(secondCall.id).toBeDefined()
    })

    it('应该处理无效参数', () => {
      expect(createEdge(null, 'target-1', mockGraph)).toBeNull()
      expect(createEdge('source-1', null, mockGraph)).toBeNull()
      expect(createEdge('source-1', 'target-1', null)).toBeNull()
      expect(createEdge(null, null, null)).toBeNull()
    })
  })

  describe('createDownstreamNode 函数测试', () => {
    it('应该同时创建节点和边', () => {
      const result = createDownstreamNode(mockNode, 'FILTER', mockGraph)
      
      expect(result.node).toBeDefined()
      expect(result.edge).toBeDefined()
      expect(mockGraph.addNode).toHaveBeenCalled()
      expect(mockGraph.addEdge).toHaveBeenCalled()
    })

    it('应该在正确的位置创建下游节点', () => {
      createDownstreamNode(mockNode, 'FILTER', mockGraph)
      
      const addNodeCall = mockGraph.addNode.mock.calls[0][0]
      // 应该在源节点右侧
      expect(addNodeCall.x).toBeGreaterThan(100)
    })

    it('应该创建正确的连接', () => {
      const result = createDownstreamNode(mockNode, 'FILTER', mockGraph)
      
      const addEdgeCall = mockGraph.addEdge.mock.calls[0][0]
      expect(addEdgeCall.source.cell).toBe('source-1')
      expect(addEdgeCall.target.cell).toBe(result.node.id)
    })

    it('应该处理节点创建失败', () => {
      // 模拟节点创建失败
      mockGraph.addNode.mockReturnValue(null)
      
      const result = createDownstreamNode(mockNode, 'FILTER', mockGraph)
      
      expect(result.node).toBeNull()
      expect(result.edge).toBeNull()
    })

    it('应该处理边创建失败并清理节点', () => {
      // 模拟边创建失败
      mockGraph.addEdge.mockReturnValue(null)
      
      const result = createDownstreamNode(mockNode, 'FILTER', mockGraph)
      
      expect(result.node).toBeNull()
      expect(result.edge).toBeNull()
      expect(mockGraph.removeNode).toHaveBeenCalled()
    })

    it('应该处理无效参数', () => {
      expect(createDownstreamNode(null, 'FILTER', mockGraph)).toEqual({
        node: null,
        edge: null
      })
      expect(createDownstreamNode(mockNode, null, mockGraph)).toEqual({
        node: null,
        edge: null
      })
      expect(createDownstreamNode(mockNode, 'FILTER', null)).toEqual({
        node: null,
        edge: null
      })
    })

    it('应该处理创建过程中的异常', () => {
      // 模拟异常
      mockGraph.addNode.mockImplementation(() => {
        throw new Error('创建失败')
      })
      
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const result = createDownstreamNode(mockNode, 'FILTER', mockGraph)
      
      expect(result.node).toBeNull()
      expect(result.edge).toBeNull()
      expect(consoleSpy).toHaveBeenCalled()
      
      consoleSpy.mockRestore()
    })
  })

  describe('createNodes 批量创建节点测试', () => {
    it('应该批量创建多个节点', () => {
      const nodeConfigs = [
        { type: 'INPUT', position: { x: 100, y: 100 } },
        { type: 'FILTER', position: { x: 200, y: 100 } },
        { type: 'OUTPUT', position: { x: 300, y: 100 } }
      ]
      
      const nodes = createNodes(nodeConfigs, mockGraph)
      
      expect(nodes).toHaveLength(3)
      expect(mockGraph.addNode).toHaveBeenCalledTimes(3)
    })

    it('应该过滤掉创建失败的节点', () => {
      // 模拟第二个节点创建失败
      mockGraph.addNode
        .mockReturnValueOnce({ id: 'node-1' })
        .mockReturnValueOnce(null)
        .mockReturnValueOnce({ id: 'node-3' })
      
      const nodeConfigs = [
        { type: 'INPUT', position: { x: 100, y: 100 } },
        { type: 'FILTER', position: { x: 200, y: 100 } },
        { type: 'OUTPUT', position: { x: 300, y: 100 } }
      ]
      
      const nodes = createNodes(nodeConfigs, mockGraph)
      
      expect(nodes).toHaveLength(2)
      expect(nodes[0].id).toBe('node-1')
      expect(nodes[1].id).toBe('node-3')
    })

    it('应该处理无效参数', () => {
      expect(createNodes(null, mockGraph)).toEqual([])
      expect(createNodes([], null)).toEqual([])
      expect(createNodes('not-array', mockGraph)).toEqual([])
    })

    it('应该处理空数组', () => {
      const nodes = createNodes([], mockGraph)
      expect(nodes).toEqual([])
      expect(mockGraph.addNode).not.toHaveBeenCalled()
    })
  })

  describe('createEdges 批量创建边测试', () => {
    it('应该批量创建多个边', () => {
      const edgeConfigs = [
        { source: 'node-1', target: 'node-2' },
        { source: 'node-2', target: 'node-3' },
        { source: 'node-1', target: 'node-3' }
      ]
      
      const edges = createEdges(edgeConfigs, mockGraph)
      
      expect(edges).toHaveLength(3)
      expect(mockGraph.addEdge).toHaveBeenCalledTimes(3)
    })

    it('应该过滤掉创建失败的边', () => {
      // 模拟第二个边创建失败
      mockGraph.addEdge
        .mockReturnValueOnce({ id: 'edge-1' })
        .mockReturnValueOnce(null)
        .mockReturnValueOnce({ id: 'edge-3' })
      
      const edgeConfigs = [
        { source: 'node-1', target: 'node-2' },
        { source: 'node-2', target: 'node-3' },
        { source: 'node-1', target: 'node-3' }
      ]
      
      const edges = createEdges(edgeConfigs, mockGraph)
      
      expect(edges).toHaveLength(2)
      expect(edges[0].id).toBe('edge-1')
      expect(edges[1].id).toBe('edge-3')
    })

    it('应该处理无效参数', () => {
      expect(createEdges(null, mockGraph)).toEqual([])
      expect(createEdges([], null)).toEqual([])
      expect(createEdges('not-array', mockGraph)).toEqual([])
    })

    it('应该处理空数组', () => {
      const edges = createEdges([], mockGraph)
      expect(edges).toEqual([])
      expect(mockGraph.addEdge).not.toHaveBeenCalled()
    })
  })

  describe('集成测试', () => {
    it('应该能够创建完整的工作流', () => {
      // 创建输入节点
      const inputNode = createNode(NodeType.INPUT, mockGraph, { x: 100, y: 100 })
      
      // 创建下游节点
      const filterResult = createDownstreamNode(inputNode, NodeType.FILTER, mockGraph)
      const outputResult = createDownstreamNode(filterResult.node, NodeType.OUTPUT, mockGraph)
      
      // 验证创建结果
      expect(inputNode).toBeDefined()
      expect(filterResult.node).toBeDefined()
      expect(filterResult.edge).toBeDefined()
      expect(outputResult.node).toBeDefined()
      expect(outputResult.edge).toBeDefined()
      
      // 验证调用次数
      expect(mockGraph.addNode).toHaveBeenCalledTimes(3)
      expect(mockGraph.addEdge).toHaveBeenCalledTimes(2)
    })

    it('应该能够处理复杂的节点布局', () => {
      // 创建主干流程
      const inputNode = createNode(NodeType.INPUT, mockGraph, { x: 100, y: 100 })
      const filterResult = createDownstreamNode(inputNode, NodeType.FILTER, mockGraph)
      
      // 创建分支
      const joinResult = createDownstreamNode(filterResult.node, NodeType.JOIN, mockGraph)
      const unionResult = createDownstreamNode(filterResult.node, NodeType.UNION, mockGraph)
      
      // 验证位置计算
      const joinCall = mockGraph.addNode.mock.calls[2][0]
      const unionCall = mockGraph.addNode.mock.calls[3][0]
      
      // 第二个分支应该在第一个分支下方
      expect(unionCall.y).toBeGreaterThan(joinCall.y)
    })
  })

  describe('性能测试', () => {
    it('应该能够高效处理大量节点创建', () => {
      const startTime = performance.now()
      
      // 创建100个节点
      for (let i = 0; i < 100; i++) {
        createNode(NodeType.FILTER, mockGraph, { x: i * 10, y: 100 })
      }
      
      const endTime = performance.now()
      const duration = endTime - startTime
      
      // 应该在合理时间内完成
      expect(duration).toBeLessThan(100)
    })

    it('应该能够高效处理大量边创建', () => {
      const startTime = performance.now()
      
      // 创建100条边
      for (let i = 0; i < 100; i++) {
        createEdge(`source-${i}`, `target-${i}`, mockGraph)
      }
      
      const endTime = performance.now()
      const duration = endTime - startTime
      
      // 应该在合理时间内完成
      expect(duration).toBeLessThan(100)
    })
  })
})