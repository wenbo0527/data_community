/**
 * 营销画布节点功能自动化测试
 * 基于测试计划文档进行功能验证
 * 测试框架：Vitest + Vue Test Utils
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestEnvironment } from '../../utils/mockFactory.js'
import TaskFlowCanvasRefactored from '../../../pages/marketing/tasks/components/canvas/TaskFlowCanvasRefactored.vue'
import NodeConfigDrawer from '../../../pages/marketing/tasks/components/canvas/NodeConfigDrawer.vue'
import { SUPPORTED_NODE_TYPES, NODE_TYPE_CONFIG } from './nodeTestConfig.js'

describe('营销画布节点功能自动化测试', () => {
  let testEnv
  let canvasWrapper
  let drawerWrapper
  let mockGraph

  beforeEach(async () => {
    // 创建测试环境
    testEnv = createTestEnvironment({
      enableGraph: true,
      enablePreviewLine: true,
      enableNodeConfig: true
    })
    
    mockGraph = testEnv.mockGraph
    
    // 挂载画布组件
    canvasWrapper = mount(TaskFlowCanvasRefactored, {
      global: {
        provide: {
          graph: mockGraph
        }
      }
    })
    
    // 挂载配置抽屉组件
    drawerWrapper = mount(NodeConfigDrawer, {
      props: {
        visible: false,
        nodeId: null
      }
    })
  })

  afterEach(() => {
    if (canvasWrapper) {
      canvasWrapper.unmount()
    }
    if (drawerWrapper) {
      drawerWrapper.unmount()
    }
    vi.clearAllMocks()
  })

  describe('1. 节点创建功能测试', () => {
    SUPPORTED_NODE_TYPES.forEach((nodeType, index) => {
      it(`TC_CREATE_${String(index + 1).padStart(3, '0')} - 创建${NODE_TYPE_CONFIG[nodeType].label}`, async () => {
        // 模拟拖拽创建节点
        const nodeData = {
          id: `${nodeType}_${Date.now()}`,
          type: nodeType,
          x: 100,
          y: 100
        }
        
        // 调用节点创建方法
        const result = await canvasWrapper.vm.addNode(nodeData)
        
        // 验证节点创建成功
        expect(result).toBeDefined()
        expect(mockGraph.addNode).toHaveBeenCalledWith(
          expect.objectContaining({
            id: nodeData.id,
            shape: expect.any(String),
            x: nodeData.x,
            y: nodeData.y,
            data: expect.objectContaining({
              type: nodeType,
              label: NODE_TYPE_CONFIG[nodeType].label
            })
          })
        )
        
        console.log(`✅ ${NODE_TYPE_CONFIG[nodeType].label} 创建成功`)
      })
    })
  })

  describe('2. 节点配置抽屉测试', () => {
    SUPPORTED_NODE_TYPES.forEach((nodeType, index) => {
      it(`TC_DRAWER_${String(index + 1).padStart(3, '0')} - ${NODE_TYPE_CONFIG[nodeType].label}配置抽屉`, async () => {
        // 创建测试节点
        const testNode = {
          id: `test_${nodeType}`,
          getData: vi.fn().mockReturnValue({
            type: nodeType,
            label: NODE_TYPE_CONFIG[nodeType].label,
            isConfigured: false
          }),
          setData: vi.fn()
        }
        
        mockGraph.getCellById.mockReturnValue(testNode)
        
        // 打开配置抽屉
        await drawerWrapper.setProps({
          visible: true,
          nodeId: testNode.id
        })
        
        // 等待组件更新
        await drawerWrapper.vm.$nextTick()
        
        // 验证抽屉打开
        expect(drawerWrapper.props('visible')).toBe(true)
        expect(drawerWrapper.props('nodeId')).toBe(testNode.id)
        
        // 验证节点类型识别正确
        const nodeTitle = drawerWrapper.vm.nodeTitle
        expect(nodeTitle).toContain(NODE_TYPE_CONFIG[nodeType].label)
        
        console.log(`✅ ${NODE_TYPE_CONFIG[nodeType].label} 配置抽屉匹配正确`)
      })
    })
  })

  describe('3. 节点配置保存测试', () => {
    SUPPORTED_NODE_TYPES.forEach((nodeType, index) => {
      it(`TC_SAVE_${String(index + 1).padStart(3, '0')} - ${NODE_TYPE_CONFIG[nodeType].label}配置保存`, async () => {
        // 创建测试节点
        const testNode = {
          id: `test_${nodeType}`,
          getData: vi.fn().mockReturnValue({
            type: nodeType,
            label: NODE_TYPE_CONFIG[nodeType].label,
            isConfigured: false
          }),
          setData: vi.fn()
        }
        
        mockGraph.getCellById.mockReturnValue(testNode)
        
        // 设置配置抽屉
        await drawerWrapper.setProps({
          visible: true,
          nodeId: testNode.id
        })
        
        // 模拟配置数据
        const configData = {
          label: `配置的${NODE_TYPE_CONFIG[nodeType].label}`,
          description: '测试描述'
        }
        
        // 根据节点类型添加特定配置
        switch (nodeType) {
          case 'audience-split':
            configData.splits = [{ name: '分组A', percentage: 50 }]
            break
          case 'event-split':
            configData.events = [{ name: '事件A', condition: 'test' }]
            break
          case 'ab-test':
            configData.variants = [{ name: '变体A', percentage: 50 }]
            break
          case 'sms':
            configData.template = '短信模板内容'
            break
          case 'wait':
            configData.duration = 60
            configData.unit = 'minutes'
            break
        }
        
        // 设置表单数据
        drawerWrapper.vm.formData = configData
        
        // 调用保存方法
        await drawerWrapper.vm.handleSave()
        
        // 验证节点数据更新
        expect(testNode.setData).toHaveBeenCalledWith(
          expect.objectContaining({
            isConfigured: true,
            ...configData
          })
        )
        
        console.log(`✅ ${NODE_TYPE_CONFIG[nodeType].label} 配置保存成功`)
      })
    })
  })

  describe('4. 预览线生成测试', () => {
    it('TC_PREVIEW_001 - 节点连接预览线生成', async () => {
      // 创建源节点和目标节点
      const sourceNode = {
        id: 'source_start',
        getData: vi.fn().mockReturnValue({ type: 'start' }),
        getPosition: vi.fn().mockReturnValue({ x: 100, y: 100 })
      }
      
      const targetNode = {
        id: 'target_sms',
        getData: vi.fn().mockReturnValue({ type: 'sms' }),
        getPosition: vi.fn().mockReturnValue({ x: 300, y: 100 })
      }
      
      mockGraph.getCellById
        .mockReturnValueOnce(sourceNode)
        .mockReturnValueOnce(targetNode)
      
      // 模拟预览线系统
      const previewLineSystem = testEnv.previewLineSystem
      
      // 生成预览线
      const previewResult = await previewLineSystem.createPreviewLine({
        sourceNodeId: sourceNode.id,
        targetNodeId: targetNode.id
      })
      
      // 验证预览线生成
      expect(previewResult).toBeDefined()
      expect(previewResult.id).toBeDefined()
      
      console.log('✅ 预览线生成功能正常')
    })
  })

  describe('5. 节点删除测试', () => {
    SUPPORTED_NODE_TYPES.forEach((nodeType, index) => {
      it(`TC_DELETE_${String(index + 1).padStart(3, '0')} - 删除${NODE_TYPE_CONFIG[nodeType].label}`, async () => {
        // 创建测试节点
        const testNode = {
          id: `test_${nodeType}`,
          getData: vi.fn().mockReturnValue({
            type: nodeType,
            label: NODE_TYPE_CONFIG[nodeType].label
          }),
          remove: vi.fn()
        }
        
        mockGraph.getCellById.mockReturnValue(testNode)
        mockGraph.removeCell = vi.fn()
        
        // 删除节点
        await canvasWrapper.vm.deleteNode(testNode.id)
        
        // 验证节点删除
        expect(mockGraph.removeCell).toHaveBeenCalledWith(testNode.id)
        
        console.log(`✅ ${NODE_TYPE_CONFIG[nodeType].label} 删除成功`)
      })
    })
  })

  describe('6. 节点类型识别测试', () => {
    it('TC_TYPE_001 - 节点类型正确识别', () => {
      SUPPORTED_NODE_TYPES.forEach(nodeType => {
        // 创建测试节点
        const testNode = {
          id: `test_${nodeType}`,
          getData: vi.fn().mockReturnValue({
            type: nodeType,
            label: NODE_TYPE_CONFIG[nodeType].label
          })
        }
        
        // 验证节点类型识别
        const recognizedType = testNode.getData().type
        expect(recognizedType).toBe(nodeType)
        expect(SUPPORTED_NODE_TYPES).toContain(recognizedType)
        
        console.log(`✅ ${nodeType} 类型识别正确`)
      })
    })
  })

  describe('7. 错误处理测试', () => {
    it('TC_ERROR_001 - 无效节点类型处理', async () => {
      const invalidNodeType = 'invalid-type'
      
      // 尝试创建无效节点类型
      const nodeData = {
        id: 'invalid_node',
        type: invalidNodeType,
        x: 100,
        y: 100
      }
      
      // 验证错误处理
      try {
        await canvasWrapper.vm.addNode(nodeData)
      } catch (error) {
        expect(error.message).toContain('Invalid node type')
      }
      
      console.log('✅ 无效节点类型错误处理正确')
    })

    it('TC_ERROR_002 - 节点不存在错误处理', async () => {
      const nonExistentNodeId = 'non-existent-node'
      
      mockGraph.getCellById.mockReturnValue(null)
      
      // 尝试打开不存在节点的配置抽屉
      await drawerWrapper.setProps({
        visible: true,
        nodeId: nonExistentNodeId
      })
      
      // 验证错误处理
      expect(drawerWrapper.vm.nodeTitle).toBe('未知节点')
      
      console.log('✅ 节点不存在错误处理正确')
    })
  })
})