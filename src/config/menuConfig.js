/**
 * 统一菜单配置
 * 作为顶部菜单、侧边菜单和路由配置的单一数据源
 */

import { ROUTE_PATHS, ROUTE_NAMES } from '../router/constants'

// 菜单配置
export const MENU_CONFIG = {
  // 首页
  home: {
    key: 'home',
    title: '首页',
    path: ROUTE_PATHS.HOME,
    routeName: ROUTE_NAMES.HOME,
    icon: 'icon-home',
    type: 'single' // 单页面，无子菜单
  },

  // 数据发现
  discovery: {
    key: 'discovery',
    title: '数据发现',
    icon: 'icon-search',
    type: 'module', // 模块，有子菜单
    defaultPath: '/discovery/asset-overview',
    children: {
      'asset-overview': {
        key: 'asset-overview',
        title: '资产总览',
        path: '/discovery/asset-overview',
        routeName: 'AssetOverview'
      },
      'data-map': {
        key: 'data-map',
        title: '统一搜索',
        path: '/discovery/data-map',
        routeName: 'dataMap'
      },
      'full-data': {
        key: 'full-data',
        title: '全量数据',
        path: '/discovery/data-map/table-list',
        routeName: 'TableList'
      },
      'data-asset': {
        key: 'data-asset',
        title: '数据资产',
        type: 'group',
        children: {
          'metrics-map': {
            key: 'metrics-map',
            title: '指标地图',
            path: '/discovery/metrics-map',
            routeName: 'metricsMap'
          },
          'credit-variables': {
            key: 'credit-variables',
            title: '征信变量',
            path: '/discovery/credit',
            routeName: 'credit'
          },
          'external-data': {
            key: 'external-data',
            title: '外部数据',
            path: '/external-data-v1/list',
            routeName: 'external'
          }
        }
      },
      'data-register': {
        key: 'data-register',
        title: '数据注册',
        type: 'group',
        children: {
          'table-management': {
            key: 'table-management',
            title: '表管理',
            path: '/discovery/asset-management/table-management',
            routeName: 'TableManagement'
          },
          'external-data-management': {
            key: 'external-data-management',
            title: '外部数据管理',
            path: '/discovery/asset-management/external-data-management',
            routeName: 'ExternalDataManagement'
          },
          'metric-management': {
            key: 'metric-management',
            title: '指标管理',
            path: '/discovery/asset-management/metric-management',
            routeName: 'MetricManagement'
          },
          'batch-asset-management': {
            key: 'batch-asset-management',
            title: '批量资产管理',
            path: '/discovery/asset-management/batch-asset-management',
            routeName: 'BatchAssetManagement'
          }
        }
      },
      'customer360': {
        key: 'customer360',
        title: '客户360',
        path: '/discovery/customer360',
        routeName: 'Customer360'
      }
    }
  },

  // 数据探索
  exploration: {
    key: 'exploration',
    title: '数据探索',
    icon: 'icon-experiment',
    type: 'module',
    defaultPath: '/exploration/index',
    children: {
      'exploration-index': {
        key: 'exploration-index',
        title: '探索首页',
        path: '/exploration/index',
        routeName: 'explorationIndex'
      },
      'external-data-lifecycle': {
        key: 'external-data-lifecycle',
        title: '外数生命周期',
        type: 'group',
        children: {
          'budget-management': {
            key: 'budget-management',
            title: '预算管理',
            path: '/exploration/external-data-analysis/budget-management',
            routeName: 'budget-management'
          },
          'external-data-evaluation': {
            key: 'external-data-evaluation',
            title: '外部数据评估',
            path: '/exploration/external-data-analysis/external-data-evaluation',
            routeName: 'external-data-evaluation'
          },
          'external-data-monitor': {
            key: 'external-data-monitor',
            title: '外部数据监控',
            path: '/exploration/external-data-analysis/external-data-monitor',
            routeName: 'external-data-monitor'
          }
        }
      },
      'customer-center': {
        key: 'customer-center',
        title: '客群中心',
        type: 'group',
        children: {
          'audience-management': {
            key: 'audience-management',
            title: '人群管理',
            path: '/exploration/customer-center/audience-system/audience-management',
            routeName: 'audience-management'
          },
          'event-center': {
            key: 'event-center',
            title: '事件中心',
            type: 'group',
            children: {
              'event-center-index': {
                key: 'event-center-index',
                title: '事件中心首页',
                path: '/exploration/customer-center/event-center',
                routeName: 'event-center-index'
              },
              'event-management': {
                key: 'event-management',
                title: '事件管理',
                path: '/exploration/customer-center/event-center/event-management',
                routeName: 'event-management'
              },
              'virtual-events': {
                key: 'virtual-events',
                title: '虚拟事件',
                path: '/exploration/customer-center/event-center/virtual-events',
                routeName: 'virtual-events'
              },
              'sample-stats': {
                key: 'sample-stats',
                title: '样本统计',
                path: '/exploration/customer-center/event-center/sample-stats',
                routeName: 'sample-stats'
              },
              'kafka-datasource': {
                key: 'kafka-datasource',
                title: 'Kafka数据源',
                path: '/exploration/customer-center/event-center/kafka-datasource',
                routeName: 'kafka-datasource'
              }
            }
          },
          'tag-system': {
            key: 'tag-system',
            title: '标签管理',
            type: 'group',
            children: {
              'tag-system-index': {
                key: 'tag-system-index',
                title: '标签体系首页',
                path: '/exploration/customer-center/tag-system',
                routeName: 'tag-system-index'
              },
              'tag-management': {
                key: 'tag-management',
                title: '标签管理',
                path: '/exploration/customer-center/tag-system/tag-management',
                routeName: 'tag-management'
              },
              'attribute-management': {
                key: 'attribute-management',
                title: '属性管理',
                path: '/exploration/customer-center/tag-system/attribute-management',
                routeName: 'attribute-management'
              }
            }
          }
        }
      }
    }
  },

  // 数据管理
  management: {
    key: 'management',
    title: '数据管理',
    icon: 'icon-robot',
    type: 'module',
    defaultPath: '/management/service',
    children: {
      'management-service': {
        key: 'management-service',
        title: '数据服务',
        path: '/management/service',
        routeName: 'management-service'
      },
      'permission': {
        key: 'permission',
        title: '权限管理',
        path: '/management/permission',
        routeName: 'permission'
      },
      'accompany': {
        key: 'accompany',
        title: '陪跑计划',
        type: 'group',
        children: {
          'management-accompany-create': {
            key: 'management-accompany-create',
            title: '创建陪跑',
            path: '/management/accompany/create',
            routeName: 'management-accompany-create'
          },
          'management-accompany-result': {
            key: 'management-accompany-result',
            title: '陪跑结果',
            path: '/management/accompany/result',
            routeName: 'management-accompany-result'
          }
        }
      }
    }
  },

  // 数字营销
  marketing: {
    key: 'marketing',
    title: '数字营销',
    icon: 'icon-dashboard',
    type: 'module',
    defaultPath: '/marketing/dashboard',
    children: {
      'benefit-center': {
        key: 'benefit-center',
        title: '权益中心',
        type: 'group',
        children: {
          'dashboard': {
            key: 'dashboard',
            title: '权益首页',
            path: '/marketing/dashboard',
            routeName: 'couponDashboard'
          },
          'benefit-config': {
            key: 'benefit-config',
            title: '权益配置',
            type: 'group',
            children: {
              'template': {
                key: 'template',
                title: '模板管理',
                path: '/marketing/benefit/template',
                routeName: 'template'
              },
              'coupon-management': {
                key: 'coupon-management',
                title: '券管理',
                path: '/marketing/benefit/management',
                routeName: 'management'
              },
              'package': {
                key: 'package',
                title: '券包管理',
                path: '/marketing/benefit/package',
                routeName: 'package'
              }
            }
          },
          'data-statistics': {
            key: 'data-statistics',
            title: '数据统计',
            type: 'group',
            children: {
              'coupon-logs': {
                key: 'coupon-logs',
                title: '权益日志',
                path: '/marketing/statistics/logs',
                routeName: 'couponLogs'
              },
              'inventory': {
                key: 'inventory',
                title: '库存查询',
                path: '/marketing/statistics/inventory',
                routeName: 'inventory'
              }
            }
          }
        }
      },
      'marketing-center': {
        key: 'marketing-center',
        title: '营销中心',
        type: 'group',
        children: {
          'marketing-tasks': {
            key: 'marketing-tasks',
            title: '营销任务',
            path: '/marketing/tasks',
            routeName: 'marketing-tasks'
          }
        }
      }
    }
  },

  // 数字风险
  risk: {
    key: 'risk',
    title: '数字风险',
    icon: 'icon-safe',
    type: 'module',
    defaultPath: '/risk/index',
    children: {
      'risk-index': {
        key: 'risk-index',
        title: '风险首页',
        path: '/risk/index',
        routeName: 'riskIndex'
      }
    }
  },

  // 触达管理
  touch: {
    key: 'touch',
    title: '触达管理',
    icon: 'icon-send',
    type: 'module',
    defaultPath: '/touch',
    children: {
      'touch-index': {
        key: 'touch-index',
        title: '触达首页',
        path: '/touch',
        routeName: 'TouchIndex'
      },
      'channel-blacklist': {
        key: 'channel-blacklist',
        title: '渠道黑名单',
        path: '/touch/channel/blacklist',
        routeName: 'ChannelBlacklist'
      },
      'manual-sms': {
        key: 'manual-sms',
        title: '手动短信',
        path: '/touch/manual-sms',
        routeName: 'ManualSMS'
      },
      'manual-sms-list': {
        key: 'manual-sms-list',
        title: '手动短信列表',
        path: '/touch/manual-sms/list',
        routeName: 'ManualSMSList'
      },
      'policy-template': {
        key: 'policy-template',
        title: '策略模板',
        path: '/touch/policy/template',
        routeName: 'PolicyTemplate'
      },
      'touch-query': {
        key: 'touch-query',
        title: '触达查询',
        path: '/touch/query',
        routeName: 'TouchQuery'
      }
    }
  }
}

