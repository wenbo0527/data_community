export default {
  path: '/marketing',
  name: 'marketing',
  redirect: '/marketing/coupon/template',
  children: [
    {
      path: 'coupon',
      name: 'coupon',
      children: [
        {
          path: 'template',
          name: 'couponTemplate',
          component: () => import('../pages/marketing/coupon/template/index.vue')
        },
        {
          path: 'create',
          name: 'couponCreate',
          component: () => import('../pages/marketing/coupon/template/create.vue')
        },
        {
          path: 'management',
          name: 'couponManagement',
          component: () => import('../pages/marketing/coupon/management/index.vue')
        },
        {
          path: 'package',
          name: 'couponPackage',
          component: () => import('../pages/marketing/coupon/package/index.vue')
        },
        {
          path: 'statistics',
          name: 'couponStatistics',
          component: () => import('../pages/marketing/coupon/statistics/index.vue')
        },
        {
          path: 'record',
          name: 'couponRecord',
          component: () => import('../pages/marketing/coupon/record/index.vue')
        },
        {
          path: 'rules',
          name: 'globalRules',
          component: () => import('../pages/marketing/coupon/rules/index.vue')
        },
        {
          path: 'inventory',
          name: 'couponInventory',
          component: () => import('../pages/marketing/coupon/inventory/index.vue')
        },
        {
          path: 'management/detail',
          name: 'couponManagementDetail',
          component: () => import('../pages/marketing/coupon/management/detail.vue')
        },
        {
          path: 'template/detail',
          name: 'couponTemplateDetail',
          component: () => import('../pages/marketing/coupon/template/detail.vue')
        }
      ]
    }
  ]
}