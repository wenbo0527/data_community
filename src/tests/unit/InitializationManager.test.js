/**
 * P02任务测试用例：初始化重复调用导致状态不一致问题修复
 * 测试单例模式和初始化锁机制
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { InitializationManager } from '../../utils/InitializationManager.js'

describe('InitializationManager - P02任务修复测试', () => {
  let manager
  let mockGraph
  let mockPreviewManager
  
  beforeEach(() => {
    // 重置单例实例
    InitializationManager.resetInstance()
    
    // 创建模拟对象
    mockGraph = {
      id: 'test-graph',
      getNodes: vi.fn(() => []),
      getEdges: vi.fn(() => [])
    }
    
    mockPreviewManager = {
      id: 'test-preview-manager',
      init: vi.fn(),
      setLayoutEngine: vi.fn()
    }
  })
  
  afterEach(() => {
    InitializationManager.resetInstance()
  })

  describe('单例模式测试', () => {
    it('应该返回相同的实例', () => {
      const instance1 = InitializationManager.getInstance()
      const instance2 = InitializationManager.getInstance()
      
      expect(instance1).toBe(instance2)
      expect(instance1).toBeInstanceOf(InitializationManager)
    })
    
    it('应该在多次调用时保持状态一致', () => {
      const instance1 = InitializationManager.getInstance()
      instance1.setInitializationState('test-key', 'initialized')
      
      const instance2 = InitializationManager.getInstance()
      expect(instance2.getInitializationState('test-key')).toBe('initialized')
    })
  })

  describe('初始化锁机制测试', () => {
    it('应该防止重复初始化', async () => {
      const manager = InitializationManager.getInstance()
      const initSpy = vi.fn().mockResolvedValue({ success: true })
      
      // 同时发起多个初始化请求
      const promises = [
        manager.safeInitialize('layout-engine', initSpy),
        manager.safeInitialize('layout-engine', initSpy),
        manager.safeInitialize('layout-engine', initSpy)
      ]
      
      const results = await Promise.all(promises)
      
      // 只应该执行一次初始化
      expect(initSpy).toHaveBeenCalledTimes(1)
      
      // 所有请求都应该返回成功结果
      results.forEach(result => {
        expect(result.success).toBe(true)
        expect(result.fromCache).toBeDefined()
      })
    })
    
    it('应该正确处理初始化失败的情况', async () => {
      const manager = InitializationManager.getInstance()
      const failingInit = vi.fn().mockRejectedValue(new Error('初始化失败'))
      
      const result = await manager.safeInitialize('failing-component', failingInit)
      
      expect(result.success).toBe(false)
      expect(result.error).toBe('初始化失败')
      expect(manager.getInitializationState('failing-component')).toBe('failed')
    })
    
    it('应该允许重新初始化失败的组件', async () => {
      const manager = InitializationManager.getInstance()
      const failingInit = vi.fn().mockRejectedValue(new Error('初始化失败'))
      const successInit = vi.fn().mockResolvedValue({ success: true })
      
      // 第一次初始化失败
      await manager.safeInitialize('retry-component', failingInit)
      expect(manager.getInitializationState('retry-component')).toBe('failed')
      
      // 第二次初始化成功
      const result = await manager.safeInitialize('retry-component', successInit)
      expect(result.success).toBe(true)
      expect(manager.getInitializationState('retry-component')).toBe('initialized')
    })
  })

  describe('布局引擎初始化测试', () => {
    it('应该正确初始化布局引擎', async () => {
      const manager = InitializationManager.getInstance()
      
      const result = await manager.initializeLayoutEngine(mockGraph, {
        layoutEngine: 'unified',
        nodeSpacing: 200,
        levelHeight: 150
      })
      
      expect(result.success).toBe(true)
      expect(result.engineType).toBe('unified')
      expect(manager.getInitializationState('layout-engine')).toBe('initialized')
    })
    
    it('应该防止布局引擎重复初始化', async () => {
      const manager = InitializationManager.getInstance()
      
      // 第一次初始化
      const result1 = await manager.initializeLayoutEngine(mockGraph, {
        layoutEngine: 'unified'
      })
      
      // 第二次初始化应该返回缓存结果
      const result2 = await manager.initializeLayoutEngine(mockGraph, {
        layoutEngine: 'unified'
      })
      
      expect(result1.success).toBe(true)
      expect(result2.success).toBe(true)
      expect(result2.fromCache).toBe(true)
    })
  })

  describe('预览线管理器初始化测试', () => {
    it('应该正确初始化预览线管理器', async () => {
      const manager = InitializationManager.getInstance()
      
      const result = await manager.initializePreviewManager(mockGraph, {
        enableDebug: true
      })
      
      expect(result.success).toBe(true)
      expect(manager.getInitializationState('preview-manager')).toBe('initialized')
    })
    
    it('应该正确处理预览线管理器依赖', async () => {
      const manager = InitializationManager.getInstance()
      
      // 先初始化布局引擎
      await manager.initializeLayoutEngine(mockGraph, { layoutEngine: 'unified' })
      
      // 再初始化预览线管理器
      const result = await manager.initializePreviewManager(mockGraph, {})
      
      expect(result.success).toBe(true)
      expect(result.hasLayoutEngine).toBe(true)
    })
  })

  describe('状态管理测试', () => {
    it('应该正确跟踪初始化状态', () => {
      const manager = InitializationManager.getInstance()
      
      expect(manager.getInitializationState('test-component')).toBe('not-initialized')
      
      manager.setInitializationState('test-component', 'initializing')
      expect(manager.getInitializationState('test-component')).toBe('initializing')
      
      manager.setInitializationState('test-component', 'initialized')
      expect(manager.getInitializationState('test-component')).toBe('initialized')
    })
    
    it('应该提供完整的初始化状态报告', () => {
      const manager = InitializationManager.getInstance()
      
      manager.setInitializationState('component-1', 'initialized')
      manager.setInitializationState('component-2', 'failed')
      manager.setInitializationState('component-3', 'initializing')
      
      const report = manager.getInitializationReport()
      
      expect(report.total).toBe(3)
      expect(report.initialized).toBe(1)
      expect(report.failed).toBe(1)
      expect(report.initializing).toBe(1)
      expect(report.notInitialized).toBe(0)
    })
  })

  describe('错误处理和恢复测试', () => {
    it('应该正确处理并发初始化冲突', async () => {
      const manager = InitializationManager.getInstance()
      let callCount = 0
      
      const slowInit = vi.fn().mockImplementation(async () => {
        callCount++
        await new Promise(resolve => setTimeout(resolve, 100))
        return { success: true, callOrder: callCount }
      })
      
      // 同时发起多个初始化
      const promises = Array.from({ length: 5 }, () => 
        manager.safeInitialize('slow-component', slowInit)
      )
      
      const results = await Promise.all(promises)
      
      // 只应该执行一次实际初始化
      expect(slowInit).toHaveBeenCalledTimes(1)
      
      // 所有结果都应该成功
      results.forEach(result => {
        expect(result.success).toBe(true)
      })
    })
    
    it('应该支持强制重新初始化', async () => {
      const manager = InitializationManager.getInstance()
      const initSpy = vi.fn().mockResolvedValue({ success: true })
      
      // 正常初始化
      await manager.safeInitialize('force-test', initSpy)
      expect(initSpy).toHaveBeenCalledTimes(1)
      
      // 强制重新初始化
      await manager.safeInitialize('force-test', initSpy, { force: true })
      expect(initSpy).toHaveBeenCalledTimes(2)
    })
  })
})