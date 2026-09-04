/**
 * 定时任务 SQL 解析器（Mock）
 *
 * 1. validateTaskSqlType — 校验 SQL 是否为 INSERT 或 CREATE TABLE
 * 2. checkTaskSyntax     — 基础语法检查（括号配对、关键字完整性等）
 * 3. parseSqlDependencies — 解析 SQL 依赖（上游表 / 自身产出表）
 * 4. buildCron           — 从 ScheduleConfig 生成 Cron 表达式
 * 5. buildScheduleDisplay — 从 ScheduleConfig 生成展示串
 */
import type { Dependency, ScheduleConfig } from './types'

/** SQL 语句类型 */
export type SqlType = 'INSERT' | 'CREATE_TABLE' | 'SELECT' | 'UNKNOWN'

/** 校验结果 */
export interface SqlTypeValidation {
  valid: boolean
  type: SqlType
  message: string
}

const SQL_KEYWORDS = new Set([
  'SELECT', 'WHERE', 'GROUP', 'ORDER', 'LIMIT', 'DUAL',
  'HAVING', 'UNION', 'AND', 'OR', 'AS', 'ON', 'BY', 'ASC', 'DESC'
])

/**
 * 校验任务 SQL 类型：定时调度语句必须是 INSERT 或 CREATE TABLE
 */
export function validateTaskSqlType(sql: string): SqlTypeValidation {
  const s = sql.trim().toUpperCase()

  if (s.startsWith('INSERT INTO') || s.startsWith('INSERT OVERWRITE')) {
    return { valid: true, type: 'INSERT', message: 'INSERT 语句，符合定时调度要求' }
  }

  if (s.startsWith('CREATE TABLE') || s.startsWith('CREATE TABLE IF NOT EXISTS')) {
    return { valid: true, type: 'CREATE_TABLE', message: 'CREATE TABLE 语句，符合定时调度要求' }
  }

  if (s.startsWith('SELECT')) {
    return { valid: false, type: 'SELECT', message: '定时调度语句必须是 INSERT 或 CREATE TABLE，当前为 SELECT 查询语句' }
  }

  return { valid: false, type: 'UNKNOWN', message: '无法识别的 SQL 类型，定时调度仅支持 INSERT 或 CREATE TABLE 语句' }
}

/**
 * 基础语法检查：括号配对、关键字完整性、分号等
 */
export interface SyntaxCheckResult {
  passed: boolean
  errors: string[]
  warnings: string[]
}

