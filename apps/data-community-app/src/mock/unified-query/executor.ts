/**
 * SQL 执行 Mock 引擎(设计文档 §7.3 的增强版)
 *
 * 与文档的差异:文档给的是裸 Promise,但 F06「终止运行」需要中断句柄,
 * 因此这里返回 job 对象 —— run() 出结果,cancel() 让 run() 以 aborted 收敛。
 *
 * 仍然遵守 §7.1 四原则:统一入口 / 模拟延迟 / 数据联动 / 状态一致性。
 */
import { collectTableNames, DATASOURCE_LABEL, getTableColumns } from './database'
import { abortedLogs, errorLogs, successLogs } from './logs'
import { getResultByTable } from './queryResults'
import type { DataSourceKey, QueryResult } from './types'

const KNOWN_TABLES = collectTableNames()

/** 模拟执行耗时:0.8s - 2.0s(设计文档 §7.1) */
function mockDelay(): number {
  return 800 + Math.random() * 1200
}

/** 从 SQL 里识别主表名,用于取对应的 Mock 结果集 */
export function extractTableName(sql: string): string | null {
  const hit = KNOWN_TABLES.find(t => new RegExp(`\\b${t}\\b`, 'i').test(sql))
  return hit ?? null
}

/** 分段执行(F05):按分号切分,忽略空段与注释段 */
export function splitStatements(sql: string): string[] {
  return sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !/^--/.test(s.split('\n').filter(l => l.trim())[0] ?? ''))
}

/** 轻量格式化(F07):关键字大写 + 主要子句换行 */
export function formatSQL(sql: string): string {
  const majors = ['SELECT', 'FROM', 'WHERE', 'GROUP BY', 'ORDER BY', 'HAVING', 'LIMIT', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'JOIN', 'UNION ALL', 'UNION']
  let out = sql.replace(/\s+/g, ' ').trim()
  majors.forEach(kw => {
    const re = new RegExp(`\\s+${kw.replace(/\s+/g, '\\s+')}\\s+`, 'gi')
    out = out.replace(re, `\n${kw} `)
  })
  out = out.replace(/,\s*/g, ',\n       ')
  return out.replace(/\n\s*\n/g, '\n').trim()
}

/** 语法轻校验(F04 前置):只挡住明显不完整的语句,不做真解析 */
export function checkSyntax(sql: string): string | null {
  const s = sql.trim()
  if (!s) return 'SQL 语句为空,请输入查询内容'
  if (!/\bselect\b/i.test(s) && !/\b(with)\b/i.test(s)) return '语句中缺少 SELECT,当前 Mock 引擎仅支持查询类语句'
  if (!/\bfrom\b/i.test(s)) return '语句中缺少 FROM,请指定数据来源表'
  const table = extractTableName(s)
  if (!table) {
    const m = s.match(/\bfrom\s+([`"'\w.]+)/i)
    return `表 ${m?.[1] ?? '未知'} 不存在,请检查数据源与表名`
  }
  return null
}

/** F12:SELECT * 规则检查,返回警告文案(不阻断执行) */
export function checkSelectStar(sql: string): string | null {
  if (/\bselect\s+\*\s+from\b/i.test(sql.trim())) {
    return '检测到 SELECT *,全字段查询可能影响性能,建议按需指定字段名'
  }
  return null
}

export interface QueryJob {
  /** 执行并返回结果;被 cancel() 时以 status = 'aborted' 收敛 */
  run(): Promise<QueryResult>
  /** 终止运行(F06) */
  cancel(): void
  readonly table: string | null
}

export function createQueryJob(sql: string, datasource: DataSourceKey): QueryJob {
  const table = extractTableName(sql)
  const dsName = DATASOURCE_LABEL[datasource]
  let cancelled = false
  let timer: ReturnType<typeof setTimeout> | null = null
  let wake: (() => void) | null = null

  const sleep = (ms: number) =>
    new Promise<void>(resolve => {
      wake = resolve
      timer = setTimeout(resolve, ms)
    })

  return {
    get table() {
      return table
    },
    cancel() {
      cancelled = true
      if (timer) clearTimeout(timer)
      wake?.()
    },
    async run(): Promise<QueryResult> {
      const startedAt = Date.now()

      const syntaxError = checkSyntax(sql)
      if (syntaxError) {
        await sleep(400)
        return {
          columns: [],
          rows: [],
          duration: '0.40s',
          rowCount: 0,
          logs: errorLogs(syntaxError, dsName),
          status: 'error'
        }
      }

      await sleep(mockDelay())

      if (cancelled) {
        return {
          columns: [],
          rows: [],
          duration: `${((Date.now() - startedAt) / 1000).toFixed(2)}s`,
          rowCount: 0,
          logs: abortedLogs(dsName),
          status: 'aborted'
        }
      }

      const set = getResultByTable(table!)
      const cols = set.columns
      // 字段元数据参与列顺序校准,保证与导航树一致(状态一致性)
      const meta = getTableColumns(table!)
      if (meta.length && cols[0]?.dataIndex !== meta[0].name) {
        cols.forEach(c => {
          const hit = meta.find(m => m.name === c.dataIndex)
          if (hit) c.title = hit.comment || c.title
        })
      }

      const duration = `${((Date.now() - startedAt) / 1000).toFixed(2)}s`
      return {
        columns: cols,
        rows: set.rows,
        duration,
        rowCount: set.rows.length,
        logs: successLogs(duration, set.rows.length, dsName, table!),
        status: 'success'
      }
    }
  }
}

/** 兼容设计文档 §7.3 签名的一次性执行 */
export function mockExecuteSQL(sql: string, datasource: DataSourceKey): Promise<QueryResult> {
  return createQueryJob(sql, datasource).run()
}
