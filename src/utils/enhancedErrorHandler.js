/**
 * 增强的错误处理工具
 * 提供统一的错误处理、日志记录和防御性编程工具
 */

/**
 * 错误类型枚举
 */
export const ErrorTypes = {
  VALIDATION: 'VALIDATION',
  CONNECTION: 'CONNECTION',
  NODE_NOT_FOUND: 'NODE_NOT_FOUND',
  PORT_NOT_FOUND: 'PORT_NOT_FOUND',
  PREVIEW_LINE: 'PREVIEW_LINE',
  LAYOUT: 'LAYOUT',
  CONFIG: 'CONFIG'
}

/**
 * 日志级别枚举
 */
export const LogLevels = {
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR'
}

/**
 * 增强的日志记录器
 */
class EnhancedLogger {
  constructor(context = 'System') {
    this.context = context
    this.isDebugMode = process.env.NODE_ENV === 'development'
  }

  /**
   * 格式化日志消息
   */
  formatMessage(level, message, data = null) {
    const timestamp = new Date().toISOString()
    const prefix = `[${timestamp}] [${this.context}] [${level}]`
    
    if (data) {
      return [`${prefix} ${message}`, data]
    }
    return [`${prefix} ${message}`, null]
  }

  debug(message, data = null) {
    if (this.isDebugMode) {
      const [formattedMessage, logData] = this.formatMessage(LogLevels.DEBUG, message, data)
      if (logData) {
        console.debug(formattedMessage, logData)
      } else {
        console.debug(formattedMessage)
      }
    }
  }

  info(message, data = null) {
    const [formattedMessage, logData] = this.formatMessage(LogLevels.INFO, message, data)
    if (logData) {
      console.info(formattedMessage, logData)
    } else {
      console.info(formattedMessage)
    }
  }

  warn(message, data = null) {
    const [formattedMessage, logData] = this.formatMessage(LogLevels.WARN, message, data)
    if (logData) {
      console.warn(formattedMessage, logData)
    } else {
      console.warn(formattedMessage)
    }
  }

  error(message, error = null, data = null) {
    const [formattedMessage, logData] = this.formatMessage(LogLevels.ERROR, message, data)
    if (error && logData) {
      console.error(formattedMessage, error, logData)
    } else if (error) {
      console.error(formattedMessage, error)
    } else if (logData) {
      console.error(formattedMessage, logData)
    } else {
      console.error(formattedMessage)
    }
  }
}

/**
 * 安全执行函数，带错误处理
 * @param {Function} fn - 要执行的函数
 * @param {Object} options - 选项
 * @returns {Object} 执行结果 { success: boolean, result?: any, error?: Error }
 */
export const safeExecute = async (fn, options = {}) => {
  const {
    context = 'SafeExecute',
    fallbackValue = null,
    logErrors = true,
    retryCount = 0,
    retryDelay = 1000
  } = options

  const logger = new EnhancedLogger(context)
  let lastError = null

  for (let attempt = 0; attempt <= retryCount; attempt++) {
    try {
      const result = await fn()
      if (attempt > 0) {
        logger.info(`操作在第 ${attempt + 1} 次尝试后成功`)
      }
      return { success: true, result }
    } catch (error) {
      lastError = error
      
      if (logErrors) {
        logger.error(`操作失败 (尝试 ${attempt + 1}/${retryCount + 1})`, error)
      }

      if (attempt < retryCount) {
        logger.info(`${retryDelay}ms 后重试...`)
        await new Promise(resolve => setTimeout(resolve, retryDelay))
      }
    }
  }

  return { 
    success: false, 
    error: lastError, 
    result: fallbackValue 
  }
}

/**
 * 防御性检查工具
 */
