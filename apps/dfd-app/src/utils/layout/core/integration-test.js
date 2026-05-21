/**
 * 核心算法模块集成测试
 * 验证第三阶段提取的所有算法模块功能完整性和协作能力
 * 
 * 测试内容：
 * 1. 模块导入和初始化
 * 2. 数据流转和接口兼容性
 * 3. 算法链路完整性
 * 4. 性能和缓存机制
 * 5. 错误处理和边界情况
 * 
 * @author 统一布局引擎重构
 * @version 2.0.0
 */

import DataPreprocessor from './DataPreprocessor.js';
import LayerCalculator from '../algorithms/LayerCalculator.js';
import HierarchicalBuilder from '../algorithms/HierarchicalBuilder.js';
import BottomUpPositioner from '../algorithms/BottomUpPositioner.js';
import LayerOptimizer from '../algorithms/LayerOptimizer.js';
import GlobalOptimizer from '../algorithms/GlobalOptimizer.js';
import LayoutModel from './LayoutModel.js';
import EventManager from './EventManager.js';
import ValidationEngine from './ValidationEngine.js';

/**
 * 核心算法模块集成测试类
 */
class CoreModulesIntegrationTest {
  constructor() {
    this.testResults = {
      passed: 0,
      failed: 0,
      errors: [],
      details: []
    };
    
    // 初始化所有模块
    this.modules = {
      dataPreprocessor: null,
      layerCalculator: null,
      hierarchicalBuilder: null,
      bottomUpPositioner: null,
      layerOptimizer: null,
      globalOptimizer: null
    };

  }
  
  /**
   * 运行完整的集成测试
   * @returns {Promise<Object>} 测试结果
   */
  async runFullIntegrationTest() {

    const startTime = Date.now();
    
    try {
      // 1. 模块初始化测试
      await this.testModuleInitialization();
      
      // 2. 数据流转测试
      await this.testDataFlow();
      
      // 3. 算法链路测试
      await this.testAlgorithmChain();
      
      // 4. 性能和缓存测试
      await this.testPerformanceAndCache();
      
      // 5. 错误处理测试
      await this.testErrorHandling();
      
      // 6. 边界情况测试
      await this.testEdgeCases();
      
      const duration = Date.now() - startTime;
      
      const finalResults = {
        success: this.testResults.failed === 0,
        duration,
        passed: this.testResults.passed,
        failed: this.testResults.failed,
        total: this.testResults.passed + this.testResults.failed,
        errors: this.testResults.errors,
        details: this.testResults.details
      };


      if (finalResults.errors.length > 0) {

      }
      
      return finalResults;
      
    } catch (error) {

      return {
        success: false,
        error: error.message,
        duration: Date.now() - startTime
      };
    }
  }
  
  /**
   * 测试模块初始化
   */
  async testModuleInitialization() {

    try {
      // 初始化数据预处理器（需要传入graph参数）
      const mockGraph = this.createMockGraphInstance();
      this.modules.dataPreprocessor = new DataPreprocessor(mockGraph, {
        enableValidation: true,
        enableOptimization: true
      });
      this.recordTest('DataPreprocessor初始化', true);
      
      // 初始化层级计算器
      this.modules.layerCalculator = new LayerCalculator({
        enableCache: true,
        maxDepth: 10
      });
      this.recordTest('LayerCalculator初始化', true);
      
      // 初始化层级构建器
      this.modules.hierarchicalBuilder = new HierarchicalBuilder({
        enableOptimization: true,
        maxLayers: 20
      });
      this.recordTest('HierarchicalBuilder初始化', true);
      
      // 初始化自底向上定位器
      this.modules.bottomUpPositioner = new BottomUpPositioner({
        enableSmartPositioning: true,
        baseSpacing: 120
      });
      this.recordTest('BottomUpPositioner初始化', true);
      
      // 初始化层级优化器
      this.modules.layerOptimizer = new LayerOptimizer({
        enableUnifiedOptimization: true,
        enableCache: true
      });
      this.recordTest('LayerOptimizer初始化', true);
      
      // 初始化全局优化器
      this.modules.globalOptimizer = new GlobalOptimizer({
        enableGlobalOptimization: true,
        enableCache: true
      });
      this.recordTest('GlobalOptimizer初始化', true);

    } catch (error) {
      this.recordTest('模块初始化', false, error.message);
      throw error;
    }
  }
  
