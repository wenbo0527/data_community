/**
 * 布局相关类型定义
 * 提供统一布局引擎中布局相关的类型约束和文档
 */

/**
 * 布局算法类型枚举
 * @typedef {string} LayoutAlgorithmType
 */
export const LayoutAlgorithmType = {
  /** 分层布局算法 */
  HIERARCHICAL: 'hierarchical',
  /** 自底向上布局算法 */
  BOTTOM_UP: 'bottom_up',
  /** 力导向布局算法 */
  FORCE_DIRECTED: 'force_directed',
  /** 网格布局算法 */
  GRID: 'grid',
  /** 圆形布局算法 */
  CIRCULAR: 'circular',
  /** 树形布局算法 */
  TREE: 'tree'
};

/**
 * 布局方向枚举
 * @typedef {string} LayoutDirection
 */
export const LayoutDirection = {
  /** 从上到下 */
  TOP_TO_BOTTOM: 'TB',
  /** 从下到上 */
  BOTTOM_TO_TOP: 'BT',
  /** 从左到右 */
  LEFT_TO_RIGHT: 'LR',
  /** 从右到左 */
  RIGHT_TO_LEFT: 'RL'
};

/**
 * 布局状态枚举
 * @typedef {string} LayoutStatus
 */
export const LayoutStatus = {
  /** 初始化状态 */
  INITIALIZING: 'initializing',
  /** 计算中 */
  CALCULATING: 'calculating',
  /** 应用中 */
  APPLYING: 'applying',
  /** 完成 */
  COMPLETED: 'completed',
  /** 错误 */
  ERROR: 'error',
  /** 已取消 */
  CANCELLED: 'cancelled'
};

/**
 * 坐标点类型定义
 * @typedef {Object} Point
 * @property {number} x - X坐标
 * @property {number} y - Y坐标
 */
export const PointType = {
  x: 'number',
  y: 'number'
};

/**
 * 尺寸类型定义
 * @typedef {Object} Size
 * @property {number} width - 宽度
 * @property {number} height - 高度
 */
export const SizeType = {
  width: 'number',
  height: 'number'
};

/**
 * 边界框类型定义
 * @typedef {Object} BoundingBox
 * @property {number} x - 左上角X坐标
 * @property {number} y - 左上角Y坐标
 * @property {number} width - 宽度
 * @property {number} height - 高度
 * @property {number} centerX - 中心点X坐标
 * @property {number} centerY - 中心点Y坐标
 */
export const BoundingBoxType = {
  x: 'number',
  y: 'number',
  width: 'number',
  height: 'number',
  centerX: 'number',
  centerY: 'number'
};

/**
 * 布局层级类型定义
 * @typedef {Object} LayoutLayer
 * @property {number} index - 层级索引
 * @property {string[]} nodeIds - 该层级包含的节点ID列表
 * @property {number} y - 层级Y坐标
 * @property {number} height - 层级高度
 * @property {Object} bounds - 层级边界
 * @property {number} bounds.minX - 最小X坐标
 * @property {number} bounds.maxX - 最大X坐标
 * @property {number} bounds.centerX - 中心X坐标
 */
export const LayoutLayerType = {
  index: 'number',
  nodeIds: 'string[]',
  y: 'number',
  height: 'number',
  bounds: {
    minX: 'number',
    maxX: 'number',
    centerX: 'number'
  }
};

/**
 * 布局结果类型定义
 * @typedef {Object} LayoutResult
 * @property {string} id - 布局结果ID
 * @property {LayoutStatus} status - 布局状态
 * @property {Object.<string, Point>} nodePositions - 节点位置映射
 * @property {LayoutLayer[]} layers - 层级信息
 * @property {BoundingBox} bounds - 整体边界
 * @property {Object} metadata - 元数据
 * @property {number} metadata.duration - 计算耗时(ms)
 * @property {string} metadata.algorithm - 使用的算法
 * @property {number} metadata.nodeCount - 节点数量
 * @property {number} metadata.edgeCount - 边数量
 * @property {Date} metadata.timestamp - 计算时间戳
 * @property {string|null} error - 错误信息
 */
export const LayoutResultType = {
  id: 'string',
  status: 'LayoutStatus',
  nodePositions: 'Object.<string, Point>',
  layers: 'LayoutLayer[]',
  bounds: 'BoundingBox',
  metadata: {
    duration: 'number',
    algorithm: 'string',
    nodeCount: 'number',
    edgeCount: 'number',
    timestamp: 'Date'
  },
  error: 'string|null'
};

/**
 * 布局约束类型定义
 * @typedef {Object} LayoutConstraints
 * @property {Object} spacing - 间距约束
 * @property {number} spacing.node - 节点间距
 * @property {number} spacing.layer - 层级间距
 * @property {number} spacing.edge - 边间距
 * @property {Object} alignment - 对齐约束
 * @property {string} alignment.horizontal - 水平对齐方式
 * @property {string} alignment.vertical - 垂直对齐方式
 * @property {Object} bounds - 边界约束
 * @property {number} bounds.minWidth - 最小宽度
 * @property {number} bounds.maxWidth - 最大宽度
 * @property {number} bounds.minHeight - 最小高度
 * @property {number} bounds.maxHeight - 最大高度
 * @property {boolean} preventOverlap - 是否防止重叠
 * @property {boolean} maintainAspectRatio - 是否保持宽高比
 */
