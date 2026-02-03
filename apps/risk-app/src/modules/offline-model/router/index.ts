import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/model-offline-analysis',
    name: 'OfflineModel',
    redirect: '/model-offline-analysis/feature-center',
    component: () => import('../pages/Layout.vue'),
    meta: {
      title: '离线模型',
      icon: 'icon-storage'
    },
    children: [
      {
        path: 'demo',
        name: 'OfflineModelDemo',
        component: () => import('../pages/demo.vue'),
        meta: {
          title: '功能演示',
          icon: 'icon-play-circle'
        }
      },
      {
        path: 'test',
        name: 'OfflineModelTest',
        component: () => import('../pages/test.vue'),
        meta: {
          title: '测试页面',
          icon: 'icon-bug'
        }
      },
      {
        path: 'feature-center',
        name: 'FeatureCenter',
        component: () => import('../pages/featureCenter/index.vue'),
        meta: {
          title: '特征中心',
          icon: 'icon-apps'
        }
      },
      {
        path: 'feature-center/detail/:id',
        name: 'FeatureCenterDetail',
        component: () => import('../pages/featureCenter/detail.vue'),
        meta: {
          title: '特征详情'
        },
        props: true
      },
      {
        path: 'feature-center/edit/:id',
        name: 'FeatureCenterEdit',
        component: () => import('../pages/featureCenter/edit.vue'),
        meta: {
          title: '编辑特征'
        },
        props: true
      },
      {
        path: 'feature-center/create',
        name: 'FeatureCenterCreate',
        component: () => import('../pages/featureCenter/create.vue'), // 注意：原路由没有显式定义 create，但 edit 可能会用到。检查一下原路由是否有 create
        meta: {
            title: '新建特征'
        }
      },
      {
        path: 'model-register',
        name: 'ModelRegister',
        component: () => import('../pages/modelRegister/index.vue'),
        meta: {
          title: '模型注册',
          icon: 'icon-upload'
        }
      },
      {
        path: 'model-register/create',
        name: 'ModelRegisterCreate',
        component: () => import('../pages/modelRegister/create.vue'),
        meta: {
          title: '新建模型'
        }
      },
      {
        path: 'model-register/edit/:id',
        name: 'ModelRegisterEdit',
        component: () => import('../pages/modelRegister/edit.vue'),
        meta: {
          title: '编辑模型'
        },
        props: true
      },
      {
        path: 'model-register/detail/:id',
        name: 'ModelRegisterDetail',
        component: () => import('../pages/modelRegister/detail.vue'),
        meta: {
          title: '模型详情'
        },
        props: true
      },
      {
        path: 'model-backtrack',
        name: 'ModelBacktrack',
        component: () => import('../pages/modelBacktrack/index.vue'),
        meta: {
          title: '模型回溯',
          icon: 'icon-history'
        }
      },
      {
        path: 'model-backtrack/create',
        name: 'ModelBacktrackCreate',
        component: () => import('../pages/modelBacktrack/create.vue'),
        meta: {
          title: '新建回溯'
        }
      },
      {
        path: 'model-backtrack/detail/:id',
        name: 'ModelBacktrackDetail',
        component: () => import('../pages/modelBacktrack/detail.vue'),
        meta: {
          title: '回溯详情'
        },
        props: true
      },
      {
        path: 'task-management',
        name: 'TaskManagement',
        component: () => import('../pages/taskManagement/index.vue'),
        meta: {
          title: '任务管理',
          icon: 'icon-calendar-clock'
        }
      },
      {
        path: 'task-management/detail/:id',
        name: 'TaskManagementDetail',
        component: () => import('../pages/taskManagement/detail.vue'),
        meta: {
          title: '任务详情'
        },
        props: true
      },
      {
        path: 'model-evaluation',
        name: 'ModelEvaluation',
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
