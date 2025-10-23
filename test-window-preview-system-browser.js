// 浏览器环境下测试window.previewLineSystem的脚本
// 在浏览器控制台中运行此脚本

console.log('🔍 开始测试window.previewLineSystem...');

// 检查window.previewLineSystem是否存在
if (typeof window.previewLineSystem === 'undefined') {
  console.error('❌ window.previewLineSystem 不存在');
  console.error('⚠️ 未找到全局previewLineSystem实例，无法进行完整测试');
} else {
  console.log('✅ window.previewLineSystem 存在');
  console.log(`📋 类型: ${typeof window.previewLineSystem}`);
  
  // 检查构造函数
  if (window.previewLineSystem.constructor) {
    console.log(`🏗️ 构造函数: ${window.previewLineSystem.constructor.name}`);
  }
  
  // 检查关键方法
  const keyMethods = [
    'createPreviewLine',
    'updatePreviewLine', 
    'clearPreviewLines',
    'checkNodeSnapToPreviewLines',
    'handleNodeConfigUpdated'
  ];
  
  console.log('🔧 检查关键方法:');
  keyMethods.forEach(method => {
    const exists = typeof window.previewLineSystem[method] === 'function';
    console.log(`  ${method}: ${exists ? '✅' : '❌'}`);
  });
  
  // 检查系统状态
  if (typeof window.previewLineSystem.getSystemStatus === 'function') {
    try {
      const status = window.previewLineSystem.getSystemStatus();
      console.log('📊 系统状态:', status);
    } catch (error) {
      console.error('❌ 获取系统状态时出错:', error.message);
    }
  } else {
    console.warn('⚠️ getSystemStatus方法不可用');
  }
  
  // 检查是否已初始化
  if (typeof window.previewLineSystem.isInitialized === 'function') {
    try {
      const initialized = window.previewLineSystem.isInitialized();
      console.log(`🔄 初始化状态: ${initialized ? '已初始化' : '未初始化'}`);
    } catch (error) {
      console.error('❌ 检查初始化状态时出错:', error.message);
    }
  }
  
  console.log('✅ 全局PreviewLineSystem测试完成');
}

// 检查其他相关的window对象
console.log('🌐 检查Window对象中的相关属性...');

const objectsToCheck = [
  'previewLineSystem',
  'layoutEngine', 
  'unifiedStructuredLayoutEngine',
  'UnifiedStructuredLayoutEngine'
];

objectsToCheck.forEach(obj => {
  const exists = typeof window[obj] !== 'undefined';
  const type = typeof window[obj];
  console.log(`window.${obj}: ${exists ? '✅' : '❌'} (${type})`);
});

// 列出window对象中包含'preview'或'layout'的属性
console.log('🔍 搜索相关属性...');
const relevantProps = Object.keys(window).filter(key => 
  key.toLowerCase().includes('preview') || 
  key.toLowerCase().includes('layout') ||
  key.toLowerCase().includes('engine')
);

if (relevantProps.length > 0) {
  console.log(`📋 找到相关属性: ${relevantProps.join(', ')}`);
} else {
  console.warn('⚠️ 未找到相关属性');
}

console.log('🎉 测试完成！');