export const LayoutConstraintsType = {
  spacing: {
    node: 'number',
    layer: 'number',
    edge: 'number'
  },
  alignment: {
    horizontal: 'string',
    vertical: 'string'
  },
  bounds: {
    minWidth: 'number',
    maxWidth: 'number',
    minHeight: 'number',
    maxHeight: 'number'
  },
  preventOverlap: 'boolean',
  maintainAspectRatio: 'boolean'
};

/**
 * 布局上下文类型定义
 * @typedef {Object} LayoutContext
 * @property {string} sessionId - 会话ID
 * @property {LayoutAlgorithmType} algorithm - 布局算法
 * @property {LayoutDirection} direction - 布局方向
 * @property {LayoutConstraints} constraints - 布局约束
 * @property {Object} options - 布局选项
 * @property {boolean} options.enableCache - 是否启用缓存
 * @property {boolean} options.enableAnimation - 是否启用动画
 * @property {boolean} options.enableOptimization - 是否启用优化
 * @property {number} options.maxIterations - 最大迭代次数
 * @property {number} options.tolerance - 容差值
 * @property {Object} viewport - 视口信息
 * @property {number} viewport.width - 视口宽度
 * @property {number} viewport.height - 视口高度
 * @property {number} viewport.zoom - 缩放比例
 * @property {Point} viewport.center - 视口中心点
 */
export const LayoutContextType = {
  sessionId: 'string',
  algorithm: 'LayoutAlgorithmType',
  direction: 'LayoutDirection',
  constraints: 'LayoutConstraints',
  options: {
    enableCache: 'boolean',
    enableAnimation: 'boolean',
    enableOptimization: 'boolean',
    maxIterations: 'number',
    tolerance: 'number'
  },
  viewport: {
    width: 'number',
    height: 'number',
    zoom: 'number',
    center: 'Point'
  }
};

/**
 * 布局变更类型定义
 * @typedef {Object} LayoutChange
 * @property {string} type - 变更类型
 * @property {string} nodeId - 节点ID
 * @property {Point} oldPosition - 旧位置
 * @property {Point} newPosition - 新位置
 * @property {Object} metadata - 变更元数据
 * @property {Date} timestamp - 变更时间戳
 */
export const LayoutChangeType = {
  type: 'string',
  nodeId: 'string',
  oldPosition: 'Point',
  newPosition: 'Point',
  metadata: 'Object',
  timestamp: 'Date'
};

/**
 * 布局历史记录类型定义
 * @typedef {Object} LayoutHistory
 * @property {string} id - 历史记录ID
 * @property {LayoutResult} result - 布局结果
 * @property {LayoutChange[]} changes - 变更列表
 * @property {Date} createdAt - 创建时间
 * @property {string} description - 描述信息
 */
export const LayoutHistoryType = {
  id: 'string',
  result: 'LayoutResult',
  changes: 'LayoutChange[]',
  createdAt: 'Date',
  description: 'string'
};

/**
 * 类型验证工具函数
 */
export class LayoutTypeValidator {
  /**
   * 验证点坐标
   * @param {*} point - 待验证的点
   * @returns {boolean} 是否有效
   */
  static isValidPoint(point) {
    return point && 
           typeof point.x === 'number' && 
           typeof point.y === 'number' &&
           !isNaN(point.x) && 
           !isNaN(point.y);
  }

  /**
   * 验证尺寸
   * @param {*} size - 待验证的尺寸
   * @returns {boolean} 是否有效
   */
  static isValidSize(size) {
    return size && 
           typeof size.width === 'number' && 
           typeof size.height === 'number' &&
           size.width >= 0 && 
           size.height >= 0;
  }

  /**
   * 验证边界框
   * @param {*} bbox - 待验证的边界框
   * @returns {boolean} 是否有效
   */
  static isValidBoundingBox(bbox) {
    return bbox &&
           typeof bbox.x === 'number' &&
           typeof bbox.y === 'number' &&
           typeof bbox.width === 'number' &&
           typeof bbox.height === 'number' &&
           bbox.width >= 0 &&
           bbox.height >= 0;
  }

  /**
   * 验证布局状态
   * @param {*} status - 待验证的状态
   * @returns {boolean} 是否有效
   */
  static isValidLayoutStatus(status) {
    return Object.values(LayoutStatus).includes(status);
  }

  /**
   * 验证布局算法类型
   * @param {*} algorithm - 待验证的算法类型
   * @returns {boolean} 是否有效
   */
  static isValidLayoutAlgorithm(algorithm) {
    return Object.values(LayoutAlgorithmType).includes(algorithm);
  }

  /**
   * 验证布局方向
   * @param {*} direction - 待验证的方向
   * @returns {boolean} 是否有效
   */
  static isValidLayoutDirection(direction) {
    return Object.values(LayoutDirection).includes(direction);
  }
}

/**
 * 默认导出所有类型定义
 */
export default {
  LayoutAlgorithmType,
  LayoutDirection,
  LayoutStatus,
  PointType,
  SizeType,
  BoundingBoxType,
  LayoutLayerType,
  LayoutResultType,
  LayoutConstraintsType,
  LayoutContextType,
  LayoutChangeType,
  LayoutHistoryType,
  LayoutTypeValidator
};