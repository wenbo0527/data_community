/**
 * 端口连接验证测试
 * 验证连接线从源节点的out端口连接到目标节点的in端口
 */

// Mock Graph 类
class MockGraph {
  constructor() {
    this.edges = new Map()
    this.nodes = new Map()
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

  addNode(nodeData) {
    const node = {
      id: nodeData.id || `node_${Date.now()}_${Math.random()}`,
      ...nodeData
    }
    this.nodes.set(node.id, node)
    return node
  }

  getNodes() {
    return Array.from(this.nodes.values())
  }
}

// Mock UnifiedEdgeManager
class MockUnifiedEdgeManager {
  constructor(graph) {
    this.graph = graph
    this.previewLines = new Map()
    this.connections = new Map()
  }

  async createConnection(sourceNodeId, targetNodeId, options = {}) {
    const connectionData = {
      type: 'CONNECTION',
      source: { nodeId: sourceNodeId, port: options.sourcePort || 'out' },
      target: { nodeId: targetNodeId, port: options.targetPort || 'in' },
      isPreview: false,
      isConnected: true,
      branchId: options.branchId,
      branchLabel: options.branchLabel
    }

    const edge = this.graph.addEdge({
      id: `connection_${sourceNodeId}_${targetNodeId}`,
      source: { cell: sourceNodeId, port: connectionData.source.port },
      target: { cell: targetNodeId, port: connectionData.target.port },
      data: connectionData
    })

    this.connections.set(edge.id, edge)
    return edge
  }

  async createPreviewLine(sourceNodeId, options = {}) {
    const previewData = {
      type: 'PREVIEW',
      source: { nodeId: sourceNodeId, port: options.sourcePort || 'out' },
      target: null,
      isPreview: true,
      isConnected: false,
      branchId: options.branchId
    }

    const edge = this.graph.addEdge({
      id: `preview_${sourceNodeId}_${Date.now()}`,
      source: { cell: sourceNodeId, port: previewData.source.port },
      target: null,
      data: previewData
    })

    this.previewLines.set(edge.id, edge)
    return edge
  }

