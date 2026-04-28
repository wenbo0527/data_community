/**
 * 统一布局引擎集成测试
 * 验证UnifiedLayoutEngine的功能完整性
 */

import { UnifiedLayoutEngine } from './UnifiedLayoutEngine.js';

/**
 * 统一布局引擎测试类
 */
class UnifiedLayoutEngineTest {
  constructor() {
    this.testResults = [];
    this.mockGraph = this.createMockGraph();
    this.mockPreviewManager = this.createMockPreviewManager();
  }
  
  /**
   * 创建模拟图形对象
   */
  createMockGraph() {
    const nodes = [
      { id: 'start_node_1', getData: () => ({ type: 'start' }), getPosition: () => ({ x: 0, y: 0 }), setPosition: (x, y) => {} },
      { id: 'node_2', getData: () => ({ type: 'process' }), getPosition: () => ({ x: 0, y: 0 }), setPosition: (x, y) => {} },
      { id: 'node_3', getData: () => ({ type: 'process' }), getPosition: () => ({ x: 0, y: 0 }), setPosition: (x, y) => {} },
      { id: 'end_node_4', getData: () => ({ type: 'end' }), getPosition: () => ({ x: 0, y: 0 }), setPosition: (x, y) => {} }
    ];
    
    const edges = [
      { id: 'edge_1', getSourceCellId: () => 'start_node_1', getTargetCellId: () => 'node_2', getData: () => ({}) },
      { id: 'edge_2', getSourceCellId: () => 'node_2', getTargetCellId: () => 'node_3', getData: () => ({}) },
      { id: 'edge_3', getSourceCellId: () => 'node_3', getTargetCellId: () => 'end_node_4', getData: () => ({}) }
    ];
    
    return {
      getCells: () => [...nodes, ...edges],
      getNodes: () => nodes,
      getEdges: () => edges,
      getCellById: (id) => [...nodes, ...edges].find(cell => cell.id === id),
      getIncomingEdges: (nodeId) => edges.filter(edge => edge.getTargetCellId() === nodeId),
      getOutgoingEdges: (nodeId) => edges.filter(edge => edge.getSourceCellId() === nodeId),
      trigger: (event, data) => console.log(`Graph event: ${event}`, data)
    };
  }
  
  /**
   * 创建模拟预览线管理器
   */
  createMockPreviewManager() {
    return {
      clearAllPreviewLines: async () => {

        return true;
      },
      verifyCleanup: async () => {

        return true;
      }
    };
  }
  
  /**
   * 记录测试结果
   */
  recordTest(name, passed, error = null) {
    this.testResults.push({
      name,
      passed,
      error,
      timestamp: Date.now()
    });
    
    const status = passed ? '✅' : '❌';
    const errorMsg = error ? ` - ${error}` : '';

  }
  
  /**
   * 运行所有测试
   */
  async runAllTests() {

    try {
      // 测试1：引擎初始化
      await this.testEngineInitialization();
      
      // 测试2：模块状态检查
      await this.testModuleStatus();
      
      // 测试3：布局执行
      await this.testLayoutExecution();
      
      // 测试4：性能报告
      await this.testPerformanceReport();
      
      // 测试5：图形更新
      await this.testGraphUpdate();
      
      // 测试6：预览管理器更新
      await this.testPreviewManagerUpdate();
      
      // 测试7：防抖执行
      await this.testDebouncedExecution();
      
      // 测试8：资源清理
      await this.testDispose();
      
    } catch (error) {

      this.recordTest('测试执行', false, error.message);
    }
    
    // 输出测试结果
    this.printTestResults();
  }
  
  /**
   * 测试引擎初始化
   */
  async testEngineInitialization() {
    try {
      const engine = new UnifiedLayoutEngine(this.mockGraph, {}, this.mockPreviewManager);
      this.recordTest('引擎初始化', !!engine && engine.isInitialized);
      this.engine = engine; // 保存引擎实例供后续测试使用
    } catch (error) {
      this.recordTest('引擎初始化', false, error.message);
    }
  }
  
