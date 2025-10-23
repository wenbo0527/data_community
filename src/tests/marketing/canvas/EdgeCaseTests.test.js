import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref, nextTick } from 'vue'

// Mock X6 Graph for edge case testing
const mockGraph = {
  addEdge: vi.fn().mockReturnValue({ id: 'edge_123' }),
  removeEdge: vi.fn(),
  getCellById: vi.fn(),
  getEdges: vi.fn().mockReturnValue([]),
  getNodes: vi.fn().mockReturnValue([]),
  on: vi.fn(),
  off: vi.fn(),
  trigger: vi.fn(),
  toJSON: vi.fn().mockReturnValue({ cells: [] }),
  fromJSON: vi.fn(),
  clearCells: vi.fn(),
  addNode: vi.fn(),
  removeNode: vi.fn(),
  // 预览线相关方法
  addPreviewEdge: vi.fn().mockImplementation((config) => ({ id: config.id || 'preview_edge_123' })),
  removePreviewEdge: vi.fn(),
  updatePreviewEdge: vi.fn(),
  getPreviewEdges: vi.fn().mockReturnValue([]),
  // 端口相关方法
  getNodePorts: vi.fn().mockReturnValue({ in: ['in1'], out: ['out1'] }),
  // 拖拽和吸附相关方法
  startDrag: vi.fn(),
  endDrag: vi.fn(),
  attachToPort: vi.fn(),
  detachFromPort: vi.fn(),
  findNearestPort: vi.fn(),
  // 布局相关方法
  layoutNodes: vi.fn(),
  getNodePosition: vi.fn().mockReturnValue({ x: 100, y: 100 }),
  setNodePosition: vi.fn(),
  // 距离计算
  calculateDistance: vi.fn().mockReturnValue(50)
}

