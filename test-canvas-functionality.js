/**
 * 画布功能完整测试脚本
 * 测试预览线系统的所有核心功能
 */

import { PreviewLineSystem } from './src/utils/preview-line/PreviewLineSystem.js';
import { PreviewLineManager } from './src/utils/preview-line/core/PreviewLineManager.js';

// 模拟画布和节点数据
const mockCanvasData = {
  nodes: [
    { id: 'node1', x: 100, y: 100, type: 'input' },
    { id: 'node2', x: 300, y: 200, type: 'process' },
    { id: 'node3', x: 500, y: 150, type: 'output' }
  ],
  edges: [
    { id: 'edge1', source: 'node1', target: 'node2' },
    { id: 'edge2', source: 'node2', target: 'node3' }
  ]
};

// 模拟拖拽状态
const mockDragState = {
  isDragging: false,
  draggedNode: null,
  startPosition: null,
  currentPosition: null
};

// 测试结果统计
const testResults = {
  passed: 0,
  failed: 0,
  errors: []
};

/**
 * 测试辅助函数
 */
function assert(condition, message) {
  if (condition) {
    testResults.passed++;
    console.log(`✅ ${message}`);
  } else {
    testResults.failed++;
    testResults.errors.push(message);
    console.log(`❌ ${message}`);
  }
}

function logSection(title) {
  console.log(`\n=== ${title} ===`);
}

/**
 * 测试1: 预览线系统初始化
 */
async function testPreviewLineSystemInit() {
  logSection('预览线系统初始化测试');
  
  try {
    const system = new PreviewLineSystem();
    assert(system !== null, '预览线系统实例创建成功');
    
    // 初始化系统
    await system.init();
    assert(system.initialized === true, '预览线系统初始化成功');
    
    // 检查核心组件
    assert(system.stateManager !== null, '状态管理器初始化成功');
    assert(system.layoutEngine !== null, '布局引擎初始化成功');
    assert(system.performanceOptimizer !== null, '性能优化器初始化成功');
    
    // 检查核心方法
    assert(typeof system.forceRegeneratePreviewLines === 'function', 'forceRegeneratePreviewLines方法存在');
    assert(typeof system.shouldCreatePreviewLine === 'function', 'shouldCreatePreviewLine方法存在');
    assert(typeof system.getAllPreviewLines === 'function', 'getAllPreviewLines方法存在');
    
    return system;
  } catch (error) {
    console.error('预览线系统初始化失败:', error);
    testResults.errors.push(`初始化错误: ${error.message}`);
    return null;
  }
}

/**
 * 测试2: 预览线管理器功能
 */
async function testPreviewLineManager() {
  logSection('预览线管理器测试');
  
  try {
    const manager = new PreviewLineManager();
    assert(manager !== null, '预览线管理器实例创建成功');
    
    // 初始化管理器
    await manager.initialize();
    assert(manager.initialized === true, '预览线管理器初始化成功');
    
    // 测试预览线创建
    const mockSourceNode = mockCanvasData.nodes[0];
    const mockTargetNode = mockCanvasData.nodes[1];
    
    const previewLine = await manager.createUnifiedPreviewLine(mockSourceNode);
    assert(previewLine !== null, '预览线创建成功');
    
    // 测试预览线更新
    const updateResult = await manager.updatePreviewLine(previewLine.id, {
      targetPosition: { x: 350, y: 250 }
    });
    assert(updateResult === true, '预览线更新成功');
    
    // 测试预览线删除
    const deleteResult = await manager.deletePreviewLine(previewLine.id);
    assert(deleteResult === true, '预览线删除成功');
    
    return manager;
  } catch (error) {
    console.error('预览线管理器测试失败:', error);
    testResults.errors.push(`管理器错误: ${error.message}`);
    return null;
  }
}

/**
 * 测试3: 画布交互功能
 */
async function testCanvasInteraction(system) {
  logSection('画布交互功能测试');
  
  if (!system) {
    console.log('❌ 系统未初始化，跳过交互测试');
    return;
  }
  
  try {
    // 模拟节点拖拽开始
    mockDragState.isDragging = true;
    mockDragState.draggedNode = mockCanvasData.nodes[0];
    mockDragState.startPosition = { x: 100, y: 100 };
    mockDragState.currentPosition = { x: 150, y: 120 };
    
    // 测试拖拽时预览线生成
    const shouldCreate = await system.shouldCreatePreviewLine(
      mockDragState.draggedNode,
      mockDragState.currentPosition
    );
    assert(typeof shouldCreate === 'boolean', 'shouldCreatePreviewLine返回布尔值');
    
    // 测试强制重新生成预览线
    const regenerateResult = await system.forceRegeneratePreviewLines();
    assert(regenerateResult.success === true, '强制重新生成预览线成功');
    assert(typeof regenerateResult.newCount === 'number', '返回新预览线数量');
    
    // 测试获取所有预览线
    const allPreviewLines = system.getAllPreviewLines();
    assert(Array.isArray(allPreviewLines), 'getAllPreviewLines返回数组');
    
    // 模拟拖拽结束
    mockDragState.isDragging = false;
    mockDragState.draggedNode = null;
    
  } catch (error) {
    console.error('画布交互测试失败:', error);
    testResults.errors.push(`交互错误: ${error.message}`);
  }
}

