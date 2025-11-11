// 端口DOM诊断脚本 - 增强版
class PortDOMDiagnostic {
  constructor() {
    this.graph = null;
    this.diagnosticResults = {
      x6Instance: false,
      portGroups: false,
      nodeCount: 0,
      portElements: 0,
      circleElements: 0,
      portConfigurations: [],
      errors: []
    };
  }

  // 运行完整诊断
  runFullDiagnostic() {
    console.log('🚀 [端口诊断] 开始完整诊断...');
    
    this.checkX6Instance();
    this.checkPortGroups();
    this.checkNodes();
    this.checkPortElements();
    this.checkPortConfigurations();
    this.testPortInteraction();
    
    this.printDiagnosticSummary();
  }

  // 检查X6图实例
  checkX6Instance() {
    console.log('🔍 [端口诊断] 检查X6图实例...');
    // 优先使用已注入的 graph，其次再从全局读取
    if (!this.graph) {
      this.graph = window.graph || window.x6Graph;
    }
    
    if (this.graph) {
      this.diagnosticResults.x6Instance = true;
      console.log('✅ X6图实例找到');
      console.log('📊 图实例信息:', {
        container: !!this.graph.container,
        nodes: this.graph.getNodes().length,
        edges: this.graph.getEdges().length,
        options: Object.keys(this.graph.options || {})
      });
    } else {
      this.diagnosticResults.errors.push('X6图实例未找到');
      console.error('❌ X6图实例未找到');
    }
  }

  // 检查端口组配置
  checkPortGroups() {
    console.log('🔍 [端口诊断] 检查端口组配置...');
    
    if (!this.graph) {
      console.error('❌ 无法检查端口组配置：X6图实例不存在');
      return;
    }

    const options = this.graph.options;
    if (options && options.connecting && options.connecting.portGroups) {
      this.diagnosticResults.portGroups = true;
      const portGroups = options.connecting.portGroups;
      
      console.log('✅ 端口组配置找到');
      console.log('📋 端口组详情:', {
        groupCount: Object.keys(portGroups).length,
        groups: Object.keys(portGroups),
        configurations: portGroups
      });

      // 详细检查每个端口组
      Object.entries(portGroups).forEach(([groupName, config]) => {
        console.log(`🔧 端口组 ${groupName}:`, {
          position: config.position,
          magnet: config.attrs?.circle?.magnet,
          visibility: config.attrs?.circle?.style?.visibility,
          markup: config.markup
        });
      });
    } else {
      this.diagnosticResults.errors.push('端口组配置缺失');
      console.error('❌ 端口组配置缺失');
      console.log('🔍 当前connecting配置:', options?.connecting);
    }
  }

  // 检查节点
  checkNodes() {
    console.log('🔍 [端口诊断] 检查节点...');
    
    if (!this.graph) {
      console.error('❌ 无法检查节点：X6图实例不存在');
      return;
    }

    const nodes = this.graph.getNodes();
    this.diagnosticResults.nodeCount = nodes.length;
    
    console.log(`📊 找到 ${nodes.length} 个节点`);

    nodes.forEach((node, index) => {
      const nodeId = node.id;
      const nodeData = node.getData() || {};
      const nodeType = nodeData.type || nodeData.nodeType || 'unknown';
      const ports = node.getPorts();
      
      console.log(`🔍 节点 ${index + 1}: ${nodeId}`, {
        type: nodeType,
        position: node.getPosition(),
        size: node.getSize(),
        portsCount: ports.length,
        ports: ports,
        nodeData: nodeData
      });

      // 检查节点的端口配置
      if (nodeData.portConfig) {
        console.log(`✅ 节点 ${nodeId} 有端口配置:`, nodeData.portConfig);
      } else {
        console.warn(`⚠️ 节点 ${nodeId} 缺少端口配置`);
      }

      // 检查节点的实际端口
      if (ports.length > 0) {
        ports.forEach(port => {
          console.log(`  🔌 端口:`, {
            id: port.id,
            group: port.group,
            position: port.position,
            attrs: port.attrs
          });
        });
      } else {
        console.warn(`⚠️ 节点 ${nodeId} 没有端口`);
      }
    });
  }

