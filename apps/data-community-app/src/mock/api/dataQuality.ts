/**
 * 数据质量管理 Mock API
 * 模块：校验任务管理 / 任务实例与日志
 *
 * 改进：支持添加多条校验规则（每条规则独立选字段、独立校验类型）
 */

// ==================== 类型定义 ====================

export interface DataSource {
  id: string
  name: string
  type: string
  status: string
}

export interface QualityRule {
  id: string
  name: string
  type: 'count' | 'sum'
  sourceField: string | null
  targetField: string | null
}

export interface QualityTask {
  id: string
  name: string
  creator: string
  status: 'active' | 'inactive'
  rules: QualityRule[]
  scheduleType: 'daily' | 'weekly'
  scheduleTime: string
  scheduleDay: string | null
  source: {
    datasourceId: string
    datasourceName: string
    database: string
    table: string
    partition: string
    isPartitioned: boolean
  }
  target: {
    datasourceId: string
    datasourceName: string
    database: string
    table: string
    partition: string
    isPartitioned: boolean
  }
  timeout: number
  description: string
  lastRunStatus: 'consistent' | 'inconsistent' | 'failed' | null
  lastRunTime: string | null
  createdAt: string
  updatedAt: string
}

export interface RuleResult {
  ruleId: string
  ruleName: string
  type: 'count' | 'sum'
  sourceValue: number
  targetValue: number
  diffValue: number
  isConsistent: boolean
}

export interface QualityInstance {
  id: string
  taskId: string
  taskName: string
  status: 'consistent' | 'inconsistent' | 'failed'
  results: RuleResult[]
  duration: number
  runTime: string
  finishTime: string
  log: string
}

// ==================== 静态数据 ====================

const dataSources: DataSource[] = [
  { id: 'ds_hive', name: 'Hive', type: 'hive', status: 'connected' },
  { id: 'ds_oracle', name: 'Oracle', type: 'oracle', status: 'connected' },
  { id: 'ds_doris', name: 'Doris', type: 'doris', status: 'connected' }
]

const databases: Record<string, string[]> = {
  ds_hive: ['odds_db', 'default', 'ods', 'dwd', 'dws', 'ads'],
  ds_oracle: ['ORCL', 'RISK_DB', 'TRADE_DB'],
  ds_doris: ['doris_db', 'cdp_dw', 'report_db']
}

const tables: Record<string, string[]> = {
  'ds_hive/odds_db': ['table_a', 'user_info', 'transaction_log', 'risk_score'],
  'ds_hive/default': ['test_table', 'tmp_data'],
  'ds_hive/ods': ['ods_user', 'ods_order', 'ods_event'],
  'ds_hive/dwd': ['dwd_user_detail', 'dwd_order_detail'],
  'ds_hive/dws': ['dws_user_summary', 'dws_trade_summary'],
  'ds_hive/ads': ['ads_user_profile', 'ads_risk_report'],
  'ds_oracle/ORCL': ['table_a', 'cust_info', 'account_balance'],
  'ds_oracle/RISK_DB': ['risk_event', 'risk_rule', 'risk_result'],
  'ds_oracle/TRADE_DB': ['trade_record', 'trade_summary', 'trade_detail'],
  'ds_doris/doris_db': ['table_a', 'user_tag', 'order_stats', 'risk_summary'],
  'ds_doris/cdp_dw': ['tag_user_daily', 'user_profile', 'tag_user_monthly'],
  'ds_doris/report_db': ['daily_report', 'monthly_report', 'kpi_summary']
}

