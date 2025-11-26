import { describe, it, expect, vi } from 'vitest'
import { collectCanvasData, loadCanvasData, validateForPublish } from '../src/pages/marketing/tasks/horizontal/persistence/PersistenceService'

function makeMockGraph() {
  const nodes: any[] = []
  const edges: any[] = []
  return {
    getNodes: () => nodes,
    getEdges: () => edges,
    addNode: (n: any) => { nodes.push(n); return n },
    addEdge: (e: any) => { edges.push(e); return e },
    clearCells: () => { nodes.length = 0; edges.length = 0 },
    centerContent: vi.fn(),
    getOutgoingEdges: (node: any) => edges.filter(ed => (ed.source?.cell) === node.id)
  }
}

describe('PersistenceService', () => {
  it('collectCanvasData returns nodes and connections', () => {
    const g = makeMockGraph()
    const node = { id: 'n1', getPosition: () => ({ x: 10, y: 20 }), getData: () => ({ nodeType: 'sms', nodeName: '短信' }) }
    const edge = { id: 'e1', getSource: () => ({ cell: 'n1' }), getTarget: () => ({ cell: 'n2' }), getSourcePortId: () => 'out', getTargetPortId: () => 'in' }
    g.getNodes = () => [node]
    g.getEdges = () => [edge]
    const data = collectCanvasData(g as any)
    expect(data.nodes.length).toBe(1)
    expect(data.connections.length).toBe(1)
    expect(data.nodes[0].id).toBe('n1')
    expect(data.connections[0].id).toBe('e1')
  })

  it('loadCanvasData loads nodes and edges into graph', () => {
    const g = makeMockGraph()
    const ok = loadCanvasData(g as any, {
      nodes: [ { id: 'start', type: 'start', x: 0, y: 0, label: '开始' }, { id: 'sms', type: 'sms', x: 100, y: 0, label: '短信' } ],
      connections: [ { id: 'e1', source: 'start', target: 'sms' } ]
    })
    expect(ok).toBe(true)
    expect(g.getNodes().length).toBe(2)
    expect(g.getEdges().length).toBe(1)
  })

  it('validateForPublish fails when missing start', () => {
    const g = makeMockGraph()
    const res = validateForPublish(g as any, { nodes: [ { id: 'sms', type: 'sms' } ], connections: [] })
    expect(res.pass).toBe(false)
    expect(res.messages.some(m => m.includes('缺少开始'))).toBe(true)
  })
})

