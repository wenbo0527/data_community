/**
 * 数据模型 API (Mock)
 * TASK-20260714-9EA2D40C: 清理残留 axios（dead code）· 仅保留 mock 路径
 */

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
  await new Promise(resolve => setTimeout(resolve, 200))
  return mockDataModels
}

/**
 * 执行数据模型
 */
export async function executeDataModel(modelId: string, params: any): Promise<any> {
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

export default { getDataModelsList, executeDataModel }
export const DataModelsAPI = { getDataModelsList, executeDataModel }
