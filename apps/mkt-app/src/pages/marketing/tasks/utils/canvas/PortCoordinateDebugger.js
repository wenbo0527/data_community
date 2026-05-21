/**
 * 端口坐标调试工具
 * 用于深度分析和调试端口坐标问题
 */

export class PortCoordinateDebugger {
  constructor(graph) {
    this.graph = graph
    this.debugInfo = new Map()
    this.isEnabled = true
    this.logLevel = 'basic' // 'basic' | 'detailed' | 'verbose'
    this.debugMode = false // 控制详细日志输出
  }

  /**
   * 启用/禁用调试
   */
  setEnabled(enabled) {
    this.isEnabled = enabled
    this.log('info', `🔧 [端口坐标调试器] ${enabled ? '启用' : '禁用'}调试模式`)
  }

  /**
   * 设置日志级别
   */
  setLogLevel(level) {
    this.logLevel = level
    this.log('info', `🔧 [端口坐标调试器] 设置日志级别: ${level}`)
  }

  /**
   * 设置调试模式
   */
  setDebugMode(enabled) {
    this.debugMode = enabled
    this.log('info', `🔧 [端口坐标调试器] ${enabled ? '启用' : '禁用'}详细日志模式`)
  }

  /**
   * 统一的日志输出方法
   */
  log(level, message, data = null) {
    if (!this.isEnabled) {return}

    // 日志级别控制
    const shouldLog = this.shouldLog(level)
    if (!shouldLog) {return}

    if (data) {
      console.log(message, data)
    } else {
      console.log(message)
    }
  }

  /**
   * 判断是否应该输出日志
   */
  shouldLog(level) {
    // 错误和警告始终显示
    if (level === 'error' || level === 'warn') {
      return true
    }

    // 信息级别日志根据设置显示
    if (level === 'info') {
      return this.logLevel !== 'silent'
    }

    // 详细调试日志只在调试模式下显示
    if (level === 'debug') {
      return this.debugMode && this.logLevel === 'detailed'
    }

    // 超详细日志只在verbose模式下显示
    if (level === 'verbose') {
      return this.debugMode && this.logLevel === 'verbose'
    }

    return false
  }

  /**
   * 调试节点创建时的坐标信息
   */
  debugNodeCreation(nodeData, nodeConfig) {
    if (!this.isEnabled) {return}

    const nodeId = nodeData.id || nodeConfig.id
    const debugData = {
      nodeId,
      nodeType: nodeData.type,
      nodePosition: { x: nodeData.x || 0, y: nodeData.y || 0 },
      nodeSize: { 
        width: nodeData.width || nodeConfig.width || 100, 
        height: nodeData.height || nodeConfig.height || 100 
      },
      shape: nodeData.shape || nodeConfig.shape || 'circle',
      timestamp: Date.now()
    }

    this.debugInfo.set(nodeId, debugData)

    this.log('debug', `🔍 [FlowNode] 节点类型识别: {nodeDataType: ${nodeData.type}, propsType: ${nodeData.props?.type || ''}, finalType: ${debugData.nodeType}, nodeId: ${nodeId}}`)
    
    if (this.debugMode && (this.logLevel === 'detailed' || this.logLevel === 'verbose')) {
      console.group(`🔍 [端口坐标调试] 节点创建: ${nodeId}`)
      console.log('节点类型:', debugData.nodeType)
      console.log('节点位置:', debugData.nodePosition)
      console.log('节点尺寸:', debugData.nodeSize)
      console.log('节点形状:', debugData.shape)
      console.groupEnd()
    }

    return debugData
  }

