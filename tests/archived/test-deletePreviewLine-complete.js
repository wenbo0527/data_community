/**
 * 完整的 deletePreviewLine 功能测试
 * 测试预览线删除功能的各个方面
 */

import { PreviewLineSystem } from './src/utils/preview-line/PreviewLineSystem.js';
import PreviewLineRenderer from './src/utils/preview-line/renderers/PreviewLineRenderer.js';

/**
 * 模拟图实例
 */
class MockGraph {
  constructor() {
    this.nodes = new Map();
    this.edges = new Map();
  }

  addNode(node) {
    this.nodes.set(node.id, node);
    return node;
  }

  removeNode(nodeId) {
    return this.nodes.delete(nodeId);
  }

  getNodes() {
    return Array.from(this.nodes.values());
  }

  addEdge(edgeConfig) {
    // 模拟X6的addEdge方法，返回一个边对象
    const edge = {
      id: edgeConfig.id,
      ...edgeConfig,
      getData: () => edgeConfig.data || {},
      setTarget: (target) => { edge.target = target; },
      setAttrs: (attrs) => { edge.attrs = { ...edge.attrs, ...attrs }; },
      setLabels: (labels) => { edge.labels = labels; },
      setData: (data) => { edge.data = data; }
    };
    this.edges.set(edge.id, edge);
    return edge;
  }

  removeEdge(edgeId) {
    return this.edges.delete(edgeId);
  }

  getEdges() {
    return Array.from(this.edges.values());
  }

  hasCell(cellId) {
    return this.nodes.has(cellId) || this.edges.has(cellId);
  }

  removeCell(cellId) {
    const removedNode = this.nodes.delete(cellId);
    const removedEdge = this.edges.delete(cellId);
    return removedNode || removedEdge;
  }
}

/**
 * 创建测试用的源节点
 * @param {string} nodeId - 节点ID
 * @returns {Object} 源节点对象
 */
function createTestSourceNode(nodeId = 'test-node') {
  return {
    id: nodeId,
    getData() {
      return {
        type: 'start',
        nodeType: 'start'
      };
    },
    getPosition() {
      return { x: 100, y: 100 };
    },
    getSize() {
      return { width: 120, height: 60 };
    },
    removed: false,
    isRemoved() {
      return this.removed;
    }
  };
}

/**
 * 创建测试用的预览线配置
 */
function createTestPreviewLineConfig(id = 'test-line-1') {
  return {
    branchId: id,
    branchLabel: '测试分支',
    type: 'single',
    target: { x: 200, y: 200 }
  };
}

/**
 * 测试 PreviewLineRenderer 的 deletePreviewLine 方法
 */
async function testRendererDeletePreviewLine() {
  console.log('\n🧪 测试 PreviewLineRenderer.deletePreviewLine 方法');
  
  try {
    const mockGraph = new MockGraph();
    
    const renderer = new PreviewLineRenderer();
    renderer.graph = mockGraph; // 设置图实例
    
    // 验证方法存在
    if (typeof renderer.deletePreviewLine !== 'function') {
      throw new Error('deletePreviewLine 方法不存在');
    }
    console.log('✅ deletePreviewLine 方法存在');
    
    // 创建一个预览线
    const testNode = createTestSourceNode();
    const testConfig = createTestPreviewLineConfig();
    const createdLine = await renderer.createPreviewLine(testNode, testConfig);
    
    if (!createdLine) {
      throw new Error('创建预览线失败');
    }
    console.log('✅ 成功创建测试预览线:', createdLine.id);
    
    // 验证预览线存在于渲染器中
    const existsBefore = renderer.hasPreviewLine(createdLine.id);
    if (!existsBefore) {
      throw new Error('创建的预览线未在渲染器中找到');
    }
    console.log('✅ 预览线在渲染器中存在');
    
    // 删除预览线
    const deleteResult = await renderer.deletePreviewLine(createdLine.id);
    
    if (!deleteResult) {
      throw new Error('删除预览线失败');
    }
    console.log('✅ 成功删除预览线');
    
    // 验证预览线已被删除
    const existsAfter = renderer.hasPreviewLine(createdLine.id);
    if (existsAfter) {
      throw new Error('预览线删除后仍然存在');
    }
    console.log('✅ 预览线已从渲染器中移除');
    
    return true;
  } catch (error) {
    console.error('❌ PreviewLineRenderer.deletePreviewLine 测试失败:', error.message);
    return false;
  }
}

/**
 * 测试 PreviewLineSystem 的 deletePreviewLine 方法
 */
