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