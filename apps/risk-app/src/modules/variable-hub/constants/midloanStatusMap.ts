/**
 * 贷中行为特征 9 状态机色板
 * 来源：风险数据一体化一期·贷中行为特征自动化上下线 文档（v2.0 模板版）· 状态机章节
 *
 * 9 正常状态 + 4 异常状态（共 13 态，严格对齐文档 D.4 色板）
 * 阶段 S4 · 完整 13 状态 × 操作类型对应关系
 */

export type MidloanStatus =
  // 9 正常状态（文档 v2.0 严格顺序）
  | 'registered'              // 已注册
  | 'developing_oa'           // 数仓开发中
  | 'dw_online'               // 数仓开发完成
  | 'pending_verify'          // 待验收
  | 'verified'                // 已验收
  | 'syncing_internal'        // 内数同步中
  | 'syncing_variable'        // 变量中心同步中
  | 'online'                  // 已上线
  | 'offline'                 // 已下线
  // 4 异常状态
  | 'internal_sync_failed'    // 内数同步失败
  | 'variable_sync_failed'    // 变量中心同步失败
  | 'dw_online_failed'        // 数仓开发失败
  | 'offline_failed'          // 下线接收失败

export interface MidloanStatusMeta {
  label: string
  color: string
  /** 业务说明 */
  description: string
}

export const MIDLOAN_STATUS_MAP: Record<MidloanStatus, MidloanStatusMeta> = {
  registered:           { label: '已注册',        color: 'blue',     description: '特征已注册，等待提开发OA单' },
  developing_oa:        { label: '数仓开发中',     color: 'purple',   description: '已提开发OA单，数仓开发中' },
  dw_online:            { label: '数仓开发完成',   color: 'cyan-dark', description: '数仓任务已上线，等待发起验收' },
  pending_verify:       { label: '待验收',        color: 'gold',     description: '已发起OA验收单，等待验收人处理' },
  verified:             { label: '已验收',        color: 'green-light', description: '验收通过，可发起上线流程' },
  syncing_internal:     { label: '内数同步中',     color: 'cyan',     description: 'OA单已提给内数，等待返回接口信息' },
  syncing_variable:     { label: '变量中心同步中', color: 'cyan',     description: 'OA单已提给变量中心，等待确认上线' },
  online:               { label: '已上线',        color: 'green',    description: '变量中心已确认上线，特征投产中' },
  offline:              { label: '已下线',        color: 'darkgray', description: '变量中心已下线，归档保留' },
  // 异常
  internal_sync_failed: { label: '内数同步失败',  color: 'red',      description: '内数API注册/变更返回失败，可点击「重新同步」' },
  variable_sync_failed: { label: '变量中心同步失败', color: 'red',    description: '变量中心注册返回失败，可点击「重新同步」' },
  dw_online_failed:     { label: '数仓开发失败',  color: 'red',      description: '数仓任务执行失败，可点击「重新触发数仓任务」' },
  offline_failed:       { label: '下线接收失败',  color: 'red',      description: '变量中心批次同步失败，可手动触发批次重试' }
}

/** 9 状态机正常流转顺序（时间轴展示用 · 文档 v2.0 严格顺序） */
export const MIDLOAN_STATUS_ORDER: MidloanStatus[] = [
  'registered',
  'developing_oa',
  'dw_online',
  'pending_verify',
  'verified',
  'syncing_internal',
  'syncing_variable',
  'online',
  'offline'
]

/** 异常状态列表 */
export const MIDLOAN_FAILED_STATUSES: MidloanStatus[] = [
  'internal_sync_failed',
  'variable_sync_failed',
  'dw_online_failed',
  'offline_failed'
]

/** 取状态元数据 */
export const midloanStatusMeta = (status: string): MidloanStatusMeta => {
  return (MIDLOAN_STATUS_MAP as any)[status] || { label: status, color: 'gray', description: '' }
}

export const midloanStatusLabel = (status: string) => midloanStatusMeta(status).label
export const midloanStatusColor = (status: string) => midloanStatusMeta(status).color

/**
 * 判断给定状态是否为可重试异常状态（用于详情页红色 Alert）
 */
export const isRetryableFailedStatus = (status: string): boolean => {
  return MIDLOAN_FAILED_STATUSES.includes(status as MidloanStatus)
}

