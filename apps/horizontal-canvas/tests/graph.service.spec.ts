import { describe, it, expect } from 'vitest'
import { bindConnectionPolicies } from '../src/pages/marketing/tasks/horizontal/graph/GraphService'

function makeMagnet(group: string, port: string) {
  return {
    getAttribute: (name: string) => {
      if (name === 'port-group' || name === 'data-port-group') return group
      if (name === 'port' || name === 'data-port' || name === 'data-port-id') return port
      return null
    }
  } as any
}

describe('GraphService.bindConnectionPolicies', () => {
  it('blocks in view mode', () => {
    const graph: any = { getOutgoingEdges: () => [] }
    const { validateConnection, validateMagnet } = bindConnectionPolicies(graph, { isViewMode: () => true, isPanning: () => false })
    const okConn = validateConnection({ sourceMagnet: makeMagnet('out', 'out-0'), targetMagnet: makeMagnet('in', 'in'), sourceView: { cell: {} }, edge: { id: 'e1' } })
    const okMag = validateMagnet({ magnet: makeMagnet('out', 'out-0'), view: { cell: {} } })
    expect(okConn).toBe(false)
    expect(okMag).toBe(false)
  })

  it('rejects non out->in connections', () => {
    const graph: any = { getOutgoingEdges: () => [] }
    const { validateConnection } = bindConnectionPolicies(graph, { isViewMode: () => false, isPanning: () => false })
    expect(validateConnection({ sourceMagnet: makeMagnet('in', 'in'), targetMagnet: makeMagnet('out', 'out-0'), sourceView: { cell: {} }, edge: { id: 'e1' } })).toBe(false)
  })

  it('rejects duplicate source port', () => {
    const graph: any = { getOutgoingEdges: () => [ { id: 'eX', getSourcePortId: () => 'out-0' } ] }
    const { validateConnection, validateMagnet } = bindConnectionPolicies(graph, { isViewMode: () => false, isPanning: () => false })
    const okConn = validateConnection({ sourceMagnet: makeMagnet('out', 'out-0'), targetMagnet: makeMagnet('in', 'in'), sourceView: { cell: {} }, edge: { id: 'e1' } })
    const okMag = validateMagnet({ magnet: makeMagnet('out', 'out-0'), view: { cell: {} } })
    expect(okConn).toBe(false)
    expect(okMag).toBe(false)
  })

  it('accepts valid out->in connection when not duplicate', () => {
    const graph: any = { getOutgoingEdges: () => [ { id: 'eX', getSourcePortId: () => 'out-1' } ] }
    const { validateConnection } = bindConnectionPolicies(graph, { isViewMode: () => false, isPanning: () => false })
    const okConn = validateConnection({ sourceMagnet: makeMagnet('out', 'out-0'), targetMagnet: makeMagnet('in', 'in'), sourceView: { cell: {} }, edge: { id: 'e1' } })
    expect(okConn).toBe(true)
  })
})

