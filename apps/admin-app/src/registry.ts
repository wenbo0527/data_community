/**
 * admin-app 微应用注册配置
 * 通用域 - 权限管理、门户管理、通知管理、内容管理
 */
import type { MicroAppRegistry } from '@/shared/registry/types'

const registry: MicroAppRegistry = {
  app: {
    name: 'admin-app',
    version: '1.0.0',
    description: '通用域子应用（权限、门户、通知、内容）'
  },
  basePath: '/admin',
  entry: 'http://localhost:5182',
  menu: [
    {
      key: 'admin-index',
      label: '管理首页',
      icon: 'icon-home',
      path: '/admin/',
      order: 1
    },
    {
      key: 'admin-permission',
      label: '权限管理',
      icon: 'icon-settings',
      path: '/admin/permission',
      order: 2
    },
    {
      key: 'admin-user-management',
      label: '员工列表',
      icon: 'icon-user',
      path: '/admin/permission/user-management',
      order: 3
    },
    {
      key: 'admin-role-management',
      label: '角色列表',
      icon: 'icon-role',
      path: '/admin/permission/role-management',
      order: 4
    },
    {
      key: 'admin-portal',
      label: '门户管理',
      icon: 'icon-layout',
      path: '/admin/portal',
      order: 5
    },
    {
      key: 'admin-notifications',
      label: '通知管理',
      icon: 'icon-bell',
      path: '/admin/notifications',
      order: 6
    },
    {
      key: 'admin-content',
      label: '内容管理',
      icon: 'icon-file-text',
      path: '/admin/content',
      order: 7
    }
  ],
  routes: []
}

export default registry