/**
 * 给定当前状态，返回可执行的"操作按钮"
 * 文档 §四 状态流转表
 *
 * 设计原则：
 * 1. 每个状态都有明确的"主流程操作"
 * 2. 演示快捷按钮（DemoConsole）只用于演示场景
 * 3. 异常态重试用 retry_xxx 命名空间（retry_sync / retry_dw / retry_offline_batch）
 * 4. 补充数据底表操作（supplement_table）独立于状态机
 *
 * ⚠️ 【编辑保护 / DO NOT EDIT】
 * 本区域为贷中行为特征状态机核心配置，禁止随意修改。
 * - 任何状态/操作调整必须先更新《风险数据一体化一期·贷中行为特征自动化上下线 文档（v2.0 模板版）》
 * - 状态枚举必须与 MidloanStatus 一一对应，新增/删除请走评审流程
 * - 操作 key 命名空间（submit_/verify_/retry_/simulate_/request_/manual_）不可变更，否则会破坏前后端协议
 * - 如确需修改，请联系 @风险数据一体化 负责人并同步更新本注释
 */
export interface AllowedAction {
  key: string
  label: string
  type?: 'primary' | 'warning' | 'danger'
  /** demo: 仅演示快捷按钮（vs main: 主流程） */
  category?: 'main' | 'demo' | 'error'
}

export const allowedActionsByStatus = (status: string, _data?: any, role?: string): AllowedAction[] => {
  // 角色过滤：community_admin 仅查看，不展示任何操作按钮
  if (role === 'community_admin') return []

  const isAdmin = role === 'risk_data_admin'
  const isMember = role === 'risk_data_member' || !role

  switch (status) {
    // ============ 主流程操作 ============
    case 'registered':
      return [{ key: 'submit_dev_oa', label: '提开发OA单', type: 'primary', category: 'main' }]

    case 'dw_online':
      return [{ key: 'submit_verify', label: '发起验收', type: 'primary', category: 'main' }]

    case 'verified':
      return [{ key: 'start_online', label: '发起上线流程', type: 'primary', category: 'main' }]

    // ============ 演示快捷按钮 ============
    case 'developing_oa':
      // 数仓开发中：演示模拟数仓回调（成功/失败）
      return [
        { key: 'simulate_dw_success', label: '模拟数仓成功', category: 'demo' },
        { key: 'simulate_dw_success_dw', label: '模拟数仓成功（DW回调）', category: 'demo' },
        { key: 'simulate_dw_failed', label: '模拟数仓失败', category: 'demo' }
      ]

    case 'pending_verify':
      // 待验收：演示模拟 OA 验收（通过/驳回）
      return [
        { key: 'verify_pass', label: '模拟验收通过', category: 'demo' },
        { key: 'verify_reject', label: '验收驳回', type: 'danger', category: 'demo' }
      ]

    // ============ 异常重试操作 ============
    case 'internal_sync_failed':
      return isAdmin || isMember
        ? [{ key: 'retry_sync', label: '重新同步', type: 'warning', category: 'error' }]
        : []

    case 'variable_sync_failed':
      return isAdmin || isMember
        ? [{ key: 'retry_sync', label: '重新同步', type: 'warning', category: 'error' }]
        : []

    case 'dw_online_failed':
      // 数仓任务重试：仅管理员
      return isAdmin ? [{ key: 'retry_dw', label: '重新触发数仓任务', type: 'warning', category: 'error' }] : []

    case 'offline_failed':
      // 下线批次重试：仅管理员
      return isAdmin ? [{ key: 'manual_batch_retry', label: '手动触发批次重试', type: 'warning', category: 'error' }] : []

    // ============ 中间态（同步中） ============
    case 'syncing_internal':
    case 'syncing_variable':
      // 同步中：等待系统自动完成，暂无用户操作
      return []

    // ============ 终态 ============
    case 'offline':
      // 已下线：终态，无操作
      return []

    default:
      return []
  }
}

/**
 * 当前状态下应该显示的演示快捷按钮（用于 DemoConsole 区域）
 */
export const demoActionsByStatus = (status: string, role?: string): AllowedAction[] => {
  return allowedActionsByStatus(status, undefined, role).filter(a => a.category === 'demo')
}

/**
 * 当前状态下的主流程操作（用于"动态操作"区域）
 */
export const mainActionsByStatus = (status: string, role?: string): AllowedAction[] => {
  return allowedActionsByStatus(status, undefined, role).filter(a => a.category === 'main' || a.category === 'error')
}

/**
 * ============ 编辑保护规则（用户反馈）============
 * 变量上线后，核心信息不可编辑（否则会影响实际上线调用）
 *
 * 文档依据：贷中行为特征自动化上下线 v2.0 §三 G.上线调用阶段
 *
 * 字段分类：
 * - core：核心字段（特征英文名/中文名/字段类型/加工逻辑/默认值/接口号等）
 *        上线后会影响变量中心实际调用，必须锁定
 * - supplementary：补充字段（数据底表名/数仓任务ID/OA单号/验收人等）
 *        仅在 developing_oa / dw_online / dw_online_failed 阶段可补充
 * - meta：元数据（描述/标签/可见性等）
 *        任何阶段都可编辑
 */
