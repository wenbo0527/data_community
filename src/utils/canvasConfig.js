/**
 * 画布配置工具类
 * 统一管理 X6 画布的各种配置
 */

import { createPortConfig } from './portConfigFactory.js'

/**
 * 获取画布基础配置
 */
export const getBaseConfig = () => ({
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
        size: 20 // 小网格大小
      },
      {
        color: '#ddd',
        thickness: 1,
        factor: 4, // 大网格为小网格的4倍
        size: 80 // 大网格大小
      }
    ]
  },
  selecting: {
    enabled: true,
    rubberband: true,
    movable: true,
    showNodeSelectionBox: true,
  },
  scroller: {
    enabled: true,
    pannable: true,
    cursor: 'grab',
    passive: false,
    modifiers: [], // 移除修饰键要求，支持直接拖拽
    pageVisible: false,
    pageBreak: false,
    autoResize: true,
    padding: 100, // 增加边距以支持更好的延展
    // 添加画布延展配置
    width: 2000, // 设置画布宽度
    height: 2000, // 设置画布高度
    minVisibleWidth: 50,
    minVisibleHeight: 50,
    // 启用画布自动延展
    autoExpand: true,
    expandThreshold: 100 // 当节点接近边界时自动延展
  },
  mousewheel: {
    enabled: true,
    modifiers: [], // 移除修饰键要求，支持直接滚轮缩放
    factor: 1.1,
    maxScale: 3.0, // 增加最大缩放比例
    minScale: 0.2, // 减小最小缩放比例
    passive: false,
    global: false, // 只在画布区域内生效
    // 添加缩放中心配置
    center: true // 以鼠标位置为中心缩放
  },
  highlighting: {
    magnetAdsorbed: {
      name: 'stroke',
      args: {
        attrs: {
          fill: '#5F95FF',
          stroke: '#5F95FF'
        }
      }
    }
  },
  resizing: true,
  rotating: true,
  snapline: true,
  keyboard: true,
  clipboard: true,
  history: true
})

/**
 * 获取连接配置
 */
export const getConnectingConfig = () => ({
  autoAnchor: {
    enable: true,
    type: 'grid',
    grid: {
      size: 20,
      attrs: {
        fill: '#E6F4FF',
        stroke: '#91C9FF'
      }
    }
  },
  allowMulti: false,
  autoConnect: {
    enabled: true,
    connector: 'smooth',
    snap: { radius: 20 },
    highlight: true,
    dangling: false
  },
  router: {
    name: 'orth',
    args: {
      padding: 15,
      step: 15,
      startDirections: ['bottom'],
      endDirections: ['top']
      // 🚀 [智能路径] 移除fallbackRoute，完全依赖orth路由器的自动最短路径算法
    }
  },
  connector: {
    name: 'rounded',
    args: {
      radius: 6,
    },
  },
  // 使用更可靠的boundary连接点
  connectionPoint: {
    name: 'boundary',
    args: {
      anchor: 'center'
    }
  },
  allowBlank: false,
  snap: {
    radius: 20,
  }
})

/**
 * 获取边的配置
 */
export const getEdgeConfig = () => ({
  attrs: {
    line: {
      stroke: '#A2B1C3',
      strokeWidth: 2,
      targetMarker: {
        name: 'block',
        width: 12,
        height: 8,
      },
    },
  },
  zIndex: 0,
})

/**
 * 获取端口组配置
 */
export const getPortGroups = () => {
  // 使用端口配置工厂创建标准端口配置
  const inPortConfig = createPortConfig({
    id: 'in',
    group: 'in',
    position: {
      name: 'top',
      args: {
        x: '50%',
        y: 0,
        dx: 0,
        dy: 0
      }
    }
  })

  const outPortConfig = createPortConfig({
    id: 'out',
    group: 'out',
    position: {
      name: 'bottom',
      args: {
        x: '50%',
        y: '100%',
        dx: 0,
        dy: 0
      }
    }
  })

  // 提取端口组配置（移除id字段）
  const { id: inId, ...inGroup } = inPortConfig
  const { id: outId, ...outGroup } = outPortConfig

  return {
    in: inGroup,
    out: outGroup,
    right: {
      position: { name: 'right' },
      attrs: {
        circle: {
          r: 12,
          fill: '#66cc67',
          stroke: '#fff',
          strokeWidth: 2,
          visibility: 'visible',
          magnet: true
        }
      }
    }
  }
}

/**
 * 画布配置对象
 */
export const canvasConfig = {
  getBaseConfig,
  getConnectingConfig,
  getEdgeConfig,
  getPortGroups
}

export default canvasConfig