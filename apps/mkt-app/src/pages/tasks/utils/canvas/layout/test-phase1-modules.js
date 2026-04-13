/**
 * 第一阶段模块基本功能测试
 * 测试配置模块和工具模块的基本功能
 */

// 导入第一阶段的模块
import { LayoutConfig, defaultLayoutConfig, createLayoutConfig } from './config/LayoutConfig.js';
import { PerformanceConfig, defaultPerformanceConfig, createPerformanceConfig } from './config/PerformanceConfig.js';
import { NodeFilter, nodeFilter, createNodeFilter } from './utils/NodeFilter.js';
import { EdgeFilter, edgeFilter, createEdgeFilter } from './utils/EdgeFilter.js';
import { LayerUtils, layerUtils, createLayerUtils } from './utils/LayerUtils.js';
import { PositionUtils, positionUtils, createPositionUtils } from './utils/PositionUtils.js';

/**
 * 测试配置模块
 */
function testConfigModules() {
  console.log('🧪 [测试] 开始测试配置模块');
  
  try {
    // 测试 LayoutConfig
    console.log('📋 [测试] 测试 LayoutConfig');
    const layoutConfig = new LayoutConfig();
    console.log('✅ LayoutConfig 实例创建成功');
    
    // 测试配置获取
    const layerConfig = layoutConfig.getLayerConfig();
    console.log('✅ 层级配置获取成功:', layerConfig);
    
    // 测试配置更新
    layoutConfig.updateConfig({ layer: { baseHeight: 200 } });
    console.log('✅ 层级配置更新成功');
    
    // 测试默认配置
    console.log('✅ 默认布局配置:', defaultLayoutConfig.getLayerConfig());
    
    // 测试工厂函数
    const customLayoutConfig = createLayoutConfig({ layer: { baseHeight: 180 } });
    console.log('✅ 自定义布局配置创建成功:', customLayoutConfig.getLayerConfig());
    
    // 测试 PerformanceConfig
    console.log('📊 [测试] 测试 PerformanceConfig');
    const perfConfig = new PerformanceConfig();
    console.log('✅ PerformanceConfig 实例创建成功');
    
    // 测试性能配置获取
    const optimizerConfig = perfConfig.getOptimizerConfig();
    console.log('✅ 优化器配置获取成功:', optimizerConfig);
    
    // 测试性能报告
    const report = perfConfig.getPerformanceReport();
    console.log('✅ 性能报告生成成功:', report);
    
    console.log('✅ [测试] 配置模块测试通过');
    return true;
  } catch (error) {
    console.error('❌ [测试] 配置模块测试失败:', error);
    return false;
  }
}

/**
 * 测试工具模块
 */
function testUtilModules() {
  console.log('🧪 [测试] 开始测试工具模块');
  
  try {
    // 创建模拟节点数据
    const mockNodes = [
      { id: 'start-node-1', getId: () => 'start-node-1' },
      { id: 'ai-call-node-1', getId: () => 'ai-call-node-1' },
      { id: 'condition-node-1', getId: () => 'condition-node-1' },
      { id: 'end-node-1', getId: () => 'end-node-1' }
    ];
    
    // 测试 NodeFilter
    console.log('🔍 [测试] 测试 NodeFilter');
    const nodeFilterInstance = new NodeFilter();
    console.log('✅ NodeFilter 实例创建成功');
    
    // 测试节点类型获取
    const nodeType = nodeFilterInstance.getNodeType(mockNodes[0]);
    console.log('✅ 节点类型获取成功:', nodeType);
    
    // 测试节点分组
    const groupedNodes = nodeFilterInstance.groupNodesByType(mockNodes);
    console.log('✅ 节点分组成功:', groupedNodes);
    
    // 测试叶子节点识别
    const leafNodes = nodeFilterInstance.identifyLeafNodes(mockNodes, []);
    console.log('✅ 叶子节点识别成功:', leafNodes.map(n => n.id));
    
    // 测试 EdgeFilter
    console.log('🔗 [测试] 测试 EdgeFilter');
    const edgeFilterInstance = new EdgeFilter();
    console.log('✅ EdgeFilter 实例创建成功');
    
    // 创建模拟边数据
    const mockEdges = [
      {
        id: 'edge-1',
        getSourceCellId: () => 'start-node-1',
        getTargetCellId: () => 'ai-call-node-1',
        getData: () => ({ isPreviewLine: false })
      }
    ];
    
    // 测试边过滤
    const validEdges = edgeFilterInstance.filterValidEdges(mockEdges);
    console.log('✅ 边过滤成功:', validEdges.length);
    
    // 测试边类型获取
    const edgeType = edgeFilterInstance.getEdgeType(mockEdges[0]);
    console.log('✅ 边类型获取成功:', edgeType);
    
    // 测试 LayerUtils
    console.log('📐 [测试] 测试 LayerUtils');
    const layerUtilsInstance = new LayerUtils();
    console.log('✅ LayerUtils 实例创建成功');
    
    // 测试层级索引获取
    const layerIndex = layerUtilsInstance.getSimpleLayerIndex('start-node-1');
    console.log('✅ 层级索引获取成功:', layerIndex);
    
    // 测试层级Y坐标计算
    const layerY = layerUtilsInstance.getNodeLayerY('start-node-1');
    console.log('✅ 层级Y坐标计算成功:', layerY);
    
    // 测试垂直分层构建
    const layers = layerUtilsInstance.buildVerticalLayersByType(mockNodes, (node) => {
      if (node.id.includes('start')) return 'start';
      if (node.id.includes('end')) return 'end';
      return 'other';
    });
    console.log('✅ 垂直分层构建成功:', layers.length, '层');
    
    // 测试 PositionUtils
    console.log('📍 [测试] 测试 PositionUtils');
    const positionUtilsInstance = new PositionUtils();
    console.log('✅ PositionUtils 实例创建成功');
    
    // 测试位置验证
    const validPosition = positionUtilsInstance.validatePosition({ x: 100, y: 200 }, 'test-node');
    console.log('✅ 位置验证成功:', validPosition);
    
    // 测试对称分布计算
    const positions = positionUtilsInstance.calculateSymmetricDistribution(mockNodes.slice(0, 2), 100);
    console.log('✅ 对称分布计算成功:', positions.size, '个位置');
    
    // 测试父节点位置计算
    const childPositions = [{ x: -50, y: 100 }, { x: 50, y: 100 }];
    const parentX = positionUtilsInstance.calculateOptimalParentX(childPositions, 'parent-node');
    console.log('✅ 父节点位置计算成功:', parentX);
    
    console.log('✅ [测试] 工具模块测试通过');
    return true;
  } catch (error) {
    console.error('❌ [测试] 工具模块测试失败:', error);
    return false;
  }
}

