import { describe, it, expect, beforeEach, vi } from 'vitest'
import PreviewLineSystem from '../utils/preview-line/PreviewLineSystem.js'

describe('调试分支预览线创建逻辑', () => {
  let mockGraph
  let previewLineSystem

  beforeEach(async () => {
    mockGraph = {
      addNode: vi.fn(),
      addEdge: vi.fn().mockReturnValue({
        id: 'test-edge',
        prop: vi.fn(),
        getData: vi.fn(),
        setData: vi.fn(),
        setVisible: vi.fn(),
        getAttrs: vi.fn().mockReturnValue({}),
        setAttrs: vi.fn(),
        attr: vi.fn(),
        getSource: vi.fn().mockReturnValue({ x: 100, y: 100 }),
        getTarget: vi.fn().mockReturnValue({ x: 200, y: 200 }),
        setSource: vi.fn(),
        setTarget: vi.fn(),
        getLabels: vi.fn().mockReturnValue([]),
        setLabelAt: vi.fn(),
        setRouter: vi.fn()
      }),
      removeEdge: vi.fn(),
      getNodes: vi.fn(() => []),
      getEdges: vi.fn(() => []),
      getCellById: vi.fn(),
      hasCell: vi.fn().mockReturnValue(true),
      getOutgoingEdges: vi.fn(() => []),
      on: vi.fn(),
      off: vi.fn()
    }

    previewLineSystem = new PreviewLineSystem({
      graph: mockGraph,
      layoutEngine: { isReady: true },
      skipInitialization: true
    })
    
    // 手动初始化必要的模块
  try {
    // 初始化核心模块
    previewLineSystem.eventManager = { emit: () => {}, on: () => {}, off: () => {} };
    previewLineSystem.configManager = { get: () => ({}), set: () => {} };
    previewLineSystem.stateManager = { 
      state: { previewLines: new Map() },
      getState: () => ({ previewLines: new Map() }),
      setState: (key, value) => {
        // 模拟存储预览线到Map中
        if (key.startsWith('previewLines.')) {
          const id = key.replace('previewLines.', '');
          previewLineSystem.stateManager.state.previewLines.set(id, value);
        }
      }
    };
    previewLineSystem.previewLineManager = {
      createPreviewLine: () => ({ id: 'test-line' }),
      getPreviewLines: () => new Map(),
      deletePreviewLine: () => true
    };
    
    // 添加renderer mock
    previewLineSystem.renderer = {
      createPreviewLine: (sourceNodeOrConfig, config) => {
        // 生成唯一ID
        const id = `preview-line-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        return {
          id: id,
          sourceNode: sourceNodeOrConfig,
          config: config,
          type: 'preview'
        };
      }
    };
    
    // 添加stats mock
    previewLineSystem.stats = {
      operationCount: 0
    };
    
    // 添加emit方法
    previewLineSystem.emit = () => {};
    
    // 添加hasPreviewLine方法
    previewLineSystem.hasPreviewLine = (id) => {
      return previewLineSystem.stateManager.state.previewLines.has(id);
    };
    
    previewLineSystem.initialized = true;
    console.log('✅ 手动初始化完成');
  } catch (error) {
    console.error('❌ 手动初始化失败:', error);
    throw error;
  }
  })

  it('调试getBranchesFromNode方法', async () => {
    const audienceSplitNode = {
      id: 'audience-split-node',
      getData: () => ({ 
        type: 'audience-split',
        isConfigured: true,
        config: {
          branches: [
            { id: 'branch1', label: '分支1' },
            { id: 'branch2', label: '分支2' },
            { id: 'branch3', label: '分支3' }
          ]
        }
      }),
      getPosition: () => ({ x: 100, y: 100 }),
      getSize: () => ({ width: 120, height: 60 })
    }

    mockGraph.getCellById.mockReturnValue(audienceSplitNode)

    // 测试getBranchesFromNode
    const branches = previewLineSystem.getBranchesFromNode(audienceSplitNode)
    console.log('🔍 获取的分支:', branches)
    
    expect(branches).toHaveLength(3)
    expect(branches[0].id).toBe('branch1')
    expect(branches[1].id).toBe('branch2')
    expect(branches[2].id).toBe('branch3')
  })

  it('调试getConnectedBranches方法', async () => {
    const existingConnections = [
      {
        id: 'conn1',
        source: { cell: 'audience-split-node' },
        target: { cell: 'target1' },
        getData: () => ({ branchId: 'branch1', isPreview: false })
      }
    ]
    mockGraph.getOutgoingEdges.mockReturnValue(existingConnections)

    // 测试getConnectedBranches
    const connectedBranches = previewLineSystem.getConnectedBranches('audience-split-node')
    console.log('🔍 已连接的分支:', Array.from(connectedBranches))
    
    expect(connectedBranches.has('branch1')).toBe(true)
    expect(connectedBranches.has('branch2')).toBe(false)
    expect(connectedBranches.has('branch3')).toBe(false)
  })

  it('调试isBranchNode方法', async () => {
    const audienceSplitNode = {
      id: 'audience-split-node',
      getData: () => ({ 
        type: 'audience-split',
        isConfigured: true,
        config: {
          branches: [
            { id: 'branch1', label: '分支1' },
            { id: 'branch2', label: '分支2' },
            { id: 'branch3', label: '分支3' }
          ]
        }
      })
    }

    const isBranch = previewLineSystem.isBranchNode(audienceSplitNode)
    console.log('🔍 是否为分支节点:', isBranch)
    
    expect(isBranch).toBe(true)
  })

  it('调试完整的createBranchPreviewLines流程', async () => {
    const audienceSplitNode = {
      id: 'audience-split-node',
      getData: () => ({ 
        type: 'audience-split',
        isConfigured: true,
        config: {
          branches: [
            { id: 'branch1', label: '分支1' },
            { id: 'branch2', label: '分支2' },
            { id: 'branch3', label: '分支3' }
          ]
        }
      }),
      getPosition: () => ({ x: 100, y: 100 }),
      getSize: () => ({ width: 120, height: 60 })
    }

    mockGraph.getCellById.mockReturnValue(audienceSplitNode)
    
    const existingConnections = [
      {
        id: 'conn1',
        source: { cell: 'audience-split-node' },
        target: { cell: 'target1' },
        getData: () => ({ branchId: 'branch1', isPreview: false })
      }
    ]
    mockGraph.getOutgoingEdges.mockReturnValue(existingConnections)

    console.log('🔍 开始调试createBranchPreviewLines...')
    
    // 调用createBranchPreviewLines
    const result = await previewLineSystem.createBranchPreviewLines('audience-split-node')
    console.log('🔍 createBranchPreviewLines结果:', result)
    
    // 检查预览线数量
    const previewCount = await previewLineSystem.getPreviewLineCount('audience-split-node')
    console.log('🔍 预览线数量:', previewCount)
    
    // 检查连接线数量
    const connectionCount = await previewLineSystem.getConnectionCount('audience-split-node')
    console.log('🔍 连接线数量:', connectionCount)
    
    // 检查总数量
    const totalCount = await previewLineSystem.getTotalLineCount('audience-split-node')
    console.log('🔍 总数量:', totalCount)
    
    expect(result).toBe(true)
    expect(previewCount).toBe(2) // 应该为branch2和branch3创建预览线
    expect(connectionCount).toBe(1) // 已有的branch1连接
    expect(totalCount).toBe(3) // 总共3条线
  })
})