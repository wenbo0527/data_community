// 路由常量配置

// 路由名称常量
export const ROUTE_NAMES = {
  // 基础路由
  LOGIN: 'login',
  HOME: 'home',
  
  // 营销模块
  MARKETING: {
    ROOT: 'marketing',
    DASHBOARD: 'couponDashboard',
    BENEFIT: {
      ROOT: 'benefitConfig',
      TEMPLATE: 'template',
      MANAGEMENT: 'management',
      PACKAGE: 'package'
    },
    STATISTICS: {
      ROOT: 'dataStatistics',
      LOGS: 'couponLogs',
      INVENTORY: 'inventory'
    }
  },
  
  // 管理模块
  MANAGEMENT: {
    ROOT: 'management',
    SERVICE: {
      ROOT: 'management-service',
      BACKTRACK: 'management-service-backtrack',
      FUND_USAGE_QUERY: 'fund-usage-query'
    },
    DATA_MODELS: {
      ROOT: 'data-models',
      LIST: 'data-models-list',
      CREATE: 'data-models-create',
      EDIT: 'data-models-edit',
      DETAIL: 'data-models-detail'
    },
    ACCOMPANY: {
      ROOT: 'management-accompany',
      CREATE: 'management-accompany-create',
      RESULT: 'management-accompany-result'
    }
  },
  
  // 探索模块
  EXPLORATION: {
    ROOT: 'exploration',
    EXTERNAL_DATA_ANALYSIS: {
      ROOT: 'external-data-analysis',
      BUDGET_MANAGEMENT: 'budget-management',
      EVALUATION: 'externalDataEvaluationList',
      MONITOR: 'external-data-monitor'
    },
    CUSTOMER_CENTER: {
      ROOT: 'customer-center',
      EVENT_CENTER: {
        ROOT: 'event-center',
        MANAGEMENT: 'event-management',
        VIRTUAL_EVENTS: 'virtual-events',
        SAMPLE_STATS: 'sample-stats',
        KAFKA_DATASOURCE: 'kafka-datasource'
      }
    }
  },
  
  // 触达模块
  TOUCH: {
    ROOT: 'Touch',
    INDEX: 'TouchIndex',
    CHANNEL_BLACKLIST: 'ChannelBlacklist',
    MANUAL_SMS: 'ManualSMS',
    MANUAL_SMS_LIST: 'ManualSMSList',
    POLICY_TEMPLATE: 'PolicyTemplate'
  },
  
  // 发现模块
  DISCOVERY: {
    TABLE_DETAIL: 'TableDetail'
  },
  
  // 外数顶层页面
  EXTERNAL_DATA: {
    LIFECYCLE: 'externalDataLifecycle',
    ARCHIVE: 'externalDataArchive',
    SERVICE: 'externalDataService',
    EVALUATION: 'externalDataEvaluation'
  },
  
  // 风险模块
  RISK: {
    ROOT: 'risk',
    INDEX: 'riskIndex'
  }
}

// 路由路径常量
export const ROUTE_PATHS = {
  LOGIN: '/login',
  HOME: '/home',
  
  MARKETING: {
    ROOT: '/marketing',
    DASHBOARD: '/marketing/dashboard',
    BENEFIT: {
      TEMPLATE: '/marketing/benefit/template',
      MANAGEMENT: '/marketing/benefit/management',
      PACKAGE: '/marketing/benefit/package'
    },
    STATISTICS: {
      LOGS: '/marketing/statistics/logs',
      INVENTORY: '/marketing/statistics/inventory'
    }
  },
  
  MANAGEMENT: {
    ROOT: '/management',
    SERVICE: {
      ROOT: '/management/service',
      BACKTRACK: '/management/service/backtrack',
      FUND_USAGE_QUERY: '/management/service/fund-usage-query'
    },
    DATA_MODELS: {
      ROOT: '/management/data-models',
      LIST: '/management/data-models',
      CREATE: '/management/data-models/create',
      EDIT: '/management/data-models/:id/edit',
      DETAIL: '/management/data-models/:id'
    },
    ACCOMPANY: {
      ROOT: '/management/accompany',
      CREATE: '/management/accompany/create',
      RESULT: '/management/accompany/result'
    }
  },
  
  EXPLORATION: {
    ROOT: '/exploration',
    EXTERNAL_DATA_ANALYSIS: {
      ROOT: '/exploration/external-data-analysis',
      BUDGET_MANAGEMENT: '/exploration/external-data-analysis/budget-management',
      EVALUATION: '/exploration/external-data-evaluation/list',
      MONITOR: '/exploration/external-monitor'
    },
    CUSTOMER_CENTER: {
      ROOT: '/exploration/customer-center',
      EVENT_CENTER: {
        ROOT: '/exploration/customer-center/event-center',
        MANAGEMENT: '/exploration/customer-center/event-center/event-management',
        VIRTUAL_EVENTS: '/exploration/customer-center/event-center/virtual-events',
        SAMPLE_STATS: '/exploration/customer-center/event-center/sample-stats',
        KAFKA_DATASOURCE: '/exploration/customer-center/event-center/kafka-datasource'
      }
    }
  },
  
  TOUCH: {
    ROOT: '/touch',
    CHANNEL_BLACKLIST: '/touch/channel/blacklist',
    MANUAL_SMS: '/touch/manual-sms',
    MANUAL_SMS_LIST: '/touch/manual-sms/list',
    POLICY_TEMPLATE: '/touch/policy/template'
  },
  
  DISCOVERY: {
    TABLE_DETAIL: '/discovery/data-map/table'
  },
  
  // 外数顶层页面路径
  EXTERNAL_DATA: {
    LIFECYCLE: '/external-data-lifecycle',
    ARCHIVE: '/external-data-archive',
    SERVICE: '/external-data-service',
    EVALUATION: '/external-data-evaluation'
  },
  
  // 风险模块
  RISK: {
    ROOT: '/risk',
    INDEX: '/risk/index'
  }
}

