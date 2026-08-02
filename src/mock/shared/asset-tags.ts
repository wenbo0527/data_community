/**
 * 资产标签(独立于数据标签)
 *
 * 区别于 exploration/tag-system 的"用户标签",
 * 本 Store 管理的是"资产标签"——给表/字段/指标/服务打的能力/合规标签。
 *
 * 主流:Unity Catalog / Alation 都有"资产标签"概念
 */

import type { MockMethod } from 'vite-plugin-mock'

export type AssetResourceType = 'table' | 'field' | 'metric' | 'tag' | 'service' | 'api' | 'dataset'
export type AssetTagCategory = 'quality' | 'compliance' | 'cost' | 'usage' | 'lifecycle' | 'custom'

export interface AssetTagDefinition {
  id: string
  name: string
  color: string
  category: AssetTagCategory
  description: string
  isSystem: boolean
}

export interface AssetTagBinding {
  id: string
  tagId: string
  resourceType: AssetResourceType
  resourceId: string
  resourceName: string
  appliedBy: string
  appliedByName: string
  appliedAt: string
  note?: string
}

/**
 * 系统预置的资产标签
 */
export const ASSET_TAG_DEFINITIONS: AssetTagDefinition[] = [
  // 质量类
  { id: 'asset_tag_q1', name: '高质量', color: '#00b42a', category: 'quality', description: '数据质量评分 ≥ 90', isSystem: true },
  { id: 'asset_tag_q2', name: '一般质量', color: '#ff7d00', category: 'quality', description: '数据质量评分 60-90', isSystem: true },
  { id: 'asset_tag_q3', name: '低质量', color: '#f53f3f', category: 'quality', description: '数据质量评分 < 60', isSystem: true },

  // 合规类
  { id: 'asset_tag_c1', name: 'PII 字段', color: '#722ed1', category: 'compliance', description: '包含个人识别信息', isSystem: true },
  { id: 'asset_tag_c2', name: '机密数据', color: '#c9cdd4', category: 'compliance', description: '机密级别数据', isSystem: true },
  { id: 'asset_tag_c3', name: '公开数据', color: '#c9cdd4', category: 'compliance', description: '可公开数据', isSystem: true },
  { id: 'asset_tag_c4', name: 'GDPR', color: '#722ed1', category: 'compliance', description: '受 GDPR 监管', isSystem: true },

  // 成本类
  { id: 'asset_tag_cost1', name: '高成本', color: '#f53f3f', category: 'cost', description: '存储/计算成本高', isSystem: true },
  { id: 'asset_tag_cost2', name: '低成本', color: '#00b42a', category: 'cost', description: '存储/计算成本低', isSystem: true },

  // 使用类
  { id: 'asset_tag_u1', name: '高频使用', color: '#165dff', category: 'usage', description: '每周调用 > 1000 次', isSystem: true },
  { id: 'asset_tag_u2', name: '热门', color: '#ff7d00', category: 'usage', description: '近 30 天查询 Top 10', isSystem: true },
  { id: 'asset_tag_u3', name: '低使用', color: '#c9cdd4', category: 'usage', description: '30 天未使用', isSystem: true },

  // 生命周期
  { id: 'asset_tag_l1', name: '已弃用', color: '#86909c', category: 'lifecycle', description: '已不再维护', isSystem: true },
  { id: 'asset_tag_l2', name: '试用中', color: '#165dff', category: 'lifecycle', description: '试用阶段', isSystem: true },
  { id: 'asset_tag_l3', name: '已稳定', color: '#00b42a', category: 'lifecycle', description: '稳定运行中', isSystem: true },

  // 自定义
  { id: 'asset_tag_x1', name: '数据科学用', color: '#722ed1', category: 'custom', description: '用于数据科学建模', isSystem: false },
  { id: 'asset_tag_x2', name: '监管报送', color: '#ff7d00', category: 'custom', description: '用于监管报送', isSystem: false }
]

/**
 * 资产标签绑定关系
 */
