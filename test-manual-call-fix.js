// 测试manual-call节点预览线生成修复效果

/**
 * 测试manual-call节点预览线生成
 */
function testManualCallPreviewLineFix() {
  console.log('🧪 [测试] 开始测试manual-call节点预览线生成修复效果');
  
  // 获取图实例 - 扩展搜索范围
  let graphInstance = null;
  const possibleGraphPaths = [
    'window.graphInstance',
    'window.graph', 
    'window.taskFlowGraph',
    'window.canvasGraph',
    'window.flowGraph',
    'window.x6Graph'
  ];
  
  // 尝试从多个可能的位置获取图实例
  for (const path of possibleGraphPaths) {
    try {
      const instance = eval(path);
      if (instance && typeof instance.getNodes === 'function') {
        graphInstance = instance;
        console.log(`✅ [测试] 从 ${path} 找到图实例`);
        break;
      }
    } catch (e) {
      // 忽略访问错误，继续尝试下一个
    }
  }
  
  // 如果还没找到，尝试从Vue组件实例获取
  if (!graphInstance) {
    try {
      const vueApp = document.querySelector('#app')?.__vue_app__;
      if (vueApp) {
        const instances = vueApp._instance?.appContext?.app?._container?.__vue_app__?._instance?.refs;
        if (instances) {
          for (const key in instances) {
            const instance = instances[key];
            if (instance && instance.graph && typeof instance.graph.getNodes === 'function') {
              graphInstance = instance.graph;
              console.log(`✅ [测试] 从Vue组件实例 ${key} 找到图实例`);
              break;
            }
          }
        }
      }
    } catch (e) {
      console.warn('⚠️ [测试] 从Vue组件获取图实例失败:', e.message);
    }
  }
  
  // 如果还没找到，尝试从DOM元素获取
  if (!graphInstance) {
    try {
      const canvasElements = document.querySelectorAll('canvas, svg, .x6-graph, .graph-container');
      for (const element of canvasElements) {
        if (element.__x6_graph__ && typeof element.__x6_graph__.getNodes === 'function') {
          graphInstance = element.__x6_graph__;
          console.log('✅ [测试] 从DOM元素找到图实例');
          break;
        }
        if (element.graph && typeof element.graph.getNodes === 'function') {
          graphInstance = element.graph;
          console.log('✅ [测试] 从DOM元素的graph属性找到图实例');
          break;
        }
      }
    } catch (e) {
      console.warn('⚠️ [测试] 从DOM元素获取图实例失败:', e.message);
    }
  }
  
  // 最终检查
  if (!graphInstance) {
    console.error('❌ [测试] 未找到图实例，已尝试以下路径:', possibleGraphPaths);
    console.log('🔍 [测试] 当前window对象的相关属性:', {
      hasGraphInstance: !!window.graphInstance,
      hasGraph: !!window.graph,
      hasTaskFlowGraph: !!window.taskFlowGraph,
      hasCanvasGraph: !!window.canvasGraph,
      windowKeys: Object.keys(window).filter(key => key.toLowerCase().includes('graph'))
    });
    
    // 提供重试机制
    console.log('🔄 [测试] 将在3秒后重试...');
    setTimeout(() => {
      console.log('🔄 [测试] 重试获取图实例...');
      testManualCallPreviewLineFix();
    }, 3000);
    return;
  }
  
  // 验证图实例的可用性
  try {
    const nodes = graphInstance.getNodes();
    console.log('✅ [测试] 图实例验证成功，节点数量:', nodes.length);
  } catch (e) {
    console.error('❌ [测试] 图实例不可用:', e.message);
    return;
  }
  
  // 查找manual-call节点
  const nodes = graphInstance.getNodes();
  const manualCallNodes = nodes.filter(node => {
    const nodeData = node.getData() || {};
    return nodeData.type === 'manual-call' || nodeData.nodeType === 'manual-call';
  });
  
  console.log('🔍 [测试] 找到manual-call节点:', {
    totalNodes: nodes.length,
    manualCallNodes: manualCallNodes.length,
    nodeIds: manualCallNodes.map(n => n.id)
  });
  
  if (manualCallNodes.length === 0) {
    console.warn('⚠️ [测试] 未找到manual-call节点');
    return;
  }
  
  // 测试每个manual-call节点
  manualCallNodes.forEach((node, index) => {
    const nodeData = node.getData() || {};
    
    console.log(`🧪 [测试] 测试第${index + 1}个manual-call节点:`, {
      nodeId: node.id,
      nodeType: nodeData.type || nodeData.nodeType,
      isConfigured: nodeData.isConfigured,
      hasConfig: !!(nodeData.config && Object.keys(nodeData.config).length > 0),
      configKeys: nodeData.config ? Object.keys(nodeData.config) : [],
      nodeData: nodeData
    });
    
    // 获取预览线管理器
    const previewManager = window.unifiedPreviewLineManager;
    if (!previewManager) {
      console.error('❌ [测试] 未找到预览线管理器');
      return;
    }
    
    // 测试shouldCreatePreviewLine方法
    try {
      const shouldCreate = previewManager.shouldCreatePreviewLine(node);
      console.log(`🔍 [测试] shouldCreatePreviewLine结果:`, {
        nodeId: node.id,
        shouldCreate,
        nodeType: nodeData.type || nodeData.nodeType
      });
      
      // 测试shouldNodeBeConfigured方法
      const shouldBeConfigured = previewManager.shouldNodeBeConfigured(nodeData, nodeData.type || nodeData.nodeType);
      console.log(`🔍 [测试] shouldNodeBeConfigured结果:`, {
        nodeId: node.id,
        shouldBeConfigured,
        nodeType: nodeData.type || nodeData.nodeType
      });
      
    } catch (error) {
      console.error('❌ [测试] 测试过程中出现错误:', {
        nodeId: node.id,
        error: error.message,
        stack: error.stack
      });
    }
  });
  
  // 测试strictNodeTypes配置
  if (window.unifiedPreviewLineManager) {
    console.log('🔍 [测试] 检查strictNodeTypes配置');
    // 由于strictNodeTypes是私有变量，我们通过测试方法来验证
    const testNode = { getData: () => ({ type: 'manual-call', isConfigured: true }) };
    const result = window.unifiedPreviewLineManager.shouldNodeBeConfigured(
      { type: 'manual-call', isConfigured: true }, 
      'manual-call'
    );
    console.log('🔍 [测试] manual-call节点类型识别测试:', {
      nodeType: 'manual-call',
      shouldBeConfigured: result,
      expected: true
    });
  }
  
  console.log('✅ [测试] manual-call节点预览线生成测试完成');
}

// 导出测试函数
if (typeof window !== 'undefined') {
  window.testManualCallPreviewLineFix = testManualCallPreviewLineFix;
}

console.log('📋 [测试脚本] 测试脚本已加载，请在浏览器控制台运行: testManualCallPreviewLineFix()');