// TDD测试脚本 - Y坐标NaN问题验证
class NaNTestSuite {
  constructor() {
    this.testResults = [];
    this.passedTests = 0;
    this.failedTests = 0;
  }

  // 断言方法
  assert(condition, message) {
    if (condition) {
      this.passedTests++;
      this.testResults.push({ status: '✅ PASS', message });
      console.log(`✅ PASS: ${message}`);
    } else {
      this.failedTests++;
      this.testResults.push({ status: '❌ FAIL', message });
      console.error(`❌ FAIL: ${message}`);
    }
  }

  // 测试layoutEngine是否存在
  testLayoutEngineExists() {
    console.log('\n🧪 测试1: layoutEngine存在性检查');
    this.assert(
      typeof window.layoutEngine !== 'undefined',
      'window.layoutEngine应该存在'
    );
    
    if (window.layoutEngine) {
      this.assert(
        typeof window.layoutEngine.calculateLayerY === 'function',
        'calculateLayerY方法应该存在'
      );
    }
  }

  // 测试calculateLayerY方法的基本功能
  testCalculateLayerYBasic() {
    console.log('\n🧪 测试2: calculateLayerY基本功能测试');
    
    if (!window.layoutEngine || typeof window.layoutEngine.calculateLayerY !== 'function') {
      this.assert(false, 'calculateLayerY方法不可用，跳过测试');
      return;
    }

    try {
      // 测试层级0
      const y0 = window.layoutEngine.calculateLayerY(0);
      this.assert(
        !isNaN(y0) && typeof y0 === 'number',
        `calculateLayerY(0)应该返回有效数字，实际返回: ${y0}`
      );
      this.assert(
        y0 >= 0,
        `calculateLayerY(0)应该返回非负数，实际返回: ${y0}`
      );

      // 测试层级1
      const y1 = window.layoutEngine.calculateLayerY(1);
      this.assert(
        !isNaN(y1) && typeof y1 === 'number',
        `calculateLayerY(1)应该返回有效数字，实际返回: ${y1}`
      );
      this.assert(
        y1 > y0,
        `calculateLayerY(1)应该大于calculateLayerY(0)，实际: ${y1} vs ${y0}`
      );

      // 测试层级2
      const y2 = window.layoutEngine.calculateLayerY(2);
      this.assert(
        !isNaN(y2) && typeof y2 === 'number',
        `calculateLayerY(2)应该返回有效数字，实际返回: ${y2}`
      );
      this.assert(
        y2 > y1,
        `calculateLayerY(2)应该大于calculateLayerY(1)，实际: ${y2} vs ${y1}`
      );

    } catch (error) {
      this.assert(false, `calculateLayerY测试抛出异常: ${error.message}`);
    }
  }

  // 测试边界条件
  testCalculateLayerYEdgeCases() {
    console.log('\n🧪 测试3: calculateLayerY边界条件测试');
    
    if (!window.layoutEngine || typeof window.layoutEngine.calculateLayerY !== 'function') {
      this.assert(false, 'calculateLayerY方法不可用，跳过测试');
      return;
    }

    try {
      // 测试负数输入
      const yNegative = window.layoutEngine.calculateLayerY(-1);
      this.assert(
        isNaN(yNegative) || yNegative === null || yNegative === undefined,
        `calculateLayerY(-1)应该返回无效值，实际返回: ${yNegative}`
      );

      // 测试NaN输入
      const yNaN = window.layoutEngine.calculateLayerY(NaN);
      this.assert(
        isNaN(yNaN) || yNaN === null || yNaN === undefined,
        `calculateLayerY(NaN)应该返回无效值，实际返回: ${yNaN}`
      );

      // 测试非数字输入
      const yString = window.layoutEngine.calculateLayerY('invalid');
      this.assert(
        isNaN(yString) || yString === null || yString === undefined,
        `calculateLayerY('invalid')应该返回无效值，实际返回: ${yString}`
      );

    } catch (error) {
      // 边界条件测试抛出异常是可以接受的
      this.assert(true, `边界条件测试正确抛出异常: ${error.message}`);
    }
  }

