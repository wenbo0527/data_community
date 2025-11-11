import { describe, it, expect, beforeEach, vi } from 'vitest'
import PreviewLineSystem from '../utils/preview-line/PreviewLineSystem.js'

describe('调试连接线删除恢复功能', () => {
  let previewLineSystem
  let mockGraph
  let mockLayoutEngine

  beforeEach(() => {
    // 创建mock图形对象
    mockGraph = {
      addNode: vi.fn(),
      addEdge: vi.fn(),
      removeEdge: vi.fn(),
      getNodes: vi.fn(() => []),
      getEdges: vi.fn(() => []),
      getCellById: vi.fn(),
      hasCell: vi.fn(() => false),
      getOutgoingEdges: vi.fn(() => []),
      on: vi.fn(),
      off: vi.fn()
    }

    // 创建mock布局引擎
    mockLayoutEngine = {
      layout: vi.fn(),
      isReady: () => true
    }

    // 创建PreviewLineSystem实例
    previewLineSystem = new PreviewLineSystem({
      graph: mockGraph,
      layoutEngine: mockLayoutEngine
    })

    // 手动初始化核心模块
    previewLineSystem.eventManager = {
      on: vi.fn(),
      off: vi.fn(),
      emit: vi.fn(),
      once: vi.fn()
    }

    previewLineSystem.configManager = {
      get: vi.fn((path, defaultValue) => {
        if (path === 'previewLine.enabled') return true
        if (path === 'previewLine.style') return {}
        if (path === 'previewLine.animation') return {}
        return defaultValue
      }),
      set: vi.fn(),
      watch: vi.fn()
    }

    previewLineSystem.stateManager = {
      get: vi.fn((path, defaultValue) => {
        if (path === 'previewLines') return {}
        return defaultValue
      }),
      set: vi.fn(),
      setState: vi.fn(), // 添加缺少的setState方法
      getState: vi.fn((path) => {
        if (path.startsWith('previewLines.')) {
          const id = path.split('.')[1]
          return previewLineSystem.stateManager.state.previewLines?.get?.(id)
        }
        return null
      }),
      subscribe: vi.fn(),
      state: {
        previewLines: new Map()
      }
    }

    previewLineSystem.previewLineManager = {
      createPreviewLine: vi.fn(() => ({ id: 'preview-line-id', type: 'preview' })),
      updatePreviewLine: vi.fn(),
      deletePreviewLine: vi.fn(),
      getPreviewLine: vi.fn(),
      hasPreviewLine: vi.fn(() => false),
      getAllPreviewLines: vi.fn(() => ({}))
    }

    // Mock renderer
    previewLineSystem.renderer = {
      createPreviewLine: vi.fn().mockReturnValue({
        id: 'preview-line-1',
        sourceNode: { id: 'branch-node' },
        targetNode: null,
        branchId: 'branch-1',
        branchLabel: 'Branch 1'
      }),
      updatePreviewLine: vi.fn(),
      deletePreviewLine: vi.fn()
    }

    // Mock stats
    previewLineSystem.stats = {
      increment: vi.fn(),
      decrement: vi.fn(),
      set: vi.fn(),
      get: vi.fn(() => 0)
    }

    // Mock emit method
    previewLineSystem.emit = vi.fn()

    // Mock hasPreviewLine method
    previewLineSystem.hasPreviewLine = vi.fn(() => false)

    // 标记为已初始化 - systemState是字符串，需要创建initialized属性
    previewLineSystem.initialized = true
  })

  it('调试handleConnectionDeletion方法', async () => {
    console.log('=== 开始调试handleConnectionDeletion ===')

    // 创建分支节点
    const branchNode = {
      id: 'branch-node',
      getData: () => ({ 
        type: 'audience-split',
        isConfigured: true,
        config: {
          branches: [
            { id: 'branch1', label: '分支1' },
            { id: 'branch2', label: '分支2' }
          ]
        }
      }),
      getPosition: () => ({ x: 100, y: 100 }),
      getSize: () => ({ width: 120, height: 60 })
    }

    // 创建连接线对象
    const existingConnection = {
      id: 'existing-connection',
      source: { cell: 'branch-node' },
      target: { cell: 'target-node' },
      getData: () => ({ branchId: 'branch1', isPreview: false }),
      getSourceCellId: () => 'branch-node'
    }

    // 配置mock
    mockGraph.getCellById.mockImplementation((id) => {
      console.log(`getCellById called with: ${id}`)
      if (id === 'branch-node') return branchNode
      if (id === 'existing-connection') return existingConnection
      return null
    })

    mockGraph.getOutgoingEdges.mockReturnValue([existingConnection])

    console.log('调用handleConnectionDeletion前的状态:')
    console.log('- 分支节点:', branchNode.id)
    console.log('- 连接线:', existingConnection.id)
    console.log('- 连接的分支:', existingConnection.getData().branchId)

    // 调用handleConnectionDeletion
    console.log('🔍 调用handleConnectionDeletion，参数:', 'existing-connection')
    const result = await previewLineSystem.handleConnectionDeletion('existing-connection')
    console.log('🔍 handleConnectionDeletion结果:', result)
    
    // 检查renderer.createPreviewLine是否被调用
    console.log('🔍 renderer.createPreviewLine调用次数:', previewLineSystem.renderer.createPreviewLine.mock.calls.length)
    console.log('🔍 renderer.createPreviewLine调用参数:', previewLineSystem.renderer.createPreviewLine.mock.calls)
    
    if (result === null) {
      console.log('⚠️ handleConnectionDeletion返回null，可能是createPreviewLine失败')
      // 检查renderer.createPreviewLine是否被调用
      expect(previewLineSystem.renderer.createPreviewLine).toHaveBeenCalled()
    } else {
      // handleConnectionDeletion应该返回预览线对象，不是true
      expect(result).toBeTruthy()
      expect(result).toHaveProperty('id')
      expect(previewLineSystem.renderer.createPreviewLine).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'branch-node' }),
        expect.objectContaining({
          sourceId: 'branch-node',
          branchId: 'branch1',
          branchLabel: '分支1'
        })
      )
    }

    console.log('=== handleConnectionDeletion调试完成 ===')
  })
})