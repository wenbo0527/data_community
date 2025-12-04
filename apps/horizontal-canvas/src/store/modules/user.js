const state = {
  currentUser: null,
  users: [],
  roles: [],
  permissions: [],
  loading: false,
  error: null
}

const mutations = {
  SET_CURRENT_USER(state, user) {
    state.currentUser = user
  },
  
  SET_USERS(state, users) {
    state.users = users
  },
  
  SET_ROLES(state, roles) {
    state.roles = roles
  },
  
  SET_PERMISSIONS(state, permissions) {
    state.permissions = permissions
  },
  
  SET_LOADING(state, loading) {
    state.loading = loading
  },
  
  SET_ERROR(state, error) {
    state.error = error
  },
  
  CLEAR_ERROR(state) {
    state.error = null
  }
}

const actions = {
  // 获取当前用户信息
  async fetchCurrentUser({ commit }) {
    try {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      // 模拟API调用
      const mockUser = {
        id: '1',
        username: 'admin',
        name: '管理员',
        email: 'admin@example.com',
        avatar: '',
        roles: ['admin'],
        permissions: ['*'],
        department: '技术部',
        phone: '13800138000',
        status: 'active',
        createTime: '2024-01-01T00:00:00Z',
        updateTime: '2024-01-01T00:00:00Z'
      }
      
      commit('SET_CURRENT_USER', mockUser)
      return mockUser
    } catch (error) {
      commit('SET_ERROR', error)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  // 获取用户列表
  async fetchUsers({ commit }) {
    try {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      // 模拟用户数据
      const mockUsers = [
        {
          id: '1',
          username: 'admin',
          name: '管理员',
          email: 'admin@example.com',
          avatar: '',
          roles: ['admin'],
          department: '技术部',
          phone: '13800138000',
          status: 'active',
          createTime: '2024-01-01T00:00:00Z',
          updateTime: '2024-01-01T00:00:00Z'
        },
        {
          id: '2',
          username: 'zhangsan',
          name: '张三',
          email: 'zhangsan@example.com',
          avatar: '',
          roles: ['operator'],
          department: '运营部',
          phone: '13800138001',
          status: 'active',
          createTime: '2024-01-01T00:00:00Z',
          updateTime: '2024-01-01T00:00:00Z'
        },
        {
          id: '3',
          username: 'lisi',
          name: '李四',
          email: 'lisi@example.com',
          avatar: '',
          roles: ['operator'],
          department: '运营部',
          phone: '13800138002',
          status: 'active',
          createTime: '2024-01-01T00:00:00Z',
          updateTime: '2024-01-01T00:00:00Z'
        },
        {
          id: '4',
          username: 'wangwu',
          name: '王五',
          email: 'wangwu@example.com',
          avatar: '',
          roles: ['viewer'],
          department: '客服部',
          phone: '13800138003',
          status: 'active',
          createTime: '2024-01-01T00:00:00Z',
          updateTime: '2024-01-01T00:00:00Z'
        }
      ]
      
      commit('SET_USERS', mockUsers)
      return mockUsers
    } catch (error) {
      commit('SET_ERROR', error)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  // 获取角色列表
  async fetchRoles({ commit }) {
    try {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      // 模拟角色数据
      const mockRoles = [
        {
          id: 'admin',
          name: '管理员',
          description: '系统管理员，拥有所有权限',
          permissions: ['*'],
          createTime: '2024-01-01T00:00:00Z',
          updateTime: '2024-01-01T00:00:00Z'
        },
        {
          id: 'operator',
          name: '操作员',
          description: '运营人员，可以管理规则和模板',
          permissions: [
            'notification:read',
            'notification:create',
            'notification:update',
            'notification:delete',
            'template:read',
            'template:create',
            'template:update',
            'template:delete'
          ],
          createTime: '2024-01-01T00:00:00Z',
          updateTime: '2024-01-01T00:00:00Z'
        },
        {
          id: 'viewer',
          name: '查看者',
          description: '只能查看数据，不能修改',
          permissions: [
            'notification:read',
            'template:read'
          ],
          createTime: '2024-01-01T00:00:00Z',
          updateTime: '2024-01-01T00:00:00Z'
        }
      ]
      
      commit('SET_ROLES', mockRoles)
      return mockRoles
    } catch (error) {
      commit('SET_ERROR', error)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  // 更新用户信息
  async updateUser({ commit }, userData) {
    try {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      // 模拟更新用户
      const updatedUser = {
        ...userData,
        updateTime: new Date().toISOString()
      }
      
      // 更新当前用户（如果是当前用户）
      if (state.currentUser && state.currentUser.id === userData.id) {
        commit('SET_CURRENT_USER', updatedUser)
      }
      
      return updatedUser
    } catch (error) {
      commit('SET_ERROR', error)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  // 登出
  async logout({ commit }) {
    try {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      // 清除当前用户信息
      commit('SET_CURRENT_USER', null)
      
      return true
    } catch (error) {
      commit('SET_ERROR', error)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  // 清除错误
  clearError({ commit }) {
    commit('CLEAR_ERROR')
  }
}

const getters = {
  currentUser: state => state.currentUser,
  isLoggedIn: state => !!state.currentUser,
  users: state => state.users,
  roles: state => state.roles,
  permissions: state => state.permissions,
  
  // 用户相关
  userById: state => id => state.users.find(user => user.id === id),
  userByUsername: state => username => state.users.find(user => user.username === username),
  
  // 角色相关
  roleById: state => id => state.roles.find(role => role.id === id),
  
  // 权限相关
  hasPermission: state => permission => {
    if (!state.currentUser) return false
    if (state.currentUser.permissions.includes('*')) return true
    return state.currentUser.permissions.includes(permission)
  },
  
  hasRole: state => role => {
    if (!state.currentUser) return false
    return state.currentUser.roles.includes(role)
  },
  
  // 状态相关
  loading: state => state.loading,
  error: state => state.error,
  hasError: state => !!state.error,
  
  // 用户统计
  totalUsers: state => state.users.length,
  activeUsers: state => state.users.filter(user => user.status === 'active').length,
  usersByRole: state => {
    const counts = {}
    state.users.forEach(user => {
      user.roles.forEach(role => {
        counts[role] = (counts[role] || 0) + 1
      })
    })
    return counts
  },
  
  // 部门统计
  usersByDepartment: state => {
    const counts = {}
    state.users.forEach(user => {
      const dept = user.department || '未分配'
      counts[dept] = (counts[dept] || 0) + 1
    })
    return counts
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}