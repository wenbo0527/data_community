/**
 * 共享 Mock 资产统一入口
 *
 * 所有跨模块可复用的 mock 数据集中在这里,提供:
 *   1. 数据实体(50 客户 / 40 标签 / 20 人群 / 12 Owner / 15 业务域 / 10 工单 / 4 圈选规则)
 *   2. HTTP mock 端点(/api/customer-directory/* 等)
 *   3. 共享 Store
 *   4. 打通层: lineage / standard-classify-matrix / classification-taxonomy
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

// === HTTP Mock 端点(给 vite-plugin-mock 用) ===
export { customerDirectoryMocks } from './customer-directory'
export { tagDirectoryMocks } from './tag-directory'
export { audienceDirectoryMocks } from './audience-directory'
export { workflowDirectoryMocks } from './workflow-directory'

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

// === 打通层(五大共享)===
export { FieldLinkStore, getEnhancedField, getEnhancedTable } from './lineage'
export type { FieldLink, EnhancedFieldInfo } from './lineage'
export { StandardClassifyMatrixStore, STANDARD_CLASSIFY_MATRIX } from './standard-classify-matrix'
export type { StandardClassifyMatrix, DataTypeCategory } from './standard-classify-matrix'
export { TaxonomyStore, TAXONOMY } from './classification-taxonomy'
export type { TaxonomyNode } from './classification-taxonomy'

/**
 * 汇总所有 shared mock 端点
 * 用于 vite-plugin-mock 集中注册
 */
import { customerDirectoryMocks } from './customer-directory'
import { tagDirectoryMocks } from './tag-directory'
import { audienceDirectoryMocks } from './audience-directory'
import { workflowDirectoryMocks } from './workflow-directory'
import { default as metadataApiMocks } from './metadata-api'
import { default as searchApiMocks } from './search-api'
import { columnLineageMocks } from './column-lineage'
import { commentMocks } from './comment-store'
import { assetTagMocks } from './asset-tags'

export const SHARED_MOCK_ENDPOINTS = [
  ...customerDirectoryMocks,
  ...tagDirectoryMocks,
  ...audienceDirectoryMocks,
  ...workflowDirectoryMocks,
  ...metadataApiMocks,
  ...searchApiMocks,
  ...columnLineageMocks,
  ...commentMocks,
  ...assetTagMocks
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
  fieldLinks: 10,             // 打通层:字段关联
  standardClassifyMatrix: 25, // 打通层:标准-分级矩阵
  taxonomy: 50,               // 打通层:统一分类树
  columnLineageEdges: 10,     // P1: 字段级血缘
  comments: 8,                // P1: 协作注释
  assetTagDefinitions: 16,    // P1: 资产标签定义
  assetTagBindings: 16        // P1: 资产标签绑定
}