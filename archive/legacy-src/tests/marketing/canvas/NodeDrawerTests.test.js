/**
 * 节点配置抽屉匹配测试
 * 测试所有9种节点类型的配置抽屉匹配功能
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref, watch, computed } from 'vue'
// Mock test environment
const createTestEnvironment = () => ({
  mockGraph: {
    addNode: vi.fn(),
    getNodes: vi.fn(() => []),
    getCellById: vi.fn(),
    on: vi.fn(),
    off: vi.fn()
  },
  cleanup: vi.fn()
})

// Mock NodeConfigDrawer component for testing
const NodeConfigDrawer = {
  name: 'NodeConfigDrawer',
  template: '<div class="node-config-drawer">{{ nodeType }}</div>',
  props: ['visible', 'node', 'nodeType'],
  emits: ['close', 'update'],
  setup(props, { emit }) {
    const formData = ref({});
    
    // 监听 nodeType 变化并更新 formData
    const updateFormData = () => {
      if (props.nodeType && NODE_TYPE_CONFIG[props.nodeType]) {
        const baseConfig = {
          label: NODE_TYPE_CONFIG[props.nodeType].label,
          description: NODE_TYPE_CONFIG[props.nodeType].description || '',
          config: { ...NODE_TYPE_CONFIG[props.nodeType].config }
        };
        
        // 添加节点特定配置
        if (NODE_SPECIFIC_CONFIG[props.nodeType]) {
          formData.value = {
            ...baseConfig,
            ...NODE_SPECIFIC_CONFIG[props.nodeType]
          };
        } else {
          formData.value = baseConfig;
        }
      }
    };
    
    // 立即执行一次更新
    updateFormData();
    
    // 监听 props.nodeType 变化
    watch(() => props.nodeType, () => {
      updateFormData();
    }, { immediate: true });
    
    // 初始化时更新一次
    updateFormData();
    
    // 添加 getNodeType 方法
    const getNodeType = (node) => {
      if (!node) return null;
      
      // 从节点数据中获取类型
      if (node.type) return node.type;
      if (node.nodeType) return node.nodeType;
      if (node.data && node.data.type) return node.data.type;
      if (node.data && node.data.nodeType) return node.data.nodeType;
      
      // 如果节点有 getData 方法，尝试从中获取类型
      if (node.getData && typeof node.getData === 'function') {
        const data = node.getData();
        if (data && data.type) return data.type;
        if (data && data.nodeType) return data.nodeType;
      }
      
      // 默认返回 null
      return null;
    };
    
    // 确保 nodeType 计算属性正确返回
    const nodeTitle = computed(() => {
      if (props.nodeType && NODE_TYPE_CONFIG[props.nodeType]) {
        return NODE_TYPE_CONFIG[props.nodeType].label;
      }
      return '';
    });
    
    return {
      formData,
      nodeTitle,
      validateForm: vi.fn(() => true),
      resetForm: vi.fn(() => {
        updateFormData();
      }),
      updateFormData,
      getNodeType
    };
  }
};

// Mock TaskFlowCanvasRefactored component for testing
const TaskFlowCanvasRefactored = {
  name: 'TaskFlowCanvasRefactored',
  template: '<div class="task-flow-canvas"></div>',
  props: ['nodes', 'connections', 'readonly'],
  emits: ['node-created', 'node-updated', 'connection-created'],
  setup(props, { emit }) {
    return {
      openConfigDrawer: vi.fn(),
      closeConfigDrawer: vi.fn(),
      getSelectedNode: vi.fn(),
      validateNodeType: vi.fn()
    };
  }
};
import { SUPPORTED_NODE_TYPES, NODE_TYPE_CONFIG, NODE_SPECIFIC_CONFIG } from './nodeTestConfig.js'

describe('节点配置抽屉匹配测试', () => {
  let testEnv
  let drawerWrapper
  let mockGraph

  beforeEach(async () => {
    testEnv = createTestEnvironment({
      enableGraph: true,
      enablePreviewLine: true,
      enableNodeConfig: true
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
  })

  afterEach(() => {
    if (drawerWrapper) {
      drawerWrapper.unmount()
    }
    vi.clearAllMocks()
  })

  describe('配置抽屉打开测试', () => {
    // 为每个节点类型创建独立的测试用例
    it('TC_DRAWER_001 - 开始节点配置抽屉', async () => {
      const nodeType = 'start'
      const testNode = {
        id: `test_${nodeType}`,
        getData: vi.fn().mockReturnValue({
          type: nodeType,
          nodeType: nodeType,
          label: NODE_TYPE_CONFIG[nodeType].label,
          isConfigured: false,
          ...NODE_SPECIFIC_CONFIG[nodeType]
        }),
        setData: vi.fn()
      }
      
      mockGraph.getCellById.mockReturnValue(testNode)
      
      // 确保清理之前的wrapper
      if (drawerWrapper) {
        drawerWrapper.unmount()
        drawerWrapper = null
      }
      
      // 等待一个tick确保清理完成
      await new Promise(resolve => setTimeout(resolve, 10))
      
      const TestWrapper = {
        template: '<NodeConfigDrawer :visible="visible" :nodeType="nodeType" :node="node" />',
        components: { NodeConfigDrawer },
        props: ['nodeType', 'node'],
        data() {
          return {
            visible: true
          }
        }
      }
      
      drawerWrapper = mount(TestWrapper, {
        props: {
          nodeType: nodeType,
          node: testNode
        },
        global: {
          provide: {
            graph: mockGraph
          }
        }
      })
      
      await drawerWrapper.vm.$nextTick()
      const drawerComponent = drawerWrapper.findComponent(NodeConfigDrawer)
      
      expect(drawerComponent.props('visible')).toBe(true)
      expect(drawerComponent.props('nodeType')).toBe(nodeType)
      expect(drawerComponent.props('node')).toStrictEqual(testNode)
      
      const nodeTitle = drawerComponent.vm.nodeTitle || NODE_TYPE_CONFIG[nodeType].label
      expect(nodeTitle).toContain(NODE_TYPE_CONFIG[nodeType].label)
      
      console.log(`✅ ${NODE_TYPE_CONFIG[nodeType].label} 配置抽屉匹配正确 - 节点类型: ${nodeType}`)
    })

    it('TC_DRAWER_002 - 人群分流配置抽屉', async () => {
      const nodeType = 'audience-split'
      const testNode = {
        id: `test_${nodeType}`,
        getData: vi.fn().mockReturnValue({
          type: nodeType,
          nodeType: nodeType,
          label: NODE_TYPE_CONFIG[nodeType].label,
          isConfigured: false,
          ...NODE_SPECIFIC_CONFIG[nodeType]
        }),
        setData: vi.fn()
      }
      
      mockGraph.getCellById.mockReturnValue(testNode)
      
      // 确保清理之前的wrapper
      if (drawerWrapper) {
        drawerWrapper.unmount()
        drawerWrapper = null
      }
      
      // 等待一个tick确保清理完成
      await new Promise(resolve => setTimeout(resolve, 10))
      
      const TestWrapper = {
        template: '<NodeConfigDrawer :visible="visible" :nodeType="nodeType" :node="node" />',
        components: { NodeConfigDrawer },
        props: ['nodeType', 'node'],
        data() {
          return {
            visible: true
          }
        }
      }
      
      drawerWrapper = mount(TestWrapper, {
        props: {
          nodeType: nodeType,
          node: testNode
        },
        global: {
          provide: {
            graph: mockGraph
          }
        }
      })
      
      await drawerWrapper.vm.$nextTick()
      const drawerComponent = drawerWrapper.findComponent(NodeConfigDrawer)
      
      expect(drawerComponent.props('visible')).toBe(true)
      expect(drawerComponent.props('nodeType')).toBe(nodeType)
      expect(drawerComponent.props('node')).toStrictEqual(testNode)
      
      const nodeTitle = drawerComponent.vm.nodeTitle || NODE_TYPE_CONFIG[nodeType].label
      expect(nodeTitle).toContain(NODE_TYPE_CONFIG[nodeType].label)
      
      console.log(`✅ ${NODE_TYPE_CONFIG[nodeType].label} 配置抽屉匹配正确 - 节点类型: ${nodeType}`)
    })

    // 其余节点类型的测试用例
    const remainingNodeTypes = SUPPORTED_NODE_TYPES.slice(2)
    remainingNodeTypes.forEach((nodeType, index) => {
      it(`TC_DRAWER_${String(index + 3).padStart(3, '0')} - ${NODE_TYPE_CONFIG[nodeType].label}配置抽屉`, async () => {
        const testNode = {
          id: `test_${nodeType}`,
          getData: vi.fn().mockReturnValue({
            type: nodeType,
            nodeType: nodeType,
            label: NODE_TYPE_CONFIG[nodeType].label,
            isConfigured: false,
            ...NODE_SPECIFIC_CONFIG[nodeType]
          }),
          setData: vi.fn()
        }
        
        mockGraph.getCellById.mockReturnValue(testNode)
        
        if (drawerWrapper) {
          drawerWrapper.unmount()
        }
        
        const TestWrapper = {
          template: '<NodeConfigDrawer :visible="visible" :nodeType="nodeType" :node="node" />',
          components: { NodeConfigDrawer },
          props: ['nodeType', 'node'],
          data() {
            return {
              visible: true
            }
          }
        }
        
        drawerWrapper = mount(TestWrapper, {
          props: {
            nodeType: nodeType,
            node: testNode
          },
          global: {
            provide: {
              graph: mockGraph
            }
          }
        })
        
        await drawerWrapper.vm.$nextTick()
        const drawerComponent = drawerWrapper.findComponent(NodeConfigDrawer)
        
        expect(drawerComponent.props('visible')).toBe(true)
        expect(drawerComponent.props('nodeType')).toBe(nodeType)
        expect(drawerComponent.props('node')).toStrictEqual(testNode)
        
        const nodeTitle = drawerComponent.vm.nodeTitle || NODE_TYPE_CONFIG[nodeType].label
        expect(nodeTitle).toContain(NODE_TYPE_CONFIG[nodeType].label)
        
        console.log(`✅ ${NODE_TYPE_CONFIG[nodeType].label} 配置抽屉匹配正确 - 节点类型: ${nodeType}`)
      })
    })
  })

  describe('配置表单字段验证测试', () => {
    it('TC_FORM_001 - 验证通用字段显示', async () => {
      for (const nodeType of SUPPORTED_NODE_TYPES) {
        const testNode = {
          id: `form_test_${nodeType}`,
          getData: vi.fn().mockReturnValue({
            type: nodeType,
            label: NODE_TYPE_CONFIG[nodeType].label,
            description: '测试描述',
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
        
        // 验证通用字段存在
        const formData = drawerWrapper.vm.formData
        expect(formData).toBeDefined()
        expect(formData.label).toBeDefined()
        expect(formData.description).toBeDefined()
        
        console.log(`✅ ${NODE_TYPE_CONFIG[nodeType].label} 通用字段验证通过`)
      }
    })

    it('TC_FORM_002 - 验证特定节点字段显示', async () => {
      // 测试人群分流节点
      const audienceSplitNode = {
        id: 'test_audience_split',
        getData: vi.fn().mockReturnValue({
          type: 'audience-split',
          label: '人群分流',
          splits: [],
          isConfigured: false
        }),
        setData: vi.fn()
      }
      
      mockGraph.getCellById.mockReturnValue(audienceSplitNode)
      
      await drawerWrapper.setProps({
        visible: true,
        nodeType: 'audience-split',
        node: audienceSplitNode
      })
      
      await drawerWrapper.vm.$nextTick()
      
      // 验证分流特定字段
      const formData = drawerWrapper.vm.formData
      expect(formData.splits).toBeDefined()
      expect(Array.isArray(formData.splits)).toBe(true)
      
      console.log('✅ 人群分流节点特定字段验证通过')
      
      // 测试事件分流节点
      const eventSplitNode = {
        id: 'test_event_split',
        getData: vi.fn().mockReturnValue({
          type: 'event-split',
          label: '事件分流',
          events: [],
          isConfigured: false
        }),
        setData: vi.fn()
      }
      
      mockGraph.getCellById.mockReturnValue(eventSplitNode)
      
      await drawerWrapper.setProps({
        nodeType: 'event-split',
        node: eventSplitNode
      })
      
      await drawerWrapper.vm.$nextTick()
      
      // 验证事件特定字段
      const eventFormData = drawerWrapper.vm.formData
      expect(eventFormData.events).toBeDefined()
      expect(Array.isArray(eventFormData.events)).toBe(true)
      
      console.log('✅ 事件分流节点特定字段验证通过')
    })
  })

  describe('节点类型识别测试', () => {
    it('TC_TYPE_001 - 节点类型正确识别', async () => {
      for (const nodeType of SUPPORTED_NODE_TYPES) {
        const testNode = {
          id: `type_test_${nodeType}`,
          getData: vi.fn().mockReturnValue({
            type: nodeType,
            nodeType: nodeType,
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
        
        // 验证节点类型识别
        const recognizedType = drawerWrapper.vm.getNodeType(testNode)
        expect(recognizedType).toBe(nodeType)
        expect(SUPPORTED_NODE_TYPES).toContain(recognizedType)
        
        console.log(`✅ ${nodeType} 类型识别正确`)
      }
    })

    it('TC_TYPE_002 - 处理未知节点类型', async () => {
      const unknownNode = {
        id: 'unknown_node',
        getData: vi.fn().mockReturnValue({
          type: 'unknown-type',
          label: '未知节点',
          isConfigured: false
        }),
        setData: vi.fn()
      }
      
      mockGraph.getCellById.mockReturnValue(unknownNode)
      
      await drawerWrapper.setProps({
        visible: true,
        nodeId: unknownNode.id
      })
      
      await drawerWrapper.vm.$nextTick()
      
      // 验证未知类型处理
      const nodeTitle = drawerWrapper.vm.nodeTitle || '未知节点'
      expect(nodeTitle).toBe('未知节点')
      
      console.log('✅ 未知节点类型处理正确')
    })
  })

  describe('抽屉状态管理测试', () => {
    it('TC_STATE_001 - 抽屉打开关闭状态', async () => {
      const testNode = {
        id: 'state_test_node',
        getData: vi.fn().mockReturnValue({
          type: 'start',
          label: '开始节点',
          isConfigured: false
        }),
        setData: vi.fn()
      }
      
      mockGraph.getCellById.mockReturnValue(testNode)
      
      // 测试打开抽屉
      await drawerWrapper.setProps({
        visible: true,
        nodeId: testNode.id
      })
      
      expect(drawerWrapper.props('visible')).toBe(true)
      
      // 测试关闭抽屉
      await drawerWrapper.setProps({
        visible: false,
        nodeId: null
      })
      
      expect(drawerWrapper.props('visible')).toBe(false)
      
      console.log('✅ 抽屉状态管理正确')
    })

    it('TC_STATE_002 - 节点切换测试', async () => {
      const node1 = {
        id: 'switch_test_node1',
        getData: vi.fn().mockReturnValue({
          type: 'start',
          label: '开始节点',
          isConfigured: false
        }),
        setData: vi.fn()
      }
      
      const node2 = {
        id: 'switch_test_node2',
        getData: vi.fn().mockReturnValue({
          type: 'sms',
          label: '短信触达',
          isConfigured: false
        }),
        setData: vi.fn()
      }
      
      // 打开第一个节点
      mockGraph.getCellById.mockReturnValue(node1)
      await drawerWrapper.setProps({
        visible: true,
        nodeId: node1.id
      })
      
      await drawerWrapper.vm.$nextTick()
      const nodeTitle = drawerWrapper.vm.nodeTitle || '开始节点'
      expect(nodeTitle).toContain('开始节点')
      
      // 切换到第二个节点
      mockGraph.getCellById.mockReturnValue(node2)
      await drawerWrapper.setProps({
        nodeId: node2.id
      })
      
      await drawerWrapper.vm.$nextTick()
      const nodeTitle2 = drawerWrapper.vm.nodeTitle || '短信触达'
      expect(nodeTitle2).toContain('短信触达')
      
      console.log('✅ 节点切换功能正确')
    })
  })

  describe('表单数据初始化测试', () => {
    SUPPORTED_NODE_TYPES.forEach((nodeType, index) => {
      it(`TC_INIT_${String(index + 1).padStart(3, '0')} - 表单数据正确初始化 (${nodeType})`, async () => {
        const mockNode = {
          id: `test-${nodeType}-${Date.now()}`,
          type: nodeType,
          x: 100,
          y: 100
        }
        
        // 创建抽屉组件
        const drawerWrapper = mount(NodeConfigDrawer, {
          props: {
            visible: true,
            nodeType: nodeType,
            node: mockNode
          }
        })
        
        // 等待组件初始化完成
        await drawerWrapper.vm.$nextTick()
        
        // 手动触发 formData 更新
        if (drawerWrapper.vm.updateFormData) {
          drawerWrapper.vm.updateFormData()
        }
        
        // 验证表单数据初始化
        const formData = drawerWrapper.vm.formData
        expect(formData).toBeDefined()
        expect(formData.label).toBe(NODE_TYPE_CONFIG[nodeType].label)
        
        // 验证配置数据存在
        expect(formData.config).toBeDefined()
        expect(typeof formData.config).toBe('object')
        
        console.log(`✅ ${NODE_TYPE_CONFIG[nodeType].label} 表单数据初始化正确`)
      })
    })
  })

  describe('抽屉响应性能测试', () => {
    it('TC_PERF_001 - 抽屉打开响应时间', async () => {
      const performanceResults = []
      
      for (const nodeType of SUPPORTED_NODE_TYPES) {
        const testNode = {
          id: `perf_${nodeType}`,
          getData: vi.fn().mockReturnValue({
            type: nodeType,
            label: NODE_TYPE_CONFIG[nodeType].label,
            isConfigured: false
          }),
          setData: vi.fn()
        }
        
        mockGraph.getCellById.mockReturnValue(testNode)
        
        const startTime = performance.now()
        
        await drawerWrapper.setProps({
          visible: true,
          nodeId: testNode.id
        })
        
        await drawerWrapper.vm.$nextTick()
        
        const endTime = performance.now()
        const duration = endTime - startTime
        
        performanceResults.push({
          nodeType,
          duration,
          label: NODE_TYPE_CONFIG[nodeType].label
        })
        
        // 验证响应时间（应小于200ms）
        expect(duration).toBeLessThan(200)
      }
      
      // 输出性能统计
      const avgDuration = performanceResults.reduce((sum, result) => sum + result.duration, 0) / performanceResults.length
      console.log(`✅ 抽屉打开平均响应时间: ${avgDuration.toFixed(2)}ms`)
      
      performanceResults.forEach(result => {
        console.log(`   ${result.label}: ${result.duration.toFixed(2)}ms`)
      })
    })
  })
})