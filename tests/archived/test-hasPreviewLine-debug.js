// 测试 hasPreviewLine 方法的调试脚本

import { PreviewLineSystem } from './src/utils/preview-line/index.js';

async function testHasPreviewLine() {
  console.log('🧪 开始测试 hasPreviewLine 方法');
  
  try {
    // 创建模拟的 graph 对象
    const mockGraph = {
      addEdge: () => ({ id: 'mock-edge' }),
      removeEdge: () => true,
      getEdges: () => [],
      getCellById: () => null
    };

    // 初始化系统
    const system = new PreviewLineSystem({ graph: mockGraph });
    await system.init();
    
    console.log('✅ PreviewLineSystem 初始化成功');
    
    // 创建一个模拟的源节点
    const mockSourceNode = {
      id: 'test-node',
      getData: () => ({ type: 'start', nodeType: 'start' }),
      getPosition: () => ({ x: 100, y: 100 }),
      getSize: () => ({ width: 80, height: 40 })
    };
    
    const config = {
      targetPosition: { x: 100, y: 100 },
      style: { strokeColor: '#1890ff' }
    };
    
    console.log('🔄 创建测试预览线...');
    const previewLine = await system.createPreviewLine(mockSourceNode, config);
    console.log('✅ 预览线创建成功:', previewLine.id);
    
    // 直接测试 hasPreviewLine
    console.log('🔍 直接调用 hasPreviewLine...');
    const hasLine = system.hasPreviewLine(previewLine.id);
    console.log('📋 hasPreviewLine 结果:', hasLine);
    
    // 检查 Map 状态
    const map = system.stateManager.state.previewLines;
    console.log('🗺️ Map 状态:', {
      size: map.size,
      hasKey: map.has(previewLine.id),
      value: map.get(previewLine.id) ? 'exists' : 'null',
      allKeys: Array.from(map.keys())
    });
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

testHasPreviewLine();