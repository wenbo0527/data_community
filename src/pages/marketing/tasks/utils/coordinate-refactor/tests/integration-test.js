/**
 * 坐标重构系统集成测试
 * 验证整个重构系统的功能和性能
 */

import { 
  CoordinateRefactorSystem,
  增强预览线管理器,
  PreviewLineType,
  PreviewLineState,
  LayerCalculationStrategies,
  DistributionAlgorithms
} from '../index.js';

/**
 * 集成测试类
 */
class CoordinateRefactorIntegrationTest {
  constructor() {
    this.testResults = [];
    this.startTime = Date.now();
  }

  /**
   * 运行所有测试
   */
  async runAllTests() {
    console.log('🧪 [坐标重构集成测试] 开始运行测试套件...\n');

    try {
      // 基础功能测试
      await this.testBasicCoordinateCalculation();
      await this.testValidationSystem();
      await this.testPositionApplication();
      await this.testSyncManager();

      // 预览线管理测试
      await this.testPreviewLineManager();
      await this.testBranchFlowIntegration();

      // 性能测试
      await this.testPerformance();

      // 错误处理测试
      await this.testErrorHandling();

      // 并发测试
      await this.testConcurrency();

      // 生成测试报告
      this.generateTestReport();

    } catch (error) {
      console.error('❌ [集成测试] 测试套件执行失败:', error);
    }
  }

  /**
   * 测试基础坐标计算
   */
  async testBasicCoordinateCalculation() {
    console.log('📐 测试基础坐标计算...');
    
    try {
      const system = new CoordinateRefactorSystem();
      
      // 构建测试数据
      const layers = [
        {
          id: 'layer_1',
          nodes: [
            { id: 'node_1', type: 'start', width: 100, height: 50 },
            { id: 'node_2', type: 'process', width: 120, height: 60 }
          ]
        },
        {
          id: 'layer_2',
          nodes: [
            { id: 'node_3', type: 'decision', width: 80, height: 80 },
            { id: 'node_4', type: 'process', width: 110, height: 55 }
          ]
        }
      ];

      // 测试不同策略
      const strategies = ['bottomUp', 'topDown', 'centerAlign', 'adaptive'];
      const algorithms = ['symmetric', 'goldenRatio', 'uniform', 'forceDirected'];

      for (const strategy of strategies) {
        for (const algorithm of algorithms) {
          const positions = await system.calculateOnly(layers, {
            strategy,
            algorithm,
            precision: 2
          });

          this.assert(
            positions.size === 4,
            `策略 ${strategy} + 算法 ${algorithm}: 应该计算出4个节点位置`
          );

          // 验证位置有效性
          for (const [nodeId, position] of positions) {
            this.assert(
              typeof position.x === 'number' && typeof position.y === 'number',
              `节点 ${nodeId} 位置应该是数字`
            );
          }
        }
      }

      this.recordTest('基础坐标计算', true, '所有策略和算法组合测试通过');

    } catch (error) {
      this.recordTest('基础坐标计算', false, error.message);
    }
  }

  /**
   * 测试验证系统
   */
  async testValidationSystem() {
    console.log('✅ 测试验证系统...');
    
    try {
      const system = new CoordinateRefactorSystem({
        enableValidation: true
      });

      // 构建包含问题的测试数据
      const layers = [
        {
          id: 'layer_1',
          nodes: [
            { id: 'node_1', type: 'start', width: 100, height: 50 },
            { id: 'node_2', type: 'process', width: 100, height: 50 }
          ]
        }
      ];

      const result = await system.calculateAndApply(layers, {
        strategy: 'adaptive',
        algorithm: 'symmetric',
        enableValidation: true
      });

      this.assert(
        result.success,
        '验证系统应该能够处理正常数据'
      );

      this.assert(
        result.validationReport && result.validationReport.isValid,
        '验证报告应该显示数据有效'
      );

      this.recordTest('验证系统', true, '验证功能正常工作');

    } catch (error) {
      this.recordTest('验证系统', false, error.message);
    }
  }

  /**
   * 测试位置应用
   */
  async testPositionApplication() {
    console.log('📍 测试位置应用...');
    
    try {
      const system = new CoordinateRefactorSystem();

      const layers = [
        {
          id: 'layer_1',
          nodes: [
            { id: 'node_1', type: 'start', width: 100, height: 50 }
          ]
        }
      ];

      // 测试不同应用策略
      const strategies = ['direct', 'batch', 'progressive'];

      for (const strategy of strategies) {
        const result = await system.calculateAndApply(layers, {
          applicationStrategy: strategy,
          batchSize: 2,
          progressiveSteps: 5
        });

        this.assert(
          result.success,
          `应用策略 ${strategy} 应该成功`
        );

        this.assert(
          result.applicationReport && result.applicationReport.appliedCount > 0,
          `应用策略 ${strategy} 应该应用至少一个位置`
        );
      }

      this.recordTest('位置应用', true, '所有应用策略测试通过');

    } catch (error) {
      this.recordTest('位置应用', false, error.message);
    }
  }

