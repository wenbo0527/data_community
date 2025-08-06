/**
 * 坐标计算重构模块 - 主入口文件
 * 提供统一的API接口和便捷的使用方式
 */

// 核心模块
export { CoordinateCalculator } from './core/CoordinateCalculator.js';
export { CoordinateValidator } from './validation/CoordinateValidator.js';
export { PositionApplicator } from './position/PositionApplicator.js';
export { SyncManager, SyncState, SyncEventType } from './sync/SyncManager.js';
export { PreviewLineRefreshManager, RefreshPriority } from './sync/PreviewLineRefreshManager.js';
export { BranchFlowManager, BranchType, BranchState, FlowDirection } from './sync/BranchFlowManager.js';
export { 
  EnhancedUnifiedPreviewLineManager, 
  PreviewLineType, 
  PreviewLineState 
} from './sync/EnhancedUnifiedPreviewLineManager.js';

// 策略模块
export { 
  LayerCalculationStrategy,
  BottomUpStrategy,
  TopDownStrategy,
  CenterAlignStrategy,
  AdaptiveStrategy,
  StrategyFactory
} from './strategies/LayerCalculationStrategies.js';

export {
  DistributionAlgorithm,
  SymmetricDistribution,
  GoldenRatioDistribution,
  UniformDistribution,
  ForceDirectedDistribution,
  AlgorithmFactory
} from './strategies/DistributionAlgorithms.js';

// 验证规则
export {
  ValidationRule,
  BoundaryValidationRule,
  OverlapValidationRule,
  LayerConsistencyValidationRule,
  ConnectionValidityValidationRule,
  PerformanceValidationRule
} from './validation/CoordinateValidator.js';

// 应用策略
export {
  ApplicationStrategy,
  DirectApplicationStrategy,
  BatchApplicationStrategy,
  ProgressiveApplicationStrategy
} from './position/PositionApplicator.js';

// 错误处理
export {
  CoordinateCalculationError,
  PositionApplicationError,
  CoordinateValidationError,
  AnomalyDetectionError,
  PreviewLineRefreshError,
  BranchFlowError,
  ErrorFactory,
  ErrorHandler,
  globalErrorHandler
} from './errors/CoordinateErrors.js';

/**
 * 默认配置
 */
export const DEFAULT_CONFIG = {
  // 计算器配置
  calculator: {
    layerStrategy: 'adaptive',
    distributionAlgorithm: 'symmetric',
    precision: 2,
    enableCache: true,
    enableValidation: true,
    enableOptimization: true,
    enableDebug: false
  },
  
  // 验证器配置
  validator: {
    enabledRules: ['boundary', 'overlap', 'layerConsistency', 'connectionValidity', 'performance'],
    strictMode: false,
    continueOnError: true
  },
  
  // 应用器配置
  applicator: {
    strategy: 'direct',
    enableValidation: true,
    enableRollback: true,
    maxRetries: 3
  },
  
  // 同步管理器配置
  sync: {
    enableValidation: true,
    enableRollback: true,
    enableProgressTracking: true,
    enableEventEmission: true,
    maxConcurrentSyncs: 3,
    syncTimeout: 30000
  }
};

/**
 * 坐标重构系统主类
 * 提供简化的API接口
 */
export class CoordinateRefactorSystem {
  constructor(config = {}) {
    this.config = this.mergeConfig(DEFAULT_CONFIG, config);
    this.syncManager = new SyncManager({
      calculatorConfig: this.config.calculator,
      validatorConfig: this.config.validator,
      applicatorConfig: this.config.applicator,
      ...this.config.sync
    });

    console.log(`✅ [坐标重构系统] 初始化完成`);
  }

  /**
   * 合并配置
   */
  mergeConfig(defaultConfig, userConfig) {
    const merged = { ...defaultConfig };
    
    Object.keys(userConfig).forEach(key => {
      if (typeof userConfig[key] === 'object' && !Array.isArray(userConfig[key])) {
        merged[key] = { ...defaultConfig[key], ...userConfig[key] };
      } else {
        merged[key] = userConfig[key];
      }
    });

    return merged;
  }

  /**
   * 计算并应用坐标 - 主要API
   * @param {Array} layers - 层级数据
   * @param {Object} context - 上下文信息
   * @param {Object} options - 选项配置
   * @returns {Promise<Object>} 执行结果
   */
  async calculateAndApply(layers, context = {}, options = {}) {
    console.log(`🚀 [坐标重构系统] 开始计算并应用坐标 - 层级数: ${layers.length}`);
    
    try {
      const result = await this.syncManager.sync(layers, context, options);
      
      console.log(`✅ [坐标重构系统] 计算并应用完成 - 同步ID: ${result.syncId}`);
      return result;
    } catch (error) {
      console.error(`❌ [坐标重构系统] 计算并应用失败:`, error.message);
      throw error;
    }
  }

  /**
   * 仅计算坐标（不应用）
   * @param {Array} layers - 层级数据
   * @param {Object} options - 计算选项
   * @returns {Promise<Map>} 节点位置映射
   */
  async calculateOnly(layers, options = {}) {
    console.log(`🔢 [坐标重构系统] 仅计算坐标 - 层级数: ${layers.length}`);
    
    try {
      const calculator = this.syncManager.calculator;
      const positions = await calculator.calculate(layers, options);
      
      console.log(`✅ [坐标重构系统] 坐标计算完成 - 节点数: ${positions.size}`);
      return positions;
    } catch (error) {
      console.error(`❌ [坐标重构系统] 坐标计算失败:`, error.message);
      throw error;
    }
  }

