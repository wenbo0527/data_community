import { ref, computed, onUnmounted } from 'vue'
import { useEventManager } from '../../utils/canvas/EventManagerBase.js'
import { ErrorHandler } from '../../utils/canvas/ErrorHandler.js'

export function useCanvasSelection(graph, emit) {
  const selectedNodes = ref([])
  const selectedEdges = ref([])
  const selectedNodeId = ref(null)
  const selectedConnectionId = ref(null)
  const showContextMenu = ref(false)
  const contextMenuPosition = ref({ x: 0, y: 0 })
  const showToolbar = ref(false)
  const toolbarPosition = ref({ x: 0, y: 0 })
  const showNodeToolbar = ref(false)
  const showConnectionMenu = ref(false)
  const nodeToolbarPosition = ref({ x: 0, y: 0 })
  const connectionMenuPosition = ref({ x: 0, y: 0 })

  // 使用事件管理器
  const { eventManager, addGraphEvent, addDomEvent, cleanup } = useEventManager(graph)

  // 选择节点
  const selectNode = (nodeId) => {
    if (!selectedNodes.value.includes(nodeId)) {
      selectedNodes.value.push(nodeId)
    }
    selectedNodeId.value = nodeId
  }

  // 选择边
  const selectEdge = (edgeId) => {
    if (!selectedEdges.value.includes(edgeId)) {
      selectedEdges.value.push(edgeId)
    }
    selectedConnectionId.value = edgeId
  }

  // 清除选择
  const clearSelection = () => {
    selectedNodes.value = []
    selectedEdges.value = []
    selectedNodeId.value = null
    selectedConnectionId.value = null
  }

  // 显示节点工具栏
  const showNodeToolbarFunc = (node, e) => {
    const bbox = node.getBBox()
    nodeToolbarPosition.value = {
      x: bbox.x + bbox.width + 10,
      y: bbox.y
    }
    showNodeToolbar.value = true
  }

  // 隐藏上下文菜单
  const hideContextMenu = () => {
    showContextMenu.value = false
  }

  // 隐藏工具栏
  const hideToolbar = () => {
    showToolbar.value = false
  }

  // 设置事件监听器
  const setupEventListeners = () => {
    if (!graph.value) return

    // 使用事件管理器批量添加图形事件
    addGraphEvent('node:click', ErrorHandler.wrapEventHandler((args) => {
      const { node, e } = args
      e.stopPropagation()
      
      if (!e.ctrlKey && !e.metaKey) {
        clearSelection()
      }
      
      selectNode(node.id)
      // 移除工具栏显示，交由useX6Events处理配置弹窗
      emit('node-selected', node.id)
    }, 'node:click'))

    addGraphEvent('edge:click', ErrorHandler.wrapEventHandler((args) => {
      const { edge, e } = args
      e.stopPropagation()
      
      if (!e.ctrlKey && !e.metaKey) {
        clearSelection()
      }
      
      selectEdge(edge.id)
      emit('edge-selected', edge.id)
    }, 'edge:click'))

    addGraphEvent('blank:click', ErrorHandler.wrapEventHandler(() => {
      clearSelection()
      hideContextMenu()
      hideToolbar()
    }, 'blank:click'))

    // 移除右键菜单交互，统一使用点击弹窗交互
    // addGraphEvent('node:contextmenu', ...)
    // addGraphEvent('edge:contextmenu', ...)

    // 添加DOM事件
    addDomEvent(document, 'click', () => {
      hideContextMenu()
      hideToolbar()
    })
  }

  // 处理节点点击 - 简化处理，不显示工具栏
  const handleNodeClick = ({ node, e }) => {
    selectedNodeId.value = node.id
    selectedConnectionId.value = null
    hideConnectionMenu()
    hideNodeToolbar()
  }

  // 处理连接线点击
  const handleEdgeClick = ({ edge, e }) => {
    selectedConnectionId.value = edge.id
    selectedNodeId.value = null
    hideNodeToolbar()
  }

  // 处理空白区域点击
  const handleBlankClick = () => {
    selectedNodeId.value = null
    selectedConnectionId.value = null
    hideNodeToolbar()
    hideConnectionMenu()
  }

  // 右键菜单处理函数已移除，统一使用点击弹窗交互

  // 隐藏节点工具栏
  const hideNodeToolbar = () => {
    showNodeToolbar.value = false
    selectedNodeId.value = null
  }

  // 隐藏连接菜单
  const hideConnectionMenu = () => {
    showConnectionMenu.value = false
    selectedConnectionId.value = null
  }

  // 设置选择功能
  const setupSelection = () => {
    setupEventListeners()
  }

  // 清理事件监听器（由事件管理器自动处理）
  const cleanupEventListeners = () => {
    // 事件管理器会在组件卸载时自动清理所有事件
    cleanup()
  }

  onUnmounted(() => {
    cleanupEventListeners()
  })

  return {
    selectedNodeId,
    selectedConnectionId,
    showNodeToolbar,
    showConnectionMenu,
    nodeToolbarPosition,
    connectionMenuPosition,
    setupSelection,
    hideNodeToolbar,
    hideConnectionMenu,
    cleanup
  }
}