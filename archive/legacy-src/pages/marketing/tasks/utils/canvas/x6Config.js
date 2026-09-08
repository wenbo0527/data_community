/**
 * X6 画布配置管理
 * 统一管理所有 X6 相关配置
 */

// 基础画布配置
export const getBaseGraphConfig = (container) => ({
  container,
  autoResize: true,
  background: {
    color: '#f8f9fa'
  },
  grid: {
    visible: true,
    type: 'doubleMesh',
    args: [
      {
        color: '#eee',
        thickness: 1,
        size: 20
      },
      {
        color: '#ddd',
        thickness: 1,
        factor: 4,
        size: 80
      }
    ]
  },
  selecting: {
    enabled: true,
    rubberband: true,
    movable: true,
    showNodeSelectionBox: true,
    multiple: true,
    strict: true, // 启用严格模式，只有在修饰键按下时才启用选择框
    modifiers: ['shift'], // 只需要shift键即可启用选择框，简化操作
    // 🔧 修复层级遮挡：选中时自动提升z-index
    selectCellOnMoved: true,
    selectCellOnMouseDown: true
  },
  scroller: {
    enabled: true,
    pannable: true,
    cursor: 'grab',
    passive: true,
    modifiers: ['ctrl', 'meta']
  },
  mousewheel: {
    enabled: true,
    modifiers: ['ctrl', 'meta'],
    factor: 1.1,
    maxScale: 2,
    minScale: 0.2
  },
  panning: {
    enabled: true,
    modifiers: ['space']
  },
  snapline: {
    enabled: true,
    sharp: true
  },
  keyboard: {
    enabled: true,
    global: false
  },
  clipboard: {
    enabled: true,
    useLocalStorage: true
  },
  history: {
    enabled: true,
    beforeAddCommand: (event, args) => {
      // 过滤不需要记录的操作
      if (args.key === 'tools') return false
      return true
    }
  },
  minimap: {
    enabled: false, // 可选开启小地图
    container: null,
    width: 200,
    height: 160,
    padding: 10,
    scalable: false,
    minScale: 0.01,
    maxScale: 16
  }
})

// 连接配置 - 智能最短路径优化
// 获取方向配置（上下布局）
const getDirectionConfig = () => {
  return {
    startDirections: ['bottom'],
    endDirections: ['top']
  }
}

export const getConnectingConfig = () => ({
  router: {
    name: 'orth',  // 使用orth路由器自动计算最短路径
    args: {
      padding: 15,    // 适中的padding，平衡避障和路径长度
      step: 10,       // 精确的step，确保路径计算准确
      ...getDirectionConfig(),
      // 使用orth路由器的自动最短路径算法
      // orth路由器内置了最短路径计算，无需手动干预
    }
  },
  connector: {
    name: 'rounded',
    args: {
      radius: 6
    }
  },
  // 🔧 高优先级修复：使用更可靠的边界连接点
  connectionPoint: {
    name: 'boundary',
    args: {
      anchor: 'center'
    }
  },
  allowBlank: false,
  allowLoop: false,
  allowNode: false,
  allowEdge: false,
  allowMulti: false,
  snap: {
    radius: 15
  },
  createEdge() {
    return this.createEdge({
      shape: 'edge',
      attrs: {
        line: {
          stroke: '#5F95FF',
          strokeWidth: 2,
          targetMarker: {
            name: 'block',
            width: 12,
            height: 8
          }
        }
      },
      zIndex: 0,
      // 🔧 为新创建的边设置默认的连接点配置
      defaultConnectionPoint: {
        name: 'boundary',
        args: {
          anchor: 'center'
        }
      }
    })
  },
  validateConnection({ targetMagnet, sourceMagnet, sourceView, targetView }) {
    // 不允许连接到自己
    if (sourceView === targetView) return false
    
    // 不允许连接到输出端口
    if (!targetMagnet || targetMagnet.getAttribute('port-group') !== 'in') {
      return false
    }
    
    // 不允许连接到输入端口
    if (!sourceMagnet || sourceMagnet.getAttribute('port-group') !== 'out') {
      return false
    }
    
    // 检查是否已存在连接
    const targetPortId = targetMagnet.getAttribute('port')
    const edges = this.getIncomingEdges(targetView.cell)
    if (edges && edges.find(edge => edge.getTargetPortId() === targetPortId)) {
      return false
    }
    
    return true
  }
})

// 高亮配置
export const getHighlightingConfig = () => ({
  magnetAdsorbed: {
    name: 'stroke',
    args: {
      attrs: {
        fill: '#5F95FF',
        stroke: '#5F95FF',
        strokeWidth: 3
      }
    }
  },
  magnetAvailable: {
    name: 'stroke',
    args: {
      attrs: {
        fill: '#7c68fc',
        stroke: '#9254de',
        strokeWidth: 2
      }
    }
  },
  nodeAvailable: {
    name: 'className',
    args: {
      className: 'available'
    }
  },
  nodeUnAvailable: {
    name: 'className',
    args: {
      className: 'unavailable'
    }
  }
})

// 端口组配置（上下布局）
export const getPortGroups = () => {
  return {
    in: {
      position: {
        name: 'top',
        args: {
          x: '50%',  // 水平居中
          y: 0,      // 顶部
          dx: 0,
          dy: -15    // 🔧 修复：增加向上偏移到-15，确保端口在圆形节点（半径50）顶部外侧完全可见
        }
      },
      attrs: {
        circle: {
          r: 5,
          magnet: true,
          stroke: '#5F95FF',
          strokeWidth: 2,
          fill: '#fff',
          style: {
            visibility: 'visible'
          }
        }
      },
      markup: [{
        tagName: 'circle',
        selector: 'circle'
      }]
    },
    out: {
      position: {
        name: 'bottom',
        args: {
          x: '50%',    // 水平居中
          y: '100%',   // 底部
          dx: 0,
          dy: 15       // 🔧 修复：增加偏移量到15，确保端口在圆形节点（半径50）底部外侧完全可见
        }
      },
      attrs: {
        circle: {
          r: 5,
          magnet: true,
          stroke: '#5F95FF',
          strokeWidth: 2,
          fill: '#fff',
          style: {
            visibility: 'visible'
          }
        }
      },
      markup: [{
        tagName: 'circle',
        selector: 'circle'
      }]
    }
  }
}

