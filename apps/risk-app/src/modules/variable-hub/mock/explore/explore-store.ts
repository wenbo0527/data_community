export type ExploreVisibility = 'team' | 'company' | 'audit'
export type ExploreTopicStatus = 'exploring' | 'adopted' | 'rejected' | 'paused'

/**
 * 需求 2 状态（文档 §三 模块 A · F-01）
 * 需求受理 / 需求驳回
 * 仅 demandType='derivation' 的 topic 才会走此状态机
 */
export type DerivationStatus = 'requirement_accepted' | 'rejected'

/**
 * 需求类型：探索课题 vs 衍生需求
 * - topic：探索中→已采纳/否决/暂缓
 * - derivation：需求 2 状态（需求受理/需求驳回）
 */
export type DemandType = 'topic' | 'derivation'
export type ExplorePriority = 'high' | 'medium' | 'low'
export type ExploreDecisionResult = 'adopted' | 'rejected' | 'paused'

/**
 * 探索中心台账展示用的"特征当前状态"枚举
 * 与 §6.5 探索中心台账展示与状态同步机制 对齐
 * 注意：探索中心不维护此状态机，仅只读展示
 */
export type VariableSyncStatus =
  | 'none'              // 无关联特征（如已否决/已暂缓/未采纳）
  | 'pending_approval'  // 特征中心：待审批
  | 'pending_deploy'    // 特征中心：待部署
  | 'online'            // 特征中心：已上线
  | 'rejected'          // 特征中心：审批驳回（探索中心自动回退到已暂缓）

export interface VariableSyncInfo {
  /** 关联特征ID（生成草稿后写入） */
  variableId: string
  /** 特征当前状态 */
  status: VariableSyncStatus
  /** 状态变更时间戳（演示同步延迟） */
  updatedAt: string
  /** 实际上线时间（仅当 status='online'） */
  onlineAt?: string
  /** 驳回原因（仅当 status='rejected'） */
  rejectedReason?: string
  /** 同步事件历史（用于审计页） */
  events: Array<{
    at: string
    from: VariableSyncStatus
    to: VariableSyncStatus
    note?: string
  }>
}

export interface ExploreTopic {
  id: string
  /** 需求类型（默认 topic，衍生需求为 derivation） */
  demandType?: DemandType
  name: string
  businessProblem: string
  hypothesis: string
  domainTags: string[]
  variableTypeTags: string[]
  variableTypeId?: string
  exploreCategoryId?: string
  exploreCategoryTitle?: string
  relatedDataSourceId?: string
  relatedDataSourceName?: string
  relatedVariableIds?: string[]
  priority: ExplorePriority
  visibility: ExploreVisibility
  status: ExploreTopicStatus
  owner: string
  createdAt: string
  updatedAt: string
  relatedResources: Array<
    | { type: 'table'; name: string; displayName: string }
    | { type: 'external_service'; name: string; displayName: string }
    | { type: 'credit_table'; name: string; displayName: string }
    | { type: 'data_source'; name: string; displayName: string }
    | { type: 'variable'; name: string; displayName: string }
  >
  referencedTopicIds: string[]
  /**
   * 关联特征同步信息（仅在状态为已采纳时有值）
   * 探索中心只读展示，状态变更由特征中心事件驱动
   */
  variableSync?: VariableSyncInfo
  /** ============ 需求专属字段（demandType='derivation' 时使用） ============ */
  /** 需求 2 状态（需求受理/需求驳回） */
  derivationStatus?: DerivationStatus
  /** 驳回原因（仅 rejected 状态有值） */
  rejectReason?: string
  /** 驳回时间 */
  rejectedAt?: string
  /** 提出人 & 处理人 */
  proposer?: string                      // 提出人（需求发起方）
  handler?: string                       // 处理人（负责跟进的业务方）
  syncLevel?: string                     // 业务同步等级（S/A/B/C）
  /** 业务场景：贷前/贷中/贷后 */
  businessScene?: string
  /** 预期效果 */
  expectedEffect?: string
  /** 品类：默认 midloan_behavior（衍生需求锁定为贷中行为） */
  category?: string
  /** 关联数据源：Hbase */
  dataSource?: string
  /** 特征核心属性 */
  featureEnName?: string
  featureCnName?: string
  fieldType?: string
  processingLogic?: string
  defaultValue?: string
  l1Category?: string
  l2Category?: string
  sourceTableAfter?: string
  sourceTableBefore?: string
  originFeatureEnName?: string
  dataFreshness?: string
  developer?: string
  excelReport?: string
  /** 注册阶段补充 */
  dataTableName?: string
  dwTaskId?: string
  productScope?: string
  listType?: string
  batch?: string
  acceptor?: string
  remark?: string
  /** 关联特征ID（注册后写入） */
  featureId?: string
}

export interface ExploreExperiment {
  id: string
  topicId: string
  name: string
  tableVersion: string
  timeWindow: string
  sampleScope: string
  transformLogic: string
  thresholdConfig: string
  metrics: {
    iv?: number
    ks?: number
    psi?: number
    coverage?: number
  }
  conclusion: string
  recommendation: 'go' | 'no_go' | 'need_more'
  executor: string
  startedAt: string
  finishedAt: string
  tags: string[]
}

export interface ExploreDecision {
  id: string
  topicId: string
  result: ExploreDecisionResult
  decider: string
  decidedAt: string
  rationale: string
  extensionPlan?: {
    recommendedVariables: Array<{ name: string; bestExperimentId: string }>
    expectedLaunchDate: string
    resourceEstimate: string
    risks: string
    notes: string
  }
  signatureStatus: 'mock_verified' | 'pending'
}

