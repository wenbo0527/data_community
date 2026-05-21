import { PreviewLineSystem } from './src/utils/preview-line/PreviewLineSystem.js';
import EventManager from './src/utils/preview-line/events/EventManager.js';

console.log('🔍 全面调试undefined错误来源...');

// 追踪所有可能的错误来源
let errorCount = 0;

// 1. 重写EventManager的emit方法
const originalEmit = EventManager.prototype.emit;
EventManager.prototype.emit = function(event, ...args) {
  if (event === 'system:error') {
    errorCount++;
    console.log(`\n🚨 第${errorCount}次 system:error事件被触发:`);
    console.log('  - event:', event);
    console.log('  - args:', args);
    console.log('  - args[0] 类型:', typeof args[0]);
    console.log('  - args[0] 是否为undefined:', args[0] === undefined);
    console.log('  - args[0] 是否为null:', args[0] === null);
    if (args[0]) {
      console.log('  - args[0].error:', args[0].error);
      console.log('  - args[0].context:', args[0].context);
    }
    console.log('  - 调用栈:', new Error().stack);
    console.log('---');
  }
  
  return originalEmit.call(this, event, ...args);
};

// 2. 重写PreviewLineSystem的handleError方法
const originalHandleError = PreviewLineSystem.prototype.handleError;
PreviewLineSystem.prototype.handleError = function(error, context) {
  console.log(`\n📝 handleError被调用:`);
  console.log('  - error:', error);
  console.log('  - error类型:', typeof error);
  console.log('  - error是否为undefined:', error === undefined);
  console.log('  - context:', context);
  console.log('  - 调用栈:', new Error().stack);
  console.log('---');
  
  return originalHandleError.call(this, error, context);
};

// 3. 监听未捕获的Promise rejection
process.on('unhandledRejection', (reason, promise) => {
  console.log('\n🚨 未捕获的Promise rejection:');
  console.log('  - reason:', reason);
  console.log('  - promise:', promise);
  console.log('---');
});

// 4. 监听未捕获的异常
process.on('uncaughtException', (error) => {
  console.log('\n🚨 未捕获的异常:');
  console.log('  - error:', error);
  console.log('---');
});

// 5. 重写console.error来追踪所有错误输出
const originalConsoleError = console.error;
console.error = function(...args) {
  if (args.some(arg => typeof arg === 'string' && arg.includes('undefined error'))) {
    console.log('\n🎯 发现"undefined error"输出:');
    console.log('  - args:', args);
    console.log('  - 调用栈:', new Error().stack);
    console.log('---');
  }
  return originalConsoleError.apply(this, args);
};

// 测试代码
async function runComprehensiveTest() {
  try {
    console.log('\n🚀 开始全面测试...');
    
    // 创建PreviewLineSystem实例
    const system = new PreviewLineSystem({
      system: {
        enableDebug: true
      }
    });
    
    console.log('✅ PreviewLineSystem实例创建成功');
    
    // 初始化系统
    console.log('\n🔧 初始化系统...');
    const initResult = await system.init();
    console.log('初始化结果:', initResult);
    
    // 等待一段时间，看是否有异步错误
    console.log('\n⏳ 等待异步操作...');
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // 测试一些可能触发错误的操作
    console.log('\n🧪 测试错误触发操作...');
    
    // 测试1: 调用不存在的方法
    try {
      if (system.someNonExistentMethod) {
        system.someNonExistentMethod();
      }
    } catch (error) {
      console.log('测试1: 捕获到预期错误');
    }
    
    // 测试2: 传入无效参数
    try {
      system.updateLayoutDirection('INVALID');
    } catch (error) {
      console.log('测试2: 捕获到预期错误');
    }
    
    // 测试3: 直接调用handleError with undefined
    console.log('\n🧪 测试直接调用handleError with undefined...');
    system.handleError(undefined, 'test-undefined');
    
    // 测试4: 直接调用handleError with null
    console.log('\n🧪 测试直接调用handleError with null...');
    system.handleError(null, 'test-null');
    
    console.log('\n✅ 全面测试完成');
    console.log(`总共捕获到 ${errorCount} 次 system:error 事件`);
    
  } catch (error) {
    console.error('测试过程中发生错误:', error);
  }
}

// 运行测试
runComprehensiveTest();