/**
 * 端口配置工厂类
 * 统一管理所有连接的端口配置，确保所有连接都从源节点的out端口到目标节点的in端口
 */

export class PortConfigurationFactory {
  constructor(options = {}) {
    // 端口配置常量
    this.PORT_CONFIG = {
      SOURCE_PORT: 'out',      // 源端口标准名称
      TARGET_PORT: 'in',       // 目标端口标准名称
      DIRECTION: 'outbound'    // 连接方向标识
    };
    
    // 配置选项
    this.options = {
      strictMode: true,         // 严格模式
      validateExistence: true,  // 验证端口存在性
      validateCompatibility: true, // 验证端口兼容性
      errorOnMismatch: true,    // 端口不匹配时报错
      autoCorrect: false,       // 禁止自动纠正端口
      enableLogging: true,      // 启用日志记录
      ...options
    };
    
    // 端口验证缓存
    this.validationCache = new Map();
    this.cacheTimeout = 5000; // 5秒缓存超时
    
    // 统计信息
    this.stats = {
      configurationsCreated: 0,
      validationsPerformed: 0,
      errorsDetected: 0,
      cacheHits: 0,
      cacheMisses: 0
    };
    
    console.log('✅ [PortConfigurationFactory] 初始化完成', {
      strictMode: this.options.strictMode,
      sourcePort: this.PORT_CONFIG.SOURCE_PORT,
      targetPort: this.PORT_CONFIG.TARGET_PORT
    });
  }
  
  /**
   * 创建标准端口配置
   * @param {string} sourceCellId - 源节点ID
   * @param {string} targetCellId - 目标节点ID
   * @param {Object} connectionData - 连接数据
   * @returns {Object} 标准化的端口配置
   */
  createPortConfiguration(sourceCellId, targetCellId, connectionData = {}) {
    try {
      // 验证输入参数
      this.validateInputParameters(sourceCellId, targetCellId, connectionData);
      
      // 获取标准端口配置
      const sourcePort = this.PORT_CONFIG.SOURCE_PORT;
      const targetPort = this.PORT_CONFIG.TARGET_PORT;
      
      // 端口配置验证
      this.validatePortConfiguration(sourcePort, targetPort);
      
      // 创建配置对象
      const portConfig = {
        source: {
          cell: sourceCellId,
          port: sourcePort,
          validated: true,
          timestamp: Date.now()
        },
        target: {
          cell: targetCellId,
          port: targetPort,
          validated: true,
          timestamp: Date.now()
        },
        metadata: {
          direction: this.PORT_CONFIG.DIRECTION,
          configuredBy: 'PortConfigurationFactory',
          strictMode: this.options.strictMode,
          version: '1.0.0'
        }
      };
      
      // 更新统计
      this.stats.configurationsCreated++;
      
      if (this.options.enableLogging) {
        console.log('✅ [PortConfigurationFactory] 端口配置创建成功', {
          source: `${sourceCellId}.${sourcePort}`,
          target: `${targetCellId}.${targetPort}`,
          direction: this.PORT_CONFIG.DIRECTION
        });
      }
      
      return portConfig;
      
    } catch (error) {
      this.stats.errorsDetected++;
      console.error('❌ [PortConfigurationFactory] 端口配置创建失败:', error);
      throw error;
    }
  }
  
  /**
   * 创建边配置对象（用于X6图形库）
   * @param {string} sourceCellId - 源节点ID
   * @param {string} targetCellId - 目标节点ID
   * @param {Object} connectionData - 连接数据
   * @returns {Object} X6边配置对象
   */
  createEdgeConfig(sourceCellId, targetCellId, connectionData = {}) {
    try {
      const portConfig = this.createPortConfiguration(sourceCellId, targetCellId, connectionData);
      
      return {
        id: connectionData.id || this.generateEdgeId(sourceCellId, targetCellId),
        source: portConfig.source,
        target: portConfig.target,
        data: {
          ...connectionData,
          portConfig: {
            sourcePort: portConfig.source.port,
            targetPort: portConfig.target.port,
            validated: true,
            timestamp: Date.now(),
            factory: 'PortConfigurationFactory'
          }
        },
        attrs: this.createDefaultEdgeAttrs(connectionData)
      };
      
    } catch (error) {
      console.error('❌ [PortConfigurationFactory] 边配置创建失败:', error);
      throw error;
    }
  }
  
  /**
   * 验证端口配置
   * @param {string} sourcePort - 源端口
   * @param {string} targetPort - 目标端口
   * @returns {boolean} 验证结果
   */
  validatePortConfiguration(sourcePort, targetPort) {
    if (sourcePort !== this.PORT_CONFIG.SOURCE_PORT) {
      const error = `源端口必须为 '${this.PORT_CONFIG.SOURCE_PORT}', 当前为: '${sourcePort}'`;
      if (this.options.errorOnMismatch) {
        throw new Error(error);
      } else {
        console.warn('⚠️ [PortConfigurationFactory]', error);
        return false;
      }
    }
    
    if (targetPort !== this.PORT_CONFIG.TARGET_PORT) {
      const error = `目标端口必须为 '${this.PORT_CONFIG.TARGET_PORT}', 当前为: '${targetPort}'`;
      if (this.options.errorOnMismatch) {
        throw new Error(error);
      } else {
        console.warn('⚠️ [PortConfigurationFactory]', error);
        return false;
      }
    }
    
    return true;
  }
  
