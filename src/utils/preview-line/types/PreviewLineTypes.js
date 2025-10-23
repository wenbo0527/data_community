/**
 * 预览线相关类型定义
 * 提供统一预览线管理器中预览线相关的类型约束和文档
 */

/**
 * 预览线状态枚举
 * @readonly
 * @enum {string}
 */
export const PreviewLineStates = {
  /** 可交互状态（节点配置完成后） */
  INTERACTIVE: 'interactive',
  /** 拖拽中状态 */
  DRAGGING: 'dragging',
  /** 已连接状态 */
  CONNECTED: 'connected',
  /** 鼠标悬停状态 */
  HOVER: 'hover',
  /** 待处理状态 */
  PENDING: 'pending',
  /** 无效状态 */
  INVALID: 'invalid'
}

/**
 * 预览线类型枚举
 * @readonly
 * @enum {string}
 */
export const PreviewLineTypes = {
  /** 统一预览线类型 */
  PREVIEW: 'preview-line',
  /** 分支预览线 */
  BRANCH: 'branch-preview-line',
  /** 单一预览线 */
  SINGLE: 'single-preview-line'
}

/**
 * 预览线创建需求类型
 * @readonly
 * @enum {string}
 */
export const CreationRequirementTypes = {
  /** 需要创建 */
  NEEDS_CREATION: 'needs_creation',
  /** 需要更新 */
  NEEDS_UPDATE: 'needs_update',
  /** 无需创建 */
  NO_CREATION: 'no_creation',
  /** 需要清理 */
  NEEDS_CLEANUP: 'needs_cleanup'
}

/**
 * 节点类型枚举
 * @readonly
 * @enum {string}
 */
export const NodeTypes = {
  /** 人群分流节点 */
  AUDIENCE_SPLIT: 'audience-split',
  /** 事件分流节点 */
  EVENT_SPLIT: 'event-split',
  /** AB测试节点 */
  AB_TEST: 'ab-test',
  /** 普通节点 */
  NORMAL: 'normal',
  /** 开始节点 */
  START: 'start',
  /** 结束节点 */
  END: 'end'
}

/**
 * 预览线实例接口
 * @typedef {Object} PreviewLineInstance
 * @property {string} id - 预览线唯一标识
 * @property {Object} line - X6图形对象
 * @property {Object} sourceNode - 源节点
 * @property {string} state - 当前状态
 * @property {string} type - 预览线类型
 * @property {Object} metadata - 元数据
 * @property {number} createdAt - 创建时间戳
 * @property {number} updatedAt - 更新时间戳
 */

/**
 * 分支预览线实例接口
 * @typedef {Object} BranchPreviewLineInstance
 * @property {string} id - 预览线唯一标识
 * @property {Object} line - X6图形对象
 * @property {Object} sourceNode - 源节点
 * @property {string} branchId - 分支ID
 * @property {string} branchLabel - 分支标签
 * @property {number} branchIndex - 分支索引
 * @property {string} state - 当前状态
 * @property {Object} metadata - 元数据
 * @property {number} createdAt - 创建时间戳
 * @property {number} updatedAt - 更新时间戳
 */

/**
 * 预览线配置接口
 * @typedef {Object} PreviewLineConfig
 * @property {boolean} enableCache - 是否启用缓存
 * @property {number} cacheTimeout - 缓存超时时间（毫秒）
 * @property {boolean} enableDebounce - 是否启用防抖
 * @property {number} debounceDelay - 防抖延迟（毫秒）
 * @property {boolean} enablePerformanceMonitor - 是否启用性能监控
 * @property {Object} renderConfig - 渲染配置
 * @property {Object} snapConfig - 吸附配置
 */

/**
 * 位置信息接口
 * @typedef {Object} Position
 * @property {number} x - X坐标
 * @property {number} y - Y坐标
 */

/**
 * 尺寸信息接口
 * @typedef {Object} Size
 * @property {number} width - 宽度
 * @property {number} height - 高度
 */

/**
 * 预览线创建需求接口
 * @typedef {Object} CreationRequirement
 * @property {boolean} needsCreation - 是否需要创建
 * @property {string} reason - 创建原因
 * @property {string} type - 需求类型
 * @property {Object} details - 详细信息
 */

/**
 * 分支分析结果接口
 * @typedef {Object} BranchAnalysis
 * @property {Array} requiredBranches - 需要的分支列表
 * @property {Array} existingBranches - 现有的分支列表
 * @property {Array} missingBranches - 缺失的分支列表
 * @property {Array} extraBranches - 多余的分支列表
 * @property {boolean} needsUpdate - 是否需要更新
 */

/**
 * 验证结果接口
 * @typedef {Object} ValidationResult
 * @property {boolean} isValid - 是否有效
 * @property {Array} errors - 错误列表
 * @property {Array} warnings - 警告列表
 * @property {Object} details - 详细信息
 */

/**
 * 性能指标接口
 * @typedef {Object} PerformanceMetrics
 * @property {number} creationTime - 创建耗时（毫秒）
 * @property {number} updateTime - 更新耗时（毫秒）
 * @property {number} renderTime - 渲染耗时（毫秒）
 * @property {number} cacheHitRate - 缓存命中率
 * @property {number} memoryUsage - 内存使用量
 */

// 导出所有类型定义
export default {
  PreviewLineStates,
  PreviewLineTypes,
  CreationRequirementTypes,
  NodeTypes
}