// 边界情况测试组件
const EdgeCaseTestComponent = {
  name: 'EdgeCaseTestComponent',
  template: `
    <div class="edge-case-test">
      <div class="canvas-container" ref="canvasRef"></div>
      <div class="error-info" data-testid="error-info">
        <div>错误数: {{ errorCount }}</div>
        <div>最后错误: {{ lastError }}</div>
      </div>
    </div>
  `,
  props: {
    graph: {
      type: Object,
      required: true
    }
  },
  setup(props) {
    const canvasRef = ref(null)
    const errorCount = ref(0)
    const lastError = ref('')
    const nodes = ref(new Map())
    const previewLines = ref([])
    const connectionLines = ref([])

    // 错误处理
    const handleError = (error, context = '') => {
      errorCount.value++
      lastError.value = `${context}: ${error.message || error}`
      console.error(`EdgeCaseTest Error [${context}]:`, error)
    }

    // 创建节点（带错误处理）
    const createNode = (nodeConfig) => {
      try {
        if (!nodeConfig || !nodeConfig.id) {
          throw new Error('节点配置无效：缺少ID')
        }

        if (nodes.value.has(nodeConfig.id)) {
          throw new Error(`节点ID重复：${nodeConfig.id}`)
        }

        const node = {
          id: nodeConfig.id,
          branchCount: Math.max(1, nodeConfig.branchCount || 1),
          position: nodeConfig.position || { x: 0, y: 0 },
          ports: {
            in: [`${nodeConfig.id}_in`],
            out: [`${nodeConfig.id}_out`]
          },
          connections: [],
          previewLines: []
        }
        
        nodes.value.set(node.id, node)
        
        // 创建预览线
        createPreviewLinesForNode(node)
        
        return node
      } catch (error) {
        handleError(error, 'createNode')
        return null
      }
    }

    // 为节点创建预览线（带错误处理）
    const createPreviewLinesForNode = (node) => {
      try {
        if (!node || !node.id) {
          throw new Error('无效的节点')
        }

        const branchCount = node.branchCount
        
        for (let i = 0; i < branchCount; i++) {
          const previewLine = {
            id: `preview_${node.id}_${i}`,
            sourceNodeId: node.id,
            sourcePort: node.ports.out[0],
            targetNodeId: null,
            targetPort: null,
            branchIndex: i,
            type: 'preview',
            x6EdgeId: null,
            position: {
              x: node.position.x + 100,
              y: node.position.y + (i * 30)
            }
          }
          
          // 在X6画布上添加预览边
          const x6Edge = props.graph.addPreviewEdge({
            id: previewLine.id,
            source: { cell: node.id, port: previewLine.sourcePort },
            target: { x: previewLine.position.x, y: previewLine.position.y },
            attrs: {
              line: {
                stroke: '#1890ff',
                strokeWidth: 2,
                strokeDasharray: '5,5'
              }
            }
          })
          
          previewLine.x6EdgeId = x6Edge?.id || previewLine.id
          previewLines.value.push(previewLine)
          node.previewLines.push(previewLine.id)
        }
      } catch (error) {
        handleError(error, 'createPreviewLinesForNode')
      }
    }

    // 删除节点（带错误处理）
    const deleteNode = (nodeId) => {
      try {
        if (!nodeId) {
          throw new Error('节点ID不能为空')
        }

        const node = nodes.value.get(nodeId)
        if (!node) {
          throw new Error(`节点不存在：${nodeId}`)
        }

        // 处理该节点作为目标节点的连接线
        const targetConnections = connectionLines.value.filter(line => line.targetNodeId === nodeId)
        targetConnections.forEach(connection => {
          convertConnectionToPreview(connection.id)
        })

        // 处理该节点作为源节点的连接线
        const sourceConnections = connectionLines.value.filter(line => line.sourceNodeId === nodeId)
        sourceConnections.forEach(connection => {
          const connectionIndex = connectionLines.value.findIndex(line => line.id === connection.id)
          if (connectionIndex !== -1) {
            props.graph.removeEdge(connection.x6EdgeId)
            connectionLines.value.splice(connectionIndex, 1)
          }
        })

        // 删除该节点的预览线
        const nodePreviewLines = previewLines.value.filter(line => line.sourceNodeId === nodeId)
        nodePreviewLines.forEach(previewLine => {
          const previewIndex = previewLines.value.findIndex(line => line.id === previewLine.id)
          if (previewIndex !== -1) {
            props.graph.removePreviewEdge(previewLine.x6EdgeId)
            previewLines.value.splice(previewIndex, 1)
          }
        })

        // 从图中移除节点
        props.graph.removeNode(nodeId)
        nodes.value.delete(nodeId)

        return true
      } catch (error) {
        handleError(error, 'deleteNode')
        return false
      }
    }

    // 预览线转换为连接线（带错误处理）
    const convertPreviewToConnection = (previewLineId, targetNodeId) => {
      try {
        if (!previewLineId || !targetNodeId) {
          throw new Error('预览线ID和目标节点ID不能为空')
        }

        const previewIndex = previewLines.value.findIndex(line => line.id === previewLineId)
        if (previewIndex === -1) {
          throw new Error(`预览线不存在：${previewLineId}`)
        }

        const previewLine = previewLines.value[previewIndex]
        const targetNode = nodes.value.get(targetNodeId)
        if (!targetNode) {
          throw new Error(`目标节点不存在：${targetNodeId}`)
        }

        // 检查是否会形成循环连接
        if (previewLine.sourceNodeId === targetNodeId) {
          throw new Error('不能连接到自身节点')
        }

        // 移除预览线
        props.graph.removePreviewEdge(previewLine.x6EdgeId)
        previewLines.value.splice(previewIndex, 1)

        // 创建连接线
        const connectionLine = {
          id: `connection_${previewLine.sourceNodeId}_${targetNodeId}_${previewLine.branchIndex}`,
          sourceNodeId: previewLine.sourceNodeId,
          sourcePort: previewLine.sourcePort,
          targetNodeId: targetNodeId,
          targetPort: targetNode.ports.in[0],
          branchIndex: previewLine.branchIndex,
          type: 'connection',
          x6EdgeId: null
        }

        // 在X6画布上添加连接边
        const x6Edge = props.graph.addEdge({
          id: connectionLine.id,
          source: { cell: connectionLine.sourceNodeId, port: connectionLine.sourcePort },
          target: { cell: connectionLine.targetNodeId, port: connectionLine.targetPort },
          attrs: {
            line: {
              stroke: '#52c41a',
              strokeWidth: 2
            }
          }
        })

        connectionLine.x6EdgeId = x6Edge?.id || connectionLine.id
        connectionLines.value.push(connectionLine)

        // 更新节点连接信息
        const sourceNode = nodes.value.get(previewLine.sourceNodeId)
        sourceNode.connections.push(connectionLine.id)
        targetNode.connections.push(connectionLine.id)

        // 从源节点的预览线列表中移除
        const previewLineIndex = sourceNode.previewLines.indexOf(previewLineId)
        if (previewLineIndex !== -1) {
          sourceNode.previewLines.splice(previewLineIndex, 1)
        }

        return connectionLine
      } catch (error) {
        handleError(error, 'convertPreviewToConnection')
        return null
      }
    }

    // 连接线转换为预览线（带错误处理）
    const convertConnectionToPreview = (connectionLineId) => {
      try {
        if (!connectionLineId) {
          throw new Error('连接线ID不能为空')
        }

        const connectionIndex = connectionLines.value.findIndex(line => line.id === connectionLineId)
        if (connectionIndex === -1) {
          throw new Error(`连接线不存在：${connectionLineId}`)
        }

        const connectionLine = connectionLines.value[connectionIndex]
        const sourceNode = nodes.value.get(connectionLine.sourceNodeId)
        if (!sourceNode) {
          throw new Error(`源节点不存在：${connectionLine.sourceNodeId}`)
        }

        // 移除连接线
        props.graph.removeEdge(connectionLine.x6EdgeId)
        connectionLines.value.splice(connectionIndex, 1)

        // 创建预览线
        const previewLine = {
          id: `preview_${connectionLine.sourceNodeId}_${connectionLine.branchIndex}_restored`,
          sourceNodeId: connectionLine.sourceNodeId,
          sourcePort: connectionLine.sourcePort,
          targetNodeId: null,
          targetPort: null,
          branchIndex: connectionLine.branchIndex,
          type: 'preview',
          x6EdgeId: null,
          position: {
            x: sourceNode.position.x + 100,
            y: sourceNode.position.y + (connectionLine.branchIndex * 30)
          }
        }

        // 在X6画布上添加预览边
        const x6Edge = props.graph.addPreviewEdge({
          id: previewLine.id,
          source: { cell: sourceNode.id, port: previewLine.sourcePort },
          target: { x: previewLine.position.x, y: previewLine.position.y },
          attrs: {
            line: {
              stroke: '#1890ff',
              strokeWidth: 2,
              strokeDasharray: '5,5'
            }
          }
        })

        previewLine.x6EdgeId = x6Edge?.id || previewLine.id
        previewLines.value.push(previewLine)
        sourceNode.previewLines.push(previewLine.id)

        // 从源节点的连接列表中移除
        const connectionIndex2 = sourceNode.connections.indexOf(connectionLineId)
        if (connectionIndex2 !== -1) {
          sourceNode.connections.splice(connectionIndex2, 1)
        }

        return previewLine
      } catch (error) {
        handleError(error, 'convertConnectionToPreview')
        return null
      }
    }

    // 批量操作（带错误处理）
    const batchCreateNodes = (nodeConfigs) => {
      try {
        if (!Array.isArray(nodeConfigs)) {
          throw new Error('节点配置必须是数组')
        }

        const createdNodes = []
        const failedNodes = []

        nodeConfigs.forEach(config => {
          const node = createNode(config)
          if (node) {
            createdNodes.push(node)
          } else {
            failedNodes.push(config)
          }
        })

        return { createdNodes, failedNodes }
      } catch (error) {
        handleError(error, 'batchCreateNodes')
        return { createdNodes: [], failedNodes: nodeConfigs }
      }
    }

    // 清理所有数据
    const clearAll = () => {
      try {
        // 清理预览线
        previewLines.value.forEach(line => {
          props.graph.removePreviewEdge(line.x6EdgeId)
        })
        previewLines.value.length = 0

        // 清理连接线
        connectionLines.value.forEach(line => {
          props.graph.removeEdge(line.x6EdgeId)
        })
        connectionLines.value.length = 0

        // 清理节点
        nodes.value.forEach(node => {
          props.graph.removeNode(node.id)
        })
        nodes.value.clear()

        // 重置错误计数
        errorCount.value = 0
        lastError.value = ''
      } catch (error) {
        handleError(error, 'clearAll')
      }
    }

    // 获取统计信息
    const getStats = () => {
      return {
        nodes: nodes.value.size,
        previewLines: previewLines.value.length,
        connectionLines: connectionLines.value.length,
        totalLines: previewLines.value.length + connectionLines.value.length,
        errors: errorCount.value
      }
    }

    return {
      canvasRef,
      errorCount,
      lastError,
      createNode,
      deleteNode,
      convertPreviewToConnection,
      convertConnectionToPreview,
      batchCreateNodes,
      clearAll,
      getStats,
      handleError,
      // 暴露内部状态用于测试
      nodes,
      previewLines,
      connectionLines
    }
  }
}

