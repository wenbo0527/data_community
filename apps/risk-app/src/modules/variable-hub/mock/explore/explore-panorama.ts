export type PanoramaLayer = 'type' | 'source' | 'lifecycle'
export type VariableLifecycle = 'exploring' | 'online' | 'archived'

import { ExploreTaxonomyStore } from './explore-taxonomy-store'

export interface PanoramaStats {
  totalVariables: number
  dataSources: number
  exploring: number
  online: number
  archived: number
}

export interface PanoramaNode {
  id: string
  layer: PanoramaLayer
  title: string
  subtitle: string
  description: string
  stats: PanoramaStats
}

export interface PanoramaLink {
  from: string
  to: string
  count: number
}

export interface PanoramaVariable {
  id: string
  name: string
  variableTypeId: string
  variableType: string
  exploreCategoryId: string
  exploreCategory: string
  sourceGroup: string
  lifecycle: VariableLifecycle
  businessDomain: string
  dataSourceName: string
  owner: string
  topicId?: string
}

export interface PanoramaCategoryBranch {
  id: string
  title: string
  subtitle: string
  description: string
  stats: PanoramaStats
  sources: PanoramaSourceBranch[]
}

export interface PanoramaLifecycleBranch {
  id: string
  title: string
  stats: PanoramaStats
}

export interface PanoramaSourceBranch {
  id: string
  title: string
  subtitle: string
  description: string
  stats: PanoramaStats
  lifecycles: PanoramaLifecycleBranch[]
}

export interface PanoramaTypeBranch {
  id: string
  title: string
  subtitle: string
  description: string
  stats: PanoramaStats
  categories: PanoramaCategoryBranch[]
}

const panoramaNodes: PanoramaNode[] = [
  {
    id: 'type-behavior',
    layer: 'type',
    title: '行为类特征',
    subtitle: '用户行为、频次、活跃度',
    description: '用于识别客户行为变化与风险前置信号。',
    stats: { totalVariables: 48, dataSources: 9, exploring: 16, online: 24, archived: 8 }
  },
  {
    id: 'type-trade',
    layer: 'type',
    title: '交易类特征',
    subtitle: '交易金额、笔数、趋势',
    description: '围绕交易明细和交易趋势构建的基础特征簇。',
    stats: { totalVariables: 36, dataSources: 7, exploring: 10, online: 20, archived: 6 }
  },
  {
    id: 'type-profile',
    layer: 'type',
    title: '画像类特征',
    subtitle: '标签、偏好、分层',
    description: '面向客户经营、营销触达与分层分析的画像特征。',
    stats: { totalVariables: 28, dataSources: 5, exploring: 8, online: 13, archived: 7 }
  },
  {
    id: 'type-external',
    layer: 'type',
    title: '外部类特征',
    subtitle: '外数、征信、第三方服务',
    description: '结合外部服务能力形成的补充特征，强调效果和成本平衡。',
    stats: { totalVariables: 22, dataSources: 6, exploring: 7, online: 9, archived: 6 }
  },
  {
    id: 'source-internal',
    layer: 'source',
    title: '内部数据源',
    subtitle: '行为明细、交易明细、画像宽表',
    description: '以内部表与明细流为核心的数据来源域。',
    stats: { totalVariables: 74, dataSources: 10, exploring: 22, online: 40, archived: 12 }
  },
  {
    id: 'source-external',
    layer: 'source',
    title: '外部服务',
    subtitle: '外数接口、征信服务、供应商数据',
    description: '适用于补充信用、风险、设备等外部视角。',
    stats: { totalVariables: 34, dataSources: 6, exploring: 11, online: 14, archived: 9 }
  },
  {
    id: 'source-reuse',
    layer: 'source',
    title: '历史复用/衍生',
    subtitle: '复用特征、组合特征、派生特征',
    description: '将已有特征、规则、课题成果进行再组合和再利用。',
    stats: { totalVariables: 26, dataSources: 4, exploring: 8, online: 12, archived: 6 }
  },
  {
    id: 'lifecycle-exploring',
    layer: 'lifecycle',
    title: '探索中',
    subtitle: '课题/实验/评估推进中',
    description: '正在探索、评估、比选，尚未进入正式上线阶段。',
    stats: { totalVariables: 41, dataSources: 12, exploring: 41, online: 0, archived: 0 }
  },
  {
    id: 'lifecycle-online',
    layer: 'lifecycle',
    title: '已上线',
    subtitle: '已进入台账与生产使用',
    description: '已完成评审和注册，进入正式特征资产台账。',
    stats: { totalVariables: 66, dataSources: 13, exploring: 0, online: 66, archived: 0 }
  },
  {
    id: 'lifecycle-archived',
    layer: 'lifecycle',
    title: '已归档',
    subtitle: '历史方案、否决、停用沉淀',
    description: '保留过程与结论，便于审计与知识复用。',
    stats: { totalVariables: 27, dataSources: 9, exploring: 0, online: 0, archived: 27 }
  }
]

