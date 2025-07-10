export default [
  {
    path: 'external-data-analysis',
    name: 'external-data-analysis',
    component: () => import('../pages/exploration/external-data-analysis/index.vue'),
    children: [
      {
        path: 'budget-management',
        name: 'budget-management',
        component: () => import('../pages/exploration/external-data-analysis/budget-management.vue')
      },
      {
        path: 'external-data-evaluation',
        name: 'external-data-evaluation',
        component: () => import('../pages/exploration/external-data-analysis/external-data-evaluation.vue')
      },
      {
        path: 'external-data-monitor',
        name: 'external-data-monitor',
        component: () => import('../pages/exploration/external-data-analysis/external-data-monitor.vue')
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
        component: () => import('../pages/exploration/customer-center/event-center/index.vue'),
        children: [
          {
            path: 'event-management',
            name: 'event-management',
            component: () => import('../pages/exploration/customer-center/event-center/event-management.vue')
          },
          {
            path: 'virtual-events',
            name: 'virtual-events',
            component: () => import('../pages/exploration/customer-center/event-center/virtual-events.vue')
          },
          {
            path: 'sample-stats',
            name: 'sample-stats',
            component: () => import('../pages/exploration/customer-center/event-center/event-sample-stats.vue')
          },
          {
            path: 'kafka-datasource',
            name: 'kafka-datasource',
            component: () => import('../pages/exploration/customer-center/event-center/kafka-datasource.vue')
          }
        ]
      },
      {
        path: 'tag-system',
        name: 'tag-system',
        component: () => import('../pages/exploration/customer-center/tag-system/index.vue'),
        children: [
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
          }
        ]
      },
      {
        path: 'audience-portrait',
        name: 'audience-portrait',
        component: () => import('../pages/exploration/customer-center/audience-portrait/index.vue'),
        children: [
          {
            path: 'audience-management',
            name: 'audience-management',
            component: () => import('../pages/exploration/customer-center/audience-portrait/audience-management.vue')
          }
        ]
      }
    ]
  }
];