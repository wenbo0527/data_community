/**
 * 触达系统路由模块
 * 路由前缀: /touch
 */
import type { RouteRecordRaw } from 'vue-router'

export const reachRoutes: RouteRecordRaw[] = [
  {
    path: '/touch',
    name: 'Touch',
    component: () => import('@/pages/touch/index.vue'),
    meta: { title: '触达系统' }
  },
  {
    path: '/touch/policy/overview',
    name: 'TouchPolicyOverview',
    component: () => import('@/pages/touch/policy/overview.vue'),
    meta: { title: '策略数据概览' }
  },
  {
    path: '/touch/query',
    name: 'TouchQuery',
    component: () => import('@/pages/touch/query/index.vue'),
    meta: { title: '触达查询' }
  },
  {
    path: '/touch/channel',
    name: 'TouchChannel',
    component: () => import('@/pages/touch/channel/index.vue'),
    meta: { title: '渠道管理' }
  },
  {
    path: '/touch/policy/template',
    name: 'TouchPolicyTemplate',
    component: () => import('@/pages/touch/policy/template/index.vue'),
    meta: { title: '策略模板' }
  },
  {
    path: '/touch/policy/template/create',
    name: 'TouchPolicyTemplateCreate',
    component: () => import('@/pages/touch/policy/template/create.vue'),
    meta: { title: '创建策略模板' }
  },
  {
    path: '/touch/query/ai-call-records',
    name: 'TouchQueryAiCallRecords',
    component: () => import('@/pages/touch/query/ai-call-records.vue'),
    meta: { title: 'AI呼叫记录' }
  },
  {
    path: '/touch/query/ai-sms-vendor-records',
    name: 'TouchQueryAiSmsVendorRecords',
    component: () => import('@/pages/touch/query/ai-sms-vendor-records.vue'),
    meta: { title: 'AI短信厂商记录' }
  },
  {
    path: '/touch/query/detail',
    name: 'TouchQueryDetail',
    component: () => import('@/pages/touch/query/detail.vue'),
    meta: { title: '触达详情' }
  },
  {
    path: '/touch/query/manual-call-records',
    name: 'TouchQueryManualCallRecords',
    component: () => import('@/pages/touch/query/manual-call-records.vue'),
    meta: { title: '人工呼叫记录' }
  },
  {
    path: '/touch/query/sms-records',
    name: 'TouchQuerySmsRecords',
    component: () => import('@/pages/touch/query/sms-records.vue'),
    meta: { title: '短信记录' }
  },
  {
    path: '/touch/channel/sms-template',
    name: 'TouchChannelSmsTemplate',
    component: () => import('@/pages/touch/channel/sms-template.vue'),
    meta: { title: '短信模板' }
  },
  {
    path: '/touch/channel/sms-template/create',
    name: 'TouchChannelSmsTemplateCreate',
    component: () => import('@/pages/touch/channel/sms-template-create.vue'),
    meta: { title: '创建短信模板' }
  },
  {
    path: '/touch/channel/ai-call-template',
    name: 'TouchChannelAiCallTemplate',
    component: () => import('@/pages/touch/channel/ai-call-template.vue'),
    meta: { title: 'AI外呼模板' }
  },
  {
    path: '/touch/channel/manual-call-template',
    name: 'TouchChannelManualCallTemplate',
    component: () => import('@/pages/touch/channel/manual-call-template.vue'),
    meta: { title: '人工电销模板' }
  },
  {
    path: '/touch/channel/vendors',
    name: 'TouchChannelVendors',
    component: () => import('@/pages/touch/channel/vendors/index.vue'),
    meta: { title: '厂商管理' }
  },
  {
    path: '/touch/channel/vendors/sms',
    name: 'TouchChannelVendorsSms',
    component: () => import('@/pages/touch/channel/vendors/sms.vue'),
    meta: { title: '短信厂商' }
  },
  {
    path: '/touch/channel/vendors/ai',
    name: 'TouchChannelVendorsAi',
    component: () => import('@/pages/touch/channel/vendors/ai.vue'),
    meta: { title: 'AI厂商' }
  },
  {
    path: '/touch/channel/blacklist',
    name: 'TouchChannelBlacklist',
    component: () => import('@/pages/touch/channel/blacklist.vue'),
    meta: { title: '黑名单管理' }
  },
  {
    path: '/touch/channel/alert',
    name: 'TouchChannelAlert',
    component: () => import('@/pages/touch/channel/alert.vue'),
    meta: { title: '渠道预警' }
  },
  {
    path: '/touch/channel/rate-limit',
    name: 'TouchChannelRateLimit',
    component: () => import('@/pages/touch/channel/rate-limit.vue'),
    meta: { title: '渠道限流' }
  },
  {
    path: '/touch/system',
    name: 'TouchSystem',
    component: () => import('@/pages/touch/system/index.vue'),
    meta: { title: '系统概览' }
  },
  {
    path: '/touch/system/dictionary',
    name: 'TouchSystemDictionary',
    component: () => import('@/pages/touch/system/dictionary.vue'),
    meta: { title: '系统词典' }
  },
  {
    path: '/touch/manual-sms',
    name: 'TouchManualSmsIndex',
    component: () => import('@/pages/touch/manual-sms/index.vue'),
    meta: { title: '手动短信' }
  }
]
