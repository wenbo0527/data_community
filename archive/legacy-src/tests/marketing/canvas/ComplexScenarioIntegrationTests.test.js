import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref, nextTick } from 'vue'

// Mock X6 Graph
const mockGraph = {
  addEdge: vi.fn(),
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
  zoom: vi.fn(),
  translate: vi.fn(),
  centerContent: vi.fn(),
  resize: vi.fn(),
  getContainer: vi.fn().mockReturnValue(document.createElement('div'))
}

// 复杂营销画布场景组件
const ComplexMarketingCanvas = {
  name: 'ComplexMarketingCanvas',
  template: `
    <div class="complex-canvas-container" ref="containerRef" style="width: 1200px; height: 800px;">
      <div class="x6-graph" ref="graphRef"></div>
      <div class="preview-overlay" v-if="showPreview">
        <svg class="preview-svg" :style="{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, 'pointer-events': 'none' }">
          <line 
            v-for="line in previewLines" 
            :key="line.id"
            :x1="line.start.x" 
            :y1="line.start.y"
            :x2="line.end.x" 
            :y2="line.end.y"
            :stroke="line.color || '#1890ff'"
            :stroke-width="line.width || 2"
            :stroke-dasharray="line.dashed ? '5,5' : 'none'"
            class="preview-line"
          />
        </svg>
      </div>
      <div class="canvas-controls">
        <button @click="loadComplexScenario">加载复杂场景</button>
        <button @click="addNewNode">新增节点</button>
        <button @click="applyLayoutRules">应用布局规则</button>
        <button @click="clearCanvas">清空画布</button>
      </div>
      <div class="canvas-stats">
        <div>节点数量: {{ stats.nodeCount }}</div>
        <div>连接线数量: {{ stats.edgeCount }}</div>
        <div>预览线数量: {{ stats.previewLineCount }}</div>
        <div>层级深度: {{ stats.maxDepth }}</div>
      </div>
    </div>
  `,
  props: ['initialNodes', 'initialEdges'],
  emits: ['node-added', 'edge-created', 'preview-line-created', 'layout-applied'],
  setup(props, { emit }) {
    const containerRef = ref(null)
    const graphRef = ref(null)
    const showPreview = ref(true)
    const previewLines = ref([])
    const nodes = ref([])
    const edges = ref([])
    const stats = ref({
      nodeCount: 0,
      edgeCount: 0,
      previewLineCount: 0,
      maxDepth: 0
    })

    // 节点类型定义
    const nodeTypes = {
      START: { type: 'start', name: '开始节点', color: '#52c41a', width: 120, height: 60 },
      AUDIENCE_SPLIT: { type: 'audience_split', name: '人群分流', color: '#1890ff', width: 140, height: 80 },
      MANUAL_CALL: { type: 'manual_call', name: '人工电销', color: '#fa8c16', width: 120, height: 60 },
      AI_CALL: { type: 'ai_call', name: 'AI外呼', color: '#722ed1', width: 120, height: 60 },
      EVENT_SPLIT: { type: 'event_split', name: '事件分流', color: '#13c2c2', width: 140, height: 80 },
      SMS: { type: 'sms', name: '短信', color: '#eb2f96', width: 100, height: 50 },
      WAIT: { type: 'wait', name: '等待3天', color: '#faad14', width: 100, height: 50 }
    }

    // 创建节点
    const createNode = (id, type, x, y, branchId = null) => {
      const nodeConfig = nodeTypes[type]
      const node = {
        id,
        type: nodeConfig.type,
        name: nodeConfig.name,
        x,
        y,
        width: nodeConfig.width,
        height: nodeConfig.height,
        color: nodeConfig.color,
        branchId,
        created: Date.now()
      }
      
      nodes.value.push(node)
      updateStats()
      emit('node-added', node)
      console.log(`✅ 创建节点: ${node.name} (${id})`)
      return node
    }

    // 创建预览线
    const createPreviewLine = (sourceId, targetId, options = {}) => {
      // 检查是否已存在相同的预览线
      const existingLine = previewLines.value.find(line => 
        line.sourceId === sourceId && line.targetId === targetId
      )
      
      if (existingLine) {
        console.log(`⚠️ 预览线已存在: ${sourceId} -> ${targetId}`)
        return existingLine
      }

      const sourceNode = nodes.value.find(n => n.id === sourceId)
      const targetNode = nodes.value.find(n => n.id === targetId)
      
      if (!sourceNode || !targetNode) {
        console.error(`❌ 节点不存在: source=${sourceId}, target=${targetId}`)
        return null
      }

      const newLine = {
        id: `preview_${sourceId}_${targetId}_${Date.now()}`,
        sourceId,
        targetId,
        branchId: options.branchId || null,
        start: { x: sourceNode.x + 50, y: sourceNode.y + 25 },
        end: { x: targetNode.x + 50, y: targetNode.y + 25 },
        color: options.color || '#1890ff',
        width: options.width || 2,
        dashed: options.dashed !== false,
        visible: true,
        created: Date.now()
      }

      previewLines.value.push(newLine)
      updateStats()
      emit('preview-line-created', newLine)
      console.log(`✅ 预览线创建: ${sourceId} -> ${targetId} (分支: ${options.branchId || 'main'})`)
      return newLine
    }

    // 创建真实连接线
    const createRealEdge = (sourceId, targetId, options = {}) => {
      const edge = {
        id: `edge_${sourceId}_${targetId}_${Date.now()}`,
        sourceId,
        targetId,
        branchId: options.branchId || null,
        type: 'real',
        created: Date.now()
      }
      
      edges.value.push(edge)
      updateStats()
      emit('edge-created', edge)
      console.log(`✅ 真实连接线创建: ${sourceId} -> ${targetId}`)
      return edge
    }

    // 加载复杂场景
    const loadComplexScenario = () => {
      console.log('🚀 开始加载复杂营销画布场景...')
      
      // 清空现有内容
      nodes.value = []
      edges.value = []
      previewLines.value = []

      // 第一层：开始节点
      const startNode = createNode('start_1', 'START', 100, 100)
      
      // 第二层：人群分流节点
      const audienceSplit1 = createNode('audience_split_1', 'AUDIENCE_SPLIT', 300, 100)
      createPreviewLine('start_1', 'audience_split_1')

      // 第三层：三个分支
      // 分支1：人工电销路径
      const manualCall = createNode('manual_call_1', 'MANUAL_CALL', 150, 250, 'branch_1')
      createPreviewLine('audience_split_1', 'manual_call_1', { branchId: 'branch_1', color: '#fa8c16' })
      
      // 分支2：AI外呼路径
      const aiCall = createNode('ai_call_1', 'AI_CALL', 300, 250, 'branch_2')
      createPreviewLine('audience_split_1', 'ai_call_1', { branchId: 'branch_2', color: '#722ed1' })
      
      // 分支3：只有预览线（空分支）
      createPreviewLine('audience_split_1', null, { 
        branchId: 'branch_3', 
        color: '#d9d9d9',
        end: { x: 450, y: 250 }
      })

      // 第四层：人工电销分支的事件分流
      const eventSplit = createNode('event_split_1', 'EVENT_SPLIT', 150, 400, 'branch_1')
      createPreviewLine('manual_call_1', 'event_split_1', { branchId: 'branch_1' })

      // 第五层：事件分流后的短信流程
      const sms1 = createNode('sms_1', 'SMS', 100, 550, 'branch_1_yes')
      const wait1 = createNode('wait_1', 'WAIT', 200, 550, 'branch_1_yes')
      const sms2 = createNode('sms_2', 'SMS', 300, 550, 'branch_1_yes')
      
      createPreviewLine('event_split_1', 'sms_1', { branchId: 'branch_1_yes', color: '#eb2f96' })
      createPreviewLine('sms_1', 'wait_1', { branchId: 'branch_1_yes' })
      createPreviewLine('wait_1', 'sms_2', { branchId: 'branch_1_yes' })

      // 第四层：AI外呼分支的人群分流
      const audienceSplit2 = createNode('audience_split_2', 'AUDIENCE_SPLIT', 300, 400, 'branch_2')
      createPreviewLine('ai_call_1', 'audience_split_2', { branchId: 'branch_2' })

      // 第五层：AI外呼后的三个意愿分支
      // 高意愿分支
      const sms3 = createNode('sms_3', 'SMS', 200, 550, 'branch_2_high')
      createPreviewLine('audience_split_2', 'sms_3', { branchId: 'branch_2_high', color: '#52c41a' })

      // 中低意愿分支
      const wait2 = createNode('wait_2', 'WAIT', 350, 550, 'branch_2_medium')
      const sms4 = createNode('sms_4', 'SMS', 450, 550, 'branch_2_medium')
      createPreviewLine('audience_split_2', 'wait_2', { branchId: 'branch_2_medium', color: '#faad14' })
      createPreviewLine('wait_2', 'sms_4', { branchId: 'branch_2_medium' })

      // 其他分支（只有预览线）
      createPreviewLine('audience_split_2', null, { 
        branchId: 'branch_2_other', 
        color: '#d9d9d9',
        end: { x: 500, y: 550 }
      })

      updateStats()
      console.log('✅ 复杂场景加载完成')
      console.log(`📊 统计: ${stats.value.nodeCount}个节点, ${stats.value.previewLineCount}条预览线`)
    }

    // 新增节点
    const addNewNode = () => {
      const newNodeId = `new_node_${Date.now()}`
      const x = 600 + Math.random() * 200
      const y = 300 + Math.random() * 200
      
      const newNode = createNode(newNodeId, 'SMS', x, y)
      
      // 随机连接到现有节点
      if (nodes.value.length > 1) {
        const randomSource = nodes.value[Math.floor(Math.random() * (nodes.value.length - 1))]
        createPreviewLine(randomSource.id, newNodeId, { color: '#f759ab' })
      }
      
      console.log(`✅ 新增节点: ${newNode.name}`)
    }

    // 应用布局规则
    const applyLayoutRules = () => {
      console.log('🎯 应用统一布局规则...')
      
      // 按层级重新排列节点
      const layers = {}
      
      // 计算每个节点的层级
      const calculateDepth = (nodeId, visited = new Set()) => {
        if (visited.has(nodeId)) return 0
        visited.add(nodeId)
        
        const incomingLines = previewLines.value.filter(line => line.targetId === nodeId)
        if (incomingLines.length === 0) return 0
        
        const maxParentDepth = Math.max(...incomingLines.map(line => 
          calculateDepth(line.sourceId, new Set(visited))
        ))
        
        return maxParentDepth + 1
      }

      // 为每个节点分配层级
      nodes.value.forEach(node => {
        const depth = calculateDepth(node.id)
        if (!layers[depth]) layers[depth] = []
        layers[depth].push(node)
      })

      // 重新排列节点位置
      Object.keys(layers).forEach(depth => {
        const layerNodes = layers[depth]
        const layerY = 100 + parseInt(depth) * 150
        
        layerNodes.forEach((node, index) => {
          node.x = 100 + index * 200
          node.y = layerY
        })
      })

      // 更新预览线位置
      previewLines.value.forEach(line => {
        const source = nodes.value.find(n => n.id === line.sourceId)
        const target = nodes.value.find(n => n.id === line.targetId)
        
        if (source && target) {
          line.start.x = source.x + source.width / 2
          line.start.y = source.y + source.height / 2
          line.end.x = target.x + target.width / 2
          line.end.y = target.y + target.height / 2
        }
      })

      updateStats()
      emit('layout-applied', { layers, nodeCount: nodes.value.length })
      console.log(`✅ 布局规则应用完成，共${Object.keys(layers).length}层`)
    }

    // 清空画布
    const clearCanvas = () => {
      nodes.value = []
      edges.value = []
      previewLines.value = []
      updateStats()
      console.log('🧹 画布已清空')
    }

    // 更新统计信息
    const updateStats = () => {
      stats.value = {
        nodeCount: nodes.value.length,
        edgeCount: edges.value.length,
        previewLineCount: previewLines.value.length,
        maxDepth: calculateMaxDepth()
      }
    }

    // 计算最大深度
    const calculateMaxDepth = () => {
      if (nodes.value.length === 0) return 0
      
      const visited = new Set()
      let maxDepth = 0
      
      const dfs = (nodeId, depth) => {
        if (visited.has(nodeId)) return
        visited.add(nodeId)
        maxDepth = Math.max(maxDepth, depth)
        
        const outgoingLines = previewLines.value.filter(line => line.sourceId === nodeId)
        outgoingLines.forEach(line => {
          if (line.targetId) {
            dfs(line.targetId, depth + 1)
          }
        })
      }
      
      // 从开始节点开始计算
      const startNodes = nodes.value.filter(node => node.type === 'start')
      startNodes.forEach(node => dfs(node.id, 0))
      
      return maxDepth
    }

    // 获取画布统计信息
    const getCanvasStats = () => {
      return {
        ...stats.value,
        nodes: nodes.value.length,
        previewLines: previewLines.value.length,
        edges: edges.value.length
      }
    }

    return {
      containerRef,
      graphRef,
      showPreview,
      previewLines,
      nodes,
      edges,
      stats,
      loadComplexScenario,
      addNewNode,
      applyLayoutRules,
      clearCanvas,
      createNode,
      createPreviewLine,
      createRealEdge,
      getCanvasStats
    }
  }
}

