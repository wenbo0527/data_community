/**
 * 模型离线分析路由配置
 * 集成到数字风险平台中
 */

export const modelOfflineAnalysisRoutes = [
  {
    path: 'model-offline-analysis',
    name: 'ModelOfflineAnalysis',
    redirect: '/risk/model-offline-analysis/feature-center',
    component: () => import('../pages/risk/model-offline-analysis/Layout.vue'),
    meta: {
      title: '模型离线分析',
      icon: 'icon-storage',
      permission: 'user'
    },
    children: [
      {
        path: 'feature-center',
        name: 'RiskFeatureCenter',
        component: () => import('../pages/risk/model-offline-analysis/featureCenter/index.vue'),
        meta: {
          title: '特征中心',
          icon: 'icon-apps',
          permission: 'user'
        }
      },
      {
        path: 'feature-center/detail/:id',
        name: 'RiskFeatureDetail',
        component: () => import('../pages/risk/model-offline-analysis/featureCenter/detail.vue'),
        meta: {
          title: '特征详情',
          hideInMenu: true,
          permission: 'user'
        }
      },
      {
        path: 'feature-center/edit/:id',
        name: 'RiskFeatureEdit',
        component: () => import('../pages/risk/model-offline-analysis/featureCenter/edit.vue'),
        meta: {
          title: '编辑特征',
          hideInMenu: true,
          permission: 'user'
        }
      },
      {
        path: 'model-register',
        name: 'RiskModelRegister',
        component: () => import('../pages/risk/model-offline-analysis/modelRegister/index.vue'),
        meta: {
          title: '模型注册',
          icon: 'icon-robot',
          permission: 'user'
        }
      },
      {
        path: 'model-register/create',
        name: 'RiskModelCreate',
        component: () => import('../pages/risk/model-offline-analysis/modelRegister/create.vue'),
        meta: {
          title: '注册模型',
          hideInMenu: true,
          permission: 'user'
        }
      },
      {
        path: 'model-register/detail/:id',
        name: 'RiskModelDetail',
        component: () => import('../pages/risk/model-offline-analysis/modelRegister/detail.vue'),
        meta: {
          title: '模型详情',
          hideInMenu: true,
          permission: 'user'
        }
      },
      {
        path: 'model-register/edit/:id',
        name: 'RiskModelEdit',
        component: () => import('../pages/risk/model-offline-analysis/modelRegister/edit.vue'),
        meta: {
          title: '编辑模型',
          hideInMenu: true,
          permission: 'user'
        }
      },
      {
        path: 'model-backtrack',
        name: 'RiskModelBacktrack',
        component: () => import('../pages/risk/model-offline-analysis/modelBacktrack/index.vue'),
        meta: {
          title: '模型回溯',
          icon: 'icon-history',
          permission: 'user'
        }
      },
      {
        path: 'model-backtrack/create',
        name: 'RiskModelBacktrackCreate',
        component: () => import('../pages/risk/model-offline-analysis/modelBacktrack/create.vue'),
        meta: {
          title: '新建回溯',
          hideInMenu: true,
          permission: 'user'
        }
      },
      {
        path: 'model-backtrack/detail/:id',
        name: 'RiskModelBacktrackDetail',
        component: () => import('../pages/risk/model-offline-analysis/modelBacktrack/detail.vue'),
        meta: {
          title: '回溯详情',
          hideInMenu: true,
          permission: 'user'
        }
      },
      {
        path: 'task-management',
        name: 'RiskTaskManagement',
        component: () => import('../pages/risk/model-offline-analysis/taskManagement/index.vue'),
        meta: {
          title: '任务管理',
          icon: 'icon-tasks',
          permission: 'user'
        }
      },
      {
        path: 'task-management/detail/:id',
        name: 'RiskTaskDetail',
        component: () => import('../pages/risk/model-offline-analysis/taskManagement/detail.vue'),
        meta: {
          title: '任务详情',
          hideInMenu: true,
          permission: 'user'
        }
      },
      {
        path: 'model-evaluation',
        name: 'RiskModelEvaluation',
        component: () => import('../pages/risk/model-offline-analysis/modelEvaluation/index.vue'),
        meta: {
          title: '模型评估',
          icon: 'icon-chart-line',
          permission: 'user'
        }
      }
    ]
  }
]

export default modelOfflineAnalysisRoutes
