/**
 * 共享 Mock 资产统一入口
 *
 * 所有跨模块可复用的 mock 数据集中在这里,提供:
 *   1. 数据实体:客户/标签/人群/工单/圈选/Owner/业务域/收藏/搜索建议
 *   2. HTTP mock 端点:统一管理 26 个端点
 *   3. 共享 Store:CRUD + 关联查询
 *   4. 打通层:lineage / standard-classify-matrix / classification-taxonomy
 *
 * 使用:
 *   import { CustomerDirectoryStore, TagDirectoryStore, FieldLinkStore } from '@/mock/shared'
 */

// === 实体 ===
export { CUSTOMER_DIRECTORY, CustomerDirectoryStore } from './customer-directory'
export { TAGS, TAG_GROUPS, TagDirectoryStore } from './tag-directory'
export { AUDIENCES, AudienceDirectoryStore } from './audience-directory'
export { CROWD_QUERIES, APPLICATIONS, BUSINESS_DOMAINS, CrowdQueryStore, ApplicationStore, BusinessDomainStore } from './workflow-directory'
export { OWNER_DIRECTORY, OwnerDirectoryStore } from './owner-directory'
export { FAVORITES, FavoriteStore } from './favorite-directory'

// === HTTP Mock 端点(给 vite-plugin-mock 用) ===
export { customerDirectoryMocks } from './customer-directory'
export { tagDirectoryMocks } from './tag-directory'
export { audienceDirectoryMocks } from './audience-directory'
export { workflowDirectoryMocks } from './workflow-directory'
export { favoriteMocks } from './favorite-directory'
export { searchExtrasMocks } from './search-extras'

// === 既有 shared(元数据/标准/搜索/分类类型) ===
export { MetadataStore } from './metadata-store'
export { BusinessConceptStore } from './business-concept-store'
export { StandardStore } from './standard-store'
export { default as metadataApiMocks } from './metadata-api'
export { default as searchApiMocks } from './search-api'
export type { SensitivityLevel, Grade, BusinessBelonging, ClassifyField, ClassifyTable, ClassifySystem } from './classify-types'

// === P1 补齐: Column-lineage / Comments / AssetTags ===
export { ColumnLineageStore, columnLineageMocks } from './column-lineage'
export type { ColumnLineageEdge } from './column-lineage'
export { CommentStore, commentMocks } from './comment-store'
export type { AssetComment, ResourceType, CommentType } from './comment-store'
export { AssetTagStore, assetTagMocks } from './asset-tags'
export type { AssetTagDefinition, AssetTagBinding, AssetResourceType, AssetTagCategory } from './asset-tags'

// === 完整血缘链路(资源→要素) ===
export {
  buildLineageFromTable,
  buildLineageFromElement,
  buildLineage,
  LineageGraphStore,
  lineageGraphMocks
} from './lineage-graph'
export type { LineageNode, LineageEdge, LineageGraph, LineageNodeType } from './lineage-graph'

// === 打通层(五大共享)===
export { FieldLinkStore, getEnhancedField, getEnhancedTable } from './lineage'
export type { FieldLink, EnhancedFieldInfo } from './lineage'
export { StandardClassifyMatrixStore, STANDARD_CLASSIFY_MATRIX } from './standard-classify-matrix'
export type { StandardClassifyMatrix, DataTypeCategory } from './standard-classify-matrix'
export { TaxonomyStore, TAXONOMY } from './classification-taxonomy'
export type { TaxonomyNode } from './classification-taxonomy'

// === 搜索补全 ===
export {
  HOT_SEARCHES,
  SEARCH_SUGGESTIONS,
  SYNONYMS,
  SearchExtrasStore
} from './search-extras'

/**
 * 汇总所有 shared mock 端点
 * 用于 vite-plugin-mock 集中注册
 */
import { customerDirectoryMocks } from './customer-directory'
import { tagDirectoryMocks } from './tag-directory'
import { audienceDirectoryMocks } from './audience-directory'
import { workflowDirectoryMocks } from './workflow-directory'
import { favoriteMocks } from './favorite-directory'
import { searchExtrasMocks } from './search-extras'
import { default as metadataApiMocks } from './metadata-api'
import { default as searchApiMocks } from './search-api'
import { columnLineageMocks } from './column-lineage'
import { commentMocks } from './comment-store'
import { assetTagMocks } from './asset-tags'
import { lineageGraphMocks } from './lineage-graph'

export const SHARED_MOCK_ENDPOINTS = [
  ...customerDirectoryMocks,
  ...tagDirectoryMocks,
  ...audienceDirectoryMocks,
  ...workflowDirectoryMocks,
  ...favoriteMocks,
  ...searchExtrasMocks,
  ...metadataApiMocks,
  ...searchApiMocks,
  ...columnLineageMocks,
  ...commentMocks,
  ...assetTagMocks,
  ...lineageGraphMocks
]

/**
 * 实体统计(供文档/仪表盘使用)
 */
export const MOCK_DATA_STATS = {
  customers: 50,
  tags: 40,
  audiences: 20,
  crowdQueries: 4,
  applications: 10,
  owners: 12,
  businessDomains: 15,
  favorites: 20,               // 收藏(新增)
  hotSearches: 10,            // 热门搜索(新增)
  searchSuggestions: 27,      // 搜索建议(新增)
  synonyms: 19,               // 同义词(新增)
  fieldLinks: 10,
  standardClassifyMatrix: 25,
  taxonomy: 50,
  columnLineageEdges: 10,
  comments: 8,
  assetTagDefinitions: 16,
  assetTagBindings: 16,
  lineageGraphEndpoints: 3
}