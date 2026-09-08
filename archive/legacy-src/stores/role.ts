/**
 * 角色 Pinia Store
 *
 * 提供全局用户角色 + 权限状态
 * @see 文档 §7 角色场景
 */
import { defineStore } from 'pinia'

export type UserRole = 'all' | 'business' | 'analyst' | 'modeler' | 'admin' | 'governance' | 'approver'

export interface RoleState {
  currentRole: UserRole
  currentUser: {
    id: string
    name: string
    department: string
  }
  permissions: string[]
  isAuthenticated: boolean
}

export const useRoleStore = defineStore('role', {
  state: (): RoleState => ({
    currentRole: (localStorage.getItem('dca-role') as UserRole) || 'all',
    currentUser: {
      id: 'user-yunying',
      name: '演示用户',
      department: '演示部门'
    },
    permissions: ['*'],
    isAuthenticated: true
  }),

  getters: {
    isAdmin(state): boolean {
      return state.currentRole === 'admin' || state.currentRole === 'governance'
    },
    isApprover(state): boolean {
      return state.currentRole === 'approver'
    },
    hasPermission: (state) => (permission: string) => {
      if (!state.isAuthenticated) return false
      return state.permissions.includes('*') || state.permissions.includes(permission)
    }
  },

  actions: {
    setRole(role: UserRole) {
      this.currentRole = role
      localStorage.setItem('dca-role', role)
    },

    setUser(user: Partial<RoleState['currentUser']>) {
      this.currentUser = { ...this.currentUser, ...user }
    },

    setPermissions(perms: string[]) {
      this.permissions = perms
    },

    logout() {
      this.isAuthenticated = false
      this.permissions = []
      localStorage.removeItem('dca-role')
    },

    login() {
      this.isAuthenticated = true
      this.permissions = ['*']
    }
  }
})

export default useRoleStore