import { PreviewLineSystem } from './src/utils/preview-line/PreviewLineSystem.js';

console.log('🧪 测试错误处理修复...');

try {
  const system = new PreviewLineSystem();
  
  // 测试handleError方法
  console.log('📋 测试1: 正常错误对象');
  const normalError = new Error('测试错误');
  system.handleError(normalError, 'test-context');
  console.log('✅ 正常错误处理成功');
  
  console.log('📋 测试2: undefined错误对象');
  system.handleError(undefined, 'test-context');
  console.log('✅ undefined错误处理成功');
  
  console.log('📋 测试3: null错误对象');
  system.handleError(null, 'test-context');
  console.log('✅ null错误处理成功');
  
  console.log('📋 测试4: 字符串错误对象');
  system.handleError('字符串错误', 'test-context');
  console.log('✅ 字符串错误处理成功');
  
  console.log('🏁 所有错误处理测试通过！');
  
} catch (error) {
  console.error('❌ 测试失败:', error.message);
  console.error(error.stack);
}