/**
 * 测试模块集成
 */
function testModuleIntegration() {
  console.log('🧪 [测试] 开始测试模块集成');
  
  try {
    // 测试配置模块与工具模块的协作
    const layoutConfig = createLayoutConfig({
      layer: { baseHeight: 160, spacing: 140 }
    });
    
    const layerUtilsInstance = createLayerUtils({
      layer: layoutConfig.getLayerConfig()
    });
    
    const positionUtilsInstance = createPositionUtils({
      position: { defaultSpacing: 90 }
    });
    
    // 模拟一个完整的布局流程
    const mockNodes = [
      { id: 'start-1', getId: () => 'start-1' },
      { id: 'process-1', getId: () => 'process-1' },
      { id: 'end-1', getId: () => 'end-1' }
    ];
    
    // 1. 使用 NodeFilter 分组节点
    const nodeFilterInstance = createNodeFilter();
    const groupedNodes = nodeFilterInstance.groupNodesByType(mockNodes);
    console.log('✅ 节点分组完成:', Object.keys(groupedNodes));
    
    // 2. 使用 LayerUtils 构建分层
    const layers = layerUtilsInstance.buildVerticalLayersByType(mockNodes, (node) => {
      if (node.id.includes('start')) return 'start';
      if (node.id.includes('end')) return 'end';
      return 'process';
    });
    console.log('✅ 分层构建完成:', layers.length, '层');
    
    // 3. 使用 PositionUtils 计算位置
    const allPositions = new Map();
    layers.forEach((layer, index) => {
      const layerY = index * layoutConfig.getLayerConfig().spacing;
      const layerPositions = positionUtilsInstance.calculateSymmetricDistribution(layer, layerY);
      layerPositions.forEach((pos, nodeId) => {
        allPositions.set(nodeId, pos);
      });
    });
    console.log('✅ 位置计算完成:', allPositions.size, '个节点');
    
    // 4. 验证最终结果
    const stats = positionUtilsInstance.getPositionStatistics(allPositions);
    console.log('✅ 位置统计:', stats);
    
    console.log('✅ [测试] 模块集成测试通过');
    return true;
  } catch (error) {
    console.error('❌ [测试] 模块集成测试失败:', error);
    return false;
  }
}

/**
 * 运行所有测试
 */
function runAllTests() {
  console.log('🚀 [测试] 开始第一阶段模块功能测试');
  console.log('=' .repeat(60));
  
  const results = {
    config: testConfigModules(),
    utils: testUtilModules(),
    integration: testModuleIntegration()
  };
  
  console.log('=' .repeat(60));
  console.log('📊 [测试结果] 测试总结:');
  console.log('  配置模块:', results.config ? '✅ 通过' : '❌ 失败');
  console.log('  工具模块:', results.utils ? '✅ 通过' : '❌ 失败');
  console.log('  模块集成:', results.integration ? '✅ 通过' : '❌ 失败');
  
  const allPassed = Object.values(results).every(result => result);
  console.log('\n🎯 [总结]', allPassed ? '所有测试通过！第一阶段模块功能正常' : '部分测试失败，需要修复问题');
  
  return allPassed;
}

// 导出测试函数
export {
  testConfigModules,
  testUtilModules,
  testModuleIntegration,
  runAllTests
};

// 如果直接运行此文件，执行所有测试
if (typeof window !== 'undefined') {
  // 浏览器环境
  window.testPhase1Modules = runAllTests;
  console.log('💡 [提示] 在浏览器控制台中运行 testPhase1Modules() 来执行测试');
} else {
  // Node.js 环境
  runAllTests();
}