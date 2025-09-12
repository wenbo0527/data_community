import request from '@/utils/request'

/**
 * 数据模型管理API
 */

// 获取数据模型列表
export function getDataModelsList(params) {
  return request({
    url: '/api/data-models',
    method: 'get',
    params
  })
}

// 获取数据模型详情
export function getDataModelDetail(id) {
  return request({
    url: `/api/data-models/${id}`,
    method: 'get'
  })
}

// 创建数据模型
export function createDataModel(data) {
  return request({
    url: '/api/data-models',
    method: 'post',
    data
  })
}

// 更新数据模型
export function updateDataModel(id, data) {
  return request({
    url: `/api/data-models/${id}`,
    method: 'put',
    data
  })
}

// 删除数据模型
export function deleteDataModel(id) {
  return request({
    url: `/api/data-models/${id}`,
    method: 'delete'
  })
}

// 复制数据模型
export function copyDataModel(id) {
  return request({
    url: `/api/data-models/${id}/copy`,
    method: 'post'
  })
}

// 上线数据模型
export function publishDataModel(id) {
  return request({
    url: `/api/data-models/${id}/publish`,
    method: 'post'
  })
}

// 归档数据模型
export function archiveDataModel(id) {
  return request({
    url: `/api/data-models/${id}/archive`,
    method: 'post'
  })
}

// 执行数据模型
export function executeDataModel(id, parameters = {}) {
  return request({
    url: `/api/data-models/${id}/execute`,
    method: 'post',
    data: { parameters }
  })
}

// 获取执行历史
export function getExecutionHistory(id, params) {
  return request({
    url: `/api/data-models/${id}/executions`,
    method: 'get',
    params
  })
}

// 保存草稿
export function saveDraft(id, data) {
  const draftData = {
    ...data,
    status: 'draft'
  }
  
  if (id) {
    return updateDataModel(id, draftData)
  } else {
    return createDataModel(draftData)
  }
}

// 发布模型
export function publishModel(id, data) {
  const publishData = {
    ...data,
    status: 'active'
  }
  
  return updateDataModel(id, publishData)
}

// 获取版本历史
export function getVersionHistory(id) {
  return request({
    url: `/api/data-models/${id}/versions`,
    method: 'get'
  })
}

// 创建新版本
export function createNewVersion(id, data) {
  return request({
    url: `/api/data-models/${id}/versions`,
    method: 'post',
    data
  })
}

// 版本回滚
export function rollbackToVersion(id, version) {
  return request({
    url: `/api/data-models/${id}/versions/${version}/rollback`,
    method: 'post'
  })
}

// 获取版本对比
export function getVersionComparison(id, leftVersion, rightVersion) {
  return request({
    url: `/api/data-models/${id}/versions/compare`,
    method: 'get',
    params: {
      left: leftVersion,
      right: rightVersion
    }
  })
}

// 导出别名函数以保持兼容性
export const getDataModels = getDataModelsList
export const createVersion = createNewVersion
export const rollbackVersion = rollbackToVersion