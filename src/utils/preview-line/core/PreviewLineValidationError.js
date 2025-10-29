/**
 * PreviewLineManager Builder 模式的验证错误类
 * 提供详细的错误信息和错误分类
 */

/**
 * 预览线管理器验证错误基类
 */
export class PreviewLineValidationError extends Error {
  constructor(message, code = 'VALIDATION_ERROR', details = null) {
    super(message)
    this.name = 'PreviewLineValidationError'
    this.code = code
    this.details = details
    this.timestamp = new Date().toISOString()
  }

  /**
   * 转换为JSON格式
   * @returns {Object} 错误信息对象
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      details: this.details,
      timestamp: this.timestamp,
      stack: this.stack
    }
  }
}

/**
 * 必需参数缺失错误
 */
export class RequiredParameterError extends PreviewLineValidationError {
  constructor(parameterName, expectedType = null) {
    const message = `必需参数 '${parameterName}' 缺失${expectedType ? `, 期望类型: ${expectedType}` : ''}`
    super(message, 'REQUIRED_PARAMETER_MISSING', {
      parameterName,
      expectedType
    })
    this.name = 'RequiredParameterError'
  }
}

/**
 * 参数类型错误
 */
export class ParameterTypeError extends PreviewLineValidationError {
  constructor(parameterName, expectedType, actualType, actualValue = null) {
    const message = `参数 '${parameterName}' 类型错误，期望: ${expectedType}，实际: ${actualType}`
    super(message, 'PARAMETER_TYPE_ERROR', {
      parameterName,
      expectedType,
      actualType,
      actualValue
    })
    this.name = 'ParameterTypeError'
  }
}

/**
 * 参数值范围错误
 */
export class ParameterRangeError extends PreviewLineValidationError {
  constructor(parameterName, value, min = null, max = null, allowedValues = null) {
    let message = `参数 '${parameterName}' 值 '${value}' 超出允许范围`
    
    if (allowedValues) {
      message += `，允许的值: [${allowedValues.join(', ')}]`
    } else if (min !== null || max !== null) {
      const range = []
      if (min !== null) range.push(`最小值: ${min}`)
      if (max !== null) range.push(`最大值: ${max}`)
      message += `，${range.join(', ')}`
    }

    super(message, 'PARAMETER_RANGE_ERROR', {
      parameterName,
      value,
      min,
      max,
      allowedValues
    })
    this.name = 'ParameterRangeError'
  }
}

/**
 * 配置冲突错误
 */
export class ConfigurationConflictError extends PreviewLineValidationError {
  constructor(conflictingParameters, reason) {
    const paramList = Array.isArray(conflictingParameters) 
      ? conflictingParameters.join(', ') 
      : conflictingParameters
    const message = `配置冲突: ${paramList}。原因: ${reason}`
    
    super(message, 'CONFIGURATION_CONFLICT', {
      conflictingParameters,
      reason
    })
    this.name = 'ConfigurationConflictError'
  }
}

/**
 * 依赖缺失错误
 */
export class DependencyMissingError extends PreviewLineValidationError {
  constructor(dependencyName, requiredBy, suggestion = null) {
    let message = `依赖 '${dependencyName}' 缺失，被 '${requiredBy}' 需要`
    if (suggestion) {
      message += `。建议: ${suggestion}`
    }

    super(message, 'DEPENDENCY_MISSING', {
      dependencyName,
      requiredBy,
      suggestion
    })
    this.name = 'DependencyMissingError'
  }
}

/**
 * 初始化错误
 */
export class InitializationError extends PreviewLineValidationError {
  constructor(component, reason, suggestions = []) {
    const message = `${component} 初始化失败: ${reason}`
    
    super(message, 'INITIALIZATION_ERROR', {
      component,
      reason,
      suggestions
    })
    this.name = 'InitializationError'
  }
}

/**
 * 验证器工具类
 * 提供常用的验证方法
 */
export class ValidationUtils {
  /**
   * 验证必需参数
   * @param {*} value - 参数值
   * @param {string} name - 参数名
   * @param {string} expectedType - 期望类型
   * @throws {RequiredParameterError} 当参数缺失时
   * @throws {ParameterTypeError} 当参数类型错误时
   */
  static validateRequired(value, name, expectedType = null) {
    if (value === null || value === undefined) {
      throw new RequiredParameterError(name, expectedType)
    }

    if (expectedType && !this.checkType(value, expectedType)) {
      throw new ParameterTypeError(name, expectedType, typeof value, value)
    }
  }

