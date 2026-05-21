/**
 * 节点类型工具函数
 * 提供统一的节点类型获取和验证方法
 */

/**
 * 安全获取节点类型
 * @param {Object} node - 节点对象
 * @returns {string|null} 节点类型或null
 */
export function getNodeType(node) {
  if (!node) {

    return null
  }
  
  // 🔧 修复：增强节点类型获取逻辑，添加更多调试信息
  console.log('[NodeTypeHelper] 获取节点类型:', {
    node,
    nodeKeys: Object.keys(node),
    nodeType: node.type,
    nodeNodeType: node.nodeType,
    nodeData: node.data,
    nodeDataType: node.data?.type,
    nodeDataNodeType: node.data?.nodeType,
    nodeStoreData: node.store?.data?.data
  })
  
  // 尝试多种可能的节点类型字段，按优先级排序
  let nodeType = null
  
  // 1. 直接从节点对象获取
  if (node.type && typeof node.type === 'string' && node.type.trim() !== '') {
    nodeType = node.type.trim()
  }
  // 2. 从 nodeType 字段获取
  else if (node.nodeType && typeof node.nodeType === 'string' && node.nodeType.trim() !== '') {
    nodeType = node.nodeType.trim()
  }
  // 3. 从 data.type 获取
  else if (node.data?.type && typeof node.data.type === 'string' && node.data.type.trim() !== '') {
    nodeType = node.data.type.trim()
  }
  // 4. 从 data.nodeType 获取
  else if (node.data?.nodeType && typeof node.data.nodeType === 'string' && node.data.nodeType.trim() !== '') {
    nodeType = node.data.nodeType.trim()
  }
  // 5. 从 store.data.data 获取（X6 内部数据结构）
  else if (node.store?.data?.data?.type && typeof node.store.data.data.type === 'string' && node.store.data.data.type.trim() !== '') {
    nodeType = node.store.data.data.type.trim()
  }
  else if (node.store?.data?.data?.nodeType && typeof node.store.data.data.nodeType === 'string' && node.store.data.data.nodeType.trim() !== '') {
    nodeType = node.store.data.data.nodeType.trim()
  }
  
  if (!nodeType) {
    console.warn('[NodeTypeHelper] 无法获取节点类型:', {
      node,
      nodeKeys: Object.keys(node),
      availableFields: {
        type: node.type,
        nodeType: node.nodeType,
        dataType: node.data?.type,
        dataNodeType: node.data?.nodeType,
        storeDataType: node.store?.data?.data?.type,
        storeDataNodeType: node.store?.data?.data?.nodeType
      }
    })
    return null
  }

  return nodeType
}

/**
 * 验证节点类型是否有效
 * @param {string} nodeType - 节点类型
 * @returns {boolean} 是否有效
 */
export function isValidNodeType(nodeType) {
  if (!nodeType || typeof nodeType !== 'string') {
    return false
  }
  
  // 定义有效的节点类型列表
  const validNodeTypes = [
    'start', 'end', 'audience-split', 'event-split', 'sms', 'email', 'wechat',
    'ai-call', 'manual-call', 'ab-test', 'wait', 'benefit', 'task', 'condition'
  ]
  
  return validNodeTypes.includes(nodeType)
}

/**
 * 安全获取节点标签
 * @param {Object} node - 节点对象
 * @param {Function} getNodeLabel - 获取节点标签的函数
 * @returns {string} 节点标签
 */
export function getSafeNodeLabel(node, getNodeLabel) {
  const nodeType = getNodeType(node)
  
  if (!nodeType) {
    return '未知节点'
  }
  
  if (!isValidNodeType(nodeType)) {

    return nodeType // 返回原始类型作为标签
  }
  
  try {
    return getNodeLabel(nodeType) || nodeType
  } catch (error) {

    return nodeType
  }
}

/**
 * 从节点ID推断节点类型
 * @param {string} nodeId - 节点ID
 * @returns {string|null} 推断的节点类型或null
 */
export function inferNodeTypeFromId(nodeId) {
  if (!nodeId || typeof nodeId !== 'string') {
    return null
  }
  
  // 节点ID到类型的映射规则
  const idTypeMap = {
    'start': 'start',
    'end': 'end',
    'audience': 'audience-split',
    'event': 'event-split',
    'sms': 'sms',
    'email': 'email',
    'wechat': 'wechat',
    'ai-call': 'ai-call',
    'manual-call': 'manual-call',
    'ab-test': 'ab-test',
    'wait': 'wait',
    'benefit': 'benefit',
    'task': 'task',
    'condition': 'condition'
  }
  
  // 检查ID中是否包含已知的类型关键词
  for (const [keyword, type] of Object.entries(idTypeMap)) {
    if (nodeId.includes(keyword)) {
      return type
    }
  }
  
  return null
}