/**
 * 调试预览线删除失败问题
 * 重现 failedDeletes: 1 的情况
 */

import { PreviewLineSystem } from './src/utils/preview-line/PreviewLineSystem.js';

/**
 * 模拟图实例
 */
class MockGraph {
  constructor() {
    this.cells = new Map();
    this.removedCells = new Set();
  }

  hasCell(id) {
    const exists = this.cells.has(id) && !this.removedCells.has(id);
    console.log(`📋 MockGraph.hasCell(${id}): ${exists}`);
    return exists;
  }

  removeCell(id) {
    console.log(`🗑️ MockGraph.removeCell(${id})`);
    if (!this.cells.has(id)) {
      console.warn(`⚠️ 尝试删除不存在的cell: ${id}`);
      return false;
    }
    this.removedCells.add(id);
    return true;
  }

  addCell(cell) {
    this.cells.set(cell.id, cell);
    console.log(`➕ MockGraph.addCell(${cell.id})`);
  }

  getCells() {
    return Array.from(this.cells.values()).filter(cell => !this.removedCells.has(cell.id));
  }
}

/**
 * 模拟布局引擎
 */
class MockLayoutEngine {
  constructor() {
    this.nodes = new Map();
  }

  addNode(node) {
    this.nodes.set(node.id, node);
  }

  getNodes() {
    return Array.from(this.nodes.values());
  }

  getNode(id) {
    return this.nodes.get(id);
  }
}

/**
 * 创建测试节点
 */
function createTestNode(id, type = 'sms') {
  return {
    id: id,
    data: {
      type: type,
      nodeType: type,
      isConfigured: true
    },
    store: {
      data: {
        data: {
          type: type,
          nodeType: type,
          isConfigured: true
        }
      }
    }
  };
}

/**
 * 测试删除失败的场景
 */
async function testDeleteFailureScenarios() {
  console.log('🔍 开始测试预览线删除失败场景...');
  
  try {
    // 创建模拟图实例和布局引擎
    const mockGraph = new MockGraph();
    const mockLayoutEngine = new MockLayoutEngine();
    
    // 创建预览线系统
    const previewLineSystem = new PreviewLineSystem({
      graph: mockGraph,
      layoutEngine: mockLayoutEngine,
      system: {
        autoInit: false,
        enableDebug: true
      }
    });
    
    // 手动初始化
    const initSuccess = await previewLineSystem.init();
    if (!initSuccess) {
      console.error('❌ PreviewLineSystem初始化失败');
      return;
    }
    
    console.log('✅ PreviewLineSystem初始化成功');
    
    // 创建测试节点
    const testNode = createTestNode('test-node-1', 'sms');
    mockGraph.addCell(testNode);
    mockLayoutEngine.addNode(testNode);
    
    console.log('📝 创建预览线...');
    
    // 场景1: 测试图中cell状态不一致
    console.log('\n🧪 场景1: 图中cell状态不一致');
    const previewLine1 = {
      id: 'preview-line-1',
      sourceNodeId: 'test-node-1',
      targetNodeId: 'test-node-2'
    };
    
    // 模拟预览线存在但图中cell不存在的情况
    mockGraph.cells.delete('preview-line-1'); // 确保cell不存在
    
    try {
      const deleteResult1 = await previewLineSystem.deletePreviewLine('preview-line-1');
      console.log('🔍 删除结果1:', deleteResult1);
    } catch (error) {
      console.log('❌ 删除失败1:', error.message);
    }
    
    // 场景2: 测试removeCell方法抛出异常
    console.log('\n🧪 场景2: removeCell方法抛出异常');
    const previewLine2 = {
      id: 'preview-line-2',
      sourceNodeId: 'test-node-1',
      targetNodeId: 'test-node-2'
    };
    
    mockGraph.addCell(previewLine2);
    
    // 模拟removeCell抛出异常
    const originalRemoveCell = mockGraph.removeCell;
    mockGraph.removeCell = function(id) {
      if (id === 'preview-line-2') {
        throw new Error('模拟removeCell异常');
      }
      return originalRemoveCell.call(this, id);
    };
    
    try {
      const deleteResult2 = await previewLineSystem.deletePreviewLine('preview-line-2');
      console.log('🔍 删除结果2:', deleteResult2);
    } catch (error) {
      console.log('❌ 删除失败2:', error.message);
    }
    
    // 恢复原始方法
    mockGraph.removeCell = originalRemoveCell;
    
    // 场景3: 测试forceRegeneratePreviewLines中的删除失败
    console.log('\n🧪 场景3: forceRegeneratePreviewLines中的删除失败');
    
    // 添加一些预览线到系统中
    const previewLine3 = {
      id: 'preview-line-3',
      sourceNodeId: 'test-node-1',
      targetNodeId: 'test-node-2'
    };
    
    mockGraph.addCell(previewLine3);
    
    // 模拟删除时的异常
    const originalDeletePreviewLine = previewLineSystem.deletePreviewLine;
    let deleteCallCount = 0;
    previewLineSystem.deletePreviewLine = async function(id) {
      deleteCallCount++;
      if (deleteCallCount === 1) {
        throw new Error('模拟删除异常');
      }
      return originalDeletePreviewLine.call(this, id);
    };
    
    try {
      const regenerateResult = await previewLineSystem.forceRegeneratePreviewLines();
      console.log('🔍 重新生成结果:', regenerateResult);
      console.log('📊 统计信息:', previewLineSystem.getStats());
    } catch (error) {
      console.log('❌ 重新生成失败:', error.message);
    }
    
    // 恢复原始方法
    previewLineSystem.deletePreviewLine = originalDeletePreviewLine;
    
    if (regenerateResult && regenerateResult.failedDeletes > 0) {
      console.log('✅ 成功重现了删除失败的情况');
      return true;
    }
    
    return false;
    
  } catch (error) {
    console.error('❌ 测试删除失败场景出错:', error.message);
    return false;
  }
}

/**
 * 运行测试
 */
async function runTest() {
  console.log('🚀 开始调试预览线删除失败问题');
  
  const success = await testDeleteFailureScenarios();
  
  if (success) {
    console.log('\n✅ 成功重现删除失败问题，现在可以进行修复');
  } else {
    console.log('\n❌ 未能重现删除失败问题');
  }
}

// 运行测试
runTest().catch(console.error);