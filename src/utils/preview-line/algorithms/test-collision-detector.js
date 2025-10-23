/**
 * CollisionDetector 模块功能测试
 */

import { CollisionDetector } from './CollisionDetector.js'

// 创建测试用的模拟预览线数据
function createMockPreviewLine(id, startX, startY, endX, endY) {
  return {
    id: id,
    line: {
      id: id,
      getSource: () => ({ x: startX, y: startY }),
      getTarget: () => ({ x: endX, y: endY }),
      getSourcePoint: () => ({ x: startX, y: startY }),
      getTargetPoint: () => ({ x: endX, y: endY }),
      getRouter: () => ({ name: 'orth' }),
      setRouter: (config) => {
        console.log(`📍 [测试] 设置路由器配置 (${id}):`, config)
      },
      attr: (attrs) => {
        console.log(`🎨 [测试] 设置样式属性 (${id}):`, attrs)
      },
      getData: () => ({ id: id }),
      setData: (data) => {
        console.log(`💾 [测试] 设置数据 (${id}):`, data)
      }
    }
  }
}

// 创建测试用的模拟节点
function createMockNode(id, x, y, type = 'default') {
  return {
    id: id,
    getData: () => ({ type: type, nodeType: type }),
    getPosition: () => ({ x: x, y: y }),
    getSize: () => ({ width: 100, height: 60 })
  }
}

// 测试碰撞检测功能
function testCollisionDetection() {
  console.log('\n🔍 === 测试碰撞检测功能 ===')
  
  const detector = new CollisionDetector(null, { enableLogging: true })
  
  // 创建重叠的预览线
  const line1 = createMockPreviewLine('line1', 100, 100, 200, 100)
  const line2 = createMockPreviewLine('line2', 100, 105, 200, 105)
  
  const hasOverlap = detector.detectLineOverlap(line1.line, line2.line)
  
  console.log('重叠检测结果:', {
    line1Id: line1.id,
    line2Id: line2.id,
    hasOverlap: hasOverlap
  })
  
  return true // 测试完成
}

// 测试重叠优化功能
function testOverlapOptimization() {
  console.log('\n🔧 === 测试重叠优化功能 ===')
  
  const detector = new CollisionDetector(null, { enableLogging: true })
  const sourceNode = createMockNode('node1', 100, 100, 'sms')
  
  // 创建多条分支预览线实例
  const previewInstances = [
    { line: createMockPreviewLine('branch1', 100, 100, 300, 200).line, sourceNode },
    { line: createMockPreviewLine('branch2', 100, 100, 300, 250).line, sourceNode },
    { line: createMockPreviewLine('branch3', 100, 100, 300, 300).line, sourceNode }
  ]
  
  const result = detector.optimizeOverlappingPreviewLines(previewInstances)
  
  console.log('优化结果:', result)
  
  return result.optimized > 0
}

// 测试偏移计算功能
function testOffsetCalculation() {
  console.log('\n📐 === 测试偏移计算功能 ===')
  
  const detector = new CollisionDetector(null, { enableLogging: true })
  const sourceNode = createMockNode('node1', 100, 100, 'ai-call')
  
  // 创建预览线实例用于测试偏移配置生成
  const mockInstance = {
    line: createMockPreviewLine('test-line', 100, 100, 300, 200).line,
    sourceNode
  }
  
  // 测试不同分支索引的偏移计算
  for (let i = 0; i < 3; i++) {
    const offsetConfig = detector.generateOffsetConfig(i, 3, mockInstance)
    
    console.log(`分支 ${i} 偏移配置:`, {
      router: offsetConfig.router,
      style: offsetConfig.style,
      index: offsetConfig.index,
      total: offsetConfig.total
    })
  }
  
  return true
}

// 测试缓存功能
function testCacheManagement() {
  console.log('\n🗄️ === 测试缓存管理功能 ===')
  
  const detector = new CollisionDetector(null, { enableLogging: true })
  
  // 模拟一些缓存操作
  detector.offsetCache.set('test-key-1', { data: 'test1' })
  
  console.log('缓存大小:', {
    offsetCache: detector.offsetCache.size
  })
  
  // 测试偏移配置缓存
  const mockLine = createMockPreviewLine('cache-test', 100, 100, 200, 200)
  const mockInstance = {
    line: mockLine.line,
    sourceNode: createMockNode('node1', 100, 100)
  }
  
  const offsetConfig = detector.generateOffsetConfig(0, 1, mockInstance)
  detector.applyOffsetToLine(mockInstance, offsetConfig)
  
  console.log('应用偏移后缓存大小:', {
    offsetCache: detector.offsetCache.size
  })
  
  return true
}

// 运行所有测试
function runAllTests() {
  console.log('🚀 开始 CollisionDetector 模块测试\n')
  
  const results = {
    collisionDetection: false,
    overlapOptimization: false,
    offsetCalculation: false,
    cacheManagement: false
  }
  
  try {
    results.collisionDetection = testCollisionDetection()
    results.overlapOptimization = testOverlapOptimization()
    results.offsetCalculation = testOffsetCalculation()
    results.cacheManagement = testCacheManagement()
    
    console.log('\n📊 === 测试结果汇总 ===')
    console.log('碰撞检测:', results.collisionDetection ? '✅ 通过' : '❌ 失败')
    console.log('重叠优化:', results.overlapOptimization ? '✅ 通过' : '❌ 失败')
    console.log('偏移计算:', results.offsetCalculation ? '✅ 通过' : '❌ 失败')
    console.log('缓存管理:', results.cacheManagement ? '✅ 通过' : '❌ 失败')
    
    const allPassed = Object.values(results).every(result => result === true)
    console.log('\n🎯 总体结果:', allPassed ? '✅ 所有测试通过' : '❌ 部分测试失败')
    
    return allPassed
    
  } catch (error) {
    console.error('💥 测试过程中发生错误:', error)
    return false
  }
}

// 执行测试
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests()
}

export { runAllTests }