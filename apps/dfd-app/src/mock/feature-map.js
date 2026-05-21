import Mock from 'mockjs'

// 特征类型
const majorCategories = [
  { value: 'credit', label: '征信变量' },
  { value: 'behavior', label: '行为变量' }
]

const level1Options = {
  credit: [
    { value: 'credit_report', label: '征信报告' },
    { value: 'credit_history', label: '信贷记录' }
  ],
  behavior: [
    { value: 'transaction_behavior', label: '交易行为' },
    { value: 'activity', label: '活跃度' },
    { value: 'model_outputs', label: '模型输出' }
  ]
}

const level2Options = {
  credit_report: ['query_count', 'overdue_count', 'balance', 'limit_usage'],
  credit_history: ['loan_times', 'repay_ratio', 'default_count', 'credit_limit'],
  transaction_behavior: ['avg_amount', 'frequency', 'max_amount', 'total_count'],
  activity: ['login_days', 'session_count', 'duration', 'page_views'],
  model_outputs: ['score', 'prob', 'label', 'rank']
}

// 生成特征列表
function generateFeatureList(params = {}) {
  const { name = '', majorCategory = '', level1 = '', page = 1, pageSize = 10 } = params

  const allFeatures = []
  let id = 700

  majorCategories.forEach(mc => {
    if (majorCategory && majorCategory !== mc.value) return
    const levels1 = level1Options[mc.value] || []
    levels1.forEach(l1 => {
      if (level1 && level1 !== l1.value) return
      const levels2 = level2Options[l1.value] || []
      levels2.forEach(l2 => {
        const type = Mock.Random.pick(['numerical', 'categorical', 'text'])
        allFeatures.push({
          id: `feat_${String(id++).padStart(4, '0')}`,
          name: `${l1.label}_${l2}`.replace(/_/g, ''),
          code: `${mc.value}_${l1.value}_${l2}`,
          majorCategory: mc.value,
          majorCategoryLabel: mc.label,
          level1: l1.value,
          level1Label: l1.label,
          level2: l2,
          type,
          status: Mock.Random.pick(['active', 'pending', 'draft']),
          dataSource: Mock.Random.pick(['用户基础信息表', '订单数据表', '行为日志表']),
          creator: Mock.Random.cname(),
          createdAt: Mock.Random.datetime(),
          description: `${l1.label}的${l2}特征`,
          quality: Mock.Random.float(70, 100, 1, 1)
        })
      })
    })
  })

  const filtered = name
    ? allFeatures.filter(f => f.name.includes(name) || f.code.includes(name))
    : allFeatures

  const start = (page - 1) * pageSize
  const list = filtered.slice(start, start + pageSize)

  return { list, total: filtered.length, page, pageSize }
}

// 注册特征相关 Mock 接口
export function setupFeatureMapMock() {
  // 获取特征列表
  Mock.mock(/\/api\/features/, 'get', (options) => {
    const params = options.url.split('?').length > 1
      ? Object.fromEntries(new URLSearchParams(options.url.split('?')[1]))
      : {}
    return {
      code: 200,
      message: 'success',
      data: generateFeatureList({
        name: params.name || '',
        majorCategory: params.majorCategory || '',
        level1: params.level1 || '',
        page: parseInt(params.page) || 1,
        pageSize: parseInt(params.pageSize) || 10
      })
    }
  })

  // 获取特征详情
  Mock.mock(/\/api\/features\/.*/, 'get', (options) => {
    const id = options.url.match(/\/api\/features\/(.+)/)?.[1]
    return {
      code: 200,
      message: 'success',
      data: {
        id: id || 'feat_0700',
        name: '征信查询次数',
        code: 'credit_credit_report_query_count',
        majorCategory: 'credit',
        majorCategoryLabel: '征信变量',
        level1: 'credit_report',
        level1Label: '征信报告',
        level2: 'query_count',
        type: 'numerical',
        status: 'active',
        dataSource: '用户基础信息表',
        creator: Mock.Random.cname(),
        createdAt: Mock.Random.datetime(),
        description: '征信报告近半年查询次数',
        quality: 95.5,
        usageCount: Mock.Random.integer(10, 500)
      }
    }
  })

  console.log('[Mock] 特征地图接口已注册')
}
