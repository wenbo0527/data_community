/**
 * 增强预设线拖拽功能测试脚本
 * 在浏览器控制台中运行以下函数进行测试
 * 
 * 🧪 主要测试函数:
 * 
 * 0. testVisualDisplay() - 👁️ 可视化测试（推荐首先运行）
 *    - 清理画布并创建可视化测试节点
 *    - 确保节点和预览线都能正确显示
 *    - 适合验证基本的显示功能
 * 
 * 1. debugPreviewLineDirection() - 🔍 调试预览线方向
 *    - 专门用于调试预览线方向问题
 *    - 详细分析SOURCE和TARGET端点位置
 *    - 验证拖拽提示节点位置是否正确
 * 
 * 2. testEnhancedPreviewSimple() - 🌟 最推荐！最简单的独立测试
 *    - 手动创建节点，完全绕过ConnectionPreviewManager
 *    - 不触发任何自动事件，确保测试环境纯净
 *    - 直接测试EnhancedPreviewLineManager的核心功能
 * 
 * 3. testEnhancedPreviewOnly() - 推荐的独立测试
 *    - 临时禁用ConnectionPreviewManager的所有自动创建功能
 *    - 测试完成后自动恢复ConnectionPreviewManager
 *    - 适合验证两个管理器的协作关系
 * 
 * 4. testPreviewLineConnection() - 强制清理测试
 *    - 强制清理现有预览线和节点连接
 *    - 适合在复杂环境下进行测试
 *    - 可能会影响现有的预览线状态
 * 
 * 4. 其他辅助测试函数:
 *    - testEnhancedPreviewLine(): 基础预设线创建测试
 *    - analyzeConnectionEndpoints(): 分析连接线的两端点定义
 *    - verifyPreviewLineEndpoints(): 验证预设线端点配置
 *    - runFullTest(): 运行完整测试套件
 * 
 * 🔍 连接线端点说明:
 * - SOURCE端点: 固定在源节点的输出端口（out端口）
 * - TARGET端点: 可通过拖拽提示节点拖拽的自由坐标点
 * - 拖拽提示节点: 蓝色圆点，位于TARGET端点，用于拖拽交互
 * 
 * 📋 使用建议:
 * 1. 首先运行 testEnhancedPreviewOnly() 进行独立测试（避免ConnectionPreviewManager干扰）
 * 2. 如需详细分析，运行 analyzeConnectionEndpoints() 进行详细分析
 * 3. 使用 runFullTest() 进行全面测试
 * 
 * ⚠️ 注意事项:
 * - testEnhancedPreviewOnly() 会临时禁用ConnectionPreviewManager的自动创建功能
 * - 测试完成后会自动恢复ConnectionPreviewManager的正常功能
 */

// 测试增强预设线创建
window.testEnhancedPreviewLine = function() {
  console.log('🧪 开始测试增强预设线功能...')
  
  if (!window.enhancedPreviewManager) {
    console.error('❌ enhancedPreviewManager 未找到，请确保已初始化')
    return false
  }
  
  // 创建测试节点
  const testNode = createTestNode()
  if (!testNode) {
    console.error('❌ 测试节点创建失败')
    return false
  }
  
  console.log('🎯 为测试节点创建预设线:', testNode.id)
  
  try {
    window.enhancedPreviewManager.createDraggablePreviewLine(testNode)
    console.log('✅ 预设线创建成功')
    return true
  } catch (error) {
    console.error('❌ 预设线创建失败:', error)
    return false
  }
}

// 简单的可视化测试（确保节点和预览线都显示）
window.testVisualDisplay = function() {
  console.log('👁️ 简单可视化测试 - 确保节点和预览线都显示...')
  
  // 清理现有内容
  const graph = window.enhancedPreviewManager?.graph
  if (!graph) {
    console.error('❌ 未找到graph实例')
    return false
  }
  
  // 清理画布
  graph.clearCells()
  console.log('🧹 画布已清理')
  
  // 创建一个简单的测试节点
  console.log('🔧 创建可视化测试节点...')
  
  const testNode = graph.addNode({
    id: `visual_test_${Date.now()}`,
    shape: 'rect',
    x: 300,
    y: 200,
    width: 140,
    height: 80,
    label: '可视化测试节点',
    data: {
      type: 'test',
      name: '可视化测试节点'
    },
    ports: {
      groups: {
        in: {
          position: 'left',
          attrs: {
            circle: {
              r: 6,
              magnet: true,
              stroke: '#5F95FF',
              strokeWidth: 2,
              fill: '#fff'
            }
          }
        },
        out: {
          position: 'right',
          attrs: {
            circle: {
              r: 6,
              magnet: true,
              stroke: '#5F95FF',
              strokeWidth: 2,
              fill: '#fff'
            }
          }
        }
      },
      items: [
        { id: 'in', group: 'in' },
        { id: 'out', group: 'out' }
      ]
    },
    attrs: {
      body: {
        stroke: '#5F95FF',
        strokeWidth: 2,
        fill: '#EFF4FF',
        rx: 6,
        ry: 6
      },
      text: {
        fontSize: 14,
        fill: '#262626',
        fontWeight: 'bold'
      }
    }
  })
  
  if (!testNode) {
    console.error('❌ 节点创建失败')
    return false
  }
  
  console.log('✅ 节点创建成功:', testNode.id)
  console.log('📍 节点位置:', testNode.getPosition())
  console.log('📏 节点尺寸:', testNode.getSize())
  
  // 等待节点渲染完成
  setTimeout(() => {
    console.log('🎯 创建预览线...')
    
    if (window.enhancedPreviewManager) {
      const previewLine = window.enhancedPreviewManager.createDraggablePreviewLine(testNode)
      
      if (previewLine) {
        console.log('✅ 预览线创建成功:', previewLine.id)
        
        // 检查预览线的端点
        setTimeout(() => {
          const source = previewLine.getSource()
          const target = previewLine.getTarget()
          
          console.log('📊 预览线SOURCE:', source)
          console.log('📊 预览线TARGET:', target)
          
          // 查找拖拽提示节点
          const hintNodeId = `hint_${previewLine.id}`
          const hintNode = graph.getCellById(hintNodeId)
          
          if (hintNode) {
            console.log('🎯 拖拽提示节点找到:', hintNodeId)
            console.log('📍 提示节点位置:', hintNode.getPosition())
          } else {
            console.log('❌ 未找到拖拽提示节点:', hintNodeId)
          }
          
          console.log('\n🎯 可视化测试完成！')
          console.log('- 节点应该显示在画布中央')
          console.log('- 预览线应该从节点右侧端口延伸到下方')
          console.log('- 下方应该有一个蓝色的拖拽提示圆点')
        }, 300)
      } else {
        console.error('❌ 预览线创建失败')
      }
    } else {
      console.error('❌ EnhancedPreviewLineManager未找到')
    }
  }, 200)
  
  return true
}

