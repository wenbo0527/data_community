import { describe, it, expect, beforeEach, vi } from 'vitest'
import { BudgetMockService } from '../../src/mock/budget'
import { budgetApiService } from '../../src/api/budget'
import { BudgetStatus, BudgetType, BusinessType, Department } from '../../src/types/budget'

// 模拟延迟函数
vi.mock('../../src/api/budget', () => {
  const actual = vi.importActual('../../src/api/budget')
  return {
    ...actual,
    delay: vi.fn(() => Promise.resolve())
  }
})

describe('Budget API Service', () => {
  let mockService: BudgetMockService

  beforeEach(() => {
    mockService = new BudgetMockService()
    // 重置模拟数据
    mockService.resetData()
  })

  describe('Budget Operations', () => {
    it('should get budgets with pagination', async () => {
      const result = await budgetApiService.getBudgets({
        page: 1,
        pageSize: 10,
        year: 2024
      })

      expect(result).toHaveProperty('data')
      expect(result).toHaveProperty('total')
      expect(result).toHaveProperty('page')
      expect(result).toHaveProperty('pageSize')
      expect(Array.isArray(result.data)).toBe(true)
      expect(result.data.length).toBeLessThanOrEqual(10)
    })

    it('should filter budgets by department', async () => {
      const result = await budgetApiService.getBudgets({
        department: Department.IT
      })

      expect(result.data.every((budget: any) => budget.department === Department.IT)).toBe(true)
    })

    it('should filter budgets by status', async () => {
      const result = await budgetApiService.getBudgets({
        status: BudgetStatus.ACTIVE
      })

      expect(result.data.every((budget: any) => budget.status === BudgetStatus.ACTIVE)).toBe(true)
    })

    it('should get budget by id', async () => {
      // 先创建一个预算
      const newBudget = await budgetApiService.createBudget({
        name: '测试预算',
        year: 2024,
        department: Department.IT,
        businessType: BusinessType.TECHNOLOGY,
        totalAmount: 1000000,
        description: '测试预算描述'
      })

      const budget = await budgetApiService.getBudgetById(newBudget.id)
      expect(budget).toBeDefined()
      expect(budget.id).toBe(newBudget.id)
      expect(budget.name).toBe('测试预算')
    })

    it('should create budget', async () => {
      const budgetData = {
        name: '新项目预算',
        year: 2024,
        department: Department.MARKETING,
        businessType: BusinessType.MARKETING,
        totalAmount: 500000,
        description: '这是一个测试预算'
      }

      const result = await budgetApiService.createBudget(budgetData)
      expect(result).toHaveProperty('id')
      expect(result.name).toBe(budgetData.name)
      expect(result.year).toBe(budgetData.year)
      expect(result.totalAmount).toBe(budgetData.totalAmount)
      expect(result.status).toBe(BudgetStatus.DRAFT)
    })

    it('should update budget', async () => {
      // 先创建一个预算
      const budget = await budgetApiService.createBudget({
        name: '原始预算',
        year: 2024,
        department: Department.IT,
        businessType: BusinessType.TECHNOLOGY,
        totalAmount: 1000000,
        description: '原始描述'
      })

      const updatedBudget = await budgetApiService.updateBudget(budget.id, {
        name: '更新后的预算',
        description: '更新后的描述'
      })

      expect(updatedBudget.name).toBe('更新后的预算')
      expect(updatedBudget.description).toBe('更新后的描述')
      expect(updatedBudget.totalAmount).toBe(1000000) // 其他字段保持不变
    })

    it('should delete budget', async () => {
      // 先创建一个预算
      const budget = await budgetApiService.createBudget({
        name: '待删除预算',
        year: 2024,
        department: Department.IT,
        businessType: BusinessType.TECHNOLOGY,
        totalAmount: 1000000,
        description: '待删除'
      })

      await budgetApiService.deleteBudget(budget.id)
      
      // 验证预算已被删除
      await expect(budgetApiService.getBudgetById(budget.id)).rejects.toThrow()
    })
  })

  describe('Budget Subject Operations', () => {
    it('should get budget subjects', async () => {
      const result = await budgetApiService.getBudgetSubjects({
        budgetId: 'test-budget-id'
      })

      expect(result).toHaveProperty('data')
      expect(Array.isArray(result.data)).toBe(true)
    })

    it('should create budget subject', async () => {
      const subjectData = {
        budgetId: 'test-budget-id',
        code: 'TEST-001',
        name: '测试科目',
        category: '测试分类',
        amount: 100000,
        description: '测试科目描述'
      }

      const result = await budgetApiService.createBudgetSubject(subjectData)
      expect(result).toHaveProperty('id')
      expect(result.code).toBe(subjectData.code)
      expect(result.name).toBe(subjectData.name)
      expect(result.amount).toBe(subjectData.amount)
    })
  })

  describe('Cost Record Operations', () => {
    it('should get cost records', async () => {
      const result = await budgetApiService.getCostRecords({
        budgetId: 'test-budget-id'
      })

      expect(result).toHaveProperty('data')
      expect(Array.isArray(result.data)).toBe(true)
    })

    it('should create cost record', async () => {
      const costData = {
        budgetId: 'test-budget-id',
        subjectId: 'test-subject-id',
        amount: 50000,
        type: '人力成本',
        description: '测试成本记录',
        date: new Date().toISOString()
      }

      const result = await budgetApiService.createCostRecord(costData)
      expect(result).toHaveProperty('id')
      expect(result.amount).toBe(costData.amount)
      expect(result.type).toBe(costData.type)
    })
  })

  describe('Contract Operations', () => {
    it('should get contracts', async () => {
      const result = await budgetApiService.getContracts({
        budgetId: 'test-budget-id'
      })

      expect(result).toHaveProperty('data')
      expect(Array.isArray(result.data)).toBe(true)
    })

    it('should create contract', async () => {
      const contractData = {
        budgetId: 'test-budget-id',
        name: '测试合同',
        contractNo: 'TEST-CONTRACT-001',
        amount: 200000,
        partyA: '甲方公司',
        partyB: '乙方公司',
        signDate: new Date().toISOString(),
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      }

      const result = await budgetApiService.createContract(contractData)
      expect(result).toHaveProperty('id')
      expect(result.name).toBe(contractData.name)
      expect(result.contractNo).toBe(contractData.contractNo)
      expect(result.amount).toBe(contractData.amount)
    })
  })

  describe('Settlement Operations', () => {
    it('should get settlements', async () => {
      const result = await budgetApiService.getSettlements({
        contractId: 'test-contract-id'
      })

      expect(result).toHaveProperty('data')
      expect(Array.isArray(result.data)).toBe(true)
    })

    it('should create settlement', async () => {
      const settlementData = {
        contractId: 'test-contract-id',
        settlementNo: 'TEST-SETTLEMENT-001',
        amount: 100000,
        type: '阶段结算',
        description: '测试结算单',
        settlementDate: new Date().toISOString()
      }

      const result = await budgetApiService.createSettlement(settlementData)
      expect(result).toHaveProperty('id')
      expect(result.settlementNo).toBe(settlementData.settlementNo)
      expect(result.amount).toBe(settlementData.amount)
    })
  })

  describe('Alert Operations', () => {
    it('should get alerts', async () => {
      const result = await budgetApiService.getAlerts({
        budgetId: 'test-budget-id'
      })

      expect(result).toHaveProperty('data')
      expect(Array.isArray(result.data)).toBe(true)
    })

    it('should create alert', async () => {
      const alertData = {
        budgetId: 'test-budget-id',
        type: '超支预警',
        level: 'HIGH',
        title: '测试预警',
        content: '这是一个测试预警',
        threshold: 80,
        currentValue: 85
      }

      const result = await budgetApiService.createAlert(alertData)
      expect(result).toHaveProperty('id')
      expect(result.title).toBe(alertData.title)
      expect(result.level).toBe(alertData.level)
      expect(result.status).toBe('UNREAD')
    })
  })

  describe('Statistics Operations', () => {
    it('should get budget statistics', async () => {
      const result = await budgetApiService.getBudgetStatistics()

      expect(result).toHaveProperty('totalBudgets')
      expect(result).toHaveProperty('totalAmount')
      expect(result).toHaveProperty('averageExecutionRate')
      expect(result).toHaveProperty('pendingAlerts')
      expect(typeof result.totalBudgets).toBe('number')
      expect(typeof result.totalAmount).toBe('number')
      expect(typeof result.averageExecutionRate).toBe('number')
      expect(typeof result.pendingAlerts).toBe('number')
    })

    it('should get cost statistics', async () => {
      const result = await budgetApiService.getCostStatistics({
        budgetId: 'test-budget-id'
      })

      expect(result).toHaveProperty('totalCost')
      expect(result).toHaveProperty('costByType')
      expect(result).toHaveProperty('costByDepartment')
      expect(Array.isArray(result.costByType)).toBe(true)
      expect(Array.isArray(result.costByDepartment)).toBe(true)
    })

    it('should get trend data', async () => {
      const result = await budgetApiService.getTrendData({
        type: 'budget',
        timeRange: 6
      })

      expect(result).toHaveProperty('data')
      expect(Array.isArray(result.data)).toBe(true)
      expect(result.data.length).toBeGreaterThan(0)
      expect(result.data[0]).toHaveProperty('month')
      expect(result.data[0]).toHaveProperty('value')
    })
  })

  describe('Error Handling', () => {
    it('should handle invalid budget id', async () => {
      await expect(budgetApiService.getBudgetById('invalid-id')).rejects.toThrow()
    })

    it('should handle invalid parameters', async () => {
      await expect(budgetApiService.createBudget({} as any)).rejects.toThrow()
    })

    it('should handle update non-existent budget', async () => {
      await expect(budgetApiService.updateBudget('non-existent-id', {})).rejects.toThrow()
    })

    it('should handle delete non-existent budget', async () => {
      await expect(budgetApiService.deleteBudget('non-existent-id')).rejects.toThrow()
    })
  })
})