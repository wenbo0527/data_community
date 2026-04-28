/**
 * 统一菜单配置
 * 作为顶部菜单、侧边菜单和路由配置的单一数据源
 */

import { ROUTE_PATHS, ROUTE_NAMES } from '../router/constants'

/**
 * 安全获取对象属性
 * @param {Object} obj - 目标对象
 * @param {string} key - 属性键
 * @returns {*} 属性值或undefined
 */
function safeGet(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key) ? obj[key] : undefined;
}

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

  // ====================== 2. 数据发现（消费端：前台查询、使用、分析）====================== 
  discovery: { 
    key: 'discovery', 
    title: '数据发现', 
    icon: 'icon-search', 
    type: 'module', 
    defaultPath: '/discovery/data-map', 
    children: { 
      // 总览层：业务语义总览（原数据地图）
      'data-map': { 
        key: 'data-map', 
        title: '数据地图', 
        path: '/discovery/data-map', 
        routeName: 'dataMap', 
        icon: 'icon-apps' 
      }, 
      // 资源层：数据资源发现 
      'data-resources': { 
        key: 'data-resources', 
        title: '数据资源发现', 
        type: 'group', 
        children: { 
          'system-data': { 
            key: 'system-data', 
            title: '业务系统数据源', 
            path: '/discovery/data-resources/business-system', 
            routeName: 'BusinessSystem' 
          }, 
          'file-import': { 
            key: 'file-import', 
            title: '文件资源', 
            path: '/discovery/data-resources/file-import', 
            routeName: 'FileImport' 
          },
          'external-data': { 
            key: 'external-data', 
            title: '外部数据源', 
            path: '/discovery/data-resources/external-data', 
            routeName: 'ExternalData' 
          },
          'real-time-data': { 
            key: 'real-time-data', 
            title: '实时数据源', 
            path: '/discovery/data-resources/real-time-data', 
            routeName: 'RealTimeData' 
          },
          'log-data': { 
            key: 'log-data', 
            title: '日志数据源', 
            path: '/discovery/data-resources/log-data', 
            routeName: 'LogData' 
          }
        } 
      }, 
      // 资产层：数据资产发现 
      'data-assets': { 
        key: 'data-assets', 
        title: '数据资产发现', 
        type: 'group', 
        children: { 
          'table-search': { 
            key: 'table-search', 
            title: '资产目录', 
            path: '/discovery/data-map/table-list', 
            routeName: 'TableList' 
          }
        } 
      }, 
      // 要素层：数据要素发现
      'data-elements': { 
        key: 'data-elements', 
        title: '数据要素发现', 
        type: 'group', 
        children: { 
          'metrics-map': { 
            key: 'metrics-map', 
            title: '指标地图', 
            path: '/discovery/metrics-map', 
            routeName: 'metricsMap' 
          }, 
          'variable-map': { 
            key: 'variable-map', 
            title: '变量地图', 
            path: '/discovery/variable-map', 
            routeName: 'VariableMapDiscovery' 
          }, 
          'feature-map': { 
            key: 'feature-map', 
            title: '特征地图', 
            path: '/discovery/feature-map', 
            routeName: 'FeatureMapDiscovery' 
          },
          'api-market': { 
            key: 'api-market', 
            title: '其他', 
            path: '/discovery/api-market', 
            routeName: 'ApiMarket' 
          }
        } 
      }, 
      // 工具层：数据资产运营工具 
      'analysis-tools': { 
        key: 'analysis-tools', 
        title: '数据资产运营工具', 
        type: 'group', 
        children: { 
          'lineage': { 
            key: 'lineage', 
            title: '全链路血缘', 
            path: '/discovery/lineage', 
            routeName: 'discovery-lineage' 
          },
          'impact-analysis': {
            key: 'impact-analysis',
            title: '影响分析',
            path: '/discovery/impact-analysis',
            routeName: 'ImpactAnalysis'
          }
        } 
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
      'customer-center': {
        key: 'customer-center',
        title: '客群中心',
        type: 'group',
        children: {
          'customer-360': {
            key: 'customer-360',
            title: '客户360',
            path: ROUTE_PATHS.EXPLORATION.CUSTOMER_CENTER.CUSTOMER_360,
            routeName: ROUTE_NAMES.EXPLORATION.CUSTOMER_CENTER.CUSTOMER_360
          },
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
              'table-management': {
                key: 'table-management',
                title: '标签表管理',
                path: '/exploration/customer-center/tag-system/table-management',
                routeName: 'table-management'
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
              },
              'table-registration': {
                key: 'table-registration',
                title: '标签表注册',
                path: '/exploration/customer-center/tag-system/table-registration',
                routeName: 'table-registration',
                hideInMenu: true // 隐藏在菜单中，通过表管理页面跳转
              },
              'tag-center': {
                key: 'tag-center',
                title: '标签特征中心',
                path: '/exploration/customer-center/tag-system/tag-center',
                routeName: 'tag-center'
              }
              ,
              'datasource-management': {
                key: 'datasource-management',
                title: '数据源管理',
                path: '/exploration/customer-center/datasource-management',
                routeName: 'datasource-management'
              }
            }
          }
        }
      },
      'analysis-tools': {
        key: 'analysis-tools',
        title: '分析工具',
        type: 'group',
        children: {
          'workflow-management': {
            key: 'workflow-management',
            title: '分析流程管理',
            path: '/exploration/workflows',
            routeName: 'workflowManager',
            children: {
              'workflow-list': {
                key: 'workflow-list',
                title: '流程列表',
                path: '/exploration/workflows',
                routeName: 'workflowManager'
              },
              'workflow-create': {
                key: 'workflow-create',
                title: '创建流程',
                path: '/exploration/workflows/create',
                routeName: 'workflowCreate'
              },
              'data-source-config': {
            key: 'data-source-config',
            title: '数据源配置',
            path: '/exploration/workflows/datasources',
            routeName: 'dataSourceConfig'
          }
            }
          }
        }
      },
      'indicator-dashboard': {
        key: 'indicator-dashboard',
        title: '指标看板',
        path: '/exploration/indicator-dashboard',
        routeName: 'indicator-dashboard'
      }
    }
  },

  

  // ====================== 1. 数据管理（管控端：后台配置、治理、运维）====================== 
  management: { 
    key: 'management', 
    title: '数据管理', 
    icon: 'icon-robot', 
    type: 'module', 
    defaultPath: '/management/service', 
    children: { 
      // 核心层：业务数据目录（原业务语义配置） 
      'business-semantic-config': { 
        key: 'business-semantic-config', 
        title: '业务数据目录', 
        type: 'group', 
        children: { 
          'business-domain': { 
            key: 'business-domain', 
            title: '业务域管理', 
            path: '/management/business-domain', 
            routeName: 'BusinessDomainList' 
          }, 
          'business-entity': { 
            key: 'business-entity', 
            title: '业务实体管理', 
            path: '/management/business-entity', 
            routeName: 'BusinessEntityList' 
          }, 
          'business-graph': { 
            key: 'business-graph', 
            title: '业务图谱', 
            path: '/management/business-graph', 
            routeName: 'BusinessRelationGraph' 
          } 
        } 
      }, 

      // 资产层：数据资产管理 
      'asset-management': { 
        key: 'asset-management', 
        title: '数据资产管理', 
        type: 'group', 
        children: { 
          'metadata-collection': { 
            key: 'metadata-collection', 
            title: '元数据采集', 
            path: '/management/asset-management/basic-management/metadata-collection', 
            routeName: 'MetadataCollectionList' 
          },
          'metadata-modeling': {
            key: 'metadata-modeling',
            title: '元数据建模',
            path: '/management/metadata/modeling',
            routeName: 'MetadataModeling'
          },
          'data-resources': { 
            key: 'data-resources', 
            title: '数据资源上下架', 
            path: '/management/asset-management/data-resources', 
            routeName: 'DataResources' 
          }, 
          'data-assets': { 
            key: 'data-assets', 
            title: '数据资产上下架', 
            path: '/management/asset-management/data-assets', 
            routeName: 'DataAssets' 
          }, 
          'data-elements': { 
            key: 'data-elements', 
            title: '数据要素上下架', 
            path: '/management/asset-management/data-elements', 
            routeName: 'DataElements' 
          },
          'tag-management': { 
            key: 'tag-management', 
            title: '标签管理', 
            path: '/management/asset-management/basic-management/tag-management', 
            routeName: 'TagManagement' 
          }
        } 
      }, 
      // 治理层：数据标准治理 
      'data-standard': { 
        key: 'data-standard', 
        title: '数据标准治理', 
        type: 'group', 
        children: { 
          'standards': { 
            key: 'standards', 
            title: '数据标准管理', 
            path: '/management/data-standard/standards', 
            routeName: 'Standards' 
          }, 
          'domains': { 
            key: 'domains', 
            title: '技术数据域管理', 
            path: '/management/data-standard/domains', 
            routeName: 'DataDomains' 
          }, 
          'codes': { 
            key: 'codes', 
            title: '标准代码管理', 
            path: '/management/data-standard/codes', 
            routeName: 'StandardCodes' 
          }, 
          'words': { 
            key: 'words', 
            title: '标准单词管理', 
            path: '/management/data-standard/words', 
            routeName: 'StandardWords' 
          },
          'standard-audit': {
            key: 'standard-audit',
            title: '标准稽核管理',
            path: '/management/data-standard/audit',
            routeName: 'StandardAudit'
          }
        } 
      }, 
            // 应用层：数据服务管理 
      'management-service': { 
        key: 'management-service', 
        title: '数据服务管理', 
        type: 'group', 
        children: { 
          'service-index': { 
            key: 'service-index', 
            title: '服务首页', 
            path: '/management/service', 
            routeName: 'management-service' 
          }, 
          'detail-data-query': { 
            key: 'detail-data-query', 
            title: '明细查询服务管理', 
            path: '/management/service/detail-data-query', 
            routeName: 'detail-data-query' 
          }, 
          'api-management': { 
            key: 'api-management', 
            title: 'API管理', 
            path: '/management/service/api-management', 
            routeName: 'management-service-api-list' 
          }, 
          'data-models': { 
            key: 'data-models', 
            title: '数据服务模型管理', 
            path: '/management/service/data-models', 
            routeName: 'data-models' 
          },
          'service-monitor': {
            key: 'service-monitor',
            title: '服务监控',
            path: '/management/service/monitor',
            routeName: 'ServiceMonitor'
          },
          'service-stats': {
            key: 'service-stats',
            title: '调用统计',
            path: '/management/service/stats',
            routeName: 'ServiceStats'
          }
        } 
      }, 

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
          },
          'global-management': {
            key: 'global-management',
            title: '全局管理',
            type: 'group',
            children: {
              'global-rules': {
                key: 'global-rules',
                title: '全局规则',
                path: '/marketing/global/rules',
                routeName: 'globalRules'
              },
              'alert-management': {
                key: 'alert-management',
                title: '预警管理',
                path: '/marketing/alert/management',
                routeName: 'MarketingAlertManagement'
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
          },
          'marketing-tasks-horizontal': {
            key: 'marketing-tasks-horizontal',
            title: '横版营销画布',
            path: '/marketing/tasks/horizontal',
            routeName: 'marketing-tasks-horizontal'
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
      },
      'accompany': {
        key: 'accompany',
        title: '陪跑计划',
        type: 'group',
        children: {
          'management-accompany-create': {
            key: 'management-accompany-create',
            title: '创建陪跑',
            path: '/risk/accompany/create',
            routeName: 'management-accompany-create'
          },
          'management-accompany-result': {
            key: 'management-accompany-result',
            title: '陪跑结果',
            path: '/risk/accompany/result',
            routeName: 'management-accompany-result'
          }
        }
      },
      'risk-budget-center': {
        key: 'risk-budget-center',
        title: '预算管理',
        type: 'group',
        children: {
          'risk-budget-overview': {
            key: 'risk-budget-overview',
            title: '预算总览',
            path: '/risk/budget-overview',
            routeName: 'BudgetOverview'
          },
          'risk-budget-list': {
            key: 'risk-budget-list',
            title: '预算列表',
            path: '/risk/budget/list',
            routeName: 'BudgetList'
          },
          'risk-contract-management': {
            key: 'risk-contract-management',
            title: '合同管理',
            path: '/risk/budget/contracts',
            routeName: 'RiskBudgetContracts'
          },
          'risk-budget-monitor': {
            key: 'risk-budget-monitor',
            title: '预算监控',
            path: '/risk/budget/monitor',
            routeName: 'RiskBudgetMonitorPage'
          },
          'risk-budget-settlement-index': {
            key: 'risk-budget-settlement-index',
            title: '结算管理',
            path: '/risk/budget/settlement',
            routeName: 'RiskBudgetSettlement'
          }
        }
      },
      'risk-external-data-lifecycle': {
        key: 'risk-external-data-lifecycle',
        title: '外数生命周期',
        type: 'group',
        children: {
          'risk-external-data-lifecycle-index': {
            key: 'risk-external-data-lifecycle-index',
            title: '外数生命周期',
            path: '/risk/external-data/lifecycle',
            routeName: 'RiskExternalDataLifecycle'
          },
          'risk-external-data-archive': {
            key: 'risk-external-data-archive',
            title: '外数档案',
            path: '/risk/external-data/archive',
            routeName: 'RiskExternalDataArchive'
          },
          'risk-external-data-evaluation': {
            key: 'risk-external-data-evaluation',
            title: '外数评估',
            path: '/risk/external-data/evaluation',
            routeName: 'RiskExternalDataEvaluation'
          },
          'risk-budget-management': {
            key: 'risk-budget-management',
            title: '预算管理',
            path: '/risk/budget-overview',
            routeName: 'BudgetOverview'
          },
          'risk-external-data-service': {
            key: 'risk-external-data-service',
            title: '外数服务',
            path: '/risk/external-data/service',
            routeName: 'RiskExternalDataService'
          },
          'risk-external-data-service-scene': {
            key: 'risk-external-data-service-scene',
            title: '外数服务创建（新）',
            path: '/risk/external-data/service-scene',
            routeName: 'RiskExternalDataServiceScene'
          }
        }
      },
      'risk-model-offline-analysis': {
        key: 'risk-model-offline-analysis',
        title: '模型离线分析',
        type: 'group',
        children: {
          'risk-feature-center': {
            key: 'risk-feature-center',
            title: '特征中心',
            path: '/risk/model-offline-analysis/feature-center',
            routeName: 'RiskFeatureCenter'
          },
          'risk-model-register': {
            key: 'risk-model-register',
            title: '模型注册',
            path: '/risk/model-offline-analysis/model-register',
            routeName: 'RiskModelRegister'
          },
          'risk-model-backtrack': {
            key: 'risk-model-backtrack',
            title: '模型回溯',
            path: '/risk/model-offline-analysis/model-backtrack',
            routeName: 'RiskModelBacktrack'
          },
          'risk-task-management': {
            key: 'risk-task-management',
            title: '任务管理',
            path: '/risk/model-offline-analysis/task-management',
            routeName: 'RiskTaskManagement'
          },
          'risk-model-evaluation': {
            key: 'risk-model-evaluation',
            title: '模型评估',
            path: '/risk/model-offline-analysis/model-evaluation',
            routeName: 'RiskModelEvaluation'
          }
        }
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
  },

  // 系统管理
  system: {
    key: 'system',
    title: '系统管理',
    icon: 'icon-settings',
    type: 'module',
    defaultPath: '/management/permission',
    children: {
      // 权限与安全管控
      'permission': {
        key: 'permission',
        title: '权限与安全管控',
        type: 'group',
        children: {
          'permission-apply': {
            key: 'permission-apply',
            title: '权限服务',
            path: '/management/permission',
            routeName: 'management-permission'
          },
          'business-module': {
            key: 'business-module',
            title: '业务模块管理',
            path: '/management/permission/business-module',
            routeName: 'BusinessModuleManagement'
          },
          'role-management': {
            key: 'role-management',
            title: '角色管理',
            path: '/management/permission/role-management',
            routeName: 'RoleManagement'
          },
          'user-management': {
            key: 'user-management',
            title: '用户管理',
            path: '/management/permission/user-management',
            routeName: 'UserManagement'
          },
          'data-permission': {
            key: 'data-permission',
            title: '数据权限',
            path: '/management/permission/data-permission',
            routeName: 'DataPermission'
          },
          'app-permission': {
            key: 'app-permission',
            title: '应用权限',
            path: '/management/permission/app-permission',
            routeName: 'AppPermission'
          }
        }
      },
      // 通知管理
      'notification': {
        key: 'notification',
        title: '通知管理',
        type: 'group',
        children: {
          'notification-list': {
            key: 'notification-list',
            title: '通知列表',
            path: '/admin/notifications/list',
            routeName: 'AdminNotificationList'
          },
          'notification-categories': {
            key: 'notification-categories',
            title: '通知分类',
            path: '/admin/notifications/categories',
            routeName: 'AdminNotificationCategories'
          },
          'user-groups': {
            key: 'user-groups',
            title: '用户组管理',
            path: '/admin/notifications/user-groups',
            routeName: 'AdminUserGroups'
          }
        }
      },
      // 文档管理
      'doc-management': {
        key: 'doc-management',
        title: '文档管理',
        type: 'group',
        children: {
          'doc-list': {
            key: 'doc-list',
            title: '文档列表',
            path: '/admin/docs/list',
            routeName: 'AdminDocList'
          }
        }
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
  'touch',
  'system'
]

/**
 * 菜单项类型定义
 * @typedef {Object} MenuItem
 * @property {string} key - 菜单项唯一标识
 * @property {string} title - 菜单项标题
 * @property {string} path - 菜单项路径
 * @property {string} routeName - 菜单项路由名称
 * @property {string} [icon] - 菜单项图标
 * @property {string} type - 菜单项类型
 * @property {string} [defaultPath] - 默认路径
 * @property {Object.<string, MenuItem>} [children] - 子菜单项
 */

/**
 * 菜单配置类型定义
 * @typedef {Object.<string, MenuItem>} MenuConfig
 */

/**
 * 根据路径获取菜单项
 * @param {string} path - 要查找的路径
 * @returns {{ module: string; item: MenuItem; parent?: string } | null} 菜单项信息或null
 */
export function getMenuItemByPath(path) {
  const moduleKeys = Object.keys(MENU_CONFIG);
  
  for (const moduleKey of moduleKeys) {
    const module = safeGet(MENU_CONFIG, moduleKey);
    
    if (module && module.path === path) {
      return { module: moduleKey, item: module };
    }
    
    if (module && module.children && typeof module.children === 'object') {
      const result = findInChildren(module.children, path);
      if (result) {
        return { module: moduleKey, ...result };
      }
    }
  }
  return null;
}

/**
 * 递归查找子菜单
 * @param {Object.<string, MenuItem>} children - 子菜单对象
 * @param {string} path - 要查找的路径
 * @returns {{ item: MenuItem; parent: string } | null} 菜单项信息或null
 */
function findInChildren(children, path) {
  const childKeys = Object.keys(children);
  
  for (const childKey of childKeys) {
    const child = safeGet(children, childKey);
    
    if (child && child.path === path) {
      return { item: child, parent: childKey };
    }
    
    if (child && child.children && typeof child.children === 'object') {
      const result = findInChildren(child.children, path);
      if (result) {
        return { ...result, parent: childKey };
      }
    }
  }
  return null;
}

/**
 * 根据路由名称获取菜单项
 * @param {string} routeName - 要查找的路由名称
 * @returns {{ module: string; item: MenuItem; parent?: string } | null} 菜单项信息或null
 */
export function getMenuItemByRouteName(routeName) {
  const moduleKeys = Object.keys(MENU_CONFIG);
  
  for (const moduleKey of moduleKeys) {
    const module = safeGet(MENU_CONFIG, moduleKey);
    
    if (module && module.routeName === routeName) {
      return { module: moduleKey, item: module };
    }
    
    if (module && module.children && typeof module.children === 'object') {
      const result = findInChildrenByRouteName(module.children, routeName);
      if (result) {
        return { module: moduleKey, ...result };
      }
    }
  }
  return null;
}

/**
 * 递归查找子菜单（按路由名称）
 * @param {Object} children - 子菜单对象
 * @param {string} routeName - 要查找的路由名称
 * @returns {{ item: any; parent?: string } | null} 菜单项信息或null
 */
function findInChildrenByRouteName(children, routeName) {
  if (!children || typeof children !== 'object') return null;
  const childKeys = Object.keys(children);
  
  for (const childKey of childKeys) {
    const child = children[childKey];
    if (!child) continue;
    
    if (child.routeName === routeName) {
      return { item: child, parent: childKey };
    }
    
    if (child.children && typeof child.children === 'object') {
      const result = findInChildrenByRouteName(child.children, routeName);
      if (result) {
        return { ...result }; // 保持最深层级的 item
      }
    }
  }
  return null;
}

/**
 * 获取模块的默认路径
 * @param {string} moduleKey - 模块键名
 * @returns {string | null} 默认路径或null
 */
export function getModuleDefaultPath(moduleKey) {
  if (!Object.prototype.hasOwnProperty.call(MENU_CONFIG, moduleKey)) {
    return null;
  }
  
  const module = safeGet(MENU_CONFIG, moduleKey);
  return module.defaultPath || module.path;
}

/**
 * 将配置转换为菜单树结构
 * @param {string} moduleKey - 模块键名
 * @returns {Array<{ key: string; title: string; path: string; routeName: string; type: string; children?: any[] }>} 菜单树结构数组
 */
export function convertToMenuTree(moduleKey) {
  if (!Object.prototype.hasOwnProperty.call(MENU_CONFIG, moduleKey)) {
    return [];
  }
  
  const module = safeGet(MENU_CONFIG, moduleKey);
  if (!module || !module.children) return [];
  
  return convertChildrenToTree(module.children);
}

/**
 * 转换子菜单为树结构
 * @param {Object.<string, MenuItem>} children - 子菜单对象
 * @returns {Array<{ key: string; title: string; path: string; routeName: string; type: string; children?: any[] }>} 菜单树结构数组
 */
function convertChildrenToTree(children) {
  const result = [];
  
  const childKeys = Object.keys(children);
  
  for (const childKey of childKeys) {
    const child = safeGet(children, childKey);
    if (!child) continue;
    
    const menuItem = {
      key: child.key,
      title: child.title,
      path: child.path,
      routeName: child.routeName,
      type: child.type
    };
    
    if (child.children && typeof child.children === 'object') {
      menuItem.children = convertChildrenToTree(child.children);
    }
    
    result.push(menuItem);
  }
  
  return result;
}
