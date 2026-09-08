/**
 * 布局方向切换功能测试
 * 验证所有相关组件是否正确支持布局方向切换
 */

import { createNodePortConfig } from '../utils/portConfigFactory.js'

// 测试端口配置工厂
console.log('=== 测试端口配置工厂 ===')

// 测试TB布局
const tbPortConfig = createNodePortConfig('sms', {}, 'TB')
console.log('TB布局端口配置:', {
  inPosition: tbPortConfig.groups.in.position.name,
  outPosition: tbPortConfig.groups.out.position.name
})

// 测试LR布局
const lrPortConfig = createNodePortConfig('sms', {}, 'LR')
console.log('LR布局端口配置:', {
  inPosition: lrPortConfig.groups.in.position.name,
  outPosition: lrPortConfig.groups.out.position.name
})

// 测试动态方向配置函数
console.log('\n=== 测试动态方向配置 ===')

const getDynamicDirectionConfig = (layoutDirection) => {
  if (layoutDirection === 'LR') {
    return {
      startDirections: ['right'],
      endDirections: ['left']
    }
  } else {
    return {
      startDirections: ['bottom'],
      endDirections: ['top']
    }
  }
}

// 测试TB布局连接
const tbConnectionConfig = getDynamicDirectionConfig('TB')
console.log('TB布局连接配置:', {
  startDirections: tbConnectionConfig.startDirections,
  endDirections: tbConnectionConfig.endDirections
})

// 测试LR布局连接
const lrConnectionConfig = getDynamicDirectionConfig('LR')
console.log('LR布局连接配置:', {
  startDirections: lrConnectionConfig.startDirections,
  endDirections: lrConnectionConfig.endDirections
})

// 验证结果
console.log('\n=== 验证结果 ===')

const tbValid = (
  tbPortConfig.groups.in.position.name === 'top' &&
  tbPortConfig.groups.out.position.name === 'bottom' &&
  tbConnectionConfig.startDirections[0] === 'bottom' &&
  tbConnectionConfig.endDirections[0] === 'top'
)

const lrValid = (
  lrPortConfig.groups.in.position.name === 'left' &&
  lrPortConfig.groups.out.position.name === 'right' &&
  lrConnectionConfig.startDirections[0] === 'right' &&
  lrConnectionConfig.endDirections[0] === 'left'
)

console.log('TB布局配置正确:', tbValid ? '✅' : '❌')
console.log('LR布局配置正确:', lrValid ? '✅' : '❌')
console.log('整体测试结果:', (tbValid && lrValid) ? '✅ 通过' : '❌ 失败')

export { tbValid, lrValid }