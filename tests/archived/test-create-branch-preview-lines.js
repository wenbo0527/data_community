/**
 * 人群分流节点分支预览线创建测试脚本
 * 专门测试createBranchPreviewLines方法的创建流程
 */

// 模拟预览线状态
const UnifiedPreviewStates = {
  PREVIEW: 'preview',
  INTERACTIVE: 'interactive',
  DRAGGING: 'dragging',
  CONNECTING: 'connecting'
};

// 模拟预览线类型
const PreviewLineTypes = {
  PREVIEW: 'preview',
  BRANCH: 'branch',
  SINGLE: 'single'
};

// 模拟节点数据
const mockNodes = {
  // 已配置的人群分流节点
  configuredNode: {
    id: 'audience-split-configured',
    x: 200,
    y: 150,
    width: 120,
    height: 60,
    getData: () => ({
      type: 'audience-split',
      nodeType: 'audience-split',
      isConfigured: true,
      crowdLayers: [
        { id: 'layer1', name: '高价值用户', conditions: [] },
        { id: 'layer2', name: '普通用户', conditions: [] }
      ],
      branches: [
        { id: 'branch-1', label: '高价值用户', type: 'audience' },
        { id: 'branch-2', label: '普通用户', type: 'audience' },
        { id: 'branch-3', label: '未命中人群', type: 'audience', isDefault: true }
      ]
    })
  },
  
  // 未配置的人群分流节点
  unconfiguredNode: {
    id: 'audience-split-unconfigured',
    x: 100,
    y: 100,
    width: 120,
    height: 60,
    getData: () => ({
      type: 'audience-split',
      nodeType: 'audience-split',
      isConfigured: false,
      branches: []
    })
  },
  
  // 有真实连接的节点
  connectedNode: {
    id: 'audience-split-connected',
    x: 300,
    y: 200,
    width: 120,
    height: 60,
    getData: () => ({
      type: 'audience-split',
      nodeType: 'audience-split',
      isConfigured: true,
      branches: [
        { id: 'branch-1', label: '分支1', type: 'audience' },
        { id: 'branch-2', label: '分支2', type: 'audience' }
      ]
    })
  }
};

// 模拟图实例
class MockGraph {
  constructor() {
    this.cells = new Map();
    this.edges = new Map();
  }
  
  hasCell(id) {
    return this.cells.has(id);
  }
  
  addEdge(edgeConfig) {
    const edgeId = `edge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const edge = {
      id: edgeId,
      ...edgeConfig
    };
    this.edges.set(edgeId, edge);
    return edge;
  }
  
  getOutgoingEdges(nodeId) {
    return Array.from(this.edges.values()).filter(edge => edge.source === nodeId);
  }
}

// 模拟预览线管理器
class MockBranchPreviewLineManager {
  constructor() {
    this.graph = new MockGraph();
    this.previewLines = new Map();
    this.layoutEngineReady = true;
    this.debugMode = true;
    
    // 模拟已有连接
    this.realConnections = new Set([
      'audience-split-connected_branch-1',
      'audience-split-connected_branch-2'
    ]);
  }
  
  /**
   * 获取节点分支信息
   */
  getNodeBranches(node, config = null) {
    const nodeData = node.getData ? node.getData() : {};
    
    if (config && config.branches) {
      return config.branches;
    }
    
    if (nodeData.branches && nodeData.branches.length > 0) {
      return nodeData.branches;
    }
    
    // 根据节点类型生成默认分支
    if (nodeData.type === 'audience-split' || nodeData.nodeType === 'audience-split') {
      if (nodeData.crowdLayers && nodeData.crowdLayers.length > 0) {
        const branches = nodeData.crowdLayers.map((layer, index) => ({
          id: `branch-${index + 1}`,
          label: layer.name || `分支${index + 1}`,
          type: 'audience'
        }));
        
        // 添加未命中分支
        branches.push({
          id: `branch-${branches.length + 1}`,
          label: '未命中人群',
          type: 'audience',
          isDefault: true
        });
        
        return branches;
      }
    }
    
    return [];
  }
  
  /**
   * 检查分支是否有真实连接
   */
  checkBranchHasRealConnection(node, branchId) {
    const connectionKey = `${node.id}_${branchId}`;
    return this.realConnections.has(connectionKey);
  }
  
  /**
   * 计算分支预览线位置
   */
  calculateBranchPreviewPosition(node, branches, branchIndex) {
    if (!node || !branches || typeof branchIndex !== 'number') {
      return null;
    }
    
    // 简化的位置计算
    const spacing = 80;
    const totalWidth = (branches.length - 1) * spacing;
    const startX = node.x + node.width / 2 - totalWidth / 2;
    const targetX = startX + branchIndex * spacing;
    const targetY = node.y + node.height + 100; // 下方100px
    
    return {
      x: Math.round(targetX),
      y: Math.round(targetY)
    };
  }
  
  /**
   * 创建基础预览线
   */
  createBasicPreviewLine(node, endPosition, options = {}) {
    if (!node || !endPosition || !this.graph) {
      return null;
    }
    
    const sourcePort = options.sourcePort || 'out';
    const targetPort = options.targetPort || 'in';
    
    const edgeConfig = {
      source: node.id,
      target: `preview_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sourcePort: sourcePort,
      targetPort: targetPort,
      attrs: {
        line: {
          stroke: '#1890ff',
          strokeWidth: 2,
          strokeDasharray: '5,5'
        }
      },
      data: {
        type: 'preview',
        branchId: options.branchId,
        branchLabel: options.branchLabel
      }
    };
    