  /**
   * 测试模块状态
   */
  async testModuleStatus() {
    try {
      if (!this.engine) {
        this.recordTest('模块状态检查', false, '引擎未初始化');
        return;
      }
      
      const status = this.engine.getModuleStatus();
      const allModulesLoaded = status.initialized && 
        Object.values(status.modules).every(loaded => loaded) &&
        Object.values(status.performance).every(loaded => loaded);
      
      this.recordTest('模块状态检查', allModulesLoaded);
    } catch (error) {
      this.recordTest('模块状态检查', false, error.message);
    }
  }
  
  /**
   * 测试布局执行
   */
  async testLayoutExecution() {
    try {
      if (!this.engine) {
        this.recordTest('布局执行', false, '引擎未初始化');
        return;
      }
      
      const result = await this.engine.executeLayout();
      if (result && result.success === true) {
        this.recordTest('布局执行', true);
      } else {
        // 输出详细的失败信息
        const errorMsg = result ? 
          `执行失败: ${result.error || result.reason || '未知原因'}, 阶段: ${result.stage || '未知'}` : 
          '返回结果为空';

        this.recordTest('布局执行', false, errorMsg);
      }
    } catch (error) {
      this.recordTest('布局执行', false, error.message);
    }
  }
  
  /**
   * 测试性能报告
   */
  async testPerformanceReport() {
    try {
      if (!this.engine) {
        this.recordTest('性能报告', false, '引擎未初始化');
        return;
      }
      
      const report = this.engine.getPerformanceReport();
      const hasRequiredFields = report && 
        report.monitor && 
        report.cache && 
        report.lock !== undefined;
      
      this.recordTest('性能报告', hasRequiredFields);
    } catch (error) {
      this.recordTest('性能报告', false, error.message);
    }
  }
  
  /**
   * 测试图形更新
   */
  async testGraphUpdate() {
    try {
      if (!this.engine) {
        this.recordTest('图形更新', false, '引擎未初始化');
        return;
      }
      
      const newGraph = this.createMockGraph();
      this.engine.updateGraph(newGraph);
      this.recordTest('图形更新', true);
    } catch (error) {
      this.recordTest('图形更新', false, error.message);
    }
  }
  
  /**
   * 测试预览管理器更新
   */
  async testPreviewManagerUpdate() {
    try {
      if (!this.engine) {
        this.recordTest('预览管理器更新', false, '引擎未初始化');
        return;
      }
      
      const newPreviewManager = this.createMockPreviewManager();
      this.engine.updatePreviewManager(newPreviewManager);
      this.recordTest('预览管理器更新', true);
    } catch (error) {
      this.recordTest('预览管理器更新', false, error.message);
    }
  }
  
  /**
   * 测试防抖执行
   */
  async testDebouncedExecution() {
    try {
      if (!this.engine) {
        this.recordTest('防抖执行', false, '引擎未初始化');
        return;
      }
      
      const debouncedFn = this.engine.debouncedExecuteLayout();
      this.recordTest('防抖执行', typeof debouncedFn === 'function');
    } catch (error) {
      this.recordTest('防抖执行', false, error.message);
    }
  }
  
  /**
   * 测试资源清理
   */
  async testDispose() {
    try {
      if (!this.engine) {
        this.recordTest('资源清理', false, '引擎未初始化');
        return;
      }
      
      this.engine.dispose();
      this.recordTest('资源清理', !this.engine.isInitialized);
    } catch (error) {
      this.recordTest('资源清理', false, error.message);
    }
  }
  
  /**
   * 打印测试结果
   */
  printTestResults() {

    const passed = this.testResults.filter(test => test.passed).length;
    const total = this.testResults.length;
    const passRate = total > 0 ? ((passed / total) * 100).toFixed(1) : 0;




    if (passed === total) {

    } else {

      // 显示失败的测试
      const failedTests = this.testResults.filter(test => !test.passed);
      if (failedTests.length > 0) {

        failedTests.forEach(test => {

        });
      }
    }

    console.log(JSON.stringify(this.testResults, null, 2));
  }
}

// 运行测试
if (import.meta.url === `file://${process.argv[1]}`) {
  const test = new UnifiedLayoutEngineTest();
  test.runAllTests().catch(console.error);
}

export { UnifiedLayoutEngineTest };
export default UnifiedLayoutEngineTest;