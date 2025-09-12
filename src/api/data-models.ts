import { mockDataModels, DataModel, UseCase, DataModelStatus } from '../mock/data-models.ts'

// 查询参数接口
interface GetDataModelsParams {
  useCase?: keyof typeof UseCase;
  status?: keyof typeof DataModelStatus;
  search?: string;
}

// API响应接口
interface ApiResponse<T> {
  success: boolean;
  data: T;
  total?: number;
  message: string;
}

/**
 * 获取数据模型列表
 * @param {GetDataModelsParams} params - 查询参数
 * @returns {Promise<ApiResponse<DataModel[]>>} 返回数据模型列表
 */
export const getDataModels = async (params: GetDataModelsParams = {}): Promise<ApiResponse<DataModel[]>> => {
  try {
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 300))
    
    let models = [...mockDataModels]
    
    // 根据参数过滤
    if (params.useCase) {
      models = models.filter(model => model.useCase === params.useCase)
    }
    
    if (params.status) {
      models = models.filter(model => model.status === params.status)
    }
    
    if (params.search) {
      const searchTerm = params.search.toLowerCase()
      models = models.filter(model => 
        model.name.toLowerCase().includes(searchTerm) ||
        model.description.toLowerCase().includes(searchTerm)
      )
    }
    
    return {
      success: true,
      data: models,
      total: models.length,
      message: '获取数据模型列表成功'
    }
  } catch (error) {
    console.error('获取数据模型列表失败:', error)
    return {
      success: false,
      data: [],
      total: 0,
      message: '获取数据模型列表失败'
    }
  }
}

/**
 * 根据ID获取数据模型详情
 * @param {string} id - 数据模型ID
 * @returns {Promise<ApiResponse<DataModel | null>>} 返回数据模型详情
 */
export const getDataModelById = async (id: string): Promise<ApiResponse<DataModel | null>> => {
  try {
    await new Promise(resolve => setTimeout(resolve, 200))
    
    const model = mockDataModels.find(m => m.id === id)
    
    if (!model) {
      return {
        success: false,
        data: null,
        message: '数据模型不存在'
      }
    }
    
    return {
      success: true,
      data: model,
      message: '获取数据模型详情成功'
    }
  } catch (error) {
    console.error('获取数据模型详情失败:', error)
    return {
      success: false,
      data: null,
      message: '获取数据模型详情失败'
    }
  }
}

// 执行查询参数接口
interface ExecuteParams {
  [key: string]: any;
}

// 查询结果接口
interface QueryResult {
  id: string;
  create_time: string;
  update_time: string;
  customer_id?: string;
  customer_name?: string;
  [key: string]: any;
}

/**
 * 执行数据模型查询
 * @param {string} modelId - 数据模型ID
 * @param {ExecuteParams} params - 查询参数
 * @returns {Promise<ApiResponse<QueryResult[]>>} 返回查询结果
 */
export const executeDataModel = async (modelId: string, params: ExecuteParams = {}): Promise<ApiResponse<QueryResult[]>> => {
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const model = mockDataModels.find(m => m.id === modelId)
    
    if (!model) {
      return {
        success: false,
        data: [],
        message: '数据模型不存在'
      }
    }
    
    // 生成模拟查询结果
    const mockResults = generateMockResults(model, params)
    
    return {
      success: true,
      data: mockResults,
      total: mockResults.length,
      message: '查询执行成功'
    }
  } catch (error) {
    console.error('执行数据模型查询失败:', error)
    return {
      success: false,
      data: [],
      message: '查询执行失败'
    }
  }
}

/**
 * 生成模拟查询结果
 * @param {DataModel} model - 数据模型
 * @param {ExecuteParams} params - 查询参数
 * @returns {QueryResult[]} 模拟结果数据
 */
const generateMockResults = (model: DataModel, params: ExecuteParams): QueryResult[] => {
  const results = []
  const count = 10
  
  for (let i = 0; i < count; i++) {
    const result: QueryResult = {
      id: `${model.id}_result_${i + 1}`,
      create_time: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      update_time: new Date().toISOString()
    }
    
    // 根据模型参数生成结果字段
    if (model.parameters) {
      model.parameters.forEach(param => {
        result[param.name] = generateMockValue(param.type, param.name, params[param.name])
      })
    }
    
    // 添加一些通用字段
    if (model.name.includes('客户')) {
      result.customer_id = `CUST${String(i + 1).padStart(6, '0')}`
      result.customer_name = `客户${i + 1}`
    }
    
    results.push(result)
  }
  
  return results
}

/**
 * 生成模拟值
 * @param {string} type - 参数类型
 * @param {string} fieldName - 字段名
 * @param {any} inputValue - 输入值
 * @returns {any} 模拟值
 */
const generateMockValue = (type: string, fieldName: string, inputValue: any): any => {
  // 如果有输入值，优先使用
  if (inputValue !== undefined && inputValue !== null && inputValue !== '') {
    return inputValue
  }
  
  switch (type) {
    case 'string':
      if (fieldName.includes('id') || fieldName.includes('ID')) {
        return `${fieldName.toUpperCase()}_${Math.random().toString(36).substr(2, 8)}`
      }
      if (fieldName.includes('name') || fieldName.includes('名称')) {
        return `测试${fieldName}_${Math.floor(Math.random() * 100)}`
      }
      return `${fieldName}_value_${Math.floor(Math.random() * 1000)}`
    case 'number':
      return Math.floor(Math.random() * 100000)
    case 'date':
      return new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    case 'boolean':
      return Math.random() > 0.5
    default:
      return `mock_${fieldName}`
  }
}