  // 测试节点位置
  testNodePositions() {
    console.log('\n🧪 测试4: 节点位置有效性测试');
    
    if (!window.graph || typeof window.graph.getNodes !== 'function') {
      this.assert(false, 'window.graph不可用，跳过节点位置测试');
      return;
    }

    const nodes = window.graph.getNodes();
    this.assert(
      nodes.length > 0,
      `图形中应该有节点，实际节点数: ${nodes.length}`
    );

    let validPositionCount = 0;
    let nanPositionCount = 0;

    nodes.forEach((node, index) => {
      const position = node.getPosition();
      const nodeId = node.id;
      
      if (!isNaN(position.x) && !isNaN(position.y)) {
        validPositionCount++;
      } else {
        nanPositionCount++;
        console.warn(`⚠️ 节点 ${nodeId} 位置包含NaN: (${position.x}, ${position.y})`);
      }
    });

    this.assert(
      nanPositionCount === 0,
      `所有节点位置都应该是有效数字，发现${nanPositionCount}个NaN位置，${validPositionCount}个有效位置`
    );
  }

  // 测试连接线位置
  testEdgePositions() {
    console.log('\n🧪 测试5: 连接线位置有效性测试');
    
    if (!window.graph || typeof window.graph.getEdges !== 'function') {
      this.assert(false, 'window.graph.getEdges不可用，跳过连接线测试');
      return;
    }

    const edges = window.graph.getEdges();
    this.assert(
      edges.length > 0,
      `图形中应该有连接线，实际连接线数: ${edges.length}`
    );

    let validEdgeCount = 0;
    let nanEdgeCount = 0;

    edges.forEach((edge, index) => {
      const source = edge.getSource();
      const target = edge.getTarget();
      
      const sourceNode = window.graph.getCellById(source.cell);
      const targetNode = window.graph.getCellById(target.cell);
      
      if (sourceNode && targetNode) {
        const sourcePos = sourceNode.getPosition();
        const targetPos = targetNode.getPosition();
        
        if (!isNaN(sourcePos.x) && !isNaN(sourcePos.y) && 
            !isNaN(targetPos.x) && !isNaN(targetPos.y)) {
          validEdgeCount++;
        } else {
          nanEdgeCount++;
          console.warn(`⚠️ 连接线 ${index} 端点位置包含NaN: 起点(${sourcePos.x}, ${sourcePos.y}) → 终点(${targetPos.x}, ${targetPos.y})`);
        }
      }
    });

    this.assert(
      nanEdgeCount === 0,
      `所有连接线端点位置都应该是有效数字，发现${nanEdgeCount}个NaN连接线，${validEdgeCount}个有效连接线`
    );
  }

  // 运行所有测试
  runAllTests() {
    console.log('🚀 开始TDD测试套件 - Y坐标NaN问题验证');
    console.log('=' .repeat(60));
    
    this.testLayoutEngineExists();
    this.testCalculateLayerYBasic();
    this.testCalculateLayerYEdgeCases();
    this.testNodePositions();
    this.testEdgePositions();
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 测试结果汇总:');
    console.log(`✅ 通过: ${this.passedTests}`);
    console.log(`❌ 失败: ${this.failedTests}`);
    console.log(`📈 成功率: ${((this.passedTests / (this.passedTests + this.failedTests)) * 100).toFixed(1)}%`);
    
    if (this.failedTests === 0) {
      console.log('🎉 所有测试通过！Y坐标NaN问题已解决。');
    } else {
      console.log('⚠️ 存在失败的测试，需要进一步修复。');
    }
    
    return {
      passed: this.passedTests,
      failed: this.failedTests,
      total: this.passedTests + this.failedTests,
      results: this.testResults
    };
  }
}

// 执行测试
const testSuite = new NaNTestSuite();
const results = testSuite.runAllTests();

// 返回测试结果供进一步分析
window.testResults = results;