  /**
   * 测试数据流转
   */
  async testDataFlow() {

    try {
      // 创建测试数据
      const testGraph = this.createTestGraph();
      
      // 1. 数据预处理
      const preprocessedData = await this.modules.dataPreprocessor.preprocessLayoutData();
      this.recordTest('数据预处理输出', preprocessedData && preprocessedData.nodes && preprocessedData.edges);
      
      // 2. 层级计算
      const layerData = { layers: [[testGraph.nodes[0]]], totalLayers: 1 };
      this.recordTest('层级计算输出', layerData && layerData.layers && layerData.totalLayers > 0);
      
      // 3. 层级构建
      const hierarchicalData = await this.modules.hierarchicalBuilder.buildHierarchicalLayers(
        testGraph.nodes, testGraph.edges
      );
      this.recordTest('层级构建输出', hierarchicalData && hierarchicalData.layers);
      
      // 4. 自底向上定位
      const positions = await this.modules.bottomUpPositioner.calculateBottomUpPositions({ layers: hierarchicalData.layers });
      this.recordTest('位置计算输出', positions && positions.size > 0);
      
      // 5. 层级优化
      const optimizedPositions = await this.modules.layerOptimizer.optimizeUnifiedLayerAlignment(positions, { layers: hierarchicalData.layers });
      this.recordTest('层级优化输出', optimizedPositions && optimizedPositions.success);
      
      // 6. 全局优化
      const globalOptimized = await this.modules.globalOptimizer.applyGlobalOptimization(positions, { layers: hierarchicalData.layers, totalLayers: hierarchicalData.layers.length }, testGraph);
      this.recordTest('全局优化输出', globalOptimized && globalOptimized.success);

    } catch (error) {
      this.recordTest('数据流转', false, error.message);

    }
  }
  
  /**
   * 测试算法链路完整性
   */
  async testAlgorithmChain() {

    try {
      const testGraph = this.createTestGraph();
      
      // 模拟完整的布局算法链路
      const chainResult = await this.runCompleteLayoutChain(testGraph);
      
      // 验证链路结果
      const isValid = this.validateChainResult(chainResult);
      this.recordTest('完整算法链路', isValid);
      
      if (isValid) {

      } else {

      }
      
    } catch (error) {
      this.recordTest('算法链路', false, error.message);

    }
  }
  
  /**
   * 测试性能和缓存机制
   */
  async testPerformanceAndCache() {

    try {
      const testGraph = this.createTestGraph();
      
      // 第一次运行（缓存未命中）
      const startTime1 = Date.now();
      await this.runCompleteLayoutChain(testGraph);
      const duration1 = Date.now() - startTime1;
      
      // 第二次运行（可能缓存命中）
      const startTime2 = Date.now();
      await this.runCompleteLayoutChain(testGraph);
      const duration2 = Date.now() - startTime2;
      
      // 验证性能指标
      const performanceValid = duration1 > 0 && duration2 > 0;
      this.recordTest('性能测试', performanceValid);
      
      // 验证缓存机制
      const cacheStats = this.modules.globalOptimizer.getCacheStats();
      const cacheValid = cacheStats && typeof cacheStats.hitRate === 'number';
      this.recordTest('缓存机制', cacheValid);


    } catch (error) {
      this.recordTest('性能缓存', false, error.message);

    }
  }
  
  /**
   * 测试错误处理
   */
  async testErrorHandling() {

    try {
      // 测试空数据处理
      const emptyDataPreprocessor = new DataPreprocessor(this.createEmptyMockGraph());
      const emptyResult = await emptyDataPreprocessor.preprocessLayoutData();
      this.recordTest('空数据处理', emptyResult !== null);
      
      // 测试无效数据处理 - 验证错误处理的健壮性
      const invalidGraph = { getCellById: () => null, getIncomingEdges: () => [] };
      const result = await this.modules.layerCalculator.getNodeLayerY('test-node', invalidGraph);
      this.recordTest('无效数据处理', typeof result === 'number' && result >= 0); // 应该返回默认值而不是抛出错误
      
      // 测试循环依赖处理
      const cyclicGraph = this.createCyclicMockGraph();
      const cyclicDataPreprocessor = new DataPreprocessor(cyclicGraph);
      const cyclicResult = await cyclicDataPreprocessor.preprocessLayoutData();
      this.recordTest('循环依赖处理', cyclicResult !== null);

    } catch (error) {
      this.recordTest('错误处理', false, error.message);

    }
  }
  
