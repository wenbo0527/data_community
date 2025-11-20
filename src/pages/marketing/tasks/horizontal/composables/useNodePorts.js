import { computed, ref } from 'vue'

/**
 * 节点端口组合式函数
 * 处理端口位置计算、样式生成和交互状态
 */
export function useNodePorts() {
  
  // 端口状态管理
  const hoveredPort = ref(null)
  const portConnections = ref(new Map())
  
  /**
   * 计算端口位置
   * @param {string} nodeType - 节点类型
   * @param {number} contentLines - 内容行数
   * @param {number} nodeHeight - 节点总高度
   * @param {number} headerHeight - 标题区域高度
   * @param {number} contentPadding - 内容区域内边距
   * @returns {Object} 端口位置配置
   */
  function calculatePortPositions({
    nodeType,
    contentLines,
    nodeHeight,
    headerHeight = 36,
    contentPadding = 12
  }) {
    const isSplit = nodeType === 'audience-split' || nodeType === 'crowd-split' || nodeType === 'event-split' || nodeType === 'ab-test'
    const hasInput = nodeType !== 'start' && nodeType !== 'end'
    
    // 计算内容区域高度
    const contentHeight = Math.max(1, contentLines) * 32 // 每行32px
    const contentCenter = headerHeight + contentPadding + (contentHeight / 2)
    
    // 输入端口位置（内容区域中心）
    const inputPort = hasInput ? {
      id: 'in',
      position: 'left',
      offset: {
        dy: contentCenter - (nodeHeight / 2) // 相对于节点中心的偏移
      }
    } : null
    
    // 输出端口位置
    const outputPorts = []
    
    if (isSplit && contentLines > 0) {
      // 分流节点：每行内容对应一个输出端口
      for (let i = 0; i < contentLines; i++) {
        const lineCenter = headerHeight + contentPadding + i * 32 + 16 // 行中点
        outputPorts.push({
          id: `out-${i}`,
          position: 'right',
          offset: {
            dy: lineCenter - (nodeHeight / 2) // 相对于节点中心的偏移
          },
          lineIndex: i // 关联到内容行
        })
      }
    } else if (nodeType !== 'end') {
      // 普通节点：单个输出端口，对齐到内容区域中心
      outputPorts.push({
        id: 'out',
        position: 'right',
        offset: {
          dy: contentCenter - (nodeHeight / 2)
        }
      })
    }
    
    return {
      input: inputPort,
      outputs: outputPorts,
      contentCenter,
      contentHeight
    }
  }
  
  /**
   * 获取端口样式
   * @param {string} portType - 端口类型 (input/output)
   * @param {Object} options - 样式选项
   * @returns {Object} 端口样式对象
   */
  function getPortStyles(portType, options = {}) {
    const {
      isHovered = false,
      index = 0,
      totalLines = 1,
      contentLines = []
    } = options
    
    const baseStyles = {
      position: 'absolute',
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      border: '1.5px solid #4C78FF',
      cursor: 'crosshair',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      zIndex: 10
    }
    
    if (portType === 'input') {
      return {
        ...baseStyles,
        left: '-4px',
        backgroundColor: '#FFFFFF',
        ...(isHovered && {
          transform: 'scale(1.2)',
          boxShadow: '0 0 0 4px rgba(76, 120, 255, 0.2)',
          borderWidth: '2px'
        })
      }
    } else {
      return {
        ...baseStyles,
        right: '-4px',
        backgroundColor: '#4C78FF',
        ...(isHovered && {
          transform: 'scale(1.2)',
          boxShadow: '0 0 0 4px rgba(76, 120, 255, 0.2)',
          borderWidth: '2px'
        })
      }
    }
  }
  
  /**
   * 验证端口位置是否符合规范
   * @param {Object} portConfig - 端口配置
   * @param {Array} contentLines - 内容行数组
   * @returns {Object} 验证结果
   */
  function validatePortPositions(portConfig, contentLines) {
    const errors = []
    const warnings = []
    
    // 验证输入端口
    if (portConfig.input) {
      const expectedCenter = 36 + 12 + (Math.max(1, contentLines.length) * 32) / 2 // header + padding + contentCenter
      const actualOffset = portConfig.input.offset.dy + (portConfig.nodeHeight / 2)
      
      if (Math.abs(actualOffset - expectedCenter) > 2) { // 允许2px误差
        errors.push(`输入端口位置偏差：期望 ${expectedCenter}px，实际 ${actualOffset}px`)
      }
    }
    
    // 验证输出端口
    if (portConfig.outputs.length > 0) {
      portConfig.outputs.forEach((port, index) => {
        const expectedOffset = 36 + 12 + index * 32 + 16 // header + padding + lineOffset + lineCenter
        const actualOffset = port.offset.dy + (portConfig.nodeHeight / 2)
        
        if (Math.abs(actualOffset - expectedOffset) > 2) { // 允许2px误差
          errors.push(`输出端口 ${index} 位置偏差：期望 ${expectedOffset}px，实际 ${actualOffset}px`)
        }
        
        // 验证端口与内容行的关联
        if (port.lineIndex !== undefined && port.lineIndex !== index) {
          warnings.push(`输出端口 ${index} 与内容行索引不匹配`)
        }
      })
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      portCount: portConfig.outputs.length,
      contentLineCount: contentLines.length
    }
  }
  
  /**
   * 生成端口配置（兼容AntV X6格式）
   * @param {Object} portConfig - 端口位置配置
   * @returns {Object} AntV X6端口配置
   */
  function generatePortConfig(portConfig) {
    const ports = { items: [] }
    
    // 输入端口
    if (portConfig.input) {
      ports.items.push({
        id: portConfig.input.id,
        group: 'in',
        args: {
          dy: portConfig.input.offset.dy
        }
      })
    }
    
    // 输出端口
    portConfig.outputs.forEach(port => {
      ports.items.push({
        id: port.id,
        group: 'out',
        args: {
          dy: port.offset.dy
        }
      })
    })
    
    return ports
  }
  
  /**
   * 处理端口悬停事件
   * @param {string} portId - 端口ID
   * @param {boolean} isHovered - 悬停状态
   */
  function handlePortHover(portId, isHovered) {
    hoveredPort.value = isHovered ? portId : null
    
    // 触发端口高亮效果
    if (isHovered) {
      // 可以在这里添加端口高亮的逻辑
      console.log(`端口 ${portId} 悬停`)
    } else {
      console.log(`端口 ${portId} 离开`)
    }
  }
  
  /**
   * 获取端口连接信息
   * @param {string} portId - 端口ID
   * @returns {Object} 连接信息
   */
  function getPortConnection(portId) {
    return portConnections.value.get(portId) || null
  }
  
  /**
   * 更新端口连接
   * @param {string} portId - 端口ID
   * @param {Object} connection - 连接信息
   */
  function updatePortConnection(portId, connection) {
    if (connection) {
      portConnections.value.set(portId, connection)
    } else {
      portConnections.value.delete(portId)
    }
  }
  
  /**
   * 获取端口状态
   * @param {string} portId - 端口ID
   * @returns {Object} 端口状态
   */
  function getPortStatus(portId) {
    return {
      isHovered: hoveredPort.value === portId,
      hasConnection: portConnections.value.has(portId),
      connectionCount: portConnections.value.size
    }
  }
  
  return {
    // 状态
    hoveredPort,
    portConnections,
    
    // 方法
    calculatePortPositions,
    getPortStyles,
    validatePortPositions,
    generatePortConfig,
    handlePortHover,
    getPortConnection,
    updatePortConnection,
    getPortStatus
  }
}