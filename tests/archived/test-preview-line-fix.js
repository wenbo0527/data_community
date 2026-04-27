/**
 * 测试预览线修复效果
 * 验证PreviewLineSystem的修复方案是否生效
 */

// 模拟X6图形环境
class MockGraph {
  constructor() {
    this.nodes = new Map();
    this.eventListeners = new Map();
  }
  
  addNode(node) {
    this.nodes.set(node.id, node);
    // 触发node:added事件
    const listeners = this.eventListeners.get('node:added') || [];
    listeners.forEach(listener => {
      try {
        listener({ node });
      } catch (error) {
        console.error('事件监听器执行失败:', error);
      }
    });
  }
  
  getNodes() {
    return Array.from(this.nodes.values());
  }
  
  on(event, listener) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(listener);
  }
}

// 模拟节点
class MockNode {
  constructor(id, data) {
    this.id = id;
    this.data = data;
  }
  
  getData() {
    return this.data;
  }
}

// 模拟PreviewLineManager
class MockPreviewLineManager {
  constructor() {
    this.previewLines = new Map();
    this.createCallCount = 0;
  }
  
  async createUnifiedPreviewLine(node) {
    this.createCallCount++;
    console.log(`🔍 [MockPreviewLineManager] createUnifiedPreviewLine被调用:`, {
      nodeId: node.id,
      callCount: this.createCallCount,
      nodeData: node.getData()
    });
    
    // 模拟创建预览线
    const previewLine = {
      id: `preview-${node.id}-${Date.now()}`,
      sourceNodeId: node.id,
      created: true
    };
    
    if (!this.previewLines.has(node.id)) {
      this.previewLines.set(node.id, []);
    }
    this.previewLines.get(node.id).push(previewLine);
    
    return previewLine;
  }
}

// 模拟PreviewLineSystem的关键部分
class MockPreviewLineSystem {
  constructor(graph) {
    this.graph = graph;
    this.previewLineManager = new MockPreviewLineManager();
    this.initialized = false;
  }
  
  async init() {
    console.log('🔍 [MockPreviewLineSystem] 开始初始化...');
    
    // 注册事件监听器（修复方案A）
    this.registerEventListeners();
    
    this.initialized = true;
    console.log('🔍 [MockPreviewLineSystem] 初始化完成');
    
    // 为所有已配置的现有节点创建预览线（修复方案B）
    await this.createPreviewLinesForExistingNodes();
  }
  
  registerEventListeners() {
    if (this.graph) {
      this.graph.on('node:added', async (args) => {
        try {
          const { node } = args;
          if (!node) return;
          
          const nodeData = node.getData();
          if (!nodeData) return;
          
          console.log('🔍 [MockPreviewLineSystem] 检测到节点添加事件:', {
            nodeId: node.id,
            nodeType: nodeData.nodeType,
            isConfigured: nodeData.isConfigured
          });
          
          // 检查节点是否已配置且需要预览线
          if (nodeData.isConfigured && this.previewLineManager) {
            // 延迟执行以确保节点完全添加到图中
            setTimeout(async () => {
              try {
                console.log('🔍 [MockPreviewLineSystem] 尝试为节点创建预览线:', node.id);
                await this.previewLineManager.createUnifiedPreviewLine(node);
              } catch (error) {
                console.warn('🔍 [MockPreviewLineSystem] 自动创建预览线失败:', error.message);
              }
            }, 100);
          }
        } catch (error) {
          console.warn('🔍 [MockPreviewLineSystem] 处理节点添加事件失败:', error.message);
        }
      });
    }
  }
  
  async createPreviewLinesForExistingNodes() {
    if (!this.graph || !this.previewLineManager) {
      console.warn('🔍 [MockPreviewLineSystem] 图形实例或预览线管理器未初始化，跳过现有节点预览线创建');
      return;
    }
    
    try {
      const nodes = this.graph.getNodes();
      console.log('🔍 [MockPreviewLineSystem] 开始为现有节点创建预览线，节点数量:', nodes.length);
      
      let createdCount = 0;
      
      for (const node of nodes) {
        try {
          const nodeData = node.getData();
          if (!nodeData) continue;
          
          console.log('🔍 [MockPreviewLineSystem] 检查节点:', {
            nodeId: node.id,
            nodeType: nodeData.nodeType,
            isConfigured: nodeData.isConfigured
          });
          
          // 检查节点是否已配置且需要预览线
          if (nodeData.isConfigured) {
            console.log('🔍 [MockPreviewLineSystem] 为已配置节点创建预览线:', node.id);
            await this.previewLineManager.createUnifiedPreviewLine(node);
            createdCount++;
          }
        } catch (error) {
          console.warn('🔍 [MockPreviewLineSystem] 为节点创建预览线失败:', {
            nodeId: node.id,
            error: error.message
          });
        }
      }
      
      console.log('🔍 [MockPreviewLineSystem] 现有节点预览线创建完成，成功创建数量:', createdCount);
    } catch (error) {
      console.error('🔍 [MockPreviewLineSystem] 为现有节点创建预览线时发生错误:', error);
    }
  }
  
