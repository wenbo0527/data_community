/**
 * 连接点调试工具 - 增强版
 * 用于深入分析为什么连接线还是从中心到中心而不是从端口连接
 * 
 * 使用方法：
 * 1. 在浏览器中打开开发者工具
 * 2. 在控制台中输入 runFullDiagnosis() 运行完整诊断
 * 3. 或者单独调用各个调试函数
 */

// 全局调试函数，可在浏览器控制台中调用
window.debugConnectionPoints = {
  
  /**
   * 检查所有节点的端口状态
   */
  debugNodePorts() {
    console.log('=== 节点端口调试信息 ===');
    
    // 获取X6图实例
    const graph = window.graph || window.x6Graph;
    if (!graph) {
      console.error('未找到X6图实例');
      return;
    }
    
    const nodes = graph.getNodes();
    console.log(`总共找到 ${nodes.length} 个节点`);
    
    nodes.forEach((node, index) => {
      console.log(`\n--- 节点 ${index + 1}: ${node.id} ---`);
      console.log('节点数据:', node.getData());
      
      // 检查端口配置
      const ports = node.getPorts();
      console.log(`端口数量: ${ports.length}`);
      
      if (ports.length === 0) {
        console.warn('⚠️ 该节点没有端口！');
      } else {
        ports.forEach((port, portIndex) => {
          console.log(`  端口 ${portIndex + 1}:`, {
            id: port.id,
            group: port.group,
            args: port.args,
            markup: port.markup,
            attrs: port.attrs
          });
          
          // 检查端口的实际DOM元素
          const portElement = node.getPortNode(port.id);
          if (portElement) {
            const bbox = portElement.getBBox();
            console.log(`    端口DOM位置:`, {
              x: bbox.x,
              y: bbox.y,
              width: bbox.width,
              height: bbox.height
            });
          } else {
            console.warn(`    ⚠️ 端口 ${port.id} 没有找到DOM元素`);
          }
        });
      }
      
      // 检查端口组配置
      const portGroups = node.getPortGroups();
      console.log('端口组配置:', portGroups);
      
      // 检查节点的连接点配置
      const nodeConfig = node.toJSON();
      console.log('节点完整配置:', nodeConfig);
    });
  },
  
  /**
   * 检查连接线的连接点
   */
  debugConnectionPoints() {
    console.log('\n=== 连接线连接点调试信息 ===');
    
    const graph = window.graph || window.x6Graph;
    if (!graph) {
      console.error('未找到X6图实例');
      return;
    }
    
    const edges = graph.getEdges();
    console.log(`总共找到 ${edges.length} 条连接线`);
    
    edges.forEach((edge, index) => {
      console.log(`\n--- 连接线 ${index + 1}: ${edge.id} ---`);
      
      const source = edge.getSource();
      const target = edge.getTarget();
      
      console.log('源连接信息:', source);
      console.log('目标连接信息:', target);
      
      // 检查是否使用了端口连接
      if (source.port) {
        console.log(`✅ 源端使用端口连接: ${source.port}`);
      } else {
        console.warn('⚠️ 源端没有使用端口连接，可能从节点中心连接');
      }
      
      if (target.port) {
        console.log(`✅ 目标端使用端口连接: ${target.port}`);
      } else {
        console.warn('⚠️ 目标端没有使用端口连接，可能连接到节点中心');
      }
      
      // 检查连接线的样式和配置
      const edgeConfig = edge.toJSON();
      console.log('连接线完整配置:', edgeConfig);
      
      // 检查连接点算法
      const connectionPoint = edgeConfig.connectionPoint || edgeConfig.attrs?.line?.connectionPoint;
      console.log('连接点算法:', connectionPoint);
      
      // 检查路由器和连接器
      console.log('路由器:', edgeConfig.router);
      console.log('连接器:', edgeConfig.connector);
    });
  },
  
  /**
   * 检查X6的全局配置
   */
  debugX6Config() {
    console.log('\n=== X6全局配置调试信息 ===');
    
    const graph = window.graph || window.x6Graph;
    if (!graph) {
      console.error('未找到X6图实例');
      return;
    }
    
    // 检查图的连接配置
    const options = graph.options;
    console.log('图的配置选项:', options);
    
    // 检查连接相关配置
    if (options.connecting) {
      console.log('连接配置:', options.connecting);
      
      if (options.connecting.connectionPoint) {
        console.log('✅ 全局连接点配置:', options.connecting.connectionPoint);
      } else {
        console.warn('⚠️ 没有找到全局连接点配置');
      }
      
      if (options.connecting.router) {
        console.log('全局路由器配置:', options.connecting.router);
      }
      
      if (options.connecting.connector) {
        console.log('全局连接器配置:', options.connecting.connector);
      }
    } else {
      console.warn('⚠️ 没有找到连接配置');
    }
    
    // 检查默认边配置
    if (options.defaultEdge) {
      console.log('默认边配置:', options.defaultEdge);
    }
  },
  
  /**
   * 检查端口的磁性配置
   */
  debugPortMagnet() {
    console.log('\n=== 端口磁性配置调试 ===');
    
    const graph = window.graph || window.x6Graph;
    if (!graph) {
      console.error('未找到X6图实例');
      return;
    }
    
    const nodes = graph.getNodes();
    
    nodes.forEach((node, index) => {
      console.log(`\n--- 节点 ${index + 1} 端口磁性检查 ---`);
      
      const ports = node.getPorts();
      ports.forEach(port => {
        const portElement = node.getPortNode(port.id);
        if (portElement) {
          const magnet = portElement.getAttribute('magnet');
          const portGroup = node.getPortGroup(port.group);
          
          console.log(`端口 ${port.id}:`, {
            group: port.group,
            magnetAttribute: magnet,
            groupConfig: portGroup,
            canConnect: magnet === 'true' || (portGroup && portGroup.attrs && portGroup.attrs.circle && portGroup.attrs.circle.magnet)
          });
        }
      });
    });
  },
  
  /**
   * 实时监控连接创建过程
   */
  monitorConnections() {
    console.log('\n=== 开始监控连接创建过程 ===');
    
    const graph = window.graph || window.x6Graph;
    if (!graph) {
      console.error('未找到X6图实例');
      return;
    }
    
    // 监听连接事件
    graph.on('edge:connected', ({ edge, isNew }) => {
      console.log('🔗 连接已创建:', {
        edgeId: edge.id,
        isNew,
        source: edge.getSource(),
        target: edge.getTarget(),
        sourceNode: edge.getSourceNode()?.id,
        targetNode: edge.getTargetNode()?.id
      });
    });
    
    graph.on('edge:connecting', ({ edge }) => {
      console.log('🔄 正在连接:', {
        edgeId: edge.id,
        source: edge.getSource(),
        target: edge.getTarget()
      });
    });
    
    graph.on('node:port:click', ({ node, port }) => {
      console.log('🎯 端口被点击:', {
        nodeId: node.id,
        portId: port,
        portData: node.getPort(port)
      });
    });
    
    console.log('✅ 连接监控已启动，请尝试创建连接...');
  },
  
  /**
   * 检查连接线的实际渲染路径
   */
  debugEdgeRendering() {
    console.log('\n=== 连接线实际渲染路径调试 ===');
    
    const graph = window.graph || window.x6Graph;
    if (!graph) {
      console.error('未找到X6图实例');
      return;
    }
    
    const edges = graph.getEdges();
    
    edges.forEach((edge, index) => {
      console.log(`\n--- 连接线 ${index + 1} 渲染分析 ---`);
      
      // 获取连接线的DOM元素
      const edgeView = graph.findViewByCell(edge);
      if (!edgeView) {
        console.warn('未找到连接线的视图');
        return;
      }
      
      // 获取路径元素
      const pathElement = edgeView.container.querySelector('path');
      if (pathElement) {
        const pathData = pathElement.getAttribute('d');
        console.log('SVG路径数据:', pathData);
        
        // 解析路径的起点和终点
        const pathCommands = pathData.match(/[ML][\d\s,.-]+/g);
        if (pathCommands && pathCommands.length >= 2) {
          const startPoint = pathCommands[0].replace('M', '').trim().split(/[\s,]+/);
          const endPoint = pathCommands[pathCommands.length - 1].replace(/[ML]/, '').trim().split(/[\s,]+/);
          
          console.log('实际起点坐标:', { x: parseFloat(startPoint[0]), y: parseFloat(startPoint[1]) });
          console.log('实际终点坐标:', { x: parseFloat(endPoint[0]), y: parseFloat(endPoint[1]) });
        }
      }
      
      // 获取源节点和目标节点的实际位置
      const sourceNode = edge.getSourceNode();
      const targetNode = edge.getTargetNode();
      
      if (sourceNode) {
        const sourceBBox = sourceNode.getBBox();
        console.log('源节点位置:', {
          center: { x: sourceBBox.x + sourceBBox.width / 2, y: sourceBBox.y + sourceBBox.height / 2 },
          bbox: sourceBBox
        });
        
        // 检查源端口位置
        const source = edge.getSource();
        if (source.port) {
          const portElement = sourceNode.getPortNode(source.port);
          if (portElement) {
            const portBBox = portElement.getBBox();
            console.log('源端口实际位置:', {
              center: { x: portBBox.x + portBBox.width / 2, y: portBBox.y + portBBox.height / 2 },
              bbox: portBBox
            });
          }
        }
      }
      
      if (targetNode) {
        const targetBBox = targetNode.getBBox();
        console.log('目标节点位置:', {
          center: { x: targetBBox.x + targetBBox.width / 2, y: targetBBox.y + targetBBox.height / 2 },
          bbox: targetBBox
        });
        
        // 检查目标端口位置
        const target = edge.getTarget();
        if (target.port) {
          const portElement = targetNode.getPortNode(target.port);
          if (portElement) {
            const portBBox = portElement.getBBox();
            console.log('目标端口实际位置:', {
              center: { x: portBBox.x + portBBox.width / 2, y: portBBox.y + portBBox.height / 2 },
              bbox: portBBox
            });
          }
        }
      }
      
      // 检查连接点算法的实际效果
      const connectionPoint = edge.getConnectionPoint();
      console.log('连接点算法结果:', connectionPoint);
    });
  },

  /**
   * 检查端口的实际可见性和位置
   */
  debugPortVisibility() {
    console.log('\n=== 端口可见性和位置调试 ===');
    
    const graph = window.graph || window.x6Graph;
    if (!graph) {
      console.error('未找到X6图实例');
      return;
    }
    
    const nodes = graph.getNodes();
    
    nodes.forEach((node, index) => {
      console.log(`\n--- 节点 ${index + 1} 端口可见性检查 ---`);
      
      const ports = node.getPorts();
      const nodeBBox = node.getBBox();
      
      console.log('节点边界框:', nodeBBox);
      
      ports.forEach(port => {
        const portElement = node.getPortNode(port.id);
        if (portElement) {
          const portBBox = portElement.getBBox();
          const isVisible = portElement.style.display !== 'none' && 
                           portElement.style.visibility !== 'hidden' &&
                           parseFloat(portElement.style.opacity || '1') > 0;
          
          console.log(`端口 ${port.id}:`, {
            group: port.group,
            bbox: portBBox,
            isVisible,
            isOutsideNode: portBBox.x < nodeBBox.x || 
                          portBBox.x > nodeBBox.x + nodeBBox.width ||
                          portBBox.y < nodeBBox.y || 
                          portBBox.y > nodeBBox.y + nodeBBox.height,
            style: {
              display: portElement.style.display,
              visibility: portElement.style.visibility,
              opacity: portElement.style.opacity
            }
          });
        } else {
          console.warn(`端口 ${port.id} 没有DOM元素`);
        }
      });
    });
  },

  /**
   * 运行完整的诊断
   */
  runFullDiagnosis() {
    console.log('🔍 开始完整的连接点诊断...\n');
    
    this.debugX6Config();
    this.debugNodePorts();
    this.debugConnectionPoints();
    this.debugPortMagnet();
    this.debugEdgeRendering();
    this.debugPortVisibility();
    
    console.log('\n✅ 诊断完成！请查看上面的输出信息。');
    console.log('💡 提示：如果发现问题，可以调用 debugConnectionPoints.monitorConnections() 来实时监控连接过程。');
  }
};

