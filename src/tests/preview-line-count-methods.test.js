/**
 * PreviewLineSystem计数方法测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'

describe('PreviewLineSystem计数方法测试', () => {
  let PreviewLineSystem
  let mockGraph
  let system

  beforeEach(async () => {
    const module = await import('../utils/preview-line/PreviewLineSystem.js')
    PreviewLineSystem = module.default

    mockGraph = {
      addNode: vi.fn(),
      addEdge: vi.fn(),
      removeEdge: vi.fn(),
      getNodes: vi.fn().mockReturnValue([]),
      getEdges: vi.fn().mockReturnValue([]),
      getOutgoingEdges: vi.fn().mockReturnValue([]),
      getCellById: vi.fn(),
      on: vi.fn(),
      off: vi.fn(),
      hasCell: vi.fn().mockReturnValue(false),
      findViewByCell: vi.fn()
    }

    system = new PreviewLineSystem({
      graph: mockGraph,
      skipInitialization: true
    })
  })

  it('应该有getPreviewLineCount方法', () => {
    expect(typeof system.getPreviewLineCount).toBe('function')
  })

  it('应该有getConnectionCount方法', () => {
    expect(typeof system.getConnectionCount).toBe('function')
  })

  it('应该有getTotalLineCount方法', () => {
    expect(typeof system.getTotalLineCount).toBe('function')
  })

  it('getPreviewLineCount应该返回0当没有预览线时', async () => {
    const count = await system.getPreviewLineCount('test-node')
    expect(count).toBe(0)
  })

  it('getConnectionCount应该返回0当没有连接线时', async () => {
    const count = await system.getConnectionCount('test-node')
    expect(count).toBe(0)
  })

  it('getTotalLineCount应该返回0当没有线时', async () => {
    const count = await system.getTotalLineCount('test-node')
    expect(count).toBe(0)
  })

  it('应该能正确计算连接线数量', async () => {
    // 模拟有2条连接线
    const mockEdges = [
      { id: 'edge1', source: 'test-node', target: 'target1', getData: () => ({ type: 'connection' }) },
      { id: 'edge2', source: 'test-node', target: 'target2', getData: () => ({ type: 'connection' }) }
    ]
    
    mockGraph.getOutgoingEdges.mockReturnValue(mockEdges)
    
    const count = await system.getConnectionCount('test-node')
    expect(count).toBe(2)
  })

  it('应该能正确区分预览线和连接线', async () => {
    // 模拟有1条预览线和1条连接线
    const mockEdges = [
      { id: 'preview1', source: 'test-node', target: null, getData: () => ({ type: 'preview' }) },
      { id: 'connection1', source: 'test-node', target: 'target1', getData: () => ({ type: 'connection' }) }
    ]
    
    mockGraph.getOutgoingEdges.mockReturnValue(mockEdges)
    
    const connectionCount = await system.getConnectionCount('test-node')
    expect(connectionCount).toBe(1) // 只有1条连接线
  })
})