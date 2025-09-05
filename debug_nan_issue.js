// 调试NaN问题的完整测试脚本
console.log('🔍 开始调试Y坐标NaN问题 - 完整版本');

// 防止循环调用的计数器
let callCounter = 0;
const MAX_CALLS = 100;

function safeCall(funcName, func) {
  if (callCounter > MAX_CALLS) {
    console.error(`❌ 检测到可能的循环调用，已停止执行 ${funcName}`);
    return null;
  }
  callCounter++;
  try {
    return func();
  } catch (error) {
    console.error(`❌ ${funcName} 执行失败:`, error);
    return null;
  }
}

// 检查window.layoutEngine是否存在
if (typeof window !== 'undefined' && window.layoutEngine) {
  console.log('✅ window.layoutEngine 存在');
  
  // 1. 测试Y坐标计算
  if (typeof window.layoutEngine.testYCoordinateCalculation === 'function') {
    console.log('🧪 执行Y坐标计算测试...');
    const testResult = safeCall('testYCoordinateCalculation', () => {
      return window.layoutEngine.testYCoordinateCalculation();
    });
    if (testResult) {
      console.log('📊 Y坐标测试结果:', testResult);
    }
  } else {
    console.warn('⚠️ testYCoordinateCalculation 方法不存在');
  }
  
  // 2. 测试calculateLayerY方法
  if (typeof window.layoutEngine.calculateLayerY === 'function') {
    console.log('🧪 测试calculateLayerY方法...');
    for (let i = 0; i < 5; i++) {
      const result = safeCall(`calculateLayerY(${i})`, () => {
        return window.layoutEngine.calculateLayerY(i);
      });
      if (result !== null) {
        console.log(`📍 calculateLayerY(${i}) = ${result}`);
        if (isNaN(result)) {
          console.error(`❌ calculateLayerY(${i}) 返回NaN`);
        }
      }
    }
  } else {
    console.warn('⚠️ calculateLayerY 方法不存在');
  }
  
  // 3. 检查当前图形中的节点位置（绝对位置）
  if (window.layoutEngine.graph && typeof window.layoutEngine.graph.getNodes === 'function') {
    console.log('🔍 检查当前节点绝对位置...');
    const nodes = safeCall('getNodes', () => window.layoutEngine.graph.getNodes());
    
    if (nodes) {
      console.log(`📊 图形中共有 ${nodes.length} 个节点`);
      
      nodes.forEach((node, index) => {
        if (index < 10 && callCounter < MAX_CALLS) { // 只显示前10个节点
          const position = safeCall(`getPosition-${node.id}`, () => node.getPosition());
          const size = safeCall(`getSize-${node.id}`, () => node.getSize());
          const id = node.id || node.getId();
          
          if (position) {
            console.log(`📍 节点 ${id}: 绝对位置(${position.x}, ${position.y})`);
            
            if (isNaN(position.x) || isNaN(position.y)) {
              console.error(`❌ 节点 ${id} 绝对位置包含NaN: (${position.x}, ${position.y})`);
            }
          }
          
          if (size) {
            console.log(`📏 节点 ${id}: 尺寸(${size.width}×${size.height})`);
          }
        }
      });
    }
  }
  
  // 4. 检查端口位置（输入端口和输出端口）
  console.log('🔍 检查端口位置...');
  if (window.layoutEngine.graph && typeof window.layoutEngine.graph.getNodes === 'function') {
    const nodes = safeCall('getNodes-ports', () => window.layoutEngine.graph.getNodes());
    
    if (nodes) {
      nodes.forEach((node, index) => {
        if (index < 5 && callCounter < MAX_CALLS) { // 只检查前5个节点的端口
          const id = node.id || node.getId();
          
          // 检查输入端口
          const inPorts = safeCall(`getInPorts-${id}`, () => {
            if (typeof node.getInPorts === 'function') {
              return node.getInPorts();
            }
            return [];
          });
          
          if (inPorts && inPorts.length > 0) {
            inPorts.forEach((port, portIndex) => {
              if (portIndex < 3 && callCounter < MAX_CALLS) { // 只检查前3个端口
                const portPosition = safeCall(`getPortPosition-in-${id}-${portIndex}`, () => {
                  if (typeof node.getPortPosition === 'function') {
                    return node.getPortPosition(port.id || port);
                  }
                  return null;
                });
                
                if (portPosition) {
                  console.log(`🔌 节点 ${id} 输入端口 ${port.id || portIndex}: 绝对位置(${portPosition.x}, ${portPosition.y})`);
                  
                  if (isNaN(portPosition.x) || isNaN(portPosition.y)) {
                    console.error(`❌ 节点 ${id} 输入端口位置包含NaN: (${portPosition.x}, ${portPosition.y})`);
                  }
                }
              }
            });
          }
          
          // 检查输出端口
          const outPorts = safeCall(`getOutPorts-${id}`, () => {
            if (typeof node.getOutPorts === 'function') {
              return node.getOutPorts();
            }
            return [];
          });
          
          if (outPorts && outPorts.length > 0) {
            outPorts.forEach((port, portIndex) => {
              if (portIndex < 3 && callCounter < MAX_CALLS) { // 只检查前3个端口
                const portPosition = safeCall(`getPortPosition-out-${id}-${portIndex}`, () => {
                  if (typeof node.getPortPosition === 'function') {
                    return node.getPortPosition(port.id || port);
                  }
                  return null;
                });
                
                if (portPosition) {
                  console.log(`🔌 节点 ${id} 输出端口 ${port.id || portIndex}: 绝对位置(${portPosition.x}, ${portPosition.y})`);
                  
                  if (isNaN(portPosition.x) || isNaN(portPosition.y)) {
                    console.error(`❌ 节点 ${id} 输出端口位置包含NaN: (${portPosition.x}, ${portPosition.y})`);
                  }
                }
              }
            });
          }
        }
      });
    }
  }
  
  // 5. 检查连接线位置
  console.log('🔍 检查连接线位置...');
  if (window.layoutEngine.graph && typeof window.layoutEngine.graph.getEdges === 'function') {
    const edges = safeCall('getEdges', () => window.layoutEngine.graph.getEdges());
    
    if (edges) {
      console.log(`📊 图形中共有 ${edges.length} 条连接线`);
      
      edges.forEach((edge, index) => {
        if (index < 5 && callCounter < MAX_CALLS) { // 只检查前5条连接线
          const id = edge.id || edge.getId();
          const sourcePoint = safeCall(`getSourcePoint-${id}`, () => edge.getSourcePoint());
          const targetPoint = safeCall(`getTargetPoint-${id}`, () => edge.getTargetPoint());
          
          if (sourcePoint && targetPoint) {
            console.log(`🔗 连接线 ${id}: 起点(${sourcePoint.x}, ${sourcePoint.y}) → 终点(${targetPoint.x}, ${targetPoint.y})`);
            
            if (isNaN(sourcePoint.x) || isNaN(sourcePoint.y)) {
              console.error(`❌ 连接线 ${id} 起点包含NaN: (${sourcePoint.x}, ${sourcePoint.y})`);
            }
            
            if (isNaN(targetPoint.x) || isNaN(targetPoint.y)) {
              console.error(`❌ 连接线 ${id} 终点包含NaN: (${targetPoint.x}, ${targetPoint.y})`);
            }
          }
        }
      });
    }
  }
  
} else {
  console.error('❌ window.layoutEngine 不存在');
}

console.log(`🔍 调试脚本执行完成，总调用次数: ${callCounter}`);
if (callCounter > MAX_CALLS) {
  console.error('⚠️ 检测到可能的循环调用问题，请检查代码逻辑');
}