import { vi } from 'vitest'

/**
 * 创建标准的预览线测试环境
 * @param {Object} options - 配置选项
 * @param {boolean} options.enableEventSystem - 是否启用事件系统
 * @param {boolean} options.layoutEngineReady - 布局引擎是否就绪
 * @returns {Object} 测试环境对象
 */
export function createPreviewLineTestEnvironment(options = {}) {
  const {
    enableEventSystem = true,
    layoutEngineReady = true
  } = options

  // 存储节点和边的数据
  const nodes = new Map()
  const edges = new Map()

  // 创建模拟的图实例
  const mockGraph = {
    // 基础方法
    hasCell: vi.fn((id) => nodes.has(id) || edges.has(id)),
    
    // 节点管理
    getCellById: vi.fn((id) => nodes.get(id) || edges.get(id)),
    getNodes: vi.fn(() => Array.from(nodes.values())),
    addNode: vi.fn((node) => {
      nodes.set(node.id, node)
      return node
    }),
    removeNode: vi.fn((nodeId) => {
      nodes.delete(nodeId)
    }),

    // 边管理
    getEdges: vi.fn(() => Array.from(edges.values())),
    getOutgoingEdges: vi.fn((nodeId) => {
      return Array.from(edges.values()).filter(edge => 
        edge.getSourceCellId() === nodeId
      )
    }),
    getIncomingEdges: vi.fn((nodeId) => {
      return Array.from(edges.values()).filter(edge => 
        edge.getTargetCellId() === nodeId
      )
    }),
    addEdge: vi.fn((edgeConfig) => {
      const edge = createMockEdge(edgeConfig)
      edges.set(edge.id, edge)
      return edge
    }),
    removeEdge: vi.fn((edgeId) => {
      edges.delete(edgeId)
    }),
    removeCell: vi.fn((cellId) => {
      nodes.delete(cellId)
      edges.delete(cellId)
    }),

    // 事件系统
    on: enableEventSystem ? vi.fn() : vi.fn(() => {
      throw new Error('Event system not enabled')
    }),
    off: enableEventSystem ? vi.fn() : vi.fn(() => {
      throw new Error('Event system not enabled')
    }),
    emit: enableEventSystem ? vi.fn() : vi.fn(() => {
      throw new Error('Event system not enabled')
    }),

    // 其他方法
    toJSON: vi.fn(() => ({
      cells: [...Array.from(nodes.values()), ...Array.from(edges.values())]
    })),
    fromJSON: vi.fn(),
    clearCells: vi.fn(() => {
      nodes.clear()
      edges.clear()
    })
  }

  // 创建模拟的布局引擎
  const mockLayoutEngine = {
    isReady: () => layoutEngineReady,
    updatePreviewManager: vi.fn(),
    getNodePosition: vi.fn((nodeId) => ({ x: 100, y: 100 })),
    calculatePortPosition: vi.fn(() => ({ x: 120, y: 110 }))
  }

  // 创建模拟的预览线管理器
  const mockPreviewManager = {
    validator: {
      shouldCreatePreviewLine: vi.fn(() => true),
      validateNodeConfiguration: vi.fn((node, nodeType, nodeData) => {
        // 模拟验证逻辑
        if (!nodeData) return { isConfigured: false }
        
        // 检查是否有有效配置 - 支持嵌套的config对象
        let hasValidConfig = false
        if (nodeData.config && nodeData.config.taskId) {
          hasValidConfig = nodeData.config.taskId !== ''
        } else if (nodeData.taskId) {
          hasValidConfig = nodeData.taskId !== ''
        }
        
        return {
          isConfigured: hasValidConfig,
          hasValidConfig: hasValidConfig,
          configData: nodeData
        }
      }),
      shouldCreatePreviewLineWithDetails: vi.fn((node) => {
        if (!node || typeof node.getData !== 'function') {
          return { shouldCreate: false, reason: '无效节点' }
        }
        
        const data = node.getData()
        if (!data || !data.isConfigured) {
          return { shouldCreate: false, reason: '节点未配置，跳过预览线创建' }
        }
        
        return { shouldCreate: true, reason: 'Node is configured and has no connections' }
      })
    },
    configManager: {
      getNodeConfig: vi.fn(() => ({})),
      isNodeConfigured: vi.fn(() => true)
    },
    renderer: {
      createPreviewLine: vi.fn(() => ({
        id: 'preview-line-' + Date.now(),
        remove: vi.fn()
      })),
      removePreviewLine: vi.fn(),
      updatePreviewLine: vi.fn()
    }
  }

  // 辅助方法：添加节点
  function addNode(nodeConfig) {
    const node = createMockNode(nodeConfig)
    nodes.set(node.id, node)
    return node
  }

  // 辅助方法：添加边
  function addEdge(edgeConfig) {
    const edge = createMockEdge(edgeConfig)
    edges.set(edge.id, edge)
    return edge
  }

  // 辅助方法：清理环境
  function cleanup() {
    nodes.clear()
    edges.clear()
    vi.clearAllMocks()
  }

  return {
    mockGraph,
    mockLayoutEngine,
    mockPreviewManager,
    addNode,
    addEdge,
    cleanup,
    nodes,
    edges
  }
}

