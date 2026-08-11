/**
 * 人群 Directory 补齐(Mock 数据缺口 P0)
 *
 * 原探索侧的 audience-system 内置 mock,但没有跨模块共享。
 * 本文件建立 20+ 个人群,覆盖典型业务场景。
 */

import type { MockMethod } from 'vite-plugin-mock'

export interface AudienceRule {
  field: string
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'between' | 'contains'
  value: any
}

export interface AudienceDefinition {
  id: string
  name: string
  description: string
  rules: AudienceRule[]
  userCount: number
  refreshType: 'static' | 'daily' | 'weekly' | 'realtime'
  visibility: 'public' | 'department' | 'private'
  ownerId: string
  ownerName: string
  createTime: string
  updateTime: string
  lastRefreshTime: string
  tags: string[] // 来源标签 ID
  useCase: string
}

export const AUDIENCES: AudienceDefinition[] = [
  // === 营销类(8 个) ===
  {
    id: 'aud_001',
    name: '高价值活跃用户',
    description: 'A 级用户 + 近 30 天活跃,可推高端产品',
    rules: [
      { field: 'value_level', operator: 'eq', value: 'A' },
      { field: 'active_30d', operator: 'eq', value: true }
    ],
    userCount: 12,
    refreshType: 'daily',
    visibility: 'department',
    ownerId: 'user-yingxiao',
    ownerName: '营销经理',
    createTime: '2024-08-01',
    updateTime: '2025-07-01',
    lastRefreshTime: '2025-07-02 02:00:00',
    tags: ['tag_023', 'tag_012'],
    useCase: '高端产品营销活动'
  },
  {
    id: 'aud_002',
    name: '新客 30 天未转化',
    description: '注册 30 天内无任何金融产品使用',
    rules: [
      { field: 'is_new_user', operator: 'eq', value: true },
      { field: 'consume_30d_amt', operator: 'lt', value: 100 }
    ],
    userCount: 5,
    refreshType: 'daily',
    visibility: 'department',
    ownerId: 'user-yingxiao',
    ownerName: '营销经理',
    createTime: '2024-09-15',
    updateTime: '2025-07-01',
    lastRefreshTime: '2025-07-02 02:00:00',
    tags: ['tag_001'],
    useCase: '新客激活活动'
  },
  {
    id: 'aud_003',
    name: '理财偏好高净值',
    description: 'A/B 级 + 理财偏好 + VIP',
    rules: [
      { field: 'value_level', operator: 'in', value: ['A', 'B'] },
      { field: 'prefer_finance', operator: 'eq', value: true },
      { field: 'is_vip', operator: 'eq', value: true }
    ],
    userCount: 18,
    refreshType: 'daily',
    visibility: 'department',
    ownerId: 'user-yingxiao',
    ownerName: '营销经理',
    createTime: '2024-10-10',
    updateTime: '2025-07-01',
    lastRefreshTime: '2025-07-02 02:00:00',
    tags: ['tag_023', 'tag_020', 'tag_005'],
    useCase: '理财产品定向推送'
  },
  {
    id: 'aud_004',
    name: '一线城市活跃用户',
    description: '一线城市 + 近 30 天活跃',
    rules: [
      { field: 'is_top1_city', operator: 'eq', value: true },
      { field: 'active_30d', operator: 'eq', value: true }
    ],
    userCount: 28,
    refreshType: 'daily',
    visibility: 'public',
    ownerId: 'user-yingxiao',
    ownerName: '营销经理',
    createTime: '2024-11-05',
    updateTime: '2025-07-01',
    lastRefreshTime: '2025-07-02 02:00:00',
    tags: ['tag_004', 'tag_012'],
    useCase: '一线城市推广'
  },
  {
    id: 'aud_005',
    name: '高客单价潜力用户',
    description: '近 30 天有消费 + 客单价 > 5000',
    rules: [
      { field: 'consume_30d_amt', operator: 'gt', value: 5000 },
      { field: 'consume_30d_freq', operator: 'gte', value: 3 }
    ],
    userCount: 12,
    refreshType: 'daily',
    visibility: 'department',
    ownerId: 'user-yingxiao',
    ownerName: '营销经理',
    createTime: '2025-01-20',
    updateTime: '2025-07-01',
    lastRefreshTime: '2025-07-02 02:00:00',
    tags: ['tag_017'],
    useCase: '高客单价产品'
  },
  {
    id: 'aud_006',
    name: '价格敏感用户',
    description: '消费偏好价格型 + 近 30 天活跃',
    rules: [
      { field: 'price_sensitive', operator: 'eq', value: true },
      { field: 'active_30d', operator: 'eq', value: true }
    ],
    userCount: 25,
    refreshType: 'weekly',
    visibility: 'department',
    ownerId: 'user-yingxiao',
    ownerName: '营销经理',
    createTime: '2025-02-15',
    updateTime: '2025-07-01',
    lastRefreshTime: '2025-07-02 02:00:00',
    tags: ['tag_018'],
    useCase: '优惠活动'
  },
  {
    id: 'aud_007',
    name: '贷款潜力用户',
    description: '贷款偏好 + B 级以上 + 无逾期',
    rules: [
      { field: 'prefer_loan', operator: 'eq', value: true },
      { field: 'value_level', operator: 'in', value: ['A', 'B', 'C'] },
      { field: 'is_overdue', operator: 'eq', value: false }
    ],
    userCount: 22,
    refreshType: 'daily',
    visibility: 'department',
    ownerId: 'user-yingxiao',
    ownerName: '营销经理',
    createTime: '2025-03-08',
    updateTime: '2025-07-01',
    lastRefreshTime: '2025-07-02 02:00:00',
    tags: ['tag_021', 'tag_023', 'tag_034'],
    useCase: '贷款产品推广'
  },
  {
    id: 'aud_008',
    name: '品质型用户',
    description: '消费偏好品质型 + 本科以上',
    rules: [
      { field: 'quality_user', operator: 'eq', value: true },
      { field: 'is_high_edu', operator: 'eq', value: true }
    ],
    userCount: 18,
    refreshType: 'weekly',
    visibility: 'department',
    ownerId: 'user-yingxiao',
    ownerName: '营销经理',
    createTime: '2025-04-12',
    updateTime: '2025-07-01',
    lastRefreshTime: '2025-07-02 02:00:00',
    tags: ['tag_019', 'tag_006'],
    useCase: '品质商品推荐'
  },

  // === 风控类(6 个) ===
  {
    id: 'aud_009',
    name: '严重逾期催收名单',
    description: '逾期 > 30 天 + 信用较差 + 失信风险',
    rules: [
      { field: 'is_severe_overdue', operator: 'eq', value: true },
      { field: 'credit_level', operator: 'in', value: ['poor', 'normal'] }
    ],
    userCount: 5,
    refreshType: 'daily',
    visibility: 'private',
    ownerId: 'user-fengkong',
    ownerName: '风控值班',
    createTime: '2024-12-01',
    updateTime: '2025-07-01',
    lastRefreshTime: '2025-07-02 02:00:00',
    tags: ['tag_036', 'tag_031'],
    useCase: '催收工单'
  },
  {
    id: 'aud_010',
    name: '欺诈高风险用户',
    description: '欺诈风险 = 高 + 多头借贷',
    rules: [
      { field: 'fraud_risk', operator: 'eq', value: 'high' },
      { field: 'multi_borrow', operator: 'eq', value: true }
    ],
    userCount: 3,
    refreshType: 'realtime',
    visibility: 'private',
    ownerId: 'user-fengkong',
    ownerName: '风控值班',
    createTime: '2024-12-15',
    updateTime: '2025-07-01',
    lastRefreshTime: '2025-07-02 02:00:00',
    tags: ['tag_033', 'tag_038'],
    useCase: '欺诈预警'
  },
  {
    id: 'aud_011',
    name: '信用良好 VIP 客户',
    description: 'A 级 + 信用优秀 + 近 30 天活跃',
    rules: [
      { field: 'value_level', operator: 'eq', value: 'A' },
      { field: 'credit_level', operator: 'eq', value: 'excellent' },
      { field: 'active_30d', operator: 'eq', value: true }
    ],
    userCount: 14,
    refreshType: 'daily',
    visibility: 'department',
    ownerId: 'user-fengkong',
    ownerName: '风控值班',
    createTime: '2025-01-10',
    updateTime: '2025-07-01',
    lastRefreshTime: '2025-07-02 02:00:00',
    tags: ['tag_023', 'tag_031', 'tag_012'],
    useCase: 'VIP 客户运营'
  },
  {
    id: 'aud_012',
    name: '失信风险人群',
    description: '失信被执行人 + 多头借贷',
    rules: [
      { field: 'is_dishonest', operator: 'eq', value: true },
      { field: 'multi_borrow', operator: 'eq', value: true }
    ],
    userCount: 2,
    refreshType: 'weekly',
    visibility: 'private',
    ownerId: 'user-fengkong',
    ownerName: '风控值班',
    createTime: '2025-02-20',
    updateTime: '2025-07-01',
    lastRefreshTime: '2025-07-02 02:00:00',
    tags: ['tag_037', 'tag_038'],
    useCase: '法律追偿'
  },
  {
    id: 'aud_013',
    name: '流失风险客户',
    description: '流失风险 = 高 + 信用评分 < 700',
    rules: [
      { field: 'churn_risk', operator: 'eq', value: 'high' },
      { field: 'credit_score', operator: 'lt', value: 700 }
    ],
    userCount: 8,
    refreshType: 'weekly',
    visibility: 'department',
    ownerId: 'user-fengkong',
    ownerName: '风控值班',
    createTime: '2025-03-15',
    updateTime: '2025-07-01',
    lastRefreshTime: '2025-07-02 02:00:00',
    tags: ['tag_040', 'tag_032'],
    useCase: '客户挽留'
  },
  {
    id: 'aud_014',
    name: '催收中用户',
    description: '催收中 + 逾期天数 > 7',
    rules: [
      { field: 'is_collection', operator: 'eq', value: true },
      { field: 'overdue_days', operator: 'gt', value: 7 }
    ],
    userCount: 4,
    refreshType: 'daily',
    visibility: 'private',
    ownerId: 'user-fengkong',
    ownerName: '风控值班',
    createTime: '2025-04-05',
    updateTime: '2025-07-01',
    lastRefreshTime: '2025-07-02 02:00:00',
    tags: ['tag_039', 'tag_035'],
    useCase: '催收跟进'
  },

  // === 运营类(6 个) ===
  {
    id: 'aud_015',
    name: '近 7 天新增用户',
    description: '注册时间在最近 7 天内的用户',
    rules: [
      { field: 'is_new_user', operator: 'eq', value: true },
      { field: 'active_7d', operator: 'eq', value: true }
    ],
    userCount: 6,
    refreshType: 'daily',
    visibility: 'department',
    ownerId: 'user-yunying',
    ownerName: '王运营',
    createTime: '2025-05-20',
    updateTime: '2025-07-01',
    lastRefreshTime: '2025-07-02 02:00:00',
    tags: ['tag_001', 'tag_011'],
    useCase: '新客观察'
  },
  {
    id: 'aud_016',
    name: '30 天未访问用户',
    description: '用户行为近期 < 30 天活跃',
    rules: [
      { field: 'active_30d', operator: 'eq', value: false }
    ],
    userCount: 5,
    refreshType: 'daily',
    visibility: 'department',
    ownerId: 'user-yunying',
    ownerName: '王运营',
    createTime: '2025-06-01',
    updateTime: '2025-07-01',
    lastRefreshTime: '2025-07-02 02:00:00',
    tags: ['tag_012'],
    useCase: '流失预警'
  },
  {
    id: 'aud_017',
    name: '高学历已婚用户',
    description: '本科以上 + 已婚 + 30-45 岁',
    rules: [
      { field: 'is_high_edu', operator: 'eq', value: true },
      { field: 'is_married', operator: 'eq', value: true },
      { field: 'age_group', operator: 'in', value: ['26-35', '36-45'] }
    ],
    userCount: 22,
    refreshType: 'weekly',
    visibility: 'department',
    ownerId: 'user-yunying',
    ownerName: '王运营',
    createTime: '2025-06-10',
    updateTime: '2025-07-01',
    lastRefreshTime: '2025-07-02 02:00:00',
    tags: ['tag_006', 'tag_008', 'tag_003'],
    useCase: '家庭产品营销'
  },
  {
    id: 'aud_018',
    name: '有车有房用户',
    description: '有车 + 有房,定位中产人群',
    rules: [
      { field: 'has_car', operator: 'eq', value: true },
      { field: 'has_house', operator: 'eq', value: true }
    ],
    userCount: 15,
    refreshType: 'weekly',
    visibility: 'department',
    ownerId: 'user-yunying',
    ownerName: '王运营',
    createTime: '2025-06-15',
    updateTime: '2025-07-01',
    lastRefreshTime: '2025-07-02 02:00:00',
    tags: ['tag_009', 'tag_010'],
    useCase: '汽车/房产相关'
  },
  {
    id: 'aud_019',
    name: '互联网行业用户',
    description: '职业包含互联网/IT/工程师',
    rules: [
      { field: 'lifecycle_stage', operator: 'in', value: ['new', 'growing'] }
    ],
    userCount: 18,
    refreshType: 'daily',
    visibility: 'department',
    ownerId: 'user-chanpin',
    ownerName: '产品经理',
    createTime: '2025-06-20',
    updateTime: '2025-07-01',
    lastRefreshTime: '2025-07-02 02:00:00',
    tags: ['tag_027'],
    useCase: '互联网行业洞察'
  },
  {
    id: 'aud_020',
    name: '高潜力用户池',
    description: '25-35 岁 + 一线城市 + 高学历 + 高价值潜力',
    rules: [
      { field: 'is_high_edu', operator: 'eq', value: true },
      { field: 'is_top1_city', operator: 'eq', value: true },
      { field: 'high_potential', operator: 'eq', value: true }
    ],
    userCount: 18,
    refreshType: 'daily',
    visibility: 'private',
    ownerId: 'user-yingxiao',
    ownerName: '营销经理',
    createTime: '2025-06-25',
    updateTime: '2025-07-01',
    lastRefreshTime: '2025-07-02 02:00:00',
    tags: ['tag_006', 'tag_004', 'tag_026'],
    useCase: '高潜力用户池'
  }
]

