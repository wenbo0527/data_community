import { PreviewLineSystem } from './src/utils/preview-line/PreviewLineSystem.js';
import EventManager from './src/utils/preview-line/events/EventManager.js';

console.log('🔍 调试undefined错误来源...');

// 重写EventManager的emit方法来追踪所有事件
const originalEmit = EventManager.prototype.emit;
EventManager.prototype.emit = function(event, ...args) {
  if (event === 'system:error') {
    console.log('🚨 system:error事件被触发:');
    console.log('  - event:', event);
    console.log('  - args:', args);
    console.log('  - 调用栈:', new Error().stack);
    console.log('---');
  }
  
  return originalEmit.call(this, event, ...args);
};

// 重写handleError方法来追踪调用栈
const originalHandleError = PreviewLineSystem.prototype.handleError;
PreviewLineSystem.prototype.handleError = function(error, context) {
  console.log('🚨 handleError被调用:');
  console.log('  - error:', error);
  console.log('  - context:', context);
  console.log('  - typeof error:', typeof error);
  console.log('  - error === undefined:', error === undefined);
  console.log('  - 调用栈:', new Error().stack);
  console.log('---');
  
  return originalHandleError.call(this, error, context);
};

try {
  console.log('📋 创建PreviewLineSystem实例...');
  const system = new PreviewLineSystem({
    system: {
      enableDebug: true
    }
  });
  
  console.log('📋 初始化系统...');
  await system.init();
  
  console.log('📋 测试updateLayoutDirection...');
  await system.updateLayoutDirection('TB');
  
  console.log('📋 测试无效方向...');
  try {
    await system.updateLayoutDirection('INVALID');
  } catch (error) {
    console.log('✅ 正确捕获错误:', error.message);
  }
  
  console.log('✅ 测试完成');
} catch (error) {
  console.error('❌ 测试失败:', error);
}