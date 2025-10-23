/**
 * 连接创建控制器
 * 统一管理连接创建流程，确保所有连接都通过预览线转换创建
 */

import { PortConfigurationFactory } from './PortConfigurationFactory.js';

export class ConnectionCreationController {
  constructor(options = {}) {
    this.options = {
      // 连接创建策略
      method: 'preview_conversion_only',  // 仅通过预览线转换创建
      allowDirectCreation: false,         // 禁止直接创建
      requirePreviewLine: true,           // 必须先有预览线
      validateBeforeCreate: true,         // 创建前验证
      
      // 验证配置
      preventDuplicates: true,            // 防止重复连接
      validatePorts: true,                // 验证端口配置
      checkNodeTypes: true,               // 检查节点类型兼容性
      validatePortDirection: true,        // 验证端口方向
      checkCircularReference: true,       // 检查循环引用
      maxConnectionsPerNode: null,        // 每节点最大连接数限制
      
      // 错误处理
      onPortMismatch: 'throw',            // 端口不匹配处理方式
      onDuplicateConnection: 'ignore',    // 重复连接处理方式
      onValidationFail: 'throw',          // 验证失败处理方式
      logErrors: true,                    // 记录错误日志
      showUserFeedback: true,             // 显示用户反馈
      
      // 性能优化
      enableBatchCreation: true,          // 启用批量创建
      batchSize: 10,                      // 批量处理大小
      enableCache: true,                  // 启用缓存
      cacheTimeout: 5000,                 // 缓存超时时间
      
      ...options
    };
    
    // 端口配置工厂
    this.portConfigFactory = new PortConfigurationFactory({
      strictMode: this.options.validatePorts,
      errorOnMismatch: this.options.onPortMismatch === 'throw'
    });
    
    // 连接验证缓存
    this.validationCache = new Map();
    
    // 连接创建队列
    this.creationQueue = [];
    this.isProcessingQueue = false;
    
    // 统计信息
    this.stats = {
      connectionsCreated: 0,
      previewConversions: 0,
      directCreationAttempts: 0,
      directCreationBlocked: 0,
      validationFailures: 0,
      duplicatesDetected: 0,
      batchOperations: 0
    };
    
    // 错误收集
    this.errors = [];
    this.maxErrorHistory = 100;
    
    console.log('✅ [ConnectionCreationController] 初始化完成', {
      method: this.options.method,
      allowDirectCreation: this.options.allowDirectCreation,
      requirePreviewLine: this.options.requirePreviewLine
    });
  }
  
  /**
   * 创建连接（统一入口）
   * @param {Object} connectionRequest - 连接请求
   * @returns {Promise<Object>} 创建结果
   */
  async createConnection(connectionRequest) {
    try {
      // 验证连接请求
      this.validateConnectionRequest(connectionRequest);
      
      // 检查是否允许直接创建
      if (!connectionRequest.fromPreviewLine && !this.options.allowDirectCreation) {
        this.stats.directCreationBlocked++;
        const error = new Error('直接创建连接被禁用，必须通过预览线转换创建连接');
        this.recordError(error, connectionRequest);
        
        if (this.options.onValidationFail === 'throw') {
          throw error;
        } else {
          console.warn('⚠️ [ConnectionCreationController] 直接创建被阻止:', connectionRequest);
          return { success: false, error: error.message, blocked: true };
        }
      }
      
      // 根据创建方式分发处理
      if (connectionRequest.fromPreviewLine) {
        return await this.createConnectionFromPreviewLine(connectionRequest);
      } else if (this.options.allowDirectCreation) {
        return await this.createDirectConnection(connectionRequest);
      } else {
        throw new Error('无效的连接创建方式');
      }
      
    } catch (error) {
      this.recordError(error, connectionRequest);
      console.error('❌ [ConnectionCreationController] 连接创建失败:', error);
      
      if (this.options.onValidationFail === 'throw') {
        throw error;
      } else {
        return { success: false, error: error.message };
      }
    }
  }
  
