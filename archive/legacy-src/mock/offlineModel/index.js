/**
 * 离线模型 Mock 数据(占位)
 */
const SAMPLE_FEATURES = [
  { id: 'f1', name: '用户年龄', type: 'numerical', majorCategory: 'behavior', description: '用户基础属性' },
  { id: 'f2', name: '近30天登录次数', type: 'numerical', majorCategory: 'behavior', description: '活跃度指标' },
  { id: 'f3', name: '人行征信分数', type: 'numerical', majorCategory: 'credit', description: '信用评分' },
  { id: 'f4', name: '近90天逾期次数', type: 'numerical', majorCategory: 'credit', description: '信用记录' }
]

const SAMPLE_MODELS = [
  { id: 'm1', name: '风控评分模型', type: 'scoring', status: 'deployed' },
  { id: 'm2', name: '客户流失预警', type: 'classification', status: 'training' }
]

const delay = (data) => new Promise((r) => setTimeout(() => r({ data: { code: 200, data } }), 100))

export default {
  feature: {
    getFeatures: (params) => {
      let rows = SAMPLE_FEATURES
      if (params?.name) rows = rows.filter(f => f.name.includes(params.name))
      if (params?.majorCategory) rows = rows.filter(f => f.majorCategory === params.majorCategory)
      return Promise.resolve({ data: { code: 200, data: rows, total: rows.length } })
    },
    exportFeatures: (params) => delay({ count: SAMPLE_FEATURES.length, url: '/exports/features.csv' }),
    getFeature: (id) => Promise.resolve({ data: SAMPLE_FEATURES.find(f => f.id === id) || null })
  },
  model: {
    getModels: (params) => {
      let rows = SAMPLE_MODELS
      if (params?.name) rows = rows.filter(m => m.name.includes(params.name))
      return Promise.resolve({ data: { code: 200, data: rows, total: rows.length } })
    },
    exportModels: (params) => delay({ count: SAMPLE_MODELS.length, url: '/exports/models.csv' })
  },
  backtrack: {
    backtrack: (params) => Promise.resolve({ data: { code: 200, data: { score: 0.85, factors: [] } } })
  },
  task: {
    getTasks: (params) => Promise.resolve({ data: { code: 200, data: [], total: 0 } })
  },
  evaluation: {
    getEvaluationReport: (id) => Promise.resolve({ data: { code: 200, data: { id, accuracy: 0.92, precision: 0.88 } } }),
    exportEvaluationReport: (id) => delay({ url: `/exports/eval-${id}.pdf` })
  }
}