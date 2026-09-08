/**
 * 统一连接验证工具
 * 提供精确的连接重复检查和清晰的错误信息
 */

import { isPreviewLine, isConnectionLine } from '../../composables/canvas/unified/EdgeTypes.js'

export class ConnectionValidator {
  constructor(graph = null) {
    this.graph = graph
    this.validationCache = new Map()
    this.cacheTimeout = 5000 // 5秒缓存超时
  }

  /**
   * 设置图实例
   * @param {Object} graph - X6图实例
   */
  setGraph(graph) {
    this.graph = graph
    this.clearCache()
  }

  /**
   * 检查连接是否重复
   * @param {string} sourceNodeId - 源节点ID
   * @param {string} targetNodeId - 目标节点ID
   * @param {string} branchId - 分支ID（可选）
   * @param {Array} connectionsList - 连接列表（可选）
   * @returns {Object} 验证结果
   */
  checkDuplicateConnection(sourceNodeId, targetNodeId, branchId = null, connectionsList = []) {
    // 参数验证
    if (!sourceNodeId || !targetNodeId) {
      return {
        isDuplicate: false,
        error: '源节点ID或目标节点ID不能为空',
        existingConnection: null
      }
    }

    // 检查自连接
    if (sourceNodeId === targetNodeId) {
      return {
        isDuplicate: true,
        error: '不允许节点连接到自身',
        existingConnection: null
      }
    }

    // 生成缓存键
    const cacheKey = `${sourceNodeId}-${targetNodeId}-${branchId || 'default'}`
    const cachedResult = this.getCachedResult(cacheKey)
    if (cachedResult) {
      return cachedResult
    }

    let existingConnection = null

    // 1. 检查连接列表
    if (connectionsList && connectionsList.length > 0) {
      existingConnection = this.findConnectionInList(sourceNodeId, targetNodeId, branchId, connectionsList)
      if (existingConnection) {
        const result = {
          isDuplicate: true,
          error: `连接已存在于连接列表中: ${sourceNodeId} -> ${targetNodeId}${branchId ? ` (分支: ${branchId})` : ''}`,
          existingConnection: existingConnection
        }
        this.setCachedResult(cacheKey, result)
        return result
      }
    }

    // 2. 检查图形中的边
    if (this.graph) {
      existingConnection = this.findConnectionInGraph(sourceNodeId, targetNodeId, branchId)
      if (existingConnection) {
        const result = {
          isDuplicate: true,
          error: `连接已存在于图形中: ${sourceNodeId} -> ${targetNodeId}${branchId ? ` (分支: ${branchId})` : ''}`,
          existingConnection: existingConnection
        }
        this.setCachedResult(cacheKey, result)
        return result
      }
    }

    // 无重复连接
    const result = {
      isDuplicate: false,
      error: null,
      existingConnection: null
    }
    this.setCachedResult(cacheKey, result)
    return result
  }

  /**
   * 在连接列表中查找连接
   * @param {string} sourceNodeId - 源节点ID
   * @param {string} targetNodeId - 目标节点ID
   * @param {string} branchId - 分支ID
   * @param {Array} connectionsList - 连接列表
   * @returns {Object|null} 找到的连接或null
   */
  findConnectionInList(sourceNodeId, targetNodeId, branchId, connectionsList) {
    return connectionsList.find(connection => {
      const matchesNodes = (connection.source?.cell || connection.source) === sourceNodeId && 
                          (connection.target?.cell || connection.target) === targetNodeId
      
      // 分支匹配逻辑
      const matchesBranch = this.matchesBranch(connection.branchId, branchId)
      
      return matchesNodes && matchesBranch
    }) || null
  }

  /**
   * 在图形中查找连接
   * @param {string} sourceNodeId - 源节点ID
   * @param {string} targetNodeId - 目标节点ID
   * @param {string} branchId - 分支ID
   * @returns {Object|null} 找到的连接或null
   */
  findConnectionInGraph(sourceNodeId, targetNodeId, branchId) {
    if (!this.graph) return null

    const allEdges = this.graph.getEdges() || []
    
    const existingEdge = allEdges.find(edge => {
      const edgeData = edge.getData() || {}
      const edgeSourceId = edgeData.sourceNodeId || edge.getSourceCellId()
      const edgeTargetId = edgeData.targetNodeId || edge.getTargetCellId()
      const edgeBranchId = edgeData.branchId

      // 检查节点匹配
      const matchesNodes = edgeSourceId === sourceNodeId && edgeTargetId === targetNodeId
      
      // 检查分支匹配
      const matchesBranch = this.matchesBranch(edgeBranchId, branchId)
      
      // 确保不是预览线
      const isNotPreview = !edgeData.isPreview && !isPreviewLine(edge)
      
      return matchesNodes && matchesBranch && isNotPreview
    })

    if (existingEdge) {
      // 从图形边构造连接对象
      const edgeData = existingEdge.getData() || {}
      return {
        id: existingEdge.id,
        source: existingEdge.getSourceCellId(),
        target: existingEdge.getTargetCellId(),
        sourcePort: edgeData.sourcePort || existingEdge.getSourcePortId(),
        targetPort: edgeData.targetPort || existingEdge.getTargetPortId(),
        data: edgeData,
        branchId: edgeData.branchId,
        type: 'graph-edge'
      }
    }

    return null
  }

