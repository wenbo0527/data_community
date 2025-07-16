/**
 * 画布状态管理 Composable
 * 提供统一的状态管理和操作方法
 */
import { ref, computed } from 'vue'

export function useCanvasState() {
  // 核心状态
  const nodes = ref([])
  const connections = ref([])
  const selectedNodeId = ref(null)
  
  // 计算属性
  const selectedNode = computed(() => 
    nodes.value.find(node => node.id === selectedNodeId.value) || null
  )
  
  const nodeCount = computed(() => nodes.value.length)
  const connectionCount = computed(() => connections.value.length)
  
  // 状态操作方法
  const addNode = (nodeData) => {
    nodes.value.push(nodeData)
  }
  
  const removeNode = (nodeId) => {
    const index = nodes.value.findIndex(n => n.id === nodeId)
    if (index >= 0) {
      nodes.value.splice(index, 1)
    }
  }
  
  const updateNode = (nodeId, updates) => {
    const index = nodes.value.findIndex(n => n.id === nodeId)
    if (index >= 0) {
      nodes.value[index] = { ...nodes.value[index], ...updates }
    }
  }
  
  const addConnection = (connectionData) => {
    connections.value.push(connectionData)
  }
  
  const removeConnection = (connectionId) => {
    const index = connections.value.findIndex(c => c.id === connectionId)
    if (index >= 0) {
      connections.value.splice(index, 1)
    }
  }
  
  const clearAll = () => {
    nodes.value = []
    connections.value = []
    selectedNodeId.value = null
  }
  
  const selectNode = (nodeId) => {
    selectedNodeId.value = nodeId
  }
  
  const clearSelection = () => {
    selectedNodeId.value = null
  }
  
  return {
    // 状态
    nodes,
    connections,
    selectedNodeId,
    selectedNode,
    nodeCount,
    connectionCount,
    
    // 操作方法
    addNode,
    removeNode,
    updateNode,
    addConnection,
    removeConnection,
    clearAll,
    selectNode,
    clearSelection
  }
}