  /**
   * 调试端口配置信息
   */
  debugPortConfiguration(nodeId, portConfig) {
    if (!this.isEnabled) {return}

    this.log('debug', `🔧 [端口配置调试] 开始处理节点 ${nodeId}`)
    this.log('debug', `📋 接收到的端口配置:`, portConfig)
    
    // 如果端口配置为 null，直接记录并返回
    if (portConfig === null) {
      this.log('warn', `⚠️ [端口配置调试] 节点 ${nodeId} 端口配置为 null - 节点没有端口`)
      
      // 仍然需要更新调试信息
      const nodeDebugData = this.debugInfo.get(nodeId)
      if (nodeDebugData) {
        nodeDebugData.portConfig = null
        this.debugInfo.set(nodeId, nodeDebugData)
      }
      return
    }

    let nodeDebugData = this.debugInfo.get(nodeId)
    if (!nodeDebugData) {
      // 如果没有找到节点调试信息，创建基础信息
      this.log('debug', `🔧 [端口坐标调试] 为节点 ${nodeId} 创建基础调试信息`)
      
      // 尝试从图形中获取节点信息
      let nodeInfo = { nodeType: 'unknown', nodePosition: { x: 0, y: 0 }, nodeSize: { width: 100, height: 100 }, shape: 'circle' }
      
      if (this.graph) {
        const node = this.graph.getCellById(nodeId)
        if (node) {
          const nodeData = node.getData() || {}
          const position = node.getPosition() || { x: 0, y: 0 }
          const size = node.getSize() || { width: 100, height: 100 }
          
          nodeInfo = {
            nodeType: nodeData.type || nodeData.nodeType || 'unknown',
            nodePosition: position,
            nodeSize: size,
            shape: nodeData.shape || 'circle',
            nodeDataPortConfig: nodeData.portConfig || null,
            portConfigMeta: nodeData.portConfigMeta || null
          }
        }
      }
      
      nodeDebugData = {
        nodeId,
        ...nodeInfo,
        timestamp: Date.now()
      }
      
      this.debugInfo.set(nodeId, nodeDebugData)
    }

    // 存储端口配置到调试信息
    nodeDebugData.portConfig = portConfig
    nodeDebugData.portAnalysis = this.analyzePortConfiguration(nodeDebugData, portConfig)
    
    this.log('debug', `💾 已存储端口配置到调试信息，当前调试数据:`, nodeDebugData)
  }

  /**
   * 计算实际端口坐标
   */
  calculateActualPortCoordinates(nodeDebugData, positionConfig) {
    const { nodePosition, nodeSize, shape } = nodeDebugData
    const args = positionConfig.args || {}

    // 确保节点位置和大小数据有效
    if (!nodePosition || !nodeSize) {
      this.log('error', '❌ [calculateActualPortCoordinates] 节点位置或大小数据无效:', { nodePosition, nodeSize })
      return {
        base: { x: 0, y: 0 },
        offset: { dx: 0, dy: 0 },
        final: { x: 0, y: 0 },
        isCircle: false,
        nodeRadius: null,
        error: '节点位置或大小数据无效'
      }
    }

    this.log('debug', '🔍 [calculateActualPortCoordinates] 开始计算端口坐标:', {
      nodePosition,
      nodeSize,
      positionArgs: args,
      shape,
      positionName: positionConfig.name
    })

    let baseX = nodePosition.x
    let baseY = nodePosition.y

    // 处理百分比坐标
    if (typeof args.x === 'string' && args.x.includes('%')) {
      const percentage = parseFloat(args.x.replace('%', '')) / 100
      const offsetX = nodeSize.width * percentage
      baseX = nodePosition.x + offsetX
      this.log('debug', `🔍 [X坐标计算] 百分比: ${args.x} -> ${percentage} -> 偏移: ${offsetX} -> 最终: ${baseX}`)
    } else if (typeof args.x === 'number') {
      baseX = nodePosition.x + args.x
      this.log('debug', `🔍 [X坐标计算] 数值: ${args.x} -> 最终: ${baseX}`)
    } else {
      this.log('debug', `🔍 [X坐标计算] 使用节点X坐标: ${baseX}`)
    }

    if (typeof args.y === 'string' && args.y.includes('%')) {
      const percentage = parseFloat(args.y.replace('%', '')) / 100
      const offsetY = nodeSize.height * percentage
      baseY = nodePosition.y + offsetY
      this.log('debug', `🔍 [Y坐标计算] 百分比: ${args.y} -> ${percentage} -> 偏移: ${offsetY} -> 最终: ${baseY}`)
    } else if (typeof args.y === 'number') {
      // 对于数值类型的Y坐标，统一转换为百分比处理
      this.log('debug', `🔧 [Y坐标修复] 检测到数值类型Y坐标: ${args.y}，端口位置: ${positionConfig.name}`)
      
      if (positionConfig.name === 'top') {
        if (args.y === 0) {
          baseY = nodePosition.y
          this.log('debug', `🔧 [Y坐标修复] top端口数值0 -> 节点顶部: ${baseY}`)
        } else {
          const percentage = Math.max(0, Math.min(1, args.y / 100))
          baseY = nodePosition.y + (nodeSize.height * percentage)
          this.log('debug', `🔧 [Y坐标修复] top端口数值${args.y} -> 百分比${percentage} -> 最终: ${baseY}`)
        }
      } else if (positionConfig.name === 'bottom') {
        if (args.y === 0) {
          baseY = nodePosition.y + nodeSize.height
          this.log('debug', `🔧 [Y坐标修复] bottom端口数值0 -> 节点底部: ${baseY}`)
        } else {
          const percentage = Math.max(0, Math.min(1, args.y / 100))
          baseY = nodePosition.y + (nodeSize.height * percentage)
          this.log('debug', `🔧 [Y坐标修复] bottom端口数值${args.y} -> 百分比${percentage} -> 最终: ${baseY}`)
        }
      } else {
        const percentage = Math.max(0, Math.min(1, args.y / 100))
        baseY = nodePosition.y + (nodeSize.height * percentage)
        this.log('debug', `🔧 [Y坐标修复] 通用端口数值${args.y} -> 百分比${percentage} -> 最终: ${baseY}`)
      }
    } else {
      this.log('debug', `🔍 [Y坐标计算] 使用节点Y坐标: ${baseY}`)
    }

    // 应用偏移量
    const finalX = baseX + (args.dx || 0)
    const finalY = baseY + (args.dy || 0)

    this.log('debug', '🎯 [calculateActualPortCoordinates] 坐标计算完成:', {
      positionName: positionConfig.name,
      base: { x: baseX, y: baseY },
      offset: { dx: args.dx || 0, dy: args.dy || 0 },
      final: { x: finalX, y: finalY },
      nodeInfo: {
        position: nodePosition,
        size: nodeSize
      }
    })

    return {
      base: { x: baseX, y: baseY },
      offset: { dx: args.dx || 0, dy: args.dy || 0 },
      final: { x: finalX, y: finalY },
      isCircle: shape === 'circle',
      nodeRadius: shape === 'circle' ? Math.min(nodeSize.width, nodeSize.height) / 2 : null
    }
  }

