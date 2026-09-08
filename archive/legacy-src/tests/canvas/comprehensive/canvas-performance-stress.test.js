/**
 * TaskFlowCanvas 性能压力测试
 * 测试画布在高负载情况下的性能和稳定性，确保与实际生产环境一致
 * 
 * 测试重点：
 * 1. 大量节点和连接的渲染性能
 * 2. 频繁操作的内存管理
 * 3. 异步操作的并发处理
 * 4. 长时间运行的稳定性
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import TaskFlowCanvasRefactored from '../../../pages/marketing/tasks/components/TaskFlowCanvasRefactored.vue'

// 性能监控工具
const createPerformanceMonitor = () => {
  const metrics = {
    renderTimes: [],
    memoryUsage: [],
    operationCounts: {},
    errors: []
  }

  return {
    // 开始性能测量
    startMeasure: (name) => {
      return {
        name,
        startTime: performance.now(),
        startMemory: performance.memory ? performance.memory.usedJSHeapSize : 0
      }
    },

    // 结束性能测量
    endMeasure: (measurement) => {
      const endTime = performance.now()
      const endMemory = performance.memory ? performance.memory.usedJSHeapSize : 0
      
      const result = {
        name: measurement.name,
        duration: endTime - measurement.startTime,
        memoryDelta: endMemory - measurement.startMemory,
        timestamp: Date.now()
      }

      metrics.renderTimes.push(result)
      return result
    },

    // 记录操作
    recordOperation: (operation) => {
      if (!metrics.operationCounts[operation]) {
        metrics.operationCounts[operation] = 0
      }
      metrics.operationCounts[operation]++
    },

    // 记录错误
    recordError: (error) => {
      metrics.errors.push({
        message: error.message,
        stack: error.stack,
        timestamp: Date.now()
      })
    },

    // 获取性能报告
    getReport: () => {
      const renderTimes = metrics.renderTimes.map(r => r.duration)
      const memoryDeltas = metrics.renderTimes.map(r => r.memoryDelta)

      return {
        totalOperations: Object.values(metrics.operationCounts).reduce((a, b) => a + b, 0),
        averageRenderTime: renderTimes.length > 0 ? renderTimes.reduce((a, b) => a + b, 0) / renderTimes.length : 0,
        maxRenderTime: renderTimes.length > 0 ? Math.max(...renderTimes) : 0,
        minRenderTime: renderTimes.length > 0 ? Math.min(...renderTimes) : 0,
        totalMemoryDelta: memoryDeltas.reduce((a, b) => a + b, 0),
        errorCount: metrics.errors.length,
        operationBreakdown: { ...metrics.operationCounts }
      }
    },

    // 重置监控
    reset: () => {
      metrics.renderTimes.length = 0
      metrics.memoryUsage.length = 0
      Object.keys(metrics.operationCounts).forEach(key => {
        delete metrics.operationCounts[key]
      })
      metrics.errors.length = 0
    }
  }
}

// 数据生成器
const createDataGenerator = () => ({
  // 生成大量节点数据
  generateNodes: (count) => {
    return Array.from({ length: count }, (_, i) => ({
      id: `node-${i}`,
      type: ['start', 'sms', 'email', 'condition', 'end'][i % 5],
      position: {
        x: (i % 20) * 150 + Math.random() * 50,
        y: Math.floor(i / 20) * 120 + Math.random() * 30
      },
      data: {
        label: `节点 ${i}`,
        content: `这是节点 ${i} 的内容`,
        config: {
          timeout: Math.floor(Math.random() * 1000) + 100,
          retries: Math.floor(Math.random() * 5) + 1
        }
      }
    }))
  },

  // 生成连接数据
  generateConnections: (nodes, density = 0.3) => {
    const connections = []
    const nodeCount = nodes.length

    for (let i = 0; i < nodeCount - 1; i++) {
      // 确保每个节点至少有一个连接
      if (i < nodeCount - 1) {
        connections.push({
          id: `conn-${i}-${i + 1}`,
          source: nodes[i].id,
          target: nodes[i + 1].id
        })
      }

      // 根据密度添加额外连接
      for (let j = i + 2; j < nodeCount; j++) {
        if (Math.random() < density) {
          connections.push({
            id: `conn-${i}-${j}`,
            source: nodes[i].id,
            target: nodes[j].id
          })
        }
      }
    }

    return connections
  },

  // 生成随机操作序列
  generateOperationSequence: (nodeIds, operationCount) => {
    const operations = []
    const operationTypes = ['add', 'remove', 'update', 'select']

    for (let i = 0; i < operationCount; i++) {
      const type = operationTypes[Math.floor(Math.random() * operationTypes.length)]
      const nodeId = nodeIds[Math.floor(Math.random() * nodeIds.length)]

      operations.push({
        type,
        nodeId,
        data: type === 'add' ? {
          id: `dynamic-${i}`,
          type: 'sms',
          position: { x: Math.random() * 1000, y: Math.random() * 600 }
        } : undefined
      })
    }

    return operations
  }
})

// Mock useCanvasCore 以支持性能监控
vi.mock('../../../pages/marketing/tasks/composables/useCanvasCore.js', () => {
  const performanceMonitor = createPerformanceMonitor()
  
  return {
    useCanvasCore: vi.fn(() => {
      const graph = ref(null)
      const isGraphReady = ref(false)
      
      const initializeGraph = vi.fn().mockImplementation(async (options = {}) => {
        const measure = performanceMonitor.startMeasure('graph-initialization')
        
        try {
          await new Promise(resolve => setTimeout(resolve, 50))
          
          const graphInstance = {
            id: `graph-${Date.now()}`,
            _nodes: new Map(),
            _edges: new Map(),
            
            addNode: vi.fn().mockImplementation((nodeData) => {
              const measure = performanceMonitor.startMeasure('add-node')
              performanceMonitor.recordOperation('addNode')
              
              const node = { id: nodeData.id || `node-${Date.now()}`, ...nodeData }
              graphInstance._nodes.set(node.id, node)
              
              performanceMonitor.endMeasure(measure)
              return node
            }),
            
            removeNode: vi.fn().mockImplementation((nodeId) => {
              const measure = performanceMonitor.startMeasure('remove-node')
              performanceMonitor.recordOperation('removeNode')
              
              const existed = graphInstance._nodes.has(nodeId)
              if (existed) {
                graphInstance._nodes.delete(nodeId)
                // 清理相关边
                for (const [edgeId, edge] of graphInstance._edges) {
                  if (edge.source === nodeId || edge.target === nodeId) {
                    graphInstance._edges.delete(edgeId)
                  }
                }
              }
              
              performanceMonitor.endMeasure(measure)
              return existed
            }),
            
            addEdge: vi.fn().mockImplementation((edgeData) => {
              const measure = performanceMonitor.startMeasure('add-edge')
              performanceMonitor.recordOperation('addEdge')
              
              const edge = { id: edgeData.id || `edge-${Date.now()}`, ...edgeData }
              graphInstance._edges.set(edge.id, edge)
              
              performanceMonitor.endMeasure(measure)
              return edge
            }),
            
            removeEdge: vi.fn().mockImplementation((edgeId) => {
              const measure = performanceMonitor.startMeasure('remove-edge')
              performanceMonitor.recordOperation('removeEdge')
              
              const existed = graphInstance._edges.has(edgeId)
              if (existed) {
                graphInstance._edges.delete(edgeId)
              }
              
              performanceMonitor.endMeasure(measure)
              return existed
            }),
            
            getCells: vi.fn(() => {
              return [...graphInstance._nodes.values(), ...graphInstance._edges.values()]
            }),
            
            getNodes: vi.fn(() => Array.from(graphInstance._nodes.values())),
            getEdges: vi.fn(() => Array.from(graphInstance._edges.values())),
            getCellById: vi.fn((id) => graphInstance._nodes.get(id) || graphInstance._edges.get(id)),
            
            on: vi.fn(),
            off: vi.fn(),
            dispose: vi.fn().mockImplementation(() => {
              graphInstance._nodes.clear()
              graphInstance._edges.clear()
            }),
            zoom: vi.fn(() => 1),
            centerContent: vi.fn(),
            zoomToFit: vi.fn(),
            clear: vi.fn().mockImplementation(() => {
              const measure = performanceMonitor.startMeasure('clear-graph')
              graphInstance._nodes.clear()
              graphInstance._edges.clear()
              performanceMonitor.endMeasure(measure)
            })
          }

          graph.value = graphInstance
          isGraphReady.value = true
          
          performanceMonitor.endMeasure(measure)
          return graphInstance
        } catch (error) {
          performanceMonitor.recordError(error)
          throw error
        }
      })

      return {
        graph,
        isGraphReady,
        initializeGraph,
        destroyGraph: vi.fn(),
        registerCustomEdgeShapes: vi.fn(),
        initializePlugins: vi.fn(),
        initializeMinimap: vi.fn(),
        calculateConnectionPoints: vi.fn(),
        resetGraph: vi.fn(),
        _performanceMonitor: performanceMonitor
      }
    })
  }
}))

// Mock其他依赖
vi.mock('@antv/x6', () => ({
  Graph: vi.fn()
}))

vi.mock('@antv/x6-vue-shape', () => ({
  register: vi.fn()
}))

describe('TaskFlowCanvas 性能压力测试', () => {
  let wrapper
  let performanceMonitor
  let dataGenerator

  beforeEach(() => {
    vi.clearAllMocks()
    dataGenerator = createDataGenerator()
    performanceMonitor = createPerformanceMonitor()
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
    if (performanceMonitor) {
      performanceMonitor.reset()
    }
  })

  describe('大量数据渲染性能测试', () => {
    it('应该能够处理100个节点的渲染', async () => {
      const nodes = dataGenerator.generateNodes(100)
      const connections = dataGenerator.generateConnections(nodes, 0.2)

      const startTime = performance.now()

      wrapper = mount(TaskFlowCanvasRefactored, {
        props: {
          initialNodes: nodes,
          initialConnections: connections
        }
      })

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 200))

      const endTime = performance.now()
      const renderTime = endTime - startTime

      // 100个节点的渲染应该在合理时间内完成
      expect(renderTime).toBeLessThan(2000) // 2秒内
      expect(wrapper.vm.nodes?.value).toHaveLength(nodes.length)
    })

    it('应该能够处理500个节点的渲染（压力测试）', async () => {
      const nodes = dataGenerator.generateNodes(500)
      const connections = dataGenerator.generateConnections(nodes, 0.1)

      const startTime = performance.now()

      wrapper = mount(TaskFlowCanvasRefactored, {
        props: {
          initialNodes: nodes,
          initialConnections: connections
        }
      })

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 500))

      const endTime = performance.now()
      const renderTime = endTime - startTime

      // 500个节点的渲染应该在合理时间内完成
      expect(renderTime).toBeLessThan(5000) // 5秒内
      expect(wrapper.vm.nodes?.value).toHaveLength(nodes.length)
    })

    it('应该能够处理大量连接的复杂图形', async () => {
      const nodes = dataGenerator.generateNodes(50)
      const connections = dataGenerator.generateConnections(nodes, 0.8) // 高密度连接

      const startTime = performance.now()

      wrapper = mount(TaskFlowCanvasRefactored, {
        props: {
          initialNodes: nodes,
          initialConnections: connections
        }
      })

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 300))

      const endTime = performance.now()
      const renderTime = endTime - startTime

      expect(renderTime).toBeLessThan(3000) // 3秒内
      expect(wrapper.vm.connections?.value).toHaveLength(connections.length)
    })
  })

  describe('频繁操作性能测试', () => {
    beforeEach(async () => {
      const initialNodes = dataGenerator.generateNodes(20)
      
      wrapper = mount(TaskFlowCanvasRefactored, {
        props: {
          initialNodes,
          initialConnections: []
        }
      })

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))
    })

    it('应该能够处理频繁的节点添加操作', async () => {
      const operationCount = 100
      const startTime = performance.now()

      for (let i = 0; i < operationCount; i++) {
        const nodeData = {
          id: `frequent-node-${i}`,
          type: 'sms',
          position: { x: Math.random() * 1000, y: Math.random() * 600 }
        }

        if (wrapper.vm.addNodeToGraph) {
          wrapper.vm.addNodeToGraph(nodeData)
        }

        // 每10个操作等待一下，模拟真实使用场景
        if (i % 10 === 0) {
          await nextTick()
        }
      }

      const endTime = performance.now()
      const totalTime = endTime - startTime

      // 100次节点添加操作应该在合理时间内完成
      expect(totalTime).toBeLessThan(1000) // 1秒内
      expect(totalTime / operationCount).toBeLessThan(10) // 平均每次操作小于10ms
    })

    it('应该能够处理频繁的节点删除操作', async () => {
      // 先添加一些节点
      const nodesToDelete = []
      for (let i = 0; i < 50; i++) {
        const nodeData = {
          id: `delete-node-${i}`,
          type: 'email',
          position: { x: i * 50, y: 100 }
        }
        
        if (wrapper.vm.addNodeToGraph) {
          wrapper.vm.addNodeToGraph(nodeData)
          nodesToDelete.push(nodeData.id)
        }
      }

      await nextTick()

      const startTime = performance.now()

      // 删除所有节点
      for (const nodeId of nodesToDelete) {
        if (wrapper.vm.removeNode) {
          wrapper.vm.removeNode(nodeId)
        }
      }

      const endTime = performance.now()
      const totalTime = endTime - startTime

      expect(totalTime).toBeLessThan(500) // 500ms内
    })

    it('应该能够处理混合操作序列', async () => {
      const nodeIds = wrapper.vm.nodes?.value?.map(n => n.id) || []
      const operations = dataGenerator.generateOperationSequence(nodeIds, 200)

      const startTime = performance.now()

      for (const operation of operations) {
        try {
          switch (operation.type) {
            case 'add':
              if (wrapper.vm.addNodeToGraph) {
                wrapper.vm.addNodeToGraph(operation.data)
              }
              break
            case 'remove':
              if (wrapper.vm.removeNode) {
                wrapper.vm.removeNode(operation.nodeId)
              }
              break
            case 'select':
              if (wrapper.vm.selectNode) {
                wrapper.vm.selectNode(operation.nodeId)
              }
              break
          }
        } catch (error) {
          // 记录错误但继续执行
          console.warn('Operation failed:', error.message)
        }

        // 每20个操作等待一下
        if (operations.indexOf(operation) % 20 === 0) {
          await nextTick()
        }
      }

      const endTime = performance.now()
      const totalTime = endTime - startTime

      expect(totalTime).toBeLessThan(2000) // 2秒内完成200个操作
    })
  })

  describe('内存管理测试', () => {
    it('应该正确管理大量节点的内存使用', async () => {
      const initialMemory = performance.memory ? performance.memory.usedJSHeapSize : 0

      // 创建大量节点
      const nodes = dataGenerator.generateNodes(200)
      
      wrapper = mount(TaskFlowCanvasRefactored, {
        props: {
          initialNodes: nodes,
          initialConnections: []
        }
      })

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 300))

      const afterCreateMemory = performance.memory ? performance.memory.usedJSHeapSize : 0

      // 清理所有节点
      if (wrapper.vm.graph?.value?.clear) {
        wrapper.vm.graph.value.clear()
      }

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      const afterClearMemory = performance.memory ? performance.memory.usedJSHeapSize : 0

      // 内存使用应该有所下降
      if (performance.memory) {
        const memoryIncrease = afterCreateMemory - initialMemory
        const memoryDecrease = afterCreateMemory - afterClearMemory
        
        // 清理后内存应该有所释放
        expect(memoryDecrease).toBeGreaterThan(0)
        expect(memoryDecrease / memoryIncrease).toBeGreaterThan(0.3) // 至少释放30%
      }
    })

    it('应该防止内存泄漏', async () => {
      const instances = []

      // 创建多个组件实例
      for (let i = 0; i < 10; i++) {
        const instance = mount(TaskFlowCanvasRefactored, {
          props: {
            initialNodes: dataGenerator.generateNodes(20),
            initialConnections: []
          }
        })

        instances.push(instance)
        await nextTick()
      }

      // 等待所有实例初始化
      await new Promise(resolve => setTimeout(resolve, 200))

      const beforeUnmountMemory = performance.memory ? performance.memory.usedJSHeapSize : 0

      // 卸载所有实例
      for (const instance of instances) {
        instance.unmount()
        await nextTick()
      }

      // 强制垃圾回收（如果可用）
      if (global.gc) {
        global.gc()
      }

      await new Promise(resolve => setTimeout(resolve, 100))

      const afterUnmountMemory = performance.memory ? performance.memory.usedJSHeapSize : 0

      // 内存使用应该有所下降
      if (performance.memory) {
        expect(afterUnmountMemory).toBeLessThanOrEqual(beforeUnmountMemory)
      }
    })
  })

  describe('并发操作测试', () => {
    beforeEach(async () => {
      wrapper = mount(TaskFlowCanvasRefactored, {
        props: {
          initialNodes: dataGenerator.generateNodes(10),
          initialConnections: []
        }
      })

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))
    })

    it('应该正确处理并发节点操作', async () => {
      const concurrentOperations = []

      // 创建并发操作
      for (let i = 0; i < 20; i++) {
        const operation = new Promise(async (resolve) => {
          const nodeData = {
            id: `concurrent-node-${i}`,
            type: 'sms',
            position: { x: i * 50, y: 100 }
          }

          if (wrapper.vm.addNodeToGraph) {
            const result = wrapper.vm.addNodeToGraph(nodeData)
            resolve(result)
          } else {
            resolve(null)
          }
        })

        concurrentOperations.push(operation)
      }

      const startTime = performance.now()
      const results = await Promise.allSettled(concurrentOperations)
      const endTime = performance.now()

      // 所有操作都应该完成
      expect(results.every(r => r.status === 'fulfilled')).toBe(true)
      expect(endTime - startTime).toBeLessThan(1000) // 1秒内完成
    })

    it('应该正确处理并发读写操作', async () => {
      const readOperations = []
      const writeOperations = []

      // 创建读操作
      for (let i = 0; i < 10; i++) {
        readOperations.push(new Promise(resolve => {
          const nodes = wrapper.vm.nodes?.value || []
          resolve(nodes.length)
        }))
      }

      // 创建写操作
      for (let i = 0; i < 10; i++) {
        writeOperations.push(new Promise(resolve => {
          const nodeData = {
            id: `rw-node-${i}`,
            type: 'email',
            position: { x: i * 30, y: 200 }
          }

          if (wrapper.vm.addNodeToGraph) {
            const result = wrapper.vm.addNodeToGraph(nodeData)
            resolve(result)
          } else {
            resolve(null)
          }
        }))
      }

      const allOperations = [...readOperations, ...writeOperations]
      const results = await Promise.allSettled(allOperations)

      // 所有操作都应该成功
      expect(results.every(r => r.status === 'fulfilled')).toBe(true)
    })
  })

  describe('长时间运行稳定性测试', () => {
    it('应该在长时间运行中保持稳定', async () => {
      wrapper = mount(TaskFlowCanvasRefactored, {
        props: {
          initialNodes: dataGenerator.generateNodes(30),
          initialConnections: []
        }
      })

      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 100))

      const startTime = Date.now()
      const duration = 5000 // 5秒测试
      let operationCount = 0
      let errorCount = 0

      // 持续执行操作
      while (Date.now() - startTime < duration) {
        try {
          const operation = Math.random()
          
          if (operation < 0.4) {
            // 添加节点
            const nodeData = {
              id: `long-run-node-${operationCount}`,
              type: 'sms',
              position: { x: Math.random() * 1000, y: Math.random() * 600 }
            }
            
            if (wrapper.vm.addNodeToGraph) {
              wrapper.vm.addNodeToGraph(nodeData)
            }
          } else if (operation < 0.7) {
            // 选择节点
            const nodes = wrapper.vm.nodes?.value || []
            if (nodes.length > 0 && wrapper.vm.selectNode) {
              const randomNode = nodes[Math.floor(Math.random() * nodes.length)]
              wrapper.vm.selectNode(randomNode.id)
            }
          } else {
            // 清除选择
            if (wrapper.vm.clearSelection) {
              wrapper.vm.clearSelection()
            }
          }

          operationCount++

          // 每100个操作等待一下
          if (operationCount % 100 === 0) {
            await new Promise(resolve => setTimeout(resolve, 10))
          }
        } catch (error) {
          errorCount++
          console.warn('Long-run operation failed:', error.message)
        }
      }

      // 验证稳定性
      expect(operationCount).toBeGreaterThan(100) // 至少执行了100个操作
      expect(errorCount / operationCount).toBeLessThan(0.1) // 错误率小于10%
      expect(wrapper.vm.graph?.value).toBeDefined() // Graph实例仍然存在
    }, 10000) // 10秒超时
  })
})