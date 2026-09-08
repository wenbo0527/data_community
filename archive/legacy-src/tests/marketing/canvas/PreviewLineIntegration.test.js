import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref, nextTick } from 'vue'

// Mock X6 Graph
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
  addPreviewEdge: vi.fn().mockReturnValue({ id: 'preview_edge_123' }),
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
  // 布局相关方法
  layoutNodes: vi.fn(),
  getNodePosition: vi.fn().mockReturnValue({ x: 100, y: 100 }),
  setNodePosition: vi.fn()
}

// 预览线集成组件
const PreviewLineIntegrationComponent = {
  name: 'PreviewLineIntegrationComponent',
  template: `
    <div class="preview-line-integration">
      <div class="canvas-container" ref="canvasRef"></div>
      <div class="controls">
        <button @click="createMainLine" data-testid="create-main">创建主线</button>
        <button @click="createBranchLines" data-testid="create-branch">创建分支线</button>
        <button @click="clearAll" data-testid="clear-all">清除所有</button>
      </div>
      <div class="stats" data-testid="stats">
        <span>主线: {{ stats.mainLines }}</span>
        <span>分支线: {{ stats.branchLines }}</span>
        <span>总计: {{ stats.totalLines }}</span>
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
    const mainPreviewLines = ref([])
    const branchPreviewLines = ref([])
    const deletedLines = ref([])
    const isCreating = ref(false)

    // 创建主预览线
    const createMainPreviewLine = (sourceNode, targetNode) => {
      if (!sourceNode || !targetNode) return null

      const lineId = `main_${Date.now()}_${Math.random()}`
      const previewLine = {
        id: lineId,
        type: 'main',
        sourceId: sourceNode.id,
        targetId: targetNode.id,
        createdAt: Date.now()
      }

      // 在X6画布上添加预览边
      const x6Edge = props.graph.addPreviewEdge({
        id: lineId,
        source: sourceNode.id,
        target: targetNode.id,
        attrs: {
          line: {
            stroke: '#1890ff',
            strokeWidth: 2,
            strokeDasharray: '5,5'
          }
        }
      })

      previewLine.x6EdgeId = x6Edge.id
      mainPreviewLines.value.push(previewLine)
      isCreating.value = true

      return previewLine
    }

    // 创建分支预览线
    const createBranchPreviewLines = (sourceNode, targetNodes) => {
      if (!sourceNode || !targetNodes || targetNodes.length === 0) return null

      const branchId = `branch_${Date.now()}_${Math.random()}`
      const lines = targetNodes.map((targetNode, index) => {
        const lineId = `${branchId}_line_${index}`
        const previewLine = {
          id: lineId,
          type: 'branch',
          sourceId: sourceNode.id,
          targetId: targetNode.id,
          branchId,
          createdAt: Date.now()
        }

        // 在X6画布上添加预览边
        const x6Edge = props.graph.addPreviewEdge({
          id: lineId,
          source: sourceNode.id,
          target: targetNode.id,
          attrs: {
            line: {
              stroke: '#52c41a',
              strokeWidth: 2,
              strokeDasharray: '3,3'
            }
          }
        })

        previewLine.x6EdgeId = x6Edge.id
        return previewLine
      })

      const branchGroup = {
        branchId,
        sourceId: sourceNode.id,
        lines,
        createdAt: Date.now()
      }

      branchPreviewLines.value.push(branchGroup)
      isCreating.value = true

      return branchGroup
    }

    // 删除单一预览线
    const removeSinglePreviewLine = (lineId) => {
      // 查找主预览线
      let lineIndex = mainPreviewLines.value.findIndex(line => line.id === lineId)
      if (lineIndex !== -1) {
        const removedLine = mainPreviewLines.value.splice(lineIndex, 1)[0]
        
        // 从X6画布移除
        props.graph.removePreviewEdge(removedLine.x6EdgeId)
        
        deletedLines.value.push({
          ...removedLine,
          deletedAt: Date.now()
        })
        
        if (mainPreviewLines.value.length === 0 && branchPreviewLines.value.length === 0) {
          isCreating.value = false
        }
        
        return removedLine
      }

      // 查找分支预览线
      for (let branchIndex = 0; branchIndex < branchPreviewLines.value.length; branchIndex++) {
        const branch = branchPreviewLines.value[branchIndex]
        lineIndex = branch.lines.findIndex(line => line.id === lineId)
        
        if (lineIndex !== -1) {
          const removedLine = branch.lines.splice(lineIndex, 1)[0]
          
          // 从X6画布移除
          props.graph.removePreviewEdge(removedLine.x6EdgeId)
          
          deletedLines.value.push({
            ...removedLine,
            deletedAt: Date.now(),
            branchId: branch.branchId
          })
          
          // 如果分支中没有线了，删除整个分支组
          if (branch.lines.length === 0) {
            branchPreviewLines.value.splice(branchIndex, 1)
          }
          
          if (branchPreviewLines.value.length === 0 && mainPreviewLines.value.length === 0) {
            isCreating.value = false
          }
          
          return removedLine
        }
      }
      
      return null
    }

    // 清除所有预览线
    const clearAllPreviewLines = () => {
      // 清除X6画布上的所有预览边
      mainPreviewLines.value.forEach(line => {
        props.graph.removePreviewEdge(line.x6EdgeId)
      })
      
      branchPreviewLines.value.forEach(branch => {
        branch.lines.forEach(line => {
          props.graph.removePreviewEdge(line.x6EdgeId)
        })
      })

      mainPreviewLines.value.splice(0)
      branchPreviewLines.value.splice(0)
      deletedLines.value.splice(0)
      isCreating.value = false
      
      return true
    }

    // 获取预览线统计信息
    const getPreviewLineStats = () => {
      const branchCount = branchPreviewLines.value.reduce((sum, branch) => sum + branch.lines.length, 0)
      return {
        mainLines: mainPreviewLines.value.length,
        branchLines: branchCount,
        totalLines: mainPreviewLines.value.length + branchCount,
        branches: branchPreviewLines.value.length,
        deletedLines: deletedLines.value.length,
        isCreating: isCreating.value
      }
    }

    // 计算统计信息
    const stats = ref({})
    const updateStats = () => {
      stats.value = getPreviewLineStats()
    }

    // 监听数据变化更新统计
    const watchData = () => {
      updateStats()
    }

    // 控制方法
    const createMainLine = () => {
      const sourceNode = { id: 'source_main' }
      const targetNode = { id: 'target_main' }
      createMainPreviewLine(sourceNode, targetNode)
      updateStats()
    }

    const createBranchLines = () => {
      const sourceNode = { id: 'source_branch' }
      const targetNodes = [
        { id: 'target_branch_1' },
        { id: 'target_branch_2' },
        { id: 'target_branch_3' }
      ]
      createBranchPreviewLines(sourceNode, targetNodes)
      updateStats()
    }

    const clearAll = () => {
      clearAllPreviewLines()
      updateStats()
    }

    // 初始化统计
    updateStats()

    return {
      canvasRef,
      stats,
      createMainPreviewLine,
      createBranchPreviewLines,
      removeSinglePreviewLine,
      clearAllPreviewLines,
      getPreviewLineStats,
      createMainLine,
      createBranchLines,
      clearAll,
      watchData
    }
  }
}

describe('预览线系统集成测试', () => {
  let wrapper
  let component

  const createTestNode = (id, position = { x: 0, y: 0 }) => ({
    id,
    position
  })

  beforeEach(async () => {
    vi.clearAllMocks()
    
    if (wrapper) {
      wrapper.unmount()
    }
    
    wrapper = mount(PreviewLineIntegrationComponent, {
      props: {
        graph: mockGraph
      }
    })

    component = wrapper.vm
    component.clearAllPreviewLines()
    await nextTick()
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  describe('X6画布集成', () => {
    it('TC_INTEGRATION_001 - 主预览线与X6集成', async () => {
      const sourceNode = createTestNode('source1')
      const targetNode = createTestNode('target1')

      const previewLine = component.createMainPreviewLine(sourceNode, targetNode)
      
      expect(previewLine).toBeTruthy()
      expect(previewLine.x6EdgeId).toBeTruthy()
      expect(mockGraph.addPreviewEdge).toHaveBeenCalledWith({
        id: previewLine.id,
        source: sourceNode.id,
        target: targetNode.id,
        attrs: {
          line: {
            stroke: '#1890ff',
            strokeWidth: 2,
            strokeDasharray: '5,5'
          }
        }
      })

      const stats = component.getPreviewLineStats()
      expect(stats.mainLines).toBe(1)
      expect(stats.totalLines).toBe(1)
    })

    it('TC_INTEGRATION_002 - 分支预览线与X6集成', async () => {
      const sourceNode = createTestNode('source1')
      const targetNodes = [
        createTestNode('target1'),
        createTestNode('target2'),
        createTestNode('target3')
      ]

      const branchGroup = component.createBranchPreviewLines(sourceNode, targetNodes)
      
      expect(branchGroup).toBeTruthy()
      expect(branchGroup.lines).toHaveLength(3)
      expect(mockGraph.addPreviewEdge).toHaveBeenCalledTimes(3)

      branchGroup.lines.forEach((line, index) => {
        expect(line.x6EdgeId).toBeTruthy()
        expect(mockGraph.addPreviewEdge).toHaveBeenNthCalledWith(index + 1, {
          id: line.id,
          source: sourceNode.id,
          target: targetNodes[index].id,
          attrs: {
            line: {
              stroke: '#52c41a',
              strokeWidth: 2,
              strokeDasharray: '3,3'
            }
          }
        })
      })

      const stats = component.getPreviewLineStats()
      expect(stats.branchLines).toBe(3)
      expect(stats.branches).toBe(1)
    })

    it('TC_INTEGRATION_003 - 删除预览线时同步X6画布', async () => {
      const sourceNode = createTestNode('source1')
      const targetNode = createTestNode('target1')

      const previewLine = component.createMainPreviewLine(sourceNode, targetNode)
      const x6EdgeId = previewLine.x6EdgeId

      const removedLine = component.removeSinglePreviewLine(previewLine.id)
      
      expect(removedLine).toBeTruthy()
      expect(mockGraph.removePreviewEdge).toHaveBeenCalledWith(x6EdgeId)

      const stats = component.getPreviewLineStats()
      expect(stats.mainLines).toBe(0)
      expect(stats.deletedLines).toBe(1)
    })

    it('TC_INTEGRATION_004 - 清除所有预览线时同步X6画布', async () => {
      const sourceNode = createTestNode('source1')
      const targetNodes = [
        createTestNode('target1'),
        createTestNode('target2')
      ]

      // 创建主线和分支线
      const mainLine = component.createMainPreviewLine(sourceNode, targetNodes[0])
      const branchGroup = component.createBranchPreviewLines(sourceNode, targetNodes)

      expect(mockGraph.addPreviewEdge).toHaveBeenCalledTimes(3) // 1主线 + 2分支线

      // 清除所有
      component.clearAllPreviewLines()

      // 验证X6画布上的边都被移除
      expect(mockGraph.removePreviewEdge).toHaveBeenCalledTimes(3)
      expect(mockGraph.removePreviewEdge).toHaveBeenCalledWith(mainLine.x6EdgeId)
      branchGroup.lines.forEach(line => {
        expect(mockGraph.removePreviewEdge).toHaveBeenCalledWith(line.x6EdgeId)
      })

      const stats = component.getPreviewLineStats()
      expect(stats.totalLines).toBe(0)
      expect(stats.deletedLines).toBe(0)
    })
  })

  describe('UI组件集成', () => {
    it('TC_INTEGRATION_005 - 按钮控制功能', async () => {
      const createMainBtn = wrapper.find('[data-testid="create-main"]')
      const createBranchBtn = wrapper.find('[data-testid="create-branch"]')
      const clearAllBtn = wrapper.find('[data-testid="clear-all"]')

      expect(createMainBtn.exists()).toBe(true)
      expect(createBranchBtn.exists()).toBe(true)
      expect(clearAllBtn.exists()).toBe(true)

      // 点击创建主线
      await createMainBtn.trigger('click')
      await nextTick()
      
      let stats = component.getPreviewLineStats()
      expect(stats.mainLines).toBe(1)
      expect(mockGraph.addPreviewEdge).toHaveBeenCalledTimes(1)

      // 点击创建分支线
      await createBranchBtn.trigger('click')
      await nextTick()
      
      stats = component.getPreviewLineStats()
      expect(stats.branchLines).toBe(3)
      expect(mockGraph.addPreviewEdge).toHaveBeenCalledTimes(4) // 1主线 + 3分支线

      // 点击清除所有
      await clearAllBtn.trigger('click')
      await nextTick()
      
      stats = component.getPreviewLineStats()
      expect(stats.totalLines).toBe(0)
      expect(mockGraph.removePreviewEdge).toHaveBeenCalledTimes(4)
    })

    it('TC_INTEGRATION_006 - 统计信息显示', async () => {
      const statsElement = wrapper.find('[data-testid="stats"]')
      expect(statsElement.exists()).toBe(true)

      // 初始状态
      expect(statsElement.text()).toContain('主线: 0')
      expect(statsElement.text()).toContain('分支线: 0')
      expect(statsElement.text()).toContain('总计: 0')

      // 创建预览线后
      const sourceNode = createTestNode('source1')
      const targetNodes = [createTestNode('target1'), createTestNode('target2')]

      component.createMainPreviewLine(sourceNode, targetNodes[0])
      component.createBranchPreviewLines(sourceNode, targetNodes)
      component.watchData() // 手动触发统计更新
      await nextTick()

      expect(statsElement.text()).toContain('主线: 1')
      expect(statsElement.text()).toContain('分支线: 2')
      expect(statsElement.text()).toContain('总计: 3')
    })
  })

  describe('错误处理和边界情况', () => {
    it('TC_INTEGRATION_007 - X6画布方法调用失败处理', async () => {
      // 模拟X6方法调用失败
      mockGraph.addPreviewEdge.mockImplementationOnce(() => {
        throw new Error('X6 addPreviewEdge failed')
      })

      const sourceNode = createTestNode('source1')
      const targetNode = createTestNode('target1')

      expect(() => {
        component.createMainPreviewLine(sourceNode, targetNode)
      }).toThrow('X6 addPreviewEdge failed')
    })

    it('TC_INTEGRATION_008 - 无效节点参数处理', async () => {
      const result1 = component.createMainPreviewLine(null, { id: 'target1' })
      const result2 = component.createMainPreviewLine({ id: 'source1' }, null)
      const result3 = component.createBranchPreviewLines(null, [{ id: 'target1' }])
      const result4 = component.createBranchPreviewLines({ id: 'source1' }, null)
      const result5 = component.createBranchPreviewLines({ id: 'source1' }, [])

      expect(result1).toBeNull()
      expect(result2).toBeNull()
      expect(result3).toBeNull()
      expect(result4).toBeNull()
      expect(result5).toBeNull()

      expect(mockGraph.addPreviewEdge).not.toHaveBeenCalled()

      const stats = component.getPreviewLineStats()
      expect(stats.totalLines).toBe(0)
    })

    it('TC_INTEGRATION_009 - 重复操作处理', async () => {
      const sourceNode = createTestNode('source1')
      const targetNode = createTestNode('target1')

      // 多次创建相同的预览线
      const line1 = component.createMainPreviewLine(sourceNode, targetNode)
      const line2 = component.createMainPreviewLine(sourceNode, targetNode)
      const line3 = component.createMainPreviewLine(sourceNode, targetNode)

      expect(line1).toBeTruthy()
      expect(line2).toBeTruthy()
      expect(line3).toBeTruthy()
      expect(line1.id).not.toBe(line2.id)
      expect(line2.id).not.toBe(line3.id)

      const stats = component.getPreviewLineStats()
      expect(stats.mainLines).toBe(3)
      expect(mockGraph.addPreviewEdge).toHaveBeenCalledTimes(3)
    })

    it('TC_INTEGRATION_010 - 大量预览线性能测试', async () => {
      const sourceNode = createTestNode('source1')
      const targetNodes = Array.from({ length: 100 }, (_, i) => createTestNode(`target_${i}`))

      const startTime = Date.now()
      const branchGroup = component.createBranchPreviewLines(sourceNode, targetNodes)
      const endTime = Date.now()

      expect(branchGroup).toBeTruthy()
      expect(branchGroup.lines).toHaveLength(100)
      expect(endTime - startTime).toBeLessThan(1000) // 应该在1秒内完成

      const stats = component.getPreviewLineStats()
      expect(stats.branchLines).toBe(100)
      expect(stats.branches).toBe(1)
      expect(mockGraph.addPreviewEdge).toHaveBeenCalledTimes(100)
    })
  })
})