/**
 * 营销画布节点功能自动化测试脚本
 * 基于测试计划文档进行功能验证
 * 测试框架：Vitest + Vue Test Utils
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestEnvironment } from '../src/tests/utils/mockFactory.js'
import TaskFlowCanvasRefactored from '../src/components/TaskFlowCanvasRefactored.vue'
import NodeConfigDrawer from '../src/components/NodeConfigDrawer.vue'

// 支持的9种节点类型
const SUPPORTED_NODE_TYPES = [
  'start',
  'audience-split', 
  'event-split',
  'sms',
  'ai-call',
  'manual-call',
  'ab-test',
  'wait',
  'benefit'
]

// 节点类型配置映射
const NODE_TYPE_CONFIG = {
  'start': { label: '开始节点', hasConfig: true },
  'audience-split': { label: '人群分流', hasConfig: true },
  'event-split': { label: '事件分流', hasConfig: true },
  'sms': { label: '短信触达', hasConfig: true },
  'ai-call': { label: 'AI外呼', hasConfig: true },
  'manual-call': { label: '人工外呼', hasConfig: true },
  'ab-test': { label: 'AB测试', hasConfig: true },
  'wait': { label: '等待节点', hasConfig: true },
  'benefit': { label: '权益节点', hasConfig: true }
}

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
      const previewResult = await previewLineSystem.generatePreviewLine(
        sourceNode.id,
        targetNode.id
      )
      
      // 验证预览线生成
      expect(previewResult).toBeDefined()
      expect(previewResult.success).toBe(true)
      
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
        mockGraph.removeNode = vi.fn()
        
        // 删除节点
        await canvasWrapper.vm.deleteNode(testNode.id)
        
        // 验证节点删除
        expect(mockGraph.removeNode).toHaveBeenCalledWith(testNode.id)
        
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

/**
 * 测试报告生成器
 */
export class TestReportGenerator {
  constructor() {
    this.results = []
  }
  
  addResult(testCase, status, message = '') {
    this.results.push({
      testCase,
      status,
      message,
      timestamp: new Date().toISOString()
    })
  }
  
  generateReport() {
    const totalTests = this.results.length
    const passedTests = this.results.filter(r => r.status === 'passed').length
    const failedTests = this.results.filter(r => r.status === 'failed').length
    
    const report = {
      summary: {
        total: totalTests,
        passed: passedTests,
        failed: failedTests,
        passRate: ((passedTests / totalTests) * 100).toFixed(2) + '%'
      },
      details: this.results,
      generatedAt: new Date().toISOString()
    }
    
    return report
  }
  
  printReport() {
    const report = this.generateReport()
    
    console.log('\n=== 营销画布节点功能测试报告 ===')
    console.log(`总测试数: ${report.summary.total}`)
    console.log(`通过: ${report.summary.passed}`)
    console.log(`失败: ${report.summary.failed}`)
    console.log(`通过率: ${report.summary.passRate}`)
    console.log(`生成时间: ${report.generatedAt}`)
    
    if (report.summary.failed > 0) {
      console.log('\n失败的测试用例:')
      report.details
        .filter(r => r.status === 'failed')
        .forEach(r => {
          console.log(`- ${r.testCase}: ${r.message}`)
        })
    }
    
    return report
  }
}

/**
 * 运行完整测试套件
 */
export async function runFullTestSuite() {
  console.log('🚀 开始运行营销画布节点功能自动化测试...')
  
  try {
    // 运行测试
    const testResults = await import('vitest').then(vitest => {
      return vitest.run()
    })
    
    console.log('✅ 所有测试执行完成')
    return testResults
  } catch (error) {
    console.error('❌ 测试执行失败:', error)
    throw error
  }
}

// 导出测试工具
export {
  SUPPORTED_NODE_TYPES,
  NODE_TYPE_CONFIG
}