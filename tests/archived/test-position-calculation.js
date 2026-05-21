/**
 * 人群分流节点位置计算测试脚本
 * 专门测试calculateBranchPreviewPosition方法的位置计算逻辑
 */

// 模拟节点和分支数据
const mockNodeData = {
  // 标准人群分流节点
  standardNode: {
    id: 'audience-split-1',
    x: 200,
    y: 150,
    width: 120,
    height: 60,
    data: {
      nodeType: 'audience-split',
      isConfigured: true,
      branches: [
        { id: 'branch-1', label: '高价值用户', type: 'audience' },
        { id: 'branch-2', label: '普通用户', type: 'audience' },
        { id: 'branch-3', label: '未命中人群', type: 'audience', isDefault: true }
      ]
    }
  },
  
  // 大尺寸节点
  largeNode: {
    id: 'audience-split-2',
    x: 100,
    y: 100,
    width: 200,
    height: 80,
    data: {
      nodeType: 'audience-split',
      isConfigured: true,
      branches: [
        { id: 'branch-1', label: '分支1', type: 'audience' },
        { id: 'branch-2', label: '分支2', type: 'audience' }
      ]
    }
  },
  
  // 小尺寸节点
  smallNode: {
    id: 'audience-split-3',
    x: 300,
    y: 200,
    width: 80,
    height: 40,
    data: {
      nodeType: 'audience-split',
      isConfigured: true,
      branches: [
        { id: 'branch-1', label: '是', type: 'audience' },
        { id: 'branch-2', label: '否', type: 'audience' }
      ]
    }
  }
};

// 模拟布局引擎
class MockLayoutEngine {
  constructor() {
    this.layerYCoordinates = {
      0: 50,   // 第0层
      1: 150,  // 第1层
      2: 250,  // 第2层
      3: 350,  // 第3层
      4: 450   // 第4层
    };
  }
  
  getLayerYCoordinate(layer) {
    return this.layerYCoordinates[layer] || (layer * 100 + 50);
  }
}

// 模拟预览线管理器的位置计算方法
class MockPositionCalculator {
  constructor() {
    this.layoutEngine = new MockLayoutEngine();
    this.debugMode = true;
  }
  
