import request from '@/utils/request'

/**
 * 获取变量列表
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export function getVariableList(params) {
  return request({
    url: '/api/variables',
    method: 'get',
    params
  })
}

/**
 * 获取变量详情
 * @param {string} id - 变量ID
 * @returns {Promise}
 */
export function getVariableDetail(id) {
  return request({
    url: `/api/variables/${id}`,
    method: 'get'
  })
}

/**
 * 创建变量
 * @param {Object} data - 变量数据
 * @returns {Promise}
 */
export function createVariable(data) {
  return request({
    url: '/api/variables',
    method: 'post',
    data
  })
}

/**
 * 更新变量
 * @param {string} id - 变量ID
 * @param {Object} data - 变量数据
 * @returns {Promise}
 */
export function updateVariable(id, data) {
  return request({
    url: `/api/variables/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除变量
 * @param {string} id - 变量ID
 * @returns {Promise}
 */
export function deleteVariable(id) {
  return request({
    url: `/api/variables/${id}`,
    method: 'delete'
  })
}

/**
 * 更新变量状态
 * @param {string} id - 变量ID
 * @param {string} status - 新状态
 * @returns {Promise}
 */
export function updateVariableStatus(id, status) {
  return request({
    url: `/api/variables/${id}/status`,
    method: 'patch',
    data: { status }
  })
}

/**
 * 获取变量统计信息
 * @returns {Promise}
 */
export function getVariableStats() {
  return request({
    url: '/api/variables/stats',
    method: 'get'
  })
}

/**
 * 导出变量清单
 * @param {Object} params - 导出参数
 * @returns {Promise}
 */
export function exportVariableList(params) {
  return request({
    url: '/api/variables/export',
    method: 'get',
    params,
    responseType: 'blob'
  })
}

export function batchImportVariables(records) {
  return request({
    url: '/api/variables/batch-import',
    method: 'post',
    data: { records }
  })
}

export function incrementalImportVariables(records) {
  return request({
    url: '/api/variables/incremental-import',
    method: 'post',
    data: { records }
  })
}

/**
 * 获取数据源列表
 * @returns {Promise}
 */
export function getDataSources() {
  return request({
    url: '/api/data-sources',
    method: 'get'
  })
}

/**
 * 获取变量使用场景
 * @param {string} variableId - 变量ID
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export function getVariableUsages(variableId, params) {
  return request({
    url: `/api/variables/${variableId}/usages`,
    method: 'get',
    params
  })
}

/**
 * 获取变量版本历史
 * @param {string} variableId - 变量ID
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export function getVariableVersions(variableId, params) {
  return request({
    url: `/api/variables/${variableId}/versions`,
    method: 'get',
    params
  })
}
