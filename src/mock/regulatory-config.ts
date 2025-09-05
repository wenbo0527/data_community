import { MockMethod } from 'vite-plugin-mock'
import { RegulatoryCategory } from '../types/metrics'

// 监管报表配置数据结构
interface ReportBinding {
  id: string
  reportCategory: RegulatoryCategory
  reportName: string
  metricCategories: string[]
  description?: string
  createdAt: string
  updatedAt: string
}

// 模拟监管报表配置数据
const reportBindings: ReportBinding[] = [
  {
    id: '1',
    reportCategory: RegulatoryCategory.CBIRC_BANKING,
    reportName: '银行业监管统计报表',
    metricCategories: ['资本管理', '流动性管理', '信用风险'],
    description: '银保监会银行业监管统计报表，包含资本充足率、流动性覆盖率等核心指标',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15'
  },
  {
    id: '2',
    reportCategory: RegulatoryCategory.PBOC_CENTRALIZED,
    reportName: '人民银行大集中系统报表',
    metricCategories: ['货币政策', '金融稳定', '支付清算'],
    description: '人民银行大集中系统报表，涵盖货币政策执行和金融稳定相关指标',
    createdAt: '2024-01-05',
    updatedAt: '2024-01-20'
  },
  {
    id: '3',
    reportCategory: RegulatoryCategory.CSRC_SECURITIES,
    reportName: '证券业监管报表',
    metricCategories: ['市场风险', '操作风险', '合规管理'],
    description: '证监会证券业监管报表，包含市场风险和操作风险相关指标',
    createdAt: '2024-01-10',
    updatedAt: '2024-01-25'
  }
]

// 获取所有可用的指标分类
const getAvailableMetricCategories = () => {
  return [
    '资本管理',
    '流动性管理', 
    '信用风险',
    '市场风险',
    '操作风险',
    '货币政策',
    '金融稳定',
    '支付清算',
    '合规管理',
    '反洗钱',
    '消费者保护'
  ]
}

export default [
  {
    url: '/api/regulatory-config/bindings',
    method: 'get',
    response: ({ query }: { query: { page?: string; pageSize?: string; reportCategory?: string; reportName?: string } }) => {
      const { page = '1', pageSize = '10', reportCategory, reportName } = query
      let filteredBindings = [...reportBindings]

      // 按报表大类筛选
      if (reportCategory) {
        filteredBindings = filteredBindings.filter(item => item.reportCategory === reportCategory)
      }

      // 按报表名称筛选
      if (reportName) {
        filteredBindings = filteredBindings.filter(item => item.reportName.includes(reportName))
      }

      // 分页处理
      const startIndex = (parseInt(page) - 1) * parseInt(pageSize)
      const endIndex = startIndex + parseInt(pageSize)
      const paginatedBindings = filteredBindings.slice(startIndex, endIndex)

      return {
        code: 200,
        message: 'success',
        data: {
          list: paginatedBindings,
          total: filteredBindings.length
        }
      }
    }
  },
  {
    url: '/api/regulatory-config/bindings/:id',
    method: 'get',
    response: ({ url }: { url: string }) => {
      const id = url.split('/').pop()
      const binding = reportBindings.find(b => b.id === id)
      if (binding) {
        return {
          code: 200,
          message: 'success',
          data: binding
        }
      } else {
        return {
          code: 404,
          message: '配置不存在',
          data: null
        }
      }
    }
  },
  {
    url: '/api/regulatory-config/bindings',
    method: 'post',
    response: ({ body }: { body: Omit<ReportBinding, 'id' | 'createdAt' | 'updatedAt'> }) => {
      const newBinding: ReportBinding = {
        ...body,
        id: String(reportBindings.length + 1),
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0]
      }
      reportBindings.push(newBinding)
      console.log('创建新的报表配置:', newBinding)
      return {
        code: 200,
        message: 'success',
        data: newBinding
      }
    }
  },
  {
    url: '/api/regulatory-config/bindings/:id',
    method: 'put',
    response: ({ url, body }: { url: string; body: Partial<ReportBinding> }) => {
      const id = url.split('/').pop()
      const index = reportBindings.findIndex(b => b.id === id)
      if (index !== -1) {
        reportBindings[index] = {
          ...reportBindings[index],
          ...body,
          updatedAt: new Date().toISOString().split('T')[0]
        }
        console.log('更新报表配置:', reportBindings[index])
        return {
          code: 200,
          message: 'success',
          data: reportBindings[index]
        }
      } else {
        return {
          code: 404,
          message: '配置不存在',
          data: null
        }
      }
    }
  },
  {
    url: '/api/regulatory-config/bindings/:id',
    method: 'delete',
    response: ({ url }: { url: string }) => {
      const id = url.split('/').pop()
      const index = reportBindings.findIndex(b => b.id === id)
      if (index !== -1) {
        const deletedBinding = reportBindings.splice(index, 1)[0]
        console.log('删除报表配置:', deletedBinding)
        return {
          code: 200,
          message: 'success',
          data: { success: true }
        }
      } else {
        return {
          code: 404,
          message: '配置不存在',
          data: null
        }
      }
    }
  },
  {
    url: '/api/regulatory-config/metric-categories',
    method: 'get',
    response: () => {
      return {
        code: 200,
        message: 'success',
        data: getAvailableMetricCategories()
      }
    }
  }
] as MockMethod[]