  /**
   * 计算分支预览线位置
   * 基于UnifiedPreviewLineManager.js中的实现
   */
  calculateBranchPreviewPosition(node, branch, branchIndex) {
    console.log(`\n🎯 计算分支预览线位置`);
    console.log(`节点: ${node.id}, 分支: ${branch.id}, 索引: ${branchIndex}`);
    
    // 1. 参数验证
    if (!node || !branch || typeof branchIndex !== 'number') {
      console.log('❌ 参数验证失败');
      console.log(`  节点: ${!!node}, 分支: ${!!branch}, 索引: ${branchIndex}`);
      return null;
    }
    
    // 2. 获取节点信息
    const nodeId = node.id;
    const nodeData = node.data || {};
    
    console.log(`📋 节点信息:`);
    console.log(`  ID: ${nodeId}`);
    console.log(`  位置: (${node.x}, ${node.y})`);
    console.log(`  尺寸: ${node.width} x ${node.height}`);
    console.log(`  类型: ${nodeData.nodeType}`);
    
    // 3. 验证节点ID
    if (!nodeId || typeof nodeId !== 'string') {
      console.log('❌ 节点ID无效');
      return null;
    }
    
    // 4. 验证坐标和尺寸
    const x = parseFloat(node.x);
    const y = parseFloat(node.y);
    const width = parseFloat(node.width);
    const height = parseFloat(node.height);
    
    if (isNaN(x) || isNaN(y) || isNaN(width) || isNaN(height)) {
      console.log('❌ 节点坐标或尺寸无效');
      console.log(`  x: ${x}, y: ${y}, width: ${width}, height: ${height}`);
      return null;
    }
    
    console.log(`✅ 坐标验证通过: (${x}, ${y}), 尺寸: ${width} x ${height}`);
    
    // 5. 获取out端口位置
    const outPortPosition = this.getOutPortPosition(node);
    if (!outPortPosition) {
      console.log('❌ 无法获取out端口位置');
      return null;
    }
    
    console.log(`📍 Out端口位置: (${outPortPosition.x}, ${outPortPosition.y})`);
    
    // 6. 使用布局引擎层级Y坐标系统
    const currentLayer = this.getCurrentLayer(node);
    const targetLayer = currentLayer + 1;
    const layerY = this.layoutEngine.getLayerYCoordinate(targetLayer);
    
    console.log(`🏗️ 布局信息:`);
    console.log(`  当前层级: ${currentLayer}`);
    console.log(`  目标层级: ${targetLayer}`);
    console.log(`  层级Y坐标: ${layerY}`);
    
    // 7. 获取布局模型endpoint位置
    const endpointPosition = this.getLayoutEndpointPosition(nodeId, branch.id);
    if (endpointPosition) {
      console.log(`🎯 布局模型endpoint位置: (${endpointPosition.x}, ${endpointPosition.y})`);
    } else {
      console.log('⚠️ 未找到布局模型endpoint位置，使用计算位置');
    }
    
    // 8. 检查缓存位置
    const cachedPosition = this.getCachedPosition(nodeId, branch.id);
    if (cachedPosition && this.isValidPosition(cachedPosition)) {
      console.log(`💾 使用缓存位置: (${cachedPosition.x}, ${cachedPosition.y})`);
      return cachedPosition;
    }
    
    // 9. 计算终点位置分散
    const totalBranches = nodeData.branches ? nodeData.branches.length : 1;
    const spacing = Math.max(80, width * 0.8); // 最小间距80px
    const totalWidth = (totalBranches - 1) * spacing;
    const startX = outPortPosition.x - totalWidth / 2;
    
    const targetX = startX + branchIndex * spacing;
    const targetY = layerY;
    
    console.log(`🧮 位置计算:`);
    console.log(`  总分支数: ${totalBranches}`);
    console.log(`  分支间距: ${spacing}px`);
    console.log(`  总宽度: ${totalWidth}px`);
    console.log(`  起始X: ${startX}`);
    console.log(`  目标位置: (${targetX}, ${targetY})`);
    
    // 10. 验证计算结果
    if (isNaN(targetX) || isNaN(targetY)) {
      console.log('❌ 计算结果无效');
      return null;
    }
    
    const result = {
      x: Math.round(targetX),
      y: Math.round(targetY),
      sourcePort: 'out',
      targetPort: 'in',
      branchId: branch.id,
      branchIndex: branchIndex,
      calculatedAt: Date.now()
    };
    
    console.log(`✅ 计算完成: (${result.x}, ${result.y})`);
    return result;
  }
  
  /**
   * 获取out端口位置
   */
  getOutPortPosition(node) {
    // 简化实现：out端口在节点底部中心
    const x = node.x + node.width / 2;
    const y = node.y + node.height;
    
    return { x, y };
  }
  
  /**
   * 获取当前层级
   */
  getCurrentLayer(node) {
    // 简化实现：根据Y坐标估算层级
    return Math.floor(node.y / 100);
  }
  
  /**
   * 获取布局模型endpoint位置
   */
  getLayoutEndpointPosition(nodeId, branchId) {
    // 模拟：某些情况下有预设位置
    const presetPositions = {
      'audience-split-1_branch-1': { x: 150, y: 250 },
      'audience-split-1_branch-2': { x: 230, y: 250 },
      'audience-split-1_branch-3': { x: 310, y: 250 }
    };
    
    return presetPositions[`${nodeId}_${branchId}`] || null;
  }
  
  /**
   * 获取缓存位置
   */
  getCachedPosition(nodeId, branchId) {
    // 模拟缓存
    return null;
  }
  