export interface ExploreAuditEvent {
  id: string
  topicId: string
  occurredAt: string
  operator: string
  action: string
  field: string
  beforeValue: string
  afterValue: string
  reason: string
}

const topicMocks: ExploreTopic[] = [
  {
    id: 'EXP-2026-001',
    name: '风控_逾期前行为特征_202606',
    businessProblem: '逾期前30天，客户行为有哪些可量化的预警信号？',
    hypothesis: '交易频次突降 + 还款金额递减 = 逾期预警特征',
    domainTags: ['风控'],
    variableTypeTags: ['行为类', '交易类'],
    exploreCategoryId: 'behavior-loan',
    exploreCategoryTitle: '支用行为类',
    priority: 'high',
    visibility: 'company',
    status: 'exploring',
    owner: '张三',
    createdAt: '2026-06-01 10:00:00',
    updatedAt: '2026-06-26 10:30:00',
    relatedResources: [
      { type: 'data_source', name: 'internal', displayName: '内部数仓' },
      { type: 'table', name: 'dwd_user_behavior', displayName: '用户行为明细表' }
    ],
    referencedTopicIds: []
  },
  {
    id: 'EXP-2026-002',
    name: '风控_多头借贷特征优化_202606',
    businessProblem: '在既有外数成本约束下，是否存在更高 ROI 的多头特征组合？',
    hypothesis: '外部多头查询 + 近30天借款行为组合可提升区分度',
    domainTags: ['风控'],
    variableTypeTags: ['外部类'],
    exploreCategoryId: 'external-multi-loan',
    exploreCategoryTitle: '多头借贷',
    priority: 'medium',
    visibility: 'team',
    status: 'adopted',
    owner: '李四',
    createdAt: '2026-05-20 09:00:00',
    updatedAt: '2026-06-20 14:10:00',
    relatedResources: [
      { type: 'external_service', name: 'ext_multi_loan_query', displayName: '外部多头查询服务' }
    ],
    referencedTopicIds: ['EXP-2026-001'],
    // 演示数据：已采纳课题的关联特征已处于"已上线"状态
    variableSync: {
      variableId: 'VAR-DRAFT-002',
      status: 'online',
      updatedAt: '2026-06-25 16:30:00',
      onlineAt: '2026-06-25 16:30:00',
      events: [
        { at: '2026-06-20 14:30:00', from: 'none', to: 'pending_approval', note: '采纳决策生成草稿' },
        { at: '2026-06-22 10:15:00', from: 'pending_approval', to: 'pending_deploy', note: '审批通过' },
        { at: '2026-06-25 16:30:00', from: 'pending_deploy', to: 'online', note: '部署成功' }
      ]
    }
  },
  {
    id: 'EXP-2026-003',
    name: '营销_响应率预测特征_202606',
    businessProblem: '营销触达响应率的预测特征是否可提升活动投放效果？',
    hypothesis: 'APP使用频次 + 近期消费偏好 = 响应率提升信号',
    domainTags: ['营销'],
    variableTypeTags: ['行为类', '画像类'],
    exploreCategoryId: 'behavior-loan',
    exploreCategoryTitle: '支用行为类',
    priority: 'low',
    visibility: 'company',
    status: 'rejected',
    owner: '王五',
    createdAt: '2026-06-05 13:20:00',
    updatedAt: '2026-06-15 18:00:00',
    relatedResources: [
      { type: 'data_source', name: 'internal', displayName: '内部数仓' },
      { type: 'table', name: 'dm_customer_profile', displayName: '客户画像宽表' }
    ],
    referencedTopicIds: []
  },
  {
    id: 'EXP-2026-004',
    name: '反欺诈_设备指纹探索_202606',
    businessProblem: '设备层面的异常是否能作为反欺诈早期预警？',
    hypothesis: '设备更换频次 + 异地登录 = 异常风险',
    domainTags: ['反欺诈'],
    variableTypeTags: ['行为类'],
    exploreCategoryId: 'behavior-attack',
    exploreCategoryTitle: '撞库类',
    priority: 'medium',
    visibility: 'audit',
    status: 'paused',
    owner: '赵六',
    createdAt: '2026-06-10 11:10:00',
    updatedAt: '2026-06-25 09:00:00',
    relatedResources: [
      { type: 'data_source', name: 'internal', displayName: '内部数仓' },
      { type: 'table', name: 'dwd_login_event', displayName: '登录事件明细表' }
    ],
    referencedTopicIds: []
  }
]

const STORAGE_KEY = 'explore.topics.extra'
const DECISION_KEY = 'explore.decisions.extra'
const AUDIT_KEY = 'explore.audit.extra'
const EXPERIMENT_KEY = 'explore.experiments.extra'