export type FieldCategory = 'core' | 'supplementary' | 'meta'

export interface FieldEditPolicy {
  /** 字段名（驼峰命名）*/
  field: string
  /** 中文标签 */
  label: string
  /** 字段类别 */
  category: FieldCategory
}

/** 字段编辑策略清单（用于编辑表单）*/
export const VARIABLE_FIELD_POLICIES: FieldEditPolicy[] = [
  // 核心字段（影响实际调用）
  { field: 'featureEnName', label: '特征英文名', category: 'core' },
  { field: 'featureCnName', label: '特征中文名', category: 'core' },
  { field: 'fieldType', label: '字段类型', category: 'core' },
  { field: 'processingLogic', label: '加工逻辑', category: 'core' },
  { field: 'defaultValue', label: '默认值', category: 'core' },
  { field: 'apiNo', label: '接口号', category: 'core' },
  { field: 'name', label: '变量名称', category: 'core' },
  { field: 'code', label: '变量代码', category: 'core' },
  { field: 'variableType', label: '变量类型', category: 'core' },
  { field: 'definition', label: '变量定义', category: 'core' },
  { field: 'l1Category', label: '一级分类', category: 'core' },
  { field: 'l2Category', label: '二级分类', category: 'core' },
  { field: 'sourceTableAfter', label: '标准化后源表', category: 'core' },
  { field: 'sourceTableBefore', label: '变更前源表', category: 'core' },
  // 补充字段（OA/数仓相关）
  { field: 'dataTableName', label: '数据底表名', category: 'supplementary' },
  { field: 'dwTaskId', label: '数仓任务ID', category: 'supplementary' },
  { field: 'devOaOrderId', label: 'OA开发单号', category: 'supplementary' },
  { field: 'verifyOaOrderId', label: 'OA验收单号', category: 'supplementary' },
  { field: 'acceptor', label: '验收人', category: 'supplementary' },
  // 元数据（描述/标签）
  { field: 'businessScene', label: '业务场景', category: 'meta' },
  { field: 'domainTags', label: '业务域标签', category: 'meta' },
  { field: 'variableTypeTags', label: '变量类型标签', category: 'meta' },
  { field: 'description', label: '描述', category: 'meta' },
  { field: 'visibility', label: '可见性', category: 'meta' },
  { field: 'remark', label: '备注', category: 'meta' }
]

/**
 * 给定状态，判断某个字段是否可编辑
 * @param status 变量当前状态
 * @param field 字段名
 * @returns true 可编辑；false 锁定
 */
export const canEditField = (status: string, field: string): boolean => {
  // 已上线 / 已下线：所有字段锁定
  if (status === 'online' || status === 'offline') return false

  // 元数据：所有状态可编辑
  const policy = VARIABLE_FIELD_POLICIES.find(p => p.field === field)
  if (!policy || policy.category === 'meta') return true

  // 补充字段：developing_oa / dw_online / dw_online_failed 可编辑
  if (policy.category === 'supplementary') {
    return ['developing_oa', 'dw_online', 'dw_online_failed'].includes(status)
  }

  // 核心字段：已注册阶段可编辑
  return ['registered'].includes(status)
}

/**
 * 获取状态下所有可编辑字段
 */
export const getEditableFields = (status: string): FieldEditPolicy[] => {
  return VARIABLE_FIELD_POLICIES.filter(p => canEditField(status, p.field))
}

/**
 * 获取状态下所有锁定字段
 */
export const getLockedFields = (status: string): FieldEditPolicy[] => {
  return VARIABLE_FIELD_POLICIES.filter(p => !canEditField(status, p.field))
}

/**
 * 判断当前状态下，整个变量是否允许编辑入口
 * （用于编辑按钮的 disabled 控制）
 */
export const canEdit = (status: string): boolean => {
  return getEditableFields(status).length > 0
}

/**
 * 编辑保护说明（用于 UI 提示）
 */
export const getEditLockReason = (status: string): string => {
  switch (status) {
    case 'online':
      return '已上线：核心信息已投产调用，修改将影响实际生产调用，请先申请下线'
    case 'offline':
      return '已下线：归档状态，禁止修改'
    case 'pending_verify':
    case 'verified':
    case 'syncing_internal':
    case 'syncing_variable':
      return '流程进行中：处于流程中状态，暂不开放编辑'
    case 'internal_sync_failed':
    case 'variable_sync_failed':
    case 'dw_online_failed':
    case 'offline_failed':
      return '异常态：暂不开放编辑，请先处理异常（重试）'
    case 'developing_oa':
    case 'dw_online':
      return '开发/数仓阶段：仅可补充数据底表、OA单号等运维字段'
    case 'registered':
      return '已注册：所有字段均可编辑'
    default:
      return '未知状态'
  }
}