// 路由元信息常量
export const ROUTE_META = {
  // 权限相关
  PERMISSIONS: {
    ADMIN: 'admin',
    USER: 'user',
    GUEST: 'guest'
  },
  
  // 页面类型
  PAGE_TYPES: {
    LIST: 'list',
    DETAIL: 'detail',
    FORM: 'form',
    DASHBOARD: 'dashboard'
  },
  
  // 布局类型
  LAYOUTS: {
    DEFAULT: 'default',
    TOUCH: 'touch',
    MANAGEMENT: 'management',
    BLANK: 'blank'
  }
}

// 默认路由元信息
export const DEFAULT_ROUTE_META = {
  title: '',
  icon: '',
  hidden: false,
  cache: true,
  permission: ROUTE_META.PERMISSIONS.USER,
  layout: ROUTE_META.LAYOUTS.DEFAULT,
  pageType: ROUTE_META.PAGE_TYPES.LIST
}

// 面包屑配置
export const BREADCRUMB_CONFIG = {
  [ROUTE_NAMES.MARKETING.DASHBOARD]: [
    { title: '营销管理', path: ROUTE_PATHS.MARKETING.ROOT },
    { title: '权益首页', path: ROUTE_PATHS.MARKETING.DASHBOARD }
  ],
  [ROUTE_NAMES.MARKETING.BENEFIT.TEMPLATE]: [
    { title: '营销管理', path: ROUTE_PATHS.MARKETING.ROOT },
    { title: '权益配置', path: '' },
    { title: '券模版管理', path: ROUTE_PATHS.MARKETING.BENEFIT.TEMPLATE }
  ],
  [ROUTE_NAMES.MARKETING.BENEFIT.MANAGEMENT]: [
    { title: '营销管理', path: ROUTE_PATHS.MARKETING.ROOT },
    { title: '权益配置', path: '' },
    { title: '券管理', path: ROUTE_PATHS.MARKETING.BENEFIT.MANAGEMENT }
  ],
  [ROUTE_NAMES.MARKETING.BENEFIT.PACKAGE]: [
    { title: '营销管理', path: ROUTE_PATHS.MARKETING.ROOT },
    { title: '权益配置', path: '' },
    { title: '券包管理', path: ROUTE_PATHS.MARKETING.BENEFIT.PACKAGE }
  ],
  [ROUTE_NAMES.MANAGEMENT.SERVICE.ROOT]: [
    { title: '管理中心', path: ROUTE_PATHS.MANAGEMENT.ROOT },
    { title: '服务管理', path: ROUTE_PATHS.MANAGEMENT.SERVICE.ROOT }
  ],
  [ROUTE_NAMES.MANAGEMENT.SERVICE.BACKTRACK]: [
    { title: '管理中心', path: ROUTE_PATHS.MANAGEMENT.ROOT },
    { title: '服务管理', path: ROUTE_PATHS.MANAGEMENT.SERVICE.ROOT },
    { title: '全量变量回溯申请', path: ROUTE_PATHS.MANAGEMENT.SERVICE.BACKTRACK }
  ],
  [ROUTE_NAMES.EXPLORATION.EXTERNAL_DATA_ANALYSIS.BUDGET_MANAGEMENT]: [
    { title: '探索分析', path: ROUTE_PATHS.EXPLORATION.ROOT },
    { title: '外部数据分析', path: ROUTE_PATHS.EXPLORATION.EXTERNAL_DATA_ANALYSIS.ROOT },
    { title: '预算管理', path: ROUTE_PATHS.EXPLORATION.EXTERNAL_DATA_ANALYSIS.BUDGET_MANAGEMENT }
  ],
  [ROUTE_NAMES.EXTERNAL_DATA.LIFECYCLE]: [
    { title: '外数中心', path: '' },
    { title: '生命周期总览', path: ROUTE_PATHS.EXTERNAL_DATA.LIFECYCLE }
  ],
  [ROUTE_NAMES.EXTERNAL_DATA.EVALUATION]: [
    { title: '外数中心', path: '' },
    { title: '评估中心', path: ROUTE_PATHS.EXTERNAL_DATA.EVALUATION }
  ],
  [ROUTE_NAMES.EXTERNAL_DATA.ARCHIVE]: [
    { title: '外数中心', path: '' },
    { title: '档案管理', path: ROUTE_PATHS.EXTERNAL_DATA.ARCHIVE }
  ],
  [ROUTE_NAMES.EXTERNAL_DATA.SERVICE]: [
    { title: '外数中心', path: '' },
    { title: '数据服务', path: ROUTE_PATHS.EXTERNAL_DATA.SERVICE }
  ]
}

