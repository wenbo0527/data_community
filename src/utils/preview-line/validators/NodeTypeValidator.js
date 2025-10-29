/**
 * 节点类型验证器
 * 负责验证节点类型的真实性和有效性
 */

import { nodeTypes, getNodeConfig, isValidNodeType, getAllNodeTypes } from '../../nodeTypes.js'
import { getNodeType } from '../../nodeTypeHelper.js'

/**
 * 节点类型验证器类
 */
export class NodeTypeValidator {
  constructor() {
    // 支持的节点类型列表（从nodeTypes.js获取）
    this.supportedNodeTypes = getAllNodeTypes()
    
    // 调试模式
    this.debugMode = true
    
    // 验证统计
    this.validationStats = {
      total: 0,
      valid: 0,
      invalid: 0,
      typeErrors: 0,
      consistencyErrors: 0,
      dataMatchErrors: 0
    }
  }

  /**
   * 验证节点类型的真实性 - 增强版
   * @param {Object} node - 节点对象
   * @returns {Object} 验证结果
   */
  validateNodeType(node) {
    this.validationStats.total++
    
    const result = {
      isValid: true,
      nodeType: null,
      actualType: null,
      expectedType: null,
      errors: [],
      warnings: [],
      suggestions: [],
      details: {
        typeConsistency: null,
        dataMatch: null,
        configValidation: null
      }
    }

    try {
      // 1. 基础参数验证
      if (!node) {
        result.isValid = false
        result.errors.push('节点对象不存在')
        this.validationStats.invalid++
        return result
      }

      // 2. 获取节点类型 - 使用增强的提取方法
      const nodeType = this.extractNodeType(node)
      result.actualType = nodeType
      result.nodeType = nodeType

      if (!nodeType) {
        result.isValid = false
        result.errors.push('无法获取节点类型')
        result.suggestions.push('请确保节点对象包含有效的type或nodeType属性')
        this.validationStats.typeErrors++
        this.validationStats.invalid++
        return result
      }

      // 3. 验证节点类型是否在支持列表中
      if (!this.supportedNodeTypes.includes(nodeType)) {
        result.isValid = false
        result.errors.push(`不支持的节点类型: "${nodeType}"`)
        result.suggestions.push(`支持的节点类型: ${this.supportedNodeTypes.join(', ')}`)
        
        // 提供相似类型建议
        const similarType = this.findSimilarNodeType(nodeType)
        if (similarType) {
          result.suggestions.push(`您是否想要使用: "${similarType}"?`)
        }
        
        this.validationStats.typeErrors++
        this.validationStats.invalid++
        return result
      }

      // 4. 验证节点配置是否存在
      const nodeConfig = getNodeConfig(nodeType)
      if (!nodeConfig) {
        result.isValid = false
        result.errors.push(`节点类型 "${nodeType}" 缺少配置定义`)
        this.validationStats.typeErrors++
        this.validationStats.invalid++
        return result
      }

      result.details.configValidation = {
        exists: true,
        hasLabel: !!nodeConfig.label,
        hasColor: !!nodeConfig.color,
        hasPorts: !!nodeConfig.ports
      }

      // 5. 验证节点类型一致性 - 增强版
      const consistencyResult = this.validateNodeTypeConsistency(node, nodeType)
      result.details.typeConsistency = consistencyResult
      
      if (!consistencyResult.isValid) {
        result.warnings.push(...consistencyResult.warnings)
        this.validationStats.consistencyErrors++
      }

      // 6. 验证节点类型与数据的匹配性 - 增强版
      const dataMatchResult = this.validateNodeDataMatch(node, nodeType, nodeConfig)
      result.details.dataMatch = dataMatchResult
      
      if (!dataMatchResult.isValid) {
        result.warnings.push(...dataMatchResult.warnings)
        this.validationStats.dataMatchErrors++
      }

      // 7. 验证危险节点类型
      const dangerousTypes = ['email'] // 用户指出不应该有邮件节点
      if (dangerousTypes.includes(nodeType)) {
        result.isValid = false
        result.errors.push(`危险的节点类型: "${nodeType}" 不被允许`)
        result.suggestions.push('请使用其他通信节点类型，如: sms, wechat, ai-call')
        this.validationStats.invalid++
        return result
      }

      // 8. 验证节点类型与预期用途的匹配
      const usageValidation = this.validateNodeTypeUsage(node, nodeType, nodeConfig)
      if (!usageValidation.isValid) {
        result.warnings.push(...usageValidation.warnings)
      }

      this.validationStats.valid++
      this.log('info', `节点类型验证通过: ${nodeType}`, {
        nodeId: this.getNodeId(node),
        nodeType,
        configExists: !!nodeConfig,
        consistencyValid: consistencyResult.isValid,
        dataMatchValid: dataMatchResult.isValid
      })

    } catch (error) {
      result.isValid = false
      result.errors.push(`节点类型验证异常: ${error.message}`)
      this.validationStats.invalid++
      this.log('error', '节点类型验证异常', {
        error: error.message,
        stack: error.stack,
        nodeId: this.getNodeId(node)
      })
    }

    return result
  }

