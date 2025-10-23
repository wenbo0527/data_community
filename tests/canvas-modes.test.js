/**
 * 画布查询与统计模式测试
 * 测试画布详情页的查询模式和统计模式功能
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import TaskFlowCanvas from '../src/pages/marketing/tasks/components/TaskFlowCanvas.vue'
import QueryModePanel from '../src/pages/marketing/tasks/components/QueryModePanel.vue'
import StatisticsModePanel from '../src/pages/marketing/tasks/components/StatisticsModePanel.vue'

// 模拟画布数据
const mockCanvasData = {
  nodes: [
    { id: 'node1', type: 'start', title: '开始节点', status: 'active' },
    { id: 'node2', type: 'condition', title: '条件节点', status: 'active' },
    { id: 'node3', type: 'action', title: '动作节点', status: 'inactive' },
    { id: 'node4', type: 'end', title: '结束节点', status: 'active' }
  ],
  edges: [
    { id: 'edge1', source: 'node1', target: 'node2' },
    { id: 'edge2', source: 'node2', target: 'node3' },
    { id: 'edge3', source: 'node3', target: 'node4' }
  ]
}

// 模拟X6图实例
const mockGraph = {
  getCells: () => [],
  getCellById: (id) => ({
    isNode: () => true,
    removeAttr: () => {},
    setAttr: () => {}
  }),
  centerCell: () => {}
}

describe('TaskFlowCanvas 模式切换', () => {
  let wrapper

  beforeEach(() => {
    // 模拟DOM环境
    document.body.innerHTML = '<div id="app"></div>'
    
    wrapper = mount(TaskFlowCanvas, {
      props: {
        taskId: 'test-task-1'
      },
      global: {
        stubs: {
          'a-button': true,
          'a-button-group': true,
          'a-select': true,
          'a-tooltip': true,
          'a-drawer': true,
          'a-modal': true
        }
      }
    })
  })

  it('应该正确初始化画布模式状态', () => {
    expect(wrapper.vm.currentCanvasMode).toBe('normal')
    expect(wrapper.vm.showQueryPanel).toBe(false)
    expect(wrapper.vm.showStatisticsPanel).toBe(false)
  })

  it('应该能够切换到查询模式', async () => {
    await wrapper.vm.setCanvasMode('query')
    
    expect(wrapper.vm.currentCanvasMode).toBe('query')
    expect(wrapper.vm.showQueryPanel).toBe(true)
    expect(wrapper.vm.showStatisticsPanel).toBe(false)
  })

  it('应该能够切换到统计模式', async () => {
    await wrapper.vm.setCanvasMode('statistics')
    
    expect(wrapper.vm.currentCanvasMode).toBe('statistics')
    expect(wrapper.vm.showQueryPanel).toBe(false)
    expect(wrapper.vm.showStatisticsPanel).toBe(true)
  })

  it('应该能够获取当前画布数据', () => {
    // 模拟画布有数据
    wrapper.vm.nodes = mockCanvasData.nodes
    wrapper.vm.edges = mockCanvasData.edges
    
    const canvasData = wrapper.vm.getCurrentCanvasData()
    
    expect(canvasData).toHaveProperty('nodes')
    expect(canvasData).toHaveProperty('edges')
    expect(canvasData.nodes).toHaveLength(4)
    expect(canvasData.edges).toHaveLength(3)
  })
})

describe('QueryModePanel 查询功能', () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(QueryModePanel, {
      props: {
        canvasData: mockCanvasData,
        graph: mockGraph
      },
      global: {
        stubs: {
          'a-select': true,
          'a-option': true,
          'a-input-number': true,
          'a-button': true,
          'icon-search': true
        }
      }
    })
  })

  it('应该正确初始化查询表单', () => {
    expect(wrapper.vm.queryForm.nodeType).toBe('')
    expect(wrapper.vm.queryForm.nodeStatus).toBe('')
    expect(wrapper.vm.queryForm.connectionCount).toBe(null)
  })

  it('应该能够按节点类型查询', async () => {
    wrapper.vm.queryForm.nodeType = 'start'
    await wrapper.vm.executeQuery()
    
    expect(wrapper.vm.queryResults).toHaveLength(1)
    expect(wrapper.vm.queryResults[0].type).toBe('start')
  })

  it('应该能够按节点状态查询', async () => {
    wrapper.vm.queryForm.nodeStatus = 'active'
    await wrapper.vm.executeQuery()
    
    expect(wrapper.vm.queryResults).toHaveLength(3)
    expect(wrapper.vm.queryResults.every(node => node.status === 'active')).toBe(true)
  })

  it('应该能够重置查询条件', async () => {
    wrapper.vm.queryForm.nodeType = 'start'
    wrapper.vm.queryForm.nodeStatus = 'active'
    
    await wrapper.vm.resetQuery()
    
    expect(wrapper.vm.queryForm.nodeType).toBe('')
    expect(wrapper.vm.queryForm.nodeStatus).toBe('')
    expect(wrapper.vm.queryResults).toHaveLength(0)
  })
})

describe('StatisticsModePanel 统计功能', () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(StatisticsModePanel, {
      props: {
        canvasData: mockCanvasData,
        graph: mockGraph
      },
      global: {
        stubs: {
          'a-button': true,
          'icon-check-circle': true,
          'icon-close-circle': true,
          'icon-refresh': true,
          'icon-download': true
        }
      }
    })
  })

  it('应该正确计算基础统计信息', () => {
    const stats = wrapper.vm.basicStats
    
    expect(stats.totalNodes).toBe(4)
    expect(stats.totalEdges).toBe(3)
    expect(parseFloat(stats.avgConnections)).toBeCloseTo(1.5)
  })

  it('应该正确统计节点类型分布', () => {
    const typeStats = wrapper.vm.nodeTypeStats
    
    expect(typeStats.start).toBe(1)
    expect(typeStats.condition).toBe(1)
    expect(typeStats.action).toBe(1)
    expect(typeStats.end).toBe(1)
  })

  it('应该正确计算流程健康度', () => {
    expect(wrapper.vm.hasStartNode).toBe(true)
    expect(wrapper.vm.hasEndNode).toBe(true)
    expect(wrapper.vm.noIsolatedNodes).toBe(true)
    expect(wrapper.vm.hasValidFlow).toBe(true)
    expect(wrapper.vm.healthScore).toBe(100)
  })

  it('应该能够找到最高连接度节点', () => {
    const highestNode = wrapper.vm.highestConnectedNode
    
    expect(highestNode.connections).toBeGreaterThanOrEqual(1)
    expect(['node1', 'node2', 'node3', 'node4']).toContain(highestNode.id)
  })

  it('应该正确计算孤立节点数量', () => {
    expect(wrapper.vm.isolatedNodesCount).toBe(0)
  })
})

describe('画布数据同步', () => {
  it('QueryModePanel 应该响应画布数据变化', async () => {
    const wrapper = mount(QueryModePanel, {
      props: {
        canvasData: mockCanvasData,
        graph: mockGraph
      },
      global: {
        stubs: {
          'a-select': true,
          'a-option': true,
          'a-input-number': true,
          'a-button': true,
          'icon-search': true
        }
      }
    })

    // 执行初始查询
    wrapper.vm.queryForm.nodeType = 'start'
    await wrapper.vm.executeQuery()
    expect(wrapper.vm.queryResults).toHaveLength(1)

    // 更新画布数据
    const newCanvasData = {
      ...mockCanvasData,
      nodes: [
        ...mockCanvasData.nodes,
        { id: 'node5', type: 'start', title: '新开始节点', status: 'active' }
      ]
    }

    await wrapper.setProps({ canvasData: newCanvasData })
    
    // 查询结果应该自动更新
    expect(wrapper.vm.queryResults).toHaveLength(2)
  })

  it('StatisticsModePanel 应该响应画布数据变化', async () => {
    const wrapper = mount(StatisticsModePanel, {
      props: {
        canvasData: mockCanvasData,
        graph: mockGraph
      },
      global: {
        stubs: {
          'a-button': true,
          'icon-check-circle': true,
          'icon-close-circle': true,
          'icon-refresh': true,
          'icon-download': true
        }
      }
    })

    expect(wrapper.vm.basicStats.totalNodes).toBe(4)

    // 更新画布数据
    const newCanvasData = {
      ...mockCanvasData,
      nodes: [
        ...mockCanvasData.nodes,
        { id: 'node5', type: 'action', title: '新动作节点', status: 'active' }
      ]
    }

    await wrapper.setProps({ canvasData: newCanvasData })
    
    // 统计信息应该自动更新
    expect(wrapper.vm.basicStats.totalNodes).toBe(5)
    expect(wrapper.vm.nodeTypeStats.action).toBe(2)
  })
})