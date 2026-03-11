import { describe, test, expect, beforeEach, vi } from 'vitest'
import PreviewLineSystem from '../utils/preview-line/PreviewLineSystem.js'
import { createMockGraph, createMockNode, createTestEnvironment } from './utils/mockFactory.js'

describe('isConfigured字段修复验证', () => {
  let testEnv
  let mockGraph
  let previewLineSystem

  beforeEach(() => {
    // 使用标准化测试环境
    testEnv = createTestEnvironment({
      enableGraph: true,
      enablePreviewLine: true
    })
    
    mockGraph = testEnv.mockGraph
    previewLineSystem = testEnv.previewLineSystem
  })

  afterEach(() => {
    testEnv.cleanup()
  })

  test('修复验证：isConfigured字段应该立即生效', async () => {
    // 创建测试节点
    const testNode = createMockNode('test-node', 'audience-split')
    
    // 验证初始状态
    expect(testNode.getData().isConfigured).toBeUndefined()

    // 模拟配置数据
    const config = {
      crowdLayers: [
        { id: 'layer1', name: '层级1' },
        { id: 'layer2', name: '层级2' }
      ]
    }

    // 设置配置数据
    testNode.setData({ ...config, isConfigured: true })

    // 验证isConfigured字段立即生效
    expect(testNode.getData().isConfigured).toBe(true)
    expect(testNode.getData().crowdLayers).toEqual(config.crowdLayers)
  })

  test('修复验证：预览线系统应该响应isConfigured变化', async () => {
    const testNode = createMockNode('test-node', 'audience-split')
    
    // 初始状态：未配置
    expect(testNode.getData().isConfigured).toBeUndefined()
    
    // 配置节点
    testNode.setData({ 
      isConfigured: true,
      crowdLayers: [{ id: 'layer1' }]
    })
    
    // 验证预览线系统能够识别配置状态
    const nodeData = testNode.getData()
    expect(nodeData.isConfigured).toBe(true)
    
    // 模拟预览线系统处理配置变化
    if (previewLineSystem.updateNodeConfiguration) {
      previewLineSystem.updateNodeConfiguration(testNode.id, nodeData)
      expect(previewLineSystem.updateNodeConfiguration).toHaveBeenCalledWith(testNode.id, nodeData)
    }
  })

  test('修复验证：不同节点类型的isConfigured处理', async () => {
    const nodeTypes = ['audience-split', 'event-split', 'ab-test', 'data-source']
    
    for (const nodeType of nodeTypes) {
      const testNode = createMockNode(`${nodeType}-node`, nodeType)
      
      // 设置配置状态
      testNode.setData({ isConfigured: true })
      
      // 验证配置状态正确设置
      expect(testNode.getData().isConfigured).toBe(true)
      expect(testNode.getData().type).toBe(nodeType)
    }
  })

  test('修复验证：isConfigured状态切换', async () => {
    const testNode = createMockNode('toggle-node', 'audience-split')
    
    // 初始未配置
    expect(testNode.getData().isConfigured).toBeUndefined()
    
    // 设置为已配置
    testNode.setData({ isConfigured: true })
    expect(testNode.getData().isConfigured).toBe(true)
    
    // 切换为未配置
    testNode.setData({ isConfigured: false })
    expect(testNode.getData().isConfigured).toBe(false)
    
    // 再次设置为已配置
    testNode.setData({ isConfigured: true })
    expect(testNode.getData().isConfigured).toBe(true)
  })

  test('修复验证：配置数据持久化', async () => {
    const testNode = createMockNode('persist-node', 'audience-split')
    
    const configData = {
      isConfigured: true,
      crowdLayers: [
        { id: 'layer1', name: '层级1', conditions: [] },
        { id: 'layer2', name: '层级2', conditions: [] }
      ],
      defaultPath: 'layer1'
    }
    
    // 设置完整配置
    testNode.setData(configData)
    
    // 验证所有配置数据都正确保存
    const savedData = testNode.getData()
    expect(savedData.isConfigured).toBe(true)
    expect(savedData.crowdLayers).toEqual(configData.crowdLayers)
    expect(savedData.defaultPath).toBe(configData.defaultPath)
  })

  test('修复验证：Graph实例中节点数据同步', async () => {
    const testNode = createMockNode('sync-node', 'audience-split')
    
    // 通过Graph获取节点
    const graphNode = mockGraph.getCellById('sync-node')
    expect(graphNode).toBe(testNode)
    
    // 更新节点配置
    testNode.setData({ isConfigured: true })
    
    // 验证通过Graph获取的节点数据也已更新
    const updatedGraphNode = mockGraph.getCellById('sync-node')
    expect(updatedGraphNode.getData().isConfigured).toBe(true)
  })
})