// 创建测试节点
function createTestNode() {
  console.log('🏗️ 创建测试节点...')
  
  if (!window.enhancedPreviewManager) {
    console.error('❌ enhancedPreviewManager 未找到')
    return null
  }
  
  const graph = window.enhancedPreviewManager.graph
  
  // 清理之前的测试节点
  const existingTestNodes = graph.getNodes().filter(node => 
    node.id.startsWith('test_node_')
  )
  existingTestNodes.forEach(node => {
    console.log('🧹 清理旧的测试节点:', node.id)
    graph.removeNode(node)
  })
  
  // 创建一个简单的测试节点，确保端口配置正确
  const testNode = graph.addNode({
    id: `test_node_${Date.now()}`,
    x: 150,
    y: 100,
    width: 120,
    height: 60,
    shape: 'rect',
    attrs: {
      body: {
        fill: '#e6f7ff',
        stroke: '#1890ff',
        strokeWidth: 2,
        rx: 6,
        ry: 6
      },
      text: {
        text: '测试节点',
        fill: '#1890ff',
        fontSize: 12,
        textAnchor: 'middle',
        textVerticalAnchor: 'middle'
      }
    },
    data: {
      type: 'test',
      nodeType: 'test'
    },
    ports: {
      groups: {
        in: {
          position: 'left',
          attrs: {
            circle: {
              r: 4,
              magnet: true,
              stroke: '#1890ff',
              strokeWidth: 2,
              fill: '#fff'
            }
          }
        },
        out: {
          position: 'right',
          attrs: {
            circle: {
              r: 4,
              magnet: true,
              stroke: '#1890ff',
              strokeWidth: 2,
              fill: '#fff'
            }
          }
        }
      },
      items: [
        { group: 'in', id: 'in' },
        { group: 'out', id: 'out' }
      ]
    }
  })
  
  console.log('✅ 测试节点创建成功:', testNode.id)
  console.log('🔍 节点端口信息:', {
    position: testNode.getPosition(),
    size: testNode.getSize(),
    ports: testNode.getPorts()
  })
  
  return testNode
}

// 调试预览线方向的专用测试
window.debugPreviewLineDirection = function() {
  console.log('🔍 调试预览线方向...')
  
  // 清理现有内容
  if (window.enhancedPreviewManager) {
    window.enhancedPreviewManager.clearAllPreviewLines()
  }
  
  // 手动创建节点，不触发任何事件
  const graph = window.enhancedPreviewManager.graph
  const nodeId = `debug_node_${Date.now()}`
  
  // 直接添加节点到图形，不触发事件
  const testNode = graph.addNode({
    id: nodeId,
    shape: 'rect',
    x: 300,
    y: 200,
    width: 120,
    height: 60,
    label: '调试节点',
    data: {
      type: 'test',
      name: '调试节点'
    },
    ports: {
      groups: {
        in: {
          position: 'left',
          attrs: {
            circle: {
              r: 4,
              magnet: true,
              stroke: '#31d0c6',
              strokeWidth: 2,
              fill: '#fff'
            }
          }
        },
        out: {
          position: 'right',
          attrs: {
            circle: {
              r: 4,
              magnet: true,
              stroke: '#31d0c6',
              strokeWidth: 2,
              fill: '#fff'
            }
          }
        }
      },
      items: [
        { id: 'in', group: 'in' },
        { id: 'out', group: 'out' }
      ]
    },
    attrs: {
      body: {
        stroke: '#31d0c6',
        strokeWidth: 2,
        fill: '#f0f9ff'
      },
      text: {
        fontSize: 12,
        fill: '#333'
      }
    }
  })
  
  console.log('✅ 调试节点创建成功:', testNode.id)
  console.log('📍 节点位置:', testNode.getPosition())
  console.log('📏 节点尺寸:', testNode.getSize())
  console.log('🔌 节点端口:', testNode.getPorts())
  
  // 等待一下，然后创建预设线
  setTimeout(() => {
    console.log('🎯 创建预设线进行方向调试...')
    
    const previewLine = window.enhancedPreviewManager.createDraggablePreviewLine(testNode)
    
    if (previewLine) {
      console.log('✅ 预设线创建成功:', previewLine.id)
      
      // 详细分析预设线的source和target
      setTimeout(() => {
        const source = previewLine.getSource()
        const target = previewLine.getTarget()
        
        console.log('\n🔍 预设线详细分析:')
        console.log('📊 SOURCE端点:', source)
        console.log('📊 TARGET端点:', target)
        
        // 分析source端点
        if (source && source.cell && source.port) {
          const sourceNode = graph.getCellById(source.cell)
          if (sourceNode) {
            const sourcePos = sourceNode.getPosition()
            const sourceSize = sourceNode.getSize()
            console.log('📍 SOURCE节点位置:', sourcePos)
            console.log('📏 SOURCE节点尺寸:', sourceSize)
            console.log('🔌 SOURCE端口:', source.port)
            
            // 计算out端口的实际位置
            const outPortPos = {
              x: sourcePos.x + sourceSize.width,  // 右侧
              y: sourcePos.y + sourceSize.height / 2  // 中间
            }
            console.log('📍 out端口实际位置:', outPortPos)
          }
        }
        
        // 分析target端点
        if (target && typeof target.x === 'number' && typeof target.y === 'number') {
          console.log('📍 TARGET坐标:', target)
          
          // 检查target是否在节点下方
          const nodePos = testNode.getPosition()
          const nodeSize = testNode.getSize()
          const nodeBottom = nodePos.y + nodeSize.height
          
          console.log('📊 节点底部Y坐标:', nodeBottom)
          console.log('📊 TARGET的Y坐标:', target.y)
          
          if (target.y > nodeBottom) {
            console.log('✅ TARGET正确位于节点下方')
          } else {
            console.log('❌ TARGET位置错误 - 不在节点下方')
          }
        }
        
        // 查找拖拽提示节点
        const hintNodeId = `hint_${previewLine.id}`
        const hintNode = graph.getCellById(hintNodeId)
        
        if (hintNode) {
          const hintPos = hintNode.getPosition()
          console.log('🎯 拖拽提示节点位置:', hintPos)
          
          // 检查提示节点是否在target位置
          if (target && typeof target.x === 'number' && typeof target.y === 'number') {
            const distance = Math.sqrt(
              Math.pow(hintPos.x + 8 - target.x, 2) + 
              Math.pow(hintPos.y + 8 - target.y, 2)
            )
            console.log('📏 提示节点与TARGET的距离:', distance)
            
            if (distance < 5) {
              console.log('✅ 拖拽提示节点位置正确')
            } else {
              console.log('❌ 拖拽提示节点位置错误')
            }
          }
        } else {
          console.log('❌ 未找到拖拽提示节点:', hintNodeId)
        }
        
        console.log('\n🎯 方向分析结论:')
        console.log('- 预设线应该从节点的out端口（右侧）开始')
        console.log('- 预设线应该延伸到节点下方的自由坐标点')
        console.log('- 拖拽提示节点（蓝色圆点）应该在下方的target位置')
        console.log('- 用户应该能够拖拽下方的蓝色圆点来移动预设线')
      }, 200)
    } else {
      console.error('❌ 预设线创建失败')
    }
  }, 100)
}

