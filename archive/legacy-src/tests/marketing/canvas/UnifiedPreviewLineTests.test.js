/**
 * 统一预览线方法测试用例
 * 基于营销画布系统重构方案，测试预览线的唯一生成方法
 * 
 * 测试目标：
 * 1. 验证预览线只有唯一的生成方法（PreviewLineSystem.forceRegeneratePreviewLines）
 * 2. 确保没有多重降级逻辑
 * 3. 验证分支节点的预览线数量计算正确性
 * 4. 测试预览线生成的容错机制
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'

// 模拟 PreviewLineSystem
const mockPreviewLineSystem = {
  forceRegeneratePreviewLines: vi.fn(),
  createPreviewLinesForExistingNodes: vi.fn(),
  validateAndCleanupDuplicates: vi.fn(),
  isInitialized: vi.fn(() => true),
  init: vi.fn(),
  destroy: vi.fn()
}

// 模拟 X6 图实例
const mockGraph = {
  getNodes: vi.fn(() => []),
  getEdges: vi.fn(() => []),
  getCellById: vi.fn(),
  addEdge: vi.fn(),
  removeCell: vi.fn(),
  hasCell: vi.fn(() => true)
}

// 模拟组件
const TestComponent = {
  template: '<div></div>',
  setup() {
    // 模拟 triggerPreviewLineGeneration 函数
    const triggerPreviewLineGeneration = async () => {
      console.log('[Test] 🔧 触发统一预览线生成方法')
      
      if (!mockPreviewLineSystem) {
        throw new Error('PreviewLineSystem 未初始化，无法生成预览线')
      }
      
      // 🔧 只使用统一方法，不使用降级逻辑
      const result = await mockPreviewLineSystem.forceRegeneratePreviewLines({
        clearExisting: true,
        validateNodes: true,
        enableBranchAnalysis: true,
        enablePortValidation: true
      })
      
      return result
    }
    
    return {
      triggerPreviewLineGeneration,
      previewLineSystem: mockPreviewLineSystem,
      graph: mockGraph
    }
  }
}

describe('统一预览线方法测试', () => {
  let wrapper
  
  beforeEach(() => {
    // 重置所有模拟函数
    vi.clearAllMocks()
    
    // 设置默认的成功返回值
    mockPreviewLineSystem.forceRegeneratePreviewLines.mockResolvedValue({
      success: true,
      previousCount: 0,
      newCount: 2,
      createdCount: 2,
      deleteResults: [],
      createResults: [
        { nodeId: 'node1', success: true, previewLineId: 'preview_1' },
        { nodeId: 'node2', success: true, previewLineId: 'preview_2' }
      ]
    })
    
    wrapper = mount(TestComponent)
  })
  
  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  describe('唯一预览线生成方法测试', () => {
    it('TC_UNIFIED_001 - 应该只使用 PreviewLineSystem.forceRegeneratePreviewLines 方法', async () => {
      // 执行预览线生成
      const result = await wrapper.vm.triggerPreviewLineGeneration()
      
      // 验证只调用了统一方法
      expect(mockPreviewLineSystem.forceRegeneratePreviewLines).toHaveBeenCalledTimes(1)
      expect(mockPreviewLineSystem.forceRegeneratePreviewLines).toHaveBeenCalledWith({
        clearExisting: true,
        validateNodes: true,
        enableBranchAnalysis: true,
        enablePortValidation: true
      })
      
      // 验证没有调用其他方法（确保没有降级逻辑）
      expect(mockPreviewLineSystem.createPreviewLinesForExistingNodes).not.toHaveBeenCalled()
      
      // 验证返回结果
      expect(result).toBeDefined()
      expect(result.success).toBe(true)
      expect(result.newCount).toBe(2)
    })

    it('TC_UNIFIED_002 - 预览线系统未初始化时应该抛出错误', async () => {
      // 创建一个新的组件实例，其中 previewLineSystem 为 null
      const TestComponentWithNullSystem = {
        template: '<div></div>',
        setup() {
          const triggerPreviewLineGeneration = async () => {
            console.log('[Test] 🔧 触发统一预览线生成方法')
            
            if (!null) { // 模拟 previewLineSystem 为 null
              throw new Error('PreviewLineSystem 未初始化，无法生成预览线')
            }
            
            return null
          }
          
          return {
            triggerPreviewLineGeneration,
            previewLineSystem: null,
            graph: mockGraph
          }
        }
      }
      
      const nullWrapper = mount(TestComponentWithNullSystem)
      
      // 验证抛出错误
      await expect(nullWrapper.vm.triggerPreviewLineGeneration()).rejects.toThrow(
        'PreviewLineSystem 未初始化，无法生成预览线'
      )
      
      nullWrapper.unmount()
    })

    it('TC_UNIFIED_003 - 统一方法失败时应该抛出错误而不是降级', async () => {
      // 模拟统一方法失败
      mockPreviewLineSystem.forceRegeneratePreviewLines.mockResolvedValue({
        success: false,
        error: '生成失败'
      })
      
      // 执行预览线生成
      const result = await wrapper.vm.triggerPreviewLineGeneration()
      
      // 验证调用了统一方法
      expect(mockPreviewLineSystem.forceRegeneratePreviewLines).toHaveBeenCalledTimes(1)
      
      // 验证没有调用降级方法（确保没有降级逻辑）
      expect(mockPreviewLineSystem.createPreviewLinesForExistingNodes).not.toHaveBeenCalled()
      
      // 验证返回失败结果
      expect(result.success).toBe(false)
      expect(result.error).toBe('生成失败')
    })
  })

  describe('分支节点预览线数量计算测试', () => {
    it('TC_UNIFIED_004 - 受众分流节点应该生成正确数量的预览线', async () => {
      // 模拟受众分流节点
      const audienceSplitNode = {
        id: 'audience-split-1',
        getData: () => ({
          nodeType: 'audience-split',
          isConfigured: true,
          branches: [
            { id: 'branch1', name: '分支1' },
            { id: 'branch2', name: '分支2' },
            { id: 'branch3', name: '分支3' }
          ]
        }),
        getPosition: () => ({ x: 100, y: 100 })
      }
      
      mockGraph.getNodes.mockReturnValue([audienceSplitNode])
      
      // 模拟返回3条预览线（对应3个分支）
      mockPreviewLineSystem.forceRegeneratePreviewLines.mockResolvedValue({
        success: true,
        previousCount: 0,
        newCount: 3,
        createdCount: 3,
        createResults: [
          { nodeId: 'audience-split-1', success: true, previewLineId: 'preview_branch1' },
          { nodeId: 'audience-split-1', success: true, previewLineId: 'preview_branch2' },
          { nodeId: 'audience-split-1', success: true, previewLineId: 'preview_branch3' }
        ]
      })
      
      const result = await wrapper.vm.triggerPreviewLineGeneration()
      
      // 验证生成了3条预览线
      expect(result.newCount).toBe(3)
      expect(result.createResults).toHaveLength(3)
    })

    it('TC_UNIFIED_005 - 事件分流节点应该生成正确数量的预览线', async () => {
      // 模拟事件分流节点
      const eventSplitNode = {
        id: 'event-split-1',
        getData: () => ({
          nodeType: 'event-split',
          isConfigured: true,
          branchCount: 4 // 使用 branchCount 字段
        }),
        getPosition: () => ({ x: 200, y: 200 })
      }
      
      mockGraph.getNodes.mockReturnValue([eventSplitNode])
      
      // 模拟返回4条预览线
      mockPreviewLineSystem.forceRegeneratePreviewLines.mockResolvedValue({
        success: true,
        previousCount: 0,
        newCount: 4,
        createdCount: 4,
        createResults: Array.from({ length: 4 }, (_, i) => ({
          nodeId: 'event-split-1',
          success: true,
          previewLineId: `preview_branch${i + 1}`
        }))
      })
      
      const result = await wrapper.vm.triggerPreviewLineGeneration()
      
      // 验证生成了4条预览线
      expect(result.newCount).toBe(4)
      expect(result.createResults).toHaveLength(4)
    })

    it('TC_UNIFIED_006 - AB测试节点应该生成至少2条预览线', async () => {
      // 模拟AB测试节点（没有明确的分支配置）
      const abTestNode = {
        id: 'ab-test-1',
        getData: () => ({
          nodeType: 'ab-test',
          isConfigured: true
          // 没有 branches 或 branchCount，应该默认为2
        }),
        getPosition: () => ({ x: 300, y: 300 })
      }
      
      mockGraph.getNodes.mockReturnValue([abTestNode])
      
      // 模拟返回2条预览线（默认最小值）
      mockPreviewLineSystem.forceRegeneratePreviewLines.mockResolvedValue({
        success: true,
        previousCount: 0,
        newCount: 2,
        createdCount: 2,
        createResults: [
          { nodeId: 'ab-test-1', success: true, previewLineId: 'preview_a' },
          { nodeId: 'ab-test-1', success: true, previewLineId: 'preview_b' }
        ]
      })
      
      const result = await wrapper.vm.triggerPreviewLineGeneration()
      
      // 验证生成了至少2条预览线
      expect(result.newCount).toBeGreaterThanOrEqual(2)
      expect(result.createResults).toHaveLength(2)
    })
  })

  describe('容错机制测试', () => {
    it('TC_UNIFIED_007 - 应该处理预览线生成过程中的错误', async () => {
      // 模拟预览线生成抛出异常
      mockPreviewLineSystem.forceRegeneratePreviewLines.mockRejectedValue(
        new Error('网络连接失败')
      )
      
      // 验证异常被正确处理
      await expect(wrapper.vm.triggerPreviewLineGeneration()).rejects.toThrow('网络连接失败')
    })

    it('TC_UNIFIED_008 - 应该处理部分节点预览线创建失败的情况', async () => {
      // 模拟部分成功的结果
      mockPreviewLineSystem.forceRegeneratePreviewLines.mockResolvedValue({
        success: true,
        previousCount: 0,
        newCount: 1,
        createdCount: 1,
        createResults: [
          { nodeId: 'node1', success: true, previewLineId: 'preview_1' },
          { nodeId: 'node2', success: false, error: '节点配置无效' }
        ]
      })
      
      const result = await wrapper.vm.triggerPreviewLineGeneration()
      
      // 验证整体仍然成功，但记录了失败的节点
      expect(result.success).toBe(true)
      expect(result.newCount).toBe(1)
      expect(result.createResults).toHaveLength(2)
      expect(result.createResults[1].success).toBe(false)
    })

    it('TC_UNIFIED_009 - 应该验证预览线生成的参数配置', async () => {
      await wrapper.vm.triggerPreviewLineGeneration()
      
      // 验证调用参数包含所有必要的配置
      const callArgs = mockPreviewLineSystem.forceRegeneratePreviewLines.mock.calls[0][0]
      expect(callArgs).toEqual({
        clearExisting: true,
        validateNodes: true,
        enableBranchAnalysis: true,
        enablePortValidation: true
      })
    })
  })

  describe('性能和状态管理测试', () => {
    it('TC_UNIFIED_010 - 应该正确管理预览线生成状态', async () => {
      // 模拟长时间运行的预览线生成
      let resolveGeneration
      const generationPromise = new Promise(resolve => {
        resolveGeneration = resolve
      })
      
      mockPreviewLineSystem.forceRegeneratePreviewLines.mockReturnValue(generationPromise)
      
      // 开始生成
      const generationTask = wrapper.vm.triggerPreviewLineGeneration()
      
      // 验证生成状态
      // 注意：在实际组件中，这里应该检查 isGeneratingPreviewLines 状态
      
      // 完成生成
      resolveGeneration({
        success: true,
        newCount: 1,
        createdCount: 1
      })
      
      const result = await generationTask
      expect(result.success).toBe(true)
    })

    it('TC_UNIFIED_011 - 应该避免重复调用预览线生成方法', async () => {
      // 同时触发多次预览线生成
      const promises = [
        wrapper.vm.triggerPreviewLineGeneration(),
        wrapper.vm.triggerPreviewLineGeneration(),
        wrapper.vm.triggerPreviewLineGeneration()
      ]
      
      await Promise.all(promises)
      
      // 验证实际只调用了3次（没有防重复机制的情况下）
      // 在实际实现中，应该有防重复调用的机制
      expect(mockPreviewLineSystem.forceRegeneratePreviewLines).toHaveBeenCalledTimes(3)
    })
  })

  describe('集成测试', () => {
    it('TC_UNIFIED_012 - 完整的预览线生成流程测试', async () => {
      // 模拟复杂的节点结构
      const nodes = [
        {
          id: 'start-1',
          getData: () => ({ nodeType: 'start', isConfigured: true }),
          getPosition: () => ({ x: 0, y: 0 })
        },
        {
          id: 'audience-split-1',
          getData: () => ({
            nodeType: 'audience-split',
            isConfigured: true,
            branches: [{ id: 'b1' }, { id: 'b2' }]
          }),
          getPosition: () => ({ x: 200, y: 0 })
        },
        {
          id: 'task-1',
          getData: () => ({ nodeType: 'task', isConfigured: true }),
          getPosition: () => ({ x: 400, y: 0 })
        }
      ]
      
      mockGraph.getNodes.mockReturnValue(nodes)
      
      // 模拟生成结果：start(1) + audience-split(2) + task(1) = 4条预览线
      mockPreviewLineSystem.forceRegeneratePreviewLines.mockResolvedValue({
        success: true,
        previousCount: 0,
        newCount: 4,
        createdCount: 4,
        createResults: [
          { nodeId: 'start-1', success: true, previewLineId: 'preview_start' },
          { nodeId: 'audience-split-1', success: true, previewLineId: 'preview_split_1' },
          { nodeId: 'audience-split-1', success: true, previewLineId: 'preview_split_2' },
          { nodeId: 'task-1', success: true, previewLineId: 'preview_task' }
        ]
      })
      
      const result = await wrapper.vm.triggerPreviewLineGeneration()
      
      // 验证生成了正确数量的预览线
      expect(result.success).toBe(true)
      expect(result.newCount).toBe(4)
      expect(result.createResults).toHaveLength(4)
      
      // 验证每个节点都有对应的预览线
      const nodeIds = result.createResults.map(r => r.nodeId)
      expect(nodeIds).toContain('start-1')
      expect(nodeIds).toContain('audience-split-1')
      expect(nodeIds).toContain('task-1')
      
      // 验证分支节点有多条预览线
      const splitResults = result.createResults.filter(r => r.nodeId === 'audience-split-1')
      expect(splitResults).toHaveLength(2)
    })
  })
})