  /**
   * 验证参数类型
   * @param {*} value - 参数值
   * @param {string} name - 参数名
   * @param {string} expectedType - 期望类型
   * @param {boolean} allowNull - 是否允许null
   * @throws {ParameterTypeError} 当参数类型错误时
   */
  static validateType(value, name, expectedType, allowNull = false) {
    if (allowNull && (value === null || value === undefined)) {
      return
    }

    if (!this.checkType(value, expectedType)) {
      throw new ParameterTypeError(name, expectedType, typeof value, value)
    }
  }

  /**
   * 验证数值范围
   * @param {number} value - 数值
   * @param {string} name - 参数名
   * @param {number} min - 最小值
   * @param {number} max - 最大值
   * @throws {ParameterRangeError} 当数值超出范围时
   */
  static validateRange(value, name, min = null, max = null) {
    if (min !== null && value < min) {
      throw new ParameterRangeError(name, value, min, max)
    }
    if (max !== null && value > max) {
      throw new ParameterRangeError(name, value, min, max)
    }
  }

  /**
   * 验证枚举值
   * @param {*} value - 参数值
   * @param {string} name - 参数名
   * @param {Array} allowedValues - 允许的值列表
   * @throws {ParameterRangeError} 当值不在允许列表中时
   */
  static validateEnum(value, name, allowedValues) {
    if (!allowedValues.includes(value)) {
      throw new ParameterRangeError(name, value, null, null, allowedValues)
    }
  }

  /**
   * 验证函数类型
   * @param {*} value - 参数值
   * @param {string} name - 参数名
   * @param {boolean} allowNull - 是否允许null
   * @throws {ParameterTypeError} 当不是函数时
   */
  static validateFunction(value, name, allowNull = false) {
    if (allowNull && (value === null || value === undefined)) {
      return
    }
    
    if (typeof value !== 'function') {
      throw new ParameterTypeError(name, 'function', typeof value, value)
    }
  }

  /**
   * 验证对象实例
   * @param {*} value - 参数值
   * @param {string} name - 参数名
   * @param {Function} expectedClass - 期望的类构造函数
   * @param {boolean} allowNull - 是否允许null
   * @throws {ParameterTypeError} 当不是期望的实例时
   */
  static validateInstance(value, name, expectedClass, allowNull = false) {
    if (allowNull && (value === null || value === undefined)) {
      return
    }

    if (!(value instanceof expectedClass)) {
      const expectedName = expectedClass.name || 'Unknown'
      const actualName = value?.constructor?.name || typeof value
      throw new ParameterTypeError(name, expectedName, actualName, value)
    }
  }