  // 检查端口DOM元素
  checkPortElements() {
    console.log('🔍 [端口诊断] 检查端口DOM元素...');
    
    const portElements = document.querySelectorAll('[port]');
    const circleElements = document.querySelectorAll('circle');
    const magnetElements = document.querySelectorAll('[magnet="true"]');
    
    this.diagnosticResults.portElements = portElements.length;
    this.diagnosticResults.circleElements = circleElements.length;
    
    console.log('📊 DOM元素统计:', {
      portElements: portElements.length,
      circleElements: circleElements.length,
      magnetElements: magnetElements.length
    });

    // 详细检查circle元素
    circleElements.forEach((circle, index) => {
      const port = circle.getAttribute('port');
      const magnet = circle.getAttribute('magnet');
      const portGroup = circle.getAttribute('port-group');
      const style = window.getComputedStyle(circle);
      
      console.log(`🔍 Circle ${index + 1}:`, {
        port: port,
        magnet: magnet,
        portGroup: portGroup,
        visibility: style.visibility,
        display: style.display,
        opacity: style.opacity,
        fill: circle.getAttribute('fill'),
        stroke: circle.getAttribute('stroke'),
        r: circle.getAttribute('r')
      });
    });

    // 检查magnet元素
    magnetElements.forEach((element, index) => {
      console.log(`🧲 Magnet元素 ${index + 1}:`, {
        tagName: element.tagName,
        port: element.getAttribute('port'),
        portGroup: element.getAttribute('port-group'),
        magnet: element.getAttribute('magnet')
      });
    });
  }

  // 检查端口配置
  checkPortConfigurations() {
    console.log('🔍 [端口诊断] 检查端口配置...');
    
    if (!this.graph) {
      console.error('❌ 无法检查端口配置：X6图实例不存在');
      return;
    }

    const nodes = this.graph.getNodes();
    
    nodes.forEach(node => {
      const nodeId = node.id;
      const nodeData = node.getData() || {};
      const nodeType = nodeData.type || nodeData.nodeType;
      
      // 检查节点的端口配置
      const portConfig = nodeData.portConfig;
      const x6Ports = node.getPorts();
      
      const configInfo = {
        nodeId: nodeId,
        nodeType: nodeType,
        hasPortConfig: !!portConfig,
        x6PortsCount: x6Ports.length,
        configValid: false
      };

      if (portConfig) {
        configInfo.configValid = !!(portConfig.groups && portConfig.items);
        configInfo.groupsCount = portConfig.groups ? Object.keys(portConfig.groups).length : 0;
        configInfo.itemsCount = portConfig.items ? portConfig.items.length : 0;
        
        console.log(`✅ 节点 ${nodeId} 端口配置:`, {
          groups: portConfig.groups,
          items: portConfig.items,
          x6Ports: x6Ports
        });
      } else {
        console.warn(`⚠️ 节点 ${nodeId} 缺少端口配置`);
      }

      this.diagnosticResults.portConfigurations.push(configInfo);
    });
  }

