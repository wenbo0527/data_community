/**
 * 模型离线分析状态管理模块
 * 基于Pinia的状态管理
 */

import { defineStore } from 'pinia'

// 特征中心状态
export const useFeatureStore = defineStore('feature', {
  state: () => ({
    features: [],
    loading: false,
    pagination: {
      current: 1,
      pageSize: 10,
      total: 0
    },
    filterForm: {
      name: '',
      type: '',
      status: ''
    },
    selectedRows: [],
    stats: {
      totalFeatures: 0,
      activeFeatures: 0,
      pendingFeatures: 0,
      expiredFeatures: 0
    }
  }),

  getters: {
    getFeatures: (state) => state.features,
    getLoading: (state) => state.loading,
    getPagination: (state) => state.pagination,
    getFilterForm: (state) => state.filterForm,
    getSelectedRows: (state) => state.selectedRows,
    getStats: (state) => state.stats
  },

  actions: {
    setFeatures(features) {
      this.features = features
    },
    
    setLoading(loading) {
      this.loading = loading
    },
    
    setPagination(pagination) {
      this.pagination = { ...this.pagination, ...pagination }
    },
    
    setFilterForm(form) {
      this.filterForm = { ...this.filterForm, ...form }
    },
    
    setSelectedRows(rows) {
      this.selectedRows = rows
    },
    
    setStats(stats) {
      this.stats = { ...this.stats, ...stats }
    },
    
    resetFilter() {
      this.filterForm = {
        name: '',
        type: '',
        status: ''
      }
    }
  }
})

// 模型注册状态
export const useModelStore = defineStore('model', {
  state: () => ({
    models: [],
    loading: false,
    pagination: {
      current: 1,
      pageSize: 10,
      total: 0
    },
    filterForm: {
      name: '',
      type: '',
      framework: '',
      status: ''
    },
    selectedRows: [],
    stats: {
      totalModels: 0,
      activeModels: 0,
      trainingModels: 0,
      failedModels: 0
    }
  }),

  getters: {
    getModels: (state) => state.models,
    getLoading: (state) => state.loading,
    getPagination: (state) => state.pagination,
    getFilterForm: (state) => state.filterForm,
    getSelectedRows: (state) => state.selectedRows,
    getStats: (state) => state.stats
  },

  actions: {
    setModels(models) {
      this.models = models
    },
    
    setLoading(loading) {
      this.loading = loading
    },
    
    setPagination(pagination) {
      this.pagination = { ...this.pagination, ...pagination }
    },
    
    setFilterForm(form) {
      this.filterForm = { ...this.filterForm, ...form }
    },
    
    setSelectedRows(rows) {
      this.selectedRows = rows
    },
    
    setStats(stats) {
      this.stats = { ...this.stats, ...stats }
    },
    
    resetFilter() {
      this.filterForm = {
        name: '',
        type: '',
        framework: '',
        status: ''
      }
    }
  }
})

// 任务管理状态
export const useTaskStore = defineStore('task', {
  state: () => ({
    tasks: [],
    loading: false,
    pagination: {
      current: 1,
      pageSize: 10,
      total: 0
    },
    filterForm: {
      name: '',
      type: '',
      status: '',
      priority: ''
    },
    selectedRows: [],
    stats: {
      runningTasks: 0,
      completedTasks: 0,
      failedTasks: 0,
      pausedTasks: 0
    }
  }),

  getters: {
    getTasks: (state) => state.tasks,
    getLoading: (state) => state.loading,
    getPagination: (state) => state.pagination,
    getFilterForm: (state) => state.filterForm,
    getSelectedRows: (state) => state.selectedRows,
    getStats: (state) => state.stats
  },

  actions: {
    setTasks(tasks) {
      this.tasks = tasks
    },
    
    setLoading(loading) {
      this.loading = loading
    },
    
    setPagination(pagination) {
      this.pagination = { ...this.pagination, ...pagination }
    },
    
    setFilterForm(form) {
      this.filterForm = { ...this.filterForm, ...form }
    },
    
    setSelectedRows(rows) {
      this.selectedRows = rows
    },
    
    setStats(stats) {
      this.stats = { ...this.stats, ...stats }
    },
    
    resetFilter() {
      this.filterForm = {
        name: '',
        type: '',
        status: '',
        priority: ''
      }
    }
  }
})

// 模型评估状态
export const useEvaluationStore = defineStore('evaluation', {
  state: () => ({
    evaluations: [],
    loading: false,
    pagination: {
      current: 1,
      pageSize: 10,
      total: 0
    },
    filterForm: {
      modelName: '',
      evaluationType: '',
      dateRange: []
    },
    selectedRows: []
  }),

  getters: {
    getEvaluations: (state) => state.evaluations,
    getLoading: (state) => state.loading,
    getPagination: (state) => state.pagination,
    getFilterForm: (state) => state.filterForm,
    getSelectedRows: (state) => state.selectedRows
  },

  actions: {
    setEvaluations(evaluations) {
      this.evaluations = evaluations
    },
    
    setLoading(loading) {
      this.loading = loading
    },
    
    setPagination(pagination) {
      this.pagination = { ...this.pagination, ...pagination }
    },
    
    setFilterForm(form) {
      this.filterForm = { ...this.filterForm, ...form }
    },
    
    setSelectedRows(rows) {
      this.selectedRows = rows
    },
    
    resetFilter() {
      this.filterForm = {
        modelName: '',
        evaluationType: '',
        dateRange: []
      }
    }
  }
})

// 模型离线分析主状态
export const useModelOfflineStore = defineStore('modelOffline', {
  state: () => ({
    activeMenu: 'feature-center',
    collapsed: false,
    breadcrumb: []
  }),

  getters: {
    getActiveMenu: (state) => state.activeMenu,
    getCollapsed: (state) => state.collapsed,
    getBreadcrumb: (state) => state.breadcrumb
  },

  actions: {
    setActiveMenu(menu) {
      this.activeMenu = menu
    },
    
    setCollapsed(collapsed) {
      this.collapsed = collapsed
    },
    
    setBreadcrumb(breadcrumb) {
      this.breadcrumb = breadcrumb
    }
  }
})