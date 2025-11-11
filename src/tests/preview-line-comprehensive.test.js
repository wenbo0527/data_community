/**
 * 预览线有效性检查综合测试
 * 覆盖更多实际使用场景和边界情况
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { PreviewLineSystem } from '../utils/preview-line/PreviewLineSystem.js'
import { PreviewLineManager } from '../utils/preview-line/core/PreviewLineManager.js'

describe('预览线有效性检查 - 综合测试', () => {
  let mockGraph
  let previewLineSystem
  let mockPreviewLineManager

  beforeEach(() => {
    // 创建更完整的模拟图实例
    mockGraph = {
      getNodes: vi.fn(() => [
        {
          id: 'node1',
          getData: () => ({ type: 'start', isConfigured: true }),
          getPosition: () => ({ x: 100, y: 100 }),
          getSize: () => ({ width: 120, height: 40 })
        },
        {
          id: 'node2', 
          getData: () => ({ type: 'audience-split', isConfigured: true, branches: [{ id: 'branch1' }, { id: 'branch2' }] }),
          getPosition: () => ({ x: 300, y: 100 }),
          getSize: () => ({ width: 120, height: 40 })
        },
        {
          id: 'node3',
          getData: () => ({ type: 'action', isConfigured: false }),
          getPosition: () => ({ x: 500, y: 100 }),
          getSize: () => ({ width: 120, height: 40 })
        }
      ]),
      getEdges: vi.fn(() => [
        {
          id: 'edge1',
          getSourceCellId: () => 'node1',
          getTargetCellId: () => 'node2',
          getData: () => ({ isPreview: false })
        },
        {
          id: 'preview1',
          getSourceCellId: () => 'node2',
          getTargetCellId: () => 'node3',
          getData: () => ({ isPreview: true, branchId: 'branch1' })
        }
      ]),
      addEdge: vi.fn(),
      removeEdge: vi.fn(),
      getCellById: vi.fn(),
      on: vi.fn(),
      off: vi.fn()
    }

    // 创建模拟预览线管理器
    mockPreviewLineManager = {
      validateNodeConnections: vi.fn()
    }

    // 创建PreviewLineSystem实例
    previewLineSystem = new PreviewLineSystem({
      graph: mockGraph,
      branchManager: null,
      layoutEngine: null,
      layoutEngineReady: true
    })

    previewLineSystem.previewLineManager = mockPreviewLineManager
    previewLineSystem.initialized = true
  })

  describe('基本功能测试', () => {
    it('应该正确处理有效的验证结果', () => {
      const mockResult = {
        isValid: true,
        totalNodes: 3,
        validNodes: 2,
        invalidNodes: 1,
        statistics: {
          totalNodes: 3,
          totalPreviewLines: 1,
          totalConnections: 1
        },
        details: [
          { nodeId: 'node1', isValid: true, issues: [] },
          { nodeId: 'node2', isValid: true, issues: [] },
          { nodeId: 'node3', isValid: false, issues: ['未配置'] }
        ]
      }

      mockPreviewLineManager.validateNodeConnections.mockReturnValue(mockResult)

      const result = previewLineSystem.validateNodeConnections(mockGraph)
      
      expect(result).toEqual(mockResult)
      expect(result.isValid).toBe(true)
      expect(result.totalNodes).toBe(3)
      expect(result.validNodes).toBe(2)
      expect(result.invalidNodes).toBe(1)
    })

    it('应该正确处理无效的验证结果', () => {
      const mockResult = {
        isValid: false,
        totalNodes: 3,
        validNodes: 1,
        invalidNodes: 2,
        statistics: {
          totalNodes: 3,
          totalPreviewLines: 0,
          totalConnections: 1
        },
        details: [
          { nodeId: 'node1', isValid: true, issues: [] },
          { nodeId: 'node2', isValid: false, issues: ['缺少分支连接'] },
          { nodeId: 'node3', isValid: false, issues: ['未配置', '缺少输入连接'] }
        ]
      }

      mockPreviewLineManager.validateNodeConnections.mockReturnValue(mockResult)

      const result = previewLineSystem.validateNodeConnections(mockGraph)
      
      expect(result).toEqual(mockResult)
      expect(result.isValid).toBe(false)
      expect(result.invalidNodes).toBe(2)
      expect(result.details).toHaveLength(3)
    })
  })

  describe('错误处理测试', () => {
    it('应该处理预览线管理器抛出的错误', () => {
      const error = new Error('验证过程中发生错误')
      mockPreviewLineManager.validateNodeConnections.mockImplementation(() => {
        throw error
      })

      expect(() => {
        previewLineSystem.validateNodeConnections(mockGraph)
      }).toThrow('验证过程中发生错误')
    })

    it('应该处理系统未初始化的情况', () => {
      previewLineSystem.initialized = false
      
      // 由于checkInitialized会尝试自动初始化而不是抛出错误，
      // 我们需要模拟ensureInitialized失败的情况
      const ensureInitializedSpy = vi.spyOn(previewLineSystem, 'ensureInitialized').mockReturnValue(false)
      
      // 预期会记录警告日志而不是抛出错误
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      
      const result = previewLineSystem.validateNodeConnections(mockGraph)
      
      // 验证返回的默认结果
      expect(result).toEqual({
        isValid: false,
        totalNodes: 0,
        validNodes: 0,
        invalidNodes: 0,
        errors: ['系统未初始化']
      })
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[PreviewLineSystem] checkInitialized失败:'),
        expect.stringContaining('预览线系统未初始化')
      )
      
      consoleSpy.mockRestore()
      ensureInitializedSpy.mockRestore()
    })

    it('应该处理空图的情况', () => {
      const emptyGraph = {
        getNodes: vi.fn(() => []),
        getEdges: vi.fn(() => []),
        addEdge: vi.fn(),
        removeEdge: vi.fn(),
        getCellById: vi.fn(),
        on: vi.fn(),
        off: vi.fn()
      }

      const mockResult = {
        isValid: true,
        totalNodes: 0,
        validNodes: 0,
        invalidNodes: 0,
        statistics: { totalNodes: 0, totalPreviewLines: 0, totalConnections: 0 },
        details: []
      }

      mockPreviewLineManager.validateNodeConnections.mockReturnValue(mockResult)

      const result = previewLineSystem.validateNodeConnections(emptyGraph)
      
      expect(result.totalNodes).toBe(0)
      expect(result.details).toHaveLength(0)
    })
  })

  describe('选项传递测试', () => {
    it('应该正确传递详细模式选项', () => {
      const options = { verbose: true, includeStatistics: true }
      const mockResult = {
        isValid: true,
        totalNodes: 3,
        validNodes: 3,
        invalidNodes: 0,
        statistics: { totalNodes: 3, totalPreviewLines: 1, totalConnections: 1 },
        details: []
      }

      mockPreviewLineManager.validateNodeConnections.mockReturnValue(mockResult)

      previewLineSystem.validateNodeConnections(mockGraph, options)
      
      expect(mockPreviewLineManager.validateNodeConnections).toHaveBeenCalledWith(mockGraph, options)
    })

    it('应该正确传递过滤选项', () => {
      const options = { 
        filterNodeTypes: ['audience-split', 'event-split'],
        excludeUnconfigured: true
      }
      
      mockPreviewLineManager.validateNodeConnections.mockReturnValue({
        isValid: true,
        totalNodes: 1,
        validNodes: 1,
        invalidNodes: 0,
        statistics: { totalNodes: 1, totalPreviewLines: 1, totalConnections: 0 },
        details: []
      })

      previewLineSystem.validateNodeConnections(mockGraph, options)
      
      expect(mockPreviewLineManager.validateNodeConnections).toHaveBeenCalledWith(mockGraph, options)
    })
  })

  describe('性能和边界测试', () => {
    it('应该处理大量节点的情况', () => {
      const largeNodeSet = Array.from({ length: 100 }, (_, i) => ({
        id: `node${i}`,
        getData: () => ({ type: 'action', isConfigured: i % 2 === 0 }),
        getPosition: () => ({ x: i * 50, y: 100 }),
        getSize: () => ({ width: 120, height: 40 })
      }))

      const largeGraph = {
        ...mockGraph,
        getNodes: vi.fn(() => largeNodeSet)
      }

      const mockResult = {
        isValid: false,
        totalNodes: 100,
        validNodes: 50,
        invalidNodes: 50,
        statistics: { totalNodes: 100, totalPreviewLines: 25, totalConnections: 75 },
        details: largeNodeSet.map((node, i) => ({
          nodeId: node.id,
          isValid: i % 2 === 0,
          issues: i % 2 === 0 ? [] : ['未配置']
        }))
      }

      mockPreviewLineManager.validateNodeConnections.mockReturnValue(mockResult)

      const result = previewLineSystem.validateNodeConnections(largeGraph)
      
      expect(result.totalNodes).toBe(100)
      expect(result.validNodes).toBe(50)
      expect(result.invalidNodes).toBe(50)
    })

    it('应该处理复杂的分支节点结构', () => {
      const complexBranchNode = {
        id: 'complex-branch',
        getData: () => ({
          type: 'audience-split',
          isConfigured: true,
          branches: [
            { id: 'branch1', label: '高价值客户' },
            { id: 'branch2', label: '普通客户' },
            { id: 'branch3', label: '低价值客户' },
            { id: 'branch4', label: '未分类客户' }
          ]
        }),
        getPosition: () => ({ x: 300, y: 200 }),
        getSize: () => ({ width: 150, height: 60 })
      }

      const complexGraph = {
        ...mockGraph,
        getNodes: vi.fn(() => [complexBranchNode])
      }

      const mockResult = {
        isValid: false,
        totalNodes: 1,
        validNodes: 0,
        invalidNodes: 1,
        statistics: { totalNodes: 1, totalPreviewLines: 4, totalConnections: 0 },
        details: [{
          nodeId: 'complex-branch',
          isValid: false,
          issues: ['分支1未连接', '分支2未连接', '分支3未连接', '分支4未连接']
        }]
      }

      mockPreviewLineManager.validateNodeConnections.mockReturnValue(mockResult)

      const result = previewLineSystem.validateNodeConnections(complexGraph)
      
      expect(result.isValid).toBe(false)
      expect(result.details[0].issues).toHaveLength(4)
    })
  })

  describe('事件触发测试', () => {
    it('应该在验证完成后触发事件', () => {
      const eventSpy = vi.spyOn(previewLineSystem, 'emit')
      
      const mockResult = {
        isValid: true,
        totalNodes: 3,
        validNodes: 3,
        invalidNodes: 0,
        statistics: { totalNodes: 3, totalPreviewLines: 1, totalConnections: 2 },
        details: []
      }

      mockPreviewLineManager.validateNodeConnections.mockReturnValue(mockResult)

      previewLineSystem.validateNodeConnections(mockGraph)
      
      expect(eventSpy).toHaveBeenCalledWith('validation:nodeConnectionsValidated', {
        result: mockResult,
        timestamp: expect.any(Number)
      })
    })
  })
})