/**
 * dmt-app 微应用注册配置
 * 数据管理域 - 业务概念、数据标准、元数据、数据服务、资产目录、陪跑计划
 */
import type { MicroAppRegistry } from '@/shared/registry/types'

const registry: MicroAppRegistry = {
  app: {
    name: 'dmt-app',
    version: '1.0.0',
    description: '数据管理域子应用（元数据、数据标准、资产目录）'
  },
  basePath: '/dmt',
  entry: 'http://localhost:5184',
  menu: [
    {
      key: 'dmt-index',
      label: '管理首页',
      icon: 'icon-home',
      path: '/dmt/',
      order: 1
    },
    {
      key: 'dmt-metadata',
      label: '元数据',
      icon: 'icon-database',
      path: '/dmt/metadata',
      order: 2
    },
    {
      key: 'dmt-data-standard',
      label: '数据标准',
      icon: 'icon-rule',
      path: '/dmt/data-standard',
      order: 3
    },
    {
      key: 'dmt-business-concept',
      label: '业务概念',
      icon: 'icon-book',
      path: '/dmt/business-concept',
      order: 4
    },
    {
      key: 'dmt-asset-management',
      label: '资产目录',
      icon: 'icon-folder',
      path: '/dmt/asset-management',
      order: 5
    },
    {
      key: 'dmt-service',
      label: '数据服务',
      icon: 'icon-api',
      path: '/dmt/service',
      order: 6
    },
    {
      key: 'dmt-api-management',
      label: 'API管理',
      icon: 'icon-settings',
      path: '/dmt/service/api-management',
      order: 7
    },
    {
      key: 'dmt-accompany',
      label: '陪跑计划',
      icon: 'icon-run',
      path: '/dmt/accompany',
      order: 8
    }
  ],
  routes: []
}

export default registry
