/**
 * 画布配置工具类
 * 统一管理 X6 画布的各种配置
 */

import { Shape } from '@antv/x6'
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
        thickness: 1
      },
      {
        color: '#ddd',
        thickness: 1,
        factor: 4
      }
    ]
  },
  scroller: {
    enabled: true,
    pageVisible: false,
    pageBreak: false,
    pannable: true
  },
  mousewheel: {
    enabled: true,
    zoomAtMousePosition: true,
    modifiers: 'ctrl',
    minScale: 0.5,
    maxScale: 3
  },
  connecting: {
    router: 'manhattan',
    connector: {
      name: 'rounded',
      args: {
        radius: 8
      }
    },
    anchor: 'center',
    connectionPoint: 'anchor',
    allowBlank: false,
    snap: {
      radius: 20
    },
    createEdge() {
      return new Shape.Edge({
        attrs: {
          line: {
            stroke: '#A2B1C3',
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
    validateConnection({ targetMagnet }) {
      // 🔧 禁用所有端口拖拽连接，连接线应仅通过预览线转换生成
      return false
    }
  }
})

/**
 * 获取动态方向配置
 */
const getDynamicDirectionConfig = () => {
  return {
    startDirections: ['bottom'],
    endDirections: ['top']
  }
}

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
      ...getDynamicDirectionConfig()
      // 使用orth路由器的自动最短路径算法
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
 * 🔧 修复：统一使用x6Config.js中的端口配置，避免配置重复
 */
export const getPortGroups = () => {
  // 直接导入x6Config中的端口组配置，确保一致性
  const { getPortGroups } = require('./x6Config.js')
  return getPortGroups()
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