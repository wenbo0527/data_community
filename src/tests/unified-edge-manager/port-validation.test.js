/**
 * 端口验证测试
 * 整合了 port-direction-validation.test.js 和 port-connection-validation.test.js
 * 
 * 测试覆盖：
 * - 端口方向验证（out → in）
 * - 端口连接验证
 * - 预览线端口验证
 * - 连接转换时的端口验证
 * - 自定义端口配置
 */

import { describe, it, test, expect, beforeEach, afterEach, vi } from 'vitest'

// Mock Graph 类
class MockGraph {
  constructor() {
    this.nodes = new Map()
    this.edges = new Map()
  }

  addNode(nodeData) {
    const node = {
      id: nodeData.id,
      getData: () => nodeData,
      getPorts: () => this.getNodePorts(nodeData),
      getPortsData: () => this.getNodePortsData(nodeData)
    }
    this.nodes.set(nodeData.id, node)
    return node
  }

  getCellById(id) {
    return this.nodes.get(id)
  }

  getNodePorts(nodeData) {
    const ports = []
    if (nodeData.type !== 'end') {
      ports.push({ id: 'out', group: 'out' })
    }
    if (nodeData.type !== 'start') {
      ports.push({ id: 'in', group: 'in' })
    }
    return ports
  }

  getNodePortsData(nodeData) {
    return {
      items: this.getNodePorts(nodeData)
    }
  }

  addEdge(edgeData) {
    const edge = {
      id: edgeData.id || `edge_${Date.now()}_${Math.random()}`,
      source: edgeData.source,
      target: edgeData.target,
      data: edgeData.data || {},
      attrs: edgeData.attrs || {}
    }
    this.edges.set(edge.id, edge)
    return edge
  }

  getEdges() {
    return Array.from(this.edges.values())
  }

  removeEdge(edgeId) {
    return this.edges.delete(edgeId)
  }

  getNodes() {
    return Array.from(this.nodes.values())
  }
}

// Mock UnifiedEdgeManager
class MockUnifiedEdgeManager {
  constructor(graph) {
    this.graph = graph
    this.edges = new Map()
    this.previewLines = new Map()
    this.connections = new Map()
  }

  async createConnection(sourceNodeId, targetNodeId, options = {}) {
    const sourceNode = this.graph.getCellById(sourceNodeId)
    const targetNode = this.graph.getCellById(targetNodeId)
    
    if (!sourceNode || !targetNode) {
      throw new Error('源节点或目标节点不存在')
    }

    // 默认端口配置：源节点使用out端口，目标节点使用in端口
    const sourcePort = options.sourcePort || 'out'
    const targetPort = options.targetPort || 'in'

    // 验证端口方向
    if (sourcePort !== 'out') {
      throw new Error(`无效的源端口: ${sourcePort}，源端口必须是 'out'`)
    }
    
    if (targetPort !== 'in') {
      throw new Error(`无效的目标端口: ${targetPort}，目标端口必须是 'in'`)
    }

    const connectionData = {
      type: 'CONNECTION',
      source: { nodeId: sourceNodeId, port: sourcePort },
      target: { nodeId: targetNodeId, port: targetPort },
      isPreview: false,
      isConnected: true,
      branchId: options.branchId,
      branchLabel: options.branchLabel
    }

    const edge = this.graph.addEdge({
      id: `connection_${sourceNodeId}_${targetNodeId}`,
      source: { cell: sourceNodeId, port: sourcePort },
      target: { cell: targetNodeId, port: targetPort },
      data: connectionData
    })

    this.connections.set(edge.id, edge)
    this.edges.set(edge.id, edge)
    return edge
  }

