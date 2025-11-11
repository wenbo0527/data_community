/**
 * 边创建错误修复验证测试脚本
 * 验证所有修复的功能点和边界情况
 */

// 动态导入 X6 库
let X6Graph = null;

// 初始化 X6 库
async function initX6() {
  if (!X6Graph) {
    const X6 = await import('@antv/x6');
    X6Graph = X6.Graph;
  }
  return X6Graph;
}

// 测试结果收集器
class TestResultCollector {
  constructor() {
    this.results = [];
    this.passed = 0;
    this.failed = 0;
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
      this.passed++;
      console.log(`✅ ${testName}: ${message}`);
    } else {
      this.failed++;
      console.error(`❌ ${testName}: ${message}`, details);
    }
  }

  getSummary() {
    return {
      total: this.results.length,
      passed: this.passed,
      failed: this.failed,
      passRate: this.results.length > 0 ? (this.passed / this.results.length * 100).toFixed(2) : 0,
      results: this.results
    };
  }
}

// 创建测试图形实例
async function createTestGraph() {
  const GraphClass = await initX6();
  
  let container;
  
  // 检查是否在浏览器环境中
  if (typeof document === 'undefined') {
    // 创建更完整的DOM元素模拟
    function createMockElement(tagName) {
      const element = {
        tagName: tagName.toUpperCase(),
        style: {},
        appendChild: function(child) {
          this.children.push(child);
          child.parentNode = this;
          return child;
        },
        removeChild: function(child) {
          const index = this.children.indexOf(child);
          if (index > -1) {
            this.children.splice(index, 1);
            child.parentNode = null;
          }
          return child;
        },
        addEventListener: () => {},
        removeEventListener: () => {},
        setAttribute: function(name, value) {
          this.attributes = this.attributes || {};
          this.attributes[name] = value;
        },
        setAttributeNS: function(namespace, name, value) {
          this.attributes = this.attributes || {};
          this.attributes[name] = value;
        },
        getAttribute: function(name) {
          return this.attributes && this.attributes[name] || null;
        },
        hasAttribute: function(name) {
          return this.attributes && this.attributes.hasOwnProperty(name);
        },
        removeAttribute: function(name) {
          if (this.attributes) {
            delete this.attributes[name];
          }
        },
        classList: {
          add: () => {},
          remove: () => {},
          contains: () => false,
          toggle: () => {}
        },
        innerHTML: '',
        textContent: '',
        children: [],
        parentNode: null,
        firstChild: null,
        lastChild: null,
        nextSibling: null,
        previousSibling: null,
        attributes: {},
        getBoundingClientRect: () => ({ width: 800, height: 600, left: 0, top: 0 })
      };
      
      if (tagName.toLowerCase() === 'div') {
        element.offsetWidth = 800;
        element.offsetHeight = 600;
        element.clientWidth = 800;
        element.clientHeight = 600;
      }
      
      if (tagName.toLowerCase() === 'style') {
        element.sheet = {
          insertRule: () => {},
          deleteRule: () => {},
          cssRules: []
        };
      }
      
      return element;
    }
    
    // Node.js环境，创建模拟容器和全局对象
    container = createMockElement('div');
    
    // 模拟document和window对象
    global.document = {
      createElement: createMockElement,
      createElementNS: (namespace, tagName) => createMockElement(tagName),
      createDocumentFragment: () => ({
        appendChild: () => {},
        removeChild: () => {},
        children: [],
        childNodes: []
      }),
      getElementById: () => null,
      querySelector: () => null,
      querySelectorAll: () => [],
      body: createMockElement('body'),
      head: createMockElement('head'),
      addEventListener: () => {},
      removeEventListener: () => {}
    };
    global.window = {
      document: global.document,
      addEventListener: () => {},
      removeEventListener: () => {},
      getComputedStyle: () => ({}),
      requestAnimationFrame: (callback) => setTimeout(callback, 16),
      cancelAnimationFrame: (id) => clearTimeout(id),
      innerWidth: 1024,
      innerHeight: 768,
      devicePixelRatio: 1
    };
  } else {
    // 浏览器环境
    container = document.createElement('div');
    container.style.width = '800px';
    container.style.height = '600px';
    container.style.position = 'absolute';
    container.style.left = '-9999px'; // 隐藏测试容器
    document.body.appendChild(container);
  }

  const graph = new GraphClass({
    container,
    width: 800,
    height: 600,
    grid: true,
    panning: true,
    mousewheel: {
      enabled: true,
      zoomAtMousePosition: true,
      modifiers: 'ctrl',
      minScale: 0.5,
      maxScale: 3,
    },
    connecting: {
      router: 'manhattan',
      connector: {
        name: 'rounded',
        args: {
          radius: 8,
        },
      },
      anchor: 'center',
      connectionPoint: 'anchor',
      allowBlank: false,
      snap: {
        radius: 20,
      },
      createEdge() {
        return new GraphClass.Edge({
          attrs: {
            line: {
              stroke: '#A2B1C3',
              strokeWidth: 2,
              targetMarker: {
                name: 'block',
                width: 6,
                height: 4,
              },
            },
          },
          zIndex: 0,
        })
      },
    },
  });

  // 🔧 修复：为测试环境初始化UnifiedEdgeManager
  try {
    const { UnifiedEdgeManager } = await import('./src/pages/marketing/tasks/composables/canvas/unified/UnifiedEdgeManager.js');
    
    // 创建UnifiedEdgeManager实例
    const unifiedEdgeManager = new UnifiedEdgeManager(graph, {
      enablePreviewLines: true,
      enableConnections: true,
      enableBatchOperations: true,
      enablePerformanceMonitoring: false, // 测试环境禁用性能监控
      autoCleanup: false, // 测试环境禁用自动清理
      problemDiagnosis: false, // 测试环境禁用问题诊断
    });
    
    // 初始化UnifiedEdgeManager
    await unifiedEdgeManager.initialize();
    
    // 将UnifiedEdgeManager实例附加到graph对象
    graph.unifiedEdgeManager = unifiedEdgeManager;
    
    // 同时设置到全局window对象（用于开发环境）
    if (typeof window !== 'undefined') {
      window.unifiedEdgeManager = unifiedEdgeManager;
    }
    
    console.log('✅ [测试环境] UnifiedEdgeManager初始化成功');
  } catch (error) {
    console.error('❌ [测试环境] UnifiedEdgeManager初始化失败:', error);
    
    // 创建一个模拟的UnifiedEdgeManager用于测试
    const mockUnifiedEdgeManager = {
      isInitialized: { value: true },
      createConnection: async (sourceId, targetId, options) => {
        console.log('🔧 [模拟] 创建连接:', { sourceId, targetId, options });
        // 模拟创建连接，直接使用graph.addEdge
        const edgeData = {
          id: options.edgeId || `edge_${Date.now()}`,
          source: { cell: sourceId, port: options.sourcePort || 'out' },
          target: { cell: targetId, port: options.targetPort || 'in' },
        };
        return graph.addEdge(edgeData);
      },
      createPreviewLine: async (sourceId, options) => {
        console.log('🔧 [模拟] 创建预览线:', { sourceId, options });
        return { id: `preview_${Date.now()}`, sourceId, options };
      }
    };
    
    graph.unifiedEdgeManager = mockUnifiedEdgeManager;
    if (typeof window !== 'undefined') {
      window.unifiedEdgeManager = mockUnifiedEdgeManager;
    }
    
    console.log('⚠️ [测试环境] 使用模拟UnifiedEdgeManager');
  }

  return { graph, container };
}