  /**
   * 从预览线转换创建连接（推荐方式）
   * @param {Object} connectionRequest - 连接请求
   * @returns {Promise<Object>} 创建结果
   */
  async createConnectionFromPreviewLine(connectionRequest) {
    try {
      const { previewLineId, targetNodeId, options = {} } = connectionRequest;
      
      // 验证预览线存在
      if (!previewLineId) {
        throw new Error('缺少预览线ID');
      }
      
      // 验证目标节点
      if (!targetNodeId) {
        throw new Error('缺少目标节点ID');
      }
      
      // 执行预览线转换验证
      const validation = await this.validatePreviewLineConversion(
        previewLineId, 
        targetNodeId, 
        options
      );
      
      if (!validation.isValid) {
        this.stats.validationFailures++;
        throw new Error(`预览线转换验证失败: ${validation.errors.join(', ')}`);
      }
      
      // 创建端口配置
      const portConfig = this.portConfigFactory.createPortConfiguration(
        validation.sourceNodeId,
        targetNodeId,
        {
          ...options,
          fromPreviewLine: true,
          previewLineId: previewLineId
        }
      );
      
      // 执行转换
      const conversionResult = await this.executePreviewLineConversion({
        previewLineId,
        targetNodeId,
        portConfig,
        options,
        validation
      });
      
      this.stats.connectionsCreated++;
      this.stats.previewConversions++;
      
      console.log('✅ [ConnectionCreationController] 预览线转换成功:', {
        previewLineId,
        targetNodeId,
        connectionId: conversionResult.connectionId
      });
      
      return {
        success: true,
        method: 'preview_conversion',
        connectionId: conversionResult.connectionId,
        connection: conversionResult.connection,
        portConfig: portConfig
      };
      
    } catch (error) {
      console.error('❌ [ConnectionCreationController] 预览线转换失败:', error);
      throw error;
    }
  }
  
  /**
   * 直接创建连接（受限方式）
   * @param {Object} connectionRequest - 连接请求
   * @returns {Promise<Object>} 创建结果
   */
  async createDirectConnection(connectionRequest) {
    this.stats.directCreationAttempts++;
    
    try {
      // 记录直接创建尝试
      console.warn('⚠️ [ConnectionCreationController] 尝试直接创建连接（不推荐）:', connectionRequest);
      
      const { sourceNodeId, targetNodeId, options = {} } = connectionRequest;
      
      // 验证节点存在
      if (!sourceNodeId || !targetNodeId) {
        throw new Error('缺少源节点或目标节点ID');
      }
      
      // 执行直接连接验证
      const validation = await this.validateDirectConnection(sourceNodeId, targetNodeId, options);
      
      if (!validation.isValid) {
        this.stats.validationFailures++;
        throw new Error(`直接连接验证失败: ${validation.errors.join(', ')}`);
      }
      
      // 创建端口配置
      const portConfig = this.portConfigFactory.createPortConfiguration(
        sourceNodeId,
        targetNodeId,
        {
          ...options,
          fromPreviewLine: false,
          directCreation: true
        }
      );
      
      // 执行直接创建
      const creationResult = await this.executeDirectConnection({
        sourceNodeId,
        targetNodeId,
        portConfig,
        options,
        validation
      });
      
      this.stats.connectionsCreated++;
      
      console.log('✅ [ConnectionCreationController] 直接连接创建成功:', {
        sourceNodeId,
        targetNodeId,
        connectionId: creationResult.connectionId
      });
      
      return {
        success: true,
        method: 'direct_creation',
        connectionId: creationResult.connectionId,
        connection: creationResult.connection,
        portConfig: portConfig,
        warning: '建议使用预览线转换方式创建连接'
      };
      
    } catch (error) {
      console.error('❌ [ConnectionCreationController] 直接连接创建失败:', error);
      throw error;
    }
  }
  
  /**
   * 批量创建连接
   * @param {Array} connectionRequests - 连接请求数组
   * @returns {Promise<Array>} 创建结果数组
   */
  async batchCreateConnections(connectionRequests) {
    if (!this.options.enableBatchCreation) {
      throw new Error('批量创建功能未启用');
    }
    
    if (!Array.isArray(connectionRequests) || connectionRequests.length === 0) {
      throw new Error('无效的批量连接请求');
    }
    
    console.log(`🔄 [ConnectionCreationController] 开始批量创建 ${connectionRequests.length} 个连接`);
    
    const results = [];
    const batchSize = this.options.batchSize;
    
    for (let i = 0; i < connectionRequests.length; i += batchSize) {
      const batch = connectionRequests.slice(i, i + batchSize);
      const batchResults = await Promise.allSettled(
        batch.map(request => this.createConnection(request))
      );
      
      // 处理批次结果
      for (let j = 0; j < batchResults.length; j++) {
        const result = batchResults[j];
        const originalRequest = batch[j];
        
        if (result.status === 'fulfilled') {
          results.push({
            index: i + j,
            request: originalRequest,
            result: result.value,
            success: true
          });
        } else {
          results.push({
            index: i + j,
            request: originalRequest,
            error: result.reason.message,
            success: false
          });
        }
      }
    }
    
    this.stats.batchOperations++;
    
    const successCount = results.filter(r => r.success).length;
    const failureCount = results.length - successCount;
    
    console.log(`✅ [ConnectionCreationController] 批量创建完成: ${successCount} 成功, ${failureCount} 失败`);
    
    return {
      total: results.length,
      successful: successCount,
      failed: failureCount,
      results: results
    };
  }
  