  /**
   * 批量验证多个节点的类型
   * @param {Array} nodes - 节点数组
   * @returns {Object} 批量验证结果
   */
  validateMultipleNodeTypes(nodes) {
    const result = {
      isValid: true,
      totalNodes: 0,
      validNodes: 0,
      invalidNodes: 0,
      results: [],
      summary: {
        supportedTypes: new Set(),
        unsupportedTypes: new Set(),
        errors: [],
        warnings: []
      }
    }

    if (!Array.isArray(nodes)) {
      result.isValid = false
      result.summary.errors.push('输入不是有效的节点数组')
      return result
    }

    result.totalNodes = nodes.length

    nodes.forEach((node, index) => {
      const nodeResult = this.validateNodeType(node)
      result.results.push({
        index,
        nodeId: this.getNodeId(node),
        ...nodeResult
      })

      if (nodeResult.isValid) {
        result.validNodes++
        if (nodeResult.nodeType) {
          result.summary.supportedTypes.add(nodeResult.nodeType)
        }
      } else {
        result.invalidNodes++
        if (nodeResult.actualType) {
          result.summary.unsupportedTypes.add(nodeResult.actualType)
        }
        result.summary.errors.push(...nodeResult.errors)
      }

      result.summary.warnings.push(...nodeResult.warnings)
    })

    result.isValid = result.invalidNodes === 0

    // 转换Set为Array以便序列化
    result.summary.supportedTypes = Array.from(result.summary.supportedTypes)
    result.summary.unsupportedTypes = Array.from(result.summary.unsupportedTypes)

    return result
  }

  /**
   * 提取节点类型 - 增强版，支持更多数据源
   * @param {Object} node - 节点对象
   * @returns {string|null} 节点类型
   */
  extractNodeType(node) {
    if (!node) return null

    // 尝试多种可能的节点类型字段，按优先级排序
    const typeFields = [
      () => node.type,
      () => node.nodeType,
      () => node.data?.type,
      () => node.data?.nodeType,
      () => node.store?.data?.data?.type,
      () => node.store?.data?.data?.nodeType,
      () => node.getData?.()?.type,
      () => node.getData?.()?.nodeType,
      () => getNodeType(node) // 使用nodeTypeHelper
    ]

    for (const getType of typeFields) {
      try {
        const type = getType()
        if (type && typeof type === 'string' && type.trim() !== '') {
          return type.trim()
        }
      } catch (error) {
        // 忽略单个字段获取错误，继续尝试下一个
        continue
      }
    }

    this.log('warn', '无法提取节点类型', {
      nodeId: this.getNodeId(node),
      availableFields: {
        type: node.type,
        nodeType: node.nodeType,
        dataType: node.data?.type,
        dataNodeType: node.data?.nodeType,
        hasGetData: typeof node.getData === 'function'
      }
    })

    return null
  }

