// 简单测试 hasPreviewLine 方法

import { PreviewLineSystem } from './src/utils/preview-line/index.js';

async function simpleTest() {
  console.log('🧪 简单测试 hasPreviewLine 方法');
  
  try {
    // 创建模拟的 graph 对象
    const mockGraph = {
      addEdge: () => ({ id: 'test-edge-123' }),
      removeEdge: () => true,
      getEdges: () => [],
      getCellById: () => null
    };

    // 初始化系统
    const system = new PreviewLineSystem({ graph: mockGraph });
    await system.init();
    
    console.log('✅ 系统初始化成功');
    
    // 直接访问 Map 并添加一个测试项
    const map = system.stateManager.state.previewLines;
    const testId = 'test-line-123';
    const testLine = { id: testId, sourceNodeId: 'test-node', type: 'test' };
    
    console.log('🔄 直接向 Map 添加测试数据...');
    map.set(testId, testLine);
    
    console.log('📊 Map 状态检查:');
    console.log('  - Map size:', map.size);
    console.log('  - Has key:', map.has(testId));
    console.log('  - Get value:', map.get(testId) ? 'exists' : 'null');
    
    console.log('🔍 调用 hasPreviewLine 方法...');
    
    // 添加超时保护
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('hasPreviewLine 方法超时')), 5000);
    });
    
    const hasLinePromise = new Promise((resolve) => {
      try {
        const result = system.hasPreviewLine(testId);
        resolve(result);
      } catch (error) {
        resolve(`Error: ${error.message}`);
      }
    });
    
    const result = await Promise.race([hasLinePromise, timeoutPromise]);
    console.log('📋 hasPreviewLine 结果:', result);
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

simpleTest();