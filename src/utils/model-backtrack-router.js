/**
 * 模型回溯路由工具函数
 * 统一管理模型回溯相关的路由跳转，解耦模块间依赖
 */

/**
 * 模型回溯路由路径常量
 */
export const MODEL_BACKTRACK_ROUTES = {
  // 离线模块基础路径
  BASE: '/offline-model/model-backtrack',
  // 列表页
  LIST: '/offline-model/model-backtrack',
  // 创建页
  CREATE: '/offline-model/model-backtrack/create',
  // 详情页
  DETAIL: '/offline-model/model-backtrack/detail',
  // 报告页（详情页的报告标签）
  REPORT: '/offline-model/model-backtrack/detail'
}

/**
 * 路由查询参数常量
 */
export const MODEL_BACKTRACK_QUERY = {
  // 创建模式：single（单次）| periodic（周期）
  MODE: 'mode',
  // 跳转来源：risk（风险域）| offline（离线模块）
  SOURCE: 'source',
  // 默认标签页：config | progress | result | report
  TAB: 'tab'
}

/**
 * 创建模式枚举
 */
export const CREATE_MODES = {
  SINGLE: 'single',
  PERIODIC: 'periodic'
}

/**
 * 标签页枚举
 */
export const DETAIL_TABS = {
  CONFIG: 'config',
  PROGRESS: 'progress', 
  RESULT: 'result',
  REPORT: 'report'
}

/**
 * 跳转到模型回溯列表页
 * @param {Object} router - Vue Router 实例
 * @param {Object} options - 跳转选项
 * @param {string} options.source - 来源模块
 */
export function navigateToBacktrackList(router, options = {}) {
  const query = {}
  if (options.source) {
    query[MODEL_BACKTRACK_QUERY.SOURCE] = options.source
  }
  
  router.push({
    path: MODEL_BACKTRACK_ROUTES.LIST,
    query
  })
}

/**
 * 跳转到模型回溯创建页
 * @param {Object} router - Vue Router 实例
 * @param {Object} options - 跳转选项
 * @param {string} options.mode - 创建模式（single|periodic）
 * @param {string} options.source - 来源模块
 */
export function navigateToBacktrackCreate(router, options = {}) {
  const query = {}
  if (options.mode) {
    query[MODEL_BACKTRACK_QUERY.MODE] = options.mode
  }
  if (options.source) {
    query[MODEL_BACKTRACK_QUERY.SOURCE] = options.source
  }
  
  router.push({
    path: MODEL_BACKTRACK_ROUTES.CREATE,
    query
  })
}

/**
 * 跳转到模型回溯详情页
 * @param {Object} router - Vue Router 实例
 * @param {string} id - 回溯任务ID
 * @param {Object} options - 跳转选项
 * @param {string} options.tab - 默认标签页
 * @param {string} options.source - 来源模块
 */
export function navigateToBacktrackDetail(router, id, options = {}) {
  const query = {}
  if (options.tab) {
    query[MODEL_BACKTRACK_QUERY.TAB] = options.tab
  }
  if (options.source) {
    query[MODEL_BACKTRACK_QUERY.SOURCE] = options.source
  }
  
  router.push({
    path: `${MODEL_BACKTRACK_ROUTES.DETAIL}/${id}`,
    query
  })
}

/**
 * 跳转到模型回溯报告页（详情页的报告标签）
 * @param {Object} router - Vue Router 实例
 * @param {string} id - 回溯任务ID
 * @param {Object} options - 跳转选项
 * @param {string} options.source - 来源模块
 */
export function navigateToBacktrackReport(router, id, options = {}) {
  return navigateToBacktrackDetail(router, id, {
    ...options,
    tab: DETAIL_TABS.REPORT
  })
}

/**
 * 获取路由参数
 * @param {Object} route - 当前路由对象
 * @returns {Object} 解析后的参数
 */
export function getBacktrackRouteParams(route) {
  return {
    mode: route.query[MODEL_BACKTRACK_QUERY.MODE],
    source: route.query[MODEL_BACKTRACK_QUERY.SOURCE],
    tab: route.query[MODEL_BACKTRACK_QUERY.TAB]
  }
}

/**
 * 判断是否为风险域模块来源
 * @param {Object} route - 当前路由对象
 * @returns {boolean}
 */
export function isFromRiskModule(route) {
  return route.query[MODEL_BACKTRACK_QUERY.SOURCE] === 'risk'
}

/**
 * 判断是否为离线模块来源
 * @param {Object} route - 当前路由对象
 * @returns {boolean}
 */
export function isFromOfflineModule(route) {
  return route.query[MODEL_BACKTRACK_QUERY.SOURCE] === 'offline'
}