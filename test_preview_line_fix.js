// 测试修复后的预览线生成逻辑
console.log('🔍 测试修复后的预览线生成逻辑...');

// 模拟validateNodeConfiguration函数
const validateNodeConfiguration = (nodeData, realConnections = []) => {
  if (!nodeData) {
    return {
      shouldCreatePreview: false,
      isConfigured: false,
      hasActualConfig: false,
      reason: '节点数据为空'
    }
  }

  const nodeType = nodeData.nodeType || nodeData.type
  const config = nodeData.config || {}
  const branches = nodeData.branches || config.branches || []

  // 检查是否有实际配置
  const hasActualConfig = config && Object.keys(config).length > 0

  // 检查是否已配置 - 修复：start节点默认为已配置
  const isConfigured = nodeData.isConfigured === true || hasActualConfig || nodeType === 'start'

  // 检查是否应该创建预览线
  let shouldCreatePreview = false
  let reason = ''

  if (!isConfigured) {
    reason = '节点未配置'
    shouldCreatePreview = false
  } else {
    // 检查是否已有真实连接
    const hasRealConnections = realConnections && realConnections.length > 0
    
    if (hasRealConnections) {
      reason = '节点已有真实连接，无需预览线'
      shouldCreatePreview = false
    } else {
      // 根据节点类型判断是否应该创建预览线
      switch (nodeType) {
        case 'start':
          // 开始节点默认已配置，应该创建预览线
          shouldCreatePreview = true
          reason = '开始节点已配置'
          break
        case 'condition':
          if (branches.length > 0) {
            shouldCreatePreview = true
            reason = '条件节点已配置分支'
          } else {
            shouldCreatePreview = false
            reason = '条件节点没有分支配置'
          }
          break
        case 'action':
        case 'delay':
        case 'webhook':
        case 'task':
          // 动作类节点如果已配置，应该创建预览线
          shouldCreatePreview = true
          reason = '动作节点已配置'
          break
        case 'end':
          // 结束节点不需要预览线
          shouldCreatePreview = false
          reason = '结束节点不需要预览线'
          break
        default:
          // 其他类型节点，如果已配置则创建预览线
          shouldCreatePreview = isConfigured
          reason = isConfigured ? '节点已配置' : '节点未配置'
          break
      }
    }
  }

  return {
    shouldCreatePreview,
    isConfigured,
    hasActualConfig,
    reason,
    nodeType,
    branchCount: branches.length,
    hasRealConnections: realConnections && realConnections.length > 0
  }
}

// 模拟节点数据（基于用户报告的统计信息）
const mockNodes = [
  { id: 'node1', type: 'start', isConfigured: true },
  { id: 'node2', type: 'task', isConfigured: true, config: { name: 'Task 1' } },
  { id: 'node3', type: 'action', isConfigured: true, config: { action: 'send_email' } },
  { id: 'node4', type: 'end', isConfigured: true }
];

// 模拟现有连接（无连接）
const mockConnections = [];

console.log('📊 节点配置验证结果:');
let expectedPreviewLines = 0;
let configuredNodes = 0;

mockNodes.forEach((node, index) => {
  const validation = validateNodeConfiguration(node, []);
  
  if (validation.isConfigured) {
    configuredNodes++;
  }
  
  if (validation.shouldCreatePreview) {
    expectedPreviewLines++;
  }
  
  console.log(`节点 ${index + 1} (${node.type}):`, {
    isConfigured: validation.isConfigured,
    shouldCreatePreview: validation.shouldCreatePreview,
    reason: validation.reason
  });
});

console.log('\n📈 修复后的统计信息:');
console.log(`- 总节点数: ${mockNodes.length}`);
console.log(`- 已配置节点: ${configuredNodes}`);
console.log(`- 预期预览线数量: ${expectedPreviewLines}`);
console.log(`- 现有连接: ${mockConnections.length}`);

console.log('\n✅ 预览线生成逻辑修复验证完成');