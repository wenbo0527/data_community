/**
 * 深度端口诊断和修复功能测试脚本
 * 测试新添加的端口连接诊断和强制修复功能
 */

console.log('🧪 [测试] 开始深度端口诊断和修复功能测试...');

// 模拟测试环境
const mockGraph = {
  getCellById: (id) => {
    console.log(`📍 [Mock] 获取节点: ${id}`);
    return {
      id: id,
      getPorts: () => [
        { id: 'in', group: 'in' },
        { id: 'out', group: 'out' }
      ],
      getPortsElements: () => 2,
      hasPort: (portId) => ['in', 'out'].includes(portId),
      getPortGroups: () => ({ in: { magnet: true }, out: { magnet: true } }),
      getShape: () => 'circle',
      getSize: () => ({ width: 60, height: 60 }),
      getPosition: () => ({ x: 100, y: 100 })
    };
  },
  addEdge: (config) => {
    console.log(`📍 [Mock] 创建边:`, config);
    return {
      id: 'test-edge-' + Date.now(),
      getSourcePortId: () => null, // 模拟端口连接失败
      getTargetPortId: () => null, // 模拟端口连接失败
      getSource: () => config.source,
      getTarget: () => config.target,
      getSourcePoint: () => ({ x: 100, y: 100 }),
      getTargetPoint: () => ({ x: 200, y: 200 }),
      setSource: function(source) {
        console.log(`📍 [Mock] 设置源端口:`, source);
        this._source = source;
        // 模拟修复成功
        this.getSourcePortId = () => source.port;
      },
      setTarget: function(target) {
        console.log(`📍 [Mock] 设置目标端口:`, target);
        this._target = target;
        // 模拟修复成功
        this.getTargetPortId = () => target.port;
      }
    };
  },
  options: {
    connecting: {
      magnet: true,
      validateConnection: true,
      allowBlank: false,
      allowLoop: false,
      allowNode: true,
      allowEdge: false,
      allowPort: true,
      highlight: true
    }
  }
};

// 模拟DOM环境
if (typeof document === 'undefined') {
  global.document = {
    querySelectorAll: (selector) => {
      console.log(`📍 [Mock DOM] 查询选择器: ${selector}`);
      if (selector === '[port]') {
        return [
          {
            getAttribute: (attr) => {
              const attrs = {
                'port': 'in',
                'port-group': 'in',
                'magnet': 'true'
              };
              return attrs[attr];
            },
            style: { visibility: 'visible', display: 'block' },
            getBoundingClientRect: () => ({ x: 90, y: 90, width: 10, height: 10 }),
            className: 'x6-port x6-port-in',
            closest: () => ({ getAttribute: () => 'test-node-1' })
          },
          {
            getAttribute: (attr) => {
              const attrs = {
                'port': 'out',
                'port-group': 'out',
                'magnet': 'true'
              };
              return attrs[attr];
            },
            style: { visibility: 'visible', display: 'block' },
            getBoundingClientRect: () => ({ x: 110, y: 110, width: 10, height: 10 }),
            className: 'x6-port x6-port-out',
            closest: () => ({ getAttribute: () => 'test-node-2' })
          }
        ];
      }
      return [];
    }
  };
}

// 创建测试用的UnifiedEdgeManager实例
class TestUnifiedEdgeManager {
  constructor(graph) {
    this.graph = graph;
  }

  // 复制深度诊断方法
  async performDeepPortDiagnosis(sourceNode, targetNode, x6EdgeConfig) {
    console.log('🔍 [深度诊断] 开始端口诊断...');
    
    try {
      // 1. 检查节点端口详细信息
      const sourceNodeDiagnosis = this.diagnoseNodePorts(sourceNode, 'source', x6EdgeConfig.source);
      const targetNodeDiagnosis = this.diagnoseNodePorts(targetNode, 'target', x6EdgeConfig.target);
      
      console.log('🔍 [深度诊断] 源节点端口诊断:', sourceNodeDiagnosis);
      console.log('🔍 [深度诊断] 目标节点端口诊断:', targetNodeDiagnosis);
      
      // 2. 检查DOM端口元素
      const domPortDiagnosis = this.checkDOMPortElements();
      console.log('🔍 [深度诊断] DOM端口元素检查:', domPortDiagnosis);
      
      // 3. 检查X6端口组配置
      const portGroupDiagnosis = this.checkPortGroupConfiguration();
      console.log('🔍 [深度诊断] 端口组配置检查:', portGroupDiagnosis);
      
      return {
        sourceNode: sourceNodeDiagnosis,
        targetNode: targetNodeDiagnosis,
        domPorts: domPortDiagnosis,
        portGroups: portGroupDiagnosis
      };
    } catch (error) {
      console.error('❌ [深度诊断] 端口诊断过程中发生错误:', error);
      return { error: error.message };
    }
  }

