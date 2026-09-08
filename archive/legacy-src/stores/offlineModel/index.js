/**
 * 离线模型模块状态管理
 */
import { defineStore } from 'pinia'

export const useOfflineModelStore = defineStore('offlineModel', {
  state: () => ({
    // 特征中心数据
    features: [],
    featureLoading: false,
    featurePagination: {
      current: 1,
      pageSize: 10,
      total: 0
    },
    
    // 模型注册数据
    models: [],
    modelLoading: false,
    modelPagination: {
      current: 1,
      pageSize: 10,
      total: 0
    },
    
    // 模型回溯数据
    backtracks: [],
    backtrackLoading: false,
    
    // 任务管理数据
    tasks: [],
    taskLoading: false,
    taskPagination: {
      current: 1,
      pageSize: 10,
      total: 0
    },
    
    // 模型评估数据
    evaluations: [],
    evaluationLoading: false,
    
    // 当前选中的特征/模型
    selectedFeature: null,
    selectedModel: null,
    
    // 筛选条件
    filters: {
      feature: {
        name: '',
        type: '',
        status: '',
        modelType: ''
      },
      model: {
        name: '',
        type: '',
        status: ''
      },
      task: {
        name: '',
        status: '',
        dateRange: []
      }
    }
  }),

  getters: {
    // 获取特征列表
    getFeatures: (state) => state.features,
    
    // 获取模型列表
    getModels: (state) => state.models,
    
    // 获取任务列表
    getTasks: (state) => state.tasks,
    
    // 获取评估列表
    getEvaluations: (state) => state.evaluations,
    
    // 获取加载状态
    isFeatureLoading: (state) => state.featureLoading,
    isModelLoading: (state) => state.modelLoading,
    isTaskLoading: (state) => state.taskLoading,
    isEvaluationLoading: (state) => state.evaluationLoading,
    
    // 获取筛选条件
    getFeatureFilters: (state) => state.filters.feature,
    getModelFilters: (state) => state.filters.model,
    getTaskFilters: (state) => state.filters.task
  },

  actions: {
    // 设置特征数据
    setFeatures(features) {
      this.features = features
    },
    
    // 设置模型数据
    setModels(models) {
      this.models = models
    },
    
    // 设置任务数据
    setTasks(tasks) {
      this.tasks = tasks
    },
    
    // 设置评估数据
    setEvaluations(evaluations) {
      this.evaluations = evaluations
    },
    
    // 设置加载状态
    setFeatureLoading(loading) {
      this.featureLoading = loading
    },
    
    setModelLoading(loading) {
      this.modelLoading = loading
    },
    
    setTaskLoading(loading) {
      this.taskLoading = loading
    },
    
    setEvaluationLoading(loading) {
      this.evaluationLoading = loading
    },
    
    // 设置分页数据
    setFeaturePagination(pagination) {
      this.featurePagination = { ...this.featurePagination, ...pagination }
    },
    
    setModelPagination(pagination) {
      this.modelPagination = { ...this.modelPagination, ...pagination }
    },
    
    setTaskPagination(pagination) {
      this.taskPagination = { ...this.taskPagination, ...pagination }
    },
    
    // 设置筛选条件
    setFeatureFilters(filters) {
      this.filters.feature = { ...this.filters.feature, ...filters }
    },
    
    setModelFilters(filters) {
      this.filters.model = { ...this.filters.model, ...filters }
    },
    
    setTaskFilters(filters) {
      this.filters.task = { ...this.filters.task, ...filters }
    },
    
    // 重置筛选条件
    resetFeatureFilters() {
      this.filters.feature = {
        name: '',
        type: '',
        status: '',
        modelType: ''
      }
    },
    
    resetModelFilters() {
      this.filters.model = {
        name: '',
        type: '',
        status: ''
      }
    },
    
    resetTaskFilters() {
      this.filters.task = {
        name: '',
        status: '',
        dateRange: []
      }
    },
    
    // 设置当前选中项
    setSelectedFeature(feature) {
      this.selectedFeature = feature
    },
    
    setSelectedModel(model) {
      this.selectedModel = model
    }
  },

  // 启用持久化
  persist: {
    key: 'offline-model-store',
    storage: localStorage,
    paths: ['filters', 'featurePagination', 'modelPagination', 'taskPagination']
  }
})