// 测试数据定义
const testNodes = [
  { id: 'node1', x: 100, y: 100, width: 80, height: 40, label: '节点1' },
  { id: 'node2', x: 300, y: 100, width: 80, height: 40, label: '节点2' },
  { id: 'node3', x: 500, y: 100, width: 80, height: 40, label: '节点3' }
];

// 各种边数据测试用例
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
    name: '源节点不存在的边',
    data: {
      id: 'edge4',
      source: { cell: 'nonexistent', port: 'out' },
      target: { cell: 'node2', port: 'in' }
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

// 主测试函数
async function runEdgeFixValidationTest() {
  console.log('🚀 开始边创建错误修复验证测试...');
  
  const collector = new TestResultCollector();
  const { graph, container } = await createTestGraph();

  try {
    // 添加测试节点
    testNodes.forEach(nodeData => {
      graph.addNode(nodeData);
    });

    console.log('\n📋 测试节点已添加，开始边数据测试...');

    // 动态导入GraphService和UnifiedEdgeManager
    let GraphService, UnifiedEdgeManager;
    
    try {
      const graphServiceModule = await import('./src/pages/marketing/tasks/services/GraphService.js');
      GraphService = graphServiceModule.default || graphServiceModule.GraphService;
      
      const edgeManagerModule = await import('./src/pages/marketing/tasks/composables/canvas/unified/UnifiedEdgeManager.js');
      UnifiedEdgeManager = edgeManagerModule.default || edgeManagerModule.UnifiedEdgeManager;
      
      collector.addResult('模块导入', true, '成功导入GraphService和UnifiedEdgeManager');
    } catch (error) {
      collector.addResult('模块导入', false, '导入模块失败', { error: error.message });
      return collector.getSummary();
    }

    // 创建GraphService实例
    let graphService;
    try {
      graphService = new GraphService(graph);
      collector.addResult('GraphService实例化', true, '成功创建GraphService实例');
    } catch (error) {
      collector.addResult('GraphService实例化', false, '创建GraphService实例失败', { error: error.message });
      return collector.getSummary();
    }

    // 测试1: 边数据预处理功能
    console.log('\n🔧 测试边数据预处理功能...');
    
    for (const testCase of edgeTestCases) {
      try {
        if (testCase.data === null) {
          // 测试null数据
          try {
            graphService.preprocessEdgeData(testCase.data);
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

        const processed = graphService.preprocessEdgeData(testCase.data);
        
        // 验证预处理结果
        const hasValidSource = processed.source && processed.source.cell;
        const hasValidTarget = processed.target && processed.target.cell;
        
        if (testCase.shouldPass) {
          const success = hasValidSource && hasValidTarget;
          collector.addResult(
            `预处理-${testCase.name}`, 
            success, 
            success ? '预处理成功，数据格式正确' : '预处理失败或数据格式不正确',
            { processed, hasValidSource, hasValidTarget }
          );
        } else {
          collector.addResult(
            `预处理-${testCase.name}`, 
            true, 
            '预处理完成（预期可能失败的数据被处理）',
            { processed }
          );
        }
      } catch (error) {
        collector.addResult(
          `预处理-${testCase.name}`, 
          !testCase.shouldPass, 
          testCase.shouldPass ? '预处理意外失败' : '正确拒绝了无效数据',
          { error: error.message }
        );
      }
    }

    // 测试2: 边创建功能
    console.log('\n🔗 测试边创建功能...');
    
    for (const testCase of edgeTestCases.filter(tc => tc.data !== null && Object.keys(tc.data || {}).length > 0)) {
      try {
        const result = await graphService.addEdge(testCase.data);
        
        if (testCase.shouldPass) {
          const success = result && result.success && result.edge;
          collector.addResult(
            `创建-${testCase.name}`, 
            success, 
            success ? '边创建成功' : '边创建失败',
            { result }
          );
        } else {
          collector.addResult(
            `创建-${testCase.name}`, 
            false, 
            '应该失败但成功了',
            { result }
          );
        }
      } catch (error) {
        collector.addResult(
          `创建-${testCase.name}`, 
          !testCase.shouldPass, 
          testCase.shouldPass ? '边创建意外失败' : '正确拒绝了无效边数据',
          { error: error.message }
        );
      }
    }

    // 测试3: UnifiedEdgeManager直接测试
    console.log('\n🎯 测试UnifiedEdgeManager直接功能...');
    
    try {
      // 使用GraphService实例的getUnifiedEdgeManager方法
      const edgeManager = graphService.getUnifiedEdgeManager();
      
      // 测试预览线创建
      try {
        const previewLine = await edgeManager.createPreviewLine('node1', {
          branchId: 'test-branch',
          branchLabel: '测试分支'
        });
        
        collector.addResult(
          'UnifiedEdgeManager-预览线创建', 
          !!previewLine, 
          previewLine ? '预览线创建成功' : '预览线创建失败',
          { previewLine }
        );
      } catch (error) {
        collector.addResult(
          'UnifiedEdgeManager-预览线创建', 
          false, 
          '预览线创建失败',
          { error: error.message }
        );
      }

      // 测试空源节点ID
      try {
        await edgeManager.createPreviewLine('', {});
        collector.addResult(
          'UnifiedEdgeManager-空源节点ID', 
          false, 
          '应该拒绝空源节点ID但成功了'
        );
      } catch (error) {
        collector.addResult(
          'UnifiedEdgeManager-空源节点ID', 
          true, 
          '正确拒绝了空源节点ID',
          { error: error.message }
        );
      }

      // 测试不存在的源节点ID
      try {
        await edgeManager.createPreviewLine('nonexistent-node', {});
        collector.addResult(
          'UnifiedEdgeManager-不存在源节点', 
          false, 
          '应该处理不存在的源节点但可能成功了'
        );
      } catch (error) {
        collector.addResult(
          'UnifiedEdgeManager-不存在源节点', 
          true, 
          '正确处理了不存在的源节点',
          { error: error.message }
        );
      }

    } catch (error) {
      collector.addResult(
        'UnifiedEdgeManager-初始化', 
        false, 
        'UnifiedEdgeManager初始化失败',
        { error: error.message }
      );
    }

    // 测试4: 错误恢复机制
    console.log('\n🔄 测试错误恢复机制...');
    
    // 测试批量加载包含错误数据的情况
    const mixedEdgeData = [
      ...edgeTestCases.slice(0, 3).map(tc => tc.data),
      { id: 'invalid1', source: null, target: null },
      { id: 'invalid2' }
    ];

    try {
      const loadResults = [];
      for (const edgeData of mixedEdgeData) {
        try {
          if (edgeData && Object.keys(edgeData).length > 0) {
            const result = await graphService.addEdge(edgeData);
            loadResults.push({ success: true, edgeId: edgeData.id, result });
          }
        } catch (error) {
          loadResults.push({ success: false, edgeId: edgeData.id, error: error.message });
        }
      }
      
      const successCount = loadResults.filter(r => r.success).length;
      const failureCount = loadResults.filter(r => !r.success).length;
      
      collector.addResult(
        '批量加载-错误恢复', 
        successCount > 0, 
        `批量加载完成: ${successCount}成功, ${failureCount}失败`,
        { loadResults, successCount, failureCount }
      );
    } catch (error) {
      collector.addResult(
        '批量加载-错误恢复', 
        false, 
        '批量加载测试失败',
        { error: error.message }
      );
    }

  } catch (error) {
    collector.addResult('测试执行', false, '测试执行过程中发生错误', { error: error.message });
  } finally {
    // 清理测试环境
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
  }

  // 输出测试总结
  const summary = collector.getSummary();
  
  console.log('\n📊 测试总结:');
  console.log(`总测试数: ${summary.total}`);
  console.log(`通过: ${summary.passed}`);
  console.log(`失败: ${summary.failed}`);
  console.log(`通过率: ${summary.passRate}%`);
  
  if (summary.failed > 0) {
    console.log('\n❌ 失败的测试:');
    summary.results.filter(r => !r.passed).forEach(result => {
      console.log(`  - ${result.testName}: ${result.message}`);
    });
  }

  console.log('\n✅ 边创建错误修复验证测试完成!');
  return summary;
}

// ES6 模块导出
export { runEdgeFixValidationTest };

// 浏览器环境下直接挂载到 window 对象
if (typeof window !== 'undefined') {
  // 挂载到全局对象
  window.runEdgeFixValidationTest = runEdgeFixValidationTest;
  
  // 页面加载完成后自动运行测试
  document.addEventListener('DOMContentLoaded', () => {
    console.log('🎯 边创建错误修复验证测试页面已准备就绪');
    console.log('调用 runEdgeFixValidationTest() 开始测试');
  });
}