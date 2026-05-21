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
  
  // 🔧 修复：使用与x6Config.js完全一致的端口配置
  const portPosition = isInputPort ? 'top' : 'bottom'
  const yPosition = isInputPort ? 0 : '100%'
  const dyOffset = isInputPort ? -15 : 15  // 与x6Config.js保持一致
  
  console.log(`[portConfigFactory] 创建端口配置: ${group}`, {
    id,
    position: portPosition,
    y: yPosition,
    dy: dyOffset,
    isInputPort
  })

  return {
    id: id,
    group: group,
    position: {
      name: portPosition,
      args: {
        x: '50%',
        y: yPosition,
        dx: position.dx || 0,
        dy: position.dy || dyOffset
      }
    },
    attrs: {
        circle: {
          r: 5,
          magnet: false,  // 🔧 禁用端口拖拽连接，连接线应仅通过预览线转换生成
          stroke: options.stroke || '#5F95FF',
          strokeWidth: 2,
          fill: '#fff',
          style: {
            visibility: 'visible'
          }
        }
      },
    markup: [{
      tagName: 'circle',
      selector: 'circle'
    }],
    ...options
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
  console.log(`🔍 [portConfigFactory] 开始为节点类型 ${nodeType} 创建标准端口配置`)
  console.log(`🔍 [portConfigFactory] 输入参数:`, { nodeType, config })
  
  // 验证输入参数
  if (!nodeType || typeof nodeType !== 'string') {
    console.error(`❌ [portConfigFactory] 无效的节点类型:`, nodeType)
    return null
  }
  
  // 统一端口组配置
  const portGroups = {
    in: {
      position: {
        name: 'top',
        args: { x: '50%', y: '0%', dx: 0, dy: -15 }  // 修复：统一使用百分比字符串'0%'
      },
      attrs: {
        circle: {
          r: 5,
          magnet: false,  // 🔧 禁用端口拖拽连接，连接线应仅通过预览线转换生成
          stroke: config.color || '#5F95FF',
          strokeWidth: 2,
          fill: '#fff',
          style: {
            visibility: 'visible'
          }
        }
      },
      markup: [{
        tagName: 'circle',
        selector: 'circle'
      }]
    },
    out: {
      position: {
        name: 'bottom',
        args: { x: '50%', y: '100%', dx: 0, dy: 15 }  // 保持100%用于底部定位
      },
      attrs: {
        circle: {
          r: 5,
          magnet: false,  // 🔧 禁用端口拖拽连接，连接线应仅通过预览线转换生成
          stroke: config.color || '#5F95FF',
          strokeWidth: 2,
          fill: '#fff',
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
  
  console.log(`🔍 [portConfigFactory] 端口组配置创建完成:`, portGroups)

  const portItems = []

  console.log(`🔍 [portConfigFactory] 开始根据节点类型 ${nodeType} 创建端口项`)

  // 根据节点类型添加端口
  if (nodeType === 'start') {
    console.log(`🔍 [portConfigFactory] 为 start 节点创建输出端口`)
    // 开始节点只有输出端口
    const outPort = {
      group: 'out',
      id: 'out',
      attrs: {
        circle: {
          ...portGroups.out.attrs.circle,
          stroke: config.color || '#5F95FF'
        }
      }
    }
    portItems.push(outPort)
    console.log(`✅ [portConfigFactory] start 节点输出端口创建完成:`, outPort)
  } else if (nodeType === 'end') {
    console.log(`🔍 [portConfigFactory] 为 end 节点创建输入端口`)
    // 结束节点只有输入端口
    const inPort = {
      group: 'in',
      id: 'in',
      attrs: {
        circle: {
          ...portGroups.in.attrs.circle,
          stroke: config.color || '#5F95FF'
        }
      }
    }
    portItems.push(inPort)
    console.log(`✅ [portConfigFactory] end 节点输入端口创建完成:`, inPort)
  } else {
    console.log(`🔍 [portConfigFactory] 为 ${nodeType} 节点创建输入和输出端口`)
    // 其他节点都有1个输入端口和1个输出端口
    const inPort = {
      group: 'in',
      id: 'in',
      attrs: {
        circle: {
          ...portGroups.in.attrs.circle,
          stroke: config.color || '#5F95FF'
        }
      }
    }
    const outPort = {
      group: 'out',
      id: 'out',
      attrs: {
        circle: {
          ...portGroups.out.attrs.circle,
          stroke: config.color || '#5F95FF'
        }
      }
    }
    portItems.push(inPort, outPort)
    console.log(`✅ [portConfigFactory] ${nodeType} 节点端口创建完成:`, { inPort, outPort })
  }

  const finalConfig = {
    groups: portGroups,
    items: portItems
  }

  console.log(`✅ [portConfigFactory] 节点端口配置创建完成: ${nodeType}`, {
    groupsCount: Object.keys(portGroups).length,
    itemsCount: portItems.length,
    groups: portGroups,
    items: portItems,
    finalConfig
  })

  // 验证配置完整性
  if (!finalConfig.groups || !finalConfig.items || finalConfig.items.length === 0) {
    console.error(`❌ [portConfigFactory] 端口配置创建失败，配置不完整:`, finalConfig)
    return null
  }

  return finalConfig
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