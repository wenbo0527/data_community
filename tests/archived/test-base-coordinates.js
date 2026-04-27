/**
 * 基础坐标设置和完整性校验测试脚本
 * 用于验证开始节点基础坐标设置和Y坐标NaN问题修复
 */

class BaseCoordinatesTest {
  constructor() {
    this.graph = window.graph;
    this.layoutEngine = window.layoutEngine;
    this.previewLineManager = window.unifiedPreviewLineManager;
    this.integrityTester = null;
    
    console.log('🧪 [基础坐标测试] 初始化测试环境');
    this.initializeTest();
  }
  
  /**
   * 初始化测试环境
   */
  initializeTest() {
    // 检查必要的实例
    if (!this.graph) {
      console.error('❌ [基础坐标测试] graph实例不可用');
      return;
    }
    
    if (!this.layoutEngine) {
      console.error('❌ [基础坐标测试] layoutEngine实例不可用');
      return;
    }
    
    // 初始化完整性测试器
    if (window.IntegrityTester) {
      this.integrityTester = new window.IntegrityTester();
      console.log('✅ [基础坐标测试] 完整性测试器已初始化');
    } else {
      console.warn('⚠️ [基础坐标测试] IntegrityTester不可用');
    }
    
    console.log('✅ [基础坐标测试] 测试环境初始化完成');
  }
  
  /**
   * 运行完整的基础坐标测试
   */
  runFullTest() {
    console.log('🚀 [基础坐标测试] 开始完整测试流程...');
    
    const testResults = {
      beforeFix: null,
      startNodeSetup: null,
      afterStartNodeSetup: null,
      coordinatesFix: null,
      afterFix: null,
      summary: {
        totalIssues: 0,
        fixedIssues: 0,
        remainingIssues: 0
      }
    };
    
    // 1. 检查修复前的状态
    console.log('\n📊 [步骤1] 检查修复前的完整性状态...');
    testResults.beforeFix = this.checkIntegrity();
    testResults.summary.totalIssues = this.countIssues(testResults.beforeFix);
    
    // 2. 设置开始节点基础坐标
    console.log('\n🎯 [步骤2] 设置开始节点基础坐标...');
    testResults.startNodeSetup = this.setupStartNodeBaseCoordinates();
    
    // 3. 检查开始节点设置后的状态
    console.log('\n📊 [步骤3] 检查开始节点设置后的状态...');
    testResults.afterStartNodeSetup = this.checkIntegrity();
    
    // 4. 修复剩余的坐标问题
    console.log('\n🔧 [步骤4] 修复剩余的坐标问题...');
    testResults.coordinatesFix = this.fixRemainingCoordinates();
    
    // 5. 检查最终状态
    console.log('\n📊 [步骤5] 检查最终完整性状态...');
    testResults.afterFix = this.checkIntegrity();
    testResults.summary.remainingIssues = this.countIssues(testResults.afterFix);
    testResults.summary.fixedIssues = testResults.summary.totalIssues - testResults.summary.remainingIssues;
    
    // 6. 输出测试报告
    this.generateTestReport(testResults);
    
    return testResults;
  }
  
  /**
   * 设置开始节点基础坐标
   */
  setupStartNodeBaseCoordinates() {
    console.log('🎯 [基础坐标测试] 设置开始节点基础坐标...');
    
    const result = {
      success: false,
      startNodesFound: 0,
      startNodesFixed: 0,
      details: []
    };
    
    try {
      // 方法1: 使用布局引擎的方法
      if (this.layoutEngine && this.layoutEngine.ensureStartNodeBaseCoordinates) {
        this.layoutEngine.ensureStartNodeBaseCoordinates();
        console.log('✅ [基础坐标测试] 布局引擎方法执行完成');
      }
      
      // 方法2: 手动查找和设置开始节点
      const nodes = this.graph.getNodes();
      const startNodes = nodes.filter(node => {
        const nodeData = node.getData() || {};
        const nodeType = nodeData.type || nodeData.nodeType;
        return nodeType === 'start' || nodeType === 'start-node' || nodeData.isStartNode;
      });
      
      result.startNodesFound = startNodes.length;
      console.log(`🔍 [基础坐标测试] 找到 ${startNodes.length} 个开始节点`);
      
      startNodes.forEach((node, index) => {
        const nodeId = node.id || node.getId();
        const currentPos = node.getPosition();
        
        console.log(`📍 [基础坐标测试] 开始节点 ${nodeId} 当前位置:`, currentPos);
        
        // 设置基础坐标
        const baseX = 200;
        const baseY = 100;
        
        if (isNaN(currentPos.x) || isNaN(currentPos.y) || currentPos.x === 0 || currentPos.y === 0) {
          node.setPosition({ x: baseX, y: baseY });
          result.startNodesFixed++;
          
          const detail = {
            nodeId,
            oldPosition: currentPos,
            newPosition: { x: baseX, y: baseY },
            fixed: true
          };
          result.details.push(detail);
          
          console.log(`✅ [基础坐标测试] 开始节点 ${nodeId} 坐标已修复:`, detail);
        } else {
          const detail = {
            nodeId,
            position: currentPos,
            fixed: false,
            reason: '坐标已有效'
          };
          result.details.push(detail);
          
          console.log(`ℹ️ [基础坐标测试] 开始节点 ${nodeId} 坐标已有效，无需修复`);
        }
      });
      
      result.success = true;
      console.log(`✅ [基础坐标测试] 开始节点基础坐标设置完成，修复了 ${result.startNodesFixed}/${result.startNodesFound} 个节点`);
      
    } catch (error) {
      console.error('❌ [基础坐标测试] 设置开始节点基础坐标失败:', error);
      result.error = error.message;
    }
    
    return result;
  }
  