  /**
   * 分析端口配置
   */
  analyzePortConfiguration(nodeDebugData, portConfig) {
    const analysis = {
      issues: [],
      recommendations: [],
      coordinates: {}
    }

    // 确保 nodeDebugData 和 portConfig 存在
    if (!nodeDebugData || !portConfig) {
      this.log('warn', '⚠️ [analyzePortConfiguration] 缺少必要的数据:', { nodeDebugData: !!nodeDebugData, portConfig: !!portConfig })
      return analysis
    }

    const { nodeSize, shape } = nodeDebugData
    const portGroups = portConfig.groups || {}

    // 分析每个端口组
    Object.entries(portGroups).forEach(([groupName, groupConfig]) => {
      const coords = this.calculateActualPortCoordinates(nodeDebugData, groupConfig.position)
      analysis.coordinates[groupName] = coords

      // 检查圆形节点的端口位置
      if (shape === 'circle') {
        const radius = Math.min(nodeSize.width, nodeSize.height) / 2
        const centerX = nodeDebugData.nodePosition.x + nodeSize.width / 2
        const centerY = nodeDebugData.nodePosition.y + nodeSize.height / 2

        // 计算端口到圆心的距离
        const distanceToCenter = Math.sqrt(
          Math.pow(coords.final.x - centerX, 2) + 
          Math.pow(coords.final.y - centerY, 2)
        )

        if (groupName === 'in') {
          // 输入端口应该在顶部外侧
          if (coords.final.y >= centerY) {
            analysis.issues.push(`输入端口位置错误：应该在节点顶部，当前Y坐标 ${coords.final.y} >= 中心Y坐标 ${centerY}`)
          }
          if (distanceToCenter < radius + 10) {
            analysis.recommendations.push(`输入端口距离圆心太近 (${distanceToCenter.toFixed(1)}px)，建议增加dy偏移量`)
          }
        } else if (groupName === 'out') {
          // 输出端口应该在底部外侧
          if (coords.final.y <= centerY) {
            analysis.issues.push(`输出端口位置错误：应该在节点底部，当前Y坐标 ${coords.final.y} <= 中心Y坐标 ${centerY}`)
          }
          if (distanceToCenter < radius + 10) {
            analysis.recommendations.push(`输出端口距离圆心太近 (${distanceToCenter.toFixed(1)}px)，建议增加dy偏移量`)
          }
        }
      }
    })

    return analysis
  }

