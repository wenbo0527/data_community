import request from '@/utils/request'

/**
 * 获取特征列表
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export function getFeatures(params) {
  return request({
    url: '/api/features',
    method: 'get',
    params
  })
}

/**
 * 获取特征详情
 * @param {string} id - 特征ID
 * @returns {Promise}
 */
export function getFeatureDetail(id) {
  return request({
    url: `/api/features/${id}`,
    method: 'get'
  })
}

/**
 * 创建特征
 * @param {Object} data - 特征数据
 * @returns {Promise}
 */
export function createFeature(data) {
  return request({
    url: '/api/features',
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
export function updateFeature(id, data) {
  return request({
    url: `/api/features/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除特征
 * @param {string} id - 特征ID
 * @returns {Promise}
 */
export function deleteFeature(id) {
  return request({
    url: `/api/features/${id}`,
    method: 'delete'
  })
}
