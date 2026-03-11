// 简单的Y坐标测试脚本
const { UnifiedStructuredLayoutEngine } = require('./src/utils/UnifiedStructuredLayoutEngine.js');

// 创建一个简单的测试图对象
const mockGraph = {
  getNodes: () => [],
  getEdges: () => []
};

// 创建布局引擎实例
const layoutEngine = new UnifiedStructuredLayoutEngine(mockGraph);

console.log('🔍 开始Y坐标计算测试');

// 测试不同的layerIndex值
const testCases = [
  { layerIndex: 0, expected: 100 },
  { layerIndex: 1, expected: 250 },
  { layerIndex: 2, expected: 400 },
  { layerIndex: 3, expected: 550 }
];

testCases.forEach(({ layerIndex, expected }) => {
  const result = layoutEngine.calculateLayerY(layerIndex);
  const isValid = !isNaN(result) && Number.isFinite(result);
  const isCorrect = result === expected;
  
  console.log(`测试 layerIndex=${layerIndex}:`);
  console.log(`  期望值: ${expected}`);
  console.log(`  实际值: ${result}`);
  console.log(`  是否有效: ${isValid}`);
  console.log(`  是否正确: ${isCorrect}`);
  console.log(`  状态: ${isValid && isCorrect ? '✅ 通过' : '❌ 失败'}`);
  console.log('---');
});

// 测试异常情况
const errorTestCases = [
  { layerIndex: NaN, description: 'NaN输入' },
  { layerIndex: undefined, description: 'undefined输入' },
  { layerIndex: null, description: 'null输入' },
  { layerIndex: 'string', description: '字符串输入' },
  { layerIndex: -1, description: '负数输入' },
  { layerIndex: Infinity, description: '无穷大输入' }
];

console.log('\n🔍 异常情况测试:');
errorTestCases.forEach(({ layerIndex, description }) => {
  const result = layoutEngine.calculateLayerY(layerIndex);
  const isValid = !isNaN(result) && Number.isFinite(result);
  
  console.log(`${description}: layerIndex=${layerIndex} -> result=${result}, 有效=${isValid}`);
});

console.log('\n🔍 Y坐标计算测试完成');