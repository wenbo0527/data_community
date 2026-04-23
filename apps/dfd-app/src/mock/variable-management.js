import Mock from 'mockjs'

// 变量类型
const variableTypes = ['numerical', 'categorical', 'text', 'datetime', 'boolean']
const variableTypeLabels = {
  numerical: '数值型',
  categorical: '分类型',
  text: '文本型',
  datetime: '时间型',
  boolean: '布尔型'
}

// 变量状态
const variableStatuses = ['draft', 'pending', 'active', 'inactive', 'expired']
const variableStatusLabels = {
  draft: '草稿',
  pending: '待审核',
  active: '已发布',
  inactive: '已停用',
  expired: '已过期'
}

// 数据源
const dataSources = [
  { id: 'ds_001', name: '用户基础信息表', type: 'table' },
  { id: 'ds_002', name: '订单数据表', type: 'table' },
  { id: 'ds_003', name: '行为日志表', type: 'table' },
  { id: 'ds_004', name: '风控数据表', type: 'table' },
  { id: 'ds_005', name: '营销活动表', type: 'table' }
]

// 生成变量列表数据
function generateVariableList() {
  const variables = []
  for (let i = 1; i <= 50; i++) {
    const type = Mock.Random.pick(variableTypes)
    const status = Mock.Random.pick(variableStatuses)
    const dataSource = Mock.Random.pick(dataSources)
    
    variables.push({
      id: `var_${String(i).padStart(3, '0')}`,
      name: Mock.Random.ctitle(2, 6),
      code: Mock.Random.word(3, 10).toLowerCase(),
      type: type,
      status: status,
      dataSource: dataSource.id,
      dataSourceName: dataSource.name,
      dataQuality: Mock.Random.float(80, 100, 1, 1),
      missingRate: Mock.Random.float(0, 5, 1, 1),
      creator: Mock.Random.cname(),
      createdAt: Mock.Random.datetime(),
      description: Mock.Random.csentence(10, 50)
    })
  }
  return variables
}

// 生成变量详情数据
function generateVariableDetail(id) {
  const type = Mock.Random.pick(variableTypes)
  const status = Mock.Random.pick(variableStatuses)
  const dataSource = Mock.Random.pick(dataSources)
  
  return {
    id: id,
    name: Mock.Random.ctitle(2, 6),
    code: Mock.Random.word(3, 10).toLowerCase(),
    type: type,
    status: status,
    description: Mock.Random.csentence(10, 50),
    dataSource: dataSource.id,
    dataSourceName: dataSource.name,
    sourceField: Mock.Random.word(3, 15).toLowerCase(),
    updateFrequency: Mock.Random.pick(['实时', '每小时', '每日', '每周', '每月']),
    dataQuality: Mock.Random.float(80, 100, 1, 1),
    missingRate: Mock.Random.float(0, 5, 1, 1),
    uniqueValueCount: Mock.Random.integer(10, 10000),
    definition: Mock.Random.csentence(20, 100),
    creator: Mock.Random.cname(),
    createdAt: Mock.Random.datetime(),
    updatedAt: Mock.Random.datetime()
  }
}

// 生成使用场景数据
function generateUsageScenarios(variableId, page = 1, pageSize = 10) {
  const usageTypes = ['metric', 'model', 'report', 'dashboard']
  const scenarios = []
  const total = Mock.Random.integer(5, 20)
  
  const startIndex = (page - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, total)
  
  for (let i = startIndex; i < endIndex; i++) {
    const type = Mock.Random.pick(usageTypes)
    scenarios.push({
      id: `usage_${String(i + 1).padStart(3, '0')}`,
      name: Mock.Random.ctitle(3, 8),
      type: type,
      creator: Mock.Random.cname(),
      createdAt: Mock.Random.datetime(),
      description: Mock.Random.csentence(10, 30)
    })
  }
  
  return {
    list: scenarios,
    total: total,
    page: page,
    pageSize: pageSize
  }
}

// 生成版本历史数据
function generateVersionHistory(variableId, page = 1, pageSize = 10) {
  const versions = []
  const total = Mock.Random.integer(3, 10)
  
  const startIndex = (page - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, total)
  
  for (let i = startIndex; i < endIndex; i++) {
    const versionNumber = total - i
    versions.push({
      id: `ver_${String(i + 1).padStart(3, '0')}`,
      version: `v${versionNumber}.0.0`,
      isCurrent: i === 0,
      description: Mock.Random.csentence(5, 20),
      changes: [
        Mock.Random.csentence(5, 15),
        Mock.Random.csentence(5, 15)
      ],
      creator: Mock.Random.cname(),
      createdAt: Mock.Random.datetime()
    })
  }
  
  return {
    list: versions,
    total: total,
    page: page,
    pageSize: pageSize
  }
}