const fields: Record<string, Array<{ name: string; type: string; comment: string; isNumeric?: boolean }>> = {}
Object.keys(tables).forEach(key => {
  const [dsId, db] = key.split('/')
  tables[key].forEach(table => {
    const fKey = `${dsId}/${db}/${table}`
    fields[fKey] = [
      { name: 'id', type: 'bigint', comment: '主键ID' },
      { name: 'user_id', type: 'string', comment: '用户ID' },
      { name: 'mobile', type: 'string', comment: '手机号' },
      { name: 'id_card', type: 'string', comment: '身份证号' },
      { name: 'name', type: 'string', comment: '姓名' },
      { name: 'age', type: 'int', comment: '年龄' },
      { name: 'gender', type: 'string', comment: '性别' },
      { name: 'city', type: 'string', comment: '城市' },
      { name: 'amount', type: 'decimal(18,2)', comment: '金额', isNumeric: true },
      { name: 'balance', type: 'decimal(18,2)', comment: '余额', isNumeric: true },
      { name: 'score', type: 'double', comment: '评分', isNumeric: true },
      { name: 'create_time', type: 'timestamp', comment: '创建时间' },
      { name: 'update_time', type: 'timestamp', comment: '更新时间' },
      { name: 'dt', type: 'string', comment: '分区日期' }
    ]
  })
})

// ==================== 初始任务数据 ====================

let taskIdCounter = 1
const tasks: QualityTask[] = [
  {
    id: 'qt_001',
    name: 'Hive-Doris用户表条数校验',
    creator: '张伟',
    status: 'active',
    rules: [
      { id: 'r_001_1', name: '用户表条数校验', type: 'count', sourceField: 'id', targetField: 'id' }
    ],
    scheduleType: 'daily',
    scheduleTime: '22:00',
    scheduleDay: null,
    source: { datasourceId: 'ds_hive', datasourceName: 'Hive', database: 'odds_db', table: 'table_a', partition: '${dt}', isPartitioned: true },
    target: { datasourceId: 'ds_doris', datasourceName: 'Doris', database: 'doris_db', table: 'table_a', partition: '${dt}', isPartitioned: true },
    timeout: 300,
    description: '校验Hive与Doris用户表数据条数一致性',
    lastRunStatus: 'consistent',
    lastRunTime: '2026-08-10 22:00:15',
    createdAt: '2026-07-15 10:00:00',
    updatedAt: '2026-08-10 22:00:15'
  },
  {
    id: 'qt_002',
    name: 'Oracle-Doris交易金额校验',
    creator: '李娜',
    status: 'active',
    rules: [
      { id: 'r_002_1', name: '交易条数校验', type: 'count', sourceField: 'id', targetField: 'id' },
      { id: 'r_002_2', name: '交易金额汇总校验', type: 'sum', sourceField: 'amount', targetField: 'amount' },
      { id: 'r_002_3', name: '余额汇总校验', type: 'sum', sourceField: 'balance', targetField: 'amount' }
    ],
    scheduleType: 'daily',
    scheduleTime: '23:30',
    scheduleDay: null,
    source: { datasourceId: 'ds_oracle', datasourceName: 'Oracle', database: 'TRADE_DB', table: 'trade_record', partition: '', isPartitioned: false },
    target: { datasourceId: 'ds_doris', datasourceName: 'Doris', database: 'doris_db', table: 'order_stats', partition: '', isPartitioned: false },
    timeout: 300,
    description: '校验Oracle交易表与Doris订单统计表条数及金额一致性',
    lastRunStatus: 'inconsistent',
    lastRunTime: '2026-08-10 23:30:22',
    createdAt: '2026-07-20 14:30:00',
    updatedAt: '2026-08-10 23:30:22'
  },
  {
    id: 'qt_003',
    name: 'Hive-Oracle风控评分校验',
    creator: '王强',
    status: 'inactive',
    rules: [
      { id: 'r_003_1', name: '风控条数校验', type: 'count', sourceField: 'id', targetField: 'id' },
      { id: 'r_003_2', name: '评分汇总校验', type: 'sum', sourceField: 'score', targetField: 'score' }
    ],
    scheduleType: 'weekly',
    scheduleTime: '02:00',
    scheduleDay: '周一',
    source: { datasourceId: 'ds_hive', datasourceName: 'Hive', database: 'dws', table: 'dws_user_summary', partition: '${dt}', isPartitioned: true },
    target: { datasourceId: 'ds_oracle', datasourceName: 'Oracle', database: 'RISK_DB', table: 'risk_event', partition: '', isPartitioned: false },
    timeout: 600,
    description: '按周校验Hive用户汇总表与Oracle风控事件表条数及评分',
    lastRunStatus: 'failed',
    lastRunTime: '2026-08-04 02:00:05',
    createdAt: '2026-06-10 09:00:00',
    updatedAt: '2026-08-04 02:00:05'
  },
  {
    id: 'qt_004',
    name: 'Hive-Doris标签表校验',
    creator: '刘洋',
    status: 'active',
    rules: [
      { id: 'r_004_1', name: '标签表条数校验', type: 'count', sourceField: 'user_id', targetField: 'user_id' }
    ],
    scheduleType: 'daily',
    scheduleTime: '01:00',
    scheduleDay: null,
    source: { datasourceId: 'ds_hive', datasourceName: 'Hive', database: 'ads', table: 'ads_user_profile', partition: '${dt}', isPartitioned: true },
    target: { datasourceId: 'ds_doris', datasourceName: 'Doris', database: 'cdp_dw', table: 'tag_user_daily', partition: '${dt}', isPartitioned: true },
    timeout: 300,
    description: '校验Hive ADS层用户画像与Doris标签表条数',
    lastRunStatus: 'consistent',
    lastRunTime: '2026-08-10 01:00:12',
    createdAt: '2026-08-01 16:00:00',
    updatedAt: '2026-08-10 01:00:12'
  },
  {
    id: 'qt_005',
    name: 'Oracle-Doris余额校验',
    creator: '陈静',
    status: 'active',
    rules: [
      { id: 'r_005_1', name: '账户条数校验', type: 'count', sourceField: 'id', targetField: 'id' },
      { id: 'r_005_2', name: '余额汇总校验', type: 'sum', sourceField: 'balance', targetField: 'amount' }
    ],
    scheduleType: 'weekly',
    scheduleTime: '03:00',
    scheduleDay: '周三',
    source: { datasourceId: 'ds_oracle', datasourceName: 'Oracle', database: 'ORCL', table: 'account_balance', partition: '', isPartitioned: false },
    target: { datasourceId: 'ds_doris', datasourceName: 'Doris', database: 'doris_db', table: 'risk_summary', partition: '', isPartitioned: false },
    timeout: 300,
    description: '按周校验Oracle账户余额与Doris风险汇总金额',
    lastRunStatus: 'inconsistent',
    lastRunTime: '2026-08-07 03:00:18',
    createdAt: '2026-07-01 11:00:00',
    updatedAt: '2026-08-07 03:00:18'
  }
]
taskIdCounter = 6

