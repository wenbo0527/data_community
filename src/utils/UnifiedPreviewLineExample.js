/**
 * 统一预览线系统使用示例和测试
 * 展示如何使用新的统一预览线管理器
 */

import UnifiedPreviewLineManager, { UnifiedPreviewStates } from './UnifiedPreviewLineManager.js'
import PreviewLineMigrationTool from './PreviewLineMigrationTool.js'

// 使用示例类
export class UnifiedPreviewLineExample {
  constructor(graph, branchManager, layoutConfig) {
    this.graph = graph
    this.branchManager = branchManager
    this.layoutConfig = layoutConfig
    
    // 创建统一管理器
    this.unifiedManager = new UnifiedPreviewLineManager(graph, branchManager, layoutConfig)
    
    // 创建迁移工具
    this.migrationTool = new PreviewLineMigrationTool(graph, branchManager, layoutConfig)
  }

  /**
   * 基础使用示例
   */
  basicUsageExample() {
    console.log('📚 [统一预览线示例] 基础使用示例')

    // 1. 初始化管理器
    this.unifiedManager.init()

    // 2. 创建测试节点
    const testNode = this.graph.addNode({
      id: 'example_node_1',
      shape: 'rect',
      x: 100,
      y: 100,
      width: 120,
      height: 60,
      attrs: {
        body: {
          fill: '#e6f7ff',
          stroke: '#1890ff'
        },
        text: {
          text: '示例节点',
          fill: '#333'
        }
      },
      data: {
        type: 'process',
        configured: false
      }
    })

    // 3. 自动创建静态预览线
    console.log('✨ 节点添加后，自动创建静态预览线')

    // 4. 模拟节点配置完成
    setTimeout(() => {
      console.log('🔧 模拟节点配置完成，转换为交互状态')
      this.unifiedManager.onNodeConfigured(testNode)
    }, 2000)

    // 5. 模拟节点连接
    setTimeout(() => {
      console.log('🔗 模拟节点连接，预览线隐藏')
      this.unifiedManager.onNodeConnected(testNode)
    }, 4000)
  }

  /**
   * 分支节点示例
   */
  branchNodeExample() {
    console.log('📚 [统一预览线示例] 分支节点示例')

    // 创建分支节点
    const branchNode = this.graph.addNode({
      id: 'branch_node_1',
      shape: 'rect',
      x: 300,
      y: 100,
      width: 120,
      height: 60,
      attrs: {
        body: {
          fill: '#fff7e6',
          stroke: '#fa8c16'
        },
        text: {
          text: '分支节点',
          fill: '#333'
        }
      },
      data: {
        type: 'condition',
        isBranch: true,
        branches: [
          { id: 'yes', label: '是' },
          { id: 'no', label: '否' }
        ]
      }
    })

    // 模拟分支管理器
    if (!this.branchManager) {
      this.branchManager = {
        isBranchNode: (node) => {
          const data = node.getData() || {}
          return data.isBranch === true
        },
        getNodeBranches: (node) => {
          const data = node.getData() || {}
          return data.branches || []
        }
      }
      this.unifiedManager.branchManager = this.branchManager
    }

    // 创建分支预览线
    this.unifiedManager.createUnifiedPreviewLine(branchNode, UnifiedPreviewStates.STATIC_DISPLAY)

    // 转换为交互状态
    setTimeout(() => {
      this.unifiedManager.onNodeConfigured(branchNode)
    }, 2000)
  }

  /**
   * 状态转换示例
   */
  stateTransitionExample() {
    console.log('📚 [统一预览线示例] 状态转换示例')

    const stateNode = this.graph.addNode({
      id: 'state_node_1',
      shape: 'rect',
      x: 500,
      y: 100,
      width: 120,
      height: 60,
      attrs: {
        body: {
          fill: '#f6ffed',
          stroke: '#52c41a'
        },
        text: {
          text: '状态节点',
          fill: '#333'
        }
      },
      data: {
        type: 'action'
      }
    })

    // 创建预览线并演示所有状态
    const preview = this.unifiedManager.createUnifiedPreviewLine(stateNode, UnifiedPreviewStates.STATIC_DISPLAY)

    const states = [
      UnifiedPreviewStates.STATIC_DISPLAY,
      UnifiedPreviewStates.INTERACTIVE,
      UnifiedPreviewStates.DRAGGING,
      UnifiedPreviewStates.CONNECTED,
      UnifiedPreviewStates.HIDDEN
    ]

    let currentStateIndex = 0
    const stateInterval = setInterval(() => {
      if (currentStateIndex < states.length) {
        const state = states[currentStateIndex]
        console.log(`🔄 切换到状态: ${state}`)
        this.unifiedManager.setPreviewLineState(preview, state)
        currentStateIndex++
      } else {
        clearInterval(stateInterval)
        console.log('✅ 状态转换演示完成')
      }
    }, 1500)
  }

