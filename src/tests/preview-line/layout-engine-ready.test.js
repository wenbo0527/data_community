/**
 * 预览线布局引擎就绪状态测试
 * 测试布局引擎未就绪时预览线创建的处理逻辑
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { PreviewLineSystem } from '../../utils/preview-line/PreviewLineSystem.js'
import { PreviewLineValidator } from '../../utils/preview-line/core/PreviewLineValidator.js'

describe('预览线布局引擎就绪状态测试', () => {
  let previewLineSystem
  let mockGraph
  let mockLayoutEngine
  let mockNode

  beforeEach(() => {
    // 创建模拟图实例
    mockGraph = {
      hasCell: vi.fn(() => true),
      getCells: vi.fn(() => []),
      getOutgoingEdges: vi.fn(() => []),
      getIncomingEdges: vi.fn(() => []),
      addEdge: vi.fn(),
      getEdges: vi.fn(() => []),
      getCellById: vi.fn(() => null),
      getNodes: vi.fn(() => [])
    }

    // 创建模拟布局引擎
    mockLayoutEngine = {
      isReady: true,
      isLayoutEngineReady: vi.fn(() => true),
      executeLayout: vi.fn(() => Promise.resolve({ success: true })),
      setGraph: vi.fn(),
      updateGraph: vi.fn(),
      updatePreviewManager: vi.fn()
    }

    // 创建模拟节点
    mockNode = {
      id: 'test-node-1',
      getData: vi.fn(() => ({
        type: 'email',
        isConfigured: true,
        config: { subject: '测试邮件' }
      }))
    }

    // 初始化预览线系统
    previewLineSystem = new PreviewLineSystem({
      graph: mockGraph,
      enabledModules: {
        manager: true,
        validator: true,
        renderer: false,
        calculator: false,
        detector: false,
        analyzer: false,
        optimizer: false,
        cache: false
      }
    })
  })

  afterEach(() => {
    if (previewLineSystem) {
      previewLineSystem.destroy()
    }
  })

  describe('布局引擎就绪状态检查', () => {
    it('应该正确检查布局引擎是否就绪', async () => {
      await previewLineSystem.init()
      
      // 初始状态：布局引擎未设置
      expect(previewLineSystem.isLayoutEngineReady()).toBe(false)
      
      // 设置布局引擎后应该就绪
      previewLineSystem.setLayoutEngine(mockLayoutEngine)
      expect(previewLineSystem.isLayoutEngineReady()).toBe(true)
    })

    it('应该在布局引擎未就绪时跳过预览线创建', async () => {
      await previewLineSystem.init()
      
      // 确保布局引擎未就绪
      expect(previewLineSystem.isLayoutEngineReady()).toBe(false)
      
      // 尝试创建预览线
      const result = previewLineSystem.createUnifiedPreviewLine(mockNode)
      
      // 验证结果
      expect(result).toEqual({
        success: false,
        action: 'skipped',
        reason: '布局引擎未就绪',
        nodeId: 'test-node-1'
      })
    })

    it('应该在布局引擎就绪后成功创建预览线', async () => {
      await previewLineSystem.init()
      
      // 设置布局引擎
      previewLineSystem.setLayoutEngine(mockLayoutEngine)
      expect(previewLineSystem.isLayoutEngineReady()).toBe(true)
      
      // 尝试创建预览线
      const result = previewLineSystem.createUnifiedPreviewLine(mockNode)
      
      // 验证结果不是因为布局引擎未就绪而失败
      expect(result.reason).not.toBe('布局引擎未就绪')
    })
  })

  describe('PreviewLineValidator 布局引擎检查', () => {
    it('应该正确检查验证器中的布局引擎状态', () => {
      // 创建模拟配置管理器
      const mockConfigManager = {
        get: vi.fn((key, defaultValue) => defaultValue)
      }
      
      // 创建没有布局引擎的验证器
      const validator = new PreviewLineValidator(mockConfigManager)
      expect(validator.isLayoutEngineReady()).toBe(false)
      
      // 设置布局引擎
      validator.setLayoutEngine(mockLayoutEngine)
      expect(validator.isLayoutEngineReady()).toBe(true)
      
      // 清除布局引擎
      validator.setLayoutEngine(null)
      expect(validator.isLayoutEngineReady()).toBe(false)
    })

    it('应该在布局引擎未就绪时返回正确的需求分析结果', () => {
      // 创建模拟配置管理器
      const mockConfigManager = {
        get: vi.fn((key, defaultValue) => defaultValue)
      }
      
      // 创建没有布局引擎的验证器
      const validator = new PreviewLineValidator(mockConfigManager)
      
      // 验证布局引擎未就绪
      expect(validator.isLayoutEngineReady()).toBe(false)
      
      // 检查预览线需求
      const result = validator.checkPreviewLineRequirement(mockNode)
      expect(result.needsCreation).toBe(false)
      expect(result.reason).toBe('布局引擎未就绪')
      expect(result.type).toBe('no_creation')
    })
  })

  describe('布局引擎设置时的验证器同步', () => {
    it('应该在设置布局引擎时同步更新验证器', async () => {
      await previewLineSystem.init()
      
      // 验证初始状态
      if (previewLineSystem.previewLineManager && previewLineSystem.previewLineManager.validator) {
        expect(previewLineSystem.previewLineManager.validator.layoutEngine).toBeNull()
      }
      
      // 设置布局引擎
      const success = previewLineSystem.setLayoutEngine(mockLayoutEngine)
      
      // 验证设置成功
      expect(success).toBe(true)
      expect(previewLineSystem.layoutEngine).toBe(mockLayoutEngine)
      if (previewLineSystem.previewLineManager && previewLineSystem.previewLineManager.validator) {
        expect(previewLineSystem.previewLineManager.validator.layoutEngine).toBe(mockLayoutEngine)
      }
    })

    it('应该在临时布局引擎设置时正确工作', async () => {
      await previewLineSystem.init()
      
      // 创建临时布局引擎（类似 TaskFlowCanvasRefactored.vue 中的实现）
      const tempLayoutEngine = {
        isReady: true,
        isLayoutEngineReady: () => true,
        executeLayout: () => Promise.resolve({ success: true }),
        setGraph: () => {},
        updateGraph: () => {},
        updatePreviewManager: () => {}
      }
      
      // 设置临时布局引擎
      previewLineSystem.setLayoutEngine(tempLayoutEngine)
      
      // 验证布局引擎就绪
      expect(previewLineSystem.isLayoutEngineReady()).toBe(true)
      if (previewLineSystem.previewLineManager && previewLineSystem.previewLineManager.validator) {
        expect(previewLineSystem.previewLineManager.validator.isLayoutEngineReady()).toBe(true)
      }
      
      // 验证可以成功创建预览线（不会因为布局引擎未就绪而跳过）
      const result = previewLineSystem.createUnifiedPreviewLine(mockNode)
      expect(result.reason).not.toBe('布局引擎未就绪')
    })

    it('应该测试用户报告的具体场景：PreviewLineValidator显示布局引擎未就绪', async () => {
      await previewLineSystem.init()
      
      // 模拟用户报告的场景：PreviewLineValidator 显示"布局引擎未就绪"
      console.log('🧪 [测试] 模拟用户报告的预览线创建失败场景')
      
      // 1. 初始状态：布局引擎未设置
      expect(previewLineSystem.isLayoutEngineReady()).toBe(false)
      
      // 2. 尝试创建预览线，应该失败并显示"布局引擎未就绪"
      const failResult = previewLineSystem.createUnifiedPreviewLine(mockNode)
      expect(failResult).toEqual({
        success: false,
        action: 'skipped',
        reason: '布局引擎未就绪',
        nodeId: 'test-node-1'
      })
      
      // 3. 设置临时布局引擎（修复后的实现）
      const tempLayoutEngine = {
        isReady: true,
        isLayoutEngineReady: () => true,
        executeLayout: () => Promise.resolve({ success: true }),
        setGraph: () => {},
        updateGraph: () => {},
        updatePreviewManager: () => {}
      }
      
      previewLineSystem.setLayoutEngine(tempLayoutEngine)
      
      // 4. 验证修复后的状态
      expect(previewLineSystem.isLayoutEngineReady()).toBe(true)
      if (previewLineSystem.previewLineManager && previewLineSystem.previewLineManager.validator) {
        expect(previewLineSystem.previewLineManager.validator.isLayoutEngineReady()).toBe(true)
      }
      
      // 5. 再次尝试创建预览线，应该不再因为布局引擎未就绪而失败
      const successResult = previewLineSystem.createUnifiedPreviewLine(mockNode)
      expect(successResult.reason).not.toBe('布局引擎未就绪')
      
      console.log('✅ [测试] 用户报告场景修复验证完成')
    })
  })

  describe('错误处理', () => {
    it('应该处理布局引擎设置失败的情况', async () => {
      await previewLineSystem.init()
      
      // 测试设置 null 布局引擎
      const result1 = previewLineSystem.setLayoutEngine(null)
      expect(result1).toBe(false)
      
      // 测试设置 undefined 布局引擎
      const result2 = previewLineSystem.setLayoutEngine(undefined)
      expect(result2).toBe(false)
      
      // 验证布局引擎仍未就绪
      expect(previewLineSystem.isLayoutEngineReady()).toBe(false)
    })

    it('应该在布局引擎设置过程中发生异常时正确处理', async () => {
      await previewLineSystem.init()
      
      // 确保 previewLineManager 和 validator 存在
      if (previewLineSystem.previewLineManager && previewLineSystem.previewLineManager.validator) {
        // 模拟验证器设置布局引擎时抛出异常
        const originalSetLayoutEngine = previewLineSystem.previewLineManager.validator.setLayoutEngine
        previewLineSystem.previewLineManager.validator.setLayoutEngine = vi.fn(() => {
          throw new Error('验证器设置失败')
        })
        
        // 尝试设置布局引擎
        const result = previewLineSystem.setLayoutEngine(mockLayoutEngine)
        
        // 验证错误处理
        expect(result).toBe(false)
        
        // 恢复原方法
        previewLineSystem.previewLineManager.validator.setLayoutEngine = originalSetLayoutEngine
      } else {
        // 如果 validator 不存在，直接测试基本的设置功能
        const result = previewLineSystem.setLayoutEngine(mockLayoutEngine)
        expect(result).toBe(true)
      }
    })
  })
})