// 最简单的独立测试（完全绕过ConnectionPreviewManager）
window.testEnhancedPreviewSimple = function() {
  console.log('🎯 最简单的EnhancedPreviewLineManager测试...')
  
  // 清理现有内容
  if (window.enhancedPreviewManager) {
    console.log('🧹 清理EnhancedPreviewLineManager的预设线...')
    window.enhancedPreviewManager.clearAllPreviewLines()
  }
  
  // 手动创建节点，不触发任何事件
  const graph = window.enhancedPreviewManager.graph
  const nodeId = `simple_test_node_${Date.now()}`
  
  console.log('🔧 手动创建测试节点（不触发事件）...')
  
  // 直接添加节点到图形，不触发事件
  const testNode = graph.addNode({
    id: nodeId,
    shape: 'rect',
    x: 200,
    y: 200,
    width: 120,
    height: 60,
    label: '简单测试节点',
    data: {
      type: 'test',
      name: '简单测试节点'
    },
    ports: {
      groups: {
        in: {
          position: 'left',
          attrs: {
            circle: {
              r: 4,
              magnet: true,
              stroke: '#31d0c6',
              strokeWidth: 2,
              fill: '#fff'
            }
          }
        },
        out: {
          position: 'right',
          attrs: {
            circle: {
              r: 4,
              magnet: true,
              stroke: '#31d0c6',
              strokeWidth: 2,
              fill: '#fff'
            }
          }
        }
      },
      items: [
        { id: 'in', group: 'in' },
        { id: 'out', group: 'out' }
      ]
    },
    attrs: {
      body: {
        stroke: '#31d0c6',
        strokeWidth: 2,
        fill: '#f0f9ff'
      },
      text: {
        fontSize: 12,
        fill: '#333'
      }
    }
  }) // 移除silent选项以确保节点正确显示
  
  if (!testNode) {
    console.error('❌ 简单测试节点创建失败')
    return false
  }
  
  console.log('✅ 简单测试节点创建成功:', testNode.id)
  console.log('🔍 节点端口信息:', testNode.getPorts())
  
  // 等待一下，然后直接创建预设线
  setTimeout(() => {
    console.log('🎯 为简单测试节点创建预设线...')
    
    try {
      const previewLine = window.enhancedPreviewManager.createDraggablePreviewLine(testNode)
      
      if (previewLine) {
        console.log('✅ 简单测试预设线创建成功:', previewLine.id)
        
        // 验证连接状态
        setTimeout(() => {
          verifyConnectionStatus(testNode, previewLine)
        }, 200)
        
        return true
      } else {
        console.error('❌ 简单测试预设线创建失败')
        return false
      }
    } catch (error) {
      console.error('❌ 简单测试预设线创建异常:', error)
      return false
    }
  }, 100)
}

// 独立测试EnhancedPreviewLineManager功能
window.testEnhancedPreviewOnly = function() {
  console.log('🎯 独立测试EnhancedPreviewLineManager功能...')
  
  // 更彻底地禁用ConnectionPreviewManager
  const originalConnectionManager = window.connectionPreviewManager
  let originalMethods = {}
  
  if (originalConnectionManager) {
    console.log('🔇 临时禁用ConnectionPreviewManager所有自动创建功能')
    
    // 保存并禁用所有相关方法
    const methodsToDisable = ['onNodeAdded', 'createPersistentPreview', 'createPersistentSinglePreview', 'createPersistentBranchPreview']
    
    methodsToDisable.forEach(methodName => {
      if (originalConnectionManager[methodName]) {
        originalMethods[methodName] = originalConnectionManager[methodName]
        originalConnectionManager[methodName] = () => {
          console.log(`🚫 [ConnectionPreview] ${methodName} 已被临时禁用`)
        }
      }
    })
  }
  
  // 清理现有内容
  if (window.enhancedPreviewManager) {
    console.log('🧹 清理EnhancedPreviewLineManager的预设线...')
    window.enhancedPreviewManager.clearAllPreviewLines()
  }
  
  // 清理现有的ConnectionPreviewManager预览线
  if (originalConnectionManager && originalMethods.clearAllPreviews) {
    try {
      originalMethods.clearAllPreviews.call(originalConnectionManager)
    } catch (error) {
      console.log('⚠️ 清理ConnectionPreviewManager预览线时出错:', error)
    }
  }
  
  // 创建测试节点
  const testNode = createTestNode()
  if (!testNode) {
    console.error('❌ 测试节点创建失败')
    
    // 恢复ConnectionPreviewManager
    restoreConnectionManager(originalConnectionManager, originalMethods)
    return false
  }
  
  // 等待节点创建完成，然后创建预设线
  setTimeout(() => {
    console.log('🎯 直接创建EnhancedPreviewLine...')
    
    try {
      const previewLine = window.enhancedPreviewManager.createDraggablePreviewLine(testNode)
      
      if (previewLine) {
        console.log('✅ EnhancedPreviewLine创建成功:', previewLine.id)
        
        // 验证连接状态
        setTimeout(() => {
          verifyConnectionStatus(testNode, previewLine)
          
          // 恢复ConnectionPreviewManager
          restoreConnectionManager(originalConnectionManager, originalMethods)
        }, 200)
        
        return true
      } else {
        console.error('❌ EnhancedPreviewLine创建失败')
        
        // 恢复ConnectionPreviewManager
        restoreConnectionManager(originalConnectionManager, originalMethods)
        return false
      }
    } catch (error) {
      console.error('❌ EnhancedPreviewLine创建异常:', error)
      
      // 恢复ConnectionPreviewManager
      restoreConnectionManager(originalConnectionManager, originalMethods)
      return false
    }
  }, 100)
  
  // 恢复ConnectionPreviewManager的辅助函数
  function restoreConnectionManager(manager, methods) {
    if (manager && Object.keys(methods).length > 0) {
      console.log('🔊 恢复ConnectionPreviewManager所有功能')
      Object.keys(methods).forEach(methodName => {
        manager[methodName] = methods[methodName]
      })
    }
  }
}

