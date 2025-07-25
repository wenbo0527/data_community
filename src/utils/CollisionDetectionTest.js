/**
 * 碰撞检测管理器测试文件
 * 用于验证碰撞检测功能的正确性
 */

import CollisionDetectionManager from './CollisionDetectionManager.js'

export class CollisionDetectionTest {
  constructor() {
    this.testResults = []
  }

  /**
   * 运行所有测试
   */
  async runAllTests(graph) {
    console.log('🧪 [碰撞检测测试] 开始运行所有测试')
    
    const tests = [
      () => this.testBasicCollisionDetection(graph),
      () => this.testNodeOverlapDetection(graph),
      () => this.testDragPointCollisionDetection(graph),
      () => this.testResolutionPlanGeneration(graph),
      () => this.testPerformanceMetrics(graph)
    ]

    for (const test of tests) {
      try {
        await test()
      } catch (error) {
        console.error('🚨 [碰撞检测测试] 测试失败:', error)
        this.testResults.push({
          name: test.name,
          status: 'failed',
          error: error.message
        })
      }
    }

    this.printTestResults()
    return this.testResults
  }

  /**
   * 测试基本碰撞检测功能
   */
  async testBasicCollisionDetection(graph) {
    console.log('🔍 [测试] 基本碰撞检测功能')
    
    const collisionManager = new CollisionDetectionManager(graph, {
      minSpacing: {
        nodeToNode: 50,
        nodeToDragPoint: 30,
        nodeToEdge: 25,
        nodeToPreviewLine: 40
      }
    })

    // 创建测试节点
    const testNodes = [
      { id: 'test1', x: 100, y: 100, width: 80, height: 60 },
      { id: 'test2', x: 120, y: 110, width: 80, height: 60 } // 重叠节点
    ]

    // 模拟添加节点到图形
    testNodes.forEach(nodeData => {
      const node = graph.addNode({
        id: nodeData.id,
        x: nodeData.x,
        y: nodeData.y,
        width: nodeData.width,
        height: nodeData.height,
        shape: 'rect'
      })
    })

    const result = await collisionManager.performComprehensiveCollisionDetection()
    
    if (result.hasCollisions && result.nodeCollisions.length > 0) {
      console.log('✅ [测试] 基本碰撞检测 - 通过')
      this.testResults.push({
        name: 'testBasicCollisionDetection',
        status: 'passed',
        details: `检测到 ${result.nodeCollisions.length} 个节点碰撞`
      })
    } else {
      throw new Error('未能检测到预期的节点碰撞')
    }

    // 清理测试节点
    testNodes.forEach(nodeData => {
      const node = graph.getCellById(nodeData.id)
      if (node) graph.removeCell(node)
    })
  }

  /**
   * 测试节点重叠检测
   */
  async testNodeOverlapDetection(graph) {
    console.log('🔍 [测试] 节点重叠检测')
    
    const collisionManager = new CollisionDetectionManager(graph)

    // 创建完全重叠的测试节点
    const overlappingNodes = [
      { id: 'overlap1', x: 200, y: 200, width: 100, height: 80 },
      { id: 'overlap2', x: 200, y: 200, width: 100, height: 80 }
    ]

    overlappingNodes.forEach(nodeData => {
      graph.addNode({
        id: nodeData.id,
        x: nodeData.x,
        y: nodeData.y,
        width: nodeData.width,
        height: nodeData.height,
        shape: 'rect'
      })
    })

    const result = await collisionManager.performComprehensiveCollisionDetection()
    
    if (result.hasCollisions) {
      console.log('✅ [测试] 节点重叠检测 - 通过')
      this.testResults.push({
        name: 'testNodeOverlapDetection',
        status: 'passed',
        details: '成功检测到节点完全重叠'
      })
    } else {
      throw new Error('未能检测到节点重叠')
    }

    // 清理
    overlappingNodes.forEach(nodeData => {
      const node = graph.getCellById(nodeData.id)
      if (node) graph.removeCell(node)
    })
  }

  /**
   * 测试拖拽点碰撞检测
   */
  async testDragPointCollisionDetection(graph) {
    console.log('🔍 [测试] 拖拽点碰撞检测')
    
    const collisionManager = new CollisionDetectionManager(graph)

    // 创建节点和接近的拖拽点
    const node = graph.addNode({
      id: 'dragtest_node',
      x: 300,
      y: 300,
      width: 80,
      height: 60,
      shape: 'rect'
    })

    const dragPoint = graph.addNode({
      id: 'dragtest_point',
      x: 310, // 很接近节点
      y: 310,
      width: 20,
      height: 20,
      shape: 'circle',
      attrs: {
        body: {
          fill: '#ff6b6b'
        }
      }
    })

    const result = await collisionManager.performComprehensiveCollisionDetection()
    
    if (result.hasCollisions && result.dragPointCollisions.length > 0) {
      console.log('✅ [测试] 拖拽点碰撞检测 - 通过')
      this.testResults.push({
        name: 'testDragPointCollisionDetection',
        status: 'passed',
        details: `检测到 ${result.dragPointCollisions.length} 个拖拽点碰撞`
      })
    } else {
      throw new Error('未能检测到拖拽点碰撞')
    }

    // 清理
    graph.removeCell(node)
    graph.removeCell(dragPoint)
  }