// 节点样式配置
export const getNodeStyles = (nodeType, nodeConfig) => {
  // 🔧 修复：确保nodeConfig存在，避免undefined错误
  if (!nodeConfig) {
    console.warn(`[x6Config] nodeConfig为空，使用默认配置: ${nodeType}`)
    nodeConfig = {
      color: '#5F95FF',
      shape: 'circle',
      width: 100,
      height: 100,
      label: nodeType
    }
  }

  // 🔧 修复：确保圆形节点的rx和ry设置正确
  const isCircle = nodeConfig.shape === 'circle'
  const rx = isCircle ? Math.min(nodeConfig.width, nodeConfig.height) / 2 : 8
  const ry = isCircle ? Math.min(nodeConfig.width, nodeConfig.height) / 2 : 8

  console.log(`[x6Config] 节点样式配置: ${nodeType}`, {
    shape: nodeConfig.shape,
    color: nodeConfig.color,
    width: nodeConfig.width,
    height: nodeConfig.height,
    rx: rx,
    ry: ry,
    isCircle: isCircle
  })

  return {
    attrs: {
      body: {
        fill: nodeConfig.color,
        stroke: nodeConfig.color,
        strokeWidth: 2,
        // 🔧 修复：根据shape属性和实际尺寸设置正确的圆角
        rx: rx,
        ry: ry
      },
      label: {
        text: nodeConfig.label,
        fill: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
        textAnchor: 'middle',
        textVerticalAnchor: 'middle'
      }
    },
    // 🔧 修复层级遮挡：设置节点默认z-index
    zIndex: 10
  }
}

// 边样式配置
export const getEdgeStyles = () => ({
  attrs: {
    line: {
      stroke: '#5F95FF',
      strokeWidth: 2,
      targetMarker: {
        name: 'block',
        width: 12,
        height: 8
      }
    }
  },
  zIndex: 0
})

// 可拖拽预设线边形状配置
export const getDraggablePreviewEdgeConfig = () => ({
  inherit: 'edge',
  attrs: {
    line: {
      stroke: '#1890ff',
      strokeWidth: 2,
      strokeDasharray: '5,5',
      cursor: 'grab',
      opacity: 0.8,
      targetMarker: {
        name: 'block',
        width: 8,
        height: 6,
        fill: '#1890ff'
      }
    }
  },
  zIndex: 1000
})

// 全局标记，防止重复注册
let customShapesRegistered = false

// 注册自定义边形状
export const registerCustomShapes = (Graph) => {
  // 如果已经注册过，直接返回
  if (customShapesRegistered) {
    console.log('⏭️ 自定义边形状已注册，跳过重复注册')
    return
  }
  
  try {
    // 检查 Graph.registry 是否存在并且有 edge 属性
    if (Graph.registry && Graph.registry.edge) {
      // 尝试获取已注册的形状
      const existingEdges = Graph.registry.edge.data
      if (existingEdges && existingEdges['draggable-preview-edge']) {
        console.log('⏭️ 自定义边形状 "draggable-preview-edge" 已存在于注册表中，跳过注册')
        customShapesRegistered = true
        return
      }
    }
  } catch (error) {
    // 忽略检查错误，继续注册
    console.log('🔍 检查现有注册时出现错误，继续注册:', error.message)
  }
  
  try {
    // 注册可拖拽预设线边形状
    Graph.registerEdge('draggable-preview-edge', getDraggablePreviewEdgeConfig())
    customShapesRegistered = true
    console.log('✅ 自定义边形状注册完成')
  } catch (error) {
    if (error.message.includes('already registered')) {
      console.log('⏭️ 自定义边形状已存在，跳过重复注册')
      customShapesRegistered = true
    } else {
      console.error('❌ 自定义边形状注册失败:', error)
      throw error
    }
  }
}

// 重置注册状态（用于测试或特殊情况）
export const resetCustomShapesRegistration = () => {
  customShapesRegistered = false
  console.log('🔄 自定义边形状注册状态已重置')
}

// 动画配置
export const getAnimationConfig = () => ({
  // 节点添加动画
  nodeAdd: {
    duration: 300,
    easing: 'ease-out',
    attrs: {
      body: {
        transform: 'scale(0)',
        opacity: 0
      }
    }
  },
  
  // 节点删除动画
  nodeRemove: {
    duration: 200,
    easing: 'ease-in',
    attrs: {
      body: {
        transform: 'scale(0)',
        opacity: 0
      }
    }
  },
  
  // 连接创建动画
  edgeAdd: {
    duration: 400,
    easing: 'ease-out',
    attrs: {
      line: {
        strokeDasharray: '5,5',
        strokeDashoffset: 10
      }
    }
  }
})

// 性能优化配置
export const getPerformanceConfig = () => ({
  // 虚拟渲染配置
  virtual: {
    enabled: true,
    threshold: 50 // 超过50个节点启用虚拟渲染
  },
  
  // 批量更新配置
  batching: {
    enabled: true,
    batchSize: 100
  },
  
  // 渲染优化
  rendering: {
    async: true,
    frozen: false
  }
})