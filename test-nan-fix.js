// 测试NaN坐标修复效果
console.log('🔍 开始测试NaN坐标修复效果...');

try {
  // 尝试获取graph实例
  const graph = window.graph || window.graphInstance;
  if (graph) {
    console.log('✅ 找到graph实例，开始测试布局...');
    
    // 获取所有节点
    const nodes = graph.getNodes();
    console.log('📊 当前节点数量:', nodes.length);
    
    // 检查节点当前位置
    console.log('🔍 检查节点当前位置...');
    nodes.forEach((node, index) => {
      const pos = node.getPosition();
      console.log(`📍 节点${index} (${node.id}) 当前位置:`, pos);
      if (isNaN(pos.x) || isNaN(pos.y)) {
        console.error('🚨 发现NaN坐标!', { nodeId: node.id, position: pos });
      }
    });
    
    // 触发统一结构化布局
    console.log('🚀 触发布局操作...');
    if (window.layoutEngine && window.layoutEngine.performUnifiedStructuredLayout) {
      console.log('使用统一结构化布局...');
      window.layoutEngine.performUnifiedStructuredLayout();
    } else if (graph.layout) {
      console.log('使用graph布局...');
      graph.layout();
    } else {
      console.log('⚠️ 未找到布局方法，尝试手动触发...');
      // 尝试手动触发布局
      const event = new CustomEvent('triggerLayout');
      window.dispatchEvent(event);
    }
    
    // 等待布局完成后检查位置
    setTimeout(() => {
      console.log('🔍 布局完成后检查节点位置...');
      nodes.forEach((node, index) => {
        const pos = node.getPosition();
        console.log(`📍 节点${index} (${node.id}) 布局后位置:`, pos);
        if (isNaN(pos.x) || isNaN(pos.y)) {
          console.error('🚨 布局后仍有NaN坐标!', { nodeId: node.id, position: pos });
        } else {
          console.log('✅ 坐标正常:', { nodeId: node.id, position: pos });
        }
      });
      
      console.log('🎉 NaN坐标修复测试完成!');
    }, 2000);
    
  } else {
    console.log('❌ 未找到graph实例');
    console.log('🔍 尝试查找其他可能的graph实例...');
    console.log('window对象中的graph相关属性:', Object.keys(window).filter(key => key.toLowerCase().includes('graph')));
  }
} catch (error) {
  console.error('❌ 测试过程中出错:', error);
  console.error('错误堆栈:', error.stack);
}

console.log('📋 请在浏览器控制台中运行此脚本来测试NaN坐标修