// 测试预设线与节点的连接状态
window.testPreviewLineConnection = function() {
  console.log('🔗 开始测试预设线与节点的连接状态...')
  
  // 清理现有内容
  if (window.enhancedPreviewManager) {
    console.log('🧹 清理EnhancedPreviewLineManager的预设线...')
    window.enhancedPreviewManager.clearAllPreviewLines()
  }
  
  // 清理ConnectionPreviewManager的预览线
  if (window.connectionPreviewManager) {
    console.log('🧹 清理ConnectionPreviewManager的预览线...')
    try {
      window.connectionPreviewManager.clearAllPreviews()
    } catch (error) {
      console.log('⚠️ 清理ConnectionPreviewManager预览线时出错:', error)
    }
  }
  
  // 创建新的测试节点
  const testNode = createTestNode()
  if (!testNode) {
    console.error('❌ 测试节点创建失败')
    return false
  }
  
  // 等待节点渲染完成后，先清理可能自动创建的预览线，再创建我们的预设线
  setTimeout(() => {
    console.log('🧹 清理节点自动创建的预览线...')
    
    // 获取并删除该节点的所有连接线
    const graph = window.enhancedPreviewManager.graph
    const connectedEdges = graph.getConnectedEdges(testNode)
    console.log('📊 找到连接线数量:', connectedEdges.length)
    
    connectedEdges.forEach(edge => {
      console.log('🗑️ 删除连接线:', edge.id)
      graph.removeEdge(edge)
    })
    
    // 再次等待一下，然后创建我们的预设线
    setTimeout(() => {
      console.log('🎯 为测试节点创建预设线...')
      
      try {
        const previewLine = window.enhancedPreviewManager.createDraggablePreviewLine(testNode)
        
        if (previewLine) {
          console.log('✅ 预设线创建成功:', previewLine.id)
          
          // 验证连接状态
          setTimeout(() => {
            verifyConnectionStatus(testNode, previewLine)
          }, 200)
          
          return true
        } else {
          console.error('❌ 预设线创建失败')
          return false
        }
      } catch (error) {
        console.error('❌ 预设线创建异常:', error)
        return false
      }
    }, 200)
  }, 500)
}

// 验证连接状态
function verifyConnectionStatus(testNode, previewLine) {
  console.log('\n🔍 验证预设线连接状态...')
  
  // 获取节点信息
  const nodePosition = testNode.getPosition()
  const nodeSize = testNode.getSize()
  const nodePorts = testNode.getPorts()
  
  console.log('📊 节点信息:')
  console.log('  - 位置:', nodePosition)
  console.log('  - 尺寸:', nodeSize)
  console.log('  - 端口:', nodePorts)
  
  // 获取预设线的source和target
  const source = previewLine.getSource()
  const target = previewLine.getTarget()
  
  console.log('🎯 预设线连接信息:')
  console.log('  - SOURCE:', source)
  console.log('  - TARGET:', target)
  
  // 验证source连接
  if (source && source.cell === testNode.id && source.port === 'out') {
    console.log('✅ SOURCE端点连接正确 - 连接到节点的out端口')
    
    // 计算out端口的实际位置
    const outPortPosition = {
      x: nodePosition.x + nodeSize.width,  // 右侧
      y: nodePosition.y + nodeSize.height / 2  // 中间
    }
    console.log('📍 out端口实际位置:', outPortPosition)
    
    // 验证target位置
    if (target && typeof target.x === 'number' && typeof target.y === 'number') {
      console.log('✅ TARGET端点配置正确 - 自由坐标点')
      console.log('📍 TARGET位置:', target)
      
      // 检查target是否在节点下方
      if (target.y > nodePosition.y + nodeSize.height) {
        console.log('✅ TARGET位置正确 - 位于节点下方')
        
        // 查找拖拽提示节点
        const hintNodeId = `hint_${previewLine.id}`
        const hintNodeElement = document.querySelector(`[data-cell-id="${hintNodeId}"]`)
        
        if (hintNodeElement) {
          console.log('✅ 拖拽提示节点存在:', hintNodeId)
          
          // 获取提示节点的位置
          const hintRect = hintNodeElement.getBoundingClientRect()
          const canvas = document.querySelector('.x6-graph-svg')
          const canvasRect = canvas.getBoundingClientRect()
          
          // 计算提示节点在画布中的位置
          const hintCanvasPosition = {
            x: hintRect.left - canvasRect.left + hintRect.width / 2,
            y: hintRect.top - canvasRect.top + hintRect.height / 2
          }
          
          console.log('📍 拖拽提示节点画布位置:', hintCanvasPosition)
          
          // 检查提示节点是否在target位置附近
          const distance = Math.sqrt(
            Math.pow(hintCanvasPosition.x - target.x, 2) + 
            Math.pow(hintCanvasPosition.y - target.y, 2)
          )
          
          console.log('📏 提示节点与TARGET距离:', distance.toFixed(2), '像素')
          
          if (distance < 20) {
            console.log('✅ 拖拽提示节点位置正确')
            console.log('\n🎉 预设线连接状态验证通过！')
            console.log('📋 总结:')
            console.log('  ✅ 节点端口配置正确')
            console.log('  ✅ 预设线SOURCE连接到节点out端口')
            console.log('  ✅ 预设线TARGET设置为自由坐标')
            console.log('  ✅ 拖拽提示节点位置正确')
            console.log('  ✅ 预设线与节点正确连接，无分离问题')
            return true
          } else {
            console.log('❌ 拖拽提示节点位置偏移过大')
          }
        } else {
          console.log('❌ 未找到拖拽提示节点')
        }
      } else {
        console.log('❌ TARGET位置错误 - 未位于节点下方')
      }
    } else {
      console.log('❌ TARGET端点配置错误')
    }
  } else {
    console.log('❌ SOURCE端点连接错误')
    console.log('  期望: { cell:', testNode.id, ', port: "out" }')
    console.log('  实际:', source)
  }
  
  console.log('\n❌ 预设线连接状态验证失败')
  return false
}