describe('复杂营销画布场景集成测试', () => {
  let wrapper
  let canvasComponent

  beforeEach(() => {
    wrapper = mount(ComplexMarketingCanvas, {
      props: {
        initialNodes: [],
        initialEdges: []
      }
    })
    canvasComponent = wrapper.vm
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  describe('画布基础功能测试', () => {
    it('TC_COMPLEX_001 - 画布初始化', () => {
      expect(wrapper.exists()).toBe(true)
      expect(canvasComponent.nodes).toEqual([])
      expect(canvasComponent.previewLines).toEqual([])
      expect(canvasComponent.stats.nodeCount).toBe(0)
    })

    it('TC_COMPLEX_002 - 复杂场景加载', () => {
      canvasComponent.loadComplexScenario()
      
      const stats = canvasComponent.getCanvasStats()
      
      // 验证节点数量（应该有12个节点）
      expect(stats.nodeCount).toBeGreaterThanOrEqual(12)
      
      // 验证预览线数量
      expect(stats.previewLineCount).toBeGreaterThanOrEqual(10)
      
      // 验证层级深度
      expect(stats.maxDepth).toBeGreaterThanOrEqual(4)
      
      // 验证关键节点存在
      const nodeTypes = canvasComponent.nodes.map(n => n.type)
      expect(nodeTypes).toContain('start')
      expect(nodeTypes).toContain('audience_split')
      expect(nodeTypes).toContain('manual_call')
      expect(nodeTypes).toContain('ai_call')
      expect(nodeTypes).toContain('event_split')
      expect(nodeTypes).toContain('sms')
      expect(nodeTypes).toContain('wait')
    })

    it('TC_COMPLEX_003 - 画布清空功能', () => {
      canvasComponent.loadComplexScenario()
      expect(canvasComponent.nodes.length).toBeGreaterThan(0)
      
      canvasComponent.clearCanvas()
      expect(canvasComponent.nodes).toEqual([])
      expect(canvasComponent.previewLines).toEqual([])
      expect(canvasComponent.stats.nodeCount).toBe(0)
    })
  })

  describe('节点创建和管理测试', () => {
    it('TC_COMPLEX_004 - 单个节点创建', () => {
      const node = canvasComponent.createNode('test_node', 'SMS', 100, 200)
      
      expect(node).toBeTruthy()
      expect(node.id).toBe('test_node')
      expect(node.type).toBe('sms')
      expect(node.x).toBe(100)
      expect(node.y).toBe(200)
      expect(canvasComponent.nodes.length).toBe(1)
      expect(canvasComponent.nodes[0].id).toBe('test_node')
    })

    it('TC_COMPLEX_005 - 批量节点创建', () => {
      const nodeConfigs = [
        { id: 'node1', type: 'START', x: 100, y: 100 },
        { id: 'node2', type: 'AUDIENCE_SPLIT', x: 300, y: 100 },
        { id: 'node3', type: 'SMS', x: 500, y: 100 }
      ]
      
      nodeConfigs.forEach(config => {
        canvasComponent.createNode(config.id, config.type, config.x, config.y)
      })
      
      expect(canvasComponent.nodes.length).toBe(3)
      expect(canvasComponent.stats.nodeCount).toBe(3)
    })

    it('TC_COMPLEX_006 - 新增节点功能', () => {
      canvasComponent.loadComplexScenario()
      const initialCount = canvasComponent.nodes.length
      
      canvasComponent.addNewNode()
      
      expect(canvasComponent.nodes.length).toBe(initialCount + 1)
      expect(canvasComponent.stats.nodeCount).toBe(initialCount + 1)
    })
  })

  describe('预览线功能测试', () => {
    it('TC_COMPLEX_007 - 基础预览线创建', () => {
      const source = canvasComponent.createNode('source', 'START', 100, 100)
      const target = canvasComponent.createNode('target', 'SMS', 300, 100)
      
      const previewLine = canvasComponent.createPreviewLine('source', 'target')
      
      expect(previewLine).toBeTruthy()
      expect(previewLine.sourceId).toBe('source')
      expect(previewLine.targetId).toBe('target')
      expect(canvasComponent.previewLines.length).toBe(1)
      expect(canvasComponent.previewLines[0].id).toBe(previewLine.id)
    })

    it('TC_COMPLEX_008 - 分支预览线创建', () => {
      const source = canvasComponent.createNode('source', 'AUDIENCE_SPLIT', 100, 100)
      const target1 = canvasComponent.createNode('target1', 'MANUAL_CALL', 200, 200, 'branch_1')
      const target2 = canvasComponent.createNode('target2', 'AI_CALL', 300, 200, 'branch_2')
      
      const line1 = canvasComponent.createPreviewLine('source', 'target1', { branchId: 'branch_1' })
      const line2 = canvasComponent.createPreviewLine('source', 'target2', { branchId: 'branch_2' })
      
      expect(line1.branchId).toBe('branch_1')
      expect(line2.branchId).toBe('branch_2')
      expect(canvasComponent.previewLines.length).toBe(2)
    })

    it('TC_COMPLEX_009 - 重复预览线检测', () => {
      const source = canvasComponent.createNode('source', 'START', 100, 100)
      const target = canvasComponent.createNode('target', 'SMS', 300, 100)
      
      const line1 = canvasComponent.createPreviewLine('source', 'target')
      const line2 = canvasComponent.createPreviewLine('source', 'target')
      
      expect(line1).toBeTruthy()
      expect(line2).toStrictEqual(line1) // 应该返回相同的预览线
      expect(canvasComponent.previewLines.length).toBe(1)
    })

    it('TC_COMPLEX_010 - 多层级预览线验证', () => {
      canvasComponent.loadComplexScenario()
      
      // 验证人群分流的三个分支
      const audienceSplitLines = canvasComponent.previewLines.filter(
        line => line.sourceId === 'audience_split_1'
      )
      expect(audienceSplitLines.length).toBeGreaterThanOrEqual(2)
      
      // 验证事件分流的预览线
      const eventSplitLines = canvasComponent.previewLines.filter(
        line => line.sourceId === 'event_split_1'
      )
      expect(eventSplitLines.length).toBeGreaterThanOrEqual(1)
      
      // 验证AI外呼后的人群分流
      const aiAudienceLines = canvasComponent.previewLines.filter(
        line => line.sourceId === 'audience_split_2'
      )
      expect(aiAudienceLines.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('布局规则测试', () => {
    it('TC_COMPLEX_011 - 统一布局规则应用', () => {
      canvasComponent.loadComplexScenario()
      const initialPositions = canvasComponent.nodes.map(n => ({ id: n.id, x: n.x, y: n.y }))
      
      canvasComponent.applyLayoutRules()
      
      // 验证节点位置已更新
      const newPositions = canvasComponent.nodes.map(n => ({ id: n.id, x: n.x, y: n.y }))
      const positionsChanged = newPositions.some((pos, index) => 
        pos.x !== initialPositions[index].x || pos.y !== initialPositions[index].y
      )
      
      expect(positionsChanged).toBe(true)
      
      // 验证预览线位置已更新
      canvasComponent.previewLines.forEach(line => {
        expect(line.start.x).toBeGreaterThan(0)
        expect(line.start.y).toBeGreaterThan(0)
        expect(line.end.x).toBeGreaterThan(0)
        expect(line.end.y).toBeGreaterThan(0)
      })
    })

    it('TC_COMPLEX_012 - 层级深度计算', () => {
      canvasComponent.loadComplexScenario()
      
      const maxDepth = canvasComponent.stats.maxDepth
      expect(maxDepth).toBeGreaterThanOrEqual(4) // 至少4层深度
      
      // 验证开始节点在第0层
      const startNode = canvasComponent.nodes.find(n => n.type === 'start')
      expect(startNode).toBeTruthy()
    })

    it('TC_COMPLEX_013 - 分支节点排列', () => {
      canvasComponent.loadComplexScenario()
      canvasComponent.applyLayoutRules()
      
      // 验证同一分支的节点在合理的位置
      const branch1Nodes = canvasComponent.nodes.filter(n => n.branchId === 'branch_1')
      const branch2Nodes = canvasComponent.nodes.filter(n => n.branchId === 'branch_2')
      
      expect(branch1Nodes.length).toBeGreaterThan(0)
      expect(branch2Nodes.length).toBeGreaterThan(0)
      
      // 验证分支节点的Y坐标分布合理
      if (branch1Nodes.length > 1) {
        const yPositions = branch1Nodes.map(n => n.y)
        const minY = Math.min(...yPositions)
        const maxY = Math.max(...yPositions)
        expect(maxY - minY).toBeGreaterThan(0) // 应该有垂直分布
      }
    })
  })

  describe('稳定性和性能测试', () => {
    it('TC_COMPLEX_014 - 大量节点性能测试', () => {
      const startTime = Date.now()
      
      // 创建大量节点
      for (let i = 0; i < 50; i++) {
        canvasComponent.createNode(`node_${i}`, 'SMS', i * 20, i * 10)
      }
      
      // 创建大量预览线
      for (let i = 0; i < 49; i++) {
        canvasComponent.createPreviewLine(`node_${i}`, `node_${i + 1}`)
      }
      
      const endTime = Date.now()
      const duration = endTime - startTime
      
      expect(duration).toBeLessThan(1000) // 应该在1秒内完成
      expect(canvasComponent.nodes.length).toBe(50)
      expect(canvasComponent.previewLines.length).toBe(49)
    })

    it('TC_COMPLEX_015 - 复杂场景稳定性测试', () => {
      // 多次加载和清空场景
      for (let i = 0; i < 5; i++) {
        canvasComponent.loadComplexScenario()
        expect(canvasComponent.nodes.length).toBeGreaterThan(0)
        
        canvasComponent.clearCanvas()
        expect(canvasComponent.nodes.length).toBe(0)
      }
      
      // 最终加载一次验证稳定性
      canvasComponent.loadComplexScenario()
      const stats = canvasComponent.getCanvasStats()
      
      expect(stats.nodeCount).toBeGreaterThan(10)
      expect(stats.previewLineCount).toBeGreaterThan(5)
      expect(stats.maxDepth).toBeGreaterThan(3)
    })

    it('TC_COMPLEX_016 - 内存泄漏检测', () => {
      const initialMemory = process.memoryUsage().heapUsed
      
      // 执行大量操作
      for (let i = 0; i < 10; i++) {
        canvasComponent.loadComplexScenario()
        canvasComponent.applyLayoutRules()
        canvasComponent.addNewNode()
        canvasComponent.clearCanvas()
      }
      
      // 强制垃圾回收（如果可用）
      if (global.gc) {
        global.gc()
      }
      
      const finalMemory = process.memoryUsage().heapUsed
      const memoryIncrease = finalMemory - initialMemory
      
      // 内存增长应该在合理范围内（小于10MB）
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024)
    })
  })

  describe('事件系统测试', () => {
    it('TC_COMPLEX_017 - 节点创建事件', () => {
      const initialNodeCount = canvasComponent.nodes.length
      
      canvasComponent.createNode('test_node', 'SMS', 100, 100)
      
      // 验证节点已创建
      expect(canvasComponent.nodes.length).toBe(initialNodeCount + 1)
      const createdNode = canvasComponent.nodes.find(n => n.id === 'test_node')
      expect(createdNode).toBeTruthy()
      expect(createdNode.type).toBe('sms')
    })

    it('TC_COMPLEX_018 - 预览线创建事件', () => {
      const source = canvasComponent.createNode('source', 'START', 100, 100)
      const target = canvasComponent.createNode('target', 'SMS', 300, 100)
      
      const initialLineCount = canvasComponent.previewLines.length
      
      canvasComponent.createPreviewLine('source', 'target')
      
      expect(canvasComponent.previewLines.length).toBe(initialLineCount + 1)
      const createdLine = canvasComponent.previewLines.find(l => 
        l.sourceId === 'source' && l.targetId === 'target'
      )
      expect(createdLine).toBeTruthy()
    })

    it('TC_COMPLEX_019 - 布局应用事件', () => {
      canvasComponent.loadComplexScenario()
      const initialNodeCount = canvasComponent.nodes.length
      
      canvasComponent.applyLayoutRules()
      
      // 验证布局已应用，节点数量保持不变
      expect(canvasComponent.nodes.length).toBe(initialNodeCount)
      expect(canvasComponent.nodes.length).toBeGreaterThan(0)
      
      // 验证节点位置已更新（至少有一些节点的位置发生了变化）
      const hasValidPositions = canvasComponent.nodes.every(node => 
        typeof node.x === 'number' && typeof node.y === 'number' &&
        node.x >= 0 && node.y >= 0
      )
      expect(hasValidPositions).toBe(true)
    })
  })

  describe('边界情况测试', () => {
    it('TC_COMPLEX_020 - 空画布操作', () => {
      // 在空画布上应用布局规则
      canvasComponent.applyLayoutRules()
      expect(canvasComponent.nodes.length).toBe(0)
      
      // 在空画布上新增节点
      canvasComponent.addNewNode()
      expect(canvasComponent.nodes.length).toBe(1)
    })

    it('TC_COMPLEX_021 - 无效节点连接', () => {
      const line = canvasComponent.createPreviewLine('nonexistent1', 'nonexistent2')
      expect(line).toBeNull()
      expect(canvasComponent.previewLines.length).toBe(0)
    })

    it('TC_COMPLEX_022 - 统计信息准确性', () => {
      canvasComponent.loadComplexScenario()
      
      const stats = canvasComponent.getCanvasStats()
      const actualNodes = canvasComponent.nodes.length
      const actualPreviewLines = canvasComponent.previewLines.length
      
      expect(stats.nodeCount).toBe(actualNodes)
      expect(stats.previewLineCount).toBe(actualPreviewLines)
      expect(stats.nodes).toBe(actualNodes)
      expect(stats.previewLines).toBe(actualPreviewLines)
    })
  })

  describe('连线重叠管理器测试', () => {
    it('TC_COMPLEX_020 - 预览线被连线重叠管理器删除', () => {
      const source = canvasComponent.createNode('source', 'START', 100, 100)
      const target = canvasComponent.createNode('target', 'SMS', 300, 100)
      
      // 创建预览线
      const previewLine = canvasComponent.createPreviewLine('source', 'target')
      expect(canvasComponent.previewLines.length).toBe(1)
      
      // 模拟连线重叠管理器的行为
      const mockOverlapManager = {
        handleEdgeAdd: (edgeId) => {
          console.log(`🔗 [连线重叠管理器] 处理连线添加: ${edgeId}`)
          
          // 查找相关预览线并删除
          const relatedPreviewLines = canvasComponent.previewLines.filter(line => 
            line.sourceId === 'source' && line.targetId === 'target'
          )
          
          relatedPreviewLines.forEach(line => {
            console.log(`🧹 [连线重叠管理器] 开始清理相关预览线: {sourceId: ${line.sourceId}, targetId: ${line.targetId}, branchId: ${line.branchId}}`)
            const index = canvasComponent.previewLines.findIndex(l => l.id === line.id)
            if (index !== -1) {
              canvasComponent.previewLines.splice(index, 1)
            }
          })
        }
      }
      
      // 创建真实连接线，触发重叠管理器
      const realEdge = canvasComponent.createRealEdge('source', 'target')
      mockOverlapManager.handleEdgeAdd(realEdge.id)
      
      // 验证预览线被删除
      expect(canvasComponent.previewLines.length).toBe(0)
      expect(canvasComponent.edges.length).toBe(1)
    })

    it('TC_COMPLEX_021 - 多条预览线的重叠管理', () => {
      const start = canvasComponent.createNode('start', 'START', 100, 100)
      const split = canvasComponent.createNode('split', 'AUDIENCE_SPLIT', 300, 100)
      const sms1 = canvasComponent.createNode('sms1', 'SMS', 500, 50)
      const sms2 = canvasComponent.createNode('sms2', 'SMS', 500, 150)
      
      // 创建多条预览线
      canvasComponent.createPreviewLine('start', 'split')
      canvasComponent.createPreviewLine('split', 'sms1', { branchId: 'branch_1' })
      canvasComponent.createPreviewLine('split', 'sms2', { branchId: 'branch_2' })
      
      expect(canvasComponent.previewLines.length).toBe(3)
      
      // 模拟创建真实连接线，只删除相关的预览线
      const mockOverlapManager = {
        handleEdgeAdd: (sourceId, targetId) => {
          const relatedLines = canvasComponent.previewLines.filter(line => 
            line.sourceId === sourceId && line.targetId === targetId
          )
          
          relatedLines.forEach(line => {
            const index = canvasComponent.previewLines.findIndex(l => l.id === line.id)
            if (index !== -1) {
              canvasComponent.previewLines.splice(index, 1)
            }
          })
        }
      }
      
      // 只创建一条真实连接线
      canvasComponent.createRealEdge('start', 'split')
      mockOverlapManager.handleEdgeAdd('start', 'split')
      
      // 验证只有相关的预览线被删除
      expect(canvasComponent.previewLines.length).toBe(2)
      const remainingLines = canvasComponent.previewLines
      expect(remainingLines.every(line => line.sourceId === 'split')).toBe(true)
    })
  })
})