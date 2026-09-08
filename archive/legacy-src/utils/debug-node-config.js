/**
 * 调试节点配置数据结构
 * 用于检查实际运行时的人群分流节点配置
 */

// 在浏览器控制台中运行此脚本来调试节点配置
window.debugNodeConfig = function(nodeId) {
  console.log('🔍 [调试] 开始检查节点配置:', nodeId)
  
  // 尝试从全局变量中获取图实例
  const graph = window.graph || window.taskFlowGraph
  if (!graph) {
    console.error('❌ [调试] 未找到图实例')
    return
  }
  
  // 获取节点
  const node = graph.getCellById(nodeId)
  if (!node) {
    console.error('❌ [调试] 未找到节点:', nodeId)
    return
  }
  
  // 获取节点数据
  const nodeData = node.getData()
  console.log('📋 [调试] 节点基本信息:', {
    id: node.id,
    type: nodeData?.type,
    label: nodeData?.label,
    isConfigured: nodeData?.isConfigured
  })
  
  // 检查配置数据结构
  console.log('🔧 [调试] 节点完整数据:', nodeData)
  
  // 检查可能的人群配置字段
  const configFields = {
    'crowdLayers': nodeData?.crowdLayers,
    'audiences': nodeData?.audiences,
    'config.audiences': nodeData?.config?.audiences,
    'config.crowdLayers': nodeData?.config?.crowdLayers,
    'branches': nodeData?.branches,
    'config.branches': nodeData?.config?.branches
  }
  
  console.log('👥 [调试] 人群配置字段检查:')
  Object.entries(configFields).forEach(([field, value]) => {
    if (value) {
      console.log(`  ✅ ${field}:`, value)
      if (Array.isArray(value)) {
        console.log(`    - 数组长度: ${value.length}`)
        value.forEach((item, index) => {
          console.log(`    - [${index}]:`, {
            id: item.id,
            name: item.name,
            crowdName: item.crowdName,
            audienceName: item.audienceName,
            label: item.label
          })
        })
      }
    } else {
      console.log(`  ❌ ${field}: 未找到`)
    }
  })
  
  // 检查未命中分支
  if (nodeData?.unmatchBranch) {
    console.log('🎯 [调试] 未命中分支配置:', nodeData.unmatchBranch)
  }
  
  return {
    nodeData,
    configFields,
    hasAnyAudienceConfig: Object.values(configFields).some(v => v && Array.isArray(v) && v.length > 0)
  }
}

// 批量检查所有人群分流节点
window.debugAllAudienceSplitNodes = function() {
  console.log('🔍 [调试] 开始检查所有人群分流节点')
  
  const graph = window.graph || window.taskFlowGraph
  if (!graph) {
    console.error('❌ [调试] 未找到图实例')
    return
  }
  
  const nodes = graph.getNodes()
  const audienceSplitNodes = nodes.filter(node => {
    const data = node.getData()
    return data?.type === 'audience-split'
  })
  
  console.log(`📊 [调试] 找到 ${audienceSplitNodes.length} 个人群分流节点`)
  
  audienceSplitNodes.forEach((node, index) => {
    console.log(`\n--- 节点 ${index + 1} ---`)
    window.debugNodeConfig(node.id)
  })
  
  return audienceSplitNodes.map(node => ({
    id: node.id,
    data: node.getData()
  }))
}

