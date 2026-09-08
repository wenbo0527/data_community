/**
 * 画布状态管理组合函数
 * 负责管理画布的所有响应式状态、计算属性和状态相关的工具函数
 */
import { ref, computed, reactive } from 'vue'

export function useCanvasState() {
  // ==================== 基础状态 ====================
  
  // 画布容器引用
  const canvasContainer = ref(null)
  const minimapContainer = ref(null)
  
  // 图实例就绪状态
  const isGraphReady = ref(false)
  const isInitializationComplete = ref(false)
  
  // ==================== 数据状态 ====================
  
  // 节点和连接数据
  const nodes = ref([])
  const connections = ref([])
  
  // 选中状态
  const selectedNodeId = ref(null)
  const selectedNode = ref(null) // 添加缺失的单个选中节点状态
  const selectedNodes = ref([])
  const selectedEdges = ref([])
  const selectedEdgeId = ref(null) // 添加缺失的连接线选中ID状态
  
  // ==================== UI状态 ====================
  
  // 缩放显示状态
  const showZoomDisplay = ref(false)
  const currentZoom = ref(1)
  
  // 节点选择器状态
  const showNodeSelector = ref(false)
  const nodeSelectorPosition = ref({ x: 0, y: 0 })
  const nodeSelectorSourceNode = ref(null)
  
  // 配置抽屉状态
  const showConfigDrawer = ref(false)
  const selectedNodeData = ref(null)
  const showStartNodeConfigDrawer = ref(false)
  const selectedStartNodeData = ref(null)
  const showUnifiedConfigDrawer = ref(false)
  
  // ==================== 交互状态 ====================
  
  // 拖拽状态
  const isDragging = ref(false)
  const dragNodeType = ref(null)
  const dragMode = ref('normal') // 'normal' | 'batch' | 'precision'
  
  // 删除状态
  const isDeleting = ref(false)
  
  // 手动布局状态
  const isManualLayout = ref(false)
  
  // 预览线生成状态
  const isGeneratingPreviewLines = ref(false)
  
  // ==================== 缩放相关状态 ====================
  
  const zoomLevel = ref(1)
  const minZoom = ref(0.1)
  const maxZoom = ref(3)
  
  // 画布缩放和平移状态
  const canvasScale = ref(1)
  const canvasTranslate = ref({ x: 0, y: 0 })
  
  // ==================== 撤销重做状态 ====================
  
  const canUndo = ref(false)
  const canRedo = ref(false)
  
  // ==================== 历史面板状态 ====================
  
  const showHistoryPanel = ref(false)
  const historyList = ref([])
  
  // ==================== 防护标志 ====================
  
  const isUpdatingScale = ref(false)
  const isUpdatingLayout = ref(false)
  
  // ==================== 布局统计 ====================
  
  const layoutStats = reactive({
    totalNodes: 0,
    connectedNodes: 0,
    isolatedNodes: 0,
    totalConnections: 0,
    layoutDepth: 0,
    lastLayoutTime: null
  })
  
  // ==================== 管理器实例状态 ====================
  
  const configDrawers = ref(null)
  const previewLineSystem = ref(null)
  const unifiedEdgeManager = ref(null)
  const coordinateManager = ref(null)
  const dragZoomManager = ref(null)
  const connectionOverlapManager = ref(null)
  
  // ==================== 调试面板状态 ====================
  
  const showDebugPanel = ref(false)
  const debugStats = reactive({
    nodeCount: 0,
    edgeCount: 0,
    previewLineCount: 0,
    memoryUsage: 0,
    renderTime: 0,
    lastUpdate: null
  })
  
  // ==================== 连接线右键菜单状态 ====================
  
  const showEdgeContextMenu = ref(false)
  const edgeContextMenuPosition = ref({ x: 0, y: 0 })
  const selectedEdge = ref(null)
  
  // 统一的右键菜单状态对象
  const edgeContextMenu = ref({
    visible: false,
    x: 0,
    y: 0,
    edge: null
  })
  
  // ==================== 布局方向状态 ====================
  
  const layoutDirection = ref('TB') // 'TB' | 'LR' | 'BT' | 'RL'
  
  // ==================== 拖拽会话管理 ====================
  
  const currentDragSession = ref(null)
  const dragSessionData = ref(new Map())
  const processedPreviewLines = ref(new Set())
  const connectionCreationLocks = ref(new Map())
  const snapDebounceTimer = ref(null)
  
  // ==================== 计算属性 ====================
  
  // 是否有选中的节点
  const hasSelectedNode = computed(() => {
    return selectedNodeId.value !== null || selectedNodes.value.length > 0
  })
  
  // 是否有选中的边
  const hasSelectedEdge = computed(() => {
    return selectedEdges.value.length > 0
  })
  
  // 当前缩放百分比
  const zoomPercentage = computed(() => {
    return Math.round(currentZoom.value * 100)
  })
  
  // 是否可以进行布局操作
  const canPerformLayout = computed(() => {
    return isGraphReady.value && 
           !isUpdatingLayout.value && 
           nodes.value.length > 0
  })
  
  // 节点统计信息
  const nodeStats = computed(() => {
    const stats = {
      total: nodes.value.length,
      configured: 0,
      unconfigured: 0,
      byType: {}
    }
    
    nodes.value.forEach(node => {
      // 统计配置状态
      if (node.data?.isConfigured || node.config) {
        stats.configured++
      } else {
        stats.unconfigured++
      }
      
      // 按类型统计
      const nodeType = node.type || 'unknown'
      stats.byType[nodeType] = (stats.byType[nodeType] || 0) + 1
    })
    
    return stats
  })
  
  // 连接统计信息
  const connectionStats = computed(() => {
    return {
      total: connections.value.length,
      byType: connections.value.reduce((acc, conn) => {
        const type = conn.type || 'default'
        acc[type] = (acc[type] || 0) + 1
        return acc
      }, {})
    }
  })
  
  // 画布是否为空
  const isCanvasEmpty = computed(() => {
    return nodes.value.length === 0 && connections.value.length === 0
  })
  
  // 是否处于只读模式
  const isReadOnly = computed(() => {
    return false // 可以根据需要动态设置
  })
  
  // ==================== 状态管理方法 ====================
  
  /**
   * 重置所有状态
   */
  const resetAllState = () => {
    console.log('[useCanvasState] 开始重置所有状态')
    
    // 重置基础状态
    isGraphReady.value = false
    isInitializationComplete.value = false
    
    // 重置数据状态
    nodes.value = []
    connections.value = []
    
    // 重置选中状态
    selectedNodeId.value = null
    selectedNode.value = null
    selectedNodes.value = []
    selectedEdges.value = []
    
    // 重置UI状态
    showZoomDisplay.value = false
    currentZoom.value = 1
    showNodeSelector.value = false
    nodeSelectorPosition.value = { x: 0, y: 0 }
    nodeSelectorSourceNode.value = null
    showConfigDrawer.value = false
    selectedNodeData.value = null
    showStartNodeConfigDrawer.value = false
    selectedStartNodeData.value = null
    showUnifiedConfigDrawer.value = false
    
    // 重置交互状态
    isDragging.value = false
    dragNodeType.value = null
    dragMode.value = 'normal'
    isDeleting.value = false
    isManualLayout.value = false
    
    // 重置缩放状态
    zoomLevel.value = 1
    
    // 重置撤销重做状态
    canUndo.value = false
    canRedo.value = false
    
    // 重置历史面板状态
    showHistoryPanel.value = false
    historyList.value = []
    
    // 重置防护标志
    isUpdatingScale.value = false
    isUpdatingLayout.value = false
    
    // 重置布局统计
    Object.assign(layoutStats, {
      totalNodes: 0,
      connectedNodes: 0,
      isolatedNodes: 0,
      totalConnections: 0,
      layoutDepth: 0,
      lastLayoutTime: null
    })
    
    // 重置调试状态
    showDebugPanel.value = false
    Object.assign(debugStats, {
      nodeCount: 0,
      edgeCount: 0,
      previewLineCount: 0,
      memoryUsage: 0,
      renderTime: 0,
      lastUpdate: null
    })
    
    // 重置右键菜单状态
    showEdgeContextMenu.value = false
    edgeContextMenuPosition.value = { x: 0, y: 0 }
    selectedEdge.value = null
    edgeContextMenu.value = {
      visible: false,
      x: 0,
      y: 0,
      edge: null
    }
    
    // 重置布局方向
    layoutDirection.value = 'TB'
    
    // 重置拖拽会话
    currentDragSession.value = null
    dragSessionData.value.clear()
    processedPreviewLines.value.clear()
    connectionCreationLocks.value.clear()
    
    if (snapDebounceTimer.value) {
      clearTimeout(snapDebounceTimer.value)
      snapDebounceTimer.value = null
    }
    
    console.log('[useCanvasState] 所有状态重置完成')
  }
  
  /**
   * 更新布局统计
   * @param {Object} stats - 统计数据
   */
  const updateLayoutStats = (stats = {}) => {
    Object.assign(layoutStats, {
      ...stats,
      lastLayoutTime: new Date().toISOString()
    })
  }
  
  /**
   * 更新调试统计
   * @param {Object} stats - 调试统计数据
   */
  const updateDebugStats = (stats = {}) => {
    Object.assign(debugStats, {
      ...stats,
      lastUpdate: new Date().toISOString()
    })
  }
  
  /**
   * 添加节点到状态
   * @param {Object} nodeData - 节点数据
   */
  const addNodeToState = (nodeData) => {
    if (!nodeData || !nodeData.id) {
      console.warn('[useCanvasState] 无效的节点数据:', nodeData)
      return
    }
    
    // 检查是否已存在
    const existingIndex = nodes.value.findIndex(n => n.id === nodeData.id)
    if (existingIndex >= 0) {
      console.warn('[useCanvasState] 节点已存在，更新数据:', nodeData.id)
      nodes.value[existingIndex] = { ...nodes.value[existingIndex], ...nodeData }
    } else {
      nodes.value.push(nodeData)
      console.log('[useCanvasState] 节点已添加到状态:', nodeData.id)
    }
  }
  
  /**
   * 从状态中移除节点
   * @param {string} nodeId - 节点ID
   */
  const removeNodeFromState = (nodeId) => {
    const index = nodes.value.findIndex(n => n.id === nodeId)
    if (index >= 0) {
      nodes.value.splice(index, 1)
      console.log('[useCanvasState] 节点已从状态中移除:', nodeId)
      
      // 如果是选中的节点，清除选中状态
      if (selectedNodeId.value === nodeId) {
        selectedNodeId.value = null
      }
      
      // 从选中节点列表中移除
      const selectedIndex = selectedNodes.value.findIndex(n => n.id === nodeId)
      if (selectedIndex >= 0) {
        selectedNodes.value.splice(selectedIndex, 1)
      }
    }
  }
  
  /**
   * 添加连接到状态
   * @param {Object} connectionData - 连接数据
   */
  const addConnectionToState = (connectionData) => {
    if (!connectionData || !connectionData.id) {
      console.warn('[useCanvasState] 无效的连接数据:', connectionData)
      return
    }
    
    // 检查是否已存在
    const existingIndex = connections.value.findIndex(c => c.id === connectionData.id)
    if (existingIndex >= 0) {
      console.warn('[useCanvasState] 连接已存在，更新数据:', connectionData.id)
      connections.value[existingIndex] = { ...connections.value[existingIndex], ...connectionData }
    } else {
      connections.value.push(connectionData)
      console.log('[useCanvasState] 连接已添加到状态:', connectionData.id)
    }
  }
  
  /**
   * 从状态中移除连接
   * @param {string} connectionId - 连接ID
   */
  const removeConnectionFromState = (connectionId) => {
    const index = connections.value.findIndex(c => c.id === connectionId)
    if (index >= 0) {
      connections.value.splice(index, 1)
      console.log('[useCanvasState] 连接已从状态中移除:', connectionId)
    }
  }
  
  /**
   * 等待初始化完成
   * @param {number} timeout - 超时时间（毫秒）
   * @returns {Promise<boolean>} 是否初始化完成
   */
  const waitForInitialization = (timeout = 5000) => {
    return new Promise((resolve) => {
      if (isInitializationComplete.value) {
        resolve(true)
        return
      }
      
      const startTime = Date.now()
      const checkInterval = setInterval(() => {
        if (isInitializationComplete.value) {
          clearInterval(checkInterval)
          resolve(true)
        } else if (Date.now() - startTime > timeout) {
          clearInterval(checkInterval)
          console.warn('[useCanvasState] 等待初始化超时')
          resolve(false)
        }
      }, 100)
    })
  }
  
  return {
    // ==================== 基础状态 ====================
    canvasContainer,
    minimapContainer,
    isGraphReady,
    isInitializationComplete,
    
    // ==================== 数据状态 ====================
    nodes,
    connections,
    selectedNodeId,
    selectedNode, // 添加到导出列表
    selectedNodes,
    selectedEdges,
    selectedEdgeId, // 添加到导出列表
    
    // ==================== UI状态 ====================
    showZoomDisplay,
    currentZoom,
    showNodeSelector,
    nodeSelectorPosition,
    nodeSelectorSourceNode,
    showConfigDrawer,
    selectedNodeData,
    showStartNodeConfigDrawer,
    selectedStartNodeData,
    showUnifiedConfigDrawer,
    
    // ==================== 交互状态 ====================
    isDragging,
    dragNodeType,
    dragMode,
    isDeleting,
    isManualLayout,
    isGeneratingPreviewLines,
    
    // ==================== 缩放相关状态 ====================
    zoomLevel,
    minZoom,
    maxZoom,
    canvasScale,
    canvasTranslate,
    
    // ==================== 撤销重做状态 ====================
    canUndo,
    canRedo,
    
    // ==================== 历史面板状态 ====================
    showHistoryPanel,
    historyList,
    
    // ==================== 防护标志 ====================
    isUpdatingScale,
    isUpdatingLayout,
    
    // ==================== 布局统计 ====================
    layoutStats,
    
    // ==================== 管理器实例状态 ====================
    configDrawers,
    previewLineSystem,
    unifiedEdgeManager,
    coordinateManager,
    dragZoomManager,
    connectionOverlapManager,
    
    // ==================== 调试面板状态 ====================
    showDebugPanel,
    debugStats,
    
    // ==================== 连接线右键菜单状态 ====================
    showEdgeContextMenu,
    edgeContextMenuPosition,
    selectedEdge,
    edgeContextMenu,
    
    // ==================== 布局方向状态 ====================
    layoutDirection,
    
    // ==================== 拖拽会话管理 ====================
    currentDragSession,
    dragSessionData,
    processedPreviewLines,
    connectionCreationLocks,
    snapDebounceTimer,
    
    // ==================== 计算属性 ====================
    hasSelectedNode,
    hasSelectedEdge,
    zoomPercentage,
    canPerformLayout,
    nodeStats,
    connectionStats,
    isCanvasEmpty,
    isReadOnly,
    
    // ==================== 状态管理方法 ====================
    resetAllState,
    updateLayoutStats,
    updateDebugStats,
    addNodeToState,
    removeNodeFromState,
    addConnectionToState,
    removeConnectionFromState,
    waitForInitialization
  }
}