// 为了方便使用，也可以直接调用这些函数
window.debugNodePorts = window.debugConnectionPoints.debugNodePorts;
window.debugConnectionPointsInfo = window.debugConnectionPoints.debugConnectionPoints;
window.debugX6Config = window.debugConnectionPoints.debugX6Config;
window.runFullDiagnosis = window.debugConnectionPoints.runFullDiagnosis;

console.log('🛠️ 连接点调试工具已加载！');
console.log('可用的调试函数：');
console.log('- debugConnectionPoints.runFullDiagnosis() - 运行完整诊断 ⭐');
console.log('- debugConnectionPoints.debugNodePorts() - 检查节点端口');
console.log('- debugConnectionPoints.debugConnectionPoints() - 检查连接线');
console.log('- debugConnectionPoints.debugX6Config() - 检查X6配置');
console.log('- debugConnectionPoints.debugPortMagnet() - 检查端口磁性');
console.log('- debugConnectionPoints.debugEdgeRendering() - 检查连接线渲染路径 🔍');
console.log('- debugConnectionPoints.debugPortVisibility() - 检查端口可见性');
console.log('- debugConnectionPoints.monitorConnections() - 监控连接过程');
console.log('\n🚀 快速开始：在控制台输入 runFullDiagnosis() 运行完整诊断');
console.log('🎯 重点关注：debugConnectionPoints.debugEdgeRendering() 可以显示连接线的实际渲染路径');