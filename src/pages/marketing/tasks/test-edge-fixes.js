/**
 * 测试边数据预处理和连接创建修复
 */

import { GraphService } from './services/GraphService.js';

// 模拟图实例
const mockGraph = {
  addEdge: (config) => {
    console.log('📊 [模拟图] 添加边:', config.id);
    return { id: config.id, ...config };
  },
  getNodes: () => [
    { id: 'node1', type: 'start' },
    { id: 'node2', type: 'process' }
  ],
  getCellById: (id) => {
    const nodes = mockGraph.getNodes();
    return nodes.find(node => node.id === id) || null;
  },
  // 添加事件监听器方法
  on: (event, handler) => {
    console.log(`📡 [模拟图] 注册事件监听器: ${event}`);
  },
  off: (event, handler) => {
    console.log(`📡 [模拟图] 移除事件监听器: ${event}`);
  },
  // 添加其他必要的方法
  getEdges: () => [],
  removeEdge: (id) => {
    console.log(`📊 [模拟图] 移除边: ${id}`);
  }
};

// 测试数据 - 包含问题边数据
const testEdgeData = [
  // 1. unified_edge 开头的边（应该被识别为预览线）
  {
    id: 'unified_edge_1761896979111_82fxo4dot',
    source: { cell: 'node1', port: 'out' },
    // 故意缺少target，测试预览线处理
    type: 'connection'
  },
  
  // 2. 正常的连接边
  {
    id: 'normal_connection_123',
    source: { cell: 'node1', port: 'out' },
    target: { cell: 'node2', port: 'in' },
    type: 'connection'
  },
  
  // 3. 另一个unified_edge（测试批量处理）
  {
    id: 'unified_edge_1761896979116_zp919nhei',
    source: { cell: 'node2', port: 'out' },
    // 故意缺少target
    type: 'connection'
  }
];

async function testEdgePreprocessing() {
  console.log('🧪 开始测试边数据预处理修复...\n');
  
  try {
    const graphService = new GraphService(mockGraph);
    await graphService.initialize(mockGraph);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const edgeData of testEdgeData) {
      console.log(`\n📝 测试边: ${edgeData.id}`);
      
      try {
        // 测试预处理
        const processed = graphService.preprocessEdgeData(edgeData);
        console.log('✅ 预处理成功:', {
          id: processed.id,
          hasTarget: !!processed.target,
          targetCell: processed.target?.cell,
          isPreview: processed.isPreview || processed.id.includes('unified_edge')
        });
        
        successCount++;
      } catch (error) {
        console.error('❌ 预处理失败:', error.message);
        errorCount++;
      }
    }
    
    console.log(`\n📊 预处理测试结果:`);
    console.log(`✅ 成功: ${successCount}`);
    console.log(`❌ 失败: ${errorCount}`);
    
    return { successCount, errorCount, total: testEdgeData.length };
    
  } catch (error) {
    console.error('❌ 测试初始化失败:', error);
    throw error;
  }
}

async function testConnectionCreation() {
  console.log('\n🧪 开始测试连接创建修复...\n');
  
  try {
    const graphService = new GraphService(mockGraph);
    await graphService.initialize(mockGraph);
    
    // 测试数据加载场景的连接创建
    const testConnectionData = {
      id: 'test_connection_from_data_load',
      source: { cell: 'node1', port: 'out' },
      target: { cell: 'node2', port: 'in' },
      type: 'connection',
      fromDataLoad: true
    };
    
    console.log('📝 测试数据加载场景的连接创建...');
    
    try {
      const result = await graphService.addEdge(testConnectionData);
      console.log('✅ 连接创建成功:', {
        success: result.success,
        edgeId: result.edgeId
      });
      
      return { success: true, result };
    } catch (error) {
      console.error('❌ 连接创建失败:', error.message);
      return { success: false, error: error.message };
    }
    
  } catch (error) {
    console.error('❌ 连接创建测试初始化失败:', error);
    throw error;
  }
}

async function runAllTests() {
  console.log('🚀 开始运行边数据修复测试套件...\n');
  
  try {
    // 测试1: 边数据预处理
    const preprocessingResult = await testEdgePreprocessing();
    
    // 测试2: 连接创建
    const connectionResult = await testConnectionCreation();
    
    // 汇总结果
    console.log('\n📋 测试汇总:');
    console.log('=' .repeat(50));
    console.log(`边数据预处理: ${preprocessingResult.successCount}/${preprocessingResult.total} 成功`);
    console.log(`连接创建: ${connectionResult.success ? '✅ 成功' : '❌ 失败'}`);
    
    const allSuccess = preprocessingResult.errorCount === 0 && connectionResult.success;
    
    if (allSuccess) {
      console.log('\n🎉 所有测试通过！修复成功！');
    } else {
      console.log('\n⚠️  部分测试失败，需要进一步检查');
    }
    
    return {
      allSuccess,
      preprocessing: preprocessingResult,
      connection: connectionResult
    };
    
  } catch (error) {
    console.error('❌ 测试套件运行失败:', error);
    throw error;
  }
}

// 导出测试函数
export {
  testEdgePreprocessing,
  testConnectionCreation,
  runAllTests
};

// 如果直接运行此文件
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests().catch(console.error);
}