// Y坐标NaN问题修复验证脚本
console.log('🔍 [Y坐标修复验证] 开始测试');

// 检查layoutEngine是否存在
if (typeof window !== 'undefined' && window.layoutEngine) {
  console.log('✅ [Y坐标修复验证] layoutEngine已可用');
  
  // 测试calculateLayerY方法
  const testCases = [
    { layerIndex: 0, expected: 100 },
    { layerIndex: 1, expected: 250 },
    { layerIndex: 2, expected: 400 },
    { layerIndex: undefined, expected: 100 }, // 应该回退到0
    { layerIndex: null, expected: 100 }, // 应该回退到0
    { layerIndex: NaN, expected: 100 }, // 应该回退到0
    { layerIndex: 'invalid', expected: 100 } // 应该回退到0
  ];
  
  console.log('🧪 [Y坐标修复验证] 开始测试calculateLayerY方法');
  
  testCases.forEach((testCase, index) => {
    try {
      const result = window.layoutEngine.calculateLayerY(testCase.layerIndex);
      const isValid = !isNaN(result) && Number.isFinite(result);
      const isExpected = result === testCase.expected;
      
      console.log(`测试 ${index + 1}: layerIndex=${testCase.layerIndex} -> Y=${result}`, {
        输入: testCase.layerIndex,
        期望: testCase.expected,
        实际: result,
        有效: isValid,
        正确: isExpected,
        状态: isValid && isExpected ? '✅ 通过' : '❌ 失败'
      });
    } catch (error) {
      console.error(`测试 ${index + 1} 异常:`, error);
    }
  });
  
  // 检查当前图表中的节点Y坐标
  console.log('🔍 [Y坐标修复验证] 检查当前图表节点Y坐标');
  
  if (window.layoutEngine.graph) {
    const nodes = window.layoutEngine.graph.getNodes();
    console.log(`发现 ${nodes.length} 个节点`);
    
    nodes.forEach(node => {
      const position = node.getPosition();
      const nodeId = node.id;
      const nodeData = node.getData() || {};
      
      console.log(`节点 ${nodeId} (${nodeData.type || 'unknown'}):`, {
        位置: position,
        X坐标: position.x,
        Y坐标: position.y,
        Y坐标有效: !isNaN(position.y) && Number.isFinite(position.y),
        Y坐标状态: isNaN(position.y) ? '❌ NaN' : '✅ 有效'
      });
    });
  } else {
    console.warn('⚠️ [Y坐标修复验证] graph实例不存在');
  }
  
  // 测试实际的布局计算
  console.log('🧪 [Y坐标修复验证] 测试实际布局计算');
  
  if (typeof window.layoutEngine.testYCoordinateCalculation === 'function') {
    const testNodes = [
      { id: 'start-node', type: 'start' },
      { id: 'node_1756881179035', type: 'audience-split' }
    ];
    
    try {
      const result = window.layoutEngine.testYCoordinateCalculation(testNodes);
      console.log('布局计算测试结果:', result);
    } catch (error) {
      console.error('布局计算测试失败:', error);
    }
  } else {
    console.warn('⚠️ [Y坐标修复验证] testYCoordinateCalculation方法不存在');
  }
  
} else {
  console.error('❌ [Y坐标修复验证] layoutEngine不存在');
}

console.log('🔍 [Y坐标修复验证] 测试完成');