  /**
   * 修复剩余的坐标问题
   */
  fixRemainingCoordinates() {
    console.log('🔧 [基础坐标测试] 修复剩余的坐标问题...');
    
    if (this.integrityTester) {
      return this.integrityTester.autoFix();
    } else {
      console.warn('⚠️ [基础坐标测试] 完整性测试器不可用，跳过自动修复');
      return { success: false, reason: '完整性测试器不可用' };
    }
  }
  
  /**
   * 检查完整性
   */
  checkIntegrity() {
    if (this.integrityTester) {
      return this.integrityTester.runEnhancedCheck();
    } else {
      console.warn('⚠️ [基础坐标测试] 完整性测试器不可用，使用简单检查');
      return this.simpleIntegrityCheck();
    }
  }
  
  /**
   * 简单的完整性检查
   */
  simpleIntegrityCheck() {
    const nodes = this.graph.getNodes();
    const issues = [];
    
    nodes.forEach(node => {
      const nodeId = node.id || node.getId();
      const position = node.getPosition();
      
      if (isNaN(position.x) || isNaN(position.y)) {
        issues.push({
          type: 'coordinate',
          nodeId,
          position,
          issue: 'NaN坐标'
        });
      }
    });
    
    return {
      coordinateIssues: issues,
      totalIssues: issues.length
    };
  }
  
  /**
   * 统计问题数量
   */
  countIssues(checkResult) {
    if (!checkResult) return 0;
    
    let count = 0;
    if (checkResult.coordinateIssues) count += checkResult.coordinateIssues.length;
    if (checkResult.previewLineIssues) count += checkResult.previewLineIssues.length;
    if (checkResult.connectionIssues) count += checkResult.connectionIssues.length;
    if (checkResult.totalIssues) count = checkResult.totalIssues;
    
    return count;
  }
  
  /**
   * 生成测试报告
   */
  generateTestReport(testResults) {
    console.log('\n📋 ==================== 基础坐标测试报告 ====================');
    console.log('🎯 测试目标: 修复开始节点基础坐标和Y坐标NaN问题');
    console.log('');
    
    console.log('📊 测试统计:');
    console.log(`   总问题数: ${testResults.summary.totalIssues}`);
    console.log(`   已修复数: ${testResults.summary.fixedIssues}`);
    console.log(`   剩余问题: ${testResults.summary.remainingIssues}`);
    console.log(`   修复率: ${testResults.summary.totalIssues > 0 ? Math.round((testResults.summary.fixedIssues / testResults.summary.totalIssues) * 100) : 100}%`);
    console.log('');
    
    if (testResults.startNodeSetup) {
      console.log('🎯 开始节点设置结果:');
      console.log(`   找到开始节点: ${testResults.startNodeSetup.startNodesFound}`);
      console.log(`   修复开始节点: ${testResults.startNodeSetup.startNodesFixed}`);
      console.log(`   设置成功: ${testResults.startNodeSetup.success ? '是' : '否'}`);
      console.log('');
    }
    
    if (testResults.coordinatesFix) {
      console.log('🔧 坐标修复结果:');
      console.log('   ', testResults.coordinatesFix);
      console.log('');
    }
    
    const status = testResults.summary.remainingIssues === 0 ? '✅ 完全成功' : 
                   testResults.summary.fixedIssues > 0 ? '⚠️ 部分成功' : '❌ 修复失败';
    
    console.log(`🏆 测试结果: ${status}`);
    console.log('============================================================\n');
    
    return testResults;
  }
  
  /**
   * 快速测试 - 只检查和修复基础坐标
   */
  quickTest() {
    console.log('⚡ [基础坐标测试] 快速测试模式...');
    
    const result = this.setupStartNodeBaseCoordinates();
    
    if (result.success && result.startNodesFixed > 0) {
      console.log('✅ [快速测试] 开始节点基础坐标修复成功');
    } else if (result.success && result.startNodesFixed === 0) {
      console.log('ℹ️ [快速测试] 开始节点坐标已正常，无需修复');
    } else {
      console.log('❌ [快速测试] 开始节点基础坐标修复失败');
    }
    
    return result;
  }
}

// 创建全局实例
if (typeof window !== 'undefined') {
  window.BaseCoordinatesTest = BaseCoordinatesTest;
  
  // 自动创建测试实例
  window.baseCoordinatesTest = new BaseCoordinatesTest();
  
  console.log('🧪 [基础坐标测试] 测试脚本已加载');
  console.log('💡 使用方法:');
  console.log('   window.baseCoordinatesTest.runFullTest()  - 运行完整测试');
  console.log('   window.baseCoordinatesTest.quickTest()    - 快速测试');
  console.log('   new BaseCoordinatesTest()                 - 创建新的测试实例');
}

// Node.js环境导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BaseCoordinatesTest;
}