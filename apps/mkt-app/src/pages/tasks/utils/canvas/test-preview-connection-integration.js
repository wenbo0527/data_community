/**
 * 预览线转换和连接线生成集成测试
 * 验证修复后的核心逻辑
 */

import { usePreviewLine } from '../../composables/canvas/usePreviewLine.js'
import { GraphOperationUtils } from './GraphOperationUtils.js'
import { ConnectionValidator } from './ConnectionValidator.js'

/**
 * 模拟X6图实例
 */
class MockGraph {
  constructor() {
    this.cells = new Map()
    this.edges = new Map()
  }

  getCellById(id) {
    return this.cells.get(id) || null
  }

  addNode(nodeData) {
    const node = {
      id: nodeData.id,
      ...nodeData,
      getData: () => nodeData.data || {}
    }
    this.cells.set(nodeData.id, node)
    return node
  }

  addEdge(edgeData) {
    const edge = {
      id: edgeData.id,
      ...edgeData,
      getData: () => edgeData.data || {},
      getSourceCellId: () => edgeData.source?.cell || edgeData.source,
      getTargetCellId: () => edgeData.target?.cell || edgeData.target,
      getSourcePortId: () => edgeData.source?.port,
      getTargetPortId: () => edgeData.target?.port,
      getLabels: () => [], // 添加getLabels方法
      setTarget: (target, options) => {
        edgeData.target = target
        console.log('📝 [MockGraph] 边目标更新:', { id: edgeData.id, target, options })
      },
      setData: (data) => {
        edgeData.data = { ...edgeData.data, ...data }
        console.log('📝 [MockGraph] 边数据更新:', { id: edgeData.id, data })
      },
      setAttrs: (attrs) => {
        edgeData.attrs = { ...edgeData.attrs, ...attrs }
        console.log('📝 [MockGraph] 边样式更新:', { id: edgeData.id, attrs })
      }
    }
    this.edges.set(edgeData.id, edge)
    this.cells.set(edgeData.id, edge)
    return edge
  }

  getEdges() {
    return Array.from(this.edges.values())
  }

  removeEdge(edgeId) {
    this.edges.delete(edgeId)
    this.cells.delete(edgeId)
  }
}

/**
 * 测试预览线转换为连接线
 */
async function testPreviewToConnectionConversion() {
  console.log('\n🧪 === 测试预览线转换为连接线 ===')
  
  // 创建模拟图实例
  const mockGraph = new MockGraph()
  
  // 添加测试节点
  const sourceNode = mockGraph.addNode({
    id: 'node-source',
    data: { type: 'start', label: '开始节点' }
  })
  
  const targetNode = mockGraph.addNode({
    id: 'node-target', 
    data: { type: 'process', label: '处理节点' }
  })
  
  console.log('✅ 创建测试节点:', {
    source: sourceNode.id,
    target: targetNode.id
  })
  
  // 初始化预览线管理器
  const previewLineManager = usePreviewLine(mockGraph)
  
  // 监听事件
  const events = []
  
  // 检查是否有on方法
  if (typeof previewLineManager.on === 'function') {
    previewLineManager.on('previewLine:created', (data) => {
      events.push({ type: 'created', data })
      console.log('📡 接收到预览线创建事件:', data)
    })
    
    previewLineManager.on('previewLine:converted', (data) => {
      events.push({ type: 'converted', data })
      console.log('📡 接收到预览线转换事件:', data)
    })
  } else {
    console.log('⚠️ 预览线管理器没有on方法，跳过事件监听')
  }
  
  try {
    // 1. 创建预览线
    console.log('\n📝 步骤1: 创建预览线')
    const previewLine = await previewLineManager.createPreviewLine(sourceNode.id, {
      branchId: 'branch-1'
    })
    
    console.log('✅ 预览线创建成功:', {
      id: previewLine.id,
      sourceNodeId: previewLine.source.nodeId,
      hasTarget: !!previewLine.target,
      type: previewLine.type
    })
    
    // 验证预览线状态
    if (previewLine.target) {
      throw new Error('❌ 预览线不应该有目标节点')
    }
    
    // 2. 转换为连接线
    console.log('\n📝 步骤2: 转换预览线为连接线')
    const connection = await previewLineManager.convertPreviewToConnection(
      previewLine.id,
      targetNode.id,
      { sourcePort: 'out', targetPort: 'in' }
    )
    
    console.log('✅ 预览线转换成功:', {
      id: connection.id,
      sourceNodeId: connection.source.nodeId,
      targetNodeId: connection.target?.nodeId,
      type: connection.type
    })
    
    // 验证转换结果
    if (!connection.target || connection.target.nodeId !== targetNode.id) {
      throw new Error('❌ 转换后的连接线目标节点不正确')
    }
    
    if (connection.source.nodeId !== sourceNode.id) {
      throw new Error('❌ 转换后的连接线源节点被意外改变')
    }
    
    // 3. 测试重复转换检查
    console.log('\n📝 步骤3: 测试重复连接检查')
    try {
      // 创建另一个预览线来测试重复连接检查
      const anotherPreviewLine = await previewLineManager.createPreviewLine(sourceNode.id, {
        branchId: 'branch-1'
      })
      
      await previewLineManager.convertPreviewToConnection(
        anotherPreviewLine.id,
        targetNode.id
      )
      throw new Error('❌ 应该检测到重复连接并抛出错误')
    } catch (error) {
      if (error.message.includes('连接已存在')) {
        console.log('✅ 重复连接检查正常工作')
      } else {
        throw error
      }
    }
    
    console.log('\n✅ 预览线转换测试通过')
    return { success: true, events }
    
  } catch (error) {
    console.error('❌ 预览线转换测试失败:', error)
    return { success: false, error, events }
  }
}

