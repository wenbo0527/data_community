import { MockMethod } from 'vite-plugin-mock'
import { MetricItem, MetricType, RegulatoryCategory } from '../types/metrics'

const metrics: MetricItem[] = [
  {
    id: '1',
    type: MetricType.BUSINESS_CORE,
    name: 'DAU',
    category: '用户指标',
    businessDomain: '留存域',
    businessDefinition: '日活跃用户数',
    owner: '张三',
    code: 'USER_001',
    useCase: '用于监控产品的日常活跃情况，是产品健康度的重要指标',
    statisticalPeriod: '日更新',
    sourceTable: 'dwd.user_login_detail',
    processingLogic: 'SELECT dt, COUNT(DISTINCT user_id) as dau\nFROM dwd.user_login_detail\nWHERE dt = ${date}\nGROUP BY dt',
    fieldDescription: 'user_id: 用户唯一标识, dt: 统计日期',
    reportInfo: '用户分析/核心指标',
    storageLocation: 'adm.ads_user_core_metrics',
    queryCode: 'SELECT dau FROM adm.ads_user_core_metrics WHERE dt = ${date}',
    versions: [
      { date: '2024-01-01', description: '指标创建' },
      { date: '2024-01-15', description: '优化统计逻辑，排除测试账号' }
    ],
    businessOwner: '李四',
    technicalOwner: '王五',
    isFavorite: true
  },
  {
    id: '2',
    type: MetricType.BUSINESS_CORE,
    name: '当日风控授信通过笔数',
    category: '业务域',
    businessDomain: '业务规模',
    businessDefinition: '授信申请环节中风控审批结果为通过的笔数',
    owner: '王志雄',
    code: 'A00043',
    useCase: '',
    statisticalPeriod: '离线T+2',
    sourceTable: 'a_frms_deparment_sx_his_full',
    processingLogic: 'SELECT COUNT(flow_id) FROM a_frms_deparment_sx_his_full WHERE result=\'PA\'',
    fieldDescription: '',
    reportInfo: '发展日测报告\n公司级报表・市场营销报表',
    storageLocation: 'adm.ads_report_index_commonality_info_full',
    queryCode: 'SELECT data_dt=20250401\nFROM adm.ads_report_numbersinfo_free_temporal_code\nWHERE data_dt=20250401\nAND indicator_name=\'风控授信通过量\'\nAND indicator_id=\'A00043\'',
    versions: [
      { date: '2024-01-01', description: '指标创建' }
    ],
    businessOwner: '',
    technicalOwner: '',
    isFavorite: false
  },
  {
    id: '3',
    type: MetricType.BUSINESS_CORE,
    name: '用户注册转化率',
    category: '用户指标',
    businessDomain: '转化域',
    businessDefinition: '访问用户转化为注册用户的比率',
    owner: '李四',
    code: 'USER_002',
    useCase: '衡量产品获客效果，优化注册流程',
    statisticalPeriod: '日更新',
    sourceTable: 'dwd.user_register_detail',
    processingLogic: 'SELECT dt, COUNT(DISTINCT register_user_id) / COUNT(DISTINCT visit_user_id) as conversion_rate\nFROM dwd.user_register_detail\nWHERE dt = ${date}\nGROUP BY dt',
    fieldDescription: 'register_user_id: 完成注册的用户ID, visit_user_id: 访问用户ID',
    reportInfo: '用户分析/转化分析',
    storageLocation: 'adm.ads_user_conversion_metrics',
    queryCode: 'SELECT conversion_rate FROM adm.ads_user_conversion_metrics WHERE dt = ${date}',
    versions: [
      { date: '2024-01-05', description: '指标创建' }
    ],
    businessOwner: '王五',
    technicalOwner: '赵六',
    isFavorite: false
  },
  // 监管指标示例
  {
    id: '4',
    type: MetricType.REGULATORY,
    name: '资本充足率',
    category: '资本管理',
    businessDefinition: '银行资本总额与风险加权资产的比率，用于衡量银行抵御风险的能力',
    code: 'REG_001',
    statisticalPeriod: '月度',
    sourceTable: 'reg.capital_adequacy_detail',
    processingLogic: 'SELECT (tier1_capital + tier2_capital) / risk_weighted_assets * 100 as capital_adequacy_ratio\nFROM reg.capital_adequacy_detail\nWHERE report_date = ${date}',
    storageLocation: 'reg.ads_capital_adequacy_ratio',
    queryCode: 'SELECT capital_adequacy_ratio FROM reg.ads_capital_adequacy_ratio WHERE report_date = ${date}',
    versions: [
      { date: '2024-01-01', description: '监管指标创建' }
    ],
    businessOwner: '监管合规部-张经理',
    technicalOwner: '数据团队-李工程师',
    regulatoryCategory: RegulatoryCategory.CBIRC_BANKING,
    reportName: '银行业监管统计报表',
    isFavorite: false
  },
  {
    id: '5',
    type: MetricType.REGULATORY,
    name: '流动性覆盖率',
    category: '流动性管理',
    businessDefinition: '银行持有的高质量流动性资产与未来30天净现金流出量的比率',
    code: 'REG_002',
    statisticalPeriod: '日度',
    sourceTable: 'reg.liquidity_coverage_detail',
    processingLogic: 'SELECT high_quality_liquid_assets / net_cash_outflows_30d * 100 as lcr\nFROM reg.liquidity_coverage_detail\nWHERE report_date = ${date}',
    storageLocation: 'reg.ads_liquidity_coverage_ratio',
    queryCode: 'SELECT lcr FROM reg.ads_liquidity_coverage_ratio WHERE report_date = ${date}',
    versions: [
      { date: '2024-01-01', description: '监管指标创建' }
    ],
    businessOwner: '风险管理部-王总监',
    technicalOwner: '数据团队-赵工程师',
    regulatoryCategory: RegulatoryCategory.PBOC_CENTRALIZED,
    reportName: '人民银行大集中系统报表',
    isFavorite: false
  }
]