// Mock API 接口
export function setupVariableManagementMock() {
  // 获取变量列表
  Mock.mock(/\/api\/variables(\?.*)?$/, 'get', (options) => {
    const url = new URL(options.url, 'http://localhost')
    const params = Object.fromEntries(url.searchParams)
    
    const page = parseInt(params.page) || 1
    const pageSize = parseInt(params.pageSize) || 20
    const keyword = params.keyword || ''
    const type = params.type || ''
    const status = params.status || ''
    
    let variables = generateVariableList()
    
    // 筛选逻辑
    if (keyword) {
      variables = variables.filter(v => 
        v.name.includes(keyword) || 
        v.code.includes(keyword) || 
        v.description.includes(keyword)
      )
    }
    
    if (type) {
      variables = variables.filter(v => v.type === type)
    }
    
    if (status) {
      variables = variables.filter(v => v.status === status)
    }
    
    const total = variables.length
    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize
    const list = variables.slice(startIndex, endIndex)
    
    return {
      code: 200,
      message: 'success',
      data: {
        list: list,
        total: total,
        page: page,
        pageSize: pageSize
      }
    }
  })

  // 获取变量详情
  Mock.mock(/\/api\/variables\/([^/]+)$/, 'get', (options) => {
    const id = options.url.match(/\/api\/variables\/([^/]+)$/)[1]
    const variable = generateVariableDetail(id)
    
    return {
      code: 200,
      message: 'success',
      data: variable
    }
  })

  // 创建变量
  Mock.mock('/api/variables', 'post', (options) => {
    const data = JSON.parse(options.body)
    
    return {
      code: 200,
      message: '变量创建成功',
      data: {
        id: `var_${Mock.Random.string('number', 3)}`,
        ...data,
        createdAt: Mock.Random.datetime(),
        updatedAt: Mock.Random.datetime()
      }
    }
  })

  // 更新变量
  Mock.mock(/\/api\/variables\/([^/]+)$/, 'put', (options) => {
    const id = options.url.match(/\/api\/variables\/([^/]+)$/)[1]
    const data = JSON.parse(options.body)
    
    return {
      code: 200,
      message: '变量更新成功',
      data: {
        id: id,
        ...data,
        updatedAt: Mock.Random.datetime()
      }
    }
  })

  // 删除变量
  Mock.mock(/\/api\/variables\/([^/]+)$/, 'delete', () => {
    return {
      code: 200,
      message: '变量删除成功',
      data: null
    }
  })

  // 更新变量状态
  Mock.mock(/\/api\/variables\/([^/]+)\/status$/, 'patch', (options) => {
    const id = options.url.match(/\/api\/variables\/([^/]+)\/status$/)[1]
    const { status } = JSON.parse(options.body)
    
    return {
      code: 200,
      message: '状态更新成功',
      data: {
        id: id,
        status: status,
        updatedAt: Mock.Random.datetime()
      }
    }
  })

  // 获取变量统计信息
  Mock.mock('/api/variables/stats', 'get', () => {
    const variables = generateVariableList()
    const stats = {
      total: variables.length,
      active: variables.filter(v => v.status === 'active').length,
      pending: variables.filter(v => v.status === 'pending').length,
      inactive: variables.filter(v => v.status === 'inactive').length,
      expired: variables.filter(v => v.status === 'expired').length
    }
    
    return {
      code: 200,
      message: 'success',
      data: stats
    }
  })

  // 导出变量清单
  Mock.mock('/api/variables/export', 'get', () => {
    // 模拟导出文件
    const blob = new Blob(['变量清单数据'], { type: 'text/csv' })
    return blob
  })

  // 获取数据源列表
  Mock.mock('/api/data-sources', 'get', () => {
    return {
      code: 200,
      message: 'success',
      data: dataSources
    }
  })

  // 获取变量使用场景
  Mock.mock(/\/api\/variables\/([^/]+)\/usages(\?.*)?$/, 'get', (options) => {
    const id = options.url.match(/\/api\/variables\/([^/]+)\/usages/)[1]
    const url = new URL(options.url, 'http://localhost')
    const params = Object.fromEntries(url.searchParams)
    
    const page = parseInt(params.page) || 1
    const pageSize = parseInt(params.pageSize) || 10
    
    const result = generateUsageScenarios(id, page, pageSize)
    
    return {
      code: 200,
      message: 'success',
      data: result
    }
  })

  // 获取变量版本历史
  Mock.mock(/\/api\/variables\/([^/]+)\/versions(\?.*)?$/, 'get', (options) => {
    const id = options.url.match(/\/api\/variables\/([^/]+)\/versions/)[1]
    const url = new URL(options.url, 'http://localhost')
    const params = Object.fromEntries(url.searchParams)
    
    const page = parseInt(params.page) || 1
    const pageSize = parseInt(params.pageSize) || 10
    
    const result = generateVersionHistory(id, page, pageSize)
    
    return {
      code: 200,
      message: 'success',
      data: result
    }
  })
}