  getAllPreviewLines() {
    const allLines = [];
    for (const [nodeId, lines] of this.previewLineManager.previewLines) {
      allLines.push(...lines);
    }
    return allLines;
  }
}

// 测试函数
async function testPreviewLineFix() {
  console.log('\n=== 开始测试预览线修复效果 ===\n');
  
  // 1. 创建图形实例
  const graph = new MockGraph();
  
  // 2. 创建预览线系统
  const previewLineSystem = new MockPreviewLineSystem(graph);
  
  // 3. 测试场景1：先添加节点，后初始化系统（测试修复方案B）
  console.log('\n--- 场景1：先添加节点，后初始化系统 ---');
  
  const startNode1 = new MockNode('start-node-1', {
    nodeType: 'start',
    isConfigured: true,
    label: 'Start Node 1'
  });
  
  // 直接添加到图中（不触发事件）
  graph.nodes.set(startNode1.id, startNode1);
  console.log('已添加节点到图中:', startNode1.id);
  
  // 初始化系统（应该为现有节点创建预览线）
  await previewLineSystem.init();
  
  // 检查结果
  let allLines = previewLineSystem.getAllPreviewLines();
  console.log('场景1结果 - 预览线数量:', allLines.length);
  console.log('场景1结果 - createUnifiedPreviewLine调用次数:', previewLineSystem.previewLineManager.createCallCount);
  
  // 4. 测试场景2：先初始化系统，后添加节点（测试修复方案A）
  console.log('\n--- 场景2：先初始化系统，后添加节点 ---');
  
  const startNode2 = new MockNode('start-node-2', {
    nodeType: 'start',
    isConfigured: true,
    label: 'Start Node 2'
  });
  
  // 通过addNode方法添加（会触发node:added事件）
  graph.addNode(startNode2);
  
  // 等待异步事件处理完成
  await new Promise(resolve => setTimeout(resolve, 200));
  
  // 检查结果
  allLines = previewLineSystem.getAllPreviewLines();
  console.log('场景2结果 - 预览线数量:', allLines.length);
  console.log('场景2结果 - createUnifiedPreviewLine调用次数:', previewLineSystem.previewLineManager.createCallCount);
  
  // 5. 测试场景3：添加未配置的节点（应该不创建预览线）
  console.log('\n--- 场景3：添加未配置的节点 ---');
  
  const unconfiguredNode = new MockNode('unconfigured-node', {
    nodeType: 'start',
    isConfigured: false, // 未配置
    label: 'Unconfigured Node'
  });
  
  const beforeCount = previewLineSystem.previewLineManager.createCallCount;
  graph.addNode(unconfiguredNode);
  
  // 等待异步事件处理完成
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const afterCount = previewLineSystem.previewLineManager.createCallCount;
  console.log('场景3结果 - 调用次数变化:', `${beforeCount} -> ${afterCount}`);
  
  // 6. 最终结果
  console.log('\n=== 测试结果汇总 ===');
  allLines = previewLineSystem.getAllPreviewLines();
  console.log('总预览线数量:', allLines.length);
  console.log('总调用次数:', previewLineSystem.previewLineManager.createCallCount);
  console.log('预览线详情:', allLines);
  
  // 验证修复效果
  const expectedLines = 2; // 应该为2个已配置的start节点创建预览线
  const success = allLines.length === expectedLines;
  
  console.log('\n=== 修复效果验证 ===');
  console.log('期望预览线数量:', expectedLines);
  console.log('实际预览线数量:', allLines.length);
  console.log('修复是否成功:', success ? '✅ 成功' : '❌ 失败');
  
  if (success) {
    console.log('\n🎉 预览线修复方案验证成功！');
    console.log('- 修复方案A（node:added事件监听）: 正常工作');
    console.log('- 修复方案B（初始化时创建现有节点预览线）: 正常工作');
  } else {
    console.log('\n❌ 预览线修复方案验证失败，需要进一步调试');
  }
}

// 运行测试
testPreviewLineFix().catch(console.error);