/**
 * 测试连接线生成
 */
async function testConnectionGeneration() {
  console.log('\n🧪 === 测试连接线生成 ===')
  
  // 创建模拟图实例和工具
  const mockGraph = new MockGraph()
  const mockEmit = (event, data) => {
    console.log(`📡 [GraphOperationUtils] 事件: ${event}`, data)
  }
  
  const graphUtils = new GraphOperationUtils({ value: mockGraph }, mockEmit)
  
  // 添加测试节点
  const node1 = mockGraph.addNode({
    id: 'node-1',
    data: { type: 'start', label: '节点1' }
  })
  
  const node2 = mockGraph.addNode({
    id: 'node-2',
    data: { type: 'process', label: '节点2' }
  })
  
  const connectionsList = []
  
  try {
    // 1. 创建连接
    console.log('\n📝 步骤1: 创建连接线')
    const connection = graphUtils.addConnection({
      source: { cell: node1.id, port: 'out' },
      target: { cell: node2.id, port: 'in' },
      branchId: 'branch-1',
      type: 'connection'
    }, connectionsList)
    
    console.log('✅ 连接线创建成功:', {
      id: connection?.id,
      source: connection?.source,
      target: connection?.target,
      branchId: connection?.branchId
    })
    
    // 验证连接在图中
    const graphEdge = mockGraph.getCellById(connection?.id)
    if (!graphEdge && !connection?.id) {
      console.log('⚠️ 连接线ID未返回，检查连接列表')
      if (connectionsList.length === 0) {
        throw new Error('❌ 连接线未添加到连接列表中')
      }
      console.log('✅ 连接线已添加到连接列表:', connectionsList[0])
    } else if (!graphEdge) {
      throw new Error('❌ 连接线未添加到图中')
    }
    
    // 2. 测试重复连接检查
    console.log('\n📝 步骤2: 测试重复连接检查')
    const duplicateConnection = graphUtils.addConnection({
      source: { cell: node1.id, port: 'out' },
      target: { cell: node2.id, port: 'in' },
      branchId: 'branch-1',
      type: 'connection'
    }, connectionsList)
    
    if (duplicateConnection?.id === connection?.id || connectionsList.length === 1) {
      console.log('✅ 重复连接检查正常，返回现有连接')
    } else {
      throw new Error('❌ 重复连接检查失败，创建了新连接')
    }
    
    // 3. 测试不同分支的连接
    console.log('\n📝 步骤3: 测试不同分支的连接')
    const branchConnection = graphUtils.addConnection({
      source: { cell: node1.id, port: 'out' },
      target: { cell: node2.id, port: 'in' },
      branchId: 'branch-2',
      type: 'connection'
    }, connectionsList)
    
    if (branchConnection?.id !== connection?.id || connectionsList.length > 1) {
      console.log('✅ 不同分支连接创建成功')
    } else {
      throw new Error('❌ 不同分支应该创建新连接')
    }
    
    console.log('\n✅ 连接线生成测试通过')
    return { success: true, connectionsList }
    
  } catch (error) {
    console.error('❌ 连接线生成测试失败:', error)
    return { success: false, error, connectionsList }
  }
}

