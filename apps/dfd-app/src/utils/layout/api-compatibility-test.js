/**
 * API兼容性测试
 * 验证新的UnifiedLayoutEngine与原始UnifiedStructuredLayoutEngine的API兼容性
 */

import { UnifiedLayoutEngine } from './UnifiedLayoutEngine.js';
import { UnifiedStructuredLayoutEngine } from '../UnifiedStructuredLayoutEngine.js';

/**
 * 模拟图实例
 */
class MockGraph {
  constructor() {
    this.nodes = [];
    this.edges = [];
  }
  
  getNodes() {
    return this.nodes;
  }
  
  getEdges() {
    return this.edges;
  }
  
  getCells() {
    return [...this.nodes, ...this.edges];
  }
}

/**
 * 模拟预览线管理器
 */
class MockPreviewLineManager {
  constructor() {
    this.layoutEngine = null;
    this.layoutEngineReady = false;
  }
  
  setLayoutEngine(engine) {
    this.layoutEngine = engine;
  }
  
  processPendingCalculations() {

  }
}

/**
 * API兼容性测试套件
 */
class APICompatibilityTest {
  constructor() {
    this.testResults = [];
    this.mockGraph = new MockGraph();
    this.mockPreviewManager = new MockPreviewLineManager();
  }
  
  /**
   * 运行所有兼容性测试
   */
  async runAllTests() {

    // 测试构造函数兼容性
    await this.testConstructorCompatibility();
    
    // 测试核心方法兼容性
    await this.testCoreMethodsCompatibility();
    
    // 测试配置选项兼容性
    await this.testOptionsCompatibility();
    
    // 测试返回值兼容性
    await this.testReturnValueCompatibility();
    
    // 输出测试结果
    this.printTestResults();
    
    return this.testResults;
  }
  
  /**
   * 测试构造函数兼容性
   */
  async testConstructorCompatibility() {

    try {
      // 测试基本构造
      const originalEngine = new UnifiedStructuredLayoutEngine(this.mockGraph);
      const newEngine = new UnifiedLayoutEngine(this.mockGraph);
      
      this.addTestResult('构造函数基本调用', true, null);
      
      // 测试带选项构造
      const options = {
        layer: { baseHeight: 200 },
        node: { minSpacing: 100 },
        optimization: { enableGlobalOptimization: true }
      };
      
      const originalEngineWithOptions = new UnifiedStructuredLayoutEngine(this.mockGraph, options);
      const newEngineWithOptions = new UnifiedLayoutEngine(this.mockGraph, options);
      
      this.addTestResult('构造函数带选项调用', true, null);
      
      // 测试带预览管理器构造
      const originalEngineWithPreview = new UnifiedStructuredLayoutEngine(
        this.mockGraph, 
        options, 
        this.mockPreviewManager
      );
      const newEngineWithPreview = new UnifiedLayoutEngine(
        this.mockGraph, 
        options, 
        this.mockPreviewManager
      );
      
      this.addTestResult('构造函数带预览管理器调用', true, null);
      
    } catch (error) {
      this.addTestResult('构造函数兼容性', false, error.message);
    }
  }
  
  /**
   * 测试核心方法兼容性
   */
  async testCoreMethodsCompatibility() {

    try {
      const originalEngine = new UnifiedStructuredLayoutEngine(this.mockGraph);
      const newEngine = new UnifiedLayoutEngine(this.mockGraph);
      
      // 测试executeLayout方法
      const originalHasExecuteLayout = typeof originalEngine.executeLayout === 'function';
      const newHasExecuteLayout = typeof newEngine.executeLayout === 'function';
      
      this.addTestResult(
        'executeLayout方法存在性', 
        originalHasExecuteLayout && newHasExecuteLayout,
        originalHasExecuteLayout && newHasExecuteLayout ? null : 'executeLayout方法不存在'
      );
      
      // 测试updateGraph方法
      const originalHasUpdateGraph = typeof originalEngine.updateGraph === 'function';
      const newHasUpdateGraph = typeof newEngine.updateGraph === 'function';
      
      this.addTestResult(
        'updateGraph方法存在性',
        originalHasUpdateGraph && newHasUpdateGraph,
        originalHasUpdateGraph && newHasUpdateGraph ? null : 'updateGraph方法不存在'
      );
      
      // 测试updatePreviewManager方法
      const originalHasUpdatePreviewManager = typeof originalEngine.updatePreviewManager === 'function';
      const newHasUpdatePreviewManager = typeof newEngine.updatePreviewManager === 'function';
      
      this.addTestResult(
        'updatePreviewManager方法存在性',
        originalHasUpdatePreviewManager && newHasUpdatePreviewManager,
        originalHasUpdatePreviewManager && newHasUpdatePreviewManager ? null : 'updatePreviewManager方法不存在'
      );
      
      // 测试方法调用
      await this.testMethodCalls(originalEngine, newEngine);
      
    } catch (error) {
      this.addTestResult('核心方法兼容性', false, error.message);
    }
  }
  