export const Guards = {
  /**
   * 检查对象是否存在且有效
   */
  isValidObject(obj, requiredProps = []) {
    if (!obj || typeof obj !== 'object') {
      return false
    }

    return requiredProps.every(prop => {
      const value = obj[prop]
      return value !== undefined && value !== null
    })
  },

  /**
   * 检查节点是否有效
   */
  isValidNode(node) {
    return this.isValidObject(node, ['id']) && 
           typeof node.isNode === 'function' && 
           node.isNode()
  },

  /**
   * 检查端口是否存在
   */
  hasPort(node, portId) {
    if (!this.isValidNode(node) || typeof node.getPort !== 'function') {
      return false
    }
    
    try {
      const port = node.getPort(portId)
      return !!port
    } catch (error) {
      return false
    }
  },

  /**
   * 检查连接配置是否有效
   */
  isValidConnectionConfig(config) {
    return this.isValidObject(config, ['source', 'target']) &&
           this.isValidObject(config.source, ['cell', 'port']) &&
           this.isValidObject(config.target, ['cell', 'port'])
  }
}

/**
 * 预览线错误处理器
 */
export class PreviewLineErrorHandler {
  constructor() {
    this.logger = new EnhancedLogger('PreviewLineManager')
  }

  /**
   * 安全更新预览线位置
   */
  async safeUpdatePosition(previewLines, nodeId, position) {
    if (!previewLines || !previewLines.has) {
      this.logger.warn('预览线存储无效')
      return false
    }

    if (!previewLines.has(nodeId)) {
      this.logger.debug(`节点 ${nodeId} 无预览线实例，跳过位置更新`)
      return false
    }

    const { success, error } = await safeExecute(
      () => {
        const previewLine = previewLines.get(nodeId)
        if (previewLine && typeof previewLine.updatePosition === 'function') {
          previewLine.updatePosition(position)
          return true
        }
        throw new Error('预览线实例无效或缺少updatePosition方法')
      },
      {
        context: 'PreviewLinePositionUpdate',
        logErrors: true
      }
    )

    if (!success) {
      this.logger.error(`更新预览线位置失败: ${nodeId}`, error)
    }

    return success
  }

  /**
   * 安全删除预览线
   */
  async safeRemovePreviewLine(previewLines, nodeId) {
    if (!previewLines || !previewLines.has) {
      this.logger.warn('预览线存储无效')
      return false
    }

    if (!previewLines.has(nodeId)) {
      this.logger.debug(`节点 ${nodeId} 无预览线实例，跳过删除`)
      return true // 已经不存在，视为成功
    }

    const { success, error } = await safeExecute(
      () => {
        const previewLine = previewLines.get(nodeId)
        if (previewLine && typeof previewLine.remove === 'function') {
          previewLine.remove()
        }
        previewLines.delete(nodeId)
        return true
      },
      {
        context: 'PreviewLineRemoval',
        logErrors: true
      }
    )

    if (!success) {
      this.logger.error(`删除预览线失败: ${nodeId}`, error)
    }

    return success
  }
}

/**
 * 连接错误处理器
 */
export class ConnectionErrorHandler {
  constructor() {
    this.logger = new EnhancedLogger('ConnectionManager')
  }