export const ASSET_TAG_BINDINGS: AssetTagBinding[] = [
  // dim_user 的标签
  { id: 'b_001', tagId: 'asset_tag_q1', resourceType: 'table', resourceId: 'dim_user', resourceName: 'dim_user', appliedBy: 'user-zhangsan', appliedByName: '张三', appliedAt: '2025-06-15 10:00' },
  { id: 'b_002', tagId: 'asset_tag_c1', resourceType: 'table', resourceId: 'dim_user', resourceName: 'dim_user', appliedBy: 'user-fengkong', appliedByName: '风控值班', appliedAt: '2025-06-15 10:01' },
  { id: 'b_003', tagId: 'asset_tag_u1', resourceType: 'table', resourceId: 'dim_user', resourceName: 'dim_user', appliedBy: 'user-zhangsan', appliedByName: '张三', appliedAt: '2025-06-15 10:02' },
  { id: 'b_004', tagId: 'asset_tag_l3', resourceType: 'table', resourceId: 'dim_user', resourceName: 'dim_user', appliedBy: 'user-zhangsan', appliedByName: '张三', appliedAt: '2025-06-15 10:03' },

  // fact_loan_apply 的标签
  { id: 'b_005', tagId: 'asset_tag_q2', resourceType: 'table', resourceId: 'fact_loan_apply', resourceName: 'fact_loan_apply', appliedBy: 'user-xindai', appliedByName: '信贷经理', appliedAt: '2025-06-20 14:00' },
  { id: 'b_006', tagId: 'asset_tag_u2', resourceType: 'table', resourceId: 'fact_loan_apply', resourceName: 'fact_loan_apply', appliedBy: 'user-xindai', appliedByName: '信贷经理', appliedAt: '2025-06-20 14:01' },
  { id: 'b_007', tagId: 'asset_tag_x2', resourceType: 'table', resourceId: 'fact_loan_apply', resourceName: 'fact_loan_apply', appliedBy: 'user-caiwu', appliedByName: '财务主管', appliedAt: '2025-06-20 14:02', note: '用于 1104 报送' },

  // fact_user_event 的标签
  { id: 'b_008', tagId: 'asset_tag_cost1', resourceType: 'table', resourceId: 'fact_user_event', resourceName: 'fact_user_event', appliedBy: 'user-zhaosi', appliedByName: '赵六', appliedAt: '2025-06-25 11:00', note: '每日增量 100GB' },
  { id: 'b_009', tagId: 'asset_tag_u1', resourceType: 'table', resourceId: 'fact_user_event', resourceName: 'fact_user_event', appliedBy: 'user-zhaosi', appliedByName: '赵六', appliedAt: '2025-06-25 11:01' },
  { id: 'b_010', tagId: 'asset_tag_x1', resourceType: 'table', resourceId: 'fact_user_event', resourceName: 'fact_user_event', appliedBy: 'user-zhaosi', appliedByName: '赵六', appliedAt: '2025-06-25 11:02' },

  // dws_risk_score 的标签
  { id: 'b_011', tagId: 'asset_tag_c2', resourceType: 'table', resourceId: 'dws_risk_score', resourceName: 'dws_risk_score', appliedBy: 'user-fengkong', appliedByName: '风控值班', appliedAt: '2025-06-15 11:00' },
  { id: 'b_012', tagId: 'asset_tag_u2', resourceType: 'table', resourceId: 'dws_risk_score', resourceName: 'dws_risk_score', appliedBy: 'user-fengkong', appliedByName: '风控值班', appliedAt: '2025-06-15 11:01' },

  // 指标的标签
  { id: 'b_013', tagId: 'asset_tag_u2', resourceType: 'metric', resourceId: 'DAU', resourceName: 'DAU 日活', appliedBy: 'user-zhaosi', appliedByName: '赵六', appliedAt: '2025-06-10 14:00' },
  { id: 'b_014', tagId: 'asset_tag_l3', resourceType: 'metric', resourceId: 'DAU', resourceName: 'DAU 日活', appliedBy: 'user-zhaosi', appliedByName: '赵六', appliedAt: '2025-06-10 14:01' },
  { id: 'b_015', tagId: 'asset_tag_x2', resourceType: 'metric', resourceId: 'apply_amt', resourceName: '申请金额', appliedBy: 'user-xindai', appliedByName: '信贷经理', appliedAt: '2025-06-20 14:00', note: '用于 1104 监管报送' },

  // 服务的标签
  { id: 'b_016', tagId: 'asset_tag_u2', resourceType: 'service', resourceId: 'credit_query', resourceName: '客户授信查询', appliedBy: 'user-xindai', appliedByName: '信贷经理', appliedAt: '2025-07-01 10:00' }
]

