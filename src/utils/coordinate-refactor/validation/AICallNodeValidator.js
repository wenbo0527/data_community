/**
 * AI外呼节点配置验证器
 * 解决AI外呼节点被错误标记为已配置的问题
 */

export class AICallNodeValidator {
  constructor(config = {}) {
    this.config = {
      // 验证配置
      enableStrictValidation: true,
      enableBusinessConfigCheck: true,
      enablePreviewLineValidation: true,
      
      // 必需的业务配置字段
      requiredBusinessFields: [
        'callScript',      // 外呼话术
        'callStrategy',    // 外呼策略
        'targetAudience',  // 目标客群
        'callTiming',      // 外呼时机
        'successCriteria'  // 成功标准
      ],
      
      // 可选的业务配置字段
      optionalBusinessFields: [
        'callbackSettings', // 回调设置
        'retryPolicy',      // 重试策略
        'escalationRules',  // 升级规则
        'reportingConfig'   // 报告配置
      ],
      
      // 基础配置字段（不足以标记为已配置）
      basicConfigFields: [
        'id',
        'type',
        'name',
        'position',
        'style',
        'isConfigured'
      ],
      
      // 调试配置
      enableDebug: true,
      enableDetailedLogging: true,
      
      ...config
    };

    /** @type {Map<string, any>} */
    this.validationCache = new Map();
    /** @type {Array<any>} */
    this.validationHistory = [];
    
    console.log('🔍 [AI外呼验证器] 初始化完成');
  }

  /**
   * 验证AI外呼节点配置
   * @param {Object} node - 节点对象
   * @returns {Object} 验证结果
   */
  validateAICallNode(node) {
    if (!node) {
      return this.createValidationResult(false, 'Node is null or undefined', node);
    }

    console.log(`🔍 [AI外呼验证] 开始验证节点: ${node.id || 'unknown'}`);

    try {
      // 检查节点类型
      if (!this.isAICallNode(node)) {
        return this.createValidationResult(true, 'Not an AI call node', node);
      }

      // 检查缓存
      const cacheKey = this.generateCacheKey(node);
      const cachedResult = this.validationCache.get(cacheKey);
      if (cachedResult && this.isCacheValid(cachedResult)) {
        console.log(`✅ [缓存命中] 使用缓存验证结果: ${node.id}`);
        return cachedResult.result;
      }

      // 执行详细验证
      const validationResult = this.performDetailedValidation(node);
      
      // 缓存结果
      this.cacheValidationResult(cacheKey, validationResult);
      
      // 记录验证历史
      this.recordValidationHistory(node, validationResult);
      
      return validationResult;
    } catch (error) {
      console.error(`❌ [AI外呼验证] 验证失败: ${node.id}:`, error);
      return this.createValidationResult(false, `Validation error: ${error.message}`, node);
    }
  }

  /**
   * 检查是否为AI外呼节点
   * @param {Object} node - 节点对象
   * @returns {boolean}
   */
  isAICallNode(node) {
    if (!node || !node.type) return false;
    
    const aiCallTypes = [
      'ai-call',
      'ai_call',
      'aiCall',
      'AI外呼',
      'ai-outbound',
      'ai_outbound'
    ];
    
    return aiCallTypes.includes(node.type) || 
           (node.name && node.name.includes('AI外呼'));
  }

  /**
   * 执行详细验证
   * @param {Object} node - 节点对象
   * @returns {Object} 验证结果
   */
  performDetailedValidation(node) {
    console.log(`🔍 [详细验证] 开始验证节点: ${node.id}`);

    const validationSteps = [
      () => this.validateBasicStructure(node),
      () => this.validateBusinessConfiguration(node),
      () => this.validateConfigurationCompleteness(node),
      () => this.validatePreviewLineEligibility(node)
    ];

    const results = [];
    let overallValid = true;
    let criticalIssues = [];

    for (const step of validationSteps) {
      try {
        const stepResult = step();
        results.push(stepResult);
        
        if (!stepResult.valid && stepResult.critical) {
          overallValid = false;
          criticalIssues.push(stepResult.message);
        }
      } catch (error) {
        const errorResult = {
          valid: false,
          critical: true,
          message: `Validation step failed: ${error.message}`,
          step: step.name
        };
        results.push(errorResult);
        overallValid = false;
        criticalIssues.push(errorResult.message);
      }
    }

    const finalResult = this.createValidationResult(
      overallValid,
      overallValid ? 'AI call node is properly configured' : criticalIssues.join('; '),
      node,
      {
        stepResults: results,
        criticalIssues,
        shouldGeneratePreviewLine: overallValid,
        configurationScore: this.calculateConfigurationScore(results)
      }
    );

    console.log(`${overallValid ? '✅' : '❌'} [详细验证] 节点 ${node.id} 验证${overallValid ? '通过' : '失败'}`);
    
    return finalResult;
  }

