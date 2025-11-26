// 横版端口配置工厂：左进右出，出端口数量可配置（与原版一致）
import { COLORS, NODE_DIMENSIONS, TYPOGRAPHY } from '../styles/nodeStyles.js'

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
    evenDistribution = false
  } = options

  const groups = {
    in: {
      position: { name: 'fixed-left-y' },
      markup: [ { tagName: 'circle', selector: 'circle' } ],
      attrs: { circle: { r: NODE_DIMENSIONS.PORT_RADIUS, magnet: true, stroke: COLORS.PORT_STROKE, strokeWidth: COLORS.PORT_STROKE_WIDTH, fill: COLORS.PORT_FILL_IN } }
    },
    out: {
      position: { name: 'absolute' },
      markup: [ { tagName: 'circle', selector: 'circle' } ],
      attrs: { circle: { r: NODE_DIMENSIONS.PORT_RADIUS, magnet: true, stroke: COLORS.PORT_STROKE, strokeWidth: COLORS.PORT_STROKE_WIDTH, fill: COLORS.PORT_FILL_OUT } }
    }
  }

  const items = []
  if (includeIn) {
    const dy = (typeof inVerticalOffset === 'number' && typeof nodeHeight === 'number')
      ? (inVerticalOffset - (nodeHeight / 2))
      : 0
    items.push({ id: 'in', group: 'in', args: { dy }, attrs: { circle: { 'port': 'in', 'port-group': 'in' } } })
  }

  const ids = includeOut && outIds && Array.isArray(outIds)
    ? outIds
    : includeOut
      ? Array.from({ length: Math.max(1, outCount) }, (_, i) => `out-${i}`)
      : []

  const start = typeof contentStart === 'number' ? contentStart : (NODE_DIMENSIONS.HEADER_HEIGHT + NODE_DIMENSIONS.CONTENT_PADDING)
  const end = typeof contentEnd === 'number' ? contentEnd : (start + Math.max(1, outCount) * NODE_DIMENSIONS.ROW_HEIGHT)
  const contentH = end - start

  ids.forEach((id, idx) => {
    let yRel
    if (evenDistribution && contentH > 0) {
      const n = Math.max(1, ids.length)
      const step = contentH / n
      yRel = start + (idx + 0.5) * step + (TYPOGRAPHY.CONTENT_BASELINE_ADJUST || 0)
    } else {
      const base = start + idx * NODE_DIMENSIONS.ROW_HEIGHT + Math.floor(NODE_DIMENSIONS.ROW_HEIGHT / 2) + (TYPOGRAPHY.CONTENT_BASELINE_ADJUST || 0)
      yRel = base
    }
    // 钳制到内容区范围
    const yClamped = Math.max(start, Math.min(end, yRel))
    const args = { x: NODE_DIMENSIONS.WIDTH, y: yClamped }
    items.push({ id, group: 'out', args, attrs: { circle: { 'port': id, 'port-group': 'out' } } })
  })

  return { groups, items }
}

export default { createHorizontalPortConfig }
