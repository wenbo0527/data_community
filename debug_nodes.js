// 在浏览器控制台中执行此代码来检查节点数据和重新生成预览线

// 1. 检查所有节点的详细信息
console.log('🔍 开始检查节点详细信息...');

// 获取图实例
const graph = window.graph || window.taskFlowGraph;
if (!graph) {
  console.error('❌ 无法找到图实例');
} else {
  console.log('✅ 找到图实例');
  
  // 获取所有节点
  const nodes = graph.getNodes();
  console.log(`📊 图中共有 ${nodes.length} 个节点`);
  
  nodes.forEach((node, index) => {
    const nodeData = node.getData();
    const nodeId = node.id;
    const nodeType = nodeData?.type || 'unknown';
    const isConfigured = nodeData?.isConfigured;
    const config = nodeData?.config;
    
    console.log(`\n📍 节点 ${index + 1}:`);
    console.log(`  ID: ${nodeId}`);
    console.log(`  类型: ${nodeType}`);
    console.log(`  isConfigured: ${isConfigured}`);
    console.log(`  config存在: ${!!config}`);
    if (config) {
      console.log(`  config内容:`, config);
    }
    console.log(`  完整nodeData:`, nodeData);
  });
}

// 2. 检查预览线管理器
console.log('\n🔍 检查预览线管理器...');
const previewManager = window.unifiedPreviewLineManager;
if (!previewManager) {
  console.error('❌ 无法找到预览线管理器');
} else {
  console.log('✅ 找到预览线管理器');
  
  // 获取当前预览线数量
  const currentLines = previewManager.getAllPreviewLines();
  console.log(`📊 当前预览线数量: ${currentLines.length}`);
  
  // 3. 强制重新生成预览线
  console.log('\n🔄 开始强制重新生成预览线...');
  try {
    const result = previewManager.forceRegeneratePreviewLines();
    console.log('✅ 预览线重新生成完成');
    console.log('结果:', result);
    
    // 再次检查预览线数量
    const newLines = previewManager.getAllPreviewLines();
    console.log(`📊 重新生成后预览线数量: ${newLines.length}`);
    
    if (newLines.length > 0) {
      console.log('📋 预览线详情:');
      newLines.forEach((line, index) => {
        console.log(`  预览线 ${index + 1}:`, line);
      });
    }
  } catch (error) {
    console.error('❌ 预览线重新生成失败:', error);
  }
}

// 4. 检查节点是否应该创建预览线
console.log('\n🔍 检查每个节点是否应该创建预览线...');
if (graph && previewManager) {
  const nodes = graph.getNodes();
  nodes.forEach((node, index) => {
    const nodeId = node.id;
    const nodeData = node.getData();
    
    try {
      const shouldCreate = previewManager.shouldCreatePreviewLine(nodeData);
      console.log(`📍 节点 ${nodeId} 是否应创建预览线: ${shouldCreate}`);
      
      if (!shouldCreate) {
        // 检查具体原因
        const isEndNode = nodeData?.type === 'end';
        const isPreviewLineNode = nodeData?.type?.includes('preview');
        const isConfigured = nodeData?.isConfigured;
        
        console.log(`  - 是结束节点: ${isEndNode}`);
        console.log(`  - 是预览线节点: ${isPreviewLineNode}`);
        console.log(`  - 已配置: ${isConfigured}`);
      }
    } catch (error) {
      console.error(`❌ 检查节点 ${nodeId} 时出错:`, error);
    }
  });
}

console.log('\n🎯 节点检查完成！');