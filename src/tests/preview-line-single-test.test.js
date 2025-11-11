/**
 * 单个预览线测试 - 用于调试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import PreviewLineSystem from '../utils/preview-line/PreviewLineSystem.js'

describe('单个预览线测试', () => {
  let mockGraph
  let previewLineSystem

  beforeEach(async () => {
    // 存储添加的边
    const addedEdges = []
    
    // 创建完整的mock edge对象工厂函数
    const createMockEdge = (id = 'test-edge') => ({
      id,
      visible: true,
      prop: vi.fn(),
      getData: vi.fn(),
      setData: vi.fn(),
      setVisible: vi.fn(),
      getAttrs: vi.fn().mockReturnValue({}),
      setAttrs: vi.fn(),
      attr: vi.fn(),
      setAttrByPath: vi.fn(),
      getAttrByPath: vi.fn().mockReturnValue(''),
      setZIndex: vi.fn(),
      getZIndex: vi.fn().mockReturnValue(1000),
      getSource: vi.fn().mockReturnValue({ x: 100, y: 100 }),
      getTarget: vi.fn().mockReturnValue({ x: 200, y: 200 }),
      setSource: vi.fn(),
      setTarget: vi.fn(),
      getLabels: vi.fn().mockReturnValue([]),
      setLabelAt: vi.fn(),
      setRouter: vi.fn(),
      view: {
        el: {
          style: {}
        },
        update: vi.fn()
      }
    })

    mockGraph = {
      addNode: vi.fn(),
      addEdge: vi.fn((edgeConfig) => {
        const edge = createMockEdge(edgeConfig.id || `edge-${Date.now()}`)
        addedEdges.push(edge)
        return edge
      }),
      removeEdge: vi.fn(),
      getNodes: vi.fn(() => []),
      getEdges: vi.fn(() => addedEdges),
      getCells: vi.fn(() => addedEdges),
      getCellById: vi.fn(),
      hasCell: vi.fn().mockReturnValue(true),
      getOutgoingEdges: vi.fn(() => []),
      refreshViews: vi.fn(),
      on: vi.fn(),
      off: vi.fn()
    }

    previewLineSystem = new PreviewLineSystem({
      graph: mockGraph,
      layoutEngine: { isReady: true }
    })
    
    console.log('🔍 [测试] PreviewLineSystem创建成功，开始初始化...')
    
    // 初始化预览线系统
    try {
      await previewLineSystem.init()
      console.log('✅ [测试] PreviewLineSystem初始化成功')
    } catch (error) {
      console.error('❌ [测试] PreviewLineSystem初始化失败:', error)
      throw error
    }
  })

  it('普通节点应该只有1条预览线或连接线', async () => {
    const normalNode = {
      id: 'normal-node',
      getData: () => ({ 
        type: 'sms', 
        isConfigured: true,
        // 无分支配置
      }),
      getPosition: () => ({ x: 100, y: 100 }),
      getSize: () => ({ width: 120, height: 60 })
    }

    // 设置getCellById返回节点
    mockGraph.getCellById.mockReturnValue(normalNode)

    // 创建预览线
    console.log('🔍 [测试] 开始创建预览线...')
    console.log('调用createPreviewLine前，graph实例已注入:', !!previewLineSystem.graph)
    
    let result;
    try {
      result = await previewLineSystem.createPreviewLine({
        sourceId: 'normal-node'
      });
      console.log('✅ [测试] 预览线创建成功，结果:', result);
    } catch (error) {
      console.error('❌ [测试] 预览线创建失败:', error);
      throw error;
    }
    
    // 验证addEdge被调用
    expect(mockGraph.addEdge).toHaveBeenCalledTimes(1)

    // 验证预览线数量
    const previewCount = await previewLineSystem.getPreviewLineCount('normal-node')
    const connectionCount = await previewLineSystem.getConnectionCount('normal-node')
    const totalLines = previewCount + connectionCount

    expect(totalLines).toBe(1)
  })
})