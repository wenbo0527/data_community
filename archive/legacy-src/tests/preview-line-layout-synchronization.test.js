/**
 * 预览线和连接线布局同步测试
 * 测试预览线末端和连接线目标节点同层布局，保证挂载空间
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { UnifiedStructuredLayoutEngine } from '../utils/layout/UnifiedStructuredLayoutEngine.js'
import { PreviewLineSystem } from '../utils/preview-line/PreviewLineSystem.js'

describe('预览线和连接线布局同步测试', () => {
  let mockGraph
  let layoutEngine
  let previewLineSystem
  let sourceNode
  let targetNode1
  let targetNode2
  let previewLine
  let connectionLine

  beforeEach(() => {
    mockGraph = {
      addNode: vi.fn(),
      addEdge: vi.fn(),
      removeEdge: vi.fn(),
      getNodes: vi.fn(() => []),
      getEdges: vi.fn(() => []),
      getCellById: vi.fn(),
      on: vi.fn(),
      off: vi.fn()
    }

    layoutEngine = new UnifiedStructuredLayoutEngine({
      graph: mockGraph,
      config: {
        nodeSpacing: { horizontal: 200, vertical: 100 },
        layerSpacing: 150,
        previewLineSpacing: 80
      }
    })

    previewLineSystem = new PreviewLineSystem({
      graph: mockGraph,
      layoutEngine
    })

    sourceNode = {
      id: 'source-node',
      getData: () => ({ 
        type: 'audience_split', 
        isConfigured: true,
        branches: [
          { id: 'branch-1', name: '分支1' },
          { id: 'branch-2', name: '分支2' },
          { id: 'branch-3', name: '分支3' }
        ]
      }),
      getPosition: () => ({ x: 100, y: 100 }),
      getSize: () => ({ width: 120, height: 60 }),
      setPosition: vi.fn()
    }

    targetNode1 = {
      id: 'target-node-1',
      getData: () => ({ type: 'sms', isConfigured: true }),
      getPosition: () => ({ x: 300, y: 80 }),
      getSize: () => ({ width: 120, height: 60 }),
      setPosition: vi.fn()
    }

    targetNode2 = {
      id: 'target-node-2',
      getData: () => ({ type: 'email', isConfigured: true }),
      getPosition: () => ({ x: 300, y: 160 }),
      getSize: () => ({ width: 120, height: 60 }),
      setPosition: vi.fn()
    }

    previewLine = {
      id: 'preview-line-1',
      source: { cell: 'source-node', port: 'out' },
      target: null,
      getData: () => ({ 
        type: 'preview-line', 
        isPreview: true,
        branchId: 'branch-1'
      }),
      getSourcePoint: () => ({ x: 220, y: 110 }),
      getTargetPoint: () => ({ x: 350, y: 110 }),
      setVertices: vi.fn()
    }

    connectionLine = {
      id: 'connection-line-1',
      source: { cell: 'source-node', port: 'out' },
      target: { cell: 'target-node-1', port: 'in' },
      getData: () => ({ 
        type: 'connection', 
        isPreview: false,
        branchId: 'branch-2'
      }),
      getSourcePoint: () => ({ x: 220, y: 130 }),
      getTargetPoint: () => ({ x: 300, y: 110 }),
      setVertices: vi.fn()
    }
  })

  describe('同层布局验证测试', () => {
    it('预览线末端和连接线目标节点应该在同一层', () => {
      const nodes = [sourceNode, targetNode1, targetNode2]
      const edges = [previewLine, connectionLine]
      
      mockGraph.getNodes.mockReturnValue(nodes)
      mockGraph.getEdges.mockReturnValue(edges)

      const layoutResult = layoutEngine.calculateLayout()
      
      // 获取预览线末端位置和目标节点位置
      const previewEndY = layoutResult.previewLinePositions['preview-line-1'].endY
      const targetNodeY = layoutResult.nodePositions['target-node-1'].y
      
      // 验证它们在同一层（Y坐标相近）
      expect(Math.abs(previewEndY - targetNodeY)).toBeLessThan(20)
    })

    it('多个预览线末端应该垂直分布在同一层', () => {
      const previewLine2 = {
        ...previewLine,
        id: 'preview-line-2',
        getData: () => ({ 
          type: 'preview-line', 
          isPreview: true,
          branchId: 'branch-3'
        })
      }

      const edges = [previewLine, previewLine2, connectionLine]
      mockGraph.getEdges.mockReturnValue(edges)

      const layoutResult = layoutEngine.calculateLayout()
      
      const preview1EndY = layoutResult.previewLinePositions['preview-line-1'].endY
      const preview2EndY = layoutResult.previewLinePositions['preview-line-2'].endY
      
      // 验证预览线末端垂直间距
      expect(Math.abs(preview1EndY - preview2EndY)).toBeGreaterThan(60)
      
      // 验证它们都在目标层
      const targetLayerY = layoutResult.layerPositions[1].y
      expect(Math.abs(preview1EndY - targetLayerY)).toBeLessThan(50)
      expect(Math.abs(preview2EndY - targetLayerY)).toBeLessThan(50)
    })

    it('连接线目标节点应该与预览线末端对齐', () => {
      const nodes = [sourceNode, targetNode1]
      const edges = [previewLine, connectionLine]
      
      mockGraph.getNodes.mockReturnValue(nodes)
      mockGraph.getEdges.mockReturnValue(edges)

      const layoutResult = layoutEngine.calculateLayout()
      
      // 预览线末端和连接线目标节点应该在相似的Y位置
      const previewEndY = layoutResult.previewLinePositions['preview-line-1'].endY
      const connectionTargetY = layoutResult.nodePositions['target-node-1'].y
      
      expect(Math.abs(previewEndY - connectionTargetY)).toBeLessThan(30)
    })
  })

  describe('挂载空间保留测试', () => {
    it('应该为预览线末端预留足够的挂载空间', () => {
      const edges = [previewLine]
      mockGraph.getEdges.mockReturnValue(edges)

      const layoutResult = layoutEngine.calculateLayout()
      
      // 检查预览线末端周围的空间
      const previewEndPos = layoutResult.previewLinePositions['preview-line-1']
      const reservedSpace = layoutResult.reservedSpaces[previewEndPos.endX + ',' + previewEndPos.endY]
      
      expect(reservedSpace).toBeDefined()
      expect(reservedSpace.width).toBeGreaterThanOrEqual(120) // 节点宽度
      expect(reservedSpace.height).toBeGreaterThanOrEqual(60) // 节点高度
    })

    it('多条预览线的挂载空间不应该重叠', () => {
      const previewLine2 = {
        ...previewLine,
        id: 'preview-line-2',
        getData: () => ({ 
          type: 'preview-line', 
          isPreview: true,
          branchId: 'branch-3'
        })
      }

      const edges = [previewLine, previewLine2]
      mockGraph.getEdges.mockReturnValue(edges)

      const layoutResult = layoutEngine.calculateLayout()
      
      const preview1Pos = layoutResult.previewLinePositions['preview-line-1']
      const preview2Pos = layoutResult.previewLinePositions['preview-line-2']
      
      // 验证挂载空间不重叠
      const space1 = layoutResult.reservedSpaces[preview1Pos.endX + ',' + preview1Pos.endY]
      const space2 = layoutResult.reservedSpaces[preview2Pos.endX + ',' + preview2Pos.endY]
      
      const overlap = layoutEngine.checkSpaceOverlap(space1, space2)
      expect(overlap).toBe(false)
    })

    it('预览线转换为连接线后应该释放挂载空间', async () => {
      const edges = [previewLine]
      mockGraph.getEdges.mockReturnValue(edges)

      // 初始布局
      const initialLayout = layoutEngine.calculateLayout()
      const initialSpaceCount = Object.keys(initialLayout.reservedSpaces).length
      
      // 模拟预览线转换为连接线
      previewLine.getData = () => ({ 
        type: 'connection', 
        isPreview: false,
        branchId: 'branch-1'
      })
      previewLine.target = { cell: 'target-node-1', port: 'in' }

      // 重新计算布局
      const updatedLayout = layoutEngine.calculateLayout()
      const updatedSpaceCount = Object.keys(updatedLayout.reservedSpaces).length
      
      // 验证挂载空间被释放
      expect(updatedSpaceCount).toBeLessThan(initialSpaceCount)
    })
  })

  describe('布局同步机制测试', () => {
    it('源节点移动时预览线和连接线应该同步更新', () => {
      const nodes = [sourceNode, targetNode1]
      const edges = [previewLine, connectionLine]
      
      mockGraph.getNodes.mockReturnValue(nodes)
      mockGraph.getEdges.mockReturnValue(edges)

      // 移动源节点
      sourceNode.getPosition = () => ({ x: 150, y: 150 })
      
      const layoutResult = layoutEngine.calculateLayout()
      
      // 验证预览线起点更新
      const previewStartPos = layoutResult.previewLinePositions['preview-line-1']
      expect(previewStartPos.startX).toBe(270) // 150 + 120 (节点宽度)
      expect(previewStartPos.startY).toBe(180) // 150 + 30 (端口偏移)
      
      // 验证连接线起点更新
      expect(previewLine.setVertices).toHaveBeenCalled()
      expect(connectionLine.setVertices).toHaveBeenCalled()
    })

    it('目标节点移动时连接线应该同步，预览线末端保持在原层', () => {
      const nodes = [sourceNode, targetNode1]
      const edges = [previewLine, connectionLine]
      
      mockGraph.getNodes.mockReturnValue(nodes)
      mockGraph.getEdges.mockReturnValue(edges)

      // 移动目标节点
      targetNode1.getPosition = () => ({ x: 350, y: 200 })
      
      const layoutResult = layoutEngine.calculateLayout()
      
      // 验证连接线终点更新
      const connectionEndY = layoutResult.nodePositions['target-node-1'].y
      expect(connectionEndY).toBe(200)
      
      // 验证预览线末端仍在目标层
      const previewEndY = layoutResult.previewLinePositions['preview-line-1'].endY
      const targetLayerY = layoutResult.layerPositions[1].y
      expect(Math.abs(previewEndY - targetLayerY)).toBeLessThan(30)
    })

    it('节点删除后预览线应该重新布局到合适位置', async () => {
      const nodes = [sourceNode, targetNode1, targetNode2]
      const edges = [connectionLine]
      
      mockGraph.getNodes.mockReturnValue(nodes)
      mockGraph.getEdges.mockReturnValue(edges)

      // 删除目标节点，连接线应该转换为预览线
      await previewLineSystem.handleNodeDeletion('target-node-1')
      
      // 模拟连接线转换为预览线
      const restoredPreviewLine = {
        ...connectionLine,
        id: 'restored-preview-line',
        target: null,
        getData: () => ({ 
          type: 'preview-line', 
          isPreview: true,
          branchId: 'branch-2'
        })
      }
      
      mockGraph.getEdges.mockReturnValue([restoredPreviewLine])
      
      const layoutResult = layoutEngine.calculateLayout()
      
      // 验证恢复的预览线末端位置合理
      const restoredPreviewPos = layoutResult.previewLinePositions['restored-preview-line']
      expect(restoredPreviewPos.endX).toBeGreaterThan(250)
      expect(restoredPreviewPos.endY).toBeGreaterThan(0)
      
      // 验证挂载空间被重新分配
      const reservedSpace = layoutResult.reservedSpaces[restoredPreviewPos.endX + ',' + restoredPreviewPos.endY]
      expect(reservedSpace).toBeDefined()
    })
  })

  describe('性能优化测试', () => {
    it('大量预览线和连接线的布局计算应该在合理时间内完成', () => {
      // 创建大量预览线和连接线
      const nodes = [sourceNode]
      const edges = []
      
      for (let i = 0; i < 50; i++) {
        const targetNode = {
          id: `target-node-${i}`,
          getData: () => ({ type: 'sms', isConfigured: true }),
          getPosition: () => ({ x: 300, y: 100 + i * 80 }),
          getSize: () => ({ width: 120, height: 60 }),
          setPosition: vi.fn()
        }
        nodes.push(targetNode)
        
        if (i % 2 === 0) {
          // 预览线
          edges.push({
            id: `preview-line-${i}`,
            source: { cell: 'source-node', port: 'out' },
            target: null,
            getData: () => ({ type: 'preview-line', isPreview: true }),
            setVertices: vi.fn()
          })
        } else {
          // 连接线
          edges.push({
            id: `connection-line-${i}`,
            source: { cell: 'source-node', port: 'out' },
            target: { cell: `target-node-${i}`, port: 'in' },
            getData: () => ({ type: 'connection', isPreview: false }),
            setVertices: vi.fn()
          })
        }
      }
      
      mockGraph.getNodes.mockReturnValue(nodes)
      mockGraph.getEdges.mockReturnValue(edges)

      const startTime = Date.now()
      const layoutResult = layoutEngine.calculateLayout()
      const endTime = Date.now()
      
      // 布局计算应该在1秒内完成
      expect(endTime - startTime).toBeLessThan(1000)
      expect(layoutResult).toBeDefined()
      expect(Object.keys(layoutResult.previewLinePositions).length).toBeGreaterThan(0)
    })

    it('布局缓存机制应该避免重复计算', () => {
      const nodes = [sourceNode, targetNode1]
      const edges = [previewLine, connectionLine]
      
      mockGraph.getNodes.mockReturnValue(nodes)
      mockGraph.getEdges.mockReturnValue(edges)

      // 第一次计算
      const layout1 = layoutEngine.calculateLayout()
      
      // 第二次计算（无变化）
      const layout2 = layoutEngine.calculateLayout()
      
      // 验证使用了缓存
      expect(layoutEngine.isCacheHit()).toBe(true)
      expect(layout1).toEqual(layout2)
    })
  })
})