    return this.graph.addEdge(edgeConfig);
  }
  
  /**
   * 设置预览线状态
   */
  setPreviewLineState(previewInstance, state) {
    if (previewInstance && previewInstance.line) {
      previewInstance.state = state;
      
      // 根据状态设置样式
      const stateStyles = {
        [UnifiedPreviewStates.PREVIEW]: { stroke: '#1890ff', strokeDasharray: '5,5' },
        [UnifiedPreviewStates.INTERACTIVE]: { stroke: '#52c41a', strokeDasharray: '3,3' },
        [UnifiedPreviewStates.DRAGGING]: { stroke: '#faad14', strokeDasharray: '2,2' },
        [UnifiedPreviewStates.CONNECTING]: { stroke: '#f5222d', strokeDasharray: '1,1' }
      };
      
      const style = stateStyles[state] || stateStyles[UnifiedPreviewStates.PREVIEW];
      previewInstance.line.attrs = previewInstance.line.attrs || {};
      previewInstance.line.attrs.line = { ...previewInstance.line.attrs.line, ...style };
    }
  }
  
  /**
   * 创建分支预览线 - 核心方法
   */
  createBranchPreviewLines(node, initialState, options = {}) {
    const nodeId = node.id;
    const nodeData = node.getData ? node.getData() : {};
    const nodeType = nodeData.type || node.type || 'unknown';
    
    console.log('🔧 [测试] 开始创建分支预览线:', {
      nodeId: nodeId,
      nodeType: nodeType,
      initialState: initialState,
      options: options
    });
    
    // 检查是否已经存在预览线实例
    const existingPreview = this.previewLines.get(nodeId);
    if (existingPreview) {
      console.log('⏭️ [测试] 节点已有预览线，跳过重复创建:', {
        nodeId: nodeId,
        existingType: Array.isArray(existingPreview) ? 'branch' : 'single',
        existingCount: Array.isArray(existingPreview) ? existingPreview.length : 1
      });
      return existingPreview;
    }
    
    // 获取分支信息
    const branches = this.getNodeBranches(node, options.config);
    
    console.log('📊 [测试] 获取到分支信息:', {
      nodeId: nodeId,
      branchCount: branches.length,
      branches: branches.map(b => ({ id: b.id, label: b.label }))
    });
    
    if (branches.length === 0) {
      console.log('⚠️ [测试] 节点无分支信息，跳过预览线创建');
      return [];
    }
    
    const previewInstances = [];
    
    branches.forEach((branch, index) => {
      console.log('🌿 [测试] 处理分支预览线:', {
        nodeId: nodeId,
        branchId: branch.id,
        branchLabel: branch.label,
        branchIndex: index,
        totalBranches: branches.length
      });
      
      // 检查该分支是否已有真实连接
      const hasRealConnection = this.checkBranchHasRealConnection(node, branch.id);
      
      console.log('🔗 [测试] 分支连接检查:', {
        nodeId: nodeId,
        branchId: branch.id,
        branchLabel: branch.label,
        hasRealConnection: hasRealConnection
      });
      
      if (hasRealConnection) {
        console.log('⏭️ [测试] 分支已有真实连接，跳过预览线创建:', {
          nodeId: nodeId,
          branchId: branch.id,
          branchLabel: branch.label,
          branchIndex: index
        });
        return; // 跳过已有连接的分支
      }
      
      console.log('✅ [测试] 分支需要创建预览线:', {
        nodeId: nodeId,
        branchId: branch.id,
        branchLabel: branch.label,
        branchIndex: index
      });
      
      const endPosition = this.calculateBranchPreviewPosition(node, branches, index);
      
      if (!endPosition) {
        console.error('❌ [测试] 无法计算分支预览线终点位置:', {
          nodeId: nodeId,
          nodeType: nodeType,
          branchId: branch.id,
          branchLabel: branch.label,
          branchIndex: index,
          totalBranches: branches.length
        });
        return;
      }
      
      // 验证分支终点位置的有效性
      if (typeof endPosition.x !== 'number' || typeof endPosition.y !== 'number' || 
          !isFinite(endPosition.x) || !isFinite(endPosition.y)) {
        console.error('❌ [测试] 计算得到的分支终点位置无效:', {
          nodeId: nodeId,
          branchId: branch.id,
          branchLabel: branch.label,
          branchIndex: index,
          endPosition: endPosition
        });
        return;
      }
      
      // 创建分支预览线
      const previewLine = this.createBasicPreviewLine(node, endPosition, {
        type: PreviewLineTypes.PREVIEW,
        branchId: branch.id,
        branchIndex: index,
        totalBranches: branches.length,
        branchLabel: branch.label,
        ...options
      });
      
      if (!previewLine) {
        console.error('❌ [测试] 分支预览线创建失败:', {
          nodeId: node.id,
          nodeType: nodeType,
          branchId: branch.id,
          branchLabel: branch.label,
          branchIndex: index,
          totalBranches: branches.length,
          endPosition: endPosition
        });
        return;
      }
      
      // 验证创建的分支预览线对象
      if (!previewLine.id) {
        console.error('❌ [测试] 创建的分支预览线缺少ID:', {
          nodeId: node.id,
          branchId: branch.id,
          branchLabel: branch.label,
          branchIndex: index,
          previewLine: previewLine
        });
        return;
      }
      
      // 创建预览线实例
      const previewInstance = {
        line: previewLine,
        sourceNode: node,
        state: initialState,
        type: PreviewLineTypes.PREVIEW,
        branchId: branch.id,
        branchLabel: branch.label,
        branchIndex: index,
        totalBranches: branches.length,
        dragHandler: null,
        hintNode: null,
        endPosition: endPosition,
        branchInfo: branch
      };
      
      // 设置初始状态
      this.setPreviewLineState(previewInstance, initialState);
      
      previewInstances.push(previewInstance);
      
      console.log('✅ [测试] 分支预览线创建成功:', {
        nodeId: nodeId,
        branchId: branch.id,
        branchLabel: branch.label,
        branchIndex: index,
        lineId: previewLine.id
      });
    });
    
    // 只有在有预览线实例时才存储
    if (previewInstances.length > 0) {
      this.previewLines.set(node.id, previewInstances);
    }
    
    console.log('✅ [测试] 分支预览线创建完成:', {
      nodeId: nodeId,
      totalBranches: branches.length,
      createdCount: previewInstances.length,
      skippedCount: branches.length - previewInstances.length,
      totalPreviewLines: this.previewLines.size
    });
    
    return previewInstances;
  }
}

