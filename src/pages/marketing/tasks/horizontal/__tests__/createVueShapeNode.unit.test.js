/**
 * createVueShapeNode 单元测试 - 无Vue组件依赖
 * 专注于测试节点创建逻辑和端口配置
 */

import { describe, it, expect, vi } from 'vitest'
import { createVueShapeNode, buildDisplayLines } from '../createVueShapeNode.js'

// 模拟样式常量
vi.mock('../styles/nodeStyles.js', () => ({
  NODE_DIMENSIONS: {
    WIDTH: 280,
    MIN_HEIGHT: 80,
    HEADER_HEIGHT: 36,
    ROW_HEIGHT: 32,
    CONTENT_PADDING: 12
  },
  TYPOGRAPHY: {
    CONTENT_BASELINE_ADJUST: 5
  }
}))

// 模拟端口配置工厂
vi.mock('../utils/portConfigFactoryHorizontal.js', () => ({
  createHorizontalPortConfig: (outCount, options) => ({
    groups: {
      in: {
        position: 'left',
        layout: { name: 'fixed-left-y' },
        items: [{ id: 'in', group: 'in', args: { dy: 0 } }]
      },
      out: {
        position: 'right', 
        layout: { name: 'fixed-right-y' },
        items: Array.from({ length: outCount }, (_, i) => ({
          id: `out-${i}`,
          group: 'out',
          args: { dy: options.verticalOffsets?.[i] || 0 }
        }))
      }
    },
    items: [
      { id: 'in', group: 'in', args: { dy: 0 } },
      ...Array.from({ length: outCount }, (_, i) => ({
        id: `out-${i}`,
        group: 'out', 
        args: { dy: options.verticalOffsets?.[i] || 0 }
      }))
    ]
  })
}))

// 模拟getNodeLabel
vi.mock('../../../../utils/nodeTypes.js', () => ({
  getNodeLabel: (nodeType) => {
    const labels = {
      'start': '开始',
      'end': '结束',
      'sms': '短信',
      'crowd-split': '人群分流',
      'ab-test': 'AB测试'
    }
    return labels[nodeType] || '未知节点'
  }
}))

