/**
 * data-community-app 微应用注册配置
 * 数据社区 - 数据发现 + 数据管理 + 数据探索 统一工作台
 */
import type { MicroAppRegistry } from './types'

const registry: MicroAppRegistry = {
  app: {
    name: 'data-community-app',
    version: '1.0.0',
    description: '数据社区子应用(数据发现 + 数据管理 + 数据探索)'
  },
  basePath: '/dca',
  entry: 'http://localhost:5185',
  menu: [
    {
      key: 'dca-discovery',
      label: '数据发现',
      icon: 'icon-search',
      path: '/dca/discovery',
      order: 1
    },
    {
      key: 'dca-management',
      label: '数据管理',
      icon: 'icon-storage',
      path: '/dca/management',
      order: 2
    },
    {
      key: 'dca-exploration',
      label: '数据探索',
      icon: 'icon-data-analysis',
      path: '/dca/exploration',
      order: 3
    }
  ],
  routes: []
}

export default registry