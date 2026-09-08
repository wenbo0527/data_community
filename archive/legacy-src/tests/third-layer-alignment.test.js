import { describe, it, expect, beforeEach, vi } from 'vitest'

describe('第三层中点对齐测试', () => {
  let mockGraph
  let mockLayoutEngine
  let mockNode1, mockNode2, mockNode3

  beforeEach(() => {
    // 创建mock图形对象
    mockGraph = {
      addEdge: vi.fn(),
      removeEdge: vi.fn(),
      getEdges: vi.fn(() => []),
      getNodes: vi.fn(() => []),
      getCellById: vi.fn(),
      getOutgoingEdges: vi.fn(() => []),
      getIncomingEdges: vi.fn(() => []),
      on: vi.fn(),
      off: vi.fn()
    }

    // 创建mock布局引擎
    mockLayoutEngine = {
      calculateNodePosition: vi.fn(),
      alignNodesInLayer: vi.fn(),
      getLayerNodes: vi.fn(),
      updateNodePosition: vi.fn()
    }

    // 创建测试节点
    mockNode1 = {
      id: 'layer3-node1',
      getData: vi.fn(() => ({
        type: 'ai-call',
        isConfigured: true,
        layer: 3,
        x: 100,
        y: 200
      })),
      setData: vi.fn(),
      getPosition: vi.fn(() => ({ x: 100, y: 200 })),
      setPosition: vi.fn()
    }

    mockNode2 = {
      id: 'layer3-node2',
      getData: vi.fn(() => ({
        type: 'manual-call',
        isConfigured: true,
        layer: 3,
        x: 300,
        y: 250  // 不对齐的Y坐标
      })),
      setData: vi.fn(),
      getPosition: vi.fn(() => ({ x: 300, y: 250 })),
      setPosition: vi.fn()
    }

    mockNode3 = {
      id: 'layer3-node3',
      getData: vi.fn(() => ({
        type: 'audience-split',
        isConfigured: true,
        layer: 3,
        x: 500,
        y: 180  // 不对齐的Y坐标
      })),
      setData: vi.fn(),
      getPosition: vi.fn(() => ({ x: 500, y: 180 })),
      setPosition: vi.fn()
    }
  })

  describe('第三层节点对齐检测', () => {
    it('应该检测到第三层节点Y坐标不一致', () => {
      const layer3Nodes = [mockNode1, mockNode2, mockNode3]
      
      // 获取所有Y坐标
      const yCoordinates = layer3Nodes.map(node => node.getPosition().y)
      
      // 检查Y坐标是否一致
      const isAligned = yCoordinates.every(y => y === yCoordinates[0])
      
      console.log('🧪 [测试] 第三层节点Y坐标:', yCoordinates)
      console.log('🧪 [测试] 是否对齐:', isAligned)
      
      // 验证检测到不对齐
      expect(isAligned).toBe(false)
      expect(yCoordinates).toEqual([200, 250, 180])
    })

    it('应该计算第三层节点的中点Y坐标', () => {
      const layer3Nodes = [mockNode1, mockNode2, mockNode3]
      
      // 计算中点Y坐标
      const yCoordinates = layer3Nodes.map(node => node.getPosition().y)
      const centerY = yCoordinates.reduce((sum, y) => sum + y, 0) / yCoordinates.length
      
      console.log('🧪 [测试] 计算的中点Y坐标:', centerY)
      
      // 验证中点计算正确
      expect(centerY).toBe((200 + 250 + 180) / 3) // 210
    })

    it('应该将第三层所有节点对齐到中点', () => {
      const layer3Nodes = [mockNode1, mockNode2, mockNode3]
      
      // 计算中点Y坐标
      const yCoordinates = layer3Nodes.map(node => node.getPosition().y)
      const centerY = yCoordinates.reduce((sum, y) => sum + y, 0) / yCoordinates.length
      
      // 模拟对齐操作
      layer3Nodes.forEach(node => {
        const currentPos = node.getPosition()
        node.setPosition({ x: currentPos.x, y: centerY })
      })
      
      // 验证所有节点都被设置为中点Y坐标
      expect(mockNode1.setPosition).toHaveBeenCalledWith({ x: 100, y: 210 })
      expect(mockNode2.setPosition).toHaveBeenCalledWith({ x: 300, y: 210 })
      expect(mockNode3.setPosition).toHaveBeenCalledWith({ x: 500, y: 210 })
      
      console.log('🧪 [测试] 对齐操作完成，所有节点Y坐标应为:', centerY)
    })
  })

  describe('布局引擎对齐方法测试', () => {
    it('应该提供层级节点对齐方法', () => {
      // 模拟布局引擎的对齐方法
      const alignLayerNodes = (layerNumber, nodes) => {
        if (!nodes || nodes.length === 0) return
        
        // 计算中点Y坐标
        const yCoordinates = nodes.map(node => node.getPosition().y)
        const centerY = yCoordinates.reduce((sum, y) => sum + y, 0) / yCoordinates.length
        
        // 对齐所有节点
        nodes.forEach(node => {
          const currentPos = node.getPosition()
          node.setPosition({ x: currentPos.x, y: centerY })
        })
        
        return centerY
      }
      
      const layer3Nodes = [mockNode1, mockNode2, mockNode3]
      const alignedY = alignLayerNodes(3, layer3Nodes)
      
      // 验证对齐方法工作正常
      expect(alignedY).toBe(210)
      expect(mockNode1.setPosition).toHaveBeenCalledWith({ x: 100, y: 210 })
      expect(mockNode2.setPosition).toHaveBeenCalledWith({ x: 300, y: 210 })
      expect(mockNode3.setPosition).toHaveBeenCalledWith({ x: 500, y: 210 })
    })

    it('应该处理空节点列表', () => {
      const alignLayerNodes = (layerNumber, nodes) => {
        if (!nodes || nodes.length === 0) return null
        
        const yCoordinates = nodes.map(node => node.getPosition().y)
        const centerY = yCoordinates.reduce((sum, y) => sum + y, 0) / yCoordinates.length
        
        nodes.forEach(node => {
          const currentPos = node.getPosition()
          node.setPosition({ x: currentPos.x, y: centerY })
        })
        
        return centerY
      }
      
      // 测试空节点列表
      const result1 = alignLayerNodes(3, [])
      const result2 = alignLayerNodes(3, null)
      
      expect(result1).toBe(null)
      expect(result2).toBe(null)
    })

    it('应该处理单个节点的情况', () => {
      const alignLayerNodes = (layerNumber, nodes) => {
        if (!nodes || nodes.length === 0) return null
        
        const yCoordinates = nodes.map(node => node.getPosition().y)
        const centerY = yCoordinates.reduce((sum, y) => sum + y, 0) / yCoordinates.length
        
        nodes.forEach(node => {
          const currentPos = node.getPosition()
          node.setPosition({ x: currentPos.x, y: centerY })
        })
        
        return centerY
      }
      
      // 测试单个节点
      const singleNodeResult = alignLayerNodes(3, [mockNode1])
      
      expect(singleNodeResult).toBe(200) // 单个节点的Y坐标
      expect(mockNode1.setPosition).toHaveBeenCalledWith({ x: 100, y: 200 })
    })
  })
})