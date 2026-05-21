// Y坐标计算修复验证脚本

// 测试节点列表
const testNodes = [
  'start-node',
  'node_1756889028549', // audience-split
  'node_1756349534104', // manual-call
  'node_1756349538148'  // ai-call
];

console.log('🔍 开始Y坐标计算修复验证...');

// 获取布局引擎实例
const layoutEngine = window.unifiedStructuredLayoutEngine;
if (!layoutEngine) {
  console.error('❌ 布局引擎不可用');
} else {
  console.log('✅ 布局引擎已找到');
  
  // 测试每个节点的层级索引计算
  testNodes.forEach(nodeId => {
    console.log(`\n🔍 测试节点: ${nodeId}`);
    
    try {
      // 1. 测试层级索引计算
      const layerIndex = layoutEngine.getSimpleLayerIndex(nodeId);
      console.log(`  层级索引: ${layerIndex} (类型: ${typeof layerIndex})`);
      
      // 2. 验证层级索引有效性
      if (typeof layerIndex !== 'number' || isNaN(layerIndex) || layerIndex < 0) {
        console.error(`  ❌ 无效的层级索引: ${layerIndex}`);
      } else {
        console.log(`  ✅ 层级索引有效: ${layerIndex}`);
        
        // 3. 测试Y坐标计算
        const yCoordinate = layoutEngine.calculateLayerY(layerIndex);
        console.log(`  Y坐标: ${yCoordinate} (类型: ${typeof yCoordinate})`);
        
        // 4. 验证Y坐标有效性
        if (typeof yCoordinate !== 'number' || isNaN(yCoordinate)) {
          console.error(`  ❌ 无效的Y坐标: ${yCoordinate}`);
        } else {
          console.log(`  ✅ Y坐标有效: ${yCoordinate}`);
          
          // 5. 检查节点实际位置
          const graphNode = layoutEngine.graph.getCellById(nodeId);
          if (graphNode) {
            const actualPosition = graphNode.getPosition();
            const size = graphNode.getSize();
            const actualCenterY = actualPosition.y + size.height / 2;
            
            console.log(`  实际位置: (${actualPosition.x.toFixed(1)}, ${actualPosition.y.toFixed(1)})`);
            console.log(`  实际中心Y: ${actualCenterY.toFixed(1)}`);
            console.log(`  期望中心Y: ${yCoordinate}`);
            
            const yDifference = Math.abs(actualCenterY - yCoordinate);
            if (yDifference > 1) {
              console.error(`  ❌ Y坐标不匹配，差异: ${yDifference.toFixed(1)}px`);
            } else {
              console.log(`  ✅ Y坐标匹配，差异: ${yDifference.toFixed(1)}px`);
            }
          } else {
            console.warn(`  ⚠️ 图形节点不存在: ${nodeId}`);
          }
        }
      }
    } catch (error) {
      console.error(`  ❌ 测试失败:`, error.message);
    }
  });
  
  console.log('\n🔍 Y坐标计算修复验证完成');
}

// 额外测试：直接调用calculateLayerY方法
console.log('\n🔍 直接测试calculateLayerY方法:');
for (let i = 0; i <= 4; i++) {
  try {
    const y = layoutEngine ? layoutEngine.calculateLayerY(i) : 'N/A';
    console.log(`  层级${i} -> Y坐标: ${y}`);
  } catch (error) {
    console.error(`  层级${i} -> 错误:`, error.message);
  }
}

// 测试边界情况
console.log('\n🔍 测试边界情况:');
const edgeCases = [NaN, -1, 'invalid', null, undefined, Infinity];
edgeCases.forEach(testValue => {
  try {
    const y = layoutEngine ? layoutEngine.calculateLayerY(testValue) : 'N/A';
    console.log(`  输入: ${testValue} -> Y坐标: ${y}`);
  } catch (error) {
    console.error(`  输入: ${testValue} -> 错误:`, error.message);
  }
});

console.log('\n✅ 所有测试完成');