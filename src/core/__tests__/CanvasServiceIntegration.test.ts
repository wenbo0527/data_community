import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { CanvasServiceIntegration } from '../CanvasServiceIntegration'
import { CanvasEventBus } from '../CanvasEventBus'
import { CanvasEventTypes } from '../CanvasEventTypes'
import type { ServiceIntegrationConfig, LegacyEventBridge } from '../CanvasServiceIntegration'

describe('CanvasServiceIntegration', () => {
  let serviceIntegration: CanvasServiceIntegration
  let eventBus: CanvasEventBus
  let mockLegacyEventBus: any

  beforeEach(() => {
    eventBus = new CanvasEventBus()
    mockLegacyEventBus = {
      emit: vi.fn(),
      on: vi.fn(),
      off: vi.fn()
    }
    
    const config: ServiceIntegrationConfig = {
      eventBus,
      legacyEventBus: mockLegacyEventBus,
      adapters: {},
      enableBridge: true,
      enableValidation: true,
      enableSync: true
    }

    serviceIntegration = new CanvasServiceIntegration(config)
  })

  afterEach(() => {
    serviceIntegration.destroy()
    eventBus.destroy()
  })

  describe('服务集成配置', () => {
    it('应该正确初始化服务集成', () => {
      expect(serviceIntegration).toBeDefined()
      expect(serviceIntegration.isInitialized()).toBe(true)
    })

    it('应该支持自定义配置', () => {
      const customConfig: ServiceIntegrationConfig = {
        eventBus,
        legacyEventBus: mockLegacyEventBus,
        adapters: {},
        enableBridge: false,
        enableValidation: false,
        enableSync: false
      }

      const customIntegration = new CanvasServiceIntegration(customConfig)
      expect(customIntegration.isInitialized()).toBe(true)
      customIntegration.destroy()
    })
  })

  describe('事件桥接', () => {
    it('应该将新事件系统事件桥接到旧系统', () => {
      const newEvent = {
        type: CanvasEventTypes.NODE_ADDED,
        payload: { id: 'node1', type: 'start' },
        timestamp: Date.now(),
        source: 'test'
      }

      serviceIntegration.bridgeEvent('node.added', newEvent)

      expect(mockLegacyEventBus.emit).toHaveBeenCalledWith(
        'node-added',
        expect.objectContaining({
          nodeId: 'node1',
          nodeType: 'start'
        })
      )
    })

    it('应该将旧系统事件桥接到新系统', () => {
      const emitSpy = vi.spyOn(eventBus, 'emit')
      
      const legacyEvent = {
        nodeId: 'node1',
        nodeType: 'start',
        position: { x: 100, y: 200 }
      }

      serviceIntegration.bridgeLegacyEvent('node-added', legacyEvent)

      expect(emitSpy).toHaveBeenCalledWith(
        CanvasEventTypes.NODE_ADDED,
        expect.objectContaining({
          type: CanvasEventTypes.NODE_ADDED,
          payload: expect.objectContaining({
            id: 'node1',
            type: 'start'
          })
        })
      )
    })

    it('应该处理复杂的事件映射', () => {
      const emitSpy = vi.spyOn(eventBus, 'emit')
      
      const legacyKeyboardEvent = {
        key: 'Delete',
        target: document.body
      }

      serviceIntegration.bridgeLegacyEvent('keyboard-delete-executed', legacyKeyboardEvent)

      expect(emitSpy).toHaveBeenCalledWith(
        CanvasEventTypes.KEYBOARD_DELETE_PRESSED,
        expect.objectContaining({
          type: CanvasEventTypes.KEYBOARD_DELETE_PRESSED,
          payload: expect.objectContaining({
            key: 'Delete'
          })
        })
      )
    })
  })

  describe('事件验证', () => {
    it('应该验证桥接的事件', () => {
      const invalidEvent = {
        type: CanvasEventTypes.NODE_ADDED,
        payload: { invalid: true }, // 缺少必需的字段
        timestamp: Date.now(),
        source: 'test'
      }

      const result = serviceIntegration.validateEvent(invalidEvent)
      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(1)
    })

    it('应该通过有效的事件', () => {
      const validEvent = {
        type: CanvasEventTypes.NODE_ADDED,
        payload: { id: 'node1', type: 'start' },
        timestamp: Date.now(),
        source: 'test'
      }

      const result = serviceIntegration.validateEvent(validEvent)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })
  })

  describe('状态同步', () => {
    it('应该同步节点状态', () => {
      const nodeState = {
        id: 'node1',
        type: 'start',
        position: { x: 100, y: 200 },
        data: { label: '开始节点' }
      }

      serviceIntegration.syncNodeState('node1', nodeState)

      // 验证状态是否被正确同步
      const syncedState = serviceIntegration.getNodeState('node1')
      expect(syncedState).toEqual(nodeState)
    })

    it('应该同步连接状态', () => {
      const connectionState = {
        id: 'edge1',
        source: 'node1',
        target: 'node2',
        sourcePort: 'port1',
        targetPort: 'port2'
      }

      serviceIntegration.syncConnectionState('edge1', connectionState)

      const syncedState = serviceIntegration.getConnectionState('edge1')
      expect(syncedState).toEqual(connectionState)
    })

    it('应该同步画布状态', () => {
      const canvasState = {
        nodes: [
          { id: 'node1', type: 'start', position: { x: 100, y: 200 } },
          { id: 'node2', type: 'end', position: { x: 300, y: 200 } }
        ],
        connections: [
          { id: 'edge1', source: 'node1', target: 'node2' }
        ]
      }

      serviceIntegration.syncCanvasState(canvasState)

      const syncedState = serviceIntegration.getCanvasState()
      expect(syncedState).toEqual(canvasState)
    })
  })

  describe('适配器管理', () => {
    it('应该注册和使用自定义适配器', () => {
      const mockAdapter = {
        name: 'TestAdapter',
        initialize: vi.fn(),
        destroy: vi.fn(),
        syncState: vi.fn()
      }

      serviceIntegration.registerAdapter('test', mockAdapter)
      serviceIntegration.initializeAdapter('test')

      expect(mockAdapter.initialize).toHaveBeenCalled()
    })

    it('应该处理 Vuex 状态适配器', () => {
      const mockStore = {
        state: {
          canvas: {
            nodes: [],
            connections: []
          }
        },
        commit: vi.fn(),
        dispatch: vi.fn()
      }

      serviceIntegration.registerVuexAdapter(mockStore)
      
      // 验证适配器是否被正确注册
      const adapter = serviceIntegration.getAdapter('vuex')
      expect(adapter).toBeDefined()
      expect(adapter.name).toBe('VuexStateAdapter')
    })

    it('应该处理 AntV X6 图形适配器', () => {
      const mockGraph = {
        addNode: vi.fn(),
        removeNode: vi.fn(),
        addEdge: vi.fn(),
        removeEdge: vi.fn(),
        getNodes: vi.fn(() => []),
        getEdges: vi.fn(() => [])
      }

      serviceIntegration.registerAntVX6Adapter(mockGraph)
      
      const adapter = serviceIntegration.getAdapter('antv-x6')
      expect(adapter).toBeDefined()
      expect(adapter.name).toBe('AntVX6Adapter')
    })
  })

  describe('错误处理', () => {
    it('应该处理适配器初始化错误', () => {
      const errorAdapter = {
        name: 'ErrorAdapter',
        initialize: vi.fn(() => {
          throw new Error('Initialization failed')
        }),
        destroy: vi.fn(),
        syncState: vi.fn()
      }

      serviceIntegration.registerAdapter('error', errorAdapter)
      
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      serviceIntegration.initializeAdapter('error')

      expect(consoleSpy).toHaveBeenCalledWith(
        '适配器初始化失败:',
        expect.any(Error)
      )

      consoleSpy.mockRestore()
    })

    it('应该处理事件桥接错误', () => {
      mockLegacyEventBus.emit.mockImplementation(() => {
        throw new Error('Bridge error')
      })

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      const event = {
        type: CanvasEventTypes.NODE_ADDED,
        payload: { id: 'node1', type: 'start' },
        timestamp: Date.now(),
        source: 'test'
      }

      serviceIntegration.bridgeEvent('node.added', event)

      expect(consoleSpy).toHaveBeenCalledWith(
        '事件桥接失败:',
        expect.any(Error)
      )

      consoleSpy.mockRestore()
    })
  })

  describe('性能统计', () => {
    it('应该记录集成统计信息', () => {
      const event = {
        type: CanvasEventTypes.NODE_ADDED,
        payload: { id: 'node1', type: 'start' },
        timestamp: Date.now(),
        source: 'test'
      }

      serviceIntegration.bridgeEvent('node.added', event)
      serviceIntegration.bridgeLegacyEvent('node-added', { nodeId: 'node1' })

      const stats = serviceIntegration.getStats()
      expect(stats.eventsBridged).toBe(2)
      expect(stats.bridgeStats['node.added']).toBe(1)
      expect(stats.bridgeStats['node-added']).toBe(1)
    })
  })

  describe('内存管理', () => {
    it('应该正确清理资源', () => {
      const mockAdapter = {
        name: 'TestAdapter',
        initialize: vi.fn(),
        destroy: vi.fn(),
        syncState: vi.fn()
      }

      serviceIntegration.registerAdapter('test', mockAdapter)
      serviceIntegration.destroy()

      expect(mockAdapter.destroy).toHaveBeenCalled()
    })
  })
})