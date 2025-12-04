export async function testQuickLayout(graph: any, handleQuickLayout: () => Promise<void>) {
  if (!graph) return
  const currentNodes = graph.getNodes?.() || []
  if (currentNodes.length > 0) {
    await handleQuickLayout()
  }
}

export function testConnectionRules(graph: any, createVueShapeNode: (spec: any) => any) {
  if (!graph) return
  const node1Id = `test-conn-1-${Date.now()}`
  const node2Id = `test-conn-2-${Date.now()}`
  const node1 = graph.addNode(createVueShapeNode({ id: node1Id, x: 100, y: 200, label: '连接测试节点1', outCount: 2, data: { type: 'crowd-split', nodeType: 'crowd-split', isConfigured: true, config: { nodeName: '测试分流1', crowdLayers: ['分支A', '分支B'], splitCount: 2 } } }))
  const node2 = graph.addNode(createVueShapeNode({ id: node2Id, x: 400, y: 200, label: '连接测试节点2', outCount: 1, data: { type: 'sms', nodeType: 'sms', isConfigured: true, config: { nodeName: '测试短信', smsTemplate: '测试模板' } } }))
  const node1Ports = node1.getPorts?.() || []
  const node2Ports = node2.getPorts?.() || []
  const outPort = node1Ports.find((p: any) => p.group === 'out')
  const inPort = node2Ports.find((p: any) => p.group === 'in')
  if (outPort && inPort) {
    graph.addEdge({ source: { cell: node1Id, port: outPort.id }, target: { cell: node2Id, port: inPort.id }, router: { name: 'normal' }, connector: { name: 'smooth' }, attrs: { line: { stroke: '#4C78FF', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } } })
  }
  const inPort1 = node1Ports.find((p: any) => p.group === 'in')
  const outPort2 = node2Ports.find((p: any) => p.group === 'out')
  if (inPort1 && outPort2) {
    try {
      graph.addEdge({ source: { cell: node2Id, port: outPort2.id }, target: { cell: node1Id, port: inPort1.id }, router: { name: 'normal' }, connector: { name: 'smooth' }, attrs: { line: { stroke: '#4C78FF', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } } })
    } catch {}
  }
}

export function runSimpleDebugNode(graph: any, nodeId: string, getNodeLabel: (t: string) => string, getNodeIconText: (t: string) => string, validateLayoutCoordinates: () => void) {
  if (!nodeId || !graph) return
  try {
    const node = graph.getCellById(nodeId)
    if (!node) return
    const data = node.getData?.() || {}
    const nodeType = data?.nodeType || data?.type
    const cfg = data?.config || {}
    const standardLabel = getNodeLabel(nodeType) || '未知节点类型'
    const standardIconText = getNodeIconText(nodeType)
    void standardLabel
    void standardIconText
    validateLayoutCoordinates && validateLayoutCoordinates()
  } catch {}
}

export function runTestDebugFunction(graph: any, nodeActionsMenuRef: any, createVueShapeNode: (spec: any) => any, NODE_DIMENSIONS: any, simpleDebugNode: (id: string) => void) {
  if (!graph) return
  const nodes = graph.getNodes?.() || []
  if (nodes.length === 0) {
    try {
      const testNode = graph.addNode({ id: 'test-node-' + Date.now(), x: 100, y: 100, width: NODE_DIMENSIONS.WIDTH, height: NODE_DIMENSIONS.MIN_HEIGHT, shape: 'rect', data: { nodeType: 'crowd-filter', nodeName: '测试人群筛选节点', config: { nodeName: '测试人群筛选节点', crowdName: '高价值用户群体', filterCondition: '消费金额 > 1000元' } } })
      nodeActionsMenuRef.value = { visible: false, x: 0, y: 0, nodeId: testNode.id }
      setTimeout(() => { simpleDebugNode(testNode.id) }, 500)
    } catch {}
  } else {
    const firstNode = nodes[0]
    nodeActionsMenuRef.value = { visible: false, x: 0, y: 0, nodeId: firstNode.id }
    setTimeout(() => { simpleDebugNode(firstNode.id) }, 500)
  }
}

export function runTestNodeStyleValidation(graph: any, createVueShapeNode: (spec: any) => any, NODE_DIMENSIONS: any, POSITIONS: any) {
  if (!graph) return
  try {
    const testNodeId = `test-style-${Date.now()}`
    const testNode = graph.addNode(createVueShapeNode({ id: testNodeId, x: 200, y: 200, label: '样式测试节点', outCount: 2, data: { type: 'crowd-split', nodeType: 'crowd-split', isConfigured: true, config: { nodeName: '样式测试分流', crowdLayers: ['高价值用户', '普通用户'], splitCount: 2 } } }))
    void NODE_DIMENSIONS
    void POSITIONS
    void testNode
  } catch {}
}

export function runTestPortRegistration(graph: any, createVueShapeNode: (spec: any) => any) {
  if (!graph) return
  try {
    const testNodeId = `test-port-${Date.now()}`
    const testNode = graph.addNode(createVueShapeNode({ id: testNodeId, x: 300, y: 300, label: '端口测试节点', outCount: 3, data: { type: 'crowd-split', nodeType: 'crowd-split', isConfigured: true, config: { nodeName: '端口测试分流', crowdLayers: ['高价值用户', '普通用户', '新用户'], splitCount: 3 } } }))
    void testNode
  } catch {}
}
/*
用途：调试辅助（保留入口，屏蔽页面详细逻辑）
说明：提供快速布局、连接规则、样式与端口注册等便捷测试入口；页面仅调用入口方法。
边界：仅在开发环境使用；不持久化、不修改生产逻辑；避免在生产环境挂载。
*/
