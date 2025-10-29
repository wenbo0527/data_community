// 在浏览器控制台中运行修复验证测试
async function runBrowserFixTests() {
  console.log('🚀 开始运行修复验证测试...');
  
  try {
    // 1. 验证ES6导入是否正常工作
    console.log('📋 测试1: 验证ES6导入功能');
    const { createNodeConfig } = await import('/src/pages/marketing/tasks/composables/canvas/useCanvasNodes.js');
    const { getNodeConfig, getNodeAttrs } = await import('/src/utils/nodeTypes.js');
    console.log('✅ ES6导入测试通过 - 所有模块成功导入');
    
    // 2. 验证节点类型信息完整性
    console.log('📋 测试2: 验证节点类型信息完整性');
    const testNodeData = {
      type: 'start',
      nodeType: 'start',
      label: '开始节点',
      x: 100,
      y: 100
    };
    
    const nodeConfig = createNodeConfig(testNodeData);
    if (nodeConfig && nodeConfig.type && nodeConfig.nodeType) {
      console.log('✅ 节点类型信息测试通过 - 类型信息完整');
    } else {
      console.log('❌ 节点类型信息测试失败 - 类型信息缺失');
    }
    
    // 3. 验证预览线生成机制
    console.log('📋 测试3: 验证预览线生成机制');
    // 检查是否存在PreviewLineSystem
    if (window.PreviewLineSystem) {
      console.log('✅ 预览线系统测试通过 - PreviewLineSystem已加载');
    } else {
      console.log('⚠️ 预览线系统测试 - PreviewLineSystem未在全局作用域中找到');
    }
    
    // 4. 验证降级逻辑消除
    console.log('📋 测试4: 验证降级逻辑消除');
    // 检查GraphService中是否还存在require语句
    const graphServiceResponse = await fetch('/src/pages/marketing/tasks/services/GraphService.js');
    const graphServiceCode = await graphServiceResponse.text();
    
    if (!graphServiceCode.includes('require(')) {
      console.log('✅ 降级逻辑消除测试通过 - 无require语句');
    } else {
      console.log('❌ 降级逻辑消除测试失败 - 仍存在require语句');
    }
    
    console.log('🎉 修复验证测试完成！');
    return true;
    
  } catch (error) {
    console.error('❌ 修复验证测试失败:', error);
    return false;
  }
}

// 运行测试
runBrowserFixTests();