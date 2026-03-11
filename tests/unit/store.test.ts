import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useFeatureStore, useModelStore, useTaskStore, useEvaluationStore, useModelOfflineStore } from '@/store/modules/model-offline'

describe('Store Modules', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('FeatureStore', () => {
    it('should initialize with default state', () => {
      const store = useFeatureStore()
      
      expect(store.features).toEqual([])
      expect(store.loading).toBe(false)
      expect(store.pagination.current).toBe(1)
      expect(store.pagination.pageSize).toBe(10)
      expect(store.pagination.total).toBe(0)
      expect(store.filterForm).toEqual({
        name: '',
        type: '',
        status: ''
      })
    })

    it('should set features correctly', () => {
      const store = useFeatureStore()
      const mockFeatures = [
        { id: 1, name: 'test-feature', code: 'TEST001' }
      ]
      
      store.setFeatures(mockFeatures)
      expect(store.features).toEqual(mockFeatures)
    })

    it('should update pagination', () => {
      const store = useFeatureStore()
      const newPagination = { current: 2, total: 100 }
      
      store.setPagination(newPagination)
      expect(store.pagination.current).toBe(2)
      expect(store.pagination.total).toBe(100)
    })

    it('should reset filter form', () => {
      const store = useFeatureStore()
      store.filterForm.name = 'test'
      store.filterForm.type = 'numerical'
      
      store.resetFilter()
      expect(store.filterForm).toEqual({
        name: '',
        type: '',
        status: ''
      })
    })
  })

  describe('ModelStore', () => {
    it('should initialize with default state', () => {
      const store = useModelStore()
      
      expect(store.models).toEqual([])
      expect(store.loading).toBe(false)
      expect(store.filterForm).toEqual({
        name: '',
        type: '',
        framework: '',
        status: ''
      })
    })

    it('should set models correctly', () => {
      const store = useModelStore()
      const mockModels = [
        { id: 1, name: 'test-model', framework: 'tensorflow' }
      ]
      
      store.setModels(mockModels)
      expect(store.models).toEqual(mockModels)
    })
  })

  describe('TaskStore', () => {
    it('should initialize with default state', () => {
      const store = useTaskStore()
      
      expect(store.tasks).toEqual([])
      expect(store.loading).toBe(false)
      expect(store.filterForm.priority).toBe('')
    })

    it('should update task stats', () => {
      const store = useTaskStore()
      const newStats = { runningTasks: 5, completedTasks: 10 }
      
      store.setStats(newStats)
      expect(store.stats.runningTasks).toBe(5)
      expect(store.stats.completedTasks).toBe(10)
    })
  })

  describe('EvaluationStore', () => {
    it('should initialize with default state', () => {
      const store = useEvaluationStore()
      
      expect(store.evaluations).toEqual([])
      expect(store.loading).toBe(false)
      expect(store.filterForm.dateRange).toEqual([])
    })

    it('should set evaluations correctly', () => {
      const store = useEvaluationStore()
      const mockEvaluations = [
        { id: 1, modelName: 'test-model', score: 0.95 }
      ]
      
      store.setEvaluations(mockEvaluations)
      expect(store.evaluations).toEqual(mockEvaluations)
    })
  })

  describe('ModelOfflineStore', () => {
    it('should initialize with default state', () => {
      const store = useModelOfflineStore()
      
      expect(store.activeMenu).toBe('feature-center')
      expect(store.collapsed).toBe(false)
      expect(store.breadcrumb).toEqual([])
    })

    it('should update active menu', () => {
      const store = useModelOfflineStore()
      
      store.setActiveMenu('model-register')
      expect(store.activeMenu).toBe('model-register')
    })

    it('should update collapsed state', () => {
      const store = useModelOfflineStore()
      
      store.setCollapsed(true)
      expect(store.collapsed).toBe(true)
    })

    it('should update breadcrumb', () => {
      const store = useModelOfflineStore()
      const breadcrumb = [
        { name: '首页', path: '/' },
        { name: '模型离线分析', path: '/risk/model-offline-analysis' }
      ]
      
      store.setBreadcrumb(breadcrumb)
      expect(store.breadcrumb).toEqual(breadcrumb)
    })
  })
})