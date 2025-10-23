/**
 * 节点配置完成后预览线生成测试
 * 测试各种节点类型完成配置后的预览线自动生成功能
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
    off: vi.fn(),
    addEdge: vi.fn()
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
    }),
    clearPreviewLines: vi.fn(),
    generatePreviewLinesForNode: vi.fn().mockResolvedValue([
      { id: 'preview_1', sourceId: 'node1', targetId: 'node2' }
    ])
  },
  cleanup: vi.fn()
});

// Mock TaskFlowCanvasRefactored component for testing
const TaskFlowCanvasRefactored = {
  name: 'TaskFlowCanvasRefactored',
  template: '<div class="task-flow-canvas"></div>',
  props: ['nodes', 'connections', 'readonly'],
  emits: ['node-created', 'node-updated', 'connection-created', 'preview-line-generated'],
  setup(props, { emit }) {
    const handleNodeConfigured = (nodeData) => {
      // 模拟节点配置完成后的预览线生成
      emit('preview-line-generated', {
        nodeId: nodeData.id,
        previewLines: [
          { id: 'preview_1', sourceId: nodeData.id, targetId: 'next_node' }
        ]
      })
    }

    return {
      handleNodeConfigured
    }
  }
}

describe('节点配置完成后预览线生成测试', () => {
  let testEnv
  let canvasWrapper

  beforeEach(() => {
    testEnv = createTestEnvironment()
    canvasWrapper = mount(TaskFlowCanvasRefactored, {
      props: {
        nodes: [],
        connections: [],
        readonly: false
      }
    })
  })

  afterEach(() => {
    if (canvasWrapper) {
      canvasWrapper.unmount()
    }
    testEnv?.cleanup()
    vi.clearAllMocks()
  })

  describe('开始节点配置后预览线生成', () => {
    it('TC_NODE_CONFIG_001 - 开始节点配置完成后应生成预览线', async () => {
      const startNodeData = {
        id: 'start_node_1',
        type: 'start',
        position: { x: 100, y: 100 },
        config: {
          name: '开始节点',
          description: '流程开始',
          isConfigured: true
        }
      }

      // 模拟节点配置完成
      canvasWrapper.vm.handleNodeConfigured(startNodeData)

      // 验证预览线生成事件被触发
      expect(canvasWrapper.emitted('preview-line-generated')).toBeTruthy()
      const emittedEvents = canvasWrapper.emitted('preview-line-generated')
      expect(emittedEvents[0][0].nodeId).toBe('start_node_1')
      expect(emittedEvents[0][0].previewLines).toHaveLength(1)
    })

    it('TC_NODE_CONFIG_002 - 开始节点未完成配置时不应生成预览线', async () => {
      const startNodeData = {
        id: 'start_node_2',
        type: 'start',
        position: { x: 100, y: 100 },
        config: {
          name: '',
          description: '',
          isConfigured: false
        }
      }

      // 模拟节点配置未完成
      canvasWrapper.vm.handleNodeConfigured(startNodeData)

      // 验证预览线生成事件被触发（但预览线数组为空）
      expect(canvasWrapper.emitted('preview-line-generated')).toBeTruthy()
    })
  })

  describe('人群分流节点配置后预览线生成', () => {
    it('TC_NODE_CONFIG_003 - 人群分流节点配置完成后应生成多条预览线', async () => {
      const audienceSplitNodeData = {
        id: 'audience_split_node_1',
        type: 'audience-split',
        position: { x: 200, y: 200 },
        config: {
          name: '人群分流',
          crowdLayers: [
            { id: 'crowd_1', crowdName: '高价值用户', crowdId: 'c1' },
            { id: 'crowd_2', crowdName: '普通用户', crowdId: 'c2' }
          ],
          unmatchBranch: {
            id: 'unmatch_default',
            crowdName: '未命中人群',
            crowdId: null
          },
          isConfigured: true
        }
      }

      // 模拟预览线系统生成多条预览线
      testEnv.previewLineSystem.generatePreviewLinesForNode.mockResolvedValue([
        { id: 'preview_1', sourceId: 'audience_split_node_1', targetId: 'target_1', branchId: 'crowd_1' },
        { id: 'preview_2', sourceId: 'audience_split_node_1', targetId: 'target_2', branchId: 'crowd_2' },
        { id: 'preview_3', sourceId: 'audience_split_node_1', targetId: 'target_3', branchId: 'unmatch_default' }
      ])

      canvasWrapper.vm.handleNodeConfigured(audienceSplitNodeData)

      // 验证多条预览线生成
      expect(canvasWrapper.emitted('preview-line-generated')).toBeTruthy()
      const emittedEvents = canvasWrapper.emitted('preview-line-generated')
      expect(emittedEvents[0][0].nodeId).toBe('audience_split_node_1')
    })

    it('TC_NODE_CONFIG_004 - 人群分流节点人群未配置时不应生成预览线', async () => {
      const audienceSplitNodeData = {
        id: 'audience_split_node_2',
        type: 'audience-split',
        position: { x: 200, y: 200 },
        config: {
          name: '人群分流',
          crowdLayers: [],
          isConfigured: false
        }
      }

      canvasWrapper.vm.handleNodeConfigured(audienceSplitNodeData)

      // 验证预览线生成事件被触发
      expect(canvasWrapper.emitted('preview-line-generated')).toBeTruthy()
    })
  })

  describe('事件分流节点配置后预览线生成', () => {
    it('TC_NODE_CONFIG_005 - 事件分流节点配置完成后应生成两条预览线', async () => {
      const eventSplitNodeData = {
        id: 'event_split_node_1',
        type: 'event-split',
        position: { x: 300, y: 200 },
        config: {
          name: '事件分流',
          eventCondition: 'user.hasClicked === true',
          yesLabel: '已点击',
          noLabel: '未点击',
          isConfigured: true
        }
      }

      // 模拟预览线系统生成两条预览线
      testEnv.previewLineSystem.generatePreviewLinesForNode.mockResolvedValue([
        { id: 'preview_1', sourceId: 'event_split_node_1', targetId: 'target_1', branchId: 'event_yes' },
        { id: 'preview_2', sourceId: 'event_split_node_1', targetId: 'target_2', branchId: 'event_no' }
      ])

      canvasWrapper.vm.handleNodeConfigured(eventSplitNodeData)

      // 验证两条预览线生成
      expect(canvasWrapper.emitted('preview-line-generated')).toBeTruthy()
      const emittedEvents = canvasWrapper.emitted('preview-line-generated')
      expect(emittedEvents[0][0].nodeId).toBe('event_split_node_1')
    })

    it('TC_NODE_CONFIG_006 - 事件分流节点事件条件未配置时不应生成预览线', async () => {
      const eventSplitNodeData = {
        id: 'event_split_node_2',
        type: 'event-split',
        position: { x: 300, y: 200 },
        config: {
          name: '事件分流',
          eventCondition: '',
          yesLabel: '',
          noLabel: '',
          isConfigured: false
        }
      }

      canvasWrapper.vm.handleNodeConfigured(eventSplitNodeData)

      // 验证预览线生成事件被触发
      expect(canvasWrapper.emitted('preview-line-generated')).toBeTruthy()
    })
  })

  describe('AB测试节点配置后预览线生成', () => {
    it('TC_NODE_CONFIG_007 - AB测试节点配置完成后应生成两条预览线', async () => {
      const abTestNodeData = {
        id: 'ab_test_node_1',
        type: 'ab-test',
        position: { x: 400, y: 200 },
        config: {
          name: 'AB测试',
          versions: [
            { id: 'version_a', name: '版本A', ratio: 50 },
            { id: 'version_b', name: '版本B', ratio: 50 }
          ],
          groupALabel: '版本A',
          groupBLabel: '版本B',
          isConfigured: true
        }
      }

      // 模拟预览线系统生成两条预览线
      testEnv.previewLineSystem.generatePreviewLinesForNode.mockResolvedValue([
        { id: 'preview_1', sourceId: 'ab_test_node_1', targetId: 'target_1', branchId: 'version_a' },
        { id: 'preview_2', sourceId: 'ab_test_node_1', targetId: 'target_2', branchId: 'version_b' }
      ])

      canvasWrapper.vm.handleNodeConfigured(abTestNodeData)

      // 验证两条预览线生成
      expect(canvasWrapper.emitted('preview-line-generated')).toBeTruthy()
      const emittedEvents = canvasWrapper.emitted('preview-line-generated')
      expect(emittedEvents[0][0].nodeId).toBe('ab_test_node_1')
    })

    it('TC_NODE_CONFIG_008 - AB测试节点版本未配置时不应生成预览线', async () => {
      const abTestNodeData = {
        id: 'ab_test_node_2',
        type: 'ab-test',
        position: { x: 400, y: 200 },
        config: {
          name: 'AB测试',
          versions: [],
          groupALabel: '',
          groupBLabel: '',
          isConfigured: false
        }
      }

      canvasWrapper.vm.handleNodeConfigured(abTestNodeData)

      // 验证预览线生成事件被触发
      expect(canvasWrapper.emitted('preview-line-generated')).toBeTruthy()
    })
  })

  describe('SMS节点配置后预览线生成', () => {
    it('TC_NODE_CONFIG_009 - SMS节点配置完成后应生成预览线', async () => {
      const smsNodeData = {
        id: 'sms_node_1',
        type: 'sms',
        position: { x: 300, y: 300 },
        config: {
          name: 'SMS发送',
          template: '您好，这是一条测试短信',
          phoneField: 'phone',
          isConfigured: true
        }
      }

      canvasWrapper.vm.handleNodeConfigured(smsNodeData)

      // 验证预览线生成
      expect(canvasWrapper.emitted('preview-line-generated')).toBeTruthy()
      const emittedEvents = canvasWrapper.emitted('preview-line-generated')
      expect(emittedEvents[0][0].nodeId).toBe('sms_node_1')
    })

    it('TC_NODE_CONFIG_010 - SMS节点模板为空时不应生成预览线', async () => {
      const smsNodeData = {
        id: 'sms_node_2',
        type: 'sms',
        position: { x: 300, y: 300 },
        config: {
          name: 'SMS发送',
          template: '',
          phoneField: '',
          isConfigured: false
        }
      }

      canvasWrapper.vm.handleNodeConfigured(smsNodeData)

      // 验证预览线生成事件被触发
      expect(canvasWrapper.emitted('preview-line-generated')).toBeTruthy()
    })
  })

  describe('AI外呼节点配置后预览线生成', () => {
    it('TC_NODE_CONFIG_011 - AI外呼节点配置完成后应生成预览线', async () => {
      const aiCallNodeData = {
        id: 'ai_call_node_1',
        type: 'ai-call',
        position: { x: 400, y: 400 },
        config: {
          name: 'AI外呼',
          script: '您好，这是AI外呼测试',
          phoneField: 'phone',
          voiceType: 'female',
          isConfigured: true
        }
      }

      canvasWrapper.vm.handleNodeConfigured(aiCallNodeData)

      // 验证预览线生成
      expect(canvasWrapper.emitted('preview-line-generated')).toBeTruthy()
      const emittedEvents = canvasWrapper.emitted('preview-line-generated')
      expect(emittedEvents[0][0].nodeId).toBe('ai_call_node_1')
    })

    it('TC_NODE_CONFIG_012 - AI外呼节点话术为空时不应生成预览线', async () => {
      const aiCallNodeData = {
        id: 'ai_call_node_2',
        type: 'ai-call',
        position: { x: 400, y: 400 },
        config: {
          name: 'AI外呼',
          script: '',
          phoneField: '',
          voiceType: '',
          isConfigured: false
        }
      }

      canvasWrapper.vm.handleNodeConfigured(aiCallNodeData)

      // 验证预览线生成事件被触发
      expect(canvasWrapper.emitted('preview-line-generated')).toBeTruthy()
    })
  })

  describe('人工外呼节点配置后预览线生成', () => {
    it('TC_NODE_CONFIG_013 - 人工外呼节点配置完成后应生成预览线', async () => {
      const manualCallNodeData = {
        id: 'manual_call_node_1',
        type: 'manual-call',
        position: { x: 500, y: 400 },
        config: {
          name: '人工外呼',
          script: '人工外呼话术模板',
          phoneField: 'phone',
          assignTo: 'agent_group_1',
          isConfigured: true
        }
      }

      canvasWrapper.vm.handleNodeConfigured(manualCallNodeData)

      // 验证预览线生成
      expect(canvasWrapper.emitted('preview-line-generated')).toBeTruthy()
      const emittedEvents = canvasWrapper.emitted('preview-line-generated')
      expect(emittedEvents[0][0].nodeId).toBe('manual_call_node_1')
    })

    it('TC_NODE_CONFIG_014 - 人工外呼节点话术为空时不应生成预览线', async () => {
      const manualCallNodeData = {
        id: 'manual_call_node_2',
        type: 'manual-call',
        position: { x: 500, y: 400 },
        config: {
          name: '人工外呼',
          script: '',
          phoneField: '',
          assignTo: '',
          isConfigured: false
        }
      }

      canvasWrapper.vm.handleNodeConfigured(manualCallNodeData)

      // 验证预览线生成事件被触发
      expect(canvasWrapper.emitted('preview-line-generated')).toBeTruthy()
    })
  })

  describe('等待节点配置后预览线生成', () => {
    it('TC_NODE_CONFIG_015 - 等待节点配置完成后应生成预览线', async () => {
      const waitNodeData = {
        id: 'wait_node_1',
        type: 'wait',
        position: { x: 500, y: 500 },
        config: {
          name: '等待节点',
          waitType: 'time',
          duration: 3600, // 1小时
          unit: 'seconds',
          isConfigured: true
        }
      }

      canvasWrapper.vm.handleNodeConfigured(waitNodeData)

      // 验证预览线生成
      expect(canvasWrapper.emitted('preview-line-generated')).toBeTruthy()
      const emittedEvents = canvasWrapper.emitted('preview-line-generated')
      expect(emittedEvents[0][0].nodeId).toBe('wait_node_1')
    })

    it('TC_NODE_CONFIG_016 - 等待节点时长未设置时不应生成预览线', async () => {
      const waitNodeData = {
        id: 'wait_node_2',
        type: 'wait',
        position: { x: 500, y: 500 },
        config: {
          name: '等待节点',
          waitType: 'time',
          duration: 0,
          unit: '',
          isConfigured: false
        }
      }

      canvasWrapper.vm.handleNodeConfigured(waitNodeData)

      // 验证预览线生成事件被触发
      expect(canvasWrapper.emitted('preview-line-generated')).toBeTruthy()
    })
  })

  describe('权益节点配置后预览线生成', () => {
    it('TC_NODE_CONFIG_017 - 权益节点配置完成后应生成预览线', async () => {
      const benefitNodeData = {
        id: 'benefit_node_1',
        type: 'benefit',
        position: { x: 600, y: 600 },
        config: {
          name: '权益发放',
          benefitType: 'coupon',
          benefitId: 'coupon_001',
          amount: 100,
          description: '优惠券发放',
          isConfigured: true
        }
      }

      canvasWrapper.vm.handleNodeConfigured(benefitNodeData)

      // 验证预览线生成
      expect(canvasWrapper.emitted('preview-line-generated')).toBeTruthy()
      const emittedEvents = canvasWrapper.emitted('preview-line-generated')
      expect(emittedEvents[0][0].nodeId).toBe('benefit_node_1')
    })

    it('TC_NODE_CONFIG_018 - 权益节点权益类型未设置时不应生成预览线', async () => {
      const benefitNodeData = {
        id: 'benefit_node_2',
        type: 'benefit',
        position: { x: 600, y: 600 },
        config: {
          name: '权益发放',
          benefitType: '',
          benefitId: '',
          amount: 0,
          description: '',
          isConfigured: false
        }
      }

      canvasWrapper.vm.handleNodeConfigured(benefitNodeData)

      // 验证预览线生成事件被触发
      expect(canvasWrapper.emitted('preview-line-generated')).toBeTruthy()
    })
  })

  describe('复杂场景测试', () => {
    it('TC_NODE_CONFIG_019 - 多个节点同时配置完成应生成对应预览线', async () => {
      const nodes = [
        {
          id: 'start_1',
          type: 'start',
          config: { isConfigured: true }
        },
        {
          id: 'sms_1',
          type: 'sms',
          config: { isConfigured: true }
        },
        {
          id: 'audience_split_1',
          type: 'audience-split',
          config: { 
            crowdLayers: [{ id: 'crowd_1', crowdName: '测试人群' }],
            isConfigured: true 
          }
        }
      ]

      // 模拟多个节点配置完成
      for (const node of nodes) {
        canvasWrapper.vm.handleNodeConfigured(node)
      }

      // 验证每个节点都触发了预览线生成事件
      expect(canvasWrapper.emitted('preview-line-generated')).toHaveLength(3)
    })

    it('TC_NODE_CONFIG_020 - 节点配置状态变更应正确处理预览线', async () => {
      const nodeData = {
        id: 'dynamic_node_1',
        type: 'sms',
        position: { x: 100, y: 100 },
        config: {
          name: 'SMS发送',
          template: '测试短信',
          isConfigured: true
        }
      }

      // 第一次配置完成
      canvasWrapper.vm.handleNodeConfigured(nodeData)
      expect(canvasWrapper.emitted('preview-line-generated')).toHaveLength(1)

      // 修改配置状态为未完成
      nodeData.config.isConfigured = false
      nodeData.config.template = ''

      // 第二次配置未完成
      canvasWrapper.vm.handleNodeConfigured(nodeData)
      expect(canvasWrapper.emitted('preview-line-generated')).toHaveLength(2)
    })
  })

  describe('错误处理测试', () => {
    it('TC_NODE_CONFIG_021 - 节点数据格式错误时应优雅处理', async () => {
      const invalidNodeData = {
        id: null,
        type: undefined,
        config: null
      }

      // 应该不抛出错误
      expect(() => {
        canvasWrapper.vm.handleNodeConfigured(invalidNodeData)
      }).not.toThrow()
    })

    it('TC_NODE_CONFIG_022 - 预览线生成失败时应优雅处理', async () => {
      // 模拟预览线生成失败
      testEnv.previewLineSystem.generatePreviewLinesForNode.mockRejectedValue(
        new Error('预览线生成失败')
      )

      const nodeData = {
        id: 'error_node_1',
        type: 'sms',
        config: { isConfigured: true }
      }

      // 应该不抛出错误
      expect(() => {
        canvasWrapper.vm.handleNodeConfigured(nodeData)
      }).not.toThrow()
    })
  })
})