/**
 * 分流节点预览线测试
 * 测试带分流的节点单一预览线的生成和删除恢复
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

// 分流节点预览线组件
const BranchPreviewComponent = {
  name: 'BranchPreviewComponent',
  template: `
    <div class="branch-preview-container">
      <svg class="branch-preview-svg" :style="{ width: '100%', height: '100%' }">
        <!-- 主预览线 -->
        <line 
          v-for="line in mainPreviewLines" 
          :key="line.id"
          :x1="line.start.x" 
          :y1="line.start.y"
          :x2="line.end.x" 
          :y2="line.end.y"
          :stroke="line.color || '#1890ff'"
          :stroke-width="line.width || 2"
          :stroke-dasharray="line.dashed ? '5,5' : 'none'"
          class="main-preview-line"
        />
        <!-- 分支预览线 -->
        <g v-for="branch in branchPreviewLines" :key="branch.branchId">
          <line 
            v-for="line in branch.lines" 
            :key="line.id"
            :x1="line.start.x" 
            :y1="line.start.y"
            :x2="line.end.x" 
            :y2="line.end.y"
            :stroke="line.color || '#52c41a'"
            :stroke-width="line.width || 2"
            :stroke-dasharray="line.dashed ? '3,3' : 'none'"
            class="branch-preview-line"
          />
          <!-- 分支标签 -->
          <text 
            :x="branch.labelPosition.x" 
            :y="branch.labelPosition.y"
            :fill="branch.labelColor || '#666'"
            :font-size="branch.labelSize || 12"
            class="branch-label"
          >
            {{ branch.label }}
          </text>
        </g>
      </svg>
    </div>
  `,
  props: ['graph', 'sourceNode', 'targetNodes', 'branchConfig'],
  emits: ['main-line-created', 'branch-line-created', 'line-removed', 'branch-restored'],
  setup(props, { emit }) {
    const mainPreviewLines = ref([])
    const branchPreviewLines = ref([])
    const deletedLines = ref([]) // 存储已删除的预览线，用于恢复
    const isCreating = ref(false)
    const currentBranch = ref(null)

    // 创建主预览线（用于非分流节点）
    const createMainPreviewLine = (sourceNode, targetNode, options = {}) => {
      if (!sourceNode || !targetNode) {
        console.warn('创建主预览线需要源节点和目标节点')
        return null
      }

      const lineId = `main_preview_${sourceNode.id}_${targetNode.id}_${Date.now()}`
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
        dashed: options.dashed !== false,
        visible: true,
        created: Date.now(),
        type: 'main'
      }

      mainPreviewLines.value.push(newLine)
      isCreating.value = true

      emit('main-line-created', newLine)
      console.log(`✅ 主预览线创建成功: ${lineId}`)
      return newLine
    }

    // 创建分支预览线（用于分流节点）
    const createBranchPreviewLines = (sourceNode, targetNodes, branchConfig = {}) => {
      if (!sourceNode || !targetNodes || targetNodes.length === 0) {
        console.warn('创建分支预览线需要源节点和目标节点数组')
        return null
      }

      const branchId = `branch_${sourceNode.id}_${Date.now()}`
      const branchLines = []

      // 为每个目标节点创建分支线
      targetNodes.forEach((targetNode, index) => {
        const lineId = `branch_${branchId}_${targetNode.id}_${index}`
        const branchLine = {
          id: lineId,
          sourceId: sourceNode.id,
          targetId: targetNode.id,
          branchIndex: index,
          start: {
            x: sourceNode.position?.x || 0,
            y: sourceNode.position?.y || 0
          },
          end: {
            x: targetNode.position?.x || 100,
            y: targetNode.position?.y || 100
          },
          color: branchConfig.colors?.[index] || '#52c41a',
          width: branchConfig.width || 2,
          dashed: branchConfig.dashed !== false,
          visible: true,
          created: Date.now(),
          type: 'branch'
        }
        branchLines.push(branchLine)
      })

      // 计算分支标签位置
      const labelPosition = {
        x: (sourceNode.position?.x || 0) + 20,
        y: (sourceNode.position?.y || 0) - 10
      }

      const branchGroup = {
        branchId,
        sourceId: sourceNode.id,
        lines: branchLines,
        label: branchConfig.label || `分支 (${branchLines.length})`,
        labelPosition,
        labelColor: branchConfig.labelColor || '#666',
        labelSize: branchConfig.labelSize || 12,
        created: Date.now()
      }

      branchPreviewLines.value.push(branchGroup)
      currentBranch.value = branchGroup
      isCreating.value = true

      emit('branch-line-created', branchGroup)
      console.log(`✅ 分支预览线创建成功: ${branchId}, 包含 ${branchLines.length} 条分支`)
      return branchGroup
    }

    // 删除单一预览线
    const removeSinglePreviewLine = (lineId) => {
      // 查找主预览线
      let lineIndex = mainPreviewLines.value.findIndex(line => line.id === lineId)
      if (lineIndex !== -1) {
        const removedLine = mainPreviewLines.value.splice(lineIndex, 1)[0]
        deletedLines.value.push({
          ...removedLine,
          deletedAt: Date.now(),
          type: 'main'
        })
        
        if (mainPreviewLines.value.length === 0) {
          isCreating.value = false
        }
        
        emit('line-removed', removedLine)
        console.log(`✅ 主预览线删除成功: ${lineId}`)
        return removedLine
      }

      // 查找分支预览线
      for (let branchIndex = 0; branchIndex < branchPreviewLines.value.length; branchIndex++) {
        const branch = branchPreviewLines.value[branchIndex]
        lineIndex = branch.lines.findIndex(line => line.id === lineId)
        
        if (lineIndex !== -1) {
          const removedLine = branch.lines.splice(lineIndex, 1)[0]
          deletedLines.value.push({
            ...removedLine,
            deletedAt: Date.now(),
            type: 'branch',
            branchId: branch.branchId
          })
          
          // 如果分支中没有线了，删除整个分支组
          if (branch.lines.length === 0) {
            branchPreviewLines.value.splice(branchIndex, 1)
            if (currentBranch.value?.branchId === branch.branchId) {
              currentBranch.value = null
            }
          }
          
          if (branchPreviewLines.value.length === 0 && mainPreviewLines.value.length === 0) {
            isCreating.value = false
          }
          
          emit('line-removed', removedLine)
          console.log(`✅ 分支预览线删除成功: ${lineId}`)
          return removedLine
        }
      }

      console.warn(`未找到要删除的预览线: ${lineId}`)
      return null
    }

    // 恢复已删除的预览线
    const restoreDeletedLine = (lineId) => {
      const deletedIndex = deletedLines.value.findIndex(line => line.id === lineId)
      if (deletedIndex === -1) {
        console.warn(`未找到要恢复的预览线: ${lineId}`)
        return null
      }

      const restoredLine = deletedLines.value.splice(deletedIndex, 1)[0]
      delete restoredLine.deletedAt

      if (restoredLine.type === 'main') {
        mainPreviewLines.value.push(restoredLine)
        console.log(`✅ 主预览线恢复成功: ${lineId}`)
      } else if (restoredLine.type === 'branch') {
        // 查找或创建对应的分支组
        let branchGroup = branchPreviewLines.value.find(b => b.branchId === restoredLine.branchId)
        if (!branchGroup) {
          // 重新创建分支组
          branchGroup = {
            branchId: restoredLine.branchId,
            sourceId: restoredLine.sourceId,
            lines: [],
            label: `恢复分支`,
            labelPosition: { x: 0, y: 0 },
            labelColor: '#666',
            labelSize: 12,
            created: Date.now()
          }
          branchPreviewLines.value.push(branchGroup)
        }
        
        branchGroup.lines.push(restoredLine)
        console.log(`✅ 分支预览线恢复成功: ${lineId}`)
      }

      isCreating.value = true
      emit('branch-restored', restoredLine)
      return restoredLine
    }

    // 清除所有预览线
    const clearAllPreviewLines = () => {
      const mainCount = mainPreviewLines.value.length
      const branchCount = branchPreviewLines.value.reduce((sum, branch) => sum + branch.lines.length, 0)
      
      mainPreviewLines.value.splice(0)
      branchPreviewLines.value.splice(0)
      deletedLines.value.splice(0) // 同时清除已删除的预览线记录
      currentBranch.value = null
      isCreating.value = false
      
      const totalCount = mainCount + branchCount
      console.log(`✅ 清除所有预览线: ${totalCount} 条 (主线: ${mainCount}, 分支: ${branchCount})`)
      return totalCount
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
        isCreating: isCreating.value,
        currentBranchId: currentBranch.value?.branchId || null
      }
    }

    // 获取已删除的预览线列表
    const getDeletedLines = () => {
      return deletedLines.value.map(line => ({
        id: line.id,
        type: line.type,
        sourceId: line.sourceId,
        targetId: line.targetId,
        deletedAt: line.deletedAt,
        branchId: line.branchId
      }))
    }

    return {
      mainPreviewLines,
      branchPreviewLines,
      deletedLines,
      isCreating,
      currentBranch,
      createMainPreviewLine,
      createBranchPreviewLines,
      removeSinglePreviewLine,
      restoreDeletedLine,
      clearAllPreviewLines,
      getPreviewLineStats,
      getDeletedLines
    }
  }
}

describe('分流节点预览线测试', () => {
  let branchWrapper
  let branchComponent

  // 测试节点数据
  const createTestNode = (id, position = { x: 0, y: 0 }, nodeType = 'normal') => ({
    id,
    position,
    nodeType,
    getData: vi.fn().mockReturnValue({
      type: nodeType,
      label: `节点${id}`,
      isConfigured: true
    }),
    setData: vi.fn()
  })

  beforeEach(async () => {
    vi.clearAllMocks()
    
    // 重新创建组件实例，确保完全隔离
    if (branchWrapper) {
      branchWrapper.unmount()
    }
    
    branchWrapper = mount(BranchPreviewComponent, {
      props: {
        graph: mockGraph,
        sourceNode: null,
        targetNodes: [],
        branchConfig: {}
      },
      global: {
        provide: {
          graph: mockGraph
        }
      }
    })

    branchComponent = branchWrapper.vm
    branchComponent.clearAllPreviewLines()
    await nextTick() // 确保清除操作完成
    
    // 验证初始状态
    const initialStats = branchComponent.getPreviewLineStats()
    expect(initialStats.totalLines).toBe(0)
    expect(initialStats.deletedLines).toBe(0)
  })

  afterEach(() => {
    if (branchWrapper) {
      branchWrapper.unmount()
    }
    vi.clearAllMocks()
  })

  describe('主预览线测试', () => {
    it('TC_BRANCH_001 - 主预览线创建', async () => {
      const sourceNode = createTestNode('source1', { x: 100, y: 100 })
      const targetNode = createTestNode('target1', { x: 300, y: 200 })

      const line = branchComponent.createMainPreviewLine(sourceNode, targetNode)

      expect(line).toBeTruthy()
      expect(line.sourceId).toBe('source1')
      expect(line.targetId).toBe('target1')
      expect(line.type).toBe('main')
      expect(line.start.x).toBe(100)
      expect(line.start.y).toBe(100)
      expect(line.end.x).toBe(300)
      expect(line.end.y).toBe(200)

      const stats = branchComponent.getPreviewLineStats()
      expect(stats.mainLines).toBe(1)
      expect(stats.totalLines).toBe(1)
      expect(stats.isCreating).toBe(true)
    })

    it('TC_BRANCH_002 - 主预览线删除', async () => {
      const sourceNode = createTestNode('source1', { x: 100, y: 100 })
      const targetNode = createTestNode('target1', { x: 300, y: 200 })

      const line = branchComponent.createMainPreviewLine(sourceNode, targetNode)
      expect(branchComponent.getPreviewLineStats().mainLines).toBe(1)

      const removedLine = branchComponent.removeSinglePreviewLine(line.id)
      expect(removedLine).toBeTruthy()
      expect(removedLine.id).toBe(line.id)

      const stats = branchComponent.getPreviewLineStats()
      expect(stats.mainLines).toBe(0)
      expect(stats.deletedLines).toBe(1)
      expect(stats.isCreating).toBe(false)
    })

    it('TC_BRANCH_003 - 主预览线恢复', async () => {
      const sourceNode = createTestNode('source1', { x: 100, y: 100 })
      const targetNode = createTestNode('target1', { x: 300, y: 200 })

      const line = branchComponent.createMainPreviewLine(sourceNode, targetNode)
      const removedLine = branchComponent.removeSinglePreviewLine(line.id)
      
      expect(branchComponent.getPreviewLineStats().mainLines).toBe(0)
      expect(branchComponent.getPreviewLineStats().deletedLines).toBe(1)

      const restoredLine = branchComponent.restoreDeletedLine(removedLine.id)
      expect(restoredLine).toBeTruthy()
      expect(restoredLine.id).toBe(line.id)

      const stats = branchComponent.getPreviewLineStats()
      expect(stats.mainLines).toBe(1)
      expect(stats.deletedLines).toBe(0)
      expect(stats.isCreating).toBe(true)
    })
  })

  describe('分支预览线测试', () => {
    it('TC_BRANCH_004 - 分支预览线创建', async () => {
      const sourceNode = createTestNode('source1', { x: 100, y: 100 }, 'audience-split')
      const targetNodes = [
        createTestNode('target1', { x: 200, y: 150 }),
        createTestNode('target2', { x: 200, y: 250 })
      ]

      const branchConfig = {
        label: '人群分流',
        colors: ['#52c41a', '#1890ff'],
        width: 2
      }

      const branchGroup = branchComponent.createBranchPreviewLines(sourceNode, targetNodes, branchConfig)

      expect(branchGroup).toBeTruthy()
      expect(branchGroup.sourceId).toBe('source1')
      expect(branchGroup.lines.length).toBe(2)
      expect(branchGroup.label).toBe('人群分流')

      const line1 = branchGroup.lines[0]
      const line2 = branchGroup.lines[1]

      expect(line1.sourceId).toBe('source1')
      expect(line1.targetId).toBe('target1')
      expect(line1.type).toBe('branch')
      expect(line1.color).toBe('#52c41a')

      expect(line2.sourceId).toBe('source1')
      expect(line2.targetId).toBe('target2')
      expect(line2.type).toBe('branch')
      expect(line2.color).toBe('#1890ff')

      const stats = branchComponent.getPreviewLineStats()
      expect(stats.branchLines).toBe(2)
      expect(stats.branches).toBe(1)
      expect(stats.totalLines).toBe(2)
      expect(stats.isCreating).toBe(true)
    })

    it('TC_BRANCH_005 - 单一分支线删除', async () => {
      const sourceNode = createTestNode('source1', { x: 100, y: 100 }, 'event-split')
      const targetNodes = [
        createTestNode('target1', { x: 200, y: 150 }),
        createTestNode('target2', { x: 200, y: 250 }),
        createTestNode('target3', { x: 200, y: 350 })
      ]

      const branchGroup = branchComponent.createBranchPreviewLines(sourceNode, targetNodes)
      expect(branchComponent.getPreviewLineStats().branchLines).toBe(3)

      // 删除第一条分支线
      const firstLine = branchGroup.lines[0]
      const removedLine = branchComponent.removeSinglePreviewLine(firstLine.id)

      expect(removedLine).toBeTruthy()
      expect(removedLine.id).toBe(firstLine.id)

      const stats = branchComponent.getPreviewLineStats()
      expect(stats.branchLines).toBe(2) // 剩余2条分支线
      expect(stats.branches).toBe(1)    // 分支组还在
      expect(stats.deletedLines).toBe(1)
      expect(stats.isCreating).toBe(true) // 还有其他线在创建中
    })

    it('TC_BRANCH_006 - 分支线恢复', async () => {
      const sourceNode = createTestNode('source1', { x: 100, y: 100 }, 'ab-test')
      const targetNodes = [
        createTestNode('target1', { x: 200, y: 150 }),
        createTestNode('target2', { x: 200, y: 250 })
      ]

      const branchGroup = branchComponent.createBranchPreviewLines(sourceNode, targetNodes)
      const firstLine = branchGroup.lines[0]
      
      // 删除一条分支线
      const removedLine = branchComponent.removeSinglePreviewLine(firstLine.id)
      expect(branchComponent.getPreviewLineStats().branchLines).toBe(1)

      // 恢复分支线
      const restoredLine = branchComponent.restoreDeletedLine(removedLine.id)
      expect(restoredLine).toBeTruthy()
      expect(restoredLine.id).toBe(firstLine.id)

      const stats = branchComponent.getPreviewLineStats()
      expect(stats.branchLines).toBe(2)
      expect(stats.deletedLines).toBe(0)
    })

    it('TC_BRANCH_007 - 整个分支组删除', async () => {
      const sourceNode = createTestNode('source1', { x: 100, y: 100 }, 'audience-split')
      const targetNodes = [
        createTestNode('target1', { x: 200, y: 150 }),
        createTestNode('target2', { x: 200, y: 250 })
      ]

      const branchGroup = branchComponent.createBranchPreviewLines(sourceNode, targetNodes)
      expect(branchComponent.getPreviewLineStats().branches).toBe(1)

      // 删除所有分支线
      const line1 = branchGroup.lines[0]
      const line2 = branchGroup.lines[1]

      branchComponent.removeSinglePreviewLine(line1.id)
      expect(branchComponent.getPreviewLineStats().branches).toBe(1) // 分支组还在

      branchComponent.removeSinglePreviewLine(line2.id)
      
      const stats = branchComponent.getPreviewLineStats()
      expect(stats.branches).toBe(0)      // 分支组被删除
      expect(stats.branchLines).toBe(0)
      expect(stats.deletedLines).toBe(2)
      expect(stats.isCreating).toBe(false)
    })
  })

  describe('混合场景测试', () => {
    it('TC_BRANCH_008 - 主线和分支线混合', async () => {
      // 确保测试开始时状态干净
      branchComponent.clearAllPreviewLines()
      await nextTick()
      
      const sourceNode1 = createTestNode('source1', { x: 100, y: 100 })
      const targetNode1 = createTestNode('target1', { x: 300, y: 100 })
      
      const sourceNode2 = createTestNode('source2', { x: 100, y: 300 }, 'audience-split')
      const targetNodes2 = [
        createTestNode('target2', { x: 300, y: 250 }),
        createTestNode('target3', { x: 300, y: 350 })
      ]

      // 创建主预览线
      const mainLine = branchComponent.createMainPreviewLine(sourceNode1, targetNode1)
      
      // 创建分支预览线
      const branchGroup = branchComponent.createBranchPreviewLines(sourceNode2, targetNodes2)

      const stats = branchComponent.getPreviewLineStats()
      expect(stats.mainLines).toBe(1)
      expect(stats.branchLines).toBe(2)
      expect(stats.totalLines).toBe(3)
      expect(stats.branches).toBe(1)
      expect(stats.isCreating).toBe(true)

      // 删除主线
      branchComponent.removeSinglePreviewLine(mainLine.id)
      
      const statsAfterMainDelete = branchComponent.getPreviewLineStats()
      expect(statsAfterMainDelete.mainLines).toBe(0)
      expect(statsAfterMainDelete.branchLines).toBe(2)
      expect(statsAfterMainDelete.isCreating).toBe(true) // 分支线还在

      // 删除一条分支线
      const firstBranchLine = branchGroup.lines[0]
      branchComponent.removeSinglePreviewLine(firstBranchLine.id)
      
      const statsAfterBranchDelete = branchComponent.getPreviewLineStats()
      expect(statsAfterBranchDelete.branchLines).toBe(1)
      expect(statsAfterBranchDelete.deletedLines).toBe(2)
    })

    it('TC_BRANCH_009 - 批量恢复测试', async () => {
      // 确保测试开始时状态干净
      branchComponent.clearAllPreviewLines()
      await nextTick()
      
      const sourceNode = createTestNode('source1', { x: 100, y: 100 }, 'event-split')
      const targetNodes = [
        createTestNode('target1', { x: 200, y: 100 }),
        createTestNode('target2', { x: 200, y: 200 }),
        createTestNode('target3', { x: 200, y: 300 })
      ]

      const branchGroup = branchComponent.createBranchPreviewLines(sourceNode, targetNodes)
      
      // 删除所有分支线
      const deletedIds = []
      const linesToDelete = [...branchGroup.lines] // 复制数组避免在删除过程中修改原数组
      linesToDelete.forEach(line => {
        branchComponent.removeSinglePreviewLine(line.id)
        deletedIds.push(line.id)
      })

      expect(branchComponent.getPreviewLineStats().branchLines).toBe(0)
      expect(branchComponent.getPreviewLineStats().deletedLines).toBe(3)

      // 恢复所有分支线
      deletedIds.forEach(id => {
        branchComponent.restoreDeletedLine(id)
      })

      const finalStats = branchComponent.getPreviewLineStats()
      expect(finalStats.branchLines).toBe(3)
      expect(finalStats.deletedLines).toBe(0)
      expect(finalStats.branches).toBe(1)
    })

    it('TC_BRANCH_010 - 已删除预览线信息查询', async () => {
      // 确保测试开始时状态干净
      branchComponent.clearAllPreviewLines()
      await nextTick()
      
      const sourceNode = createTestNode('source1', { x: 100, y: 100 })
      const targetNode = createTestNode('target1', { x: 300, y: 200 })

      const line = branchComponent.createMainPreviewLine(sourceNode, targetNode)
      branchComponent.removeSinglePreviewLine(line.id)

      const deletedLines = branchComponent.getDeletedLines()
      expect(deletedLines.length).toBe(1)
      expect(deletedLines[0].id).toBe(line.id)
      expect(deletedLines[0].type).toBe('main')
      expect(deletedLines[0].sourceId).toBe('source1')
      expect(deletedLines[0].targetId).toBe('target1')
      expect(deletedLines[0].deletedAt).toBeTruthy()
    })
  })

  describe('性能和边界测试', () => {
    it('TC_BRANCH_011 - 大量分支线性能测试', async () => {
      // 确保测试开始时状态干净
      branchComponent.clearAllPreviewLines()
      await nextTick()
      
      const sourceNode = createTestNode('source1', { x: 100, y: 100 }, 'audience-split')
      const targetNodes = []
      
      // 创建50个目标节点
      for (let i = 0; i < 50; i++) {
        targetNodes.push(createTestNode(`target_${i}`, { x: 300, y: i * 20 }))
      }

      const startTime = performance.now()
      const branchGroup = branchComponent.createBranchPreviewLines(sourceNode, targetNodes)
      const creationTime = performance.now() - startTime

      expect(creationTime).toBeLessThan(500) // 应该在500ms内完成
      expect(branchGroup.lines.length).toBe(50)

      const stats = branchComponent.getPreviewLineStats()
      expect(stats.branchLines).toBe(50)
      expect(stats.branches).toBe(1)

      // 测试批量删除性能
      const deleteStartTime = performance.now()
      const linesToDelete = [...branchGroup.lines] // 复制数组避免在删除过程中修改原数组
      linesToDelete.forEach(line => {
        branchComponent.removeSinglePreviewLine(line.id)
      })
      const deleteTime = performance.now() - deleteStartTime

      expect(deleteTime).toBeLessThan(200) // 删除应该在200ms内完成
      expect(branchComponent.getPreviewLineStats().deletedLines).toBe(50)
    })

    it('TC_BRANCH_012 - 无效参数处理', async () => {
      // 确保测试开始时状态干净
      branchComponent.clearAllPreviewLines()
      await nextTick()
      
      // 验证初始状态
      let initialStats = branchComponent.getPreviewLineStats()
      expect(initialStats.totalLines).toBe(0)
      
      // 测试无效的主预览线创建
      const invalidMainLine1 = branchComponent.createMainPreviewLine(null, createTestNode('target1'))
      const invalidMainLine2 = branchComponent.createMainPreviewLine(createTestNode('source1'), null)
      
      expect(invalidMainLine1).toBeNull()
      expect(invalidMainLine2).toBeNull()

      // 测试无效的分支预览线创建
      const invalidBranchLines1 = branchComponent.createBranchPreviewLines(null, [createTestNode('target1')])
      const invalidBranchLines2 = branchComponent.createBranchPreviewLines(createTestNode('source1'), [])
      const invalidBranchLines3 = branchComponent.createBranchPreviewLines(createTestNode('source1'), null)
      
      expect(invalidBranchLines1).toBeNull()
      expect(invalidBranchLines2).toBeNull()
      expect(invalidBranchLines3).toBeNull()

      // 测试删除不存在的预览线
      const invalidDelete = branchComponent.removeSinglePreviewLine('non-existent-id')
      expect(invalidDelete).toBeNull()

      // 测试恢复不存在的预览线
      const invalidRestore = branchComponent.restoreDeletedLine('non-existent-id')
      expect(invalidRestore).toBeNull()

      // 验证所有无效操作后状态仍然为0
      const finalStats = branchComponent.getPreviewLineStats()
      expect(finalStats.totalLines).toBe(0)
      expect(finalStats.mainLines).toBe(0)
      expect(finalStats.branchLines).toBe(0)
    })
  })
})