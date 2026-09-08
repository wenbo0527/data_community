import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref, nextTick } from 'vue'

// Mock X6 Graph with advanced features
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

// 高级预览线组件，支持预览线和连接线的转换
const AdvancedPreviewLineComponent = {
  name: 'AdvancedPreviewLineComponent',
  template: `
    <div class="advanced-preview-line">
      <div class="canvas-container" ref="canvasRef"></div>
      <div class="node-info" data-testid="node-info">
        <div>节点分支数: {{ currentNode?.branchCount || 0 }}</div>
        <div>预览线数: {{ stats.previewLines }}</div>
        <div>连接线数: {{ stats.connectionLines }}</div>
        <div>总数: {{ stats.totalLines }}</div>
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
    const currentNode = ref(null)
    const previewLines = ref([])
    const connectionLines = ref([])
    const nodes = ref(new Map())

    // 创建节点
    const createNode = (nodeConfig) => {
      const node = {
        id: nodeConfig.id,
        branchCount: nodeConfig.branchCount || 1,
        position: nodeConfig.position || { x: 0, y: 0 },
        ports: {
          in: [`${nodeConfig.id}_in`],
          out: [`${nodeConfig.id}_out`]
        },
        connections: [],
        previewLines: []
      }
      
      nodes.value.set(node.id, node)
      
      // 根据分支数创建预览线
      createPreviewLinesForNode(node)
      
      return node
    }

    // 为节点创建预览线
    const createPreviewLinesForNode = (node) => {
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
    }

    // 预览线转换为连接线
    const convertPreviewToConnection = (previewLineId, targetNodeId) => {
      const previewIndex = previewLines.value.findIndex(line => line.id === previewLineId)
      if (previewIndex === -1) return null

      const previewLine = previewLines.value[previewIndex]
      const targetNode = nodes.value.get(targetNodeId)
      if (!targetNode) return null

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
    }

    // 连接线转换为预览线（当目标节点删除时）
    const convertConnectionToPreview = (connectionLineId) => {
      const connectionIndex = connectionLines.value.findIndex(line => line.id === connectionLineId)
      if (connectionIndex === -1) return null

      const connectionLine = connectionLines.value[connectionIndex]
      const sourceNode = nodes.value.get(connectionLine.sourceNodeId)
      if (!sourceNode) return null

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
    }

    // 删除节点
    const deleteNode = (nodeId) => {
      const node = nodes.value.get(nodeId)
      if (!node) return false

      // 处理该节点作为目标节点的连接线，转换为预览线
      const targetConnections = connectionLines.value.filter(line => line.targetNodeId === nodeId)
      targetConnections.forEach(connection => {
        convertConnectionToPreview(connection.id)
      })

      // 处理该节点作为源节点的连接线，直接删除
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
    }

    // 拖拽吸附功能
    const handleDragNearPort = (draggedNodeId, nearPortNodeId, distance) => {
      if (distance > 50) return false // 距离太远不吸附

      const draggedNode = nodes.value.get(draggedNodeId)
      const nearPortNode = nodes.value.get(nearPortNodeId)
      
      if (!draggedNode || !nearPortNode) return false

      // 查找最近的预览线
      const nearestPreviewLine = previewLines.value.find(line => 
        line.sourceNodeId === nearPortNode.id
      )

      if (nearestPreviewLine) {
        // 将预览线转换为连接线
        convertPreviewToConnection(nearestPreviewLine.id, draggedNodeId)
        return true
      }

      return false
    }

    // 预览线末端拖拽到节点
    const handlePreviewLineDragToNode = (previewLineId, targetNodeId) => {
      const previewLine = previewLines.value.find(line => line.id === previewLineId)
      const targetNode = nodes.value.get(targetNodeId)

      if (!previewLine || !targetNode) return false

      // 转换为连接线
      convertPreviewToConnection(previewLineId, targetNodeId)
      return true
    }

    // 布局功能
    const layoutPreviewLinesAndNodes = () => {
      const allNodes = Array.from(nodes.value.values())
      
      // 按层级布局
      const layers = new Map()
      
      allNodes.forEach(node => {
        const layer = node.connections.length > 0 ? 1 : 0
        if (!layers.has(layer)) {
          layers.set(layer, [])
        }
        layers.get(layer).push(node)
      })

      // 为每层分配位置
      layers.forEach((nodesInLayer, layerIndex) => {
        nodesInLayer.forEach((node, nodeIndex) => {
          const newPosition = {
            x: layerIndex * 200,
            y: nodeIndex * 100
          }
          
          node.position = newPosition
          props.graph.setNodePosition(node.id, newPosition)
          
          // 更新该节点的预览线位置
          const nodePreviewLines = previewLines.value.filter(line => line.sourceNodeId === node.id)
          nodePreviewLines.forEach((previewLine, index) => {
            previewLine.position = {
              x: newPosition.x + 100,
              y: newPosition.y + (index * 30)
            }
            
            props.graph.updatePreviewEdge(previewLine.x6EdgeId, {
              target: { x: previewLine.position.x, y: previewLine.position.y }
            })
          })
        })
      })
    }

    // 获取统计信息
    const getStats = () => {
      return {
        previewLines: previewLines.value.length,
        connectionLines: connectionLines.value.length,
        totalLines: previewLines.value.length + connectionLines.value.length,
        nodes: nodes.value.size
      }
    }

    // 验证预览线和连接线数量规则
    const validateLineCountRule = (nodeId) => {
      const node = nodes.value.get(nodeId)
      if (!node) return false

      const nodePreviewLines = previewLines.value.filter(line => line.sourceNodeId === nodeId).length
      const nodeConnectionLines = connectionLines.value.filter(line => line.sourceNodeId === nodeId).length
      const totalLines = nodePreviewLines + nodeConnectionLines

      return totalLines === node.branchCount
    }

    const stats = ref({})
    const updateStats = () => {
      stats.value = getStats()
    }

    // 初始化
    updateStats()

    return {
      canvasRef,
      currentNode,
      stats,
      createNode,
      deleteNode,
      convertPreviewToConnection,
      convertConnectionToPreview,
      handleDragNearPort,
      handlePreviewLineDragToNode,
      layoutPreviewLinesAndNodes,
      validateLineCountRule,
      getStats,
      updateStats,
      // 暴露内部状态用于测试
      previewLines,
      connectionLines,
      nodes
    }
  }
}

describe('高级预览线功能测试', () => {
  let wrapper
  let component

  beforeEach(async () => {
    vi.clearAllMocks()
    
    if (wrapper) {
      wrapper.unmount()
    }
    
    wrapper = mount(AdvancedPreviewLineComponent, {
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

  describe('预览线和连接线转换关系', () => {
    it('TC_ADV_001 - 只有源节点时创建预览线', () => {
      const sourceNode = component.createNode({
        id: 'source1',
        branchCount: 2,
        position: { x: 0, y: 0 }
      })

      expect(sourceNode).toBeTruthy()
      expect(component.previewLines.length).toBe(2)
      expect(component.connectionLines.length).toBe(0)
      expect(mockGraph.addPreviewEdge).toHaveBeenCalledTimes(2)
    })

    it('TC_ADV_002 - 预览线转换为连接线', () => {
      const sourceNode = component.createNode({
        id: 'source1',
        branchCount: 2,
        position: { x: 0, y: 0 }
      })
      
      const targetNode = component.createNode({
        id: 'target1',
        branchCount: 1,
        position: { x: 200, y: 0 }
      })

      const previewLine = component.previewLines.find(line => line.sourceNodeId === 'source1')
      const connectionLine = component.convertPreviewToConnection(previewLine.id, 'target1')

      expect(connectionLine).toBeTruthy()
      expect(connectionLine.type).toBe('connection')
      expect(component.previewLines.length).toBe(2) // source1还有1条，target1有1条
      expect(component.connectionLines.length).toBe(1)
      expect(mockGraph.addEdge).toHaveBeenCalledTimes(1)
      expect(mockGraph.removePreviewEdge).toHaveBeenCalledTimes(1)
    })

    it('TC_ADV_003 - 连接线转换回预览线（目标节点删除）', () => {
      const sourceNode = component.createNode({
        id: 'source1',
        branchCount: 2,
        position: { x: 0, y: 0 }
      })
      
      const targetNode = component.createNode({
        id: 'target1',
        branchCount: 1,
        position: { x: 200, y: 0 }
      })

      // 建立连接
      const previewLine = component.previewLines.find(line => line.sourceNodeId === 'source1')
      component.convertPreviewToConnection(previewLine.id, 'target1')

      expect(component.connectionLines.length).toBe(1)

      // 删除目标节点
      component.deleteNode('target1')

      expect(component.connectionLines.length).toBe(0)
      expect(component.previewLines.filter(line => line.sourceNodeId === 'source1').length).toBe(2)
      expect(mockGraph.removeEdge).toHaveBeenCalledTimes(1)
      expect(mockGraph.addPreviewEdge).toHaveBeenCalledTimes(4) // 2+1+1 (恢复的预览线)
    })
  })

  describe('预览线和连接线数量规则', () => {
    it('TC_ADV_004 - 无分支节点数量为1', () => {
      const node = component.createNode({
        id: 'node1',
        branchCount: 1,
        position: { x: 0, y: 0 }
      })

      expect(component.validateLineCountRule('node1')).toBe(true)
      expect(component.previewLines.filter(line => line.sourceNodeId === 'node1').length).toBe(1)
    })

    it('TC_ADV_005 - 有分支节点数量等于分支数', () => {
      const node = component.createNode({
        id: 'node1',
        branchCount: 3,
        position: { x: 0, y: 0 }
      })

      expect(component.validateLineCountRule('node1')).toBe(true)
      expect(component.previewLines.filter(line => line.sourceNodeId === 'node1').length).toBe(3)
    })

    it('TC_ADV_006 - 部分连接后数量仍等于分支数', () => {
      const sourceNode = component.createNode({
        id: 'source1',
        branchCount: 3,
        position: { x: 0, y: 0 }
      })
      
      const targetNode = component.createNode({
        id: 'target1',
        branchCount: 1,
        position: { x: 200, y: 0 }
      })

      // 连接一条线
      const previewLine = component.previewLines.find(line => line.sourceNodeId === 'source1')
      component.convertPreviewToConnection(previewLine.id, 'target1')

      expect(component.validateLineCountRule('source1')).toBe(true)
      
      const sourcePreviewLines = component.previewLines.filter(line => line.sourceNodeId === 'source1').length
      const sourceConnectionLines = component.connectionLines.filter(line => line.sourceNodeId === 'source1').length
      expect(sourcePreviewLines + sourceConnectionLines).toBe(3)
    })
  })

  describe('拖拽和吸附功能', () => {
    it('TC_ADV_007 - 节点拖拽靠近预览线自动吸附', () => {
      const sourceNode = component.createNode({
        id: 'source1',
        branchCount: 2,
        position: { x: 0, y: 0 }
      })
      
      const draggedNode = component.createNode({
        id: 'dragged1',
        branchCount: 1,
        position: { x: 300, y: 0 }
      })

      // 模拟拖拽到预览线附近
      mockGraph.calculateDistance.mockReturnValue(30) // 距离30，小于50阈值
      
      const attached = component.handleDragNearPort('dragged1', 'source1', 30)

      expect(attached).toBe(true)
      expect(component.connectionLines.length).toBe(1)
      expect(component.connectionLines[0].targetNodeId).toBe('dragged1')
    })

    it('TC_ADV_008 - 预览线末端拖拽到节点自动吸附', () => {
      const sourceNode = component.createNode({
        id: 'source1',
        branchCount: 2,
        position: { x: 0, y: 0 }
      })
      
      const targetNode = component.createNode({
        id: 'target1',
        branchCount: 1,
        position: { x: 200, y: 0 }
      })

      const previewLine = component.previewLines.find(line => line.sourceNodeId === 'source1')
      const attached = component.handlePreviewLineDragToNode(previewLine.id, 'target1')

      expect(attached).toBe(true)
      expect(component.connectionLines.length).toBe(1)
      expect(component.connectionLines[0].targetNodeId).toBe('target1')
    })

    it('TC_ADV_009 - 距离太远不触发吸附', () => {
      const sourceNode = component.createNode({
        id: 'source1',
        branchCount: 2,
        position: { x: 0, y: 0 }
      })
      
      const draggedNode = component.createNode({
        id: 'dragged1',
        branchCount: 1,
        position: { x: 300, y: 0 }
      })

      // 模拟距离太远
      mockGraph.calculateDistance.mockReturnValue(80) // 距离80，大于50阈值
      
      const attached = component.handleDragNearPort('dragged1', 'source1', 80)

      expect(attached).toBe(false)
      expect(component.connectionLines.length).toBe(0)
    })

    it('TC_ADV_010 - 已存在连接时仍可吸附', () => {
      const sourceNode = component.createNode({
        id: 'source1',
        branchCount: 2,
        position: { x: 0, y: 0 }
      })
      
      const targetNode1 = component.createNode({
        id: 'target1',
        branchCount: 1,
        position: { x: 200, y: 0 }
      })
      
      const targetNode2 = component.createNode({
        id: 'target2',
        branchCount: 1,
        position: { x: 200, y: 100 }
      })

      // 建立第一个连接
      const previewLine1 = component.previewLines.find(line => line.sourceNodeId === 'source1')
      component.convertPreviewToConnection(previewLine1.id, 'target1')

      // 第二个节点仍可吸附到剩余的预览线
      mockGraph.calculateDistance.mockReturnValue(30)
      const attached = component.handleDragNearPort('target2', 'source1', 30)

      expect(attached).toBe(true)
      expect(component.connectionLines.length).toBe(2)
    })
  })

  describe('端口连接规则', () => {
    it('TC_ADV_011 - 预览线从out端口出发', () => {
      const sourceNode = component.createNode({
        id: 'source1',
        branchCount: 1,
        position: { x: 0, y: 0 }
      })

      const previewLine = component.previewLines.find(line => line.sourceNodeId === 'source1')
      expect(previewLine.sourcePort).toBe('source1_out')
    })

    it('TC_ADV_012 - 连接线连接到in端口', () => {
      const sourceNode = component.createNode({
        id: 'source1',
        branchCount: 1,
        position: { x: 0, y: 0 }
      })
      
      const targetNode = component.createNode({
        id: 'target1',
        branchCount: 1,
        position: { x: 200, y: 0 }
      })

      const previewLine = component.previewLines.find(line => line.sourceNodeId === 'source1')
      const connectionLine = component.convertPreviewToConnection(previewLine.id, 'target1')

      expect(connectionLine.sourcePort).toBe('source1_out')
      expect(connectionLine.targetPort).toBe('target1_in')
    })
  })

  describe('分支节点特殊处理', () => {
    it('TC_ADV_013 - 分支节点删除目标时只恢复对应分支', () => {
      const sourceNode = component.createNode({
        id: 'source1',
        branchCount: 3,
        position: { x: 0, y: 0 }
      })
      
      const targetNode1 = component.createNode({
        id: 'target1',
        branchCount: 1,
        position: { x: 200, y: 0 }
      })
      
      const targetNode2 = component.createNode({
        id: 'target2',
        branchCount: 1,
        position: { x: 200, y: 100 }
      })

      // 建立两个连接
      const previewLines = component.previewLines.filter(line => line.sourceNodeId === 'source1')
      component.convertPreviewToConnection(previewLines[0].id, 'target1')
      
      // 重新获取预览线列表，因为第一个已经被转换
      const remainingPreviewLines = component.previewLines.filter(line => line.sourceNodeId === 'source1')
      component.convertPreviewToConnection(remainingPreviewLines[0].id, 'target2')

      expect(component.connectionLines.length).toBe(2)
      expect(component.previewLines.filter(line => line.sourceNodeId === 'source1').length).toBe(1)

      // 删除一个目标节点
      component.deleteNode('target1')

      expect(component.connectionLines.length).toBe(1)
      expect(component.previewLines.filter(line => line.sourceNodeId === 'source1').length).toBe(2)
      expect(component.validateLineCountRule('source1')).toBe(true)
    })
  })

  describe('布局功能', () => {
    it('TC_ADV_014 - 预览线末端和连接线目标节点同层布局', () => {
      const sourceNode = component.createNode({
        id: 'source1',
        branchCount: 2,
        position: { x: 0, y: 0 }
      })
      
      const targetNode = component.createNode({
        id: 'target1',
        branchCount: 1,
        position: { x: 200, y: 0 }
      })

      // 建立连接
      const previewLine = component.previewLines.find(line => line.sourceNodeId === 'source1')
      component.convertPreviewToConnection(previewLine.id, 'target1')

      // 执行布局
      component.layoutPreviewLinesAndNodes()

      // 验证布局调用
      expect(mockGraph.setNodePosition).toHaveBeenCalled()
      expect(mockGraph.updatePreviewEdge).toHaveBeenCalled()
    })

    it('TC_ADV_015 - 保证足够的挂载空间', () => {
      const sourceNode = component.createNode({
        id: 'source1',
        branchCount: 5, // 多分支
        position: { x: 0, y: 0 }
      })

      component.layoutPreviewLinesAndNodes()

      // 验证预览线之间有足够间距
      const sourcePreviewLines = component.previewLines.filter(line => line.sourceNodeId === 'source1')
      for (let i = 1; i < sourcePreviewLines.length; i++) {
        const prevY = sourcePreviewLines[i-1].position.y
        const currY = sourcePreviewLines[i].position.y
        expect(currY - prevY).toBe(30) // 30像素间距
      }
    })
  })

  describe('综合场景测试', () => {
    it('TC_ADV_016 - 复杂连接场景', () => {
      // 创建多个节点
      const sourceNode = component.createNode({
        id: 'source1',
        branchCount: 3,
        position: { x: 0, y: 0 }
      })
      
      const targetNode1 = component.createNode({
        id: 'target1',
        branchCount: 2,
        position: { x: 200, y: 0 }
      })
      
      const targetNode2 = component.createNode({
        id: 'target2',
        branchCount: 1,
        position: { x: 200, y: 100 }
      })

      // 建立连接
      const sourcePreviewLines = component.previewLines.filter(line => line.sourceNodeId === 'source1')
      component.convertPreviewToConnection(sourcePreviewLines[0].id, 'target1')
      
      const target1PreviewLines = component.previewLines.filter(line => line.sourceNodeId === 'target1')
      component.convertPreviewToConnection(target1PreviewLines[0].id, 'target2')

      // 验证所有节点的线数规则
      expect(component.validateLineCountRule('source1')).toBe(true)
      expect(component.validateLineCountRule('target1')).toBe(true)
      expect(component.validateLineCountRule('target2')).toBe(true)

      // 删除中间节点
      component.deleteNode('target1')

      // 验证连接恢复
      expect(component.validateLineCountRule('source1')).toBe(true)
      expect(component.previewLines.filter(line => line.sourceNodeId === 'source1').length).toBe(3)
    })
  })
})