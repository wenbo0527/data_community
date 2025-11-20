import { describe, it, expect } from 'vitest'
import { createVueShapeNode, buildDisplayLines } from '../createVueShapeNode.js'

describe('Vue Shape节点创建功能测试', () => {
  it('应该正确构建显示内容 - 开始节点', () => {
    const lines = buildDisplayLines('start', {
      taskType: '营销活动',
      targetAudience: ['高价值用户', '新用户']
    })
    
    expect(lines).toEqual([
      '任务类型：营销活动',
      '目标人群：高价值用户、新用户'
    ])
  })

  it('应该正确构建显示内容 - 短信节点', () => {
    const lines = buildDisplayLines('sms', {
      nodeName: '营销短信',
      smsTemplate: '优惠券提醒'
    })
    
    expect(lines).toEqual(['短信模板：优惠券提醒'])
  })

  it('应该正确构建显示内容 - 分流节点', () => {
    const lines = buildDisplayLines('crowd-split', {
      nodeName: '用户分层',
      crowdLayers: ['高价值用户', '普通用户'],
      splitCount: 2
    })
    
    expect(lines).toEqual([
      '命中：高价值用户',
      '命中：普通用户',
      '否则：未命中人群'
    ])
  })

  it('应该正确构建显示内容 - AB测试节点', () => {
    const lines = buildDisplayLines('ab-test', {
      nodeName: '页面优化测试',
      branches: [
        { name: '变体A', percentage: 50 },
        { name: '变体B', percentage: 50 }
      ]
    })
    
    expect(lines).toEqual([
      '变体A：50%',
      '变体B：50%'
    ])
  })

  it('应该创建horizontal-node类型的节点配置', () => {
    const nodeConfig = createVueShapeNode({
      id: 'test-node',
      x: 100,
      y: 200,
      label: '测试节点',
      data: {
        nodeType: 'sms',
        config: {
          nodeName: '营销短信',
          smsTemplate: '优惠券提醒'
        }
      }
    })

    expect(nodeConfig).toBeDefined()
    expect(nodeConfig.shape).toBe('horizontal-node')
    expect(nodeConfig.id).toBe('test-node')
    expect(nodeConfig.x).toBe(100)
    expect(nodeConfig.y).toBe(200)
    expect(nodeConfig.data.nodeType).toBe('sms')
    expect(nodeConfig.data.headerTitle).toBe('营销短信')
    expect(nodeConfig.data.displayLines).toEqual(['短信模板：优惠券提醒'])
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

  it('应该正确处理垂直偏移和端口参数', () => {
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

  it('应该计算正确的节点高度', () => {
    const nodeConfig = createVueShapeNode({
      id: 'height-test-node',
      x: 100,
      y: 100,
      label: '高度测试节点',
      data: {
        nodeType: 'crowd-split',
        config: {
          nodeName: '多行测试',
          crowdLayers: ['用户群1', '用户群2', '用户群3', '用户群4'],
          splitCount: 4
        }
      }
    })

    // 验证高度计算：header + padding + 内容行 * rowHeight + 底部padding
    expect(nodeConfig.height).toBeGreaterThan(100) // 应该大于最小高度
    expect(nodeConfig.data.displayLines).toHaveLength(5) // 4个分支 + 1个默认
  })
})