  /**
   * 验证连接请求
   * @param {Object} connectionRequest - 连接请求
   */
  validateConnectionRequest(connectionRequest) {
    if (!connectionRequest || typeof connectionRequest !== 'object') {
      throw new Error('无效的连接请求对象');
    }
    
    // 验证预览线转换请求
    if (connectionRequest.fromPreviewLine) {
      if (!connectionRequest.previewLineId) {
        throw new Error('预览线转换请求缺少预览线ID');
      }
      if (!connectionRequest.targetNodeId) {
        throw new Error('预览线转换请求缺少目标节点ID');
      }
    }
    
    // 验证直接创建请求
    if (!connectionRequest.fromPreviewLine) {
      if (!connectionRequest.sourceNodeId) {
        throw new Error('直接创建请求缺少源节点ID');
      }
      if (!connectionRequest.targetNodeId) {
        throw new Error('直接创建请求缺少目标节点ID');
      }
    }
  }
  
  /**
   * 验证预览线转换
   * @param {string} previewLineId - 预览线ID
   * @param {string} targetNodeId - 目标节点ID
   * @param {Object} options - 选项
   * @returns {Promise<Object>} 验证结果
   */
  async validatePreviewLineConversion(previewLineId, targetNodeId, options = {}) {
    const cacheKey = `preview_${previewLineId}_${targetNodeId}`;
    
    // 检查缓存
    if (this.options.enableCache && this.validationCache.has(cacheKey)) {
      const cached = this.validationCache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.options.cacheTimeout) {
        return cached.result;
      }
    }
    
    const errors = [];
    let sourceNodeId = null;
    
