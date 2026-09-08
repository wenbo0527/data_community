/**
 * 数据分级分类 - 共享常量
 * 安全级别配色 + 枚举值
 */
import type { SensitivityLevel } from './classify-types'

/** 安全级别配色（与 PRD 附录 A 一致） */
export const SENSITIVITY_COLORS: Record<SensitivityLevel, string> = {
  L1: 'green',
  L2: 'gold',
  L3: 'orange',
  L4: 'red'
}

/** 安全级别名称 */
export const SENSITIVITY_NAMES: Record<SensitivityLevel, string> = {
  L1: '公开',
  L2: '内部',
  L3: '秘密',
  L4: '机密'
}

/** 分级枚举 */
export const GRADE_OPTIONS = ['一般', '重要', '关键'] as const

/** 业务属于枚举 */
export const BELONGING_OPTIONS = ['零售', '对公', '风控', '运营', '财务'] as const

/** 模拟角色（用于 F8 权限提示） */
export const MOCK_ROLES = [
  { value: 'governance', label: '数据治理员（可编辑）' },
  { value: 'analyst', label: '数据分析师（只读）' }
]
