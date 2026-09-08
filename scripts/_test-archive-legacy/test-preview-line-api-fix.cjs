/**
 * 测试预览线API修复效果
 * 验证hasPreviewLine和getNodePreviewLines方法是否正常工作
 */

const { PreviewLineSystem } = require('./src/utils/preview-line/PreviewLineSystem.js');

console.log('🧪 开始测试预览线API修复效果...');

async function testPreviewLineAPI() {
  try {
    // 创建预览线系统实例
    const system = new PreviewLineSystem();
    
    // 初始化系统
    console.log('\n📋 步骤1: 初始化预览线系统');
    const initResult = await system.init();
    console.log('✅ 初始化结果:', initResult);
    
    if (!initResult) {
      console.error('❌ 系统初始化失败，无法继续测试');
      return;
    }
    
    // 测试新增的API方法
    console.log('\n📋 步骤2: 测试新增的API方法');
    
    // 测试hasPreviewLine方法
    console.log('\n🔍 测试hasPreviewLine方法:');
    try {
      const hasPreview1 = system.hasPreviewLine('test-node-1');
      console.log('- hasPreviewLine("test-node-1"):', hasPreview1);
      
      const hasPreview2 = system.hasPreviewLine('non-existent-node');
      console.log('- hasPreviewLine("non-existent-node"):', hasPreview2);
      
      console.log('✅ hasPreviewLine方法测试通过');
    } catch (error) {
      console.error('❌ hasPreviewLine方法测试失败:', error.message);
    }
    
    // 测试getNodePreviewLines方法
    console.log('\n🔍 测试getNodePreviewLines方法:');
    try {
      const nodeLines1 = system.getNodePreviewLines('test-node-1');
      console.log('- getNodePreviewLines("test-node-1"):', Array.isArray(nodeLines1) ? `数组(${nodeLines1.length}项)` : typeof nodeLines1);
      
      const nodeLines2 = system.getNodePreviewLines('non-existent-node');
      console.log('- getNodePreviewLines("non-existent-node"):', Array.isArray(nodeLines2) ? `数组(${nodeLines2.length}项)` : typeof nodeLines2);
      
      console.log('✅ getNodePreviewLines方法测试通过');
    } catch (error) {
      console.error('❌ getNodePreviewLines方法测试失败:', error.message);
    }
    
    // 测试原有方法是否仍然正常工作
    console.log('\n📋 步骤3: 测试原有方法兼容性');
    
    try {
      const allLines = system.getAllPreviewLines();
      console.log('- getAllPreviewLines成功，返回:', Array.isArray(allLines) ? `数组(${allLines.length}项)` : typeof allLines);
    } catch (error) {
      console.error('- getAllPreviewLines失败:', error.message);
    }
    
    try {
      const shouldCreate = system.shouldCreatePreviewLine({ id: 'test', data: { type: 'task', isConfigured: true } });
      console.log('- shouldCreatePreviewLine成功，返回:', shouldCreate);
    } catch (error) {
      console.error('- shouldCreatePreviewLine失败:', error.message);
    }
    
    // 测试forceRegeneratePreviewLines方法
    console.log('\n📋 步骤4: 测试forceRegeneratePreviewLines方法');
    try {
      const regenerateResult = await system.forceRegeneratePreviewLines();
      console.log('✅ forceRegeneratePreviewLines成功，结果:', {
        success: regenerateResult.success,
        previousCount: regenerateResult.previousCount,
        newCount: regenerateResult.newCount
      });
    } catch (error) {
      console.error('❌ forceRegeneratePreviewLines失败:', error.message);
      console.error('错误堆栈:', error.stack);
    }
    
    console.log('\n🎉 预览线API修复测试完成！');
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error.message);
    console.error('错误堆栈:', error.stack);
  }
}

// 运行测试
testPreviewLineAPI().then(() => {
  console.log('\n✅ 测试执行完成');
}).catch(error => {
  console.error('\n❌ 测试执行失败:', error);
});