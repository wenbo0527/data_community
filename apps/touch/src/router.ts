import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useUserStore } from './store/user'

const TouchLayout = () => import('./components/layout/TouchLayout.vue')
const TouchIndex = () => import('./pages/touch/index.vue')
const ChannelBlacklist = () => import('./pages/touch/channel/blacklist.vue')
const ManualSMS = () => import('./pages/touch/manual-sms/index.vue')
const ManualSMSList = () => import('./pages/touch/manual-sms/list.vue')
const PolicyTemplate = () => import('./pages/touch/policy/template/index.vue')
const TouchQuery = () => import('./pages/touch/query/index.vue')
const SystemIndex = () => import('./pages/touch/system/index.vue')

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
        path: 'query',
        name: 'TouchQuery',
        component: TouchQuery,
        meta: { title: '触达查询' }
      },
      {
        path: 'system',
        name: 'TouchSystem',
        component: SystemIndex,
        meta: { title: '系统管理' }
      }
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