// 分析连接线的两端点定义
window.analyzeConnectionEndpoints = function() {
  console.log('🔍 开始分析连接线的两端点定义...')
  
  // 获取所有预设线
  const previewLines = document.querySelectorAll('[data-preview-line="true"]')
  console.log('📊 找到预设线数量:', previewLines.length)
  
  if (previewLines.length === 0) {
    console.log('⚠️ 没有找到预设线，先创建测试节点')
    testEnhancedPreviewLine()
    setTimeout(() => {
      analyzeConnectionEndpoints()
    }, 500)
    return
  }
  
  previewLines.forEach((lineElement, index) => {
    console.log(`\n🔍 分析预设线 ${index + 1}:`)
    
    const lineId = lineElement.getAttribute('data-preview-line-id')
    console.log('📋 预设线ID:', lineId)
    
    // 获取对应的预设线数据
    if (window.enhancedPreviewManager) {
      const previewData = window.enhancedPreviewManager.draggablePreviewLines.get(lineId)
      if (previewData) {
        const previewLine = previewData.line
        const sourceNode = previewData.sourceNode
        
        console.log('📊 预设线数据分析:')
        console.log('  - 源节点ID:', sourceNode.id)
        console.log('  - 源节点位置:', sourceNode.getPosition())
        console.log('  - 源节点尺寸:', sourceNode.getSize())
        
        // 获取source和target信息
        const source = previewLine.getSource()
        const target = previewLine.getTarget()
        
        console.log('🎯 连接线端点定义:')
        console.log('  - SOURCE (起点):', source)
        console.log('  - TARGET (终点):', target)
        
        // 分析source端点
         if (source && source.cell) {
           console.log('📍 SOURCE端点分析:')
           console.log('  - 连接到节点:', source.cell)
           console.log('  - 连接到端口:', source.port)
           console.log('  - 类型: 节点端口 (固定点)')
           
           // 获取节点端口的实际位置
           const sourceNodeCell = window.enhancedPreviewManager.graph.getCellById(source.cell)
           if (sourceNodeCell) {
             const nodePos = sourceNodeCell.getPosition()
             const nodeSize = sourceNodeCell.getSize()
             const portPosition = {
               x: nodePos.x + nodeSize.width, // 右侧端口
               y: nodePos.y + nodeSize.height / 2 // 中间位置
             }
             console.log('  - 端口实际位置:', portPosition)
           } else {
             console.log('  - 无法获取源节点信息')
           }
         }
        
        // 分析target端点
        if (target) {
          console.log('📍 TARGET端点分析:')
          if (typeof target.x === 'number' && typeof target.y === 'number') {
            console.log('  - 坐标位置:', target)
            console.log('  - 类型: 自由坐标点 (可拖拽)')
          } else if (target.cell) {
            console.log('  - 连接到节点:', target.cell)
            console.log('  - 连接到端口:', target.port)
            console.log('  - 类型: 节点端口 (固定点)')
          }
        }
        
        // 查找拖拽提示节点
        const hintNodeId = `hint_${lineId}`
        const hintNode = document.querySelector(`[data-cell-id="${hintNodeId}"]`)
        
        if (hintNode) {
          const hintRect = hintNode.getBoundingClientRect()
          const hintCenter = {
            x: hintRect.left + hintRect.width / 2,
            y: hintRect.top + hintRect.height / 2
          }
          
          console.log('🎯 拖拽提示节点分析:')
          console.log('  - 节点ID:', hintNodeId)
          console.log('  - 屏幕位置:', hintCenter)
          console.log('  - 作用: 拖拽TARGET端点')
          
          // 检查拖拽提示节点是否在正确位置
          if (target && typeof target.x === 'number' && typeof target.y === 'number') {
            // 将画布坐标转换为屏幕坐标进行比较
            const canvas = document.querySelector('.x6-graph-svg')
            if (canvas) {
              const canvasRect = canvas.getBoundingClientRect()
              const targetScreenPos = {
                x: canvasRect.left + target.x,
                y: canvasRect.top + target.y
              }
              
              const distance = Math.sqrt(
                Math.pow(hintCenter.x - targetScreenPos.x, 2) + 
                Math.pow(hintCenter.y - targetScreenPos.y, 2)
              )
              
              console.log('  - TARGET坐标对应屏幕位置:', targetScreenPos)
              console.log('  - 与TARGET位置距离:', distance.toFixed(2), '像素')
              
              if (distance < 20) {
                console.log('  ✅ 拖拽提示节点位置正确 (靠近TARGET端点)')
              } else {
                console.log('  ❌ 拖拽提示节点位置错误 (远离TARGET端点)')
              }
            }
          }
        } else {
          console.log('❌ 未找到拖拽提示节点:', hintNodeId)
        }
        
        console.log('\n📋 总结:')
        console.log('  - SOURCE端点: 连接到源节点的输出端口 (固定，不可拖拽)')
        console.log('  - TARGET端点: 自由坐标点 (可通过拖拽提示节点拖拽)')
        console.log('  - 拖拽机制: 拖拽蓝色圆点来移动TARGET端点')
      }
    }
  })
  
  return true
}
window.verifyPreviewLineEndpoints = function() {
  console.log('🔍 开始验证预设线端点配置...')
  
  // 获取所有预设线
  const previewLines = document.querySelectorAll('[data-preview-line="true"]')
  console.log('📊 找到预设线数量:', previewLines.length)
  
  if (previewLines.length === 0) {
    console.log('⚠️ 没有找到预设线')
    return false
  }
  
  // 获取所有拖拽提示节点
  const hintNodes = document.querySelectorAll('[data-cell-id^="hint_"]')
  console.log('📊 找到拖拽提示节点数量:', hintNodes.length)
  
  // 获取所有测试节点
  const testNodes = document.querySelectorAll('[data-cell-id^="test_node_"]')
  console.log('📊 找到测试节点数量:', testNodes.length)
  
  previewLines.forEach((lineElement, index) => {
    console.log(`\n🔍 检查预设线 ${index + 1}:`)
    
    // 获取预设线ID
    const lineId = lineElement.getAttribute('data-preview-line-id')
    console.log('📋 预设线ID:', lineId)
    
    // 获取path元素
    const pathElement = lineElement.querySelector('path')
    if (pathElement) {
      const pathData = pathElement.getAttribute('d')
      console.log('📏 路径数据:', pathData)
      
      // 解析路径数据以确定起点和终点
      const pathCommands = pathData.match(/[ML]\s*[\d.-]+\s*[\d.-]+/g)
      if (pathCommands && pathCommands.length >= 2) {
        const startPoint = pathCommands[0].replace(/[ML]\s*/, '').split(/\s+/)
        const endPoint = pathCommands[pathCommands.length - 1].replace(/[ML]\s*/, '').split(/\s+/)
        
        const startCoord = { x: parseFloat(startPoint[0]), y: parseFloat(startPoint[1]) }
        const endCoord = { x: parseFloat(endPoint[0]), y: parseFloat(endPoint[1]) }
        
        console.log('📍 起点坐标:', startCoord)
        console.log('📍 终点坐标:', endCoord)
        
        // 判断哪个端点在上方（y值较小）
        if (startCoord.y < endCoord.y) {
          console.log('✅ 起点在上方，终点在下方 - 符合预期')
          console.log('📏 垂直距离:', endCoord.y - startCoord.y, '像素')
        } else if (startCoord.y > endCoord.y) {
          console.log('❌ 终点在上方，起点在下方 - 需要修正')
          console.log('📏 垂直距离:', startCoord.y - endCoord.y, '像素')
        } else {
          console.log('⚠️ 起点和终点在同一水平线上')
        }
        
        // 查找对应的拖拽提示节点
        const hintNodeId = `hint_${lineId}`
        const hintNode = document.querySelector(`[data-cell-id="${hintNodeId}"]`)
        
        if (hintNode) {
          const hintRect = hintNode.getBoundingClientRect()
          const hintCenter = {
            x: hintRect.left + hintRect.width / 2,
            y: hintRect.top + hintRect.height / 2
          }
          console.log('🎯 拖拽提示节点位置:', hintCenter)
          
          // 检查拖拽提示节点是否在预设线的终点附近
          const distanceToEnd = Math.sqrt(
            Math.pow(hintCenter.x - endCoord.x, 2) + 
            Math.pow(hintCenter.y - endCoord.y, 2)
          )
          const distanceToStart = Math.sqrt(
            Math.pow(hintCenter.x - startCoord.x, 2) + 
            Math.pow(hintCenter.y - startCoord.y, 2)
          )
          
          console.log('📏 拖拽提示节点到终点距离:', distanceToEnd.toFixed(2), '像素')
          console.log('📏 拖拽提示节点到起点距离:', distanceToStart.toFixed(2), '像素')
          
          if (distanceToEnd < distanceToStart) {
            console.log('✅ 拖拽提示节点更靠近终点（底部）- 符合预期')
          } else {
            console.log('❌ 拖拽提示节点更靠近起点（顶部）- 需要修正')
          }
          
          // 检查拖拽提示节点是否在下方
          if (startCoord.y < endCoord.y) {
            // 预设线从上到下
            if (hintCenter.y > startCoord.y) {
              console.log('✅ 拖拽提示节点在预设线起点下方 - 符合预期')
            } else {
              console.log('❌ 拖拽提示节点在预设线起点上方 - 位置错误')
            }
          }
          
        } else {
          console.log('❌ 未找到对应的拖拽提示节点:', hintNodeId)
        }
      }
    }
  })
  
  // 检查测试节点位置
  if (testNodes.length > 0) {
    console.log('\n🔍 测试节点位置信息:')
    testNodes.forEach((node, index) => {
      const rect = node.getBoundingClientRect()
      const center = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      }
      console.log(`📍 测试节点 ${index + 1} 中心位置:`, center)
      console.log(`📏 测试节点 ${index + 1} 尺寸:`, { width: rect.width, height: rect.height })
    })
  }
  
  return true
}