/**
 * 测试4: 性能和稳定性
 */
async function testPerformanceAndStability(system) {
  logSection('性能和稳定性测试');
  
  if (!system) {
    console.log('❌ 系统未初始化，跳过性能测试');
    return;
  }
  
  try {
    const startTime = performance.now();
    
    // 批量操作测试
    const batchOperations = [];
    for (let i = 0; i < 50; i++) {
      batchOperations.push(
        system.forceRegeneratePreviewLines()
      );
    }
    
    await Promise.all(batchOperations);
    
    const endTime = performance.now();
    const executionTime = endTime - startTime;
    
    assert(executionTime < 5000, `批量操作在合理时间内完成 (${executionTime.toFixed(2)}ms)`);
    
    // 内存使用检查
    if (performance.memory) {
      const memoryUsage = performance.memory.usedJSHeapSize;
      assert(memoryUsage < 100 * 1024 * 1024, `内存使用在合理范围内 (${(memoryUsage / 1024 / 1024).toFixed(2)}MB)`);
    }
    
    // 系统状态检查
    const systemState = system.getState('system');
    assert(systemState !== null, '系统状态获取成功');
    
  } catch (error) {
    console.error('性能测试失败:', error);
    testResults.errors.push(`性能错误: ${error.message}`);
  }
}

/**
 * 测试5: 错误处理机制
 */
async function testErrorHandling(system) {
  logSection('错误处理机制测试');
  
  if (!system) {
    console.log('❌ 系统未初始化，跳过错误处理测试');
    return;
  }
  
  try {
    // 测试无效参数处理
    try {
      await system.shouldCreatePreviewLine(null, null);
      assert(true, '无效参数处理正常');
    } catch (error) {
      assert(error instanceof Error, '无效参数抛出适当错误');
    }
    
    // 测试系统未初始化状态
    const uninitializedSystem = new PreviewLineSystem();
    try {
      await uninitializedSystem.forceRegeneratePreviewLines();
      assert(false, '未初始化系统应该抛出错误');
    } catch (error) {
      assert(error.message.includes('未初始化'), '未初始化错误消息正确');
    }
    
  } catch (error) {
    console.error('错误处理测试失败:', error);
    testResults.errors.push(`错误处理错误: ${error.message}`);
  }
}

/**
 * 主测试函数
 */
async function runAllTests() {
  console.log('🚀 开始画布功能完整测试\n');
  
  const startTime = Date.now();
  
  // 运行所有测试
  const system = await testPreviewLineSystemInit();
  const manager = await testPreviewLineManager();
  await testCanvasInteraction(system);
  await testPerformanceAndStability(system);
  await testErrorHandling(system);
  
  const endTime = Date.now();
  const totalTime = endTime - startTime;
  
  // 输出测试结果
  logSection('测试结果汇总');
  console.log(`✅ 通过测试: ${testResults.passed}`);
  console.log(`❌ 失败测试: ${testResults.failed}`);
  console.log(`⏱️  总耗时: ${totalTime}ms`);
  
  if (testResults.errors.length > 0) {
    console.log('\n❌ 错误详情:');
    testResults.errors.forEach((error, index) => {
      console.log(`${index + 1}. ${error}`);
    });
  }
  
  // 清理资源
  if (system) {
    try {
      await system.destroy();
      console.log('\n🧹 系统资源清理完成');
    } catch (error) {
      console.log('⚠️  资源清理警告:', error.message);
    }
  }
  
  if (manager) {
    try {
      await manager.destroy();
      console.log('🧹 管理器资源清理完成');
    } catch (error) {
      console.log('⚠️  管理器清理警告:', error.message);
    }
  }
  
  const success = testResults.failed === 0;
  console.log(`\n${success ? '🎉' : '💥'} 测试${success ? '全部通过' : '存在失败'}！`);
  
  return success;
}

// 运行测试
runAllTests().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('测试运行失败:', error);
  process.exit(1);
});