  /**
   * 验证基础结构
   * @param {Object} node - 节点对象
   * @returns {Object} 验证结果
   */
  validateBasicStructure(node) {
    console.log(`🔍 [基础结构] 验证节点基础结构: ${node.id}`);

    const issues = [];

    // 检查必需的基础字段
    if (!node.id) issues.push('Missing node ID');
    if (!node.type) issues.push('Missing node type');
    if (!node.name) issues.push('Missing node name');

    // 检查位置信息
    if (!node.position || typeof node.position.x !== 'number' || typeof node.position.y !== 'number') {
      issues.push('Invalid position information');
    }

    const valid = issues.length === 0;
    
    return {
      valid,
      critical: !valid,
      message: valid ? 'Basic structure is valid' : `Basic structure issues: ${issues.join(', ')}`,
      step: 'basicStructure',
      details: { issues }
    };
  }

  /**
   * 验证业务配置
   * @param {Object} node - 节点对象
   * @returns {Object} 验证结果
   */
  validateBusinessConfiguration(node) {
    console.log(`🔍 [业务配置] 验证节点业务配置: ${node.id}`);

    if (!this.config.enableBusinessConfigCheck) {
      return {
        valid: true,
        critical: false,
        message: 'Business configuration check disabled',
        step: 'businessConfiguration'
      };
    }

    const businessConfig = node.businessConfig || node.config || {};
    const missingRequired = [];
    const presentOptional = [];

    // 检查必需的业务配置字段
    for (const field of this.config.requiredBusinessFields) {
      if (!businessConfig[field] || 
          (typeof businessConfig[field] === 'string' && businessConfig[field].trim() === '') ||
          (Array.isArray(businessConfig[field]) && businessConfig[field].length === 0)) {
        missingRequired.push(field);
      }
    }

    // 检查可选的业务配置字段
    for (const field of this.config.optionalBusinessFields) {
      if (businessConfig[field] && 
          businessConfig[field] !== '' && 
          (!Array.isArray(businessConfig[field]) || businessConfig[field].length > 0)) {
        presentOptional.push(field);
      }
    }

    const hasMinimumConfig = missingRequired.length <= Math.floor(this.config.requiredBusinessFields.length / 2);
    const valid = missingRequired.length === 0;

    let message;
    if (valid) {
      message = 'All required business configuration is present';
    } else if (hasMinimumConfig) {
      message = `Partial business configuration (missing: ${missingRequired.join(', ')})`;
    } else {
      message = `Insufficient business configuration (missing: ${missingRequired.join(', ')})`;
    }

    return {
      valid,
      critical: !hasMinimumConfig,
      message,
      step: 'businessConfiguration',
      details: {
        missingRequired,
        presentOptional,
        configurationCompleteness: ((this.config.requiredBusinessFields.length - missingRequired.length) / this.config.requiredBusinessFields.length) * 100
      }
    };
  }

