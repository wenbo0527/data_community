/**
 * 执行日志 Mock(F09 / F35)
 *
 * 三态:成功 / 失败 / 已终止,格式对齐设计文档 §3.4
 *   [INFO] 2026-09-03 10:15:32 - 开始执行SQL查询
 */
import type { LogEntry, LogLevel } from './types'

function ts(offsetSec = 0): string {
  const d = new Date(Date.now() + offsetSec * 1000)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
}

function line(level: LogLevel, message: string, offsetSec = 0): LogEntry {
  return { time: ts(offsetSec), level, message }
}

/** 成功日志:duration 为耗时展示串,rowCount 为结果行数 */
export function successLogs(duration: string, rowCount: number, datasource: string, table: string): LogEntry[] {
  return [
    line('info', `开始执行SQL查询,数据源 ${datasource}`, 0),
    line('info', `会话已建立,目标对象 ${table}`, 1),
    line('info', `语法解析通过,生成分布式执行计划`, 2),
    line('info', `任务下发至 BE 节点,开始拉取数据`, 3),
    line('info', `执行完成,返回 ${rowCount} 行记录,耗时 ${duration}`, 4)
  ]
}

/** 失败日志:常见语法/对象错误,便于演示红色状态 */
export function errorLogs(reason: string, datasource: string): LogEntry[] {
  return [
    line('info', `开始执行SQL查询,数据源 ${datasource}`, 0),
    line('info', `会话已建立`, 1),
    line('warn', `语句中包含未识别的对象引用,进入兼容校验`, 2),
    line('error', `执行失败:${reason}`, 3),
    line('error', `错误码 UQ-SQL-0404,请检查表名/字段名或 LIMIT 语法后重试`, 3)
  ]
}

/** 终止日志(F06) */
export function abortedLogs(datasource: string): LogEntry[] {
  return [
    line('info', `开始执行SQL查询,数据源 ${datasource}`, 0),
    line('info', `任务下发中,已扫描 1,200,000 行`, 1),
    line('warn', `收到用户终止请求,正在回收计算资源`, 2),
    line('warn', `查询已被用户主动终止,未返回结果集`, 2)
  ]
}

/** 定时任务运行日志(F35 展示,供任务详情使用) */
export function taskRunLogs(taskName: string, rows: number): LogEntry[] {
  return [
    line('info', `调度器触发任务「${taskName}」`, 0),
    line('info', `加载关联脚本,解析参数 dt=${ts().slice(0, 10)}`, 1),
    line('info', `写入目标表成功,影响 ${rows} 行`, 2),
    line('info', `任务执行成功,总耗时 ${(12 + rows / 100).toFixed(1)}s`, 3)
  ]
}