  // 测试端口交互
  testPortInteraction() {
    console.log('🔍 [端口诊断] 测试端口交互...');
    
    if (!this.graph) {
      console.error('❌ 无法测试端口交互：X6图实例不存在');
      return;
    }

    // 检查连接验证函数
    const connectingOptions = this.graph.options.connecting;
    if (connectingOptions && connectingOptions.validateConnection) {
      console.log('✅ 连接验证函数存在');
      
      // 测试连接验证逻辑
      const nodes = this.graph.getNodes();
      if (nodes.length >= 2) {
        const sourceNode = nodes[0];
        const targetNode = nodes[1];
        
        try {
          const testResult = connectingOptions.validateConnection({
            sourceCell: sourceNode,
            targetCell: targetNode,
            sourcePort: 'out',
            targetPort: 'in'
          });
          
          console.log('🧪 连接验证测试结果:', testResult);
        } catch (error) {
          console.error('❌ 连接验证测试失败:', error);
        }
      }
    } else {
      console.warn('⚠️ 连接验证函数不存在');
    }

    // 检查端口事件监听
    const circleElements = document.querySelectorAll('circle[magnet="true"]');
    console.log(`🔍 找到 ${circleElements.length} 个磁性端口元素`);
    
    circleElements.forEach((circle, index) => {
      const events = ['mouseenter', 'mouseleave', 'mousedown', 'mouseup'];
      let hasEvents = false;
      
      // 安全检查 getEventListeners 是否可用（仅在开发者工具中可用）
      try {
        if (typeof window.getEventListeners === 'function') {
          hasEvents = events.some(eventType => {
            const listeners = window.getEventListeners(circle);
            return listeners[eventType] && listeners[eventType].length > 0;
          });
        } else {
          // 如果 getEventListeners 不可用，使用替代方法检查事件监听器
          hasEvents = this.checkEventListenersAlternative(circle, events);
        }
      } catch (error) {
        console.warn('⚠️ getEventListeners 检查失败:', error.message);
        // 如果出现任何错误，使用替代方法检查事件监听器
        hasEvents = this.checkEventListenersAlternative(circle, events);
      }
      
      console.log(`🔍 端口 ${index + 1} 事件监听:`, {
        element: circle,
        hasEventListeners: hasEvents,
        port: circle.getAttribute('port'),
        magnet: circle.getAttribute('magnet')
      });
    });
  }

  // 打印诊断摘要
  printDiagnosticSummary() {
    console.log('\n📋 [端口诊断] 诊断摘要:');
    console.log('==========================================');
    
    const results = this.diagnosticResults;
    
    console.log(`✅ X6图实例: ${results.x6Instance ? '正常' : '异常'}`);
    console.log(`✅ 端口组配置: ${results.portGroups ? '正常' : '异常'}`);
    console.log(`📊 节点数量: ${results.nodeCount}`);
    console.log(`📊 端口DOM元素: ${results.portElements}`);
    console.log(`📊 Circle元素: ${results.circleElements}`);
    
    const validConfigs = results.portConfigurations.filter(c => c.configValid).length;
    console.log(`📊 有效端口配置: ${validConfigs}/${results.portConfigurations.length}`);
    
    if (results.errors.length > 0) {
      console.log('\n❌ 发现的问题:');
      results.errors.forEach(error => console.log(`  - ${error}`));
    }
    
    // 提供修复建议
    this.provideFixes();
  }

  // 提供修复建议
  provideFixes() {
    console.log('\n🔧 [端口诊断] 修复建议:');
    console.log('==========================================');
    
    const results = this.diagnosticResults;
    
    if (!results.x6Instance) {
      console.log('🔧 X6图实例问题：检查useCanvasCore.js中的图初始化逻辑');
    }
    
    if (!results.portGroups) {
      console.log('🔧 端口组配置问题：检查useCanvasCore.js中的portGroups注册');
    }
    
    if (results.circleElements === 0) {
      console.log('🔧 端口DOM问题：检查节点创建时的端口配置应用');
    }
    
    const invalidConfigs = results.portConfigurations.filter(c => !c.configValid);
    if (invalidConfigs.length > 0) {
      console.log('🔧 端口配置问题：以下节点的端口配置无效:');
      invalidConfigs.forEach(config => {
        console.log(`  - 节点 ${config.nodeId} (${config.nodeType})`);
      });
    }
  }

