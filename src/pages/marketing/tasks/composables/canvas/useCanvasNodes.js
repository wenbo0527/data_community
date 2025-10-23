import { ref, computed } from 'vue'
import { generateUniqueId } from '../../utils/canvas/idGenerator.js'
import { createPortConfig } from '../../utils/canvas/portConfigFactory.js'
import { StyleConfig } from '../../utils/canvas/StyleConfig.js'
import { validateCanvasData } from '../../utils/canvas/canvasValidation.js'
import { nodeConfigManager } from '../../utils/canvas/NodeConfigManager.js'
import { DataTransformUtils } from '../../utils/canvas/DataTransformUtils.js'
import { ErrorHandler } from '../../utils/canvas/ErrorHandler.js'
import { GraphOperationUtils } from '../../utils/canvas/GraphOperationUtils.js'
// 🔧 修复：导入正确的节点样式方法
import { getNodeAttrs } from '../../../../../utils/nodeTypes.js'

/**
 * 节点管理组合式函数
 * 提供节点的创建、更新、删除等功能
 * @param {Object} graph - X6图实例
 * @param {Object} nodeManager - 节点管理器实例
 * @param {Object} layoutManager - 布局管理器实例
 * @returns {Object} 节点管理相关的方法和状态
 */
export function useCanvasNodes(graph, nodeManager, layoutManager, emit) {
  // 参数验证
  if (!graph) {
    throw new Error('useCanvasNodes: graph 参数是必需的')
  }
  if (!nodeManager) {
    throw new Error('useCanvasNodes: nodeManager 参数是必需的')
  }

  // 支持的节点类型列表
  const SUPPORTED_NODE_TYPES = [
    'start', 'end', 'audience-split', 'event-split', 'ab-test',
    'ai-call', 'manual-call', 'sms', 'wait', 'circle', 'condition', 'action'
  ]

  // 节点类型验证
  const isValidNodeType = (nodeType) => {
    return SUPPORTED_NODE_TYPES.includes(nodeType) || nodeConfigManager.isNodeTypeSupported(nodeType)
  }
  
  const nodes = ref([])

  // 根据节点类型获取形状
  const getNodeShapeByType = (nodeType) => {
    // X6中只有rect是内置的基础形状，圆形通过rx/ry属性实现
    return 'rect'
  }

  // 根据节点类型获取标签 - 🔧 修复：统一使用 getNodeLabel 函数
  const getNodeLabelByType = (nodeType) => {
    // 验证节点类型
    if (!nodeType || typeof nodeType !== 'string') {
      console.warn('[useCanvasNodes] 无效的节点类型:', nodeType)
      return '未知节点'
    }
    
    // 使用本地映射，避免异步导入问题
    const labelMap = {
      'start': '开始节点',
      'end': '结束节点',
      'audience-split': '人群分流',  // 🔧 修复：使用正确的节点类型
      'event-split': '事件分流',
      'sms': '短信触达',
      'ai-call': 'AI外呼',
      'manual-call': '人工外呼',    // 🔧 新增：人工外呼节点
      'ab-test': 'AB实验',
      'wait': '等待节点',
      'condition': '条件判断',
      'action': '执行动作',
      'benefit': '权益节点',        // 🔧 新增：权益节点
      'task': '任务节点'            // 🔧 新增：任务节点
    }
    return labelMap[nodeType] || nodeType
  }

  /**
   * 格式化节点数据
   * @param {Object} nodeData - 原始节点数据
   * @returns {Object} 格式化后的节点数据
   */
  const formatNodeData = (nodeData) => {
    console.log('🔄 [useCanvasNodes] 开始格式化节点数据:', nodeData)
    
    if (!nodeData) {
      throw new Error('节点数据不能为空')
    }
    
    // 使用DataTransformUtils进行数据格式化
    const formatted = DataTransformUtils.format.nodeData(nodeData)
    
    // 确保节点类型和标签正确设置
    if (!formatted.type && nodeData.nodeType) {
      formatted.type = nodeData.nodeType
    }
    
    if (!formatted.label) {
      formatted.label = getNodeLabelByType(formatted.type)
    }
    
    console.log('✅ [useCanvasNodes] 节点数据格式化完成:', formatted)
    return formatted
  }

  /**
   * 创建节点配置
   * @param {Object} nodeData - 格式化后的节点数据
   * @param {Object} options - 选项
   * @returns {Object} X6节点配置
   */
  const createNodeConfig = (nodeData, options = {}) => {
    console.log('⚙️ [useCanvasNodes] 开始创建节点配置:', { nodeData, options })
    
    try {
      // 基础节点配置
      const baseConfig = {
        id: nodeData.id || generateUniqueId(),
        shape: getNodeShapeByType(nodeData.type),
        x: nodeData.x || 0,
        y: nodeData.y || 0,
        width: nodeData.width || 120,
        height: nodeData.height || 60,
        label: nodeData.label || getNodeLabelByType(nodeData.type),
        data: {
          type: nodeData.type,
          config: nodeData.config || {},
          ...nodeData.data
        }
      }
      
      // 创建端口配置
      const portConfig = createPortConfig(nodeData.type, nodeData.config)
      if (portConfig && (portConfig.groups || portConfig.items)) {
        baseConfig.ports = portConfig
      }
      
      // 应用样式配置
      // 🔧 修复：使用 nodeTypes.js 中的 getNodeAttrs 方法获取正确的节点样式
      const nodeAttrs = getNodeAttrs(nodeData.type)
      if (nodeAttrs && Object.keys(nodeAttrs).length > 0) {
        baseConfig.attrs = {
          ...nodeAttrs,
          ...nodeData.attrs
        }
      }
      
      // 合并用户提供的选项
      const finalConfig = {
        ...baseConfig,
        ...options
      }
      
      console.log('✅ [useCanvasNodes] 节点配置创建完成:', finalConfig)
      return finalConfig
      
    } catch (error) {
      console.error('❌ [useCanvasNodes] 创建节点配置失败:', error)
      throw new Error(`创建节点配置失败: ${error.message}`)
    }
  }

  /**
   * 添加节点到图中
   * @param {Object} nodeData - 节点数据
   * @param {Object} options - 选项
   * @returns {Object} 添加的节点
   */
  const addNodeToGraph = async (nodeData, options = {}) => {
    console.log('🎯 [useCanvasNodes] 开始添加节点到图中:', { nodeData, options })
    
    try {
      // 数据格式化和验证
      const formattedData = formatNodeData(nodeData)
      console.log('📝 [useCanvasNodes] 格式化后的节点数据:', formattedData)
      
      // 节点类型验证
      if (!isValidNodeType(formattedData.type)) {
        throw new Error(`不支持的节点类型: ${formattedData.type}`)
      }
      
      // 验证节点数据
      const validation = validateCanvasData({ nodes: [formattedData], connections: [] })
      if (!validation.isValid) {
        throw new Error(`节点数据验证失败: ${validation.errors.join(', ')}`)
      }
      
      // 创建节点配置
      const nodeConfig = createNodeConfig(formattedData, options)
      console.log('⚙️ [useCanvasNodes] 创建的节点配置:', nodeConfig)
      
      // 添加节点到X6图中 - 使用正确的X6 API
      const node = graph.value.addCell(nodeConfig)
      console.log('✅ [useCanvasNodes] 节点已添加到X6图:', { nodeId: node.id, nodeType: formattedData.type })
      
      // 使用NodeConfigManager处理节点配置
      try {
        await nodeConfigManager.processNodeConfig(
          formattedData.type,
          node,
          formattedData.config || {},
          { layoutManager }
        )
        console.log('🔧 [useCanvasNodes] 节点配置处理完成:', node.id)
      } catch (configError) {
        console.warn('⚠️ [useCanvasNodes] 节点配置处理失败，但节点已创建:', configError)
      }
      
      // 验证节点是否成功添加
      const addedNode = graph.value.getCellById(node.id)
      if (!addedNode) {
        throw new Error(`节点添加失败，无法在图中找到节点: ${node.id}`)
      }
      
      console.log('🎉 [useCanvasNodes] 节点添加成功:', {
        nodeId: node.id,
        nodeType: formattedData.type,
        position: node.position(),
        size: node.size()
      })
      
      return node
      
    } catch (error) {
      console.error('❌ [useCanvasNodes] 添加节点失败:', error)
      throw error
    }
  }

  // 更新节点
  const updateNode = (nodeId, updates) => {
    console.log('[useCanvasNodes] 更新节点:', nodeId, updates)
    
    if (!nodeId) {
      console.error('[useCanvasNodes] 节点ID为空')
      throw new Error('节点ID不能为空')
    }
    
    if (!updates || typeof updates !== 'object') {
      console.error('[useCanvasNodes] 更新数据无效:', updates)
      throw new Error('更新数据必须是对象')
    }
    
    return ErrorHandler.wrapOperation(() => {
      const nodeIndex = nodes.value.findIndex(n => n.id === nodeId)
      console.log('[useCanvasNodes] 查找节点索引:', nodeIndex, '总节点数:', nodes.value.length)
      
      if (nodeIndex === -1) {
        console.error('[useCanvasNodes] 找不到节点:', nodeId, '现有节点:', nodes.value.map(n => n.id))
        throw new Error(`找不到节点: ${nodeId}`)
      }

      const node = nodes.value[nodeIndex]
      const updatedData = { ...node, ...updates }
      
      // 验证更新数据
      const validation = DataTransformUtils.validate.nodeData(updatedData)
      if (!validation.isValid) {
        throw new Error(`节点更新数据验证失败: ${validation.errors.join(', ')}`)
      }

      nodes.value[nodeIndex] = { ...nodes.value[nodeIndex], ...updates }
      
      // 更新图形中的节点
      const graphNode = graph.value.getCellById(nodeId)
      if (graphNode) {
        // 直接更新节点属性
        if (updates.x !== undefined || updates.y !== undefined) {
          graphNode.position(updates.x || graphNode.position().x, updates.y || graphNode.position().y)
        }
        if (updates.width !== undefined || updates.height !== undefined) {
          graphNode.resize(updates.width || graphNode.size().width, updates.height || graphNode.size().height)
        }
        if (updates.label !== undefined) {
          graphNode.setAttrByPath('label/text', updates.label)
        }
      }
      
      emit('nodes-updated', nodes.value)
      console.log('节点更新成功:', nodeId)
    }, 'UPDATE_NODE_ERROR')
  }

  // 删除节点
  const deleteNode = (nodeId) => {
    console.log('[useCanvasNodes] 删除节点:', nodeId)
    
    if (!nodeId) {
      console.error('[useCanvasNodes] 要删除的节点ID为空')
      throw new Error('节点ID不能为空')
    }
    
    return ErrorHandler.wrapOperation(() => {
      const nodeIndex = nodes.value.findIndex(n => n.id === nodeId)
      console.log('[useCanvasNodes] 查找要删除的节点索引:', nodeIndex, '总节点数:', nodes.value.length)
      
      if (nodeIndex === -1) {
        console.error('[useCanvasNodes] 找不到要删除的节点:', nodeId, '现有节点:', nodes.value.map(n => n.id))
        throw new Error(`找不到要删除的节点: ${nodeId}`)
      }

      nodes.value.splice(nodeIndex, 1)
      
      // 从图形中删除 - 使用正确的X6 API
      const graphNode = graph.value.getCellById(nodeId)
      if (graphNode) {
        graph.value.removeCell(graphNode)
      }
      
      emit('nodes-updated', nodes.value)
      console.log('节点删除成功:', nodeId)
    }, 'DELETE_NODE_ERROR')
  }

  // 复制节点
  const duplicateNode = (nodeId) => {
    console.log('[useCanvasNodes] 复制节点:', nodeId)
    
    if (!nodeId) {
      console.error('[useCanvasNodes] 要复制的节点ID为空')
      throw new Error('节点ID不能为空')
    }
    
    try {
      const originalNode = nodes.value.find(n => n.id === nodeId)
      console.log('[useCanvasNodes] 找到原始节点:', !!originalNode)
      
      if (originalNode) {
        const newId = generateUniqueId()
        console.log('[useCanvasNodes] 生成新节点ID:', newId)
        
        const newNode = {
          ...originalNode,
          id: newId,
          x: (originalNode.x || 0) + 50,
          y: (originalNode.y || 0) + 50
        }
        
        console.log('[useCanvasNodes] 新节点数据:', newNode)
        addNodeToGraph(newNode)
      } else {
        console.error('[useCanvasNodes] 找不到要复制的原始节点:', nodeId)
        throw new Error(`找不到要复制的节点: ${nodeId}`)
      }
    } catch (error) {
      console.error('[useCanvasNodes] 复制节点失败:', error)
      ErrorHandler.handleError(error, 'DUPLICATE_NODE_ERROR')
      throw error
    }
  }

  // 从数据添加节点（用于数据加载）
  const addNodeFromData = (nodeData) => {
    try {
      console.log('[useCanvasNodes] 从数据添加节点:', nodeData)
      return addNodeToGraph(nodeData)
    } catch (error) {
      console.error('[useCanvasNodes] 从数据添加节点失败:', error)
      throw error
    }
  }

  // 处理节点更新事件
  const handleNodeUpdated = (updatedNode) => {
    updateNode(updatedNode.id, updatedNode)
  }

  return {
    nodes,
    addNodeToGraph,
    addNodeFromData,
    updateNode,
    deleteNode,
    duplicateNode,
    handleNodeUpdated,
    createNodeConfig
  }
}