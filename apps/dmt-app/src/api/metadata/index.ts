// metadata API - mock 实现
export const createMetadataTask = (payload: any) => Promise.resolve({ success: true, data: payload })
export const getMetadataTaskDetail = (id: string) => Promise.resolve({ id })

const MOCK_TASKS = [
  { id: 'T-001', taskName: 'Doris 主仓表采集', dataSourceType: 'Doris', assetType: '表', status: 'running', createdAt: '2026-07-21 09:30' },
  { id: 'T-002', taskName: 'Hive 数仓指标采集', dataSourceType: 'Hive', assetType: '指标', status: 'success', createdAt: '2026-07-21 08:15' },
  { id: 'T-003', taskName: 'Oracle 核心系统变量采集', dataSourceType: 'Oracle', assetType: '变量', status: 'failed', createdAt: '2026-07-21 07:00' },
  { id: 'T-004', taskName: 'Doris 风控 API 采集', dataSourceType: 'Doris', assetType: 'API', status: 'success', createdAt: '2026-07-20 22:00' },
  { id: 'T-005', taskName: 'Hive 用户中心画像采集', dataSourceType: 'Hive', assetType: '表', status: 'pending', createdAt: '2026-07-20 18:30' },
  { id: 'T-006', taskName: 'Doris 数仓指标增量采集', dataSourceType: 'Doris', assetType: '指标', status: 'running', createdAt: '2026-07-20 14:20' }
]

export async function getMetadataTasks(params: { page?: number; pageSize?: number; keyword?: string; dataSourceType?: string; assetType?: string } = {}) {
  let list = [...MOCK_TASKS]
  if (params.keyword) {
    list = list.filter(t => t.taskName.includes(params.keyword!))
  }
  if (params.dataSourceType) {
    list = list.filter(t => t.dataSourceType === params.dataSourceType)
  }
  if (params.assetType) {
    list = list.filter(t => t.assetType === params.assetType)
  }
  return { list, total: list.length }
}

export default { createMetadataTask, getMetadataTaskDetail, getMetadataTasks }
