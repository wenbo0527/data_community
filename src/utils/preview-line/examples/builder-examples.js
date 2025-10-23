/**
 * PreviewLineManagerBuilder 使用示例
 * 展示各种使用场景和最佳实践
 */

import { PreviewLineManagerBuilder, createPreviewLineManager } from '../core/PreviewLineManagerBuilder.js';
import { PreviewLineConfigManager } from '../config/PreviewLineConfig.js';

// 示例 1: 基础使用
export function basicUsageExample(graph, layoutEngine) {
  console.log('=== 基础使用示例 ===');
  
  const manager = new PreviewLineManagerBuilder()
    .withGraph(graph)
    .withLayoutEngine(layoutEngine)
    .withInitOptions({ autoInitialize: false })
    .build();
    
  console.log('基础 Manager 创建成功:', manager);
  return manager;
}

// 示例 2: 完整配置
export function fullConfigurationExample(graph, layoutEngine, branchManager) {
  console.log('=== 完整配置示例 ===');
  
  const configManager = new PreviewLineConfigManager({
    theme: 'dark',
    animation: { enabled: true, duration: 300 }
  });
  
  const manager = new PreviewLineManagerBuilder()
    .withGraph(graph)
    .withBranchManager(branchManager)
    .withLayoutEngine(layoutEngine)
    .withConfigManager(configManager)
    .withConfig({
      previewLine: {
        strokeWidth: 2,
        strokeColor: '#007bff',
        dashArray: '5,5'
      }
    })
    .withPerformanceOptions({
      enablePerformanceMonitor: true,
      cacheEnabled: true,
      maxCacheSize: 1000
    })
    .withDebugOptions({
      enabled: true,
      logLevel: 'info'
    })
    .withEventOptions({
      enableEventListeners: true,
      eventThrottleDelay: 50
    })
    .addEventHandler('previewLineCreated', (event) => {
      console.log('预览线创建:', event);
    })
    .addEventHandler('previewLineDestroyed', (event) => {
      console.log('预览线销毁:', event);
    })
    .withInitOptions({
      autoInitialize: false,
      validateOnInit: true
    })
    .build();
    
  console.log('完整配置 Manager 创建成功:', manager);
  return manager;
}

// 示例 3: 预设配置使用
export function presetConfigurationExample(graph, layoutEngine) {
  console.log('=== 预设配置示例 ===');
  
  // 开发环境配置
  const devManager = PreviewLineManagerBuilder
    .createForDevelopment()
    .withGraph(graph)
    .withLayoutEngine(layoutEngine)
    .build();
  console.log('开发环境 Manager:', devManager);
  
  // 生产环境配置
  const prodManager = PreviewLineManagerBuilder
    .createForProduction()
    .withGraph(graph)
    .withLayoutEngine(layoutEngine)
    .build();
  console.log('生产环境 Manager:', prodManager);
  
  // 测试环境配置
  const testManager = PreviewLineManagerBuilder
    .createForTesting()
    .withGraph(graph)
    .withLayoutEngine(layoutEngine)
    .build();
  console.log('测试环境 Manager:', testManager);
  
  return { devManager, prodManager, testManager };
}

// 示例 4: 主题配置
export function themeConfigurationExample(graph, layoutEngine) {
  console.log('=== 主题配置示例 ===');
  
  // 深色主题
  const darkManager = new PreviewLineManagerBuilder()
    .withGraph(graph)
    .withLayoutEngine(layoutEngine)
    .withDarkTheme()
    .withConfig({
      previewLine: {
        strokeColor: '#ffffff',
        backgroundColor: '#1a1a1a'
      }
    })
    .build();
  console.log('深色主题 Manager:', darkManager);
  
  // 浅色主题
  const lightManager = new PreviewLineManagerBuilder()
    .withGraph(graph)
    .withLayoutEngine(layoutEngine)
    .withLightTheme()
    .withConfig({
      previewLine: {
        strokeColor: '#000000',
        backgroundColor: '#ffffff'
      }
    })
    .build();
  console.log('浅色主题 Manager:', lightManager);
  
  // 自定义主题
  const customManager = new PreviewLineManagerBuilder()
    .withGraph(graph)
    .withLayoutEngine(layoutEngine)
    .withConfig({
      theme: {
        name: 'custom',
        primaryColor: '#007bff',
        secondaryColor: '#6c757d',
        backgroundColor: '#f8f9fa',
        borderColor: '#dee2e6'
      }
    })
    .build();
  console.log('自定义主题 Manager:', customManager);
  
  return { darkManager, lightManager, customManager };
}