  /**
   * 验证节点类型一致性 - 增强版
   * @param {Object} node - 节点对象
   * @param {string} primaryType - 主要节点类型
   * @returns {Object} 一致性验证结果
   */
  validateNodeTypeConsistency(node, primaryType) {
    const result = {
      isValid: true,
      warnings: [],
      inconsistencies: [],
      checkedFields: []
    }

    try {
      // 收集所有可能的类型字段
      const typeFields = [
        { name: 'node.type', value: node.type },
        { name: 'node.nodeType', value: node.nodeType },
        { name: 'node.data.type', value: node.data?.type },
        { name: 'node.data.nodeType', value: node.data?.nodeType },
        { name: 'node.store.data.data.type', value: node.store?.data?.data?.type },
        { name: 'node.store.data.data.nodeType', value: node.store?.data?.data?.nodeType }
      ]

      // 如果节点有getData方法，也检查其返回值
      if (typeof node.getData === 'function') {
        try {
          const nodeData = node.getData()
          if (nodeData) {
            typeFields.push(
              { name: 'getData().type', value: nodeData.type },
              { name: 'getData().nodeType', value: nodeData.nodeType }
            )
          }
        } catch (error) {
          result.warnings.push(`无法通过getData()获取节点数据: ${error.message}`)
        }
      }

      // 检查每个字段的一致性
      for (const field of typeFields) {
        if (field.value !== undefined && field.value !== null) {
          result.checkedFields.push(field.name)
          
          if (typeof field.value === 'string' && field.value.trim() !== '') {
            const normalizedValue = field.value.trim()
            if (normalizedValue !== primaryType) {
              result.inconsistencies.push({
                field: field.name,
                expected: primaryType,
                actual: normalizedValue
              })
              result.warnings.push(`节点类型不一致: ${field.name} = "${normalizedValue}", 期望 = "${primaryType}"`)
              result.isValid = false
            }
          }
        }
      }

      // 如果发现不一致，提供修复建议
      if (result.inconsistencies.length > 0) {
        result.warnings.push(`发现 ${result.inconsistencies.length} 个类型不一致问题，建议统一为: "${primaryType}"`)
      }

    } catch (error) {
      result.warnings.push(`类型一致性检查异常: ${error.message}`)
      result.isValid = false
    }

    return result
  }

  /**
   * 验证节点类型与数据的匹配性 - 增强版
   * @param {Object} node - 节点对象
   * @param {string} nodeType - 节点类型
   * @param {Object} nodeConfig - 节点配置
   * @returns {Object} 数据匹配验证结果
   */
  validateNodeDataMatch(node, nodeType, nodeConfig) {
    const result = {
      isValid: true,
      warnings: [],
      mismatches: [],
      validations: []
    }

    try {
      // 获取节点数据
      let nodeData = null
      try {
        nodeData = node.getData ? node.getData() : (node.data || {})
      } catch (error) {
        result.warnings.push(`无法获取节点数据: ${error.message}`)
        return result
      }

      if (!nodeData || typeof nodeData !== 'object') {
        result.warnings.push('节点数据为空或格式无效')
        return result
      }

      // 1. 验证必需的配置字段
      const requiredFields = this.getRequiredFieldsByNodeType(nodeType)
      for (const field of requiredFields) {
        const hasField = this.hasNestedProperty(nodeData, field)
        result.validations.push({
          field,
          required: true,
          present: hasField,
          valid: hasField
        })
        
        if (!hasField) {
          result.mismatches.push({
            type: 'missing_required_field',
            field,
            nodeType
          })
          result.warnings.push(`缺少必需字段: ${field}`)
          result.isValid = false
        }
      }

      // 2. 验证分支节点的特殊要求
      if (this.isBranchNodeType(nodeType)) {
        const branchValidation = this.validateBranchNodeData(nodeData, nodeType)
        result.validations.push(...branchValidation.validations)
        if (!branchValidation.isValid) {
          result.warnings.push(...branchValidation.warnings)
          result.mismatches.push(...branchValidation.mismatches)
          result.isValid = false
        }
      }

      // 3. 验证端口配置匹配
      if (nodeConfig.ports) {
        const portValidation = this.validatePortConfiguration(nodeData, nodeConfig.ports, nodeType)
        result.validations.push(...portValidation.validations)
        if (!portValidation.isValid) {
          result.warnings.push(...portValidation.warnings)
        }
      }

      // 4. 验证节点尺寸和样式配置
      const styleValidation = this.validateNodeStyleConfiguration(nodeData, nodeConfig, nodeType)
      result.validations.push(...styleValidation.validations)
      if (!styleValidation.isValid) {
        result.warnings.push(...styleValidation.warnings)
      }

    } catch (error) {
      result.warnings.push(`数据匹配验证异常: ${error.message}`)
      result.isValid = false
    }

    return result
  }

