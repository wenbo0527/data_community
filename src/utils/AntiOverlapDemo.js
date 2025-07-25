/**
 * 防重叠优化方案演示文件
 * 展示如何使用碰撞检测管理器和集成的布局引擎
 */

import CollisionDetectionManager from './CollisionDetectionManager.js'
import { IntelligentStructuredLayoutEngine } from './IntelligentStructuredLayoutEngine.js'
import { collisionDetectionTest } from './CollisionDetectionTest.js'

export class AntiOverlapDemo {
  constructor(graph) {
    this.graph = graph
    this.setupDemo()
  }

  /**
   * 设置演示环境
   */
  setupDemo() {
    console.log('🎯 [防重叠演示] 初始化演示环境')
    
    // 1. 创建碰撞检测管理器
    this.collisionManager = new CollisionDetectionManager(this.graph, {
      minSpacing: {
        nodeToNode: 80,
        nodeToDragPoint: 50,
        nodeToEdge: 40,
        nodeToPreviewLine: 60
      },
      detectionPrecision: 'high',
      resolutionStrategy: 'smart',
      enableRealTimeDetection: true
    })

    // 2. 创建智能布局引擎（已集成碰撞检测）
    this.layoutEngine = new IntelligentStructuredLayoutEngine(this.graph, {
      enableCollisionDetection: true,
      collisionResolutionIterations: 3
    })

    console.log('✅ [防重叠演示] 演示环境初始化完成')
  }

  /**
   * 演示1：基本碰撞检测
   */
  async demo1_BasicCollisionDetection() {
    console.log('\n🔍 [演示1] 基本碰撞检测')
    
    // 创建重叠的测试节点
    const node1 = this.graph.addNode({
      id: 'demo_node_1',
      x: 100,
      y: 100,
      width: 120,
      height: 80,
      shape: 'rect',
      label: '节点1',
      attrs: {
        body: { fill: '#e3f2fd' },
        label: { text: '节点1' }
      }
    })

    const node2 = this.graph.addNode({
      id: 'demo_node_2',
      x: 150, // 重叠位置
      y: 120,
      width: 120,
      height: 80,
      shape: 'rect',
      label: '节点2',
      attrs: {
        body: { fill: '#fff3e0' },
        label: { text: '节点2' }
      }
    })

    // 执行碰撞检测
    const result = await this.collisionManager.performComprehensiveCollisionDetection()
    
    console.log('📊 [演示1] 碰撞检测结果:', {
      hasCollisions: result.hasCollisions,
      nodeCollisions: result.nodeCollisions.length,
      details: result.nodeCollisions
    })

    if (result.hasCollisions) {
      // 生成并执行解决方案
      const resolutionPlan = this.collisionManager.generateResolutionPlan(result)
      console.log('🔧 [演示1] 解决方案:', resolutionPlan)
      
      if (resolutionPlan) {
        const resolutionResult = await this.collisionManager.executeResolutionPlan(resolutionPlan)
        console.log('✅ [演示1] 解决结果:', resolutionResult)
      }
    }

    return { node1, node2, result }
  }

