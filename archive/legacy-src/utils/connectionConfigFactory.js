/**
 * 连接配置工厂
 * 统一管理连接配置的创建和验证
 */

/**
 * 创建基础连接配置
 * @param {Object} source - 源节点配置
 * @param {Object} target - 目标节点配置
 * @param {Object} customConfig - 自定义配置
 * @returns {Object} 连接配置
 */
export function createConnectionConfig(source, target, customConfig = {}) {
  const defaultConfig = {
    connector: {
      name: 'rounded',
      args: {
        radius: 10
      }
    },
    router: {
      name: 'manhattan',
      args: {
        padding: 10
      }
    },
    connectionPoint: {
      name: 'boundary',
      args: {
        sticky: true
      }
    },
    attrs: {
      line: {
        stroke: '#1890ff',
        strokeWidth: 2,
        targetMarker: {
          name: 'classic',
          size: 8
        }
      }
    }
  }

  return {
    source,
    target,
    ...defaultConfig,
    ...customConfig
  }
}

/**
 * 创建带标签的连接配置
 * @param {Object} source - 源节点配置
 * @param {Object} target - 目标节点配置
 * @param {string} label - 连接标签
 * @param {Object} labelStyle - 标签样式
 * @returns {Object} 连接配置
 */
export function createLabeledConnectionConfig(source, target, label, labelStyle = {}) {
  const baseConfig = createConnectionConfig(source, target)
  
  const defaultLabelStyle = {
    fontSize: 12,
    fill: '#333',
    textAnchor: 'middle',
    textVerticalAnchor: 'middle'
  }

  return {
    ...baseConfig,
    labels: [{
      markup: [{
        tagName: 'rect',
        selector: 'labelBody'
      }, {
        tagName: 'text',
        selector: 'labelText'
      }],
      attrs: {
        labelText: {
          text: label,
          ...defaultLabelStyle,
          ...labelStyle
        },
        labelBody: {
          ref: 'labelText',
          refWidth: '100%',
          refHeight: '100%',
          refX: '-50%',
          refY: '-50%',
          fill: 'white',
          stroke: '#ccc',
          strokeWidth: 1,
          rx: 3,
          ry: 3
        }
      },
      position: {
        distance: 0.5
      }
    }]
  }
}

/**
 * 创建分支连接配置
 * @param {Object} source - 源节点配置
 * @param {Object} target - 目标节点配置
 * @param {string} branchId - 分支ID
 * @param {string} branchLabel - 分支标签
 * @returns {Object} 连接配置
 */
export function createBranchConnectionConfig(source, target, branchId, branchLabel = '') {
  const baseConfig = branchLabel 
    ? createLabeledConnectionConfig(source, target, branchLabel)
    : createConnectionConfig(source, target)

  return {
    ...baseConfig,
    branchId,
    attrs: {
      ...baseConfig.attrs,
      line: {
        ...baseConfig.attrs.line,
        stroke: '#52c41a' // 分支连接使用绿色
      }
    }
  }
}

/**
 * 验证连接配置
 * @param {Object} config - 连接配置
 * @returns {Object} 验证结果
 */
export function validateConnectionConfig(config) {
  const errors = []
  
  // 验证必需字段
  if (!config.source) {
    errors.push('缺少源节点配置')
  }
  
  if (!config.target) {
    errors.push('缺少目标节点配置')
  }
  
  // 验证连接器配置
  if (config.connector && typeof config.connector !== 'object') {
    errors.push('连接器配置必须是对象')
  }
  
  // 验证路由器配置
  if (config.router && typeof config.router !== 'object') {
    errors.push('路由器配置必须是对象')
  }
  
  // 验证连接器名称
  if (config.connector && config.connector.name) {
    const validConnectors = ['normal', 'rounded', 'smooth', 'jumpover']
    if (!validConnectors.includes(config.connector.name)) {
      errors.push(`无效的连接器类型: ${config.connector.name}`)
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}