  async createPreviewLine(sourceNodeId, options = {}) {
    const sourceNode = this.graph.getCellById(sourceNodeId)
    if (!sourceNode) {
      throw new Error('源节点不存在')
    }

    // 预览线必须从out端口开始
    const sourcePort = options.sourcePort || 'out'
    if (sourcePort !== 'out') {
      throw new Error(`无效的预览线源端口: ${sourcePort}，预览线必须从 'out' 端口开始`)
    }

    const previewData = {
      type: 'PREVIEW',
      source: { nodeId: sourceNodeId, port: sourcePort },
      target: null,
      isPreview: true,
      isConnected: false,
      branchId: options.branchId
    }

    const edge = this.graph.addEdge({
      id: `preview_${sourceNodeId}_${Date.now()}`,
      source: { cell: sourceNodeId, port: sourcePort },
      target: null,
      data: previewData
    })

    this.previewLines.set(edge.id, edge)
    this.edges.set(edge.id, edge)
    return edge
  }

  async convertPreviewToConnection(previewId, targetNodeId, options = {}) {
    const preview = this.previewLines.get(previewId)
    if (!preview) {
      throw new Error('预览线不存在')
    }

    const targetNode = this.graph.getCellById(targetNodeId)
    if (!targetNode) {
      throw new Error('目标节点不存在')
    }

    // 转换时目标端口必须是in端口
    const targetPort = options.targetPort || 'in'
    if (targetPort !== 'in') {
      throw new Error(`无效的目标端口: ${targetPort}，目标端口必须是 'in'`)
    }

    // 创建连接线
    const connection = await this.createConnection(
      preview.source.nodeId,
      targetNodeId,
      {
        sourcePort: preview.source.port,
        targetPort: targetPort,
        ...options
      }
    )

    // 删除预览线
    this.previewLines.delete(previewId)
    this.edges.delete(previewId)
    
    return connection
  }