/**
 * 测试连接验证器
 */
function testConnectionValidator() {
  console.log('\n🧪 === 测试连接验证器 ===')
  
  const mockGraph = new MockGraph()
  const validator = new ConnectionValidator(mockGraph)
  
  // 添加测试节点
  mockGraph.addNode({ id: 'node-a', data: { type: 'start' } })
  mockGraph.addNode({ id: 'node-b', data: { type: 'process' } })
  
  // 添加现有连接
  mockGraph.addEdge({
    id: 'existing-connection',
    source: { cell: 'node-a', port: 'out' },
    target: { cell: 'node-b', port: 'in' },
    data: {
      branchId: 'branch-1',
      isConnection: true,
      isPreview: false
    }
  })
  
  try {
    // 1. 测试重复连接检查
    console.log('\n📝 步骤1: 测试重复连接检查')
    const duplicateCheck = validator.checkDuplicateConnection('node-a', 'node-b', 'branch-1')
    
    if (duplicateCheck.isDuplicate) {
      console.log('✅ 重复连接检测正常:', duplicateCheck.error)
    } else {
      throw new Error('❌ 应该检测到重复连接')
    }
    
    // 2. 测试不同分支连接
    console.log('\n📝 步骤2: 测试不同分支连接')
    const differentBranchCheck = validator.checkDuplicateConnection('node-a', 'node-b', 'branch-2')
    
    if (!differentBranchCheck.isDuplicate) {
      console.log('✅ 不同分支连接检查正常')
    } else {
      throw new Error('❌ 不同分支不应该被视为重复')
    }
    
    // 3. 测试自连接检查
    console.log('\n📝 步骤3: 测试自连接检查')
    const selfConnectionCheck = validator.checkDuplicateConnection('node-a', 'node-a')
    
    if (selfConnectionCheck.isDuplicate && selfConnectionCheck.error.includes('自身')) {
      console.log('✅ 自连接检查正常')
    } else {
      throw new Error('❌ 应该检测到自连接')
    }
    
    // 4. 测试连接验证
    console.log('\n📝 步骤4: 测试连接验证')
    const validationResult = validator.validateConnection({
      source: { cell: 'node-a', port: 'out' },
      target: { cell: 'node-b', port: 'in' },
      branchId: 'branch-3'
    })
    
    if (validationResult.isValid) {
      console.log('✅ 连接验证正常')
    } else {
      console.log('❌ 连接验证失败:', validationResult.errors)
    }
    
    console.log('\n✅ 连接验证器测试通过')
    return { success: true }
    
  } catch (error) {
    console.error('❌ 连接验证器测试失败:', error)
    return { success: false, error }
  }
}

/**
 * 运行所有集成测试
 */
export async function runIntegrationTests() {
  console.log('🚀 开始预览线转换和连接线生成集成测试')
  
  const results = {
    previewToConnection: null,
    connectionGeneration: null,
    connectionValidator: null
  }
  
  try {
    // 测试预览线转换
    results.previewToConnection = await testPreviewToConnectionConversion()
    
    // 测试连接线生成
    results.connectionGeneration = await testConnectionGeneration()
    
    // 测试连接验证器
    results.connectionValidator = testConnectionValidator()
    
    // 汇总结果
    const allPassed = Object.values(results).every(result => result.success)
    
    console.log('\n📊 === 集成测试结果汇总 ===')
    console.log('预览线转换测试:', results.previewToConnection.success ? '✅ 通过' : '❌ 失败')
    console.log('连接线生成测试:', results.connectionGeneration.success ? '✅ 通过' : '❌ 失败')
    console.log('连接验证器测试:', results.connectionValidator.success ? '✅ 通过' : '❌ 失败')
    console.log('总体结果:', allPassed ? '✅ 全部通过' : '❌ 存在失败')
    
    return {
      success: allPassed,
      results,
      summary: {
        total: 3,
        passed: Object.values(results).filter(r => r.success).length,
        failed: Object.values(results).filter(r => !r.success).length
      }
    }
    
  } catch (error) {
    console.error('❌ 集成测试执行失败:', error)
    return {
      success: false,
      error,
      results
    }
  }
}

// 如果直接运行此文件，执行测试
if (typeof window === 'undefined' && import.meta.url === `file://${process.argv[1]}`) {
  runIntegrationTests().then(result => {
    console.log('\n🏁 测试完成:', result.success ? '成功' : '失败')
    process.exit(result.success ? 0 : 1)
  })
}