// 横版端口配置工厂：左进右出，出端口数量可配置
export function createHorizontalPortConfig(outCount = 1, options = {}) {
  const { includeIn = true, outIds = null } = options

  const groups = {
    in: {
      position: 'left',
      attrs: {
        circle: { r: 4, magnet: true, stroke: '#4C78FF', strokeWidth: 1.5, fill: '#FFFFFF' }
      }
    },
    out: {
      position: 'right',
      attrs: {
        circle: { r: 4, magnet: true, stroke: '#4C78FF', strokeWidth: 1.5, fill: '#4C78FF' }
      }
    }
  }

  const items = []
  if (includeIn) items.push({ id: 'in', group: 'in' })

  const ids = outIds && Array.isArray(outIds)
    ? outIds
    : Array.from({ length: Math.max(1, outCount) }, (_, i) => `out-${i}`)

  ids.forEach(id => items.push({ id, group: 'out' }))

  return { groups, items }
}

export default { createHorizontalPortConfig }