/**
 * 创建模拟节点
 */
function createMockNode(config) {
  const {
    id,
    type = 'default',
    data = {},
    position = { x: 100, y: 100 },
    size = { width: 80, height: 40 }
  } = config

  return {
    id,
    type,
    getData: vi.fn(() => data),
    setData: vi.fn((newData) => {
      Object.assign(data, newData)
    }),
    getPosition: vi.fn(() => position),
    setPosition: vi.fn((newPosition) => {
      Object.assign(position, newPosition)
    }),
    getSize: vi.fn(() => size),
    setSize: vi.fn((newSize) => {
      Object.assign(size, newSize)
    }),
    getBBox: vi.fn(() => ({
      x: position.x,
      y: position.y,
      width: size.width,
      height: size.height
    })),
    isNode: () => true,
    isEdge: () => false,
    attr: vi.fn(),
    setAttrs: vi.fn(),
    remove: vi.fn()
  }
}

/**
 * 创建模拟边
 */
function createMockEdge(config) {
  const {
    id,
    source,
    target,
    data = {},
    sourcePort,
    targetPort
  } = config

  return {
    id,
    getData: vi.fn(() => data),
    setData: vi.fn((newData) => {
      Object.assign(data, newData)
    }),
    getSourceCellId: vi.fn(() => source),
    getTargetCellId: vi.fn(() => target),
    getSourcePortId: vi.fn(() => sourcePort),
    getTargetPortId: vi.fn(() => targetPort),
    isNode: () => false,
    isEdge: () => true,
    attr: vi.fn(),
    setAttrs: vi.fn(),
    setRouter: vi.fn(),
    getLabels: vi.fn(() => []),
    setLabels: vi.fn(),
    remove: vi.fn()
  }
}

/**
 * 创建AI外呼节点的测试环境
 */
export function createAICallNodeTestEnvironment() {
  const testEnv = createPreviewLineTestEnvironment()
  
  // 添加AI外呼节点特定的mock方法
  testEnv.mockPreviewManager.validator.shouldCreatePreviewLine = vi.fn((node) => {
    if (!node || typeof node.getData !== 'function') return false
    
    const data = node.getData()
    if (!data || !data.isConfigured) return false
    
    const outgoingEdges = testEnv.mockGraph.getOutgoingEdges(node.id)
    return outgoingEdges.length === 0
  })

  return testEnv
}

/**
 * 创建手动外呼节点的测试环境
 */
export function createManualCallNodeTestEnvironment() {
  const testEnv = createPreviewLineTestEnvironment()
  
  // 添加手动外呼节点特定的mock方法
  testEnv.mockPreviewManager.validator.shouldCreatePreviewLine = vi.fn((node) => {
    if (!node || typeof node.getData !== 'function') return false
    
    const data = node.getData()
    if (!data || data.type !== 'manual-call') return false
    if (!data.isConfigured) return false
    
    const outgoingEdges = testEnv.mockGraph.getOutgoingEdges(node.id)
    return outgoingEdges.length === 0
  })

  return testEnv
}