export function checkTaskSyntax(sql: string): SyntaxCheckResult {
  const errors: string[] = []
  const warnings: string[] = []
  const s = sql.trim()

  if (!s) {
    errors.push('SQL 语句为空')
    return { passed: false, errors, warnings }
  }

  // 分号结尾
  if (!s.endsWith(';')) {
    warnings.push('语句未以分号结尾，建议添加')
  }

  // 括号配对
  const open = (s.match(/\(/g) || []).length
  const close = (s.match(/\)/g) || []).length
  if (open !== close) {
    errors.push(`括号不配对：${open} 个 '(' vs ${close} 个 ')'`)
  }

  // INSERT 语句校验
  if (/^\s*INSERT\b/i.test(s)) {
    if (!/\bINSERT\s+(INTO|OVERWRITE)\b/i.test(s)) {
      errors.push('INSERT 语句缺少 INTO 或 OVERWRITE 关键字')
    }
    // INSERT OVERWRITE 需要 TABLE 或 DIRECTORY
    if (/^\s*INSERT\s+OVERWRITE\b/i.test(s) && !/\bINSERT\s+OVERWRITE\s+(TABLE|DIRECTORY)\b/i.test(s)) {
      warnings.push('INSERT OVERWRITE 建议显式指定 TABLE 或 DIRECTORY')
    }
  }

  // CREATE TABLE 语句校验
  if (/^\s*CREATE\s+TABLE\b/i.test(s)) {
    const m = s.match(/\bCREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?[`"']?(\w+)/i)
    if (!m) {
      errors.push('CREATE TABLE 语句缺少表名')
    }
  }

  // 检查 SELECT 子查询中是否有 FROM
  const selectSubqueries = s.match(/\bSELECT\b[\s\S]*?\bFROM\b/gi)
  if (/\bSELECT\b/i.test(s) && !selectSubqueries && !/INSERT|CREATE/i.test(s)) {
    warnings.push('检测到 SELECT 但未找到 FROM，请确认语句完整性')
  }

  return { passed: errors.length === 0, errors, warnings }
}

/**
 * 解析 SQL 依赖：提取上游表（读取）和自身产出表（写入）
 */
export interface ParsedDependencies {
  /** 上游表（FROM / JOIN 后的表名） */
  upstream: string[]
  /** 自身产出表（INSERT INTO / CREATE TABLE 目标表） */
  output: string | null
}

export function parseSqlDependencies(sql: string): ParsedDependencies {
  const s = sql.trim()
  const upstream: string[] = []
  let output: string | null = null

  // 提取 INSERT INTO / OVERWRITE 目标表
  const insertMatch = s.match(/\bINSERT\s+(?:INTO|OVERWRITE)\s+(?:TABLE\s+)?[`"']?(\w+)/i)
  if (insertMatch) {
    output = insertMatch[1]
  }

  // 提取 CREATE TABLE 表名
  const createMatch = s.match(/\bCREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?[`"']?(\w+)/i)
  if (createMatch) {
    output = createMatch[1]
  }

  // 提取 FROM 和 JOIN 后的表名
  const fromMatches = [...s.matchAll(/\b(?:FROM|JOIN)\s+[`"']?(\w+)/gi)]
  for (const m of fromMatches) {
    const table = m[1]
    if (!SQL_KEYWORDS.has(table.toUpperCase()) && table.toUpperCase() !== output?.toUpperCase()) {
      if (!upstream.includes(table)) {
        upstream.push(table)
      }
    }
  }

  return { upstream, output }
}

/**
 * 将解析结果转为 Dependency 列表
 */
export function buildDependencies(sql: string): Dependency[] {
  const { upstream, output } = parseSqlDependencies(sql)
  const deps: Dependency[] = []

  // 上游表 → upstream 依赖(表级)
  for (const table of upstream) {
    deps.push({
      id: `dep-up-${table}`,
      name: table,
      source: 'upstream',
      type: 'table',
      category: 'table',
      detail: `上游数据源表`
    })
  }

  // 自身产出 → self 依赖(表级)
  if (output) {
    deps.push({
      id: `dep-self-${output}`,
      name: output,
      source: 'self',
      type: 'table',
      category: 'table',
      detail: `任务产出表`
    })
  }

  return deps
}

/**
 * 从 ScheduleConfig 生成 Cron 表达式
 */
export function buildCron(config: ScheduleConfig): string {
  const p = (n: number) => String(n).padStart(2, '0')

  switch (config.type) {
    case 'daily': {
      const [h, m] = (config.dailyTime ?? '02:00').split(':')
      return `0 ${m ?? '00'} ${h ?? '02'} * * ?`
    }
    case 'weekly': {
      const [h, m] = (config.weeklyTime ?? '07:00').split(':')
      const day = config.weeklyDay ?? 1
      const dayMap = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
      const cronDay = day === 7 ? 0 : day
      return `0 ${m ?? '00'} ${h ?? '07'} ? * ${dayMap[cronDay]}`
    }
    case 'monthly': {
      const [h, m] = (config.monthlyTime ?? '08:00').split(':')
      const d = config.monthlyDay ?? 1
      return `0 ${m ?? '00'} ${h ?? '08'} ${d} * ?`
    }
    default:
      return '0 0 2 * * ?'
  }
}

/**
 * 从 ScheduleConfig 生成展示串
 */
export function buildScheduleDisplay(config: ScheduleConfig): string {
  const WEEK_NAMES = ['', '周一', '周二', '周三', '周四', '周五', '周六', '周日']

  switch (config.type) {
    case 'daily':
      return `每天 ${config.dailyTime ?? '02:00'}`
    case 'weekly':
      return `每${WEEK_NAMES[config.weeklyDay ?? 1] ?? '周一'} ${config.weeklyTime ?? '07:00'}`
    case 'monthly':
      return `每月 ${config.monthlyDay ?? 1} 日 ${config.monthlyTime ?? '08:00'}`
    default:
      return '每天 02:00'
  }
}

/** DQC 规则类型标签 */
export const DQC_RULE_TYPE_LABELS: Record<string, string> = {
  not_null: '非空校验',
  unique: '唯一性校验',
  range: '范围校验',
  referential: '引用完整性',
  custom: '自定义SQL'
}

/** DQC 规则模板 */
export const DQC_RULE_TEMPLATES: Record<string, string> = {
  not_null: 'SELECT COUNT(*) AS null_count FROM {table} WHERE {column} IS NULL',
  unique: 'SELECT {column}, COUNT(*) AS cnt FROM {table} GROUP BY {column} HAVING COUNT(*) > 1',
  range: 'SELECT COUNT(*) AS out_of_range FROM {table} WHERE {column} NOT BETWEEN {min} AND {max}',
  referential: 'SELECT COUNT(*) AS orphan_count FROM {table} a LEFT JOIN {ref_table} b ON a.{column} = b.{ref_column} WHERE b.{ref_column} IS NULL',
  custom: '-- 请编写自定义 DQC 校验 SQL\nSELECT ...'
}

/**
 * 计算调度下次运行时间(参考 DataWorks 调度预览)
 * @param config 调度配置
 * @param count 返回未来运行次数,默认 5
 * @returns 时间字符串数组,如 ['09-04 02:00', '09-05 02:00', ...]
 */
export function buildNextRuns(config: ScheduleConfig, count = 5): string[] {
  const p = (n: number) => String(n).padStart(2, '0')
  const now = new Date('2026-09-03T10:00:00')
  const result: string[] = []

  const parseTime = (t?: string): [number, number] => {
    const [h, m] = (t ?? '02:00').split(':').map(Number)
    return [h ?? 2, m ?? 0]
  }

  switch (config.type) {
    case 'daily': {
      const [h, m] = parseTime(config.dailyTime)
      for (let i = 1; i <= count; i++) {
        const d = new Date(now)
        d.setDate(d.getDate() + i)
        d.setHours(h, m, 0, 0)
        result.push(`${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(h)}:${p(m)}`)
      }
      break
    }
    case 'weekly': {
      const [h, m] = parseTime(config.weeklyTime)
      const targetDay = config.weeklyDay ?? 1
      let found = 0
      const d = new Date(now)
      while (found < count) {
        d.setDate(d.getDate() + 1)
        // JS: 0=Sunday, our config: 7=Sunday
        const jsDay = d.getDay() === 0 ? 7 : d.getDay()
        if (jsDay === targetDay) {
          found++
          result.push(`${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(h)}:${p(m)}`)
        }
        if (found > 50) break
      }
      break
    }
    case 'monthly': {
      const [h, m] = parseTime(config.monthlyTime)
      const targetDate = config.monthlyDay ?? 1
      for (let i = 1; i <= count; i++) {
        const d = new Date(now)
        d.setMonth(d.getMonth() + i)
        const day = Math.min(targetDate, new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate())
        d.setDate(day)
        d.setHours(h, m, 0, 0)
        result.push(`${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(h)}:${p(m)}`)
      }
      break
    }
  }

  return result
}

/** 资源组 Mock 数据(参考 DataWorks 资源组管理) */
export const RESOURCE_GROUPS = [
  { id: 'rg-default', name: '默认资源组', maxConcurrency: 10, type: 'default' as const, desc: '共享资源池,适合常规调度' },
  { id: 'rg-dedicated-1', name: '专享资源组-高配', maxConcurrency: 20, type: 'dedicated' as const, desc: '独占计算资源,适合大表 ETL' },
  { id: 'rg-dedicated-2', name: '专享资源组-低配', maxConcurrency: 5, type: 'dedicated' as const, desc: '独占计算资源,适合轻量任务' },
  { id: 'rg-realtime', name: '实时资源组', maxConcurrency: 50, type: 'dedicated' as const, desc: '低延迟资源池,适合近实时场景' }
]
