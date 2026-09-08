/**
 * 标准化的Mock工厂函数
 * 用于创建一致的测试Mock对象
 */
import { vi } from 'vitest'

/**
 * 创建标准的Graph Mock对象
 */
export function createMockGraph() {
  return {
    getCellById: vi.fn((id) => null),
    getOutgoingEdges: vi.fn(() => []),
    getIncomingEdges: vi.fn(() => []),
    getEdges: vi.fn(() => []),
    addNode: vi.fn(),
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
      getData: vi.fn(() => ({ type: 'unified-preview-line' })),
      setData: vi.fn(),
      getSourcePoint: vi.fn(() => ({ x: 90, y: 90 })),
      getTargetPoint: vi.fn(() => ({ x: 210, y: 210 })),
      prop: vi.fn(),
      setVertices: vi.fn()
    })),
    removeEdge: vi.fn(),
    removeCell: vi.fn(),
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
    clientToGraph: vi.fn((x, y) => ({ x, y })),
    getCells: vi.fn(() => []),
    findView: vi.fn(() => null),
    // 历史记录功能
    isHistoryEnabled: vi.fn(() => true),
    enableHistory: vi.fn(),
    disableHistory: vi.fn(),
    undo: vi.fn(),
    redo: vi.fn(),
    canUndo: vi.fn(() => true),
    canRedo: vi.fn(() => false),
    history: {
      enabled: true
    }
  }
}

/**
 * 创建标准的Node Mock对象
 */
export function createMockNode(id = 'test-node', type = 'start', options = {}) {
  const nodeData = {
    type,
    nodeType: type,
    isConfigured: true,
    ...options
  }

  return {
    id,
    getData: vi.fn(() => ({ ...nodeData })),
    setData: vi.fn((newData) => {
      Object.assign(nodeData, newData)
    }),
    getPosition: vi.fn(() => options.position || { x: 100, y: 100 }),
    setPosition: vi.fn(),
    getSize: vi.fn(() => options.size || { width: 120, height: 60 }),
    getBBox: vi.fn(() => ({
      x: options.position?.x || 100,
      y: options.position?.y || 100,
      width: options.size?.width || 120,
      height: options.size?.height || 60
    })),
    removed: false,
    isRemoved: vi.fn(() => false),
    isNode: vi.fn(() => true),
    getPortProp: vi.fn((port, prop) => {
      if (port === 'out' && prop === 'position') {
        return { x: 1, y: 0.5 } // 右侧中心位置
      }
      if (port === 'in' && prop === 'position') {
        return { x: 0, y: 0.5 } // 左侧中心位置
      }
      return null
    }),
    trigger: vi.fn(),
    ...options.methods
  }
}

/**
 * 创建标准的PreviewLineSystem Mock对象
 */
export function createMockPreviewLineSystem(options = {}) {
  const mockSystem = {
    // 基础方法
    init: vi.fn(),
    destroy: vi.fn(),
    
    // 预览线管理
    createPreviewLine: vi.fn((options) => {
      // 模拟内部调用getSourcePort
      mockSystem.getSourcePort()
      return Promise.resolve({ id: 'preview-line-1' })
    }),
    removePreviewLine: vi.fn(),
    updatePreviewLine: vi.fn(),
    getPreviewLines: vi.fn().mockReturnValue([]),
    
    // 连接线管理
    createConnectionLine: vi.fn(),
    removeConnectionLine: vi.fn(),
    updateConnectionLine: vi.fn(),
    getConnectionLines: vi.fn().mockReturnValue([]),
    
    // 转换功能
    transformPreviewToConnection: vi.fn((options) => {
      // 模拟内部调用getTargetPort
      mockSystem.getTargetPort()
      return Promise.resolve()
    }),
    transformConnectionToPreview: vi.fn(),
    
    // 节点处理
    handleNodeDeletion: vi.fn((nodeId) => {
      // 模拟内部调用getBranchCount和transformConnectionToPreview
      mockSystem.getBranchCount()
      mockSystem.transformConnectionToPreview()
      return Promise.resolve()
    }),
    handleNodeCreation: vi.fn(),
    updateNodeConfiguration: vi.fn(),
    
    // 拖拽和吸附
    handleDragStart: vi.fn(),
    handleDragMove: vi.fn(),
    handleDragEnd: vi.fn(),
    handleSnapToNode: vi.fn(),
    
    // 布局相关
    updateLayout: vi.fn(),
    syncWithLayout: vi.fn(),
    
    // 验证功能
    validatePreviewLine: vi.fn().mockReturnValue(true),
    validateConnection: vi.fn().mockReturnValue(true),
    
    // 数量管理
    getBranchCount: vi.fn().mockReturnValue(1),
    updateBranchCount: vi.fn(),
    
    // 端口管理
    getSourcePort: vi.fn().mockReturnValue('out'),
    getTargetPort: vi.fn().mockReturnValue('in'),
    
    ...options
  }
  
  return mockSystem
}