/**
 * ============ 台账视角的操作 × 状态 映射（用户反馈）============
 *
 * 与 allowedActionsByStatus 的区别：
 * - allowedActionsByStatus：详情页"动态操作"区域显示（主流程操作）
 * - tableActionsByStatus：列表页每行的"操作"列显示（台账快捷操作）
 *
 * 台账操作通常包括：
 * - view_detail：查看详情（始终显示）
 * - edit：编辑（受保护）
 * - supplement_table：补充数据底表
 * - external_archive：外数档案
 * - line_usage：血缘/使用
 * - evaluation：评估
 * - retry：重试（异常态）
 *
 * 文档 §K1 明确：下线是被动接收（变量中心发起），台账无主动下线按钮。
 *
 * @param status 变量状态
 * @param record 变量数据（含 sourceType、isExternal 等）
 * @param role 当前角色（用于权限过滤）
 */
export type TableActionKey =
  | 'view_detail'           // 详情
  | 'edit'                  // 编辑
  | 'supplement_table'      // 补充数据底表
  | 'external_archive'      // 外数档案
  | 'retry'                 // 重试（异常态）

export interface TableAction {
  key: TableActionKey
  label: string
  type?: 'primary' | 'warning' | 'danger'
}

/**
 * 台账操作结果：分为「顶层快捷」+「主流程操作」
 * - topActions：直接显示在操作列（详情/编辑/外数档案/重试/补充底表）
 * - mainActions：通过「更多操作」dropdown 触发抽屉（submit_dev_oa/submit_verify/verify_pass/start_online 等）
 *
 * 用户反馈：动态操作下沉到列表页（详情页已经看得到的不重复；列表页能快速触发）
 */
export interface TableActionsResult {
  topActions: TableAction[]
  mainActions: AllowedAction[]
}

export const tableActionsByStatus = (
  status: string,
  record?: any,
  role?: string
): TableActionsResult => {
  const isAdmin = role === 'risk_data_admin'
  const isExternal = record?.sourceType === 'external' && !!record?.sourceRefs?.externalArchiveId
  const hasDataTable = !!record?.dataTableName

  // 顶层快捷按钮
  const topActions: TableAction[] = [{ key: 'view_detail', label: '详情' }]

  // 编辑（受保护）
  const editable = (() => {
    if (status === 'online' || status === 'offline') return false
    if (['registered'].includes(status)) return true
    return false
  })()
  if (editable) {
    topActions.push({ key: 'edit', label: '编辑', type: 'primary' })
  }

  // 补充数据底表
  const needSupplement = ['developing_oa', 'dw_online', 'dw_online_failed'].includes(status) && !hasDataTable
  if (needSupplement) {
    topActions.push({ key: 'supplement_table', label: '补充数据底表', type: 'warning' })
  }

  // 外数档案
  if (isExternal) {
    topActions.push({ key: 'external_archive', label: '外数档案' })
  }

  // 重试：异常态
  const retryable = ['internal_sync_failed', 'variable_sync_failed', 'dw_online_failed', 'offline_failed'].includes(status)
  if (retryable) {
    if (status === 'dw_online_failed' || status === 'offline_failed') {
      if (isAdmin) {
        topActions.push({ key: 'retry', label: '重试', type: 'danger' })
      }
    } else {
      topActions.push({ key: 'retry', label: '重新同步', type: 'danger' })
    }
  }

  // 主流程操作：从 allowedActionsByStatus 合并（排除 demo 演示按钮）
  const allMain = allowedActionsByStatus(status, record, role)
  // 去重：topActions 中已暴露过的快捷按钮不在「更多操作」中重复出现
  const topActionKeys = new Set(topActions.map(a => a.key))
  const retryKeyMap: Record<string, string> = {
    retry_sync: 'retry',
    retry_dw: 'retry',
    manual_batch_retry: 'retry'
  }
  const mainActions = allMain.filter(a => {
    if (a.category === 'demo') return false
    if (topActionKeys.has(a.key)) return false
    // retry_sync / retry_dw / manual_batch_retry 与 topActions.retry 重叠，隐藏
    if (retryKeyMap[a.key] && topActionKeys.has(retryKeyMap[a.key])) return false
    return true
  })

  return { topActions, mainActions }
}

/**
 * 给定状态和操作 key，返回是否应该显示该操作（仅顶层按钮）
 */
export const shouldShowTableAction = (
  status: string,
  actionKey: TableActionKey,
  record?: any,
  role?: string
): boolean => {
  const { topActions } = tableActionsByStatus(status, record, role)
  return topActions.some(a => a.key === actionKey)
}