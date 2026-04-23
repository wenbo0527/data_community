import { createStore } from 'vuex'
import notification from './modules/notification'
import template from './modules/template'
import user from './modules/user'

export default createStore({
  state: {
    loading: false,
    error: null,
    sidebarCollapsed: false
  },
  
  mutations: {
    SET_LOADING(state, loading) {
      state.loading = loading
    },
    
    SET_ERROR(state, error) {
      state.error = error
    },
    
    CLEAR_ERROR(state) {
      state.error = null
    },
    
    TOGGLE_SIDEBAR(state) {
      state.sidebarCollapsed = !state.sidebarCollapsed
    }
  },
  
  actions: {
    setLoading({ commit }, loading) {
      commit('SET_LOADING', loading)
    },
    
    setError({ commit }, error) {
      commit('SET_ERROR', error)
    },
    
    clearError({ commit }) {
      commit('CLEAR_ERROR')
    },
    
    toggleSidebar({ commit }) {
      commit('TOGGLE_SIDEBAR')
    }
  },
  
  getters: {
    isLoading: state => state.loading,
    hasError: state => !!state.error,
    errorMessage: state => state.error?.message || '未知错误',
    sidebarCollapsed: state => state.sidebarCollapsed
  },
  
  modules: {
    notification,
    template,
    user
  }
})

// Mock 用户数据
const mockUserInfo = {
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

// 兼容旧代码的 useUserStore
// 返回一个带有 mock userInfo 的对象
export const useUserStore = () => {
  return {
    state: { userInfo: mockUserInfo },
    userInfo: mockUserInfo,  // 直接暴露 userInfo 属性
    getters: {
      currentUser: () => mockUserInfo,
      isLoggedIn: () => true,
      hasPermission: (permission) => permission === '*' || mockUserInfo.permissions.includes(permission)
    },
    actions: {
      async fetchCurrentUser() {
        return mockUserInfo
      }
    },
    mutations: {}
  }
}
