import { describe, it, expect } from 'vitest'
import { validateForPublishPure } from '../../src/pages/marketing/tasks/horizontal/persistence/validateForPublish.js'

describe('validateForPublishPure', () => {
  it('空数据：返回格式错误', () => {
    expect(validateForPublishPure(null)).toEqual({ pass: false, messages: ['画布数据格式不正确'], details: [] })
    const r = validateForPublishPure({ nodes: [], connections: [] })
    expect(r.pass).toBe(false)
    expect(r.messages).toContain('画布中没有任何节点')
    expect(r.messages).toContain('缺少开始节点')
  })

  it('缺少开始节点：失败', () => {
    const data = { nodes: [{ id: 'a', type: 'sms', config: { smsTemplate: 't' }, isConfigured: true }], connections: [] }
    const r = validateForPublishPure(data)
    expect(r.pass).toBe(false)
    expect(r.messages.some(m => m.includes('开始节点'))).toBe(true)
  })

  it('正常路径：start -> sms -> end，全配置，全连通', () => {
    const data = {
      nodes: [
        { id: 'start', type: 'start' },
        { id: 'sms', type: 'sms', config: { smsTemplate: 't' }, isConfigured: true },
        { id: 'end', type: 'end' }
      ],
      connections: [
        { source: 'start', target: 'sms' },
        { source: 'sms', target: 'end' }
      ]
    }
    const r = validateForPublishPure(data)
    expect(r.pass).toBe(true)
    expect(r.messages).toEqual([])
  })

  it('未配置节点：失败', () => {
    const data = {
      nodes: [
        { id: 'start', type: 'start' },
        { id: 'n1', type: 'sms' }
      ],
      connections: [{ source: 'start', target: 'n1' }, { source: 'n1', target: 'end' }]
    }
    const r = validateForPublishPure(data)
    expect(r.messages.some(m => m.includes('未完成配置'))).toBe(true)
  })

  it('未连接后续节点：失败', () => {
    const data = {
      nodes: [
        { id: 'start', type: 'start' },
        { id: 'n1', type: 'sms', config: { smsTemplate: 't' }, isConfigured: true }
      ],
      connections: []
    }
    const r = validateForPublishPure(data)
    expect(r.messages.some(m => m.includes('未连接后续节点'))).toBe(true)
  })

  it('环路检测：start -> A -> B -> start', () => {
    const data = {
      nodes: [
        { id: 'start', type: 'start' },
        { id: 'A', type: 'sms', config: { smsTemplate: 't' }, isConfigured: true },
        { id: 'B', type: 'sms', config: { smsTemplate: 't' }, isConfigured: true },
        { id: 'end', type: 'end' }
      ],
      connections: [
        { source: 'start', target: 'A' },
        { source: 'A', target: 'B' },
        { source: 'B', target: 'start' },
        { source: 'B', target: 'end' }
      ]
    }
    const r = validateForPublishPure(data)
    expect(r.messages.some(m => m.includes('环路'))).toBe(true)
  })

  it('end 节点无出边：不报错', () => {
    const data = {
      nodes: [
        { id: 'start', type: 'start' },
        { id: 'end', type: 'end' }
      ],
      connections: [{ source: 'start', target: 'end' }]
    }
    const r = validateForPublishPure(data)
    expect(r.pass).toBe(true)
  })

  it('多错误聚合：details 数组结构正确', () => {
    const data = {
      nodes: [
        { id: 'start', type: 'start' },
        { id: 'n1', type: 'sms' },
        { id: 'n2', type: 'sms' }
      ],
      connections: [
        { source: 'start', target: 'n1' }
      ]
    }
    const r = validateForPublishPure(data)
    expect(r.pass).toBe(false)
    expect(Array.isArray(r.details)).toBe(true)
    const kinds = r.details.map(d => d.kind)
    expect(kinds).toContain('unconfigured')
    expect(kinds).toContain('no-out')
  })

  it('AB 实验分支：全部配置且每分支有出边 → pass', () => {
    const data = {
      nodes: [
        { id: 'start', type: 'start' },
        { id: 'ab', type: 'ab-test', config: { branches: [{ id: 'b1' }, { id: 'b2' }, { id: 'b3' }, { id: 'b4' }] }, isConfigured: true },
        { id: 'e1', type: 'end' },
        { id: 'e2', type: 'end' },
        { id: 'e3', type: 'end' },
        { id: 'e4', type: 'end' }
      ],
      connections: [
        { source: 'start', target: 'ab' },
        { source: 'ab', target: 'e1', sourcePort: 'out-0', branchId: 'b1' },
        { source: 'ab', target: 'e2', sourcePort: 'out-1', branchId: 'b2' },
        { source: 'ab', target: 'e3', sourcePort: 'out-2', branchId: 'b3' },
        { source: 'ab', target: 'e4', sourcePort: 'out-3', branchId: 'b4' }
      ]
    }
    const r = validateForPublishPure(data)
    expect(r.pass).toBe(true)
  })

  it('format 异常（节点不是数组）: 透传返回', () => {
    const bad = { nodes: 'not-array', connections: [] }
    const r = validateForPublishPure(bad)
    expect(r.pass).toBe(false)
    expect(r.messages).toContain('画布数据格式不正确')
  })

  it('isConfigured 显式 true 即便 config 为空：视为已配置', () => {
    const data = {
      nodes: [
        { id: 'start', type: 'start' },
        { id: 'n', type: 'sms', isConfigured: true },
        { id: 'end', type: 'end' }
      ],
      connections: [
        { source: 'start', target: 'n' },
        { source: 'n', target: 'end' }
      ]
    }
    const r = validateForPublishPure(data)
    expect(r.pass).toBe(true)
  })
})
/*
用途：validateForPublishPure 单元测试
说明：覆盖空数据、缺 start、未配置、未连通、环路等核心场景；不依赖 graph，可独立运行。
边界：仅测试纯算法，不覆盖图实例层的端口/分支校验。
*/