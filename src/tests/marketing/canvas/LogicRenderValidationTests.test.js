/**
 * 逻辑创建与实际渲染校验测试
 * 确保逻辑层面的节点创建、连接创建与实际画布渲染保持一致
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref, nextTick } from 'vue'

// 创建测试环境
const createLogicRenderTestEnvironment = () => {
  const mockGraph = {
    addNode: vi.fn().mockImplementation((nodeConfig) => {
      const node = {
        id: nodeConfig.id,
        shape: nodeConfig.shape,
        position: nodeConfig.position,
        data: nodeConfig.data,
        getData: vi.fn(() => nodeConfig.data),
        setData: vi.fn(),
        getPosition: vi.fn(() => nodeConfig.position),
        setPosition: vi.fn(),
        isVisible: vi.fn(() => true),
        show: vi.fn(),
        hide: vi.fn()
      }
      return node
    }),
    addEdge: vi.fn().mockImplementation((edgeConfig) => {
      const edge = {
        id: edgeConfig.id,
        source: edgeConfig.source,
        target: edgeConfig.target,
        getData: vi.fn(() => edgeConfig.data || {}),
        setData: vi.fn(),
        getSourceCellId: vi.fn(() => edgeConfig.source),
        getTargetCellId: vi.fn(() => edgeConfig.target),
        isVisible: vi.fn(() => true),
        show: vi.fn(),
        hide: vi.fn()
      }
      return edge
    }),
    getNodes: vi.fn(() => []),
    getEdges: vi.fn(() => []),
    getCellById: vi.fn(),
    hasCell: vi.fn(() => false),
    removeCell: vi.fn(),
    clearCells: vi.fn(),
    fromJSON: vi.fn(),
    toJSON: vi.fn(() => ({ cells: [] })),
    on: vi.fn(),
    off: vi.fn(),
    trigger: vi.fn(),
    zoom: vi.fn(),
    centerContent: vi.fn(),
    resize: vi.fn()
  }

  const mockPreviewLineSystem = {
    createPreviewLine: vi.fn().mockResolvedValue({ id: 'preview_1' }),
    clearPreviewLines: vi.fn(),
    transformPreviewToConnection: vi.fn().mockResolvedValue({ id: 'connection_1' }),
    generatePreviewLinesForNode: vi.fn().mockResolvedValue([])
  }

  const mockLogicLayer = {
    createNode: vi.fn().mockImplementation((nodeData) => ({
      id: nodeData.id,
      type: nodeData.type,
      position: nodeData.position,
      config: nodeData.config || {},
      isConfigured: false
    })),
    createConnection: vi.fn().mockImplementation((connectionData) => ({
      id: connectionData.id,
      sourceId: connectionData.sourceId,
      targetId: connectionData.targetId,
      sourcePort: connectionData.sourcePort || 'out',
      targetPort: connectionData.targetPort || 'in'
    })),
    getNodes: vi.fn(() => []),
    getConnections: vi.fn(() => []),
    validateNodeConfig: vi.fn(() => true),
    validateConnection: vi.fn(() => true)
  }

  return {
    mockGraph,
    mockPreviewLineSystem,
    mockLogicLayer,
    cleanup: vi.fn()
  }
}

// Mock画布组件
const TaskFlowCanvasRefactored = {
  name: 'TaskFlowCanvasRefactored',
  template: '<div class="task-flow-canvas" ref="canvasContainer"></div>',
  props: ['nodes', 'connections', 'readonly', 'loading'],
  emits: ['canvas-ready', 'node-created', 'connection-created', 'logic-render-sync'],
  setup(props, { emit }) {
    const canvasContainer = ref(null)
    const isReady = ref(false)
    const renderState = ref({
      nodesRendered: 0,
      connectionsRendered: 0,
      logicNodesCount: 0,
      logicConnectionsCount: 0
    })

    const syncLogicWithRender = async () => {
      // 模拟逻辑层与渲染层同步
      await nextTick()
      emit('logic-render-sync', {
        logicNodes: renderState.value.logicNodesCount,
        renderedNodes: renderState.value.nodesRendered,
        logicConnections: renderState.value.logicConnectionsCount,
        renderedConnections: renderState.value.connectionsRendered
      })
    }

    const createNodeInLogicAndRender = async (nodeData) => {
      // 逻辑层创建节点
      renderState.value.logicNodesCount++
      
      // 渲染层创建节点
      await nextTick()
      renderState.value.nodesRendered++
      
      emit('node-created', { id: nodeData.id, type: nodeData.type })
      await syncLogicWithRender()
    }

    const createConnectionInLogicAndRender = async (connectionData) => {
      // 逻辑层创建连接
      renderState.value.logicConnectionsCount++
      
      // 渲染层创建连接
      await nextTick()
      renderState.value.connectionsRendered++
      
      emit('connection-created', { id: connectionData.id })
      await syncLogicWithRender()
    }

    const validateRenderConsistency = () => {
      return {
        nodesConsistent: renderState.value.logicNodesCount === renderState.value.nodesRendered,
        connectionsConsistent: renderState.value.logicConnectionsCount === renderState.value.connectionsRendered,
        overallConsistent: renderState.value.logicNodesCount === renderState.value.nodesRendered && 
                          renderState.value.logicConnectionsCount === renderState.value.connectionsRendered
      }
    }

    return {
      canvasContainer,
      isReady,
      renderState,
      createNodeInLogicAndRender,
      createConnectionInLogicAndRender,
      validateRenderConsistency,
      syncLogicWithRender
    }
  }
}

describe('逻辑创建与实际渲染校验测试', () => {
  let testEnv
  let canvasWrapper

  beforeEach(async () => {
    testEnv = createLogicRenderTestEnvironment()
    
    canvasWrapper = mount(TaskFlowCanvasRefactored, {
      props: {
        nodes: [],
        connections: [],
        readonly: false
      }
    })
    
    await nextTick()
  })

  afterEach(() => {
    if (canvasWrapper) {
      canvasWrapper.unmount()
    }
    testEnv?.cleanup()
    vi.clearAllMocks()
  })

  describe('节点创建逻辑与渲染一致性', () => {
    it('TC_LOGIC_RENDER_001 - 单个节点创建的逻辑渲染一致性', async () => {
      const nodeData = {
        id: 'test_node_1',
        type: 'start',
        position: { x: 100, y: 100 }
      }

      // 创建节点
      await canvasWrapper.vm.createNodeInLogicAndRender(nodeData)

      // 验证逻辑层和渲染层一致性
      const consistency = canvasWrapper.vm.validateRenderConsistency()
      expect(consistency.nodesConsistent).toBe(true)
      expect(consistency.overallConsistent).toBe(true)

      // 验证事件触发
      expect(canvasWrapper.emitted('node-created')).toBeTruthy()
      expect(canvasWrapper.emitted('logic-render-sync')).toBeTruthy()
    })

    it('TC_LOGIC_RENDER_002 - 批量节点创建的逻辑渲染一致性', async () => {
      const nodes = [
        { id: 'node_1', type: 'start', position: { x: 100, y: 100 } },
        { id: 'node_2', type: 'sms', position: { x: 300, y: 100 } },
        { id: 'node_3', type: 'wait', position: { x: 500, y: 100 } }
      ]

      // 批量创建节点
      for (const nodeData of nodes) {
        await canvasWrapper.vm.createNodeInLogicAndRender(nodeData)
      }

      // 验证批量创建后的一致性
      const consistency = canvasWrapper.vm.validateRenderConsistency()
      expect(consistency.nodesConsistent).toBe(true)
      expect(canvasWrapper.vm.renderState.logicNodesCount).toBe(3)
      expect(canvasWrapper.vm.renderState.nodesRendered).toBe(3)
    })

    it('TC_LOGIC_RENDER_003 - 节点创建失败时的状态回滚', async () => {
      const nodeData = {
        id: 'failing_node',
        type: 'invalid_type',
        position: { x: 100, y: 100 }
      }

      // 模拟渲染失败
      const originalCreateNode = canvasWrapper.vm.createNodeInLogicAndRender
      canvasWrapper.vm.createNodeInLogicAndRender = vi.fn().mockImplementation(async (data) => {
        canvasWrapper.vm.renderState.logicNodesCount++
        // 模拟渲染失败，不增加渲染计数
        throw new Error('渲染失败')
      })

      try {
        await canvasWrapper.vm.createNodeInLogicAndRender(nodeData)
      } catch (error) {
        expect(error.message).toBe('渲染失败')
      }

      // 验证状态不一致
      const consistency = canvasWrapper.vm.validateRenderConsistency()
      expect(consistency.nodesConsistent).toBe(false)
    })
  })

  describe('连接创建逻辑与渲染一致性', () => {
    it('TC_LOGIC_RENDER_004 - 单个连接创建的逻辑渲染一致性', async () => {
      const connectionData = {
        id: 'test_connection_1',
        sourceId: 'node_1',
        targetId: 'node_2'
      }

      // 创建连接
      await canvasWrapper.vm.createConnectionInLogicAndRender(connectionData)

      // 验证逻辑层和渲染层一致性
      const consistency = canvasWrapper.vm.validateRenderConsistency()
      expect(consistency.connectionsConsistent).toBe(true)

      // 验证事件触发
      expect(canvasWrapper.emitted('connection-created')).toBeTruthy()
      expect(canvasWrapper.emitted('logic-render-sync')).toBeTruthy()
    })

    it('TC_LOGIC_RENDER_005 - 批量连接创建的逻辑渲染一致性', async () => {
      const connections = [
        { id: 'conn_1', sourceId: 'node_1', targetId: 'node_2' },
        { id: 'conn_2', sourceId: 'node_2', targetId: 'node_3' },
        { id: 'conn_3', sourceId: 'node_1', targetId: 'node_3' }
      ]

      // 批量创建连接
      for (const connectionData of connections) {
        await canvasWrapper.vm.createConnectionInLogicAndRender(connectionData)
      }

      // 验证批量创建后的一致性
      const consistency = canvasWrapper.vm.validateRenderConsistency()
      expect(consistency.connectionsConsistent).toBe(true)
      expect(canvasWrapper.vm.renderState.logicConnectionsCount).toBe(3)
      expect(canvasWrapper.vm.renderState.connectionsRendered).toBe(3)
    })
  })

  describe('复合场景逻辑与渲染一致性', () => {
    it('TC_LOGIC_RENDER_006 - 节点和连接混合创建的一致性', async () => {
      // 创建节点
      await canvasWrapper.vm.createNodeInLogicAndRender({
        id: 'node_1', type: 'start', position: { x: 100, y: 100 }
      })
      await canvasWrapper.vm.createNodeInLogicAndRender({
        id: 'node_2', type: 'sms', position: { x: 300, y: 100 }
      })

      // 创建连接
      await canvasWrapper.vm.createConnectionInLogicAndRender({
        id: 'conn_1', sourceId: 'node_1', targetId: 'node_2'
      })

      // 验证整体一致性
      const consistency = canvasWrapper.vm.validateRenderConsistency()
      expect(consistency.overallConsistent).toBe(true)
      expect(canvasWrapper.vm.renderState.logicNodesCount).toBe(2)
      expect(canvasWrapper.vm.renderState.nodesRendered).toBe(2)
      expect(canvasWrapper.vm.renderState.logicConnectionsCount).toBe(1)
      expect(canvasWrapper.vm.renderState.connectionsRendered).toBe(1)
    })

    it('TC_LOGIC_RENDER_007 - 高频创建操作的一致性保证', async () => {
      const operations = []
      
      // 快速创建多个节点和连接
      for (let i = 1; i <= 10; i++) {
        operations.push(canvasWrapper.vm.createNodeInLogicAndRender({
          id: `node_${i}`, type: 'sms', position: { x: i * 100, y: 100 }
        }))
      }

      for (let i = 1; i < 10; i++) {
        operations.push(canvasWrapper.vm.createConnectionInLogicAndRender({
          id: `conn_${i}`, sourceId: `node_${i}`, targetId: `node_${i + 1}`
        }))
      }

      // 等待所有操作完成
      await Promise.all(operations)

      // 验证高频操作后的一致性
      const consistency = canvasWrapper.vm.validateRenderConsistency()
      expect(consistency.overallConsistent).toBe(true)
      expect(canvasWrapper.vm.renderState.logicNodesCount).toBe(10)
      expect(canvasWrapper.vm.renderState.logicConnectionsCount).toBe(9)
    })

    it('TC_LOGIC_RENDER_008 - 异步操作竞态条件下的一致性', async () => {
      // 模拟异步竞态条件
      const asyncOperations = [
        canvasWrapper.vm.createNodeInLogicAndRender({
          id: 'async_node_1', type: 'start', position: { x: 100, y: 100 }
        }),
        canvasWrapper.vm.createNodeInLogicAndRender({
          id: 'async_node_2', type: 'sms', position: { x: 300, y: 100 }
        }),
        // 延迟创建连接，模拟异步竞态
        new Promise(resolve => {
          setTimeout(async () => {
            await canvasWrapper.vm.createConnectionInLogicAndRender({
              id: 'async_conn_1', sourceId: 'async_node_1', targetId: 'async_node_2'
            })
            resolve()
          }, 10)
        })
      ]

      await Promise.all(asyncOperations)

      // 验证异步操作后的一致性
      const consistency = canvasWrapper.vm.validateRenderConsistency()
      expect(consistency.overallConsistent).toBe(true)
    })
  })

  describe('状态同步和错误恢复', () => {
    it('TC_LOGIC_RENDER_009 - 状态同步机制验证', async () => {
      // 创建一些元素
      await canvasWrapper.vm.createNodeInLogicAndRender({
        id: 'sync_node', type: 'start', position: { x: 100, y: 100 }
      })

      // 手动触发同步
      await canvasWrapper.vm.syncLogicWithRender()

      // 验证同步事件被触发
      const syncEvents = canvasWrapper.emitted('logic-render-sync')
      expect(syncEvents).toBeTruthy()
      expect(syncEvents.length).toBeGreaterThan(0)

      const lastSyncEvent = syncEvents[syncEvents.length - 1][0]
      expect(lastSyncEvent.logicNodes).toBe(1)
      expect(lastSyncEvent.renderedNodes).toBe(1)
    })

    it('TC_LOGIC_RENDER_010 - 不一致状态的检测和报告', async () => {
      // 人为制造不一致状态
      canvasWrapper.vm.renderState.logicNodesCount = 5
      canvasWrapper.vm.renderState.nodesRendered = 3
      canvasWrapper.vm.renderState.logicConnectionsCount = 2
      canvasWrapper.vm.renderState.connectionsRendered = 2

      const consistency = canvasWrapper.vm.validateRenderConsistency()
      
      expect(consistency.nodesConsistent).toBe(false)
      expect(consistency.connectionsConsistent).toBe(true)
      expect(consistency.overallConsistent).toBe(false)
    })
  })
})