  /**
   * 测试同步管理器
   */
  async testSyncManager() {
    console.log('🔄 测试同步管理器...');
    
    try {
      const system = new CoordinateRefactorSystem();

      const layers = [
        {
          id: 'layer_1',
          nodes: [
            { id: 'node_1', type: 'start', width: 100, height: 50 },
            { id: 'node_2', type: 'process', width: 120, height: 60 }
          ]
        }
      ];

      // 测试同步操作
      const syncId = await system.sync(layers, {
        strategy: 'adaptive',
        algorithm: 'symmetric'
      });

      this.assert(
        typeof syncId === 'string',
        '同步操作应该返回同步ID'
      );

      // 等待同步完成
      let status = system.getSyncStatus(syncId);
      let attempts = 0;
      while (status.state !== 'completed' && status.state !== 'error' && attempts < 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        status = system.getSyncStatus(syncId);
        attempts++;
      }

      this.assert(
        status.state === 'completed',
        '同步操作应该成功完成'
      );

      this.recordTest('同步管理器', true, '同步功能正常工作');

    } catch (error) {
      this.recordTest('同步管理器', false, error.message);
    }
  }

  /**
   * 测试预览线管理器
   */
  async testPreviewLineManager() {
    console.log('🎯 测试预览线管理器...');
    
    try {
      const manager = new 增强预览线管理器({
        enableCoordinateRefactor: true,
        enablePreviewLineRefresh: true,
        enableBranchFlow: true,
        enableDebug: false
      });

      // 创建预览线
      const previewLine1 = manager.createPreviewLine(
        'preview_1',
        'node_1',
        'node_2',
        PreviewLineType.NORMAL,
        {
          position: { x1: 0, y1: 0, x2: 100, y2: 100 },
          style: { color: 'blue', width: 2 }
        }
      );

      this.assert(
        previewLine1.id === 'preview_1',
        '预览线应该正确创建'
      );

      // 更新预览线位置
      const updateResult = await manager.updatePreviewLinePosition(
        'preview_1',
        { x1: 10, y1: 10, x2: 110, y2: 110 },
        { useCoordinateRefactor: false }
      );

      this.assert(
        updateResult === true,
        '预览线位置应该成功更新'
      );

      // 获取预览线
      const allPreviewLines = manager.getAllPreviewLines();
      this.assert(
        allPreviewLines.length === 1,
        '应该有一条预览线'
      );

      // 删除预览线
      const deleteResult = manager.deletePreviewLine('preview_1');
      this.assert(
        deleteResult === true,
        '预览线应该成功删除'
      );

      // 清理
      manager.cleanup();

      this.recordTest('预览线管理器', true, '预览线管理功能正常');

    } catch (error) {
      this.recordTest('预览线管理器', false, error.message);
    }
  }

  /**
   * 测试分流集成
   */
  async testBranchFlowIntegration() {
    console.log('🌊 测试分流集成...');
    
    try {
      const manager = new 增强预览线管理器({
        enableBranchFlow: true,
        enableDebug: false
      });

      // 创建条件分支预览线
      const previewLine = manager.createPreviewLine(
        'conditional_preview',
        'node_1',
        'node_2',
        PreviewLineType.CONDITIONAL,
        {
          condition: 'value > 10',
          weight: 0.8,
          priority: 1
        }
      );

      this.assert(
        previewLine.metadata.branchId,
        '条件预览线应该创建对应的分支'
      );

      // 获取统计信息
      const stats = manager.getStatistics();
      this.assert(
        stats.branchFlowManager !== null,
        '应该包含分流管理器统计'
      );

      manager.cleanup();

      this.recordTest('分流集成', true, '分流集成功能正常');

    } catch (error) {
      this.recordTest('分流集成', false, error.message);
    }
  }

  /**
   * 测试性能
   */
  async testPerformance() {
    console.log('⚡ 测试性能...');
    
    try {
      const system = new CoordinateRefactorSystem({
        enablePerformanceTracking: true
      });

      // 生成大量节点数据
      const layers = [];
      for (let i = 0; i < 10; i++) {
        const nodes = [];
        for (let j = 0; j < 20; j++) {
          nodes.push({
            id: `node_${i}_${j}`,
            type: 'process',
            width: 100 + Math.random() * 50,
            height: 50 + Math.random() * 30
          });
        }
        layers.push({
          id: `layer_${i}`,
          nodes
        });
      }

      const startTime = Date.now();
      const result = await system.calculateOnly(layers, {
        strategy: 'adaptive',
        algorithm: 'symmetric'
      });
      const duration = Date.now() - startTime;

      this.assert(
        result.size === 200,
        '应该计算出200个节点位置'
      );

      this.assert(
        duration < 5000,
        `计算时间应该少于5秒，实际: ${duration}ms`
      );

      const stats = system.getStatistics();
      this.assert(
        stats.calculator && stats.calculator.totalCalculations > 0,
        '应该有性能统计数据'
      );

      this.recordTest('性能测试', true, `200节点计算耗时: ${duration}ms`);

    } catch (error) {
      this.recordTest('性能测试', false, error.message);
    }
  }

