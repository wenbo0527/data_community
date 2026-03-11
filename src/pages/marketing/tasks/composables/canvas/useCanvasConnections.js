import { ref } from 'vue'
import { generateUniqueId } from '../../utils/canvas/idGenerator.js'
import { GraphOperationUtils } from '../../utils/canvas/GraphOperationUtils.js'
import { StyleConfig } from '../../utils/canvas/StyleConfig.js'
import { ErrorHandler } from '../../utils/canvas/ErrorHandler.js'
import { DataTransformUtils } from '../../utils/canvas/DataTransformUtils.js'

export function useCanvasConnections(graph, emit, nodes) {
  const connections = ref([])
  const graphOperationUtils = new GraphOperationUtils(graph, emit)

  const addConnectionToGraph = (connectionData) => {
    return ErrorHandler.wrapOperation(() => {
      const formattedData = DataTransformUtils.format.edgeData(connectionData)
      const validation = DataTransformUtils.validate.edgeData(formattedData)
      
      if (!validation.isValid) {
        throw new Error(`连接数据验证失败: ${validation.errors.join(', ')}`)
      }

      // 验证源节点和目标节点是否存在（同时检查nodes数组和X6图实例）
      const sourceExistsInNodes = nodes?.value?.some(node => node.id === formattedData.source)
      const targetExistsInNodes = nodes?.value?.some(node => node.id === formattedData.target)
      const sourceExistsInGraph = graph.value?.getCellById(formattedData.source)
      const targetExistsInGraph = graph.value?.getCellById(formattedData.target)
      
      console.log('[useCanvasConnections] 节点存在性检查:', {
        source: formattedData.source,
        target: formattedData.target,
        sourceExistsInNodes,
        targetExistsInNodes,
        sourceExistsInGraph: !!sourceExistsInGraph,
        targetExistsInGraph: !!targetExistsInGraph,
        totalNodesInArray: nodes?.value?.length || 0,
        totalNodesInGraph: graph.value?.getNodes()?.length || 0
      })
      
      if (!sourceExistsInGraph) {
        throw new Error(`源节点不存在于图中: ${formattedData.source}`)
      }
      if (!targetExistsInGraph) {
        throw new Error(`目标节点不存在于图中: ${formattedData.target}`)
      }

      // 应用样式配置
      const styledConnection = {
        ...formattedData,
        attrs: StyleConfig.getEdgeStyle(formattedData.shape, formattedData.attrs)
      }

      if (graph.value) {
        const connection = graphOperationUtils.addConnection(styledConnection, connections.value)
        console.log('连接添加成功:', styledConnection.id)
        return connection
      }
    }, 'ADD_CONNECTION_ERROR')
  }

  // 从数据添加连接（用于数据加载）
  const addConnectionFromData = (connectionData) => {
    return ErrorHandler.wrapOperation(() => {
      console.log('[useCanvasConnections] 从数据添加连接:', connectionData)
      return addConnectionToGraph(connectionData)
    }, 'ADD_CONNECTION_FROM_DATA_ERROR')
  }

  const updateConnection = (connectionId, updates) => {
    return ErrorHandler.wrapOperation(() => {
      const connectionIndex = connections.value.findIndex(c => c.id === connectionId)
      if (connectionIndex === -1) {
        throw new Error(`找不到连接: ${connectionId}`)
      }

      const connection = connections.value[connectionIndex]
      const updatedData = { ...connection, ...updates }
      
      // 验证更新数据
      const validation = DataTransformUtils.validate.edgeData(updatedData)
      if (!validation.isValid) {
        throw new Error(`连接更新数据验证失败: ${validation.errors.join(', ')}`)
      }

      graphOperationUtils.updateConnection(connectionId, updates, connections.value)
      
      console.log('连接更新成功:', connectionId)
    }, 'UPDATE_CONNECTION_ERROR')
  }

  const deleteConnection = (connectionId) => {
    return ErrorHandler.wrapOperation(() => {
      graphOperationUtils.deleteConnection(connectionId, connections.value)
      console.log('连接删除成功:', connectionId)
    }, 'DELETE_CONNECTION_ERROR')
  }

  // 处理连接更新事件
  const handleConnectionUpdated = (updatedConnection) => {
    updateConnection(updatedConnection.id, updatedConnection)
  }

  return {
    connections,
    addConnectionToGraph,
    addConnectionFromData,
    updateConnection,
    deleteConnection,
    handleConnectionUpdated
  }
}