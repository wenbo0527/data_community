/**
 * UnifiedEdgeManager 性能优化实施
 * 
 * 针对人工搭建画布场景的性能优化
 * 重点优化单个操作的响应速度和内存使用
 */

import UnifiedEdgeManager from './src/pages/marketing/tasks/composables/canvas/unified/UnifiedEdgeManager.js';

console.log('🚀 开始 UnifiedEdgeManager 性能优化分析...\n');

// 创建模拟图实例
const mockGraph = {
  addEdge: () => ({ id: `edge_${Date.now()}` }),
  removeEdge: () => {},
  getEdges: () => [],
  getNodes: () => [],
  getNode: () => null,
  getCellById: () => null,
  on: () => {},
  off: () => {},
  trigger: () => {},
  toJSON: () => ({ cells: [] }),
  fromJSON: () => {},
  clearCells: () => {},
  addNode: () => {},
  removeNode: () => {}
};

async function performanceAnalysis() {
  try {
    console.log('📊 1. 基准性能测试');
    
    // 创建优化的 UnifiedEdgeManager 实例
    const manager = new UnifiedEdgeManager(mockGraph, {
      autoCleanup: true,
      performanceOptimization: true,
      problemDiagnosis: false, // 在生产环境中关闭诊断以提高性能
      enableConnectionValidation: true,
      enableInPortSnap: true,
      enableBatchOperations: false // 人工搭建不需要批量操作
    });

    await manager.initialize();
    
    // 测试单个操作性能
    console.log('\n📋 测试单个预览线创建性能:');
    const createTimes = [];
    
    for (let i = 0; i < 10; i++) {
      const startTime = performance.now();
      
      try {
        const result = await manager.createPreviewLine(`test-node-${i}`, {
          sourcePort: 'out',
          skipValidation: false // 保持验证以确保正确性
        });
        
        const endTime = performance.now();
        const duration = endTime - startTime;
        createTimes.push(duration);
        
        console.log(`   操作 ${i + 1}: ${duration.toFixed(2)}ms ${result.success ? '✅' : '❌'}`);
        
        // 清理以避免累积影响
        if (result.success && result.previewLineId) {
          await manager.removePreviewLine(result.previewLineId);
        }
      } catch (error) {
        console.log(`   操作 ${i + 1}: 失败 - ${error.message}`);
      }
    }
    
    const avgCreateTime = createTimes.reduce((a, b) => a + b, 0) / createTimes.length;
    console.log(`\n📈 平均创建时间: ${avgCreateTime.toFixed(2)}ms`);
    console.log(`📈 最快创建时间: ${Math.min(...createTimes).toFixed(2)}ms`);
    console.log(`📈 最慢创建时间: ${Math.max(...createTimes).toFixed(2)}ms`);
    
    // 内存使用分析
    console.log('\n📊 2. 内存使用分析');
    const initialMemory = process.memoryUsage();
    console.log(`初始内存使用: ${(initialMemory.heapUsed / 1024 / 1024).toFixed(2)} MB`);
    
    // 执行多个操作来测试内存泄漏
    const operations = [];
    for (let i = 0; i < 50; i++) {
      try {
        const result = await manager.createPreviewLine(`memory-test-${i}`);
        if (result.success) {
          operations.push(result.previewLineId);
        }
      } catch (error) {
        // 忽略预期的错误
      }
    }
    
    const midMemory = process.memoryUsage();
    console.log(`操作后内存使用: ${(midMemory.heapUsed / 1024 / 1024).toFixed(2)} MB`);
    
    // 清理操作
    for (const previewId of operations) {
      try {
        await manager.removePreviewLine(previewId);
      } catch (error) {
        // 忽略清理错误
      }
    }
    
    // 强制垃圾回收（如果可用）
    if (global.gc) {
      global.gc();
    }
    
    const finalMemory = process.memoryUsage();
    console.log(`清理后内存使用: ${(finalMemory.heapUsed / 1024 / 1024).toFixed(2)} MB`);
    
    const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
    console.log(`净内存增长: ${(memoryIncrease / 1024 / 1024).toFixed(2)} MB`);
    
    // 缓存效率测试
    console.log('\n📊 3. 缓存效率测试');
    
    // 第一次操作（冷启动）
    const coldStartTime = performance.now();
    try {
      await manager.createPreviewLine('cache-test-node');
    } catch (error) {
      // 预期错误
    }
    const coldDuration = performance.now() - coldStartTime;
    
    // 第二次相同操作（应该利用缓存）
    const warmStartTime = performance.now();
    try {
      await manager.createPreviewLine('cache-test-node');
    } catch (error) {
      // 预期错误
    }
    const warmDuration = performance.now() - warmStartTime;
    
    console.log(`冷启动时间: ${coldDuration.toFixed(2)}ms`);
    console.log(`热启动时间: ${warmDuration.toFixed(2)}ms`);
    console.log(`缓存效率: ${((coldDuration - warmDuration) / coldDuration * 100).toFixed(1)}% 提升`);
    
    // 统计信息
    console.log('\n📊 4. 系统统计信息');
    const stats = manager.getStats();
    console.log('统计信息:', JSON.stringify(stats, null, 2));
    
    // 性能建议
    console.log('\n💡 5. 性能优化建议');
    
    if (avgCreateTime > 50) {
      console.log('⚠️  单个操作平均时间超过50ms，建议优化:');
      console.log('   - 减少不必要的验证步骤');
      console.log('   - 优化端口配置缓存');
      console.log('   - 简化事件触发机制');
    } else {
      console.log('✅ 单个操作性能良好 (< 50ms)');
    }
    
    if (memoryIncrease > 1024 * 1024) { // 1MB
      console.log('⚠️  内存增长过多，建议:');
      console.log('   - 检查是否存在内存泄漏');
      console.log('   - 优化缓存清理机制');
      console.log('   - 减少不必要的对象创建');
    } else {
      console.log('✅ 内存使用控制良好 (< 1MB 增长)');
    }
    
    if (warmDuration >= coldDuration) {
      console.log('⚠️  缓存机制可能无效，建议:');
      console.log('   - 检查缓存键的生成逻辑');
      console.log('   - 优化缓存存储和检索');
      console.log('   - 确保缓存在适当时机清理');
    } else {
      console.log('✅ 缓存机制工作正常');
    }
    
    // 清理
    manager.destroy();
    console.log('\n🎉 性能分析完成！');
    
  } catch (error) {
    console.error('❌ 性能分析失败:', error.message);
    console.error('Stack:', error.stack);
  }
}

// 运行性能分析
performanceAnalysis();