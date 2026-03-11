/**
 * 调试脚本：检查布局引擎就绪状态和预览线生成问题
 * 目标：验证layoutEngineReady状态对事件分流节点预览线生成的影响
 */

console.log('🔍 [调试] 开始检查布局引擎就绪状态问题');

// 模拟问题场景：layoutEngineReady为false时的预览线生成
function simulatePreviewLineCreation() {
  console.log('\n=== 模拟预览线创建场景 ===');
  
  // 模拟UnifiedPreviewLineManager的createUnifiedPreviewLine方法逻辑
  const mockPreviewLineManager = {
    layoutEngineReady: false, // 这是问题的根源
    pendingTasks: [],
    
    createUnifiedPreviewLine(nodeId, nodeType) {
      console.log(`🎯 [模拟] 尝试为节点创建预览线: {nodeId: ${nodeId}, nodeType: ${nodeType}}`);
      
      // 双重验证：检查节点是否存在
      if (!nodeId) {
        console.log('❌ [模拟] 节点ID不存在，返回null');
        return null;
      }
      
      // 检查是否应该创建预览线
      const shouldCreate = this.shouldCreatePreviewLine(nodeId, nodeType);
      if (!shouldCreate) {
        console.log('❌ [模拟] shouldCreatePreviewLine返回false，返回null');
        return null;
      }
      
      // 关键问题：布局引擎未就绪
      if (!this.layoutEngineReady) {
        console.log('⚠️ [模拟] 布局引擎未就绪，将任务加入待处理队列');
        this.pendingTasks.push({ nodeId, nodeType, action: 'createPreviewLine' });
        console.log(`📋 [模拟] 待处理队列长度: ${this.pendingTasks.length}`);
        return null; // 这里返回null导致用户看到"生成结果: undefined"
      }
      
      // 如果布局引擎就绪，则正常创建预览线
      console.log('✅ [模拟] 布局引擎已就绪，开始创建预览线');
      return this.createActualPreviewLine(nodeId, nodeType);
    },
    
    shouldCreatePreviewLine(nodeId, nodeType) {
      // 事件分流节点应该创建预览线
      if (nodeType === 'event-split') {
        console.log('✅ [模拟] 事件分流节点需要创建预览线');
        return true;
      }
      return false;
    },
    
    createActualPreviewLine(nodeId, nodeType) {
      console.log(`🎨 [模拟] 实际创建预览线: {nodeId: ${nodeId}, nodeType: ${nodeType}}`);
      return {
        id: `preview_${nodeId}`,
        nodeId,
        nodeType,
        branches: nodeType === 'event-split' ? ['是', '否'] : []
      };
    },
    
    // 模拟布局引擎就绪后的处理
    setLayoutEngineReady(ready) {
      console.log(`🔧 [模拟] 设置布局引擎就绪状态: ${ready}`);
      this.layoutEngineReady = ready;
      
      if (ready && this.pendingTasks.length > 0) {
        console.log(`🔄 [模拟] 处理待处理队列，任务数量: ${this.pendingTasks.length}`);
        const tasks = [...this.pendingTasks];
        this.pendingTasks = [];
        
        tasks.forEach(task => {
          console.log(`🔄 [模拟] 处理待处理任务: ${JSON.stringify(task)}`);
          const result = this.createUnifiedPreviewLine(task.nodeId, task.nodeType);
          console.log(`✅ [模拟] 待处理任务完成，结果:`, result);
        });
      }
    }
  };
  
  return mockPreviewLineManager;
}

// 执行测试
const manager = simulatePreviewLineCreation();

console.log('\n=== 测试场景1：布局引擎未就绪时创建预览线 ===');
const result1 = manager.createUnifiedPreviewLine('node_1758633385238', 'event-split');
console.log('🔍 [结果] 预览线创建结果:', result1);
console.log('🔍 [结果] 这解释了为什么用户看到"生成结果: undefined"');

console.log('\n=== 测试场景2：布局引擎就绪后处理待处理队列 ===');
manager.setLayoutEngineReady(true);

console.log('\n=== 测试场景3：布局引擎就绪时直接创建预览线 ===');
const result3 = manager.createUnifiedPreviewLine('node_test', 'event-split');
console.log('🔍 [结果] 预览线创建结果:', result3);

console.log('\n=== 问题分析和解决方案 ===');
console.log('🎯 [问题根源] layoutEngineReady为false导致createUnifiedPreviewLine返回null');
console.log('🔧 [解决方案1] 在initializeLayoutEngineAfterDataLoad中立即设置layoutEngineReady为true');
console.log('🔧 [解决方案2] 确保布局引擎在数据加载后立即初始化，而不是等待用户点击');
console.log('🔧 [解决方案3] 在事件分流节点配置完成后，检查并处理待处理队列');

console.log('\n🔍 [调试] 布局引擎就绪状态检查完成');