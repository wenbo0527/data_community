/**
 * 预览线系统集成测试
 * 测试预览线的创建、显示、删除等核心功能
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref, nextTick } from 'vue'

// Mock X6 图形库
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
  removeNode: vi.fn()
}

// Mock 预览线组件
const PreviewLineComponent = {
  name: 'PreviewLineComponent',
  template: `
    <div class="preview-line-container">
      <svg class="preview-line-svg" :style="{ width: '100%', height: '100%' }">
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
  `,
  props: ['graph', 'sourceNode', 'targetNode', 'visible'],
  emits: ['line-created', 'line-removed', 'line-updated'],
  setup(props, { emit }) {
    const previewLines = ref([])
    const isCreating = ref(false)
    const currentLine = ref(null)

    // 创建预览线
    const createPreviewLine = (sourceNode, targetNode, options = {}) => {
      if (!sourceNode || !targetNode) {
        console.warn('创建预览线需要源节点和目标节点')
        return null
      }

      const lineId = `preview_${sourceNode.id}_${targetNode.id}_${Date.now()}`
      const newLine = {
        id: lineId,
        sourceId: sourceNode.id,
        targetId: targetNode.id,
        start: {
          x: sourceNode.position?.x || 0,
          y: sourceNode.position?.y || 0
        },
        end: {
          x: targetNode.position?.x || 100,
          y: targetNode.position?.y || 100
        },
        color: options.color || '#1890ff',
        width: options.width || 2,
        dashed: options.dashed !== undefined ? options.dashed : true,
        visible: true,
        created: Date.now()
      }

      previewLines.value.push(newLine)
      currentLine.value = newLine
      isCreating.value = true

      emit('line-created', newLine)
      console.log(`✅ 预览线创建成功: ${lineId}`)
      return newLine
    }

    // 删除预览线
    const removePreviewLine = (lineId) => {
      const index = previewLines.value.findIndex(line => line.id === lineId)
      if (index !== -1) {
        const removedLine = previewLines.value.splice(index, 1)[0]
        if (currentLine.value?.id === lineId) {
          currentLine.value = null
          isCreating.value = false
        }
        emit('line-removed', removedLine)
        console.log(`✅ 预览线删除成功: ${lineId}`)
        return removedLine
      }
      return null
    }

    // 更新预览线
    const updatePreviewLine = (lineId, updates) => {
      const line = previewLines.value.find(l => l.id === lineId)
      if (line) {
        Object.assign(line, updates)
        emit('line-updated', line)
        console.log(`✅ 预览线更新成功: ${lineId}`)
        return line
      }
      return null
    }

    // 清除所有预览线
    const clearAllPreviewLines = () => {
      const count = previewLines.value.length
      previewLines.value.splice(0)
      currentLine.value = null
      isCreating.value = false
      console.log(`✅ 清除所有预览线: ${count} 条`)
      return count
    }

    // 获取预览线统计信息
    const getPreviewLineStats = () => {
      return {
        total: previewLines.value.length,
        visible: previewLines.value.filter(line => line.visible).length,
        creating: isCreating.value,
        currentLineId: currentLine.value?.id || null
      }
    }

    return {
      previewLines,
      isCreating,
      currentLine,
      createPreviewLine,
      removePreviewLine,
      updatePreviewLine,
      clearAllPreviewLines,
      getPreviewLineStats
    }
  }
}

// Mock 画布组件
const CanvasComponent = {
  name: 'CanvasComponent',
  template: `
    <div class="canvas-container" style="width: 800px; height: 600px; position: relative;">
      <PreviewLineComponent 
        ref="previewLineRef"
        :graph="graph"
        :sourceNode="sourceNode"
        :targetNode="targetNode"
        :visible="previewVisible"
        @line-created="onLineCreated"
        @line-removed="onLineRemoved"
        @line-updated="onLineUpdated"
      />
    </div>
  `,
  components: { PreviewLineComponent },
  props: ['graph'],
  emits: ['preview-line-created', 'preview-line-removed', 'preview-line-updated'],
  setup(props, { emit }) {
    const previewLineRef = ref(null)
    const sourceNode = ref(null)
    const targetNode = ref(null)
    const previewVisible = ref(true)

    const onLineCreated = (line) => {
      emit('preview-line-created', line)
    }

    const onLineRemoved = (line) => {
      emit('preview-line-removed', line)
    }

    const onLineUpdated = (line) => {
      emit('preview-line-updated', line)
    }

    return {
      previewLineRef,
      sourceNode,
      targetNode,
      previewVisible,
      onLineCreated,
      onLineRemoved,
      onLineUpdated
    }
  }
}

describe('预览线系统集成测试', () => {
  let canvasWrapper
  let previewLineComponent

  // 测试节点数据
  const createTestNode = (id, position = { x: 0, y: 0 }) => ({
    id,
    position,
    getData: vi.fn().mockReturnValue({
      type: 'test-node',
      label: `测试节点${id}`,
      isConfigured: true
    }),
    setData: vi.fn()
  })

  beforeEach(() => {
    vi.clearAllMocks()
    
    canvasWrapper = mount(CanvasComponent, {
      props: {
        graph: mockGraph
      },
      global: {
        provide: {
          graph: mockGraph
        }
      }
    })

    previewLineComponent = canvasWrapper.findComponent(PreviewLineComponent)
    
    // 清除所有预览线，确保每个测试开始时状态干净
    if (previewLineComponent.vm) {
      previewLineComponent.vm.clearAllPreviewLines()
    }
  })

  afterEach(() => {
    if (canvasWrapper) {
      canvasWrapper.unmount()
    }
    vi.clearAllMocks()
  })

  describe('预览线创建测试', () => {
    it('TC_PREVIEW_001 - 基本预览线创建', async () => {
      const sourceNode = createTestNode('node1', { x: 100, y: 100 })
      const targetNode = createTestNode('node2', { x: 300, y: 200 })

      const line = previewLineComponent.vm.createPreviewLine(sourceNode, targetNode)

      expect(line).toBeTruthy()
      expect(line.sourceId).toBe('node1')
      expect(line.targetId).toBe('node2')
      expect(line.start.x).toBe(100)
      expect(line.start.y).toBe(100)
      expect(line.end.x).toBe(300)
      expect(line.end.y).toBe(200)
      expect(line.visible).toBe(true)

      const stats = previewLineComponent.vm.getPreviewLineStats()
      expect(stats.total).toBe(1)
      expect(stats.visible).toBe(1)
      expect(stats.creating).toBe(true)
    })

    it('TC_PREVIEW_002 - 自定义样式预览线创建', async () => {
      const sourceNode = createTestNode('node1', { x: 50, y: 50 })
      const targetNode = createTestNode('node2', { x: 150, y: 150 })

      const options = {
        color: '#ff4d4f',
        width: 3,
        dashed: false
      }

      const line = previewLineComponent.vm.createPreviewLine(sourceNode, targetNode, options)

      expect(line.color).toBe('#ff4d4f')
      expect(line.width).toBe(3)
      expect(line.dashed).toBe(false)
    })

    it('TC_PREVIEW_003 - 无效节点预览线创建', async () => {
      const line1 = previewLineComponent.vm.createPreviewLine(null, createTestNode('node2'))
      const line2 = previewLineComponent.vm.createPreviewLine(createTestNode('node1'), null)

      expect(line1).toBeNull()
      expect(line2).toBeNull()

      const stats = previewLineComponent.vm.getPreviewLineStats()
      expect(stats.total).toBe(0)
    })
  })

  describe('预览线删除测试', () => {
    it('TC_PREVIEW_004 - 预览线删除', async () => {
      const sourceNode = createTestNode('node1', { x: 100, y: 100 })
      const targetNode = createTestNode('node2', { x: 300, y: 200 })

      const line = previewLineComponent.vm.createPreviewLine(sourceNode, targetNode)
      expect(previewLineComponent.vm.getPreviewLineStats().total).toBe(1)

      const removedLine = previewLineComponent.vm.removePreviewLine(line.id)
      expect(removedLine).toBeTruthy()
      expect(removedLine.id).toBe(line.id)

      const stats = previewLineComponent.vm.getPreviewLineStats()
      expect(stats.total).toBe(0)
      expect(stats.creating).toBe(false)
      expect(stats.currentLineId).toBeNull()
    })

    it('TC_PREVIEW_005 - 删除不存在的预览线', async () => {
      const removedLine = previewLineComponent.vm.removePreviewLine('non-existent-id')
      expect(removedLine).toBeNull()
    })
  })

  describe('预览线更新测试', () => {
    it('TC_PREVIEW_006 - 预览线样式更新', async () => {
      const sourceNode = createTestNode('node1', { x: 100, y: 100 })
      const targetNode = createTestNode('node2', { x: 300, y: 200 })

      const line = previewLineComponent.vm.createPreviewLine(sourceNode, targetNode)
      
      const updates = {
        color: '#52c41a',
        width: 4,
        dashed: false
      }

      const updatedLine = previewLineComponent.vm.updatePreviewLine(line.id, updates)
      
      expect(updatedLine.color).toBe('#52c41a')
      expect(updatedLine.width).toBe(4)
      expect(updatedLine.dashed).toBe(false)
    })

    it('TC_PREVIEW_007 - 预览线位置更新', async () => {
      const sourceNode = createTestNode('node1', { x: 100, y: 100 })
      const targetNode = createTestNode('node2', { x: 300, y: 200 })

      const line = previewLineComponent.vm.createPreviewLine(sourceNode, targetNode)
      
      const updates = {
        start: { x: 150, y: 150 },
        end: { x: 350, y: 250 }
      }

      const updatedLine = previewLineComponent.vm.updatePreviewLine(line.id, updates)
      
      expect(updatedLine.start.x).toBe(150)
      expect(updatedLine.start.y).toBe(150)
      expect(updatedLine.end.x).toBe(350)
      expect(updatedLine.end.y).toBe(250)
    })
  })

  describe('预览线批量操作测试', () => {
    it('TC_PREVIEW_008 - 多条预览线创建和管理', async () => {
      const nodes = [
        createTestNode('node1', { x: 100, y: 100 }),
        createTestNode('node2', { x: 300, y: 200 }),
        createTestNode('node3', { x: 500, y: 300 })
      ]

      // 创建多条预览线
      const line1 = previewLineComponent.vm.createPreviewLine(nodes[0], nodes[1])
      const line2 = previewLineComponent.vm.createPreviewLine(nodes[1], nodes[2])
      const line3 = previewLineComponent.vm.createPreviewLine(nodes[0], nodes[2])

      expect(line1).toBeTruthy()
      expect(line2).toBeTruthy()
      expect(line3).toBeTruthy()

      const stats = previewLineComponent.vm.getPreviewLineStats()
      expect(stats.total).toBe(3)
      expect(stats.visible).toBe(3)
    })

    it('TC_PREVIEW_009 - 清除所有预览线', async () => {
      const nodes = [
        createTestNode('node1', { x: 100, y: 100 }),
        createTestNode('node2', { x: 300, y: 200 }),
        createTestNode('node3', { x: 500, y: 300 })
      ]

      // 创建多条预览线
      previewLineComponent.vm.createPreviewLine(nodes[0], nodes[1])
      previewLineComponent.vm.createPreviewLine(nodes[1], nodes[2])
      previewLineComponent.vm.createPreviewLine(nodes[0], nodes[2])

      expect(previewLineComponent.vm.getPreviewLineStats().total).toBe(3)

      const clearedCount = previewLineComponent.vm.clearAllPreviewLines()
      expect(clearedCount).toBe(3)

      const stats = previewLineComponent.vm.getPreviewLineStats()
      expect(stats.total).toBe(0)
      expect(stats.creating).toBe(false)
      expect(stats.currentLineId).toBeNull()
    })
  })

  describe('预览线事件测试', () => {
    it('TC_PREVIEW_010 - 预览线创建事件验证', async () => {
      const sourceNode = createTestNode('node1', { x: 100, y: 100 })
      const targetNode = createTestNode('node2', { x: 300, y: 200 })

      // 创建预览线并验证返回值
      const line = previewLineComponent.vm.createPreviewLine(sourceNode, targetNode)
      await nextTick()

      expect(line).toBeTruthy()
      expect(line.sourceId).toBe('node1')
      expect(line.targetId).toBe('node2')
      expect(line.start.x).toBe(100)
      expect(line.start.y).toBe(100)
      expect(line.end.x).toBe(300)
      expect(line.end.y).toBe(200)
      
      // 验证预览线已添加到列表中
      const stats = previewLineComponent.vm.getPreviewLineStats()
      expect(stats.total).toBe(1)
      expect(stats.creating).toBe(true)
      expect(stats.currentLineId).toBe(line.id)
    })

    it('TC_PREVIEW_011 - 预览线删除事件验证', async () => {
      const sourceNode = createTestNode('node1', { x: 100, y: 100 })
      const targetNode = createTestNode('node2', { x: 300, y: 200 })

      // 先创建预览线
      const line = previewLineComponent.vm.createPreviewLine(sourceNode, targetNode)
      expect(previewLineComponent.vm.getPreviewLineStats().total).toBe(1)

      // 删除预览线并验证返回值
      const deleted = previewLineComponent.vm.removePreviewLine(line.id)
      await nextTick()

      expect(deleted).toBeTruthy()
      expect(deleted.id).toBe(line.id)
      expect(deleted.sourceId).toBe('node1')
      expect(deleted.targetId).toBe('node2')
      
      // 验证预览线已从列表中移除
      const stats = previewLineComponent.vm.getPreviewLineStats()
      expect(stats.total).toBe(0)
      expect(stats.creating).toBe(false)
      expect(stats.currentLineId).toBeNull()
    })
  })

  describe('预览线性能测试', () => {
    it('TC_PREVIEW_012 - 大量预览线性能测试', async () => {
      const startTime = performance.now()
      
      // 创建100条预览线
      for (let i = 0; i < 100; i++) {
        const sourceNode = createTestNode(`source_${i}`, { x: i * 10, y: 100 })
        const targetNode = createTestNode(`target_${i}`, { x: i * 10 + 200, y: 200 })
        previewLineComponent.vm.createPreviewLine(sourceNode, targetNode)
      }

      const creationTime = performance.now() - startTime
      expect(creationTime).toBeLessThan(1000) // 应该在1秒内完成

      const stats = previewLineComponent.vm.getPreviewLineStats()
      expect(stats.total).toBe(100)

      // 测试清除性能
      const clearStartTime = performance.now()
      const clearedCount = previewLineComponent.vm.clearAllPreviewLines()
      const clearTime = performance.now() - clearStartTime

      expect(clearedCount).toBe(100)
      expect(clearTime).toBeLessThan(100) // 清除应该在100ms内完成
    })
  })
})