import type { VariableSourceType } from '@/mock/variable-management/variables'
import { VariableStatusStore } from '@/mock/variable-management/variable-status-store'

export type EvaluationTaskStatus = 'pending' | 'running' | 'completed' | 'failed'
export type EvaluationTaskType = 'access' | 'recheck' | 'comparison'
export type EvaluationTaskSourceType = 'variable_batch' | 'topic'
export type EvaluationReportKind = 'internal' | 'external'

export interface EvaluationTaskTarget {
  id: string
  name: string
  code?: string
  sourceType?: VariableSourceType
  dataSourceName?: string
}

export interface EvaluationTaskReport {
  id: string
  kind: EvaluationReportKind
  name: string
  variableId?: string
  variableName?: string
  sourceType?: VariableSourceType
  generatedAt: string
  /**
   * 报告跳转/查看入口
   * - external 报告：指向外数评估系统 risk-app 的评估报告 URL
   * - internal 报告：指向 dmt-app 内部报告预览（preview key 用于报告抽屉）
   */
  url: string
  summary: string
}

export interface EvaluationTaskMock {
  id: string
  name: string
  taskType: EvaluationTaskType
  status: EvaluationTaskStatus
  sourceType: EvaluationTaskSourceType
  sourceIds: string[]
  sourceNames: string[]
  dataSourceId?: string
  dataSourceName?: string
  variableTypeId?: string
  variableTypeName?: string
  owner: string
  description: string
  createdAt: string
  updatedAt: string
  startedAt?: string
  finishedAt?: string
  targets: EvaluationTaskTarget[]
  metrics?: {
    coverage?: number
    iv?: number
    ks?: number
    passRate?: number
  }
  resultSummary?: string
  reports: EvaluationTaskReport[]
}

const STORAGE_KEY = 'evaluation.tasks.extra'
const BINDING_KEY = 'evaluation.external.binding'

/**
 * 评估执行后写回变量的"外数评估报告 ID"映射
 * 形如：{ VAR-0001: 11, VAR-0002: 12, ... }
 * 在 api/variable-management 中会与变量的 sourceRefs.externalEvaluationId 合并展示
 */
type ExternalBindingMap = Record<string, string | number>