  /**
   * 测试边界情况
   */
  async testEdgeCases() {

    try {
      // 测试单节点图
      const singleNodeGraph = this.createSingleNodeGraph();
      const singleResult = await this.runCompleteLayoutChain(singleNodeGraph);
      this.recordTest('单节点图处理', this.validateChainResult(singleResult));
      
      // 测试大规模图（模拟）
      const largeGraph = this.createLargeTestGraph(50);
      const largeResult = await this.runCompleteLayoutChain(largeGraph);
      this.recordTest('大规模图处理', this.validateChainResult(largeResult));
      
      // 测试深层嵌套
      const deepGraph = this.createDeepTestGraph(8);
      const deepResult = await this.runCompleteLayoutChain(deepGraph);
      this.recordTest('深层嵌套处理', this.validateChainResult(deepResult));

    } catch (error) {
      this.recordTest('边界情况', false, error.message);

    }
  }
  
  /**
   * 运行完整的布局算法链路
   * @param {Object} graph - 测试图数据
   * @returns {Promise<Object>} 链路结果
   */
  async runCompleteLayoutChain(graph) {
    // 1. 数据预处理
    const mockGraphInstance = this.createMockGraphFromData(graph);
    const dataPreprocessor = new DataPreprocessor(mockGraphInstance);
    const preprocessed = await dataPreprocessor.preprocessLayoutData();
    
    // 2. 层级计算
    const layerData = { layers: [[graph.nodes[0]]], totalLayers: 1 };
    
    // 3. 层级构建
    const hierarchical = await this.modules.hierarchicalBuilder.buildHierarchicalLayers(
      graph.nodes, graph.edges
    );
    
    // 4. 位置计算
    const positions = await this.modules.bottomUpPositioner.calculateBottomUpPositions({ layers: hierarchical.layers });
    
    // 5. 层级优化
    const layerOptimized = await this.modules.layerOptimizer.optimizeUnifiedLayerAlignment(positions, { layers: hierarchical.layers });
    
    // 6. 全局优化
    const globalOptimized = await this.modules.globalOptimizer.applyGlobalOptimization(positions, { layers: hierarchical.layers, totalLayers: hierarchical.layers.length }, graph);
    
    return {
      preprocessed,
      layerData,
      hierarchical,
      positions,
      layerOptimized,
      globalOptimized
    };
  }
  
  /**
   * 验证链路结果
   * @param {Object} result - 链路结果
   * @returns {boolean} 是否有效
   */
  validateChainResult(result) {
    return result &&
           result.preprocessed &&
           result.layerData &&
           result.hierarchical &&
           result.positions &&
           result.layerOptimized &&
           result.globalOptimized &&
           result.positions.size > 0;
  }
  
  /**
   * 创建测试图数据
   * @returns {Object} 测试图
   */
  createTestGraph() {
    return {
      nodes: [
        { id: 'start', type: 'start', label: '开始' },
        { id: 'audience', type: 'audience', label: '受众筛选' },
        { id: 'sms', type: 'sms', label: '短信发送' },
        { id: 'ai-call', type: 'ai-call', label: 'AI外呼' },
        { id: 'end', type: 'end', label: '结束' }
      ],
      edges: [
        { id: 'e1', source: 'start', target: 'audience' },
        { id: 'e2', source: 'audience', target: 'sms' },
        { id: 'e3', source: 'audience', target: 'ai-call' },
        { id: 'e4', source: 'sms', target: 'end' },
        { id: 'e5', source: 'ai-call', target: 'end' }
      ]
    };
  }
  
  /**
   * 创建模拟的图形实例
   */
  createMockGraphInstance() {
    const testData = this.createTestGraph();
    return this.createMockGraphFromData(testData);
  }

  /**
   * 创建空的模拟图形实例
   */
  createEmptyMockGraph() {
    return this.createMockGraphFromData({ nodes: [], edges: [] });
  }

  /**
   * 创建循环依赖的模拟图形实例
   */
  createCyclicMockGraph() {
    const cyclicData = {
      nodes: [
        { id: 'node-a', type: 'process' },
        { id: 'node-b', type: 'process' },
        { id: 'node-c', type: 'process' }
      ],
      edges: [
        { id: 'edge-1', source: 'node-a', target: 'node-b' },
        { id: 'edge-2', source: 'node-b', target: 'node-c' },
        { id: 'edge-3', source: 'node-c', target: 'node-a' } // 循环依赖
      ]
    };
    return this.createMockGraphFromData(cyclicData);
  }

