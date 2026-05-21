/**
 * touch 微应用注册配置
 * 本文件定义 touch 的菜单、路由等信息，供主应用 Shell 自动发现并加载
 */
import type { MicroAppRegistry } from '@/shared/registry/types'

const registry: MicroAppRegistry = {
  app: {
    name: 'touch',
    version: '1.0.0',
    description: '触达系统子应用（渠道管理、策略管理、触达查询、系统管理）'
  },
  basePath: '/touch',
  entry: 'http://localhost:5181',
  menu: [
    {
      key: 'touch-index',
      label: '触达首页',
      icon: 'icon-home',
      path: '/touch',
      order: 1
    },
    {
      key: 'touch-channel',
      label: '渠道管理',
      icon: 'icon-message',
      path: '/touch/channel/blacklist',
      order: 2,
      children: [
        { key: 'touch-channel-blacklist', label: '渠道黑名单', path: '/touch/channel/blacklist' },
        { key: 'touch-channel-manual-call', label: '人工外呼模板', path: '/touch/channel/manual-call-template' },
        { key: 'touch-channel-sms', label: '短信模板', path: '/touch/channel/sms-template' },
        { key: 'touch-channel-sms-create', label: '短信策略模板新建', path: '/touch/channel/sms-template/create' },
        { key: 'touch-channel-ai-call', label: 'AI外呼模板', path: '/touch/channel/ai-call-template' },
        { key: 'touch-channel-alert', label: '预警管理', path: '/touch/channel/alert' },
        { key: 'touch-channel-rate-limit', label: '全局频控', path: '/touch/channel/rate-limit' },
        { key: 'touch-channel-vendors', label: '供应商管理', path: '/touch/channel/vendors' },
        { key: 'touch-channel-vendors-ai', label: 'AI供应商', path: '/touch/channel/vendors/ai' },
        { key: 'touch-channel-vendors-sms', label: '短信供应商', path: '/touch/channel/vendors/sms' }
      ]
    },
    {
      key: 'touch-manual-sms',
      label: '手动短信',
      icon: 'icon-sms',
      path: '/touch/manual-sms',
      order: 3,
      children: [
        { key: 'touch-manual-sms-list', label: '手动短信列表', path: '/touch/manual-sms/list' }
      ]
    },
    {
      key: 'touch-policy',
      label: '策略管理',
      icon: 'icon-task',
      path: '/touch/policy/overview',
      order: 4,
      children: [
        { key: 'touch-policy-overview', label: '策略数据概览', path: '/touch/policy/overview' },
        { key: 'touch-policy-template', label: '策略模板', path: '/touch/policy/template' },
        { key: 'touch-policy-template-create', label: '新建策略模板', path: '/touch/policy/template/create' }
      ]
    },
    {
      key: 'touch-query',
      label: '触达查询',
      icon: 'icon-search',
      path: '/touch/query',
      order: 5,
      children: [
        { key: 'touch-query-detail', label: '触达查询明细', path: '/touch/query/detail' },
        { key: 'touch-query-sms-records', label: '短信发送记录', path: '/touch/query/sms-records' },
        { key: 'touch-query-ai-call-records', label: 'AI外呼记录', path: '/touch/query/ai-call-records' },
        { key: 'touch-query-ai-sms-vendor', label: 'AI厂商短信记录', path: '/touch/query/ai-sms-vendor-records' },
        { key: 'touch-query-manual-call-records', label: '人工外呼记录', path: '/touch/query/manual-call-records' },
        { key: 'touch-query-manual-sms-vendor', label: '人工厂商短信记录', path: '/touch/query/manual-sms-vendor-records' },
        { key: 'touch-query-marketing-search', label: '营销记录查询', path: '/touch/query/marketing-search' },
        { key: 'touch-query-marketing-list', label: '营销记录列表', path: '/touch/query/marketing-list' }
      ]
    },
    {
      key: 'touch-sms',
      label: '短信管理',
      icon: 'icon-sms',
      path: '/touch/sms',
      order: 6,
      children: [
        { key: 'touch-sms-create', label: '短信模板新建', path: '/touch/sms/create' }
      ]
    },
    {
      key: 'touch-ai-call',
      label: 'AI外呼',
      icon: 'icon-call',
      path: '/touch/ai-call',
      order: 7,
      children: [
        { key: 'touch-ai-call-create', label: 'AI外呼模板新建', path: '/touch/ai-call/create' }
      ]
    },
    {
      key: 'touch-system',
      label: '系统管理',
      icon: 'icon-settings',
      path: '/touch/system',
      order: 8,
      children: [
        { key: 'touch-system-dictionary', label: '字典管理', path: '/touch/system/dictionary' }
      ]
    }
  ],
  routes: [
    {
      path: '/',
      redirect: '/touch'
    },
    {
      path: 'index',
      name: 'TouchIndex',
      component: './pages/touch/index.vue',
      meta: { title: '触达首页' }
    },
    // 渠道管理
    {
      path: 'channel/blacklist',
      name: 'ChannelBlacklist',
      component: './pages/touch/channel/blacklist.vue',
      meta: { title: '渠道黑名单' }
    },
    {
      path: 'channel/manual-call-template',
      name: 'ChannelManualCallTemplate',
      component: './pages/touch/channel/manual-call-template.vue',
      meta: { title: '人工外呼模板' }
    },
    {
      path: 'channel/sms-template',
      name: 'ChannelSmsTemplate',
      component: './pages/touch/channel/sms-template.vue',
      meta: { title: '短信模板' }
    },
    {
      path: 'channel/sms-template/create',
      name: 'ChannelSmsTemplateCreate',
      component: './pages/touch/channel/sms-template-create.vue',
      meta: { title: '短信策略模板新建' }
    },
    {
      path: 'channel/ai-call-template',
      name: 'ChannelAiCallTemplate',
      component: './pages/touch/channel/ai-call-template.vue',
      meta: { title: 'AI外呼模板' }
    },
    {
      path: 'channel/alert',
      name: 'ChannelAlert',
      component: './pages/touch/channel/alert.vue',
      meta: { title: '预警管理' }
    },
    {
      path: 'channel/rate-limit',
      name: 'ChannelRateLimit',
      component: './pages/touch/channel/rate-limit.vue',
      meta: { title: '全局频控' }
    },
    {
      path: 'channel/vendors',
      name: 'ChannelVendorsIndex',
      component: './pages/touch/channel/vendors/index.vue',
      meta: { title: '供应商管理' }
    },
    {
      path: 'channel/vendors/ai',
      name: 'ChannelVendorsAi',
      component: './pages/touch/channel/vendors/ai.vue',
      meta: { title: 'AI供应商' }
    },
    {
      path: 'channel/vendors/sms',
      name: 'ChannelVendorsSms',
      component: './pages/touch/channel/vendors/sms.vue',
      meta: { title: '短信供应商' }
    },
    // 手动短信
    {
      path: 'manual-sms',
      name: 'ManualSMS',
      component: './pages/touch/manual-sms/index.vue',
      meta: { title: '手动短信' }
    },
    {
      path: 'manual-sms/list',
      name: 'ManualSMSList',
      component: './pages/touch/manual-sms/list.vue',
      meta: { title: '手动短信列表' }
    },
    // 策略管理
    {
      path: 'policy/template',
      name: 'PolicyTemplate',
      component: './pages/touch/policy/template/index.vue',
      meta: { title: '策略模板' }
    },
    {
      path: 'policy/template/create',
      name: 'PolicyTemplateCreate',
      component: './pages/touch/policy/template/create.vue',
      meta: { title: '新建策略模板' }
    },
    {
      path: 'policy/overview',
      name: 'PolicyOverview',
      component: './pages/touch/policy/overview.vue',
      meta: { title: '策略数据概览' }
    },
    // 触达查询
    {
      path: 'query',
      name: 'TouchQuery',
      component: './pages/touch/query/index.vue',
      meta: { title: '触达查询' }
    },
    {
      path: 'query/detail',
      name: 'QueryDetail',
      component: './pages/touch/query/detail.vue',
      meta: { title: '触达查询明细' }
    },
    {
      path: 'query/sms-records',
      name: 'QuerySmsRecords',
      component: './pages/touch/query/sms-records.vue',
      meta: { title: '短信发送记录' }
    },
    {
      path: 'query/ai-call-records',
      name: 'QueryAiCallRecords',
      component: './pages/touch/query/ai-call-records.vue',
      meta: { title: 'AI外呼记录' }
    },
    {
      path: 'query/ai-sms-vendor-records',
      name: 'QueryAiSmsVendorRecords',
      component: './pages/touch/query/ai-sms-vendor-records.vue',
      meta: { title: 'AI厂商短信记录' }
    },
    {
      path: 'query/manual-call-records',
      name: 'QueryManualCallRecords',
      component: './pages/touch/query/manual-call-records.vue',
      meta: { title: '人工外呼记录' }
    },
    {
      path: 'query/manual-sms-vendor-records',
      name: 'QueryManualSmsVendorRecords',
      component: './pages/touch/query/manual-sms-vendor-records.vue',
      meta: { title: '人工厂商短信记录' }
    },
    {
      path: 'query/marketing-search',
      name: 'QueryMarketingSearch',
      component: './pages/touch/query/marketing-search.vue',
      meta: { title: '营销记录查询' }
    },
    {
      path: 'query/marketing-list',
      name: 'QueryMarketingList',
      component: './pages/touch/query/marketing-list.vue',
      meta: { title: '营销记录列表' }
    },
    // 系统管理
    {
      path: 'system',
      name: 'TouchSystem',
      component: './pages/touch/system/index.vue',
      meta: { title: '系统管理' }
    },
    {
      path: 'system/dictionary',
      name: 'SystemDictionary',
      component: './pages/touch/system/dictionary.vue',
      meta: { title: '字典管理' }
    },
    // 短信管理
    {
      path: 'sms',
      name: 'SmsIndex',
      component: './pages/touch/sms/index.vue',
      meta: { title: '短信管理' }
    },
    {
      path: 'sms/create',
      name: 'SmsCreate',
      component: './pages/touch/sms/create.vue',
      meta: { title: '短信模板新建' }
    },
    // AI外呼
    {
      path: 'ai-call',
      name: 'AiCallIndex',
      component: './pages/touch/ai-call/index.vue',
      meta: { title: 'AI外呼模板' }
    },
    {
      path: 'ai-call/create',
      name: 'AiCallCreate',
      component: './pages/touch/ai-call/create.vue',
      meta: { title: 'AI外呼模板新建' }
    }
  ],
  lifecycle: {
    mount: () => {
      console.log('[touch] Mounted')
    },
    unmount: () => {
      console.log('[touch] Unmounted')
    }
  }
}

export default registry
