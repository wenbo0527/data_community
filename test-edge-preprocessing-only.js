/**
 * 边数据预处理测试脚本（仅测试预处理逻辑，不需要X6图形实例）
 */

// 测试结果收集器
class TestResultCollector {
  constructor() {
    this.results = [];
    this.summary = { passed: 0, failed: 0, total: 0 };
  }

  addResult(testName, passed, message, details = {}) {
    const result = {
      testName,
      passed,
      message,
      details,
      timestamp: new Date().toISOString()
    };
    
    this.results.push(result);
    
    if (passed) {
      this.summary.passed++;
      console.log(`✅ ${testName}: ${message}`);
    } else {
      this.summary.failed++;
      console.log(`❌ ${testName}: ${message}`);
      if (details.error) {
        console.log(`   错误详情: ${details.error}`);
      }
    }
    
    this.summary.total++;
  }

  getSummary() {
    return {
      results: this.results,
      summary: this.summary,
      successRate: this.summary.total > 0 ? (this.summary.passed / this.summary.total * 100).toFixed(2) + '%' : '0%'
    };
  }
}

// 测试用例数据
const edgeTestCases = [
  {
    name: '正常连接线',
    data: {
      id: 'edge1',
      source: { cell: 'node1', port: 'out' },
      target: { cell: 'node2', port: 'in' },
      type: 'connection'
    },
    shouldPass: true
  },
  {
    name: '预览线',
    data: {
      id: 'preview1',
      source: { cell: 'node1', port: 'out' },
      target: { cell: 'node2', port: 'in' },
      type: 'preview',
      isPreview: true
    },
    shouldPass: true
  },
  {
    name: '缺少source.cell的边',
    data: {
      id: 'edge2',
      source: { port: 'out' },
      target: { cell: 'node2', port: 'in' }
    },
    shouldPass: false
  },
  {
    name: 'target为undefined的边',
    data: {
      id: 'edge3',
      source: { cell: 'node1', port: 'out' },
      target: undefined
    },
    shouldPass: false
  },
  {
    name: '旧格式边数据（字符串格式）',
    data: {
      id: 'edge5',
      source: 'node1',
      target: 'node2'
    },
    shouldPass: true // 应该被预处理修复
  },
  {
    name: '使用sourceNodeId和targetNodeId的边',
    data: {
      id: 'edge6',
      sourceNodeId: 'node1',
      targetNodeId: 'node2',
      sourcePort: 'out',
      targetPort: 'in'
    },
    shouldPass: true // 应该被预处理修复
  },
  {
    name: '空的边数据',
    data: {},
    shouldPass: false
  },
  {
    name: 'null边数据',
    data: null,
    shouldPass: false
  }
];

// 模拟GraphService类（仅包含预处理逻辑）
class MockGraphService {
  /**
   * 预处理边数据，确保格式正确
   * @param {Object} edgeData - 原始边数据
   * @returns {Object} - 处理后的边数据
   */
  preprocessEdgeData(edgeData) {
    // 🔧 增强：支持null/undefined检查
    if (!edgeData) {
      throw new Error('边数据不能为null或undefined')
    }
    
    if (typeof edgeData !== 'object') {
      throw new Error('边数据必须是有效对象')
    }

    // 🔧 增强：支持空对象检查
    if (Object.keys(edgeData).length === 0) {
      throw new Error('边数据不能为空对象')
    }

    // 创建处理后的边数据副本
    const processed = { ...edgeData }

    // 🔧 增强：处理源节点配置 - 支持更多格式
    if (!processed.source) {
      // 尝试从多种可能的字段构建source
      const sourceId = processed.sourceNodeId || processed.sourceId || processed.from || processed.fromNode
      const sourcePort = processed.sourcePort || processed.fromPort || 'out'
      
      if (sourceId) {
        processed.source = {
          cell: sourceId,
          port: sourcePort
        }
        console.log('🔧 [GraphService] 从备用字段构建source:', { sourceId, sourcePort })
      } else {
        throw new Error('边数据缺少源节点信息 (source/sourceNodeId/sourceId/from/fromNode)')
      }
    } else if (typeof processed.source === 'string') {
      // 如果source是字符串，转换为对象格式
      processed.source = {
        cell: processed.source,
        port: processed.sourcePort || 'out'
      }
      console.log('🔧 [GraphService] 转换字符串source为对象格式:', processed.source)
    }

    // 🔧 增强：处理目标节点配置 - 支持更多格式
    if (!processed.target) {
      // 尝试从多种可能的字段构建target
      const targetId = processed.targetNodeId || processed.targetId || processed.to || processed.toNode
      const targetPort = processed.targetPort || processed.toPort || 'in'
      
      if (targetId) {
        processed.target = {
          cell: targetId,
          port: targetPort
        }
        console.log('🔧 [GraphService] 从备用字段构建target:', { targetId, targetPort })
      } else if (!processed.isPreview && processed.type !== 'preview') {
        // 对于非预览线，目标节点是必需的
        throw new Error('边数据缺少目标节点信息 (target/targetNodeId/targetId/to/toNode)')
      }
    } else if (typeof processed.target === 'string') {
      // 如果target是字符串，转换为对象格式
      processed.target = {
        cell: processed.target,
        port: processed.targetPort || 'in'
      }
      console.log('🔧 [GraphService] 转换字符串target为对象格式:', processed.target)
    }

    // 🔧 增强：生成边ID（如果缺少）
    if (!processed.id) {
      // 生成更有意义的ID
      const sourceId = processed.source.cell
      const targetId = processed.target?.cell || 'virtual'
      const timestamp = Date.now()
      const random = Math.random().toString(36).substr(2, 6)
      
      if (processed.isPreview || processed.type === 'preview') {
        processed.id = `preview_${sourceId}_${targetId}_${timestamp}_${random}`
      } else {
        processed.id = `edge_${sourceId}_${targetId}_${timestamp}_${random}`
      }
      
      console.log('🔧 [GraphService] 生成边ID:', processed.id)
    }

    // 🔧 增强：处理边类型
    if (!processed.type) {
      processed.type = processed.isPreview ? 'preview' : 'connection'
    }

    // 🔧 增强：验证处理后的数据
    if (!processed.source || !processed.source.cell) {
      throw new Error('预处理后的边数据仍缺少有效的源节点信息')
    }
    
    if (!processed.isPreview && processed.type !== 'preview' && (!processed.target || !processed.target.cell)) {
      throw new Error('预处理后的边数据仍缺少有效的目标节点信息')
    }

    console.log('✅ [GraphService] 边数据预处理完成:', {
      id: processed.id,
      source: processed.source,
      target: processed.target,
      type: processed.type
    })

    return processed
  }
}

