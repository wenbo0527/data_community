// 详细的NaN问题调试脚本
console.log('🔍 开始详细的NaN问题调试...');

// 检查layoutEngine是否存在
if (typeof window.layoutEngine === 'undefined') {
  console.error('❌ window.layoutEngine 不存在');
} else {
  console.log('✅ window.layoutEngine 存在');
  
  // 检查testYCoordinateCalculation方法
  if (typeof window.layoutEngine.testYCoordinateCalculation === 'function') {
    console.log('✅ testYCoordinateCalculation 方法存在');
    try {
      console.log('🧪 执行 testYCoordinateCalculation...');
      const result = window.layoutEngine.testYCoordinateCalculation();
      console.log('🧪 testYCoordinateCalculation 结果:', result);
    } catch (error) {
      console.error('❌ testYCoordinateCalculation 执行失败:', error);
    }
  } else {
    console.warn('⚠️ testYCoordinateCalculation 方法不存在');
  }
  
  // 检查calculateLayerY方法
  if (typeof window.layoutEngine.calculateLayerY === 'function') {
    console.log('✅ calculateLayerY 方法存在');
    try {
      console.log('🧪 测试 calculateLayerY(0)...');
      const y0 = window.layoutEngine.calculateLayerY(0);
      console.log('🧪 calculateLayerY(0) 结果:', y0, '是否为NaN:', isNaN(y0));
      
      console.log('🧪 测试 calculateLayerY(1)...');
      const y1 = window.layoutEngine.calculateLayerY(1);
      console.log('🧪 calculateLayerY(1) 结果:', y1, '是否为NaN:', isNaN(y1));
      
      console.log('🧪 测试 calculateLayerY(2)...');
      const y2 = window.layoutEngine.calculateLayerY(2);
      console.log('🧪 calculateLayerY(2) 结果:', y2, '是否为NaN:', isNaN(y2));
    } catch (error) {
      console.error('❌ calculateLayerY 测试失败:', error);
    }
  } else {
    console.warn('⚠️ calculateLayerY 方法不存在');
  }
}

// 检查当前图形中的节点
if (typeof window.graph !== 'undefined' && window.graph.getNodes) {
  console.log('✅ window.graph 存在');
  const nodes = window.graph.getNodes();
  console.log(`📊 当前图形中有 ${nodes.length} 个节点`);
  
  // 检查前5个节点的位置
  nodes.slice(0, 5).forEach((node, index) => {
    const position = node.getPosition();
    const nodeId = node.id;
    console.log(`📍 节点 ${index + 1} (${nodeId}): 位置(${position.x}, ${position.y}), X是否为NaN: ${isNaN(position.x)}, Y是否为NaN: ${isNaN(position.y)}`);
  });
  
  // 检查连接线
  if (window.graph.getEdges) {
    const edges = window.graph.getEdges();
    console.log(`🔗 当前图形中有 ${edges.length} 条连接线`);
    
    edges.slice(0, 3).forEach((edge, index) => {
      const source = edge.getSource();
      const target = edge.getTarget();
      console.log(`🔗 连接线 ${index + 1}: 起点(${source.cell}, ${source.port}) → 终点(${target.cell}, ${target.port})`);
      
      // 检查连接点位置
      const sourceNode = window.graph.getCellById(source.cell);
      const targetNode = window.graph.getCellById(target.cell);
      if (sourceNode && targetNode) {
        const sourcePos = sourceNode.getPosition();
        const targetPos = targetNode.getPosition();
        console.log(`🔗 连接线 ${index + 1} 位置: 起点(${sourcePos.x}, ${sourcePos.y}) → 终点(${targetPos.x}, ${targetPos.y})`);
        console.log(`🔗 连接线 ${index + 1} NaN检查: 起点Y是否为NaN: ${isNaN(sourcePos.y)}, 终点Y是否为NaN: ${isNaN(targetPos.y)}`);
      }
    });
  }
} else {
  console.warn('⚠️ window.graph 不存在或没有getNodes方法');
}

console.log('🔍 详细NaN问题调试完成');