// ==================== 实例生成 ====================

const instances: QualityInstance[] = []

function generateRuleResults(
  rules: QualityRule[]
): RuleResult[] {
  return rules.map(rule => {
    const sourceValue = Math.floor(900 + Math.random() * 200)
    const isInconsistent = Math.random() < 0.3
    const targetValue = isInconsistent ? sourceValue - Math.floor(1 + Math.random() * 10) : sourceValue
    const diffValue = Math.abs(sourceValue - targetValue)
    return {
      ruleId: rule.id,
      ruleName: rule.name,
      type: rule.type,
      sourceValue,
      targetValue,
      diffValue,
      isConsistent: diffValue === 0
    }
  })
}

function generateInstanceLog(
  task: QualityTask,
  results: RuleResult[],
  status: 'consistent' | 'inconsistent' | 'failed',
  runTime: string
): string {
  const lines = [
    `[${runTime}] INFO  开始执行校验任务: ${task.name}`,
    `[${runTime}] INFO  源端: ${task.source.datasourceName} ${task.source.database}.${task.source.table}`,
    `[${runTime}] INFO  目标端: ${task.target.datasourceName} ${task.target.database}.${task.target.table}`,
    `[${runTime}] INFO  校验规则数: ${task.rules.length}`,
  ]
  if (task.source.partition) lines.push(`[${runTime}] INFO  源端分区条件: ${task.source.partition}`)
  if (task.target.partition) lines.push(`[${runTime}] INFO  目标端分区条件: ${task.target.partition}`)
  lines.push(`[${runTime}] INFO  源端数据源连接成功`)
  lines.push(`[${runTime}] INFO  目标端数据源连接成功`)

  if (status === 'failed') {
    lines.push(`[${runTime}] ERROR 数据源查询超时`)
    lines.push(`[${runTime}] ERROR 校验结果: 执行失败`)
    lines.push(`[${runTime}] ERROR 错误信息: Query timed out after 300s`)
    lines.push(`[${runTime}] INFO  任务执行完成，耗时 300s`)
    return lines.join('\n')
  }

  results.forEach((r, i) => {
    const fieldInfo = r.type === 'sum' ? `(${r.ruleId})` : ''
    lines.push(`[${runTime}] INFO  规则${i + 1}: ${r.ruleName} [${r.type === 'count' ? 'count' : 'sum'}]${fieldInfo}`)
    lines.push(`[${runTime}] INFO    源端值: ${r.sourceValue}`)
    lines.push(`[${runTime}] INFO    目标端值: ${r.targetValue}`)
    lines.push(`[${runTime}] INFO    差异值: ${r.diffValue}`)
    if (r.isConsistent) {
      lines.push(`[${runTime}] INFO    结果: 一致`)
    } else {
      lines.push(`[${runTime}] WARN    结果: 不一致`)
    }
  })

  const allConsistent = results.every(r => r.isConsistent)
  if (allConsistent) {
    lines.push(`[${runTime}] INFO  校验结果: 全部一致`)
  } else {
    lines.push(`[${runTime}] WARN  校验结果: 存在不一致规则，已推送告警到数字社区`)
  }
  lines.push(`[${runTime}] INFO  任务执行完成，耗时 ${Math.floor(1 + Math.random() * 30)}s`)
  return lines.join('\n')
}

