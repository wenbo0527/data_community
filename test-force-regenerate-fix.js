/**
 * 测试修复后的 forceRegeneratePreviewLines 方法
 * 验证预览线能否正确创建和显示
 */

import { PreviewLineSystem } from './src/utils/preview-line/PreviewLineSystem.js';

/**
 * 创建模拟图实例
 */
function createMockGraph() {
  return {
    addNode: (node) => console.log('模拟添加节点:', node.id),
    removeNode: (nodeId) => console.log('模拟删除节点:', nodeId),
    addEdge: (edge) => console.log('模拟添加边:', edge.id),
    removeEdge: (edgeId) => console.log('模拟删除边:', edgeId),
    getNodes: () => [],
    getEdges: () => [],
    getCells: () => []
  };
}

/**
 * 创建模拟布局引擎
 */
function createMockLayoutEngine() {
  const mockNode = {
    id: 'start-node',
    data: {
      type: 'start',
      nodeType: 'start',
      isConfigured: true,
      config: {
        label: 'Start Node',
        color: '#4CAF50',
        shape: 'rect',
        width: 120,
        height: 60,
        maxOutputs: 1,
        autoExpand: false,
        nextSlots: ['next'],
        ports: [{ id: 'next', group: 'out' }],
        nodeName: 'Start Node',
        taskType: 'start',
        entryDate: new Date().toISOString(),
        frequency: 'once',
        deduplicationDays: 0,
        pushLimit: 1000,
        priority: 'high',
        targetAudience: 'all',
        customAudienceConfig: {},
        nodeType: 'start'
      }
    }
  };

  return {
    getNodes: () => [mockNode],
    getOutgoingEdges: (nodeId) => [], // 没有真实连接
    getIncomingEdges: (nodeId) => [],
    getNode: (nodeId) => nodeId === 'start-node' ? mockNode : null
  };
}

/**
 * 测试强制重新生成预览线功能
 */
async function testForceRegeneratePreviewLines() {
  console.log('🧪 开始测试修复后的 forceRegeneratePreviewLines 方法');
  
  try {
    // 创建模拟环境
    const mockGraph = createMockGraph();
    const mockLayoutEngine = createMockLayoutEngine();
    
    // 创建预览线系统实例
    const previewLineSystem = new PreviewLineSystem({
      graph: mockGraph,
      system: {
        enableDebug: true,
        enableStats: true
      }
    });
    
    // 初始化系统
    console.log('🔧 初始化预览线系统...');
    await previewLineSystem.init();
    
    // 设置布局引擎
    console.log('🔧 设置布局引擎...');
    previewLineSystem.setLayoutEngine(mockLayoutEngine);
    
    // 检查初始状态
    console.log('📊 检查初始预览线状态...');
    const initialPreviewLines = previewLineSystem.getAllPreviewLines();
    console.log(`初始预览线数量: ${initialPreviewLines.length}`);
    
    // 执行强制重新生成
    console.log('🔄 执行强制重新生成预览线...');
    const result = await previewLineSystem.forceRegeneratePreviewLines();
    
    console.log('✅ 强制重新生成结果:', result);
    
    // 检查最终状态
    console.log('📊 检查最终预览线状态...');
    const finalPreviewLines = previewLineSystem.getAllPreviewLines();
    console.log(`最终预览线数量: ${finalPreviewLines.length}`);
    
    if (finalPreviewLines.length > 0) {
      console.log('🎉 成功！预览线已创建:');
      finalPreviewLines.forEach((line, index) => {
        console.log(`  ${index + 1}. ID: ${line.id}, 源节点: ${line.sourceNodeId}`);
      });
    } else {
      console.log('⚠️ 警告：没有创建预览线');
    }
    
    // 验证结果
    const success = result.success && result.createdCount > 0;
    
    if (success) {
      console.log('\n🎉 测试通过！forceRegeneratePreviewLines 方法修复成功!');
      console.log('\n📋 修复总结:');
      console.log('  ✅ 修复了 forceRegeneratePreviewLines 方法');
      console.log('  ✅ 现在能够主动为符合条件的节点创建预览线');
      console.log('  ✅ 预览线创建逻辑正常工作');
      console.log('  ✅ 统计信息正确记录');
    } else {
      console.log('\n❌ 测试失败！需要进一步调试');
    }
    
    return success;
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error);
    return false;
  }
}

// 运行测试
testForceRegeneratePreviewLines().then(success => {
  if (success) {
    console.log('\n🎊 所有测试通过！预览线生成问题已修复！');
  } else {
    console.log('\n💥 测试失败，需要进一步调试');
  }
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('💥 测试运行失败:', error);
  process.exit(1);
});