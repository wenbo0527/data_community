import Mock from 'mockjs'

/**
 * Mock请求工具函数
 * @param {string} method - 请求方法
 * @param {string} url - 请求URL
 * @param {function} responseFn - 响应处理函数
 * @returns {object} Mock配置对象
 */
export function mockRequest(method, url, responseFn) {
  return {
    url: new RegExp(`^${url.replace(/:\w+/g, '\\w+')}$`),
    type: method.toLowerCase(),
    response: (config) => {
      try {
        // 解析URL参数
        const urlParams = parseUrlParams(config.url, url)
        
        // 解析查询参数
        const queryParams = parseQueryParams(config.url)
        
        // 解析请求体
        let bodyData = null
        if (config.body) {
          try {
            bodyData = JSON.parse(config.body)
          } catch (e) {
            bodyData = config.body
          }
        }
        
        // 调用响应处理函数
        const result = responseFn({
          ...urlParams,
          ...queryParams,
          ...bodyData,
          _config: config
        })
        
        // 模拟网络延迟
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(result)
          }, Mock.Random.integer(100, 500))
        })
      } catch (error) {
        console.error('Mock request error:', error)
        return {
          code: 500,
          message: 'Internal server error',
          error: error.message
        }
      }
    }
  }
}

/**
 * 解析URL路径参数
 * @param {string} actualUrl - 实际请求的URL
 * @param {string} patternUrl - 模式URL
 * @returns {object} 路径参数对象
 */
function parseUrlParams(actualUrl, patternUrl) {
  const params = {}
  const patternParts = patternUrl.split('/')
  const actualParts = actualUrl.split('/')
  
  patternParts.forEach((part, index) => {
    if (part.startsWith(':')) {
      const paramName = part.slice(1)
      params[paramName] = actualParts[index]
    }
  })
  
  return params
}

/**
 * 解析URL查询参数
 * @param {string} url - 完整URL
 * @returns {object} 查询参数对象
 */
function parseQueryParams(url) {
  const params = {}
  const queryString = url.split('?')[1]
  
  if (queryString) {
    const pairs = queryString.split('&')
    pairs.forEach(pair => {
      const [key, value] = pair.split('=')
      if (key) {
        params[key] = decodeURIComponent(value || '')
      }
    })
  }
  
  return params
}

/**
 * 生成分页响应数据
 * @param {array} data - 数据数组
 * @param {number} page - 当前页码
 * @param {number} pageSize - 每页大小
 * @returns {object} 分页响应对象
 */
export function generatePageResponse(data, page = 1, pageSize = 10) {
  const startIndex = (page - 1) * pageSize
  const endIndex = startIndex + pageSize
  const pageData = data.slice(startIndex, endIndex)
  
  return {
    code: 200,
    data: {
      list: pageData,
      total: data.length,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      totalPages: Math.ceil(data.length / pageSize)
    },
    message: 'success'
  }
}

/**
 * 生成树形结构数据
 * @param {array} data - 扁平数据数组
 * @param {string} idField - ID字段名
 * @param {string} parentIdField - 父ID字段名
 * @param {string} childrenField - 子节点字段名
 * @returns {array} 树形结构数据
 */
export function generateTreeData(data, idField = 'id', parentIdField = 'parentId', childrenField = 'children') {
  const map = {}
  const result = []
  
  // 创建ID映射
  data.forEach(item => {
    map[item[idField]] = { ...item, [childrenField]: [] }
  })
  
  // 构建树形结构
  data.forEach(item => {
    const node = map[item[idField]]
    if (item[parentIdField] && map[item[parentIdField]]) {
      map[item[parentIdField]][childrenField].push(node)
    } else {
      result.push(node)
    }
  })
  
  return result
}

/**
 * 生成级联选择数据
 * @param {number} level - 层级数
 * @param {number} countPerLevel - 每层级数量
 * @returns {array} 级联选择数据
 */
export function generateCascaderData(level = 3, countPerLevel = 3) {
  const result = []
  
  for (let i = 1; i <= countPerLevel; i++) {
    const level1 = {
      value: `option_${i}`,
      label: Mock.Random.ctitle(2, 4),
      children: []
    }
    
    if (level > 1) {
      for (let j = 1; j <= countPerLevel; j++) {
        const level2 = {
          value: `option_${i}_${j}`,
          label: Mock.Random.ctitle(2, 4),
          children: []
        }
        
        if (level > 2) {
          for (let k = 1; k <= countPerLevel; k++) {
            level2.children.push({
              value: `option_${i}_${j}_${k}`,
              label: Mock.Random.ctitle(2, 4)
            })
          }
        }
        
        level1.children.push(level2)
      }
    }
    
    result.push(level1)
  }
  
  return result
}

/**
 * 生成图表数据
 * @param {string} type - 图表类型
 * @param {number} dataPoints - 数据点数量
 * @returns {object} 图表数据
 */
export function generateChartData(type = 'line', dataPoints = 12) {
  const categories = []
  const series = []
  
  // 生成分类数据
  for (let i = 1; i <= dataPoints; i++) {
    categories.push(Mock.Random.ctitle(2, 4))
  }
  
  // 生成系列数据
  const seriesCount = Mock.Random.integer(1, 3)
  for (let i = 1; i <= seriesCount; i++) {
    const data = []
    for (let j = 1; j <= dataPoints; j++) {
      data.push(Mock.Random.integer(10, 1000))
    }
    
    series.push({
      name: Mock.Random.ctitle(2, 4),
      data: data
    })
  }
  
  return {
    categories,
    series
  }
}

/**
 * 生成表格列配置
 * @param {array} columns - 列配置数组
 * @returns {array} 完整的列配置
 */
export function generateTableColumns(columns) {
  return columns.map((col, index) => ({
    title: col.title || `列${index + 1}`,
    dataIndex: col.dataIndex || `field_${index}`,
    key: col.key || col.dataIndex || `field_${index}`,
    width: col.width || 120,
    ellipsis: col.ellipsis !== false,
    sortable: col.sortable || false,
    filterable: col.filterable || false,
    ...col
  }))
}

/**
 * 模拟错误响应
 * @param {number} code - 错误码
 * @param {string} message - 错误信息
 * @returns {object} 错误响应对象
 */
export function mockErrorResponse(code = 500, message = 'Internal server error') {
  return {
    code,
    message,
    timestamp: new Date().toISOString()
  }
}

/**
 * 模拟成功响应
 * @param {any} data - 响应数据
 * @param {string} message - 成功信息
 * @returns {object} 成功响应对象
 */
export function mockSuccessResponse(data = null, message = 'success') {
  return {
    code: 200,
    data,
    message,
    timestamp: new Date().toISOString()
  }
}