// 模拟PreviewLineSystem的getNodeBranches方法
window.testGetNodeBranches = function(nodeId) {
  console.log('🧪 [测试] 模拟getNodeBranches方法:', nodeId)
  
  const graph = window.graph || window.taskFlowGraph
  if (!graph) {
    console.error('❌ [测试] 未找到图实例')
    return
  }
  
  const node = graph.getCellById(nodeId)
  if (!node) {
    console.error('❌ [测试] 未找到节点:', nodeId)
    return
  }
  
  const nodeData = node.getData()
  const nodeType = nodeData?.type
  const nodeConfig = nodeData
  
  console.log('🔧 [测试] generateBranchesByType 被调用:', {
    nodeId: nodeId,
    nodeType: nodeType,
    nodeConfig: nodeConfig,
    hasCrowdLayers: !!(nodeConfig.crowdLayers && Array.isArray(nodeConfig.crowdLayers)),
    crowdLayersCount: nodeConfig.crowdLayers ? nodeConfig.crowdLayers.length : 0,
    hasUnmatchBranch: !!nodeConfig.unmatchBranch
  })
  
  if (nodeType === 'audience-split') {
    // 🔧 修复：支持多种人群配置字段
    let audienceData = null
    let audienceSource = 'none'
    
    if (nodeConfig.crowdLayers && Array.isArray(nodeConfig.crowdLayers) && nodeConfig.crowdLayers.length > 0) {
      audienceData = nodeConfig.crowdLayers
      audienceSource = 'crowdLayers'
    } else if (nodeConfig.audiences && Array.isArray(nodeConfig.audiences) && nodeConfig.audiences.length > 0) {
      audienceData = nodeConfig.audiences
      audienceSource = 'audiences'
    } else if (nodeConfig.config && nodeConfig.config.audiences && Array.isArray(nodeConfig.config.audiences) && nodeConfig.config.audiences.length > 0) {
      audienceData = nodeConfig.config.audiences
      audienceSource = 'config.audiences'
    }
    
    console.log('🔍 [测试] 人群分流节点配置检查:', {
      nodeId: nodeId,
      audienceSource: audienceSource,
      audienceCount: audienceData ? audienceData.length : 0,
      nodeConfigKeys: Object.keys(nodeConfig),
      hasNestedConfig: !!(nodeConfig.config && typeof nodeConfig.config === 'object')
    })
    
    if (audienceData) {
      const branches = audienceData.map((item, index) => {
        // 🔧 修复：支持多种人群名称字段
        const audienceName = item.crowdName || item.name || item.audienceName || item.label || `人群${index + 1}`
        
        return {
          id: item.id || `audience_${index}`,
          label: audienceName,
          crowdName: audienceName,
          type: 'audience',
          crowdId: item.crowdId || item.id,
          order: item.order || index + 1
        }
      })
      
      // 从配置中读取未命中分支信息
      if (nodeConfig.unmatchBranch) {
        branches.push({
          id: nodeConfig.unmatchBranch.id || 'unmatch_default',
          label: nodeConfig.unmatchBranch.name || nodeConfig.unmatchBranch.crowdName || '未命中人群',
          crowdName: nodeConfig.unmatchBranch.crowdName || nodeConfig.unmatchBranch.name || '未命中人群',
          type: 'audience',
          crowdId: nodeConfig.unmatchBranch.crowdId || null,
          order: nodeConfig.unmatchBranch.order || branches.length + 1,
          isDefault: true
        })
      }
      
      console.log('✅ [测试] 人群分流节点生成分支:', {
        nodeId: nodeId,
        audienceSource: audienceSource,
        branchCount: branches.length,
        branches: branches.map(b => ({ id: b.id, label: b.label, crowdName: b.crowdName }))
      })
      
      return branches
    }
    
    // 如果没有找到人群配置数据，生成默认分支
    console.log('⚠️ [测试] 人群分流节点未找到人群配置数据，生成默认分支:', nodeId)
    return [
      { id: 'default_branch_1', label: '分支1', type: 'audience', isDefault: true },
      { id: 'default_branch_2', label: '分支2', type: 'audience', isDefault: true }
    ]
  }
  
  return []
}

console.log('🔧 [调试工具] 调试脚本已加载，可用方法:')
console.log('  - debugNodeConfig(nodeId): 检查指定节点的配置')
console.log('  - debugAllAudienceSplitNodes(): 检查所有人群分流节点')
console.log('  - testGetNodeBranches(nodeId): 测试分支生成逻辑')
console.log('\n使用示例:')
console.log('  debugNodeConfig("node_1756881179035")')
console.log('  testGetNodeBranches("node_1756881179035")')