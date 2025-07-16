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
    strict: false,
    modifiers: ['shift', 'ctrl']
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

// 连接配置
export const getConnectingConfig = () => ({
  router: {
    name: 'manhattan',
    args: {
      step: 20,
      maximumLoops: 500,
      padding: 10,
      excludeEnds: ['source', 'target'],
      excludeShapes: ['rect'],
      startDirections: ['bottom'],  // 从底部开始
      endDirections: ['top']        // 到顶部结束
    }
  },
  connector: {
    name: 'rounded',
    args: {
      radius: 6
    }
  },
  anchor: {
    name: 'nodeCenter',
    args: {
      dx: 0,
      dy: 0
    }
  },
  connectionPoint: {
    name: 'boundary',
    args: {
      sticky: true,
      offset: 0
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
      zIndex: 0
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

// 端口组配置
export const getPortGroups = () => ({
  in: {
    position: {
      name: 'top',
      args: {
        dx: 0,  // 水平偏移为0，确保在中心
        dy: 0   // 垂直偏移为0，确保在边缘
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
        dx: 0,  // 水平偏移为0，确保在中心
        dy: 0   // 垂直偏移为0，确保在边缘
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
})

// 节点样式配置
export const getNodeStyles = (nodeType, nodeConfig) => ({
  attrs: {
    body: {
      fill: nodeConfig.color,
      stroke: nodeConfig.color,
      strokeWidth: 2,
      rx: nodeConfig.shape === 'circle' ? 50 : 8,
      ry: nodeConfig.shape === 'circle' ? 50 : 8
    },
    label: {
      text: nodeConfig.label,
      fill: '#fff',
      fontSize: 12,
      fontWeight: 'bold',
      textAnchor: 'middle',
      textVerticalAnchor: 'middle'
    }
  }
})

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