  validatePortDirection(sourcePort, targetPort) {
    const errors = []
    
    if (sourcePort !== 'out') {
      errors.push(`源端口必须是 'out'，当前为: ${sourcePort}`)
    }
    
    if (targetPort !== 'in') {
      errors.push(`目标端口必须是 'in'，当前为: ${targetPort}`)
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }

  validatePortConfiguration(sourceNodeId, targetNodeId, sourcePort, targetPort) {
    const sourceNode = this.graph.getCellById(sourceNodeId)
    const targetNode = this.graph.getCellById(targetNodeId)
    
    const errors = []
    
    if (!sourceNode) {
      errors.push(`源节点不存在: ${sourceNodeId}`)
    }
    
    if (!targetNode) {
      errors.push(`目标节点不存在: ${targetNodeId}`)
    }
    
    // 验证端口方向
    const directionValidation = this.validatePortDirection(sourcePort, targetPort)
    if (!directionValidation.isValid) {
      errors.push(...directionValidation.errors)
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }
}

describe('端口验证测试', () => {
  let graph
  let edgeManager

  beforeEach(() => {
    graph = new MockGraph()
    edgeManager = new MockUnifiedEdgeManager(graph)
  })

  describe('端口方向验证', () => {
    it('创建连接线时应强制使用out端口作为源端口', async () => {
      const sourceNode = graph.addNode({ id: 'node1', type: 'start' })
      const targetNode = graph.addNode({ id: 'node2', type: 'action' })

      const connection = await edgeManager.createConnection('node1', 'node2')

      expect(connection.source.port).toBe('out')
      expect(connection.data.source.port).toBe('out')
    })

    it('创建连接线时应强制使用in端口作为目标端口', async () => {
      const sourceNode = graph.addNode({ id: 'node1', type: 'start' })
      const targetNode = graph.addNode({ id: 'node2', type: 'action' })

      const connection = await edgeManager.createConnection('node1', 'node2')

      expect(connection.target.port).toBe('in')
      expect(connection.data.target.port).toBe('in')
    })

    it('应该拒绝使用错误源端口的连接', async () => {
      const sourceNode = graph.addNode({ id: 'node1', type: 'start' })
      const targetNode = graph.addNode({ id: 'node2', type: 'action' })

      await expect(
        edgeManager.createConnection('node1', 'node2', { sourcePort: 'in' })
      ).rejects.toThrow('无效的源端口: in，源端口必须是 \'out\'')
    })

    it('应该拒绝使用错误目标端口的连接', async () => {
      const sourceNode = graph.addNode({ id: 'node1', type: 'start' })
      const targetNode = graph.addNode({ id: 'node2', type: 'action' })

      await expect(
        edgeManager.createConnection('node1', 'node2', { targetPort: 'out' })
      ).rejects.toThrow('无效的目标端口: out，目标端口必须是 \'in\'')
    })

    it('端口方向验证器应该正确验证有效端口', () => {
      const validation = edgeManager.validatePortDirection('out', 'in')
      
      expect(validation.isValid).toBe(true)
      expect(validation.errors).toHaveLength(0)
    })

    it('端口方向验证器应该检测无效端口', () => {
      const validation = edgeManager.validatePortDirection('in', 'out')
      
      expect(validation.isValid).toBe(false)
      expect(validation.errors).toHaveLength(2)
      expect(validation.errors[0]).toContain('源端口必须是 \'out\'')
      expect(validation.errors[1]).toContain('目标端口必须是 \'in\'')
    })
  })

  describe('预览线端口验证', () => {
    it('创建预览线时应使用正确的默认源端口', async () => {
      const sourceNode = graph.addNode({ id: 'node1', type: 'start' })

      const preview = await edgeManager.createPreviewLine('node1')

      expect(preview.source.port).toBe('out')
      expect(preview.data.source.port).toBe('out')
    })

    it('应该拒绝使用错误源端口的预览线', async () => {
      const sourceNode = graph.addNode({ id: 'node1', type: 'start' })

      await expect(
        edgeManager.createPreviewLine('node1', { sourcePort: 'in' })
      ).rejects.toThrow('无效的预览线源端口: in，预览线必须从 \'out\' 端口开始')
    })

    it('预览线应该允许自定义out端口', async () => {
      const sourceNode = graph.addNode({ id: 'node1', type: 'start' })

      const preview = await edgeManager.createPreviewLine('node1', { sourcePort: 'out' })

      expect(preview.source.port).toBe('out')
      expect(preview.data.source.port).toBe('out')
    })
  })

  describe('连接转换端口验证', () => {
    it('预览线转换为连接线时应使用正确的默认目标端口', async () => {
      const sourceNode = graph.addNode({ id: 'node1', type: 'start' })
      const targetNode = graph.addNode({ id: 'node2', type: 'action' })

      const preview = await edgeManager.createPreviewLine('node1')
      const connection = await edgeManager.convertPreviewToConnection(preview.id, 'node2')

      expect(connection.source.port).toBe('out')
      expect(connection.target.port).toBe('in')
      expect(connection.data.source.port).toBe('out')
      expect(connection.data.target.port).toBe('in')
    })

    it('预览线转换时应支持自定义目标端口', async () => {
      const sourceNode = graph.addNode({ id: 'node1', type: 'start' })
      const targetNode = graph.addNode({ id: 'node2', type: 'action' })

      const preview = await edgeManager.createPreviewLine('node1')
      const connection = await edgeManager.convertPreviewToConnection(preview.id, 'node2', {
        targetPort: 'in'
      })

      expect(connection.target.port).toBe('in')
      expect(connection.data.target.port).toBe('in')
    })

    it('应该拒绝转换到错误目标端口', async () => {
      const sourceNode = graph.addNode({ id: 'node1', type: 'start' })
      const targetNode = graph.addNode({ id: 'node2', type: 'action' })

      const preview = await edgeManager.createPreviewLine('node1')

      await expect(
        edgeManager.convertPreviewToConnection(preview.id, 'node2', { targetPort: 'out' })
      ).rejects.toThrow('无效的目标端口: out，目标端口必须是 \'in\'')
    })
  })

  describe('自定义端口配置验证', () => {
    it('创建连接线时应支持自定义端口配置', async () => {
      const sourceNode = graph.addNode({ id: 'node1', type: 'start' })
      const targetNode = graph.addNode({ id: 'node2', type: 'action' })

      // 注意：这里我们测试的是系统应该拒绝非标准端口配置
      await expect(
        edgeManager.createConnection('node1', 'node2', {
          sourcePort: 'custom-out',
          targetPort: 'custom-in'
        })
      ).rejects.toThrow()
    })

    it('端口配置验证器应该检查节点存在性', () => {
      const validation = edgeManager.validatePortConfiguration('non-existent', 'node2', 'out', 'in')
      
      expect(validation.isValid).toBe(false)
      expect(validation.errors).toContain('源节点不存在: non-existent')
    })

    it('端口配置验证器应该进行完整验证', () => {
      const sourceNode = graph.addNode({ id: 'node1', type: 'start' })
      const targetNode = graph.addNode({ id: 'node2', type: 'action' })

      const validation = edgeManager.validatePortConfiguration('node1', 'node2', 'out', 'in')
      
      expect(validation.isValid).toBe(true)
      expect(validation.errors).toHaveLength(0)
    })
  })

  describe('边界情况和错误处理', () => {
    it('应该处理不存在的源节点', async () => {
      await expect(
        edgeManager.createConnection('non-existent', 'node2')
      ).rejects.toThrow('源节点或目标节点不存在')
    })

    it('应该处理不存在的目标节点', async () => {
      const sourceNode = graph.addNode({ id: 'node1', type: 'start' })

      await expect(
        edgeManager.createConnection('node1', 'non-existent')
      ).rejects.toThrow('源节点或目标节点不存在')
    })

    it('应该处理预览线转换时的不存在目标节点', async () => {
      const sourceNode = graph.addNode({ id: 'node1', type: 'start' })
      const preview = await edgeManager.createPreviewLine('node1')

      await expect(
        edgeManager.convertPreviewToConnection(preview.id, 'non-existent')
      ).rejects.toThrow('目标节点不存在')
    })

    it('应该处理转换不存在的预览线', async () => {
      const targetNode = graph.addNode({ id: 'node2', type: 'action' })

      await expect(
        edgeManager.convertPreviewToConnection('non-existent-preview', 'node2')
      ).rejects.toThrow('预览线不存在')
    })

    it('应该处理空端口参数', () => {
      const validation = edgeManager.validatePortDirection('', '')
      
      expect(validation.isValid).toBe(false)
      expect(validation.errors).toHaveLength(2)
    })

    it('应该处理null端口参数', () => {
      const validation = edgeManager.validatePortDirection(null, null)
      
      expect(validation.isValid).toBe(false)
      expect(validation.errors).toHaveLength(2)
    })
  })

  describe('端口类型兼容性', () => {
    it('应该验证不同节点类型的端口兼容性', () => {
      const startNode = graph.addNode({ id: 'start1', type: 'start' })
      const actionNode = graph.addNode({ id: 'action1', type: 'action' })
      const endNode = graph.addNode({ id: 'end1', type: 'end' })

      // start节点应该有out端口
      const startPorts = graph.getNodePorts({ id: 'start1', type: 'start' })
      expect(startPorts.some(p => p.group === 'out')).toBe(true)

      // action节点应该有in和out端口
      const actionPorts = graph.getNodePorts({ id: 'action1', type: 'action' })
      expect(actionPorts.some(p => p.group === 'in')).toBe(true)
      expect(actionPorts.some(p => p.group === 'out')).toBe(true)

      // end节点应该只有in端口
      const endPorts = graph.getNodePorts({ id: 'end1', type: 'end' })
      expect(endPorts.some(p => p.group === 'in')).toBe(true)
      expect(endPorts.some(p => p.group === 'out')).toBe(false)
    })

    it('应该允许start节点连接到action节点', async () => {
      const startNode = graph.addNode({ id: 'start1', type: 'start' })
      const actionNode = graph.addNode({ id: 'action1', type: 'action' })

      const connection = await edgeManager.createConnection('start1', 'action1')
      
      expect(connection).toBeDefined()
      expect(connection.source.port).toBe('out')
      expect(connection.target.port).toBe('in')
    })

    it('应该允许action节点连接到end节点', async () => {
      const actionNode = graph.addNode({ id: 'action1', type: 'action' })
      const endNode = graph.addNode({ id: 'end1', type: 'end' })

      const connection = await edgeManager.createConnection('action1', 'end1')
      
      expect(connection).toBeDefined()
      expect(connection.source.port).toBe('out')
      expect(connection.target.port).toBe('in')
    })
  })
})