export const AudienceDirectoryStore = {
  list(): AudienceDefinition[] {
    return AUDIENCES
  },

  byId(id: string): AudienceDefinition | undefined {
    return AUDIENCES.find(a => a.id === id)
  },

  byName(name: string): AudienceDefinition | undefined {
    return AUDIENCES.find(a => a.name === name)
  },

  byOwner(ownerId: string): AudienceDefinition[] {
    return AUDIENCES.filter(a => a.ownerId === ownerId)
  },

  byVisibility(visibility: string): AudienceDefinition[] {
    return AUDIENCES.filter(a => a.visibility === visibility)
  },

  byUseCase(useCase: string): AudienceDefinition[] {
    return AUDIENCES.filter(a => a.useCase.includes(useCase))
  },

  search(keyword: string): AudienceDefinition[] {
    const lower = keyword.toLowerCase()
    return AUDIENCES.filter(a =>
      a.name.toLowerCase().includes(lower) ||
      a.description.toLowerCase().includes(lower) ||
      a.useCase.toLowerCase().includes(lower)
    )
  },

  stats() {
    return {
      total: AUDIENCES.length,
      totalUsers: AUDIENCES.reduce((acc, a) => acc + a.userCount, 0),
      byRefreshType: {
        realtime: AUDIENCES.filter(a => a.refreshType === 'realtime').length,
        daily: AUDIENCES.filter(a => a.refreshType === 'daily').length,
        weekly: AUDIENCES.filter(a => a.refreshType === 'weekly').length,
        static: AUDIENCES.filter(a => a.refreshType === 'static').length
      },
      byVisibility: {
        public: AUDIENCES.filter(a => a.visibility === 'public').length,
        department: AUDIENCES.filter(a => a.visibility === 'department').length,
        private: AUDIENCES.filter(a => a.visibility === 'private').length
      }
    }
  }
}

export const audienceDirectoryMocks: MockMethod[] = [
  {
    url: '/api/audience-directory/list',
    method: 'get',
    response: ({ query }: { query: { visibility?: string; ownerId?: string; keyword?: string } }) => {
      let result = AUDIENCES
      if (query.visibility) result = result.filter(a => a.visibility === query.visibility)
      if (query.ownerId) result = result.filter(a => a.ownerId === query.ownerId)
      if (query.keyword) {
        const lower = query.keyword.toLowerCase()
        result = result.filter(a =>
          a.name.toLowerCase().includes(lower) ||
          a.description.toLowerCase().includes(lower)
        )
      }
      return { code: 0, data: result, total: result.length }
    }
  },
  {
    url: '/api/audience-directory/stats',
    method: 'get',
    response: () => ({ code: 0, data: AudienceDirectoryStore.stats() })
  }
]