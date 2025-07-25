/**
 * 连接配置工厂
 * 统一管理所有连接的配置，确保一致性和可维护性
 */

/**
 * 创建标准连接配置
 * @param {Object} source - 源节点配置 { cell: string, port: string }
 * @param {Object} target - 目标节点配置 { cell: string, port: string }
 * @param {Object} options - 可选配置
 * @returns {Object} 完整的连接配置
 */
export const createConnectionConfig = (source, target, options = {}) => {
  const defaultConfig = {
    source,
    target,
    // 使用更可靠的boundary连接点
    connectionPoint: {
      name: 'boundary',
      args: {
        anchor: 'center'
      }
    },
    // 连接器配置
    connector: {
      name: 'rounded',
      args: {
        radius: options.radius || 6
      }
    },
    // 路由器配置 - 智能最短路径优化
    router: {
      name: 'orth',
      args: {
        padding: 15,
        step: 10,
        startDirections: ['bottom'],
        endDirections: ['top']
        // 🚀 [智能路径] 移除fallbackRoute，完全依赖orth路由器的自动最短路径算法
        // orth路由器内置了最短路径计算，无需手动干预
      }
    },
    // 默认样式
    attrs: {
      line: {
        stroke: options.strokeColor || '#5F95FF',
        strokeWidth: options.strokeWidth || 2,
        targetMarker: {
          name: 'block',
          width: options.markerWidth || 8,
          height: options.markerHeight || 6,
          fill: options.markerColor || '#5F95FF'
        }
      }
    },
    // 默认数据
    data: {
      type: 'connection',
      sourceNodeId: source.cell,
      targetNodeId: target.cell,
      ...options.data
    }
  }

  // 合并用户自定义配置
  return {
    ...defaultConfig,
    ...options,
    // 确保关键配置不被覆盖
    connectionPoint: {
      name: 'boundary',
      args: {
        anchor: 'center'
      }
    },
    source,
    target
  }
}

/**
 * 创建带标签的连接配置
 * @param {Object} source - 源节点配置
 * @param {Object} target - 目标节点配置
 * @param {string} labelText - 标签文本
 * @param {Object} options - 可选配置
 * @returns {Object} 带标签的连接配置
 */
export const createLabeledConnectionConfig = (source, target, labelText, options = {}) => {
  const baseConfig = createConnectionConfig(source, target, options)
  
  if (labelText) {
    baseConfig.labels = [{
      attrs: {
        text: {
          text: labelText,
          fill: options.labelColor || '#333',
          fontSize: options.labelFontSize || 14,
          fontWeight: options.labelFontWeight || 'bold',
          textAnchor: 'middle',
          textVerticalAnchor: 'middle'
        },
        rect: {
          ref: 'text',
          refX: -8,
          refY: -6,
          refWidth: '100%',
          refHeight: '100%',
          refWidth2: 16,
          refHeight2: 12,
          fill: options.labelBgColor || '#fff',
          stroke: options.labelBorderColor || '#5F95FF',
          strokeWidth: 2,
          rx: 4,
          ry: 4
        }
      },
      position: options.labelPosition || 0.8
    }]
  }

  return baseConfig
}

/**
 * 创建分支连接配置
 * @param {Object} source - 源节点配置
 * @param {Object} target - 目标节点配置
 * @param {string} branchId - 分支ID
 * @param {string} branchLabel - 分支标签
 * @param {Object} options - 可选配置
 * @returns {Object} 分支连接配置
 */
export const createBranchConnectionConfig = (source, target, branchId, branchLabel, options = {}) => {
  // 确保源端口使用统一的'out'端口，从UI层面的同一个位置出发
  const branchSource = {
    ...source,
    port: 'out'
  }

  const config = createLabeledConnectionConfig(branchSource, target, branchLabel, options)
  
  // 添加分支特定的数据
  config.data = {
    ...config.data,
    branchId,
    branchLabel
  }

  return config
}

/**
 * 验证连接配置
 * @param {Object} config - 连接配置
 * @returns {Object} 验证结果 { valid: boolean, errors: string[] }
 */
export const validateConnectionConfig = (config) => {
  const errors = []

  if (!config.source || !config.source.cell || !config.source.port) {
    errors.push('源节点配置无效')
  }

  if (!config.target || !config.target.cell || !config.target.port) {
    errors.push('目标节点配置无效')
  }

  if (!config.connectionPoint) {
    errors.push('缺少连接点配置')
  }

  if (config.source?.cell === config.target?.cell) {
    errors.push('不能连接到自身')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

export default {
  createConnectionConfig,
  createLabeledConnectionConfig,
  createBranchConnectionConfig,
  validateConnectionConfig
}