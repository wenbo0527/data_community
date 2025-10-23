import { generateUniqueId } from './idGenerator.js'
import { createPortConfig } from './portConfigFactory.js'
import { getNodeAttrs } from '../../../../../utils/nodeTypes.js'

/**
 * 根据节点类型获取形状
 * @param {string} nodeType - 节点类型
 * @returns {string} 节点形状
 */
const getNodeShapeByType = (nodeType) => {
  // 根据节点类型返回对应的形状
  const shapeMap = {
    'start': 'vue-shape',
    'end': 'vue-shape',
    'audience-split': 'vue-shape',
    'event-split': 'vue-shape',
    'sms': 'vue-shape',
    'ai-call': 'vue-shape',
    'manual-call': 'vue-shape',
    'ab-test': 'vue-shape',
    'wait': 'vue-shape',
    'condition': 'vue-shape',
    'action': 'vue-shape',
    'benefit': 'vue-shape',
    'task': 'vue-shape'
  }
  
  return shapeMap[nodeType] || 'vue-shape'
}

/**
 * 根据节点类型获取标签
 * @param {string} nodeType - 节点类型
 * @returns {string} 节点标签
 */
const getNodeLabelByType = (nodeType) => {
  // 验证节点类型
  if (!nodeType || typeof nodeType !== 'string') {
    console.warn('[createNodeConfig] 无效的节点类型:', nodeType)
    return '未知节点'
  }
  
  const labelMap = {
    'start': '开始节点',
    'end': '结束节点',
    'audience-split': '人群分流',
    'event-split': '事件分流',
    'sms': '短信触达',
    'ai-call': 'AI外呼',
    'manual-call': '人工外呼',
    'ab-test': 'AB实验',
    'wait': '等待节点',
    'condition': '条件判断',
    'action': '执行动作',
    'benefit': '权益节点',
    'task': '任务节点'
  }
  
  return labelMap[nodeType] || nodeType
}

/**
 * 创建节点配置
 * @param {Object} nodeData - 格式化后的节点数据
 * @param {Object} options - 选项
 * @returns {Object} X6节点配置
 */
export function createNodeConfig(nodeData, options = {}) {
  console.log('⚙️ [createNodeConfig] 开始创建节点配置:', { nodeData, options })
  
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
    // 使用 nodeTypes.js 中的 getNodeAttrs 方法获取正确的节点样式
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
    
    console.log('✅ [createNodeConfig] 节点配置创建完成:', finalConfig)
    return finalConfig
    
  } catch (error) {
    console.error('❌ [createNodeConfig] 创建节点配置失败:', error)
    throw new Error(`创建节点配置失败: ${error.message}`)
  }
}