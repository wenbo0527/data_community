/**
 * 调试manual-call节点配置状态
 * 检查节点的isConfigured字段和相关配置数据
 */

// 在浏览器控制台中运行此脚本
function debugManualCallNodeConfig() {
  console.log('🔍 [调试] 开始检查manual-call节点配置状态');
  
  // 获取图实例
  const graph = window.graph || window.graphInstance;
  if (!graph) {
    console.error('❌ [调试] 未找到图实例');
    return;
  }
  
  // 获取所有节点
  const allNodes = graph.getNodes();
  console.log(`📊 [调试] 图中总节点数: ${allNodes.length}`);
  
  // 查找manual-call节点
  const manualCallNodes = allNodes.filter(node => {
    const nodeData = node.getData();
    return nodeData && nodeData.type === 'manual-call';
  });
  
  console.log(`🎯 [调试] 找到 ${manualCallNodes.length} 个manual-call节点`);
  
  // 详细检查每个manual-call节点
  manualCallNodes.forEach((node, index) => {
    const nodeData = node.getData();
    const nodeId = node.id;
    
    console.log(`\n📋 [调试] Manual-Call节点 #${index + 1}:`);
    console.log(`  节点ID: ${nodeId}`);
    console.log(`  节点类型: ${nodeData.type}`);
    console.log(`  isConfigured: ${nodeData.isConfigured}`);
    console.log(`  配置数据:`, nodeData.config);
    console.log(`  完整节点数据:`, nodeData);
    
    // 检查预览线管理器对该节点的判断
    const previewManager = window.previewLineSystem;
    if (previewManager) {
      console.log(`\n🔧 [调试] 预览线管理器检查:`);
      
      // 检查shouldCreatePreviewLine方法
      if (typeof previewManager.shouldCreatePreviewLine === 'function') {
        const shouldCreate = previewManager.shouldCreatePreviewLine(node);
        console.log(`  shouldCreatePreviewLine结果: ${shouldCreate}`);
      }
      
      // 检查shouldNodeBeConfigured方法
      if (typeof previewManager.shouldNodeBeConfigured === 'function') {
        const shouldBeConfigured = previewManager.shouldNodeBeConfigured(node);
        console.log(`  shouldNodeBeConfigured结果: ${shouldBeConfigured}`);
      }
      
      // 检查isBranchNode方法
      if (typeof previewManager.isBranchNode === 'function') {
        const isBranch = previewManager.isBranchNode(node);
        console.log(`  isBranchNode结果: ${isBranch}`);
      }
    } else {
      console.warn(`⚠️ [调试] 未找到预览线管理器实例`);
    }
  });
  
  // 检查预览线管理器的strictNodeTypes配置
  const previewManager = window.previewLineSystem;
  if (previewManager && previewManager.strictNodeTypes) {
    console.log(`\n🔒 [调试] 严格节点类型配置:`, previewManager.strictNodeTypes);
    const isManualCallStrict = previewManager.strictNodeTypes.includes('manual-call') || 
                              previewManager.strictNodeTypes.includes('manual_call');
    console.log(`  manual-call是否为严格类型: ${isManualCallStrict}`);
  }
  
  console.log('\n✅ [调试] manual-call节点配置状态检查完成');
}

// 导出函数供控制台使用
if (typeof window !== 'undefined') {
  window.debugManualCallNodeConfig = debugManualCallNodeConfig;
  console.log('🚀 [调试工具] 已加载，请在控制台运行: debugManualCallNodeConfig()');
}

// 如果在Node.js环境中，直接导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { debugManualCallNodeConfig };
}