export const AssetTagStore = {
  /** 标签定义 */
  definitions(): AssetTagDefinition[] {
    return ASSET_TAG_DEFINITIONS
  },
  definition(id: string): AssetTagDefinition | undefined {
    return ASSET_TAG_DEFINITIONS.find(t => t.id === id)
  },
  byCategory(category: AssetTagCategory): AssetTagDefinition[] {
    return ASSET_TAG_DEFINITIONS.filter(t => t.category === category)
  },

  /** 标签绑定 */
  bindings(): AssetTagBinding[] {
    return ASSET_TAG_BINDINGS
  },
  byResource(resourceType: AssetResourceType, resourceId: string): AssetTagBinding[] {
    return ASSET_TAG_BINDINGS.filter(b => b.resourceType === resourceType && b.resourceId === resourceId)
  },
  byTag(tagId: string): AssetTagBinding[] {
    return ASSET_TAG_BINDINGS.filter(b => b.tagId === tagId)
  },

  /**
   * 取资源的所有标签(含定义)
   */
  tagsOf(resourceType: AssetResourceType, resourceId: string): AssetTagDefinition[] {
    const bindings = this.byResource(resourceType, resourceId)
    return bindings.map(b => this.definition(b.tagId)).filter(Boolean) as AssetTagDefinition[]
  },

  /**
   * 取资源的所有标签(含绑定)
   */
  tagsWithBindingsOf(resourceType: AssetResourceType, resourceId: string) {
    const bindings = this.byResource(resourceType, resourceId)
    return bindings.map(b => ({
      binding: b,
      tag: this.definition(b.tagId)
    })).filter(item => item.tag)
  },

  /** 应用标签 */
  apply(tagId: string, resourceType: AssetResourceType, resourceId: string, appliedBy: string, appliedByName: string, note?: string): AssetTagBinding {
    const newBinding: AssetTagBinding = {
      id: `b_${Date.now()}`,
      tagId,
      resourceType,
      resourceId,
      resourceName: resourceId,
      appliedBy,
      appliedByName,
      appliedAt: new Date().toISOString(),
      note
    }
    ASSET_TAG_BINDINGS.push(newBinding)
    return newBinding
  },

  /** 取消标签 */
  unapply(bindingId: string): boolean {
    const idx = ASSET_TAG_BINDINGS.findIndex(b => b.id === bindingId)
    if (idx >= 0) {
      ASSET_TAG_BINDINGS.splice(idx, 1)
      return true
    }
    return false
  },

  stats() {
    return {
      totalDefinitions: ASSET_TAG_DEFINITIONS.length,
      totalBindings: ASSET_TAG_BINDINGS.length,
      byCategory: {
        quality: this.byCategory('quality').length,
        compliance: this.byCategory('compliance').length,
        cost: this.byCategory('cost').length,
        usage: this.byCategory('usage').length,
        lifecycle: this.byCategory('lifecycle').length,
        custom: this.byCategory('custom').length
      },
      byResourceType: {
        table: ASSET_TAG_BINDINGS.filter(b => b.resourceType === 'table').length,
        metric: ASSET_TAG_BINDINGS.filter(b => b.resourceType === 'metric').length,
        service: ASSET_TAG_BINDINGS.filter(b => b.resourceType === 'service').length
      }
    }
  }
}

export const assetTagMocks: MockMethod[] = [
  {
    url: '/api/asset-tags/definitions',
    method: 'get',
    response: () => ({ code: 0, data: ASSET_TAG_DEFINITIONS })
  },
  {
    url: '/api/asset-tags/by-resource/:type/:id',
    method: 'get',
    response: ({ url }: { url: string }) => {
      const parts = url.split('/')
      const id = parts.pop() || ''
      const type = parts.pop() || ''
      return {
        code: 0,
        data: AssetTagStore.tagsWithBindingsOf(type as any, id)
      }
    }
  },
  {
    url: '/api/asset-tags/stats',
    method: 'get',
    response: () => ({ code: 0, data: AssetTagStore.stats() })
  }
]