  /**
   * 替代方法检查事件监听器（当 getEventListeners 不可用时）
   * @param {Element} element - DOM元素
   * @param {Array} events - 要检查的事件类型数组
   * @returns {boolean} - 是否有事件监听器
   */
  checkEventListenersAlternative(element, events) {
    try {
      // 检查元素是否有常见的事件处理属性
      const hasInlineHandlers = events.some(eventType => {
        const handlerName = `on${eventType}`;
        return element[handlerName] !== null && element[handlerName] !== undefined;
      });

      // 检查是否有 data-* 属性表明有事件监听器
      const hasDataAttributes = element.hasAttribute('data-has-listeners') || 
                               element.hasAttribute('data-interactive') ||
                               element.getAttribute('magnet') === 'true';

      // 检查是否有相关的 CSS 类表明有交互性
      const hasInteractiveClasses = element.classList.contains('interactive') ||
                                   element.classList.contains('clickable') ||
                                   element.classList.contains('hoverable');

      return hasInlineHandlers || hasDataAttributes || hasInteractiveClasses;
    } catch (error) {
      console.warn('⚠️ 替代事件监听器检查失败:', error.message);
      return false;
    }
  }
}

// 初始化说明（按需调用，不再全局自动运行）
console.log('🔧 [端口诊断] 脚本已加载（按需触发，非全局自启动）');

// 暴露到全局以便手动调用（进入画布并创建图后调用）
window.runPortDiagnostic = () => {
  const diagnostic = new PortDOMDiagnostic();
  diagnostic.runFullDiagnostic();
};

// 提供按需等待的触发方法：当 X6 图实例就绪时再运行
// 可在画布组件 mounted/图创建后调用，无需依赖全局变量
window.runPortDiagnosticWhenReady = ({ timeout = 10000, interval = 500, getGraph } = {}) => {
  let elapsed = 0;
  const tryRun = () => {
    const graph = typeof getGraph === 'function' ? getGraph() : (window.graph || window.x6Graph);
    if (graph) {
      const diagnostic = new PortDOMDiagnostic();
      diagnostic.graph = graph;
      diagnostic.runFullDiagnostic();
      return;
    }
    elapsed += interval;
    if (elapsed < timeout) {
      setTimeout(tryRun, interval);
    } else {
      console.warn('⚠️ [端口诊断] 等待图实例超时，未检测到 X6 图实例');
    }
  };
  tryRun();
};

// 提供直接绑定方法：由调用方传入已创建的 graph
window.attachPortDiagnostic = (graph) => {
  if (!graph) {
    console.warn('⚠️ [端口诊断] attachPortDiagnostic 需要有效的 graph 实例');
    return;
  }
  const diagnostic = new PortDOMDiagnostic();
  diagnostic.graph = graph;
  diagnostic.runFullDiagnostic();
};

// 监听可能的就绪事件（如果画布组件会派发，可自动触发）
window.addEventListener('x6:graph-initialized', (e) => {
  const graph = e?.detail?.graph || window.graph || window.x6Graph;
  if (graph) {
    const diagnostic = new PortDOMDiagnostic();
    diagnostic.graph = graph;
    diagnostic.runFullDiagnostic();
  }
});

window.addEventListener('x6-graph-initialized', (e) => {
  const graph = e?.detail?.graph || window.graph || window.x6Graph;
  if (graph) {
    const diagnostic = new PortDOMDiagnostic();
    diagnostic.graph = graph;
    diagnostic.runFullDiagnostic();
  }
});

window.addEventListener('graph:ready', (e) => {
  const graph = e?.detail?.graph || window.graph || window.x6Graph;
  if (graph) {
    const diagnostic = new PortDOMDiagnostic();
    diagnostic.graph = graph;
    diagnostic.runFullDiagnostic();
  }
});
console.log('✅ [端口诊断] 脚本初始化完成：使用 runPortDiagnostic/attachPortDiagnostic/runPortDiagnosticWhenReady 按需运行');