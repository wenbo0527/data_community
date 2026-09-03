import request from '@/utils/request'

/**
 * 获取特征列表
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
 * 获取特征详情
 * @param {string} id - 特征ID
 * @returns {Promise}
 */
export function getVariableDetail(id) {
  return request({
    url: `/api/variables/${id}`,
    method: 'get'
  })
}

/**
 * 创建特征
 * @param {Object} data - 特征数据
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
 * 更新特征
 * @param {string} id - 特征ID
 * @param {Object} data - 特征数据
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
 * 删除特征
 * @param {string} id - 特征ID
 * @returns {Promise}
 */
export function deleteVariable(id) {
  return request({
    url: `/api/variables/${id}`,
    method: 'delete'
  })
}

/**
 * 更新特征状态
 * @param {string} id - 特征ID
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
 * 获取特征统计信息
 * @returns {Promise}
 */
export function getVariableStats() {
  return request({
    url: '/api/variables/stats',
    method: 'get'
  })
}

/**
 * 导出特征清单
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
 * 获取特征使用场景
 * @param {string} variableId - 特征ID
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
 * 获取特征版本历史
 * @param {string} variableId - 特征ID
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