// 测试预设线拖拽功能 - 测试下方端点拖拽
window.testPreviewLineDrag = function() {
  console.log('🧪 开始测试预设线拖拽功能（下方端点拖拽）...')
  
  // 查找拖拽提示节点（下方端点）
  const hintNodes = document.querySelectorAll('[data-cell-id^="hint_"]')
  console.log('📊 拖拽提示节点数量:', hintNodes.length)
  
  if (hintNodes.length === 0) {
    console.log('⚠️ 没有找到拖拽提示节点，请先创建预设线')
    return false
  }
  
  const hintNode = hintNodes[0]
  console.log('🎯 测试第一个拖拽提示节点:', hintNode)
  
  // 获取初始位置
  const rect = hintNode.getBoundingClientRect()
  const initialX = rect.left + rect.width / 2
  const initialY = rect.top + rect.height / 2
  
  console.log('📍 拖拽提示节点初始位置:', { x: initialX, y: initialY })
  
  // 获取对应的预设线
  const previewLineId = hintNode.getAttribute('data-cell-id').replace('hint_', '')
  const previewLines = document.querySelectorAll(`[data-preview-line-id*="${previewLineId.split('_')[1]}"]`)
  
  if (previewLines.length > 0) {
    const previewLine = previewLines[0]
    const pathElement = previewLine.querySelector('path')
    if (pathElement) {
      const pathData = pathElement.getAttribute('d')
      console.log('📏 预设线初始路径:', pathData)
    }
  }
  
  // 模拟拖拽：向右下方移动
  const targetX = initialX + 100
  const targetY = initialY + 100
  
  console.log('🎯 目标位置:', { x: targetX, y: targetY })
  
  // 创建鼠标事件
  const mouseDownEvent = new MouseEvent('mousedown', {
    bubbles: true,
    cancelable: true,
    clientX: initialX,
    clientY: initialY,
    button: 0
  })
  
  const mouseMoveEvent = new MouseEvent('mousemove', {
    bubbles: true,
    cancelable: true,
    clientX: targetX,
    clientY: targetY,
    button: 0
  })
  
  const mouseUpEvent = new MouseEvent('mouseup', {
    bubbles: true,
    cancelable: true,
    clientX: targetX,
    clientY: targetY,
    button: 0
  })
  
  // 执行拖拽序列
  console.log('🖱️ 开始模拟拖拽...')
  hintNode.dispatchEvent(mouseDownEvent)
  
  setTimeout(() => {
    console.log('🖱️ 模拟鼠标移动...')
    document.dispatchEvent(mouseMoveEvent)
    
    setTimeout(() => {
      console.log('🖱️ 模拟鼠标释放...')
      document.dispatchEvent(mouseUpEvent)
      
      // 检查结果
      setTimeout(() => {
        const newRect = hintNode.getBoundingClientRect()
        const newX = newRect.left + newRect.width / 2
        const newY = newRect.top + newRect.height / 2
        
        console.log('📍 拖拽后位置:', { x: newX, y: newY })
        console.log('📏 位置变化:', { 
          deltaX: newX - initialX, 
          deltaY: newY - initialY 
        })
        
        // 检查预设线路径是否改变
        if (previewLines.length > 0) {
          const previewLine = previewLines[0]
          const pathElement = previewLine.querySelector('path')
          if (pathElement) {
            const newPathData = pathElement.getAttribute('d')
            console.log('📏 预设线新路径:', newPathData)
          }
        }
        
        const moved = Math.abs(newX - initialX) > 10 || Math.abs(newY - initialY) > 10
        console.log(moved ? '✅ 拖拽测试成功' : '❌ 拖拽测试失败')
        
        return moved
      }, 100)
    }, 100)
  }, 100)
  
  return true
}