  /**
   * 测试错误处理
   */
  async testErrorHandling() {
    console.log('🚨 测试错误处理...');
    
    try {
      const system = new CoordinateRefactorSystem();

      // 测试无效输入
      try {
        await system.calculateOnly(null);
        this.assert(false, '应该抛出错误');
      } catch (error) {
        this.assert(
          error.name.includes('CoordinateCalculationError'),
          '应该抛出坐标计算错误'
        );
      }

      // 测试空层级
      try {
        await system.calculateOnly([]);
        this.assert(false, '应该抛出错误');
      } catch (error) {
        this.assert(
          error.message.includes('层级数据不能为空'),
          '应该提示层级数据为空'
        );
      }

      // 测试无效节点
      try {
        await system.calculateOnly([{
          id: 'layer_1',
          nodes: [{ id: null }]
        }]);
        this.assert(false, '应该抛出错误');
      } catch (error) {
        this.assert(
          error.name.includes('ValidationError'),
          '应该抛出验证错误'
        );
      }

      this.recordTest('错误处理', true, '错误处理机制正常');

    } catch (error) {
      this.recordTest('错误处理', false, error.message);
    }
  }

  /**
   * 测试并发
   */
  async testConcurrency() {
    console.log('🔀 测试并发处理...');
    
    try {
      const system = new CoordinateRefactorSystem();

      const layers = [
        {
          id: 'layer_1',
          nodes: [
            { id: 'node_1', type: 'start', width: 100, height: 50 },
            { id: 'node_2', type: 'process', width: 120, height: 60 }
          ]
        }
      ];

      // 并发执行多个计算
      const promises = [];
      for (let i = 0; i < 5; i++) {
        promises.push(system.sync(layers, {
          strategy: 'adaptive',
          algorithm: 'symmetric'
        }));
      }

      const syncIds = await Promise.all(promises);

      this.assert(
        syncIds.length === 5,
        '应该返回5个同步ID'
      );

      this.assert(
        new Set(syncIds).size === 5,
        '所有同步ID应该是唯一的'
      );

      // 等待所有同步完成
      for (const syncId of syncIds) {
        let status = system.getSyncStatus(syncId);
        let attempts = 0;
        while (status.state !== 'completed' && status.state !== 'error' && attempts < 20) {
          await new Promise(resolve => setTimeout(resolve, 50));
          status = system.getSyncStatus(syncId);
          attempts++;
        }

        this.assert(
          status.state === 'completed',
          `同步 ${syncId} 应该成功完成`
        );
      }

      this.recordTest('并发处理', true, '并发处理功能正常');

    } catch (error) {
      this.recordTest('并发处理', false, error.message);
    }
  }

  /**
   * 断言函数
   */
  assert(condition, message) {
    if (!condition) {
      throw new Error(`断言失败: ${message}`);
    }
  }

  /**
   * 记录测试结果
   */
  recordTest(testName, passed, details) {
    this.testResults.push({
      name: testName,
      passed,
      details,
      timestamp: Date.now()
    });

    const status = passed ? '✅' : '❌';
    console.log(`${status} ${testName}: ${details}\n`);
  }

  /**
   * 生成测试报告
   */
  generateTestReport() {
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(test => test.passed).length;
    const failedTests = totalTests - passedTests;
    const duration = Date.now() - this.startTime;

    console.log('📊 [测试报告] ==========================================');
    console.log(`总测试数: ${totalTests}`);
    console.log(`通过: ${passedTests}`);
    console.log(`失败: ${failedTests}`);
    console.log(`成功率: ${((passedTests / totalTests) * 100).toFixed(2)}%`);
    console.log(`总耗时: ${duration}ms`);
    console.log('====================================================\n');

    if (failedTests > 0) {
      console.log('❌ 失败的测试:');
      this.testResults
        .filter(test => !test.passed)
        .forEach(test => {
          console.log(`  - ${test.name}: ${test.details}`);
        });
      console.log('');
    }

    // 返回测试结果
    return {
      total: totalTests,
      passed: passedTests,
      failed: failedTests,
      successRate: (passedTests / totalTests) * 100,
      duration,
      details: this.testResults
    };
  }
}

/**
 * 运行集成测试
 */
export async function runIntegrationTests() {
  const test = new CoordinateRefactorIntegrationTest();
  return await test.runAllTests();
}

// 如果直接运行此文件，执行测试
if (typeof window === 'undefined' && import.meta.url === `file://${process.argv[1]}`) {
  runIntegrationTests().catch(console.error);
}

export default CoordinateRefactorIntegrationTest;