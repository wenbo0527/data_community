export interface DataSourceMockItem {
  id: string
  name: string
  type: 'external' | 'internal' | 'credit'
}

export const dataSources: DataSourceMockItem[] = [
  { id: 'external', name: '外部数据服务', type: 'external' },
  { id: 'credit', name: '征信报告', type: 'credit' },
  { id: 'internal', name: '内数底表', type: 'internal' }
]

