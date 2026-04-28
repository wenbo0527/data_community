import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/model-offline-analysis',
    name: 'RiskOfflineModel',
    redirect: 'feature-center',
    component: () => import('../pages/Layout.vue'),
    meta: {
      title: '离线模型',
      icon: 'icon-storage'
    },
    children: [
      {
        path: 'demo',
        name: 'RiskOfflineModelDemo',
        component: () => import('../pages/demo.vue'),
        meta: {
          title: '功能演示',
          icon: 'icon-play-circle'
        }
      },
      {
        path: 'test',
        name: 'RiskOfflineModelTest',
        component: () => import('../pages/test.vue'),
        meta: {
          title: '测试页面',
          icon: 'icon-bug'
        }
      },
      {
        path: 'feature-center',
        name: 'RiskFeatureCenter',
        component: () => import('../pages/featureCenter/index.vue'),
        meta: {
          title: '特征中心',
          icon: 'icon-apps'
        }
      },
      {
        path: 'feature-center/detail/:id',
        name: 'RiskFeatureCenterDetail',
        component: () => import('../pages/featureCenter/detail.vue'),
        meta: {
          title: '特征详情'
        },
        props: true
      },
      {
        path: 'feature-center/edit/:id',
        name: 'RiskFeatureCenterEdit',
        component: () => import('../pages/featureCenter/edit.vue'),
        meta: {
          title: '编辑特征'
        },
        props: true
      },
      {
        path: 'feature-center/create',
        name: 'RiskFeatureCenterCreate',
        component: () => import('../pages/featureCenter/create.vue'),
        meta: {
            title: '新建特征'
        }
      },
      {
        path: 'model-register',
        name: 'RiskModelRegister',
        component: () => import('../pages/modelRegister/index.vue'),
        meta: {
          title: '模型注册',
          icon: 'icon-upload'
        }
      },
      {
        path: 'model-register/create',
        name: 'RiskModelRegisterCreate',
        component: () => import('../pages/modelRegister/create.vue'),
        meta: {
          title: '新建模型'
        }
      },
      {
        path: 'model-register/edit/:id',
        name: 'RiskModelRegisterEdit',
        component: () => import('../pages/modelRegister/edit.vue'),
        meta: {
          title: '编辑模型'
        },
        props: true
      },
      {
        path: 'model-register/detail/:id',
        name: 'RiskModelRegisterDetail',
        component: () => import('../pages/modelRegister/detail.vue'),
        meta: {
          title: '模型详情'
        },
        props: true
      },
      {
        path: 'model-backtrack',
        name: 'RiskModelBacktrack',
        component: () => import('../pages/modelBacktrack/index.vue'),
        meta: {
          title: '模型回溯',
          icon: 'icon-history'
        }
      },
      {
        path: 'model-backtrack/create',
        name: 'RiskModelBacktrackCreate',
        component: () => import('../pages/modelBacktrack/create.vue'),
        meta: {
          title: '新建回溯'
        }
      },
      {
        path: 'model-backtrack/detail/:id',
        name: 'RiskModelBacktrackDetail',
        component: () => import('../pages/modelBacktrack/detail.vue'),
        meta: {
          title: '回溯详情'
        },
        props: true
      },
      {
        path: 'task-management',
        name: 'RiskTaskManagement',
        component: () => import('../pages/taskManagement/index.vue'),
        meta: {
          title: '任务管理',
          icon: 'icon-calendar-clock'
        }
      },
      {
        path: 'task-management/detail/:id',
        name: 'RiskTaskManagementDetail',
        component: () => import('../pages/taskManagement/detail.vue'),
        meta: {
          title: '任务详情'
        },
        props: true
      },
      {
        path: 'model-evaluation',
        name: 'RiskModelEvaluation',
        component: () => import('../pages/modelEvaluation/index.vue'),
        meta: {
          title: '模型评估',
          icon: 'icon-chart-line'
        }
      }
    ]
  }
]

export default routes