  /**
   * 测试方法调用兼容性
   */
  async testMethodCalls(originalEngine, newEngine) {
    try {
      // 测试executeLayout调用
      const originalResult = await originalEngine.executeLayout();
      const newResult = await newEngine.executeLayout();
      
      const bothHaveSuccess = 'success' in originalResult && 'success' in newResult;
      this.addTestResult(
        'executeLayout返回结构兼容性',
        bothHaveSuccess,
        bothHaveSuccess ? null : '返回结构不兼容'
      );
      
      // 测试updateGraph调用
      const newMockGraph = new MockGraph();
      originalEngine.updateGraph(newMockGraph);
      newEngine.updateGraph(newMockGraph);
      
      this.addTestResult('updateGraph调用兼容性', true, null);
      
      // 测试updatePreviewManager调用
      const newMockPreviewManager = new MockPreviewLineManager();
      originalEngine.updatePreviewManager(newMockPreviewManager);
      newEngine.updatePreviewManager(newMockPreviewManager);
      
      this.addTestResult('updatePreviewManager调用兼容性', true, null);
      
    } catch (error) {
      this.addTestResult('方法调用兼容性', false, error.message);
    }
  }
  
  /**
   * 测试配置选项兼容性
   */
  async testOptionsCompatibility() {

    try {
      const testOptions = {
        layer: {
          baseHeight: 180,
          dynamicSpacing: true,
          maxLayers: 8
        },
        node: {
          minSpacing: 100,
          preferredSpacing: 150,
          maxSpacing: 250
        },
        optimization: {
          enableGlobalOptimization: true,
          maxIterations: 3,
          convergenceThreshold: 0.05
        },
        performance: {
          enableCaching: true,
          batchSize: 30
        }
      };
      
      const originalEngine = new UnifiedStructuredLayoutEngine(this.mockGraph, testOptions);
      const newEngine = new UnifiedLayoutEngine(this.mockGraph, testOptions);
      
      // 检查配置是否正确应用
      const originalHasOptions = originalEngine.options !== undefined;
      const newHasOptions = newEngine.layoutConfig !== undefined || newEngine.options !== undefined;
      
      this.addTestResult(
        '配置选项应用兼容性',
        originalHasOptions && newHasOptions,
        originalHasOptions && newHasOptions ? null : '配置选项未正确应用'
      );
      
    } catch (error) {
      this.addTestResult('配置选项兼容性', false, error.message);
    }
  }
  
  /**
   * 测试返回值兼容性
   */
  async testReturnValueCompatibility() {

    try {
      const originalEngine = new UnifiedStructuredLayoutEngine(this.mockGraph);
      const newEngine = new UnifiedLayoutEngine(this.mockGraph);
      
      const originalResult = await originalEngine.executeLayout();
      const newResult = await newEngine.executeLayout();
      
      // 检查基本返回结构
      const requiredFields = ['success'];
      const originalHasRequiredFields = requiredFields.every(field => field in originalResult);
      const newHasRequiredFields = requiredFields.every(field => field in newResult);
      
      this.addTestResult(
        '返回值结构兼容性',
        originalHasRequiredFields && newHasRequiredFields,
        originalHasRequiredFields && newHasRequiredFields ? null : '返回值结构不兼容'
      );
      
      // 检查成功状态类型
      const originalSuccessType = typeof originalResult.success;
      const newSuccessType = typeof newResult.success;
      
      this.addTestResult(
        '返回值类型兼容性',
        originalSuccessType === newSuccessType,
        originalSuccessType === newSuccessType ? null : `success字段类型不匹配: ${originalSuccessType} vs ${newSuccessType}`
      );
      
    } catch (error) {
      this.addTestResult('返回值兼容性', false, error.message);
    }
  }
  
  /**
   * 添加测试结果
   */
  addTestResult(testName, passed, error) {
    this.testResults.push({
      name: testName,
      passed,
      error,
      timestamp: Date.now()
    });
    
    const status = passed ? '✅' : '❌';
    const errorMsg = error ? ` (${error})` : '';

  }
  
  /**
   * 打印测试结果汇总
   */
  printTestResults() {
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(result => result.passed).length;
    const failedTests = totalTests - passedTests;
    const passRate = ((passedTests / totalTests) * 100).toFixed(1);





    if (failedTests > 0) {

      this.testResults
        .filter(result => !result.passed)
        .forEach(result => {

        });
    } else {

    }

    console.log(JSON.stringify(this.testResults, null, 2));
  }
}

/**
 * 运行API兼容性测试
 */
async function runAPICompatibilityTest() {
  const tester = new APICompatibilityTest();
  return await tester.runAllTests();
}

// 如果直接运行此文件，执行测试
if (import.meta.url === `file://${process.argv[1]}`) {
  runAPICompatibilityTest().catch(console.error);
}

export { APICompatibilityTest, runAPICompatibilityTest };