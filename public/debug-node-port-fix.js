/**
 * 节点端口修复验证脚本
 * 验证addNode修复后的端口配置和连接功能
 */

console.log('🔍 开始验证节点端口修复...')

// 等待页面加载完成
function waitForCanvas() {
  return new Promise((resolve) => {
    const checkCanvas = () => {
      const canvas = document.querySelector('#x6-canvas')
      if (canvas && window.canvasInstance) {
        console.log('✅ 画布已加载')
        resolve()
      } else {
        setTimeout(checkCanvas, 100)
      }
    }
    checkCanvas()
  })
}

// 验证X6实例和配置
function verifyX6Instance() {
  console.log('\n--- 验证X6实例 ---')
  
  if (!window.canvasInstance) {
    console.error('❌ 画布实例未找到')
    return false
  }
  
  const graph = window.canvasInstance.graph
  if (!graph) {
    console.error('❌ X6图实例未找到')
    return false
  }
  
  console.log('✅ X6图实例存在:', graph.constructor.name)
  
  // 检查端口组配置
  const options = graph.options
  console.log('📋 X6配置选项:', {
    connecting: options.connecting,
    interacting: options.interacting
  })
  
  return true
}

// 验证节点创建和端口配置
function verifyNodeCreation() {
  console.log('\n--- 验证节点创建 ---')
  
  const graph = window.canvasInstance.graph
  const existingNodes = graph.getNodes()
  console.log(`📊 现有节点数量: ${existingNodes.length}`)
  
  existingNodes.forEach((node, index) => {
    console.log(`\n🔍 检查节点 ${index + 1}: ${node.id}`)
    
    // 检查节点数据
    const nodeData = node.getData() || {}
    console.log('📝 节点数据:', {
      id: node.id,
      type: nodeData.type,
      shape: node.shape
    })
    
    // 检查端口配置
    const ports = node.getPorts()
    console.log(`🔌 端口数量: ${ports.length}`)
    
    ports.forEach((port, portIndex) => {
      console.log(`  端口 ${portIndex + 1}:`, {
        id: port.id,
        group: port.group,
        args: port.args
      })
    })
    
    // 检查端口组
    const portGroups = node.getPortsGroupByName('in') || []
    const outPortGroups = node.getPortsGroupByName('out') || []
    console.log(`📍 输入端口组: ${portGroups.length}`)
    console.log(`📍 输出端口组: ${outPortGroups.length}`)
  })
}

// 验证端口DOM元素
function verifyPortDOM() {
  console.log('\n--- 验证端口DOM元素 ---')
  
  const portElements = document.querySelectorAll('[port]')
  console.log(`🎯 页面中的端口元素数量: ${portElements.length}`)
  
  portElements.forEach((element, index) => {
    const portId = element.getAttribute('port')
    const portGroup = element.getAttribute('port-group')
    const magnet = element.getAttribute('magnet')
    
    console.log(`端口元素 ${index + 1}:`, {
      portId,
      portGroup,
      magnet,
      tagName: element.tagName,
      className: element.className,
      visible: element.offsetParent !== null,
      style: {
        display: element.style.display,
        visibility: element.style.visibility,
        opacity: element.style.opacity
      }
    })
    
    // 检查端口的交互性
    const rect = element.getBoundingClientRect()
    console.log(`  位置信息:`, {
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
      area: rect.width * rect.height
    })
  })
}

// 测试端口连接功能
function testPortConnection() {
  console.log('\n--- 测试端口连接功能 ---')
  
  const graph = window.canvasInstance.graph
  const nodes = graph.getNodes()
  
  if (nodes.length < 2) {
    console.log('⚠️ 节点数量不足，无法测试连接')
    return
  }
  
  const sourceNode = nodes[0]
  const targetNode = nodes[1]
  
  console.log(`🔗 尝试连接: ${sourceNode.id} -> ${targetNode.id}`)
  
  // 获取端口
  const sourcePorts = sourceNode.getPorts().filter(p => p.group === 'out')
  const targetPorts = targetNode.getPorts().filter(p => p.group === 'in')
  
  if (sourcePorts.length === 0 || targetPorts.length === 0) {
    console.log('❌ 缺少必要的端口')
    return
  }
  
  const sourcePort = sourcePorts[0]
  const targetPort = targetPorts[0]
  
  console.log(`📍 源端口: ${sourcePort.id} (${sourcePort.group})`)
  console.log(`📍 目标端口: ${targetPort.id} (${targetPort.group})`)
  
  // 测试连接验证
  try {
    const canConnect = graph.options.connecting.validateConnection({
      sourceView: { cell: sourceNode },
      targetView: { cell: targetNode },
      sourcePort: sourcePort.id,
      targetPort: targetPort.id,
      sourceMagnet: document.querySelector(`[port="${sourcePort.id}"]`),
      targetMagnet: document.querySelector(`[port="${targetPort.id}"]`)
    })
    
    console.log(`🔍 连接验证结果: ${canConnect ? '✅ 允许' : '❌ 拒绝'}`)
    
    if (canConnect) {
      // 尝试创建连接
      const edge = graph.addEdge({
        id: `test-edge-${Date.now()}`,
        source: { cell: sourceNode.id, port: sourcePort.id },
        target: { cell: targetNode.id, port: targetPort.id },
        attrs: {
          line: {
            stroke: '#52c41a',
            strokeWidth: 2
          }
        }
      })
      
      console.log('✅ 测试连接创建成功:', edge.id)
      
      // 清理测试连接
      setTimeout(() => {
        graph.removeCell(edge)
        console.log('🧹 测试连接已清理')
      }, 2000)
    }
  } catch (error) {
    console.error('❌ 连接测试失败:', error)
  }
}

// 提供修复建议
function provideFixes() {
  console.log('\n--- 修复建议 ---')
  
  const issues = []
  
  // 检查端口元素
  const portElements = document.querySelectorAll('[port]')
  if (portElements.length === 0) {
    issues.push('端口DOM元素缺失 - 检查端口markup配置')
  }
  
  // 检查magnet属性
  const magnetElements = document.querySelectorAll('[magnet="true"]')
  if (magnetElements.length === 0) {
    issues.push('magnet属性缺失 - 检查端口组配置中的magnet设置')
  }
  
  // 检查节点数量
  const graph = window.canvasInstance?.graph
  if (graph) {
    const nodes = graph.getNodes()
    if (nodes.length === 0) {
      issues.push('画布中无节点 - 检查节点创建逻辑')
    }
  }
  
  if (issues.length === 0) {
    console.log('✅ 未发现明显问题')
  } else {
    console.log('⚠️ 发现的问题:')
    issues.forEach((issue, index) => {
      console.log(`  ${index + 1}. ${issue}`)
    })
  }
  
  console.log('\n🔧 建议检查:')
  console.log('  1. createNodeConfig.js - 节点配置创建')
  console.log('  2. portConfigFactory.js - 端口配置工厂')
  console.log('  3. x6Config.js - X6端口组配置')
  console.log('  4. useCanvasNodes.js - 节点添加逻辑 (已修复addNode)')
}

// 主执行函数
async function runDiagnostics() {
  try {
    await waitForCanvas()
    
    const x6Valid = verifyX6Instance()
    if (!x6Valid) return
    
    verifyNodeCreation()
    verifyPortDOM()
    testPortConnection()
    provideFixes()
    
    console.log('\n🎉 诊断完成！')
  } catch (error) {
    console.error('❌ 诊断过程中出错:', error)
  }
}

// 启动诊断
runDiagnostics()