function safeParse(raw: string | null): ExploreTopic[] {
  if (!raw) return []
  try {
    const data = JSON.parse(raw)
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

function readExtraTopics() {
  return safeParse(localStorage.getItem(STORAGE_KEY))
}

function writeExtraTopics(list: ExploreTopic[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

function nowFmt() {
  return new Date().toISOString().slice(0, 19).replace('T', ' ')
}

function nextTopicId() {
  const prefix = 'EXP-2026-'
  const all = [...readExtraTopics(), ...topicMocks, ...derivationMocks]
  const nums = all
    .map((t) => String(t.id))
    .filter((id) => id.startsWith(prefix))
    .map((id) => Number(id.slice(prefix.length)))
    .filter((n) => !Number.isNaN(n))
  const next = (nums.length ? Math.max(...nums) : 0) + 1
  return `${prefix}${String(next).padStart(3, '0')}`
}

function nextDecisionId() {
  const all = [...readExtraDecisions(), ...decisionMocks]
  const nums = all
    .map((d) => String(d.id))
    .filter((id) => id.startsWith('DEC-'))
    .map((id) => Number(id.slice(4)))
    .filter((n) => !Number.isNaN(n))
  return `DEC-${String((nums.length ? Math.max(...nums) : 0) + 1).padStart(3, '0')}`
}

function nextAuditId() {
  const all = [...readExtraAudit(), ...auditMocks]
  const nums = all
    .map((a) => String(a.id))
    .filter((id) => id.startsWith('AUD-'))
    .map((id) => Number(id.slice(4)))
    .filter((n) => !Number.isNaN(n))
  return `AUD-${String((nums.length ? Math.max(...nums) : 0) + 1).padStart(3, '0')}`
}

function nextExperimentId() {
  const all = [...readExtraExperiments(), ...experimentMocks]
  const nums = all
    .map((e) => String(e.id))
    .filter((id) => id.startsWith('RUN-'))
    .map((id) => Number(id.slice(4)))
    .filter((n) => !Number.isNaN(n))
  return `RUN-${String((nums.length ? Math.max(...nums) : 0) + 1).padStart(3, '0')}`
}

function readExtraDecisions(): ExploreDecision[] {
  const data = safeParse(localStorage.getItem(DECISION_KEY))
  return (Array.isArray(data) ? data : []) as unknown as ExploreDecision[]
}

function writeExtraDecisions(list: ExploreDecision[]) {
  localStorage.setItem(DECISION_KEY, JSON.stringify(list))
}

function readExtraAudit(): ExploreAuditEvent[] {
  const data = safeParse(localStorage.getItem(AUDIT_KEY))
  return (Array.isArray(data) ? data : []) as unknown as ExploreAuditEvent[]
}

function writeExtraAudit(list: ExploreAuditEvent[]) {
  localStorage.setItem(AUDIT_KEY, JSON.stringify(list))
}

function readExtraExperiments(): ExploreExperiment[] {
  const data = safeParse(localStorage.getItem(EXPERIMENT_KEY))
  return (Array.isArray(data) ? data : []) as unknown as ExploreExperiment[]
}

function writeExtraExperiments(list: ExploreExperiment[]) {
  localStorage.setItem(EXPERIMENT_KEY, JSON.stringify(list))
}

const experimentMocks: ExploreExperiment[] = [
  {
    id: 'RUN-001',
    topicId: 'EXP-2026-001',
    name: '近6月交易频次测试',
    tableVersion: 'T-1_20260625',
    timeWindow: '2025-12 ~ 2026-05',
    sampleScope: '全量活跃客户',
    transformLogic: 'txn_count_30d / active_days_30d',
    thresholdConfig: '5分箱',
    metrics: { iv: 0.38, ks: 0.34, psi: 0.06, coverage: 0.853 },
    conclusion: '交易频次特征区分度较好，稳定性可接受。',
    recommendation: 'go',
    executor: '张三',
    startedAt: '2026-06-24 09:00:00',
    finishedAt: '2026-06-24 11:30:00',
    tags: ['首轮验证']
  },
  {
    id: 'RUN-002',
    topicId: 'EXP-2026-001',
    name: '近3月还款金额趋势',
    tableVersion: 'T-1_20260625',
    timeWindow: '2026-03 ~ 2026-05',
    sampleScope: '全量活跃客户',
    transformLogic: 'repay_amount_30d_slope',
    thresholdConfig: '3分箱',
    metrics: { iv: 0.22, ks: 0.21, psi: 0.08, coverage: 0.921 },
    conclusion: '还款金额趋势特征效果一般，需进一步探索组合方式。',
    recommendation: 'need_more',
    executor: '张三',
    startedAt: '2026-06-25 13:00:00',
    finishedAt: '2026-06-25 15:20:00',
    tags: ['参数调优']
  },
  {
    id: 'RUN-003',
    topicId: 'EXP-2026-002',
    name: '多头外数 + 借款行为组合 v1',
    tableVersion: 'EXT_20260618',
    timeWindow: '2026-01 ~ 2026-05',
    sampleScope: '授信申请客群',
    transformLogic: 'ext_multi_loan_cnt_30d + loan_apply_cnt_30d',
    thresholdConfig: '5分箱',
    metrics: { iv: 0.45, ks: 0.38, psi: 0.05, coverage: 0.812 },
    conclusion: '组合特征效果最优，建议进入采纳决策。',
    recommendation: 'go',
    executor: '李四',
    startedAt: '2026-06-18 10:00:00',
    finishedAt: '2026-06-18 12:10:00',
    tags: ['外数', '组合特征']
  }
]

// ============ 需求（从 derivations.ts 合并 · 文档 §三 模块 A · F-01）============
// 这些数据原本在 derivations.ts 中，现在作为 demandType='derivation' 的 ExploreTopic 存在
// 3 状态：需求提出 → 特征注册 / 特征归档
// 已合并到课题页统一管理
const derivationMocks: ExploreTopic[] = [
  {
    id: 'DRV-20260725-0001',
    demandType: 'derivation',
    name: '近30日大额交易次数',
    businessScene: '贷中',
    expectedEffect: '识别异常消费模式，辅助贷中反欺诈策略',
    category: 'midloan_behavior',
    dataSource: 'Hbase',
    featureEnName: 'MIDLOAN_BIGTXN_CNT_30D',
    featureCnName: '近30日大额交易次数',
    fieldType: 'Integer',
    processingLogic: '从 dwd_trade_detail 过滤 amount >= 5000 的成功记录，按 user_id 维度统计 30 天滚动窗口',
    defaultValue: '0',
    l1Category: 'credit_grant',
    l2Category: 'credit_grant_amount',
    sourceTableAfter: 'ads_midloan_bigtxn_30d',
    sourceTableBefore: 'dwd_trade_detail',
    dataFreshness: 'offline_t1',
    developer: '王数仓',
    dataTableName: 'ads_midloan_bigtxn_30d',
    dwTaskId: 'DW-TASK-998877',
    productScope: '现金贷',
    listType: 'none',
    batch: '2026Q3',
    acceptor: '小李',
    derivationStatus: 'requirement_accepted',
    featureId: 'MIDLOAN-FEAT-0001',
    businessProblem: '贷中反欺诈需要识别异常大额交易',
    hypothesis: '近30日大额交易次数特征可显著提升欺诈识别效果',
    domainTags: ['风控'],
    variableTypeTags: ['数值型'],
    priority: 'high',
    visibility: 'team',
    status: 'adopted',
    owner: '小李',
    proposer: '小李',
    handler: '业务方-张三',
    syncLevel: 'S',
    createdAt: '2026-07-25 10:00:00',
    updatedAt: '2026-08-01 09:30:00',
    relatedResources: [
      { type: 'table', name: 'dwd_trade_detail', displayName: 'dwd_trade_detail' }
    ],
    referencedTopicIds: []
  },
  {
    id: 'DRV-20260801-0007',
    demandType: 'derivation',
    name: '近7日还款波动率',
    businessScene: '贷中',
    expectedEffect: '贷中风险预警，发现还款异常',
    category: 'midloan_behavior',
    dataSource: 'Hbase',
    featureEnName: 'MIDLOAN_REPAY_VOL_7D',
    featureCnName: '近7日还款波动率',
    fieldType: 'Double',
    processingLogic: '计算近7日还款金额序列的标准差，再除以均值得到波动率',
    defaultValue: '0.0',
    l1Category: 'repayment',
    l2Category: 'repayment_volatility',
    sourceTableAfter: 'ads_midloan_repay_vol_7d',
    sourceTableBefore: 'dwd_repayment_detail',
    dataFreshness: 'realtime',
    developer: '王数仓',
    dataTableName: 'ads_midloan_repay_vol_7d',
    dwTaskId: 'DW-TASK-998900',
    productScope: '消费分期',
    listType: 'none',
    batch: '2026Q3',
    acceptor: '小李',
    derivationStatus: 'requirement_accepted',
    featureId: 'MIDLOAN-FEAT-0007',
    businessProblem: '贷中风险预警',
    hypothesis: '还款波动率反映用户行为稳定性',
    domainTags: ['风控'],
    variableTypeTags: ['数值型'],
    priority: 'high',
    visibility: 'team',
    status: 'adopted',
    owner: '小李',
    proposer: '小李',
    handler: '业务方-李四',
    syncLevel: 'A',
    createdAt: '2026-08-01 14:00:00',
    updatedAt: '2026-08-03 11:00:00',
    relatedResources: [
      { type: 'table', name: 'dwd_repayment_detail', displayName: 'dwd_repayment_detail' }
    ],
    referencedTopicIds: []
  },
  {
    id: 'DRV-20260803-0015',
    demandType: 'derivation',
    name: '夜间活跃度指数',
    businessScene: '贷中',
    expectedEffect: '识别异常夜间活动',
    category: 'midloan_behavior',
    dataSource: 'Hbase',
    featureEnName: 'MIDLOAN_NIGHT_ACTIVE_IDX',
    featureCnName: '夜间活跃度指数',
    fieldType: 'Double',
    processingLogic: '统计 22:00-06:00 期间的用户行为次数，与日间行为次数比值',
    defaultValue: '0.0',
    l1Category: 'user_behavior',
    l2Category: 'time_pattern',
    sourceTableAfter: 'ads_midloan_night_active',
    sourceTableBefore: 'dwd_user_event',
    dataFreshness: 'realtime',
    developer: '王数仓',
    dataTableName: 'ads_midloan_night_active',
    dwTaskId: 'DW-TASK-998888',
    productScope: '现金贷',
    listType: 'none',
    batch: '2026Q3',
    acceptor: '小李',
    derivationStatus: 'requirement_accepted',
    businessProblem: '识别异常夜间活动模式',
    hypothesis: '欺诈用户夜间活跃度显著高于正常用户',
    domainTags: ['风控', '反欺诈'],
    variableTypeTags: ['数值型'],
    priority: 'medium',
    visibility: 'team',
    status: 'exploring',
    owner: '小李',
    proposer: '小李',
    handler: '业务方-张三',
    syncLevel: 'B',
    createdAt: '2026-08-03 09:00:00',
    updatedAt: '2026-08-05 14:20:00',
    relatedResources: [
      { type: 'table', name: 'dwd_user_event', displayName: 'dwd_user_event' }
    ],
    referencedTopicIds: []
  },
  {
    id: 'DRV-20260804-0020',
    demandType: 'derivation',
    name: '信用历史长度',
    businessScene: '贷中',
    expectedEffect: '评估用户信用历史',
    category: 'midloan_behavior',
    dataSource: 'Hbase',
    featureEnName: 'MIDLOAN_CREDIT_HIST_LEN',
    featureCnName: '信用历史长度',
    fieldType: 'Integer',
    processingLogic: '计算用户首次授信至今的天数',
    defaultValue: '0',
    l1Category: 'credit_history',
    l2Category: 'history_length',
    sourceTableAfter: 'ads_midloan_credit_hist_len',
    sourceTableBefore: 'dwd_user_credit',
    dataFreshness: 'offline_t1',
    developer: '王数仓',
    dataTableName: 'ads_midloan_credit_hist_len',
    dwTaskId: 'DW-TASK-998866',
    productScope: '现金贷',
    listType: 'none',
    batch: '2026Q3',
    acceptor: '小李',
    derivationStatus: 'requirement_accepted',
    businessProblem: '评估用户信用历史',
    hypothesis: '信用历史长度与违约率负相关',
    domainTags: ['风控'],
    variableTypeTags: ['数值型'],
    priority: 'medium',
    visibility: 'team',
    status: 'exploring',
    owner: '小李',
    proposer: '小李',
    handler: '业务方-王五',
    syncLevel: 'A',
    createdAt: '2026-08-04 10:00:00',
    updatedAt: '2026-08-05 16:00:00',
    relatedResources: [
      { type: 'table', name: 'dwd_user_credit', displayName: 'dwd_user_credit' }
    ],
    referencedTopicIds: []
  },
  {
    id: 'DRV-20260805-0025',
    demandType: 'derivation',
    name: '申请频次指数',
    businessScene: '贷中',
    expectedEffect: '评估用户申请行为',
    category: 'midloan_behavior',
    dataSource: 'Hbase',
    featureEnName: 'MIDLOAN_APPLY_FREQ_IDX',
    featureCnName: '申请频次指数',
    fieldType: 'Double',
    processingLogic: '近 7 日申请次数 / 近 30 日申请次数',
    defaultValue: '0.0',
    l1Category: 'user_behavior',
    l2Category: 'apply_pattern',
    sourceTableAfter: 'ads_midloan_apply_freq',
    sourceTableBefore: 'dwd_loan_apply',
    dataFreshness: 'realtime',
    developer: '王数仓',
    dataTableName: 'ads_midloan_apply_freq',
    dwTaskId: 'DW-TASK-998800',
    productScope: '现金贷',
    listType: 'none',
    batch: '2026Q3',
    acceptor: '小李',
    derivationStatus: 'requirement_accepted',
    remark: '由原内数特征迁移为贷中行为品类',
    businessProblem: '评估用户申请行为',
    hypothesis: '申请频次激增预示用户风险',
    domainTags: ['风控'],
    variableTypeTags: ['数值型'],
    priority: 'medium',
    visibility: 'team',
    status: 'exploring',
    owner: '数据应用团队',
    proposer: '小李',
    handler: '业务方-赵六',
    syncLevel: 'B',
    createdAt: '2026-08-05 10:00:00',
    updatedAt: '2026-08-04 09:15:00',
    relatedResources: [
      { type: 'table', name: 'dwd_loan_apply', displayName: 'dwd_loan_apply' }
    ],
    referencedTopicIds: []
  },
  {
    id: 'DRV-20260803-0030',
    demandType: 'derivation',
    name: '近30日交易总笔数',
    businessScene: '贷中',
    expectedEffect: '评估用户活跃度',
    category: 'midloan_behavior',
    dataSource: 'Hbase',
    featureEnName: 'MIDLOAN_TXN_CNT_30D',
    featureCnName: '近30日交易总笔数',
    fieldType: 'Integer',
    processingLogic: '近 30 日成功交易总笔数',
    defaultValue: '0',
    l1Category: 'user_behavior',
    l2Category: 'activity_level',
    sourceTableAfter: 'ads_midloan_txn_cnt_30d',
    sourceTableBefore: 'dwd_trade_detail',
    dataFreshness: 'offline_t1',
    developer: '王数仓',
    dataTableName: 'ads_midloan_txn_cnt_30d',
    dwTaskId: 'DW-TASK-998755',
    productScope: '现金贷',
    listType: 'none',
    batch: '2026Q3',
    acceptor: '数据应用团队',
    remark: '由原内数特征迁移为贷中行为品类',
    derivationStatus: 'requirement_accepted',
    businessProblem: '评估用户活跃度',
    hypothesis: '交易频次反映用户活跃度',
    domainTags: ['风控'],
    variableTypeTags: ['数值型'],
    priority: 'low',
    visibility: 'team',
    status: 'exploring',
    owner: '数据应用团队',
    proposer: '数据应用团队',
    handler: '业务方-张三',
    syncLevel: 'C',
    createdAt: '2026-08-03 11:20:00',
    updatedAt: '2026-08-04 09:15:00',
    relatedResources: [
      { type: 'table', name: 'dwd_trade_detail', displayName: 'dwd_trade_detail' }
    ],
    referencedTopicIds: []
  },
  {
    id: 'DRV-20260805-0050',
    demandType: 'derivation',
    name: '近30日社保缴纳连续月数',
    businessScene: '贷中',
    expectedEffect: '通过社保缴纳连续月数评估用户工作稳定性',
    category: 'midloan_behavior',
    dataSource: 'Hbase',
    featureEnName: 'MIDLOAN_SOCIAL_CONT_MONTHS_30D',
    featureCnName: '近30日社保缴纳连续月数',
    fieldType: 'Integer',
    processingLogic: '对接社保查询 API，按 user_id 统计近30日内连续社保缴纳月数',
    defaultValue: '0',
    l1Category: 'repayment',
    l2Category: 'repayment_stability',
    sourceTableAfter: '',
    sourceTableBefore: 'dwd_social_security_log',
    dataFreshness: 'offline_t2',
    developer: '王数仓',
    productScope: '小微贷',
    listType: 'none',
    batch: '2026Q3',
    acceptor: '小李',
    remark: '需数仓团队联调社保查询 API',
    derivationStatus: 'requirement_accepted',
    businessProblem: '评估用户工作稳定性',
    hypothesis: '社保连续缴纳反映工作稳定性',
    domainTags: ['风控'],
    variableTypeTags: ['数值型'],
    priority: 'medium',
    visibility: 'team',
    status: 'exploring',
    owner: '小李',
    proposer: '小李',
    handler: '业务方-李四',
    syncLevel: 'A',
    createdAt: '2026-08-05 10:30:00',
    updatedAt: '2026-08-05 10:30:00',
    relatedResources: [],
    referencedTopicIds: []
  },
  // ============ 特征归档状态（需求提出后未处理，记录归档原因）============
  {
    id: 'DRV-20260720-0003',
    demandType: 'derivation',
    name: '近90日账户余额均值',
    businessScene: '贷中',
    expectedEffect: '评估用户资金充裕程度',
    category: 'midloan_behavior',
    dataSource: 'Hbase',
    featureEnName: 'MIDLOAN_AVG_BAL_90D',
    featureCnName: '近90日账户余额均值',
    fieldType: 'Double',
    processingLogic: '统计 user_id 近90日账户余额的均值',
    defaultValue: '0.0',
    l1Category: 'repayment',
    l2Category: 'repayment_stability',
    sourceTableAfter: '',
    sourceTableBefore: '',
    dataFreshness: 'offline_t2',
    developer: '',
    productScope: '现金贷',
    listType: 'none',
    batch: '2026Q3',
    acceptor: '小李',
    remark: '',
    rejectReason: '业务方撤回需求，不再需要该特征',
    rejectedAt: '2026-08-10 14:00:00',
    derivationStatus: 'rejected',
    businessProblem: '评估用户资金充裕程度',
    hypothesis: '账户余额均值反映用户还款能力',
    domainTags: ['风控'],
    variableTypeTags: ['数值型'],
    priority: 'low',
    visibility: 'team',
    status: 'paused',
    owner: '小李',
    proposer: '小李',
    handler: '',
    syncLevel: '',
    createdAt: '2026-07-20 11:00:00',
    updatedAt: '2026-08-10 14:00:00',
    relatedResources: [],
    referencedTopicIds: []
  }
]

const decisionMocks: ExploreDecision[] = [
  {
    id: 'DEC-001',
    topicId: 'EXP-2026-002',
    result: 'adopted',
    decider: '王五',
    decidedAt: '2026-06-20 14:30:00',
    rationale: 'RUN-003 的 IV/KS 领先且 PSI 稳定，满足进入注册草稿条件。',
    extensionPlan: {
      recommendedVariables: [
        { name: '多头借贷组合特征v1', bestExperimentId: 'RUN-003' }
      ],
      expectedLaunchDate: '2026-07-15',
      resourceEstimate: '数据工程师 3 天确认口径；前端 2 天补齐登记字段。',
      risks: '覆盖率偏低需评估对下游模型影响；外数接口 SLA 波动需增加降级口径。',
      notes: '采纳后仍需走正式陪跑流程。'
    },
    signatureStatus: 'mock_verified'
  },
  {
    id: 'DEC-002',
    topicId: 'EXP-2026-003',
    result: 'rejected',
    decider: '王五',
    decidedAt: '2026-06-15 18:00:00',
    rationale: '多轮实验 IV 均低于 0.1，覆盖率不足，短期不具备上线价值。',
    signatureStatus: 'mock_verified'
  },
  {
    id: 'DEC-003',
    topicId: 'EXP-2026-004',
    result: 'paused',
    decider: '李四',
    decidedAt: '2026-06-25 09:00:00',
    rationale: '数据口径与合规要求待确认，暂停推进，Q3 再评估。',
    signatureStatus: 'mock_verified'
  }
]

const auditMocks: ExploreAuditEvent[] = [
  {
    id: 'AUD-001',
    topicId: 'EXP-2026-001',
    occurredAt: '2026-06-24 09:30:12',
    operator: '张三',
    action: '修改',
    field: 'transformLogic',
    beforeValue: 'txn_count_30d',
    afterValue: 'txn_count_30d / active_days_30d',
    reason: '归一化以降低客群活跃差异影响'
  },
  {
    id: 'AUD-002',
    topicId: 'EXP-2026-002',
    occurredAt: '2026-06-20 14:30:00',
    operator: '王五',
    action: '决策',
    field: 'result',
    beforeValue: 'exploring',
    afterValue: 'adopted',
    reason: '实验结果达标，采纳进入注册草稿'
  }
]

export const ExploreStore = {
  listTopics: () => [...readExtraTopics(), ...topicMocks, ...derivationMocks].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
  getTopicById: (id: string) => [...readExtraTopics(), ...topicMocks, ...derivationMocks].find((item) => item.id === id),
  addTopic: (payload: {
    name: string
    businessProblem: string
    hypothesis: string
    domain: string
    visibility: ExploreVisibility
    variableTypeId?: string
    variableTypeTags?: string[]
    exploreCategoryId?: string
    exploreCategoryTitle?: string
    relatedDataSourceId?: string
    relatedDataSourceName?: string
    relatedVariableIds?: string[]
    relatedResources?: ExploreTopic['relatedResources']
  }) => {
    const id = nextTopicId()
    const now = nowFmt()
    const topic: ExploreTopic = {
      id,
      name: payload.name,
      businessProblem: payload.businessProblem,
      hypothesis: payload.hypothesis,
      domainTags: payload.domain ? [payload.domain] : [],
      variableTypeTags: payload.variableTypeTags || [],
      variableTypeId: payload.variableTypeId,
      exploreCategoryId: payload.exploreCategoryId,
      exploreCategoryTitle: payload.exploreCategoryTitle,
      relatedDataSourceId: payload.relatedDataSourceId,
      relatedDataSourceName: payload.relatedDataSourceName,
      relatedVariableIds: payload.relatedVariableIds || [],
      priority: 'medium',
      visibility: payload.visibility,
      status: 'exploring',
      owner: 'Demo 用户',
      createdAt: now,
      updatedAt: now,
      relatedResources: payload.relatedResources || [],
      referencedTopicIds: []
    }
    const extra = readExtraTopics()
    writeExtraTopics([topic, ...extra])
    return topic
  },
  listExperimentsByTopic: (topicId: string) =>
    [...readExtraExperiments(), ...experimentMocks]
      .filter((item) => item.topicId === topicId)
      .sort((a, b) => b.finishedAt.localeCompare(a.finishedAt)),
  getExperimentById: (id: string) =>
    [...readExtraExperiments(), ...experimentMocks].find((item) => item.id === id),
  addExperiment: (payload: Partial<ExploreExperiment> & { topicId: string; name: string }) => {
    const now = nowFmt()
    const exp: ExploreExperiment = {
      id: nextExperimentId(),
      topicId: payload.topicId,
      name: payload.name,
      tableVersion: payload.tableVersion || 'T-1',
      timeWindow: payload.timeWindow || '—',
      sampleScope: payload.sampleScope || '全量活跃客户',
      transformLogic: payload.transformLogic || '—',
      thresholdConfig: payload.thresholdConfig || '5分箱',
      metrics: payload.metrics || { iv: 0, ks: 0, psi: 0, coverage: 0 },
      conclusion: payload.conclusion || '',
      recommendation: payload.recommendation || 'need_more',
      executor: payload.executor || 'Demo 用户',
      startedAt: payload.startedAt || now,
      finishedAt: payload.finishedAt || now,
      tags: payload.tags || []
    }
    const extra = readExtraExperiments()
    writeExtraExperiments([exp, ...extra])
    ExploreStore.addAuditEvent({
      topicId: payload.topicId,
      operator: exp.executor,
      action: '新增',
      field: 'experiment',
      beforeValue: '',
      afterValue: exp.id,
      reason: `新增实验：${exp.name}`
    })
    return exp
  },
  listDecisions: () =>
    [...readExtraDecisions(), ...decisionMocks].sort((a, b) => b.decidedAt.localeCompare(a.decidedAt)),
  getDecisionByTopicId: (topicId: string) =>
    [...readExtraDecisions(), ...decisionMocks].find((item) => item.topicId === topicId),
  addDecision: (payload: {
    topicId: string
    result: ExploreDecisionResult
    decider: string
    rationale: string
    extensionPlan?: ExploreDecision['extensionPlan']
  }) => {
    const now = nowFmt()
    const topic = ExploreStore.getTopicById(payload.topicId)
    const decision: ExploreDecision = {
      id: nextDecisionId(),
      topicId: payload.topicId,
      result: payload.result,
      decider: payload.decider,
      decidedAt: now,
      rationale: payload.rationale,
      extensionPlan: payload.extensionPlan,
      signatureStatus: 'mock_verified'
    }
    const extra = readExtraDecisions()
    writeExtraDecisions([decision, ...extra.filter((d) => d.topicId !== payload.topicId)])
    // 同步把课题状态推进
    if (topic) {
      const nextStatus: ExploreTopicStatus =
        payload.result === 'adopted' ? 'adopted' : payload.result === 'rejected' ? 'rejected' : payload.result === 'paused' ? 'paused' : topic.status
      const updated: ExploreTopic = { ...topic, status: nextStatus, updatedAt: now }
      const topics = readExtraTopics()
      const idx = topics.findIndex((t) => t.id === topic.id)
      if (idx >= 0) topics[idx] = updated
      else topics.unshift(updated)
      writeExtraTopics(topics)
    }
    ExploreStore.addAuditEvent({
      topicId: payload.topicId,
      operator: payload.decider,
      action: '决策',
      field: 'result',
      beforeValue: topic?.status || 'exploring',
      afterValue: payload.result,
      reason: payload.rationale || '（无理由）'
    })
    return decision
  },
  listAuditEventsByTopic: (topicId: string) =>
    [...readExtraAudit(), ...auditMocks]
      .filter((item) => item.topicId === topicId)
      .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt)),
  addAuditEvent: (payload: Omit<ExploreAuditEvent, 'id' | 'occurredAt'>) => {
    const now = nowFmt()
    const event: ExploreAuditEvent = {
      id: nextAuditId(),
      occurredAt: now,
      ...payload
    }
    const extra = readExtraAudit()
    writeExtraAudit([event, ...extra])
    return event
  },
  listStatusSummary: () => {
    const topics = ExploreStore.listTopics()
    const statusCounts = topics.reduce<Record<ExploreTopicStatus, number>>((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1
      return acc
    }, { exploring: 0, adopted: 0, rejected: 0, paused: 0 })
    return {
      total: topics.length,
      statusCounts
    }
  },

  /**
   * 探索中心台账展示相关方法（§6.5）
   * 探索中心只读订阅特征中心的状态变更，不反向写入
   */

  /** 读取课题的关联特征同步信息（只读） */
  getVariableSyncStatus: (topicId: string): VariableSyncInfo | undefined => {
    const topic = ExploreStore.getTopicById(topicId)
    return topic?.variableSync
  },

  /** 采纳决策生成草稿后，初始化特征同步信息为"待审批" */
  initVariableSync: (topicId: string, variableId: string): VariableSyncInfo | undefined => {
    const topic = ExploreStore.getTopicById(topicId)
    if (!topic) return undefined
    const now = nowFmt()
    const sync: VariableSyncInfo = {
      variableId,
      status: 'pending_approval',
      updatedAt: now,
      events: [
        { at: now, from: 'none', to: 'pending_approval', note: '采纳决策生成草稿，移交特征中心' }
      ]
    }
    const topics = readExtraTopics()
    const idx = topics.findIndex((t) => t.id === topic.id)
    const updated = { ...topic, variableSync: sync, updatedAt: now }
    if (idx >= 0) topics[idx] = updated
    else topics.unshift(updated)
    writeExtraTopics(topics)
    ExploreStore.addAuditEvent({
      topicId,
      operator: 'Demo 用户',
      action: '同步',
      field: 'variableSync.status',
      beforeValue: 'none',
      afterValue: 'pending_approval',
      reason: `采纳决策生成草稿 ${variableId}，移交特征中心`
    })
    return sync
  },

  /**
   * 模拟特征中心"审批通过"事件
   * 状态变更：pending_approval → pending_deploy
   * 含演示同步延迟（默认 5 秒，模拟"1 分钟级"同步能力）
   */
  mockSyncApprove: (topicId: string): VariableSyncInfo | undefined => {
    const topic = ExploreStore.getTopicById(topicId)
    if (!topic?.variableSync || topic.variableSync.status !== 'pending_approval') return topic?.variableSync
    return scheduleSyncTransition(topic, 'pending_deploy', '审批通过，特征中心接管')
  },

  /**
   * 模拟特征中心"审批驳回"事件
   * 状态变更：pending_approval → rejected
   * 探索中心自动把课题状态从"已采纳"回退到"已暂缓"
   */
  mockSyncReject: (topicId: string, reason: string): VariableSyncInfo | undefined => {
    const topic = ExploreStore.getTopicById(topicId)
    if (!topic?.variableSync || topic.variableSync.status !== 'pending_approval') return topic?.variableSync
    const result = scheduleSyncTransition(topic, 'rejected', `审批驳回：${reason}`, { rejectedReason: reason })
    // 探索中心自动回退到已暂缓
    const topics = readExtraTopics()
    const idx = topics.findIndex((t) => t.id === topic.id)
    if (idx >= 0) {
      const now = nowFmt()
      topics[idx] = { ...topics[idx], status: 'paused', updatedAt: now }
      writeExtraTopics(topics)
      ExploreStore.addAuditEvent({
        topicId,
        operator: '特征中心（Demo）',
        action: '回退',
        field: 'topic.status',
        beforeValue: 'adopted',
        afterValue: 'paused',
        reason: `审批驳回，课题自动回退到已暂缓：${reason}`
      })
    }
    return result
  },

  /**
   * 模拟特征中心"部署完成"事件
   * 状态变更：pending_deploy → online
   */
  mockSyncDeploy: (topicId: string): VariableSyncInfo | undefined => {
    const topic = ExploreStore.getTopicById(topicId)
    if (!topic?.variableSync || topic.variableSync.status !== 'pending_deploy') return topic?.variableSync
    return scheduleSyncTransition(topic, 'online', '部署成功，进入运营监控', { onlineAt: nowFmt() })
  },

  /**
   * 演示用：跳过延迟，立刻推进到下一态
   * 用于 Demo 演示时不需要等待同步延迟
   */
  mockSyncFastForward: (topicId: string): VariableSyncInfo | undefined => {
    const topic = ExploreStore.getTopicById(topicId)
    const current = topic?.variableSync?.status
    if (current === 'pending_approval') return ExploreStore.mockSyncApprove(topicId)
    if (current === 'pending_deploy') return ExploreStore.mockSyncDeploy(topicId)
    return topic?.variableSync
  },

  /** 设置演示用的同步延迟（毫秒），默认 5000ms 用于压缩演示 */
  setSyncDelayMs: (ms: number) => {
    SYNC_DELAY_MS = Math.max(0, ms)
  },

  /** 读取当前演示同步延迟 */
  getSyncDelayMs: () => SYNC_DELAY_MS
}

/**
 * 同步延迟（演示用）
 * 生产环境应通过消息队列事件订阅，本地仅做 demo 压缩演示
 * 默认 5000ms（5秒），可调用 setSyncDelayMs 调整
 */
let SYNC_DELAY_MS = 5000

/**
 * 调度一次状态变更（含演示同步延迟）
 */
function scheduleSyncTransition(
  topic: ExploreTopic,
  to: VariableSyncStatus,
  note: string,
  extra: Partial<VariableSyncInfo> = {}
): VariableSyncInfo | undefined {
  if (!topic.variableSync) return undefined
  const from = topic.variableSync.status
  const runNow = () => {
    const now = nowFmt()
    const sync: VariableSyncInfo = {
      ...topic.variableSync!,
      status: to,
      updatedAt: now,
      events: [...topic.variableSync!.events, { at: now, from, to, note }],
      ...extra
    }
    const topics = readExtraTopics()
    const idx = topics.findIndex((t) => t.id === topic.id)
    if (idx >= 0) {
      topics[idx] = { ...topics[idx], variableSync: sync, updatedAt: now }
      writeExtraTopics(topics)
    }
    ExploreStore.addAuditEvent({
      topicId: topic.id,
      operator: '特征中心（Demo）',
      action: '同步',
      field: 'variableSync.status',
      beforeValue: from,
      afterValue: to,
      reason: note
    })
  }
  // 演示同步延迟
  if (SYNC_DELAY_MS > 0) {
    setTimeout(runNow, SYNC_DELAY_MS)
  } else {
    runNow()
  }
  return { ...topic.variableSync, status: to, updatedAt: new Date(Date.now() + SYNC_DELAY_MS).toISOString().slice(0, 19).replace('T', ' ') }
}

export default ExploreStore
