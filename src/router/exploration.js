export default [
  {
    path: 'external-data-analysis',
    name: 'external-data-analysis',
    component: () => import('../pages/exploration/external-data-analysis/index.vue'),
    children: [
      {
        path: 'budget-management',
        name: 'budget-management',
        redirect: '/risk/budget-overview'
      },
      {
        path: 'external-data-tracking-overview',
        name: 'externalDataTrackingOverview',
        component: () => import('../pages/exploration/external-data-analysis/external-data-tracking-overview.vue')
      },
      {
        path: 'external-data-monitor',
        name: 'external-data-monitor',
        component: () => import('../pages/exploration/external-data-analysis/external-data-monitor.vue')
      }
    ]
  },
  {
    path: 'external-data-evaluation',
    name: 'external-data-evaluation',
    component: () => import('../pages/exploration/external-data-evaluation.vue'),
    children: [
      {
        path: 'list',
        name: 'externalDataEvaluationList',
        component: () => import('../pages/exploration/ExternalDataEvaluationList.vue')
      },
      {
        path: 'create',
        name: 'createExternalDataEvaluation',
        component: () => import('../pages/exploration/CreateExternalDataEvaluationPage.vue')
      },
      {
        path: 'detail/:id',
        name: 'externalDataEvaluationDetail',
        component: () => import('../pages/exploration/ExternalDataEvaluationDetail.vue')
      },
      {
        path: 'edit/:id',
        name: 'externalDataEvaluationEdit',
        component: () => import('../pages/exploration/ExternalDataEvaluationEdit.vue')
      },
      {
        path: 'task-list',
        name: 'externalDataEvaluationTaskList',
        component: () => import('../pages/exploration/TaskListPage.vue')
      },
      {
        path: 'progress',
        name: 'externalDataEvaluationProgress',
        component: () => import('../pages/exploration/TaskProgressPage.vue')
      }
    ]
  },

  {
    path: 'customer-center',
    name: 'customer-center',
    component: () => import('../pages/exploration/customer-center/index.vue'),
    children: [
      {
        path: 'event-center',
        name: 'event-center',
        component: () => import('../pages/exploration/customer-center/event-center/index.vue')
      },
      {
        path: 'event-center/event-management',
        name: 'event-management',
        component: () => import('../pages/exploration/customer-center/event-center/event-management.vue')
      },
      {
        path: 'event-center/virtual-events',
        name: 'virtual-events',
        component: () => import('../pages/exploration/customer-center/event-center/virtual-events.vue')
      },
      {
        path: 'event-center/sample-stats',
        name: 'sample-stats',
        component: () => import('../pages/exploration/customer-center/event-center/sample-stats.vue')
      },
      {
        path: 'event-center/kafka-datasource',
        name: 'kafka-datasource',
        component: () => import('../pages/exploration/customer-center/event-center/kafka-datasource.vue')
      },
      {
        path: 'tag-system',
        name: 'tag-system',
        component: () => import('../pages/exploration/customer-center/tag-system/index.vue'),
        children: [
          {
            path: 'table-management',
            name: 'table-management',
            component: () => import('../pages/exploration/customer-center/tag-system/table-management.vue')
          },
          {
            path: 'tag-management',
            name: 'tag-management',
            component: () => import('../pages/exploration/customer-center/tag-system/tag-management.vue')
          },
          {
            path: 'tag-create',
            name: 'tag-create',
            component: () => import('../pages/exploration/customer-center/tag-system/tag-create.vue')
          },
          {
            path: 'tag-detail/:id',
            name: 'tag-detail',
            component: () => import('../pages/exploration/customer-center/tag-system/tag-detail.vue')
          },
          {
            path: 'attribute-management',
            name: 'attribute-management',
            component: () => import('../pages/exploration/customer-center/tag-system/attribute-management.vue')
          },
          {
            path: 'table-registration',
            name: 'table-registration',
            component: () => import('../pages/exploration/customer-center/tag-system/table-registration.vue')
          }
        ]
      },
      {
        path: 'datasource-management',
        name: 'datasource-management',
        component: () => import('../pages/exploration/customer-center/datasource/index.vue')
      },
      {
        path: 'audience-system',
        name: 'audience-system',
        component: () => import('../pages/exploration/customer-center/audience-system/index.vue'),
        children: [
          {
            path: 'audience-management',
            name: 'audience-management',
            component: () => import('../pages/exploration/customer-center/audience-system/audience-management.vue')
          },
          {
            path: 'audience-create',
            name: 'audience-create',
            component: () => import('../pages/exploration/customer-center/audience-system/audience-create.vue')
          },
          {
            path: 'audience-detail',
            name: 'audience-detail',
            component: () => import('../pages/exploration/customer-center/audience-system/audience-detail.vue')
          },
          {
            path: 'test-icons',
            name: 'test-icons',
            component: () => import('../pages/test-icons.vue')
          }
        ]
      }
    ]
  },

  // 分析流程可视化编辑工具
  {
    path: 'workflows',
    name: 'workflows',
    component: () => import('../pages/exploration/workflows/index.vue'),
    children: [
      {
        path: '',
        name: 'workflow-manager',
        component: () => import('../pages/exploration/workflows/WorkflowManager.vue')
      },
      {
        path: 'create',
        name: 'workflow-create',
        component: () => import('../pages/exploration/workflows/WorkflowCreate.vue')
      },
      {
        path: ':id/edit',
        name: 'workflow-editor',
        component: () => import('../pages/exploration/workflows/WorkflowEditor.vue')
      },
      {
        path: 'datasources',
        name: 'workflow-datasources',
        component: () => import('../pages/exploration/workflows/DataSourceConfig.vue')
      }
    ]
  }
];
