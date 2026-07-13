/**
 * classify-constants (R3 stub)
 *
 * 原始来源: 计划从 dmt-app 共享包 @shared/classify-constants 引入
 * 当前状态: workspace 中不存在 @shared 包 (R3 grep 验证)
 *           vite alias 修复后指向本地 src/mock/shared/，需要 stub 文件
 * 实施者: data_community_dev
 * 实施时间: 2026-07-13 11:10 CST
 *
 * SENSITIVITY_NAMES 用法: 在 TableDetailPage.vue 中显示字段敏感级别中文名
 * 键: 敏感级别 code (L1/L2/L3/L4 或 P1/P2/P3/P4)
 * 值: 中文显示名
 */

export const SENSITIVITY_NAMES: Record<string, string> = {
  L1: '低敏感',
  L2: '一般敏感',
  L3: '重要敏感',
  L4: '核心敏感',
  P1: '公开',
  P2: '内部',
  P3: '机密',
  P4: '绝密'
}

export const CLASSIFY_CATEGORIES = {
  PERSON: '个人信息',
  PROPERTY: '财产信息',
  BEHAVIOR: '行为信息',
  DEVICE: '设备信息'
} as const

export const GRADE_NAMES: Record<string, string> = {
  A: 'A级',
  B: 'B级',
  C: 'C级',
  D: 'D级'
}