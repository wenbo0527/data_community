// Y坐标调试脚本
console.log('🧪 开始Y坐标调试测试');

// 模拟calculateLayerY方法
function testCalculateLayerY(layerIndex) {
  const baseY = 100;
  const layerSpacing = 150;
  
  console.log(`🔍 测试输入: layerIndex=${layerIndex}, type=${typeof layerIndex}`);
  
  // 验证输入参数
  if (typeof layerIndex !== 'number') {
    console.error(`❌ layerIndex不是数字: ${layerIndex}`);
    return NaN;
  }
  
  if (isNaN(layerIndex)) {
    console.error(`❌ layerIndex是NaN: ${layerIndex}`);
    return NaN;
  }
  
  if (!Number.isFinite(layerIndex)) {
    console.error(`❌ layerIndex不是有限数: ${layerIndex}`);
    return NaN;
  }
  
  const result = baseY + (layerIndex * layerSpacing);
  console.log(`✅ 计算结果: ${baseY} + (${layerIndex} * ${layerSpacing}) = ${result}`);
  
  return result;
}

// 测试各种情况
console.log('\n=== 正常情况测试 ===');
testCalculateLayerY(0);  // 应该返回100
testCalculateLayerY(1);  // 应该返回250
testCalculateLayerY(2);  // 应该返回400

console.log('\n=== 异常情况测试 ===');
testCalculateLayerY(undefined);  // 应该返回NaN
testCalculateLayerY(null);       // 应该返回NaN
testCalculateLayerY(NaN);        // 应该返回NaN
testCalculateLayerY('0');        // 应该返回NaN
testCalculateLayerY({});         // 应该返回NaN

console.log('\n=== 模拟实际调用场景 ===');
// 模拟buildTypeBasedLayers的调用场景
const mockLayers = [
  [{ id: 'start-node', type: 'start' }],
  [{ id: 'node_1756881179035', type: 'audience-split' }]
];

mockLayers.forEach((layer, layerIndex) => {
  console.log(`\n第${layerIndex}层:`);
  const y = testCalculateLayerY(layerIndex);
  layer.forEach(node => {
    console.log(`  节点 ${node.id}: Y坐标应该是 ${y}`);
  });
});

console.log('\n🧪 Y坐标调试测试完成');