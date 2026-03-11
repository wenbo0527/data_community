import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useUserStore } from './store/user'

const TouchLayout = () => import('./components/layout/TouchLayout.vue')
const TouchIndex = () => import('./pages/touch/index.vue')
const ChannelBlacklist = () => import('./pages/touch/channel/blacklist.vue')
const ChannelManualCallTemplate = () => import('./pages/touch/channel/manual-call-template.vue')
const ChannelSmsTemplate = () => import('./pages/touch/channel/sms-template.vue')
const ChannelSmsTemplateCreate = () => import('./pages/touch/channel/sms-template-create.vue')
const ChannelAiCallTemplate = () => import('./pages/touch/channel/ai-call-template.vue')
const ChannelAlert = () => import('./pages/touch/channel/alert.vue')
const ChannelRateLimit = () => import('./pages/touch/channel/rate-limit.vue')
const ChannelVendorsIndex = () => import('./pages/touch/channel/vendors/index.vue')
const ChannelVendorsAi = () => import('./pages/touch/channel/vendors/ai.vue')
const ChannelVendorsSms = () => import('./pages/touch/channel/vendors/sms.vue')
const ManualSMS = () => import('./pages/touch/manual-sms/index.vue')
const ManualSMSList = () => import('./pages/touch/manual-sms/list.vue')
const PolicyTemplate = () => import('./pages/touch/policy/template/index.vue')
const PolicyOverview = () => import('./pages/touch/policy/overview.vue')
const PolicyTemplateCreate = () => import('./pages/touch/policy/template/create.vue')
const TouchQuery = () => import('./pages/touch/query/index.vue')
const QueryDetail = () => import('./pages/touch/query/detail.vue')
const QuerySmsRecords = () => import('./pages/touch/query/sms-records.vue')
const QueryAiCallRecords = () => import('./pages/touch/query/ai-call-records.vue')
const QueryAiSmsVendorRecords = () => import('./pages/touch/query/ai-sms-vendor-records.vue')
const QueryManualCallRecords = () => import('./pages/touch/query/manual-call-records.vue')
const QueryManualSmsVendorRecords = () => import('./pages/touch/query/manual-sms-vendor-records.vue')
const QueryMarketingSearch = () => import('./pages/touch/query/marketing-search.vue')
const QueryMarketingList = () => import('./pages/touch/query/marketing-list.vue')
const SystemIndex = () => import('./pages/touch/system/index.vue')
const SystemDictionary = () => import('./pages/touch/system/dictionary.vue')

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/touch'
  },
  {
    path: '/touch',
    children: [
      {
        path: '',
        name: 'TouchIndex',
        component: TouchIndex,
        meta: { title: '触达首页' }
      },
      {
        path: 'channel/blacklist',
        name: 'ChannelBlacklist',
        component: ChannelBlacklist,
        meta: { title: '渠道黑名单' }
      },
      {
        path: 'channel/manual-call-template',
        name: 'ChannelManualCallTemplate',
        component: ChannelManualCallTemplate,
        meta: { title: '人工外呼模板' }
      },
      {
        path: 'channel/sms-template',
        name: 'ChannelSmsTemplate',
        component: ChannelSmsTemplate,
        meta: { title: '短信模板' }
      },
      {
        path: 'channel/sms-template/create',
        name: 'ChannelSmsTemplateCreate',
        component: ChannelSmsTemplateCreate,
        meta: { title: '短信策略模板新建' }
      },
      {
        path: 'channel/ai-call-template',
        name: 'ChannelAiCallTemplate',
        component: ChannelAiCallTemplate,
        meta: { title: 'AI外呼模板' }
      },
      {
        path: 'channel/alert',
        name: 'ChannelAlert',
        component: ChannelAlert,
        meta: { title: '预警管理' }
      },
      {
        path: 'channel/rate-limit',
        name: 'ChannelRateLimit',
        component: ChannelRateLimit,
        meta: { title: '全局频控' }
      },
      {
        path: 'channel/vendors',
        name: 'ChannelVendorsIndex',
        component: ChannelVendorsIndex,
        meta: { title: '供应商管理' }
      },
      {
        path: 'channel/vendors/ai',
        name: 'ChannelVendorsAi',
        component: ChannelVendorsAi,
        meta: { title: 'AI供应商' }
      },
      {
        path: 'channel/vendors/sms',
        name: 'ChannelVendorsSms',
        component: ChannelVendorsSms,
        meta: { title: '短信供应商' }
      },
      {
        path: 'manual-sms',
        name: 'ManualSMS',
        component: ManualSMS,
        meta: { title: '手动短信' }
      },
      {
        path: 'manual-sms/list',
        name: 'ManualSMSList',
        component: ManualSMSList,
        meta: { title: '手动短信列表' }
      },
      {
        path: 'policy/template',
        name: 'PolicyTemplate',
        component: PolicyTemplate,
        meta: { title: '策略模板' }
      },
      {
        path: 'policy/template/create',
        name: 'PolicyTemplateCreate',
        component: PolicyTemplateCreate,
        meta: { title: '新建策略模板' }
      },
      {
        path: 'policy/overview',
        name: 'PolicyOverview',
        component: PolicyOverview,
        meta: { title: '策略数据概览' }
      },
      {
        path: 'query',
        name: 'TouchQuery',
        component: TouchQuery,
        meta: { title: '触达查询' }
      },
      {
        path: 'query/detail',
        name: 'QueryDetail',
        component: QueryDetail,
        meta: { title: '触达查询明细' }
      },
      {
        path: 'query/sms-records',
        name: 'QuerySmsRecords',
        component: QuerySmsRecords,
        meta: { title: '短信发送记录' }
      },
      {
        path: 'query/ai-call-records',
        name: 'QueryAiCallRecords',
        component: QueryAiCallRecords,
        meta: { title: 'AI外呼记录' }
      },
      {
        path: 'query/ai-sms-vendor-records',
        name: 'QueryAiSmsVendorRecords',
        component: QueryAiSmsVendorRecords,
        meta: { title: 'AI厂商短信记录' }
      },
      {
        path: 'query/manual-call-records',
        name: 'QueryManualCallRecords',
        component: QueryManualCallRecords,
        meta: { title: '人工外呼记录' }
      },
      {
        path: 'query/manual-sms-vendor-records',
        name: 'QueryManualSmsVendorRecords',
        component: QueryManualSmsVendorRecords,
        meta: { title: '人工厂商短信记录' }
      },
      {
        path: 'query/marketing-search',
        name: 'QueryMarketingSearch',
        component: QueryMarketingSearch,
        meta: { title: '营销记录查询' }
      },
      {
        path: 'query/marketing-list',
        name: 'QueryMarketingList',
        component: QueryMarketingList,
        meta: { title: '营销记录列表' }
      },
      {
        path: 'system',
        name: 'TouchSystem',
        component: SystemIndex,
        meta: { title: '系统管理' }
      },
      {
        path: 'system/dictionary',
        name: 'SystemDictionary',
        component: SystemDictionary,
        meta: { title: '字典管理' }
      },
    ],
    component: TouchLayout
  }
]

export const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to) => {
  const user = useUserStore()
  if (!user.loggedIn && to.name !== 'TouchIndex') {
    return { path: '/touch' }
  }
  return true
})
