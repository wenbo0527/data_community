/**
 * 搜索补充 — 热门搜索 / 搜索建议 / 搜索历史
 *
 * search-api 已经能搜资源,但缺少"用户行为维度":
 *   - 热门搜索(高频词)
 *   - 搜索建议(下拉补全)
 *   - 搜索历史(用户最近搜过什么)
 *   - 同义词扩展
 */

import type { MockMethod } from 'vite-plugin-mock'

/**
 * 热门搜索(全公司 + 行业 + 团队)
 */
export const HOT_SEARCHES = [
  { keyword: '客户', rank: 1, heat: 9876, trend: 'up' as const, change: 12 },
  { keyword: 'DAU', rank: 2, heat: 8543, trend: 'up' as const, change: 8 },
  { keyword: '信用评分', rank: 3, heat: 7234, trend: 'stable' as const, change: 0 },
  { keyword: '授信', rank: 4, heat: 6891, trend: 'up' as const, change: 15 },
  { keyword: '营销活动', rank: 5, heat: 6123, trend: 'down' as const, change: -3 },
  { keyword: '风控', rank: 6, heat: 5876, trend: 'stable' as const, change: 0 },
  { keyword: '客户画像', rank: 7, heat: 5432, trend: 'up' as const, change: 5 },
  { keyword: '数据血缘', rank: 8, heat: 4987, trend: 'stable' as const, change: 0 },
  { keyword: '逾期', rank: 9, heat: 4567, trend: 'up' as const, change: 18 },
  { keyword: 'GMV', rank: 10, heat: 4321, trend: 'up' as const, change: 10 }
]

/**
 * 搜索建议(前缀匹配)
 */
export const SEARCH_SUGGESTIONS = [
  { keyword: '客户', type: 'table' as const, label: '客户主表', count: 1 },
  { keyword: '客户', type: 'audience' as const, label: '客户 360', count: 1 },
  { keyword: '客户', type: 'tag' as const, label: '客户标签', count: 4 },
  { keyword: '客户', type: 'metric' as const, label: '客户数', count: 1 },
  { keyword: '客户', type: 'concept' as const, label: '客户业务实体', count: 1 },

  { keyword: '授信', type: 'metric' as const, label: '授信总额', count: 1 },
  { keyword: '授信', type: 'audience' as const, label: '授信客户人群', count: 3 },
  { keyword: '授信', type: 'field' as const, label: '授信额度字段', count: 4 },

  { keyword: '风控', type: 'table' as const, label: '风险评分表', count: 1 },
  { keyword: '风控', type: 'audience' as const, label: '高风险人群', count: 4 },

  { keyword: '营销', type: 'audience' as const, label: '营销人群', count: 8 },
  { keyword: '营销', type: 'dashboard' as const, label: '营销看板', count: 3 },

  { keyword: '标签', type: 'tag' as const, label: '标签体系', count: 40 },
  { keyword: '标签', type: 'audience' as const, label: '标签衍生人群', count: 12 },

  { keyword: '指标', type: 'metric' as const, label: '业务指标', count: 30 },
  { keyword: '指标', type: 'table' as const, label: '指标宽表', count: 3 },

  { keyword: '血缘', type: 'lineage' as const, label: '血缘关系', count: 0 },
  { keyword: '资产', type: 'asset' as const, label: '数据资产', count: 50 }
]

/**
 * 同义词扩展(搜索"客户"也搜"user/customer/用户/会员")
 */
export const SYNONYMS: Record<string, string[]> = {
  '客户': ['user', 'customer', '用户', '会员', 'c端'],
  '授信': ['credit', '贷款', '额度', 'loan'],
  '风控': ['risk', '信用', '欺诈', '反欺诈'],
  '营销': ['marketing', '运营', 'campaign', '推广'],
  '数据': ['data', 'dataset'],
  '指标': ['metric', 'kpi', 'measure'],
  '资产': ['asset', '资产目录'],
  '标签': ['tag', 'label'],
  '人群': ['audience', 'crowd', 'segment', '客群'],
  '圈选': ['query', '筛选', 'filter'],
  '逾期': ['overdue', '违约', '拖欠'],
  '画像': ['profile', '肖像'],
  '活跃': ['active', '日活', 'dau', 'mau'],
  '表': ['table'],
  '字段': ['field', 'column'],
  '血缘': ['lineage'],
  '标准': ['standard', 'norm'],
  '分级': ['classification', '分级分类', '敏感度'],
  '服务': ['service', 'api'],
  '看板': ['dashboard', '可视化']
}

export const SearchExtrasStore = {
  hotSearches() {
    return HOT_SEARCHES
  },

  topHot(n = 10) {
    return HOT_SEARCHES.slice(0, n)
  },

  suggestions(keyword: string) {
    if (!keyword) return []
    const lower = keyword.toLowerCase()
    return SEARCH_SUGGESTIONS.filter(s =>
      s.keyword.toLowerCase().includes(lower) || lower.includes(s.keyword.toLowerCase())
    )
  },

  /**
   * 同义词扩展
   */
  expandKeyword(keyword: string): string[] {
    if (!keyword) return []
    const result: string[] = [keyword]
    Object.entries(SYNONYMS).forEach(([key, synonyms]) => {
      if (key === keyword.toLowerCase()) {
        result.push(...synonyms)
      }
      synonyms.forEach(s => {
        if (s.toLowerCase().includes(keyword.toLowerCase())) {
          result.push(key)
        }
      })
    })
    return [...new Set(result)]
  },

  /**
   * 搜索历史(从 localStorage 维护,这里给 mock)
   */
  history(userId: string) {
    return [
      { userId, keyword: '客户', time: '今天 14:20', resultCount: 45 },
      { userId, keyword: '授信', time: '今天 10:15', resultCount: 23 },
      { userId, keyword: '逾期', time: '昨天 16:30', resultCount: 8 },
      { userId, keyword: 'DAU', time: '昨天 09:00', resultCount: 12 }
    ]
  },

  stats() {
    return {
      totalSearches: 24876,
      uniqueKeywords: 1234,
      avgResultsPerSearch: 23,
      topCategories: ['table', 'metric', 'audience']
    }
  }
}

/**
 * HTTP Mock 端点
 */
export const searchExtrasMocks: MockMethod[] = [
  {
    url: '/api/search/hot',
    method: 'get',
    response: ({ query }: { query: { top?: string } }) => {
      const n = parseInt(query.top || '10')
      return { code: 0, data: SearchExtrasStore.topHot(n) }
    }
  },
  {
    url: '/api/search/suggestions',
    method: 'get',
    response: ({ query }: { query: { keyword?: string } }) => {
      return { code: 0, data: SearchExtrasStore.suggestions(query.keyword || '') }
    }
  },
  {
    url: '/api/search/expand',
    method: 'get',
    response: ({ query }: { query: { keyword?: string } }) => {
      return { code: 0, data: SearchExtrasStore.expandKeyword(query.keyword || '') }
    }
  },
  {
    url: '/api/search/history',
    method: 'get',
    response: ({ query }: { query: { userId?: string } }) => {
      return { code: 0, data: SearchExtrasStore.history(query.userId || 'user-zhangsan') }
    }
  },
  {
    url: '/api/search/stats',
    method: 'get',
    response: () => ({ code: 0, data: SearchExtrasStore.stats() })
  }
]