// 示例 5: 动画配置
export function animationConfigurationExample(graph, layoutEngine) {
  console.log('=== 动画配置示例 ===');
  
  // 启用动画
  const animatedManager = new PreviewLineManagerBuilder()
    .withGraph(graph)
    .withLayoutEngine(layoutEngine)
    .withAnimationEnabled()
    .withConfig({
      animation: {
        duration: 500,
        easing: 'ease-in-out',
        delay: 100
      }
    })
    .build();
  console.log('动画启用 Manager:', animatedManager);
  
  // 禁用动画
  const staticManager = new PreviewLineManagerBuilder()
    .withGraph(graph)
    .withLayoutEngine(layoutEngine)
    .withAnimationDisabled()
    .build();
  console.log('动画禁用 Manager:', staticManager);
  
  return { animatedManager, staticManager };
}

// 示例 6: 性能优化配置
export function performanceOptimizationExample(graph, layoutEngine) {
  console.log('=== 性能优化示例 ===');
  
  const optimizedManager = new PreviewLineManagerBuilder()
    .withGraph(graph)
    .withLayoutEngine(layoutEngine)
    .withPerformanceOptions({
      enablePerformanceMonitor: true,
      cacheEnabled: true,
      maxCacheSize: 2000,
      debounceDelay: 100,
      throttleDelay: 50
    })
    .enablePerformanceMonitor(true)
    .withConfig({
      optimization: {
        enableVirtualization: true,
        batchUpdates: true,
        lazyLoading: true
      }
    })
    .build();
    
  console.log('性能优化 Manager:', optimizedManager);
  return optimizedManager;
}

// 示例 7: 调试配置
export function debugConfigurationExample(graph, layoutEngine) {
  console.log('=== 调试配置示例 ===');
  
  const debugManager = new PreviewLineManagerBuilder()
    .withGraph(graph)
    .withLayoutEngine(layoutEngine)
    .withDebugOptions({
      enabled: true,
      logLevel: 'debug',
      showPerformanceMetrics: true,
      enableStackTrace: true
    })
    .enableDebug(true, 'debug')
    .addEventHandler('debug', (event) => {
      console.log('调试事件:', event);
    })
    .build();
    
  console.log('调试配置 Manager:', debugManager);
  return debugManager;
}

// 示例 8: 错误处理
export function errorHandlingExample(graph, layoutEngine) {
  console.log('=== 错误处理示例 ===');
  
  try {
    // 故意传入无效参数
    const manager = new PreviewLineManagerBuilder()
      .withGraph(null) // 无效的 graph
      .withLayoutEngine(layoutEngine)
      .build();
  } catch (error) {
    console.log('捕获到错误:', error.name, error.message);
    
    // 正确的错误处理
    if (error.name === 'RequiredParameterError') {
      console.log('处理必需参数错误');
      // 使用默认值或提示用户
    } else if (error.name === 'ParameterTypeError') {
      console.log('处理参数类型错误');
      // 转换参数类型或提示用户
    }
  }
  
  // 正确的创建方式
  const validManager = new PreviewLineManagerBuilder()
    .withGraph(graph)
    .withLayoutEngine(layoutEngine)
    .validate() // 验证配置
    .build();
    
  console.log('正确创建的 Manager:', validManager);
  return validManager;
}

// 示例 9: Builder 实例复用
export function builderReuseExample(graph, layoutEngine) {
  console.log('=== Builder 复用示例 ===');
  
  // 创建基础 Builder
  const baseBuilder = new PreviewLineManagerBuilder()
    .withGraph(graph)
    .withLayoutEngine(layoutEngine)
    .withPerformanceOptions({ cacheEnabled: true });
  
  // 创建不同配置的 Manager
  const manager1 = baseBuilder
    .withConfig({ theme: 'dark' })
    .build();
  console.log('Manager 1 (深色主题):', manager1);
  
  const manager2 = baseBuilder
    .reset() // 重置配置
    .withGraph(graph)
    .withLayoutEngine(layoutEngine)
    .withPerformanceOptions({ cacheEnabled: true })
    .withConfig({ theme: 'light' })
    .build();
  console.log('Manager 2 (浅色主题):', manager2);
  
  return { manager1, manager2 };
}

// 示例 10: 工厂函数使用
export function factoryFunctionExample(graph, layoutEngine) {
  console.log('=== 工厂函数示例 ===');
  
  // 使用工厂函数直接创建 Manager
  const manager = createPreviewLineManager(graph, {
    layoutEngine,
    config: {
      theme: 'dark',
      animation: { enabled: true }
    },
    performanceOptions: {
      cacheEnabled: true,
      maxCacheSize: 1000
    },
    initOptions: {
      autoInitialize: false
    }
  });
  
  console.log('工厂函数创建的 Manager:', manager);
  return manager;
}