  /**
   * 验证节点类型使用的合理性
   * @param {Object} node - 节点对象
   * @param {string} nodeType - 节点类型
   * @param {Object} nodeConfig - 节点配置
   * @returns {Object} 使用验证结果
   */
  validateNodeTypeUsage(node, nodeType, nodeConfig) {
    const result = {
      isValid: true,
      warnings: [],
      suggestions: []
    }

    try {
      // 1. 检查节点类型在当前上下文中的合理性
      const contextValidation = this.validateNodeTypeInContext(node, nodeType)
      if (!contextValidation.isValid) {
        result.warnings.push(...contextValidation.warnings)
        result.suggestions.push(...contextValidation.suggestions)
      }

      // 2. 检查节点类型的业务逻辑合理性
      const businessValidation = this.validateBusinessLogic(node, nodeType)
      if (!businessValidation.isValid) {
        result.warnings.push(...businessValidation.warnings)
        result.suggestions.push(...businessValidation.suggestions)
      }

    } catch (error) {
      result.warnings.push(`节点类型使用验证异常: ${error.message}`)
    }

    return result
  }

  /**
   * 根据节点类型获取必需字段
   * @param {string} nodeType - 节点类型
   * @returns {Array} 必需字段数组
   */
  getRequiredFieldsByNodeType(nodeType) {
    const requiredFieldsMap = {
      'start': ['label'],
      'end': ['label'],
      'audience-split': ['config.conditions'],
      'event-split': ['config.events'],
      'ab-test': ['config.variants'],
      'sms': ['config.template'],
      'email': ['config.template'],
      'wechat': ['config.template'],
      'ai-call': ['config.script'],
      'manual-call': ['config.script'],
      'wait': ['config.duration'],
      'benefit': ['config.reward'],
      'task': ['config.action']
    }

    return requiredFieldsMap[nodeType] || ['label']
  }