// 获取所有指标分类
const getMetricCategories = () => {
  const categories = new Set<string>()
  metrics.forEach(metric => {
    categories.add(metric.category)
  })
  return Array.from(categories)
}

// 获取所有业务域
const getBusinessDomains = () => {
  const domains = new Set<string>()
  metrics.forEach(metric => {
    if (metric.businessDomain) {
      domains.add(metric.businessDomain)
    }
  })
  return Array.from(domains)
}

// 获取监管报表名称列表
const getReportNames = (regulatoryCategory?: string) => {
  const reportNames = new Set<string>()
  metrics.forEach(metric => {
    if (metric.type === MetricType.REGULATORY && metric.reportName) {
      if (!regulatoryCategory || metric.regulatoryCategory === regulatoryCategory) {
        reportNames.add(metric.reportName)
      }
    }
  })
  return Array.from(reportNames)
}

export default [
  {
    url: '/api/metrics/list',
    method: 'get',
    response: ({ query }: { query: { page?: string; pageSize?: string; name?: string; category?: string; businessDomain?: string; type?: string; regulatoryCategory?: string; reportName?: string } }) => {
      const { page = '1', pageSize = '10', name, category, businessDomain, type, regulatoryCategory, reportName } = query
      console.log('Mock服务收到请求参数:', { page, pageSize, name, category, businessDomain, type, regulatoryCategory, reportName })
      let filteredMetrics = [...metrics]

      // 按指标类型筛选
      if (type) {
        filteredMetrics = filteredMetrics.filter(item => item.type === type)
      }

      // 按名称筛选
      if (name) {
        filteredMetrics = filteredMetrics.filter(item => item.name.includes(name))
      }

      // 按分类筛选
      if (category) {
        filteredMetrics = filteredMetrics.filter(item => item.category === category)
      }

      // 按业务域筛选
      if (businessDomain) {
        filteredMetrics = filteredMetrics.filter(item => item.businessDomain === businessDomain)
      }

      // 按监管报表大类筛选
      if (regulatoryCategory) {
        filteredMetrics = filteredMetrics.filter(item => item.regulatoryCategory === regulatoryCategory)
      }

      // 按报表名称筛选
      if (reportName) {
        filteredMetrics = filteredMetrics.filter(item => item.reportName === reportName)
      }

      // 分页处理
      const startIndex = (parseInt(page) - 1) * parseInt(pageSize)
      const endIndex = startIndex + parseInt(pageSize)
      const paginatedMetrics = filteredMetrics.slice(startIndex, endIndex)

      const response = {
        code: 200,
        message: 'success',
        data: {
          list: paginatedMetrics,
          total: filteredMetrics.length
        }
      }
      console.log('Mock服务返回数据:', response)
      return response
    }
  },
  {
    url: '/api/metrics/categories',
    method: 'get',
    response: () => {
      return {
        code: 200,
        message: 'success',
        data: getMetricCategories()
      }
    }
  },
  {
    url: '/api/metrics/business-domains',
    method: 'get',
    response: () => {
      return {
        code: 200,
        message: 'success',
        data: getBusinessDomains()
      }
    }
  },
  {
    url: '/api/metrics/report-names',
    method: 'get',
    response: ({ query }: { query: { regulatoryCategory?: string } }) => {
      const { regulatoryCategory } = query
      return {
        code: 200,
        message: 'success',
        data: getReportNames(regulatoryCategory)
      }
    }
  },
  {
    url: '/api/metrics/batch-register',
    method: 'post',
    response: ({ body }: { body: any }) => {
      console.log('批量注册指标:', body)
      return {
        code: 200,
        message: 'success',
        data: {
          success: true,
          successCount: body.metrics?.length || 0,
          failCount: 0,
          errors: []
        }
      }
    }
  },
  {
    url: '/api/metrics/:id',
    method: 'get',
    response: ({ url }: { url: string }) => {
      const id = url.split('/').pop()
      const metric = metrics.find(m => m.id === id)
      if (metric) {
        return {
          code: 200,
          message: 'success',
          data: metric
        }
      } else {
        return {
          code: 404,
          message: '指标不存在',
          data: null
        }
      }
    }
  },
  {
    url: '/api/metrics',
    method: 'post',
    response: ({ body }: { body: MetricItem }) => {
      const newMetric = {
        ...body,
        id: String(metrics.length + 1),
        versions: [{ date: new Date().toISOString().split('T')[0], description: '指标创建' }],
        isFavorite: false
      }
      metrics.push(newMetric)
      console.log('创建新指标:', newMetric)
      return {
        code: 200,
        message: 'success',
        data: newMetric
      }
    }
  },
  {
    url: '/api/metrics/:id',
    method: 'put',
    response: ({ url, body }: { url: string; body: MetricItem }) => {
      const id = url.split('/').pop()
      const index = metrics.findIndex(m => m.id === id)
      if (index !== -1) {
        metrics[index] = { ...metrics[index], ...body }
        console.log('更新指标:', metrics[index])
        return {
          code: 200,
          message: 'success',
          data: metrics[index]
        }
      } else {
        return {
          code: 404,
          message: '指标不存在',
          data: null
        }
      }
    }
  },
  {
    url: '/api/metrics/:id',
    method: 'delete',
    response: ({ url }: { url: string }) => {
      const id = url.split('/').pop()
      const index = metrics.findIndex(m => m.id === id)
      if (index !== -1) {
        const deletedMetric = metrics.splice(index, 1)[0]
        console.log('删除指标:', deletedMetric)
        return {
          code: 200,
          message: 'success',
          data: { success: true }
        }
      } else {
        return {
          code: 404,
          message: '指标不存在',
          data: null
        }
      }
    }
  },
  {
    url: '/api/metrics/:id/favorite',
    method: 'post',
    response: ({ url }: { url: string }) => {
      const id = url.split('/').pop()
      const metric = metrics.find(m => m.id === id)
      if (metric) {
        metric.isFavorite = !metric.isFavorite
        console.log('切换收藏状态:', metric)
        return {
          code: 200,
          message: 'success',
          data: { isFavorite: metric.isFavorite }
        }
      } else {
        return {
          code: 404,
          message: '指标不存在',
          data: null
        }
      }
    }
  }] as MockMethod[]
