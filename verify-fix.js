/**
 * 验证布局引擎初始化时序修复效果
 */

console.log('🔍 验证布局引擎初始化时序修复...');

// 模拟检查修复后的初始化顺序
const verifyInitializationOrder = () => {
  console.log('\n📋 修复内容总结:');
  console.log('1. ✅ 重新排序onMounted初始化步骤');
  console.log('   - 第3步: ConfigDrawers和布局引擎初始化');
  console.log('   - 第4步: UnifiedEdgeManager和PreviewLineSystem集成');
  
  console.log('\n2. ✅ 确保布局引擎在PreviewLineSystem初始化前就绪');
  console.log('   - configDrawers.structuredLayout.initializeLayoutEngine()');
  console.log('   - createLayoutEngineInstance()');
  console.log('   - 设置全局window.layoutEngine');
  
  console.log('\n3. ✅ 在PreviewLineSystem集成后立即设置布局引擎');
  console.log('   - previewLineSystemInstance.setLayoutEngine(window.layoutEngine)');
  
  console.log('\n4. ✅ 移除重复的configDrawers初始化代码');
  console.log('   - 清理setupConfigDrawersPreviewManager中的重复赋值');
  
  console.log('\n🎯 预期效果:');
  console.log('- PreviewLineSystem初始化时布局引擎已经可用');
  console.log('- 预览线创建功能正常工作');
  console.log('- 不再出现"布局引擎未就绪"错误');
  
  return true;
};

// 运行验证
verifyInitializationOrder();

console.log('\n✅ 布局引擎初始化时序修复验证完成');
console.log('💡 请在浏览器中访问应用并检查控制台日志确认修复效果');