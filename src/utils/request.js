/**
 * HTTP 请求工具函数
 * 用于纯前端 demo，模拟 API 请求
 */

import { mockDataModels } from '@/mock/data-models'

/**
 * 模拟延迟
 * @param {number} ms 延迟毫秒数
 * @returns {Promise}
 */
function delay(ms = 300) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 模拟 HTTP 请求
 * @param {Object} config 请求配置
 * @param {string} config.url 请求 URL
 * @param {string} config.method 请求方法
 * @param {Object} config.params 查询参数
 * @param {Object} config.data 请求数据
 * @returns {Promise} 请求结果
 */
export default async function request(config) {
  const { url, method = 'GET', params = {}, data = {} } = config
  
  // 模拟网络延迟
  await delay()
  
  try {
    // 根据 URL 路径匹配对应的 mock 数据
    if (url.includes('/api/data-models')) {
      return handleDataModelsAPI(url, method, params, data)
    }
    
    // 默认返回成功响应
    return {
      code: 200,
      message: 'success',
      data: null
    }
  } catch (error) {
    // 模拟错误响应
    return Promise.reject({
      code: 500,
      message: error.message || '请求失败',
      data: null
    })
  }
}

/**
 * 处理数据模型相关 API
 * @param {string} url 请求 URL
 * @param {string} method 请求方法
 * @param {Object} params 查询参数
 * @param {Object} data 请求数据
 * @returns {Object} 响应数据
 */
function handleDataModelsAPI(url, method, params, data) {
  const upperMethod = method.toUpperCase()
  
  // 获取列表
  if (url === '/api/data-models' && upperMethod === 'GET') {
    const { page = 1, pageSize = 10, name, scenario, status } = params
    let list = [...mockDataModels]
    
    // 过滤
    if (name) {
      list = list.filter(item => item.name.includes(name))
    }
    if (scenario) {
      list = list.filter(item => item.scenario === scenario)
    }
    if (status) {
      list = list.filter(item => item.status === status)
    }
    
    // 分页
    const total = list.length
    const start = (page - 1) * pageSize
    const end = start + pageSize
    const records = list.slice(start, end)
    
    return {
      code: 200,
      message: 'success',
      data: {
        records,
        total,
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      }
    }
  }
  
  // 获取详情
  if (url.match(/\/api\/data-models\/\d+$/) && upperMethod === 'GET') {
    const id = parseInt(url.split('/').pop())
    const model = mockDataModels.find(item => item.id === id)
    
    if (!model) {
      throw new Error('数据模型不存在')
    }
    
    return {
      code: 200,
      message: 'success',
      data: model
    }
  }
  
  // 创建
  if (url === '/api/data-models' && upperMethod === 'POST') {
    const newModel = {
      id: Date.now(),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    mockDataModels.push(newModel)
    
    return {
      code: 200,
      message: '创建成功',
      data: newModel
    }
  }
  
  // 更新
  if (url.match(/\/api\/data-models\/\d+$/) && upperMethod === 'PUT') {
    const id = parseInt(url.split('/').pop())
    const index = mockDataModels.findIndex(item => item.id === id)
    
    if (index === -1) {
      throw new Error('数据模型不存在')
    }
    
    mockDataModels[index] = {
      ...mockDataModels[index],
      ...data,
      updatedAt: new Date().toISOString()
    }
    
    return {
      code: 200,
      message: '更新成功',
      data: mockDataModels[index]
    }
  }
  
  // 删除
  if (url.match(/\/api\/data-models\/\d+$/) && upperMethod === 'DELETE') {
    const id = parseInt(url.split('/').pop())
    const index = mockDataModels.findIndex(item => item.id === id)
    
    if (index === -1) {
      throw new Error('数据模型不存在')
    }
    
    mockDataModels.splice(index, 1)
    
    return {
      code: 200,
      message: '删除成功',
      data: null
    }
  }
  
  // 执行模型
  if (url.match(/\/api\/data-models\/\d+\/execute$/) && upperMethod === 'POST') {
    const id = parseInt(url.split('/')[3])
    const model = mockDataModels.find(item => item.id === id)
    
    if (!model) {
      throw new Error('数据模型不存在')
    }
    
    // 模拟执行结果
    const result = {
      executionId: Date.now(),
      modelId: id,
      status: 'success',
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 2000).toISOString(),
      result: {
        rows: 100,
        columns: ['id', 'name', 'value'],
        data: [
          { id: 1, name: '示例数据1', value: 100 },
          { id: 2, name: '示例数据2', value: 200 }
        ]
      }
    }
    
    return {
      code: 200,
      message: '执行成功',
      data: result
    }
  }
  
  // 获取执行历史
  if (url.match(/\/api\/data-models\/\d+\/executions$/) && upperMethod === 'GET') {
    const id = parseInt(url.split('/')[3])
    
    // 模拟执行历史
    const executions = [
      {
        id: 1,
        modelId: id,
        status: 'success',
        startTime: '2024-01-15 10:30:00',
        endTime: '2024-01-15 10:30:05',
        duration: 5000,
        resultRows: 150
      },
      {
        id: 2,
        modelId: id,
        status: 'failed',
        startTime: '2024-01-14 15:20:00',
        endTime: '2024-01-14 15:20:03',
        duration: 3000,
        error: 'SQL语法错误'
      }
    ]
    
    return {
      code: 200,
      message: 'success',
      data: executions
    }
  }
  
  throw new Error('API 接口不存在')
}