// 菜单配置
export const MENU_CONFIG = {
  // 主菜单
  main: [
    {
      key: 'marketing',
      title: '营销管理',
      icon: 'icon-gift',
      path: ROUTE_PATHS.MARKETING.ROOT,
      children: [
        {
          key: 'marketing-dashboard',
          title: '权益首页',
          path: ROUTE_PATHS.MARKETING.DASHBOARD
        },
        {
          key: 'marketing-benefit',
          title: '权益配置',
          children: [
            {
              key: 'marketing-benefit-template',
              title: '券模版管理',
              path: ROUTE_PATHS.MARKETING.BENEFIT.TEMPLATE
            },
            {
              key: 'marketing-benefit-management',
              title: '券管理',
              path: ROUTE_PATHS.MARKETING.BENEFIT.MANAGEMENT
            },
            {
              key: 'marketing-benefit-package',
              title: '券包管理',
              path: ROUTE_PATHS.MARKETING.BENEFIT.PACKAGE
            }
          ]
        },
        {
          key: 'marketing-statistics',
          title: '数据统计',
          children: [
            {
              key: 'marketing-statistics-logs',
              title: '权益日志',
              path: ROUTE_PATHS.MARKETING.STATISTICS.LOGS
            },
            {
              key: 'marketing-statistics-inventory',
              title: '库存统计',
              path: ROUTE_PATHS.MARKETING.STATISTICS.INVENTORY
            }
          ]
        }
      ]
    },
    {
      key: 'management',
      title: '管理中心',
      icon: 'icon-settings',
      path: ROUTE_PATHS.MANAGEMENT.ROOT,
      children: [
        {
          key: 'management-service',
          title: '服务管理',
          path: ROUTE_PATHS.MANAGEMENT.SERVICE.ROOT
        },
        {
          key: 'management-accompany',
          title: '陪伴管理',
          path: ROUTE_PATHS.MANAGEMENT.ACCOMPANY.ROOT
        }
      ]
    },
    {
      key: 'exploration',
      title: '探索分析',
      icon: 'icon-search',
      path: ROUTE_PATHS.EXPLORATION.ROOT,
      children: [
        {
          key: 'exploration-external-data',
          title: '外部数据分析',
          path: ROUTE_PATHS.EXPLORATION.EXTERNAL_DATA_ANALYSIS.ROOT
        },
        {
          key: 'exploration-customer-center',
          title: '客户中心',
          path: ROUTE_PATHS.EXPLORATION.CUSTOMER_CENTER.ROOT
        }
      ]
    },
    {
      key: 'touch',
      title: '触达管理',
      icon: 'icon-send',
      path: ROUTE_PATHS.TOUCH.ROOT
    }
  ]
}

// 路由守卫配置
export const ROUTE_GUARD_CONFIG = {
  // 白名单路由（无需登录）
  whiteList: [
    ROUTE_PATHS.LOGIN,
    ROUTE_PATHS.HOME,
    '/discovery/customer360',
    '/discovery/customer360/123'
  ],
  
  // 需要权限验证的路由
  authRequired: [
    ROUTE_PATHS.MARKETING.ROOT,
    ROUTE_PATHS.MANAGEMENT.ROOT,
    ROUTE_PATHS.EXPLORATION.ROOT,
    ROUTE_PATHS.TOUCH.ROOT
  ],
  
  // 默认重定向路径
  defaultRedirect: ROUTE_PATHS.HOME,
  
  // 登录页面路径
  loginPath: ROUTE_PATHS.LOGIN
}