/**
 * mkt-app 微应用注册配置
 * 营销域 - 权益中心、触达系统、客群中心、电销、营销画布、预警、任务
 */
import type { MicroAppRegistry } from '@/shared/registry/types'

const registry: MicroAppRegistry = {
  app: {
    name: 'mkt-app',
    version: '1.0.0',
    description: '营销域子应用（权益、客群、营销画布、触达）'
  },
  basePath: '/mkt',
  entry: 'http://localhost:5177',
  menu: [
    {
      key: 'mkt-index',
      label: '营销首页',
      icon: 'icon-home',
      path: '/mkt/',
      order: 1
    },
    {
      key: 'mkt-benefit',
      label: '权益中心',
      icon: 'icon-gift',
      path: '/mkt/benefit',
      order: 2
    },
    {
      key: 'mkt-customer',
      label: '客群中心',
      icon: 'icon-user-group',
      path: '/mkt/customer',
      order: 3
    },
    {
      key: 'mkt-canvas',
      label: '营销画布',
      icon: 'icon-edit',
      path: '/mkt/canvas',
      order: 4
    },
    {
      key: 'mkt-reach',
      label: '触达管理',
      icon: 'icon-send',
      path: '/mkt/reach',
      order: 5
    },
    {
      key: 'mkt-call',
      label: '人工电销',
      icon: 'icon-phone',
      path: '/mkt/call',
      order: 6
    },
    {
      key: 'mkt-alert',
      label: '预警中心',
      icon: 'icon-warning',
      path: '/mkt/alert',
      order: 7
    },
    {
      key: 'mkt-tasks',
      label: '任务中心',
      icon: 'icon-check-circle',
      path: '/mkt/tasks',
      order: 8
    }
  ],
  routes: []
}

export default registry