  /**
   * 验证配置完整性
   * @param {Object} node - 节点对象
   * @returns {Object} 验证结果
   */
  validateConfigurationCompleteness(node) {
    console.log(`🔍 [配置完整性] 验证节点配置完整性: ${node.id}`);

    // 检查节点是否只有基础配置
    const nodeKeys = Object.keys(node);
    const hasOnlyBasicConfig = nodeKeys.every(key => 
      this.config.basicConfigFields.includes(key) || 
      ['children', 'parent', 'edges'].includes(key)
    );

    if (hasOnlyBasicConfig) {
      return {
        valid: false,
        critical: true,
        message: 'Node has only basic configuration, missing business logic',
        step: 'configurationCompleteness',
        details: {
          hasOnlyBasicConfig: true,
          availableKeys: nodeKeys,
          missingBusinessConfig: true
        }
      };
    }

    // 检查isConfigured标志的准确性
    const actuallyConfigured = this.isActuallyConfigured(node);
    const markedAsConfigured = node.isConfigured === true;

    if (markedAsConfigured && !actuallyConfigured) {
      return {
        valid: false,
        critical: true,
        message: 'Node is marked as configured but lacks proper business configuration',
        step: 'configurationCompleteness',
        details: {
          markedAsConfigured,
          actuallyConfigured,
          configurationMismatch: true
        }
      };
    }

    return {
      valid: true,
      critical: false,
      message: 'Configuration completeness is valid',
      step: 'configurationCompleteness',
      details: {
        markedAsConfigured,
        actuallyConfigured,
        configurationMismatch: false
      }
    };
  }

  /**
   * 验证预览线生成资格
   * @param {Object} node - 节点对象
   * @returns {Object} 验证结果
   */
  validatePreviewLineEligibility(node) {
    console.log(`🔍 [预览线资格] 验证节点预览线生成资格: ${node.id}`);

    if (!this.config.enablePreviewLineValidation) {
      return {
        valid: true,
        critical: false,
        message: 'Preview line validation disabled',
        step: 'previewLineEligibility'
      };
    }

    const actuallyConfigured = this.isActuallyConfigured(node);
    const hasBusinessLogic = this.hasBusinessLogic(node);
    const hasValidConnections = this.hasValidConnections(node);

    const eligible = actuallyConfigured && hasBusinessLogic && hasValidConnections;

    return {
      valid: eligible,
      critical: false, // 预览线不是关键功能
      message: eligible ? 
        'Node is eligible for preview line generation' : 
        'Node is not eligible for preview line generation',
      step: 'previewLineEligibility',
      details: {
        actuallyConfigured,
        hasBusinessLogic,
        hasValidConnections,
        eligible
      }
    };
  }

  /**
   * 检查节点是否真正配置完成
   * @param {Object} node - 节点对象
   * @returns {boolean}
   */
  isActuallyConfigured(node) {
    const businessConfig = node.businessConfig || node.config || {};
    
    // 检查是否有至少一半的必需业务配置
    const configuredFields = this.config.requiredBusinessFields.filter(field => {
      const value = businessConfig[field];
      return value && 
             value !== '' && 
             (!Array.isArray(value) || value.length > 0) &&
             (typeof value !== 'object' || Object.keys(value).length > 0);
    });

    return configuredFields.length >= Math.ceil(this.config.requiredBusinessFields.length / 2);
  }

  /**
   * 检查节点是否有业务逻辑
   * @param {Object} node - 节点对象
   * @returns {boolean}
   */
  hasBusinessLogic(node) {
    const businessConfig = node.businessConfig || node.config || {};
    
    // 检查关键业务逻辑字段
    const keyBusinessFields = ['callScript', 'callStrategy', 'targetAudience'];
    return keyBusinessFields.some(field => {
      const value = businessConfig[field];
      return value && value !== '' && typeof value === 'string' && value.trim().length > 10;
    });
  }

  /**
   * 检查节点是否有有效连接
   * @param {Object} node - 节点对象
   * @returns {boolean}
   */
  hasValidConnections(node) {
    // 检查是否有子节点或边连接
    const hasChildren = node.children && Array.isArray(node.children) && node.children.length > 0;
    const hasEdges = node.edges && Array.isArray(node.edges) && node.edges.length > 0;
    const hasParent = node.parent && node.parent !== null;

    return hasChildren || hasEdges || hasParent;
  }

