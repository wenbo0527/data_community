/**
 * 离线模型模块路由配置
 */

export const offlineModelRoutes = [
  {
    path: '/offline-model',
    name: 'OfflineModel',
    redirect: '/offline-model/feature-center',
    component: () => import('../pages/offlineModel/Layout.vue'),
    meta: {
      title: '离线模型',
      icon: 'icon-storage'
    },
    children: [
      {
        path: 'demo',
        name: 'OfflineModelDemo',
        component: () => import('../pages/offlineModel/demo.vue'),
        meta: {
          title: '功能演示',
          icon: 'icon-play-circle'
        }
      },
      {
        path: 'test',
        name: 'OfflineModelTest',
        component: () => import('../pages/offlineModel/test.vue'),
        meta: {
          title: '测试页面',
          icon: 'icon-bug'
        }
      },
      {
        path: 'feature-center',
        name: 'FeatureCenter',
        component: () => import('../pages/offlineModel/featureCenter/index.vue'),
        meta: {
          title: '特征中心',
          icon: 'icon-apps'
        }
      },
      {
        path: 'model-register',
        name: 'ModelRegister',
        component: () => import('../pages/offlineModel/modelRegister/index.vue'),
        meta: {
          title: '模型注册',
          icon: 'icon-upload'
        }
      },
      {
        path: 'model-backtrack',
        name: 'ModelBacktrack',
        component: () => import('../pages/offlineModel/modelBacktrack/index.vue'),
        meta: {
          title: '模型回溯',
          icon: 'icon-history'
        }
      },
      {
        path: 'task-management',
        name: 'TaskManagement',
        component: () => import('../pages/offlineModel/taskManagement/index.vue'),
        meta: {
          title: '任务管理',
          icon: 'icon-calendar-clock'
        }
      },
      {
        path: 'model-evaluation',
        name: 'ModelEvaluation',
        component: () => import('../pages/offlineModel/modelEvaluation/index.vue'),
        meta: {
          title: '模型评估',
          icon: 'icon-chart-line'
        }
      }
    ]
  }
]

export default offlineModelRoutes