const panoramaLinks: PanoramaLink[] = [
  { from: 'type-behavior', to: 'source-internal', count: 32 },
  { from: 'type-behavior', to: 'source-reuse', count: 10 },
  { from: 'type-behavior', to: 'source-external', count: 6 },
  { from: 'type-trade', to: 'source-internal', count: 28 },
  { from: 'type-trade', to: 'source-reuse', count: 8 },
  { from: 'type-profile', to: 'source-internal', count: 14 },
  { from: 'type-profile', to: 'source-reuse', count: 9 },
  { from: 'type-profile', to: 'source-external', count: 5 },
  { from: 'type-external', to: 'source-external', count: 23 },
  { from: 'type-external', to: 'source-reuse', count: 6 },
  { from: 'type-external', to: 'source-internal', count: 3 },
  { from: 'source-internal', to: 'lifecycle-exploring', count: 22 },
  { from: 'source-internal', to: 'lifecycle-online', count: 40 },
  { from: 'source-internal', to: 'lifecycle-archived', count: 12 },
  { from: 'source-external', to: 'lifecycle-exploring', count: 11 },
  { from: 'source-external', to: 'lifecycle-online', count: 14 },
  { from: 'source-external', to: 'lifecycle-archived', count: 9 },
  { from: 'source-reuse', to: 'lifecycle-exploring', count: 8 },
  { from: 'source-reuse', to: 'lifecycle-online', count: 12 },
  { from: 'source-reuse', to: 'lifecycle-archived', count: 6 }
]

