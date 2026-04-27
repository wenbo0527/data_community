// 测试布局引擎修复验证脚本
console.log('🔧 开始验证布局引擎修复...');

// 模拟浏览器环境
if (typeof window === 'undefined') {
  global.window = {};
}

// 导入相关模块
try {
  // 1. 导入UnifiedStructuredLayoutEngine
  const { UnifiedStructuredLayoutEngine } = require('./src/utils/UnifiedStructuredLayoutEngine.js');
  console.log('✅ UnifiedStructuredLayoutEngine导入成功');
  
  // 2. 检查构造函数
  console.log('🔍 UnifiedStructuredLayoutEngine类型:', typeof UnifiedStructuredLayoutEngine);
  
  // 3. 模拟设置全局构造函数
  window.UnifiedStructuredLayoutEngine = UnifiedStructuredLayoutEngine;
  console.log('✅ 已设置window.UnifiedStructuredLayoutEngine');
  
  // 4. 验证全局构造函数可用性
  console.log('🔍 window.UnifiedStructuredLayoutEngine类型:', typeof window.UnifiedStructuredLayoutEngine);
  
  // 5. 尝试创建实例
  if (typeof window.UnifiedStructuredLayoutEngine === 'function') {
    const mockGraph = { 
      getCells: () => [], 
      hasCell: () => false,
      getCellById: () => null
    };
    
    const layoutEngine = new window.UnifiedStructuredLayoutEngine(mockGraph);
    console.log('✅ 布局引擎实例创建成功');
    
    // 6. 检查关键方法
    console.log('🔍 getNodeLayerY方法:', typeof layoutEngine.getNodeLayerY);
    console.log('🔍 getNodeLayerIndex方法:', typeof layoutEngine.getNodeLayerIndex);
    
    if (typeof layoutEngine.getNodeLayerY === 'function') {
      console.log('✅ 关键方法getNodeLayerY可用，修复成功！');
    } else {
      console.log('❌ 关键方法getNodeLayerY不可用');
    }
  } else {
    console.log('❌ window.UnifiedStructuredLayoutEngine不是函数');
  }
  
} catch (error) {
  console.error('❌ 测试过程中出现错误:', error.message);
}

console.log('🏁 布局引擎修复验证完成');