/**
 * 创建标准的Canvas Mock对象
 */
export function createMockCanvas() {
  return {
    getContainer: vi.fn(() => ({
      getBoundingClientRect: () => ({
        left: 0,
        top: 0,
        width: 800,
        height: 600
      })
    })),
    getViewport: vi.fn(() => ({
      x: 0,
      y: 0,
      width: 800,
      height: 600
    })),
    zoom: vi.fn(),
    centerContent: vi.fn(),
    fitToContent: vi.fn(),
    translate: vi.fn(),
    getScale: vi.fn(() => 1),
    clientToLocal: vi.fn((x, y) => ({ x, y })),
    localToClient: vi.fn((x, y) => ({ x, y }))
  }
}

/**
 * 创建标准的Selection Mock对象
 */
export function createMockSelection() {
  const selectedCells = new Set()
  
  return {
    selectedCells,
    select: vi.fn((cell) => {
      selectedCells.add(cell)
    }),
    unselect: vi.fn((cell) => {
      selectedCells.delete(cell)
    }),
    clear: vi.fn(() => {
      selectedCells.clear()
    }),
    getSelectedCells: vi.fn(() => Array.from(selectedCells)),
    isEmpty: vi.fn(() => selectedCells.size === 0)
  }
}

/**
 * 创建完整的测试环境
 */
export function createTestEnvironment(options = {}) {
  const mockGraph = createMockGraph()
  const mockPreviewLineSystem = createMockPreviewLineSystem()
  const mockCanvas = createMockCanvas()
  const mockSelection = createMockSelection()
  
  // 拖拽状态管理器
  const dragStateManager = {
    currentState: 'idle',
    setState: vi.fn((state) => {
      dragStateManager.currentState = state
    }),
    getState: vi.fn(() => dragStateManager.currentState),
    resetDragInfo: vi.fn(() => {
      dragStateManager.currentState = 'idle'
    })
  }
  
  // 布局引擎
  const layoutEngine = {
    executeLayout: vi.fn().mockResolvedValue(true),
    updateGraph: vi.fn(),
    updatePreviewManager: vi.fn(),
    calculateLayout: vi.fn(() => ({
      nodePositions: {},
      previewLinePositions: {},
      layerPositions: [],
      reservedSpaces: {}
    })),
    isReady: true,
    isCacheHit: vi.fn(() => false),
    checkSpaceOverlap: vi.fn(() => false)
  }
  
  // 性能优化器
  const performanceOptimizer = {
    optimize: vi.fn(),
    getMetrics: vi.fn(() => ({
      duration: 100,
      operations: 5,
      memoryUsage: 1024
    }))
  }
  
  // 数据验证器
  const dataValidator = {
    validateNodeData: vi.fn((data) => {
      return data && data.type && data.isConfigured !== false
    }),
    validateEdgeData: vi.fn((data) => {
      return data && data.source && data.target
    })
  }
  
  // 吸附坐标系统
  const snapSystem = {
    checkPreviewLineSnap: vi.fn(() => ({
      canSnap: false,
      nearestPreviewLine: null,
      snapDistance: Infinity
    })),
    executePreviewLineSnap: vi.fn().mockResolvedValue({
      success: false,
      connectionCreated: false
    }),
    checkNodePortSnap: vi.fn(() => ({
      canSnap: false,
      targetNode: null,
      targetPort: null
    })),
    executePreviewLineEndSnap: vi.fn().mockResolvedValue({
      success: false,
      connectionCreated: false
    }),
    setHighlightCallback: vi.fn(),
    setClearHighlightCallback: vi.fn()
  }
  
  return {
    mockGraph,
    previewLineSystem: mockPreviewLineSystem,
    mockCanvas,
    mockSelection,
    dragStateManager,
    layoutEngine,
    performanceOptimizer,
    dataValidator,
    snapSystem,
    cleanup: () => {
      vi.clearAllMocks()
    }
  }
}

/**
 * 验证画布数据的辅助函数
 */
export function validateCanvasData(data) {
  if (!data || !data.nodes) {
    return { isValid: false, errors: ['数据格式无效'] }
  }
  
  const errors = []
  
  // 检查节点数据
  data.nodes.forEach((node, index) => {
    if (!node.id) {
      errors.push(`节点${index}缺少ID`)
    }
    if (!node.type) {
      errors.push(`节点${index}缺少类型`)
    }
    if (!node.position || typeof node.position.x !== 'number' || typeof node.position.y !== 'number') {
      errors.push(`节点${index}位置信息无效`)
    }
  })
  
  return {
    isValid: errors.length === 0,
    errors
  }
}