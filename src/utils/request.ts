/**
 * HTTP 请求工具函数
 * 用于纯前端 demo，模拟 API 请求
 */

import { mockDataModels, DataModelStatus } from '@/mock/data-models'

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
    const { page = 1, pageSize = 10, name, useCase, status, language } = params
    let list = [...mockDataModels]
    
    // 过滤
    if (name) {
      list = list.filter(item => item.name.includes(name))
    }
    if (useCase) {
      list = list.filter(item => item.useCase === useCase)
    }
    if (status) {
      list = list.filter(item => item.status === status)
    }
    if (language) {
      list = list.filter(item => item.language === language)
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
        list: records,
        total,
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      }
    }
  }
  
  // 获取详情
  if (url.match(/\/api\/data-models\/[^/]+$/) && upperMethod === 'GET') {
    const id = url.split('/').pop()
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
  if (url.match(/\/api\/data-models\/[^/]+$/) && upperMethod === 'PUT') {
    const id = url.split('/').pop()
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
  if (url.match(/\/api\/data-models\/[^/]+$/) && upperMethod === 'DELETE') {
    const id = url.split('/').pop()
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
  if (url.match(/\/api\/data-models\/[^/]+\/execute$/) && upperMethod === 'POST') {
    const id = url.split('/')[3]
    const model = mockDataModels.find(item => item.id === id)
    
    if (!model) {
      throw new Error('数据模型不存在')
    }
    
    // 根据模型ID返回相应的mock数据
    let resultData = []
    let columns = []
    
    if (id === 'dm_001') {
      // 客户级历史授信状态切片数据
      columns = [
        'customer_id', 'credit_limit', 'used_amount', 'utilization_rate', 
        'overdue_days', 'risk_level', 'last_update_date', 'id_card', 
        'customer_name', 'overdue_status'
      ]
      resultData = [
        {
          customer_id: 'CUST_001',
          credit_limit: 100000,
          used_amount: 45000,
          utilization_rate: 45.00,
          overdue_days: 0,
          risk_level: 'A',
          last_update_date: '2024-03-20',
          id_card: '110101199001011234',
          customer_name: '张伟',
          overdue_status: '正常'
        },
        {
          customer_id: 'CUST_001',
          credit_limit: 80000,
          used_amount: 52000,
          utilization_rate: 65.00,
          overdue_days: 5,
          risk_level: 'B',
          last_update_date: '2024-02-15',
          id_card: '110101199001011234',
          customer_name: '张伟',
          overdue_status: '轻微逾期'
        }
      ]
    } else if (id === 'dm_002') {
      // 客户授信明细数据查询
      columns = [
        'application_id', 'customer_id', 'customer_name', 'application_date',
        'requested_amount', 'approved_amount', 'application_status', 'approval_date'
      ]
      resultData = [
        {
          application_id: 'APP_001',
          customer_id: 'CUST_001',
          customer_name: '张伟',
          application_date: '2024-01-15',
          requested_amount: 100000,
          approved_amount: 80000,
          application_status: '已批准',
          approval_date: '2024-01-20'
        }
      ]
    } else {
      // 默认数据
      columns = ['id', 'name', 'value']
      resultData = [
        { id: 1, name: '示例数据1', value: 100 },
        { id: 2, name: '示例数据2', value: 200 }
      ]
    }
    
    const result = {
      executionId: Date.now(),
      modelId: id,
      status: 'success',
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 2000).toISOString(),
      result: {
        rows: resultData.length,
        columns: columns,
        data: resultData
      }
    }
    
    return {
      code: 200,
      message: '执行成功',
      data: result
    }
  }
  
  // 复制模型
  if (url.match(/\/api\/data-models\/[^/]+\/copy$/) && upperMethod === 'POST') {
    const id = url.split('/')[3]
    const originalModel = mockDataModels.find(item => item.id === id)
    
    if (!originalModel) {
      throw new Error('数据模型不存在')
    }
    
    const copiedModel = {
      ...originalModel,
      id: `dm_${Date.now()}`,
      name: `${originalModel.name}_副本`,
      status: DataModelStatus.DRAFT,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    mockDataModels.push(copiedModel)
    
    return {
      code: 200,
      message: '复制成功',
      data: copiedModel
    }
  }
  
  // 获取执行历史
  if (url.match(/\/api\/data-models\/[^/]+\/executions$/) && upperMethod === 'GET') {
    const id = url.split('/')[3]
    
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
  
  // 获取版本历史
  if (url.match(/\/api\/data-models\/[^/]+\/versions$/) && upperMethod === 'GET') {
    const id = url.split('/')[3]
    
    // 模拟版本历史数据
    const versions = [
      {
        version: 'v1.2.0',
        isCurrent: true,
        createdAt: '2024-01-15T10:30:00Z',
        createdBy: '张三',
        description: '优化查询性能，修复数据统计bug'
      },
      {
        version: 'v1.1.0',
        isCurrent: false,
        createdAt: '2024-01-10T14:20:00Z',
        createdBy: '李四',
        description: '新增数据验证功能'
      },
      {
        version: 'v1.0.0',
        isCurrent: false,
        createdAt: '2024-01-01T09:00:00Z',
        createdBy: '王五',
        description: '初始版本发布'
      }
    ]
    
    return {
      code: 200,
      message: 'success',
      data: versions
    }
  }
  
  // 创建新版本
  if (url.match(/\/api\/data-models\/[^/]+\/versions$/) && upperMethod === 'POST') {
    const id = url.split('/')[3]
    
    const newVersion = {
      version: `v1.${Date.now() % 100}.0`,
      isCurrent: true,
      createdAt: new Date().toISOString(),
      createdBy: '当前用户',
      description: data.description || '新版本'
    }
    
    return {
      code: 200,
      message: '版本创建成功',
      data: newVersion
    }
  }
  
  // 版本回滚
  if (url.match(/\/api\/data-models\/[^/]+\/versions\/[^/]+\/rollback$/) && upperMethod === 'POST') {
    const id = url.split('/')[3]
    const version = url.split('/')[5]
    
    return {
      code: 200,
      message: `已回滚到版本 ${version}`,
      data: { version, rollbackTime: new Date().toISOString() }
    }
  }
  
  // 获取版本对比
  if (url.match(/\/api\/data-models\/[^/]+\/versions\/compare$/) && upperMethod === 'GET') {
    const id = url.split('/')[3]
    const { left, right } = params
    
    // 模拟版本对比数据
    const comparisonData = {
      left: `-- 版本 ${left} 代码\nSELECT * FROM users WHERE status = 'active';\n-- 查询活跃用户`,
      right: `-- 版本 ${right} 代码\nSELECT id, name, email FROM users WHERE status = 'active' AND created_at > '2024-01-01';\n-- 查询2024年后的活跃用户`
    }
    
    return {
      code: 200,
      message: 'success',
      data: comparisonData
    }
  }
  
  // 上线数据模型
  if (url.match(/\/api\/data-models\/[^/]+\/publish$/) && upperMethod === 'POST') {
    const id = url.split('/')[3]
    const index = mockDataModels.findIndex(item => item.id === id)
    
    if (index === -1) {
      throw new Error('数据模型不存在')
    }
    
    mockDataModels[index].status = DataModelStatus.ACTIVE
    mockDataModels[index].updatedAt = new Date().toISOString()
    
    return {
      code: 200,
      message: '模型上线成功',
      data: mockDataModels[index]
    }
  }
  
  // 归档数据模型
  if (url.match(/\/api\/data-models\/[^/]+\/archive$/) && upperMethod === 'POST') {
    const id = url.split('/')[3]
    const index = mockDataModels.findIndex(item => item.id === id)
    
    if (index === -1) {
      throw new Error('数据模型不存在')
    }
    
    mockDataModels[index].status = DataModelStatus.ARCHIVED
    mockDataModels[index].updatedAt = new Date().toISOString()
    
    return {
      code: 200,
      message: '模型归档成功',
      data: mockDataModels[index]
    }
  }
  
  throw new Error('API 接口不存在')
}