// 测试事件绑定
window.testEventBinding = function() {
  console.log('🧪 开始测试事件绑定...')
  
  // 检查预设线
  const previewLines = document.querySelectorAll('[data-preview-line="true"]')
  console.log('📊 预设线数量:', previewLines.length)
  
  previewLines.forEach((line, index) => {
    console.log(`🔍 检查预设线 ${index + 1}:`, {
      id: line.getAttribute('data-preview-line-id'),
      cursor: line.style.cursor,
      pointerEvents: line.style.pointerEvents,
      dataAttributes: Array.from(line.attributes).filter(attr => attr.name.startsWith('data-'))
    })
  })
  
  // 检查拖拽提示节点
  const hintNodes = document.querySelectorAll('[data-cell-id^="hint_"]')
  console.log('📊 拖拽提示节点数量:', hintNodes.length)
  
  hintNodes.forEach((node, index) => {
    console.log(`🎯 检查拖拽提示节点 ${index + 1}:`, {
      id: node.getAttribute('data-cell-id'),
      cursor: getComputedStyle(node).cursor,
      hasMouseDownListener: node.onmousedown !== null,
      position: {
        x: node.getBoundingClientRect().left,
        y: node.getBoundingClientRect().top
      }
    })
  })
  
  return true
}

// 测试DOM元素事件
window.testDOMEvents = function() {
  console.log('🧪 开始测试DOM元素事件...')
  
  const previewLines = document.querySelectorAll('[data-preview-line="true"]')
  
  if (previewLines.length === 0) {
    console.log('⚠️ 没有找到预设线')
    return false
  }
  
  const line = previewLines[0]
  
  // 测试悬停事件
  const mouseEnterEvent = new MouseEvent('mouseenter', { bubbles: true })
  const mouseLeaveEvent = new MouseEvent('mouseleave', { bubbles: true })
  
  console.log('🖱️ 测试悬停事件...')
  line.dispatchEvent(mouseEnterEvent)
  
  setTimeout(() => {
    line.dispatchEvent(mouseLeaveEvent)
    console.log('✅ 悬停事件测试完成')
  }, 1000)
  
  // 测试双击事件
  const dblClickEvent = new MouseEvent('dblclick', { bubbles: true })
  console.log('🖱️ 测试双击事件...')
  line.dispatchEvent(dblClickEvent)
  
  return true
}

// 清理预设线
window.cleanupPreviewLines = function() {
  console.log('🧹 清理所有预设线...')
  
  if (!window.enhancedPreviewManager) {
    console.error('❌ enhancedPreviewManager 未找到')
    return false
  }
  
  try {
    const cleanedCount = window.enhancedPreviewManager.clearAllPreviewLines()
    console.log(`✅ 已清理 ${cleanedCount} 条预设线`)
    
    // 同时清理测试节点
    cleanupTestNodes()
    
    return true
  } catch (error) {
    console.error('❌ 预设线清理失败:', error)
    return false
  }
}

// 清理测试节点
function cleanupTestNodes() {
  console.log('🧹 清理测试节点...')
  
  if (!window.enhancedPreviewManager) {
    return
  }
  
  const graph = window.enhancedPreviewManager.graph
  const nodes = graph.getNodes()
  
  const testNodes = nodes.filter(node => {
    const nodeData = node.getData()
    return nodeData?.type === 'test' || node.id.startsWith('test_node_')
  })
  
  console.log(`📊 找到 ${testNodes.length} 个测试节点`)
  
  testNodes.forEach(node => {
    graph.removeNode(node)
    console.log(`🗑️ 已删除测试节点: ${node.id}`)
  })
}

