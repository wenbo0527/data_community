/**
 * 核心逻辑验证测试
 * 专门测试边数据处理和验证逻辑，不依赖完整的X6图形实例
 */

class TestResultCollector {
  constructor() {
    this.results = [];
    this.startTime = new Date();
  }

  addResult(testName, passed, message, details = {}) {
    this.results.push({
      testName,
      passed,
      message,
      details,
      timestamp: new Date().toISOString()
    });
    
    const status = passed ? '✅' : '❌';
    console.log(`${status} ${testName}: ${message}`);
    if (details && Object.keys(details).length > 0) {
      console.log('   详情:', JSON.stringify(details, null, 2));
    }
  }

  getSummary() {
    const passed = this.results.filter(r => r.passed).length;
    const failed = this.results.filter(r => !r.passed).length;
    const total = this.results.length;
    const successRate = total > 0 ? ((passed / total) * 100).toFixed(2) : '0.00';
    
    return {
      results: this.results,
      summary: { passed, failed, total },
      successRate: `${successRate}%`,
      duration: `${new Date() - this.startTime}ms`
    };
  }
}

// 模拟GraphService用于测试
class MockGraphService {
  constructor() {
    this.nodes = new Map([
      ['node1', { id: 'node1', x: 100, y: 100 }],
      ['node2', { id: 'node2', x: 300, y: 100 }],
      ['node3', { id: 'node3', x: 500, y: 100 }]
    ]);
  }

  // 模拟预处理边数据的逻辑（基于实际GraphService的实现）
  preprocessEdgeData(edgeData) {
    // 空值检查
    if (!edgeData) {
      throw new Error('边数据不能为null或undefined');
    }

    if (typeof edgeData !== 'object') {
      throw new Error('边数据必须是对象类型');
    }

    if (Object.keys(edgeData).length === 0) {
      throw new Error('边数据不能为空对象');
    }

    const processed = { ...edgeData };

    // 处理旧格式的边数据
    if (typeof processed.source === 'string') {
      processed.source = {
        cell: processed.source,
        port: processed.sourcePort || 'out'
      };
    }

    if (typeof processed.target === 'string') {
      processed.target = {
        cell: processed.target,
        port: processed.targetPort || 'in'
      };
    }

    // 处理使用sourceNodeId和targetNodeId的边数据
    if (processed.sourceNodeId && !processed.source) {
      processed.source = {
        cell: processed.sourceNodeId,
        port: processed.sourcePort || 'out'
      };
    }

    if (processed.targetNodeId && !processed.target) {
      processed.target = {
        cell: processed.targetNodeId,
        port: processed.targetPort || 'in'
      };
    }

    // 验证source和target
    if (!processed.source || !processed.source.cell) {
      throw new Error('边数据必须包含有效的source.cell');
    }

    if (!processed.target || !processed.target.cell) {
      throw new Error('边数据必须包含有效的target.cell');
    }

    // 确保source.cell和target.cell是字符串
    if (typeof processed.source.cell !== 'string') {
      throw new Error(`源节点ID必须是字符串，接收到: ${processed.source.cell} (类型: ${typeof processed.source.cell})`);
    }

    if (typeof processed.target.cell !== 'string') {
      throw new Error(`目标节点ID必须是字符串，接收到: ${processed.target.cell} (类型: ${typeof processed.target.cell})`);
    }

    // 设置默认类型
    if (!processed.type) {
      processed.type = processed.isPreview ? 'preview' : 'connection';
    }

    return processed;
  }

  // 模拟节点存在性检查
  hasNode(nodeId) {
    return this.nodes.has(nodeId);
  }
}

// 模拟UnifiedEdgeManager的核心验证逻辑
class MockUnifiedEdgeManager {
  constructor(graphService) {
    this.graphService = graphService;
  }

  // 验证源节点ID的逻辑
  validateSourceNodeId(sourceNodeId) {
    if (!sourceNodeId) {
      throw new Error('源节点ID不能为空');
    }

    if (typeof sourceNodeId === 'object') {
      // 如果是对象格式，尝试提取cell属性
      if (sourceNodeId.cell) {
        sourceNodeId = sourceNodeId.cell;
      } else {
        throw new Error(`源节点ID必须是字符串，接收到: [object Object] (类型: object)`);
      }
    }

    if (typeof sourceNodeId !== 'string') {
      throw new Error(`源节点ID必须是字符串，接收到: ${sourceNodeId} (类型: ${typeof sourceNodeId})`);
    }

    if (!this.graphService.hasNode(sourceNodeId)) {
      throw new Error(`源节点不存在: ${sourceNodeId}`);
    }

    return sourceNodeId;
  }

  // 模拟创建预览线的逻辑
  async createPreviewLine(sourceNodeId, targetInfo) {
    try {
      const validatedSourceId = this.validateSourceNodeId(sourceNodeId);
      return {
        success: true,
        sourceId: validatedSourceId,
        targetInfo
      };
    } catch (error) {
      throw error;
    }
  }
}

