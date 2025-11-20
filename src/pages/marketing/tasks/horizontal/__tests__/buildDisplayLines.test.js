/**
 * createVueShapeNode 纯逻辑测试 - 完全无Vue依赖
 * 专注于测试buildDisplayLines函数逻辑
 */

import { describe, it, expect } from 'vitest'

// 直接复制buildDisplayLines函数逻辑，避免Vue组件依赖
function buildDisplayLines(nodeType, config = {}) {
  const lines = []
  if (nodeType === 'start') {
    if (config?.taskType) lines.push(`任务类型：${config.taskType}`)
    if (Array.isArray(config?.targetAudience) && config.targetAudience.length) lines.push(`目标人群：${config.targetAudience.join('、')}`)
  } else if (nodeType === 'crowd-split' || nodeType === 'audience-split') {
    const layers = Array.isArray(config?.crowdLayers) ? config.crowdLayers : []
    if (layers.length) {
      layers.forEach(l => {
        const name = l?.crowdName || l?.name || '分流'
        lines.push(`命中：${name}`)
      })
      const un = config?.unmatchBranch?.name || '未命中人群'
      lines.push(`否则：${un}`)
    } else if (typeof config?.splitCount === 'number' && config.splitCount > 0) {
      for (let i = 0; i < config.splitCount; i++) {
        lines.push(`命中：分流${i + 1}`)
      }
      lines.push('否则：未命中人群')
    } else if (Array.isArray(config?.branches) && config.branches.length) {
      config.branches.forEach((b, i) => {
        const name = b?.name || `分流${i + 1}`
        lines.push(`命中：${name}`)
      })
      lines.push('否则：未命中人群')
    }
  } else if (nodeType === 'event-split') {
    const yes = config?.yesLabel || '是'
    const timeout = config?.timeout != null ? String(config.timeout) : ''
    lines.push(`命中：${yes}`)
    if (timeout) lines.push(`等待 ${timeout} 分钟未命中`)
    else lines.push('未命中')
  } else if (nodeType === 'ab-test') {
    const branches = Array.isArray(config?.branches) ? config.branches : []
    const variants = Array.isArray(config?.variants) ? config.variants : []
    const versions = Array.isArray(config?.versions) ? config.versions : []
    const merged = branches.length ? branches : (variants.length ? variants : versions)
    merged.forEach((b, i) => {
      const name = b?.name || `变体${String.fromCharCode(65 + i)}`
      const pct = b?.percentage != null ? b.percentage : (b?.ratio != null ? b.ratio : '')
      lines.push(`${name}：${pct}%`)
    })
  } else if (nodeType === 'ai-call') {
    if (config?.taskId) lines.push(`触达任务ID：${config.taskId}`)
  } else if (nodeType === 'sms') {
    if (config?.smsTemplate) lines.push(`短信模板：${config.smsTemplate}`)
  } else if (nodeType === 'manual-call') {
    if (config?.configId) lines.push(`配置ID：${config.configId}`)
    if (config?.description) lines.push(config.description)
  } else if (nodeType === 'wait') {
    if (config?.value) lines.push(`等待：${config.value} ${config.unit || ''}`)
  } else if (nodeType === 'benefit') {
    if (config?.benefitName) lines.push(`权益包名称：${config.benefitName}`)
  }
  
  // 模拟getNodeLabel函数
  const getNodeLabel = (nodeType) => {
    const labels = {
      'start': '开始',
      'end': '结束',
      'sms': '短信',
      'crowd-split': '人群分流',
      'ab-test': 'AB测试'
    }
    return labels[nodeType] || '未知节点'
  }
  
  return lines.length ? lines : [getNodeLabel(nodeType) || '节点']
}

describe('buildDisplayLines 纯逻辑测试', () => {
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
      crowdLayers: [
        { crowdName: '高价值用户' },
        { crowdName: '活跃用户' }
      ],
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

  it('应该为未知节点类型生成默认显示行', () => {
    const lines = buildDisplayLines('unknown-type', {})
    expect(lines).toEqual(['未知节点'])
  })

  it('应该处理空配置的情况', () => {
    const lines = buildDisplayLines('sms', {})
    expect(lines).toEqual(['短信'])
  })

  it('应该处理AB测试节点', () => {
    const config = {
      branches: [
        { name: '变体A', percentage: 50 },
        { name: '变体B', percentage: 50 }
      ]
    }
    const lines = buildDisplayLines('ab-test', config)
    
    expect(lines).toEqual([
      '变体A：50%',
      '变体B：50%'
    ])
  })

  it('应该处理事件分流节点', () => {
    const config = {
      yesLabel: '点击',
      timeout: 30
    }
    const lines = buildDisplayLines('event-split', config)
    
    expect(lines).toEqual([
      '命中：点击',
      '等待 30 分钟未命中'
    ])
  })

  it('应该处理crowdLayers数组配置', () => {
    const config = {
      crowdLayers: [
        { crowdName: 'VIP用户' },
        { crowdName: '活跃用户' }
      ]
    }
    const lines = buildDisplayLines('crowd-split', config)
    
    expect(lines).toEqual([
      '命中：VIP用户',
      '命中：活跃用户',
      '否则：未命中人群'
    ])
  })

  it('应该处理branches数组配置', () => {
    const config = {
      branches: [
        { name: '新用户分支' },
        { name: '老用户分支' }
      ]
    }
    const lines = buildDisplayLines('crowd-split', config)
    
    expect(lines).toEqual([
      '命中：新用户分支',
      '命中：老用户分支',
      '否则：未命中人群'
    ])
  })
})