/**
 * 测试布局引擎修复效果
 * 验证全局变量设置和预览线功能
 */

console.log('🔧 [测试] 开始验证布局引擎修复效果...');

// 1. 检查全局变量设置
console.log('\n📋 [测试] 检查全局变量设置:');
console.log('- window.UnifiedStructuredLayoutEngine:', typeof window.UnifiedStructuredLayoutEngine);
console.log('- window.unifiedStructuredLayoutEngine:', typeof window.unifiedStructuredLayoutEngine);
console.log('- window.layoutEngine:', typeof window.layoutEngine);

// 2. 检查布局引擎构造函数是否可用
if (typeof window.UnifiedStructuredLayoutEngine === 'function') {
  console.log('✅ [测试] UnifiedStructuredLayoutEngine构造函数可用');
  
  // 尝试创建实例（需要graph参数，这里只是测试构造函数）
  try {
    const testInstance = new window.UnifiedStructuredLayoutEngine(null);
    console.log('✅ [测试] 可以创建UnifiedStructuredLayoutEngine实例');
  } catch (error) {
    console.log('⚠️ [测试] 创建实例需要有效的graph参数:', error.message);
  }
} else {
  console.log('❌ [测试] UnifiedStructuredLayoutEngine构造函数不可用');
}

// 3. 检查预览线管理器
if (typeof window.unifiedPreviewLineManager !== 'undefined') {
  console.log('✅ [测试] 预览线管理器存在');
  
  const manager = window.unifiedPreviewLineManager;
  console.log('- layoutEngineReady:', manager.layoutEngineReady);
  console.log('- layoutEngine存在:', !!manager.layoutEngine);
  
  // 检查关键方法
  const methods = [
    'initializeLayoutEngineIfNeeded',
    'createBranchPreviewLines',
    'checkBranchHasRealConnection',
    'setLayoutEngine'
  ];
  
  methods.forEach(method => {
    console.log(`- ${method}方法:`, typeof manager[method]);
  });
} else {
  console.log('❌ [测试] 预览线管理器不存在');
}

// 4. 模拟布局引擎初始化测试
console.log('\n🔄 [测试] 模拟布局引擎初始化...');

if (window.unifiedPreviewLineManager && typeof window.unifiedPreviewLineManager.initializeLayoutEngineIfNeeded === 'function') {
  try {
    window.unifiedPreviewLineManager.initializeLayoutEngineIfNeeded();
    console.log('✅ [测试] 布局引擎初始化方法调用成功');
  } catch (error) {
    console.log('❌ [测试] 布局引擎初始化失败:', error.message);
  }
}

// 5. 检查命名一致性修复
console.log('\n🔍 [测试] 验证命名一致性修复:');
const hasUpperCase = typeof window.UnifiedStructuredLayoutEngine !== 'undefined';
const hasLowerCase = typeof window.unifiedStructuredLayoutEngine !== 'undefined';

if (hasUpperCase && hasLowerCase) {
  console.log('✅ [测试] 两种命名方式都可用，兼容性良好');
} else if (hasUpperCase) {
  console.log('⚠️ [测试] 只有大写命名可用');
} else if (hasLowerCase) {
  console.log('⚠️ [测试] 只有小写命名可用');
} else {
  console.log('❌ [测试] 两种命名都不可用');
}

console.log('\n🏁 [测试] 布局引擎修复效果验证完成');