function ensureInstances(): void {
  if (instances.length > 0) return
  tasks.forEach(task => {
    if (task.status !== 'active') return
    const instanceCount = task.scheduleType === 'daily' ? 7 : 4
    for (let i = 0; i < instanceCount; i++) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
      const timeStr = `${dateStr} ${task.scheduleTime}:00`

      let results: RuleResult[]
      let status: 'consistent' | 'inconsistent' | 'failed'

      if (i === 0 && task.lastRunStatus) {
        status = task.lastRunStatus
      } else if (i === 1) {
        status = 'inconsistent'
      } else {
        const rand = Math.random()
        status = rand < 0.5 ? 'consistent' : rand < 0.8 ? 'inconsistent' : 'failed'
      }

      if (status === 'failed') {
        results = task.rules.map(r => ({
          ruleId: r.id, ruleName: r.name, type: r.type,
          sourceValue: 0, targetValue: 0, diffValue: 0, isConsistent: false
        }))
      } else {
        results = generateRuleResults(task.rules)
        if (status === 'consistent') {
          results = results.map(r => ({ ...r, targetValue: r.sourceValue, diffValue: 0, isConsistent: true }))
        }
      }

      instances.push({
        id: `qi_${task.id}_${String(i).padStart(3, '0')}`,
        taskId: task.id,
        taskName: task.name,
        status,
        results,
        duration: Math.floor(1 + Math.random() * 30),
        runTime: timeStr,
        finishTime: `${dateStr} ${task.scheduleTime}:${String(Math.floor(10 + Math.random() * 49)).padStart(2, '0')}`,
        log: generateInstanceLog(task, results, status, timeStr)
      })
    }
  })
}

// ==================== API 导出 ====================

let ruleIdCounter = 1

