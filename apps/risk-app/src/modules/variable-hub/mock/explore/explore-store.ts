export type ExploreVisibility = 'team' | 'company' | 'audit'
export type ExploreTopicStatus = 'exploring' | 'adopted' | 'rejected' | 'paused'
export type ExplorePriority = 'high' | 'medium' | 'low'
export type ExploreDecisionResult = 'adopted' | 'rejected' | 'paused'

/**
 * 探索中心台账展示用的"变量当前状态"枚举
 * 与 §6.5 探索中心台账展示与状态同步机制 对齐
 * 注意：探索中心不维护此状态机，仅只读展示
 */
export type VariableSyncStatus =
  | 'none'              // 无关联变量（如已否决/已暂缓/未采纳）
  | 'pending_approval'  // 变量中心：待审批
  | 'pending_deploy'    // 变量中心：待部署
  | 'online'            // 变量中心：已上线
  | 'rejected'          // 变量中心：审批驳回（探索中心自动回退到已暂缓）

export interface VariableSyncInfo {
  /** 关联变量ID（生成草稿后写入） */
  variableId: string
  /** 变量当前状态 */
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
   * 关联变量同步信息（仅在状态为已采纳时有值）
   * 探索中心只读展示，状态变更由变量中心事件驱动
   */
  variableSync?: VariableSyncInfo
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
    hypothesis: '交易频次突降 + 还款金额递减 = 逾期预警变量',
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
    name: '风控_多头借贷变量优化_202606',
    businessProblem: '在既有外数成本约束下，是否存在更高 ROI 的多头变量组合？',
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
    // 演示数据：已采纳课题的关联变量已处于"已上线"状态
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
    name: '营销_响应率预测变量_202606',
    businessProblem: '营销触达响应率的预测变量是否可提升活动投放效果？',
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
  const all = [...readExtraTopics(), ...topicMocks]
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
  return Array.isArray(data) ? data : []
}

function writeExtraDecisions(list: ExploreDecision[]) {
  localStorage.setItem(DECISION_KEY, JSON.stringify(list))
}

function readExtraAudit(): ExploreAuditEvent[] {
  const data = safeParse(localStorage.getItem(AUDIT_KEY))
  return Array.isArray(data) ? data : []
}

function writeExtraAudit(list: ExploreAuditEvent[]) {
  localStorage.setItem(AUDIT_KEY, JSON.stringify(list))
}

function readExtraExperiments(): ExploreExperiment[] {
  const data = safeParse(localStorage.getItem(EXPERIMENT_KEY))
  return Array.isArray(data) ? data : []
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
    conclusion: '组合变量效果最优，建议进入采纳决策。',
    recommendation: 'go',
    executor: '李四',
    startedAt: '2026-06-18 10:00:00',
    finishedAt: '2026-06-18 12:10:00',
    tags: ['外数', '组合变量']
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
        { name: '多头借贷组合变量v1', bestExperimentId: 'RUN-003' }
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
  listTopics: () => [...readExtraTopics(), ...topicMocks].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
  getTopicById: (id: string) => [...readExtraTopics(), ...topicMocks].find((item) => item.id === id),
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
   * 探索中心只读订阅变量中心的状态变更，不反向写入
   */

  /** 读取课题的关联变量同步信息（只读） */
  getVariableSyncStatus: (topicId: string): VariableSyncInfo | undefined => {
    const topic = ExploreStore.getTopicById(topicId)
    return topic?.variableSync
  },

  /** 采纳决策生成草稿后，初始化变量同步信息为"待审批" */
  initVariableSync: (topicId: string, variableId: string): VariableSyncInfo | undefined => {
    const topic = ExploreStore.getTopicById(topicId)
    if (!topic) return undefined
    const now = nowFmt()
    const sync: VariableSyncInfo = {
      variableId,
      status: 'pending_approval',
      updatedAt: now,
      events: [
        { at: now, from: 'none', to: 'pending_approval', note: '采纳决策生成草稿，移交变量中心' }
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
      reason: `采纳决策生成草稿 ${variableId}，移交变量中心`
    })
    return sync
  },

  /**
   * 模拟变量中心"审批通过"事件
   * 状态变更：pending_approval → pending_deploy
   * 含演示同步延迟（默认 5 秒，模拟"1 分钟级"同步能力）
   */
  mockSyncApprove: (topicId: string): VariableSyncInfo | undefined => {
    const topic = ExploreStore.getTopicById(topicId)
    if (!topic?.variableSync || topic.variableSync.status !== 'pending_approval') return topic?.variableSync
    return scheduleSyncTransition(topic, 'pending_deploy', '审批通过，变量中心接管')
  },

  /**
   * 模拟变量中心"审批驳回"事件
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
        operator: '变量中心（Demo）',
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
   * 模拟变量中心"部署完成"事件
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
      operator: '变量中心（Demo）',
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
