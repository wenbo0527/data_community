// 调试ValidationManager的问题

// 简单的mock函数
function createMockFn() {
  const fn = (...args) => fn.returnValue
  fn.mockReturnValue = (value) => { fn.returnValue = value; return fn }
  fn.mockImplementation = (impl) => { fn.implementation = impl; return fn }
  fn.returnValue = undefined
  return fn
}

// 模拟Canvas
const mockCanvas = {
  getNodes: createMockFn(),
  getEdges: createMockFn(),
  getCellById: createMockFn()
}

// 模拟EventBus
const mockEventBus = {
  emit: createMockFn(),
  on: createMockFn(),
  off: createMockFn()
}

// 模拟CacheManager
const mockCacheManager = {
  get: createMockFn(),
  set: createMockFn(),
  clear: createMockFn()
}

// 模拟ErrorHandler
const mockErrorHandler = {
  handleError: createMockFn()
}

// 创建测试数据
const mockInputNode = {
  id: 'input-node-1',
  getData: () => ({
    nodeType: 'INPUT_NODE',
    dataSource: { type: 'database', connectionString: 'valid-connection' },
    outputSchema: { fields: ['id', 'name'] }
  })
}

const mockOutputNode = {
  id: 'output-node-1',
  getData: () => ({
    nodeType: 'OUTPUT_NODE',
    outputConfig: { format: 'json', destination: 'file' }
  })
}

const mockEdge = {
  id: 'edge-1',
  getSourceCellId: () => 'input-node-1',
  getTargetCellId: () => 'output-node-1',
  getData: () => ({ type: 'NORMAL_CONNECTION' })
}

// 设置mock返回值
mockCanvas.getNodes.mockReturnValue([mockInputNode, mockOutputNode])
mockCanvas.getEdges.mockReturnValue([mockEdge])
mockCanvas.getCellById = (id) => {
  if (id === 'input-node-1') return mockInputNode
  if (id === 'output-node-1') return mockOutputNode
  if (id === 'edge-1') return mockEdge
  return null
}

console.log('Mock setup completed')
console.log('Nodes:', mockCanvas.getNodes())
console.log('Edges:', mockCanvas.getEdges())

// 测试各个校验器
async function testValidators() {
  try {
    // 导入ValidationManager
    const { ValidationManager } = await import('./src/managers/publish/ValidationManager.js')
    
    const validationManager = new ValidationManager({
      canvas: mockCanvas,
      eventBus: mockEventBus,
      cacheManager: mockCacheManager,
      errorHandler: mockErrorHandler
    })

    console.log('ValidationManager created')

    // 测试节点校验
    console.log('\n=== 测试节点校验 ===')
    const nodeValidations = await validationManager.validateAllNodes()
    console.log('Node validations:', {
      validationCount: nodeValidations.validations.size,
      errorCount: nodeValidations.errors.length,
      warningCount: nodeValidations.warnings.length,
      errors: nodeValidations.errors,
      warnings: nodeValidations.warnings
    })

    // 测试连接校验
    console.log('\n=== 测试连接校验 ===')
    const connectionValidations = await validationManager.validateConnections()
    console.log('Connection validations:', {
      validationCount: connectionValidations.validations.length,
      errorCount: connectionValidations.errors.length,
      warningCount: connectionValidations.warnings.length,
      errors: connectionValidations.errors,
      warnings: connectionValidations.warnings
    })

    // 测试流程完整性校验
    console.log('\n=== 测试流程完整性校验 ===')
    const flowValidations = await validationManager.validateFlowIntegrity()
    console.log('Flow validations:', {
      validationCount: flowValidations.validations.length,
      errorCount: flowValidations.errors.length,
      warningCount: flowValidations.warnings.length,
      errors: flowValidations.errors,
      warnings: flowValidations.warnings
    })

    // 测试完整校验
    console.log('\n=== 测试完整校验 ===')
    const result = await validationManager.validateAll()
    console.log('Complete validation result:', {
      isValid: result.isValid,
      errorCount: result.errors.length,
      warningCount: result.warnings.length,
      errors: result.errors,
      warnings: result.warnings
    })

  } catch (error) {
    console.error('测试失败:', error)
  }
}

testValidators()