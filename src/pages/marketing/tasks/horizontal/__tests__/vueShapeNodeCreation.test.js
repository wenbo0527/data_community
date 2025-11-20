import { describe, it, expect, beforeEach, vi } from 'vitest'
import { Graph } from '@antv/x6'
import '@antv/x6-vue-shape'
import { createVueShapeNode } from '../createVueShapeNode.js'
import HorizontalNode from '../HorizontalNode.vue'

// 模拟Graph.registerNode
vi.mock('@antv/x6', async () => {
  const actual = await vi.importActual('@antv/x6')
  return {
    ...actual,
    Graph: {
      ...actual.Graph,
      registerNode: vi.fn()
    }
  }
})

describe('Vue Shape节点创建测试', () => {
  let graph

  beforeEach(() => {
    // 注册自定义节点类型
    Graph.registerNode('horizontal-node', {
      inherit: 'vue-shape',
      width: 200,
      height: 100,
      component: HorizontalNode,
      ports: {
        groups: {
          in: {
            position: 'left',
            attrs: {
              circle: { r: 6, magnet: true, stroke: '#31D0C6', fill: '#fff' }
            }
          },
          out: {
            position: 'right',
            attrs: {
              circle: { r: 6, magnet: true, stroke: '#FAAD14', fill: '#fff' }
            }
          }
        }
      }
    })
  })

  it('应该创建horizontal-node类型的节点', () => {
    const nodeConfig = createVueShapeNode({
      id: 'test-node',
      x: 100,
      y: 200,
      label: '测试节点',
      data: {
        nodeType: 'crowd-split',
        config: {
          nodeName: '测试分流',
          crowdLayers: ['高价值用户', '普通用户'],
          splitCount: 2
        }
      }
    })

    expect(nodeConfig).toBeDefined()
    expect(nodeConfig.shape).toBe('horizontal-node')
    expect(nodeConfig.id).toBe('test-node')
    expect(nodeConfig.x).toBe(100)
    expect(nodeConfig.y).toBe(200)
    expect(nodeConfig.data.nodeType).toBe('crowd-split')
    expect(nodeConfig.data.headerTitle).toBe('测试分流')
    expect(nodeConfig.data.displayLines).toHaveLength(3) // 2个分支 + 1个默认
  })

  it('应该正确构建显示内容', () => {
    const nodeConfig = createVueShapeNode({
      id: 'sms-node',
      x: 150,
      y: 250,
      label: '短信节点',
      data: {
        nodeType: 'sms',
        config: {
          nodeName: '营销短信',
          smsTemplate: '优惠券提醒'
        }
      }
    })

    expect(nodeConfig.data.displayLines).toEqual(['短信模板：优惠券提醒'])
    expect(nodeConfig.data.headerTitle).toBe('营销短信')
  })

  it('应该为分流节点创建多个输出端口', () => {
    const nodeConfig = createVueShapeNode({
      id: 'split-node',
      x: 200,
      y: 300,
      label: '分流节点',
      data: {
        nodeType: 'crowd-split',
        config: {
          nodeName: '用户分层',
          crowdLayers: ['新用户', '活跃用户', '流失用户'],
          splitCount: 3
        }
      }
    })

    expect(nodeConfig.ports.items).toHaveLength(4) // 1个输入 + 3个输出
    expect(nodeConfig.ports.items.filter(item => item.group === 'out')).toHaveLength(3)
    expect(nodeConfig.ports.items.filter(item => item.group === 'in')).toHaveLength(1)
  })

  it('应该为结束节点只创建输入端口', () => {
    const nodeConfig = createVueShapeNode({
      id: 'end-node',
      x: 300,
      y: 400,
      label: '结束节点',
      data: {
        nodeType: 'end',
        config: {
          nodeName: '流程结束'
        }
      }
    })

    expect(nodeConfig.ports.items).toHaveLength(1) // 只有输入端口
    expect(nodeConfig.ports.items.filter(item => item.group === 'in')).toHaveLength(1)
    expect(nodeConfig.ports.items.filter(item => item.group === 'out')).toHaveLength(0)
  })

  it('应该正确处理垂直偏移', () => {
    const nodeConfig = createVueShapeNode({
      id: 'offset-node',
      x: 250,
      y: 350,
      label: '偏移测试节点',
      data: {
        nodeType: 'ab-test',
        config: {
          nodeName: 'AB测试',
          branches: [
            { name: '变体A', percentage: 50 },
            { name: '变体B', percentage: 50 }
          ]
        }
      }
    })

    // 验证端口配置包含正确的参数
    const outPorts = nodeConfig.ports.items.filter(item => item.group === 'out')
    expect(outPorts).toHaveLength(2)
    
    // 验证每个输出端口都有正确的参数
    outPorts.forEach((port, index) => {
      expect(port.args).toBeDefined()
      expect(port.args.rowIndex).toBe(index)
      expect(typeof port.args.y).toBe('number')
      expect(typeof port.args.dy).toBe('number')
    })
  })
})