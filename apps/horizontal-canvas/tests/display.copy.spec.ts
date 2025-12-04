import { describe, it, expect } from 'vitest'
import { buildDisplayLines } from '@/pages/marketing/tasks/horizontal/createVueShapeNode.js'

describe('节点文案与展示', () => {
  it('人群分流：显示抽屉选择的客群名称与其他', () => {
    const lines = buildDisplayLines('crowd-split', { crowdLayers: [{ crowdName: '高价值用户' }, { crowdName: '活跃用户' }], unmatchBranch: { name: '其他' } })
    expect(lines).toEqual(['高价值用户','活跃用户','其他'])
  })

  it('事件分流：发生【事件类型】与【超时设置】未发生事件', () => {
    const lines = buildDisplayLines('event-split', { eventType: '点击', timeout: 30, unit: '分钟' })
    expect(lines).toEqual(['发生【点击】','【30分钟】未发生事件'])
  })

  it('等待节点：显示等待时间与单位', () => {
    const lines = buildDisplayLines('wait', { value: 5, unit: '小时' })
    expect(lines).toEqual(['等待：5小时'])
  })
})