async function testSystemDeletePreviewLine() {
  console.log('\n🧪 测试 PreviewLineSystem.deletePreviewLine 方法');
  
  try {
    const mockGraph = new MockGraph();
    
    const system = new PreviewLineSystem();
    system.graph = mockGraph; // 设置图实例
    
    // 初始化系统
    const initResult = await system.init();
    if (!initResult) {
      throw new Error('PreviewLineSystem 初始化失败');
    }
    console.log('✅ PreviewLineSystem 初始化成功');
    
    // 验证方法存在
    if (typeof system.deletePreviewLine !== 'function') {
      throw new Error('deletePreviewLine 方法不存在');
    }
    console.log('✅ deletePreviewLine 方法存在');
    
    // 创建一个预览线
    const testNode = createTestSourceNode('system-test-node');
    const testConfig = createTestPreviewLineConfig('system-test-line');
    const createdLine = await system.createPreviewLine(testNode, testConfig);
    
    if (!createdLine) {
      throw new Error('创建预览线失败');
    }
    console.log('✅ 成功创建测试预览线:', createdLine.id);
    
    // 验证预览线存在于系统中
    const existsBefore = system.hasPreviewLine(createdLine.id);
    if (!existsBefore) {
      throw new Error('创建的预览线未在系统中找到');
    }
    console.log('✅ 预览线在系统中存在');
    
    // 删除预览线
    const deleteResult = await system.deletePreviewLine(createdLine.id);
    
    if (!deleteResult) {
      throw new Error('删除预览线失败');
    }
    console.log('✅ 成功删除预览线');
    
    // 验证预览线已被删除
    const existsAfter = system.hasPreviewLine(createdLine.id);
    if (existsAfter) {
      throw new Error('预览线删除后仍然存在');
    }
    console.log('✅ 预览线已从系统中移除');
    
    return true;
  } catch (error) {
    console.error('❌ PreviewLineSystem.deletePreviewLine 测试失败:', error.message);
    return false;
  }
}

/**
 * 测试 forceRegeneratePreviewLines 方法
 */
async function testForceRegeneratePreviewLines() {
  console.log('\n🧪 测试 forceRegeneratePreviewLines 方法');
  
  try {
    const mockGraph = new MockGraph();
    
    const system = new PreviewLineSystem();
    system.graph = mockGraph; // 设置图实例
    
    // 初始化系统
    const initResult = await system.init();
    if (!initResult) {
      throw new Error('PreviewLineSystem 初始化失败');
    }
    console.log('✅ PreviewLineSystem 初始化成功');
    
    // 创建多个预览线
    const testLines = [];
    for (let i = 1; i <= 3; i++) {
      const testNode = createTestSourceNode(`regen-test-node-${i}`);
      const testConfig = createTestPreviewLineConfig(`regen-test-line-${i}`);
      const createdLine = await system.createPreviewLine(testNode, testConfig);
      if (createdLine) {
        testLines.push(createdLine);
      }
    }
    
    console.log(`✅ 成功创建 ${testLines.length} 个测试预览线`);
    
    // 验证预览线存在
    const beforeCount = system.getAllPreviewLines().length;
    console.log(`✅ 重新生成前预览线数量: ${beforeCount}`);
    
    // 执行强制重新生成
    const regenerateResult = await system.forceRegeneratePreviewLines();
    
    if (!regenerateResult || !regenerateResult.success) {
      throw new Error('强制重新生成失败');
    }
    console.log('✅ 强制重新生成成功');
    console.log(`✅ 删除了 ${regenerateResult.deletedCount} 个预览线`);
    console.log(`✅ 失败删除 ${regenerateResult.failedDeletes} 个预览线`);
    
    return true;
  } catch (error) {
    console.error('❌ forceRegeneratePreviewLines 测试失败:', error.message);
    return false;
  }
}

/**
 * 运行所有测试
 */
async function runAllTests() {
  console.log('🚀 开始运行完整的 deletePreviewLine 功能测试');
  console.log('============================================================');
  
  const results = [];
  
  // 测试渲染器的 deletePreviewLine
  results.push({
    name: 'PreviewLineRenderer.deletePreviewLine',
    passed: await testRendererDeletePreviewLine()
  });
  
  // 测试系统的 deletePreviewLine
  results.push({
    name: 'PreviewLineSystem.deletePreviewLine',
    passed: await testSystemDeletePreviewLine()
  });
  
  // 测试强制重新生成
  results.push({
    name: 'forceRegeneratePreviewLines',
    passed: await testForceRegeneratePreviewLines()
  });
  
  // 输出测试结果
  console.log('\n============================================================');
  console.log('📋 测试结果汇总:');
  
  let allPassed = true;
  results.forEach((result, index) => {
    const status = result.passed ? '✅ 通过' : '❌ 失败';
    console.log(`${index + 1}. ${result.name}: ${status}`);
    if (!result.passed) {
      allPassed = false;
    }
  });
  
  console.log('\n============================================================');
  if (allPassed) {
    console.log('🎉 所有测试通过！deletePreviewLine 功能完全正常。');
  } else {
    console.log('⚠️ 部分测试失败，请检查相关功能。');
  }
  
  return allPassed;
}

// 运行测试
runAllTests().catch(error => {
  console.error('❌ 测试运行失败:', error);
  process.exit(1);
});