export const DataQualityAPI = {
  async getDataSources() {
    return { success: true, data: dataSources }
  },

  async getDatabases(datasourceId: string) {
    return { success: true, data: databases[datasourceId] || [] }
  },

  async getTables(datasourceId: string, database: string) {
    const key = `${datasourceId}/${database}`
    const list = (tables[key] || []).map(name => ({ name, database, datasourceId }))
    return { success: true, data: list }
  },

  async getTableFields(datasourceId: string, database: string, table: string) {
    const key = `${datasourceId}/${database}/${table}`
    return { success: true, data: fields[key] || [] }
  },

  async getTasks(params: any = {}) {
    const { page = 1, pageSize = 10, name = '', status = '', checkMethod = '' } = params
    let list = [...tasks]
    if (name) {
      const n = String(name).toLowerCase()
      list = list.filter(t => t.name.toLowerCase().includes(n))
    }
    if (status) list = list.filter(t => t.status === status)
    if (checkMethod) list = list.filter(t => t.rules.some(r => r.type === checkMethod))
    const total = list.length
    const start = (page - 1) * pageSize
    return { success: true, data: { list: list.slice(start, start + pageSize), total, page, pageSize } }
  },

  async getTaskDetail(id: string) {
    const task = tasks.find(t => t.id === id)
    if (!task) return { success: false, message: '任务不存在' }
    return { success: true, data: task }
  },

  async createTask(payload: any) {
    if (payload.source.datasourceId === payload.target.datasourceId) {
      return { success: false, message: '源端和目标端必须来自不同数据源' }
    }
    if (!payload.rules || payload.rules.length === 0) {
      return { success: false, message: '至少需要添加一条校验规则' }
    }
    const id = `qt_${String(taskIdCounter++).padStart(3, '0')}`
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19)
    const dsMap: Record<string, string> = {}
    dataSources.forEach(d => { dsMap[d.id] = d.name })
    const newTask: QualityTask = {
      id,
      name: payload.name,
      creator: payload.creator || '当前用户',
      status: 'active',
      rules: payload.rules.map((r: any, i: number) => ({
        id: r.id || `r_${id}_${i + 1}`,
        name: r.name,
        type: r.type,
        sourceField: r.sourceField || null,
        targetField: r.targetField || null
      })),
      scheduleType: payload.scheduleType,
      scheduleTime: payload.scheduleTime,
      scheduleDay: payload.scheduleDay || null,
      source: { ...payload.source, datasourceName: dsMap[payload.source.datasourceId] || payload.source.datasourceId },
      target: { ...payload.target, datasourceName: dsMap[payload.target.datasourceId] || payload.target.datasourceId },
      timeout: payload.timeout || 300,
      description: payload.description || '',
      lastRunStatus: null,
      lastRunTime: null,
      createdAt: now,
      updatedAt: now
    }
    tasks.unshift(newTask)
    return { success: true, data: newTask, message: '任务创建成功' }
  },

  async updateTask(id: string, payload: any) {
    const idx = tasks.findIndex(t => t.id === id)
    if (idx === -1) return { success: false, message: '任务不存在' }
    if (payload.source.datasourceId === payload.target.datasourceId) {
      return { success: false, message: '源端和目标端必须来自不同数据源' }
    }
    if (!payload.rules || payload.rules.length === 0) {
      return { success: false, message: '至少需要添加一条校验规则' }
    }
    const dsMap: Record<string, string> = {}
    dataSources.forEach(d => { dsMap[d.id] = d.name })
    tasks[idx] = {
      ...tasks[idx],
      ...payload,
      rules: payload.rules.map((r: any, i: number) => ({
        id: r.id || `r_${id}_${i + 1}`,
        name: r.name,
        type: r.type,
        sourceField: r.sourceField || null,
        targetField: r.targetField || null
      })),
      source: { ...payload.source, datasourceName: dsMap[payload.source.datasourceId] || tasks[idx].source.datasourceName },
      target: { ...payload.target, datasourceName: dsMap[payload.target.datasourceId] || tasks[idx].target.datasourceName },
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
    }
    return { success: true, data: tasks[idx], message: '任务更新成功' }
  },

  async deleteTask(id: string) {
    const idx = tasks.findIndex(t => t.id === id)
    if (idx === -1) return { success: false, message: '任务不存在' }
    tasks.splice(idx, 1)
    for (let i = instances.length - 1; i >= 0; i--) {
      if (instances[i].taskId === id) instances.splice(i, 1)
    }
    return { success: true, message: '任务删除成功' }
  },

  async toggleTask(id: string) {
    const task = tasks.find(t => t.id === id)
    if (!task) return { success: false, message: '任务不存在' }
    task.status = task.status === 'active' ? 'inactive' : 'active'
    task.updatedAt = new Date().toISOString().replace('T', ' ').substring(0, 19)
    return { success: true, data: task, message: task.status === 'active' ? '任务已启用' : '任务已停用' }
  },

  async triggerTask(id: string) {
    ensureInstances()
    const task = tasks.find(t => t.id === id)
    if (!task) return { success: false, message: '任务不存在' }
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19)
    const results = generateRuleResults(task.rules)
    const allConsistent = results.every(r => r.isConsistent)
    const status: 'consistent' | 'inconsistent' = allConsistent ? 'consistent' : 'inconsistent'
    const instance: QualityInstance = {
      id: `qi_${task.id}_${Date.now()}`,
      taskId: task.id,
      taskName: task.name,
      status,
      results,
      duration: Math.floor(1 + Math.random() * 30),
      runTime: now,
      finishTime: now,
      log: generateInstanceLog(task, results, status, now)
    }
    instances.unshift(instance)
    task.lastRunStatus = status
    task.lastRunTime = now
    return { success: true, data: instance, message: '任务触发成功，已生成校验实例' }
  },

  async getInstances(params: any = {}) {
    ensureInstances()
    const { page = 1, pageSize = 10, taskId = '', status = '' } = params
    let list = [...instances]
    if (taskId) list = list.filter(i => i.taskId === taskId)
    if (status) list = list.filter(i => i.status === status)
    list.sort((a, b) => new Date(b.runTime).getTime() - new Date(a.runTime).getTime())
    const total = list.length
    const start = (page - 1) * pageSize
    return { success: true, data: { list: list.slice(start, start + pageSize), total, page, pageSize } }
  },

  async getInstanceDetail(id: string) {
    ensureInstances()
    const instance = instances.find(i => i.id === id)
    if (!instance) return { success: false, message: '实例不存在' }
    return { success: true, data: instance }
  }
}

