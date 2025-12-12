import { createRouter, createWebHistory } from 'vue-router'
// removed unused App.vue to avoid importing old horizontal modules

const TasksList = () => import('./pages/tasks/TasksList.vue')
const MarketingTasks = () => import('./pages/marketing/tasks/index.vue')
const MarketingHorizontal = () => import('./pages/marketing/tasks/horizontal/index.vue')

// 通知规则相关页面
const NotificationRules = () => import('./pages/marketing/alert/rules/index.vue')
const NotificationRuleCreate = () => import('./pages/marketing/alert/rules/create.vue')
const NotificationRuleEdit = () => import('./pages/marketing/alert/rules/edit.vue')
const NotificationTemplates = () => import('./pages/marketing/alert/templates/index.vue')

// DocRef: 架构文档「关键代码片段/路由定义」
export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/marketing/tasks' },
    { path: '/tasks', name: 'tasks-list', component: TasksList },
    { path: '/editor', name: 'editor', component: MarketingHorizontal },
    { path: '/marketing/tasks', name: 'marketing-tasks', component: MarketingTasks },
    { 
      path: '/marketing/tasks/horizontal', 
      name: 'marketing-horizontal', 
      component: MarketingHorizontal,
      beforeEnter: (to) => {
        if (!to.query || !to.query.id) {
          return { path: '/marketing/tasks' }
        }
        return true
      }
    },
    
    // 通知规则路由
    { 
      path: '/marketing/alert', 
      redirect: '/marketing/alert/rules',
      children: [
        { 
          path: 'rules', 
          name: 'notification-rules', 
          component: NotificationRules,
          meta: { title: '通知规则管理', breadcrumb: ['营销管理', '通知设置', '规则管理'] }
        },
        { 
          path: 'rules/create', 
          name: 'notification-rule-create', 
          component: NotificationRuleCreate,
          meta: { title: '创建通知规则', breadcrumb: ['营销管理', '通知设置', '规则管理', '创建规则'] }
        },
        { 
          path: 'rules/edit/:id', 
          name: 'notification-rule-edit', 
          component: NotificationRuleEdit,
          meta: { title: '编辑通知规则', breadcrumb: ['营销管理', '通知设置', '规则管理', '编辑规则'] }
        },
        { 
          path: 'templates', 
          name: 'notification-templates', 
          component: NotificationTemplates,
          meta: { title: '文案模板管理', breadcrumb: ['营销管理', '通知设置', '模板管理'] }
        }
      ]
    }
  ]
})
