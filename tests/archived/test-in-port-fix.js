/**
 * 横向画布in端口修复验证测试脚本
 * 运行方式：在浏览器控制台中执行，或作为独立脚本引入
 */

// 测试横向画布in端口修复效果
function testInPortFix() {
  console.log('🧪 开始测试横向画布in端口修复效果...')
  
  // 获取横向画布的graph实例
  const graph = window.horizontalGraph || window.graph
  if (!graph) {
    console.error('❌ 未找到graph实例，请确保在横向画布页面运行')
    return
  }
  
  // 查找测试节点（crowd-split类型）
  const nodes = graph.getNodes()
  const testNode = nodes.find(node => {
    const data = node.getData()
    return data && (data.nodeType === 'crowd-split' || data.nodeType === 'audience-split')
  })
  
  if (!testNode) {
    console.warn('⚠️ 未找到crowd-split或audience-split节点，使用第一个节点进行测试')
    if (nodes.length === 0) {
      console.error('❌ 画布中没有节点')
      return
    }
  }
  
  const node = testNode || nodes[0]
  const nodeData = node.getData()
  const nodeType = nodeData?.nodeType || 'unknown'
  
  console.log(`📊 测试节点信息:`, {
    id: node.id,
    type: nodeType,
    position: node.getPosition(),
    size: node.getSize()
  })
  
  // 获取端口配置
  const ports = node.getPorts()
  console.log(`🔍 端口总数: ${ports.length}`)
  
  // 分析端口
  const inPorts = ports.filter(p => p.group === 'in' || p.id === 'in')
  const outPorts = ports.filter(p => p.group === 'out' || p.id?.startsWith('out'))
  
  console.log(`📐 端口分析结果:`)
  console.log(`   - in端口数量: ${inPorts.length}`)
  console.log(`   - out端口数量: ${outPorts.length}`)
  
  // 验证in端口
  if (inPorts.length > 0) {
    console.log(`✅ in端口验证:`)
    inPorts.forEach(port => {
      const args = port.args || {}
      const dy = args.dy || 0
      console.log(`   - in端口 ${port.id}: dy=${dy}`)
      
      if (dy === 0) {
        console.log(`   - ✅ in端口正确位于节点中心 (dy=0)`)
      } else {
        console.warn(`   - ⚠️ in端口有偏移 (dy=${dy})，应该为0`)
      }
    })
  } else {
    console.warn(`⚠️ 未找到in端口`)
  }
  
  // 验证out端口
  if (outPorts.length > 0) {
    console.log(`✅ out端口验证:`)
    outPorts.forEach((port, index) => {
      const args = port.args || {}
      console.log(`   - out端口 ${port.id}:`, {
        dy: args.dy,
        y: args.y,
        rowIndex: args.rowIndex
      })
      
      // 验证out端口是否有正确的行索引
      if (args.rowIndex !== undefined) {
        console.log(`   - ✅ out端口 ${port.id} 有行索引: ${args.rowIndex}`)
      }
    })
  } else {
    console.warn(`⚠️ 未找到out端口`)
  }
  
  // 获取节点BBox进行验证
  const bbox = node.getBBox()
  const nodeCenterY = bbox.y + bbox.height / 2
  console.log(`📍 节点中心Y坐标: ${nodeCenterY}`)
  
  // 验证端口实际位置
  console.log(`🔍 端口实际位置验证:`)
  const view = graph.findViewByCell(node)
  if (view) {
    const container = view.container
    const portElements = container.querySelectorAll('[data-port], [port]')
    
    console.log(`   - 找到 ${portElements.length} 个端口DOM元素`)
    portElements.forEach((el, index) => {
      const portId = el.getAttribute('data-port') || el.getAttribute('port') || el.id || `port-${index}`
      const rect = el.getBoundingClientRect()
      const centerY = rect.top + rect.height / 2
      
      console.log(`   - 端口 ${portId}: 屏幕中心Y=${centerY}`)
    })
  }
  
  console.log('🎉 in端口修复验证测试完成！')
}

// 导出测试函数供外部使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testInPortFix }
} else {
  // 浏览器环境，将函数挂载到全局
  window.testInPortFix = testInPortFix
  
  // 自动运行测试（延迟2秒确保画布加载完成）
  setTimeout(() => {
    console.log('🚀 自动运行in端口修复验证测试...')
    testInPortFix()
  }, 2000)
}

console.log('✅ in端口修复验证测试脚本已加载，运行 testInPortFix() 开始测试')