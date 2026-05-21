/**
 * 测试统一布局引擎的基本功能
 */

import { UnifiedStructuredLayoutEngine } from './src/pages/marketing/tasks/utils/canvas/UnifiedStructuredLayoutEngine.js';

// 模拟图对象
const mockGraph = {
  getNodes: () => [
    { id: 'start-1', getId: () => 'start-1' },
    { id: 'node-1', getId: () => 'node-1' },
    { id: 'node-2', getId: () => 'node-2' },
    { id: 'end-1', getId: () => 'end-1' }
  ],
  getEdges: () => [
    { id: 'edge-1', source: 'start-1', target: 'node-1' },
    { id: 'edge-2', source: 'node-1', target: 'node-2' },
    { id: 'edge-3', source: 'node-2', target: 'end-1' }
  ],
  getCellById: (id) => ({
    setPosition: (x, y) => console.log(`设置节点 ${id} 位置: (${x}, ${y})`)
  })
};

// 测试布局引擎
async function testLayoutEngine() {
  console.log('🧪 开始测试统一布局引擎...');
  
  try {
    // 创建布局引擎实例
    const layoutEngine = new UnifiedStructuredLayoutEngine(mockGraph, {
      performance: {
        enableOptimization: true,
        enableCaching: true
      }
    });
    
    console.log('✅ 布局引擎实例创建成功');
    
    // 执行布局
    const result = await layoutEngine.executeLayout();
    
    console.log('📊 布局执行结果:', result);
    
    // 获取性能报告
    const performanceReport = layoutEngine.getPerformanceReport();
    console.log('📈 性能报告:', performanceReport);
    
    // 测试预览线锁定功能
    layoutEngine.lockPreviewLineRefresh('测试锁定');
    console.log('🔒 预览线锁定状态:', layoutEngine.getPreviewLineLockStatus());
    
    layoutEngine.unlockPreviewLineRefresh('测试解锁');
    console.log('🔓 预览线解锁状态:', layoutEngine.getPreviewLineLockStatus());
    
    console.log('🎉 所有测试通过！');
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
    throw error;
  }
}

// 运行测试
testLayoutEngine().catch(console.error);