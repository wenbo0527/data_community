// 测试实际start-node节点的配置状态
import { createApp } from 'vue'
import { Graph } from '@antv/x6'

// 模拟X6图形环境
const startNodeData = {
  type: 'start',
  nodeType: 'start',
  label: 'Start Node',
  color: '#4CAF50',
  shape: 'rect',
  width: 120,
  height: 60,
  maxOutputs: 1,
  autoExpand: true,
  nextSlots: ['slot1'],
  ports: {
    groups: {
      top: { position: 'top' },
      bottom: { position: 'bottom' }
    },
    items: [
      { id: 'port1', group: 'bottom' }
    ]
  },
  nodeName: 'Start Node',
  taskType: 'trigger',
  entryDate: '2024-01-01',
  frequency: 'once',
  deduplicationDays: 7,
  pushLimit: 1000,
  priority: 'high',
  targetAudience: 'all',
  customAudienceConfig: {},
  // 这里是关键：实际节点可能没有设置isConfigured
  // isConfigured: true  // 注释掉模拟实际情况
}

const mockGraph = {
  getCellById: (id) => {
    if (id === 'start-node') {
      return {
        id: 'start-node',
        data: startNodeData,
        getData() {
          return startNodeData
        },
        store: {
          data: {
            data: startNodeData
          }
        }
      }
    }
    return null
  },
  
  getAllCells: () => {
    return [mockGraph.getCellById('start-node')].filter(Boolean)
  }
}

console.log('=== 实际start-node节点状态检查 ===')

const startNode = mockGraph.getCellById('start-node')
if (startNode) {
  console.log('找到start-node节点')
  
  // 检查不同方式获取数据的结果
  const nodeData1 = startNode.getData ? startNode.getData() : null
  const nodeData2 = startNode.data
  const nodeData3 = startNode.store?.data?.data
  
  console.log('\n=== 数据获取方式对比 ===')
  console.log('getData()方法:', nodeData1 ? {
    type: nodeData1.type,
    isConfigured: nodeData1.isConfigured,
    hasConfig: !!nodeData1.config
  } : 'null')
  
  console.log('data属性:', nodeData2 ? {
    type: nodeData2.type,
    isConfigured: nodeData2.isConfigured,
    hasConfig: !!nodeData2.config
  } : 'null')
  
  console.log('store.data.data:', nodeData3 ? {
    type: nodeData3.type,
    isConfigured: nodeData3.isConfigured,
    hasConfig: !!nodeData3.config
  } : 'null')
  
  // 模拟PreviewLineValidator的检查逻辑
  function simulateValidatorCheck(node) {
    console.log('\n=== PreviewLineValidator检查模拟 ===')
    
    // 按照实际代码逻辑获取nodeData
    const nodeData = node.getData ? node.getData() : node.data || {}
    
    console.log('验证器获取的nodeData:', {
      type: nodeData.type,
      isConfigured: nodeData.isConfigured,
      isConfiguredType: typeof nodeData.isConfigured,
      configuredCheck1: nodeData.isConfigured === false,
      configuredCheck2: nodeData.isConfigured === undefined,
      finalCheck: nodeData.isConfigured === false || nodeData.isConfigured === undefined
    })
    
    if (nodeData.isConfigured === false || nodeData.isConfigured === undefined) {
      console.log('❌ 验证失败：节点未配置，不创建预览线')
      console.log('失败原因: isConfigured =', nodeData.isConfigured)
      return false
    }
    
    console.log('✅ 验证通过：节点已配置，可以创建预览线')
    return true
  }
  
  const validationResult = simulateValidatorCheck(startNode)
  
  console.log('\n=== 问题诊断 ===')
  if (!validationResult) {
    console.log('🔍 问题根源：start-node的isConfigured属性未正确设置')
    console.log('💡 解决方案：')
    console.log('1. 确保addStartNode方法正确设置isConfigured: true')
    console.log('2. 确保节点数据同步时保持isConfigured状态')
    console.log('3. 检查节点配置更新流程')
    
    // 测试修复方案
    console.log('\n=== 修复方案测试 ===')
    startNode.data.isConfigured = true
    const fixedResult = simulateValidatorCheck(startNode)
    console.log('设置isConfigured=true后，验证结果:', fixedResult)
  } else {
    console.log('✅ 节点配置状态正常')
  }
  
} else {
  console.log('❌ 未找到start-node节点')
}

console.log('\n=== 检查完成 ===')