  /**
   * 验证节点端口兼容性
   * @param {Object} sourceNode - 源节点
   * @param {Object} targetNode - 目标节点
   * @returns {Object} 验证结果
   */
  validateNodePortCompatibility(sourceNode, targetNode) {
    const cacheKey = `${sourceNode.id}-${targetNode.id}`;
    
    // 检查缓存
    if (this.validationCache.has(cacheKey)) {
      const cached = this.validationCache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        this.stats.cacheHits++;
        return cached.result;
      }
    }
    
    this.stats.cacheMisses++;
    this.stats.validationsPerformed++;
    
    try {
      const sourceHasOutPort = sourceNode.hasPort?.(this.PORT_CONFIG.SOURCE_PORT) ?? true;
      const targetHasInPort = targetNode.hasPort?.(this.PORT_CONFIG.TARGET_PORT) ?? true;
      
      const result = {
        isValid: true,
        sourceHasOutPort,
        targetHasInPort,
        errors: []
      };
      
      if (!sourceHasOutPort) {
        result.isValid = false;
        result.errors.push(`源节点 ${sourceNode.id} 缺少 '${this.PORT_CONFIG.SOURCE_PORT}' 端口`);
      }
      
      if (!targetHasInPort) {
        result.isValid = false;
        result.errors.push(`目标节点 ${targetNode.id} 缺少 '${this.PORT_CONFIG.TARGET_PORT}' 端口`);
      }
      
      // 缓存结果
      this.validationCache.set(cacheKey, {
        result,
        timestamp: Date.now()
      });
      
      if (this.options.enableLogging && !result.isValid) {
        console.warn('⚠️ [PortConfigurationFactory] 节点端口兼容性验证失败:', result.errors);
      }
      
      return result;
      
    } catch (error) {
      this.stats.errorsDetected++;
      console.error('❌ [PortConfigurationFactory] 节点端口兼容性验证异常:', error);
      
      return {
        isValid: false,
        sourceHasOutPort: false,
        targetHasInPort: false,
        errors: [`验证异常: ${error.message}`]
      };
    }
  }
  
  /**
   * 验证输入参数
   * @param {string} sourceCellId - 源节点ID
   * @param {string} targetCellId - 目标节点ID
   * @param {Object} connectionData - 连接数据
   */
  validateInputParameters(sourceCellId, targetCellId, connectionData) {
    if (!sourceCellId || typeof sourceCellId !== 'string') {
      throw new Error('源节点ID必须是非空字符串');
    }
    
    if (!targetCellId || typeof targetCellId !== 'string') {
      throw new Error('目标节点ID必须是非空字符串');
    }
    
    if (sourceCellId === targetCellId) {
      throw new Error('源节点和目标节点不能相同');
    }
    
    if (connectionData && typeof connectionData !== 'object') {
      throw new Error('连接数据必须是对象类型');
    }
  }
  
  /**
   * 生成边ID
   * @param {string} sourceCellId - 源节点ID
   * @param {string} targetCellId - 目标节点ID
   * @returns {string} 边ID
   */
  generateEdgeId(sourceCellId, targetCellId) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `edge_${sourceCellId}_${targetCellId}_${timestamp}_${random}`;
  }
  
  /**
   * 创建默认边属性
   * @param {Object} connectionData - 连接数据
   * @returns {Object} 边属性
   */
  createDefaultEdgeAttrs(connectionData = {}) {
    return {
      line: {
        stroke: connectionData.stroke || '#1890ff',
        strokeWidth: connectionData.strokeWidth || 2,
        opacity: connectionData.opacity || 1,
        targetMarker: {
          name: 'block',
          width: 12,
          height: 8,
          fill: connectionData.stroke || '#1890ff'
        }
      }
    };
  }
  
  /**
   * 清理验证缓存
   */
  clearValidationCache() {
    this.validationCache.clear();
    console.log('🧹 [PortConfigurationFactory] 验证缓存已清理');
  }
  
  /**
   * 获取统计信息
   * @returns {Object} 统计信息
   */
  getStats() {
    return {
      ...this.stats,
      cacheSize: this.validationCache.size,
      cacheHitRate: this.stats.cacheHits / (this.stats.cacheHits + this.stats.cacheMisses) || 0
    };
  }
  
  /**
   * 重置统计信息
   */
  resetStats() {
    this.stats = {
      configurationsCreated: 0,
      validationsPerformed: 0,
      errorsDetected: 0,
      cacheHits: 0,
      cacheMisses: 0
    };
    console.log('📊 [PortConfigurationFactory] 统计信息已重置');
  }
  
  /**
   * 销毁工厂实例
   */
  destroy() {
    this.clearValidationCache();
    this.resetStats();
    console.log('🗑️ [PortConfigurationFactory] 实例已销毁');
  }
}

// 创建默认实例
export const defaultPortConfigurationFactory = new PortConfigurationFactory();

// 导出端口配置常量
export const PORT_CONSTANTS = {
  SOURCE_PORT: 'out',
  TARGET_PORT: 'in',
  DIRECTION: 'outbound'
};