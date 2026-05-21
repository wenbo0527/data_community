/**
 * dex-app 微应用注册配置
 * 数据探索域 - 客户360、客群中心、分析工作台、外部数据评估、工作流
 */
import type { MicroAppRegistry } from '@/shared/registry/types'

const registry: MicroAppRegistry = {
  app: {
    name: 'dex-app',
    version: '1.0.0',
    description: '数据探索域子应用（客户360、分析工作台）'
  },
  basePath: '/dex',
  entry: 'http://localhost:5180',
  menu: [
    {
      key: 'dex-index',
      label: '探索首页',
      icon: 'icon-home',
      path: '/dex/',
      order: 1
    },
    {
      key: 'dex-customer360',
      label: '客户360',
      icon: 'icon-user-circle',
      path: '/dex/customer360',
      order: 2
    },
    {
      key: 'dex-customer-center',
      label: '客群中心',
      icon: 'icon-user-group',
      path: '/dex/exploration/customer-center',
      order: 3
    },
    {
      key: 'dex-tag-system',
      label: '标签系统',
      icon: 'icon-tag',
      path: '/dex/exploration/customer-center/tag-system',
      order: 4
    },
    {
      key: 'dex-workflows',
      label: '工作流管理',
      icon: 'icon-branch',
      path: '/dex/exploration/workflows',
      order: 5
    },
    {
      key: 'dex-external-data-evaluation',
      label: '外部数据评估',
      icon: 'icon-evaluation',
      path: '/dex/exploration/external-data-evaluation',
      order: 6
    },
    {
      key: 'dex-analytics-workbench',
      label: '分析工作台',
      icon: 'icon-dashboard',
      path: '/dex/analytics-workbench',
      order: 7
    }
  ],
  routes: []
}

export default registry
