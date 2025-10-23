// ID生成器工具

// 生成唯一ID
export function generateUniqueId(prefix = '') {
  const timestamp = Date.now().toString(36)
  const randomStr = Math.random().toString(36).substring(2, 8)
  return prefix ? `${prefix}_${timestamp}_${randomStr}` : `${timestamp}_${randomStr}`
}

// 生成节点ID
export function generateNodeId(nodeType = 'node') {
  return generateUniqueId(nodeType)
}

// 生成连接ID
export function generateConnectionId() {
  return generateUniqueId('conn')
}

// 生成UUID v4格式的ID
export function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

// 检查ID是否有效
export function isValidId(id) {
  return typeof id === 'string' && id.length > 0 && !/^\s*$/.test(id)
}

// 生成短ID（8位）
export function generateShortId() {
  return Math.random().toString(36).substring(2, 10)
}