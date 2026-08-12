/**
 * 角色权限类型定义 · 文档 D.2 权限矩阵
 * 3 个用户角色 + 2 个系统角色
 */

export type UserRole = 'risk_data_member' | 'risk_data_admin' | 'community_admin'
export type SystemRole = 'variable_center_system' | 'internal_number_system' | 'dw_system' | 'oa_system'
export type AnyRole = UserRole | SystemRole

export interface UserContext {
  userId: string
  name: string
  role: AnyRole
}

export const USER_ROLES: Record<UserRole, UserRole> = {
  risk_data_member: 'risk_data_member',
  risk_data_admin: 'risk_data_admin',
  community_admin: 'community_admin'
}

export const ROLE_LABELS: Record<AnyRole, string> = {
  risk_data_member: '风险数据成员',
  risk_data_admin: '风险数据管理员',
  community_admin: '数字社区管理员',
  variable_center_system: '变量中心系统',
  internal_number_system: '内数系统',
  dw_system: '数仓系统',
  oa_system: 'OA系统'
}

export const ROLE_COLORS: Record<AnyRole, string> = {
  risk_data_member: 'arcoblue',
  risk_data_admin: 'purple',
  community_admin: 'gold',
  variable_center_system: 'cyan',
  internal_number_system: 'cyan',
  dw_system: 'cyan',
  oa_system: 'cyan'
}

/** 文档 D.2 权限矩阵：3 角色 12 操作（2026-08-10 新增需求提出/业务验收节点） */
export type Permission =
  | 'submit_requirement'        // A0 需求提出审核
  | 'submit_dev_oa'             // C1
  | 'business_verify_pass'      // 业务验收通过
  | 'admin_confirm_pass'        // 管理员确认通过
  | 'submit_production_order'   // 提交生产单
  | 'request_offline'           // F-07
  | 'retry_sync'                // G2/H2
  | 'retry_dw'                  // D2
  | 'manual_batch_retry'        // K2
  | 'supplement_table'          // B1

export const PERMISSIONS: Record<Permission, Permission> = {
  submit_requirement: 'submit_requirement',
  submit_dev_oa: 'submit_dev_oa',
  business_verify_pass: 'business_verify_pass',
  admin_confirm_pass: 'admin_confirm_pass',
  submit_production_order: 'submit_production_order',
  request_offline: 'request_offline',
  retry_sync: 'retry_sync',
  retry_dw: 'retry_dw',
  manual_batch_retry: 'manual_batch_retry',
  supplement_table: 'supplement_table',
}
