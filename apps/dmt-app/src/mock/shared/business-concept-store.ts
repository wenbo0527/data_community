export interface BusinessDomain {
  code: string
  name: string
  owner: string
  description: string
  coverage: string
}

export interface BusinessEntityAttribute {
  code: string
  name: string
  type: 'general' | 'extended'
  dataType: string
  extendedConfig: string
}

export interface BusinessEntity {
  code: string
  name: string
  domainCode: string
  description: string
  coreRelations: string[]
  attributes: BusinessEntityAttribute[]
}

export interface BusinessRelation {
  name: string
  sourceEntityCode: string
  targetEntityCode: string
  type: string
}

interface RelatedElement {
  code: string
  name: string
  type: 'metric' | 'tag' | 'variable' | 'caliber'
  relatedAsset: string
  relatedResource?: {
    table: string
    field: string
  }
}

interface RelatedTable {
  name: string
  description: string
  type: string
  owner: string
}

const domains: BusinessDomain[] = [
  {
    code: 'DOM001',
    name: '客户域',
    owner: '客户运营组',
    description: '沉淀客户身份、画像与生命周期的基础概念。',
    coverage: '客户主档、画像标签、身份核验'
  },
  {
    code: 'DOM002',
    name: '账户域',
    owner: '账户产品组',
    description: '统一账户、额度、绑卡与账户状态等概念。',
    coverage: '账户主档、额度账户、绑卡账户'
  },
  {
    code: 'DOM003',
    name: '授信域',
    owner: '授信策略组',
    description: '描述授信申请、授信结果与风险评估过程。',
    coverage: '授信申请、审批结果、评分卡'
  },
  {
    code: 'DOM004',
    name: '支用域',
    owner: '支用产品组',
    description: '沉淀借据、支用申请与放款结果的业务抽象。',
    coverage: '支用申请、借据、放款事件'
  },
  {
    code: 'DOM005',
    name: '还款域',
    owner: '贷后运营组',
    description: '承载账单、还款计划、实还流水与结清状态。',
    coverage: '账单、实还、结清、逾期'
  },
  {
    code: 'DOM006',
    name: '贷后域',
    owner: '贷后管理组',
    description: '覆盖催收、预警、风险复评与处置动作。',
    coverage: '催收任务、预警事件、处置策略'
  }
]

const entities: BusinessEntity[] = [
  {
    code: 'ENT001',
    name: '客户',
    domainCode: 'DOM001',
    description: '统一承载个人客户的身份、画像和生命周期状态。',
    coreRelations: ['客户拥有账户', '客户发起授信申请'],
    attributes: [
      { code: 'customer_id', name: '客户ID', type: 'general', dataType: 'string', extendedConfig: '主键' },
      { code: 'customer_level', name: '客户层级', type: 'extended', dataType: 'string', extendedConfig: '标签枚举' }
    ]
  },
  {
    code: 'ENT002',
    name: '账户',
    domainCode: 'DOM002',
    description: '描述账户状态、额度信息和账户生命周期。',
    coreRelations: ['账户属于客户', '账户承载借据'],
    attributes: [
      { code: 'account_id', name: '账户ID', type: 'general', dataType: 'string', extendedConfig: '唯一标识' },
      { code: 'credit_limit', name: '授信额度', type: 'extended', dataType: 'number', extendedConfig: '额度单位元' }
    ]
  },
  {
    code: 'ENT003',
    name: '授信申请',
    domainCode: 'DOM003',
    description: '描述用户发起授信时的申请单与审批信息。',
    coreRelations: ['客户提交授信申请', '授信申请生成授信结果'],
    attributes: [
      { code: 'apply_id', name: '申请单号', type: 'general', dataType: 'string', extendedConfig: '申请主键' },
      { code: 'score', name: '评分卡分数', type: 'extended', dataType: 'number', extendedConfig: '授信评分' }
    ]
  },
  {
    code: 'ENT004',
    name: '借据',
    domainCode: 'DOM004',
    description: '描述支用申请成功后形成的借据资产。',
    coreRelations: ['借据关联账户', '借据生成账单'],
    attributes: [
      { code: 'loan_no', name: '借据号', type: 'general', dataType: 'string', extendedConfig: '借据唯一号' },
      { code: 'loan_amount', name: '支用金额', type: 'extended', dataType: 'number', extendedConfig: '金额单位元' }
    ]
  },
  {
    code: 'ENT005',
    name: '账单',
    domainCode: 'DOM005',
    description: '描述还款计划、实还金额及账单状态。',
    coreRelations: ['账单归属借据', '账单触发贷后预警'],
    attributes: [
      { code: 'bill_no', name: '账单号', type: 'general', dataType: 'string', extendedConfig: '账单唯一号' },
      { code: 'due_date', name: '应还日', type: 'extended', dataType: 'date', extendedConfig: '账期字段' }
    ]
  },
  {
    code: 'ENT006',
    name: '贷后任务',
    domainCode: 'DOM006',
    description: '描述风险预警、催收与处置动作的执行对象。',
    coreRelations: ['贷后任务跟踪账单', '贷后任务回流客户画像'],
    attributes: [
      { code: 'task_id', name: '任务ID', type: 'general', dataType: 'string', extendedConfig: '任务主键' },
      { code: 'task_status', name: '任务状态', type: 'extended', dataType: 'string', extendedConfig: '待处理/处理中/已完成' }
    ]
  }
]

