/**
 * 搜索补全(占位)
 */

export const HOT_SEARCHES = [
  '客户主表', 'DAU', 'MAU', 'GMV', '贷款申请',
  '客户画像', '风控评分', '营销活动', '审批通过率', '指标中心'
]

export const SEARCH_SUGGESTIONS = [
  { term: '客户主表', type: 'table', count: 12 },
  { term: 'DAU', type: 'metric', count: 3 },
  { term: '贷款申请', type: 'business', count: 8 },
  { term: '客户画像', type: 'feature', count: 15 },
  { term: '指标中心', type: 'page', count: 1 }
]

export const SYNONYMS: Record<string, string[]> = {
  'DAU': ['日活', '日活跃用户数', 'Daily Active Users'],
  'MAU': ['月活', '月活跃用户数', 'Monthly Active Users'],
  'GMV': ['成交总额', '商品交易总额', 'Gross Merchandise Volume'],
  '客户': ['客户', '用户', '用户主表', 'dim_user']
}

export const SearchExtrasStore = {
  hotSearches() { return HOT_SEARCHES },
  suggestions() { return SEARCH_SUGGESTIONS },
  synonyms() { return SYNONYMS },
  suggest(keyword: string) {
    if (!keyword) return SEARCH_SUGGESTIONS
    return SEARCH_SUGGESTIONS.filter(s =>
      s.term.includes(keyword) ||
      (SYNONYMS[s.term] || []).some(syn => syn.includes(keyword))
    )
  }
}

export const searchExtrasMocks = []
export default SearchExtrasStore