  /**
   * 演示2：实时碰撞检测
   */
  async demo2_RealTimeCollisionDetection() {
    console.log('\n⚡ [演示2] 实时碰撞检测')
    
    // 启用实时检测
    this.collisionManager.enableRealTimeDetection()
    
    // 创建节点
    const movingNode = this.graph.addNode({
      id: 'demo_moving_node',
      x: 300,
      y: 300,
      width: 100,
      height: 60,
      shape: 'rect',
      label: '移动节点',
      attrs: {
        body: { fill: '#f3e5f5' },
        label: { text: '移动节点' }
      }
    })

    const staticNode = this.graph.addNode({
      id: 'demo_static_node',
      x: 500,
      y: 350,
      width: 100,
      height: 60,
      shape: 'rect',
      label: '静态节点',
      attrs: {
        body: { fill: '#e8f5e8' },
        label: { text: '静态节点' }
      }
    })

    // 模拟节点移动
    console.log('🚀 [演示2] 开始模拟节点移动')
    
    const moveSteps = [
      { x: 350, y: 320 },
      { x: 400, y: 340 },
      { x: 450, y: 360 }, // 接近静态节点
      { x: 480, y: 370 }  // 可能发生碰撞
    ]

    for (let i = 0; i < moveSteps.length; i++) {
      const step = moveSteps[i]
      console.log(`📍 [演示2] 移动到步骤 ${i + 1}: (${step.x}, ${step.y})`)
      
      // 移动节点
      movingNode.setPosition(step.x, step.y)
      
      // 触发实时碰撞检测
      await this.collisionManager.handleRealTimeCollision(movingNode.id)
      
      // 等待一段时间以观察效果
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    return { movingNode, staticNode }
  }

  /**
   * 演示3：智能布局集成碰撞检测
   */
  async demo3_IntelligentLayoutWithCollisionDetection() {
    console.log('\n🧠 [演示3] 智能布局集成碰撞检测')
    
    // 创建复杂的节点布局
    const startNode = this.graph.addNode({
      id: 'demo_start',
      x: 100,
      y: 200,
      width: 120,
      height: 80,
      shape: 'rect',
      data: { type: 'start' },
      attrs: {
        body: { fill: '#4caf50' },
        label: { text: '开始' }
      }
    })

    const nodes = [startNode]
    
    // 创建多个可能重叠的节点
    for (let i = 1; i <= 5; i++) {
      const node = this.graph.addNode({
        id: `demo_process_${i}`,
        x: 200 + (i * 80), // 故意创建重叠
        y: 180 + (i % 2) * 40,
        width: 120,
        height: 80,
        shape: 'rect',
        data: { type: 'process' },
        attrs: {
          body: { fill: '#2196f3' },
          label: { text: `处理${i}` }
        }
      })
      nodes.push(node)
    }

    // 创建连接
    const edges = []
    for (let i = 1; i < nodes.length; i++) {
      const edge = this.graph.addEdge({
        id: `demo_edge_${i}`,
        source: nodes[i - 1].id,
        target: nodes[i].id
      })
      edges.push(edge)
    }

    console.log('📐 [演示3] 执行智能布局（含碰撞检测）')
    
    // 执行智能布局（自动包含碰撞检测）
    const layoutResult = await this.layoutEngine.calculateIntelligentLayout(
      nodes, edges, []
    )

    console.log('📊 [演示3] 布局结果:', layoutResult)
    
    // 应用布局结果
    this.layoutEngine.applyLayoutResult(layoutResult)

    return { nodes, edges, layoutResult }
  }

  /**
   * 演示4：性能测试
   */
  async demo4_PerformanceTest() {
    console.log('\n⚡ [演示4] 性能测试')
    
    const nodeCount = 20
    const testNodes = []
    
    console.log(`🏗️ [演示4] 创建 ${nodeCount} 个测试节点`)
    
    // 创建大量节点进行性能测试
    for (let i = 0; i < nodeCount; i++) {
      const node = this.graph.addNode({
        id: `perf_test_${i}`,
        x: 100 + (i % 10) * 100,
        y: 100 + Math.floor(i / 10) * 100,
        width: 80,
        height: 60,
        shape: 'rect',
        attrs: {
          body: { fill: '#ff9800' },
          label: { text: `T${i}` }
        }
      })
      testNodes.push(node)
    }

    // 性能测试
    const startTime = performance.now()
    
    const result = await this.collisionManager.performComprehensiveCollisionDetection()
    
    const endTime = performance.now()
    const executionTime = endTime - startTime

    console.log('📊 [演示4] 性能测试结果:', {
      nodeCount,
      executionTime: `${executionTime.toFixed(2)}ms`,
      hasCollisions: result.hasCollisions,
      collisionCount: result.nodeCollisions.length,
      averageTimePerNode: `${(executionTime / nodeCount).toFixed(2)}ms`
    })

    return { testNodes, result, executionTime }
  }

  /**
   * 运行完整演示
   */
  async runFullDemo() {
    console.log('🎬 [防重叠演示] 开始完整演示')
    console.log('=' * 60)
    
    try {
      // 运行所有演示
      const demo1Result = await this.demo1_BasicCollisionDetection()
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const demo2Result = await this.demo2_RealTimeCollisionDetection()
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const demo3Result = await this.demo3_IntelligentLayoutWithCollisionDetection()
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const demo4Result = await this.demo4_PerformanceTest()
      
      // 运行测试套件
      console.log('\n🧪 [防重叠演示] 运行测试套件')
      const testResults = await collisionDetectionTest.runAllTests(this.graph)
      
      console.log('\n🎉 [防重叠演示] 完整演示结束')
      console.log('=' * 60)
      
      return {
        demo1: demo1Result,
        demo2: demo2Result,
        demo3: demo3Result,
        demo4: demo4Result,
        tests: testResults
      }
      
    } catch (error) {
      console.error('❌ [防重叠演示] 演示过程中发生错误:', error)
      throw error
    }
  }

  /**
   * 清理演示环境
   */
  cleanup() {
    console.log('🧹 [防重叠演示] 清理演示环境')
    
    // 移除所有演示节点
    const demoNodes = this.graph.getNodes().filter(node => 
      node.id.startsWith('demo_') || node.id.startsWith('perf_test_')
    )
    
    demoNodes.forEach(node => {
      this.graph.removeCell(node)
    })
    
    // 移除所有演示连线
    const demoEdges = this.graph.getEdges().filter(edge => 
      edge.id.startsWith('demo_')
    )
    
    demoEdges.forEach(edge => {
      this.graph.removeCell(edge)
    })
    
    console.log(`🗑️ [防重叠演示] 已清理 ${demoNodes.length} 个节点和 ${demoEdges.length} 条连线`)
  }
}

// 使用示例
export function createAntiOverlapDemo(graph) {
  return new AntiOverlapDemo(graph)
}

// 快速启动演示
export async function quickDemo(graph) {
  const demo = new AntiOverlapDemo(graph)
  
  try {
    const results = await demo.runFullDemo()
    console.log('✅ 快速演示完成:', results)
    return results
  } finally {
    // 可选：自动清理
    // demo.cleanup()
  }
}