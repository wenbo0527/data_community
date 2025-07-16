/**
 * 连接预览管理器测试工具
 */

/**
 * 模拟节点对象
 */
export function createMockNode(id, type = 'default', position = { x: 0, y: 0 }, size = { width: 100, height: 50 }) {
  return {
    id,
    getData: () => ({ type, nodeType: type }),
    getPosition: () => position,
    getSize: () => size,
    setPosition: (pos) => Object.assign(position, pos),
    setSize: (s) => Object.assign(size, s)
  };
}

/**
 * 模拟图形对象
 */
export function createMockGraph() {
  const nodes = new Map();
  const edges = new Map();
  const eventListeners = new Map();

  return {
    nodes,
    edges,
    eventListeners,
    
    addNode: (nodeConfig) => {
      const node = { id: `node_${Date.now()}`, ...nodeConfig };
      nodes.set(node.id, node);
      return node;
    },
    
    addEdge: (edgeConfig) => {
      const edge = { id: `edge_${Date.now()}`, ...edgeConfig };
      edges.set(edge.id, edge);
      return edge;
    },
    
    removeCell: (cell) => {
      if (nodes.has(cell.id)) {
        nodes.delete(cell.id);
      }
      if (edges.has(cell.id)) {
        edges.delete(cell.id);
      }
    },
    
    hasCell: (cell) => {
      return nodes.has(cell.id) || edges.has(cell.id);
    },
    
    getNodes: () => Array.from(nodes.values()),
    
    getEdges: () => Array.from(edges.values()),
    
    on: (event, handler) => {
      if (!eventListeners.has(event)) {
        eventListeners.set(event, []);
      }
      eventListeners.get(event).push(handler);
    },
    
    off: (event, handler) => {
      if (eventListeners.has(event)) {
        const handlers = eventListeners.get(event);
        const index = handlers.indexOf(handler);
        if (index > -1) {
          handlers.splice(index, 1);
        }
      }
    },
    
    trigger: (event, data) => {
      if (eventListeners.has(event)) {
        eventListeners.get(event).forEach(handler => handler(data));
      }
    }
  };
}

/**
 * 模拟分支管理器
 */
export function createMockBranchManager() {
  const branches = new Map();
  
  return {
    getNodeBranches: (node) => {
      return branches.get(node.id) || [
        { id: 'branch1', label: '分支1' },
        { id: 'branch2', label: '分支2' }
      ];
    },
    
    setNodeBranches: (nodeId, branchList) => {
      branches.set(nodeId, branchList);
    },
    
    isSimplifiedMode: () => true,
    
    togglePortMode: () => {}
  };
}

/**
 * 测试场景生成器
 */
export class TestScenarioGenerator {
  constructor() {
    this.scenarios = [];
  }

  /**
   * 生成基本连接测试场景
   */
  generateBasicConnectionScenario() {
    const graph = createMockGraph();
    const branchManager = createMockBranchManager();
    
    const sourceNode = createMockNode('source1', 'audience-split', { x: 100, y: 100 });
    const targetNode = createMockNode('target1', 'default', { x: 300, y: 100 });
    
    graph.nodes.set(sourceNode.id, sourceNode);
    graph.nodes.set(targetNode.id, targetNode);
    
    return {
      name: '基本连接测试',
      graph,
      branchManager,
      nodes: [sourceNode, targetNode],
      expectedPreviews: 2 // 分支节点应该有2个预览线
    };
  }

  /**
   * 生成拖拽吸附测试场景
   */
  generateDragSnapScenario() {
    const graph = createMockGraph();
    const branchManager = createMockBranchManager();
    
    const sourceNode = createMockNode('source1', 'default', { x: 100, y: 100 });
    const targetNode = createMockNode('target1', 'default', { x: 200, y: 120 }); // 在吸附范围内
    
    graph.nodes.set(sourceNode.id, sourceNode);
    graph.nodes.set(targetNode.id, targetNode);
    
    return {
      name: '拖拽吸附测试',
      graph,
      branchManager,
      dragNode: targetNode,
      snapTarget: sourceNode,
      expectedSnap: true
    };
  }

  /**
   * 生成性能压力测试场景
   */
  generatePerformanceTestScenario(nodeCount = 100) {
    const graph = createMockGraph();
    const branchManager = createMockBranchManager();
    const nodes = [];
    
    for (let i = 0; i < nodeCount; i++) {
      const node = createMockNode(
        `node_${i}`,
        i % 3 === 0 ? 'audience-split' : 'default',
        { x: (i % 10) * 150, y: Math.floor(i / 10) * 100 }
      );
      nodes.push(node);
      graph.nodes.set(node.id, node);
    }
    
    return {
      name: `性能压力测试 (${nodeCount}个节点)`,
      graph,
      branchManager,
      nodes,
      expectedPreviews: nodeCount // 每个节点至少一个预览线
    };
  }

  getAllScenarios() {
    return [
      this.generateBasicConnectionScenario(),
      this.generateDragSnapScenario(),
      this.generatePerformanceTestScenario(50),
      this.generatePerformanceTestScenario(100)
    ];
  }
}

/**
 * 测试断言工具
 */
export class TestAssertions {
  static assertEqual(actual, expected, message = '') {
    if (actual !== expected) {
      throw new Error(`断言失败 ${message}: 期望 ${expected}, 实际 ${actual}`);
    }
  }

  static assertTrue(condition, message = '') {
    if (!condition) {
      throw new Error(`断言失败 ${message}: 期望为真`);
    }
  }

  static assertNotNull(value, message = '') {
    if (value === null || value === undefined) {
      throw new Error(`断言失败 ${message}: 值不应为空`);
    }
  }

  static assertArrayLength(array, expectedLength, message = '') {
    if (!Array.isArray(array) || array.length !== expectedLength) {
      throw new Error(`断言失败 ${message}: 期望数组长度 ${expectedLength}, 实际 ${array?.length || 'undefined'}`);
    }
  }

  static assertMapSize(map, expectedSize, message = '') {
    if (!(map instanceof Map) || map.size !== expectedSize) {
      throw new Error(`断言失败 ${message}: 期望Map大小 ${expectedSize}, 实际 ${map?.size || 'undefined'}`);
    }
  }
}

/**
 * 测试运行器
 */
export class TestRunner {
  constructor() {
    this.tests = [];
    this.results = [];
  }

  addTest(name, testFn) {
    this.tests.push({ name, testFn });
  }

  async runAll() {
    console.log('🧪 开始运行连接预览管理器测试...');
    
    for (const test of this.tests) {
      try {
        const startTime = performance.now();
        await test.testFn();
        const duration = performance.now() - startTime;
        
        this.results.push({
          name: test.name,
          status: 'passed',
          duration: duration.toFixed(2)
        });
        
        console.log(`✅ ${test.name} - 通过 (${duration.toFixed(2)}ms)`);
      } catch (error) {
        this.results.push({
          name: test.name,
          status: 'failed',
          error: error.message
        });
        
        console.error(`❌ ${test.name} - 失败: ${error.message}`);
      }
    }
    
    this.printSummary();
  }

  printSummary() {
    const passed = this.results.filter(r => r.status === 'passed').length;
    const failed = this.results.filter(r => r.status === 'failed').length;
    
    console.log('\n📊 测试结果汇总:');
    console.log(`✅ 通过: ${passed}`);
    console.log(`❌ 失败: ${failed}`);
    console.log(`📈 成功率: ${((passed / this.results.length) * 100).toFixed(1)}%`);
  }
}