  /**
   * 输出所有节点的调试信息
   */
  debugAllNodes() {
    if (!this.isEnabled) {return}

    this.log('info', '🔍 [端口坐标调试] 开始调试所有节点')
    
    if (this.debugInfo.size === 0) {
      this.log('debug', '📝 当前没有调试信息，尝试从图形中获取所有节点...')
      
      if (this.graph) {
        const nodes = this.graph.getNodes()
        this.log('info', `📊 发现 ${nodes.length} 个节点，开始分析...`)
        
        const nodeIds = nodes.map(node => ({ id: node.id, type: node.getData()?.type || node.getData()?.nodeType || 'unknown' }))
        this.log('debug', '📋 节点ID列表:', nodeIds)
        
        nodes.forEach(node => {
          const nodeId = node.id
          const nodeData = node.getData() || {}
          const nodeType = nodeData.nodeType || nodeData.type || 'unknown'
          
          this.log('debug', `🔍 开始处理节点: ${nodeId} (类型: ${nodeType})`)
          
          // 为每个节点创建基础调试信息
          this.debugNodeCreation(nodeData, {
            id: nodeId,
            width: node.getSize()?.width || 100,
            height: node.getSize()?.height || 100,
            shape: nodeData.shape || 'circle'
          })
          
          // 获取端口配置
          let portConfig = null
          
          if (nodeData.portConfig && typeof nodeData.portConfig === 'object') {
            this.log('debug', `✅ [debugAllNodes] 节点 ${nodeId} 从数据中找到端口配置`)
            portConfig = nodeData.portConfig
          } else {
            this.log('debug', `🔧 [debugAllNodes] 节点 ${nodeId} 没有端口配置，尝试创建默认配置`)
            try {
              portConfig = this.createDefaultPortConfig(nodeType, nodeData)
            } catch (error) {
              this.log('error', `❌ [debugAllNodes] 创建默认端口配置失败:`, error)
            }
          }
          
          this.log('debug', `📋 节点 ${nodeId} 最终端口配置:`, portConfig)
          
          // 调试端口配置
          this.debugPortConfiguration(nodeId, portConfig)
        })
      }
    }
    
    this.debugInfo.forEach((debugData, nodeId) => {
      if (this.debugMode) {
        console.group(`📍 节点: ${nodeId}`)
      }
      
      this.log('debug', `🔍 调试数据完整性检查:`, {
        hasPortConfig: !!debugData.portConfig,
        portConfigKeys: debugData.portConfig ? Object.keys(debugData.portConfig) : [],
        portConfigEmpty: !debugData.portConfig || Object.keys(debugData.portConfig).length === 0
      })
      
      // 输出节点形状计算信息
      this.log('debug', `[FlowNode] 节点形状计算: {nodeType: ${debugData.nodeType}, shape: ${debugData.shape}}`)
      
      // 输出节点DOM边界框信息
      if (this.graph) {
        const node = this.graph.getCellById(nodeId)
        if (node) {
          const position = node.getPosition()
          const size = node.getSize()
          if (position && size) {
            this.log('debug', `节点DOM边界框: {x: ${position.x}, y: ${position.y}, width: ${size.width}, height: ${size.height}, center: Object}`)
          }
        }
      }
      
      this.log('debug', '基础信息:', {
        type: debugData.nodeType,
        position: debugData.nodePosition,
        size: debugData.nodeSize,
        shape: debugData.shape
      })
      
      // 检查端口配置
      this.log('debug', `🔍 [端口配置检查] 节点 ${nodeId}:`, {
        hasPortConfig: !!debugData.portConfig,
        portConfigType: typeof debugData.portConfig,
        portConfigKeys: debugData.portConfig ? Object.keys(debugData.portConfig) : [],
        hasGroups: !!(debugData.portConfig && debugData.portConfig.groups),
        hasItems: !!(debugData.portConfig && debugData.portConfig.items)
      })
      
      this.log('debug', `🔍 [端口配置分析] 节点 ${nodeId}:`, {
        hasGroups: !!(debugData.portConfig && debugData.portConfig.groups),
        hasItems: !!(debugData.portConfig && debugData.portConfig.items),
        groupsCount: debugData.portConfig && debugData.portConfig.groups ? Object.keys(debugData.portConfig.groups).length : 0,
        itemsCount: debugData.portConfig && debugData.portConfig.items ? debugData.portConfig.items.length : 0
      })
      
      if (debugData.portConfig && typeof debugData.portConfig === 'object') {
        const hasGroups = debugData.portConfig.groups && Object.keys(debugData.portConfig.groups).length > 0
        const hasItems = debugData.portConfig.items && debugData.portConfig.items.length > 0
        
        if (hasGroups || hasItems) {
          this.log('info', `✅ 节点 ${nodeId} 有端口配置信息`)
          
          // 端口组配置
          if (hasGroups) {
            this.log('debug', `📍 端口组配置 (${Object.keys(debugData.portConfig.groups).length} 个组):`)
            Object.entries(debugData.portConfig.groups).forEach(([groupName, groupConfig]) => {
              this.log('debug', '位置配置:', groupConfig.position)
              
              // 计算并显示实际坐标
              if (groupConfig.position) {
                const actualCoords = this.calculateActualPortCoordinates(debugData, groupConfig.position)
                this.log('debug', '计算的实际坐标:', actualCoords)
                
                // 输出端口坐标详细信息
                this.log('debug', `🔌 [端口坐标] ${groupName}端口: {x: ${actualCoords.final.x}, y: ${actualCoords.final.y}, dx: ${actualCoords.offset.dx}, dy: ${actualCoords.offset.dy}}`)
              }
            })
          }
          
          // 端口项配置
          if (hasItems) {
            this.log('debug', `🔌 端口项配置 (${debugData.portConfig.items.length} 个项):`, debugData.portConfig.items)
            
            // 为每个端口项输出详细坐标
            debugData.portConfig.items.forEach((item, index) => {
              if (debugData.portConfig.groups && debugData.portConfig.groups[item.group]) {
                const groupConfig = debugData.portConfig.groups[item.group]
                if (groupConfig.position) {
                  const actualCoords = this.calculateActualPortCoordinates(debugData, groupConfig.position)
                  this.log('debug', `🔌 [端口项${index + 1}] ${item.id} (${item.group}): {x: ${actualCoords.final.x}, y: ${actualCoords.final.y}}`)
                }
              } else {
                this.log('warn', `🔌 [端口项${index + 1}] ${item.id} (${item.group}): 无对应端口组配置`)
              }
            })
          }
        }
      }
      
      // 输出端口分析结果
      if (debugData.portAnalysis) {
        this.log('debug', '坐标分析:', debugData.portAnalysis.coordinates)
        
        if (debugData.portAnalysis.issues && debugData.portAnalysis.issues.length > 0) {
          this.log('warn', '⚠️ 发现问题:', debugData.portAnalysis.issues)
        }
        
        if (debugData.portAnalysis.recommendations && Array.isArray(debugData.portAnalysis.recommendations) && debugData.portAnalysis.recommendations.length > 0) {
          this.log('debug', '💡 建议:', debugData.portAnalysis.recommendations)
        }
      }
      
      if (this.debugMode) {
        console.groupEnd()
      }
    })
    
    this.log('info', `📊 调试总结: 共分析了 ${this.debugInfo.size} 个节点`)
  }