  /**
   * 验证预览线连接 - 增强版，包含详细坐标信息和节点类型验证
   * @param {Object} previewLine - 预览线对象
   * @param {Object} sourceNode - 源节点
   * @param {Object} options - 验证选项
   * @returns {Object} 验证结果，包含详细坐标信息
   */
  static async validatePreviewLineConnection(previewLine, sourceNode, options = {}) {
    const result = {
      isValid: true,
      errors: [],
      warnings: [],
      nodeTypeValidation: null,
      coordinates: {
        sourceNode: {},
        previewLine: {},
        deviations: {},
        thresholds: options.thresholds || { position: 5, distance: 10 }
      }
    }

    try {
      // 1. 基础参数验证
      if (!previewLine) {
        result.errors.push('预览线对象不存在')
        result.isValid = false
        return result
      }

      if (!sourceNode) {
        result.errors.push('源节点对象不存在')
        result.isValid = false
        return result
      }

      // 2. 节点类型验证 - 新增
      try {
        const { nodeTypeValidator } = await import('../validators/NodeTypeValidator.js')
        const nodeTypeValidation = nodeTypeValidator.validateNodeType(sourceNode)
        result.nodeTypeValidation = nodeTypeValidation

        if (!nodeTypeValidation.isValid) {
          result.errors.push(...nodeTypeValidation.errors.map(err => `节点类型验证失败: ${err}`))
          result.isValid = false
        }

        if (nodeTypeValidation.warnings.length > 0) {
          result.warnings.push(...nodeTypeValidation.warnings.map(warn => `节点类型警告: ${warn}`))
        }

        // 检查危险节点类型
        const dangerousTypes = ['email'] // 用户指出不应该有邮件节点
        if (nodeTypeValidation.nodeType && dangerousTypes.includes(nodeTypeValidation.nodeType)) {
          result.errors.push(`危险的节点类型: "${nodeTypeValidation.nodeType}" 不被允许`)
          result.isValid = false
        }

        // 验证任务节点的存在性
        if (nodeTypeValidation.nodeType === 'task') {
          // 任务节点需要特殊验证
          const nodeData = sourceNode.getData ? sourceNode.getData() : sourceNode.data || {}
          if (!nodeData.config || !nodeData.config.taskType) {
            result.warnings.push('任务节点缺少任务类型配置')
          }
        }

      } catch (nodeTypeError) {
        result.warnings.push(`节点类型验证异常: ${nodeTypeError.message}`)
      }

      // 2. 获取源节点位置和尺寸信息
      let nodePosition, nodeSize
      try {
        nodePosition = sourceNode.getPosition ? sourceNode.getPosition() : sourceNode.position
        nodeSize = sourceNode.getSize ? sourceNode.getSize() : sourceNode.size
        
        if (!nodePosition || typeof nodePosition.x !== 'number' || typeof nodePosition.y !== 'number') {
          result.errors.push('无法获取源节点位置信息')
          result.isValid = false
          return result
        }

        if (!nodeSize || typeof nodeSize.width !== 'number' || typeof nodeSize.height !== 'number') {
          result.errors.push('无法获取源节点尺寸信息')
          result.isValid = false
          return result
        }
      } catch (error) {
        result.errors.push(`获取节点信息失败: ${error.message}`)
        result.isValid = false
        return result
      }

      // 3. 计算节点端口坐标
      const nodeOutPort = {
        x: nodePosition.x + nodeSize.width / 2,  // 底部中心 X
        y: nodePosition.y + nodeSize.height      // 底部中心 Y
      }

      result.coordinates.sourceNode = {
        id: sourceNode.id || sourceNode.getId?.() || 'unknown',
        position: { ...nodePosition },
        size: { ...nodeSize },
        outPort: { ...nodeOutPort }
      }

      // 4. 获取预览线起始坐标
      let previewLineStart
      try {
        if (previewLine.getSource) {
          const source = previewLine.getSource()
          previewLineStart = source.point || source.position
        } else if (previewLine.source) {
          previewLineStart = previewLine.source.point || previewLine.source.position
        } else if (previewLine.line) {
          const sourcePoint = previewLine.line.getSourcePoint ? previewLine.line.getSourcePoint() : null
          previewLineStart = sourcePoint
        }

        if (!previewLineStart || typeof previewLineStart.x !== 'number' || typeof previewLineStart.y !== 'number') {
          result.errors.push('无法获取预览线起始坐标')
          result.isValid = false
        }
      } catch (error) {
        result.errors.push(`获取预览线坐标失败: ${error.message}`)
        result.isValid = false
      }

      if (previewLineStart) {
        result.coordinates.previewLine = {
          id: previewLine.id || 'unknown',
          startPoint: { ...previewLineStart }
        }

        // 5. 计算坐标偏差
        const deviation = {
          x: Math.abs(previewLineStart.x - nodeOutPort.x),
          y: Math.abs(previewLineStart.y - nodeOutPort.y),
          distance: Math.sqrt(
            Math.pow(previewLineStart.x - nodeOutPort.x, 2) +
            Math.pow(previewLineStart.y - nodeOutPort.y, 2)
          )
        }

        result.coordinates.deviations = deviation

        // 6. 坐标阈值检查
        const thresholds = result.coordinates.thresholds
        if (deviation.x > thresholds.position) {
          result.errors.push(`X坐标偏差过大: ${deviation.x.toFixed(2)} > ${thresholds.position}`)
          result.isValid = false
        }

        if (deviation.y > thresholds.position) {
          result.errors.push(`Y坐标偏差过大: ${deviation.y.toFixed(2)} > ${thresholds.position}`)
          result.isValid = false
        }

        if (deviation.distance > thresholds.distance) {
          result.errors.push(`总距离偏差过大: ${deviation.distance.toFixed(2)} > ${thresholds.distance}`)
          result.isValid = false
        }
      }

      // 7. 输出详细的坐标验证日志
      console.log('🔍 [ValidationUtils] 预览线连接坐标验证:', {
        sourceNodeId: result.coordinates.sourceNode.id,
        nodePosition: result.coordinates.sourceNode.position,
        nodeSize: result.coordinates.sourceNode.size,
        calculatedOutPort: result.coordinates.sourceNode.outPort,
        previewLineId: result.coordinates.previewLine?.id,
        actualStartPoint: result.coordinates.previewLine?.startPoint,
        deviations: result.coordinates.deviations,
        thresholds: result.coordinates.thresholds,
        validationResult: result.isValid ? '✅ 通过' : '❌ 失败',
        errors: result.errors
      })

    } catch (error) {
      result.errors.push(`验证过程异常: ${error.message}`)
      result.isValid = false
      console.error('🔍 [ValidationUtils] 预览线连接验证异常:', error)
    }

    return result
  }

