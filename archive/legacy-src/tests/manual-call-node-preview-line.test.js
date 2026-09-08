/**
 * Manual-Call节点预览线生成测试
 * 验证manual-call节点的预览线创建和错误处理逻辑
 * 已迁移到新的PreviewLineSystem架构
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { PreviewLineSystem } from '../utils/preview-line/PreviewLineSystem.js'
import { createManualCallNodeTestEnvironment } from './utils/MockGraphFactory.js'

describe('Manual-Call节点预览线生成测试', () => {
  let previewSystem
  let testEnv

  beforeEach(() => {
    // 使用手动外呼节点专用的测试环境
    testEnv = createManualCallNodeTestEnvironment()

    // 创建预览线系统实例
    previewSystem = new PreviewLineSystem({
      graph: testEnv.mockGraph,
      layoutEngine: testEnv.mockLayoutEngine,
      layoutEngineReady: true
    })
    
    // 确保图实例被正确设置
    previewSystem.graph = testEnv.mockGraph
    
    // 确保初始化成功
    try {
      previewSystem.init()
    } catch (error) {
      console.warn('PreviewLineSystem初始化警告:', error.message)
    }

    // 设置预览线管理器
    previewSystem.previewManager = testEnv.mockPreviewManager

    // 模拟必要的方法
    previewSystem.isBranchNode = vi.fn(() => false)
    previewSystem.shouldCreatePreviewLine = vi.fn(() => true)
    previewSystem.calculateSinglePreviewPosition = vi.fn(() => ({ x: 200, y: 200 }))
    previewSystem.createBasicPreviewLine = vi.fn(() => ({
      id: 'preview-line-1',
      type: 'preview-line',
      attr: vi.fn(),
      on: vi.fn(),
      off: vi.fn(),
      remove: vi.fn(),
      getLabels: vi.fn(() => [])
    }))
    previewSystem.setPreviewLineState = vi.fn()
    previewSystem.previewLines = new Map()
  })

  describe('Manual-Call节点预览线创建测试', () => {
    it('已配置的manual-call节点应正确生成预览线', async () => {
      // 创建已配置的manual-call节点
      const configuredManualCallNode = testEnv.addNode({
        id: 'manual-call-configured',
        type: 'manual-call',
        data: {
          type: 'manual-call',
          config: {
            callScript: '测试脚本',
            targetAudience: '目标客群'
          },
          isConfigured: true
        }
      })

      // 设置布局引擎就绪
      previewSystem.isLayoutEngineReady = vi.fn(() => true)
      
      // 设置系统已初始化
      previewSystem.isInitialized = vi.fn(() => true)
      previewSystem.initialized = true
      
      // 模拟预览线管理器返回成功结果
      if (previewSystem.previewLineManager) {
        previewSystem.previewLineManager.createUnifiedPreviewLine = vi.fn(() => ({
          success: true,
          line: { id: 'preview-line-1' },
          action: 'created'
        }))
      }

      console.log('🧪 [测试] 开始测试已配置manual-call节点预览线创建')

      // 创建预览线
      const result = await previewSystem.createUnifiedPreviewLine(configuredManualCallNode)

      console.log('🧪 [测试] manual-call节点预览线创建结果:', result)

      // 验证预览线创建成功
      expect(result).toBeTruthy()
      expect(result.line).toBeTruthy()
      expect(result.line.id).toBe('preview-line-1')
    })

    it('未配置的manual-call节点不应生成预览线', async () => {
      // 创建未配置的manual-call节点
      const unconfiguredManualCallNode = testEnv.addNode({
        id: 'manual-call-unconfigured',
        type: 'manual-call',
        data: {
          type: 'manual-call',
          isConfigured: false
        }
      })

      // 设置shouldCreatePreviewLine返回false
      previewSystem.shouldCreatePreviewLine = vi.fn(() => false)

      console.log('🧪 [测试] 开始测试未配置manual-call节点预览线创建')

      // 尝试创建预览线
      const result = await previewSystem.createUnifiedPreviewLine(unconfiguredManualCallNode)

      console.log('🧪 [测试] 未配置manual-call节点预览线创建结果:', result)

      // 验证不应该创建预览线
      expect(result).toBeNull()
      expect(previewSystem.createBasicPreviewLine).not.toHaveBeenCalled()
    })

    test('manual-call节点计算终点位置失败时的错误处理', async () => {
      // 创建manual-call节点
      const manualCallNode = {
        id: 'manual-call-calc-fail',
        type: 'manual-call',
        getPosition: vi.fn(() => ({ x: 100, y: 100 })),
        getSize: vi.fn(() => ({ width: 120, height: 40 })),
        getData: vi.fn(() => ({
          type: 'manual-call',
          config: { callScript: '测试脚本' },
          isConfigured: true
        }))
      }

      // 设置布局引擎就绪
      previewSystem.isLayoutEngineReady = vi.fn(() => true)
      
      // 设置系统已初始化
      previewSystem.isInitialized = vi.fn(() => true)
      previewSystem.initialized = true
      
      // 模拟预览线管理器返回计算失败的结果
      if (previewSystem.previewLineManager) {
        previewSystem.previewLineManager.createUnifiedPreviewLine = vi.fn(() => null)
      }

      console.log('🧪 [测试] 开始测试manual-call节点终点位置计算失败处理')

      // 尝试创建预览线
      const result = await previewSystem.createUnifiedPreviewLine(manualCallNode)

      console.log('🧪 [测试] 终点位置计算失败时的预览线创建结果:', result)

      // 验证应该返回null（因为计算失败）
      expect(result).toBeNull()
    })

    test('manual-call节点预览线创建失败时的错误处理', async () => {
      // 创建manual-call节点
      const manualCallNode = {
        id: 'manual-call-create-failed-2',
        type: 'manual-call',
        getPosition: vi.fn(() => ({ x: 100, y: 100 })),
        getSize: vi.fn(() => ({ width: 120, height: 40 })),
        getData: vi.fn(() => ({
          type: 'manual-call',
          config: { callScript: '测试脚本' },
          isConfigured: true
        }))
      }

      // 设置布局引擎就绪
      previewSystem.isLayoutEngineReady = vi.fn(() => true)
      
      // 设置系统已初始化
      previewSystem.isInitialized = vi.fn(() => true)
      previewSystem.initialized = true
      
      // 模拟预览线管理器创建失败
      if (previewSystem.previewLineManager) {
        previewSystem.previewLineManager.createUnifiedPreviewLine = vi.fn(() => null)
      }

      console.log('🧪 [测试] 开始测试manual-call节点预览线创建失败处理')

      // 尝试创建预览线
      const result = await previewSystem.createUnifiedPreviewLine(manualCallNode)

      console.log('🧪 [测试] 预览线创建失败时的结果:', result)

      // 验证应该返回null（因为创建失败）
      expect(result).toBeNull()
    })

    test('manual-call节点布局引擎未就绪时的处理', async () => {
      // 创建manual-call节点
      const manualCallNode = {
        id: 'manual-call-layout-not-ready',
        type: 'manual-call',
        getPosition: vi.fn(() => ({ x: 100, y: 100 })),
        getSize: vi.fn(() => ({ width: 120, height: 40 })),
        getData: vi.fn(() => ({
          type: 'manual-call',
          config: { callScript: '测试脚本' },
          isConfigured: true
        }))
      }

      // 设置布局引擎未就绪
      previewSystem.layoutEngineReady = false
      previewSystem.isLayoutEngineReady = vi.fn(() => false)
      previewSystem.addToPendingCalculations = vi.fn(() => true)

      console.log('🧪 [测试] 开始测试manual-call节点布局引擎未就绪处理')

      // 尝试创建预览线
      const result = await previewSystem.createUnifiedPreviewLine(manualCallNode)

      console.log('🧪 [测试] 布局引擎未就绪时的预览线创建结果:', result)

      // 验证应该返回null（因为布局引擎未就绪）
      expect(result).toBeNull()
      // 验证addToPendingCalculations被调用
      expect(previewSystem.addToPendingCalculations).toHaveBeenCalledWith(manualCallNode)
    })
  })

  describe('Manual-Call节点错误处理测试', () => {
    it('应该处理无效的节点对象', async () => {
      console.log('🧪 [测试] 开始测试无效节点对象处理')

      // 测试null节点
      const nullResult = await previewSystem.createUnifiedPreviewLine(null)
      expect(nullResult).toEqual({ 
        success: false, 
        error: "Cannot read properties of null (reading 'id')",
        nodeId: "unknown"
      })

      // 测试undefined节点
      const undefinedResult = await previewSystem.createUnifiedPreviewLine(undefined)
      expect(undefinedResult).toEqual({ 
        success: false, 
        error: "Cannot read properties of undefined (reading 'id')",
        nodeId: "unknown"
      })

      // 测试缺少id的节点
      const noIdNode = {
        type: 'manual-call',
        getData: vi.fn(() => ({ type: 'manual-call' }))
      }
      const noIdResult = await previewSystem.createUnifiedPreviewLine(noIdNode)
      expect(noIdResult).toEqual({
        success: true,
        action: "skipped",
        existingLines: [],
        nodeId: "unknown",
        reason: "节点缺少id属性"
      })

      console.log('🧪 [测试] 无效节点对象处理测试完成')
    })

    it('应该处理节点不在图中的情况', async () => {
      // 创建manual-call节点
      const manualCallNode = {
        id: 'manual-call-not-in-graph',
        type: 'manual-call',
        getData: vi.fn(() => ({
          type: 'manual-call',
          config: { callScript: '测试脚本' },
          isConfigured: true
        }))
      }

      // 设置布局引擎就绪
      previewSystem.isLayoutEngineReady = vi.fn(() => true)
      
      // 设置hasCell返回false（节点不在图中）
      testEnv.mockGraph.hasCell.mockReturnValue(false)
      testEnv.mockGraph.hasCell.mockClear()

      console.log('🧪 [测试] 开始测试节点不在图中的情况')
      console.log('🧪 [测试] PreviewLineSystem的graph实例是否与testEnv.mockGraph相同:', previewSystem.graph === testEnv.mockGraph)
      console.log('🧪 [测试] hasCell调用次数:', testEnv.mockGraph.hasCell.mock.calls.length)
      console.log('🧪 [测试] hasCell调用参数:', testEnv.mockGraph.hasCell.mock.calls)

      // 尝试创建预览线
      const result = await previewSystem.createUnifiedPreviewLine(manualCallNode)

      console.log('🧪 [测试] 节点不在图中时的预览线创建结果:', result)

      // 验证应该返回null（因为节点不在图中）
      expect(result).toBeNull()
      
      // 验证hasCell被调用
      expect(testEnv.mockGraph.hasCell).toHaveBeenCalledWith('manual-call-not-in-graph')
    })
  })
})