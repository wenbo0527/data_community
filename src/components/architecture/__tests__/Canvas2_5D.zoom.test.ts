import { render, fireEvent } from '@testing-library/vue'
import { describe, it, expect } from 'vitest'
import Canvas2_5D from '../Canvas2_5D.vue'

const layers = [
  { id: 'L1', index: 1, title: '层一' },
  { id: 'L2', index: 2, title: '层二' }
]

const nodes = [
  { id: 'platform', name: '平台', layerIndex: 1, xPct: 20, yPct: 50 },
  { id: 'n2', name: '节点2', layerIndex: 1, xPct: 40, yPct: 55 },
  { id: 'n3', name: '节点3', layerIndex: 2, xPct: 70, yPct: 60 }
]

describe('Canvas2_5D zoom', () => {
  it('ctrl/meta + wheel scales entire canvas content', async () => {
    const { container } = render(Canvas2_5D as any, {
      props: { layers, nodes, opts: { hideNodes: false, coord: false, hideBg: false } }
    })
    const canvas = container.querySelector('.canvas') as HTMLElement
    const content = container.querySelector('.content') as HTMLElement
    expect(canvas).toBeTruthy()
    expect(content).toBeTruthy()
    const initialTransform = content.style.transform || ''
    expect(initialTransform.includes('scale')).toBe(true)
    await fireEvent.wheel(canvas, { ctrlKey: true, deltaY: -100 })
    const transformAfterZoomIn = content.style.transform
    expect(transformAfterZoomIn.includes('scale(')).toBe(true)
    // zoom in should increase scale value from default 1
    const scaleMatch = transformAfterZoomIn.match(/scale\(([\d.]+)\)/)
    expect(scaleMatch).toBeTruthy()
    const scaleVal = scaleMatch ? parseFloat(scaleMatch[1]) : 0
    expect(scaleVal).toBeGreaterThan(1)
    // zoom out
    await fireEvent.wheel(canvas, { metaKey: true, deltaY: 100 })
    const transformAfterZoomOut = content.style.transform
    const scaleMatch2 = transformAfterZoomOut.match(/scale\(([\d.]+)\)/)
    expect(scaleMatch2).toBeTruthy()
    const scaleVal2 = scaleMatch2 ? parseFloat(scaleMatch2[1]) : 0
    expect(scaleVal2).toBeLessThanOrEqual(scaleVal)
  })
})
