/**
 * 人群分流节点预览线调试测试脚本
 * 专门用于调试人群分流节点的预览线创建问题
 */

// 模拟人群分流节点配置
const mockAudienceSplitConfig = {
  // 基本配置
  nodeName: '人群分流测试',
  type: 'audience-split',
  isConfigured: true,
  
  // 人群层级配置
  crowdLayers: [
    {
      id: 'crowd_1',
      crowdId: 'crowd_001',
      crowdName: '高价值用户',
      order: 1
    },
    {
      id: 'crowd_2', 
      crowdId: 'crowd_002',
      crowdName: '普通用户',
      order: 2
    }
  ],
  
  // 未命中分支配置
  unmatchBranch: {
    id: 'unmatch_default',
    name: '未命中人群',
    crowdName: '未命中人群',
    isDefault: true,
    crowdId: null,
    order: 3
  }
};

// 模拟图形对象
const mockGraph = {
  getOutgoingEdges: (node) => {
    console.log('🔍 [模拟图形] 获取节点出边:', node.id);
    // 模拟没有真实连接的情况
    return [];
  },
  hasCell: (cell) => true,
  getCellById: (id) => ({
    id: id,
    getData: () => mockAudienceSplitConfig,
    getPosition: () => ({ x: 100, y: 100 }),
    getSize: () => ({ width: 120, height: 60 })
  })
};

// 模拟节点对象
const mockNode = {
  id: 'audience-split-test',
  getData: () => mockAudienceSplitConfig,
  getPosition: () => ({ x: 100, y: 100 }),
  getSize: () => ({ width: 120, height: 60 })
};

// 模拟generateBranchesByType方法
function generateBranchesByType(nodeId, nodeType, nodeConfig) {
  console.log('🌿 [分支生成] 开始生成分支:', {
    nodeId: nodeId,
    nodeType: nodeType,
    hasUnmatchBranch: !!nodeConfig.unmatchBranch,
    configKeys: Object.keys(nodeConfig)
  });
  
  switch (nodeType) {
    case 'audience-split':
      // 人群分流：根据配置的人群层数生成分支
      if (nodeConfig.crowdLayers && Array.isArray(nodeConfig.crowdLayers)) {
        const branches = nodeConfig.crowdLayers.map((layer, index) => {
          const branch = {
            id: layer.id || `audience_${index}`,
            label: layer.crowdName || layer.name || `人群${index + 1}`,
            crowdName: layer.crowdName || layer.name || `人群${index + 1}`,
            type: 'audience',
            crowdId: layer.crowdId,
            order: layer.order || index + 1
          };
          
          console.log('🌿 [分支生成] 创建人群分支:', {
            nodeId: nodeId,
            branchIndex: index,
            branchId: branch.id,
            branchLabel: branch.label,
            crowdId: branch.crowdId
          });
          
          return branch;
        });
        
        // 从配置中读取未命中分支信息
        if (nodeConfig.unmatchBranch) {
          const unmatchBranch = {
            id: nodeConfig.unmatchBranch.id || 'unmatch_default',
            label: nodeConfig.unmatchBranch.name || nodeConfig.unmatchBranch.crowdName || '未命中人群',
            crowdName: nodeConfig.unmatchBranch.crowdName || nodeConfig.unmatchBranch.name || '未命中人群',
            type: 'audience',
            crowdId: nodeConfig.unmatchBranch.crowdId || null,
            order: nodeConfig.unmatchBranch.order || branches.length + 1,
            isDefault: true
          };
          
          console.log('🌿 [分支生成] 创建未命中分支:', {
            nodeId: nodeId,
            branchId: unmatchBranch.id,
            branchLabel: unmatchBranch.label
          });
          
          branches.push(unmatchBranch);
        }
        
        console.log('🌿 [分支生成] 人群分流分支生成完成:', {
          nodeId: nodeId,
          totalBranches: branches.length,
          crowdBranches: nodeConfig.crowdLayers.length,
          hasUnmatchBranch: !!nodeConfig.unmatchBranch
        });
        
        return branches;
      }
      
      console.log('⏭️ [分支生成] 人群分流节点未配置，不生成默认分支:', nodeId);
      return [];
      
    default:
      return [];
  }
}

// 模拟checkBranchHasRealConnection方法
function checkBranchHasRealConnection(node, branchId) {
  const outgoingEdges = mockGraph.getOutgoingEdges(node) || [];
  
  // 详细分析每条边
  const edgeAnalysis = outgoingEdges.map(edge => {
    const edgeData = edge.getData ? edge.getData() : {};
    const isPreviewLine = edgeData.isPreview ||
                         edgeData.type === 'preview-line' ||
                         edgeData.type === 'unified-preview-line' ||
                         edgeData.type === 'draggable-preview';
    
    return {
      edgeId: edge.id,
      edgeData: edgeData,
      isPreviewLine: isPreviewLine,
      branchId: edgeData.branchId,
      matchesBranch: edgeData.branchId === branchId,
      isRealConnection: !isPreviewLine && edgeData.branchId === branchId
    };
  });
  
  const realConnections = outgoingEdges.filter(edge => {
    const edgeData = edge.getData ? edge.getData() : {};
    const isPreviewLine = edgeData.isPreview ||
                         edgeData.type === 'preview-line' ||
                         edgeData.type === 'unified-preview-line' ||
                         edgeData.type === 'draggable-preview';
    
    return !isPreviewLine && edgeData.branchId === branchId;
  });
  
  const hasRealConnection = realConnections.length > 0;
  
  console.log('🔍 [连接检查] 检查分支真实连接:', {
    nodeId: node.id,
    branchId: branchId,
    totalOutgoingEdges: outgoingEdges.length,
    realConnections: realConnections.length,
    hasRealConnection: hasRealConnection,
    edgeAnalysis: edgeAnalysis
  });
  
  return hasRealConnection;
}

