// 测试预览线生成功能的脚本
// 在浏览器控制台中运行此脚本来测试节点配置完成后的预览线生成

window.testPreviewLineGeneration = function() {
  console.log('🧪 [测试] 开始测试预览线生成功能');
  
  // 全局对象检查
  if (typeof window.onNodeConfigured !== 'function') {
    console.error('❌ onNodeConfigured 方法不存在')
  } else {
    console.log('✅ onNodeConfigured 方法存在')
    
    // 检查图形实例是否存在
    const graph = window.graph || window.graphInstance
    if (!graph) {
      console.error('❌ 图形实例不存在，无法进行节点测试')
    } else {
      console.log('✅ 图形实例存在')
      
      // 模拟节点配置
      const mockNodeConfig = {
        id: 'test-node-001',
        type: 'data-source',
        name: '测试数据源',
        position: { x: 100, y: 100 },
        ports: {
          out: [{ id: 'out', type: 'output' }]
        }
      }
      
      console.log('🔧 调用 onNodeConfigured，配置:', mockNodeConfig)
      
      try {
        // 先检查节点是否已存在
        const existingNode = graph.getCellById(mockNodeConfig.id)
        if (existingNode) {
          console.log('✅ 测试节点已存在，移除后重新创建')
          graph.removeCell(existingNode)
        }
        
        window.onNodeConfigured(mockNodeConfig)
        console.log('✅ onNodeConfigured 调用成功')
        
        // 验证节点是否成功创建
        setTimeout(() => {
          const createdNode = graph.getCellById(mockNodeConfig.id)
          if (createdNode) {
            console.log('✅ 测试节点创建成功:', createdNode)
          } else {
            console.error('❌ 测试节点创建失败')
          }
        }, 100)
        
      } catch (error) {
        console.error('❌ onNodeConfigured 调用失败:', error)
      }
    }
  }
  
  // 检查必要的全局对象
  if (!window.unifiedPreviewLineManager) {
    console.error('❌ [测试] 统一预览线管理器不存在');
    return;
  }
  
  console.log('✅ [测试] 统一预览线管理器存在:', window.unifiedPreviewLineManager)
  
  // 模拟节点配置完成事件
  const testNodeId = 'test-node-' + Date.now();
  const testNodeType = 'audience-split';
  const testConfig = {
    type: 'crowd-split',
    crowdLayers: [
      { id: 'layer1', name: '高价值客户', conditions: [] },
      { id: 'layer2', name: '普通客户', conditions: [] }
    ],
    unmatchBranch: { enabled: true, name: '未匹配分支' }
  };
  
  console.log('🔧 [测试] 准备调用onNodeConfigured:', {
    nodeId: testNodeId,
    nodeType: testNodeType,
    config: testConfig
  });
  
  // 调用onNodeConfigured方法
  if (window.unifiedPreviewLineManager.onNodeConfigured) {
    try {
      window.unifiedPreviewLineManager.onNodeConfigured(testNodeId, testNodeType, testConfig);
      console.log('✅ [测试] onNodeConfigured调用成功');
    } catch (error) {
      console.error('❌ [测试] onNodeConfigured调用失败:', error);
    }
  } else {
    console.error('❌ [测试] onNodeConfigured方法不存在');
  }
};

// 自动运行测试
if (window.TASK_FLOW_DEBUG) {
  console.log('🎯 [测试] 检测到调试模式，准备运行预览线测试');
  // 延迟执行，确保页面完全加载
  setTimeout(() => {
    window.testPreviewLineGeneration();
  }, 2000);
}

console.log('📝 [测试] 预览线测试脚本已加载，可在控制台运行 testPreviewLineGeneration() 进行测试');