  /**
   * 增强的预览线连接验证 - 包含坐标转换验证
   * @param {Object} previewLine - 预览线对象
   * @param {Object} sourceNode - 源节点对象
   * @param {Object} options - 验证选项
   * @returns {Object} 验证结果
   */
  static validatePreviewLineConnection(previewLine, sourceNode, options = {}) {
    const result = {
      isValid: true,
      errors: [],
      warnings: [],
      coordinates: {},
      nodeTypeValidation: null,
      coordinateTransformValidation: null
    }

    // 设置默认阈值
    const thresholds = {
      position: options.thresholds?.position || 5,
      distance: options.thresholds?.distance || 10,
      coordinateTransform: options.thresholds?.coordinateTransform || 3
    }

    try {
      // 1. 基础参数验证
      if (!previewLine) {
        result.errors.push('预览线对象不能为空')
        result.isValid = false
        return result
      }

      if (!sourceNode) {
        result.errors.push('源节点对象不能为空')
        result.isValid = false
        return result
      }

      // 2. 节点类型验证
      try {
        const nodeTypeValidator = new NodeTypeValidator()
        result.nodeTypeValidation = nodeTypeValidator.validateNodeType(sourceNode)
        
        if (!result.nodeTypeValidation.isValid) {
          result.errors.push(...result.nodeTypeValidation.errors)
          result.warnings.push(...result.nodeTypeValidation.warnings)
          result.isValid = false
        }
      } catch (error) {
        result.warnings.push(`节点类型验证异常: ${error.message}`)
      }

      // 3. 获取节点位置和尺寸信息
      let nodePosition, nodeSize
      try {
        nodePosition = sourceNode.getPosition ? sourceNode.getPosition() : sourceNode.position
        nodeSize = sourceNode.getSize ? sourceNode.getSize() : sourceNode.size

        if (!nodePosition || typeof nodePosition.x !== 'number' || typeof nodePosition.y !== 'number') {
          result.errors.push('无法获取源节点位置信息')
          result.isValid = false
          return result
        }

        if (!nodeSize || typeof nodeSize.width !== 'number' || typeof nodeSize.height !== 'number') {
          result.errors.push('无法获取源节点尺寸信息')
          result.isValid = false
          return result
        }
      } catch (error) {
        result.errors.push(`获取节点信息失败: ${error.message}`)
        result.isValid = false
        return result
      }

      // 4. 计算节点端口坐标（统一使用底部中心作为out端口）
      const nodeOutPort = {
        x: nodePosition.x + nodeSize.width / 2,  // 底部中心 X
        y: nodePosition.y + nodeSize.height      // 底部中心 Y
      }

      result.coordinates.sourceNode = {
        id: sourceNode.id || sourceNode.getId?.() || 'unknown',
        position: { ...nodePosition },
        size: { ...nodeSize },
        outPort: { ...nodeOutPort }
      }

      // 5. 坐标转换验证
      result.coordinateTransformValidation = this.validateCoordinateTransform(
        sourceNode, 
        nodeOutPort, 
        thresholds.coordinateTransform
      )

      if (!result.coordinateTransformValidation.isValid) {
        result.warnings.push(...result.coordinateTransformValidation.warnings)
        // 坐标转换问题通常不是致命错误，只记录警告
      }

      // 6. 获取预览线起始坐标
      let previewLineStart
      try {
        if (previewLine.getSource) {
          const source = previewLine.getSource()
          previewLineStart = source.point || source.position
        } else if (previewLine.source) {
          previewLineStart = previewLine.source.point || previewLine.source.position
        } else if (previewLine.line) {
          const sourcePoint = previewLine.line.getSourcePoint ? previewLine.line.getSourcePoint() : null
          previewLineStart = sourcePoint
        }

        if (!previewLineStart || typeof previewLineStart.x !== 'number' || typeof previewLineStart.y !== 'number') {
          result.errors.push('无法获取预览线起始坐标')
          result.isValid = false
        }
      } catch (error) {
        result.errors.push(`获取预览线坐标失败: ${error.message}`)
        result.isValid = false
        return result
      }

      if (previewLineStart) {
        result.coordinates.previewLine = {
          id: previewLine.id || previewLine.getId?.() || 'unknown',
          startPoint: { ...previewLineStart }
        }

        // 7. 计算坐标偏差
        const deltaX = Math.abs(previewLineStart.x - nodeOutPort.x)
        const deltaY = Math.abs(previewLineStart.y - nodeOutPort.y)
        const totalDeviation = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

        result.coordinates.deviation = {
          deltaX,
          deltaY,
          total: totalDeviation,
          threshold: thresholds.position
        }

        // 8. 验证坐标匹配度
        if (totalDeviation > thresholds.position) {
          result.warnings.push(`预览线起始坐标与节点out端口偏差过大: ${totalDeviation.toFixed(2)}px (阈值: ${thresholds.position}px)`)
          result.coordinates.needsCorrection = true
        } else {
          result.coordinates.needsCorrection = false
        }

        // 9. 距离验证
        if (totalDeviation > thresholds.distance) {
          result.errors.push(`预览线起始坐标距离节点out端口过远: ${totalDeviation.toFixed(2)}px (最大允许: ${thresholds.distance}px)`)
          result.isValid = false
        }
      }

      // 10. 生成修复建议
      if (result.coordinates.needsCorrection) {
        result.coordinates.correctionSuggestion = {
          recommendedStartPoint: { ...nodeOutPort },
          correctionMethod: 'setSource',
          correctionParams: {
            cell: sourceNode.id || sourceNode.getId?.(),
            port: 'out'
          }
        }
      }

    } catch (error) {
      result.errors.push(`验证过程异常: ${error.message}`)
      result.isValid = false
    }

    return result
  }

