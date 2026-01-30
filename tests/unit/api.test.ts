import { describe, it, expect, vi } from 'vitest'
import { featureAPI, modelAPI, backtrackAPI, taskAPI, evaluationAPI } from '@/api/offlineModel'

// Mock the API modules
vi.mock('@/mock/offlineModel', () => ({
  default: {
    feature: {
      getFeatures: vi.fn().mockResolvedValue({
        success: true,
        data: {
          data: [
            { id: 1, name: 'test-feature', code: 'TEST001' }
          ],
          total: 1
        }
      }),
      getFeatureDetail: vi.fn().mockResolvedValue({
        success: true,
        data: { id: 1, name: 'test-feature' }
      }),
      createFeature: vi.fn().mockResolvedValue({
        success: true,
        data: { id: 2, name: 'new-feature' }
      })
    },
    model: {
      getModels: vi.fn().mockResolvedValue({
        success: true,
        data: {
          data: [
            { id: 1, name: 'test-model', framework: 'tensorflow' }
          ],
          total: 1
        }
      })
    }
  }
}))

describe('API Integration', () => {
  describe('FeatureAPI', () => {
    it('should fetch features successfully', async () => {
      const params = { page: 1, pageSize: 10 }
      const result = await featureAPI.getFeatures(params)
      
      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.data.data).toHaveLength(1)
      expect(result.data.data[0].name).toBe('test-feature')
    })

    it('should fetch feature detail successfully', async () => {
      const result = await featureAPI.getFeatureDetail(1)
      
      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.data.name).toBe('test-feature')
    })

    it('should create feature successfully', async () => {
      const featureData = {
        name: 'new-feature',
        code: 'NEW001',
        type: 'numerical'
      }
      
      const result = await featureAPI.createFeature(featureData)
      
      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.data.id).toBe(2)
      expect(result.data.name).toBe('new-feature')
    })
  })

  describe('ModelAPI', () => {
    it('should fetch models successfully', async () => {
      const params = { page: 1, pageSize: 10 }
      const result = await modelAPI.getModels(params)
      
      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.data.data).toHaveLength(1)
      expect(result.data.data[0].framework).toBe('tensorflow')
    })
  })

  describe('BacktrackAPI', () => {
    it('should fetch backtracks successfully', async () => {
      const params = { page: 1, pageSize: 10 }
      const result = await backtrackAPI.getBacktracks(params)
      
      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
    })

    it('should create backtrack successfully', async () => {
      const backtrackData = {
        name: 'test-backtrack',
        modelId: 1
      }
      
      const result = await backtrackAPI.createBacktrack(backtrackData)
      
      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.data.id).toBeDefined()
    })
  })

  describe('TaskAPI', () => {
    it('should fetch tasks successfully', async () => {
      const params = { page: 1, pageSize: 10 }
      const result = await taskAPI.getTasks(params)
      
      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
    })

    it('should create task successfully', async () => {
      const taskData = {
        name: 'test-task',
        type: 'training'
      }
      
      const result = await taskAPI.createTask(taskData)
      
      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.data.id).toBeDefined()
    })
  })

  describe('EvaluationAPI', () => {
    it('should fetch evaluations successfully', async () => {
      const params = { page: 1, pageSize: 10 }
      const result = await evaluationAPI.getEvaluations(params)
      
      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
    })

    it('should create evaluation successfully', async () => {
      const evaluationData = {
        modelId: 1,
        evaluationType: 'accuracy'
      }
      
      const result = await evaluationAPI.createEvaluation(evaluationData)
      
      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.data.id).toBeDefined()
    })
  })
})