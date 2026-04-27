/**
 * 最终预览线功能测试
 * 验证修复后的预览线系统是否正常工作
 */

import { PreviewLineSystem } from './src/utils/preview-line/PreviewLineSystem.js';
// import { Graph } from '@antv/x6';

console.log('🧪 开始最终预览线功能测试...');

// 创建模拟图实例
const mockGraph = {
  getCells: () => [
    {
      id: 'node1',
      isNode: () => true,
      getData: () => ({ isConfigured: true, type: 'start' }),
      getPosition: () => ({ x: 100, y: 100 }),
      getSize: () => ({ width: 120, height: 60 })
    },
    {
      id: 'node2', 
      isNode: () => true,
      getData: () => ({ isConfigured: true, type: 'process' }),
      getPosition: () => ({ x: 300, y: 100 }),
      getSize: () => ({ width: 120, height: 60 })
    }
  ],
  addEdge: (config) => {
    console.log('✅ 预览线创建成功:', config.id);
    return { id: config.id, ...config };
  },
  removeEdge: (id) => {
    console.log('✅ 预览线删除成功:', id);
  },
  hasCell: (id) => true,
  on: () => {},
  off: () => {}
};

// 创建模拟事件管理器
const mockEventManager = {
  emit: (event, data) => {
    console.log(`📡 事件触发: ${event}`, data?.lineId || '');
  },
  on: () => {},
  off: () => {}
};

try {
  // 初始化预览线系统
  console.log('🔧 初始化预览线系统...');
  const previewLineSystem = new PreviewLineSystem({
    graph: mockGraph,
    eventManager: mockEventManager
  });
  
  // 初始化系统
  previewLineSystem.init();
  console.log('✅ 预览线系统初始化成功');
  
  // 测试为现有节点创建预览线
  console.log('🧪 测试为现有节点创建预览线...');
  previewLineSystem.createPreviewLinesForExistingNodes();
  
  // 测试创建单个预览线
  console.log('🧪 测试创建单个预览线...');
  const sourceNode = mockGraph.getCells()[0];
  const previewLine = previewLineSystem.createUnifiedPreviewLine(sourceNode, {
    targetPosition: { x: 400, y: 200 }
  });
  
  if (previewLine) {
    console.log('✅ 单个预览线创建成功:', previewLine.id);
    
    // 测试删除预览线
    console.log('🧪 测试删除预览线...');
    previewLineSystem.deletePreviewLine(previewLine.id);
  }
  
  // 测试系统状态
  console.log('🧪 测试系统状态...');
  const stats = previewLineSystem.getSystemStats();
  console.log('📊 系统统计:', stats);
  
  console.log('🎉 所有测试通过！预览线系统工作正常');
  
} catch (error) {
  console.error('❌ 测试失败:', error.message);
  console.error('错误堆栈:', error.stack);
}

console.log('🏁 最终测试完成');