const panoramaVariables: PanoramaVariable[] = [
  {
    id: 'VAR-2001',
    name: '撞库命中次数_30d',
    variableTypeId: 'behavior',
    variableType: '行为特征',
    exploreCategoryId: 'behavior-attack',
    exploreCategory: '撞库类',
    sourceGroup: '内部数据源',
    lifecycle: 'exploring',
    businessDomain: '反欺诈',
    dataSourceName: 'dwd_attack_log',
    owner: '赵六'
  },
  {
    id: 'VAR-2002',
    name: '撞库IP复用率_7d',
    variableTypeId: 'behavior',
    variableType: '行为特征',
    exploreCategoryId: 'behavior-attack',
    exploreCategory: '撞库类',
    sourceGroup: '历史复用/衍生',
    lifecycle: 'online',
    businessDomain: '反欺诈',
    dataSourceName: 'dm_attack_features',
    owner: '赵六'
  },
  {
    id: 'VAR-2003',
    name: '支用申请次数_30d',
    variableTypeId: 'behavior',
    variableType: '行为特征',
    exploreCategoryId: 'behavior-loan',
    exploreCategory: '支用行为类',
    sourceGroup: '内部数据源',
    lifecycle: 'online',
    businessDomain: '风控',
    dataSourceName: 'dwd_loan_apply',
    owner: '张三',
    topicId: 'EXP-2026-001'
  },
  {
    id: 'VAR-2004',
    name: '支用成功率_7d',
    variableTypeId: 'behavior',
    variableType: '行为特征',
    exploreCategoryId: 'behavior-loan',
    exploreCategory: '支用行为类',
    sourceGroup: '内部数据源',
    lifecycle: 'exploring',
    businessDomain: '风控',
    dataSourceName: 'dwd_loan_apply',
    owner: '张三',
    topicId: 'EXP-2026-001'
  },
  {
    id: 'VAR-2005',
    name: '清退名单命中标识',
    variableTypeId: 'behavior',
    variableType: '行为特征',
    exploreCategoryId: 'behavior-clean',
    exploreCategory: '清退信息类',
    sourceGroup: '内部数据源',
    lifecycle: 'archived',
    businessDomain: '风控',
    dataSourceName: 'dwd_customer_exit',
    owner: '王五'
  },
  {
    id: 'VAR-3001',
    name: '年龄',
    variableTypeId: 'credit',
    variableType: '征信特征',
    exploreCategoryId: 'credit-basic',
    exploreCategory: '个人基本信息',
    sourceGroup: '内部数据源',
    lifecycle: 'online',
    businessDomain: '风控',
    dataSourceName: 'dwd_credit_profile',
    owner: '李四'
  },
  {
    id: 'VAR-3002',
    name: '账户数',
    variableTypeId: 'credit',
    variableType: '征信特征',
    exploreCategoryId: 'credit-account',
    exploreCategory: '账户信息',
    sourceGroup: '内部数据源',
    lifecycle: 'online',
    businessDomain: '风控',
    dataSourceName: 'dwd_credit_account',
    owner: '李四'
  },
  {
    id: 'VAR-3003',
    name: '信贷余额_近6月均值',
    variableTypeId: 'credit',
    variableType: '征信特征',
    exploreCategoryId: 'credit-amount',
    exploreCategory: '信贷金额',
    sourceGroup: '历史复用/衍生',
    lifecycle: 'exploring',
    businessDomain: '风控',
    dataSourceName: 'dm_credit_amount_features',
    owner: '李四'
  },
  {
    id: 'VAR-3004',
    name: '近12月逾期次数',
    variableTypeId: 'credit',
    variableType: '征信特征',
    exploreCategoryId: 'credit-repay',
    exploreCategory: '还款历史',
    sourceGroup: '内部数据源',
    lifecycle: 'online',
    businessDomain: '风控',
    dataSourceName: 'dwd_credit_repay',
    owner: '李四'
  },
  {
    id: 'VAR-3005',
    name: '最近一次逾期天数',
    variableTypeId: 'credit',
    variableType: '征信特征',
    exploreCategoryId: 'credit-repay',
    exploreCategory: '还款历史',
    sourceGroup: '内部数据源',
    lifecycle: 'archived',
    businessDomain: '风控',
    dataSourceName: 'dwd_credit_repay',
    owner: '李四'
  },
  {
    id: 'VAR-4001',
    name: '多头借贷查询次数_30d',
    variableTypeId: 'external',
    variableType: '外数特征',
    exploreCategoryId: 'external-multi-loan',
    exploreCategory: '多头借贷',
    sourceGroup: '外部服务',
    lifecycle: 'online',
    businessDomain: '风控',
    dataSourceName: 'ext_multi_loan_query',
    owner: '李四',
    topicId: 'EXP-2026-002'
  },
  {
    id: 'VAR-4002',
    name: '多头借贷组合特征v1',
    variableTypeId: 'external',
    variableType: '外数特征',
    exploreCategoryId: 'external-multi-loan',
    exploreCategory: '多头借贷',
    sourceGroup: '历史复用/衍生',
    lifecycle: 'online',
    businessDomain: '风控',
    dataSourceName: 'dm_multi_loan_features',
    owner: '李四',
    topicId: 'EXP-2026-002'
  },
  {
    id: 'VAR-4003',
    name: '设备指纹一致性得分',
    variableTypeId: 'external',
    variableType: '外数特征',
    exploreCategoryId: 'external-device',
    exploreCategory: '设备指纹',
    sourceGroup: '外部服务',
    lifecycle: 'exploring',
    businessDomain: '反欺诈',
    dataSourceName: 'ext_device_fingerprint',
    owner: '赵六',
    topicId: 'EXP-2026-004'
  },
  {
    id: 'VAR-4004',
    name: '外部评分稳定度',
    variableTypeId: 'external',
    variableType: '外数特征',
    exploreCategoryId: 'external-score',
    exploreCategory: '外部评分',
    sourceGroup: '外部服务',
    lifecycle: 'archived',
    businessDomain: '风控',
    dataSourceName: 'ext_credit_score',
    owner: '李四'
  },
  {
    id: 'VAR-4005',
    name: '外部风险评分',
    variableTypeId: 'external',
    variableType: '外数特征',
    exploreCategoryId: 'external-score',
    exploreCategory: '外部评分',
    sourceGroup: '外部服务',
    lifecycle: 'online',
    businessDomain: '风控',
    dataSourceName: 'ext_risk_score',
    owner: '李四'
  }
]

