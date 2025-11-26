import { describe, it, expect } from 'vitest'
import { ensureStartNode, updateNodeUnified } from '../src/pages/marketing/tasks/horizontal/node/NodeService'

function makeMockGraph() {
  const nodes: any[] = []
  return {
    getNodes: () => nodes,
    addNode: (n: any) => { nodes.push(n); return n }
  }
}

function makeMockNode() {
  let data: any = {}
  const ports: any[] = []
  return {
    id: 'n1',
    getPosition: () => ({ x: 0, y: 0 }),
    getData: () => data,
    setData: (d: any) => { data = d },
    resize: (_w: number, _h: number) => {},
    getPorts: () => ports,
    setProp: (_key: string, _val: any) => {},
    setPortProp: (_id: string, _key: string, _val: any) => {},
    addPort: (p: any) => { ports.push(p) },
    removePort: (_id: string) => {},
    prop: (_key: string, _val: any) => {},
    trigger: (_evt: string, _payload: any) => {}
  }
}

describe('NodeService', () => {
  it('ensureStartNode adds start when missing', () => {
    const g = makeMockGraph()
    ensureStartNode(g as any)
    expect(g.getNodes().length > 0).toBe(true)
  })

  it('updateNodeUnified updates node data', () => {
    const g = makeMockGraph()
    const node = makeMockNode()
    updateNodeUnified(g as any, node as any, 'sms', { nodeName: '短信' })
    expect(node.getData().nodeType).toBe('sms')
  })
})

