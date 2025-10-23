// 直接测试 hasPreviewLine 方法，绕过可能的问题

import { PreviewLineSystem } from './src/utils/preview-line/index.js';

async function directTest() {
  console.log('🧪 直接测试 hasPreviewLine 方法');
  
  try {
    // 创建模拟的 graph 对象
    const mockGraph = {
      addEdge: () => ({ id: 'test-edge-456' }),
      removeEdge: () => true,
      getEdges: () => [],
      getCellById: () => null
    };

    // 初始化系统
    const system = new PreviewLineSystem({ graph: mockGraph });
    await system.init();
    
    console.log('✅ 系统初始化成功');
    console.log('🔍 系统初始化状态:', system.initialized);
    console.log('🔍 系统销毁状态:', system.destroyed);
    
    // 直接访问 Map 并添加一个测试项
    const map = system.stateManager.state.previewLines;
    const testId = 'direct-test-line';
    const testLine = { id: testId, sourceNodeId: 'test-node', type: 'test' };
    
    console.log('🔄 直接向 Map 添加测试数据...');
    map.set(testId, testLine);
    
    console.log('📊 Map 状态检查:');
    console.log('  - Map size:', map.size);
    console.log('  - Has key:', map.has(testId));
    console.log('  - Get value:', map.get(testId) ? 'exists' : 'null');
    
    // 手动实现 hasPreviewLine 逻辑，不调用 checkInitialized
    console.log('🔍 手动实现 hasPreviewLine 逻辑...');
    const previewLinesMap = system.stateManager.state.previewLines;
    const hasKey = previewLinesMap.has(testId);
    const value = previewLinesMap.get(testId);
    const result = hasKey && value != null;
    
    console.log('📋 手动实现结果:', {
      hasKey,
      value: value ? 'exists' : 'null',
      result
    });
    
    // 现在尝试调用原始的 hasPreviewLine 方法
    console.log('🔍 调用原始 hasPreviewLine 方法...');
    
    // 先检查 checkInitialized 方法
    console.log('🔍 测试 checkInitialized 方法...');
    try {
      system.checkInitialized();
      console.log('✅ checkInitialized 通过');
    } catch (error) {
      console.error('❌ checkInitialized 失败:', error.message);
    }
    
    try {
      const originalResult = system.hasPreviewLine(testId);
      console.log('📋 原始方法结果:', originalResult);
    } catch (error) {
      console.error('❌ 原始方法调用失败:', error.message);
      console.error('❌ 错误堆栈:', error.stack);
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    console.error('❌ 错误堆栈:', error.stack);
  }
}

directTest();