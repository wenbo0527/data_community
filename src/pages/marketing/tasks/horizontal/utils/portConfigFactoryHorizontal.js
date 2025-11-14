// 横版端口配置工厂：左进右出，出端口数量可配置
import { COLORS, NODE_DIMENSIONS, INTERACTION_STATES } from '../styles/nodeStyles.js'

export function createHorizontalPortConfig(outCount = 1, options = {}) {
  const { includeIn = true, outIds = null, verticalOffsets = null, nodeHeight = null, inVerticalOffset = null } = options

  const groups = {
    in: {
      position: 'left',
      // 端口组级别的连接配置
      connectOptions: {
        // 限制in端口组只能接收连接
        inbound: true,
        outbound: false,
        // 每个in端口只能有一条连接
        maxConnections: 1
      },
      attrs: {
        circle: { 
          r: NODE_DIMENSIONS.PORT_RADIUS, 
          magnet: true, 
          stroke: COLORS.PORT_STROKE, 
          strokeWidth: COLORS.PORT_STROKE_WIDTH, 
          fill: COLORS.PORT_FILL_IN,
          // 限制in端口只能连接一条线
          maxConnections: 1,
          // 端口类型标识
          portType: 'in',
          // 连接方向限制：只能作为目标端口
          allowSource: false,
          allowTarget: true,
          // 交互状态样式
          style: {
            cursor: 'crosshair',
            transition: 'all 0.2s ease'
          },
          // 悬停状态
          hover: {
            stroke: COLORS.PORT_STROKE,
            strokeWidth: 2,
            fill: COLORS.PORT_FILL_IN
          },
          // 连接中状态
          connecting: {
            stroke: '#2563EB',
            strokeWidth: 2,
            fill: COLORS.PORT_FILL_IN
          },
          // 已连接状态
          connected: {
            stroke: COLORS.PORT_STROKE,
            strokeWidth: COLORS.PORT_STROKE_WIDTH,
            fill: COLORS.PORT_FILL_IN
          }
        }
      }
    },
    out: {
      position: 'right',
      // 端口组级别的连接配置
      connectOptions: {
        // 限制out端口组只能发出连接
        inbound: false,
        outbound: true,
        // 每个out端口只能有一条连接
        maxConnections: 1
      },
      attrs: {
        circle: { 
          r: NODE_DIMENSIONS.PORT_RADIUS, 
          magnet: true, 
          stroke: COLORS.PORT_STROKE, 
          strokeWidth: COLORS.PORT_STROKE_WIDTH, 
          fill: COLORS.PORT_FILL_OUT,
          // 限制out端口只能连接一条线
          maxConnections: 1,
          // 端口类型标识
          portType: 'out',
          // 连接方向限制：只能作为源端口
          allowSource: true,
          allowTarget: false,
          // 交互状态样式
          style: {
            cursor: 'crosshair',
            transition: 'all 0.2s ease'
          },
          // 悬停状态
          hover: {
            stroke: COLORS.PORT_STROKE,
            strokeWidth: 2,
            fill: COLORS.PORT_FILL_OUT
          },
          // 连接中状态
          connecting: {
            stroke: '#2563EB',
            strokeWidth: 2,
            fill: '#2563EB'
          },
          // 已连接状态
          connected: {
            stroke: COLORS.PORT_STROKE,
            strokeWidth: COLORS.PORT_STROKE_WIDTH,
            fill: COLORS.PORT_FILL_OUT
          }
        }
      }
    }
  }

  const items = []
  if (includeIn) {
    if (typeof inVerticalOffset === 'number' && typeof nodeHeight === 'number') {
      const dyIn = inVerticalOffset - (nodeHeight / 2)
      items.push({ id: 'in', group: 'in', args: { dy: dyIn } })
    } else {
      items.push({ id: 'in', group: 'in' })
    }
  }

  const ids = outIds && Array.isArray(outIds)
    ? outIds
    : Array.from({ length: Math.max(1, outCount) }, (_, i) => `out-${i}`)

  ids.forEach((id, idx) => {
    let args
    if (verticalOffsets && Array.isArray(verticalOffsets) && verticalOffsets[idx] != null && typeof nodeHeight === 'number') {
      const dy = verticalOffsets[idx] - (nodeHeight / 2)
      args = { dy }
    }
    items.push(args ? { id, group: 'out', args } : { id, group: 'out' })
  })

  return { groups, items }
}

export default { createHorizontalPortConfig }