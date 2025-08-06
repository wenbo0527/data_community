/**
 * 坐标计算相关的自定义错误类
 */

/**
 * 坐标计算错误基类
 */
export class CoordinateCalculationError extends Error {
  constructor(message, nodeId = null, details = null) {
    super(message);
    this.name = 'CoordinateCalculationError';
    this.nodeId = nodeId;
    this.details = details;
    this.timestamp = Date.now();
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      nodeId: this.nodeId,
      details: this.details,
      timestamp: this.timestamp,
      stack: this.stack
    };
  }
}

/**
 * 位置应用错误
 */
export class PositionApplicationError extends CoordinateCalculationError {
  constructor(message, nodeId = null, position = null, details = null) {
    super(message, nodeId, details);
    this.name = 'PositionApplicationError';
    this.position = position;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      position: this.position
    };
  }
}

/**
 * 坐标验证错误
 */
export class CoordinateValidationError extends CoordinateCalculationError {
  constructor(message, nodeId = null, coordinate = null, validationRule = null) {
    super(message, nodeId, { coordinate, validationRule });
    this.name = 'CoordinateValidationError';
    this.coordinate = coordinate;
    this.validationRule = validationRule;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      coordinate: this.coordinate,
      validationRule: this.validationRule
    };
  }
}

/**
 * 异常检测错误
 */
export class AnomalyDetectionError extends CoordinateCalculationError {
  constructor(message, nodeId = null, anomalyType = null, threshold = null) {
    super(message, nodeId, { anomalyType, threshold });
    this.name = 'AnomalyDetectionError';
    this.anomalyType = anomalyType;
    this.threshold = threshold;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      anomalyType: this.anomalyType,
      threshold: this.threshold
    };
  }
}

/**
 * 预览线刷新错误
 */
export class PreviewLineRefreshError extends CoordinateCalculationError {
  constructor(message, nodeId = null, branchId = null, details = null) {
    super(message, nodeId, details);
    this.name = 'PreviewLineRefreshError';
    this.branchId = branchId;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      branchId: this.branchId
    };
  }
}

/**
 * 分流管理错误
 */
export class BranchFlowError extends CoordinateCalculationError {
  constructor(message, sourceNodeId = null, branchId = null, endpointNodeId = null) {
    super(message, sourceNodeId, { branchId, endpointNodeId });
    this.name = 'BranchFlowError';
    this.branchId = branchId;
    this.endpointNodeId = endpointNodeId;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      branchId: this.branchId,
      endpointNodeId: this.endpointNodeId
    };
  }
}

/**
 * 错误工厂类
 */
export class ErrorFactory {
  /**
   * 创建坐标计算错误
   */
  static createCalculationError(message, nodeId, details) {
    return new CoordinateCalculationError(message, nodeId, details);
  }

  /**
   * 创建位置应用错误
   */
  static createPositionError(message, nodeId, position, details) {
    return new PositionApplicationError(message, nodeId, position, details);
  }

  /**
   * 创建验证错误
   */
  static createValidationError(message, nodeId, coordinate, validationRule) {
    return new CoordinateValidationError(message, nodeId, coordinate, validationRule);
  }

  /**
   * 创建异常检测错误
   */
  static createAnomalyError(message, nodeId, anomalyType, threshold) {
    return new AnomalyDetectionError(message, nodeId, anomalyType, threshold);
  }

  /**
   * 创建预览线刷新错误
   */
  static createPreviewLineError(message, nodeId, branchId, details) {
    return new PreviewLineRefreshError(message, nodeId, branchId, details);
  }

  /**
   * 创建分流管理错误
   */
  static createBranchFlowError(message, sourceNodeId, branchId, endpointNodeId) {
    return new BranchFlowError(message, sourceNodeId, branchId, endpointNodeId);
  }
}

/**
 * 错误处理器
 */
export class ErrorHandler {
  constructor() {
    this.errorLog = [];
    this.maxLogSize = 1000;
  }

  /**
   * 处理错误
   */
  handleError(error, context = {}) {
    const errorInfo = {
      error: error.toJSON ? error.toJSON() : {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      context,
      timestamp: Date.now()
    };

    this.errorLog.push(errorInfo);
    
    // 保持日志大小在限制内
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(-this.maxLogSize);
    }

    // 根据错误类型进行不同的处理
    this.processError(error, context);

    return errorInfo;
  }

  /**
   * 处理特定类型的错误
   */
  processError(error, context) {
    console.error(`❌ [错误处理] ${error.name}: ${error.message}`, {
      nodeId: error.nodeId,
      context,
      details: error.details
    });

    // 根据错误类型执行特定的处理逻辑
    switch (error.name) {
      case 'CoordinateCalculationError':
        this.handleCalculationError(error, context);
        break;
      case 'PositionApplicationError':
        this.handlePositionError(error, context);
        break;
      case 'CoordinateValidationError':
        this.handleValidationError(error, context);
        break;
      case 'AnomalyDetectionError':
        this.handleAnomalyError(error, context);
        break;
      case 'PreviewLineRefreshError':
        this.handlePreviewLineError(error, context);
        break;
      case 'BranchFlowError':
        this.handleBranchFlowError(error, context);
        break;
      default:
        this.handleGenericError(error, context);
    }
  }

  /**
   * 处理计算错误
   */
  handleCalculationError(error, context) {
    // 可以在这里添加特定的恢复逻辑
    console.warn(`⚠️ [错误处理] 坐标计算错误，节点: ${error.nodeId}`);
  }

  /**
   * 处理位置应用错误
   */
  handlePositionError(error, context) {
    console.warn(`⚠️ [错误处理] 位置应用错误，节点: ${error.nodeId}, 位置: ${JSON.stringify(error.position)}`);
  }

  /**
   * 处理验证错误
   */
  handleValidationError(error, context) {
    console.warn(`⚠️ [错误处理] 坐标验证错误，节点: ${error.nodeId}, 规则: ${error.validationRule}`);
  }

  /**
   * 处理异常检测错误
   */
  handleAnomalyError(error, context) {
    console.warn(`⚠️ [错误处理] 异常检测错误，节点: ${error.nodeId}, 类型: ${error.anomalyType}`);
  }

  /**
   * 处理预览线刷新错误
   */
  handlePreviewLineError(error, context) {
    console.warn(`⚠️ [错误处理] 预览线刷新错误，节点: ${error.nodeId}, 分支: ${error.branchId}`);
  }

  /**
   * 处理分流管理错误
   */
  handleBranchFlowError(error, context) {
    console.warn(`⚠️ [错误处理] 分流管理错误，源节点: ${error.nodeId}, 分支: ${error.branchId}, 端点: ${error.endpointNodeId}`);
  }

  /**
   * 处理通用错误
   */
  handleGenericError(error, context) {
    console.warn(`⚠️ [错误处理] 未知错误类型: ${error.name}`);
  }

  /**
   * 获取错误统计
   */
  getErrorStatistics() {
    const stats = {};
    
    this.errorLog.forEach(entry => {
      const errorName = entry.error.name;
      stats[errorName] = (stats[errorName] || 0) + 1;
    });

    return {
      totalErrors: this.errorLog.length,
      errorTypes: stats,
      recentErrors: this.errorLog.slice(-10)
    };
  }

  /**
   * 清理错误日志
   */
  clearErrorLog() {
    this.errorLog = [];
  }
}

// 创建全局错误处理器实例
export const globalErrorHandler = new ErrorHandler();