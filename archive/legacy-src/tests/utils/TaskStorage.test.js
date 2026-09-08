/**
 * TaskStorage 测试用例
 * 测试任务存储管理工具类的各项功能
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { TaskStorage } from '../../utils/taskStorage.js'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}

// 设置全局 localStorage mock
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

describe('TaskStorage 工具类测试', () => {
  beforeEach(() => {
    // 清除所有 mock 调用记录
    vi.clearAllMocks()
    
    // 重置 localStorage mock 的默认行为
    localStorageMock.getItem.mockReturnValue(null)
    localStorageMock.setItem.mockImplementation(() => {})
    localStorageMock.removeItem.mockImplementation(() => {})
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('基础功能测试', () => {
    it('应该能够获取所有任务（空列表）', () => {
      localStorageMock.getItem.mockReturnValue(null)
      
      const tasks = TaskStorage.getAllTasks()
      
      expect(tasks).toEqual([])
      expect(localStorageMock.getItem).toHaveBeenCalledWith('marketing_tasks')
    })

    it('应该能够获取所有任务（有数据）', () => {
      const mockTasks = [
        { id: '1', name: '测试任务1', status: 'draft' },
        { id: '2', name: '测试任务2', status: 'completed' }
      ]
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockTasks))
      
      const tasks = TaskStorage.getAllTasks()
      
      expect(tasks).toEqual(mockTasks)
      expect(localStorageMock.getItem).toHaveBeenCalledWith('marketing_tasks')
    })

    it('应该能够根据ID获取单个任务', () => {
      const mockTasks = [
        { id: '1', name: '测试任务1', status: 'draft' },
        { id: '2', name: '测试任务2', status: 'completed' }
      ]
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockTasks))
      
      const task = TaskStorage.getTaskById('1')
      
      expect(task).toEqual(mockTasks[0])
    })

    it('应该在任务不存在时返回null', () => {
      localStorageMock.getItem.mockReturnValue('[]')
      
      const task = TaskStorage.getTaskById('nonexistent')
      
      expect(task).toBeNull()
    })
  })

  describe('createTask 方法测试', () => {
    it('应该能够创建新任务', () => {
      // Mock Date.now() 以获得可预测的ID
      const mockTimestamp = 1640995200000 // 2022-01-01 00:00:00
      vi.spyOn(Date, 'now').mockReturnValue(mockTimestamp)
      
      localStorageMock.getItem.mockReturnValue('[]')
      
      const taskData = {
        name: '新任务',
        description: '任务描述',
        type: 'marketing'
      }
      
      const createdTask = TaskStorage.createTask(taskData)
      
      expect(createdTask).toMatchObject({
        ...taskData,
        id: mockTimestamp.toString(),
        status: 'draft'
      })
      expect(createdTask.createdAt).toBeDefined()
      expect(createdTask.updatedAt).toBeDefined()
      
      // 验证保存调用
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'marketing_tasks',
        expect.stringContaining('"name":"新任务"')
      )
      
      Date.now.mockRestore()
    })

    it('应该为新任务设置默认状态', () => {
      const mockTimestamp = 1640995200000
      vi.spyOn(Date, 'now').mockReturnValue(mockTimestamp)
      
      localStorageMock.getItem.mockReturnValue('[]')
      
      const taskData = { name: '测试任务' }
      const createdTask = TaskStorage.createTask(taskData)
      
      expect(createdTask.status).toBe('draft')
      
      Date.now.mockRestore()
    })

    it('应该保留自定义状态', () => {
      const mockTimestamp = 1640995200000
      vi.spyOn(Date, 'now').mockReturnValue(mockTimestamp)
      
      localStorageMock.getItem.mockReturnValue('[]')
      
      const taskData = { name: '测试任务', status: 'pending' }
      const createdTask = TaskStorage.createTask(taskData)
      
      expect(createdTask.status).toBe('pending')
      
      Date.now.mockRestore()
    })

    it('应该在保存失败时抛出错误', () => {
      localStorageMock.getItem.mockReturnValue('[]')
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('存储空间不足')
      })
      
      const taskData = { name: '测试任务' }
      
      expect(() => TaskStorage.createTask(taskData)).toThrow('保存任务失败')
    })
  })

  describe('updateTask 方法测试', () => {
    it('应该能够更新现有任务', () => {
      const existingTasks = [
        { id: '1', name: '原始任务', status: 'draft', createdAt: '2022-01-01T00:00:00.000Z' }
      ]
      localStorageMock.getItem.mockReturnValue(JSON.stringify(existingTasks))
      
      const updateData = {
        name: '更新后的任务',
        description: '新描述',
        status: 'completed'
      }
      
      const updatedTask = TaskStorage.updateTask('1', updateData)
      
      expect(updatedTask).toMatchObject({
        ...updateData,
        id: '1'
      })
      expect(updatedTask.updatedAt).toBeDefined()
      
      // 验证保存调用
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'marketing_tasks',
        expect.stringContaining('"name":"更新后的任务"')
      )
    })

    it('应该在更新不存在的任务时创建新任务', () => {
      localStorageMock.getItem.mockReturnValue('[]')
      
      const updateData = {
        name: '新任务',
        status: 'pending'
      }
      
      const updatedTask = TaskStorage.updateTask('999', updateData)
      
      expect(updatedTask).toMatchObject({
        ...updateData,
        id: '999'
      })
      expect(updatedTask.updatedAt).toBeDefined()
    })

    it('应该在保存失败时抛出错误', () => {
      localStorageMock.getItem.mockReturnValue('[]')
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('存储失败')
      })
      
      const updateData = { name: '测试任务' }
      
      expect(() => TaskStorage.updateTask('1', updateData)).toThrow('保存任务失败')
    })
  })

  describe('saveTask 方法测试', () => {
    it('应该能够保存新任务', () => {
      localStorageMock.getItem.mockReturnValue('[]')
      
      const taskData = {
        id: '1',
        name: '测试任务',
        status: 'draft'
      }
      
      const result = TaskStorage.saveTask(taskData)
      
      expect(result).toBe(true)
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'marketing_tasks',
        expect.stringContaining('"id":"1"')
      )
    })

    it('应该能够更新现有任务', () => {
      const existingTasks = [
        { id: '1', name: '原始任务', status: 'draft' }
      ]
      localStorageMock.getItem.mockReturnValue(JSON.stringify(existingTasks))
      
      const updatedTask = {
        id: '1',
        name: '更新后的任务',
        status: 'completed'
      }
      
      const result = TaskStorage.saveTask(updatedTask)
      
      expect(result).toBe(true)
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'marketing_tasks',
        expect.stringContaining('"name":"更新后的任务"')
      )
    })

    it('应该为没有ID的任务自动生成ID', () => {
      const mockTimestamp = 1640995200000
      vi.spyOn(Date, 'now').mockReturnValue(mockTimestamp)
      
      localStorageMock.getItem.mockReturnValue('[]')
      
      const taskData = {
        name: '无ID任务',
        status: 'draft'
      }
      
      const result = TaskStorage.saveTask(taskData)
      
      expect(result).toBe(true)
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'marketing_tasks',
        expect.stringContaining(`"id":"${mockTimestamp}"`)
      )
      
      Date.now.mockRestore()
    })
  })

  describe('deleteTask 方法测试', () => {
    it('应该能够删除现有任务', () => {
      const existingTasks = [
        { id: '1', name: '任务1' },
        { id: '2', name: '任务2' }
      ]
      localStorageMock.getItem.mockReturnValue(JSON.stringify(existingTasks))
      
      const result = TaskStorage.deleteTask('1')
      
      expect(result).toBe(true)
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'marketing_tasks',
        JSON.stringify([{ id: '2', name: '任务2' }])
      )
    })

    it('应该在删除不存在的任务时返回false', () => {
      localStorageMock.getItem.mockReturnValue('[]')
      
      const result = TaskStorage.deleteTask('nonexistent')
      
      expect(result).toBe(false)
    })
  })

  describe('存储统计功能测试', () => {
    it('应该能够获取存储统计信息', () => {
      const mockTasks = [
        { id: '1', status: 'completed' },
        { id: '2', status: 'pending' },
        { id: '3', status: 'running' }
      ]
      
      // 清除之前的 mock 调用
      localStorageMock.getItem.mockClear()
      localStorageMock.setItem.mockClear()
      
      // 模拟 getStorageStats 的调用顺序
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'marketing_tasks_stats') {
          return null // 没有统计信息，会生成默认统计
        }
        if (key === 'marketing_tasks') {
          return JSON.stringify(mockTasks)
        }
        return null
      })

      const stats = TaskStorage.getStorageStats()
      
      expect(stats).toHaveProperty('totalTasks')
      expect(stats).toHaveProperty('completedTasks')
      expect(stats).toHaveProperty('pendingTasks')
      expect(stats).toHaveProperty('runningTasks')
      expect(stats.lastUpdated).toBeDefined()
      expect(stats.storageSize).toBeDefined()
    })

    it('应该能够更新统计信息', () => {
      const mockTasks = [
        { id: '1', status: 'completed' },
        { id: '2', status: 'pending' }
      ]
      
      // 清除之前的 mock 调用
      localStorageMock.getItem.mockClear()
      localStorageMock.setItem.mockClear()
      
      // 为所有可能的 localStorage.getItem 调用提供返回值
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'marketing_tasks') {
          return JSON.stringify(mockTasks)
        }
        return null
      })
      
      TaskStorage.updateStats()
      
      // 验证统计信息被正确保存
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'marketing_tasks_stats',
        expect.any(String)
      )
      
      // 验证保存的统计信息包含正确的任务数量
      const savedStatsCall = localStorageMock.setItem.mock.calls.find(call => call[0] === 'marketing_tasks_stats')
      if (savedStatsCall) {
        const savedStats = JSON.parse(savedStatsCall[1])
        expect(savedStats.totalTasks).toBeGreaterThanOrEqual(0)
        expect(savedStats).toHaveProperty('completedTasks')
        expect(savedStats).toHaveProperty('pendingTasks')
        expect(savedStats).toHaveProperty('storageSize')
        expect(savedStats).toHaveProperty('lastUpdated')
      }
    })
  })

  describe('工具方法测试', () => {
    it('应该能够清空所有任务', () => {
      const result = TaskStorage.clearAllTasks()
      
      expect(result).toBe(true)
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('marketing_tasks')
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('marketing_tasks_stats')
    })

    it('应该能够根据条件查找任务', () => {
      const mockTasks = [
        { id: '1', status: 'completed', name: '已完成任务' },
        { id: '2', status: 'pending', name: '待处理任务' },
        { id: '3', status: 'completed', name: '另一个已完成任务' }
      ]
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockTasks))
      
      const completedTasks = TaskStorage.findTasks(task => task.status === 'completed')
      
      // 验证找到的任务数量
      expect(completedTasks.length).toBeGreaterThanOrEqual(1)
      // 验证所有返回的任务都符合条件
      expect(completedTasks.every(task => task.status === 'completed')).toBe(true)
      // 验证包含预期的任务
      expect(completedTasks.some(task => task.id === '1')).toBe(true)
    })

    it('应该能够导出任务数据', () => {
      const mockTasks = [
        { id: '1', name: '任务1' },
        { id: '2', name: '任务2' }
      ]
      localStorageMock.getItem
        .mockReturnValueOnce(JSON.stringify(mockTasks)) // getAllTasks 调用
        .mockReturnValueOnce(null) // getStorageStats 调用

      const exportData = TaskStorage.exportTasks()
      
      expect(exportData).toContain('"tasks"')
      expect(exportData).toContain('"stats"')
      expect(exportData).toContain('"exportedAt"')
    })

    it('应该能够导入任务数据', () => {
      const importData = {
        tasks: [
          { id: '1', name: '导入任务1' },
          { id: '2', name: '导入任务2' }
        ]
      }
      
      const result = TaskStorage.importTasks(JSON.stringify(importData))
      
      expect(result).toBe(true)
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'marketing_tasks',
        JSON.stringify(importData.tasks)
      )
    })
  })

  describe('错误处理测试', () => {
    it('应该在localStorage异常时优雅处理getAllTasks', () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('localStorage 不可用')
      })
      
      const tasks = TaskStorage.getAllTasks()
      
      expect(tasks).toEqual([])
    })

    it('应该在localStorage异常时优雅处理saveTask', () => {
      localStorageMock.getItem.mockReturnValue('[]')
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('存储空间不足')
      })
      
      const result = TaskStorage.saveTask({ id: '1', name: '测试' })
      
      expect(result).toBe(false)
    })

    it('应该在JSON解析失败时优雅处理', () => {
      localStorageMock.getItem.mockReturnValue('invalid json')
      
      const tasks = TaskStorage.getAllTasks()
      
      expect(tasks).toEqual([])
    })
  })
})