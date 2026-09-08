/**
 * 资产标签 Store(占位)
 */
export type AssetResourceType = 'table' | 'metric' | 'variable' | 'feature' | 'api'
export type AssetTagCategory = 'business' | 'technical' | 'compliance' | 'quality'

export interface AssetTagDefinition {
  id: string
  name: string
  category: AssetTagCategory
  color: string
  description: string
}

export interface AssetTagBinding {
  tagId: string
  resourceId: string
  resourceType: AssetResourceType
  boundAt: string
  boundBy: string
}

const TAG_DEFS: AssetTagDefinition[] = [
  { id: 'tag-p0', name: 'P0 核心', category: 'business', color: 'red', description: '业务核心资产' },
  { id: 'tag-pii', name: 'PII', category: 'compliance', color: 'orange', description: '个人识别信息' },
  { id: 'tag-stable', name: '稳定', category: 'quality', color: 'green', description: '质量稳定' },
  { id: 'tag-sensitive', name: '敏感', category: 'compliance', color: 'red', description: '敏感数据' },
  { id: 'tag-new', name: '新增', category: 'business', color: 'blue', description: '本季度新增' }
]

const TAG_BINDINGS: AssetTagBinding[] = [
  { tagId: 'tag-p0', resourceId: 'dim_user', resourceType: 'table', boundAt: '2025-07-01', boundBy: '张三' },
  { tagId: 'tag-pii', resourceId: 'dim_user.id_card_no', resourceType: 'table', boundAt: '2025-07-15', boundBy: '张三' },
  { tagId: 'tag-stable', resourceId: 'dws_user_value', resourceType: 'table', boundAt: '2025-08-01', boundBy: '王五' }
]

export const AssetTagStore = {
  definitions() { return TAG_DEFS },
  bindings() { return TAG_BINDINGS },
  byResource(resourceId: string) {
    return TAG_BINDINGS.filter(b => b.resourceId === resourceId).map(b => ({
      ...b,
      definition: TAG_DEFS.find(d => d.id === b.tagId)
    }))
  },
  byTag(tagId: string) { return TAG_BINDINGS.filter(b => b.tagId === tagId) }
}

export const assetTagMocks = []
export default AssetTagStore