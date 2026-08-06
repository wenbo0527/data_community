/**
 * 角色权限 Pinia store
 * 阶段 1.1 · 包装 UserContext 让角色切换响应式
 *
 * 3 个用户角色 + 2 个系统角色（参见 permissions.ts · D.2 权限矩阵）
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import UserContext, { USER_ROLES, ROLE_LABELS, PERMISSIONS } from '@/modules/variable-hub/mock/risk-feature/permissions'

export const usePermissionStore = defineStore('permission', () => {
  // 角色 + 用户信息（响应式）
  const role = ref(UserContext.get().role as string)
  const userId = ref(UserContext.get().userId as string)
  const name = ref(UserContext.get().name as string)

  // 监听全局事件（保持与原 UserContext 兼容）
  if (typeof window !== 'undefined') {
    window.addEventListener('user-context-changed', () => {
      const ctx = UserContext.get()
      role.value = ctx.role
      userId.value = ctx.userId
      name.value = ctx.name
    })
  }

  /** 当前角色是否匹配 */
  const isMember = computed(() => role.value === USER_ROLES.RISK_DATA_MEMBER)
  const isAdmin = computed(() => role.value === USER_ROLES.RISK_DATA_ADMIN)
  const isCommunity = computed(() => role.value === USER_ROLES.COMMUNITY_ADMIN)

  /** 角色中文名 */
  const roleLabel = computed(() => ROLE_LABELS[role.value] || role.value)

  /** 切换角色（包装 UserContext.switchRole + 触发响应式） */
  function switchRole(newRole: string) {
    UserContext.switchRole(newRole)
    // UserContext 已经 dispatchEvent('user-context-changed')
    // 但为确保响应式，强制赋值
    const ctx = UserContext.get()
    role.value = ctx.role
    userId.value = ctx.userId
    name.value = ctx.name
  }

  /** 检查权限 */
  function has(p: string) {
    return UserContext.has(p)
  }

  function hasAny(...perms: string[]) {
    return UserContext.hasAny(...perms)
  }

  return {
    role,
    userId,
    name,
    isMember,
    isAdmin,
    isCommunity,
    roleLabel,
    switchRole,
    has,
    hasAny,
    // 暴露常量供外部使用
    USER_ROLES,
    PERMISSIONS
  }
})