// 顶部菜单配置（按顺序）
export const TOP_MENU_ORDER = [
  'home',
  'discovery', 
  'exploration', 
  'management', 
  'marketing', 
  'risk', 
  'touch'
]

// 工具函数：根据路径获取菜单项
export function getMenuItemByPath(path) {
  for (const moduleKey in MENU_CONFIG) {
    const module = MENU_CONFIG[moduleKey]
    
    if (module.path === path) {
      return { module: moduleKey, item: module }
    }
    
    if (module.children) {
      const result = findInChildren(module.children, path)
      if (result) {
        return { module: moduleKey, ...result }
      }
    }
  }
  return null
}

// 递归查找子菜单
function findInChildren(children, path) {
  for (const childKey in children) {
    const child = children[childKey]
    
    if (child.path === path) {
      return { item: child, parent: childKey }
    }
    
    if (child.children) {
      const result = findInChildren(child.children, path)
      if (result) {
        return { ...result, parent: childKey }
      }
    }
  }
  return null
}

// 工具函数：根据路由名称获取菜单项
export function getMenuItemByRouteName(routeName) {
  for (const moduleKey in MENU_CONFIG) {
    const module = MENU_CONFIG[moduleKey]
    
    if (module.routeName === routeName) {
      return { module: moduleKey, item: module }
    }
    
    if (module.children) {
      const result = findInChildrenByRouteName(module.children, routeName)
      if (result) {
        return { module: moduleKey, ...result }
      }
    }
  }
  return null
}

