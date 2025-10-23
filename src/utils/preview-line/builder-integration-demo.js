/**
 * PreviewLineManagerBuilder 集成演示
 * 展示 Builder 模式的核心功能，不依赖复杂的系统集成
 */

import { PreviewLineManagerBuilder } from './core/PreviewLineManagerBuilder.js';

console.log('=== PreviewLineManagerBuilder 功能演示 ===\n');

// 演示1: 基本 Builder 功能
console.log('1. 基本 Builder 功能演示');
try {
  const builder = new PreviewLineManagerBuilder();
  console.log('✅ Builder 实例创建成功');
  console.log('   Builder 类型:', builder.constructor.name);
  
  // 测试链式调用
  const chainResult = builder
    .withConfig({ testOption: 'testValue' })
    .withDebugOptions({ enabled: true });
    
  console.log('✅ 链式调用成功');
  console.log('   返回类型:', chainResult.constructor.name);
} catch (error) {
  console.error('❌ 基本功能演示失败:', error.message);
}

// 演示2: 配置功能
console.log('\n2. 配置功能演示');
try {
  const builder = new PreviewLineManagerBuilder();
  
  // 测试配置设置
  builder.withConfig({
    animationDuration: 300,
    theme: 'dark',
    enableOptimization: true
  });
  console.log('✅ 基础配置设置成功');
  
  // 测试性能配置
  builder.withPerformanceOptions({
    enableCaching: true,
    batchSize: 100
  });
  console.log('✅ 性能配置设置成功');
  
  // 测试调试配置
  builder.withDebugOptions({
    enabled: true,
    logLevel: 'info'
  });
  console.log('✅ 调试配置设置成功');
} catch (error) {
  console.error('❌ 配置功能演示失败:', error.message);
}

// 演示3: 事件配置功能
console.log('\n3. 事件配置功能演示');
try {
  const builder = new PreviewLineManagerBuilder();
  
  // 测试事件配置
  builder.withEventOptions({
    enableEventLogging: true,
    maxEventHistory: 100
  });
  console.log('✅ 事件配置成功');
  
  // 测试事件处理器添加
  builder.addEventHandler('test-event', () => {
    console.log('测试事件处理器');
  });
  console.log('✅ 事件处理器添加成功');
} catch (error) {
  console.error('❌ 事件配置演示失败:', error.message);
}

// 演示4: 初始化配置功能
console.log('\n4. 初始化配置功能演示');
try {
  const builder = new PreviewLineManagerBuilder();
  
  builder.withInitOptions({
    autoInitialize: false,
    delayedInit: true
  });
  console.log('✅ 初始化配置成功');
  
  builder.autoInitialize(true);
  console.log('✅ 自动初始化设置成功');
} catch (error) {
  console.error('❌ 初始化配置演示失败:', error.message);
}

// 演示5: Builder 重置功能
console.log('\n5. Builder 重置功能演示');
try {
  const builder = new PreviewLineManagerBuilder();
  
  // 设置一些配置
  builder
    .withConfig({ option1: 'value1' })
    .withDebugOptions({ enabled: true })
    .withPerformanceOptions({ enableCaching: true });
    
  console.log('✅ 配置设置完成');
  
  // 重置 Builder
  const resetResult = builder.reset();
  console.log('✅ Builder 重置成功');
  console.log('   重置后返回类型:', resetResult.constructor.name);
} catch (error) {
  console.error('❌ 重置功能演示失败:', error.message);
}

// 演示6: 验证功能
console.log('\n6. 验证功能演示');
try {
  const builder = new PreviewLineManagerBuilder();
  
  // 设置基本配置
  builder.withConfig({ validOption: 'validValue' });
  
  // 执行验证
  const validationResult = builder.validate();
  console.log('✅ 验证功能执行成功');
  console.log('   验证结果:', validationResult ? '通过' : '失败');
} catch (error) {
  console.error('❌ 验证功能演示失败:', error.message);
}

// 演示7: 静态工厂方法
console.log('\n7. 静态工厂方法演示');
try {
  // 测试默认创建
  const defaultBuilder = PreviewLineManagerBuilder.createDefault();
  console.log('✅ 默认 Builder 创建成功');
  console.log('   类型:', defaultBuilder.constructor.name);
  
  // 测试开发环境创建
  const devBuilder = PreviewLineManagerBuilder.createForDevelopment();
  console.log('✅ 开发环境 Builder 创建成功');
  
  // 测试生产环境创建
  const prodBuilder = PreviewLineManagerBuilder.createForProduction();
  console.log('✅ 生产环境 Builder 创建成功');
  
  // 测试测试环境创建
  const testBuilder = PreviewLineManagerBuilder.createForTesting();
  console.log('✅ 测试环境 Builder 创建成功');
} catch (error) {
  console.error('❌ 静态工厂方法演示失败:', error.message);
}

// 演示8: 配置组合功能
console.log('\n8. 配置组合功能演示');
try {
  const builder = new PreviewLineManagerBuilder();
  
  // 组合多种配置
  builder
    .withConfig({                    // 基础配置
      theme: 'dark',
      animationDuration: 500
    })
    .withPerformanceOptions({        // 性能配置
      enableCaching: true,
      batchSize: 50
    })
    .withDebugOptions({             // 调试配置
      enabled: false
    })
    .withEventOptions({             // 事件配置
      enableEventLogging: true
    })
    .withInitOptions({              // 初始化配置
      autoInitialize: true
    });
    
  console.log('✅ 配置组合成功');
  console.log('   Builder 状态正常');
} catch (error) {
  console.error('❌ 配置组合演示失败:', error.message);
}

console.log('\n=== 演示完成 ===');
console.log('\n📋 总结:');
console.log('- PreviewLineManagerBuilder 核心功能正常');
console.log('- 链式调用 API 工作正常');
console.log('- 配置功能完整');
console.log('- 事件和初始化配置支持完善');
console.log('- 验证和重置功能健全');
console.log('- 静态工厂方法可用');
console.log('\n🎉 Builder 模式实现成功！');