export type VariableRelationType = 'dependency' | 'derivation' | 'reference' | 'association'

export interface VariableRelationEdgeMock {
  source: string
  target: string
  type: VariableRelationType
  strength?: number
}

const typeByIndex = (i: number): VariableRelationType => {
  const order: VariableRelationType[] = ['derivation', 'dependency', 'reference', 'association']
  return order[i % order.length]
}

export const buildVariableEdges = (variables: any[]): VariableRelationEdgeMock[] => {
  const list = Array.isArray(variables) ? variables : []
  const ids = list.map((v) => String(v.id)).filter(Boolean)
  if (ids.length <= 1) return []

  const edges: VariableRelationEdgeMock[] = []

  for (let i = 0; i < ids.length - 1; i++) {
    const source = ids[i]
    const target = ids[i + 1]
    edges.push({
      source,
      target,
      type: typeByIndex(i),
      strength: 0.6
    })
  }

  for (let i = 0; i < ids.length - 2; i++) {
    if (i % 2 !== 0) continue
    edges.push({
      source: ids[i],
      target: ids[i + 2],
      type: 'association',
      strength: 0.35
    })
  }

  const unique = new Map<string, VariableRelationEdgeMock>()
  edges.forEach((e) => {
    const key = `${e.source}__${e.target}__${e.type}`
    if (!unique.has(key)) unique.set(key, e)
  })
  return Array.from(unique.values())
}
