/**
 * 预览线有效性检查测试
 * 验证PreviewLineSystem的validateNodeConnections方法是否正常工作
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { PreviewLineSystem } from '../utils/preview-line/PreviewLineSystem.js'
import { PreviewLineManager } from '../utils/preview-line/core/PreviewLineManager.js'

describe('预览线有效性检查', () => {
  let mockGraph
  let previewLineSystem
  let mockPreviewLineManager

  beforeEach(() => {
    // 创建模拟图实例
    mockGraph = {
      getNodes: vi.fn(() => []),
      getEdges: vi.fn(() => []),
      addEdge: vi.fn(),
      removeEdge: vi.fn(),
      getCellById: vi.fn(),
      on: vi.fn(),
      off: vi.fn()
    }

    // 创建模拟预览线管理器
    mockPreviewLineManager = {
      validateNodeConnections: vi.fn(() => ({
        isValid: true,
        totalNodes: 0,
        validNodes: 0,
        invalidNodes: 0,
        statistics: {
          totalNodes: 0,
          totalPreviewLines: 0,
          totalConnections: 0
        },
        details: []
      }))
    }

    // 创建PreviewLineSystem实例
    previewLineSystem = new PreviewLineSystem({
      graph: mockGraph,
      branchManager: null,
      layoutEngine: null,
      layoutEngineReady: true
    })

    // 手动设置预览线管理器
    previewLineSystem.previewLineManager = mockPreviewLineManager
    previewLineSystem.initialized = true
  })

  it('应该能够调用validateNodeConnections方法', () => {
    expect(typeof previewLineSystem.validateNodeConnections).toBe('function')
  })

  it('应该能够成功执行节点连接验证', () => {
    const result = previewLineSystem.validateNodeConnections(mockGraph)
    
    expect(result).toBeDefined()
    expect(result.isValid).toBe(true)
    expect(mockPreviewLineManager.validateNodeConnections).toHaveBeenCalledWith(mockGraph, {})
  })

  it('应该在预览线管理器未初始化时抛出错误', () => {
    previewLineSystem.previewLineManager = null
    
    expect(() => {
      previewLineSystem.validateNodeConnections(mockGraph)
    }).toThrow('预览线管理器未初始化，无法执行增强的节点连接线有效性检查')
  })

  it('应该在预览线管理器不支持validateNodeConnections时抛出错误', () => {
    previewLineSystem.previewLineManager = {}
    
    expect(() => {
      previewLineSystem.validateNodeConnections(mockGraph)
    }).toThrow('预览线管理器不支持增强的节点连接线有效性检查，无法继续执行')
  })

  it('应该能够传递验证选项', () => {
    const options = { verbose: true }
    previewLineSystem.validateNodeConnections(mockGraph, options)
    
    expect(mockPreviewLineManager.validateNodeConnections).toHaveBeenCalledWith(mockGraph, options)
  })

  it('应该在没有提供图实例时使用系统图实例', () => {
    previewLineSystem.validateNodeConnections()
    
    expect(mockPreviewLineManager.validateNodeConnections).toHaveBeenCalledWith(mockGraph, {})
  })

  it('应该在没有有效图实例时抛出错误', () => {
    previewLineSystem.graph = null
    
    expect(() => {
      previewLineSystem.validateNodeConnections()
    }).toThrow('未提供有效的图形实例进行验证')
  })
})