// 主测试函数
async function runEdgePreprocessingTest() {
  console.log('🚀 开始边数据预处理测试...\n');
  
  const collector = new TestResultCollector();
  const mockGraphService = new MockGraphService();

  // 测试边数据预处理功能
  console.log('🔧 测试边数据预处理功能...\n');
  
  for (const testCase of edgeTestCases) {
    try {
      if (testCase.data === null) {
        // 测试null数据
        try {
          mockGraphService.preprocessEdgeData(testCase.data);
          collector.addResult(
            `预处理-${testCase.name}`, 
            !testCase.shouldPass, 
            testCase.shouldPass ? '应该失败但成功了' : '正确拒绝了null数据'
          );
        } catch (error) {
          collector.addResult(
            `预处理-${testCase.name}`, 
            !testCase.shouldPass, 
            testCase.shouldPass ? '意外失败' : '正确拒绝了无效数据',
            { error: error.message }
          );
        }
        continue;
      }

      const processed = mockGraphService.preprocessEdgeData(testCase.data);
      
      // 验证预处理结果
      const hasValidSource = processed.source && processed.source.cell;
      const hasValidTarget = processed.target && processed.target.cell;
      
      if (testCase.shouldPass) {
        const success = hasValidSource && (hasValidTarget || processed.isPreview || processed.type === 'preview');
        collector.addResult(
          `预处理-${testCase.name}`, 
          success, 
          success ? '预处理成功，数据格式正确' : '预处理失败或数据格式不正确',
          { 
            processed,
            hasValidSource,
            hasValidTarget,
            isPreview: processed.isPreview || processed.type === 'preview'
          }
        );
      } else {
        // 应该失败的测试用例，如果成功了就是错误
        collector.addResult(
          `预处理-${testCase.name}`, 
          false, 
          '应该失败但预处理成功了',
          { processed }
        );
      }
      
    } catch (error) {
      if (testCase.shouldPass) {
        collector.addResult(
          `预处理-${testCase.name}`, 
          false, 
          '预处理失败',
          { error: error.message, originalData: testCase.data }
        );
      } else {
        collector.addResult(
          `预处理-${testCase.name}`, 
          true, 
          '正确拒绝了无效数据',
          { error: error.message }
        );
      }
    }
  }

  const summary = collector.getSummary();
  
  console.log('\n📊 测试结果汇总:');
  console.log(`总测试数: ${summary.summary.total}`);
  console.log(`通过: ${summary.summary.passed}`);
  console.log(`失败: ${summary.summary.failed}`);
  console.log(`成功率: ${summary.successRate}`);
  
  return summary;
}

// 导出测试函数
export { runEdgePreprocessingTest };

// 如果在浏览器环境中，添加到全局对象
if (typeof window !== 'undefined') {
  window.runEdgePreprocessingTest = runEdgePreprocessingTest;
}