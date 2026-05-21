// 测试节点配置状态检查脚本

// 模拟节点数据结构
const mockStartNode = {
  id: 'start-node',
  type: 'start',
  data: {
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
    nodeType: 'start'
    // 注意：这里没有设置 isConfigured 属性
  },
  getData() {
    return this.data
  }
}

console.log('=== 节点配置状态检查 ===')
console.log('节点ID:', mockStartNode.id)
console.log('节点类型:', mockStartNode.type)
console.log('节点数据:', JSON.stringify(mockStartNode.data, null, 2))

// 检查isConfigured状态
const nodeData = mockStartNode.getData()
console.log('\n=== isConfigured 状态检查 ===')
console.log('isConfigured 值:', nodeData.isConfigured)
console.log('isConfigured === false:', nodeData.isConfigured === false)
console.log('isConfigured === undefined:', nodeData.isConfigured === undefined)
console.log('isConfigured 检查结果:', nodeData.isConfigured === false || nodeData.isConfigured === undefined)

// 模拟PreviewLineValidator的检查逻辑
function checkNodeConfigurationStatus(node) {
  const nodeData = node.getData ? node.getData() : node.data || {}
  
  console.log('\n=== 预览线创建条件检查 ===')
  console.log('节点数据获取方式:', node.getData ? 'getData()方法' : 'data属性')
  console.log('获取到的nodeData:', {
    isConfigured: nodeData.isConfigured,
    hasOtherProps: Object.keys(nodeData).length > 0
  })
  
  if (nodeData.isConfigured === false || nodeData.isConfigured === undefined) {
    console.log('❌ 节点未配置，不创建预览线')
    console.log('原因: isConfigured =', nodeData.isConfigured)
    return {
      shouldCreate: false,
      reason: '节点未配置，不创建预览线',
      isConfigured: nodeData.isConfigured
    }
  }
  
  console.log('✅ 节点已配置，可以创建预览线')
  return {
    shouldCreate: true,
    reason: '节点已配置',
    isConfigured: nodeData.isConfigured
  }
}

const result = checkNodeConfigurationStatus(mockStartNode)
console.log('\n=== 最终检查结果 ===')
console.log('是否应该创建预览线:', result.shouldCreate)
console.log('原因:', result.reason)
console.log('isConfigured状态:', result.isConfigured)

// 测试修复方案
console.log('\n=== 修复方案测试 ===')
mockStartNode.data.isConfigured = true
const fixedResult = checkNodeConfigurationStatus(mockStartNode)
console.log('设置isConfigured=true后:')
console.log('是否应该创建预览线:', fixedResult.shouldCreate)
console.log('原因:', fixedResult.reason)