  /**
   * 创建默认端口配置
   */
  createDefaultPortConfig(nodeType, nodeData = {}) {
    this.log('debug', `🔧 [createDefaultPortConfig] 为节点类型 ${nodeType} 创建默认端口配置`)
    
    try {
      const defaultConfig = {
        groups: {
          in: {
            position: {
              name: 'top',
              args: { x: '50%', y: '0%', dx: 0, dy: -15 }
            },
            attrs: {
              circle: {
                r: 5,
                magnet: false,
                stroke: '#5F95FF',
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
              args: { x: '50%', y: '100%', dx: 0, dy: 15 }
            },
            attrs: {
              circle: {
                r: 5,
                magnet: false,
                stroke: '#5F95FF',
                strokeWidth: 2,
                fill: '#fff',
                style: { visibility: 'visible' }
              }
            },
            markup: [{ tagName: 'circle', selector: 'circle' }]
          }
        },
        items: [
          {
            group: 'in',
            id: 'in',
            attrs: {
              circle: {
                r: 5,
                magnet: false,
                stroke: '#5F95FF',
                strokeWidth: 2,
                fill: '#fff',
                style: { visibility: 'visible' }
              }
            }
          },
          {
            group: 'out',
            id: 'out',
            attrs: {
              circle: {
                r: 5,
                magnet: false,
                stroke: '#5F95FF',
                strokeWidth: 2,
                fill: '#fff',
                style: { visibility: 'visible' }
              }
            }
          }
        ]
      }
      
      this.log('debug', `✅ [createDefaultPortConfig] 创建成功:`, defaultConfig)
      return defaultConfig
    } catch (error) {
      this.log('error', `❌ [createDefaultPortConfig] 创建端口配置时发生错误:`, error)
      return null
    }
  }

  /**
   * 调试渲染后的端口坐标
   */
  debugRenderedPortCoordinates(nodeId) {
    if (!this.isEnabled) {return}

    this.log('debug', `🔍 [debugRenderedPortCoordinates] 开始调试节点 ${nodeId} 的渲染后端口坐标`)
    
    if (!this.graph) {
      this.log('warn', '⚠️ [debugRenderedPortCoordinates] Graph 实例不存在')
      return
    }

    const node = this.graph.getCellById(nodeId)
    if (!node) {
      this.log('warn', `⚠️ [debugRenderedPortCoordinates] 节点 ${nodeId} 不存在`)
      return
    }

    try {
      // 获取节点的实际渲染位置和大小
      const position = node.getPosition()
      const size = node.getSize()
      const ports = node.getPorts()
      
      this.log('debug', `📍 [debugRenderedPortCoordinates] 节点 ${nodeId} 渲染信息:`, {
        position,
        size,
        portsCount: ports ? ports.length : 0,
        ports
      })

      // 更新调试信息中的渲染数据
      const debugData = this.debugInfo.get(nodeId)
      if (debugData) {
        debugData.renderedPosition = position
        debugData.renderedSize = size
        debugData.renderedPorts = ports
        debugData.renderTimestamp = Date.now()
        this.debugInfo.set(nodeId, debugData)
        
        this.log('debug', `✅ [debugRenderedPortCoordinates] 已更新节点 ${nodeId} 的渲染调试信息`)
      } else {
        this.log('warn', `⚠️ [debugRenderedPortCoordinates] 节点 ${nodeId} 没有调试信息`)
      }

    } catch (error) {
      this.log('error', `❌ [debugRenderedPortCoordinates] 调试节点 ${nodeId} 时发生错误:`, error)
    }
  }

  /**
   * 清除调试信息
   */
  clearDebugInfo() {
    this.debugInfo.clear()
    this.log('info', '🔧 [端口坐标调试器] 调试信息已清除')
  }
}

let globalDebugger = null

export const getPortCoordinateDebugger = (graph) => {
  if (!globalDebugger) {
    globalDebugger = new PortCoordinateDebugger(graph)
  }
  return globalDebugger
}

export const debugPortCoordinates = {
  nodeCreation: (nodeData, nodeConfig, graph) => {
    const portDebugger = getPortCoordinateDebugger(graph)
    return portDebugger.debugNodeCreation(nodeData, nodeConfig)
  },
  
  portConfiguration: (nodeId, portConfig, graph) => {
    const portDebugger = getPortCoordinateDebugger(graph)
    return portDebugger.debugPortConfiguration(nodeId, portConfig)
  },
  
  allNodes: (graph) => {
    const portDebugger = getPortCoordinateDebugger(graph)
    return portDebugger.debugAllNodes()
  }
}

export default PortCoordinateDebugger