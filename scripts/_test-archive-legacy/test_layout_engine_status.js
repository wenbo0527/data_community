// 测试布局引擎状态和预览线管理器的layoutEngineReady状态
console.log('🔍 [布局引擎状态检查] 开始检查...');

// 检查全局布局引擎
if (typeof window !== 'undefined') {
  console.log('🌐 [全局对象检查]', {
    hasUnifiedStructuredLayoutEngine: !!window.unifiedStructuredLayoutEngine,
    hasUnifiedPreviewLineManager: !!window.unifiedPreviewLineManager,
    hasGraph: !!window.graph
  });
  
  // 检查预览线管理器状态
  if (window.unifiedPreviewLineManager) {
    const manager = window.unifiedPreviewLineManager;
    console.log('📋 [预览线管理器状态]', {
      layoutEngineReady: manager.layoutEngineReady,
      pendingCalculationsSize: manager.pendingCalculations?.size || 0,
      previewLinesSize: manager.previewLines?.size || 0,
      hasLayoutEngine: !!manager.layoutEngine,
      layoutEngineType: manager.layoutEngine?.constructor?.name
    });
    
    // 检查待处理队列
    if (manager.pendingCalculations && manager.pendingCalculations.size > 0) {
      console.log('⏳ [待处理队列详情]');
      manager.pendingCalculations.forEach((task, nodeId) => {
        console.log(`  - ${nodeId}: ${task.type} (${new Date(task.timestamp).toLocaleTimeString()})`);
      });
    }
  }
  
  // 检查布局引擎状态
  if (window.unifiedStructuredLayoutEngine) {
    const engine = window.unifiedStructuredLayoutEngine;
    console.log('🏗️ [布局引擎状态]', {
      isInitialized: engine.isInitialized,
      hasNodeToLayerMap: !!engine.nodeToLayer,
      nodeToLayerSize: engine.nodeToLayer?.size || 0,
      hasPreviewLineManager: !!engine.previewLineManager
    });
  }
  
  // 模拟事件分流节点的预览线创建
  if (window.unifiedPreviewLineManager && window.graph) {
    const manager = window.unifiedPreviewLineManager;
    const graph = window.graph;
    
    // 查找事件分流节点
    const eventSplitNodes = graph.getNodes().filter(node => {
      const nodeData = node.getData();
      return nodeData && nodeData.type === 'event-split';
    });
    
    console.log('🎯 [事件分流节点检查]', {
      找到的事件分流节点数量: eventSplitNodes.length,
      节点详情: eventSplitNodes.map(node => ({
        id: node.id,
        type: node.getData()?.type,
        hasConfig: !!node.getData()?.config,
        isConfigured: node.getData()?.isConfigured
      }))
    });
    
    // 尝试为事件分流节点创建预览线
    if (eventSplitNodes.length > 0) {
      const testNode = eventSplitNodes[0];
      console.log('🧪 [测试预览线创建] 节点:', testNode.id);
      
      try {
        const result = manager.createUnifiedPreviewLine(testNode);
        console.log('✅ [测试结果]', {
          创建结果: result,
          layoutEngineReady: manager.layoutEngineReady,
          待处理队列大小: manager.pendingCalculations?.size || 0
        });
      } catch (error) {
        console.error('❌ [测试失败]', error);
      }
    }
  }
} else {
  console.log('❌ [环境检查] 非浏览器环境，无法检查全局对象');
}

console.log('🔍 [布局引擎状态检查] 完成');