import { describe, it, expect } from 'vitest'
import { migrateCanvasData } from '../../src/utils/migrateCanvasData.js'

describe('migrateCanvasData', () => {
  it('格式异常时原样返回', () => {
    expect(migrateCanvasData(null)).toBeNull()
    expect(migrateCanvasData(undefined)).toBeUndefined()
    expect(migrateCanvasData({ nodes: 'not-array', connections: [] })).toEqual({ nodes: 'not-array', connections: [] })
  })

  it('空画布返回空画布', () => {
    const r = migrateCanvasData({ nodes: [], connections: [] })
    expect(r.nodes).toEqual([])
    expect(r.connections).toEqual([])
  })

  it('节点 config 兼容扁平与嵌套', () => {
    const data = {
      nodes: [
        { id: 'a', type: 'sms', config: { smsTemplate: 't1' }, isConfigured: true },
        { id: 'b', type: 'sms', data: { config: { smsTemplate: 't2' }, isConfigured: false } }
      ],
      connections: []
    }
    const r = migrateCanvasData(data)
    expect(r.nodes[0].config).toEqual({ smsTemplate: 't1' })
    expect(r.nodes[0].isConfigured).toBe(true)
    expect(r.nodes[1].config).toEqual({ smsTemplate: 't2' })
  })

  it('isConfigured 兜底：config 非空视为已配置', () => {
    const data = {
      nodes: [{ id: 'a', type: 'sms', config: { smsTemplate: 't' } }],
      connections: []
    }
    const r = migrateCanvasData(data)
    expect(r.nodes[0].isConfigured).toBe(true)
  })

  it('AB 实验分支按 index 补齐 id/label/name', () => {
    const data = {
      nodes: [{
        id: 'ab', type: 'ab-test',
        config: { branches: [{ name: 'A' }, { name: 'B' }] }
      }],
      connections: []
    }
    const r = migrateCanvasData(data)
    const bs = r.nodes[0].config.branches
    expect(bs[0].id).toBe('branch_1')
    expect(bs[0].label).toBe('A')
    expect(bs[1].id).toBe('branch_2')
    expect(bs[1].label).toBe('B')
    expect(bs[0].name).toBe('A')
  })

  it('AB 实验边按 out-N 推断 branchId', () => {
    const data = {
      nodes: [
        { id: 'ab', type: 'ab-test', config: { branches: [{ id: 'branch_1' }, { id: 'branch_2' }] } },
        { id: 'a', type: 'end' },
        { id: 'b', type: 'end' }
      ],
      connections: [
        { source: 'ab', target: 'a', sourcePort: 'out-0' },
        { source: 'ab', target: 'b', sourcePort: 'out-1' }
      ]
    }
    const r = migrateCanvasData(data)
    expect(r.connections[0].branchId).toBe('branch_1')
    expect(r.connections[1].branchId).toBe('branch_2')
  })

  it('非 ab-test 边不动 branchId', () => {
    const data = {
      nodes: [
        { id: 'a', type: 'start' },
        { id: 'b', type: 'sms', config: { smsTemplate: 't' }, isConfigured: true }
      ],
      connections: [{ source: 'a', target: 'b', sourcePort: 'out-0' }]
    }
    const r = migrateCanvasData(data)
    expect(r.connections[0].branchId).toBeNull()
  })

  it('保留其他字段不变（isNew、status 等）', () => {
    const data = {
      nodes: [{ id: 'a', type: 'start', isNew: true, status: 'pending' }],
      connections: []
    }
    const r = migrateCanvasData(data)
    expect(r.nodes[0].isNew).toBe(true)
    expect(r.nodes[0].status).toBe('pending')
  })
})
/*
用途：migrateCanvasData 单元测试
说明：覆盖空数据 / 格式异常 / config 兼容 / AB 分支补齐 / 边 branchId 推断。
边界：原样返回 vs 安全降级；不测迁移缓存（taskStorage 行为）。
*/