describe('createVueShapeNode 单元测试', () => {
  describe('buildDisplayLines', () => {
    it('应该为开始节点生成正确的显示行', () => {
      const config = {
        taskType: '营销任务',
        targetAudience: ['高价值用户', '新用户']
      }
      const lines = buildDisplayLines('start', config)
      
      expect(lines).toEqual([
        '任务类型：营销任务',
        '目标人群：高价值用户、新用户'
      ])
    })

    it('应该为人群分流节点生成正确的显示行', () => {
      const config = {
        crowdLayers: ['高价值用户', '活跃用户'],
        splitCount: 2
      }
      const lines = buildDisplayLines('crowd-split', config)
      
      expect(lines).toEqual([
        '命中：高价值用户',
        '命中：活跃用户',
        '否则：未命中人群'
      ])
    })

    it('应该为短信节点生成正确的显示行', () => {
      const config = {
        smsTemplate: '优惠券提醒短信'
      }
      const lines = buildDisplayLines('sms', config)
      
      expect(lines).toEqual(['短信模板：优惠券提醒短信'])
    })

    it('应该为结束节点生成默认显示行', () => {
      const lines = buildDisplayLines('end', {})
      expect(lines).toEqual(['结束'])
    })
  })

  describe('createVueShapeNode', () => {
    it('应该创建具有正确基本属性的节点', () => {
      const nodeData = createVueShapeNode({
        id: 'test-node-1',
        x: 100,
        y: 200,
        label: '测试节点',
        data: {
          nodeType: 'sms',
          config: {
            smsTemplate: '测试短信'
          }
        }
      })

      expect(nodeData).toMatchObject({
        id: 'test-node-1',
        x: 100,
        y: 200,
        width: 280,
        shape: 'horizontal-node',
        zIndex: 1
      })

      expect(nodeData.height).toBeGreaterThanOrEqual(80)
      expect(typeof nodeData.height).toBe('number')
    })

    it('应该正确设置节点数据', () => {
      const nodeData = createVueShapeNode({
        id: 'test-node-2',
        x: 200,
        y: 300,
        data: {
          nodeType: 'crowd-split',
          config: {
            nodeName: '测试分流',
            crowdLayers: ['用户群A', '用户群B']
          }
        }
      })

      expect(nodeData.data).toMatchObject({
        nodeType: 'crowd-split',
        config: {
          nodeName: '测试分流',
          displayLines: [
            '命中：用户群A',
            '命中：用户群B',
            '否则：未命中人群'
          ]
        },
        disabled: false,
        selected: false,
        hover: false
      })
    })

    it('应该为开始节点创建正确的端口配置', () => {
      const nodeData = createVueShapeNode({
        id: 'start-node',
        x: 50,
        y: 100,
        data: {
          nodeType: 'start',
          config: {
            taskType: '营销任务'
          }
        }
      })

      expect(nodeData.ports).toBeDefined()
      expect(nodeData.ports.groups).toBeDefined()
      expect(nodeData.ports.groups.in).toBeDefined()
      expect(nodeData.ports.groups.out).toBeDefined()
      
      // 开始节点应该有out端口
      expect(nodeData.ports.items.some(item => item.group === 'out')).toBe(true)
    })

    it('应该为结束节点创建正确的端口配置', () => {
      const nodeData = createVueShapeNode({
        id: 'end-node',
        x: 400,
        y: 100,
        data: {
          nodeType: 'end',
          config: {}
        }
      })

      expect(nodeData.ports).toBeDefined()
      expect(nodeData.ports.groups.in).toBeDefined()
      
      // 结束节点不应该有out端口
      const outPortItems = nodeData.ports.items.filter(item => item.group === 'out')
      expect(outPortItems.length).toBe(0)
    })

    it('应该根据内容行数计算正确的节点高度', () => {
      const singleLineNode = createVueShapeNode({
        id: 'single-line',
        x: 100,
        y: 100,
        data: {
          nodeType: 'sms',
          config: { smsTemplate: '单行内容' }
        }
      })

      const multiLineNode = createVueShapeNode({
        id: 'multi-line',
        x: 200,
        y: 100,
        data: {
          nodeType: 'crowd-split',
          config: {
            crowdLayers: ['用户群A', '用户群B', '用户群C'],
            splitCount: 3
          }
        }
      })

      expect(singleLineNode.height).toBeLessThan(multiLineNode.height)
      expect(multiLineNode.height).toBeGreaterThanOrEqual(80)
    })

    it('应该正确设置端口垂直偏移', () => {
      const nodeData = createVueShapeNode({
        id: 'port-offset-node',
        x: 300,
        y: 200,
        data: {
          nodeType: 'crowd-split',
          config: {
            crowdLayers: ['第一行', '第二行', '第三行']
          }
        }
      })

      const outPortItems = nodeData.ports.items.filter(item => item.group === 'out')
      expect(outPortItems.length).toBe(3)
      
      // 验证每个端口的垂直偏移
      outPortItems.forEach((item, index) => {
        expect(item.args).toBeDefined()
        expect(typeof item.args.dy).toBe('number')
        
        // 验证端口ID格式
        expect(item.id).toBe(`out-${index}`)
      })
    })

    it('应该处理禁用状态', () => {
      const disabledNode = createVueShapeNode({
        id: 'disabled-node',
        x: 100,
        y: 100,
        data: {
          nodeType: 'sms',
          disabled: true,
          config: { smsTemplate: '测试短信' }
        }
      })

      expect(disabledNode.data.disabled).toBe(true)

      const enabledNode = createVueShapeNode({
        id: 'enabled-node',
        x: 200,
        y: 100,
        data: {
          nodeType: 'sms',
          config: { smsTemplate: '测试短信' }
        }
      })

      expect(enabledNode.data.disabled).toBe(false)
    })
  })
})