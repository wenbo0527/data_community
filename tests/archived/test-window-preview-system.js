// 测试window.previewLineSystem是否可用
console.log('🔍 开始测试window.previewLineSystem...');

// 检查window.previewLineSystem是否存在
if (typeof window !== 'undefined' && window.previewLineSystem) {
  console.log('✅ window.previewLineSystem 存在');
  console.log('📋 previewLineSystem类型:', typeof window.previewLineSystem);
  console.log('📋 previewLineSystem构造函数:', window.previewLineSystem.constructor.name);
  
  // 检查关键方法
  const keyMethods = [
    'checkNodeSnapToPreviewLines',
    'handleNodeConfigUpdated', 
    'createPreviewLine',
    'updatePreviewLine',
    'clearPreviewLines',
    'setLayoutEngine',
    'init',
    'destroy'
  ];
  
  console.log('🔍 检查关键方法:');
  keyMethods.forEach(method => {
    const exists = typeof window.previewLineSystem[method] === 'function';
    console.log(`  ${exists ? '✅' : '❌'} ${method}: ${typeof window.previewLineSystem[method]}`);
  });
  
  // 检查系统状态
  if (window.previewLineSystem.getSystemStatus) {
    console.log('📊 系统状态:', window.previewLineSystem.getSystemStatus());
  }
  
  console.log('🎉 window.previewLineSystem 测试完成 - 全局实例可用!');
} else {
  console.error('❌ window.previewLineSystem 不存在');
  console.log('🔍 window对象中的相关属性:');
  if (typeof window !== 'undefined') {
    Object.keys(window).filter(key => key.toLowerCase().includes('preview')).forEach(key => {
      console.log(`  - ${key}: ${typeof window[key]}`);
    });
  }
}

// 检查其他相关的全局对象
if (typeof window !== 'undefined') {
  console.log('\n🔍 检查其他相关全局对象:');
  console.log('  - window.layoutEngine:', typeof window.layoutEngine);
  console.log('  - window.unifiedStructuredLayoutEngine:', typeof window.unifiedStructuredLayoutEngine);
  console.log('  - window.UnifiedStructuredLayoutEngine:', typeof window.UnifiedStructuredLayoutEngine);
}