/**
 * 共享 Mock 资产统一入口
 *
 * 所有跨模块可复用的 mock 数据集中在这里,提供:
 *   1. 数据实体(50 客户 / 40 标签 / 20 人群 / 12 Owner / 15 业务域 / 10 工单 / 4 圈选规则)
 *   2. HTTP mock 端点(/api/customer-directory/* 等)
 *   3. 共享 Store
 *
 * 使用:
 *   import { CustomerDirectoryStore, TagDirectoryStore, ... } from '@/mock/shared'
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

// === 既有 shared(元数据/标准/搜索) ===
export { MetadataStore } from './metadata-store'
export { BusinessConceptStore } from './business-concept-store'
export { StandardStore } from './standard-store'
export { default as metadataApiMocks } from './metadata-api'
export { default as searchApiMocks } from './search-api'

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

export const SHARED_MOCK_ENDPOINTS = [
  ...customerDirectoryMocks,
  ...tagDirectoryMocks,
  ...audienceDirectoryMocks,
  ...workflowDirectoryMocks,
  ...metadataApiMocks,
  ...searchApiMocks
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
  businessDomains: 15
}