// 运行分支预览线创建测试
function runBranchPreviewLineCreationTests() {
  console.log('🎯 人群分流节点分支预览线创建测试开始');
  console.log('='.repeat(60));
  
  const manager = new MockBranchPreviewLineManager();
  let totalTests = 0;
  let passedTests = 0;
  
  // 测试用例
  const testCases = [
    {
      name: '已配置节点 - 创建分支预览线',
      node: mockNodes.configuredNode,
      state: UnifiedPreviewStates.PREVIEW,
      expectedBranches: 3,
      expectedCreated: 3
    },
    {
      name: '未配置节点 - 无分支信息',
      node: mockNodes.unconfiguredNode,
      state: UnifiedPreviewStates.PREVIEW,
      expectedBranches: 0,
      expectedCreated: 0
    },
    {
      name: '有连接节点 - 跳过已连接分支',
      node: mockNodes.connectedNode,
      state: UnifiedPreviewStates.INTERACTIVE,
      expectedBranches: 2,
      expectedCreated: 0 // 所有分支都有连接
    },
    {
      name: '重复创建 - 跳过已存在预览线',
      node: mockNodes.configuredNode,
      state: UnifiedPreviewStates.PREVIEW,
      expectedBranches: 3,
      expectedCreated: 3 // 第二次调用应该返回已存在的
    }
  ];
  
  testCases.forEach((testCase, index) => {
    console.log(`\n📋 测试用例 ${index + 1}: ${testCase.name}`);
    console.log('-'.repeat(40));
    
    totalTests++;
    
    try {
      const result = manager.createBranchPreviewLines(
        testCase.node,
        testCase.state,
        {}
      );
      
      const actualCreated = Array.isArray(result) ? result.length : 0;
      
      console.log(`📊 测试结果:`);
      console.log(`  预期创建数: ${testCase.expectedCreated}`);
      console.log(`  实际创建数: ${actualCreated}`);
      
      if (actualCreated === testCase.expectedCreated) {
        console.log(`✅ 测试通过`);
        passedTests++;
      } else {
        console.log(`❌ 测试失败 - 创建数量不匹配`);
      }
      
      // 验证预览线实例结构
      if (Array.isArray(result) && result.length > 0) {
        const firstInstance = result[0];
        const hasRequiredFields = firstInstance.line && 
                                 firstInstance.sourceNode && 
                                 firstInstance.branchId && 
                                 firstInstance.branchLabel;
        
        if (hasRequiredFields) {
          console.log(`✅ 预览线实例结构正确`);
        } else {
          console.log(`❌ 预览线实例结构不完整`);
        }
      }
      
    } catch (error) {
      console.log(`❌ 测试异常: ${error.message}`);
      console.log(`   堆栈: ${error.stack}`);
    }
  });
  
  // 测试边界情况
  console.log('\n🔍 测试边界情况');
  console.log('-'.repeat(40));
  
  const edgeCases = [
    { name: '空节点', node: null, state: UnifiedPreviewStates.PREVIEW },
    { name: '无getData方法的节点', node: { id: 'test' }, state: UnifiedPreviewStates.PREVIEW },
    { name: '无效状态', node: mockNodes.configuredNode, state: 'invalid_state' }
  ];
  
  edgeCases.forEach(testCase => {
    totalTests++;
    
    try {
      const result = manager.createBranchPreviewLines(
        testCase.node,
        testCase.state,
        {}
      );
      
      // 边界情况应该优雅处理
      if (result !== null && result !== undefined) {
        console.log(`✅ ${testCase.name} 正确处理`);
        passedTests++;
      } else {
        console.log(`❌ ${testCase.name} 处理错误`);
      }
    } catch (error) {
      console.log(`❌ ${testCase.name} 处理异常: ${error.message}`);
    }
  });
  
  // 输出测试总结
  console.log('\n' + '='.repeat(60));
  console.log('📊 分支预览线创建测试总结:');
  console.log(`总测试数: ${totalTests}`);
  console.log(`通过测试: ${passedTests}`);
  console.log(`失败测试: ${totalTests - passedTests}`);
  console.log(`通过率: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  
  if (passedTests === totalTests) {
    console.log('🎉 所有分支预览线创建测试通过！');
  } else {
    console.log('⚠️ 部分分支预览线创建测试失败');
    provideBranchPreviewLineFixSuggestions();
  }
  
  return passedTests === totalTests;
}

// 提供分支预览线创建修复建议
function provideBranchPreviewLineFixSuggestions() {
  console.log('\n💡 分支预览线创建修复建议:');
  console.log('1. 检查节点分支信息获取逻辑');
  console.log('2. 验证真实连接检查机制');
  console.log('3. 确保位置计算方法正确');
  console.log('4. 检查基础预览线创建逻辑');
  console.log('5. 验证预览线实例结构完整性');
  console.log('6. 确保状态设置正确');
  console.log('7. 检查重复创建防护机制');
  console.log('8. 验证边界情况处理');
}

// 如果在Node.js环境中运行
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    runBranchPreviewLineCreationTests,
    MockBranchPreviewLineManager,
    mockNodes
  };
}

// 如果在浏览器环境中运行
if (typeof window !== 'undefined') {
  window.runBranchPreviewLineCreationTests = runBranchPreviewLineCreationTests;
  window.MockBranchPreviewLineManager = MockBranchPreviewLineManager;
  window.mockNodes = mockNodes;
}

// 自动运行测试
runBranchPreviewLineCreationTests();