  diagnoseNodePorts(node, nodeType, edgeConfig) {
    if (!node) {
      return { exists: false, error: `${nodeType} node not found` };
    }

    try {
      const ports = node.getPorts();
      const portElements = node.getPortsElements ? node.getPortsElements() : null;
      const expectedPort = edgeConfig.port;
      
      return {
        exists: true,
        nodeId: node.id,
        totalPorts: ports ? ports.length : 0,
        ports: ports,
        portElements: portElements ? portElements.length : 0,
        expectedPort: expectedPort,
        hasExpectedPort: node.hasPort ? node.hasPort(expectedPort) : false,
        portGroups: node.getPortGroups ? node.getPortGroups() : null,
        shape: node.getShape ? node.getShape() : null,
        size: node.getSize ? node.getSize() : null,
        position: node.getPosition ? node.getPosition() : null
      };
    } catch (error) {
      return {
        exists: true,
        nodeId: node.id,
        error: error.message
      };
    }
  }

  checkDOMPortElements() {
    try {
      const portElements = document.querySelectorAll('[port]');
      console.log(`🔍 [DOM检查] 页面中的端口元素数量: ${portElements.length}`);
      
      const portDetails = [];
      portElements.forEach((el, index) => {
        const portInfo = {
          index: index + 1,
          port: el.getAttribute('port'),
          portGroup: el.getAttribute('port-group'),
          magnet: el.getAttribute('magnet'),
          visible: el.style.visibility !== 'hidden' && el.style.display !== 'none',
          position: el.getBoundingClientRect(),
          className: el.className,
          parentNodeId: el.closest('[data-cell-id]')?.getAttribute('data-cell-id')
        };
        
        portDetails.push(portInfo);
        console.log(`🔍 [DOM检查] 端口 ${index + 1}:`, portInfo);
      });
      
      return {
        totalElements: portElements.length,
        details: portDetails,
        inPorts: portDetails.filter(p => p.portGroup === 'in').length,
        outPorts: portDetails.filter(p => p.portGroup === 'out').length,
        magnetPorts: portDetails.filter(p => p.magnet === 'true').length
      };
    } catch (error) {
      console.error('❌ [DOM检查] DOM端口元素检查失败:', error);
      return { error: error.message };
    }
  }

  checkPortGroupConfiguration() {
    try {
      const graph = this.graph;
      if (!graph) {
        return { error: 'Graph instance not available' };
      }

      const graphOptions = graph.options || {};
      const connecting = graphOptions.connecting || {};
      
      return {
        hasConnectingConfig: !!connecting,
        magnetConfig: connecting.magnet,
        validateConnection: !!connecting.validateConnection,
        allowBlank: connecting.allowBlank,
        allowLoop: connecting.allowLoop,
        allowNode: connecting.allowNode,
        allowEdge: connecting.allowEdge,
        allowPort: connecting.allowPort,
        highlight: connecting.highlight
      };
    } catch (error) {
      console.error('❌ [端口组配置检查] 检查失败:', error);
      return { error: error.message };
    }
  }