  /**
   * 迁移示例
   */
  async migrationExample(oldManager) {
    console.log('📚 [统一预览线示例] 迁移示例')

    try {
      // 1. 测试迁移
      console.log('🧪 开始测试迁移')
      const testResult = await this.migrationTool.startMigration(oldManager, {
        migrationMode: 'test'
      })
      console.log('✅ 测试迁移完成:', testResult)

      // 2. 共存迁移
      console.log('🤝 开始共存迁移')
      const coexistResult = await this.migrationTool.startMigration(oldManager, {
        migrationMode: 'coexist'
      })
      console.log('✅ 共存迁移完成:', coexistResult)

      // 3. 完全替换迁移
      console.log('🔄 开始完全替换迁移')
      const replaceResult = await this.migrationTool.startMigration(oldManager, {
        migrationMode: 'replace'
      })
      console.log('✅ 完全替换迁移完成:', replaceResult)

    } catch (error) {
      console.error('❌ 迁移失败:', error)
    }
  }

  /**
   * 性能测试示例
   */
  performanceTestExample() {
    console.log('📚 [统一预览线示例] 性能测试示例')

    const startTime = performance.now()
    const nodeCount = 50

    // 创建大量节点测试性能
    for (let i = 0; i < nodeCount; i++) {
      const node = this.graph.addNode({
        id: `perf_node_${i}`,
        shape: 'rect',
        x: (i % 10) * 150 + 50,
        y: Math.floor(i / 10) * 100 + 300,
        width: 100,
        height: 60,
        attrs: {
          body: {
            fill: '#f0f0f0',
            stroke: '#ccc'
          },
          text: {
            text: `节点${i + 1}`,
            fill: '#333'
          }
        },
        data: {
          type: 'test'
        }
      })

      // 创建预览线
      this.unifiedManager.createUnifiedPreviewLine(node, UnifiedPreviewStates.STATIC_DISPLAY)
    }

    const endTime = performance.now()
    const duration = endTime - startTime

    console.log(`⚡ 性能测试结果: 创建${nodeCount}个节点和预览线耗时 ${duration.toFixed(2)}ms`)
    console.log(`📊 平均每个节点耗时: ${(duration / nodeCount).toFixed(2)}ms`)

    // 测试状态转换性能
    const transitionStartTime = performance.now()
    const nodes = this.graph.getNodes().filter(node => node.id.startsWith('perf_node_'))
    
    nodes.forEach(node => {
      this.unifiedManager.onNodeConfigured(node)
    })

    const transitionEndTime = performance.now()
    const transitionDuration = transitionEndTime - transitionStartTime

    console.log(`⚡ 状态转换性能: ${nodeCount}个预览线状态转换耗时 ${transitionDuration.toFixed(2)}ms`)
  }

  /**
   * 兼容性测试示例
   */
  compatibilityTestExample() {
    console.log('📚 [统一预览线示例] 兼容性测试示例')

    // 测试旧API兼容性
    const compatNode1 = this.graph.addNode({
      id: 'compat_node_1',
      shape: 'rect',
      x: 100,
      y: 600,
      width: 120,
      height: 60,
      attrs: {
        body: {
          fill: '#fff1f0',
          stroke: '#ff4d4f'
        },
        text: {
          text: '兼容测试1',
          fill: '#333'
        }
      },
      data: {
        type: 'test'
      }
    })

    const compatNode2 = this.graph.addNode({
      id: 'compat_node_2',
      shape: 'rect',
      x: 300,
      y: 600,
      width: 120,
      height: 60,
      attrs: {
        body: {
          fill: '#f9f0ff',
          stroke: '#722ed1'
        },
        text: {
          text: '兼容测试2',
          fill: '#333'
        }
      },
      data: {
        type: 'test'
      }
    })

    // 使用旧API创建预览线
    console.log('🔄 测试 createPersistentPreview API')
    this.unifiedManager.createPersistentPreview(compatNode1)

    console.log('🔄 测试 createDraggablePreviewLine API')
    this.unifiedManager.createDraggablePreviewLine(compatNode2)

    console.log('✅ 兼容性测试完成')
  }