  /**
   * 检查对象是否具有嵌套属性
   * @param {Object} obj - 对象
   * @param {string} path - 属性路径（如 'config.conditions'）
   * @returns {boolean} 是否存在
   */
  hasNestedProperty(obj, path) {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined
    }, obj) !== undefined
  }

  /**
   * 验证分支节点数据
   * @param {Object} nodeData - 节点数据
   * @param {string} nodeType - 节点类型
   * @returns {Object} 验证结果
   */
  validateBranchNodeData(nodeData, nodeType) {
    const result = {
      isValid: true,
      warnings: [],
      mismatches: [],
      validations: []
    }

    try {
      const config = nodeData.config || {}
      
      switch (nodeType) {
        case 'audience-split':
          if (!config.conditions || !Array.isArray(config.conditions) || config.conditions.length === 0) {
            result.isValid = false
            result.warnings.push('人群分流节点缺少有效的条件配置')
            result.mismatches.push({
              type: 'invalid_branch_config',
              field: 'config.conditions',
              nodeType
            })
          }
          break
          
        case 'event-split':
          if (!config.events || !Array.isArray(config.events) || config.events.length === 0) {
            result.isValid = false
            result.warnings.push('事件分流节点缺少有效的事件配置')
            result.mismatches.push({
              type: 'invalid_branch_config',
              field: 'config.events',
              nodeType
            })
          }
          break
          
        case 'ab-test':
          if (!config.variants || !Array.isArray(config.variants) || config.variants.length < 2) {
            result.isValid = false
            result.warnings.push('AB测试节点需要至少2个变体配置')
            result.mismatches.push({
              type: 'invalid_branch_config',
              field: 'config.variants',
              nodeType
            })
          }
          break
      }

      result.validations.push({
        field: 'branch_configuration',
        nodeType,
        valid: result.isValid
      })

    } catch (error) {
      result.isValid = false
      result.warnings.push(`分支节点数据验证异常: ${error.message}`)
    }

    return result
  }

  /**
   * 验证端口配置
   * @param {Object} nodeData - 节点数据
   * @param {Object} expectedPorts - 期望的端口配置
   * @param {string} nodeType - 节点类型
   * @returns {Object} 验证结果
   */
  validatePortConfiguration(nodeData, expectedPorts, nodeType) {
    const result = {
      isValid: true,
      warnings: [],
      validations: []
    }

    // 端口配置验证逻辑
    result.validations.push({
      field: 'port_configuration',
      nodeType,
      valid: true // 简化实现，实际可以更详细
    })

    return result
  }

  /**
   * 验证节点样式配置
   * @param {Object} nodeData - 节点数据
   * @param {Object} nodeConfig - 节点配置
   * @param {string} nodeType - 节点类型
   * @returns {Object} 验证结果
   */
  validateNodeStyleConfiguration(nodeData, nodeConfig, nodeType) {
    const result = {
      isValid: true,
      warnings: [],
      validations: []
    }

    // 样式配置验证逻辑
    result.validations.push({
      field: 'style_configuration',
      nodeType,
      valid: true // 简化实现
    })

    return result
  }

  /**
   * 验证节点类型在上下文中的合理性
   * @param {Object} node - 节点对象
   * @param {string} nodeType - 节点类型
   * @returns {Object} 验证结果
   */
  validateNodeTypeInContext(node, nodeType) {
    const result = {
      isValid: true,
      warnings: [],
      suggestions: []
    }

    // 上下文验证逻辑（可以根据实际需求扩展）
    return result
  }

  /**
   * 验证业务逻辑合理性
   * @param {Object} node - 节点对象
   * @param {string} nodeType - 节点类型
   * @returns {Object} 验证结果
   */
  validateBusinessLogic(node, nodeType) {
    const result = {
      isValid: true,
      warnings: [],
      suggestions: []
    }

    // 业务逻辑验证（可以根据实际需求扩展）
    return result
  }

  /**
   * 获取验证统计信息
   * @returns {Object} 统计信息
   */
  getValidationStats() {
    return {
      ...this.validationStats,
      successRate: this.validationStats.total > 0 ? 
        (this.validationStats.valid / this.validationStats.total * 100).toFixed(2) + '%' : '0%'
    }
  }

  /**
   * 重置验证统计
   */
  resetValidationStats() {
    this.validationStats = {
      total: 0,
      valid: 0,
      invalid: 0,
      typeErrors: 0,
      consistencyErrors: 0,
      dataMatchErrors: 0
    }
  }

  /**
   * 查找相似的节点类型
   * @param {string} invalidType - 无效的节点类型
   * @returns {string|null} 相似的节点类型
   */
  findSimilarNodeType(invalidType) {
    if (!invalidType || typeof invalidType !== 'string') {
      return null
    }

    const lowerInvalidType = invalidType.toLowerCase()
    
    // 常见的类型映射
    const typeMapping = {
      'message': 'sms',
      'msg': 'sms',
      'call': 'ai-call',
      'phone': 'ai-call',
      'split': 'audience-split',
      'branch': 'audience-split',
      'begin': 'start',
      'finish': 'end',
      'stop': 'end',
      'test': 'ab-test',
      'experiment': 'ab-test',
      'delay': 'wait',
      'pause': 'wait',
      'reward': 'benefit',
      'gift': 'benefit'
    }

    // 直接映射查找
    if (typeMapping[lowerInvalidType]) {
      return typeMapping[lowerInvalidType]
    }

    // 模糊匹配
    for (const supportedType of this.supportedNodeTypes) {
      if (supportedType.includes(lowerInvalidType) || lowerInvalidType.includes(supportedType)) {
        return supportedType
      }
    }

    return null
  }

  /**
   * 获取节点ID
   * @param {Object} node - 节点对象
   * @returns {string} 节点ID
   */
  getNodeId(node) {
    try {
      return node?.id || node?.getId?.() || node?.data?.id || 'unknown'
    } catch (error) {
      return 'unknown'
    }
  }

  /**
   * 获取支持的节点类型列表
   * @returns {Array} 支持的节点类型数组
   */
  getSupportedNodeTypes() {
    return [...this.supportedNodeTypes]
  }

  /**
   * 检查节点类型是否为分支节点
   * @param {string} nodeType - 节点类型
   * @returns {boolean} 是否为分支节点
   */
  isBranchNodeType(nodeType) {
    const branchNodeTypes = ['audience-split', 'event-split', 'ab-test', 'condition']
    return branchNodeTypes.includes(nodeType)
  }

  /**
   * 日志记录
   * @param {string} level - 日志级别
   * @param {string} message - 日志消息
   * @param {Object} data - 附加数据
   */
  log(level, message, data = {}) {
    if (this.debugMode) {
      const timestamp = new Date().toISOString()
      console.log(`[${timestamp}] [NodeTypeValidator] [${level.toUpperCase()}] ${message}`, data)
    }
  }
}

// 导出单例实例
export const nodeTypeValidator = new NodeTypeValidator()

// 导出验证函数
export const validateNodeType = (node) => nodeTypeValidator.validateNodeType(node)
export const validateMultipleNodeTypes = (nodes) => nodeTypeValidator.validateMultipleNodeTypes(nodes)