  /**
   * 验证连接前置条件
   */
  validateConnectionPreconditions(graph, sourceNodeId, targetNodeId, sourcePort, targetPort) {
    const errors = []

    // 检查图实例
    if (!graph || typeof graph.getCellById !== 'function') {
      errors.push('图实例无效')
      return { valid: false, errors }
    }

    // 检查源节点
    const sourceNode = graph.getCellById(sourceNodeId)
    this.logger.debug('源节点验证', {
      sourceNodeId,
      sourcePort,
      nodeFound: !!sourceNode,
      isValidNode: Guards.isValidNode(sourceNode)
    })

    if (!Guards.isValidNode(sourceNode)) {
      errors.push(`源节点不存在或无效: ${sourceNodeId}`)
    } else {
      // 获取节点的所有端口信息用于调试
      const nodePorts = sourceNode.getPorts ? sourceNode.getPorts() : []
      const hasPortResult = Guards.hasPort(sourceNode, sourcePort)
      
      this.logger.debug('源节点端口验证', {
        sourceNodeId,
        sourcePort,
        availablePorts: nodePorts.map(p => p.id || p),
        hasPort: hasPortResult,
        nodeType: sourceNode.getData ? ((sourceNode.getData() || {}).type || (sourceNode.getData() || {}).nodeType) : 'unknown'
      })
      
      // 详细输出端口信息用于调试
      this.logger.debug('源节点端口详细信息', {
        sourceNodeId,
        portCount: nodePorts.length,
        ports: nodePorts.map((port, index) => ({
          index,
          id: port.id,
          group: port.group,
          fullPort: port
        })),
        searchingFor: sourcePort,
        exactMatch: nodePorts.find(p => (p.id || p) === sourcePort),
        portIds: nodePorts.map(p => p.id || p),
        nodeData: sourceNode.getData() || {},
        nodeShape: sourceNode.shape
      })

      if (!hasPortResult) {
        errors.push(`源节点缺少端口: ${sourcePort} (可用端口: ${nodePorts.map(p => p.id || p).join(', ')})`)
      }
    }

    // 检查目标节点
    const targetNode = graph.getCellById(targetNodeId)
    this.logger.debug('目标节点验证', {
      targetNodeId,
      targetPort,
      nodeFound: !!targetNode,
      isValidNode: Guards.isValidNode(targetNode)
    })

    if (!Guards.isValidNode(targetNode)) {
      errors.push(`目标节点不存在或无效: ${targetNodeId}`)
    } else {
      // 获取节点的所有端口信息用于调试
      const nodePorts = targetNode.getPorts ? targetNode.getPorts() : []
      const hasPortResult = Guards.hasPort(targetNode, targetPort)
      
      this.logger.debug('目标节点端口验证', {
        targetNodeId,
        targetPort,
        availablePorts: nodePorts.map(p => p.id || p),
        hasPort: hasPortResult
      })

      if (!hasPortResult) {
        errors.push(`目标节点缺少端口: ${targetPort} (可用端口: ${nodePorts.map(p => p.id || p).join(', ')})`)
      }
    }

    // 检查是否连接到自身
    if (sourceNodeId === targetNodeId) {
      errors.push('不能连接到自身')
    }

    return {
      valid: errors.length === 0,
      errors,
      sourceNode: errors.length === 0 ? sourceNode : null,
      targetNode: errors.length === 0 ? targetNode : null
    }
  }

  /**
   * 安全创建连接
   */
  async safeCreateConnection(graph, connectionConfig) {
    const validation = this.validateConnectionPreconditions(
      graph,
      connectionConfig.source.cell,
      connectionConfig.target.cell,
      connectionConfig.source.port,
      connectionConfig.target.port
    )

    if (!validation.valid) {
      this.logger.error('连接前置条件验证失败', { errors: validation.errors })
      return { success: false, errors: validation.errors }
    }

    const { success, result, error } = await safeExecute(
      () => graph.addEdge(connectionConfig),
      {
        context: 'ConnectionCreation',
        logErrors: true
      }
    )

    if (success) {
      this.logger.info('连接创建成功', {
        connectionId: result.id,
        source: connectionConfig.source,
        target: connectionConfig.target
      })
    }

    return { success, result, error }
  }
}

// 创建全局实例
export const logger = new EnhancedLogger('Global')
export const previewLineErrorHandler = new PreviewLineErrorHandler()
export const connectionErrorHandler = new ConnectionErrorHandler()

export default {
  ErrorTypes,
  LogLevels,
  EnhancedLogger,
  safeExecute,
  Guards,
  PreviewLineErrorHandler,
  ConnectionErrorHandler,
  logger,
  previewLineErrorHandler,
  connectionErrorHandler
}