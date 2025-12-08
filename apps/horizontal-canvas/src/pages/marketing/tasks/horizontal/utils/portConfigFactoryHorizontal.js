/*
用途：横版端口配置工厂（左进右出）
说明：生成输入/输出端口分组与项配置，右侧输出端口按内容行中点或均匀分布定位；支持端口位置验证。
边界：不直接改动 Graph；data-* 属性与验证对齐原版行为；入/出端口数量与分布可参数化。
*/
import {
  COLORS,
  NODE_DIMENSIONS,
  TYPOGRAPHY
} from '../styles/nodeStyles.js'
import {
  usePortValidation
} from '../composables/usePortValidation.js'

export function createHorizontalPortConfig(outCount = 1, options = {}) {
  const {
    includeIn = true,
      includeOut = true,
      outIds = null,
      verticalOffsets = null,
      nodeHeight = null,
      inVerticalOffset = null,
      contentStart = null,
      contentEnd = null,
      contentLines = null,
      tolerance = 2,
      evenDistribution = false,
      enableValidation = false
  } = options

  console.log('createHorizontalPortConfigOptions1111', options)

  const groups = {
    in: {
      position: 'left',
      layout: {
        name: 'fixed-left-y'
      },
      connectOptions: {
        inbound: true,
        outbound: false,
        maxConnections: 1
      },
      markup: [{
        tagName: 'circle',
        selector: 'circle'
      }],
      attrs: {
        circle: {
          r: NODE_DIMENSIONS.PORT_RADIUS,
          magnet: true,
          stroke: COLORS.PORT_STROKE,
          strokeWidth: COLORS.PORT_STROKE_WIDTH,
          fill: COLORS.PORT_FILL_IN,
          'data-port-type': 'in',
          class: 'x6-port-body'
        }
      }
    },
    out: {
      position: {
        name: 'absolute'
      },
      layout: null,
      connectOptions: {
        inbound: false,
        outbound: true,
        maxConnections: 1
      },
      markup: [{
        tagName: 'circle',
        selector: 'circle'
      }],
      attrs: {
        circle: {
          r: NODE_DIMENSIONS.PORT_RADIUS,
          magnet: true,
          stroke: COLORS.PORT_STROKE,
          strokeWidth: COLORS.PORT_STROKE_WIDTH,
          fill: COLORS.PORT_FILL_OUT,
          'data-port-type': 'out',
          class: 'x6-port-body'
        }
      }
    }
  }
  console.log('dy1111',(nodeHeight+2)/2)
  const items = []
  if (includeIn) {
    items.push({
      id: 'in',
      group: 'in',
      args: {
        dy: 5
      },
      attrs: {
        circle: {
          'port': 'in',
          'port-group': 'in',
          'data-port': 'in',
          'data-port-group': 'in'
        }
      }
    })
  }

  const ids = includeOut && outIds && Array.isArray(outIds) ?
    outIds :
    includeOut ?
    Array.from({
      length: Math.max(1, outCount)
    }, (_, i) => `out-${i}`) :
    []

  const start = typeof contentStart === 'number' ? contentStart : (NODE_DIMENSIONS.HEADER_HEIGHT + (NODE_DIMENSIONS.CONTENT_PADDING / 2))
  const end = typeof contentEnd === 'number' ? contentEnd : (start + ((Math.max(1, outCount) - 1) * NODE_DIMENSIONS.ROW_GAP) + Math.max(1, outCount) * NODE_DIMENSIONS.ROW_HEIGHT)
  const contentH = end - start

  console.log('contentH11111',NODE_DIMENSIONS.HEADER_HEIGHT, start, end, contentH)

  // DocRef: 架构文档「关键代码片段/端口工厂：绝对定位右侧输出端口」
  ids.forEach((id, idx) => {
    const n = Math.max(1, ids.length)
    const contentH = end - start
    let yRel
    if (evenDistribution && contentH > 0) {
      const step = contentH / n
      yRel = start + (idx + 0.5) * step
    } else {
      yRel = start + idx * NODE_DIMENSIONS.ROW_HEIGHT + Math.floor(NODE_DIMENSIONS.ROW_HEIGHT / 2)
    }
    const args = {
      x: NODE_DIMENSIONS.WIDTH+2,
      y: yRel
    }
    items.push({
      id,
      group: 'out',
      args,
      attrs: {
        circle: {
          'data-port': id,
          'data-port-group': 'out',
          'port': id,
          'port-group': 'out',
          class: 'x6-port-body'
        }
      },
      markup: [{
        tagName: 'circle',
        selector: 'circle'
      }]
    })
  })

  const portConfig = {
    groups,
    items
  }
  console.log('portConfig1111', groups, items)

  // 修复：启用端口位置验证（与原版一致），附加验证结果
  if (enableValidation && contentLines && Array.isArray(contentLines)) {
    const {
      validatePortPositions
    } = usePortValidation()
    const validationResult = validatePortPositions(portConfig, contentLines, tolerance)
    portConfig._validation = validationResult
  }

  return portConfig
}

export default {
  createHorizontalPortConfig
}