// 递归查找子菜单（按路由名称）
function findInChildrenByRouteName(children, routeName) {
  for (const childKey in children) {
    const child = children[childKey]
    
    if (child.routeName === routeName) {
      return { item: child, parent: childKey }
    }
    
    if (child.children) {
      const result = findInChildrenByRouteName(child.children, routeName)
      if (result) {
        return { ...result, parent: childKey }
      }
    }
  }
  return null
}

// 工具函数：获取模块的默认路径
export function getModuleDefaultPath(moduleKey) {
  const module = MENU_CONFIG[moduleKey]
  if (!module) return null
  
  return module.defaultPath || module.path
}

// 工具函数：将配置转换为菜单树结构
export function convertToMenuTree(moduleKey) {
  const module = MENU_CONFIG[moduleKey]
  if (!module || !module.children) return []
  
  return convertChildrenToTree(module.children)
}

function convertChildrenToTree(children) {
  const result = []
  
  for (const childKey in children) {
    const child = children[childKey]
    const menuItem = {
      key: child.key,
      title: child.title,
      path: child.path,
      routeName: child.routeName,
      type: child.type
    }
    
    if (child.children) {
      menuItem.children = convertChildrenToTree(child.children)
    }
    
    result.push(menuItem)
  }
  
  return result
}