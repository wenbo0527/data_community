/**
 * classify-modules (R3 stub)
 *
 * 原始来源: 计划从 dmt-app 共享包 @shared/classify-modules 引入
 * 当前状态: workspace 中不存在 @shared 包 (R3 grep 验证)
 *           vite alias 修复后指向本地 src/mock/shared/，需要 stub 文件
 * 实施者: data_community_dev
 * 实施时间: 2026-07-13 11:10 CST
 *
 * classifyAllTables 用法 (来自 metadata-store.ts):
 *   classifyAllTables.map(t => ({
 *     name: t.table_name,
 *     type: t.schema.startsWith('hive') ? 'HIVE 表' : '业务表',
 *     category: '业务表',
 *     domain: t.system_name,
 *     ...
 *     fields: t.fields.map((f: ClassifyField) => ({ name: f.field_name, ... }))
 *   }))
 *
 * R3 stub: 返回空数组 + 注释 TODO，避免运行时崩，metadata-store 仍能初始化
 * 后续: PM A' 决策 - 创建 packages/shared/ 共享包，从 dmt-app 拉取真实数据
 */

import type { ClassifyTable } from './classify-types'

// TODO(R3): 从 dmt-app @shared/classify-modules 拉取真实分级分类数据
// 当前 stub: 空数组，避免 import error，运行时 getTables() 返回 []
export const classifyAllTables: ClassifyTable[] = []

export function classifyTable(tableName: string): ClassifyTable | undefined {
  return classifyAllTables.find(t => t.table_name === tableName)
}

export function classifyField(tableName: string, fieldName: string) {
  const table = classifyTable(tableName)
  return table?.fields.find(f => f.field_name === fieldName)
}