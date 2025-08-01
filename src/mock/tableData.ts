import { MockMethod } from 'vite-plugin-mock'

interface TableItem {
  name: string
  type: string
  category: string
  domain: string
  updateFrequency: string
  owner: string
  description: string
  fields: Array<{
    name: string
    type: string
    description: string
  }>
}

// 从data-map.ts导入mock数据
import { mockTables } from './data-map';

export const tableMockData: TableItem[] = mockTables;

export default [
  {
    url: '/api/table/list',
    method: 'get',
    response: ({ query }: { query: { page?: string; pageSize?: string; name?: string; type?: string; category?: string; domain?: string } }) => {
      const { page = '1', pageSize = '10', name, type, category, domain } = query
      let filteredTables = [...tableMockData]

      // 按名称筛选
      if (name) {
        filteredTables = filteredTables.filter(item => 
          item.name.toLowerCase().includes(name.toLowerCase()) ||
          item.description.toLowerCase().includes(name.toLowerCase())
        )
      }

      // 按类型筛选
      if (type) {
        filteredTables = filteredTables.filter(item => item.type === type)
      }

      // 按分类筛选
      if (category) {
        filteredTables = filteredTables.filter(item => item.category === category)
      }

      // 按域筛选
      if (domain) {
        filteredTables = filteredTables.filter(item => item.domain === domain)
      }

      // 分页处理
      const startIndex = (parseInt(page) - 1) * parseInt(pageSize)
      const endIndex = startIndex + parseInt(pageSize)
      const paginatedTables = filteredTables.slice(startIndex, endIndex)

      return {
        code: 200,
        message: 'success',
        data: {
          list: paginatedTables,
          total: filteredTables.length
        }
      }
    }
  }
] as MockMethod[]