/**
 * 端口配置工厂
 * 统一管理所有端口的配置，确保一致性和可维护性
 */

/**
 * 创建标准端口配置
 * @param {string} group - 端口组 ('in' | 'out')
 * @param {string} id - 端口ID
 * @param {Object} position - 位置配置 { dx?: number, dy?: number }
 * @param {Object} options - 可选配置
 * @param {string} layoutDirection - 布局方向 ('TB' | 'LR')
 * @returns {Object} 完整的端口配置
 */
export const createPortConfig = (group, id, position = {}, options = {}, layoutDirection = 'TB') => {
  const isInputPort = group === 'in'
  
  // 根据布局方向确定端口位置
  let portPosition, portArgs
  
  if (layoutDirection === 'LR') {
    // 从左到右布局：输入端口在左侧，输出端口在右侧
    portPosition = isInputPort ? 'left' : 'right'
    portArgs = {
      x: isInputPort ? 0 : '100%',
      y: '50%',
      dx: position.dx || 0,
      dy: position.dy || 0
    }
  } else {
    // 从上到下布局（默认）：输入端口在顶部，输出端口在底部
    portPosition = isInputPort ? 'top' : 'bottom'
    portArgs = {
      x: '50%',
      y: isInputPort ? 0 : '100%',
      dx: position.dx || 0,
      dy: position.dy || 0
    }
  }
  
  return {
    group,
    id,
    position: {
      name: portPosition,
      args: portArgs
    },
    attrs: {
      circle: {
        r: options.radius || 4,
        magnet: true,
        strokeWidth: options.strokeWidth || 2,
        fill: options.fill || '#fff',
        stroke: options.stroke || '#5F95FF',
        style: {
          visibility: 'visible'
        }
      }
    },
    markup: [{
      tagName: 'circle',
      selector: 'circle'
    }]
  }
}

/**
 * 创建分支端口配置 (已弃用 - 使用统一端口策略)
 * @deprecated 此函数已不再使用，分支节点现在使用统一的out端口
 */
export const createBranchPortConfig = (branchId, index, totalPorts, options = {}) => {
  console.warn('createBranchPortConfig 已弃用，请使用统一端口策略')
  const portId = `out-${branchId}`
  return createPortConfig('out', portId, { dx: 0 }, options)
}

/**
 * 批量创建端口配置 (已弃用)
 * @deprecated 此函数已不再使用
 */
export const createMultiplePortConfigs = (portDefinitions) => {
  console.warn('createMultiplePortConfigs 已弃用')
  return portDefinitions.map(def => createPortConfig(def.group, def.id, def.position, def.options))
}

/**
 * 为节点类型创建标准端口配置
 * @param {string} nodeType - 节点类型
 * @param {Object} config - 节点配置
 * @param {string} layoutDirection - 布局方向 ('TB' | 'LR')
 * @returns {Object} 端口配置 { groups: Object, items: Array }
 */
export const createNodePortConfig = (nodeType, config = {}, layoutDirection = 'TB') => {
  // 根据布局方向创建端口组配置
  const createPortGroups = (layoutDirection) => {
    if (layoutDirection === 'LR') {
      // 从左到右布局
      return {
        in: {
          position: {
            name: 'left',
            args: { x: 0, y: '50%', dx: 0, dy: 0 }
          },
          attrs: {
            circle: {
              r: 4,
              magnet: true,
              strokeWidth: 2,
              fill: '#fff',
              style: { visibility: 'visible' }
            }
          },
          markup: [{ tagName: 'circle', selector: 'circle' }]
        },
        out: {
          position: {
            name: 'right',
            args: { x: '100%', y: '50%', dx: 0, dy: 0 }
          },
          attrs: {
            circle: {
              r: 4,
              magnet: true,
              strokeWidth: 2,
              fill: '#fff',
              style: { visibility: 'visible' }
            }
          },
          markup: [{ tagName: 'circle', selector: 'circle' }]
        }
      }
    } else {
      // 从上到下布局（默认）
      return {
        in: {
          position: {
            name: 'top',
            args: { x: '50%', y: 0, dx: 0, dy: 0 }
          },
          attrs: {
            circle: {
              r: 4,
              magnet: true,
              strokeWidth: 2,
              fill: '#fff',
              style: { visibility: 'visible' }
            }
          },
          markup: [{ tagName: 'circle', selector: 'circle' }]
        },
        out: {
          position: {
            name: 'bottom',
            args: { x: '50%', y: '100%', dx: 0, dy: 0 }
          },
          attrs: {
            circle: {
              r: 4,
              magnet: true,
              strokeWidth: 2,
              fill: '#fff',
              style: { visibility: 'visible' }
            }
          },
          markup: [{ tagName: 'circle', selector: 'circle' }]
        }
      }
    }
  }

  const portGroups = createPortGroups(layoutDirection)
  const items = []

  // 根据节点类型添加端口
  switch (nodeType) {
    case 'start':
      // 开始节点只有输出端口
      items.push(createPortConfig('out', 'out', {}, {}, layoutDirection))
      break
      
    case 'end':
      // 结束节点只有输入端口
      items.push(createPortConfig('in', 'in', {}, {}, layoutDirection))
      break
      
    case 'event-split':
      // 事件分流节点：1个输入端口 + 1个统一输出端口
      items.push(createPortConfig('in', 'in', {}, {}, layoutDirection))
      items.push(createPortConfig('out', 'out', {}, {}, layoutDirection))
      break
      
    case 'audience-split':
      // 人群分流节点：1个输入端口 + 1个统一输出端口
      items.push(createPortConfig('in', 'in', {}, {}, layoutDirection))
      items.push(createPortConfig('out', 'out', {}, {}, layoutDirection))
      break
      
    case 'ab-test':
      // AB测试节点：1个输入端口 + 1个统一输出端口
      items.push(createPortConfig('in', 'in', {}, {}, layoutDirection))
      items.push(createPortConfig('out', 'out', {}, {}, layoutDirection))
      break
      
    default:
      // 其他节点：1个输入端口 + 1个输出端口
      items.push(createPortConfig('in', 'in', {}, {}, layoutDirection))
      items.push(createPortConfig('out', 'out', {}, {}, layoutDirection))
      break
  }

  return {
    groups: portGroups,
    items
  }
}

/**
 * 验证端口配置
 * @param {Object} portConfig - 端口配置
 * @returns {Object} 验证结果 { valid: boolean, errors: string[] }
 */
export const validatePortConfig = (portConfig) => {
  const errors = []

  if (!portConfig.group || !['in', 'out'].includes(portConfig.group)) {
    errors.push('端口组配置无效')
  }

  if (!portConfig.id) {
    errors.push('端口ID不能为空')
  }

  if (!portConfig.position || !portConfig.position.name) {
    errors.push('端口位置配置无效')
  }

  if (!portConfig.attrs || !portConfig.attrs.circle) {
    errors.push('端口样式配置无效')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

export default {
  createPortConfig,
  createBranchPortConfig,
  createMultiplePortConfigs,
  createNodePortConfig,
  validatePortConfig
}