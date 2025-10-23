/**
 * 测试人群分流节点标签修复效果
 * 验证不同配置数据结构下的分支标签生成
 */

// 模拟PreviewLineSystem的generateBranchesByType方法
function testGenerateBranchesByType(nodeType, nodeConfig, nodeId) {
  console.log('🔧 [测试] generateBranchesByType 被调用:', {
    nodeId: nodeId,
    nodeType: nodeType,
    nodeConfig: nodeConfig,
    hasCrowdLayers: !!(nodeConfig.crowdLayers && Array.isArray(nodeConfig.crowdLayers)),
    crowdLayersCount: nodeConfig.crowdLayers ? nodeConfig.crowdLayers.length : 0,
    hasUnmatchBranch: !!nodeConfig.unmatchBranch
  })
  
  switch (nodeType) {
    case 'audience-split':
      // 人群分流：根据配置的人群层数生成分支
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
      
    default:
      return []
  }
}

// 测试用例
console.log('\n🧪 [测试] 开始测试人群分流节点标签修复...')

// 测试用例1：使用crowdLayers配置
console.log('\n📋 [测试用例1] crowdLayers配置')
const config1 = {
  crowdLayers: [
    { id: 'crowd_1', crowdName: '高价值用户', crowdId: 'high_value_users' },
    { id: 'crowd_2', crowdName: '活跃用户', crowdId: 'active_users' }
  ],
  unmatchBranch: {
    id: 'unmatch',
    name: '其他用户',
    crowdId: null
  }
}
const result1 = testGenerateBranchesByType('audience-split', config1, 'test_node_1')
console.log('结果1:', result1)

// 测试用例2：使用audiences配置
console.log('\n📋 [测试用例2] audiences配置')
const config2 = {
  audiences: [
    { id: 'aud_1', name: '新用户群体', audienceName: '新用户' },
    { id: 'aud_2', name: '老用户群体', audienceName: '老用户' }
  ]
}
const result2 = testGenerateBranchesByType('audience-split', config2, 'test_node_2')
console.log('结果2:', result2)

// 测试用例3：使用config.audiences配置
console.log('\n📋 [测试用例3] config.audiences配置')
const config3 = {
  config: {
    audiences: [
      { id: 'nested_1', label: 'VIP用户', crowdId: 'vip_users' },
      { id: 'nested_2', label: '普通用户', crowdId: 'normal_users' }
    ]
  }
}
const result3 = testGenerateBranchesByType('audience-split', config3, 'test_node_3')
console.log('结果3:', result3)

// 测试用例4：没有人群配置
console.log('\n📋 [测试用例4] 无人群配置')
const config4 = {
  isConfigured: true,
  someOtherConfig: 'value'
}
const result4 = testGenerateBranchesByType('audience-split', config4, 'test_node_4')
console.log('结果4:', result4)

console.log('\n✅ [测试] 人群分流节点标签修复测试完成')