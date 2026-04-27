// 测试addStartNode完整流程中的isConfigured设置

// 模拟addStartNode方法的逻辑
function simulateAddStartNode() {
  console.log('=== 模拟addStartNode流程 ===')
  
  // 1. 模拟nodeConfig
  const nodeConfig = {
    label: 'Start Node',
    width: 120,
    height: 60
  }
  
  // 2. 创建startNodeData（按照实际代码逻辑）
  const startNodeData = {
    id: 'start-node',
    type: 'start',
    label: nodeConfig.label,
    position: { x: 400, y: 100 },
    data: {
      fixed: true,
      level: 0,
      // 🔧 修复：开始节点默认为已配置状态
      isConfigured: true
    },
    config: nodeConfig,
    // 🔧 修复：在顶层也设置isConfigured字段
    isConfigured: true
  }
  
  console.log('1. startNodeData创建完成:', {
    id: startNodeData.id,
    type: startNodeData.type,
    'data.isConfigured': startNodeData.data.isConfigured,
    'isConfigured': startNodeData.isConfigured
  })
  
  // 3. 模拟addNodeToGraph中的nodeDataForGraph逻辑
  const nodeDataForGraph = {
    ...startNodeData.data,
    type: startNodeData.type,
    nodeType: startNodeData.type,
    label: startNodeData.label,
    selected: false,
    deletable: startNodeData.type !== 'start',
    level: startNodeData.data?.level || 0,
    levelIndex: startNodeData.data?.levelIndex || 0,
    config: startNodeData.config || {},
    branches: startNodeData.branches || (startNodeData.config?.branches) || [],
    // 🔧 修复：正确初始化isConfigured字段
    isConfigured: startNodeData.data?.isConfigured !== undefined ? startNodeData.data.isConfigured :
                  startNodeData.isConfigured !== undefined ? startNodeData.isConfigured :
                  // 对于开始节点，默认为已配置
                  startNodeData.type === 'start' ? true :
                  // 其他节点默认为未配置，需要用户手动配置
                  false
  }
  
  console.log('2. nodeDataForGraph处理完成:', {
    type: nodeDataForGraph.type,
    nodeType: nodeDataForGraph.nodeType,
    isConfigured: nodeDataForGraph.isConfigured,
    isConfiguredType: typeof nodeDataForGraph.isConfigured
  })
  
  // 4. 模拟X6节点创建
  const mockX6Node = {
    id: startNodeData.id,
    data: nodeDataForGraph,
    getData() {
      return this.data
    },
    store: {
      data: {
        data: nodeDataForGraph
      }
    }
  }
  
  console.log('3. 模拟X6节点创建完成:', {
    id: mockX6Node.id,
    'data.isConfigured': mockX6Node.data.isConfigured,
    'getData().isConfigured': mockX6Node.getData().isConfigured
  })
  
  return mockX6Node
}

// 模拟PreviewLineValidator的检查
function simulatePreviewLineValidation(node) {
  console.log('\n=== 模拟PreviewLineValidator检查 ===')
  
  // 按照实际PreviewLineValidator逻辑获取nodeData
  const nodeData = node.getData ? node.getData() : node.data || {}
  
  console.log('验证器获取的nodeData:', {
    type: nodeData.type,
    nodeType: nodeData.nodeType,
    isConfigured: nodeData.isConfigured,
    isConfiguredType: typeof nodeData.isConfigured
  })
  
  // checkSingleNodeRequirement逻辑
  if (nodeData.isConfigured === false || nodeData.isConfigured === undefined) {
    console.log('❌ 验证失败：节点未配置，不创建预览线')
    console.log('失败原因: isConfigured =', nodeData.isConfigured)
    return {
      shouldCreate: false,
      reason: 'Node not configured'
    }
  }
  
  console.log('✅ 验证通过：节点已配置，可以创建预览线')
  return {
    shouldCreate: true,
    reason: 'Node is configured'
  }
}

// 运行完整测试
console.log('=== 开始测试addStartNode完整流程 ===')

const createdNode = simulateAddStartNode()
const validationResult = simulatePreviewLineValidation(createdNode)

console.log('\n=== 最终结果 ===')
console.log('节点创建成功:', !!createdNode)
console.log('预览线验证结果:', validationResult)

if (validationResult.shouldCreate) {
  console.log('🎉 成功：start-node应该能创建预览线')
} else {
  console.log('❌ 失败：start-node无法创建预览线，原因:', validationResult.reason)
}

console.log('\n=== 测试完成 ===')