  /**
   * 计算配置分数
   * @param {Array} stepResults - 验证步骤结果
   * @returns {number} 配置分数 (0-100)
   */
  calculateConfigurationScore(stepResults) {
    if (!stepResults || stepResults.length === 0) return 0;

    let totalScore = 0;
    let maxScore = 0;

    for (const result of stepResults) {
      const stepWeight = this.getStepWeight(result.step);
      maxScore += stepWeight;
      
      if (result.valid) {
        totalScore += stepWeight;
      } else if (result.details && result.details.configurationCompleteness) {
        // 部分分数基于配置完整性
        totalScore += (stepWeight * result.details.configurationCompleteness / 100);
      }
    }

    return maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
  }

  /**
   * 获取验证步骤权重
   * @param {string} stepName - 步骤名称
   * @returns {number} 权重
   */
  getStepWeight(stepName) {
    const weights = {
      basicStructure: 20,
      businessConfiguration: 40,
      configurationCompleteness: 30,
      previewLineEligibility: 10
    };
    
    return weights[stepName] || 10;
  }

  /**
   * 创建验证结果对象
   * @param {boolean} valid - 是否有效
   * @param {string} message - 消息
   * @param {Object} node - 节点对象
   * @param {Object} details - 详细信息
   * @returns {Object} 验证结果
   */
  createValidationResult(valid, message, node, details = {}) {
    return {
      valid,
      message,
      nodeId: node ? node.id : null,
      nodeType: node ? node.type : null,
      timestamp: Date.now(),
      ...details
    };
  }

  /**
   * 生成缓存键
   * @param {Object} node - 节点对象
   * @returns {string} 缓存键
   */
  generateCacheKey(node) {
    const configHash = this.hashObject(node.businessConfig || node.config || {});
    return `${node.id}_${node.type}_${configHash}`;
  }

  /**
   * 对象哈希
   * @param {Object} obj - 对象
   * @returns {string} 哈希值
   */
  hashObject(obj) {
    const str = JSON.stringify(obj, Object.keys(obj).sort());
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(36);
  }

  /**
   * 检查缓存是否有效
   * @param {Object} cached - 缓存对象
   * @returns {boolean}
   */
  isCacheValid(cached) {
    const cacheAge = Date.now() - cached.timestamp;
    return cacheAge < 30000; // 30秒缓存有效期
  }

  /**
   * 缓存验证结果
   * @param {string} cacheKey - 缓存键
   * @param {Object} result - 验证结果
   */
  cacheValidationResult(cacheKey, result) {
    this.validationCache.set(cacheKey, {
      result: { ...result },
      timestamp: Date.now()
    });

    // 清理过期缓存
    if (this.validationCache.size > 100) {
      this.cleanupCache();
    }
  }

  /**
   * 清理过期缓存
   */
  cleanupCache() {
    const now = Date.now();
    for (const [key, cached] of this.validationCache.entries()) {
      if (now - cached.timestamp > 60000) { // 1分钟过期
        this.validationCache.delete(key);
      }
    }
  }

  /**
   * 记录验证历史
   * @param {Object} node - 节点对象
   * @param {Object} result - 验证结果
   */
  recordValidationHistory(node, result) {
    this.validationHistory.push({
      nodeId: node.id,
      nodeType: node.type,
      result: { ...result },
      timestamp: Date.now()
    });

    // 保持历史记录在合理范围内
    if (this.validationHistory.length > 1000) {
      this.validationHistory = this.validationHistory.slice(-500);
    }
  }

  /**
   * 获取验证统计
   * @returns {Object} 统计信息
   */
  getValidationStats() {
    const recentValidations = this.validationHistory.filter(
      h => Date.now() - h.timestamp < 300000 // 最近5分钟
    );

    const validCount = recentValidations.filter(h => h.result.valid).length;
    const invalidCount = recentValidations.length - validCount;

    return {
      totalValidations: this.validationHistory.length,
      recentValidations: recentValidations.length,
      validCount,
      invalidCount,
      successRate: recentValidations.length > 0 ? (validCount / recentValidations.length) * 100 : 0,
      cacheSize: this.validationCache.size
    };
  }

  /**
   * 清理资源
   */
  cleanup() {
    this.validationCache.clear();
    this.validationHistory = [];
    console.log('🧹 [AI外呼验证器] 资源清理完成');
  }
}

export default AICallNodeValidator;