  /**
   * 验证坐标转换的准确性
   * @param {Object} node - 节点对象
   * @param {Object} expectedCoords - 期望的坐标
   * @param {number} threshold - 容差阈值
   * @returns {Object} 坐标转换验证结果
   */
  static validateCoordinateTransform(node, expectedCoords, threshold = 3) {
    const result = {
      isValid: true,
      warnings: [],
      transformations: {},
      deviations: {}
    }

    try {
      // 1. 使用DataTransformUtils进行坐标标准化
      const normalizedCoords = DataTransformUtils.coordinates.normalize(expectedCoords)
      result.transformations.normalized = normalizedCoords

      // 2. 使用CoordinateSystemManager进行坐标转换验证
      if (coordinateManager && coordinateManager.graph) {
        const transformValidation = coordinateManager.validateCoordinateTransform(node)
        if (transformValidation) {
          result.transformations.coordinateManager = transformValidation
          
          // 检查坐标转换偏差
          if (transformValidation.difference) {
            const transformDeviation = Math.sqrt(
              Math.pow(transformValidation.difference.x, 2) + 
              Math.pow(transformValidation.difference.y, 2)
            )
            
            result.deviations.coordinateTransform = {
              x: transformValidation.difference.x,
              y: transformValidation.difference.y,
              total: transformDeviation,
              threshold
            }

            if (transformDeviation > threshold) {
              result.warnings.push(`坐标转换偏差过大: ${transformDeviation.toFixed(2)}px (阈值: ${threshold}px)`)
              result.isValid = false
            }
          }
        }
      }

      // 3. 验证坐标有效性
      if (!DataTransformUtils.validate.coordinates(normalizedCoords)) {
        result.warnings.push('坐标数据无效或包含NaN值')
        result.isValid = false
      }

      // 4. 检查坐标范围合理性
      const MAX_COORDINATE = 50000 // 最大合理坐标值
      if (Math.abs(normalizedCoords.x) > MAX_COORDINATE || Math.abs(normalizedCoords.y) > MAX_COORDINATE) {
        result.warnings.push(`坐标值超出合理范围: (${normalizedCoords.x}, ${normalizedCoords.y})`)
        result.isValid = false
      }

    } catch (error) {
      result.warnings.push(`坐标转换验证异常: ${error.message}`)
      result.isValid = false
    }

    return result
  }

