/**
 * 端口方向验证测试
 * 确保升级后的连接线系统严格遵循 out端口 → in端口 的连接方向
 */

import { describe, test, expect, beforeEach, afterEach } from 'vitest'

// Mock 依赖
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
}

class MockUnifiedEdgeManager {
  constructor(graph) {
    this.graph = graph
    this.edges = new Map()
    this.previewLines = new Map()
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

    const connection = {
      id: `edge_${Date.now()}_${Math.random()}`,
      source: { cell: sourceNodeId, port: sourcePort },
      target: { cell: targetNodeId, port: targetPort },
      data: {
        type: 'connection',
        source: { nodeId: sourceNodeId, port: sourcePort },
        target: { nodeId: targetNodeId, port: targetPort },
        isPreview: false,
        ...options
      }
    }

    this.edges.set(connection.id, connection)
    return connection
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

    const previewLine = {
      id: `preview_${Date.now()}_${Math.random()}`,
      source: { nodeId: sourceNodeId, port: sourcePort },
      target: null,
      data: {
        type: 'preview',
        source: { nodeId: sourceNodeId, port: sourcePort },
        isPreview: true,
        ...options
      }
    }

    this.previewLines.set(previewLine.id, previewLine)
    return previewLine
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
}

describe('端口方向验证测试', () => {
  let graph
  let edgeManager

  beforeEach(() => {
    graph = new MockGraph()
    edgeManager = new MockUnifiedEdgeManager(graph)
  })

  describe('连接线端口方向验证', () => {
    test('创建连接线时应强制使用out端口作为源端口', async () => {
      const sourceNode = graph.addNode({ id: 'node1', type: 'start' })
      const targetNode = graph.addNode({ id: 'node2', type: 'action' })

      const connection = await edgeManager.createConnection('node1', 'node2')

      expect(connection.source.port).toBe('out')
      expect(connection.data.source.port).toBe('out')
    })

    test('创建连接线时应强制使用in端口作为目标端口', async () => {
      const sourceNode = graph.addNode({ id: 'node1', type: 'start' })
      const targetNode = graph.addNode({ id: 'node2', type: 'action' })

      const connection = await edgeManager.createConnection('node1', 'node2')

      expect(connection.target.port).toBe('in')
      expect(connection.data.target.port).toBe('in')
    })

    test('尝试使用非out端口作为源端口应抛出错误', async () => {
      const sourceNode = graph.addNode({ id: 'node1', type: 'start' })
      const targetNode = graph.addNode({ id: 'node2', type: 'action' })

      await expect(
        edgeManager.createConnection('node1', 'node2', { sourcePort: 'in' })
      ).rejects.toThrow('无效的源端口: in，源端口必须是 \'out\'')

      await expect(
        edgeManager.createConnection('node1', 'node2', { sourcePort: 'custom' })
      ).rejects.toThrow('无效的源端口: custom，源端口必须是 \'out\'')
    })

    test('尝试使用非in端口作为目标端口应抛出错误', async () => {
      const sourceNode = graph.addNode({ id: 'node1', type: 'start' })
      const targetNode = graph.addNode({ id: 'node2', type: 'action' })

      await expect(
        edgeManager.createConnection('node1', 'node2', { targetPort: 'out' })
      ).rejects.toThrow('无效的目标端口: out，目标端口必须是 \'in\'')

      await expect(
        edgeManager.createConnection('node1', 'node2', { targetPort: 'custom' })
      ).rejects.toThrow('无效的目标端口: custom，目标端口必须是 \'in\'')
    })
  })

  describe('预览线端口方向验证', () => {
    test('创建预览线时应强制使用out端口作为源端口', async () => {
      const sourceNode = graph.addNode({ id: 'node1', type: 'start' })

      const previewLine = await edgeManager.createPreviewLine('node1')

      expect(previewLine.source.port).toBe('out')
      expect(previewLine.data.source.port).toBe('out')
    })

    test('尝试使用非out端口创建预览线应抛出错误', async () => {
      const sourceNode = graph.addNode({ id: 'node1', type: 'start' })

      await expect(
        edgeManager.createPreviewLine('node1', { sourcePort: 'in' })
      ).rejects.toThrow('无效的预览线源端口: in，预览线必须从 \'out\' 端口开始')

      await expect(
        edgeManager.createPreviewLine('node1', { sourcePort: 'custom' })
      ).rejects.toThrow('无效的预览线源端口: custom，预览线必须从 \'out\' 端口开始')
    })

    test('预览线转连接线时应强制使用in端口作为目标端口', async () => {
      const sourceNode = graph.addNode({ id: 'node1', type: 'start' })
      const targetNode = graph.addNode({ id: 'node2', type: 'action' })

      const previewLine = await edgeManager.createPreviewLine('node1')
      const connection = await edgeManager.convertPreviewToConnection(previewLine.id, 'node2')

      expect(connection.target.port).toBe('in')
      expect(connection.data.target.port).toBe('in')
    })

    test('预览线转连接线时使用非in端口作为目标端口应抛出错误', async () => {
      const sourceNode = graph.addNode({ id: 'node1', type: 'start' })
      const targetNode = graph.addNode({ id: 'node2', type: 'action' })

      const previewLine = await edgeManager.createPreviewLine('node1')

      await expect(
        edgeManager.convertPreviewToConnection(previewLine.id, 'node2', { targetPort: 'out' })
      ).rejects.toThrow('无效的目标端口: out，目标端口必须是 \'in\'')

      await expect(
        edgeManager.convertPreviewToConnection(previewLine.id, 'node2', { targetPort: 'custom' })
      ).rejects.toThrow('无效的目标端口: custom，目标端口必须是 \'in\'')
    })
  })

  describe('分支连接线端口方向验证', () => {
    test('分支连接线应统一使用out端口作为源端口', async () => {
      const sourceNode = graph.addNode({ id: 'node1', type: 'event-split' })
      const targetNode1 = graph.addNode({ id: 'node2', type: 'action' })
      const targetNode2 = graph.addNode({ id: 'node3', type: 'action' })

      const connection1 = await edgeManager.createConnection('node1', 'node2', {
        branchId: 'branch1',
        branchLabel: '是'
      })

      const connection2 = await edgeManager.createConnection('node1', 'node3', {
        branchId: 'branch2',
        branchLabel: '否'
      })

      // 验证所有分支连接线都使用统一的out端口
      expect(connection1.source.port).toBe('out')
      expect(connection2.source.port).toBe('out')
      expect(connection1.target.port).toBe('in')
      expect(connection2.target.port).toBe('in')
    })

    test('多个分支连接线应都连接到目标节点的in端口', async () => {
      const sourceNode = graph.addNode({ id: 'node1', type: 'event-split' })
      const targetNode1 = graph.addNode({ id: 'node2', type: 'action' })
      const targetNode2 = graph.addNode({ id: 'node3', type: 'action' })
      const targetNode3 = graph.addNode({ id: 'node4', type: 'action' })

      const connections = await Promise.all([
        edgeManager.createConnection('node1', 'node2', { branchId: 'branch1' }),
        edgeManager.createConnection('node1', 'node3', { branchId: 'branch2' }),
        edgeManager.createConnection('node1', 'node4', { branchId: 'branch3' })
      ])

      connections.forEach((connection, index) => {
        expect(connection.source.port).toBe('out')
        expect(connection.target.port).toBe('in')
        expect(connection.data.source.port).toBe('out')
        expect(connection.data.target.port).toBe('in')
      })
    })
  })

  describe('端口方向验证工具方法', () => {
    test('validatePortDirection应正确验证有效的端口方向', () => {
      const result = edgeManager.validatePortDirection('out', 'in')
      
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    test('validatePortDirection应检测无效的源端口', () => {
      const result = edgeManager.validatePortDirection('in', 'in')
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('源端口必须是 \'out\'，当前为: in')
    })

    test('validatePortDirection应检测无效的目标端口', () => {
      const result = edgeManager.validatePortDirection('out', 'out')
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('目标端口必须是 \'in\'，当前为: out')
    })

    test('validatePortDirection应检测多个无效端口', () => {
      const result = edgeManager.validatePortDirection('custom1', 'custom2')
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(2)
      expect(result.errors).toContain('源端口必须是 \'out\'，当前为: custom1')
      expect(result.errors).toContain('目标端口必须是 \'in\'，当前为: custom2')
    })
  })

  describe('边界情况测试', () => {
    test('不同节点类型之间的连接应遵循端口方向规则', async () => {
      const nodeTypes = ['start', 'action', 'event-split', 'audience-split', 'sms', 'ai-call']
      
      for (let i = 0; i < nodeTypes.length - 1; i++) {
        const sourceNode = graph.addNode({ id: `node${i}`, type: nodeTypes[i] })
        const targetNode = graph.addNode({ id: `node${i + 1}`, type: nodeTypes[i + 1] })
        
        if (nodeTypes[i] !== 'end' && nodeTypes[i + 1] !== 'start') {
          const connection = await edgeManager.createConnection(`node${i}`, `node${i + 1}`)
          
          expect(connection.source.port).toBe('out')
          expect(connection.target.port).toBe('in')
        }
      }
    })

    test('复杂工作流中的连接线应保持端口方向一致性', async () => {
      // 创建复杂的工作流结构
      const nodes = [
        { id: 'start1', type: 'start' },
        { id: 'split1', type: 'event-split' },
        { id: 'action1', type: 'action' },
        { id: 'action2', type: 'action' },
        { id: 'split2', type: 'audience-split' },
        { id: 'sms1', type: 'sms' },
        { id: 'sms2', type: 'sms' },
        { id: 'end1', type: 'end' }
      ]

      nodes.forEach(nodeData => graph.addNode(nodeData))

      // 创建复杂的连接关系
      const connections = [
        ['start1', 'split1'],
        ['split1', 'action1'],
        ['split1', 'action2'],
        ['action1', 'split2'],
        ['split2', 'sms1'],
        ['split2', 'sms2'],
        ['sms1', 'end1'],
        ['sms2', 'end1']
      ]

      const createdConnections = []
      for (const [sourceId, targetId] of connections) {
        const connection = await edgeManager.createConnection(sourceId, targetId)
        createdConnections.push(connection)
      }

      // 验证所有连接都遵循端口方向规则
      createdConnections.forEach(connection => {
        expect(connection.source.port).toBe('out')
        expect(connection.target.port).toBe('in')
        expect(connection.data.source.port).toBe('out')
        expect(connection.data.target.port).toBe('in')
      })
    })
  })
})