// 测试用例定义
const coreLogicTestCases = [
  {
    name: '正常边数据预处理',
    test: async (collector, graphService) => {
      const edgeData = {
        id: 'edge1',
        source: { cell: 'node1', port: 'out' },
        target: { cell: 'node2', port: 'in' },
        type: 'connection'
      };

      try {
        const processed = graphService.preprocessEdgeData(edgeData);
        collector.addResult(
          '正常边数据预处理',
          processed.source.cell === 'node1' && processed.target.cell === 'node2',
          '预处理成功',
          { processed }
        );
      } catch (error) {
        collector.addResult('正常边数据预处理', false, '预处理失败', { error: error.message });
      }
    }
  },
  {
    name: '旧格式边数据转换',
    test: async (collector, graphService) => {
      const edgeData = {
        id: 'edge2',
        source: 'node1',
        target: 'node2'
      };

      try {
        const processed = graphService.preprocessEdgeData(edgeData);
        collector.addResult(
          '旧格式边数据转换',
          processed.source.cell === 'node1' && processed.target.cell === 'node2',
          '旧格式转换成功',
          { processed }
        );
      } catch (error) {
        collector.addResult('旧格式边数据转换', false, '转换失败', { error: error.message });
      }
    }
  },
  {
    name: 'sourceNodeId格式转换',
    test: async (collector, graphService) => {
      const edgeData = {
        id: 'edge3',
        sourceNodeId: 'node1',
        targetNodeId: 'node2',
        sourcePort: 'out',
        targetPort: 'in'
      };

      try {
        const processed = graphService.preprocessEdgeData(edgeData);
        collector.addResult(
          'sourceNodeId格式转换',
          processed.source.cell === 'node1' && processed.target.cell === 'node2',
          'sourceNodeId转换成功',
          { processed }
        );
      } catch (error) {
        collector.addResult('sourceNodeId格式转换', false, '转换失败', { error: error.message });
      }
    }
  },
  {
    name: '源节点ID验证-正常字符串',
    test: async (collector, graphService, edgeManager) => {
      try {
        const result = await edgeManager.createPreviewLine('node1', {});
        collector.addResult(
          '源节点ID验证-正常字符串',
          result.success && result.sourceId === 'node1',
          '字符串源节点ID验证成功',
          { result }
        );
      } catch (error) {
        collector.addResult('源节点ID验证-正常字符串', false, '验证失败', { error: error.message });
      }
    }
  },
  {
    name: '源节点ID验证-对象格式',
    test: async (collector, graphService, edgeManager) => {
      try {
        const result = await edgeManager.createPreviewLine({ cell: 'node1' }, {});
        collector.addResult(
          '源节点ID验证-对象格式',
          result.success && result.sourceId === 'node1',
          '对象格式源节点ID验证成功',
          { result }
        );
      } catch (error) {
        collector.addResult('源节点ID验证-对象格式', false, '验证失败', { error: error.message });
      }
    }
  },
  {
    name: '源节点ID验证-空值',
    test: async (collector, graphService, edgeManager) => {
      try {
        await edgeManager.createPreviewLine('', {});
        collector.addResult('源节点ID验证-空值', false, '应该拒绝空值但成功了');
      } catch (error) {
        collector.addResult(
          '源节点ID验证-空值',
          error.message.includes('源节点ID不能为空'),
          '正确拒绝了空值',
          { error: error.message }
        );
      }
    }
  },
  {
    name: '源节点ID验证-不存在的节点',
    test: async (collector, graphService, edgeManager) => {
      try {
        await edgeManager.createPreviewLine('nonexistent', {});
        collector.addResult('源节点ID验证-不存在的节点', false, '应该拒绝不存在的节点但成功了');
      } catch (error) {
        collector.addResult(
          '源节点ID验证-不存在的节点',
          error.message.includes('源节点不存在'),
          '正确拒绝了不存在的节点',
          { error: error.message }
        );
      }
    }
  },
  {
    name: '边数据验证-空对象',
    test: async (collector, graphService) => {
      try {
        graphService.preprocessEdgeData({});
        collector.addResult('边数据验证-空对象', false, '应该拒绝空对象但成功了');
      } catch (error) {
        collector.addResult(
          '边数据验证-空对象',
          error.message.includes('边数据不能为空对象'),
          '正确拒绝了空对象',
          { error: error.message }
        );
      }
    }
  },
  {
    name: '边数据验证-null值',
    test: async (collector, graphService) => {
      try {
        graphService.preprocessEdgeData(null);
        collector.addResult('边数据验证-null值', false, '应该拒绝null值但成功了');
      } catch (error) {
        collector.addResult(
          '边数据验证-null值',
          error.message.includes('边数据不能为null或undefined'),
          '正确拒绝了null值',
          { error: error.message }
        );
      }
    }
  }
];

// 主测试函数
async function runCoreLogicValidation() {
  console.log('🚀 开始核心逻辑验证测试...\n');
  
  const collector = new TestResultCollector();
  const graphService = new MockGraphService();
  const edgeManager = new MockUnifiedEdgeManager(graphService);

  // 运行所有测试用例
  for (const testCase of coreLogicTestCases) {
    console.log(`\n🔍 执行测试: ${testCase.name}`);
    try {
      await testCase.test(collector, graphService, edgeManager);
    } catch (error) {
      collector.addResult(testCase.name, false, '测试执行失败', { error: error.message });
    }
  }

  const summary = collector.getSummary();
  
  console.log('\n📊 测试总结:');
  console.log(`✅ 通过: ${summary.summary.passed}`);
  console.log(`❌ 失败: ${summary.summary.failed}`);
  console.log(`📈 成功率: ${summary.successRate}`);
  console.log(`⏱️  耗时: ${summary.duration}`);

  return summary;
}

// 导出测试函数
export { runCoreLogicValidation };

// 如果在浏览器环境中，添加到window对象
if (typeof window !== 'undefined') {
  window.runCoreLogicValidation = runCoreLogicValidation;
  
  // 如果DOM已加载，自动运行测试
  document.addEventListener('DOMContentLoaded', () => {
    runCoreLogicValidation();
  });
}