  /**
   * 批量验证参数
   * @param {Object} params - 参数对象
   * @param {Object} schema - 验证模式
   * @throws {PreviewLineValidationError} 当验证失败时
   */
  static validateSchema(params, schema) {
    const errors = []

    for (const [key, rules] of Object.entries(schema)) {
      try {
        const value = params[key]

        // 必需参数检查
        if (rules.required && (value === null || value === undefined)) {
          throw new RequiredParameterError(key, rules.type)
        }

        // 跳过可选的空值
        if (!rules.required && (value === null || value === undefined)) {
          continue
        }

        // 类型检查
        if (rules.type && !this.checkType(value, rules.type)) {
          throw new ParameterTypeError(key, rules.type, typeof value, value)
        }

        // 范围检查
        if (rules.min !== undefined || rules.max !== undefined) {
          this.validateRange(value, key, rules.min, rules.max)
        }

        // 枚举检查
        if (rules.enum) {
          this.validateEnum(value, key, rules.enum)
        }

        // 自定义验证器
        if (rules.validator && typeof rules.validator === 'function') {
          const result = rules.validator(value, key, params)
          if (result !== true) {
            throw new PreviewLineValidationError(
              result || `自定义验证失败: ${key}`,
              'CUSTOM_VALIDATION_ERROR',
              { key, value }
            )
          }
        }

      } catch (error) {
        errors.push(error)
      }
    }

    if (errors.length > 0) {
      const message = `参数验证失败 (${errors.length} 个错误):\n${errors.map(e => `- ${e.message}`).join('\n')}`
      throw new PreviewLineValidationError(message, 'SCHEMA_VALIDATION_ERROR', { errors })
    }
  }
}

/**
 * 预定义的验证模式
 */
export const ValidationSchemas = {
  // Graph 实例验证
  graph: {
    required: true,
    type: 'object',
    validator: (value) => {
      if (!value.getNodes || typeof value.getNodes !== 'function') {
        return 'Graph 实例必须包含 getNodes 方法'
      }
      if (!value.addEdge || typeof value.addEdge !== 'function') {
        return 'Graph 实例必须包含 addEdge 方法'
      }
      return true
    }
  },

  // 性能配置验证
  performanceOptions: {
    required: false,
    type: 'object',
    validator: (value) => {
      if (value.maxCacheSize !== undefined) {
        if (typeof value.maxCacheSize !== 'number' || value.maxCacheSize <= 0) {
          return 'maxCacheSize 必须是正数'
        }
      }
      return true
    }
  },

  // 调试配置验证
  debugOptions: {
    required: false,
    type: 'object',
    validator: (value) => {
      const validLogLevels = ['error', 'warn', 'info', 'debug']
      if (value.logLevel && !validLogLevels.includes(value.logLevel)) {
        return `logLevel 必须是以下值之一: ${validLogLevels.join(', ')}`
      }
      return true
    }
  }
}