  /**
   * 验证坐标
   * @param {Map} positions - 节点位置映射
   * @param {Array} layers - 层级数据
   * @param {Object} context - 验证上下文
   * @returns {Promise<Object>} 验证结果
   */
  async validatePositions(positions, layers, context = {}) {
    console.log(`🔍 [坐标重构系统] 验证坐标 - 节点数: ${positions.size}`);
    
    if (!this.syncManager.validator) {
      throw new Error('验证器未启用');
    }

    try {
      const result = await this.syncManager.validator.validate(positions, layers, context);
      
      console.log(`✅ [坐标重构系统] 坐标验证完成 - 状态: ${result.isValid ? '通过' : '失败'}`);
      return result;
    } catch (error) {
      console.error(`❌ [坐标重构系统] 坐标验证失败:`, error.message);
      throw error;
    }
  }

  /**
   * 应用位置
   * @param {Map} positions - 节点位置映射
   * @param {Object} context - 应用上下文
   * @returns {Promise<Object>} 应用结果
   */
  async applyPositions(positions, context = {}) {
    console.log(`📍 [坐标重构系统] 应用位置 - 节点数: ${positions.size}`);
    
    try {
      const result = await this.syncManager.applicator.apply(positions, context);
      
      console.log(`✅ [坐标重构系统] 位置应用完成 - 成功: ${result.applied}, 失败: ${result.failed}`);
      return result;
    } catch (error) {
      console.error(`❌ [坐标重构系统] 位置应用失败:`, error.message);
      throw error;
    }
  }

  /**
   * 取消同步
   * @param {string} syncId - 同步ID
   * @param {string} reason - 取消原因
   * @returns {Promise<boolean>} 是否成功取消
   */
  async cancelSync(syncId, reason = '用户取消') {
    return await this.syncManager.cancelSync(syncId, reason);
  }

  /**
   * 回滚应用
   * @param {string} applicationId - 应用ID
   * @returns {Promise<Object>} 回滚结果
   */
  async rollback(applicationId) {
    console.log(`↩️ [坐标重构系统] 回滚应用 - ID: ${applicationId}`);
    
    try {
      const result = await this.syncManager.applicator.rollback(applicationId);
      
      console.log(`✅ [坐标重构系统] 回滚完成 - 恢复: ${result.restored} 个节点`);
      return result;
    } catch (error) {
      console.error(`❌ [坐标重构系统] 回滚失败:`, error.message);
      throw error;
    }
  }

  /**
   * 获取同步状态
   * @param {string} syncId - 同步ID
   * @returns {Object|null} 同步状态
   */
  getSyncStatus(syncId) {
    return this.syncManager.getSyncStatus(syncId);
  }

  /**
   * 获取所有活动同步
   * @returns {Array} 活动同步列表
   */
  getActiveSyncs() {
    return this.syncManager.getActiveSyncs();
  }

  /**
   * 获取系统统计信息
   * @returns {Object} 统计信息
   */
  getStatistics() {
    return {
      sync: this.syncManager.getStatistics(),
      calculator: this.syncManager.calculator.getPerformanceStats(),
      validator: this.syncManager.validator ? this.syncManager.validator.getStatistics() : null,
      applicator: this.syncManager.applicator.getStatistics()
    };
  }

  /**
   * 添加事件监听器
   * @param {string} eventType - 事件类型
   * @param {Function} listener - 监听器函数
   */
  addEventListener(eventType, listener) {
    this.syncManager.addEventListener(eventType, listener);
  }

  /**
   * 移除事件监听器
   * @param {string} eventType - 事件类型
   * @param {Function} listener - 监听器函数
   */
  removeEventListener(eventType, listener) {
    this.syncManager.removeEventListener(eventType, listener);
  }

  /**
   * 重新配置系统
   * @param {Object} newConfig - 新配置
   */
  reconfigure(newConfig) {
    this.config = this.mergeConfig(this.config, newConfig);
    this.syncManager.reconfigure({
      calculatorConfig: this.config.calculator,
      validatorConfig: this.config.validator,
      applicatorConfig: this.config.applicator,
      ...this.config.sync
    });

    console.log(`🔧 [坐标重构系统] 重新配置完成`);
  }

  /**
   * 清理系统资源
   */
  cleanup() {
    this.syncManager.cleanup();
    console.log(`🗑️ [坐标重构系统] 资源清理完成`);
  }
}

/**
 * 创建坐标重构系统实例的便捷函数
 * @param {Object} config - 配置选项
 * @returns {CoordinateRefactorSystem} 系统实例
 */
export function createCoordinateRefactorSystem(config = {}) {
  return new CoordinateRefactorSystem(config);
}

/**
 * 快速计算并应用坐标的便捷函数
 * @param {Array} layers - 层级数据
 * @param {Object} context - 上下文信息
 * @param {Object} config - 系统配置
 * @returns {Promise<Object>} 执行结果
 */
export async function quickCalculateAndApply(layers, context = {}, config = {}) {
  const system = createCoordinateRefactorSystem(config);
  
  try {
    const result = await system.calculateAndApply(layers, context);
    return result;
  } finally {
    system.cleanup();
  }
}

/**
 * 快速计算坐标的便捷函数
 * @param {Array} layers - 层级数据
 * @param {Object} options - 计算选项
 * @param {Object} config - 系统配置
 * @returns {Promise<Map>} 节点位置映射
 */
export async function quickCalculate(layers, options = {}, config = {}) {
  const system = createCoordinateRefactorSystem(config);
  
  try {
    const positions = await system.calculateOnly(layers, options);
    return positions;
  } finally {
    system.cleanup();
  }
}

// 导出版本信息
export const VERSION = '1.0.0';
export const BUILD_DATE = new Date().toISOString();

console.log(`📦 [坐标重构模块] 加载完成 - 版本: ${VERSION}, 构建时间: ${BUILD_DATE}`);