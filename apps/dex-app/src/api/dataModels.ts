/**
 * 数据模型 API (Mock)
 */
import axios from '../utils/axios'

const USE_MOCK = true

// Mock 数据
const mockDataModels = [
  { id: 'DM001', name: '客户基础信息模型', type: '基础模型', status: 'active' },
  { id: 'DM002', name: '信用评估模型', type: '风控模型', status: 'active' },
  { id: 'DM003', name: '营销响应模型', type: '营销模型', status: 'inactive' }
]

/**
 * 获取数据模型列表
 */
export async function getDataModelsList(): Promise<any[]> {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 200))
    return mockDataModels
  }
  const response = await axios.get('/api/dataModels')
  return response.data
}

/**
 * 执行数据模型
 */
export async function executeDataModel(modelId: string, params: any): Promise<any> {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 500))
    return {
      success: true,
      modelId,
      result: {
        score: 750,
        level: 'A',
        recommendation: '建议通过'
      }
    }
  }
  const response = await axios.post('/api/dataModels/execute', { modelId, ...params })
  return response.data
}

export default { getDataModelsList, executeDataModel }
export const DataModelsAPI = { getDataModelsList, executeDataModel }