  /**
   * 验证位置有效性
   */
  isValidPosition(position) {
    return position && 
           typeof position.x === 'number' && !isNaN(position.x) &&
           typeof position.y === 'number' && !isNaN(position.y);
  }
}

// 运行位置计算测试
function runPositionCalculationTests() {
  console.log('🎯 人群分流节点位置计算测试开始');
  console.log('='.repeat(60));
  
  const calculator = new MockPositionCalculator();
  let totalTests = 0;
  let passedTests = 0;
  
  // 测试每个节点的每个分支
  Object.entries(mockNodeData).forEach(([nodeName, node]) => {
    console.log(`\n📋 测试节点: ${nodeName} (${node.id})`);
    console.log('-'.repeat(40));
    
    const branches = node.data.branches || [];
    
    branches.forEach((branch, index) => {
      totalTests++;
      
      try {
        const position = calculator.calculateBranchPreviewPosition(node, branch, index);
        
        if (position && calculator.isValidPosition(position)) {
          console.log(`✅ 分支 ${branch.label} 位置计算成功`);
          passedTests++;
        } else {
          console.log(`❌ 分支 ${branch.label} 位置计算失败`);
        }
      } catch (error) {
        console.log(`❌ 分支 ${branch.label} 位置计算异常: ${error.message}`);
      }
    });
  });
  
  // 测试边界情况
  console.log('\n🔍 测试边界情况');
  console.log('-'.repeat(40));
  
  const edgeCases = [
    { name: '空节点', node: null, branch: { id: 'test' }, index: 0 },
    { name: '空分支', node: mockNodeData.standardNode, branch: null, index: 0 },
    { name: '无效索引', node: mockNodeData.standardNode, branch: { id: 'test' }, index: 'invalid' },
    { name: '负索引', node: mockNodeData.standardNode, branch: { id: 'test' }, index: -1 }
  ];
  
  edgeCases.forEach(testCase => {
    totalTests++;
    
    try {
      const position = calculator.calculateBranchPreviewPosition(
        testCase.node, 
        testCase.branch, 
        testCase.index
      );
      
      // 边界情况应该返回null
      if (position === null) {
        console.log(`✅ ${testCase.name} 正确处理`);
        passedTests++;
      } else {
        console.log(`❌ ${testCase.name} 处理错误 - 应返回null`);
      }
    } catch (error) {
      console.log(`❌ ${testCase.name} 处理异常: ${error.message}`);
    }
  });
  
  // 输出测试总结
  console.log('\n' + '='.repeat(60));
  console.log('📊 位置计算测试总结:');
  console.log(`总测试数: ${totalTests}`);
  console.log(`通过测试: ${passedTests}`);
  console.log(`失败测试: ${totalTests - passedTests}`);
  console.log(`通过率: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  
  if (passedTests === totalTests) {
    console.log('🎉 所有位置计算测试通过！');
  } else {
    console.log('⚠️ 部分位置计算测试失败');
    providePositionFixSuggestions();
  }
  
  return passedTests === totalTests;
}

// 提供位置计算修复建议
function providePositionFixSuggestions() {
  console.log('\n💡 位置计算修复建议:');
  console.log('1. 检查节点坐标和尺寸的有效性验证');
  console.log('2. 确保out端口位置计算正确');
  console.log('3. 验证布局引擎层级Y坐标系统');
  console.log('4. 检查分支间距和位置分散算法');
  console.log('5. 确保边界情况的正确处理');
  console.log('6. 验证缓存位置的有效性检查');
  console.log('7. 检查数值计算的精度和舍入');
}

// 如果在Node.js环境中运行
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    runPositionCalculationTests,
    MockPositionCalculator,
    mockNodeData
  };
}

// 如果在浏览器环境中运行
if (typeof window !== 'undefined') {
  window.runPositionCalculationTests = runPositionCalculationTests;
  window.MockPositionCalculator = MockPositionCalculator;
  window.mockNodeData = mockNodeData;
}

// 自动运行测试
runPositionCalculationTests();