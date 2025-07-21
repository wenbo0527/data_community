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
 * @returns {Object} 完整的端口配置
 */
export const createPortConfig = (group, id, position = {}, options = {}) => {
  const isInputPort = group === 'in'
  
  return {
    group,
    id,
    position: {
      name: isInputPort ? 'top' : 'bottom',
      args: {
        x: '50%',
        y: isInputPort ? 0 : '100%',
        dx: position.dx || 0,
        dy: position.dy || 0
      }
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
 * @returns {Object} 端口配置 { groups: Object, items: Array }
 */
export const createNodePortConfig = (nodeType, config = {}) => {
  const portGroups = {
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

  const items = []

  // 根据节点类型添加端口
  switch (nodeType) {
    case 'start':
      // 开始节点只有输出端口
      items.push(createPortConfig('out', 'out'))
      break
      
    case 'end':
      // 结束节点只有输入端口
      items.push(createPortConfig('in', 'in'))
      break
      
    case 'event-split':
      // 事件分流节点：1个输入端口 + 1个统一输出端口
      items.push(createPortConfig('in', 'in'))
      items.push(createPortConfig('out', 'out'))
      break
      
    case 'audience-split':
      // 人群分流节点：1个输入端口 + 1个统一输出端口
      items.push(createPortConfig('in', 'in'))
      items.push(createPortConfig('out', 'out'))
      break
      
    case 'ab-test':
      // AB测试节点：1个输入端口 + 1个统一输出端口
      items.push(createPortConfig('in', 'in'))
      items.push(createPortConfig('out', 'out'))
      break
      
    default:
      // 其他节点：1个输入端口 + 1个输出端口
      items.push(createPortConfig('in', 'in'))
      items.push(createPortConfig('out', 'out'))
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