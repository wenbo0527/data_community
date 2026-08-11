/**
 * 概念词典(P2#1 整合点)
 *
 * 用户旅程分析中识别的最大概念混淆:
 *   - 标签(Tag) vs 人群(Audience/Crowd) vs 圈选(Crowd Query)
 *   - 数据地图 vs 资产目录 vs 资产总览
 *
 * 提供统一的概念定义、关联关系、UI 提示。
 */

export interface GlossaryTerm {
  key: string
  name: string // 中文展示名
  nameEn?: string
  shortDesc: string // 一句话描述
  longDesc: string // 详细描述
  examples: string[] // 例子
  relatedTerms?: string[] // 关联概念 key
  module: string // 主要归属模块
  uiHint?: string // UI 上展示的提示
}

export const GLOSSARY: Record<string, GlossaryTerm> = {
  // === 标签/人群/圈选 ===
  tag: {
    key: 'tag',
    name: '标签',
    nameEn: 'Tag',
    shortDesc: '用户的某个属性(BOOL/枚举/数值)',
    longDesc: '标签是对用户单一属性的客观标注,通常是 BOOL(是否新客)、枚举(用户等级)或数值(累计消费金额)。标签通过 ETL 定期刷新,反映用户"现在"的状态。',
    examples: [
      'BOOL 标签:是否新注册用户',
      '枚举标签:用户价值分层(A/B/C/D)',
      '数值标签:近 30 天消费金额'
    ],
    relatedTerms: ['audience', 'crowd_query'],
    module: 'exploration + management',
    uiHint: '标签是"用户属性"'
  },
  audience: {
    key: 'audience',
    name: '人群',
    nameEn: 'Audience',
    shortDesc: '符合一组条件的用户集合',
    longDesc: '人群是通过若干规则(或标签组合)圈选出来的用户集合,有具体的人数和名单。人群是"动态结果集",每次刷新可能变化。',
    examples: [
      '"近 30 天活跃 + 信用良好" 用户',
      '"上海地区 + 女性 + 25-35 岁" 用户',
      '合并多标签圈选:高价值 + 高活跃'
    ],
    relatedTerms: ['tag', 'crowd_query'],
    module: 'exploration',
    uiHint: '人群是"用户集合"'
  },
  crowd_query: {
    key: 'crowd_query',
    name: '圈选',
    nameEn: 'Crowd Query',
    shortDesc: '圈选是"创建人群"的动作或规则',
    longDesc: '圈选指"通过规则找出哪些用户",是创建人群的过程/规则本身。一个圈选结果可以保存为人群,也可以固化为标签。',
    examples: [
      '"近 7 天有登录" 圈选规则',
      '"消费 > 1000 且未退款" 圈选规则',
      '可视化圈选:筛选条件 + 组合'
    ],
    relatedTerms: ['audience', 'tag'],
    module: 'exploration',
    uiHint: '圈选是"创建人群的动作"'
  },

  // === 数据地图相关 ===
  data_map: {
    key: 'data_map',
    name: '数据地图',
    nameEn: 'Data Map',
    shortDesc: '数据资产的全景视图',
    longDesc: '数据地图是平台所有数据资产的统一入口,涵盖表、字段、血缘、质量、Owner 等元数据,支持按业务域、主题域快速定位。',
    examples: [
      '查看表 dim_user 的字段血缘',
      '按业务域"用户域"浏览所有表',
      '查看表 A 的 Owner 和质量评分'
    ],
    relatedTerms: ['asset_catalog', 'asset_overview'],
    module: 'discovery',
    uiHint: '统一名称"数据地图"'
  },
  asset_catalog: {
    key: 'asset_catalog',
    name: '资产目录',
    shortDesc: '同义词,已统一为"数据地图"',
    longDesc: '历史上"资产目录"与"数据地图"指同一概念。本词典统一为"数据地图"。',
    examples: ['未来不再使用"资产目录"名称'],
    relatedTerms: ['data_map'],
    module: 'discovery',
    uiHint: '⚠️ 已统一为"数据地图"'
  },
  asset_overview: {
    key: 'asset_overview',
    name: '资产总览',
    shortDesc: '同义词,已统一为"资产总览"',
    longDesc: '历史上"资产总览"指 KPI 卡片式的资产数量统计,与"数据地图"是同一概念的不同视角(总览 vs 详情)。',
    examples: ['/discovery/asset-overview 已重定向至 /discovery/asset-catalog'],
    relatedTerms: ['data_map'],
    module: 'discovery',
    uiHint: '是"数据地图"的首页摘要'
  },

  // === 指标 ===
  metric: {
    key: 'metric',
    name: '指标',
    nameEn: 'Metric',
    shortDesc: '可量化的业务度量',
    longDesc: '指标是经过业务定义的、可量化的度量,如 DAU、转化率、GMV。指标由口径(业务定义)、来源表、加工逻辑、Owner 共同定义。',
    examples: ['DAU(日活跃用户数)', 'GMV(成交总额)', '授信通过率'],
    module: 'discovery + management + exploration'
  },

  // === 数据集 ===
  table: {
    key: 'table',
    name: '数据表',
    nameEn: 'Table',
    shortDesc: '物理存储的数据表',
    longDesc: '数据表是物理存储层面的二维表,有 schema(字段)和 partition。表是数据的"形态",指标/标签/人群都是基于表加工的。',
    examples: ['dim_user (用户维度表)', 'fact_loan_apply (贷款申请事实表)'],
    module: 'discovery'
  },

  // === 业务概念 ===
  business_concept: {
    key: 'business_concept',
    name: '业务概念',
    nameEn: 'Business Concept',
    shortDesc: '业务语义的抽象实体',
    longDesc: '业务概念是数据之上的业务语义层,包括业务域(用户域/风控域)、业务实体(用户/账户)、业务要素(姓名/身份证号)。',
    examples: ['业务域"用户域"', '业务实体"客户"', '业务要素"客户姓名"'],
    module: 'management'
  }
}

/**
 * 概念词典 composable
 *
 * 用法:
 *   const { getTerm, compareTerms } = useGlossary()
 *   getTerm('tag')  // 标签的定义
 *   compareTerms('tag', 'audience')  // 对比标签 vs 人群
 */
export function useGlossary() {
  const getTerm = (key: string): GlossaryTerm | undefined => GLOSSARY[key]

  const compareTerms = (keyA: string, keyB: string) => {
    const a = GLOSSARY[keyA]
    const b = GLOSSARY[keyB]
    if (!a || !b) return null
    return {
      a: { key: a.key, name: a.name, shortDesc: a.shortDesc },
      b: { key: b.key, name: b.name, shortDesc: b.shortDesc }
    }
  }

  /**
   * UI 提示:工具提示气泡
   */
  const tooltip = (key: string): string => {
    const term = GLOSSARY[key]
    if (!term) return ''
    return `${term.name}:${term.shortDesc}`
  }

  /**
   * 获取所有术语(供文档/UI 渲染)
   */
  const list = (): GlossaryTerm[] => Object.values(GLOSSARY)

  /**
   * 按模块查术语
   */
  const byModule = (module: string): GlossaryTerm[] =>
    list().filter(t => t.module.includes(module))

  return { getTerm, compareTerms, tooltip, list, byModule }
}