const relations: BusinessRelation[] = [
  { name: '客户拥有账户', sourceEntityCode: 'ENT001', targetEntityCode: 'ENT002', type: 'association' },
  { name: '客户提交授信申请', sourceEntityCode: 'ENT001', targetEntityCode: 'ENT003', type: 'behavior' },
  { name: '授信申请生成借据', sourceEntityCode: 'ENT003', targetEntityCode: 'ENT004', type: 'derivative' },
  { name: '账户承载借据', sourceEntityCode: 'ENT002', targetEntityCode: 'ENT004', type: 'composition' },
  { name: '借据生成账单', sourceEntityCode: 'ENT004', targetEntityCode: 'ENT005', type: 'dependency' },
  { name: '账单触发贷后任务', sourceEntityCode: 'ENT005', targetEntityCode: 'ENT006', type: 'association' }
]

const entityElementsMap: Record<string, RelatedElement[]> = {
  ENT001: [
    {
      code: 'TAG001',
      name: '客户分层标签',
      type: 'tag',
      relatedAsset: '客户标签中心',
      relatedResource: { table: 'dm_customer_profile', field: 'customer_level_tag' }
    },
    {
      code: 'VAR001',
      name: '实名核验一致性变量',
      type: 'variable',
      relatedAsset: '变量中心',
      relatedResource: { table: 'ads_identity_verify_result', field: 'identity_match_flag' }
    }
  ],
  ENT002: [
    {
      code: 'MET001',
      name: '账户可用额度',
      type: 'metric',
      relatedAsset: '额度指标',
      relatedResource: { table: 'dm_account_quota', field: 'available_limit' }
    }
  ],
  ENT003: [
    {
      code: 'CAL001',
      name: '授信通过口径',
      type: 'caliber',
      relatedAsset: '授信分析看板',
      relatedResource: { table: 'ads_credit_approval', field: 'approval_status' }
    }
  ],
  ENT004: [
    {
      code: 'VAR002',
      name: '支用金额区间变量',
      type: 'variable',
      relatedAsset: '变量中心',
      relatedResource: { table: 'dwd_loan_order', field: 'loan_amount_band' }
    }
  ],
  ENT005: [
    {
      code: 'MET002',
      name: '当期应还金额',
      type: 'metric',
      relatedAsset: '还款经营看板',
      relatedResource: { table: 'dws_bill_summary', field: 'due_amount' }
    }
  ],
  ENT006: [
    {
      code: 'TAG002',
      name: '催收优先级标签',
      type: 'tag',
      relatedAsset: '贷后任务中心',
      relatedResource: { table: 'dm_collection_task', field: 'priority_level' }
    }
  ]
}

const entityTableMap: Record<string, RelatedTable[]> = {
  ENT001: [
    {
      name: 'dm_customer_profile',
      description: '客户画像宽表，汇总基础身份与标签信息。',
      type: '宽表',
      owner: '客户数据组'
    }
  ],
  ENT002: [
    {
      name: 'dm_account_quota',
      description: '账户额度快照表。',
      type: '主题表',
      owner: '账户数据组'
    }
  ],
  ENT003: [
    {
      name: 'ads_credit_approval',
      description: '授信申请与审批结果事实表。',
      type: '事实表',
      owner: '授信策略组'
    }
  ],
  ENT004: [
    {
      name: 'dwd_loan_order',
      description: '支用订单与借据主事实表。',
      type: '事实表',
      owner: '支用数据组'
    }
  ],
  ENT005: [
    {
      name: 'dws_bill_summary',
      description: '账单汇总及还款计划表。',
      type: '汇总表',
      owner: '还款数据组'
    }
  ],
  ENT006: [
    {
      name: 'dm_collection_task',
      description: '贷后任务与催收进度主题表。',
      type: '主题表',
      owner: '贷后数据组'
    }
  ]
}

export const BusinessConceptStore = {
  getDomains: (): BusinessDomain[] => domains,
  getEntities: (): BusinessEntity[] => entities,
  getRelations: (): BusinessRelation[] => relations,
  getEntityRelatedElements: (entityCode: string): RelatedElement[] => entityElementsMap[entityCode] || [],
  getEntityRelatedTables: (entityCode: string): RelatedTable[] => entityTableMap[entityCode] || []
}

export default BusinessConceptStore