// 测试分支预览线功能
window.testBranchPreviewLines = function() {
  console.log('🌿 开始测试分支预览线功能...')
  
  try {
    // 清理现有内容
    cleanupTestNodes()
    window.cleanupPreviewLines()
    
    const graph = window.enhancedPreviewManager.graph
    
    // 创建分流节点测试数据
    const branchNodeData = {
      id: 'test-branch-node',
      type: 'audience-split',
      nodeType: 'audience-split',
      label: '受众分流',
      branches: [
        { id: 'branch_1', label: '分支1', condition: '年龄 > 25' },
        { id: 'branch_2', label: '分支2', condition: '年龄 <= 25' },
        { id: 'branch_3', label: '分支3', condition: '其他' }
      ],
      position: { x: 300, y: 200 }
    }
    
    // 创建分流节点
    const branchNode = graph.addNode({
      id: branchNodeData.id,
      shape: 'rect',
      x: branchNodeData.position.x,
      y: branchNodeData.position.y,
      width: 120,
      height: 60,
      attrs: {
        body: {
          fill: '#e6f7ff',
          stroke: '#1890ff',
          strokeWidth: 2,
          rx: 8,
          ry: 8
        },
        text: {
          text: branchNodeData.label,
          fill: '#1890ff',
          fontSize: 14,
          fontWeight: 'bold'
        }
      },
      ports: {
        groups: {
          in: {
            position: 'top',
            attrs: {
              circle: {
                r: 4,
                magnet: true,
                stroke: '#1890ff',
                strokeWidth: 2,
                fill: '#ffffff'
              }
            }
          },
          out: {
            position: 'bottom',
            attrs: {
              circle: {
                r: 4,
                magnet: true,
                stroke: '#1890ff',
                strokeWidth: 2,
                fill: '#ffffff'
              }
            }
          }
        },
        items: [
          { group: 'in', id: 'in' },
          { group: 'out', id: 'out_branch_1' },
          { group: 'out', id: 'out_branch_2' },
          { group: 'out', id: 'out_branch_3' }
        ]
      },
      data: branchNodeData
    })
    
    console.log('✅ 分流节点创建成功:', branchNode.id)
    
    // 触发节点配置更新事件，让预览线管理器创建分支预览线
    setTimeout(() => {
      console.log('🔄 触发节点配置更新事件...')
      graph.trigger('node:config-updated', { node: branchNode })
      
      // 验证分支预览线是否创建
      setTimeout(() => {
        const previewLines = graph.getEdges().filter(edge => {
          const data = edge.getData()
          return data && data.type === 'draggable-preview'
        })
        
        console.log('📊 分支预览线创建结果:', {
          expectedBranches: branchNodeData.branches.length,
          actualPreviewLines: previewLines.length,
          previewLines: previewLines.map(line => ({
            id: line.id,
            branchId: line.getData()?.branchId,
            branchIndex: line.getData()?.branchIndex,
            color: line.attr('line/stroke')
          }))
        })
        
        if (previewLines.length === branchNodeData.branches.length) {
          console.log('✅ 分支预览线创建成功！每个分支都有对应的预览线')
          
          // 检查颜色是否不同
          const colors = previewLines.map(line => line.attr('line/stroke'))
          const uniqueColors = [...new Set(colors)]
          
          if (uniqueColors.length === colors.length) {
            console.log('✅ 分支预览线颜色区分成功！每个分支都有不同的颜色')
          } else {
            console.warn('⚠️ 分支预览线颜色可能重复')
          }
          
          // 检查拖拽提示节点
          const hintNodes = graph.getNodes().filter(node => {
            const data = node.getData()
            return data && data.type === 'drag-hint'
          })
          
          console.log('🎯 拖拽提示节点检查:', {
            expectedHints: branchNodeData.branches.length,
            actualHints: hintNodes.length,
            hintNodes: hintNodes.map(node => ({
              id: node.id,
              branchIndex: node.getData()?.branchIndex,
              text: node.attr('text/text'),
              color: node.attr('body/fill')
            }))
          })
          
        } else {
          console.error('❌ 分支预览线创建失败！预期', branchNodeData.branches.length, '条，实际', previewLines.length, '条')
        }
      }, 500)
    }, 100)
    
    // 创建普通节点进行对比
    setTimeout(() => {
      const normalNodeData = {
        id: 'test-normal-node',
        type: 'message',
        nodeType: 'message',
        label: '普通消息',
        position: { x: 500, y: 200 }
      }
      
      const normalNode = graph.addNode({
        id: normalNodeData.id,
        shape: 'rect',
        x: normalNodeData.position.x,
        y: normalNodeData.position.y,
        width: 120,
        height: 60,
        attrs: {
          body: {
            fill: '#f6ffed',
            stroke: '#52c41a',
            strokeWidth: 2,
            rx: 8,
            ry: 8
          },
          text: {
            text: normalNodeData.label,
            fill: '#52c41a',
            fontSize: 14,
            fontWeight: 'bold'
          }
        },
        ports: {
          groups: {
            in: {
              position: 'top',
              attrs: {
                circle: {
                  r: 4,
                  magnet: true,
                  stroke: '#52c41a',
                  strokeWidth: 2,
                  fill: '#ffffff'
                }
              }
            },
            out: {
              position: 'bottom',
              attrs: {
                circle: {
                  r: 4,
                  magnet: true,
                  stroke: '#52c41a',
                  strokeWidth: 2,
                  fill: '#ffffff'
                }
              }
            }
          },
          items: [
            { group: 'in', id: 'in' },
            { group: 'out', id: 'out' }
          ]
        },
        data: normalNodeData
      })
      
      console.log('✅ 普通节点创建成功:', normalNode.id)
      
      // 触发普通节点的预览线创建
      setTimeout(() => {
        graph.trigger('node:config-updated', { node: normalNode })
        
        setTimeout(() => {
          const normalPreviewLines = graph.getEdges().filter(edge => {
            const data = edge.getData()
            return data && data.type === 'draggable-preview' && data.sourceNodeId === normalNode.id
          })
          
          console.log('📊 普通节点预览线创建结果:', {
            expectedLines: 1,
            actualLines: normalPreviewLines.length,
            previewLine: normalPreviewLines[0] ? {
              id: normalPreviewLines[0].id,
              color: normalPreviewLines[0].attr('line/stroke')
            } : null
          })
          
          if (normalPreviewLines.length === 1) {
            console.log('✅ 普通节点预览线创建成功！')
          } else {
            console.error('❌ 普通节点预览线创建失败！')
          }
        }, 300)
      }, 100)
    }, 1000)
    
  } catch (error) {
    console.error('❌ 测试分支预览线功能失败:', error)
  }
}

// 运行完整测试流程
window.runFullTest = function() {
  console.log('🚀 开始完整测试流程...')
  
  // 1. 清理现有预设线
  window.cleanupPreviewLines()
  
  // 2. 测试预设线创建
  setTimeout(() => {
    const created = window.testEnhancedPreviewLine()
    if (!created) {
      console.error('❌ 预设线创建测试失败，停止后续测试')
      return
    }
    
    // 3. 测试事件绑定
    setTimeout(() => {
      window.testEventBinding()
      
      // 4. 测试DOM事件
      setTimeout(() => {
        window.testDOMEvents()
        
        // 5. 测试拖拽功能
        setTimeout(() => {
          window.testPreviewLineDrag()
          
          // 6. 测试分支预览线功能
          setTimeout(() => {
            window.testBranchPreviewLines()
            
            console.log('🎉 完整测试流程完成')
          }, 1000)
        }, 1000)
      }, 1000)
    }, 1000)
  }, 500)
}

// 显示帮助信息
window.showTestHelp = function() {
  console.log(`
🧪 增强预设线测试脚本帮助

📋 新的拖拽机制说明:
  - 预设线的上方端点固定在节点的out端口
  - 只有下方端点（圆形拖拽提示）可以拖拽移动
  - 预设线本身不可直接拖拽，需要通过下方的圆点进行拖拽

🔧 可用函数:
  - testEnhancedPreviewLine(): 测试预设线创建
  - analyzeConnectionEndpoints(): 分析连接线的两端点定义
  - verifyPreviewLineEndpoints(): 验证预设线端点配置和方向
  - testPreviewLineDrag(): 测试下方端点拖拽功能
  - testEventBinding(): 测试事件绑定（包括拖拽提示节点）
  - testDOMEvents(): 测试DOM元素事件
  - cleanupPreviewLines(): 清理所有预设线和测试节点
  - runFullTest(): 运行完整测试流程
  - showTestHelp(): 显示此帮助信息

🎯 使用方法:
  1. 运行 runFullTest() 进行完整测试
  2. 运行 analyzeConnectionEndpoints() 分析连接线端点定义
  3. 运行 verifyPreviewLineEndpoints() 验证端点配置
  4. 或单独运行各个测试函数
  5. 使用 cleanupPreviewLines() 清理测试数据
  6. 在浏览器中手动测试：拖拽预设线下方的蓝色圆点

💡 预期行为:
  - 预设线上方端点固定在节点out端口（起点，y值较小）
  - 下方圆点可以拖拽移动（终点，y值较大）
  - 拖拽时预设线会跟随移动
  - 释放时可以连接到其他节点或创建结束节点

🔍 调试提示:
  - 如果拖拽不工作，检查控制台日志
  - 使用 analyzeConnectionEndpoints() 了解详细的端点信息
  - 使用 verifyPreviewLineEndpoints() 确认端点方向
  - 确保拖拽的是蓝色圆点而不是预设线本身
  `)
}

console.log('✅ 增强预设线测试脚本已加载')
console.log('💡 运行 showTestHelp() 查看帮助信息')
console.log('🚀 运行 runFullTest() 开始测试')
