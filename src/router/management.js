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
      meta: { title: '明细数据查询服务' }
    },
    {
      path: 'data-models',
      name: 'data-models',
      component: () => import('../pages/management/data-models/index.vue'),
      meta: { title: '数据查询&管理模型' },
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
      path: 'accompany',
      name: 'management-accompany',
      component: () => import('../pages/management/accompany/index.vue'),
      meta: { title: '陪伴管理' },
      children: [
        {
          path: 'create',
          name: 'management-accompany-create',
          component: () => import('../pages/management/accompany/create.vue')
        },
        {
          path: 'result',
          name: 'management-accompany-result',
          component: () => import('../pages/management/accompany/result.vue')
        }
      ]
    },
    {
      path: 'asset-management',
      meta: { title: '资产管理' },
      children: [

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
          path: 'listing-management/table-management',
          name: 'TableManagement',
          meta: { title: '表管理' },
          component: () => import('../pages/management/asset-management/listing-management/table-management/index.vue')
        },
        {
          path: 'listing-management/table-management/register',
          name: 'TableRegister',
          meta: { title: '注册表单' },
          component: () => import('../pages/management/asset-management/listing-management/table-management/RegisterTableForm.vue')
        },
        {
          path: 'listing-management/external-data-management',
          name: 'ExternalDataManagement',
          meta: { title: '外数管理' },
          component: () => import('../pages/management/asset-management/listing-management/external-data-management/index.vue')
        },
        {
          path: 'listing-management/metric-management',
          name: 'MetricManagement',
          meta: { title: '指标管理' },
          component: () => import('../pages/management/asset-management/listing-management/metric-management/index.vue')
        },
        {
          path: 'listing-management/metric-management/create/edit',
          name: 'MetricCreate',
          meta: { title: '新建指标' },
          component: () => import('../pages/management/asset-management/listing-management/metric-management/MetricDetail.vue')
        },
        {
          path: 'listing-management/metric-management/:id/edit',
          name: 'MetricEdit',
          meta: { title: '编辑指标' },
          component: () => import('../pages/management/asset-management/listing-management/metric-management/MetricDetail.vue'),
          props: true
        },
        {
          path: 'listing-management/metric-management/:id/:mode?',
          name: 'MetricDetail',
          meta: { title: '指标详情' },
          component: () => import('../pages/management/asset-management/listing-management/metric-management/MetricDetail.vue'),
          props: true
        },
        {
          path: 'listing-management/variable-management',
          name: 'VariableManagementDiscovery',
          meta: { title: '变量注册' },
          component: () => import('../pages/management/asset-management/listing-management/variable-management/index.vue')
        },
        {
          path: 'listing-management/variable-management/create/edit',
          name: 'VariableAssetCreate',
          meta: { title: '新建变量' },
          component: () => import('../pages/management/asset-management/listing-management/variable-management/VariableDetail.vue')
        },
        {
          path: 'listing-management/variable-management/:id/edit',
          name: 'VariableAssetEdit',
          meta: { title: '编辑变量' },
          component: () => import('../pages/management/asset-management/listing-management/variable-management/VariableDetail.vue'),
          props: true
        },
        {
          path: 'listing-management/variable-management/:id/:mode?',
          name: 'VariableAssetDetail',
          meta: { title: '变量详情' },
          component: () => import('../pages/management/asset-management/listing-management/variable-management/VariableDetail.vue'),
          props: true
        }
      ]
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
        }
      ]
    },
  ]
}]
