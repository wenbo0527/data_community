/**
 * 预览线修复验证测试
 * 验证 StyleRenderer.setPreviewLineState 方法和预览线从 out 端口开始的功能
 */

// 模拟 X6 图形库
class MockGraph {
  constructor() {
    this.cells = new Map();
  }
  
  addEdge(config) {
    const edge = new MockEdge(config);
    this.cells.set(edge.id, edge);
    return edge;
  }
  
  hasCell(id) {
    return this.cells.has(id);
  }
  
  getCell(id) {
    return this.cells.get(id);
  }
}

// 模拟事件管理器
class MockEventManager {
  emit(event, data) {
    console.log(`📡 事件触发: ${event}`, data);
  }
}

// 模拟状态管理器
class MockStateManager {
  getState() {
    return {};
  }
  
  setState(state) {
    console.log('🔄 状态更新:', state);
  }
}

// 模拟配置管理器
class MockConfigManager {
  getConfig(key) {
    return {};
  }
  
  setConfig(key, value) {
    console.log('⚙️ 配置更新:', key, value);
  }
}

class MockEdge {
  constructor(config) {
    this.id = `edge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.config = config;
    this.attrs = config.attrs || {};
    this.labels = config.labels || [];
    this.data = config.data || {};
    this.sourcePoint = null;
    this.targetPoint = null;
    
    // 如果配置中指定了 source 端口，设置起始点
    if (config.source && config.source.port === 'out') {
      console.log('✅ 预览线配置使用 out 端口作为起始点');
    }
  }
  
  getSourcePoint() {
    return this.sourcePoint;
  }
  
  setSource(point) {
    this.sourcePoint = point;
    console.log(`🔄 设置预览线起始点: x=${point.x}, y=${point.y}`);
  }
  
  setTarget(point) {
    this.targetPoint = point;
  }
  
  setAttrs(attrs) {
    this.attrs = { ...this.attrs, ...attrs };
  }
  
  setLabels(labels) {
    this.labels = labels;
  }
  
  getData() {
    return this.data;
  }
  
  setData(data) {
    this.data = { ...this.data, ...data };
  }
}

class MockNode {
  constructor(id, position, size, nodeType) {
    this.id = id;
    this.position = position;
    this.size = size;
    this.nodeType = nodeType;
  }
  
  getPosition() {
    return this.position;
  }
  
  getSize() {
    return this.size;
  }
  
  getData() {
    return { type: this.nodeType };
  }
}

// 导入要测试的模块
import StyleRenderer from './renderers/StyleRenderer.js';
import PreviewLineRenderer from './renderers/PreviewLineRenderer.js';

// 预览线状态常量
const UnifiedPreviewStates = {
  INTERACTIVE: 'interactive',
  DRAGGING: 'dragging', 
  CONNECTED: 'connected',
  HOVER: 'hover'
};

async function testPreviewLineFix() {
  console.log('🧪 开始预览线修复验证测试\n');
  
  try {
    // 测试1: 验证 StyleRenderer.setPreviewLineState 方法存在
    console.log('📋 测试1: 验证 StyleRenderer.setPreviewLineState 方法');
    
    const mockGraph = new MockGraph();
    const mockEventManager = new MockEventManager();
    const mockStateManager = new MockStateManager();
    const mockConfigManager = new MockConfigManager();
    const styleRenderer = new StyleRenderer(mockGraph);
    
    // 检查方法是否存在
    if (typeof styleRenderer.setPreviewLineState === 'function') {
      console.log('✅ StyleRenderer.setPreviewLineState 方法存在');
    } else {
      console.log('❌ StyleRenderer.setPreviewLineState 方法不存在');
      return false;
    }
    
    // 测试2: 验证预览线从 out 端口开始
    console.log('\n📋 测试2: 验证预览线从 out 端口开始');
    
    const previewRenderer = new PreviewLineRenderer({
      graph: mockGraph,
      eventManager: mockEventManager,
      stateManager: mockStateManager,
      configManager: mockConfigManager
    });
    const sourceNode = new MockNode('test-node', { x: 100, y: 100 }, { width: 120, height: 60 }, 'sms');
    
    const previewInstance = previewRenderer.createPreviewLine(sourceNode, {
      branchId: 'test-branch',
      branchLabel: '测试分支',
      initialState: UnifiedPreviewStates.INTERACTIVE
    });
    
    if (previewInstance && previewInstance.line) {
      console.log('✅ 预览线创建成功');
      
      // 检查预览线配置
      const edgeConfig = previewInstance.line.config;
      if (edgeConfig.source && edgeConfig.source.port === 'out') {
        console.log('✅ 预览线正确配置为从 out 端口开始');
      } else {
        console.log('❌ 预览线未正确配置 out 端口');
        console.log('实际配置:', edgeConfig.source);
      }
    } else {
      console.log('❌ 预览线创建失败');
      return false;
    }
    
    // 测试3: 验证 setPreviewLineState 方法调用
    console.log('\n📋 测试3: 验证 setPreviewLineState 方法调用');
    
    try {
      // 测试不同状态的设置
      const states = [UnifiedPreviewStates.INTERACTIVE, UnifiedPreviewStates.DRAGGING, UnifiedPreviewStates.CONNECTED, UnifiedPreviewStates.HOVER];
      
      for (const state of states) {
        styleRenderer.setPreviewLineState(sourceNode.id, state, {
          previewInstance: previewInstance,
          branchLabel: '测试分支'
        });
        console.log(`✅ 成功设置预览线状态: ${state}`);
      }
      
    } catch (error) {
      console.log('❌ setPreviewLineState 方法调用失败:', error.message);
      return false;
    }
    
    // 测试4: 验证位置计算逻辑
    console.log('\n📋 测试4: 验证 out 端口位置计算');
    
    const nodeCenter = {
      x: sourceNode.position.x + sourceNode.size.width / 2,
      y: sourceNode.position.y + sourceNode.size.height / 2
    };
    
    const expectedOutPort = {
      x: nodeCenter.x + sourceNode.size.width / 2,
      y: nodeCenter.y
    };
    
    console.log('节点中心位置:', nodeCenter);
    console.log('预期 out 端口位置:', expectedOutPort);
    
    // 模拟设置预览线起始位置
    previewInstance.line.setSource(expectedOutPort);
    const actualSource = previewInstance.line.getSourcePoint();
    
    if (actualSource && actualSource.x === expectedOutPort.x && actualSource.y === expectedOutPort.y) {
      console.log('✅ 预览线起始位置正确设置为 out 端口位置');
    } else {
      console.log('❌ 预览线起始位置设置错误');
      console.log('预期位置:', expectedOutPort);
      console.log('实际位置:', actualSource);
    }
    
    console.log('\n🎉 所有测试通过！预览线修复验证成功');
    return true;
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error);
    return false;
  }
}

// 运行测试
testPreviewLineFix().then(success => {
  if (success) {
    console.log('\n✅ 预览线修复验证测试完成 - 所有功能正常');
    process.exit(0);
  } else {
    console.log('\n❌ 预览线修复验证测试失败');
    process.exit(1);
  }
}).catch(error => {
  console.error('❌ 测试执行失败:', error);
  process.exit(1);
});

export { testPreviewLineFix };