  /**
   * 错误处理示例
   */
  errorHandlingExample() {
    console.log('📚 [统一预览线示例] 错误处理示例')

    // 测试无效节点
    try {
      this.unifiedManager.createUnifiedPreviewLine(null)
    } catch (error) {
      console.log('✅ 正确处理了无效节点错误')
    }

    // 测试无效状态
    const testNode = this.graph.addNode({
      id: 'error_test_node',
      shape: 'rect',
      x: 500,
      y: 600,
      width: 120,
      height: 60,
      data: { type: 'test' }
    })

    const preview = this.unifiedManager.createUnifiedPreviewLine(testNode)
    
    try {
      this.unifiedManager.setPreviewLineState(preview, 'invalid_state')
    } catch (error) {
      console.log('✅ 正确处理了无效状态错误')
    }
  }

  /**
   * 运行所有示例
   */
  runAllExamples(oldManager = null) {
    console.log('🚀 [统一预览线示例] 开始运行所有示例')

    // 基础示例
    this.basicUsageExample()

    // 分支节点示例
    setTimeout(() => this.branchNodeExample(), 1000)

    // 状态转换示例
    setTimeout(() => this.stateTransitionExample(), 2000)

    // 性能测试示例
    setTimeout(() => this.performanceTestExample(), 8000)

    // 兼容性测试示例
    setTimeout(() => this.compatibilityTestExample(), 10000)

    // 错误处理示例
    setTimeout(() => this.errorHandlingExample(), 12000)

    // 迁移示例（如果提供了旧管理器）
    if (oldManager) {
      setTimeout(() => this.migrationExample(oldManager), 14000)
    }

    console.log('✅ [统一预览线示例] 所有示例已启动')
  }

  /**
   * 清理示例
   */
  cleanup() {
    // 移除测试节点
    const testNodes = this.graph.getNodes().filter(node => 
      node.id.startsWith('example_') || 
      node.id.startsWith('branch_') || 
      node.id.startsWith('state_') ||
      node.id.startsWith('perf_') ||
      node.id.startsWith('compat_') ||
      node.id.startsWith('error_')
    )

    testNodes.forEach(node => {
      this.graph.removeNode(node)
    })

    // 销毁管理器
    this.unifiedManager.destroy()
    this.migrationTool.destroy()

    console.log('🧹 [统一预览线示例] 清理完成')
  }
}

// 全局测试函数
export function testUnifiedPreviewLine(graph, branchManager, layoutConfig, oldManager = null) {
  console.log('🧪 开始统一预览线系统测试')

  const example = new UnifiedPreviewLineExample(graph, branchManager, layoutConfig)
  
  // 运行所有示例
  example.runAllExamples(oldManager)

  // 返回示例实例，以便后续清理
  return example
}

// 快速测试函数
export function quickTest(graph) {
  console.log('⚡ 快速测试统一预览线系统')

  const unifiedManager = new UnifiedPreviewLineManager(graph, null, {})
  unifiedManager.init()

  // 创建简单测试节点
  const quickTestNode = graph.addNode({
    id: 'quick_test_node',
    shape: 'rect',
    x: 200,
    y: 200,
    width: 100,
    height: 60,
    attrs: {
      body: { fill: '#e6f7ff', stroke: '#1890ff' },
      text: { text: '快速测试', fill: '#333' }
    },
    data: { type: 'test' }
  })

  // 测试状态转换
  setTimeout(() => unifiedManager.onNodeConfigured(quickTestNode), 1000)
  setTimeout(() => unifiedManager.onNodeConnected(quickTestNode), 3000)

  return unifiedManager
}

export default UnifiedPreviewLineExample