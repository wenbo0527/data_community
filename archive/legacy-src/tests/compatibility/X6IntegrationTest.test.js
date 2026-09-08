/**
 * X6集成测试
 * 验证X6画布功能与改进后的测试环境的兼容性
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { Graph } from '@antv/x6'
import { createRealDOMContainer, cleanupDOM } from '../setup/real-environment.js'

describe('X6集成测试', () => {
  let container
  let graph

  beforeEach(() => {
    container = createRealDOMContainer()
  })

  afterEach(() => {
    if (graph) {
      graph.dispose()
      graph = null
    }
    cleanupDOM()
  })

  it('应该能够创建X6 Graph实例', () => {
    graph = new Graph({
      container,
      width: 800,
      height: 600
    })

    expect(graph).toBeDefined()
    expect(graph.container).toBe(container)
  })

  it('应该能够添加节点', () => {
    graph = new Graph({
      container,
      width: 800,
      height: 600
    })

    const node = graph.addNode({
      x: 100,
      y: 100,
      width: 80,
      height: 40,
      label: '测试节点'
    })

    expect(node).toBeDefined()
    expect(graph.getNodes()).toHaveLength(1)
    expect(node.getLabel()).toBe('测试节点')
  })

  it('应该能够添加连接', () => {
    graph = new Graph({
      container,
      width: 800,
      height: 600
    })

    const source = graph.addNode({
      id: 'source',
      x: 100,
      y: 100,
      width: 80,
      height: 40,
      label: '源节点'
    })

    const target = graph.addNode({
      id: 'target',
      x: 300,
      y: 100,
      width: 80,
      height: 40,
      label: '目标节点'
    })

    const edge = graph.addEdge({
      source: 'source',
      target: 'target'
    })

    expect(edge).toBeDefined()
    expect(graph.getEdges()).toHaveLength(1)
    expect(graph.getNodes()).toHaveLength(2)
  })

  it('应该能够渲染到DOM', async () => {
    graph = new Graph({
      container,
      width: 800,
      height: 600
    })

    graph.addNode({
      x: 100,
      y: 100,
      width: 80,
      height: 40,
      label: '测试节点'
    })

    // 等待渲染完成
    await new Promise(resolve => setTimeout(resolve, 100))

    // 检查SVG元素是否被创建
    const svgElement = container.querySelector('svg')
    expect(svgElement).toBeDefined()
    expect(svgElement.getAttribute('width')).toBe('800')
    expect(svgElement.getAttribute('height')).toBe('600')
  })

  it('应该能够处理节点事件', () => {
    graph = new Graph({
      container,
      width: 800,
      height: 600
    })

    let clickCount = 0
    
    const node = graph.addNode({
      x: 100,
      y: 100,
      width: 80,
      height: 40,
      label: '可点击节点'
    })

    node.on('click', () => {
      clickCount++
    })

    // 触发点击事件
    node.trigger('click')

    expect(clickCount).toBe(1)
  })
})