// 示例 11: 环境特定配置
export function environmentSpecificExample(graph, layoutEngine) {
  console.log('=== 环境特定配置示例 ===');
  
  const createManagerForEnvironment = (env) => {
    const baseBuilder = new PreviewLineManagerBuilder()
      .withGraph(graph)
      .withLayoutEngine(layoutEngine);
    
    switch (env) {
      case 'development':
        return baseBuilder
          .withDebugOptions({ enabled: true, logLevel: 'debug' })
          .enablePerformanceMonitor(true)
          .withConfig({ 
            validation: { strictMode: false },
            performance: { enableProfiling: true }
          })
          .build();
          
      case 'production':
        return baseBuilder
          .withPerformanceOptions({ 
            cacheEnabled: true,
            maxCacheSize: 2000 
          })
          .withConfig({ 
            validation: { strictMode: true },
            optimization: { enableMinification: true }
          })
          .build();
          
      case 'testing':
        return baseBuilder
          .withConfig({ 
            validation: { strictMode: true },
            testing: { mockEnabled: true }
          })
          .withInitOptions({ 
            autoInitialize: false,
            validateOnInit: true 
          })
          .build();
          
      default:
        return baseBuilder.build();
    }
  };
  
  const devManager = createManagerForEnvironment('development');
  const prodManager = createManagerForEnvironment('production');
  const testManager = createManagerForEnvironment('testing');
  
  console.log('开发环境 Manager:', devManager);
  console.log('生产环境 Manager:', prodManager);
  console.log('测试环境 Manager:', testManager);
  
  return { devManager, prodManager, testManager };
}

// 示例 12: 集成示例
export function integrationExample(graph, layoutEngine, existingSystem) {
  console.log('=== 集成示例 ===');
  
  // 与现有系统集成
  const integratedManager = new PreviewLineManagerBuilder()
    .withGraph(graph)
    .withLayoutEngine(layoutEngine)
    .withConfigManager(existingSystem.configManager)
    .withEventManager(existingSystem.eventManager)
    .addEventHandler('systemEvent', existingSystem.handleSystemEvent)
    .withConfig(existingSystem.getDefaultConfig())
    .withInitOptions({ 
      autoInitialize: false,
      integrateWithExisting: true 
    })
    .build();
  
  // 初始化集成
  if (existingSystem.isReady()) {
    integratedManager.initialize();
  } else {
    existingSystem.onReady(() => {
      integratedManager.initialize();
    });
  }
  
  console.log('集成 Manager:', integratedManager);
  return integratedManager;
}

// 导出所有示例
export const examples = {
  basicUsage: basicUsageExample,
  fullConfiguration: fullConfigurationExample,
  presetConfiguration: presetConfigurationExample,
  themeConfiguration: themeConfigurationExample,
  animationConfiguration: animationConfigurationExample,
  performanceOptimization: performanceOptimizationExample,
  debugConfiguration: debugConfigurationExample,
  errorHandling: errorHandlingExample,
  builderReuse: builderReuseExample,
  factoryFunction: factoryFunctionExample,
  environmentSpecific: environmentSpecificExample,
  integration: integrationExample
};

// 运行所有示例的函数
export function runAllExamples(graph, layoutEngine, options = {}) {
  console.log('开始运行所有 PreviewLineManagerBuilder 示例...');
  
  const results = {};
  
  try {
    results.basic = basicUsageExample(graph, layoutEngine);
    results.fullConfig = fullConfigurationExample(graph, layoutEngine, options.branchManager);
    results.presets = presetConfigurationExample(graph, layoutEngine);
    results.themes = themeConfigurationExample(graph, layoutEngine);
    results.animations = animationConfigurationExample(graph, layoutEngine);
    results.performance = performanceOptimizationExample(graph, layoutEngine);
    results.debug = debugConfigurationExample(graph, layoutEngine);
    results.errorHandling = errorHandlingExample(graph, layoutEngine);
    results.builderReuse = builderReuseExample(graph, layoutEngine);
    results.factoryFunction = factoryFunctionExample(graph, layoutEngine);
    results.environmentSpecific = environmentSpecificExample(graph, layoutEngine);
    
    if (options.existingSystem) {
      results.integration = integrationExample(graph, layoutEngine, options.existingSystem);
    }
    
    console.log('所有示例运行完成!');
    return results;
  } catch (error) {
    console.error('示例运行失败:', error);
    throw error;
  }
}