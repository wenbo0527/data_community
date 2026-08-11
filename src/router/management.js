export default [{
  path: '/management',
  redirect: '/management/service',
  children: [
    {
      path: 'service',
      name: 'management-service',
      component: () => import('../pages/management/service/index.vue'),
      meta: { title: '服务管理' }
    },
    {
      path: 'service/backtrack',
      name: 'management-service-backtrack',
      component: () => import('../pages/management/service/backtrack.vue'),
      meta: { title: '全量变量回溯申请' }
    },
    {
      path: 'service/fund-usage-query',
      name: 'fund-usage-query',
      component: () => import('../pages/management/service/fund-usage-query/index.vue'),
      meta: { title: '客户资金用途外数查询' }
    },
    {
      path: 'service/api-management',
      name: 'management-service-api-list',
      component: () => import('../pages/management/service/api-management/index.vue'),
      meta: { title: 'API管理' }
    },
    {
      path: 'service/api-management/create',
      name: 'management-service-api-create',
      component: () => import('../pages/management/service/api-management/Wizard.vue'),
      meta: { title: '新建API' }
    },
    {
      path: 'service/api-management/:id/edit',
      name: 'management-service-api-edit',
      component: () => import('../pages/management/service/api-management/Wizard.vue'),
      meta: { title: '编辑API' },
      props: true
    },
    {
      path: 'service/detail-data-query',
      name: 'detail-data-query',
      component: () => import('../pages/management/service/detail-data-query.vue'),
      meta: { title: '明细查询服务管理' }
    },
    {
      path: 'service/data-models',
      name: 'data-models',
      component: () => import('../pages/management/data-models/index.vue'),
      meta: { title: '数据服务模型管理' },
      children: [
        {
          path: '',
          name: 'data-models-list',
          component: () => import('../pages/management/data-models/DataModelsList.vue'),
          meta: { title: '数据模型列表' }
        },
        {
          path: 'create',
          name: 'data-models-create',
          component: () => import('../pages/management/data-models/DataModelsForm.vue'),
          meta: { title: '新增数据模型' }
        },
        {
          path: ':id/edit',
          name: 'data-models-edit',
          component: () => import('../pages/management/data-models/DataModelsForm.vue'),
          meta: { title: '编辑数据模型' },
          props: true
        },
        {
          path: ':id',
          name: 'data-models-detail',
          component: () => import('../pages/management/data-models/DataModelsDetail.vue'),
          meta: { title: '数据模型详情' },
          props: true
        }
      ]
    },
    {
      path: 'service/monitor',
      name: 'ServiceMonitor',
      component: () => import('../pages/management/service/ServiceMonitor.vue'),
      meta: { title: '服务监控' }
    },
    {
      path: 'service/stats',
      name: 'ServiceStats',
      component: () => import('../pages/management/service/ServiceStats.vue'),
      meta: { title: '调用统计' }
    },
    {
      path: 'metadata',
      meta: { title: '元数据中心' },
      children: [
        {
          path: 'modeling',
          name: 'MetadataModeling',
          component: () => import('../pages/management/metadata/modeling/index.vue'),
          meta: { title: '元数据建模' }
        },
        {
          path: 'query',
          name: 'MetadataQuery',
          component: () => import('../pages/management/metadata/query/index.vue'),
          meta: { title: '元数据查询' }
        }
      ]
    },
    // [accompany 已迁移至 risk-app/modules/accompany/]
    // {
    //   path: 'accompany',
    //   name: 'management-accompany',
    //   component: () => import('../pages/management/accompany/index.vue'),
    //   meta: { title: '陪伴管理' },
    //   children: [
    //     {
    //       path: 'create',
    //       name: 'management-accompany-create',
    //       component: () => import('../pages/management/accompany/create.vue')
    //     },
    //     {
    //       path: 'result',
    //       name: 'management-accompany-result',
    //       component: () => import('../pages/management/accompany/result.vue')
    //     }
    //   ]
    // },
    {
      path: 'business-domain',
      name: 'BusinessDomainList',
      meta: { title: '业务域管理' },
      component: () => import('../pages/management/business-concept/BusinessDomainList.vue')
    },
    {
      path: 'business-entity',
      name: 'BusinessEntityList',
      meta: { title: '业务实体管理' },
      component: () => import('../pages/management/business-concept/BusinessEntityList.vue')
    },
    {
      path: 'business-graph',
      name: 'BusinessRelationGraph',
      meta: { title: '业务图谱' },
      component: () => import('../pages/management/business-concept/BusinessRelationGraph.vue')
    },
    {
      path: 'asset-management',
      meta: { title: '资产管理' },
      children: [
        {
          path: 'data-resources',
          name: 'DataResources',
          meta: { title: '数据资源' },
          component: () => import('../pages/management/asset-management/listing-management/table-management/index.vue'),
          props: { assetType: 'Resource' }
        },
        {
          path: 'data-assets',
          name: 'DataAssets',
          meta: { title: '数据资产' },
          component: () => import('../pages/management/asset-management/listing-management/table-management/index.vue'),
          props: { assetType: 'Asset' }
        },
        {
          path: 'data-elements',
          name: 'DataElements',
          meta: { title: '数据要素' },
          component: () => import('../pages/management/asset-management/listing-management/data-elements/index.vue')
        },
        {
          path: 'basic-management/tag-management',
          name: 'TagManagement',
          meta: { title: '标签管理' },
          component: () => import('../pages/management/asset-management/basic-management/tag-management/index.vue')
        },
        {
          path: 'basic-management/metadata-collection',
          name: 'MetadataCollectionList',
          meta: { title: '元数据采集' },
          component: () => import('../pages/management/asset-management/basic-management/metadata-collection/List.vue')
        },
        {
          path: 'basic-management/metadata-collection/create',
          name: 'MetadataCollectionCreate',
          meta: { title: '创建采集任务' },
          component: () => import('../pages/management/asset-management/basic-management/metadata-collection/index.vue')
        },
        {
          path: 'basic-management/metadata-collection/:id',
          name: 'MetadataCollectionDetail',
          meta: { title: '采集任务详情' },
          component: () => import('../pages/management/asset-management/basic-management/metadata-collection/index.vue'),
          props: true
        },
        {
          path: 'asset-tags',
          name: 'management-asset-tags',
          meta: { title: '资产标签' },
          component: () => import('../pages/management/asset-management/asset-tags/index.vue')
        }
      ]
    },
    {
      path: 'favorites',
      name: 'management-favorites',
      component: () => import('../pages/discovery/favorites/index.vue'),
      meta: { title: '我的收藏' }
    },
    {
      path: 'permission/data-permission/apply',
      name: 'management-data-permission-apply',
      component: () => import('../pages/management/permission/data-permission/apply.vue'),
      meta: { title: '权限申请' }
    },
    {
      path: 'permission',
      name: 'management-permission',
      component: () => import('../pages/management/permission/index.vue'),
      meta: { title: '权限服务' }
    },
    {
      path: 'permission/business-module',
      name: 'BusinessModuleManagement',
      meta: { title: '业务模块管理' },
      component: () => import('../pages/management/permission/business-module/index.vue')
    },
    {
      path: 'permission/role-management',
      name: 'RoleManagement',
      meta: { title: '角色管理' },
      component: () => import('../pages/management/permission/role-management/index.vue')
    },
    {
      path: 'permission/user-management',
      name: 'UserManagement',
      meta: { title: '用户管理' },
      component: () => import('../pages/management/permission/user-management/index.vue')
    },
    {
      path: 'permission/data-permission',
      name: 'DataPermission',
      meta: { title: '数据权限', permission: 'perm.data.manage' },
      component: () => import('../pages/management/permission/data-permission/index.vue')
    },
    {
      path: 'permission/app-permission',
      name: 'AppPermission',
      meta: { title: '应用权限', permission: 'perm.app.manage' },
      component: () => import('../pages/management/permission/app-permission/index.vue')
    },
    {
      path: 'permission/apply/application',
      name: 'management-permission-apply-application',
      component: () => import('../views/management/permission/PermissionApply.vue'),
      meta: { title: '应用权限申请' },
      props: { defaultCategory: 'application' }
    },
    {
      path: 'permission/apply/data',
      name: 'management-permission-apply-data',
      component: () => import('../views/management/permission/PermissionApply.vue'),
      meta: { title: '数据权限申请' },
      props: { defaultCategory: 'data' }
    },
    {
      path: 'data-standard',
      name: 'DataStandard',
      meta: { title: '数据标准' },
      children: [
        {
          path: 'standards',
          name: 'Standards',
          component: () => import('../pages/management/data-standard/standards/index.vue'),
          meta: { title: '数据标准管理' }
        },
        {
          path: 'standards/create',
          name: 'StandardCreate',
          component: () => import('../pages/management/data-standard/standards/edit.vue'),
          meta: { title: '新建数据标准' }
        },
        {
          path: 'standards/:id/edit',
          name: 'StandardEdit',
          component: () => import('../pages/management/data-standard/standards/edit.vue'),
          meta: { title: '编辑数据标准' },
          props: true
        },
        {
          path: 'standards/:id',
          name: 'StandardDetail',
          component: () => import('../pages/management/data-standard/standards/detail.vue'),
          meta: { title: '标准详情' },
          props: true
        },
        {
          path: 'domains',
          name: 'DataDomains',
          component: () => import('../pages/management/data-standard/domains/index.vue'),
          meta: { title: '数据域管理' }
        },
        {
          path: 'domains/create',
          name: 'DataDomainCreate',
          component: () => import('../pages/management/data-standard/domains/edit.vue'),
          meta: { title: '新建数据域' }
        },
        {
          path: 'domains/:id/edit',
          name: 'DataDomainEdit',
          component: () => import('../pages/management/data-standard/domains/edit.vue'),
          meta: { title: '编辑数据域' },
          props: true
        },
        {
          path: 'domains/:id',
          name: 'DataDomainDetail',
          component: () => import('../pages/management/data-standard/domains/detail.vue'),
          meta: { title: '数据域详情' },
          props: true
        },
        {
          path: 'codes',
          name: 'StandardCodes',
          component: () => import('../pages/management/data-standard/codes/index.vue'),
          meta: { title: '标准代码管理' }
        },
        {
          path: 'words',
          name: 'StandardWords',
          component: () => import('../pages/management/data-standard/words/index.vue'),
          meta: { title: '标准单词管理' }
        },
        {
          path: 'audit',
          name: 'StandardAudit',
          component: () => import('../pages/management/data-standard/audit/index.vue'),
          meta: { title: '标准稽核管理' }
        }
      ]
    },
    // === G2: 补齐 management 游离页 ===
    {
      path: 'asset-management/overview',
      name: 'AssetManagementOverview',
      meta: { title: '资产总揽' },
      component: () => import('../pages/management/asset-management/overview/index.vue')
    },
    {
      path: 'asset-management/listing-management/metric-management',
      name: 'MetricManagement',
      meta: { title: '指标登记管理' },
      component: () => import('../pages/management/asset-management/listing-management/metric-management/index.vue')
    },
    {
      path: 'asset-management/listing-management/variable-management',
      name: 'VariableListingManagement',
      meta: { title: '变量登记管理' },
      component: () => import('../pages/management/asset-management/listing-management/variable-management/index.vue')
    },
    {
      path: 'asset-management/listing-management/external-data-management',
      name: 'ExternalDataListingManagement',
      meta: { title: '外数登记管理' },
      component: () => import('../pages/management/asset-management/listing-management/external-data-management/index.vue')
    },
    {
      path: 'business-concept',
      name: 'BusinessConcept',
      meta: { title: '业务概念' },
      component: () => import('../pages/management/business-concept/index.vue')
    },
    {
      path: 'data-map',
      name: 'ManagementDataMap',
      meta: { title: '管理域数据地图' },
      component: () => import('../pages/management/data-map/index.vue')
    },
    // === 权限管理 4 大入口(原 management.js 已注册 children,这里独立注册顶部入口)===
    {
      path: 'permission/apply',
      name: 'management-permission-apply',
      meta: { title: '权限申请' },
      component: () => import('../pages/management/permission/PermissionApply.vue')
    },
    {
      path: 'permission/approval',
      name: 'management-permission-approval',
      meta: { title: '我的审批' },
      component: () => import('../pages/management/permission/PermissionApproval.vue')
    },
    {
      path: 'permission/progress',
      name: 'management-permission-progress',
      meta: { title: '我的进度' },
      component: () => import('../pages/management/permission/PermissionProgress.vue')
    },
    {
      path: 'permission/management',
      name: 'management-permission-management',
      meta: { title: '申请管理' },
      component: () => import('../pages/management/permission/PermissionManagement.vue')
    },
    // === 标签管理子页面 ===
    {
      path: 'asset-management/basic-management/tag-management/apply',
      name: 'TagGroupApply',
      meta: { title: '标签申请' },
      component: () => import('../pages/management/asset-management/basic-management/tag-management/TagGroupApply.vue')
    },
    {
      path: 'asset-management/basic-management/tag-management/form',
      name: 'TagGroupForm',
      meta: { title: '标签表单' },
      component: () => import('../pages/management/asset-management/basic-management/tag-management/TagGroupForm.vue')
    },
    {
      path: 'asset-management/basic-management/tag-management/usage/:tagId',
      name: 'TagUsageDetail',
      meta: { title: '标签使用详情' },
      component: () => import('../pages/management/asset-management/basic-management/tag-management/TagUsageDetail.vue'),
      props: true
    },
    // === 用户管理子页面 ===
    {
      path: 'permission/user-management/organization',
      name: 'OrganizationManagement',
      meta: { title: '组织架构' },
      component: () => import('../pages/management/permission/user-management/OrganizationManagement.vue')
    },
    {
      path: 'permission/user-management/position',
      name: 'PositionManagement',
      meta: { title: '岗位管理' },
      component: () => import('../pages/management/permission/user-management/PositionManagement.vue')
    },
    {
      path: 'permission/user-management/user/:id',
      name: 'UserDetail',
      meta: { title: '用户详情' },
      component: () => import('../pages/management/permission/user-management/UserDetail.vue'),
      props: true
    }
  ]
}]
