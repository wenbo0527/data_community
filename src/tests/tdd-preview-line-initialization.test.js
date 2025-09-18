import { describe, it, expect, beforeEach, vi } from 'vitest'
import { Graph } from '@antv/x6'
import UnifiedPreviewLineManager from '../utils/UnifiedPreviewLineManager.js'

/**
 * TDD测试：预览线初始化时机问题
 * 
 * 问题描述：
 * 1. 节点在未完成配置时就初始化预览线
 * 2. shouldNodeBeConfigured方法存在自动修复逻辑
 * 3. 所有预览线节点都必须在配置完成后才生成
 * 
 * 测试目标：
 * - 验证未配置节点不应生成预览线
 * - 验证自动修复逻辑应被移除
 * - 验证严格的配置检查逻辑
 */
describe('TDD: 预览线初始化时机修复', () => {
  let graph
  let previewLineManager
  let mockContainer

  beforeEach(() => {
    // 创建模拟容器
    mockContainer = document.createElement('div')
    mockContainer.style.width = '800px'
    mockContainer.style.height = '600px'
    document.body.appendChild(mockContainer)

    // 创建图实例
    graph = new Graph({
      container: mockContainer,
      width: 800,
      height: 600
    })

    // 创建预览线管理器实例
    previewLineManager = new UnifiedPreviewLineManager(
      graph,  // graph
      null,  // branchManager
      {},    // layoutConfig
      null   // layoutEngine
    )
  })

  afterEach(() => {
    if (graph) {
      graph.dispose()
    }
    if (mockContainer && mockContainer.parentNode) {
      mockContainer.parentNode.removeChild(mockContainer)
    }
  })

  describe('问题1: 未配置节点的预览线创建检查', () => {
    it('应该拒绝为未明确配置的audience-split节点创建预览线', () => {
      // 创建未配置的人群分流节点
      const node = graph.addNode({
        id: 'audience-split-1',
        x: 100,
        y: 100,
        data: {
          type: 'audience-split',
          isConfigured: false, // 明确标记为未配置
          config: {} // 空配置
        }
      })

      // 测试：shouldCreatePreviewLine应该返回false
      const shouldCreate = previewLineManager.shouldCreatePreviewLine(node)
      
      expect(shouldCreate).toBe(false)
      expect(node.getData().isConfigured).toBe(false) // 不应被自动修复
    })

    it('应该拒绝为未明确配置的sms节点创建预览线', () => {
      // 创建未配置的短信节点
      const node = graph.addNode({
        id: 'sms-1',
        x: 200,
        y: 100,
        data: {
          type: 'sms',
          isConfigured: false, // 明确标记为未配置
          config: {} // 空配置
        }
      })

      // 测试：shouldCreatePreviewLine应该返回false
      const shouldCreate = previewLineManager.shouldCreatePreviewLine(node)
      
      expect(shouldCreate).toBe(false)
      expect(node.getData().isConfigured).toBe(false) // 不应被自动修复
    })

    it('应该拒绝为未明确配置的ai-call节点创建预览线', () => {
      // 创建未配置的AI外呼节点
      const node = graph.addNode({
        id: 'ai-call-1',
        x: 300,
        y: 100,
        data: {
          type: 'ai-call',
          isConfigured: false, // 明确标记为未配置
          config: {} // 空配置
        }
      })

      // 测试：shouldCreatePreviewLine应该返回false
      const shouldCreate = previewLineManager.shouldCreatePreviewLine(node)
      
      expect(shouldCreate).toBe(false)
      expect(node.getData().isConfigured).toBe(false) // 不应被自动修复
    })
  })

  describe('问题2: 自动修复逻辑应被移除', () => {
    it('shouldNodeBeConfigured不应该自动修复audience-split节点的配置状态', () => {
      // 创建有配置但isConfigured为false的节点
      const nodeData = {
        type: 'audience-split',
        isConfigured: false,
        config: {
          crowdLayers: [
            { crowdName: '高价值用户', conditions: [] }
          ]
        }
      }

      // 当前的shouldNodeBeConfigured会自动修复，这是需要修复的问题
      const shouldBeConfigured = previewLineManager.shouldNodeBeConfigured(nodeData, 'audience-split')
      
      // 期望：不应该自动修复，应该严格检查isConfigured字段
      // 当前会失败，因为存在自动修复逻辑
      expect(shouldBeConfigured).toBe(false) // 这个测试会失败，证明存在自动修复问题
    })

    it('shouldNodeBeConfigured不应该自动修复sms节点的配置状态', () => {
      // 创建有配置但isConfigured为false的节点
      const nodeData = {
        type: 'sms',
        isConfigured: false,
        config: {
          template: '您好，这是一条测试短信',
          sendTime: '09:00'
        }
      }

      // 当前的shouldNodeBeConfigured会自动修复，这是需要修复的问题
      const shouldBeConfigured = previewLineManager.shouldNodeBeConfigured(nodeData, 'sms')
      
      // 期望：不应该自动修复，应该严格检查isConfigured字段
      // 当前会失败，因为存在自动修复逻辑
      expect(shouldBeConfigured).toBe(false) // 这个测试会失败，证明存在自动修复问题
    })
  })

  describe('问题3: 严格的配置检查逻辑', () => {
    it('只有明确标记为已配置的节点才应该创建预览线', () => {
      // 创建明确配置的节点
      const configuredNode = graph.addNode({
        id: 'sms-configured',
        x: 100,
        y: 200,
        data: {
          type: 'sms',
          isConfigured: true, // 明确标记为已配置
          config: {
            template: '您好，这是一条测试短信',
            sendTime: '09:00'
          }
        }
      })

      // 创建未明确配置的节点（即使有config内容）
      const unconfiguredNode = graph.addNode({
        id: 'sms-unconfigured',
        x: 200,
        y: 200,
        data: {
          type: 'sms',
          isConfigured: false, // 明确标记为未配置
          config: {
            template: '您好，这是一条测试短信',
            sendTime: '09:00'
          }
        }
      })

      // 测试：只有明确配置的节点应该创建预览线
      const shouldCreateConfigured = previewLineManager.shouldCreatePreviewLine(configuredNode)
      const shouldCreateUnconfigured = previewLineManager.shouldCreatePreviewLine(unconfiguredNode)
      
      expect(shouldCreateConfigured).toBe(true)
      expect(shouldCreateUnconfigured).toBe(false)
    })

    it('isConfigured字段缺失时应该视为未配置', () => {
      // 创建isConfigured字段缺失的节点
      const node = graph.addNode({
        id: 'sms-missing-flag',
        x: 300,
        y: 200,
        data: {
          type: 'sms',
          // isConfigured字段缺失
          config: {
            template: '您好，这是一条测试短信',
            sendTime: '09:00'
          }
        }
      })

      // 测试：isConfigured字段缺失应该视为未配置
      const shouldCreate = previewLineManager.shouldCreatePreviewLine(node)
      
      expect(shouldCreate).toBe(false)
    })
  })

  describe('问题4: 配置完成事件监听机制', () => {
    it('应该提供配置完成事件监听接口', () => {
      // 测试：预览线管理器应该提供配置完成事件监听方法
      expect(typeof previewLineManager.onNodeConfigured).toBe('function')
    })

    it('配置完成后应该触发预览线重新评估', () => {
      // 创建未配置的节点
      const node = graph.addNode({
        id: 'sms-to-configure',
        x: 100,
        y: 300,
        data: {
          type: 'sms',
          isConfigured: false,
          config: {}
        }
      })

      // 模拟配置完成事件
      const mockReevaluate = vi.spyOn(previewLineManager, 'reevaluateNodePreviewLines')
      
      // 触发配置完成事件
      previewLineManager.onNodeConfigured(node.id, {
        template: '您好，这是一条测试短信',
        sendTime: '09:00'
      })

      // 验证：应该触发预览线重新评估
      expect(mockReevaluate).toHaveBeenCalledWith(node.id)
    })
  })
})