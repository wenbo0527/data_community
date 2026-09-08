/**
 * 分流节点预览线核心功能测试
 * 专注于测试分流预览线的基本功能，避免测试间相互影响
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

// 简化的分流预览线组件
const SimpleBranchPreviewComponent = {
  name: 'SimpleBranchPreviewComponent',
  template: `<div class="simple-branch-preview"></div>`,
  setup() {
    const mainPreviewLines = ref([])
    const branchPreviewLines = ref([])
    const deletedLines = ref([])
    const isCreating = ref(false)

    // 创建主预览线
    const createMainPreviewLine = (sourceNode, targetNode, options = {}) => {
      if (!sourceNode || !targetNode) {
        return null
      }

      const lineId = `main_${sourceNode.id}_${targetNode.id}_${Date.now()}`
      const newLine = {
        id: lineId,
        sourceId: sourceNode.id,
        targetId: targetNode.id,
        type: 'main',
        created: Date.now()
      }

      mainPreviewLines.value.push(newLine)
      isCreating.value = true
      return newLine
    }

    // 创建分支预览线
    const createBranchPreviewLines = (sourceNode, targetNodes, branchConfig = {}) => {
      if (!sourceNode || !targetNodes || targetNodes.length === 0) {
        return null
      }

      const branchId = `branch_${sourceNode.id}_${Date.now()}`
      const branchLines = []

      targetNodes.forEach((targetNode, index) => {
        const lineId = `${branchId}_${targetNode.id}_${index}`
        const branchLine = {
          id: lineId,
          sourceId: sourceNode.id,
          targetId: targetNode.id,
          branchIndex: index,
          type: 'branch',
          created: Date.now()
        }
        branchLines.push(branchLine)
      })

      const branchGroup = {
        branchId,
        sourceId: sourceNode.id,
        lines: branchLines,
        created: Date.now()
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

    // 恢复已删除的预览线
    const restoreDeletedLine = (lineId) => {
      const deletedIndex = deletedLines.value.findIndex(line => line.id === lineId)
      if (deletedIndex === -1) {
        return null
      }

      const restoredLine = deletedLines.value.splice(deletedIndex, 1)[0]
      delete restoredLine.deletedAt

      if (restoredLine.type === 'main') {
        mainPreviewLines.value.push(restoredLine)
      } else if (restoredLine.type === 'branch') {
        // 查找或创建对应的分支组
        let branchGroup = branchPreviewLines.value.find(b => b.branchId === restoredLine.branchId)
        if (!branchGroup) {
          branchGroup = {
            branchId: restoredLine.branchId,
            sourceId: restoredLine.sourceId,
            lines: [],
            created: Date.now()
          }
          branchPreviewLines.value.push(branchGroup)
        }
        
        branchGroup.lines.push(restoredLine)
      }

      isCreating.value = true
      return restoredLine
    }

    // 清除所有预览线
    const clearAllPreviewLines = () => {
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

    return {
      createMainPreviewLine,
      createBranchPreviewLines,
      removeSinglePreviewLine,
      restoreDeletedLine,
      clearAllPreviewLines,
      getPreviewLineStats
    }
  }
}

describe('分流节点预览线核心功能测试', () => {
  let wrapper
  let component

  // 测试节点数据
  const createTestNode = (id, position = { x: 0, y: 0 }) => ({
    id,
    position
  })

  beforeEach(async () => {
    vi.clearAllMocks()
    
    // 重新创建组件实例以确保完全隔离
    if (wrapper) {
      wrapper.unmount()
    }
    
    wrapper = mount(SimpleBranchPreviewComponent, {
      props: {
        graph: mockGraph
      }
    })

    component = wrapper.vm
    
    // 强制清除所有状态
    component.clearAllPreviewLines()
    await nextTick()
    
    // 再次清除确保状态干净
    component.clearAllPreviewLines()
    await nextTick()
    
    // 验证初始状态
    const initialStats = component.getPreviewLineStats()
    if (initialStats.branches !== 0 || initialStats.branchLines !== 0 || 
        initialStats.mainLines !== 0 || initialStats.deletedLines !== 0) {
      console.warn('Initial state not clean:', initialStats)
      // 强制重置状态
      component.clearAllPreviewLines()
      await nextTick()
    }
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
    vi.clearAllMocks()
  })

  describe('主预览线功能', () => {
    it('TC_CORE_001 - 主预览线创建', async () => {
      const sourceNode = createTestNode('source1', { x: 100, y: 100 })
      const targetNode = createTestNode('target1', { x: 300, y: 200 })

      const line = component.createMainPreviewLine(sourceNode, targetNode)

      expect(line).toBeTruthy()
      expect(line.sourceId).toBe('source1')
      expect(line.targetId).toBe('target1')
      expect(line.type).toBe('main')

      const stats = component.getPreviewLineStats()
      expect(stats.mainLines).toBe(1)
      expect(stats.totalLines).toBe(1)
      expect(stats.isCreating).toBe(true)
    })

    it('TC_CORE_002 - 主预览线删除', async () => {
      const sourceNode = createTestNode('source1')
      const targetNode = createTestNode('target1')

      const line = component.createMainPreviewLine(sourceNode, targetNode)
      const removedLine = component.removeSinglePreviewLine(line.id)

      expect(removedLine).toBeTruthy()
      expect(removedLine.id).toBe(line.id)

      const stats = component.getPreviewLineStats()
      expect(stats.mainLines).toBe(0)
      expect(stats.deletedLines).toBe(1)
      expect(stats.isCreating).toBe(false)
    })

    it('TC_CORE_003 - 主预览线恢复', async () => {
      const sourceNode = createTestNode('source1')
      const targetNode = createTestNode('target1')

      const line = component.createMainPreviewLine(sourceNode, targetNode)
      const removedLine = component.removeSinglePreviewLine(line.id)
      const restoredLine = component.restoreDeletedLine(removedLine.id)

      expect(restoredLine).toBeTruthy()
      expect(restoredLine.id).toBe(line.id)

      const stats = component.getPreviewLineStats()
      expect(stats.mainLines).toBe(1)
      expect(stats.deletedLines).toBe(0)
      expect(stats.isCreating).toBe(true)
    })
  })

  describe('分支预览线功能', () => {
    it('TC_CORE_004 - 分支预览线创建', async () => {
      const sourceNode = createTestNode('source1')
      const targetNodes = [
        createTestNode('target1'),
        createTestNode('target2')
      ]

      const branchGroup = component.createBranchPreviewLines(sourceNode, targetNodes)

      expect(branchGroup).toBeTruthy()
      expect(branchGroup.sourceId).toBe('source1')
      expect(branchGroup.lines.length).toBe(2)

      const stats = component.getPreviewLineStats()
      expect(stats.branchLines).toBe(2)
      expect(stats.branches).toBe(1)
      expect(stats.totalLines).toBe(2)
      expect(stats.isCreating).toBe(true)
    })

    it('TC_CORE_005 - 单一分支线删除', async () => {
      const sourceNode = createTestNode('source1')
      const targetNodes = [
        createTestNode('target1'),
        createTestNode('target2'),
        createTestNode('target3')
      ]

      const branchGroup = component.createBranchPreviewLines(sourceNode, targetNodes)
      const firstLine = branchGroup.lines[0]
      const removedLine = component.removeSinglePreviewLine(firstLine.id)

      expect(removedLine).toBeTruthy()
      expect(removedLine.id).toBe(firstLine.id)

      const stats = component.getPreviewLineStats()
      expect(stats.branchLines).toBe(2) // 剩余2条分支线
      expect(stats.branches).toBe(1)    // 分支组还在
      expect(stats.deletedLines).toBe(1)
      expect(stats.isCreating).toBe(true) // 还有其他线在创建中
    })

    it('TC_CORE_006 - 分支线恢复', async () => {
      const sourceNode = createTestNode('source1')
      const targetNodes = [
        createTestNode('target1'),
        createTestNode('target2')
      ]

      const branchGroup = component.createBranchPreviewLines(sourceNode, targetNodes)
      const firstLine = branchGroup.lines[0]
      
      const removedLine = component.removeSinglePreviewLine(firstLine.id)
      const restoredLine = component.restoreDeletedLine(removedLine.id)

      expect(restoredLine).toBeTruthy()
      expect(restoredLine.id).toBe(firstLine.id)

      const stats = component.getPreviewLineStats()
      expect(stats.branchLines).toBe(2)
      expect(stats.deletedLines).toBe(0)
    })

    it('TC_CORE_007 - 整个分支组删除', async () => {
      const sourceNode = createTestNode('source1')
      const targetNodes = [
        createTestNode('target1'),
        createTestNode('target2')
      ]

      // 调试：检查初始状态
      console.log('Initial stats:', component.getPreviewLineStats())
      
      const branchGroup = component.createBranchPreviewLines(sourceNode, targetNodes)
      
      // 调试：检查创建后状态
      console.log('After creation stats:', component.getPreviewLineStats())
      console.log('Branch group:', branchGroup)
      
      expect(component.getPreviewLineStats().branches).toBe(1)
      
      // 删除所有分支线
      const line1 = branchGroup.lines[0]
      const line2 = branchGroup.lines[1]

      component.removeSinglePreviewLine(line1.id)
      console.log('After first deletion:', component.getPreviewLineStats())
      expect(component.getPreviewLineStats().branches).toBe(1) // 分支组还在
      
      component.removeSinglePreviewLine(line2.id)
      console.log('After second deletion:', component.getPreviewLineStats())
      
      const stats = component.getPreviewLineStats()
      expect(stats.branches).toBe(0)      // 分支组被删除
      expect(stats.branchLines).toBe(0)
      expect(stats.deletedLines).toBe(2)
      expect(stats.isCreating).toBe(false)
    })
  })

  describe('无效参数处理', () => {
    it('TC_CORE_008 - 无效参数处理', async () => {
      // 测试无效的主预览线创建
      const invalidMainLine1 = component.createMainPreviewLine(null, createTestNode('target1'))
      const invalidMainLine2 = component.createMainPreviewLine(createTestNode('source1'), null)
      
      expect(invalidMainLine1).toBeNull()
      expect(invalidMainLine2).toBeNull()

      // 测试无效的分支预览线创建
      const invalidBranchLines1 = component.createBranchPreviewLines(null, [createTestNode('target1')])
      const invalidBranchLines2 = component.createBranchPreviewLines(createTestNode('source1'), [])
      const invalidBranchLines3 = component.createBranchPreviewLines(createTestNode('source1'), null)
      
      expect(invalidBranchLines1).toBeNull()
      expect(invalidBranchLines2).toBeNull()
      expect(invalidBranchLines3).toBeNull()

      // 测试删除不存在的预览线
      const invalidDelete = component.removeSinglePreviewLine('non-existent-id')
      expect(invalidDelete).toBeNull()

      // 测试恢复不存在的预览线
      const invalidRestore = component.restoreDeletedLine('non-existent-id')
      expect(invalidRestore).toBeNull()

      const stats = component.getPreviewLineStats()
      expect(stats.totalLines).toBe(0)
      expect(stats.deletedLines).toBe(0)
    })
  })

  describe('混合场景测试', () => {
    it('TC_CORE_009 - 主线和分支线混合', async () => {
      const sourceNode1 = createTestNode('source1')
      const targetNode1 = createTestNode('target1')
      
      const sourceNode2 = createTestNode('source2')
      const targetNodes2 = [
        createTestNode('target2'),
        createTestNode('target3')
      ]

      // 创建主预览线
      const mainLine = component.createMainPreviewLine(sourceNode1, targetNode1)
      
      // 创建分支预览线
      const branchGroup = component.createBranchPreviewLines(sourceNode2, targetNodes2)

      const stats = component.getPreviewLineStats()
      expect(stats.mainLines).toBe(1)
      expect(stats.branchLines).toBe(2)
      expect(stats.totalLines).toBe(3)
      expect(stats.branches).toBe(1)
      expect(stats.isCreating).toBe(true)

      // 删除主线
      component.removeSinglePreviewLine(mainLine.id)
      
      const statsAfterMainDelete = component.getPreviewLineStats()
      expect(statsAfterMainDelete.mainLines).toBe(0)
      expect(statsAfterMainDelete.branchLines).toBe(2)
      expect(statsAfterMainDelete.isCreating).toBe(true) // 分支线还在

      // 删除一条分支线
      const firstBranchLine = branchGroup.lines[0]
      component.removeSinglePreviewLine(firstBranchLine.id)
      
      const statsAfterBranchDelete = component.getPreviewLineStats()
      expect(statsAfterBranchDelete.branchLines).toBe(1)
      expect(statsAfterBranchDelete.deletedLines).toBe(2)
    })

    it('TC_CORE_010 - 清除所有预览线', async () => {
      const sourceNode1 = createTestNode('source1')
      const targetNode1 = createTestNode('target1')
      
      const sourceNode2 = createTestNode('source2')
      const targetNodes2 = [
        createTestNode('target2'),
        createTestNode('target3')
      ]

      // 创建主预览线和分支预览线
      component.createMainPreviewLine(sourceNode1, targetNode1)
      component.createBranchPreviewLines(sourceNode2, targetNodes2)

      let stats = component.getPreviewLineStats()
      expect(stats.totalLines).toBe(3)

      // 清除所有预览线
      const result = component.clearAllPreviewLines()
      expect(result).toBe(true)

      stats = component.getPreviewLineStats()
      expect(stats.totalLines).toBe(0)
      expect(stats.deletedLines).toBe(0)
      expect(stats.isCreating).toBe(false)
    })
  })
})