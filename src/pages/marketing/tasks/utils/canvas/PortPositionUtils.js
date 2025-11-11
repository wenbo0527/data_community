/**
 * 端口坐标工具
 * 提供统一的方法，根据节点与端口配置计算画布上的绝对端口坐标。
 */

/**
 * 解析坐标参数，支持百分比字符串（如 '50%'）与数值。
 * @param {number} base - 基准起点（节点左上角 x 或 y）
 * @param {number} size - 尺寸（节点宽或高）
 * @param {string|number|undefined} value - 位置参数（可能为百分比字符串或数值）
 * @returns {number} 计算后的偏移量
 */
function parseOffset(base, size, value) {
  if (typeof value === 'string' && value.includes('%')) {
    const percent = parseFloat(value) / 100
    return base + size * percent
  }
  if (typeof value === 'number') {
    return base + value
  }
  // 默认使用中心（用于 x）或顶部/底部（通过 name 与 y 配置决定）
  return base
}

/**
 * 获取端口的定位配置，优先使用节点项级配置，其次使用全局组级配置。
 * @param {Object} node - X6 节点实例
 * @param {string} portKey - 端口ID或分组（通常为 'in' 或 'out'）
 * @param {Object} graph - X6 图实例
 * @returns {Object|null} 端口 position 配置
 */
export function getPortPositionConfig(node, portKey, graph) {
  try {
    // 优先读取节点项级端口配置
    const itemPosition = node?.getPortProp?.(portKey, 'position')
    if (itemPosition && typeof itemPosition === 'object') {
      return itemPosition
    }

    // 其次读取全局组级配置
    const portGroups = graph?.options?.connecting?.portGroups
    if (portGroups && portGroups[portKey] && portGroups[portKey].position) {
      return portGroups[portKey].position
    }

    return null
  } catch (error) {
    console.warn('[PortPositionUtils] 获取端口定位配置失败:', error)
    return null
  }
}

/**
 * 计算端口在画布上的绝对坐标。
 * @param {Object} node - X6 节点实例
 * @param {string} portKey - 端口ID或分组（通常为 'in' 或 'out'）
 * @param {Object} graph - X6 图实例（用于获取全局分组配置）
 * @returns {{x:number,y:number}|null} 绝对坐标
 */
export function getPortAbsolutePosition(node, portKey, graph) {
  if (!node || typeof node.getPosition !== 'function' || typeof node.getSize !== 'function') {
    console.warn('[PortPositionUtils] 节点对象无效或缺少必要方法')
    return null
  }

  const nodePosition = node.getPosition()
  const nodeSize = node.getSize()
  const positionConfig = getPortPositionConfig(node, portKey, graph)

  if (!positionConfig) {
    console.warn('[PortPositionUtils] 未找到端口定位配置，返回节点中心或顶部/底部作为回退')
    // 尝试根据端口分组做合理回退
    const isOut = portKey === 'out'
    const x = nodePosition.x + nodeSize.width / 2
    const y = isOut ? (nodePosition.y + nodeSize.height) : nodePosition.y
    return { x, y }
  }

  const args = positionConfig.args || {}

  // 计算 X
  let x = parseOffset(nodePosition.x, nodeSize.width, args.x)
  // 如果未提供 x，则居中作为默认（针对常见的 50% 配置）
  if (args.x == null) {
    x = nodePosition.x + nodeSize.width / 2
  }
  x += args.dx || 0

  // 计算 Y
  let y = parseOffset(nodePosition.y, nodeSize.height, args.y)
  // 如果未提供 y，则根据 position.name 在顶部或底部作为默认
  if (args.y == null) {
    if (positionConfig.name === 'bottom') {
      y = nodePosition.y + nodeSize.height
    } else {
      y = nodePosition.y
    }
  }
  y += args.dy || 0

  return { x, y }
}

export default {
  getPortPositionConfig,
  getPortAbsolutePosition
}