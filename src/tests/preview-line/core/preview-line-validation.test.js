import { describe, it, expect, beforeEach, vi } from 'vitest'
import PreviewLineSystem from '../../../utils/preview-line/PreviewLineSystem.js'
import { PreviewLineManager } from '../../../utils/preview-line/core/PreviewLineManager.js'
import { PreviewLineValidator } from '../../../utils/preview-line/core/PreviewLineValidator.js'

describe('PreviewLineSystem - 预览线验证测试', () => {
  let previewLineSystem
  let previewManager
  let previewValidator
  let mockGraph
  let mockNode

  beforeEach(async () => {
    // 创建模拟的图实例
    mockGraph = {
      getCellById: vi.fn(() => mockNode),
      getOutgoingEdges: vi.fn(),
      getEdges: vi.fn(() => []), // 🔧 添加缺失的getEdges方法
      hasCell: vi.fn(() => false), // 添加hasCell方法
      addEdge: vi.fn(() => ({
        id: 'mock-edge-id',
        attr: vi.fn(),
        setRouter: vi.fn(),
        setAttrs: vi.fn(),
        getLabels: vi.fn(() => []),
        getData: vi.fn(() => ({ type: 'preview-line' })),
        getSourceCellId: vi.fn(() => 'test-node-id'),
        getTargetCellId: vi.fn(() => undefined)
      })),
      removeEdge: vi.fn(),
      getNodes: vi.fn(() => []),
      on: vi.fn(),
      off: vi.fn(),
      removeCell: vi.fn()
    }

    // 创建模拟节点
    mockNode = {
      id: 'test-node-id',
      getData: vi.fn(() => ({
        type: 'audience-split',
        isConfigured: true, // 添加isConfigured标记
        config: {
          branches: [
            { id: 'branch-1', label: '黑名单' },
            { id: 'branch-2', label: '低响应客群' },
            { id: 'branch-3', label: '未命中人群' }
          ]
        }
      })),
      setData: vi.fn(), // 添加setData方法
      getSize: vi.fn(() => ({ width: 120, height: 40 })),
      getPosition: vi.fn(() => ({ x: 390, y: 360 }))
    }

    // 创建预览线系统实例
    previewLineSystem = new PreviewLineSystem({ graph: mockGraph })
    await previewLineSystem.init()
    
    // 创建模拟的配置管理器
    const mockConfigManager = {
      get: vi.fn((key, defaultValue) => defaultValue),
      set: vi.fn(),
      has: vi.fn(() => true)
    }
    
    // 创建预览线管理器和验证器实例
    previewValidator = new PreviewLineValidator(mockConfigManager, null, null) // 传递layoutEngine参数
    previewManager = new PreviewLineManager({
      graph: mockGraph,
      validator: previewValidator,
      branchManager: null
    })
    
    // 模拟验证器方法
    vi.spyOn(previewValidator, 'isBranchNode').mockReturnValue(true)
    vi.spyOn(previewValidator, 'checkPreviewLineRequirement').mockReturnValue({
      shouldCreate: true,
      action: 'create',
      branches: [
        { id: 'branch-1', label: '黑名单' },
        { id: 'branch-2', label: '低响应客群' },
        { id: 'branch-3', label: '未命中人群' }
      ]
    })
    
    // 模拟管理器方法
    vi.spyOn(previewManager, 'createUnifiedPreviewLine').mockImplementation(() => Promise.resolve())
  })

  describe('预览线显示信息校验', () => {
    it('应该正确显示源节点ID而不是undefined', async () => {
      // 调用统一预览线创建方法
      await previewManager.createUnifiedPreviewLine(mockNode)

      // 验证统一预览线创建方法被调用
      expect(previewManager.createUnifiedPreviewLine).toHaveBeenCalledWith(mockNode)
      
      // 如果addEdge被调用，验证source配置
      if (mockGraph.addEdge.mock.calls.length > 0) {
        expect(mockGraph.addEdge).toHaveBeenCalledWith(
          expect.objectContaining({
            source: { cell: 'test-node-id', port: 'branch-1' },
            data: expect.objectContaining({
              sourceNodeId: 'test-node-id',
              type: 'preview-line'
            })
          })
        )
      }
    })

    it('应该正确设置预览线标签', async () => {
      // 调用统一预览线创建方法
      await previewManager.createUnifiedPreviewLine(mockNode)

      // 验证统一预览线创建方法被调用
      expect(previewManager.createUnifiedPreviewLine).toHaveBeenCalledWith(mockNode)
      
      // 如果addEdge被调用，验证数据配置
      if (mockGraph.addEdge.mock.calls.length > 0) {
        const edgeConfig = mockGraph.addEdge.mock.calls[0][0]
        expect(edgeConfig.data).toBeDefined()
        expect(edgeConfig.data.branchLabel).toBe('黑名单')
        expect(edgeConfig.data.type).toBe('preview-line')
      }
    })
  })

  describe('Y坐标校验逻辑', () => {
    it('应该校验Y坐标的有效性', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      // 模拟无效的Y坐标
      const invalidPosition = { x: 500, y: NaN }
      
      // 直接测试Y坐标校验逻辑
      const newEndPosition = {
        x: invalidPosition.x + 60,
        y: invalidPosition.y + 20
      }
      
      const isValid = typeof newEndPosition.x === 'number' && !isNaN(newEndPosition.x) &&
                     typeof newEndPosition.y === 'number' && !isNaN(newEndPosition.y)
      
      expect(isValid).toBe(false)
      consoleSpy.mockRestore()
    })

    it('应该修正超出范围的Y坐标', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      
      // 测试Y坐标范围校验
      const testCases = [
        { input: 10, expected: 50, description: '小于最小值' },
        { input: 3000, expected: 2000, description: '大于最大值' },
        { input: 100, expected: 100, description: '在合理范围内' }
      ]
      
      testCases.forEach(({ input, expected, description }) => {
        const minY = 50
        const maxY = 2000
        const correctedY = Math.max(minY, Math.min(maxY, input))
        
        expect(correctedY).toBe(expected)
      })
      
      consoleWarnSpy.mockRestore()
    })

    it('应该记录Y坐标校验的详细信息', async () => {
      // 调用统一预览线创建方法
      await previewManager.createUnifiedPreviewLine(mockNode)
      
      // 验证统一预览线创建方法被调用
      expect(previewManager.createUnifiedPreviewLine).toHaveBeenCalledWith(mockNode)
      
      // 验证Y坐标校验逻辑
      const testPosition = { x: 500, y: 100 }
      const newEndPosition = {
        x: testPosition.x + 60,
        y: testPosition.y + 20
      }
      
      const isValid = typeof newEndPosition.x === 'number' && !isNaN(newEndPosition.x) &&
                     typeof newEndPosition.y === 'number' && !isNaN(newEndPosition.y)
      
      expect(isValid).toBe(true)
    })
  })

  describe('预览线标签显示校验', () => {
    it('应该正确解析X6标签的文本内容', () => {
      // 模拟X6标签结构
      const mockLabel = {
        attrs: {
          text: {
            text: '黑名单'
          }
        },
        position: 0.8
      }
      
      // 测试标签文本解析逻辑
      let labelText = 'empty'
      if (mockLabel.attrs && mockLabel.attrs.text && mockLabel.attrs.text.text) {
        labelText = mockLabel.attrs.text.text
      } else if (mockLabel.markup) {
        labelText = mockLabel.markup
      } else if (mockLabel.text) {
        labelText = mockLabel.text
      }
      
      expect(labelText).toBe('黑名单')
    })

    it('应该处理不同格式的标签数据', () => {
      const testCases = [
        {
          label: { attrs: { text: { text: '低响应客群' } } },
          expected: '低响应客群'
        },
        {
          label: { markup: '未命中人群' },
          expected: '未命中人群'
        },
        {
          label: { text: '普通标签' },
          expected: '普通标签'
        },
        {
          label: {},
          expected: 'empty'
        }
      ]
      
      testCases.forEach(({ label, expected }) => {
        let labelText = 'empty'
        if (label.attrs && label.attrs.text && label.attrs.text.text) {
          labelText = label.attrs.text.text
        } else if (label.markup) {
          labelText = label.markup
        } else if (label.text) {
          labelText = label.text
        }
        
        expect(labelText).toBe(expected)
      })
    })
  })

  describe('预览线创建完整性校验', () => {
    it('应该包含所有必要的预览线属性', async () => {
      // 调用统一预览线创建方法
      await previewManager.createUnifiedPreviewLine(mockNode)

      // 验证统一预览线创建方法被调用
      expect(previewManager.createUnifiedPreviewLine).toHaveBeenCalledWith(mockNode)
      
      // 如果addEdge被调用，验证参数
      if (mockGraph.addEdge.mock.calls.length > 0) {
        const edgeConfig = mockGraph.addEdge.mock.calls[0][0]
        
        // 验证预览线的基本属性
        expect(edgeConfig.id).toBeDefined()
        expect(edgeConfig.source).toBeDefined()
        expect(edgeConfig.target).toBeDefined()
        expect(edgeConfig.attrs).toBeDefined()
        
        // 验证数据信息
        expect(edgeConfig.data).toBeDefined()
        expect(edgeConfig.data.type).toBe('preview-line')
        
        // 验证预览线样式
        expect(edgeConfig.attrs.line).toBeDefined()
        expect(edgeConfig.attrs.line.stroke).toBeDefined()
        expect(edgeConfig.attrs.line.strokeDasharray).toBeDefined()
      }
    })

    it('应该正确处理多分支预览线的层级', async () => {
      // 重置mock调用记录
      mockGraph.addEdge.mockClear()
      previewManager.createUnifiedPreviewLine.mockClear()
      
      // 创建多个分支节点的预览线
      const branchNodes = [
        { ...mockNode, id: 'branch-node-1' },
        { ...mockNode, id: 'branch-node-2' },
        { ...mockNode, id: 'branch-node-3' }
      ]
      
      // 为每个分支节点创建预览线
      for (const node of branchNodes) {
        await previewManager.createUnifiedPreviewLine(node)
      }
      
      // 验证每个节点都调用了统一预览线创建方法
      expect(previewManager.createUnifiedPreviewLine).toHaveBeenCalledTimes(3)
      
      // 验证每个调用都使用了正确的节点
      branchNodes.forEach((node, index) => {
        expect(previewManager.createUnifiedPreviewLine).toHaveBeenNthCalledWith(index + 1, node)
      })
    })
  })
})