  /**
   * 检查分支是否匹配
   * @param {string} edgeBranchId - 边的分支ID
   * @param {string} targetBranchId - 目标分支ID
   * @returns {boolean} 是否匹配
   */
  matchesBranch(edgeBranchId, targetBranchId) {
    // 如果目标分支ID为null或undefined，则忽略分支检查
    if (targetBranchId === null || targetBranchId === undefined) {
      return true
    }
    
    // 精确匹配分支ID
    return edgeBranchId === targetBranchId
  }

  /**
   * 验证连接的有效性
   * @param {Object} connectionData - 连接数据
   * @returns {Object} 验证结果
   */
  validateConnection(connectionData) {
    const errors = []
    const warnings = []

    // 基本数据验证
    if (!connectionData.source) {
      errors.push('缺少源节点信息')
    }
    if (!connectionData.target) {
      errors.push('缺少目标节点信息')
    }

    const sourceNodeId = connectionData.source?.cell || connectionData.source
    const targetNodeId = connectionData.target?.cell || connectionData.target

    if (!sourceNodeId) {
      errors.push('源节点ID不能为空')
    }
    if (!targetNodeId) {
      errors.push('目标节点ID不能为空')
    }

    // 如果基本验证失败，直接返回
    if (errors.length > 0) {
      return {
        isValid: false,
        errors,
        warnings
      }
    }

    // 检查重复连接
    const duplicateCheck = this.checkDuplicateConnection(
      sourceNodeId, 
      targetNodeId, 
      connectionData.branchId
    )
    
    if (duplicateCheck.isDuplicate) {
      errors.push(duplicateCheck.error)
    }

    // 端口验证
    const sourcePort = connectionData.source?.port || connectionData.sourcePort || 'out'
    const targetPort = connectionData.target?.port || connectionData.targetPort || 'in'

    if (sourcePort !== 'out') {
      warnings.push(`源端口建议使用 'out'，当前为 '${sourcePort}'`)
    }
    if (targetPort !== 'in') {
      warnings.push(`目标端口建议使用 'in'，当前为 '${targetPort}'`)
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      duplicateCheck
    }
  }

  /**
   * 获取缓存结果
   * @param {string} cacheKey - 缓存键
   * @returns {Object|null} 缓存的结果或null
   */
  getCachedResult(cacheKey) {
    const cached = this.validationCache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.result
    }
    return null
  }

  /**
   * 设置缓存结果
   * @param {string} cacheKey - 缓存键
   * @param {Object} result - 结果对象
   */
  setCachedResult(cacheKey, result) {
    this.validationCache.set(cacheKey, {
      result,
      timestamp: Date.now()
    })
  }

  /**
   * 清除缓存
   */
  clearCache() {
    this.validationCache.clear()
  }

  /**
   * 清除过期缓存
   */
  clearExpiredCache() {
    const now = Date.now()
    for (const [key, value] of this.validationCache.entries()) {
      if (now - value.timestamp >= this.cacheTimeout) {
        this.validationCache.delete(key)
      }
    }
  }

  /**
   * 获取统计信息
   * @returns {Object} 统计信息
   */
  getStats() {
    return {
      cacheSize: this.validationCache.size,
      cacheTimeout: this.cacheTimeout,
      hasGraph: !!this.graph
    }
  }
}

// 创建全局实例
export const globalConnectionValidator = new ConnectionValidator()

// 导出便捷函数
export const checkDuplicateConnection = (sourceNodeId, targetNodeId, branchId, connectionsList) => {
  return globalConnectionValidator.checkDuplicateConnection(sourceNodeId, targetNodeId, branchId, connectionsList)
}

export const validateConnection = (connectionData) => {
  return globalConnectionValidator.validateConnection(connectionData)
}

export const setValidatorGraph = (graph) => {
  globalConnectionValidator.setGraph(graph)
}