describe('边界情况和错误处理测试', () => {
  let wrapper
  let component

  beforeEach(async () => {
    vi.clearAllMocks()
    
    if (wrapper) {
      wrapper.unmount()
    }
    
    wrapper = mount(EdgeCaseTestComponent, {
      props: {
        graph: mockGraph
      }
    })

    component = wrapper.vm
    await nextTick()
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  describe('输入验证和错误处理', () => {
    it('TC_EDGE_001 - 创建节点时处理无效输入', () => {
      // 测试空配置
      const result1 = component.createNode(null)
      expect(result1).toBeNull()
      expect(component.errorCount).toBe(1)

      // 测试缺少ID的配置
      const result2 = component.createNode({ branchCount: 2 })
      expect(result2).toBeNull()
      expect(component.errorCount).toBe(2)

      // 测试重复ID
      component.createNode({ id: 'test1', branchCount: 1 })
      const result3 = component.createNode({ id: 'test1', branchCount: 2 })
      expect(result3).toBeNull()
      expect(component.errorCount).toBe(3)
    })

    it('TC_EDGE_002 - 删除不存在的节点', () => {
      const result1 = component.deleteNode('')
      expect(result1).toBe(false)
      expect(component.errorCount).toBe(1)

      const result2 = component.deleteNode('nonexistent')
      expect(result2).toBe(false)
      expect(component.errorCount).toBe(2)
    })

    it('TC_EDGE_003 - 预览线转换时处理无效参数', () => {
      const result1 = component.convertPreviewToConnection('', 'target1')
      expect(result1).toBeNull()
      expect(component.errorCount).toBe(1)

      const result2 = component.convertPreviewToConnection('preview1', '')
      expect(result2).toBeNull()
      expect(component.errorCount).toBe(2)

      const result3 = component.convertPreviewToConnection('nonexistent', 'target1')
      expect(result3).toBeNull()
      expect(component.errorCount).toBe(3)
    })

    it('TC_EDGE_004 - 防止自环连接', () => {
      // 清除之前测试的错误计数
      component.clearAll()
      
      const node = component.createNode({
        id: 'node1',
        branchCount: 1,
        position: { x: 0, y: 0 }
      })

      const previewLine = component.previewLines.find(line => line.sourceNodeId === 'node1')
      const result = component.convertPreviewToConnection(previewLine.id, 'node1')
      
      expect(result).toBeNull()
      expect(component.errorCount).toBe(1)
      expect(component.lastError).toContain('不能连接到自身节点')
    })
  })

  describe('极限情况测试', () => {
    it('TC_EDGE_005 - 大量分支节点处理', () => {
      const node = component.createNode({
        id: 'bigBranchNode',
        branchCount: 100,
        position: { x: 0, y: 0 }
      })

      expect(node).toBeTruthy()
      expect(component.previewLines.filter(line => line.sourceNodeId === 'bigBranchNode').length).toBe(100)
      expect(mockGraph.addPreviewEdge).toHaveBeenCalledTimes(100)
    })

    it('TC_EDGE_006 - 零分支数处理', () => {
      const node = component.createNode({
        id: 'zeroBranchNode',
        branchCount: 0,
        position: { x: 0, y: 0 }
      })

      expect(node).toBeTruthy()
      expect(node.branchCount).toBe(1) // 应该被修正为1
      expect(component.previewLines.filter(line => line.sourceNodeId === 'zeroBranchNode').length).toBe(1)
    })

    it('TC_EDGE_007 - 负数分支数处理', () => {
      const node = component.createNode({
        id: 'negativeBranchNode',
        branchCount: -5,
        position: { x: 0, y: 0 }
      })

      expect(node).toBeTruthy()
      expect(node.branchCount).toBe(1) // 应该被修正为1
      expect(component.previewLines.filter(line => line.sourceNodeId === 'negativeBranchNode').length).toBe(1)
    })

    it('TC_EDGE_008 - 批量创建节点时的部分失败', () => {
      const nodeConfigs = [
        { id: 'valid1', branchCount: 1 },
        { branchCount: 2 }, // 缺少ID，应该失败
        { id: 'valid2', branchCount: 3 },
        null, // 无效配置，应该失败
        { id: 'valid3', branchCount: 1 }
      ]

      const result = component.batchCreateNodes(nodeConfigs)
      
      expect(result.createdNodes.length).toBe(3)
      expect(result.failedNodes.length).toBe(2)
      expect(component.nodes.size).toBe(3)
    })
  })

  describe('内存和性能测试', () => {
    it('TC_EDGE_009 - 大量节点创建和删除', () => {
      const nodeCount = 50
      const createdNodes = []

      // 创建大量节点
      for (let i = 0; i < nodeCount; i++) {
        const node = component.createNode({
          id: `node_${i}`,
          branchCount: Math.floor(Math.random() * 5) + 1,
          position: { x: i * 100, y: 0 }
        })
        if (node) {
          createdNodes.push(node)
        }
      }

      expect(component.nodes.size).toBe(nodeCount)
      expect(component.previewLines.length).toBeGreaterThan(nodeCount)

      // 删除所有节点
      createdNodes.forEach(node => {
        component.deleteNode(node.id)
      })

      expect(component.nodes.size).toBe(0)
      expect(component.previewLines.length).toBe(0)
      expect(component.connectionLines.length).toBe(0)
    })

    it('TC_EDGE_010 - 清理功能测试', () => {
      // 创建一些节点和连接
      const node1 = component.createNode({ id: 'node1', branchCount: 2 })
      const node2 = component.createNode({ id: 'node2', branchCount: 1 })
      
      const previewLine = component.previewLines.find(line => line.sourceNodeId === 'node1')
      component.convertPreviewToConnection(previewLine.id, 'node2')

      expect(component.nodes.size).toBe(2)
      expect(component.previewLines.length).toBe(2) // node1还有1条，node2有1条
      expect(component.connectionLines.length).toBe(1)

      // 清理所有数据
      component.clearAll()

      expect(component.nodes.size).toBe(0)
      expect(component.previewLines.length).toBe(0)
      expect(component.connectionLines.length).toBe(0)
      expect(component.errorCount).toBe(0)
    })
  })

  describe('并发和竞态条件测试', () => {
    it('TC_EDGE_011 - 快速连续操作', async () => {
      const node1 = component.createNode({ id: 'node1', branchCount: 3 })
      const node2 = component.createNode({ id: 'node2', branchCount: 1 })

      // 快速连续转换预览线
      const previewLines = component.previewLines.filter(line => line.sourceNodeId === 'node1')
      
      const results = []
      previewLines.forEach(line => {
        const result = component.convertPreviewToConnection(line.id, 'node2')
        results.push(result)
      })

      // 由于node2只有一个输入端口，多个连接到同一个节点是允许的
      // 但是预览线在转换后会从数组中移除，所以后续的转换会失败
      const successCount = results.filter(r => r !== null).length
      expect(successCount).toBeGreaterThanOrEqual(1)
      expect(successCount).toBeLessThanOrEqual(3)
    })

    it('TC_EDGE_012 - 删除节点时的级联操作', () => {
      // 创建复杂的连接网络
      const node1 = component.createNode({ id: 'node1', branchCount: 2 })
      const node2 = component.createNode({ id: 'node2', branchCount: 2 })
      const node3 = component.createNode({ id: 'node3', branchCount: 1 })

      // 建立连接：node1 -> node2, node2 -> node3
      const preview1 = component.previewLines.find(line => line.sourceNodeId === 'node1')
      component.convertPreviewToConnection(preview1.id, 'node2')

      const preview2 = component.previewLines.find(line => line.sourceNodeId === 'node2')
      component.convertPreviewToConnection(preview2.id, 'node3')

      expect(component.connectionLines.length).toBe(2)

      // 删除中间节点，应该触发级联恢复
      component.deleteNode('node2')

      expect(component.connectionLines.length).toBe(0)
      expect(component.previewLines.filter(line => line.sourceNodeId === 'node1').length).toBe(2)
    })
  })

  describe('数据一致性测试', () => {
    it('TC_EDGE_013 - 统计信息一致性', () => {
      const node1 = component.createNode({ id: 'node1', branchCount: 3 })
      const node2 = component.createNode({ id: 'node2', branchCount: 2 })

      let stats = component.getStats()
      expect(stats.nodes).toBe(2)
      expect(stats.previewLines).toBe(5)
      expect(stats.connectionLines).toBe(0)
      expect(stats.totalLines).toBe(5)

      // 建立连接
      const previewLine = component.previewLines.find(line => line.sourceNodeId === 'node1')
      component.convertPreviewToConnection(previewLine.id, 'node2')

      stats = component.getStats()
      expect(stats.previewLines).toBe(4)
      expect(stats.connectionLines).toBe(1)
      expect(stats.totalLines).toBe(5) // 总数应该保持不变

      // 删除节点
      component.deleteNode('node2')

      stats = component.getStats()
      expect(stats.nodes).toBe(1)
      expect(stats.previewLines).toBe(3) // node1的3条预览线
      expect(stats.connectionLines).toBe(0)
    })

    it('TC_EDGE_014 - 节点预览线数量规则验证', () => {
      const node = component.createNode({ id: 'node1', branchCount: 5 })
      
      // 初始状态：所有线都是预览线
      const nodePreviewLines = component.previewLines.filter(line => line.sourceNodeId === 'node1').length
      const nodeConnectionLines = component.connectionLines.filter(line => line.sourceNodeId === 'node1').length
      expect(nodePreviewLines + nodeConnectionLines).toBe(5)

      // 创建目标节点并建立连接
      const targetNode = component.createNode({ id: 'target1', branchCount: 1 })
      
      // 转换2条预览线为连接线
      const previewLines = component.previewLines.filter(line => line.sourceNodeId === 'node1')
      component.convertPreviewToConnection(previewLines[0].id, 'target1')
      
      const targetNode2 = component.createNode({ id: 'target2', branchCount: 1 })
      const remainingPreviewLines = component.previewLines.filter(line => line.sourceNodeId === 'node1')
      component.convertPreviewToConnection(remainingPreviewLines[0].id, 'target2')

      // 验证总数仍然等于分支数
      const finalPreviewLines = component.previewLines.filter(line => line.sourceNodeId === 'node1').length
      const finalConnectionLines = component.connectionLines.filter(line => line.sourceNodeId === 'node1').length
      expect(finalPreviewLines + finalConnectionLines).toBe(5)
    })
  })

  describe('错误恢复测试', () => {
    it('TC_EDGE_015 - 从错误状态恢复', () => {
      // 故意触发一些错误
      component.createNode(null)
      component.deleteNode('nonexistent')
      component.convertPreviewToConnection('invalid', 'invalid')

      expect(component.errorCount).toBe(3)

      // 执行正常操作，应该能够继续工作
      const node = component.createNode({ id: 'recovery_node', branchCount: 2 })
      expect(node).toBeTruthy()
      expect(component.previewLines.length).toBe(2)

      // 清理应该重置错误计数
      component.clearAll()
      expect(component.errorCount).toBe(0)
      expect(component.lastError).toBe('')
    })
  })
})