  /**
   * 测试解决方案生成
   */
  async testResolutionPlanGeneration(graph) {
    console.log('🔍 [测试] 解决方案生成')
    
    const collisionManager = new CollisionDetectionManager(graph)

    // 创建碰撞场景
    const conflictNodes = [
      { id: 'resolve1', x: 400, y: 400, width: 80, height: 60 },
      { id: 'resolve2', x: 420, y: 410, width: 80, height: 60 }
    ]

    conflictNodes.forEach(nodeData => {
      graph.addNode({
        id: nodeData.id,
        x: nodeData.x,
        y: nodeData.y,
        width: nodeData.width,
        height: nodeData.height,
        shape: 'rect'
      })
    })

    const collisionResult = await collisionManager.performComprehensiveCollisionDetection()
    
    if (collisionResult.hasCollisions) {
      const resolutionPlan = collisionManager.generateResolutionPlan(collisionResult)
      
      if (resolutionPlan && resolutionPlan.actions.length > 0) {
        console.log('✅ [测试] 解决方案生成 - 通过')
        this.testResults.push({
          name: 'testResolutionPlanGeneration',
          status: 'passed',
          details: `生成了 ${resolutionPlan.actions.length} 个解决动作`
        })
      } else {
        throw new Error('未能生成有效的解决方案')
      }
    } else {
      throw new Error('测试场景未产生碰撞')
    }

    // 清理
    conflictNodes.forEach(nodeData => {
      const node = graph.getCellById(nodeData.id)
      if (node) graph.removeCell(node)
    })
  }

  /**
   * 测试性能指标
   */
  async testPerformanceMetrics(graph) {
    console.log('🔍 [测试] 性能指标')
    
    const collisionManager = new CollisionDetectionManager(graph, {
      performanceConfig: {
        enableBatching: true,
        batchSize: 50
      }
    })

    const startTime = performance.now()
    
    // 创建大量节点进行性能测试
    const performanceNodes = []
    for (let i = 0; i < 20; i++) {
      const nodeData = {
        id: `perf_${i}`,
        x: 500 + (i % 5) * 90,
        y: 500 + Math.floor(i / 5) * 70,
        width: 80,
        height: 60
      }
      
      graph.addNode({
        id: nodeData.id,
        x: nodeData.x,
        y: nodeData.y,
        width: nodeData.width,
        height: nodeData.height,
        shape: 'rect'
      })
      
      performanceNodes.push(nodeData)
    }

    await collisionManager.performComprehensiveCollisionDetection()
    
    const endTime = performance.now()
    const executionTime = endTime - startTime

    if (executionTime < 1000) { // 应该在1秒内完成
      console.log('✅ [测试] 性能指标 - 通过')
      this.testResults.push({
        name: 'testPerformanceMetrics',
        status: 'passed',
        details: `20个节点的碰撞检测耗时: ${executionTime.toFixed(2)}ms`
      })
    } else {
      throw new Error(`性能测试失败，耗时过长: ${executionTime.toFixed(2)}ms`)
    }

    // 清理
    performanceNodes.forEach(nodeData => {
      const node = graph.getCellById(nodeData.id)
      if (node) graph.removeCell(node)
    })
  }

  /**
   * 打印测试结果
   */
  printTestResults() {
    console.log('\n📊 [碰撞检测测试] 测试结果汇总:')
    console.log('=' * 50)
    
    const passed = this.testResults.filter(r => r.status === 'passed').length
    const failed = this.testResults.filter(r => r.status === 'failed').length
    
    this.testResults.forEach(result => {
      const icon = result.status === 'passed' ? '✅' : '❌'
      console.log(`${icon} ${result.name}: ${result.status}`)
      if (result.details) {
        console.log(`   详情: ${result.details}`)
      }
      if (result.error) {
        console.log(`   错误: ${result.error}`)
      }
    })
    
    console.log('=' * 50)
    console.log(`总计: ${this.testResults.length} 个测试`)
    console.log(`通过: ${passed} 个`)
    console.log(`失败: ${failed} 个`)
    console.log(`成功率: ${((passed / this.testResults.length) * 100).toFixed(1)}%`)
  }
}

// 导出测试实例
export const collisionDetectionTest = new CollisionDetectionTest()