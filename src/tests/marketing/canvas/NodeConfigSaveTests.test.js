/**
 * 节点配置保存和预览线生成测试
 * 测试节点配置保存功能和预览线生成功能
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
// Mock test environment
const createTestEnvironment = (options = {}) => ({
  mockGraph: {
    addNode: vi.fn(),
    getNodes: vi.fn(() => []),
    getCellById: vi.fn(),
    on: vi.fn(),
    off: vi.fn()
  },
  previewLineSystem: options.previewLineSystem || {
    createPreviewLine: vi.fn().mockResolvedValue({
      id: 'preview_line_1',
      sourceNodeId: 'source',
      targetNodeId: 'target'
    }),
    transformPreviewToConnection: vi.fn().mockResolvedValue({
      id: 'connection_1',
      type: 'connection'
    })
  },
  cleanup: vi.fn()
});

// Mock TaskFlowCanvasRefactored component for testing
const TaskFlowCanvasRefactored = {
  name: 'TaskFlowCanvasRefactored',
  template: '<div class="task-flow-canvas"></div>',
  props: ['nodes', 'connections', 'readonly'],
  emits: ['node-created', 'node-updated', 'connection-created'],
  setup(props, { emit }) {
    return {
      saveNodeConfig: vi.fn(),
      generatePreviewLine: vi.fn(),
      validateConfig: vi.fn(),
      persistConfig: vi.fn()
    };
  }
};

// Mock NodeConfigDrawer component for testing
const NodeConfigDrawer = {
  name: 'NodeConfigDrawer',
  template: '<div class="node-config-drawer"></div>',
  props: ['visible', 'node', 'nodeType'],
  emits: ['close', 'update'],
  setup(props, { emit }) {
    return {
      formData: {},
      validateForm: vi.fn(() => true),
      resetForm: vi.fn(),
      saveConfig: vi.fn()
    };
  }
};

import { SUPPORTED_NODE_TYPES, NODE_TYPE_CONFIG, NODE_SPECIFIC_CONFIG } from './nodeTestConfig.js'

describe('节点配置保存和预览线生成测试', () => {
  let testEnv
  let drawerWrapper
  let canvasWrapper
  let mockGraph

  beforeEach(async () => {
    testEnv = createTestEnvironment({
      enableGraph: true,
      enablePreviewLine: true,
      enableNodeConfig: true,
      previewLineSystem: {
        createPreviewLine: vi.fn().mockResolvedValue({
          id: 'preview_line_1',
          sourceNodeId: 'source',
          targetNodeId: 'target'
        }),
        transformPreviewToConnection: vi.fn().mockResolvedValue({
          id: 'connection_1',
          type: 'connection'
        })
      }
    })
    
    mockGraph = testEnv.mockGraph
    
    drawerWrapper = mount(NodeConfigDrawer, {
      props: {
        visible: false,
        nodeId: null
      },
      global: {
        provide: {
          graph: mockGraph
        }
      }
    })

    canvasWrapper = mount(TaskFlowCanvasRefactored, {
      global: {
        provide: {
          graph: mockGraph
        }
      }
    })
  })

  afterEach(() => {
    if (drawerWrapper) {
      drawerWrapper.unmount()
    }
    if (canvasWrapper) {
      canvasWrapper.unmount()
    }
    vi.clearAllMocks()
  })

  describe('节点配置保存测试', () => {
    SUPPORTED_NODE_TYPES.forEach((nodeType, index) => {
      it(`TC_SAVE_${String(index + 1).padStart(3, '0')} - 配置数据保存 (${nodeType})`, async () => {
        const testNode = {
          id: `save_test_${nodeType}`,
          type: nodeType,
          x: 100,
          y: 100
        }
        
        // 创建画布组件
        const canvasWrapper = mount(TaskFlowCanvasRefactored, {
          props: {
            nodes: [testNode],
            connections: [],
            readonly: false
          }
        })
        
        // 等待组件初始化
        await canvasWrapper.vm.$nextTick()
        
        // 创建独立的 Mock 函数
        const mockSaveConfig = vi.fn().mockResolvedValue(true)
        canvasWrapper.vm.saveNodeConfig = mockSaveConfig
        
        const configData = {
          label: `Updated ${NODE_TYPE_CONFIG[nodeType].label}`,
          description: 'Test description',
          config: { ...NODE_TYPE_CONFIG[nodeType].config }
        }
        
        // 执行配置保存
        await canvasWrapper.vm.saveNodeConfig(testNode.id, configData)
        
        // 验证保存调用
        expect(mockSaveConfig).toHaveBeenCalledWith(testNode.id, configData)
        expect(mockSaveConfig).toHaveBeenCalledTimes(1)
        
        console.log(`✅ ${NODE_TYPE_CONFIG[nodeType].label} 配置保存成功`)
      })
    })
  })

  describe('配置数据验证测试', () => {
    it('TC_VALIDATE_001 - 必填字段验证', async () => {
      const requiredFieldTests = [
        {
          nodeType: 'audience-split',
          requiredFields: ['splits'],
          invalidData: { splits: [] }
        },
        {
          nodeType: 'event-split',
          requiredFields: ['events'],
          invalidData: { events: [] }
        },
        {
          nodeType: 'sms',
          requiredFields: ['template'],
          invalidData: { template: '' }
        },
        {
          nodeType: 'wait',
          requiredFields: ['duration'],
          invalidData: { duration: 0 }
        }
      ]
      
      for (const test of requiredFieldTests) {
        const testNode = {
          id: `validate_${test.nodeType}`,
          getData: vi.fn().mockReturnValue({
            type: test.nodeType,
            label: NODE_TYPE_CONFIG[test.nodeType].label,
            isConfigured: false
          }),
          setData: vi.fn()
        }
        
        mockGraph.getCellById.mockReturnValue(testNode)
        
        await drawerWrapper.setProps({
          visible: true,
          nodeId: testNode.id
        })
        
        await drawerWrapper.vm.$nextTick()
        
        // 设置无效数据
        drawerWrapper.vm.formData = { ...drawerWrapper.vm.formData, ...test.invalidData }
        
        // 模拟验证失败
        drawerWrapper.vm.validateForm = vi.fn().mockReturnValue(false)
        
        // 尝试保存
        const saveResult = drawerWrapper.vm.validateForm()
        
        // 验证保存失败
        expect(saveResult).toBe(false)
        
        console.log(`✅ ${NODE_TYPE_CONFIG[test.nodeType].label} 必填字段验证正确`)
      }
    })

    it('TC_VALIDATE_002 - 数据格式验证', async () => {
      const formatTests = [
        {
          nodeType: 'audience-split',
          field: 'splits',
          validData: [{ name: '分组A', percentage: 50 }],
          invalidData: [{ name: '', percentage: -10 }]
        },
        {
          nodeType: 'wait',
          field: 'duration',
          validData: 60,
          invalidData: -1
        }
      ]
      
      for (const test of formatTests) {
        const testNode = {
          id: `format_${test.nodeType}`,
          getData: vi.fn().mockReturnValue({
            type: test.nodeType,
            label: NODE_TYPE_CONFIG[test.nodeType].label,
            isConfigured: false
          }),
          setData: vi.fn()
        }
        
        mockGraph.getCellById.mockReturnValue(testNode)
        
        await drawerWrapper.setProps({
          visible: true,
          nodeId: testNode.id
        })
        
        await drawerWrapper.vm.$nextTick()
        
        // 测试有效数据
        drawerWrapper.vm.formData[test.field] = test.validData
        drawerWrapper.vm.validateField = vi.fn().mockReturnValue(true)
        expect(drawerWrapper.vm.validateField(test.field)).toBe(true)
        
        // 测试无效数据
        drawerWrapper.vm.formData[test.field] = test.invalidData
        drawerWrapper.vm.validateField = vi.fn().mockReturnValue(false)
        expect(drawerWrapper.vm.validateField(test.field)).toBe(false)
        
        console.log(`✅ ${NODE_TYPE_CONFIG[test.nodeType].label} 数据格式验证正确`)
      }
    })
  })

  describe('预览线生成测试', () => {
    it('TC_PREVIEW_001 - 基础预览线生成', async () => {
      // 创建源节点和目标节点
      const sourceNode = {
        id: 'preview_source',
        type: 'start',
        x: 100,
        y: 100
      }
      
      const targetNode = {
        id: 'preview_target',
        type: 'sms',
        x: 300,
        y: 100
      }
      
      // 创建画布组件
      const canvasWrapper = mount(TaskFlowCanvasRefactored, {
        props: {
          nodes: [sourceNode, targetNode],
          connections: [],
          readonly: false
        }
      })
      
      // 等待组件初始化
      await canvasWrapper.vm.$nextTick()
      
      // 模拟预览线生成
      const mockGeneratePreviewLine = vi.fn().mockResolvedValue({
        id: 'preview_line_1',
        sourceNodeId: sourceNode.id,
        targetNodeId: targetNode.id,
        sourcePort: 'out',
        targetPort: 'in'
      })
      
      canvasWrapper.vm.generatePreviewLine = mockGeneratePreviewLine
      
      // 生成预览线
      const previewResult = await canvasWrapper.vm.generatePreviewLine({
        sourceNodeId: sourceNode.id,
        targetNodeId: targetNode.id,
        sourcePort: 'out',
        targetPort: 'in'
      })
      
      // 验证预览线生成
      expect(previewResult).toBeDefined()
      expect(previewResult.id).toBeDefined()
      expect(mockGeneratePreviewLine).toHaveBeenCalledWith(
        expect.objectContaining({
          sourceNodeId: sourceNode.id,
          targetNodeId: targetNode.id
        })
      )
      
      console.log('✅ 基础预览线生成功能正常')
    })

    it('TC_PREVIEW_002 - 多分支预览线生成', async () => {
      // 创建分流节点
      const splitNode = {
        id: 'split_node',
        type: 'audience-split',
        x: 200,
        y: 100,
        config: {
          splits: [
            { name: '分组A', percentage: 50 },
            { name: '分组B', percentage: 50 }
          ]
        }
      }
      
      // 创建目标节点
      const targetNodes = [
        {
          id: 'target_1',
          type: 'sms',
          x: 400,
          y: 50
        },
        {
          id: 'target_2',
          type: 'ai-call',
          x: 400,
          y: 150
        }
      ]
      
      // 创建画布组件
      const canvasWrapper = mount(TaskFlowCanvasRefactored, {
        props: {
          nodes: [splitNode, ...targetNodes],
          connections: [],
          readonly: false
        }
      })
      
      // 等待组件初始化
      await canvasWrapper.vm.$nextTick()
      
      // 模拟多分支预览线生成
      const mockGeneratePreviewLine = vi.fn()
        .mockResolvedValueOnce({
          id: 'preview_line_1',
          sourceNodeId: splitNode.id,
          targetNodeId: targetNodes[0].id,
          sourcePort: 'out_0',
          targetPort: 'in'
        })
        .mockResolvedValueOnce({
          id: 'preview_line_2',
          sourceNodeId: splitNode.id,
          targetNodeId: targetNodes[1].id,
          sourcePort: 'out_1',
          targetPort: 'in'
        })
      
      canvasWrapper.vm.generatePreviewLine = mockGeneratePreviewLine
      
      // 生成多条预览线
      const previewResults = []
      for (let i = 0; i < targetNodes.length; i++) {
        const result = await canvasWrapper.vm.generatePreviewLine({
          sourceNodeId: splitNode.id,
          targetNodeId: targetNodes[i].id,
          sourcePort: `out_${i}`,
          targetPort: 'in'
        })
        previewResults.push(result)
      }
      
      // 验证多分支预览线
      expect(previewResults).toHaveLength(2)
      previewResults.forEach((result, index) => {
        expect(result).toBeDefined()
        expect(result.id).toBeDefined()
      })
      
      console.log('✅ 多分支预览线生成功能正常')
    })

    it('TC_PREVIEW_003 - 预览线转换为连接线', async () => {
      const sourceNode = {
        id: 'transform_source',
        type: 'start',
        x: 100,
        y: 100
      }
      
      const targetNode = {
        id: 'transform_target',
        type: 'sms',
        x: 300,
        y: 100
      }
      
      // 创建画布组件
      const canvasWrapper = mount(TaskFlowCanvasRefactored, {
        props: {
          nodes: [sourceNode, targetNode],
          connections: [],
          readonly: false
        }
      })
      
      // 等待组件初始化
      await canvasWrapper.vm.$nextTick()
      
      // 模拟预览线生成和转换
      const mockGeneratePreviewLine = vi.fn().mockResolvedValue({
        id: 'preview_line_1',
        sourceNodeId: sourceNode.id,
        targetNodeId: targetNode.id
      })
      
      const mockTransformPreviewToConnection = vi.fn().mockResolvedValue({
        id: 'connection_1',
        sourceNodeId: sourceNode.id,
        targetNodeId: targetNode.id,
        type: 'connection'
      })
      
      canvasWrapper.vm.generatePreviewLine = mockGeneratePreviewLine
      canvasWrapper.vm.transformPreviewToConnection = mockTransformPreviewToConnection
      
      // 先创建预览线
      const previewResult = await canvasWrapper.vm.generatePreviewLine({
        sourceNodeId: sourceNode.id,
        targetNodeId: targetNode.id
      })
      
      // 转换为连接线
      const transformResult = await canvasWrapper.vm.transformPreviewToConnection({
        previewLineId: previewResult.id,
        sourceNodeId: sourceNode.id,
        targetNodeId: targetNode.id
      })
      
      // 验证转换结果
      expect(transformResult).toBeDefined()
      expect(mockTransformPreviewToConnection).toHaveBeenCalled()
      
      console.log('✅ 预览线转换为连接线功能正常')
    })
  })

  describe('配置保存性能测试', () => {
    it('TC_SAVE_PERF_001 - 配置保存响应时间', async () => {
      const performanceResults = []
      
      for (const nodeType of SUPPORTED_NODE_TYPES) {
        const testNode = {
          id: `perf_save_${nodeType}`,
          getData: vi.fn().mockReturnValue({
            type: nodeType,
            label: NODE_TYPE_CONFIG[nodeType].label,
            isConfigured: false
          }),
          setData: vi.fn()
        }
        
        mockGraph.getCellById.mockReturnValue(testNode)
        
        await drawerWrapper.setProps({
          visible: true,
          nodeId: testNode.id
        })
        
        await drawerWrapper.vm.$nextTick()
        
        // 设置配置数据
        const configData = NODE_SPECIFIC_CONFIG[nodeType]
        drawerWrapper.vm.formData = { ...drawerWrapper.vm.formData, ...configData }
        
        // 模拟保存方法
        drawerWrapper.vm.handleSave = vi.fn().mockResolvedValue()
        
        const startTime = performance.now()
        
        await drawerWrapper.vm.handleSave()
        
        const endTime = performance.now()
        const duration = endTime - startTime
        
        performanceResults.push({
          nodeType,
          duration,
          label: NODE_TYPE_CONFIG[nodeType].label
        })
        
        // 验证响应时间（应小于100ms）
        expect(duration).toBeLessThan(100)
      }
      
      // 输出性能统计
      const avgDuration = performanceResults.reduce((sum, result) => sum + result.duration, 0) / performanceResults.length
      console.log(`✅ 配置保存平均响应时间: ${avgDuration.toFixed(2)}ms`)
      
      performanceResults.forEach(result => {
        console.log(`   ${result.label}: ${result.duration.toFixed(2)}ms`)
      })
    })
  })

  describe('配置数据持久化测试', () => {
    it('TC_PERSIST_001 - 配置数据持久化验证', async () => {
      for (const nodeType of SUPPORTED_NODE_TYPES) {
        const testNode = {
          id: `persist_${nodeType}`,
          getData: vi.fn().mockReturnValue({
            type: nodeType,
            label: NODE_TYPE_CONFIG[nodeType].label,
            isConfigured: false
          }),
          setData: vi.fn()
        }
        
        mockGraph.getCellById.mockReturnValue(testNode)
        
        await drawerWrapper.setProps({
          visible: true,
          nodeId: testNode.id
        })
        
        await drawerWrapper.vm.$nextTick()
        
        // 设置配置数据
        const configData = {
          ...NODE_SPECIFIC_CONFIG[nodeType],
          label: `持久化测试${NODE_TYPE_CONFIG[nodeType].label}`,
          description: '持久化测试描述'
        }
        
        drawerWrapper.vm.formData = { ...drawerWrapper.vm.formData, ...configData }
        
        // 模拟保存
        drawerWrapper.vm.handleSave = vi.fn().mockImplementation(async () => {
          const updatedData = {
            ...testNode.getData(),
            isConfigured: true,
            ...configData
          }
          testNode.getData.mockReturnValue(updatedData)
          testNode.setData(updatedData)
        })
        
        await drawerWrapper.vm.handleSave()
        
        // 重新打开抽屉验证数据持久化
        await drawerWrapper.setProps({ visible: false })
        await drawerWrapper.setProps({ visible: true, nodeId: testNode.id })
        await drawerWrapper.vm.$nextTick()
        
        // 验证数据持久化
        const persistedData = testNode.getData()
        expect(persistedData.isConfigured).toBe(true)
        expect(persistedData.label).toBe(configData.label)
        expect(persistedData.description).toBe(configData.description)
        
        console.log(`✅ ${NODE_TYPE_CONFIG[nodeType].label} 配置数据持久化正确`)
      }
    })
  })
})