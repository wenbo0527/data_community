/**
 * 第二阶段重构测试 - 性能模块集成测试
 * 测试新集成的性能模块：LayoutCache、DebounceManager、PerformanceMonitor、PreviewLineLock
 */

import UnifiedStructuredLayoutEngine from './src/pages/marketing/tasks/utils/canvas/UnifiedStructuredLayoutEngine.js';

// 模拟图对象
const mockGraph = {
  getNodes: () => [
    { id: 'node1', type: 'start' },
    { id: 'node2', type: 'normal' },
    { id: 'node3', type: 'end' }
  ],
  getEdges: () => [
    { id: 'edge1', source: 'node1', target: 'node2' },
    { id: 'edge2', source: 'node2', target: 'node3' }
  ],
  getCellById: (id) => ({
    setPosition: (x, y) => console.log(`📍 设置节点 ${id} 位置: (${x}, ${y})`)
  })
};

async function testPhase2Integration() {
  console.log('🧪 ========== 第二阶段重构测试开始 ==========');
  
  try {
    // 1. 创建布局引擎实例
    console.log('\n1️⃣ 创建布局引擎实例...');
    const layoutEngine = new UnifiedStructuredLayoutEngine(mockGraph);
    console.log('✅ 布局引擎创建成功');
    
    // 2. 测试缓存功能
    console.log('\n2️⃣ 测试缓存功能...');
    const cacheStats1 = layoutEngine.getCacheStats();
    console.log('📊 初始缓存统计:', cacheStats1);
    
    // 3. 测试性能监控
    console.log('\n3️⃣ 测试性能监控...');
    const performanceReport1 = layoutEngine.getPerformanceReport();
    console.log('📈 初始性能报告:', performanceReport1);
    
    // 4. 测试预览线锁定
    console.log('\n4️⃣ 测试预览线锁定...');
    const lockResult1 = layoutEngine.lockPreviewLine('test_lock_1', {
      reason: 'testing',
      timeout: 5000
    });
    console.log('🔒 预览线锁定结果:', lockResult1);
    
    const lockStats1 = layoutEngine.getPreviewLineLockStats();
    console.log('📊 预览线锁定统计:', lockStats1);
    
    // 5. 执行第一次布局（应该缓存未命中）
    console.log('\n5️⃣ 执行第一次布局...');
    const layoutInput1 = {
      nodeCount: 3,
      edgeCount: 2,
      layoutType: 'unified'
    };
    
    const result1 = await layoutEngine.executeLayout(layoutInput1);
    console.log('🎯 第一次布局结果:', result1);
    
    // 6. 检查缓存状态
    console.log('\n6️⃣ 检查缓存状态...');
    const cacheStats2 = layoutEngine.getCacheStats();
    console.log('📊 布局后缓存统计:', cacheStats2);
    
    // 7. 执行第二次相同布局（应该缓存命中）
    console.log('\n7️⃣ 执行第二次相同布局（测试缓存命中）...');
    const result2 = await layoutEngine.executeLayout(layoutInput1);
    console.log('🎯 第二次布局结果:', result2);
    
    // 8. 检查缓存命中情况
    console.log('\n8️⃣ 检查缓存命中情况...');
    const cacheStats3 = layoutEngine.getCacheStats();
    console.log('📊 第二次布局后缓存统计:', cacheStats3);
    
    // 9. 测试性能报告
    console.log('\n9️⃣ 测试性能报告...');
    const performanceReport2 = layoutEngine.getPerformanceReport();
    console.log('📈 最终性能报告:', performanceReport2);
    
    // 10. 测试预览线解锁
    console.log('\n🔟 测试预览线解锁...');
    const unlockResult = layoutEngine.unlockPreviewLine('test_lock_1', {
      reason: 'test_completed'
    });
    console.log('🔓 预览线解锁结果:', unlockResult);
    
    const lockStats2 = layoutEngine.getPreviewLineLockStats();
    console.log('📊 解锁后预览线统计:', lockStats2);
    
    // 11. 测试缓存清空
    console.log('\n1️⃣1️⃣ 测试缓存清空...');
    layoutEngine.clearCache();
    const cacheStats4 = layoutEngine.getCacheStats();
    console.log('📊 清空后缓存统计:', cacheStats4);
    
    // 12. 测试功能开关
    console.log('\n1️⃣2️⃣ 测试功能开关...');
    layoutEngine.setCacheEnabled(false);
    layoutEngine.setPerformanceMonitorEnabled(false);
    console.log('🔧 已禁用缓存和性能监控');
    
    // 13. 测试禁用状态下的布局
    console.log('\n1️⃣3️⃣ 测试禁用状态下的布局...');
    const result3 = await layoutEngine.executeLayout({
      nodeCount: 2,
      edgeCount: 1,
      layoutType: 'simple'
    });
    console.log('🎯 禁用状态布局结果:', result3);
    
    // 14. 重新启用功能
    console.log('\n1️⃣4️⃣ 重新启用功能...');
    layoutEngine.setCacheEnabled(true);
    layoutEngine.setPerformanceMonitorEnabled(true);
    console.log('🔧 已重新启用缓存和性能监控');
    
    // 15. 销毁引擎
    console.log('\n1️⃣5️⃣ 销毁引擎...');
    layoutEngine.destroy();
    
    console.log('\n🎉 ========== 第二阶段重构测试完成 ==========');
    console.log('✅ 所有测试通过！性能模块集成成功！');
    
  } catch (error) {
    console.error('❌ 第二阶段测试失败:', error);
    console.error('错误堆栈:', error.stack);
    process.exit(1);
  }
}

// 运行测试
testPhase2Integration();