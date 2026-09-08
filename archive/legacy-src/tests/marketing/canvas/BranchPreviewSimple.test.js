import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref, nextTick } from 'vue'

// 简化的分支预览线组件，专注于核心逻辑
const SimpleBranchComponent = {
  name: 'SimpleBranchComponent',
  template: `<div class="simple-branch"></div>`,
  setup() {
    const branches = ref([])
    const deletedLines = ref([])
    
    const createBranchGroup = (sourceNode, targetNodes) => {
      const branchId = `branch_${Date.now()}_${Math.random()}`
      const lines = targetNodes.map((target, index) => ({
        id: `line_${branchId}_${index}`,
        sourceId: sourceNode.id,
        targetId: target.id,
        branchId
      }))
      
      const branch = {
        branchId,
        sourceId: sourceNode.id,
        lines
      }
      
      branches.value.push(branch)
      return branch
    }
    
    const removeLine = (lineId) => {
      for (let i = 0; i < branches.value.length; i++) {
        const branch = branches.value[i]
        const lineIndex = branch.lines.findIndex(line => line.id === lineId)
        
        if (lineIndex !== -1) {
          const removedLine = branch.lines.splice(lineIndex, 1)[0]
          deletedLines.value.push(removedLine)
          
          // 如果分支中没有线了，删除整个分支
          if (branch.lines.length === 0) {
            branches.value.splice(i, 1)
          }
          
          return removedLine
        }
      }
      return null
    }
    
    const getStats = () => ({
      branches: branches.value.length,
      branchLines: branches.value.reduce((sum, branch) => sum + branch.lines.length, 0),
      deletedLines: deletedLines.value.length
    })
    
    const clear = () => {
      branches.value.splice(0)
      deletedLines.value.splice(0)
    }
    
    return {
      createBranchGroup,
      removeLine,
      getStats,
      clear
    }
  }
}

describe('简化分支预览线测试', () => {
  let wrapper
  let component

  const createTestNode = (id) => ({ id })

  beforeEach(async () => {
    vi.clearAllMocks()
    
    if (wrapper) {
      wrapper.unmount()
    }
    
    wrapper = mount(SimpleBranchComponent)
    component = wrapper.vm
    component.clear()
    await nextTick()
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  it('TC_SIMPLE_001 - 创建分支组', () => {
    const sourceNode = createTestNode('source1')
    const targetNodes = [
      createTestNode('target1'),
      createTestNode('target2')
    ]

    const branchGroup = component.createBranchGroup(sourceNode, targetNodes)
    
    expect(branchGroup).toBeTruthy()
    expect(branchGroup.lines).toHaveLength(2)
    
    const stats = component.getStats()
    expect(stats.branches).toBe(1)
    expect(stats.branchLines).toBe(2)
    expect(stats.deletedLines).toBe(0)
  })

  it('TC_SIMPLE_002 - 删除单条分支线', () => {
    const sourceNode = createTestNode('source1')
    const targetNodes = [
      createTestNode('target1'),
      createTestNode('target2'),
      createTestNode('target3')
    ]

    const branchGroup = component.createBranchGroup(sourceNode, targetNodes)
    const firstLine = branchGroup.lines[0]
    
    const removedLine = component.removeLine(firstLine.id)
    
    expect(removedLine).toBeTruthy()
    expect(removedLine.id).toBe(firstLine.id)
    
    const stats = component.getStats()
    expect(stats.branches).toBe(1)      // 分支组还在
    expect(stats.branchLines).toBe(2)   // 剩余2条线
    expect(stats.deletedLines).toBe(1)  // 删除了1条线
  })

  it('TC_SIMPLE_003 - 删除所有分支线导致分支组删除', () => {
    const sourceNode = createTestNode('source1')
    const targetNodes = [
      createTestNode('target1'),
      createTestNode('target2')
    ]

    const branchGroup = component.createBranchGroup(sourceNode, targetNodes)
    
    // 删除第一条线
    const line1 = branchGroup.lines[0]
    component.removeLine(line1.id)
    
    let stats = component.getStats()
    expect(stats.branches).toBe(1)      // 分支组还在
    expect(stats.branchLines).toBe(1)   // 剩余1条线
    
    // 删除第二条线
    const line2 = branchGroup.lines[0]  // 注意：删除后索引变化
    component.removeLine(line2.id)
    
    stats = component.getStats()
    expect(stats.branches).toBe(0)      // 分支组被删除
    expect(stats.branchLines).toBe(0)   // 没有分支线了
    expect(stats.deletedLines).toBe(2)  // 删除了2条线
  })

  it('TC_SIMPLE_004 - 多个分支组管理', () => {
    const sourceNode1 = createTestNode('source1')
    const targetNodes1 = [createTestNode('target1'), createTestNode('target2')]
    
    const sourceNode2 = createTestNode('source2')
    const targetNodes2 = [createTestNode('target3'), createTestNode('target4')]

    // 创建两个分支组
    const branch1 = component.createBranchGroup(sourceNode1, targetNodes1)
    const branch2 = component.createBranchGroup(sourceNode2, targetNodes2)
    
    let stats = component.getStats()
    expect(stats.branches).toBe(2)
    expect(stats.branchLines).toBe(4)
    
    // 删除第一个分支组的所有线
    component.removeLine(branch1.lines[0].id)
    component.removeLine(branch1.lines[0].id)  // 注意索引变化
    
    stats = component.getStats()
    expect(stats.branches).toBe(1)      // 只剩一个分支组
    expect(stats.branchLines).toBe(2)   // 剩余2条线
    expect(stats.deletedLines).toBe(2)  // 删除了2条线
  })

  it('TC_SIMPLE_005 - 清除所有状态', () => {
    const sourceNode = createTestNode('source1')
    const targetNodes = [createTestNode('target1'), createTestNode('target2')]

    component.createBranchGroup(sourceNode, targetNodes)
    component.removeLine(component.getStats().branchLines > 0 ? 'line_' : 'invalid')
    
    component.clear()
    
    const stats = component.getStats()
    expect(stats.branches).toBe(0)
    expect(stats.branchLines).toBe(0)
    expect(stats.deletedLines).toBe(0)
  })
})