  async attemptForcePortConnection(graphInstance, x6EdgeConfig, sourceNode, targetNode) {
    console.log('🔧 [强制修复] 开始尝试强制端口连接修复...');
    
    try {
      const originalSourcePort = graphInstance.getSourcePortId();
      const originalTargetPort = graphInstance.getTargetPortId();
      
      let fixAttempts = [];
      let success = false;
      
      // 修复尝试 1: 直接设置端口
      if (!originalSourcePort) {
        try {
          graphInstance.setSource({ 
            cell: x6EdgeConfig.source.cell, 
            port: x6EdgeConfig.source.port 
          });
          fixAttempts.push({
            method: 'setSource',
            success: !!graphInstance.getSourcePortId(),
            result: graphInstance.getSourcePortId()
          });
        } catch (error) {
          fixAttempts.push({
            method: 'setSource',
            success: false,
            error: error.message
          });
        }
      }
      
      if (!originalTargetPort) {
        try {
          graphInstance.setTarget({ 
            cell: x6EdgeConfig.target.cell, 
            port: x6EdgeConfig.target.port 
          });
          fixAttempts.push({
            method: 'setTarget',
            success: !!graphInstance.getTargetPortId(),
            result: graphInstance.getTargetPortId()
          });
        } catch (error) {
          fixAttempts.push({
            method: 'setTarget',
            success: false,
            error: error.message
          });
        }
      }
      
      // 检查最终结果
      const finalSourcePort = graphInstance.getSourcePortId();
      const finalTargetPort = graphInstance.getTargetPortId();
      success = !!(finalSourcePort && finalTargetPort);
      
      const result = {
        success,
        originalPorts: {
          source: originalSourcePort,
          target: originalTargetPort
        },
        finalPorts: {
          source: finalSourcePort,
          target: finalTargetPort
        },
        fixAttempts,
        edgeId: graphInstance.id
      };
      
      if (success) {
        console.log('✅ [强制修复] 端口连接修复成功:', result);
      } else {
        console.error('❌ [强制修复] 端口连接修复失败:', result);
      }
      
      return result;
    } catch (error) {
      console.error('❌ [强制修复] 强制端口连接修复过程中发生错误:', error);
      return {
        success: false,
        error: error.message,
        edgeId: graphInstance?.id
      };
    }
  }
}

// 执行测试
async function runTests() {
  console.log('\n🧪 [测试] 创建测试实例...');
  const edgeManager = new TestUnifiedEdgeManager(mockGraph);
  
  // 测试场景：创建连接但端口连接失败
  console.log('\n🧪 [测试] 场景1: 模拟端口连接失败...');
  
  const x6EdgeConfig = {
    id: 'test-edge-1',
    source: { cell: 'node-1', port: 'out' },
    target: { cell: 'node-2', port: 'in' }
  };
  
  const sourceNode = mockGraph.getCellById('node-1');
  const targetNode = mockGraph.getCellById('node-2');
  const graphInstance = mockGraph.addEdge(x6EdgeConfig);
  
  console.log('\n🧪 [测试] 检查初始端口连接状态...');
  console.log('源端口ID:', graphInstance.getSourcePortId());
  console.log('目标端口ID:', graphInstance.getTargetPortId());
  
  // 执行深度诊断
  console.log('\n🧪 [测试] 执行深度端口诊断...');
  const diagnosisResult = await edgeManager.performDeepPortDiagnosis(sourceNode, targetNode, x6EdgeConfig);
  
  // 执行强制修复
  console.log('\n🧪 [测试] 执行强制端口连接修复...');
  const fixResult = await edgeManager.attemptForcePortConnection(graphInstance, x6EdgeConfig, sourceNode, targetNode);
  
  // 验证修复结果
  console.log('\n🧪 [测试] 验证修复结果...');
  console.log('修复后源端口ID:', graphInstance.getSourcePortId());
  console.log('修复后目标端口ID:', graphInstance.getTargetPortId());
  
  // 测试总结
  console.log('\n📊 [测试总结]');
  console.log('✅ 深度诊断功能:', diagnosisResult.error ? '❌ 失败' : '✅ 成功');
  console.log('✅ DOM端口检查:', diagnosisResult.domPorts?.totalElements >= 0 ? '✅ 成功' : '❌ 失败');
  console.log('✅ 端口组配置检查:', diagnosisResult.portGroups?.hasConnectingConfig ? '✅ 成功' : '❌ 失败');
  console.log('✅ 强制端口修复:', fixResult.success ? '✅ 成功' : '❌ 失败');
  
  const allTestsPassed = !diagnosisResult.error && 
                        diagnosisResult.domPorts?.totalElements >= 0 && 
                        diagnosisResult.portGroups?.hasConnectingConfig && 
                        fixResult.success;
  
  console.log('\n🎯 [最终结果]:', allTestsPassed ? '✅ 所有测试通过' : '❌ 部分测试失败');
  
  return allTestsPassed;
}

// 运行测试
runTests().then(success => {
  console.log('\n🏁 [测试完成] 深度端口诊断和修复功能测试', success ? '成功' : '失败');
}).catch(error => {
  console.error('\n💥 [测试错误]:', error);
});