/**
 * 节点端口位置验证器测试
 * 测试NodePortValidator的端口配置验证功能
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NodePortValidator } from '../utils/NodePortValidator.js'

describe('NodePortValidator 端口位置验证', () => {
  let validator
  let mockStartNode
  let mockEndNode
  let mockMiddleNode

  beforeEach(() => {
    validator = new NodePortValidator({
      enableLogging: false, // 测试时关闭日志
      strictMode: false
    })

    // 模拟开始节点
    mockStartNode = {
      id: 'start-node-1',
      getData: vi.fn().mockReturnValue({ nodeType: 'start', type: 'start' }),
      getPosition: vi.fn().mockReturnValue({ x: 100, y: 100 }),
      getSize: vi.fn().mockReturnValue({ width: 120, height: 60 }),
      getPorts: vi.fn().mockReturnValue([
        { id: 'out', group: 'out' }
      ])
    }

    // 模拟结束节点
    mockEndNode = {
      id: 'end-node-1',
      getData: vi.fn().mockReturnValue({ nodeType: 'end', type: 'end' }),
      getPosition: vi.fn().mockReturnValue({ x: 200, y: 200 }),
      getSize: vi.fn().mockReturnValue({ width: 120, height: 60 }),
      getPorts: vi.fn().mockReturnValue([
        { id: 'in', group: 'in' }
      ])
    }

    // 模拟中间节点
    mockMiddleNode = {
      id: 'middle-node-1',
      getData: vi.fn().mockReturnValue({ nodeType: 'action', type: 'action' }),
      getPosition: vi.fn().mockReturnValue({ x: 300, y: 300 }),
      getSize: vi.fn().mockReturnValue({ width: 120, height: 60 }),
      getPorts: vi.fn().mockReturnValue([
        { id: 'in', group: 'in' },
        { id: 'out', group: 'out' }
      ])
    }
  })

  describe('开始节点验证', () => {
    it('应该验证开始节点只有out端口', () => {
      const result = validator.validateSingleNode(mockStartNode)
      
      expect(result.isValid).toBe(true)
      expect(result.nodeType).toBe('start')
      expect(result.portAnalysis.hasOutPort).toBe(true)
      expect(result.portAnalysis.hasInPort).toBe(false)
      expect(result.errors).toHaveLength(0)
    })

    it('应该检测开始节点错误配置了in端口', () => {
      // 修改开始节点，错误地添加in端口
      mockStartNode.getPorts.mockReturnValue([
        { id: 'in', group: 'in' },
        { id: 'out', group: 'out' }
      ])

      const result = validator.validateSingleNode(mockStartNode)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('开始节点 start-node-1 不应该有in端口')
    })

    it('应该检测开始节点缺少out端口', () => {
      // 修改开始节点，移除out端口
      mockStartNode.getPorts.mockReturnValue([])

      const result = validator.validateSingleNode(mockStartNode)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('开始节点 start-node-1 缺少out端口')
    })
  })

  describe('结束节点验证', () => {
    it('应该验证结束节点只有in端口', () => {
      const result = validator.validateSingleNode(mockEndNode)
      
      expect(result.isValid).toBe(true)
      expect(result.nodeType).toBe('end')
      expect(result.portAnalysis.hasInPort).toBe(true)
      expect(result.portAnalysis.hasOutPort).toBe(false)
      expect(result.errors).toHaveLength(0)
    })

    it('应该检测结束节点错误配置了out端口', () => {
      // 修改结束节点，错误地添加out端口
      mockEndNode.getPorts.mockReturnValue([
        { id: 'in', group: 'in' },
        { id: 'out', group: 'out' }
      ])

      const result = validator.validateSingleNode(mockEndNode)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('结束节点 end-node-1 不应该有out端口')
    })

    it('应该检测结束节点缺少in端口', () => {
      // 修改结束节点，移除in端口
      mockEndNode.getPorts.mockReturnValue([])

      const result = validator.validateSingleNode(mockEndNode)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('结束节点 end-node-1 缺少in端口')
    })
  })

  describe('中间节点验证', () => {
    it('应该验证中间节点同时有in和out端口', () => {
      const result = validator.validateSingleNode(mockMiddleNode)
      
      expect(result.isValid).toBe(true)
      expect(result.nodeType).toBe('action')
      expect(result.portAnalysis.hasInPort).toBe(true)
      expect(result.portAnalysis.hasOutPort).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('应该检测中间节点缺少in端口', () => {
      // 修改中间节点，移除in端口
      mockMiddleNode.getPorts.mockReturnValue([
        { id: 'out', group: 'out' }
      ])

      const result = validator.validateSingleNode(mockMiddleNode)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('中间节点 middle-node-1 缺少in端口')
    })

    it('应该检测中间节点缺少out端口', () => {
      // 修改中间节点，移除out端口
      mockMiddleNode.getPorts.mockReturnValue([
        { id: 'in', group: 'in' }
      ])

      const result = validator.validateSingleNode(mockMiddleNode)
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('中间节点 middle-node-1 缺少out端口')
    })
  })

  describe('端口位置验证', () => {
    it('应该正确计算in端口位置（顶部中心）', () => {
      const result = validator.validateSingleNode(mockMiddleNode)
      
      expect(result.portAnalysis.inPortPosition).toEqual({
        x: 360, // 300 + 120/2
        y: 300, // 节点顶部
        position: 'top'
      })
    })

    it('应该正确计算out端口位置（底部中心）', () => {
      const result = validator.validateSingleNode(mockMiddleNode)
      
      expect(result.portAnalysis.outPortPosition).toEqual({
        x: 360, // 300 + 120/2
        y: 360, // 300 + 60
        position: 'bottom'
      })
    })
  })

  describe('批量节点验证', () => {
    it('应该验证所有节点的端口配置', () => {
      const nodes = [mockStartNode, mockEndNode, mockMiddleNode]
      const result = validator.validateAllNodes(nodes)
      
      expect(result.isValid).toBe(true)
      expect(result.totalNodes).toBe(3)
      expect(result.validNodes).toBe(3)
      expect(result.invalidNodes).toBe(0)
      
      expect(result.summary.startNodes.total).toBe(1)
      expect(result.summary.startNodes.valid).toBe(1)
      expect(result.summary.endNodes.total).toBe(1)
      expect(result.summary.endNodes.valid).toBe(1)
      expect(result.summary.middleNodes.total).toBe(1)
      expect(result.summary.middleNodes.valid).toBe(1)
    })

    it('应该检测混合节点配置错误', () => {
      // 让开始节点配置错误
      mockStartNode.getPorts.mockReturnValue([
        { id: 'in', group: 'in' },
        { id: 'out', group: 'out' }
      ])

      // 让结束节点配置错误
      mockEndNode.getPorts.mockReturnValue([])

      const nodes = [mockStartNode, mockEndNode, mockMiddleNode]
      const result = validator.validateAllNodes(nodes)
      
      expect(result.isValid).toBe(false)
      expect(result.totalNodes).toBe(3)
      expect(result.validNodes).toBe(1) // 只有中间节点正确
      expect(result.invalidNodes).toBe(2)
      
      expect(result.errors).toContain('开始节点 start-node-1 不应该有in端口')
      expect(result.errors).toContain('结束节点 end-node-1 缺少in端口')
    })
  })

  describe('边界情况处理', () => {
    it('应该处理节点无法获取位置信息的情况', () => {
      mockMiddleNode.getPosition.mockReturnValue(null)
      
      const result = validator.validateSingleNode(mockMiddleNode)
      
      expect(result.warnings).toContain('节点 middle-node-1 无法获取位置或尺寸信息')
    })

    it('应该处理节点无法获取尺寸信息的情况', () => {
      mockMiddleNode.getSize.mockReturnValue(null)
      
      const result = validator.validateSingleNode(mockMiddleNode)
      
      expect(result.warnings).toContain('节点 middle-node-1 无法获取位置或尺寸信息')
    })

    it('应该处理节点没有端口的情况', () => {
      mockMiddleNode.getPorts.mockReturnValue([])
      
      const result = validator.validateSingleNode(mockMiddleNode)
      
      expect(result.isValid).toBe(false)
      expect(result.portAnalysis.portCount).toBe(0)
      expect(result.errors).toContain('中间节点 middle-node-1 缺少in端口')
      expect(result.errors).toContain('中间节点 middle-node-1 缺少out端口')
    })

    it('应该处理未知节点类型', () => {
      const unknownNode = {
        id: 'unknown-node',
        getData: vi.fn().mockReturnValue({ nodeType: 'unknown' }),
        getPosition: vi.fn().mockReturnValue({ x: 0, y: 0 }),
        getSize: vi.fn().mockReturnValue({ width: 100, height: 50 }),
        getPorts: vi.fn().mockReturnValue([
          { id: 'in', group: 'in' },
          { id: 'out', group: 'out' }
        ])
      }

      const result = validator.validateSingleNode(unknownNode)
      
      // 未知类型按中间节点处理
      expect(result.isValid).toBe(true)
      expect(result.nodeType).toBe('unknown')
    })
  })
})