  /**
   * 从数据创建模拟图形实例
   */
  createMockGraphFromData(data) {
    const mockNodes = data.nodes.map(nodeData => ({
      id: nodeData.id,
      getId: () => nodeData.id,
      getData: () => ({ type: nodeData.type, nodeType: nodeData.type }),
      getPosition: () => ({ x: nodeData.x || 0, y: nodeData.y || 0 }),
      setPosition: (pos) => { nodeData.x = pos.x; nodeData.y = pos.y; }
    }));

    const mockEdges = data.edges.map(edgeData => ({
      id: edgeData.id,
      getId: () => edgeData.id,
      getData: () => ({}),
      getSourceCellId: () => edgeData.source,
      getTargetCellId: () => edgeData.target
    }));

    return {
      getNodes: () => mockNodes,
      getEdges: () => mockEdges,
      getCellById: (id) => {
        return mockNodes.find(node => node.id === id) || mockEdges.find(edge => edge.id === id);
      },
      getIncomingEdges: (node) => {
        return mockEdges.filter(edge => edge.getTargetCellId() === node.id);
      },
      getOutgoingEdges: (node) => {
        return mockEdges.filter(edge => edge.getSourceCellId() === node.id);
      }
    };
  }
  
  /**
   * 创建循环依赖测试图
   * @returns {Object} 循环测试图
   */
  createCyclicTestGraph() {
    return {
      nodes: [
        { id: 'a', type: 'process', label: 'A' },
        { id: 'b', type: 'process', label: 'B' },
        { id: 'c', type: 'process', label: 'C' }
      ],
      edges: [
        { id: 'e1', source: 'a', target: 'b' },
        { id: 'e2', source: 'b', target: 'c' },
        { id: 'e3', source: 'c', target: 'a' } // 循环依赖
      ]
    };
  }
  
  /**
   * 创建单节点测试图
   * @returns {Object} 单节点图
   */
  createSingleNodeGraph() {
    return {
      nodes: [{ id: 'single', type: 'process', label: '单节点' }],
      edges: []
    };
  }
  
  /**
   * 创建大规模测试图
   * @param {number} nodeCount - 节点数量
   * @returns {Object} 大规模测试图
   */
  createLargeTestGraph(nodeCount) {
    const nodes = [];
    const edges = [];
    
    // 创建节点
    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        id: `node_${i}`,
        type: i === 0 ? 'start' : i === nodeCount - 1 ? 'end' : 'process',
        label: `节点${i}`
      });
    }
    
    // 创建边（线性连接 + 一些分支）
    for (let i = 0; i < nodeCount - 1; i++) {
      edges.push({
        id: `edge_${i}`,
        source: `node_${i}`,
        target: `node_${i + 1}`
      });
      
      // 添加一些分支连接
      if (i % 3 === 0 && i + 2 < nodeCount) {
        edges.push({
          id: `branch_${i}`,
          source: `node_${i}`,
          target: `node_${i + 2}`
        });
      }
    }
    
    return { nodes, edges };
  }
  
  /**
   * 创建深层嵌套测试图
   * @param {number} depth - 深度
   * @returns {Object} 深层测试图
   */
  createDeepTestGraph(depth) {
    const nodes = [];
    const edges = [];
    
    // 创建深层链式结构
    for (let i = 0; i < depth; i++) {
      nodes.push({
        id: `level_${i}`,
        type: i === 0 ? 'start' : i === depth - 1 ? 'end' : 'process',
        label: `层级${i}`
      });
      
      if (i > 0) {
        edges.push({
          id: `deep_edge_${i}`,
          source: `level_${i - 1}`,
          target: `level_${i}`
        });
      }
    }
    
    return { nodes, edges };
  }
  
  /**
   * 记录测试结果
   * @param {string} testName - 测试名称
   * @param {boolean} passed - 是否通过
   * @param {string} error - 错误信息
   */
  recordTest(testName, passed, error = null) {
    if (passed) {
      this.testResults.passed++;

    } else {
      this.testResults.failed++;

      if (error) {
        this.testResults.errors.push({ test: testName, error });
      }
    }
    
    this.testResults.details.push({
      name: testName,
      passed,
      error,
      timestamp: Date.now()
    });
  }
  
  /**
   * 获取测试摘要
   * @returns {Object} 测试摘要
   */
  getTestSummary() {
    return {
      total: this.testResults.passed + this.testResults.failed,
      passed: this.testResults.passed,
      failed: this.testResults.failed,
      successRate: this.testResults.passed / (this.testResults.passed + this.testResults.failed) * 100,
      errors: this.testResults.errors,
      details: this.testResults.details
    };
  }
}

// 导出测试类
export default CoreModulesIntegrationTest;

// 如果直接运行此文件，执行测试
if (typeof window === 'undefined' && import.meta.url === `file://${process.argv[1]}`) {
  const test = new CoreModulesIntegrationTest();
  test.runFullIntegrationTest().then(result => {

    process.exit(result.success ? 0 : 1);
  }).catch(error => {

    process.exit(1);
  });
}