const SOURCE_DEFS: Array<{ title: string; subtitle: string; description: string }> = [
  { title: '内部数据源', subtitle: '内部明细/宽表', description: '来源于内部数据表与明细流的特征。' },
  { title: '外部服务', subtitle: '外数接口/征信服务', description: '来源于外部接口、供应商服务或外数数据的特征。' },
  { title: '历史复用/衍生', subtitle: '复用/组合/派生', description: '对已有特征或课题结果的复用与衍生。' }
]

function computeStats(list: PanoramaVariable[]): PanoramaStats {
  const dataSources = new Set(list.map((item) => item.dataSourceName)).size
  return {
    totalVariables: list.length,
    dataSources,
    exploring: list.filter((item) => item.lifecycle === 'exploring').length,
    online: list.filter((item) => item.lifecycle === 'online').length,
    archived: list.filter((item) => item.lifecycle === 'archived').length
  }
}

function buildLifecycleBranches(baseId: string, list: PanoramaVariable[]): PanoramaLifecycleBranch[] {
  const defs: Array<{ key: VariableLifecycle; title: string }> = [
    { key: 'exploring', title: '探索中' },
    { key: 'online', title: '已上线' },
    { key: 'archived', title: '已归档' }
  ]
  return defs.map((def) => ({
    id: `${baseId}-${def.key}`,
    title: def.title,
    stats: computeStats(list.filter((item) => item.lifecycle === def.key))
  }))
}

function buildSourceBranches(baseId: string, list: PanoramaVariable[]): PanoramaSourceBranch[] {
  return SOURCE_DEFS.map((source) => {
    const sourceVars = list.filter((item) => item.sourceGroup === source.title)
    return {
      id: `${baseId}-${source.title}`,
      title: source.title,
      subtitle: source.subtitle,
      description: source.description,
      stats: computeStats(sourceVars),
      lifecycles: buildLifecycleBranches(`${baseId}-${source.title}`, sourceVars)
    }
  })
}

function buildCategoryBranches(typeId: string) {
  const type = ExploreTaxonomyStore.getTypeById(typeId)
  const leafCategories = ExploreTaxonomyStore.listLeafCategories(typeId)
  const typeTitle = type?.title || typeId
  return leafCategories.map((category) => {
    const categoryVars = panoramaVariables.filter(
      (item) => item.variableTypeId === typeId && item.exploreCategoryId === category.id
    )
    const baseId = `${typeId}-${category.id}`
    return {
      id: baseId,
      title: category.title,
      subtitle: typeTitle,
      description: `探索分类：${category.title}（归属 ${typeTitle}）`,
      stats: computeStats(categoryVars),
      sources: buildSourceBranches(baseId, categoryVars)
    }
  })
}

function buildTypeTree(): PanoramaTypeBranch[] {
  const types = ExploreTaxonomyStore.listTypes()
  return types.map((type) => {
    const typeVars = panoramaVariables.filter((item) => item.variableTypeId === type.id)
    return {
      id: type.id,
      title: type.title,
      subtitle: type.description,
      description: type.description,
      stats: computeStats(typeVars),
      categories: buildCategoryBranches(type.id)
    }
  })
}

export function getPanoramaNodes(layer?: PanoramaLayer) {
  return layer ? panoramaNodes.filter((item) => item.layer === layer) : panoramaNodes
}

export function getPanoramaLinks() {
  return panoramaLinks
}

export function getPanoramaVariables() {
  return panoramaVariables
}

export function getPanoramaSummary() {
  const stats = computeStats(panoramaVariables)
  return {
    totalVariables: stats.totalVariables,
    totalDataSources: stats.dataSources,
    exploring: stats.exploring,
    online: stats.online,
    archived: stats.archived
  }
}

export function getPanoramaTypeTree() {
  return buildTypeTree()
}

export function getNodeVariables(node: PanoramaNode) {
  if (node.layer === 'type') {
    return panoramaVariables.filter((item) => item.variableType === node.title)
  }
  if (node.layer === 'source') {
    return panoramaVariables.filter((item) => item.sourceGroup === node.title)
  }
  return panoramaVariables.filter((item) => {
    if (node.id === 'lifecycle-exploring') return item.lifecycle === 'exploring'
    if (node.id === 'lifecycle-online') return item.lifecycle === 'online'
    return item.lifecycle === 'archived'
  })
}
