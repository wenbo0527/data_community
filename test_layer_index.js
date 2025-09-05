// Y坐标NaN问题专项调试测试
console.log('🧪 开始layerIndex传递调试测试');

// 模拟calculateBottomUpPositions中的for循环
function testLayerIndexGeneration() {
  console.log('\n=== 测试layerIndex生成 ===');
  
  // 模拟layers数组
  const mockLayers = [
    [{ id: 'start-node', type: 'start' }],
    [{ id: 'node_1756881179035', type: 'audience-split' }],
    [{ id: 'end-node', type: 'end' }]
  ];
  
  console.log('🔍 模拟layers数组:', mockLayers.map((layer, idx) => ({
    index: idx,
    nodes: layer.map(n => n.id)
  })));
  
  // 模拟for循环中的layerIndex生成
  for (let layerIndex = 0; layerIndex < mockLayers.length; layerIndex++) {
    const layer = mockLayers[layerIndex];
    const isTopLayer = layerIndex === 0;
    
    console.log(`\n🔍 处理第${layerIndex}层:`, {
      layerIndex,
      layerIndexType: typeof layerIndex,
      isNumber: typeof layerIndex === 'number',
      isNaN: isNaN(layerIndex),
      isFinite: Number.isFinite(layerIndex),
      isTopLayer,
      layerLength: layer.length,
      nodes: layer.map(n => n.id)
    });
    
    // 模拟calculateLayerY调用
    const result = mockCalculateLayerY(layerIndex);
    console.log(`✅ calculateLayerY(${layerIndex}) = ${result}`);
  }
}

// 模拟calculateLayerY方法
function mockCalculateLayerY(layerIndex) {
  const baseY = 100;
  const layerSpacing = 150;
  
  console.log(`🔍 [Y坐标计算] 输入参数详情:`, {
    layerIndex,
    type: typeof layerIndex,
    isNumber: typeof layerIndex === 'number',
    isNaN: isNaN(layerIndex),
    isNegative: layerIndex < 0
  });
  
  // 严格验证
  let validLayerIndex = layerIndex;
  
  if (typeof layerIndex !== 'number') {
    console.error(`❌ layerIndex不是数字类型: ${layerIndex} (type: ${typeof layerIndex})`);
    validLayerIndex = 0;
  } else if (isNaN(layerIndex)) {
    console.error(`❌ layerIndex是NaN: ${layerIndex}`);
    validLayerIndex = 0;
  } else if (layerIndex < 0) {
    console.error(`❌ layerIndex是负数: ${layerIndex}`);
    validLayerIndex = 0;
  } else if (!Number.isFinite(layerIndex)) {
    console.error(`❌ layerIndex不是有限数: ${layerIndex}`);
    validLayerIndex = 0;
  }
  
  const result = baseY + (validLayerIndex * layerSpacing);
  
  if (!Number.isFinite(result) || isNaN(result)) {
    console.error(`❌ 计算结果无效!`, {
      baseY,
      validLayerIndex,
      layerSpacing,
      calculation: `${baseY} + (${validLayerIndex} * ${layerSpacing})`,
      result,
      isFinite: Number.isFinite(result),
      isNaN: isNaN(result)
    });
    return 100;
  }
  
  console.log(`🎯 layerIndex=${validLayerIndex} -> Y=${result}`);
  return result;
}

// 测试异常情况
function testAbnormalCases() {
  console.log('\n=== 测试异常情况 ===');
  
  const testCases = [
    { name: 'undefined', value: undefined },
    { name: 'null', value: null },
    { name: 'NaN', value: NaN },
    { name: '字符串"0"', value: '0' },
    { name: '字符串"1"', value: '1' },
    { name: '负数', value: -1 },
    { name: 'Infinity', value: Infinity },
    { name: '对象', value: {} },
    { name: '数组', value: [] }
  ];
  
  testCases.forEach(testCase => {
    console.log(`\n🔍 测试 ${testCase.name}:`);
    const result = mockCalculateLayerY(testCase.value);
    console.log(`结果: ${result}`);
  });
}

// 运行测试
testLayerIndexGeneration();
testAbnormalCases();

console.log('\n🧪 layerIndex传递调试测试完成');