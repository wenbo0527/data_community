/**
 * 角色权限 composable · 文档 D.2 权限矩阵
 * 阶段 S3-2 · 角色切换 + 权限检查
 *
 * 当前角色：
 * - risk_data_member: 风险数据成员（主操作者）
 * - risk_data_admin: 风险数据管理员（含数仓重试/批次重试）
 * - community_admin: 数字社区管理员（只读 + 同步失败重试）
 *
 * 系统角色（用于状态变更记录）：
 * - variable_center_system: 变量中心系统
 * - internal_number_system: 内数系统
 * - dw_system: 数仓系统
 * - oa_system: OA系统
 */
import { computed, onMounted, onUnmounted, ref } from 'vue'
import UserContext, { ROLE_LABELS } from '@/modules/variable-hub/mock/risk-feature/permissions'

export function useRolePermissions() {
  // 角色 + 用户信息（响应式）
  const role = ref(UserContext.get().role as string)
  const userId = ref(UserContext.get().userId as string)
  const name = ref(UserContext.get().name as string)

  // 监听全局事件（保持与原 UserContext 兼容）
  function handleRoleChange() {
    const ctx = UserContext.get()
    role.value = ctx.role
    userId.value = ctx.userId
    name.value = ctx.name
  }

  onMounted(() => {
    window.addEventListener('user-context-changed', handleRoleChange)
  })
  onUnmounted(() => {
    window.removeEventListener('user-context-changed', handleRoleChange)
  })

  /** 当前角色中文名 */
  const roleLabel = computed(() => (ROLE_LABELS as Record<string, string>)[role.value] || role.value)

  /** 是否匹配角色 */
  const isMember = computed(() => role.value === 'risk_data_member')
  const isAdmin = computed(() => role.value === 'risk_data_admin')
  const isCommunity = computed(() => role.value === 'community_admin')

  /** 检查权限 */
  function has(permission: string) {
    return UserContext.has(permission)
  }

  function hasAny(...permissions: string[]) {
    return UserContext.hasAny(...permissions)
  }

  /** 切换角色 */
  function switchRole(newRole: string) {
    UserContext.switchRole(newRole)
    // UserContext 已经 dispatchEvent('user-context-changed')
    // 但为确保响应式，强制赋值
    const ctx = UserContext.get()
    role.value = ctx.role
    userId.value = ctx.userId
    name.value = ctx.name
  }

  /**
   * 当前角色可以执行的操作列表（基于状态）
   * 用于动态操作按钮的过滤
   */
  function getAllowedActionsForRole(roleKey: string, allActions: any[]) {
    // 社区管理员：无操作
    if (roleKey === 'community_admin') return []
    // 风险数据成员：主流程 + 同步失败重试
    if (roleKey === 'risk_data_member') {
      return allActions.filter(a =>
        a.key === 'submit_dev_oa' ||
        a.key === 'submit_verify' ||
        a.key === 'verify_pass' ||
        a.key === 'verify_reject' ||
        a.key === 'start_online' ||
        a.key === 'request_offline' ||
        a.key === 'retry_sync' ||
        a.key === 'supplement_table'
      )
    }
    // 风险数据管理员：全部操作
    return allActions
  }

  return {
    role,
    userId,
    name,
    roleLabel,
    isMember,
    isAdmin,
    isCommunity,
    has,
    hasAny,
    switchRole,
    getAllowedActionsForRole
  }
}