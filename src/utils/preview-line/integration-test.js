/**
 * PreviewLineSystem 与 PreviewLineManagerBuilder 集成测试
 */

import { PreviewLineSystem } from './PreviewLineSystem.js';
import { PreviewLineManagerBuilder } from './core/PreviewLineManagerBuilder.js';

// 模拟图形对象
const mockGraph = {
  getNodes: () => [],
  getEdges: () => [],
  addEdge: () => {},
  getCellById: () => null,
  on: () => {},
  off: () => {}
};

// 模拟布局引擎
const mockLayoutEngine = {
  getDirection: () => 'TB',
  isReady: () => true
};

console.log('=== PreviewLineSystem 与 Builder 模式集成测试 ===\n');

// 测试1: 默认使用 Builder 模式
console.log('1. 测试默认使用 Builder 模式');
try {
  const system1 = new PreviewLineSystem({
    graph: mockGraph,
    layoutEngine: mockLayoutEngine,
    modules: {
      previewLineManager: {
        preset: 'performance'
      }
    }
  });
  
  system1.init();
  console.log('✅ 默认 Builder 模式初始化成功');
  console.log('   预览线管理器类型:', system1.previewLineManager.constructor.name);
} catch (error) {
  console.error('❌ 默认 Builder 模式初始化失败:', error.message);
}

// 测试2: 显式禁用 Builder 模式
console.log('\n2. 测试显式禁用 Builder 模式');
try {
  const system2 = new PreviewLineSystem({
    graph: mockGraph,
    layoutEngine: mockLayoutEngine,
    modules: {
      previewLineManager: {
        useBuilder: false
      }
    }
  });
  
  system2.init();
  console.log('✅ 传统构造函数模式初始化成功');
  console.log('   预览线管理器类型:', system2.previewLineManager.constructor.name);
} catch (error) {
  console.error('❌ 传统构造函数模式初始化失败:', error.message);
}

// 测试3: Builder 模式配置测试
console.log('\n3. 测试 Builder 模式配置');
try {
  const system3 = new PreviewLineSystem({
    graph: mockGraph,
    layoutEngine: mockLayoutEngine,
    modules: {
      previewLineManager: {
        preset: 'debug',
        theme: 'dark',
        animation: { duration: 300 },
        config: {
          customOption: 'test'
        }
      }
    }
  });
  
  system3.init();
  console.log('✅ Builder 模式配置测试成功');
  console.log('   预览线管理器类型:', system3.previewLineManager.constructor.name);
} catch (error) {
  console.error('❌ Builder 模式配置测试失败:', error.message);
}

// 测试4: 获取 Builder 实例
console.log('\n4. 测试获取 Builder 实例');
try {
  const system4 = new PreviewLineSystem({
    graph: mockGraph,
    layoutEngine: mockLayoutEngine
  });
  
  system4.init();
  
  const builder = system4.getPreviewLineManagerBuilder();
  console.log('✅ 获取 Builder 实例成功');
  console.log('   Builder 类型:', builder.constructor.name);
  
  // 测试 Builder 链式调用
  const customManager = builder
    .performance()
    .theme('light')
    .build();
    
  console.log('✅ Builder 链式调用成功');
  console.log('   自定义管理器类型:', customManager.constructor.name);
} catch (error) {
  console.error('❌ 获取 Builder 实例失败:', error.message);
}

// 测试5: 错误处理
console.log('\n5. 测试错误处理');
try {
  const system5 = new PreviewLineSystem({
    graph: mockGraph,
    layoutEngine: mockLayoutEngine,
    modules: {
      previewLineManager: {
        preset: 'unknown_preset'
      }
    }
  });
  
  system5.init();
  console.log('✅ 未知预设配置处理成功（应该有警告信息）');
} catch (error) {
  console.error('❌ 错误处理测试失败:', error.message);
}

console.log('\n=== 集成测试完成 ===');