    try {
      // 这里应该调用实际的预览线管理器来验证
      // 暂时返回模拟验证结果
      
      // 模拟获取预览线信息
      sourceNodeId = `source_of_${previewLineId}`;
      
      // 验证预览线存在
      if (!previewLineId) {
        errors.push('预览线不存在');
      }
      
      // 验证目标节点
      if (!targetNodeId) {
        errors.push('目标节点不存在');
      }
      
      // 验证重复连接
      if (this.options.preventDuplicates) {
        // 这里应该检查是否已存在相同连接
        // const hasExisting = await this.checkDuplicateConnection(sourceNodeId, targetNodeId);
        // if (hasExisting) {
        //   errors.push('连接已存在');
        // }
      }
      
      const result = {
        isValid: errors.length === 0,
        errors: errors,
        sourceNodeId: sourceNodeId,
        targetNodeId: targetNodeId,
        previewLineId: previewLineId
      };
      
      // 缓存结果
      if (this.options.enableCache) {
        this.validationCache.set(cacheKey, {
          result: result,
          timestamp: Date.now()
        });
      }
      
      return result;
      
    } catch (error) {
      console.error('❌ [ConnectionCreationController] 预览线转换验证异常:', error);
      return {
        isValid: false,
        errors: [`验证异常: ${error.message}`],
        sourceNodeId: sourceNodeId,
        targetNodeId: targetNodeId,
        previewLineId: previewLineId
      };
    }
  }
  
  /**
   * 验证直接连接
   * @param {string} sourceNodeId - 源节点ID
   * @param {string} targetNodeId - 目标节点ID
   * @param {Object} options - 选项
   * @returns {Promise<Object>} 验证结果
   */
  async validateDirectConnection(sourceNodeId, targetNodeId, options = {}) {
    const cacheKey = `direct_${sourceNodeId}_${targetNodeId}`;
    
    // 检查缓存
    if (this.options.enableCache && this.validationCache.has(cacheKey)) {
      const cached = this.validationCache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.options.cacheTimeout) {
        return cached.result;
      }
    }
    
    const errors = [];
    
    try {
      // 验证节点存在
      if (!sourceNodeId) {
        errors.push('源节点不存在');
      }
      
      if (!targetNodeId) {
        errors.push('目标节点不存在');
      }
      
      // 验证不是自连接
      if (sourceNodeId === targetNodeId) {
        errors.push('不能连接到自身');
      }
      
      // 验证重复连接
      if (this.options.preventDuplicates) {
        // 这里应该检查是否已存在相同连接
        // const hasExisting = await this.checkDuplicateConnection(sourceNodeId, targetNodeId);
        // if (hasExisting) {
        //   errors.push('连接已存在');
        // }
      }
      
      const result = {
        isValid: errors.length === 0,
        errors: errors,
        sourceNodeId: sourceNodeId,
        targetNodeId: targetNodeId
      };
      
      // 缓存结果
      if (this.options.enableCache) {
        this.validationCache.set(cacheKey, {
          result: result,
          timestamp: Date.now()
        });
      }
      
      return result;
      
    } catch (error) {
      console.error('❌ [ConnectionCreationController] 直接连接验证异常:', error);
      return {
        isValid: false,
        errors: [`验证异常: ${error.message}`],
        sourceNodeId: sourceNodeId,
        targetNodeId: targetNodeId
      };
    }
  }
  
  /**
   * 执行预览线转换
   * @param {Object} conversionData - 转换数据
   * @returns {Promise<Object>} 转换结果
   */
  async executePreviewLineConversion(conversionData) {
    // 这里应该调用实际的预览线管理器来执行转换
    // 暂时返回模拟结果
    
    const connectionId = `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      connectionId: connectionId,
      connection: {
        id: connectionId,
        source: { nodeId: conversionData.validation.sourceNodeId, port: 'out' },
        target: { nodeId: conversionData.targetNodeId, port: 'in' },
        type: 'connection',
        fromPreviewLine: true,
        previewLineId: conversionData.previewLineId
      }
    };
  }
  
  /**
   * 执行直接连接创建
   * @param {Object} creationData - 创建数据
   * @returns {Promise<Object>} 创建结果
   */
  async executeDirectConnection(creationData) {
    // 这里应该调用实际的连接管理器来创建连接
    // 暂时返回模拟结果
    
    const connectionId = `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      connectionId: connectionId,
      connection: {
        id: connectionId,
        source: { nodeId: creationData.sourceNodeId, port: 'out' },
        target: { nodeId: creationData.targetNodeId, port: 'in' },
        type: 'connection',
        fromPreviewLine: false,
        directCreation: true
      }
    };
  }
  
  /**
   * 记录错误
   * @param {Error} error - 错误对象
   * @param {Object} context - 上下文信息
   */
  recordError(error, context = {}) {
    const errorRecord = {
      timestamp: Date.now(),
      message: error.message,
      stack: error.stack,
      context: context
    };
    
    this.errors.push(errorRecord);
    
    // 限制错误历史记录数量
    if (this.errors.length > this.maxErrorHistory) {
      this.errors.shift();
    }
    
    if (this.options.logErrors) {
      console.error('📝 [ConnectionCreationController] 错误记录:', errorRecord);
    }
  }
  
  /**
   * 清理验证缓存
   */
  clearValidationCache() {
    this.validationCache.clear();
    console.log('🧹 [ConnectionCreationController] 验证缓存已清理');
  }
  
  /**
   * 获取统计信息
   * @returns {Object} 统计信息
   */
  getStats() {
    return {
      ...this.stats,
      cacheSize: this.validationCache.size,
      errorCount: this.errors.length,
      directCreationBlockRate: this.stats.directCreationBlocked / (this.stats.directCreationAttempts || 1),
      validationFailureRate: this.stats.validationFailures / (this.stats.connectionsCreated + this.stats.validationFailures || 1)
    };
  }
  
  /**
   * 重置统计信息
   */
  resetStats() {
    this.stats = {
      connectionsCreated: 0,
      previewConversions: 0,
      directCreationAttempts: 0,
      directCreationBlocked: 0,
      validationFailures: 0,
      duplicatesDetected: 0,
      batchOperations: 0
    };
    console.log('📊 [ConnectionCreationController] 统计信息已重置');
  }
  
  /**
   * 获取错误历史
   * @returns {Array} 错误历史记录
   */
  getErrorHistory() {
    return [...this.errors];
  }
  
  /**
   * 清理错误历史
   */
  clearErrorHistory() {
    this.errors.length = 0;
    console.log('🧹 [ConnectionCreationController] 错误历史已清理');
  }
  
  /**
   * 销毁控制器
   */
  destroy() {
    this.clearValidationCache();
    this.clearErrorHistory();
    this.resetStats();
    
    if (this.portConfigFactory) {
      this.portConfigFactory.destroy();
    }
    
    console.log('🗑️ [ConnectionCreationController] 控制器已销毁');
  }
}

// 创建默认实例
export const defaultConnectionCreationController = new ConnectionCreationController();