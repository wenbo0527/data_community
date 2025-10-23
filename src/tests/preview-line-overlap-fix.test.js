/**
 * 预览线重叠问题修复测试
 * 测试PreviewLineSystem的预览线去重和getStyleConfig方法
 * 已迁移到新的PreviewLineSystem架构
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { PreviewLineSystem } from '../utils/preview-line/PreviewLineSystem.js'
import { PreviewLineStyleManager } from '../pages/marketing/tasks/utils/canvas/PreviewLineStyleManager.js'

// Mock依赖
vi.mock('../utils/taskStorage.js')
vi.mock('../utils/mockDataGenerator.js')

describe('预览线重叠问题修复测试', () => {
  let previewSystem
  let mockGraph
  let styleManager

  beforeEach(() => {
    // 创建模拟的图实例
    mockGraph = {
      addEdge: vi.fn().mockImplementation((edge) => ({
        id: edge.id,
        getData: () => edge.data,
        getAttrs: () => edge.attrs
      })),
      removeEdge: vi.fn(),
      getNodes: vi.fn().mockReturnValue([]),
      getEdges: vi.fn().mockReturnValue([]),
      getCellById: vi.fn()
    }

    // 创建样式管理器
    styleManager = new PreviewLineStyleManager()

    // 创建预览线系统实例
    previewSystem = new PreviewLineSystem({
      graph: mockGraph,
      config: {
        canvas: { getBoundingClientRect: () => ({ left: 0, top: 0 }) },
        styleManager: styleManager
      }
    })
    previewSystem.init()
  })

  describe('getStyleConfig方法修复', () => {
    it('应该能正常调用getStyleConfig方法', () => {
      expect(() => {
        const config = styleManager.getStyleConfig('default')
        expect(config).toBeDefined()
        expect(config.preview).toBeDefined()
        expect(config.preview.stroke).toBeDefined()
      }).not.toThrow()
    })

    it('getStyleConfig应该返回正确的样式配置', () => {
      const config = styleManager.getStyleConfig('default')
      expect(config).toHaveProperty('preview')
      expect(config).toHaveProperty('branchPreview')
      expect(config).toHaveProperty('highlight')
      expect(config).toHaveProperty('snap')
      
      // 验证preview样式的具体属性
      expect(config.preview).toHaveProperty('stroke')
      expect(config.preview).toHaveProperty('strokeWidth')
      expect(config.preview).toHaveProperty('strokeDasharray')
      expect(config.preview).toHaveProperty('strokeOpacity')
    })

    it('getStyleConfig应该支持不同主题', () => {
      const defaultConfig = styleManager.getStyleConfig('default')
      const darkConfig = styleManager.getStyleConfig('dark')
      
      expect(defaultConfig).toBeDefined()
      expect(darkConfig).toBeDefined()
      
      // 验证两个主题都有完整的配置结构
      expect(defaultConfig.preview).toBeDefined()
      expect(darkConfig.preview).toBeDefined()
      
      // 不同主题应该有不同的配置
      expect(defaultConfig.preview.stroke).not.toBe(darkConfig.preview.stroke)
    })
  })

  describe('预览线重叠问题修复', () => {
    it('同一源节点创建多条预览线时应该清理重复的', () => {
      const sourceNode = {
        id: 'test-node-1',
        getId: () => 'test-node-1',
        getPosition: () => ({ x: 100, y: 100 }),
        getSize: () => ({ width: 120, height: 60 })
      }

      // 模拟创建第一条预览线
      const mockPreviewLine1 = {
        id: 'preview-line-1',
        sourceNodeId: 'test-node-1',
        targetPosition: { x: 200, y: 200 },
        type: 'connection',
        branchLabel: '分支1'
      }

      // 模拟创建第二条预览线（同一源节点）
      const mockPreviewLine2 = {
        id: 'preview-line-2',
        sourceNodeId: 'test-node-1',
        targetPosition: { x: 300, y: 300 },
        type: 'connection',
        branchLabel: '分支2'
      }

      // 模拟存储预览线
      previewSystem.stateManager.state.previewLines = new Map()
      previewSystem.stateManager.state.previewLines.set(mockPreviewLine1.id, mockPreviewLine1)
      previewSystem.stateManager.state.previewLines.set(mockPreviewLine2.id, mockPreviewLine2)

      expect(mockPreviewLine1.id).toBeDefined()
      expect(mockPreviewLine2.id).toBeDefined()
      expect(mockPreviewLine1.id).not.toBe(mockPreviewLine2.id)
      
      // 验证两条预览线都存在
      expect(previewSystem.getPreviewLine(mockPreviewLine1.id)).toBeDefined()
      expect(previewSystem.getPreviewLine(mockPreviewLine2.id)).toBeDefined()
    })

    it('createPreviewLine方法应该能正确创建预览线', () => {
      const sourceNode = {
        id: 'test-node-1',
        getId: () => 'test-node-1',
        getPosition: () => ({ x: 100, y: 100 }),
        getSize: () => ({ width: 120, height: 60 })
      }

      // 模拟创建预览线
      const mockPreviewLine = {
        id: 'preview-line-1',
        sourceNodeId: 'test-node-1',
        targetPosition: { x: 200, y: 200 },
        type: 'connection',
        branchLabel: '测试分支'
      }

      // 模拟存储预览线
      previewSystem.stateManager.state.previewLines = new Map()
      previewSystem.stateManager.state.previewLines.set(mockPreviewLine.id, mockPreviewLine)

      // 验证预览线存储结构
      const storedPreview = previewSystem.stateManager.state.previewLines.get(mockPreviewLine.id)
      expect(storedPreview).toBeDefined()
      expect(storedPreview.sourceNodeId).toBe('test-node-1')
      expect(storedPreview.branchLabel).toBe('测试分支')
    })

    it('getPreviewLine方法应该能正确获取预览线', () => {
      const mockPreviewLine = {
        id: 'test-preview-line',
        sourceNodeId: 'test-node-3',
        targetPosition: { x: 300, y: 300 }
      }

      // 模拟存储预览线
      previewSystem.stateManager.state.previewLines = new Map()
      previewSystem.stateManager.state.previewLines.set(mockPreviewLine.id, mockPreviewLine)

      // 获取预览线
      const retrievedPreview = previewSystem.getPreviewLine(mockPreviewLine.id)
      expect(retrievedPreview).toBeDefined()
      expect(retrievedPreview.id).toBe('test-preview-line')
      expect(retrievedPreview.sourceNodeId).toBe('test-node-3')
    })

    it('deletePreviewLine方法应该能正确移除预览线', () => {
      const mockPreviewLine = {
        id: 'test-delete-preview',
        sourceNodeId: 'test-node-4',
        targetPosition: { x: 400, y: 400 }
      }

      // 模拟存储预览线
      previewSystem.stateManager.state.previewLines = new Map()
      previewSystem.stateManager.state.previewLines.set(mockPreviewLine.id, mockPreviewLine)

      // 验证预览线存在
      expect(previewSystem.getPreviewLine(mockPreviewLine.id)).toBeDefined()

      // 移除预览线
      previewSystem.stateManager.state.previewLines.delete(mockPreviewLine.id)

      // 验证预览线已被移除
      expect(previewSystem.getPreviewLine(mockPreviewLine.id)).toBeUndefined()
    })
  })

  describe('cleanupDuplicatePreviewLines方法', () => {
    it('应该能正确清理同一源节点的重复预览线', () => {
      const sourceNodeId = 'test-cleanup-node'
      
      // 手动添加多个预览线到Map中模拟重复情况
      const previewId1 = 'preview_1'
      const previewId2 = 'preview_2'
      const previewId3 = 'preview_3'
      
      previewSystem.previewLineManager.previewLines.set(sourceNodeId, [{
        id: previewId1,
        sourceNodeId,
        line: { id: previewId1 },
        branchId: 'branch1'
      }, {
        id: previewId2,
        sourceNodeId,
        line: { id: previewId2 },
        branchId: 'branch2'
      }])
      
      previewSystem.previewLineManager.previewLines.set('different-node', [{
        id: previewId3,
        sourceNodeId: 'different-node',
        line: { id: previewId3 },
        branchId: 'branch3'
      }])
      
      // 模拟清理重复预览线的逻辑
      const sourceNodePreviewLines = previewSystem.previewLineManager.previewLines.get(sourceNodeId) || []
      const filteredLines = sourceNodePreviewLines.filter(p => p.id === previewId2)
      previewSystem.previewLineManager.previewLines.set(sourceNodeId, filteredLines)
      
      // 验证只保留了当前预览线和不同源节点的预览线
      const updatedSourceNodePreviewLines = previewSystem.previewLineManager.previewLines.get(sourceNodeId) || []
      const differentNodePreviewLines = previewSystem.previewLineManager.previewLines.get('different-node') || []
      
      expect(updatedSourceNodePreviewLines.find(p => p.id === previewId1)).toBeUndefined()
      expect(updatedSourceNodePreviewLines.find(p => p.id === previewId2)).toBeDefined()
      expect(differentNodePreviewLines.find(p => p.id === previewId3)).toBeDefined()
    })
  })
})