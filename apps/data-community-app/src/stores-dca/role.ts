/**
 * 角色状态管理(P0 角色机制 · Step 2)
 *
 * 平台角色切换 — 用户登录后从 ROLE_DEFINITIONS 取默认值,
 * dev 模式可在 RoleSwitcher 中自由切换。
 */

import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import {
  ROLE_DEFINITIONS,
  SHORTCUT_REGISTRY,
  type UserRole,
  type ShortcutMeta
} from '@/types-dca/roles'

const ROLE_STORAGE_KEY = 'data-mid-platform:current-role'

export const useRoleStore = defineStore('role', () => {
  // 当前角色(默认 data_engineer,持久化到 localStorage)
  const currentRole = ref<UserRole>('data_engineer')

  // 从 localStorage 恢复
  const initFromStorage = () => {
    try {
      const saved = localStorage.getItem(ROLE_STORAGE_KEY)
      if (saved && saved in ROLE_DEFINITIONS) {
        currentRole.value = saved as UserRole
      }
    } catch (e) {
      console.warn('[roleStore] localStorage 恢复失败', e)
    }
  }

  // 监听变化 → 写 localStorage
  watch(currentRole, (val) => {
    try {
      localStorage.setItem(ROLE_STORAGE_KEY, val)
    } catch (e) {
      console.warn('[roleStore] localStorage 写入失败', e)
    }
  })

  /** 当前角色元数据 */
  const currentRoleDef = computed(() => ROLE_DEFINITIONS[currentRole.value])

  /** 当前角色的快捷作业(带元数据) */
  const shortcuts = computed<ShortcutMeta[]>(() =>
    currentRoleDef.value.shortcuts
      .map(k => SHORTCUT_REGISTRY[k])
      .filter(Boolean)
  )

  /** 当前角色默认着陆页 */
  const defaultLanding = computed(() => currentRoleDef.value.defaultLanding)

  /** 切换角色 */
  const switchRole = (role: UserRole) => {
    if (role in ROLE_DEFINITIONS) {
      currentRole.value = role
      return true
    }
    console.warn(`[roleStore] 无效角色: ${role}`)
    return false
  }

  /** 重置 */
  const reset = () => {
    currentRole.value = 'data_engineer'
  }

  /** 工具:判断某路由是否可访问 */
  const canAccess = (routeName: string): boolean => {
    const def = currentRoleDef.value
    if (def.allowedRoutes.includes('*')) return true
    return def.allowedRoutes.includes(routeName)
  }

  return {
    currentRole,
    currentRoleDef,
    shortcuts,
    defaultLanding,
    switchRole,
    reset,
    canAccess,
    initFromStorage
  }
})