function safeParse(raw: string | null): any {
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function readExtraTasks(): EvaluationTaskMock[] {
  const data = safeParse(localStorage.getItem(STORAGE_KEY))
  return Array.isArray(data) ? data : []
}

function writeExtraTasks(list: EvaluationTaskMock[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

function readBinding(): ExternalBindingMap {
  const data = safeParse(localStorage.getItem(BINDING_KEY))
  if (data && typeof data === 'object') return data as ExternalBindingMap
  return {}
}

function writeBinding(map: ExternalBindingMap) {
  localStorage.setItem(BINDING_KEY, JSON.stringify(map))
}

function nowFmt() {
  return new Date().toISOString().slice(0, 19).replace('T', ' ')
}

function nextTaskId() {
  const prefix = 'EVAL-2026-'
  const all = [...defaultTasks, ...readExtraTasks()]
  const nums = all
    .map((item) => String(item.id))
    .filter((id) => id.startsWith(prefix))
    .map((id) => Number(id.slice(prefix.length)))
    .filter((n) => !Number.isNaN(n))
  const next = (nums.length ? Math.max(...nums) : 0) + 1
  return `${prefix}${String(next).padStart(3, '0')}`
}

function nextExternalReportId(): number {
  const binding = readBinding()
  const used = Object.values(binding).map((v) => Number(v)).filter((n) => !Number.isNaN(n))
  return (used.length ? Math.max(...used) : 100) + 1
}

const defaultTasks: EvaluationTaskMock[] = [
  {
    id: 'EVAL-2026-001',
    name: '外数准入变量复评',
    taskType: 'recheck',
    status: 'completed',
    sourceType: 'variable_batch',
    sourceIds: ['VAR-0001', 'VAR-0002'],
    sourceNames: ['外数-三要素核验一致性', '外数-手机在网时长'],
    dataSourceId: 'external',
    dataSourceName: '外部数据服务',
    variableTypeId: 'external',
    variableTypeName: '外数变量',
    owner: '李四',
    description: '针对外数变量的命中率、成本收益和 SLA 稳定性进行复评。',
    createdAt: '2026-06-22 10:00:00',
    updatedAt: '2026-06-24 18:20:00',
    startedAt: '2026-06-23 09:00:00',
    finishedAt: '2026-06-24 18:20:00',
    targets: [
      { id: 'VAR-0001', name: '外数-三要素核验一致性', code: 'EXT_VERIFY_3E_MATCH', sourceType: 'external', dataSourceName: '外部数据服务' },
      { id: 'VAR-0002', name: '外数-手机在网时长', code: 'EXT_MOBILE_ONLINE_DAYS', sourceType: 'external', dataSourceName: '外部数据服务' }
    ],
    metrics: {
      coverage: 0.89,
      iv: 0.31,
      ks: 0.27,
      passRate: 0.96
    },
    resultSummary: '通过复评，建议继续保留在线服务，并补充供应商降级预案。',
    reports: [
      {
        id: '11',
        kind: 'external',
        name: '外数评估报告 - 三要素核验一致性',
        variableId: 'VAR-0001',
        variableName: '外数-三要素核验一致性',
        sourceType: 'external',
        generatedAt: '2026-06-24 18:20:00',
        url: '/risk/external-data/evaluation/11',
        summary: '外数评估系统输出：命中 0.93，IV 0.32，KS 0.28，建议保留。'
      },
      {
        id: '12',
        kind: 'external',
        name: '外数评估报告 - 手机在网时长',
        variableId: 'VAR-0002',
        variableName: '外数-手机在网时长',
        sourceType: 'external',
        generatedAt: '2026-06-24 18:20:00',
        url: '/risk/external-data/evaluation/12',
        summary: '外数评估系统输出：命中 0.85，IV 0.29，KS 0.26，建议保留并监控成本。'
      },
      {
        id: 'INT-REPORT-001',
        kind: 'internal',
        name: 'DMT 复评总结报告',
        generatedAt: '2026-06-24 18:20:00',
        url: 'preview:recheck-summary-001',
        summary: 'DMT 复评：通过 2 / 需关注 0 / 不通过 0。'
      }
    ]
  },
  {
    id: 'EVAL-2026-002',
    name: '行为变量候选准入评估',
    taskType: 'access',
    status: 'running',
    sourceType: 'topic',
    sourceIds: ['EXP-2026-001'],
    sourceNames: ['风控_逾期前行为特征_202606'],
    dataSourceId: 'internal',
    dataSourceName: '内数底表',
    variableTypeId: 'behavior',
    variableTypeName: '行为变量',
    owner: '张三',
    description: '对探索课题产出的候选变量做准入评估，验证覆盖率和稳定性。',
    createdAt: '2026-06-25 09:30:00',
    updatedAt: '2026-06-26 10:40:00',
    startedAt: '2026-06-26 10:00:00',
    targets: [
      { id: 'VAR-0003', name: '内数-近30日交易次数', code: 'IN_TXN_CNT_30D', sourceType: 'internal', dataSourceName: '交易明细表' }
    ],
    reports: []
  }
]

function upsertExtraTask(task: EvaluationTaskMock) {
  const extra = readExtraTasks()
  const next = [task, ...extra.filter((item) => item.id !== task.id)]
  writeExtraTasks(next)
}

function generateReportsForTask(task: EvaluationTaskMock): EvaluationTaskReport[] {
  const now = nowFmt()
  const existing = Array.isArray(task.reports) ? task.reports : []
  const existingByVar = new Map<string, EvaluationTaskReport>()
  existing.forEach((r) => {
    if (r.variableId) existingByVar.set(r.variableId, r)
  })

  const reports: EvaluationTaskReport[] = [...existing]
  const binding = readBinding()
  let externalCounter = 0

  task.targets.forEach((target, idx) => {
    if (target.sourceType !== 'external') {
      // 内数 / 征信：生成内部报告
      const internalName = `DMT 评估报告 - ${target.name}`
      const hasInternal = reports.some((r) => r.kind === 'internal' && r.variableId === target.id)
      if (!hasInternal) {
        reports.push({
          id: `INT-${task.id}-${idx + 1}`,
          kind: 'internal',
          name: internalName,
          variableId: target.id,
          variableName: target.name,
          sourceType: target.sourceType,
          generatedAt: now,
          url: `preview:internal-${task.id}-${idx + 1}`,
          summary: `DMT 内部评估：${target.name}（${target.sourceType || '内部'}）`
        })
      }
      return
    }

    // 外数：调用外数评估能力（mock），生成 external 报告并回写 binding
    const existingReport = existingByVar.get(target.id)
    if (existingReport) {
      // 任务已存在历史报告
      return
    }
    const newId = String(nextExternalReportId() + externalCounter)
    externalCounter += 1
    binding[target.id] = newId
    reports.push({
      id: newId,
      kind: 'external',
      name: `外数评估报告 - ${target.name}`,
      variableId: target.id,
      variableName: target.name,
      sourceType: 'external',
      generatedAt: now,
      url: `/risk/external-data/evaluation/${newId}`,
      summary: `外数评估系统输出：${target.name}（命中/IV/KS 由外数系统给出）。`
    })
  })

  // 内部总结报告
  const hasInternalSummary = reports.some((r) => r.kind === 'internal' && !r.variableId)
  if (!hasInternalSummary && task.targets.length) {
    reports.push({
      id: `INT-${task.id}-SUMMARY`,
      kind: 'internal',
      name: `DMT 评估总结 - ${task.name}`,
      generatedAt: now,
      url: `preview:internal-summary-${task.id}`,
      summary: `DMT 评估总结：${task.targets.length} 个目标变量，详见逐项报告。`
    })
  }

  writeBinding(binding)
  return reports
}

export const EvaluationTaskStore = {
  listTasks(): EvaluationTaskMock[] {
    return [...readExtraTasks(), ...defaultTasks].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  },
  getTaskById(id: string) {
    return EvaluationTaskStore.listTasks().find((item) => item.id === id)
  },
  addTask(payload: {
    name: string
    taskType: EvaluationTaskType
    sourceType: EvaluationTaskSourceType
    sourceIds: string[]
    sourceNames: string[]
    description: string
    dataSourceId?: string
    dataSourceName?: string
    variableTypeId?: string
    variableTypeName?: string
    targets: EvaluationTaskTarget[]
  }) {
    const now = nowFmt()
    const task: EvaluationTaskMock = {
      id: nextTaskId(),
      name: payload.name,
      taskType: payload.taskType,
      status: 'pending',
      sourceType: payload.sourceType,
      sourceIds: payload.sourceIds,
      sourceNames: payload.sourceNames,
      dataSourceId: payload.dataSourceId,
      dataSourceName: payload.dataSourceName,
      variableTypeId: payload.variableTypeId,
      variableTypeName: payload.variableTypeName,
      owner: 'Demo 用户',
      description: payload.description,
      createdAt: now,
      updatedAt: now,
      targets: payload.targets,
      reports: []
    }
    upsertExtraTask(task)
    return task
  },
  runTask(id: string) {
    const current = EvaluationTaskStore.getTaskById(id)
    if (!current) return null
    const now = nowFmt()
    const targetCount = current.targets.length || 1
    const reports = generateReportsForTask(current)
    const metrics = current.metrics || {
      coverage: Number((0.78 + targetCount * 0.03).toFixed(2)),
      iv: Number((0.16 + targetCount * 0.04).toFixed(2)),
      ks: Number((0.12 + targetCount * 0.03).toFixed(2)),
      passRate: Number((0.82 + targetCount * 0.02).toFixed(2))
    }
    // 回写评估指标到变量档案
    current.targets.forEach((target) => {
      if (!target.id) return
      const quality = Math.round((metrics.passRate ?? 0.9) * 100)
      const missingRate = Number((((1 - (metrics.coverage ?? 0.9)) * 0.1) + 0.01).toFixed(4))
      VariableStatusStore.setEvaluation(target.id, {
        quality,
        missingRate,
        passRate: metrics.passRate,
        iv: metrics.iv,
        ks: metrics.ks,
        source: 'evaluation_task',
        taskId: id
      }, '评估任务中心')
    })
    const finished: EvaluationTaskMock = {
      ...current,
      status: 'completed',
      startedAt: current.startedAt || now,
      finishedAt: now,
      updatedAt: now,
      metrics,
      resultSummary:
        current.resultSummary ||
        `已完成 ${targetCount} 个变量的 mock 评估（已生成 ${reports.length} 份评估报告），评估指标已回写到变量档案。`,
      reports
    }
    upsertExtraTask(finished)
    return finished
  },
  /**
   * 启动一个任务：pending → running
   */
  startTask(id: string) {
    const current = EvaluationTaskStore.getTaskById(id)
    if (!current) return null
    const now = nowFmt()
    const running: EvaluationTaskMock = {
      ...current,
      status: 'running',
      startedAt: current.startedAt || now,
      updatedAt: now
    }
    upsertExtraTask(running)
    return running
  },
  /**
   * 读取"评估任务中心 → 外数评估"已生成的 ID 映射，供变量档案侧合并 sourceRefs
   */
  getExternalBinding(): ExternalBindingMap {
    return readBinding()
  },
  listSummary() {
    const tasks = EvaluationTaskStore.listTasks()
    return tasks.reduce(
      (acc, item) => {
        acc.total += 1
        acc[item.status] += 1
        return acc
      },
      { total: 0, pending: 0, running: 0, completed: 0, failed: 0 } as Record<EvaluationTaskStatus | 'total', number>
    )
  }
}

export default EvaluationTaskStore
