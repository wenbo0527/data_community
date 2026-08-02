import { describe, it, expect } from 'vitest'
import { buildDisplayLines } from '../../src/pages/marketing/tasks/horizontal/nodeDisplayLines.js'

describe('buildDisplayLines', () => {
  it('start：显示任务类型/目标人群/产品', () => {
    const lines = buildDisplayLines('start', {
      taskType: '促实名', targetAudience: ['活跃用户', '新用户'], products: ['sudai', 'jd_low_interest']
    })
    expect(lines).toContain('任务类型：促实名')
    expect(lines).toContain('目标人群：活跃用户、新用户')
    expect(lines).toContain('产品：苏贷、京东大额低息')
  })

  it('event-split：分支顺序匹配 + miss 行', () => {
    const lines = buildDisplayLines('event-split', {
      timeout: 60, unit: '分钟',
      branches: [
        { name: '发生事件', type: 'hit', unconditional: true, eventTypeLabel: '短信触达成功' },
        { name: '否', type: 'miss' }
      ]
    })
    expect(lines.some(l => l.includes('短信触达成功') && l.includes('无条件'))).toBe(true)
    expect(lines.some(l => l.includes('60分钟未发生') && l.includes('否'))).toBe(true)
  })

  it('event-split：未无条件时显示属性条件', () => {
    const lines = buildDisplayLines('event-split', {
      timeout: 30, unit: '分钟',
      branches: [
        { name: '响应层级=1', type: 'hit', unconditional: false, eventTypeLabel: '响应事件', conditions: [{ field: '响应层级', operator: 'eq', value: '1' }] }
      ]
    })
    expect(lines.some(l => l.includes('响应层级') && l.includes('= 1'))).toBe(true)
  })

  it('ab-test：支持 branches/variants 三种结构', () => {
    expect(buildDisplayLines('ab-test', { branches: [{ name: 'A', percentage: 50 }, { name: 'B', percentage: 50 }] }))
      .toEqual(['A：50%', 'B：50%'])
    expect(buildDisplayLines('ab-test', { variants: [{ name: 'V1', ratio: 60 }, { name: 'V2', ratio: 40 }] }))
      .toEqual(['V1：60%', 'V2：40%'])
  })

  it('未知节点类型：返回类型标签', () => {
    // 未知类型返回兜底字符串（这里是 'unknown'，因为 nodeTypes.js 不包含此类型）
    expect(buildDisplayLines('unknown')).toEqual(['unknown'])
  })

  it('crowd-split：按 layers 展示 + 其他', () => {
    const lines = buildDisplayLines('crowd-split', { crowdLayers: [{ crowdName: '高价值' }, { crowdName: '低价值' }] })
    expect(lines).toEqual(['高价值', '低价值', '其他'])
  })
})
/*
用途：buildDisplayLines 单元测试
说明：覆盖 start/event-split/ab-test/crowd-split/未知类型等；防止显示逻辑回归。
边界：纯函数，不修改任何状态。
*/