// 模拟createBranchPreviewLines方法的核心逻辑
function simulateCreateBranchPreviewLines(node) {
  console.log('\n🚀 [预览线创建] 开始创建分支预览线:', node.id);
  
  const nodeConfig = node.getData();
  const nodeType = nodeConfig.type;
  
  // 获取分支信息
  const branches = generateBranchesByType(node.id, nodeType, nodeConfig);
  
  if (!branches || branches.length === 0) {
    console.log('⏭️ [预览线创建] 没有分支信息，跳过预览线创建');
    return;
  }
  
  console.log('📋 [预览线创建] 分支信息获取完成:', {
    totalBranches: branches.length,
    branches: branches.map(b => ({ id: b.id, label: b.label, type: b.type }))
  });
  
  // 为每个分支检查是否需要创建预览线
  const previewLineResults = [];
  
  branches.forEach((branch, index) => {
    console.log(`\n🔍 [预览线创建] 处理分支 ${index + 1}/${branches.length}:`, {
      branchId: branch.id,
      branchLabel: branch.label,
      branchType: branch.type
    });
    
    // 检查分支是否已有真实连接
    const hasRealConnection = checkBranchHasRealConnection(node, branch.id);
    
    if (hasRealConnection) {
      console.log('⏭️ [预览线创建] 分支已有真实连接，跳过预览线创建:', {
        branchId: branch.id,
        branchLabel: branch.label
      });
      previewLineResults.push({
        branchId: branch.id,
        branchLabel: branch.label,
        action: 'skipped',
        reason: 'has_real_connection'
      });
      return;
    }
    
    // 模拟创建预览线
    console.log('✅ [预览线创建] 创建预览线:', {
      branchId: branch.id,
      branchLabel: branch.label,
      branchType: branch.type
    });
    
    previewLineResults.push({
      branchId: branch.id,
      branchLabel: branch.label,
      action: 'created',
      reason: 'no_real_connection'
    });
  });
  
  // 输出最终结果
  console.log('\n📊 [预览线创建] 创建结果汇总:', {
    totalBranches: branches.length,
    createdPreviewLines: previewLineResults.filter(r => r.action === 'created').length,
    skippedPreviewLines: previewLineResults.filter(r => r.action === 'skipped').length,
    results: previewLineResults
  });
  
  return previewLineResults;
}

// 执行测试
console.log('🧪 [测试开始] 人群分流节点预览线创建调试测试');
console.log('=' .repeat(60));

// 测试配置验证
console.log('\n📋 [配置验证] 节点配置信息:');
console.log('- 节点类型:', mockAudienceSplitConfig.type);
console.log('- 配置状态:', mockAudienceSplitConfig.isConfigured);
console.log('- 人群层级数量:', mockAudienceSplitConfig.crowdLayers?.length || 0);
console.log('- 未命中分支:', !!mockAudienceSplitConfig.unmatchBranch);

if (mockAudienceSplitConfig.unmatchBranch) {
  console.log('- 未命中分支详情:', {
    id: mockAudienceSplitConfig.unmatchBranch.id,
    name: mockAudienceSplitConfig.unmatchBranch.name,
    crowdName: mockAudienceSplitConfig.unmatchBranch.crowdName
  });
}

// 执行预览线创建模拟
const results = simulateCreateBranchPreviewLines(mockNode);

console.log('\n' + '=' .repeat(60));
console.log('🧪 [测试完成] 预期应该创建3条预览线（2个人群分支 + 1个未命中分支）');
console.log('📊 [实际结果] 创建了', results?.filter(r => r.action === 'created').length || 0, '条预览线');

if (results) {
  const unmatchResult = results.find(r => r.branchId === 'unmatch_default');
  if (unmatchResult) {
    console.log('✅ [未命中分支] 处理结果:', unmatchResult.action, '-', unmatchResult.reason);
  } else {
    console.log('❌ [未命中分支] 未找到未命中分支的处理结果');
  }
}

console.log('\n🔧 [调试建议] 如果预览线数量不匹配，请检查:');
console.log('1. unmatchBranch配置是否正确');
console.log('2. checkBranchHasRealConnection方法的逻辑');
console.log('3. generateBranchesByType方法是否正确生成了所有分支');