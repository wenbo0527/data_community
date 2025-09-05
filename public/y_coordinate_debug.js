// 浏览器Y坐标调试脚本
console.log('🧪 开始浏览器Y坐标调试');

// 检查layoutEngine是否存在
if (typeof window.layoutEngine === 'undefined') {
  console.error('❌ window.layoutEngine不存在');
} else {
  console.log('✅ window.layoutEngine存在');
  
  // 检查calculateLayerY方法
  if (typeof window.layoutEngine.calculateLayerY === 'function') {
    console.log('✅ calculateLayerY方法存在');
    
    // 测试正常情况
    console.log('\n=== 测试正常情况 ===');
    for (let i = 0; i < 3; i++) {
      try {
        const result = window.layoutEngine.calculateLayerY(i);
        console.log(`✅ calculateLayerY(${i}) = ${result}`);
      } catch (error) {
        console.error(`❌ calculateLayerY(${i}) 出错:`, error);
      }
    }
    
    // 测试异常情况
    console.log('\n=== 测试异常情况 ===');
    const testCases = [
      { name: 'undefined', value: undefined },
      { name: 'null', value: null },
      { name: 'NaN', value: NaN },
      { name: '字符串"0"', value: '0' },
      { name: '负数', value: -1 }
    ];
    
    testCases.forEach(testCase => {
      try {
        const result = window.layoutEngine.calculateLayerY(testCase.value);
        console.log(`🔍 calculateLayerY(${testCase.name}) = ${result}`);
      } catch (error) {
        console.error(`❌ calculateLayerY(${testCase.name}) 出错:`, error);
      }
    });
    
  } else {
    console.error('❌ calculateLayerY方法不存在');
    console.log('可用方法:', Object.getOwnPropertyNames(window.layoutEngine).filter(name => typeof window.layoutEngine[name] === 'function'));
  }
  
  // 检查当前节点的实际位置
  console.log('\n=== 检查当前节点位置 ===');
  if (window.graph && typeof window.graph.getNodes === 'function') {
    const nodes = window.graph.getNodes();
    console.log(`发现 ${nodes.length} 个节点:`);
    
    nodes.forEach(node => {
      const position = node.getPosition();
      const nodeId = node.id;
      console.log(`节点 ${nodeId}: 位置(${position.x}, ${position.y})`);
      
      if (isNaN(position.y)) {
        console.error(`❌ 节点 ${nodeId} 的Y坐标为NaN!`);
      }
    });
  } else {
    console.error('❌ window.graph不存在或getNodes方法不可用');
  }
}

console.log('🧪 浏览器Y坐标调试完成');