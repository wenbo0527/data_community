/**
 * 测试预览线创建完整流程
 * 验证从节点创建到预览线显示的整个过程
 */

// 模拟X6图形环境
const mockGraph = {
  getCellById: (id) => {
    if (id === 'start-node') {
      return {
        id: 'start-node',
        type: 'start',
        getData: () => ({
          type: 'start',
          nodeType: 'start',
          isConfigured: undefined, // 这里是关键问题
          label: 'Start Node'
        }),
        data: {
          type: 'start',
          nodeType: 'start', 
          isConfigured: undefined, // 这里也是关键问题
          label: 'Start Node'
        }
      }
    }
    return null
  }
}

// 模拟PreviewLineValidator的checkSingleNodeRequirement方法
function checkSingleNodeRequirement(node, requestedState, existingLines) {
  console.log('=== 开始检查单一节点预览线需求 ===')
  
  // 获取节点数据
  const nodeData = node.getData ? node.getData() : node.data || {}
  console.log('节点数据:', {
    id: node.id,
    type: node.type,
    'nodeData.isConfigured': nodeData.isConfigured,
    'nodeData类型': typeof nodeData.isConfigured
  })
  
  // 检查节点配置状态
  if (nodeData.isConfigured === false || nodeData.isConfigured === undefined) {
    console.log('❌ 节点未配置，不创建预览线')
    return {
      shouldCreate: false,
      type: 'NO_CREATION',
      reason: '节点未配置，不创建预览线',
      details: {
        nodeType: 'single',
        isConfigured: nodeData.isConfigured
      }
    }
  }
  
  // 检查现有预览线
  if (existingLines.length > 0) {
    console.log('已存在预览线，跳过创建')
    return {
      shouldCreate: false,
      type: 'NO_CREATION',
      reason: '已存在有效预览线'
    }
  }
  
  console.log('✅ 需要创建新预览线')
  return {
    shouldCreate: true,
    type: 'NEEDS_CREATION',
    reason: '需要创建单一预览线',
    details: {
      nodeType: 'single',
      targetState: requestedState
    }
  }
}

// 模拟PreviewLineManager的createUnifiedPreviewLine方法
function createUnifiedPreviewLine(node, state = 'interactive', forceUpdate = false) {
  console.log('\n=== 开始创建统一预览线 ===')
  console.log(`参数: nodeId=${node.id}, state=${state}, forceUpdate=${forceUpdate}`)
  
  // 1. 检查预览线需求
  const requirement = checkSingleNodeRequirement(node, state, [])
  console.log('需求检查结果:', requirement)
  
  // 2. 根据需求类型执行操作
  if (requirement.type === 'NO_CREATION') {
    console.log('🚫 无需创建预览线')
    return {
      success: true,
      action: 'skipped',
      reason: requirement.reason,
      nodeId: node.id
    }
  }
  
  if (requirement.type === 'NEEDS_CREATION') {
    console.log('🎯 创建新预览线')
    const previewLine = {
      id: `preview_${node.id}_${Date.now()}`,
      type: 'SINGLE',
      state: state,
      sourceNode: node,
      line: null,
      metadata: {},
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
    
    console.log('预览线创建成功:', {
      id: previewLine.id,
      type: previewLine.type,
      state: previewLine.state
    })
    
    return {
      success: true,
      action: 'created',
      type: 'single',
      nodeId: node.id,
      previewLine: previewLine
    }
  }
  
  return {
    success: false,
    error: '未知的需求类型',
    nodeId: node.id
  }
}

// 测试修复方案
function testWithFixedNode() {
  console.log('\n\n=== 测试修复方案：设置isConfigured为true ===')
  
  const fixedNode = {
    id: 'start-node',
    type: 'start',
    getData: () => ({
      type: 'start',
      nodeType: 'start',
      isConfigured: true, // 修复：设置为true
      label: 'Start Node'
    }),
    data: {
      type: 'start',
      nodeType: 'start',
      isConfigured: true, // 修复：设置为true
      label: 'Start Node'
    }
  }
  
  const result = createUnifiedPreviewLine(fixedNode, 'interactive', false)
  console.log('修复后的创建结果:', result)
  
  return result
}

// 执行测试
console.log('=== 预览线创建流程测试 ===')

// 1. 测试当前问题场景
const startNode = mockGraph.getCellById('start-node')
const result1 = createUnifiedPreviewLine(startNode, 'interactive', false)
console.log('\n当前问题场景结果:', result1)

// 2. 测试修复方案
const result2 = testWithFixedNode()
console.log('\n修复方案结果:', result2)

// 3. 总结
console.log('\n=== 测试总结 ===')
console.log('问题根因: start-node的isConfigured属性为undefined')
console.log('解决方案: 确保start-node在创建时isConfigured被正确设置为true')
console.log('验证结果: 修复后预览线可以正常创建')

console.log('\n=== 测试完成 ===')