export default DataQualityAPI

// ===== 解构导出 =====

function unwrap<T = any>(res: any): T {
  if (res && res.success === false) {
    const err: any = new Error(res.message || '操作失败')
    err.payload = res
    throw err
  }
  return res?.data as T
}

export function getDataSources() { return DataQualityAPI.getDataSources().then(unwrap) }
export function getDatabases(datasourceId: string) { return DataQualityAPI.getDatabases(datasourceId).then(unwrap) }
export function getTables(datasourceId: string, database: string) { return DataQualityAPI.getTables(datasourceId, database).then(unwrap) }
export function getTableFields(datasourceId: string, database: string, table: string) { return DataQualityAPI.getTableFields(datasourceId, database, table).then(unwrap) }
export function getQualityTasks(params: any = {}) { return DataQualityAPI.getTasks(params).then(unwrap) }
export function getQualityTaskDetail(id: string) { return DataQualityAPI.getTaskDetail(id).then(unwrap) }
export function createQualityTask(payload: any) { return DataQualityAPI.createTask(payload).then(unwrap) }
export function updateQualityTask(id: string, payload: any) { return DataQualityAPI.updateTask(id, payload).then(unwrap) }
export function deleteQualityTask(id: string) { return DataQualityAPI.deleteTask(id).then(unwrap) }
export function toggleQualityTask(id: string) { return DataQualityAPI.toggleTask(id).then(unwrap) }
export function triggerTask(id: string) { return DataQualityAPI.triggerTask(id).then(unwrap) }
export function getTaskInstances(params: any = {}) { return DataQualityAPI.getInstances(params).then(unwrap) }
export function getInstanceDetail(id: string) { return DataQualityAPI.getInstanceDetail(id).then(unwrap) }