  async convertPreviewToConnection(previewId, targetNodeId, options = {}) {
    const preview = this.previewLines.get(previewId)
    if (!preview) {
      throw new Error('预览线不存在')
    }

    // 更新预览线为连接线
    preview.target = { cell: targetNodeId, port: options.targetPort || 'in' }
    preview.data.type = 'CONNECTION'
    preview.data.target = { nodeId: targetNodeId, port: options.targetPort || 'in' }
    preview.data.isPreview = false
    preview.data.isConnected = true

    // 移动到连接线集合
    this.previewLines.delete(previewId)
    this.connections.set(previewId, preview)

    return preview
  }
}

describe('端口连接验证测试', () => {
  let graph
  let edgeManager

  beforeEach(() => {
    graph = new MockGraph()
    edgeManager = new MockUnifiedEdgeManager(graph)
  })

  test('创建连接线时应使用正确的默认端口配置', async () => {
    // 添加测试节点
    const sourceNode = graph.addNode({ id: 'node1', type: 'start' })
    const targetNode = graph.addNode({ id: 'node2', type: 'action' })

    // 创建连接线（不指定端口，使用默认值）
    const connection = await edgeManager.createConnection('node1', 'node2')

    // 验证端口配置
    expect(connection.source.port).toBe('out')
    expect(connection.target.port).toBe('in')
    expect(connection.data.source.port).toBe('out')
    expect(connection.data.target.port).toBe('in')
  })

  test('创建连接线时应支持自定义端口配置', async () => {
    // 添加测试节点
    const sourceNode = graph.addNode({ id: 'node1', type: 'start' })
    const targetNode = graph.addNode({ id: 'node2', type: 'action' })

    // 创建连接线（指定自定义端口）
    const connection = await edgeManager.createConnection('node1', 'node2', {
      sourcePort: 'custom-out',
      targetPort: 'custom-in'
    })

    // 验证端口配置
    expect(connection.source.port).toBe('custom-out')
    expect(connection.target.port).toBe('custom-in')
    expect(connection.data.source.port).toBe('custom-out')
    expect(connection.data.target.port).toBe('custom-in')
  })

  test('创建预览线时应使用正确的默认源端口', async () => {
    // 添加测试节点
    const sourceNode = graph.addNode({ id: 'node1', type: 'start' })

    // 创建预览线（不指定端口，使用默认值）
    const preview = await edgeManager.createPreviewLine('node1')

    // 验证源端口配置
    expect(preview.source.port).toBe('out')
    expect(preview.data.source.port).toBe('out')
  })

  test('预览线转换为连接线时应使用正确的默认目标端口', async () => {
    // 添加测试节点
    const sourceNode = graph.addNode({ id: 'node1', type: 'start' })
    const targetNode = graph.addNode({ id: 'node2', type: 'action' })

    // 创建预览线
    const preview = await edgeManager.createPreviewLine('node1')

    // 转换为连接线（不指定目标端口，使用默认值）
    const connection = await edgeManager.convertPreviewToConnection(preview.id, 'node2')

    // 验证端口配置
    expect(connection.source.port).toBe('out')
    expect(connection.target.port).toBe('in')
    expect(connection.data.source.port).toBe('out')
    expect(connection.data.target.port).toBe('in')
  })

  test('预览线转换为连接线时应支持自定义目标端口', async () => {
    // 添加测试节点
    const sourceNode = graph.addNode({ id: 'node1', type: 'start' })
    const targetNode = graph.addNode({ id: 'node2', type: 'action' })

    // 创建预览线
    const preview = await edgeManager.createPreviewLine('node1')

    // 转换为连接线（指定自定义目标端口）
    const connection = await edgeManager.convertPreviewToConnection(preview.id, 'node2', {
      targetPort: 'custom-in'
    })

    // 验证端口配置
    expect(connection.source.port).toBe('out')
    expect(connection.target.port).toBe('custom-in')
    expect(connection.data.source.port).toBe('out')
    expect(connection.data.target.port).toBe('custom-in')
  })

  test('分支连接线应使用统一的out端口作为源端口', async () => {
    // 添加测试节点
    const sourceNode = graph.addNode({ id: 'node1', type: 'event-split' })
    const targetNode = graph.addNode({ id: 'node2', type: 'action' })

    // 创建分支连接线
    const connection = await edgeManager.createConnection('node1', 'node2', {
      branchId: 'branch1',
      branchLabel: '是'
    })

    // 验证分支连接线使用统一的out端口
    expect(connection.source.port).toBe('out')
    expect(connection.target.port).toBe('in')
    expect(connection.data.branchId).toBe('branch1')
    expect(connection.data.branchLabel).toBe('是')
  })

  test('多个分支连接线应都从同一个out端口出发', async () => {
    // 添加测试节点
    const sourceNode = graph.addNode({ id: 'node1', type: 'event-split' })
    const targetNode1 = graph.addNode({ id: 'node2', type: 'action' })
    const targetNode2 = graph.addNode({ id: 'node3', type: 'action' })

    // 创建多个分支连接线
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

    // 验证分支信息
    expect(connection1.data.branchId).toBe('branch1')
    expect(connection2.data.branchId).toBe('branch2')
  })

  test('验证端口连接方向的正确性', async () => {
    // 添加测试节点
    const sourceNode = graph.addNode({ id: 'node1', type: 'start' })
    const targetNode = graph.addNode({ id: 'node2', type: 'action' })

    // 创建连接线
    const connection = await edgeManager.createConnection('node1', 'node2')

    // 验证连接方向：从out端口到in端口
    const sourcePort = connection.data.source.port
    const targetPort = connection.data.target.port

    // 验证源端口是输出端口
    expect(sourcePort).toBe('out')
    expect(sourcePort.toLowerCase().includes('out') || sourcePort === 'out').toBe(true)

    // 验证目标端口是输入端口
    expect(targetPort).toBe('in')
    expect(targetPort.toLowerCase().includes('in') || targetPort === 'in').toBe(true)
  })
})